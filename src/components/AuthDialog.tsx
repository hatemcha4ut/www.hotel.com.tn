import { useState } from 'react'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group'
import { Envelope, Phone, LockKey } from '@phosphor-icons/react'
import { toast } from 'sonner'
import { getSupabaseClient } from '@/lib/supabase'
import type { User } from '@supabase/supabase-js'

export interface AuthUser {
  id: string
  email: string
  phone: string
  name: string
}

interface AuthDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onAuthSuccess?: (user: AuthUser) => void
}

export const buildAuthUser = (user: User): AuthUser => {
  const metadata = (user.user_metadata ?? {}) as {
    first_name?: string
    last_name?: string
    phone?: string
    name?: string
  }
  const fallbackName = user.email ? user.email.split('@')[0] : ''
  const firstName = metadata.first_name ?? ''
  const lastName = metadata.last_name ?? ''
  return {
    id: user.id,
    email: user.email ?? '',
    phone: user.phone ?? metadata.phone ?? '',
    name: `${firstName} ${lastName}`.trim() || metadata.name || fallbackName,
  }
}

export function AuthDialog({ open, onOpenChange, onAuthSuccess }: AuthDialogProps) {
  const [verificationMethod, setVerificationMethod] = useState<'email' | 'whatsapp'>('email')
  const [step, setStep] = useState<'auth' | 'verify'>('auth')
  const [loginData, setLoginData] = useState({ email: '', password: '' })
  const [registerData, setRegisterData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    password: '',
    confirmPassword: '',
  })
  const [verificationCode, setVerificationCode] = useState('')
  const [generatedCode, setGeneratedCode] = useState('')

  const generateCode = () => {
    return Math.floor(100000 + Math.random() * 900000).toString()
  }

  const handleLogin = async () => {
    if (!loginData.email || !loginData.password) {
      toast.error('Veuillez remplir tous les champs')
      return
    }
    try {
      const supabase = getSupabaseClient()
      const { data, error } = await supabase.auth.signInWithPassword({
        email: loginData.email,
        password: loginData.password,
      })
      if (error) {
        throw error
      }
      toast.success('Connexion réussie!')
      if (!data.user) {
        throw new Error('Utilisateur non disponible.')
      }
      onAuthSuccess?.(buildAuthUser(data.user))
      onOpenChange(false)
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Erreur lors de la connexion')
    }
  }

  const handleRegister = () => {
    if (!registerData.firstName || !registerData.lastName || !registerData.email || 
        !registerData.phone || !registerData.password) {
      toast.error('Veuillez remplir tous les champs obligatoires')
      return
    }
    if (registerData.password !== registerData.confirmPassword) {
      toast.error('Les mots de passe ne correspondent pas')
      return
    }
    
    const code = generateCode()
    setGeneratedCode(code)
    
    if (verificationMethod === 'email') {
      toast.success(`Code de vérification envoyé à ${registerData.email}`)
      toast.info(`Code de démonstration: ${code}`)
    } else {
      toast.success(`Code de vérification envoyé via WhatsApp au ${registerData.phone}`)
      toast.info(`Code de démonstration: ${code}`)
    }
    
    setStep('verify')
  }

  const handleVerify = async () => {
    if (verificationCode === generatedCode) {
      try {
        const supabase = getSupabaseClient()
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
        if (!data.user) {
          throw new Error('Utilisateur non disponible.')
        }
        onAuthSuccess?.(buildAuthUser(data.user))
        toast.success('Compte créé avec succès!')
        onOpenChange(false)
        setStep('auth')
        setVerificationCode('')
        setGeneratedCode('')
      } catch (error) {
        toast.error(error instanceof Error ? error.message : 'Erreur lors de la création du compte')
      }
    } else {
      toast.error('Code de vérification incorrect')
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px] max-h-[90vh] overflow-y-auto">
        {step === 'auth' ? (
          <>
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

                  <div className="space-y-3 pt-2">
                    <Label className="text-sm font-medium">Méthode de vérification</Label>
                    <RadioGroup value={verificationMethod} onValueChange={(v) => setVerificationMethod(v as 'email' | 'whatsapp')}>
                      <div className="flex items-center space-x-3 p-3 rounded-lg border hover:bg-muted/50 transition-colors cursor-pointer">
                        <RadioGroupItem value="email" id="email" />
                        <Label htmlFor="email" className="flex items-center gap-2 cursor-pointer flex-1">
                          <Envelope size={20} className="text-primary" weight="duotone" />
                          <span className="text-sm">Email</span>
                        </Label>
                      </div>
                      <div className="flex items-center space-x-3 p-3 rounded-lg border hover:bg-muted/50 transition-colors cursor-pointer">
                        <RadioGroupItem value="whatsapp" id="whatsapp" />
                        <Label htmlFor="whatsapp" className="flex items-center gap-2 cursor-pointer flex-1">
                          <Phone size={20} className="text-accent" weight="duotone" />
                          <span className="text-sm">WhatsApp</span>
                        </Label>
                      </div>
                    </RadioGroup>
                  </div>
                </div>

                <Button className="w-full h-11" size="lg" onClick={handleRegister}>
                  S'enregistrer
                </Button>
              </TabsContent>
            </Tabs>
          </>
        ) : (
          <>
            <DialogHeader>
              <DialogTitle className="text-xl sm:text-2xl">Vérification du code</DialogTitle>
            </DialogHeader>
            <div className="space-y-6">
              <div className="text-center py-6">
                <div className="w-20 h-20 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                  <LockKey size={40} className="text-primary" weight="duotone" />
                </div>
                <p className="text-sm text-muted-foreground">
                  Un code de vérification à 6 chiffres a été envoyé<br />
                  {verificationMethod === 'email' ? 'à votre adresse email' : 'via WhatsApp'}
                </p>
              </div>
              <div className="space-y-2">
                <Label htmlFor="code" className="text-sm font-medium">Code de vérification</Label>
                <Input
                  id="code"
                  placeholder="000000"
                  maxLength={6}
                  value={verificationCode}
                  onChange={(e) => setVerificationCode(e.target.value.replace(/\D/g, ''))}
                  className="h-12 text-center text-xl tracking-widest font-semibold"
                />
              </div>
              <div className="flex flex-col sm:flex-row gap-3">
                <Button variant="outline" onClick={() => setStep('auth')} className="flex-1 h-11">
                  Retour
                </Button>
                <Button onClick={handleVerify} className="flex-1 h-11" disabled={verificationCode.length !== 6}>
                  Vérifier le code
                </Button>
              </div>
            </div>
          </>
        )}
      </DialogContent>
    </Dialog>
  )
}
