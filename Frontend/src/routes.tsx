import { createBrowserRouter } from 'react-router-dom';
import App from './App';
import { Login } from './pages/Login';
import { RoleSelection } from './pages/RoleSelection';
import { DoctorLogin } from './pages/DoctorLogin';
import { AssistantLogin } from './pages/AssistantLogin';
import { AdminDashboard } from './pages/AdminDashboard';
import { DoctorDashboard } from './pages/DoctorDashboard';
import { AssistantDashboard } from './pages/AssistantDashboard';
// import { AppointmentManagement } from './components/assistant/AppointmentManagement';
// import { ChatSection } from './components/chat/ChatSection';
// import { DoctorManagement } from './components/admin/DoctorManagement';
// import { HealthAnalytics } from './components/admin/HealthAnalytics';
// import { PatientList } from './components/doctor/PatientList';
import { HealthReportPage } from './pages/HealthReportPage';
import { AIChatPage } from './pages/AIChatPage';
import { AuthGuard } from './components/AuthGuard';
import { AssistantAuthGuard } from './components/AssistantAuthGuard';
import AdminLogin from './pages/AdminLogin';
import CheckHistory from './components/doctor/CheckHistory';
import { MedicineManagement } from './components/doctor/MedicineManagement';
import { AllSeenPatients } from './components/doctor/AllSeenPatients';
import { CommunityHealth } from './components/doctor/CommunityHealth';

export const router = createBrowserRouter([
  {
    path: '/',
    element: <App />,
  },
  {
    path: '/login',
    element: <Login />,
  },
  {
    path: '/role-selection',
    element: <RoleSelection />,
  },
  {
    path: '/doctor/login',
    element: <DoctorLogin />,
  },
  {
    path: '/assistant/login',
    element: <AssistantLogin />,
  },
  {
    path: '/admin',
    element: <AuthGuard><AdminDashboard /></AuthGuard>,
  },
  {
    path: '/doctor',
    element: <AuthGuard><DoctorDashboard /></AuthGuard>,
    children: [
      {
        index: true,
        element: <div>Select a section from the sidebar</div>
      },
      {
        path: 'patients',
        element: <AllSeenPatients />
      },
      {
        path: 'medicine-management',
        element: <MedicineManagement />
      },
      {
        path: 'messages',
        element: <div>Messages Content</div>
      },
      {
        path: 'community-health',
        element: <CommunityHealth />
      },
    ]
  },
  {
    path: '/doctor/appointments',
    element: <DoctorDashboard />,
  },
  {
    path: '/doctor/analytics',
    element: <DoctorDashboard />,
  },
  {
    path: '/doctor/health-report/:appointmentId',
    element: (
      <AuthGuard>
        <HealthReportPage />
      </AuthGuard>
    ),
  },
  {
    path: '/assistant',
    element: <AssistantAuthGuard><AssistantDashboard /></AssistantAuthGuard>,
  },
  {
    path: '/assistant/appointments',
    element: <AssistantAuthGuard><AssistantDashboard /></AssistantAuthGuard>,
  },
  {
    path: '/assistant/doctors',
    element: <AssistantAuthGuard><AssistantDashboard /></AssistantAuthGuard>,
  },
  {
    path: '/assistant/analytics',
    element: <AssistantAuthGuard><AssistantDashboard /></AssistantAuthGuard>,
  },
  {
    path: '/assistant/messages',
    element: <AssistantAuthGuard><AssistantDashboard /></AssistantAuthGuard>,
  },
  {
    path: '/assistant/community-health',
    element: <AssistantAuthGuard><AssistantDashboard /></AssistantAuthGuard>,
  },
  {
    path: '/assistant/dashboard',
    element: <AssistantAuthGuard><AssistantDashboard /></AssistantAuthGuard>,
  },
  {
    path: '/health-report/:appointmentId',
    element: <HealthReportPage />,
  },
  {
    path: '/doctor/chat-ai',
    element: <AuthGuard><AIChatPage /></AuthGuard>
  },
  {
    path: '/admin-login',
    element: <AdminLogin />,
  },
  {
    path: '/doctor/patient-history/:visitPatientId',
    element: (
      <AuthGuard>
        <CheckHistory />
      </AuthGuard>
    ),
    errorElement: <div className="p-4 text-red-500">Error loading patient history</div>
  }
]);