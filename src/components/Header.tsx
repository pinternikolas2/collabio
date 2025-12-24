import { useState } from 'react';
import { Menu, X, Bell, User, LogOut, Settings, MessageSquare, Briefcase, DollarSign, LayoutDashboard, Calendar, FileText } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { useAuth } from '../contexts/AuthContext';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from './ui/dropdown-menu';

type HeaderProps = {
  onNavigate: (page: string) => void;
  isLoggedIn: boolean;
  userRole: 'talent' | 'company' | 'admin' | null;
  userName: string;
  unreadNotifications?: number;
};

export default function Header({ onNavigate, isLoggedIn, userRole, userName, unreadNotifications = 0 }: HeaderProps) {
  const { signOut, user } = useAuth();
  const { t } = useTranslation();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  // Navigate to user's own profile
  const navigateToMyProfile = () => {
    onNavigate('my-profile');
  };

  const navItems = [
    { name: t('navigation.home'), page: 'landing', showWhen: 'always' },
    { name: t('navigation.marketplace'), page: 'marketplace', showWhen: 'always' },
    { name: t('navigation.events'), page: 'events', showWhen: 'always' },
    { name: t('navigation.talents'), page: 'talents', showWhen: 'always' },
    { name: t('navigation.companies'), page: 'companies', showWhen: 'always' },
    { name: t('navigation.collaborations'), page: 'collaborations', showWhen: 'loggedIn' },
    { name: t('navigation.admin'), page: 'admin', showWhen: 'admin' },
  ];

  const filteredNavItems = navItems.filter((item) => {
    if (item.showWhen === 'always') return true;
    if (item.showWhen === 'loggedIn') return isLoggedIn;
    if (item.showWhen === 'admin') return userRole === 'admin';
    return true;
  });

  const handleLogout = async () => {
    try {
      await signOut();
      onNavigate('landing');
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-white/95 backdrop-blur supports-[backdrop-filter]:bg-white/80">
      <div className="container mx-auto px-4 max-w-screen-2xl">
        <div className="flex h-16 items-center justify-between relative">
          {/* Logo */}
          <button
            onClick={() => onNavigate('landing')}
            className="flex items-center gap-2 hover:opacity-80 transition-opacity flex-shrink-0 z-10"
          >
            <div className="flex-shrink-0">
              <img src="/logo.jpg" alt="Collabio Logo" className="w-10 h-10 rounded-xl" />
            </div>
            {/* Tekst odstraněn na žádost uživatele */}
          </button>

          {/* Desktop Navigation - Absolutely centered */}
          <nav className="hidden md:flex items-center gap-6 lg:gap-8 xl:gap-10 absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2">
            {filteredNavItems.map((item) => (
              <button
                key={item.page}
                onClick={() => onNavigate(item.page)}
                className="transition-colors hover:text-blue-600 whitespace-nowrap text-sm lg:text-base text-gray-700"
              >
                {item.name}
              </button>
            ))}
          </nav>

          {/* Desktop Actions */}
          <div className="hidden md:flex items-center gap-2 flex-shrink-0 z-10">
            {isLoggedIn ? (
              <>
                <Button
                  variant="ghost"
                  size="icon"
                  className="relative"
                  onClick={() => onNavigate('notifications')}
                >
                  <Bell className="h-5 w-5" />
                  {unreadNotifications > 0 && (
                    <Badge className="absolute -top-1 -right-1 h-5 w-5 flex items-center justify-center p-0 bg-orange-500">
                      {unreadNotifications}
                    </Badge>
                  )}
                </Button>

                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="icon">
                      <User className="h-5 w-5" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="w-48">
                    <DropdownMenuLabel>{t('navigation.my_account')}</DropdownMenuLabel>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem onClick={navigateToMyProfile}>
                      <User className="mr-2 h-4 w-4" />
                      {t('navigation.my_profile')}
                    </DropdownMenuItem>
                    {userRole !== 'admin' && (
                      <>
                        <DropdownMenuItem onClick={() => onNavigate('collaborations')}>
                          <Briefcase className="mr-2 h-4 w-4" />
                          {t('navigation.collaborations')}
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => onNavigate('chat')}>
                          <MessageSquare className="mr-2 h-4 w-4" />
                          {t('navigation.messages')}
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => onNavigate('meetings')}>
                          <Calendar className="mr-2 h-4 w-4" />
                          {t('navigation.calls')}
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => onNavigate('finance')}>
                          <DollarSign className="mr-2 h-4 w-4" />
                          {t('navigation.finance')}
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => onNavigate('contracts')}>
                          <FileText className="mr-2 h-4 w-4" />
                          {t('navigation.contracts')}
                        </DropdownMenuItem>
                      </>
                    )}
                    {userRole === 'admin' && (
                      <DropdownMenuItem onClick={() => onNavigate('admin')}>
                        <LayoutDashboard className="mr-2 h-4 w-4" />
                        Admin Dashboard
                      </DropdownMenuItem>
                    )}
                    <DropdownMenuItem onClick={() => onNavigate('settings')}>
                      <Settings className="mr-2 h-4 w-4" />
                      {t('navigation.settings')}
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem onClick={handleLogout}>
                      <LogOut className="mr-2 h-4 w-4" />
                      {t('navigation.logout')}
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </>
            ) : (
              <>
                <Button variant="ghost" onClick={() => onNavigate('login')}>
                  {t('navigation.login')}
                </Button>
                <Button
                  className="bg-gradient-to-r from-blue-600 to-orange-500 text-white hover:from-blue-700 hover:to-orange-600"
                  onClick={() => onNavigate('register')}
                >
                  {t('navigation.register')}
                </Button>
              </>
            )}
          </div>

          {/* Mobile Menu Button */}
          <button
            className="md:hidden p-2"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          >
            {mobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
          </button>
        </div>

        {/* Mobile Menu */}
        {mobileMenuOpen && (
          <div className="md:hidden py-2 border-t">
            <nav className="flex flex-col gap-1">
              {filteredNavItems.map((item) => (
                <button
                  key={item.page}
                  onClick={() => {
                    onNavigate(item.page);
                    setMobileMenuOpen(false);
                  }}
                  className="px-4 py-1.5 text-left rounded-lg transition-colors text-sm text-gray-700 hover:bg-gray-50"
                >
                  {item.name}
                </button>
              ))}

              {/* Logged in users - Můj profil hned na začátku */}
              {isLoggedIn && (
                <>
                  <div className="my-1 border-t"></div>
                  <button
                    onClick={() => {
                      navigateToMyProfile();
                      setMobileMenuOpen(false);
                    }}
                    className="px-4 py-1.5 text-left rounded-lg text-gray-700 hover:bg-gray-50 flex items-center gap-2 text-sm"
                  >
                    <User className="h-4 w-4" />
                    {t('navigation.my_profile')}
                  </button>
                  <button
                    onClick={() => {
                      onNavigate('notifications');
                      setMobileMenuOpen(false);
                    }}
                    className="px-4 py-1.5 text-left rounded-lg text-gray-700 hover:bg-gray-50 flex items-center gap-2 text-sm"
                  >
                    <Bell className="h-4 w-4" />
                    {t('settings.notifications')}
                    {unreadNotifications > 0 && (
                      <Badge className="ml-auto h-5 w-5 flex items-center justify-center p-0 bg-orange-500 text-xs">
                        {unreadNotifications}
                      </Badge>
                    )}
                  </button>
                </>
              )}

              {/* Logged in users - additional options (Zprávy, Finance, Hovory) */}
              {userRole && userRole !== 'admin' && (
                <>
                  <button
                    onClick={() => {
                      onNavigate('chat');
                      setMobileMenuOpen(false);
                    }}
                    className="px-4 py-1.5 text-left rounded-lg text-gray-700 hover:bg-gray-50 flex items-center gap-2 text-sm"
                  >
                    <MessageSquare className="h-4 w-4" />
                    {t('navigation.messages')}
                  </button>
                  <button
                    onClick={() => {
                      onNavigate('finance');
                      setMobileMenuOpen(false);
                    }}
                    className="px-4 py-1.5 text-left rounded-lg text-gray-700 hover:bg-gray-50 flex items-center gap-2 text-sm"
                  >
                    <DollarSign className="h-4 w-4" />
                    {t('navigation.finance')}
                  </button>
                  <button
                    onClick={() => {
                      onNavigate('meetings');
                      setMobileMenuOpen(false);
                    }}
                    className="px-4 py-1.5 text-left rounded-lg text-gray-700 hover:bg-gray-50 flex items-center gap-2 text-sm"
                  >
                    <Calendar className="h-4 w-4" />
                    {t('navigation.calls')}
                  </button>
                </>
              )}

              {userRole && (
                <>
                  <button
                    onClick={() => {
                      onNavigate('settings');
                      setMobileMenuOpen(false);
                    }}
                    className="px-4 py-1.5 text-left rounded-lg text-gray-700 hover:bg-gray-50 flex items-center gap-2 text-sm"
                  >
                    <Settings className="h-4 w-4" />
                    {t('navigation.settings')}
                  </button>
                  <div className="my-1 border-t"></div>
                  <button
                    onClick={() => {
                      handleLogout();
                      setMobileMenuOpen(false);
                    }}
                    className="px-4 py-1.5 text-left rounded-lg text-red-600 hover:bg-red-50 flex items-center gap-2 text-sm"
                  >
                    <LogOut className="h-4 w-4" />
                    {t('navigation.logout')}
                  </button>
                </>
              )}

              {/* Not logged in users */}
              {!userRole && (
                <>
                  <div className="my-1 border-t"></div>
                  <button
                    onClick={() => {
                      onNavigate('login');
                      setMobileMenuOpen(false);
                    }}
                    className="px-4 py-1.5 text-left rounded-lg text-gray-700 hover:bg-gray-50 text-sm"
                  >
                    {t('navigation.login')}
                  </button>
                  <button
                    onClick={() => {
                      onNavigate('register');
                      setMobileMenuOpen(false);
                    }}
                    className="px-4 py-1.5 text-left rounded-lg bg-gradient-to-r from-blue-600 to-orange-500 text-white text-sm"
                  >
                    {t('navigation.register')}
                  </button>
                </>
              )}
            </nav>
          </div>
        )}
      </div>
    </header>
  );
}
