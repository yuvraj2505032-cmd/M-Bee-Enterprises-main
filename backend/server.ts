/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import 'dotenv/config';
import express from 'express';
import type { Request, Response, NextFunction } from 'express';
import path from 'path';
import { createBackendApiRouter } from './routes.ts';

export function getConfiguredCorsOrigins(): string[] {
  const raw = process.env.CORS_ORIGINS || 'http://localhost:3000,http://localhost:5173';
  const list = raw
    .split(',')
    .map((s) => s.trim())
    .filter((s) => s.length > 0);
  if (process.env.APP_URL) {
    list.push(process.env.APP_URL.trim());
  }
  return Array.from(new Set(['http://localhost:3000', 'http://localhost:5173', ...list]));
}

export async function startBackendServer() {
  const app = express();
  const PORT = Number(process.env.PORT ?? 3000);

  app.use(express.json({ limit: '2mb' }));

  const allowedOrigins = getConfiguredCorsOrigins();
  app.use((req: Request, res: Response, next: NextFunction) => {
    const origin = req.headers.origin;
    if (!origin || allowedOrigins.includes(origin) || origin.endsWith('.run.app')) {
      res.setHeader('Access-Control-Allow-Origin', origin || '*');
    } else {
      res.setHeader('Access-Control-Allow-Origin', allowedOrigins[0] || '*');
    }
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, PATCH, DELETE, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization, apikey');
    if (req.method === 'OPTIONS') {
      res.status(204).end();
      return;
    }
    next();
  });

  // Mount all Backend API routes under /api
  app.use('/api', createBackendApiRouter());

  if (process.env.NODE_ENV !== 'production') {
    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*all', (_req: Request, res: Response) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  const startServer = (port: number) => {
    const server = app.listen(port, '0.0.0.0', () => {
      console.log(`M Bee Enterprises Backend Server running on http://localhost:${port}`);
    });

    server.on('error', (error: NodeJS.ErrnoException) => {
      if (error.code === 'EADDRINUSE') {
        const nextPort = port + 1;
        console.warn(`Port ${port} is already in use. Trying ${nextPort} instead.`);
        startServer(nextPort);
        return;
      }

      throw error;
    });
  };

  startServer(PORT);
}
