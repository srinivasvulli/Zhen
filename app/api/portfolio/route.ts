import { NextResponse } from 'next/server';
import { profileSchema } from '@/lib/resume-schema';
import { createSupabaseServerClient } from '@/lib/supabase-server';
import { persistPortfolio } from '@/lib/persist-profile';
export async function PUT(request: Request) { try { const supabase = await createSupabaseServerClient(); const { data: { user } } = await supabase.auth.getUser(); if (!user) return NextResponse.json({ error: 'Sign in before saving.' }, { status: 401 }); const profile = profileSchema.parse(await request.json()); await persistPortfolio(supabase, user.id, profile); return NextResponse.json({ profile }); } catch (error) { return NextResponse.json({ error: error instanceof Error ? error.message : 'Unable to save.' }, { status: 422 }); } }
