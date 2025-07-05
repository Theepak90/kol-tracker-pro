import React, { createContext, useContext, useState, ReactNode } from 'react';

interface KOLInfo {
  user_id: number;
  username: string | null;
  first_name: string | null;
  last_name: string | null;
  is_admin: boolean;
}

interface GroupScan {
  channel_id: number;
  title: string;
  username: string | null;
  description: string | null;
  member_count: number;
  active_members: number;
  bot_count: number;
  kol_count: number;
  kol_details: KOLInfo[];
  scanned_at: string;
}

interface ChannelInfo extends GroupScan {
  previous_scans?: GroupScan[];
}

interface ChannelScannerContextType {
  scanResult: ChannelInfo | null;
  setScanResult: (result: ChannelInfo | null) => void;
  isScanning: boolean;
  setIsScanning: (scanning: boolean) => void;
  error: string | null;
  setError: (error: string | null) => void;
}

const ChannelScannerContext = createContext<ChannelScannerContextType | undefined>(undefined);

export function useChannelScanner() {
  const context = useContext(ChannelScannerContext);
  if (context === undefined) {
    throw new Error('useChannelScanner must be used within a ChannelScannerProvider');
  }
  return context;
}

interface ChannelScannerProviderProps {
  children: ReactNode;
}

export function ChannelScannerProvider({ children }: ChannelScannerProviderProps) {
  const [scanResult, setScanResult] = useState<ChannelInfo | null>(null);
  const [isScanning, setIsScanning] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const value = {
    scanResult,
    setScanResult,
    isScanning,
    setIsScanning,
    error,
    setError,
  };

  return (
    <ChannelScannerContext.Provider value={value}>
      {children}
    </ChannelScannerContext.Provider>
  );
} 