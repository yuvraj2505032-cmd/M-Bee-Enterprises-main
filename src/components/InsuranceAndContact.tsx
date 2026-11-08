import React, { useState, useEffect } from 'react';
import {
  ShieldCheck,
  PhoneCall,
  MessageCircle,
  CheckCircle2,
  MapPin,
  Clock,
  Mail,
  Settings2,
  ChevronDown,
  ChevronUp,
  MessageSquarePlus,
  Navigation,
  ExternalLink,
} from 'lucide-react';
import { Language, UI_TEXT } from '../data/translations';
import {
  PRIMARY_PHONE,
  SECONDARY_PHONE,
  PRIMARY_WHATSAPP,
  BUSINESS_EMAIL,
  buildWhatsAppUrl,
  UserSession,
  AdminNotificationPayload,
} from '../utils/loanCalculator';
import {
  OFFICIAL_SHOP_PHOTO_URL,
  OFFICIAL_SHOP_ADDRESS_EN,
  OFFICIAL_SHOP_ADDRESS_PA,
} from './BrandVisuals';

export function InsuranceSection({
  lang,
  userSession = null,
  onAdminNotify,
}: {
  lang: Language;
  userSession?: UserSession | null;
  onAdminNotify?: (payload: AdminNotificationPayload) => void;
}) {
  const t = UI_TEXT[lang].insuranceSection;

  const [policyType, setPolicyType] = useState('Motor Insurance (Car / Two-Wheeler)');
  const [customerName, setCustomerName] = useState(userSession?.name || '');
  const [customerPhone, setCustomerPhone] = useState(userSession?.mobile || '');
  const [vehicleOrNotes, setVehicleOrNotes] = useState('');
  const [callbackError, setCallbackError] = useState('');
  const [callbackSuccess, setCallbackSuccess] = useState(false);

  useEffect(() => {
    if (userSession) {
      setCustomerName((prev) => prev || userSession.name);
      setCustomerPhone((prev) => prev || userSession.mobile);
    }
  }, [userSession]);

  const handleInsuranceSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const cleanPhone = customerPhone.replace(/[\s\-+]/g, '');
    if (customerName.trim().length < 2) {
      setCallbackError(
        lang === 'en' ? 'Please enter your name.' : 'ਕਿਰਪਾ ਕਰਕੇ ਆਪਣਾ ਨਾਮ ਦਰਜ ਕਰੋ।'
      );
      return;
    }
    if (!/^(?:91)?[6-9]\d{9}$/.test(cleanPhone)) {
      setCallbackError(
        lang === 'en'
          ? 'Please enter a valid 10-digit mobile number.'
          : 'ਕਿਰਪਾ ਕਰਕੇ ਸਹੀ 10-ਅੰਕਾਂ ਦਾ ਮੋਬਾਈਲ ਨੰਬਰ ਦਰਜ ਕਰੋ।'
      );
      return;
    }
    setCallbackError('');
    setCallbackSuccess(true);

    if (onAdminNotify) {
      onAdminNotify({
        userName: customerName.trim(),
        userMobile: customerPhone.trim(),
        serviceName: `Insurance: ${policyType}`,
        workDescription:
          vehicleOrNotes.trim() ||
          `Customer requested a callback for ${policyType}.`,
        preferredContact: 'call',
        referenceCode: `INS-${Math.floor(1000 + Math.random() * 9000)}`,
      });
    }
  };

  const whatsappInsuranceUrl = buildWhatsAppUrl(
    `Hello M Bee Enterprises (Prop. Baljinder Singh & Manpreet Singh), I need insurance consultation:\n• Policy Type: ${policyType}\n• Name: ${customerName || 'Client'}\n• Mobile: ${customerPhone || 'N/A'}\n• Details: ${vehicleOrNotes || 'Please call back with policy details.'}`,
    PRIMARY_WHATSAPP
  );

  return (
    <section
      id="insurance-section"
      aria-labelledby="insurance-heading"
      className="py-16 bg-slate-100 border-t border-slate-200"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-stretch">
          {/* Left 7 Cols: Insurance Advisory Pillars & Visual */}
          <div className="lg:col-span-7 flex flex-col justify-between space-y-6">
            <div>
              <div className="text-xs font-semibold uppercase tracking-wider text-[#9A7422] mb-2">
                {t.kicker}
              </div>
              <h2
                id="insurance-heading"
                className="text-3xl sm:text-4xl font-bold text-[#0F213C] tracking-tight text-balance"
              >
                {t.heading}
              </h2>
              <p className="mt-3 text-slate-600 text-base leading-relaxed">{t.subheading}</p>
            </div>

            <div className="space-y-4">
              {t.pillars.map((pillar, idx) => (
                <div
                  key={idx}
                  className="p-5 rounded-2xl bg-white border border-slate-200/90 shadow-xs flex items-start gap-4"
                >
                  <div className="w-10 h-10 rounded-xl bg-[#0F213C] text-[#E5C158] flex items-center justify-center shrink-0 font-tabular font-bold text-sm">
                    0{idx + 1}
                  </div>
                  <div>
                    <h3 className="text-base font-bold text-[#0F213C]">{pillar.title}</h3>
                    <p className="mt-1 text-sm text-slate-600 leading-relaxed">{pillar.desc}</p>
                  </div>
                </div>
              ))}
            </div>

            {/* Direct WhatsApp Renewal Strip */}
            <div className="p-5 rounded-2xl bg-[#0F213C] text-white border border-[#C69C3A]/35 flex flex-wrap items-center justify-between gap-4">
              <div>
                <div className="text-xs font-semibold text-[#E5C158] uppercase tracking-wider">
                  {lang === 'en' ? 'Fast Policy Renewal Desk' : 'ਤੁਰੰਤ ਪਾਲਿਸੀ ਰੀਨਿਊਅਲ ਡੈਸਕ'}
                </div>
                <div className="text-sm text-slate-200 mt-0.5">
                  {lang === 'en'
                    ? 'Send a photo of your previous policy or RC on WhatsApp for renewal assistance.'
                    : 'ਆਪਣੀ ਪੁਰਾਣੀ ਪਾਲਿਸੀ ਜਾਂ ਆਰ.ਸੀ. ਦੀ ਫੋਟੋ ਵਟਸਐਪ ਕਰਕੇ ਤੁਰੰਤ ਕੋਟੇਸ਼ਨ ਲਓ।'}
                </div>
              </div>
              <a
                href={buildWhatsAppUrl(
                  'Hello M Bee Enterprises, I want to renew/enquire about an Insurance Policy. I am sharing the details here.',
                  PRIMARY_WHATSAPP
                )}
                target="_blank"
                rel="noopener noreferrer"
                className="px-4 py-2.5 rounded-xl bg-[#C69C3A] hover:bg-[#D4AF37] text-[#081326] font-bold text-xs inline-flex items-center gap-1.5 transition-colors whitespace-nowrap shrink-0"
              >
                <MessageCircle className="w-4 h-4" />
                <span>{t.whatsappBtn}</span>
              </a>
            </div>
          </div>

          {/* Right 5 Cols: Dedicated Insurance Enquiry & Callback Form */}
          <div className="lg:col-span-5 bg-white rounded-2xl border border-slate-200 p-6 sm:p-8 shadow-md flex flex-col justify-between">
            <div>
              <div className="flex items-center gap-2.5 pb-4 mb-5 border-b border-slate-100">
                <div className="w-10 h-10 rounded-xl bg-[#FBF6E9] border border-[#E2C87D] text-[#8A6619] flex items-center justify-center shrink-0">
                  <ShieldCheck className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-[#0F213C]">
                    {lang === 'en'
                      ? 'Insurance Consultation & Callback'
                      : 'ਬੀਮਾ ਸਲਾਹ ਅਤੇ ਕਾਲਬੈਕ ਫਾਰਮ'}
                  </h3>
                  <p className="text-xs text-slate-500">
                    {lang === 'en'
                      ? 'Guided by Baljinder Singh & Manpreet Singh'
                      : 'ਬਲਜਿੰਦਰ ਸਿੰਘ ਅਤੇ ਮਨਪ੍ਰੀਤ ਸਿੰਘ ਦੁਆਰਾ ਮਾਰਗਦਰਸ਼ਨ'}
                  </p>
                </div>
              </div>

              {callbackSuccess ? (
                <div
                  data-testid="insurance-callback-success"
                  className="p-6 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-950 space-y-4"
                >
                  <div className="flex items-center gap-2 text-emerald-800 font-bold text-base">
                    <CheckCircle2 className="w-5 h-5" />
                    <span>
                      {lang === 'en'
                        ? 'Callback Request Logged!'
                        : 'ਕਾਲਬੈਕ ਬੇਨਤੀ ਦਰਜ ਹੋ ਗਈ ਹੈ!'}
                    </span>
                  </div>
                  <p className="text-xs leading-relaxed text-emerald-900">
                    {lang === 'en'
                      ? `Thank you, ${customerName}. We have noted your interest in ${policyType}. Click below to also message us directly on WhatsApp.`
                      : `ਧੰਨਵਾਦ ${customerName}। ਤੁਹਾਡੀ ${policyType} ਸਬੰਧੀ ਬੇਨਤੀ ਨੋਟ ਕਰ ਲਈ ਗਈ ਹੈ।`}
                  </p>
                  <div className="flex flex-wrap gap-2 pt-1">
                    <a
                      href={whatsappInsuranceUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="px-4 py-2 rounded-lg bg-emerald-700 hover:bg-emerald-800 text-white text-xs font-bold inline-flex items-center gap-1.5 whitespace-nowrap"
                    >
                      <MessageCircle className="w-3.5 h-3.5" />
                      <span>Connect on WhatsApp</span>
                    </a>
                    <button
                      type="button"
                      onClick={() => {
                        setCallbackSuccess(false);
                        setCustomerName('');
                        setCustomerPhone('');
                        setVehicleOrNotes('');
                      }}
                      className="px-3 py-2 rounded-lg bg-white border border-emerald-300 text-emerald-900 text-xs font-semibold whitespace-nowrap"
                    >
                      Reset
                    </button>
                  </div>
                </div>
              ) : (
                <form onSubmit={handleInsuranceSubmit} noValidate className="space-y-4">
                  <div>
                    <label
                      htmlFor="ins-policy-type"
                      className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1"
                    >
                      {lang === 'en' ? 'Insurance Category' : 'ਬੀਮੇ ਦੀ ਕਿਸਮ'}
                    </label>
                    <select
                      id="ins-policy-type"
                      value={policyType}
                      onChange={(e) => setPolicyType(e.target.value)}
                      className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-300 text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-900"
                    >
                      <option value="Motor Insurance (Car / Two-Wheeler)">
                        Motor Insurance (Car / Two-Wheeler / Commercial)
                      </option>
                      <option value="Health & Family Mediclaim">
                        Health &amp; Family Mediclaim Insurance
                      </option>
                      <option value="Life / Term Plan Consultation">
                        Life / Term Insurance Consultation
                      </option>
                      <option value="International Travel / Student Insurance">
                        International Travel / Study Visa Insurance
                      </option>
                    </select>
                  </div>

                  <div>
                    <label
                      htmlFor="ins-name"
                      className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1"
                    >
                      {lang === 'en' ? 'Your Name *' : 'ਤੁਹਾਡਾ ਨਾਮ *'}
                    </label>
                    <input
                      id="ins-name"
                      type="text"
                      value={customerName}
                      onChange={(e) => setCustomerName(e.target.value)}
                      placeholder={lang === 'en' ? 'Enter your full name' : 'ਆਪਣਾ ਨਾਮ ਲਿਖੋ'}
                      className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-300 text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-900"
                    />
                  </div>

                  <div>
                    <label
                      htmlFor="ins-phone"
                      className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1"
                    >
                      {lang === 'en' ? 'Mobile Number *' : 'ਮੋਬਾਈਲ ਨੰਬਰ *'}
                    </label>
                    <input
                      id="ins-phone"
                      type="tel"
                      value={customerPhone}
                      onChange={(e) => setCustomerPhone(e.target.value)}
                      placeholder="9876543210"
                      className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-300 text-sm font-tabular text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-900"
                    />
                  </div>

                  <div>
                    <label
                      htmlFor="ins-notes"
                      className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1"
                    >
                      {lang === 'en'
                        ? 'Policy / Vehicle / Renewal Note (Optional)'
                        : 'ਪਾਲਿਸੀ ਜਾਂ ਵਾਹਨ ਸਬੰਧੀ ਵੇਰਵਾ'}
                    </label>
                    <input
                      id="ins-notes"
                      type="text"
                      value={vehicleOrNotes}
                      onChange={(e) => setVehicleOrNotes(e.target.value)}
                      placeholder={
                        lang === 'en'
                          ? 'e.g., Car insurance expiring next week'
                          : 'ਉਦਾਹਰਨ: ਕਾਰ ਦਾ ਬੀਮਾ ਰੀਨਿਊ ਕਰਵਾਉਣਾ ਹੈ'
                      }
                      className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-300 text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-900"
                    />
                  </div>

                  {callbackError && (
                    <p className="text-xs text-red-600 font-medium" role="alert">
                      {callbackError}
                    </p>
                  )}

                  <button
                    type="submit"
                    className="w-full py-3 px-5 rounded-xl bg-[#0F213C] hover:bg-[#173056] text-[#E5C158] font-bold text-sm flex items-center justify-center gap-2 transition-colors whitespace-nowrap"
                  >
                    <PhoneCall className="w-4 h-4 shrink-0" />
                    <span>{t.callbackBtn}</span>
                  </button>
                </form>
              )}
            </div>

            <div className="mt-6 pt-4 border-t border-slate-100 text-[11px] text-slate-500">
              {lang === 'en'
                ? 'Note: Insurance coverage, premium rates, and claim settlements are subject to the terms and conditions of the respective insurance company.'
                : 'ਨੋਟ: ਬੀਮਾ ਕਵਰੇਜ, ਪ੍ਰੀਮੀਅਮ ਅਤੇ ਕਲੇਮ ਸਬੰਧਤ ਬੀਮਾ ਕੰਪਨੀ ਦੇ ਨਿਯਮਾਂ ਅਤੇ ਸ਼ਰਤਾਂ ਦੇ ਅਧੀਨ ਹਨ।'}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

interface VerifiedFeedbackItem {
  id: string;
  name: string;
  serviceUsed: string;
  comment: string;
  date: string;
}

const STORAGE_KEY_FEEDBACK = 'mbee_genuine_feedback_v1';

export function TestimonialsAndFaqSection({ lang }: { lang: Language }) {
  const tTest = UI_TEXT[lang].testimonialsSection;
  const tFaq = UI_TEXT[lang].faqSection;

  const [openFaqIndex, setOpenFaqIndex] = useState<number>(0);
  const [feedbacks, setFeedbacks] = useState<VerifiedFeedbackItem[]>([]);
  const [showFeedbackForm, setShowFeedbackForm] = useState(false);
  const [fbName, setFbName] = useState('');
  const [fbService, setFbService] = useState('Documentation Services');
  const [fbComment, setFbComment] = useState('');
  const [fbError, setFbError] = useState('');

  useEffect(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY_FEEDBACK);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed)) {
          setFeedbacks(parsed);
        }
      }
    } catch {
      // ignore
    }
  }, []);

  const handleAddFeedback = (e: React.FormEvent) => {
    e.preventDefault();
    if (fbName.trim().length < 2 || fbComment.trim().length < 5) {
      setFbError(
        lang === 'en'
          ? 'Please enter your name and a brief genuine comment.'
          : 'ਕਿਰਪਾ ਕਰਕੇ ਆਪਣਾ ਨਾਮ ਅਤੇ ਅਨੁਭਵ ਲਿਖੋ।'
      );
      return;
    }
    setFbError('');
    const item: VerifiedFeedbackItem = {
      id: Date.now().toString(),
      name: fbName.trim(),
      serviceUsed: fbService,
      comment: fbComment.trim(),
      date: new Date().toLocaleDateString('en-IN', {
        day: 'numeric',
        month: 'short',
        year: 'numeric',
      }),
    };
    const updated = [item, ...feedbacks];
    setFeedbacks(updated);
    setFbName('');
    setFbComment('');
    setShowFeedbackForm(false);
    try {
      localStorage.setItem(STORAGE_KEY_FEEDBACK, JSON.stringify(updated));
    } catch {
      // ignore
    }
  };

  return (
    <section className="py-16 bg-slate-50 border-t border-slate-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-16">
        {/* Genuine Client Feedback Policy & Submission */}
        <div className="rounded-2xl bg-white border border-slate-200 p-6 sm:p-8 shadow-xs">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-6 border-b border-slate-100">
            <div className="max-w-2xl">
              <div className="text-xs font-semibold uppercase tracking-wider text-[#9A7422] mb-1">
                {lang === 'en' ? '100% Authentic Policy' : '100% ਸੱਚੀ ਅਤੇ ਪ੍ਰਮਾਣਿਕ ਨੀਤੀ'}
              </div>
              <h2 className="text-2xl sm:text-3xl font-bold text-[#0F213C]">{tTest.heading}</h2>
              <p className="mt-2 text-sm text-slate-600 leading-relaxed">{tTest.subheading}</p>
            </div>
            <button
              type="button"
              onClick={() => setShowFeedbackForm(!showFeedbackForm)}
              className="px-4 py-2.5 rounded-xl bg-[#0F213C] hover:bg-[#173056] text-[#E5C158] text-xs font-bold inline-flex items-center gap-2 transition-colors whitespace-nowrap shrink-0 self-start md:self-center"
            >
              <MessageSquarePlus className="w-4 h-4" />
              <span>{tTest.addFeedbackBtn}</span>
            </button>
          </div>

          {showFeedbackForm && (
            <form
              onSubmit={handleAddFeedback}
              className="mt-6 p-5 rounded-xl bg-slate-50 border border-slate-200 space-y-4"
            >
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label
                    htmlFor="fb-name"
                    className="block text-xs font-bold uppercase text-slate-700 mb-1"
                  >
                    {lang === 'en' ? 'Your Name' : 'ਤੁਹਾਡਾ ਨਾਮ'}
                  </label>
                  <input
                    id="fb-name"
                    type="text"
                    value={fbName}
                    onChange={(e) => setFbName(e.target.value)}
                    placeholder="e.g., Harpreet Singh"
                    className="w-full px-3 py-2 rounded-lg bg-white border border-slate-300 text-sm"
                  />
                </div>
                <div>
                  <label
                    htmlFor="fb-service"
                    className="block text-xs font-bold uppercase text-slate-700 mb-1"
                  >
                    {lang === 'en' ? 'Service Visited For' : 'ਕਿਹੜੀ ਸੇਵਾ ਲਈ ਆਏ ਸੀ'}
                  </label>
                  <select
                    id="fb-service"
                    value={fbService}
                    onChange={(e) => setFbService(e.target.value)}
                    className="w-full px-3 py-2 rounded-lg bg-white border border-slate-300 text-sm"
                  >
                    <option value="Documentation Services">Documentation Services</option>
                    <option value="Loan Consultancy">Loan Consultancy</option>
                    <option value="Insurance Services">Insurance Services</option>
                    <option value="Property Advisory">Property Advisory</option>
                  </select>
                </div>
              </div>
              <div>
                <label
                  htmlFor="fb-comment"
                  className="block text-xs font-bold uppercase text-slate-700 mb-1"
                >
                  {lang === 'en' ? 'Your Genuine Feedback' : 'ਤੁਹਾਡਾ ਅਨੁਭਵ'}
                </label>
                <textarea
                  id="fb-comment"
                  rows={2}
                  value={fbComment}
                  onChange={(e) => setFbComment(e.target.value)}
                  placeholder={
                    lang === 'en'
                      ? 'Share your real experience with M Bee Enterprises...'
                      : 'ਐਮ ਬੀ ਐਂਟਰਪ੍ਰਾਈਜ਼ਿਜ਼ ਨਾਲ ਆਪਣਾ ਅਸਲ ਅਨੁਭਵ ਲਿਖੋ...'
                  }
                  className="w-full px-3 py-2 rounded-lg bg-white border border-slate-300 text-sm"
                />
              </div>
              {fbError && <p className="text-xs text-red-600">{fbError}</p>}
              <button
                type="submit"
                className="px-4 py-2 rounded-lg bg-[#C69C3A] hover:bg-[#D4AF37] text-[#081326] font-bold text-xs"
              >
                {lang === 'en' ? 'Post Genuine Review' : 'ਫੀਡਬੈਕ ਸਬਮਿਟ ਕਰੋ'}
              </button>
            </form>
          )}

          {feedbacks.length > 0 ? (
            <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-4">
              {feedbacks.map((fb) => (
                <div
                  key={fb.id}
                  className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-2"
                >
                  <p className="text-sm text-slate-800 italic">"{fb.comment}"</p>
                  <div className="text-xs text-slate-500 flex items-center justify-between">
                    <strong className="text-slate-900">{fb.name}</strong>
                    <span>
                      {fb.serviceUsed} · {fb.date}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-4 text-xs text-slate-600">
              <div className="p-4 rounded-xl bg-slate-50 border border-slate-200/80">
                <div className="font-bold text-slate-900 mb-1">
                  {lang === 'en' ? '01. Direct Proprietor Guidance' : '01. ਪ੍ਰੋਪਰਾਈਟਰ ਵੱਲੋਂ ਸਿੱਧੀ ਸਲਾਹ'}
                </div>
                <p>
                  {lang === 'en'
                    ? 'Every loan, insurance, and property consultation is personally overseen by Baljinder Singh & Manpreet Singh.'
                    : 'ਹਰ ਲੋਨ, ਬੀਮਾ ਅਤੇ ਪ੍ਰਾਪਰਟੀ ਸਲਾਹ ਬਲਜਿੰਦਰ ਸਿੰਘ ਅਤੇ ਮਨਪ੍ਰੀਤ ਸਿੰਘ ਦੀ ਨਿੱਜੀ ਦੇਖ-ਰੇਖ ਹੇਠ ਦਿੱਤੀ ਜਾਂਦੀ ਹੈ।'}
                </p>
              </div>
              <div className="p-4 rounded-xl bg-slate-50 border border-slate-200/80">
                <div className="font-bold text-slate-900 mb-1">
                  {lang === 'en'
                    ? '02. Zero Fabricated Claims'
                    : '02. ਕੋਈ ਝੂਠਾ ਵਾਅਦਾ ਜਾਂ ਬਣਾਉਟੀ ਦਾਅਵਾ ਨਹੀਂ'}
                </div>
                <p>
                  {lang === 'en'
                    ? 'We provide honest eligibility assessments and clear government portal checklists before starting work.'
                    : 'ਅਸੀਂ ਕੰਮ ਸ਼ੁਰੂ ਕਰਨ ਤੋਂ ਪਹਿਲਾਂ ਸਹੀ ਯੋਗਤਾ ਅਤੇ ਲੋੜੀਂਦੇ ਦਸਤਾਵੇਜ਼ਾਂ ਬਾਰੇ ਸਪੱਸ਼ਟ ਜਾਣਕਾਰੀ ਦਿੰਦੇ ਹਾਂ।'}
                </p>
              </div>
              <div className="p-4 rounded-xl bg-slate-50 border border-slate-200/80">
                <div className="font-bold text-slate-900 mb-1">
                  {lang === 'en' ? '03. Respect for Document Privacy' : '03. ਦਸਤਾਵੇਜ਼ਾਂ ਦੀ ਪੂਰੀ ਗੁਪਤਤਾ'}
                </div>
                <p>
                  {lang === 'en'
                    ? 'Customer KYC and financial records are handled with strict confidentiality at our counter.'
                    : 'ਗਾਹਕਾਂ ਦੇ ਪਛਾਣ ਪੱਤਰਾਂ ਅਤੇ ਬੈਂਕ ਕਾਗਜ਼ਾਤ ਦੀ ਪੂਰੀ ਗੁਪਤਤਾ ਅਤੇ ਸੁਰੱਖਿਆ ਰੱਖੀ ਜਾਂਦੀ ਹੈ।'}
                </p>
              </div>
            </div>
          )}
        </div>

        {/* FAQ Accordion */}
        <div>
          <h2 className="text-2xl sm:text-3xl font-bold text-slate-900 mb-6">{tFaq.heading}</h2>
          <div className="space-y-3">
            {tFaq.items.map((item, idx) => {
              const isOpen = openFaqIndex === idx;
              return (
                <div
                  key={idx}
                  className="rounded-xl bg-white border border-slate-200 overflow-hidden"
                >
                  <button
                    type="button"
                    onClick={() => setOpenFaqIndex(isOpen ? -1 : idx)}
                    aria-expanded={isOpen}
                    className="w-full px-5 py-4 text-left flex items-center justify-between gap-4 hover:bg-slate-50 transition-colors"
                  >
                    <span className="text-sm sm:text-base font-bold text-slate-900">{item.q}</span>
                    {isOpen ? (
                      <ChevronUp className="w-4 h-4 text-blue-900 shrink-0" />
                    ) : (
                      <ChevronDown className="w-4 h-4 text-slate-500 shrink-0" />
                    )}
                  </button>
                  {isOpen && (
                    <div className="px-5 pb-4 pt-1 text-sm text-slate-600 leading-relaxed border-t border-slate-100">
                      {item.a}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
}

interface OfficeConfig {
  addressLine: string;
  mapQuery: string;
  weekdayHours: string;
  weekendHours: string;
  facebookUrl: string;
  instagramUrl: string;
}

const STORAGE_KEY_OFFICE_CONFIG = 'mbee_office_config_mahilpur_v3';

const DEFAULT_OFFICE_CONFIG: OfficeConfig = {
  addressLine: OFFICIAL_SHOP_ADDRESS_EN,
  mapQuery: OFFICIAL_SHOP_ADDRESS_EN,
  weekdayHours: 'Monday – Saturday: 9:00 AM – 7:00 PM',
  weekendHours: 'Sunday: By Prior Appointment on Phone/WhatsApp',
  facebookUrl: '',
  instagramUrl: '',
};

export function ContactSection({ lang }: { lang: Language }) {
  const t = UI_TEXT[lang].contactSection;

  const [officeConfig, setOfficeConfig] = useState<OfficeConfig>(DEFAULT_OFFICE_CONFIG);
  const [isEditingConfig, setIsEditingConfig] = useState(false);

  useEffect(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY_OFFICE_CONFIG);
      if (saved) {
        setOfficeConfig({ ...DEFAULT_OFFICE_CONFIG, ...JSON.parse(saved) });
      }
    } catch {
      // ignore
    }
  }, []);

  const handleSaveConfig = (e: React.FormEvent) => {
    e.preventDefault();
    setIsEditingConfig(false);
    try {
      localStorage.setItem(STORAGE_KEY_OFFICE_CONFIG, JSON.stringify(officeConfig));
    } catch {
      // ignore
    }
  };

  return (
    <section
      id="contact-section"
      aria-labelledby="contact-heading"
      className="py-16 bg-[#081326] text-white border-t border-[#C69C3A]/30"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-10">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <div className="text-xs font-semibold uppercase tracking-wider text-[#E5C158] mb-2">
              M Bee Enterprises · {UI_TEXT[lang].proprietorLabel}
            </div>
            <h2 id="contact-heading" className="text-3xl sm:text-4xl font-bold text-white">
              {t.heading}
            </h2>
            <p className="mt-2 text-slate-300 text-sm sm:text-base">{t.subheading}</p>
          </div>

          <button
            type="button"
            onClick={() => setIsEditingConfig(!isEditingConfig)}
            className="px-3.5 py-2 rounded-xl bg-white/8 hover:bg-white/15 text-[#E5C158] text-xs font-semibold inline-flex items-center gap-1.5 border border-white/10 transition-colors whitespace-nowrap"
          >
            <Settings2 className="w-3.5 h-3.5" />
            <span>{t.configureBtn}</span>
          </button>
        </div>

        {/* Configurable Shop Address & Timings Drawer for Proprietor */}
        {isEditingConfig && (
          <form
            onSubmit={handleSaveConfig}
            className="p-6 rounded-2xl bg-[#0F213C] border border-[#C69C3A]/40 space-y-4"
          >
            <div className="text-sm font-bold text-[#E5C158]">
              {lang === 'en'
                ? 'Proprietor Settings: Customize Exact Shop Landmark, Timings & Social Links'
                : 'ਦਫ਼ਤਰ ਦਾ ਪਤਾ, ਸਮਾਂ ਅਤੇ ਸੋਸ਼ਲ ਮੀਡੀਆ ਲਿੰਕ ਸੈੱਟ ਕਰੋ'}
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
              <div>
                <label htmlFor="cfg-address" className="block text-slate-300 mb-1 font-semibold">
                  Display Shop Address / Landmark
                </label>
                <input
                  id="cfg-address"
                  type="text"
                  value={officeConfig.addressLine}
                  onChange={(e) =>
                    setOfficeConfig({ ...officeConfig, addressLine: e.target.value })
                  }
                  className="w-full px-3 py-2 rounded-lg bg-[#081326] border border-white/20 text-white"
                />
              </div>
              <div>
                <label htmlFor="cfg-map" className="block text-slate-300 mb-1 font-semibold">
                  Google Maps Live Location Query
                </label>
                <input
                  id="cfg-map"
                  type="text"
                  value={officeConfig.mapQuery}
                  onChange={(e) => setOfficeConfig({ ...officeConfig, mapQuery: e.target.value })}
                  className="w-full px-3 py-2 rounded-lg bg-[#081326] border border-white/20 text-white"
                />
              </div>
              <div>
                <label htmlFor="cfg-weekday" className="block text-slate-300 mb-1 font-semibold">
                  Monday – Saturday Timings
                </label>
                <input
                  id="cfg-weekday"
                  type="text"
                  value={officeConfig.weekdayHours}
                  onChange={(e) =>
                    setOfficeConfig({ ...officeConfig, weekdayHours: e.target.value })
                  }
                  className="w-full px-3 py-2 rounded-lg bg-[#081326] border border-white/20 text-white"
                />
              </div>
              <div>
                <label htmlFor="cfg-weekend" className="block text-slate-300 mb-1 font-semibold">
                  Sunday Timings / Note
                </label>
                <input
                  id="cfg-weekend"
                  type="text"
                  value={officeConfig.weekendHours}
                  onChange={(e) =>
                    setOfficeConfig({ ...officeConfig, weekendHours: e.target.value })
                  }
                  className="w-full px-3 py-2 rounded-lg bg-[#081326] border border-white/20 text-white"
                />
              </div>
            </div>
            <button
              type="submit"
              className="px-4 py-2 rounded-lg bg-[#C69C3A] hover:bg-[#D4AF37] text-[#081326] font-bold text-xs"
            >
              {t.saveConfigBtn}
            </button>
          </form>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-stretch">
          {/* Left 6 Cols: Contact Details Cards + Real Shop Storefront Photo */}
          <div className="lg:col-span-6 grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Phone Numbers Card */}
            <div className="p-6 rounded-2xl bg-[#0F213C] border border-white/10 space-y-3">
              <div className="w-10 h-10 rounded-xl bg-[#C69C3A]/15 text-[#E5C158] flex items-center justify-center">
                <PhoneCall className="w-5 h-5" />
              </div>
              <div className="text-xs font-semibold uppercase tracking-wider text-[#E5C158]">
                {t.phonesLabel}
              </div>
              <div className="space-y-1.5 font-tabular text-lg font-bold">
                <div>
                  <a href="tel:+918288837597" className="hover:text-[#E5C158] transition-colors">
                    +91 {PRIMARY_PHONE}
                  </a>
                </div>
                <div>
                  <a href="tel:+919915628427" className="hover:text-[#E5C158] transition-colors">
                    +91 {SECONDARY_PHONE}
                  </a>
                </div>
              </div>
              <div className="pt-2 flex flex-wrap gap-2">
                <a
                  href="tel:+918288837597"
                  className="px-3 py-1.5 rounded-lg bg-white/10 hover:bg-white/15 text-xs font-semibold text-white whitespace-nowrap"
                >
                  Call 82888-37597
                </a>
                <a
                  href={buildWhatsAppUrl(
                    'Hello M Bee Enterprises (Prop. Baljinder Singh & Manpreet Singh), I would like to connect with your office in Mahilpur.',
                    PRIMARY_WHATSAPP
                  )}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-3 py-1.5 rounded-lg bg-[#C69C3A] hover:bg-[#D4AF37] text-[#081326] text-xs font-bold whitespace-nowrap"
                >
                  WhatsApp Now
                </a>
              </div>
            </div>

            {/* Email & Proprietor Card */}
            <div className="p-6 rounded-2xl bg-[#0F213C] border border-white/10 space-y-3">
              <div className="w-10 h-10 rounded-xl bg-[#C69C3A]/15 text-[#E5C158] flex items-center justify-center">
                <Mail className="w-5 h-5" />
              </div>
              <div className="text-xs font-semibold uppercase tracking-wider text-[#E5C158]">
                {t.emailLabel}
              </div>
              <div className="text-sm font-bold break-all">
                <a
                  href={`mailto:${BUSINESS_EMAIL}`}
                  className="hover:text-[#E5C158] transition-colors"
                >
                  {BUSINESS_EMAIL}
                </a>
              </div>
              <div className="pt-2 border-t border-white/10 text-xs text-slate-300">
                <div className="font-semibold text-white">{t.proprietor}</div>
                <div className="mt-0.5 text-[#E5C158]">
                  {lang === 'en' ? OFFICIAL_SHOP_ADDRESS_EN : OFFICIAL_SHOP_ADDRESS_PA}
                </div>
              </div>
            </div>

            {/* Real Storefront Photograph Card in Contact Section */}
            <div className="rounded-2xl bg-[#0F213C] border border-[#C69C3A]/35 overflow-hidden sm:col-span-2">
              <div className="grid grid-cols-1 sm:grid-cols-12 items-center">
                <div className="sm:col-span-5 h-40 sm:h-full">
                  <img
                    src={OFFICIAL_SHOP_PHOTO_URL}
                    alt="M Bee Enterprises, Bank of Baroda, near Bus Stand, near Mahilpur, Mahilpur, Punjab 146105"
                    className="w-full h-full object-cover object-top"
                  />
                </div>
                <div className="sm:col-span-7 p-4 space-y-2">
                  <div className="flex items-center gap-1.5 text-[#E5C158] text-xs font-bold uppercase tracking-wider">
                    <Clock className="w-3.5 h-3.5" />
                    <span>{t.hoursLabel}</span>
                  </div>
                  <div className="text-xs font-semibold text-white">
                    {officeConfig.weekdayHours}
                  </div>
                  <div className="text-xs text-slate-300">{officeConfig.weekendHours}</div>
                  <div className="pt-1 text-[11px] text-[#E5C158] font-medium">
                    📍 {officeConfig.addressLine}
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Right 6 Cols: Live Location & Google Maps Section */}
          <div
            data-testid="live-location-card"
            className="lg:col-span-6 rounded-2xl bg-[#0F213C] border border-[#C69C3A]/40 p-6 flex flex-col justify-between space-y-4"
          >
            <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3">
              <div className="space-y-1">
                <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-md bg-[#C69C3A]/20 border border-[#C69C3A]/40 text-[11px] font-bold uppercase tracking-wider text-[#E5C158]">
                  <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                  <span>
                    {lang === 'en'
                      ? 'M Bee Enterprises · Live Shop Location'
                      : 'ਐਮ ਬੀ ਐਂਟਰਪ੍ਰਾਈਜ਼ਿਜ਼ · ਲਾਈਵ ਦੁਕਾਨ ਲੋਕੇਸ਼ਨ'}
                  </span>
                </div>
                <div
                  data-testid="shop-exact-address"
                  className="text-sm sm:text-base font-bold text-white leading-snug pt-1"
                >
                  {officeConfig.addressLine}
                </div>
                {lang === 'pa' && (
                  <div className="text-xs text-[#E5C158]">
                    ਐਮ ਬੀ ਐਂਟਰਪ੍ਰਾਈਜ਼ਿਜ਼, ਬੈਂਕ ਆਫ ਬੜੌਦਾ ਦੇ ਨੇੜੇ, ਬੱਸ ਸਟੈਂਡ ਦੇ ਨੇੜੇ, ਮਾਹਿਲਪੁਰ, ਪੰਜਾਬ 146105
                  </div>
                )}
              </div>

              <div className="flex flex-wrap items-center gap-2 shrink-0">
                <a
                  href={`https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(
                    officeConfig.mapQuery
                  )}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  data-testid="live-directions-btn"
                  className="px-3.5 py-2 rounded-xl bg-[#C69C3A] hover:bg-[#D4AD47] text-[#081326] text-xs font-bold inline-flex items-center gap-1.5 shadow-sm transition-colors whitespace-nowrap"
                >
                  <Navigation className="w-3.5 h-3.5" />
                  <span>{lang === 'en' ? 'Get Live Directions' : 'ਲਾਈਵ ਰਸਤਾ ਦੇਖੋ'}</span>
                </a>
                <a
                  href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(
                    officeConfig.mapQuery
                  )}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-3 py-2 rounded-xl bg-white/10 hover:bg-white/15 text-xs font-semibold text-[#E5C158] inline-flex items-center gap-1 whitespace-nowrap"
                >
                  <ExternalLink className="w-3.5 h-3.5" />
                  <span>{lang === 'en' ? 'Open Map' : 'ਗੂਗਲ ਮੈਪ'}</span>
                </a>
              </div>
            </div>

            <div className="w-full h-60 rounded-xl overflow-hidden border border-[#C69C3A]/35 bg-[#081326] shadow-inner relative">
              <iframe
                title="M Bee Enterprises, Bank of Baroda, near Bus Stand, near Mahilpur, Mahilpur, Punjab 146105"
                src={`https://maps.google.com/maps?q=${encodeURIComponent(
                  officeConfig.mapQuery
                )}&t=&z=16&ie=UTF8&iwloc=&output=embed`}
                className="w-full h-full border-0"
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
              />
              {/* Branded Location Pin Overlay Badge on Live Map */}
              <div className="pointer-events-none absolute bottom-2.5 left-14 right-14 sm:right-auto px-3 py-1.5 rounded-lg bg-[#081326]/95 border border-[#C69C3A]/60 shadow-lg flex items-center gap-2 text-xs">
                <MapPin className="w-4 h-4 text-[#E5C158] shrink-0" />
                <div className="leading-tight">
                  <div className="font-bold text-white">
                    M Bee Enterprises (Prop. Baljinder Singh &amp; Manpreet Singh)
                  </div>
                  <div className="text-[10px] text-[#E5C158]">
                    Bank of Baroda, near Bus Stand, Mahilpur, Punjab 146105
                  </div>
                </div>
              </div>
            </div>

            <div className="text-xs text-slate-300 flex flex-wrap items-center justify-between gap-2 pt-1">
              <span>
                {lang === 'en'
                  ? 'Location: M Bee Enterprises, Bank of Baroda, near Bus Stand, Mahilpur (146105)'
                  : 'ਲੋਕੇਸ਼ਨ: ਐਮ ਬੀ ਐਂਟਰਪ੍ਰਾਈਜ਼ਿਜ਼, ਬੈਂਕ ਆਫ ਬੜੌਦਾ ਦੇ ਨੇੜੇ, ਬੱਸ ਸਟੈਂਡ ਦੇ ਨੇੜੇ, ਮਾਹਿਲਪੁਰ (146105)'}
              </span>
              <a
                href={buildWhatsAppUrl(
                  `Hello M Bee Enterprises, please share your live location pin for ${OFFICIAL_SHOP_ADDRESS_EN} on WhatsApp.`,
                  PRIMARY_WHATSAPP
                )}
                target="_blank"
                rel="noopener noreferrer"
                className="text-[#E5C158] hover:text-[#F3DC8B] font-semibold underline"
              >
                {lang === 'en' ? 'Request Live Pin on WhatsApp →' : 'ਵਟਸਐਪ ਲੋਕੇਸ਼ਨ ਮੰਗਵਾਓ →'}
              </a>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
