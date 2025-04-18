import React from 'react';
import { motion } from 'framer-motion';
import { MATERIALS, DEFAULT_MATERIAL_COUNTS } from './constants';
import { containerVariants, itemVariants, buttonVariants } from './animationConfig';

const MaterialSelectionScreen = ({ 
  numberOfMaterials, 
  setNumberOfMaterials, 
  materialSelections, 
  setMaterialSelections, 
  customMaterialCount, 
  setCustomMaterialCount, 
  onProceed 
}) => {
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

  // Handle form submission
  const handleProceedToComposition = () => {
    // Validate all materials are selected
    if (materialSelections.some(selection => selection === null)) {
      alert('Please select all materials');
      return;
    }
    onProceed();
  };

  return (
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
        {DEFAULT_MATERIAL_COUNTS.map((num, idx) => (
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
  );
};

export default MaterialSelectionScreen;