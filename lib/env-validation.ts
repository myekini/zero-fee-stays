/**
 * Environment Variable Validation
 * Ensures all required environment variables are present
 */

export interface EnvironmentConfig {
  // Supabase
  supabaseUrl: string;
  supabaseAnonKey: string;
  supabaseServiceRoleKey: string;
  
  // Stripe
  stripeSecretKey: string;
  stripePublishableKey: string;
  
  // Email
  resendApiKey?: string;
  
  // App
  nextAuthUrl?: string;
  nodeEnv: 'development' | 'production' | 'test';
}

export class EnvironmentValidationError extends Error {
  constructor(missingVars: string[]) {
    super(`Missing required environment variables: ${missingVars.join(', ')}`);
    this.name = 'EnvironmentValidationError';
  }
}

export function validateEnvironment(): EnvironmentConfig {
  const requiredVars = [
    'NEXT_PUBLIC_SUPABASE_URL',
    'NEXT_PUBLIC_SUPABASE_ANON_KEY', 
    'SUPABASE_SERVICE_ROLE_KEY',
    'STRIPE_SECRET_KEY',
    'NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY'
  ];
  
  // Log current environment for debugging
  console.log('🔧 Environment Check:', {
    NODE_ENV: process.env.NODE_ENV,
    SUPABASE_URL: process.env.NEXT_PUBLIC_SUPABASE_URL ? '✅ Set' : '❌ Missing',
    STRIPE_KEY: process.env.STRIPE_SECRET_KEY ? '✅ Set' : '❌ Missing',
    RESEND_KEY: process.env.RESEND_API_KEY ? '✅ Set' : '❌ Missing'
  });
  
  const missingVars: string[] = [];
  
  requiredVars.forEach(varName => {
    if (!process.env[varName]) {
      missingVars.push(varName);
    }
  });
  
  if (missingVars.length > 0) {
    throw new EnvironmentValidationError(missingVars);
  }
  
  return {
    supabaseUrl: process.env.NEXT_PUBLIC_SUPABASE_URL!,
    supabaseAnonKey: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    supabaseServiceRoleKey: process.env.SUPABASE_SERVICE_ROLE_KEY!,
    stripeSecretKey: process.env.STRIPE_SECRET_KEY!,
    stripePublishableKey: process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY!,
    resendApiKey: process.env.RESEND_API_KEY,
    nextAuthUrl: process.env.NEXTAUTH_URL,
    nodeEnv: (process.env.NODE_ENV as 'development' | 'production' | 'test') || 'development'
  };
}

export function getEnvironmentConfig(): EnvironmentConfig {
  try {
    return validateEnvironment();
  } catch (error) {
    console.error('Environment validation failed:', error);
    // In development, continue with warnings
    if (process.env.NODE_ENV === 'development') {
      console.warn('⚠️ Running in development mode with incomplete environment configuration');
      return {
        supabaseUrl: process.env.NEXT_PUBLIC_SUPABASE_URL || '',
        supabaseAnonKey: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '',
        supabaseServiceRoleKey: process.env.SUPABASE_SERVICE_ROLE_KEY || '',
        stripeSecretKey: process.env.STRIPE_SECRET_KEY || '',
        stripePublishableKey: process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY || '',
        resendApiKey: process.env.RESEND_API_KEY,
        nextAuthUrl: process.env.NEXTAUTH_URL,
        nodeEnv: 'development'
      };
    }
    throw error;
  }
}

export function checkEnvironmentHealth(): { healthy: boolean; issues: string[] } {
  const issues: string[] = [];
  
  try {
    const config = getEnvironmentConfig();
    
    // Check Supabase
    if (!config.supabaseUrl.includes('supabase.co')) {
      issues.push('Invalid Supabase URL format');
    }
    
    // Check Stripe keys format
    if (!config.stripeSecretKey.startsWith('sk_')) {
      issues.push('Invalid Stripe secret key format');
    }
    
    if (!config.stripePublishableKey.startsWith('pk_')) {
      issues.push('Invalid Stripe publishable key format');
    }
    
    // Check email service
    if (!config.resendApiKey) {
      issues.push('Resend API key not configured (emails will not work)');
    }
    
  } catch (error) {
    issues.push(error instanceof Error ? error.message : 'Environment validation failed');
  }
  
  return {
    healthy: issues.length === 0,
    issues
  };
}
