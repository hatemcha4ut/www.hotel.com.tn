import { Card, CardContent } from '@/components/ui/card'
import { CheckCircle, CreditCard, Shield } from '@phosphor-icons/react'

const features = [
  {
    icon: CheckCircle,
    title: 'Meilleurs Prix',
    description: 'Garantie du meilleur tarif pour votre réservation',
  },
  {
    icon: Shield,
    title: 'Confirmation Instantanée',
    description: 'Recevez votre confirmation immédiatement par email',
  },
  {
    icon: CreditCard,
    title: 'Paiement Sécurisé',
    description: 'Vos données sont protégées et sécurisées',
  },
]

export function WhyBookWithUs() {
  return (
    <section className="py-16 bg-muted/30">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">Pourquoi réserver avec nous ?</h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Profitez d'une expérience de réservation simple et sécurisée
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {features.map((feature, index) => {
            const Icon = feature.icon
            return (
              <Card key={index} className="text-center hover:shadow-lg transition-shadow">
                <CardContent className="pt-8 pb-8">
                  <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Icon size={32} className="text-primary" weight="fill" />
                  </div>
                  <h3 className="text-xl font-semibold mb-2">{feature.title}</h3>
                  <p className="text-muted-foreground">{feature.description}</p>
                </CardContent>
              </Card>
            )
          })}
        </div>
      </div>
    </section>
  )
}
