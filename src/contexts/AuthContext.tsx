import { createContext, useContext, useState, useEffect, type ReactNode } from 'react';
import { onAuthStateChanged, type User } from 'firebase/auth';
import { auth } from '../firebase';

interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  userName: string;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  isLoading: true,
  userName: '',
});

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (!auth) {
      setIsLoading(false);
      return;
    }
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      setUser(currentUser);
      setIsLoading(false);

      // Auto-register profile on login (cached in localStorage to avoid repeated D1 reads)
      if (currentUser) {
        const cacheKey = `profile_registered_${currentUser.uid}`;
        if (!localStorage.getItem(cacheKey)) {
          try {
            const res = await fetch(`/api/profiles/${currentUser.uid}`);
            if (!res.ok) {
              await fetch('/api/profiles', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                  uid: currentUser.uid,
                  display_name: currentUser.displayName || currentUser.email?.split('@')[0] || 'User',
                  email: currentUser.email || '',
                  avatar_url: currentUser.photoURL || '',
                }),
              });
            }
            // Mark as registered for 7 days
            localStorage.setItem(cacheKey, String(Date.now()));
          } catch (err) {
            console.error('Auto-register profile failed:', err);
          }
        }
      }
    });
    return () => unsubscribe();
  }, []);

  const userName = user?.displayName || user?.email?.split('@')[0] || '';

  return (
    <AuthContext.Provider value={{ user, isLoading, userName }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
