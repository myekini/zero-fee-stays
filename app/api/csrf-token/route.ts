import { NextResponse } from 'next/server';
import { setCSRFToken } from '@/lib/csrf';

/**
 * GET /api/csrf-token
 * Returns a CSRF token for client-side usage
 * Sets the token in an httpOnly cookie and returns it in response
 */
export async function GET() {
  try {
    const token = await setCSRFToken();

    return NextResponse.json({
      token,
      message: 'CSRF token generated successfully',
    });
  } catch (error) {
    console.error('Error generating CSRF token:', error);
    return NextResponse.json(
      { error: 'Failed to generate CSRF token' },
      { status: 500 }
    );
  }
}
