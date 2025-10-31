/**
 * CSRF Protection Utilities
 *
 * Provides CSRF token generation and validation for form submissions
 * Uses httpOnly cookies for storage and double-submit pattern
 */

import { cookies } from 'next/headers';
import { NextRequest, NextResponse } from 'next/server';

const CSRF_TOKEN_NAME = 'csrf_token';
const CSRF_HEADER_NAME = 'x-csrf-token';
const TOKEN_LENGTH = 32;

/**
 * Generate a cryptographically secure random token
 */
export function generateCSRFToken(): string {
  const array = new Uint8Array(TOKEN_LENGTH);
  crypto.getRandomValues(array);
  return Array.from(array, byte => byte.toString(16).padStart(2, '0')).join('');
}

/**
 * Set CSRF token in httpOnly cookie (server-side only)
 */
export async function setCSRFToken(): Promise<string> {
  const token = generateCSRFToken();
  const cookieStore = await cookies();

  cookieStore.set({
    name: CSRF_TOKEN_NAME,
    value: token,
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    path: '/',
    maxAge: 60 * 60 * 24, // 24 hours
  });

  return token;
}

/**
 * Get CSRF token from cookie (server-side only)
 */
export async function getCSRFToken(): Promise<string | undefined> {
  const cookieStore = await cookies();
  return cookieStore.get(CSRF_TOKEN_NAME)?.value;
}

/**
 * Validate CSRF token from request
 * @param request - NextRequest object
 * @returns true if token is valid, false otherwise
 */
export async function validateCSRFToken(request: NextRequest): Promise<boolean> {
  // Get token from header
  const headerToken = request.headers.get(CSRF_HEADER_NAME);

  // Get token from cookie
  const cookieToken = request.cookies.get(CSRF_TOKEN_NAME)?.value;

  // Both must exist and match
  if (!headerToken || !cookieToken) {
    console.warn('CSRF validation failed: missing token');
    return false;
  }

  if (headerToken !== cookieToken) {
    console.warn('CSRF validation failed: token mismatch');
    return false;
  }

  return true;
}

/**
 * Middleware helper to validate CSRF for state-changing requests
 */
export async function requireCSRFToken(request: NextRequest): Promise<NextResponse | null> {
  // Only validate for state-changing methods
  const method = request.method;
  if (!['POST', 'PUT', 'PATCH', 'DELETE'].includes(method)) {
    return null; // No validation needed for GET, HEAD, OPTIONS
  }

  // Skip CSRF for API routes that use Bearer token auth
  const authHeader = request.headers.get('authorization');
  if (authHeader?.startsWith('Bearer ')) {
    return null; // Bearer token provides sufficient protection
  }

  const isValid = await validateCSRFToken(request);

  if (!isValid) {
    return NextResponse.json(
      { error: 'Invalid or missing CSRF token' },
      { status: 403 }
    );
  }

  return null; // Validation passed
}

/**
 * Client-side CSRF token manager
 */
export class CSRFTokenManager {
  private static token: string | null = null;
  private static tokenExpiry: number = 0;

  /**
   * Fetch CSRF token from API
   */
  static async fetchToken(): Promise<string> {
    try {
      const response = await fetch('/api/csrf-token', {
        method: 'GET',
        credentials: 'include',
      });

      if (!response.ok) {
        throw new Error('Failed to fetch CSRF token');
      }

      const data = await response.json();
      this.token = data.token;
      this.tokenExpiry = Date.now() + (23 * 60 * 60 * 1000); // 23 hours

      return data.token;
    } catch (error) {
      console.error('Error fetching CSRF token:', error);
      throw error;
    }
  }

  /**
   * Get CSRF token (fetch if not cached or expired)
   */
  static async getToken(): Promise<string> {
    if (!this.token || Date.now() > this.tokenExpiry) {
      await this.fetchToken();
    }

    return this.token!;
  }

  /**
   * Clear cached token
   */
  static clearToken(): void {
    this.token = null;
    this.tokenExpiry = 0;
  }

  /**
   * Add CSRF token to fetch request headers
   */
  static async getHeaders(): Promise<HeadersInit> {
    const token = await this.getToken();
    return {
      [CSRF_HEADER_NAME]: token,
    };
  }
}

/**
 * Fetch wrapper with automatic CSRF token inclusion
 */
export async function csrfFetch(
  url: string,
  options: RequestInit = {}
): Promise<Response> {
  const method = options.method?.toUpperCase() || 'GET';

  // Add CSRF token for state-changing requests
  if (['POST', 'PUT', 'PATCH', 'DELETE'].includes(method)) {
    const csrfHeaders = await CSRFTokenManager.getHeaders();
    options.headers = {
      ...options.headers,
      ...csrfHeaders,
    };
  }

  // Ensure credentials are included
  options.credentials = options.credentials || 'include';

  return fetch(url, options);
}

export default {
  generateCSRFToken,
  setCSRFToken,
  getCSRFToken,
  validateCSRFToken,
  requireCSRFToken,
  CSRFTokenManager,
  csrfFetch,
};
