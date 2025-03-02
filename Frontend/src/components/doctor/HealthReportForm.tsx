import React, { useState, useEffect } from 'react';
import { X } from 'lucide-react';
import { supabase } from '../../lib/supabase';
import { SpeechTranslator } from './SpeechTranslator';
import { v4 as uuidv4 } from 'uuid';

interface HealthReportFormProps {
  patientId: string;
  patientName: string;
  patientPhone: string;
  regionName: string;
  regionId: string;
  onClose: () => void;
  visit_patient_id?: string; // Added: Optional visit_patient_id prop
}

type Section = 
  | 'basic'
  | 'vitals'
  | 'general'
  | 'pain'
  | 'digestion'
  | 'chronic'
  | 'lifestyle'
  | 'womens'
  | 'family'
  | 'mental'
  | 'heart'
  | 'vaccination'
  | 'prescription';

const sectionConfig = {
  basic: { label: 'Basic Info', bgColor: 'bg-gray-100', textColor: 'text-gray-700', hoverBg: 'hover:bg-gray-200' },
  vitals: { label: 'Vital Signs', bgColor: 'bg-blue-100', textColor: 'text-blue-700', hoverBg: 'hover:bg-blue-200' },
  general: { label: 'General Health', bgColor: 'bg-green-100', textColor: 'text-green-700', hoverBg: 'hover:bg-green-200' },
  pain: { label: 'Pain & Discomfort', bgColor: 'bg-red-100', textColor: 'text-red-700', hoverBg: 'hover:bg-red-200' },
  digestion: { label: 'Digestion', bgColor: 'bg-yellow-100', textColor: 'text-yellow-700', hoverBg: 'hover:bg-yellow-200' },
  chronic: { label: 'Chronic Conditions', bgColor: 'bg-purple-100', textColor: 'text-purple-700', hoverBg: 'hover:bg-purple-200' },
  lifestyle: { label: 'Lifestyle', bgColor: 'bg-indigo-100', textColor: 'text-indigo-700', hoverBg: 'hover:bg-indigo-200' },
  womens: { label: "Women's Health", bgColor: 'bg-pink-100', textColor: 'text-pink-700', hoverBg: 'hover:bg-pink-200' },
  family: { label: 'Family Health', bgColor: 'bg-orange-100', textColor: 'text-orange-700', hoverBg: 'hover:bg-orange-200' },
  mental: { label: 'Mental Health', bgColor: 'bg-teal-100', textColor: 'text-teal-700', hoverBg: 'hover:bg-teal-200' },
  heart: { label: 'Heart Health', bgColor: 'bg-rose-100', textColor: 'text-rose-700', hoverBg: 'hover:bg-rose-200' },
  vaccination: { label: 'Vaccination History', bgColor: 'bg-amber-100', textColor: 'text-amber-700', hoverBg: 'hover:bg-amber-200' },
  prescription: { label: 'Prescription', bgColor: 'bg-emerald-100', textColor: 'text-emerald-700', hoverBg: 'hover:bg-emerald-200' }
} as const;

const fetchExistingHealthRecord = async (patientId: string) => {
  try {
    const { data, error } = await supabase
      .from('patient_health_records')
      .select('*')
      .eq('patient_id', patientId)
      .order('created_at', { ascending: false })
      .limit(1)
      .single();

    return data;
  } catch (error) {
    console.error('Error:', error);
    return null;
  }
};

// Add this array of recommended tests at the top of the file
const LAB_TEST_RECOMMENDATIONS = [
  "Complete Blood Count (CBC)",
  "Basic Metabolic Panel (BMP)",
  "Lipid Profile",
  "Liver Function Tests (LFT)",
  "Thyroid Function Tests (TFT)",
  "Urinalysis",
  "Hemoglobin A1C",
  "C-reactive Protein (CRP)",
  "Vitamin D Level",
  "PSA (Prostate-Specific Antigen)",
  "Hb Electrophoresis",
  "Malaria Parasite Test",
  "Dengue NS1 Antigen",
  "HIV Screening",
  "Hepatitis B Surface Antigen",
  "Hepatitis C Antibody",
  "Blood Culture and Sensitivity",
  "Stool Routine Examination",
  "ECG",
  "Chest X-ray",
  "Typhoid IgM Antibody Test",
  "Typhoid IgG Antibody Test",
  "Widal Test (Typhoid)",
  "Blood Culture (for Typhoid)",
  "Typhoid Rapid Antigen Test",
  "Stool Culture (for Typhoid)"
];

export const HealthReportForm: React.FC<HealthReportFormProps> = ({
  patientId,
  patientName,
  patientPhone,
  regionName,
  regionId,
  onClose,
  visit_patient_id // Receive visit_patient_id as a prop
}) => {
  

  const [formData, setFormData] = useState({
    basicInfo: {
      gender: '',
      occupation: '',
      education_level: '',
      income_level: '',
      family_size: '',
      housing_condition: '',
      water_access: false,
      toilet_access: '',
      visit_patient_id: visit_patient_id || '', // Initialize with the prop value
    },
    generalHealth: {
      main_complaint: '',
      symptom_duration: '',
      previous_symptoms: false
    },
    painDiscomfort: {
      pain_location: '',
      pain_level: 0,
      pain_triggers: ''
    },
    digestionAppetite: {
      stomach_pain: false,
      nausea: false,
      appetite_changes: false,
      weight_loss: false,
      diarrhea: '',
      constipation: ''
    },
    chronicConditions: {
      high_blood_pressure: false,
      diabetes: false,
      heart_disease: false,
      current_medications: '',
      known_allergies: ''
    },
    lifestyleHabits: {
      meal_frequency: '',
      diet: '',
      smoking: false,
      alcohol_consumption: false,
      tobacco_chewing: false,
      physical_activity: ''
    },
    womensHealth: {
      last_menstrual_period: '',
      pregnancy_concerns: false,
      breastfeeding_concerns: false
    },
    familyCommunityHealth: {
      family_symptoms: false,
      recent_outbreaks: false,
      community_illnesses: false
    },
    mentalHealth: {
      emotional_state: '',
      sleep_quality: false,
      stressful_events: '',
      sleep_duration: ''
    },
    vitalSigns: {
      heart_rate: '',
      blood_pressure: '',
      respiratory_rate: '',
      body_temperature: '',
      weight: '',
      height: '',
      bmi: '',
      blood_glucose: '',
      oxygen_saturation: '',
      pain_level: ''
    },
    heartHealth: {
      lvh: false,
      ihd: false,
      cvd: false,
      retinopathy: false,
      chest_pain_type: '',
      resting_bp: '',
      cholesterol: '',
      fasting_bs: false,
      resting_ecg: '',
      max_hr: '',
      exercise_angina: false,
      oldpeak: '',
      st_slope: ''
    },
    vaccinationHistory: {
      received_vaccines: '',
      childhood_vaccines: [] as string[],
      older_vaccines: [] as string[],
      recent_vaccines: [] as string[],
      major_infections: [] as string[],
      family_illness: ''
    },
    prescription: {
      medications: [] as Array<{
        medicine_name: string;
        dosage: string;
        frequency: string;
        duration: string;
        quantity: number;
      }>,
      lifestyle_advice: '',
      lab_tests: [] as string[],
      follow_up_date: ''
    }
  });

  const [showAddMedicineForm, setShowAddMedicineForm] = useState(false);
  const [newMedicine, setNewMedicine] = useState({
    medicine_name: '',
    dosage: '',
    frequency: '',
    duration: '',
    quantity: 1
  });

  const [existingRecord, setExistingRecord] = useState<{ id?: string } | null>(null);

  const [newLabTest, setNewLabTest] = useState('');

  useEffect(() => {
    const loadExistingData = async () => {
      if (patientId) {
        const { data: existingRecord, error } = await supabase
          .from('patient_health_records')
          .select('*')
          .eq('patient_id', patientId)
          .single();

        if (error) {
          console.error("Error fetching existing record:", error);
          return;
        }

        if (existingRecord) {
          setExistingRecord(existingRecord);
          setFormData(prevFormData => ({
            ...prevFormData,
            basicInfo: {
              gender: existingRecord.gender || '',
              occupation: existingRecord.occupation || '',
              education_level: existingRecord.education_level || '',
              income_level: existingRecord.income_level || '',
              family_size: existingRecord.family_size?.toString() || '',
              housing_condition: existingRecord.housing_condition || '',
              water_access: existingRecord.water_access || false,
              toilet_access: existingRecord.toilet_access || '',
              visit_patient_id: existingRecord.visit_patient_id || '', // Load existing visit_patient_id or keep empty
            },
            generalHealth: existingRecord.general_health || {
              main_complaint: '',
              symptom_duration: '',
              previous_symptoms: false
            },
            painDiscomfort: existingRecord.pain_discomfort || {
              pain_location: '',
              pain_level: 0,
              pain_triggers: ''
            },
            digestionAppetite: existingRecord.digestion_appetite || {
              stomach_pain: false,
              nausea: false,
              appetite_changes: false,
              weight_loss: false,
              diarrhea: '',
              constipation: ''
            },
            chronicConditions: existingRecord.chronic_conditions || {
              high_blood_pressure: false,
              diabetes: false,
              heart_disease: false,
              current_medications: '',
              known_allergies: ''
            },
            lifestyleHabits: existingRecord.lifestyle_habits || {
              meal_frequency: '',
              diet: '',
              smoking: false,
              alcohol_consumption: false,
              tobacco_chewing: false,
              physical_activity: ''
            },
            womensHealth: existingRecord.womens_health || {
              last_menstrual_period: '',
              pregnancy_concerns: false,
              breastfeeding_concerns: false
            },
            familyCommunityHealth: existingRecord.family_community_health || {
              family_symptoms: false,
              recent_outbreaks: false,
              community_illnesses: false
            },
            mentalHealth: existingRecord.mental_health || {
              emotional_state: '',
              sleep_quality: false,
              stressful_events: '',
              sleep_duration: ''
            },
            vitalSigns: {
              heart_rate: existingRecord.heart_rate?.toString() || '',
              blood_pressure: existingRecord.blood_pressure || '',
              respiratory_rate: existingRecord.respiratory_rate?.toString() || '',
              body_temperature: existingRecord.body_temperature?.toString() || '',
              weight: existingRecord.weight?.toString() || '',
              height: existingRecord.height?.toString() || '',
              bmi: existingRecord.bmi?.toString() || '',
              blood_glucose: existingRecord.blood_glucose?.toString() || '',
              oxygen_saturation: existingRecord.oxygen_saturation?.toString() || '',
              pain_level: existingRecord.pain_level?.toString() || ''
            },
            heartHealth: existingRecord.heart_health || {
              lvh: false,
              ihd: false,
              cvd: false,
              retinopathy: false,
              chest_pain_type: '',
              resting_bp: '',
              cholesterol: '',
              fasting_bs: false,
              resting_ecg: '',
              max_hr: '',
              exercise_angina: false,
              oldpeak: '',
              st_slope: ''
            },
            vaccinationHistory: {
              received_vaccines: existingRecord.vaccination_history || '',
              childhood_vaccines: existingRecord.childhood_vaccines || [],
              older_vaccines: existingRecord.older_vaccines || [],
              recent_vaccines: existingRecord.recent_vaccines || [],
              major_infections: existingRecord.major_infections || [],
              family_illness: existingRecord.family_illness_history || ''
            },
            prescription: {
              medications: existingRecord.medication || [],
              lifestyle_advice: existingRecord.lifestyle_advice || '',
              lab_tests: existingRecord.lab_tests ? 
                (Array.isArray(existingRecord.lab_tests) ? 
                  existingRecord.lab_tests : 
                  existingRecord.lab_tests.split(', ')) : [],
              follow_up_date: existingRecord.follow_up_date || ''
            }
          }));
        }
      }
    };

    loadExistingData();
  }, [patientId]);

  useEffect(() => {
    setFormData(prevFormData => ({
      ...prevFormData,
      basicInfo: {
        ...prevFormData.basicInfo,
        visit_patient_id: visit_patient_id || '',
      }
    }));
  }, [visit_patient_id]); // Update when visit_patient_id prop changes

  const [activeSection, setActiveSection] = useState<Section>('basic');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      const recordId = existingRecord?.id || uuidv4();

      const payload = {
        id: recordId,
        patient_name: patientName,
        patient_id: patientId,
        visit_patient_id: formData.basicInfo.visit_patient_id || patientId,
        region_id: regionId,
        general_health: formData.generalHealth,
        pain_discomfort: formData.painDiscomfort,
        digestion_appetite: formData.digestionAppetite,
        chronic_conditions: formData.chronicConditions,
        lifestyle_habits: formData.lifestyleHabits,
        womens_health: formData.womensHealth,
        family_community_health: formData.familyCommunityHealth,
        mental_health: {
          ...formData.mentalHealth,
          sleep_duration: formData.mentalHealth.sleep_duration
        },
        heart_rate: formData.vitalSigns.heart_rate ? parseInt(formData.vitalSigns.heart_rate) : null,
        blood_pressure: formData.vitalSigns.blood_pressure || null,
        respiratory_rate: formData.vitalSigns.respiratory_rate ? parseInt(formData.vitalSigns.respiratory_rate) : null,
        body_temperature: formData.vitalSigns.body_temperature ? parseFloat(formData.vitalSigns.body_temperature) : null,
        weight: formData.vitalSigns.weight ? parseFloat(formData.vitalSigns.weight) : null,
        height: formData.vitalSigns.height ? parseFloat(formData.vitalSigns.height) : null,
        bmi: formData.vitalSigns.bmi ? parseFloat(formData.vitalSigns.bmi) : null,
        blood_glucose: formData.vitalSigns.blood_glucose ? parseInt(formData.vitalSigns.blood_glucose) : null,
        oxygen_saturation: formData.vitalSigns.oxygen_saturation ? parseInt(formData.vitalSigns.oxygen_saturation) : null,
        pain_level: formData.vitalSigns.pain_level ? parseInt(formData.vitalSigns.pain_level) : null,
        heart_health: {
          ...formData.heartHealth,
          resting_bp: formData.heartHealth.resting_bp ? parseInt(formData.heartHealth.resting_bp) : null,
          cholesterol: formData.heartHealth.cholesterol ? parseInt(formData.heartHealth.cholesterol) : null,
          max_hr: formData.heartHealth.max_hr ? parseInt(formData.heartHealth.max_hr) : null,
          oldpeak: formData.heartHealth.oldpeak ? parseFloat(formData.heartHealth.oldpeak) : null
        },
        gender: formData.basicInfo.gender,
        occupation: formData.basicInfo.occupation,
        education_level: formData.basicInfo.education_level,
        income_level: formData.basicInfo.income_level,
        family_size: formData.basicInfo.family_size ? parseInt(formData.basicInfo.family_size) : null,
        housing_condition: formData.basicInfo.housing_condition,
        water_access: formData.basicInfo.water_access,
        toilet_access: formData.basicInfo.toilet_access,
        vaccination_history: formData.vaccinationHistory.received_vaccines,
        childhood_vaccines: formData.vaccinationHistory.childhood_vaccines,
        older_vaccines: formData.vaccinationHistory.older_vaccines,
        recent_vaccines: formData.vaccinationHistory.recent_vaccines,
        major_infections: formData.vaccinationHistory.major_infections,
        family_illness_history: formData.vaccinationHistory.family_illness,
        medication: formData.prescription.medications,
        lifestyle_advice: formData.prescription.lifestyle_advice,
        lab_tests: formData.prescription.lab_tests,
        follow_up_date: formData.prescription.follow_up_date
      };

      const { error } = await supabase
        .from('patient_health_records')
        .upsert([payload], { onConflict: 'id' });

      if (error) throw error;
      
      alert('Health report saved successfully!');
      onClose();
    } catch (error) {
      console.error('Error saving health report:', error);
      alert('Failed to save health report. Please try again.');
    }
  };

  const addMedicine = () => {
    if (newMedicine.medicine_name && newMedicine.dosage) {
      setFormData({
        ...formData,
        prescription: {
          ...formData.prescription,
          medications: [...formData.prescription.medications, newMedicine]
        }
      });
      setNewMedicine({ medicine_name: '', dosage: '', frequency: '', duration: '', quantity: 1 });
      setShowAddMedicineForm(false);
    }
  };

  const addLabTest = () => {
    if (newLabTest.trim()) {
      setFormData({
        ...formData,
        prescription: {
          ...formData.prescription,
          lab_tests: [...formData.prescription.lab_tests, newLabTest.trim()]
        }
      });
      setNewLabTest('');
    }
  };

  const removeLabTest = (index: number) => {
    const updatedTests = formData.prescription.lab_tests.filter((_, i) => i !== index);
    setFormData({
      ...formData,
      prescription: {
        ...formData.prescription,
        lab_tests: updatedTests
      }
    });
  };

  return (
    <div className="fixed inset-0 bg-gray-900/30 flex items-center justify-center p-4 z-50">
      <div className="bg-gray-50 rounded-lg max-w-7xl w-full max-h-[90vh] overflow-hidden flex shadow-2xl">
        <div className="w-[30%] bg-gray-100 border-r overflow-y-auto">
          <div className="sticky top-0 bg-gray-50 p-4 border-b">
            <h2 className="text-lg font-semibold font-[500] text-gray-800">Health Report Sections</h2>
          </div>
          <div className="p-2 space-y-2">
            {(Object.entries(sectionConfig) as [Section, typeof sectionConfig[keyof typeof sectionConfig]][]).map(([key, config]) => (
              <button
                key={key}
                onClick={() => setActiveSection(key)}
                className={`w-full text-left px-4 py-3 rounded-lg transition-all ${
                  activeSection === key
                    ? `${config.bgColor} ${config.textColor} font-medium shadow-sm`
                    : `hover:bg-gray-50 text-gray-600 ${config.hoverBg}`
                }`}
              >
                <span className="flex items-center">
                  <span className={`w-2 h-2 rounded-full mr-2 ${activeSection === key ? config.textColor : 'bg-gray-300'}`}></span>
                  {config.label}
                </span>
              </button>
            ))}
          </div>
        </div>

        <div className="flex-1 overflow-y-auto">
          <div className="sticky top-0 bg-gray-50 border-b z-10">
            <div className="p-4">
              <div className="flex justify-between items-center mb-2">
                <h2 className="text-2xl font-semibold text-gray-900 font-[600] tracking-tight">
                  {sectionConfig[activeSection].label}
                </h2>
                <div className="flex items-center gap-3">
                  <SpeechTranslator />
                  <button onClick={onClose} className="text-gray-500 hover:text-gray-700">
                    <X className="h-6 w-6" />
                  </button>
                </div>
              </div>
              <div>
                <p className="text-sm text-gray-600 font-[500]">Patient: {patientName}</p>
                <p className="text-sm text-gray-600 font-[500]">Phone: {patientPhone}</p>
              </div>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="p-6">
            <div className="space-y-6">
              {activeSection === 'basic' && (
                <section className="bg-gray-100/80 p-6 rounded-2xl shadow-sm border border-gray-200 backdrop-blur-sm">
                  <h3 className="text-lg font-medium text-gray-900 mb-4 font-[600] tracking-wide">Basic Personal Information</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2 font-[500]">Gender</label>
                      <select
                        value={formData.basicInfo.gender}
                        onChange={(e) => setFormData({...formData, basicInfo: {...formData.basicInfo, gender: e.target.value}})}
                        className="w-full px-4 py-3 rounded-xl border-2 border-gray-100 bg-white focus:border-gray-400 focus:ring-2 focus:ring-gray-200 focus:ring-opacity-50 transition-all duration-200 font-[500]"
                      >
                        <option value="">Select</option>
                        <option value="male">Male</option>
                        <option value="female">Female</option>
                        <option value="other">Other</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2 font-[500]">Occupation</label>
                      <input
                        type="text"
                        value={formData.basicInfo.occupation}
                        onChange={(e) => setFormData({...formData, basicInfo: {...formData.basicInfo, occupation: e.target.value}})}
                        className="w-full px-4 py-3 rounded-xl border-2 border-gray-100 bg-white focus:border-gray-400 focus:ring-2 focus:ring-gray-200 focus:ring-opacity-50 transition-all duration-200 font-[500]"
                        placeholder="Farmer, Laborer, etc."
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2 font-[500]">Education Level</label>
                      <select
                        value={formData.basicInfo.education_level}
                        onChange={(e) => setFormData({...formData, basicInfo: {...formData.basicInfo, education_level: e.target.value}})}
                        className="w-full px-4 py-3 rounded-xl border-2 border-gray-100 bg-white focus:border-gray-400 focus:ring-2 focus:ring-gray-200 focus:ring-opacity-50 transition-all duration-200 font-[500]"
                      >
                        <option value="">Select</option>
                        <option value="none">No Education</option>
                        <option value="primary">Primary</option>
                        <option value="secondary">Secondary</option>
                        <option value="higher">Higher</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2 font-[500]">Income Level</label>
                      <select
                        value={formData.basicInfo.income_level}
                        onChange={(e) => setFormData({...formData, basicInfo: {...formData.basicInfo, income_level: e.target.value}})}
                        className="w-full px-4 py-3 rounded-xl border-2 border-gray-100 bg-white focus:border-gray-400 focus:ring-2 focus:ring-gray-200 focus:ring-opacity-50 transition-all duration-200 font-[500]"
                      >
                        <option value="">Select</option>
                        <option value="low">Low (Barely meeting daily needs)</option>
                        <option value="medium">Medium (Can afford basic needs)</option>
                        <option value="high">High (Can afford better healthcare)</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2 font-[500]">Family Size</label>
                      <input
                        type="number"
                        value={formData.basicInfo.family_size}
                        onChange={(e) => setFormData({...formData, basicInfo: {...formData.basicInfo, family_size: e.target.value}})}
                        className="w-full px-4 py-3 rounded-xl border-2 border-gray-100 bg-white focus:border-gray-400 focus:ring-2 focus:ring-gray-200 focus:ring-opacity-50 transition-all duration-200 font-[500]"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2 font-[500]">Housing Condition</label>
                      <select
                        value={formData.basicInfo.housing_condition}
                        onChange={(e) => setFormData({...formData, basicInfo: {...formData.basicInfo, housing_condition: e.target.value}})}
                        className="w-full px-4 py-3 rounded-xl border-2 border-gray-100 bg-white focus:border-gray-400 focus:ring-2 focus:ring-gray-200 focus:ring-opacity-50 transition-all duration-200 font-[500]"
                      >
                        <option value="">Select</option>
                        <option value="kaccha">Kaccha House</option>
                        <option value="semi-pucca">Semi-Pucca</option>
                        <option value="pucca">Pucca House</option>
                      </select>
                    </div>
                    <div className="space-y-2">
                      <label className="block text-sm font-medium text-gray-700 mb-2 font-[500]">Clean Water Access</label>
                      <div className="flex gap-4">
                        {['Yes', 'No'].map((option) => (
                          <label key={option} className="flex items-center space-x-2">
                            <input
                              type="radio"
                              name="water_access"
                              value={option.toLowerCase()}
                              checked={formData.basicInfo.water_access === (option.toLowerCase() === 'yes')}
                              onChange={(e) => setFormData({...formData, basicInfo: {...formData.basicInfo, water_access: e.target.value === 'yes'}})}
                              className="w-4 h-4 text-gray-600"
                            />
                            <span className="text-sm">{option}</span>
                          </label>
                        ))}
                      </div>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2 font-[500]">Toilet Access</label>
                      <select
                        value={formData.basicInfo.toilet_access}
                        onChange={(e) => setFormData({...formData, basicInfo: {...formData.basicInfo, toilet_access: e.target.value}})}
                        className="w-full px-4 py-3 rounded-xl border-2 border-gray-100 bg-white focus:border-gray-400 focus:ring-2 focus:ring-gray-200 focus:ring-opacity-50 transition-all duration-200 font-[500]"
                      >
                        <option value="">Select</option>
                        <option value="none">No Access</option>
                        <option value="shared">Shared</option>
                        <option value="private">Private</option>
                      </select>
                    </div>
                  </div>
                </section>
              )}
              {activeSection === 'vitals' && (
                <section className="bg-blue-100/80 p-6 rounded-2xl shadow-sm border border-blue-200 backdrop-blur-sm">
                  <h3 className="text-lg font-medium text-blue-900 mb-4 font-[600] tracking-wide">Vital Signs & Measurements</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2 font-[500]">Region ID</label>
                      <input
                        type="text"
                        value={regionId ?? 'N/A'}
                        readOnly
                        className="w-full px-4 py-3 rounded-xl border-2 border-blue-100 bg-blue-50 focus:border-blue-400 focus:ring-2 focus:ring-blue-200 focus:ring-opacity-50 hover:border-blue-300 transition-all duration-200 placeholder-blue-300"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2 font-[500]">Patient ID</label>
                      <input
                        type="text"
                        value={formData.basicInfo.visit_patient_id}
                        onChange={(e) => setFormData(prevFormData => ({
                          ...prevFormData,
                          basicInfo: {
                            ...prevFormData.basicInfo,
                            visit_patient_id: e.target.value,
                          }
                        }))}
                        className="w-full px-4 py-3 rounded-xl border-2 border-blue-100 bg-blue-50 focus:border-blue-400 focus:ring-2 focus:ring-blue-200 focus:ring-opacity-50 hover:border-blue-300 transition-all duration-200 placeholder-blue-300"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2 font-[500]">Heart Rate (BPM)</label>
                      <input
                        type="number"
                        value={formData.vitalSigns.heart_rate}
                        onChange={(e) => setFormData({
                          ...formData,
                          vitalSigns: { ...formData.vitalSigns, heart_rate: e.target.value }
                        })}
                        className="w-full px-4 py-3 rounded-xl border-2 border-blue-100 bg-white focus:border-blue-400 focus:ring-2 focus:ring-blue-200 focus:ring-opacity-50 transition-all duration-200 font-[500] placeholder:text-gray-400"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2 font-[500]">Blood Pressure (mmHg)</label>
                      <input
                        type="text"
                        placeholder="120/80"
                        value={formData.vitalSigns.blood_pressure}
                        onChange={(e) => setFormData({
                          ...formData,
                          vitalSigns: { ...formData.vitalSigns, blood_pressure: e.target.value }
                        })}
                        className="w-full px-4 py-3 rounded-xl border-2 border-blue-100 bg-white focus:border-blue-400 focus:ring-2 focus:ring-blue-200 focus:ring-opacity-50 transition-all duration-200 font-[500] placeholder:text-gray-400"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2 font-[500]">Body Temperature (°C)</label>
                      <input
                        type="number"
                        step="0.1"
                        value={formData.vitalSigns.body_temperature}
                        onChange={(e) => setFormData({
                          ...formData,
                          vitalSigns: { ...formData.vitalSigns, body_temperature: e.target.value }
                        })}
                        className="w-full px-4 py-3 rounded-xl border-2 border-blue-100 bg-white focus:border-blue-400 focus:ring-2 focus:ring-blue-200 focus:ring-opacity-50 transition-all duration-200 font-[500] placeholder:text-gray-400"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2 font-[500]">Weight (kg)</label>
                      <input
                        type="number"
                        step="0.1"
                        value={formData.vitalSigns.weight}
                        onChange={(e) => {
                          const weight = parseFloat(e.target.value);
                          const height = parseFloat(formData.vitalSigns.height);
                          let bmi = '';
                          if (weight && height) {
                            const heightInMeters = height / 100;
                            bmi = (weight / (heightInMeters * heightInMeters)).toFixed(1);
                          }
                          setFormData({
                            ...formData,
                            vitalSigns: { 
                              ...formData.vitalSigns, 
                              weight: e.target.value,
                              bmi: bmi
                            }
                          });
                        }}
                        className="w-full px-4 py-3 rounded-xl border-2 border-blue-100 bg-white focus:border-blue-400 focus:ring-2 focus:ring-blue-200 focus:ring-opacity-50 transition-all duration-200 font-[500] placeholder:text-gray-400"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2 font-[500]">Height (cm)</label>
                      <input
                        type="number"
                        step="0.1"
                        value={formData.vitalSigns.height}
                        onChange={(e) => {
                          const height = parseFloat(e.target.value);
                          const weight = parseFloat(formData.vitalSigns.weight);
                          let bmi = '';
                          if (weight && height) {
                            const heightInMeters = height / 100;
                            bmi = (weight / (heightInMeters * heightInMeters)).toFixed(1);
                          }
                          setFormData({
                            ...formData,
                            vitalSigns: { 
                              ...formData.vitalSigns, 
                              height: e.target.value,
                              bmi: bmi
                            }
                          });
                        }}
                        className="w-full px-4 py-3 rounded-xl border-2 border-blue-100 bg-white focus:border-blue-400 focus:ring-2 focus:ring-blue-200 focus:ring-opacity-50 transition-all duration-200 font-[500] placeholder:text-gray-400"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2 font-[500]">BMI</label>
                      <input
                        type="number"
                        step="0.1"
                        value={formData.vitalSigns.bmi}
                        readOnly
                        className="w-full px-4 py-3 rounded-xl border-2 border-blue-100 bg-white shadow-sm font-[500]"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2 font-[500]">Blood Glucose Level (mg/dL)</label>
                      <input
                        type="number"
                        value={formData.vitalSigns.blood_glucose}
                        onChange={(e) => setFormData({
                          ...formData,
                          vitalSigns: { ...formData.vitalSigns, blood_glucose: e.target.value }
                        })}
                        className="w-full px-4 py-3 rounded-xl border-2 border-blue-100 bg-white focus:border-blue-400 focus:ring-2 focus:ring-blue-200 focus:ring-opacity-50 transition-all duration-200 font-[500] placeholder:text-gray-400"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2 font-[500]">Oxygen Saturation (%)</label>
                      <input
                        type="number"
                        min="0"
                        max="100"
                        value={formData.vitalSigns.oxygen_saturation}
                        onChange={(e) => setFormData({
                          ...formData,
                          vitalSigns: { ...formData.vitalSigns, oxygen_saturation: e.target.value }
                        })}
                        className="w-full px-4 py-3 rounded-xl border-2 border-blue-100 bg-white focus:border-blue-400 focus:ring-2 focus:ring-blue-200 focus:ring-opacity-50 transition-all duration-200 font-[500] placeholder:text-gray-400"
                      />
                    </div>
                  </div>
                </section>
              )}
              {activeSection === 'general' && (
                <section className="bg-green-100/80 p-6 rounded-2xl shadow-sm border border-green-200 backdrop-blur-sm">
                  <h3 className="text-lg font-medium text-green-900 mb-4 font-[600] tracking-wide">General Health & Symptoms</h3>
                  <div className="space-y-6">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2 font-[500]">What brings you here today?</label>
                      <textarea
                        value={formData.generalHealth.main_complaint}
                        onChange={(e) => setFormData({
                          ...formData,
                          generalHealth: {
                            ...formData.generalHealth,
                            main_complaint: e.target.value
                          }
                        })}
                        className="w-full px-4 py-3 rounded-xl border-2 border-green-100 bg-white focus:border-green-400 focus:ring-2 focus:ring-green-200 focus:ring-opacity-50 transition-all duration-200 font-[500] placeholder:text-gray-400"
                        rows={3}
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2 font-[500]">How long have you had these symptoms?</label>
                      <select
                        value={formData.generalHealth.symptom_duration}
                        onChange={(e) => setFormData({
                          ...formData,
                          generalHealth: {
                            ...formData.generalHealth,
                            symptom_duration: e.target.value
                          }
                        })}
                        className="w-full px-4 py-3 rounded-xl border-2 border-green-100 bg-white focus:border-green-400 focus:ring-2 focus:ring-green-200 focus:ring-opacity-50 transition-all duration-200 font-[500] appearance-none"
                      >
                        <option value="">Select duration</option>
                        <option value="hours">Hours</option>
                        <option value="days">Days</option>
                        <option value="weeks">Weeks</option>
                        <option value="months">Months</option>
                      </select>
                    </div>
                    <div>
                      <label className="flex items-center space-x-2">
                        <input
                          type="checkbox"
                          checked={formData.generalHealth.previous_symptoms}
                          onChange={(e) => setFormData({
                            ...formData,
                            generalHealth: {
                              ...formData.generalHealth,
                              previous_symptoms: e.target.checked
                            }
                          })}
                          className="w-5 h-5 border-2 border-green-300 rounded-lg bg-white checked:bg-green-500 checked:border-green-500 focus:ring-green-400 transition-all duration-200"
                        />
                        <span className="text-sm font-medium text-green-900">Have you experienced this before?</span>
                      </label>
                    </div>
                  </div>
                </section>
              )}
              {activeSection === 'pain' && (
                <section className="bg-red-100/80 p-6 rounded-2xl shadow-sm border border-red-200 backdrop-blur-sm">
                  <h3 className="text-lg font-medium text-red-900 mb-4 font-[600] tracking-wide">Pain & Discomfort</h3>
                  <div className="space-y-6">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2 font-[500]">Where do you feel pain or discomfort?</label>
                      <textarea
                        value={formData.painDiscomfort.pain_location}
                        onChange={(e) => setFormData({
                          ...formData,
                          painDiscomfort: {
                            ...formData.painDiscomfort,
                            pain_location: e.target.value
                          }
                        })}
                        className="w-full px-4 py-3 rounded-xl border-2 border-red-100 bg-white focus:border-red-400 focus:ring-2 focus:ring-red-200 focus:ring-opacity-50 transition-all duration-200 font-[500] placeholder:text-gray-400"
                        rows={3}
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2 font-[500]">Pain Level (1-10)</label>
                      <input
                        type="range"
                        min="0"
                        max="10"
                        value={formData.painDiscomfort.pain_level}
                        onChange={(e) => setFormData({
                          ...formData,
                          painDiscomfort: {
                            ...formData.painDiscomfort,
                            pain_level: parseInt(e.target.value)
                          }
                        })}
                        className="w-full h-3 bg-red-100 rounded-lg appearance-none cursor-pointer range-lg hover:bg-red-50 transition-colors"
                      />
                      <div className="mt-1 text-sm text-gray-500 text-center">
                        {formData.painDiscomfort.pain_level}
                      </div>
                    </div>
                  </div>
                </section>
              )}
              {activeSection === 'digestion' && (
                <section className="bg-yellow-100/80 p-6 rounded-2xl shadow-sm border border-yellow-200 backdrop-blur-sm">
                  <h3 className="text-lg font-medium text-yellow-900 mb-4 font-[600] tracking-wide">Digestion & Appetite</h3>
                  <div className="space-y-6">
                    <div className="flex items-center space-x-4">
                      <label className="flex items-center space-x-2">
                        <input
                          type="checkbox"
                          checked={formData.digestionAppetite.stomach_pain}
                          onChange={(e) => setFormData({
                            ...formData,
                            digestionAppetite: {
                              ...formData.digestionAppetite,
                              stomach_pain: e.target.checked
                            }
                          })}
                          className="w-5 h-5 border-2 border-yellow-300 rounded-lg bg-white checked:bg-yellow-500 checked:border-yellow-500 focus:ring-yellow-400 transition-all duration-200"
                        />
                        <span className="text-sm font-medium text-yellow-900">Stomach Pain</span>
                      </label>
                      <label className="flex items-center space-x-2">
                        <input
                          type="checkbox"
                          checked={formData.digestionAppetite.nausea}
                          onChange={(e) => setFormData({
                            ...formData,
                            digestionAppetite: {
                              ...formData.digestionAppetite,
                              nausea: e.target.checked
                            }
                          })}
                          className="w-5 h-5 border-2 border-yellow-300 rounded-lg bg-white checked:bg-yellow-500 checked:border-yellow-500 focus:ring-yellow-400 transition-all duration-200"
                        />
                        <span className="text-sm font-medium text-yellow-900">Nausea/Vomiting</span>
                      </label>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2 font-[500]">Digestive Issues</label>
                      <select
                        value={formData.digestionAppetite.diarrhea}
                        onChange={(e) => setFormData({
                          ...formData,
                          digestionAppetite: {
                            ...formData.digestionAppetite,
                            diarrhea: e.target.value
                          }
                        })}
                        className="w-full px-4 py-3 rounded-xl border-2 border-yellow-100 bg-white focus:border-yellow-400 focus:ring-2 focus:ring-yellow-200 focus:ring-opacity-50 transition-all duration-200 font-[500] appearance-none"
                      >
                        <option value="">Select</option>
                        <option value="yes">Yes</option>
                        <option value="no">No</option>
                        <option value="sometimes">Sometimes</option>
                      </select>
                    </div>
                  </div>
                </section>
              )}
              {activeSection === 'chronic' && (
                <section className="bg-purple-100/80 p-6 rounded-2xl shadow-sm border border-purple-200 backdrop-blur-sm">
                  <h3 className="text-lg font-medium text-purple-900 mb-4 font-[600] tracking-wide">Chronic Conditions & Medication</h3>
                  <div className="space-y-6">
                    <div className="flex flex-wrap gap-4">
                      <label className="flex items-center space-x-2">
                        <input
                          type="checkbox"
                          checked={formData.chronicConditions.high_blood_pressure}
                          onChange={(e) => setFormData({
                            ...formData,
                            chronicConditions: {
                              ...formData.chronicConditions,
                              high_blood_pressure: e.target.checked
                            }
                          })}
                          className="w-5 h-5 border-2 border-purple-300 rounded-lg bg-white checked:bg-purple-500 checked:border-purple-500 focus:ring-purple-400 transition-all duration-200"
                        />
                        <span className="text-sm font-medium text-purple-900">High Blood Pressure</span>
                      </label>
                      <label className="flex items-center space-x-2">
                        <input
                          type="checkbox"
                          checked={formData.chronicConditions.diabetes}
                          onChange={(e) => setFormData({
                            ...formData,
                            chronicConditions: {
                              ...formData.chronicConditions,
                              diabetes: e.target.checked
                            }
                          })}
                          className="w-5 h-5 border-2 border-purple-300 rounded-lg bg-white checked:bg-purple-500 checked:border-purple-500 focus:ring-purple-400 transition-all duration-200"
                        />
                        <span className="text-sm font-medium text-purple-900">Diabetes</span>
                      </label>
                      <label className="flex items-center space-x-2">
                        <input
                          type="checkbox"
                          checked={formData.chronicConditions.heart_disease}
                          onChange={(e) => setFormData({
                            ...formData,
                            chronicConditions: {
                              ...formData.chronicConditions,
                              heart_disease: e.target.checked
                            }
                          })}
                          className="w-5 h-5 border-2 border-purple-300 rounded-lg bg-white checked:bg-purple-500 checked:border-purple-500 focus:ring-purple-400 transition-all duration-200"
                        />
                        <span className="text-sm font-medium text-purple-900">Heart Disease</span>
                      </label>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2 font-[500]">Current Medications</label>
                      <textarea
                        value={formData.chronicConditions.current_medications}
                        onChange={(e) => setFormData({
                          ...formData,
                          chronicConditions: {
                            ...formData.chronicConditions,
                            current_medications: e.target.value
                          }
                        })}
                        className="w-full px-4 py-3 rounded-xl border-2 border-purple-100 bg-white focus:border-purple-400 focus:ring-2 focus:ring-purple-200 focus:ring-opacity-50 transition-all duration-200 font-[500] placeholder:text-gray-400"
                        rows={3}
                      />
                    </div>
                  </div>
                </section>
              )}
              {activeSection === 'lifestyle' && (
                <section className="bg-indigo-100/80 p-6 rounded-2xl shadow-sm border border-indigo-200 backdrop-blur-sm">
                  <h3 className="text-lg font-medium text-indigo-900 mb-4 font-[600] tracking-wide">Lifestyle & Habits</h3>
                  <div className="space-y-6">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2 font-[500]">Meals per Day</label>
                      <select
                        value={formData.lifestyleHabits.meal_frequency}
                        onChange={(e) => setFormData({
                          ...formData,
                          lifestyleHabits: {
                            ...formData.lifestyleHabits,
                            meal_frequency: e.target.value
                          }
                        })}
                        className="w-full px-4 py-3 rounded-xl border-2 border-indigo-100 bg-white focus:border-indigo-400 focus:ring-2 focus:ring-indigo-200 focus:ring-opacity-50 transition-all duration-200 font-[500] appearance-none"
                      >
                        <option value="">Select frequency</option>
                        <option value="1-2">1-2 meals</option>
                        <option value="3">3 meals</option>
                        <option value="4+">4+ meals</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2 font-[500]">Physical Activity</label>
                      <select
                        value={formData.lifestyleHabits.physical_activity}
                        onChange={(e) => setFormData({
                          ...formData,
                          lifestyleHabits: {
                            ...formData.lifestyleHabits,
                            physical_activity: e.target.value
                          }
                        })}
                        className="w-full px-4 py-3 rounded-xl border-2 border-indigo-100 bg-white focus:border-indigo-400 focus:ring-2 focus:ring-indigo-200 focus:ring-opacity-50 transition-all duration-200 font-[500] appearance-none"
                      >
                        <option value="">Select level</option>
                        <option value="none">None</option>
                        <option value="light">Light</option>
                        <option value="moderate">Moderate</option>
                        <option value="heavy">Heavy</option>
                      </select>
                    </div>
                    <div className="flex flex-wrap gap-4">
                      <label className="flex items-center space-x-2">
                        <input
                          type="checkbox"
                          checked={formData.lifestyleHabits.smoking}
                          onChange={(e) => setFormData({
                            ...formData,
                            lifestyleHabits: {
                              ...formData.lifestyleHabits,
                              smoking: e.target.checked
                            }
                          })}
                          className="w-5 h-5 border-2 border-indigo-300 rounded-lg bg-white checked:bg-indigo-500 checked:border-indigo-500 focus:ring-indigo-400 transition-all duration-200"
                        />
                        <span className="text-sm font-medium text-indigo-900">Smoking</span>
                      </label>
                      <label className="flex items-center space-x-2">
                        <input
                          type="checkbox"
                          checked={formData.lifestyleHabits.alcohol_consumption}
                          onChange={(e) => setFormData({
                            ...formData,
                            lifestyleHabits: {
                              ...formData.lifestyleHabits,
                              alcohol_consumption: e.target.checked
                            }
                          })}
                          className="w-5 h-5 border-2 border-indigo-300 rounded-lg bg-white checked:bg-indigo-500 checked:border-indigo-500 focus:ring-indigo-400 transition-all duration-200"
                        />
                        <span className="text-sm font-medium text-indigo-900">Alcohol</span>
                      </label>
                    </div>
                  </div>
                </section>
              )}
              {activeSection === 'womens' && (
                <section className="bg-pink-100/80 p-6 rounded-2xl shadow-sm border border-pink-200 backdrop-blur-sm">
                  <h3 className="text-lg font-medium text-pink-900 mb-4 font-[600] tracking-wide">Women's Health</h3>
                  <div className="space-y-6">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2 font-[500]">Last Menstrual Period</label>
                      <input
                        type="date"
                        value={formData.womensHealth.last_menstrual_period}
                        onChange={(e) => setFormData({
                          ...formData,
                          womensHealth: {
                            ...formData.womensHealth,
                            last_menstrual_period: e.target.value
                          }
                        })}
                        className="w-full px-4 py-3 rounded-xl border-2 border-pink-100 bg-white focus:border-pink-400 focus:ring-2 focus:ring-pink-200 focus:ring-opacity-50 transition-all duration-200 font-[500] placeholder:text-gray-400"
                      />
                    </div>
                    <div className="flex flex-wrap gap-4">
                      <label className="flex items-center space-x-2">
                        <input
                          type="checkbox"
                          checked={formData.womensHealth.pregnancy_concerns}
                          onChange={(e) => setFormData({
                            ...formData,
                            womensHealth: {
                              ...formData.womensHealth,
                              pregnancy_concerns: e.target.checked
                            }
                          })}
                          className="w-5 h-5 border-2 border-pink-300 rounded-lg bg-white checked:bg-pink-500 checked:border-pink-500 focus:ring-pink-400 transition-all duration-200"
                        />
                        <span className="text-sm font-medium text-pink-900">Pregnancy Concerns</span>
                      </label>
                    </div>
                  </div>
                </section>
              )}
              {activeSection === 'family' && (
                <section className="bg-orange-100/80 p-6 rounded-2xl shadow-sm border border-orange-200 backdrop-blur-sm">
                  <h3 className="text-lg font-medium text-orange-900 mb-4 font-[600] tracking-wide">Family & Community Health</h3>
                  <div className="space-y-6">
                    <div className="flex flex-wrap gap-4">
                      <label className="flex items-center space-x-2">
                        <input
                          type="checkbox"
                          checked={formData.familyCommunityHealth.family_symptoms}
                          onChange={(e) => setFormData({
                            ...formData,
                            familyCommunityHealth: {
                              ...formData.familyCommunityHealth,
                              family_symptoms: e.target.checked
                            }
                          })}
                          className="w-5 h-5 border-2 border-orange-300 rounded-lg bg-white checked:bg-orange-500 checked:border-orange-500 focus:ring-orange-400 transition-all duration-200"
                        />
                        <span className="text-sm font-medium text-orange-900">Similar Symptoms in Family</span>
                      </label>
                      <label className="flex items-center space-x-2">
                        <input
                          type="checkbox"
                          checked={formData.familyCommunityHealth.recent_outbreaks}
                          onChange={(e) => setFormData({
                            ...formData,
                            familyCommunityHealth: {
                              ...formData.familyCommunityHealth,
                              recent_outbreaks: e.target.checked
                            }
                          })}
                          className="w-5 h-5 border-2 border-orange-300 rounded-lg bg-white checked:bg-orange-500 checked:border-orange-500 focus:ring-orange-400 transition-all duration-200"
                        />
                        <span className="text-sm font-medium text-orange-900">Recent Community Outbreaks</span>
                      </label>
                    </div>
                  </div>
                </section>
              )}
              {activeSection === 'mental' && (
                <section className="bg-teal-100/80 p-6 rounded-2xl shadow-sm border border-teal-200 backdrop-blur-sm">
                  <h3 className="text-lg font-medium text-teal-900 mb-4 font-[600] tracking-wide">Mental Health & Stress</h3>
                  <div className="space-y-6">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2 font-[500]">Emotional State</label>
                      <select
                        value={formData.mentalHealth.emotional_state}
                        onChange={(e) => setFormData({
                          ...formData,
                          mentalHealth: {
                            ...formData.mentalHealth,
                            emotional_state: e.target.value
                          }
                        })}
                        className="w-full px-4 py-3 rounded-xl border-2 border-teal-100 bg-white focus:border-teal-400 focus:ring-2 focus:ring-teal-200 focus:ring-opacity-50 transition-all duration-200 font-[500] appearance-none"
                      >
                        <option value="">Select state</option>
                        <option value="good">Good</option>
                        <option value="okay">Okay</option>
                        <option value="stressed">Stressed</option>
                        <option value="depressed">Depressed</option>
                      </select>
                    </div>
                    <div>
                      <label className="flex items-center space-x-2">
                        <input
                          type="checkbox"
                          checked={formData.mentalHealth.sleep_quality}
                          onChange={(e) => setFormData({
                            ...formData,
                            mentalHealth: {
                              ...formData.mentalHealth,
                              sleep_quality: e.target.checked
                            }
                          })}
                          className="w-5 h-5 border-2 border-teal-300 rounded-lg bg-white checked:bg-teal-500 checked:border-teal-500 focus:ring-teal-400 transition-all duration-200"
                        />
                        <span className="text-sm font-medium text-teal-900">Sleeping Well</span>
                      </label>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2 font-[500]">Recent Stressful Events</label>
                      <textarea
                        value={formData.mentalHealth.stressful_events}
                        onChange={(e) => setFormData({
                          ...formData,
                          mentalHealth: {
                            ...formData.mentalHealth,
                            stressful_events: e.target.value
                          }
                        })}
                        className="w-full px-4 py-3 rounded-xl border-2 border-teal-100 bg-white focus:border-teal-400 focus:ring-2 focus:ring-teal-200 focus:ring-opacity-50 transition-all duration-200 font-[500] placeholder:text-gray-400"
                        rows={3}
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2 font-[500]">Sleep Duration (hours/day)</label>
                      <select
                        value={formData.mentalHealth.sleep_duration}
                        onChange={(e) => setFormData({
                          ...formData,
                          mentalHealth: {
                            ...formData.mentalHealth,
                            sleep_duration: e.target.value
                          }
                        })}
                        className="w-full px-4 py-3 rounded-xl border-2 border-teal-100 bg-white focus:border-teal-400 focus:ring-2 focus:ring-teal-200 focus:ring-opacity-50 transition-all duration-200 font-[500] appearance-none"
                      >
                        <option value="">Select duration</option>
                        <option value="less_than_6">Less than 6 hours</option>
                        <option value="6_to_8">6-8 hours</option>
                        <option value="8_to_10">8-10 hours</option>
                        <option value="more_than_10">More than 10 hours</option>
                      </select>
                    </div>
                  </div>
                </section>
              )}
              {activeSection === 'heart' && (
                <section className="bg-rose-100/80 p-6 rounded-2xl shadow-sm border border-rose-200 backdrop-blur-sm">
                  <h3 className="text-lg font-medium text-rose-900 mb-4 font-[600] tracking-wide">Heart Health Assessment</h3>
                  <div className="space-y-6">
                    <div className="flex flex-wrap gap-4">
                      <label className="flex items-center space-x-2">
                        <input
                          type="checkbox"
                          checked={formData.heartHealth.lvh}
                          onChange={(e) => setFormData({
                            ...formData,
                            heartHealth: {
                              ...formData.heartHealth,
                              lvh: e.target.checked
                            }
                          })}
                          className="w-5 h-5 border-2 border-rose-300 rounded-lg bg-white checked:bg-rose-500 checked:border-rose-500 focus:ring-rose-400 transition-all duration-200"
                        />
                        <span className="text-sm font-medium text-rose-900">LVH (Left Ventricular Hypertrophy)</span>
                      </label>

                      <label className="flex items-center space-x-2">
                        <input
                          type="checkbox"
                          checked={formData.heartHealth.ihd}
                          onChange={(e) => setFormData({
                            ...formData,
                            heartHealth: {
                              ...formData.heartHealth,
                              ihd: e.target.checked
                            }
                          })}
                          className="w-5 h-5 border-2 border-rose-300 rounded-lg bg-white checked:bg-rose-500 checked:border-rose-500 focus:ring-rose-400 transition-all duration-200"
                        />
                        <span className="text-sm font-medium text-rose-900">IHD (Ischemic Heart Disease)</span>
                      </label>

                      <label className="flex items-center space-x-2">
                        <input
                          type="checkbox"
                          checked={formData.heartHealth.cvd}
                          onChange={(e) => setFormData({
                            ...formData,
                            heartHealth: {
                              ...formData.heartHealth,
                              cvd: e.target.checked
                            }
                          })}
                          className="w-5 h-5 border-2 border-rose-300 rounded-lg bg-white checked:bg-rose-500 checked:border-rose-500 focus:ring-rose-400 transition-all duration-200"
                        />
                        <span className="text-sm font-medium text-rose-900">CVD (Cerebrovascular Disease)</span>
                      </label>

                      <label className="flex items-center space-x-2">
                        <input
                          type="checkbox"
                          checked={formData.heartHealth.retinopathy}
                          onChange={(e) => setFormData({
                            ...formData,
                            heartHealth: {
                              ...formData.heartHealth,
                              retinopathy: e.target.checked
                            }
                          })}
                          className="w-5 h-5 border-2 border-rose-300 rounded-lg bg-white checked:bg-rose-500 checked:border-rose-500 focus:ring-rose-400 transition-all duration-200"
                        />
                        <span className="text-sm font-medium text-rose-900">Retinopathy</span>
                      </label>
                    </div>

                    <div className="w-full grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-rose-900 mb-2">Chest Pain Type</label>
                        <select
                          value={formData.heartHealth.chest_pain_type}
                          onChange={(e) => setFormData({
                            ...formData,
                            heartHealth: {...formData.heartHealth, chest_pain_type: e.target.value}
                          })}
                          className="w-full px-4 py-2 rounded-lg border-2 border-rose-200"
                        >
                          <option value="">Select type</option>
                          <option value="ATA">ATA</option>
                          <option value="NAP">NAP</option>
                          <option value="ASY">ASY</option>
                          <option value="TA">TA</option>
                        </select>
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-rose-900 mb-2">Resting BP (mmHg)</label>
                        <input
                          type="number"
                          value={formData.heartHealth.resting_bp}
                          onChange={(e) => setFormData({
                            ...formData,
                            heartHealth: {...formData.heartHealth, resting_bp: e.target.value}
                          })}
                          className="w-full px-4 py-2 rounded-lg border-2 border-rose-200"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-rose-900 mb-2">Cholesterol (mg/dl)</label>
                        <input
                          type="number"
                          value={formData.heartHealth.cholesterol}
                          onChange={(e) => setFormData({
                            ...formData,
                            heartHealth: {...formData.heartHealth, cholesterol: e.target.value}
                          })}
                          className="w-full px-4 py-2 rounded-lg border-2 border-rose-200"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-rose-900 mb-2">Fasting Blood Sugar &gt; 120 mg/dl</label>
                        <div className="flex gap-4">
                          <label className="flex items-center space-x-2">
                            <input
                              type="radio"
                              name="fasting_bs"
                              checked={formData.heartHealth.fasting_bs}
                              onChange={() => setFormData({
                                ...formData,
                                heartHealth: {...formData.heartHealth, fasting_bs: true}
                              })}
                              className="w-4 h-4 text-rose-600"
                            />
                            <span className="text-sm">Yes</span>
                          </label>
                          <label className="flex items-center space-x-2">
                            <input
                              type="radio"
                              name="fasting_bs"
                              checked={!formData.heartHealth.fasting_bs}
                              onChange={() => setFormData({
                                ...formData,
                                heartHealth: {...formData.heartHealth, fasting_bs: false}
                              })}
                              className="w-4 h-4 text-rose-600"
                            />
                            <span className="text-sm">No</span>
                          </label>
                        </div>
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-rose-900 mb-2">Resting ECG</label>
                        <select
                          value={formData.heartHealth.resting_ecg}
                          onChange={(e) => setFormData({
                            ...formData,
                            heartHealth: {...formData.heartHealth, resting_ecg: e.target.value}
                          })}
                          className="w-full px-4 py-2 rounded-lg border-2 border-rose-200"
                        >
                          <option value="">Select result</option>
                          <option value="Normal">Normal</option>
                          <option value="ST">ST-T wave abnormality</option>
                          <option value="LVH">LVH</option>
                        </select>
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-rose-900 mb-2">Max Heart Rate</label>
                        <input
                          type="number"
                          value={formData.heartHealth.max_hr}
                          onChange={(e) => setFormData({
                            ...formData,
                            heartHealth: {...formData.heartHealth, max_hr: e.target.value}
                          })}
                          className="w-full px-4 py-2 rounded-lg border-2 border-rose-200"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-rose-900 mb-2">Exercise Angina</label>
                        <div className="flex gap-4">
                          <label className="flex items-center space-x-2">
                            <input
                              type="radio"
                              name="exercise_angina"
                              checked={formData.heartHealth.exercise_angina}
                              onChange={() => setFormData({
                                ...formData,
                                heartHealth: {...formData.heartHealth, exercise_angina: true}
                              })}
                              className="w-4 h-4 text-rose-600"
                            />
                            <span className="text-sm">Yes</span>
                          </label>
                          <label className="flex items-center space-x-2">
                            <input
                              type="radio"
                              name="exercise_angina"
                              checked={!formData.heartHealth.exercise_angina}
                              onChange={() => setFormData({
                                ...formData,
                                heartHealth: {...formData.heartHealth, exercise_angina: false}
                              })}
                              className="w-4 h-4 text-rose-600"
                            />
                            <span className="text-sm">No</span>
                          </label>
                        </div>
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-rose-900 mb-2">Oldpeak</label>
                        <input
                          type="number"
                          step="0.1"
                          value={formData.heartHealth.oldpeak}
                          onChange={(e) => setFormData({
                            ...formData,
                            heartHealth: {...formData.heartHealth, oldpeak: e.target.value}
                          })}
                          className="w-full px-4 py-2 rounded-lg border-2 border-rose-200"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-rose-900 mb-2">ST Slope</label>
                        <select
                          value={formData.heartHealth.st_slope}
                          onChange={(e) => setFormData({
                            ...formData,
                            heartHealth: {...formData.heartHealth, st_slope: e.target.value}
                          })}
                          className="w-full px-4 py-2 rounded-lg border-2 border-rose-200"
                        >
                          <option value="">Select slope</option>
                          <option value="Up">Up</option>
                          <option value="Flat">Flat</option>
                          <option value="Down">Down</option>
                        </select>
                      </div>
                    </div>
                  </div>
                </section>
              )}
              {activeSection === 'vaccination' && (
                <section className="bg-amber-100/80 p-6 rounded-2xl shadow-sm border border-amber-200 backdrop-blur-sm">
                  <h3 className="text-lg font-medium text-amber-900 mb-4 font-[600] tracking-wide">Vaccination History & Immunity</h3>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* Received Vaccines */}
                    <div className="space-y-4">
                      <div className="space-y-2">
                        <h4 className="text-sm font-semibold text-amber-800">1. Received any vaccines?</h4>
                        {['Yes', 'No', 'Not Sure'].map((option) => (
                          <label key={option} className="flex items-center space-x-2">
                            <input
                              type="radio"
                              name="received_vaccines"
                              value={option.toLowerCase()}
                              checked={formData.vaccinationHistory.received_vaccines === option.toLowerCase()}
                              onChange={(e) => setFormData({
                                ...formData,
                                vaccinationHistory: {
                                  ...formData.vaccinationHistory,
                                  received_vaccines: e.target.value
                                }
                              })}
                              className="w-4 h-4 text-amber-600"
                            />
                            <span className="text-sm text-amber-900">{option}</span>
                          </label>
                        ))}
                      </div>

                      {/* Family Illness */}
                      <div className="space-y-2">
                        <h4 className="text-sm font-semibold text-amber-800">6. Family Members Frequently Ill?</h4>
                        {['Yes', 'No', 'Not Sure'].map((option) => (
                          <label key={option} className="flex items-center space-x-2">
                            <input
                              type="radio"
                              name="family_illness"
                              value={option.toLowerCase()}
                              checked={formData.vaccinationHistory.family_illness === option.toLowerCase()}
                              onChange={(e) => setFormData({
                                ...formData,
                                vaccinationHistory: {
                                  ...formData.vaccinationHistory,
                                  family_illness: e.target.value
                                }
                              })}
                              className="w-4 h-4 text-amber-600"
                            />
                            <span className="text-sm text-amber-900">{option}</span>
                          </label>
                        ))}
                      </div>
                    </div>

                    {/* Vaccine Groups */}
                    <div className="space-y-6">
                      {/* Childhood Vaccines */}
                      <div className="space-y-2">
                        <h4 className="text-sm font-semibold text-amber-800">2. Childhood Vaccines (0-10 years)</h4>
                        {['Polio', 'BCG', 'DPT', 'Measles-Rubella', 'Rotavirus', 'Pneumococcal', 'Typhoid'].map((vaccine) => (
                          <label key={vaccine} className="flex items-center space-x-2">
                            <input
                              type="checkbox"
                              checked={formData.vaccinationHistory.childhood_vaccines.includes(vaccine)}
                              onChange={(e) => {
                                const vaccines = e.target.checked
                                  ? [...formData.vaccinationHistory.childhood_vaccines, vaccine]
                                  : formData.vaccinationHistory.childhood_vaccines.filter(v => v !== vaccine);
                                setFormData({
                                  ...formData,
                                  vaccinationHistory: {
                                    ...formData.vaccinationHistory,
                                    childhood_vaccines: vaccines
                                  }
                                });
                              }}
                              className="w-4 h-4 text-amber-600 rounded border-2"
                            />
                            <span className="text-sm text-amber-900">{vaccine}</span>
                          </label>
                        ))}
                      </div>

                      {/* Older Vaccines */}
                      <div className="space-y-2">
                        <h4 className="text-sm font-semibold text-amber-800">3. Vaccines for 10+ Years</h4>
                        {['Tetanus Booster', 'Hepatitis B', 'HPV', 'Chickenpox'].map((vaccine) => (
                          <label key={vaccine} className="flex items-center space-x-2">
                            <input
                              type="checkbox"
                              checked={formData.vaccinationHistory.older_vaccines.includes(vaccine)}
                              onChange={(e) => {
                                const vaccines = e.target.checked
                                  ? [...formData.vaccinationHistory.older_vaccines, vaccine]
                                  : formData.vaccinationHistory.older_vaccines.filter(v => v !== vaccine);
                                setFormData({
                                  ...formData,
                                  vaccinationHistory: {
                                    ...formData.vaccinationHistory,
                                    older_vaccines: vaccines
                                  }
                                });
                              }}
                              className="w-4 h-4 text-amber-600 rounded border-2"
                            />
                            <span className="text-sm text-amber-900">{vaccine}</span>
                          </label>
                        ))}
                      </div>

                      {/* Recent Vaccines */}
                      <div className="space-y-2">
                        <h4 className="text-sm font-semibold text-amber-800">4. Recent Vaccines</h4>
                        {['COVID-19', 'Flu', 'Hepatitis B Booster', 'Rabies'].map((vaccine) => (
                          <label key={vaccine} className="flex items-center space-x-2">
                            <input
                              type="checkbox"
                              checked={formData.vaccinationHistory.recent_vaccines.includes(vaccine)}
                              onChange={(e) => {
                                const vaccines = e.target.checked
                                  ? [...formData.vaccinationHistory.recent_vaccines, vaccine]
                                  : formData.vaccinationHistory.recent_vaccines.filter(v => v !== vaccine);
                                setFormData({
                                  ...formData,
                                  vaccinationHistory: {
                                    ...formData.vaccinationHistory,
                                    recent_vaccines: vaccines
                                  }
                                });
                              }}
                              className="w-4 h-4 text-amber-600 rounded border-2"
                            />
                            <span className="text-sm text-amber-900">{vaccine}</span>
                          </label>
                        ))}
                      </div>

                      {/* Major Infections */}
                      <div className="space-y-2">
                        <h4 className="text-sm font-semibold text-amber-800">5. Recent Major Infections</h4>
                        {['Fever', 'Tuberculosis', 'Dengue', 'Malaria', 'Typhoid', 'Pneumonia'].map((infection) => (
                          <label key={infection} className="flex items-center space-x-2">
                            <input
                              type="checkbox"
                              checked={formData.vaccinationHistory.major_infections.includes(infection)}
                              onChange={(e) => {
                                const infections = e.target.checked
                                  ? [...formData.vaccinationHistory.major_infections, infection]
                                  : formData.vaccinationHistory.major_infections.filter(v => v !== infection);
                                setFormData({
                                  ...formData,
                                  vaccinationHistory: {
                                    ...formData.vaccinationHistory,
                                    major_infections: infections
                                  }
                                });
                              }}
                              className="w-4 h-4 text-amber-600 rounded border-2"
                            />
                            <span className="text-sm text-amber-900">{infection}</span>
                          </label>
                        ))}
                      </div>
                    </div>
                  </div>
                </section>
              )}
              {activeSection === 'prescription' && (
                <section className="bg-emerald-100/80 p-6 rounded-2xl shadow-sm border border-emerald-200 backdrop-blur-sm">
                  <h3 className="text-lg font-medium text-emerald-900 mb-4 font-[600] tracking-wide">Prescription & Follow-up</h3>
                  <div className="space-y-6">
                    {/* Medications Section */}
                    <div className="space-y-4">
                      <div className="flex justify-between items-center">
                        <h4 className="text-sm font-semibold text-emerald-800">Medications</h4>
                        <button
                          type="button"
                          onClick={() => setShowAddMedicineForm(true)}
                          className="px-3 py-1.5 text-sm bg-emerald-500 text-white rounded-lg hover:bg-emerald-600"
                        >
                          Add Medicine
                        </button>
                      </div>

                      {/* Add Medicine Form */}
                      {showAddMedicineForm && (
                        <div className="bg-white p-4 rounded-lg border border-emerald-100 space-y-4">
                          <div className="grid grid-cols-3 gap-4">
                            <div>
                              <label className="block text-sm font-medium text-emerald-900 mb-2">Medicine Name</label>
                              <input
                                type="text"
                                value={newMedicine.medicine_name}
                                onChange={(e) => setNewMedicine({...newMedicine, medicine_name: e.target.value})}
                                className="w-full px-3 py-2 rounded-lg border border-emerald-100"
                              />
                            </div>
                            <div>
                              <label className="block text-sm font-medium text-emerald-900 mb-2">Dosage</label>
                              <input
                                type="text"
                                list="dosageOptions"
                                value={newMedicine.dosage}
                                onChange={(e) => setNewMedicine({...newMedicine, dosage: e.target.value})}
                                className="w-full px-3 py-2 rounded-lg border border-emerald-100"
                                placeholder="Select or enter dosage"
                              />
                              <datalist id="dosageOptions">
                                <option value="1 tablet"/>
                                <option value="2 tablets"/>
                                <option value="5ml"/>
                                <option value="10ml"/>
                                <option value="1 drop"/>
                                <option value="1 patch"/>
                              </datalist>
                            </div>
                            <div>
                              <label className="block text-sm font-medium text-emerald-900 mb-2">Quantity</label>
                              <input
                                type="number"
                                value={newMedicine.quantity}
                                onChange={(e) => setNewMedicine({...newMedicine, quantity: Number(e.target.value)})}
                                className="w-full px-3 py-2 rounded-lg border border-emerald-100"
                                placeholder="Enter quantity"
                              />
                            </div>
                            <div>
                              <label className="block text-sm font-medium text-emerald-900 mb-2">Frequency</label>
                              <input
                                type="text"
                                list="frequencyOptions"
                                value={newMedicine.frequency}
                                onChange={(e) => setNewMedicine({...newMedicine, frequency: e.target.value})}
                                className="w-full px-3 py-2 rounded-lg border border-emerald-100"
                                placeholder="Select or enter frequency"
                              />
                              <datalist id="frequencyOptions">
                                <option value="Once daily"/>
                                <option value="Twice daily"/>
                                <option value="Thrice daily"/>
                                <option value="Every 6 hours"/>
                                <option value="Every night"/>
                                <option value="As needed"/>
                              </datalist>
                            </div>
                            <div>
                              <label className="block text-sm font-medium text-emerald-900 mb-2">Duration</label>
                              <input
                                type="text"
                                list="durationOptions"
                                value={newMedicine.duration}
                                onChange={(e) => setNewMedicine({...newMedicine, duration: e.target.value})}
                                className="w-full px-3 py-2 rounded-lg border border-emerald-100"
                                placeholder="Select or enter duration"
                              />
                              <datalist id="durationOptions">
                                <option value="3 days"/>
                                <option value="5 days"/>
                                <option value="7 days"/>
                                <option value="10 days"/>
                                <option value="14 days"/>
                                <option value="Until finished"/>
                              </datalist>
                            </div>
                          </div>
                          <div className="flex justify-end space-x-3">
                            <button
                              type="button"
                              onClick={() => setShowAddMedicineForm(false)}
                              className="px-3 py-1.5 text-sm text-gray-600 hover:bg-gray-100 rounded-lg"
                            >
                              Cancel
                            </button>
                            <button
                              type="button"
                              onClick={addMedicine}
                              className="px-3 py-1.5 text-sm bg-emerald-500 text-white rounded-lg hover:bg-emerald-600"
                            >
                              Add Medicine
                            </button>
                          </div>
                        </div>
                      )}

                      {/* Display Added Medications */}
                      {formData.prescription.medications.map((med, index) => (
                        <div key={index} className="bg-white p-4 rounded-lg border border-emerald-100">
                          <div className="grid grid-cols-5 gap-4 text-sm">
                            <div>
                              <span className="font-medium">Medicine:</span>
                              <p>{med.medicine_name}</p>
                            </div>
                            <div>
                              <span className="font-medium">Dosage:</span>
                              <p>{med.dosage}</p>
                            </div>
                            <div>
                              <span className="font-medium">Quantity:</span>
                              <p>{med.quantity}</p>
                            </div>
                            <div>
                              <span className="font-medium">Frequency:</span>
                              <p>{med.frequency}</p>
                            </div>
                            <div>
                              <span className="font-medium">Duration:</span>
                              <p>{med.duration} days</p>
                            </div>
                          </div>
                          <button
                            type="button"
                            onClick={() => {
                              const updatedMeds = [...formData.prescription.medications];
                              updatedMeds.splice(index, 1);
                              setFormData({
                                ...formData,
                                prescription: {...formData.prescription, medications: updatedMeds}
                              });
                            }}
                            className="text-red-500 text-sm mt-2 hover:text-red-600"
                          >
                            Remove
                          </button>
                        </div>
                      ))}
                    </div>

                    {/* Follow-up Date with Calendar */}
                    <div>
                      <label className="block text-sm font-medium text-emerald-900 mb-2">Follow-up Date</label>
                      <input
                        type="date"
                        value={formData.prescription.follow_up_date}
                        onChange={(e) => setFormData({
                          ...formData,
                          prescription: {...formData.prescription, follow_up_date: e.target.value}
                        })}
                        className="w-full px-4 py-3 rounded-xl border-2 border-emerald-100 bg-white focus:border-emerald-400"
                        min={new Date().toISOString().split('T')[0]}
                      />
                    </div>

                    {/* Existing Lifestyle Advice and Lab Tests */}
                    <div>
                      <label className="block text-sm font-medium text-emerald-900 mb-2">Lifestyle Advice</label>
                      <textarea
                        value={formData.prescription.lifestyle_advice}
                        onChange={(e) => setFormData({...formData, prescription: {...formData.prescription, lifestyle_advice: e.target.value}})}
                        className="w-full px-4 py-3 rounded-xl border-2 border-emerald-100 bg-white focus:border-emerald-400 focus:ring-2 focus:ring-emerald-200 focus:ring-opacity-50 transition-all duration-200 font-[500] h-32"
                        placeholder="Enter lifestyle recommendations..."
                      />
                    </div>

                    {/* Lab Tests Section */}
                    <div>
                      <label className="block text-sm font-medium text-emerald-900 mb-2">Lab Tests</label>
                      <div className="flex gap-2 mb-2 relative">
                        <input
                          type="text"
                          value={newLabTest}
                          onChange={(e) => setNewLabTest(e.target.value)}
                          className="flex-1 px-4 py-2 rounded-lg border-2 border-emerald-200"
                          placeholder="Enter lab test name"
                          list="labTestRecommendations"
                        />
                        <datalist id="labTestRecommendations">
                          {LAB_TEST_RECOMMENDATIONS.map((test, index) => (
                            <option key={index} value={test} />
                          ))}
                        </datalist>
                        <button
                          type="button"
                          onClick={addLabTest}
                          className="px-4 py-2 bg-emerald-500 text-white rounded-lg hover:bg-emerald-600 transition-colors"
                        >
                          Add Test
                        </button>
                      </div>
                      <div className="grid grid-cols-2 md:grid-cols-3 gap-2 mb-4">
                        {LAB_TEST_RECOMMENDATIONS.filter(test => 
                          test.toLowerCase().includes(newLabTest.toLowerCase())
                        ).slice(0, 6).map((test, index) => (
                          <button
                            key={index}
                            type="button"
                            onClick={() => {
                              setNewLabTest(test);
                              addLabTest();
                            }}
                            className="text-sm p-2 bg-emerald-100 hover:bg-emerald-200 rounded-md transition-colors"
                          >
                            {test}
                          </button>
                        ))}
                      </div>
                      <div className="space-y-2">
                        {formData.prescription.lab_tests.map((test, index) => (
                          <div key={index} className="flex items-center justify-between bg-emerald-50 p-2 rounded-lg">
                            <span className="text-sm text-emerald-900">{test}</span>
                            <button
                              type="button"
                              onClick={() => removeLabTest(index)}
                              className="text-red-500 hover:text-red-700"
                            >
                              <X className="h-4 w-4" />
                            </button>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </section>
              )}
            </div>

            <div className="sticky bottom-0 bg-gray-50 pt-4 pb-6 flex justify-end space-x-4">
              <button
                type="button"
                className="px-5 py-2.5 text-sm font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors duration-200 font-[600]"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-5 py-2.5 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-lg shadow-sm transition-all duration-200 font-[600] hover:shadow-md"
              >
                Save Health Report
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};