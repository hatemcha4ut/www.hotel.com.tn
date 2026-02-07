import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { toast } from 'sonner'
import { useAuth } from '@/contexts/AuthContext'

interface LoginPageProps {
  onNavigate: (page: string) => void
}

export function LoginPage({ onNavigate }: LoginPageProps) {
  const { signIn } = useAuth()
  const [formData, setFormData] = useState({
    email: '',
    password: '',
  })
  const [isLoading, setIsLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!formData.email || !formData.password) {
      toast.error('Veuillez remplir tous les champs')
      return
    }

    setIsLoading(true)
    try {
      const { error } = await signIn(formData.email, formData.password)
      
      if (error) {
        toast.error('Email ou mot de passe incorrect')
        return
      }

      toast.success('Connexion réussie!')
      
      // Check if user has admin role (you can check user metadata or profiles table)
      // For now, navigate to home page
      // If you want to check admin role, you could do:
      // const supabase = getSupabaseClient()
      // const { data: profile } = await supabase.from('profiles').select('role').eq('user_id', user.id).single()
      // if (profile?.role === 'admin') { onNavigate('admin') } else { onNavigate('home') }
      
      onNavigate('home')
    } catch (error) {
      toast.error('Une erreur est survenue lors de la connexion')
      console.error('Login error:', error)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-muted/30">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle className="text-2xl">Se connecter</CardTitle>
          <CardDescription>
            Connectez-vous à votre compte
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
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
              <Label htmlFor="password">Mot de passe</Label>
              <Input
                id="password"
                type="password"
                placeholder="••••••••"
                value={formData.password}
                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                required
                disabled={isLoading}
              />
            </div>

            <div className="text-right">
              <button
                type="button"
                onClick={() => onNavigate('forgot-password')}
                className="text-sm text-primary hover:underline"
              >
                Mot de passe oublié?
              </button>
            </div>

            <Button type="submit" className="w-full" disabled={isLoading}>
              {isLoading ? 'Connexion...' : 'Se connecter'}
            </Button>

            <div className="text-center text-sm">
              <span className="text-muted-foreground">Vous n'avez pas de compte? </span>
              <button
                type="button"
                onClick={() => onNavigate('register')}
                className="text-primary hover:underline font-medium"
              >
                S'inscrire
              </button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
