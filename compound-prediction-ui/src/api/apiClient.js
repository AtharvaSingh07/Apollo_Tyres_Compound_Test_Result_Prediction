// src/api/apiClient.js
const API_BASE_URL =
  process.env.REACT_APP_API_BASE_URL || "https://apollo-8pu2.onrender.com";

/**
 * Fetch all available raw materials
 * @returns {Promise<Array>} Array of material names
 */
export const fetchMaterials = async () => {
  try {
    const response = await fetch(`${API_BASE_URL}/materials`);
    if (!response.ok) {
      throw new Error(`API error: ${response.status}`);
    }
    const data = await response.json();
    return data.materials;
  } catch (error) {
    console.error("Error fetching materials:", error);
    throw error;
  }
};

/**
 * Fetch all available recipes
 * @returns {Promise<Array>} Array of recipe names
 */
export const fetchRecipes = async () => {
  try {
    const response = await fetch(`${API_BASE_URL}/recipes`);
    if (!response.ok) {
      throw new Error(`API error: ${response.status}`);
    }
    const data = await response.json();
    return data.recipes;
  } catch (error) {
    console.error("Error fetching recipes:", error);
    throw error;
  }
};

/**
 * Fetch the composition of a specific recipe
 * @param {string} recipeName - The name of the recipe
 * @returns {Promise<Array>} Array of material compositions
 */
export const fetchRecipeComposition = async (recipeName) => {
  try {
    const response = await fetch(`${API_BASE_URL}/get-recipe-composition`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ recipeName }),
    });

    if (!response.ok) {
      throw new Error(`API error: ${response.status}`);
    }

    const data = await response.json();
    return data.materialCompositions;
  } catch (error) {
    console.error("Error fetching recipe composition:", error);
    throw error;
  }
};

/**
 * Get predictions for a compound formulation
 * @param {Array} materialCompositions - Array of material compositions
 * @returns {Promise<Object>} Prediction results
 */
export const getPrediction = async (materialCompositions) => {
  try {
    // Make sure materialCompositions is in the expected format
    // Each item should have 'material' and 'composition' fields
    const formattedCompositions = materialCompositions.map((item) => ({
      material: item.material,
      composition: parseFloat(item.composition), // Ensure composition is a number
    }));

    // Log the exact request body for debugging
    const requestBody = { materialCompositions: formattedCompositions };
    console.log("Request payload:", JSON.stringify(requestBody, null, 2));

    const response = await fetch(`${API_BASE_URL}/predict`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(requestBody),
    });

    // Try to get the detailed error from server
    if (!response.ok) {
      try {
        const errorData = await response.json();
        console.error("Server error details:", errorData);
        throw new Error(
          `API error: ${response.status} - ${JSON.stringify(errorData)}`
        );
      } catch (parseError) {
        // If we can't parse the error as JSON, just throw the status
        const errorText = await response.text();
        console.error("Server error text:", errorText);
        throw new Error(
          `API error: ${response.status} - ${errorText.substring(0, 200)}`
        );
      }
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error("Error getting prediction:", error);
    throw error;
  }
};

/**
 * Format the API response for display
 * @param {Object} predictionData - The prediction data from the API
 * @returns {Object} Formatted prediction data
 */
export const formatPredictionData = (predictionData) => {
  if (!predictionData) return {};

  // Extract and format test results
  const testResults = Object.entries(predictionData.testResults || {}).map(
    ([key, value]) => ({
      name: key,
      value:
        value !== null && value !== "NA"
          ? typeof value === "number"
            ? value.toFixed(4)
            : value
          : "N/A",
    })
  );

  // Extract confidence score
  const confidenceScore =
    predictionData.confidenceScore !== undefined
      ? predictionData.confidenceScore.toFixed(1)
      : "85.0"; // Default confidence score if not provided

  // Extract recommended uses
  const recommendedUses = predictionData.recommendedUses || [
    "Automotive Parts",
    "Industrial Seals",
    "Conveyor Belts",
  ];

  // Extract property ranges
  const propertyRanges = predictionData.propertyRanges || {
    tensileStrength: { low: 15, high: 30 },
    elongation: { low: 300, high: 600 },
    hardness: { low: 50, high: 80 },
    abrasionResistance: { low: 0.1, high: 1.0 },
    tearStrength: { low: 40, high: 100 },
  };

  // Extract material impacts
  const materialImpacts = predictionData.materialImpacts
    ? Object.entries(predictionData.materialImpacts).map(
        ([material, impact]) => ({
          material,
          impact,
        })
      )
    : [];

  // Extract specific test values for the overview section
  const tensileStrength = predictionData.tensileStrength || 0;
  const elongation = predictionData.elongation || 0;
  const hardness = predictionData.hardness || 0;
  const abrasionResistance = predictionData.abrasionResistance || 0;
  const tearStrength = predictionData.tearStrength || 0;
  const toughness =
    testResults.find((t) => t.name.includes("Toughness Unaged Condition"))
      ?.value || 0;
  const density = predictionData.density || 1.2;

  // Extract modulus data
  const modulus100 = predictionData.modulus100 || {};
  const modulus200 = predictionData.modulus200 || {};
  const modulus300 = predictionData.modulus300 || {};
  const modulus50 = predictionData.modulus50 || 0;

  return {
    testResults,
    tensileStrength,
    elongation,
    hardness,
    abrasionResistance,
    tearStrength,
    toughness,
    density,
    confidenceScore,
    recommendedUses,
    propertyRanges,
    materialImpacts: materialImpacts.sort((a, b) => b.impact - a.impact),
    modulus100,
    modulus200,
    modulus300,
    modulus50,
  };
};

/**
 * Calculate total composition weight
 * @param {Array} materialCompositions - Array of material compositions
 * @returns {Number} Total weight
 */
export const calculateTotalWeight = (materialCompositions) => {
  return materialCompositions.reduce(
    (total, item) => total + (parseFloat(item.composition) || 0),
    0
  );
};

/**
 * Validate material compositions before submission
 * @param {Array} materialCompositions - Array of material compositions
 * @returns {Object} Validation result with isValid flag and error message
 */
export const validateComposition = (materialCompositions) => {
  // Remove items with zero composition
  const nonZeroCompositions = materialCompositions.filter(
    (item) => item.material && parseFloat(item.composition) > 0
  );

  if (nonZeroCompositions.length === 0) {
    return {
      isValid: false,
      error: "Please add at least one material with non-zero composition",
    };
  }

  // Check for duplicate materials
  const materials = nonZeroCompositions.map((item) => item.material);
  const uniqueMaterials = new Set(materials);

  if (materials.length !== uniqueMaterials.size) {
    return {
      isValid: false,
      error:
        "Duplicate materials detected. Please use each material only once.",
    };
  }

  return { isValid: true };
};

/**
 * Normalize material compositions to 100%
 * @param {Array} materialCompositions - Array of material compositions
 * @returns {Array} Normalized material compositions
 */
export const normalizeComposition = (materialCompositions) => {
  const totalWeight = calculateTotalWeight(materialCompositions);

  if (totalWeight === 0) {
    return materialCompositions;
  }

  return materialCompositions.map((item) => ({
    material: item.material,
    composition: ((parseFloat(item.composition) || 0) / totalWeight) * 100,
  }));
};

/**
 * Health check endpoint to verify API connectivity
 * @returns {Promise<boolean>} True if API is reachable
 */
export const checkApiHealth = async () => {
  try {
    const response = await fetch(`${API_BASE_URL}/`);
    return response.ok;
  } catch (error) {
    console.error("API health check failed:", error);
    return false;
  }
};

/**
 * Debug the API with the given material compositions
 * @param {Array} materialCompositions - Array of material compositions
 * @returns {Promise<Object>} Debug results
 */
export const debugApiRequest = async (materialCompositions) => {
  try {
    // Format compositions same way as for predictions
    const formattedCompositions = materialCompositions.map((item) => ({
      material: item.material,
      composition: parseFloat(item.composition),
    }));

    const requestBody = { materialCompositions: formattedCompositions };
    console.log("Debug request payload:", JSON.stringify(requestBody, null, 2));

    const response = await fetch(`${API_BASE_URL}/debug`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(requestBody),
    });

    const data = await response.json();
    console.log("Debug API response:", data);
    return data;
  } catch (error) {
    console.error("Debug API request failed:", error);
    throw error;
  }
};
