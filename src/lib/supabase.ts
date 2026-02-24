// src/lib/supabase.ts
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

// Guard explicite — évite le crash silencieux
if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error(
    '❌ Variables Supabase manquantes dans .env.local\n' +
    'Ajoute NEXT_PUBLIC_SUPABASE_URL et NEXT_PUBLIC_SUPABASE_ANON_KEY\n' +
    'Trouve-les sur supabase.com → Settings → API'
  );
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// ─── Type Resource ────────────────────────────────────────────────────────────
export interface Resource {
  id: string;
  created_at: string;
  title: string;
  description: string | null;
  type: 'VIDEO' | 'PDF';
  url: string;
  subject: string | null;
  level: 'Débutant' | 'Intermédiaire' | 'Avancé' | null;
  xp: number;
  duration: string | null;
  pages: number | null;
  thumbnail: string | null;
  is_new: boolean;
  tags: string[] | null;
}

// ─── Fetch toutes les ressources ─────────────────────────────────────────────
export async function getResources(): Promise<Resource[]> {
  const { data, error } = await supabase
    .from('resources')
    .select('*')
    .order('created_at', { ascending: false });

  if (error) {
    console.error('[Supabase] Erreur:', error.message);
    return [];
  }

  return data as Resource[];
}