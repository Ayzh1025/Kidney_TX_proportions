import React, { useState } from "react";

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



export default function App() {
  const [prediction, setPrediction] = useState("");   // holds backend prediction string
  const [matchCount, setMatchCount] = useState(null);
  const [percentage, setPercentage] = useState(null);
  const [summary, setSummary] = useState(null);
  const [stage, setStage] = useState("form");
  const [form, setForm] = useState({
    age:"", gender:"", bmi:"", ethnicity:[],
    paymentType:"", 
    state:"", region: "", diabetesType:"", hba1c:"", cpra:"",
    onDialysis:false, firstDialysisDate:"",
    bloodType:""
  });

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    if (type==="checkbox") {
      if(name==="ethnicity"){
        const updated = checked ? [...form.ethnicity,value] : form.ethnicity.filter(e=>e!==value);
        setForm({...form, ethnicity:updated});
      } 
    } else {
      setForm({...form,[name]:value});
    }
  };


  const handleSubmit = async (e) => {
    e.preventDefault();
    const response = await fetch("http://127.0.0.1:5000/predict", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form),
    });
    const result = await response.json();
    console.log(result);
    setMatchCount(result.similar_patients);
    setPercentage(result.percentage);
    setSummary(result.summary);
    setStage("results");
  };

  const handleNewQuery = () => {
    setForm({
      age:"", gender:"", bmi:"", ethnicity:[],
    paymentType:"", 
    state:"", region: "", diabetesType:"", hba1c:"", cpra:"",
    onDialysis:false, firstDialysisDate:"",
    bloodType:""
    });
    setPrediction("");
    setMatchCount(null);

    setStage("form");   // back to form
  };

    if(stage==="results") {
    return (
      <div className="form-wrapper results-section">
        <div className="header-bar">
        <div className="header-container">
          <div className="header-line">PATIENTS</div>
          <div className="header-line">LIKE ME</div>
        </div>
      </div>
        <h2>Results</h2>
        {summary && (
        <div className="summary-box">
          <h3 className="summary-title">Your Selected Criteria:</h3>
          <ul className="summary-list">
            {Object.entries(summary).map(([key, value]) => (
              <li key={key} className="summary-item">
                <strong>{key}:</strong> {value || "Not Selected"}
              </li>
            ))}
          </ul>
        </div>
        )}
        {matchCount !== null && <p className="result-text">Found {matchCount} matching patients out of 89,928. Percentage : {percentage}% </p>}
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
          <div className="header-line">PATIENTS</div>
          <div className="header-line">LIKE ME</div>
        </div>
      </div>
      <div className="form-wrapper">
            <div className="form-section">
              <h2>Basic Info</h2>
              <label>Age</label>
              <input type="number" name="age" value={form.age} onChange={handleChange} className="bubble-input" />
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
              <label>State</label>
              <select name="state" value={form.state} onChange={handleChange} className="bubble-input">
                <option value="">Select State</option>
                {states.map(s => <option key={s} value={s}>{s}</option>)}
              </select>
              <label>UNOS Region</label>
              <input type="number" name="region" value={form.region} onChange={handleChange} className="bubble-input" />
            </div>
            
          
            <div className="form-section">
              <h2>Medical History</h2>
              
              <label>Diabetes Status</label>
                  <div className="radio-group">
                    {["None","Type 1","Type 2","Other"].map(d =>
                      <label key={d}><input type="radio" name="diabetesType" value={d} checked={form.diabetesType===d} onChange={handleChange}/> {d}</label>
                    )}
                  </div>
                  <input type="number" name="hba1c" value={form.hba1c} onChange={handleChange} className="bubble-input" placeholder="HbA1c"/>
                
                  
              <label>Blood Type</label>
              <select name="bloodType" value={form.bloodType} onChange={handleChange} className="bubble-input">
                <option value="">Blood Type</option>
                {bloodType.map(s => <option key={s} value={s}>{s}</option>)}
              </select>
              <label>cPRA</label>
              <input type="number" name="cpra" value={form.cpra} onChange={handleChange} className="bubble-input" />
            </div>
            <button className="submit-btn" onClick={handleSubmit}>Submit</button>
      </div>
    </>
  );
}


