// Utility functions for the compound prediction app

import * as XLSX from "xlsx";
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
      "Automotive Parts",
      "Industrial Seals",
      "Conveyor Belts",
      "Hoses",
      "Gaskets",
    ],
    // Historical data for comparison
    historicalData: [
      {
        name: "Current",
        tensileStrength: parseFloat((Math.random() * 20 + 10).toFixed(2)),
        elongation: parseFloat((Math.random() * 500 + 300).toFixed(2)),
        hardness: Math.floor(Math.random() * 30 + 50),
        abrasionResistance: parseFloat((Math.random() * 150 + 50).toFixed(2)),
        tearStrength: parseFloat((Math.random() * 40 + 20).toFixed(2)),
      },
      {
        name: "Benchmark 1",
        tensileStrength: parseFloat((Math.random() * 20 + 10).toFixed(2)),
        elongation: parseFloat((Math.random() * 500 + 300).toFixed(2)),
        hardness: Math.floor(Math.random() * 30 + 50),
        abrasionResistance: parseFloat((Math.random() * 150 + 50).toFixed(2)),
        tearStrength: parseFloat((Math.random() * 40 + 20).toFixed(2)),
      },
      {
        name: "Benchmark 2",
        tensileStrength: parseFloat((Math.random() * 20 + 10).toFixed(2)),
        elongation: parseFloat((Math.random() * 500 + 300).toFixed(2)),
        hardness: Math.floor(Math.random() * 30 + 50),
        abrasionResistance: parseFloat((Math.random() * 150 + 50).toFixed(2)),
        tearStrength: parseFloat((Math.random() * 40 + 20).toFixed(2)),
      },
    ],
  };
};

// Transform property data for graph display
export const getPropertyGraphData = (predictionResults) => {
  if (!predictionResults) return [];

  const properties = [
    {
      name: "Tensile Strength (MPa)",
      value: parseFloat(predictionResults.tensileStrength),
    },
    {
      name: "Elongation (%/10)",
      value: parseFloat(predictionResults.elongation) / 10,
    }, // Scaled for better visualization
    { name: "Hardness", value: predictionResults.hardness },
    {
      name: "Abrasion Res. (mm³/10)",
      value: parseFloat(predictionResults.abrasionResistance) / 10,
    }, // Scaled
    {
      name: "Tear Strength (kN/m)",
      value: parseFloat(predictionResults.tearStrength),
    },
  ];

  return properties;
};

// Save prediction report to JSON file
// export const saveReport = (predictionResults, materialCompositions) => {
//   if (!predictionResults) return;

//   const reportData = {
//     date: new Date().toISOString(),
//     materials: materialCompositions,
//     results: predictionResults
//   };

//   const dataStr = JSON.stringify(reportData, null, 2);
//   const dataUri = 'data:application/json;charset=utf-8,'+ encodeURIComponent(dataStr);

//   const exportFileDefaultName = 'compound-prediction-report.json';

//   const linkElement = document.createElement('a');
//   linkElement.setAttribute('href', dataUri);
//   linkElement.setAttribute('download', exportFileDefaultName);
//   linkElement.click();
// };

// Save prediction report to Excel file
export const saveReport = (predictionResults, materialCompositions) => {
  if (!predictionResults) return;

  // Create workbook
  const workbook = XLSX.utils.book_new();

  // Format date for the report title
  const today = new Date();
  const formattedDate = today.toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });

  // Create summary sheet
  const summaryData = [
    ["Compound Prediction Report", ""],
    ["Generated on", formattedDate],
    [""],
    ["Key Properties", "Value"],
    ["Tensile Strength (MPa)", predictionResults.tensileStrength || "N/A"],
    ["Elongation (%)", predictionResults.elongation || "N/A"],
    ["Hardness (Shore A)", predictionResults.hardness || "N/A"],
    [
      "Abrasion Resistance (mm³)",
      predictionResults.abrasionResistance || "N/A",
    ],
    ["Tear Strength (kN/m)", predictionResults.tearStrength || "N/A"],
    ["Density (g/cm³)", predictionResults.density || "N/A"],
    ["Confidence Score (%)", predictionResults.confidenceScore || "N/A"],
    [""],
  ];

  // Add recommended uses if available
  if (
    predictionResults.recommendedUses &&
    Array.isArray(predictionResults.recommendedUses)
  ) {
    summaryData.push(["Recommended Uses:"]);
    predictionResults.recommendedUses.forEach((use) => {
      summaryData.push(["• " + use]);
    });
    summaryData.push([""]);
  }

  // Create and add summary worksheet
  const summaryWorksheet = XLSX.utils.aoa_to_sheet(summaryData);
  XLSX.utils.book_append_sheet(workbook, summaryWorksheet, "Summary");

  // Create material composition sheet
  if (materialCompositions && Object.keys(materialCompositions).length > 0) {
    const materialsData = [["Material Composition", "Percentage (%)"]];

    Object.entries(materialCompositions).forEach(([material, percentage]) => {
      materialsData.push([material, percentage]);
    });

    const materialsWorksheet = XLSX.utils.aoa_to_sheet(materialsData);
    XLSX.utils.book_append_sheet(workbook, materialsWorksheet, "Materials");
  }

  // Create detailed test results sheet if available
  if (
    predictionResults.testResults &&
    Object.keys(predictionResults.testResults).length > 0
  ) {
    const testResultsData = [["Test Parameter", "Value"]];

    Object.entries(predictionResults.testResults).forEach(([param, value]) => {
      testResultsData.push([param, value]);
    });

    const testResultsWorksheet = XLSX.utils.aoa_to_sheet(testResultsData);
    XLSX.utils.book_append_sheet(
      workbook,
      testResultsWorksheet,
      "Test Results"
    );
  }

  // Create material impacts sheet if available
  if (
    predictionResults.materialImpacts &&
    Object.keys(predictionResults.materialImpacts).length > 0
  ) {
    const impactsData = [["Material", "Impact (%)"]];

    // Sort by impact in descending order
    Object.entries(predictionResults.materialImpacts)
      .sort((a, b) => b[1] - a[1])
      .forEach(([material, impact]) => {
        impactsData.push([material, impact]);
      });

    const impactsWorksheet = XLSX.utils.aoa_to_sheet(impactsData);
    XLSX.utils.book_append_sheet(
      workbook,
      impactsWorksheet,
      "Material Impacts"
    );
  }

  // Create modulus data sheet if available
  const modulusData = [
    ["Elongation (%)", "Modulus (MPa)"],
    ["50", predictionResults.modulus50 || "N/A"],
    ["100", predictionResults.modulus100 || "N/A"],
    ["200", predictionResults.modulus200 || "N/A"],
    ["300", predictionResults.modulus300 || "N/A"],
  ];

  const modulusWorksheet = XLSX.utils.aoa_to_sheet(modulusData);
  XLSX.utils.book_append_sheet(workbook, modulusWorksheet, "Modulus Data");

  // Set column widths for better readability in all sheets
  const setColumnWidths = (worksheet) => {
    if (!worksheet) return;

    // Calculate width of each column (approximation)
    const columnWidths = [];
    XLSX.utils.sheet_to_json(worksheet, { header: 1 }).forEach((row) => {
      row.forEach((cell, colIndex) => {
        const cellValue = String(cell);
        const cellWidth = Math.max(10, cellValue.length * 1.2); // rough approximation

        if (!columnWidths[colIndex] || columnWidths[colIndex] < cellWidth) {
          columnWidths[colIndex] = cellWidth;
        }
      });
    });

    // Set column widths
    worksheet["!cols"] = columnWidths.map((width) => ({ wch: width }));
  };

  // Apply column widths to all sheets
  Object.keys(workbook.Sheets).forEach((sheetName) => {
    setColumnWidths(workbook.Sheets[sheetName]);
  });

  // Generate Excel file
  const excelBuffer = XLSX.write(workbook, { bookType: "xlsx", type: "array" });

  // Create blob from buffer
  const blob = new Blob([excelBuffer], {
    type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
  });

  // Create download link
  const url = URL.createObjectURL(blob);
  const exportFileDefaultName = "compound-prediction-report.xlsx";

  const linkElement = document.createElement("a");
  linkElement.href = url;
  linkElement.download = exportFileDefaultName;
  linkElement.click();

  // Clean up
  URL.revokeObjectURL(url);
};
