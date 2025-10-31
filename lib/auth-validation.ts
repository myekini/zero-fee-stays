/**
 * Server-side authentication validation utilities
 * These functions provide secure validation for auth operations
 */

export interface PasswordValidationResult {
  isValid: boolean;
  errors: string[];
  strength: "weak" | "medium" | "strong" | "very_strong";
}

export interface EmailValidationResult {
  isValid: boolean;
  error?: string;
}

export class AuthValidation {
  /**
   * Validate email format (server-side)
   */
  static validateEmail(email: string): EmailValidationResult {
    if (!email || typeof email !== "string") {
      return { isValid: false, error: "Email is required" };
    }

    const trimmedEmail = email.trim();

    if (trimmedEmail.length === 0) {
      return { isValid: false, error: "Email cannot be empty" };
    }

    if (trimmedEmail.length > 254) {
      return { isValid: false, error: "Email is too long" };
    }

    // RFC 5322 compliant email regex
    const emailRegex =
      /^[a-zA-Z0-9.!#$%&'*+\/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)*$/;

    if (!emailRegex.test(trimmedEmail)) {
      return { isValid: false, error: "Invalid email format" };
    }

    // Check for common disposable email domains (optional)
    const disposableDomains = [
      "tempmail.com",
      "throwaway.email",
      "guerrillamail.com",
      "10minutemail.com",
    ];

    const domain = trimmedEmail.split("@")[1]?.toLowerCase();
    if (disposableDomains.includes(domain)) {
      return {
        isValid: false,
        error: "Disposable email addresses are not allowed",
      };
    }

    return { isValid: true };
  }

  /**
   * Validate password strength (server-side)
   */
  static validatePassword(password: string): PasswordValidationResult {
    const errors: string[] = [];
    let strength: "weak" | "medium" | "strong" | "very_strong" = "weak";

    if (!password || typeof password !== "string") {
      return {
        isValid: false,
        errors: ["Password is required"],
        strength: "weak",
      };
    }

    // Minimum length
    if (password.length < 8) {
      errors.push("Password must be at least 8 characters long");
    }

    // Maximum length (prevent DoS)
    if (password.length > 128) {
      errors.push("Password must be less than 128 characters");
    }

    // Character requirements
    const hasUpperCase = /[A-Z]/.test(password);
    const hasLowerCase = /[a-z]/.test(password);
    const hasNumbers = /\d/.test(password);
    const hasSpecialChars = /[!@#$%^&*(),.?":{}|<>_\-+=\[\]\\\/;'`~]/.test(
      password
    );

    if (!hasUpperCase) {
      errors.push("Password must contain at least one uppercase letter");
    }

    if (!hasLowerCase) {
      errors.push("Password must contain at least one lowercase letter");
    }

    if (!hasNumbers) {
      errors.push("Password must contain at least one number");
    }

    if (!hasSpecialChars) {
      errors.push("Password must contain at least one special character");
    }

    // Check for common weak patterns
    const commonPatterns = [
      "password",
      "12345",
      "qwerty",
      "abc123",
      "letmein",
      "welcome",
      "monkey",
      "dragon",
    ];

    const lowerPassword = password.toLowerCase();
    for (const pattern of commonPatterns) {
      if (lowerPassword.includes(pattern)) {
        errors.push("Password contains common patterns that are easy to guess");
        break;
      }
    }

    // Check for sequential characters
    if (/(.)\1{2,}/.test(password)) {
      errors.push("Password contains too many repeated characters");
    }

    // Calculate strength
    if (errors.length === 0) {
      let strengthScore = 0;

      // Length bonus
      if (password.length >= 12) strengthScore += 2;
      else if (password.length >= 10) strengthScore += 1;

      // Character variety
      if (hasUpperCase) strengthScore += 1;
      if (hasLowerCase) strengthScore += 1;
      if (hasNumbers) strengthScore += 1;
      if (hasSpecialChars) strengthScore += 1;

      // Complexity bonus
      const uniqueChars = new Set(password).size;
      if (uniqueChars >= 10) strengthScore += 1;

      if (strengthScore >= 7) strength = "very_strong";
      else if (strengthScore >= 5) strength = "strong";
      else if (strengthScore >= 3) strength = "medium";
      else strength = "weak";
    }

    return {
      isValid: errors.length === 0,
      errors,
      strength,
    };
  }

  /**
   * Validate user role
   */
  static validateRole(role: string): {
    isValid: boolean;
    error?: string;
    normalizedRole?: "user" | "host" | "admin";
  } {
    if (!role || typeof role !== "string") {
      return { isValid: false, error: "Role is required" };
    }

    const normalizedRole = role.toLowerCase().trim();

    if (!["user", "host", "admin"].includes(normalizedRole)) {
      return {
        isValid: false,
        error: 'Role must be one of: "user", "host", "admin"',
      };
    }

    return {
      isValid: true,
      normalizedRole: normalizedRole as "user" | "host" | "admin",
    };
  }

  /**
   * Validate user metadata
   */
  static validateUserMetadata(metadata: {
    firstName?: string;
    lastName?: string;
    phone?: string;
  }): { isValid: boolean; errors: string[] } {
    const errors: string[] = [];

    // First name validation
    if (metadata.firstName !== undefined) {
      if (typeof metadata.firstName !== "string") {
        errors.push("First name must be a string");
      } else if (metadata.firstName.length > 50) {
        errors.push("First name is too long (max 50 characters)");
      } else if (metadata.firstName.length > 0 && metadata.firstName.length < 2) {
        errors.push("First name must be at least 2 characters");
      }
    }

    // Last name validation
    if (metadata.lastName !== undefined) {
      if (typeof metadata.lastName !== "string") {
        errors.push("Last name must be a string");
      } else if (metadata.lastName.length > 50) {
        errors.push("Last name is too long (max 50 characters)");
      }
    }

    // Phone validation (basic)
    if (metadata.phone !== undefined) {
      if (typeof metadata.phone !== "string") {
        errors.push("Phone must be a string");
      } else if (metadata.phone.length > 0) {
        // Remove common phone formatting characters
        const digitsOnly = metadata.phone.replace(/[\s\-\(\)\+]/g, "");
        if (!/^\d{10,15}$/.test(digitsOnly)) {
          errors.push("Phone number must be between 10-15 digits");
        }
      }
    }

    return {
      isValid: errors.length === 0,
      errors,
    };
  }

  /**
   * Sanitize user input
   */
  static sanitizeInput(input: string): string {
    if (!input || typeof input !== "string") return "";

    return input
      .trim()
      .replace(/[<>]/g, "") // Remove potential XSS characters
      .slice(0, 1000); // Limit length
  }

  /**
   * Validate request rate limiting
   * Returns true if request should be allowed
   */
  static checkRateLimit(
    identifier: string,
    attempts: Map<string, { count: number; resetTime: number }>,
    maxAttempts: number = 5,
    windowMs: number = 15 * 60 * 1000
  ): { allowed: boolean; remainingAttempts: number; resetTime: number } {
    const now = Date.now();
    const userAttempts = attempts.get(identifier);

    if (!userAttempts || now > userAttempts.resetTime) {
      const resetTime = now + windowMs;
      attempts.set(identifier, { count: 1, resetTime });
      return { allowed: true, remainingAttempts: maxAttempts - 1, resetTime };
    }

    if (userAttempts.count >= maxAttempts) {
      return {
        allowed: false,
        remainingAttempts: 0,
        resetTime: userAttempts.resetTime,
      };
    }

    userAttempts.count++;
    return {
      allowed: true,
      remainingAttempts: maxAttempts - userAttempts.count,
      resetTime: userAttempts.resetTime,
    };
  }
}

// Export default instance
export default AuthValidation;
