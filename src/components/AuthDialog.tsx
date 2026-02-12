import { useState } from 'react'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { toast } from 'sonner'
import { getSupabaseClient } from '@/lib/supabase'
import { buildAuthUser, type AuthUser } from '@/lib/auth'

interface AuthDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onAuthSuccess?: (user: AuthUser) => void
}

export function AuthDialog({ open, onOpenChange, onAuthSuccess }: AuthDialogProps) {
  const [loginData, setLoginData] = useState({ email: '', password: '' })
  const [registerData, setRegisterData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    password: '',
    confirmPassword: '',
  })

  const handleLogin = async () => {
    if (!loginData.email || !loginData.password) {
      toast.error('Veuillez remplir tous les champs')
      return
    }
    try {
      const supabase = getSupabaseClient()
      if (!supabase) {
        toast.error('Service d\'authentification non disponible. Veuillez réessayer plus tard.')
        return
      }
      const { data, error } = await supabase.auth.signInWithPassword({
        email: loginData.email,
        password: loginData.password,
      })
      if (error) {
        throw error
      }
      toast.success('Connexion réussie!')
      const authUser = buildAuthUser(data.user)
      if (!authUser) {
        throw new Error('Utilisateur non disponible.')
      }
      onAuthSuccess?.(authUser)
      onOpenChange(false)
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Erreur lors de la connexion')
    }
  }

  const handleRegister = async () => {
    if (!registerData.firstName || !registerData.lastName || !registerData.email || 
        !registerData.phone || !registerData.password) {
      toast.error('Veuillez remplir tous les champs obligatoires')
      return
    }
    if (registerData.password !== registerData.confirmPassword) {
      toast.error('Les mots de passe ne correspondent pas')
      return
    }
    
    try {
      const supabase = getSupabaseClient()
      if (!supabase) {
        toast.error('Service d\'authentification non disponible. Veuillez réessayer plus tard.')
        return
      }
      
      // Direct Supabase signUp - no demo verification codes
      const { data, error } = await supabase.auth.signUp({
        email: registerData.email,
        password: registerData.password,
        options: {
          data: {
            first_name: registerData.firstName,
            last_name: registerData.lastName,
            phone: registerData.phone,
          },
        },
      })
      
      if (error) {
        throw error
      }
      
      const authUser = buildAuthUser(data.user)
      if (!authUser) {
        throw new Error('Utilisateur non disponible.')
      }
      
      onAuthSuccess?.(authUser)
      toast.success('Compte créé avec succès!')
      onOpenChange(false)
      
      // Reset form
      setRegisterData({
        firstName: '',
        lastName: '',
        email: '',
        phone: '',
        password: '',
        confirmPassword: '',
      })
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Erreur lors de la création du compte')
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px] max-h-[90vh] overflow-y-auto">
        <DialogHeader className="space-y-2">
          <DialogTitle className="text-xl sm:text-2xl">Bienvenue</DialogTitle>
          <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed">
            Connectez-vous ou créez un compte
          </p>
        </DialogHeader>

            <Tabs defaultValue="login" className="w-full">
              <TabsList className="grid w-full grid-cols-2 h-11">
                <TabsTrigger value="login" className="text-sm sm:text-base">Se connecter</TabsTrigger>
                <TabsTrigger value="register" className="text-sm sm:text-base">S'enregistrer</TabsTrigger>
              </TabsList>

              <TabsContent value="login" className="space-y-4 mt-6">
                <div className="space-y-3">
                  <div className="space-y-2">
                    <Label htmlFor="login-email" className="text-sm font-medium">Email</Label>
                    <Input
                      id="login-email"
                      type="email"
                      placeholder="votre@email.com"
                      value={loginData.email}
                      onChange={(e) => setLoginData({ ...loginData, email: e.target.value })}
                      className="h-11"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="login-password" className="text-sm font-medium">Mot de passe</Label>
                    <Input
                      id="login-password"
                      type="password"
                      placeholder="••••••••"
                      value={loginData.password}
                      onChange={(e) => setLoginData({ ...loginData, password: e.target.value })}
                      className="h-11"
                    />
                  </div>
                </div>
                
                <div className="text-right">
                  <button className="text-sm text-primary hover:underline">
                    Mot de passe oublié?
                  </button>
                </div>
                
                <Button className="w-full h-11" size="lg" onClick={handleLogin}>
                  Se connecter
                </Button>
              </TabsContent>

              <TabsContent value="register" className="space-y-4 mt-6">
                <div className="space-y-3">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div className="space-y-2">
                      <Label htmlFor="firstName" className="text-sm font-medium">Prénom *</Label>
                      <Input
                        id="firstName"
                        placeholder="Prénom"
                        value={registerData.firstName}
                        onChange={(e) => setRegisterData({ ...registerData, firstName: e.target.value })}
                        className="h-11"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="lastName" className="text-sm font-medium">Nom *</Label>
                      <Input
                        id="lastName"
                        placeholder="Nom"
                        value={registerData.lastName}
                        onChange={(e) => setRegisterData({ ...registerData, lastName: e.target.value })}
                        className="h-11"
                      />
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="register-email" className="text-sm font-medium">Email *</Label>
                    <Input
                      id="register-email"
                      type="email"
                      placeholder="votre@email.com"
                      value={registerData.email}
                      onChange={(e) => setRegisterData({ ...registerData, email: e.target.value })}
                      className="h-11"
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="phone" className="text-sm font-medium">Téléphone *</Label>
                    <Input
                      id="phone"
                      type="tel"
                      placeholder="+216 XX XXX XXX"
                      value={registerData.phone}
                      onChange={(e) => setRegisterData({ ...registerData, phone: e.target.value })}
                      className="h-11"
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="register-password" className="text-sm font-medium">Mot de passe *</Label>
                    <Input
                      id="register-password"
                      type="password"
                      placeholder="••••••••"
                      value={registerData.password}
                      onChange={(e) => setRegisterData({ ...registerData, password: e.target.value })}
                      className="h-11"
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="confirm-password" className="text-sm font-medium">Confirmer le mot de passe *</Label>
                    <Input
                      id="confirm-password"
                      type="password"
                      placeholder="••••••••"
                      value={registerData.confirmPassword}
                      onChange={(e) => setRegisterData({ ...registerData, confirmPassword: e.target.value })}
                      className="h-11"
                    />
                  </div>
                </div>

                <Button className="w-full h-11" size="lg" onClick={handleRegister}>
                  S'enregistrer
                </Button>
              </TabsContent>
            </Tabs>
      </DialogContent>
    </Dialog>
  )
}
