import React, { useState, useRef } from "react";
import html2pdf from 'html2pdf.js'; // Import html2pdf.js
import "./App.css";



// --- State abbreviation mapping ---
const statesMap = {
  "Alabama": "AL",
  "Alaska": "AK",
  "Arizona": "AZ",
  "Arkansas": "AR",
  "California": "CA",
  "Colorado": "CO",
  "Connecticut": "CT",
  "Delaware": "DE",
  "Florida": "FL",
  "Georgia": "GA",
  "Hawaii": "HI",
  "Idaho": "ID",
  "Illinois": "IL",
  "Indiana": "IN",
  "Iowa": "IA",
  "Kansas": "KS",
  "Kentucky": "KY",
  "Louisiana": "LA",
  "Maine": "ME",
  "Maryland": "MD",
  "Massachusetts": "MA",
  "Michigan": "MI",
  "Minnesota": "MN",
  "Mississippi": "MS",
  "Missouri": "MO",
  "Montana": "MT",
  "Nebraska": "NE",
  "Nevada": "NV",
  "New Hampshire": "NH",
  "New Jersey": "NJ",
  "New Mexico": "NM",
  "New York": "NY",
  "North Carolina": "NC",
  "North Dakota": "ND",
  "Ohio": "OH",
  "Oklahoma": "OK",
  "Oregon": "OR",
  "Pennsylvania": "PA",
  "Rhode Island": "RI",
  "South Carolina": "SC",
  "South Dakota": "SD",
  "Tennessee": "TN",
  "Texas": "TX",
  "Utah": "UT",
  "Vermont": "VT",
  "Virginia": "VA",
  "Washington": "WA",
  "West Virginia": "WV",
  "Wisconsin": "WI",
  "Wyoming": "WY"
};
const stateNames = Object.keys(statesMap);


// --- UNOS transplant region mapping ---
const unosMap = {
  "Region 1 – Connecticut, Maine, Massachusetts, New Hampshire, Rhode Island, Eastern Vermont": 1,
  "Region 2 – Delaware, District of Columbia, Maryland, New Jersey, Pennsylvania, West Virginia, Northern Virginia": 2,
  "Region 3 – Alabama, Arkansas, Florida, Georgia, Louisiana, Mississippi, Puerto Rico": 3,
  "Region 4 – Oklahoma, Texas": 4,
  "Region 5 – Arizona, California, Nevada, New Mexico, Utah": 5,
  "Region 6 – Alaska, Hawaii, Idaho, Montana, Oregon, Washington": 6,
  "Region 7 – Illinois, Minnesota, North Dakota, South Dakota, Wisconsin": 7,
  "Region 8 – Colorado, Iowa, Kansas, Missouri, Nebraska, Wyoming": 8,
  "Region 9 – New York, Western Vermont": 9,
  "Region 10 – Indiana, Michigan, Ohio": 10,
  "Region 11 – Kentucky, North Carolina, South Carolina, Southern Ohio, Tennessee, Virginia": 11
};

// Extract friendly names for dropdown
const unosNames = Object.keys(unosMap);



// --- Fixed option lists ---
const paymentTypes = ["Private", "Medicaid/Medicare", "Other"];
const genders = ["Male","Female","Other"];
const bloodType = ["O","A","B","AB","A1","A2","A1B","A2B","Unknown"];
const ethnicities = [
  "White, Non-Hispanic", "Black, Non-Hispanic", "Hispanic/Latino",
  "Asian, Non-Hispanic", "Amer Ind/Alaska Native, Non-Hispanic",
  "Native Hawaiian/other Pacific Islander, Non-Hispanic", "Multiracial, Non-Hispanic"
];

const diabetesTypes = ["None", "Type I", "Type II", "Other"]


// --- Custom multi-select dropdown component ---
function MultiSelectDropdown({ options, selected, setSelected }) {
  const toggleOption = (option) => {
    if (selected.includes(option)) {
      setSelected(selected.filter((o) => o !== option));
    } else {
      setSelected([...selected, option]);
    }
  };

  return (
    <div className="multi-select-dropdown-container">
      <div className="dropdown-menu">
        {options.map((option) => (
          <div
            key={option}
            className={`dropdown-option ${selected.includes(option) ? "selected" : ""}`}
            onClick={() => toggleOption(option)}
          >
            {option}
          </div>
        ))}
      </div>
      {selected.length > 0 && (
        <button
          type="button"
          className="deselect-btn"
          onClick={() => setSelected([])}
        >
          Deselect All
        </button>
      )}
    </div>
  );
}

export default function App() {
  // --- State variables for app flow ---
  const [prediction, setPrediction] = useState("");   // holds backend prediction string
  const [matchCount, setMatchCount] = useState(null);
  const [percentage, setPercentage] = useState(null);
  const [summary, setSummary] = useState(null);
  const [stage, setStage] = useState("form");

   // --- State for form inputs ---
  const [form, setForm] = useState({
    age:"", gender:"", bmi:"", ethnicity:[],
    paymentType:"", 
    state:[], region: [], diabetesType:[], hba1c:"", cpra:"",
    onDialysis:false, firstDialysisDate:"",
    bloodType:[]
  });
// Handle <select multiple> for states
 const handleSelectChange = (e) => {
  const selectedOptions = Array.from(e.target.selectedOptions, (option) => option.value);
  setForm({ ...form, state: selectedOptions });
};
// Generic handler for form inputs (text, number, checkbox, etc.)
  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    // Handle multi-select checkboxes (ethnicity, diabetesType, bloodType)
    if (type==="checkbox") {
      if(name==="ethnicity"){
        const updated = checked ? [...form.ethnicity,value] : form.ethnicity.filter(e=>e!==value);
        setForm({...form, ethnicity:updated});
      } else if (name==="diabetesType"){
        const updated = checked ? [...form.diabetesType,value] : form.diabetesType.filter(e=>e!==value);
        setForm({...form, diabetesType:updated});
      } else if (name==="bloodType"){
        const updated = checked ? [...form.bloodType,value] : form.bloodType.filter(e=>e!==value);
        setForm({...form, bloodType:updated});
      } 
    } else {
      setForm({...form,[name]:value});
    }
  };


  // Submit form -> send request to backend -> get results
  const handleSubmit = async (e) => {
    e.preventDefault();
    const response = await fetch("https://kidney-backend.onrender.com/predict", {
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
  // Reset app state -> start new query
  const handleNewQuery = () => {
    setForm({
      age:"", gender:"", bmi:"", ethnicity:[],
    paymentType:"", 
    state:[], region: [], diabetesType:[], hba1c:"", cpra:"",
    onDialysis:false, firstDialysisDate:"",
    bloodType:[]
    });
    setPrediction("");
    setMatchCount(null);

    setStage("form");   // back to form
  };
  // Create a ref to target the content for PDF conversion
const contentRef = useRef(null);

// Function to generate PDF
const generatePDF = () => {
const element = contentRef.current;
const opt = {
margin: 1,
filename: 'results.pdf',
image: { type: 'jpeg', quality: 0.98 },
html2canvas: { scale: 2 },
jsPDF: { unit: 'in', format: 'letter', orientation: 'portrait' }
};
html2pdf().set(opt).from(element).save();
};

    // --- Results Page ---
    if(stage==="results") {
    return (
      <div className="form-wrapper results-section">
        <div className="header-bar">
        <div className="header-container">
          <div className="header-line">PATIENTS</div>
          <div className="header-line">LIKE ME</div>
        </div>
      </div>
      <div ref={contentRef}>
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
        </div>
        <div className="button-row">
          <button className="submit-btn" onClick={handleNewQuery}>
          Start New Query
          </button>
          <button className="submit-btn" onClick={generatePDF}>Download PDF</button>
        </div>
        
        
  </div>
    );
  }
 // --- Form Page ---
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
              <input type="number" name="age" value={form.age} onChange={handleChange} className="short-input" />
              <label>Gender</label>
              <select name="gender" value={form.gender} onChange={handleChange} className="short-input">
                <option value="">Select Gender</option>
                {genders.map(g => <option key={g} value={g}>{g}</option>)}
              </select>
              <label>BMI</label>
              <input type="number" name="bmi" value={form.bmi} onChange={handleChange} className="short-input" />
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

             <label>State </label>
<MultiSelectDropdown
  options={stateNames}               // all states
  selected={form.state}          // currently selected states
  setSelected={(newSelection) => setForm({ ...form, state: newSelection })}
/>
              <label>Region </label>
<MultiSelectDropdown
  options={unosNames}               // all states
  selected={form.region}          // currently selected states
  setSelected={(newSelection) => setForm({ ...form, region: newSelection })}
/>
           


            </div>
            
          
            <div className="form-section">
              <h2>Medical History</h2>
              <label>Diabetes </label>
              <div className="multi-select">
                {diabetesTypes.map(e => (
                  <span key={e} className={`bubble-option ${form.diabetesType.includes(e)?"selected":""}`}
                        onClick={()=>handleChange({target:{name:"diabetesType",value:e,type:"checkbox",checked:!form.diabetesType.includes(e)}})}>
                    {e}
                  </span>
                ))}
              </div>
              
                  <input type="number" name="hba1c" value={form.hba1c} onChange={handleChange} className="short-input" placeholder="HbA1c"/>
                
              <label>Blood Type </label>
              <div className="multi-select">
                {bloodType.map(e => (
                  <span key={e} className={`bubble-option ${form.bloodType.includes(e)?"selected":""}`}
                        onClick={()=>handleChange({target:{name:"bloodType",value:e,type:"checkbox",checked:!form.bloodType.includes(e)}})}>
                    {e}
                  </span>
                ))}
              </div>    
              {/* <label>Blood Type</label>
              <select name="bloodType" value={form.bloodType} onChange={handleChange} className="short-input">
                <option value="">Blood Type</option>
                {bloodType.map(s => <option key={s} value={s}>{s}</option>)}
              </select> */}
              <label>cPRA</label>
              <input type="number" name="cpra" value={form.cpra} onChange={handleChange} className="short-input" />
            </div>
            
            <button className="submit-btn" onClick={handleSubmit} style={{ marginTop: "20px" }}>
              Submit
              </button>
      </div>
    </>
  );
}


