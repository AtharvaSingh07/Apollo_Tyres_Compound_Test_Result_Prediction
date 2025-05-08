import React, { useState, useEffect } from "react";
import { AnimatePresence } from "framer-motion";
import InitialSelectionScreen from "./InitialSelectionScreen";
import MaterialSelectionScreen from "./MaterialSelectionScreen";
import RecipeSelectionScreen from "./RecipeSelectionScreen";
import CompositionScreen from "./CompositionScreen";
import PredictionResultDisplay from "./PredictionResultDisplay";
import { getPrediction, fetchRecipeComposition } from "./api/apiClient";
import "./App.css";

// Animation configs
const containerVariants = {
  hidden: { opacity: 0, y: 50 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.3 } },
  exit: { opacity: 0, y: -50, transition: { duration: 0.3 } },
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.3 } },
};

const buttonVariants = {
  hover: { scale: 1.05, transition: { duration: 0.2 } },
  tap: { scale: 0.95, transition: { duration: 0.1 } },
};

function App() {
  // App state
  const [currentPage, setCurrentPage] = useState("initial-selection");
  const [numberOfMaterials, setNumberOfMaterials] = useState(0);
  const [materialSelections, setMaterialSelections] = useState([]);
  const [customMaterialCount, setCustomMaterialCount] = useState("");
  const [materialCompositions, setMaterialCompositions] = useState([]);
  const [predictionResults, setPredictionResults] = useState(null);
  const [showGraph, setShowGraph] = useState(false);
  const [isModifyingRecipe, setIsModifyingRecipe] = useState(false);
  const [selectedRecipe, setSelectedRecipe] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  // Handler for initial selection screen
  const handleInitialSelection = (option) => {
    if (option === "new-composition") {
      setIsModifyingRecipe(false);
      setCurrentPage("material-selection");
    } else if (option === "existing-recipe") {
      setIsModifyingRecipe(true);
      setCurrentPage("recipe-selection");
    }
  };

  // Handler for recipe selection
  const handleRecipeSelection = async (recipeName) => {
    setSelectedRecipe(recipeName);
    setIsLoading(true);

    try {
      const composition = await fetchRecipeComposition(recipeName);
      setMaterialCompositions(composition);
      setCurrentPage("material-composition");
    } catch (err) {
      setError("Failed to load recipe composition");
    } finally {
      setIsLoading(false);
    }
  };

  // Handler for material selection screen
  const handleMaterialSelectionComplete = () => {
    // Convert material selections to the format needed for composition screen
    const compositions = materialSelections.map((material) => ({
      material,
      composition: 0,
    }));

    setMaterialCompositions(compositions);
    setCurrentPage("material-composition");
  };

  // Handler for composition changes
  const handleMaterialCompositionChange = (index, value) => {
    const newCompositions = [...materialCompositions];
    newCompositions[index].composition = value === "" ? "" : parseFloat(value);
    setMaterialCompositions(newCompositions);
  };

  // Handler for prediction
  const handlePredict = async () => {
    setIsLoading(true);

    // Validate all compositions have values
    const invalidCompositions = materialCompositions.some(
      (item) => item.composition === "" || item.composition === null
    );

    if (invalidCompositions) {
      alert("Please enter all material compositions");
      setIsLoading(false);
      return;
    }

    try {
      const results = await getPrediction(materialCompositions);
      setPredictionResults(results);
      setCurrentPage("prediction-results");
    } catch (err) {
      setError("Failed to get predictions");
    } finally {
      setIsLoading(false);
    }
  };

  // Handler for starting a new prediction
  const handleStartNewPrediction = () => {
    setCurrentPage("initial-selection");
    setNumberOfMaterials(0);
    setMaterialSelections([]);
    setCustomMaterialCount("");
    setMaterialCompositions([]);
    setPredictionResults(null);
    setShowGraph(false);
    setIsModifyingRecipe(false);
    setSelectedRecipe("");
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-900 via-purple-700 to-indigo-800 flex justify-center items-center p-4">
      <div className="absolute inset-0 bg-pattern opacity-10"></div>

      {isLoading && (
        <div className="absolute inset-0 bg-black/50 flex justify-center items-center z-50">
          <div className="bg-white p-6 rounded-xl shadow-xl flex flex-col items-center">
            <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-purple-500 mb-4"></div>
            <p className="text-purple-600 font-medium">Processing...</p>
          </div>
        </div>
      )}

      {error && (
        <div className="absolute top-4 left-1/2 transform -translate-x-1/2 bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded z-50">
          {error}
          <button
            className="ml-4 text-red-700 font-bold"
            onClick={() => setError(null)}
          >
            ×
          </button>
        </div>
      )}

      <AnimatePresence mode="wait">
        {currentPage === "initial-selection" && (
          <InitialSelectionScreen onSelectOption={handleInitialSelection} />
        )}

        {currentPage === "recipe-selection" && (
          <RecipeSelectionScreen
            onSelectRecipe={handleRecipeSelection}
            onBack={() => setCurrentPage("initial-selection")}
          />
        )}

        {currentPage === "material-selection" && (
          <MaterialSelectionScreen
            numberOfMaterials={numberOfMaterials}
            setNumberOfMaterials={setNumberOfMaterials}
            materialSelections={materialSelections}
            setMaterialSelections={setMaterialSelections}
            customMaterialCount={customMaterialCount}
            setCustomMaterialCount={setCustomMaterialCount}
            onProceed={handleMaterialSelectionComplete}
            onBack={() => setCurrentPage("initial-selection")}
          />
        )}

        {currentPage === "material-composition" && (
          <CompositionScreen
            materialCompositions={materialCompositions}
            handleMaterialCompositionChange={handleMaterialCompositionChange}
            onBack={() =>
              setCurrentPage(
                isModifyingRecipe ? "recipe-selection" : "material-selection"
              )
            }
            onPredict={handlePredict}
            isModifyingRecipe={isModifyingRecipe}
            currentRecipeName={selectedRecipe}
          />
        )}

        {currentPage === "prediction-results" && predictionResults && (
          <PredictionResultDisplay
            buttonVariants={buttonVariants}
            containerVariants={containerVariants}
            itemVariants={itemVariants}
            predictionResults={predictionResults}
            materialCompositions={materialCompositions}
            toggleGraph={() => setShowGraph(!showGraph)}
            showGraph={showGraph}
            startNewPrediction={handleStartNewPrediction}
            setCurrentPage={setCurrentPage}
          />
        )}
      </AnimatePresence>

      <div className="absolute bottom-4 text-white/70 text-sm">
        Compound Prediction Tool © 2025
      </div>
    </div>
  );
}

export default App;
