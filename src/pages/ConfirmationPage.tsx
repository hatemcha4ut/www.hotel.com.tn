import { useState, useEffect } from 'react'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Separator } from '@/components/ui/separator'
import { CheckCircle, Download, Eye, Printer, Wallet } from '@phosphor-icons/react'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { toast } from 'sonner'
import { format } from 'date-fns'
import { fr } from 'date-fns/locale'

interface ConfirmationPageProps {
  reference: string
  onHome: () => void
}

export function ConfirmationPage({ reference, onHome }: ConfirmationPageProps) {
  const [showVoucher, setShowVoucher] = useState(false)
  const [bookingData, setBookingData] = useState<any>(null)

  useEffect(() => {
    const loadBookingData = async () => {
      try {
        const data = await window.spark.kv.get(`booking-${reference}`)
        if (data) {
          setBookingData(data)
        }
      } catch (error) {
        console.error('Error loading booking data:', error)
      }
    }
    loadBookingData()
  }, [reference])

  const handleDownloadVoucher = () => {
    toast.success('Téléchargement du voucher...')
    const barcodeData = generateBarcode(reference)
    const voucherContent = generateVoucherContent(barcodeData, bookingData)
    const blob = new Blob([voucherContent], { type: 'text/html' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `voucher-${reference}.html`
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
  }

  const generateBarcode = (data: string) => {
    const canvas = document.createElement('canvas')
    const ctx = canvas.getContext('2d')
    if (!ctx) return ''
    
    canvas.width = 250
    canvas.height = 100
    
    ctx.fillStyle = 'white'
    ctx.fillRect(0, 0, canvas.width, canvas.height)
    
    ctx.fillStyle = 'black'
    const barWidth = 2
    let x = 10
    
    for (let i = 0; i < data.length; i++) {
      const charCode = data.charCodeAt(i)
      const binaryStr = charCode.toString(2).padStart(8, '0')
      
      for (const bit of binaryStr) {
        if (bit === '1') {
          ctx.fillRect(x, 10, barWidth, 60)
        }
        x += barWidth + 1
      }
      x += 2
    }
    
    ctx.fillStyle = 'black'
    ctx.font = '12px monospace'
    ctx.textAlign = 'center'
    ctx.fillText(data, canvas.width / 2, 85)
    
    return canvas.toDataURL()
  }

  const handleAddToGoogleWallet = () => {
    const hotelName = bookingData?.hotel?.name || 'www.hotel.com.tn'
    const checkIn = bookingData?.searchParams?.checkIn 
      ? format(new Date(bookingData.searchParams.checkIn), 'dd MMMM yyyy', { locale: fr })
      : 'À confirmer'
    const checkOut = bookingData?.searchParams?.checkOut 
      ? format(new Date(bookingData.searchParams.checkOut), 'dd MMMM yyyy', { locale: fr })
      : 'À confirmer'
    const guestCount = bookingData?.searchParams?.rooms
      ? bookingData.searchParams.rooms.reduce((sum: number, room: any) => sum + room.adults + room.children.length, 0)
      : 0
    const guestName = bookingData?.guestDetails 
      ? `${bookingData.guestDetails.firstName} ${bookingData.guestDetails.lastName}`
      : ''
    
    const passData = {
      reference,
      barcode: generateBarcode(reference),
      type: 'hotel-booking',
      dateIssued: new Date().toISOString(),
      hotelName,
      checkIn,
      checkOut,
      guestCount: `${guestCount} personne(s)`,
      guestName
    }
    
    const jsonString = JSON.stringify(passData, null, 2)
    const blob = new Blob([jsonString], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `google-wallet-${reference}.json`
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
    
    toast.success('Pass téléchargé pour Google Wallet')
  }

  const handleAddToAppleWallet = () => {
    const hotelName = bookingData?.hotel?.name || 'www.hotel.com.tn'
    const checkIn = bookingData?.searchParams?.checkIn 
      ? format(new Date(bookingData.searchParams.checkIn), 'dd MMMM yyyy', { locale: fr })
      : 'À confirmer'
    const checkOut = bookingData?.searchParams?.checkOut 
      ? format(new Date(bookingData.searchParams.checkOut), 'dd MMMM yyyy', { locale: fr })
      : 'À confirmer'
    const guestCount = bookingData?.searchParams?.rooms
      ? bookingData.searchParams.rooms.reduce((sum: number, room: any) => sum + room.adults + room.children.length, 0)
      : 0
    const guestName = bookingData?.guestDetails 
      ? `${bookingData.guestDetails.firstName} ${bookingData.guestDetails.lastName}`
      : ''
    
    const passData = {
      reference,
      barcode: generateBarcode(reference),
      type: 'hotel-booking',
      dateIssued: new Date().toISOString(),
      hotelName,
      checkIn,
      checkOut,
      guestCount: `${guestCount} personne(s)`,
      guestName,
      organizationName: 'American Tours',
      description: 'Voucher de réservation d\'hôtel'
    }
    
    const jsonString = JSON.stringify(passData, null, 2)
    const blob = new Blob([jsonString], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `apple-wallet-${reference}.pkpass.json`
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
    
    toast.success('Pass téléchargé pour Apple Wallet')
  }

  const handlePrintVoucher = () => {
    window.print()
  }

  const generateVoucherContent = (barcodeData: string, booking: any) => {
    const hotelName = booking?.hotel?.name || 'À compléter'
    const checkInTime = booking?.hotel?.checkInTime || '15:00'
    const checkOutTime = booking?.hotel?.checkOutTime || '12:00'
    const checkInDate = booking?.searchParams?.checkIn 
      ? format(new Date(booking.searchParams.checkIn), 'dd MMMM yyyy', { locale: fr })
      : 'À compléter'
    const checkOutDate = booking?.searchParams?.checkOut 
      ? format(new Date(booking.searchParams.checkOut), 'dd MMMM yyyy', { locale: fr })
      : 'À compléter'
    const guestCount = booking?.searchParams?.rooms
      ? booking.searchParams.rooms.reduce((sum: number, room: any) => sum + room.adults + room.children.length, 0)
      : 0
    const bookedBy = booking?.guestDetails 
      ? `${booking.guestDetails.firstName} ${booking.guestDetails.lastName}`
      : 'À compléter'
    const mainOccupant = booking?.guestDetails?.bookingForOther && booking?.guestDetails?.guestFirstName
      ? `${booking.guestDetails.guestFirstName} ${booking.guestDetails.guestLastName}`
      : booking?.guestDetails
      ? `${booking.guestDetails.firstName} ${booking.guestDetails.lastName}`
      : 'À compléter'
    
    const roomsHtml = booking?.rooms && booking.rooms.length > 0
      ? booking.rooms.map((room: any, index: number) => {
          const roomGuests = booking?.searchParams?.rooms?.[index]
          const adults = roomGuests?.adults || 0
          const childrenCount = roomGuests?.children?.length || 0
          const childrenAges = roomGuests?.children?.join(', ') || ''
          const boardingType = room.selectedBoarding || room.boardingType || 'À compléter'
          
          return `
            <div class="room-card">
              <div class="room-header">Chambre ${index + 1}: ${room.name}</div>
              <div class="room-details">
                <div class="room-info-row">
                  <span class="room-label">Adultes:</span>
                  <span>${adults}</span>
                </div>
                <div class="room-info-row">
                  <span class="room-label">Enfants:</span>
                  <span>${childrenCount}${childrenAges ? ` (âges: ${childrenAges} ans)` : ''}</span>
                </div>
                <div class="room-info-row">
                  <span class="room-label">Type de pension:</span>
                  <span>${boardingType}</span>
                </div>
              </div>
            </div>
          `
        }).join('')
      : `
        <div class="room-card">
          <div class="room-header">Chambre</div>
          <div class="room-details">
            <div class="room-info-row">
              <span class="room-label">Adultes:</span>
              <span>${booking?.searchParams?.rooms?.[0]?.adults || 0}</span>
            </div>
            <div class="room-info-row">
              <span class="room-label">Enfants:</span>
              <span>${booking?.searchParams?.rooms?.[0]?.children?.length || 0}</span>
            </div>
          </div>
        </div>
      `
    
    return `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="UTF-8">
        <title>Voucher - ${reference}</title>
        <style>
          body { font-family: Arial, sans-serif; padding: 40px; max-width: 800px; margin: 0 auto; }
          .header { text-align: center; margin-bottom: 40px; border-bottom: 3px solid #007bff; padding-bottom: 20px; }
          .logo { font-size: 24px; font-weight: bold; color: #007bff; }
          .voucher-id { font-size: 32px; font-weight: bold; color: #007bff; margin: 20px 0; }
          .section { margin: 30px 0; }
          .section-title { font-size: 18px; font-weight: bold; margin-bottom: 10px; border-bottom: 2px solid #eee; padding-bottom: 5px; }
          .info-row { display: flex; padding: 10px 0; border-bottom: 1px solid #f0f0f0; }
          .info-label { font-weight: bold; width: 200px; }
          .info-value { flex: 1; }
          .room-card { background: #f8f9fa; border: 1px solid #dee2e6; border-radius: 8px; padding: 15px; margin-bottom: 15px; }
          .room-header { font-size: 16px; font-weight: bold; color: #007bff; margin-bottom: 10px; }
          .room-details { display: flex; flex-direction: column; gap: 8px; }
          .room-info-row { display: flex; justify-content: space-between; padding: 5px 0; }
          .room-label { font-weight: 600; color: #495057; }
          .barcode-container { text-align: center; margin: 30px 0; padding: 20px; border: 2px solid #ddd; border-radius: 8px; background: white; }
          .barcode-container img { max-width: 300px; height: auto; }
          .barcode-number { font-family: monospace; font-size: 12px; color: #666; margin-top: 10px; }
          .footer { margin-top: 50px; text-align: center; font-size: 12px; color: #666; }
          @media print { body { padding: 20px; } }
        </style>
      </head>
      <body>
        <div class="header">
          <div class="logo">www.hotel.com.tn</div>
          <p>Voucher de Réservation</p>
        </div>
        
        <div class="voucher-id">Référence: ${reference}</div>
        
        <div class="barcode-container">
          <img src="${barcodeData}" alt="Barcode" />
          <div class="barcode-number">${reference}</div>
        </div>
        
        <div class="section">
          <div class="section-title">Informations de réservation</div>
          <div class="info-row">
            <div class="info-label">Date d'émission:</div>
            <div class="info-value">${new Date().toLocaleDateString('fr-FR')}</div>
          </div>
          <div class="info-row">
            <div class="info-label">Statut:</div>
            <div class="info-value">Confirmé</div>
          </div>
          <div class="info-row">
            <div class="info-label">Réservé par:</div>
            <div class="info-value">${bookedBy}</div>
          </div>
          <div class="info-row">
            <div class="info-label">Occupant principal:</div>
            <div class="info-value">${mainOccupant}</div>
          </div>
        </div>
        
        <div class="section">
          <div class="section-title">Détails du séjour</div>
          <div class="info-row">
            <div class="info-label">Hôtel:</div>
            <div class="info-value">${hotelName}</div>
          </div>
          <div class="info-row">
            <div class="info-label">Date d'arrivée:</div>
            <div class="info-value">${checkInDate} à ${checkInTime}</div>
          </div>
          <div class="info-row">
            <div class="info-label">Date de départ:</div>
            <div class="info-value">${checkOutDate} à ${checkOutTime}</div>
          </div>
          <div class="info-row">
            <div class="info-label">Nombre total d'hôtes:</div>
            <div class="info-value">${guestCount} personne(s)</div>
          </div>
        </div>
        
        <div class="section">
          <div class="section-title">Détails des chambres</div>
          ${roomsHtml}
        </div>
        
        <div class="footer">
          <p>American Tours - Facilitateur de loisir en Tunisie</p>
          <p>Email: resamericantours@gmail.com | Tel/WA: +216 51 613 888</p>
          <p>Ce voucher doit être présenté à l'hôtel lors de votre arrivée</p>
        </div>
      </body>
      </html>
    `
  }

  const VoucherPreview = () => {
    const barcodeData = generateBarcode(reference)
    const hotelName = bookingData?.hotel?.name || 'À compléter'
    const checkInTime = bookingData?.hotel?.checkInTime || '15:00'
    const checkOutTime = bookingData?.hotel?.checkOutTime || '12:00'
    const checkInDate = bookingData?.searchParams?.checkIn 
      ? format(new Date(bookingData.searchParams.checkIn), 'dd MMMM yyyy', { locale: fr })
      : 'À compléter'
    const checkOutDate = bookingData?.searchParams?.checkOut 
      ? format(new Date(bookingData.searchParams.checkOut), 'dd MMMM yyyy', { locale: fr })
      : 'À compléter'
    const guestCount = bookingData?.searchParams?.rooms
      ? bookingData.searchParams.rooms.reduce((sum: number, room: any) => sum + room.adults + room.children.length, 0)
      : 0
    const bookedBy = bookingData?.guestDetails 
      ? `${bookingData.guestDetails.firstName} ${bookingData.guestDetails.lastName}`
      : 'À compléter'
    const mainOccupant = bookingData?.guestDetails?.bookingForOther && bookingData?.guestDetails?.guestFirstName
      ? `${bookingData.guestDetails.guestFirstName} ${bookingData.guestDetails.guestLastName}`
      : bookingData?.guestDetails
      ? `${bookingData.guestDetails.firstName} ${bookingData.guestDetails.lastName}`
      : 'À compléter'
    
    return (
      <div className="space-y-6 p-6 bg-white">
        <div className="text-center border-b-4 border-primary pb-6">
          <h2 className="text-2xl font-bold text-primary mb-2">www.hotel.com.tn</h2>
          <p className="text-muted-foreground">Voucher de Réservation</p>
        </div>

        <div className="text-center py-4 bg-primary/5 rounded-lg">
          <p className="text-sm text-muted-foreground mb-2">Référence de réservation</p>
          <p className="text-4xl font-bold text-primary">{reference}</p>
        </div>

        {barcodeData && (
          <div className="bg-white p-6 rounded-lg border-2 border-gray-200 flex flex-col items-center">
            <img src={barcodeData} alt="Barcode" className="w-full max-w-[300px] h-auto" />
            <p className="text-xs text-muted-foreground mt-2 font-mono">{reference}</p>
          </div>
        )}

        <div>
          <h3 className="font-bold text-lg mb-3 border-b-2 pb-2">Informations de réservation</h3>
          <div className="space-y-2 text-sm">
            <div className="flex justify-between py-2 border-b">
              <span className="font-semibold">Date d'émission:</span>
              <span>{new Date().toLocaleDateString('fr-FR')}</span>
            </div>
            <div className="flex justify-between py-2 border-b">
              <span className="font-semibold">Statut:</span>
              <span className="text-green-600 font-medium">Confirmé</span>
            </div>
            <div className="flex justify-between py-2 border-b">
              <span className="font-semibold">Réservé par:</span>
              <span>{bookedBy}</span>
            </div>
            <div className="flex justify-between py-2 border-b">
              <span className="font-semibold">Occupant principal:</span>
              <span>{mainOccupant}</span>
            </div>
          </div>
        </div>

        <div>
          <h3 className="font-bold text-lg mb-3 border-b-2 pb-2">Détails du séjour</h3>
          <div className="space-y-2 text-sm">
            <div className="flex justify-between py-2 border-b">
              <span className="font-semibold">Hôtel:</span>
              <span>{hotelName}</span>
            </div>
            <div className="flex justify-between py-2 border-b">
              <span className="font-semibold">Date d'arrivée:</span>
              <span>{checkInDate} à {checkInTime}</span>
            </div>
            <div className="flex justify-between py-2 border-b">
              <span className="font-semibold">Date de départ:</span>
              <span>{checkOutDate} à {checkOutTime}</span>
            </div>
            <div className="flex justify-between py-2 border-b">
              <span className="font-semibold">Nombre total d'hôtes:</span>
              <span>{guestCount} personne(s)</span>
            </div>
          </div>
        </div>

        <div>
          <h3 className="font-bold text-lg mb-3 border-b-2 pb-2">Détails des chambres</h3>
          <div className="space-y-3">
            {bookingData?.rooms && bookingData.rooms.length > 0 ? (
              bookingData.rooms.map((room: any, index: number) => {
                const roomGuests = bookingData?.searchParams?.rooms?.[index]
                const adults = roomGuests?.adults || 0
                const childrenCount = roomGuests?.children?.length || 0
                const childrenAges = roomGuests?.children || []
                const boardingType = room.selectedBoarding || room.boardingType || 'À compléter'
                
                return (
                  <div key={index} className="bg-muted/50 rounded-lg p-4 border border-border">
                    <h4 className="font-semibold text-primary mb-3">
                      Chambre {index + 1}: {room.name}
                    </h4>
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span className="font-medium text-muted-foreground">Adultes:</span>
                        <span>{adults}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="font-medium text-muted-foreground">Enfants:</span>
                        <span>
                          {childrenCount}
                          {childrenAges.length > 0 && ` (âges: ${childrenAges.join(', ')} ans)`}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="font-medium text-muted-foreground">Type de pension:</span>
                        <span className="font-medium">{boardingType}</span>
                      </div>
                    </div>
                  </div>
                )
              })
            ) : (
              <div className="bg-muted/50 rounded-lg p-4 border border-border">
                <h4 className="font-semibold text-primary mb-3">Chambre</h4>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="font-medium text-muted-foreground">Adultes:</span>
                    <span>{bookingData?.searchParams?.rooms?.[0]?.adults || 0}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="font-medium text-muted-foreground">Enfants:</span>
                    <span>{bookingData?.searchParams?.rooms?.[0]?.children?.length || 0}</span>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        <Separator />

        <div className="text-center text-xs text-muted-foreground space-y-1 pt-4">
          <p className="font-semibold">American Tours - Facilitateur de loisir en Tunisie</p>
          <p>Email: resamericantours@gmail.com | Tel/WA: +216 51 613 888</p>
          <p className="text-primary">Ce voucher doit être présenté à l'hôtel lors de votre arrivée</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <Card className="max-w-lg w-full">
        <CardContent className="pt-12 pb-12 text-center">
          <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <CheckCircle size={48} className="text-green-600" weight="fill" />
          </div>
          
          <h1 className="text-3xl font-bold mb-4">Réservation confirmée !</h1>
          
          <p className="text-muted-foreground mb-6">
            Votre réservation a été effectuée avec succès. Un email de confirmation a été envoyé.
          </p>

          <div className="bg-muted rounded-lg p-6 mb-8">
            <div className="text-sm text-muted-foreground mb-2">Référence de réservation</div>
            <div className="text-3xl font-bold text-primary">{reference}</div>
          </div>

          <div className="space-y-3">
            <Button className="w-full" size="lg" onClick={onHome}>
              Retour à l'accueil
            </Button>
            <div className="grid grid-cols-2 gap-3">
              <Button 
                variant="outline" 
                className="w-full" 
                size="lg"
                onClick={() => setShowVoucher(true)}
              >
                <Eye size={18} className="mr-2" />
                Voir
              </Button>
              <Button 
                variant="outline" 
                className="w-full" 
                size="lg"
                onClick={handleDownloadVoucher}
              >
                <Download size={18} className="mr-2" />
                Télécharger
              </Button>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <Button 
                variant="outline" 
                className="w-full" 
                size="lg"
                onClick={handleAddToAppleWallet}
              >
                <Wallet size={18} className="mr-2" />
                Apple Wallet
              </Button>
              <Button 
                variant="outline" 
                className="w-full" 
                size="lg"
                onClick={handleAddToGoogleWallet}
              >
                <Wallet size={18} className="mr-2" />
                Google Wallet
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      <Dialog open={showVoucher} onOpenChange={setShowVoucher}>
        <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center justify-between">
              <span>Voucher de réservation</span>
              <Button variant="outline" size="sm" onClick={handlePrintVoucher}>
                <Printer size={18} className="mr-2" />
                Imprimer
              </Button>
            </DialogTitle>
          </DialogHeader>
          <VoucherPreview />
        </DialogContent>
      </Dialog>
    </div>
  )
}
