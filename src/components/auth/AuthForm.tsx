import React, { useState } from 'react';
import { Zap, Lock, Key, ArrowRight, User, Building, Mail, RefreshCw, CheckCircle, TestTube, AlertTriangle } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import LoadingSpinner from '../LoadingSpinner';
import { authService } from '../../services/auth';

interface AuthFormProps {
  initialMode?: 'signin' | 'signup';
  onBack?: () => void;
}

const AuthForm: React.FC<AuthFormProps> = ({ initialMode = 'signin', onBack }) => {
  const { signIn, signUp, createDemoUser } = useAuth();
  const [isSignUp, setIsSignUp] = useState(initialMode === 'signup');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [needsConfirmation, setNeedsConfirmation] = useState(false);
  const [resendLoading, setResendLoading] = useState(false);
  const [resendSuccess, setResendSuccess] = useState(false);
  const [demoLoading, setDemoLoading] = useState(false);
  const [testLoading, setTestLoading] = useState(false);
  
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    fullName: '',
    organizationName: '',
  });

  // Demo credentials
  const demoCredentials = {
    email: 'demo@test.com',
    password: 'demo123456',
    fullName: 'Demo Käyttäjä',
    organizationName: 'Thinkdigi Demo Oy'
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setNeedsConfirmation(false);

    try {
      let result;
      if (isSignUp) {
        result = await signUp(
          formData.email,
          formData.password,
          formData.fullName,
          formData.organizationName
        );
      } else {
        result = await signIn(formData.email, formData.password);
      }

      if (!result.success) {
        setError(result.error || 'Authentication failed');
        if (result.needsConfirmation) {
          setNeedsConfirmation(true);
        }
      } else if (result.needsConfirmation) {
        setNeedsConfirmation(true);
        setError(result.error || 'Please check your email for confirmation.');
      }
    } catch (err) {
      setError('An unexpected error occurred');
    } finally {
      setLoading(false);
    }
  };

  const handleDemoLogin = async () => {
    setDemoLoading(true);
    setError(null);
    setNeedsConfirmation(false);

    try {
      // Always try to create/get demo user first to ensure it exists
      const result = await createDemoUser();

      if (!result.success) {
        setError(result.error || 'Demo-kirjautuminen epäonnistui. Kokeile manuaalista kirjautumista demo-tunnuksilla.');
      }
    } catch (err) {
      setError('Demo-kirjautuminen epäonnistui. Kokeile manuaalista kirjautumista.');
    } finally {
      setDemoLoading(false);
    }
  };

  const handleTestBypass = async () => {
    setTestLoading(true);
    setError(null);
    
    try {
      // Create a mock user for testing without any backend calls
      const mockUser = {
        id: 'test-user-12345',
        email: 'test@demo.com',
        profile: {
          id: 'test-profile-12345',
          user_id: 'test-user-12345',
          email: 'test@demo.com',
          full_name: 'Test Käyttäjä',
          avatar_url: null,
          organization_id: 'test-org-12345',
          role: 'admin' as const,
          preferences: {},
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
          organizations: {
            id: 'test-org-12345',
            name: 'Test Demo Oy',
            business_id: '1234567-8',
            vat_id: 'FI12345678',
            address: {
              street: 'Testikatu 1',
              city: 'Helsinki',
              postalCode: '00100',
              country: 'Finland'
            },
            email: 'test@demo.com',
            phone: '+358 50 123 4567',
            logo_url: null,
            settings: {},
            subscription_plan: 'premium',
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString()
          }
        }
      };
      
      // Simulate the auth context by directly calling the sign in with mock data
      // This bypasses all Supabase calls
      localStorage.setItem('test_mode_user', JSON.stringify(mockUser));
      
      // Force a page reload to trigger auth state change
      window.location.reload();
      
    } catch (err) {
      setError('Testi-kirjautuminen epäonnistui.');
    } finally {
      setTestLoading(false);
    }
  };

  const handleResendConfirmation = async () => {
    if (!formData.email) {
      setError('Please enter your email address');
      return;
    }

    setResendLoading(true);
    setResendSuccess(false);
    
    try {
      const result = await authService.resendConfirmation(formData.email);
      if (result.success) {
        setResendSuccess(true);
        setError(null);
      } else {
        setError(result.error || 'Failed to resend confirmation email');
      }
    } catch (err) {
      setError('Failed to resend confirmation email');
    } finally {
      setResendLoading(false);
    }
  };

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    // Clear confirmation state when user changes email
    if (field === 'email') {
      setNeedsConfirmation(false);
      setResendSuccess(false);
    }
  };

  const fillDemoCredentials = () => {
    setFormData({
      email: demoCredentials.email,
      password: demoCredentials.password,
      fullName: demoCredentials.fullName,
      organizationName: demoCredentials.organizationName,
    });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-fuchsia-950 to-indigo-950 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      {/* Back Button */}
      {onBack && (
        <button 
          onClick={onBack}
          className="absolute top-4 left-4 text-white hover:text-blue-300 transition-colors flex items-center"
        >
          <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <path d="M19 12H5M12 19l-7-7 7-7"/>
          </svg>
          <span className="ml-2">Takaisin</span>
        </button>
      )}
      
      {/* Background Pattern */}
      <div className="absolute inset-0 bg-[url('data:image/svg+xml,%3Csvg width=%2260%22 height=%2260%22 viewBox=%220 0 60 60%22 xmlns=%22http://www.w3.org/2000/svg%22%3E%3Cg fill=%22none%22 fill-rule=%22evenodd%22%3E%3Cg fill=%22%23ffffff%22 fill-opacity=%220.05%22%3E%3Ccircle cx=%2230%22 cy=%2230%22 r=%222%22/%3E%3C/g%3E%3C/g%3E%3C/svg%3E')] opacity-20"></div>
      
      <div className="max-w-md w-full space-y-8 relative">
        <div className="text-center">
          <div className="mx-auto h-20 w-20 bg-gradient-to-br from-fuchsia-500 via-violet-500 to-indigo-600 rounded-2xl flex items-center justify-center shadow-2xl shadow-fuchsia-500/25 relative">
            <div className="absolute -inset-1 bg-gradient-to-br from-fuchsia-500 via-violet-500 to-indigo-600 rounded-2xl blur opacity-50"></div>
            <Bolt className="h-10 w-10 text-white" />
          </div>
          <h2 className="mt-8 text-4xl font-bold bg-gradient-to-r from-fuchsia-400 via-violet-400 to-indigo-400 bg-clip-text text-transparent">
            e-Invoice Hub
          </h2>
          <p className="mt-3 text-lg text-fuchsia-200">
            by <span className="font-semibold text-white">Thinkdigi</span>
          </p>
          <p className="mt-2 text-sm text-fuchsia-300">
            {isSignUp ? 'Create your account' : 'Sign in to your account'}
          </p>
        </div>

        {/* Demo Login Button */}
        <div className="bg-gradient-to-r from-green-600/20 to-emerald-700/20 backdrop-blur-lg rounded-2xl p-6 border border-green-400/30 mb-6 hover:shadow-lg hover:shadow-green-500/10 transition-all duration-300 relative">
          <div className="absolute -inset-0.5 bg-gradient-to-r from-green-500/20 to-emerald-500/20 rounded-2xl blur opacity-0 hover:opacity-100 transition-opacity duration-300"></div>
          <div className="text-center mb-4">
            <TestTube className="w-8 h-8 text-green-300 mx-auto mb-2" />
            <h3 className="text-lg font-semibold text-green-200">Demo Testaus</h3>
            <p className="text-sm text-green-300 mt-1">
              Kokeile sovellusta ilman rekisteröitymistä
            </p>
          </div>
          <button
            onClick={handleDemoLogin}
            disabled={demoLoading || loading || testLoading}
            className="w-full flex justify-center items-center py-3 px-4 bg-gradient-to-r from-green-600 to-emerald-700 text-white rounded-xl hover:from-green-700 hover:to-emerald-800 focus:outline-none focus:ring-2 focus:ring-green-500 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 shadow-lg hover:shadow-xl hover:shadow-green-500/20 font-semibold relative z-10"
          >
            {demoLoading ? (
              <LoadingSpinner size="sm" />
            ) : (
              <>
                <TestTube className="w-4 h-4 mr-2" />
                Kirjaudu Demo-tilillä
              </>
            )}
          </button>
          
          {/* Manual demo credentials info */}
          <div className="mt-4 p-3 bg-green-900/30 rounded-lg border border-green-400/20">
            <div className="flex items-start">
              <AlertTriangle className="w-4 h-4 text-green-300 mt-0.5 mr-2 flex-shrink-0" />
              <div className="text-xs text-green-300">
                <p className="font-medium mb-1">Jos automaattinen kirjautuminen ei toimi:</p>
                <p>Email: <span className="font-mono">demo@test.com</span></p>
                <p>Salasana: <span className="font-mono">demo123456</span></p>
              </div>
            </div>
          </div>
        </div>
        
        {/* Test Bypass Button - Only in development */}
        {import.meta.env.DEV && (
          <div className="bg-gradient-to-r from-fuchsia-600/20 to-pink-700/20 backdrop-blur-lg rounded-2xl p-6 border border-fuchsia-400/30 mb-6 hover:shadow-lg hover:shadow-fuchsia-500/10 transition-all duration-300 relative">
            <div className="absolute -inset-0.5 bg-gradient-to-r from-fuchsia-500/20 to-pink-500/20 rounded-2xl blur opacity-0 hover:opacity-100 transition-opacity duration-300"></div>
            <div className="text-center mb-4">
              <Zap className="w-8 h-8 text-fuchsia-300 mx-auto mb-2" />
              <h3 className="text-lg font-semibold text-fuchsia-200">Kehitystesti</h3>
              <p className="text-sm text-fuchsia-300 mt-1">
                Ohita kirjautuminen testiympäristössä
              </p>
            </div>
            <button
              onClick={handleTestBypass}
              disabled={testLoading || loading || demoLoading}
              className="w-full flex justify-center items-center py-3 px-4 bg-gradient-to-r from-fuchsia-600 via-violet-600 to-pink-700 text-white rounded-xl hover:from-fuchsia-700 hover:via-violet-700 hover:to-pink-800 focus:outline-none focus:ring-2 focus:ring-fuchsia-500 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 shadow-lg hover:shadow-xl hover:shadow-fuchsia-500/20 font-semibold relative z-10"
            >
              {testLoading ? (
                <LoadingSpinner size="sm" />
              ) : (
                <>
                  <Zap className="w-4 h-4 mr-2" />
                  Testaa Sovellusta
                </>
              )}
            </button>
          </div>
        )}
        
        <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-8 shadow-2xl border border-white/20">
          <form className="space-y-6 relative" onSubmit={handleSubmit}>
            <div className="absolute -top-12 -right-12 w-24 h-24 bg-blue-500/20 rounded-full filter blur-xl"></div>
            <div className="absolute -bottom-12 -left-12 w-24 h-24 bg-purple-500/20 rounded-full filter blur-xl"></div>
            <div className="space-y-5">
              {isSignUp && (
                <>
                  <div>
                    <label htmlFor="fullName" className="block text-sm font-medium text-white mb-2">
                      Full Name
                    </label>
                    <div className="relative">
                      <User className="absolute left-4 top-4 h-5 w-5 text-blue-300" />
                      <input
                        id="fullName"
                        type="text"
                        required={isSignUp}
                        value={formData.fullName}
                        onChange={(e) => handleInputChange('fullName', e.target.value)}
                        className="w-full pl-12 pr-4 py-4 bg-white/10 border border-white/20 placeholder-blue-200 text-white rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-transparent backdrop-blur-sm transition-all duration-200"
                        placeholder="Enter your full name"
                      />
                    </div>
                  </div>

                  <div>
                    <label htmlFor="organizationName" className="block text-sm font-medium text-white mb-2">
                      Organization Name
                    </label>
                    <div className="relative">
                      <Building className="absolute left-4 top-4 h-5 w-5 text-blue-300" />
                      <input
                        id="organizationName"
                        type="text"
                        required={isSignUp}
                        value={formData.organizationName}
                        onChange={(e) => handleInputChange('organizationName', e.target.value)}
                        className="w-full pl-12 pr-4 py-4 bg-white/10 border border-white/20 placeholder-blue-200 text-white rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-transparent backdrop-blur-sm transition-all duration-200"
                        placeholder="Enter your organization name"
                      />
                    </div>
                  </div>
                </>
              )}

              <div>
                <label htmlFor="email" className="block text-sm font-medium text-white mb-2">
                  Email Address
                </label>
                <div className="relative">
                  <Mail className="absolute left-4 top-4 h-5 w-5 text-blue-300" />
                  <input
                    id="email"
                    type="email"
                    required
                    value={formData.email}
                    onChange={(e) => handleInputChange('email', e.target.value)}
                    className="w-full pl-12 pr-4 py-4 bg-white/10 border border-white/20 placeholder-blue-200 text-white rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-transparent backdrop-blur-sm transition-all duration-200"
                    placeholder="Enter your email"
                  />
                </div>
              </div>
              
              <div>
                <label htmlFor="password" className="block text-sm font-medium text-white mb-2">
                  Password
                </label>
                <div className="relative">
                  <Lock className="absolute left-4 top-4 h-5 w-5 text-blue-300" />
                  <input
                    id="password"
                    type="password"
                    required
                    value={formData.password}
                    onChange={(e) => handleInputChange('password', e.target.value)}
                    className="w-full pl-12 pr-4 py-4 bg-white/10 border border-white/20 placeholder-blue-200 text-white rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-transparent backdrop-blur-sm transition-all duration-200"
                    placeholder="Enter your password"
                  />
                </div>
              </div>
            </div>

            {/* Fill Demo Credentials Button */}
            {isSignUp && (
              <div className="text-center">
                <button
                  type="button"
                  onClick={fillDemoCredentials}
                  className="text-sm text-blue-300 hover:text-white transition-colors underline"
                >
                  Täytä demo-tiedoilla
                </button>
              </div>
            )}

            {error && (
              <div className={`border rounded-xl p-4 backdrop-blur-sm ${
                needsConfirmation 
                  ? 'bg-amber-500/20 border-amber-400/30' 
                  : 'bg-red-500/20 border-red-400/30'
              }`}>
                <p className={`text-sm ${
                  needsConfirmation ? 'text-amber-200' : 'text-red-200'
                }`}>
                  {error}
                </p>
              </div>
            )}

            {resendSuccess && (
              <div className="bg-green-500/20 border border-green-400/30 rounded-xl p-4 backdrop-blur-sm">
                <div className="flex items-center">
                  <CheckCircle className="w-4 h-4 text-green-300 mr-2" />
                  <p className="text-sm text-green-200">
                    Confirmation email sent! Please check your inbox.
                  </p>
                </div>
              </div>
            )}

            {needsConfirmation && (
              <div className="space-y-3">
                <button
                  type="button"
                  onClick={handleResendConfirmation}
                  disabled={resendLoading}
                  className="w-full flex justify-center items-center py-3 px-4 border border-amber-400/30 text-sm font-medium rounded-xl text-amber-200 bg-amber-500/10 hover:bg-amber-500/20 focus:outline-none focus:ring-2 focus:ring-amber-400 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200"
                >
                  {resendLoading ? (
                    <LoadingSpinner size="sm" />
                  ) : (
                    <>
                      <RefreshCw className="w-4 h-4 mr-2" />
                      Resend Confirmation Email
                    </>
                  )}
                </button>
              </div>
            )}

            <button
              type="submit"
              disabled={loading || demoLoading || testLoading}
              className="group relative w-full flex justify-center items-center py-4 px-6 border border-transparent text-sm font-semibold rounded-xl text-white bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 shadow-lg hover:shadow-xl hover:shadow-purple-500/20"
            >
              {loading ? (
                <LoadingSpinner size="sm" />
              ) : (
                <>
                  {isSignUp ? 'Create Account' : 'Sign In'}
                  <ArrowRight className="ml-2 w-4 h-4 group-hover:translate-x-1 transition-transform duration-200" />
                </>
              )}
            </button>

            <div className="text-center">
              <button
                type="button"
                onClick={() => {
                  setIsSignUp(!isSignUp);
                  setError(null);
                  setNeedsConfirmation(false);
                  setResendSuccess(false);
                }}
                className="text-purple-300 hover:text-white transition-colors text-sm font-medium"
              >
                {isSignUp 
                  ? 'Already have an account? Sign in' 
                  : "Don't have an account? Sign up"
                }
              </button>
            </div>
          </form>
        </div>
        
        <div className="bg-fuchsia-900/30 backdrop-blur-sm rounded-xl p-6 border border-fuchsia-400/20 relative">
          <div className="absolute -inset-0.5 bg-gradient-to-r from-fuchsia-500/10 to-indigo-500/10 rounded-xl blur opacity-0 hover:opacity-100 transition-opacity duration-300"></div>
          <h3 className="text-sm font-semibold text-fuchsia-200 mb-3 flex items-center relative z-10">
            <Bolt className="w-4 h-4 mr-2" />
            e-Invoice Hub by Thinkdigi
          </h3>
          <p className="text-xs text-fuchsia-300 leading-relaxed relative z-10">
            Complete e-invoicing platform with Maventa integration, Shopify sync, 
            and advanced invoice management capabilities.
          </p>
          <div className="mt-3 pt-3 border-t border-fuchsia-400/20 relative z-10">
            <p className="text-xs text-fuchsia-400 font-medium">Demo tunnukset:</p>
            <p className="text-xs text-fuchsia-300">Email: demo@test.com</p>
            <p className="text-xs text-fuchsia-300">Password: demo123456</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AuthForm;