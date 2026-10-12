import React, { createContext, useContext, useState, useEffect } from 'react';
import { useAuth } from './AuthContext';
import { EntryData } from '../utils/calculations';
import { saveEntry, subscribeToEntries } from '../services/entries';
import { saveMonthRate, subscribeToRates } from '../services/rates';
import { getTodayKey, getYesterdayKey } from '../utils/dates';

interface MilkDataContextType {
  entries: Record<string, EntryData>;
  rates: Record<string, number>;
  loading: boolean;
  setDailyEntry: (dateKey: string, morning: number, evening: number) => Promise<void>;
  setMonthlyRate: (monthKey: string, rate: number) => Promise<void>;
  getEntryForDate: (dateKey: string) => EntryData;
}

const MilkDataContext = createContext<MilkDataContextType | undefined>(undefined);

export const MilkDataProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user, profile } = useAuth();
  const [entries, setEntries] = useState<Record<string, EntryData>>({});
  const [rates, setRates] = useState<Record<string, number>>({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) {
      setEntries({});
      setRates({});
      setLoading(false);
      return;
    }

    setLoading(true);

    // Subscribe to entries
    const unsubEntries = subscribeToEntries(user.uid, (data) => {
      setEntries(data);
      setLoading(false);
    });

    // Subscribe to rates
    const unsubRates = subscribeToRates(user.uid, (data) => {
      setRates(data);
    });

    return () => {
      unsubEntries();
      unsubRates();
    };
  }, [user]);

  const setDailyEntry = async (dateKey: string, morning: number, evening: number) => {
    if (!user) return;
    await saveEntry(user.uid, dateKey, morning, evening);
  };

  const setMonthlyRate = async (monthKey: string, rate: number) => {
    if (!user) return;
    await saveMonthRate(user.uid, monthKey, rate);
  };

  const getEntryForDate = (dateKey: string): EntryData => {
    if (entries[dateKey]) {
      return entries[dateKey];
    }
    // Return user defaults if available, otherwise 0
    return {
      morning: profile?.defaultMorning ?? 1.0,
      evening: profile?.defaultEvening ?? 0.5,
      status: 'none',
    };
  };

  return (
    <MilkDataContext.Provider
      value={{
        entries,
        rates,
        loading,
        setDailyEntry,
        setMonthlyRate,
        getEntryForDate,
      }}
    >
      {children}
    </MilkDataContext.Provider>
  );
};

export function useMilkData(): MilkDataContextType {
  const context = useContext(MilkDataContext);
  if (!context) {
    throw new Error('useMilkData must be used within a MilkDataProvider');
  }
  return context;
}
