import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Button } from '@/components/ui/button'
import { getSupabaseClient } from '@/lib/supabase'
import { useAuth } from '@/contexts/AuthContext'
import type { BookingListItem } from '@/types'

export function AdminDashboard() {
  const { user, loading: authLoading } = useAuth()
  const [bookings, setBookings] = useState<BookingListItem[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [isAdmin, setIsAdmin] = useState<boolean | null>(null)

  // Check if user has admin role
  useEffect(() => {
    const checkAdminRole = async () => {
      if (!user) {
        setIsAdmin(false)
        setLoading(false)
        return
      }

      const supabase = getSupabaseClient()
      if (!supabase) {
        setError('Service non disponible. Configuration manquante.')
        setIsAdmin(false)
        setLoading(false)
        return
      }

      try {
        // Query profiles table for admin role
        const { data, error: profileError } = await supabase
          .from('profiles')
          .select('is_admin, role')
          .eq('id', user.id)
          .single()

        if (profileError) {
          console.error('Error checking admin role:', profileError)
          // If table doesn't exist or query fails, deny access
          setIsAdmin(false)
          setError('Impossible de vérifier les permissions administrateur.')
        } else {
          // Check if user has admin role (either is_admin flag or role field)
          const hasAdminRole = data?.is_admin === true || data?.role === 'admin'
          setIsAdmin(hasAdminRole)
        }
      } catch (err) {
        console.error('Error checking admin role:', err)
        setIsAdmin(false)
        setError('Erreur lors de la vérification des permissions.')
      } finally {
        setLoading(false)
      }
    }

    if (!authLoading) {
      checkAdminRole()
    }
  }, [user, authLoading])

  // Fetch bookings when admin role is confirmed
  useEffect(() => {
    const fetchBookings = async () => {
      if (!isAdmin) return

      const supabase = getSupabaseClient()
      if (!supabase) {
        setError('Service non disponible. Configuration manquante.')
        return
      }

      setLoading(true)
      setError('')

      try {
        const { data, error: bookingsError } = await supabase
          .from('bookings')
          .select('id, created_at, guest_email, hotel_name, total_amount, status, mygo_state, payment_status')
          .order('created_at', { ascending: false })
          .limit(50)

        if (bookingsError) {
          console.error('Error fetching bookings:', bookingsError)
          setError('Impossible de charger les réservations. La table pourrait ne pas exister.')
          setBookings([])
        } else if (data) {
          // Transform Supabase data to BookingListItem format
          // mygo_state represents the booking state from the MyGo API (OnRequest/Validated/Cancelled)
          const formattedBookings: BookingListItem[] = data.map((booking) => ({
            id: booking.id,
            date: new Date(booking.created_at).toLocaleDateString('fr-FR'),
            client: booking.guest_email || 'N/A',
            hotel: booking.hotel_name || 'N/A',
            amount: booking.total_amount ? `${booking.total_amount} TND` : 'N/A',
            status: booking.mygo_state || booking.status || 'En attente',
          }))
          setBookings(formattedBookings)
        }
      } catch (err) {
        console.error('Error fetching bookings:', err)
        setError('Erreur lors du chargement des réservations.')
        setBookings([])
      } finally {
        setLoading(false)
      }
    }

    fetchBookings()
  }, [isAdmin])

  // Show loading state while checking auth and admin role
  if (authLoading || (loading && isAdmin === null)) {
    return (
      <div className="min-h-screen bg-background py-12">
        <div className="max-w-md mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <p className="text-muted-foreground">Vérification des permissions...</p>
        </div>
      </div>
    )
  }

  // Show access denied if not admin
  if (!isAdmin) {
    return (
      <div className="min-h-screen bg-background py-12">
        <div className="max-w-md mx-auto px-4 sm:px-6 lg:px-8">
          <Card>
            <CardHeader>
              <CardTitle>Accès refusé</CardTitle>
            </CardHeader>
            <CardContent>
              <Alert variant="destructive">
                <AlertDescription>
                  Vous n'avez pas les permissions nécessaires pour accéder à cette page.
                  Seuls les administrateurs peuvent accéder au tableau de bord.
                </AlertDescription>
              </Alert>
            </CardContent>
          </Card>
        </div>
      </div>
    )
  }

  // Admin dashboard content
  return (
    <div className="min-h-screen bg-background py-12">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6">
        <div>
          <h1 className="text-3xl font-bold">Admin Dashboard</h1>
          <p className="text-muted-foreground">Dernières réservations</p>
        </div>

        {error && (
          <Alert variant="destructive">
            <AlertDescription>
              {error}
              <Button 
                variant="link" 
                className="ml-2 p-0 h-auto"
                onClick={() => window.location.reload()}
              >
                Réessayer
              </Button>
            </AlertDescription>
          </Alert>
        )}

        <Card>
          <CardContent className="pt-6">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Date</TableHead>
                  <TableHead>Client</TableHead>
                  <TableHead>Hôtel</TableHead>
                  <TableHead>Montant</TableHead>
                  <TableHead>Statut</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {loading ? (
                  <TableRow>
                    <TableCell colSpan={5} className="text-center">
                      Chargement des réservations...
                    </TableCell>
                  </TableRow>
                ) : bookings.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={5} className="text-center text-muted-foreground">
                      Aucune réservation récente.
                    </TableCell>
                  </TableRow>
                ) : (
                  bookings.map((booking) => (
                    <TableRow key={booking.id}>
                      <TableCell>{booking.date}</TableCell>
                      <TableCell>{booking.client}</TableCell>
                      <TableCell>{booking.hotel}</TableCell>
                      <TableCell>{booking.amount}</TableCell>
                      <TableCell>{booking.status}</TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
