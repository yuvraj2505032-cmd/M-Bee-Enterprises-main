/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  PhoneCall,
  MessageCircle,
  ArrowRight,
  ArrowLeft,
  Home,
  ChevronDown,
  ShieldCheck,
  CheckCircle2,
  ArrowUp,
  Menu,
  X,
  Globe,
  FileCheck2,
  Briefcase,
  Building2,
  LogIn,
  LogOut,
  UserCheck,
  UserPlus,
  User,
  Send,
  Search,
} from 'lucide-react';
import {
  Language,
  PageId,
  ServiceCategoryId,
  ServiceItem,
  SERVICES_CATALOG,
  CATEGORY_LABELS,
  UI_TEXT,
} from './data/translations';
import {
  PRIMARY_PHONE,
  SECONDARY_PHONE,
  PRIMARY_WHATSAPP,
  BUSINESS_EMAIL,
  buildWhatsAppUrl,
  UserSession,
  AdminNotificationPayload,
  getUserInitials,
  getUserFirstLetter,
  createSubmittedDocumentItem,
  getDefaultSubmittedDocuments,
  filterServicesBySearchQuery,
} from './utils/loanCalculator';
import { MBMonogramLogo, ShopVisualShowcase } from './components/BrandVisuals';
import { LoanCalculator } from './components/LoanCalculator';
import { ServiceCard, ServiceDetailModal } from './components/ServiceCardAndModal';
import {
  InsuranceSection,
  TestimonialsAndFaqSection,
  ContactSection,
} from './components/InsuranceAndContact';
import {
  UserSignInModal,
  UserProfileModal,
  GoogleStyleProfilePopover,
  AdminDispatchModal,
  AdminControlPanelModal,
  CustomerProfilePage,
  AnimatedCheckIcon,
  GoogleLogoSvg,
  saveProfileToRegistry,
  loadCustomServices,
  STORAGE_KEY_CUSTOM_SERVICES,
  STORAGE_KEY_ADMIN_ANNOUNCEMENT,
} from './components/UserAuthAndAdminDispatch';
import {
  auth,
  onAuthStateChanged,
  firebaseSignOut,
  fetchUserProfileFromFirestore,
  saveUserProfileToFirestore,
} from './firebase';
import { buildGoogleUserProfile } from './utils/loanCalculator';
import { SmartServiceAdvisor } from './components/SmartServiceAdvisor';
import {
  syncUserProfileAcrossClouds,
  fetchServicesFromBackend,
  syncCustomServicesWithBackend,
  syncAnnouncementWithBackend,
  fetchAnnouncementFromBackend,
  submitEnquiryToBackend,
} from './utils/cloudIntegrations';

const STORAGE_KEY_USER_SESSION = 'mbee_user_session_v1';

export default function App() {
  const [lang, setLang] = useState<Language>('en');
  const [activePage, setActivePage] = useState<PageId>('home');
  const [pageHistory, setPageHistory] = useState<PageId[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<ServiceCategoryId | 'all'>('all');
  const [serviceSearchQuery, setServiceSearchQuery] = useState<string>('');
  const [modalService, setModalService] = useState<ServiceItem | null>(null);
  const [mobileMenuOpen, setMobileMenuOpen] = useState<boolean>(false);
  const [showBackToTop, setShowBackToTop] = useState<boolean>(false);
  const [userSession, setUserSession] = useState<UserSession | null>(null);
  const [signInModalOpen, setSignInModalOpen] = useState<boolean>(false);
  const [signInInitialMode, setSignInInitialMode] = useState<'signin' | 'register'>('signin');
  const [profileModalOpen, setProfileModalOpen] = useState<boolean>(false);
  const [profilePopoverOpen, setProfilePopoverOpen] = useState<boolean>(false);
  const [adminModalOpen, setAdminModalOpen] = useState<boolean>(false);
  const [customServices, setCustomServices] = useState<ServiceItem[]>([]);
  const [adminAnnouncement, setAdminAnnouncement] = useState<string>('');
  const [pendingServiceClick, setPendingServiceClick] = useState<string | null>(null);
  const [adminDispatchPayload, setAdminDispatchPayload] =
    useState<AdminNotificationPayload | null>(null);
  const [quickTaskText, setQuickTaskText] = useState<string>('');
  const [quickSendConfirmed, setQuickSendConfirmed] = useState<boolean>(false);
  const [backendSyncedServices, setBackendSyncedServices] = useState<ServiceItem[] | null>(null);

  const t = UI_TEXT[lang];

  useEffect(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY_USER_SESSION);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (parsed && parsed.name) {
          setUserSession(parsed);
        }
      }
      const loadedCustom = loadCustomServices();
      setCustomServices(loadedCustom);
      if (loadedCustom.length > 0) {
        void syncCustomServicesWithBackend(loadedCustom);
      }
      const savedNotice = localStorage.getItem(STORAGE_KEY_ADMIN_ANNOUNCEMENT);
      if (savedNotice) {
        setAdminAnnouncement(savedNotice);
        void syncAnnouncementWithBackend(savedNotice);
      } else {
        void fetchAnnouncementFromBackend().then((serverNotice) => {
          if (serverNotice) {
            setAdminAnnouncement(serverNotice);
          }
        });
      }
    } catch {
      // ignore storage errors
    }

    const unsubscribe = onAuthStateChanged(auth, async (fbUser) => {
      if (fbUser) {
        const firestoreProfile = await fetchUserProfileFromFirestore(fbUser.uid);
        let localExisting: UserSession | null = null;
        try {
          const raw = localStorage.getItem(STORAGE_KEY_USER_SESSION);
          if (raw) localExisting = JSON.parse(raw);
        } catch {
          // ignore
        }
        const merged = buildGoogleUserProfile(fbUser, firestoreProfile || localExisting);
        setUserSession(merged);
        saveProfileToRegistry(merged);
        try {
          localStorage.setItem(STORAGE_KEY_USER_SESSION, JSON.stringify(merged));
        } catch {
          // ignore
        }
        if (!firestoreProfile) {
          await saveUserProfileToFirestore(merged);
        }
      }
    });

    return () => unsubscribe();
  }, []);

  useEffect(() => {
    let active = true;
    void fetchServicesFromBackend<ServiceItem>({
      query: serviceSearchQuery,
      category: selectedCategory,
      page: activePage,
    }).then((res) => {
      if (active && res && Array.isArray(res.services)) {
        setBackendSyncedServices(res.services);
      }
    });
    return () => {
      active = false;
    };
  }, [serviceSearchQuery, selectedCategory, activePage, customServices]);

  const handleUpdateCustomServices = (updated: ServiceItem[]) => {
    setCustomServices(updated);
    void syncCustomServicesWithBackend(updated);
    try {
      localStorage.setItem(STORAGE_KEY_CUSTOM_SERVICES, JSON.stringify(updated));
    } catch {
      // ignore
    }
  };

  const handleUpdateAnnouncement = (text: string) => {
    setAdminAnnouncement(text);
    void syncAnnouncementWithBackend(text);
    try {
      localStorage.setItem(STORAGE_KEY_ADMIN_ANNOUNCEMENT, text);
    } catch {
      // ignore
    }
  };

  const dispatchWorkForUser = (
    session: UserSession,
    serviceTitle: string,
    customDescription?: string
  ) => {
    const refCode = `WRK-${Math.floor(1000 + Math.random() * 9000)}`;
    const workDescription =
      customDescription ||
      (lang === 'en'
        ? `Customer ${session.name} explored the website and clicked on "${serviceTitle}" to get this work done.`
        : `ਗਾਹਕ ${session.name} ਨੇ ਵੈੱਬਸਾਈਟ ਤੇ "${serviceTitle}" ਤੇ ਕਲਿੱਕ ਕਰਕੇ ਇਹ ਕੰਮ ਕਰਵਾਉਣ ਦੀ ਬੇਨਤੀ ਕੀਤੀ ਹੈ।`);
    const nowTime = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

    const existingDocs =
      session.submittedDocuments && session.submittedDocuments.length > 0
        ? session.submittedDocuments
        : getDefaultSubmittedDocuments();
    const newDocEntry = createSubmittedDocumentItem(
      `${serviceTitle} Documents`,
      serviceTitle,
      'Pending',
      workDescription
    );

    const updatedSession: UserSession = {
      ...session,
      workHistory: [
        {
          id: Date.now().toString(),
          referenceCode: refCode,
          serviceName: serviceTitle,
          workDescription,
          createdAt: nowTime,
        },
        ...(session.workHistory || []),
      ].slice(0, 10),
      submittedDocuments: [newDocEntry, ...existingDocs].slice(0, 20),
    };
    setUserSession(updatedSession);
    saveProfileToRegistry(updatedSession);
    if (updatedSession.uid || auth.currentUser?.uid) {
      void saveUserProfileToFirestore(updatedSession);
    } else {
      void syncUserProfileAcrossClouds(updatedSession);
    }
    try {
      localStorage.setItem(STORAGE_KEY_USER_SESSION, JSON.stringify(updatedSession));
    } catch {
      // ignore
    }

    const dispatchPayload: AdminNotificationPayload = {
      userName: session.name,
      userMobile: session.mobile || 'Google Verified Client',
      userCity: session.city,
      userEmail: session.email,
      memberId: session.memberId,
      serviceName: serviceTitle,
      workDescription,
      referenceCode: refCode,
    };
    void submitEnquiryToBackend(dispatchPayload);
    setAdminDispatchPayload(dispatchPayload);
  };

  const handleSignInSuccess = (
    session: UserSession,
    initialWorkRequest?: AdminNotificationPayload
  ) => {
    setUserSession(session);
    void syncUserProfileAcrossClouds(session);
    try {
      localStorage.setItem(STORAGE_KEY_USER_SESSION, JSON.stringify(session));
    } catch {
      // ignore
    }
    if (pendingServiceClick) {
      const targetSrv = pendingServiceClick;
      setPendingServiceClick(null);
      dispatchWorkForUser(session, targetSrv);
    } else if (initialWorkRequest) {
      void submitEnquiryToBackend(initialWorkRequest);
      setAdminDispatchPayload(initialWorkRequest);
    }
  };

  const handleSignOut = () => {
    void firebaseSignOut(auth);
    setUserSession(null);
    try {
      localStorage.removeItem(STORAGE_KEY_USER_SESSION);
    } catch {
      // ignore
    }
  };

  const handleUpdateUserProfile = (updated: UserSession) => {
    setUserSession(updated);
    void syncUserProfileAcrossClouds(updated);
    try {
      localStorage.setItem(STORAGE_KEY_USER_SESSION, JSON.stringify(updated));
    } catch {
      // ignore
    }
  };

  const handleSelectServiceWork = (service: ServiceItem) => {
    if (userSession) {
      dispatchWorkForUser(userSession, service.title.en);
    } else {
      setPendingServiceClick(service.title.en);
      setSignInInitialMode('signin');
      setSignInModalOpen(true);
    }
  };

  const handleQuickWorkSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!userSession) return;
    const label = quickTaskText.trim() || 'General Consultation / Service Work';
    setQuickSendConfirmed(true);
    setTimeout(() => {
      setQuickSendConfirmed(false);
    }, 2600);
    dispatchWorkForUser(
      userSession,
      label,
      quickTaskText.trim() || `Customer ${userSession.name} requested assistance.`
    );
    setQuickTaskText('');
  };

  // Dynamic SEO page title update based on active page & language
  useEffect(() => {
    const pageTitles: Record<PageId, string> = {
      home: 'M Bee Enterprises – Financial & Documentation Services in Punjab',
      about: 'About Us – M Bee Enterprises | Prop. Baljinder Singh & Manpreet Singh',
      services: 'All Services – M Bee Enterprises | Financial, Documentation & Property',
      loans: 'Loan Consultancy & EMI Calculator – M Bee Enterprises',
      insurance: 'Insurance Consultation & Policy Renewal – M Bee Enterprises',
      documentation: 'Aadhaar, PAN, Passport & Citizen Documentation – M Bee Enterprises',
      property: 'Property Advisor & Real Estate Consultancy – M Bee Enterprises',
      contact: 'Contact Us – M Bee Enterprises | 82888-37597, 99156-28427',
      profile: 'My Profile & Document Status – M Bee Enterprises | Client Portal',
    };
    document.title = pageTitles[activePage] || pageTitles.home;
  }, [activePage]);

  useEffect(() => {
    const onScroll = () => {
      setShowBackToTop(window.scrollY > 450);
    };
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  useEffect(() => {
    const onPopState = (event: PopStateEvent) => {
      const targetPage = (event.state?.page as PageId) || 'home';
      setActivePage(targetPage);
      setPageHistory((prev) => prev.slice(0, -1));
      setMobileMenuOpen(false);
    };
    window.addEventListener('popstate', onPopState);
    return () => window.removeEventListener('popstate', onPopState);
  }, []);

  const previousPage: PageId =
    pageHistory.length > 0 ? pageHistory[pageHistory.length - 1] : 'home';

  const navigateToPage = (page: PageId, categoryFilter?: ServiceCategoryId | 'all') => {
    // If clicking the already-active non-home page in navigation, return to previous page / home
    if (page === activePage && activePage !== 'home' && !categoryFilter) {
      const fallback = pageHistory.length > 0 ? pageHistory[pageHistory.length - 1] : 'home';
      setPageHistory((prev) => prev.slice(0, -1));
      setActivePage(fallback);
      setMobileMenuOpen(false);
      window.scrollTo({ top: 0, behavior: 'smooth' });
      return;
    }

    if (page !== activePage) {
      setPageHistory((prev) => [...prev, activePage]);
      try {
        window.history.pushState({ page }, '', `#${page}`);
      } catch {
        // ignore history error in restricted iframe
      }
    }
    setActivePage(page);
    if (categoryFilter) {
      setSelectedCategory(categoryFilter);
    }
    setMobileMenuOpen(false);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const goBackToPreviousPage = () => {
    const target = pageHistory.length > 0 ? pageHistory[pageHistory.length - 1] : 'home';
    setPageHistory((prev) => prev.slice(0, -1));
    setActivePage(target);
    setMobileMenuOpen(false);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const scrollToEnquiry = (serviceName?: string, customNote?: string) => {
    if (userSession) {
      dispatchWorkForUser(
        userSession,
        serviceName || 'Financial & Documentation Service',
        customNote
      );
    } else {
      if (serviceName) setPendingServiceClick(serviceName);
      setSignInInitialMode('signin');
      setSignInModalOpen(true);
    }
  };

  const allServicesCombined = useMemo(
    () => [...customServices, ...SERVICES_CATALOG],
    [customServices]
  );

  const filteredServices = useMemo(() => {
    let baseList = allServicesCombined;
    if (activePage === 'loans') {
      baseList = allServicesCombined.filter((s) => s.categoryId === 'financial');
    } else if (activePage === 'documentation') {
      baseList = allServicesCombined.filter(
        (s) => s.categoryId === 'documentation' || s.categoryId === 'digital'
      );
    } else if (activePage === 'property') {
      baseList = allServicesCombined.filter((s) => s.categoryId === 'property');
    } else if (selectedCategory !== 'all') {
      baseList = allServicesCombined.filter((s) => s.categoryId === selectedCategory);
    }
    const localFiltered = filterServicesBySearchQuery(baseList, serviceSearchQuery);
    if (backendSyncedServices && backendSyncedServices.length === localFiltered.length) {
      return backendSyncedServices;
    }
    return localFiltered;
  }, [activePage, selectedCategory, allServicesCombined, serviceSearchQuery, backendSyncedServices]);

  const allPagesList: Array<{ id: PageId; label: string }> = [
    { id: 'home', label: t.nav.home },
    { id: 'about', label: t.nav.about },
    { id: 'services', label: t.nav.services },
    { id: 'loans', label: t.nav.loans },
    { id: 'insurance', label: t.nav.insurance },
    { id: 'documentation', label: t.nav.documentation },
    { id: 'property', label: t.nav.property },
    { id: 'contact', label: t.nav.contact },
    { id: 'profile', label: t.nav.profile },
  ];

  const getPageLabel = (id: PageId): string => {
    return allPagesList.find((item) => item.id === id)?.label || t.nav.home;
  };

  return (
    <div className="min-h-screen flex flex-col bg-slate-50 text-slate-900">
      {/* Top Header Bar: Brand Logo + Back Button (when on sub-page) + Profile Page + Sign In + Admin + Vertical 3-Lines Menu (☰) */}
      <header className="sticky top-0 z-40 bg-[#081326] text-white border-b border-white/10 shadow-md relative">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-3">
          {/* Left: Brand Logo + Wordmark + Quick Back Button when on subpage */}
          <div className="flex items-center gap-2.5 shrink-0">
            <a
              href="#top"
              onClick={(e) => {
                e.preventDefault();
                navigateToPage('home', 'all');
              }}
              className="inline-flex items-center gap-2.5 text-lg font-bold tracking-tight text-white whitespace-nowrap shrink-0"
            >
              <MBMonogramLogo size="sm" />
              <span>
                M Bee <span className="text-[#E5C158]">Enterprises</span>
              </span>
            </a>

            {activePage !== 'home' && (
              <button
                type="button"
                onClick={goBackToPreviousPage}
                data-testid="header-back-prev-btn"
                className="hidden md:inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-[#0F213C] hover:bg-[#173056] text-[#E5C158] border border-[#C69C3A]/40 text-xs font-bold transition-colors whitespace-nowrap"
                title={
                  lang === 'en'
                    ? `Return to ${getPageLabel(previousPage)}`
                    : `ਵਾਪਸ ਜਾਓ (${getPageLabel(previousPage)})`
                }
              >
                <ArrowLeft className="w-3.5 h-3.5" />
                <span>
                  {lang === 'en'
                    ? `Back: ${getPageLabel(previousPage)}`
                    : `ਵਾਪਸ: ${getPageLabel(previousPage)}`}
                </span>
              </button>
            )}
          </div>

          {/* Right: Language Switcher + Dedicated Profile Page Button + Sign In + Admin + Vertical 3-Lines Menu Button (☰) */}
          <div className="flex items-center gap-1.5 sm:gap-2 shrink-0">
            {/* Language Switcher (English / ਪੰਜਾਬੀ) */}
            <div
              role="group"
              aria-label="Language Switcher"
              className="inline-flex items-center rounded-lg bg-[#071124] p-0.5 border border-white/15"
            >
              <Globe className="hidden sm:inline w-3.5 h-3.5 text-[#E5C158] ml-2 mr-1" />
              <button
                type="button"
                onClick={() => setLang('en')}
                data-testid="lang-btn-en"
                className={`px-2 sm:px-2.5 py-1 rounded-md text-xs font-semibold transition-colors whitespace-nowrap shrink-0 ${
                  lang === 'en'
                    ? 'bg-[#C69C3A] text-slate-950'
                    : 'text-slate-300 hover:text-white'
                }`}
              >
                English
              </button>
              <button
                type="button"
                onClick={() => setLang('pa')}
                data-testid="lang-btn-pa"
                className={`px-2 sm:px-2.5 py-1 rounded-md text-xs font-semibold transition-colors whitespace-nowrap shrink-0 ${
                  lang === 'pa'
                    ? 'bg-[#C69C3A] text-slate-950'
                    : 'text-slate-300 hover:text-white'
                }`}
              >
                ਪੰਜਾਬੀ
              </button>
            </div>

            {/* Customer Profile / Sign In:
                - After profile is created (`userSession` exists): DO NOT show full name in top bar; show ONLY a Google-style Circular First-Letter Avatar button (`getUserFirstLetter(userSession.name)`). Clicking it opens the Google-Style Account Profile Data Popover.
                - Before profile is created (`!userSession`): Show Profile Setup button & Sign In button. */}
            {userSession ? (
              <button
                type="button"
                onClick={() => {
                  setMobileMenuOpen(false);
                  setProfilePopoverOpen((prev) => !prev);
                }}
                data-testid="header-first-letter-avatar-btn"
                aria-expanded={profilePopoverOpen}
                aria-label={`Open profile data (${getUserFirstLetter(userSession.name)})`}
                title={
                  lang === 'en'
                    ? 'Click to view your Profile Data (Google Account style)'
                    : 'ਆਪਣੀ ਪ੍ਰੋਫਾਈਲ ਦਾ ਡਾਟਾ ਦੇਖਣ ਲਈ ਕਲਿੱਕ ਕਰੋ'
                }
                className="relative p-0.5 rounded-full bg-gradient-to-tr from-[#4285F4] via-[#34A853] to-[#FBBC05] hover:scale-105 transition-transform shadow-md shrink-0 cursor-pointer"
              >
                <span
                  data-testid="header-first-letter-circle"
                  className="w-8 h-8 rounded-full bg-[#C69C3A] text-[#081326] font-extrabold text-sm flex items-center justify-center border-2 border-[#081326] select-none"
                >
                  {getUserFirstLetter(userSession.name)}
                </span>
                <span className="absolute -bottom-0.5 -right-0.5 w-3.5 h-3.5 rounded-full bg-white flex items-center justify-center shadow-xs">
                  <GoogleLogoSvg className="w-2.5 h-2.5" />
                </span>
              </button>
            ) : (
              <>
                <button
                  type="button"
                  onClick={() => navigateToPage('profile')}
                  data-testid="header-profile-page-btn"
                  className={`px-2.5 py-1.5 rounded-lg text-xs font-bold inline-flex items-center gap-1.5 transition-colors whitespace-nowrap shrink-0 border ${
                    activePage === 'profile'
                      ? 'bg-[#C69C3A] text-[#081326] border-[#E5C158]'
                      : 'bg-[#0F213C] hover:bg-[#173056] text-[#E5C158] border-[#C69C3A]/40'
                  }`}
                  title={
                    lang === 'en'
                      ? 'Open Profile & Set Name Page'
                      : 'ਪ੍ਰੋਫਾਈਲ ਅਤੇ ਨਾਮ ਵਾਲਾ ਪੰਨਾ ਖੋਲ੍ਹੋ'
                  }
                >
                  <User className="w-3.5 h-3.5" />
                  <span className="hidden sm:inline">
                    {lang === 'en' ? 'Profile' : 'ਪ੍ਰੋਫਾਈਲ'}
                  </span>
                </button>

                <button
                  type="button"
                  onClick={() => {
                    setSignInInitialMode('signin');
                    setSignInModalOpen(true);
                  }}
                  data-testid="sign-in-btn"
                  className="px-3 py-1.5 rounded-lg bg-[#C69C3A] hover:bg-[#D4AD47] text-[#081326] text-xs font-bold inline-flex items-center gap-1.5 transition-colors whitespace-nowrap shrink-0 shadow-xs"
                >
                  <span className="w-4 h-4 rounded-full bg-white flex items-center justify-center shrink-0">
                    <GoogleLogoSvg className="w-3 h-3" />
                  </span>
                  <span>{lang === 'en' ? 'Sign In' : 'ਸਾਈਨ ਇਨ'}</span>
                </button>
              </>
            )}

            {/* Admin Panel Button */}
            <button
              type="button"
              onClick={() => setAdminModalOpen(true)}
              data-testid="open-admin-btn"
              className="px-2.5 py-1.5 rounded-lg bg-white/10 hover:bg-white/15 text-[#E5C158] border border-white/15 text-xs font-semibold inline-flex items-center gap-1 transition-colors whitespace-nowrap shrink-0"
              title="Admin Control Panel"
            >
              <ShieldCheck className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">{lang === 'en' ? 'Admin' : 'ਐਡਮਿਨ'}</span>
            </button>

            {/* 3-Lines Navigation Menu Button (☰) — Opens Vertical Downward Navigation Directory */}
            <button
              type="button"
              data-testid="three-lines-menu-btn"
              onClick={() => {
                setProfilePopoverOpen(false);
                setMobileMenuOpen(!mobileMenuOpen);
              }}
              aria-expanded={mobileMenuOpen}
              aria-label="Open vertical navigation directory"
              className="px-3 py-1.5 rounded-lg bg-[#0F213C] hover:bg-[#173056] text-white border border-[#C69C3A]/50 text-xs font-bold inline-flex items-center gap-1.5 transition-colors whitespace-nowrap shrink-0"
            >
              {mobileMenuOpen ? (
                <X className="w-4 h-4 text-[#E5C158]" />
              ) : (
                <Menu className="w-4 h-4 text-[#E5C158]" />
              )}
              <span>{lang === 'en' ? 'Menu' : 'ਮੇਨੂ'}</span>
              <ChevronDown
                className={`w-3.5 h-3.5 text-[#E5C158] transition-transform duration-200 ${
                  mobileMenuOpen ? 'rotate-180' : ''
                }`}
              />
            </button>
          </div>
        </div>

        {/* Google-Style Account Profile Data Popover (Opens when clicking the First-Letter Avatar Circle) */}
        <GoogleStyleProfilePopover
          isOpen={profilePopoverOpen}
          userSession={userSession}
          lang={lang}
          onClose={() => setProfilePopoverOpen(false)}
          onOpenProfilePage={() => navigateToPage('profile')}
          onOpenProfileModal={() => setProfileModalOpen(true)}
          onDispatchWork={(payload) => {
            void submitEnquiryToBackend(payload);
            setAdminDispatchPayload(payload);
          }}
          onSignOut={() => {
            setProfilePopoverOpen(false);
            handleSignOut();
          }}
        />

        {/* Vertical Downward Navigation Directory Dropdown (Stacked Top-to-Bottom) */}
        {mobileMenuOpen && (
          <div
            data-testid="three-lines-menu-drawer"
            className="absolute inset-x-0 top-full z-50 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex justify-end pointer-events-none"
          >
            <div className="pointer-events-auto w-full sm:w-96 bg-[#0B1933] border border-[#C69C3A]/40 rounded-b-2xl shadow-2xl p-4 space-y-3 max-h-[82vh] overflow-y-auto">
              <div className="flex items-center justify-between border-b border-white/10 pb-2">
                <span className="text-xs font-bold uppercase tracking-wider text-[#E5C158]">
                  {lang === 'en'
                    ? '↓ Website Navigation Directory'
                    : '↓ ਵੈੱਬਸਾਈਟ ਦੇ ਸਾਰੇ ਪੰਨੇ (Directory)'}
                </span>
                <span className="text-[11px] text-slate-400">Mahilpur (146105)</span>
              </div>

              {/* Quick Return to Previous Page / Home inside the vertical directory when on a sub-page */}
              {activePage !== 'home' && (
                <div className="grid grid-cols-2 gap-2 pb-2 border-b border-white/10">
                  <button
                    type="button"
                    data-testid="menu-back-prev-btn"
                    onClick={goBackToPreviousPage}
                    className="px-3 py-2 rounded-xl bg-[#162F54] hover:bg-[#1E3E6D] text-[#E5C158] border border-[#C69C3A]/40 text-xs font-bold flex items-center justify-center gap-1.5 transition-colors"
                  >
                    <ArrowLeft className="w-3.5 h-3.5 shrink-0" />
                    <span className="truncate">
                      {lang === 'en'
                        ? `Back (${getPageLabel(previousPage)})`
                        : `ਪਿਛਲਾ ਪੰਨਾ (${getPageLabel(previousPage)})`}
                    </span>
                  </button>
                  <button
                    type="button"
                    data-testid="menu-back-home-btn"
                    onClick={() => navigateToPage('home', 'all')}
                    className="px-3 py-2 rounded-xl bg-white/10 hover:bg-white/15 text-white text-xs font-bold flex items-center justify-center gap-1.5 transition-colors"
                  >
                    <Home className="w-3.5 h-3.5 text-[#E5C158] shrink-0" />
                    <span>{lang === 'en' ? 'Home Page' : 'ਮੁੱਖ ਪੰਨਾ'}</span>
                  </button>
                </div>
              )}

              {/* Vertical Top-to-Bottom Stacked Directory List */}
              <div
                role="navigation"
                aria-label="Main Website Pages"
                data-testid="vertical-navigation-list"
                className="flex flex-col gap-1.5"
              >
                {allPagesList.map((p, idx) => (
                  <button
                    key={p.id}
                    type="button"
                    data-testid={`menu-nav-${p.id}`}
                    onClick={() => navigateToPage(p.id)}
                    className={`w-full px-3.5 py-2.5 rounded-xl text-left text-xs font-bold flex items-center justify-between transition-all ${
                      activePage === p.id
                        ? 'bg-[#C69C3A] text-[#081326] shadow-xs'
                        : 'bg-[#0F213C] hover:bg-[#162F54] text-slate-100 border border-white/10'
                    }`}
                  >
                    <span className="flex items-center gap-2.5">
                      <span
                        className={`text-[10px] font-tabular px-1.5 py-0.5 rounded ${
                          activePage === p.id
                            ? 'bg-[#081326]/15 text-[#081326]'
                            : 'bg-white/10 text-[#E5C158]'
                        }`}
                      >
                        0{idx + 1}
                      </span>
                      <span>{p.label}</span>
                    </span>
                    <ArrowRight className="w-3.5 h-3.5 opacity-80 shrink-0" />
                  </button>
                ))}
              </div>

              <div className="pt-2 border-t border-white/10 flex flex-col gap-2">
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => {
                      setMobileMenuOpen(false);
                      setSignInInitialMode('signin');
                      setSignInModalOpen(true);
                    }}
                    className="px-3 py-2 rounded-lg bg-white/10 hover:bg-white/15 text-[#E5C158] text-xs font-semibold inline-flex items-center justify-center gap-1.5"
                  >
                    <LogIn className="w-3.5 h-3.5" />
                    <span>
                      {lang === 'en' ? 'Sign In / Google' : 'ਸਾਈਨ-ਇਨ / ਗੂਗਲ'}
                    </span>
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setMobileMenuOpen(false);
                      setAdminModalOpen(true);
                    }}
                    className="px-3 py-2 rounded-lg bg-white/10 hover:bg-white/15 text-slate-200 text-xs font-semibold inline-flex items-center justify-center gap-1.5"
                  >
                    <ShieldCheck className="w-3.5 h-3.5 text-[#E5C158]" />
                    <span>{lang === 'en' ? 'Admin Panel' : 'ਐਡਮਿਨ ਪੈਨਲ'}</span>
                  </button>
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <a
                    href="tel:+918288837597"
                    className="py-2 px-3 rounded-lg bg-white/10 text-[#E5C158] text-xs font-bold font-tabular text-center"
                  >
                    Call {PRIMARY_PHONE}
                  </a>
                  <a
                    href={buildWhatsAppUrl(
                      'Hello M Bee Enterprises, I need assistance with your services.',
                      PRIMARY_WHATSAPP
                    )}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="py-2 px-3 rounded-lg bg-[#C69C3A] text-[#081326] text-xs font-bold text-center"
                  >
                    WhatsApp
                  </a>
                </div>
              </div>
            </div>
          </div>
        )}
      </header>

      {/* Admin Announcement Banner (if posted by Admin) */}
      {adminAnnouncement && (
        <div
          data-testid="admin-announcement-banner"
          className="bg-[#C69C3A] text-[#081326] py-2 px-4 text-xs font-bold text-center border-b border-[#081326]/15"
        >
          📢 {adminAnnouncement}
        </div>
      )}

      {/* Signed-In Quick Work Request Bar (Shows First-Letter Avatar Badge instead of Full Name in Top Bar) */}
      {userSession && (
        <div
          data-testid="signed-in-work-bar"
          className="bg-[#071124] border-b border-white/10 py-2.5 px-4 sm:px-6 lg:px-8 text-white"
        >
          <form
            onSubmit={handleQuickWorkSubmit}
            className="max-w-7xl mx-auto flex flex-wrap items-center justify-between gap-2.5"
          >
            <div className="text-xs text-slate-200 font-medium flex flex-wrap items-center gap-2">
              <button
                type="button"
                onClick={() => setProfilePopoverOpen((prev) => !prev)}
                className="w-6 h-6 rounded-full bg-[#C69C3A] text-[#081326] font-extrabold text-xs flex items-center justify-center shrink-0 hover:scale-105 transition-transform"
                title={
                  lang === 'en'
                    ? 'Click to view your Profile Data'
                    : 'ਆਪਣੀ ਪ੍ਰੋਫਾਈਲ ਦਾ ਡਾਟਾ ਦੇਖੋ'
                }
              >
                {getUserFirstLetter(userSession.name)}
              </button>
              <span>
                {lang === 'en'
                  ? 'Signed In — Explore the website & click any service below, or write your work here:'
                  : 'ਸਾਈਨ-ਇਨ ਐਕਟਿਵ — ਹੇਠਾਂ ਕਿਸੇ ਵੀ ਸੇਵਾ ਤੇ ਕਲਿੱਕ ਕਰੋ ਜਾਂ ਆਪਣਾ ਕੰਮ ਲਿਖੋ:'}
              </span>
            </div>
            <div className="flex flex-wrap items-center gap-2 flex-1 max-w-xl">
              <input
                type="text"
                value={quickTaskText}
                onChange={(e) => setQuickTaskText(e.target.value)}
                placeholder={
                  lang === 'en'
                    ? 'Or write custom work note for Admin (82888-37597)...'
                    : 'ਜਾਂ ਆਪਣੇ ਕੰਮ ਦਾ ਵੇਰਵਾ ਇੱਥੇ ਲਿਖੋ...'
                }
                className="flex-1 min-w-[180px] px-3 py-1.5 rounded-lg bg-[#0D1E3A] border border-white/15 text-white text-xs placeholder:text-slate-400"
              />
              <button
                type="submit"
                data-testid="quick-work-send-btn"
                className={`px-3.5 py-1.5 rounded-lg font-bold text-xs inline-flex items-center gap-1.5 whitespace-nowrap shrink-0 transition-all duration-300 ${
                  quickSendConfirmed
                    ? 'bg-[#E5C158] text-[#081326] ring-2 ring-[#E5C158]/50 shadow-sm'
                    : 'bg-[#C69C3A] hover:bg-[#D4AD47] text-slate-950'
                }`}
              >
                {quickSendConfirmed ? (
                  <>
                    <AnimatedCheckIcon className="w-4 h-4 text-[#081326]" />
                    <span data-testid="quick-work-confirmed-text">
                      {lang === 'en' ? 'Request Sent ✓' : 'ਮੈਸੇਜ ਭੇਜਿਆ ਗਿਆ ✓'}
                    </span>
                  </>
                ) : (
                  <>
                    <Send className="w-3.5 h-3.5" />
                    <span>
                      {lang === 'en' ? 'Send to Admin' : 'ਐਡਮਿਨ ਨੂੰ ਭੇਜੋ'}
                    </span>
                  </>
                )}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Main Content */}
      <main className="flex-1">
        {/* Sub-page Return Bar: Whenever any navigation page is opened, allow 1-click return to the exact Previous Page or Home Page */}
        {activePage !== 'home' && (
          <div
            data-testid="page-back-navigation-bar"
            className="bg-[#0F213C] text-white border-b border-[#C69C3A]/35 py-3 px-4 sm:px-6 lg:px-8 shadow-xs"
          >
            <div className="max-w-7xl mx-auto flex flex-wrap items-center justify-between gap-3">
              <div className="flex flex-wrap items-center gap-2">
                <button
                  type="button"
                  onClick={goBackToPreviousPage}
                  data-testid="back-to-prev-page-btn"
                  className="px-3.5 py-1.5 rounded-xl bg-[#C69C3A] hover:bg-[#D4AD47] text-[#081326] text-xs font-bold inline-flex items-center gap-1.5 shadow-xs transition-colors"
                >
                  <ArrowLeft className="w-3.5 h-3.5" />
                  <span>
                    {lang === 'en'
                      ? `Back to Previous Page (${getPageLabel(previousPage)})`
                      : `ਪਿਛਲੇ ਪੰਨੇ ਤੇ ਵਾਪਸ ਜਾਓ (${getPageLabel(previousPage)})`}
                  </span>
                </button>

                <button
                  type="button"
                  onClick={() => navigateToPage('home', 'all')}
                  data-testid="back-to-home-page-btn"
                  className="px-3.5 py-1.5 rounded-xl bg-white/10 hover:bg-white/15 text-[#E5C158] border border-white/15 text-xs font-bold inline-flex items-center gap-1.5 transition-colors"
                >
                  <Home className="w-3.5 h-3.5" />
                  <span>
                    {lang === 'en' ? 'Open Home Page' : 'ਮੁੱਖ ਪੰਨਾ (Home) ਖੋਲ੍ਹੋ'}
                  </span>
                </button>
              </div>

              <div className="text-xs text-slate-300 flex items-center gap-2">
                <span className="text-slate-400">
                  {lang === 'en' ? 'Current Page:' : 'ਮੌਜੂਦਾ ਪੰਨਾ:'}
                </span>
                <span className="px-2.5 py-0.5 rounded-md bg-white/10 text-[#E5C158] font-bold">
                  {getPageLabel(activePage)}
                </span>
              </div>
            </div>
          </div>
        )}

        {/* DEDICATED CUSTOMER PROFILE & NAME PAGE (`activePage === 'profile'`) */}
        {activePage === 'profile' && (
          <CustomerProfilePage
            userSession={userSession}
            lang={lang}
            onSaveSession={(updated) => handleUpdateUserProfile(updated)}
            onDispatchWork={(payload) => {
              void submitEnquiryToBackend(payload);
              setAdminDispatchPayload(payload);
            }}
            onSignOut={handleSignOut}
            onExploreServices={() => navigateToPage('services', 'all')}
          />
        )}

        {/* HOME PAGE OR PAGE HEADER */}
        {activePage === 'home' && (
          <>
            {/* 1. PREMIUM HERO SECTION */}
            <section className="relative bg-gradient-to-b from-[#081326] via-[#0B1B36] to-[#0F2344] text-white py-12 lg:py-16 border-b border-white/10 overflow-hidden">
              <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-center">
                  {/* Left 6 Cols: Brand Identity, Main Heading & Primary CTAs */}
                  <div className="lg:col-span-6 space-y-6">
                    <div className="flex items-center gap-3">
                      <MBMonogramLogo size="md" />
                      <div className="text-xs sm:text-sm font-medium text-[#E5C158]">
                        {t.hero.kicker}
                      </div>
                    </div>

                    <h1
                      data-testid="hero-main-heading"
                      className="text-3xl sm:text-5xl font-bold tracking-tight text-white leading-[1.15] text-balance"
                    >
                      {t.hero.heading}
                    </h1>

                    <p className="text-lg sm:text-xl font-medium text-[#E5C158]">
                      {t.hero.subheading}
                    </p>

                    <p className="text-sm sm:text-base text-slate-300 leading-relaxed max-w-xl">
                      {t.hero.description}
                    </p>

                    {/* Primary & Secondary Action Buttons */}
                    <div className="flex flex-wrap items-center gap-3 pt-2">
                      <button
                        type="button"
                        onClick={() => scrollToEnquiry()}
                        className="px-5 py-3 rounded-xl bg-[#C69C3A] hover:bg-[#D4AD47] text-slate-950 font-bold text-sm inline-flex items-center gap-2 shadow-lg transition-colors whitespace-nowrap shrink-0"
                      >
                        <span>{t.hero.getStarted}</span>
                        <ArrowRight className="w-4 h-4" />
                      </button>

                      <button
                        type="button"
                        onClick={() => {
                          const el = document.getElementById('our-services');
                          if (el) el.scrollIntoView({ behavior: 'smooth' });
                        }}
                        className="px-5 py-3 rounded-xl bg-white/10 hover:bg-white/15 text-white font-semibold text-sm border border-white/15 transition-colors whitespace-nowrap shrink-0"
                      >
                        {t.hero.exploreServices}
                      </button>

                      <a
                        href="tel:+918288837597"
                        className="px-4 py-3 rounded-xl bg-white/5 hover:bg-white/10 text-slate-100 font-semibold text-sm inline-flex items-center gap-2 border border-white/15 transition-colors whitespace-nowrap shrink-0"
                      >
                        <PhoneCall className="w-4 h-4 text-[#E5C158]" />
                        <span>
                          {t.hero.callNow}: {PRIMARY_PHONE}
                        </span>
                      </a>

                      <a
                        href={buildWhatsAppUrl(
                          'Hello M Bee Enterprises (Prop. Baljinder Singh & Manpreet Singh), I visited your website and would like to enquire about your services.',
                          PRIMARY_WHATSAPP
                        )}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="px-4 py-3 rounded-xl bg-white/5 hover:bg-white/10 text-slate-100 font-semibold text-sm inline-flex items-center gap-2 border border-[#C69C3A]/40 transition-colors whitespace-nowrap shrink-0"
                      >
                        <MessageCircle className="w-4 h-4 text-[#E5C158]" />
                        <span>{t.hero.whatsappBtn}</span>
                      </a>
                    </div>
                  </div>

                  {/* Right 6 Cols: Real Shop Signboard & Visual Showcase */}
                  <div className="lg:col-span-6">
                    <ShopVisualShowcase lang={lang} />
                  </div>
                </div>

                {/* Full-Width 4-Column Business Highlights Row Below Hero Split */}
                <div className="mt-12 pt-8 border-t border-white/10 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                  {t.highlights.map((item, idx) => (
                    <div
                      key={idx}
                      className="p-5 rounded-xl bg-[#071124]/90 border border-white/10 space-y-1"
                    >
                      <div className="text-xl font-bold text-[#E5C158] font-tabular">
                        {item.value}
                      </div>
                      <div className="text-sm font-bold text-white">{item.label}</div>
                      <p className="text-xs text-slate-300 leading-relaxed">{item.detail}</p>
                    </div>
                  ))}
                </div>
              </div>
            </section>
          </>
        )}

        {/* DEDICATED ABOUT US VIEW OR HOME ABOUT PREVIEW */}
        {(activePage === 'about' || activePage === 'home') && (
          <section
            id="about-us"
            aria-labelledby="about-heading"
            className="py-16 bg-white border-b border-slate-200"
          >
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-center">
                <div className="lg:col-span-7 space-y-5">
                  <div className="text-xs font-semibold uppercase tracking-wider text-blue-900">
                    {t.proprietorLabel} · {t.locationTag}
                  </div>
                  <h2
                    id="about-heading"
                    className="text-3xl sm:text-4xl font-bold text-slate-900 tracking-tight"
                  >
                    {t.aboutSection.heading}
                  </h2>
                  <p className="text-base sm:text-lg font-medium text-slate-800 leading-relaxed">
                    {t.aboutSection.description}
                  </p>
                  <p className="text-sm sm:text-base text-slate-600 leading-relaxed">
                    {t.aboutSection.storyParagraph}
                  </p>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-2">
                    {t.aboutSection.values.map((val, idx) => (
                      <div
                        key={idx}
                        className="p-4 rounded-xl bg-slate-50 border border-slate-200/90 space-y-1.5"
                      >
                        <div className="text-xs font-tabular font-bold text-blue-900">
                          0{idx + 1}.
                        </div>
                        <h3 className="text-sm font-bold text-slate-900">{val.title}</h3>
                        <p className="text-xs text-slate-600 leading-relaxed">{val.desc}</p>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="lg:col-span-5">
                  {activePage === 'about' ? (
                    <ShopVisualShowcase lang={lang} />
                  ) : (
                    <div className="rounded-2xl bg-[#0B1E47] text-white p-6 sm:p-8 border border-amber-400/40 shadow-xl space-y-5">
                      <div className="flex items-center gap-4">
                        <MBMonogramLogo size="lg" />
                        <div>
                          <div className="text-xs uppercase tracking-wider text-amber-300 font-semibold">
                            Proprietor &amp; Leadership Profile
                          </div>
                          <h3
                            data-testid="proprietor-names-heading"
                            className="text-xl sm:text-2xl font-bold text-white"
                          >
                            Baljinder Singh &amp; Manpreet Singh
                          </h3>
                          <p className="text-xs text-slate-300">
                            Proprietors, M Bee Enterprises (ਬਲਜਿੰਦਰ ਸਿੰਘ ਅਤੇ ਮਨਪ੍ਰੀਤ ਸਿੰਘ)
                          </p>
                        </div>
                      </div>
                      <p className="text-sm text-slate-200 leading-relaxed">
                        {lang === 'en'
                          ? 'Committed to providing clear, ethical, and accessible assistance for financial consultancy, insurance policies, citizen documentation, and property deals across Punjab.'
                          : 'ਪੰਜਾਬ ਦੇ ਨਾਗਰਿਕਾਂ ਅਤੇ ਕਾਰੋਬਾਰੀਆਂ ਨੂੰ ਵਿੱਤੀ ਸਲਾਹ, ਬੀਮਾ, ਦਸਤਾਵੇਜ਼ ਅਤੇ ਪ੍ਰਾਪਰਟੀ ਸੇਵਾਵਾਂ ਪੂਰੀ ਇਮਾਨਦਾਰੀ ਅਤੇ ਸਰਲ ਤਰੀਕੇ ਨਾਲ ਮੁਹੱਈਆ ਕਰਵਾਉਣ ਲਈ ਵਚਨਬੱਧ।'}
                      </p>
                      <div className="pt-3 border-t border-white/15 space-y-2 text-xs font-tabular">
                        <div className="flex items-center justify-between">
                          <span className="text-slate-400">Primary Mobile:</span>
                          <a
                            href="tel:+918288837597"
                            className="text-amber-300 font-bold hover:underline"
                          >
                            +91 {PRIMARY_PHONE}
                          </a>
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="text-slate-400">Alternate Mobile:</span>
                          <a
                            href="tel:+919915628427"
                            className="text-amber-300 font-bold hover:underline"
                          >
                            +91 {SECONDARY_PHONE}
                          </a>
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="text-slate-400">Official Email:</span>
                          <a
                            href={`mailto:${BUSINESS_EMAIL}`}
                            className="text-white hover:text-[#E5C158]"
                          >
                            {BUSINESS_EMAIL}
                          </a>
                        </div>
                        <div className="pt-1.5 border-t border-white/10 text-[11px] text-[#E5C158] font-sans">
                          📍 M Bee Enterprises, Bank of Baroda, near Bus Stand, near Mahilpur, Mahilpur, Punjab 146105
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </section>
        )}

        {/* OUR SERVICES SECTION (Shown on Home, All Services, Loan Services, Documentation, Property Advisor) */}
        {(activePage === 'home' ||
          activePage === 'services' ||
          activePage === 'loans' ||
          activePage === 'documentation' ||
          activePage === 'property') && (
          <section
            id="our-services"
            aria-labelledby="services-heading"
            className="py-16 bg-slate-50"
          >
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
              <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
                <div className="max-w-2xl">
                  <div className="text-xs font-semibold uppercase tracking-wider text-blue-900 mb-2">
                    M Bee Enterprises · 19 Specialized Services
                  </div>
                  <h2
                    id="services-heading"
                    className="text-3xl sm:text-4xl font-bold text-slate-900 tracking-tight"
                  >
                    {activePage === 'loans'
                      ? lang === 'en'
                        ? 'Financial & Loan Consultancy Services'
                        : 'ਵਿੱਤੀ ਅਤੇ ਲੋਨ ਸਲਾਹਕਾਰ ਸੇਵਾਵਾਂ'
                      : activePage === 'documentation'
                      ? lang === 'en'
                        ? 'Documentation & Digital Citizen Services'
                        : 'ਦਸਤਾਵੇਜ਼ ਅਤੇ ਡਿਜੀਟਲ ਨਾਗਰਿਕ ਸੇਵਾਵਾਂ'
                      : activePage === 'property'
                      ? lang === 'en'
                        ? 'Property Advisor & Real Estate Consultancy'
                        : 'ਪ੍ਰਾਪਰਟੀ ਸਲਾਹਕਾਰ ਅਤੇ ਕੰਸਲਟੈਂਸੀ ਸੇਵਾਵਾਂ'
                      : t.servicesSection.heading}
                  </h2>
                  <p className="mt-2 text-slate-600 text-sm sm:text-base">
                    {t.servicesSection.subheading}
                  </p>
                </div>

                {/* Category Filter Tabs (Interactive Filter Controls) */}
                {(activePage === 'home' || activePage === 'services') && (
                  <div
                    role="tablist"
                    aria-label="Filter services by category"
                    className="flex flex-wrap items-center gap-1.5 p-1.5 bg-slate-200/80 rounded-xl"
                  >
                    <button
                      type="button"
                      role="tab"
                      aria-selected={selectedCategory === 'all'}
                      onClick={() => setSelectedCategory('all')}
                      className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-colors whitespace-nowrap shrink-0 ${
                        selectedCategory === 'all'
                          ? 'bg-[#0B1E47] text-amber-300 shadow-xs'
                          : 'text-slate-700 hover:text-slate-950'
                      }`}
                    >
                      {t.servicesSection.allCategories} (19)
                    </button>
                    {(
                      ['documentation', 'financial', 'property', 'digital'] as ServiceCategoryId[]
                    ).map((catId) => (
                      <button
                        key={catId}
                        type="button"
                        role="tab"
                        aria-selected={selectedCategory === catId}
                        onClick={() => setSelectedCategory(catId)}
                        className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-colors whitespace-nowrap shrink-0 ${
                          selectedCategory === catId
                            ? 'bg-[#0B1E47] text-amber-300 shadow-xs'
                            : 'text-slate-700 hover:text-slate-950'
                        }`}
                      >
                        {CATEGORY_LABELS[catId][lang]}
                      </button>
                    ))}
                  </div>
                )}
              </div>

              {/* Real-Time Text Search Bar for Filtering Services */}
              <div className="bg-white p-3.5 sm:p-4 rounded-xl border border-slate-200 shadow-xs flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
                <div className="relative flex-1">
                  <label htmlFor="services-search-input" className="sr-only">
                    {lang === 'en'
                      ? 'Search services by name, document, or keyword'
                      : 'ਸੇਵਾ ਦਾ ਨਾਮ ਜਾਂ ਦਸਤਾਵੇਜ਼ ਲਿਖ ਕੇ ਖੋਜੋ'}
                  </label>
                  <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                  <input
                    id="services-search-input"
                    data-testid="services-search-input"
                    type="search"
                    value={serviceSearchQuery}
                    onChange={(e) => setServiceSearchQuery(e.target.value)}
                    placeholder={
                      lang === 'en'
                        ? 'Search services in real-time (e.g., Passport, Aadhaar, PAN, Home Loan, Insurance, Property)...'
                        : 'ਸੇਵਾਵਾਂ ਖੋਜੋ (ਉਦਾਹਰਨ: ਪਾਸਪੋਰਟ, ਆਧਾਰ ਕਾਰਡ, ਪੈਨ ਕਾਰਡ, ਹੋਮ ਲੋਨ, ਬੀਮਾ, ਪ੍ਰਾਪਰਟੀ)...'
                    }
                    className="w-full pl-10 pr-24 py-2.5 rounded-lg bg-slate-50 border border-slate-300 text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-[#0B1E47] focus:border-[#0B1E47] focus:bg-white transition-all"
                  />
                  {serviceSearchQuery.trim().length > 0 && (
                    <button
                      type="button"
                      onClick={() => setServiceSearchQuery('')}
                      data-testid="services-search-clear-btn"
                      aria-label={lang === 'en' ? 'Clear service search' : 'ਖੋਜ ਸਾਫ਼ ਕਰੋ'}
                      className="absolute right-2.5 top-1/2 -translate-y-1/2 px-2.5 py-1 rounded-md bg-slate-200 hover:bg-slate-300 text-slate-800 text-xs font-bold inline-flex items-center gap-1 transition-colors cursor-pointer"
                    >
                      <X className="w-3.5 h-3.5" />
                      <span>{lang === 'en' ? 'Clear' : 'ਸਾਫ਼ ਕਰੋ'}</span>
                    </button>
                  )}
                </div>

                <div
                  data-testid="services-search-count"
                  className="text-xs font-bold text-slate-700 bg-slate-100 border border-slate-200 px-3 py-2 rounded-lg whitespace-nowrap shrink-0 text-center"
                >
                  {lang === 'en'
                    ? `Showing ${filteredServices.length} of ${allServicesCombined.length} Services`
                    : `${allServicesCombined.length} ਵਿੱਚੋਂ ${filteredServices.length} ਸੇਵਾਵਾਂ`}
                </div>
              </div>

              {/* Official Authority Eligibility Notice */}
              <div className="p-4 rounded-xl bg-blue-950 text-amber-200 border border-amber-400/30 text-xs leading-relaxed flex items-center gap-3">
                <ShieldCheck className="w-5 h-5 text-amber-400 shrink-0" />
                <span>{t.authorityNotice}</span>
              </div>

              {/* Service Cards Grid or Empty Search State */}
              {filteredServices.length > 0 ? (
                <motion.div
                  layout
                  data-testid="services-cards-grid"
                  className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
                >
                  <AnimatePresence mode="popLayout">
                    {filteredServices.map((service, index) => (
                      <ServiceCard
                        key={service.id}
                        service={service}
                        lang={lang}
                        indexNumber={index + 1}
                        onLearnMore={(srv) => setModalService(srv)}
                        onSelectWork={(srv) => handleSelectServiceWork(srv)}
                      />
                    ))}
                  </AnimatePresence>
                </motion.div>
              ) : (
                <div
                  data-testid="services-search-empty-state"
                  className="bg-white rounded-2xl border border-slate-200 p-8 sm:p-10 text-center space-y-3 shadow-xs"
                >
                  <div className="w-12 h-12 rounded-full bg-amber-100 text-amber-800 flex items-center justify-center mx-auto">
                    <Search className="w-6 h-6" />
                  </div>
                  <h3 className="text-lg font-bold text-slate-900">
                    {lang === 'en'
                      ? `No services found matching "${serviceSearchQuery}"`
                      : `"${serviceSearchQuery}" ਨਾਲ ਮਿਲਦੀ ਕੋਈ ਸੇਵਾ ਨਹੀਂ ਮਿਲੀ`}
                  </h3>
                  <p className="text-sm text-slate-600 max-w-md mx-auto">
                    {lang === 'en'
                      ? 'Try searching for another keyword (such as Aadhaar, PAN, Passport, Loan, Insurance, or Property) or reset the search filter.'
                      : 'ਕੋਈ ਹੋਰ ਸ਼ਬਦ ਲਿਖ ਕੇ ਖੋਜੋ (ਜਿਵੇਂ ਆਧਾਰ, ਪੈਨ, ਪਾਸਪੋਰਟ, ਲੋਨ, ਬੀਮਾ) ਜਾਂ ਫਿਲਟਰ ਰੀਸੈੱਟ ਕਰੋ।'}
                  </p>
                  <div className="pt-2">
                    <button
                      type="button"
                      data-testid="services-search-reset-btn"
                      onClick={() => {
                        setServiceSearchQuery('');
                        setSelectedCategory('all');
                      }}
                      className="px-4 py-2 rounded-lg bg-[#0B1E47] hover:bg-[#132C63] text-amber-300 text-xs font-bold transition-colors cursor-pointer"
                    >
                      {lang === 'en' ? 'Show All 19 Services' : 'ਸਾਰੀਆਂ 19 ਸੇਵਾਵਾਂ ਦੇਖੋ'}
                    </button>
                  </div>
                </div>
              )}
            </div>
          </section>
        )}

        {/* SMART SERVICE & DOCUMENT CHECKLIST ADVISOR (Gemini · Groq Llama 3.3 · Tavily Search) */}
        {(activePage === 'home' ||
          activePage === 'services' ||
          activePage === 'documentation' ||
          activePage === 'loans') && (
          <SmartServiceAdvisor
            lang={lang}
            onSelectServiceForDispatch={(title, note) => scrollToEnquiry(title, note)}
          />
        )}

        {/* INTERACTIVE LOAN EMI CALCULATOR (Shown on Home & Loan Services page) */}
        {(activePage === 'home' || activePage === 'loans') && (
          <LoanCalculator
            lang={lang}
            onSelectLoanEnquiry={(summary) =>
              scrollToEnquiry('Loan Consultancy', summary)
            }
          />
        )}

        {/* INSURANCE SECTION (Shown on Home & Insurance page) */}
        {(activePage === 'home' || activePage === 'insurance') && (
          <InsuranceSection
            lang={lang}
            userSession={userSession}
            onAdminNotify={(payload) => {
              void submitEnquiryToBackend(payload);
              setAdminDispatchPayload(payload);
            }}
          />
        )}

        {/* GENUINE TESTIMONIALS & FAQ SECTION */}
        {(activePage === 'home' || activePage === 'about' || activePage === 'services') && (
          <TestimonialsAndFaqSection lang={lang} />
        )}

        {/* CONTACT US SECTION */}
        <ContactSection lang={lang} />
      </main>

      {/* Quiet Footer */}
      <footer className="bg-[#050E24] text-slate-400 py-10 border-t border-white/10 text-xs">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-6 border-b border-white/10">
            <div className="flex items-center gap-3">
              <MBMonogramLogo size="sm" />
              <div>
                <div className="text-sm font-bold text-white">M Bee Enterprises</div>
                <div className="text-[#E5C158]">
                  Proprietors: Baljinder Singh &amp; Manpreet Singh · M Bee Enterprises, Bank of Baroda, near Bus Stand, near Mahilpur, Mahilpur, Punjab 146105
                </div>
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-4 text-slate-300">
              {allPagesList.map((p) => (
                <button
                  key={p.id}
                  type="button"
                  onClick={() => navigateToPage(p.id)}
                  className="hover:text-amber-300 transition-colors whitespace-nowrap"
                >
                  {p.label}
                </button>
              ))}
            </div>
          </div>

          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <p className="max-w-3xl leading-relaxed">{t.authorityNotice}</p>
            <div className="shrink-0 text-slate-300 font-tabular">
              © {new Date().getFullYear()} M Bee Enterprises. All rights reserved.
            </div>
          </div>
        </div>
      </footer>

      {/* Service Detail & Checklist Modal */}
      <ServiceDetailModal
        service={modalService}
        lang={lang}
        onClose={() => setModalService(null)}
        onSelectForEnquiry={(serviceName) => scrollToEnquiry(serviceName)}
      />

      {/* Customer Sign In / Create Profile Modal */}
      <UserSignInModal
        isOpen={signInModalOpen}
        initialMode={signInInitialMode}
        lang={lang}
        onClose={() => setSignInModalOpen(false)}
        onSignInSuccess={handleSignInSuccess}
      />

      {/* Customer Profile & Work Request History Modal */}
      <UserProfileModal
        isOpen={profileModalOpen}
        userSession={userSession}
        lang={lang}
        onClose={() => setProfileModalOpen(false)}
        onUpdateProfile={handleUpdateUserProfile}
        onDispatchWork={(payload) => {
          void submitEnquiryToBackend(payload);
          setAdminDispatchPayload(payload);
        }}
        onSignOut={handleSignOut}
      />

      {/* Admin WhatsApp & SMS Notification Dispatch Modal */}
      <AdminDispatchModal
        payload={adminDispatchPayload}
        lang={lang}
        onClose={() => setAdminDispatchPayload(null)}
      />

      {/* Admin Control Panel Modal (Password: Mbeeenterprise@#123) */}
      <AdminControlPanelModal
        isOpen={adminModalOpen}
        lang={lang}
        customServices={customServices}
        adminAnnouncement={adminAnnouncement}
        onClose={() => setAdminModalOpen(false)}
        onUpdateCustomServices={handleUpdateCustomServices}
        onUpdateAnnouncement={handleUpdateAnnouncement}
      />

      {/* Floating WhatsApp & Back-to-Top Action Cluster (Compact footprint < 15% mobile height) */}
      <div className="fixed bottom-4 right-4 z-40 flex items-center gap-2">
        {showBackToTop && (
          <button
            type="button"
            onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
            aria-label="Back to top"
            className="w-10 h-10 rounded-full bg-[#0F213C] hover:bg-[#162F54] text-[#E5C158] border border-[#C69C3A]/40 shadow-lg flex items-center justify-center transition-colors"
          >
            <ArrowUp className="w-4 h-4" />
          </button>
        )}

        <a
          href={buildWhatsAppUrl(
            'Hello M Bee Enterprises (Prop. Baljinder Singh & Manpreet Singh), I would like to enquire about your financial and documentation services.',
            PRIMARY_WHATSAPP
          )}
          target="_blank"
          rel="noopener noreferrer"
          aria-label="Chat with M Bee Enterprises on WhatsApp"
          className="px-4 py-2.5 rounded-full bg-[#0F213C] hover:bg-[#162F54] text-white border border-[#C69C3A]/50 font-bold text-xs shadow-lg flex items-center gap-2 transition-colors whitespace-nowrap"
        >
          <MessageCircle className="w-4 h-4 text-[#E5C158] shrink-0" />
          <span>WhatsApp Desk</span>
        </a>
      </div>
    </div>
  );
}
