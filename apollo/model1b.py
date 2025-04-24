import pandas as pd
import numpy as np
from sklearn.ensemble import RandomForestRegressor
from sklearn.model_selection import train_test_split
from sklearn.metrics import mean_absolute_error
import sys
import unicodedata
if sys.platform == "win32":
    sys.stdout.reconfigure(encoding='utf-8', errors='replace')
def normalize_text(text):
    if isinstance(text, str):
        # Normalize Unicode characters
        return unicodedata.normalize('NFKD', text).encode('ascii', 'ignore').decode('ascii')
    return text
# Load the dataset
file_path = "training_dataset.xlsx"
xls = pd.ExcelFile(file_path)

# Read input (Compound Formulation) and output (Compound Evaluation Report)
compound_formulation = pd.read_excel(xls, sheet_name="Compound_Formulation")
compound_evaluation = pd.read_excel(xls, sheet_name="Compound_Evaluation_Report")

# Clean data: Convert empty cells and non-breaking spaces to NaN
compound_formulation.replace(['', '\xa0', ' '], np.nan, inplace=True)
compound_evaluation.replace(['', '\xa0', ' '], np.nan, inplace=True)

# Ensure all numeric columns are properly converted to float
for col in compound_formulation.columns[2:]:
    compound_formulation[col] = pd.to_numeric(compound_formulation[col], errors='coerce')

for col in compound_evaluation.columns[1:]:
    compound_evaluation[col] = pd.to_numeric(compound_evaluation[col], errors='coerce')

# Pivot data to have Raw Materials as features
# Use future_stack=True to avoid deprecation warning
formulation_pivot = compound_formulation.pivot(index="SAP Code", columns="Raw Material Name", values=list(compound_formulation.columns[2:]))
formulation_pivot = formulation_pivot.stack(future_stack=True).reset_index(level=1).fillna(0)  # NaN means raw material not used, so 0
formulation_pivot = formulation_pivot.groupby("Raw Material Name").sum().T

evaluation_T = compound_evaluation.set_index("Test Parameters").T

# Ensure index matches for training
common_indices = formulation_pivot.index.intersection(evaluation_T.index)
formulation_pivot = formulation_pivot.loc[common_indices]
evaluation_T = evaluation_T.loc[common_indices]

# Convert to numeric data and ensure all values are float
X = formulation_pivot.reset_index(drop=True).astype(float)
y = evaluation_T.reset_index(drop=True)

# Only use rows and columns without NaN values
# For each test parameter, train a separate model using only samples where the parameter was tested
models = {}
mae_scores = {}

for param in y.columns:
    # Filter out rows where this test parameter has NaN results
    valid_indices = ~y[param].isna()
    
    if sum(valid_indices) > 5:  # Only train if we have enough data points
        X_param = X.loc[valid_indices]
        y_param = y.loc[valid_indices, param]
        
        # Ensure all values are numeric
        y_param = pd.to_numeric(y_param, errors='coerce')
        
        # Remove any remaining NaN values
        valid_rows = ~y_param.isna()
        X_param = X_param.loc[valid_rows]
        y_param = y_param.loc[valid_rows]
        
        if len(X_param) < 5:
            print(f"Insufficient data to train model for {param} after cleaning")
            continue
            
        try:
            # Split into training and testing sets
            X_train, X_test, y_train, y_test = train_test_split(X_param, y_param, test_size=0.2, random_state=42)
            
            # Train a RandomForestRegressor model
            model = RandomForestRegressor(n_estimators=100, random_state=42)
            model.fit(X_train, y_train)
            
            # Evaluate model
            y_pred = model.predict(X_test)
            mae = mean_absolute_error(y_test, y_pred)
            print(f"Model for {param} trained with Mean Absolute Error: {mae:.2f}")
            
            models[param] = model
            mae_scores[param] = mae
        
        except Exception as e:
            print(f"Error training model for {param}: {e}")
    else:
        print(f"Insufficient data to train model for {param}")

# Function to take user input and predict results
def predict_evaluation():
    user_input = {rm: 0 for rm in X.columns}
    
    print("\nAvailable raw materials:")
    for i, rm in enumerate(X.columns):
        print(f"{i+1}. {rm}")
    
    num_materials = int(input("\nEnter the number of raw materials: "))
    for _ in range(num_materials):
        rm_index = int(input("Enter raw material number from the list: ")) - 1
        if 0 <= rm_index < len(X.columns):
            raw_material = X.columns[rm_index]
            value = float(input(f"Proportion of {raw_material}: "))
            user_input[raw_material] = value
        else:
            print("Invalid material number. Skipping.")
    
    user_df = pd.DataFrame([user_input])
    
    print("\nPredicted Compound Evaluation Report:")
    for param in models:
        prediction = models[param].predict(user_df)
        print(f"{param}: {prediction[0]:.2f}")

# Call the function to predict
if models:  # Only offer prediction if at least one model was successfully trained
    target_user_input = input("Do you want to predict evaluation for a new formulation? (yes/no): ")
    if target_user_input.lower() == "yes":
        predict_evaluation()
else:
    print("No models were successfully trained. Cannot make predictions.")
