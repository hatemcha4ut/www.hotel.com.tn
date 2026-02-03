import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Slider } from '@/components/ui/slider'
import { Checkbox } from '@/components/ui/checkbox'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Card } from '@/components/ui/card'
import { Separator } from '@/components/ui/separator'
import { HotelCard } from '@/components/HotelCard'
import { FunnelSimple, ArrowLeft, MagnifyingGlass } from '@phosphor-icons/react'
import { api } from '@/lib/api'
import { Hotel, SortOption } from '@/types'
import { useApp } from '@/contexts/AppContext'
import { format } from 'date-fns'
import { fr } from 'date-fns/locale'

interface SearchResultsPageProps {
  onViewHotel: (hotelId: string) => void
  onBack: () => void
  onNewSearch?: () => void
  initialResults?: Hotel[]
}

export function SearchResultsPage({ onViewHotel, onBack, onNewSearch, initialResults }: SearchResultsPageProps) {
  const { searchParams } = useApp()
  const [hotels, setHotels] = useState<Hotel[]>([])
  const [filteredHotels, setFilteredHotels] = useState<Hotel[]>([])
  const [loading, setLoading] = useState(true)
  const [sortBy, setSortBy] = useState<SortOption>('price-asc')
  const [priceRange, setPriceRange] = useState<[number, number]>([0, 500])
  const [selectedStars, setSelectedStars] = useState<number[]>([])
  const [showFilters, setShowFilters] = useState(false)

  useEffect(() => {
    if (initialResults) {
      setHotels(initialResults)
      setFilteredHotels(initialResults)
      setPriceRange([0, 500])
      setSelectedStars([])
      setLoading(false)
      return
    }

    const loadHotels = async () => {
      setLoading(true)
      try {
        const results = await api.searchHotels({
          cityId: searchParams.cityId,
          hotelName: searchParams.hotelName,
          checkIn: searchParams.checkIn ? format(searchParams.checkIn, 'yyyy-MM-dd') : undefined,
          checkOut: searchParams.checkOut ? format(searchParams.checkOut, 'yyyy-MM-dd') : undefined,
        })
        setHotels(results)
        setFilteredHotels(results)
        setPriceRange([0, 500])
        setSelectedStars([])
      } catch (error) {
        console.error('Error loading hotels:', error)
      } finally {
        setLoading(false)
      }
    }
    loadHotels()
  }, [searchParams, initialResults])

  useEffect(() => {
    let filtered = [...hotels]

    filtered = filtered.filter(h => h.price >= priceRange[0] && h.price <= priceRange[1])

    if (selectedStars.length > 0) {
      filtered = filtered.filter(h => selectedStars.includes(h.stars))
    }

    filtered.sort((a, b) => {
      switch (sortBy) {
        case 'price-asc':
          return a.price - b.price
        case 'price-desc':
          return b.price - a.price
        case 'stars':
          return b.stars - a.stars
        case 'rating':
          return b.rating - a.rating
        default:
          return 0
      }
    })

    setFilteredHotels(filtered)
  }, [hotels, priceRange, selectedStars, sortBy])

  const toggleStar = (star: number) => {
    setSelectedStars(prev =>
      prev.includes(star) ? prev.filter(s => s !== star) : [...prev, star]
    )
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="bg-muted/30 py-6 border-b border-border">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center gap-2 mb-4">
            <Button variant="ghost" onClick={onBack}>
              <ArrowLeft size={18} className="mr-2" />
              Retour
            </Button>
            {onNewSearch && (
              <Button variant="outline" onClick={onNewSearch}>
                <MagnifyingGlass size={18} className="mr-2" />
                Nouvelle recherche
              </Button>
            )}
          </div>
          
          <div className="flex flex-col sm:flex-row sm:items-center gap-4">
            <div className="flex-1">
              <h1 className="text-2xl font-bold mb-2">
                {searchParams.searchMode === 'city' ? 'Recherche par ville' : 'Recherche par nom d\'hôtel'}
              </h1>
              <div className="text-sm text-muted-foreground">
                {searchParams.hotelName && (
                  <span className="font-medium">Recherche: "{searchParams.hotelName}" • </span>
                )}
                {filteredHotels.length} hôtel{filteredHotels.length > 1 ? 's' : ''} trouvé{filteredHotels.length > 1 ? 's' : ''}
                {searchParams.checkIn && searchParams.checkOut && (
                  <span>
                    {' '}• Du {format(searchParams.checkIn, 'dd MMM', { locale: fr })} au{' '}
                    {format(searchParams.checkOut, 'dd MMM yyyy', { locale: fr })}
                  </span>
                )}
              </div>
            </div>
            
            <div className="flex items-center gap-4">
              <Button
                variant="outline"
                onClick={() => setShowFilters(!showFilters)}
                className="md:hidden"
              >
                <FunnelSimple size={18} className="mr-2" />
                Filtres
              </Button>
              
              <div className="w-48">
                <Select value={sortBy} onValueChange={(value) => setSortBy(value as SortOption)}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="price-asc">Prix: Croissant</SelectItem>
                    <SelectItem value="price-desc">Prix: Décroissant</SelectItem>
                    <SelectItem value="stars">Étoiles</SelectItem>
                    <SelectItem value="rating">Note client</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex flex-col md:flex-row gap-8">
          <aside
            className={`w-full md:w-64 space-y-6 ${showFilters ? 'block' : 'hidden md:block'}`}
          >
            <Card className="p-6">
              <h3 className="font-semibold mb-4">Prix par nuit</h3>
              <Slider
                value={priceRange}
                onValueChange={(value) => setPriceRange(value as [number, number])}
                max={500}
                step={10}
                className="mb-4"
              />
              <div className="flex items-center justify-between text-sm text-muted-foreground">
                <span>{priceRange[0]} TND</span>
                <span>{priceRange[1]} TND</span>
              </div>
            </Card>

            <Card className="p-6">
              <h3 className="font-semibold mb-4">Catégorie</h3>
              <div className="space-y-3">
                {[5, 4, 3].map((star) => (
                  <div key={star} className="flex items-center gap-2">
                    <Checkbox
                      id={`star-${star}`}
                      checked={selectedStars.includes(star)}
                      onCheckedChange={() => toggleStar(star)}
                    />
                    <Label htmlFor={`star-${star}`} className="cursor-pointer">
                      {star} étoile{star > 1 ? 's' : ''}
                    </Label>
                  </div>
                ))}
              </div>
            </Card>

            <Button
              variant="outline"
              className="w-full"
              onClick={() => {
                setPriceRange([0, 500])
                setSelectedStars([])
              }}
            >
              Réinitialiser les filtres
            </Button>
          </aside>

          <main className="flex-1">
            {loading ? (
              <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
                {Array.from({ length: 6 }).map((_, i) => (
                  <div key={i} className="h-96 bg-muted animate-pulse rounded-lg" />
                ))}
              </div>
            ) : filteredHotels.length === 0 ? (
              <Card className="p-12 text-center">
                <h3 className="text-xl font-semibold mb-2">Aucun hôtel trouvé</h3>
                <p className="text-muted-foreground mb-6">
                  Essayez de modifier vos critères de recherche ou de réinitialiser les filtres.
                </p>
                <Button onClick={onBack}>Nouvelle recherche</Button>
              </Card>
            ) : (
              <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
                {filteredHotels.map((hotel) => (
                  <HotelCard key={hotel.id} hotel={hotel} onViewDetails={onViewHotel} />
                ))}
              </div>
            )}
          </main>
        </div>
      </div>
    </div>
  )
}
