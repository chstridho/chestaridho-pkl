import { cookies } from 'next/headers';
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs';

export function createSupabaseRoute() {
  return createRouteHandlerClient({ cookies });
}