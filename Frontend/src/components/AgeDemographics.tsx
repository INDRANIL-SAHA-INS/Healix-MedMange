import React, { useEffect, useState } from 'react';
import {
    Chart as ChartJS,
    CategoryScale,
    LinearScale,
    PointElement,
    LineElement,
    Title,
    Tooltip,
    Legend
} from 'chart.js';
import { Line } from 'react-chartjs-2';
import { communityHealthService } from '../services/communityHealthService';

ChartJS.register(
    CategoryScale,
    LinearScale,
    PointElement,
    LineElement,
    Title,
    Tooltip,
    Legend
);

interface AgeDemographicsProps {
    regionId: string;
    ages?: number[];
}

interface AgeGroups {
    children: number;
    workingAge: number;
    elderly: number;
}

const AgeDemographics: React.FC<AgeDemographicsProps> = ({ regionId, ages = [] }) => {
    const [ageGroups, setAgeGroups] = useState<AgeGroups>({
        children: 0,
        workingAge: 0,
        elderly: 0
    });
    const [error, setError] = useState<string>('');
    const [loading, setLoading] = useState<boolean>(false);

    // frequency array for ages 0 to 100
    const [frequencyData, setFrequencyData] = useState<number[]>(Array(101).fill(0));

    // Define age group intervals
    const ageIntervals = [
        '0-9', '10-19', '20-29', '30-39', '40-49',
        '50-59', '60-69', '70-79', '80-89', '90+'
    ];

    // Function to group ages into intervals
    const getAgeGroupDistribution = (ages: number[]) => {
        const distribution = Array(10).fill(0);
        const total = ages.length;
        
        if (total === 0) return distribution;

        ages.forEach(age => {
            if (age >= 90) {
                distribution[9]++;
            } else {
                const index = Math.floor(age / 10);
                if (index >= 0 && index < 10) {
                    distribution[index]++;
                }
            }
        });

        // Convert counts to probabilities
        return distribution.map(count => count / total);
    };

    useEffect(() => {
        // Reset states when region changes
        setAgeGroups({
            children: 0,
            workingAge: 0,
            elderly: 0
        });
        setFrequencyData(Array(101).fill(0));
        
        const fetchAgeData = async () => {
            setLoading(true);
            setError('');
            try {
                console.log('Fetching age data for region:', regionId);
                const data = await communityHealthService.getAgeDemographics(regionId);
                console.log('Received data:', data);
    
                if (!data || !Array.isArray(data)) {
                    setFrequencyData(Array(101).fill(0));
                    setAgeGroups({ children: 0, workingAge: 0, elderly: 0 });
                    return;
                }
    
                // Process age data: extract and convert age values
                const ages = data.map((item: any) => {
                    if (!item.age) {
                        console.warn('Item missing age:', item);
                        return null;
                    }
                    return parseInt(item.age);
                }).filter((age): age is number => age !== null);
    
                console.log('Processed ages array:', ages);
                
                if (ages.length === 0) {
                    setFrequencyData(Array(101).fill(0));
                    setAgeGroups({ children: 0, workingAge: 0, elderly: 0 });
                    return;
                }
    
                // Calculate percentages for age groups
                const total = ages.length;
                if (total === 0) {
                    throw new Error('No age data available');
                }
    
                const childrenCount = ages.filter(age => age < 15).length;
                const workingAgeCount = ages.filter(age => age >= 15 && age < 65).length;
                const elderlyCount = ages.filter(age => age >= 65).length;
    
                setAgeGroups({
                    children: (childrenCount / total) * 100,
                    workingAge: (workingAgeCount / total) * 100,
                    elderly: (elderlyCount / total) * 100
                });
    
                // Build frequency distribution array for ages 0 to 100
                const frequency = Array(101).fill(0);
                ages.forEach(age => {
                    if (age >= 0 && age <= 100) {
                        frequency[age] = frequency[age] + 1;
                    }
                });
                setFrequencyData(frequency);
    
            } catch (err) {
                console.error('Error in fetchAgeData:', err);
                setError(err instanceof Error ? err.message : 'Failed to fetch age data');
                // Reset data on error
                setFrequencyData(Array(101).fill(0));
                setAgeGroups({ children: 0, workingAge: 0, elderly: 0 });
            } finally {
                setLoading(false);
            }
        };
    
        if (regionId) {
            fetchAgeData();
        } else {
            // Reset data when no region is selected
            setFrequencyData(Array(101).fill(0));
            setAgeGroups({ children: 0, workingAge: 0, elderly: 0 });
        }
    }, [regionId]);
    
    useEffect(() => {
        // Calculate age groups and frequency data
        if (ages.length > 0) {
            // Calculate percentages for age groups
            const total = ages.length;
            const childrenCount = ages.filter(age => age < 15).length;
            const workingAgeCount = ages.filter(age => age >= 15 && age < 65).length;
            const elderlyCount = ages.filter(age => age >= 65).length;

            setAgeGroups({
                children: (childrenCount / total) * 100,
                workingAge: (workingAgeCount / total) * 100,
                elderly: (elderlyCount / total) * 100
            });

            // Build frequency distribution
            const frequency = Array(101).fill(0);
            ages.forEach(age => {
                if (age >= 0 && age <= 100) {
                    frequency[age]++;
                }
            });
            setFrequencyData(frequency);
        }
    }, [ages]);

    const chartData = {
        labels: ageIntervals,
        datasets: [
            {
                label: 'Probability Distribution',
                data: getAgeGroupDistribution(ages),
                borderColor: 'rgba(75, 192, 192, 1)',
                backgroundColor: 'rgba(75, 192, 192, 0.2)',
                tension: 0.4,
                fill: true,
                pointBackgroundColor: 'rgba(75, 192, 192, 1)',
                pointRadius: 4,
                pointHoverRadius: 6,
            }
        ]
    };

    const chartOptions = {
        responsive: true,
        maintainAspectRatio: false,
        scales: {
            x: {
                title: {
                    display: true,
                    text: 'Age Groups'
                },
                grid: {
                    display: false
                }
            },
            y: {
                beginAtZero: true,
                max: 1, // Set maximum to 1 (100%)
                title: {
                    display: true,
                    text: 'Probability'
                },
                grid: {
                    color: 'rgba(0, 0, 0, 0.1)'
                },
                ticks: {
                    callback: (value: number) => (value * 100).toFixed(1) + '%',
                    stepSize: 0.1 // Step size of 0.1 (10%)
                }
            }
        },
        plugins: {
            title: {
                display: true,
                text: 'Age Distribution',
                font: {
                    size: 16
                }
            },
            tooltip: {
                callbacks: {
                    label: (context: any) => {
                        const probability = context.parsed.y;
                        const count = Math.round(probability * ages.length);
                        return [
                            `Probability: ${(probability * 100).toFixed(1)}%`,
                            `Count: ${count}`
                        ];
                    }
                }
            }
        }
    };

    if (loading) {
        return <div className="text-center p-4">Loading age demographics...</div>;
    }
    
    if (error) {
        return <div className="text-center p-4 text-red-500">Error: {error}</div>;
    }
    
    return (
        <div className="flex flex-col md:flex-row gap-4 p-4">
            <div className="w-full md:w-2/3 h-[400px] bg-white p-4 rounded-lg shadow">
                <Line data={chartData} options={chartOptions} />
            </div>
            <div className="w-full md:w-1/3 bg-gray-50 p-4 rounded-lg shadow">
                <h3 className="text-lg font-semibold mb-4">Age Group Summary</h3>
                <ul className="space-y-4">
                    <li className="text-base border-b pb-2">
                        <div className="font-medium">Children (0-14)</div>
                        <div className="flex justify-between text-sm text-gray-600">
                            <span>Percentage: {ageGroups.children.toFixed(1)}%</span>
                            <span>Count: {frequencyData.slice(0, 15).reduce((a, b) => a + b, 0)}</span>
                        </div>
                    </li>
                    <li className="text-base border-b pb-2">
                        <div className="font-medium">Working Age (15-64)</div>
                        <div className="flex justify-between text-sm text-gray-600">
                            <span>Percentage: {ageGroups.workingAge.toFixed(1)}%</span>
                            <span>Count: {frequencyData.slice(15, 65).reduce((a, b) => a + b, 0)}</span>
                        </div>
                    </li>
                    <li className="text-base">
                        <div className="font-medium">Elderly (65+)</div>
                        <div className="flex justify-between text-sm text-gray-600">
                            <span>Percentage: {ageGroups.elderly.toFixed(1)}%</span>
                            <span>Count: {frequencyData.slice(65).reduce((a, b) => a + b, 0)}</span>
                        </div>
                    </li>
                </ul>
                <div className="mt-4 pt-2 border-t text-sm text-gray-600">
                    <div className="flex justify-between">
                        <span>Total Patients:</span>
                        <span>{frequencyData.reduce((a, b) => a + b, 0)}</span>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default AgeDemographics;