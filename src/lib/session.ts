import { createHmac, timingSafeEqual } from 'node:crypto';

export const SESSION_COOKIE = 'arsenal_session';
export const SESSION_TTL_SECONDS = 60 * 60 * 24 * 7; // 7 days

interface SessionPayload {
  u: string;
  exp: number;
}

export interface Session {
  username: string;
  expiresAt: number;
}

function getSecret(): string {
  const secret =
    process.env.SESSION_SECRET ??
    (import.meta.env.SESSION_SECRET as string | undefined);
  if (!secret || secret.length < 16) {
    throw new Error(
      'SESSION_SECRET is not configured (or too short). Set a 32+ char random string in .env'
    );
  }
  return secret;
}

function b64urlEncode(input: Buffer | string): string {
  const buf = typeof input === 'string' ? Buffer.from(input, 'utf8') : input;
  return buf.toString('base64').replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
}

function b64urlDecode(input: string): Buffer {
  const padded = input.replace(/-/g, '+').replace(/_/g, '/');
  const pad = padded.length % 4 === 0 ? '' : '='.repeat(4 - (padded.length % 4));
  return Buffer.from(padded + pad, 'base64');
}

export function createSessionToken(username: string): string {
  const payload: SessionPayload = {
    u: username,
    exp: Math.floor(Date.now() / 1000) + SESSION_TTL_SECONDS,
  };
  const payloadB64 = b64urlEncode(JSON.stringify(payload));
  const sig = createHmac('sha256', getSecret()).update(payloadB64).digest();
  return `${payloadB64}.${b64urlEncode(sig)}`;
}

export function verifySessionToken(token: string | undefined | null): Session | null {
  if (!token || typeof token !== 'string') return null;
  const dot = token.indexOf('.');
  if (dot < 1 || dot === token.length - 1) return null;

  const payloadB64 = token.slice(0, dot);
  const sigB64 = token.slice(dot + 1);

  let providedSig: Buffer;
  try {
    providedSig = b64urlDecode(sigB64);
  } catch {
    return null;
  }

  const expectedSig = createHmac('sha256', getSecret()).update(payloadB64).digest();
  if (providedSig.length !== expectedSig.length) return null;
  if (!timingSafeEqual(providedSig, expectedSig)) return null;

  try {
    const json = b64urlDecode(payloadB64).toString('utf8');
    const payload = JSON.parse(json) as SessionPayload;
    if (typeof payload.u !== 'string' || typeof payload.exp !== 'number') return null;
    if (payload.exp < Math.floor(Date.now() / 1000)) return null;
    return { username: payload.u, expiresAt: payload.exp };
  } catch {
    return null;
  }
}

export function getSessionCookieOptions() {
  return {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'strict' as const,
    path: '/',
    maxAge: SESSION_TTL_SECONDS,
  };
}
