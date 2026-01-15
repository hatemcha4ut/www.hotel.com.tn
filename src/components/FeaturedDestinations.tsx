import { Card, CardContent } from '@/components/ui/card'

const destinations = [
  {
    id: '1',
    name: 'Tunis',
    image: 'https://images.unsplash.com/photo-1591604129939-f1efa4d9f7fa?w=400&h=300&fit=crop',
    hotels: 45,
  },
  {
    id: '2',
    name: 'Sousse',
    image: 'https://images.unsplash.com/photo-1512100356356-de1b84283e18?w=400&h=300&fit=crop',
    hotels: 38,
  },
  {
    id: '3',
    name: 'Hammamet',
    image: 'https://images.unsplash.com/photo-1559827260-dc66d52bef19?w=400&h=300&fit=crop',
    hotels: 52,
  },
  {
    id: '4',
    name: 'Djerba',
    image: 'https://images.unsplash.com/photo-1583417319070-4a69db38a482?w=400&h=300&fit=crop',
    hotels: 41,
  },
  {
    id: '5',
    name: 'Monastir',
    image: 'https://images.unsplash.com/photo-1558447193-89d0c4e9c3ba?w=400&h=300&fit=crop',
    hotels: 28,
  },
]

export function FeaturedDestinations() {
  return (
    <section className="py-16 bg-background" id="destinations">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">Destinations Populaires</h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Explorez les plus belles destinations de Tunisie
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-6">
          {destinations.map((dest) => (
            <Card
              key={dest.id}
              className="overflow-hidden cursor-pointer hover:shadow-lg transition-all duration-300 hover:scale-105"
            >
              <div className="relative h-48">
                <img
                  src={dest.image}
                  alt={dest.name}
                  className="w-full h-full object-cover"
                  loading="lazy"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                <div className="absolute bottom-4 left-4 text-white">
                  <h3 className="text-xl font-bold mb-1">{dest.name}</h3>
                  <p className="text-sm text-white/90">{dest.hotels} hôtels</p>
                </div>
              </div>
            </Card>
          ))}
        </div>
      </div>
    </section>
  )
}
