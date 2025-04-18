import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import PredictionResultDisplay from './PredictionResultDisplay';
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

const CompoundPredictionApp = () => {
  // Simulated list of 62 raw materials (you would replace this with your actual materials)
  const MATERIALS = [
    'RSS III',
    'TSR10',
    'TSR 20',
    'No. 4 Ribbed smoked Sheet (RSS4-Ind)',
    'Special Grade (Dirt Free) RSS - IV',
    'Crumb Rubber',
    'HT Reclaim',
    'ESBR',
    'pbd-High Cis Br Nd',
    'PBD-High Cis Ni',
    'Bromobutyl Rubber HV',
    'SBR 4601',
    'SSBR 15% styrene, 30% vinyl, low Tg',
    'SBR 1502',
    'CD2109',
    'BC2207',
    'N134 SAF Carbon Black',
    'N220 ISAF Carbon Black',
    'N234',
    'N 330 Carbon Black',
    'N 339 Carbon Black',
    'N660 GPF Carbon Black',
    'HMMM (Hexa Methoxy methyl melamine) 72%',
    'Si363',
    'Active Silica Granular 175 sq.m/g',
    'TESPD-Bis(triethxysilylpropyl) disulfide',
    'Silane X 266S',
    'DC02',
    'Gum Rosin',
    'RAE Process Oil, Free of Labeling',
    'Hydrocarbon Homogenizing Resin',
    'Struktol HT 105',
    'Plasticiser Structol VP 1454 blend of fatty acid amide',
    'Dispersing Aid blend of Zn soaps of unsaturated high mol wt fatty acid & their esters',
    'Aliphatic Resin',
    'Phenol Formaldehyde Resin (25 kg bags)',
    'DCPD',
    'PF Resin TMOD 7.5% HMT',
    'RF Resin',
    'Koresin',
    'Vulcuran',
    'Peptizer',
    'Zinc Oxide - Indirect',
    'Stearic Acid',
    'Cobalt Borate Alkanoate',
    'Cobalt Stearate',
    'Resorcinol 66.7% / St. Acid 33.3% Melt',
    'Ozone Protecting Wax PE',
    'Antioxidant 6PPD',
    'Antioxidant TMQ',
    'Insoluble Sulphur Oil Treated 33%',
    'Insoluble Sulphur Oil Treated 20%',
    'Sulphur Soluble Fg No.1 0.5% Oil Based',
    'Accelerator - DPG',
    'Accelerator - DCBS',
    'Accelerator TBBS',
    'Accelerator CBS',
    'TBSI',
    'Accelerator TBzTD',
    'Accelerator - MBTS',
    'PVI - Retarder'
  ];

  const [isSplashVisible, setIsSplashVisible] = useState(true);
  const [numberOfMaterials, setNumberOfMaterials] = useState(0);
  const [materialSelections, setMaterialSelections] = useState([]);
  const [customMaterialCount, setCustomMaterialCount] = useState('');
  const [currentPage, setCurrentPage] = useState('material-selection');
  const [materialCompositions, setMaterialCompositions] = useState([]);
  const [backgroundOpacity, setBackgroundOpacity] = useState(0.95);
  const [backgroundBlur, setBackgroundBlur] = useState("8px");
  const [backgroundAnimation, setBackgroundAnimation] = useState(false);
  const [predictionResults, setPredictionResults] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [showGraph, setShowGraph] = useState(false);

  // Trigger background animation when splash screen is dismissed
  useEffect(() => {
    if (!isSplashVisible) {
      setBackgroundAnimation(true);
      
      // Animate background properties
      const animationTimeout = setTimeout(() => {
        setBackgroundOpacity(0.8);
        setBackgroundBlur("8px");
      }, 100);
      
      return () => clearTimeout(animationTimeout);
    }
  }, [isSplashVisible]);

  // Splash screen transition
  const startApp = () => {
    setIsSplashVisible(false);
  };

  // Handle number of materials selection
  const handleMaterialNumberSelect = (num) => {
    setNumberOfMaterials(num);
    setMaterialSelections(new Array(num).fill(null));
    setCustomMaterialCount('');
  };

  // Handle custom material count input
  const handleCustomMaterialCountChange = (e) => {
    const value = e.target.value;
    setCustomMaterialCount(value);
    
    // Only update if the value is a positive number
    const count = parseInt(value, 10);
    if (!isNaN(count) && count > 0) {
      setNumberOfMaterials(count);
      setMaterialSelections(new Array(count).fill(null));
    }
  };

  // Update material selection
  const handleMaterialSelectionChange = (index, value) => {
    const newSelections = [...materialSelections];
    newSelections[index] = value;
    setMaterialSelections(newSelections);
  };

  // Get available materials (excluding already selected materials)
  const getAvailableMaterials = (currentIndex) => {
    return MATERIALS.filter(material => 
      !materialSelections.some((selected, index) => 
        selected === material && index !== currentIndex
      )
    );
  };

  // Move to composition page
  const handleProceedToComposition = () => {
    // Validate all materials are selected
    if (materialSelections.some(selection => selection === null)) {
      alert('Please select all materials');
      return;
    }

    // Initialize material compositions with 0 grams
    setMaterialCompositions(
      materialSelections.map(material => ({ 
        material, 
        composition: '' 
      }))
    );
    setCurrentPage('material-composition');
  };

  // Update material composition
  const handleMaterialCompositionChange = (index, value) => {
    const newCompositions = [...materialCompositions];
    newCompositions[index].composition = value;
    setMaterialCompositions(newCompositions);
  };

  // Generate mock prediction results
  const generateMockResults = () => {
    // Calculate total composition
    const totalWeight = materialCompositions.reduce(
      (sum, item) => sum + parseFloat(item.composition || 0), 
      0
    );
    
    // Generate random values for properties
    return {
      tensileStrength: (Math.random() * 20 + 10).toFixed(2),
      elongation: (Math.random() * 500 + 300).toFixed(2),
      hardness: Math.floor(Math.random() * 30 + 50),
      abrasionResistance: (Math.random() * 150 + 50).toFixed(2),
      tearStrength: (Math.random() * 40 + 20).toFixed(2),
      density: (Math.random() * 0.5 + 1.0).toFixed(3),
      cureTime: (Math.random() * 10 + 5).toFixed(1),
      totalWeight: totalWeight.toFixed(2),
      confidenceScore: (Math.random() * 20 + 80).toFixed(1), // 80-100% confidence
      // Add recommended uses since it's referenced in the results display
      recommendedUses: [
        'Automotive Parts',
        'Industrial Seals',
        'Conveyor Belts',
        'Hoses',
        'Gaskets'
      ],
      // Historical data for comparison
      historicalData: [
        {
          name: 'Current',
          tensileStrength: parseFloat((Math.random() * 20 + 10).toFixed(2)),
          elongation: parseFloat((Math.random() * 500 + 300).toFixed(2)),
          hardness: Math.floor(Math.random() * 30 + 50),
          abrasionResistance: parseFloat((Math.random() * 150 + 50).toFixed(2)),
          tearStrength: parseFloat((Math.random() * 40 + 20).toFixed(2))
        },
        {
          name: 'Benchmark 1',
          tensileStrength: parseFloat((Math.random() * 20 + 10).toFixed(2)),
          elongation: parseFloat((Math.random() * 500 + 300).toFixed(2)),
          hardness: Math.floor(Math.random() * 30 + 50),
          abrasionResistance: parseFloat((Math.random() * 150 + 50).toFixed(2)),
          tearStrength: parseFloat((Math.random() * 40 + 20).toFixed(2))
        },
        {
          name: 'Benchmark 2',
          tensileStrength: parseFloat((Math.random() * 20 + 10).toFixed(2)),
          elongation: parseFloat((Math.random() * 500 + 300).toFixed(2)),
          hardness: Math.floor(Math.random() * 30 + 50),
          abrasionResistance: parseFloat((Math.random() * 150 + 50).toFixed(2)),
          tearStrength: parseFloat((Math.random() * 40 + 20).toFixed(2))
        }
      ]
    };
  };

  // Predict compound result
  const predictCompoundResult = () => {
    // Validate all compositions are filled
    if (materialCompositions.some(item => item.composition.trim() === '')) {
      alert('Please enter composition for all materials');
      return;
    }

    // Simulate API call with loading state
    setIsLoading(true);
    
    setTimeout(() => {
      const results = generateMockResults();
      setPredictionResults(results);
      setCurrentPage('prediction-results');
      setIsLoading(false);
    }, 2000);
  };
  
  // Toggle graph display
  const toggleGraph = () => {
    setShowGraph(!showGraph);
  };

   // Transform property data for graph
   const getPropertyGraphData = () => {
    if (!predictionResults) return [];
    
    const properties = [
      { name: 'Tensile Strength (MPa)', value: parseFloat(predictionResults.tensileStrength) },
      { name: 'Elongation (%/10)', value: parseFloat(predictionResults.elongation) / 10 }, // Scaled for better visualization
      { name: 'Hardness', value: predictionResults.hardness },
      { name: 'Abrasion Res. (mm³/10)', value: parseFloat(predictionResults.abrasionResistance) / 10 }, // Scaled
      { name: 'Tear Strength (kN/m)', value: parseFloat(predictionResults.tearStrength) }
    ];
    
    return properties;
  };


  // Save report to JSON
  const saveReport = () => {
    if (!predictionResults) return;
    
    const reportData = {
      date: new Date().toISOString(),
      materials: materialCompositions,
      results: predictionResults
    };
    
    const dataStr = JSON.stringify(reportData, null, 2);
    const dataUri = 'data:application/json;charset=utf-8,'+ encodeURIComponent(dataStr);
    
    const exportFileDefaultName = 'compound-prediction-report.json';
    
    const linkElement = document.createElement('a');
    linkElement.setAttribute('href', dataUri);
    linkElement.setAttribute('download', exportFileDefaultName);
    linkElement.click();
  };

  // Reset and start a new prediction
  const startNewPrediction = () => {
    setNumberOfMaterials(0);
    setMaterialSelections([]);
    setCustomMaterialCount('');
    setMaterialCompositions([]);
    setPredictionResults(null);
    setCurrentPage('material-selection');
  };

  // Animation variants for reuse
  const containerVariants = {
    hidden: { opacity: 0, scale: 0.95 },
    visible: { 
      opacity: 1, 
      scale: 1,
      transition: { 
        duration: 0.5,
        ease: "easeOut",
        when: "beforeChildren",
        staggerChildren: 0.1
      }
    },
    exit: { 
      opacity: 0, 
      y: -30,
      transition: { 
        ease: "easeInOut",
        duration: 0.4 
      }
    }
  };

  const itemVariants = {
    hidden: { opacity: 1, y: 1 },
    visible: { 
      opacity: 1, 
      y: 1,
      transition: { duration: 0.4 }
    }
  };

  const buttonVariants = {
    hidden: { opacity: 0, scale: 0.8 },
    visible: { 
      opacity: 1, 
      scale: 1,
      transition: { 
        type: "spring",
        stiffness: 200,
        damping: 15,
        duration: 0.5
      }
    },
    hover: { 
      scale: 1.05, 
      boxShadow: "0px 5px 15px rgba(0, 0, 0, 0.1)" 
    },
    tap: { scale: 0.95 }
  };

  // Render graph component
  const renderGraph = () => {
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
                data={getPropertyGraphData()}
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

  const renderLoading = () => (
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

  return (
    <motion.div 
      className="min-h-screen bg-cover bg-center bg-no-repeat flex items-center justify-center relative"
      initial={{ backgroundPosition: "center" }}
      animate={{ 
        backgroundPosition: backgroundAnimation ? "center 10%" : "center",
      }}
      transition={{ duration: 2, ease: "easeOut" }}
    >
      {/* Background overlay with animated opacity and blur */}
      <motion.div 
        className="absolute inset-0 bg-cover bg-center bg-no-repeat"
        style={{ 
          backgroundImage: `url("/background.jpg")`,
          filter: `blur(${backgroundBlur})`
        }}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 1.5 }}
      />
      
      {/* Gradient overlay with animated opacity */}
      <motion.div
        className="absolute inset-0 bg-white"
        initial={{ opacity: 0.9 }}
        animate={{ opacity: 0.1 }}
        transition={{ duration: 1.5, ease: "easeInOut" }}
      />

      <AnimatePresence mode="wait">
        {isLoading && renderLoading()}
        
        {isSplashVisible ? (
          <motion.div 
            key="splash"
            variants={containerVariants}
            initial="hidden"
            animate="visible"
            exit="exit"
            className="text-center bg-white/80 backdrop-blur-sm p-10 rounded-xl shadow-2xl flex flex-col items-center z-10 max-w-md"
          >
            <motion.img 
              variants={itemVariants}
              src="/apollo_logo.png"  
              alt="Company Logo" 
              className="mb-6 max-w-xs h-auto rounded-lg shadow-md"
            />
            <motion.h1 
              variants={itemVariants}
              className="text-3xl font-bold mb-8 text-purple-600"
            >
              Compound Test Result Prediction
            </motion.h1>
            <motion.button
              variants={buttonVariants}
              whileHover="hover"
              whileTap="tap"
              onClick={startApp}
              className="bg-purple-500 text-white px-8 py-3 rounded-lg hover:bg-purple-600 transition-all shadow-md"
            >
              Start Prediction
            </motion.button>
          </motion.div>
        ) : currentPage === 'material-selection' ? (
          <motion.div 
            key="material-selection"
            variants={containerVariants}
            initial="hidden"
            animate="visible"
            exit="exit"
            className="bg-white/80 backdrop-blur-sm p-8 rounded-xl shadow-2xl w-[30rem] z-10" 
          >
            <motion.h2 
              variants={itemVariants}
              className="text-2xl font-semibold mb-6 text-purple-600"
            >
              Select Number of Raw Materials
            </motion.h2>
            <motion.div 
              variants={itemVariants}
              className="grid grid-cols-3 gap-4 mb-6"
            >
              {[3, 4, 5].map((num, idx) => (
                <motion.button
                  key={num}
                  variants={buttonVariants}
                  initial="hidden"
                  animate="visible"
                  whileHover="hover"
                  whileTap="tap"
                  transition={{ delay: idx * 0.1 }}
                  onClick={() => handleMaterialNumberSelect(num)}
                  className={`py-2 px-4 rounded-lg transition-all ${
                    numberOfMaterials === num 
                    ? 'bg-purple-500 text-white' 
                    : 'bg-purple-100 text-purple-600 hover:bg-purple-200'
                  }`}
                >
                  {num} Materials
                </motion.button>
              ))}
            </motion.div>

            <motion.div 
              variants={itemVariants}
              className="mb-6"
            >
              <motion.input 
                variants={itemVariants}
                type="number" 
                placeholder="Or enter custom number of materials" 
                value={customMaterialCount}
                onChange={handleCustomMaterialCountChange}
                min="1"
                max="62"
                className="w-full p-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
              />
            </motion.div>

            {numberOfMaterials > 0 && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.2 }}
              >
                <motion.div 
                  variants={itemVariants}
                  className="grid grid-cols-1 gap-4"
                >
                  {materialSelections.map((selection, index) => (
                    <motion.select
                      key={index}
                      variants={itemVariants}
                      custom={index}
                      initial="hidden"
                      animate="visible"
                      transition={{ 
                        delay: 0.3 + (index * 0.1),
                        duration: 0.4
                      }}
                      value={selection || ''}
                      onChange={(e) => handleMaterialSelectionChange(index, e.target.value)}
                      className="w-full p-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                    >
                      <option value="">Select Material {index + 1}</option>
                      {getAvailableMaterials(index).map((material) => (
                        <option key={material} value={material}>
                          {material}
                        </option>
                      ))}
                    </motion.select>
                  ))}
                </motion.div>
                <motion.button 
                  variants={buttonVariants}
                  initial="hidden"
                  animate="visible"
                  whileHover="hover"
                  whileTap="tap"
                  transition={{ delay: 0.3 + (materialSelections.length * 0.1) }}
                  onClick={handleProceedToComposition}
                  className="mt-6 w-full bg-purple-500 text-white py-3 rounded-lg hover:bg-purple-600 transition-colors"
                >
                  Proceed to Composition
                </motion.button>
              </motion.div>
            )}
          </motion.div>
        ) : currentPage === 'material-composition' ? (
          <motion.div 
            key="material-composition"
            variants={containerVariants}
            initial="hidden"
            animate="visible"
            exit="exit"
            className="bg-white/90 backdrop-blur-md p-8 rounded-xl shadow-2xl w-[30rem] z-10"
          >
            <motion.h2 
              variants={itemVariants}
              className="text-2xl font-semibold mb-6 text-purple-600"
            >
              Enter Material Compositions
            </motion.h2>
            <motion.div 
              variants={itemVariants}
              className="grid grid-cols-1 gap-4"
            >
              {materialCompositions.map((item, index) => (
                <motion.div 
                  key={index}
                  variants={itemVariants}
                  custom={index}
                  initial="hidden"
                  animate="visible"
                  transition={{ 
                    delay: 0.2 + (index * 0.1),
                    duration: 0.4
                  }}
                  className="flex items-center space-x-4"
                >
                  <span className="w-1/2 truncate">{item.material}</span>
                  <motion.input 
                    type="number" 
                    placeholder="Grams" 
                    value={item.composition}
                    onChange={(e) => handleMaterialCompositionChange(index, e.target.value)}
                    min="0"
                    className="w-1/2 p-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                    initial={{ x: 20, opacity: 0 }}
                    animate={{ x: 0, opacity: 1 }}
                    transition={{ delay: 0.3 + (index * 0.1) }}
                  />
                </motion.div>
              ))}
            </motion.div>
            <motion.div
              variants={itemVariants}
              className="flex space-x-4 mt-6"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 + (materialCompositions.length * 0.1) }}
            >
              <motion.button 
                variants={buttonVariants}
                whileHover="hover"
                whileTap="tap"
                onClick={() => setCurrentPage('material-selection')}
                className="w-1/2 bg-gray-300 text-gray-700 py-3 rounded-lg hover:bg-gray-400 transition-colors"
              >
                Back
              </motion.button>
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
          </motion.div>
        ) : (
          <AnimatePresence>
            {predictionResults && (
              <PredictionResultDisplay
                buttonVariants={buttonVariants}
                containerVariants={containerVariants}
                itemVariants={itemVariants}
                predictionResults={predictionResults}
                materialCompositions={materialCompositions}
                predictCompoundResult={predictCompoundResult}
                toggleGraph={toggleGraph}
                showGraph={showGraph}
                renderGraph={renderGraph}
                saveReport={saveReport}
                setCurrentPage={setCurrentPage}
                startNewPrediction={startNewPrediction}
              />
            )}
          </AnimatePresence>
        )}
      </AnimatePresence>
    </motion.div>
  );
};

export default CompoundPredictionApp;