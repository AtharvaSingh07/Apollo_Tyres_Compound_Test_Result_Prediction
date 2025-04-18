import React from 'react';
import { motion } from 'framer-motion';

const LoadingScreen = () => {
  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 flex items-center justify-center bg-black/50 backdrop-blur-sm z-50"
    >
      <motion.div 
        className="bg-white p-8 rounded-xl shadow-2xl"
        initial={{ scale: 0.8, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
      >
        <div className="flex flex-col items-center">
          <div className="w-16 h-16 border-4 border-purple-500 border-t-transparent rounded-full animate-spin mb-4"></div>
          <p className="text-xl font-medium text-purple-600">Predicting Results...</p>
          <p className="text-gray-500 mt-2">Analyzing material combinations</p>
        </div>
      </motion.div>
    </motion.div>
  );
};

export default LoadingScreen;