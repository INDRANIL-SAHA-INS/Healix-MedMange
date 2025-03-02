// import React, { useState } from 'react';
// import { User, Mail, Phone, MapPin, Heart, AlertCircle } from 'lucide-react';
// import { supabase } from '../../lib/supabase';

// interface AddPatientFormProps {
//   onClose: () => void;
//   onSuccess: () => void;
// }

// export const AddPatientForm: React.FC<AddPatientFormProps> = ({ onClose, onSuccess }) => {
//   const [formData, setFormData] = useState({
//     // Personal Information (Required)
//     fullName: '',
//     dateOfBirth: '',
//     gender: '',
//     phoneNumber: '',
//     email: '',
//     address: '',
    
//     // Emergency Contact (Required)
//     emergencyContactName: '',
//     emergencyContactRelation: '',
//     emergencyContactPhone: '',
    
//     // Identification (Required)
//     governmentId: '',
    
//     // Medical History (Optional)
//     chronicConditions: '',
//     pastIllnesses: '',
//     currentMedications: '',
//     allergies: '',
//     familyHistory: '',
//     immunizationHistory: '',
    
//     // Lifestyle (Optional)
//     smokingStatus: '',
//     alcoholConsumption: '',
    
//     // Current Visit (Required)
//     reasonForVisit: '',
//     symptoms: '',
//     bloodPressure: '',
//     heartRate: '',
//     temperature: '',
//   });

//   const [error, setError] = useState('');
//   const [loading, setLoading] = useState(false);

//   const handleSubmit = async (e: React.FormEvent) => {
//     e.preventDefault();
//     setLoading(true);
//     setError('');

//     try {
//       const { data, error: insertError } = await supabase
//         .from('patients')
//         .insert([{
//           full_name: formData.fullName,
//           date_of_birth: formData.dateOfBirth,
//           gender: formData.gender,
//           contact_number: formData.phoneNumber,
//           email: formData.email,
//           address: formData.address,
//           emergency_contact: {
//             name: formData.emergencyContactName,
//             relation: formData.emergencyContactRelation,
//             phone: formData.emergencyContactPhone
//           },
//           government_id: formData.governmentId,
//           medical_history: {
//             chronic_conditions: formData.chronicConditions,
//             past_illnesses: formData.pastIllnesses,
//             current_medications: formData.currentMedications,
//             allergies: formData.allergies,
//             family_history: formData.familyHistory,
//             immunization_history: formData.immunizationHistory,
//             lifestyle: {
//               smoking: formData.smokingStatus,
//               alcohol: formData.alcoholConsumption
//             }
//           },
//           current_visit: {
//             reason: formData.reasonForVisit,
//             symptoms: formData.symptoms,
//             vitals: {
//               blood_pressure: formData.bloodPressure,
//               heart_rate: formData.heartRate,
//               temperature: formData.temperature
//             }
//           }
//         }])
//         .select();

//       if (insertError) throw insertError;
//       onSuccess();
//       onClose();
//     } catch (err) {
//       console.error('Error adding patient:', err);
//       setError('Failed to add patient. Please try again.');
//     } finally {
//       setLoading(false);
//     }
//   };

//   return (
//     <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
//       <div className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto">
//         <div className="sticky top-0 bg-white p-6 border-b z-10">
//           <h2 className="text-2xl font-semibold text-gray-900">Add New Patient</h2>
//           {error && (
//             <div className="mt-4 p-4 bg-red-50 rounded-md flex items-start">
//               <AlertCircle className="h-5 w-5 text-red-400 mt-0.5 mr-2" />
//               <p className="text-sm text-red-800">{error}</p>
//             </div>
//           )}
//         </div>

//         <form onSubmit={handleSubmit} className="p-6 space-y-8">
//           {/* Personal Information */}
//           <section>
//             <h3 className="text-lg font-medium text-gray-900 mb-4">Personal Information</h3>
//             <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
//               <div>
//                 <label className="block text-sm font-medium text-gray-700 required">Full Name</label>
//                 <div className="mt-1 relative">
//                   <User className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
//                   <input
//                     type="text"
//                     required
//                     value={formData.fullName}
//                     onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
//                     className="pl-10 block w-full rounded-md border-gray-300 shadow-sm focus:ring-blue-500 focus:border-blue-500"
//                   />
//                 </div>
//               </div>

//               <div>
//                 <label className="block text-sm font-medium text-gray-700 required">Date of Birth</label>
//                 <input
//                   type="date"
//                   required
//                   value={formData.dateOfBirth}
//                   onChange={(e) => setFormData({ ...formData, dateOfBirth: e.target.value })}
//                   className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:ring-blue-500 focus:border-blue-500"
//                 />
//               </div>

//               <div>
//                 <label className="block text-sm font-medium text-gray-700 required">Gender</label>
//                 <select
//                   required
//                   value={formData.gender}
//                   onChange={(e) => setFormData({ ...formData, gender: e.target.value })}
//                   className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:ring-blue-500 focus:border-blue-500"
//                 >
//                   <option value="">Select Gender</option>
//                   <option value="male">Male</option>
//                   <option value="female">Female</option>
//                   <option value="other">Other</option>
//                 </select>
//               </div>

//               <div>
//                 <label className="block text-sm font-medium text-gray-700 required">Phone Number</label>
//                 <div className="mt-1 relative">
//                   <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
//                   <input
//                     type="tel"
//                     required
//                     value={formData.phoneNumber}
//                     onChange={(e) => setFormData({ ...formData, phoneNumber: e.target.value })}
//                     className="pl-10 block w-full rounded-md border-gray-300 shadow-sm focus:ring-blue-500 focus:border-blue-500"
//                   />
//                 </div>
//               </div>

//               <div>
//                 <label className="block text-sm font-medium text-gray-700">Email</label>
//                 <div className="mt-1 relative">
//                   <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
//                   <input
//                     type="email"
//                     value={formData.email}
//                     onChange={(e) => setFormData({ ...formData, email: e.target.value })}
//                     className="pl-10 block w-full rounded-md border-gray-300 shadow-sm focus:ring-blue-500 focus:border-blue-500"
//                   />
//                 </div>
//               </div>

//               <div>
//                 <label className="block text-sm font-medium text-gray-700 required">Address</label>
//                 <div className="mt-1 relative">
//                   <MapPin className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
//                   <input
//                     type="text"
//                     required
//                     value={formData.address}
//                     onChange={(e) => setFormData({ ...formData, address: e.target.value })}
//                     className="pl-10 block w-full rounded-md border-gray-300 shadow-sm focus:ring-blue-500 focus:border-blue-500"
//                   />
//                 </div>
//               </div>
//             </div>
//           </section>

//           {/* Emergency Contact */}
//           <section>
//             <h3 className="text-lg font-medium text-gray-900 mb-4">Emergency Contact</h3>
//             <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
//               <div>
//                 <label className="block text-sm font-medium text-gray-700 required">Name</label>
//                 <input
//                   type="text"
//                   required
//                   value={formData.emergencyContactName}
//                   onChange={(e) => setFormData({ ...formData, emergencyContactName: e.target.value })}
//                   className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:ring-blue-500 focus:border-blue-500"
//                 />
//               </div>

//               <div>
//                 <label className="block text-sm font-medium text-gray-700 required">Relationship</label>
//                 <input
//                   type="text"
//                   required
//                   value={formData.emergencyContactRelation}
//                   onChange={(e) => setFormData({ ...formData, emergencyContactRelation: e.target.value })}
//                   className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:ring-blue-500 focus:border-blue-500"
//                 />
//               </div>

//               <div>
//                 <label className="block text-sm font-medium text-gray-700 required">Phone</label>
//                 <input
//                   type="tel"
//                   required
//                   value={formData.emergencyContactPhone}
//                   onChange={(e) => setFormData({ ...formData, emergencyContactPhone: e.target.value })}
//                   className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:ring-blue-500 focus:border-blue-500"
//                 />
//               </div>
//             </div>
//           </section>

//           {/* Medical History */}
//           <section>
//             <h3 className="text-lg font-medium text-gray-900 mb-4">Medical History</h3>
//             <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
//               <div>
//                 <label className="block text-sm font-medium text-gray-700">Chronic Conditions</label>
//                 <textarea
//                   value={formData.chronicConditions}
//                   onChange={(e) => setFormData({ ...formData, chronicConditions: e.target.value })}
//                   className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:ring-blue-500 focus:border-blue-500"
//                   rows={3}
//                 />
//               </div>

//               <div>
//                 <label className="block text-sm font-medium text-gray-700">Past Illnesses & Surgeries</label>
//                 <textarea
//                   value={formData.pastIllnesses}
//                   onChange={(e) => setFormData({ ...formData, pastIllnesses: e.target.value })}
//                   className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:ring-blue-500 focus:border-blue-500"
//                   rows={3}
//                 />
//               </div>

//               <div>
//                 <label className="block text-sm font-medium text-gray-700">Current Medications</label>
//                 <textarea
//                   value={formData.currentMedications}
//                   onChange={(e) => setFormData({ ...formData, currentMedications: e.target.value })}
//                   className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:ring-blue-500 focus:border-blue-500"
//                   rows={3}
//                 />
//               </div>

//               <div>
//                 <label className="block text-sm font-medium text-gray-700">Allergies</label>
//                 <textarea
//                   value={formData.allergies}
//                   onChange={(e) => setFormData({ ...formData, allergies: e.target.value })}
//                   className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:ring-blue-500 focus:border-blue-500"
//                   rows={3}
//                 />
//               </div>
//             </div>
//           </section>

//           {/* Current Visit */}
//           <section>
//             <h3 className="text-lg font-medium text-gray-900 mb-4">Current Visit</h3>
//             <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
//               <div>
//                 <label className="block text-sm font-medium text-gray-700 required">Reason for Visit</label>
//                 <textarea
//                   required
//                   value={formData.reasonForVisit}
//                   onChange={(e) => setFormData({ ...formData, reasonForVisit: e.target.value })}
//                   className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:ring-blue-500 focus:border-blue-500"
//                   rows={3}
//                 />
//               </div>

//               <div>
//                 <label className="block text-sm font-medium text-gray-700 required">Symptoms</label>
//                 <textarea
//                   required
//                   value={formData.symptoms}
//                   onChange={(e) => setFormData({ ...formData, symptoms: e.target.value })}
//                   className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:ring-blue-500 focus:border-blue-500"
//                   rows={3}
//                 />
//               </div>

//               <div>
//                 <label className="block text-sm font-medium text-gray-700 required">Blood Pressure</label>
//                 <input
//                   type="text"
//                   required
//                   placeholder="120/80"
//                   value={formData.bloodPressure}
//                   onChange={(e) => setFormData({ ...formData, bloodPressure: e.target.value })}
//                   className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:ring-blue-500 focus:border-blue-500"
//                 />
//               </div>

//               <div>
//                 <label className="block text-sm font-medium text-gray-700 required">Heart Rate</label>
//                 <input
//                   type="text"
//                   required
//                   placeholder="BPM"
//                   value={formData.heartRate}
//                   onChange={(e) => setFormData({ ...formData, heartRate: e.target.value })}
//                   className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:ring-blue-500 focus:border-blue-500"
//                 />
//               </div>

//               <div>
//                 <label className="block text-sm font-medium text-gray-700 required">Temperature</label>
//                 <input
//                   type="text"
//                   required
//                   placeholder="°F"
//                   value={formData.temperature}
//                   onChange={(e) => setFormData({ ...formData, temperature: e.target.value })}
//                   className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:ring-blue-500 focus:border-blue-500"
//                 />
//               </div>
//             </div>
//           </section>

//           <div className="sticky bottom-0 bg-white pt-4 pb-6 flex justify-end space-x-4">
//             <button
//               type="button"
//               onClick={onClose}
//               className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-md"
//             >
//               Cancel
//             </button>
//             <button
//               type="submit"
//               disabled={loading}
//               className="px-4 py-2 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-md disabled:opacity-50"
//             >
//               {loading ? 'Adding Patient...' : 'Add Patient'}
//             </button>
//           </div>
//         </form>
//       </div>
//     </div>
//   );
// };