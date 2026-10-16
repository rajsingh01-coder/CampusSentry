/**
 * CampusSentry AI - Service Architecture & Backend Integration Contract
 *
 * This module defines the formal contract interfaces that the future backend team
 * will implement for REST / WebSocket / SSE endpoints.
 * Currently, it interfaces directly with the client-side Zustand store for demo mode.
 */

import type {
  VisitorRequest,
  VisitorRecord,
  KnownIdentityRecord,
  StaffNotification,
  SecurityAlert,
  EntryExitLog,
  AIRecognitionEvent,
  IdentityClassification,
  RequestStatus,
  VisitorCategory,
} from '../types/index.ts';
import { useDemoStore } from '../store/demo-store.ts';
import type { SimulateRequestInput, IdentityEditableFields, VisitorRecordEditableFields } from '../store/demo-store.ts';

export interface PaginatedResult<T> {
  data: T[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
}

export interface RequestFilterParams {
  query?: string;
  status?: RequestStatus | 'all';
  category?: VisitorCategory | 'all';
  classification?: IdentityClassification | 'all';
  personToMeet?: string | 'all';
  date?: string;
}

export interface NotificationFilterParams {
  query?: string;
  isRead?: boolean;
  priority?: string;
  category?: string;
}

/**
 * Service contract interface for Visitor Requests
 */
export interface IVisitorRequestService {
  getRequests(params?: RequestFilterParams): Promise<VisitorRequest[]>;
  getRequestById(id: string): Promise<VisitorRequest | null>;
  approveRequest(requestId: string, adminNotes?: string): Promise<void>;
  rejectRequest(requestId: string, rejectionReason: string, adminNotes?: string): Promise<void>;
  requestMoreInfo(requestId: string, notes: string): Promise<void>;
  markPending(requestId: string, notes?: string): Promise<void>;
  simulateIncomingStaffRequest(input: SimulateRequestInput): Promise<string>;
}

/**
 * Service contract interface for Visitor Records
 */
export interface IVisitorRecordService {
  getRecords(params?: { query?: string; category?: string; classification?: string }): Promise<VisitorRecord[]>;
  getRecordById(id: string): Promise<VisitorRecord | null>;
  createRecord(record: Omit<VisitorRecord, 'visitorId' | 'registeredAt' | 'isArchived'>): Promise<void>;
  updateRecord(visitorId: string, updates: VisitorRecordEditableFields): Promise<void>;
  archiveRecord(visitorId: string): Promise<void>;
  recordCheckIn(visitorId: string, gate: string, staffName: string): Promise<void>;
  recordCheckOut(visitorId: string, gate: string, staffName: string): Promise<void>;
}

/**
 * Service contract interface for Known Identity Registry
 */
export interface IIdentityRegistryService {
  getIdentities(params?: { query?: string; classification?: string }): Promise<KnownIdentityRecord[]>;
  getIdentityById(id: string): Promise<KnownIdentityRecord | null>;
  addIdentity(name: string, category: VisitorCategory, department?: string, notes?: string): Promise<void>;
  editIdentity(id: string, updates: IdentityEditableFields): Promise<void>;
  updateClassification(id: string, newClassification: IdentityClassification, reason: string): Promise<void>;
  archiveIdentity(id: string): Promise<void>;
  restoreIdentity(id: string): Promise<void>;
}

/**
 * Service contract interface for Staff Notifications
 */
export interface INotificationService {
  getNotifications(params?: NotificationFilterParams): Promise<StaffNotification[]>;
  markAsRead(id: string): Promise<void>;
  markAllAsRead(): Promise<void>;
  archiveNotification(id: string): Promise<void>;
}

/**
 * Service contract interface for Staff & Security
 */
export interface ISecurityMonitoringService {
  getAlerts(): Promise<SecurityAlert[]>;
  updateAlertStatus(id: string, status: SecurityAlert['status'], resolutionNotes?: string): Promise<void>;
  getEntryExitLogs(): Promise<EntryExitLog[]>;
  getRecognitionEvents(): Promise<AIRecognitionEvent[]>;
  reviewRecognitionEvent(id: string, classification: IdentityClassification, notes?: string): Promise<void>;
}

/**
 * Unified API Client Adapter (Demo implementation backed by Zustand store)
 * When migrating to production, swap these methods to perform authenticated fetch() calls
 * to the API gateway (e.g. `NEXT_PUBLIC_API_GATEWAY_URL`).
 */
export const apiClient = {
  requests: {
    getRequests: async (params?: RequestFilterParams): Promise<VisitorRequest[]> => {
      const query = params?.query?.trim().toLowerCase();
      return useDemoStore.getState().visitorRequests.filter((request) => {
        if (params?.status && params.status !== 'all' && request.requestStatus !== params.status) return false;
        if (params?.category && params.category !== 'all' && request.visitorCategory !== params.category) return false;
        if (params?.classification && params.classification !== 'all' && request.identityClassification !== params.classification) return false;
        if (params?.personToMeet && params.personToMeet !== 'all' && request.personToMeet !== params.personToMeet) return false;
        if (params?.date && request.requestedDate !== params.date) return false;
        return !query || [request.visitorName, request.requestId, request.personToMeet, request.reasonForMeeting]
          .some((field) => field.toLowerCase().includes(query));
      });
    },
    getRequestById: async (id: string): Promise<VisitorRequest | null> => {
      return useDemoStore.getState().visitorRequests.find((r) => r.requestId === id) || null;
    },
    approveRequest: async (requestId: string, adminNotes?: string): Promise<void> => {
      useDemoStore.getState().approveRequest(requestId, adminNotes);
    },
    rejectRequest: async (requestId: string, rejectionReason: string, adminNotes?: string): Promise<void> => {
      useDemoStore.getState().rejectRequest(requestId, rejectionReason, adminNotes);
    },
    requestMoreInfo: async (requestId: string, notes: string): Promise<void> => {
      useDemoStore.getState().requestMoreInfo(requestId, notes);
    },
    markPending: async (requestId: string, notes?: string): Promise<void> => {
      useDemoStore.getState().markRequestPending(requestId, notes);
    },
    simulateIncomingStaffRequest: async (input: SimulateRequestInput): Promise<string> => {
      return useDemoStore.getState().simulateIncomingStaffRequest(input);
    },
  },
  records: {
    getRecords: async (params?: { query?: string; category?: string; classification?: string }): Promise<VisitorRecord[]> => {
      return useDemoStore.getState().visitorRecords.filter((record) => {
        if (record.isArchived) return false;
        if (params?.category && params.category !== 'all' && record.visitorCategory !== params.category) return false;
        if (params?.classification && params.classification !== 'all' && record.identityClassification !== params.classification) return false;
        const query = params?.query?.trim().toLowerCase();
        return !query || [record.visitorName, record.visitorId, record.phoneNumber, record.personToMeet, record.purpose]
          .some((field) => field.toLowerCase().includes(query));
      });
    },
    getRecordById: async (id: string): Promise<VisitorRecord | null> => {
      return useDemoStore.getState().visitorRecords.find((record) => record.visitorId === id) || null;
    },
    createRecord: async (record: Omit<VisitorRecord, 'visitorId' | 'registeredAt' | 'isArchived'>): Promise<void> => {
      useDemoStore.getState().addVisitorRecord(record);
    },
    updateRecord: async (visitorId: string, updates: VisitorRecordEditableFields): Promise<void> => {
      useDemoStore.getState().updateVisitorRecord(visitorId, updates);
    },
    archiveRecord: async (visitorId: string): Promise<void> => {
      useDemoStore.getState().archiveVisitorRecord(visitorId);
    },
    recordCheckIn: async (visitorId: string, gate: string, staffName: string): Promise<void> => {
      useDemoStore.getState().recordCheckIn(visitorId, gate, staffName);
    },
    recordCheckOut: async (visitorId: string, gate: string, staffName: string): Promise<void> => {
      useDemoStore.getState().recordCheckOut(visitorId, gate, staffName);
    },
  },
  identities: {
    getIdentities: async (params?: { query?: string; classification?: string }): Promise<KnownIdentityRecord[]> => {
      const query = params?.query?.trim().toLowerCase();
      return useDemoStore.getState().knownIdentities.filter((identity) => !identity.isArchived
        && (!params?.classification || params.classification === 'all' || identity.classification === params.classification)
        && (!query || identity.name.toLowerCase().includes(query) || identity.id.toLowerCase().includes(query)));
    },
    getIdentityById: async (id: string): Promise<KnownIdentityRecord | null> => {
      return useDemoStore.getState().knownIdentities.find((identity) => identity.id === id && !identity.isArchived) || null;
    },
    editIdentity: async (id: string, updates: IdentityEditableFields): Promise<void> => {
      useDemoStore.getState().editKnownIdentity(id, updates);
    },
    updateClassification: async (id: string, classification: IdentityClassification, reason: string): Promise<void> => {
      useDemoStore.getState().updateIdentityClassification(id, classification, reason);
    },
    addIdentity: async (name: string, category: VisitorCategory, department?: string, notes?: string): Promise<void> => {
      useDemoStore.getState().addKnownIdentity(name, category, department, notes);
    },
    archiveIdentity: async (id: string): Promise<void> => {
      useDemoStore.getState().archiveKnownIdentity(id);
    },
    restoreIdentity: async (id: string): Promise<void> => {
      useDemoStore.getState().restoreKnownIdentity(id);
    },
  },
  notifications: {
    getNotifications: async (params?: NotificationFilterParams): Promise<StaffNotification[]> => {
      const query = params?.query?.trim().toLowerCase();
      return useDemoStore.getState().notifications.filter((notification) => !notification.isArchived
        && (params?.isRead === undefined || notification.isRead === params.isRead)
        && (!params?.priority || params.priority === 'all' || notification.priority === params.priority)
        && (!params?.category || params.category === 'all' || notification.visitorCategory === params.category)
        && (!query || [notification.visitorName, notification.requestId, notification.personToMeet,
          notification.reasonForMeeting].some((field) => field.toLowerCase().includes(query))));
    },
    markAsRead: async (id: string): Promise<void> => {
      useDemoStore.getState().markNotificationAsRead(id);
    },
    markAllAsRead: async (): Promise<void> => {
      useDemoStore.getState().markAllNotificationsAsRead();
    },
    archiveNotification: async (id: string): Promise<void> => {
      useDemoStore.getState().archiveNotification(id);
    },
  },
  security: {
    getAlerts: async (): Promise<SecurityAlert[]> => useDemoStore.getState().securityAlerts,
    updateAlertStatus: async (id: string, status: SecurityAlert['status'], resolutionNotes?: string): Promise<void> => {
      useDemoStore.getState().updateSecurityAlertStatus(id, status, resolutionNotes);
    },
    getEntryExitLogs: async (): Promise<EntryExitLog[]> => useDemoStore.getState().entryExitLogs,
    getRecognitionEvents: async (): Promise<AIRecognitionEvent[]> => useDemoStore.getState().recognitionEvents,
    reviewRecognitionEvent: async (id: string, classification: IdentityClassification, notes?: string): Promise<void> => {
      useDemoStore.getState().reviewAIRecognitionEvent(id, classification, notes);
    },
  },
};
