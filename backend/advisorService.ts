/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { GoogleGenAI, Type } from '@google/genai';

export interface SearchSource {
  title: string;
  url: string;
  snippet: string;
}

export interface AdvisorResult {
  answer: string;
  checklist: string[];
  estimatedTimeline: string;
  providerUsed: 'gemini-3.8-flash' | 'llama-3.3-70b-versatile' | 'mbee-smart-desk';
  searchSources: SearchSource[];
  whatsappSummaryText: string;
}

export async function runTavilySearch(query: string): Promise<SearchSource[]> {
  const tavilyKey = process.env.TAVILY_API_KEY;
  if (!tavilyKey || !tavilyKey.trim()) {
    return [];
  }
  try {
    const response = await fetch('https://api.tavily.com/search', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        api_key: tavilyKey.trim(),
        query: `${query} India Punjab citizen documentation requirements`,
        max_results: 3,
      }),
    });
    if (!response.ok) return [];
    const data = (await response.json()) as {
      results?: Array<{ title?: string; url?: string; content?: string }>;
    };
    if (!Array.isArray(data.results)) return [];
    return data.results.slice(0, 3).map((item) => ({
      title: item.title || 'Official Citizen Portal Reference',
      url: item.url || 'https://punjab.gov.in',
      snippet: (item.content || '').slice(0, 220),
    }));
  } catch {
    return [];
  }
}

export async function runGroqAdvisor(
  query: string,
  language: 'en' | 'pa',
  searchSources: SearchSource[]
): Promise<AdvisorResult | null> {
  const groqKey = process.env.GROQ_API_KEY;
  const groqModel = process.env.GROQ_MODEL || 'llama-3.3-70b-versatile';
  if (!groqKey || !groqKey.trim()) {
    return null;
  }

  const contextText =
    searchSources.length > 0
      ? `\nWeb Search Context:\n${searchSources
          .map((s) => `- ${s.title}: ${s.snippet}`)
          .join('\n')}`
      : '';

  const systemPrompt = `You are the official Smart Service & Document Advisor for M Bee Enterprises (Proprietors: Baljinder Singh & Manpreet Singh), located at Bank of Baroda, near Bus Stand, near Mahilpur, Mahilpur, Punjab 146105 (Phones: 82888-37597, 99156-28427).
Respond in ${language === 'pa' ? 'Punjabi (Gurmukhi)' : 'clear English'}.
Return ONLY valid JSON with keys:
- "answer": string (2-3 helpful sentences mentioning M Bee Enterprises and Proprietors Baljinder Singh & Manpreet Singh)
- "checklist": array of 4 to 5 required document strings
- "estimatedTimeline": string (e.g., "3 to 10 working days")`;

  try {
    const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${groqKey.trim()}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: groqModel,
        response_format: { type: 'json_object' },
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: `Customer Query: ${query}${contextText}` },
        ],
        temperature: 0.3,
      }),
    });

    if (!response.ok) return null;
    const data = (await response.json()) as {
      choices?: Array<{ message?: { content?: string } }>;
    };
    const content = data.choices?.[0]?.message?.content;
    if (!content) return null;
    const parsed = JSON.parse(content) as {
      answer?: string;
      checklist?: string[];
      estimatedTimeline?: string;
    };
    if (!parsed.answer || !Array.isArray(parsed.checklist)) return null;

    return {
      answer: parsed.answer,
      checklist: parsed.checklist.slice(0, 6),
      estimatedTimeline: parsed.estimatedTimeline || '3 to 10 working days',
      providerUsed: 'llama-3.3-70b-versatile',
      searchSources,
      whatsappSummaryText: `Hello M Bee Enterprises (Baljinder Singh & Manpreet Singh), I checked the AI Document Checklist for "${query}" and would like assistance.`,
    };
  } catch {
    return null;
  }
}

export async function runGeminiAdvisor(
  query: string,
  language: 'en' | 'pa',
  searchSources: SearchSource[]
): Promise<AdvisorResult | null> {
  const geminiKey = process.env.GEMINI_API_KEY;
  if (!geminiKey || !geminiKey.trim()) {
    return null;
  }

  const contextText =
    searchSources.length > 0
      ? `\nWeb Search Context:\n${searchSources
          .map((s) => `- ${s.title}: ${s.snippet}`)
          .join('\n')}`
      : '';

  try {
    const ai = new GoogleGenAI({
      apiKey: geminiKey.trim(),
      httpOptions: { headers: { 'User-Agent': 'aistudio-build' } },
    });

    const response = await ai.models.generateContent({
      model: 'gemini-3.8-flash',
      contents: `Customer Query: ${query}${contextText}\nLanguage: ${
        language === 'pa' ? 'Punjabi (Gurmukhi)' : 'English'
      }`,
      config: {
        systemInstruction:
          'You are the official Smart Service & Document Advisor for M Bee Enterprises (Proprietors: Baljinder Singh & Manpreet Singh), located at Bank of Baroda, near Bus Stand, near Mahilpur, Mahilpur, Punjab 146105 (Phones: 82888-37597, 99156-28427). Provide accurate document checklists and guidance for Aadhaar, PAN, Passport, Driving Licence, Loans, Insurance, and Property services in Punjab.',
        responseMimeType: 'application/json',
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            answer: {
              type: Type.STRING,
              description:
                'Clear 2-3 sentence guidance referencing M Bee Enterprises (Baljinder Singh & Manpreet Singh).',
            },
            checklist: {
              type: Type.ARRAY,
              items: { type: Type.STRING },
              description: 'List of 4-5 required documents.',
            },
            estimatedTimeline: {
              type: Type.STRING,
              description: 'Estimated processing time.',
            },
          },
          required: ['answer', 'checklist', 'estimatedTimeline'],
        },
      },
    });

    const text = response.text;
    if (!text) return null;
    const parsed = JSON.parse(text) as {
      answer?: string;
      checklist?: string[];
      estimatedTimeline?: string;
    };
    if (!parsed.answer || !Array.isArray(parsed.checklist)) return null;

    return {
      answer: parsed.answer,
      checklist: parsed.checklist.slice(0, 6),
      estimatedTimeline: parsed.estimatedTimeline || '3 to 10 working days',
      providerUsed: 'gemini-3.8-flash',
      searchSources,
      whatsappSummaryText: `Hello M Bee Enterprises (Baljinder Singh & Manpreet Singh), I checked the Gemini Document Checklist for "${query}" and would like assistance.`,
    };
  } catch {
    return null;
  }
}

export function buildServerFallbackAdvisor(
  query: string,
  language: 'en' | 'pa',
  searchSources: SearchSource[]
): AdvisorResult {
  const q = query.toLowerCase();
  const isPa = language === 'pa';

  if (q.includes('passport') || q.includes('ਪਾਸਪੋਰਟ') || q.includes('pcc')) {
    return {
      answer: isPa
        ? 'M Bee Enterprises (ਪ੍ਰੋ. ਬਲਜਿੰਦਰ ਸਿੰਘ ਅਤੇ ਮਨਪ੍ਰੀਤ ਸਿੰਘ) ਵਿਖੇ ਨਵੇਂ ਪਾਸਪੋਰਟ, ਰੀ-ਇਸ਼ੂ, ਤਤਕਾਲ ਅਪਾਇੰਟਮੈਂਟ ਅਤੇ ਪੁਲਿਸ ਕਲੀਅਰੈਂਸ ਸਰਟੀਫਿਕੇਟ (PCC) ਲਈ ਪੂਰੀ ਫਾਈਲ ਤਿਆਰ ਕੀਤੀ ਜਾਂਦੀ ਹੈ।'
        : 'M Bee Enterprises (Prop. Baljinder Singh & Manpreet Singh) provides complete assistance for fresh Passport applications, renewal/re-issue, Tatkaal booking, and Police Clearance Certificate (PCC) slot scheduling at regional PSK centres.',
      checklist: isPa
        ? [
            'ਅਸਲ ਆਧਾਰ ਕਾਰਡ (ਪੂਰਾ ਜਨਮ ਮਿਤੀ ਅਤੇ ਪਤਾ ਸਹੀ ਹੋਵੇ)',
            'ਪੈਨ ਕਾਰਡ ਜਾਂ ਵੋਟਰ ਕਾਰਡ',
            '10ਵੀਂ ਜਮਾਤ ਦਾ ਸਰਟੀਫਿਕੇਟ (Non-ECR ਲਈ)',
            'ਬੈਂਕ ਪਾਸਬੁੱਕ ਦੀ ਕਾਪੀ ਅਤੇ ਚਾਲੂ ਮੋਬਾਈਲ ਨੰਬਰ',
          ]
        : [
            'Original Aadhaar Card with complete DOB and current address',
            'PAN Card or Voter ID Card (Identity proof)',
            '10th Class Matriculation Certificate (for Non-ECR category)',
            'Active Bank Passbook with photo and recent entry',
          ],
      estimatedTimeline: isPa
        ? '7 ਤੋਂ 21 ਕੰਮਕਾਜੀ ਦਿਨ (ਪੁਲਿਸ ਵੈਰੀਫਿਕੇਸ਼ਨ ਅਨੁਸਾਰ)'
        : '7 to 21 working days (subject to police verification)',
      providerUsed: 'mbee-smart-desk',
      searchSources,
      whatsappSummaryText: `Hello M Bee Enterprises (Baljinder Singh & Manpreet Singh), I checked the Passport & PCC checklist for "${query}" and want to book an appointment.`,
    };
  }

  if (q.includes('loan') || q.includes('ਲੋਨ') || q.includes('emi') || q.includes('home')) {
    return {
      answer: isPa
        ? 'M Bee Enterprises (ਬਲਜਿੰਦਰ ਸਿੰਘ ਅਤੇ ਮਨਪ੍ਰੀਤ ਸਿੰਘ) ਵੱਲੋਂ ਪਰਸਨਲ ਲੋਨ, ਹੋਮ ਲੋਨ, ਕਾਰ ਲੋਨ ਅਤੇ ਬਿਜ਼ਨਸ ਲੋਨ ਲਈ ਬੈਂਕ ਨਿਯਮਾਂ ਅਨੁਸਾਰ ਪੂਰੀ ਫਾਈਲ ਤਿਆਰ ਕੀਤੀ ਜਾਂਦੀ ਹੈ।'
        : 'M Bee Enterprises (Prop. Baljinder Singh & Manpreet Singh) structures complete Personal, Home, Car, and Business Loan files with eligibility evaluation across partner banks and NBFCs.',
      checklist: isPa
        ? [
            'ਆਧਾਰ ਕਾਰਡ ਅਤੇ ਪੈਨ ਕਾਰਡ (KYC ਦਸਤਾਵੇਜ਼)',
            'ਪਿਛਲੇ 6 ਮਹੀਨਿਆਂ ਦੀ ਬੈਂਕ ਸਟੇਟਮੈਂਟ',
            'ਸੈਲਰੀ ਸਲਿੱਪਾਂ (3 ਮਹੀਨੇ) ਜਾਂ ਪਿਛਲੇ 2 ਸਾਲਾਂ ਦੀ ITR',
            '2 ਪਾਸਪੋਰਟ ਸਾਈਜ਼ ਫੋਟੋਆਂ ਅਤੇ ਪ੍ਰਾਪਰਟੀ/ਕੰਮ ਦਾ ਵੇਰਵਾ',
          ]
        : [
            'Aadhaar Card & PAN Card (KYC documents)',
            'Last 6 months updated Bank Account Statement',
            'Last 3 months Salary Slips OR 2 years ITR / Business proof',
            '2 Passport-size photographs and residence/property proof',
          ],
      estimatedTimeline: isPa
        ? '3 ਤੋਂ 10 ਕੰਮਕਾਜੀ ਦਿਨ (ਬੈਂਕ ਜਾਂਚ ਅਨੁਸਾਰ)'
        : '3 to 10 working days (subject to bank verification)',
      providerUsed: 'mbee-smart-desk',
      searchSources,
      whatsappSummaryText: `Hello M Bee Enterprises (Baljinder Singh & Manpreet Singh), I need loan file guidance regarding: "${query}".`,
    };
  }

  return {
    answer: isPa
      ? `M Bee Enterprises (ਬਲਜਿੰਦਰ ਸਿੰਘ ਅਤੇ ਮਨਪ੍ਰੀਤ ਸਿੰਘ), ਨੇੜੇ ਬੱਸ ਸਟੈਂਡ, ਮਾਹਿਲਪੁਰ (82888-37597, 99156-28427) ਵਿਖੇ ਤੁਹਾਡੇ ਕੰਮ "${query}" ਲਈ ਲੋੜੀਂਦੇ ਦਸਤਾਵੇਜ਼ਾਂ ਦੀ ਸੂਚੀ ਹੇਠਾਂ ਦਿੱਤੀ ਗਈ ਹੈ।`
      : `M Bee Enterprises (Prop. Baljinder Singh & Manpreet Singh), Bank of Baroda, near Bus Stand, Mahilpur (82888-37597, 99156-28427) provides structured guidance for "${query}". Review the required checklist below.`,
    checklist: isPa
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
        ],
    estimatedTimeline: isPa ? '3 ਤੋਂ 10 ਕੰਮਕਾਜੀ ਦਿਨ' : '3 to 10 working days',
    providerUsed: 'mbee-smart-desk',
    searchSources,
    whatsappSummaryText: `Hello M Bee Enterprises (Baljinder Singh & Manpreet Singh), I would like assistance regarding: "${query}".`,
  };
}
