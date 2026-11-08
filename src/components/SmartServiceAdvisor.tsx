/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import {
  FileCheck2,
  Send,
  CheckCircle2,
  Clock,
  MessageCircle,
  Sparkles,
  Search,
  ExternalLink,
} from 'lucide-react';
import { Language } from '../data/translations';
import {
  AdvisorProvider,
  AdvisorQueryResponse,
  buildDeterministicAdvisorResponse,
  querySmartServiceAdvisor,
} from '../utils/cloudIntegrations';
import { buildWhatsAppUrl, PRIMARY_WHATSAPP } from '../utils/loanCalculator';

interface SmartServiceAdvisorProps {
  lang: Language;
  onSelectServiceForDispatch?: (serviceTitle: string, customNote: string) => void;
}

const PRESET_TOPICS = [
  {
    en: 'Passport Renewal & Tatkaal Checklist',
    pa: 'ਪਾਸਪੋਰਟ ਰੀ-ਇਸ਼ੂ ਅਤੇ ਤਤਕਾਲ ਦਸਤਾਵੇਜ਼',
    queryEn: 'What documents are required for Passport Renewal and Tatkaal appointment in Punjab?',
    queryPa: 'ਪੰਜਾਬ ਵਿੱਚ ਪਾਸਪੋਰਟ ਰੀ-ਇਸ਼ੂ ਅਤੇ ਤਤਕਾਲ ਅਪਾਇੰਟਮੈਂਟ ਲਈ ਕਿਹੜੇ ਦਸਤਾਵੇਜ਼ ਚਾਹੀਦੇ ਹਨ?',
  },
  {
    en: 'Home & Personal Loan Eligibility',
    pa: 'ਹੋਮ ਲੋਨ ਅਤੇ ਪਰਸਨਲ ਲੋਨ ਦੀ ਫਾਈਲ',
    queryEn: 'What documents are needed for Home Loan and Personal Loan file preparation?',
    queryPa: 'ਹੋਮ ਲੋਨ ਅਤੇ ਪਰਸਨਲ ਲੋਨ ਦੀ ਫਾਈਲ ਤਿਆਰ ਕਰਨ ਲਈ ਕਿਹੜੇ ਕਾਗਜ਼ਾਤ ਚਾਹੀਦੇ ਹਨ?',
  },
  {
    en: 'Aadhaar Address & DOB Correction',
    pa: 'ਆਧਾਰ ਕਾਰਡ ਪਤਾ ਅਤੇ ਜਨਮ ਮਿਤੀ ਸੁਧਾਰ',
    queryEn: 'Checklist for Aadhaar Card address update and PAN card correction',
    queryPa: 'ਆਧਾਰ ਕਾਰਡ ਦਾ ਪਤਾ ਬਦਲਣ ਅਤੇ ਪੈਨ ਕਾਰਡ ਸੁਧਾਰ ਲਈ ਲੋੜੀਂਦੇ ਦਸਤਾਵੇਜ਼',
  },
  {
    en: 'Driving Licence & Vehicle Insurance',
    pa: 'ਡਰਾਈਵਿੰਗ ਲਾਇਸੈਂਸ ਅਤੇ ਬੀਮਾ ਰੀਨਿਊਅਲ',
    queryEn: 'Documents required for Learner/Permanent Driving Licence and Motor Insurance renewal',
    queryPa: 'ਡਰਾਈਵਿੰਗ ਲਾਇਸੈਂਸ ਅਤੇ ਗੱਡੀ ਦੇ ਬੀਮੇ (Insurance) ਲਈ ਲੋੜੀਂਦੇ ਦਸਤਾਵੇਜ਼',
  },
];

export const SmartServiceAdvisor: React.FC<SmartServiceAdvisorProps> = ({
  lang,
  onSelectServiceForDispatch,
}) => {
  const [queryText, setQueryText] = useState<string>('');
  const [provider, setProvider] = useState<AdvisorProvider>('auto');
  const [includeWebSearch, setIncludeWebSearch] = useState<boolean>(true);
  const [loading, setLoading] = useState<boolean>(false);
  const [result, setResult] = useState<AdvisorQueryResponse>(() =>
    buildDeterministicAdvisorResponse({
      query: 'Passport Renewal & Tatkaal Checklist',
      language: lang,
    })
  );

  const handleRunAdvisor = async (customQuery?: string) => {
    const activeQuery = (customQuery ?? queryText).trim();
    if (!activeQuery) return;
    if (customQuery) {
      setQueryText(customQuery);
    }
    setLoading(true);
    try {
      const response = await querySmartServiceAdvisor({
        query: activeQuery,
        language: lang,
        provider,
        includeWebSearch,
      });
      setResult(response);
    } finally {
      setLoading(false);
    }
  };

  return (
    <section
      id="smart-advisor"
      data-testid="smart-service-advisor-section"
      className="py-12 bg-white border-y border-slate-200"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="rounded-2xl bg-gradient-to-br from-[#081326] via-[#0D1E3A] to-[#081326] text-white p-6 sm:p-8 border border-[#C69C3A]/35 shadow-xl">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
            {/* Left Column: Query Input & Quick Topic Chips */}
            <div className="lg:col-span-6 space-y-4">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-md bg-[#C69C3A]/15 border border-[#C69C3A]/40 text-[#E5C158] text-xs font-bold tracking-wide uppercase">
                <Sparkles className="w-3.5 h-3.5" />
                <span>
                  {lang === 'en'
                    ? 'Smart Citizen & Financial Document Desk'
                    : 'ਸਮਾਰਟ ਦਸਤਾਵੇਜ਼ ਅਤੇ ਲੋਨ ਸਲਾਹਕਾਰ ਡੈਸਕ'}
                </span>
              </div>

              <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-white">
                {lang === 'en'
                  ? 'Instant Document Checklist & Eligibility Guide'
                  : 'ਤੁਰੰਤ ਦਸਤਾਵੇਜ਼ ਚੈੱਕਲਿਸਟ ਅਤੇ ਯੋਗਤਾ ਗਾਈਡ'}
              </h2>

              <p className="text-sm text-slate-300 leading-relaxed">
                {lang === 'en'
                  ? 'Ask in English or Punjabi about any Passport, Aadhaar, PAN, Driving Licence, Loan file, Insurance policy, or Property record. Guided by Proprietors Baljinder Singh & Manpreet Singh.'
                  : 'ਪਾਸਪੋਰਟ, ਆਧਾਰ ਕਾਰਡ, ਪੈਨ ਕਾਰਡ, ਡਰਾਈਵਿੰਗ ਲਾਇਸੈਂਸ, ਲੋਨ ਫਾਈਲ, ਬੀਮਾ ਜਾਂ ਪ੍ਰਾਪਰਟੀ ਬਾਰੇ ਪੰਜਾਬੀ ਜਾਂ ਅੰਗਰੇਜ਼ੀ ਵਿੱਚ ਪੁੱਛੋ ਅਤੇ ਲੋੜੀਂਦੇ ਕਾਗਜ਼ਾਂ ਦੀ ਪੂਰੀ ਸੂਚੀ ਪ੍ਰਾਪਤ ਕਰੋ।'}
              </p>

              {/* Engine & Search Mode Selector */}
              <div className="flex flex-wrap items-center gap-2 pt-1">
                <span className="text-xs font-semibold text-slate-300">
                  {lang === 'en' ? 'Advisory Engine:' : 'ਸਲਾਹਕਾਰ ਮੋਡ:'}
                </span>
                {(
                  [
                    { id: 'auto', label: lang === 'en' ? 'Auto (Gemini + Groq)' : 'ਆਟੋ (Gemini + Groq)' },
                    { id: 'gemini', label: 'Gemini AI' },
                    { id: 'groq', label: 'Groq Llama 3.3' },
                  ] as const
                ).map((item) => (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => setProvider(item.id)}
                    data-testid={`advisor-provider-${item.id}`}
                    className={`px-2.5 py-1 rounded-md text-xs font-bold transition-colors cursor-pointer ${
                      provider === item.id
                        ? 'bg-[#C69C3A] text-[#081326]'
                        : 'bg-white/10 text-slate-200 hover:bg-white/15'
                    }`}
                  >
                    {item.label}
                  </button>
                ))}

                <button
                  type="button"
                  onClick={() => setIncludeWebSearch((prev) => !prev)}
                  data-testid="advisor-websearch-toggle"
                  className={`px-2.5 py-1 rounded-md text-xs font-bold inline-flex items-center gap-1 transition-colors cursor-pointer border ${
                    includeWebSearch
                      ? 'bg-emerald-500/20 text-emerald-300 border-emerald-400/40'
                      : 'bg-white/5 text-slate-400 border-white/10'
                  }`}
                >
                  <Search className="w-3 h-3" />
                  <span>{lang === 'en' ? 'Tavily Live Rules' : 'ਲਾਈਵ ਨਿਯਮ ਖੋਜ'}</span>
                </button>
              </div>

              {/* Input Form */}
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  void handleRunAdvisor();
                }}
                className="flex flex-col sm:flex-row gap-2.5 pt-1"
              >
                <label htmlFor="smart-advisor-input" className="sr-only">
                  {lang === 'en' ? 'Ask about any service or document checklist' : 'ਕਿਸੇ ਵੀ ਸੇਵਾ ਬਾਰੇ ਪੁੱਛੋ'}
                </label>
                <input
                  id="smart-advisor-input"
                  data-testid="smart-advisor-input"
                  type="text"
                  value={queryText}
                  onChange={(e) => setQueryText(e.target.value)}
                  placeholder={
                    lang === 'en'
                      ? 'e.g., What documents are needed for Passport renewal or Home Loan?'
                      : 'ਉਦਾਹਰਨ: ਪਾਸਪੋਰਟ ਰੀ-ਇਸ਼ੂ ਜਾਂ ਹੋਮ ਲੋਨ ਲਈ ਕਿਹੜੇ ਕਾਗਜ਼ ਚਾਹੀਦੇ ਹਨ?'
                  }
                  className="flex-1 px-3.5 py-2.5 rounded-lg bg-[#050C1A] border border-white/20 text-sm text-white placeholder:text-slate-400 focus:outline-none focus:border-[#E5C158]"
                />
                <button
                  type="submit"
                  disabled={loading}
                  data-testid="smart-advisor-submit-btn"
                  className="px-5 py-2.5 rounded-lg bg-[#C69C3A] hover:bg-[#D4AD47] disabled:opacity-60 text-[#081326] font-extrabold text-sm inline-flex items-center justify-center gap-2 transition-colors shrink-0 cursor-pointer"
                >
                  <Send className="w-4 h-4" />
                  <span>
                    {loading
                      ? lang === 'en'
                        ? 'Checking...'
                        : 'ਚੈੱਕ ਹੋ ਰਿਹਾ ਹੈ...'
                      : lang === 'en'
                      ? 'Get Checklist'
                      : 'ਚੈੱਕਲਿਸਟ ਦੇਖੋ'}
                  </span>
                </button>
              </form>

              {/* Quick Topic Buttons */}
              <div className="space-y-1.5 pt-1">
                <span className="text-xs font-semibold text-[#E5C158] block">
                  {lang === 'en' ? 'Popular Citizen & Loan Queries:' : 'ਪ੍ਰਮੁੱਖ ਸੇਵਾਵਾਂ ਬਾਰੇ ਤੁਰੰਤ ਪੁੱਛੋ:'}
                </span>
                <div className="flex flex-wrap gap-2">
                  {PRESET_TOPICS.map((topic, idx) => (
                    <button
                      key={idx}
                      type="button"
                      data-testid={`advisor-preset-${idx}`}
                      onClick={() =>
                        void handleRunAdvisor(lang === 'en' ? topic.queryEn : topic.queryPa)
                      }
                      className="px-3 py-1.5 rounded-lg bg-white/10 hover:bg-white/15 border border-white/15 text-xs font-semibold text-slate-200 transition-colors cursor-pointer text-left"
                    >
                      {lang === 'en' ? topic.en : topic.pa}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Right Column: Structured Checklist Output Card */}
            <div className="lg:col-span-6">
              <div
                data-testid="smart-advisor-result-card"
                className="rounded-xl bg-[#0B1930] border border-[#C69C3A]/40 p-5 sm:p-6 space-y-4 shadow-inner"
              >
                <div className="flex items-center justify-between gap-2 border-b border-white/10 pb-3">
                  <div className="flex items-center gap-2">
                    <FileCheck2 className="w-5 h-5 text-[#E5C158] shrink-0" />
                    <h3 className="text-base font-extrabold text-white">
                      {lang === 'en'
                        ? 'Verified Service & Document Guidance'
                        : 'تصਦੀਕਸ਼ੁਦਾ ਦਸਤਾਵੇਜ਼ ਅਤੇ ਸੇਵਾ ਗਾਈਡ'}
                    </h3>
                  </div>
                  <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded bg-[#C69C3A]/20 text-[#E5C158] text-[11px] font-bold">
                    <Clock className="w-3 h-3" />
                    <span>{result.estimatedTimeline}</span>
                  </span>
                </div>

                <p
                  data-testid="smart-advisor-answer-text"
                  className="text-sm text-slate-200 leading-relaxed"
                >
                  {result.answer}
                </p>

                <div className="space-y-2">
                  <div className="text-xs font-bold uppercase tracking-wider text-[#E5C158]">
                    {lang === 'en'
                      ? 'Required Documents Checklist:'
                      : 'ਲੋੜੀਂਦੇ ਦਸਤਾਵੇਜ਼ਾਂ ਦੀ ਸੂਚੀ (Checklist):'}
                  </div>
                  <ul className="space-y-2">
                    {result.checklist.map((item, idx) => (
                      <li
                        key={idx}
                        className="flex items-start gap-2.5 text-xs sm:text-sm text-slate-100 bg-white/5 px-3 py-2 rounded-lg border border-white/10"
                      >
                        <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                        <span>{item}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                {result.searchSources && result.searchSources.length > 0 && (
                  <div className="pt-2 border-t border-white/10 space-y-1.5">
                    <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">
                      {lang === 'en' ? 'Reference Portal Links:' : 'ਸਬੰਧਤ ਪੋਰਟਲ ਲਿੰਕ:'}
                    </span>
                    <div className="flex flex-wrap gap-2">
                      {result.searchSources.map((src, i) => (
                        <a
                          key={i}
                          href={src.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-1 text-xs text-[#E5C158] hover:underline bg-white/5 px-2.5 py-1 rounded"
                        >
                          <span className="truncate max-w-[200px]">{src.title}</span>
                          <ExternalLink className="w-3 h-3 shrink-0" />
                        </a>
                      ))}
                    </div>
                  </div>
                )}

                <div className="pt-2 flex flex-wrap items-center gap-2.5">
                  <a
                    href={buildWhatsAppUrl(result.whatsappSummaryText, PRIMARY_WHATSAPP)}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex-1 min-w-[180px] py-2.5 px-4 rounded-lg bg-[#C69C3A] hover:bg-[#D4AD47] text-[#081326] font-extrabold text-xs sm:text-sm inline-flex items-center justify-center gap-2 transition-colors"
                  >
                    <MessageCircle className="w-4 h-4" />
                    <span>
                      {lang === 'en'
                        ? 'Send Checklist to WhatsApp Desk'
                        : 'ਵਟਸਐਪ ਤੇ ਭੇਜੋ (82888-37597)'}
                    </span>
                  </a>

                  {onSelectServiceForDispatch && (
                    <button
                      type="button"
                      onClick={() =>
                        onSelectServiceForDispatch(
                          queryText.trim() || 'Smart Checklist Consultation',
                          result.answer
                        )
                      }
                      data-testid="smart-advisor-track-btn"
                      className="py-2.5 px-4 rounded-lg bg-white/10 hover:bg-white/15 text-white border border-white/20 font-bold text-xs sm:text-sm inline-flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
                    >
                      <FileCheck2 className="w-4 h-4 text-[#E5C158]" />
                      <span>
                        {lang === 'en'
                          ? 'Add to My Document Tracker'
                          : 'ਮੇਰੇ ਪ੍ਰੋਫਾਈਲ ਟ੍ਰੈਕਰ ਵਿੱਚ ਜੋੜੋ'}
                      </span>
                    </button>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
