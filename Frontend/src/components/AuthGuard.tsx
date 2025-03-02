import React, { createContext, useContext, useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabase';

interface DoctorContextType {
  doctor: any | null;
}

const DoctorContext = createContext<DoctorContextType | null>(null);

export const DoctorProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [doctor, setDoctor] = useState<any | null>(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const { data: { session }, error } = await supabase.auth.getSession();
        console.log('Current session:', session); 

        if (error || !session) {
          console.error('Auth error or no session:', error);
          navigate('/doctor/login');
          return;
        }

        const { data: doctorData, error: doctorError } = await supabase
          .from('doctors')
          .select('*')
          .eq('id', session.user.id)
          .single();

        console.log('Doctor data:', doctorData); 

        if (doctorError || !doctorData) {
          console.error('Doctor fetch error:', doctorError);
          navigate('/doctor/login');
          return;
        }

        setDoctor(doctorData);
        setLoading(false);
      } catch (err) {
        console.error('Auth check error:', err);
        navigate('/doctor/login');
      }
    };

    checkAuth();
  }, [navigate]);

  if (loading) {
    return <div>Loading...</div>;
  }

  return (
    <DoctorContext.Provider value={{ doctor }}>
      {children}
    </DoctorContext.Provider>
  );
};

export const useDoctor = () => {
  const context = useContext(DoctorContext);
  if (!context) {
    throw new Error('useDoctor must be used within a DoctorProvider');
  }
  return context;
};

export const AuthGuard: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  return <DoctorProvider>{children}</DoctorProvider>;
};