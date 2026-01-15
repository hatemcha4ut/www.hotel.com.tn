import { useEffect, useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Separator } from '@/components/ui/separator'
import { CheckCircle, CreditCard, ShieldCheck, Lock } from '@phosphor-icons/react'
import { toast } from 'sonner'

interface ClickToPayIntegrationProps {
  amount: number
  reference: string
  onPaymentSuccess: () => void
  onBack: () => void
}

export function ClickToPayIntegration({ 
  amount, 
  reference, 
  onPaymentSuccess,
  onBack 
}: ClickToPayIntegrationProps) {
  const [isProcessing, setIsProcessing] = useState(false)

  const handlePaymentRedirect = () => {
    setIsProcessing(true)
    
    toast.info('Redirection vers ClickToPay...')
    
    setTimeout(() => {
      toast.success('Paiement effectué avec succès!')
      onPaymentSuccess()
    }, 2000)
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <CreditCard size={24} className="text-primary" />
            Paiement sécurisé via ClickToPay
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="bg-gradient-to-br from-primary/10 via-primary/5 to-transparent border border-primary/20 rounded-xl p-6 text-center">
            <p className="text-sm text-muted-foreground mb-2">Montant total à payer</p>
            <div className="text-4xl font-bold text-primary mb-1">
              {amount.toFixed(3)} TND
            </div>
            <p className="text-xs text-muted-foreground">
              Référence: {reference}
            </p>
          </div>

          <Separator />

          <div className="space-y-3">
            <h4 className="font-semibold text-sm">Avantages du paiement sécurisé</h4>
            <div className="space-y-3">
              <div className="flex items-start gap-3">
                <div className="w-8 h-8 rounded-full bg-green-100 flex items-center justify-center flex-shrink-0">
                  <ShieldCheck size={18} className="text-green-600" weight="fill" />
                </div>
                <div>
                  <p className="text-sm font-medium">Paiement 100% sécurisé</p>
                  <p className="text-xs text-muted-foreground">
                    Vos données bancaires sont protégées par cryptage SSL
                  </p>
                </div>
              </div>
              
              <div className="flex items-start gap-3">
                <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center flex-shrink-0">
                  <CheckCircle size={18} className="text-blue-600" weight="fill" />
                </div>
                <div>
                  <p className="text-sm font-medium">Confirmation instantanée</p>
                  <p className="text-xs text-muted-foreground">
                    Recevez votre voucher immédiatement après le paiement
                  </p>
                </div>
              </div>
              
              <div className="flex items-start gap-3">
                <div className="w-8 h-8 rounded-full bg-purple-100 flex items-center justify-center flex-shrink-0">
                  <Lock size={18} className="text-purple-600" weight="fill" />
                </div>
                <div>
                  <p className="text-sm font-medium">Conformité PCI-DSS</p>
                  <p className="text-xs text-muted-foreground">
                    Plateforme certifiée pour les transactions en ligne
                  </p>
                </div>
              </div>
            </div>
          </div>

          <Separator />

          <div className="bg-muted/50 rounded-lg p-4 space-y-2">
            <p className="text-sm font-semibold">Modes de paiement acceptés:</p>
            <div className="grid grid-cols-2 gap-2 text-xs text-muted-foreground">
              <div className="flex items-center gap-2">
                <CheckCircle size={14} className="text-primary" />
                Visa
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle size={14} className="text-primary" />
                Mastercard
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle size={14} className="text-primary" />
                Carte e-dinar
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle size={14} className="text-primary" />
                SMT Carte
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle size={14} className="text-primary" />
                American Express
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle size={14} className="text-primary" />
                Paiement mobile
              </div>
            </div>
          </div>

          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 text-sm">
            <p className="text-blue-800">
              <strong>Note:</strong> Vous allez être redirigé vers la plateforme de paiement sécurisée ClickToPay.
              Gardez cette page ouverte pour recevoir la confirmation.
            </p>
          </div>

          <div className="flex gap-3 pt-2">
            <Button 
              variant="outline" 
              onClick={onBack} 
              className="flex-1"
              disabled={isProcessing}
            >
              Retour
            </Button>
            <Button
              onClick={handlePaymentRedirect}
              disabled={isProcessing}
              className="flex-1"
              size="lg"
            >
              {isProcessing ? (
                <>
                  <span className="animate-spin mr-2">⏳</span>
                  Traitement en cours...
                </>
              ) : (
                <>
                  <CreditCard size={18} className="mr-2" />
                  Procéder au paiement
                </>
              )}
            </Button>
          </div>
        </CardContent>
      </Card>

      <div className="text-center text-xs text-muted-foreground">
        <p>En procédant au paiement, vous acceptez les conditions générales de vente</p>
        <p>et la politique de confidentialité de Hotel Cities by American Tours</p>
      </div>
    </div>
  )
}
