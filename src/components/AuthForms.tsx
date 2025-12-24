import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../contexts/AuthContext';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Alert, AlertDescription } from './ui/alert';
import { AlertCircle, Loader2, ArrowLeft, User, Building2, Eye, EyeOff, Shield } from 'lucide-react';
import { toast } from 'sonner';
import { validateICO } from '../utils/validation';

interface AuthFormsProps {
  onNavigate?: (page: string) => void;
  defaultTab?: 'signin' | 'signup';
}

export const AuthForms: React.FC<AuthFormsProps> = ({ onNavigate, defaultTab = 'signin' }) => {
  const { t } = useTranslation();
  const { signIn, signUp, loginAsMockUser } = useAuth();

  // Sign In State
  const [signInData, setSignInData] = useState({
    email: '',
    password: '',
  });

  // Sign Up State
  const [signUpData, setSignUpData] = useState({
    email: '',
    password: '',
    confirmPassword: '',
    role: 'talent' as 'talent' | 'company',
    firstName: '',
    lastName: '',
    companyName: '',
    ico: '',
    termsAccepted: false,
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // Password visibility state
  const [showSignInPassword, setShowSignInPassword] = useState(false);
  const [showSignUpPassword, setShowSignUpPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      await signIn(signInData.email, signInData.password);
      toast.success(t('auth.messages.signin_success'));
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : t('auth.messages.signin_failed');
      setError(errorMessage);
      toast.error(errorMessage);
      console.error('Sign in error:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleTestLogin = async (role: 'talent' | 'company' | 'admin') => {
    setError('');
    setLoading(true);

    try {
      console.log(`[TestLogin] Mock logging in as ${role}...`);
      await loginAsMockUser(role);
      toast.success(t('auth.messages.test_login_success', {
        role: role === 'talent' ? t('auth.roles.talent_title') :
          role === 'company' ? t('auth.roles.company_title') : 'Administrátor'
      }));
    } catch (err: any) {
      console.error('[TestLogin] Failed:', err);
      setError(t('auth.messages.test_login_failed', { error: err.message }));
      setLoading(false);
    }
  };

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (signUpData.password !== signUpData.confirmPassword) {
      setError(t('auth.messages.passwords_mismatch'));
      toast.error(t('auth.messages.passwords_mismatch'));
      return;
    }

    if (signUpData.password.length < 6) {
      setError(t('auth.messages.password_min_length'));
      toast.error(t('auth.messages.password_min_length'));
      return;
    }

    if (signUpData.role === 'company' && signUpData.ico) {
      if (!validateICO(signUpData.ico)) {
        const errorMsg = 'Neplatné IČO. Zadejte prosím platné 8místné identifikační číslo.';
        setError(errorMsg);
        toast.error(errorMsg);
        return;
      }
    }

    if (!signUpData.termsAccepted) {
      const errorMsg = 'Pro registraci musíte souhlasit s podmínkami.';
      setError(errorMsg);
      toast.error(errorMsg);
      return;
    }

    setLoading(true);

    try {
      await signUp({
        email: signUpData.email,
        password: signUpData.password,
        role: signUpData.role,
        firstName: signUpData.firstName,
        lastName: signUpData.lastName,
        companyName: signUpData.role === 'company' ? signUpData.companyName : undefined,
        ico: signUpData.role === 'company' ? signUpData.ico : undefined,
      });
      toast.success(t('auth.messages.signup_success'));
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : t('auth.messages.signup_failed');
      setError(errorMessage);
      toast.error(errorMessage);
      console.error('Sign up error:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-orange-50 p-4">
      <div className="w-full max-w-4xl space-y-6">
        <Card className="w-full max-w-md mx-auto">
          <CardHeader>
            <div className="flex items-center justify-between mb-2">
              {onNavigate && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => onNavigate('landing')}
                  className="text-gray-600 hover:text-blue-600"
                >
                  <ArrowLeft className="w-4 h-4 mr-1" />
                  {t('auth.back')}
                </Button>
              )}
              <div className="flex-1" />
            </div>
            <div className="mx-auto mb-4">
              <img src="/logo.jpg" alt="Collabio Logo" className="w-16 h-16 rounded-2xl shadow-2xl" />
            </div>
            <CardTitle className="text-center">{t('auth.title')}</CardTitle>
            <CardDescription className="text-center">
              {t('auth.subtitle')}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Tabs defaultValue={defaultTab} className="w-full">
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="signin">{t('auth.tabs.signin')}</TabsTrigger>
                <TabsTrigger value="signup">{t('auth.tabs.signup')}</TabsTrigger>
              </TabsList>

              {error && (
                <Alert variant="destructive" className="mt-4">
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
              )}

              <TabsContent value="signin">
                <form onSubmit={handleSignIn} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="signin-email">{t('auth.labels.email')}</Label>
                    <Input
                      id="signin-email"
                      type="email"
                      placeholder={t('auth.placeholders.email')}
                      value={signInData.email}
                      onChange={(e) => setSignInData({ ...signInData, email: e.target.value })}
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="signin-password">{t('auth.labels.password')}</Label>
                    <div className="relative">
                      <Input
                        id="signin-password"
                        type={showSignInPassword ? "text" : "password"}
                        value={signInData.password}
                        onChange={(e) => setSignInData({ ...signInData, password: e.target.value })}
                        required
                        className="pr-10"
                      />
                      <button
                        type="button"
                        onClick={() => setShowSignInPassword(!showSignInPassword)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700 transition-colors"
                        tabIndex={-1}
                      >
                        {showSignInPassword ? (
                          <EyeOff className="w-4 h-4" />
                        ) : (
                          <Eye className="w-4 h-4" />
                        )}
                      </button>
                    </div>
                    <div className="flex justify-end mt-1">
                      <button
                        type="button"
                        onClick={() => onNavigate?.('forgot-password')}
                        className="text-sm text-blue-600 hover:underline"
                      >
                        {t('auth.forgot_password') || 'Zapomenuté heslo?'}
                      </button>
                    </div>
                  </div>

                  <Button type="submit" className="w-full" disabled={loading}>
                    {loading ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        {t('auth.buttons.signing_in')}
                      </>
                    ) : (
                      t('auth.buttons.signin')
                    )}
                  </Button>

                  {/* Test Login Buttons */}
                  <div className="pt-4 mt-4 border-t border-gray-100">
                    <div className="text-xs text-center text-gray-500 mb-2 uppercase tracking-wider font-semibold">
                      {t('auth.test_login.title')}
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                      <Button
                        type="button"
                        variant="outline"
                        disabled={loading}
                        onClick={() => handleTestLogin('talent')}
                        className="text-xs border-blue-200 text-blue-700 hover:bg-blue-50"
                      >
                        <User className="w-3 h-3 mr-1.5" />
                        {t('auth.test_login.talent')}
                      </Button>
                      <Button
                        type="button"
                        variant="outline"
                        disabled={loading}
                        onClick={() => handleTestLogin('company')}
                        className="text-xs border-orange-200 text-orange-700 hover:bg-orange-50"
                      >
                        <Building2 className="w-3 h-3 mr-1.5" />
                        {t('auth.test_login.company')}
                      </Button>
                      <Button
                        type="button"
                        variant="outline"
                        disabled={loading}
                        onClick={() => handleTestLogin('admin')}
                        className="text-xs border-purple-200 text-purple-700 hover:bg-purple-50 col-span-2"
                      >
                        <Shield className="w-3 h-3 mr-1.5" />
                        Admin Test Login
                      </Button>
                    </div>
                  </div>
                </form>
              </TabsContent>

              <TabsContent value="signup">
                <form onSubmit={handleSignUp} className="space-y-4">
                  <div className="space-y-3">
                    <Label>{t('auth.labels.select_account_type')}</Label>
                    <div className="grid grid-cols-2 gap-3">
                      {/* Talent Card */}
                      <div
                        onClick={() => setSignUpData({ ...signUpData, role: 'talent' })}
                        className={`relative cursor-pointer rounded-xl border-2 p-4 transition-all duration-200 ${signUpData.role === 'talent'
                          ? 'border-blue-600 bg-blue-50 shadow-lg scale-105'
                          : 'border-gray-200 hover:border-blue-300 hover:bg-gray-50'
                          }`}
                      >
                        <div className="flex flex-col items-center text-center space-y-2">
                          <div className={`w-12 h-12 rounded-full flex items-center justify-center ${signUpData.role === 'talent'
                            ? 'bg-gradient-to-br from-blue-600 to-blue-400'
                            : 'bg-gray-200'
                            }`}>
                            <User className={`w-6 h-6 ${signUpData.role === 'talent' ? 'text-white' : 'text-gray-600'
                              }`} />
                          </div>
                          <div>
                            <div className={`font-semibold ${signUpData.role === 'talent' ? 'text-blue-600' : 'text-gray-700'
                              }`}>
                              {t('auth.roles.talent_title')}
                            </div>
                            <div className="text-xs text-gray-500 mt-1">
                              {t('auth.roles.talent_desc')}
                            </div>
                          </div>
                        </div>
                        {signUpData.role === 'talent' && (
                          <div className="absolute top-2 right-2 w-5 h-5 bg-blue-600 rounded-full flex items-center justify-center">
                            <svg className="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 20 20">
                              <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                            </svg>
                          </div>
                        )}
                      </div>

                      {/* Company Card */}
                      <div
                        onClick={() => setSignUpData({ ...signUpData, role: 'company' })}
                        className={`relative cursor-pointer rounded-xl border-2 p-4 transition-all duration-200 ${signUpData.role === 'company'
                          ? 'border-orange-600 bg-orange-50 shadow-lg scale-105'
                          : 'border-gray-200 hover:border-orange-300 hover:bg-gray-50'
                          }`}
                      >
                        <div className="flex flex-col items-center text-center space-y-2">
                          <div className={`w-12 h-12 rounded-full flex items-center justify-center ${signUpData.role === 'company'
                            ? 'bg-gradient-to-br from-orange-600 to-orange-400'
                            : 'bg-gray-200'
                            }`}>
                            <Building2 className={`w-6 h-6 ${signUpData.role === 'company' ? 'text-white' : 'text-gray-600'
                              }`} />
                          </div>
                          <div>
                            <div className={`font-semibold ${signUpData.role === 'company' ? 'text-orange-600' : 'text-gray-700'
                              }`}>
                              {t('auth.roles.company_title')}
                            </div>
                            <div className="text-xs text-gray-500 mt-1">
                              {t('auth.roles.company_desc')}
                            </div>
                          </div>
                        </div>
                        {signUpData.role === 'company' && (
                          <div className="absolute top-2 right-2 w-5 h-5 bg-orange-600 rounded-full flex items-center justify-center">
                            <svg className="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 20 20">
                              <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                            </svg>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="firstName">{t('auth.labels.first_name')}</Label>
                      <Input
                        id="firstName"
                        value={signUpData.firstName}
                        onChange={(e) => setSignUpData({ ...signUpData, firstName: e.target.value })}
                        required
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="lastName">{t('auth.labels.last_name')}</Label>
                      <Input
                        id="lastName"
                        value={signUpData.lastName}
                        onChange={(e) => setSignUpData({ ...signUpData, lastName: e.target.value })}
                        required
                      />
                    </div>
                  </div>

                  {signUpData.role === 'company' && (
                    <>
                      <div className="space-y-2">
                        <Label htmlFor="companyName">{t('auth.labels.company_name')}</Label>
                        <Input
                          id="companyName"
                          value={signUpData.companyName}
                          onChange={(e) =>
                            setSignUpData({ ...signUpData, companyName: e.target.value })
                          }
                          required
                        />
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="ico">{t('auth.labels.ico')}</Label>
                        <Input
                          id="ico"
                          value={signUpData.ico}
                          onChange={(e) => setSignUpData({ ...signUpData, ico: e.target.value })}
                          placeholder="12345678"
                        />
                      </div>
                    </>
                  )}

                  <div className="space-y-2">
                    <Label htmlFor="signup-email">{t('auth.labels.email')}</Label>
                    <Input
                      id="signup-email"
                      type="email"
                      placeholder="vas@email.cz"
                      value={signUpData.email}
                      onChange={(e) => setSignUpData({ ...signUpData, email: e.target.value })}
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="signup-password">{t('auth.labels.password')}</Label>
                    <div className="relative">
                      <Input
                        id="signup-password"
                        type={showSignUpPassword ? "text" : "password"}
                        value={signUpData.password}
                        onChange={(e) => setSignUpData({ ...signUpData, password: e.target.value })}
                        required
                        className="pr-10"
                      />
                      <button
                        type="button"
                        onClick={() => setShowSignUpPassword(!showSignUpPassword)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700 transition-colors"
                        tabIndex={-1}
                      >
                        {showSignUpPassword ? (
                          <EyeOff className="w-4 h-4" />
                        ) : (
                          <Eye className="w-4 h-4" />
                        )}
                      </button>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="confirm-password">{t('auth.labels.confirm_password')}</Label>
                    <div className="relative">
                      <Input
                        id="confirm-password"
                        type={showConfirmPassword ? "text" : "password"}
                        value={signUpData.confirmPassword}
                        onChange={(e) =>
                          setSignUpData({ ...signUpData, confirmPassword: e.target.value })
                        }
                        required
                        className="pr-10"
                      />
                      <button
                        type="button"
                        onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700 transition-colors"
                        tabIndex={-1}
                      >
                        {showConfirmPassword ? (
                          <EyeOff className="w-4 h-4" />
                        ) : (
                          <Eye className="w-4 h-4" />
                        )}
                      </button>
                    </div>
                  </div>

                  <div className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      id="terms"
                      checked={signUpData.termsAccepted}
                      onChange={(e) => setSignUpData({ ...signUpData, termsAccepted: e.target.checked })}
                      className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                      required
                    />
                    <Label htmlFor="terms" className="text-sm font-normal text-gray-600">
                      Souhlasím s{' '}
                      <button type="button" onClick={() => onNavigate?.('terms')} className="text-blue-600 hover:underline">
                        obchodními podmínkami
                      </button>
                      {' '}a{' '}
                      <button type="button" onClick={() => onNavigate?.('gdpr')} className="text-blue-600 hover:underline">
                        zpracováním údajů
                      </button>
                    </Label>
                  </div>

                  <Button type="submit" className="w-full" disabled={loading}>
                    {loading ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        {t('auth.buttons.signing_up')}
                      </>
                    ) : (
                      t('auth.buttons.signup')
                    )}
                  </Button>
                </form>
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};
