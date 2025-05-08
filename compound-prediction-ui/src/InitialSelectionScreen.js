import React from "react";
import { motion } from "framer-motion";
import {
  containerVariants,
  itemVariants,
  buttonVariants,
} from "./animationConfig";

const InitialSelectionScreen = ({ onSelectOption }) => {
  return (
    <motion.div
      key="initial-selection"
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      exit="exit"
      className="bg-white/90 backdrop-blur-md p-8 rounded-xl shadow-2xl w-[30rem] z-10"
    >
      <motion.h2
        variants={itemVariants}
        className="text-2xl font-semibold mb-6 text-purple-600 text-center"
      >
        Compound Prediction Tool
      </motion.h2>

      <motion.p
        variants={itemVariants}
        className="text-gray-600 mb-8 text-center"
      >
        Choose an option to begin:
      </motion.p>

      <motion.div variants={itemVariants} className="space-y-4">
        <motion.button
          variants={buttonVariants}
          whileHover="hover"
          whileTap="tap"
          onClick={() => onSelectOption("new-composition")}
          className="w-full bg-purple-500 text-white py-4 rounded-lg hover:bg-purple-600 transition-colors flex items-center justify-center space-x-2"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-5 w-5"
            viewBox="0 0 20 20"
            fill="currentColor"
          >
            <path
              fillRule="evenodd"
              d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z"
              clipRule="evenodd"
            />
          </svg>
          <span>Create New Composition</span>
        </motion.button>

        <motion.button
          variants={buttonVariants}
          whileHover="hover"
          whileTap="tap"
          onClick={() => onSelectOption("existing-recipe")}
          className="w-full bg-blue-500 text-white py-4 rounded-lg hover:bg-blue-600 transition-colors flex items-center justify-center space-x-2"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-5 w-5"
            viewBox="0 0 20 20"
            fill="currentColor"
          >
            <path d="M9 2a1 1 0 000 2h2a1 1 0 100-2H9z" />
            <path
              fillRule="evenodd"
              d="M4 5a2 2 0 012-2 3 3 0 003 3h2a3 3 0 003-3 2 2 0 012 2v11a2 2 0 01-2 2H6a2 2 0 01-2-2V5zm3 4a1 1 0 000 2h.01a1 1 0 100-2H7zm3 0a1 1 0 000 2h3a1 1 0 100-2h-3zm-3 4a1 1 0 100 2h.01a1 1 0 100-2H7zm3 0a1 1 0 100 2h3a1 1 0 100-2h-3z"
              clipRule="evenodd"
            />
          </svg>
          <span>Modify Existing Recipe</span>
        </motion.button>
      </motion.div>
    </motion.div>
  );
};

export default InitialSelectionScreen;
