import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { CheckCircle } from '@phosphor-icons/react'

interface ConfirmationPageProps {
  reference: string
  onHome: () => void
}

export function ConfirmationPage({ reference, onHome }: ConfirmationPageProps) {
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
            <Button variant="outline" className="w-full" size="lg">
              Télécharger le voucher
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
