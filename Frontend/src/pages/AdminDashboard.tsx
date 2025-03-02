import React, { useState, useEffect } from 'react';
import { 
  Users, Calendar, BarChart3, UserPlus, FileText, Settings, 
  Building, MessageCircle, X, DollarSign, Activity, 
  ClipboardList, AlertCircle 
} from 'lucide-react';
import { StatCard } from '../components/dashboard/StatCard';
import { DashboardHeader } from '../components/dashboard/DashboardHeader';
import { QuickActions } from '../components/dashboard/QuickActions';
import { RecentActivity } from '../components/dashboard/RecentActivity';
import { ChatSection } from '../components/chat/ChatSection';
import { AddUserModal } from '../components/admin/AddUserModal';
import { DepartmentOverview } from '../components/admin/DepartmentOverview';
import { AppointmentsOverview } from '../components/admin/AppointmentsOverview';
import { supabase } from '../lib/supabase';
import { DoctorManagement } from '../components/admin/DoctorManagement';
import { RegionManagement } from '../components/admin/RegionManagement';
import { AssistantManagement } from '../components/admin/AssistantManagement';
import { useNavigate } from 'react-router-dom';

export const AdminDashboard = () => {
  const [showChat, setShowChat] = useState(false);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showUserManagement, setShowUserManagement] = useState(false);
  const [userType, setUserType] = useState<'doctor' | 'assistant' | 'lab_partner' | null>(null);
  const [showAppointments, setShowAppointments] = useState(false);
  const [showDoctorManagement, setShowDoctorManagement] = useState(false);
  const [showRegionManagement, setShowRegionManagement] = useState(false);
  const [showAssistantManagement, setShowAssistantManagement] = useState(false);
  const [totalDoctors, setTotalDoctors] = useState(0);
  const [totalAssistants, setTotalAssistants] = useState(0);
  const [totalPatients, setTotalPatients] = useState(0);
  const [totalRegions, setTotalRegions] = useState(0);
  const navigate = useNavigate();

  useEffect(() => {
    fetchAppointmentsCount();
    fetchUserStats();
  }, []);

  const fetchUserStats = async () => {
    const { data: doctors } = await supabase
      .from('doctors')
      .select('*', { count: 'exact' });
    
    const { data: assistants } = await supabase
      .from('assistants')
      .select('*', { count: 'exact' });
    
    const { data: patients } = await supabase
      .from('seen_patients')
      .select('*', { count: 'exact' });
    
    const { data: regions } = await supabase
      .from('regions')
      .select('*', { count: 'exact' });
    
    setTotalDoctors(doctors?.length || 0);
    setTotalAssistants(assistants?.length || 0);
    setTotalPatients(patients?.length || 0);
    setTotalRegions(regions?.length || 0);
  };

  const fetchAppointmentsCount = async () => {
    const { count } = await supabase
      .from('appointments')
      .select('*', { count: 'exact' });
    
    if (count !== null) {
      setAppointmentsCount(count);
    }
  };

  const stats = [
    { title: 'Total Doctors', value: totalDoctors.toString(), icon: Users, color: 'text-blue-600' },
    { title: 'Total Assistants', value: totalAssistants.toString(), icon: Users, color: 'text-green-600' },
    { title: 'Total Patients', value: totalPatients.toString(), icon: Users, color: 'text-purple-600' },
    { title: 'Total Regions', value: totalRegions.toString(), icon: Building, color: 'text-yellow-600' },
  ];

  const quickActions = [
    {
      title: 'Manage Doctors',
      icon: <UserPlus className="h-6 w-6 text-blue-600" />,
      onClick: () => setShowDoctorManagement(true),
      color: 'bg-blue-600',
    },
    {
      title: 'Manage Assistants',
      icon: <UserPlus className="h-6 w-6 text-green-600" />,
      onClick: () => setShowAssistantManagement(true),
      color: 'bg-green-600',
    },
    {
      title: 'Manage Regions',
      icon: <Building className="h-6 w-6 text-yellow-600" />,
      onClick: () => setShowRegionManagement(true),
      color: 'bg-yellow-600',
    },
  ];

  const recentActivities = [
    {
      id: '1',
      type: 'New Doctor Added',
      description: 'Dr. Sarah Johnson joined Cardiology department',
      time: '2h ago',
    },
    {
      id: '2',
      type: 'Department Update',
      description: 'Neurology department schedule updated',
      time: '4h ago',
    },
    {
      id: '3',
      type: 'System Update',
      description: 'Monthly reports generated and sent to department heads',
      time: '6h ago',
    },
    {
      id: '4',
      type: 'Critical Case Alert',
      description: 'New critical case reported in Emergency Department',
      time: '1h ago',
    },
  ];

  const handleLogout = () => {
    // Clear all authentication data
    localStorage.removeItem('authToken');
    localStorage.removeItem('userRole');
    sessionStorage.clear();
    
    // Force redirect to role selection
    window.location.href = '/role-selection';
  };

  if (showChat) {
    return (
      <div className="min-h-screen bg-gray-50">
        <DashboardHeader 
          title="Messages" 
          userName="John Admin"
          onBack={() => setShowChat(false)}
        />
        <ChatSection userRole="admin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <DashboardHeader 
        title="Admin Dashboard" 
        userName="John Admin" 
        onLogout={handleLogout} 
      />
      
      <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 mb-6">
          {stats.map((item) => (
            <StatCard key={item.title} {...item} />
          ))}
        </div>

        <QuickActions actions={quickActions} />
      </main>

      {showAddModal && (
        <AddUserModal
          userType={userType}
          onClose={() => {
            setShowAddModal(false);
            setUserType(null);
          }}
        />
      )}

      {showAppointments && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg max-w-4xl w-full max-h-[80vh] overflow-y-auto">
            <div className="flex justify-between items-center p-4 border-b">
              <h2 className="text-xl font-semibold">Today's Appointments</h2>
              <button onClick={() => setShowAppointments(false)}>
                <X className="h-6 w-6" />
              </button>
            </div>
            <AppointmentsOverview />
          </div>
        </div>
      )}

      {showDoctorManagement && (
        <DoctorManagement
          onClose={() => setShowDoctorManagement(false)}
          onDoctorAdded={fetchUserStats}
        />
      )}

      {showRegionManagement && (
        <RegionManagement
          onClose={() => setShowRegionManagement(false)}
        />
      )}

      {showAssistantManagement && (
        <AssistantManagement
          onClose={() => setShowAssistantManagement(false)}
        />
      )}
    </div>
  );
};