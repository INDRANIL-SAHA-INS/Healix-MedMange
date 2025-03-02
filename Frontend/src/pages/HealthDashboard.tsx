import { useState, useEffect } from 'react';
import { BMIAnalysis } from '../components/BMIAnalysis';
import { VaccinationAnalysis } from '../components/VaccinationAnalysis';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../components/ui/tabs';

const HealthDashboard = () => {
  const [bmiData, setBmiData] = useState<BMIDataPoint[]>([]);
  const [vaccinationData, setVaccinationData] = useState<VaccinationData[]>([]);

  // Simulated data fetching
  useEffect(() => {
    // Fetch BMI data
    fetchBMIData().then(data => setBmiData(data));
    
    // Fetch Vaccination data
    fetchVaccinationData().then(data => setVaccinationData(data));
  }, []);

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-3xl font-bold mb-6">Health Analytics Dashboard</h1>
      
      <Tabs defaultValue="bmi" className="w-full">
        <TabsList className="grid grid-cols-2 w-1/4">
          <TabsTrigger value="bmi">BMI Analytics</TabsTrigger>
          <TabsTrigger value="vaccinations">Vaccinations</TabsTrigger>
        </TabsList>
        
        <TabsContent value="bmi">
          <div className="mt-4">
            <BMIAnalysis data={bmiData} />
          </div>
        </TabsContent>
        
        <TabsContent value="vaccinations">
          <div className="mt-4">
            <VaccinationAnalysis data={vaccinationData} />
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default HealthDashboard;