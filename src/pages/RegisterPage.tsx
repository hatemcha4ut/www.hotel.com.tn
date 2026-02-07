import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { toast } from 'sonner'
import { useAuth } from '@/contexts/AuthContext'
import { upsertProfile } from '@/lib/auth'
import { getSupabaseClient } from '@/lib/supabase'

interface RegisterPageProps {
  onNavigate: (page: string) => void
}

export function RegisterPage({ onNavigate }: RegisterPageProps) {
  const { signUp } = useAuth()
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    whatsappNumber: '',
  })
  const [isLoading, setIsLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!formData.email || !formData.password) {
      toast.error('Veuillez remplir tous les champs obligatoires')
      return
    }

    if (formData.password.length < 6) {
      toast.error('Le mot de passe doit contenir au moins 6 caractères')
      return
    }

    setIsLoading(true)
    try {
      const { error } = await signUp(formData.email, formData.password)
      
      if (error) {
        toast.error(error.message)
        return
      }

      toast.success('Compte créé avec succès!')

      // If WhatsApp number is provided, upsert to profiles table
      if (formData.whatsappNumber) {
        try {
          const { data: sessionData } = await getSupabaseClient().auth.getSession()
          if (sessionData.session?.user?.id) {
            await upsertProfile(sessionData.session.user.id, formData.whatsappNumber)
          }
        } catch (profileError) {
          console.error('Error saving WhatsApp number:', profileError)
          // Don't show error to user - registration was successful
        }
      }

      // Navigate to login page
      onNavigate('login')
    } catch (error) {
      toast.error('Une erreur est survenue lors de l\'inscription')
      console.error('Registration error:', error)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-muted/30">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle className="text-2xl">Créer un compte</CardTitle>
          <CardDescription>
            Inscrivez-vous pour accéder à nos services
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">Email *</Label>
              <Input
                id="email"
                type="email"
                placeholder="votre@email.com"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                required
                disabled={isLoading}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="password">Mot de passe *</Label>
              <Input
                id="password"
                type="password"
                placeholder="Au moins 6 caractères"
                value={formData.password}
                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                required
                disabled={isLoading}
                minLength={6}
              />
              <p className="text-xs text-muted-foreground">
                Minimum 6 caractères
              </p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="whatsapp">Numéro WhatsApp (optionnel)</Label>
              <Input
                id="whatsapp"
                type="tel"
                placeholder="+216 XX XXX XXX"
                value={formData.whatsappNumber}
                onChange={(e) => {
                  const value = e.target.value
                  // Normalize WhatsApp number: ensure it starts with + and remove spaces/dashes
                  const normalized = value.trim().replace(/[\s-]/g, '')
                  setFormData({ 
                    ...formData, 
                    whatsappNumber: normalized.startsWith('+') ? normalized : value 
                  })
                }}
                disabled={isLoading}
              />
              <p className="text-xs text-muted-foreground">
                Format: +216XXXXXXXX
              </p>
            </div>

            <Button type="submit" className="w-full" disabled={isLoading}>
              {isLoading ? 'Inscription...' : 'S\'inscrire'}
            </Button>

            <div className="text-center text-sm">
              <span className="text-muted-foreground">Vous avez déjà un compte? </span>
              <button
                type="button"
                onClick={() => onNavigate('login')}
                className="text-primary hover:underline font-medium"
              >
                Se connecter
              </button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
