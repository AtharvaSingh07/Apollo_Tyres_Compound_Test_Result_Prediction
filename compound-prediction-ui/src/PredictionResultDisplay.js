// src/components/PredictionResultDisplay.jsx
import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';

const PredictionResultDisplay = ({
  buttonVariants,
  containerVariants,
  itemVariants,
  predictionResults,
  materialCompositions,
  predictCompoundResult,
  toggleGraph,
  showGraph,
  renderGraph,
  saveReport,
  setCurrentPage,
  startNewPrediction
}) => {
  return (
    <motion.div>
      <AnimatePresence>
        {!predictionResults ? (
          <motion.div>
            <motion.button 
              variants={buttonVariants}
              whileHover="hover"
              whileTap="tap"
              onClick={predictCompoundResult}
              className="w-1/2 bg-purple-500 text-white py-3 rounded-lg hover:bg-purple-600 transition-colors"
            >
              Predict Compound Result
            </motion.button>
          </motion.div>
        ) : (
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
              Prediction Results
            </motion.h2>

            {predictionResults && (
              <motion.div variants={itemVariants} className="space-y-8">
                
                {/* Material Composition */}
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.2 }}
                  className="bg-purple-50 p-4 rounded-lg"
                >
                  <h3 className="text-lg font-semibold text-purple-600 mb-3">Material Composition</h3>
                  <div className="grid grid-cols-1 gap-2">
                    {materialCompositions.map((item, idx) => (
                      <div key={idx} className="flex justify-between items-center">
                        <span className="text-gray-700">{item.material}</span>
                        <span className="font-semibold">{item.composition} g</span>
                      </div>
                    ))}
                    <div className="border-t border-purple-200 mt-2 pt-2 flex justify-between items-center">
                      <span className="font-semibold text-purple-700">Total Weight</span>
                      <span className="font-bold text-purple-700">{predictionResults.totalWeight} g</span>
                    </div>
                  </div>
                </motion.div>

                {/* Prediction Confidence */}
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.3 }}
                  className="bg-purple-50 p-4 rounded-lg"
                >
                  <h3 className="text-lg font-semibold text-purple-600 mb-2">Prediction Confidence</h3>
                  <div className="flex items-center">
                    <div className="relative w-full h-4 bg-gray-200 rounded-full overflow-hidden">
                      <motion.div
                        initial={{ width: 0 }}
                        animate={{ width: `${predictionResults.confidenceScore}%` }}
                        transition={{ delay: 0.4, duration: 1 }}
                        className="absolute top-0 left-0 h-full bg-purple-500 rounded-full"
                      />
                    </div>
                    <span className="ml-3 font-semibold text-purple-600">{predictionResults.confidenceScore}%</span>
                  </div>
                </motion.div>

                {/* Predicted Properties */}
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.4 }}
                  className="bg-purple-50 p-4 rounded-lg"
                >
                  <h3 className="text-lg font-semibold text-purple-600 mb-3">Predicted Properties</h3>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="bg-white p-3 rounded-lg shadow-sm"><span className="text-gray-500 text-sm">Tensile Strength</span><div className="font-semibold">{predictionResults.tensileStrength} MPa</div></div>
                    <div className="bg-white p-3 rounded-lg shadow-sm"><span className="text-gray-500 text-sm">Elongation at Break</span><div className="font-semibold">{predictionResults.elongation}%</div></div>
                    <div className="bg-white p-3 rounded-lg shadow-sm"><span className="text-gray-500 text-sm">Hardness</span><div className="font-semibold">{predictionResults.hardness} Shore A</div></div>
                    <div className="bg-white p-3 rounded-lg shadow-sm"><span className="text-gray-500 text-sm">Abrasion Resistance</span><div className="font-semibold">{predictionResults.abrasionResistance} mm³</div></div>
                    <div className="bg-white p-3 rounded-lg shadow-sm"><span className="text-gray-500 text-sm">Tear Strength</span><div className="font-semibold">{predictionResults.tearStrength} kN/m</div></div>
                    <div className="bg-white p-3 rounded-lg shadow-sm"><span className="text-gray-500 text-sm">Density</span><div className="font-semibold">{predictionResults.density} g/cm³</div></div>
                    <div className="bg-white p-3 rounded-lg shadow-sm"><span className="text-gray-500 text-sm">Cure Time</span><div className="font-semibold">{predictionResults.cureTime} min</div></div>
                  </div>
                </motion.div>

                {/* Recommended Uses */}
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.5 }}
                  className="bg-purple-50 p-4 rounded-lg"
                >
                  <h3 className="text-lg font-semibold text-purple-600 mb-3">Recommended Uses</h3>
                  <div className="flex flex-wrap gap-2">
                    {predictionResults.recommendedUses.map((use, idx) => (
                      <span key={idx} className="px-3 py-1 bg-purple-100 text-purple-700 rounded-full">{use}</span>
                    ))}
                  </div>
                </motion.div>

                {/* Chart Toggle Button */}
                <motion.button
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.6 }}
                  onClick={toggleGraph}
                  className="w-full bg-purple-100 text-purple-700 py-2 rounded-lg hover:bg-purple-200 transition-colors"
                >
                  {showGraph ? 'Hide Charts' : 'Show Charts'}
                </motion.button>

                {/* Charts Section */}
                <AnimatePresence>
                  {showGraph && renderGraph()}
                </AnimatePresence>

                {/* Action Buttons */}
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.7 }}
                  className="flex space-x-4 mt-8"
                >
                  <motion.button 
                    variants={buttonVariants}
                    whileHover="hover"
                    whileTap="tap"
                    onClick={saveReport}
                    className="w-1/3 bg-blue-500 text-white py-3 rounded-lg hover:bg-blue-600 transition-colors"
                  >
                    Save Report
                  </motion.button>
                  <motion.button 
                    variants={buttonVariants}
                    whileHover="hover"
                    whileTap="tap"
                    onClick={() => setCurrentPage('material-composition')}
                    className="w-1/3 bg-gray-300 text-gray-700 py-3 rounded-lg hover:bg-gray-400 transition-colors"
                  >
                    Back
                  </motion.button>
                  <motion.button 
                    variants={buttonVariants}
                    whileHover="hover"
                    whileTap="tap"
                    onClick={startNewPrediction}
                    className="w-1/3 bg-purple-500 text-white py-3 rounded-lg hover:bg-purple-600 transition-colors"
                  >
                    New Prediction
                  </motion.button>
                </motion.div>
              </motion.div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
};

export default PredictionResultDisplay;
