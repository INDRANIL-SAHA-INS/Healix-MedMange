import React, { useEffect, useState } from 'react';
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from 'chart.js';
import { Pie } from 'react-chartjs-2';

ChartJS.register(ArcElement, Tooltip, Legend);

interface IncomeBracketPieProps {
  incomeData: string[];
}

const IncomeBracketPie: React.FC<IncomeBracketPieProps> = ({ incomeData }) => {
  const [distributionData, setDistributionData] = useState({
    labels: ['Low Income', 'Middle Income', 'High Income'],
    datasets: [{
      data: [0, 0, 0],
      backgroundColor: [
        'rgba(255, 99, 132, 0.6)',
        'rgba(54, 162, 235, 0.6)',
        'rgba(75, 192, 192, 0.6)',
      ],
      borderColor: [
        'rgba(255, 99, 132, 1)',
        'rgba(54, 162, 235, 1)',
        'rgba(75, 192, 192, 1)',
      ],
      borderWidth: 1,
    }],
  });

  useEffect(() => {
    const calculateDistribution = () => {
      const distribution = {
        low: 0,
        middle: 0,
        high: 0
      };

      incomeData.forEach(income => {
        switch (income.toLowerCase()) {
          case 'low':
            distribution.low++;
            break;
          case 'middle':
            distribution.middle++;
            break;
          case 'high':
            distribution.high++;
            break;
          default:
            break;
        }
      });

      setDistributionData(prev => ({
        ...prev,
        datasets: [{
          ...prev.datasets[0],
          data: [distribution.low, distribution.middle, distribution.high]
        }]
      }));
    };

    calculateDistribution();
  }, [incomeData]);

  return (
    <div className="flex flex-col items-center p-4 bg-white rounded-lg shadow">
      <h3 className="text-lg font-semibold mb-4">Income Bracket Distribution</h3>
      <div className="w-full max-w-md h-[300px] relative">
        <Pie 
          data={distributionData}
          options={{
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
              legend: {
                position: 'bottom',
                labels: {
                  padding: 20
                }
              },
              tooltip: {
                callbacks: {
                  label: (context) => {
                    const value = context.parsed;
                    const total = context.dataset.data.reduce((a: number, b: number) => a + b, 0);
                    const percentage = ((value * 100) / total).toFixed(1);
                    return `${context.label}: ${value} (${percentage}%)`;
                  }
                }
              }
            }
          }}
        />
      </div>
    </div>
  );
};

export default IncomeBracketPie;