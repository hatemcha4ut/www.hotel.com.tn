import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group'
import { Label } from '@/components/ui/label'
import { Checkbox } from '@/components/ui/checkbox'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Calendar as CalendarComponent } from '@/components/ui/calendar'
import {
  ArrowLeft,
  Star,
  MapPin,
  WifiHigh,
  Drop,
  Barbell,
  ForkKnife,
  Car,
  Users,
  Calendar,
  Bed,
  MagnifyingGlass,
} from '@phosphor-icons/react'
import { api } from '@/lib/api'
import { Hotel, Room } from '@/types'
import { useApp } from '@/contexts/AppContext'
import { format, addDays } from 'date-fns'
import { fr } from 'date-fns/locale'
import { toast } from 'sonner'

interface HotelDetailsPageProps {
  hotelId: string
  onBack: () => void
  onBookRoom: (room: Room) => void
  onBookRooms?: (rooms: Room[]) => void
  onNewSearch?: () => void
}

export function HotelDetailsPage({ hotelId, onBack, onBookRoom, onBookRooms, onNewSearch }: HotelDetailsPageProps) {
  const { searchParams, setSearchParams, searchResults } = useApp()
  const [hotel, setHotel] = useState<Hotel | null>(null)
  const [rooms, setRooms] = useState<Room[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedImage, setSelectedImage] = useState<string>('')
  const [selectedBoardings, setSelectedBoardings] = useState<Record<string, string>>({})
  const [selectedRoomsForBooking, setSelectedRoomsForBooking] = useState<Set<string>>(new Set())
  const [showDateDialog, setShowDateDialog] = useState(false)
  const [selectedRoomForBooking, setSelectedRoomForBooking] = useState<Room | null>(null)
  const [tempCheckIn, setTempCheckIn] = useState<Date | undefined>(undefined)
  const [tempCheckOut, setTempCheckOut] = useState<Date | undefined>(undefined)
  const [applySameBoardingToAll, setApplySameBoardingToAll] = useState(false)
  const [globalBoardingType, setGlobalBoardingType] = useState<string>('')
  const multiRoomMode = searchParams.rooms.length > 1

  useEffect(() => {
    const loadHotelDetails = async () => {
      setLoading(true)
      try {
        // First try to get hotel from search results in context
        const hotelFromSearch = searchResults?.hotels?.find(h => h.id === hotelId)
        
        // Load hotel details from API (always fetch for complete data)
        const hotelData = await api.getHotelDetails(hotelId)
        if (hotelData) {
          setHotel(hotelData)
          setSelectedImage(hotelData.image)
        } else if (hotelFromSearch) {
          // Fallback to search result if API fails
          setHotel(hotelFromSearch)
          setSelectedImage(hotelFromSearch.image)
        }
        
        // Try to get rooms from multiple sources:
        // 1. From search results context (if available and has rooms)
        // 2. From inventory API
        // 3. Empty array if both fail (will show empty state in UI)
        let roomsData: Room[] = []
        
        if (hotelFromSearch?.rooms && hotelFromSearch.rooms.length > 0) {
          console.log('Using rooms from search results context')
          roomsData = hotelFromSearch.rooms
        } else {
          try {
            console.log('Fetching rooms from inventory API')
            roomsData = await api.getAvailableRooms(hotelId, searchParams.rooms.length)
          } catch (error) {
            console.warn('Failed to load rooms from inventory API:', error)
            // If API fails and we have no rooms, show empty state
            roomsData = []
          }
        }
        
        setRooms(roomsData)
        
        const initialBoardings: Record<string, string> = {}
        roomsData.forEach(room => {
          if (room.boardingOptions && room.boardingOptions.length > 0) {
            const logementSeulOption = room.boardingOptions.find(opt => opt.type === 'Logement seul')
            initialBoardings[room.id] = logementSeulOption ? logementSeulOption.type : room.boardingOptions[0].type
          } else {
            initialBoardings[room.id] = room.boardingType || 'Logement seul'
          }
        })
        setSelectedBoardings(initialBoardings)
        
        const allSameBoardingType = Object.values(initialBoardings).every(
          (boarding, _, arr) => boarding === arr[0]
        )
        setApplySameBoardingToAll(allSameBoardingType && roomsData.length > 1)
        
        if (allSameBoardingType && roomsData.length > 0) {
          setGlobalBoardingType(initialBoardings[roomsData[0].id])
        }
      } catch (error) {
        console.error('Error loading hotel details:', error)
        toast.error('Erreur lors du chargement des détails')
      } finally {
        setLoading(false)
      }
    }
    loadHotelDetails()
  }, [hotelId, searchParams.rooms.length, searchResults])

  const handleBoardingChange = (roomId: string, boardingType: string) => {
    if (applySameBoardingToAll) {
      const newBoardings: Record<string, string> = {}
      rooms.forEach(room => {
        if (room.boardingOptions?.some(opt => opt.type === boardingType)) {
          newBoardings[room.id] = boardingType
        } else {
          newBoardings[room.id] = selectedBoardings[room.id]
        }
      })
      setSelectedBoardings(newBoardings)
      setGlobalBoardingType(boardingType)
      
      setSelectedRoomsForBooking(new Set(rooms.map(room => room.id)))
    } else {
      setSelectedBoardings(prev => ({ ...prev, [roomId]: boardingType }))
      
      const newSelectedRooms = new Set(selectedRoomsForBooking)
      if (!newSelectedRooms.has(roomId)) {
        newSelectedRooms.add(roomId)
      }
      setSelectedRoomsForBooking(newSelectedRooms)
    }
  }
  
  const handleToggleApplySameToAll = (checked: boolean) => {
    setApplySameBoardingToAll(checked)
    if (checked && rooms.length > 0) {
      const firstRoomBoarding = selectedBoardings[rooms[0].id]
      if (firstRoomBoarding) {
        const newBoardings: Record<string, string> = {}
        rooms.forEach(room => {
          if (room.boardingOptions?.some(opt => opt.type === firstRoomBoarding)) {
            newBoardings[room.id] = firstRoomBoarding
          } else {
            newBoardings[room.id] = selectedBoardings[room.id]
          }
        })
        setSelectedBoardings(newBoardings)
        setGlobalBoardingType(firstRoomBoarding)
        
        setSelectedRoomsForBooking(new Set(rooms.map(room => room.id)))
      }
    }
  }
  
  const handleToggleRoomSelection = (roomId: string) => {
    setSelectedRoomsForBooking(prev => {
      const newSet = new Set(prev)
      if (newSet.has(roomId)) {
        newSet.delete(roomId)
      } else {
        if (newSet.size < searchParams.rooms.length) {
          newSet.add(roomId)
        } else {
          toast.error(`Vous ne pouvez sélectionner que ${searchParams.rooms.length} chambre(s)`)
        }
      }
      return newSet
    })
  }
  
  const handleBookSelectedRooms = () => {
    if (selectedRoomsForBooking.size === 0) {
      toast.error('Veuillez sélectionner au moins une chambre')
      return
    }
    
    if (selectedRoomsForBooking.size !== searchParams.rooms.length) {
      toast.error(`Veuillez sélectionner ${searchParams.rooms.length} chambre(s)`)
      return
    }
    
    const selectedRoomsList = rooms
      .filter(room => selectedRoomsForBooking.has(room.id))
      .map((room, idx) => {
        const selectedBoarding = selectedBoardings[room.id]
        const boardingOption = room.boardingOptions?.find(b => b.type === selectedBoarding)
        
        return {
          ...room,
          roomIndex: idx,
          selectedBoarding,
          boardingType: selectedBoarding,
          pricePerNight: boardingOption?.pricePerNight || room.pricePerNight,
          totalPrice: boardingOption?.totalPrice || room.totalPrice,
        }
      })
    
    if (!searchParams.checkIn || !searchParams.checkOut) {
      setTempCheckIn(addDays(new Date(), 1))
      setTempCheckOut(addDays(new Date(), 2))
      setShowDateDialog(true)
    } else if (onBookRooms) {
      onBookRooms(selectedRoomsList)
    }
  }

  const handleSelectRoom = (room: Room) => {
    const selectedBoarding = selectedBoardings[room.id]
    const boardingOption = room.boardingOptions?.find(b => b.type === selectedBoarding)
    
    const roomWithBoarding = {
      ...room,
      selectedBoarding,
      boardingType: selectedBoarding,
      pricePerNight: boardingOption?.pricePerNight || room.pricePerNight,
      totalPrice: boardingOption?.totalPrice || room.totalPrice,
    }
    
    if (!searchParams.checkIn || !searchParams.checkOut) {
      setSelectedRoomForBooking(roomWithBoarding)
      setTempCheckIn(addDays(new Date(), 1))
      setTempCheckOut(addDays(new Date(), 2))
      setShowDateDialog(true)
    } else {
      onBookRoom(roomWithBoarding)
    }
  }

  const handleConfirmDates = () => {
    if (!tempCheckIn || !tempCheckOut) {
      toast.error('Veuillez sélectionner les dates d\'arrivée et de départ')
      return
    }
    
    if (tempCheckOut <= tempCheckIn) {
      toast.error('La date de départ doit être après la date d\'arrivée')
      return
    }

    setSearchParams({
      ...searchParams,
      checkIn: tempCheckIn,
      checkOut: tempCheckOut,
    })
    
    setShowDateDialog(false)
    
    if (selectedRoomForBooking) {
      onBookRoom(selectedRoomForBooking)
    } else if (selectedRoomsForBooking.size > 0 && onBookRooms) {
      const selectedRoomsList = rooms
        .filter(room => selectedRoomsForBooking.has(room.id))
        .map((room, idx) => {
          const selectedBoarding = selectedBoardings[room.id]
          const boardingOption = room.boardingOptions?.find(b => b.type === selectedBoarding)
          
          return {
            ...room,
            roomIndex: idx,
            selectedBoarding,
            boardingType: selectedBoarding,
            pricePerNight: boardingOption?.pricePerNight || room.pricePerNight,
            totalPrice: boardingOption?.totalPrice || room.totalPrice,
          }
        })
      onBookRooms(selectedRoomsList)
    }
  }

  if (loading || !hotel) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-muted-foreground">Chargement...</p>
        </div>
      </div>
    )
  }

  const amenityIcons: Record<string, any> = {
    WiFi: WifiHigh,
    Piscine: Drop,
    'Salle de sport': Barbell,
    Restaurant: ForkKnife,
    Parking: Car,
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="bg-muted/30 py-4 border-b border-border">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center gap-2">
            <Button variant="ghost" onClick={onBack}>
              <ArrowLeft size={18} className="mr-2" />
              Retour aux résultats
            </Button>
            {onNewSearch && (
              <Button variant="outline" onClick={onNewSearch}>
                <MagnifyingGlass size={18} className="mr-2" />
                Nouvelle recherche
              </Button>
            )}
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-8">
            <div className="grid grid-cols-4 gap-2">
              <div className="col-span-4 h-96 rounded-lg overflow-hidden">
                <img
                  src={selectedImage}
                  alt={hotel.name}
                  className="w-full h-full object-cover"
                />
              </div>
              {hotel.images.slice(0, 4).map((img, idx) => (
                <div
                  key={idx}
                  className="h-24 rounded-lg overflow-hidden cursor-pointer hover:opacity-75 transition-opacity"
                  onClick={() => setSelectedImage(img)}
                >
                  <img src={img} alt="" className="w-full h-full object-cover" />
                </div>
              ))}
            </div>

            <div>
              <div className="flex items-start justify-between mb-4">
                <div>
                  <div className="flex items-center gap-2 mb-2">
                    <h1 className="text-3xl font-bold">{hotel.name}</h1>
                    <Badge className="bg-accent text-accent-foreground">
                      <Star size={14} weight="fill" className="mr-1" />
                      {hotel.stars} étoiles
                    </Badge>
                  </div>
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <MapPin size={16} weight="fill" />
                    <span>{hotel.address}</span>
                  </div>
                  <div className="flex items-center gap-2 mt-2">
                    <div className="flex items-center gap-1">
                      {Array.from({ length: 5 }).map((_, i) => (
                        <Star
                          key={i}
                          size={16}
                          weight={i < Math.floor(hotel.rating) ? 'fill' : 'regular'}
                          className="text-accent"
                        />
                      ))}
                    </div>
                    <span className="font-medium">{hotel.rating}</span>
                    <span className="text-sm text-muted-foreground">
                      ({hotel.reviewCount} avis)
                    </span>
                  </div>
                </div>
              </div>

              <p className="text-muted-foreground leading-relaxed">{hotel.description}</p>
            </div>

            <div>
              <h2 className="text-2xl font-bold mb-4">Équipements</h2>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                {hotel.amenities.map((amenity, idx) => {
                  const Icon = amenityIcons[amenity] || Users
                  return (
                    <div key={idx} className="flex items-center gap-3 p-3 bg-muted rounded-lg">
                      <Icon size={20} className="text-primary" />
                      <span className="text-sm">{amenity}</span>
                    </div>
                  )
                })}
              </div>
            </div>

            <Separator />

            <div>
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold">Chambres disponibles</h2>
                {multiRoomMode && (
                  <Badge variant="secondary" className="text-sm">
                    Sélectionnez {searchParams.rooms.length} chambre{searchParams.rooms.length > 1 ? 's' : ''}
                  </Badge>
                )}
              </div>
              
              {rooms.length === 0 && !loading && (
                <Card className="border-2 border-dashed border-border">
                  <CardContent className="p-8 text-center">
                    <p className="text-muted-foreground">
                      Aucune chambre disponible pour cet hôtel.
                    </p>
                  </CardContent>
                </Card>
              )}
              
              {rooms.length > 0 && multiRoomMode && (
                <Card className="mb-4 bg-muted/30 border-primary/20">
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between gap-4">
                      <div className="flex items-center gap-3">
                        <Checkbox
                          id="apply-same-boarding"
                          checked={applySameBoardingToAll}
                          onCheckedChange={handleToggleApplySameToAll}
                        />
                        <Label htmlFor="apply-same-boarding" className="cursor-pointer font-medium">
                          Appliquer la même pension à toutes les chambres
                        </Label>
                      </div>
                      {applySameBoardingToAll && globalBoardingType && (
                        <Badge variant="outline" className="ml-auto">
                          {globalBoardingType}
                        </Badge>
                      )}
                    </div>
                  </CardContent>
                </Card>
              )}
              
              {rooms.length > 0 && multiRoomMode && selectedRoomsForBooking.size > 0 && (
                <Card className="mb-4 border-2 border-primary">
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <div className="font-semibold">
                          {selectedRoomsForBooking.size} / {searchParams.rooms.length} chambre{searchParams.rooms.length > 1 ? 's' : ''} sélectionnée{selectedRoomsForBooking.size > 1 ? 's' : ''}
                        </div>
                        <div className="text-sm text-muted-foreground">
                          Sélectionnez toutes les chambres pour continuer
                        </div>
                      </div>
                      <Button 
                        onClick={handleBookSelectedRooms}
                        disabled={selectedRoomsForBooking.size !== searchParams.rooms.length}
                        size="lg"
                      >
                        Réserver les chambres
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              )}
              
              {rooms.length > 0 && multiRoomMode ? (
                <div className="space-y-4">
                  {rooms.map((room, roomIdx) => {
                    const selectedBoarding = selectedBoardings[room.id] || room.boardingType
                    const currentBoardingOption = room.boardingOptions?.find(
                      b => b.type === selectedBoarding
                    )
                    const displayPrice = currentBoardingOption?.pricePerNight || room.pricePerNight
                    const displayTotal = currentBoardingOption?.totalPrice || room.totalPrice
                    const isSelected = selectedRoomsForBooking.has(room.id)

                    return (
                      <Card key={room.id} className={isSelected ? 'border-2 border-primary' : ''}>
                        <CardContent className="p-6">
                          <div className="flex flex-col md:flex-row gap-6">
                            <div className="w-full md:w-48 h-32 rounded-lg overflow-hidden flex-shrink-0">
                              <img
                                src={room.image}
                                alt={room.name}
                                className="w-full h-full object-cover"
                              />
                            </div>
                            
                            <div className="flex-1">
                              <div className="flex items-center justify-between mb-2">
                                <h3 className="text-xl font-semibold">{room.name}</h3>
                                {isSelected && (
                                  <Badge variant="default" className="text-sm">
                                    Sélectionnée
                                  </Badge>
                                )}
                              </div>
                              
                              <div className="grid grid-cols-2 gap-3 text-sm text-muted-foreground mb-4">
                                <div className="flex items-center gap-2">
                                  <Bed size={16} />
                                  <span>{room.bedConfig}</span>
                                </div>
                                <div className="flex items-center gap-2">
                                  <Users size={16} />
                                  <span>Max {room.maxOccupancy} personnes</span>
                                </div>
                              </div>

                              <div className="flex flex-wrap gap-2 mb-4">
                                {room.amenities.slice(0, 4).map((amenity, idx) => (
                                  <Badge key={idx} variant="secondary">
                                    {amenity}
                                  </Badge>
                                ))}
                              </div>

                              {room.boardingOptions && room.boardingOptions.length > 1 && (
                                <div className="mb-4">
                                  <Label className="text-sm font-semibold mb-3 block">
                                    Type de pension
                                  </Label>
                                  <RadioGroup
                                    value={selectedBoarding}
                                    onValueChange={(value) => handleBoardingChange(room.id, value)}
                                    className="space-y-2"
                                  >
                                    {room.boardingOptions.map((option) => (
                                      <div
                                        key={option.type}
                                        className="flex items-center space-x-3 p-3 rounded-lg border border-border hover:bg-muted/50 transition-colors"
                                      >
                                        <RadioGroupItem 
                                          value={option.type} 
                                          id={`${room.id}-${option.type}`}
                                        />
                                        <Label
                                          htmlFor={`${room.id}-${option.type}`}
                                          className="flex-1 flex items-center justify-between cursor-pointer"
                                        >
                                          <span className="font-medium">{option.type}</span>
                                          <span className="text-sm text-primary font-semibold">
                                            {option.pricePerNight} TND/nuit
                                          </span>
                                        </Label>
                                      </div>
                                    ))}
                                  </RadioGroup>
                                </div>
                              )}

                              {(!room.boardingOptions || room.boardingOptions.length <= 1) && (
                                <div className="mb-4">
                                  <Badge variant="outline" className="text-sm">
                                    {room.boardingType}
                                  </Badge>
                                </div>
                              )}

                              <p className="text-xs text-muted-foreground mb-4">
                                {room.cancellationPolicy}
                              </p>

                              <div className="flex items-center justify-between">
                                <div>
                                  <div className="text-sm text-muted-foreground">À partir de</div>
                                  <div className="text-2xl font-bold text-primary">
                                    {displayPrice} TND
                                    <span className="text-sm font-normal text-muted-foreground">
                                      {' '}/nuit
                                    </span>
                                  </div>
                                  {searchParams.checkIn && searchParams.checkOut && (
                                    <div className="text-sm text-muted-foreground">
                                      Total: {displayTotal} TND
                                    </div>
                                  )}
                                </div>
                                <Button 
                                  variant={isSelected ? 'default' : 'outline'}
                                  onClick={() => handleToggleRoomSelection(room.id)}
                                  size="lg"
                                  disabled={!isSelected && selectedRoomsForBooking.size >= searchParams.rooms.length}
                                >
                                  {isSelected ? 'Sélectionnée' : 'Sélectionner'}
                                </Button>
                              </div>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    )
                  })}
                </div>
              ) : (
                <div className="space-y-4">
                  {rooms.map((room) => {
                    const selectedBoarding = selectedBoardings[room.id] || room.boardingType
                    const currentBoardingOption = room.boardingOptions?.find(
                      b => b.type === selectedBoarding
                    )
                    const displayPrice = currentBoardingOption?.pricePerNight || room.pricePerNight
                    const displayTotal = currentBoardingOption?.totalPrice || room.totalPrice

                    return (
                      <Card key={room.id}>
                        <CardContent className="p-6">
                          <div className="flex flex-col md:flex-row gap-6">
                            <div className="w-full md:w-48 h-32 rounded-lg overflow-hidden flex-shrink-0">
                              <img
                                src={room.image}
                                alt={room.name}
                                className="w-full h-full object-cover"
                              />
                            </div>
                            
                            <div className="flex-1">
                              <h3 className="text-xl font-semibold mb-2">{room.name}</h3>
                              
                              <div className="grid grid-cols-2 gap-3 text-sm text-muted-foreground mb-4">
                                <div className="flex items-center gap-2">
                                  <Bed size={16} />
                                  <span>{room.bedConfig}</span>
                                </div>
                                <div className="flex items-center gap-2">
                                  <Users size={16} />
                                  <span>Max {room.maxOccupancy} personnes</span>
                                </div>
                              </div>

                              <div className="flex flex-wrap gap-2 mb-4">
                                {room.amenities.slice(0, 4).map((amenity, idx) => (
                                  <Badge key={idx} variant="secondary">
                                    {amenity}
                                  </Badge>
                                ))}
                              </div>

                              {room.boardingOptions && room.boardingOptions.length > 1 && (
                                <div className="mb-4">
                                  <Label className="text-sm font-semibold mb-3 block">
                                    Type de pension
                                  </Label>
                                  <RadioGroup
                                    value={selectedBoarding}
                                    onValueChange={(value) => handleBoardingChange(room.id, value)}
                                    className="space-y-2"
                                  >
                                    {room.boardingOptions.map((option) => (
                                      <div
                                        key={option.type}
                                        className="flex items-center space-x-3 p-3 rounded-lg border border-border hover:bg-muted/50 transition-colors"
                                      >
                                        <RadioGroupItem value={option.type} id={`${room.id}-${option.type}`} />
                                        <Label
                                          htmlFor={`${room.id}-${option.type}`}
                                          className="flex-1 flex items-center justify-between cursor-pointer"
                                        >
                                          <span className="font-medium">{option.type}</span>
                                          <span className="text-sm text-primary font-semibold">
                                            {option.pricePerNight} TND/nuit
                                          </span>
                                        </Label>
                                      </div>
                                    ))}
                                  </RadioGroup>
                                </div>
                              )}

                              {(!room.boardingOptions || room.boardingOptions.length <= 1) && (
                                <div className="mb-4">
                                  <Badge variant="outline" className="text-sm">
                                    {room.boardingType}
                                  </Badge>
                                </div>
                              )}

                              <p className="text-xs text-muted-foreground mb-4">
                                {room.cancellationPolicy}
                              </p>

                              <div className="flex items-center justify-between">
                                <div>
                                  <div className="text-sm text-muted-foreground">À partir de</div>
                                  <div className="text-2xl font-bold text-primary">
                                    {displayPrice} TND
                                    <span className="text-sm font-normal text-muted-foreground">
                                      {' '}/nuit
                                    </span>
                                  </div>
                                  {searchParams.checkIn && searchParams.checkOut && (
                                    <div className="text-sm text-muted-foreground">
                                      Total: {displayTotal} TND
                                    </div>
                                  )}
                                </div>
                                <Button onClick={() => handleSelectRoom(room)}>
                                  Sélectionner
                                </Button>
                              </div>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    )
                  })}
                </div>
              )}
            </div>
          </div>

          <div className="lg:col-span-1">
            <Card className="sticky top-20">
              <CardContent className="p-6">
                <h3 className="text-lg font-semibold mb-4">Résumé de votre recherche</h3>
                
                {searchParams.checkIn && searchParams.checkOut ? (
                  <div className="space-y-3 text-sm">
                    <div className="flex items-center gap-2">
                      <Calendar size={16} className="text-muted-foreground" />
                      <div>
                        <div className="font-medium">Arrivée</div>
                        <div className="text-muted-foreground">
                          {format(searchParams.checkIn, 'dd MMMM yyyy', { locale: fr })}
                        </div>
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-2">
                      <Calendar size={16} className="text-muted-foreground" />
                      <div>
                        <div className="font-medium">Départ</div>
                        <div className="text-muted-foreground">
                          {format(searchParams.checkOut, 'dd MMMM yyyy', { locale: fr })}
                        </div>
                      </div>
                    </div>
                    
                    <Separator />
                    
                    <div className="flex items-center gap-2">
                      <Users size={16} className="text-muted-foreground" />
                      <div>
                        <div className="font-medium">Hôtes</div>
                        <div className="text-muted-foreground">
                          {searchParams.rooms.reduce((sum, room) => sum + room.adults, 0)} adulte{searchParams.rooms.reduce((sum, room) => sum + room.adults, 0) > 1 ? 's' : ''}
                          {searchParams.rooms.reduce((sum, room) => sum + room.children.length, 0) > 0 &&
                            `, ${searchParams.rooms.reduce((sum, room) => sum + room.children.length, 0)} enfant${searchParams.rooms.reduce((sum, room) => sum + room.children.length, 0) > 1 ? 's' : ''}`}
                          {searchParams.rooms.length > 1 && `, ${searchParams.rooms.length} chambres`}
                        </div>
                      </div>
                    </div>
                  </div>
                ) : (
                  <p className="text-sm text-muted-foreground">
                    Sélectionnez vos dates pour voir les disponibilités
                  </p>
                )}

                <Separator className="my-6" />

                <div className="text-center">
                  <div className="text-sm text-muted-foreground mb-1">À partir de</div>
                  <div className="text-3xl font-bold text-primary mb-4">
                    {hotel.price} TND
                  </div>
                  <Button className="w-full" size="lg" onClick={onBack}>
                    Modifier la recherche
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>

      <Dialog open={showDateDialog} onOpenChange={setShowDateDialog}>
        <DialogContent className="max-w-[95vw] sm:max-w-md max-h-[90vh] overflow-y-auto p-4 sm:p-6">
          <DialogHeader className="space-y-2">
            <DialogTitle className="text-base sm:text-lg">Sélectionnez vos dates de séjour</DialogTitle>
            <DialogDescription className="text-xs sm:text-sm">
              Choisissez vos dates d'arrivée et de départ pour finaliser votre réservation
            </DialogDescription>
          </DialogHeader>
          
          <Tabs defaultValue="checkin" className="w-full">
            <TabsList className="grid w-full grid-cols-2 h-9 sm:h-10">
              <TabsTrigger value="checkin" className="text-xs sm:text-sm px-2">
                Date d'arrivée
              </TabsTrigger>
              <TabsTrigger value="checkout" className="text-xs sm:text-sm px-2" disabled={!tempCheckIn}>
                Date de départ
              </TabsTrigger>
            </TabsList>
            
            <TabsContent value="checkin" className="space-y-3 sm:space-y-4 mt-3 sm:mt-4">
              <div className="border rounded-lg overflow-auto max-w-full">
                <CalendarComponent
                  mode="single"
                  selected={tempCheckIn}
                  onSelect={setTempCheckIn}
                  disabled={(date) => date < new Date()}
                  locale={fr}
                  className="mx-auto w-full"
                />
              </div>
              {tempCheckIn && (
                <div className="bg-primary/10 p-2 sm:p-3 rounded-lg text-center">
                  <p className="text-xs sm:text-sm font-medium">
                    Arrivée: {format(tempCheckIn, 'dd MMMM yyyy', { locale: fr })}
                  </p>
                </div>
              )}
            </TabsContent>
            
            <TabsContent value="checkout" className="space-y-3 sm:space-y-4 mt-3 sm:mt-4">
              <div className="border rounded-lg overflow-auto max-w-full">
                <CalendarComponent
                  mode="single"
                  selected={tempCheckOut}
                  onSelect={setTempCheckOut}
                  disabled={(date) => !tempCheckIn || date <= tempCheckIn}
                  locale={fr}
                  className="mx-auto w-full"
                />
              </div>
              {tempCheckOut && (
                <div className="bg-primary/10 p-2 sm:p-3 rounded-lg text-center">
                  <p className="text-xs sm:text-sm font-medium">
                    Départ: {format(tempCheckOut, 'dd MMMM yyyy', { locale: fr })}
                  </p>
                </div>
              )}
            </TabsContent>
          </Tabs>

          {tempCheckIn && tempCheckOut && (
            <div className="bg-accent p-3 sm:p-4 rounded-lg text-center mt-3 sm:mt-4">
              <p className="text-xs sm:text-sm text-muted-foreground mb-1">Durée du séjour</p>
              <p className="text-xl sm:text-2xl font-bold text-primary">
                {Math.ceil((tempCheckOut.getTime() - tempCheckIn.getTime()) / (1000 * 60 * 60 * 24))} nuit{Math.ceil((tempCheckOut.getTime() - tempCheckIn.getTime()) / (1000 * 60 * 60 * 24)) > 1 ? 's' : ''}
              </p>
            </div>
          )}

          <div className="flex gap-2 sm:gap-3 pt-3 sm:pt-4">
            <Button
              variant="outline"
              className="flex-1 h-9 sm:h-10 text-xs sm:text-sm"
              onClick={() => setShowDateDialog(false)}
            >
              Annuler
            </Button>
            <Button
              className="flex-1 h-9 sm:h-10 text-xs sm:text-sm"
              onClick={handleConfirmDates}
              disabled={!tempCheckIn || !tempCheckOut}
            >
              Confirmer
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}
