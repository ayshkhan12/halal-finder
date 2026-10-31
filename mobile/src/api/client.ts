import Constants from 'expo-constants';
import { Platform } from 'react-native';

/**
 * Where the API lives:
 * 1. EXPO_PUBLIC_API_URL if set (staging/production builds).
 * 2. In development, the same machine that serves the JS bundle, on port 3000.
 *    This lets a phone running Expo Go on the same Wi-Fi reach the local API.
 */
function resolveBaseUrl() {
  const fromEnv = process.env.EXPO_PUBLIC_API_URL;
  if (fromEnv) return fromEnv.replace(/\/$/, '');
  if (Platform.OS === 'web' && typeof window !== 'undefined') {
    return `${window.location.protocol}//${window.location.hostname}:3000/api/v1`;
  }
  const host = Constants.expoConfig?.hostUri?.split(':')[0];
  return `http://${host ?? 'localhost'}:3000/api/v1`;
}

export const API_URL = resolveBaseUrl();

export class ApiError extends Error {
  constructor(
    public status: number,
    public code: string,
    message: string,
    public fields?: Record<string, string>,
  ) {
    super(message);
  }
  get isNetwork() {
    return this.status === 0;
  }
}

type Params = Record<string, string | number | boolean | string[] | undefined | null>;

export function toQuery(params: Params = {}) {
  const search = new URLSearchParams();
  for (const [key, value] of Object.entries(params)) {
    if (value === undefined || value === null || value === false || value === '') continue;
    if (Array.isArray(value)) {
      if (value.length) search.set(key, value.join(','));
    } else {
      search.set(key, String(value));
    }
  }
  const qs = search.toString();
  return qs ? `?${qs}` : '';
}

let authToken: string | null = null;
export const setAuthToken = (token: string | null) => {
  authToken = token;
};

type Options = { method?: string; body?: unknown; params?: Params; signal?: AbortSignal; timeoutMs?: number };

export async function api<T>(path: string, { method = 'GET', body, params, signal, timeoutMs = 10000 }: Options = {}): Promise<T> {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeoutMs);
  signal?.addEventListener('abort', () => controller.abort());

  let res: Response;
  try {
    res = await fetch(`${API_URL}${path}${toQuery(params)}`, {
      method,
      signal: controller.signal,
      headers: {
        Accept: 'application/json',
        ...(body ? { 'Content-Type': 'application/json' } : {}),
        ...(authToken ? { Authorization: `Bearer ${authToken}` } : {}),
      },
      body: body ? JSON.stringify(body) : undefined,
    });
  } catch {
    throw new ApiError(0, 'network', "Can't reach Halal Finder right now. Check your connection and try again.");
  } finally {
    clearTimeout(timer);
  }

  if (res.status === 204) return undefined as T;
  const json = await res.json().catch(() => null);
  if (!res.ok) {
    const err = json?.error;
    throw new ApiError(res.status, err?.code ?? 'error', err?.message ?? 'Something went wrong.', err?.fields);
  }
  return json as T;
}
