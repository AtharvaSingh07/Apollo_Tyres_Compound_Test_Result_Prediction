import React from 'react';
import { motion } from 'framer-motion';
import { 
  ResponsiveContainer, 
  BarChart, 
  CartesianGrid, 
  XAxis, 
  YAxis, 
  Tooltip, 
  Legend, 
  Bar 
} from 'recharts';
import { getPropertyGraphData } from './utils';

const ResultGraphs = ({ predictionResults }) => {
  if (!predictionResults) return null;
  
  return (
    <motion.div
      initial={{ opacity: 0, height: 0 }}
      animate={{ opacity: 1, height: 'auto' }}
      exit={{ opacity: 0, height: 0 }}
      transition={{ duration: 0.5 }}
      className="mt-4"
    >
      <div className="bg-white p-4 rounded-lg shadow-md">
        <h4 className="text-lg font-semibold text-purple-600 mb-4">Property Comparison</h4>
        <div className="h-64">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart
              data={getPropertyGraphData(predictionResults)}
              margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
            >
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Bar dataKey="value" fill="#8884d8" name="Value" />
            </BarChart>
          </ResponsiveContainer>
        </div>
        
        <div className="mt-6">
          <h4 className="text-lg font-semibold text-purple-600 mb-4">Historical Comparison</h4>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={predictionResults.historicalData}
                margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
              >
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Bar dataKey="tensileStrength" fill="#8884d8" name="Tensile Strength (MPa)" />
                <Bar dataKey="hardness" fill="#82ca9d" name="Hardness" />
                <Bar dataKey="tearStrength" fill="#ffc658" name="Tear Strength (kN/m)" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </motion.div>
  );
};

export default ResultGraphs;