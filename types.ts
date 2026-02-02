
export enum Role {
  STUDENT = 'student',
  ADMIN = 'admin'
}

export enum ComplaintStatus {
  PENDING = 'Pending',
  SUBMITTED = 'Submitted',
  VERIFIED = 'Verified',
  UNDER_REVIEW = 'In Review',
  IN_PROGRESS = 'In Progress',
  RESOLVED = 'Resolved',
  CLOSED = 'Closed'
}

export enum ComplaintCategory {
  HOSTEL = 'Hostel',
  ACADEMIC = 'Academic',
  FACILITIES = 'Facilities',
  STAFF = 'Staff',
  OTHER = 'Other'
}

export enum ComplaintPriority {
  LOW = 'Low Priority',
  MEDIUM = 'Medium Priority',
  HIGH = 'High Priority',
  URGENT = 'Urgent'
}

export interface User {
  id: string;
  name: string;
  email: string;
  password?: string;
  role: Role;
}

export interface Complaint {
  id: string;
  studentId: string;
  studentName: string;
  subject: string;
  description: string;
  status: ComplaintStatus;
  category: ComplaintCategory;
  priority: ComplaintPriority;
  remarks: string; // Student-facing response
  reviewNotes?: string; // Internal admin notes
  isVerified?: boolean;
  aiInsight?: {
    summary: string;
    suggestedAction: string;
    recommendedTone: string;
  };
  createdAt: string;
  updatedAt?: string;
}

export type AuthState = {
  user: User | null;
  isAuthenticated: boolean;
};
