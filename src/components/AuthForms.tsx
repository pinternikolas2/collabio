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
        <Card className="w-full max-w-md mx-auto border-2 border-blue-100 shadow-2xl bg-white/90 backdrop-blur-sm">
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
            <div className="mx-auto mb-4 relative group">
              <div className="absolute inset-0 bg-gradient-to-r from-blue-600 to-orange-500 rounded-2xl blur opacity-25 group-hover:opacity-40 transition-opacity"></div>
              <img src="/logo.jpg" alt="Collabio Logo" className="relative w-20 h-20 rounded-2xl shadow-lg" />
            </div>
            <CardTitle className="text-center text-3xl font-bold bg-gradient-to-r from-blue-700 to-orange-600 bg-clip-text text-transparent">
              {t('auth.title')}
            </CardTitle>
            <CardDescription className="text-center text-base mt-2">
              {t('auth.subtitle')}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Tabs defaultValue={defaultTab} className="w-full">
              <TabsList className="grid w-full grid-cols-2 mb-6 p-1 bg-gray-100/80 rounded-xl">
                <TabsTrigger
                  value="signin"
                  className="rounded-lg data-[state=active]:bg-white data-[state=active]:text-blue-600 data-[state=active]:shadow-sm font-medium transition-all"
                >
                  {t('auth.tabs.signin')}
                </TabsTrigger>
                <TabsTrigger
                  value="signup"
                  className="rounded-lg data-[state=active]:bg-white data-[state=active]:text-orange-600 data-[state=active]:shadow-sm font-medium transition-all"
                >
                  {t('auth.tabs.signup')}
                </TabsTrigger>
              </TabsList>

              {error && (
                <Alert variant="destructive" className="mt-4 mb-6 border-red-200 bg-red-50">
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
                      className="border-gray-200 focus:border-blue-400 focus:ring-blue-400/20"
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
                        className="pr-10 border-gray-200 focus:border-blue-400 focus:ring-blue-400/20"
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
                        className="text-sm text-blue-600 hover:underline font-medium"
                      >
                        {t('auth.forgot_password') || 'Zapomenuté heslo?'}
                      </button>
                    </div>
                  </div>

                  <Button
                    type="submit"
                    className="w-full bg-gradient-to-r from-blue-600 to-blue-500 hover:from-blue-700 hover:to-blue-600 text-white font-bold h-11 shadow-lg shadow-blue-500/20 transition-all hover:-translate-y-0.5"
                    disabled={loading}
                  >
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
                  <div className="pt-6 mt-6 border-t border-gray-100">
                    <div className="flex items-center gap-4 mb-4">
                      <div className="h-px bg-gray-200 flex-1"></div>
                      <div className="text-xs text-gray-400 uppercase tracking-wider font-semibold whitespace-nowrap">
                        Rychlé přihlášení (Demo)
                      </div>
                      <div className="h-px bg-gray-200 flex-1"></div>
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                      <Button
                        type="button"
                        variant="outline"
                        disabled={loading}
                        onClick={() => handleTestLogin('talent')}
                        className="text-xs border-blue-100 text-blue-700 hover:bg-blue-50 hover:border-blue-200 transition-all"
                      >
                        <User className="w-3 h-3 mr-1.5" />
                        {t('auth.test_login.talent')}
                      </Button>
                      <Button
                        type="button"
                        variant="outline"
                        disabled={loading}
                        onClick={() => handleTestLogin('company')}
                        className="text-xs border-orange-100 text-orange-700 hover:bg-orange-50 hover:border-orange-200 transition-all"
                      >
                        <Building2 className="w-3 h-3 mr-1.5" />
                        {t('auth.test_login.company')}
                      </Button>
                      <Button
                        type="button"
                        variant="outline"
                        disabled={loading}
                        onClick={() => handleTestLogin('admin')}
                        className="text-xs border-purple-100 text-purple-700 hover:bg-purple-50 hover:border-purple-200 col-span-2 transition-all"
                      >
                        <Shield className="w-3 h-3 mr-1.5" />
                        Admin Demo
                      </Button>
                    </div>
                  </div>
                </form>
              </TabsContent>

              <TabsContent value="signup">
                <form onSubmit={handleSignUp} className="space-y-4">
                  <div className="space-y-4">
                    <Label className="text-base">{t('auth.labels.select_account_type')}</Label>
                    <div className="grid grid-cols-2 gap-4">
                      {/* Talent Card */}
                      <div
                        onClick={() => setSignUpData({ ...signUpData, role: 'talent' })}
                        className={`relative cursor-pointer rounded-2xl border-2 p-4 transition-all duration-300 group ${signUpData.role === 'talent'
                          ? 'border-blue-500 bg-blue-50/50 shadow-md transform scale-[1.02]'
                          : 'border-gray-100 hover:border-blue-200 hover:bg-white hover:shadow-sm'
                          }`}
                      >
                        <div className="flex flex-col items-center text-center space-y-3">
                          <div className={`w-14 h-14 rounded-full flex items-center justify-center transition-colors ${signUpData.role === 'talent'
                            ? 'bg-gradient-to-br from-blue-600 to-blue-400 shadow-lg shadow-blue-500/30'
                            : 'bg-gray-100 group-hover:bg-blue-50'
                            }`}>
                            <User className={`w-7 h-7 ${signUpData.role === 'talent' ? 'text-white' : 'text-gray-400 group-hover:text-blue-500'
                              }`} />
                          </div>
                          <div>
                            <div className={`font-bold transition-colors ${signUpData.role === 'talent' ? 'text-blue-700' : 'text-gray-600'
                              }`}>
                              {t('auth.roles.talent_title')}
                            </div>
                            <div className="text-xs text-gray-500 mt-1 leading-tight">
                              {t('auth.roles.talent_desc')}
                            </div>
                          </div>
                        </div>
                        {signUpData.role === 'talent' && (
                          <div className="absolute top-2 right-2 w-6 h-6 bg-blue-500 rounded-full flex items-center justify-center shadow-sm">
                            <svg className="w-3.5 h-3.5 text-white" fill="currentColor" viewBox="0 0 20 20">
                              <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                            </svg>
                          </div>
                        )}
                      </div>

                      {/* Company Card */}
                      <div
                        onClick={() => setSignUpData({ ...signUpData, role: 'company' })}
                        className={`relative cursor-pointer rounded-2xl border-2 p-4 transition-all duration-300 group ${signUpData.role === 'company'
                          ? 'border-orange-500 bg-orange-50/50 shadow-md transform scale-[1.02]'
                          : 'border-gray-100 hover:border-orange-200 hover:bg-white hover:shadow-sm'
                          }`}
                      >
                        <div className="flex flex-col items-center text-center space-y-3">
                          <div className={`w-14 h-14 rounded-full flex items-center justify-center transition-colors ${signUpData.role === 'company'
                            ? 'bg-gradient-to-br from-orange-600 to-orange-400 shadow-lg shadow-orange-500/30'
                            : 'bg-gray-100 group-hover:bg-orange-50'
                            }`}>
                            <Building2 className={`w-7 h-7 ${signUpData.role === 'company' ? 'text-white' : 'text-gray-400 group-hover:text-orange-500'
                              }`} />
                          </div>
                          <div>
                            <div className={`font-bold transition-colors ${signUpData.role === 'company' ? 'text-orange-700' : 'text-gray-600'
                              }`}>
                              {t('auth.roles.company_title')}
                            </div>
                            <div className="text-xs text-gray-500 mt-1 leading-tight">
                              {t('auth.roles.company_desc')}
                            </div>
                          </div>
                        </div>
                        {signUpData.role === 'company' && (
                          <div className="absolute top-2 right-2 w-6 h-6 bg-orange-500 rounded-full flex items-center justify-center shadow-sm">
                            <svg className="w-3.5 h-3.5 text-white" fill="currentColor" viewBox="0 0 20 20">
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
                        className="border-gray-200 focus:border-blue-400 focus:ring-blue-400/20"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="lastName">{t('auth.labels.last_name')}</Label>
                      <Input
                        id="lastName"
                        value={signUpData.lastName}
                        onChange={(e) => setSignUpData({ ...signUpData, lastName: e.target.value })}
                        required
                        className="border-gray-200 focus:border-blue-400 focus:ring-blue-400/20"
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
                          className="border-gray-200 focus:border-orange-400 focus:ring-orange-400/20"
                        />
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="ico">{t('auth.labels.ico')}</Label>
                        <Input
                          id="ico"
                          value={signUpData.ico}
                          onChange={(e) => setSignUpData({ ...signUpData, ico: e.target.value })}
                          placeholder="12345678"
                          className="border-gray-200 focus:border-orange-400 focus:ring-orange-400/20"
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
                      className="border-gray-200 focus:border-blue-400 focus:ring-blue-400/20"
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
                        className="pr-10 border-gray-200 focus:border-blue-400 focus:ring-blue-400/20"
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
                        className="pr-10 border-gray-200 focus:border-blue-400 focus:ring-blue-400/20"
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

                  <div className="flex items-center space-x-2 pt-2">
                    <input
                      type="checkbox"
                      id="terms"
                      checked={signUpData.termsAccepted}
                      onChange={(e) => setSignUpData({ ...signUpData, termsAccepted: e.target.checked })}
                      className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500 cursor-pointer"
                      required
                    />
                    <Label htmlFor="terms" className="text-sm font-normal text-gray-600 leading-tight cursor-pointer">
                      Souhlasím s{' '}
                      <button type="button" onClick={() => onNavigate?.('terms')} className="text-blue-600 hover:underline font-medium">
                        obchodními podmínkami
                      </button>
                      {' '}a{' '}
                      <button type="button" onClick={() => onNavigate?.('gdpr')} className="text-blue-600 hover:underline font-medium">
                        zpracováním údajů
                      </button>
                    </Label>
                  </div>

                  <Button
                    type="submit"
                    className="w-full bg-gradient-to-r from-blue-600 to-orange-500 hover:from-blue-700 hover:to-orange-600 text-white font-bold h-12 text-lg shadow-lg shadow-blue-500/20 transition-all hover:-translate-y-0.5 mt-4"
                    disabled={loading}
                  >
                    {loading ? (
                      <>
                        <Loader2 className="mr-2 h-5 w-5 animate-spin" />
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
