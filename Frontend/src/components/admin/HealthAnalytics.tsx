import React from 'react';
import { Activity, TrendingUp, TrendingDown, Users, AlertCircle } from 'lucide-react';

export const HealthAnalytics = () => {
  const healthMetrics = [
    {
      title: 'Overall Health Index',
      value: '87%',
      trend: 'up',
      change: '+2.3%',
      description: 'Based on patient recovery rates'
    },
    {
      title: 'Critical Cases',
      value: '5',
      trend: 'down',
      change: '-12%',
      description: 'Active critical cases'
    },
    {
      title: 'Average Recovery Time',
      value: '12 days',
      trend: 'down',
      change: '-1.5 days',
      description: 'For standard treatments'
    },
    {
      title: 'Patient Satisfaction',
      value: '92%',
      trend: 'up',
      change: '+4%',
      description: 'Based on recent surveys'
    }
  ];

  const diseaseMetrics = [
    {
      disease: 'Respiratory Infections',
      cases: 45,
      trend: 'increasing',
      riskLevel: 'medium'
    },
    {
      disease: 'Cardiovascular Issues',
      cases: 32,
      trend: 'stable',
      riskLevel: 'high'
    },
    {
      disease: 'Diabetes',
      cases: 78,
      trend: 'decreasing',
      riskLevel: 'medium'
    },
    {
      disease: 'Hypertension',
      cases: 120,
      trend: 'stable',
      riskLevel: 'low'
    }
  ];

  return (
    <div className="p-6">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900 mb-2">Health Analytics Dashboard</h1>
        <p className="text-gray-600">Comprehensive health metrics and trends analysis</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {healthMetrics.map((metric, index) => (
          <div key={index} className="bg-white p-6 rounded-lg shadow-md">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm font-medium text-gray-500">{metric.title}</h3>
              {metric.trend === 'up' ? (
                <TrendingUp className="h-5 w-5 text-green-500" />
              ) : (
                <TrendingDown className="h-5 w-5 text-red-500" />
              )}
            </div>
            <div className="flex items-baseline">
              <p className="text-2xl font-semibold text-gray-900">{metric.value}</p>
              <p className={`ml-2 text-sm ${
                metric.trend === 'up' ? 'text-green-600' : 'text-red-600'
              }`}>
                {metric.change}
              </p>
            </div>
            <p className="mt-1 text-sm text-gray-500">{metric.description}</p>
          </div>
        ))}
      </div>

      <div className="bg-white rounded-lg shadow-md p-6 mb-8">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Disease Prevalence</h2>
        <div className="space-y-4">
          {diseaseMetrics.map((disease, index) => (
            <div key={index} className="border-b border-gray-200 pb-4 last:border-0 last:pb-0">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center">
                  <Activity className="h-5 w-5 text-gray-400 mr-2" />
                  <span className="font-medium text-gray-900">{disease.disease}</span>
                </div>
                <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                  disease.riskLevel === 'high' ? 'bg-red-100 text-red-800' :
                  disease.riskLevel === 'medium' ? 'bg-yellow-100 text-yellow-800' :
                  'bg-green-100 text-green-800'
                }`}>
                  {disease.riskLevel.toUpperCase()}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <Users className="h-4 w-4 text-gray-400 mr-2" />
                  <span className="text-sm text-gray-600">{disease.cases} cases</span>
                </div>
                <span className={`flex items-center text-sm ${
                  disease.trend === 'increasing' ? 'text-red-600' :
                  disease.trend === 'decreasing' ? 'text-green-600' :
                  'text-gray-600'
                }`}>
                  {disease.trend === 'increasing' && <TrendingUp className="h-4 w-4 mr-1" />}
                  {disease.trend === 'decreasing' && <TrendingDown className="h-4 w-4 mr-1" />}
                  {disease.trend === 'stable' && <Activity className="h-4 w-4 mr-1" />}
                  {disease.trend.charAt(0).toUpperCase() + disease.trend.slice(1)}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="bg-white rounded-lg shadow-md p-6">
        <div className="flex items-center mb-4">
          <AlertCircle className="h-5 w-5 text-red-500 mr-2" />
          <h2 className="text-lg font-semibold text-gray-900">Critical Alerts</h2>
        </div>
        <div className="space-y-4">
          <div className="flex items-center justify-between p-4 bg-red-50 rounded-lg">
            <div className="flex items-center">
              <span className="w-2 h-2 bg-red-600 rounded-full mr-2"></span>
              <span className="text-red-800">High number of respiratory cases in West Wing</span>
            </div>
            <button className="text-sm text-red-600 hover:text-red-800">View Details</button>
          </div>
          <div className="flex items-center justify-between p-4 bg-yellow-50 rounded-lg">
            <div className="flex items-center">
              <span className="w-2 h-2 bg-yellow-600 rounded-full mr-2"></span>
              <span className="text-yellow-800">Increased wait times in Emergency Department</span>
            </div>
            <button className="text-sm text-yellow-600 hover:text-yellow-800">View Details</button>
          </div>
        </div>
      </div>
    </div>
  );
};