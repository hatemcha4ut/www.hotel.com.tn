export const MERCHANT_ID = process.env.REACT_APP_CTP_MERCHANT_ID ?? 'AMERICAN-TOURS'
export const ACTION_URL = 'https://test.clictopay.com.tn/payment/rest/register.do'

export const generatePaymentParams = (orderId: string, amount: number) => ({
  userName: MERCHANT_ID,
  password: process.env.REACT_APP_CTP_PASSWORD,
  orderNumber: orderId,
  amount: Math.round(amount * 1000),
  currency: 788,
  returnUrl: 'https://www.hotel.com.tn/payment/success',
  failUrl: 'https://www.hotel.com.tn/payment/fail',
})
