import { NextResponse } from 'next/server';
import OpenAI from 'openai';
import { bulletPolishSchema } from '@/lib/resume-schema';
import { createSupabaseServerClient } from '@/lib/supabase-server';

export const runtime = 'nodejs';
export async function POST(request: Request) {
  try {
    const supabase = await createSupabaseServerClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return NextResponse.json({ error: 'Sign in before using AI Polish.' }, { status: 401 });
    const { notes, role } = await request.json();
    if (typeof notes !== 'string' || notes.trim().length < 8) return NextResponse.json({ error: 'Add a little more detail before polishing.' }, { status: 400 });
    const completion = await new OpenAI({ apiKey: process.env.OPENAI_API_KEY }).chat.completions.create({ model: 'gpt-4o-mini', temperature: 0.2, response_format: { type: 'json_object' }, messages: [{ role: 'system', content: 'Return only JSON: {"bullets":["..."]}. Rewrite supplied notes as concise factual résumé bullets using this pattern when supported by supplied facts: Accomplished X, measured by Y, by doing Z. Preserve numbers; never invent metrics. Do not use markdown, prefaces, quotes, or these phrases: Leveraged, Spearheaded, Fostered, Delivered cutting-edge solutions, Passionate professional, Dynamic leader, Proven track record, Result-driven individual, Thrived in a fast-paced environment, Utilized strategic methodologies.' }, { role: 'user', content: `Role: ${role || 'Not provided'}\nNotes: ${notes}` }] });
    return NextResponse.json(bulletPolishSchema.parse(JSON.parse(completion.choices[0]?.message.content || '{}')));
  } catch (error) { return NextResponse.json({ error: error instanceof Error ? error.message : 'Unable to polish these notes.' }, { status: 422 }); }
}
