/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import express from 'express';
import type { Request, Response } from 'express';
import { SERVICES_CATALOG } from '../src/data/translations.ts';
import type { ServiceItem } from '../src/data/translations.ts';
import { filterServicesBySearchQuery } from '../src/utils/loanCalculator.ts';
import type { SubmittedDocumentItem, AdminNotificationPayload } from '../src/utils/loanCalculator.ts';
import {
  runTavilySearch,
  runGroqAdvisor,
  runGeminiAdvisor,
  buildServerFallbackAdvisor,
} from './advisorService.ts';
import type { AdvisorResult } from './advisorService.ts';

export interface SyncedProfileRecord {
  uid: string;
  memberId: string;
  name: string;
  mobile: string;
  email?: string;
  city: string;
  occupation?: string;
  authProvider: string;
  submittedDocuments: SubmittedDocumentItem[];
  updatedAt: string;
}

export interface ServerEnquiryRecord extends AdminNotificationPayload {
  id: string;
  createdAt: string;
}

const inMemorySyncedProfiles = new Map<string, SyncedProfileRecord>();
let serverCustomServices: ServiceItem[] = [];
let serverAnnouncement: string = '';
let serverEnquiries: ServerEnquiryRecord[] = [];

export function createBackendApiRouter() {
  const router = express.Router();

  // 1. Smart Advisor Endpoint (GEMINI_API_KEY + GROQ_API_KEY + GROQ_MODEL + TAVILY_API_KEY)
  router.post('/advisor/assist', async (req: Request, res: Response) => {
    const body = req.body as {
      query?: string;
      language?: 'en' | 'pa';
      provider?: 'auto' | 'gemini' | 'groq';
      includeWebSearch?: boolean;
    };
    const query = (body.query || 'General Service & Document Checklist').trim();
    const language: 'en' | 'pa' = body.language === 'pa' ? 'pa' : 'en';
    const provider = body.provider || 'auto';

    const searchSources =
      body.includeWebSearch !== false ? await runTavilySearch(query) : [];

    let result: AdvisorResult | null = null;

    if (provider === 'groq') {
      result = await runGroqAdvisor(query, language, searchSources);
      if (!result) {
        result = await runGeminiAdvisor(query, language, searchSources);
      }
    } else if (provider === 'gemini') {
      result = await runGeminiAdvisor(query, language, searchSources);
      if (!result) {
        result = await runGroqAdvisor(query, language, searchSources);
      }
    } else {
      result = await runGeminiAdvisor(query, language, searchSources);
      if (!result) {
        result = await runGroqAdvisor(query, language, searchSources);
      }
    }

    if (!result) {
      result = buildServerFallbackAdvisor(query, language, searchSources);
    }

    res.json(result);
  });

  // 2. Backend Supabase Sync Endpoint (SUPABASE_URL + SUPABASE_SERVICE_ROLE_KEY + SUPABASE_ANON_KEY)
  router.post('/supabase/sync-profile', async (req: Request, res: Response) => {
    const payload = req.body as SyncedProfileRecord;
    if (!payload || !payload.uid) {
      res.status(400).json({ error: 'Invalid profile payload' });
      return;
    }

    inMemorySyncedProfiles.set(payload.uid, payload);

    const supabaseUrl = process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL;
    const supabaseKey =
      process.env.SUPABASE_SERVICE_ROLE_KEY ||
      process.env.SUPABASE_ANON_KEY ||
      process.env.VITE_SUPABASE_ANON_KEY;

    if (supabaseUrl && supabaseKey) {
      try {
        const cleanUrl = supabaseUrl.replace(/\/+$/, '');
        const supRes = await fetch(`${cleanUrl}/rest/v1/mbee_profiles`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            apikey: supabaseKey,
            Authorization: `Bearer ${supabaseKey}`,
            Prefer: 'resolution=merge-duplicates',
          },
          body: JSON.stringify({
            uid: payload.uid,
            member_id: payload.memberId,
            name: payload.name,
            mobile: payload.mobile,
            email: payload.email || '',
            city: payload.city,
            occupation: payload.occupation || '',
            auth_provider: payload.authProvider,
            submitted_documents: payload.submittedDocuments || [],
            updated_at: payload.updatedAt || new Date().toISOString(),
          }),
        });
        if (supRes.ok) {
          res.json({ synced: true, provider: 'supabase-service-role' });
          return;
        }
      } catch {
        // Fallback to in-memory + Firestore sync confirmation
      }
    }

    res.json({ synced: true, provider: 'express-cloud-bridge' });
  });

  router.get('/supabase/profiles', (_req: Request, res: Response) => {
    res.json({
      profiles: Array.from(inMemorySyncedProfiles.values()),
    });
  });

  // 3. Google OAuth / Direct Account Linking Config Endpoint (GOOGLE_CLIENT_ID / VITE_GOOGLE_CLIENT_ID)
  router.get('/oauth/google/config', (_req: Request, res: Response) => {
    const clientId =
      process.env.VITE_GOOGLE_CLIENT_ID || process.env.GOOGLE_CLIENT_ID || '';
    res.json({
      googleOAuthEnabled: true,
      customClientIdConfigured: Boolean(clientId && clientId.trim()),
      clientId: clientId.trim(),
    });
  });

  // 4. Clean Navigation Directory Endpoint
  router.get('/navigation', (_req: Request, res: Response) => {
    res.json({
      pages: [
        'home',
        'about',
        'services',
        'loans',
        'insurance',
        'documentation',
        'property',
        'contact',
        'profile',
      ],
      showOfficialWebsiteUrl: false,
    });
  });

  // 5. Full-Stack Services Catalog & Real-Time Search API (Frontend + Backend)
  router.get('/services', (req: Request, res: Response) => {
    const rawQuery = typeof req.query.q === 'string' ? req.query.q : '';
    const category = typeof req.query.category === 'string' ? req.query.category : 'all';
    const page = typeof req.query.page === 'string' ? req.query.page : 'home';

    const combined: ServiceItem[] = [...serverCustomServices, ...SERVICES_CATALOG];
    let baseList = combined;

    if (page === 'loans') {
      baseList = combined.filter((s) => s.categoryId === 'financial');
    } else if (page === 'documentation') {
      baseList = combined.filter(
        (s) => s.categoryId === 'documentation' || s.categoryId === 'digital'
      );
    } else if (page === 'property') {
      baseList = combined.filter((s) => s.categoryId === 'property');
    } else if (category && category !== 'all') {
      baseList = combined.filter((s) => s.categoryId === category);
    }

    const filtered = filterServicesBySearchQuery(baseList, rawQuery);
    res.json({
      services: filtered,
      customServices: serverCustomServices,
      totalCount: combined.length,
      filteredCount: filtered.length,
      query: rawQuery,
      category,
      source: 'backend-api',
    });
  });

  router.put('/services/custom', (req: Request, res: Response) => {
    const body = req.body as { customServices?: ServiceItem[] };
    if (Array.isArray(body.customServices)) {
      serverCustomServices = body.customServices.slice(0, 50);
    }
    res.json({
      synced: true,
      customServices: serverCustomServices,
      totalCount: serverCustomServices.length + SERVICES_CATALOG.length,
    });
  });

  // 6. Full-Stack Admin Announcement API (Frontend + Backend)
  router.get('/announcements', (_req: Request, res: Response) => {
    res.json({ announcement: serverAnnouncement });
  });

  router.post('/announcements', (req: Request, res: Response) => {
    const body = req.body as { announcement?: string };
    serverAnnouncement =
      typeof body.announcement === 'string' ? body.announcement.slice(0, 500) : '';
    res.json({ synced: true, announcement: serverAnnouncement });
  });

  // 7. Full-Stack Customer Document Status Tracker API (Frontend + Backend)
  router.get('/documents/:uid', (req: Request, res: Response) => {
    const uid = String(req.params.uid || '');
    const record = inMemorySyncedProfiles.get(uid);
    res.json({
      uid,
      submittedDocuments: record?.submittedDocuments || [],
    });
  });

  router.post('/documents/:uid', (req: Request, res: Response) => {
    const uid = String(req.params.uid || '');
    const body = req.body as { submittedDocuments?: SubmittedDocumentItem[] };
    const existing = inMemorySyncedProfiles.get(uid);
    if (existing && Array.isArray(body.submittedDocuments)) {
      existing.submittedDocuments = body.submittedDocuments.slice(0, 30);
      existing.updatedAt = new Date().toISOString();
      inMemorySyncedProfiles.set(uid, existing);
    }
    res.json({
      synced: true,
      uid,
      submittedDocuments: existing?.submittedDocuments || body.submittedDocuments || [],
    });
  });

  router.patch('/documents/:uid/:docId', (req: Request, res: Response) => {
    const uid = String(req.params.uid || '');
    const docId = String(req.params.docId || '');
    const body = req.body as { status?: SubmittedDocumentItem['status'] };
    let record = inMemorySyncedProfiles.get(uid);
    if (!record) {
      for (const candidate of inMemorySyncedProfiles.values()) {
        if (candidate.memberId === uid || candidate.mobile === uid) {
          record = candidate;
          break;
        }
      }
    }
    if (record && Array.isArray(record.submittedDocuments) && body.status) {
      record.submittedDocuments = record.submittedDocuments.map((d) =>
        d.id === docId ? { ...d, status: body.status! } : d
      );
      record.updatedAt = new Date().toISOString();
      inMemorySyncedProfiles.set(record.uid, record);
    }
    res.json({
      synced: true,
      uid,
      docId,
      status: body.status,
      submittedDocuments: record?.submittedDocuments || [],
    });
  });

  // 8. Full-Stack Customer Work Enquiries & Service Requests API (Frontend + Backend)
  router.get('/enquiries', (_req: Request, res: Response) => {
    res.json({
      enquiries: serverEnquiries,
      totalCount: serverEnquiries.length,
    });
  });

  router.post('/enquiries', (req: Request, res: Response) => {
    const body = req.body as AdminNotificationPayload;
    if (!body || !body.userName || !body.serviceName) {
      res.status(400).json({ error: 'Invalid enquiry payload' });
      return;
    }
    const newRecord: ServerEnquiryRecord = {
      ...body,
      id: `ENQ-${Date.now()}-${Math.floor(100 + Math.random() * 900)}`,
      createdAt: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };
    serverEnquiries = [newRecord, ...serverEnquiries].slice(0, 100);
    res.json({
      synced: true,
      enquiry: newRecord,
      totalCount: serverEnquiries.length,
    });
  });

  // 9. Full-Stack Health & Status Endpoint
  router.get('/health', (_req: Request, res: Response) => {
    res.json({
      status: 'ok',
      architecture: 'frontend + backend folders active',
      servicesCount: SERVICES_CATALOG.length + serverCustomServices.length,
      customServicesCount: serverCustomServices.length,
      profilesCount: inMemorySyncedProfiles.size,
      enquiriesCount: serverEnquiries.length,
      announcementActive: Boolean(serverAnnouncement),
    });
  });

  return router;
}
