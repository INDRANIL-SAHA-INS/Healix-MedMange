import { supabase } from '../lib/supabase';

interface AnalysisResponse {
  initial_analysis: string;
  recommendations: string;
}

export const patientAnalysisService = {
  getExistingAnalysis: async (visitPatientId: string): Promise<AnalysisResponse | null> => {
    try {
      const { data, error } = await supabase
        .from('patient_analysis')
        .select('analysis')
        .eq('visit_patient_id', visitPatientId)
        .single();

      if (error || !data) {
        return null;
      }

      return { analysis: data.analysis };
    } catch (error) {
      console.error('Error fetching existing analysis:', error);
      return null;
    }
  },

  generateAnalysis: async (visitPatientId: string): Promise<AnalysisResponse> => {
    try {
      const apiUrl = `${import.meta.env.VITE_API_URL}/analysis`;
      console.log('Attempting to fetch from:', apiUrl);
      
      const response = await fetch(apiUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ visit_patient_id: visitPatientId }),
      });

      if (!response.ok) {
        throw new Error('Failed to generate analysis');
      }

      return await response.json();
    } catch (error) {
      console.error('Network error details:', {
        error,
        url: apiUrl,
        timestamp: new Date().toISOString()
      });
      throw error;
    }
  }
};