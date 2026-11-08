export type Language = 'en' | 'pa';

export type PageId =
  | 'home'
  | 'about'
  | 'services'
  | 'loans'
  | 'insurance'
  | 'documentation'
  | 'property'
  | 'contact'
  | 'profile';

export type ServiceCategoryId =
  | 'documentation'
  | 'financial'
  | 'property'
  | 'digital';

export interface ServiceItem {
  id: string;
  categoryId: ServiceCategoryId;
  iconName: string;
  badge?: 'popular' | 'new';
  title: { en: string; pa: string };
  shortDesc: { en: string; pa: string };
  detailedDesc: { en: string; pa: string };
  preparationList: { en: string[]; pa: string[] };
  turnaroundNote: { en: string; pa: string };
}

export const SERVICES_CATALOG: ServiceItem[] = [
  // DOCUMENTATION SERVICES (6)
  {
    id: 'aadhaar-assistance',
    categoryId: 'documentation',
    iconName: 'Fingerprint',
    badge: 'popular',
    title: {
      en: 'Aadhaar Card Assistance',
      pa: 'ਆਧਾਰ ਕਾਰਡ ਸਹਾਇਤਾ',
    },
    shortDesc: {
      en: 'Guidance for Aadhaar address updates, demographic corrections, appointment booking, and PVC card requests.',
      pa: 'ਆਧਾਰ ਪਤਾ ਅੱਪਡੇਟ, ਵੇਰਵਿਆਂ ਵਿੱਚ ਸੋਧ, ਅਪਾਇੰਟਮੈਂਟ ਬੁਕਿੰਗ ਅਤੇ ਪੀਵੀਸੀ ਕਾਰਡ ਲਈ ਸਹਾਇਤਾ।',
    },
    detailedDesc: {
      en: 'We assist citizens in preparing supporting documents, booking official UIDAI Seva Kendra slots, and tracking status updates for Aadhaar demographic or address modifications.',
      pa: 'ਅਸੀਂ ਨਾਗਰਿਕਾਂ ਨੂੰ ਲੋੜੀਂਦੇ ਦਸਤਾਵੇਜ਼ ਤਿਆਰ ਕਰਨ, ਅਧਿਕਾਰਤ ਆਧਾਰ ਸੇਵਾ ਕੇਂਦਰ ਅਪਾਇੰਟਮੈਂਟ ਬੁੱਕ ਕਰਨ ਅਤੇ ਸਥਿਤੀ ਚੈੱਕ ਕਰਨ ਵਿੱਚ ਪੂਰੀ ਮਦਦ ਕਰਦੇ ਹਾਂ।',
    },
    preparationList: {
      en: [
        'Valid Proof of Identity (Voter ID, Passport, or PAN)',
        'Valid Proof of Address or Gazette Notification',
        'Registered Mobile Number for OTP verification at official portal',
      ],
      pa: [
        'ਪਛਾਣ ਦਾ ਯੋਗ ਸਬੂਤ (ਵੋਟਰ ਕਾਰਡ, ਪਾਸਪੋਰਟ ਜਾਂ ਪੈਨ ਕਾਰਡ)',
        'ਪਤੇ ਦਾ ਯੋਗ ਸਬੂਤ',
        'ਰਜਿਸਟਰਡ ਮੋਬਾਈਲ ਨੰਬਰ',
      ],
    },
    turnaroundNote: {
      en: 'Subject to UIDAI verification rules and biometric centre schedules.',
      pa: 'UIDAI ਦੇ ਨਿਯਮਾਂ ਅਤੇ ਤਸਦੀਕ ਪ੍ਰਕਿਰਿਆ ਦੇ ਅਧੀਨ।',
    },
  },
  {
    id: 'pan-card-services',
    categoryId: 'documentation',
    iconName: 'CreditCard',
    badge: 'popular',
    title: {
      en: 'PAN Card Services',
      pa: 'ਪੈਨ ਕਾਰਡ ਸੇਵਾਵਾਂ',
    },
    shortDesc: {
      en: 'Application support for new Individual/Business PAN cards, name corrections, reprints, and PAN-Aadhaar linking.',
      pa: 'ਨਵੇਂ ਪੈਨ ਕਾਰਡ, ਨਾਮ ਜਾਂ ਵੇਰਵਿਆਂ ਵਿੱਚ ਸੋਧ, ਡੁਪਲੀਕੇਟ ਪੈਨ ਕਾਰਡ ਅਤੇ ਪੈਨ-ਆਧਾਰ ਲਿੰਕਿੰਗ ਸਹਾਇਤਾ।',
    },
    detailedDesc: {
      en: 'Complete form preparation and documentation filing support for fresh PAN applications (Form 49A), data corrections, damaged card reprints, and mandatory PAN-Aadhaar linkage.',
      pa: 'ਨਵੇਂ ਪੈਨ ਕਾਰਡ (ਫਾਰਮ 49A), ਪੁਰਾਣੇ ਪੈਨ ਕਾਰਡ ਵਿੱਚ ਸੋਧ, ਗੁੰਮ ਹੋਏ ਪੈਨ ਕਾਰਡ ਦੀ ਰੀ-ਪ੍ਰਿੰਟਿੰਗ ਅਤੇ ਆਧਾਰ ਨਾਲ ਲਿੰਕ ਕਰਨ ਲਈ ਮਾਹਿਰ ਸਹਾਇਤਾ।',
    },
    preparationList: {
      en: [
        'Aadhaar Card copy with matching name & date of birth',
        'Two recent passport-size colour photographs',
        'Active mobile number and email address',
      ],
      pa: [
        'ਆਧਾਰ ਕਾਰਡ ਦੀ ਕਾਪੀ (ਸਹੀ ਨਾਮ ਅਤੇ ਜਨਮ ਮਿਤੀ ਸਮੇਤ)',
        'ਦੋ ਪਾਸਪੋਰਟ ਸਾਈਜ਼ ਰੰਗੀਨ ਫੋਟੋਆਂ',
        'ਚਾਲੂ ਮੋਬਾਈਲ ਨੰਬਰ ਅਤੇ ਈਮੇਲ ਆਈਡੀ',
      ],
    },
    turnaroundNote: {
      en: 'Processed via official NSDL/UTIITSL channels subject to Income Tax Department approval.',
      pa: 'ਆਮਦਨ ਕਰ ਵਿਭਾਗ (NSDL/UTIITSL) ਦੀ ਮਨਜ਼ੂਰੀ ਦੇ ਅਧੀਨ।',
    },
  },
  {
    id: 'driving-licence-assistance',
    categoryId: 'documentation',
    iconName: 'Car',
    title: {
      en: 'Driving Licence Assistance',
      pa: 'ਡਰਾਈਵਿੰਗ ਲਾਇਸੈਂਸ ਸਹਾਇਤਾ',
    },
    shortDesc: {
      en: 'Parivahan portal assistance for Learner Licence, Permanent DL, renewal, address change, and slot booking.',
      pa: 'ਲਰਨਿੰਗ ਲਾਇਸੈਂਸ, ਪੱਕਾ ਡਰਾਈਵਿੰਗ ਲਾਇਸੈਂਸ, ਰੀਨਿਊਅਲ ਅਤੇ ਅਪਾਇੰਟਮੈਂਟ ਸਲੌਟ ਬੁਕਿੰਗ ਲਈ ਸਹਾਇਤਾ।',
    },
    detailedDesc: {
      en: 'Structured assistance with Sarathi Parivahan online applications, medical certificate form preparation (Form 1/1A), fee challan scheduling, and RTO test appointment booking.',
      pa: 'ਸਾਰਥੀ ਪਰਿਵਾਹਨ ਪੋਰਟਲ ਤੇ ਆਨਲਾਈਨ ਫਾਰਮ ਭਰਨ, ਮੈਡੀਕਲ ਫਾਰਮ (1/1A) ਤਿਆਰ ਕਰਨ ਅਤੇ ਆਰ.ਟੀ.ਓ. ਟੈਸਟ ਅਪਾਇੰਟਮੈਂਟ ਬੁੱਕ ਕਰਨ ਵਿੱਚ ਸਹਾਇਤਾ।',
    },
    preparationList: {
      en: [
        'Proof of Age and Address (Aadhaar / Passport / Voter ID)',
        'Form 1A Medical Certificate (for commercial or applicants aged 40+)',
        'Existing Learner or Driving Licence (for renewal/endorsement)',
      ],
      pa: [
        'ਉਮਰ ਅਤੇ ਪਤੇ ਦਾ ਸਬੂਤ (ਆਧਾਰ / ਪਾਸਪੋਰਟ / ਵੋਟਰ ਕਾਰਡ)',
        'ਮੈਡੀਕਲ ਸਰਟੀਫਿਕੇਟ ਫਾਰਮ 1A (40 ਸਾਲ ਤੋਂ ਵੱਧ ਉਮਰ ਜਾਂ ਕਮਰਸ਼ੀਅਲ ਲਈ)',
        'ਪੁਰਾਣਾ ਲਰਨਿੰਗ ਜਾਂ ਡਰਾਈਵਿੰਗ ਲਾਇਸੈਂਸ (ਰੀਨਿਊਅਲ ਲਈ)',
      ],
    },
    turnaroundNote: {
      en: 'Subject to RTO testing norms and Transport Department eligibility.',
      pa: 'ਟਰਾਂਸਪੋਰਟ ਵਿਭਾਗ ਅਤੇ ਆਰ.ਟੀ.ਓ. ਨਿਯਮਾਂ ਦੇ ਅਧੀਨ।',
    },
  },
  {
    id: 'passport-application-assistance',
    categoryId: 'documentation',
    iconName: 'Globe',
    badge: 'popular',
    title: {
      en: 'Passport Application Assistance',
      pa: 'ਪਾਸਪੋਰਟ ਅਰਜ਼ੀ ਸਹਾਇਤਾ',
    },
    shortDesc: {
      en: 'End-to-end form filing, PSK appointment scheduling, renewal, PCC, and document checklist verification.',
      pa: 'ਨਵੇਂ ਪਾਸਪੋਰਟ, ਰੀ-ਇਸ਼ੂ, ਪੁਲਿਸ ਕਲੀਅਰੈਂਸ ਸਰਟੀਫਿਕੇਟ (PCC) ਅਤੇ ਅਪਾਇੰਟਮੈਂਟ ਬੁਕਿੰਗ ਸਹਾਇਤਾ।',
    },
    detailedDesc: {
      en: 'Careful verification of documents, online Passport Seva application submission, Police Clearance Certificate (PCC) booking, and Tatkaal / Normal appointment scheduling across Punjab PSKs.',
      pa: 'ਪਾਸਪੋਰਟ ਸੇਵਾ ਪੋਰਟਲ ਤੇ ਸਹੀ ਵੇਰਵਿਆਂ ਨਾਲ ਅਰਜ਼ੀ ਭਰਨ, ਦਸਤਾਵੇਜ਼ਾਂ ਦੀ ਜਾਂਚ ਕਰਨ ਅਤੇ ਪੰਜਾਬ ਦੇ ਪਾਸਪੋਰਟ ਕੇਂਦਰਾਂ ਲਈ ਅਪਾਇੰਟਮੈਂਟ ਲੈਣ ਵਿੱਚ ਮਦਦ।',
    },
    preparationList: {
      en: [
        'Aadhaar Card and PAN / Voter ID',
        'Matriculation Certificate (for ECNR status verification)',
        'Birth Certificate or Previous Passport (if applicable)',
      ],
      pa: [
        'ਆਧਾਰ ਕਾਰਡ ਅਤੇ ਪੈਨ / ਵੋਟਰ ਕਾਰਡ',
        'ਦਸਵੀਂ ਜਮਾਤ ਦਾ ਸਰਟੀਫਿਕੇਟ (ECNR ਲਈ)',
        'ਜਨਮ ਸਰਟੀਫਿਕੇਟ ਜਾਂ ਪੁਰਾਣਾ ਪਾਸਪੋਰਟ (ਜੇ ਹੋਵੇ)',
      ],
    },
    turnaroundNote: {
      en: 'Subject to Regional Passport Office (MEA) and Police Verification clearance.',
      pa: 'ਪਾਸਪੋਰਟ ਦਫ਼ਤਰ ਅਤੇ ਪੁਲਿਸ ਵੈਰੀਫਿਕੇਸ਼ਨ ਦੇ ਨਿਯਮਾਂ ਅਧੀਨ।',
    },
  },
  {
    id: 'birth-certificate-assistance',
    categoryId: 'documentation',
    iconName: 'FileCheck2',
    title: {
      en: 'Birth Certificate Assistance',
      pa: 'ਜਨਮ ਸਰਟੀਫਿਕੇਟ ਸਹਾਇਤਾ',
    },
    shortDesc: {
      en: 'Application guidance for birth registration, name addition, correction, and certified digital copy retrieval.',
      pa: 'ਜਨਮ ਸਰਟੀਫਿਕੇਟ ਰਜਿਸਟ੍ਰੇਸ਼ਨ, ਬੱਚੇ ਦਾ ਨਾਮ ਦਰਜ ਕਰਵਾਉਣ, ਸੋਧ ਅਤੇ ਡਿਜੀਟਲ ਕਾਪੀ ਪ੍ਰਾਪਤ ਕਰਨ ਲਈ ਸਹਾਇਤਾ।',
    },
    detailedDesc: {
      en: 'Support for municipal and e-Sewa Punjab birth certificate applications, late registration file compilation, child name inclusion, and certified copies.',
      pa: 'ਈ-ਸੇਵਾ ਪੰਜਾਬ ਅਤੇ ਮਿਉਂਸਪਲ ਰਿਕਾਰਡ ਰਾਹੀਂ ਜਨਮ ਸਰਟੀਫਿਕੇਟ ਦੀ ਨਕਲ, ਨਾਮ ਦਰਜ ਕਰਵਾਉਣ ਅਤੇ ਤਰੁੱਟੀਆਂ ਦੀ ਸੋਧ ਲਈ ਫਾਈਲ ਤਿਆਰ ਕਰਨ ਦੀ ਸੇਵਾ।',
    },
    preparationList: {
      en: [
        'Hospital Discharge Summary / Birth Report',
        'Parents Aadhaar Cards and Marriage / Residence Proof',
        'Affidavit or School Record (for delayed entry or correction)',
      ],
      pa: [
        'ਹਸਪਤਾਲ ਦੀ ਡਿਸਚਾਰਜ ਸਲਿੱਪ / ਜਨਮ ਰਿਪੋਰਟ',
        'ਮਾਤਾ-ਪਿਤਾ ਦੇ ਆਧਾਰ ਕਾਰਡ ਅਤੇ ਰਿਹਾਇਸ਼ੀ ਸਬੂਤ',
        'ਹਲਫ਼ੀਆ ਬਿਆਨ ਜਾਂ ਸਕੂਲ ਸਰਟੀਫਿਕੇਟ (ਸੋਧ ਲਈ)',
      ],
    },
    turnaroundNote: {
      en: 'Subject to Registrar of Births & Deaths / Municipal authority verification.',
      pa: 'ਸਬੰਧਤ ਰਜਿਸਟਰਾਰ ਅਤੇ ਸਰਕਾਰੀ ਵਿਭਾਗ ਦੀ ਤਸਦੀਕ ਅਧੀਨ।',
    },
  },
  {
    id: 'photo-photostat-services',
    categoryId: 'documentation',
    iconName: 'Printer',
    title: {
      en: 'Photo & Photostat Services',
      pa: 'ਫੋਟੋ ਅਤੇ ਫੋਟੋਸਟੇਟ ਸੇਵਾਵਾਂ',
    },
    shortDesc: {
      en: 'Instant passport/visa size photographs, high-speed photostat, colour printing, scanning, and lamination.',
      pa: 'ਤੁਰੰਤ ਪਾਸਪੋਰਟ ਸਾਈਜ਼ ਫੋਟੋਆਂ, ਫੋਟੋਸਟੇਟ, ਰੰਗੀਨ ਪ੍ਰਿੰਟਿੰਗ, ਸਕੈਨਿੰਗ ਅਤੇ ਲੈਮੀਨੇਸ਼ਨ ਸੇਵਾਵਾਂ।',
    },
    detailedDesc: {
      en: 'Walk-in office support for crisp studio-grade passport and embassy visa photos, high-volume document photocopying, PDF scanning for online uploads, and protective lamination.',
      pa: 'ਸਾਡੇ ਦਫ਼ਤਰ ਵਿੱਚ ਤੁਰੰਤ ਪਾਸਪੋਰਟ ਅਤੇ ਵੀਜ਼ਾ ਸਾਈਜ਼ ਫੋਟੋਆਂ, ਦਸਤਾਵੇਜ਼ਾਂ ਦੀ ਫੋਟੋਸਟੇਟ, ਆਨਲਾਈਨ ਫਾਰਮਾਂ ਲਈ ਪੀਡੀਐਫ ਸਕੈਨਿੰਗ ਅਤੇ ਲੈਮੀਨੇਸ਼ਨ ਦੀ ਸਹੂਲਤ ਉਪਲਬਧ ਹੈ।',
    },
    preparationList: {
      en: [
        'Original documents for clean scanning or lamination',
        'PDF files via WhatsApp or Email for instant printing',
        'Specific dimension guidelines if needed for foreign embassy visas',
      ],
      pa: [
        'ਸਕੈਨਿੰਗ ਜਾਂ ਲੈਮੀਨੇਸ਼ਨ ਲਈ ਅਸਲ ਦਸਤਾਵੇਜ਼',
        'ਪ੍ਰਿੰਟਿੰਗ ਲਈ ਵਟਸਐਪ ਜਾਂ ਈਮੇਲ ਰਾਹੀਂ ਫਾਈਲਾਂ',
        'ਵੀਜ਼ਾ ਫੋਟੋ ਲਈ ਲੋੜੀਂਦੇ ਸਾਈਜ਼ ਦੀ ਜਾਣਕਾਰੀ',
      ],
    },
    turnaroundNote: {
      en: 'Available immediately at the M Bee Enterprises counter during business hours.',
      pa: 'ਦਫ਼ਤਰੀ ਸਮੇਂ ਦੌਰਾਨ ਤੁਰੰਤ ਉਪਲਬਧ ਸੇਵਾ।',
    },
  },

  // FINANCIAL SERVICES (6)
  {
    id: 'loan-consultancy',
    categoryId: 'financial',
    iconName: 'Briefcase',
    badge: 'popular',
    title: {
      en: 'Loan Consultancy',
      pa: 'ਲੋਨ ਸਲਾਹਕਾਰ ਸੇਵਾਵਾਂ',
    },
    shortDesc: {
      en: 'Comprehensive financial file assessment, eligibility evaluation, and repayment structuring across banking partners.',
      pa: 'ਬੈਂਕ ਲੋਨ ਲਈ ਫਾਈਲ ਦੀ ਤਿਆਰੀ, ਯੋਗਤਾ ਦਾ ਮੁਲਾਂਕਣ ਅਤੇ ਸਹੀ ਕਿਸ਼ਤ ਯੋਜਨਾਬੰਦੀ ਲਈ ਮਾਹਿਰ ਸਲਾਹ।',
    },
    detailedDesc: {
      en: 'We review your income documents, credit profile, and financial objectives to help prepare a well-organized loan file suited for regulated banks and NBFCs.',
      pa: 'ਅਸੀਂ ਤੁਹਾਡੇ ਆਮਦਨ ਦਸਤਾਵੇਜ਼ਾਂ ਅਤੇ ਵਿੱਤੀ ਲੋੜਾਂ ਦਾ ਵਿਸ਼ਲੇਸ਼ਣ ਕਰਕੇ ਬੈਂਕਾਂ ਅਤੇ ਵਿੱਤੀ ਸੰਸਥਾਵਾਂ ਲਈ ਇੱਕ ਮਜ਼ਬੂਤ ਲੋਨ ਫਾਈਲ ਤਿਆਰ ਕਰਨ ਵਿੱਚ ਮਦਦ ਕਰਦੇ ਹਾਂ।',
    },
    preparationList: {
      en: [
        'Last 6 to 12 months Bank Statement',
        'ITR / Computation of Income or Salary Slips',
        'KYC Documents (PAN Card, Aadhaar Card, Address Proof)',
      ],
      pa: [
        'ਪਿਛਲੇ 6 ਤੋਂ 12 ਮਹੀਨਿਆਂ ਦੀ ਬੈਂਕ ਸਟੇਟਮੈਂਟ',
        'ਆਈ.ਟੀ.ਆਰ. (ITR) ਜਾਂ ਤਨਖਾਹ ਸਲਿੱਪਾਂ',
        'ਕੇ.ਵਾਈ.ਸੀ. ਦਸਤਾਵੇਜ਼ (ਪੈਨ ਕਾਰਡ, ਆਧਾਰ ਕਾਰਡ)',
      ],
    },
    turnaroundNote: {
      en: 'Final sanction and interest rates depend strictly on the lending institution credit policy.',
      pa: 'ਲੋਨ ਦੀ ਮਨਜ਼ੂਰੀ ਅਤੇ ਵਿਆਜ ਦਰਾਂ ਸਬੰਧਤ ਬੈਂਕ ਦੇ ਨਿਯਮਾਂ ਤੇ ਨਿਰਭਰ ਕਰਦੀਆਂ ਹਨ।',
    },
  },
  {
    id: 'personal-loan-assistance',
    categoryId: 'financial',
    iconName: 'UserCheck',
    title: {
      en: 'Personal Loan Assistance',
      pa: 'ਪਰਸਨਲ ਲੋਨ ਸਹਾਇਤਾ',
    },
    shortDesc: {
      en: 'Unsecured personal loan documentation for salaried professionals and self-employed individuals.',
      pa: 'ਨੌਕਰੀਪੇਸ਼ਾ ਅਤੇ ਸਵੈ-ਰੁਜ਼ਗਾਰ ਵਿਅਕਤੀਆਂ ਲਈ ਪਰਸਨਲ ਲੋਨ ਦਸਤਾਵੇਜ਼ਾਂ ਅਤੇ ਅਰਜ਼ੀ ਵਿੱਚ ਸਹਾਇਤਾ।',
    },
    detailedDesc: {
      en: 'Streamlined guidance for personal financial requirements including medical, family, education, or travel needs with clear EMI comparisons before you apply.',
      pa: 'ਪਰਿਵਾਰਕ, ਸਿੱਖਿਆ ਜਾਂ ਨਿੱਜੀ ਲੋੜਾਂ ਲਈ ਪਰਸਨਲ ਲੋਨ ਦੀ ਫਾਈਲ ਤਿਆਰ ਕਰਨ ਅਤੇ ਕਿਸ਼ਤਾਂ ਦੀ ਸਪੱਸ਼ਟ ਜਾਣਕਾਰੀ ਲਈ ਭਰੋਸੇਯੋਗ ਸਹਾਇਤਾ।',
    },
    preparationList: {
      en: [
        'Last 3 Months Salary Slips or Business Income Proof',
        'Last 6 Months Bank Account Statement showing salary/credits',
        'PAN Card, Aadhaar Card, and Employment ID',
      ],
      pa: [
        'ਪਿਛਲੇ 3 ਮਹੀਨਿਆਂ ਦੀਆਂ ਸੈਲਰੀ ਸਲਿੱਪਾਂ ਜਾਂ ਆਮਦਨ ਸਬੂਤ',
        'ਪਿਛਲੇ 6 ਮਹੀਨਿਆਂ ਦੀ ਬੈਂਕ ਸਟੇਟਮੈਂਟ',
        'ਪੈਨ ਕਾਰਡ, ਆਧਾਰ ਕਾਰਡ ਅਤੇ ਦਫ਼ਤਰੀ ਆਈਡੀ',
      ],
    },
    turnaroundNote: {
      en: 'Subject to lender credit score checks and income eligibility norms.',
      pa: 'ਬੈਂਕ ਦੀ ਕ੍ਰੈਡਿਟ ਜਾਂਚ ਅਤੇ ਆਮਦਨ ਸ਼ਰਤਾਂ ਦੇ ਅਧੀਨ।',
    },
  },
  {
    id: 'home-loan-assistance',
    categoryId: 'financial',
    iconName: 'Home',
    badge: 'popular',
    title: {
      en: 'Home Loan Assistance',
      pa: 'ਹੋਮ ਲੋਨ ਸਹਾਇਤਾ',
    },
    shortDesc: {
      en: 'Complete file compilation for house purchase, plot + construction, home renovation, and balance transfer.',
      pa: 'ਨਵਾਂ ਘਰ ਖਰੀਦਣ, ਮਕਾਨ ਉਸਾਰੀ, ਮੁਰੰਮਤ ਜਾਂ ਲੋਨ ਬੈਲੇਂਸ ਟ੍ਰਾਂਸਫਰ ਲਈ ਸੰਪੂਰਨ ਫਾਈਲ ਸਹਾਇਤਾ।',
    },
    detailedDesc: {
      en: 'From organizing property chain deeds and approved building maps to structuring income proofs, we simplify every documentation step of your housing finance application.',
      pa: 'ਪ੍ਰਾਪਰਟੀ ਦੇ ਕਾਗਜ਼ਾਤ, ਨਕਸ਼ੇ ਅਤੇ ਆਮਦਨ ਦੇ ਸਬੂਤਾਂ ਨੂੰ ਸਹੀ ਢੰਗ ਨਾਲ ਤਿਆਰ ਕਰਕੇ ਹੋਮ ਲੋਨ ਦੀ ਪ੍ਰਕਿਰਿਆ ਨੂੰ ਸਰਲ ਬਣਾਉਣ ਲਈ ਮਾਹਿਰ ਸੇਵਾ।',
    },
    preparationList: {
      en: [
        'Property Title Deed, Sale Agreement, Jamabandi / Farad & Approved Map',
        'Last 2–3 Years ITR with Computation or Form-16 & Salary Slips',
        '12 Months Bank Statement and Applicant/Co-applicant KYC',
      ],
      pa: [
        'ਪ੍ਰਾਪਰਟੀ ਦੀ ਰਜਿਸਟਰੀ, ਬਿਆਨਾ, ਜਮ੍ਹਾਂਬੰਦੀ/ਫਰਦ ਅਤੇ ਪਾਸ ਨਕਸ਼ਾ',
        'ਪਿਛਲੇ 2-3 ਸਾਲਾਂ ਦੀ ਆਈ.ਟੀ.ਆਰ. ਜਾਂ ਫਾਰਮ-16 ਅਤੇ ਸੈਲਰੀ ਸਲਿੱਪਾਂ',
        '12 ਮਹੀਨਿਆਂ ਦੀ ਬੈਂਕ ਸਟੇਟਮੈਂਟ ਅਤੇ ਕੇ.ਵਾਈ.ਸੀ. ਕਾਗਜ਼ਾਤ',
      ],
    },
    turnaroundNote: {
      en: 'Subject to legal/technical property valuation and lender sanction rules.',
      pa: 'ਬੈਂਕ ਦੀ ਕਾਨੂੰਨੀ ਅਤੇ ਤਕਨੀਕੀ ਜਾਂਚ ਦੇ ਅਧੀਨ।',
    },
  },
  {
    id: 'car-loan-assistance',
    categoryId: 'financial',
    iconName: 'CarFront',
    title: {
      en: 'Car Loan Assistance',
      pa: 'ਕਾਰ ਲੋਨ ਸਹਾਇਤਾ',
    },
    shortDesc: {
      en: 'Documentation and advisory for new vehicle finance, pre-owned car loans, and existing vehicle refinancing.',
      pa: 'ਨਵੀਂ ਕਾਰ ਖਰੀਦਣ, ਪੁਰਾਣੀ ਗੱਡੀ ਤੇ ਲੋਨ ਜਾਂ ਰੀ-ਫਾਇਨਾਂਸ ਲਈ ਦਸਤਾਵੇਜ਼ੀ ਸਹਾਇਤਾ।',
    },
    detailedDesc: {
      en: 'Quick assistance in assembling dealer proforma invoices, vehicle RC/insurance evaluation for used cars, and income documentation for smooth vehicle loan processing.',
      pa: 'ਡੀਲਰ ਕੋਟੇਸ਼ਨ, ਪੁਰਾਣੀ ਗੱਡੀ ਦੀ ਆਰ.ਸੀ./ਇੰਸ਼ੋਰੈਂਸ ਅਤੇ ਆਮਦਨ ਦਸਤਾਵੇਜ਼ਾਂ ਰਾਹੀਂ ਕਾਰ ਲੋਨ ਫਾਈਲ ਤਿਆਰ ਕਰਨ ਵਿੱਚ ਤੇਜ਼ ਸਹਾਇਤਾ।',
    },
    preparationList: {
      en: [
        'Proforma Invoice (for New Car) or RC & Valid Insurance (for Used Car)',
        'Income Proof (ITR / J-Forms / Salary Slips) & 6 Months Bank Statement',
        'KYC Documents and Driving Licence copy',
      ],
      pa: [
        'ਨਵੀਂ ਕਾਰ ਲਈ ਕੋਟੇਸ਼ਨ ਜਾਂ ਪੁਰਾਣੀ ਕਾਰ ਦੀ ਆਰ.ਸੀ. ਅਤੇ ਬੀਮਾ',
        'ਆਮਦਨ ਸਬੂਤ (ITR / ਜੇ-ਫਾਰਮ / ਸੈਲਰੀ ਸਲਿੱਪ) ਅਤੇ 6 ਮਹੀਨੇ ਦੀ ਬੈਂਕ ਸਟੇਟਮੈਂਟ',
        'ਆਧਾਰ ਕਾਰਡ, ਪੈਨ ਕਾਰਡ ਅਤੇ ਡਰਾਈਵਿੰਗ ਲਾਇਸੈਂਸ',
      ],
    },
    turnaroundNote: {
      en: 'Subject to vehicle valuation and lender underwriting criteria.',
      pa: 'ਗੱਡੀ ਦੀ ਵੈਲਿਊਏਸ਼ਨ ਅਤੇ ਬੈਂਕ ਦੀਆਂ ਸ਼ਰਤਾਂ ਦੇ ਅਧੀਨ।',
    },
  },
  {
    id: 'business-loan-assistance',
    categoryId: 'financial',
    iconName: 'Building2',
    title: {
      en: 'Business Loan Assistance',
      pa: 'ਬਿਜ਼ਨਸ ਲੋਨ ਸਹਾਇਤਾ',
    },
    shortDesc: {
      en: 'Working capital, MSME loan documentation, machinery finance, and CC/OD limit file preparation.',
      pa: 'ਕਾਰੋਬਾਰ ਵਧਾਉਣ, MSME ਲੋਨ, ਮਸ਼ੀਨਰੀ ਫਾਇਨਾਂਸ ਅਤੇ ਲਿਮਿਟ (CC/OD) ਲਈ ਫਾਈਲ ਤਿਆਰੀ।',
    },
    detailedDesc: {
      en: 'Dedicated consultancy for traders, shopkeepers, manufacturers, and service enterprises across Punjab seeking organized files for MSME term loans or working capital facilities.',
      pa: 'ਪੰਜਾਬ ਦੇ ਵਪਾਰੀਆਂ, ਦੁਕਾਨਦਾਰਾਂ ਅਤੇ ਉੱਦਮੀਆਂ ਲਈ ਕਾਰੋਬਾਰੀ ਲੋਨ ਅਤੇ ਲਿਮਿਟ ਦੀਆਂ ਫਾਈਲਾਂ ਤਿਆਰ ਕਰਨ ਲਈ ਵਿਸ਼ੇਸ਼ ਸਲਾਹਕਾਰ ਸੇਵਾ।',
    },
    preparationList: {
      en: [
        'Udyam MSME Registration, GST Returns (if applicable) & Shop Proof',
        'Last 2–3 Years Audited/CA Certified Financials & ITR',
        '12 Months Current Account Statement & Proprietor/Partner KYC',
      ],
      pa: [
        'ਉਦਯਮ (MSME) ਰਜਿਸਟ੍ਰੇਸ਼ਨ, ਜੀ.ਐਸ.ਟੀ. ਰਿਟਰਨ ਅਤੇ ਕਾਰੋਬਾਰ ਦਾ ਸਬੂਤ',
        'ਪਿਛਲੇ 2-3 ਸਾਲਾਂ ਦੀ ਆਈ.ਟੀ.ਆਰ. ਅਤੇ ਬੈਲੇਂਸ ਸ਼ੀਟ',
        '12 ਮਹੀਨਿਆਂ ਦੀ ਕਰੰਟ ਖਾਤਾ ਸਟੇਟਮੈਂਟ ਅਤੇ ਕੇ.ਵਾਈ.ਸੀ.',
      ],
    },
    turnaroundNote: {
      en: 'Subject to business vintage, turnover assessment, and bank norms.',
      pa: 'ਕਾਰੋਬਾਰੀ ਟਰਨਓਵਰ ਅਤੇ ਬੈਂਕ ਦੇ ਨਿਯਮਾਂ ਅਧੀਨ।',
    },
  },
  {
    id: 'insurance-services',
    categoryId: 'financial',
    iconName: 'ShieldCheck',
    badge: 'popular',
    title: {
      en: 'Insurance Services',
      pa: 'ਬੀਮਾ (ਇੰਸ਼ੋਰੈਂਸ) ਸੇਵਾਵਾਂ',
    },
    shortDesc: {
      en: 'Motor (two-wheeler/car/commercial), health, life, and travel insurance consultation and policy renewal support.',
      pa: 'ਗੱਡੀਆਂ ਦਾ ਬੀਮਾ, ਸਿਹਤ ਬੀਮਾ, ਜੀਵਨ ਬੀਮਾ ਅਤੇ ਟਰੈਵਲ ਇੰਸ਼ੋਰੈਂਸ ਸਲਾਹ ਤੇ ਰੀਨਿਊਅਲ ਸਹਾਇਤਾ।',
    },
    detailedDesc: {
      en: 'Compare coverage terms transparently, renew expiring motor or health policies on time, update nominee records, and get guidance on claim documentation.',
      pa: 'ਆਪਣੇ ਵਾਹਨ, ਸਿਹਤ, ਜੀਵਨ ਅਤੇ ਵਿਦੇਸ਼ ਯਾਤਰਾ ਲਈ ਸਹੀ ਬੀਮਾ ਪਾਲਿਸੀ ਚੁਣਨ, ਸਮੇਂ ਸਿਰ ਰੀਨਿਊ ਕਰਵਾਉਣ ਅਤੇ ਕਲੇਮ ਦਸਤਾਵੇਜ਼ਾਂ ਵਿੱਚ ਮਦਦ।',
    },
    preparationList: {
      en: [
        'Previous Insurance Policy Copy & Vehicle RC (for Motor Insurance)',
        'Proposer KYC Documents (PAN & Aadhaar) and Nominee Details',
        'Basic Health / Travel itinerary details (for Health or Travel policies)',
      ],
      pa: [
        'ਪੁਰਾਣੀ ਬੀਮਾ ਪਾਲਿਸੀ ਅਤੇ ਗੱਡੀ ਦੀ ਆਰ.ਸੀ. (ਵਾਹਨ ਬੀਮੇ ਲਈ)',
        'ਆਧਾਰ ਕਾਰਡ, ਪੈਨ ਕਾਰਡ ਅਤੇ ਨੌਮਿਨੀ ਦੇ ਵੇਰਵੇ',
        'ਸਿਹਤ ਜਾਂ ਯਾਤਰਾ ਦੇ ਵੇਰਵੇ (ਹੈਲਥ/ਟਰੈਵਲ ਬੀਮੇ ਲਈ)',
      ],
    },
    turnaroundNote: {
      en: 'Policy issuance and claim settlement are governed by IRDAI-regulated insurer terms.',
      pa: 'ਪਾਲਿਸੀ ਦੀਆਂ ਸ਼ਰਤਾਂ ਸਬੰਧਤ ਬੀਮਾ ਕੰਪਨੀ ਦੇ ਨਿਯਮਾਂ ਅਧੀਨ ਹਨ।',
    },
  },

  // PROPERTY SERVICES (3)
  {
    id: 'property-advisor',
    categoryId: 'property',
    iconName: 'Compass',
    badge: 'new',
    title: {
      en: 'Property Advisor',
      pa: 'ਪ੍ਰਾਪਰਟੀ ਸਲਾਹਕਾਰ (Property Advisor)',
    },
    shortDesc: {
      en: 'Trusted local guidance for residential plots, houses, commercial shops, and agricultural land in Punjab.',
      pa: 'ਪੰਜਾਬ ਵਿੱਚ ਰਿਹਾਇਸ਼ੀ ਪਲਾਟ, ਮਕਾਨ, ਕਮਰਸ਼ੀਅਲ ਦੁਕਾਨਾਂ ਅਤੇ ਜ਼ਮੀਨ ਦੀ ਖਰੀਦ-ਵੇਚ ਲਈ ਭਰੋਸੇਯੋਗ ਸਲਾਹ।',
    },
    detailedDesc: {
      en: 'Personalized advisory connecting genuine buyers and sellers with transparent discussions on locality potential, clear documentation checks, and fair deal structuring.',
      pa: 'ਅਸਲ ਖਰੀਦਦਾਰਾਂ ਅਤੇ ਵਿਕਰੇਤਾਵਾਂ ਨੂੰ ਪਾਰਦਰਸ਼ੀ ਤਰੀਕੇ ਨਾਲ ਮਿਲਾਉਣ, ਇਲਾਕੇ ਦੀ ਸਹੀ ਜਾਣਕਾਰੀ ਅਤੇ ਸਾਫ਼-ਸੁਥਰੇ ਸੌਦੇ ਲਈ ਮਾਹਿਰ ਸਲਾਹ।',
    },
    preparationList: {
      en: [
        'Clear specification of budget, preferred location, and property type',
        'Ownership records (Jamabandi / Registry copy) when listing a property',
        'Identity proof of transacting parties for formal consultation',
      ],
      pa: [
        'ਬਜਟ, ਪਸੰਦੀਦਾ ਇਲਾਕੇ ਅਤੇ ਪ੍ਰਾਪਰਟੀ ਦੀ ਕਿਸਮ ਬਾਰੇ ਜਾਣਕਾਰੀ',
        'ਵੇਚਣ ਲਈ ਪ੍ਰਾਪਰਟੀ ਦੀ ਰਜਿਸਟਰੀ ਜਾਂ ਜਮ੍ਹਾਂਬੰਦੀ ਦੀ ਕਾਪੀ',
        'ਪਛਾਣ ਪੱਤਰ ਦੇ ਵੇਰਵੇ',
      ],
    },
    turnaroundNote: {
      en: 'All transactions are guided with complete transparency and verified party meetings.',
      pa: 'ਪੂਰੀ ਪਾਰਦਰਸ਼ਤਾ ਅਤੇ ਆਹਮੋ-ਸਾਹਮਣੇ ਮੀਟਿੰਗ ਰਾਹੀਂ ਸੇਵਾ।',
    },
  },
  {
    id: 'property-consultancy',
    categoryId: 'property',
    iconName: 'Building',
    title: {
      en: 'Property Consultancy',
      pa: 'ਪ੍ਰਾਪਰਟੀ ਕੰਸਲਟੈਂਸੀ',
    },
    shortDesc: {
      en: 'Pre-purchase document review checklist, agreement drafting coordination, and property loan linkage.',
      pa: 'ਪ੍ਰਾਪਰਟੀ ਖਰੀਦਣ ਤੋਂ ਪਹਿਲਾਂ ਕਾਗਜ਼ਾਤ ਦੀ ਜਾਂਚ, ਇਕਰਾਰਨਾਮਾ ਅਤੇ ਲੋਨ ਪ੍ਰਕਿਰਿਆ ਵਿੱਚ ਤਾਲਮੇਲ।',
    },
    detailedDesc: {
      en: 'Avoid paperwork surprises when buying or selling real estate. We help coordinate revenue record checks, agreement-to-sell preparation, and bank housing finance alignment.',
      pa: 'ਪ੍ਰਾਪਰਟੀ ਖਰੀਦਣ ਜਾਂ ਵੇਚਣ ਸਮੇਂ ਕਾਗਜ਼ੀ ਕਾਰਵਾਈ ਨੂੰ ਆਸਾਨ ਬਣਾਉਣ, ਮਾਲ ਵਿਭਾਗ ਦੇ ਰਿਕਾਰਡ ਦੀ ਜਾਂਚ ਅਤੇ ਬੈਂਕ ਲੋਨ ਨਾਲ ਤਾਲਮੇਲ ਲਈ ਵਿਸ਼ੇਸ਼ ਸੇਵਾ।',
    },
    preparationList: {
      en: [
        'Previous chain of Sale Deeds (Registries) and Mutation (Intkal) records',
        'Latest Jamabandi / Khasra Girdawari or MC Tax receipts',
        'NOC / Encumbrance details where applicable',
      ],
      pa: [
        'ਪੁਰਾਣੀਆਂ ਰਜਿਸਟਰੀਆਂ ਅਤੇ ਇੰਤਕਾਲ ਦਾ ਰਿਕਾਰਡ',
        'ਤਾਜ਼ਾ ਜਮ੍ਹਾਂਬੰਦੀ / ਫਰਦ ਜਾਂ ਪ੍ਰਾਪਰਟੀ ਟੈਕਸ ਰਸੀਦ',
        'ਐਨ.ਓ.ਸੀ. (NOC) ਜਾਂ ਬੈਂਕ ਕਲੀਅਰੈਂਸ ਵੇਰਵੇ',
      ],
    },
    turnaroundNote: {
      en: 'Legal registration is executed before the Sub-Registrar as per Punjab Government stamp rules.',
      pa: 'ਰਜਿਸਟਰੀ ਦੀ ਕਾਰਵਾਈ ਪੰਜਾਬ ਸਰਕਾਰ ਦੇ ਸਬ-ਰਜਿਸਟਰਾਰ ਨਿਯਮਾਂ ਅਨੁਸਾਰ ਹੁੰਦੀ ਹੈ।',
    },
  },
  {
    id: 'property-related-assistance',
    categoryId: 'property',
    iconName: 'FileSpreadsheet',
    title: {
      en: 'Property-Related Assistance',
      pa: 'ਪ੍ਰਾਪਰਟੀ ਸਬੰਧੀ ਕਾਗਜ਼ੀ ਸਹਾਇਤਾ',
    },
    shortDesc: {
      en: 'Assistance with online Jamabandi/Farad copies, stamp paper e-filing preparation, and registration appointments.',
      pa: 'ਆਨਲਾਈਨ ਜਮ੍ਹਾਂਬੰਦੀ/ਫਰਦ, ਈ-ਸਟੈਂਪ ਤਿਆਰੀ ਅਤੇ ਰਜਿਸਟਰੀ ਅਪਾਇੰਟਮੈਂਟ ਸਬੰਧੀ ਸਹਾਇਤਾ।',
    },
    detailedDesc: {
      en: 'Convenient desk support for retrieving PLRS Punjab land records, organizing property tax or utility transfer forms, and preparing documentation files for Tehsil appointments.',
      pa: 'ਪੰਜਾਬ ਲੈਂਡ ਰਿਕਾਰਡ ਪੋਰਟਲ ਤੋਂ ਜਮ੍ਹਾਂਬੰਦੀ/ਫਰਦ ਕੱਢਣ, ਪ੍ਰਾਪਰਟੀ ਟੈਕਸ ਜਾਂ ਬਿਜਲੀ ਮੀਟਰ ਟ੍ਰਾਂਸਫਰ ਫਾਰਮ ਅਤੇ ਤਹਿਸੀਲ ਅਪਾਇੰਟਮੈਂਟ ਲਈ ਫਾਈਲ ਤਿਆਰੀ।',
    },
    preparationList: {
      en: [
        'Village / Tehsil / District name and Khewat or Khasra number',
        'Owner and Buyer KYC documents for appointment scheduling',
        'Property utility bill or MC assessment number',
      ],
      pa: [
        'ਪਿੰਡ / ਤਹਿਸੀਲ / ਜ਼ਿਲ੍ਹੇ ਦਾ ਨਾਮ ਅਤੇ ਖੇਵਟ ਜਾਂ ਖਸਰਾ ਨੰਬਰ',
        'ਮਾਲਕ ਅਤੇ ਖਰੀਦਦਾਰ ਦੇ ਪਛਾਣ ਪੱਤਰ',
        'ਬਿਜਲੀ ਬਿੱਲ ਜਾਂ ਪ੍ਰਾਪਰਟੀ ਟੈਕਸ ਨੰਬਰ',
      ],
    },
    turnaroundNote: {
      en: 'Subject to Punjab Land Records Society (PLRS) and Revenue Department rules.',
      pa: 'ਪੰਜਾਬ ਮਾਲ ਵਿਭਾਗ ਦੇ ਨਿਯਮਾਂ ਅਧੀਨ।',
    },
  },

  // DIGITAL & GOVERNMENT SERVICES (4)
  {
    id: 'online-application-assistance',
    categoryId: 'digital',
    iconName: 'MonitorCheck',
    title: {
      en: 'Online Application Assistance',
      pa: 'ਆਨਲਾਈਨ ਫਾਰਮ ਅਤੇ ਅਰਜ਼ੀ ਸਹਾਇਤਾ',
    },
    shortDesc: {
      en: 'Accurate online form filling for recruitment exams, college admissions, utility connections, and portals.',
      pa: 'ਨੌਕਰੀਆਂ ਦੇ ਫਾਰਮ, ਕਾਲਜ ਦਾਖਲੇ, ਬਿੱਲ ਭੁਗਤਾਨ ਅਤੇ ਹੋਰ ਆਨਲਾਈਨ ਅਰਜ਼ੀਆਂ ਭਰਨ ਦੀ ਸਹੂਲਤ।',
    },
    detailedDesc: {
      en: 'Error-free online form submission with properly resized photo/signature uploads, fee payment confirmation receipts, and admit card or confirmation page printouts.',
      pa: 'ਸਹੀ ਫੋਟੋ ਅਤੇ ਦਸਤਖ਼ਤ ਅਪਲੋਡ ਕਰਕੇ ਬਿਨਾਂ ਕਿਸੇ ਗਲਤੀ ਦੇ ਆਨਲਾਈਨ ਫਾਰਮ ਭਰਨ, ਫੀਸ ਜਮ੍ਹਾਂ ਕਰਨ ਅਤੇ ਰਸੀਦ ਪ੍ਰਿੰਟ ਕਰਨ ਦੀ ਸੇਵਾ।',
    },
    preparationList: {
      en: [
        'Academic certificates and mark sheets',
        'Passport-size photograph and clear signature on white paper',
        'Category / Residence certificate (if claiming reservation)',
      ],
      pa: [
        'ਪੜ੍ਹਾਈ ਦੇ ਸਰਟੀਫਿਕੇਟ ਅਤੇ ਮਾਰਕ ਸ਼ੀਟਾਂ',
        'ਪਾਸਪੋਰਟ ਸਾਈਜ਼ ਫੋਟੋ ਅਤੇ ਦਸਤਖ਼ਤ',
        'ਜਾਤੀ ਜਾਂ ਰਿਹਾਇਸ਼ ਸਰਟੀਫਿਕੇਟ (ਜੇ ਲੋੜ ਹੋਵੇ)',
      ],
    },
    turnaroundNote: {
      en: 'Processed according to official portal timelines and examination board rules.',
      pa: 'ਸਬੰਧਤ ਬੋਰਡ ਜਾਂ ਪੋਰਟਲ ਦੀਆਂ ਆਖਰੀ ਮਿਤੀਆਂ ਅਤੇ ਨਿਯਮਾਂ ਅਨੁਸਾਰ।',
    },
  },
  {
    id: 'government-scheme-assistance',
    categoryId: 'digital',
    iconName: 'Landmark',
    badge: 'new',
    title: {
      en: 'Government Scheme Application Assistance',
      pa: 'ਸਰਕਾਰੀ ਸਕੀਮਾਂ ਲਈ ਅਰਜ਼ੀ ਸਹਾਇਤਾ',
    },
    shortDesc: {
      en: 'Guidance and online registration support for central and Punjab state welfare, pension, and subsidy schemes.',
      pa: 'ਕੇਂਦਰ ਅਤੇ ਪੰਜਾਬ ਸਰਕਾਰ ਦੀਆਂ ਭਲਾਈ ਸਕੀਮਾਂ, ਪੈਨਸ਼ਨ ਅਤੇ ਸਬਸਿਡੀ ਫਾਰਮਾਂ ਲਈ ਸਹਾਇਤਾ।',
    },
    detailedDesc: {
      en: 'Helping citizens understand eligibility requirements, organize supporting affidavits/certificates, and submit applications on official state and central government welfare portals.',
      pa: 'ਸਰਕਾਰੀ ਭਲਾਈ ਸਕੀਮਾਂ ਦੀਆਂ ਸ਼ਰਤਾਂ ਸਮਝਣ, ਲੋੜੀਂਦੇ ਫਾਰਮ ਤਿਆਰ ਕਰਨ ਅਤੇ ਅਧਿਕਾਰਤ ਪੋਰਟਲ ਤੇ ਅਰਜ਼ੀ ਸਬਮਿਟ ਕਰਨ ਵਿੱਚ ਪੂਰੀ ਮਦਦ।',
    },
    preparationList: {
      en: [
        'Aadhaar Card and Aadhaar-seeded Bank Passbook copy',
        'Punjab Residence / Caste / Income Certificate as required by scheme',
        'Passport-size photographs and active mobile number',
      ],
      pa: [
        'ਆਧਾਰ ਕਾਰਡ ਅਤੇ ਬੈਂਕ ਕਾਪੀ ਦੀ ਫੋਟੋਸਟੇਟ',
        'ਰਿਹਾਇਸ਼ / ਜਾਤੀ / ਆਮਦਨ ਸਰਟੀਫਿਕੇਟ (ਸਕੀਮ ਅਨੁਸਾਰ)',
        'ਪਾਸਪੋਰਟ ਸਾਈਜ਼ ਫੋਟੋ ਅਤੇ ਮੋਬਾਈਲ ਨੰਬਰ',
      ],
    },
    turnaroundNote: {
      en: 'Benefit disbursement is strictly subject to government department verification and eligibility.',
      pa: 'ਸਕੀਮ ਦਾ ਲਾਭ ਸਰਕਾਰੀ ਵਿਭਾਗ ਦੀ ਜਾਂਚ ਅਤੇ ਯੋਗਤਾ ਦੇ ਅਧੀਨ ਹੈ।',
    },
  },
  {
    id: 'digital-documentation',
    categoryId: 'digital',
    iconName: 'FileText',
    badge: 'new',
    title: {
      en: 'Digital Documentation',
      pa: 'ਡਿਜੀਟਲ ਦਸਤਾਵੇਜ਼ ਸੇਵਾਵਾਂ',
    },
    shortDesc: {
      en: 'Punjabi/English typing, Bio-data/CV creation, PDF merging, DigiLocker setup, and document formatting.',
      pa: 'ਪੰਜਾਬੀ/ਅੰਗਰੇਜ਼ੀ ਟਾਈਪਿੰਗ, ਬਾਇਓ-ਡਾਟਾ (CV), ਪੀਡੀਐਫ ਫਾਈਲਾਂ ਅਤੇ ਡਿਜੀਲੌਕਰ ਸਹਾਇਤਾ।',
    },
    detailedDesc: {
      en: 'Professional document preparation including bilingual English and Gurmukhi Punjabi typing, resume design, PDF compression for portals, and digital record organization.',
      pa: 'ਪੰਜਾਬੀ ਅਤੇ ਅੰਗਰੇਜ਼ੀ ਵਿੱਚ ਸਾਫ਼-ਸੁਥਰੀ ਟਾਈਪਿੰਗ, ਪ੍ਰੋਫੈਸ਼ਨਲ ਰੈਜ਼ਿਊਮੇ (CV) ਤਿਆਰ ਕਰਨ, ਪੀਡੀਐਫ ਸਾਈਜ਼ ਸੈੱਟ ਕਰਨ ਅਤੇ ਡਿਜੀਲੌਕਰ ਸੇਵਾਵਾਂ।',
    },
    preparationList: {
      en: [
        'Handwritten draft or existing document copy for typing/formatting',
        'Qualification and experience notes for CV/Resume creation',
        'Original documents if high-resolution PDF scanning is required',
      ],
      pa: [
        'ਟਾਈਪਿੰਗ ਲਈ ਲਿਖਤੀ ਖਰੜਾ ਜਾਂ ਪੁਰਾਣੇ ਕਾਗਜ਼ਾਤ',
        'ਬਾਇਓ-ਡਾਟਾ ਬਣਾਉਣ ਲਈ ਪੜ੍ਹਾਈ ਅਤੇ ਤਜਰਬੇ ਦੇ ਵੇਰਵੇ',
        'ਸਕੈਨਿੰਗ ਲਈ ਅਸਲ ਦਸਤਾਵੇਜ਼',
      ],
    },
    turnaroundNote: {
      en: 'Fast same-day formatting and digital delivery via WhatsApp or Email.',
      pa: 'ਉਸੇ ਦਿਨ ਤਿਆਰ ਕਰਕੇ ਵਟਸਐਪ ਜਾਂ ਈਮੇਲ ਰਾਹੀਂ ਡਿਲੀਵਰੀ।',
    },
  },
  {
    id: 'other-citizen-services',
    categoryId: 'digital',
    iconName: 'Users',
    title: {
      en: 'Other Citizen Services',
      pa: 'ਹੋਰ ਨਾਗਰਿਕ ਸੇਵਾਵਾਂ',
    },
    shortDesc: {
      en: 'Residence, Caste, Income certificate file preparation, Voter ID support, Udyam MSME, and utility bill services.',
      pa: 'ਰਿਹਾਇਸ਼, ਜਾਤੀ, ਆਮਦਨ ਸਰਟੀਫਿਕੇਟ ਫਾਈਲ ਤਿਆਰੀ, ਵੋਟਰ ਕਾਰਡ ਅਤੇ ਹੋਰ ਰੋਜ਼ਾਨਾ ਨਾਗਰਿਕ ਸੇਵਾਵਾਂ।',
    },
    detailedDesc: {
      en: 'All-in-one local desk for everyday citizen paperwork—including e-Sewa certificate file compilation, Voter ID (NVSP) applications, food/FSSAI basic registration, and travel ticket assistance.',
      pa: 'ਈ-ਸੇਵਾ ਸਰਟੀਫਿਕੇਟਾਂ ਦੀਆਂ ਫਾਈਲਾਂ ਤਿਆਰ ਕਰਨ, ਵੋਟਰ ਕਾਰਡ, ਉਦਯਮ ਰਜਿਸਟ੍ਰੇਸ਼ਨ ਅਤੇ ਹੋਰ ਰੋਜ਼ਾਨਾ ਲੋੜੀਂਦੇ ਦਸਤਾਵੇਜ਼ੀ ਕੰਮਾਂ ਲਈ ਇੱਕੋ ਛੱਤ ਹੇਠ ਸਹੂਲਤ।',
    },
    preparationList: {
      en: [
        'Applicant Aadhaar Card and Family Ration Card / Voter ID',
        'Patwari / Sarpanch / MC verification report format where applicable',
        'Passport-size photograph and self-declaration form',
      ],
      pa: [
        'ਆਧਾਰ ਕਾਰਡ ਅਤੇ ਵੋਟਰ ਕਾਰਡ / ਰਾਸ਼ਨ ਕਾਰਡ',
        'ਪਟਵਾਰੀ / ਸਰਪੰਚ / ਐਮ.ਸੀ. ਤਸਦੀਕ ਫਾਰਮ (ਲੋੜ ਅਨੁਸਾਰ)',
        'ਪਾਸਪੋਰਟ ਸਾਈਜ਼ ਫੋਟੋ ਅਤੇ ਸਵੈ-ਘੋਸ਼ਣਾ ਪੱਤਰ',
      ],
    },
    turnaroundNote: {
      en: 'Subject to e-Sewa Punjab and respective authority approval timelines.',
      pa: 'ਈ-ਸੇਵਾ ਪੰਜਾਬ ਅਤੇ ਸਬੰਧਤ ਅਧਿਕਾਰੀ ਦੀ ਮਨਜ਼ੂਰੀ ਅਧੀਨ।',
    },
  },
];

export const CATEGORY_LABELS: Record<
  ServiceCategoryId,
  { en: string; pa: string; subtitleEn: string; subtitlePa: string }
> = {
  documentation: {
    en: 'Documentation Services',
    pa: 'ਦਸਤਾਵੇਜ਼ ਸੇਵਾਵਾਂ (Documentation)',
    subtitleEn: 'Essential identity, travel, and civic record assistance.',
    subtitlePa: 'ਪਛਾਣ ਪੱਤਰ, ਪਾਸਪੋਰਟ, ਲਾਇਸੈਂਸ ਅਤੇ ਜ਼ਰੂਰੀ ਕਾਗਜ਼ਾਤ ਲਈ ਸਹਾਇਤਾ।',
  },
  financial: {
    en: 'Financial Services',
    pa: 'ਵਿੱਤੀ ਅਤੇ ਲੋਨ ਸੇਵਾਵਾਂ (Financial)',
    subtitleEn: 'Structured loan consultancy and comprehensive insurance assistance.',
    subtitlePa: 'ਹਰ ਤਰ੍ਹਾਂ ਦੇ ਲੋਨ ਅਤੇ ਬੀਮਾ ਸੇਵਾਵਾਂ ਲਈ ਮਾਹਿਰ ਸਲਾਹ।',
  },
  property: {
    en: 'Property Services',
    pa: 'ਪ੍ਰਾਪਰਟੀ ਸੇਵਾਵਾਂ (Property)',
    subtitleEn: 'Transparent property advisory, consultancy, and land record support.',
    subtitlePa: 'ਪ੍ਰਾਪਰਟੀ ਦੀ ਖਰੀਦ-ਵੇਚ, ਸਲਾਹ ਅਤੇ ਜ਼ਮੀਨੀ ਰਿਕਾਰਡ ਸਬੰਧੀ ਸਹਾਇਤਾ।',
  },
  digital: {
    en: 'Digital & Government Services',
    pa: 'ਡਿਜੀਟਲ ਅਤੇ ਸਰਕਾਰੀ ਸੇਵਾਵਾਂ',
    subtitleEn: 'Online portals, welfare scheme applications, and citizen documentation.',
    subtitlePa: 'ਆਨਲਾਈਨ ਫਾਰਮ, ਸਰਕਾਰੀ ਸਕੀਮਾਂ ਅਤੇ ਨਾਗਰਿਕ ਸੇਵਾਵਾਂ।',
  },
};

export const UI_TEXT = {
  en: {
    brandName: 'M Bee Enterprises',
    proprietorLabel: 'Proprietors: Baljinder Singh & Manpreet Singh',
    locationTag:
      'M Bee Enterprises, Bank of Baroda, near Bus Stand, near Mahilpur, Mahilpur, Punjab 146105',
    nav: {
      home: 'Home',
      about: 'About Us',
      services: 'All Services',
      loans: 'Loan Services',
      insurance: 'Insurance',
      documentation: 'Documentation',
      property: 'Property Advisor',
      contact: 'Contact Us',
      profile: 'My Profile & Name',
      enquireCta: 'Submit Enquiry',
    },
    hero: {
      kicker: 'M Bee Enterprises · Prop. Baljinder Singh & Manpreet Singh · Mahilpur, Punjab 146105',
      heading: 'Your Trusted Partner for Financial & Documentation Services',
      subheading: 'Smart Solutions. Trusted Services. Hassle-Free Experience.',
      description:
        'Under the personal guidance of Baljinder Singh & Manpreet Singh at M Bee Enterprises, Bank of Baroda, near Bus Stand, near Mahilpur, Mahilpur, Punjab 146105, our centre provides structured assistance for loan consultancy, insurance policies, citizen documentation, and property advisory.',
      getStarted: 'Get Started',
      exploreServices: 'Explore Our Services',
      callNow: 'Call Now',
      whatsappBtn: 'WhatsApp Direct',
    },
    highlights: [
      {
        value: '4 Core Verticals',
        label: 'Service Domains',
        detail: 'Documentation, Financial Consultancy, Insurance & Property Advisory',
      },
      {
        value: '19+ Dedicated Desks',
        label: 'Citizen & Business Solutions',
        detail: 'Aadhaar, PAN, Passport, DL, Loans, Insurance & Land Records',
      },
      {
        value: 'Bilingual Support',
        label: 'Punjabi & English',
        detail: 'Clear guidance and typing in both Gurmukhi Punjabi and English',
      },
      {
        value: '100% Transparent',
        label: 'Ethical Checklist Process',
        detail: 'Direct proprietor oversight with clear document checklists',
      },
    ],
    authorityNotice:
      'Important Notice: M Bee Enterprises is an independent financial consultancy and documentation assistance centre. Official approvals, certificates, and government services are strictly subject to the relevant government authority or lending institution rules and eligibility criteria.',
    servicesSection: {
      heading: 'Comprehensive Financial & Citizen Services',
      subheading:
        'Select any category below to view required document checklists or start a direct WhatsApp enquiry with our desk.',
      allCategories: 'All Categories',
      learnMore: 'Learn More & Checklist',
      whatsappEnquire: 'Enquire on WhatsApp',
    },
    loanCalculator: {
      kicker: 'Interactive Financial Planning Tool',
      heading: 'Loan EMI & Repayment Calculator',
      subheading:
        'Estimate your monthly installment, total interest outgo, and yearly repayment schedule before applying for a Personal, Home, Car, or Business Loan.',
      loanAmountLabel: 'Loan Amount (₹)',
      interestRateLabel: 'Annual Interest Rate (% p.a.)',
      tenureLabel: 'Loan Duration',
      yearsUnit: 'Years',
      monthsUnit: 'Months',
      monthlyEmiLabel: 'Estimated Monthly EMI',
      principalLabel: 'Principal Amount',
      totalInterestLabel: 'Total Interest Payable',
      totalRepaymentLabel: 'Total Repayment (Principal + Interest)',
      scheduleHeading: 'Yearly Amortization Breakdown',
      yearCol: 'Year',
      principalCol: 'Principal Paid',
      interestCol: 'Interest Paid',
      balanceCol: 'Closing Balance',
      discussBtn: 'Discuss Your Loan on WhatsApp',
      disclaimer:
        'Disclaimer: This EMI calculator is for illustrative financial planning only. M Bee Enterprises does not promise guaranteed loan approval or fixed interest rates. Final sanction, interest rates, and processing fees are determined solely by the respective bank or NBFC based on applicant eligibility and credit assessment.',
    },
    insuranceSection: {
      kicker: 'Protection & Policy Advisory',
      heading: 'Dedicated Insurance Consultation & Policy Assistance',
      subheading:
        'Protect your vehicle, family health, life, and international travel with clear policy comparisons and timely renewal reminders.',
      pillars: [
        {
          title: 'Motor & Commercial Vehicle Insurance',
          desc: 'Instant policy comparison and renewal assistance for two-wheelers, private cars, tractors, and commercial vehicles.',
        },
        {
          title: 'Family Health & Mediclaim Advisory',
          desc: 'Understand hospital network coverage, waiting periods, and cashless claim documentation for individuals and families.',
        },
        {
          title: 'Life, Term & Travel Protection',
          desc: 'Structured consultation for family financial security and mandatory international student/visitor travel insurance.',
        },
      ],
      callbackBtn: 'Request Insurance Callback',
      whatsappBtn: 'Send Policy Copy for Renewal Quote',
    },
    enquirySection: {
      kicker: 'Smart Documentation & Service Desk',
      heading: 'Submit a Service or Documentation Enquiry',
      subheading:
        'Share your basic contact details and required service. We will guide you with the exact document checklist before you visit our office.',
      securityNote:
        'Privacy & Security Guardrail: Never enter your Aadhaar number, PAN number, bank account number, password, or OTP in this public enquiry form.',
      nameLabel: 'Your Full Name',
      namePlaceholder: 'e.g., Gurpreet Singh',
      mobileLabel: '10-Digit Mobile Number',
      mobilePlaceholder: 'e.g., 9876543210',
      serviceLabel: 'Select Required Service',
      servicePlaceholder: 'Choose a service...',
      contactMethodLabel: 'Preferred Contact Method',
      methods: {
        whatsapp: 'WhatsApp Message',
        call: 'Phone Call',
        email: 'Email Reply',
      },
      messageLabel: 'Your Requirement / Query',
      messagePlaceholder:
        'Briefly mention what assistance you need (do not include Aadhaar/PAN numbers)...',
      submitBtn: 'Submit Enquiry',
      successHeading: 'Enquiry Recorded Successfully',
      successBody:
        'Your request has been logged for Baljinder Singh & Manpreet Singh. For the fastest response, click below to send your formatted enquiry directly to our official WhatsApp desk.',
      sendWhatsappNow: 'Send Directly via WhatsApp Now',
      newEnquiryBtn: 'Submit Another Enquiry',
      recentEnquiriesTitle: 'Your Session Enquiries',
    },
    aboutSection: {
      heading: 'Welcome to M Bee Enterprises',
      description:
        'M Bee Enterprises, under the guidance of Baljinder Singh & Manpreet Singh, aims to provide convenient assistance for financial services, insurance, documentation and property consultancy. Our goal is to make everyday services simpler and more accessible.',
      storyParagraph:
        'Located in Punjab, our centre bridges the gap between complex digital portals, banking paperwork, and everyday citizens. Whether you are preparing a home loan file, updating family identity documents, renewing vehicle insurance, or seeking transparent property advice, we treat every file with personal responsibility and clarity.',
      values: [
        {
          title: 'Proprietor-Led Accountability',
          desc: 'Direct consultation with Baljinder Singh & Manpreet Singh ensures accurate guidance and respectful handling of your paperwork.',
        },
        {
          title: 'Complete Transparency',
          desc: 'Clear checklists upfront with honest explanations of official timelines, rules, and eligibility requirements.',
        },
        {
          title: 'Multi-Service Convenience',
          desc: 'From photostat and typing to loan files and property advisory—everything organized under one roof.',
        },
      ],
    },
    testimonialsSection: {
      heading: 'Client Feedback & Verified Service Standards',
      subheading:
        'We believe in complete honesty—we never display fabricated ratings or invented customer testimonials. Real clients who visit M Bee Enterprises can share their genuine service feedback directly below or via WhatsApp.',
      addFeedbackBtn: 'Share Your Genuine Experience',
    },
    faqSection: {
      heading: 'Frequently Asked Questions',
      items: [
        {
          q: 'Do I need to bring original documents when visiting M Bee Enterprises?',
          a: 'Yes, for most online applications (such as Passport, PAN, Driving Licence, or e-Sewa certificates), carrying original documents for clean scanning along with one photocopy set helps avoid errors. You can message us on WhatsApp first to get the exact checklist.',
        },
        {
          q: 'Does M Bee Enterprises guarantee loan approval or government certificate issuance?',
          a: 'No. We provide professional consultancy, file preparation, and online application assistance. Final loan sanctions are decided solely by the respective bank/NBFC, and certificates/identities are issued by the respective government authority based on your eligibility.',
        },
        {
          q: 'Should I share my Aadhaar number, PAN number, or OTP in the website form?',
          a: 'Never share sensitive identity numbers, passwords, or OTPs on any public website form. Use our website form only to request a callback or checklist, and verify documents directly during your consultation.',
        },
        {
          q: 'Can I enquire in Punjabi on WhatsApp or over a phone call?',
          a: 'Absolutely! Baljinder Singh, Manpreet Singh, and our desk provide complete support in both Punjabi (ਪੰਜਾਬੀ) and English on 82888-37597 and 99156-28427.',
        },
      ],
    },
    contactSection: {
      heading: 'Contact M Bee Enterprises',
      subheading:
        'Connect directly via phone, WhatsApp, or visit our office during working hours.',
      proprietor: 'Baljinder Singh & Manpreet Singh (Proprietors)',
      phonesLabel: 'Direct Contact Numbers',
      emailLabel: 'Official Email',
      hoursLabel: 'Business Hours (Configurable)',
      locationLabel: 'Office Location & Directions',
      configureBtn: 'Configure Shop Address & Timings',
      saveConfigBtn: 'Save Office Details',
    },
  },
  pa: {
    brandName: 'ਐਮ ਬੀ ਐਂਟਰਪ੍ਰਾਈਜ਼ਿਜ਼ (M Bee Enterprises)',
    proprietorLabel: 'ਪ੍ਰੋਪਰਾਈਟਰ: ਬਲਜਿੰਦਰ ਸਿੰਘ ਅਤੇ ਮਨਪ੍ਰੀਤ ਸਿੰਘ',
    locationTag:
      'ਐਮ ਬੀ ਐਂਟਰਪ੍ਰਾਈਜ਼ਿਜ਼ (M Bee Enterprises), ਬੈਂਕ ਆਫ ਬੜੌਦਾ ਦੇ ਨੇੜੇ, ਬੱਸ ਸਟੈਂਡ ਦੇ ਨੇੜੇ, ਮਾਹਿਲਪੁਰ, ਪੰਜਾਬ 146105',
    nav: {
      home: 'ਮੁੱਖ ਪੰਨਾ',
      about: 'ਸਾਡੇ ਬਾਰੇ',
      services: 'ਸਾਰੀਆਂ ਸੇਵਾਵਾਂ',
      loans: 'ਲੋਨ ਸੇਵਾਵਾਂ',
      insurance: 'ਬੀਮਾ ਸੇਵਾਵਾਂ',
      documentation: 'ਦਸਤਾਵੇਜ਼ ਸੇਵਾਵਾਂ',
      property: 'ਪ੍ਰਾਪਰਟੀ ਸਲਾਹਕਾਰ',
      contact: 'ਸੰਪਰਕ ਕਰੋ',
      profile: 'ਮੇਰੀ ਪ੍ਰੋਫਾਈਲ (ਨਾਮ)',
      enquireCta: 'ਪੁੱਛਗਿੱਛ ਭੇਜੋ',
    },
    hero: {
      kicker: 'ਐਮ ਬੀ ਐਂਟਰਪ੍ਰਾਈਜ਼ਿਜ਼ · ਪ੍ਰੋ. ਬਲਜਿੰਦਰ ਸਿੰਘ ਅਤੇ ਮਨਪ੍ਰੀਤ ਸਿੰਘ · ਮਾਹਿਲਪੁਰ, ਪੰਜਾਬ 146105',
      heading: 'ਵਿੱਤੀ ਅਤੇ ਦਸਤਾਵੇਜ਼ੀ ਸੇਵਾਵਾਂ ਲਈ ਤੁਹਾਡਾ ਭਰੋਸੇਯੋਗ ਸਾਥੀ',
      subheading: 'ਸਮਾਰਟ ਹੱਲ। ਭਰੋਸੇਯੋਗ ਸੇਵਾਵਾਂ। ਬਿਨਾਂ ਕਿਸੇ ਪਰੇਸ਼ਾਨੀ ਦੇ ਤਜਰਬਾ।',
      description:
        'ਪ੍ਰੋਪਰਾਈਟਰ ਬਲਜਿੰਦਰ ਸਿੰਘ ਅਤੇ ਮਨਪ੍ਰੀਤ ਸਿੰਘ ਦੀ ਅਗਵਾਈ ਹੇਠ (ਐਮ ਬੀ ਐਂਟਰਪ੍ਰਾਈਜ਼ਿਜ਼, ਬੈਂਕ ਆਫ ਬੜੌਦਾ ਦੇ ਨੇੜੇ, ਬੱਸ ਸਟੈਂਡ ਦੇ ਨੇੜੇ, ਮਾਹਿਲਪੁਰ, ਪੰਜਾਬ 146105), ਸਾਡਾ ਕੇਂਦਰ ਲੋਨ ਸਲਾਹਕਾਰ, ਬੀਮਾ ਸੇਵਾਵਾਂ, ਜ਼ਰੂਰੀ ਦਸਤਾਵੇਜ਼ ਅਤੇ ਪ੍ਰਾਪਰਟੀ ਕੰਸਲਟੈਂਸੀ ਲਈ ਸੁਵਿਧਾਜਨਕ ਅਤੇ ਪਾਰਦਰਸ਼ੀ ਸਹਾਇਤਾ ਪ੍ਰਦਾਨ ਕਰਦਾ ਹੈ।',
      getStarted: 'ਸ਼ੁਰੂਆਤ ਕਰੋ',
      exploreServices: 'ਸਾਡੀਆਂ ਸੇਵਾਵਾਂ ਦੇਖੋ',
      callNow: 'ਹੁਣੇ ਕਾਲ ਕਰੋ',
      whatsappBtn: 'ਵਟਸਐਪ ਤੇ ਗੱਲ ਕਰੋ',
    },
    highlights: [
      {
        value: '4 ਮੁੱਖ ਖੇਤਰ',
        label: 'ਸੇਵਾਵਾਂ ਦੇ ਵਿਭਾਗ',
        detail: 'ਦਸਤਾਵੇਜ਼, ਲੋਨ ਸਲਾਹਕਾਰ, ਬੀਮਾ ਅਤੇ ਪ੍ਰਾਪਰਟੀ ਕੰਸਲਟੈਂਸੀ',
      },
      {
        value: '19+ ਵਿਸ਼ੇਸ਼ ਸੇਵਾਵਾਂ',
        label: 'ਨਾਗਰਿਕ ਅਤੇ ਕਾਰੋਬਾਰੀ ਹੱਲ',
        detail: 'ਆਧਾਰ, ਪੈਨ, ਪਾਸਪੋਰਟ, ਲਾਇਸੈਂਸ, ਲੋਨ, ਬੀਮਾ ਅਤੇ ਜ਼ਮੀਨੀ ਰਿਕਾਰਡ',
      },
      {
        value: 'ਪੰਜਾਬੀ ਅਤੇ ਅੰਗਰੇਜ਼ੀ',
        label: 'ਦੋ-ਭਾਸ਼ੀ ਸਹਾਇਤਾ',
        detail: 'ਗੁਰਮੁਖੀ ਪੰਜਾਬੀ ਅਤੇ ਅੰਗਰੇਜ਼ੀ ਦੋਵਾਂ ਭਾਸ਼ਾਵਾਂ ਵਿੱਚ ਪੂਰੀ ਜਾਣਕਾਰੀ ਤੇ ਟਾਈਪਿੰਗ',
      },
      {
        value: '100% ਪਾਰਦਰਸ਼ਤਾ',
        label: 'ਭਰੋਸੇਯੋਗ ਪ੍ਰਕਿਰਿਆ',
        detail: 'ਸਹੀ ਦਸਤਾਵੇਜ਼ ਸੂਚੀ ਅਤੇ ਨਿੱਜੀ ਤੌਰ ਤੇ ਜ਼ਿੰਮੇਵਾਰ ਮਾਰਗਦਰਸ਼ਨ',
      },
    ],
    authorityNotice:
      'ਜ਼ਰੂਰੀ ਸੂਚਨਾ: ਐਮ ਬੀ ਐਂਟਰਪ੍ਰਾਈਜ਼ਿਜ਼ ਇੱਕ ਸੁਤੰਤਰ ਵਿੱਤੀ ਸਲਾਹਕਾਰ ਅਤੇ ਦਸਤਾਵੇਜ਼ ਸਹਾਇਤਾ ਕੇਂਦਰ ਹੈ। ਸਾਰੀਆਂ ਸਰਕਾਰੀ ਮਨਜ਼ੂਰੀਆਂ, ਸਰਟੀਫਿਕੇਟ ਅਤੇ ਬੈਂਕ ਲੋਨ ਸਬੰਧਤ ਸਰਕਾਰੀ ਵਿਭਾਗ ਜਾਂ ਬੈਂਕ ਦੇ ਨਿਯਮਾਂ ਅਤੇ ਯੋਗਤਾ ਦੇ ਅਧੀਨ ਹਨ।',
    servicesSection: {
      heading: 'ਸੰਪੂਰਨ ਵਿੱਤੀ ਅਤੇ ਦਸਤਾਵੇਜ਼ੀ ਸੇਵਾਵਾਂ',
      subheading:
        'ਲੋੜੀਂਦੇ ਦਸਤਾਵੇਜ਼ਾਂ ਦੀ ਸੂਚੀ ਦੇਖਣ ਜਾਂ ਸਿੱਧੀ ਵਟਸਐਪ ਪੁੱਛਗਿੱਛ ਕਰਨ ਲਈ ਹੇਠਾਂ ਦਿੱਤੀ ਕਿਸੇ ਵੀ ਸੇਵਾ ਦੀ ਚੋਣ ਕਰੋ।',
      allCategories: 'ਸਾਰੀਆਂ ਸ਼੍ਰੇਣੀਆਂ',
      learnMore: 'ਪੂਰੀ ਜਾਣਕਾਰੀ ਅਤੇ ਦਸਤਾਵੇਜ਼',
      whatsappEnquire: 'ਵਟਸਐਪ ਤੇ ਪੁੱਛੋ',
    },
    loanCalculator: {
      kicker: 'ਇੰਟਰਐਕਟਿਵ ਲੋਨ ਕਿਸ਼ਤ ਕੈਲਕੁਲੇਟਰ',
      heading: 'ਲੋਨ EMI ਅਤੇ ਭੁਗਤਾਨ ਕੈਲਕੁਲੇਟਰ',
      subheading:
        'ਪਰਸਨਲ, ਹੋਮ, ਕਾਰ ਜਾਂ ਬਿਜ਼ਨਸ ਲੋਨ ਲਈ ਅਪਲਾਈ ਕਰਨ ਤੋਂ ਪਹਿਲਾਂ ਆਪਣੀ ਮਹੀਨਾਵਾਰ ਕਿਸ਼ਤ (EMI) ਅਤੇ ਕੁੱਲ ਵਿਆਜ ਦਾ ਅੰਦਾਜ਼ਾ ਲਗਾਓ।',
      loanAmountLabel: 'ਲੋਨ ਦੀ ਰਕਮ (₹)',
      interestRateLabel: 'ਸਾਲਾਨਾ ਵਿਆਜ ਦਰ (% ਪ੍ਰਤੀ ਸਾਲ)',
      tenureLabel: 'ਲੋਨ ਦਾ ਸਮਾਂ',
      yearsUnit: 'ਸਾਲ',
      monthsUnit: 'ਮਹੀਨੇ',
      monthlyEmiLabel: 'ਅਨੁਮਾਨਿਤ ਮਹੀਨਾਵਾਰ ਕਿਸ਼ਤ (EMI)',
      principalLabel: 'ਮੂਲ ਰਕਮ (Principal)',
      totalInterestLabel: 'ਕੁੱਲ ਵਿਆਜ',
      totalRepaymentLabel: 'ਕੁੱਲ ਵਾਪਸੀ ਰਕਮ',
      scheduleHeading: 'ਸਾਲਾਨਾ ਭੁਗਤਾਨ ਵੇਰਵਾ',
      yearCol: 'ਸਾਲ',
      principalCol: 'ਮੂਲ ਭੁਗਤਾਨ',
      interestCol: 'ਵਿਆਜ ਭੁਗਤਾਨ',
      balanceCol: 'ਬਾਕੀ ਰਕਮ',
      discussBtn: 'ਵਟਸਐਪ ਤੇ ਲੋਨ ਬਾਰੇ ਸਲਾਹ ਲਓ',
      disclaimer:
        'ਸੂਚਨਾ: ਇਹ EMI ਕੈਲਕੁਲੇਟਰ ਸਿਰਫ਼ ਅੰਦਾਜ਼ੇ ਲਈ ਹੈ। ਐਮ ਬੀ ਐਂਟਰਪ੍ਰਾਈਜ਼ਿਜ਼ ਪੱਕੇ ਲੋਨ ਪਾਸ ਹੋਣ ਜਾਂ ਨਿਸ਼ਚਿਤ ਵਿਆਜ ਦਰ ਦਾ ਵਾਅਦਾ ਨਹੀਂ ਕਰਦਾ। ਅੰਤਿਮ ਮਨਜ਼ੂਰੀ ਅਤੇ ਵਿਆਜ ਦਰ ਬੈਂਕ ਦੇ ਨਿਯਮਾਂ ਤੇ ਨਿਰਭਰ ਕਰਦੀ ਹੈ।',
    },
    insuranceSection: {
      kicker: 'ਸੁਰੱਖਿਆ ਅਤੇ ਬੀਮਾ ਸਲਾਹਕਾਰ',
      heading: 'ਬੀਮਾ (Insurance) ਸਲਾਹ ਅਤੇ ਪਾਲਿਸੀ ਸਹਾਇਤਾ',
      subheading:
        'ਆਪਣੇ ਵਾਹਨ, ਪਰਿਵਾਰ ਦੀ ਸਿਹਤ, ਜੀਵਨ ਅਤੇ ਵਿਦੇਸ਼ ਯਾਤਰਾ ਲਈ ਸਹੀ ਬੀਮਾ ਪਾਲਿਸੀ ਦੀ ਚੋਣ ਅਤੇ ਸਮੇਂ ਸਿਰ ਰੀਨਿਊਅਲ ਸਹਾਇਤਾ।',
      pillars: [
        {
          title: 'ਵਾਹਨ ਬੀਮਾ (ਦੋ-ਪਹੀਆ, ਕਾਰ ਅਤੇ ਕਮਰਸ਼ੀਅਲ)',
          desc: 'ਸਕੂਟਰ, ਮੋਟਰਸਾਈਕਲ, ਕਾਰ, ਟਰੈਕਟਰ ਅਤੇ ਕਮਰਸ਼ੀਅਲ ਗੱਡੀਆਂ ਦੇ ਬੀਮੇ ਦੀ ਤੁਰੰਤ ਤੁਲਨਾ ਅਤੇ ਰੀਨਿਊਅਲ।',
        },
        {
          title: 'ਸਿਹਤ ਅਤੇ ਮੈਡੀਕਲੇਮ ਬੀਮਾ ਸਲਾਹ',
          desc: 'ਪਰਿਵਾਰਕ ਸਿਹਤ ਬੀਮਾ, ਹਸਪਤਾਲ ਨੈੱਟਵਰਕ ਅਤੇ ਕੈਸ਼ਲੈੱਸ ਕਲੇਮ ਦਸਤਾਵੇਜ਼ਾਂ ਬਾਰੇ ਸਪੱਸ਼ਟ ਮਾਰਗਦਰਸ਼ਨ।',
        },
        {
          title: 'ਜੀਵਨ ਬੀਮਾ ਅਤੇ ਵਿਦੇਸ਼ ਯਾਤਰਾ ਬੀਮਾ',
          desc: 'ਪਰਿਵਾਰਕ ਸੁਰੱਖਿਆ ਲਈ ਟਰਮ/ਲਾਈਫ ਪਲਾਨ ਅਤੇ ਵਿਦੇਸ਼ ਜਾਣ ਵਾਲੇ ਵਿਦਿਆਰਥੀਆਂ/ਯਾਤਰੀਆਂ ਲਈ ਟਰੈਵਲ ਇੰਸ਼ੋਰੈਂਸ।',
        },
      ],
      callbackBtn: 'ਕਾਲਬੈਕ ਲਈ ਬੇਨਤੀ ਕਰੋ',
      whatsappBtn: 'ਰੀਨਿਊਅਲ ਲਈ ਪੁਰਾਣੀ ਪਾਲਿਸੀ ਵਟਸਐਪ ਕਰੋ',
    },
    enquirySection: {
      kicker: 'ਸਮਾਰਟ ਦਸਤਾਵੇਜ਼ ਅਤੇ ਸੇਵਾ ਪੁੱਛਗਿੱਛ',
      heading: 'ਆਪਣੀ ਲੋੜੀਂਦੀ ਸੇਵਾ ਬਾਰੇ ਪੁੱਛਗਿੱਛ ਭੇਜੋ',
      subheading:
        'ਆਪਣਾ ਨਾਮ, ਮੋਬਾਈਲ ਨੰਬਰ ਅਤੇ ਲੋੜੀਂਦੀ ਸੇਵਾ ਚੁਣੋ। ਦਫ਼ਤਰ ਆਉਣ ਤੋਂ ਪਹਿਲਾਂ ਲੋੜੀਂਦੇ ਕਾਗਜ਼ਾਤ ਦੀ ਸਹੀ ਜਾਣਕਾਰੀ ਪ੍ਰਾਪਤ ਕਰੋ।',
      securityNote:
        'ਸੁਰੱਖਿਆ ਸੂਚਨਾ: ਕਿਰਪਾ ਕਰਕੇ ਇਸ ਆਨਲਾਈਨ ਫਾਰਮ ਵਿੱਚ ਆਪਣਾ ਆਧਾਰ ਨੰਬਰ, ਪੈਨ ਨੰਬਰ, ਪਾਸਵਰਡ ਜਾਂ OTP ਕਦੇ ਨਾ ਲਿਖੋ।',
      nameLabel: 'ਤੁਹਾਡਾ ਪੂਰਾ ਨਾਮ',
      namePlaceholder: 'ਉਦਾਹਰਨ: ਗੁਰਪ੍ਰੀਤ ਸਿੰਘ',
      mobileLabel: '10-ਅੰਕਾਂ ਦਾ ਮੋਬਾਈਲ ਨੰਬਰ',
      mobilePlaceholder: 'ਉਦਾਹਰਨ: 9876543210',
      serviceLabel: 'ਲੋੜੀਂਦੀ ਸੇਵਾ ਚੁਣੋ',
      servicePlaceholder: 'ਸੇਵਾ ਦੀ ਚੋਣ ਕਰੋ...',
      contactMethodLabel: 'ਸੰਪਰਕ ਕਰਨ ਦਾ ਪਸੰਦੀਦਾ ਤਰੀਕਾ',
      methods: {
        whatsapp: 'ਵਟਸਐਪ ਸੁਨੇਹਾ',
        call: 'ਫੋਨ ਕਾਲ',
        email: 'ਈਮੇਲ ਜਵਾਬ',
      },
      messageLabel: 'ਤੁਹਾਡਾ ਸੁਨੇਹਾ / ਲੋੜ',
      messagePlaceholder:
        'ਆਪਣੀ ਲੋੜ ਬਾਰੇ ਸੰਖੇਪ ਵਿੱਚ ਲਿਖੋ (ਆਧਾਰ/ਪੈਨ ਨੰਬਰ ਨਾ ਲਿਖੋ)...',
      submitBtn: 'ਪੁੱਛਗਿੱਛ ਦਰਜ ਕਰੋ',
      successHeading: 'ਤੁਹਾਡੀ ਪੁੱਛਗਿੱਛ ਸਫਲਤਾਪੂਰਵਕ ਦਰਜ ਹੋ ਗਈ ਹੈ',
      successBody:
        'ਤੁਹਾਡੀ ਬੇਨਤੀ ਬਲਜਿੰਦਰ ਸਿੰਘ ਅਤੇ ਮਨਪ੍ਰੀਤ ਸਿੰਘ ਲਈ ਨੋਟ ਕਰ ਲਈ ਗਈ ਹੈ। ਤੁਰੰਤ ਜਵਾਬ ਲਈ ਹੇਠਾਂ ਦਿੱਤੇ ਬਟਨ ਤੇ ਕਲਿੱਕ ਕਰਕੇ ਸਿੱਧਾ ਵਟਸਐਪ ਸੁਨੇਹਾ ਭੇਜੋ।',
      sendWhatsappNow: 'ਹੁਣੇ ਵਟਸਐਪ ਰਾਹੀਂ ਭੇਜੋ',
      newEnquiryBtn: 'ਹੋਰ ਪੁੱਛਗਿੱਛ ਭੇਜੋ',
      recentEnquiriesTitle: 'ਤੁਹਾਡੀਆਂ ਤਾਜ਼ਾ ਪੁੱਛਗਿੱਛਾਂ',
    },
    aboutSection: {
      heading: 'ਐਮ ਬੀ ਐਂਟਰਪ੍ਰਾਈਜ਼ਿਜ਼ ਵਿੱਚ ਤੁਹਾਡਾ ਸੁਆਗਤ ਹੈ',
      description:
        'ਪ੍ਰੋਪਰਾਈਟਰ ਬਲਜਿੰਦਰ ਸਿੰਘ ਅਤੇ ਮਨਪ੍ਰੀਤ ਸਿੰਘ ਦੀ ਅਗਵਾਈ ਹੇਠ ਐਮ ਬੀ ਐਂਟਰਪ੍ਰਾਈਜ਼ਿਜ਼ ਦਾ ਉਦੇਸ਼ ਵਿੱਤੀ ਸੇਵਾਵਾਂ, ਬੀਮਾ, ਦਸਤਾਵੇਜ਼ਾਂ ਅਤੇ ਪ੍ਰਾਪਰਟੀ ਸਲਾਹਕਾਰ ਲਈ ਸੁਵਿਧਾਜਨਕ ਸਹਾਇਤਾ ਪ੍ਰਦਾਨ ਕਰਨਾ ਹੈ। ਸਾਡਾ ਟੀਚਾ ਰੋਜ਼ਾਨਾ ਦੀਆਂ ਸੇਵਾਵਾਂ ਨੂੰ ਸਰਲ ਅਤੇ ਵਧੇਰੇ ਪਹੁੰਚਯੋਗ ਬਣਾਉਣਾ ਹੈ।',
      storyParagraph:
        'ਪੰਜਾਬ ਵਿੱਚ ਸਥਿਤ ਸਾਡਾ ਕੇਂਦਰ ਗੁੰਝਲਦਾਰ ਆਨਲਾਈਨ ਪੋਰਟਲਾਂ, ਬੈਂਕਿੰਗ ਕਾਗਜ਼ਾਤ ਅਤੇ ਆਮ ਨਾਗਰਿਕਾਂ ਵਿਚਕਾਰ ਇੱਕ ਭਰੋਸੇਯੋਗ ਪੁਲ ਵਜੋਂ ਕੰਮ ਕਰਦਾ ਹੈ। ਭਾਵੇਂ ਤੁਸੀਂ ਲੋਨ ਦੀ ਫਾਈਲ ਤਿਆਰ ਕਰਵਾਉਣੀ ਹੋਵੇ, ਆਧਾਰ/ਪੈਨ/ਪਾਸਪੋਰਟ ਦਾ ਕੰਮ ਹੋਵੇ, ਬੀਮਾ ਰੀਨਿਊ ਕਰਵਾਉਣਾ ਹੋਵੇ ਜਾਂ ਪ੍ਰਾਪਰਟੀ ਦੀ ਸਲਾਹ ਲੈਣੀ ਹੋਵੇ—ਅਸੀਂ ਹਰ ਗਾਹਕ ਨੂੰ ਸਹੀ ਅਤੇ ਇਮਾਨਦਾਰ ਸੇਵਾ ਦਿੰਦੇ ਹਾਂ।',
      values: [
        {
          title: 'ਨਿੱਜੀ ਜ਼ਿੰਮੇਵਾਰੀ ਅਤੇ ਮਾਰਗਦਰਸ਼ਨ',
          desc: 'ਬਲਜਿੰਦਰ ਸਿੰਘ ਅਤੇ ਮਨਪ੍ਰੀਤ ਸਿੰਘ ਦੀ ਸਿੱਧੀ ਦੇਖ-ਰੇਖ ਹੇਠ ਤੁਹਾਡੇ ਹਰ ਦਸਤਾਵੇਜ਼ ਦੀ ਸਹੀ ਅਤੇ ਸਤਿਕਾਰਯੋਗ ਸੰਭਾਲ।',
        },
        {
          title: 'ਪੂਰਨ ਪਾਰਦਰਸ਼ਤਾ ਅਤੇ ਵਿਸ਼ਵਾਸ',
          desc: 'ਸਰਕਾਰੀ ਨਿਯਮਾਂ, ਸਮੇਂ ਅਤੇ ਲੋੜੀਂਦੇ ਕਾਗਜ਼ਾਤ ਬਾਰੇ ਪਹਿਲਾਂ ਹੀ ਸਪੱਸ਼ਟ ਅਤੇ ਸੱਚੀ ਜਾਣਕਾਰੀ।',
        },
        {
          title: 'ਇੱਕੋ ਛੱਤ ਹੇਠ ਸਾਰੀਆਂ ਸੇਵਾਵਾਂ',
          desc: 'ਫੋਟੋਸਟੇਟ ਅਤੇ ਟਾਈਪਿੰਗ ਤੋਂ ਲੈ ਕੇ ਲੋਨ ਫਾਈਲਾਂ, ਬੀਮਾ ਅਤੇ ਪ੍ਰਾਪਰਟੀ ਸਲਾਹ ਤੱਕ ਸਾਰੀਆਂ ਸਹੂਲਤਾਂ।',
        },
      ],
    },
    testimonialsSection: {
      heading: 'ਗਾਹਕਾਂ ਦਾ ਭਰੋਸਾ ਅਤੇ ਪ੍ਰਮਾਣਿਕ ਫੀਡਬੈਕ',
      subheading:
        'ਅਸੀਂ ਪੂਰੀ ਇਮਾਨਦਾਰੀ ਵਿੱਚ ਵਿਸ਼ਵਾਸ ਰੱਖਦੇ ਹਾਂ—ਇਸ ਵੈੱਬਸਾਈਟ ਤੇ ਕੋਈ ਵੀ ਬਣਾਉਟੀ ਰੀਵਿਊ ਨਹੀਂ ਲਗਾਇਆ ਗਿਆ। ਸਾਡੇ ਅਸਲ ਗਾਹਕ ਆਪਣਾ ਅਨੁਭਵ ਹੇਠਾਂ ਸਾਂਝਾ ਕਰ ਸਕਦੇ ਹਨ।',
      addFeedbackBtn: 'ਆਪਣਾ ਅਸਲ ਅਨੁਭਵ ਸਾਂਝਾ ਕਰੋ',
    },
    faqSection: {
      heading: 'ਆਮ ਪੁੱਛੇ ਜਾਣ ਵਾਲੇ ਸਵਾਲ (FAQ)',
      items: [
        {
          q: 'ਕੀ ਦਫ਼ਤਰ ਆਉਣ ਸਮੇਂ ਅਸਲ ਦਸਤਾਵੇਜ਼ ਨਾਲ ਲਿਆਉਣੇ ਜ਼ਰੂਰੀ ਹਨ?',
          a: 'ਹਾਂ ਜੀ, ਪਾਸਪੋਰਟ, ਪੈਨ ਕਾਰਡ, ਡਰਾਈਵਿੰਗ ਲਾਇਸੈਂਸ ਜਾਂ ਈ-ਸੇਵਾ ਸਰਟੀਫਿਕੇਟਾਂ ਦੀ ਆਨਲਾਈਨ ਸਕੈਨਿੰਗ ਲਈ ਅਸਲ ਦਸਤਾਵੇਜ਼ ਅਤੇ ਇੱਕ ਫੋਟੋਸਟੇਟ ਸੈੱਟ ਨਾਲ ਲਿਆਉਣਾ ਬਿਹਤਰ ਹੁੰਦਾ ਹੈ। ਤੁਸੀਂ ਆਉਣ ਤੋਂ ਪਹਿਲਾਂ ਵਟਸਐਪ ਤੇ ਸੂਚੀ ਪੁੱਛ ਸਕਦੇ ਹੋ।',
        },
        {
          q: 'ਕੀ ਐਮ ਬੀ ਐਂਟਰਪ੍ਰਾਈਜ਼ਿਜ਼ ਪੱਕੇ ਲੋਨ ਜਾਂ ਸਰਕਾਰੀ ਸਰਟੀਫਿਕੇਟ ਦੀ ਗਰੰਟੀ ਦਿੰਦਾ ਹੈ?',
          a: 'ਨਹੀਂ ਜੀ। ਅਸੀਂ ਸਹੀ ਫਾਈਲ ਤਿਆਰ ਕਰਨ ਅਤੇ ਆਨਲਾਈਨ ਅਰਜ਼ੀ ਭਰਨ ਵਿੱਚ ਸਹਾਇਤਾ ਕਰਦੇ ਹਾਂ। ਲੋਨ ਦੀ ਮਨਜ਼ੂਰੀ ਬੈਂਕ ਦੇ ਨਿਯਮਾਂ ਅਤੇ ਸਰਟੀਫਿਕੇਟ ਦੀ ਮਨਜ਼ੂਰੀ ਸਬੰਧਤ ਸਰਕਾਰੀ ਵਿਭਾਗ ਦੀ ਜਾਂਚ ਤੇ ਨਿਰਭਰ ਕਰਦੀ ਹੈ।',
        },
        {
          q: 'ਕੀ ਮੈਨੂੰ ਵੈੱਬਸਾਈਟ ਫਾਰਮ ਵਿੱਚ ਆਧਾਰ ਨੰਬਰ, ਪੈਨ ਨੰਬਰ ਜਾਂ OTP ਲਿਖਣਾ ਚਾਹੀਦਾ ਹੈ?',
          a: 'ਕਦੇ ਨਹੀਂ। ਆਪਣੀ ਸੁਰੱਖਿਆ ਲਈ ਕਿਸੇ ਵੀ ਜਨਤਕ ਵੈੱਬਸਾਈਟ ਫਾਰਮ ਵਿੱਚ ਆਧਾਰ ਨੰਬਰ, ਪੈਨ ਨੰਬਰ ਜਾਂ OTP ਨਾ ਪਾਓ। ਸਿਰਫ਼ ਆਪਣਾ ਨਾਮ, ਮੋਬਾਈਲ ਨੰਬਰ ਅਤੇ ਲੋੜੀਂਦੀ ਸੇਵਾ ਚੁਣੋ।',
        },
        {
          q: 'ਕੀ ਮੈਂ ਪੰਜਾਬੀ ਵਿੱਚ ਫੋਨ ਜਾਂ ਵਟਸਐਪ ਰਾਹੀਂ ਜਾਣਕਾਰੀ ਲੈ ਸਕਦਾ ਹਾਂ?',
          a: 'ਬਿਲਕੁਲ! ਬਲਜਿੰਦਰ ਸਿੰਘ ਅਤੇ ਮਨਪ੍ਰੀਤ ਸਿੰਘ 82888-37597 ਜਾਂ 99156-28427 ਤੇ ਪੰਜਾਬੀ ਜਾਂ ਅੰਗਰੇਜ਼ੀ ਵਿੱਚ ਪੂਰੀ ਸਹਾਇਤਾ ਦਿੰਦੇ ਹਨ।',
        },
      ],
    },
    contactSection: {
      heading: 'ਐਮ ਬੀ ਐਂਟਰਪ੍ਰਾਈਜ਼ਿਜ਼ ਨਾਲ ਸੰਪਰਕ ਕਰੋ',
      subheading:
        'ਫੋਨ ਕਾਲ, ਵਟਸਐਪ ਰਾਹੀਂ ਸਿੱਧਾ ਜੁੜੋ ਜਾਂ ਦਫ਼ਤਰੀ ਸਮੇਂ ਦੌਰਾਨ ਸਾਡੇ ਕੇਂਦਰ ਵਿਖੇ ਪਹੁੰਚੋ।',
      proprietor: 'ਬਲਜਿੰਦਰ ਸਿੰਘ ਅਤੇ ਮਨਪ੍ਰੀਤ ਸਿੰਘ (ਪ੍ਰੋਪਰਾਈਟਰ)',
      phonesLabel: 'ਸੰਪਰਕ ਨੰਬਰ',
      emailLabel: 'ਅਧਿਕਾਰਤ ਈਮੇਲ',
      hoursLabel: 'ਦਫ਼ਤਰੀ ਸਮਾਂ (ਸੋਧਣਯੋਗ)',
      locationLabel: 'ਦਫ਼ਤਰ ਦਾ ਪਤਾ ਅਤੇ ਲੋਕੇਸ਼ਨ',
      configureBtn: 'ਦਫ਼ਤਰ ਦਾ ਪਤਾ ਅਤੇ ਸਮਾਂ ਸੈੱਟ ਕਰੋ',
      saveConfigBtn: 'ਵੇਰਵੇ ਸੇਵ ਕਰੋ',
    },
  },
};
