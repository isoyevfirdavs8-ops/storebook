import { createContext, useContext, useState } from 'react';
import api from '../services/api';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);

  const [isAuthenticated, setIsAuthenticated] = useState(
    !!localStorage.getItem('access_token')
  );

  const login = async (phone_number, password) => {
    const { data } = await api.post('/auth/login/', {
      phone_number,
      password,
    });

    localStorage.setItem(
      'access_token',
      data.access
    );

    localStorage.setItem(
      'refresh_token',
      data.refresh
    );

    if (data.user) {
      setUser(data.user);
    }

    setIsAuthenticated(true);

    return data;
  };

  const register = async (
    email,
    password,
    full_name,
    phone_number
  ) => {
    const { data } = await api.post(
      '/auth/register/',
      {
        email,
        password,
        full_name,
        phone_number,
      }
    );

    return data;
  };

  const verifyPhone = async (
    phone_number,
    code
  ) => {
    const { data } = await api.post(
      '/auth/verify-phone/',
      {
        phone_number,
        code,
      }
    );

    return data;
  };

  const resendOTP = async (phone_number) => {
    const { data } = await api.post(
      '/auth/resend-otp/',
      {
        phone_number,
      }
    );

    return data;
  };

  const logout = () => {
    localStorage.removeItem(
      'access_token'
    );

    localStorage.removeItem(
      'refresh_token'
    );

    setIsAuthenticated(false);
    setUser(null);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated,
        login,
        register,
        verifyPhone,
        resendOTP,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () =>
  useContext(AuthContext);