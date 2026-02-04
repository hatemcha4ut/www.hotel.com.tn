import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Separator } from '@/components/ui/separator'
import { Badge } from '@/components/ui/badge'
import { Checkbox } from '@/components/ui/checkbox'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group'
import { CheckCircle, ArrowLeft, User, UserPlus, MagnifyingGlass } from '@phosphor-icons/react'
import { Hotel, Room, GuestDetails } from '@/types'
import type { AuthUser } from '@/components/AuthDialog'
import { useApp } from '@/contexts/AppContext'
import { format } from 'date-fns'
import { fr } from 'date-fns/locale'
import { toast } from 'sonner'
import { AuthDialog } from '@/components/AuthDialog'
import { getSupabaseClient } from '@/lib/supabase'
import { createGuestBooking } from '@/services/guestBooking'
import { useAuthUser } from '@/hooks/use-auth-user'

interface BookingPageProps {
  hotel: Hotel
  room: Room
  rooms?: Room[]
  onBack: () => void
  onComplete: (reference: string) => void
  onNewSearch?: () => void
}

export function BookingPage({ hotel, room, rooms, onBack, onComplete, onNewSearch }: BookingPageProps) {
  const { searchParams } = useApp()
  const bookingRooms = rooms && rooms.length > 0 ? rooms : [room]
  const [step, setStep] = useState(1)
  const [guestDetails, setGuestDetails] = useState<GuestDetails>({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    countryCode: '+216',
    nationality: 'TN',
    specialRequests: '',
  })
  const [roomBoardings, setRoomBoardings] = useState<Record<number, string>>(() => {
    const initial: Record<number, string> = {}
    bookingRooms.forEach((r, idx) => {
      initial[idx] = r.selectedBoarding || r.boardingType
    })
    return initial
  })
  const [applyToAll, setApplyToAll] = useState(bookingRooms.length > 1)
  const [acceptTerms, setAcceptTerms] = useState(false)
  const [processing, setProcessing] = useState(false)
  const [authDialogOpen, setAuthDialogOpen] = useState(false)
  const { currentUser, setCurrentUser } = useAuthUser()
  const [isGuestMode, setIsGuestMode] = useState(false)
  const handleSubmit = async () => {
    setProcessing(true)
    try {
      if (!currentUser && !isGuestMode) {
        throw new Error('Veuillez vous connecter ou choisir le mode invité.')
      }
      const hotelId = hotel?.id?.trim()
      if (!hotelId) {
        throw new Error('Identifiant de l’hôtel manquant. Veuillez revenir à la fiche hôtel.')
      }
      await createGuestBooking({
        hotelId,
        hotel,
        room,
        rooms: bookingRooms.map((r, idx) => ({
          ...r,
          selectedBoarding: roomBoardings[idx],
        })),
        searchParams,
        guestDetails,
        nights,
        totalAmount,
      })
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Erreur lors de la réservation')
    } finally {
      setProcessing(false)
    }
  }

  const handleAuthSuccess = async (user: AuthUser) => {
    setCurrentUser(user)
    setGuestDetails({
      ...guestDetails,
      firstName: user.name?.split(' ')[0] || '',
      lastName: user.name?.split(' ')[1] || '',
      email: user.email || '',
      phone: user.phone || '',
    })
    toast.success(`Bienvenue ${user.name}!`)
    setIsGuestMode(false)
  }

  const handleContinueAsGuest = async () => {
    setProcessing(true)
    try {
      const supabase = getSupabaseClient()
      const { error } = await supabase.auth.signInAnonymously()
      if (error) {
        throw error
      }
      setIsGuestMode(true)
      toast.success('Session invité créée. Vous pouvez finaliser la réservation.')
    } catch (error) {
      toast.error('Impossible de démarrer une session invité. Veuillez réessayer.')
    } finally {
      setProcessing(false)
    }
  }

  const handleOpenAuthDialog = () => {
    setAuthDialogOpen(true)
  }
  
  const handleBoardingChange = (roomIndex: number, boardingType: string) => {
    if (applyToAll) {
      const newBoardings: Record<number, string> = {}
      bookingRooms.forEach((_, idx) => {
        newBoardings[idx] = boardingType
      })
      setRoomBoardings(newBoardings)
    } else {
      setRoomBoardings(prev => ({ ...prev, [roomIndex]: boardingType }))
    }
  }
  
  const getRoomPrice = (roomData: Room, roomIndex: number) => {
    const selectedBoarding = roomBoardings[roomIndex]
    const boardingOption = roomData.boardingOptions?.find(b => b.type === selectedBoarding)
    return boardingOption?.pricePerNight || roomData.pricePerNight
  }
  
  const getRoomTotal = (roomData: Room, roomIndex: number) => {
    const pricePerNight = getRoomPrice(roomData, roomIndex)
    return Math.round(pricePerNight * nights * 1.1)
  }

  const nights =
    searchParams.checkIn && searchParams.checkOut
      ? Math.ceil(
          (searchParams.checkOut.getTime() - searchParams.checkIn.getTime()) /
            (1000 * 60 * 60 * 24)
        )
      : 1

  const totalAmount = bookingRooms.reduce((sum, r, idx) => sum + getRoomTotal(r, idx), 0)

  return (
    <div className="min-h-screen bg-background">
      <div className="bg-muted/30 py-4 border-b border-border">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center gap-2">
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
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <div className="flex items-center justify-center gap-4 mb-8">
            {[1, 2, 3].map((s) => (
              <div key={s} className="flex items-center">
                <div
                  className={`w-10 h-10 rounded-full flex items-center justify-center font-semibold ${
                    step >= s
                      ? 'bg-primary text-primary-foreground'
                      : 'bg-muted text-muted-foreground'
                  }`}
                >
                  {s}
                </div>
                {s < 3 && (
                  <div
                    className={`w-24 h-1 mx-2 ${
                      step > s ? 'bg-primary' : 'bg-muted'
                    }`}
                  />
                )}
              </div>
            ))}
          </div>
          
          <div className="text-center">
            <h1 className="text-2xl font-bold">
              {step === 1 && 'Informations personnelles'}
              {step === 2 && 'Vérification de la réservation'}
              {step === 3 && 'Paiement'}
            </h1>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2">
            {step === 1 && (
              <Card>
                <CardHeader>
                  <CardTitle>Coordonnées du voyageur principal</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="firstName">Prénom *</Label>
                      <Input
                        id="firstName"
                        value={guestDetails.firstName}
                        onChange={(e) =>
                          setGuestDetails({ ...guestDetails, firstName: e.target.value })
                        }
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="lastName">Nom *</Label>
                      <Input
                        id="lastName"
                        value={guestDetails.lastName}
                        onChange={(e) =>
                          setGuestDetails({ ...guestDetails, lastName: e.target.value })
                        }
                        required
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="email">Email *</Label>
                    <Input
                      id="email"
                      type="email"
                      value={guestDetails.email}
                      onChange={(e) =>
                        setGuestDetails({ ...guestDetails, email: e.target.value })
                      }
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="phone">Téléphone *</Label>
                    <div className="flex gap-2">
                      <Select
                        value={guestDetails.countryCode}
                        onValueChange={(value) =>
                          setGuestDetails({ ...guestDetails, countryCode: value })
                        }
                      >
                        <SelectTrigger className="w-32">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="+216">+216 (TN)</SelectItem>
                          <SelectItem value="+33">+33 (FR)</SelectItem>
                          <SelectItem value="+1">+1 (US)</SelectItem>
                        </SelectContent>
                      </Select>
                      <Input
                        id="phone"
                        type="tel"
                        value={guestDetails.phone}
                        onChange={(e) =>
                          setGuestDetails({ ...guestDetails, phone: e.target.value })
                        }
                        required
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="nationality">Nationalité *</Label>
                    <Select
                      value={guestDetails.nationality}
                      onValueChange={(value) =>
                        setGuestDetails({ ...guestDetails, nationality: value })
                      }
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Sélectionner" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="TN">Tunisie</SelectItem>
                        <SelectItem value="FR">France</SelectItem>
                        <SelectItem value="DZ">Algérie</SelectItem>
                        <SelectItem value="MA">Maroc</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <Separator />
                  
                  {bookingRooms.length > 0 && bookingRooms.some(r => r.boardingOptions && r.boardingOptions.length > 1) && (
                    <>
                      <div className="space-y-4">
                        <div className="flex items-center justify-between">
                          <div>
                            <h3 className="text-lg font-semibold">Type de pension</h3>
                            <p className="text-sm text-muted-foreground">
                              Sélectionnez le type de pension pour {bookingRooms.length > 1 ? 'vos chambres' : 'votre chambre'}
                            </p>
                          </div>
                          {bookingRooms.length > 1 && (
                            <div className="flex items-center gap-2">
                              <Checkbox
                                id="applyToAll"
                                checked={applyToAll}
                                onCheckedChange={(checked) => {
                                  setApplyToAll(checked as boolean)
                                  if (checked) {
                                    const firstBoarding = roomBoardings[0]
                                    const newBoardings: Record<number, string> = {}
                                    bookingRooms.forEach((_, idx) => {
                                      newBoardings[idx] = firstBoarding
                                    })
                                    setRoomBoardings(newBoardings)
                                  }
                                }}
                              />
                              <Label htmlFor="applyToAll" className="text-sm cursor-pointer">
                                Appliquer à toutes les chambres
                              </Label>
                            </div>
                          )}
                        </div>
                        
                        <div className="space-y-4">
                          {bookingRooms.map((roomData, roomIndex) => {
                            const boardingOptions = roomData.boardingOptions || []
                            if (boardingOptions.length <= 1) return null
                            
                            return (
                              <Card key={roomIndex} className="border-2">
                                <CardHeader className="pb-3">
                                  <CardTitle className="text-base">
                                    Chambre {roomIndex + 1}: {roomData.name}
                                  </CardTitle>
                                </CardHeader>
                                <CardContent>
                                  <RadioGroup
                                    value={roomBoardings[roomIndex]}
                                    onValueChange={(value) => handleBoardingChange(roomIndex, value)}
                                    className="space-y-3"
                                  >
                                    {boardingOptions.map((option) => (
                                      <div
                                        key={option.type}
                                        className="flex items-center space-x-3 p-3 rounded-lg border border-border hover:bg-muted/50 transition-colors"
                                      >
                                        <input
                                          type="radio"
                                          value={option.type}
                                          id={`room-${roomIndex}-${option.type}`}
                                          checked={roomBoardings[roomIndex] === option.type}
                                          onChange={(e) => handleBoardingChange(roomIndex, e.target.value)}
                                          className="w-4 h-4 text-primary focus:ring-primary"
                                        />
                                        <Label
                                          htmlFor={`room-${roomIndex}-${option.type}`}
                                          className="flex-1 flex items-center justify-between cursor-pointer"
                                        >
                                          <span className="font-medium">{option.type}</span>
                                          <span className="text-sm text-muted-foreground">
                                            {option.pricePerNight} TND/nuit
                                          </span>
                                        </Label>
                                      </div>
                                    ))}
                                  </RadioGroup>
                                </CardContent>
                              </Card>
                            )
                          })}
                        </div>
                      </div>
                      
                      <Separator />
                    </>
                  )}

                  <div className="space-y-4">
                    <div className="flex items-center space-x-2">
                      <Checkbox
                        id="bookingForOther"
                        checked={guestDetails.bookingForOther || false}
                        onCheckedChange={(checked) =>
                          setGuestDetails({
                            ...guestDetails,
                            bookingForOther: checked as boolean,
                            guestFirstName: checked ? guestDetails.guestFirstName : undefined,
                            guestLastName: checked ? guestDetails.guestLastName : undefined,
                          })
                        }
                      />
                      <Label htmlFor="bookingForOther" className="font-normal cursor-pointer">
                        Je réserve pour quelqu'un d'autre
                      </Label>
                    </div>

                    {guestDetails.bookingForOther && (
                      <div className="border border-border rounded-lg p-4 space-y-4 bg-muted/30">
                        <p className="text-sm text-muted-foreground mb-3">
                          Coordonnées de l'occupant principal
                        </p>
                        <div className="grid grid-cols-2 gap-4">
                          <div className="space-y-2">
                            <Label htmlFor="guestFirstName">Prénom de l'occupant *</Label>
                            <Input
                              id="guestFirstName"
                              value={guestDetails.guestFirstName || ''}
                              onChange={(e) =>
                                setGuestDetails({ ...guestDetails, guestFirstName: e.target.value })
                              }
                              required
                            />
                          </div>
                          <div className="space-y-2">
                            <Label htmlFor="guestLastName">Nom de l'occupant *</Label>
                            <Input
                              id="guestLastName"
                              value={guestDetails.guestLastName || ''}
                              onChange={(e) =>
                                setGuestDetails({ ...guestDetails, guestLastName: e.target.value })
                              }
                              required
                            />
                          </div>
                        </div>
                      </div>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="requests">Demandes spéciales (optionnel)</Label>
                    <Textarea
                      id="requests"
                      value={guestDetails.specialRequests}
                      onChange={(e) =>
                        setGuestDetails({ ...guestDetails, specialRequests: e.target.value })
                      }
                      placeholder="Lit bébé, arrivée tardive..."
                      rows={3}
                    />
                  </div>

                  <Button
                    className="w-full"
                    size="lg"
                    onClick={() => setStep(2)}
                    disabled={
                      !guestDetails.firstName ||
                      !guestDetails.lastName ||
                      !guestDetails.email ||
                      !guestDetails.phone ||
                      !guestDetails.nationality ||
                      (guestDetails.bookingForOther && (!guestDetails.guestFirstName || !guestDetails.guestLastName))
                    }
                  >
                    Continuer
                  </Button>
                </CardContent>
              </Card>
            )}

            {step === 2 && (
              <div className="space-y-6">
                <Card>
                  <CardHeader>
                    <CardTitle>Résumé du séjour</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="flex items-center gap-4">
                      <img
                        src={hotel.image}
                        alt={hotel.name}
                        className="w-24 h-24 object-cover rounded-lg"
                      />
                      <div className="flex-1">
                        <h3 className="font-semibold text-lg">{hotel.name}</h3>
                        <p className="text-sm text-muted-foreground">{hotel.city}</p>
                        <div className="flex items-center gap-1 mt-1">
                          {Array.from({ length: hotel.stars }).map((_, i) => (
                            <span key={i} className="text-accent">★</span>
                          ))}
                        </div>
                      </div>
                    </div>

                    <Separator />

                    <div>
                      <h4 className="font-medium mb-3">
                        {bookingRooms.length > 1 ? `Chambres sélectionnées (${bookingRooms.length})` : 'Chambre sélectionnée'}
                      </h4>
                      <div className="space-y-3">
                        {bookingRooms.map((roomData, idx) => (
                          <div key={idx} className="p-3 border border-border rounded-lg bg-muted/30">
                            <div className="font-medium text-sm">{bookingRooms.length > 1 && `Chambre ${idx + 1}: `}{roomData.name}</div>
                            <div className="text-sm text-muted-foreground mt-1">{roomData.bedConfig}</div>
                            <div className="text-sm text-muted-foreground">{roomBoardings[idx]}</div>
                            <div className="text-sm font-semibold text-primary mt-2">
                              {getRoomPrice(roomData, idx)} TND/nuit
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>

                    {searchParams.checkIn && searchParams.checkOut && (
                      <>
                        <Separator />
                        <div className="text-sm space-y-1">
                          <div>
                            <span className="text-muted-foreground">Arrivée: </span>
                            {format(searchParams.checkIn, 'dd MMM yyyy', { locale: fr })}
                          </div>
                          <div>
                            <span className="text-muted-foreground">Départ: </span>
                            {format(searchParams.checkOut, 'dd MMM yyyy', { locale: fr })}
                          </div>
                          <div>
                            <span className="text-muted-foreground">Durée: </span>
                            {nights} nuit{nights > 1 ? 's' : ''}
                          </div>
                          <div>
                            <span className="text-muted-foreground">Nombre d'hôtes: </span>
                            {searchParams.rooms.reduce((sum, room) => sum + room.adults + room.children.length, 0)} personne(s)
                          </div>
                        </div>
                      </>
                    )}

                    <Separator />

                    <div className="space-y-2 text-sm">
                      {bookingRooms.map((roomData, idx) => {
                        const pricePerNight = getRoomPrice(roomData, idx)
                        const subtotal = pricePerNight * nights
                        return (
                          <div key={idx} className="flex justify-between">
                            <span className="text-muted-foreground">
                              Chambre {bookingRooms.length > 1 ? `${idx + 1} - ` : ''}{pricePerNight} TND × {nights} nuit{nights > 1 ? 's' : ''}
                            </span>
                            <span>{subtotal} TND</span>
                          </div>
                        )
                      })}
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Taxes et frais</span>
                        <span>{Math.round(bookingRooms.reduce((sum, r, idx) => sum + (getRoomPrice(r, idx) * nights), 0) * 0.1)} TND</span>
                      </div>
                      <Separator />
                      <div className="flex justify-between text-lg font-bold">
                        <span>Total</span>
                        <span className="text-primary">
                          {totalAmount} TND
                        </span>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle>Informations personnelles</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="space-y-2">
                      <p className="text-sm font-medium">
                        {guestDetails.firstName} {guestDetails.lastName}
                      </p>
                      <p className="text-sm text-muted-foreground">{guestDetails.email}</p>
                      <p className="text-sm text-muted-foreground">
                        {guestDetails.countryCode} {guestDetails.phone}
                      </p>
                      <p className="text-sm text-muted-foreground">
                        Nationalité: {guestDetails.nationality === 'TN' ? 'Tunisienne' : guestDetails.nationality === 'FR' ? 'Française' : guestDetails.nationality === 'DZ' ? 'Algérienne' : guestDetails.nationality === 'MA' ? 'Marocaine' : guestDetails.nationality}
                      </p>
                    </div>
                  </CardContent>
                </Card>

                {!currentUser && !isGuestMode && (
                  <Card className="border-2 border-primary/20 shadow-lg">
                    <CardHeader className="space-y-2 pb-4">
                      <CardTitle className="text-lg sm:text-xl">Comment souhaitez-vous continuer ?</CardTitle>
                      <p className="text-xs sm:text-sm text-muted-foreground">
                        Choisissez une option pour finaliser votre réservation
                      </p>
                    </CardHeader>
                    <CardContent className="space-y-3">
                      <Button 
                        variant="outline" 
                        className="w-full justify-start gap-3 sm:gap-4 h-auto py-4 px-3 sm:px-4 border-2 hover:border-primary hover:bg-primary/5 transition-all"
                        onClick={handleOpenAuthDialog}
                        disabled={processing}
                      >
                        <div className="flex-shrink-0 w-12 h-12 sm:w-14 sm:h-14 rounded-full bg-primary/10 flex items-center justify-center">
                          <UserPlus className="text-primary w-6 h-6 sm:w-7 sm:h-7" weight="duotone" />
                        </div>
                        <div className="text-left flex-1 min-w-0">
                          <div className="font-semibold text-sm sm:text-base mb-1">Créer un compte</div>
                          <div className="text-xs sm:text-sm text-muted-foreground leading-relaxed">
                            Accédez à vos réservations et offres exclusives
                          </div>
                        </div>
                      </Button>
                      
                      <div className="relative">
                        <div className="absolute inset-0 flex items-center">
                          <Separator />
                        </div>
                        <div className="relative flex justify-center text-xs uppercase">
                          <span className="bg-card px-2 text-muted-foreground">Ou</span>
                        </div>
                      </div>
                      
                      <Button 
                        variant="outline" 
                        className="w-full justify-start gap-3 sm:gap-4 h-auto py-4 px-3 sm:px-4 border-2 hover:border-accent hover:bg-accent/5 transition-all"
                        onClick={handleContinueAsGuest}
                        disabled={processing}
                      >
                        <div className="flex-shrink-0 w-12 h-12 sm:w-14 sm:h-14 rounded-full bg-accent/10 flex items-center justify-center">
                          <User className="text-accent w-6 h-6 sm:w-7 sm:h-7" weight="duotone" />
                        </div>
                        <div className="text-left flex-1 min-w-0">
                          <div className="font-semibold text-sm sm:text-base mb-1">Réserver en tant qu'invité</div>
                          <div className="text-xs sm:text-sm text-muted-foreground leading-relaxed">
                            Réservez rapidement sans compte
                          </div>
                        </div>
                      </Button>
                    </CardContent>
                  </Card>
                )}

                <Card>
                  <CardContent className="pt-6 space-y-4">
                    <div className="flex items-center gap-3">
                      <Checkbox
                        id="terms"
                        checked={acceptTerms}
                        onCheckedChange={(checked) => setAcceptTerms(checked as boolean)}
                      />
                      <Label htmlFor="terms" className="text-sm cursor-pointer">
                        J'accepte les conditions générales et la politique de confidentialité
                      </Label>
                    </div>

                    <div className="flex gap-4">
                      <Button variant="outline" onClick={() => setStep(1)} className="flex-1">
                        Retour
                      </Button>
                      <Button
                        onClick={() => setStep(3)}
                        disabled={!acceptTerms || (!currentUser && !isGuestMode)}
                        className="flex-1"
                      >
                        Continuer vers le paiement
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              </div>
            )}

            {step === 3 && (
              <div className="space-y-4">
                <Card>
                  <CardContent className="pt-6 space-y-4">
                    <p className="text-sm text-muted-foreground">
                      Cliquez ci-dessous pour générer votre lien de paiement sécurisé.
                    </p>
                    <div className="flex gap-4">
                      <Button variant="outline" onClick={() => setStep(2)} className="flex-1">
                        Retour
                      </Button>
                      <Button onClick={handleSubmit} className="flex-1" disabled={processing}>
                        {processing ? 'Redirection...' : 'Procéder au paiement'}
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              </div>
            )}
          </div>

          <div className="lg:col-span-1">
            <Card className="sticky top-20">
              <CardHeader>
                <CardTitle className="text-lg">Détails de la réservation</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <div className="font-semibold mb-1">{hotel.name}</div>
                  <div className="text-sm text-muted-foreground">{hotel.city}</div>
                </div>

                <Separator />

                <div>
                  <div className="font-medium mb-3">
                    {bookingRooms.length > 1 ? `Chambres (${bookingRooms.length})` : 'Chambre'}
                  </div>
                  <div className="space-y-3">
                    {bookingRooms.map((roomData, idx) => (
                      <div key={idx} className="text-sm space-y-1 pb-2 border-b border-border last:border-0 last:pb-0">
                        <div className="font-medium">{bookingRooms.length > 1 && `${idx + 1}. `}{roomData.name}</div>
                        <div className="text-muted-foreground">{roomData.bedConfig}</div>
                        <div className="text-muted-foreground">{roomBoardings[idx]}</div>
                        <div className="text-primary font-semibold">{getRoomPrice(roomData, idx)} TND/nuit</div>
                      </div>
                    ))}
                  </div>
                </div>

                {searchParams.checkIn && searchParams.checkOut && (
                  <>
                    <Separator />
                    <div className="text-sm space-y-1">
                      <div>
                        <span className="text-muted-foreground">Arrivée: </span>
                        {format(searchParams.checkIn, 'dd MMM yyyy', { locale: fr })}
                      </div>
                      <div>
                        <span className="text-muted-foreground">Départ: </span>
                        {format(searchParams.checkOut, 'dd MMM yyyy', { locale: fr })}
                      </div>
                      <div>
                        <span className="text-muted-foreground">Durée: </span>
                        {nights} nuit{nights > 1 ? 's' : ''}
                      </div>
                    </div>
                  </>
                )}

                <Separator />

                <div className="space-y-2 text-sm">
                  {bookingRooms.map((roomData, idx) => {
                    const pricePerNight = getRoomPrice(roomData, idx)
                    const subtotal = pricePerNight * nights
                    return (
                      <div key={idx} className="flex justify-between">
                        <span className="text-muted-foreground">
                          {bookingRooms.length > 1 ? `Ch. ${idx + 1} - ` : ''}{pricePerNight} TND × {nights}
                        </span>
                        <span>{subtotal} TND</span>
                      </div>
                    )
                  })}
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Taxes et frais</span>
                    <span>{Math.round(bookingRooms.reduce((sum, r, idx) => sum + (getRoomPrice(r, idx) * nights), 0) * 0.1)} TND</span>
                  </div>
                  <Separator />
                  <div className="flex justify-between text-lg font-bold">
                    <span>Total</span>
                    <span className="text-primary">
                      {totalAmount} TND
                    </span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>

      <AuthDialog 
        open={authDialogOpen} 
        onOpenChange={setAuthDialogOpen}
        onAuthSuccess={handleAuthSuccess}
      />
    </div>
  )
}
