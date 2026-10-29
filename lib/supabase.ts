import { createClient } from '@supabase/supabase-js';

// Note: not passing the generated `Database` type to createClient here.
// supabase-js's generic table-inference machinery is version-sensitive
// (it changed shape across 2.x releases) and isn't worth coupling tightly
// to for a project this size. Row shapes are still fully typed via
// `types/database.ts` and used explicitly at each call site instead.
// Fall back to harmless placeholders when no project is configured yet, so
// the client can construct at import time (SSR, build) without throwing.
// Call sites (lib/itinerary-data.ts, JournalLog) check NEXT_PUBLIC_SUPABASE_URL
// themselves before actually issuing a request.
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://placeholder.supabase.co';
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'placeholder-anon-key';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
