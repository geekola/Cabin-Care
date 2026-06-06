import { Resend } from 'resend'

export const FROM_ADDRESS = 'Cabin Care <hello@cabincare.com>'

// Lazy — only instantiated when actually used, so a missing key doesn't crash the server on startup.
let _resend: Resend | null = null

export function getResend(): Resend {
  if (!process.env.RESEND_API_KEY) {
    throw new Error('RESEND_API_KEY is not set. Add it to your environment variables.')
  }
  if (!_resend) {
    _resend = new Resend(process.env.RESEND_API_KEY)
  }
  return _resend
}
