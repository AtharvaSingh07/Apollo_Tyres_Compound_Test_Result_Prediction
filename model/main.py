from fastapi import FastAPI, HTTPException, Request
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import List, Dict, Union, Optional
import pandas as pd
import numpy as np
import os
import joblib
from sklearn.ensemble import RandomForestRegressor, GradientBoostingRegressor
from sklearn.linear_model import LinearRegression

# Create the FastAPI app
app = FastAPI()

# Configure CORS - IMPORTANT: This must be added BEFORE any routes
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Allows all origins - for production, specify actual domains
    allow_credentials=True,
    allow_methods=["*"],  # Allows all methods
    allow_headers=["*"],  # Allows all headers
)

# Model storage
MODEL_DIR = "compound_models"
EXCEL_FILE = "training_dataset.xlsx"

# Load models at startup
models = {}
formulation_matrix = None
formulation_df = None
raw_materials = []
recipes = []

# Pydantic models for request/response
class MaterialComposition(BaseModel):
    material: str
    composition: float

class PredictionRequest(BaseModel):
    materialCompositions: List[MaterialComposition]

class PredictionResponse(BaseModel):
    testResults: Dict[str, Union[float, str]]
    confidenceScore: float
    recommendedUses: List[str]
    tensileStrength: float
    elongation: float
    hardness: float
    abrasionResistance: float
    tearStrength: float
    modulus100: Dict[str, Union[float, str]]
    modulus200: Dict[str, Union[float, str]]
    modulus300: Dict[str, Union[float, str]]
    modulus50: float
    propertyRanges: Dict[str, Dict[str, float]]
    materialImpacts: Dict[str, float]

class RecipeListResponse(BaseModel):
    recipes: List[str]

class MaterialListResponse(BaseModel):
    materials: List[str]

class RecipeRequest(BaseModel):
    recipeName: str

class RecipeCompositionResponse(BaseModel):
    materialCompositions: List[MaterialComposition]

def load_data():
    """Load the formulation data and models"""
    global models, formulation_matrix, formulation_df, raw_materials, recipes
    
    # Check if models directory exists
    if not os.path.exists(MODEL_DIR):
        os.makedirs(MODEL_DIR, exist_ok=True)
    
    # Load formulation data
    if not os.path.exists(EXCEL_FILE):
        raise FileNotFoundError(f"Training data file {EXCEL_FILE} not found")
    
    try:
        # Load Excel data
        formulation_df = pd.read_excel(EXCEL_FILE, sheet_name='Compound_Formulation')
        
        # Extract column names
        id_cols = formulation_df.columns.tolist()[:2]
        recipe_names = formulation_df.columns.tolist()[2:]
        
        # Store recipes for later use
        recipes = recipe_names
        
        # Clean formulation data - replace spaces, empty strings with NaN
        for col in recipe_names:
            formulation_df[col] = pd.to_numeric(formulation_df[col], errors='coerce')
        
        # Transform formulation data from wide to long format
        formulation_long = pd.melt(
            formulation_df, 
            id_vars=id_cols,
            value_vars=recipe_names,
            var_name='Recipe_Name',
            value_name='Composition_Amount'
        )
        
        # Filter out rows where raw materials are not used in recipes (NaN or 0)
        formulation_long = formulation_long.dropna(subset=['Composition_Amount'])
        # Ensure Composition_Amount is float before comparison
        formulation_long['Composition_Amount'] = pd.to_numeric(formulation_long['Composition_Amount'], errors='coerce')
        formulation_long = formulation_long[formulation_long['Composition_Amount'] > 0]
        
        # Get the name of the column that contains the raw material names (second column)
        raw_material_col = id_cols[1]
        
        # Store raw materials for later use
        raw_materials = formulation_df[raw_material_col].tolist()
        
        # Create the formulation matrix
        formulation_matrix = formulation_long.pivot(
            index='Recipe_Name',
            columns=raw_material_col,
            values='Composition_Amount'
        )
        
        # Fill NaN values with 0 (raw materials not used in certain recipes)
        formulation_matrix = formulation_matrix.fillna(0)
        
        # Load models
        model_files = [f for f in os.listdir(MODEL_DIR) if f.endswith("_model.joblib")]
        
        for model_file in model_files:
            try:
                # Extract test parameter name from filename
                test_param = model_file.replace("_model.joblib", "").replace("_", " ")
                
                # Load the model
                model_path = os.path.join(MODEL_DIR, model_file)
                model = joblib.load(model_path)
                
                # Store in dictionary
                models[test_param] = model
                
            except Exception as e:
                print(f"Error loading model {model_file}: {str(e)}")
        
        print(f"Loaded {len(models)} models")
        print(f"Loaded {len(raw_materials)} raw materials")
        print(f"Loaded {len(recipes)} recipes")
        
    except Exception as e:
        print(f"Error during data loading: {str(e)}")
        raise e

def predict_new_formulation(new_formulation):
    """
    Predict test results for a new formulation
    
    Parameters:
    - new_formulation: Dictionary mapping raw material names to composition amounts
    
    Returns:
    - Dictionary of predicted test results
    """
    # Create a DataFrame for the new formulation
    raw_materials = formulation_matrix.columns.tolist()
    new_form_df = pd.DataFrame([new_formulation], index=['new_formulation'])
    
    # Fill missing values with 0 (raw materials not used)
    for rm in raw_materials:
        if rm not in new_form_df.columns:
            new_form_df[rm] = 0
    
    # Make predictions
    predictions = {}
    for test_param, model in models.items():
        try:
            # Make sure we have all the features the model expects
            if hasattr(model, 'feature_names_in_'):
                # For scikit-learn models that have feature_names_in_
                missing_features = set(model.feature_names_in_) - set(new_form_df.columns)
                for feature in missing_features:
                    new_form_df[feature] = 0
                
                # Reorder columns to match the model's expected feature order
                new_form_df_ordered = new_form_df[model.feature_names_in_]
            else:
                # For models that don't specify feature names
                new_form_df_ordered = new_form_df
            
            # Predict
            pred = model.predict(new_form_df_ordered)[0]
            predictions[test_param] = float(pred)  # Convert numpy types to Python float
        except Exception as e:
            print(f"Error predicting {test_param}: {str(e)}")
            predictions[test_param] = None
    
    # Add the specified test parameters if they're not in predictions
#     default_parameters = {
#     "100 Modulus MPa Unaged Condition 160⁰C 15 minutes": "NA",
#     "100 Modulus MPa Unaged Condition 160⁰C 30 minutes": "NA",
#     "100 Modulus MPa Aged 100⁰C 48Hrs": "NA",
#     "100 Modulus MPa Aged 70⁰C 7Days": "NA",
#     "200 Modulus MPa Unaged Condition 160⁰C 15 minutes": "NA",
#     "200 Modulus MPa Unaged Condition 160⁰C 30 minutes": "NA",
#     "200 Modulus MPa Aged 100⁰C 48Hrs": "NA",
#     "200 Modulus MPa Aged 70⁰C 7Days": "NA",
#     "300 Modulus MPa Unaged Condition 160⁰C 15 minutes": "NA",
#     "300 Modulus MPa Unaged Condition 160⁰C 30 minutes": "NA",
#     "300 Modulus MPa Aged 100⁰C 48Hrs": "NA",
#     "300 Modulus MPa Aged 70⁰C 7Days": "NA",
#     "50 Modulus MPa Unaged Condition 160⁰C 15 minutes": "NA",
#     "Abrasion Loss Index": "NA",
#     "Abrasion Loss mg m at100 N load 8 km h speed 9⁰ slip angle": "NA",
#     "Abrasion Loss mg m at100 N load 8 km h speed 5 5⁰ slip angle": "NA",
#     "Bulk tear strength N unaged Condition 160⁰C 15 minutes": "NA",
#     "Bulk tear strength N unaged Condition 160⁰C 30 minutes": "NA",
#     "Elongation at break Unaged Condition 160⁰C 15 minutes": "NA",
#     "Elongation at break Unaged Condition 160⁰C 30 minutes": "NA",
#     "Elongation at break Aged 70⁰C 7Days": "NA",
#     "Elongation at break Aged 100⁰C 48Hrs": "NA",
#     "E MPa 70C": "NA",
#     "Hardness Shore A Unaged Condition 160⁰C 15 minutes": "NA",
#     "Hardness Shore A Unaged Condition 160⁰C 30 minutes": "NA",
#     "Hardness Shore A Aged 100⁰C 48Hrs": "NA",
#     "Hardness Shore A Aged 70⁰C 7Days": "NA",
#     "HBU DT at Base 0C": "NA",
#     "HBU DT at centre 0C": "NA",
#     "Loss Complience MPa 1 70C": "NA",
#     "SET": "NA",
#     "Slope 9 deg slip to 16 deg slip": "NA",
#     "Tan delta 70C": "NA",
#     "Tear strength N mm Aged 100⁰C 48Hrs": "NA",
#     "Tear strength N mm Aged 70⁰C 7Days": "NA",
#     "Tear strength N mm Unaged Condition 160⁰C 15 minutes": "NA",
#     "Tear strength N mm Unaged Condition 160⁰C 30 minutes": "NA",
#     "Tensile strength MPa Unaged Condition 160⁰C 15 minutes": "NA",
#     "Tensile strength MPa Unaged Condition 160⁰C 30 minutes": "NA",
#     "Tensile strength MPa Aged 100⁰C 48Hrs": "NA",
#     "Tensile strength MPa Aged 70⁰C 7Days": "NA",
#     "Toughness Unaged Condition 160⁰C 15 minutes": "NA",
#     "Toughness Unaged Condition 160⁰C 30 minutes": "NA",
#     "Toughness Aged 100⁰C 48Hrs": "NA"
# }

    
#     # Add default values for parameters not predicted by models
#     for param, value in default_parameters.items():
#         if param not in predictions or predictions[param] is None:
#             predictions[param] = value
    
    return predictions

def get_recommended_uses(predictions):
    """Generate recommended uses based on predicted properties"""
    uses = []
    
    # Check for tensile strength
    tensile_keys = [k for k in predictions.keys() if 'Tensile strength' in k and 'Unaged' in k]
    if tensile_keys:
        tensile_value = predictions[tensile_keys[0]]
        # Ensure tensile_value is numeric before comparison
        if tensile_value != "NA" and not isinstance(tensile_value, str):
            tensile = float(tensile_value)
            if tensile > 25:
                uses.append("High-stress applications")
            elif tensile > 15:
                uses.append("Medium-duty mechanical parts")
    
    # Check for elongation
    elongation_keys = [k for k in predictions.keys() if 'Elongation at break' in k and 'Unaged' in k]
    if elongation_keys:
        elongation_value = predictions[elongation_keys[0]]
        # Ensure elongation_value is numeric before comparison
        if elongation_value != "NA" and not isinstance(elongation_value, str):
            elongation = float(elongation_value)
            if elongation > 500:
                uses.append("Elastic components requiring high stretch")
            elif elongation > 300:
                uses.append("Flexible sealing applications")
    
    # Check for hardness
    hardness_keys = [k for k in predictions.keys() if 'Hardness Shore A' in k and 'Unaged' in k]
    if hardness_keys:
        hardness_value = predictions[hardness_keys[0]]
        # Ensure hardness_value is numeric before comparison
        if hardness_value != "NA" and not isinstance(hardness_value, str):
            hardness = float(hardness_value)
            if hardness > 70:
                uses.append("Rigid structural components")
            elif hardness > 60:
                uses.append("General industrial applications")
            elif hardness > 50:
                uses.append("Moderate-flex components")
            else:
                uses.append("Soft, high-compliance applications")
    
    # Check for abrasion resistance
    abrasion_keys = [k for k in predictions.keys() if 'Abrasion Loss' in k]
    if abrasion_keys:
        abrasion_value = predictions[abrasion_keys[0]]
        # Ensure abrasion_value is numeric before comparison
        if abrasion_value != "NA" and not isinstance(abrasion_value, str):
            abrasion = float(abrasion_value)
            if abrasion < 0.4:
                uses.append("Wear-resistant surfaces")
    
    # Check for modulus
    modulus_keys = [k for k in predictions.keys() if '100 Modulus MPa' in k and 'Unaged' in k]
    if modulus_keys:
        modulus_value = predictions[modulus_keys[0]]
        # Ensure modulus_value is numeric before comparison
        if modulus_value != "NA" and not isinstance(modulus_value, str):
            modulus = float(modulus_value)
            if modulus > 3.0:
                uses.append("High-stiffness applications")
            elif modulus > 2.0:
                uses.append("Moderate-stiffness components")
    
    # Default uses if none determined
    if not uses:
        uses = ["General rubber compound applications", "Further testing recommended"]
    
    return uses

def extract_key_properties(predictions):
    """Extract key properties from the full prediction set"""
    # Initialize with default values
    props = {
        "tensileStrength": 0,
        "elongation": 0,
        "hardness": 0,
        "abrasionResistance": 0,
        "teaftrength": 0,
        "modulus100": {},
        "modulus200": {},
        "modulus300": {},
        "modulus50": 0
    }
    
    # Helper function to safely convert values to float
    def safe_float(value, default=0):
        if isinstance(value, (int, float)):
            return float(value)
        elif isinstance(value, str) and value != "NA" and value.replace('.', '', 1).isdigit():
            return float(value)
        return default
    
    # Extract tensile strength
    tensile_keys = [k for k in predictions.keys() if 'Tensile strength' in k and 'Unaged' in k]
    if tensile_keys:
        props["tensileStrength"] = safe_float(predictions[tensile_keys[0]])
    
    # Extract elongation
    elongation_keys = [k for k in predictions.keys() if 'Elongation at break' in k and 'Unaged' in k]
    if elongation_keys:
        props["elongation"] = safe_float(predictions[elongation_keys[0]])
    
    # Extract hardness
    hardness_keys = [k for k in predictions.keys() if 'Hardness Shore A' in k and 'Unaged' in k]
    if hardness_keys:
        props["hardness"] = safe_float(predictions[hardness_keys[0]])
    
    # Extract abrasion resistance
    abrasion_keys = [k for k in predictions.keys() if 'Abrasion Loss mg m' in k]
    if abrasion_keys:
        props["abrasionResistance"] = safe_float(predictions[abrasion_keys[0]])
    
    # Extract tear strength
    tear_keys = [k for k in predictions.keys() if 'Tear strength' in k and 'Unaged' in k]
    if tear_keys:
        props["tearStrength"] = safe_float(predictions[tear_keys[0]])
    
    # Extract modulus values with safe conversion
    # 100 Modulus
    props["modulus100"] = {
        "unaged_15min": safe_float(predictions.get("100 Modulus MPa Unaged Condition 160⁰C 15 minutes", 2.1100), 2.1100),
        "unaged_30min": safe_float(predictions.get("100 Modulus MPa Unaged Condition 160⁰C 30 minutes", 1.1390), 1.1390),
        "aged_100C_48hrs": safe_float(predictions.get("100 Modulus MPa Aged 100⁰C 48Hrs", 3.2700), 3.2700),
        "aged_70C_7days": safe_float(predictions.get("100 Modulus MPa Aged 70⁰C 7Days", 2.8147), 2.8147)
    }
    
    # 200 Modulus
    props["modulus200"] = {
        "unaged_15min": safe_float(predictions.get("200 Modulus MPa Unaged Condition 160⁰C 15 minutes", 6.0800), 6.0800),
        "unaged_30min": safe_float(predictions.get("200 Modulus MPa Unaged Condition 160⁰C 30 minutes", 2.8721), 2.8721),
        "aged_100C_48hrs": safe_float(predictions.get("200 Modulus MPa Aged 100⁰C 48Hrs", 8.5300), 8.5300),
        "aged_70C_7days": safe_float(predictions.get("200 Modulus MPa Aged 70⁰C 7Days", 6.5362), 6.5362)
    }
    
    # 300 Modulus
    props["modulus300"] = {
        "unaged_15min": safe_float(predictions.get("300 Modulus MPa Unaged Condition 160⁰C 15 minutes", 11.9731), 11.9731),
        "unaged_30min": safe_float(predictions.get("300 Modulus MPa Unaged Condition 160⁰C 30 minutes", 5.9926), 5.9926),
        "aged_100C_48hrs": safe_float(predictions.get("300 Modulus MPa Aged 100⁰C 48Hrs", 14.5008), 14.5008),
        "aged_70C_7days": safe_float(predictions.get("300 Modulus MPa Aged 70⁰C 7Days", 11.4306), 11.4306)
    }
    
    # 50 Modulus
    props["modulus50"] = safe_float(predictions.get("50 Modulus MPa Unaged Condition 160⁰C 15 minutes", 1.2300), 1.2300)
    
    return props

def generate_property_ranges():
    """Generate typical property ranges for comparison"""
    return {
        "tensileStrength": {"low": 10, "medium": 20, "high": 30},
        "elongation": {"low": 300, "medium": 450, "high": 600},
        "hardness": {"low": 40, "medium": 60, "high": 80},
        "abrasionResistance": {"low": 0.2, "medium": 0.5, "high": 0.8},
        "tearStrength": {"low": 40, "medium": 70, "high": 100},
        "modulus100": {"low": 1.0, "medium": 2.0, "high": 3.5},
        "modulus200": {"low": 2.5, "medium": 5.0, "high": 8.5},
        "modulus300": {"low": 5.0, "medium": 10.0, "high": 15.0}
    }

def get_confidence_score(predictions):
    """
    Estimate confidence score based on the proportion of valid (non-null, non-'NA') predictions.
    """
    non_null_predictions = sum(1 for p in predictions.values() if p is not None and p != "NA")
    total_predictions = max(1, len(predictions))  # Avoid division by zero

    # Confidence score is simply the proportion of valid predictions
    confidence = (non_null_predictions / total_predictions) * 100

    return round(confidence, 2)


def get_material_impacts(new_formulation):
    """Calculate estimated impact of each material on properties"""
    # This would ideally be based on model feature importances
    # For now, we'll return a simplified estimation
    impacts = {}
    total = sum(float(amount) for amount in new_formulation.values() if isinstance(amount, (int, float)) or (isinstance(amount, str) and amount.replace('.', '', 1).isdigit()))
    
    for material, amount in new_formulation.items():
        # Convert amount to float if it's not already
        if isinstance(amount, str) and amount.replace('.', '', 1).isdigit():
            amount = float(amount)
        elif not isinstance(amount, (int, float)):
            amount = 0
            
        impact = (amount / total) * 100 if total > 0 else 0
        impacts[material] = round(impact, 1)
    
    return impacts

def get_recipe_composition(recipe_name):
    """Get the composition of a specific recipe"""
    global formulation_df
    
    if recipe_name not in formulation_df.columns:
        return None
    
    # Get raw materials column name (typically the second column)
    raw_material_col = formulation_df.columns[1]
    
    # Get composition values for the recipe
    recipe_data = formulation_df[[raw_material_col, recipe_name]]
    
    # Filter out rows where the recipe doesn't use the material (NaN or 0)
    recipe_data = recipe_data.dropna(subset=[recipe_name])
    
    # Ensure numeric comparison by converting the recipe column to numeric
    recipe_data[recipe_name] = pd.to_numeric(recipe_data[recipe_name], errors='coerce')
    recipe_data = recipe_data[recipe_data[recipe_name] > 0]
    
    # Convert to the format expected by the frontend
    composition = []
    for _, row in recipe_data.iterrows():
        composition.append({
            "material": row[raw_material_col],
            "composition": float(row[recipe_name])
        })
    
    return composition

@app.on_event("startup")
async def startup_event():
    """Load data and models on startup"""
    try:
        load_data()
    except Exception as e:
        print(f"Startup error: {str(e)}")

@app.get("/")
def read_root():
    return {"message": "Compound Prediction API"}

@app.get("/materials", response_model=MaterialListResponse)
def get_materials():
    """Return list of available raw materials"""
    return {"materials": raw_materials}

@app.get("/recipes", response_model=RecipeListResponse)
def get_recipes():
    """Return list of available recipes"""
    return {"recipes": recipes}

@app.post("/get-recipe-composition", response_model=RecipeCompositionResponse)
def get_composition(request: RecipeRequest):
    """Get the composition of a specific recipe"""
    composition = get_recipe_composition(request.recipeName)
    
    if composition is None:
        raise HTTPException(status_code=404, detail="Recipe not found")
    
    return {"materialCompositions": composition}

@app.post("/predict", response_model=PredictionResponse)
async def predict(request: PredictionRequest):
    """Predict compound properties based on composition"""
    try:
        # Convert the request to the format expected by the prediction function
        # Ensure all composition values are properly converted to float
        new_formulation = {item.material: float(item.composition) for item in request.materialCompositions}
        
        # Make predictions
        predictions = predict_new_formulation(new_formulation)
        
        # Extract key properties
        key_props = extract_key_properties(predictions)
        
        # Get recommended uses
        uses = get_recommended_uses(predictions)
        
        # Calculate confidence score
        confidence = get_confidence_score(predictions)
        
        # Get material impacts
        impacts = get_material_impacts(new_formulation)
        
        # Return the response
        return {
            "testResults": predictions,
            "confidenceScore": confidence,
            "recommendedUses": uses,
            "tensileStrength": key_props["tensileStrength"],
            "elongation": key_props["elongation"],
            "hardness": key_props["hardness"],
            "abrasionResistance": key_props["abrasionResistance"],
            "tearStrength": key_props["tearStrength"],
            "modulus100": key_props["modulus100"],
            "modulus200": key_props["modulus200"],
            "modulus300": key_props["modulus300"],
            "modulus50": key_props["modulus50"],
            "propertyRanges": generate_property_ranges(),
            "materialImpacts": impacts
        }
    except Exception as e:
        # Log the error for debugging
        print(f"Error processing prediction: {str(e)}")
        # Provide detailed error information including the traceback
        import traceback
        traceback_str = traceback.format_exc()
        print(traceback_str)
        # Raise HTTPException to return a clean error response
        raise HTTPException(status_code=500, detail=f"Prediction error: {str(e)}")

# Run with: uvicorn main:app --reload
if __name__ == "__main__":
    import uvicorn
    import os
    port = int(os.environ.get("PORT", 8000))  # Use PORT from environment if available
    uvicorn.run("main:app", host="0.0.0.0", port=port)
