import React from 'react';
import { motion } from 'motion/react';
import {
  Fingerprint,
  CreditCard,
  Car,
  Globe,
  FileCheck2,
  Printer,
  Briefcase,
  UserCheck,
  Home,
  CarFront,
  Building2,
  ShieldCheck,
  Compass,
  Building,
  FileSpreadsheet,
  MonitorCheck,
  Landmark,
  FileText,
  Users,
  MessageCircle,
  ArrowUpRight,
  X,
  CheckCircle2,
  AlertTriangle,
} from 'lucide-react';
import { Language, ServiceItem, UI_TEXT, CATEGORY_LABELS } from '../data/translations';
import { buildWhatsAppUrl, PRIMARY_WHATSAPP } from '../utils/loanCalculator';

const ICON_MAP: Record<string, React.ComponentType<{ className?: string }>> = {
  Fingerprint,
  CreditCard,
  Car,
  Globe,
  FileCheck2,
  Printer,
  Briefcase,
  UserCheck,
  Home,
  CarFront,
  Building2,
  ShieldCheck,
  Compass,
  Building,
  FileSpreadsheet,
  MonitorCheck,
  Landmark,
  FileText,
  Users,
};

const serviceCardVariants = {
  hidden: {
    opacity: 0,
    y: 22,
    scale: 0.97,
  },
  visible: (staggerIndex: number) => ({
    opacity: 1,
    y: 0,
    scale: 1,
    transition: {
      duration: 0.42,
      delay: Math.min(staggerIndex * 0.055, 0.55),
      ease: [0.22, 1, 0.36, 1] as [number, number, number, number],
    },
  }),
};

export const ServiceCard: React.FC<{
  service: ServiceItem;
  lang: Language;
  indexNumber: number;
  onLearnMore: (service: ServiceItem) => void;
  onSelectWork?: (service: ServiceItem) => void;
}> = ({
  service,
  lang,
  indexNumber,
  onLearnMore,
  onSelectWork,
}) => {
  const [justSelected, setJustSelected] = React.useState(false);
  const IconComponent = ICON_MAP[service.iconName] || FileText;
  const t = UI_TEXT[lang].servicesSection;

  const whatsappText = `Hello M Bee Enterprises (Prop. Baljinder Singh & Manpreet Singh), I would like to enquire about ${service.title.en} (${service.title.pa}). Please share the required documents and process.`;

  const handleWorkClick = () => {
    setJustSelected(true);
    setTimeout(() => setJustSelected(false), 2400);
    if (onSelectWork) {
      onSelectWork(service);
    } else {
      onLearnMore(service);
    }
  };

  return (
    <motion.article
      layout
      custom={Math.max(0, indexNumber - 1)}
      variants={serviceCardVariants}
      initial="hidden"
      animate="visible"
      exit={{ opacity: 0, y: 10, scale: 0.96, transition: { duration: 0.18 } }}
      whileHover={{ y: -4, transition: { duration: 0.2 } }}
      data-testid={`service-card-${service.id}`}
      className={`group rounded-2xl bg-white border p-6 flex flex-col justify-between transition-shadow duration-200 shadow-xs hover:shadow-lg ${
        service.badge === 'popular'
          ? 'border-[#C69C3A]/50 hover:border-[#0F213C]'
          : service.badge === 'new'
          ? 'border-slate-300 hover:border-[#0F213C]'
          : 'border-slate-200/90 hover:border-slate-400'
      }`}
    >
      <div>
        <div className="flex items-center justify-between gap-2 mb-4">
          <div className="w-11 h-11 rounded-xl bg-[#0F213C] text-[#E5C158] flex items-center justify-center shrink-0 border border-[#C69C3A]/30">
            <IconComponent className="w-5 h-5" />
          </div>
          <div className="flex items-center gap-2 flex-wrap justify-end">
            {service.badge === 'popular' && (
              <span
                data-testid={`badge-popular-${service.id}`}
                className="px-2.5 py-0.5 rounded-md bg-[#FBF6E9] text-[#8A6615] border border-[#C69C3A]/40 text-[11px] font-bold uppercase tracking-wider whitespace-nowrap shrink-0"
              >
                {lang === 'en' ? 'Popular' : 'ਪ੍ਰਸਿੱਧ (Popular)'}
              </span>
            )}
            {service.badge === 'new' && (
              <span
                data-testid={`badge-new-${service.id}`}
                className="px-2.5 py-0.5 rounded-md bg-slate-100 text-[#0F213C] border border-slate-300 text-[11px] font-bold uppercase tracking-wider whitespace-nowrap shrink-0"
              >
                {lang === 'en' ? 'New' : 'ਨਵੀਂ ਸੇਵਾ (New)'}
              </span>
            )}
            <span className="text-xs text-slate-500 font-tabular">
              {String(indexNumber).padStart(2, '0')} ·{' '}
              {lang === 'en'
                ? CATEGORY_LABELS[service.categoryId].en
                : CATEGORY_LABELS[service.categoryId].pa}
            </span>
          </div>
        </div>

        <button
          type="button"
          onClick={handleWorkClick}
          className="text-left w-full"
        >
          <h3 className="text-lg font-bold text-slate-900 group-hover:text-[#0F213C] transition-colors">
            {service.title[lang]}
          </h3>
        </button>

        <p className="mt-2 text-sm text-slate-600 leading-relaxed">{service.shortDesc[lang]}</p>
      </div>

      <div className="mt-6 pt-4 border-t border-slate-100 space-y-2.5">
        <button
          type="button"
          data-testid={`select-service-work-${service.id}`}
          onClick={handleWorkClick}
          className={`w-full py-2.5 px-3.5 rounded-xl font-bold text-xs flex items-center justify-center gap-1.5 transition-all ${
            justSelected
              ? 'bg-[#E5C158] text-[#081326] shadow-xs'
              : 'bg-[#0F213C] hover:bg-[#173056] text-[#E5C158]'
          }`}
        >
          <CheckCircle2 className="w-4 h-4 shrink-0" />
          <span>
            {justSelected
              ? lang === 'en'
                ? 'Service Selected ✓'
                : 'ਸੇਵਾ ਚੁਣੀ ਗਈ ✓'
              : lang === 'en'
              ? 'Click to Request This Service'
              : 'ਇਹ ਕੰਮ ਕਰਵਾਉਣ ਲਈ ਇੱਥੇ ਕਲਿੱਕ ਕਰੋ'}
          </span>
        </button>

        <div className="flex flex-wrap items-center justify-between gap-2">
          <button
            type="button"
            onClick={() => onLearnMore(service)}
            className="inline-flex items-center gap-1 text-xs font-semibold text-slate-700 hover:text-[#0F213C] py-1.5 px-2.5 rounded-lg bg-slate-100 hover:bg-slate-200/70 transition-colors whitespace-nowrap shrink-0"
          >
            <span>{t.learnMore}</span>
            <ArrowUpRight className="w-3.5 h-3.5" />
          </button>

          <a
            href={buildWhatsAppUrl(whatsappText, PRIMARY_WHATSAPP)}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#0F213C] bg-[#FBF6E9] hover:bg-[#F5E8C7] border border-[#C69C3A]/40 py-1.5 px-3 rounded-lg transition-colors whitespace-nowrap shrink-0"
          >
            <MessageCircle className="w-3.5 h-3.5 text-[#8A6615]" />
            <span>{t.whatsappEnquire}</span>
          </a>
        </div>
      </div>
    </motion.article>
  );
};

export function ServiceDetailModal({
  service,
  lang,
  onClose,
  onSelectForEnquiry,
}: {
  service: ServiceItem | null;
  lang: Language;
  onClose: () => void;
  onSelectForEnquiry: (serviceName: string) => void;
}) {
  if (!service) return null;

  const IconComponent = ICON_MAP[service.iconName] || FileText;
  const whatsappText = `Hello M Bee Enterprises (Prop. Baljinder Singh & Manpreet Singh), I reviewed the document checklist for ${service.title.en} on your website and would like to proceed.`;

  return (
    <div
      className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-xs flex items-center justify-center p-4"
      role="dialog"
      aria-modal="true"
      aria-labelledby="modal-service-title"
    >
      <div className="bg-white rounded-2xl max-w-xl w-full border border-slate-200 shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-150">
        {/* Modal Header */}
        <div className="bg-[#0F213C] text-white px-6 py-5 flex items-start justify-between gap-4 border-b border-[#C69C3A]/30">
          <div className="flex items-center gap-3.5">
            <div className="w-11 h-11 rounded-xl bg-[#C69C3A] text-slate-950 flex items-center justify-center shrink-0">
              <IconComponent className="w-6 h-6" />
            </div>
            <div>
              <div className="text-xs text-[#E5C158] font-medium">
                {CATEGORY_LABELS[service.categoryId][lang]}
              </div>
              <h3 id="modal-service-title" className="text-xl font-bold text-white">
                {service.title[lang]}
              </h3>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close service details modal"
            className="p-1.5 rounded-lg text-slate-300 hover:text-white hover:bg-white/10 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 space-y-5 max-h-[75vh] overflow-y-auto">
          <p className="text-sm text-slate-700 leading-relaxed">{service.detailedDesc[lang]}</p>

          <div className="rounded-xl bg-slate-50 border border-slate-200 p-4 space-y-2.5">
            <h4 className="text-xs font-bold uppercase tracking-wider text-[#0F213C]">
              {lang === 'en'
                ? 'Typical Documents to Carry for Preparation'
                : 'ਤਿਆਰੀ ਲਈ ਨਾਲ ਲਿਆਉਣ ਵਾਲੇ ਆਮ ਦਸਤਾਵੇਜ਼'}
            </h4>
            <ul className="space-y-2">
              {service.preparationList[lang].map((item, idx) => (
                <li key={idx} className="flex items-start gap-2 text-sm text-slate-700">
                  <CheckCircle2 className="w-4 h-4 text-[#0F213C] shrink-0 mt-0.5" />
                  <span>{item}</span>
                </li>
              ))}
            </ul>
          </div>

          <div className="rounded-xl bg-slate-50 border border-slate-200 p-3.5 flex items-start gap-2.5 text-xs text-slate-700">
            <AlertTriangle className="w-4 h-4 text-[#9A741C] shrink-0 mt-0.5" />
            <div>
              <span className="font-semibold text-slate-900">{service.turnaroundNote[lang]}</span>
              <p className="mt-1 text-slate-600">{UI_TEXT[lang].authorityNotice}</p>
            </div>
          </div>
        </div>

        {/* Modal Footer */}
        <div className="px-6 py-4 bg-slate-50 border-t border-slate-200 flex flex-wrap items-center justify-end gap-3">
          <button
            type="button"
            onClick={() => {
              onSelectForEnquiry(service.title.en);
              onClose();
            }}
            className="px-4 py-2.5 rounded-xl bg-white border border-slate-300 hover:bg-slate-100 text-slate-800 text-xs font-bold transition-colors whitespace-nowrap"
          >
            {lang === 'en' ? 'Send Work Request to Admin' : 'ਐਡਮਿਨ ਨੂੰ ਕੰਮ ਭੇਜੋ'}
          </button>
          <a
            href={buildWhatsAppUrl(whatsappText, PRIMARY_WHATSAPP)}
            target="_blank"
            rel="noopener noreferrer"
            className="px-4 py-2.5 rounded-xl bg-[#0F213C] hover:bg-[#183159] text-white text-xs font-bold inline-flex items-center gap-1.5 transition-colors whitespace-nowrap"
          >
            <MessageCircle className="w-4 h-4 text-[#E5C158]" />
            <span>{UI_TEXT[lang].servicesSection.whatsappEnquire}</span>
          </a>
        </div>
      </div>
    </div>
  );
}
