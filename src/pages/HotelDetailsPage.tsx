import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group'
import { Label } from '@/components/ui/label'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog'
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
}

export function HotelDetailsPage({ hotelId, onBack, onBookRoom }: HotelDetailsPageProps) {
  const { searchParams, setSearchParams } = useApp()
  const [hotel, setHotel] = useState<Hotel | null>(null)
  const [rooms, setRooms] = useState<Room[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedImage, setSelectedImage] = useState<string>('')
  const [selectedBoardings, setSelectedBoardings] = useState<Record<string, string>>({})
  const [showDateDialog, setShowDateDialog] = useState(false)
  const [selectedRoomForBooking, setSelectedRoomForBooking] = useState<Room | null>(null)
  const [tempCheckIn, setTempCheckIn] = useState<Date | undefined>(undefined)
  const [tempCheckOut, setTempCheckOut] = useState<Date | undefined>(undefined)

  useEffect(() => {
    const loadHotelDetails = async () => {
      setLoading(true)
      try {
        const hotelData = await api.getHotelDetails(hotelId)
        if (hotelData) {
          setHotel(hotelData)
          setSelectedImage(hotelData.image)
        }
        const roomsData = await api.getAvailableRooms(hotelId)
        setRooms(roomsData)
        
        const initialBoardings: Record<string, string> = {}
        roomsData.forEach(room => {
          if (room.boardingOptions && room.boardingOptions.length > 0) {
            initialBoardings[room.id] = room.boardingOptions[0].type
          } else {
            initialBoardings[room.id] = room.boardingType
          }
        })
        setSelectedBoardings(initialBoardings)
      } catch (error) {
        console.error('Error loading hotel details:', error)
        toast.error('Erreur lors du chargement des détails')
      } finally {
        setLoading(false)
      }
    }
    loadHotelDetails()
  }, [hotelId])

  const handleBoardingChange = (roomId: string, boardingType: string) => {
    setSelectedBoardings(prev => ({ ...prev, [roomId]: boardingType }))
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
          <Button variant="ghost" onClick={onBack}>
            <ArrowLeft size={18} className="mr-2" />
            Retour aux résultats
          </Button>
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
              <h2 className="text-2xl font-bold mb-6">Chambres disponibles</h2>
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
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Sélectionnez vos dates de séjour</DialogTitle>
            <DialogDescription>
              Choisissez vos dates d'arrivée et de départ pour finaliser votre réservation
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-6 py-4">
            <div className="space-y-3">
              <Label className="text-base font-semibold">Date d'arrivée</Label>
              <div className="border rounded-lg p-2">
                <CalendarComponent
                  mode="single"
                  selected={tempCheckIn}
                  onSelect={setTempCheckIn}
                  disabled={(date) => date < new Date()}
                  locale={fr}
                  className="mx-auto"
                />
              </div>
              {tempCheckIn && (
                <p className="text-sm text-muted-foreground text-center">
                  Arrivée: {format(tempCheckIn, 'dd MMMM yyyy', { locale: fr })}
                </p>
              )}
            </div>

            <Separator />

            <div className="space-y-3">
              <Label className="text-base font-semibold">Date de départ</Label>
              <div className="border rounded-lg p-2">
                <CalendarComponent
                  mode="single"
                  selected={tempCheckOut}
                  onSelect={setTempCheckOut}
                  disabled={(date) => !tempCheckIn || date <= tempCheckIn}
                  locale={fr}
                  className="mx-auto"
                />
              </div>
              {tempCheckOut && (
                <p className="text-sm text-muted-foreground text-center">
                  Départ: {format(tempCheckOut, 'dd MMMM yyyy', { locale: fr })}
                </p>
              )}
            </div>

            {tempCheckIn && tempCheckOut && (
              <div className="bg-muted p-4 rounded-lg text-center">
                <p className="text-sm text-muted-foreground mb-1">Durée du séjour</p>
                <p className="text-2xl font-bold text-primary">
                  {Math.ceil((tempCheckOut.getTime() - tempCheckIn.getTime()) / (1000 * 60 * 60 * 24))} nuit{Math.ceil((tempCheckOut.getTime() - tempCheckIn.getTime()) / (1000 * 60 * 60 * 24)) > 1 ? 's' : ''}
                </p>
              </div>
            )}

            <div className="flex gap-3 pt-4">
              <Button
                variant="outline"
                className="flex-1"
                onClick={() => setShowDateDialog(false)}
              >
                Annuler
              </Button>
              <Button
                className="flex-1"
                onClick={handleConfirmDates}
                disabled={!tempCheckIn || !tempCheckOut}
              >
                Confirmer
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}
