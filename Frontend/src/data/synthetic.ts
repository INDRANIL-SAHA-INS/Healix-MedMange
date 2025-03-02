// Synthetic data for the medical application
export const patients = [
  {
    id: 'P001',
    name: 'John Smith',
    age: 45,
    address: '123 Main St, Mumbai',
    region: 'West Mumbai',
    phone: '+91 98765 43210',
    aadharNumber: '1234 5678 9012',
    lastVisit: '2024-01-15',
    medicalHistory: ['Hypertension', 'Type 2 Diabetes'],
  },
  {
    id: 'P002',
    name: 'Priya Patel',
    age: 32,
    address: '456 Park Road, Mumbai',
    region: 'South Mumbai',
    phone: '+91 98765 43211',
    aadharNumber: '2345 6789 0123',
    lastVisit: '2024-01-20',
    medicalHistory: ['Asthma'],
  },
  // Add more patients...
];

export const appointments = [
  {
    id: 'A001',
    patientId: 'P001',
    patientName: 'John Smith',
    date: '2024-02-10',
    time: '10:00 AM',
    type: 'Follow-up',
    status: 'scheduled',
  },
  {
    id: 'A002',
    patientId: 'P002',
    patientName: 'Priya Patel',
    date: '2024-02-10',
    time: '11:30 AM',
    type: 'Regular Checkup',
    status: 'scheduled',
  },
  // Add more appointments...
];

export const communityHealth = {
  regions: [
    {
      name: 'West Mumbai',
      population: 500000,
      trends: [
        {
          condition: 'Respiratory Issues',
          cases: 1200,
          trend: 'increasing',
          period: 'Last 30 days',
        },
        {
          condition: 'Diabetes',
          cases: 3500,
          trend: 'stable',
          period: 'Last 30 days',
        },
        // Add more health trends...
      ],
    },
    // Add more regions...
  ],
};