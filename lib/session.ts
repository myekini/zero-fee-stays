import { Session } from "@supabase/supabase-js";
import AuthUtils from "./auth";

export interface SessionData {
  accessToken: string;
  refreshToken: string;
  expiresAt: number;
  userId: string;
  userRole: string;
}

export class SessionManager {
  private static readonly SESSION_KEY = "zero_fee_stays_session";
  private static readonly TOKEN_REFRESH_THRESHOLD = 5 * 60 * 1000; // 5 minutes

  /**
   * Store session data securely
   */
  static storeSession(session: Session): void {
    if (!session?.access_token) return;

    const sessionData: SessionData = {
      accessToken: session.access_token,
      refreshToken: session.refresh_token || "",
      expiresAt: session.expires_at
        ? session.expires_at * 1000
        : Date.now() + 3600000,
      userId: session.user.id,
      userRole: AuthUtils.determineUserRole(session.user),
    };

    try {
      if (typeof window !== "undefined" && window.localStorage) {
        localStorage.setItem(this.SESSION_KEY, JSON.stringify(sessionData));
      }
    } catch (error) {
      console.error("Error storing session:", error);
    }
  }

  /**
   * Retrieve stored session data
   */
  static getStoredSession(): SessionData | null {
    try {
      if (typeof window !== "undefined" && window.localStorage) {
        const stored = localStorage.getItem(this.SESSION_KEY);
        if (!stored) return null;

        const sessionData: SessionData = JSON.parse(stored);

        // Check if session is expired
        if (Date.now() > sessionData.expiresAt) {
          this.clearSession();
          return null;
        }

        return sessionData;
      }
      return null;
    } catch (error) {
      console.error("Error retrieving session:", error);
      this.clearSession();
      return null;
    }
  }

  /**
   * Clear stored session data
   */
  static clearSession(): void {
    try {
      if (typeof window !== "undefined" && window.localStorage) {
        localStorage.removeItem(this.SESSION_KEY);
      }
    } catch (error) {
      console.error("Error clearing session:", error);
    }
  }

  /**
   * Check if current session needs refresh
   */
  static needsRefresh(): boolean {
    const session = this.getStoredSession();
    if (!session) return false;

    const timeUntilExpiry = session.expiresAt - Date.now();
    return timeUntilExpiry < this.TOKEN_REFRESH_THRESHOLD;
  }

  /**
   * Get access token from stored session
   */
  static getAccessToken(): string | null {
    const session = this.getStoredSession();
    return session?.accessToken || null;
  }

  /**
   * Validate session and return user info
   */
  static validateStoredSession(): {
    isValid: boolean;
    userId?: string;
    userRole?: string;
  } {
    const session = this.getStoredSession();
    if (!session) {
      return { isValid: false };
    }

    // Validate token
    const tokenPayload = AuthUtils.decodeToken(session.accessToken);
    if (!tokenPayload) {
      this.clearSession();
      return { isValid: false };
    }

    return {
      isValid: true,
      userId: session.userId,
      userRole: session.userRole,
    };
  }

  /**
   * Update session with new tokens
   */
  static updateSession(accessToken: string, refreshToken?: string): void {
    const currentSession = this.getStoredSession();
    if (!currentSession) return;

    const tokenPayload = AuthUtils.decodeToken(accessToken);
    if (!tokenPayload) return;

    const updatedSession: SessionData = {
      ...currentSession,
      accessToken,
      refreshToken: refreshToken || currentSession.refreshToken,
      expiresAt: tokenPayload.exp
        ? tokenPayload.exp * 1000
        : Date.now() + 3600000,
    };

    try {
      if (typeof window !== "undefined" && window.localStorage) {
        localStorage.setItem(this.SESSION_KEY, JSON.stringify(updatedSession));
      }
    } catch (error) {
      console.error("Error updating session:", error);
    }
  }

  /**
   * Get session expiry time
   */
  static getSessionExpiry(): Date | null {
    const session = this.getStoredSession();
    return session ? new Date(session.expiresAt) : null;
  }

  /**
   * Check if session is about to expire (within 1 hour)
   */
  static isSessionExpiringSoon(): boolean {
    const session = this.getStoredSession();
    if (!session) return false;

    const oneHour = 60 * 60 * 1000;
    const timeUntilExpiry = session.expiresAt - Date.now();
    return timeUntilExpiry < oneHour;
  }

  /**
   * Get session info for debugging
   */
  static getSessionInfo(): {
    hasSession: boolean;
    expiresAt: string | null;
    timeUntilExpiry: string | null;
    needsRefresh: boolean;
  } {
    const session = this.getStoredSession();
    if (!session) {
      return {
        hasSession: false,
        expiresAt: null,
        timeUntilExpiry: null,
        needsRefresh: false,
      };
    }

    const now = Date.now();
    const timeUntilExpiry = session.expiresAt - now;

    return {
      hasSession: true,
      expiresAt: new Date(session.expiresAt).toISOString(),
      timeUntilExpiry:
        timeUntilExpiry > 0
          ? `${Math.floor(timeUntilExpiry / 1000)}s`
          : "Expired",
      needsRefresh: this.needsRefresh(),
    };
  }
}

export default SessionManager;
