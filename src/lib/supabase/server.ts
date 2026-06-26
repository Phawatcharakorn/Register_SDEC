import { createServerClient, type CookieOptions } from '@supabase/ssr'
import { createClient as createSupabaseClient } from '@supabase/supabase-js'
import { cookies } from 'next/headers'
import type { Database } from '@/types/database'

/**
 * Session-aware server client for Server Components and Route Handlers.
 * Uses the anon key + cookie-based session — subject to RLS.
 */
export async function createSessionClient() {
  const cookieStore = await cookies()

  return createServerClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll: () => cookieStore.getAll(),
        setAll: (cookiesToSet: { name: string; value: string; options: CookieOptions }[]) => {
          try {
            cookiesToSet.forEach(({ name, value, options }) =>
              cookieStore.set(name, value, options),
            )
          } catch {
            // setAll is called from a Server Component — the cookie will be
            // set by the middleware on the next request instead.
          }
        },
      },
    },
  )
}

/**
 * Service-role admin client for Route Handlers that need to bypass RLS.
 * NEVER expose this to the browser. Only use in server-side code.
 * Note: untyped intentionally — types are applied at call sites via explicit casts.
 * Replace with `createSupabaseClient<Database>(...)` once types are auto-generated
 * via `npx supabase gen types typescript`.
 */
export function createAdminClient() {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  return createSupabaseClient<any>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    {
      auth: {
        autoRefreshToken: false,
        persistSession: false,
      },
    },
  )
}
