// import React, { useState } from 'react';
// import { Upload, File, X } from 'lucide-react';

// export const WriteReport = () => {
//   const [files, setFiles] = useState<File[]>([]);
//   const [report, setReport] = useState('');
//   const [selectedPatient, setSelectedPatient] = useState('');

//   const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
//     if (e.target.files) {
//       setFiles([...files, ...Array.from(e.target.files)]);
//     }
//   };

//   const handleSubmit = (e: React.FormEvent) => {
//     e.preventDefault();
//     // Handle report submission
//     console.log('Report submitted:', { selectedPatient, report, files });
//   };

//   return (
//     <div className="bg-white rounded-lg shadow-md p-6">
//       <h2 className="text-2xl font-semibold text-gray-800 mb-6">Write Medical Report</h2>

//       <form onSubmit={handleSubmit} className="space-y-6">
//         <div>
//           <label className="block text-sm font-medium text-gray-700 mb-2">
//             Select Patient
//           </label>
//           <select
//             value={selectedPatient}
//             onChange={(e) => setSelectedPatient(e.target.value)}
//             className="w-full p-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
//             required
//           >
//             <option value="">Select a patient...</option>
//             {/* Add patient options from your data */}
//           </select>
//         </div>

//         <div>
//           <label className="block text-sm font-medium text-gray-700 mb-2">
//             Report Details
//           </label>
//           <textarea
//             value={report}
//             onChange={(e) => setReport(e.target.value)}
//             className="w-full p-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
//             rows={8}
//             placeholder="Enter detailed report..."
//             required
//           />
//         </div>

//         <div>
//           <label className="block text-sm font-medium text-gray-700 mb-2">
//             Attachments
//           </label>
//           <div className="border-2 border-dashed border-gray-300 rounded-lg p-6">
//             <div className="flex flex-col items-center">
//               <Upload className="w-8 h-8 text-gray-400 mb-2" />
//               <p className="text-sm text-gray-500 mb-2">
//                 Drag and drop files here, or click to select files
//               </p>
//               <input
//                 type="file"
//                 multiple
//                 onChange={handleFileChange}
//                 className="hidden"
//                 id="file-upload"
//                 accept=".pdf,.doc,.docx,.jpg,.jpeg,.png"
//               />
//               <label
//                 htmlFor="file-upload"
//                 className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 cursor-pointer"
//               >
//                 Select Files
//               </label>
//             </div>
//           </div>

//           {files.length > 0 && (
//             <div className="mt-4 space-y-2">
//               {files.map((file, index) => (
//                 <div
//                   key={index}
//                   className="flex items-center justify-between p-2 bg-gray-50 rounded-lg"
//                 >
//                   <div className="flex items-center">
//                     <File className="w-5 h-5 text-gray-400 mr-2" />
//                     <span className="text-sm text-gray-700">{file.name}</span>
//                   </div>
//                   <button
//                     type="button"
//                     onClick={() => setFiles(files.filter((_, i) => i !== index))}
//                     className="text-red-500 hover:text-red-700"
//                   >
//                     <X className="w-5 h-5" />
//                   </button>
//                 </div>
//               ))}
//             </div>
//           )}
//         </div>

//         <div className="flex justify-end">
//           <button
//             type="submit"
//             className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
//           >
//             Submit Report
//           </button>
//         </div>
//       </form>
//     </div>
//   );
// };