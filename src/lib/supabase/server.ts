import { cookies } from 'next/headers';
import {
  createServerComponentClient,
  createRouteHandlerClient,
} from '@supabase/auth-helpers-nextjs';

export function createSupabaseServer() {
  return createServerComponentClient({ cookies });
}

export function createSupabaseRoute() {
  return createRouteHandlerClient({ cookies });
}