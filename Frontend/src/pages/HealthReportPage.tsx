import React, { useEffect, useState, useCallback } from 'react';
import { useParams } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import {
  Activity, Heart, User, AlertCircle,
  Utensils, Stethoscope, Dumbbell, HeartPulse, Brain,
  Pill, Circle
} from 'lucide-react';

interface PatientHealthData {
  id: string;
  patient_id: string;
  patient_name: string;
  patient_phone: string;
  patient_email: string;
  patient_address: string;
  region_name: string;
  health_record?: HealthRecord;
}

interface HealthRecord {
  id: string;
  patient_id: string;
  created_at: string;
  updated_at: string;
  heart_rate?: number;
  blood_pressure?: string;
  respiratory_rate?: number;
  body_temperature?: number;
  weight?: number;
  height?: number;
  bmi?: number;
  blood_glucose?: number;
  oxygen_saturation?: number;
  pain_level?: number;
  current_medications?: string[];
  allergies?: string[];
  general_health: Record<string, unknown>;
  pain_discomfort: Record<string, unknown>;
  digestion_appetite: Record<string, unknown>;
  chronic_conditions: Record<string, unknown>;
  lifestyle_habits: Record<string, unknown>;
  womens_health: Record<string, unknown>;
  family_community_health: Record<string, unknown>;
  mental_health: Record<string, unknown>;
  heart_health: Record<string, unknown>;
  gender?: string;
  occupation?: string;
  education_level?: string;
  income_level?: string;
  family_size?: string;
  housing_condition?: string;
  water_access?: string;
  toilet_access?: string;
  vaccination_history?: string[];
  childhood_vaccines?: string[];
  older_vaccines?: string[];
  recent_vaccines?: string[];
  major_infections?: string[];
  family_illness_history?: string[];
  lifestyle_advice?: string[];
  lab_tests?: string[];
  follow_up_date?: string;
  medication?: string[];
}

// Move the Section component definition before HealthReportPage
const Section: React.FC<{ title: string; icon: React.ReactNode; children: React.ReactNode }> = ({ title, icon, children }) => (
  <div className="bg-blue-50 p-6 rounded-lg border-2 border-blue-100">
    <div className="flex items-center mb-4">
      {icon && React.cloneElement(icon as React.ReactElement<any>, { className: "h-6 w-6 text-blue-600" })}
      <h3 className="text-xl font-semibold ml-2 text-blue-800">{title}</h3>
    </div>
    {children}
  </div>
);

// Move the DetailItem component definition before HealthReportPage
const DetailItem: React.FC<{ label: string; value: any }> = ({ label, value }) => {
  if (!value) return null; // Skip rendering if value is undefined/null

  // For long text content
  if (typeof value === 'string' && value.length > 80) {
    return (
      <div className="col-span-full bg-blue-100 p-4 rounded-lg">
        <div className="flex flex-col md:flex-row gap-4 md:items-start">
          <div className="md:w-1/4">
            <p className="text-sm font-medium text-blue-800">{label}</p>
          </div>
          <div className="md:w-3/4">
            <p className="text-gray-900 whitespace-pre-line">{value}</p>
          </div>
        </div>
      </div>
    );
  }

  // Handle object values
  if (typeof value === 'object' && value !== null) {
    return (
      <div className="col-span-full space-y-2">
        <p className="text-sm font-medium text-gray-600 mb-2">{label}</p>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
          {Object.entries(value).map(([subKey, subValue]) => (
            <DetailItem
              key={subKey}
              label={subKey.toUpperCase()}
              value={subValue}
            />
          ))}
        </div>
      </div>
    );
  }

  // Handle boolean values
  let displayValue = value;
  if (typeof value === 'boolean') {
    displayValue = value ? 'Yes' : 'No';
  }

  return (
    <div className="bg-gray-50 p-4 rounded-lg break-words">
      <p className="text-sm font-medium text-gray-600 mb-1 truncate">{label}</p>
      <p className="text-gray-900 font-semibold break-words">
        {displayValue?.toString() || 'Not recorded'}
      </p>
    </div>
  );
};

const sectionConfig = [
  {
    title: 'Demographics',
    icon: <User />,
    fields: [
      'gender', 'occupation', 'education_level',
      'income_level', 'family_size', 'region_id'
    ]
  },
  {
    title: 'Vital Signs',
    icon: <Activity />,
    fields: [
      'heart_rate', 'blood_pressure', 'respiratory_rate',
      'body_temperature', 'weight', 'height', 'bmi',
      'blood_glucose', 'oxygen_saturation', 'pain_level'
    ]
  },
  {
    title: 'Medical History',
    icon: <Stethoscope />,
    fields: [
      'chronic_conditions', 'major_infections',
      'family_illness_history'
    ]
  },
  {
    title: 'Lifestyle',
    icon: <Dumbbell />,
    fields: [
      'housing_condition', 'water_access', 'toilet_access',
      'lifestyle_habits', 
      {
        key: 'lifestyle_advice',
        render: (value: string[]) => (
          <div className="flex flex-wrap gap-2">
            {value?.map((item, i) => (
              <span key={i} className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm">
                {item}
              </span>
            ))}
          </div>
        )
      }
    ]
  },
  {
    title: 'Women\'s Health',
    icon: <User />,
    fields: ['womens_health'],
    condition: (data: HealthRecord | undefined) => data?.gender?.toLowerCase() === 'female'
  },
  {
    title: 'Medications & Follow-up',
    icon: <Pill />,
    fields: ['medication', 'follow_up_date']
  }
];

export const HealthReportPage = () => {
  const { appointmentId } = useParams();
  const [patientData, setPatientData] = useState<PatientHealthData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchPatientDetails = async () => {
      if (!appointmentId) return;

      try {
        setLoading(true);
        setError(null);

        // Fetch appointment details
        const { data: appointmentData, error: appointmentError } = await supabase
          .from('appointments')
          .select(`
            id,
            patient_name,
            patient_phone,
            patient_email,
            patient_address,
            region_name
          `)
          .eq('id', appointmentId)
          .single();

        if (appointmentError) {
          console.error('Error fetching appointment details:', appointmentError);
          throw appointmentError;
        }

        if (!appointmentData) {
          throw new Error('Appointment not found');
        }

        // Fetch health records using appointment.id as patient_id
        const { data: healthRecordData, error: healthRecordError } = await supabase
          .from('patient_health_records')
          .select(`
            id,
            patient_id,
            created_at,
            updated_at,
            general_health,
            pain_discomfort,
            digestion_appetite,
            chronic_conditions,
            lifestyle_habits,
            womens_health,
            family_community_health,
            mental_health,
            heart_rate,
            blood_pressure,
            respiratory_rate,
            body_temperature,
            weight,
            height,
            bmi,
            blood_glucose,
            oxygen_saturation,
            pain_level,
            patient_name,
            region_id,
            heart_health,
            gender,
            occupation,
            education_level,
            income_level,
            family_size,
            housing_condition,
            water_access,
            toilet_access,
            vaccination_history,
            childhood_vaccines,
            older_vaccines,
            recent_vaccines,
            major_infections,
            family_illness_history,
            lifestyle_advice,
            lab_tests,
            follow_up_date,
            medication
          `)
          .eq('patient_id', appointmentData.id);

        if (healthRecordError) {
          console.error('Error fetching health record:', healthRecordError);
          throw healthRecordError;
        }

        let healthRecord: HealthRecord | undefined;

        if (healthRecordData && healthRecordData.length > 0) {
          healthRecord = healthRecordData[0]; // Take the first record
          console.log('Processed health record:', healthRecord);
        } else {
          console.warn('No health record found for patient ID:', appointmentData.id);
        }

        setPatientData({
          id: appointmentData.id,
          patient_id: appointmentData.id,
          patient_name: appointmentData.patient_name,
          patient_phone: appointmentData.patient_phone,
          patient_email: appointmentData.patient_email,
          patient_address: appointmentData.patient_address,
          region_name: appointmentData.region_name,
          health_record: healthRecord,
        });

        console.log('Final patient data with health record:', {
          ...patientData,
          health_record: healthRecord
        });

        document.title = `Medical Report - ${appointmentData.patient_name}`;

      } catch (err: any) {
        console.error('Error fetching patient details:', err);
        setError(err.message || 'Failed to fetch patient details');
      } finally {
        setLoading(false);
      }
    };

    fetchPatientDetails();
  }, [appointmentId]);

  const getAdditionalFields = (healthRecord: HealthRecord | undefined) => {
    if (!healthRecord) {
      return [];
    }
    const excludedFields = [
      'id', 'patient_id', 'created_at', 'updated_at',
      'region_id', 'patient_name' // Add any other fields you want to exclude
    ];
    
    const allFields = new Set(Object.keys(healthRecord));
    const usedFields = new Set(sectionConfig.flatMap(s => s.fields));
    
    return Array.from(allFields).filter(field => 
      !usedFields.has(field) && 
      !excludedFields.includes(field)
    );
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (!patientData) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <Heart className="h-12 w-12 text-red-500 mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-gray-900">Patient Not Found</h2>
          <p className="mt-2 text-gray-600">The requested patient record could not be found.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-full mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-white shadow-xl rounded-lg overflow-hidden">
          {/* Header */}
          <div className="bg-gradient-to-r from-indigo-600 to-purple-700 text-white px-8 py-6">
            <h1 className="text-3xl font-bold">Medical Report</h1>
            <p className="mt-2 text-indigo-200">Generated on {new Date().toLocaleDateString()}</p>
          </div>

          {/* Patient Info */}
          <div className="p-8 border-b border-gray-200 bg-gray-50">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-2xl font-bold text-gray-900">Patient Information</h2>
              <Activity className="h-8 w-8 text-blue-600" />
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-4">
              <div>
                <p className="text-sm text-gray-500">Full Name</p>
                <p className="text-base font-medium text-gray-900">{patientData.patient_name}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Phone Number</p>
                <p className="text-base font-medium text-gray-900">{patientData.patient_phone}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Email</p>
                <p className="text-base font-medium text-gray-900">{patientData.patient_email || 'N/A'}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Region</p>
                <p className="text-base font-medium text-gray-900">{patientData.region_name}</p>
              </div>
              <div className="md:col-span-2">
                <p className="text-sm text-gray-500">Address</p>
                <p className="text-base font-medium text-gray-900">{patientData.patient_address}</p>
              </div>
            </div>
          </div>

          {/* Sections */}
          <div className="p-8 space-y-8">
            {sectionConfig.map((section) => {
              if (section.condition && !section.condition(patientData.health_record)) return null;
              return (
                <Section key={section.title} title={section.title} icon={section.icon}>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                    {section.fields.map((field) => {
                      const value = patientData.health_record?.[field];
                      if (!value) return null;

                      if (Array.isArray(value)) {
                        return (
                          <div key={field} className="col-span-full">
                            <ListItems items={value} />
                          </div>
                        );
                      }

                      if (typeof value === 'object') {
                        return Object.entries(value).map(([key, val]) => (
                          <DetailItem key={key} label={key} value={val} />
                        ));
                      }

                      return <DetailItem key={field} label={field} value={value} />;
                    })}
                  </div>
                </Section>
              );
            })}

            {/* Additional Information */}
            <Section title="Additional Details" icon={<AlertCircle className="text-blue-500" />}>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {getAdditionalFields(patientData.health_record).map((field) => (
                  <div 
                    key={field} 
                    className="bg-blue-100 p-4 rounded-lg break-words min-w-0"
                  >
                    <DetailItem 
                      label={field.replace(/_/g, ' ').toUpperCase()}
                      value={patientData.health_record?.[field]}
                    />
                  </div>
                ))}
              </div>
            </Section>
          </div>
        </div>
      </div>
    </div>
  );
};

const ListItems: React.FC<{ items: any[] | undefined }> = ({ items }) => {
  if (!Array.isArray(items) || items.length === 0) return <p className="text-gray-500">None recorded</p>;

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      {items.map((item, i) => (
        <div key={i} className="bg-blue-50 p-4 rounded-lg">
          {typeof item === 'object' ? (
            <>
              <div className="font-medium mb-2 text-blue-800">
                <Circle className="h-2 w-2 inline-block mr-2" />
                {item.medicine_name || 'Unnamed Medication'}
              </div>
              <div className="space-y-1 ml-4 text-sm">
                {Object.entries(item).map(([key, val]) => 
                  key !== 'medicine_name' && (
                    <div key={key} className="flex justify-between">
                      <span className="text-gray-600">{key}:</span>
                      <span className="text-gray-800">{val?.toString() || 'N/A'}</span>
                    </div>
                  )
                )}
              </div>
            </>
          ) : (
            <div className="flex items-center">
              <Circle className="h-2 w-2 mr-2 text-gray-400" />
              {item}
            </div>
          )}
        </div>
      ))}
    </div>
  );
};

const MetricCard: React.FC<{ label: string; value?: number | string; unit?: string }> = 
  ({ label, value, unit }) => (
    <div className="bg-white p-4 rounded-lg border border-gray-200">
      <p className="text-sm font-medium text-gray-500">{label}</p>
      <div className="mt-2 flex items-baseline">
        <span className="text-2xl font-semibold">
          {value ?? '--'}
        </span>
        {unit && <span className="ml-1 text-sm text-gray-500">{unit}</span>}
      </div>
    </div>
  );
