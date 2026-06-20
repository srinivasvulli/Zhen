import { NextResponse } from 'next/server';
import OpenAI from 'openai';
import mammoth from 'mammoth';
import pdf from 'pdf-parse';
import { parsedResumeSchema, profileSchema } from '@/lib/resume-schema';
import { createSupabaseServerClient } from '@/lib/supabase-server';
import { persistPortfolio } from '@/lib/persist-profile';

export const runtime = 'nodejs';
const MAX_FILE_BYTES = 5 * 1024 * 1024;
const PARSER_PROMPT = `You are an expert resume parser. Extract the user's details, work history, education, projects, and skills from the text provided. You must return a valid JSON object matching this schema exactly, without markdown wrapping or explanations:
{ "full_name": "", "email": "", "phone": "", "location": "", "summary": "", "skills": [], "experiences": [{ "company": "", "role": "", "start_date": "", "end_date": "", "description": ["bullet 1", "bullet 2"] }], "projects": [{ "title": "", "description": "", "bullets": ["bullet 1"] }] }
Fix spelling, standardize dates to 'MM/YYYY' formats, and clean up broken text formatting. Return an additional education array only when education is found.`;

async function extractText(file: File) {
  const buffer = Buffer.from(await file.arrayBuffer());
  if (file.type === 'application/pdf') return (await pdf(buffer)).text;
  if (file.type === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document') return (await mammoth.extractRawText({ buffer })).value;
  throw new Error('Only PDF and DOCX files are supported.');
}

export async function POST(request: Request) {
  try {
    const supabase = await createSupabaseServerClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return NextResponse.json({ error: 'Sign in before importing a résumé.' }, { status: 401 });
    const form = await request.formData();
    const file = form.get('resume');
    if (!(file instanceof File)) return NextResponse.json({ error: 'A résumé file is required.' }, { status: 400 });
    if (file.size > MAX_FILE_BYTES) return NextResponse.json({ error: 'The file must be 5MB or smaller.' }, { status: 400 });
    const text = (await extractText(file)).replace(/\s+/g, ' ').trim();
    if (text.length < 80) return NextResponse.json({ error: 'The résumé did not contain enough selectable text.' }, { status: 422 });
    const completion = await new OpenAI({ apiKey: process.env.OPENAI_API_KEY }).chat.completions.create({ model: 'gpt-4o-mini', temperature: 0, response_format: { type: 'json_object' }, messages: [{ role: 'system', content: PARSER_PROMPT }, { role: 'user', content: text.slice(0, 50000) }] });
    const parsed = parsedResumeSchema.parse(JSON.parse(completion.choices[0]?.message.content || '{}'));
    const username = (parsed.username || parsed.full_name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '')).slice(0, 40);
    const portfolio = profileSchema.parse({ ...parsed, username, theme_slug: 'minimalist' });
    await persistPortfolio(supabase, user.id, portfolio);
    return NextResponse.json({ portfolio });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unable to parse this résumé.';
    return NextResponse.json({ error: message }, { status: 422 });
  }
}
