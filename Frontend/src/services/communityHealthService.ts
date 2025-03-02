import { supabase } from '../lib/supabase';

export const communityHealthService = {
  getCommunityHealth: async (region_id: string) => {
    try {
      console.log('Sending request for region:', region_id); // Log outgoing request

      const response = await fetch(`${import.meta.env.VITE_API_URL}/community-health`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ region_id })
      });

      if (!response.ok) {
        throw new Error('Network response was not ok');
      }

      const data = await response.json();
      console.log('Response from backend:', data); // Log incoming response
      return data;
    } catch (error) {
      console.error('Error fetching community health data:', error);
      throw error;
    }
  },

  getChronicDiseaseAnalysis: async (regionId: string) => {
    try {
      console.log('Starting chronic disease analysis request for region:', regionId);
      
      const response = await fetch(`${import.meta.env.VITE_API_URL}/chronic-disease`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ region_id: regionId }),
      });

      console.log('Received response status:', response.status);
      
      if (!response.ok) {
        const errorBody = await response.text();
        console.error('Error response body:', errorBody);
        throw new Error(`Server responded with ${response.status}: ${errorBody}`);
      }

      const data = await response.json();
      console.log('Successful analysis response:', data);
      return data;
    } catch (error) {
      console.error('Error in getChronicDiseaseAnalysis:', error);
      throw new Error(`Failed to fetch analysis: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  },

  getExistingAnalysis: async (regionId: string) => {
    try {
      const { data, error } = await supabase
        .from('region_analysis')
        .select(`
          region_id,
          health_metrics_analysis,
          health_patterns_identified,
          healthcare_recommendations,
          health_indicators_relationships,
          total_records,
          key_features
        `)
        .eq('region_id', regionId)
        .single();

      if (error || !data) {
        return null;
      }

      return {
        analysis_sections: {
          metrics: {
            title: "Health Metrics Analysis",
            content: data.health_metrics_analysis
          },
          patterns: {
            title: "Health Patterns Identified",
            content: data.health_patterns_identified
          },
          recommendations: {
            title: "Healthcare Recommendations",
            content: data.healthcare_recommendations
          },
          relationships: {
            title: "Health Indicators Relationships",
            content: data.health_indicators_relationships
          }
        },
        statistics: {
          total_records: data.total_records,
          features: JSON.parse(data.key_features || '[]'),
          risk_scores: {}
        }
      };
    } catch (error) {
      console.error('Error fetching existing analysis:', error);
      return null;
    }
  },

  generateChronicAnalysis: async (regionId: string) => {
    try {
      // Call Flask server for new analysis
      const response = await fetch(`${import.meta.env.VITE_API_URL}/chronic-disease`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ region_id: regionId }),
      });

      if (!response.ok) {
        throw new Error(`Failed to generate analysis: ${response.statusText}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Error generating analysis:', error);
      throw error;
    }
  },

  getAgeDemographics: async (regionId: string) => {
    try {
      const { data } = await supabase
        .from('appointments')
        .select('age')
        .eq('region_id', regionId);

      return data?.map(d => d.age) || [];
    } catch (error) {
      console.error('Error fetching age demographics:', error);
      return [];
    }
  }
};