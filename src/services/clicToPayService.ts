export interface ClicToPayRedirectParams {
  actionUrl: string
  params: Record<string, string>
}

const CLIC_TO_PAY_URL =
  import.meta.env.VITE_CLIC_TO_PAY_URL ?? 'https://www.clictopay.com.tn'
const CLIC_TO_PAY_USERNAME = import.meta.env.VITE_CLIC_TO_PAY_USERNAME
const CLIC_TO_PAY_PASSWORD = import.meta.env.VITE_CLIC_TO_PAY_PASSWORD

export const clicToPayService = {
  getRedirectParams(amount: number, orderId: string): ClicToPayRedirectParams {
    if (!CLIC_TO_PAY_USERNAME || !CLIC_TO_PAY_PASSWORD) {
      throw new Error('Identifiants ClicToPay manquants.')
    }
    if (!Number.isFinite(amount) || amount <= 0) {
      throw new Error('Le montant doit être supérieur à zéro.')
    }

    return {
      actionUrl: CLIC_TO_PAY_URL,
      params: {
        userName: CLIC_TO_PAY_USERNAME,
        password: CLIC_TO_PAY_PASSWORD,
        amount: amount.toFixed(3),
        orderId,
        currency: 'TND',
      },
    }
  },
}
