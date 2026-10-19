// CampusSentry AI - Core Domain Types and Interfaces

export type VisitorCategory =
  | 'Student'
  | 'Parent/Guardian'
  | 'Guest/External Visitor'
  | 'Teaching Staff'
  | 'Non-Teaching Staff'
  | 'Vendor'
  | 'Other'
  | 'Not specified';

export type IdentityClassification =
  | 'Known'
  | 'Unknown'
  | 'Verification Required';

export type RequestStatus =
  | 'Pending Verification'
  | 'Pending Approval'
  | 'Approved'
  | 'Rejected'
  | 'Cancelled'
  | 'Expired'
  | 'Additional Information Required';

export type VisitMode = 'Walk-in' | 'Scheduled';

export type OtpStatus = 'Verified' | 'Pending' | 'Failed' | 'Not Applicable';

export type StaffRole = 'Admin' | 'Security/Staff' | 'Supervisor';

export type AccountStatus = 'Active' | 'Suspended' | 'Inactive';

export type SecurityAlertPriority = 'Low' | 'Medium' | 'High' | 'Critical';
export type SecurityAlertStatus = 'Open' | 'Under Review' | 'Resolved' | 'Dismissed';

export type EntryExitType = 'Entry' | 'Exit';

export interface VisitorRequest {
  requestId: string;
  visitorId: string;
  visitorName: string;
  phoneNumber?: string;
  visitorCategory: VisitorCategory;
  identityClassification: IdentityClassification;
  universityId?: string;
  department?: string;
  personToMeet: string;
  reasonForMeeting: string;
  visitMode: VisitMode;
  requestedDate: string; // YYYY-MM-DD
  requestedTime: string; // HH:mm or "Now"
  appointmentDetails?: string;
  otpVerificationStatus: OtpStatus;
  submittedByStaffId: string;
  submittedByStaffName: string;
  gateOrLocation: string;
  submittedAt: string; // ISO 8601
  requestStatus: RequestStatus;
  rejectionReason?: string;
  adminNotes?: string;
  reviewHistory: RequestReviewLog[];
  associatedIdentityRecordId?: string;
  createdAt: string;
  updatedAt: string;
}

export interface RequestReviewLog {
  timestamp: string;
  actor: string;
  action: string;
  previousStatus?: RequestStatus;
  newStatus: RequestStatus;
  notes?: string;
}

export interface VisitorRecord {
  visitorId: string;
  visitorName: string;
  phoneNumber: string;
  visitorCategory: VisitorCategory;
  identityClassification: IdentityClassification;
  purpose: string;
  personToMeet: string;
  requestedDateTime: string;
  visitMode?: VisitMode;
  registeredAt: string;
  otpStatus: OtpStatus;
  requestStatus: RequestStatus;
  currentPresence: 'Inside Campus' | 'Exited' | 'Not Checked In';
  checkInTime?: string;
  checkOutTime?: string;
  associatedStaffName: string;
  gateLocation: string;
  notes?: string;
  isArchived: boolean;
  associatedIdentityId?: string;
}

export interface KnownIdentityRecord {
  id: string;
  name: string;
  classification: IdentityClassification;
  category: VisitorCategory;
  department: string;
  notes?: string;
  isDemoRegistryMatch?: boolean;
  classificationHistory: ClassificationHistoryItem[];
  isArchived: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface ClassificationHistoryItem {
  timestamp: string;
  actor: string;
  previousClassification: IdentityClassification;
  newClassification: IdentityClassification;
  reason: string;
}

export interface StaffNotification {
  id: string;
  requestId: string;
  visitorId: string;
  associatedIdentityRecordId?: string;
  visitorName: string;
  visitorCategory: VisitorCategory;
  identityClassification: IdentityClassification;
  phoneNumber: string;
  personToMeet: string;
  departmentOrOffice?: string;
  reasonForMeeting: string;
  requestedDate: string;
  requestedTime: string;
  isWalkIn: boolean;
  submittedByStaffName: string;
  submittedByStaffId: string;
  gateLocation: string;
  submittedAt: string;
  otpStatus: OtpStatus;
  requestStatus: RequestStatus;
  staffNotes?: string;
  isRead: boolean;
  isArchived: boolean;
  priority: 'Normal' | 'Urgent' | 'High';
}

export interface StaffUser {
  staffId: string;
  name: string;
  email: string;
  department: string;
  role: StaffRole;
  status: AccountStatus;
  lastActive: string;
  assignedGate: string;
  submittedRequestsCount: number;
}

export interface SecurityAlert {
  id: string;
  category: 'Classification Alert' | 'Unauthorized Attempt' | 'Gate Anomaly' | 'Overstay Detected' | 'Verification Mismatch';
  priority: SecurityAlertPriority;
  timestamp: string;
  relatedVisitorId?: string;
  relatedVisitorName?: string;
  relatedRequestId?: string;
  deviceOrGate: string;
  recognitionServiceHealth: 'Simulated Normal' | 'Simulated Warning' | 'Simulated Error';
  status: SecurityAlertStatus;
  assignedReviewer?: string;
  resolutionNotes?: string;
  description: string;
}

export interface EntryExitLog {
  id: string;
  visitorId: string;
  visitorName: string;
  gateOrLocation: string;
  eventType: EntryExitType;
  timestamp: string;
  recordingStaffName: string;
  relatedRequestId?: string;
  source: 'Gate Scanner (Simulated)' | 'Staff Mobile Manual (Simulated)' | 'Admin Override';
}

export interface AIRecognitionEvent {
  id: string;
  timestamp: string;
  sourceDevice: string;
  matchClassification: IdentityClassification;
  confidenceScore: number; // Stated as simulated demo score
  associatedIdentityName?: string;
  associatedIdentityId?: string;
  reviewerStatus: 'Reviewed' | 'Pending Review' | 'Flagged';
  reviewedBy?: string;
  reviewedAt?: string;
  notes?: string;
}

export interface AuditLogItem {
  id: string;
  timestamp: string;
  actor: string;
  action: string;
  entityType: 'Visitor' | 'Request' | 'Identity' | 'Staff' | 'SecurityAlert' | 'RecognitionEvent' | 'Settings' | 'Report';
  entityId: string;
  description: string;
  result: 'Success' | 'Warning' | 'Error';
}

export interface SystemSettingsConfig {
  visitorCategories: string[];
  authorizedMeetingAuthorities: string[];
  autoFlagUnknownVisitors: boolean;
  requireOtpForGuests: boolean;
  enableWalkInDirectReview: boolean;
  retentionDays: number;
  backendIntegrationStatus: 'Demo Mode' | 'Awaiting Backend Integration' | 'Connected';
  universityErpStatus: 'Not Connected' | 'Configured' | 'Syncing';
  otpProviderStatus: 'Demo Mode (Simulated)' | 'Connected' | 'Not Configured';
  aiRecognitionStatus: 'Simulated Environment' | 'Active' | 'Offline';
  cameraIntegrationStatus: 'Simulated Devices' | 'Active Streams' | 'Offline';
}
