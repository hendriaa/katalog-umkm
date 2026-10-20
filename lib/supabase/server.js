import { createClient } from "@supabase/supabase-js";

/**
 * Membuat client Supabase untuk server menggunakan SUPABASE_SECRET_KEY.
 * Digunakan untuk membaca data publik (seperti katalog dan detail produk) di sisi server,
 * melewati batasan Row Level Security (RLS).
 */
export function createServerClient() {
  const supabaseUrl = process.env.SUPABASE_URL;
  const supabaseSecretKey = process.env.SUPABASE_SECRET_KEY;

  if (!supabaseUrl || !supabaseSecretKey) {
    throw new Error(
      "SUPABASE_URL dan SUPABASE_SECRET_KEY belum diisi di environment variable."
    );
  }

  return createClient(supabaseUrl, supabaseSecretKey, {
    auth: {
      persistSession: false,
      autoRefreshToken: false,
    },
  });
}

export const createClientServer = createServerClient;
export default createServerClient;

