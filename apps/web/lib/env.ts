import { z } from 'zod'

const serverEnvSchema = z.object({
  NODE_ENV: z.enum(['development', 'test', 'production']).default('development'),
  NEXT_PUBLIC_APP_URL: z.string().url(),
  FIREBASE_PROJECT_ID: z.string().min(1),
  FIREBASE_CLIENT_EMAIL: z.string().email().optional(),
  FIREBASE_PRIVATE_KEY: z.string().min(1).optional(),
  ALLOWED_OWNER_EMAIL: z.string().email().optional().or(z.literal('')),
  GOOGLE_GMAIL_CLIENT_ID: z.string().optional(),
  GOOGLE_GMAIL_CLIENT_SECRET: z.string().optional(),
  GOOGLE_GMAIL_REDIRECT_URI: z.string().url().optional(),
  GMAIL_TOKEN_ENCRYPTION_KEY: z.string().optional(),
  GMAIL_PROVIDER: z.enum(['mock', 'google']).default('mock'),
  TRACKING_HMAC_SECRET: z.string().min(32),
  TRACKING_BASE_URL: z.string().url(),
})

let cached: z.infer<typeof serverEnvSchema> | null = null

export function getServerEnv() {
  if (!cached) cached = serverEnvSchema.parse(process.env)
  return cached
}
