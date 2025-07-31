import React, { useState } from 'react';
import { Mail, ArrowLeft, CheckCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { Link } from 'react-router-dom';
import Header from '@/components/Header';

const HostAuth: React.FC = () => {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [emailSent, setEmailSent] = useState(false);
  const { toast } = useToast();

  const handleMagicLink = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!email.trim()) {
      toast({
        title: 'Email Required',
        description: 'Please enter your email address.',
        variant: 'destructive'
      });
      return;
    }

    setLoading(true);
    try {
      const { error } = await supabase.auth.signInWithOtp({
        email: email.trim(),
        options: {
          emailRedirectTo: `${window.location.origin}/host/dashboard`,
          data: {
            is_host: true
          }
        }
      });

      if (error) throw error;

      setEmailSent(true);
      toast({
        title: 'Magic Link Sent!',
        description: 'Check your email for the login link.',
      });
    } catch (error: any) {
      console.error('Magic link error:', error);
      toast({
        title: 'Authentication Error',
        description: error.message || 'Failed to send magic link. Please try again.',
        variant: 'destructive'
      });
    } finally {
      setLoading(false);
    }
  };

  if (emailSent) {
    return (
      <div className="min-h-screen bg-slate-50">
        <Header />
        <div className="flex items-center justify-center min-h-[80vh] px-4">
          <Card className="w-full max-w-md">
            <CardContent className="pt-6">
              <div className="text-center space-y-4">
                <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto">
                  <CheckCircle className="w-8 h-8 text-green-600" />
                </div>
                
                <div>
                  <h2 className="text-2xl font-bold text-slate-900 mb-2">Check Your Email</h2>
                  <p className="text-slate-600">
                    We've sent a magic link to <strong>{email}</strong>
                  </p>
                  <p className="text-slate-500 text-sm mt-2">
                    Click the link in your email to access your host dashboard.
                  </p>
                </div>

                <div className="pt-4 space-y-3">
                  <Button 
                    onClick={() => setEmailSent(false)}
                    variant="outline" 
                    className="w-full"
                  >
                    Try Different Email
                  </Button>
                  
                  <Link to="/" className="block">
                    <Button variant="ghost" className="w-full">
                      <ArrowLeft className="w-4 h-4 mr-2" />
                      Back to Home
                    </Button>
                  </Link>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50">
      <Header />
      <div className="flex items-center justify-center min-h-[80vh] px-4">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <CardTitle className="text-2xl">Host Login</CardTitle>
            <CardDescription>
              Enter your email to receive a magic link for secure access to your host dashboard.
            </CardDescription>
          </CardHeader>
          
          <CardContent>
            <form onSubmit={handleMagicLink} className="space-y-4">
              <div>
                <Label htmlFor="email">Email Address</Label>
                <Input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Enter your email"
                  className="mt-1"
                  required
                />
              </div>

              <Button 
                type="submit" 
                className="w-full btn-primary"
                disabled={loading}
              >
                {loading ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                    Sending Magic Link...
                  </>
                ) : (
                  <>
                    <Mail className="w-4 h-4 mr-2" />
                    Send Magic Link
                  </>
                )}
              </Button>
            </form>

            <div className="mt-6 pt-6 border-t border-slate-200">
              <div className="text-center">
                <p className="text-sm text-slate-600 mb-3">
                  New to hosting?
                </p>
                <Link to="/host/signup">
                  <Button variant="outline" className="w-full">
                    Create Host Account
                  </Button>
                </Link>
              </div>
            </div>

            <div className="mt-4 text-center">
              <Link to="/" className="text-sm text-slate-600 hover:text-slate-900">
                ← Back to Home
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default HostAuth;