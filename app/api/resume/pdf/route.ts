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
    // @react-pdf/renderer currently ships React element typings that differ from
    // React 19's createElement return type. The document is valid at runtime.
    const document = React.createElement(ResumeDocument, { profile }) as unknown as Parameters<typeof renderToBuffer>[0];
    const pdf = await renderToBuffer(document);
    return new NextResponse(pdf, { headers: { 'Content-Type': 'application/pdf', 'Content-Disposition': `attachment; filename="${profile.username}-resume.pdf"`, 'Cache-Control': 'no-store' } });
  } catch (error) { return NextResponse.json({ error: error instanceof Error ? error.message : 'Unable to generate résumé.' }, { status: 422 }); }
}
