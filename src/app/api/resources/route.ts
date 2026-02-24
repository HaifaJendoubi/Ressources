// src/app/api/resources/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const type = searchParams.get('type');       // 'VIDEO' | 'PDF' | null
  const subject = searchParams.get('subject'); // ex: 'React'
  const level = searchParams.get('level');     // ex: 'Débutant'
  const search = searchParams.get('search');   // texte libre

  let query = supabase
    .from('resources')
    .select('*')
    .order('created_at', { ascending: false });

  // Filtres optionnels
  if (type && (type === 'VIDEO' || type === 'PDF')) {
    query = query.eq('type', type);
  }
  if (subject) {
    query = query.eq('subject', subject);
  }
  if (level) {
    query = query.eq('level', level);
  }
  if (search) {
    query = query.or(
      `title.ilike.%${search}%,description.ilike.%${search}%,subject.ilike.%${search}%`
    );
  }

  const { data, error } = await query;

  if (error) {
    return NextResponse.json(
      { error: error.message },
      { status: 500 }
    );
  }

  return NextResponse.json(data, {
    headers: {
      'Cache-Control': 'public, s-maxage=60, stale-while-revalidate=300',
    },
  });
}