import React, { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';

import { apiRequest } from '@/lib/api';
import { useAuth } from '@/providers/auth-provider';

export type VisitorStatus =
  | 'Pending'
  | 'Pending Verification'
  | 'Pending Approval'
  | 'Verification Required'
  | 'Approved'
  | 'Rejected'
  | 'Checked In'
  | 'Checked Out'
  | 'Cancelled'
  | 'Expired';
export type IdentityStatus = 'Known' | 'Unknown' | 'Verification Required';
export type Presence = 'Inside Campus' | 'Exited' | 'Not Checked In';
export type VisitorCategory = 'Parent/Guardian' | 'Guest' | 'Vendor' | 'Other';

export type VisitorRequest = {
  id: string;
  visitorId: string;
  name: string;
  phone: string;
  category: string;
  identity: IdentityStatus;
  purpose: string;
  personToMeet: string;
  department?: string;
  appointmentDetails?: string;
  status: VisitorStatus;
  otpStatus: 'Verified' | 'Pending' | 'Not Applicable';
  submittedAt: string;
  rejectionReason?: string;
};

export type VisitorRecord = VisitorRequest & {
  presence: Presence;
  checkInTime?: string;
  checkOutTime?: string;
};

const initialRequests: VisitorRequest[] = [
  {
    id: 'REQ-2026-001',
    visitorId: 'VIS-2026-001',
    name: 'Keshav',
    phone: '+91 98765 01234',
    category: 'Guest',
    identity: 'Known',
    purpose: 'Academic partnership consultation',
    personToMeet: 'Principal/Director',
    status: 'Pending Verification',
    otpStatus: 'Pending',
    submittedAt: '2026-10-15T01:10:00Z',
  },
  {
    id: 'REQ-2026-002',
    visitorId: 'VIS-2026-002',
    name: 'Meenakshi Iyer',
    phone: '+91 98111 22334',
    category: 'Parent/Guardian',
    identity: 'Unknown',
    purpose: 'Enquiry regarding semester fees and hostel accommodation',
    personToMeet: 'Dean/HOD',
    status: 'Pending Approval',
    otpStatus: 'Not Applicable',
    submittedAt: '2026-10-15T00:45:00Z',
  },
  {
    id: 'REQ-2026-003',
    visitorId: 'VIS-2026-003',
    name: 'Raj',
    phone: '+91 97234 56789',
    category: 'Vendor',
    identity: 'Known',
    purpose: 'Laboratory consumable delivery',
    personToMeet: 'Administrator',
    status: 'Approved',
    otpStatus: 'Not Applicable',
    submittedAt: '2026-10-14T23:30:00Z',
  },
  {
    id: 'REQ-2026-004',
    visitorId: 'VIS-2026-004',
    name: 'Dr. Sandeep Chawla',
    phone: '+91 94567 89012',
    category: 'Guest',
    identity: 'Verification Required',
    purpose: 'Guest lecture coordination',
    personToMeet: 'Principal/Director',
    status: 'Verification Required',
    otpStatus: 'Pending',
    submittedAt: '2026-10-14T22:10:00Z',
  },
  {
    id: 'REQ-2026-005',
    visitorId: 'VIS-2026-005',
    name: 'Vikas Nambiar',
    phone: '+91 91234 56780',
    category: 'Other',
    identity: 'Unknown',
    purpose: 'Campus visit',
    personToMeet: 'Other Authority/Office',
    status: 'Rejected',
    otpStatus: 'Pending',
    submittedAt: '2026-10-14T18:00:00Z',
    rejectionReason: 'Commercial activity requires prior written clearance.',
  },
];

const initialRecords: VisitorRecord[] = [
  {
    ...initialRequests[0],
    presence: 'Not Checked In',
  },
  {
    ...initialRequests[1],
    presence: 'Not Checked In',
  },
  {
    ...initialRequests[2],
    status: 'Checked In',
    presence: 'Inside Campus',
    checkInTime: '2026-10-14T23:38:00Z',
  },
  {
    ...initialRequests[3],
    presence: 'Exited',
    status: 'Checked Out',
    checkInTime: '2026-10-14T14:05:00Z',
    checkOutTime: '2026-10-14T17:15:00Z',
  },
  {
    ...initialRequests[4],
    presence: 'Exited',
    status: 'Checked Out',
    checkInTime: '2026-10-14T10:20:00Z',
    checkOutTime: '2026-10-14T11:45:00Z',
  },
];

type RegistrationInput = Omit<VisitorRequest, 'id' | 'visitorId' | 'identity' | 'status' | 'otpStatus' | 'submittedAt'>;

type BackendVisitor = {
  _id: string;
  name: string;
  phone: string;
  category: string;
  purpose: string;
  personToMeet: string;
  department: string;
  otpVerified: boolean;
  status: VisitorStatus;
  rejectionReason?: string | null;
  createdAt: string;
};

type BackendEntry = {
  visitorId: string | { _id: string };
  checkInTime: string;
  checkOutTime?: string | null;
  status: 'IN' | 'OUT';
};

function mapVisitor(visitor: BackendVisitor, entry?: BackendEntry): VisitorRecord {
  const id = visitor._id;
  const checkedIn = entry?.status === 'IN';
  const checkedOut = entry?.status === 'OUT';
  const status: VisitorStatus = checkedIn
    ? 'Checked In'
    : checkedOut
      ? 'Checked Out'
      : visitor.status;
  const request: VisitorRequest = {
    id,
    visitorId: id,
    name: visitor.name,
    phone: visitor.phone,
    category: visitor.category,
    identity: visitor.otpVerified ? 'Known' : 'Verification Required',
    purpose: visitor.purpose,
    personToMeet: visitor.personToMeet,
    department: visitor.department,
    status,
    otpStatus: visitor.otpVerified ? 'Verified' : 'Pending',
    submittedAt: visitor.createdAt,
    rejectionReason: visitor.rejectionReason ?? undefined,
  };

  return {
    ...request,
    presence: checkedIn ? 'Inside Campus' : checkedOut ? 'Exited' : 'Not Checked In',
    checkInTime: entry?.checkInTime,
    checkOutTime: entry?.checkOutTime ?? undefined,
  };
}

type DemoDataValue = {
  requests: VisitorRequest[];
  records: VisitorRecord[];
  isDemo: boolean;
  isConnected: boolean;
  isLoading: boolean;
  loadError: string | null;
  refresh: () => Promise<void>;
  registerVisitor: (input: RegistrationInput) => string;
  checkIn: (visitorId: string) => Promise<boolean>;
  checkOut: (visitorId: string) => Promise<boolean>;
  approveVisitor: (visitorId: string) => Promise<void>;
  rejectVisitor: (visitorId: string) => Promise<void>;
};

const DemoDataContext = createContext<DemoDataValue | null>(null);

export function DemoDataProvider({ children }: React.PropsWithChildren) {
  const { mode, token } = useAuth();
  const [requests, setRequests] = useState(initialRequests);
  const [records, setRecords] = useState(initialRecords);
  const [isLoading, setIsLoading] = useState(false);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [hasLoaded, setHasLoaded] = useState(false);

  const refresh = useCallback(async () => {
    if (mode !== 'authenticated' || !token) {
      setLoadError(null);
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    setLoadError(null);
    try {
      const [visitors, entries] = await Promise.all([
        apiRequest<BackendVisitor[]>('/api/visitors', {}, token),
        apiRequest<BackendEntry[]>('/api/entries', {}, token),
      ]);
      const latestEntries = new Map<string, BackendEntry>();
      for (const entry of entries) {
        const visitorId = typeof entry.visitorId === 'string' ? entry.visitorId : entry.visitorId?._id;
        if (visitorId && !latestEntries.has(visitorId)) latestEntries.set(visitorId, entry);
      }
      const liveRecords = visitors.map((visitor) => mapVisitor(visitor, latestEntries.get(visitor._id)));
      setRecords(liveRecords);
      setRequests(liveRecords);
      setHasLoaded(true);
    } catch (error) {
      setLoadError(error instanceof Error ? error.message : 'Could not load visitor data.');
    } finally {
      setIsLoading(false);
    }
  }, [mode, token]);

  useEffect(() => {
    if (mode === 'authenticated') {
      void refresh();
    } else {
      setRequests(initialRequests);
      setRecords(initialRecords);
      setLoadError(null);
      setIsLoading(false);
      setHasLoaded(false);
    }
  }, [mode, refresh]);

  const registerVisitor = useCallback((input: RegistrationInput) => {
    const id = `DEMO-REQ-${Date.now()}`;
    const visitorId = `DEMO-VIS-${Date.now()}`;
    const createdAt = new Date().toISOString();
    const request: VisitorRequest = {
      ...input,
      id,
      visitorId,
      identity: 'Verification Required',
      status: 'Pending Verification',
      otpStatus: 'Pending',
      submittedAt: createdAt,
    };
    setRequests((current) => [request, ...current]);
    setRecords((current) => [{ ...request, presence: 'Not Checked In' }, ...current]);
    return id;
  }, []);

  const checkIn = useCallback(async (visitorId: string) => {
    if (mode === 'authenticated' && token) {
      await apiRequest('/api/entries/check-in', {
        method: 'POST',
        body: JSON.stringify({ visitorId }),
      }, token);
      await refresh();
      return true;
    }
    const record = records.find((item) => item.visitorId === visitorId);
    if (!record || record.presence === 'Inside Campus' || record.status === 'Rejected' || record.status === 'Cancelled' || record.status === 'Expired' || record.status === 'Pending' || record.status === 'Pending Approval' || record.status === 'Pending Verification' || record.status === 'Verification Required') {
      return false;
    }
    const now = new Date().toISOString();
    setRecords((current) => current.map((item) => item.visitorId === visitorId
      ? { ...item, status: 'Checked In', presence: 'Inside Campus', checkInTime: now, checkOutTime: undefined }
      : item));
    setRequests((current) => current.map((item) => item.visitorId === visitorId ? { ...item, status: 'Checked In' } : item));
    return true;
  }, [mode, records, refresh, token]);

  const checkOut = useCallback(async (visitorId: string) => {
    if (mode === 'authenticated' && token) {
      await apiRequest('/api/entries/check-out', {
        method: 'POST',
        body: JSON.stringify({ visitorId }),
      }, token);
      await refresh();
      return true;
    }
    const record = records.find((item) => item.visitorId === visitorId);
    if (!record || record.presence !== 'Inside Campus') return false;
    const now = new Date().toISOString();
    setRecords((current) => current.map((item) => item.visitorId === visitorId
      ? { ...item, status: 'Checked Out', presence: 'Exited', checkOutTime: now }
      : item));
    setRequests((current) => current.map((item) => item.visitorId === visitorId ? { ...item, status: 'Checked Out' } : item));
    return true;
  }, [mode, records, refresh, token]);

  const approveVisitor = useCallback(async (visitorId: string) => {
    if (mode !== 'authenticated' || !token) throw new Error('Sign in to approve visitor requests.');
    await apiRequest(`/api/approvals/${encodeURIComponent(visitorId)}/approve`, { method: 'PATCH' }, token);
    await refresh();
  }, [mode, refresh, token]);

  const rejectVisitor = useCallback(async (visitorId: string) => {
    if (mode !== 'authenticated' || !token) throw new Error('Sign in to reject visitor requests.');
    await apiRequest(`/api/approvals/${encodeURIComponent(visitorId)}/reject`, {
      method: 'PATCH',
      body: JSON.stringify({}),
    }, token);
    await refresh();
  }, [mode, refresh, token]);

  const value = useMemo(
    () => ({
      requests: mode === 'authenticated' && !hasLoaded ? [] : requests,
      records: mode === 'authenticated' && !hasLoaded ? [] : records,
      isDemo: mode !== 'authenticated',
      isConnected: mode === 'authenticated' && hasLoaded && !loadError,
      isLoading,
      loadError,
      refresh,
      registerVisitor,
      checkIn,
      checkOut,
      approveVisitor,
      rejectVisitor,
    }),
    [approveVisitor, checkIn, checkOut, hasLoaded, isLoading, loadError, mode, records, refresh, registerVisitor, rejectVisitor, requests],
  );

  return <DemoDataContext.Provider value={value}>{children}</DemoDataContext.Provider>;
}

export function useDemoData() {
  const value = useContext(DemoDataContext);
  if (!value) throw new Error('useDemoData must be used inside DemoDataProvider');
  return value;
}
