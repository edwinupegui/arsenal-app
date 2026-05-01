import type { MiddlewareHandler } from 'astro';
import { createDb } from './db/index';
import { SESSION_COOKIE, verifySessionToken } from './lib/session';

const PROTECTED_API_METHODS = ['POST', 'PUT', 'PATCH', 'DELETE'];

// Auth-flow endpoints that must remain accessible without a session.
const AUTH_BYPASS_PATHS = new Set(['/api/auth/login']);

// Pages where the admin UI lives. We gate them client-friendly: if no
// session, redirect to /login?redirect=<original>.
const ADMIN_PAGE_PREFIXES = ['/recursos/new', '/recursos/trash'];
const ADMIN_PAGE_SUFFIXES = ['/edit', '/delete', '/restore', '/permanent'];

function isAdminPage(pathname: string): boolean {
  if (ADMIN_PAGE_PREFIXES.some((p) => pathname === p || pathname.startsWith(p + '/'))) {
    return true;
  }
  if (pathname.startsWith('/recursos/')) {
    return ADMIN_PAGE_SUFFIXES.some((s) => pathname.endsWith(s));
  }
  return false;
}

function unauthorized(): Response {
  return new Response(JSON.stringify({ error: 'Unauthorized', needsAuth: true }), {
    status: 401,
    headers: { 'Content-Type': 'application/json' },
  });
}

export const onRequest: MiddlewareHandler = async (context, next) => {
  const { request, cookies } = context;
  const url = new URL(request.url);
  const method = request.method.toUpperCase();

  // Attach DB + session to locals for downstream handlers.
  context.locals.db = createDb();
  const sessionCookie = cookies.get(SESSION_COOKIE)?.value;
  context.locals.session = sessionCookie ? verifySessionToken(sessionCookie) : null;

  const isApi = url.pathname.startsWith('/api/');

  // Always allow auth-flow endpoints.
  if (AUTH_BYPASS_PATHS.has(url.pathname)) {
    return next();
  }

  // API: gate mutating methods on session.
  if (isApi) {
    if (!PROTECTED_API_METHODS.includes(method)) return next();
    if (!context.locals.session) return unauthorized();
    return next();
  }

  // Pages: gate admin pages on session, redirect to /login otherwise.
  if (isAdminPage(url.pathname)) {
    if (!context.locals.session) {
      const redirectTo = encodeURIComponent(url.pathname + url.search);
      return Response.redirect(new URL(`/login?redirect=${redirectTo}`, url), 302);
    }
  }

  return next();
};
