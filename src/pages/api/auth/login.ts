import type { APIRoute } from 'astro';
import { timingSafeEqual } from 'node:crypto';
import {
  SESSION_COOKIE,
  createSessionToken,
  getSessionCookieOptions,
} from '../../../lib/session';
import { checkRateLimit, LOGIN_RATE_LIMIT } from '../../../lib/rate-limit';

function getClientIp(request: Request, clientAddress: string): string {
  const flyIp = request.headers.get('fly-client-ip');
  if (flyIp) return flyIp.trim();
  const fwd = request.headers.get('x-forwarded-for');
  if (fwd) return fwd.split(',').pop()!.trim();
  return clientAddress || 'unknown';
}

function timingSafeEqualStr(a: string, b: string): boolean {
  const aBuf = Buffer.from(a, 'utf8');
  const bBuf = Buffer.from(b, 'utf8');
  if (aBuf.length !== bBuf.length) return false;
  return timingSafeEqual(aBuf, bBuf);
}

export const POST: APIRoute = async ({ request, cookies, clientAddress }) => {
  const ip = getClientIp(request, clientAddress);
  const limit = checkRateLimit(`login:${ip}`, LOGIN_RATE_LIMIT);
  if (!limit.allowed) {
    return new Response(
      JSON.stringify({ error: 'Demasiados intentos. Intentá de nuevo más tarde.' }),
      {
        status: 429,
        headers: {
          'Content-Type': 'application/json',
          'Retry-After': String(limit.retryAfterSeconds),
        },
      }
    );
  }

  const adminUser = process.env.ADMIN_USER ?? (import.meta.env.ADMIN_USER as string | undefined);
  const adminPass = process.env.ADMIN_PASSWORD ?? (import.meta.env.ADMIN_PASSWORD as string | undefined);

  if (!adminUser || !adminPass) {
    return new Response(JSON.stringify({ error: 'Server not configured' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  let body: { username?: unknown; password?: unknown };
  try {
    body = await request.json();
  } catch {
    return new Response(JSON.stringify({ error: 'Invalid request body' }), {
      status: 400,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  const username = typeof body.username === 'string' ? body.username : '';
  const password = typeof body.password === 'string' ? body.password : '';

  if (!username || !password) {
    return new Response(JSON.stringify({ error: 'Usuario y contraseña son obligatorios' }), {
      status: 400,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  if (!timingSafeEqualStr(username, adminUser) || !timingSafeEqualStr(password, adminPass)) {
    return new Response(JSON.stringify({ error: 'Usuario o contraseña inválidos' }), {
      status: 401,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  const token = createSessionToken(username);
  cookies.set(SESSION_COOKIE, token, getSessionCookieOptions());

  return new Response(JSON.stringify({ ok: true, username }), {
    status: 200,
    headers: { 'Content-Type': 'application/json' },
  });
};
