import React, { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabase';
import { Pill, Plus, Trash2 } from 'lucide-react';

export const MedicineManagement = () => {
  const [medicines, setMedicines] = useState<any[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    category: '',
    batch_number: '',
    manufacturer: '',
    stock_quantity: 0,
    unit_price: 0,
    expiry_date: '',
    purchase_date: new Date().toISOString().split('T')[0],
    threshold_limit: 5,
    description: ''
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [editMedicineId, setEditMedicineId] = useState<string | null>(null);

  useEffect(() => {
    fetchMedicines();
    updateStockQuantities();
  }, []);

  useEffect(() => {
    if (showForm && !editMedicineId) {
      setFormData({
        name: '',
        category: '',
        batch_number: '',
        manufacturer: '',
        stock_quantity: 0,
        unit_price: 0,
        expiry_date: '',
        purchase_date: new Date().toISOString().split('T')[0],
        threshold_limit: 5,
        description: ''
      });
    }
  }, [showForm, editMedicineId]);

  useEffect(() => {
    console.log('useEffect triggered. editMedicineId:', editMedicineId);
    if (editMedicineId) {
      const medicine = medicines.find(m => m.id === editMedicineId);
      console.log('Found medicine:', medicine);
      if (medicine) {
        setFormData({
          name: medicine.name,
          category: medicine.category || '',
          batch_number: medicine.batch_number,
          manufacturer: medicine.manufacturer,
          stock_quantity: medicine.stock_quantity,
          unit_price: medicine.unit_price,
          expiry_date: medicine.expiry_date ? 
            new Date(medicine.expiry_date).toISOString().split('T')[0] : '',
          purchase_date: medicine.purchase_date ? 
            new Date(medicine.purchase_date).toISOString().split('T')[0] : '',
          threshold_limit: medicine.threshold_limit,
          description: medicine.description || ''
        });
        setShowForm(true);
        console.log('Form data after set:', {
          name: medicine.name,
          category: medicine.category || '',
          batch_number: medicine.batch_number,
          manufacturer: medicine.manufacturer,
          stock_quantity: medicine.stock_quantity,
          unit_price: medicine.unit_price,
          expiry_date: medicine.expiry_date ? 
            new Date(medicine.expiry_date).toISOString().split('T')[0] : '',
          purchase_date: medicine.purchase_date ? 
            new Date(medicine.purchase_date).toISOString().split('T')[0] : '',
          threshold_limit: medicine.threshold_limit,
          description: medicine.description || ''
        });
      } else {
        console.log('Medicine not found for ID:', editMedicineId);
      }
    }
  }, [editMedicineId, medicines]);

  const fetchMedicines = async () => {
    try {
      const { data, error } = await supabase
        .from('medicines')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setMedicines(data || []);
      setError('');
      console.log('Fetched medicines:', data);
    } catch (err) {
      console.error('Fetch error:', err);
      setError('Failed to load medicines. Check console for details.');
    }
  };

  const updateStockQuantities = async () => {
    const today = new Date().toISOString().split('T')[0];
    console.log("Today's date:", today);

    try {
      // Fetch patient health records for today
      const { data: healthRecords, error: healthRecordError } = await supabase
        .from('patient_health_records')
        .select('*')
        .gte('updated_at', today + 'T00:00:00+00:00') // Start of today
        .lt('updated_at', today + 'T23:59:59+00:00'); // End of today

      if (healthRecordError) {
        console.error('Error fetching health records:', healthRecordError);
        setError('Failed to fetch health records. Check console for details.');
        return;
      }

      console.log('Fetched health records:', healthRecords);

      // Iterate through each health record
      for (const record of healthRecords) {
        // Check if count is 0
        if (record.count === 0) {
          if (record.medication && Array.isArray(record.medication)) {
            for (const medication of record.medication) {
              const medicineName = medication.medicine_name;
              const quantity = medication.quantity;

              console.log(`Processing medication: ${medicineName}, Quantity: ${quantity}`);

              if (medicineName && quantity) {
                // Fetch the medicine from the medicines table
                const { data: medicineData, error: medicineError } = await supabase
                  .from('medicines')
                  .select('*')
                  .eq('name', medicineName);

                if (medicineError) {
                  console.error('Error fetching medicine:', medicineError);
                  continue; // Skip to the next medication
                }

                if (medicineData && medicineData.length > 0) {
                  const medicine = medicineData[0];
                  const newStockQuantity = Math.max(0, medicine.stock_quantity - quantity); // Ensure stock doesn't go below 0

                  console.log(`Updating stock for ${medicineName} from ${medicine.stock_quantity} to ${newStockQuantity}`);

                  // Update the stock quantity in the medicines table
                  const { error: updateError } = await supabase
                    .from('medicines')
                    .update({ stock_quantity: newStockQuantity })
                    .eq('id', medicine.id);

                  if (updateError) {
                    console.error('Error updating stock quantity:', updateError);
                  } else {
                    console.log(`Successfully updated stock for ${medicineName}`);
                    // Refresh medicines after updating stock
                    await fetchMedicines();
                  }
                } else {
                  console.log(`Medicine not found: ${medicineName}`);
                }
              }
            }
          }

          // Update the count to 1 after processing
          const { error: updateCountError } = await supabase
            .from('patient_health_records')
            .update({ count: 1 })
            .eq('id', record.id);

          if (updateCountError) {
            console.error('Error updating count:', updateCountError);
          } else {
            console.log(`Successfully updated count for record ID: ${record.id}`);
          }
        } else {
          console.log(`Skipping record ID: ${record.id} because count is not 0`);
        }
      }
    } catch (err) {
      console.error('Error updating stock quantities:', err);
      setError('Failed to update stock quantities. Check console for details.');
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      // Validate required fields
      const requiredFields = ['name', 'batch_number', 'manufacturer', 'expiry_date'];
      const missingFields = requiredFields.filter(field => !formData[field]);
      if (missingFields.length > 0) {
        throw new Error(`Missing required fields: ${missingFields.join(', ')}`);
      }

      const payload = {
        ...formData,
        stock_quantity: Number(formData.stock_quantity),
        unit_price: Number(formData.unit_price),
        threshold_limit: Number(formData.threshold_limit),
        expiry_date: new Date(formData.expiry_date).toISOString(),
        purchase_date: formData.purchase_date 
          ? new Date(formData.purchase_date).toISOString() 
          : null
      };

      if (editMedicineId) {
        // Update existing medicine
        console.log('Updating medicine with ID:', editMedicineId, 'Payload:', payload);
        const { data, error } = await supabase
          .from('medicines')
          .update(payload)
          .eq('id', editMedicineId)
          .select();

        if (error) {
          console.error('Update error:', error);
          throw new Error(`Failed to update medicine: ${error.message}`);
        }
        console.log('Update successful:', data);
      } else {
        // Create new medicine
        console.log('Creating new medicine:', payload);
        const { data, error } = await supabase
          .from('medicines')
          .insert([payload])
          .select();

        if (error) {
          console.error('Insert error:', error);
          throw new Error(`Failed to create medicine: ${error.message}`);
        }
        console.log('Insert successful:', data);
      }

      // Refresh data and reset form
      await fetchMedicines();
      setShowForm(false);
      setEditMedicineId(null);
      setFormData({
        name: '',
        category: '',
        batch_number: '',
        manufacturer: '',
        stock_quantity: 0,
        unit_price: 0,
        expiry_date: '',
        purchase_date: new Date().toISOString().split('T')[0],
        threshold_limit: 5,
        description: ''
      });
      console.log('Form reset complete');

    } catch (err: any) {
      setError(err.message || 'Failed to save medicine');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm('Are you sure you want to delete this medicine?')) return;
    
    try {
      const { error } = await supabase
        .from('medicines')
        .delete()
        .eq('id', id);

      if (error) throw error;
      fetchMedicines();
    } catch (err) {
      console.error('Error deleting medicine:', err);
      setError('Failed to delete medicine');
    }
  };

  return (
    <div className="bg-white rounded-lg shadow p-6">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-semibold flex items-center gap-2">
          <Pill className="h-6 w-6 text-blue-600" />
          {editMedicineId ? 'Edit Medicine' : 'Add New Medicine'}
        </h2>
        <button
          onClick={() => setShowForm(!showForm)}
          className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 flex items-center gap-2"
        >
          <Plus className="h-4 w-4" /> Add Medicine
        </button>
      </div>

      {showForm && (
        <form onSubmit={handleSubmit} className="mb-8 bg-white border rounded-lg p-4 shadow-sm max-h-[80vh] overflow-y-auto">
          <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
            <Pill className="h-5 w-5 text-blue-600" />
            {editMedicineId ? 'Edit Medicine' : 'Add New Medicine'}
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm">
            <div>
              <label className="block text-xs font-medium mb-1">Name *</label>
              <input
                value={formData.name}
                onChange={(e) => setFormData({...formData, name: e.target.value})}
                className="w-full p-2 border rounded-md text-sm focus:ring-1 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="block text-xs font-medium mb-1">Batch No. *</label>
              <input
                value={formData.batch_number}
                onChange={(e) => setFormData({...formData, batch_number: e.target.value})}
                className="w-full p-2 border rounded-md text-sm"
              />
            </div>

            <div>
              <label className="block text-xs font-medium mb-1">Manufacturer *</label>
              <input
                value={formData.manufacturer}
                onChange={(e) => setFormData({...formData, manufacturer: e.target.value})}
                className="w-full p-2 border rounded-md text-sm"
              />
            </div>

            <div>
              <label className="block text-xs font-medium mb-1">Expiry Date *</label>
              <input
                type="date"
                value={formData.expiry_date}
                onChange={(e) => setFormData({...formData, expiry_date: e.target.value})}
                className="w-full p-2 border rounded-md text-sm"
              />
            </div>

            <div>
              <label className="block text-xs font-medium mb-1">Stock Qty *</label>
              <input
                type="number"
                value={formData.stock_quantity}
                onChange={(e) => setFormData({...formData, stock_quantity: Number(e.target.value)})}
                className="w-full p-2 border rounded-md text-sm"
              />
            </div>

            <div>
              <label className="block text-xs font-medium mb-1">Unit Price (₹) *</label>
              <input
                type="number"
                step="0.01"
                value={formData.unit_price}
                onChange={(e) => setFormData({...formData, unit_price: Number(e.target.value)})}
                className="w-full p-2 border rounded-md text-sm"
              />
            </div>

            <div>
              <label className="block text-xs font-medium mb-1">Purchase Date</label>
              <input
                type="date"
                value={formData.purchase_date}
                onChange={(e) => setFormData({...formData, purchase_date: e.target.value})}
                className="w-full p-2 border rounded-md text-sm"
              />
            </div>

            <div>
              <label className="block text-xs font-medium mb-1">Low Stock Threshold</label>
              <input
                type="number"
                value={formData.threshold_limit}
                onChange={(e) => setFormData({...formData, threshold_limit: Number(e.target.value)})}
                className="w-full p-2 border rounded-md text-sm"
              />
            </div>

            <div className="md:col-span-2">
              <label className="block text-xs font-medium mb-1">Description</label>
              <textarea
                value={formData.description}
                onChange={(e) => setFormData({...formData, description: e.target.value})}
                className="w-full p-2 border rounded-md text-sm"
                rows={3}
              />
            </div>
          </div>

          <div className="mt-4 flex justify-end gap-2">
            <button
              type="button"
              onClick={() => {
                setShowForm(false);
                setEditMedicineId(null);
              }}
              className="px-3 py-1.5 text-xs bg-gray-100 rounded-md hover:bg-gray-200"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-3 py-1.5 text-xs bg-blue-600 text-white rounded-md hover:bg-blue-700"
            >
              {loading ? 'Saving...' : (editMedicineId ? 'Update Medicine' : 'Add Medicine')}
            </button>
          </div>
        </form>
      )}

      {error && <div className="bg-red-100 text-red-700 p-3 rounded-md mb-4">{error}</div>}

      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-4 py-3 text-left">Medicine</th>
              <th className="px-4 py-3 text-left">Category</th>
              <th className="px-4 py-3 text-left">Stock</th>
              <th className="px-4 py-3 text-left">Price</th>
              <th className="px-4 py-3 text-left">Expiry</th>
              <th className="px-4 py-3 text-left">Actions</th>
            </tr>
          </thead>
          <tbody>
            {medicines.map((medicine) => (
              <tr 
                key={medicine.id}
                className={`border-t ${
                  medicine.stock_quantity <= medicine.threshold_limit 
                    ? 'bg-red-50 animate-pulse' 
                    : ''
                }`}
              >
                <td className="px-4 py-3">{medicine.name}</td>
                <td className="px-4 py-3">{medicine.category}</td>
                <td className="px-4 py-3">
                  {medicine.stock_quantity}
                  {medicine.stock_quantity <= medicine.threshold_limit && (
                    <span className="text-red-600 ml-2">(Low Stock)</span>
                  )}
                </td>
                <td className="px-4 py-3">₹{medicine.unit_price}</td>
                <td className="px-4 py-3">{new Date(medicine.expiry_date).toLocaleDateString()}</td>
                <td className="px-4 py-3 flex gap-2">
                  <button
                    onClick={() => {
                      console.log('Edit button clicked for medicine ID:', medicine.id);
                      setEditMedicineId(medicine.id);
                    }}
                    className="text-blue-600 hover:text-blue-800"
                  >
                    Edit
                  </button>
                  <button
                    onClick={() => handleDelete(medicine.id)}
                    className="text-red-600 hover:text-red-800"
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
  );
}; 