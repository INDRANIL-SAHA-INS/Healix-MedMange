import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { useNavigate } from 'react-router-dom';

export const useDoctor = () => {
  const [doctor, setDoctor] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchDoctor = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        
        if (!session) {
          navigate('/doctor/login');
          return;
        }

        // Get doctor data using ref_id from user metadata
        const { data, error } = await supabase
          .from('doctors')
          .select('*')
          .eq('ref_id', session.user.user_metadata.ref_id)
          .single();

        if (error || !data) {
          throw error;
        }

        setDoctor(data);
        // Store doctor data in localStorage
        localStorage.setItem('doctor', JSON.stringify(data));
        
      } catch (error) {
        console.error('Error fetching doctor:', error);
        navigate('/doctor/login');
      } finally {
        setLoading(false);
      }
    };

    fetchDoctor();
  }, [navigate]);

  return { doctor, loading };
};