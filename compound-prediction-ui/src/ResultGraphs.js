import React, { useState } from "react";
import {
  BarChart,
  Bar,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Radar,
  PieChart,
  Pie,
  Cell,
} from "recharts";

const ResultGraphs = ({ predictionResults }) => {
  const [activeChartType, setActiveChartType] = useState("physical");

  // Define color scheme
  const COLORS = ["#8884d8", "#82ca9d", "#ffc658", "#ff8042", "#0088FE"];

  // Transform main properties into chart data
  const mainPropertiesData = [
    {
      name: "Tensile Strength (MPa)",
      value: parseFloat(predictionResults.tensileStrength) || 0,
    },
    {
      name: "Elongation (%)",
      value: parseFloat(predictionResults.elongation) || 0,
    },
    {
      name: "Hardness (Shore A)",
      value: parseFloat(predictionResults.hardness) || 0,
    },
    {
      name: "Density (g/cm³)",
      value: parseFloat(predictionResults.density) || 0,
    },
  ];

  // Transform abrasion and tear data
  const secondaryPropertiesData = [
    {
      name: "Abrasion Resistance (mm³)",
      value: parseFloat(predictionResults.abrasionResistance) || 0,
    },
    {
      name: "Tear Strength (kN/m)",
      value: parseFloat(predictionResults.tearStrength) || 0,
    },
  ];

  // Transform modulus data for line chart
  const modulusData = [
    { name: "50%", value: parseFloat(predictionResults.modulus50) || 0 },
    { name: "100%", value: parseFloat(predictionResults.modulus100) || 0 },
    { name: "200%", value: parseFloat(predictionResults.modulus200) || 0 },
    { name: "300%", value: parseFloat(predictionResults.modulus300) || 0 },
  ];

  // Transform material impacts data for pie chart
  const materialImpactsData = predictionResults.materialImpacts
    ? Object.entries(predictionResults.materialImpacts).map(
        ([name, value]) => ({
          name,
          value: parseFloat(value) || 0,
        })
      )
    : [];

  // Normalize data for radar chart (scale each property to 0-100 range)
  const normalizeValue = (value, max) => (value / max) * 100;

  const maxTensile = 30; // Example max values - adjust based on typical ranges
  const maxElongation = 800;
  const maxHardness = 100;
  const maxAbrasion = 150;
  const maxTear = 50;

  const radarData = [
    {
      property: "Compound Properties",
      "Tensile Strength": normalizeValue(
        parseFloat(predictionResults.tensileStrength) || 0,
        maxTensile
      ),
      Elongation: normalizeValue(
        parseFloat(predictionResults.elongation) || 0,
        maxElongation
      ),
      Hardness: normalizeValue(
        parseFloat(predictionResults.hardness) || 0,
        maxHardness
      ),
      "Abrasion Resistance":
        100 -
        normalizeValue(
          parseFloat(predictionResults.abrasionResistance) || 0,
          maxAbrasion
        ), // Lower is better for abrasion
      "Tear Strength": normalizeValue(
        parseFloat(predictionResults.tearStrength) || 0,
        maxTear
      ),
    },
  ];

  return (
    <div className="mt-8">
      <div className="mb-4 flex justify-center space-x-4">
        <button
          onClick={() => setActiveChartType("physical")}
          className={`px-4 py-2 rounded-lg ${
            activeChartType === "physical"
              ? "bg-purple-600 text-white"
              : "bg-gray-200 text-gray-700"
          }`}
        >
          Physical Properties
        </button>
        <button
          onClick={() => setActiveChartType("modulus")}
          className={`px-4 py-2 rounded-lg ${
            activeChartType === "modulus"
              ? "bg-purple-600 text-white"
              : "bg-gray-200 text-gray-700"
          }`}
        >
          Modulus Curve
        </button>
        <button
          onClick={() => setActiveChartType("radar")}
          className={`px-4 py-2 rounded-lg ${
            activeChartType === "radar"
              ? "bg-purple-600 text-white"
              : "bg-gray-200 text-gray-700"
          }`}
        >
          Performance Radar
        </button>
        <button
          onClick={() => setActiveChartType("materials")}
          className={`px-4 py-2 rounded-lg ${
            activeChartType === "materials"
              ? "bg-purple-600 text-white"
              : "bg-gray-200 text-gray-700"
          }`}
        >
          Material Impacts
        </button>
      </div>

      <div className="bg-white p-4 rounded-lg shadow">
        {activeChartType === "physical" && (
          <div className="space-y-8">
            <div>
              <h3 className="text-lg font-medium mb-2 text-center text-purple-600">
                Primary Physical Properties
              </h3>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={mainPropertiesData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis
                    dataKey="name"
                    tick={{ fontSize: 12 }}
                    angle={-45}
                    textAnchor="end"
                    height={70}
                  />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Bar dataKey="value" fill="#8884d8" />
                </BarChart>
              </ResponsiveContainer>
            </div>

            <div>
              <h3 className="text-lg font-medium mb-2 text-center text-purple-600">
                Secondary Physical Properties
              </h3>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={secondaryPropertiesData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis
                    dataKey="name"
                    tick={{ fontSize: 12 }}
                    angle={-45}
                    textAnchor="end"
                    height={70}
                  />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Bar dataKey="value" fill="#82ca9d" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        )}

        {activeChartType === "modulus" && (
          <div>
            <h3 className="text-lg font-medium mb-2 text-center text-purple-600">
              Modulus at Different Elongations
            </h3>
            <ResponsiveContainer width="100%" height={400}>
              <LineChart data={modulusData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis
                  label={{
                    value: "Modulus (MPa)",
                    angle: -90,
                    position: "insideLeft",
                  }}
                />
                <Tooltip />
                <Legend />
                <Line
                  type="monotone"
                  dataKey="value"
                  stroke="#8884d8"
                  strokeWidth={2}
                  dot={{ r: 5 }}
                  activeDot={{ r: 8 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        )}

        {activeChartType === "radar" && (
          <div>
            <h3 className="text-lg font-medium mb-2 text-center text-purple-600">
              Performance Radar
            </h3>
            <ResponsiveContainer width="100%" height={400}>
              <RadarChart outerRadius={150} data={radarData}>
                <PolarGrid />
                <PolarAngleAxis dataKey="property" />
                <PolarRadiusAxis angle={90} domain={[0, 100]} />
                <Radar
                  name="Tensile Strength"
                  dataKey="Tensile Strength"
                  stroke="#8884d8"
                  fill="#8884d8"
                  fillOpacity={0.2}
                />
                <Radar
                  name="Elongation"
                  dataKey="Elongation"
                  stroke="#82ca9d"
                  fill="#82ca9d"
                  fillOpacity={0.2}
                />
                <Radar
                  name="Hardness"
                  dataKey="Hardness"
                  stroke="#ffc658"
                  fill="#ffc658"
                  fillOpacity={0.2}
                />
                <Radar
                  name="Abrasion Resistance"
                  dataKey="Abrasion Resistance"
                  stroke="#ff8042"
                  fill="#ff8042"
                  fillOpacity={0.2}
                />
                <Radar
                  name="Tear Strength"
                  dataKey="Tear Strength"
                  stroke="#0088FE"
                  fill="#0088FE"
                  fillOpacity={0.2}
                />
                <Legend />
                <Tooltip />
              </RadarChart>
            </ResponsiveContainer>
          </div>
        )}

        {activeChartType === "materials" && (
          <div>
            <h3 className="text-lg font-medium mb-2 text-center text-purple-600">
              Material Impact Distribution
            </h3>
            {materialImpactsData.length > 0 ? (
              <ResponsiveContainer width="100%" height={400}>
                <PieChart>
                  <Pie
                    data={materialImpactsData}
                    cx="50%"
                    cy="50%"
                    labelLine={true}
                    outerRadius={150}
                    fill="#8884d8"
                    dataKey="value"
                    nameKey="name"
                    label={({ name, percent }) =>
                      `${name}: ${(percent * 100).toFixed(0)}%`
                    }
                  >
                    {materialImpactsData.map((entry, index) => (
                      <Cell
                        key={`cell-${index}`}
                        fill={COLORS[index % COLORS.length]}
                      />
                    ))}
                  </Pie>
                  <Tooltip formatter={(value) => `${value}%`} />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <p className="text-center text-gray-500">
                No material impact data available
              </p>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default ResultGraphs;
