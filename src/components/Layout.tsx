import React, { Fragment, useState } from 'react';
import { Link, useLocation, useNavigate, Outlet } from 'react-router-dom';
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
import { useAuth } from '../contexts/AuthContext';
import WalletConnect from './WalletConnect';
import kolxd from '../kolxd.png';
import { classNames } from '../utils/classNames';
import { authService } from '../services/authService';
import Background3D from './Background3D';

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

  const handleNavigation = (href: string) => {
    setSidebarOpen(false); // Close mobile sidebar
    navigate(href); // Use navigate instead of Link for programmatic navigation
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
    <div className="min-h-screen relative bg-[#0f0f0f]">
      {/* 3-D animated background behind everything */}
      <Background3D />
      {/* Upgrade Modal */}
      {upgradeModalOpen && (
        <div className="fixed inset-0 z-[100] overflow-y-auto">
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
      )}

      {/* Mobile sidebar */}
      <div className={`fixed inset-0 z-40 lg:hidden ${sidebarOpen ? 'block' : 'hidden'}`}>
        <div className="fixed inset-0 bg-black/75 backdrop-blur-sm" onClick={() => setSidebarOpen(false)} />
        <div className="fixed inset-y-0 left-0 flex w-72 flex-col">
          <div className="flex grow flex-col overflow-y-auto bg-[#0f0f0f] shadow-2xl">
            {/* Mobile Header */}
            <div className="flex h-24 items-center justify-between px-6 border-b border-[#1f1f1f]">
              <div className="flex items-center gap-x-4 group">
                <div className="relative flex items-center">
                  <div className="relative w-16 h-16 rounded-full bg-gradient-to-r from-[#6c5dd3] to-[#8d7ff0] flex items-center justify-center shadow-lg shadow-[#6c5dd3]/20">
                    <div className="absolute inset-0 rounded-full bg-gradient-to-r from-[#6c5dd3]/20 to-[#8d7ff0]/20 animate-pulse"></div>
                    <div className="absolute -inset-1 bg-gradient-to-r from-[#6c5dd3] to-[#8d7ff0] rounded-full blur-md opacity-50 group-hover:opacity-75 transition-opacity duration-300"></div>
                    <img 
                      src={kolxd} 
                      alt="KOL NEXUS Logo" 
                      className="h-14 w-14 object-contain transform rotate-12 hover:rotate-0 transition-all duration-300 relative z-10"
                    />
                  </div>
                </div>
                <div>
                  <h1 className="text-2xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-white to-[#6c5dd3] tracking-wider group-hover:scale-105 transition-transform duration-300">
                    KOL NEXUS
                  </h1>
                  <p className="text-sm text-[#6c5dd3]/80 font-medium tracking-wide">Analytics Platform</p>
                </div>
              </div>
              <button
                onClick={() => setSidebarOpen(false)}
                className="p-2 text-gray-400 hover:text-white hover:bg-[#1f1f1f] rounded-lg transition-all duration-200"
              >
                <X size={20} />
              </button>
            </div>

            {/* Mobile Navigation */}
            <nav className="flex-1 px-4 pt-10 pb-6 space-y-4">
              {navigation.map((item) => (
                <button
                  key={item.name}
                  onClick={() => handleNavigation(item.href)}
                  className={classNames(
                    'group flex w-full items-center gap-x-4 rounded-2xl p-4 text-base font-medium transition-all duration-300 relative',
                    location.pathname === item.href
                      ? 'bg-[#6c5dd3] text-white'
                      : 'text-gray-400 hover:bg-[#1f1f1f] hover:text-gray-200'
                  )}
                >
                  <div className="relative flex items-center">
                    <div className={classNames(
                      'transition-all duration-300',
                      location.pathname === item.href
                        ? 'text-white'
                        : 'text-gray-400 group-hover:text-gray-200'
                    )}>
                      <item.icon className="h-6 w-6" />
                    </div>
                  </div>
                  <span className="font-medium tracking-wide">{item.name}</span>
                </button>
              ))}
            </nav>
          </div>
        </div>
      </div>

      {/* Desktop sidebar */}
      <div className="hidden lg:fixed lg:inset-y-0 lg:flex lg:w-72 lg:flex-col">
        <div className="flex grow flex-col overflow-y-auto bg-[#0f0f0f] shadow-2xl">
          {/* Desktop Header */}
          <div className="flex h-24 items-center justify-between px-6 border-b border-[#1f1f1f]">
            <div className="flex items-center gap-x-4 group">
              <div className="relative flex items-center">
                <div className="relative w-16 h-16 rounded-full bg-gradient-to-r from-[#6c5dd3] to-[#8d7ff0] flex items-center justify-center shadow-lg shadow-[#6c5dd3]/20">
                  <div className="absolute inset-0 rounded-full bg-gradient-to-r from-[#6c5dd3]/20 to-[#8d7ff0]/20 animate-pulse"></div>
                  <div className="absolute -inset-1 bg-gradient-to-r from-[#6c5dd3] to-[#8d7ff0] rounded-full blur-md opacity-50 group-hover:opacity-75 transition-opacity duration-300"></div>
                  <img 
                    src={kolxd} 
                    alt="KOL NEXUS Logo" 
                    className="h-14 w-14 object-contain transform rotate-12 hover:rotate-0 transition-all duration-300 relative z-10"
                  />
                </div>
              </div>
              <div>
                <h1 className="text-2xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-white to-[#6c5dd3] tracking-wider group-hover:scale-105 transition-transform duration-300">
                  KOL NEXUS
                </h1>
                <p className="text-sm text-[#6c5dd3]/80 font-medium tracking-wide">Analytics Platform</p>
              </div>
            </div>
          </div>

          {/* Desktop Navigation */}
          <nav className="flex-1 px-4 pt-10 pb-6 space-y-4">
            {navigation.map((item) => (
              <button
                key={item.name}
                onClick={() => handleNavigation(item.href)}
                className={classNames(
                  'group flex w-full items-center gap-x-4 rounded-2xl p-4 text-base font-medium transition-all duration-300 relative',
                  location.pathname === item.href
                    ? 'bg-[#6c5dd3] text-white'
                    : 'text-gray-400 hover:bg-[#1f1f1f] hover:text-gray-200'
                )}
              >
                <div className="relative flex items-center">
                  <div className={classNames(
                    'transition-all duration-300',
                    location.pathname === item.href
                      ? 'text-white'
                      : 'text-gray-400 group-hover:text-gray-200'
                  )}>
                    <item.icon className="h-6 w-6" />
                  </div>
                </div>
                <span className="font-medium tracking-wide">{item.name}</span>
              </button>
            ))}
          </nav>
        </div>
      </div>

      {/* Main content */}
      <div className="lg:pl-72">
        {/* Top header with wallet connect - only show on games page */}
        {location.pathname === '/games' && (
          <div className="sticky top-0 z-30 bg-[#0f0f0f]/90 backdrop-blur-sm border-b border-[#1f1f1f]">
            <div className="flex h-16 items-center justify-between px-6">
              <div className="flex items-center gap-4">
                <button
                  onClick={() => setSidebarOpen(true)}
                  className="p-2 text-gray-400 hover:text-white hover:bg-[#1f1f1f] rounded-lg transition-all duration-200 lg:hidden"
                >
                  <Menu size={20} />
                </button>
                <div className="text-white font-medium">
                  {navigation.find(item => item.href === location.pathname)?.name || 'Dashboard'}
                </div>
              </div>
              <div className="flex items-center gap-4">
                <WalletConnect />
              </div>
            </div>
          </div>
        )}
        
        <main>
          <div>
            <Outlet />
            {children}
          </div>
        </main>
      </div>
    </div>
  );
} 