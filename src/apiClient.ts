import { auth } from './firebase';

/**
 * Authenticated fetch wrapper.
 * Automatically attaches Firebase Auth ID token to API requests when logged in.
 */
export async function apiFetch(
  url: string,
  options: RequestInit = {}
): Promise<Response> {
  const user = auth.currentUser;
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(options.headers as Record<string, string> || {}),
  };

  if (user) {
    try {
      const token = await user.getIdToken();
      headers['Authorization'] = `Bearer ${token}`;
    } catch (err) {
      console.error('Failed to get user ID token:', err);
    }
  }

  return fetch(url, {
    ...options,
    headers,
  });
}
