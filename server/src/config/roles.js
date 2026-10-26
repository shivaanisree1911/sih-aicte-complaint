export const ROLES = {
  STUDENT: 'student',
  FACULTY: 'faculty',
  PRINCIPAL: 'principal',
  SUPER_ADMIN: 'super_admin',
  SENIOR_MANAGEMENT: 'senior_management',
  BUREAU_OFFICER: 'bureau_officer',
  REGIONAL_OFFICER: 'regional_officer',
  AUDITOR: 'auditor'
};

export const ROLE_LABELS = {
  [ROLES.STUDENT]: 'Student',
  [ROLES.FACULTY]: 'Teacher / Faculty',
  [ROLES.PRINCIPAL]: 'College Principal',
  [ROLES.SUPER_ADMIN]: 'System Administrator',
  [ROLES.SENIOR_MANAGEMENT]: 'Senior Officer',
  [ROLES.BUREAU_OFFICER]: 'Grievance Officer',
  [ROLES.REGIONAL_OFFICER]: 'Regional Officer',
  [ROLES.AUDITOR]: 'Auditor'
};

export const BUREAUS = [
  'Regulation Bureau (RB)',
  'Public Grievance Redressal Cell (PGRC)',
  'Approval Bureau',
  'Finance Bureau',
  'Regional Office'
];

export const REGIONS = [
  'Northern',
  'North-Western',
  'Central',
  'Eastern',
  'Western',
  'South-Western',
  'Southern'
];

export const COMPLAINT_CATEGORIES = [
  'Academic Issues',
  'Infrastructure',
  'Faculty and Staffing',
  'Admission and Fee Issues',
  'Regulatory Compliance',
  'Approval and Accreditation',
  'Student Grievances',
  'Examination-Related Issues',
  'Other'
];

export const COMPLAINT_STATUSES = [
  'Received',
  'Pending',
  'Under Process',
  'Transferred',
  'Escalated',
  'Disposed',
  'Closed'
];

export const COMPLAINT_PRIORITIES = [
  'Low',
  'Medium',
  'High',
  'Critical'
];

export const OVERLAP_SEVERITIES = [
  'High',
  'Medium',
  'Low'
];

export const OVERLAP_STATUSES = [
  'New',
  'Under Review',
  'Coordination Required',
  'Resolved',
  'Dismissed as Not Related'
];

export const ACTION_TYPES = {
  CREATED: 'CREATED',
  ASSIGNED: 'ASSIGNED',
  STATUS_CHANGE: 'STATUS_CHANGE',
  TRANSFERRED: 'TRANSFERRED',
  ESCALATED: 'ESCALATED',
  REMARK_ADDED: 'REMARK_ADDED',
  DOCUMENT_UPLOADED: 'DOCUMENT_UPLOADED',
  LINKED_OVERLAP: 'LINKED_OVERLAP',
  DISPOSED: 'DISPOSED',
  CLOSED: 'CLOSED'
};
