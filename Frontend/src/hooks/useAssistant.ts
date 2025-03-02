import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { useNavigate } from 'react-router-dom';

interface Assistant {
  id: string;
  username: string;
  email: string;
  region_id: string;
  region_name: string;
  phone_number: string;
  joining_date: string;
  ref_id: string;
}

export const useAssistant = () => {
  const [assistant, setAssistant] = useState<Assistant | null>(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchAssistant = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        
        if (!session) {
          setLoading(false);
          navigate('/assistant/login');
          return;
        }

        const storedAssistant = localStorage.getItem('assistant');
        if (storedAssistant) {
          setAssistant(JSON.parse(storedAssistant));
          setLoading(false);
          return;
        }

        const { data: assistantData, error } = await supabase
          .from('assistants')
          .select('*')
          .eq('id', session.user.id)
          .single();

        if (error || !assistantData) {
          console.error('Error fetching assistant:', error);
          navigate('/assistant/login');
          return;
        }

        setAssistant(assistantData);
        localStorage.setItem('assistant', JSON.stringify(assistantData));
      } catch (error) {
        console.error('Error in useAssistant:', error);
        navigate('/assistant/login');
      } finally {
        setLoading(false);
      }
    };

    fetchAssistant();
  }, [navigate]);

  return { assistant, loading };
};