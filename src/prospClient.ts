import { EndpointDef } from './endpoints.js';

const BASE_URL = 'https://prosp.ai';
const TIMEOUT_MS = 30_000;

export async function prospFetch(
  endpoint: EndpointDef,
  args: Record<string, unknown>,
): Promise<unknown> {
  const apiKey = process.env.PROSP_API_KEY;
  if (!apiKey) {
    throw new Error('PROSP_API_KEY environment variable is required');
  }

  // Build body: start from args, inject api key, handle url field renaming
  const body: Record<string, unknown> = { ...args };

  // Inject API key with the correct field name for this endpoint
  body[endpoint.apiKeyField] = apiKey;

  // Handle LinkedIn URL field name normalization:
  // The LLM always provides `linkedin_url` (snake_case), but some endpoints
  // expect `linkedinUrl` (camelCase). Rename when necessary.
  if (endpoint.urlField === 'linkedinUrl' && 'linkedin_url' in body) {
    body['linkedinUrl'] = body['linkedin_url'];
    delete body['linkedin_url'];
  }

  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), TIMEOUT_MS);

  let res: Response;
  try {
    res = await fetch(`${BASE_URL}${endpoint.path}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
      signal: controller.signal,
    });
  } catch (err) {
    if (err instanceof Error && err.name === 'AbortError') {
      return { error: true, status: 408, message: 'Request timeout' };
    }
    throw err;
  } finally {
    clearTimeout(timer);
  }

  if (!res.ok) {
    let message: string | undefined;
    let errorDetail: string | undefined;
    try {
      const errorJson = (await res.json()) as Record<string, unknown>;
      message =
        typeof errorJson['message'] === 'string' ? errorJson['message'] : undefined;
      errorDetail =
        typeof errorJson['error'] === 'string' ? errorJson['error'] : undefined;
    } catch {
      // ignore parse failures — use status text
    }
    return {
      error: true,
      status: res.status,
      message: message ?? errorDetail ?? res.statusText,
    };
  }

  try {
    return await res.json();
  } catch {
    return { error: true, status: res.status, message: 'Invalid JSON in response' };
  }
}
