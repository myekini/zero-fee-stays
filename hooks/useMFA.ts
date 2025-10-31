import { useState, useEffect } from 'react';
import { useAuth } from './useAuth';
import { useToast } from './use-toast';
import {
  isMFAEnabled,
  getMFAFactors,
  enrollMFA,
  verifyMFAEnrollment,
  createMFAChallenge,
  verifyMFACode,
  unenrollMFA,
  type MFAEnrollment,
  type QRCodeData,
} from '@/lib/mfa';

export function useMFA() {
  const { user } = useAuth();
  const { toast } = useToast();

  const [isEnabled, setIsEnabled] = useState(false);
  const [factors, setFactors] = useState<MFAEnrollment[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [enrollmentData, setEnrollmentData] = useState<{
    qrCode?: QRCodeData;
    factorId?: string;
  } | null>(null);

  // Check MFA status when user changes
  useEffect(() => {
    if (user) {
      checkMFAStatus();
    } else {
      setIsEnabled(false);
      setFactors([]);
    }
  }, [user]);

  /**
   * Check if MFA is enabled and load factors
   */
  const checkMFAStatus = async () => {
    setIsLoading(true);
    try {
      const [enabled, factorList] = await Promise.all([
        isMFAEnabled(),
        getMFAFactors(),
      ]);

      setIsEnabled(enabled);
      setFactors(factorList);
    } catch (error) {
      console.error('Error checking MFA status:', error);
    } finally {
      setIsLoading(false);
    }
  };

  /**
   * Start MFA enrollment process
   */
  const startEnrollment = async (friendlyName: string = 'Authenticator App') => {
    setIsLoading(true);
    try {
      const result = await enrollMFA(friendlyName);

      if (!result.success) {
        toast({
          title: 'Enrollment Failed',
          description: result.error || 'Failed to start MFA enrollment',
          variant: 'destructive',
        });
        return { success: false };
      }

      setEnrollmentData({
        qrCode: result.qrCode,
        factorId: result.factorId,
      });

      toast({
        title: 'Scan QR Code',
        description: 'Open your authenticator app and scan the QR code',
        variant: 'default',
      });

      return { success: true, qrCode: result.qrCode, factorId: result.factorId };
    } catch (error: any) {
      toast({
        title: 'Enrollment Error',
        description: error.message || 'An unexpected error occurred',
        variant: 'destructive',
      });
      return { success: false };
    } finally {
      setIsLoading(false);
    }
  };

  /**
   * Complete MFA enrollment by verifying code
   */
  const completeEnrollment = async (code: string) => {
    if (!enrollmentData?.factorId) {
      toast({
        title: 'Error',
        description: 'No enrollment in progress',
        variant: 'destructive',
      });
      return { success: false };
    }

    setIsLoading(true);
    try {
      const result = await verifyMFAEnrollment(enrollmentData.factorId, code);

      if (!result.success) {
        toast({
          title: 'Verification Failed',
          description: result.error || 'Invalid code. Please try again.',
          variant: 'destructive',
        });
        return { success: false };
      }

      toast({
        title: 'MFA Enabled! 🎉',
        description: 'Two-factor authentication has been enabled for your account',
        variant: 'default',
      });

      // Clear enrollment data and refresh status
      setEnrollmentData(null);
      await checkMFAStatus();

      return { success: true };
    } catch (error: any) {
      toast({
        title: 'Verification Error',
        description: error.message || 'An unexpected error occurred',
        variant: 'destructive',
      });
      return { success: false };
    } finally {
      setIsLoading(false);
    }
  };

  /**
   * Cancel enrollment process
   */
  const cancelEnrollment = () => {
    setEnrollmentData(null);
  };

  /**
   * Disable MFA
   */
  const disableMFA = async (factorId: string) => {
    setIsLoading(true);
    try {
      const result = await unenrollMFA(factorId);

      if (!result.success) {
        toast({
          title: 'Failed to Disable MFA',
          description: result.error || 'Could not disable two-factor authentication',
          variant: 'destructive',
        });
        return { success: false };
      }

      toast({
        title: 'MFA Disabled',
        description: 'Two-factor authentication has been disabled',
        variant: 'default',
      });

      await checkMFAStatus();

      return { success: true };
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.message || 'An unexpected error occurred',
        variant: 'destructive',
      });
      return { success: false };
    } finally {
      setIsLoading(false);
    }
  };

  /**
   * Verify MFA code during login
   */
  const verifyLoginCode = async (factorId: string, code: string) => {
    setIsLoading(true);
    try {
      // Create challenge
      const challenge = await createMFAChallenge(factorId);

      if (!challenge.success || !challenge.challengeId) {
        toast({
          title: 'Verification Failed',
          description: challenge.error || 'Failed to create challenge',
          variant: 'destructive',
        });
        return { success: false };
      }

      // Verify code
      const result = await verifyMFACode(factorId, challenge.challengeId, code);

      if (!result.success) {
        toast({
          title: 'Invalid Code',
          description: result.error || 'The code you entered is incorrect',
          variant: 'destructive',
        });
        return { success: false };
      }

      toast({
        title: 'Verified! ✓',
        description: 'MFA verification successful',
        variant: 'default',
      });

      return { success: true };
    } catch (error: any) {
      toast({
        title: 'Verification Error',
        description: error.message || 'An unexpected error occurred',
        variant: 'destructive',
      });
      return { success: false };
    } finally {
      setIsLoading(false);
    }
  };

  return {
    isEnabled,
    factors,
    isLoading,
    enrollmentData,
    checkMFAStatus,
    startEnrollment,
    completeEnrollment,
    cancelEnrollment,
    disableMFA,
    verifyLoginCode,
  };
}
