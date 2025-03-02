import React from 'react';
import { MapPin } from 'lucide-react';

export const AppointmentsOverview: React.FC = () => {
  const appointments = [
    {
      id: 1,
      doctor: 'Dr. Sarah Johnson',
      department: 'Cardiology',
      region: 'North Wing',
      appointments: 5,
      nextSlot: '10:30 AM',
    },
    {
      id: 2,
      doctor: 'Dr. Michael Chen',
      department: 'Neurology',
      region: 'East Wing',
      appointments: 3,
      nextSlot: '11:00 AM',
    },
    {
      id: 3,
      doctor: 'Dr. Emily Brown',
      department: 'Pediatrics',
      region: 'West Wing',
      appointments: 7,
      nextSlot: '09:45 AM',
    },
    {
      id: 4,
      doctor: 'Dr. James Wilson',
      department: 'Orthopedics',
      region: 'South Wing',
      appointments: 4,
      nextSlot: '10:15 AM',
    },
  ];

  return (
    <div className="p-4">
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Doctor
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Department
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Region
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Total Appointments
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Next Available Slot
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {appointments.map((apt) => (
              <tr key={apt.id} className="hover:bg-gray-50">
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm font-medium text-gray-900">{apt.doctor}</div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm text-gray-900">{apt.department}</div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="flex items-center">
                    <MapPin className="h-4 w-4 text-gray-400 mr-2" />
                    <span className="text-sm text-gray-900">{apt.region}</span>
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-blue-100 text-blue-800">
                    {apt.appointments}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                  {apt.nextSlot}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};