/**
 * Detects if an error originates from a Supabase Edge Function failure
 * and returns a user-friendly message.
 */
export function getEdgeFunctionErrorMessage(err: unknown): string | null {
  const message = err instanceof Error ? err.message : String(err)
  const name = err instanceof Error ? err.name : ''
  
  const isEdgeFunctionError =
    message.includes('non-2xx status code') ||
    message.includes('FunctionsFetchError') ||
    message.includes('FunctionsHttpError') || 
    message.includes('FunctionsRelayError') ||
    name === 'FunctionsFetchError' ||
    name === 'FunctionsHttpError' ||
    name === 'FunctionsRelayError'
  
  if (!isEdgeFunctionError) return null
  
  return 'Le service est temporairement indisponible. Veuillez réessayer dans quelques instants.'
}

export function isNetworkError(err: unknown): boolean {
  const message = err instanceof Error ? err.message : String(err)
  return (
    message.includes('NetworkError') ||
    message.includes('Failed to fetch') ||
    message.includes('Network request failed') ||
    message.includes('net::ERR_')
  )
}

export function getUserFriendlyErrorMessage(err: unknown, context: 'search' | 'cities' | 'booking'): string {
  const edgeMsg = getEdgeFunctionErrorMessage(err)
  if (edgeMsg) {
    switch (context) {
      case 'search':
        return 'Le service de recherche est temporairement indisponible. Veuillez réessayer dans quelques instants.'
      case 'cities':
        return 'Impossible de charger les villes depuis le serveur. Les villes par défaut sont affichées.'
      case 'booking':
        return 'Le service de réservation est temporairement indisponible. Veuillez réessayer dans quelques instants.'
    }
  }
  
  if (isNetworkError(err)) {
    return 'Erreur de connexion. Vérifiez votre connexion internet et réessayez.'
  }
  
  // Return original message as fallback
  return err instanceof Error && err.message ? err.message : 'Une erreur inattendue est survenue.'
}
