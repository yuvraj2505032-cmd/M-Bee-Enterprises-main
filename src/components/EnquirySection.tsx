import React, { useState, useEffect } from 'react';
import {
  Send,
  ShieldAlert,
  CheckCircle2,
  MessageCircle,
  PhoneCall,
  Mail,
  Clock,
} from 'lucide-react';
import {
  EnquiryFormInput,
  validateEnquiryForm,
  buildWhatsAppUrl,
  PRIMARY_WHATSAPP,
  PRIMARY_PHONE,
  UserSession,
  AdminNotificationPayload,
} from '../utils/loanCalculator';
import { Language, SERVICES_CATALOG, UI_TEXT } from '../data/translations';

export interface SavedEnquiry extends EnquiryFormInput {
  id: string;
  referenceCode: string;
  createdAt: string;
}

const STORAGE_KEY_ENQUIRIES = 'mbee_customer_enquiries_v1';

export function EnquirySection({
  lang,
  preselectedService = '',
  prefilledMessage = '',
  userSession = null,
  onAdminNotify,
}: {
  lang: Language;
  preselectedService?: string;
  prefilledMessage?: string;
  userSession?: UserSession | null;
  onAdminNotify?: (payload: AdminNotificationPayload) => void;
}) {
  const t = UI_TEXT[lang].enquirySection;

  const [form, setForm] = useState<EnquiryFormInput>({
    name: userSession?.name || '',
    mobile: userSession?.mobile || '',
    service: preselectedService || '',
    contactMethod: 'whatsapp',
    message: prefilledMessage || '',
  });

  const [errors, setErrors] = useState<Partial<Record<keyof EnquiryFormInput, string>>>({});
  const [submittedEnquiry, setSubmittedEnquiry] = useState<SavedEnquiry | null>(null);
  const [recentEnquiries, setRecentEnquiries] = useState<SavedEnquiry[]>([]);

  useEffect(() => {
    if (userSession) {
      setForm((prev) => ({
        ...prev,
        name: prev.name || userSession.name,
        mobile: prev.mobile || userSession.mobile,
      }));
    }
  }, [userSession]);

  useEffect(() => {
    if (preselectedService) {
      setForm((prev) => ({ ...prev, service: preselectedService }));
    }
  }, [preselectedService]);

  useEffect(() => {
    if (prefilledMessage) {
      setForm((prev) => ({ ...prev, message: prefilledMessage }));
    }
  }, [prefilledMessage]);

  useEffect(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY_ENQUIRIES);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed)) {
          setRecentEnquiries(parsed);
        }
      }
    } catch {
      // ignore storage errors
    }
  }, []);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const validation = validateEnquiryForm(form);
    if (!validation.valid) {
      setErrors(validation.errors);
      return;
    }

    setErrors({});
    const newRecord: SavedEnquiry = {
      ...form,
      id: Date.now().toString(),
      referenceCode: `MB-${Math.floor(1000 + Math.random() * 9000)}`,
      createdAt: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    const updated = [newRecord, ...recentEnquiries].slice(0, 5);
    setRecentEnquiries(updated);
    setSubmittedEnquiry(newRecord);

    try {
      localStorage.setItem(STORAGE_KEY_ENQUIRIES, JSON.stringify(updated));
    } catch {
      // ignore storage quota errors
    }

    if (onAdminNotify) {
      onAdminNotify({
        userName: newRecord.name,
        userMobile: newRecord.mobile,
        serviceName: newRecord.service,
        workDescription:
          newRecord.message ||
          `Customer wants assistance with ${newRecord.service}.`,
        preferredContact: newRecord.contactMethod,
        referenceCode: newRecord.referenceCode,
      });
    }
  };

  const buildEnquiryWhatsAppLink = (item: SavedEnquiry) => {
    const text = `Hello M Bee Enterprises (Prop. Baljinder Singh),\nNew Website Enquiry [${item.referenceCode}]:\n• Name: ${item.name}\n• Mobile: ${item.mobile}\n• Service Required: ${item.service}\n• Preferred Contact: ${item.contactMethod.toUpperCase()}\n• Note: ${item.message || 'Please share required document checklist.'}`;
    return buildWhatsAppUrl(text, PRIMARY_WHATSAPP);
  };

  return (
    <section
      id="enquiry-section"
      aria-labelledby="enquiry-section-heading"
      className="py-16 bg-white border-t border-slate-200"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-start">
          {/* Left Column: Guidance & Security Notice */}
          <div className="lg:col-span-5 space-y-6">
            <div>
              <div className="text-xs font-semibold uppercase tracking-wider text-[#9A7422] mb-2">
                {t.kicker}
              </div>
              <h2
                id="enquiry-section-heading"
                className="text-3xl font-bold text-[#0F213C] tracking-tight text-balance"
              >
                {t.heading}
              </h2>
              <p className="mt-3 text-slate-600 text-base leading-relaxed">{t.subheading}</p>
            </div>

            {/* Security Guardrail Callout */}
            <div className="p-4 rounded-xl bg-[#FBF6E9] border border-[#E2C87D] text-[#5C4410] text-xs leading-relaxed flex items-start gap-3">
              <ShieldAlert className="w-5 h-5 text-[#9A7422] shrink-0 mt-0.5" />
              <div>
                <div className="font-bold text-[#3D2C07] mb-0.5">
                  {lang === 'en' ? 'Customer Privacy Protection' : 'ਗਾਹਕ ਸੁਰੱਖਿਆ ਸੂਚਨਾ'}
                </div>
                <p>{t.securityNote}</p>
              </div>
            </div>

            {/* Direct Contact Card */}
            <div className="rounded-xl bg-[#0F213C] text-white p-5 space-y-3 border border-[#C69C3A]/30">
              <div className="text-xs font-semibold uppercase tracking-wider text-[#E5C158]">
                {lang === 'en' ? 'Direct Proprietor Desk' : 'ਸਿੱਧਾ ਸੰਪਰਕ ਡੈਸਕ'}
              </div>
              <div className="text-lg font-bold">Baljinder Singh — M Bee Enterprises</div>
              <div className="flex flex-wrap gap-3 pt-1">
                <a
                  href={`tel:+918288837597`}
                  className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-lg bg-white/10 hover:bg-white/15 text-xs font-semibold text-[#E5C158] transition-colors whitespace-nowrap"
                >
                  <PhoneCall className="w-3.5 h-3.5" />
                  <span>{PRIMARY_PHONE}</span>
                </a>
                <a
                  href={buildWhatsAppUrl(
                    'Hello M Bee Enterprises, I would like to enquire about your services.',
                    PRIMARY_WHATSAPP
                  )}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-lg bg-[#C69C3A] hover:bg-[#D4AF37] text-[#081326] text-xs font-bold transition-colors whitespace-nowrap"
                >
                  <MessageCircle className="w-3.5 h-3.5" />
                  <span>WhatsApp Desk</span>
                </a>
              </div>
            </div>

            {/* Recent Session Enquiries List */}
            {recentEnquiries.length > 0 && (
              <div className="rounded-xl border border-slate-200 bg-slate-50 p-4 space-y-3">
                <div className="text-xs font-bold uppercase tracking-wider text-slate-700 flex items-center gap-1.5">
                  <Clock className="w-3.5 h-3.5 text-[#0F213C]" />
                  <span>{t.recentEnquiriesTitle} ({recentEnquiries.length})</span>
                </div>
                <div className="space-y-2" data-testid="session-enquiries-list">
                  {recentEnquiries.map((item) => (
                    <div
                      key={item.id}
                      className="p-3 rounded-lg bg-white border border-slate-200 text-xs flex items-center justify-between gap-2"
                    >
                      <div>
                        <div className="font-bold text-[#0F213C]">
                          {item.service}{' '}
                          <span className="font-tabular text-[#9A7422]">({item.referenceCode})</span>
                        </div>
                        <div className="text-slate-500 mt-0.5">
                          {item.name} · {item.mobile} · {item.createdAt}
                        </div>
                      </div>
                      <a
                        href={buildEnquiryWhatsAppLink(item)}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="px-2.5 py-1.5 rounded bg-[#0F213C] hover:bg-[#173056] text-[#E5C158] font-semibold whitespace-nowrap shrink-0"
                      >
                        WhatsApp
                      </a>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Right Column: Smart Enquiry Form */}
          <div className="lg:col-span-7">
            {submittedEnquiry ? (
              <div
                data-testid="enquiry-success-card"
                className="rounded-2xl bg-[#0F213C] text-white p-8 border border-[#C69C3A]/40 shadow-xl space-y-5"
              >
                <div className="w-12 h-12 rounded-xl bg-[#C69C3A]/15 border border-[#C69C3A]/50 flex items-center justify-center text-[#E5C158]">
                  <CheckCircle2 className="w-7 h-7" />
                </div>
                <div>
                  <div className="text-xs font-tabular uppercase tracking-wider text-[#E5C158]">
                    Reference ID: {submittedEnquiry.referenceCode}
                  </div>
                  <h3 className="text-2xl font-bold mt-1">{t.successHeading}</h3>
                  <p className="text-slate-300 text-sm mt-2 leading-relaxed">{t.successBody}</p>
                </div>

                <div className="rounded-xl bg-[#081326]/70 border border-white/10 p-4 text-xs space-y-1.5 text-slate-200">
                  <div>
                    <span className="text-slate-400">Applicant Name:</span>{' '}
                    <strong className="text-white">{submittedEnquiry.name}</strong>
                  </div>
                  <div>
                    <span className="text-slate-400">Mobile Number:</span>{' '}
                    <strong className="font-tabular text-white">{submittedEnquiry.mobile}</strong>
                  </div>
                  <div>
                    <span className="text-slate-400">Selected Service:</span>{' '}
                    <strong className="text-[#E5C158]">{submittedEnquiry.service}</strong>
                  </div>
                  <div>
                    <span className="text-slate-400">Preferred Contact:</span>{' '}
                    <strong className="uppercase text-white">{submittedEnquiry.contactMethod}</strong>
                  </div>
                </div>

                <div className="flex flex-wrap items-center gap-3 pt-2">
                  <a
                    href={buildEnquiryWhatsAppLink(submittedEnquiry)}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="px-5 py-3 rounded-xl bg-[#C69C3A] hover:bg-[#D4AF37] text-[#081326] font-bold text-sm inline-flex items-center gap-2 transition-colors whitespace-nowrap"
                  >
                    <MessageCircle className="w-4 h-4" />
                    <span>{t.sendWhatsappNow}</span>
                  </a>
                  <button
                    type="button"
                    onClick={() => {
                      setSubmittedEnquiry(null);
                      setForm({
                        name: '',
                        mobile: '',
                        service: '',
                        contactMethod: 'whatsapp',
                        message: '',
                      });
                    }}
                    className="px-4 py-3 rounded-xl bg-white/10 hover:bg-white/15 text-white text-sm font-medium transition-colors whitespace-nowrap"
                  >
                    {t.newEnquiryBtn}
                  </button>
                </div>
              </div>
            ) : (
              <form
                onSubmit={handleSubmit}
                noValidate
                className="rounded-2xl bg-slate-50 border border-slate-200/90 p-6 sm:p-8 shadow-sm space-y-5"
              >
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                  {/* Full Name */}
                  <div>
                    <label
                      htmlFor="enquiry-name"
                      className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5"
                    >
                      {t.nameLabel} *
                    </label>
                    <input
                      id="enquiry-name"
                      type="text"
                      required
                      value={form.name}
                      onChange={(e) => setForm({ ...form, name: e.target.value })}
                      placeholder={t.namePlaceholder}
                      className="w-full px-3.5 py-2.5 rounded-xl bg-white border border-slate-300 text-slate-900 text-sm focus:outline-none focus:ring-2 focus:ring-[#0F213C]"
                    />
                    {errors.name && (
                      <p className="mt-1 text-xs text-red-600 font-medium" role="alert">
                        {errors.name}
                      </p>
                    )}
                  </div>

                  {/* Mobile Number */}
                  <div>
                    <label
                      htmlFor="enquiry-mobile"
                      className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5"
                    >
                      {t.mobileLabel} *
                    </label>
                    <input
                      id="enquiry-mobile"
                      type="tel"
                      required
                      value={form.mobile}
                      onChange={(e) => setForm({ ...form, mobile: e.target.value })}
                      placeholder={t.mobilePlaceholder}
                      className="w-full px-3.5 py-2.5 rounded-xl bg-white border border-slate-300 text-slate-900 text-sm font-tabular focus:outline-none focus:ring-2 focus:ring-[#0F213C]"
                    />
                    {errors.mobile && (
                      <p className="mt-1 text-xs text-red-600 font-medium" role="alert">
                        {errors.mobile}
                      </p>
                    )}
                  </div>
                </div>

                {/* Required Service Selector */}
                <div>
                  <label
                    htmlFor="enquiry-service"
                    className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5"
                  >
                    {t.serviceLabel} *
                  </label>
                  <select
                    id="enquiry-service"
                    required
                    value={form.service}
                    onChange={(e) => setForm({ ...form, service: e.target.value })}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-white border border-slate-300 text-slate-900 text-sm focus:outline-none focus:ring-2 focus:ring-[#0F213C]"
                  >
                    <option value="">{t.servicePlaceholder}</option>
                    {SERVICES_CATALOG.map((s) => (
                      <option key={s.id} value={s.title.en}>
                        {lang === 'en' ? s.title.en : `${s.title.pa} (${s.title.en})`}
                      </option>
                    ))}
                  </select>
                  {errors.service && (
                    <p className="mt-1 text-xs text-red-600 font-medium" role="alert">
                      {errors.service}
                    </p>
                  )}
                </div>

                {/* Preferred Contact Method */}
                <div>
                  <span className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">
                    {t.contactMethodLabel}
                  </span>
                  <div className="grid grid-cols-3 gap-2.5">
                    {(
                      [
                        { id: 'whatsapp', label: t.methods.whatsapp, icon: MessageCircle },
                        { id: 'call', label: t.methods.call, icon: PhoneCall },
                        { id: 'email', label: t.methods.email, icon: Mail },
                      ] as const
                    ).map((method) => {
                      const Icon = method.icon;
                      const active = form.contactMethod === method.id;
                      return (
                        <button
                          key={method.id}
                          type="button"
                          onClick={() => setForm({ ...form, contactMethod: method.id })}
                          className={`py-2.5 px-3 rounded-xl text-xs font-semibold flex items-center justify-center gap-1.5 border transition-colors whitespace-nowrap ${
                            active
                              ? 'bg-[#0F213C] text-[#E5C158] border-[#0F213C]'
                              : 'bg-white text-slate-700 border-slate-300 hover:bg-slate-100'
                          }`}
                        >
                          <Icon className="w-3.5 h-3.5 shrink-0" />
                          <span className="truncate">{method.label}</span>
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Message */}
                <div>
                  <label
                    htmlFor="enquiry-message"
                    className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5"
                  >
                    {t.messageLabel}
                  </label>
                  <textarea
                    id="enquiry-message"
                    rows={3}
                    value={form.message}
                    onChange={(e) => setForm({ ...form, message: e.target.value })}
                    placeholder={t.messagePlaceholder}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-white border border-slate-300 text-slate-900 text-sm focus:outline-none focus:ring-2 focus:ring-[#0F213C]"
                  />
                  {errors.message && (
                    <p className="mt-1 text-xs text-red-600 font-medium" role="alert">
                      {errors.message}
                    </p>
                  )}
                </div>

                <button
                  type="submit"
                  className="w-full py-3.5 px-6 rounded-xl bg-[#0F213C] hover:bg-[#173056] text-[#E5C158] font-bold text-sm flex items-center justify-center gap-2 shadow-sm transition-colors whitespace-nowrap"
                >
                  <Send className="w-4 h-4 shrink-0" />
                  <span>{t.submitBtn}</span>
                </button>
              </form>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}
