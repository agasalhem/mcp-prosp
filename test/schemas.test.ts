import { describe, it, expect } from 'vitest';
import { z } from 'zod';
import { SCHEMAS } from '../src/schemas.js';

// ── leads_add ─────────────────────────────────────────────────────────────────

describe('leads_add schema', () => {
  it('passes with required fields (linkedin_url, list_id, campaign_id)', () => {
    const result = SCHEMAS['leads_add'].safeParse({
      linkedin_url: 'https://linkedin.com/in/foo',
      list_id: 'l1',
      campaign_id: 'c1',
    });
    expect(result.success).toBe(true);
  });

  it('fails when campaign_id is missing', () => {
    const result = SCHEMAS['leads_add'].safeParse({
      linkedin_url: 'https://linkedin.com/in/foo',
      list_id: 'l1',
    });
    expect(result.success).toBe(false);
  });

  it('accepts data as array of { property, value } objects', () => {
    const result = SCHEMAS['leads_add'].safeParse({
      linkedin_url: 'https://linkedin.com/in/foo',
      list_id: 'l1',
      campaign_id: 'c1',
      data: [{ property: 'x', value: 'y' }],
    });
    expect(result.success).toBe(true);
  });
});

// ── leads_get_conversation ────────────────────────────────────────────────────

describe('leads_get_conversation schema', () => {
  it('passes with { linkedin_url, sender }', () => {
    const result = SCHEMAS['leads_get_conversation'].safeParse({
      linkedin_url: 'https://linkedin.com/in/foo',
      sender: 'sender@example.com',
    });
    expect(result.success).toBe(true);
  });

  it('accepts order: "ascending"', () => {
    const result = SCHEMAS['leads_get_conversation'].safeParse({
      linkedin_url: 'https://linkedin.com/in/foo',
      sender: 'sender@example.com',
      order: 'ascending',
    });
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.order).toBe('ascending');
    }
  });

  it('rejects order: "invalido"', () => {
    const result = SCHEMAS['leads_get_conversation'].safeParse({
      linkedin_url: 'https://linkedin.com/in/foo',
      sender: 'sender@example.com',
      order: 'invalido',
    });
    expect(result.success).toBe(false);
  });
});

// ── campaigns_analytics ───────────────────────────────────────────────────────

describe('campaigns_analytics schema', () => {
  it('passes with only {} (all fields optional)', () => {
    const result = SCHEMAS['campaigns_analytics'].safeParse({});
    expect(result.success).toBe(true);
  });

  it('accepts start_date: "06-11-2025"', () => {
    const result = SCHEMAS['campaigns_analytics'].safeParse({ start_date: '06-11-2025' });
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.start_date).toBe('06-11-2025');
    }
  });
});

// ── leads_add_contact ─────────────────────────────────────────────────────────

describe('leads_add_contact schema', () => {
  it('passes with { linkedin_url, list_id } and does NOT have api_key in schema', () => {
    const result = SCHEMAS['leads_add_contact'].safeParse({
      linkedin_url: 'https://linkedin.com/in/foo',
      list_id: 'l1',
    });
    expect(result.success).toBe(true);

    // api_key must not be a defined key in the schema
    const shape = SCHEMAS['leads_add_contact'].shape;
    expect(Object.keys(shape)).not.toContain('api_key');
    expect(Object.keys(shape)).not.toContain('apiKey');
  });
});

// ── No schema contains api_key or apiKey ─────────────────────────────────────

describe('SCHEMAS global invariant', () => {
  it('none of the 15 schemas has api_key or apiKey as a defined field', () => {
    expect(Object.keys(SCHEMAS)).toHaveLength(15);

    for (const [name, schema] of Object.entries(SCHEMAS)) {
      // ZodEffects (from .refine()) wraps a ZodObject — unwrap to access .shape
      const baseSchema = 'innerType' in schema ? (schema as z.ZodEffects<z.ZodObject<z.ZodRawShape>>).innerType() : schema;
      const keys = Object.keys((baseSchema as z.ZodObject<z.ZodRawShape>).shape);
      expect(keys, `Schema "${name}" must not expose api_key`).not.toContain('api_key');
      expect(keys, `Schema "${name}" must not expose apiKey`).not.toContain('apiKey');
    }
  });
});
