import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { getBookingList, type BookingListItem } from '@/services/hotelService'

const ADMIN_PASSWORD = 'admin123'

export function AdminDashboard() {
  const [password, setPassword] = useState('')
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [error, setError] = useState('')
  const [bookings, setBookings] = useState<BookingListItem[]>([])
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    if (password !== ADMIN_PASSWORD) {
      setError('Mot de passe incorrect.')
      return
    }

    setError('')
    setIsAuthenticated(true)
    setLoading(true)

    try {
      const data = await getBookingList()
      setBookings(data)
    } catch (fetchError) {
      console.error('Erreur lors du chargement des réservations.', fetchError)
      setError('Impossible de charger les réservations.')
    } finally {
      setLoading(false)
    }
  }

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-background py-12">
        <div className="max-w-md mx-auto px-4 sm:px-6 lg:px-8">
          <Card>
            <CardHeader>
              <CardTitle>Accès administrateur</CardTitle>
            </CardHeader>
            <CardContent>
              <form className="space-y-4" onSubmit={handleSubmit}>
                <div className="space-y-2">
                  <Label htmlFor="admin-password">Mot de passe</Label>
                  <Input
                    id="admin-password"
                    type="password"
                    value={password}
                    onChange={(event) => setPassword(event.target.value)}
                    placeholder="Votre mot de passe"
                  />
                </div>
                {error && (
                  <Alert variant="destructive">
                    <AlertDescription>{error}</AlertDescription>
                  </Alert>
                )}
                <Button type="submit" className="w-full">
                  Se connecter
                </Button>
              </form>
            </CardContent>
          </Card>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background py-12">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6">
        <div>
          <h1 className="text-3xl font-bold">Admin Dashboard</h1>
          <p className="text-muted-foreground">Dernières réservations</p>
        </div>
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
                    <TableCell colSpan={5}>Chargement...</TableCell>
                  </TableRow>
                ) : bookings.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={5}>Aucune réservation récente.</TableCell>
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
