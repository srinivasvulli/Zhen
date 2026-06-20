import { NextRequest, NextResponse } from 'next/server';

const rootDomain = (process.env.NEXT_PUBLIC_ROOT_DOMAIN || 'nolayout.com').toLowerCase();
const localHosts = new Set(['localhost', '127.0.0.1']);

export function middleware(request: NextRequest) {
  const host = (request.headers.get('host') || '').split(':')[0].toLowerCase();
  if (localHosts.has(host) || host === rootDomain || host === `www.${rootDomain}`) return NextResponse.next();

  const url = request.nextUrl.clone();
  const suffix = `.${rootDomain}`;
  if (host.endsWith(suffix)) {
    const username = host.slice(0, -suffix.length);
    if (username && username !== 'www') { url.pathname = `/portfolios/${username}${url.pathname === '/' ? '' : url.pathname}`; return NextResponse.rewrite(url); }
  }

  // Vercel maps a verified custom domain to this deployment. The page resolves it
  // against profiles.custom_domain without exposing an internal route in the URL.
  url.pathname = '/portfolios/__domain__';
  url.searchParams.set('domain', host);
  return NextResponse.rewrite(url);
}

export const config = { matcher: ['/((?!api|_next/static|_next/image|favicon.ico|robots.txt).*)'] };
