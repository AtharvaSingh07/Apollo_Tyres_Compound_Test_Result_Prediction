import React from "react";
import { motion } from "framer-motion";
import {
  containerVariants,
  itemVariants,
  buttonVariants,
} from "./animationConfig";

const CompositionScreen = ({
  materialCompositions,
  handleMaterialCompositionChange,
  onBack,
  onPredict,
  isModifyingRecipe = false,
  currentRecipeName = "",
}) => {
  // Calculate total composition
  const totalComposition = materialCompositions.reduce(
    (sum, item) => sum + (parseFloat(item.composition) || 0),
    0
  );

  return (
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
        className="text-2xl font-semibold mb-2 text-purple-600"
      >
        {isModifyingRecipe
          ? `Modify Recipe: ${currentRecipeName}`
          : "Enter Material Compositions"}
      </motion.h2>

      <motion.div
        variants={itemVariants}
        className="mb-6 flex justify-between items-center"
      >
        <span className="text-gray-600">
          Total: {totalComposition.toFixed(2)} grams
        </span>
      </motion.div>

      <motion.div
        variants={itemVariants}
        className="max-h-80 overflow-y-auto mb-4"
      >
        <div className="grid grid-cols-1 gap-4">
          {materialCompositions.map((item, index) => (
            <motion.div
              key={index}
              variants={itemVariants}
              custom={index}
              initial="hidden"
              animate="visible"
              transition={{
                delay: 0.2 + index * 0.1,
                duration: 0.4,
              }}
              className="flex items-center space-x-4"
            >
              <span className="w-1/2 truncate">{item.material}</span>
              <motion.input
                type="number"
                placeholder="Grams"
                value={item.composition}
                onChange={(e) =>
                  handleMaterialCompositionChange(index, e.target.value)
                }
                min="0"
                step="0.1"
                className="w-1/2 p-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                initial={{ x: 20, opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                transition={{ delay: 0.3 + index * 0.1 }}
              />
            </motion.div>
          ))}
        </div>
      </motion.div>

      <motion.div
        variants={itemVariants}
        className="flex space-x-4 mt-6"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 + materialCompositions.length * 0.1 }}
      >
        <motion.button
          variants={buttonVariants}
          whileHover="hover"
          whileTap="tap"
          onClick={onBack}
          className="w-1/2 bg-gray-300 text-gray-700 py-3 rounded-lg hover:bg-gray-400 transition-colors"
        >
          Back
        </motion.button>
        <motion.button
          variants={buttonVariants}
          whileHover="hover"
          whileTap="tap"
          onClick={onPredict}
          className="w-1/2 bg-purple-500 text-white py-3 rounded-lg hover:bg-purple-600 transition-colors"
        >
          Predict Compound Result
        </motion.button>
      </motion.div>
    </motion.div>
  );
};

export default CompositionScreen;
