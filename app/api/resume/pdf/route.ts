import React from 'react';
import { renderToBuffer } from '@react-pdf/renderer';
import { NextResponse } from 'next/server';
import { ResumeDocument } from '@/components/resume-document';
import { profileSchema } from '@/lib/resume-schema';
import { regionalIssues } from '@/lib/content-guard';

export const runtime = 'nodejs';
export async function POST(request: Request) {
  try {
    const profile = profileSchema.parse(await request.json());
    const issues = regionalIssues(profile);
    if (issues.length) return NextResponse.json({ error: 'Add measurable outcomes before downloading.', issues }, { status: 422 });
    const pdf = await renderToBuffer(React.createElement(ResumeDocument, { profile }));
    return new NextResponse(pdf, { headers: { 'Content-Type': 'application/pdf', 'Content-Disposition': `attachment; filename="${profile.username}-resume.pdf"`, 'Cache-Control': 'no-store' } });
  } catch (error) { return NextResponse.json({ error: error instanceof Error ? error.message : 'Unable to generate résumé.' }, { status: 422 }); }
}
