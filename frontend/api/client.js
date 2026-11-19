// HTTP client for the FastAPI backend (Search & Matching subsystem).
//
// The base URL comes from EXPO_PUBLIC_API_URL (see frontend/.env.example).
// Expo only inlines EXPO_PUBLIC_* variables when they are read with this exact
// static expression, so do not refactor it into a dynamic lookup.
const DEFAULT_API_URL = 'http://127.0.0.1:8000';

export const API_BASE_URL = (process.env.EXPO_PUBLIC_API_URL || DEFAULT_API_URL).replace(/\/+$/, '');

const REQUEST_TIMEOUT_MS = 10000;

export class ApiError extends Error {
  // kind: 'network' | 'timeout' | 'unavailable' | 'invalid' | 'server'
  constructor(kind, message, status = null) {
    super(message);
    this.name = 'ApiError';
    this.kind = kind;
    this.status = status;
  }
}

function errorKind(status) {
  if (status === 503) return 'unavailable';
  if (status === 422 || status === 400) return 'invalid';
  return 'server';
}

async function request(path, { method = 'GET', body, signal, baseUrl = API_BASE_URL } = {}) {
  const controller = new AbortController();
  let timedOut = false;
  const timer = setTimeout(() => {
    timedOut = true;
    controller.abort();
  }, REQUEST_TIMEOUT_MS);
  const forwardAbort = () => controller.abort();
  signal?.addEventListener?.('abort', forwardAbort);

  try {
    let response;
    try {
      response = await fetch(`${baseUrl}${path}`, {
        method,
        headers: body === undefined ? undefined : { 'Content-Type': 'application/json' },
        body: body === undefined ? undefined : JSON.stringify(body),
        signal: controller.signal,
      });
    } catch (error) {
      if (signal?.aborted) {
        throw error; // caller cancelled; let it see the AbortError
      }
      if (timedOut) {
        throw new ApiError('timeout', `Request to ${path} timed out.`);
      }
      throw new ApiError('network', `Cannot reach the server at ${baseUrl}.`);
    }

    if (!response.ok) {
      let detail = '';
      try {
        const data = await response.json();
        detail = typeof data?.detail === 'string' ? data.detail : '';
      } catch {
        // response body was not JSON
      }
      throw new ApiError(
        errorKind(response.status),
        detail || `Request to ${path} failed with status ${response.status}.`,
        response.status,
      );
    }

    return await response.json();
  } finally {
    clearTimeout(timer);
    signal?.removeEventListener?.('abort', forwardAbort);
  }
}

// GET /ingredients -> [{ id, name_en, name_zh, aliases }]
export async function fetchIngredients(options) {
  const data = await request('/ingredients', options);
  return data.ingredients ?? [];
}

// POST /search -> ranked RecipeMatch list (full matches first).
export async function searchRecipes(ingredients, options) {
  const data = await request('/search', {
    ...options,
    method: 'POST',
    body: { ingredients },
  });
  return data.results ?? [];
}
