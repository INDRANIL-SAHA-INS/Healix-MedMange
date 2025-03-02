import React, { useState, useEffect, useCallback } from 'react';
import { supabase } from '../../lib/supabase';
import { Loader, Search, Calendar, MapPin, Phone, User, Filter } from 'lucide-react';
import { Link } from 'react-router-dom';

interface AllSeenPatientsProps {
  doctorId: string;
}

interface SeenPatient {
  id: string;
  appointment_id: string;
  doctor_id: string;
  seen_at: string;
}

interface Appointment {
  id: string;
  visit_patient_id: string;
  patient_name: string;
  patient_phone: string;
  region_name: string;
  region_id: string;
  appointment_date: string;
  reason: string;
}

interface CombinedPatientData {
  seenPatient: SeenPatient;
  appointmentDetails: Appointment;
}

interface GroupedPatients {
  [key: string]: CombinedPatientData[];
}

export const AllSeenPatients: React.FC<AllSeenPatientsProps> = ({ doctorId }) => {
  const [groupedPatients, setGroupedPatients] = useState<GroupedPatients>({});
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedRegion, setSelectedRegion] = useState('');
  const [selectedDate, setSelectedDate] = useState('');
  const [regions, setRegions] = useState<string[]>([]);
  const [filteredGroupedPatients, setFilteredGroupedPatients] = useState<GroupedPatients>({});
  const [seenAppointments, setSeenAppointments] = useState<string[]>([]);

  const filterPatients = useCallback(() => {
    let filtered = { ...groupedPatients };

    if (selectedDate) {
      // Convert selected date to start of day in local timezone
      const selectedDateObj = new Date(selectedDate);
      selectedDateObj.setHours(0, 0, 0, 0);

      filtered = Object.entries(filtered).reduce((acc, [date, patients]) => {
        const filteredPatients = patients.filter(({ seenPatient }) => {
          const patientDate = new Date(seenPatient.seen_at);
          patientDate.setHours(0, 0, 0, 0);
          return patientDate.getTime() === selectedDateObj.getTime();
        });

        if (filteredPatients.length > 0) {
          // Use formatted date as key
          const formattedDate = selectedDateObj.toLocaleDateString('en-US', {
            weekday: 'long',
            year: 'numeric',
            month: 'long',
            day: 'numeric'
          });
          acc[formattedDate] = filteredPatients;
        }
        return acc;
      }, {} as GroupedPatients);
    }

    if (selectedRegion) {
      filtered = Object.entries(filtered).reduce((acc, [date, patients]) => {
        const filteredPatients = patients.filter(({ appointmentDetails }) => 
          appointmentDetails.region_name === selectedRegion
        );
        if (filteredPatients.length > 0) {
          acc[date] = filteredPatients;
        }
        return acc;
      }, {} as GroupedPatients);
    }

    if (searchTerm) {
      const searchLower = searchTerm.toLowerCase();
      filtered = Object.entries(filtered).reduce((acc, [date, patients]) => {
        const filteredPatients = patients.filter(({ appointmentDetails }) => 
          appointmentDetails.patient_name.toLowerCase().includes(searchLower) ||
          appointmentDetails.patient_phone.includes(searchTerm) ||
          appointmentDetails.id.includes(searchTerm)
        );
        if (filteredPatients.length > 0) {
          acc[date] = filteredPatients;
        }
        return acc;
      }, {} as GroupedPatients);
    }

    setFilteredGroupedPatients(filtered);
  }, [groupedPatients, searchTerm, selectedRegion, selectedDate]);

  useEffect(() => {
    fetchSeenPatients();
    fetchRegions();
  }, [doctorId]);

  useEffect(() => {
    filterPatients();
  }, [filterPatients]);

  const fetchRegions = async () => {
    try {
      const { data, error } = await supabase
        .from('regions')
        .select('name')
        .order('name');

      if (error) throw error;
      setRegions(data.map(r => r.name));
    } catch (error) {
      console.error('Error fetching regions:', error);
    }
  };

  const fetchSeenPatients = async () => {
    try {
      setLoading(true);
      console.log('Fetching seen patients for doctor:', doctorId);

      // First, get seen_patients data
      const { data: seenPatientsData, error: seenError } = await supabase
        .from('seen_patients')
        .select('*')
        .eq('doctor_id', doctorId)
        .order('seen_at', { ascending: false }); // Order by date descending

      if (seenError) {
        console.error('Error fetching seen patients:', seenError);
        throw seenError;
      }

      if (!seenPatientsData || seenPatientsData.length === 0) {
        setGroupedPatients({});
        setFilteredGroupedPatients({});
        return;
      }

      // Get all unique appointment_ids
      const appointmentIds = seenPatientsData.map(sp => sp.appointment_id);

      // Then fetch corresponding appointments
      const { data: appointmentsData, error: appointmentsError } = await supabase
        .from('appointments')
        .select(`
          id, 
          visit_patient_id,
          patient_name, 
          patient_phone, 
          region_name, 
          region_id,
          appointment_date, 
          reason
        `)
        .in('id', appointmentIds);

      if (appointmentsError) {
        console.error('Error fetching appointments:', appointmentsError);
        throw appointmentsError;
      }

      // Combine the data
      const combinedData = seenPatientsData
        .map(seenPatient => {
          const appointmentDetails = appointmentsData?.find(
            app => app.id === seenPatient.appointment_id
          );
          if (!appointmentDetails) return null;

          return {
            seenPatient,
            appointmentDetails: {
              ...appointmentDetails,
              patient_name: appointmentDetails.patient_name
                ? appointmentDetails.patient_name
                    .split(' ')
                    .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
                    .join(' ')
                : 'Unknown Patient'
            }
          };
        })
        .filter(Boolean);

      // Group by date with custom date formatting
      const grouped = combinedData.reduce((acc, data) => {
        const date = new Date(data.seenPatient.seen_at);
        const today = new Date();
        const yesterday = new Date(today);
        yesterday.setDate(yesterday.getDate() - 1);

        let dateLabel;
        if (date.toDateString() === today.toDateString()) {
          dateLabel = 'Today';
        } else if (date.toDateString() === yesterday.toDateString()) {
          dateLabel = 'Yesterday';
        } else {
          dateLabel = date.toLocaleDateString('en-US', {
            weekday: 'long',
            year: 'numeric',
            month: 'long',
            day: 'numeric'
          });
        }

        if (!acc[dateLabel]) {
          acc[dateLabel] = [];
        }
        acc[dateLabel].push(data);
        return acc;
      }, {} as GroupedPatients);

      // Sort dates to ensure Today and Yesterday appear first
      const sortedGrouped = Object.entries(grouped)
        .sort(([dateA], [dateB]) => {
          if (dateA === 'Today') return -1;
          if (dateB === 'Today') return 1;
          if (dateA === 'Yesterday') return -1;
          if (dateB === 'Yesterday') return 1;
          return new Date(dateB).getTime() - new Date(dateA).getTime();
        })
        .reduce((acc, [date, patients]) => {
          acc[date] = patients;
          return acc;
        }, {} as GroupedPatients);

      setGroupedPatients(sortedGrouped);
      setFilteredGroupedPatients(sortedGrouped);
    } catch (error) {
      console.error('Error in fetchSeenPatients:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleReset = () => {
    setSearchTerm('');
    setSelectedRegion('');
    setSelectedDate('');
    setFilteredGroupedPatients(groupedPatients); // Reset to original data
  };

  const openCurrentReport = (appointmentId: string, regionId: string) => {
    window.open(
      `/doctor/health-report/${appointmentId}?regionId=${regionId}`,
      '_blank'
    );
  };

  const openHistory = (visitPatientId: string) => {
    window.open(
      `/doctor/patient-history/${visitPatientId}`,
      '_blank'
    );
  };

  const fetchSeenAppointments = async (doctorRefId: string) => {
    try {
      // Remove the date filter
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

  if (loading) {
    return <div className="flex justify-center"><Loader className="h-8 w-8 animate-spin" /></div>;
  }

  return (
    <div className="bg-gradient-to-br from-blue-50 to-teal-50 min-h-screen p-6">
      <div className="max-w-7xl mx-auto">
        <div className="bg-white shadow-lg rounded-lg mb-6">
          <div className="p-6">
            <h3 className="text-2xl font-bold text-gray-800 mb-6 flex items-center">
              <User className="h-6 w-6 mr-2 text-teal-600" />
              All Seen Patients
            </h3>

            {/* Filters Section */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6 bg-gray-50 p-4 rounded-lg">
              <div className="relative">
                <input
                  type="text"
                  placeholder="Search by name, ID or phone..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border rounded-lg focus:ring-2 focus:ring-teal-500"
                />
                <Search className="absolute left-3 top-2.5 text-gray-400 h-5 w-5" />
              </div>

              <select
                value={selectedRegion}
                onChange={(e) => setSelectedRegion(e.target.value)}
                className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-teal-500"
              >
                <option value="">All Regions</option>
                {regions.map((region) => (
                  <option key={region} value={region}>{region}</option>
                ))}
              </select>

              <input
                type="date"
                value={selectedDate}
                onChange={(e) => setSelectedDate(e.target.value)}
                className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-teal-500"
                aria-label="Filter by date"
                placeholder="Select date"
              />

              <button
                onClick={handleReset}
                className="px-4 py-2 bg-gray-100 text-gray-600 rounded-lg hover:bg-gray-200 flex items-center justify-center"
              >
                <Filter className="h-4 w-4 mr-2" />
                Reset Filters
              </button>
            </div>

            {/* Patients List */}
            <div className="space-y-6">
              {Object.entries(filteredGroupedPatients).length === 0 ? (
                <div className="text-center py-8 text-gray-500">
                  No patients found matching the filters
                </div>
              ) : (
                Object.entries(filteredGroupedPatients).map(([dateLabel, patients]) => (
                  <div key={dateLabel} className="bg-white rounded-lg shadow-md border border-teal-100">
                    <div className="px-4 py-3 bg-teal-50 rounded-t-lg border-b border-teal-100">
                      <h4 className="text-md font-semibold text-teal-800 flex items-center">
                        <Calendar className="h-4 w-4 mr-2" />
                        {dateLabel}
                      </h4>
                    </div>
                    <div className="overflow-x-auto">
                      <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-gray-50">
                          <tr>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                              Patient Name
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                              Visit Date
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                              Region
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                              Reason
                            </th>
                          </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                          {patients.map(({ seenPatient, appointmentDetails }) => (
                            <tr 
                              key={seenPatient.id} 
                              onClick={() => openCurrentReport(seenPatient.appointment_id, appointmentDetails.region_id)}
                              className="cursor-pointer hover:bg-gray-50"
                            >
                              <td className="px-6 py-4 whitespace-nowrap">
                                <div className="text-sm font-medium text-blue-600 hover:text-blue-800">
                                  {appointmentDetails.patient_name}
                                </div>
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap">
                                <div className="text-sm text-gray-500">
                                  {new Date(seenPatient.seen_at).toLocaleDateString('en-US', {
                                    year: 'numeric',
                                    month: 'long',
                                    day: 'numeric',
                                    hour: '2-digit',
                                    minute: '2-digit'
                                  })}
                                </div>
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap">
                                <div className="text-sm text-gray-500">
                                  {appointmentDetails.region_name}
                                </div>
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap">
                                <div className="text-sm text-gray-500">
                                  {appointmentDetails.reason}
                                </div>
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap" onClick={(e) => e.stopPropagation()}>
                                <button
                                  onClick={() => openHistory(appointmentDetails.visit_patient_id)}
                                  className="px-4 py-2 bg-teal-600 hover:bg-teal-700 text-white rounded-lg shadow-md hover:shadow-lg transition-all duration-200 font-medium text-sm focus:ring-2 focus:ring-teal-500 focus:ring-offset-2"
                                >
                                  Check History
                                </button>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};