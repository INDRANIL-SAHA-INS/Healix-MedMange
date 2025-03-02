import React, { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabase';
import AgeDemographics from '../AgeDemographics';
import IncomeBracketPie from '../IncomeBracketPie';
import { communityHealthService } from '../../services/communityHealthService';
import { BMIAnalysis } from '../BMIAnalysis';
import { VaccinationAnalysis } from '../VaccinationAnalysis';

// Define types for region and patient record
interface Region {
  region_id: string;
  name: string;
}

interface PatientRecord {
  region_id: string;
  body_temperature?: number;
  general_health?: {
    symptom_duration?: string;
  };
  pain_discomfort?: {
    pain_level?: string;
  };
}

interface CommunityData {
  average_age: number;
  total_patients: number;
  patient_names: Array<{
    emotional_state: string;
    sleep_quality: boolean;
    stressful_events: string;
  }>;
}

interface ChronicDiseaseAnalysis {
  analysis_sections: {
    metrics: { title: string; content: string };
    relationships: { title: string; content: string };
    patterns: { title: string; content: string };
    recommendations: { title: string; content: string };
  };
  statistics: {
    total_records: number;
    features: string[];
    risk_scores: Record<string, number>;
  };
}

export const CommunityHealth: React.FC = () => {
  const [regions, setRegions] = useState<Region[]>([]);
  const [selectedRegionId, setSelectedRegionId] = useState<string>(() => {
    if (typeof sessionStorage !== 'undefined') {
      return sessionStorage.getItem('selectedRegionId') || '';
    }
    return '';
  });
  const [patientReports, setPatientReports] = useState<PatientRecord[]>([]);
  const [communityData, setCommunityData] = useState<CommunityData | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'demographic' | 'chronic' | 'bmi'>('demographic');

  // Fetch ages directly from the 'appointments' table
  const [ageData, setAgeData] = useState<number[]>([]);
  const [incomeData, setIncomeData] = useState<string[]>([]);

  // Add new state for chronic disease data
  const [chronicDiseaseData, setChronicDiseaseData] = useState<ChronicDiseaseAnalysis | null>(null);
  const [chronicLoading, setChronicLoading] = useState(false);
  const [chronicError, setChronicError] = useState<string | null>(null);

  // Add new state for BMI data
  const [bmiData, setBmiData] = useState<Array<{
    bmi: number;
    weight: number;
    height: number;
    created_at: string;
  }>>([]);
  const [vaccinationData, setVaccinationData] = useState<Array<{
    age: number;
    gender: string;
    vaccines: string[];
  }>>([]);
  const [bmiLoading, setBmiLoading] = useState(false);
  const [bmiError, setBmiError] = useState<string | null>(null);

  // Add new state for manual analysis
  const [analysisRequested, setAnalysisRequested] = useState(false);

  // Fetch regions from Supabase
  useEffect(() => {
    const fetchRegions = async () => {
      const { data, error } = await supabase.from('regions').select('region_id, name');
      if (error) {
        console.error('Error fetching regions:', error.message);
        return;
      }
      setRegions(data || []);
    };

    fetchRegions();
  }, []);

  // Fetch patient health records based on selected region
  useEffect(() => {
    console.log('Selected Region ID:', selectedRegionId); // Debugging log

    const fetchPatientReports = async () => {
      if (!selectedRegionId) {
        console.log('No region selected');
        return;
      }

      const { data, error } = await supabase
        .from('patient_health_records')
        .select('*')
        .eq('region_id', selectedRegionId); // ✅ String-based comparison

      if (error) {
        console.error('Error fetching patient reports:', error.message);
        return;
      }

      console.log('Fetched patient reports:', data); // Debugging log
      setPatientReports(data || []);
    };

    fetchPatientReports();
  }, [selectedRegionId]);

  useEffect(() => {
    const fetchAges = async () => {
      if (!selectedRegionId) return;
      
      console.log('Fetching ages for region:', selectedRegionId);
      
      const { data, error } = await supabase
        .from('appointments')
        .select('age')
        .eq('region_id', selectedRegionId);

      if (error) {
        console.error('Error fetching ages:', error);
        return;
      }

      console.log('Raw data from Supabase:', data);

      if (data) {
        const validAges = data
          .filter((item) => item.age !== null)
          .map((item) => Number(item.age));
          
        console.log('Processed age data:', validAges);
        console.log('Total number of age records:', validAges.length);
        console.log('Age range:', Math.min(...validAges), 'to', Math.max(...validAges));
        
        setAgeData(validAges);
      }
    };

    fetchAges();
  }, [selectedRegionId]);

  useEffect(() => {
    const fetchIncomeData = async () => {
      if (!selectedRegionId) return;
      
      const { data, error } = await supabase
        .from('patient_health_records')
        .select('income_level')
        .eq('region_id', selectedRegionId);

      if (error) {
        console.error('Error fetching income data:', error);
        return;
      }

      if (data) {
        const validIncomes = data
          .filter(item => item.income_level)
          .map(item => item.income_level);
        setIncomeData(validIncomes);
      }
    };

    fetchIncomeData();
  }, [selectedRegionId]);

  // Add new handler for manual analysis
  const handleAnalyze = () => {
    setAnalysisRequested(true);
  };

  // Update the useEffect for chronic disease data
  useEffect(() => {
    const fetchChronicData = async () => {
      if (!selectedRegionId) return;
      
      setChronicLoading(true);
      setChronicError(null);
      
      try {
        if (analysisRequested) {
          // Only call Flask server when Analyze button is clicked
          const newData = await communityHealthService.generateChronicAnalysis(selectedRegionId);
          setChronicDiseaseData(newData);
        } else {
          // Check Supabase for existing analysis
          const existingData = await communityHealthService.getExistingAnalysis(selectedRegionId);
          setChronicDiseaseData(existingData);
        }
      } catch (error) {
        setChronicError(analysisRequested 
          ? 'Failed to generate new analysis' 
          : 'Failed to load existing analysis');
        console.error('Error:', error);
      } finally {
        setChronicLoading(false);
        setAnalysisRequested(false);
      }
    };

    fetchChronicData();
  }, [analysisRequested, selectedRegionId]);

  // Update BMI useEffect to fetch vaccination data with age from appointments
  useEffect(() => {
    const fetchHealthData = async () => {
      if (!selectedRegionId || activeTab !== 'bmi') return;
      
      setBmiLoading(true);
      setBmiError(null);
      
      try {
        // Fetch BMI data (existing)
        const { data: bmiData, error: bmiError } = await supabase
          .from('patient_health_records')
          .select('bmi, weight, height, created_at, patient_id')
          .eq('region_id', selectedRegionId)
          .not('bmi', 'is', null);

        if (bmiError) throw bmiError;

        // Fetch Vaccination data with patient IDs
        const { data: vaxData, error: vaxError } = await supabase
          .from('patient_health_records')
          .select('patient_id, gender, childhood_vaccines, older_vaccines, recent_vaccines, vaccination_history')
          .eq('region_id', selectedRegionId);

        if (vaxError) throw vaxError;

        // Get all unique patient IDs from both datasets
        const patientIds = [
          ...new Set([
            ...(bmiData?.map(record => record.patient_id) || []),
            ...(vaxData?.map(record => record.patient_id) || [])
          ])
        ].filter(Boolean);

        // Fetch ages from appointments table
        const { data: appointmentsData, error: appointmentsError } = await supabase
          .from('appointments')
          .select('id, age')
          .in('id', patientIds);

        if (appointmentsError) throw appointmentsError;

        // Create age map: { patient_id: age }
        const ageMap = new Map();
        appointmentsData?.forEach(appointment => {
          ageMap.set(appointment.id, appointment.age);
        });

        // Process vaccination data with mapped ages
        const processedVaxData = vaxData.map(record => ({
          age: ageMap.get(record.patient_id) || 0,
          gender: record.gender || 'unknown',
          vaccines: [
            ...(record.childhood_vaccines || []),
            ...(record.older_vaccines || []),
            ...(record.recent_vaccines || []),
            ...(record.vaccination_history || [])
          ]
        }));

        setBmiData(bmiData || []);
        setVaccinationData(processedVaxData);
      } catch (error) {
        setBmiError('Failed to fetch health data');
        console.error('Error:', error);
      } finally {
        setBmiLoading(false);
      }
    };

    fetchHealthData();
  }, [selectedRegionId, activeTab]);

  // Update the region selection handler
  const handleRegionChange = async (e: React.ChangeEvent<HTMLSelectElement>) => {
    const regionId = e.target.value;
    setSelectedRegionId(regionId);
    sessionStorage.setItem('selectedRegionId', regionId);
    setChronicDiseaseData(null); // Clear previous region's data
    setAnalysisRequested(false); // Reset analysis request
    
    if (regionId) {
      setLoading(true);
      setError(null);
      try {
        // const data = await communityHealthService.getCommunityHealth(regionId);
        // console.log('Received from backend:', data);
        // setCommunityData(data);
      } catch (err) {
        setError('Failed to fetch community health data');
        console.error(err);
      } finally {
        setLoading(false);
      }
    } else {
      setCommunityData(null);
    }
  };

  return (
    <div className="bg-gradient-to-br from-gray-50 to-blue-50 min-h-screen p-6">
      {/* Header Section */}
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-800">Community Health Dashboard</h1>
        <select
          value={selectedRegionId}
          onChange={handleRegionChange}
          className="p-2 text-sm border rounded-lg bg-white/90 backdrop-blur-sm shadow-md hover:shadow-lg transition-shadow duration-200 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 w-48"
        >
          <option value="">Select Region</option>
          {regions.map((region) => (
            <option key={region.region_id} value={region.region_id}>
              {region.name}
            </option>
          ))}
        </select>
      </div>

      {/* Analysis Tabs */}
      <div className="grid grid-cols-3 gap-4 mb-6">
        <button
          onClick={() => setActiveTab('demographic')}
          className={`p-4 text-sm font-medium rounded-t-xl transition-all duration-300 ${
            activeTab === 'demographic'
              ? 'bg-blue-600 text-white shadow-lg transform scale-105'
              : 'bg-white/90 backdrop-blur-sm text-gray-600 hover:bg-blue-50 border border-gray-200 hover:shadow-md'
          }`}
        >
          Demographic & Social
        </button>
        <button
          onClick={() => setActiveTab('chronic')}
          className={`p-4 text-sm font-medium rounded-t-xl transition-all duration-300 ${
            activeTab === 'chronic'
              ? 'bg-green-600 text-white shadow-lg transform scale-105'
              : 'bg-white/90 backdrop-blur-sm text-gray-600 hover:bg-green-50 border border-gray-200 hover:shadow-md'
          }`}
        >
          Chronic Disease
        </button>
        <button
          onClick={() => setActiveTab('bmi')}
          className={`p-4 text-sm font-medium rounded-t-xl transition-all duration-300 ${
            activeTab === 'bmi'
              ? 'bg-purple-600 text-white shadow-lg transform scale-105'
              : 'bg-white/90 backdrop-blur-sm text-gray-600 hover:bg-purple-50 border border-gray-200 hover:shadow-md'
          }`}
        >
          BMI & Vaccination
        </button>
      </div>

      {/* Content Area */}
      <div className="bg-white/90 backdrop-blur-sm rounded-xl shadow-lg p-6 transition-all duration-300 hover:shadow-xl">
        {activeTab === 'demographic' && (
          <div className="space-y-6">
            {/* Age Demographics */}
            <AgeDemographics ages={ageData} />
            
            {/* Income Distribution */}
            <div className="mt-6">
              <IncomeBracketPie incomeData={incomeData} />
            </div>
          </div>
        )}

        {activeTab === 'chronic' && (
          <div className="p-6 space-y-6">
            {/* Analysis Button - Now always visible */}
            <div className="flex justify-end mb-4">
              <button
                onClick={handleAnalyze}
                disabled={chronicLoading}
                className={`
                  px-6 py-3 rounded-lg transition-colors
                  ${chronicLoading 
                    ? 'bg-gray-400 cursor-not-allowed' 
                    : 'bg-green-600 hover:bg-green-700'
                  } 
                  text-white
                `}
              >
                {chronicLoading ? 'Analyzing...' : 'Analyze Region'}
              </button>
            </div>

            {chronicLoading ? (
              <div className="text-center py-8">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-500 mx-auto"></div>
                <p className="mt-4 text-gray-600">Loading analysis...</p>
              </div>
            ) : chronicError ? (
              <div className="text-center py-8 text-red-500">
                <p>{chronicError}</p>
              </div>
            ) : chronicDiseaseData ? (
              <div className="space-y-8">
                {/* Statistics Summary */}
                <div className="bg-blue-50 p-6 rounded-xl shadow-sm border border-blue-200">
                  <h3 className="text-lg font-semibold text-blue-800 mb-4">Analysis Summary</h3>
                  <div className="grid grid-cols-3 gap-4">
                    <div className="bg-white p-4 rounded-lg">
                      <p className="text-sm text-gray-600">Total Records Analyzed</p>
                      <p className="text-2xl font-bold text-blue-600">
                        {chronicDiseaseData?.statistics.total_records || 0}
                      </p>
                    </div>
                    <div className="bg-white p-4 rounded-lg">
                      <p className="text-sm text-gray-600">Key Features</p>
                      <div className="text-sm text-blue-600">
                        {chronicDiseaseData?.statistics.features.slice(0, 3).join(', ')}...
                      </div>
                    </div>
                  </div>
                </div>

                {/* Analysis Sections */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {chronicDiseaseData && Object.entries(chronicDiseaseData.analysis_sections).map(([key, section]) => (
                    <div 
                      key={key}
                      className="bg-white p-6 rounded-xl shadow-sm border border-gray-200 hover:shadow-md transition-shadow"
                    >
                      <h3 className="text-lg font-semibold text-gray-800 mb-4">
                        {section?.title || 'Untitled Section'}
                      </h3>
                      <div className="prose text-gray-600 max-w-none">
                        {section?.content ? 
                          section.content.split('\n').map((line, index) => (
                            <p key={index} className="mb-3">{line}</p>
                          ))
                          : 
                          <p>No content available</p>
                        }
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ) : (
              <div className="text-center py-8">
                <p className="text-gray-500 text-sm">
                  Click "Analyze Region" to generate chronic disease analysis for selected region
                </p>
              </div>
            )}
          </div>
        )}

        {activeTab === 'bmi' && (
          <div className="p-6 space-y-6">
            {bmiLoading ? (
              <div className="text-center py-8">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-500 mx-auto"></div>
                <p className="mt-4 text-gray-600">Loading health analysis...</p>
              </div>
            ) : bmiError ? (
              <div className="text-center py-8 text-red-500">
                <p>{bmiError}</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 gap-8">
                {/* BMI Section */}
                <div className="bg-gradient-to-br from-blue-50 to-blue-100 p-8 rounded-2xl shadow-lg border-2 border-blue-200">
                  <div className="max-w-3xl mx-auto space-y-6">
                    <div className="flex items-center gap-3">
                      <div className="h-9 w-1.5 bg-blue-600 rounded-full"></div>
                      <h3 className="text-xl font-bold text-blue-900">Body Composition Analysis</h3>
                    </div>
                    <div className="bg-white/95 backdrop-blur-sm p-6 rounded-xl shadow-inner border border-blue-100">
                      <BMIAnalysis data={bmiData} />
                    </div>
                  </div>
                </div>

                {/* Vaccination Section */}
                <div className="bg-gradient-to-br from-green-50 to-emerald-100 p-8 rounded-2xl shadow-lg border-2 border-emerald-200">
                  <div className="max-w-3xl mx-auto space-y-6">
                    <div className="flex items-center gap-3">
                      <div className="h-9 w-1.5 bg-emerald-600 rounded-full"></div>
                      <h3 className="text-xl font-bold text-emerald-900">Immunization Coverage</h3>
                    </div>
                    <div className="bg-white/95 backdrop-blur-sm p-6 rounded-xl shadow-inner border border-emerald-100">
                      <VaccinationAnalysis data={vaccinationData} />
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};