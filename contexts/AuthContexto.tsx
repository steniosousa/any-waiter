import React, { createContext, useContext, useState, ReactNode, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Api from '@/services/Api';

type User = {
  id: string;
  email: string;
  name?: string;
};

type AuthContextData = {
  user: User | null;
  loading: boolean;
  signIn: (email: string, password: string) => Promise<void>;
  signOut: () => Promise<void>;
  isAuthenticated: boolean;
};

type AuthProviderProps = {
  children: ReactNode;
};

const AuthContext = createContext<AuthContextData>({} as AuthContextData);

function AuthProvider({ children }: AuthProviderProps) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadStorageData() {
      const storagedUser = await AsyncStorage.getItem('@anygarcom:user');
      const storagedToken = await AsyncStorage.getItem('@anygarcom:token');

      if (storagedUser && storagedToken) {
        setUser(JSON.parse(storagedUser));
      }

      setLoading(false);
    }

    loadStorageData();
  }, []);

  async function signIn(email: string, password: string) {
    try {
      setLoading(true);
      
      const {data} = await Api.post('/login', { email, password });
      console.log(data)
     
    
    //   setUser(data.user);
    //   await AsyncStorage.setItem('@anygarcom:user', JSON.stringify(response.user));
    //   await AsyncStorage.setItem('@anygarcom:token', response.token);
    } catch (error) {
      console.error('Erro ao fazer login:', error);
      throw new Error('Não foi possível realizar o login. Verifique suas credenciais.');
    } finally {
      setLoading(false);
    }
  }

  async function signOut() {
    await AsyncStorage.removeItem('@anygarcom:user');
    await AsyncStorage.removeItem('@anygarcom:token');
    setUser(null);
  }

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        signIn,
        signOut,
        isAuthenticated: !!user,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

function useAuth() {
  const context = useContext(AuthContext);

  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }

  return context;
}

export { AuthProvider, useAuth };