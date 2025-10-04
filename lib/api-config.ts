/**
 * Centralized API Configuration
 * This file manages all API endpoints and ensures consistency across the application
 */

export interface ApiConfig {
  baseUrl: string;
  timeout: number;
  retries: number;
}

// API Configuration
export const apiConfig: ApiConfig = {
  // Use Next.js API routes for all environments
  baseUrl: "/api",
  timeout: 30000, // 30 seconds
  retries: 3,
};

// API Endpoints
export const API_ENDPOINTS = {
  // Properties
  PROPERTIES: {
    LIST: "/properties",
    DETAIL: (id: string) => `/properties/${id}`,
    CREATE: "/properties",
    UPDATE: (id: string) => `/properties/${id}`,
    DELETE: (id: string) => `/properties/${id}`,
    STATS: "/properties/stats/summary",
  },

  // Bookings
  BOOKINGS: {
    CREATE: "/bookings/create",
    DETAIL: (id: string) => `/bookings/${id}`,
    UPDATE: (id: string) => `/bookings/${id}`,
    STATUS: (id: string) => `/bookings/${id}/status`,
    USER: (userId: string) => `/bookings/user/${userId}/bookings`,
    AVAILABILITY: (propertyId: string) =>
      `/bookings/property/${propertyId}/availability`,
  },

  // Payments
  PAYMENTS: {
    CREATE_SESSION: "/payments/create-session",
    VERIFY: "/payments/verify-payment",
    WEBHOOK: "/payments/webhook",
    INTENT: (id: string) => `/payments/payment-intent/${id}`,
  },

  // Admin
  ADMIN: {
    DASHBOARD: "/admin/dashboard",
    USERS: "/admin/users",
    PROPERTIES: "/admin/properties",
    BOOKINGS: "/admin/bookings",
    ANALYTICS: "/admin/analytics",
  },

  // Health
  HEALTH: "/health",
} as const;

// HTTP Client with error handling and retries
export class ApiClient {
  private config: ApiConfig;

  constructor(config: ApiConfig = apiConfig) {
    this.config = config;
  }

  private async request<T>(
    endpoint: string,
    options: RequestInit = {},
    retryCount = 0
  ): Promise<T> {
    const url = `${this.config.baseUrl}${endpoint}`;

    const defaultOptions: RequestInit = {
      headers: {
        "Content-Type": "application/json",
        ...options.headers,
      },
      ...options,
    };

    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(
        () => controller.abort(),
        this.config.timeout
      );

      const response = await fetch(url, {
        ...defaultOptions,
        signal: controller.signal,
      });

      clearTimeout(timeoutId);

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new ApiError(
          errorData.message || errorData.error || "Request failed",
          response.status,
          errorData
        );
      }

      return await response.json();
    } catch (error) {
      if (error instanceof ApiError) {
        throw error;
      }

      // Retry logic for network errors
      if (retryCount < this.config.retries && this.isRetryableError(error)) {
        console.warn(
          `Request failed, retrying... (${retryCount + 1}/${this.config.retries})`
        );
        await this.delay(1000 * Math.pow(2, retryCount)); // Exponential backoff
        return this.request<T>(endpoint, options, retryCount + 1);
      }

      throw new ApiError(
        error instanceof Error ? error.message : "Network error",
        0,
        { originalError: error }
      );
    }
  }

  private isRetryableError(error: any): boolean {
    return (
      error.name === "AbortError" ||
      error.name === "TypeError" ||
      error.message?.includes("fetch")
    );
  }

  private delay(ms: number): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }

  // HTTP Methods
  async get<T>(endpoint: string, options?: RequestInit): Promise<T> {
    return this.request<T>(endpoint, { ...options, method: "GET" });
  }

  async post<T>(
    endpoint: string,
    data?: any,
    options?: RequestInit
  ): Promise<T> {
    return this.request<T>(endpoint, {
      ...options,
      method: "POST",
      body: data ? JSON.stringify(data) : undefined,
    });
  }

  async put<T>(
    endpoint: string,
    data?: any,
    options?: RequestInit
  ): Promise<T> {
    return this.request<T>(endpoint, {
      ...options,
      method: "PUT",
      body: data ? JSON.stringify(data) : undefined,
    });
  }

  async delete<T>(endpoint: string, options?: RequestInit): Promise<T> {
    return this.request<T>(endpoint, { ...options, method: "DELETE" });
  }
}

// Custom Error Class
export class ApiError extends Error {
  constructor(
    message: string,
    public status: number,
    public details?: any
  ) {
    super(message);
    this.name = "ApiError";
  }
}

// Singleton API Client
export const apiClient = new ApiClient();

// Utility functions
export const buildUrl = (
  endpoint: string,
  params?: Record<string, string>
): string => {
  const url = new URL(endpoint, apiConfig.baseUrl);
  if (params) {
    Object.entries(params).forEach(([key, value]) => {
      url.searchParams.append(key, value);
    });
  }
  return url.toString();
};

export const isApiError = (error: any): error is ApiError => {
  return error instanceof ApiError;
};
