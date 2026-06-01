export interface EndpointDef {
  toolName: string;
  path: string;
  apiKeyField: 'api_key' | 'apiKey';
  urlField?: 'linkedin_url' | 'linkedinUrl';
  readOnly: boolean;
  destructive: boolean;
}

export const ENDPOINTS: EndpointDef[] = [
  // --- Leads ---
  {
    toolName: 'leads_add',
    path: '/api/v1/leads',
    apiKeyField: 'api_key',
    urlField: 'linkedin_url',
    readOnly: false,
    destructive: false,
  },
  {
    toolName: 'leads_send_message',
    path: '/api/v1/leads/send-message',
    apiKeyField: 'api_key',
    urlField: 'linkedin_url',
    readOnly: false,
    destructive: false,
  },
  {
    toolName: 'leads_send_voice',
    path: '/api/v1/leads/send-voice',
    apiKeyField: 'api_key',
    urlField: 'linkedin_url',
    readOnly: false,
    destructive: false,
  },
  {
    toolName: 'leads_get_conversation',
    path: '/api/v1/leads/conversation',
    apiKeyField: 'api_key',
    urlField: 'linkedin_url',
    readOnly: true,
    destructive: false,
  },
  {
    // NOTE: this endpoint uses camelCase for both apiKey and linkedinUrl — anomaly documented here
    toolName: 'leads_add_contact',
    path: '/api/v1/leads/contact',
    apiKeyField: 'apiKey',
    urlField: 'linkedinUrl',
    readOnly: false,
    destructive: false,
  },
  {
    toolName: 'leads_add_to_campaign',
    path: '/api/v1/leads/campaign',
    apiKeyField: 'api_key',
    urlField: 'linkedin_url',
    readOnly: false,
    destructive: false,
  },
  {
    toolName: 'leads_remove_from_campaign',
    path: '/api/v1/leads/campaign/delete',
    apiKeyField: 'api_key',
    urlField: 'linkedin_url',
    readOnly: false,
    destructive: true,
  },
  {
    toolName: 'leads_delete_contact',
    path: '/api/v1/leads/contact/delete',
    apiKeyField: 'api_key',
    urlField: 'linkedin_url',
    readOnly: false,
    destructive: true,
  },
  // --- Campaigns ---
  {
    toolName: 'campaigns_analytics',
    path: '/api/v1/campaigns/analytics',
    apiKeyField: 'api_key',
    urlField: undefined,
    readOnly: true,
    destructive: false,
  },
  {
    toolName: 'campaigns_lists',
    path: '/api/v1/campaigns/lists',
    apiKeyField: 'api_key',
    urlField: undefined,
    readOnly: true,
    destructive: false,
  },
  {
    toolName: 'campaigns_leads',
    path: '/api/v1/campaigns/leads',
    apiKeyField: 'api_key',
    urlField: undefined,
    readOnly: true,
    destructive: false,
  },
  {
    // NOTE: mix — uses api_key (snake_case) but linkedinUrl (camelCase) — anomaly documented here
    toolName: 'campaigns_lead_stage',
    path: '/api/v1/campaigns/lead-stage',
    apiKeyField: 'api_key',
    urlField: 'linkedinUrl',
    readOnly: true,
    destructive: false,
  },
  {
    toolName: 'campaigns_start',
    path: '/api/v1/campaigns/start',
    apiKeyField: 'api_key',
    urlField: undefined,
    readOnly: false,
    destructive: true,
  },
  {
    toolName: 'campaigns_stop',
    path: '/api/v1/campaigns/stop',
    apiKeyField: 'api_key',
    urlField: undefined,
    readOnly: false,
    destructive: true,
  },
  {
    toolName: 'campaigns_status',
    path: '/api/v1/campaigns/status',
    apiKeyField: 'api_key',
    urlField: undefined,
    readOnly: true,
    destructive: false,
  },
];
