import React, { useState, useEffect } from 'react';
import { Edit2, Trash2, X, Plus } from 'lucide-react';
import { supabase } from '../../lib/supabase';

interface Assistant {
  id: string;
  username: string;
  phone_number: string;
  email: string;
  region_id: string;
  region_name: string;
  created_at: string;
}

interface Region {
  region_id: string;
  name: string;
}

interface AssistantManagementProps {
  onClose?: () => void;
  onAssistantAdded?: () => void;
}

interface FormData {
  username: string;
  email: string;
  password: string;
  phone_number: string;
  joining_date: string;
  region_id: string;
  region_name: string;
}

export const AssistantManagement: React.FC<AssistantManagementProps> = ({ onClose, onAssistantAdded }) => {
  const [assistants, setAssistants] = useState<Assistant[]>([]);
  const [regions, setRegions] = useState<Region[]>([]);
  const [showAddForm, setShowAddForm] = useState(false);
  const [editingAssistant, setEditingAssistant] = useState<Assistant | null>(null);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [formData, setFormData] = useState<FormData>({
    username: '',
    email: '',
    password: '',
    phone_number: '',
    joining_date: '',
    region_id: '',
    region_name: '',
  });

  useEffect(() => {
    fetchAssistants();
    fetchRegions();
  }, []);

  const fetchAssistants = async () => {
    try {
      const { data, error } = await supabase
        .from('assistants')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setAssistants(data || []);
      setError(null);
    } catch (error: any) {
      console.error('Error fetching assistants:', error);
      setError('Failed to load assistants. Please try again.');
    }
  };

  const fetchRegions = async () => {
    try {
      const { data, error } = await supabase
        .from('regions')
        .select('region_id, name')
        .order('name');

      if (error) throw error;
      setRegions(data || []);
    } catch (error) {
      console.error('Error fetching regions:', error);
    }
  };

  const handleRegionChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const regionId = e.target.value;
    const selectedRegion = regions.find(region => region.region_id === regionId);
    
    if (selectedRegion) {
      setFormData(prev => ({
        ...prev,
        region_id: selectedRegion.region_id,
        region_name: selectedRegion.name
      }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    
    try {
      // First create the auth user
      const { data: authUser } = await supabase.auth.signUp({
        email: formData.email,
        password: formData.password,
      });

      if (!authUser.user) throw new Error('Authentication failed');

      // Then create the assistant record
      const { error: assistantError } = await supabase
        .from('assistants')
        .insert([
          {
            id: authUser.user.id,
            username: formData.username,
            email: formData.email,
            phone_number: formData.phone_number,
            joining_date: formData.joining_date,
            region_id: formData.region_id,
            region_name: formData.region_name,
          },
        ]);

      if (assistantError) throw assistantError;

      setFormData({
        username: '',
        email: '',
        password: '',
        phone_number: '',
        joining_date: '',
        region_id: '',
        region_name: '',
      });
      setEditingAssistant(null);
      setShowAddForm(false);
      await fetchAssistants();
      onAssistantAdded?.();
      setError(null);
    } catch (error: any) {
      console.error('Error saving assistant:', error);
      setError(error.message || 'Failed to save assistant. Please try again.');
    }
  };

  const handleDelete = async (id: string) => {
    try {
      const { error } = await supabase
        .from('assistants')
        .delete()
        .eq('id', id);

      if (error) throw error;
      
      setShowDeleteConfirm(null);
      await fetchAssistants();
      setError(null);
    } catch (error: any) {
      console.error('Error deleting assistant:', error);
      setError(error.message || 'Failed to delete assistant. Please try again.');
    }
  };

  const handleEdit = (assistant: Assistant) => {
    setEditingAssistant(assistant);
    setFormData({
      username: assistant.username,
      password: '',
      phone_number: assistant.phone_number,
      email: assistant.email,
      region_id: assistant.region_id,
      region_name: assistant.region_name,
      joining_date: assistant.created_at,
    });
    setShowAddForm(true);
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center p-6 border-b">
          <h2 className="text-2xl font-semibold text-gray-800">Manage Assistants</h2>
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
                Add New Assistant
              </button>

              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Username
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Email
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Phone
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Region
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {assistants.map((assistant) => (
                      <tr key={assistant.id} className="hover:bg-gray-50">
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                          {assistant.username}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {assistant.email}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {assistant.phone_number}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {assistant.region_name}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                          <button
                            onClick={() => handleEdit(assistant)}
                            className="text-blue-600 hover:text-blue-900 mr-4"
                          >
                            <Edit2 className="h-5 w-5" />
                          </button>
                          <button
                            onClick={() => setShowDeleteConfirm(assistant.id)}
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
                {editingAssistant ? 'Edit Assistant' : 'Add New Assistant'}
              </h3>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    Username
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.username}
                    onChange={(e) => setFormData({ ...formData, username: e.target.value })}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                  />
                </div>

                {!editingAssistant && (
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

                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    Email
                  </label>
                  <input
                    type="email"
                    required
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                  />
                </div>

                <div>
                  <label htmlFor="region" className="block text-sm font-medium text-gray-700">
                    Region *
                  </label>
                  <select
                    id="region"
                    value={formData.region_id}
                    onChange={handleRegionChange}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                    required
                  >
                    <option value="">Select a region</option>
                    {regions.map((region) => (
                      <option key={region.region_id} value={region.region_id}>
                        {region.name}
                      </option>
                    ))}
                  </select>
                </div>

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
              </div>

              <div className="flex justify-end space-x-4">
                <button
                  type="button"
                  onClick={() => {
                    setShowAddForm(false);
                    setEditingAssistant(null);
                  }}
                  className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-md"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-md"
                >
                  {editingAssistant ? 'Save Changes' : 'Add Assistant'}
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
                Are you sure you want to delete this assistant? This action cannot be undone.
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