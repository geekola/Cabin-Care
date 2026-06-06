import type { Request, Response } from 'express'
import { Webhook } from 'svix'
import { prisma } from '../lib/prisma'

interface ClerkEmailAddress {
  email_address: string
  id: string
}

interface ClerkUserPayload {
  id: string
  first_name: string | null
  last_name: string | null
  email_addresses: ClerkEmailAddress[]
  primary_email_address_id: string
  phone_numbers: Array<{ phone_number: string; id: string }>
  primary_phone_number_id: string | null
  public_metadata: { role?: string } | null
}

interface ClerkWebhookEvent {
  type: string
  data: ClerkUserPayload
}

function getPrimaryEmail(data: ClerkUserPayload): string {
  const primary = data.email_addresses.find(
    (e) => e.id === data.primary_email_address_id,
  )
  return primary?.email_address ?? data.email_addresses[0]?.email_address ?? ''
}

function getPrimaryPhone(data: ClerkUserPayload): string | null {
  const primary = data.phone_numbers.find(
    (p) => p.id === data.primary_phone_number_id,
  )
  return primary?.phone_number ?? null
}

function getFullName(data: ClerkUserPayload): string {
  return [data.first_name, data.last_name].filter(Boolean).join(' ') || 'Unknown'
}

export async function clerkWebhookHandler(req: Request, res: Response) {
  const secret = process.env.CLERK_WEBHOOK_SECRET

  if (!secret) {
    console.error('CLERK_WEBHOOK_SECRET is not set')
    return res.status(500).json({ error: 'Webhook secret not configured' })
  }

  // Clerk uses svix for signed webhooks — must verify against raw body
  const svix_id = req.headers['svix-id'] as string
  const svix_timestamp = req.headers['svix-timestamp'] as string
  const svix_signature = req.headers['svix-signature'] as string

  if (!svix_id || !svix_timestamp || !svix_signature) {
    return res.status(400).json({ error: 'Missing svix headers' })
  }

  let event: ClerkWebhookEvent

  try {
    const wh = new Webhook(secret)
    event = wh.verify(req.body, {
      'svix-id': svix_id,
      'svix-timestamp': svix_timestamp,
      'svix-signature': svix_signature,
    }) as ClerkWebhookEvent
  } catch (err) {
    console.error('Webhook verification failed:', err)
    return res.status(400).json({ error: 'Invalid webhook signature' })
  }

  const { type, data } = event

  try {
    if (type === 'user.created') {
      const metaRole = data.public_metadata?.role
      const role =
        metaRole === 'staff' || metaRole === 'repair_tech' || metaRole === 'admin'
          ? metaRole
          : 'customer'

      await prisma.user.create({
        data: {
          clerkId: data.id,
          name: getFullName(data),
          email: getPrimaryEmail(data),
          phone: getPrimaryPhone(data),
          role,
          status: 'active',
        },
      })
      console.log(`User created: ${data.id}`)
    }

    if (type === 'user.updated') {
      await prisma.user.update({
        where: { clerkId: data.id },
        data: {
          name: getFullName(data),
          email: getPrimaryEmail(data),
          phone: getPrimaryPhone(data),
        },
      })
      console.log(`User updated: ${data.id}`)
    }

    if (type === 'user.deleted') {
      await prisma.user.update({
        where: { clerkId: data.id },
        data: { status: 'inactive' },
      })
      console.log(`User deactivated: ${data.id}`)
    }

    return res.status(200).json({ received: true })
  } catch (err) {
    console.error(`Error handling ${type}:`, err)
    return res.status(500).json({ error: 'Database error' })
  }
}
