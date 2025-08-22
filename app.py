import pandas as pd
from flask import Flask, request, jsonify
from flask_cors import CORS
import pandas as pd
import pickle
import numpy as np
from datetime import datetime

app = Flask(__name__)
CORS(app)

BASE_DIR = os.path.dirname(__file__)
DATA_PATH = os.path.join(BASE_DIR, "data", "Waitinglist.csv")

df = pd.read_csv(DATA_PATH)

def filter_data(df, **filters):
    print(filters)
    filtered = df.copy()
    for col, val in filters.items():
        if val is None or val == "" or val == []:  # skip if empty
            continue
        if isinstance(val, list):
            filtered = filtered[filtered[col].isin(val)]
        else:
            filtered = filtered[filtered[col] == val]
    return filtered.shape[0]

# Load your model here when ready
# model = pickle.load(open('kidney_model.pkl', 'rb'))

@app.route('/predict', methods=['POST'])
def predict():
    print("predict reached")
    data = request.json

    # Extract data
    age = float(data.get("age")) if data.get("age") else None
    bmi = float(data.get("bmi")) if data.get("bmi") else None
    # Convert BMI to BMI category
    bmi_cat = None
    if bmi is not None:
        if 0 < bmi <= 18.5:
            bmi_cat = 1
        elif 18.5 < bmi <= 29.9:
            bmi_cat = 2
        elif 29.9 < bmi <= 34.9:
            bmi_cat = 3
        elif 35 <= bmi <= 39.9:
            bmi_cat = 4
        elif bmi >= 40:
            bmi_cat = 5

    gender = data.get("gender")
    if gender == "Male":
        gender = "M"
    elif gender == "Female":
        gender = "F"
    else:
        gender = None 
    
    state = data.get("state")
    hba1c = float(data.get("hba1c")) if data.get("hba1c") else None
    on_dialysis = int(data.get("onDialysis")) if data.get("onDialysis") not in [None, ""] else None
    first_dialysis_date = data.get("firstDialysisDate")
    donor_type = data.get("donorType")
    payment_type = data.get("paymentType")
    blood_type = data.get("bloodType")
    ethnicity = data.get("ethnicity")
    prev_transplant = int(data.get("prevTransplant")) if data.get("prevTransplant") not in [None, ""] else None

    # Example: convert date to "days since dialysis started"
    if first_dialysis_date:
        days_since_dialysis = (datetime.now() - datetime.strptime(first_dialysis_date, "%Y-%m-%d")).days
    else:
        days_since_dialysis = None

    ethnicity_map = {
        "White, Non-Hispanic": 1,
        "Black, Non-Hispanic": 2,
        "Hispanic/Latino": 4,
        "Asian, Non-Hispanic": 5,
        "Amer Ind/Alaska Native, Non-Hispanic": 6,
        "Native Hawaiian/other Pacific Islander, Non-Hispanic": 7,
        "Multiracial, Non-Hispanic": 9,
        "Unknown": 998
    }

    eth_cat = None
    if ethnicity:
        if isinstance(ethnicity, list) and len(ethnicity) > 0:
            eth_cat = ethnicity_map.get(ethnicity[0], 998)  # take first if multiple selected
        else:
            eth_cat = ethnicity_map.get(ethnicity, 998)

    filters = {
    "INIT_AGE": age,
    "BMI_CAT": bmi_cat,
    "GENDER": gender,
    "PERM_STATE": state,
    "ABO": blood_type,
    "ETHCAT": eth_cat,
    "PAYC_CAT": payment_type
    }
    similar_patients = filter_data(df, **filters)
    print(similar_patients)

    # Placeholder prediction — replace with your model
    # Example: model.predict([[age, bmi, hba1c, days_since_dialysis, ...]])
    prediction = ""

    return jsonify({'prediction': prediction, 'similar_patients': similar_patients})

@app.route('/ping')
def ping():
    return "pong"
if __name__ == '__main__':
    app.run(debug=True)


