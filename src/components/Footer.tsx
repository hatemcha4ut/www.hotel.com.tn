import hotelCitiesLogo from '@/assets/images/logo hotel.com.tn.svg'

interface FooterProps {
  onNavigate?: (page: string) => void
}

export function Footer({ onNavigate }: FooterProps) {
  const handleClick = (e: React.MouseEvent<HTMLAnchorElement>, page: string) => {
    if (onNavigate) {
      e.preventDefault()
      onNavigate(page)
    }
  }

  return (
    <footer className="bg-foreground text-background py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
          <div>
            <div className="flex items-center gap-3 mb-4">
              <img src={hotelCitiesLogo} alt="www.hotel.com.tn" className="h-14 w-auto rounded-lg" />
            </div>
            <p className="text-background/80 text-sm">
              Par American Tours - Facilitateur de loisir en Tunisie.
            </p>
          </div>

          <div>
            <h4 className="font-semibold mb-4">Liens Rapides</h4>
            <ul className="space-y-2 text-sm text-background/80">
              <li><a href="#hotels" className="hover:text-background transition-colors">Hôtels</a></li>
              <li><a href="#destinations" className="hover:text-background transition-colors">Destinations</a></li>
              <li><a href="#deals" className="hover:text-background transition-colors">Offres</a></li>
            </ul>
          </div>

          <div>
            <h4 className="font-semibold mb-4">Informations Légales</h4>
            <ul className="space-y-2 text-sm text-background/80">
              <li>
                <a 
                  href="#contact" 
                  className="hover:text-background transition-colors cursor-pointer"
                  onClick={(e) => handleClick(e, 'contact')}
                >
                  Contact
                </a>
              </li>
              <li>
                <a 
                  href="#terms" 
                  className="hover:text-background transition-colors cursor-pointer"
                  onClick={(e) => handleClick(e, 'terms')}
                >
                  Conditions Générales
                </a>
              </li>
              <li>
                <a 
                  href="#privacy" 
                  className="hover:text-background transition-colors cursor-pointer"
                  onClick={(e) => handleClick(e, 'privacy')}
                >
                  Politique de Confidentialité
                </a>
              </li>
            </ul>
          </div>

          <div>
            <h4 className="font-semibold mb-4">Contact</h4>
            <ul className="space-y-2 text-sm text-background/80">
              <li>
                <a href="mailto:resamericantours@gmail.com" className="hover:text-background transition-colors">
                  resamericantours@gmail.com
                </a>
              </li>
              <li>
                <a href="tel:+21651613888" className="hover:text-background transition-colors">
                  +216 51 613 888
                </a>
              </li>
              <li>Tel / WA Business</li>
              <li>American Tours HQ, Tunisia</li>
            </ul>
          </div>
        </div>

        <div className="border-t border-background/20 pt-8 text-center text-sm text-background/80">
          <p>&copy; {new Date().getFullYear()} www.hotel.com.tn - American Tours. All rights reserved.</p>
        </div>
      </div>
    </footer>
  )
}
