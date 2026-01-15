import { useState } from 'react'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Separator } from '@/components/ui/separator'
import { CheckCircle, Download, Eye, Printer } from '@phosphor-icons/react'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { toast } from 'sonner'

interface ConfirmationPageProps {
  reference: string
  onHome: () => void
}

export function ConfirmationPage({ reference, onHome }: ConfirmationPageProps) {
  const [showVoucher, setShowVoucher] = useState(false)

  const handleDownloadVoucher = () => {
    toast.success('Téléchargement du voucher...')
    const voucherContent = generateVoucherContent()
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

  const handlePrintVoucher = () => {
    window.print()
  }

  const generateVoucherContent = () => {
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
          .footer { margin-top: 50px; text-align: center; font-size: 12px; color: #666; }
          @media print { body { padding: 20px; } }
        </style>
      </head>
      <body>
        <div class="header">
          <div class="logo">Hotel Cities by American Tours</div>
          <p>Voucher de Réservation</p>
        </div>
        
        <div class="voucher-id">Référence: ${reference}</div>
        
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
        </div>
        
        <div class="section">
          <div class="section-title">Détails du séjour</div>
          <div class="info-row">
            <div class="info-label">Hôtel:</div>
            <div class="info-value">À compléter</div>
          </div>
          <div class="info-row">
            <div class="info-label">Date d'arrivée:</div>
            <div class="info-value">À compléter</div>
          </div>
          <div class="info-row">
            <div class="info-label">Date de départ:</div>
            <div class="info-value">À compléter</div>
          </div>
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

  const VoucherPreview = () => (
    <div className="space-y-6 p-6 bg-white">
      <div className="text-center border-b-4 border-primary pb-6">
        <h2 className="text-2xl font-bold text-primary mb-2">Hotel Cities by American Tours</h2>
        <p className="text-muted-foreground">Voucher de Réservation</p>
      </div>

      <div className="text-center py-4 bg-primary/5 rounded-lg">
        <p className="text-sm text-muted-foreground mb-2">Référence de réservation</p>
        <p className="text-4xl font-bold text-primary">{reference}</p>
      </div>

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
        </div>
      </div>

      <div>
        <h3 className="font-bold text-lg mb-3 border-b-2 pb-2">Détails du séjour</h3>
        <div className="space-y-2 text-sm">
          <div className="flex justify-between py-2 border-b">
            <span className="font-semibold">Hôtel:</span>
            <span>À compléter</span>
          </div>
          <div className="flex justify-between py-2 border-b">
            <span className="font-semibold">Date d'arrivée:</span>
            <span>À compléter</span>
          </div>
          <div className="flex justify-between py-2 border-b">
            <span className="font-semibold">Date de départ:</span>
            <span>À compléter</span>
          </div>
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
                Voir le voucher
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
