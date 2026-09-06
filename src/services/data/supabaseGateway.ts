import { isSupabaseConfigured, supabase } from '../../lib/supabase';

/**
 * Single gateway for backend access.
 * UI components should depend on domain services, not on the Supabase SDK directly.
 */
export const supabaseGateway = {
  isConfigured: isSupabaseConfigured,

  get client() {
    if (!supabase) {
      throw new Error(
        'Supabase não configurado. Defina VITE_SUPABASE_URL e VITE_SUPABASE_ANON_KEY.'
      );
    }

    return supabase;
  },
};
