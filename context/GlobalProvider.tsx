import React, { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { ColorSchemeName, useColorScheme } from 'react-native';
import { auth, db } from '@/api/firebaseConfig';
import { onAuthStateChanged, User } from 'firebase/auth';
import { collection, getDocs, DocumentData } from 'firebase/firestore';

interface GlobalContextType {
  user: User;
  loading: boolean;
  theme: ColorSchemeName;
  fetchUsers: () => Promise<DocumentData[] | void>;
}

const GlobalContext = createContext<GlobalContextType | undefined>(undefined);

interface GlobalProviderProps {
  children: ReactNode;
}

export const GlobalProvider: React.FC<GlobalProviderProps> = ({ children }) => {
  const [user, setUser] = useState<User>();
  const [loading, setLoading] = useState(true);
  const theme = useColorScheme(); // 'light' or 'dark'

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setUser(user);
      setLoading(false);
    }, (error) => {
      console.error('Error checking authentication state:', error);
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const fetchUsers = async (): Promise<DocumentData[] | void> => {
    try {
      const usersCollection = collection(db, 'users');
      const userSnapshot = await getDocs(usersCollection);
      const userList = userSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      return userList;
    } catch (error) {
      console.error('Error fetching users:', error);
    }
  };

  return (
    <GlobalContext.Provider value={{ user, loading, theme, fetchUsers }}>
      {children}
    </GlobalContext.Provider>
  );
};

export const useGlobal = (): GlobalContextType => {
  const context = useContext(GlobalContext);
  if (!context) {
    throw new Error('useGlobal must be used within a GlobalProvider');
  }
  return context;
};
