export interface LoanCalculationResult {
  principal: number;
  annualInterestRate: number;
  tenureMonths: number;
  monthlyEMI: number;
  totalInterest: number;
  totalRepayment: number;
  principalPercentage: number;
  interestPercentage: number;
  yearlyBreakdown: Array<{
    year: number;
    principalPaid: number;
    interestPaid: number;
    remainingBalance: number;
  }>;
}

export interface EnquiryFormInput {
  name: string;
  mobile: string;
  service: string;
  contactMethod: 'whatsapp' | 'call' | 'email';
  message: string;
}

export interface ValidationResult {
  valid: boolean;
  errors: Partial<Record<keyof EnquiryFormInput, string>>;
}

export const PRIMARY_PHONE = '82888-37597';
export const SECONDARY_PHONE = '99156-28427';
export const PRIMARY_WHATSAPP = '918288837597';
export const SECONDARY_WHATSAPP = '919915628427';
export const BUSINESS_EMAIL = 'enterprisesmbee@gmail.com';
export const PROPRIETOR_NAMES_EN = 'Baljinder Singh & Manpreet Singh';
export const PROPRIETOR_NAMES_PA = 'ਬਲਜਿੰਦਰ ਸਿੰਘ ਅਤੇ ਮਨਪ੍ਰੀਤ ਸਿੰਘ';

export type DocumentStatus = 'Pending' | 'Processing' | 'Completed';

export interface SubmittedDocumentItem {
  id: string;
  referenceNo: string;
  documentName: string;
  serviceCategory: string;
  submittedAt: string;
  status: DocumentStatus;
  remarks?: string;
}

export interface UserWorkHistoryItem {
  id: string;
  referenceCode: string;
  serviceName: string;
  workDescription: string;
  createdAt: string;
}

export interface UserSession {
  uid?: string;
  memberId?: string;
  name: string;
  mobile: string;
  email?: string;
  photoURL?: string;
  authProvider?: 'google' | 'mobile';
  city?: string;
  occupation?: string;
  preferredService?: string;
  pin?: string;
  signedInAt: string;
  workHistory?: UserWorkHistoryItem[];
  submittedDocuments?: SubmittedDocumentItem[];
}

export interface AdminNotificationPayload {
  userName: string;
  userMobile: string;
  userCity?: string;
  userEmail?: string;
  memberId?: string;
  serviceName: string;
  workDescription: string;
  preferredContact?: string;
  referenceCode?: string;
}

/**
 * Returns default starter submitted documents so every customer profile
 * immediately displays Pending, Processing, and Completed status badges,
 * while allowing the user to submit new documents or update statuses.
 */
export function getDefaultSubmittedDocuments(): SubmittedDocumentItem[] {
  return [
    {
      id: 'doc-default-1',
      referenceNo: 'DOC-4012',
      documentName: 'Aadhaar Address & Mobile Update File',
      serviceCategory: 'Documentation Services',
      submittedAt: 'Today, 10:15 AM',
      status: 'Completed',
      remarks: 'Verified & updated at M Bee Enterprises counter',
    },
    {
      id: 'doc-default-2',
      referenceNo: 'DOC-4089',
      documentName: 'PAN Card & Income Certificate Application',
      serviceCategory: 'Documentation Services',
      submittedAt: 'Today, 11:30 AM',
      status: 'Processing',
      remarks: 'Under review by Baljinder Singh & Manpreet Singh',
    },
    {
      id: 'doc-default-3',
      referenceNo: 'DOC-4105',
      documentName: 'Bank Loan File & ITR Checklist Copy',
      serviceCategory: 'Financial & Loan Services',
      submittedAt: 'Today, 01:20 PM',
      status: 'Pending',
      remarks: 'Submitted to Admin desk for initial verification',
    },
  ];
}

/**
 * Creates a new SubmittedDocumentItem with a deterministic or generated reference code
 * and defaults status to 'Pending'.
 */
export function createSubmittedDocumentItem(
  inputOrName:
    | {
        documentName: string;
        serviceCategory?: string;
        remarks?: string;
        status?: DocumentStatus;
        referenceNo?: string;
        submittedAt?: string;
        id?: string;
      }
    | string,
  serviceCategory?: string,
  status?: DocumentStatus,
  remarks?: string
): SubmittedDocumentItem {
  const input =
    typeof inputOrName === 'string'
      ? {
          documentName: inputOrName,
          serviceCategory,
          status,
          remarks,
        }
      : inputOrName;

  const cleanName = (input.documentName || '').trim() || 'General Service Document';
  const cleanCategory = (input.serviceCategory || '').trim() || 'Documentation Services';
  const ref =
    input.referenceNo || `DOC-${Math.floor(1000 + Math.random() * 9000)}`;
  const nowStr =
    input.submittedAt ||
    new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

  return {
    id: input.id || `doc-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
    referenceNo: ref,
    documentName: cleanName,
    serviceCategory: cleanCategory,
    submittedAt: nowStr,
    status: input.status || 'Pending',
    remarks: (input.remarks || 'Submitted to Admin (Baljinder Singh & Manpreet Singh)').trim(),
  };
}

/**
 * Updates the status ('Pending' | 'Processing' | 'Completed') of a specific document in a list.
 */
export function updateSubmittedDocumentStatus(
  documents: SubmittedDocumentItem[],
  docId: string,
  newStatus: DocumentStatus
): SubmittedDocumentItem[] {
  return (documents || []).map((doc) =>
    doc.id === docId ? { ...doc, status: newStatus } : doc
  );
}

/**
 * Extracts up to 2 uppercase initials from a customer's full name for their profile avatar.
 */
export function getUserInitials(name: string): string {
  const parts = (name || '')
    .trim()
    .split(/\s+/)
    .filter(Boolean);
  if (parts.length === 0) return 'MB';
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
}

/**
 * Extracts strictly the first uppercase character of a customer's name
 * for the Google-style circular avatar button in the top navigation bar.
 */
export function getUserFirstLetter(name: string): string {
  const trimmed = (name || '').trim();
  if (!trimmed) return 'U';
  return Array.from(trimmed)[0].toUpperCase();
}

/**
 * Creates or updates a normalized UserSession profile object with a deterministic or preserved memberId.
 */
export function createOrUpdateUserProfile(
  input: Partial<UserSession> & { name: string; mobile: string },
  existing?: UserSession | null
): UserSession {
  const cleanMobile = input.mobile.replace(/[\s\-+]/g, '').slice(-10);
  const suffix =
    cleanMobile.slice(-4) ||
    (input.uid || existing?.uid || '1001').slice(0, 4).toUpperCase();
  const memberId = input.memberId || existing?.memberId || `MBE-${suffix}`;

  const resolvedDocs =
    input.submittedDocuments ??
    existing?.submittedDocuments ??
    getDefaultSubmittedDocuments();

  return {
    uid: input.uid ?? existing?.uid,
    memberId,
    name: input.name.trim(),
    mobile: input.mobile.trim(),
    email: (input.email ?? existing?.email ?? '').trim(),
    photoURL: input.photoURL ?? existing?.photoURL ?? '',
    authProvider: input.authProvider ?? existing?.authProvider ?? 'mobile',
    city: (input.city ?? existing?.city ?? 'Mahilpur, Punjab').trim(),
    occupation: (input.occupation ?? existing?.occupation ?? 'Citizen / Family').trim(),
    preferredService: (input.preferredService ?? existing?.preferredService ?? 'Loan Consultancy').trim(),
    pin: input.pin ?? existing?.pin ?? '',
    signedInAt:
      existing?.signedInAt ||
      input.signedInAt ||
      new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    workHistory: input.workHistory ?? existing?.workHistory ?? [],
    submittedDocuments: resolvedDocs,
  };
}

/**
 * Builds a complete UserSession from a Google account sign-in (`FirebaseUser`),
 * merging any existing profile data or optional mobile/city inputs.
 */
export function buildGoogleUserProfile(
  googleUser: {
    uid: string;
    displayName: string | null;
    email: string | null;
    photoURL: string | null;
    phoneNumber?: string | null;
  },
  existing?: UserSession | null,
  extra?: {
    mobile?: string;
    city?: string;
    occupation?: string;
  }
): UserSession {
  const emailFallbackName = googleUser.email ? googleUser.email.split('@')[0] : 'M Bee Client';
  const resolvedName = (
    googleUser.displayName ||
    existing?.name ||
    emailFallbackName
  ).trim();

  const resolvedMobile = (
    extra?.mobile ||
    existing?.mobile ||
    googleUser.phoneNumber ||
    ''
  ).trim();

  const cleanUid = (googleUser.uid || 'G101').replace(/[^a-zA-Z0-9]/g, '').slice(0, 4).toUpperCase();
  const memberId = existing?.memberId || `MBE-G${cleanUid}`;

  return {
    uid: googleUser.uid,
    memberId,
    name: resolvedName,
    mobile: resolvedMobile,
    email: (googleUser.email || existing?.email || '').trim(),
    photoURL: googleUser.photoURL || existing?.photoURL || '',
    authProvider: 'google',
    city: (extra?.city || existing?.city || 'Mahilpur, Punjab').trim(),
    occupation: (extra?.occupation || existing?.occupation || 'Citizen / Family').trim(),
    preferredService: existing?.preferredService || 'Loan Consultancy',
    pin: existing?.pin || '',
    signedInAt:
      existing?.signedInAt ||
      new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    workHistory: existing?.workHistory || [],
    submittedDocuments:
      existing?.submittedDocuments && existing.submittedDocuments.length > 0
        ? existing.submittedDocuments
        : getDefaultSubmittedDocuments(),
  };
}

/**
 * Validates customer sign-in inputs (Name and 10-digit Indian mobile number).
 * When `allowOptionalMobile` is true (e.g. for a Google-authenticated profile), mobile is validated only if non-empty.
 */
export function validateUserSignIn(
  name: string,
  mobile: string,
  allowOptionalMobile: boolean = false
): {
  valid: boolean;
  error?: string;
} {
  const trimmedName = (name || '').trim();
  if (trimmedName.length < 2) {
    return { valid: false, error: 'Please enter your full name (at least 2 characters).' };
  }
  const cleanPhone = (mobile || '').replace(/[\s\-+]/g, '');
  if (!cleanPhone && allowOptionalMobile) {
    return { valid: true };
  }
  if (!/^(?:91)?[6-9]\d{9}$/.test(cleanPhone)) {
    return { valid: false, error: 'Please enter a valid 10-digit mobile number.' };
  }
  return { valid: true };
}

/**
 * Builds pre-filled WhatsApp and SMS URLs for both Admin numbers (82888-37597 and 99156-28427)
 * notifying Baljinder Singh & Manpreet Singh of the exact task/work the user wants done.
 */
export function buildAdminNotificationLinks(payload: AdminNotificationPayload): {
  messageText: string;
  primaryWhatsAppUrl: string;
  secondaryWhatsAppUrl: string;
  primarySmsUrl: string;
  secondarySmsUrl: string;
} {
  const refPart = payload.referenceCode ? ` [${payload.referenceCode}]` : '';
  const memberPart = payload.memberId ? ` (${payload.memberId})` : '';
  const cityPart = payload.userCity ? `\n• City / Location: ${payload.userCity}` : '';
  const emailPart = payload.userEmail ? `\n• Email: ${payload.userEmail}` : '';
  const contactPart = payload.preferredContact
    ? `\n• Preferred Contact: ${payload.preferredContact.toUpperCase()}`
    : '';

  const messageText =
    `🔔 *M Bee Enterprises (Baljinder Singh & Manpreet Singh) – Customer Work Request${refPart}*\n` +
    `• Customer Name: ${payload.userName}${memberPart}\n` +
    `• Customer Mobile: ${payload.userMobile}` +
    cityPart +
    emailPart +
    `\n• Service / Work Required: ${payload.serviceName}\n` +
    `• Work Details: ${payload.workDescription || 'Customer wants to get this service done.'}` +
    contactPart;

  const encoded = encodeURIComponent(messageText);

  return {
    messageText,
    primaryWhatsAppUrl: `https://wa.me/${PRIMARY_WHATSAPP}?text=${encoded}`,
    secondaryWhatsAppUrl: `https://wa.me/${SECONDARY_WHATSAPP}?text=${encoded}`,
    primarySmsUrl: `sms:+918288837597?body=${encoded}`,
    secondarySmsUrl: `sms:+919915628427?body=${encoded}`,
  };
}

/**
 * Calculates standard reducing-balance monthly EMI, total interest, total repayment,
 * and a year-by-year amortization summary.
 */
export function calculateLoanEMI(
  principal: number,
  annualInterestRate: number,
  tenureMonths: number
): LoanCalculationResult {
  const safePrincipal = Math.max(1000, Math.min(100_000_000, Number(principal) || 0));
  const safeRate = Math.max(0, Math.min(45, Number(annualInterestRate) || 0));
  const safeMonths = Math.max(1, Math.min(360, Math.round(Number(tenureMonths) || 1)));

  const monthlyRate = safeRate / 12 / 100;

  let monthlyEMI = 0;
  if (monthlyRate === 0) {
    monthlyEMI = safePrincipal / safeMonths;
  } else {
    const factor = Math.pow(1 + monthlyRate, safeMonths);
    monthlyEMI = (safePrincipal * monthlyRate * factor) / (factor - 1);
  }

  const totalRepayment = monthlyEMI * safeMonths;
  const totalInterest = Math.max(0, totalRepayment - safePrincipal);

  const principalPercentage =
    totalRepayment > 0 ? Math.round((safePrincipal / totalRepayment) * 100) : 100;
  const interestPercentage = Math.max(0, 100 - principalPercentage);

  // Build yearly amortization schedule
  const yearlyBreakdown: LoanCalculationResult['yearlyBreakdown'] = [];
  let balance = safePrincipal;
  let currentYearPrincipal = 0;
  let currentYearInterest = 0;

  for (let m = 1; m <= safeMonths; m++) {
    const interestForMonth = balance * monthlyRate;
    const principalForMonth = Math.min(balance, monthlyEMI - interestForMonth);
    balance = Math.max(0, balance - principalForMonth);

    currentYearPrincipal += principalForMonth;
    currentYearInterest += interestForMonth;

    if (m % 12 === 0 || m === safeMonths) {
      yearlyBreakdown.push({
        year: Math.ceil(m / 12),
        principalPaid: Math.round(currentYearPrincipal),
        interestPaid: Math.round(currentYearInterest),
        remainingBalance: Math.round(balance),
      });
      currentYearPrincipal = 0;
      currentYearInterest = 0;
    }
  }

  return {
    principal: Math.round(safePrincipal),
    annualInterestRate: safeRate,
    tenureMonths: safeMonths,
    monthlyEMI: Math.round(monthlyEMI),
    totalInterest: Math.round(totalInterest),
    totalRepayment: Math.round(totalRepayment),
    principalPercentage,
    interestPercentage,
    yearlyBreakdown,
  };
}

/**
 * Formats numbers in the Indian numbering system (Lakhs / Crores) with INR symbol.
 */
export function formatINR(amount: number): string {
  const rounded = Math.round(Number(amount) || 0);
  return '₹' + rounded.toLocaleString('en-IN');
}

/**
 * Validates customer enquiry inputs and ensures sensitive personal identifiers
 * (Aadhaar 12-digit patterns or PAN 10-char patterns) are not submitted via public form.
 */
export function validateEnquiryForm(input: EnquiryFormInput): ValidationResult {
  const errors: Partial<Record<keyof EnquiryFormInput, string>> = {};

  const trimmedName = (input.name || '').trim();
  if (trimmedName.length < 2) {
    errors.name = 'Please enter your full name (at least 2 characters).';
  }

  const cleanPhone = (input.mobile || '').replace(/[\s\-+]/g, '');
  const indianMobileRegex = /^(?:91)?[6-9]\d{9}$/;
  if (!indianMobileRegex.test(cleanPhone)) {
    errors.mobile = 'Please enter a valid 10-digit Indian mobile number.';
  }

  if (!(input.service || '').trim()) {
    errors.service = 'Please select a required service.';
  }

  const trimmedMsg = (input.message || '').trim();
  // Detect accidental Aadhaar (12 continuous digits) or PAN ([A-Z]{5}[0-9]{4}[A-Z]{1})
  const aadhaarPattern = /\b\d{4}[\s-]?\d{4}[\s-]?\d{4}\b/;
  const panPattern = /\b[A-Z]{5}[0-9]{4}[A-Z]\b/i;

  if (aadhaarPattern.test(trimmedMsg) || panPattern.test(trimmedMsg)) {
    errors.message =
      'For your security, please do not enter Aadhaar numbers, PAN numbers, or OTPs in this form.';
  } else if (trimmedMsg.length > 0 && trimmedMsg.length < 5) {
    errors.message = 'Please provide a slightly more descriptive message (or leave brief notes).';
  }

  return {
    valid: Object.keys(errors).length === 0,
    errors,
  };
}

export function buildWhatsAppUrl(message: string, phone: string = PRIMARY_WHATSAPP): string {
  const digitsOnly = phone.replace(/\D/g, '');
  const normalizedPhone = digitsOnly.length === 10 ? `91${digitsOnly}` : digitsOnly;
  return `https://wa.me/${normalizedPhone}?text=${encodeURIComponent(message)}`;
}

export const ADMIN_PASSWORD = 'Mbeeenterprise@#123';

export function verifyAdminPassword(inputPassword: string): boolean {
  return (inputPassword || '').trim() === ADMIN_PASSWORD;
}

export interface SearchableServiceItem {
  id: string;
  categoryId: string;
  title: { en: string; pa: string };
  shortDesc: { en: string; pa: string };
  detailedDesc?: { en: string; pa: string };
  preparationList?: { en: string[]; pa: string[] };
}

/**
 * Filters a list of services in real-time by matching the user's text query
 * against English and Punjabi titles, descriptions, categories, and document checklists.
 */
export function filterServicesBySearchQuery<T extends SearchableServiceItem>(
  services: T[],
  rawQuery: string
): T[] {
  const query = (rawQuery || '').trim().toLowerCase();
  if (!query) {
    return services;
  }

  return services.filter((service) => {
    const searchableFields = [
      service.title?.en || '',
      service.title?.pa || '',
      service.shortDesc?.en || '',
      service.shortDesc?.pa || '',
      service.detailedDesc?.en || '',
      service.detailedDesc?.pa || '',
      service.categoryId || '',
      ...(service.preparationList?.en || []),
      ...(service.preparationList?.pa || []),
    ];

    return searchableFields.some((field) => field.toLowerCase().includes(query));
  });
}
