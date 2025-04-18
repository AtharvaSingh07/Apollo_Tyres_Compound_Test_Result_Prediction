// Utility functions for the compound prediction app

// Generate mock prediction results for testing
export const generateMockResults = (materialCompositions) => {
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
      // Add recommended uses
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
  
  // Transform property data for graph display
  export const getPropertyGraphData = (predictionResults) => {
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
  
  // Save prediction report to JSON file
  export const saveReport = (predictionResults, materialCompositions) => {
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