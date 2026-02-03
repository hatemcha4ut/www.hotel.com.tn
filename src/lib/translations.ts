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
  | 'search.room'
  | 'search.adults'
  | 'search.children'
  | 'search.childAge'
  | 'search.addRoom'
  | 'search.removeRoom'
  | 'search.searchHotels'
  | 'search.errorMessage'
  | 'common.from'
  | 'common.perNight'
  | 'common.viewDetails'
  | 'common.viewAvailability'
  | 'common.loading'
  | 'common.currency'
  | 'common.starsRating'

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
    'search.guests': 'Nombre d\'hôtes',
    'search.rooms': 'Chambres',
    'search.room': 'Chambre',
    'search.adults': 'Adultes',
    'search.children': 'Enfants',
    'search.childAge': 'Âge de l\'enfant',
    'search.addRoom': 'Ajouter une chambre',
    'search.removeRoom': 'Supprimer',
    'search.searchHotels': 'Rechercher',
    'search.errorMessage': 'Une erreur est survenue. Veuillez réessayer.',
    'common.from': 'À partir de',
    'common.perNight': 'par nuit',
    'common.viewDetails': 'Voir les détails',
    'common.viewAvailability': 'Voir Disponibilité',
    'common.loading': 'Chargement...',
    'common.currency': 'TND',
    'common.starsRating': '{stars} sur 5 étoiles',
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
    'search.guests': 'Number of guests',
    'search.rooms': 'Rooms',
    'search.room': 'Room',
    'search.adults': 'Adults',
    'search.children': 'Children',
    'search.childAge': 'Child age',
    'search.addRoom': 'Add room',
    'search.removeRoom': 'Remove',
    'search.searchHotels': 'Search',
    'search.errorMessage': 'Something went wrong. Please try again.',
    'common.from': 'From',
    'common.perNight': 'per night',
    'common.viewDetails': 'View Details',
    'common.viewAvailability': 'View Availability',
    'common.loading': 'Loading...',
    'common.currency': 'TND',
    'common.starsRating': '{stars} out of 5 stars',
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
    'search.guests': 'عدد الضيوف',
    'search.rooms': 'الغرف',
    'search.room': 'غرفة',
    'search.adults': 'البالغون',
    'search.children': 'الأطفال',
    'search.childAge': 'عمر الطفل',
    'search.addRoom': 'إضافة غرفة',
    'search.removeRoom': 'حذف',
    'search.searchHotels': 'بحث',
    'search.errorMessage': 'حدث خطأ. يرجى المحاولة مرة أخرى.',
    'common.from': 'ابتداءً من',
    'common.perNight': 'لكل ليلة',
    'common.viewDetails': 'عرض التفاصيل',
    'common.viewAvailability': 'عرض التوفر',
    'common.loading': 'جاري التحميل...',
    'common.currency': 'دينار',
    'common.starsRating': '{stars} من 5 نجوم',
  },
}

export const t = (key: TranslationKey, language: Language = 'fr'): string => {
  return translations[language][key] || key
}

export const useTranslation = (language: Language = 'fr') => {
  return (key: TranslationKey) => t(key, language)
}
