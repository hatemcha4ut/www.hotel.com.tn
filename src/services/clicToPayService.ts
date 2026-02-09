export interface ClicToPayRedirectParams {
  actionUrl: string
  params: Record<string, string>
}

const CLIC_TO_PAY_URL =
  import.meta.env.VITE_CLIC_TO_PAY_URL ?? 'https://www.clictopay.com.tn'
const CLIC_TO_PAY_DECIMAL_PRECISION = 3
const CLIC_TO_PAY_PARAMS_ENDPOINT = import.meta.env.VITE_CLIC_TO_PAY_PARAMS_ENDPOINT

export const clicToPayService = {
  async getRedirectParams(amount: number, orderId: string): Promise<ClicToPayRedirectParams> {
    if (!CLIC_TO_PAY_PARAMS_ENDPOINT) {
      throw new Error('Configuration de ClicToPay manquante.')
    }
    if (!Number.isFinite(amount) || amount <= 0) {
      throw new Error('Le montant doit être supérieur à zéro.')
    }

    const response = await fetch(CLIC_TO_PAY_PARAMS_ENDPOINT, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        amount: amount.toFixed(CLIC_TO_PAY_DECIMAL_PRECISION),
        orderId,
      }),
    })

    if (!response.ok) {
      throw new Error('Impossible de générer les paramètres de paiement.')
    }

    const payload = (await response.json()) as Partial<ClicToPayRedirectParams>
    if (!payload.params) {
      throw new Error('Réponse ClicToPay invalide.')
    }

    return {
      actionUrl: payload.actionUrl ?? CLIC_TO_PAY_URL,
      params: payload.params,
    }
  },
}
