import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import {
  containerVariants,
  itemVariants,
  buttonVariants,
} from "./animationConfig";
import { fetchRecipes } from "./api/apiClient";

const RecipeSelectionScreen = ({ onSelectRecipe, onBack }) => {
  const [recipes, setRecipes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedRecipe, setSelectedRecipe] = useState("");

  useEffect(() => {
    const loadRecipes = async () => {
      try {
        setLoading(true);
        const recipeList = await fetchRecipes();
        setRecipes(recipeList);
        setLoading(false);
      } catch (err) {
        setError("Failed to load recipes");
        setLoading(false);
      }
    };

    loadRecipes();
  }, []);

  const handleProceed = () => {
    if (!selectedRecipe) {
      alert("Please select a recipe");
      return;
    }
    onSelectRecipe(selectedRecipe);
  };

  return (
    <motion.div
      key="recipe-selection"
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
        Select Existing Recipe
      </motion.h2>

      {loading && (
        <motion.div
          variants={itemVariants}
          className="flex justify-center items-center py-8"
        >
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-500"></div>
        </motion.div>
      )}

      {error && (
        <motion.div
          variants={itemVariants}
          className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative mb-4"
        >
          {error}
        </motion.div>
      )}

      {!loading && !error && (
        <motion.div variants={itemVariants}>
          <motion.div className="mb-6">
            <label className="block text-gray-700 text-sm font-bold mb-2">
              Select Recipe
            </label>
            <select
              value={selectedRecipe}
              onChange={(e) => setSelectedRecipe(e.target.value)}
              className="w-full p-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
            >
              <option value="">-- Select a Recipe --</option>
              {recipes.map((recipe) => (
                <option key={recipe} value={recipe}>
                  {recipe}
                </option>
              ))}
            </select>
          </motion.div>
        </motion.div>
      )}

      <motion.div variants={itemVariants} className="flex space-x-4 mt-6">
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
          onClick={handleProceed}
          disabled={loading || !selectedRecipe}
          className={`w-1/2 py-3 rounded-lg transition-colors ${
            loading || !selectedRecipe
              ? "bg-purple-300 text-white cursor-not-allowed"
              : "bg-purple-500 text-white hover:bg-purple-600"
          }`}
        >
          Proceed
        </motion.button>
      </motion.div>
    </motion.div>
  );
};

export default RecipeSelectionScreen;
