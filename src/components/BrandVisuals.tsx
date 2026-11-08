import React, { useState, useEffect } from 'react';
import {
  Phone,
  Mail,
  ShieldCheck,
  FileCheck2,
  Building2,
  Camera,
  CheckCircle2,
  Trash2,
  MapPin,
  ExternalLink,
} from 'lucide-react';
import { Language } from '../data/translations';
import { PRIMARY_PHONE, SECONDARY_PHONE, BUSINESS_EMAIL } from '../utils/loanCalculator';

export const OFFICIAL_SHOP_PHOTO_URL =
  '/assets/aistudio/WhatsApp_Image_2026-11-03_at_7.37.47_PM_558f6686.jpeg';

export const OFFICIAL_SHOP_ADDRESS_EN =
  'M Bee Enterprises, Bank of Baroda, near Bus Stand, near Mahilpur, Mahilpur, Punjab 146105';

export const OFFICIAL_SHOP_ADDRESS_PA =
  'ਐਮ ਬੀ ਐਂਟਰਪ੍ਰਾਈਜ਼ਿਜ਼ (M Bee Enterprises), ਬੈਂਕ ਆਫ ਬੜੌਦਾ ਦੇ ਨੇੜੇ, ਬੱਸ ਸਟੈਂਡ ਦੇ ਨੇੜੇ, ਮਾਹਿਲਪੁਰ, ਪੰਜਾਬ 146105';

/**
 * Signature calligraphic interlocking MB Monogram Logo faithfully crafted from
 * the M Bee Enterprises storefront signboard and glass door branding in Mahilpur.
 * Features the distinctive M whose diagonal stroke loops at the bottom and sweeps
 * into the horizontal crossbar of the B.
 */
export function MBMonogramLogo({
  size = 'md',
  showWordmark = false,
  variant = 'gold',
}: {
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl';
  showWordmark?: boolean;
  variant?: 'gold' | 'white';
}) {
  const dimensions = {
    xs: 'w-8 h-8',
    sm: 'w-9 h-9',
    md: 'w-11 h-11',
    lg: 'w-16 h-16',
    xl: 'w-24 h-24',
  }[size];

  return (
    <div className="inline-flex items-center gap-2.5 select-none">
      <div
        data-testid="mb-monogram-logo"
        className={`${dimensions} relative rounded-xl bg-gradient-to-br from-[#0B2569] via-[#0F3186] to-[#081945] p-0.5 shadow-md border border-[#C69C3A]/60 flex items-center justify-center shrink-0`}
        aria-hidden="true"
      >
        <svg
          viewBox="0 0 110 100"
          className="w-full h-full"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <defs>
            <linearGradient id="mbSignboardGold" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#FFE885" />
              <stop offset="50%" stopColor="#FACC15" />
              <stop offset="100%" stopColor="#CA8A04" />
            </linearGradient>
            <linearGradient id="mbRoyalSignboardBlue" x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stopColor="#0D348A" />
              <stop offset="100%" stopColor="#071B4B" />
            </linearGradient>
          </defs>

          {/* Royal Blue Signboard Crest Backing */}
          <rect
            x="4"
            y="4"
            width="102"
            height="92"
            rx="16"
            fill="url(#mbRoyalSignboardBlue)"
            stroke="url(#mbSignboardGold)"
            strokeWidth="3"
          />

          {/* Left vertical stem of M with top and bottom classic serifs */}
          <path
            d="M14 20 H25 V78 H14 V82 H32 V78 H25 V31 L48 67 C51 72 52 77 49 80 C46 83 41 81 41 76 C41 70 49 61 62 56"
            stroke={variant === 'white' ? '#FFFFFF' : 'url(#mbSignboardGold)'}
            strokeWidth="6.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          />

          {/* Right diagonal ascent of M into the vertical spine of B */}
          <path
            d="M37 48 L56 20 H66 V80"
            stroke={variant === 'white' ? '#FFFFFF' : 'url(#mbSignboardGold)'}
            strokeWidth="7"
            strokeLinecap="round"
            strokeLinejoin="round"
          />

          {/* Upper & Lower Bowls of B */}
          <path
            d="M58 20 H76 C86 20 92 25.5 92 33.5 C92 40.5 86.5 45.5 78 47.5 C88 49 94 55 94 64 C94 74 86 80 74 80 H56"
            stroke={variant === 'white' ? '#FFFFFF' : 'url(#mbSignboardGold)'}
            strokeWidth="7.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          />

          {/* Signature sweeping loop from M's bottom curl across the waist of B */}
          <path
            d="M44 79 C37 79 36 68 44 60 C52 51 66 47.5 81 47.5"
            stroke={variant === 'white' ? '#FFFFFF' : 'url(#mbSignboardGold)'}
            strokeWidth="6"
            strokeLinecap="round"
          />
        </svg>
      </div>
      {showWordmark && (
        <span className="text-lg font-bold tracking-tight text-white whitespace-nowrap shrink-0">
          M Bee <span className="text-[#E5C158]">Enterprises</span>
        </span>
      )}
    </div>
  );
}

interface CustomPhoto {
  id: string;
  title: string;
  dataUrl: string;
}

const STORAGE_KEY_PHOTOS = 'mbee_custom_shop_photos_v1';

/**
 * Interactive Shop Photograph & Signboard Showcase.
 * Displays the real uploaded photograph of M Bee Enterprises (Near Bank of Baroda,
 * Near Bus Stand, Mahilpur, Punjab 146105) as the primary visual, alongside the
 * interactive digital signboard, consultation desk, and service board views.
 */
export function ShopVisualShowcase({
  lang,
  compact = false,
}: {
  lang: Language;
  compact?: boolean;
}) {
  const [activeSlide, setActiveSlide] = useState<
    'photo' | 'signboard' | 'desk' | 'services' | 'custom'
  >('photo');
  const [customPhotos, setCustomPhotos] = useState<CustomPhoto[]>([]);
  const [uploadError, setUploadError] = useState<string | null>(null);

  useEffect(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY_PHOTOS);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) {
          setCustomPhotos(parsed);
        }
      }
    } catch {
      // ignore storage errors
    }
  }, []);

  const handlePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    setUploadError(null);
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 2.5 * 1024 * 1024) {
      setUploadError(
        lang === 'en'
          ? 'Please choose an image smaller than 2.5 MB.'
          : 'ਕਿਰਪਾ ਕਰਕੇ 2.5 MB ਤੋਂ ਛੋਟੀ ਫੋਟੋ ਚੁਣੋ।'
      );
      return;
    }

    const reader = new FileReader();
    reader.onload = () => {
      if (typeof reader.result === 'string') {
        const newPhoto: CustomPhoto = {
          id: Date.now().toString(),
          title: file.name.replace(/\.[^/.]+$/, ''),
          dataUrl: reader.result,
        };
        const updated = [newPhoto, ...customPhotos].slice(0, 4);
        setCustomPhotos(updated);
        setActiveSlide('custom');
        try {
          localStorage.setItem(STORAGE_KEY_PHOTOS, JSON.stringify(updated));
        } catch {
          // ignore quota error
        }
      }
    };
    reader.readAsDataURL(file);
  };

  const handleRemoveCustomPhoto = (id: string) => {
    const updated = customPhotos.filter((p) => p.id !== id);
    setCustomPhotos(updated);
    if (updated.length === 0) {
      setActiveSlide('photo');
    }
    try {
      localStorage.setItem(STORAGE_KEY_PHOTOS, JSON.stringify(updated));
    } catch {
      // ignore
    }
  };

  return (
    <div className="rounded-2xl bg-[#0A1833] border border-white/15 shadow-2xl overflow-hidden text-white">
      {/* Top switcher bar */}
      <div className="flex flex-wrap sm:flex-nowrap items-center justify-between gap-2 px-4 py-2.5 bg-[#071126] border-b border-white/10">
        <div className="flex items-center gap-1 overflow-x-auto">
          <button
            type="button"
            data-testid="showcase-tab-photo"
            onClick={() => setActiveSlide('photo')}
            className={`px-2.5 py-1.5 rounded-lg text-xs font-medium transition-colors whitespace-nowrap shrink-0 ${
              activeSlide === 'photo'
                ? 'bg-[#C69C3A] text-slate-950 font-semibold'
                : 'text-slate-300 hover:text-white hover:bg-white/5'
            }`}
          >
            {lang === 'en' ? 'Actual Shop Photo' : 'ਦੁਕਾਨ ਦੀ ਅਸਲ ਫੋਟੋ'}
          </button>
          <button
            type="button"
            data-testid="showcase-tab-signboard"
            onClick={() => setActiveSlide('signboard')}
            className={`px-2.5 py-1.5 rounded-lg text-xs font-medium transition-colors whitespace-nowrap shrink-0 ${
              activeSlide === 'signboard'
                ? 'bg-[#C69C3A] text-slate-950 font-semibold'
                : 'text-slate-300 hover:text-white hover:bg-white/5'
            }`}
          >
            {lang === 'en' ? 'Shop Signboard' : 'ਦਫ਼ਤਰ ਦਾ ਸਾਈਨਬੋਰਡ'}
          </button>
          <button
            type="button"
            onClick={() => setActiveSlide('desk')}
            className={`px-2.5 py-1.5 rounded-lg text-xs font-medium transition-colors whitespace-nowrap shrink-0 ${
              activeSlide === 'desk'
                ? 'bg-[#C69C3A] text-slate-950 font-semibold'
                : 'text-slate-300 hover:text-white hover:bg-white/5'
            }`}
          >
            {lang === 'en' ? 'Consultation Desk' : 'ਸਲਾਹਕਾਰ ਕਾਊਂਟਰ'}
          </button>
          <button
            type="button"
            onClick={() => setActiveSlide('services')}
            className={`px-2.5 py-1.5 rounded-lg text-xs font-medium transition-colors whitespace-nowrap shrink-0 ${
              activeSlide === 'services'
                ? 'bg-[#C69C3A] text-slate-950 font-semibold'
                : 'text-slate-300 hover:text-white hover:bg-white/5'
            }`}
          >
            {lang === 'en' ? 'Service Board' : 'ਸੇਵਾਵਾਂ ਦਾ ਬੋਰਡ'}
          </button>
          {customPhotos.length > 0 && (
            <button
              type="button"
              onClick={() => setActiveSlide('custom')}
              className={`px-2.5 py-1.5 rounded-lg text-xs font-medium transition-colors whitespace-nowrap shrink-0 ${
                activeSlide === 'custom'
                  ? 'bg-[#C69C3A] text-slate-950 font-semibold'
                  : 'text-slate-300 hover:text-white hover:bg-white/5'
              }`}
            >
              {lang === 'en'
                ? `Uploaded (${customPhotos.length})`
                : `ਫੋਟੋਆਂ (${customPhotos.length})`}
            </button>
          )}
        </div>

        <label className="inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-white/10 hover:bg-white/15 text-[#E5C158] text-xs font-medium cursor-pointer transition-colors whitespace-nowrap shrink-0">
          <Camera className="w-3.5 h-3.5" />
          <span>{lang === 'en' ? 'Add Photo' : 'ਫੋਟੋ ਜੋੜੋ'}</span>
          <input
            type="file"
            accept="image/*"
            onChange={handlePhotoUpload}
            className="sr-only"
            aria-label={lang === 'en' ? 'Upload shop photograph' : 'ਦੁਕਾਨ ਦੀ ਫੋਟੋ ਅਪਲੋਡ ਕਰੋ'}
          />
        </label>
      </div>

      {uploadError && (
        <div className="px-4 py-2 bg-red-900/60 text-red-200 text-xs border-b border-red-400/30">
          {uploadError}
        </div>
      )}

      {/* Visual Canvas */}
      <div className="p-4 sm:p-5 bg-gradient-to-br from-[#0D1F40] via-[#102752] to-[#08152E] relative">
        {/* 1. ACTUAL UPLOADED SHOP PHOTOGRAPH */}
        {activeSlide === 'photo' && (
          <div className="rounded-xl border border-[#C69C3A]/55 bg-[#071229] overflow-hidden shadow-xl">
            <div className="relative">
              <img
                src={OFFICIAL_SHOP_PHOTO_URL}
                alt="M Bee Enterprises Storefront - Bank of Baroda, near Bus Stand, near Mahilpur, Mahilpur, Punjab 146105"
                data-testid="official-shop-photo-img"
                className="w-full h-64 sm:h-80 object-cover object-top"
              />
              <div className="absolute top-3 left-3 px-3 py-1 rounded-lg bg-[#081326]/90 backdrop-blur-xs border border-[#C69C3A]/50 text-[11px] font-bold text-[#E5C158] flex items-center gap-1.5 shadow-md">
                <MapPin className="w-3.5 h-3.5 text-[#E5C158]" />
                <span>M Bee Enterprises · Mahilpur, Punjab 146105</span>
              </div>
            </div>

            <div className="p-3.5 bg-[#081326] border-t border-white/10 flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs">
              <div className="space-y-0.5">
                <div className="font-bold text-white flex items-center gap-1.5">
                  <span>M Bee Enterprises (Prop. Baljinder Singh &amp; Manpreet Singh)</span>
                </div>
                <div className="text-slate-300 flex items-start gap-1.5">
                  <MapPin className="w-3.5 h-3.5 text-[#E5C158] shrink-0 mt-0.5" />
                  <span>
                    {lang === 'en' ? OFFICIAL_SHOP_ADDRESS_EN : OFFICIAL_SHOP_ADDRESS_PA}
                  </span>
                </div>
              </div>
              <a
                href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(
                  OFFICIAL_SHOP_ADDRESS_EN
                )}`}
                target="_blank"
                rel="noopener noreferrer"
                className="px-3 py-1.5 rounded-lg bg-[#C69C3A] hover:bg-[#D4AD47] text-[#081326] font-bold text-xs inline-flex items-center gap-1.5 whitespace-nowrap shrink-0 self-start sm:self-center"
              >
                <ExternalLink className="w-3.5 h-3.5" />
                <span>{lang === 'en' ? 'Live Map' : 'ਲਾਈਵ ਲੋਕੇਸ਼ਨ'}</span>
              </a>
            </div>
          </div>
        )}

        {/* 2. DIGITAL SIGNBOARD REPLICA */}
        {activeSlide === 'signboard' && (
          <div className="rounded-xl border border-[#C69C3A]/55 bg-gradient-to-b from-[#0D348A] via-[#0A276B] to-[#071B4B] p-5 sm:p-6 shadow-inner relative overflow-hidden">
            {/* Top proprietor & phone header strip */}
            <div className="flex flex-wrap items-center justify-between gap-2 pb-3 mb-4 border-b border-white/15 text-xs sm:text-sm">
              <div className="font-semibold text-[#E5C158]">
                Prop. Baljinder Singh &amp; Manpreet Singh
              </div>
              <div className="flex items-center gap-3 font-tabular text-white font-semibold">
                <span className="inline-flex items-center gap-1">
                  <Phone className="w-3.5 h-3.5 text-[#E5C158]" />
                  {PRIMARY_PHONE}
                </span>
                <span>,</span>
                <span>{SECONDARY_PHONE}</span>
              </div>
            </div>

            {/* Center Brand Lockup matching the Royal Blue & White/Gold Signboard */}
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4 py-3 text-center sm:text-left">
              <MBMonogramLogo size="xl" variant="white" />
              <div>
                <div className="text-2xl sm:text-3xl lg:text-4xl font-serif-display italic font-bold tracking-wide text-white drop-shadow">
                  M Bee <span className="text-[#E5C158]">Enterprises</span>
                </div>
                <div className="text-xs sm:text-sm font-bold text-white uppercase tracking-wider mt-1.5">
                  INSURANCE ★ AADHAR CARD ★ PAN CARD ★ DRIVING LICENCE ★ PASSPORT ★ BIRTH CERTIFICATE ★ PHOTO STAT
                </div>
                <div className="text-xs text-[#E5C158] mt-1">
                  ਵਿੱਤੀ ਸਲਾਹਕਾਰ · ਬੀਮਾ ਸੇਵਾਵਾਂ · ਦਸਤਾਵੇਜ਼ ਅਤੇ ਪ੍ਰਾਪਰਟੀ ਸਲਾਹਕਾਰ
                </div>
              </div>
            </div>

            {/* Bottom location & email strip */}
            <div className="mt-4 pt-2.5 bg-[#071229] text-slate-200 border border-[#C69C3A]/35 rounded-lg px-3.5 py-2 flex flex-wrap items-center justify-between gap-2 text-xs font-medium">
              <span className="inline-flex items-center gap-1.5 text-[#E5C158]">
                <Mail className="w-3.5 h-3.5" />
                {BUSINESS_EMAIL}
              </span>
              <span className="text-slate-200">{OFFICIAL_SHOP_ADDRESS_EN}</span>
            </div>
          </div>
        )}

        {activeSlide === 'desk' && (
          <div className="rounded-xl border border-white/15 bg-[#081633] p-5 sm:p-6">
            <div className="grid grid-cols-1 md:grid-cols-12 gap-5 items-center">
              <div className="md:col-span-7 space-y-3">
                <div className="text-xs font-semibold text-[#E5C158] uppercase tracking-wider">
                  {lang === 'en' ? 'Inside M Bee Enterprises' : 'ਐਮ ਬੀ ਐਂਟਰਪ੍ਰਾਈਜ਼ਿਜ਼ ਦਫ਼ਤਰ'}
                </div>
                <h3 className="text-xl font-bold text-white">
                  {lang === 'en'
                    ? 'Dedicated Consultation & Citizen Service Counter'
                    : 'ਵਿਸ਼ੇਸ਼ ਸਲਾਹਕਾਰ ਅਤੇ ਨਾਗਰਿਕ ਸੇਵਾ ਕਾਊਂਟਰ'}
                </h3>
                <p className="text-sm text-slate-300 leading-relaxed">
                  {lang === 'en'
                    ? 'Located near Bank of Baroda, near Bus Stand, Mahilpur (Punjab 146105), our office is equipped with high-speed document scanners, instant passport photo printing, photostat machines, and a dedicated consultation desk led by Baljinder Singh & Manpreet Singh.'
                    : 'ਬੈਂਕ ਆਫ ਬੜੌਦਾ ਦੇ ਨੇੜੇ, ਬੱਸ ਸਟੈਂਡ ਦੇ ਨੇੜੇ, ਮਾਹਿਲਪੁਰ (ਪੰਜਾਬ 146105) ਵਿਖੇ ਸਥਿਤ ਸਾਡੇ ਦਫ਼ਤਰ ਵਿੱਚ ਹਾਈ-ਸਪੀਡ ਸਕੈਨਰ, ਤੁਰੰਤ ਪਾਸਪੋਰਟ ਫੋਟੋ ਪ੍ਰਿੰਟਰ, ਫੋਟੋਸਟੇਟ ਅਤੇ ਬਲਜਿੰਦਰ ਸਿੰਘ ਅਤੇ ਮਨਪ੍ਰੀਤ ਸਿੰਘ ਦਾ ਵਿਸ਼ੇਸ਼ ਸਲਾਹਕਾਰ ਡੈਸਕ ਮੌਜੂਦ ਹੈ।'}
                </p>
                <div className="grid grid-cols-2 gap-3 pt-2 text-xs text-slate-200">
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-[#E5C158] shrink-0" />
                    <span>High-Speed Photostat &amp; Print</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-[#E5C158] shrink-0" />
                    <span>Instant Passport Photos</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-[#E5C158] shrink-0" />
                    <span>Private Loan &amp; Property Desk</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-[#E5C158] shrink-0" />
                    <span>Punjabi &amp; English Typing</span>
                  </div>
                </div>
              </div>
              <div className="md:col-span-5">
                <svg
                  viewBox="0 0 360 250"
                  className="w-full h-auto rounded-lg border border-[#C69C3A]/30 bg-[#0D224E]"
                  role="img"
                  aria-label="M Bee Enterprises Office Consultation Desk"
                >
                  <rect x="20" y="20" width="320" height="130" rx="8" fill="#163573" stroke="#C69C3A" strokeOpacity="0.4" />
                  <line x1="130" y1="20" x2="130" y2="150" stroke="#93C5FD" strokeOpacity="0.25" strokeWidth="2" />
                  <line x1="240" y1="20" x2="240" y2="150" stroke="#93C5FD" strokeOpacity="0.25" strokeWidth="2" />
                  <rect x="142" y="36" width="86" height="36" rx="5" fill="#09193A" stroke="#C69C3A" strokeWidth="1.5" />
                  <text x="185" y="53" textAnchor="middle" fill="#E5C158" fontSize="9" fontWeight="bold">M BEE</text>
                  <text x="185" y="65" textAnchor="middle" fill="#FFFFFF" fontSize="6.5">ENTERPRISES</text>
                  <rect x="65" y="102" width="58" height="38" rx="4" fill="#0F172A" stroke="#CBD5E1" strokeWidth="1.5" />
                  <rect x="88" y="140" width="12" height="12" fill="#94A3B8" />
                  <rect x="248" y="112" width="56" height="38" rx="4" fill="#E2E8F0" />
                  <rect x="256" y="122" width="40" height="8" fill="#1E3A8A" />
                  <rect x="15" y="150" width="330" height="16" rx="3" fill="#92400E" />
                  <rect x="28" y="166" width="304" height="68" fill="#78350F" />
                  <rect x="95" y="178" width="170" height="40" rx="4" fill="#0B1E47" stroke="#C69C3A" strokeWidth="1" />
                  <text x="180" y="196" textAnchor="middle" fill="#E5C158" fontSize="7.5" fontWeight="bold">BALJINDER &amp; MANPREET SINGH</text>
                  <text x="180" y="209" textAnchor="middle" fill="#E2E8F0" fontSize="7">MAHILPUR, PUNJAB</text>
                </svg>
              </div>
            </div>
          </div>
        )}

        {activeSlide === 'services' && (
          <div className="rounded-xl border border-[#C69C3A]/40 bg-[#0A1D45] p-5">
            <div className="flex items-center justify-between border-b border-white/10 pb-3 mb-4">
              <div>
                <h3 className="text-base font-bold text-[#E5C158]">
                  M BEE ENTERPRISES — COMPLETE SERVICE DIRECTORY BOARD
                </h3>
                <p className="text-xs text-slate-300">
                  As displayed on our Mahilpur shopfront service panels (ਸਾਡੀਆਂ ਸੇਵਾਵਾਂ)
                </p>
              </div>
              <MBMonogramLogo size="sm" />
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
              <div className="bg-[#071430] p-3.5 rounded-lg border border-white/10 space-y-1.5">
                <div className="font-bold text-[#E5C158] flex items-center gap-1.5">
                  <FileCheck2 className="w-4 h-4" />
                  DOCUMENTATION &amp; CITIZEN
                </div>
                <ul className="space-y-1 text-slate-200">
                  <li>• Aadhaar Card &amp; PAN Card Assistance</li>
                  <li>• Passport &amp; Driving Licence Desk</li>
                  <li>• Birth &amp; Death Certificate Assistance</li>
                  <li>• Instant Photo, Photostat &amp; Print</li>
                </ul>
              </div>
              <div className="bg-[#071430] p-3.5 rounded-lg border border-white/10 space-y-1.5">
                <div className="font-bold text-[#E5C158] flex items-center gap-1.5">
                  <ShieldCheck className="w-4 h-4" />
                  LOANS &amp; INSURANCE
                </div>
                <ul className="space-y-1 text-slate-200">
                  <li>• Personal &amp; Home Loan Consultancy</li>
                  <li>• Car Loan &amp; Business Loan Files</li>
                  <li>• Motor, Health &amp; Life Insurance</li>
                  <li>• All Bank Loan &amp; Pension Assistance</li>
                </ul>
              </div>
              <div className="bg-[#071430] p-3.5 rounded-lg border border-white/10 space-y-1.5">
                <div className="font-bold text-[#E5C158] flex items-center gap-1.5">
                  <Building2 className="w-4 h-4" />
                  PROPERTY &amp; DIGITAL INDIA
                </div>
                <ul className="space-y-1 text-slate-200">
                  <li>• Property Advisor &amp; Consultancy</li>
                  <li>• Caste / Residence / Income Certificates</li>
                  <li>• GST Registration &amp; Employment Forms</li>
                  <li>• Punjabi / English Typing &amp; Online Schemes</li>
                </ul>
              </div>
            </div>
          </div>
        )}

        {activeSlide === 'custom' && customPhotos.length > 0 && (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {customPhotos.map((photo) => (
              <div
                key={photo.id}
                className="relative rounded-xl overflow-hidden border border-[#C69C3A]/40 bg-slate-950 group"
              >
                <img
                  src={photo.dataUrl}
                  alt={photo.title || 'M Bee Enterprises Shop Photograph'}
                  referrerPolicy="no-referrer"
                  className="w-full h-52 object-cover"
                />
                <div className="px-3 py-2 bg-slate-950/90 flex items-center justify-between text-xs">
                  <span className="font-medium text-[#E5C158] truncate">{photo.title}</span>
                  <button
                    type="button"
                    onClick={() => handleRemoveCustomPhoto(photo.id)}
                    className="text-red-300 hover:text-red-200 inline-flex items-center gap-1"
                    aria-label={`Remove ${photo.title}`}
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                    <span>Remove</span>
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}

        {!compact && (
          <div className="mt-3.5 flex flex-wrap items-center justify-between gap-2 text-xs text-slate-300">
            <span>
              {lang === 'en'
                ? 'Location: M Bee Enterprises, Bank of Baroda, near Bus Stand, near Mahilpur, Mahilpur, Punjab 146105'
                : 'ਪਤਾ: ਐਮ ਬੀ ਐਂਟਰਪ੍ਰਾਈਜ਼ਿਜ਼ (M Bee Enterprises), ਬੈਂਕ ਆਫ ਬੜੌਦਾ ਦੇ ਨੇੜੇ, ਬੱਸ ਸਟੈਂਡ ਦੇ ਨੇੜੇ, ਮਾਹਿਲਪੁਰ, ਪੰਜਾਬ 146105'}
            </span>
            <span className="text-[#E5C158] font-medium">
              Prop. Baljinder Singh &amp; Manpreet Singh · {PRIMARY_PHONE} / {SECONDARY_PHONE}
            </span>
          </div>
        )}
      </div>
    </div>
  );
}
