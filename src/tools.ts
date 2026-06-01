import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { ENDPOINTS } from './endpoints.js';
import { SCHEMAS } from './schemas.js';
import { prospFetch } from './prospClient.js';

// Human-readable descriptions per tool
const DESCRIPTIONS: Record<string, string> = {
  leads_add: 'Prosp.ai: Adiciona um lead (por URL do LinkedIn) a uma lista e campanha',
  leads_send_message: 'Prosp.ai: Envia uma mensagem de texto no LinkedIn para um lead',
  leads_send_voice: 'Prosp.ai: Envia uma mensagem de voz no LinkedIn para um lead',
  leads_get_conversation: 'Prosp.ai: Recupera o histórico de conversa com um lead no LinkedIn',
  leads_add_contact: 'Prosp.ai: Adiciona um contato a uma lista (endpoint alternativo com camelCase)',
  leads_add_to_campaign: 'Prosp.ai: Adiciona um lead a uma campanha existente',
  leads_remove_from_campaign: 'Prosp.ai: Remove um lead de todas as campanhas (operação destrutiva — não é possível especificar campanha)',
  leads_delete_contact: 'Prosp.ai: Exclui permanentemente um contato (operação destrutiva)',
  campaigns_analytics: 'Prosp.ai: Consulta analytics de uma ou todas as campanhas em um período',
  campaigns_lists: 'Prosp.ai: Lista todas as campanhas disponíveis no workspace',
  campaigns_leads: 'Prosp.ai: Lista os leads de uma campanha específica',
  campaigns_lead_stage: 'Prosp.ai: Consulta o estágio atual de um lead em uma campanha',
  campaigns_start: 'Prosp.ai: Inicia (ativa) uma campanha',
  campaigns_stop: 'Prosp.ai: Para (desativa) uma campanha (operação destrutiva)',
  campaigns_status: 'Prosp.ai: Consulta o status atual de uma campanha',
};

export function registerTools(server: McpServer): void {
  for (const endpoint of ENDPOINTS) {
    const schema = SCHEMAS[endpoint.toolName];
    if (!schema) {
      throw new Error(`Missing schema for tool: ${endpoint.toolName}`);
    }

    const description =
      DESCRIPTIONS[endpoint.toolName] ?? `Prosp.ai: ${endpoint.toolName}`;

    const annotations: { readOnlyHint?: boolean; destructiveHint?: boolean } = {};
    if (endpoint.readOnly) annotations.readOnlyHint = true;
    if (endpoint.destructive) annotations.destructiveHint = true;

    server.registerTool(
      endpoint.toolName,
      {
        description,
        inputSchema: schema,
        annotations,
      },
      async (args: Record<string, unknown>) => {
        const result = await prospFetch(endpoint, args);
        const isError =
          typeof result === 'object' &&
          result !== null &&
          (result as Record<string, unknown>)['error'] === true;
        return {
          content: [{ type: 'text' as const, text: JSON.stringify(result) }],
          isError,
        };
      },
    );
  }
}
