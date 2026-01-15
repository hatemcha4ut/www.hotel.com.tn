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
import { Hotel, Room } from '@/types'

type Page = 'home' | 'search' | 'hotel' | 'booking' | 'confirmation'

function App() {
  const [currentPage, setCurrentPage] = useState<Page>('home')
  const [selectedHotelId, setSelectedHotelId] = useState<string>('')
  const [selectedHotel, setSelectedHotel] = useState<Hotel | null>(null)
  const [selectedRoom, setSelectedRoom] = useState<Room | null>(null)
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
    setCurrentPage('booking')
  }

  const handleBookingComplete = (reference: string) => {
    setBookingReference(reference)
    setCurrentPage('confirmation')
  }

  const handleBackToHome = () => {
    setCurrentPage('home')
    setSelectedHotelId('')
    setSelectedHotel(null)
    setSelectedRoom(null)
    setBookingReference('')
  }

  return (
    <AppProvider>
      <div className="min-h-screen flex flex-col">
        {currentPage !== 'confirmation' && <Navbar />}
        
        <main className="flex-1">
          {currentPage === 'home' && (
            <HomePage onSearch={handleSearch} onViewHotel={handleViewHotel} />
          )}
          
          {currentPage === 'search' && (
            <SearchResultsPage
              onViewHotel={handleViewHotel}
              onBack={handleBackToHome}
            />
          )}
          
          {currentPage === 'hotel' && selectedHotelId && (
            <HotelDetailsPage
              hotelId={selectedHotelId}
              onBack={() => setCurrentPage('search')}
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
            />
          )}
          
          {currentPage === 'booking' && selectedHotel && selectedRoom && (
            <BookingPage
              hotel={selectedHotel}
              room={selectedRoom}
              onBack={() => setCurrentPage('hotel')}
              onComplete={handleBookingComplete}
            />
          )}
          
          {currentPage === 'confirmation' && (
            <ConfirmationPage
              reference={bookingReference}
              onHome={handleBackToHome}
            />
          )}
        </main>
        
        {currentPage !== 'confirmation' && <Footer />}
      </div>
      
      <Toaster position="top-right" richColors />
    </AppProvider>
  )
}

export default App