import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { Card } from '@/components/ui/card'
import { Separator } from '@/components/ui/separator'
import { DateRangePicker } from '@/components/DateRangePicker'
import { MagnifyingGlass, Users, Minus, Plus, X } from '@phosphor-icons/react'
import { format } from 'date-fns'
import { useApp } from '@/contexts/AppContext'
import { t } from '@/lib/translations'
import { api } from '@/lib/api'
import { City, Hotel } from '@/types'
import { apiClient } from '@/services/apiClient'

interface SearchWidgetProps {
  onSearch: () => void
  onResultsFound: (hotels: Hotel[]) => void
}

export function SearchWidget({ onSearch, onResultsFound }: SearchWidgetProps) {
  const { language, searchParams, setSearchParams } = useApp()
  const [cities, setCities] = useState<City[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState(false)

  useEffect(() => {
    api.getCities().then(setCities)
  }, [])

  const handleAdultsChange = (roomIndex: number, delta: number) => {
    const newRooms = [...searchParams.rooms]
    newRooms[roomIndex] = {
      ...newRooms[roomIndex],
      adults: Math.max(1, newRooms[roomIndex].adults + delta),
    }
    setSearchParams({
      ...searchParams,
      rooms: newRooms,
    })
  }

  const handleChildrenChange = (roomIndex: number, delta: number) => {
    const newRooms = [...searchParams.rooms]
    const currentChildren = newRooms[roomIndex].children
    if (delta > 0) {
      newRooms[roomIndex] = {
        ...newRooms[roomIndex],
        children: [...currentChildren, 5],
      }
    } else if (delta < 0 && currentChildren.length > 0) {
      newRooms[roomIndex] = {
        ...newRooms[roomIndex],
        children: currentChildren.slice(0, -1),
      }
    }
    setSearchParams({
      ...searchParams,
      rooms: newRooms,
    })
  }

  const handleChildAgeChange = (roomIndex: number, childIndex: number, age: number) => {
    const newRooms = [...searchParams.rooms]
    const newChildren = [...newRooms[roomIndex].children]
    newChildren[childIndex] = age
    newRooms[roomIndex] = {
      ...newRooms[roomIndex],
      children: newChildren,
    }
    setSearchParams({
      ...searchParams,
      rooms: newRooms,
    })
  }

  const handleAddRoom = () => {
    setSearchParams({
      ...searchParams,
      rooms: [...searchParams.rooms, { adults: 2, children: [] }],
    })
  }

  const handleRemoveRoom = (roomIndex: number) => {
    if (searchParams.rooms.length > 1) {
      const newRooms = searchParams.rooms.filter((_, index) => index !== roomIndex)
      setSearchParams({
        ...searchParams,
        rooms: newRooms,
      })
    }
  }

  const handleSearch = async () => {
    if (searchParams.searchMode === 'city' && !searchParams.cityId) {
      return
    }
    if (searchParams.searchMode === 'hotel' && (!searchParams.hotelName || searchParams.hotelName.trim() === '')) {
      return
    }
    setIsLoading(true)
    setError(false)
    try {
      const results = await apiClient.searchHotels({
        cityId: searchParams.cityId,
        hotelName: searchParams.hotelName,
        checkIn: searchParams.checkIn ? format(searchParams.checkIn, 'yyyy-MM-dd') : undefined,
        checkOut: searchParams.checkOut ? format(searchParams.checkOut, 'yyyy-MM-dd') : undefined,
      })
      onResultsFound(results)
      onSearch()
    } catch (err) {
      console.error('Error searching hotels:', err)
      setError(true)
    } finally {
      setIsLoading(false)
    }
  }

  const totalAdults = searchParams.rooms.reduce((sum, room) => sum + room.adults, 0)
  const totalChildren = searchParams.rooms.reduce((sum, room) => sum + room.children.length, 0)
  const guestsText = `${totalAdults} ${totalAdults > 1 ? 'adultes' : 'adulte'}${
    totalChildren > 0 ? `, ${totalChildren} ${totalChildren > 1 ? 'enfants' : 'enfant'}` : ''
  }, ${searchParams.rooms.length} ${searchParams.rooms.length > 1 ? 'chambres' : 'chambre'}`

  return (
    <Card className="p-6 shadow-xl bg-card/95 backdrop-blur">
      <div className="flex items-center gap-2 mb-6">
        <Button
          variant={searchParams.searchMode === 'city' ? 'default' : 'outline'}
          onClick={() => setSearchParams({ ...searchParams, searchMode: 'city', hotelName: undefined })}
          className="flex-1"
        >
          {t('search.searchByCity', language)}
        </Button>
        <Button
          variant={searchParams.searchMode === 'hotel' ? 'default' : 'outline'}
          onClick={() => setSearchParams({ ...searchParams, searchMode: 'hotel', cityId: undefined })}
          className="flex-1"
        >
          {t('search.searchByHotel', language)}
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {searchParams.searchMode === 'city' ? (
          <div className="space-y-2">
            <Label>{t('search.selectCity', language)}</Label>
            <Select
              value={searchParams.cityId}
              onValueChange={(value) => setSearchParams({ ...searchParams, cityId: value })}
            >
              <SelectTrigger>
                <SelectValue placeholder={t('search.selectCity', language)} />
              </SelectTrigger>
              <SelectContent>
                {cities.map((city) => (
                  <SelectItem key={city.id} value={city.id}>
                    {city.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        ) : (
          <div className="space-y-2">
            <Label>{t('search.hotelName', language)}</Label>
            <Input
              placeholder={t('search.hotelName', language)}
              value={searchParams.hotelName || ''}
              onChange={(e) => setSearchParams({ ...searchParams, hotelName: e.target.value })}
            />
          </div>
        )}

        <div className="space-y-2">
          <Label>Dates de séjour</Label>
          <DateRangePicker
            checkIn={searchParams.checkIn}
            checkOut={searchParams.checkOut}
            onCheckInChange={(date) => setSearchParams({ ...searchParams, checkIn: date })}
            onCheckOutChange={(date) => setSearchParams({ ...searchParams, checkOut: date })}
            language={language}
          />
        </div>

        <div className="space-y-2">
          <Label>{t('search.guests', language)}</Label>
          <Popover>
            <PopoverTrigger asChild>
              <Button variant="outline" className="w-full justify-start text-left font-normal">
                <Users className="mr-2 h-4 w-4" />
                {guestsText}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-96 max-h-[500px] overflow-y-auto" align="start">
              <div className="space-y-4">
                {searchParams.rooms.map((room, roomIndex) => (
                  <div key={roomIndex} className="space-y-4">
                    <div className="flex items-center justify-between">
                      <h4 className="font-semibold text-sm">
                        {t('search.room', language)} {roomIndex + 1}
                      </h4>
                      {searchParams.rooms.length > 1 && (
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleRemoveRoom(roomIndex)}
                          className="h-8 text-destructive hover:text-destructive"
                        >
                          <X size={16} className="mr-1" />
                          {t('search.removeRoom', language)}
                        </Button>
                      )}
                    </div>

                    <div className="flex items-center justify-between">
                      <div>
                        <div className="font-medium text-sm">{t('search.adults', language)}</div>
                        <div className="text-xs text-muted-foreground">13 ans et plus</div>
                      </div>
                      <div className="flex items-center gap-3">
                        <Button
                          variant="outline"
                          size="icon"
                          className="h-8 w-8"
                          onClick={() => handleAdultsChange(roomIndex, -1)}
                          disabled={room.adults <= 1}
                        >
                          <Minus size={16} />
                        </Button>
                        <span className="w-8 text-center font-medium">{room.adults}</span>
                        <Button
                          variant="outline"
                          size="icon"
                          className="h-8 w-8"
                          onClick={() => handleAdultsChange(roomIndex, 1)}
                        >
                          <Plus size={16} />
                        </Button>
                      </div>
                    </div>

                    <div className="flex items-center justify-between">
                      <div>
                        <div className="font-medium text-sm">{t('search.children', language)}</div>
                        <div className="text-xs text-muted-foreground">0-12 ans</div>
                      </div>
                      <div className="flex items-center gap-3">
                        <Button
                          variant="outline"
                          size="icon"
                          className="h-8 w-8"
                          onClick={() => handleChildrenChange(roomIndex, -1)}
                          disabled={room.children.length === 0}
                        >
                          <Minus size={16} />
                        </Button>
                        <span className="w-8 text-center font-medium">{room.children.length}</span>
                        <Button
                          variant="outline"
                          size="icon"
                          className="h-8 w-8"
                          onClick={() => handleChildrenChange(roomIndex, 1)}
                        >
                          <Plus size={16} />
                        </Button>
                      </div>
                    </div>

                    {room.children.length > 0 && (
                      <div className="space-y-2 pl-4 border-l-2 border-muted">
                        <p className="text-xs text-muted-foreground font-medium">
                          {t('search.childAge', language)}
                        </p>
                        <div className="grid grid-cols-2 gap-2">
                          {room.children.map((age, childIndex) => (
                            <Select
                              key={childIndex}
                              value={age.toString()}
                              onValueChange={(value) =>
                                handleChildAgeChange(roomIndex, childIndex, parseInt(value))
                              }
                            >
                              <SelectTrigger className="h-9">
                                <SelectValue placeholder="Âge" />
                              </SelectTrigger>
                              <SelectContent>
                                {Array.from({ length: 13 }, (_, i) => i).map((ageOption) => (
                                  <SelectItem key={ageOption} value={ageOption.toString()}>
                                    {ageOption} {ageOption <= 1 ? 'an' : 'ans'}
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                          ))}
                        </div>
                      </div>
                    )}

                    {roomIndex < searchParams.rooms.length - 1 && (
                      <Separator className="my-2" />
                    )}
                  </div>
                ))}

                <Button
                  variant="outline"
                  className="w-full"
                  onClick={handleAddRoom}
                >
                  <Plus size={16} className="mr-2" />
                  {t('search.addRoom', language)}
                </Button>
              </div>
            </PopoverContent>
          </Popover>
        </div>
      </div>

      <Button size="lg" className="w-full mt-6" onClick={handleSearch} disabled={isLoading}>
        {isLoading ? (
          <>
            <span className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin mr-2" />
            {t('common.loading', language)}
          </>
        ) : (
          <>
            <MagnifyingGlass size={20} className="mr-2" />
            {t('search.searchHotels', language)}
          </>
        )}
      </Button>
      {error && <p className="mt-3 text-sm text-destructive">{t('search.errorMessage', language)}</p>}
    </Card>
  )
}

export function Hero({ onSearch, onResultsFound }: { onSearch: () => void; onResultsFound: (hotels: Hotel[]) => void }) {
  const { language } = useApp()

  return (
    <section className="relative min-h-[600px] flex items-center justify-center hero-pattern">
      <div className="absolute inset-0 bg-gradient-to-b from-transparent to-background/20" />
      
      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full py-12">
        <div className="text-center mb-8">
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-primary-foreground mb-4 tracking-tight drop-shadow-lg">
            {t('hero.title', language)}
          </h1>
          <p className="text-xl text-primary-foreground/95 max-w-2xl mx-auto drop-shadow-md">
            {t('hero.subtitle', language)}
          </p>
        </div>

        <div className="max-w-5xl mx-auto">
          <SearchWidget onSearch={onSearch} onResultsFound={onResultsFound} />
        </div>
      </div>
    </section>
  )
}
