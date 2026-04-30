import type { MiddlewareHandler } from 'astro';

// Protected HTTP methods (require authentication)
const PROTECTED_METHODS = ['POST', 'PUT', 'PATCH', 'DELETE'];

/**
 * Basic Auth middleware for Arsenal Admin
 *
 * Protects mutating API routes:
 * - /api/resources (POST, PUT, DELETE)
 * - /api/tags (POST, DELETE)
 *
 * Public routes remain unprotected:
 * - All GET requests
 * - All page routes (HTML)
 *
 * The browser will show a native login popup on 401.
 * Credentials are sent with every subsequent request automatically.
 */
export const onRequest: MiddlewareHandler = async (context, next) => {
  const { request } = context;
  const url = new URL(request.url);

  // Only protect API routes
  if (!url.pathname.startsWith('/api/')) {
    return next();
  }

  // Only protect mutating methods
  const method = request.method.toUpperCase();
  if (!PROTECTED_METHODS.includes(method)) {
    return next();
  }

  // Check if admin credentials are configured
  // Use import.meta.env for Astro SSR (works in server context)
  const adminUser = import.meta.env.ADMIN_USER;
  const adminPassword = import.meta.env.ADMIN_PASSWORD;

  // If no credentials configured, deny all mutations for security
  if (!adminUser || !adminPassword) {
    // Return generic 500 without leaking configuration details
    return new Response('Server configuration error', { status: 500 });
  }

  // Extract Basic Auth credentials from Authorization header
  const authHeader = request.headers.get('Authorization');

  if (!authHeader || !authHeader.startsWith('Basic ')) {
    return createUnauthorizedResponse();
  }

  // Decode and validate credentials
  const credentials = decodeBasicAuth(authHeader);
  if (!credentials) {
    return createUnauthorizedResponse();
  }

  const [providedUser, providedPass] = credentials;

  // Timing-safe comparison to prevent timing attacks
  if (!timingSafeEqual(providedUser, adminUser) || !timingSafeEqual(providedPass, adminPassword)) {
    return createUnauthorizedResponse();
  }

  // Credentials valid, proceed with request
  return next();
};

function createUnauthorizedResponse(): Response {
  return new Response('Unauthorized', {
    status: 401,
    headers: {
      'WWW-Authenticate': 'Basic realm="Arsenal Admin"',
      'Content-Type': 'text/plain',
    },
  });
}

/**
 * Decode Basic Auth header value
 * Returns [username, password] or null if invalid
 */
function decodeBasicAuth(authHeader: string): [string, string] | null {
  try {
    // Base64 decode the credentials part
    const base64Credentials = authHeader.slice(6); // Remove "Basic " prefix
    const decoded = atob(base64Credentials);

    // Credentials should be "username:password"
    const colonIndex = decoded.indexOf(':');
    if (colonIndex === -1) {
      return null;
    }

    const username = decoded.slice(0, colonIndex);
    const password = decoded.slice(colonIndex + 1);

    return [username, password];
  } catch {
    return null;
  }
}

/**
 * Timing-safe string comparison to prevent timing attacks
 */
function timingSafeEqual(a: string, b: string): boolean {
  if (a.length !== b.length) {
    return false;
  }

  let result = 0;
  for (let i = 0; i < a.length; i++) {
    result |= a.charCodeAt(i) ^ b.charCodeAt(i);
  }

  return result === 0;
}