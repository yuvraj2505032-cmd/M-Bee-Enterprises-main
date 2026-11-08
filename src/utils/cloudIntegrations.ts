/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { UserSession, SubmittedDocumentItem, PRIMARY_PHONE, SECONDARY_PHONE } from './loanCalculator';

export type AdvisorProvider = 'auto' | 'gemini' | 'groq';

export interface AdvisorQueryRequest {
  query: string;
  serviceCategory?: string;
  language?: 'en' | 'pa';
  provider?: AdvisorProvider;
  includeWebSearch?: boolean;
}

export interface AdvisorSourceItem {
  title: string;
  url: string;
  snippet: string;
}

export interface AdvisorQueryResponse {
  answer: string;
  checklist: string[];
  estimatedTimeline: string;
  providerUsed: 'gemini-3.8-flash' | 'llama-3.3-70b-versatile' | 'mbee-smart-desk';
  searchSources: AdvisorSourceItem[];
  whatsappSummaryText: string;
}

export interface SupabaseSyncPayload {
  uid: string;
  memberId: string;
  name: string;
  mobile: string;
  email?: string;
  city: string;
  occupation?: string;
  authProvider: 'google' | 'mobile';
  submittedDocuments: SubmittedDocumentItem[];
  updatedAt: string;
}

/**
 * Parses a comma-separated CORS_ORIGINS string into a normalized list of allowed origins.
 */
export function parseCorsOrigins(rawOrigins?: string): string[] {
  const defaultOrigins = ['http://localhost:3000', 'http://localhost:5173'];
  if (!rawOrigins || !rawOrigins.trim()) {
    return defaultOrigins;
  }
  const parsed = rawOrigins
    .split(',')
    .map((item) => item.trim())
    .filter((item) => item.length > 0);
  return Array.from(new Set([...defaultOrigins, ...parsed]));
}

/**
 * Normalizes a UserSession into a clean payload for Supabase & backend profile sync.
 */
export function formatSupabaseSyncPayload(session: UserSession): SupabaseSyncPayload {
  return {
    uid: session.uid || session.memberId || `mbe-${Date.now()}`,
    memberId: session.memberId || 'MBE-CLIENT',
    name: (session.name || 'M Bee Client').trim(),
    mobile: (session.mobile || '').trim(),
    email: session.email || '',
    city: (session.city || 'Mahilpur, Punjab').trim(),
    occupation: session.occupation || 'Citizen / Family',
    authProvider: session.authProvider || 'google',
    submittedDocuments: Array.isArray(session.submittedDocuments) ? session.submittedDocuments : [],
    updatedAt: new Date().toISOString(),
  };
}

/**
 * Builds a deterministic, accurate bilingual response for M Bee Enterprises
 * when answering citizen documentation, loan, insurance, or property queries.
 */
export function buildDeterministicAdvisorResponse(
  req: AdvisorQueryRequest,
  searchSources: AdvisorSourceItem[] = []
): AdvisorQueryResponse {
  const q = (req.query || '').toLowerCase();
  const isPa = req.language === 'pa';

  if (q.includes('passport') || q.includes('ਪਾਸਪੋਰਟ') || q.includes('pcc')) {
    const checklist = isPa
      ? [
          'ਅਸਲ ਆਧਾਰ ਕਾਰਡ (ਪੂਰਾ ਜਨਮ ਮਿਤੀ ਅਤੇ ਮੌਜੂਦਾ ਪਤਾ)',
          'ਪੈਨ ਕਾਰਡ ਜਾਂ ਵੋਟਰ ਆਈ.ਡੀ. ਕਾਰਡ',
          '10ਵੀਂ ਜਮਾਤ ਦਾ ਸਰਟੀਫਿਕੇਟ (Non-ECR ਸਟੈਂਪ ਲਈ)',
          'ਬੈਂਕ ਪਾਸਬੁੱਕ (ਫੋਟੋ ਅਤੇ ਤਾਜ਼ਾ ਐਂਟਰੀ ਸਮੇਤ)',
        ]
      : [
          'Original Aadhaar Card with complete DOB and current address',
          'PAN Card or Voter ID Card (Identity proof)',
          '10th Class Matriculation Certificate (for Non-ECR category)',
          'Active Bank Passbook with photo and recent entry',
        ];
    const answer = isPa
      ? 'M Bee Enterprises (ਬਲਜਿੰਦਰ ਸਿੰਘ ਅਤੇ ਮਨਪ੍ਰੀਤ ਸਿੰਘ) ਵੱਲੋਂ ਨਵੇਂ ਪਾਸਪੋਰਟ, ਰੀ-ਇਸ਼ੂ (Renewal), ਤਤਕਾਲ ਪਾਸਪੋਰਟ ਅਤੇ PCC ਲਈ ਆਨਲਾਈਨ ਫਾਰਮ ਭਰਨ ਅਤੇ PSK ਅਪਾਇੰਟਮੈਂਟ ਬੁਕਿੰਗ ਦੀ ਪੂਰੀ ਸਹਾਇਤਾ ਦਿੱਤੀ ਜਾਂਦੀ ਹੈ।'
      : 'M Bee Enterprises (Prop. Baljinder Singh & Manpreet Singh) provides complete assistance for fresh Passport applications, renewal/re-issue, Tatkaal booking, and Police Clearance Certificate (PCC) slot scheduling at regional PSK centres.';
    return {
      answer,
      checklist,
      estimatedTimeline: isPa ? '7 ਤੋਂ 21 ਕੰਮਕਾਜੀ ਦਿਨ (ਪੁਲਿਸ ਵੈਰੀਫਿਕੇਸ਼ਨ ਅਨੁਸਾਰ)' : '7 to 21 working days (subject to police verification)',
      providerUsed: 'mbee-smart-desk',
      searchSources,
      whatsappSummaryText: `Hello M Bee Enterprises (Baljinder Singh & Manpreet Singh), I checked the Passport & PCC checklist for "${req.query}" and want to book an appointment.`,
    };
  }

  if (q.includes('loan') || q.includes('ਲੋਨ') || q.includes('emi') || q.includes('home') || q.includes('car') || q.includes('business')) {
    const checklist = isPa
      ? [
          'ਆਧਾਰ ਕਾਰਡ ਅਤੇ ਪੈਨ ਕਾਰਡ (KYC ਦਸਤਾਵੇਜ਼)',
          'ਪਿਛਲੇ 6 ਤੋਂ 12 ਮਹੀਨਿਆਂ ਦੀ ਬੈਂਕ ਸਟੇਟਮੈਂਟ',
          'ਆਮਦਨ ਦਾ ਸਬੂਤ: ਸੈਲਰੀ ਸਲਿੱਪਾਂ ਜਾਂ ਪਿਛਲੇ 2-3 ਸਾਲਾਂ ਦੀ ITR',
          'ਪ੍ਰਾਪਰਟੀ ਦੇ ਕਾਗਜ਼ਾਤ / ਕੋਟੇਸ਼ਨ (ਹੋਮ ਜਾਂ ਕਾਰ ਲੋਨ ਲਈ)',
        ]
      : [
          'Aadhaar Card & PAN Card of applicant and co-applicant',
          'Last 6 to 12 months Bank Account Statement',
          'Income Proof: Latest 3 months Salary Slips or 2–3 years ITR / Form-16',
          'Property Title Deed / Vehicle Proforma Invoice (for Home or Car Loan)',
        ];
    const answer = isPa
      ? 'M Bee Enterprises ਵਿਖੇ ਬਲਜਿੰਦਰ ਸਿੰਘ ਅਤੇ ਮਨਪ੍ਰੀਤ ਸਿੰਘ ਵੱਲੋਂ ਪਰਸਨਲ ਲੋਨ, ਹੋਮ ਲੋਨ, ਕਾਰ ਲੋਨ ਅਤੇ ਬਿਜ਼ਨਸ ਲੋਨ ਦੀ ਫਾਈਲ ਤਿਆਰ ਕਰਨ ਅਤੇ ਬੈਂਕ ਯੋਗਤਾ (Eligibility) ਚੈੱਕ ਕਰਨ ਵਿੱਚ ਪੂਰੀ ਮਦਦ ਕੀਤੀ ਜਾਂਦੀ ਹੈ।'
      : 'At M Bee Enterprises (Bank of Baroda, near Bus Stand, Mahilpur), Proprietors Baljinder Singh & Manpreet Singh prepare structured files for Personal, Home, Car, and Business Loans with transparent eligibility guidance.';
    return {
      answer,
      checklist,
      estimatedTimeline: isPa ? '3 ਤੋਂ 10 ਕੰਮਕਾਜੀ ਦਿਨ (ਬੈਂਕ ਜਾਂਚ ਅਨੁਸਾਰ)' : '3 to 10 working days (subject to bank verification)',
      providerUsed: 'mbee-smart-desk',
      searchSources,
      whatsappSummaryText: `Hello M Bee Enterprises (Baljinder Singh & Manpreet Singh), I need loan file guidance regarding: "${req.query}".`,
    };
  }

  if (q.includes('aadhaar') || q.includes('pan') || q.includes('ਆਧਾਰ') || q.includes('ਪੈਨ') || q.includes('licence') || q.includes('driving')) {
    const checklist = isPa
      ? [
          'ਮੌਜੂਦਾ ਆਧਾਰ ਕਾਰਡ ਜਾਂ ਐਨਰੋਲਮੈਂਟ ਸਲਿੱਪ',
          'ਜਨਮ ਮਿਤੀ ਦਾ ਸਬੂਤ (ਜਨਮ ਸਰਟੀਫਿਕੇਟ / 10ਵੀਂ ਸਰਟੀਫਿਕੇਟ / ਪਾਸਪੋਰਟ)',
          'ਪਤੇ ਦਾ ਸਬੂਤ (ਵੋਟਰ ਕਾਰਡ / ਸਰਪੰਚ ਜਾਂ ਐਮ.ਸੀ. ਤਸਦੀਕ / ਬਿਜਲੀ ਬਿੱਲ)',
          '2 ਪਾਸਪੋਰਟ ਸਾਈਜ਼ ਫੋਟੋਆਂ ਅਤੇ ਮੋਬਾਈਲ ਨੰਬਰ',
        ]
      : [
          'Existing Aadhaar Card copy or Enrolment ID slip',
          'Proof of Date of Birth (Birth Certificate / Matric Certificate / Passport)',
          'Proof of Address (Voter ID / Utility Bill / Gazetted or Municipal certificate)',
          '2 Passport-size photographs and active mobile number',
        ];
    const answer = isPa
      ? 'ਆਧਾਰ ਕਾਰਡ ਅਪਡੇਟ, ਨਵਾਂ ਪੈਨ ਕਾਰਡ, ਪੈਨ-ਆਧਾਰ ਲਿੰਕ ਅਤੇ ਡਰਾਈਵਿੰਗ ਲਾਇਸੈਂਸ (Parivahan) ਦੀਆਂ ਸਾਰੀਆਂ ਸੇਵਾਵਾਂ M Bee Enterprises, ਮਾਹਿਲਪੁਰ ਵਿਖੇ ਉਪਲਬਧ ਹਨ।'
      : 'Complete documentation support for Aadhaar demographic/address updates, new PAN Card or corrections, PAN-Aadhaar linking, and Parivahan Driving Licence slots is available at M Bee Enterprises, Mahilpur.';
    return {
      answer,
      checklist,
      estimatedTimeline: isPa ? '5 ਤੋਂ 15 ਕੰਮਕਾਜੀ ਦਿਨ' : '5 to 15 working days',
      providerUsed: 'mbee-smart-desk',
      searchSources,
      whatsappSummaryText: `Hello M Bee Enterprises (Baljinder Singh & Manpreet Singh), I need citizen documentation assistance for: "${req.query}".`,
    };
  }

  const defaultChecklist = isPa
    ? [
        'ਅਸਲ ਆਧਾਰ ਕਾਰਡ ਅਤੇ ਪੈਨ ਕਾਰਡ',
        '2 ਤਾਜ਼ਾ ਪਾਸਪੋਰਟ ਸਾਈਜ਼ ਫੋਟੋਆਂ',
        'ਮੋਬਾਈਲ ਨੰਬਰ (ਆਧਾਰ ਨਾਲ ਲਿੰਕ ਕੀਤਾ ਹੋਇਆ)',
        'ਸਬੰਧਤ ਸੇਵਾ ਦੇ ਪੁਰਾਣੇ ਦਸਤਾਵੇਜ਼ ਜਾਂ ਰਸੀਦ',
      ]
    : [
        'Original Aadhaar Card & PAN Card for verification',
        '2 Recent Passport-size photographs',
        'Active Mobile Number linked with Aadhaar',
        'Any previous reference document, policy copy, or land record (Fard)',
      ];

  const defaultAnswer = isPa
    ? `M Bee Enterprises (ਬਲਜਿੰਦਰ ਸਿੰਘ ਅਤੇ ਮਨਪ੍ਰੀਤ ਸਿੰਘ), ਨੇੜੇ ਬੱਸ ਸਟੈਂਡ, ਮਾਹਿਲਪੁਰ (${PRIMARY_PHONE}, ${SECONDARY_PHONE}) ਵਿਖੇ ਤੁਹਾਡੇ ਕੰਮ "${req.query}" ਲਈ ਲੋੜੀਂਦੇ ਦਸਤਾਵੇਜ਼ਾਂ ਦੀ ਸੂਚੀ ਹੇਠਾਂ ਦਿੱਤੀ ਗਈ ਹੈ।`
    : `M Bee Enterprises (Prop. Baljinder Singh & Manpreet Singh), Bank of Baroda, near Bus Stand, Mahilpur (${PRIMARY_PHONE}, ${SECONDARY_PHONE}) provides structured guidance for "${req.query}". Review the required checklist below.`;

  return {
    answer: defaultAnswer,
    checklist: defaultChecklist,
    estimatedTimeline: isPa ? '3 ਤੋਂ 10 ਕੰਮਕਾਜੀ ਦਿਨ' : '3 to 10 working days',
    providerUsed: 'mbee-smart-desk',
    searchSources,
    whatsappSummaryText: `Hello M Bee Enterprises (Baljinder Singh & Manpreet Singh), I would like assistance regarding: "${req.query}".`,
  };
}

/**
 * Syncs a user profile directly with Frontend Supabase (if VITE_SUPABASE_URL & VITE_SUPABASE_ANON_KEY are configured)
 * and Backend Express Supabase Sync route (/api/supabase/sync-profile).
 */
export async function syncUserProfileAcrossClouds(session: UserSession): Promise<{
  synced: boolean;
  provider: string;
}> {
  const payload = formatSupabaseSyncPayload(session);

  // 1. Direct Frontend Vite Supabase REST sync if VITE_SUPABASE_URL & VITE_SUPABASE_ANON_KEY are present
  const viteSupabaseUrl =
    typeof import.meta !== 'undefined' && import.meta.env
      ? (import.meta.env.VITE_SUPABASE_URL as string | undefined)
      : undefined;
  const viteSupabaseAnonKey =
    typeof import.meta !== 'undefined' && import.meta.env
      ? (import.meta.env.VITE_SUPABASE_ANON_KEY as string | undefined)
      : undefined;

  if (viteSupabaseUrl && viteSupabaseAnonKey) {
    try {
      const cleanUrl = viteSupabaseUrl.replace(/\/+$/, '');
      const res = await fetch(`${cleanUrl}/rest/v1/mbee_profiles`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          apikey: viteSupabaseAnonKey,
          Authorization: `Bearer ${viteSupabaseAnonKey}`,
          Prefer: 'resolution=merge-duplicates',
        },
        body: JSON.stringify({
          uid: payload.uid,
          member_id: payload.memberId,
          name: payload.name,
          mobile: payload.mobile,
          email: payload.email,
          city: payload.city,
          occupation: payload.occupation,
          auth_provider: payload.authProvider,
          submitted_documents: payload.submittedDocuments,
          updated_at: payload.updatedAt,
        }),
      });
      if (res.ok) {
        return { synced: true, provider: 'vite-supabase' };
      }
    } catch {
      // Fall through to backend Express sync route
    }
  }

  // 2. Backend Express Server Supabase sync (/api/supabase/sync-profile)
  try {
    const response = await fetch('/api/supabase/sync-profile', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });
    if (response.ok) {
      const data = await response.json();
      return { synced: true, provider: data.provider || 'backend-express-sync' };
    }
  } catch {
    // Ignore network error if offline
  }

  return { synced: true, provider: 'firebase-local-fallback' };
}

/**
 * Calls the server-side AI & Search Advisor (/api/advisor/assist) powered by
 * GEMINI_API_KEY (gemini-3.8-flash), GROQ_API_KEY (llama-3.3-70b-versatile), and TAVILY_API_KEY.
 */
export async function querySmartServiceAdvisor(
  req: AdvisorQueryRequest
): Promise<AdvisorQueryResponse> {
  try {
    const response = await fetch('/api/advisor/assist', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(req),
    });
    if (response.ok) {
      const data = (await response.json()) as AdvisorQueryResponse;
      if (data && data.answer && Array.isArray(data.checklist)) {
        return data;
      }
    }
  } catch {
    // Fallback to deterministic advisor if offline
  }
  return buildDeterministicAdvisorResponse(req);
}

export interface BackendServicesResponse<T = unknown> {
  services: T[];
  customServices: T[];
  totalCount: number;
  filteredCount: number;
  query: string;
  category: string;
  source: 'backend-api' | 'frontend-fallback';
}

/**
 * Queries the Backend Express API (/api/services) for real-time filtered services
 * across both Frontend and Backend.
 */
export async function fetchServicesFromBackend<T = unknown>(params: {
  query?: string;
  category?: string;
  page?: string;
}): Promise<BackendServicesResponse<T> | null> {
  try {
    const searchParams = new URLSearchParams();
    if (params.query) searchParams.set('q', params.query);
    if (params.category) searchParams.set('category', params.category);
    if (params.page) searchParams.set('page', params.page);

    const response = await fetch(`/api/services?${searchParams.toString()}`);
    if (response.ok) {
      return (await response.json()) as BackendServicesResponse<T>;
    }
  } catch {
    // Offline fallback handled by caller
  }
  return null;
}

/**
 * Syncs custom admin-created services to the Backend Express server (/api/services/custom).
 */
export async function syncCustomServicesWithBackend<T = unknown>(
  customServices: T[]
): Promise<boolean> {
  try {
    const response = await fetch('/api/services/custom', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ customServices }),
    });
    return response.ok;
  } catch {
    return false;
  }
}

/**
 * Syncs the Admin Announcement banner with the Backend Express server (/api/announcements).
 */
export async function syncAnnouncementWithBackend(announcement: string): Promise<boolean> {
  try {
    const response = await fetch('/api/announcements', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ announcement }),
    });
    return response.ok;
  } catch {
    return false;
  }
}

export async function fetchAnnouncementFromBackend(): Promise<string | null> {
  try {
    const response = await fetch('/api/announcements');
    if (response.ok) {
      const data = (await response.json()) as { announcement?: string };
      return typeof data.announcement === 'string' ? data.announcement : null;
    }
  } catch {
    // ignore
  }
  return null;
}

export interface BackendEnquiryRecord {
  id: string;
  userName: string;
  userMobile: string;
  userCity?: string;
  userEmail?: string;
  memberId?: string;
  serviceName: string;
  workDescription: string;
  preferredContact?: string;
  referenceCode?: string;
  createdAt: string;
}

/**
 * Logs a Customer Work Enquiry / Service Request to the Backend Express server (/api/enquiries).
 */
export async function submitEnquiryToBackend(
  payload: Omit<BackendEnquiryRecord, 'id' | 'createdAt'>
): Promise<BackendEnquiryRecord | null> {
  try {
    const response = await fetch('/api/enquiries', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });
    if (response.ok) {
      const data = (await response.json()) as { enquiry?: BackendEnquiryRecord };
      return data.enquiry || null;
    }
  } catch {
    // ignore offline error
  }
  return null;
}

/**
 * Fetches all logged Customer Work Enquiries from the Backend Express server (/api/enquiries).
 */
export async function fetchEnquiriesFromBackend(): Promise<BackendEnquiryRecord[]> {
  try {
    const response = await fetch('/api/enquiries');
    if (response.ok) {
      const data = (await response.json()) as { enquiries?: BackendEnquiryRecord[] };
      return Array.isArray(data.enquiries) ? data.enquiries : [];
    }
  } catch {
    // ignore
  }
  return [];
}

/**
 * Syncs a customer's Submitted Documents list to the Backend Express server (/api/documents/:uid).
 */
export async function syncDocumentsListWithBackend(
  uidOrKey: string,
  submittedDocuments: SubmittedDocumentItem[]
): Promise<boolean> {
  if (!uidOrKey) return false;
  try {
    const response = await fetch(`/api/documents/${encodeURIComponent(uidOrKey)}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ submittedDocuments }),
    });
    return response.ok;
  } catch {
    return false;
  }
}

/**
 * Updates a single Submitted Document's status badge (Pending, Processing, Completed) on the Backend (/api/documents/:uid/:docId).
 */
export async function syncDocumentStatusWithBackend(
  uidOrKey: string,
  docId: string,
  status: SubmittedDocumentItem['status']
): Promise<boolean> {
  if (!uidOrKey || !docId) return false;
  try {
    const response = await fetch(
      `/api/documents/${encodeURIComponent(uidOrKey)}/${encodeURIComponent(docId)}`,
      {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status }),
      }
    );
    return response.ok;
  } catch {
    return false;
  }
}

/**
 * Fetches all synced customer profiles from the Backend Express server (/api/supabase/profiles).
 */
export async function fetchProfilesFromBackend(): Promise<SupabaseSyncPayload[]> {
  try {
    const response = await fetch('/api/supabase/profiles');
    if (response.ok) {
      const data = (await response.json()) as { profiles?: SupabaseSyncPayload[] };
      return Array.isArray(data.profiles) ? data.profiles : [];
    }
  } catch {
    // ignore
  }
  return [];
}

