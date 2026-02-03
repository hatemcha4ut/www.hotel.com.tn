import { useEffect, useRef, useState } from 'react'
import { ClicToPayRedirectParams, clicToPayService } from '@/services/clicToPayService'

interface ClicToPayRedirectProps {
  amount: number
  orderId: string
}

export function ClicToPayRedirect({ amount, orderId }: ClicToPayRedirectProps) {
  const formRef = useRef<HTMLFormElement | null>(null)
  const [redirectConfig, setRedirectConfig] = useState<ClicToPayRedirectParams | null>(null)
  const [errorMessage, setErrorMessage] = useState<string | null>(null)

  useEffect(() => {
    try {
      setRedirectConfig(clicToPayService.getRedirectParams(amount, orderId))
      setErrorMessage(null)
    } catch (error) {
      setRedirectConfig(null)
      setErrorMessage(error instanceof Error ? error.message : 'Erreur lors de la redirection.')
    }
  }, [amount, orderId])

  useEffect(() => {
    if (redirectConfig && formRef.current) {
      formRef.current?.submit()
    }
  }, [redirectConfig])

  return (
    <div className="flex flex-col items-center justify-center gap-4 text-center py-12">
      <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin" />
      {errorMessage ? (
        <p className="text-sm sm:text-base font-medium text-destructive">{errorMessage}</p>
      ) : (
        <>
          <p className="text-sm sm:text-base font-medium text-muted-foreground">
            Redirection vers la banque sécurisée...
          </p>
          {redirectConfig && (
            <form
              ref={formRef}
              action={redirectConfig.actionUrl}
              method="POST"
              className="hidden"
            >
              {Object.entries(redirectConfig.params).map(([key, value]) => (
                <input key={key} type="hidden" name={key} value={value} />
              ))}
            </form>
          )}
        </>
      )}
    </div>
  )
}
