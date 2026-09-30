import React, { createContext, useContext, useState, useEffect } from 'react';
import { Language, TamilNaduCity, UserProfile, UserRole } from '../types';

interface AuthContextType {
  user: UserProfile | null;
  language: Language;
  setLanguage: (lang: Language) => void;
  login: (phone: string, name?: string, platform?: any, role?: UserRole) => Promise<UserProfile>;
  quickStartGuest: (city?: TamilNaduCity, role?: UserRole) => Promise<UserProfile>;
  updateProfile: (updates: Partial<UserProfile>) => Promise<UserProfile>;
  logout: () => void;
  switchRole: (role: UserRole) => void;
}

const STORAGE_KEY = 'heatsafe_worker_profile';
const LANG_STORAGE_KEY = 'heatsafe_language';

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<UserProfile | null>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      return saved ? JSON.parse(saved) : null;
    } catch {
      return null;
    }
  });

  const [language, setLanguageState] = useState<Language>(() => {
    try {
      const saved = localStorage.getItem(LANG_STORAGE_KEY);
      if (saved === 'ta' || saved === 'en' || saved === 'hi') return saved;
      return 'ta'; // Default to Tamil for Tamil Nadu gig workers
    } catch {
      return 'ta';
    }
  });

  const setLanguage = (lang: Language) => {
    setLanguageState(lang);
    localStorage.setItem(LANG_STORAGE_KEY, lang);
    if (user) {
      updateProfile({ preferredLanguage: lang });
    }
  };

  useEffect(() => {
    if (user) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(user));
    } else {
      localStorage.removeItem(STORAGE_KEY);
    }
  }, [user]);

  const login = async (phone: string, name?: string, platform = 'swiggy', role: UserRole = 'gig_worker'): Promise<UserProfile> => {
    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          phone,
          name: name || `Worker #${phone.slice(-4)}`,
          platform,
          role,
          preferredLanguage: language,
        }),
      });
      const data = await res.json();
      if (data.user) {
        setUser(data.user);
        return data.user;
      }
      throw new Error(data.error || 'Failed to login');
    } catch (e) {
      // Fallback local user if network glitch
      const fallbackUser: UserProfile = {
        id: `worker-${Date.now()}`,
        name: name || `Worker #${phone.slice(-4)}`,
        phone,
        platform: platform as any,
        vehicle: 'two_wheeler',
        city: 'chennai',
        role,
        womenFriendlyOnly: false,
        freeOnly: false,
        preferredLanguage: language,
        createdAt: new Date().toISOString(),
        isGuest: false,
      };
      setUser(fallbackUser);
      return fallbackUser;
    }
  };

  const quickStartGuest = async (city: TamilNaduCity = 'chennai', role: UserRole = 'gig_worker'): Promise<UserProfile> => {
    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          guestName: 'Express Delivery Rider',
          city,
          role,
          preferredLanguage: language,
        }),
      });
      const data = await res.json();
      if (data.user) {
        setUser(data.user);
        return data.user;
      }
      throw new Error('Guest login failed');
    } catch (e) {
      const guest: UserProfile = {
        id: `guest-${Date.now()}`,
        name: 'Guest Delivery Rider',
        phone: 'GUEST',
        platform: 'swiggy',
        vehicle: 'two_wheeler',
        city,
        role,
        womenFriendlyOnly: false,
        freeOnly: false,
        preferredLanguage: language,
        createdAt: new Date().toISOString(),
        isGuest: true,
      };
      setUser(guest);
      return guest;
    }
  };

  const updateProfile = async (updates: Partial<UserProfile>): Promise<UserProfile> => {
    if (!user) throw new Error('No user logged in');
    const updated = { ...user, ...updates };
    setUser(updated);

    try {
      await fetch('/api/auth/update', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updated),
      });
    } catch (e) {
      console.warn('Profile sync queued locally', e);
    }
    return updated;
  };

  const switchRole = (role: UserRole) => {
    if (user) {
      updateProfile({ role });
    } else {
      quickStartGuest('chennai', role);
    }
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem(STORAGE_KEY);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        language,
        setLanguage,
        login,
        quickStartGuest,
        updateProfile,
        logout,
        switchRole,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
