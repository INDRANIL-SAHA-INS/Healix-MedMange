// import React, { useState } from 'react';
// import { Upload, File, X, AlertCircle } from 'lucide-react';
// import { supabase } from '../../lib/supabase';

// interface PatientReportProps {
//   patientId: string;
//   onClose: () => void;
//   onSuccess: () => void;
// }

// export const PatientReport: React.FC<PatientReportProps> = ({ patientId, onClose, onSuccess }) => {
//   const [files, setFiles] = useState<File[]>([]);
//   const [formData, setFormData] = useState({
//     diagnosis: '',
//     treatment: '',
//     prescription: '',
//     notes: '',
//     followUpDate: '',
//   });
//   const [loading, setLoading] = useState(false);
//   const [error, setError] = useState('');

//   const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
//     if (e.target.files) {
//       setFiles([...files, ...Array.from(e.target.files)]);
//     }
//   };

//   const handleSubmit = async (e: React.FormEvent) => {
//     e.preventDefault();
//     setLoading(true);
//     setError('');

//     try {
//       // Upload files to Supabase Storage
//       const uploadedFiles = await Promise.all(
//         files.map(async (file) => {
//           const fileName = `${patientId}/${Date.now()}-${file.name}`;
//           const { data, error } = await supabase.storage
//             .from('medical-reports')
//             .upload(fileName, file);

//           if (error) throw error;
//           return data.path;
//         })
//       );

//       // Create medical record
//       const { error: recordError } = await supabase
//         .from('medical_records')
//         .insert([{
//           patient_id: patientId,
//           diagnosis: formData.diagnosis,
//           treatment: formData.treatment,
//           prescription: formData.prescription,
//           notes: formData.notes,
//           follow_up_date: formData.followUpDate,
//           attachments: uploadedFiles
//         }]);

//       if (recordError) throw recordError;

//       onSuccess();
//       onClose();
//     } catch (err) {
//       console.error('Error creating report:', err);
//       setError('Failed to create report. Please try again.');
//     } finally {
//       setLoading(false);
//     }
//   };

//   return (
//     <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
//       <div className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto">
//         <div className="sticky top-0 bg-white p-6 border-b z-10">
//           <h2 className="text-2xl font-semibold text-gray-900">Create Medical Report</h2>
//           {error && (
//             <div className="mt-4 p-4 bg-red-50 rounded-md flex items-start">
//               <AlertCircle className="h-5 w-5 text-red-400 mt-0.5 mr-2" />
//               <p className="text-sm text-red-800">{error}</p>
//             </div>
//           )}
//         </div>

//         <form onSubmit={handleSubmit} className="p-6 space-y-6">
//           <div>
//             <label className="block text-sm font-medium text-gray-700 required">Diagnosis</label>
//             <textarea
//               required
//               value={formData.diagnosis}
//               onChange={(e) => setFormData({ ...formData, diagnosis: e.target.value })}
//               className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:ring-blue-500 focus:border-blue-500"
//               rows={4}
//             />
//           </div>

//           <div>
//             <label className="block text-sm font-medium text-gray-700 required">Treatment Plan</label>
//             <textarea
//               required
//               value={formData.treatment}
//               onChange={(e) => setFormData({ ...formData, treatment: e.target.value })}
//               className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:ring-blue-500 focus:border-blue-500"
//               rows={4}
//             />
//           </div>

//           <div>
//             <label className="block text-sm font-medium text-gray-700">Prescription</label>
//             <textarea
//               value={formData.prescription}
//               onChange={(e) => setFormData({ ...formData, prescription: e.target.value })}
//               className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:ring-blue-500 focus:border-blue-500"
//               rows={4}
//               placeholder="Medication name, dosage, frequency, duration..."
//             />
//           </div>

//           <div>
//             <label className="block text-sm font-medium text-gray-700">Additional Notes</label>
//             <textarea
//               value={formData.notes}
//               onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
//               className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:ring-blue-500 focus:border-blue-500"
//               rows={4}
//             />
//           </div>

//           <div>
//             <label className="block text-sm font-medium text-gray-700">Follow-up Date</label>
//             <input
//               type="date"
//               value={formData.followUpDate}
//               onChange={(e) => setFormData({ ...formData, followUpDate: e.target.value })}
//               className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:ring-blue-500 focus:border-blue-500"
//             />
//           </div>

//           <div>
//             <label className="block text-sm font-medium text-gray-700 mb-2">
//               Attachments (Test Results, X-rays, etc.)
//             </label>
//             <div className="border-2 border-dashed border-gray-300 rounded-lg p-6">
//               <div className="flex flex-col items-center">
//                 <Upload className="h-8 w-8 text-gray-400 mb-2" />
//                 <p className="text-sm text-gray-500 mb-2">
//                   Drag and drop files here, or click to select files
//                 </p>
//                 <input
//                   type="file"
//                   multiple
//                   onChange={handleFileChange}
//                   className="hidden"
//                   id="file-upload"
//                   accept=".pdf,.doc,.docx,.jpg,.jpeg,.png"
//                 />
//                 <label
//                   htmlFor="file-upload"
//                   className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 cursor-pointer"
//                 >
//                   Select Files
//                 </label>
//               </div>
//             </div>

//             {files.length > 0 && (
//               <div className="mt-4 space-y-2">
//                 {files.map((file, index) => (
//                   <div
//                     key={index}
//                     className="flex items-center justify-between p-2 bg-gray-50 rounded-lg"
//                   >
//                     <div className="flex items-center">
//                       <File className="h-5 w-5 text-gray-400 mr-2" />
//                       <span className="text-sm text-gray-700">{file.name}</span>
//                     </div>
//                     <button
//                       type="button"
//                       onClick={() => setFiles(files.filter((_, i) => i !== index))}
//                       className="text-red-500 hover:text-red-700"
//                     >
//                       <X className="h-5 w-5" />
//                     </button>
//                   </div>
//                 ))}
//               </div>
//             )}
//           </div>

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
//               {loading ? 'Creating Report...' : 'Create Report'}
//             </button>
//           </div>
//         </form>
//       </div>
//     </div>
//   );
// };