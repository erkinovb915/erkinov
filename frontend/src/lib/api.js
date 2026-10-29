/**
 * API client configured via VITE_API_BASE_URL for Netlify + separate FastAPI deployment.
 * Falls back to relative `/api` paths when VITE_API_BASE_URL is unset (e.g. Vite dev proxy).
 * Never contains or exposes admin secrets.
 */

const rawEnvUrl = (import.meta.env.VITE_API_BASE_URL || '').trim();
export const API_BASE_URL = rawEnvUrl.replace(/\/+$/, '');

function buildUrl(path) {
  const normalizedPath = path.startsWith('/') ? path : `/${path}`;
  return API_BASE_URL ? `${API_BASE_URL}${normalizedPath}` : normalizedPath;
}

async function fetchJson(path, options = {}, timeoutMs = 8000) {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeoutMs);

  try {
    const response = await fetch(buildUrl(path), {
      ...options,
      signal: controller.signal,
      headers: {
        Accept: 'application/json',
        ...(options.body ? { 'Content-Type': 'application/json' } : {}),
        ...(options.headers || {}),
      },
    });

    const contentType = response.headers.get('content-type') || '';
    const isJson = contentType.includes('application/json');
    const data = isJson ? await response.json() : null;

    if (!response.ok) {
      let detail = `Request failed (${response.status})`;
      if (data?.detail) {
        if (typeof data.detail === 'string') {
          detail = data.detail;
        } else if (Array.isArray(data.detail)) {
          detail = data.detail
            .map((err) => {
              const field = err.loc?.[err.loc.length - 1];
              return field ? `${field}: ${err.msg}` : err.msg;
            })
            .join(' • ');
        }
      } else if (!isJson) {
        detail =
          'Backend API endpoint was not reached. Configure VITE_API_BASE_URL on Netlify to point to your deployed FastAPI server.';
      }
      const error = new Error(detail);
      error.status = response.status;
      throw error;
    }

    if (!isJson || data === null) {
      throw new Error(
        'Received non-JSON response. Ensure VITE_API_BASE_URL points to the FastAPI backend.'
      );
    }

    return data;
  } catch (err) {
    if (err.name === 'AbortError') {
      throw new Error('Backend request timed out. Please verify the API server is online.');
    }
    throw err;
  } finally {
    clearTimeout(timer);
  }
}

export async function checkApiHealth() {
  return fetchJson('/api/health', { method: 'GET' }, 5000);
}

export async function fetchPortfolioData() {
  return fetchJson('/api/portfolio', { method: 'GET' }, 6500);
}

export async function fetchProjects() {
  return fetchJson('/api/projects', { method: 'GET' }, 6500);
}

export async function fetchProjectById(projectId) {
  return fetchJson(`/api/projects/${encodeURIComponent(projectId)}`, { method: 'GET' }, 6500);
}

/**
 * Sends visitor contact message to FastAPI -> PostgreSQL.
 * Resolves ONLY when PostgreSQL confirms saving (`confirmed === true` and integer `id`).
 */
export async function submitContactForm(payload) {
  const result = await fetchJson(
    '/api/contact',
    {
      method: 'POST',
      body: JSON.stringify(payload),
    },
    12000
  );

  if (!result || result.confirmed !== true || typeof result.id !== 'number') {
    throw new Error('Database confirmation was not received from the backend.');
  }

  return result;
}
