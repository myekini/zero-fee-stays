import React, { useState } from 'react';
import { UserPlus, ArrowLeft, CheckCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { Link } from 'react-router-dom';
import Header from '@/components/Header';

interface SignupData {
  email: string;
  firstName: string;
  lastName: string;
  agreedToTerms: boolean;
}

const HostSignup: React.FC = () => {
  const [formData, setFormData] = useState<SignupData>({
    email: '',
    firstName: '',
    lastName: '',
    agreedToTerms: false
  });
  const [loading, setLoading] = useState(false);
  const [emailSent, setEmailSent] = useState(false);
  const { toast } = useToast();

  const handleInputChange = (field: keyof SignupData, value: string | boolean) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.email.trim() || !formData.firstName.trim() || !formData.lastName.trim()) {
      toast({
        title: 'Missing Information',
        description: 'Please fill in all required fields.',
        variant: 'destructive'
      });
      return;
    }

    if (!formData.agreedToTerms) {
      toast({
        title: 'Terms Required',
        description: 'Please agree to the terms and conditions.',
        variant: 'destructive'
      });
      return;
    }

    setLoading(true);
    try {
      const { error } = await supabase.auth.signInWithOtp({
        email: formData.email.trim(),
        options: {
          emailRedirectTo: `${window.location.origin}/host/dashboard`,
          data: {
            first_name: formData.firstName.trim(),
            last_name: formData.lastName.trim(),
            is_host: true
          }
        }
      });

      if (error) throw error;

      setEmailSent(true);
      toast({
        title: 'Welcome to Hosting!',
        description: 'Check your email to complete registration.',
      });
    } catch (error: any) {
      console.error('Signup error:', error);
      toast({
        title: 'Signup Error',
        description: error.message || 'Failed to create account. Please try again.',
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
                    We've sent a verification link to <strong>{formData.email}</strong>
                  </p>
                  <p className="text-slate-500 text-sm mt-2">
                    Click the link to complete your host registration and access your dashboard.
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
            <CardTitle className="text-2xl">Become a Host</CardTitle>
            <CardDescription>
              Join our community of hosts and start earning from your property.
            </CardDescription>
          </CardHeader>
          
          <CardContent>
            <form onSubmit={handleSignup} className="space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <Label htmlFor="firstName">First Name *</Label>
                  <Input
                    id="firstName"
                    value={formData.firstName}
                    onChange={(e) => handleInputChange('firstName', e.target.value)}
                    placeholder="John"
                    className="mt-1"
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="lastName">Last Name *</Label>
                  <Input
                    id="lastName"
                    value={formData.lastName}
                    onChange={(e) => handleInputChange('lastName', e.target.value)}
                    placeholder="Doe"
                    className="mt-1"
                    required
                  />
                </div>
              </div>

              <div>
                <Label htmlFor="email">Email Address *</Label>
                <Input
                  id="email"
                  type="email"
                  value={formData.email}
                  onChange={(e) => handleInputChange('email', e.target.value)}
                  placeholder="john@example.com"
                  className="mt-1"
                  required
                />
              </div>

              <div className="flex items-start space-x-3">
                <Checkbox
                  id="terms"
                  checked={formData.agreedToTerms}
                  onCheckedChange={(checked) => handleInputChange('agreedToTerms', checked as boolean)}
                />
                <Label htmlFor="terms" className="text-sm leading-relaxed cursor-pointer">
                  I agree to the <span className="text-blue-600 underline">Host Terms of Service</span> and <span className="text-blue-600 underline">Privacy Policy</span>
                </Label>
              </div>

              <Button 
                type="submit" 
                className="w-full btn-primary"
                disabled={loading}
              >
                {loading ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                    Creating Account...
                  </>
                ) : (
                  <>
                    <UserPlus className="w-4 h-4 mr-2" />
                    Create Host Account
                  </>
                )}
              </Button>
            </form>

            <div className="mt-6 pt-6 border-t border-slate-200">
              <div className="text-center">
                <p className="text-sm text-slate-600 mb-3">
                  Already have a host account?
                </p>
                <Link to="/host/auth">
                  <Button variant="outline" className="w-full">
                    Sign In
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

export default HostSignup;