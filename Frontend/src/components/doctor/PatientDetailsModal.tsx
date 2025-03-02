// import React from 'react';
// import { X, User, Phone, MapPin, Calendar } from 'lucide-react';

// interface Patient {
//   id: string;
//   name: string;
//   age: number;
//   address: string;
//   region: string;
//   phone: string;
//   aadharNumber: string;
//   lastVisit: string;
//   medicalHistory: string[];
// }

// interface PatientDetailsModalProps {
//   patient: Patient;
//   onClose: () => void;
// }

// export const PatientDetailsModal: React.FC<PatientDetailsModalProps> = ({ patient, onClose }) => {
//   return (
//     <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
//       <div className="bg-white rounded-lg max-w-2xl w-full">
//         <div className="flex justify-between items-center p-6 border-b">
//           <h2 className="text-2xl font-semibold text-gray-800">Patient Details</h2>
//           <button onClick={onClose} className="text-gray-500 hover:text-gray-700">
//             <X className="w-6 h-6" />
//           </button>
//         </div>

//         <div className="p-6 space-y-6">
//           <div className="flex items-center space-x-4">
//             <div className="h-16 w-16 rounded-full bg-blue-100 flex items-center justify-center">
//               <User className="h-8 w-8 text-blue-600" />
//             </div>
//             <div>
//               <h3 className="text-xl font-semibold text-gray-900">{patient.name}</h3>
//               <p className="text-gray-500">Patient ID: {patient.id}</p>
//             </div>
//           </div>

//           <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
//             <div>
//               <h4 className="text-sm font-medium text-gray-500 mb-1">Age</h4>
//               <p className="text-gray-900">{patient.age} years</p>
//             </div>
//             <div>
//               <h4 className="text-sm font-medium text-gray-500 mb-1">Phone</h4>
//               <div className="flex items-center">
//                 <Phone className="w-4 h-4 text-gray-400 mr-2" />
//                 <p className="text-gray-900">{patient.phone}</p>
//               </div>
//             </div>
//             <div className="md:col-span-2">
//               <h4 className="text-sm font-medium text-gray-500 mb-1">Address</h4>
//               <div className="flex items-center">
//                 <MapPin className="w-4 h-4 text-gray-400 mr-2" />
//                 <p className="text-gray-900">{patient.address}</p>
//               </div>
//             </div>
//             <div>
//               <h4 className="text-sm font-medium text-gray-500 mb-1">Region</h4>
//               <p className="text-gray-900">{patient.region}</p>
//             </div>
//             <div>
//               <h4 className="text-sm font-medium text-gray-500 mb-1">Last Visit</h4>
//               <div className="flex items-center">
//                 <Calendar className="w-4 h-4 text-gray-400 mr-2" />
//                 <p className="text-gray-900">{patient.lastVisit}</p>
//               </div>
//             </div>
//           </div>

//           <div>
//             <h4 className="text-sm font-medium text-gray-500 mb-2">Medical History</h4>
//             <div className="bg-gray-50 rounded-lg p-4">
//               <ul className="list-disc list-inside space-y-1">
//                 {patient.medicalHistory.map((item, index) => (
//                   <li key={index} className="text-gray-700">{item}</li>
//                 ))}
//               </ul>
//             </div>
//           </div>
//         </div>

//         <div className="flex justify-end p-6 border-t">
//           <button
//             onClick={onClose}
//             className="px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200"
//           >
//             Close
//           </button>
//         </div>
//       </div>
//     </div>
//   );
// };