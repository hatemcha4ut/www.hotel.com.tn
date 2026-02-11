import { Hotel, City, Room } from '@/types'

// Note: API calls should go through Supabase Edge Functions for security
// Direct API calls with credentials are removed to prevent credential exposure

const mockCities: City[] = [
  { id: '1', name: 'Tunis', country: 'Tunisia' },
  { id: '2', name: 'Sousse', country: 'Tunisia' },
  { id: '3', name: 'Hammamet', country: 'Tunisia' },
  { id: '4', name: 'Djerba', country: 'Tunisia' },
  { id: '5', name: 'Monastir', country: 'Tunisia' },
  { id: '6', name: 'Mahdia', country: 'Tunisia' },
  { id: '7', name: 'Tozeur', country: 'Tunisia' },
  { id: '8', name: 'Sfax', country: 'Tunisia' },
]

const mockHotels: Hotel[] = [
  {
    id: '1',
    name: 'Hôtel La Badira',
    city: 'Hammamet',
    address: 'Zone Touristique, Hammamet',
    stars: 5,
    rating: 4.8,
    reviewCount: 342,
    description: 'Un complexe hôtelier de luxe sur la plage avec spa de classe mondiale, plusieurs restaurants gastronomiques et architecture mauresque élégante.',
    image: 'https://images.unsplash.com/photo-1566073771259-6a8506099945?w=800&h=600&fit=crop',
    images: [
      'https://images.unsplash.com/photo-1566073771259-6a8506099945?w=800&h=600&fit=crop',
      'https://images.unsplash.com/photo-1582719508461-905c673771fd?w=800&h=600&fit=crop',
      'https://images.unsplash.com/photo-1571896349842-33c89424de2d?w=800&h=600&fit=crop',
      'https://images.unsplash.com/photo-1584132967334-10e028bd69f7?w=800&h=600&fit=crop',
    ],
    price: 224,
    amenities: ['WiFi', 'Piscine', 'Spa', 'Restaurant', 'Bar', 'Plage privée', 'Salle de sport', 'Parking'],
    boardingType: ['Petit-déjeuner', 'Demi-pension', 'Pension complète', 'All Inclusive'],
    latitude: 36.4,
    longitude: 10.62,
    checkInTime: '15:00',
    checkOutTime: '12:00',
    promotion: {
      discount: 20,
      label: 'Offre Spéciale Été',
      validUntil: '31 Août 2024',
      originalPrice: 280
    }
  },
  {
    id: '2',
    name: 'Mövenpick Resort & Marine Spa',
    city: 'Sousse',
    address: 'BP 71 Port El Kantaoui, Sousse',
    stars: 5,
    rating: 4.6,
    reviewCount: 567,
    description: 'Resort luxueux en bord de mer offrant des chambres élégantes, un spa marin primé et un accès direct à la marina.',
    image: 'https://images.unsplash.com/photo-1551882547-ff40c63fe5fa?w=800&h=600&fit=crop',
    images: [
      'https://images.unsplash.com/photo-1551882547-ff40c63fe5fa?w=800&h=600&fit=crop',
      'https://images.unsplash.com/photo-1568084680786-a84f91d1153c?w=800&h=600&fit=crop',
      'https://images.unsplash.com/photo-1571003123894-1f0594d2b5d9?w=800&h=600&fit=crop',
    ],
    price: 256,
    amenities: ['WiFi', 'Piscine', 'Spa', 'Restaurant', 'Club enfants', 'Plage privée', 'Tennis'],
    boardingType: ['Petit-déjeuner', 'Demi-pension', 'All Inclusive'],
    latitude: 35.895,
    longitude: 10.605,
    checkInTime: '14:00',
    checkOutTime: '12:00',
    promotion: {
      discount: 20,
      label: 'Réservez tôt et économisez',
      validUntil: '30 Septembre 2024',
      originalPrice: 320
    }
  },
  {
    id: '3',
    name: 'Dar El Jeld Hotel & Spa',
    city: 'Tunis',
    address: '5-10 Rue Dar El Jeld, Medina, Tunis',
    stars: 5,
    rating: 4.9,
    reviewCount: 189,
    description: 'Boutique hôtel historique dans la médina avec architecture traditionnelle, spa hammam et cuisine tunisienne authentique.',
    image: 'https://images.unsplash.com/photo-1520250497591-112f2f40a3f4?w=800&h=600&fit=crop',
    images: [
      'https://images.unsplash.com/photo-1520250497591-112f2f40a3f4?w=800&h=600&fit=crop',
      'https://images.unsplash.com/photo-1578683010236-d716f9a3f461?w=800&h=600&fit=crop',
    ],
    price: 195,
    amenities: ['WiFi', 'Spa', 'Restaurant', 'Hammam', 'Terrasse', 'Parking'],
    boardingType: ['Petit-déjeuner', 'Demi-pension'],
    latitude: 36.8065,
    longitude: 10.1815,
    checkInTime: '15:00',
    checkOutTime: '11:00',
  },
  {
    id: '4',
    name: 'Radisson Blu Palace Resort & Thalasso',
    city: 'Djerba',
    address: 'Zone Touristique Houmt Souk, Djerba',
    stars: 5,
    rating: 4.7,
    reviewCount: 823,
    description: 'Resort tout compris avec centre de thalassothérapie, multiple piscines et accès direct à une plage de sable blanc.',
    image: 'https://images.unsplash.com/photo-1549294413-26f195200c16?w=800&h=600&fit=crop',
    images: [
      'https://images.unsplash.com/photo-1549294413-26f195200c16?w=800&h=600&fit=crop',
      'https://images.unsplash.com/photo-1596436889106-be35e843f974?w=800&h=600&fit=crop',
      'https://images.unsplash.com/photo-1602002418816-5c0aeef426aa?w=800&h=600&fit=crop',
    ],
    price: 196,
    amenities: ['WiFi', 'Piscine', 'Spa', 'Restaurant', 'Bar', 'Plage privée', 'Club enfants', 'Animation'],
    boardingType: ['Demi-pension', 'Pension complète', 'All Inclusive'],
    latitude: 33.8076,
    longitude: 10.8451,
    checkInTime: '15:00',
    checkOutTime: '12:00',
    promotion: {
      discount: 20,
      label: 'Séjour Famille - 20% Off',
      validUntil: '15 Septembre 2024',
      originalPrice: 245
    }
  },
  {
    id: '5',
    name: 'Iberostar Selection Kuriat Palace',
    city: 'Monastir',
    address: 'Route Touristique Skanes, Monastir',
    stars: 5,
    rating: 4.5,
    reviewCount: 445,
    description: 'Complexe familial all-inclusive avec parc aquatique, plusieurs restaurants à thème et animations quotidiennes.',
    image: 'https://images.unsplash.com/photo-1564501049412-61c2a3083791?w=800&h=600&fit=crop',
    images: [
      'https://images.unsplash.com/photo-1564501049412-61c2a3083791?w=800&h=600&fit=crop',
      'https://images.unsplash.com/photo-1562790351-d273a961e0e9?w=800&h=600&fit=crop',
    ],
    price: 168,
    amenities: ['WiFi', 'Piscine', 'Parc aquatique', 'Restaurant', 'Club enfants', 'Plage', 'Animation', 'Salle de sport'],
    boardingType: ['All Inclusive'],
    latitude: 35.7753,
    longitude: 10.8263,
    checkInTime: '14:00',
    checkOutTime: '12:00',
    promotion: {
      discount: 20,
      label: 'Vacances d\'été All Inclusive',
      validUntil: '31 Août 2024',
      originalPrice: 210
    }
  },
  {
    id: '6',
    name: 'The Residence Tunis',
    city: 'Tunis',
    address: 'Les Côtes de Carthage, Gammarth, Tunis',
    stars: 5,
    rating: 4.8,
    reviewCount: 276,
    description: 'Hôtel de luxe en bord de mer inspiré du palais tunisien du 19ème siècle avec jardins tropicaux luxuriants.',
    image: 'https://images.unsplash.com/photo-1559508551-44bff1de756b?w=800&h=600&fit=crop',
    images: [
      'https://images.unsplash.com/photo-1559508551-44bff1de756b?w=800&h=600&fit=crop',
      'https://images.unsplash.com/photo-1584132915807-e9d0c96a3702?w=800&h=600&fit=crop',
    ],
    price: 350,
    amenities: ['WiFi', 'Piscine', 'Spa', 'Restaurant', 'Bar', 'Plage privée', 'Golf', 'Casino'],
    boardingType: ['Petit-déjeuner', 'Demi-pension', 'Pension complète'],
    latitude: 37.0892,
    longitude: 10.2896,
    checkInTime: '16:00',
    checkOutTime: '12:00',
  },
  {
    id: '7',
    name: 'Hasdrubal Thalassa & Spa',
    city: 'Hammamet',
    address: 'Route Touristique, Yasmine Hammamet',
    stars: 5,
    rating: 4.6,
    reviewCount: 521,
    description: 'Resort en bord de mer avec centre de thalassothérapie primé, piscines chauffées et architecture contemporaine.',
    image: 'https://images.unsplash.com/photo-1571896349842-33c89424de2d?w=800&h=600&fit=crop',
    images: [
      'https://images.unsplash.com/photo-1571896349842-33c89424de2d?w=800&h=600&fit=crop',
      'https://images.unsplash.com/photo-1584132967334-10e028bd69f7?w=800&h=600&fit=crop',
    ],
    price: 212,
    amenities: ['WiFi', 'Piscine', 'Spa', 'Restaurant', 'Thalasso', 'Plage privée', 'Salle de sport'],
    boardingType: ['Petit-déjeuner', 'Demi-pension', 'Pension complète', 'All Inclusive'],
    latitude: 36.4,
    longitude: 10.6,
    checkInTime: '15:00',
    checkOutTime: '11:00',
    promotion: {
      discount: 20,
      label: 'Cure Thalasso Spéciale',
      validUntil: '30 Septembre 2024',
      originalPrice: 265
    }
  },
  {
    id: '8',
    name: 'Diar Lemdina Hotel',
    city: 'Hammamet',
    address: 'Route Touristique, Hammamet',
    stars: 4,
    rating: 4.3,
    reviewCount: 612,
    description: 'Hôtel authentique conçu comme une médina tunisienne traditionnelle avec architecture locale et ambiance chaleureuse.',
    image: 'https://images.unsplash.com/photo-1542314831-068cd1dbfeeb?w=800&h=600&fit=crop',
    images: [
      'https://images.unsplash.com/photo-1542314831-068cd1dbfeeb?w=800&h=600&fit=crop',
      'https://images.unsplash.com/photo-1566195992011-5f6b21e539aa?w=800&h=600&fit=crop',
    ],
    price: 145,
    amenities: ['WiFi', 'Piscine', 'Restaurant', 'Bar', 'Animation', 'Plage'],
    boardingType: ['Petit-déjeuner', 'Demi-pension', 'All Inclusive'],
    latitude: 36.4,
    longitude: 10.58,
    checkInTime: '14:00',
    checkOutTime: '12:00',
  },
  {
    id: '9',
    name: 'Concorde Green Park Palace',
    city: 'Tunis',
    address: 'BP 57 Les Berges du Lac, Tunis',
    stars: 5,
    rating: 4.4,
    reviewCount: 334,
    description: 'Hôtel moderne dans le quartier des affaires avec installations de conférence, spa et restaurants gastronomiques.',
    image: 'https://images.unsplash.com/photo-1551882547-ff40c63fe5fa?w=800&h=600&fit=crop',
    images: [
      'https://images.unsplash.com/photo-1551882547-ff40c63fe5fa?w=800&h=600&fit=crop',
    ],
    price: 185,
    amenities: ['WiFi', 'Piscine', 'Spa', 'Restaurant', 'Salle de sport', 'Parking', 'Centre d\'affaires'],
    boardingType: ['Petit-déjeuner', 'Demi-pension'],
    latitude: 36.8395,
    longitude: 10.2388,
    checkInTime: '15:00',
    checkOutTime: '12:00',
  },
  {
    id: '10',
    name: 'Vincci El Mansour',
    city: 'Mahdia',
    address: 'Zone Touristique, BP 68, Mahdia',
    stars: 4,
    rating: 4.5,
    reviewCount: 489,
    description: 'Resort all-inclusive avec animation dynamique, plusieurs piscines et accès direct à une plage de sable fin.',
    image: 'https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?w=800&h=600&fit=crop',
    images: [
      'https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?w=800&h=600&fit=crop',
      'https://images.unsplash.com/photo-1571003123894-1f0594d2b5d9?w=800&h=600&fit=crop',
    ],
    price: 175,
    amenities: ['WiFi', 'Piscine', 'Restaurant', 'Bar', 'Animation', 'Plage', 'Club enfants'],
    boardingType: ['All Inclusive'],
    latitude: 35.5047,
    longitude: 11.0622,
    checkInTime: '14:00',
    checkOutTime: '12:00',
  },
]

const mockRooms: Room[] = [
  {
    id: 'r1',
    name: 'Chambre Standard Double',
    bedConfig: '1 lit double',
    maxOccupancy: 2,
    size: 28,
    boardingType: 'Petit-déjeuner',
    boardingOptions: [
      { type: 'Logement seul', pricePerNight: 100, totalPrice: 300 },
      { type: 'Petit-déjeuner', pricePerNight: 120, totalPrice: 360 },
      { type: 'Demi-pension', pricePerNight: 150, totalPrice: 450 },
      { type: 'Pension complète', pricePerNight: 180, totalPrice: 540 },
      { type: 'All Inclusive', pricePerNight: 220, totalPrice: 660 },
    ],
    amenities: ['WiFi', 'Climatisation', 'TV', 'Minibar', 'Coffre-fort'],
    cancellationPolicy: 'Annulation gratuite jusqu\'à 7 jours avant l\'arrivée',
    pricePerNight: 120,
    totalPrice: 360,
    image: 'https://images.unsplash.com/photo-1611892440504-42a792e24d32?w=400&h=300&fit=crop',
  },
  {
    id: 'r2',
    name: 'Chambre Supérieure Vue Mer',
    bedConfig: '1 lit double ou 2 lits simples',
    maxOccupancy: 3,
    size: 35,
    boardingType: 'Demi-pension',
    boardingOptions: [
      { type: 'Logement seul', pricePerNight: 150, totalPrice: 450 },
      { type: 'Petit-déjeuner', pricePerNight: 180, totalPrice: 540 },
      { type: 'Demi-pension', pricePerNight: 220, totalPrice: 660 },
      { type: 'Pension complète', pricePerNight: 260, totalPrice: 780 },
      { type: 'All Inclusive', pricePerNight: 320, totalPrice: 960 },
    ],
    amenities: ['WiFi', 'Climatisation', 'TV', 'Minibar', 'Coffre-fort', 'Balcon', 'Vue mer'],
    cancellationPolicy: 'Annulation gratuite jusqu\'à 7 jours avant l\'arrivée',
    pricePerNight: 180,
    totalPrice: 540,
    image: 'https://images.unsplash.com/photo-1598928506311-c55ded91a20c?w=400&h=300&fit=crop',
  },
  {
    id: 'r3',
    name: 'Suite Junior',
    bedConfig: '1 lit king size',
    maxOccupancy: 4,
    size: 45,
    boardingType: 'All Inclusive',
    boardingOptions: [
      { type: 'Logement seul', pricePerNight: 230, totalPrice: 690 },
      { type: 'Petit-déjeuner', pricePerNight: 260, totalPrice: 780 },
      { type: 'Demi-pension', pricePerNight: 300, totalPrice: 900 },
      { type: 'Pension complète', pricePerNight: 350, totalPrice: 1050 },
      { type: 'All Inclusive', pricePerNight: 420, totalPrice: 1260 },
    ],
    amenities: ['WiFi', 'Climatisation', 'TV', 'Minibar', 'Coffre-fort', 'Balcon', 'Vue mer', 'Salon', 'Baignoire'],
    cancellationPolicy: 'Annulation gratuite jusqu\'à 14 jours avant l\'arrivée',
    pricePerNight: 280,
    totalPrice: 840,
    image: 'https://images.unsplash.com/photo-1590490360182-c33d57733427?w=400&h=300&fit=crop',
  },
]

/**
 * Maps MyGo hotel detail response to frontend Hotel type
 */
const mapHotelDetailToHotel = (detail: any): Hotel => {
  // Extract image(s)
  const images: string[] = []
  if (detail.mainPhoto || detail.MainPhoto) {
    images.push(detail.mainPhoto || detail.MainPhoto)
  }
  if (Array.isArray(detail.photos)) {
    images.push(...detail.photos.filter((p: any) => typeof p === 'string'))
  }
  if (Array.isArray(detail.Photos)) {
    images.push(...detail.Photos.filter((p: any) => typeof p === 'string'))
  }
  
  const image = images[0] || ''
  
  // Extract amenities
  const amenities: string[] = []
  if (Array.isArray(detail.amenities)) {
    amenities.push(...detail.amenities.filter((a: any) => typeof a === 'string'))
  }
  if (Array.isArray(detail.Amenities)) {
    amenities.push(...detail.Amenities.filter((a: any) => typeof a === 'string'))
  }
  
  // Extract boarding types
  const boardingType: string[] = []
  if (Array.isArray(detail.boardingTypes)) {
    boardingType.push(...detail.boardingTypes.filter((b: any) => typeof b === 'string'))
  }
  if (Array.isArray(detail.BoardingTypes)) {
    boardingType.push(...detail.BoardingTypes.filter((b: any) => typeof b === 'string'))
  }
  
  const hotelId = String(detail.id || detail.Id)
  const name = detail.name || detail.Name
  
  // Log warning if critical fields are missing
  if (!name) {
    console.warn('Hotel API response missing name field:', detail)
  }
  if (!hotelId || hotelId === 'undefined') {
    console.error('Hotel API response missing id field:', detail)
  }
  
  return {
    type: 'hotel',
    id: hotelId,
    name: name || 'Hôtel',
    city: detail.cityName || detail.CityName || detail.city || detail.City || '',
    address: detail.address || detail.Address || '',
    stars: detail.star || detail.Star || detail.stars || detail.Stars || detail.category || detail.Category || 0,
    rating: detail.rating || detail.Rating || 0,
    reviewCount: detail.reviewCount || detail.ReviewCount || 0,
    description: detail.description || detail.Description || '',
    image,
    images: images.length ? images : image ? [image] : [],
    price: detail.minPrice || detail.MinPrice || 0,
    amenities,
    boardingType,
    latitude: detail.latitude || detail.Latitude,
    longitude: detail.longitude || detail.Longitude,
    checkInTime: detail.checkInTime || detail.CheckInTime,
    checkOutTime: detail.checkOutTime || detail.CheckOutTime,
  }
}

export const api = {
  getCities: async (): Promise<City[]> => {
    await new Promise(resolve => setTimeout(resolve, 300))
    return mockCities
  },

  searchHotels: async (params: {
    cityId?: string
    hotelName?: string
    checkIn?: string
    checkOut?: string
  }): Promise<Hotel[]> => {
    await new Promise(resolve => setTimeout(resolve, 500))
    
    let filtered = [...mockHotels]
    
    if (params.cityId) {
      const city = mockCities.find(c => c.id === params.cityId)
      if (city) {
        filtered = filtered.filter(h => h.city === city.name)
      }
    }
    
    if (params.hotelName && params.hotelName.trim() !== '') {
      const searchTerm = params.hotelName
        .toLowerCase()
        .trim()
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '')
      
      filtered = filtered.filter(h => {
        const hotelName = h.name
          .toLowerCase()
          .normalize('NFD')
          .replace(/[\u0300-\u036f]/g, '')
        const cityName = h.city
          .toLowerCase()
          .normalize('NFD')
          .replace(/[\u0300-\u036f]/g, '')
        const hotelDescription = (h.description || '')
          .toLowerCase()
          .normalize('NFD')
          .replace(/[\u0300-\u036f]/g, '')
        
        return (
          hotelName.includes(searchTerm) ||
          cityName.includes(searchTerm) ||
          hotelDescription.includes(searchTerm) ||
          hotelName.split(' ').some(word => word.startsWith(searchTerm)) ||
          searchTerm.split(' ').some(term => hotelName.includes(term))
        )
      })
    }
    
    return filtered
  },

  getHotelsWithPromotions: async (): Promise<Hotel[]> => {
    await new Promise(resolve => setTimeout(resolve, 300))
    return mockHotels.filter(h => h.promotion)
  },

  getHotelDetails: async (hotelId: string): Promise<Hotel | null> => {
    try {
      // Validate hotelId before making API call
      const hotelIdNum = parseInt(hotelId)
      if (!Number.isFinite(hotelIdNum) || hotelIdNum < 1) {
        console.error('Invalid hotel ID:', hotelId)
        if (import.meta.env.DEV) {
          return mockHotels.find(h => h.id === hotelId) || null
        }
        return null
      }
      
      const response = await fetch('https://api.hotel.com.tn/hotels/detail', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ hotelId: hotelIdNum }),
      })
      
      if (!response.ok) {
        console.error('Hotel details fetch failed:', response.status)
        // Fallback to mock data for development
        if (import.meta.env.DEV) {
          return mockHotels.find(h => h.id === hotelId) || null
        }
        return null
      }
      
      const data = await response.json()
      return mapHotelDetailToHotel(data)
    } catch (error) {
      console.error('Error fetching hotel details:', error)
      // Fallback to mock data for development
      if (import.meta.env.DEV) {
        return mockHotels.find(h => h.id === hotelId) || null
      }
      return null
    }
  },

  getAvailableRooms: async (hotelId: string, roomCount?: number): Promise<Room[]> => {
    await new Promise(resolve => setTimeout(resolve, 400))
    return mockRooms
  },

  createBooking: async (bookingData: any): Promise<{ reference: string }> => {
    await new Promise(resolve => setTimeout(resolve, 800))
    const reference = 'TN' + Date.now().toString().slice(-8)
    return { reference }
  },
}
