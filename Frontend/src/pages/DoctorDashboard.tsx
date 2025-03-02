import React, { useState, useEffect } from 'react';
import { Calendar, ClipboardList, Activity, Loader } from 'lucide-react';
import { Layout } from '../components/layout/Layout';
// import { StatCard } from '../components/dashboard/StatCard';
import { AppointmentList } from '../components/doctor/AppointmentList';
import { CommunityHealth } from '../components/doctor/CommunityHealth';
// import { AllPatientsList } from '../components/doctor/AllPatientsList';
import { ChatSection } from '../components/chat/ChatSection';
import { supabase } from '../lib/supabase';
import { useLocation } from 'react-router-dom';
import { useDoctor } from '../hooks/useDoctor';
import { AllSeenPatients } from '../components/doctor/AllSeenPatients';
import { AddAppointmentModal } from '../components/doctor/AddAppointmentModal';
import { SpeechTranslator } from '../components/doctor/SpeechTranslator';
import { MedicineManagement } from '../components/doctor/MedicineManagement';

// Remove the entire Dashboard component as it's not needed

export const DoctorDashboard = () => {
  const { doctor, loading } = useDoctor();
  const location = useLocation();
  const [appointmentsCount, setAppointmentsCount] = useState(0);
  const [patientsCount, setPatientsCount] = useState(0);
  const [pendingReports, setPendingReports] = useState(0);
  const [showAddAppointmentModal, setShowAddAppointmentModal] = useState(false);
  const [todaysAppointments, setTodaysAppointments] = useState<any[]>([]);

  useEffect(() => {
    if (doctor?.id) {
      fetchTodaysAppointments();
      fetchDashboardStats();
    }
  }, [doctor]);

  const fetchDashboardStats = async () => {
    if (!doctor?.id) return;

    try {
      // Get today's date in the correct format (start of day to end of day)
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      const tomorrow = new Date(today);
      tomorrow.setDate(tomorrow.getDate() + 1);

      const { data: appointments, error: appointmentsError } = await supabase
        .from('appointments')
        .select('*')
        .eq('doctor_id', doctor.id)
        .gte('appointment_date', today.toISOString())
        .lt('appointment_date', tomorrow.toISOString());

      if (appointmentsError) throw appointmentsError;
      setAppointmentsCount(appointments?.length || 0);

      const { data: patients, error: patientsError } = await supabase
        .from('appointments')
        .select('patient_name', { count: 'exact', head: true })
        .eq('doctor_id', doctor.id);

      if (patientsError) throw patientsError;
      setPatientsCount(patients?.length || 0);

      setPendingReports(Math.floor(Math.random() * 5));
    } catch (error) {
      console.error('Error fetching dashboard stats:', error);
    }
  };

  const fetchTodaysAppointments = async () => {
    if (!doctor?.id) return;

    try {
      // Get current UTC date boundaries
      const nowUTC = new Date();
      const todayStartUTC = new Date(Date.UTC(
        nowUTC.getUTCFullYear(),
        nowUTC.getUTCMonth(),
        nowUTC.getUTCDate(),
        0, 0, 0, 0 // Explicitly set hours/minutes/seconds
      ));
      const todayEndUTC = new Date(todayStartUTC);
      todayEndUTC.setUTCDate(todayEndUTC.getUTCDate() + 1);

      console.log('Fetching appointments between:', {
        start: todayStartUTC.toISOString(),
        end: todayEndUTC.toISOString(),
        doctorId: doctor.id
      });

      const { data, error } = await supabase
        .from('appointments')
        .select('id, appointment_date')
        .eq('doctor_id', doctor.id)
        .gte('appointment_date', todayStartUTC.toISOString())
        .lt('appointment_date', todayEndUTC.toISOString());

      console.log('Raw appointment data:', data);

      if (error) throw error;
      setTodaysAppointments(data || []);
    } catch (error) {
      console.error("Error fetching today's appointments:", error);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader className="w-8 h-8 animate-spin" />
      </div>
    );
  }

  if (!doctor) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <p className="text-red-500">Unable to load doctor information. Please try logging in again.</p>
      </div>
    );
  }

  const renderContent = () => {
    switch (location.pathname) {
      case '/doctor/patients':
        return <AllSeenPatients doctorId={doctor.ref_id} />;
      case '/doctor/medicine-management':
        return <MedicineManagement />;
      case '/doctor/messages':
        return <ChatSection userRole="doctor" />;
      case '/doctor/community-health':
        return <CommunityHealth />;
      default:
        return (
          <div className="space-y-4">
            <div className="w-full">
              <SpeechTranslator variant="full" />
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Stats cards */}
            </div>
            <div>
              <AppointmentList doctorRefId={doctor.ref_id} />
            </div>
          </div>
        );
    }
  };

  return (
    <Layout 
      userType="doctor"
      userName={doctor?.username || ''}
      userRegion={doctor?.department || ''}
    >
      <div className="space-y-6">
        <h1 className="text-2xl font-semibold text-gray-900">
          Welcome, Dr. {doctor?.username}
        </h1>

        {showAddAppointmentModal && (
          <AddAppointmentModal
            doctorRefId={doctor.ref_id} 
            onClose={() => setShowAddAppointmentModal(false)}
            onSuccess={() => {
              setShowAddAppointmentModal(false);
              // Optionally refresh appointment list here
            }}
          />
        )}

        {renderContent()}
      </div>
    </Layout>
  );
};