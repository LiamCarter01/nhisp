/**
 * NHISP API Types
 * ================
 * TypeScript interfaces for all API request/response types.
 */

// ========================================
// Auth
// ========================================
export interface LoginRequest {
  email: string;
  password: string;
}

export interface TokenResponse {
  access: string;
  refresh: string;
}

export interface RegisterRequest {
  email: string;
  first_name: string;
  last_name: string;
  national_id?: string;
  phone_number?: string;
  date_of_birth?: string;
  address?: string;
  password: string;
  password_confirm: string;
}

// ========================================
// User
// ========================================
export type UserRole = 'Admin' | 'Supervisor' | 'ClaimsOfficer' | 'Citizen';

export interface User {
  id: string;
  email: string;
  first_name: string;
  last_name: string;
  national_id: string | null;
  phone_number: string;
  date_of_birth: string | null;
  address: string;
  role: UserRole;
  is_active: boolean;
  date_joined: string;
}

// ========================================
// Policy
// ========================================
export type CoverageType = 'Basic' | 'Standard' | 'Premium' | 'Comprehensive';

export interface Policy {
  id: string;
  citizen: string;
  citizen_name: string;
  policy_number: string;
  coverage_type: CoverageType;
  start_date: string;
  end_date: string;
  active: boolean;
  max_coverage_amount: string;
  description: string;
  is_valid: boolean;
  created_at: string;
  updated_at: string;
}

// ========================================
// Claim
// ========================================
export type ClaimStatus = 'Submitted' | 'UnderReview' | 'Approved' | 'Rejected' | 'Paid';

export interface Claim {
  id: string;
  policy: string;
  policy_number: string;
  citizen_name: string;
  claim_number: string;
  status: ClaimStatus;
  amount_requested: string;
  amount_approved: string | null;
  description: string;
  diagnosis_code: string;
  submitted_at: string;
  reviewed_at: string | null;
  reviewed_by: string | null;
  reviewed_by_name: string | null;
  notes: string;
  created_at: string;
  updated_at: string;
}

export interface ClaimCreateRequest {
  policy: string;
  amount_requested: number;
  description: string;
  diagnosis_code?: string;
}

export interface ClaimReviewRequest {
  status: 'UnderReview' | 'Approved' | 'Rejected';
  amount_approved?: number;
  notes?: string;
}

export interface ClaimOverrideRequest {
  amount_approved: number;
  notes?: string;
}

// ========================================
// Payment
// ========================================
export interface Payment {
  id: string;
  claim: string;
  claim_number: string;
  citizen_name: string;
  payment_reference: string;
  amount: string;
  paid_at: string;
  payment_method: string;
  notes: string;
  created_at: string;
}

// ========================================
// Provider
// ========================================
export interface Provider {
  id: string;
  name: string;
  license_number: string;
  provider_type: string;
  active: boolean;
  address: string;
  phone_number: string;
  email: string;
  city: string;
  created_at: string;
  updated_at: string;
}

// ========================================
// Notification
// ========================================
export interface Notification {
  id: string;
  message: string;
  read: boolean;
  created_at: string;
}

// ========================================
// API Response
// ========================================
export interface ApiResponse<T> {
  success: boolean;
  message: string;
  data: T;
}

export interface ApiError {
  success: false;
  error: {
    code: number;
    message: string;
    details: Record<string, string[]> | null;
  };
}

export interface PaginatedResponse<T> {
  count: number;
  next: string | null;
  previous: string | null;
  results: T[];
}
