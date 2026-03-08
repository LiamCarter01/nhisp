/**
 * API Service Functions
 * ======================
 * All API calls organized by domain.
 */

import apiClient from './client';
import type {
  ApiResponse,
  Claim,
  ClaimCreateRequest,
  ClaimOverrideRequest,
  ClaimReviewRequest,
  LoginRequest,
  Notification,
  PaginatedResponse,
  Payment,
  Policy,
  Provider,
  ProviderFeedbackCitizen,
  ProviderFeedbackCreateRequest,
  ProviderFeedbackManagement,
  ProviderFeedbackPublic,
  ProviderFeedbackStatus,
  RegisterRequest,
  TokenResponse,
  User,
} from './types';

// ========================================
// Auth
// ========================================
export const authApi = {
  login: (data: LoginRequest) =>
    apiClient.post<TokenResponse>('/auth/token/', data),

  refreshToken: (refresh: string) =>
    apiClient.post<TokenResponse>('/auth/token/refresh/', { refresh }),

  register: (data: RegisterRequest) =>
    apiClient.post<ApiResponse<User>>('/auth/register/', data),

  getProfile: () =>
    apiClient.get<ApiResponse<User>>('/auth/profile/'),

  changePassword: (oldPassword: string, newPassword: string) =>
    apiClient.post('/auth/change-password/', {
      old_password: oldPassword,
      new_password: newPassword,
    }),
};

// ========================================
// Users (Admin)
// ========================================
export const usersApi = {
  list: (page = 1) =>
    apiClient.get<PaginatedResponse<User>>('/users/', { params: { page } }),

  get: (id: string) =>
    apiClient.get<User>(`/users/${id}/`),

  create: (data: Partial<User> & { password: string; role: string }) =>
    apiClient.post<User>('/users/', data),

  update: (id: string, data: Partial<User>) =>
    apiClient.patch<User>(`/users/${id}/`, data),

  deactivate: (id: string) =>
    apiClient.post<ApiResponse<null>>(`/users/${id}/deactivate/`),

  activate: (id: string) =>
    apiClient.post<ApiResponse<null>>(`/users/${id}/activate/`),
};

// ========================================
// Policies
// ========================================
export const policiesApi = {
  list: (page = 1) =>
    apiClient.get<PaginatedResponse<Policy>>('/policies/', { params: { page } }),

  get: (id: string) =>
    apiClient.get<Policy>(`/policies/${id}/`),

  create: (data: Partial<Policy>) =>
    apiClient.post<Policy>('/policies/', data),

  update: (id: string, data: Partial<Policy>) =>
    apiClient.patch<Policy>(`/policies/${id}/`, data),
};

// ========================================
// Claims
// ========================================
export const claimsApi = {
  list: (page = 1) =>
    apiClient.get<PaginatedResponse<Claim>>('/claims/', { params: { page } }),

  get: (id: string) =>
    apiClient.get<Claim>(`/claims/${id}/`),

  create: (data: ClaimCreateRequest) =>
    apiClient.post<Claim>('/claims/', data),

  review: (id: string, data: ClaimReviewRequest) =>
    apiClient.post<ApiResponse<Claim>>(`/claims/${id}/review/`, data),

  override: (id: string, data: ClaimOverrideRequest) =>
    apiClient.post<ApiResponse<Claim>>(`/claims/${id}/override/`, data),

  pending: (page = 1) =>
    apiClient.get<PaginatedResponse<Claim>>('/claims/pending/', { params: { page } }),

  rejected: (page = 1) =>
    apiClient.get<PaginatedResponse<Claim>>('/claims/rejected/', { params: { page } }),
};

// ========================================
// Payments
// ========================================
export const paymentsApi = {
  list: (page = 1) =>
    apiClient.get<PaginatedResponse<Payment>>('/payments/', { params: { page } }),

  get: (id: string) =>
    apiClient.get<Payment>(`/payments/${id}/`),

  create: (data: { claim: string; amount: number; payment_method?: string }) =>
    apiClient.post<Payment>('/payments/', data),
};

// ========================================
// Notifications
// ========================================
export const notificationsApi = {
  list: (page = 1) =>
    apiClient.get<PaginatedResponse<Notification>>('/notifications/', { params: { page } }),

  markRead: (id: string) =>
    apiClient.post(`/notifications/${id}/mark_read/`),

  markAllRead: () =>
    apiClient.post('/notifications/mark_all_read/'),

  unreadCount: () =>
    apiClient.get<ApiResponse<{ unread_count: number }>>('/notifications/unread_count/'),
};

// ========================================
// Providers
// ========================================
export const providersApi = {
  list: (page = 1) =>
    apiClient.get<PaginatedResponse<Provider>>('/providers/', { params: { page } }),

  get: (id: string) =>
    apiClient.get<Provider>(`/providers/${id}/`),

  create: (data: Partial<Provider>) =>
    apiClient.post<Provider>('/providers/', data),

  update: (id: string, data: Partial<Provider>) =>
    apiClient.patch<Provider>(`/providers/${id}/`, data),

  listFeedback: (params?: {
    page?: number;
    status?: ProviderFeedbackStatus;
    provider?: string;
  }) => {
    const queryParams = Object.fromEntries(
      Object.entries(params ?? {}).filter(([, value]) => value !== undefined && value !== ''),
    );
    return apiClient.get<PaginatedResponse<ProviderFeedbackManagement>>('/provider-feedback/', {
      params: queryParams,
    });
  },

  submitFeedback: (providerId: string, data: ProviderFeedbackCreateRequest) =>
    apiClient.post<ApiResponse<ProviderFeedbackPublic>>(
      `/providers/${providerId}/submit-feedback/`,
      data,
    ),

  myFeedback: () =>
    apiClient.get<ApiResponse<ProviderFeedbackCitizen[]>>('/providers/my-feedback/'),

  moderateFeedback: (feedbackId: string, status: ProviderFeedbackStatus) =>
    apiClient.post<ApiResponse<ProviderFeedbackManagement>>(
      `/provider-feedback/${feedbackId}/moderate/`,
      { status },
    ),
};
