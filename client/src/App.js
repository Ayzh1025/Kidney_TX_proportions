import React, { useState } from "react";
import { motion } from "framer-motion";
import "./App.css";

const states = [
  "AL","AK","AZ","AR","CA","CO","CT",
  "DE","FL","GA","HI","ID","IL","IN","IA",
  "KS","KY","LA","ME","MD","MA","MI",
  "MN","MS","MO","MT","NE","NV","NH",
  "NJ","NM","NY","NC","ND","OH","OK",
  "OR","PA","RI","SC","SD","TN",
  "TX","UT","VT","VA","WA","WV","WI","WY"
];

const paymentTypes = ["Private", "Medicare/Medicaid", "Other"];
const genders = ["Male","Female","Other"];
const bloodType = ["O","A","B","AB","A1","A2","A1B","A2B","Unknown"];
const ethnicities = [
  "White, Non-Hispanic", "Black, Non-Hispanic", "Hispanic/Latino",
  "Asian, Non-Hispanic", "Amer Ind/Alaska Native, Non-Hispanic",
  "Native Hawaiian/other Pacific Islander, Non-Hispanic", "Multiracial, Non-Hispanic"
];
const comorbiditiesList = [
  "Diabetes","Hypertension","Cardiovascular Disease","Peripheral Vascular Disease",
  "Liver Disease","Chronic Lung Disease","Obesity","Cancer","Autoimmune Disease","Stroke"
];

export default function App() {
  const [prediction, setPrediction] = useState("");   // holds backend prediction string
  const [matchCount, setMatchCount] = useState(null);
  const [stage, setStage] = useState("form");
  const [step, setStep] = useState(0);
  const [form, setForm] = useState({
    age:"", dob:"", gender:"", bmi:"", ethnicity:[],
    paymentType:"", privateProvider:"",
    state:"", zip:"",
    comorbidities:[], diabetesType:"", hba1c:"",
    onDialysis:false, firstDialysisDate:"",
    bloodType:"",
    transplantNeeded:"", prevTransplant:false, transplantType:"", transplantDate:""
  });

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    if (type==="checkbox") {
      if(name==="ethnicity"){
        const updated = checked ? [...form.ethnicity,value] : form.ethnicity.filter(e=>e!==value);
        setForm({...form, ethnicity:updated});
      } else if(name==="comorbidities"){
        const updated = checked ? [...form.comorbidities,value] : form.comorbidities.filter(c=>c!==value);
        setForm({...form, comorbidities:updated});
      } else if(name==="onDialysis" || name==="prevTransplant"){
        setForm({...form, [name]:checked});
      }
    } else {
      setForm({...form,[name]:value});
    }
  };

  const nextStep = () => setStep(Math.min(step+1,3));
  const prevStep = () => setStep(Math.max(step-1,0));

  const handleSubmit = async (e) => {
    e.preventDefault();
    const response = await fetch("http://127.0.0.1:5000/predict", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form),
    });
    const result = await response.json();
    console.log(result);
    setPrediction(result.prediction);
    setMatchCount(result.similar_patients);
    setStage("results");
  };

  const handleNewQuery = () => {
    setForm({
      age:"", dob:"", gender:"", bmi:"", ethnicity:[],
      paymentType:"", privateProvider:"",
      state:"", zip:"",
      comorbidities:[], diabetesType:"", hba1c:"",
      onDialysis:false, firstDialysisDate:"",
      bloodType:"",
      transplantNeeded:"", prevTransplant:false, transplantType:"", transplantDate:""
    });
    setPrediction("");
    setMatchCount(null);
    setStep(0);
    setStage("form");   // back to form
  };

    if(stage==="results") {
    return (
      <div className="form-wrapper results-section">
        <div className="header-bar">
        <div className="header-container">
          <div className="header-line">KIDNEY TRANSPLANT</div>
          <div className="header-line">WAITING TIME PREDICTION</div>
        </div>
      </div>
        <h2>Results</h2>
        {prediction && <p className="result-text">{prediction}</p>}
        {matchCount !== null && <p className="result-text">Found {matchCount} matching patients.</p>}
        <button className="submit-btn" onClick={handleNewQuery}>
        Start New Query
      </button>
  </div>
    );
  }

  return (
    <>
      <div className="header-bar">
        <div className="header-container">
          <div className="header-line">KIDNEY TRANSPLANT</div>
          <div className="header-line">WAITING TIME PREDICTION</div>
        </div>
      </div>

      <div className="form-wrapper">
        {/* Progress Bar */}
        <div className="progress-bar">
          {Array.from({length:4}).map((_,i)=>(
            <div key={i} className={`progress-step ${i<=step?"completed":""}`}></div>
          ))}
        </div>

        {/* ========================== Steps ========================== */}
        <motion.div
          key={step}
          initial={{ x: 50, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          transition={{ duration: 0.4 }}
        >
          {/* Step 0: Basic Info */}
          {step === 0 && (
            <div className="form-section">
              <h2>Basic Info</h2>
              <label>Age</label>
              <input type="number" name="age" value={form.age} onChange={handleChange} className="bubble-input" />
              <label>Date of Birth</label>
              <input type="date" name="dob" value={form.dob} onChange={handleChange} className="bubble-input" />
              <label>Gender</label>
              <select name="gender" value={form.gender} onChange={handleChange} className="bubble-input">
                <option value="">Select Gender</option>
                {genders.map(g => <option key={g} value={g}>{g}</option>)}
              </select>
              <label>BMI</label>
              <input type="number" name="bmi" value={form.bmi} onChange={handleChange} className="bubble-input" />
              <label>Ethnicity (Select all that apply)</label>
              <div className="multi-select">
                {ethnicities.map(e => (
                  <span key={e} className={`bubble-option ${form.ethnicity.includes(e)?"selected":""}`}
                        onClick={()=>handleChange({target:{name:"ethnicity",value:e,type:"checkbox",checked:!form.ethnicity.includes(e)}})}>
                    {e}
                  </span>
                ))}
              </div>
              <label>Intended Payment Type</label>
              <select name="paymentType" value={form.paymentType} onChange={handleChange} className="bubble-input">
                <option value="">Payment Type</option>
                {paymentTypes.map(p => <option key={p} value={p}>{p}</option>)}
              </select>
              {form.paymentType==="Private Insurance" &&
                <input type="text" name="privateProvider" value={form.privateProvider} onChange={handleChange} className="bubble-input" placeholder="Provider Name" />
              }
            </div>
          )}

          {/* Step 1: Location */}
          {step === 1 && (
            <div className="form-section">
              <h2>Location</h2>
              <label>State</label>
              <select name="state" value={form.state} onChange={handleChange} className="bubble-input">
                <option value="">Select State</option>
                {states.map(s => <option key={s} value={s}>{s}</option>)}
              </select>
              <label>ZIP Code</label>
              <input type="number" name="zip" value={form.zip} onChange={handleChange} className="bubble-input" />
            </div>
          )}

          {/* Step 2: Medical History */}
          {step === 2 && (
            <div className="form-section">
              <h2>Medical History</h2>
              <label>Comorbidities (Select all that apply)</label>
              <div className="multi-select">
                {comorbiditiesList.map(c => (
                  <span key={c} className={`bubble-option ${form.comorbidities.includes(c)?"selected":""}`}
                        onClick={()=>handleChange({target:{name:"comorbidities",value:c,type:"checkbox",checked:!form.comorbidities.includes(c)}})}>
                    {c}
                  </span>
                ))}
              </div>
              {form.comorbidities.includes("Diabetes") &&
                <>
                  <label>Type of Diabetes</label>
                  <div className="radio-group">
                    {["Type 1","Type 2","Other"].map(d =>
                      <label key={d}><input type="radio" name="diabetesType" value={d} checked={form.diabetesType===d} onChange={handleChange}/> {d}</label>
                    )}
                  </div>
                  <input type="number" name="hba1c" value={form.hba1c} onChange={handleChange} className="bubble-input" placeholder="HbA1c"/>
                </>
              }
              <label>Blood Type</label>
              <select name="bloodType" value={form.bloodType} onChange={handleChange} className="bubble-input">
                <option value="">Blood Type</option>
                {bloodType.map(s => <option key={s} value={s}>{s}</option>)}
              </select>
            </div>
          )}

          {/* Step 3: Transplant Info */}
          {step === 3 && (
            <div className="form-section">
              <h2>Transplant Info</h2>
              <label>Type Needed</label>
              <select name="transplantNeeded" value={form.transplantNeeded} onChange={handleChange} className="bubble-input">
                <option value="">Type Needed</option>
                <option>Living Donor</option>
                <option>Deceased Donor</option>
                <option>Open to Both</option>
              </select>
            </div>
          )}
        </motion.div>

        <div className="form-nav">
          {step>0 && <button className="nav-btn" onClick={prevStep}>Back</button>}
          {step<3 ? <button className="nav-btn" onClick={nextStep}>Next</button> : <button className="submit-btn" onClick={handleSubmit}>Submit</button>}
        </div>

        
      </div>
    </>
  );
}


