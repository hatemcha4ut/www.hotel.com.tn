import hotelCitiesLogo from '@/assets/images/hotel-cities-logo.svg'

export function Footer() {
  return (
    <footer className="bg-foreground text-background py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
          <div>
            <div className="flex items-center gap-3 mb-4">
              <img src={hotelCitiesLogo} alt="Hotel Cities" className="w-12 h-12 rounded-lg" />
            </div>
            <p className="text-background/80 text-sm">
              American Tours - Facilitateur de loisir en Tunisie.
            </p>
          </div>

          <div>
            <h4 className="font-semibold mb-4">Liens Rapides</h4>
            <ul className="space-y-2 text-sm text-background/80">
              <li><a href="#hotels" className="hover:text-background transition-colors">Hôtels</a></li>
              <li><a href="#destinations" className="hover:text-background transition-colors">Destinations</a></li>
              <li><a href="#deals" className="hover:text-background transition-colors">Offres</a></li>
              <li><a href="#about" className="hover:text-background transition-colors">À propos</a></li>
            </ul>
          </div>

          <div>
            <h4 className="font-semibold mb-4">Assistance</h4>
            <ul className="space-y-2 text-sm text-background/80">
              <li><a href="#faq" className="hover:text-background transition-colors">FAQ</a></li>
              <li><a href="#contact" className="hover:text-background transition-colors">Contact</a></li>
              <li><a href="#terms" className="hover:text-background transition-colors">Conditions</a></li>
              <li><a href="#privacy" className="hover:text-background transition-colors">Confidentialité</a></li>
            </ul>
          </div>

          <div>
            <h4 className="font-semibold mb-4">Contact</h4>
            <ul className="space-y-2 text-sm text-background/80">
              <li>Email: resamericantours@gmail.com</li>
              <li>Tel / WA Business: +216 51 613 888</li>
              <li>Address: American Tours HQ</li>
              <li>Tunisia</li>
            </ul>
          </div>
        </div>

        <div className="border-t border-background/20 pt-8 text-center text-sm text-background/80">
          <p>&copy; {new Date().getFullYear()} Hotel Cities American Tours. All rights reserved.</p>
        </div>
      </div>
    </footer>
  )
}
