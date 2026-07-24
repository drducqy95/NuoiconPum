import React, { createContext, useContext, useEffect, useState } from 'react';
import { User, onAuthStateChanged, getRedirectResult } from 'firebase/auth';
import { auth, db } from './firebase';
import { doc, getDoc, setDoc, serverTimestamp } from 'firebase/firestore';

interface AuthContextType {
  user: User | null;
  loading: boolean;
}

const AuthContext = createContext<AuthContextType>({ user: null, loading: true });

export const useAuth = () => useContext(AuthContext);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Process redirect sign-in result if applicable
    getRedirectResult(auth).catch((err) => {
      console.warn("Redirect Sign-In Result Warning:", err);
      if (err?.code === 'auth/unauthorized-domain') {
        alert('⚠️ Lỗi tên miền chưa được cấp phép trong Firebase:\n\nVui lòng vào Firebase Console > Authentication > Settings > Authorized domains và thêm tên miền Vercel của bạn (ví dụ: nuoiconpum.vercel.app).');
      }
    });

    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      setUser(currentUser);
      
      if (currentUser) {
        // Ensure user document exists
        try {
          const userRef = doc(db, 'users', currentUser.uid);
          const userSnap = await getDoc(userRef);
          if (!userSnap.exists()) {
            await setDoc(userRef, {
              email: currentUser.email || '',
              createdAt: serverTimestamp(),
            });
          }
        } catch (error) {
           console.error("Firebase error", error);
        } finally {
           setLoading(false);
        }
      } else {
        setLoading(false);
      }
    });

    return () => unsubscribe();
  }, []);

  return (
    <AuthContext.Provider value={{ user, loading }}>
      {children}
    </AuthContext.Provider>
  );
};
