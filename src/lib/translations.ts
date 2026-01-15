import { Language } from '@/types'

type TranslationKey = 
  | 'nav.hotels'
  | 'nav.destinations'
  | 'nav.deals'
  | 'nav.about'
  | 'nav.contact'
  | 'nav.signIn'
  | 'nav.register'
  | 'nav.myBookings'
  | 'hero.title'
  | 'hero.subtitle'
  | 'search.searchByCity'
  | 'search.searchByHotel'
  | 'search.selectCity'
  | 'search.hotelName'
  | 'search.checkIn'
  | 'search.checkOut'
  | 'search.guests'
  | 'search.rooms'
  | 'search.adults'
  | 'search.children'
  | 'search.searchHotels'
  | 'common.from'
  | 'common.perNight'
  | 'common.viewDetails'
  | 'common.loading'
  | 'common.currency'

const translations: Record<Language, Record<TranslationKey, string>> = {
  fr: {
    'nav.hotels': 'Hôtels',
    'nav.destinations': 'Destinations',
    'nav.deals': 'Offres',
    'nav.about': 'À propos',
    'nav.contact': 'Contact',
    'nav.signIn': 'Se connecter',
    'nav.register': 'S\'inscrire',
    'nav.myBookings': 'Mes réservations',
    'hero.title': 'Découvrez les plus beaux hôtels de Tunisie',
    'hero.subtitle': 'Réservez votre séjour au meilleur prix',
    'search.searchByCity': 'Recherche par ville',
    'search.searchByHotel': 'Recherche par hôtel',
    'search.selectCity': 'Sélectionner une ville',
    'search.hotelName': 'Nom de l\'hôtel',
    'search.checkIn': 'Date d\'arrivée',
    'search.checkOut': 'Date de départ',
    'search.guests': 'Voyageurs',
    'search.rooms': 'Chambres',
    'search.adults': 'Adultes',
    'search.children': 'Enfants',
    'search.searchHotels': 'Rechercher',
    'common.from': 'À partir de',
    'common.perNight': 'par nuit',
    'common.viewDetails': 'Voir les détails',
    'common.loading': 'Chargement...',
    'common.currency': 'TND',
  },
  en: {
    'nav.hotels': 'Hotels',
    'nav.destinations': 'Destinations',
    'nav.deals': 'Deals',
    'nav.about': 'About',
    'nav.contact': 'Contact',
    'nav.signIn': 'Sign In',
    'nav.register': 'Register',
    'nav.myBookings': 'My Bookings',
    'hero.title': 'Discover the most beautiful hotels in Tunisia',
    'hero.subtitle': 'Book your stay at the best price',
    'search.searchByCity': 'Search by city',
    'search.searchByHotel': 'Search by hotel',
    'search.selectCity': 'Select a city',
    'search.hotelName': 'Hotel name',
    'search.checkIn': 'Check-in',
    'search.checkOut': 'Check-out',
    'search.guests': 'Guests',
    'search.rooms': 'Rooms',
    'search.adults': 'Adults',
    'search.children': 'Children',
    'search.searchHotels': 'Search',
    'common.from': 'From',
    'common.perNight': 'per night',
    'common.viewDetails': 'View Details',
    'common.loading': 'Loading...',
    'common.currency': 'TND',
  },
  ar: {
    'nav.hotels': 'الفنادق',
    'nav.destinations': 'الوجهات',
    'nav.deals': 'العروض',
    'nav.about': 'من نحن',
    'nav.contact': 'اتصل بنا',
    'nav.signIn': 'تسجيل الدخول',
    'nav.register': 'التسجيل',
    'nav.myBookings': 'حجوزاتي',
    'hero.title': 'اكتشف أجمل الفنادق في تونس',
    'hero.subtitle': 'احجز إقامتك بأفضل سعر',
    'search.searchByCity': 'البحث حسب المدينة',
    'search.searchByHotel': 'البحث حسب الفندق',
    'search.selectCity': 'اختر مدينة',
    'search.hotelName': 'اسم الفندق',
    'search.checkIn': 'تاريخ الوصول',
    'search.checkOut': 'تاريخ المغادرة',
    'search.guests': 'المسافرون',
    'search.rooms': 'الغرف',
    'search.adults': 'البالغون',
    'search.children': 'الأطفال',
    'search.searchHotels': 'بحث',
    'common.from': 'ابتداءً من',
    'common.perNight': 'لكل ليلة',
    'common.viewDetails': 'عرض التفاصيل',
    'common.loading': 'جاري التحميل...',
    'common.currency': 'دينار',
  },
}

export const t = (key: TranslationKey, language: Language = 'fr'): string => {
  return translations[language][key] || key
}

export const useTranslation = (language: Language = 'fr') => {
  return (key: TranslationKey) => t(key, language)
}
