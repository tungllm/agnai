import dotenv from 'dotenv'

dotenv.config({ path: '.env' })

export const config = {
  port: +env('PORT', '3001'),
  db: {
    name: env('DB_NAME', 'pyg'),
  },
  kobold: {
    maxLength: +env('KOBOLD_MAX_LENGTH', '64'),
  },
  noRequestLogs: env('DISABLE_REQUEST_LOGGING', 'true') === 'true',
}

function env(key: string, fallback?: string): string {
  const value = process.env[key] || fallback || ''

  if (!value) {
    throw new Error(`Required environment variable not set: "${key}"`)
  }

  return value
}
