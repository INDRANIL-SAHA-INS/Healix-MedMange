import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabase';

export const AssistantAuthGuard = ({ children }: { children: React.ReactNode }) => {
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const { data: { session }, error } = await supabase.auth.getSession();
        console.log('Current session:', session); // Log session

        if (error || !session) {
          navigate('/assistant/login');
          return;
        }

        // Get stored assistant data
        const storedAssistant = localStorage.getItem('assistant');
        if (!storedAssistant) {
          // If no stored data, fetch from database
          const { data: assistantData, error: assistantError } = await supabase
            .from('assistants')
            .select('*')
            .eq('email', session.user.email)
            .single();

          console.log('Fetched assistant data:', assistantData); // Log fetched data

          if (assistantError || !assistantData) {
            console.error('Assistant fetch error:', assistantError); // Log error
            throw new Error('Assistant account not found');
          }

          localStorage.setItem('assistant', JSON.stringify(assistantData));
          localStorage.setItem('userRole', 'assistant');
        } else {
          console.log('Stored assistant data:', JSON.parse(storedAssistant)); // Log stored data
        }

        setLoading(false);
      } catch (err) {
        console.error('Auth check error:', err);
        navigate('/assistant/login');
      }
    };

    checkAuth();
  }, [navigate]);

  if (loading) {
    return <div>Loading...</div>;
  }

  return <>{children}</>;
};