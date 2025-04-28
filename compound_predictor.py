import pandas as pd
import numpy as np
from sklearn.model_selection import train_test_split
from sklearn.ensemble import RandomForestRegressor, GradientBoostingRegressor
from sklearn.linear_model import LinearRegression
from sklearn.metrics import mean_squared_error, mean_absolute_error, r2_score
import matplotlib.pyplot as plt
import seaborn as sns
import joblib
import os

# Load the data from Excel sheets
def load_data(file_path):
    # Read both sheets
    formulation_df = pd.read_excel(file_path, sheet_name='Compound_Formulation')
    evaluation_df = pd.read_excel(file_path, sheet_name='Compound_Evaluation_Report')
    
    # Print column names for debugging
    print("Formulation DataFrame columns:", formulation_df.columns.tolist())
    print("Evaluation DataFrame columns:", evaluation_df.columns.tolist())
    
    return formulation_df, evaluation_df


def preprocess_data(formulation_df, evaluation_df):
    # Get the actual column names from the dataframes
    formulation_cols = formulation_df.columns.tolist()
    
    # Process formulation data (unchanged)
    id_cols = formulation_cols[:2]
    recipe_names = formulation_cols[2:]
    
    print(f"ID columns: {id_cols}")
    print(f"Recipe names: {recipe_names}")
    
    # Clean formulation data - replace spaces, empty strings with NaN
    for col in recipe_names:
        formulation_df[col] = pd.to_numeric(formulation_df[col], errors='coerce')
    
    # Transform formulation data from wide to long format using actual column names
    formulation_long = pd.melt(
        formulation_df, 
        id_vars=id_cols,
        value_vars=recipe_names,
        var_name='Recipe_Name',
        value_name='Composition_Amount'
    )
    
    # Filter out rows where raw materials are not used in recipes (NaN or 0)
    formulation_long = formulation_long.dropna(subset=['Composition_Amount'])
    formulation_long = formulation_long[formulation_long['Composition_Amount'] > 0]
    
    # Get the name of the column that contains the raw material names (second column)
    raw_material_col = id_cols[1]
    
    # Create the formulation matrix directly without using pivot_table
    formulation_matrix = formulation_long.pivot(
        index='Recipe_Name',
        columns=raw_material_col,
        values='Composition_Amount'
    )
    
    # Fill NaN values with 0 (raw materials not used in certain recipes)
    formulation_matrix = formulation_matrix.fillna(0)
    
    # Initialize test_params and evaluation_long as empty
    test_params = []
    evaluation_long = pd.DataFrame()
    
    # Only process evaluation data if it's not empty
    if not evaluation_df.empty:
        evaluation_cols = evaluation_df.columns.tolist()
        # First column in evaluation_df contains test parameter names
        test_param_col = evaluation_cols[0]
        
        # Clean evaluation data - replace spaces, empty strings with NaN
        for col in evaluation_cols[1:]:
            evaluation_df[col] = pd.to_numeric(evaluation_df[col], errors='coerce')
        
        # Get all test parameters
        test_params = evaluation_df[test_param_col].tolist()
        
        # Transform evaluation data from wide to long format
        evaluation_long = pd.melt(
            evaluation_df,
            id_vars=[test_param_col],
            value_vars=evaluation_cols[1:],
            var_name='Recipe_Name',
            value_name='Test_Result'
        )
        
        # Filter out rows where test was not conducted (null cells)
        evaluation_long = evaluation_long.dropna(subset=['Test_Result'])
    
    return formulation_matrix, evaluation_long, test_params, formulation_df


def build_train_model(X, y, test_parameter):
    """Build and train a model for a specific test parameter"""
    # Split the data
    X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.2, random_state=42)
    
    # Initialize models
    models = {
        'Linear Regression': LinearRegression(),
        'Random Forest': RandomForestRegressor(n_estimators=100, random_state=42),
        'Gradient Boosting': GradientBoostingRegressor(random_state=42)
    }
    
    # Train and evaluate each model
    results = {}
    best_r2 = -float('inf')
    best_model_name = None
    
    for name, model in models.items():
        try:
            # Train
            model.fit(X_train, y_train)
            
            # Predict
            y_pred = model.predict(X_test)
            
            # Evaluate
            mse = mean_squared_error(y_test, y_pred)
            mae = mean_absolute_error(y_test, y_pred)
            r2 = r2_score(y_test, y_pred)
            
            # Store results
            results[name] = {
                'model': model,
                'mse': mse,
                'mae': mae,
                'r2': r2,
                'y_test': y_test,
                'y_pred': y_pred
            }
            
            print(f"{name} - {test_parameter}:")
            print(f"  MSE: {mse:.4f}")
            print(f"  MAE: {mae:.4f}")
            print(f"  R²: {r2:.4f}")
            print()
            
            # Update best model
            if r2 > best_r2:
                best_r2 = r2
                best_model_name = name
                
        except Exception as e:
            print(f"Error with {name} model for {test_parameter}: {str(e)}")
    
    # Return the best model based on R²
    if best_model_name:
        return results[best_model_name]['model'], results
    else:
        print(f"No successful models for {test_parameter}")
        return None, {}

def feature_importance_analysis(model, feature_names, test_parameter):
    """Analyze feature importance for tree-based models"""
    if model is None:
        return None
        
    if hasattr(model, 'feature_importances_'):
        # Get feature importances
        importances = model.feature_importances_
        
        # Create a DataFrame for better visualization
        feature_importance_df = pd.DataFrame({
            'Feature': feature_names,
            'Importance': importances
        })
        
        # Sort by importance
        feature_importance_df = feature_importance_df.sort_values('Importance', ascending=False)
        
        # Print top 10 important features
        print(f"Top 10 important raw materials for {test_parameter}:")
        print(feature_importance_df.head(10))
        print()
        
        return feature_importance_df
    else:
        print(f"Feature importance not available for this model type for {test_parameter}")
        return None

def main(file_path):
    # Load data
    print("Loading data...")
    formulation_df, evaluation_df = load_data(file_path)
    
    # Preprocess data
    print("Preprocessing data...")
    formulation_matrix, evaluation_long, test_params, orig_formulation_df = preprocess_data(formulation_df, evaluation_df)
    
    # Display data shapes
    print(f"Formulation matrix shape: {formulation_matrix.shape}")
    print(f"Number of test data points: {len(evaluation_long)}")
    
    # Display available test parameters
    print(f"Available test parameters: {test_params}")
    
    # Build models for each test parameter
    models = {}
    feature_importances = {}
    
    for test_parameter in test_params:
        print(f"\nBuilding model for: {test_parameter}")
        
        # Get data for this test parameter
        param_col = evaluation_long.columns[0]  # First column contains parameter names
        test_data = evaluation_long[evaluation_long[param_col] == test_parameter]
        
        # Check if we have enough data
        if len(test_data) < 5:
            print(f"Not enough data for {test_parameter}, skipping...")
            continue
            
        # Get recipes with test results
        recipes_with_results = test_data['Recipe_Name'].unique()
        
        # Check which recipes are in formulation_matrix
        common_recipes = [r for r in recipes_with_results if r in formulation_matrix.index]
        if len(common_recipes) < len(recipes_with_results):
            print(f"Warning: {len(recipes_with_results) - len(common_recipes)} recipes not found in formulation data")
            
        # Get formulation data for these recipes
        X = formulation_matrix.loc[formulation_matrix.index.intersection(recipes_with_results)]
        y = test_data.set_index('Recipe_Name')['Test_Result']
        
        # Align indices
        common_indices = X.index.intersection(y.index)
        X = X.loc[common_indices]
        y = y.loc[common_indices]
        
        if len(X) < 5:
            print(f"After alignment, not enough data for {test_parameter}, skipping...")
            continue
            
        # Train model
        best_model, results = build_train_model(X, y, test_parameter)
        
        if best_model is not None:
            # Store the model
            models[test_parameter] = best_model
            
            # Analyze feature importance
            feature_importance = feature_importance_analysis(best_model, X.columns, test_parameter)
            if feature_importance is not None:
                feature_importances[test_parameter] = feature_importance
    
    print(f"\nSuccessfully built models for {len(models)} test parameters out of {len(test_params)}")
    
    return models, feature_importances, formulation_matrix, orig_formulation_df

def predict_new_formulation(models, new_formulation, formulation_matrix):
    """
    Predict test results for a new formulation
    
    Parameters:
    - models: Dictionary mapping test parameters to trained models
    - new_formulation: Dictionary mapping raw material names to composition amounts
    - formulation_matrix: The formulation matrix used for training
    
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
            predictions[test_param] = pred
        except Exception as e:
            predictions[test_param] = f"Error: {str(e)}"
    
    return predictions

def interactive_prediction(models, formulation_matrix, orig_formulation_df):
    """
    Interactive function to get user input for new compound formulations
    and predict test results
    """
    # Get raw materials information
    raw_materials = formulation_matrix.columns.tolist()
    
    print("\n=== Compound Test Result Prediction ===")
    print(f"This system can predict {len(models)} test parameters based on compound formulation.")
    print(f"The model knows about {len(raw_materials)} different raw materials.")
    
    print("\nYou can create a new compound formulation by specifying raw materials and amounts.")
    print("Options:")
    print("1. Enter raw materials and amounts manually")
    print("2. Modify an existing recipe")
    choice = input("Enter your choice (1 or 2): ")
    
    new_formulation = {}
    
    if choice == '2':
        # Show available recipes
        id_cols = orig_formulation_df.columns.tolist()[:2]
        recipe_names = orig_formulation_df.columns.tolist()[2:]
        
        print("\nAvailable recipes:")
        for i, recipe in enumerate(recipe_names, 1):
            print(f"{i}. {recipe}")
        
        try:
            recipe_idx = int(input("\nEnter the number of the recipe to modify: ")) - 1
            if 0 <= recipe_idx < len(recipe_names):
                base_recipe = recipe_names[recipe_idx]
                print(f"\nYou selected: {base_recipe}")
                
                # Get raw materials in this recipe
                recipe_data = orig_formulation_df[base_recipe]
                used_materials = orig_formulation_df[orig_formulation_df[base_recipe].notna()]
                
                # Convert to numeric
                recipe_data = pd.to_numeric(recipe_data, errors='coerce')
                
                print("\nCurrent recipe composition:")
                for idx, row in used_materials.iterrows():
                    mat_name = row[id_cols[1]]
                    amount = recipe_data[idx]
                    if pd.notna(amount) and amount > 0:
                        print(f"{mat_name}: {amount}")
                        new_formulation[mat_name] = amount
                
                # Allow modifications
                print("\nYou can now modify the amounts (enter new value) or add new materials.")
                modify = input("Do you want to modify any raw material amounts? (yes/no): ").lower()
                
                if modify.startswith('y'):
                    while True:
                        print("\nOptions:")
                        print("1. Change amount of an existing material")
                        print("2. Add a new material")
                        print("3. Finish and predict results")
                        
                        mod_choice = input("Enter your choice (1, 2, or 3): ")
                        
                        if mod_choice == '1':
                            # Display materials with their current amounts
                            print("\nCurrent materials:")
                            for i, (mat, amt) in enumerate(new_formulation.items(), 1):
                                print(f"{i}. {mat}: {amt}")
                            
                            mat_idx = int(input("Enter the number of the material to modify: ")) - 1
                            if 0 <= mat_idx < len(new_formulation):
                                mat_name = list(new_formulation.keys())[mat_idx]
                                new_amt = float(input(f"Enter new amount for {mat_name}: "))
                                new_formulation[mat_name] = new_amt
                                print(f"Updated {mat_name} to {new_amt}")
                        
                        elif mod_choice == '2':
                            # Display available materials
                            all_materials = orig_formulation_df[id_cols[1]].tolist()
                            print("\nAvailable raw materials:")
                            for i, mat in enumerate(all_materials, 1):
                                print(f"{i}. {mat}")
                            
                            mat_idx = int(input("Enter the number of the material to add: ")) - 1
                            if 0 <= mat_idx < len(all_materials):
                                mat_name = all_materials[mat_idx]
                                new_amt = float(input(f"Enter amount for {mat_name}: "))
                                new_formulation[mat_name] = new_amt
                                print(f"Added {mat_name} with amount {new_amt}")
                        
                        elif mod_choice == '3':
                            break
                        
                        else:
                            print("Invalid choice. Please try again.")
            else:
                print("Invalid recipe number.")
                return
                
        except (ValueError, IndexError) as e:
            print(f"Error: {str(e)}")
            return
    
    else:  # Manual entry
        print("\nEnter raw materials and their amounts. When finished, enter 'done'.")
        
        # Show available raw materials
        print("\nAvailable raw materials:")
        for i, rm in enumerate(raw_materials, 1):
            print(f"{i}. {rm}")
        
        while True:
            mat_input = input("\nEnter material number or name (or 'done' to finish): ")
            
            if mat_input.lower() == 'done':
                break
            
            try:
                # Check if input is a number
                if mat_input.isdigit():
                    idx = int(mat_input) - 1
                    if 0 <= idx < len(raw_materials):
                        material = raw_materials[idx]
                    else:
                        print("Invalid material number. Please try again.")
                        continue
                else:
                    # Input is a name
                    if mat_input in raw_materials:
                        material = mat_input
                    else:
                        # Try to find a match
                        matches = [rm for rm in raw_materials if mat_input.lower() in rm.lower()]
                        if len(matches) == 1:
                            material = matches[0]
                        elif len(matches) > 1:
                            print("Multiple matches found:")
                            for i, match in enumerate(matches, 1):
                                print(f"{i}. {match}")
                            idx = int(input("Enter the number of your choice: ")) - 1
                            if 0 <= idx < len(matches):
                                material = matches[idx]
                            else:
                                print("Invalid choice. Please try again.")
                                continue
                        else:
                            print("Material not found. Please try again.")
                            continue
                
                # Get amount
                amount = float(input(f"Enter amount for {material}: "))
                new_formulation[material] = amount
                print(f"Added {material} with amount {amount}")
                
            except (ValueError, IndexError) as e:
                print(f"Error: {str(e)}")
    
    # Check if we have any materials specified
    if not new_formulation:
        print("No raw materials specified. Cannot make predictions.")
        return
    
    # Display the final formulation
    print("\nFinal compound formulation:")
    for mat, amt in new_formulation.items():
        print(f"{mat}: {amt}")
    
    # Make predictions
    print("\nMaking predictions...")
    predictions = predict_new_formulation(models, new_formulation, formulation_matrix)
    
    # Display predictions
    print("\nPredicted test results:")
    for param, value in predictions.items():
        if isinstance(value, (int, float)):
            print(f"{param}: {value:.4f}")
        else:
            print(f"{param}: {value}")
    
    return predictions

def save_models(models, file_path):
    """Save models to disk"""
    # Create a directory for models if it doesn't exist
    model_dir = "compound_models"
    os.makedirs(model_dir, exist_ok=True)
    
    # Save each model
    for test_param, model in models.items():
        # Create a safe filename
        safe_name = "".join([c if c.isalnum() else "_" for c in test_param])
        model_path = os.path.join(model_dir, f"{safe_name}_model.joblib")
        joblib.dump(model, model_path)
    
    print(f"Saved {len(models)} models to {model_dir} directory")

def load_models(model_dir="compound_models"):
    """Load saved models from disk"""
    models = {}
    
    if not os.path.exists(model_dir):
        print(f"Model directory {model_dir} not found.")
        return models
    
    model_files = [f for f in os.listdir(model_dir) if f.endswith("_model.joblib")]
    
    if not model_files:
        print(f"No model files found in {model_dir}.")
        return models
    
    for model_file in model_files:
        try:
            # Extract test parameter name from filename
            test_param = model_file.replace("_model.joblib", "").replace("_", " ")
            
            # Load the model
            model_path = os.path.join(model_dir, model_file)
            model = joblib.load(model_path)
            
            # Store in dictionary
            models[test_param] = model
            
        except Exception as e:
            print(f"Error loading model {model_file}: {str(e)}")
    
    print(f"Loaded {len(models)} models from {model_dir}.")
    return models

# Example usage
if __name__ == "__main__":
    # Replace with your file path
    file_path = "training_dataset.xlsx"
    
    # Check if models are already saved
    if os.path.exists("compound_models") and any(f.endswith("_model.joblib") for f in os.listdir("compound_models")):
        print("Found existing models. Loading...")
        models = load_models()
        
        # We still need to load the formulation data for prediction
        formulation_df, _ = load_data(file_path)
        _, _, _, orig_formulation_df = preprocess_data(formulation_df, pd.DataFrame())
        
        # For prediction we need the formulation matrix
        id_cols = formulation_df.columns.tolist()[:2]
        recipe_names = formulation_df.columns.tolist()[2:]
        
        # Clean and prepare formulation data
        for col in recipe_names:
            formulation_df[col] = pd.to_numeric(formulation_df[col], errors='coerce')
        
        formulation_long = pd.melt(
            formulation_df, 
            id_vars=id_cols,
            value_vars=recipe_names,
            var_name='Recipe_Name',
            value_name='Composition_Amount'
        )
        
        formulation_long = formulation_long.dropna(subset=['Composition_Amount'])
        formulation_long = formulation_long[formulation_long['Composition_Amount'] > 0]
        
        formulation_matrix = formulation_long.pivot(
            index='Recipe_Name',
            columns=id_cols[1],
            values='Composition_Amount'
        ).fillna(0)
        
    else:
        # Run the main analysis
        print("Training new models...")
        models, feature_importances, formulation_matrix, orig_formulation_df = main(file_path)
        
        # Save models for future use
        if models:
            save_models(models, file_path)
    
    # Run interactive prediction
    if models:
        interactive_prediction(models, formulation_matrix, orig_formulation_df)
    else:
        print("No models available for prediction. Check your data.")