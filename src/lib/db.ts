import { neon } from '@neondatabase/serverless'

if (!process.env.DATABASE_URL) {
  throw new Error('DATABASE_URL manquant dans les variables d\'environnement')
}

export const sql = neon(process.env.DATABASE_URL)

// Helper générique pour les requêtes
export async function query<T>(
  queryStr: TemplateStringsArray,
  ...values: unknown[]
): Promise<T[]> {
  const result = await sql(queryStr, ...values)
  return result as T[]
}
