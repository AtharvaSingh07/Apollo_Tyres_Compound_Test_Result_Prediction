import React from 'react';
import { motion } from 'framer-motion';
import ResultGraphs from './ResultGraphs';
import { saveReport } from './utils';

const PredictionResultDisplay = ({
  buttonVariants,
  containerVariants,
  itemVariants,
  predictionResults,
  materialCompositions,
  toggleGraph,
  showGraph,
  startNewPrediction,
  setCurrentPage
}) => {
  // Handler for saving the report
  const handleSaveReport = () => {
    saveReport(predictionResults, materialCompositions);
  };

  return (
    <motion.div
      key="prediction-results"
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      exit="exit"
      className="bg-white/90 backdrop-blur-md p-8 rounded-xl shadow-2xl w-[40rem] z-10"
    >
      <motion.h2
        variants={itemVariants}
        className="text-2xl font-semibold mb-6 text-purple-600"
      >
        Predicted Compound Results
      </motion.h2>

      <motion.div
        variants={itemVariants}
        className="grid grid-cols-2 gap-4 mb-6"
      >
        <div className="bg-purple-50 p-4 rounded-lg">
          <h3 className="text-lg font-medium mb-2 text-purple-600">Tensile Strength</h3>
          <p className="text-2xl font-bold">{predictionResults.tensileStrength} MPa</p>
        </div>
        <div className="bg-purple-50 p-4 rounded-lg">
          <h3 className="text-lg font-medium mb-2 text-purple-600">Elongation</h3>
          <p className="text-2xl font-bold">{predictionResults.elongation}%</p>
        </div>
        <div className="bg-purple-50 p-4 rounded-lg">
          <h3 className="text-lg font-medium mb-2 text-purple-600">Hardness</h3>
          <p className="text-2xl font-bold">{predictionResults.hardness} Shore A</p>
        </div>
        <div className="bg-purple-50 p-4 rounded-lg">
          <h3 className="text-lg font-medium mb-2 text-purple-600">Abrasion Resistance</h3>
          <p className="text-2xl font-bold">{predictionResults.abrasionResistance} mm³</p>
        </div>
        <div className="bg-purple-50 p-4 rounded-lg">
          <h3 className="text-lg font-medium mb-2 text-purple-600">Tear Strength</h3>
          <p className="text-2xl font-bold">{predictionResults.tearStrength} kN/m</p>
        </div>
        <div className="bg-purple-50 p-4 rounded-lg">
          <h3 className="text-lg font-medium mb-2 text-purple-600">Density</h3>
          <p className="text-2xl font-bold">{predictionResults.density} g/cm³</p>
        </div>
      </motion.div>

      <motion.div variants={itemVariants} className="mb-6">
        <div className="bg-green-50 p-4 rounded-lg">
          <h3 className="text-lg font-medium mb-2 text-green-600">Confidence Score</h3>
          <div className="flex items-center">
            <div className="flex-1 bg-gray-200 rounded-full h-4 mr-2">
              <div
                className="bg-green-500 h-4 rounded-full"
                style={{ width: `${predictionResults.confidenceScore}%` }}
              ></div>
            </div>
            <span className="font-bold">{predictionResults.confidenceScore}%</span>
          </div>
        </div>
      </motion.div>

      <motion.div variants={itemVariants} className="mb-6">
        <div className="bg-blue-50 p-4 rounded-lg">
          <h3 className="text-lg font-medium mb-2 text-blue-600">Recommended Uses</h3>
          <ul className="list-disc pl-5">
            {predictionResults.recommendedUses.map((use, index) => (
              <li key={index}>{use}</li>
            ))}
          </ul>
        </div>
      </motion.div>

      <motion.div variants={itemVariants} className="mb-6">
        <motion.button
          variants={buttonVariants}
          whileHover="hover"
          whileTap="tap"
          onClick={toggleGraph}
          className="bg-purple-500 text-white py-2 px-4 rounded-lg hover:bg-purple-600 transition-colors"
        >
          {showGraph ? "Hide Detailed Analysis" : "Show Detailed Analysis"}
        </motion.button>
      </motion.div>

      {showGraph && <ResultGraphs predictionResults={predictionResults} />}

      <motion.div
        variants={itemVariants}
        className="flex space-x-4 mt-6"
      >
        <motion.button
          variants={buttonVariants}
          whileHover="hover"
          whileTap="tap"
          onClick={() => setCurrentPage('material-composition')}
          className="w-1/3 bg-gray-300 text-gray-700 py-2 px-4 rounded-lg hover:bg-gray-400 transition-colors"
        >
          Back
        </motion.button>
        <motion.button
          variants={buttonVariants}
          whileHover="hover"
          whileTap="tap"
          onClick={handleSaveReport}
          className="w-1/3 bg-blue-500 text-white py-2 px-4 rounded-lg hover:bg-blue-600 transition-colors"
        >
          Save Report
        </motion.button>
        <motion.button
          variants={buttonVariants}
          whileHover="hover"
          whileTap="tap"
          onClick={startNewPrediction}
          className="w-1/3 bg-green-500 text-white py-2 px-4 rounded-lg hover:bg-green-600 transition-colors"
        >
          New Prediction
        </motion.button>
      </motion.div>
    </motion.div>
  );
};

export default PredictionResultDisplay;