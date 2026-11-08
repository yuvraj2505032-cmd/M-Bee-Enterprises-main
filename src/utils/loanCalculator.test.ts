import test from 'node:test';
import assert from 'node:assert/strict';
import {
  calculateLoanEMI,
  formatINR,
  validateEnquiryForm,
  buildWhatsAppUrl,
  validateUserSignIn,
  buildAdminNotificationLinks,
  getUserInitials,
  getUserFirstLetter,
  createOrUpdateUserProfile,
  buildGoogleUserProfile,
  getDefaultSubmittedDocuments,
  createSubmittedDocumentItem,
  updateSubmittedDocumentStatus,
  PROPRIETOR_NAMES_EN,
  ADMIN_PASSWORD,
  verifyAdminPassword,
} from './loanCalculator';

test('calculateLoanEMI computes accurate monthly EMI and totals for standard loan', () => {
  // ₹5,00,000 at 10.5% for 60 months (5 years)
  const result = calculateLoanEMI(500000, 10.5, 60);
  assert.equal(result.principal, 500000);
  assert.equal(result.monthlyEMI, 10747);
  assert.equal(result.totalRepayment, 644817);
  assert.equal(result.totalInterest, 144817);
  assert.equal(result.principalPercentage + result.interestPercentage, 100);
  assert.equal(result.yearlyBreakdown.length, 5);
  assert.equal(result.yearlyBreakdown[4].remainingBalance, 0);
});

test('calculateLoanEMI handles zero interest rate gracefully', () => {
  const result = calculateLoanEMI(120000, 0, 12);
  assert.equal(result.monthlyEMI, 10000);
  assert.equal(result.totalInterest, 0);
  assert.equal(result.totalRepayment, 120000);
});

test('formatINR formats Indian numbering system with rupee sign', () => {
  assert.equal(formatINR(500000), '₹5,00,000');
  assert.equal(formatINR(10747), '₹10,747');
});

test('validateEnquiryForm validates required fields and blocks Aadhaar/PAN numbers', () => {
  const emptyCheck = validateEnquiryForm({
    name: '',
    mobile: '123',
    service: '',
    contactMethod: 'whatsapp',
    message: '',
  });
  assert.equal(emptyCheck.valid, false);
  assert.ok(emptyCheck.errors.name);
  assert.ok(emptyCheck.errors.mobile);
  assert.ok(emptyCheck.errors.service);

  const sensitiveCheck = validateEnquiryForm({
    name: 'Gurpreet Singh',
    mobile: '9876543210',
    service: 'PAN Card Services',
    contactMethod: 'whatsapp',
    message: 'My Aadhaar is 1234 5678 9012 please check',
  });
  assert.equal(sensitiveCheck.valid, false);
  assert.ok(sensitiveCheck.errors.message);

  const validCheck = validateEnquiryForm({
    name: 'Gurpreet Singh',
    mobile: '9876543210',
    service: 'Home Loan Assistance',
    contactMethod: 'whatsapp',
    message: 'Looking for consultation regarding home loan documents.',
  });
  assert.equal(validCheck.valid, true);
});

test('buildWhatsAppUrl constructs proper wa.me link with encoded text', () => {
  const url = buildWhatsAppUrl('Hello M Bee Enterprises', '82888-37597');
  assert.equal(url, 'https://wa.me/918288837597?text=Hello%20M%20Bee%20Enterprises');
});

test('validateUserSignIn, createOrUpdateUserProfile, buildGoogleUserProfile, document status tracker, and buildAdminNotificationLinks work accurately', () => {
  assert.equal(PROPRIETOR_NAMES_EN, 'Baljinder Singh & Manpreet Singh');
  assert.equal(validateUserSignIn('Mandeep Singh', '9876543210').valid, true);
  assert.equal(validateUserSignIn('A', '123').valid, false);
  assert.equal(validateUserSignIn('Simran Kaur', '', true).valid, true);
  assert.equal(getUserInitials('Mandeep Singh'), 'MS');
  assert.equal(getUserInitials('Baljinder'), 'BA');
  assert.equal(getUserFirstLetter('Mandeep Singh'), 'M');
  assert.equal(getUserFirstLetter('  yuvraj singh '), 'Y');
  assert.equal(getUserFirstLetter(''), 'U');

  const profile = createOrUpdateUserProfile({
    name: 'Mandeep Singh',
    mobile: '9876543210',
    city: 'Ludhiana, Punjab',
    email: 'mandeep@example.com',
    occupation: 'Business / Self-Employed',
  });
  assert.equal(profile.memberId, 'MBE-3210');
  assert.equal(profile.city, 'Ludhiana, Punjab');
  assert.equal(profile.submittedDocuments?.length, 3);

  const defaultDocs = getDefaultSubmittedDocuments();
  assert.equal(defaultDocs.length, 3);
  assert.ok(defaultDocs.some((d) => d.status === 'Pending'));
  assert.ok(defaultDocs.some((d) => d.status === 'Processing'));
  assert.ok(defaultDocs.some((d) => d.status === 'Completed'));

  const newDoc = createSubmittedDocumentItem({
    documentName: 'Passport Police Clearance (PCC) File',
    serviceCategory: 'Documentation Services',
    remarks: 'Original passport scanned',
  });
  assert.equal(newDoc.status, 'Pending');
  assert.equal(newDoc.documentName, 'Passport Police Clearance (PCC) File');

  const updatedDocs = updateSubmittedDocumentStatus(
    [newDoc, ...defaultDocs],
    newDoc.id,
    'Processing'
  );
  assert.equal(updatedDocs[0].status, 'Processing');

  const googleProfile = buildGoogleUserProfile(
    {
      uid: 'abc987xyz',
      displayName: 'Harpreet Singh',
      email: 'harpreet.singh@gmail.com',
      photoURL: 'https://lh3.googleusercontent.com/a/default-user',
    },
    null,
    { mobile: '9876501234', city: 'Mahilpur, Punjab' }
  );
  assert.equal(googleProfile.uid, 'abc987xyz');
  assert.equal(googleProfile.authProvider, 'google');
  assert.equal(googleProfile.name, 'Harpreet Singh');
  assert.equal(googleProfile.email, 'harpreet.singh@gmail.com');
  assert.equal(googleProfile.mobile, '9876501234');
  assert.equal(googleProfile.memberId, 'MBE-GABC9');

  const links = buildAdminNotificationLinks({
    userName: profile.name,
    userMobile: profile.mobile,
    userCity: profile.city,
    memberId: profile.memberId,
    serviceName: 'Passport Application Assistance',
    workDescription: 'Need new passport appointment booking',
    referenceCode: 'MB-1001',
  });

  assert.ok(links.primaryWhatsAppUrl.includes('918288837597'));
  assert.ok(links.secondaryWhatsAppUrl.includes('919915628427'));
  assert.ok(links.primarySmsUrl.includes('+918288837597'));
  assert.ok(links.messageText.includes('Baljinder Singh & Manpreet Singh'));
  assert.ok(links.messageText.includes('Mandeep Singh (MBE-3210)'));
  assert.ok(links.messageText.includes('Ludhiana, Punjab'));
  assert.ok(links.messageText.includes('Passport Application Assistance'));

  assert.equal(ADMIN_PASSWORD, 'Mbeeenterprise@#123');
  assert.equal(verifyAdminPassword('Mbeeenterprise@#123'), true);
  assert.equal(verifyAdminPassword('wrongpassword'), false);
});

import {
  parseCorsOrigins,
  formatSupabaseSyncPayload,
  buildDeterministicAdvisorResponse,
} from './cloudIntegrations';

test('parseCorsOrigins, formatSupabaseSyncPayload, and buildDeterministicAdvisorResponse work accurately', () => {
  const origins = parseCorsOrigins('http://localhost:3000,http://localhost:5173,https://example.com');
  assert.ok(origins.includes('http://localhost:3000'));
  assert.ok(origins.includes('http://localhost:5173'));
  assert.ok(origins.includes('https://example.com'));

  const passportAdvice = buildDeterministicAdvisorResponse({
    query: 'Passport Renewal & Tatkaal',
    language: 'en',
  });
  assert.ok(passportAdvice.answer.includes('Baljinder Singh & Manpreet Singh'));
  assert.equal(passportAdvice.checklist.length, 4);

  const loanAdvicePa = buildDeterministicAdvisorResponse({
    query: 'ਹੋਮ ਲੋਨ',
    language: 'pa',
  });
  assert.ok(loanAdvicePa.answer.includes('ਬਲਜਿੰਦਰ ਸਿੰਘ ਅਤੇ ਮਨਪ੍ਰੀਤ ਸਿੰਘ'));
  assert.equal(loanAdvicePa.checklist.length, 4);

  const profile = createOrUpdateUserProfile({
    name: 'Manpreet Singh',
    mobile: '9915628427',
    city: 'Mahilpur, Punjab',
  });
  const syncPayload = formatSupabaseSyncPayload(profile);
  assert.equal(syncPayload.name, 'Manpreet Singh');
  assert.equal(syncPayload.mobile, '9915628427');
  assert.equal(syncPayload.submittedDocuments.length, 3);
});

import { filterServicesBySearchQuery } from './loanCalculator';
import { SERVICES_CATALOG } from '../data/translations';

test('filterServicesBySearchQuery filters SERVICES_CATALOG in real-time by English, Punjabi, and checklist terms', () => {
  assert.equal(filterServicesBySearchQuery(SERVICES_CATALOG, '').length, 19);
  assert.equal(filterServicesBySearchQuery(SERVICES_CATALOG, '   ').length, 19);

  const passportMatches = filterServicesBySearchQuery(SERVICES_CATALOG, 'Passport');
  assert.ok(passportMatches.length >= 1);
  assert.ok(passportMatches.some((s) => s.title.en.includes('Passport Application Assistance')));

  const punjabiMatches = filterServicesBySearchQuery(SERVICES_CATALOG, 'ਆਧਾਰ');
  assert.ok(punjabiMatches.length >= 1);
  assert.ok(punjabiMatches.some((s) => s.title.pa.includes('ਆਧਾਰ')));

  const noMatches = filterServicesBySearchQuery(SERVICES_CATALOG, 'xyz-nonexistent-service-999');
  assert.equal(noMatches.length, 0);
});

