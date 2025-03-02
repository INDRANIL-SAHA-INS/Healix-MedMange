import React from 'react';
import { Users } from 'lucide-react';

interface DepartmentOverviewProps {
  fullView?: boolean;
}

export const DepartmentOverview: React.FC<DepartmentOverviewProps> = ({ fullView = false }) => {
  const departments = [
    {
      id: 1,
      name: 'Cardiology',
      head: 'Dr. John Smith',
      doctors: 8,
      patients: 145,
      appointments: 12,
    },
    {
      id: 2,
      name: 'Neurology',
      head: 'Dr. Sarah Johnson',
      doctors: 6,
      patients: 98,
      appointments: 8,
    },
    {
      id: 3,
      name: 'Pediatrics',
      head: 'Dr. Michael Chen',
      doctors: 5,
      patients: 112,
      appointments: 15,
    },
    {
      id: 4,
      name: 'Orthopedics',
      head: 'Dr. Emily Brown',
      doctors: 7,
      patients: 89,
      appointments: 10,
    },
  ];

  return (
    <div className={`bg-white shadow rounded-lg ${fullView ? '' : 'p-6'}`}>
      {!fullView && <h2 className="text-lg font-medium text-gray-900 mb-4">Department Overview</h2>}
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Department
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Head
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Doctors
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Patients
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Today's Appointments
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {departments.map((dept) => (
              <tr key={dept.id} className="hover:bg-gray-50">
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm font-medium text-gray-900">{dept.name}</div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm text-gray-900">{dept.head}</div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="flex items-center">
                    <Users className="h-4 w-4 text-gray-400 mr-2" />
                    <span className="text-sm text-gray-900">{dept.doctors}</span>
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                  {dept.patients}
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-green-100 text-green-800">
                    {dept.appointments}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};