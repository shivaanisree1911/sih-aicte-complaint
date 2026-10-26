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

export const TAMIL_NADU_DISTRICTS = [
  'Chennai',
  'Coimbatore',
  'Madurai',
  'Chengalpattu',
  'Kancheepuram',
  'Tiruvallur',
  'Salem',
  'Erode',
  'Tirunelveli',
  'Thoothukudi',
  'Virudhunagar',
  'Sivaganga',
  'Namakkal',
  'Dindigul',
  'Tiruchirappalli',
  'Krishnagiri',
  'Vellore',
  'Thanjavur'
];

export const DEMO_ACCOUNTS = [
  {
    role: 'Super Administrator',
    email: 'admin@aicte.gov.in',
    password: 'Password@123',
    bureau: 'All'
  },
  {
    role: 'Senior Management',
    email: 'advisor@aicte.gov.in',
    password: 'Password@123',
    bureau: 'All'
  },
  {
    role: 'Bureau Officer (PGRC)',
    email: 'officer.pgrc@aicte.gov.in',
    password: 'Password@123',
    bureau: 'PGRC'
  },
  {
    role: 'Bureau Officer (RB)',
    email: 'officer.rb@aicte.gov.in',
    password: 'Password@123',
    bureau: 'RB'
  },
  {
    role: 'Southern Regional Officer',
    email: 'officer.south@aicte.gov.in',
    password: 'Password@123',
    bureau: 'Regional Office'
  },
  {
    role: 'Read-Only Auditor',
    email: 'auditor@aicte.gov.in',
    password: 'Password@123',
    bureau: 'All'
  }
];
