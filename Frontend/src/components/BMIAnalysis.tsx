import { Bar, Scatter, Pie } from 'react-chartjs-2';
import { Chart, registerables } from 'chart.js';
import { useEffect } from 'react';

Chart.register(...registerables);

interface BMIDataPoint {
  bmi: number;
  weight: number;
  height: number;
  recorded_at?: string;
}

interface BMIAnalysisProps {
  data: BMIDataPoint[];
}

export const BMIAnalysis: React.FC<BMIAnalysisProps> = ({ data }) => {
  // Handle empty data case first
  if (data.length === 0) {
    return (
      <div className="text-center py-8 text-gray-500">
        <p className="text-lg">📊 No BMI Data Available</p>
        <p className="mt-2 text-sm">Please select a different region or check back later</p>
      </div>
    );
  }

  // Improved color scheme with distinct colors
  const categoryColors = {
    underweight: '#FF6384', // Pink
    normal: '#4BC0C0',      // Teal
    overweight: '#FFCE56',  // Yellow
    obese: '#FF0000'        // Red
  };

  // Optimize category counting with single pass
  const categories = data.reduce((acc, d) => {
    if (d.bmi < 18.5) acc.underweight++;
    else if (d.bmi < 25) acc.normal++;
    else if (d.bmi < 30) acc.overweight++;
    else acc.obese++;
    return acc;
  }, { underweight: 0, normal: 0, overweight: 0, obese: 0 });

  // Add sampling for large datasets
  const MAX_POINTS = 5000;
  const sampledData = data.length > MAX_POINTS 
    ? data.filter((_, i) => i % Math.ceil(data.length/MAX_POINTS) === 0)
    : data;

  // Chart configurations
  const histogramData = {
    labels: ['Underweight (<18.5)', 'Normal (18.5-24.9)', 'Overweight (25-29.9)', 'Obese (30+)'],
    datasets: [{
      label: 'Number of Patients',
      data: Object.values(categories),
      backgroundColor: [
        categoryColors.underweight,
        categoryColors.normal,
        categoryColors.overweight,
        categoryColors.obese
      ],
      borderColor: '#fff',
      borderWidth: 1
    }]
  };

  // Scatter plot data with fixed colors
  const scatterData = {
    datasets: [{
      label: 'Patients',
      data: data.map(d => ({
        x: d.height,
        y: d.weight,
        bmi: d.bmi
      })),
      backgroundColor: data.map(d => 
        d.bmi < 18.5 ? categoryColors.underweight :
        d.bmi < 25 ? categoryColors.normal :
        d.bmi < 30 ? categoryColors.overweight :
        categoryColors.obese // Now distinct color for obese
      ),
      pointRadius: 3,
      pointHoverRadius: 5,
      pointBorderWidth: 0,
      pointHoverBorderWidth: 1
    }]
  };

  // Enhanced pie chart configuration
  const pieData = {
    labels: Object.keys(categories).map(label => 
      label.charAt(0).toUpperCase() + label.slice(1)
    ),
    datasets: [{
      data: Object.values(categories),
      backgroundColor: Object.values(categoryColors),
      borderColor: '#fff',
      borderWidth: 2
    }]
  };

  return (
    <div className="space-y-8 flex flex-col items-center">
      {/* BMI Distribution Histogram */}
      <div className="bg-white rounded-lg shadow-lg p-6 max-w-3xl w-full">
        <h3 className="text-xl font-semibold mb-4">BMI Distribution</h3>
        <div className="h-96">
          <Bar
            data={histogramData}
            options={{
              responsive: true,
              maintainAspectRatio: false,
              plugins: {
                legend: { display: false },
                tooltip: {
                  callbacks: {
                    title: (context) => context[0].label.replace(/[()]/g, ''),
                    label: (context) => `${context.formattedValue} patients`
                  }
                }
              },
              scales: {
                y: { 
                  beginAtZero: true,
                  title: { display: true, text: 'Number of Patients' }
                }
              }
            }}
          />
        </div>
      </div>

      {/* Weight vs Height Scatter Plot */}
      <div className="bg-white p-4 rounded-lg shadow max-w-3xl w-full">
        <h3 className="text-lg font-semibold mb-4">Weight vs Height Distribution</h3>
        <div className="h-64">
          <Scatter data={scatterData} options={{
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
              legend: {
                display: true,
                labels: {
                  generateLabels: () => [
                    { text: 'Underweight', fillStyle: categoryColors.underweight },
                    { text: 'Normal', fillStyle: categoryColors.normal },
                    { text: 'Overweight', fillStyle: categoryColors.overweight },
                    { text: 'Obese', fillStyle: categoryColors.obese }
                  ]
                }
              },
              tooltip: {
                callbacks: {
                  title: () => '',
                  label: (context) => {
                    const data = context.raw as { x: number; y: number; bmi: number };
                    return [
                      `Height: ${data.x.toFixed(2)}m`,
                      `Weight: ${data.y}kg`,
                      `BMI: ${data.bmi.toFixed(1)}`
                    ];
                  }
                }
              }
            },
            scales: {
              x: { 
                title: { display: true, text: 'Height (m)' },
                ticks: {}
              },
              y: { 
                title: { display: true, text: 'Weight (kg)' },
                ticks: {}
              }
            }
          }} />
        </div>
      </div>

      {/* BMI Category Pie Chart */}
      <div className="bg-white p-4 rounded-lg shadow max-w-3xl w-full">
        <h3 className="text-lg font-semibold mb-4">BMI Category Breakdown</h3>
        <div className="h-64">
          <Pie data={pieData} options={{
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
              legend: {
                position: 'right',
                labels: {
                  color: '#374151',
                  font: {
                    size: 14
                  },
                  padding: 20
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
          }} />
        </div>
      </div>
    </div>
  );
};