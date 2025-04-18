import React, { useState, useEffect } from 'react';
import { AnimatePresence } from 'framer-motion';
import SplashScreen from './SplashScreen';
import MaterialSelectionScreen from './MaterialSelectionScreen';
import CompositionScreen from './CompositionScreen';
import LoadingScreen from './LoadingScreen';
import PredictionResultDisplay from './PredictionResultDisplay';
import { PAGES, MATERIALS } from './constants';
import { generateMockResults } from './utils';
import { containerVariants, itemVariants, buttonVariants } from './animationConfig';

function App() {
  // Current page state
  const [currentPage, setCurrentPage] = useState(PAGES.SPLASH);
  
  // Material selection states
  const [numberOfMaterials, setNumberOfMaterials] = useState(0);
  const [materialSelections, setMaterialSelections] = useState([]);
  const [customMaterialCount, setCustomMaterialCount] = useState('');
  
  // Material composition states
  const [materialCompositions, setMaterialCompositions] = useState([]);
  
  // Loading state
  const [isLoading, setIsLoading] = useState(false);
  
  // Prediction results
  const [predictionResults, setPredictionResults] = useState(null);
  
  // Graph visibility state
  const [showGraph, setShowGraph] = useState(false);
  
  // Update material compositions when materials are selected
  useEffect(() => {
    if (materialSelections.filter(Boolean).length > 0) {
      const newCompositions = materialSelections
        .filter(Boolean)
        .map(material => ({
          material,
          composition: ''
        }));

      setMaterialCompositions(newCompositions);
    }
  }, [materialSelections]);
  
  // Handler for composition changes
  const handleMaterialCompositionChange = (index, value) => {
    const newCompositions = [...materialCompositions];
    newCompositions[index].composition = value;
    setMaterialCompositions(newCompositions);
  };
  
  // Navigation handlers
  const handleStart = () => {
    setCurrentPage(PAGES.MATERIAL_SELECTION);
  };
  
  const handleProceedToComposition = () => {
    setCurrentPage(PAGES.MATERIAL_COMPOSITION);
  };
  
  const handleBack = () => {
    if (currentPage === PAGES.MATERIAL_COMPOSITION) {
      setCurrentPage(PAGES.MATERIAL_SELECTION);
    }
  };
  
  // Predict results
  const handlePredict = () => {
    // Validate that all compositions have values
    const isValid = materialCompositions.every(item => 
      item.composition !== '' && !isNaN(parseFloat(item.composition)) && parseFloat(item.composition) > 0
    );
    
    if (!isValid) {
      alert('Please enter valid composition values for all materials');
      return;
    }
    
    // Show loading screen
    setIsLoading(true);
    
    // Simulate API call delay
    setTimeout(() => {
      // Generate mock results
      const results = generateMockResults(materialCompositions);
      setPredictionResults(results);
      
      // Hide loading screen and navigate to results page
      setIsLoading(false);
      setCurrentPage(PAGES.PREDICTION_RESULTS);
    }, 2000);
  };
  
  // Toggle graph visibility
  const toggleGraph = () => {
    setShowGraph(!showGraph);
  };
  
  // Start a new prediction
  const startNewPrediction = () => {
    setNumberOfMaterials(0);
    setMaterialSelections([]);
    setCustomMaterialCount('');
    setMaterialCompositions([]);
    setPredictionResults(null);
    setShowGraph(false);
    setCurrentPage(PAGES.MATERIAL_SELECTION);
  };
  
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-purple-900 via-indigo-800 to-blue-700 p-4">
      <div className="absolute inset-0 bg-repeat opacity-20" style={{ backgroundImage: 'url("/pattern.png")' }}></div>
      
      <AnimatePresence mode="wait">
        {currentPage === PAGES.SPLASH && (
          <SplashScreen key="splash" onStart={handleStart} />
        )}
        
        {currentPage === PAGES.MATERIAL_SELECTION && (
          <MaterialSelectionScreen 
            key="material-selection"
            numberOfMaterials={numberOfMaterials}
            setNumberOfMaterials={setNumberOfMaterials}
            materialSelections={materialSelections}
            setMaterialSelections={setMaterialSelections}
            customMaterialCount={customMaterialCount}
            setCustomMaterialCount={setCustomMaterialCount}
            onProceed={handleProceedToComposition}
          />
        )}
        
        {currentPage === PAGES.MATERIAL_COMPOSITION && (
          <CompositionScreen 
            key="composition" 
            materialCompositions={materialCompositions}
            handleMaterialCompositionChange={handleMaterialCompositionChange}
            onBack={handleBack}
            onPredict={handlePredict}
          />
        )}
        
        {currentPage === PAGES.PREDICTION_RESULTS && (
          <PredictionResultDisplay 
            key="results"
            buttonVariants={buttonVariants}
            containerVariants={containerVariants}
            itemVariants={itemVariants}
            predictionResults={predictionResults}
            materialCompositions={materialCompositions}
            toggleGraph={toggleGraph}
            showGraph={showGraph}
            startNewPrediction={startNewPrediction}
            setCurrentPage={setCurrentPage}
          />
        )}
      </AnimatePresence>
      
      {isLoading && <LoadingScreen />}
    </div>
  );
}

export default App;