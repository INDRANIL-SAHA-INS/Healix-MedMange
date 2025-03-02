import React, { useState, useEffect } from 'react';
import { X, Edit2, Trash2, Activity } from 'lucide-react';
import { supabase } from '../../lib/supabase';

interface PatientHealthReportProps {
  patientId: string;
  onClose: () => void;
  onEdit?: () => void;
}

export const PatientHealthReport: React.FC<PatientHealthReportProps> = ({ patientId, onClose, onEdit }) => {
  const [healthRecord, setHealthRecord] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchHealthRecord();
  }, [patientId]);

  const fetchHealthRecord = async () => {
    try {
      const { data, error } = await supabase
        .from('patient_health_records')
        .select('*')
        .eq('patient_id', patientId)
        .order('created_at', { ascending: false })
        .limit(1)
        .single();

      if (error) throw error;
      setHealthRecord(data);
    } catch (err) {
      console.error('Error fetching health record:', err);
      setError('Failed to load health record');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!confirm('Are you sure you want to delete this health record?')) return;

    try {
      const { error } = await supabase
        .from('patient_health_records')
        .delete()
        .eq('id', healthRecord.id);

      if (error) throw error;
      onClose();
    } catch (err) {
      console.error('Error deleting health record:', err);
      setError('Failed to delete health record');
    }
  };

  if (loading) {
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center">
        <div className="bg-white p-6 rounded-lg">
          <p>Loading health record...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto">
        <div className="sticky top-0 bg-white p-6 border-b z-10">
          <div className="flex justify-between items-center">
            <div className="flex items-center">
              <Activity className="h-6 w-6 text-blue-600 mr-2" />
              <h2 className="text-2xl font-semibold text-gray-900">Health Report</h2>
            </div>
            <div className="flex items-center space-x-4">
              <button
                onClick={onEdit}
                className="text-blue-600 hover:text-blue-700"
              >
                <Edit2 className="h-5 w-5" />
              </button>
              <button
                onClick={handleDelete}
                className="text-red-600 hover:text-red-700"
              >
                <Trash2 className="h-5 w-5" />
              </button>
              <button onClick={onClose}>
                <X className="h-6 w-6 text-gray-500 hover:text-gray-700" />
              </button>
            </div>
          </div>
          {error && (
            <div className="mt-4 p-4 bg-red-50 text-red-800 rounded-md">
              {error}
            </div>
          )}
        </div>

        <div className="p-6 space-y-8">
          {healthRecord ? (
            <>
              {/* Vital Signs */}
              <section>
                <h3 className="text-lg font-medium text-gray-900 mb-4">Vital Signs</h3>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                  <div className="bg-blue-50 p-4 rounded-lg">
                    <p className="text-sm text-gray-500">Patient ID</p>
                    <p className="text-lg font-medium">
                      {healthRecord?.visit_patient_id || 'N/A'}
                    </p>
                  </div>
                  <div className="bg-blue-50 p-4 rounded-lg">
                    <p className="text-sm text-gray-500">Heart Rate</p>
                    <p className="text-lg font-medium">{healthRecord.heart_rate || 'N/A'} BPM</p>
                  </div>
                  <div className="bg-blue-50 p-4 rounded-lg">
                    <p className="text-sm text-gray-500">Blood Pressure</p>
                    <p className="text-lg font-medium">{healthRecord.blood_pressure || 'N/A'}</p>
                  </div>
                  <div className="bg-blue-50 p-4 rounded-lg">
                    <p className="text-sm text-gray-500">Temperature</p>
                    <p className="text-lg font-medium">{healthRecord.body_temperature || 'N/A'} °C</p>
                  </div>
                  <div className="bg-blue-50 p-4 rounded-lg">
                    <p className="text-sm text-gray-500">BMI</p>
                    <p className="text-lg font-medium">{healthRecord.bmi || 'N/A'}</p>
                  </div>
                  <div className="bg-blue-50 p-4 rounded-lg">
                    <p className="text-sm text-gray-500">Oxygen Saturation</p>
                    <p className="text-lg font-medium">{healthRecord.oxygen_saturation || 'N/A'}%</p>
                  </div>
                </div>
              </section>

              {/* General Health */}
              <section>
                <h3 className="text-lg font-medium text-gray-900 mb-4">General Health</h3>
                <div className="space-y-4">
                  <div>
                    <p className="text-sm text-gray-500">Main Complaint</p>
                    <p className="text-gray-900">{healthRecord.general_health?.main_complaint || 'N/A'}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Symptom Duration</p>
                    <p className="text-gray-900">{healthRecord.general_health?.symptom_duration || 'N/A'}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Previous Symptoms</p>
                    <p className="text-gray-900">{healthRecord.general_health?.previous_symptoms ? 'Yes' : 'No'}</p>
                  </div>
                </div>
              </section>

              {/* Pain & Discomfort */}
              <section>
                <h3 className="text-lg font-medium text-gray-900 mb-4">Pain & Discomfort</h3>
                <div className="space-y-4">
                  <div>
                    <p className="text-sm text-gray-500">Pain Location</p>
                    <p className="text-gray-900">{healthRecord.pain_discomfort?.pain_location || 'N/A'}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Pain Level</p>
                    <div className="w-full bg-gray-200 rounded-full h-2.5">
                      <div 
                        className="bg-blue-600 h-2.5 rounded-full"
                        style={{ width: `${(healthRecord.pain_discomfort?.pain_level || 0) * 10}%` }}
                      ></div>
                    </div>
                    <p className="mt-1 text-sm text-gray-900">{healthRecord.pain_discomfort?.pain_level || 0}/10</p>
                  </div>
                </div>
              </section>

              {/* Chronic Conditions */}
              <section>
                <h3 className="text-lg font-medium text-gray-900 mb-4">Chronic Conditions</h3>
                <div className="space-y-4">
                  <div>
                    <p className="text-sm text-gray-500">Conditions</p>
                    <div className="flex flex-wrap gap-2 mt-1">
                      {healthRecord.chronic_conditions?.conditions?.map((condition: string, index: number) => (
                        <span 
                          key={index}
                          className="px-2 py-1 bg-blue-100 text-blue-800 rounded-full text-sm"
                        >
                          {condition}
                        </span>
                      )) || 'None reported'}
                    </div>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Current Medications</p>
                    <p className="text-gray-900">{healthRecord.chronic_conditions?.current_medications || 'None'}</p>
                  </div>
                </div>
              </section>

              {/* Mental Health */}
              <section>
                <h3 className="text-lg font-medium text-gray-900 mb-4">Mental Health</h3>
                <div className="space-y-4">
                  <div>
                    <p className="text-sm text-gray-500">Emotional State</p>
                    <p className="text-gray-900">{healthRecord.mental_health?.emotional_state || 'N/A'}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Sleep Quality</p>
                    <p className="text-gray-900">{healthRecord.mental_health?.sleep_quality ? 'Good' : 'Poor'}</p>
                  </div>
                </div>
              </section>
            </>
          ) : (
            <div className="text-center py-8">
              <p className="text-gray-500">No health record found for this patient.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};