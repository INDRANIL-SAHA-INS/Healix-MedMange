import React, { useEffect, useState } from 'react';
import { Layout } from '../components/layout/Layout';
import { DoctorList } from '../components/assistant/DoctorList';
import { AppointmentManagement } from '../components/assistant/AppointmentManagement';
import { ChatSection } from '../components/chat/ChatSection';
import { useLocation, useNavigate } from 'react-router-dom';
import { useAssistant } from '../hooks/useAssistant';
import { Loader } from 'lucide-react';


export const AssistantDashboard = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { assistant, loading } = useAssistant();

  useEffect(() => {
    // Add this console log
    console.log('Current assistant data in dashboard:', assistant);
    
    if (!assistant && !loading) {
      navigate('/assistant/login');
    }
  }, [assistant, loading, navigate]);

  const renderContent = () => {
    if (loading) {
      return (
        <div className="flex items-center justify-center min-h-screen">
          <Loader className="w-8 h-8 animate-spin" />
        </div>
      );
    }

    if (!assistant) {
      return null;
    }

    switch (location.pathname) {
      case '/assistant/appointments':
        return <AppointmentManagement assistantId={assistant.id} regionId={assistant.region_id} />;
      case '/assistant/doctors':
        return <DoctorList regionId={assistant.region_id} />;
      case '/assistant/messages':
        return <ChatSection userRole="assistant" userId={assistant.id} />;
      case '/assistant/community-health':
        // return <CommunityHealth />;
        break;
      default:
        return <DoctorList regionId={assistant.region_id} />;
    }
  };

  if (!assistant && !loading) {
    return null;
  }

  return (
    <Layout 
      userType="assistant" 
      userName={assistant?.username || ''}
      userRegion={assistant?.region_name || ''}
    >
      <div className="p-6">
        {renderContent()}
      </div>
    </Layout>
  );
};