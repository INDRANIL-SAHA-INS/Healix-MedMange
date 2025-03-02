import { useParams } from 'react-router-dom';
import { supabase } from '../../lib/supabase';
import { useEffect, useState } from 'react';
import { patientAnalysisService } from '../../services/patientAnalysisService';

interface HealthRecord {
  id: string;
  visit_patient_id: string;
  created_at: string;
  // Add other fields as needed from your table
  gender?: string;
  occupation?: string;
  education_level?: string;
  heart_rate?: number;
  blood_pressure?: string;
  temperature?: number;
  respiratory_rate?: number;
  stomach_pain?: boolean;
  nausea?: boolean;
  diabetes?: boolean;
  heart_disease?: boolean;
  medication?: Array<{
    medicine_name: string;
    dosage: string;
    frequency: string;
    duration: number;
  }>;
  general_health?: {
    main_complaint: string;
    symptom_duration: string;
    previous_symptoms: boolean;
  };
  pain_discomfort?: {
    pain_location: string;
    pain_level: number;
  };
  chronic_conditions?: {
    conditions: string[];
    current_medications: string;
  };
  mental_health?: {
    emotional_state: string;
    sleep_quality: boolean;
  };
  body_temperature?: number;
  bmi?: number;
  oxygen_saturation?: number;
}

interface AnalysisResponse {
  initial_analysis: string;
  recommendations: string;
}

export default function CheckHistory() {
  const { visitPatientId } = useParams<{ visitPatientId: string }>();
  const [healthRecords, setHealthRecords] = useState<HealthRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [analysisData, setAnalysisData] = useState<AnalysisResponse | null>(null);
  const [analysisLoading, setAnalysisLoading] = useState(false);
  const [analysisError, setAnalysisError] = useState<string | null>(null);

  useEffect(() => {
    if (!visitPatientId) return;

    const fetchHealthRecords = async () => {
      try {
        const { data, error } = await supabase
          .from('patient_health_records')
          .select('*')
          .eq('visit_patient_id', visitPatientId)
          .order('created_at', { ascending: false });

        if (error) throw error;

        // Exclude the most recent record if there are multiple entries
        const filteredRecords = data.length > 1 ? data.slice(1) : [];
        setHealthRecords(filteredRecords);
      } catch (err) {
        setError('Failed to load health records');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchHealthRecords();
  }, [visitPatientId]);

  const groupRecordsByDate = (records: HealthRecord[]) => {
    return records.reduce((groups: Record<string, HealthRecord[]>, record) => {
      const date = new Date(record.created_at).toISOString().split('T')[0];
      if (!groups[date]) groups[date] = [];
      groups[date].push(record);
      return groups;
    }, {});
  };

  const handleAnalyze = async () => {
    if (!visitPatientId) return;
    
    setAnalysisLoading(true);
    setAnalysisError(null);
    
    try {
      const data = await patientAnalysisService.generateAnalysis(visitPatientId);
      setAnalysisData(data);
    } catch (error: any) {
      setAnalysisError(error.message || 'Failed to generate analysis');
      console.error('Analysis error:', error);
    } finally {
      setAnalysisLoading(false);
    }
  };

  const groupedEntries = groupRecordsByDate(healthRecords);

  if (!visitPatientId) {
    return <div className="p-8 text-red-500">Invalid patient ID</div>;
  }
  if (loading) return <div className="p-8 text-center">Loading...</div>;
  if (error) return <div className="p-8 text-red-500 text-center">{error}</div>;
  if (healthRecords.length === 0) return <div className="p-8 text-center">No previous health records found</div>;

  return (
    <div className="p-8 max-w-7xl mx-auto">
      <h1 className="text-3xl font-bold mb-8">Patient Health History</h1>
      
      <div className="mb-8">
        <div className="bg-gradient-to-r from-indigo-50 to-indigo-100 p-6 rounded-2xl shadow-sm border border-indigo-200">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-xl font-bold text-indigo-900">Patient Analysis</h2>
            <button
              onClick={handleAnalyze}
              disabled={analysisLoading}
              className={`
                px-4 py-2 rounded-lg transition-colors
                ${analysisLoading 
                  ? 'bg-gray-400 cursor-not-allowed' 
                  : 'bg-indigo-600 hover:bg-indigo-700'}
                text-white font-medium
              `}
            >
              {analysisLoading ? 'Analyzing...' : 'Generate Analysis'}
            </button>
          </div>

          {analysisLoading ? (
            <div className="text-center py-8">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-500 mx-auto"></div>
              <p className="mt-4 text-gray-600">Generating analysis...</p>
            </div>
          ) : analysisError ? (
            <div className="text-center py-8 text-red-500">
              <p>{analysisError}</p>
            </div>
          ) : analysisData ? (
            <div className="bg-white p-6 rounded-xl shadow-sm border border-indigo-100 space-y-6">
              <div className="prose text-gray-600 max-w-none">
                <div className="mb-6">
                  <h3 className="text-lg font-semibold text-indigo-900 mb-3">Analysis</h3>
                  {analysisData.initial_analysis.split('\n').map((line, index) => (
                    <p key={index} className="mb-2">{line}</p>
                  ))}
                </div>
                
                <div>
                  <h3 className="text-lg font-semibold text-indigo-900 mb-3">Recommendations</h3>
                  {analysisData.recommendations.split('\n').map((line, index) => (
                    <p key={index} className="mb-2">{line}</p>
                  ))}
                </div>
              </div>
            </div>
          ) : (
            <div className="text-center py-8">
              <p className="text-gray-500">
                Click "Generate Analysis" to analyze patient health history
              </p>
            </div>
          )}
        </div>
      </div>

      {Object.entries(groupedEntries).map(([date, records]) => (
        <div key={date} className="mb-8">
          <h2 className="text-xl font-bold mb-4 text-gray-700">
            {new Date(date).toLocaleDateString('en-US', {
              year: 'numeric',
              month: 'long',
              day: 'numeric'
            })}
          </h2>
          
          {(records as HealthRecord[]).map((record, index) => (
            <div key={index} className="mb-6 last:mb-0 space-y-8">
              {/* Vital Signs */}
              <section className="bg-blue-50/80 p-6 rounded-2xl shadow-sm border border-blue-200 backdrop-blur-sm">
                <h3 className="text-lg font-medium text-blue-900 mb-4 font-[600] tracking-wide">
                  Vital Signs
                </h3>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                  <div>
                    <p className="text-sm text-blue-600">Heart Rate</p>
                    <p className="text-xl font-medium">{record.heart_rate || 'N/A'} BPM</p>
                  </div>
                  <div>
                    <p className="text-sm text-blue-600">Blood Pressure</p>
                    <p className="text-xl font-medium">{record.blood_pressure || 'N/A'}</p>
                  </div>
                  <div>
                    <p className="text-sm text-blue-600">Temperature</p>
                    <p className="text-xl font-medium">{record.body_temperature || 'N/A'} °C</p>
                  </div>
                  <div>
                    <p className="text-sm text-blue-600">BMI</p>
                    <p className="text-xl font-medium">{record.bmi || 'N/A'}</p>
                  </div>
                  <div>
                    <p className="text-sm text-blue-600">Oxygen Saturation</p>
                    <p className="text-xl font-medium">{record.oxygen_saturation || 'N/A'}%</p>
                  </div>
                </div>
              </section>

              {/* General Health */}
              <section className="bg-green-50/80 p-6 rounded-2xl shadow-sm border border-green-200 backdrop-blur-sm">
                <h3 className="text-lg font-medium text-green-900 mb-4 font-[600] tracking-wide">
                  General Health
                </h3>
                <div className="space-y-4">
                  <div>
                    <p className="text-sm text-green-600">Main Complaint</p>
                    <p className="text-gray-900">{record.general_health?.main_complaint || 'N/A'}</p>
                  </div>
                  <div>
                    <p className="text-sm text-green-600">Symptom Duration</p>
                    <p className="text-gray-900">{record.general_health?.symptom_duration || 'N/A'}</p>
                  </div>
                  <div>
                    <p className="text-sm text-green-600">Previous Symptoms</p>
                    <p className="text-gray-900">{record.general_health?.previous_symptoms ? 'Yes' : 'No'}</p>
                  </div>
                </div>
              </section>

              {/* Pain & Discomfort */}
              <section className="bg-orange-50/80 p-6 rounded-2xl shadow-sm border border-orange-200 backdrop-blur-sm">
                <h3 className="text-lg font-medium text-orange-900 mb-4 font-[600] tracking-wide">
                  Pain & Discomfort
                </h3>
                <div className="space-y-4">
                  <div>
                    <p className="text-sm text-orange-600">Pain Location</p>
                    <p className="text-gray-900">{record.pain_discomfort?.pain_location || 'N/A'}</p>
                  </div>
                  <div>
                    <p className="text-sm text-orange-600">Pain Level</p>
                    <div className="w-full bg-gray-200 rounded-full h-2.5">
                      <div 
                        className="bg-blue-600 h-2.5 rounded-full"
                        style={{ width: `${(record.pain_discomfort?.pain_level || 0) * 10}%` }}
                      ></div>
                    </div>
                    <p className="mt-1 text-sm text-gray-900">{record.pain_discomfort?.pain_level || 0}/10</p>
                  </div>
                </div>
              </section>

              {/* Chronic Conditions */}
              <section className="bg-purple-50/80 p-6 rounded-2xl shadow-sm border border-purple-200 backdrop-blur-sm">
                <h3 className="text-lg font-medium text-purple-900 mb-4 font-[600] tracking-wide">
                  Chronic Conditions
                </h3>
                <div className="space-y-4">
                  <div>
                    <p className="text-sm text-purple-600">Conditions</p>
                    <div className="flex flex-wrap gap-2 mt-1">
                      {record.chronic_conditions?.conditions?.map((condition: string, index: number) => (
                        <span 
                          key={index}
                          className="px-2 py-1 bg-purple-100 text-purple-800 rounded-full text-sm"
                        >
                          {condition}
                        </span>
                      )) || 'None reported'}
                    </div>
                  </div>
                  <div>
                    <p className="text-sm text-purple-600">Current Medications</p>
                    <p className="text-gray-900">{record.chronic_conditions?.current_medications || 'None'}</p>
                  </div>
                </div>
              </section>

              {/* Mental Health */}
              <section className="bg-pink-50/80 p-6 rounded-2xl shadow-sm border border-pink-200 backdrop-blur-sm">
                <h3 className="text-lg font-medium text-pink-900 mb-4 font-[600] tracking-wide">
                  Mental Health
                </h3>
                <div className="space-y-4">
                  <div>
                    <p className="text-sm text-pink-600">Emotional State</p>
                    <p className="text-gray-900">{record.mental_health?.emotional_state || 'N/A'}</p>
                  </div>
                  <div>
                    <p className="text-sm text-pink-600">Sleep Quality</p>
                    <p className="text-gray-900">{record.mental_health?.sleep_quality ? 'Good' : 'Poor'}</p>
                  </div>
                </div>
              </section>
            </div>
          ))}
        </div>
      ))}
    </div>
  );
}
