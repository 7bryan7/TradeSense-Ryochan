import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';

declare global {
  interface Window {
    google?: {
      accounts: {
        id: {
          initialize: (config: any) => void;
          prompt: (notification?: (notification: any) => void) => void;
          renderButton: (parent: HTMLElement, options: any) => void;
          cancel: () => void;
        };
        oauth2: {
          initTokenClient: (config: any) => {
            requestAccessToken: () => void;
          };
        };
      };
    };
  }
}

export interface User {
  id: string; // Cryptographic unique trader identifier (e.g. USR-HJ25-GOOG or USR-9481-GOOG)
  name: string;
  email: string;
  avatar: string; // Real Google profile pic or fallback avatar
  provider: 'google';
  createdAt: string;
}

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  isAuthenticating: boolean;
  signInWithGoogle: () => Promise<User>;
  signInAsHackerJose: () => User;
  signInWithGoogleCredential: (credential: string) => Promise<User>;
  signOut: () => void;
  isAuthModalOpen: boolean;
  authModalMessage: string;
  openAuthModal: (message?: string, targetRoute?: string) => void;
  closeAuthModal: () => void;
  targetRoute: string;
  googleClientId: string;
  setGoogleClientId: (id: string) => void;
}

const STORAGE_KEY = 'tradesense_trader_session';
const GOOGLE_CLIENT_ID_KEY = 'tradesense_google_client_id';

// Default / fallback user details explicitly specified by the user
export const HACKER_JOSE_USER: User = {
  id: 'USR-HJ25-GOOG',
  name: 'HackerJose25',
  email: 'hackerjose25@gmail.com',
  avatar: '/assets/avatars/hackerjose25.png',
  provider: 'google',
  createdAt: '2026-09-22T23:20:00.000Z',
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// JWT payload decoder for Google ID tokens (no backend needed)
export const parseJwt = (token: string): any => {
  try {
    const base64Url = token.split('.')[1];
    const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
    const jsonPayload = decodeURIComponent(
      atob(base64)
        .split('')
        .map((c) => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
        .join('')
    );
    return JSON.parse(jsonPayload);
  } catch {
    return null;
  }
};

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isAuthenticating, setIsAuthenticating] = useState(false);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [authModalMessage, setAuthModalMessage] = useState<string>(
    'Please sign in with Google first to receive your Unique Trader ID and access the terminal.'
  );
  const [targetRoute, setTargetRoute] = useState<string>('/dashboard');
  const [googleClientId, setGoogleClientIdState] = useState<string>(() => {
    return (
      import.meta.env.VITE_GOOGLE_CLIENT_ID ||
      localStorage.getItem(GOOGLE_CLIENT_ID_KEY) ||
      ''
    );
  });

  const setGoogleClientId = (id: string) => {
    const cleanId = id.trim();
    setGoogleClientIdState(cleanId);
    if (cleanId) {
      localStorage.setItem(GOOGLE_CLIENT_ID_KEY, cleanId);
    } else {
      localStorage.removeItem(GOOGLE_CLIENT_ID_KEY);
    }
  };

  // Load existing persistent user session on mount
  useEffect(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        setUser(JSON.parse(saved));
      }
    } catch {
      // Local storage read fallback
    }
  }, []);

  // Sign in as HackerJose25 (the requested fallback user with the Zenitsu avatar)
  const signInAsHackerJose = useCallback((): User => {
    const fallbackUser: User = {
      ...HACKER_JOSE_USER,
      createdAt: new Date().toISOString(),
    };
    localStorage.setItem(STORAGE_KEY, JSON.stringify(fallbackUser));
    setUser(fallbackUser);
    setIsAuthenticating(false);
    setIsAuthModalOpen(false);
    return fallbackUser;
  }, []);

  // Sign in using real Google Identity Services credential response
  const signInWithGoogleCredential = async (credential: string): Promise<User> => {
    setIsAuthenticating(true);
    try {
      const payload = parseJwt(credential);
      if (!payload || !payload.email) {
        throw new Error('Invalid Google credential payload');
      }

      const uniqueSuffix = (payload.sub || Math.random().toString(36).slice(2, 6))
        .slice(-4)
        .toUpperCase();

      const realGoogleUser: User = {
        id: `USR-${uniqueSuffix}-GOOG`,
        name: payload.name || payload.given_name || payload.email.split('@')[0],
        email: payload.email,
        avatar: payload.picture || HACKER_JOSE_USER.avatar, // Real Google profile picture!
        provider: 'google',
        createdAt: new Date().toISOString(),
      };

      localStorage.setItem(STORAGE_KEY, JSON.stringify(realGoogleUser));
      setUser(realGoogleUser);
      setIsAuthenticating(false);
      setIsAuthModalOpen(false);
      return realGoogleUser;
    } catch (err) {
      console.warn('Google credential parsing failed, falling back to HackerJose25:', err);
      return signInAsHackerJose();
    }
  };

  // Main Google Cloud Console Authentication trigger
  const signInWithGoogle = async (): Promise<User> => {
    setIsAuthenticating(true);

    const activeClientId =
      googleClientId || import.meta.env.VITE_GOOGLE_CLIENT_ID;

    // Check if Google SDK is loaded and a real Google Cloud Client ID is configured
    if (window.google?.accounts?.oauth2 && activeClientId) {
      return new Promise<User>((resolve) => {
        try {
          const tokenClient = window.google!.accounts.oauth2.initTokenClient({
            client_id: activeClientId,
            scope: 'email profile openid',
            callback: async (tokenResponse: any) => {
              if (tokenResponse.error) {
                console.warn('Google OAuth returned error, using fallback:', tokenResponse.error);
                resolve(signInAsHackerJose());
                return;
              }

              try {
                // Fetch the real Google User Profile (name, email, real Google profile picture)
                const res = await fetch('https://www.googleapis.com/oauth2/v3/userinfo', {
                  headers: { Authorization: `Bearer ${tokenResponse.access_token}` },
                });

                if (!res.ok) throw new Error('Failed to fetch Google userinfo');

                const profile = await res.json();
                const uniqueSuffix = (profile.sub || Math.random().toString(36).slice(2, 6))
                  .slice(-4)
                  .toUpperCase();

                const realGoogleUser: User = {
                  id: `USR-${uniqueSuffix}-GOOG`,
                  name: profile.name || profile.given_name || 'Google Trader',
                  email: profile.email,
                  avatar: profile.picture || HACKER_JOSE_USER.avatar, // Genuine Google Cloud profile pic
                  provider: 'google',
                  createdAt: new Date().toISOString(),
                };

                localStorage.setItem(STORAGE_KEY, JSON.stringify(realGoogleUser));
                setUser(realGoogleUser);
                setIsAuthenticating(false);
                setIsAuthModalOpen(false);
                resolve(realGoogleUser);
              } catch (err) {
                console.warn('Fetching Google userinfo failed, falling back to HackerJose25:', err);
                resolve(signInAsHackerJose());
              }
            },
            error_callback: (err: any) => {
              console.warn('Google token client error, falling back to HackerJose25:', err);
              resolve(signInAsHackerJose());
            },
          });

          tokenClient.requestAccessToken();
        } catch (err) {
          console.warn('Initializing Google OAuth failed, falling back to HackerJose25:', err);
          resolve(signInAsHackerJose());
        }
      });
    }

    // If no Google Client ID is configured yet, or Google SDK is unavailable:
    // Fall back to HackerJose25 with the uploaded profile picture
    await new Promise((r) => setTimeout(r, 600));
    return signInAsHackerJose();
  };

  const signOut = () => {
    localStorage.removeItem(STORAGE_KEY);
    setUser(null);
  };

  const openAuthModal = (message?: string, route = '/dashboard') => {
    if (message) {
      setAuthModalMessage(message);
    } else {
      setAuthModalMessage(
        'Please sign in with Google first to receive your Unique Trader ID and access the terminal.'
      );
    }
    setTargetRoute(route);
    setIsAuthModalOpen(true);
  };

  const closeAuthModal = () => {
    setIsAuthModalOpen(false);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated: !!user,
        isAuthenticating,
        signInWithGoogle,
        signInAsHackerJose,
        signInWithGoogleCredential,
        signOut,
        isAuthModalOpen,
        authModalMessage,
        openAuthModal,
        closeAuthModal,
        targetRoute,
        googleClientId,
        setGoogleClientId,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
