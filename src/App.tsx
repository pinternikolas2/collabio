import { useState, useEffect } from 'react';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { AuthForms } from './components/AuthForms';
import { ForgotPassword } from './components/ForgotPassword';
import Header from './components/Header';
import Footer from './components/Footer';
import LandingPage from './components/LandingPage';
import Marketplace from './components/Marketplace';
import TalentsList from './components/TalentsList';
import CompaniesList from './components/CompaniesList';
import EventsList from './components/EventsList';
import Collaborations from './components/Collaborations';
import Finance from './components/Finance';
import Contracts from './components/Contracts';
import Chat from './components/Chat';
import VideoCall from './components/VideoCall';
import ScheduleMeeting from './components/ScheduleMeeting';
import Meetings from './components/Meetings';
import AdminDashboard from './components/AdminDashboard';
import Notifications from './components/Notifications';
import TalentProfile from './components/TalentProfile';
import CompanyProfile from './components/CompanyProfile';
import Settings from './components/Settings';
import CreateProject from './components/CreateProject';
import EditProject from './components/EditProject';
import ProjectDetail from './components/ProjectDetail';
import CookieConsent from './components/CookieConsent';
import KYCVerification from './components/KYCVerification';
import NotFound from './components/NotFound';
import { AboutPage, ContactPage, FAQPage, TermsPage, GDPRPage, CookiesPage } from './components/InfoPages';
import AdminCleanup from './components/AdminCleanup'; // New import
import DebugDB from './components/DebugDB';
import { Toaster } from './components/ui/sonner';
import { toast } from 'sonner';
import { Button } from './components/ui/button';
import { Shield, Loader2 } from 'lucide-react';
import AIAssistant from './components/AIAssistant';
import CollaborationReport from './components/CollaborationReport';
import TalentAnalytics from './components/TalentAnalytics';
import CompanyAnalytics from './components/CompanyAnalytics';
import DocumentationPage from './components/DocumentationPage';
import SEO from './components/SEO';
import CheckoutPage from './components/CheckoutPage';
import CollaborationSetup from './components/CollaborationSetup';
import { userApi } from './utils/api';

function AppContent() {
  const { user, loading: authLoading, sendVerification } = useAuth();
  // Routing Helper
  const getInitialState = () => {
    const params = new URLSearchParams(window.location.search);
    const page = params.get('page') || 'landing';
    const data: any = {};
    params.forEach((value, key) => {
      if (key !== 'page') data[key] = value;
    });
    return { page, data: Object.keys(data).length > 0 ? data : null };
  };

  const initialState = getInitialState();
  const [currentPage, setCurrentPage] = useState(initialState.page);
  const [pageData, setPageData] = useState<any>(initialState.data);

  // Notifications count
  const [unreadNotifications, setUnreadNotifications] = useState(0);

  useEffect(() => {
    if (user?.id) {
      const unsubscribe = userApi.subscribeToNotifications(user.id, (notifications) => {
        setUnreadNotifications(notifications.filter(n => !n.read).length);
      });
      return () => unsubscribe();
    } else {
      setUnreadNotifications(0);
    }
  }, [user?.id]);

  // PWA & Connectivity
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [installPrompt, setInstallPrompt] = useState<any>(null);

  useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  useEffect(() => {
    const handleBeforeInstallPrompt = (e: any) => {
      e.preventDefault();
      setInstallPrompt(e);
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    };
  }, []);

  // Handle Back Button
  useEffect(() => {
    const handlePopState = () => {
      const { page, data } = getInitialState();
      setCurrentPage(page);
      setPageData(data);
    };

    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, []);

  const handleInstallPWA = async () => {
    if (!installPrompt) return;

    installPrompt.prompt();
    const { outcome } = await installPrompt.userChoice;

    if (outcome === 'accepted') {
      setInstallPrompt(null);
    }
  };

  const handleNavigate = (page: string, data?: any) => {
    setCurrentPage(page);
    setPageData(data || null);
    window.scrollTo(0, 0);

    // Update URL
    const url = new URL(window.location.href);
    url.searchParams.set('page', page);

    // Clear old data params ensuring we keep only what's new or nothing
    // Simple approach: clear all params except 'page' and re-add new data
    const keysToRemove: string[] = [];
    url.searchParams.forEach((_, key) => {
      if (key !== 'page') keysToRemove.push(key);
    });
    keysToRemove.forEach(key => url.searchParams.delete(key));

    if (data) {
      Object.entries(data).forEach(([key, value]) => {
        if (value && typeof value === 'string') {
          url.searchParams.set(key, value);
        }
      });
    }

    window.history.pushState({}, '', url);
  };

  // Redirect to login if not authenticated and trying to access protected pages
  useEffect(() => {
    const protectedPages = [
      'collaborations', 'finance', 'my-profile',
      'chat', 'video-call', 'schedule-meeting', 'contracts', 'meetings',
      'admin', 'notifications', 'settings', 'create-project', 'edit-project', 'kyc-verification',
      'talent-analytics', 'company-analytics', 'project-detail', 'admin-cleanup'
    ];

    if (!authLoading && !user && protectedPages.includes(currentPage)) {
      handleNavigate('login');
    }
  }, [currentPage, user, authLoading]);

  // Redirect to appropriate dashboard after login/registration
  useEffect(() => {
    if (!authLoading && user && (currentPage === 'login' || currentPage === 'register')) {
      // Redirect based on user role
      if (user.role === 'admin') {
        handleNavigate('admin');
      } else if (user.role === 'company') {
        handleNavigate('leads');
      } else if (user.role === 'talent') {
        handleNavigate('leads');
      } else {
        handleNavigate('landing');
      }
    }
  }, [user, authLoading, currentPage]);

  const renderPage = () => {
    // Show auth forms if on login/register page
    if (currentPage === 'login') {
      return <AuthForms onNavigate={handleNavigate} defaultTab="signin" />;
    }

    if (currentPage === 'register') {
      return <AuthForms onNavigate={handleNavigate} defaultTab="signup" />;
    }

    if (currentPage === 'forgot-password') {
      return <ForgotPassword onNavigate={handleNavigate} />;
    }

    // Loading state
    if (authLoading) {
      return (
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-orange-50">
          <div className="flex items-center justify-center mx-auto mb-6">
            <Loader2 className="w-16 h-16 text-blue-600 animate-spin" />
          </div>
        </div>
      );
    }

    const isLoggedIn = !!user;
    const userId = user?.id || null;
    const userRole = user?.role || null;

    switch (currentPage) {
      case 'landing':
        return <LandingPage onNavigate={handleNavigate} isLoggedIn={isLoggedIn} />;

      case 'leads':
        return (
          <Marketplace
            onNavigate={handleNavigate}
            isLoggedIn={isLoggedIn}
            userRole={userRole}
            initialMode="leads"
          />
        );

      case 'packages':
        return (
          <Marketplace
            onNavigate={handleNavigate}
            isLoggedIn={isLoggedIn}
            userRole={userRole}
            initialMode="packages"
          />
        );

      case 'marketplace':
        return (
          <Marketplace
            onNavigate={handleNavigate}
            isLoggedIn={isLoggedIn}
            userRole={userRole}
            initialMode="all"
          />
        );

      case 'collaborations':
        return isLoggedIn && userId ? (
          <Collaborations userId={userId} onNavigate={handleNavigate} />
        ) : (
          <LandingPage onNavigate={handleNavigate} isLoggedIn={false} />
        );

      case 'talents':
        // Show talents list in preview mode for non-logged users
        return (
          <TalentsList
            onNavigate={handleNavigate}
            isLoggedIn={isLoggedIn}
            currentUserRole={userRole}
          />
        );

      case 'companies':
        // Show companies list in preview mode for non-logged users
        return (
          <CompaniesList
            onNavigate={handleNavigate}
            isLoggedIn={isLoggedIn}
            currentUserRole={userRole}
          />
        );

      case 'events':
        return (
          <EventsList onNavigate={handleNavigate} />
        );

      case 'finance':
        return isLoggedIn && userId && userRole && userRole !== 'admin' ? (
          <Finance onNavigate={handleNavigate} userId={userId} userRole={userRole} />
        ) : (
          <LandingPage onNavigate={handleNavigate} isLoggedIn={false} />
        );

      case 'chat':
        return isLoggedIn && userId ? (
          <Chat userId={userId} onNavigate={handleNavigate} />
        ) : (
          <LandingPage onNavigate={handleNavigate} isLoggedIn={false} />
        );

      case 'admin':
        return isLoggedIn && userRole === 'admin' ? (
          <AdminDashboard onNavigate={handleNavigate} />
        ) : (
          <LandingPage onNavigate={handleNavigate} isLoggedIn={false} />
        );

      case 'notifications':
        return isLoggedIn && userId ? (
          <Notifications onNavigate={handleNavigate} userId={userId} />
        ) : (
          <LandingPage onNavigate={handleNavigate} isLoggedIn={false} />
        );

      case 'my-profile':
        // Redirect to user's own profile based on role
        if (isLoggedIn && userId && userRole) {
          if (userRole === 'talent') {
            return (
              <TalentProfile
                onNavigate={handleNavigate}
                userId={userId}
                isOwnProfile={true}
                currentUserRole={userRole}
              />
            );
          } else if (userRole === 'company') {
            return (
              <CompanyProfile
                onNavigate={handleNavigate}
                userId={userId}
                isOwnProfile={true}
                currentUserRole={userRole}
              />
            );
          } else {
            // Admin goes to settings
            return <Settings onNavigate={handleNavigate} userId={userId} />;
          }
        }
        return <LandingPage onNavigate={handleNavigate} isLoggedIn={false} />;

      case 'talent-profile':
        return pageData?.userId ? (
          <TalentProfile
            onNavigate={handleNavigate}
            userId={pageData.userId}
            isOwnProfile={pageData.userId === userId}
            currentUserRole={userRole}
          />
        ) : (
          <LandingPage onNavigate={handleNavigate} isLoggedIn={isLoggedIn} />
        );

      case 'company-profile':
        return pageData?.userId ? (
          <CompanyProfile
            onNavigate={handleNavigate}
            userId={pageData.userId}
            isOwnProfile={pageData.userId === userId}
            currentUserRole={userRole}
          />
        ) : (
          <LandingPage onNavigate={handleNavigate} isLoggedIn={isLoggedIn} />
        );

      case 'settings':
        return isLoggedIn && userId ? (
          <Settings onNavigate={handleNavigate} userId={userId} />
        ) : (
          <LandingPage onNavigate={handleNavigate} isLoggedIn={false} />
        );

      case 'create-project':
        return isLoggedIn && userId && userRole && (userRole === 'company' || userRole === 'talent') ? (
          <CreateProject
            userId={userId}
            onNavigate={handleNavigate}
            userRole={userRole as 'talent' | 'company'}
            targetUserId={pageData?.targetUserId}
            targetUserName={pageData?.targetUserName}
          />
        ) : (
          <LandingPage onNavigate={handleNavigate} isLoggedIn={false} />
        );

      case 'kyc-verification':
        return isLoggedIn && userId && userRole ? (
          <KYCVerification userId={userId} userRole={userRole} onNavigate={handleNavigate} />
        ) : (
          <LandingPage onNavigate={handleNavigate} isLoggedIn={false} />
        );

      case 'about':
        return <AboutPage onNavigate={handleNavigate} />;

      case 'contact':
        return <ContactPage onNavigate={handleNavigate} />;

      case 'faq':
        return <FAQPage onNavigate={handleNavigate} />;

      case 'terms':
        return <TermsPage onNavigate={handleNavigate} />;

      case 'gdpr':
        return <GDPRPage onNavigate={handleNavigate} />;

      case 'cookies':
        return <CookiesPage onNavigate={handleNavigate} />;

      case 'collaboration-report':
        return isLoggedIn && userId && pageData?.collaborationId ? (
          <CollaborationReport
            collaborationId={pageData.collaborationId}
            userId={userId}
            onNavigate={handleNavigate}
          />
        ) : (
          <LandingPage onNavigate={handleNavigate} isLoggedIn={false} />
        );

      case 'talent-analytics':
        return isLoggedIn && userId && userRole === 'talent' ? (
          <TalentAnalytics
            userId={userId}
            onNavigate={handleNavigate}
          />
        ) : (
          <LandingPage onNavigate={handleNavigate} isLoggedIn={false} />
        );

      case 'company-analytics':
        return isLoggedIn && userId && userRole === 'company' ? (
          <CompanyAnalytics
            userId={userId}
            onNavigate={handleNavigate}
          />
        ) : (
          <LandingPage onNavigate={handleNavigate} isLoggedIn={false} />
        );

      case 'documentation':
        return <DocumentationPage onNavigate={handleNavigate} />;

      case 'chat-with-user':
        return isLoggedIn && userId && userRole && pageData?.targetUserId && pageData?.targetUserName ? (
          <Chat
            userId={userId}
            userRole={userRole}
            targetUserId={pageData.targetUserId}
            targetUserName={pageData.targetUserName}
            onNavigate={handleNavigate}
          />
        ) : (
          <LandingPage onNavigate={handleNavigate} isLoggedIn={false} />
        );

      case 'project-detail':
        return pageData?.projectId ? (
          <ProjectDetail
            onNavigate={handleNavigate}
            projectId={pageData.projectId}
            userId={userId || undefined}
            userRole={userRole || undefined}
          />
        ) : (
          <LandingPage onNavigate={handleNavigate} isLoggedIn={isLoggedIn} />
        );

      case 'edit-project':
        return isLoggedIn && pageData?.projectId ? (
          <EditProject
            onNavigate={handleNavigate}
            projectId={pageData.projectId}
          />
        ) : (
          <LandingPage onNavigate={handleNavigate} isLoggedIn={false} />
        );

      case 'video-call':
        return isLoggedIn && pageData?.targetUserId && pageData?.targetUserName ? (
          <VideoCall
            targetUserId={pageData.targetUserId}
            targetUserName={pageData.targetUserName}
            onNavigate={handleNavigate}
          />
        ) : (
          <LandingPage onNavigate={handleNavigate} isLoggedIn={false} />
        );

      case 'schedule-meeting':
        return isLoggedIn && pageData?.targetUserId && pageData?.targetUserName ? (
          <ScheduleMeeting
            targetUserId={pageData.targetUserId}
            targetUserName={pageData.targetUserName}
            onNavigate={handleNavigate}
          />
        ) : (
          <LandingPage onNavigate={handleNavigate} isLoggedIn={false} />
        );

      case 'contracts':
        return isLoggedIn && userId ? (
          <Contracts userId={userId} onNavigate={handleNavigate} />
        ) : (
          <LandingPage onNavigate={handleNavigate} isLoggedIn={false} />
        );

      case 'meetings':
        return isLoggedIn && userId ? (
          <Meetings userId={userId} onNavigate={handleNavigate} />
        ) : (
          <LandingPage onNavigate={handleNavigate} isLoggedIn={false} />
        );

      case 'checkout':
        return isLoggedIn && userId && pageData?.projectId ? (
          <CheckoutPage
            projectId={pageData.projectId}
            onNavigate={handleNavigate}
          />
        ) : (
          <LandingPage onNavigate={handleNavigate} isLoggedIn={false} />
        );

      case 'collaboration-setup':
        return isLoggedIn && userId && pageData?.collaborationId && pageData?.projectId ? (
          <CollaborationSetup
            collaborationId={pageData.collaborationId}
            projectId={pageData.projectId}
            onNavigate={handleNavigate}
          />
        ) : (
          <LandingPage onNavigate={handleNavigate} isLoggedIn={false} />
        );

      case 'privacy':
        return <GDPRPage onNavigate={handleNavigate} />;
      case 'admin-cleanup': // New route
        return <AdminCleanup />;
      case 'debug':
        return <DebugDB />;
      case 'not-found':
        return <NotFound onNavigate={handleNavigate} />;

      default:
        // Fallback to landing page, or could fallback to NotFound if desired
        return <LandingPage onNavigate={handleNavigate} isLoggedIn={isLoggedIn} />;
    }
  };

  const showHeader = currentPage !== 'login' && currentPage !== 'register' && currentPage !== 'not-found';
  const showFooter = currentPage !== 'login' && currentPage !== 'register' && currentPage !== 'video-call' && currentPage !== 'not-found';

  return (
    <div className="min-h-screen flex flex-col">
      <SEO />

      {/* Email Verification Banner */}
      {user && !user.emailVerified && (
        <div className="bg-orange-50 border-b border-orange-100 p-3 text-center text-sm text-orange-800 flex items-center justify-center gap-2">
          <span>Váš email zatím není ověřen. Některé funkce mohou být omezeny.</span>
          <Button
            variant="link"
            size="sm"
            onClick={() => {
              sendVerification();
              toast.success('Ověřovací email byl odeslán');
            }}
            className="text-orange-900 underline h-auto p-0 font-semibold"
          >
            Odeslat ověřovací email znovu
          </Button>
        </div>
      )}


      {showHeader && (
        <Header
          onNavigate={handleNavigate}
          isLoggedIn={!!user}
          userRole={user?.role || null}
          userName={user ? `${user.firstName} ${user.lastName}` : ''}
          unreadNotifications={unreadNotifications}
        />
      )}

      <main className="flex-1">
        {renderPage()}
      </main>

      {showFooter && <Footer onNavigate={handleNavigate} />}

      {/* Offline indicator */}
      {!isOnline && (
        <div className="fixed bottom-4 left-4 bg-red-500 text-white px-4 py-2 rounded-lg shadow-lg flex items-center gap-2 z-50">
          <Shield className="w-4 h-4" />
          <span>Offline režim</span>
        </div>
      )}

      {/* PWA Install prompt */}
      {installPrompt && (
        <div className="fixed bottom-4 right-4 bg-white rounded-lg shadow-2xl p-4 max-w-sm z-50 border-2 border-blue-200">
          <h3 className="font-semibold mb-2">Nainstalovat Collabio?</h3>
          <p className="text-sm text-gray-600 mb-4">
            Přidejte si aplikaci na plochu pro rychlý přístup a offline režim.
          </p>
          <div className="flex gap-2">
            <Button onClick={handleInstallPWA} size="sm" className="flex-1">
              Nainstalovat
            </Button>
            <Button onClick={() => setInstallPrompt(null)} variant="outline" size="sm">
              Možná později
            </Button>
          </div>
        </div>
      )}

      <CookieConsent onNavigate={handleNavigate} />
      <AIAssistant
        userId={user?.id || null}
        userRole={user?.role || null}
        onNavigate={handleNavigate}
      />
      <Toaster />
    </div>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
}
