/**
 * Multi-Factor Authentication (MFA) Utilities
 *
 * Provides utilities for managing two-factor authentication
 * using Supabase's built-in MFA support (TOTP)
 */

import { supabase } from '@/integrations/supabase/client';

export interface MFAEnrollment {
  id: string;
  type: 'totp';
  friendlyName: string;
  createdAt: string;
}

export interface QRCodeData {
  qr_code: string;
  secret: string;
  uri: string;
}

/**
 * Check if user has MFA enabled
 */
export async function isMFAEnabled(): Promise<boolean> {
  try {
    const { data, error } = await supabase.auth.mfa.listFactors();

    if (error) {
      console.error('Error checking MFA status:', error);
      return false;
    }

    // Check if user has any verified factors
    const verifiedFactors = data?.all?.filter(factor => factor.status === 'verified') || [];
    return verifiedFactors.length > 0;
  } catch (error) {
    console.error('Error in isMFAEnabled:', error);
    return false;
  }
}

/**
 * Get list of enrolled MFA factors
 */
export async function getMFAFactors(): Promise<MFAEnrollment[]> {
  try {
    const { data, error } = await supabase.auth.mfa.listFactors();

    if (error) {
      console.error('Error listing MFA factors:', error);
      return [];
    }

    return (data?.all || []).map(factor => ({
      id: factor.id,
      type: factor.factor_type as 'totp',
      friendlyName: factor.friendly_name || 'Authenticator App',
      createdAt: factor.created_at,
    }));
  } catch (error) {
    console.error('Error in getMFAFactors:', error);
    return [];
  }
}

/**
 * Enroll in MFA and get QR code
 * @param friendlyName - Optional friendly name for the factor
 */
export async function enrollMFA(friendlyName: string = 'Authenticator App'): Promise<{
  success: boolean;
  qrCode?: QRCodeData;
  factorId?: string;
  error?: string;
}> {
  try {
    const { data, error } = await supabase.auth.mfa.enroll({
      factorType: 'totp',
      friendlyName,
    });

    if (error) {
      console.error('Error enrolling in MFA:', error);
      return { success: false, error: error.message };
    }

    if (!data) {
      return { success: false, error: 'No data returned from enrollment' };
    }

    return {
      success: true,
      qrCode: {
        qr_code: data.totp.qr_code,
        secret: data.totp.secret,
        uri: data.totp.uri,
      },
      factorId: data.id,
    };
  } catch (error: any) {
    console.error('Error in enrollMFA:', error);
    return { success: false, error: error.message || 'Failed to enroll in MFA' };
  }
}

/**
 * Verify MFA enrollment with code from authenticator app
 * @param factorId - The factor ID from enrollment
 * @param code - 6-digit code from authenticator app
 */
export async function verifyMFAEnrollment(
  factorId: string,
  code: string
): Promise<{ success: boolean; error?: string }> {
  try {
    const challenge = await supabase.auth.mfa.challenge({ factorId });

    if (challenge.error) {
      console.error('Error creating challenge:', challenge.error);
      return { success: false, error: challenge.error.message };
    }

    const verify = await supabase.auth.mfa.verify({
      factorId,
      challengeId: challenge.data.id,
      code,
    });

    if (verify.error) {
      console.error('Error verifying code:', verify.error);
      return { success: false, error: verify.error.message };
    }

    return { success: true };
  } catch (error: any) {
    console.error('Error in verifyMFAEnrollment:', error);
    return { success: false, error: error.message || 'Verification failed' };
  }
}

/**
 * Challenge user for MFA code during sign-in
 * @param factorId - The factor ID to challenge
 */
export async function createMFAChallenge(factorId: string): Promise<{
  success: boolean;
  challengeId?: string;
  error?: string;
}> {
  try {
    const { data, error } = await supabase.auth.mfa.challenge({ factorId });

    if (error) {
      console.error('Error creating MFA challenge:', error);
      return { success: false, error: error.message };
    }

    return { success: true, challengeId: data.id };
  } catch (error: any) {
    console.error('Error in createMFAChallenge:', error);
    return { success: false, error: error.message || 'Failed to create challenge' };
  }
}

/**
 * Verify MFA code during sign-in
 * @param factorId - The factor ID
 * @param challengeId - The challenge ID from createMFAChallenge
 * @param code - 6-digit code from authenticator app
 */
export async function verifyMFACode(
  factorId: string,
  challengeId: string,
  code: string
): Promise<{ success: boolean; error?: string }> {
  try {
    const { data, error } = await supabase.auth.mfa.verify({
      factorId,
      challengeId,
      code,
    });

    if (error) {
      console.error('Error verifying MFA code:', error);
      return { success: false, error: error.message };
    }

    return { success: true };
  } catch (error: any) {
    console.error('Error in verifyMFACode:', error);
    return { success: false, error: error.message || 'Verification failed' };
  }
}

/**
 * Unenroll from MFA
 * @param factorId - The factor ID to remove
 */
export async function unenrollMFA(factorId: string): Promise<{
  success: boolean;
  error?: string;
}> {
  try {
    const { data, error } = await supabase.auth.mfa.unenroll({ factorId });

    if (error) {
      console.error('Error unenrolling from MFA:', error);
      return { success: false, error: error.message };
    }

    return { success: true };
  } catch (error: any) {
    console.error('Error in unenrollMFA:', error);
    return { success: false, error: error.message || 'Failed to unenroll' };
  }
}

/**
 * Get assurance level after MFA verification
 */
export async function getAssuranceLevel(): Promise<{
  currentLevel: string | null;
  nextLevel: string | null;
  currentAuthenticationMethods: any[];
}> {
  try {
    const { data, error } = await supabase.auth.mfa.getAuthenticatorAssuranceLevel();

    if (error) {
      console.error('Error getting assurance level:', error);
      return {
        currentLevel: null,
        nextLevel: null,
        currentAuthenticationMethods: [],
      };
    }

    return {
      currentLevel: data.currentLevel,
      nextLevel: data.nextLevel,
      currentAuthenticationMethods: data.currentAuthenticationMethods,
    };
  } catch (error) {
    console.error('Error in getAssuranceLevel:', error);
    return {
      currentLevel: null,
      nextLevel: null,
      currentAuthenticationMethods: [],
    };
  }
}

export default {
  isMFAEnabled,
  getMFAFactors,
  enrollMFA,
  verifyMFAEnrollment,
  createMFAChallenge,
  verifyMFACode,
  unenrollMFA,
  getAssuranceLevel,
};
