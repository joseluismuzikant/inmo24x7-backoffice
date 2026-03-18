import React, { createContext, useContext, useState, useEffect } from 'react';
import { getCurrentUser, onAuthStateChange } from '../services/supabaseClient';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [profile, setProfile] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const initAuth = async () => {
      const { user } = await getCurrentUser();
      if (user) {
        await fetchProfile(user);
      }
      setIsLoading(false);
    };

    initAuth();

    const subscription = onAuthStateChange((event, session) => {
      if (session?.user) {
        fetchProfile(session.user);
      } else {
        setUser(null);
        setProfile(null);
      }
    });

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  const fetchProfile = async (user) => {
    setUser(user);
    try {
      // Assuming a backend endpoint exists to get the profile. 
      // If not, we will need to implement this.
      const response = await fetch('/api/profile', {
        headers: { 'Authorization': `Bearer ${user.id}` } // Simplified
      });
      if (response.ok) {
        const data = await response.json();
        setProfile({
            ...data,
            id: user.id,
            email: user.email
        });
      }
    } catch (err) {
      console.error('Error fetching profile', err);
    }
  };

  return (
    <AuthContext.Provider value={{ user, profile, isLoading }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
