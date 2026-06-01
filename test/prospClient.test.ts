import { vi, describe, it, expect, beforeEach, afterEach } from 'vitest';
import { ENDPOINTS } from '../src/endpoints.js';
import { prospFetch } from '../src/prospClient.js';

// ── helpers ──────────────────────────────────────────────────────────────────

/** Build a minimal mock fetch that returns `body` with the given status. */
function makeMockFetch(status: number, body: unknown) {
  return vi.fn().mockResolvedValue({
    ok: status >= 200 && status < 300,
    status,
    statusText: status === 401 ? 'Unauthorized' : 'OK',
    json: vi.fn().mockResolvedValue(body),
  });
}

/** Parse the JSON body that was sent in the last fetch call. */
function getSentBody(mockFetch: ReturnType<typeof vi.fn>): Record<string, unknown> {
  const call = mockFetch.mock.calls[0];
  // call[1] is the RequestInit; body is a JSON string
  return JSON.parse(call[1].body as string) as Record<string, unknown>;
}

// ── setup / teardown ─────────────────────────────────────────────────────────

beforeEach(() => {
  process.env.PROSP_API_KEY = 'test-key-123';
});

afterEach(() => {
  delete process.env.PROSP_API_KEY;
  vi.restoreAllMocks();
});

// ── API key injection ─────────────────────────────────────────────────────────

describe('API key injection', () => {
  it('injects api_key in body when endpoint.apiKeyField === "api_key"', async () => {
    const endpoint = ENDPOINTS.find((e) => e.toolName === 'leads_add')!;
    const mockFetch = makeMockFetch(200, { ok: true });
    vi.stubGlobal('fetch', mockFetch);

    await prospFetch(endpoint, { linkedin_url: 'https://linkedin.com/in/foo', list_id: 'l1', campaign_id: 'c1' });

    const body = getSentBody(mockFetch);
    expect(body).toHaveProperty('api_key', 'test-key-123');
    expect(body).not.toHaveProperty('apiKey');
  });

  it('injects apiKey in body when endpoint.apiKeyField === "apiKey"', async () => {
    const endpoint = ENDPOINTS.find((e) => e.toolName === 'leads_add_contact')!;
    const mockFetch = makeMockFetch(200, { ok: true });
    vi.stubGlobal('fetch', mockFetch);

    await prospFetch(endpoint, { linkedin_url: 'https://linkedin.com/in/foo', list_id: 'l1' });

    const body = getSentBody(mockFetch);
    expect(body).toHaveProperty('apiKey', 'test-key-123');
    expect(body).not.toHaveProperty('api_key');
  });

  it('never includes api_key/apiKey in the original args (caller did not pass them)', async () => {
    const endpoint = ENDPOINTS.find((e) => e.toolName === 'leads_add')!;
    const mockFetch = makeMockFetch(200, { ok: true });
    vi.stubGlobal('fetch', mockFetch);

    const originalArgs = { linkedin_url: 'https://linkedin.com/in/foo', list_id: 'l1', campaign_id: 'c1' };
    await prospFetch(endpoint, originalArgs);

    // The original args object must not have been mutated with api_key/apiKey
    expect(originalArgs).not.toHaveProperty('api_key');
    expect(originalArgs).not.toHaveProperty('apiKey');
  });

  it('throws with "PROSP_API_KEY environment variable is required" when env is not set', async () => {
    delete process.env.PROSP_API_KEY;
    const endpoint = ENDPOINTS.find((e) => e.toolName === 'leads_add')!;

    await expect(
      prospFetch(endpoint, { linkedin_url: 'https://linkedin.com/in/foo', list_id: 'l1', campaign_id: 'c1' }),
    ).rejects.toThrow('PROSP_API_KEY environment variable is required');
  });
});

// ── URL field renaming ────────────────────────────────────────────────────────

describe('URL field renaming', () => {
  it('keeps linkedin_url unchanged when urlField === "linkedin_url"', async () => {
    // leads_add has urlField: 'linkedin_url'
    const endpoint = ENDPOINTS.find((e) => e.toolName === 'leads_add')!;
    expect(endpoint.urlField).toBe('linkedin_url');

    const mockFetch = makeMockFetch(200, { ok: true });
    vi.stubGlobal('fetch', mockFetch);

    await prospFetch(endpoint, { linkedin_url: 'https://linkedin.com/in/foo', list_id: 'l1', campaign_id: 'c1' });

    const body = getSentBody(mockFetch);
    expect(body).toHaveProperty('linkedin_url', 'https://linkedin.com/in/foo');
    expect(body).not.toHaveProperty('linkedinUrl');
  });

  it('renames linkedin_url → linkedinUrl when urlField === "linkedinUrl" and removes original key', async () => {
    // leads_add_contact has urlField: 'linkedinUrl'
    const endpoint = ENDPOINTS.find((e) => e.toolName === 'leads_add_contact')!;
    expect(endpoint.urlField).toBe('linkedinUrl');

    const mockFetch = makeMockFetch(200, { ok: true });
    vi.stubGlobal('fetch', mockFetch);

    await prospFetch(endpoint, { linkedin_url: 'https://linkedin.com/in/foo', list_id: 'l1' });

    const body = getSentBody(mockFetch);
    expect(body).toHaveProperty('linkedinUrl', 'https://linkedin.com/in/foo');
    expect(body).not.toHaveProperty('linkedin_url');
  });

  it('passes args without any URL renaming when endpoint has no urlField', async () => {
    // campaigns_analytics has urlField: undefined
    const endpoint = ENDPOINTS.find((e) => e.toolName === 'campaigns_analytics')!;
    expect(endpoint.urlField).toBeUndefined();

    const mockFetch = makeMockFetch(200, { data: [] });
    vi.stubGlobal('fetch', mockFetch);

    await prospFetch(endpoint, { start_date: '01-06-2026' });

    const body = getSentBody(mockFetch);
    expect(body).toHaveProperty('start_date', '01-06-2026');
    expect(body).not.toHaveProperty('linkedin_url');
    expect(body).not.toHaveProperty('linkedinUrl');
  });
});

// ── HTTP request / response behaviour ────────────────────────────────────────

describe('HTTP request / response', () => {
  it('returns parsed JSON on a successful 200 response', async () => {
    const endpoint = ENDPOINTS.find((e) => e.toolName === 'campaigns_analytics')!;
    const responseData = { campaigns: [{ id: 'c1', sent: 10 }] };
    const mockFetch = makeMockFetch(200, responseData);
    vi.stubGlobal('fetch', mockFetch);

    const result = await prospFetch(endpoint, {});

    expect(result).toEqual(responseData);
  });

  it('returns { error: true, status, message } on an HTTP error (401)', async () => {
    const endpoint = ENDPOINTS.find((e) => e.toolName === 'campaigns_analytics')!;
    const mockFetch = makeMockFetch(401, { message: 'Invalid API key' });
    vi.stubGlobal('fetch', mockFetch);

    const result = await prospFetch(endpoint, {});

    expect(result).toEqual({ error: true, status: 401, message: 'Invalid API key' });
  });

  it('POSTs to https://prosp.ai{endpoint.path} with Content-Type: application/json', async () => {
    const endpoint = ENDPOINTS.find((e) => e.toolName === 'leads_add')!;
    const mockFetch = makeMockFetch(200, { ok: true });
    vi.stubGlobal('fetch', mockFetch);

    await prospFetch(endpoint, { linkedin_url: 'https://linkedin.com/in/foo', list_id: 'l1', campaign_id: 'c1' });

    expect(mockFetch).toHaveBeenCalledOnce();
    const [url, init] = mockFetch.mock.calls[0] as [string, RequestInit];
    expect(url).toBe(`https://prosp.ai${endpoint.path}`);
    expect(init.method).toBe('POST');
    expect((init.headers as Record<string, string>)['Content-Type']).toBe('application/json');
  });
});
