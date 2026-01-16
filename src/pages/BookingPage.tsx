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
import { CheckCircle, ArrowLeft, User, UserPlus } from '@phosphor-icons/react'
import { Hotel, Room, GuestDetails } from '@/types'
import { useApp } from '@/contexts/AppContext'
import { format } from 'date-fns'
import { fr } from 'date-fns/locale'
import { api } from '@/lib/api'
import { toast } from 'sonner'
import { AuthDialog } from '@/components/AuthDialog'
import { ClickToPayIntegration } from '@/components/ClickToPayIntegration'
import { useKV } from '@github/spark/hooks'

interface BookingPageProps {
  hotel: Hotel
  room: Room
  onBack: () => void
  onComplete: (reference: string) => void
}

export function BookingPage({ hotel, room, onBack, onComplete }: BookingPageProps) {
  const { searchParams } = useApp()
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
  const [acceptTerms, setAcceptTerms] = useState(false)
  const [processing, setProcessing] = useState(false)
  const [authDialogOpen, setAuthDialogOpen] = useState(false)
  const [currentUser, setCurrentUser] = useKV<any>('currentUser', null)
  const [accountChoice, setAccountChoice] = useState<'guest' | 'create' | 'login' | null>(null)

  const handleSubmit = async () => {
    setProcessing(true)
    try {
      const result = await api.createBooking({
        hotel,
        room,
        searchParams,
        guestDetails,
      })
      
      const bookingData = {
        reference: result.reference,
        hotel,
        room,
        searchParams,
        guestDetails,
        nights,
        totalAmount
      }
      await window.spark.kv.set(`booking-${result.reference}`, bookingData)
      
      toast.success('Réservation confirmée!')
      onComplete(result.reference)
    } catch (error) {
      toast.error('Erreur lors de la réservation')
    } finally {
      setProcessing(false)
    }
  }

  const handleAuthSuccess = (user: any) => {
    setCurrentUser(user)
    setGuestDetails({
      ...guestDetails,
      firstName: user.name?.split(' ')[0] || '',
      lastName: user.name?.split(' ')[1] || '',
      email: user.email || '',
      phone: user.phone || '',
    })
    toast.success(`Bienvenue ${user.name}!`)
  }

  const handleContinueAsGuest = () => {
    setAccountChoice('guest')
  }

  const handleCreateAccount = () => {
    setAccountChoice('create')
    setAuthDialogOpen(true)
  }

  const nights =
    searchParams.checkIn && searchParams.checkOut
      ? Math.ceil(
          (searchParams.checkOut.getTime() - searchParams.checkIn.getTime()) /
            (1000 * 60 * 60 * 24)
        )
      : 1

  const totalAmount = Math.round(room.pricePerNight * nights * 1.1)

  const generateBookingReference = () => {
    return `BK${Date.now().toString().slice(-8)}`
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="bg-muted/30 py-4 border-b border-border">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <Button variant="ghost" onClick={onBack}>
            <ArrowLeft size={18} className="mr-2" />
            Retour
          </Button>
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
                      <h4 className="font-medium mb-2">Chambre sélectionnée</h4>
                      <p className="text-sm text-muted-foreground">{room.name}</p>
                      <p className="text-sm text-muted-foreground">{room.bedConfig}</p>
                      <p className="text-sm text-muted-foreground">{room.boardingType}</p>
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
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">
                          {room.pricePerNight} TND × {nights} nuit{nights > 1 ? 's' : ''}
                        </span>
                        <span>{room.pricePerNight * nights} TND</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Taxes et frais</span>
                        <span>{Math.round(room.pricePerNight * nights * 0.1)} TND</span>
                      </div>
                      <Separator />
                      <div className="flex justify-between text-lg font-bold">
                        <span>Total</span>
                        <span className="text-primary">
                          {Math.round(room.pricePerNight * nights * 1.1)} TND
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

                {!currentUser && accountChoice === null && (
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
                        onClick={handleCreateAccount}
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
                      >
                        <div className="flex-shrink-0 w-12 h-12 sm:w-14 sm:h-14 rounded-full bg-accent/10 flex items-center justify-center">
                          <User className="text-accent w-6 h-6 sm:w-7 sm:h-7" weight="duotone" />
                        </div>
                        <div className="text-left flex-1 min-w-0">
                          <div className="font-semibold text-sm sm:text-base mb-1">Continuer en visiteur</div>
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
                        disabled={!acceptTerms || (!currentUser && accountChoice === null)}
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
              <ClickToPayIntegration
                amount={totalAmount}
                reference={generateBookingReference()}
                onPaymentSuccess={handleSubmit}
                onBack={() => setStep(2)}
              />
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
                  <div className="font-medium mb-2">{room.name}</div>
                  <div className="text-sm text-muted-foreground space-y-1">
                    <div>{room.bedConfig}</div>
                    <div>{room.boardingType}</div>
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
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">
                      {room.pricePerNight} TND × {nights} nuit{nights > 1 ? 's' : ''}
                    </span>
                    <span>{room.pricePerNight * nights} TND</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Taxes et frais</span>
                    <span>{Math.round(room.pricePerNight * nights * 0.1)} TND</span>
                  </div>
                  <Separator />
                  <div className="flex justify-between text-lg font-bold">
                    <span>Total</span>
                    <span className="text-primary">
                      {Math.round(room.pricePerNight * nights * 1.1)} TND
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
