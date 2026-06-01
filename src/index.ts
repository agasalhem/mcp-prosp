#!/usr/bin/env node
import { timingSafeEqual } from 'node:crypto';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import { StreamableHTTPServerTransport } from '@modelcontextprotocol/sdk/server/streamableHttp.js';
import express, { Request, Response, NextFunction } from 'express';
import { createServer } from './server.js';

const useHttp =
  process.env.MCP_TRANSPORT === 'http' || process.argv.includes('--http');

async function startStdio(): Promise<void> {
  const server = createServer();
  const transport = new StdioServerTransport();
  await server.connect(transport);
  // stdio server runs until the process exits
}

async function startHttp(): Promise<void> {
  const port = parseInt(process.env.PROSP_MCP_PORT ?? '3000', 10);
  const authToken = process.env.MCP_AUTH_TOKEN;

  const app = express();
  app.use(express.json());

  // Optional Bearer token auth middleware (timing-safe comparison)
  if (authToken) {
    const expectedBuf = Buffer.from(`Bearer ${authToken}`);
    app.use((req: Request, res: Response, next: NextFunction) => {
      const authHeader = req.headers['authorization'] ?? '';
      const actualBuf = Buffer.from(authHeader);
      const valid =
        actualBuf.length === expectedBuf.length &&
        timingSafeEqual(actualBuf, expectedBuf);
      if (!valid) {
        res.status(401).json({ error: 'Unauthorized' });
        return;
      }
      next();
    });
  }

  // Stateless MCP handler — creates a fresh server+transport per request
  const mcpHandler = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    const transport = new StreamableHTTPServerTransport({
      sessionIdGenerator: undefined,
    });
    const mcpServer = createServer();
    // Cleanup resources when the response is closed (prevents listener/memory leaks)
    res.on('close', () => {
      transport.close().catch(() => {});
      mcpServer.close().catch(() => {});
    });
    try {
      await mcpServer.connect(transport);
      await transport.handleRequest(req, res, req.body);
    } catch (err) {
      next(err);
    }
  };

  app.post('/mcp', mcpHandler);
  app.get('/mcp', mcpHandler);
  app.delete('/mcp', mcpHandler);

  // Error handler for MCP transport errors (Express 4 requires explicit error handler)
  app.use((err: Error, _req: Request, res: Response, _next: NextFunction) => {
    console.error('MCP handler error:', err);
    if (!res.headersSent) {
      res.status(500).json({ error: 'Internal Server Error' });
    }
  });

  const httpServer = app.listen(port, () => {
    console.error(`Prosp MCP server listening on http://localhost:${port}/mcp`);
  });
  httpServer.on('error', (err: NodeJS.ErrnoException) => {
    if (err.code === 'EADDRINUSE') {
      console.error(`Fatal error: port ${port} is already in use`);
    } else {
      console.error('Fatal error starting HTTP server:', err);
    }
    process.exit(1);
  });
}

if (useHttp) {
  startHttp().catch((err) => {
    console.error('Fatal error starting HTTP server:', err);
    process.exit(1);
  });
} else {
  startStdio().catch((err) => {
    console.error('Fatal error starting stdio server:', err);
    process.exit(1);
  });
}
