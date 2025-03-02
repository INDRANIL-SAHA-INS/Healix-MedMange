import { Bar, Line, Pie } from 'react-chartjs-2';
import { Chart, registerables } from 'chart.js';
import { useEffect } from 'react';

Chart.register(...registerables);

interface VaccinationDataPoint {
  age: number;
  gender: string;
  vaccines: string[];
}

interface VaccinationAnalysisProps {
  data: VaccinationDataPoint[];
}

export const VaccinationAnalysis: React.FC<VaccinationAnalysisProps> = ({ data }) => {
  // Use same empty state pattern as BMI analysis
  if (data.length === 0) {
    return (
      <div className="text-center py-8 text-gray-500">
        <p className="text-lg">📊 No Vaccination Data Available</p>
        <p className="mt-2 text-sm">Please select a different region or check back later</p>
      </div>
    );
  }

  // Match BMI analysis color scheme
  const colorPalette = {
    primary: '#4BC0C0',    // Teal
    secondary: '#FF6384',  // Pink
    accent: '#FFCE56',     // Yellow
    neutral: '#CCCCCC'     // Gray
  };

  // Process vaccine type data - only show important vaccines
  const vaccineCounts = data.reduce((acc, patient) => {
    patient.vaccines.forEach(vaccine => {
      // Normalize vaccine names for matching
      const normalized = vaccine.toLowerCase().replace(/[ -]/g, '');
      if (normalized.startsWith('polio')) acc.Polio++;
      else if (normalized === 'bcg') acc.BCG++;
      else if (normalized === 'dpt') acc.DPT++;
      else if (normalized.includes('measlesrubella') || normalized.includes('mr')) acc['Measles-Rubella']++;
      else if (normalized.includes('covid')) acc['COVID-19']++;
    });
    return acc;
  }, {
    Polio: 0,
    BCG: 0,
    DPT: 0,
    'Measles-Rubella': 0,
    'COVID-19': 0
  } as Record<string, number>);

  // Process age group data (same pattern as BMI category counting)
  const ageGroups = data.reduce((acc, patient) => {
    if (patient.age <= 18) acc['0-18']++;
    else if (patient.age <= 45) acc['19-45']++;
    else if (patient.age <= 60) acc['46-60']++;
    else acc['60+']++;
    return acc;
  }, { '0-18': 0, '19-45': 0, '46-60': 0, '60+': 0 } as Record<string, number>);

  // Process gender data
  const genderCounts = data.reduce((acc, patient) => {
    const gender = patient.gender.toLowerCase();
    acc[gender] = (acc[gender] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  // Calculate total vaccinations for age groups
  const totalAgeVaccinations = Object.values(ageGroups).reduce((a: number, b: number) => a + b, 0);

  // Update ageGroupData with percentages
  const ageGroupData = {
    labels: Object.keys(ageGroups),
    datasets: [{
      label: 'Vaccination Rates by Age',
      data: Object.values(ageGroups).map(count => 
        totalAgeVaccinations > 0 ? (count / totalAgeVaccinations) * 100 : 0
      ),
      borderColor: colorPalette.primary,
      backgroundColor: context => {
        const ctx = context.chart.ctx;
        const gradient = ctx.createLinearGradient(0, 0, 0, 400);
        gradient.addColorStop(0, `${colorPalette.primary}40`);
        gradient.addColorStop(1, `${colorPalette.primary}10`);
        return gradient;
      },
      borderWidth: 3,
      tension: 0.4,
      pointRadius: 5,
      pointHoverRadius: 8,
      pointBackgroundColor: colorPalette.primary,
      fill: true,
      spanGaps: true
    }]
  };

  // Calculate total vaccinations for percentage conversion
  const totalVaccinations = Object.values(vaccineCounts).reduce((a: number, b: number) => a + b, 0);

  // Update vaccineTypeData with percentages
  const vaccineTypeData = {
    labels: Object.keys(vaccineCounts),
    datasets: [{
      label: 'Vaccination Distribution',
      data: Object.values(vaccineCounts).map(count => 
        totalVaccinations > 0 ? (count / totalVaccinations) * 100 : 0
      ),
      backgroundColor: [
        colorPalette.primary,
        colorPalette.secondary,
        colorPalette.accent,
        colorPalette.neutral,
        '#36A2EB',
        '#9966FF'
      ],
      borderColor: '#fff',
      borderWidth: 1,
      borderRadius: 8,
      borderSkipped: false
    }]
  };

  // Gender Distribution Pie Chart
  const genderData = {
    labels: Object.keys(genderCounts).map(g => g.charAt(0).toUpperCase() + g.slice(1)),
    datasets: [{
      data: Object.values(genderCounts),
      backgroundColor: [
        colorPalette.primary, // Male
        colorPalette.secondary, // Female
        colorPalette.accent  // Other
      ],
      borderColor: '#fff',
      borderWidth: 1
    }]
  };

  return (
    <div className="space-y-8">
      {/* Age Group Breakdown */}
      <div className="bg-white rounded-lg shadow-lg p-6 max-w-3xl w-full">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-xl font-semibold">Age-Specific Vaccination Trends</h3>
          <div className="bg-gray-100 px-4 py-2 rounded-full">
            <span className="font-medium text-gray-700">
              Total Vaccinations: {totalAgeVaccinations}
            </span>
          </div>
        </div>
        <div className="h-96">
          <Line
            data={ageGroupData}
            options={{
              responsive: true,
              maintainAspectRatio: false,
              plugins: {
                legend: {
                  display: true,
                  position: 'top',
                  labels: {
                    color: '#374151',
                    font: { size: 14 }
                  }
                },
                tooltip: {
                  mode: 'index',
                  intersect: false,
                  callbacks: {
                    title: (context) => `Age Group: ${context[0].label}`,
                    label: (context) => {
                      const label = context.label as keyof typeof ageGroups;
                      const rawValue = ageGroups[label];
                      const percentage = context.parsed.y ? context.parsed.y.toFixed(1) : '0';
                      return `${rawValue} vaccinations (${percentage}%)`;
                    }
                  }
                }
              },
              scales: {
                x: {
                  grid: { display: false },
                  title: {
                    display: true,
                    text: 'Age Groups',
                    color: '#6B7280'
                  }
                },
                y: {
                  min: 0,
                  max: 100,
                  grid: { color: '#E5E7EB' },
                  title: {
                    display: true,
                    text: 'Percentage of Vaccinations',
                    color: '#6B7280'
                  },
                  ticks: {
                    callback: (value) => `${value}%`
                  }
                }
              },
              elements: {
                line: {
                  borderWidth: 2
                },
                point: {
                  hoverBorderWidth: 2
                }
              }
            }}
          />
        </div>
      </div>

      {/* Vaccine Type Distribution */}
      <div className="bg-white rounded-lg shadow-lg p-6 max-w-3xl w-full">
        <h3 className="text-xl font-semibold mb-4">Vaccine Type Distribution</h3>
        <div className="h-96">
          <Bar
            data={vaccineTypeData}
            options={{
              responsive: true,
              maintainAspectRatio: false,
              plugins: {
                legend: { display: false },
                tooltip: {
                  callbacks: {
                    label: (context) => {
                      const label = context.label || '';
                      const rawValue = vaccineCounts[label as keyof typeof vaccineCounts];
                      const percentage = context.parsed.y ? context.parsed.y.toFixed(1) : '0';
                      return `${label}: ${rawValue} (${percentage}%)`;
                    }
                  }
                }
              },
              scales: {
                x: {
                  grid: { display: false },
                  title: {
                    display: true,
                    text: 'Vaccine Types',
                    color: '#6B7280'
                  }
                },
                y: {
                  min: 0,
                  max: 100,
                  grid: { color: '#E5E7EB' },
                  title: {
                    display: true,
                    text: 'Percentage of Vaccinations',
                    color: '#6B7280'
                  },
                  ticks: {
                    callback: (value) => `${value}%`
                  }
                }
              },
              elements: {
                bar: {
                  hoverBackgroundColor: context => {
                    const colors = vaccineTypeData.datasets[0].backgroundColor;
                    return colors[context.dataIndex];
                  }
                }
              }
            }}
          />
        </div>
      </div>

      {/* Gender Distribution */}
      <div className="bg-white rounded-lg shadow-lg p-6 max-w-3xl w-full">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-xl font-semibold">Gender Distribution</h3>
          <div className="flex items-center space-x-4">
            <div className="bg-gray-100 px-4 py-2 rounded-full">
              <span className="font-medium text-gray-700">
                Total Patients: {data.length}
              </span>
            </div>
            <div className="flex space-x-2">
              {/*{Object.entries(genderCounts).map(([gender, count], index) => (*/}
              {/*  <div key={gender} className="flex items-center space-x-1">*/}
              {/*    <div */}
              {/*      className="w-4 h-4 rounded-full" */}
              {/*      style={{ */}
              {/*        backgroundColor: genderData.datasets[0].backgroundColor[index]*/}
              {/*      }}*/}
              {/*    ></div>*/}
              {/*    <span className="text-sm text-gray-600">*/}
              {/*      {gender.charAt(0).toUpperCase() + gender.slice(1)}: {count}*/}
              {/*    </span>*/}
              {/*  </div>*/}
              {/*))}*/}
            </div>
          </div>
        </div>
        <div className="h-96">
          <Pie
            data={genderData}
            options={{
              responsive: true,
              maintainAspectRatio: false,
              plugins: {
                legend: {
                  display: true,
                  position: 'right',
                  labels: {
                    color: '#374151',
                    font: { size: 14 }
                  }
                },
                tooltip: {
                  callbacks: {
                    label: (context) => {
                      const label = context.label || '';
                      const value = context.parsed || 0;
                      const total = context.dataset.data.reduce((a: number, b: number) => a + b, 0);
                      const percentage = ((value / total) * 100).toFixed(1);
                      return `${label}: ${value} (${percentage}%)`;
                    }
                  }
                }
              }
            }}
          />
        </div>
      </div>
    </div>
  );
}; 