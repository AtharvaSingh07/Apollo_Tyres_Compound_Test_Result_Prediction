// SplashScreen.js
import React from "react";
import { motion } from "framer-motion";
import {
  containerVariants,
  itemVariants,
  buttonVariants,
} from "./animationConfig";

const SplashScreen = ({ onStart }) => {
  return (
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
        onClick={onStart}
        className="bg-purple-500 text-white px-8 py-3 rounded-lg hover:bg-purple-600 transition-all shadow-md"
      >
        Start Prediction
      </motion.button>
    </motion.div>
  );
};

export default SplashScreen;
