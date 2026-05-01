/**
 * HTTP authentication helper.
 *
 * The server uses an HttpOnly session cookie set by /api/auth/login.
 * authFetch is now a thin wrapper around fetch that:
 *   - sends cookies (same-origin)
 *   - on 401, opens the inline auth modal so the user can re-authenticate
 *     without leaving the page; on success, retries the original request once.
 *   - falls back to redirecting to /login if the modal isn't mounted.
 */

import { err, ok, type Result } from './result'

export type AuthError =
  | { type: 'AUTH_REQUIRED'; message: string }
  | { type: 'AUTH_FAILED'; message: string }
  | { type: 'NETWORK_ERROR'; message: string }

export interface AuthFetchOptions extends RequestInit {
  /** User-facing description of the action that triggered re-auth (shown in modal). */
  authContext?: string
}

function openAuthModal(context?: string): boolean {
  if (typeof window === 'undefined') return false
  const modal = document.querySelector('[data-auth-modal="true"]') as HTMLDialogElement | null
  if (!modal) return false
  window.dispatchEvent(
    new CustomEvent('arsenal:open-auth-modal', { detail: { context } })
  )
  return true
}

function redirectToLogin(): void {
  if (typeof window === 'undefined') return
  const redirect = encodeURIComponent(window.location.pathname + window.location.search)
  window.location.href = `/login?redirect=${redirect}`
}

export async function authFetch(
  url: string,
  options: AuthFetchOptions = {}
): Promise<Result<Response, AuthError>> {
  const { authContext, ...fetchOptions } = options
  try {
    const response = await fetch(url, { ...fetchOptions, credentials: 'same-origin' })

    if (response.status !== 401) {
      return ok(response)
    }

    // Session expired or missing. Try modal flow; otherwise hand off to login page.
    const opened = openAuthModal(authContext)
    if (!opened) {
      redirectToLogin()
      return err({ type: 'AUTH_REQUIRED', message: 'Se requiere iniciar sesión' })
    }

    return await waitForAuthAndRetry(url, fetchOptions)
  } catch (error) {
    return err({
      type: 'NETWORK_ERROR',
      message: error instanceof Error ? error.message : 'Error de red',
    })
  }
}

function waitForAuthAndRetry(
  url: string,
  options: RequestInit
): Promise<Result<Response, AuthError>> {
  return new Promise((resolve) => {
    let timeoutId: ReturnType<typeof setTimeout>

    const cleanup = () => {
      window.removeEventListener('arsenal:auth-success', onSuccess)
      window.removeEventListener('arsenal:auth-cancelled', onCancel)
      clearTimeout(timeoutId)
    }

    const onSuccess = async () => {
      cleanup()
      try {
        const response = await fetch(url, { ...options, credentials: 'same-origin' })
        resolve(ok(response))
      } catch (error) {
        resolve(err({
          type: 'NETWORK_ERROR',
          message: error instanceof Error ? error.message : 'Error de red',
        }))
      }
    }

    const onCancel = () => {
      cleanup()
      resolve(err({ type: 'AUTH_REQUIRED', message: 'Inicio de sesión cancelado' }))
    }

    window.addEventListener('arsenal:auth-success', onSuccess)
    window.addEventListener('arsenal:auth-cancelled', onCancel)
    timeoutId = setTimeout(onCancel, 60_000)
  })
}
