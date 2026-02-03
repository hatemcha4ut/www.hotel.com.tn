import { useState } from 'react'
import { Toaster } from 'sonner'
import { AppProvider } from '@/contexts/AppContext'
import { Navbar } from '@/components/Navbar'
import { Footer } from '@/components/Footer'
import { HomePage } from '@/pages/HomePage'
import { SearchResultsPage } from '@/pages/SearchResultsPage'
import { HotelDetailsPage } from '@/pages/HotelDetailsPage'
import { BookingPage } from '@/pages/BookingPage'
import { ConfirmationPage } from '@/pages/ConfirmationPage'
import { ContactPage } from '@/pages/ContactPage'
import { TermsPage } from '@/pages/TermsPage'
import { PrivacyPage } from '@/pages/PrivacyPage'
import { AdminDashboard } from '@/pages/AdminDashboard'
import { Hotel, Room } from '@/types'

type Page = 'home' | 'search' | 'hotel' | 'booking' | 'confirmation' | 'contact' | 'terms' | 'privacy' | 'admin'

function App() {
  const [currentPage, setCurrentPage] = useState<Page>('home')
  const [selectedHotelId, setSelectedHotelId] = useState<string>('')
  const [selectedHotel, setSelectedHotel] = useState<Hotel | null>(null)
  const [searchResults, setSearchResults] = useState<Hotel[] | null>(null)
  const [selectedRoom, setSelectedRoom] = useState<Room | null>(null)
  const [selectedRooms, setSelectedRooms] = useState<Room[]>([])
  const [bookingReference, setBookingReference] = useState<string>('')

  const handleSearch = () => {
    setCurrentPage('search')
  }

  const handleViewHotel = (hotelId: string) => {
    setSelectedHotelId(hotelId)
    setCurrentPage('hotel')
  }

  const handleBookRoom = (hotel: Hotel, room: Room) => {
    setSelectedHotel(hotel)
    setSelectedRoom(room)
    setSelectedRooms([room])
    setCurrentPage('booking')
  }
  
  const handleBookRooms = (hotel: Hotel, rooms: Room[]) => {
    setSelectedHotel(hotel)
    setSelectedRooms(rooms)
    setSelectedRoom(rooms[0])
    setCurrentPage('booking')
  }

  const handleBookingComplete = (reference: string) => {
    setBookingReference(reference)
    setCurrentPage('confirmation')
  }

  const resetSearchState = () => {
    setCurrentPage('home')
    setSelectedHotelId('')
    setSelectedHotel(null)
    setSelectedRoom(null)
    setSelectedRooms([])
    setBookingReference('')
    setSearchResults(null)
  }

  const handleBackToHome = () => {
    resetSearchState()
  }
  
  const handleNewSearch = () => {
    resetSearchState()
  }

  const handleNavigateToPage = (page: string) => {
    setCurrentPage(page as Page)
  }

  return (
    <AppProvider>
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

          {currentPage === 'admin' && <AdminDashboard />}
        </main>
        
        {currentPage !== 'confirmation' && <Footer onNavigate={handleNavigateToPage} />}
      </div>
      
      <Toaster position="top-right" richColors />
    </AppProvider>
  )
}

export default App
