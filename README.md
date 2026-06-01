# @agasalhem/mcp-prosp

MCP server for [Prosp.ai](https://prosp.ai) — exposes 15 tools for LinkedIn outbound automation to any MCP-compatible client (Claude Code, Claude Desktop, n8n, etc.).

Supports `stdio` transport (Claude Code / Desktop) and `http` transport (n8n, Make, etc.).

## Quick start — Claude Code (npx, no install needed)

Add to your project's `.mcp.json`:

```json
{
  "mcpServers": {
    "prosp": {
      "type": "stdio",
      "command": "npx",
      "args": ["-y", "@agasalhem/mcp-prosp"],
      "env": {
        "PROSP_API_KEY": "sua_chave_aqui"
      }
    }
  }
}
```

Claude Code will download and run the server automatically on first use. No `npm install` needed.

## Quick start — Claude Desktop

Add to `~/Library/Application Support/Claude/claude_desktop_config.json` (macOS) or `%APPDATA%\Claude\claude_desktop_config.json` (Windows):

```json
{
  "mcpServers": {
    "prosp": {
      "command": "npx",
      "args": ["-y", "@agasalhem/mcp-prosp"],
      "env": {
        "PROSP_API_KEY": "sua_chave_aqui"
      }
    }
  }
}
```

## Quick start — global install

```bash
npm install -g @agasalhem/mcp-prosp
```

Then in `.mcp.json`:

```json
{
  "mcpServers": {
    "prosp": {
      "type": "stdio",
      "command": "mcp-prosp",
      "env": {
        "PROSP_API_KEY": "sua_chave_aqui"
      }
    }
  }
}
```

## Requirements

- Node.js >= 20
- Prosp.ai API key — get it at **Settings → API** in the Prosp.ai dashboard

## Available tools

| Tool | Endpoint | Type |
|---|---|---|
| `leads_add` | `POST /api/v1/leads` | write |
| `leads_send_message` | `POST /api/v1/leads/send-message` | write |
| `leads_send_voice` | `POST /api/v1/leads/send-voice` | write |
| `leads_get_conversation` | `GET /api/v1/leads/conversation` | read |
| `leads_add_contact` | `POST /api/v1/leads/contact` | write |
| `leads_add_to_campaign` | `POST /api/v1/leads/campaign` | write |
| `leads_remove_from_campaign` | `POST /api/v1/leads/campaign/delete` | destructive |
| `leads_delete_contact` | `POST /api/v1/leads/contact/delete` | destructive |
| `campaigns_analytics` | `GET /api/v1/campaigns/analytics` | read |
| `campaigns_lists` | `GET /api/v1/campaigns/lists` | read |
| `campaigns_leads` | `GET /api/v1/campaigns/leads` | read |
| `campaigns_lead_stage` | `GET /api/v1/campaigns/lead-stage` | read |
| `campaigns_start` | `POST /api/v1/campaigns/start` | write |
| `campaigns_stop` | `POST /api/v1/campaigns/stop` | destructive |
| `campaigns_status` | `GET /api/v1/campaigns/status` | read |

## HTTP transport (n8n, Make, etc.)

```bash
PROSP_API_KEY=sua_chave MCP_TRANSPORT=http npx @agasalhem/mcp-prosp
# Server at http://localhost:3000/mcp
```

Optional Bearer auth and custom port:

```bash
PROSP_API_KEY=sua_chave MCP_TRANSPORT=http MCP_AUTH_TOKEN=meu_token PROSP_MCP_PORT=8080 npx @agasalhem/mcp-prosp
```

## Environment variables

| Variable | Required | Default | Description |
|---|---|---|---|
| `PROSP_API_KEY` | yes | — | Prosp.ai API key |
| `MCP_TRANSPORT` | no | `stdio` | `stdio` or `http` |
| `PROSP_MCP_PORT` | no | `3000` | HTTP port (http mode only) |
| `MCP_AUTH_TOKEN` | no | — | Bearer token for HTTP auth |

## Development

```bash
git clone https://github.com/agasalhem/mcp-prosp.git
cd mcp-prosp
npm install
npm run dev      # tsx watch (no build)
npm test         # vitest
npm run inspect  # MCP Inspector
```
