import React, { useState, useEffect, useCallback } from 'react';
import { Search, Edit2, Trash2, Eye, Plus, FileText, Phone, MapPin, Activity } from 'lucide-react';
import { supabase } from '../../lib/supabase';
import { AddAppointmentModal } from './AddAppointmentModal';
import { HealthReportForm } from './HealthReportForm';

interface AppointmentListProps {
  doctorRefId: string;
}

export const AppointmentList: React.FC<AppointmentListProps> = ({ doctorRefId }) => {
  const [showAddModal, setShowAddModal] = useState(false);
  const [appointments, setAppointments] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedRegion, setSelectedRegion] = useState('');
  const [selectedStatus, setSelectedStatus] = useState('all');
  const [selectedDate, setSelectedDate] = useState<string>('');
  const [regions, setRegions] = useState<any[]>([]);
  const [seenAppointments, setSeenAppointments] = useState<string[]>([]);
  const [selectedAppointment, setSelectedAppointment] = useState<any>(null);
  const [showHealthReport, setShowHealthReport] = useState(false);
  const [selectedPatientForReport, setSelectedPatientForReport] = useState<any>(null);

  const fetchAppointments = useCallback(async () => {
    if (!doctorRefId) return;

    try {
      setLoading(true);
      
      let query = supabase
        .from('appointments')
        .select('*, regions(name)')
        .eq('doctor_id', doctorRefId);

      // Region filter - find ID from selected name
      if (selectedRegion) {
        const selectedRegionData = regions.find(r => r.name === selectedRegion);
        if (selectedRegionData) {
          query = query.eq('region_id', selectedRegionData.region_id);
        }
      }

      // Search filter
      if (searchTerm) {
        query = query.ilike('patient_name', `%${searchTerm}%`);
      }

      // Date filtering
      const filterDate = selectedDate ? new Date(selectedDate) : new Date();
      filterDate.setHours(0, 0, 0, 0);
      const endDate = new Date(filterDate);
      endDate.setDate(endDate.getDate() + 1);

      query = query
        .gte('appointment_date', filterDate.toISOString())
        .lt('appointment_date', endDate.toISOString());

      if (selectedStatus !== 'all') {
        query = query.eq('status', selectedStatus);
      }

      let { data, error } = await query;
      if (error) throw error;

      setAppointments(data || []);
    } catch (error) {
      console.error('Error fetching appointments:', error);
    } finally {
      setLoading(false);
    }
  }, [doctorRefId, selectedDate, selectedStatus, searchTerm, selectedRegion]);

  useEffect(() => {
    if (doctorRefId) {
      fetchRegions();
      fetchAppointments();
      fetchSeenAppointments(doctorRefId);
    } else {
      console.warn('No doctorRefId provided to AppointmentList');
    }
  }, [doctorRefId, fetchAppointments]);

  const fetchSeenAppointments = async (doctorRefId: string) => {
    try {
      const { data, error } = await supabase
        .from('seen_patients')
        .select('appointment_id')
        .eq('doctor_id', doctorRefId);

      if (error) throw error;
      setSeenAppointments(data?.map(item => item.appointment_id) || []);
    } catch (error) {
      console.error('Error fetching seen appointments:', error);
    }
  };

  const fetchRegions = async () => {
    try {
      const { data, error } = await supabase
        .from('regions')
        .select('*')
        .order('name', { ascending: true });

      if (error) throw error;
      setRegions(data || []);
    } catch (error) {
      console.error('Error fetching regions:', error);
    }
  };

  const handleMarkSeen = async (appointmentId: string) => {
    try {
      // Get doctor data from localStorage
      const doctor = localStorage.getItem('doctor');
      if (!doctor) {
        console.error('No doctor data found');
        return;
      }
      
      const doctorData = JSON.parse(doctor);
      const doctorRefId = doctorData.ref_id;

      // Insert into seen_patients table
      const { error } = await supabase
        .from('seen_patients')
        .insert([{
          appointment_id: appointmentId,
          doctor_id: doctorRefId, // Use the doctor's ref_id
          seen_at: new Date().toISOString()
        }]);

      if (error) {
        console.error('Error marking as seen:', error);
        throw error;
      }
      
      // Update local state to reflect the change
      setSeenAppointments(prev => [...prev, appointmentId]);

      // Optionally refresh the appointments list
      await fetchAppointments();
    } catch (error) {
      console.error('Error marking appointment as seen:', error);
    }
  };

  const handleDelete = async (id: string) => {
    if (confirm('Are you sure you want to delete this appointment?')) {
      try {
        const { error } = await supabase
          .from('appointments')
          .delete()
          .eq('id', id);

        if (error) throw error;
        await fetchAppointments();
      } catch (error) {
        console.error('Error deleting appointment:', error);
      }
    }
  };

  const handleReset = () => {
    setSearchTerm('');
    setSelectedRegion('');
    setSelectedStatus('all');
    setSelectedDate('');
    fetchAppointments();
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'critical':
        return 'text-red-600 bg-red-100';
      case 'medium':
        return 'text-yellow-600 bg-yellow-100';
      case 'low':
        return 'text-green-600 bg-green-100';
      default:
        return 'text-gray-600 bg-gray-100';
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-md">
      <div className="p-6 border-b border-gray-200">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-semibold text-gray-800">Appointments Management</h2>
          <button
            onClick={() => setShowAddModal(true)}
            className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            <Plus className="h-5 w-5 mr-2" />
            Add Appointment
          </button>
        </div>

        <div className="bg-white p-4 rounded-lg shadow mb-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="relative">
              <input
                type="text"
                placeholder="Search patients..."
                value={searchTerm}
                onChange={(e) => {
                  setSearchTerm(e.target.value);
                  fetchAppointments();
                }}
                className="w-full pl-10 pr-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
              />
              <Search className="absolute left-3 top-2.5 text-gray-400 w-5 h-5" />
            </div>

            <select
              value={selectedRegion}
              onChange={(e) => setSelectedRegion(e.target.value)}
              className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
            >
              <option value="">All Regions</option>
              {regions.map((region) => (
                <option key={region.region_id} value={region.name}>
                  {region.name}
                </option>
              ))}
            </select>

            <select
              value={selectedStatus}
              onChange={(e) => setSelectedStatus(e.target.value)}
              className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
            >
              <option value="all">All Status</option>
              <option value="critical">Critical</option>
              <option value="medium">Medium</option>
              <option value="low">Low</option>
            </select>

            <div className="flex space-x-2">
              <input
                type="date"
                value={selectedDate || ''}
                onChange={(e) => setSelectedDate(e.target.value)}
                className="flex-1 px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
              />
              <button
                onClick={handleReset}
                className="px-4 py-2 bg-gray-100 text-gray-600 rounded-lg hover:bg-gray-200"
              >
                Reset
              </button>
            </div>
          </div>
        </div>

        <div className="overflow-x-auto">
          {loading ? (
            <div className="text-center py-8">
              <p className="text-gray-600">Loading appointments...</p>
            </div>
          ) : appointments.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-gray-600">No appointments found</p>
            </div>
          ) : (
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Patient Name
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Appointment Date
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Patient ID
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Region
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Contact
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {appointments.map((appointment) => (
                  <tr key={appointment.id} className={`hover:bg-gray-50 ${
                    seenAppointments.includes(appointment.id) ? 'bg-green-50' : ''
                  }`}>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="text-sm font-medium text-gray-900">
                        {appointment.patient_name}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="text-sm text-gray-900">
                        {new Date(appointment.appointment_date).toLocaleDateString()}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="text-sm text-gray-900">
                        {appointment.visit_patient_id || 'N/A'}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <MapPin className="h-4 w-4 text-gray-400 mr-2" />
                        <span className="text-sm text-gray-900">
                          {appointment.region_name}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <Phone className="h-4 w-4 text-gray-400 mr-2" />
                        <span className="text-sm text-gray-900">
                          {appointment.patient_phone}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusColor(appointment.status)}`}>
                        {appointment.status.charAt(0).toUpperCase() + appointment.status.slice(1)}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium space-x-3">
                      {!seenAppointments.includes(appointment.id) && (
                        <button
                          onClick={() => handleMarkSeen(appointment.id)}
                          className="text-blue-600 hover:text-blue-900"
                          title="Mark as Seen"
                        >
                          <Eye className="h-5 w-5" />
                        </button>
                      )}
                      {/* <button
                        onClick={() => {
                          setSelectedPatientForReport(appointment);
                          setShowHealthReport(true);
                        }}
                        className="text-green-600 hover:text-green-900"
                        title="Add Health Report"
                      >
                        <FileText className="h-5 w-5" />
                      </button> */}
                      <button
  onClick={() => {
    console.log("Setting selected patient:", appointment); // Debugging log
    setSelectedPatientForReport(appointment);
    setShowHealthReport(true);
  }}
  className="text-green-600 hover:text-green-900"
  title="Add Health Report"
>
  <FileText className="h-5 w-5" />
</button>

                      <button
                        onClick={() => handleDelete(appointment.id)}
                        className="text-red-600 hover:text-red-900"
                        title="Delete"
                      >
                        <Trash2 className="h-5 w-5" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>

      {showAddModal && (
        <AddAppointmentModal
          doctorRefId={doctorRefId}
          onClose={() => setShowAddModal(false)}
          onSuccess={() => {
            setShowAddModal(false);
            fetchAppointments();
          }}
        />
      )}

      {showHealthReport && selectedPatientForReport && (
        <HealthReportForm
          patientId={selectedPatientForReport.id}
          patientName={selectedPatientForReport.patient_name}
          patientPhone={selectedPatientForReport.patient_phone}
          regionName={selectedPatientForReport.region_name}
          regionId={selectedPatientForReport.region_id}
          onClose={() => {
            setShowHealthReport(false);
            setSelectedPatientForReport(null);
            
          }}
          
        />
      )}



    </div>
    
  );
  
};