export function Footer() {
  return (
    <footer className="bg-foreground text-background py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
          <div>
            <h3 className="text-lg font-bold mb-4">TunisBooking</h3>
            <p className="text-background/80 text-sm">
              Votre partenaire de confiance pour la réservation d'hôtels en Tunisie.
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
              <li>Email: contact@tunisbooking.tn</li>
              <li>Tél: +216 70 123 456</li>
              <li>Adresse: Avenue Habib Bourguiba</li>
              <li>Tunis, Tunisie</li>
            </ul>
          </div>
        </div>

        <div className="border-t border-background/20 pt-8 text-center text-sm text-background/80">
          <p>&copy; {new Date().getFullYear()} TunisBooking. Tous droits réservés.</p>
        </div>
      </div>
    </footer>
  )
}
