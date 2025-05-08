import React, { useState } from "react";
import { motion } from "framer-motion";
import ResultGraphs from "./ResultGraphs";
import { saveReport } from "./utils";

const PredictionResultDisplay = ({
  buttonVariants,
  containerVariants,
  itemVariants,
  predictionResults,
  materialCompositions,
  toggleGraph,
  showGraph,
  startNewPrediction,
  setCurrentPage,
}) => {
  const [activeTab, setActiveTab] = useState("summary");

  // Handler for saving the report
  const handleSaveReport = () => {
    saveReport(predictionResults, materialCompositions);
  };

  // Get main test values for the summary cards
  const tensileStrength = predictionResults.tensileStrength || "N/A";
  const elongation = predictionResults.elongation || "N/A";
  const hardness = predictionResults.hardness || "N/A";
  const abrasionResistance = predictionResults.abrasionResistance || "N/A";
  const tearStrength = predictionResults.tearStrength || "N/A";
  const density = predictionResults.density || "N/A";
  const modulus50 = predictionResults.modulus50 || "N/A";

  // Get modulus values
  const modulus100 = predictionResults.modulus100 || {};
  const modulus200 = predictionResults.modulus200 || {};
  const modulus300 = predictionResults.modulus300 || {};

  // Function to render a property card
  const renderPropertyCard = (title, value, unit = "") => (
    <div className="bg-purple-50 p-4 rounded-lg">
      <h3 className="text-lg font-medium mb-2 text-purple-600">{title}</h3>
      <p className="text-2xl font-bold">
        {value} {unit}
      </p>
    </div>
  );

  // Function to render detailed test results table
  const renderDetailedResults = () => {
    if (
      !predictionResults.testResults ||
      Object.keys(predictionResults.testResults).length === 0
    ) {
      return <p>No detailed test results available</p>;
    }

    return (
      <div className="overflow-x-auto">
        <table className="min-w-full">
          <thead>
            <tr>
              <th className="px-4 py-2 text-left">Test Parameter</th>
              <th className="px-4 py-2 text-right">Value</th>
            </tr>
          </thead>
          <tbody>
            {Object.entries(predictionResults.testResults).map(
              ([param, value], index) => (
                <tr
                  key={index}
                  className={index % 2 === 0 ? "bg-purple-50" : ""}
                >
                  <td className="px-4 py-2">{param}</td>
                  <td className="px-4 py-2 text-right">{value}</td>
                </tr>
              )
            )}
          </tbody>
        </table>
      </div>
    );
  };

  // Render material impacts
  const renderMaterialImpacts = () => {
    if (
      !predictionResults.materialImpacts ||
      Object.keys(predictionResults.materialImpacts).length === 0
    ) {
      return <p>No material impact data available</p>;
    }

    return (
      <div className="overflow-x-auto">
        <table className="min-w-full">
          <thead>
            <tr>
              <th className="px-4 py-2 text-left">Material</th>
              <th className="px-4 py-2 text-right">Impact (%)</th>
            </tr>
          </thead>
          <tbody>
            {Object.entries(predictionResults.materialImpacts)
              .sort((a, b) => b[1] - a[1])
              .map(([material, impact], index) => (
                <tr
                  key={index}
                  className={index % 2 === 0 ? "bg-purple-50" : ""}
                >
                  <td className="px-4 py-2">{material}</td>
                  <td className="px-4 py-2 text-right">{impact}</td>
                </tr>
              ))}
          </tbody>
        </table>
      </div>
    );
  };

  return (
    <motion.div
      key="prediction-results"
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      exit="exit"
      className="bg-white/90 backdrop-blur-md p-8 rounded-xl shadow-2xl w-full max-w-5xl z-10"
    >
      <motion.h2
        variants={itemVariants}
        className="text-2xl font-semibold mb-6 text-purple-600"
      >
        Predicted Compound Results
      </motion.h2>

      <motion.div variants={itemVariants} className="mb-6">
        <div className="flex mb-4 border-b">
          <button
            className={`px-4 py-2 ${
              activeTab === "summary"
                ? "border-b-2 border-purple-600 text-purple-600"
                : ""
            }`}
            onClick={() => setActiveTab("summary")}
          >
            Summary
          </button>

          <button
            className={`px-4 py-2 ${
              activeTab === "detailed"
                ? "border-b-2 border-purple-600 text-purple-600"
                : ""
            }`}
            onClick={() => setActiveTab("detailed")}
          >
            All Test Results
          </button>
          <button
            className={`px-4 py-2 ${
              activeTab === "impacts"
                ? "border-b-2 border-purple-600 text-purple-600"
                : ""
            }`}
            onClick={() => setActiveTab("impacts")}
          >
            Material Impacts
          </button>
        </div>

        {activeTab === "summary" && (
          <>
            <div className="grid grid-cols-2 gap-4 mb-6 md:grid-cols-3">
              {renderPropertyCard("Tensile Strength", tensileStrength, "MPa")}
              {renderPropertyCard("Elongation", elongation, "%")}
              {renderPropertyCard("Hardness", hardness, "Shore A")}
              {renderPropertyCard(
                "Abrasion Resistance",
                abrasionResistance,
                "mm³"
              )}
              {renderPropertyCard("Tear Strength", tearStrength, "kN/m")}
            </div>

            <div className="bg-green-50 p-4 rounded-lg mb-6">
              <h3 className="text-lg font-medium mb-2 text-green-600">
                Confidence Score
              </h3>
              <div className="flex items-center">
                <div className="flex-1 bg-gray-200 rounded-full h-4 mr-2">
                  <div
                    className="bg-green-500 h-4 rounded-full"
                    style={{ width: `${predictionResults.confidenceScore}%` }}
                  ></div>
                </div>
                <span className="font-bold">
                  {predictionResults.confidenceScore}%
                </span>
              </div>
            </div>

            <div className="bg-blue-50 p-4 rounded-lg mb-6">
              <h3 className="text-lg font-medium mb-2 text-blue-600">
                Recommended Uses
              </h3>
              <ul className="list-disc pl-5">
                {predictionResults.recommendedUses &&
                Array.isArray(predictionResults.recommendedUses) ? (
                  predictionResults.recommendedUses.map((use, index) => (
                    <li key={index}>{use}</li>
                  ))
                ) : (
                  <li>No recommendations available</li>
                )}
              </ul>
            </div>
          </>
        )}

        {activeTab === "detailed" && renderDetailedResults()}

        {activeTab === "impacts" && renderMaterialImpacts()}
      </motion.div>

      <motion.div variants={itemVariants} className="mb-6">
        <motion.button
          variants={buttonVariants}
          whileHover="hover"
          whileTap="tap"
          onClick={toggleGraph}
          className="bg-purple-500 text-white py-2 px-4 rounded-lg hover:bg-purple-600 transition-colors"
        >
          {showGraph ? "Hide Graphs" : "Show Graphs"}
        </motion.button>
      </motion.div>

      {showGraph && <ResultGraphs predictionResults={predictionResults} />}

      <motion.div variants={itemVariants} className="flex space-x-4 mt-6">
        <motion.button
          variants={buttonVariants}
          whileHover="hover"
          whileTap="tap"
          onClick={() => setCurrentPage("material-composition")}
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
