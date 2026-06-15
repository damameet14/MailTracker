import { z } from 'zod'

export const emailSchema = z.string().trim().email().max(320)

export const contactSchema = z.object({
  id: z.string().min(1).optional(),
  firstName: z.string().trim().max(100).default(''),
  lastName: z.string().trim().max(100).default(''),
  displayName: z.string().trim().min(1).max(201),
  primaryEmail: emailSchema,
  additionalEmails: z.array(emailSchema).max(20).default([]),
  phone: z.string().trim().max(50).nullable().default(null),
  jobTitle: z.string().trim().max(150).nullable().default(null),
  companyId: z.string().nullable().default(null),
  tags: z.array(z.string().trim().min(1).max(50)).max(30).default([]),
  status: z.enum(['active', 'archived']).default('active'),
  source: z.enum(['manual', 'gmail', 'csv']).default('manual'),
})

export const sendTrackedEmailSchema = z.object({
  to: z.array(emailSchema).min(1).max(10),
  cc: z.array(emailSchema).max(10).default([]),
  bcc: z.array(emailSchema).max(10).default([]),
  subject: z.string().trim().min(1).max(998),
  htmlBody: z.string().min(1).max(100_000),
  plainTextBody: z.string().min(1).max(100_000),
  contactId: z.string().nullable().default(null),
  dealId: z.string().nullable().default(null),
  trackingEnabled: z.boolean(),
  idempotencyKey: z.string().uuid(),
})

export const apiErrorSchema = z.object({
  error: z.object({
    code: z.string(),
    message: z.string(),
    requestId: z.string(),
    details: z.record(z.string(), z.unknown()).optional(),
  }),
})

export type ContactInput = z.infer<typeof contactSchema>
export type SendTrackedEmailInput = z.infer<typeof sendTrackedEmailSchema>
