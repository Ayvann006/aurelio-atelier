import { createClient } from '@supabase/supabase-js'

// Next.js parchea el fetch global y por defecto cachea las respuestas (force-cache).
// Como supabase-js usa fetch por dentro, sin esto las consultas quedaban con datos
// viejos (ej: un horario bloqueado que se elimina seguía apareciendo como bloqueado).
// Forzamos 'no-store' para que cada consulta a Supabase sea siempre en tiempo real.
const noStoreFetch = (input: RequestInfo | URL, init?: RequestInit) =>
  fetch(input, { ...init, cache: 'no-store' })

export function createServiceClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL || ''
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY || ''
  return createClient(url, key, { global: { fetch: noStoreFetch } })
}

export function createPublicClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL || ''
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || ''
  return createClient(url, key, { global: { fetch: noStoreFetch } })
}

export const supabase = typeof window !== 'undefined'
  ? createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL || '',
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || ''
    )
  : ({} as any)

export async function getConfiguracionSitio() {
  try {
    const supabase = createServiceClient()
    const { data } = await supabase.from('configuracion_sitio').select('*').eq('id', 1).maybeSingle()
    return data ?? {}
  } catch {
    return {}
  }
}
