import type { APIRoute } from 'astro';

/**
 * Returns 200 if the request has a valid session.
 * Middleware enforces the session check before this handler runs,
 * so reaching here means the session is valid.
 */
export const GET: APIRoute = async ({ locals }) => {
  return new Response(
    JSON.stringify({ ok: true, username: locals.session?.username ?? null }),
    { status: 200, headers: { 'Content-Type': 'application/json' } }
  );
};
