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

export const companySchema = z.object({
  name: z.string().trim().min(1).max(200),
  domain: z.string().trim().max(253).nullable().default(null),
  website: z.string().url().nullable().default(null),
  industry: z.string().trim().max(150).nullable().default(null),
  phone: z.string().trim().max(50).nullable().default(null),
  address: z.string().trim().max(500).nullable().default(null),
  tags: z.array(z.string().trim().min(1).max(50)).max(30).default([]),
  status: z.enum(['active', 'archived']).default('active'),
})

export const taskSchema = z.object({
  title: z.string().trim().min(1).max(300),
  description: z.string().trim().max(5000).nullable().default(null),
  contactId: z.string().nullable().default(null),
  companyId: z.string().nullable().default(null),
  dealId: z.string().nullable().default(null),
  dueAt: z.string().datetime().nullable().default(null),
  priority: z.enum(['low', 'normal', 'high']).default('normal'),
  status: z.enum(['open', 'completed', 'cancelled']).default('open'),
})

export const noteSchema = z.object({
  body: z.string().trim().min(1).max(20_000),
  contactId: z.string().nullable().default(null),
  companyId: z.string().nullable().default(null),
  dealId: z.string().nullable().default(null),
})

export const pipelineSchema = z.object({
  name: z.string().trim().min(1).max(200),
  description: z.string().trim().max(1000).nullable().default(null),
  isDefault: z.boolean().default(false),
  status: z.enum(['active', 'archived']).default('active'),
})

export const dealSchema = z.object({
  title: z.string().trim().min(1).max(300),
  contactId: z.string().nullable().default(null),
  companyId: z.string().nullable().default(null),
  pipelineId: z.string().min(1),
  stageId: z.string().min(1),
  value: z.number().nonnegative().nullable().default(null),
  currency: z.string().length(3).nullable().default(null),
  probability: z.number().min(0).max(100).nullable().default(null),
  expectedCloseDate: z.string().datetime().nullable().default(null),
  status: z.enum(['open', 'won', 'lost', 'archived']).default('open'),
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
export type CompanyInput = z.infer<typeof companySchema>
export type TaskInput = z.infer<typeof taskSchema>
export type NoteInput = z.infer<typeof noteSchema>
export type PipelineInput = z.infer<typeof pipelineSchema>
export type DealInput = z.infer<typeof dealSchema>
export type SendTrackedEmailInput = z.infer<typeof sendTrackedEmailSchema>
