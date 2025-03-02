import React, { useState, useEffect } from 'react';
import { Edit2, Trash2, X, Plus } from 'lucide-react';
import { supabase } from '../../lib/supabase';
import { adminSupabase } from '../../lib/adminSupabase';



interface Doctor {
  id: string;
  ref_id: string;
  username: string;
  department: string;
  specialization: string;
  phone_number: string;
  email: string;
  joining_date: string;
  assigned_regions: string[];
  password?: string;
}

interface DoctorManagementProps {
  onClose: () => void;
  onDoctorAdded: () => void;
}

export const DoctorManagement: React.FC<DoctorManagementProps> = ({ onClose, onDoctorAdded }) => {
  const [doctors, setDoctors] = useState<Doctor[]>([]);
  const [showAddForm, setShowAddForm] = useState(false);
  const [editingDoctor, setEditingDoctor] = useState<Doctor | null>(null);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    password: '',
    specialization: '',
    department: '',
    phone_number: '',
    joining_date: '',
  });

  const specializations = [
    'Cardiology',
    'Neurology',
    'Pediatrics',
    'Orthopedics',
    'Dermatology',
    'Oncology',
  ];

  const departments = [
    'Emergency',
    'Outpatient',
    'Inpatient',
    'Surgery',
    'Intensive Care',
  ];

  useEffect(() => {
    fetchDoctors();
  }, []);

  const fetchDoctors = async () => {
    try {
      const { data, error } = await supabase
        .from('doctors')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) {
        throw error;
      }

      setDoctors(data || []);
      setError(null);
    } catch (error: any) {
      console.error('Error fetching doctors:', error);
      setError('Failed to load doctors. Please try again.');
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    
    try {
      const ref_id = 'DOC-' + Math.random().toString(36).substr(2, 9).toUpperCase();
      
      // First create the auth user
      const { data: authData, error: authError } = await adminSupabase.auth.signUp({
        email: formData.email,
        password: formData.password,
        options: {
          data: {
            role: 'doctor',
            ref_id: ref_id
          }
        }
      });

      if (authError) throw authError;

      // Then create the doctor record
      const { error: doctorError } = await supabase
        .from('doctors')
        .insert([
          {
            id: authData.user?.id,
            ref_id: ref_id,
            username: formData.username,
            email: formData.email,
            department: formData.department,
            specialization: formData.specialization,
            phone_number: formData.phone_number,
            joining_date: formData.joining_date,
            assigned_regions: []
          },
        ]);

      if (doctorError) throw doctorError;

      setFormData({
        username: '',
        email: '',
        password: '',
        specialization: '',
        department: '',
        phone_number: '',
        joining_date: '',
      });
      setEditingDoctor(null);
      setShowAddForm(false);
      await fetchDoctors();
      onDoctorAdded();
      setError(null);
    } catch (error: any) {
      console.error('Error saving doctor:', error);
      setError(error.message || 'Failed to save doctor. Please try again.');
    }
  };

  const handleDelete = async (doctorId: string) => {
    try {
      // Get doctor's ref_id (text) and id (UUID)
      const { data: doctorData, error: fetchError } = await supabase
        .from('doctors')
        .select('ref_id, id')
        .eq('id', doctorId)
        .single();

      if (fetchError) throw fetchError;

      // Delete appointments using doctor_id (text) column
      const { error: appointmentsError } = await supabase
        .from('appointments')
        .delete()
        .eq('doctor_id', doctorData.ref_id);  // Match text-to-text

      if (appointmentsError) throw appointmentsError;

      // Delete seen_patients using doctor_id (text) column
      const { error: seenPatientsError } = await supabase
        .from('seen_patients')
        .delete()
        .eq('doctor_id', doctorData.ref_id);

      if (seenPatientsError) throw seenPatientsError;

      // Then delete the doctor
      const { error: doctorError } = await supabase
        .from('doctors')
        .delete()
        .eq('id', doctorId);

      if (doctorError) throw doctorError;

      // Delete auth user with service role key
      const { error: authError } = await adminSupabase.auth.admin.deleteUser(doctorId);

      if (authError) throw authError;

      await fetchDoctors();
      setShowDeleteConfirm(null);
    } catch (error: any) {
      console.error('Error deleting doctor:', JSON.stringify(error, null, 2));
      alert(`Error deleting doctor: ${error.message || 'Please check permissions'}`);
      setShowDeleteConfirm(null);
    }
  };

  const handleEdit = (doctor: Doctor) => {
    setEditingDoctor(doctor);
    setFormData({
      username: doctor.username,
      email: doctor.email,
      password: '',
      specialization: doctor.specialization,
      department: doctor.department,
      phone_number: doctor.phone_number,
      joining_date: doctor.joining_date,
    });
    setShowAddForm(true);
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center p-6 border-b">
          <h2 className="text-2xl font-semibold text-gray-800">Manage Doctors</h2>
          <button onClick={onClose} className="text-gray-500 hover:text-gray-700">
            <X className="h-6 w-6" />
          </button>
        </div>

        <div className="p-6">
          {error && (
            <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-md">
              <p className="text-red-600">{error}</p>
            </div>
          )}

          {!showAddForm ? (
            <>
              <button
                onClick={() => setShowAddForm(true)}
                className="mb-6 flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
              >
                <Plus className="h-5 w-5 mr-2" />
                Add New Doctor
              </button>

              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Doctor ID
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Name
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Department
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Specialization
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Contact
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {doctors.map((doctor) => (
                      <tr key={doctor.id} className="hover:bg-gray-50">
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                          {doctor.ref_id}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {doctor.username}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {doctor.department}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {doctor.specialization}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {doctor.phone_number}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                          <button
                            onClick={() => handleEdit(doctor)}
                            className="text-blue-600 hover:text-blue-900 mr-4"
                          >
                            <Edit2 className="h-5 w-5" />
                          </button>
                          <button
                            onClick={() => setShowDeleteConfirm(doctor.id)}
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
            </>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-6">
              <h3 className="text-lg font-medium text-gray-900">
                {editingDoctor ? 'Edit Doctor' : 'Add New Doctor'}
              </h3>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    Full Name
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.username}
                    onChange={(e) => setFormData({ ...formData, username: e.target.value })}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    Email
                  </label>
                  <input
                    type="email"
                    required
                    disabled={!!editingDoctor}
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 disabled:bg-gray-100"
                  />
                </div>

                {!editingDoctor && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700">
                      Password
                    </label>
                    <input
                      type="password"
                      required
                      value={formData.password}
                      onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                      className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                    />
                  </div>
                )}

                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    Specialization
                  </label>
                  <select
                    required
                    value={formData.specialization}
                    onChange={(e) => setFormData({ ...formData, specialization: e.target.value })}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                  >
                    <option value="">Select Specialization</option>
                    {specializations.map((spec) => (
                      <option key={spec} value={spec}>
                        {spec}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    Department
                  </label>
                  <select
                    required
                    value={formData.department}
                    onChange={(e) => setFormData({ ...formData, department: e.target.value })}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                  >
                    <option value="">Select Department</option>
                    {departments.map((dept) => (
                      <option key={dept} value={dept}>
                        {dept}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    Phone Number
                  </label>
                  <input
                    type="tel"
                    required
                    value={formData.phone_number}
                    onChange={(e) => setFormData({ ...formData, phone_number: e.target.value })}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                  />
                </div>

                {!editingDoctor && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700">
                      Joining Date
                    </label>
                    <input
                      type="date"
                      required
                      value={formData.joining_date}
                      onChange={(e) => setFormData({ ...formData, joining_date: e.target.value })}
                      className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                    />
                  </div>
                )}
              </div>

              <div className="flex justify-end space-x-4">
                <button
                  type="button"
                  onClick={() => {
                    setShowAddForm(false);
                    setEditingDoctor(null);
                  }}
                  className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-md"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-md"
                >
                  {editingDoctor ? 'Save Changes' : 'Add Doctor'}
                </button>
              </div>
            </form>
          )}
        </div>

        {showDeleteConfirm && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg p-6 max-w-sm w-full">
              <h3 className="text-lg font-medium text-gray-900 mb-4">
                Confirm Delete
              </h3>
              <p className="text-sm text-gray-500 mb-4">
                Are you sure you want to delete this doctor? This action cannot be undone.
              </p>
              <div className="flex justify-end space-x-4">
                <button
                  onClick={() => setShowDeleteConfirm(null)}
                  className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-md"
                >
                  Cancel
                </button>
                <button
                  onClick={() => handleDelete(showDeleteConfirm)}
                  className="px-4 py-2 text-sm font-medium text-white bg-red-600 hover:bg-red-700 rounded-md"
                >
                  Delete
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};