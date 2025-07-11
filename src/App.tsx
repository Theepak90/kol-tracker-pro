import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { SolanaWalletProvider } from './contexts/WalletContext';
import Layout from './components/Layout';
import Dashboard from './components/Dashboard';
import { ChannelScanner } from './components/ChannelScanner';
import KOLAnalyzer from './components/KOLAnalyzer';
import { VolumeTracker } from './components/VolumeTracker';
import { BotDetector } from './components/BotDetector';
import Leaderboard from './components/Leaderboard';
import Games from './components/Games';
import { ChannelScannerProvider } from './contexts/ChannelScannerContext';
import { Toaster } from 'react-hot-toast';

// Error Boundary Component
class ErrorBoundary extends React.Component<
  { children: React.ReactNode },
  { hasError: boolean; error: any }
> {
  constructor(props: any) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: any) {
    return { hasError: true, error };
  }

  componentDidCatch(error: any, errorInfo: any) {
    console.error('Error caught by boundary:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen flex items-center justify-center bg-gray-900 text-white">
          <div className="text-center">
            <h1 className="text-2xl font-bold mb-4">Something went wrong</h1>
            <p className="mb-4">Error: {this.state.error?.message}</p>
            <button 
              onClick={() => window.location.reload()} 
              className="bg-indigo-600 px-4 py-2 rounded"
            >
              Reload Page
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

function App() {
  return (
    <ErrorBoundary>
      <SolanaWalletProvider>
        <Router>
          <AuthProvider>
            <ChannelScannerProvider>
              <Toaster position="top-right" />
              <Routes>
                {/* Main Layout with all routes */}
                <Route path="/" element={<Layout />}>
                  {/* All Routes - No Authentication Required */}
                  <Route index element={<Dashboard />} />
                  <Route path="dashboard" element={<Dashboard />} />
                  <Route path="leaderboard" element={<Leaderboard />} />
                  <Route path="games" element={<Games />} />
                  <Route path="kol-analyzer" element={<KOLAnalyzer />} />
                  <Route path="channel-scanner" element={<ChannelScanner />} />
                  <Route path="bot-detector" element={<BotDetector />} />
                  <Route path="volume-tracker" element={<VolumeTracker />} />
                </Route>
              </Routes>
            </ChannelScannerProvider>
          </AuthProvider>
        </Router>
      </SolanaWalletProvider>
    </ErrorBoundary>
  );
}

export default App;