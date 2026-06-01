import { z } from 'zod';

// Reusable sub-schemas
const linkedinUrlField = z.string().url().describe('URL do perfil LinkedIn do lead (ex: https://www.linkedin.com/in/usuario)');
const campaignIdField = z.string().describe('ID da campanha no Prosp.ai');
const listIdField = z.string().describe('ID da lista de contatos no Prosp.ai');
const senderField = z.string().url().describe('URL do perfil LinkedIn do remetente (ex: https://www.linkedin.com/in/usuario)');
const dataField = z
  .array(z.object({ property: z.string(), value: z.string() }))
  .optional()
  .describe('Propriedades customizadas do lead: array de objetos { property, value }');

// Per-tool schemas (api_key/apiKey excluded — injected by server)
export const SCHEMAS: Record<string, z.ZodTypeAny> = {
  leads_add: z.object({
    linkedin_url: linkedinUrlField,
    list_id: listIdField,
    campaign_id: campaignIdField,
    data: dataField,
  }),

  leads_send_message: z.object({
    linkedin_url: linkedinUrlField,
    sender: senderField,
    message: z.string().describe('Texto da mensagem a ser enviada ao lead'),
  }),

  leads_send_voice: z.object({
    linkedin_url: linkedinUrlField,
    sender: senderField,
    message: z.string().describe('Texto ou URL do áudio de voz a ser enviado ao lead'),
  }),

  leads_get_conversation: z.object({
    linkedin_url: linkedinUrlField,
    sender: senderField,
    is_sale_nav: z
      .boolean()
      .optional()
      .describe('Indica se o perfil é do LinkedIn Sales Navigator'),
    order: z
      .enum(['ascending', 'descending'])
      .optional()
      .describe('Ordenação das mensagens: "ascending" (mais antigas primeiro) ou "descending" (mais recentes primeiro)'),
  }),

  leads_add_contact: z.object({
    // urlField for this endpoint is 'linkedinUrl' — normalized to linkedin_url for the LLM,
    // the client renames it when building the request body
    linkedin_url: linkedinUrlField,
    list_id: listIdField,
    data: dataField,
  }),

  leads_add_to_campaign: z.object({
    linkedin_url: linkedinUrlField,
    campaign_id: campaignIdField,
  }),

  leads_remove_from_campaign: z.object({
    linkedin_url: linkedinUrlField,
  }),

  leads_delete_contact: z.object({
    linkedin_url: linkedinUrlField,
  }),

  campaigns_analytics: z.object({
    campaign_id: z.string().optional().describe('ID da campanha (omitir para todas as campanhas)'),
    start_date: z
      .string()
      .optional()
      .describe('Data de início do período de análise. Formato DD-MM-YYYY, ex: 06-11-2025. Obrigatório se end_date for fornecido.'),
    end_date: z
      .string()
      .optional()
      .describe('Data de fim do período de análise. Formato DD-MM-YYYY, ex: 06-11-2025. Obrigatório se start_date for fornecido.'),
  }).refine(
    (data: { start_date?: string; end_date?: string }) => {
      const hasStart = data.start_date !== undefined;
      const hasEnd = data.end_date !== undefined;
      return hasStart === hasEnd;
    },
    { message: 'start_date e end_date devem ser fornecidos juntos ou nenhum dos dois' },
  ),

  campaigns_lists: z.object({}),

  campaigns_leads: z.object({
    campaign_id: campaignIdField,
  }),

  campaigns_lead_stage: z.object({
    // urlField for this endpoint is 'linkedinUrl' — normalized to linkedin_url for the LLM
    linkedin_url: linkedinUrlField,
    campaign_id: campaignIdField,
  }),

  campaigns_start: z.object({
    campaign_id: campaignIdField,
  }),

  campaigns_stop: z.object({
    campaign_id: campaignIdField,
  }),

  campaigns_status: z.object({
    campaign_id: campaignIdField,
  }),
};
