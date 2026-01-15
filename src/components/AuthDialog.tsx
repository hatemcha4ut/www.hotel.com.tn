import { useState } from 'react'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group'
import { Envelope, Phone, LockKey } from '@phosphor-icons/react'
import { toast } from 'sonner'
import { useKV } from '@github/spark/hooks'

interface AuthDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onAuthSuccess?: (user: any) => void
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

  const handleLogin = () => {
    if (!loginData.email || !loginData.password) {
      toast.error('Veuillez remplir tous les champs')
      return
    }
    toast.success('Connexion réussie!')
    onAuthSuccess?.({ email: loginData.email, name: loginData.email.split('@')[0] })
    onOpenChange(false)
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

  const handleVerify = () => {
    if (verificationCode === generatedCode) {
      toast.success('Compte créé avec succès!')
      onAuthSuccess?.({ 
        email: registerData.email, 
        name: `${registerData.firstName} ${registerData.lastName}`,
        phone: registerData.phone 
      })
      onOpenChange(false)
      setStep('auth')
      setVerificationCode('')
      setGeneratedCode('')
    } else {
      toast.error('Code de vérification incorrect')
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        {step === 'auth' ? (
          <>
            <DialogHeader>
              <DialogTitle>Connexion / Inscription</DialogTitle>
            </DialogHeader>

            <Tabs defaultValue="login" className="w-full">
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="login">Se connecter</TabsTrigger>
                <TabsTrigger value="register">S'enregistrer</TabsTrigger>
              </TabsList>

              <TabsContent value="login" className="space-y-4 mt-4">
                <div className="space-y-2">
                  <Label htmlFor="login-email">Email</Label>
                  <Input
                    id="login-email"
                    type="email"
                    placeholder="votre@email.com"
                    value={loginData.email}
                    onChange={(e) => setLoginData({ ...loginData, email: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="login-password">Mot de passe</Label>
                  <Input
                    id="login-password"
                    type="password"
                    placeholder="••••••••"
                    value={loginData.password}
                    onChange={(e) => setLoginData({ ...loginData, password: e.target.value })}
                  />
                </div>
                <Button className="w-full" onClick={handleLogin}>
                  Se connecter
                </Button>
                <div className="text-center text-sm">
                  <a href="#" className="text-primary hover:underline">
                    Mot de passe oublié?
                  </a>
                </div>
              </TabsContent>

              <TabsContent value="register" className="space-y-4 mt-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="firstName">Prénom *</Label>
                    <Input
                      id="firstName"
                      placeholder="Prénom"
                      value={registerData.firstName}
                      onChange={(e) => setRegisterData({ ...registerData, firstName: e.target.value })}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="lastName">Nom *</Label>
                    <Input
                      id="lastName"
                      placeholder="Nom"
                      value={registerData.lastName}
                      onChange={(e) => setRegisterData({ ...registerData, lastName: e.target.value })}
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="register-email">Email *</Label>
                  <Input
                    id="register-email"
                    type="email"
                    placeholder="votre@email.com"
                    value={registerData.email}
                    onChange={(e) => setRegisterData({ ...registerData, email: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="phone">Téléphone *</Label>
                  <Input
                    id="phone"
                    type="tel"
                    placeholder="+216 XX XXX XXX"
                    value={registerData.phone}
                    onChange={(e) => setRegisterData({ ...registerData, phone: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="register-password">Mot de passe *</Label>
                  <Input
                    id="register-password"
                    type="password"
                    placeholder="••••••••"
                    value={registerData.password}
                    onChange={(e) => setRegisterData({ ...registerData, password: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="confirm-password">Confirmer le mot de passe *</Label>
                  <Input
                    id="confirm-password"
                    type="password"
                    placeholder="••••••••"
                    value={registerData.confirmPassword}
                    onChange={(e) => setRegisterData({ ...registerData, confirmPassword: e.target.value })}
                  />
                </div>

                <div className="space-y-3">
                  <Label>Méthode de vérification</Label>
                  <RadioGroup value={verificationMethod} onValueChange={(v) => setVerificationMethod(v as 'email' | 'whatsapp')}>
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="email" id="email" />
                      <Label htmlFor="email" className="flex items-center gap-2 cursor-pointer">
                        <Envelope size={18} />
                        Email
                      </Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="whatsapp" id="whatsapp" />
                      <Label htmlFor="whatsapp" className="flex items-center gap-2 cursor-pointer">
                        <Phone size={18} />
                        WhatsApp
                      </Label>
                    </div>
                  </RadioGroup>
                </div>

                <Button className="w-full" onClick={handleRegister}>
                  S'enregistrer
                </Button>
              </TabsContent>
            </Tabs>
          </>
        ) : (
          <>
            <DialogHeader>
              <DialogTitle>Vérification</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div className="text-center py-4">
                <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                  <LockKey size={32} className="text-primary" />
                </div>
                <p className="text-sm text-muted-foreground">
                  Un code de vérification a été envoyé {verificationMethod === 'email' ? 'à votre email' : 'via WhatsApp'}
                </p>
              </div>
              <div className="space-y-2">
                <Label htmlFor="code">Code de vérification (6 chiffres)</Label>
                <Input
                  id="code"
                  placeholder="000000"
                  maxLength={6}
                  value={verificationCode}
                  onChange={(e) => setVerificationCode(e.target.value.replace(/\D/g, ''))}
                />
              </div>
              <div className="flex gap-2">
                <Button variant="outline" onClick={() => setStep('auth')} className="flex-1">
                  Retour
                </Button>
                <Button onClick={handleVerify} className="flex-1" disabled={verificationCode.length !== 6}>
                  Vérifier
                </Button>
              </div>
            </div>
          </>
        )}
      </DialogContent>
    </Dialog>
  )
}
