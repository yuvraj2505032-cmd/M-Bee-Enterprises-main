import React, { useState, useEffect } from 'react';
import {
  LogIn,
  LogOut,
  UserPlus,
  UserCheck,
  User,
  MessageCircle,
  Send,
  X,
  BellRing,
  Smartphone,
  MapPin,
  Mail,
  Briefcase,
  Lock,
  Clock,
  ShieldCheck,
  PlusCircle,
  Trash2,
  Eye,
  EyeOff,
  Sparkles,
  PhoneCall,
  Megaphone,
  CheckCircle2,
  FileCheck2,
  FileText,
} from 'lucide-react';
import { Language, ServiceCategoryId, ServiceItem } from '../data/translations';
import {
  UserSession,
  DocumentStatus,
  SubmittedDocumentItem,
  AdminNotificationPayload,
  validateUserSignIn,
  buildAdminNotificationLinks,
  getUserInitials,
  getUserFirstLetter,
  createOrUpdateUserProfile,
  buildGoogleUserProfile,
  getDefaultSubmittedDocuments,
  createSubmittedDocumentItem,
  updateSubmittedDocumentStatus,
  PRIMARY_PHONE,
  SECONDARY_PHONE,
  verifyAdminPassword,
  buildWhatsAppUrl,
} from '../utils/loanCalculator';
import {
  auth,
  googleProvider,
  signInWithPopup,
  fetchUserProfileFromFirestore,
  saveUserProfileToFirestore,
} from '../firebase';
import {
  syncUserProfileAcrossClouds,
  syncDocumentsListWithBackend,
  syncDocumentStatusWithBackend,
  fetchProfilesFromBackend,
  fetchEnquiriesFromBackend,
  BackendEnquiryRecord,
} from '../utils/cloudIntegrations';

const STORAGE_KEY_SAVED_PROFILES = 'mbee_saved_profiles_v1';
export const STORAGE_KEY_CUSTOM_SERVICES = 'mbee_custom_services_v1';
export const STORAGE_KEY_ADMIN_ANNOUNCEMENT = 'mbee_admin_announcement_v1';

export function loadSavedProfiles(): Record<string, UserSession> {
  try {
    const raw = localStorage.getItem(STORAGE_KEY_SAVED_PROFILES);
    if (raw) {
      return JSON.parse(raw);
    }
  } catch {
    // ignore storage errors
  }
  return {};
}

export function saveProfileToRegistry(profile: UserSession) {
  try {
    const cleanPhone = (profile.mobile || '').replace(/[\s\-+]/g, '').slice(-10);
    const key = cleanPhone || profile.uid || profile.email || profile.memberId;
    if (!key) return;
    const all = loadSavedProfiles();
    all[key] = profile;
    localStorage.setItem(STORAGE_KEY_SAVED_PROFILES, JSON.stringify(all));
  } catch {
    // ignore storage errors
  }
}

export function loadCustomServices(): ServiceItem[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY_CUSTOM_SERVICES);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed)) {
        return parsed;
      }
    }
  } catch {
    // ignore
  }
  return [];
}

export function GoogleLogoSvg({ className = 'w-5 h-5' }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" aria-hidden="true">
      <path
        fill="#4285F4"
        d="M23.49 12.27c0-.79-.07-1.54-.19-2.27H12v4.51h6.47c-.29 1.48-1.14 2.73-2.4 3.58v3h3.86c2.26-2.09 3.56-5.17 3.56-8.82z"
      />
      <path
        fill="#34A853"
        d="M12 24c3.24 0 5.95-1.08 7.93-2.91l-3.86-3c-1.08.72-2.45 1.16-4.07 1.16-3.13 0-5.78-2.11-6.73-4.96H1.29v3.09C3.26 21.3 7.31 24 12 24z"
      />
      <path
        fill="#FBBC05"
        d="M5.27 14.29c-.25-.72-.38-1.49-.38-2.29s.14-1.57.38-2.29V6.62H1.29C.47 8.24 0 10.06 0 12s.47 3.76 1.29 5.38l3.98-3.09z"
      />
      <path
        fill="#EA4335"
        d="M12 4.75c1.77 0 3.35.61 4.6 1.8l3.42-3.42C17.95 1.19 15.24 0 12 0 7.31 0 3.26 2.7 1.29 6.62l3.98 3.09c.95-2.85 3.6-4.96 6.73-4.96z"
      />
    </svg>
  );
}

export function AnimatedCheckIcon({ className = 'w-4 h-4' }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={2.75}
      strokeLinecap="round"
      strokeLinejoin="round"
      className={`${className} animate-check-pop`}
      data-testid="animated-checkmark-svg"
      aria-hidden="true"
    >
      <circle cx="12" cy="12" r="9" className="opacity-25" strokeWidth={2} />
      <path d="M8 12.5l2.8 2.8L16.5 9.5" className="animate-check-stroke" />
    </svg>
  );
}

/**
 * Customer Sign In & Create Profile Modal (Linked with Google Sign-In & Standard Website Profile Creation).
 * Allows 1-click "Continue with Google" via Firebase Authentication or standard Name/Email/Mobile profile creation.
 */
export function UserSignInModal({
  isOpen,
  initialMode = 'signin',
  lang,
  onClose,
  onSignInSuccess,
}: {
  isOpen: boolean;
  initialMode?: 'signin' | 'register';
  lang: Language;
  onClose: () => void;
  onSignInSuccess: (
    session: UserSession,
    initialWorkRequest?: AdminNotificationPayload
  ) => void;
}) {
  const [mode, setMode] = useState<'signin' | 'register'>(initialMode);
  const [name, setName] = useState('');
  const [mobile, setMobile] = useState('');
  const [pin, setPin] = useState('');
  const [city, setCity] = useState('');
  const [email, setEmail] = useState('');
  const [occupation, setOccupation] = useState('Salaried / Job');
  const [googleLoading, setGoogleLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (isOpen) {
      setMode(initialMode);
      setError('');
      setGoogleLoading(false);
    }
  }, [isOpen, initialMode]);

  // Auto-fill known profile name/city if user enters a mobile number that was previously registered
  const handleMobileChange = (val: string) => {
    setMobile(val);
    const clean = val.replace(/[\s\-+]/g, '').slice(-10);
    if (clean.length === 10) {
      const saved = loadSavedProfiles()[clean];
      if (saved) {
        if (!name) setName(saved.name);
        if (!city && saved.city) setCity(saved.city);
        if (!email && saved.email) setEmail(saved.email);
      }
    }
  };

  if (!isOpen) return null;

  const handleGoogleSignIn = async () => {
    setError('');
    setGoogleLoading(true);
    try {
      const result = await signInWithPopup(auth, googleProvider);
      const googleUser = result.user;

      // Check Firestore or local registry for any existing saved profile
      const firestoreProfile = await fetchUserProfileFromFirestore(googleUser.uid);
      const cleanMobile = mobile.replace(/[\s\-+]/g, '').slice(-10);
      const localProfile =
        (cleanMobile ? loadSavedProfiles()[cleanMobile] : null) ||
        loadSavedProfiles()[googleUser.uid] ||
        null;

      const mergedExisting = firestoreProfile || localProfile;

      const googleSession = buildGoogleUserProfile(googleUser, mergedExisting, {
        mobile: mobile || mergedExisting?.mobile || googleUser.phoneNumber || '',
        city: city || mergedExisting?.city || 'Mahilpur, Punjab',
        occupation: occupation || mergedExisting?.occupation || 'Citizen / Family',
      });

      await saveUserProfileToFirestore(googleSession);
      saveProfileToRegistry(googleSession);
      setGoogleLoading(false);
      onSignInSuccess(googleSession);
      onClose();
    } catch (err: unknown) {
      setGoogleLoading(false);
      const errMsg = err instanceof Error ? err.message : String(err);
      if (
        errMsg.includes('popup-closed-by-user') ||
        errMsg.includes('cancelled-popup-request')
      ) {
        setError(
          lang === 'en'
            ? 'Google Sign-In popup was closed before completing. Click "Continue with Google" to try again, or fill in your details below.'
            : 'ਗੂਗਲ ਸਾਈਨ-ਇਨ ਵਿੰਡੋ ਬੰਦ ਹੋ ਗਈ ਸੀ। ਦੁਬਾਰਾ "Continue with Google" ਤੇ ਕਲਿੱਕ ਕਰੋ ਜਾਂ ਹੇਠਾਂ ਵੇਰਵੇ ਭਰੋ।'
        );
      } else {
        setError(
          lang === 'en'
            ? 'Could not open Google popup in this browser view. You can also enter your Google Email & Name below to create your profile immediately.'
            : 'ਗੂਗਲ ਪੌਪਅੱਪ ਖੁੱਲ੍ਹ ਨਹੀਂ ਸਕਿਆ। ਤੁਸੀਂ ਹੇਠਾਂ ਆਪਣਾ ਨਾਮ ਅਤੇ ਜੀਮੇਲ (Gmail) ਭਰ ਕੇ ਵੀ ਤੁਰੰਤ ਪ੍ਰੋਫਾਈਲ ਬਣਾ ਸਕਦੇ ਹੋ।'
        );
      }
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const check = validateUserSignIn(name, mobile);
    if (!check.valid) {
      setError(
        lang === 'en'
          ? check.error || 'Invalid details'
          : 'ਕਿਰਪਾ ਕਰਕੇ ਆਪਣਾ ਸਹੀ ਨਾਮ ਅਤੇ 10-ਅੰਕਾਂ ਦਾ ਮੋਬਾਈਲ ਨੰਬਰ ਭਰੋ।'
      );
      return;
    }

    setError('');
    const cleanPhone = mobile.replace(/[\s\-+]/g, '').slice(-10);
    const existingProfile = loadSavedProfiles()[cleanPhone] || null;
    const nowTime = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    const isGoogleEmail = email.trim().toLowerCase().endsWith('@gmail.com');

    const newSession = createOrUpdateUserProfile(
      {
        uid: auth.currentUser?.uid || existingProfile?.uid,
        name,
        mobile,
        city: city || existingProfile?.city || 'Mahilpur, Punjab',
        email: email || auth.currentUser?.email || existingProfile?.email || '',
        photoURL: auth.currentUser?.photoURL || existingProfile?.photoURL || '',
        authProvider:
          auth.currentUser || isGoogleEmail
            ? 'google'
            : existingProfile?.authProvider || 'mobile',
        occupation: occupation || existingProfile?.occupation || 'Salaried / Job',
        pin: pin || existingProfile?.pin || '',
        signedInAt: nowTime,
        workHistory: existingProfile?.workHistory || [],
      },
      existingProfile
    );

    if (auth.currentUser?.uid) {
      await saveUserProfileToFirestore(newSession);
    }
    saveProfileToRegistry(newSession);
    onSignInSuccess(newSession);
    onClose();
  };

  return (
    <div
      className="fixed inset-0 z-50 bg-[#081326]/75 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto"
      role="dialog"
      aria-modal="true"
      aria-labelledby="signin-modal-title"
    >
      <div className="bg-white rounded-2xl max-w-md w-full border border-slate-200 shadow-2xl overflow-hidden my-auto">
        {/* Header */}
        <div className="bg-[#0F213C] text-white px-6 py-4 flex items-center justify-between border-b border-[#C69C3A]/30">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-lg bg-[#C69C3A] text-[#081326] flex items-center justify-center shrink-0">
              {mode === 'signin' ? (
                <LogIn className="w-5 h-5" />
              ) : (
                <UserPlus className="w-5 h-5" />
              )}
            </div>
            <div>
              <h3 id="signin-modal-title" className="text-base sm:text-lg font-bold text-white">
                {mode === 'signin'
                  ? lang === 'en'
                    ? 'Sign In / Create Profile'
                    : 'ਸਾਈਨ-ਇਨ / ਪ੍ਰੋਫਾਈਲ ਬਣਾਓ'
                  : lang === 'en'
                  ? 'Create Customer Profile'
                  : 'ਆਪਣੀ ਗਾਹਕ ਪ੍ਰੋਫਾਈਲ ਬਣਾਓ'}
              </h3>
              <p className="text-xs text-[#E5C158]">
                {lang === 'en'
                  ? 'Linked with Google · Instant Profile Setup'
                  : 'ਗੂਗਲ (Google) ਨਾਲ ਲਿੰਕਡ · ਆਪਣੀ ਪ੍ਰੋਫਾਈਲ ਬਣਾਓ'}
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close sign in modal"
            className="p-1.5 rounded-lg text-slate-300 hover:text-white hover:bg-white/10"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Mode Switcher Tabs: Sign In & Create Profile inside the same modal */}
        <div className="grid grid-cols-2 bg-slate-100 p-1.5 border-b border-slate-200">
          <button
            type="button"
            data-testid="tab-mode-signin"
            onClick={() => {
              setMode('signin');
              setError('');
            }}
            className={`py-2 px-3 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 transition-all ${
              mode === 'signin'
                ? 'bg-[#0F213C] text-[#E5C158] shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <LogIn className="w-3.5 h-3.5" />
            <span>{lang === 'en' ? 'Sign In' : 'ਸਾਈਨ ਇਨ'}</span>
          </button>
          <button
            type="button"
            data-testid="tab-mode-register"
            onClick={() => {
              setMode('register');
              setError('');
            }}
            className={`py-2 px-3 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 transition-all ${
              mode === 'register'
                ? 'bg-[#0F213C] text-[#E5C158] shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <UserPlus className="w-3.5 h-3.5" />
            <span>{lang === 'en' ? 'Create Profile' : 'ਪ੍ਰੋਫਾਈਲ ਬਣਾਓ'}</span>
          </button>
        </div>

        <div className="px-6 pt-5 pb-2 space-y-3">
          {/* 1-Click Google Account Sign-In & Profile Creation */}
          <button
            type="button"
            onClick={handleGoogleSignIn}
            disabled={googleLoading}
            data-testid="google-signin-btn"
            className="w-full py-3 px-4 rounded-xl bg-white hover:bg-slate-50 text-slate-900 border-2 border-slate-300 hover:border-[#0F213C] font-bold text-sm flex items-center justify-center gap-3 shadow-xs transition-all disabled:opacity-60"
          >
            <GoogleLogoSvg className="w-5 h-5 shrink-0" />
            <span>
              {googleLoading
                ? lang === 'en'
                  ? 'Connecting with Google...'
                  : 'ਗੂਗਲ ਨਾਲ ਜੁੜ ਰਿਹਾ ਹੈ...'
                : mode === 'signin'
                ? lang === 'en'
                  ? 'Continue with Google (Sign In / Profile)'
                  : 'ਗੂਗਲ (Google) ਨਾਲ ਸਾਈਨ-ਇਨ ਕਰੋ'
                : lang === 'en'
                ? 'Sign Up with Google (Instant Profile)'
                : 'ਗੂਗਲ (Google) ਨਾਲ ਆਪਣੀ ਪ੍ਰੋਫਾਈਲ ਬਣਾਓ'}
            </span>
          </button>

          <p className="text-[11px] text-center text-slate-500">
            {lang === 'en'
              ? 'Creates your verified M Bee Enterprises profile automatically using your Google name, email & photo.'
              : 'ਤੁਹਾਡੇ ਗੂਗਲ ਅਕਾਊਂਟ (ਨਾਮ, ਈਮੇਲ ਅਤੇ ਫੋਟੋ) ਨਾਲ ਆਪਣੇ-ਆਪ ਤੁਹਾਡੀ ਪ੍ਰੋਫਾਈਲ ਬਣ ਜਾਵੇਗੀ।'}
          </p>

          {/* Divider */}
          <div className="relative flex py-1 items-center">
            <div className="flex-grow border-t border-slate-200" />
            <span className="shrink-0 mx-3 text-[11px] font-bold uppercase tracking-wider text-slate-400">
              {lang === 'en' ? 'OR USE MOBILE & EMAIL' : 'ਜਾਂ ਮੋਬਾਈਲ ਅਤੇ ਵੇਰਵੇ ਭਰੋ'}
            </span>
            <div className="flex-grow border-t border-slate-200" />
          </div>
        </div>

        <form onSubmit={handleSubmit} noValidate className="px-6 pb-6 pt-2 space-y-3.5">
          {/* Mobile Number & Full Name */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
            <div>
              <label
                htmlFor="signin-name"
                className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1"
              >
                {lang === 'en' ? 'Full Name *' : 'ਤੁਹਾਡਾ ਪੂਰਾ ਨਾਮ *'}
              </label>
              <input
                id="signin-name"
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder={lang === 'en' ? 'e.g., Mandeep Singh' : 'ਉਦਾਹਰਨ: ਮਨਦੀਪ ਸਿੰਘ'}
                className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-300 text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#0F213C]"
              />
            </div>

            <div>
              <label
                htmlFor="signin-mobile"
                className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1"
              >
                {lang === 'en' ? 'Mobile Number *' : 'ਮੋਬਾਈਲ ਨੰਬਰ *'}
              </label>
              <input
                id="signin-mobile"
                type="tel"
                required
                value={mobile}
                onChange={(e) => handleMobileChange(e.target.value)}
                placeholder="9876543210"
                className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-300 text-sm font-tabular text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#0F213C]"
              />
            </div>
          </div>

          {/* Google Email Address field (Available in both Sign In and Create Profile) */}
          <div>
            <label
              htmlFor="signin-email"
              className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1"
            >
              {lang === 'en'
                ? 'Google Email (Gmail) for Profile (Optional)'
                : 'ਗੂਗਲ ਈਮੇਲ / Gmail (ਵਿਕਲਪਿਕ)'}
            </label>
            <div className="relative">
              <Mail className="w-3.5 h-3.5 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                id="signin-email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="yourname@gmail.com"
                className="w-full pl-9 pr-3 py-2 rounded-xl bg-slate-50 border border-slate-300 text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#0F213C]"
              />
            </div>
          </div>

          {/* Extra Profile Fields shown in Create Profile mode */}
          {mode === 'register' && (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 pt-1">
              <div>
                <label
                  htmlFor="profile-city"
                  className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1"
                >
                  {lang === 'en' ? 'City / Village (Punjab)' : 'ਸ਼ਹਿਰ / ਪਿੰਡ'}
                </label>
                <input
                  id="profile-city"
                  type="text"
                  value={city}
                  onChange={(e) => setCity(e.target.value)}
                  placeholder={lang === 'en' ? 'e.g., Mahilpur, Punjab' : 'ਉਦਾਹਰਨ: ਮਾਹਿਲਪੁਰ, ਪੰਜਾਬ'}
                  className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-300 text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#0F213C]"
                />
              </div>

              <div>
                <label
                  htmlFor="profile-occupation"
                  className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1"
                >
                  {lang === 'en' ? 'Profile Category' : 'ਕਿੱਤਾ / ਸ਼੍ਰੇਣੀ'}
                </label>
                <select
                  id="profile-occupation"
                  value={occupation}
                  onChange={(e) => setOccupation(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-300 text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#0F213C]"
                >
                  <option value="Salaried / Job">Salaried / Job</option>
                  <option value="Business / Self-Employed">Business / Self-Employed</option>
                  <option value="Agriculture / Farmer">Agriculture / Farmer</option>
                  <option value="Student / Abroad Applicant">Student / Abroad Applicant</option>
                  <option value="Citizen / Family">Citizen / Family</option>
                </select>
              </div>
            </div>
          )}

          {/* Optional PIN / Password field */}
          <div>
            <label
              htmlFor="signin-pin"
              className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1"
            >
              {lang === 'en'
                ? '4-Digit Security PIN / Password (Optional)'
                : '4-ਅੰਕਾਂ ਦਾ ਪਿੰਨ ਜਾਂ ਪਾਸਵਰਡ (ਵਿਕਲਪਿਕ)'}
            </label>
            <div className="relative">
              <Lock className="w-3.5 h-3.5 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                id="signin-pin"
                type="password"
                maxLength={12}
                value={pin}
                onChange={(e) => setPin(e.target.value)}
                placeholder={lang === 'en' ? '•••• (Optional quick PIN)' : '•••• (ਵਿਕਲਪਿਕ ਪਿੰਨ)'}
                className="w-full pl-9 pr-3 py-2 rounded-xl bg-slate-50 border border-slate-300 text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#0F213C]"
              />
            </div>
          </div>

          {/* Instruction Box: Explore & Click Any Service */}
          <div className="p-3 rounded-xl bg-[#FBF6E9] border border-[#C69C3A]/40 text-xs text-[#0F213C] leading-relaxed">
            <strong className="block font-bold mb-0.5">
              {lang === 'en'
                ? 'How it works after Sign In:'
                : 'ਸਾਈਨ-ਇਨ ਤੋਂ ਬਾਅਦ ਕੰਮ ਕਿਵੇਂ ਚੁਣੋ:'}
            </strong>
            {lang === 'en'
              ? 'Sign in with Google or create your profile below, then explore the website and click directly on any service card you want done to notify Admin (82888-37597).'
              : 'ਗੂਗਲ ਨਾਲ ਸਾਈਨ-ਇਨ ਜਾਂ ਪ੍ਰੋਫਾਈਲ ਬਣਾਉਣ ਤੋਂ ਬਾਅਦ ਵੈੱਬਸਾਈਟ ਨੂੰ ਐਕਸਪਲੋਰ ਕਰੋ ਅਤੇ ਜਿਹੜਾ ਵੀ ਕੰਮ ਕਰਵਾਉਣਾ ਹੈ ਉਸ ਸੇਵਾ ਤੇ ਸਿੱਧਾ ਕਲਿੱਕ ਕਰੋ!'}
          </div>

          {error && (
            <p className="text-xs text-red-600 font-medium" role="alert">
              {error}
            </p>
          )}

          <button
            type="submit"
            data-testid="signin-submit-btn"
            className="w-full py-3 px-5 rounded-xl bg-[#0F213C] hover:bg-[#173056] text-[#E5C158] font-bold text-sm flex items-center justify-center gap-2 shadow-sm transition-colors"
          >
            {mode === 'signin' ? (
              <LogIn className="w-4 h-4 shrink-0" />
            ) : (
              <UserPlus className="w-4 h-4 shrink-0" />
            )}
            <span>
              {mode === 'signin'
                ? lang === 'en'
                  ? 'Sign In & Explore Website'
                  : 'ਸਾਈਨ-ਇਨ ਕਰੋ ਅਤੇ ਵੈੱਬਸਾਈਟ ਦੇਖੋ'
                : lang === 'en'
                ? 'Create Profile & Explore Website'
                : 'ਪ੍ਰੋਫਾਈਲ ਬਣਾਓ ਅਤੇ ਵੈੱਬਸਾਈਟ ਦੇਖੋ'}
            </span>
          </button>

          <div className="text-center pt-1">
            {mode === 'signin' ? (
              <button
                type="button"
                onClick={() => setMode('register')}
                className="text-xs font-bold text-[#0F213C] hover:underline"
              >
                {lang === 'en'
                  ? 'New customer? Click here to Create Full Profile →'
                  : 'ਨਵੇਂ ਗਾਹਕ ਹੋ? ਇੱਥੇ ਕਲਿੱਕ ਕਰਕੇ ਆਪਣੀ ਪ੍ਰੋਫਾਈਲ ਬਣਾਓ →'}
              </button>
            ) : (
              <button
                type="button"
                onClick={() => setMode('signin')}
                className="text-xs font-bold text-[#0F213C] hover:underline"
              >
                {lang === 'en'
                  ? 'Already have a profile? Switch to Sign In →'
                  : 'ਪਹਿਲਾਂ ਤੋਂ ਪ੍ਰੋਫਾਈਲ ਹੈ? ਸਾਈਨ-ਇਨ ਕਰੋ →'}
              </button>
            )}
          </div>
        </form>
      </div>
    </div>
  );
}

export function UserProfileModal({
  isOpen,
  userSession,
  lang,
  onClose,
  onUpdateProfile,
  onDispatchWork,
  onSignOut,
}: {
  isOpen: boolean;
  userSession: UserSession | null;
  lang: Language;
  onClose: () => void;
  onUpdateProfile: (updated: UserSession) => void;
  onDispatchWork: (payload: AdminNotificationPayload) => void;
  onSignOut: () => void;
}) {
  const [activeTab, setActiveTab] = useState<'details' | 'history'>('details');
  const [name, setName] = useState('');
  const [mobile, setMobile] = useState('');
  const [city, setCity] = useState('');
  const [email, setEmail] = useState('');
  const [occupation, setOccupation] = useState('Salaried / Job');
  const [profileSaved, setProfileSaved] = useState(false);
  const [linkingGoogle, setLinkingGoogle] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (userSession && isOpen) {
      setName(userSession.name || '');
      setMobile(userSession.mobile || '');
      setCity(userSession.city || 'Mahilpur, Punjab');
      setEmail(userSession.email || '');
      setOccupation(userSession.occupation || 'Salaried / Job');
      setProfileSaved(false);
      setLinkingGoogle(false);
      setError('');
    }
  }, [userSession, isOpen]);

  if (!isOpen || !userSession) return null;

  const initials = getUserInitials(name || userSession.name);
  const workHistory = userSession.workHistory || [];
  const isGoogleLinked =
    userSession.authProvider === 'google' ||
    Boolean(userSession.uid) ||
    Boolean(userSession.email && userSession.email.toLowerCase().endsWith('@gmail.com'));

  const handleLinkGoogleAccount = async () => {
    setError('');
    setLinkingGoogle(true);
    try {
      const result = await signInWithPopup(auth, googleProvider);
      const googleUser = result.user;
      const linkedProfile = buildGoogleUserProfile(googleUser, userSession, {
        mobile: mobile || userSession.mobile,
        city: city || userSession.city,
        occupation: occupation || userSession.occupation,
      });
      await saveUserProfileToFirestore(linkedProfile);
      saveProfileToRegistry(linkedProfile);
      onUpdateProfile(linkedProfile);
      setName(linkedProfile.name);
      setEmail(linkedProfile.email || '');
      setLinkingGoogle(false);
      setProfileSaved(true);
      setTimeout(() => setProfileSaved(false), 2500);
    } catch {
      setLinkingGoogle(false);
      setError(
        lang === 'en'
          ? 'Could not link Google via popup right now. You can also enter your Gmail address in the Email field below and click Save Profile.'
          : 'ਗੂਗਲ ਪੌਪਅੱਪ ਖੁੱਲ੍ਹ ਨਹੀਂ ਸਕਿਆ। ਤੁਸੀਂ ਹੇਠਾਂ ਆਪਣੀ Gmail ਭਰ ਕੇ ਵੀ ਪ੍ਰੋਫਾਈਲ ਸੇਵ ਕਰ ਸਕਦੇ ਹੋ।'
      );
    }
  };

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    const check = validateUserSignIn(name, mobile, isGoogleLinked);
    if (!check.valid) {
      setError(
        lang === 'en'
          ? check.error || 'Please enter valid name and mobile number.'
          : 'ਕਿਰਪਾ ਕਰਕੇ ਸਹੀ ਨਾਮ ਅਤੇ ਮੋਬਾਈਲ ਨੰਬਰ ਭਰੋ।'
      );
      return;
    }

    setError('');
    const updated = createOrUpdateUserProfile(
      {
        uid: userSession.uid || auth.currentUser?.uid,
        name,
        mobile,
        city,
        email,
        photoURL: userSession.photoURL || auth.currentUser?.photoURL || '',
        authProvider:
          isGoogleLinked || email.toLowerCase().endsWith('@gmail.com')
            ? 'google'
            : userSession.authProvider || 'mobile',
        occupation,
      },
      userSession
    );
    if (updated.uid || auth.currentUser?.uid) {
      await saveUserProfileToFirestore(updated);
    }
    saveProfileToRegistry(updated);
    onUpdateProfile(updated);
    setProfileSaved(true);
    setTimeout(() => setProfileSaved(false), 2500);
  };

  const handleSendProfileToAdmin = () => {
    onDispatchWork({
      userName: name || userSession.name,
      userMobile: mobile || userSession.mobile || 'Google Verified Client',
      userCity: city || userSession.city,
      userEmail: email || userSession.email,
      memberId: userSession.memberId,
      serviceName: 'Client Profile Verification',
      workDescription:
        lang === 'en'
          ? `Customer shared their verified profile (${occupation}${
              email ? ` · ${email}` : ''
            }) with Admin.`
          : `ਗਾਹਕ ਨੇ ਆਪਣੀ ਪ੍ਰੋਫਾਈਲ (${occupation}) ਐਡਮਿਨ ਨਾਲ ਸਾਂਝੀ ਕੀਤੀ ਹੈ।`,
      referenceCode: `PRF-${Math.floor(1000 + Math.random() * 9000)}`,
    });
  };

  return (
    <div
      className="fixed inset-0 z-50 bg-[#081326]/75 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto"
      role="dialog"
      aria-modal="true"
      aria-labelledby="user-profile-modal-title"
      data-testid="user-profile-modal"
    >
      <div className="bg-white rounded-2xl max-w-xl w-full border border-slate-200 shadow-2xl overflow-hidden my-auto">
        {/* Executive Customer Profile Banner */}
        <div className="bg-gradient-to-r from-[#081326] via-[#0F213C] to-[#152C50] text-white p-6 border-b border-[#C69C3A]/35">
          <div className="flex items-start justify-between gap-4">
            <div className="flex items-center gap-4">
              {userSession.photoURL ? (
                <img
                  src={userSession.photoURL}
                  alt={userSession.name}
                  referrerPolicy="no-referrer"
                  data-testid="profile-avatar-photo"
                  className="w-14 h-14 rounded-2xl object-cover shadow-md border-2 border-[#E5C158] shrink-0"
                />
              ) : (
                <div
                  data-testid="profile-avatar-initials"
                  className="w-14 h-14 rounded-2xl bg-[#C69C3A] text-[#081326] font-bold text-xl flex items-center justify-center shadow-md border-2 border-[#E5C158] shrink-0"
                >
                  {initials}
                </div>
              )}
              <div>
                <div className="flex flex-wrap items-center gap-2">
                  <h3 id="user-profile-modal-title" className="text-xl font-bold text-white">
                    {userSession.name}
                  </h3>
                  <span className="px-2 py-0.5 rounded-md bg-white/10 border border-[#C69C3A]/40 text-[#E5C158] font-tabular text-[11px] font-bold">
                    {userSession.memberId || 'MBE-CLIENT'}
                  </span>
                </div>
                <p className="text-xs text-slate-300 font-tabular mt-0.5">
                  {userSession.mobile ? `+91 ${userSession.mobile}` : 'Add WhatsApp mobile below'}{' '}
                  · {userSession.city || 'Mahilpur, Punjab'}
                </p>
                {userSession.email && (
                  <p className="text-xs text-[#E5C158] mt-0.5">{userSession.email}</p>
                )}

                <div className="mt-2 flex flex-wrap items-center gap-2">
                  {isGoogleLinked ? (
                    <span
                      data-testid="google-linked-badge"
                      className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-white text-slate-900 text-[11px] font-bold shadow-xs"
                    >
                      <GoogleLogoSvg className="w-3.5 h-3.5" />
                      <span>
                        {lang === 'en' ? 'Google Account Linked' : 'ਗੂਗਲ ਅਕਾਊਂਟ ਲਿੰਕਡ'}
                      </span>
                      <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                    </span>
                  ) : (
                    <button
                      type="button"
                      onClick={handleLinkGoogleAccount}
                      disabled={linkingGoogle}
                      data-testid="profile-link-google-btn"
                      className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-white hover:bg-slate-100 text-slate-900 text-[11px] font-bold shadow-xs transition-colors"
                    >
                      <GoogleLogoSvg className="w-3.5 h-3.5" />
                      <span>
                        {linkingGoogle
                          ? lang === 'en'
                            ? 'Linking Google...'
                            : 'ਗੂਗਲ ਜੁੜ ਰਿਹਾ ਹੈ...'
                          : lang === 'en'
                          ? 'Link with Google Account'
                          : 'ਗੂਗਲ ਅਕਾਊਂਟ ਨਾਲ ਲਿੰਕ ਕਰੋ'}
                      </span>
                    </button>
                  )}
                </div>
              </div>
            </div>

            <button
              type="button"
              onClick={onClose}
              aria-label="Close profile modal"
              className="p-1.5 rounded-lg text-slate-300 hover:text-white hover:bg-white/10"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Profile Navigation Tabs */}
          <div className="mt-5 flex items-center gap-2 pt-4 border-t border-white/10">
            <button
              type="button"
              data-testid="profile-tab-details"
              onClick={() => setActiveTab('details')}
              className={`px-3.5 py-1.5 rounded-lg text-xs font-bold flex items-center gap-1.5 transition-colors ${
                activeTab === 'details'
                  ? 'bg-[#C69C3A] text-[#081326]'
                  : 'bg-white/8 text-slate-300 hover:text-white hover:bg-white/15'
              }`}
            >
              <User className="w-3.5 h-3.5" />
              <span>{lang === 'en' ? 'Profile Details' : 'ਪ੍ਰੋਫਾਈਲ ਵੇਰਵਾ'}</span>
            </button>
            <button
              type="button"
              data-testid="profile-tab-history"
              onClick={() => setActiveTab('history')}
              className={`px-3.5 py-1.5 rounded-lg text-xs font-bold flex items-center gap-1.5 transition-colors ${
                activeTab === 'history'
                  ? 'bg-[#C69C3A] text-[#081326]'
                  : 'bg-white/8 text-slate-300 hover:text-white hover:bg-white/15'
              }`}
            >
              <Clock className="w-3.5 h-3.5" />
              <span>
                {lang === 'en'
                  ? `Clicked Services / Work (${workHistory.length})`
                  : `ਚੁਣੇ ਗਏ ਕੰਮ (${workHistory.length})`}
              </span>
            </button>
          </div>
        </div>

        {/* Tab 1: Edit Profile Details */}
        {activeTab === 'details' ? (
          <form onSubmit={handleSaveProfile} noValidate className="p-6 space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label
                  htmlFor="edit-profile-name"
                  className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1"
                >
                  {lang === 'en' ? 'Full Name *' : 'ਪੂਰਾ ਨਾਮ *'}
                </label>
                <input
                  id="edit-profile-name"
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full px-3.5 py-2 rounded-xl bg-slate-50 border border-slate-300 text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#0F213C]"
                />
              </div>

              <div>
                <label
                  htmlFor="edit-profile-mobile"
                  className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1"
                >
                  {lang === 'en'
                    ? isGoogleLinked
                      ? 'WhatsApp Mobile Number'
                      : 'Mobile Number *'
                    : 'ਮੋਬਾਈਲ ਨੰਬਰ'}
                </label>
                <input
                  id="edit-profile-mobile"
                  type="tel"
                  value={mobile}
                  onChange={(e) => setMobile(e.target.value)}
                  placeholder="9876543210"
                  className="w-full px-3.5 py-2 rounded-xl bg-slate-50 border border-slate-300 text-sm font-tabular text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#0F213C]"
                />
              </div>

              <div>
                <label
                  htmlFor="edit-profile-city"
                  className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1"
                >
                  <MapPin className="w-3 h-3 inline mr-1 text-[#9A7422]" />
                  {lang === 'en' ? 'City / Village in Punjab' : 'ਸ਼ਹਿਰ / ਪਿੰਡ (ਪੰਜਾਬ)'}
                </label>
                <input
                  id="edit-profile-city"
                  type="text"
                  value={city}
                  onChange={(e) => setCity(e.target.value)}
                  placeholder="e.g., Mahilpur, Punjab"
                  className="w-full px-3.5 py-2 rounded-xl bg-slate-50 border border-slate-300 text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#0F213C]"
                />
              </div>

              <div>
                <label
                  htmlFor="edit-profile-email"
                  className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1"
                >
                  <Mail className="w-3 h-3 inline mr-1 text-[#9A7422]" />
                  {lang === 'en' ? 'Google Email Address' : 'ਗੂਗਲ ਈਮੇਲ (Gmail)'}
                </label>
                <input
                  id="edit-profile-email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="yourname@gmail.com"
                  className="w-full px-3.5 py-2 rounded-xl bg-slate-50 border border-slate-300 text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#0F213C]"
                />
              </div>

              <div className="sm:col-span-2">
                <label
                  htmlFor="edit-profile-occupation"
                  className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1"
                >
                  <Briefcase className="w-3 h-3 inline mr-1 text-[#9A7422]" />
                  {lang === 'en' ? 'Occupation / Category' : 'ਕਿੱਤਾ / ਸ਼੍ਰੇਣੀ'}
                </label>
                <select
                  id="edit-profile-occupation"
                  value={occupation}
                  onChange={(e) => setOccupation(e.target.value)}
                  className="w-full px-3.5 py-2 rounded-xl bg-slate-50 border border-slate-300 text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#0F213C]"
                >
                  <option value="Salaried / Job">Salaried / Job</option>
                  <option value="Business / Self-Employed">Business / Self-Employed</option>
                  <option value="Agriculture / Farmer">Agriculture / Farmer</option>
                  <option value="Student / Abroad Applicant">Student / Abroad Applicant</option>
                  <option value="Citizen / Family">Citizen / Family</option>
                </select>
              </div>
            </div>

            {error && (
              <p className="text-xs text-red-600 font-medium" role="alert">
                {error}
              </p>
            )}

            <div className="pt-2 flex flex-wrap items-center justify-between gap-3 border-t border-slate-200">
              <div className="flex flex-wrap items-center gap-2.5">
                <button
                  type="submit"
                  data-testid="save-profile-btn"
                  className="px-4 py-2.5 rounded-xl bg-[#0F213C] hover:bg-[#173056] text-[#E5C158] font-bold text-xs inline-flex items-center gap-2 transition-all shadow-xs"
                >
                  {profileSaved ? (
                    <>
                      <AnimatedCheckIcon className="w-4 h-4 text-[#E5C158]" />
                      <span>{lang === 'en' ? 'Profile Saved' : 'ਪ੍ਰੋਫਾਈਲ ਸੇਵ ਹੋ ਗਈ'}</span>
                    </>
                  ) : (
                    <>
                      <UserCheck className="w-4 h-4" />
                      <span>{lang === 'en' ? 'Save Profile Changes' : 'ਪ੍ਰੋਫਾਈਲ ਸੇਵ ਕਰੋ'}</span>
                    </>
                  )}
                </button>

                <button
                  type="button"
                  onClick={handleSendProfileToAdmin}
                  data-testid="send-profile-admin-btn"
                  className="px-4 py-2.5 rounded-xl bg-[#C69C3A] hover:bg-[#D4AD47] text-[#081326] font-bold text-xs inline-flex items-center gap-1.5 transition-colors"
                >
                  <Send className="w-3.5 h-3.5" />
                  <span>
                    {lang === 'en' ? 'Send Profile to Admin WhatsApp' : 'ਐਡਮਿਨ ਨੂੰ ਪ੍ਰੋਫਾਈਲ ਭੇਜੋ'}
                  </span>
                </button>
              </div>

              <button
                type="button"
                onClick={() => {
                  onSignOut();
                  onClose();
                }}
                className="px-3 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold inline-flex items-center gap-1.5"
              >
                <LogOut className="w-3.5 h-3.5" />
                <span>{lang === 'en' ? 'Sign Out' : 'ਸਾਈਨ ਆਊਟ'}</span>
              </button>
            </div>
          </form>
        ) : (
          /* Tab 2: User's Clicked Work Requests History */
          <div className="p-6 space-y-4">
            {workHistory.length === 0 ? (
              <div className="p-6 rounded-xl bg-slate-50 border border-slate-200 text-center space-y-2">
                <div className="text-sm font-bold text-[#0F213C]">
                  {lang === 'en'
                    ? 'No Services Clicked Yet'
                    : 'ਹਾਲੇ ਤੱਕ ਕੋਈ ਸੇਵਾ ਨਹੀਂ ਚੁਣੀ ਗਈ'}
                </div>
                <p className="text-xs text-slate-600">
                  {lang === 'en'
                    ? 'Explore the website and click on any service card to send your work request directly to Admin (Baljinder Singh & Manpreet Singh).'
                    : 'ਵੈੱਬਸਾਈਟ ਤੇ ਜਾ ਕੇ ਜਿਸ ਵੀ ਸੇਵਾ ਦਾ ਕੰਮ ਕਰਵਾਉਣਾ ਹੈ ਉਸ ਤੇ ਕਲਿੱਕ ਕਰੋ।'}
                </p>
              </div>
            ) : (
              <div className="space-y-2.5 max-h-72 overflow-y-auto pr-1">
                {workHistory.map((item) => (
                  <div
                    key={item.id}
                    className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 flex items-center justify-between gap-3"
                  >
                    <div className="space-y-0.5">
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-bold text-[#0F213C]">
                          {item.serviceName}
                        </span>
                        <span className="px-2 py-0.5 rounded bg-[#FBF6E9] border border-[#E2C87D] text-[#8A6619] font-tabular text-[10px] font-bold">
                          {item.referenceCode}
                        </span>
                      </div>
                      <p className="text-xs text-slate-600 line-clamp-2">{item.workDescription}</p>
                      <div className="text-[11px] text-slate-400 font-tabular">
                        {lang === 'en' ? 'Logged at' : 'ਸਮਾਂ:'} {item.createdAt}
                      </div>
                    </div>

                    <button
                      type="button"
                      onClick={() =>
                        onDispatchWork({
                          userName: userSession.name,
                          userMobile: userSession.mobile || 'Google Verified Client',
                          userCity: userSession.city,
                          userEmail: userSession.email,
                          memberId: userSession.memberId,
                          serviceName: item.serviceName,
                          workDescription: item.workDescription,
                          referenceCode: item.referenceCode,
                        })
                      }
                      className="px-3 py-1.5 rounded-lg bg-[#0F213C] hover:bg-[#173056] text-[#E5C158] text-xs font-bold whitespace-nowrap shrink-0 inline-flex items-center gap-1.5"
                    >
                      <MessageCircle className="w-3.5 h-3.5" />
                      <span>{lang === 'en' ? 'WhatsApp Admin' : 'ਵਟਸਐਪ ਭੇਜੋ'}</span>
                    </button>
                  </div>
                ))}
              </div>
            )}

            <div className="pt-2 flex justify-end border-t border-slate-200">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold"
              >
                {lang === 'en' ? 'Close' : 'ਬੰਦ ਕਰੋ'}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

/**
 * Password-Protected Admin Control Panel (`Mbeeenterprise@#123`).
 * Allows Proprietor Baljinder Singh to:
 * 1. Add new custom Services (`Our Services`) & delete custom services.
 * 2. Post or update a live Website Special Announcement Banner.
 * 3. View all Registered Customer Profiles & Clicked Service Work Requests.
 */
export function AdminControlPanelModal({
  isOpen,
  lang,
  customServices,
  adminAnnouncement,
  onClose,
  onUpdateCustomServices,
  onUpdateAnnouncement,
}: {
  isOpen: boolean;
  lang: Language;
  customServices: ServiceItem[];
  adminAnnouncement: string;
  onClose: () => void;
  onUpdateCustomServices: (services: ServiceItem[]) => void;
  onUpdateAnnouncement: (text: string) => void;
}) {
  const [isUnlocked, setIsUnlocked] = useState(false);
  const [passwordInput, setPasswordInput] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [authError, setAuthError] = useState('');
  const [adminTab, setAdminTab] = useState<'services' | 'announcement' | 'customers'>('services');

  // New Service Form State
  const [srvTitleEn, setSrvTitleEn] = useState('');
  const [srvTitlePa, setSrvTitlePa] = useState('');
  const [srvCategory, setSrvCategory] = useState<ServiceCategoryId>('documentation');
  const [srvBadge, setSrvBadge] = useState<'none' | 'popular' | 'new'>('new');
  const [srvDescEn, setSrvDescEn] = useState('');
  const [srvDescPa, setSrvDescPa] = useState('');
  const [srvChecklist, setSrvChecklist] = useState(
    'Aadhaar Card Copy, Passport Size Photo, Active Mobile Number'
  );
  const [serviceSuccessMsg, setServiceSuccessMsg] = useState('');
  const [announcementDraft, setAnnouncementDraft] = useState(adminAnnouncement);
  const [announcementSaved, setAnnouncementSaved] = useState(false);
  const [backendEnquiries, setBackendEnquiries] = useState<BackendEnquiryRecord[]>([]);
  const [profilesTick, setProfilesTick] = useState(0);

  useEffect(() => {
    setAnnouncementDraft(adminAnnouncement);
  }, [adminAnnouncement, isOpen]);

  useEffect(() => {
    if (!isOpen || !isUnlocked) return;
    let active = true;
    void fetchEnquiriesFromBackend().then((list) => {
      if (active) setBackendEnquiries(list);
    });
    void fetchProfilesFromBackend().then((serverProfiles) => {
      if (!active || serverProfiles.length === 0) return;
      for (const sp of serverProfiles) {
        saveProfileToRegistry({
          uid: sp.uid,
          memberId: sp.memberId,
          name: sp.name,
          mobile: sp.mobile,
          email: sp.email,
          city: sp.city,
          occupation: sp.occupation,
          authProvider: sp.authProvider === 'google' ? 'google' : 'mobile',
          signedInAt: sp.updatedAt,
          submittedDocuments: sp.submittedDocuments,
        });
      }
      setProfilesTick((t) => t + 1);
    });
    return () => {
      active = false;
    };
  }, [isOpen, isUnlocked]);

  if (!isOpen) return null;

  const handleLoginSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (verifyAdminPassword(passwordInput)) {
      setIsUnlocked(true);
      setAuthError('');
      setPasswordInput('');
    } else {
      setAuthError(
        lang === 'en'
          ? 'Incorrect Admin Password. Please enter the valid M Bee Enterprises admin password.'
          : 'ਗਲਤ ਐਡਮਿਨ ਪਾਸਵਰਡ। ਕਿਰਪਾ ਕਰਕੇ ਸਹੀ ਪਾਸਵਰਡ ਭਰੋ।'
      );
    }
  };

  const handleAddService = (e: React.FormEvent) => {
    e.preventDefault();
    if (srvTitleEn.trim().length < 2) return;

    const cleanEn = srvTitleEn.trim();
    const cleanPa = srvTitlePa.trim() || cleanEn;
    const descEn =
      srvDescEn.trim() ||
      `Professional assistance and documentation support for ${cleanEn} at M Bee Enterprises, Mahilpur.`;
    const descPa =
      srvDescPa.trim() ||
      `ਐਮ ਬੀ ਐਂਟਰਪ੍ਰਾਈਜ਼ਿਜ਼, ਮਾਹਿਲਪੁਰ ਵਿਖੇ ${cleanPa} ਲਈ ਮਾਹਿਰ ਸਲਾਹ ਅਤੇ ਦਸਤਾਵੇਜ਼ੀ ਸਹਾਇਤਾ।`;
    const docsList = srvChecklist
      .split(',')
      .map((s) => s.trim())
      .filter(Boolean);

    const newService: ServiceItem = {
      id: `custom-${Date.now()}`,
      categoryId: srvCategory,
      iconName:
        srvCategory === 'financial'
          ? 'Briefcase'
          : srvCategory === 'property'
          ? 'Building2'
          : srvCategory === 'digital'
          ? 'MonitorCheck'
          : 'FileCheck2',
      badge: srvBadge === 'none' ? undefined : srvBadge,
      title: { en: cleanEn, pa: cleanPa },
      shortDesc: { en: descEn, pa: descPa },
      detailedDesc: { en: descEn, pa: descPa },
      preparationList: {
        en: docsList.length > 0 ? docsList : ['Valid ID Proof', 'Registered Mobile Number'],
        pa: docsList.length > 0 ? docsList : ['ਪਛਾਣ ਪੱਤਰ', 'ਚਾਲੂ ਮੋਬਾਈਲ ਨੰਬਰ'],
      },
      turnaroundNote: {
        en: 'Processed at M Bee Enterprises (Prop. Baljinder Singh & Manpreet Singh), Mahilpur subject to authority guidelines.',
        pa: 'ਸਬੰਧਤ ਵਿਭਾਗ ਦੇ ਨਿਯਮਾਂ ਅਨੁਸਾਰ ਐਮ ਬੀ ਐਂਟਰਪ੍ਰਾਈਜ਼ਿਜ਼ (ਬਲਜਿੰਦਰ ਸਿੰਘ ਅਤੇ ਮਨਪ੍ਰੀਤ ਸਿੰਘ), ਮਾਹਿਲਪੁਰ ਵਿਖੇ ਪ੍ਰਕਿਰਿਆ।',
      },
    };

    const updated = [newService, ...customServices];
    onUpdateCustomServices(updated);
    setSrvTitleEn('');
    setSrvTitlePa('');
    setSrvDescEn('');
    setSrvDescPa('');
    setServiceSuccessMsg(
      lang === 'en'
        ? `"${cleanEn}" added to the website services!`
        : `"${cleanPa}" ਵੈੱਬਸਾਈਟ ਦੀਆਂ ਸੇਵਾਵਾਂ ਵਿੱਚ ਜੋੜ ਦਿੱਤਾ ਗਿਆ ਹੈ!`
    );
    setTimeout(() => setServiceSuccessMsg(''), 3500);
  };

  const handleRemoveService = (id: string) => {
    const updated = customServices.filter((s) => s.id !== id);
    onUpdateCustomServices(updated);
  };

  const handleSaveAnnouncement = (e: React.FormEvent) => {
    e.preventDefault();
    onUpdateAnnouncement(announcementDraft.trim());
    setAnnouncementSaved(true);
    setTimeout(() => setAnnouncementSaved(false), 2500);
  };

  const savedProfilesList = (() => {
    void profilesTick;
    return Object.values(loadSavedProfiles());
  })();

  const handleAdminCycleDocStatus = (prof: UserSession, docItem: SubmittedDocumentItem) => {
    const nextOrder: Record<DocumentStatus, DocumentStatus> = {
      Pending: 'Processing',
      Processing: 'Completed',
      Completed: 'Pending',
    };
    const nextStatus = nextOrder[docItem.status] || 'Pending';
    const nextDocs = (prof.submittedDocuments || []).map((d) =>
      d.id === docItem.id ? { ...d, status: nextStatus } : d
    );
    const updatedProf: UserSession = {
      ...prof,
      submittedDocuments: nextDocs,
    };
    saveProfileToRegistry(updatedProf);
    void syncDocumentStatusWithBackend(
      prof.uid || prof.memberId || prof.mobile,
      docItem.id,
      nextStatus
    );
    void syncUserProfileAcrossClouds(updatedProf);
    setProfilesTick((t) => t + 1);
  };

  return (
    <div
      className="fixed inset-0 z-50 bg-[#081326]/80 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto"
      role="dialog"
      aria-modal="true"
      aria-labelledby="admin-modal-title"
      data-testid="admin-panel-modal"
    >
      <div className="bg-white rounded-2xl max-w-2xl w-full border border-[#C69C3A] shadow-2xl overflow-hidden my-auto">
        {/* Top Admin Header */}
        <div className="bg-[#081326] text-white px-6 py-4 flex items-center justify-between border-b border-[#C69C3A]/40">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-[#C69C3A] text-[#081326] flex items-center justify-center shrink-0">
              <Lock className="w-5 h-5" />
            </div>
            <div>
              <h3 id="admin-modal-title" className="text-base sm:text-lg font-bold text-white">
                {lang === 'en'
                  ? 'M Bee Enterprises · Admin Control Panel'
                  : 'ਐਮ ਬੀ ਐਂਟਰਪ੍ਰਾਈਜ਼ਿਜ਼ · ਐਡਮਿਨ ਕੰਟਰੋਲ ਪੈਨਲ'}
              </h3>
              <p className="text-xs text-[#E5C158]">
                {lang === 'en'
                  ? 'Proprietors: Baljinder Singh & Manpreet Singh · Add Services, Announcements & View Clients'
                  : 'ਪ੍ਰੋਪਰਾਈਟਰ: ਬਲਜਿੰਦਰ ਸਿੰਘ ਅਤੇ ਮਨਪ੍ਰੀਤ ਸਿੰਘ · ਨਵੀਆਂ ਸੇਵਾਵਾਂ ਜੋੜੋ ਅਤੇ ਗਾਹਕ ਵੇਰਵੇ ਦੇਖੋ'}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {isUnlocked && (
              <button
                type="button"
                onClick={() => setIsUnlocked(false)}
                className="px-2.5 py-1 rounded-lg bg-white/10 hover:bg-white/15 text-xs font-semibold text-[#E5C158]"
              >
                {lang === 'en' ? 'Lock Admin' : 'ਲੌਕ ਕਰੋ'}
              </button>
            )}
            <button
              type="button"
              onClick={onClose}
              aria-label="Close admin panel"
              className="p-1.5 rounded-lg text-slate-300 hover:text-white hover:bg-white/10"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {!isUnlocked ? (
          /* Admin Password Login Gate */
          <form onSubmit={handleLoginSubmit} className="p-6 sm:p-8 space-y-5">
            <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-600 leading-relaxed">
              {lang === 'en'
                ? 'Restricted to Proprietors Baljinder Singh & Manpreet Singh. Enter the official Admin Password to add new services, post announcements, or inspect customer work requests.'
                : 'ਇਹ ਪੈਨਲ ਸਿਰਫ਼ ਪ੍ਰੋਪਰਾਈਟਰ ਬਲਜਿੰਦਰ ਸਿੰਘ ਅਤੇ ਮਨਪ੍ਰੀਤ ਸਿੰਘ ਲਈ ਹੈ। ਵੈੱਬਸਾਈਟ ਵਿੱਚ ਨਵੀਆਂ ਸੇਵਾਵਾਂ ਜਾਂ ਜਾਣਕਾਰੀ ਜੋੜਨ ਲਈ ਐਡਮਿਨ ਪਾਸਵਰਡ ਭਰੋ।'}
            </div>

            <div>
              <label
                htmlFor="admin-password-input"
                className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5"
              >
                {lang === 'en' ? 'Enter Admin Password *' : 'ਐਡਮਿਨ ਪਾਸਵਰਡ ਭਰੋ *'}
              </label>
              <div className="relative">
                <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  id="admin-password-input"
                  data-testid="admin-password-input"
                  type={showPassword ? 'text' : 'password'}
                  required
                  value={passwordInput}
                  onChange={(e) => setPasswordInput(e.target.value)}
                  placeholder="Enter admin password..."
                  className="w-full pl-10 pr-10 py-2.5 rounded-xl bg-slate-50 border border-slate-300 text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#0F213C]"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  aria-label="Toggle password visibility"
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-700"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            {authError && (
              <p
                data-testid="admin-auth-error"
                className="text-xs text-red-600 font-semibold"
                role="alert"
              >
                {authError}
              </p>
            )}

            <button
              type="submit"
              data-testid="admin-login-submit-btn"
              className="w-full py-3 px-5 rounded-xl bg-[#0F213C] hover:bg-[#173056] text-[#E5C158] font-bold text-sm flex items-center justify-center gap-2 shadow-sm transition-colors"
            >
              <ShieldCheck className="w-4 h-4" />
              <span>{lang === 'en' ? 'Unlock Admin Panel' : 'ਐਡਮਿਨ ਪੈਨਲ ਖੋਲ੍ਹੋ'}</span>
            </button>
          </form>
        ) : (
          /* Unlocked Admin Dashboard */
          <div>
            {/* Admin Navigation Tabs */}
            <div className="grid grid-cols-3 bg-slate-100 p-1.5 border-b border-slate-200 gap-1">
              <button
                type="button"
                data-testid="admin-tab-services"
                onClick={() => setAdminTab('services')}
                className={`py-2 px-3 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 transition-all ${
                  adminTab === 'services'
                    ? 'bg-[#0F213C] text-[#E5C158] shadow-xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <PlusCircle className="w-3.5 h-3.5" />
                <span>{lang === 'en' ? 'Add Services' : 'ਨਵੀਂ ਸੇਵਾ ਜੋੜੋ'}</span>
              </button>
              <button
                type="button"
                data-testid="admin-tab-announcement"
                onClick={() => setAdminTab('announcement')}
                className={`py-2 px-3 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 transition-all ${
                  adminTab === 'announcement'
                    ? 'bg-[#0F213C] text-[#E5C158] shadow-xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <Megaphone className="w-3.5 h-3.5" />
                <span>{lang === 'en' ? 'Website Notice' : 'ਵੈੱਬਸਾਈਟ ਸੂਚਨਾ'}</span>
              </button>
              <button
                type="button"
                data-testid="admin-tab-customers"
                onClick={() => setAdminTab('customers')}
                className={`py-2 px-3 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 transition-all ${
                  adminTab === 'customers'
                    ? 'bg-[#0F213C] text-[#E5C158] shadow-xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <User className="w-3.5 h-3.5" />
                <span>
                  {lang === 'en'
                    ? `Customers (${savedProfilesList.length})`
                    : `ਗਾਹਕ (${savedProfilesList.length})`}
                </span>
              </button>
            </div>

            <div className="p-6 max-h-[75vh] overflow-y-auto space-y-6">
              {adminTab === 'services' && (
                <>
                  <form onSubmit={handleAddService} className="space-y-4">
                    <div className="text-sm font-bold text-[#0F213C] flex items-center gap-2">
                      <Sparkles className="w-4 h-4 text-[#C69C3A]" />
                      <span>
                        {lang === 'en'
                          ? 'Add a New Service Card to Website'
                          : 'ਵੈੱਬਸਾਈਟ ਵਿੱਚ ਨਵੀਂ ਸੇਵਾ (Service Card) ਜੋੜੋ'}
                      </span>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                      <div>
                        <label
                          htmlFor="admin-srv-en"
                          className="block text-xs font-bold uppercase text-slate-700 mb-1"
                        >
                          {lang === 'en' ? 'Service Name (English) *' : 'ਸੇਵਾ ਦਾ ਨਾਮ (ਅੰਗਰੇਜ਼ੀ) *'}
                        </label>
                        <input
                          id="admin-srv-en"
                          data-testid="admin-srv-title-en"
                          type="text"
                          required
                          value={srvTitleEn}
                          onChange={(e) => setSrvTitleEn(e.target.value)}
                          placeholder="e.g., Income Tax Return (ITR) Filing"
                          className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-300 text-sm text-slate-900"
                        />
                      </div>

                      <div>
                        <label
                          htmlFor="admin-srv-pa"
                          className="block text-xs font-bold uppercase text-slate-700 mb-1"
                        >
                          {lang === 'en'
                            ? 'Service Name (Punjabi - Optional)'
                            : 'ਸੇਵਾ ਦਾ ਨਾਮ (ਪੰਜਾਬੀ)'}
                        </label>
                        <input
                          id="admin-srv-pa"
                          data-testid="admin-srv-title-pa"
                          type="text"
                          value={srvTitlePa}
                          onChange={(e) => setSrvTitlePa(e.target.value)}
                          placeholder="ਉਦਾਹਰਨ: ਇਨਕਮ ਟੈਕਸ ਰਿਟਰਨ (ITR)"
                          className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-300 text-sm text-slate-900"
                        />
                      </div>

                      <div>
                        <label
                          htmlFor="admin-srv-cat"
                          className="block text-xs font-bold uppercase text-slate-700 mb-1"
                        >
                          {lang === 'en' ? 'Category' : 'ਸ਼੍ਰੇਣੀ (Category)'}
                        </label>
                        <select
                          id="admin-srv-cat"
                          value={srvCategory}
                          onChange={(e) => setSrvCategory(e.target.value as ServiceCategoryId)}
                          className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-300 text-sm text-slate-900"
                        >
                          <option value="documentation">Documentation Services</option>
                          <option value="financial">Financial &amp; Loan Services</option>
                          <option value="property">Property Services</option>
                          <option value="digital">Digital &amp; Government Services</option>
                        </select>
                      </div>

                      <div>
                        <label
                          htmlFor="admin-srv-badge"
                          className="block text-xs font-bold uppercase text-slate-700 mb-1"
                        >
                          {lang === 'en' ? 'Highlight Badge' : 'ਬੈਜ (Popular / New)'}
                        </label>
                        <select
                          id="admin-srv-badge"
                          value={srvBadge}
                          onChange={(e) =>
                            setSrvBadge(e.target.value as 'none' | 'popular' | 'new')
                          }
                          className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-300 text-sm text-slate-900"
                        >
                          <option value="new">New (ਨਵੀਂ ਸੇਵਾ)</option>
                          <option value="popular">Popular (ਪ੍ਰਸਿੱਧ)</option>
                          <option value="none">No Badge</option>
                        </select>
                      </div>

                      <div className="sm:col-span-2">
                        <label
                          htmlFor="admin-srv-desc"
                          className="block text-xs font-bold uppercase text-slate-700 mb-1"
                        >
                          {lang === 'en' ? 'Short Service Description' : 'ਸੇਵਾ ਬਾਰੇ ਸੰਖੇਪ ਜਾਣਕਾਰੀ'}
                        </label>
                        <input
                          id="admin-srv-desc"
                          data-testid="admin-srv-desc-en"
                          type="text"
                          value={srvDescEn}
                          onChange={(e) => setSrvDescEn(e.target.value)}
                          placeholder="e.g., Complete online filing and documentation support at our Mahilpur centre."
                          className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-300 text-sm text-slate-900"
                        />
                      </div>

                      <div className="sm:col-span-2">
                        <label
                          htmlFor="admin-srv-docs"
                          className="block text-xs font-bold uppercase text-slate-700 mb-1"
                        >
                          {lang === 'en'
                            ? 'Required Documents (Comma separated)'
                            : 'ਲੋੜੀਂਦੇ ਦਸਤਾਵੇਜ਼ (ਕੌਮੇ ਨਾਲ ਵੱਖ ਕਰੋ)'}
                        </label>
                        <input
                          id="admin-srv-docs"
                          type="text"
                          value={srvChecklist}
                          onChange={(e) => setSrvChecklist(e.target.value)}
                          className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-300 text-sm text-slate-900"
                        />
                      </div>
                    </div>

                    {serviceSuccessMsg && (
                      <div
                        data-testid="admin-service-added-msg"
                        className="p-3 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-900 text-xs font-bold flex items-center gap-2"
                      >
                        <AnimatedCheckIcon className="w-4 h-4 text-emerald-700" />
                        <span>{serviceSuccessMsg}</span>
                      </div>
                    )}

                    <button
                      type="submit"
                      data-testid="admin-add-service-btn"
                      className="px-5 py-2.5 rounded-xl bg-[#0F213C] hover:bg-[#173056] text-[#E5C158] font-bold text-xs inline-flex items-center gap-2 shadow-xs transition-colors"
                    >
                      <PlusCircle className="w-4 h-4" />
                      <span>
                        {lang === 'en'
                          ? 'Add Service to Website Now'
                          : 'ਵੈੱਬਸਾਈਟ ਤੇ ਨਵੀਂ ਸੇਵਾ ਜੋੜੋ'}
                      </span>
                    </button>
                  </form>

                  {/* List of Custom Services Added by Admin */}
                  <div className="pt-4 border-t border-slate-200 space-y-3">
                    <div className="text-xs font-bold uppercase tracking-wider text-slate-500">
                      {lang === 'en'
                        ? `Custom Services Added by Admin (${customServices.length})`
                        : `ਐਡਮਿਨ ਵੱਲੋਂ ਜੋੜੀਆਂ ਗਈਆਂ ਨਵੀਆਂ ਸੇਵਾਵਾਂ (${customServices.length})`}
                    </div>
                    {customServices.length === 0 ? (
                      <p className="text-xs text-slate-500">
                        {lang === 'en'
                          ? 'No extra custom services added yet. Use the form above to add new services anytime.'
                          : 'ਹਾਲੇ ਕੋਈ ਵਾਧੂ ਸੇਵਾ ਨਹੀਂ ਜੋੜੀ ਗਈ। ਉੱਪਰ ਦਿੱਤੇ ਫਾਰਮ ਰਾਹੀਂ ਨਵੀਂ ਸੇਵਾ ਜੋੜੋ।'}
                      </p>
                    ) : (
                      <div className="space-y-2">
                        {customServices.map((srv) => (
                          <div
                            key={srv.id}
                            className="p-3 rounded-xl bg-slate-50 border border-slate-200 flex items-center justify-between gap-3"
                          >
                            <div>
                              <div className="text-sm font-bold text-[#0F213C]">
                                {srv.title.en}{' '}
                                <span className="text-xs font-normal text-slate-500">
                                  ({srv.title.pa})
                                </span>
                              </div>
                              <div className="text-xs text-slate-600">{srv.shortDesc.en}</div>
                            </div>
                            <button
                              type="button"
                              onClick={() => handleRemoveService(srv.id)}
                              className="px-2.5 py-1.5 rounded-lg bg-red-50 hover:bg-red-100 text-red-700 text-xs font-bold inline-flex items-center gap-1 shrink-0"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                              <span>{lang === 'en' ? 'Remove' : 'ਹਟਾਓ'}</span>
                            </button>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </>
              )}

              {adminTab === 'announcement' && (
                <form onSubmit={handleSaveAnnouncement} className="space-y-4">
                  <div className="text-sm font-bold text-[#0F213C]">
                    {lang === 'en'
                      ? 'Post a Special Notice or Offer Banner on Homepage'
                      : 'ਮੁੱਖ ਪੰਨੇ ਤੇ ਵਿਸ਼ੇਸ਼ ਸੂਚਨਾ ਜਾਂ ਆਫ਼ਰ ਬੈਨਰ ਲਗਾਓ'}
                  </div>
                  <textarea
                    rows={3}
                    value={announcementDraft}
                    onChange={(e) => setAnnouncementDraft(e.target.value)}
                    placeholder={
                      lang === 'en'
                        ? 'e.g., Special Passport & Loan Consultation Camp this week at M Bee Enterprises, Mahilpur!'
                        : 'ਉਦਾਹਰਨ: ਐਮ ਬੀ ਐਂਟਰਪ੍ਰਾਈਜ਼ਿਜ਼ ਮਾਹਿਲਪੁਰ ਵਿਖੇ ਪਾਸਪੋਰਟ ਅਤੇ ਲੋਨ ਫਾਈਲਾਂ ਲਈ ਵਿਸ਼ੇਸ਼ ਸਹਾਇਤਾ ਉਪਲਬਧ ਹੈ!'
                    }
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-300 text-sm text-slate-900"
                  />
                  <div className="flex items-center gap-3">
                    <button
                      type="submit"
                      className="px-4 py-2.5 rounded-xl bg-[#0F213C] hover:bg-[#173056] text-[#E5C158] font-bold text-xs inline-flex items-center gap-2"
                    >
                      {announcementSaved ? (
                        <>
                          <AnimatedCheckIcon className="w-4 h-4 text-[#E5C158]" />
                          <span>{lang === 'en' ? 'Updated on Website' : 'ਅੱਪਡੇਟ ਹੋ ਗਿਆ'}</span>
                        </>
                      ) : (
                        <span>{lang === 'en' ? 'Save Notice Banner' : 'ਸੂਚਨਾ ਸੇਵ ਕਰੋ'}</span>
                      )}
                    </button>
                    {announcementDraft && (
                      <button
                        type="button"
                        onClick={() => {
                          setAnnouncementDraft('');
                          onUpdateAnnouncement('');
                        }}
                        className="px-3 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold"
                      >
                        {lang === 'en' ? 'Clear Notice' : 'ਸੂਚਨਾ ਹਟਾਓ'}
                      </button>
                    )}
                  </div>
                </form>
              )}

              {adminTab === 'customers' && (
                <div className="space-y-3">
                  <div className="text-sm font-bold text-[#0F213C]">
                    {lang === 'en'
                      ? 'Registered Customer Profiles & Clicked Service Requests'
                      : 'ਰਜਿਸਟਰਡ ਗਾਹਕ ਪ੍ਰੋਫਾਈਲਾਂ ਅਤੇ ਚੁਣੀਆਂ ਗਈਆਂ ਸੇਵਾਵਾਂ'}
                  </div>
                  {savedProfilesList.length === 0 ? (
                    <div className="p-6 rounded-xl bg-slate-50 border border-slate-200 text-center text-xs text-slate-500">
                      {lang === 'en'
                        ? 'No customer profiles registered on this browser yet.'
                        : 'ਹਾਲੇ ਤੱਕ ਕੋਈ ਗਾਹਕ ਪ੍ਰੋਫਾਈਲ ਦਰਜ ਨਹੀਂ ਹੋਈ।'}
                    </div>
                  ) : (
                    <div className="space-y-3">
                      {savedProfilesList.map((prof) => (
                        <div
                          key={prof.mobile}
                          className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-2"
                        >
                          <div className="flex flex-wrap items-center justify-between gap-2">
                            <div>
                              <span className="text-sm font-bold text-[#0F213C]">{prof.name}</span>{' '}
                              <span className="text-xs font-tabular text-slate-600">
                                (+91 {prof.mobile})
                              </span>
                              <div className="text-xs text-slate-500">
                                {prof.city || 'Punjab'} · {prof.occupation || 'Customer'}
                              </div>
                            </div>
                            <div className="flex items-center gap-2">
                              <a
                                href={`tel:+91${prof.mobile.replace(/\D/g, '').slice(-10)}`}
                                className="px-2.5 py-1 rounded-lg bg-white border border-slate-300 text-xs font-bold text-[#0F213C] inline-flex items-center gap-1"
                              >
                                <PhoneCall className="w-3 h-3" />
                                <span>Call</span>
                              </a>
                              <a
                                href={buildWhatsAppUrl(
                                  `Hello ${prof.name}, this is Baljinder Singh & Manpreet Singh from M Bee Enterprises, Mahilpur regarding your service request.`,
                                  prof.mobile
                                )}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="px-2.5 py-1 rounded-lg bg-[#0F213C] text-[#E5C158] text-xs font-bold inline-flex items-center gap-1"
                              >
                                <MessageCircle className="w-3 h-3" />
                                <span>WhatsApp</span>
                              </a>
                            </div>
                          </div>
                          {prof.workHistory && prof.workHistory.length > 0 && (
                            <div className="pt-2 border-t border-slate-200/80 space-y-1">
                              <div className="text-[11px] font-bold uppercase text-[#8A6615]">
                                Clicked Services ({prof.workHistory.length}):
                              </div>
                              {prof.workHistory.slice(0, 3).map((w) => (
                                <div key={w.id} className="text-xs text-slate-700">
                                  • <strong>{w.serviceName}</strong> ({w.createdAt})
                                </div>
                              ))}
                            </div>
                          )}
                          {prof.submittedDocuments && prof.submittedDocuments.length > 0 && (
                            <div className="pt-2 border-t border-slate-200/80 space-y-1.5">
                              <div className="text-[11px] font-bold uppercase text-[#0F213C]">
                                Submitted Documents ({prof.submittedDocuments.length}) — Click badge to update status:
                              </div>
                              <div className="flex flex-wrap gap-1.5">
                                {prof.submittedDocuments.slice(0, 6).map((docItem) => (
                                  <button
                                    key={docItem.id}
                                    type="button"
                                    onClick={() => handleAdminCycleDocStatus(prof, docItem)}
                                    className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-md bg-white hover:bg-slate-100 border border-slate-200 text-[11px] text-slate-700 cursor-pointer transition-colors"
                                  >
                                    <span className="font-semibold">{docItem.documentName}</span>
                                    <span
                                      className={`px-1.5 py-0.5 rounded text-[10px] font-bold ${
                                        docItem.status === 'Completed'
                                          ? 'bg-emerald-100 text-emerald-800'
                                          : docItem.status === 'Processing'
                                          ? 'bg-blue-100 text-blue-800'
                                          : 'bg-amber-100 text-amber-800'
                                      }`}
                                    >
                                      {docItem.status}
                                    </span>
                                  </button>
                                ))}
                              </div>
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  )}

                  {backendEnquiries.length > 0 && (
                    <div className="pt-4 border-t border-slate-200 space-y-2.5">
                      <div className="text-xs font-bold uppercase tracking-wider text-[#0F213C]">
                        {lang === 'en'
                          ? `Live Backend Work Enquiries (${backendEnquiries.length})`
                          : `ਬੈਕਐਂਡ ਵਿੱਚ ਦਰਜ ਕੰਮ ਬੇਨਤੀਆਂ (${backendEnquiries.length})`}
                      </div>
                      <div className="space-y-2">
                        {backendEnquiries.slice(0, 8).map((enq) => (
                          <div
                            key={enq.id}
                            className="p-3 rounded-xl bg-slate-50 border border-slate-200 flex items-center justify-between gap-3 text-xs"
                          >
                            <div>
                              <div className="font-bold text-[#0F213C]">
                                {enq.userName} ({enq.userMobile}) — {enq.serviceName}
                              </div>
                              <div className="text-slate-600">{enq.workDescription}</div>
                            </div>
                            <span className="text-[11px] font-tabular text-slate-500 shrink-0">
                              {enq.createdAt}
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export function AdminDispatchModal({
  payload,
  lang,
  onClose,
}: {
  payload: AdminNotificationPayload | null;
  lang: Language;
  onClose: () => void;
}) {
  if (!payload) return null;

  const links = buildAdminNotificationLinks(payload);

  return (
    <div
      className="fixed inset-0 z-50 bg-[#081326]/75 backdrop-blur-xs flex items-center justify-center p-4"
      role="dialog"
      aria-modal="true"
      aria-labelledby="admin-dispatch-title"
      data-testid="admin-dispatch-modal"
    >
      <div className="bg-white rounded-2xl max-w-lg w-full border border-[#C69C3A] shadow-2xl overflow-hidden">
        <div className="bg-[#0F213C] text-white px-6 py-4 flex items-center justify-between border-b border-[#C69C3A]/30">
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-xl bg-[#C69C3A] text-[#081326] flex items-center justify-center shrink-0">
              <BellRing className="w-5 h-5" />
            </div>
            <div>
              <h3 id="admin-dispatch-title" className="text-base sm:text-lg font-bold text-white">
                {lang === 'en'
                  ? 'Send Selected Work to Admin (Baljinder Singh & Manpreet Singh)'
                  : 'ਐਡਮਿਨ (ਬਲਜਿੰਦਰ ਸਿੰਘ ਅਤੇ ਮਨਪ੍ਰੀਤ ਸਿੰਘ) ਨੂੰ ਮੈਸੇਜ ਭੇਜੋ'}
              </h3>
              <p className="text-xs text-[#E5C158]">
                {lang === 'en'
                  ? 'Ready to dispatch to 82888-37597 or 99156-28427'
                  : '82888-37597 ਜਾਂ 99156-28427 ਤੇ ਤੁਰੰਤ ਭੇਜਣ ਲਈ ਤਿਆਰ'}
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close admin notification dialog"
            className="p-1.5 rounded-lg text-slate-300 hover:text-white hover:bg-white/10"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6 space-y-4">
          <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 text-xs space-y-1.5 text-slate-700">
            <div className="font-bold text-[#0F213C] uppercase tracking-wider text-[11px] mb-1 flex items-center justify-between">
              <span>
                {lang === 'en'
                  ? 'Formatted Message for Admin:'
                  : 'ਐਡਮਿਨ ਨੂੰ ਜਾਣ ਵਾਲਾ ਮੈਸੇਜ:'}
              </span>
              <span className="inline-flex items-center gap-1 text-[#8A6619]">
                <AnimatedCheckIcon className="w-3.5 h-3.5" />
                <span>{lang === 'en' ? 'Request Logged' : 'ਦਰਜ ਕੀਤਾ ਗਿਆ'}</span>
              </span>
            </div>
            <p className="whitespace-pre-line font-medium text-[#0F213C] bg-white p-3 rounded-lg border border-slate-200">
              {links.messageText}
            </p>
          </div>

          <div className="space-y-2.5">
            <div className="text-xs font-bold text-slate-700 uppercase tracking-wider">
              {lang === 'en'
                ? '1. Send via WhatsApp to Admin:'
                : '1. ਐਡਮਿਨ ਦੇ ਵਟਸਐਪ ਤੇ ਭੇਜੋ:'}
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
              <a
                href={links.primaryWhatsAppUrl}
                target="_blank"
                rel="noopener noreferrer"
                data-testid="admin-wa-primary-link"
                className="py-3 px-4 rounded-xl bg-[#0F213C] hover:bg-[#173056] text-[#E5C158] font-bold text-xs flex items-center justify-center gap-2 shadow-sm transition-colors whitespace-nowrap"
              >
                <MessageCircle className="w-4 h-4 shrink-0" />
                <span>WhatsApp: {PRIMARY_PHONE}</span>
              </a>
              <a
                href={links.secondaryWhatsAppUrl}
                target="_blank"
                rel="noopener noreferrer"
                data-testid="admin-wa-secondary-link"
                className="py-3 px-4 rounded-xl bg-[#0F213C] hover:bg-[#173056] text-white font-bold text-xs flex items-center justify-center gap-2 shadow-sm transition-colors whitespace-nowrap"
              >
                <MessageCircle className="w-4 h-4 shrink-0" />
                <span>WhatsApp: {SECONDARY_PHONE}</span>
              </a>
            </div>
          </div>

          <div className="space-y-2.5 pt-1">
            <div className="text-xs font-bold text-slate-700 uppercase tracking-wider">
              {lang === 'en'
                ? '2. Or Send Direct Phone SMS to Admin Number:'
                : '2. ਜਾਂ ਐਡਮਿਨ ਦੇ ਫੋਨ ਨੰਬਰ ਤੇ ਸਿੱਧਾ SMS ਭੇਜੋ:'}
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
              <a
                href={links.primarySmsUrl}
                data-testid="admin-sms-primary-link"
                className="py-2.5 px-4 rounded-xl bg-slate-100 hover:bg-slate-200 text-[#0F213C] border border-slate-300 font-bold text-xs flex items-center justify-center gap-2 transition-colors whitespace-nowrap"
              >
                <Smartphone className="w-4 h-4 shrink-0" />
                <span>SMS: {PRIMARY_PHONE}</span>
              </a>
              <a
                href={links.secondarySmsUrl}
                data-testid="admin-sms-secondary-link"
                className="py-2.5 px-4 rounded-xl bg-slate-100 hover:bg-slate-200 text-[#0F213C] border border-slate-300 font-bold text-xs flex items-center justify-center gap-2 transition-colors whitespace-nowrap"
              >
                <Smartphone className="w-4 h-4 shrink-0" />
                <span>SMS: {SECONDARY_PHONE}</span>
              </a>
            </div>
          </div>

          <div className="pt-2 flex justify-end">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold"
            >
              {lang === 'en' ? 'Done / Close' : 'ਬੰਦ ਕਰੋ'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

/**
 * Dedicated Website Page for Customer Profile & Profile Name Setup (`activePage === 'profile'`).
 * Allows visitors and signed-in customers to set/edit their Profile Name, link with Google,
 * update contact details, and review or dispatch clicked services to Admin.
 */
export function CustomerProfilePage({
  userSession,
  lang,
  onSaveSession,
  onDispatchWork,
  onSignOut,
  onExploreServices,
}: {
  userSession: UserSession | null;
  lang: Language;
  onSaveSession: (session: UserSession) => void;
  onDispatchWork: (payload: AdminNotificationPayload) => void;
  onSignOut: () => void;
  onExploreServices: () => void;
}) {
  const [name, setName] = useState(userSession?.name || '');
  const [mobile, setMobile] = useState(userSession?.mobile || '');
  const [email, setEmail] = useState(userSession?.email || '');
  const [city, setCity] = useState(userSession?.city || 'Mahilpur, Punjab');
  const [occupation, setOccupation] = useState(userSession?.occupation || 'Citizen / Family');
  const [savedConfirm, setSavedConfirm] = useState(false);
  const [googleBusy, setGoogleBusy] = useState(false);
  const [error, setError] = useState('');

  // Submitted Documents Status Tracker State
  const [submittedDocs, setSubmittedDocs] = useState<SubmittedDocumentItem[]>(() =>
    userSession?.submittedDocuments && userSession.submittedDocuments.length > 0
      ? userSession.submittedDocuments
      : getDefaultSubmittedDocuments()
  );
  const [docFilter, setDocFilter] = useState<'All' | DocumentStatus>('All');
  const [newDocName, setNewDocName] = useState('');
  const [newDocCategory, setNewDocCategory] = useState('Aadhaar / PAN / Passport');
  const [newDocRemarks, setNewDocRemarks] = useState('');
  const [docAddedConfirm, setDocAddedConfirm] = useState(false);

  useEffect(() => {
    if (userSession) {
      setName(userSession.name || '');
      setMobile(userSession.mobile || '');
      setEmail(userSession.email || '');
      setCity(userSession.city || 'Mahilpur, Punjab');
      setOccupation(userSession.occupation || 'Citizen / Family');
      if (userSession.submittedDocuments && userSession.submittedDocuments.length > 0) {
        setSubmittedDocs(userSession.submittedDocuments);
      }
    }
  }, [userSession]);

  const isGoogleLinked =
    userSession?.authProvider === 'google' ||
    Boolean(userSession?.uid) ||
    Boolean(email && email.trim().toLowerCase().endsWith('@gmail.com'));

  const persistSubmittedDocuments = async (nextDocs: SubmittedDocumentItem[]) => {
    setSubmittedDocs(nextDocs);
    const baseProfile = createOrUpdateUserProfile(
      {
        uid: userSession?.uid || auth.currentUser?.uid,
        name: name.trim() || userSession?.name || 'M Bee Customer',
        mobile: mobile.trim() || userSession?.mobile || '',
        email: email.trim() || userSession?.email || '',
        city: city || userSession?.city || 'Mahilpur, Punjab',
        occupation: occupation || userSession?.occupation || 'Citizen / Family',
        photoURL: userSession?.photoURL || auth.currentUser?.photoURL || '',
        authProvider:
          isGoogleLinked || email.trim().toLowerCase().endsWith('@gmail.com')
            ? 'google'
            : userSession?.authProvider || 'mobile',
        workHistory: userSession?.workHistory || [],
        submittedDocuments: nextDocs,
      },
      userSession
    );
    if (baseProfile.uid || auth.currentUser?.uid) {
      await saveUserProfileToFirestore(baseProfile);
    }
    void syncDocumentsListWithBackend(
      baseProfile.uid || baseProfile.memberId || baseProfile.mobile,
      nextDocs
    );
    void syncUserProfileAcrossClouds(baseProfile);
    saveProfileToRegistry(baseProfile);
    onSaveSession(baseProfile);
  };

  const handleAddSubmittedDocument = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const domInput = e.currentTarget.querySelector<HTMLInputElement>(
      '[data-testid="submit-doc-name-input"]'
    );
    const resolvedDocName = (newDocName || domInput?.value || '').trim();
    if (!resolvedDocName) return;
    const item = createSubmittedDocumentItem(
      resolvedDocName,
      newDocCategory,
      'Pending',
      newDocRemarks.trim()
    );
    const nextDocs = [item, ...submittedDocs].slice(0, 20);
    setNewDocName('');
    if (domInput) domInput.value = '';
    setNewDocRemarks('');
    setDocAddedConfirm(true);
    setTimeout(() => setDocAddedConfirm(false), 2600);
    await persistSubmittedDocuments(nextDocs);
  };

  const handleStatusChange = async (docId: string, nextStatus: DocumentStatus) => {
    const nextDocs = updateSubmittedDocumentStatus(submittedDocs, docId, nextStatus);
    void syncDocumentStatusWithBackend(
      userSession?.uid || userSession?.memberId || mobile || 'guest',
      docId,
      nextStatus
    );
    await persistSubmittedDocuments(nextDocs);
  };

  const handleGoogleConnect = async () => {
    setError('');
    setGoogleBusy(true);
    try {
      const result = await signInWithPopup(auth, googleProvider);
      const googleUser = result.user;
      const firestoreProfile = await fetchUserProfileFromFirestore(googleUser.uid);
      const merged = buildGoogleUserProfile(
        googleUser,
        firestoreProfile || userSession,
        {
          mobile: mobile || userSession?.mobile || googleUser.phoneNumber || '',
          city: city || userSession?.city || 'Mahilpur, Punjab',
          occupation: occupation || userSession?.occupation || 'Citizen / Family',
        }
      );
      await saveUserProfileToFirestore(merged);
      saveProfileToRegistry(merged);
      onSaveSession(merged);
      setName(merged.name);
      setEmail(merged.email || '');
      if (merged.submittedDocuments) {
        setSubmittedDocs(merged.submittedDocuments);
      }
      setGoogleBusy(false);
      setSavedConfirm(true);
      setTimeout(() => setSavedConfirm(false), 2600);
    } catch {
      setGoogleBusy(false);
      setError(
        lang === 'en'
          ? 'Google popup could not open in this preview window. Enter your Profile Name, Mobile & Gmail below to save your profile directly.'
          : 'ਗੂਗਲ ਪੌਪਅੱਪ ਖੁੱਲ੍ਹ ਨਹੀਂ ਸਕਿਆ। ਹੇਠਾਂ ਆਪਣਾ ਨਾਮ, ਮੋਬਾਈਲ ਅਤੇ Gmail ਭਰ ਕੇ ਸਿੱਧੀ ਪ੍ਰੋਫਾਈਲ ਸੇਵ ਕਰੋ।'
      );
    }
  };

  const handleSaveProfilePage = async (e: React.FormEvent) => {
    e.preventDefault();
    const check = validateUserSignIn(name, mobile, isGoogleLinked);
    if (!check.valid) {
      setError(
        lang === 'en'
          ? check.error || 'Please enter your Profile Name and valid 10-digit Mobile Number.'
          : 'ਕਿਰਪਾ ਕਰਕੇ ਆਪਣਾ ਪੂਰਾ ਨਾਮ ਅਤੇ 10-ਅੰਕਾਂ ਦਾ ਸਹੀ ਮੋਬਾਈਲ ਨੰਬਰ ਭਰੋ।'
      );
      return;
    }

    setError('');
    const updated = createOrUpdateUserProfile(
      {
        uid: userSession?.uid || auth.currentUser?.uid,
        name,
        mobile,
        email,
        city: city || 'Mahilpur, Punjab',
        occupation,
        photoURL: userSession?.photoURL || auth.currentUser?.photoURL || '',
        authProvider:
          isGoogleLinked || email.trim().toLowerCase().endsWith('@gmail.com')
            ? 'google'
            : userSession?.authProvider || 'mobile',
        workHistory: userSession?.workHistory || [],
        submittedDocuments: submittedDocs,
      },
      userSession
    );

    if (updated.uid || auth.currentUser?.uid) {
      await saveUserProfileToFirestore(updated);
    }
    saveProfileToRegistry(updated);
    onSaveSession(updated);
    setSavedConfirm(true);
    setTimeout(() => setSavedConfirm(false), 2600);
  };

  const displayInitials = getUserInitials(name || userSession?.name || 'MB');
  const workHistory = userSession?.workHistory || [];
  const filteredDocs =
    docFilter === 'All'
      ? submittedDocs
      : submittedDocs.filter((doc) => doc.status === docFilter);

  const pendingCount = submittedDocs.filter((d) => d.status === 'Pending').length;
  const processingCount = submittedDocs.filter((d) => d.status === 'Processing').length;
  const completedCount = submittedDocs.filter((d) => d.status === 'Completed').length;

  const getStatusBadgeClasses = (status: DocumentStatus) => {
    if (status === 'Completed') {
      return 'bg-emerald-100 text-emerald-900 border-emerald-300';
    }
    if (status === 'Processing') {
      return 'bg-blue-100 text-blue-900 border-blue-300';
    }
    return 'bg-amber-100 text-amber-900 border-amber-300';
  };

  const getStatusDotClasses = (status: DocumentStatus) => {
    if (status === 'Completed') return 'bg-emerald-600';
    if (status === 'Processing') return 'bg-blue-600 animate-pulse';
    return 'bg-amber-600';
  };

  const getStatusLabel = (status: DocumentStatus) => {
    if (lang === 'en') return status;
    if (status === 'Completed') return 'Completed (ਪੂਰਾ ਹੋਇਆ)';
    if (status === 'Processing') return 'Processing (ਚੱਲ ਰਿਹਾ)';
    return 'Pending (ਪੈਂਡਿੰਗ)';
  };

  return (
    <section
      id="customer-profile-page"
      data-testid="dedicated-profile-page"
      className="py-10 sm:py-14 bg-slate-50 border-b border-slate-200"
    >
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
        {/* Top Profile Identity Banner */}
        <div className="rounded-2xl bg-gradient-to-r from-[#081326] via-[#0F213C] to-[#162F54] text-white p-6 sm:p-8 border border-[#C69C3A]/40 shadow-xl flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
          <div className="flex items-center gap-4 sm:gap-5">
            {userSession?.photoURL ? (
              <img
                src={userSession.photoURL}
                alt={name || userSession.name}
                referrerPolicy="no-referrer"
                className="w-16 h-16 sm:w-20 sm:h-20 rounded-2xl object-cover border-2 border-[#E5C158] shadow-lg shrink-0"
              />
            ) : (
              <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-2xl bg-[#C69C3A] text-[#081326] font-bold text-2xl sm:text-3xl flex items-center justify-center border-2 border-[#E5C158] shadow-lg shrink-0">
                {displayInitials}
              </div>
            )}
            <div className="space-y-1">
              <div className="flex flex-wrap items-center gap-2">
                <span className="text-xs font-bold uppercase tracking-wider text-[#E5C158]">
                  {lang === 'en'
                    ? 'M Bee Enterprises · Customer Profile Portal'
                    : 'ਐਮ ਬੀ ਐਂਟਰਪ੍ਰਾਈਜ਼ਿਜ਼ · ਗਾਹਕ ਪ੍ਰੋਫਾਈਲ ਪੋਰਟਲ'}
                </span>
                {userSession?.memberId && (
                  <span className="px-2.5 py-0.5 rounded-md bg-white/10 border border-[#C69C3A]/40 text-[#E5C158] font-tabular text-xs font-bold">
                    {userSession.memberId}
                  </span>
                )}
              </div>
              <h1
                data-testid="profile-page-display-name"
                className="text-2xl sm:text-3xl font-bold text-white tracking-tight"
              >
                {name.trim() ||
                  userSession?.name ||
                  (lang === 'en' ? 'Create & Set Your Profile Name' : 'ਆਪਣੀ ਪ੍ਰੋਫਾਈਲ ਦਾ ਨਾਮ ਬਣਾਓ')}
              </h1>
              <p className="text-xs sm:text-sm text-slate-300">
                {mobile
                  ? `+91 ${mobile} · ${city || 'Mahilpur, Punjab'}`
                  : lang === 'en'
                  ? 'Set your profile name, Google email, and mobile number below'
                  : 'ਹੇਠਾਂ ਆਪਣਾ ਨਾਮ, ਗੂਗਲ ਈਮੇਲ ਅਤੇ ਮੋਬਾਈਲ ਨੰਬਰ ਦਰਜ ਕਰੋ'}
              </p>
              {isGoogleLinked && (
                <div className="pt-1">
                  <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-white text-slate-900 text-xs font-bold">
                    <GoogleLogoSvg className="w-3.5 h-3.5" />
                    <span>
                      {lang === 'en' ? 'Google Account Linked' : 'ਗੂਗਲ ਅਕਾਊਂਟ ਲਿੰਕਡ'}
                    </span>
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                  </span>
                </div>
              )}
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2.5">
            <button
              type="button"
              onClick={handleGoogleConnect}
              disabled={googleBusy}
              data-testid="profile-page-google-btn"
              className="px-4 py-2.5 rounded-xl bg-white hover:bg-slate-100 text-slate-900 font-bold text-xs inline-flex items-center gap-2 shadow-sm transition-colors"
            >
              <GoogleLogoSvg className="w-4 h-4 shrink-0" />
              <span>
                {googleBusy
                  ? lang === 'en'
                    ? 'Connecting...'
                    : 'ਜੁੜ ਰਿਹਾ ਹੈ...'
                  : isGoogleLinked
                  ? lang === 'en'
                    ? 'Sync with Google'
                    : 'ਗੂਗਲ ਨਾਲ ਸਿੰਕ ਕਰੋ'
                  : lang === 'en'
                  ? 'Link with Google'
                  : 'ਗੂਗਲ ਨਾਲ ਲਿੰਕ ਕਰੋ'}
              </span>
            </button>

            <button
              type="button"
              onClick={onExploreServices}
              className="px-4 py-2.5 rounded-xl bg-[#C69C3A] hover:bg-[#D4AD47] text-[#081326] font-bold text-xs inline-flex items-center gap-1.5 shadow-sm transition-colors"
            >
              <span>
                {lang === 'en' ? 'Explore & Click Services' : 'ਸੇਵਾਵਾਂ ਚੁਣੋ (Explore Services)'}
              </span>
            </button>
          </div>
        </div>

        {/* Main 2-Column Layout: Left = Profile Name & Details Form, Right = Clicked Services History */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* Left 7 Cols: Set / Edit Profile Name & Details */}
          <form
            onSubmit={handleSaveProfilePage}
            noValidate
            className="lg:col-span-7 bg-white rounded-2xl border border-slate-200 shadow-sm p-6 sm:p-8 space-y-5"
          >
            <div className="border-b border-slate-200 pb-4">
              <h2 className="text-lg sm:text-xl font-bold text-[#0F213C]">
                {lang === 'en'
                  ? 'Set or Edit Your Profile Name & Details'
                  : 'ਆਪਣੀ ਪ੍ਰੋਫਾਈਲ ਦਾ ਨਾਮ ਅਤੇ ਵੇਰਵੇ ਸੈੱਟ ਕਰੋ'}
              </h2>
              <p className="text-xs text-slate-600 mt-1">
                {lang === 'en'
                  ? 'Your profile name and contact number are automatically attached whenever you click any service on the website.'
                  : 'ਜਦੋਂ ਵੀ ਤੁਸੀਂ ਵੈੱਬਸਾਈਟ ਤੇ ਕਿਸੇ ਸੇਵਾ ਤੇ ਕਲਿੱਕ ਕਰੋਗੇ, ਤੁਹਾਡਾ ਇਹ ਪ੍ਰੋਫਾਈਲ ਨਾਮ ਅਤੇ ਨੰਬਰ ਐਡਮਿਨ ਕੋਲ ਜਾਵੇਗਾ।'}
              </p>
            </div>

            {/* Highlighted Profile Name Field */}
            <div className="p-4 rounded-xl bg-[#FBF6E9] border border-[#C69C3A]/50 space-y-2">
              <label
                htmlFor="profile-page-name-input"
                className="block text-xs font-bold uppercase tracking-wider text-[#0F213C]"
              >
                {lang === 'en'
                  ? 'Your Profile Name (Display Name on Website) *'
                  : 'ਤੁਹਾਡੀ ਪ੍ਰੋਫਾਈਲ ਦਾ ਨਾਮ (Profile Name) *'}
              </label>
              <input
                id="profile-page-name-input"
                data-testid="profile-page-name-input"
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder={
                  lang === 'en'
                    ? 'Enter your full name (e.g., Gurpreet Singh)'
                    : 'ਆਪਣਾ ਪੂਰਾ ਨਾਮ ਲਿਖੋ (ਉਦਾਹਰਨ: ਗੁਰਪ੍ਰੀਤ ਸਿੰਘ)'
                }
                className="w-full px-4 py-2.5 rounded-xl bg-white border-2 border-[#0F213C]/25 text-base font-bold text-[#0F213C] focus:outline-none focus:border-[#0F213C]"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label
                  htmlFor="profile-page-mobile-input"
                  className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1"
                >
                  {lang === 'en' ? 'WhatsApp / Mobile Number *' : 'ਵਟਸਐਪ / ਮੋਬਾਈਲ ਨੰਬਰ *'}
                </label>
                <input
                  id="profile-page-mobile-input"
                  data-testid="profile-page-mobile-input"
                  type="tel"
                  value={mobile}
                  onChange={(e) => setMobile(e.target.value)}
                  placeholder="9876543210"
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-300 text-sm font-tabular text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#0F213C]"
                />
              </div>

              <div>
                <label
                  htmlFor="profile-page-email-input"
                  className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1"
                >
                  {lang === 'en' ? 'Google Email (Gmail)' : 'ਗੂਗਲ ਈਮੇਲ (Gmail)'}
                </label>
                <input
                  id="profile-page-email-input"
                  data-testid="profile-page-email-input"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="yourname@gmail.com"
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-300 text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#0F213C]"
                />
              </div>

              <div>
                <label
                  htmlFor="profile-page-city-input"
                  className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1"
                >
                  {lang === 'en' ? 'City / Village (Punjab)' : 'ਸ਼ਹਿਰ / ਪਿੰਡ'}
                </label>
                <input
                  id="profile-page-city-input"
                  type="text"
                  value={city}
                  onChange={(e) => setCity(e.target.value)}
                  placeholder="Mahilpur, Punjab"
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-300 text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#0F213C]"
                />
              </div>

              <div>
                <label
                  htmlFor="profile-page-occupation-select"
                  className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1"
                >
                  {lang === 'en' ? 'Occupation / Category' : 'ਕਿੱਤਾ / ਸ਼੍ਰੇਣੀ'}
                </label>
                <select
                  id="profile-page-occupation-select"
                  value={occupation}
                  onChange={(e) => setOccupation(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-300 text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#0F213C]"
                >
                  <option value="Salaried / Job">Salaried / Job</option>
                  <option value="Business / Self-Employed">Business / Self-Employed</option>
                  <option value="Agriculture / Farmer">Agriculture / Farmer</option>
                  <option value="Student / Abroad Applicant">Student / Abroad Applicant</option>
                  <option value="Citizen / Family">Citizen / Family</option>
                </select>
              </div>
            </div>

            {error && (
              <p className="text-xs text-red-600 font-semibold" role="alert">
                {error}
              </p>
            )}

            <div className="pt-3 flex flex-wrap items-center justify-between gap-3 border-t border-slate-200">
              <div className="flex flex-wrap items-center gap-2.5">
                <button
                  type="submit"
                  data-testid="profile-page-save-btn"
                  className="px-5 py-3 rounded-xl bg-[#0F213C] hover:bg-[#173056] text-[#E5C158] font-bold text-xs sm:text-sm inline-flex items-center gap-2 shadow-sm transition-all"
                >
                  {savedConfirm ? (
                    <>
                      <AnimatedCheckIcon className="w-4 h-4 text-[#E5C158]" />
                      <span data-testid="profile-page-saved-msg">
                        {lang === 'en'
                          ? 'Profile Name & Details Saved ✓'
                          : 'ਪ੍ਰੋਫਾਈਲ ਨਾਮ ਅਤੇ ਵੇਰਵੇ ਸੇਵ ਹੋ ਗਏ ✓'}
                      </span>
                    </>
                  ) : (
                    <>
                      <UserCheck className="w-4 h-4" />
                      <span>
                        {lang === 'en'
                          ? 'Save Profile Name & Details'
                          : 'ਪ੍ਰੋਫਾਈਲ ਨਾਮ ਅਤੇ ਵੇਰਵੇ ਸੇਵ ਕਰੋ'}
                      </span>
                    </>
                  )}
                </button>

                {userSession && (
                  <button
                    type="button"
                    onClick={() =>
                      onDispatchWork({
                        userName: name || userSession.name,
                        userMobile: mobile || userSession.mobile || 'Google Verified Client',
                        userCity: city || userSession.city,
                        userEmail: email || userSession.email,
                        memberId: userSession.memberId,
                        serviceName: 'Client Profile Verification',
                        workDescription: `Customer ${
                          name || userSession.name
                        } shared their verified profile from the website Profile Page.`,
                        referenceCode: `PRF-${Math.floor(1000 + Math.random() * 9000)}`,
                      })
                    }
                    className="px-4 py-3 rounded-xl bg-[#C69C3A] hover:bg-[#D4AD47] text-[#081326] font-bold text-xs sm:text-sm inline-flex items-center gap-1.5 transition-colors"
                  >
                    <Send className="w-3.5 h-3.5" />
                    <span>
                      {lang === 'en' ? 'Send Profile to Admin' : 'ਐਡਮਿਨ ਨੂੰ ਭੇਜੋ'}
                    </span>
                  </button>
                )}
              </div>

              {userSession && (
                <button
                  type="button"
                  onClick={onSignOut}
                  className="px-3.5 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold inline-flex items-center gap-1.5"
                >
                  <LogOut className="w-3.5 h-3.5" />
                  <span>{lang === 'en' ? 'Sign Out' : 'ਸਾਈਨ ਆਊਟ'}</span>
                </button>
              )}
            </div>
          </form>

          {/* Right 5 Cols: Clicked Services & Work Requests History */}
          <div className="lg:col-span-5 bg-white rounded-2xl border border-slate-200 shadow-sm p-6 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-200 pb-3">
              <div>
                <h3 className="text-base font-bold text-[#0F213C]">
                  {lang === 'en'
                    ? `Your Selected Services (${workHistory.length})`
                    : `ਤੁਹਾਡੇ ਵੱਲੋਂ ਚੁਣੀਆਂ ਸੇਵਾਵਾਂ (${workHistory.length})`}
                </h3>
                <p className="text-xs text-slate-500">
                  {lang === 'en'
                    ? 'Services clicked on the website under your profile'
                    : 'ਤੁਹਾਡੀ ਪ੍ਰੋਫਾਈਲ ਹੇਠ ਚੁਣੇ ਗਏ ਕੰਮ'}
                </p>
              </div>
              <Clock className="w-5 h-5 text-[#C69C3A]" />
            </div>

            {workHistory.length === 0 ? (
              <div className="p-6 rounded-xl bg-slate-50 border border-slate-200 text-center space-y-3">
                <p className="text-xs text-slate-600 leading-relaxed">
                  {lang === 'en'
                    ? 'You have not clicked any service card yet. Save your Profile Name on the left, then browse our 19+ services and click on the work you need done!'
                    : 'ਤੁਸੀਂ ਹਾਲੇ ਕੋਈ ਸੇਵਾ ਨਹੀਂ ਚੁਣੀ। ਆਪਣਾ ਪ੍ਰੋਫਾਈਲ ਨਾਮ ਸੇਵ ਕਰੋ ਅਤੇ ਸੇਵਾਵਾਂ ਵਾਲੇ ਪੰਨੇ ਤੇ ਜਾ ਕੇ ਆਪਣੇ ਕੰਮ ਤੇ ਕਲਿੱਕ ਕਰੋ!'}
                </p>
                <button
                  type="button"
                  onClick={onExploreServices}
                  className="px-4 py-2 rounded-xl bg-[#0F213C] text-[#E5C158] text-xs font-bold"
                >
                  {lang === 'en' ? 'Browse All Services →' : 'ਸਾਰੀਆਂ ਸੇਵਾਵਾਂ ਦੇਖੋ →'}
                </button>
              </div>
            ) : (
              <div className="space-y-2.5 max-h-96 overflow-y-auto pr-1">
                {workHistory.map((item) => (
                  <div
                    key={item.id}
                    className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 flex items-center justify-between gap-3"
                  >
                    <div className="space-y-0.5">
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-bold text-[#0F213C]">
                          {item.serviceName}
                        </span>
                        <span className="px-2 py-0.5 rounded bg-[#FBF6E9] border border-[#E2C87D] text-[#8A6619] font-tabular text-[10px] font-bold">
                          {item.referenceCode}
                        </span>
                      </div>
                      <p className="text-xs text-slate-600 line-clamp-2">{item.workDescription}</p>
                      <div className="text-[11px] text-slate-400 font-tabular">
                        {item.createdAt}
                      </div>
                    </div>

                    <button
                      type="button"
                      onClick={() =>
                        onDispatchWork({
                          userName: name || userSession?.name || 'M Bee Client',
                          userMobile: mobile || userSession?.mobile || 'Google Verified Client',
                          userCity: city || userSession?.city,
                          userEmail: email || userSession?.email,
                          memberId: userSession?.memberId,
                          serviceName: item.serviceName,
                          workDescription: item.workDescription,
                          referenceCode: item.referenceCode,
                        })
                      }
                      className="px-3 py-1.5 rounded-lg bg-[#0F213C] hover:bg-[#173056] text-[#E5C158] text-xs font-bold whitespace-nowrap shrink-0 inline-flex items-center gap-1"
                    >
                      <MessageCircle className="w-3.5 h-3.5" />
                      <span>WhatsApp</span>
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Dedicated UI Section: Submitted Documents Status Tracker (Pending, Processing, Completed) */}
        <div
          id="submitted-documents-status-section"
          data-testid="submitted-documents-status-section"
          className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 sm:p-8 space-y-6"
        >
          {/* Section Header & Status Summary Counters */}
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-200 pb-5">
            <div className="space-y-1">
              <div className="inline-flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-[#9A7422]">
                <FileCheck2 className="w-4 h-4 text-[#0F213C]" />
                <span>
                  {lang === 'en'
                    ? 'Admin Document Verification · Baljinder Singh & Manpreet Singh'
                    : 'ਐਡਮਿਨ ਦਸਤਾਵੇਜ਼ ਸਥਿਤੀ · ਬਲਜਿੰਦਰ ਸਿੰਘ ਅਤੇ ਮਨਪ੍ਰੀਤ ਸਿੰਘ'}
                </span>
              </div>
              <h2 className="text-xl sm:text-2xl font-bold text-[#0F213C]">
                {lang === 'en'
                  ? 'Submitted Documents Status Tracker'
                  : 'ਜਮ੍ਹਾਂ ਕਰਵਾਏ ਦਸਤਾਵੇਜ਼ਾਂ ਦੀ ਸਥਿਤੀ (Document Status)'}
              </h2>
              <p className="text-xs sm:text-sm text-slate-600">
                {lang === 'en'
                  ? 'Track the live verification status of documents submitted to Admin (Pending, Processing, Completed) or log a new document below.'
                  : 'ਐਡਮਿਨ ਕੋਲ ਜਮ੍ਹਾਂ ਕਰਵਾਏ ਆਪਣੇ ਦਸਤਾਵੇਜ਼ਾਂ ਦੀ ਸਥਿਤੀ (Pending, Processing, Completed) ਇੱਥੇ ਚੈੱਕ ਕਰੋ।'}
              </p>
            </div>

            {/* Status Summary Badges Row */}
            <div className="flex flex-wrap items-center gap-2 shrink-0">
              <div
                data-testid="summary-badge-pending"
                className="px-3 py-1.5 rounded-xl bg-amber-50 border border-amber-200 text-amber-900 text-xs font-bold flex items-center gap-1.5"
              >
                <span className="w-2 h-2 rounded-full bg-amber-500" />
                <span>Pending: {pendingCount}</span>
              </div>
              <div
                data-testid="summary-badge-processing"
                className="px-3 py-1.5 rounded-xl bg-blue-50 border border-blue-200 text-blue-900 text-xs font-bold flex items-center gap-1.5"
              >
                <span className="w-2 h-2 rounded-full bg-blue-600 animate-pulse" />
                <span>Processing: {processingCount}</span>
              </div>
              <div
                data-testid="summary-badge-completed"
                className="px-3 py-1.5 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-900 text-xs font-bold flex items-center gap-1.5"
              >
                <span className="w-2 h-2 rounded-full bg-emerald-600" />
                <span>Completed: {completedCount}</span>
              </div>
            </div>
          </div>

          {/* Submit / Log New Document Form */}
          <form
            onSubmit={handleAddSubmittedDocument}
            data-testid="submit-document-form"
            className="p-4 sm:p-5 rounded-xl bg-slate-50 border border-slate-200/90 space-y-4"
          >
            <div className="text-xs font-bold uppercase tracking-wider text-[#0F213C] flex items-center justify-between">
              <span>
                {lang === 'en'
                  ? 'Submit / Log a Document for Admin Review'
                  : 'ਐਡਮਿਨ ਜਾਂਚ ਲਈ ਨਵਾਂ ਦਸਤਾਵੇਜ਼ ਦਰਜ ਕਰੋ'}
              </span>
              {docAddedConfirm && (
                <span
                  data-testid="doc-submitted-confirm"
                  className="text-emerald-700 font-bold inline-flex items-center gap-1"
                >
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  <span>
                    {lang === 'en'
                      ? 'Document Added (Status: Pending) ✓'
                      : 'ਦਸਤਾਵੇਜ਼ ਦਰਜ ਹੋ ਗਿਆ (Pending) ✓'}
                  </span>
                </span>
              )}
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-12 gap-3 items-end">
              <div className="sm:col-span-4">
                <label
                  htmlFor="submit-doc-name-input"
                  className="block text-[11px] font-bold uppercase text-slate-700 mb-1"
                >
                  {lang === 'en' ? 'Document Name *' : 'ਦਸਤਾਵੇਜ਼ ਦਾ ਨਾਮ *'}
                </label>
                <input
                  id="submit-doc-name-input"
                  data-testid="submit-doc-name-input"
                  type="text"
                  required
                  value={newDocName}
                  onChange={(e) => setNewDocName(e.target.value)}
                  placeholder={
                    lang === 'en'
                      ? 'e.g., Passport File & Birth Certificate'
                      : 'ਉਦਾਹਰਨ: ਪਾਸਪੋਰਟ ਫਾਈਲ ਜਾਂ ਪੈਨ ਕਾਰਡ'
                  }
                  className="w-full px-3.5 py-2 rounded-xl bg-white border border-slate-300 text-xs sm:text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#0F213C]"
                />
              </div>

              <div className="sm:col-span-3">
                <label
                  htmlFor="submit-doc-category-select"
                  className="block text-[11px] font-bold uppercase text-slate-700 mb-1"
                >
                  {lang === 'en' ? 'Service Desk' : 'ਸੇਵਾ ਵਿਭਾਗ'}
                </label>
                <select
                  id="submit-doc-category-select"
                  data-testid="submit-doc-category-select"
                  value={newDocCategory}
                  onChange={(e) => setNewDocCategory(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-white border border-slate-300 text-xs sm:text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#0F213C]"
                >
                  <option value="Aadhaar / PAN / Passport">Aadhaar / PAN / Passport</option>
                  <option value="Loan File & Income Proof">Loan File &amp; Income Proof</option>
                  <option value="Motor / Health Insurance">Motor / Health Insurance</option>
                  <option value="Property & Land Record">Property &amp; Land Record</option>
                  <option value="Birth / Caste / Residence">Birth / Caste / Residence</option>
                </select>
              </div>

              <div className="sm:col-span-3">
                <label
                  htmlFor="submit-doc-notes-input"
                  className="block text-[11px] font-bold uppercase text-slate-700 mb-1"
                >
                  {lang === 'en' ? 'Remarks / Note for Admin' : 'ਵੇਰਵਾ / ਨੋਟ'}
                </label>
                <input
                  id="submit-doc-notes-input"
                  data-testid="submit-doc-notes-input"
                  type="text"
                  value={newDocRemarks}
                  onChange={(e) => setNewDocRemarks(e.target.value)}
                  placeholder={
                    lang === 'en'
                      ? 'e.g., Submitted at Mahilpur desk'
                      : 'ਉਦਾਹਰਨ: ਦਫ਼ਤਰ ਵਿੱਚ ਜਮ੍ਹਾਂ ਕਰਵਾਏ'
                  }
                  className="w-full px-3.5 py-2 rounded-xl bg-white border border-slate-300 text-xs sm:text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#0F213C]"
                />
              </div>

              <div className="sm:col-span-2">
                <button
                  type="submit"
                  data-testid="submit-doc-btn"
                  className="w-full py-2.5 px-3 rounded-xl bg-[#0F213C] hover:bg-[#173056] text-[#E5C158] font-bold text-xs inline-flex items-center justify-center gap-1.5 shadow-xs transition-colors whitespace-nowrap"
                >
                  <PlusCircle className="w-3.5 h-3.5 shrink-0" />
                  <span>{lang === 'en' ? 'Add Document' : 'ਦਸਤਾਵੇਜ਼ ਜੋੜੋ'}</span>
                </button>
              </div>
            </div>
          </form>

          {/* Filter Tabs: All / Pending / Processing / Completed */}
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div
              role="tablist"
              aria-label="Filter submitted documents by status"
              className="inline-flex flex-wrap items-center gap-1.5 p-1 rounded-xl bg-slate-100 border border-slate-200"
            >
              {(['All', 'Pending', 'Processing', 'Completed'] as const).map((statusTab) => (
                <button
                  key={statusTab}
                  type="button"
                  role="tab"
                  aria-selected={docFilter === statusTab}
                  data-testid={`filter-doc-status-${statusTab.toLowerCase()}`}
                  onClick={() => setDocFilter(statusTab)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-colors ${
                    docFilter === statusTab
                      ? 'bg-[#0F213C] text-[#E5C158] shadow-xs'
                      : 'text-slate-700 hover:text-slate-900'
                  }`}
                >
                  {statusTab === 'All'
                    ? lang === 'en'
                      ? `All (${submittedDocs.length})`
                      : `ਸਾਰੇ (${submittedDocs.length})`
                    : statusTab}
                </button>
              ))}
            </div>

            <div className="text-xs text-slate-500">
              {lang === 'en'
                ? 'Status Badges: Pending · Processing · Completed'
                : 'ਸਥਿਤੀ ਬੈਜ: Pending · Processing · Completed'}
            </div>
          </div>

          {/* Submitted Documents List with Simple Status Badges */}
          <div className="space-y-3" data-testid="submitted-documents-list">
            {filteredDocs.map((docItem) => (
              <div
                key={docItem.id}
                data-testid={`submitted-doc-card-${docItem.id}`}
                className="p-4 rounded-xl bg-slate-50 hover:bg-slate-100/70 border border-slate-200 transition-colors flex flex-col sm:flex-row sm:items-center justify-between gap-4"
              >
                <div className="flex items-start gap-3">
                  <div className="w-10 h-10 rounded-xl bg-[#0F213C] text-[#E5C158] flex items-center justify-center shrink-0 mt-0.5">
                    <FileText className="w-5 h-5" />
                  </div>
                  <div className="space-y-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <h3 className="text-sm sm:text-base font-bold text-[#0F213C]">
                        {docItem.documentName}
                      </h3>
                      <span className="px-2 py-0.5 rounded bg-white border border-slate-200 text-slate-600 font-tabular text-[11px] font-semibold">
                        {docItem.referenceNo}
                      </span>
                    </div>
                    <div className="text-xs font-medium text-[#8A6619]">
                      {docItem.serviceCategory} ·{' '}
                      <span className="text-slate-500 font-tabular">
                        {lang === 'en' ? 'Submitted:' : 'ਮਿਤੀ:'} {docItem.submittedAt}
                      </span>
                    </div>
                    {docItem.remarks && (
                      <p className="text-xs text-slate-600 leading-relaxed">{docItem.remarks}</p>
                    )}
                  </div>
                </div>

                {/* Right Side: Simple Status Badge (Pending, Processing, Completed) + Status Selector + WhatsApp Admin */}
                <div className="flex flex-wrap items-center gap-2.5 shrink-0 sm:justify-end">
                  {/* Simple Status Badge */}
                  <span
                    data-testid="document-status-badge"
                    data-status={docItem.status}
                    className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full border text-xs font-bold ${getStatusBadgeClasses(
                      docItem.status
                    )}`}
                  >
                    <span
                      className={`w-2 h-2 rounded-full ${getStatusDotClasses(docItem.status)}`}
                    />
                    <span data-testid={`doc-status-badge-${docItem.status.toLowerCase()}`}>
                      {getStatusLabel(docItem.status)}
                    </span>
                  </span>

                  {/* Quick Status Selector to update/verify status */}
                  <select
                    aria-label={`Update status for ${docItem.documentName}`}
                    data-testid={`doc-status-select-${docItem.id}`}
                    value={docItem.status}
                    onChange={(e) =>
                      handleStatusChange(docItem.id, e.target.value as DocumentStatus)
                    }
                    className="px-2.5 py-1.5 rounded-lg bg-white border border-slate-300 text-xs font-semibold text-slate-800 focus:outline-none focus:ring-2 focus:ring-[#0F213C]"
                  >
                    <option value="Pending">Pending</option>
                    <option value="Processing">Processing</option>
                    <option value="Completed">Completed</option>
                  </select>

                  <button
                    type="button"
                    onClick={() =>
                      onDispatchWork({
                        userName: name || userSession?.name || 'M Bee Client',
                        userMobile: mobile || userSession?.mobile || 'Google Verified Client',
                        userCity: city || userSession?.city,
                        userEmail: email || userSession?.email,
                        memberId: userSession?.memberId,
                        serviceName: `Document Status: ${docItem.documentName}`,
                        workDescription: `Checking status for document "${docItem.documentName}" (${docItem.referenceNo}) — Current Status: ${docItem.status}.`,
                        referenceCode: docItem.referenceNo,
                      })
                    }
                    className="px-3 py-1.5 rounded-lg bg-[#0F213C] hover:bg-[#173056] text-[#E5C158] text-xs font-bold inline-flex items-center gap-1 whitespace-nowrap"
                  >
                    <MessageCircle className="w-3.5 h-3.5" />
                    <span>{lang === 'en' ? 'Ask Admin' : 'ਐਡਮਿਨ ਨੂੰ ਪੁੱਛੋ'}</span>
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

/**
 * Google-Style Top-Right Account Profile Popover Card (`GoogleStyleProfilePopover`).
 * Opens when the user clicks their First-Letter Circular Avatar in the top navigation bar.
 * Displays the user's First-Letter Avatar Circle, "Hi, [Name]!", "Manage your Profile & Name" pill button,
 * complete saved Profile Data table (Full Name, Mobile, Gmail, City, Occupation, Member ID, Clicked Services),
 * and quick Edit / Sign Out actions—modeled directly after Google's Account Popover.
 */
export function GoogleStyleProfilePopover({
  isOpen,
  userSession,
  lang,
  onClose,
  onOpenProfilePage,
  onOpenProfileModal,
  onDispatchWork,
  onSignOut,
}: {
  isOpen: boolean;
  userSession: UserSession | null;
  lang: Language;
  onClose: () => void;
  onOpenProfilePage: () => void;
  onOpenProfileModal: () => void;
  onDispatchWork: (payload: AdminNotificationPayload) => void;
  onSignOut: () => void;
}) {
  if (!isOpen || !userSession) return null;

  const firstLetter = getUserFirstLetter(userSession.name);
  const workCount = userSession.workHistory?.length || 0;
  const topIdentifier =
    userSession.email ||
    (userSession.mobile ? `+91 ${userSession.mobile}` : userSession.memberId || 'M Bee Account');

  return (
    <div
      data-testid="google-style-profile-popover"
      role="dialog"
      aria-label="User Profile Account Data"
      className="absolute right-4 sm:right-6 lg:right-8 top-full mt-2 z-50 w-[340px] sm:w-[380px] rounded-3xl bg-[#111F38] text-white border border-[#C69C3A]/45 shadow-2xl p-4 space-y-4"
    >
      {/* Top Row: Email / Mobile Identifier + Close Button (Google Account Header Style) */}
      <div className="flex items-center justify-between gap-2 px-2 pt-0.5">
        <div className="flex items-center gap-1.5 min-w-0 flex-1 justify-center pl-6">
          <span className="w-4 h-4 rounded-full bg-white flex items-center justify-center shrink-0">
            <GoogleLogoSvg className="w-3 h-3" />
          </span>
          <span
            data-testid="popover-account-identifier"
            className="text-xs font-medium text-slate-200 truncate"
          >
            {topIdentifier}
          </span>
        </div>
        <button
          type="button"
          onClick={onClose}
          data-testid="close-profile-popover-btn"
          aria-label="Close profile popover"
          className="p-1.5 rounded-full text-slate-300 hover:text-white hover:bg-white/10 transition-colors shrink-0"
        >
          <X className="w-4 h-4" />
        </button>
      </div>

      {/* Center Section: Large First-Letter Avatar Circle + "Hi, Name!" + "Manage your Profile" Pill */}
      <div className="flex flex-col items-center text-center space-y-2.5 pt-1">
        <div className="relative">
          {/* Google-style multi-color / gold ring around the First-Letter Avatar */}
          <div className="p-0.5 rounded-full bg-gradient-to-tr from-[#4285F4] via-[#34A853] to-[#FBBC05] shadow-lg">
            <div
              data-testid="popover-large-first-letter"
              className="w-16 h-16 rounded-full bg-[#C69C3A] text-[#081326] font-extrabold text-3xl flex items-center justify-center border-2 border-[#081326] select-none"
            >
              {firstLetter}
            </div>
          </div>
          <button
            type="button"
            onClick={() => {
              onClose();
              onOpenProfilePage();
            }}
            title={lang === 'en' ? 'Change Profile Name' : 'ਪ੍ਰੋਫਾਈਲ ਨਾਮ ਬਦਲੋ'}
            className="absolute -bottom-0.5 -right-0.5 w-6 h-6 rounded-full bg-white text-[#081326] border border-slate-300 shadow-xs flex items-center justify-center hover:bg-slate-100"
          >
            <User className="w-3.5 h-3.5" />
          </button>
        </div>

        <div>
          <h3
            data-testid="popover-greeting-name"
            className="text-lg font-bold text-white tracking-tight"
          >
            {lang === 'en'
              ? `Hi, ${userSession.name}!`
              : `ਸਤ ਸ੍ਰੀ ਅਕਾਲ, ${userSession.name}!`}
          </h3>
          <p className="text-[11px] text-[#E5C158] font-medium">
            {userSession.memberId || 'MBE-CLIENT'} · {userSession.city || 'Mahilpur, Punjab'}
          </p>
        </div>

        {/* Google-style Pill Button: "Manage your Profile & Name" */}
        <button
          type="button"
          data-testid="popover-manage-profile-btn"
          onClick={() => {
            onClose();
            onOpenProfilePage();
          }}
          className="px-5 py-2 rounded-full bg-transparent hover:bg-white/10 text-[#E5C158] border border-[#C69C3A]/60 text-xs font-bold transition-colors"
        >
          {lang === 'en'
            ? 'Manage your Profile & Name'
            : 'ਆਪਣੀ ਪ੍ਰੋਫਾਈਲ ਅਤੇ ਨਾਮ ਮੈਨੇਜ ਕਰੋ'}
        </button>
      </div>

      {/* Inner Rounded Card: Complete User Profile Data */}
      <div
        data-testid="popover-profile-data-card"
        className="rounded-2xl bg-[#081326] border border-white/10 p-3.5 space-y-2.5 text-xs"
      >
        <div className="flex items-center justify-between border-b border-white/10 pb-1.5">
          <span className="text-[11px] font-bold uppercase tracking-wider text-[#E5C158]">
            {lang === 'en' ? 'Your Saved Profile Data' : 'ਤੁਹਾਡੀ ਪ੍ਰੋਫਾਈਲ ਦਾ ਪੂਰਾ ਡਾਟਾ'}
          </span>
          <span className="px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 text-[10px] font-bold">
            {lang === 'en' ? 'Active' : 'ਐਕਟਿਵ'}
          </span>
        </div>

        <div className="space-y-1.5">
          <div className="flex items-center justify-between gap-2">
            <span className="text-slate-400">
              {lang === 'en' ? 'Full Name:' : 'ਪੂਰਾ ਨਾਮ:'}
            </span>
            <span
              data-testid="popover-data-fullname"
              className="font-bold text-white text-right truncate max-w-[190px]"
            >
              {userSession.name}
            </span>
          </div>

          <div className="flex items-center justify-between gap-2">
            <span className="text-slate-400">
              {lang === 'en' ? 'Mobile / WhatsApp:' : 'ਮੋਬਾਈਲ ਨੰਬਰ:'}
            </span>
            <span
              data-testid="popover-data-mobile"
              className="font-bold text-[#E5C158] font-tabular text-right"
            >
              {userSession.mobile ? `+91 ${userSession.mobile}` : 'Not added'}
            </span>
          </div>

          <div className="flex items-center justify-between gap-2">
            <span className="text-slate-400">
              {lang === 'en' ? 'Google Email:' : 'ਗੂਗਲ ਈਮੇਲ:'}
            </span>
            <span
              data-testid="popover-data-email"
              className="font-medium text-slate-200 text-right truncate max-w-[190px]"
            >
              {userSession.email || (lang === 'en' ? 'Not added' : 'ਦਰਜ ਨਹੀਂ')}
            </span>
          </div>

          <div className="flex items-center justify-between gap-2">
            <span className="text-slate-400">
              {lang === 'en' ? 'City / Village:' : 'ਸ਼ਹਿਰ / ਪਿੰਡ:'}
            </span>
            <span
              data-testid="popover-data-city"
              className="font-medium text-slate-200 text-right truncate max-w-[190px]"
            >
              {userSession.city || 'Mahilpur, Punjab'}
            </span>
          </div>

          <div className="flex items-center justify-between gap-2">
            <span className="text-slate-400">
              {lang === 'en' ? 'Category:' : 'ਕਿੱਤਾ / ਸ਼੍ਰੇਣੀ:'}
            </span>
            <span
              data-testid="popover-data-occupation"
              className="font-medium text-slate-200 text-right"
            >
              {userSession.occupation || 'Citizen / Family'}
            </span>
          </div>

          <div className="flex items-center justify-between gap-2 pt-1 border-t border-white/10">
            <span className="text-slate-400">
              {lang === 'en' ? 'Clicked Services:' : 'ਚੁਣੇ ਗਏ ਕੰਮ:'}
            </span>
            <span className="font-bold text-[#E5C158] font-tabular">
              {workCount} {lang === 'en' ? 'Requests' : 'ਕੰਮ'}
            </span>
          </div>
        </div>
      </div>

      {/* Google-Style Split Action Buttons Row */}
      <div className="grid grid-cols-2 gap-1.5">
        <button
          type="button"
          data-testid="popover-edit-modal-btn"
          onClick={() => {
            onClose();
            onOpenProfileModal();
          }}
          className="py-2.5 px-3 rounded-l-2xl rounded-r-md bg-[#081326] hover:bg-[#0D1E3A] text-slate-100 border border-white/10 text-xs font-bold flex items-center justify-center gap-1.5 transition-colors"
        >
          <UserCheck className="w-3.5 h-3.5 text-[#E5C158]" />
          <span>{lang === 'en' ? 'Edit Profile' : 'ਪ੍ਰੋਫਾਈਲ ਐਡਿਟ'}</span>
        </button>

        <button
          type="button"
          data-testid="sign-out-btn"
          onClick={() => {
            onClose();
            onSignOut();
          }}
          className="py-2.5 px-3 rounded-r-2xl rounded-l-md bg-[#081326] hover:bg-[#0D1E3A] text-slate-100 border border-white/10 text-xs font-bold flex items-center justify-center gap-1.5 transition-colors"
        >
          <LogOut className="w-3.5 h-3.5 text-[#E5C158]" />
          <span>{lang === 'en' ? 'Sign Out' : 'ਸਾਈਨ ਆਊਟ'}</span>
        </button>
      </div>

      {/* Direct Send Profile to Admin Button */}
      <button
        type="button"
        data-testid="popover-send-admin-btn"
        onClick={() => {
          onClose();
          onDispatchWork({
            userName: userSession.name,
            userMobile: userSession.mobile || 'Google Verified Client',
            userCity: userSession.city,
            userEmail: userSession.email,
            memberId: userSession.memberId,
            serviceName: 'Client Profile Verification',
            workDescription: `Customer ${userSession.name} shared their profile data with Admin.`,
            referenceCode: `PRF-${Math.floor(1000 + Math.random() * 9000)}`,
          });
        }}
        className="w-full py-2 px-3 rounded-xl bg-[#C69C3A] hover:bg-[#D4AD47] text-[#081326] font-bold text-xs flex items-center justify-center gap-1.5 shadow-xs transition-colors"
      >
        <Send className="w-3.5 h-3.5" />
        <span>
          {lang === 'en'
            ? 'Send My Profile Data to Admin WhatsApp'
            : 'ਆਪਣੀ ਪ੍ਰੋਫਾਈਲ ਐਡਮਿਨ ਦੇ ਵਟਸਐਪ ਤੇ ਭੇਜੋ'}
        </span>
      </button>
    </div>
  );
}


