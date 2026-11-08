/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export {
  parseCorsOrigins,
  formatSupabaseSyncPayload,
  buildDeterministicAdvisorResponse,
  syncUserProfileAcrossClouds,
  querySmartServiceAdvisor,
  fetchServicesFromBackend,
  syncCustomServicesWithBackend,
  syncAnnouncementWithBackend,
  fetchAnnouncementFromBackend,
  submitEnquiryToBackend,
  fetchEnquiriesFromBackend,
  syncDocumentsListWithBackend,
  syncDocumentStatusWithBackend,
  fetchProfilesFromBackend,
} from '../src/utils/cloudIntegrations';

export type {
  SupabaseSyncPayload,
  AdvisorQueryRequest,
  AdvisorQueryResponse,
  BackendServicesResponse,
  BackendEnquiryRecord,
} from '../src/utils/cloudIntegrations';
