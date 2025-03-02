import React, { useState, useEffect } from 'react';
import { Plus, Edit2, Trash2, Phone, MapPin, Search } from 'lucide-react';
import { supabase } from '../../lib/supabase';

interface Region {
  region_id: string;
  name: string;
}

interface Doctor {
  ref_id: string;
  username: string;
}

interface Appointment {
  id: string;
  patient_name: string;
  patient_phone: string;
  region_name: string;
  status: 'critical' | 'medium' | 'low';
  appointment_date: string;
}

interface AppointmentFormData {
  visit_patient_id: string;
  patient_name: string;
  patient_phone: string;
  patient_aadhar: string;
  patient_email: string;
  patient_address: string;
  region_id: string;
  region_name: string;
  doctor_id: string;
  doctor_username: string;
  reason: string;
  status: 'critical' | 'medium' | 'low';
  appointment_date: string;
}

const initialFormData: AppointmentFormData = {
  visit_patient_id: '',
  patient_name: '',
  patient_phone: '',
  patient_aadhar: '',
  patient_email: '',
  patient_address: '',
  region_id: '',
  region_name: '',
  doctor_id: '',
  doctor_username: '',
  reason: '',
  status: 'low',
  appointment_date: new Date().toISOString().split('T')[0],
};

export const AppointmentManagement = () => {
  const [showAddForm, setShowAddForm] = useState(false);
  const [showEditForm, setShowEditForm] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedRegion, setSelectedRegion] = useState('');
  const [selectedStatus, setSelectedStatus] = useState('');
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [regions, setRegions] = useState<Region[]>([]);
  const [doctors, setDoctors] = useState<Doctor[]>([]);
  const [selectedAppointment, setSelectedAppointment] = useState<Appointment | null>(null);
  const [formData, setFormData] = useState<AppointmentFormData>(initialFormData);

  useEffect(() => {
    fetchRegions();
    fetchDoctors();
    fetchAppointments();
  }, [selectedDate, selectedRegion, selectedStatus]);

  const fetchAppointments = async () => {
    try {
      let query = supabase
        .from('appointments')
        .select('*');

      if (selectedDate) {
        query = query.eq('appointment_date', selectedDate);
      }
      if (selectedRegion) {
        query = query.eq('region_name', selectedRegion);
      }
      if (selectedStatus) {
        query = query.eq('status', selectedStatus);
      }

      const { data, error } = await query
        .order('status', { ascending: false })
        .order('appointment_date', { ascending: true });

      if (error) throw error;
      
      let filteredData = data || [];
      if (searchTerm) {
        const searchLower = searchTerm.toLowerCase();
        filteredData = filteredData.filter(appointment => 
          appointment.patient_name.toLowerCase().includes(searchLower) ||
          appointment.id.toLowerCase().includes(searchLower)
        );
      }
      
      setAppointments(filteredData);
    } catch (error) {
      console.error('Error fetching appointments:', error);
      setError('Failed to load appointments. Please try again.');
    }
  };

  const handleReset = () => {
    setSearchTerm('');
    setSelectedRegion('');
    setSelectedStatus('');
    setSelectedDate(new Date().toISOString().split('T')[0]);
  };

  const handleEdit = async (appointment: Appointment) => {
    try {
      const { data, error } = await supabase
        .from('appointments')
        .select('*')
        .eq('id', appointment.id)
        .single();

      if (error) throw error;

      if (data) {
        setSelectedAppointment(data);
        setFormData({
          visit_patient_id: data.visit_patient_id || '',
          patient_name: data.patient_name,
          patient_phone: data.patient_phone,
          patient_aadhar: data.patient_aadhar,
          patient_email: data.patient_email || '',
          patient_address: data.patient_address,
          region_id: data.region_id,
          region_name: data.region_name,
          doctor_id: data.doctor_id,
          doctor_username: '',
          reason: data.reason,
          status: data.status,
          appointment_date: data.appointment_date,
        });
        setShowEditForm(true);
      }
    } catch (error) {
      console.error('Error fetching appointment details:', error);
      setError('Failed to load appointment details. Please try again.');
    }
  };

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedAppointment) return;

    try {
      const { error } = await supabase
        .from('appointments')
        .update({
          visit_patient_id: formData.visit_patient_id,
          patient_name: formData.patient_name,
          patient_phone: formData.patient_phone,
          patient_aadhar: formData.patient_aadhar,
          patient_email: formData.patient_email,
          patient_address: formData.patient_address,
          region_id: formData.region_id,
          region_name: regions.find(r => r.region_id === formData.region_id)?.name || '',
          doctor_id: formData.doctor_id,
          reason: formData.reason,
          status: formData.status,
          appointment_date: formData.appointment_date
        })
        .eq('id', selectedAppointment.id);

      if (error) throw error;

      setShowEditForm(false);
      setSelectedAppointment(null);
      await fetchAppointments();
      alert('Appointment updated successfully!');
    } catch (error) {
      console.error('Error updating appointment:', error);
      setError('Failed to update appointment. Please try again.');
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
        setError('Failed to delete appointment. Please try again.');
      }
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'critical':
        return 'text-red-600 font-semibold';
      case 'medium':
        return 'text-yellow-600 font-semibold';
      case 'low':
        return 'text-green-600 font-semibold';
      default:
        return 'text-gray-600';
    }
  };

  const fetchRegions = async () => {
    try {
      const { data, error } = await supabase
        .from('regions')
        .select('region_id, name')
        .order('name', { ascending: true });

      if (error) throw error;
      setRegions(data || []);
    } catch (error) {
      console.error('Error fetching regions:', error);
      setError('Failed to load regions. Please try again.');
    }
  };

  const fetchDoctors = async () => {
    try {
      const { data, error } = await supabase
        .from('doctors')
        .select('ref_id, username')
        .order('username', { ascending: true });

      if (error) throw error;
      setDoctors(data || []);
    } catch (error) {
      console.error('Error fetching doctors:', error);
      setError('Failed to load doctors. Please try again.');
    }
  };

  const handleRegionChange = (regionId: string) => {
    const selectedRegion = regions.find(r => r.region_id === regionId);
    setFormData({
      ...formData,
      region_id: regionId,
      region_name: selectedRegion?.name || '',
    });
  };

  const handleDoctorChange = (doctorId: string) => {
    const selectedDoctor = doctors.find(d => d.ref_id === doctorId);
    setFormData({
      ...formData,
      doctor_id: doctorId,
      doctor_username: selectedDoctor?.username || '',
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    
    try {
      const { error } = await supabase
        .from('appointments')
        .insert([{
          visit_patient_id: formData.visit_patient_id,
          patient_name: formData.patient_name,
          patient_phone: formData.patient_phone,
          patient_aadhar: formData.patient_aadhar,
          patient_email: formData.patient_email,
          patient_address: formData.patient_address,
          region_id: formData.region_id,
          region_name: regions.find(r => r.region_id === formData.region_id)?.name || '',
          doctor_id: formData.doctor_id.trim(),
          reason: formData.reason,
          status: formData.status.toLowerCase(),
          appointment_date: formData.appointment_date
        }]);

      if (error) throw error;

      await fetchAppointments();
      setFormData(initialFormData);
      setShowAddForm(false);
      setError(null);
      alert('Appointment added successfully!');
    } catch (error: any) {
      console.error('Error saving appointment:', error);
      setError(error.message || 'Failed to save appointment. Please try again.');
    }
  };

  return (
    <div className="p-6">
      <div className="mb-8">
        <h2 className="text-2xl font-semibold text-gray-800 mb-4">Appointment Management</h2>
        
        <div className="flex justify-between items-center mb-6">
          <button
            onClick={() => {
              setFormData(initialFormData);
              setShowAddForm(true);
            }}
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
                placeholder="Search by patient name or ID..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
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
              <option value="">All Status</option>
              <option value="critical">Critical</option>
              <option value="medium">Medium</option>
              <option value="low">Low</option>
            </select>

            <div className="flex space-x-2">
              <input
                type="date"
                value={selectedDate}
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

        <div className="mt-6">
          <h3 className="text-lg font-medium text-gray-800 mb-4">
            {selectedDate === new Date().toISOString().split('T')[0]
              ? "Today's Appointments"
              : `Appointments for ${new Date(selectedDate).toLocaleDateString()}`}
            <span className="text-sm font-normal text-gray-500 ml-2">
              ({appointments.length} appointments)
            </span>
          </h3>
          <div className="bg-white rounded-lg shadow overflow-hidden">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Patient Name
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
                  <tr key={appointment.id}>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={getStatusColor(appointment.status)}>{appointment.patient_name}</span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <MapPin className="h-4 w-4 text-gray-400 mr-2" />
                        <span className="text-gray-900">{appointment.region_name}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <Phone className="h-4 w-4 text-gray-400 mr-2" />
                        <span className="text-gray-900">{appointment.patient_phone}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${
                        appointment.status === 'critical' ? 'bg-red-100 text-red-800' :
                        appointment.status === 'medium' ? 'bg-yellow-100 text-yellow-800' :
                        'bg-green-100 text-green-800'
                      }`}>
                        {appointment.status.charAt(0).toUpperCase() + appointment.status.slice(1)}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <button
                        onClick={() => handleEdit(appointment)}
                        className="text-blue-600 hover:text-blue-900 mr-4"
                      >
                        <Edit2 className="h-5 w-5" />
                      </button>
                      <button
                        onClick={() => handleDelete(appointment.id)}
                        className="text-red-600 hover:text-red-900"
                      >
                        <Trash2 className="h-5 w-5" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {error && (
          <div className="mt-4 p-4 bg-red-50 border border-red-200 rounded-md">
            <p className="text-red-600">{error}</p>
          </div>
        )}

        {/* Add Form Modal */}
        {showAddForm && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
              <div className="p-6">
                <h3 className="text-xl font-semibold mb-4">Add New Appointment</h3>
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-medium text-gray-700">
                        Full Name
                      </label>
                      <input
                        type="text"
                        required
                        value={formData.patient_name}
                        onChange={(e) => setFormData({ ...formData, patient_name: e.target.value })}
                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:ring-blue-500 focus:border-blue-500"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700">
                        Phone Number
                      </label>
                      <input
                        type="tel"
                        required
                        value={formData.patient_phone}
                        onChange={(e) => setFormData({ ...formData, patient_phone: e.target.value })}
                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:ring-blue-500 focus:border-blue-500"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700">
                        Patient ID (Optional)
                      </label>
                      <input
                        type="text"
                        value={formData.visit_patient_id}
                        onChange={(e) => setFormData({ ...formData, visit_patient_id: e.target.value })}
                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:ring-blue-500 focus:border-blue-500"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700">
                        Aadhar Number (Optional)
                      </label>
                      <input
                        type="text"
                        value={formData.patient_aadhar}
                        onChange={(e) => setFormData({ ...formData, patient_aadhar: e.target.value })}
                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:ring-blue-500 focus:border-blue-500"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700">
                        Email (Optional)
                      </label>
                      <input
                        type="email"
                        value={formData.patient_email}
                        onChange={(e) => setFormData({ ...formData, patient_email: e.target.value })}
                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:ring-blue-500 focus:border-blue-500"
                      />
                    </div>

                    <div className="md:col-span-2">
                      <label className="block text-sm font-medium text-gray-700">
                        Address
                      </label>
                      <textarea
                        required
                        value={formData.patient_address}
                        onChange={(e) => setFormData({ ...formData, patient_address: e.target.value })}
                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:ring-blue-500 focus:border-blue-500"
                        rows={3}
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700">
                        Region
                      </label>
                      <select
                        required
                        value={formData.region_id}
                        onChange={(e) => handleRegionChange(e.target.value)}
                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:ring-blue-500 focus:border-blue-500"
                      >
                        <option value="">Select Region</option>
                        {regions.map((region) => (
                          <option key={region.region_id} value={region.region_id}>
                            {region.name}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700">
                        Doctor
                      </label>
                      <select
                        required
                        value={formData.doctor_id}
                        onChange={(e) => handleDoctorChange(e.target.value)}
                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:ring-blue-500 focus:border-blue-500"
                      >
                        <option value="">Select Doctor</option>
                        {doctors.map((doctor) => (
                          <option key={doctor.ref_id} value={doctor.ref_id}>
                            {doctor.username}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700">
                        Status
                      </label>
                      <select
                        required
                        value={formData.status}
                        onChange={(e) => setFormData({ ...formData, status: e.target.value as 'critical' | 'medium' | 'low' })}
                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:ring-blue-500 focus:border-blue-500"
                      >
                        <option value="critical">Critical</option>
                        <option value="medium">Medium</option>
                        <option value="low">Low</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700">
                        Appointment Date
                      </label>
                      <input
                        type="date"
                        required
                        value={formData.appointment_date}
                        onChange={(e) => setFormData({ ...formData, appointment_date: e.target.value })}
                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:ring-blue-500 focus:border-blue-500"
                      />
                    </div>

                    <div className="md:col-span-2">
                      <label className="block text-sm font-medium text-gray-700">
                        Reason for Appointment
                      </label>
                      <textarea
                        required
                        value={formData.reason}
                        onChange={(e) => setFormData({ ...formData, reason: e.target.value })}
                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:ring-blue-500 focus:border-blue-500"
                        rows={3}
                      />
                    </div>
                  </div>

                  <div className="flex justify-end space-x-4">
                    <button
                      type="button"
                      onClick={() => {
                        setFormData(initialFormData);
                        setShowAddForm(false);
                      }}
                      className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-md"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      className="px-4 py-2 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-md"
                    >
                      Add Appointment
                    </button>
                  </div>
                </form>
              </div>
            </div>
          </div>
        )}

        {/* Edit Form Modal */}
        {showEditForm && selectedAppointment && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
              <div className="p-6">
                <h3 className="text-xl font-semibold mb-4">Edit Appointment</h3>
                <form onSubmit={handleUpdate} className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-medium text-gray-700">
                        Full Name
                      </label>
                      <input
                        type="text"
                        required
                        value={formData.patient_name}
                        onChange={(e) => setFormData({ ...formData, patient_name: e.target.value })}
                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:ring-blue-500 focus:border-blue-500"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700">
                        Phone Number
                      </label>
                      <input
                        type="tel"
                        required
                        value={formData.patient_phone}
                        onChange={(e) => setFormData({ ...formData, patient_phone: e.target.value })}
                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:ring-blue-500 focus:border-blue-500"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700">
                        Patient ID (Optional)
                      </label>
                      <input
                        type="text"
                        value={formData.visit_patient_id}
                        onChange={(e) => setFormData({ ...formData, visit_patient_id: e.target.value })}
                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:ring-blue-500 focus:border-blue-500"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700">
                        Aadhar Number (Optional)
                      </label>
                      <input
                        type="text"
                        value={formData.patient_aadhar}
                        onChange={(e) => setFormData({ ...formData, patient_aadhar: e.target.value })}
                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:ring-blue-500 focus:border-blue-500"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700">
                        Email (Optional)
                      </label>
                      <input
                        type="email"
                        value={formData.patient_email}
                        onChange={(e) => setFormData({ ...formData, patient_email: e.target.value })}
                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:ring-blue-500 focus:border-blue-500"
                      />
                    </div>

                    <div className="md:col-span-2">
                      <label className="block text-sm font-medium text-gray-700">
                        Address
                      </label>
                      <textarea
                        required
                        value={formData.patient_address}
                        onChange={(e) => setFormData({ ...formData, patient_address: e.target.value })}
                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:ring-blue-500 focus:border-blue-500"
                        rows={3}
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700">
                        Region
                      </label>
                      <select
                        required
                        value={formData.region_id}
                        onChange={(e) => handleRegionChange(e.target.value)}
                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:ring-blue-500 focus:border-blue-500"
                      >
                        <option value="">Select Region</option>
                        {regions.map((region) => (
                          <option key={region.region_id} value={region.region_id}>
                            {region.name}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700">
                        Doctor
                      </label>
                      <select
                        required
                        value={formData.doctor_id}
                        onChange={(e) => handleDoctorChange(e.target.value)}
                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:ring-blue-500 focus:border-blue-500"
                      >
                        <option value="">Select Doctor</option>
                        {doctors.map((doctor) => (
                          <option key={doctor.ref_id} value={doctor.ref_id}>
                            {doctor.username}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700">
                        Status
                      </label>
                      <select
                        required
                        value={formData.status}
                        onChange={(e) => setFormData({ ...formData, status: e.target.value as 'critical' | 'medium' | 'low' })}
                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:ring-blue-500 focus:border-blue-500"
                      >
                        <option value="critical">Critical</option>
                        <option value="medium">Medium</option>
                        <option value="low">Low</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700">
                        Appointment Date
                      </label>
                      <input
                        type="date"
                        required
                        value={formData.appointment_date}
                        onChange={(e) => setFormData({ ...formData, appointment_date: e.target.value })}
                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:ring-blue-500 focus:border-blue-500"
                      />
                    </div>

                    <div className="md:col-span-2">
                      <label className="block text-sm font-medium text-gray-700">
                        Reason for Appointment
                      </label>
                      <textarea
                        required
                        value={formData.reason}
                        onChange={(e) => setFormData({ ...formData, reason: e.target.value })}
                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:ring-blue-500 focus:border-blue-500"
                        rows={3}
                      />
                    </div>
                  </div>

                  <div className="flex justify-end space-x-4">
                    <button
                      type="button"
                      onClick={() => {
                        setShowEditForm(false);
                        setSelectedAppointment(null);
                      }}
                      className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-md"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      className="px-4 py-2 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-md"
                    >
                      Update Appointment
                    </button>
                  </div>
                </form>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};