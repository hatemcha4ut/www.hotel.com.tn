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

// Legacy constants replaced with Vite env variables
// These should be configured via environment variables, not hardcoded
export const MERCHANT_ID = import.meta.env.VITE_CTP_MERCHANT_ID ?? 'AMERICAN-TOURS'
export const ACTION_URL =
  import.meta.env.VITE_CTP_ACTION_URL ?? 'https://test.clictopay.com.tn/payment/rest/register.do'
export const RETURN_URL =
  import.meta.env.VITE_CTP_RETURN_URL ?? 'https://www.hotel.com.tn/payment/success'
export const FAIL_URL = import.meta.env.VITE_CTP_FAIL_URL ?? 'https://www.hotel.com.tn/payment/fail'

const TUNISIAN_DINAR_CODE = 788
const toMillimes = (value: number) => Math.round(value * 1000)

const assertValidAmount = (value: number) => {
  if (!Number.isFinite(value) || value <= 0) {
    throw new Error('Invalid payment amount')
  }
}

/**
 * SECURITY WARNING: This function exposes payment credentials on the client side.
 * In production, payment parameter generation should be done server-side only.
 * The password should NEVER be exposed to the frontend.
 * 
 * This function is deprecated and should not be used. All payment initiation
 * should go through the backend checkout-initiate flow.
 * 
 * @deprecated Use checkout-initiate backend endpoint instead
 */
export const generatePaymentParams = (orderId: string, amount: number) => {
  assertValidAmount(amount)
  
  // Check if password is configured - it should NOT be in frontend env
  const password = import.meta.env.VITE_CTP_PASSWORD
  
  if (!password) {
    throw new Error('Payment generation must be done server-side. Use checkout-initiate endpoint.')
  }
  
  console.warn(
    'SECURITY WARNING: generatePaymentParams is deprecated. ' +
    'Payment credentials should never be exposed to the client. ' +
    'Use the checkout-initiate backend endpoint instead.'
  )

  return {
    userName: MERCHANT_ID,
    password,
    orderNumber: orderId,
    amount: toMillimes(amount),
    currency: TUNISIAN_DINAR_CODE,
    returnUrl: RETURN_URL,
    failUrl: FAIL_URL,
  }
}
