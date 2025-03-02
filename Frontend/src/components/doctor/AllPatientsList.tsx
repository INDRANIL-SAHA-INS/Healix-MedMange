// import React, { useState, useEffect } from 'react';
// import { Search, User, Calendar } from 'lucide-react';
// import { supabase } from '../../lib/supabase';
// import { useNavigate } from 'react-router-dom';

// interface SeenPatient {
//   id: string;
//   appointment_id: string;
//   doctor_id: string;
//   seen_at: string;
//   appointment: {
//     patient_name: string;
//     patient_phone: string;
//     patient_aadhar: string;
//     patient_email: string;
//     patient_address: string;
//     region_name: string;
//   };
// }

// interface GroupedPatients {
//   [key: string]: SeenPatient[];
// }

// export const AllPatientsList = () => {
//   const [searchTerm, setSearchTerm] = useState('');
//   const [groupedPatients, setGroupedPatients] = useState<GroupedPatients>({});
//   const [loading, setLoading] = useState(true);
//   const doctorData = JSON.parse(localStorage.getItem('doctor') || '{}');
//   const navigate = useNavigate();

//   useEffect(() => {
//     fetchSeenPatients();
//   }, []);

//   const fetchSeenPatients = async () => {
//     if (!doctorData.ref_id) return;
//     setLoading(true);

//     try {
//       const { data, error } = await supabase
//         .from('seen_patients')
//         .select(`
//           *,
//           appointment:appointments (
//             patient_name,
//             patient_phone,
//             patient_aadhar,
//             patient_email,
//             patient_address,
//             region_name
//           )
//         `)
//         .eq('doctor_id', doctorData.ref_id)
//         .order('seen_at', { ascending: false });

//       if (error) throw error;

//       // Group patients by date
//       const grouped = (data || []).reduce((acc: GroupedPatients, patient: SeenPatient) => {
//         const date = new Date(patient.seen_at).toLocaleDateString();
//         if (!acc[date]) {
//           acc[date] = [];
//         }
//         acc[date].push(patient);
//         return acc;
//       }, {});

//       setGroupedPatients(grouped);
//     } catch (error) {
//       console.error('Error fetching seen patients:', error);
//     } finally {
//       setLoading(false);
//     }
//   };

//   const openHealthReport = (appointmentId: string) => {
//     navigate(`/health-report/${appointmentId}`);
//   };

//   const getDateLabel = (dateStr: string) => {
//     const today = new Date().toLocaleDateString();
//     const yesterday = new Date(Date.now() - 86400000).toLocaleDateString();

//     if (dateStr === today) return 'Today';
//     if (dateStr === yesterday) return 'Yesterday';
//     return dateStr;
//   };

//   const filterPatients = (patients: SeenPatient[]) => {
//     if (!searchTerm) return patients;
//     return patients.filter(patient => 
//       patient.appointment.patient_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
//       patient.appointment.patient_phone.includes(searchTerm)
//     );
//   };

//   return (
//     <div className="bg-white rounded-lg shadow-md">
//       <div className="p-6 border-b border-gray-200">
//         <div className="flex justify-between items-center mb-6">
//           <h2 className="text-2xl font-semibold text-gray-800">All Seen Patients</h2>
//         </div>

//         <div className="relative">
//           <input
//             type="text"
//             placeholder="Search patients by name or phone..."
//             value={searchTerm}
//             onChange={(e) => setSearchTerm(e.target.value)}
//             className="w-full pl-10 pr-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
//           />
//           <Search className="absolute left-3 top-2.5 text-gray-400 w-5 h-5" />
//         </div>
//       </div>

//       <div className="p-6">
//         {loading ? (
//           <div className="text-center py-8">
//             <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
//             <p className="mt-4 text-gray-500">Loading patients...</p>
//           </div>
//         ) : (
//           <div className="space-y-8">
//             {Object.entries(groupedPatients).map(([date, patients]) => {
//               const filteredPatients = filterPatients(patients);
//               if (filteredPatients.length === 0) return null;

//               return (
//                 <div key={date} className="space-y-4">
//                   <div className="flex items-center">
//                     <Calendar className="h-5 w-5 text-gray-400 mr-2" />
//                     <h3 className="text-lg font-semibold text-gray-800">
//                       {getDateLabel(date)}
//                       <span className="ml-2 text-sm font-normal text-gray-500">
//                         ({filteredPatients.length} patients)
//                       </span>
//                     </h3>
//                   </div>

//                   <div className="grid gap-4">
//                     {filteredPatients.map((patient) => (
//                       <div
//                         key={patient.id}
//                         className="bg-white border rounded-lg shadow-sm p-4 hover:shadow-md transition-shadow"
//                       >
//                         <div className="flex items-center">
//                           <div className="h-10 w-10 rounded-full bg-blue-100 flex items-center justify-center">
//                             <User className="h-5 w-5 text-blue-600" />
//                           </div>
//                           <div className="ml-4">
//                             <button
//                               onClick={() => openHealthReport(patient.appointment_id)}
//                               className="text-sm font-medium text-blue-600 hover:text-blue-800 hover:underline"
//                             >
//                               {patient.appointment.patient_name}
//                             </button>
//                             <div className="text-sm text-gray-500">
//                               {patient.appointment.patient_phone}
//                             </div>
//                             <div className="text-sm text-gray-500">
//                               {patient.appointment.region_name}
//                             </div>
//                           </div>
//                         </div>
//                       </div>
//                     ))}
//                   </div>
//                 </div>
//               );
//             })}
//           </div>
//         )}
//       </div>
//     </div>
//   );
// };