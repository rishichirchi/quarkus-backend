import React, { createContext, useContext, useEffect, useState } from 'react';
import { authAPI } from '../services/api';

const AuthContext = createContext();

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // Check if user is already authenticated on app load
  useEffect(() => {
    checkAuthStatus();
  }, []);

  const checkAuthStatus = async () => {
    try {
      const response = await authAPI.getSession();
      if (response.authenticated) {
        setUser(response.user);
      }
    } catch (error) {
      console.error('Auth check failed:', error);
      setUser(null);
    } finally {
      setLoading(false);
    }
  };

  const refreshUserData = async () => {
    try {
      const response = await authAPI.refreshUser();
      if (response.success && response.user) {
        setUser(response.user);
        return response.user;
      }
    } catch (error) {
      console.error('User refresh failed:', error);
      
      // Check if the error indicates user no longer exists
      if (error.message.includes('User no longer exists') || 
          error.message.includes('User not found')) {
        // User was deleted from database, force logout
        setUser(null);
        return null;
      }
      
      // For other auth errors, don't clear the user immediately
      // Let the user try again or handle it in the UI
      throw error;
    }
  };

  const login = async (email, password) => {
    try {
      setLoading(true);
      const response = await authAPI.login(email, password);
      setUser(response.user);
      return response;
    } catch (error) {
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const signup = async (email, password) => {
    try {
      setLoading(true);
      const response = await authAPI.signup(email, password);
      
      // If signup returns user data (from session server), set the user
      if (response.user) {
        setUser(response.user);
      }
      
      return response;
    } catch (error) {
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const logout = async () => {
    try {
      await authAPI.logout();
      setUser(null);
    } catch (error) {
      console.error('Logout error:', error);
      // Force logout even if API call fails
      setUser(null);
    }
  };

  const updateUserEmailStatus = async (emailValidated) => {
    // Update local state immediately for UI responsiveness
    setUser(prev => prev ? { ...prev, emailValidated } : null);
    
    // Also refresh the user data from the backend to ensure consistency
    try {
      await refreshUserData();
    } catch (error) {
      console.error('Failed to refresh user data after email verification:', error);
      // Fallback to session check if refresh fails
      try {
        await checkAuthStatus();
      } catch (sessionError) {
        console.error('Failed to check auth status:', sessionError);
      }
    }
  };

  const value = {
    user,
    loading,
    login,
    signup,
    logout,
    updateUserEmailStatus,
    checkAuthStatus,
    refreshUserData
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

export default AuthProvider;
