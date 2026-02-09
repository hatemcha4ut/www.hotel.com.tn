import { useState, useEffect, useCallback } from 'react'
import { Toaster } from 'sonner'
import { AppProvider } from '@/contexts/AppContext'
import { AuthProvider } from '@/contexts/AuthContext'
import { Navbar } from '@/components/Navbar'
import { Footer } from '@/components/Footer'
import { ProtectedRoute } from '@/components/ProtectedRoute'
import { HomePage } from '@/pages/HomePage'
import { SearchResultsPage } from '@/pages/SearchResultsPage'
import { HotelDetailsPage } from '@/pages/HotelDetailsPage'
import { BookingPage } from '@/pages/BookingPage'
import { ConfirmationPage } from '@/pages/ConfirmationPage'
import { ContactPage } from '@/pages/ContactPage'
import { TermsPage } from '@/pages/TermsPage'
import { PrivacyPage } from '@/pages/PrivacyPage'
import { AdminDashboard } from '@/pages/AdminDashboard'
import { LoginPage } from '@/pages/LoginPage'
import { RegisterPage } from '@/pages/RegisterPage'
import { ForgotPasswordPage } from '@/pages/ForgotPasswordPage'
import { UpdatePasswordPage } from '@/pages/UpdatePasswordPage'
import { Hotel, Room } from '@/types'
import type { SearchHotelsResult } from '@/services/searchHotels'

type Page = 'home' | 'search' | 'hotel' | 'booking' | 'confirmation' | 'contact' | 'terms' | 'privacy' | 'admin' | 'login' | 'register' | 'forgot-password' | 'update-password'

function App() {
  const [currentPage, setCurrentPage] = useState<Page>('home')
  const [selectedHotelId, setSelectedHotelId] = useState<string>('')
  const [selectedHotel, setSelectedHotel] = useState<Hotel | null>(null)
  const [searchResults, setSearchResults] = useState<SearchHotelsResult | null>(null)
  const [selectedRoom, setSelectedRoom] = useState<Room | null>(null)
  const [selectedRooms, setSelectedRooms] = useState<Room[]>([])
  const [bookingReference, setBookingReference] = useState<string>('')

  // Helper function to check if hash is for admin page
  const isAdminHash = useCallback((hash: string) => {
    const lowerHash = hash.toLowerCase()
    return lowerHash === '#/admin' || lowerHash === '#/admin/' || lowerHash === '#admin'
  }, [])

  // Helper function to get page from hash
  const getPageFromHash = useCallback((hash: string): Page | null => {
    const lowerHash = hash.toLowerCase()
    if (isAdminHash(lowerHash)) return 'admin'
    if (lowerHash === '#/login' || lowerHash === '#login') return 'login'
    if (lowerHash === '#/register' || lowerHash === '#register') return 'register'
    if (lowerHash === '#/forgot-password' || lowerHash === '#forgot-password') return 'forgot-password'
    if (lowerHash === '#/update-password' || lowerHash === '#update-password') return 'update-password'
    if (lowerHash === '#/search' || lowerHash === '#search') return 'search'
    if (lowerHash === '#/booking' || lowerHash === '#booking') return 'booking'
    if (lowerHash === '#/confirmation' || lowerHash === '#confirmation') return 'confirmation'
    if (lowerHash === '#/contact' || lowerHash === '#contact') return 'contact'
    if (lowerHash === '#/terms' || lowerHash === '#terms') return 'terms'
    if (lowerHash === '#/privacy' || lowerHash === '#privacy') return 'privacy'
    // Check for hotel detail page with ID
    if (lowerHash.startsWith('#/hotel/') || lowerHash.startsWith('#hotel/')) {
      return 'hotel'
    }
    return null
  }, [isAdminHash])

  // Helper function to extract hotel ID from hash
  const getHotelIdFromHash = useCallback((hash: string): string | null => {
    const match = hash.match(/^#\/?hotel\/(.+)$/i)
    return match ? match[1] : null
  }, [])

  // Helper function to sync page state with URL hash
  const syncPageWithHash = useCallback(() => {
    const hash = window.location.hash
    const pageFromHash = getPageFromHash(hash)
    if (pageFromHash) {
      setCurrentPage(pageFromHash)
      
      // If it's a hotel page, extract and set the hotel ID
      if (pageFromHash === 'hotel') {
        const hotelId = getHotelIdFromHash(hash)
        if (hotelId) {
          setSelectedHotelId(hotelId)
        }
      }
    } else if (!hash || hash === '#' || hash === '#/') {
      // Empty hash means home page
      setCurrentPage('home')
    } else {
      // Invalid hash - redirect to home
      setCurrentPage('home')
    }
  }, [getPageFromHash, getHotelIdFromHash])

  // Set up hash-based navigation on mount and listen for hash changes
  useEffect(() => {
    // Sync on initial load
    syncPageWithHash()

    // Listen for hash changes
    const handleHashChange = () => {
      syncPageWithHash()
    }
    window.addEventListener('hashchange', handleHashChange)

    // Cleanup listener on unmount
    return () => {
      window.removeEventListener('hashchange', handleHashChange)
    }
  }, [syncPageWithHash])

  const handleSearch = () => {
    window.location.hash = '/search'
    window.scrollTo(0, 0)
  }

  const handleViewHotel = (hotelId: string) => {
    setSelectedHotelId(hotelId)
    window.location.hash = '/hotel/' + hotelId
    window.scrollTo(0, 0)
  }

  const handleBookRoom = (hotel: Hotel, room: Room) => {
    setSelectedHotel(hotel)
    setSelectedRoom(room)
    setSelectedRooms([room])
    window.location.hash = '/booking'
    window.scrollTo(0, 0)
  }
  
  const handleBookRooms = (hotel: Hotel, rooms: Room[]) => {
    setSelectedHotel(hotel)
    setSelectedRooms(rooms)
    setSelectedRoom(rooms[0])
    window.location.hash = '/booking'
    window.scrollTo(0, 0)
  }

  const handleBookingComplete = (reference: string) => {
    setBookingReference(reference)
    window.location.hash = '/confirmation'
    window.scrollTo(0, 0)
  }

  const resetSearchState = () => {
    setSelectedHotelId('')
    setSelectedHotel(null)
    setSelectedRoom(null)
    setSelectedRooms([])
    setBookingReference('')
    setSearchResults(null)
    window.location.hash = ''
    window.scrollTo(0, 0)
  }

  const handleBackToHome = () => {
    resetSearchState()
  }
  
  const handleNewSearch = () => {
    resetSearchState()
  }

  const handleNavigateToPage = (page: string) => {
    // All pages now use hash-based routing
    if (page === 'home') {
      window.location.hash = ''
    } else {
      window.location.hash = '/' + page
    }
    window.scrollTo(0, 0)
  }

  return (
    <AppProvider>
      <AuthProvider>
        <div className="min-h-screen flex flex-col">
          {currentPage !== 'confirmation' && <Navbar />}
          
          <main className="flex-1">
            {currentPage === 'home' && (
              <HomePage onSearch={handleSearch} onViewHotel={handleViewHotel} onResultsFound={setSearchResults} />
            )}
            
            {currentPage === 'search' && (
              <SearchResultsPage
                onViewHotel={handleViewHotel}
                onBack={handleBackToHome}
                onNewSearch={handleNewSearch}
                initialResults={searchResults ?? undefined}
              />
            )}
            
            {currentPage === 'hotel' && selectedHotelId && (
              <HotelDetailsPage
                hotelId={selectedHotelId}
                onBack={() => setCurrentPage('search')}
                onNewSearch={handleNewSearch}
                onBookRoom={(room) => {
                  const hotel = selectedHotel
                  if (!hotel) {
                    import('@/lib/api').then(({ api }) => {
                      api.getHotelDetails(selectedHotelId).then((h) => {
                        if (h) handleBookRoom(h, room)
                      })
                    })
                  } else {
                    handleBookRoom(hotel, room)
                  }
                }}
                onBookRooms={(rooms) => {
                  const hotel = selectedHotel
                  if (!hotel) {
                    import('@/lib/api').then(({ api }) => {
                      api.getHotelDetails(selectedHotelId).then((h) => {
                        if (h) handleBookRooms(h, rooms)
                      })
                    })
                  } else {
                    handleBookRooms(hotel, rooms)
                  }
                }}
              />
            )}
            
            {currentPage === 'booking' && selectedHotel && selectedRooms.length > 0 && (
              <BookingPage
                hotel={selectedHotel}
                room={selectedRoom!}
                rooms={selectedRooms}
                onBack={() => setCurrentPage('hotel')}
                onComplete={handleBookingComplete}
                onNewSearch={handleNewSearch}
              />
            )}
            
            {currentPage === 'confirmation' && (
              <ConfirmationPage
                reference={bookingReference}
                onHome={handleBackToHome}
                onNewSearch={handleNewSearch}
              />
            )}
            
            {currentPage === 'contact' && <ContactPage />}
            
            {currentPage === 'terms' && <TermsPage />}
            
            {currentPage === 'privacy' && <PrivacyPage />}

            {currentPage === 'login' && <LoginPage onNavigate={handleNavigateToPage} />}

            {currentPage === 'register' && <RegisterPage onNavigate={handleNavigateToPage} />}

            {currentPage === 'forgot-password' && <ForgotPasswordPage onNavigate={handleNavigateToPage} />}

            {currentPage === 'update-password' && <UpdatePasswordPage onNavigate={handleNavigateToPage} />}

            {currentPage === 'admin' && (
              <ProtectedRoute onNavigate={handleNavigateToPage}>
                <AdminDashboard />
              </ProtectedRoute>
            )}
          </main>
          
          {currentPage !== 'confirmation' && <Footer onNavigate={handleNavigateToPage} />}
        </div>
        
        <Toaster position="top-right" richColors />
      </AuthProvider>
    </AppProvider>
  )
}

export default App
