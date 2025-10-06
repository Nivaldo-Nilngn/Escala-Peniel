// contexts/AuthContext.tsx
import React, { createContext, useContext, useEffect, useState } from 'react';
import { 
  User as FirebaseUser,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
  updateProfile
} from 'firebase/auth';
import { doc, getDoc, setDoc, updateDoc } from 'firebase/firestore';
import { auth, db } from '../firebase-config';
import { User, UserRole } from '../types';

interface AuthContextType {
  currentUser: User | null;
  user: User | null; // Alias para currentUser
  firebaseUser: FirebaseUser | null;
  login: (email: string, password: string) => Promise<void>;
  register: (email: string, password: string, name: string, role: UserRole) => Promise<void>;
  logout: () => Promise<void>;
  updateUserProfile: (userData: Partial<User>) => Promise<void>;
  loading: boolean;
  hasRole: (roles: UserRole[]) => boolean;
}

const AuthContext = createContext<AuthContextType | null>(null);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth deve ser usado dentro de um AuthProvider');
  }
  return context;
};

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [firebaseUser, setFirebaseUser] = useState<FirebaseUser | null>(null);
  const [loading, setLoading] = useState(true);

  // Buscar dados do usuário no Firestore
  const fetchUserData = async (firebaseUser: FirebaseUser): Promise<User | null> => {
    try {
      const userDoc = await getDoc(doc(db, 'users', firebaseUser.uid));
      if (userDoc.exists()) {
        const userData = userDoc.data();
        return {
          id: firebaseUser.uid,
          email: firebaseUser.email!,
          name: userData.name || firebaseUser.displayName || '',
          phone: userData.phone,
          role: userData.role || 'membro',
          departmentIds: userData.departmentIds || [],
          photoURL: userData.photoURL || firebaseUser.photoURL,
          isActive: userData.isActive !== false,
          createdAt: userData.createdAt?.toDate() || new Date(),
          updatedAt: userData.updatedAt?.toDate() || new Date(),
        } as User;
      }
      return null;
    } catch (error) {
      console.error('Erro ao buscar dados do usuário:', error);
      return null;
    }
  };

  // Login
  const login = async (email: string, password: string) => {
    try {
      await signInWithEmailAndPassword(auth, email, password);
    } catch (error) {
      console.error('Erro no login:', error);
      throw error;
    }
  };

  // Registro
  const register = async (email: string, password: string, name: string, role: UserRole = 'membro') => {
    try {
      const { user } = await createUserWithEmailAndPassword(auth, email, password);
      
      // Atualizar perfil do Firebase
      await updateProfile(user, { displayName: name });

      // Criar documento do usuário no Firestore
      const userData: Omit<User, 'id'> = {
        email,
        name,
        role,
        departmentIds: [],
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      await setDoc(doc(db, 'users', user.uid), userData);
    } catch (error) {
      console.error('Erro no registro:', error);
      throw error;
    }
  };

  // Logout
  const logout = async () => {
    try {
      await signOut(auth);
      setCurrentUser(null);
      setFirebaseUser(null);
    } catch (error) {
      console.error('Erro no logout:', error);
      throw error;
    }
  };

  // Atualizar perfil do usuário
  const updateUserProfile = async (userData: Partial<User>) => {
    if (!firebaseUser || !currentUser) return;

    try {
      // Atualizar no Firestore
      await updateDoc(doc(db, 'users', firebaseUser.uid), {
        ...userData,
        updatedAt: new Date(),
      });

      // Atualizar estado local
      setCurrentUser(prev => prev ? { ...prev, ...userData } : null);
    } catch (error) {
      console.error('Erro ao atualizar perfil:', error);
      throw error;
    }
  };

  // Verificar se o usuário tem determinado papel
  const hasRole = (roles: UserRole[]): boolean => {
    return currentUser ? roles.includes(currentUser.role) : false;
  };

  // Listener para mudanças de autenticação
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      setLoading(true);
      
      if (firebaseUser) {
        setFirebaseUser(firebaseUser);
        const userData = await fetchUserData(firebaseUser);
        setCurrentUser(userData);
      } else {
        setFirebaseUser(null);
        setCurrentUser(null);
      }
      
      setLoading(false);
    });

    return unsubscribe;
  }, []);

  const value: AuthContextType = {
    currentUser,
    user: currentUser, // Alias para compatibilidade
    firebaseUser,
    login,
    register,
    logout,
    updateUserProfile,
    loading,
    hasRole,
  };

  return (
    <AuthContext.Provider value={value}>
      {!loading && children}
    </AuthContext.Provider>
  );
};