import React from 'react';
import { Link, useLocation, useNavigate, Outlet } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import kolxd from '../kolxd.png';
import { 
  LayoutDashboard, 
  Search, 
  Users, 
  TrendingUp, 
  Shield, 
  Trophy, 
  LogOut, 
  Menu,
  X,
  Sparkles,
  Check,
  Gamepad2,
  ArrowUpRight,
  ArrowDownRight,
  Activity,
  DollarSign
} from 'lucide-react';
import { classNames } from '../utils/classNames';
import { authService } from '../services/authService';

interface LayoutProps {
  children?: React.ReactNode;
}

export default function Layout({ children }: LayoutProps) {
  const location = useLocation();
  const navigate = useNavigate();
  const { user, logout, isAuthenticated } = useAuth();
  const [sidebarOpen, setSidebarOpen] = React.useState(false);
  const [upgradeModalOpen, setUpgradeModalOpen] = React.useState(false);
  const [isUpgrading, setIsUpgrading] = React.useState(false);

  const navigation = [
    { name: 'Dashboard', href: '/dashboard', icon: LayoutDashboard },
    { name: 'Channel Scanner', href: '/channel-scanner', icon: Search },
    { name: 'KOL Analyzer', href: '/kol-analyzer', icon: Users },
    { name: 'Volume Tracker', href: '/volume-tracker', icon: TrendingUp },
    { name: 'Bot Detector', href: '/bot-detector', icon: Shield },
    { name: 'Games', href: '/games', icon: Gamepad2 },
    { name: 'Leaderboard', href: '/leaderboard', icon: Trophy },
  ];

  const plans = [
    {
      name: 'Starter',
      price: '$49',
      features: [
        'Basic KOL Analysis',
        'Standard Volume Tracking',
        'Basic Bot Detection',
        'Email Support',
        'Limited API Access',
        'Community Access'
      ]
    },
    {
      name: 'Pro',
      price: '$99',
      features: [
        'Unlimited KOL Analysis',
        'Real-time Volume Tracking',
        'Advanced Bot Detection',
        'Priority Support',
        'Full API Access',
        'Premium Features'
      ]
    },
    {
      name: 'Enterprise',
      price: '$299',
      features: [
        'Everything in Pro',
        'Custom Integrations',
        'Dedicated Account Manager',
        'SLA Support',
        'White Label Options',
        'Advanced Analytics'
      ]
    },
    {
      name: 'Custom',
      price: 'Contact Us',
      features: [
        'Everything in Enterprise',
        'Custom Development',
        'On-premise Deployment',
        '24/7 Support',
        'Custom SLA Terms',
        'Unlimited Scale'
      ]
    }
  ];

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  const handleUpgradeClick = () => {
    setSidebarOpen(false);
    setUpgradeModalOpen(true);
  };

  const handleUpgrade = async (planName: string) => {
    try {
      setIsUpgrading(true);
      await authService.updateProfile({ plan: planName.toLowerCase() as 'free' | 'pro' });
      setUpgradeModalOpen(false);
      window.location.reload(); // Refresh to update UI with new plan
    } catch (error) {
      console.error('Failed to upgrade plan:', error);
    } finally {
      setIsUpgrading(false);
    }
  };

  const UpgradeModal = () => (
    <div className={`fixed inset-0 z-[100] overflow-y-auto ${upgradeModalOpen ? 'block' : 'hidden'}`}>
      <div className="flex min-h-screen items-center justify-center px-4">
        <div className="fixed inset-0 bg-gray-500/80 backdrop-blur-[2px] transition-opacity" onClick={() => setUpgradeModalOpen(false)} />
        <div className="relative transform overflow-hidden rounded-2xl bg-white px-4 pb-4 pt-5 shadow-xl transition-all sm:my-8 sm:w-full sm:max-w-6xl sm:p-6">
          <div className="absolute right-0 top-0 pr-4 pt-4">
            <button
              type="button"
              className="rounded-md bg-white text-gray-400 hover:text-gray-500"
              onClick={() => setUpgradeModalOpen(false)}
            >
              <X size={24} />
            </button>
          </div>
          <div className="text-center mb-8">
            <Sparkles className="mx-auto h-12 w-12 text-[#09a7ec]" />
            <h3 className="mt-4 text-2xl font-bold text-gray-900">Upgrade your plan</h3>
            <p className="mt-2 text-gray-500">Choose the perfect plan for your needs</p>
          </div>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {plans.map((plan) => (
              <div key={plan.name} className="rounded-2xl border-2 border-gray-200 p-6 hover:border-[#09a7ec] transition-all duration-200">
                <h4 className="text-xl font-semibold text-gray-900">{plan.name}</h4>
                <p className="mt-2 text-3xl font-bold text-[#09a7ec]">{plan.price}<span className="text-base font-normal text-gray-500">{plan.price !== 'Contact Us' ? '/month' : ''}</span></p>
                <div className="h-[280px]">
                  <ul className="mt-6 space-y-3">
                    {plan.features.map((feature) => (
                      <li key={feature} className="flex items-center gap-x-2">
                        <Check size={16} className="text-[#09a7ec] shrink-0" />
                        <span className="text-gray-600">{feature}</span>
                      </li>
                    ))}
                  </ul>
                </div>
                <button
                  className="w-full rounded-xl bg-[#09a7ec] px-4 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-[#09a7ec]/90 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#09a7ec] h-10 flex items-center justify-center disabled:opacity-50 disabled:cursor-not-allowed"
                  onClick={() => {
                    if (plan.name === 'Custom') {
                      window.location.href = 'mailto:sales@kolnexus.com?subject=Custom Plan Inquiry';
                    } else {
                      handleUpgrade(plan.name);
                    }
                  }}
                  disabled={isUpgrading}
                >
                  {isUpgrading ? (
                    <div className="flex items-center gap-2">
                      <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent" />
                      <span>Upgrading...</span>
                    </div>
                  ) : (
                    plan.name === 'Custom' ? 'Contact Sales' : `Upgrade to ${plan.name}`
                  )}
                </button>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50">
      <UpgradeModal />
      {/* Mobile sidebar */}
      <div className={`fixed inset-0 z-40 lg:hidden ${sidebarOpen ? 'block' : 'hidden'}`}>
        <div className="fixed inset-0 bg-gray-600/75 backdrop-blur-sm" onClick={() => setSidebarOpen(false)} />
        <div className="fixed inset-y-0 left-0 flex w-72 flex-col">
          <div className="flex grow flex-col overflow-y-auto bg-gradient-to-b from-white via-white to-slate-50 shadow-2xl border-r border-slate-200/50 backdrop-blur-xl">
            {/* Mobile Header */}
            <div className="flex h-20 items-center justify-between px-6 bg-gradient-to-r from-[#09a7ec]/5 to-blue-50 border-b border-slate-200/50">
              <div className="flex items-center gap-x-3">
                <div className="relative">
                  <img src={kolxd} alt="KOL Nexus Logo" className="h-12 w-12 rounded-xl shadow-lg" />
                  <div className="absolute -top-1 -right-1 w-4 h-4 bg-gradient-to-r from-[#09a7ec] to-blue-500 rounded-full animate-pulse"></div>
                </div>
                <div>
                  <h1 className="text-lg font-bold bg-gradient-to-r from-[#09a7ec] to-blue-600 bg-clip-text text-transparent">
                    KOL Nexus
                  </h1>
                  <p className="text-xs text-slate-500 font-medium">Analytics Platform</p>
                </div>
              </div>
              <button
                onClick={() => setSidebarOpen(false)}
                className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-lg transition-all duration-200"
              >
                <X size={20} />
              </button>
            </div>

            {/* Mobile Navigation */}
            <nav className="flex-1 px-4 py-6 space-y-2">
              {navigation.map((item, index) => (
                <Link
                  key={item.name}
                  to={item.href}
                  className={classNames(
                    location.pathname === item.href
                      ? 'bg-gradient-to-r from-[#09a7ec] to-blue-500 text-white shadow-lg shadow-blue-500/25 scale-[1.02]'
                      : 'text-slate-700 hover:bg-gradient-to-r hover:from-[#09a7ec]/10 hover:to-blue-50 hover:text-[#09a7ec] hover:shadow-md hover:scale-[1.01]',
                    'group flex items-center gap-x-3 rounded-xl p-4 text-sm font-medium transition-all duration-300 transform'
                  )}
                  style={{ 
                    animationDelay: `${index * 50}ms`,
                    animation: sidebarOpen ? 'slideInLeft 0.3s ease-out forwards' : 'none'
                  }}
                >
                  <div className={classNames(
                    location.pathname === item.href
                      ? 'bg-white/20 backdrop-blur-sm'
                      : 'bg-slate-100 group-hover:bg-[#09a7ec]/10',
                    'p-2 rounded-lg transition-all duration-300'
                  )}>
                    <item.icon
                      className={classNames(
                        location.pathname === item.href
                          ? 'text-white'
                          : 'text-slate-500 group-hover:text-[#09a7ec]',
                        'h-5 w-5 transition-all duration-300'
                      )}
                    />
                  </div>
                  <span className="font-semibold">{item.name}</span>
                </Link>
              ))}
            </nav>

            {/* Mobile User Section */}
            <div className="mt-auto border-t border-slate-200/50 bg-gradient-to-r from-slate-50 to-white">
              <div className="p-4">
                {isAuthenticated ? (
                  <>
                    <div className="flex items-center space-x-3 p-3 bg-gradient-to-r from-[#09a7ec]/5 to-blue-50 rounded-xl border border-slate-200/50">
                      <div className="relative">
                        <div className="w-12 h-12 bg-gradient-to-r from-[#09a7ec] to-blue-500 rounded-xl flex items-center justify-center text-white text-lg font-bold shadow-lg">
                          {user?.email?.charAt(0).toUpperCase()}
                        </div>
                        <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-green-500 rounded-full border-2 border-white"></div>
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-semibold text-slate-900 truncate">
                          {user?.email}
                        </p>
                        <p className="text-xs text-slate-500 truncate flex items-center gap-1">
                          <span className={classNames(
                            user?.plan === 'free' ? 'text-amber-600' : 'text-emerald-600',
                            'font-medium'
                          )}>
                            {user?.plan === 'free' ? '🆓 Free Plan' : '⭐ Pro Plan'}
                          </span>
                        </p>
                      </div>
                      {user?.plan === 'free' && (
                        <button
                          onClick={handleUpgradeClick}
                          className="px-3 py-1.5 text-xs font-semibold bg-gradient-to-r from-[#09a7ec] to-blue-500 text-white rounded-lg shadow-md hover:shadow-lg hover:scale-105 transition-all duration-200"
                        >
                          Upgrade
                        </button>
                      )}
                    </div>
                    <button
                      onClick={handleLogout}
                      className="mt-3 flex w-full items-center gap-x-3 rounded-xl p-3 text-sm font-medium text-slate-700 hover:text-red-600 hover:bg-red-50 transition-all duration-200 group"
                    >
                      <LogOut className="h-5 w-5 text-slate-400 group-hover:text-red-500 transition-colors duration-200" />
                      <span>Sign out</span>
                    </button>
                  </>
                ) : null}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Desktop sidebar */}
      <div className="hidden lg:fixed lg:inset-y-0 lg:z-40 lg:flex lg:w-80 lg:flex-col">
        <div className="flex grow flex-col gap-y-6 overflow-y-auto bg-gradient-to-b from-white via-white to-slate-50 px-6 py-6 shadow-2xl border-r border-slate-200/50 backdrop-blur-xl">
          {/* Desktop Header */}
          <div className="flex items-center gap-x-4 p-4 bg-gradient-to-r from-[#09a7ec]/5 to-blue-50 rounded-2xl border border-slate-200/50">
            <div className="relative">
              <img src={kolxd} alt="KOL Nexus Logo" className="h-14 w-14 rounded-xl shadow-lg" />
              <div className="absolute -top-1 -right-1 w-5 h-5 bg-gradient-to-r from-[#09a7ec] to-blue-500 rounded-full animate-pulse"></div>
            </div>
            <div>
              <h1 className="text-xl font-bold bg-gradient-to-r from-[#09a7ec] to-blue-600 bg-clip-text text-transparent">
                KOL Nexus
              </h1>
              <p className="text-sm text-slate-500 font-medium">Analytics Platform</p>
            </div>
          </div>

          {/* Desktop Navigation */}
          <nav className="flex flex-1 flex-col">
            <ul role="list" className="flex flex-1 flex-col gap-y-2">
              <li>
                <ul role="list" className="space-y-2">
                  {navigation.map((item, index) => (
                    <li key={item.name} 
                        style={{ 
                          animationDelay: `${index * 100}ms`,
                          animation: 'fadeInUp 0.5s ease-out forwards'
                        }}>
                      <Link
                        to={item.href}
                        className={classNames(
                          location.pathname === item.href
                            ? 'bg-gradient-to-r from-[#09a7ec] to-blue-500 text-white shadow-lg shadow-blue-500/25 scale-[1.02]'
                            : 'text-slate-700 hover:bg-gradient-to-r hover:from-[#09a7ec]/10 hover:to-blue-50 hover:text-[#09a7ec] hover:shadow-md hover:scale-[1.01]',
                          'group flex items-center gap-x-4 rounded-xl p-4 text-sm font-medium transition-all duration-300 transform'
                        )}
                      >
                        <div className={classNames(
                          location.pathname === item.href
                            ? 'bg-white/20 backdrop-blur-sm'
                            : 'bg-slate-100 group-hover:bg-[#09a7ec]/10',
                          'p-2.5 rounded-lg transition-all duration-300'
                        )}>
                          <item.icon
                            className={classNames(
                              location.pathname === item.href
                                ? 'text-white'
                                : 'text-slate-500 group-hover:text-[#09a7ec]',
                              'h-5 w-5 transition-all duration-300'
                            )}
                          />
                        </div>
                        <span className="font-semibold">{item.name}</span>
                      </Link>
                    </li>
                  ))}
                </ul>
              </li>
            </ul>

            {/* Desktop User Section */}
            <div className="mt-auto border-t border-slate-200/50 pt-6 bg-gradient-to-r from-slate-50 to-white rounded-t-2xl -mx-6 px-6 pb-2">
              {isAuthenticated ? (
                <>
                  <div className="flex items-center space-x-4 p-4 bg-gradient-to-r from-[#09a7ec]/5 to-blue-50 rounded-xl border border-slate-200/50">
                    <div className="relative">
                      <div className="w-12 h-12 bg-gradient-to-r from-[#09a7ec] to-blue-500 rounded-xl flex items-center justify-center text-white text-lg font-bold shadow-lg">
                        {user?.email?.charAt(0).toUpperCase()}
                      </div>
                      <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-green-500 rounded-full border-2 border-white"></div>
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-semibold text-slate-900 truncate">
                        {user?.email}
                      </p>
                      <p className="text-xs text-slate-500 truncate flex items-center gap-1">
                        <span className={classNames(
                          user?.plan === 'free' ? 'text-amber-600' : 'text-emerald-600',
                          'font-medium'
                        )}>
                          {user?.plan === 'free' ? '🆓 Free Plan' : '⭐ Pro Plan'}
                        </span>
                      </p>
                    </div>
                    {user?.plan === 'free' && (
                      <button
                        onClick={handleUpgradeClick}
                        className="px-3 py-1.5 text-xs font-semibold bg-gradient-to-r from-[#09a7ec] to-blue-500 text-white rounded-lg shadow-md hover:shadow-lg hover:scale-105 transition-all duration-200"
                      >
                        Upgrade
                      </button>
                    )}
                  </div>
                  <button
                    onClick={handleLogout}
                    className="mt-4 flex w-full items-center gap-x-3 rounded-xl p-3 text-sm font-medium text-slate-700 hover:text-red-600 hover:bg-red-50 transition-all duration-200 group"
                  >
                    <LogOut className="h-5 w-5 text-slate-400 group-hover:text-red-500 transition-colors duration-200" />
                    <span>Sign out</span>
                  </button>
                </>
                              ) : null}
            </div>
          </nav>
        </div>
      </div>

      {/* Main content */}
      <div className="lg:pl-80">
        {/* Top bar for mobile */}
        <div className="sticky top-0 z-40 flex h-16 shrink-0 items-center gap-x-4 border-b border-slate-200/50 bg-white/80 backdrop-blur-xl px-4 shadow-sm sm:gap-x-6 sm:px-6 lg:hidden">
          <button
            type="button"
            className="-m-2.5 p-2.5 text-slate-700 hover:text-[#09a7ec] hover:bg-[#09a7ec]/10 rounded-lg transition-all duration-200 lg:hidden"
            onClick={() => setSidebarOpen(true)}
          >
            <Menu size={24} />
          </button>
          <div className="flex-1 text-sm font-semibold leading-6 bg-gradient-to-r from-[#09a7ec] to-blue-600 bg-clip-text text-transparent">
            KOL Nexus
          </div>
        </div>

        {/* Page content */}
        <main className="py-8 bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 min-h-screen">
          <div className="px-4 sm:px-6 lg:px-8">
            <Outlet />
          </div>
        </main>
      </div>


    </div>
  );
} 