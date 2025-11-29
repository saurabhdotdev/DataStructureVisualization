import React, { useEffect, useRef, useState } from "react";
import "./App.css";


function genBubble(arr) {
  const a = arr.slice();
  const actions = [];
  for (let i = 0; i < a.length; i++) {
    for (let j = 0; j < a.length - 1 - i; j++) {
      actions.push({ type: "compare", i: j, j: j + 1 });
      if (a[j] > a[j + 1]) {
        actions.push({ type: "swap", i: j, j: j + 1 });
        const t = a[j]; a[j] = a[j + 1]; a[j + 1] = t;
      }
    }
  }
  return actions;
}

function genSelection(arr) {
  const a = arr.slice();
  const actions = [];
  for (let i = 0; i < a.length; i++) {
    let min = i;
    for (let j = i + 1; j < a.length; j++) {
      actions.push({ type: "compare", i: min, j });
      if (a[j] < a[min]) min = j;
    }
    if (min !== i) {
      actions.push({ type: "swap", i, j: min });
      const t = a[i]; a[i] = a[min]; a[min] = t;
    }
  }
  return actions;
}

function genLinearSearch(arr, target) {
  const a = arr.slice();
  const actions = [];
  for (let i = 0; i < a.length; i++) {
    actions.push({ type: "compare", i, j: null });
    if (a[i] === target) {
      actions.push({ type: "found", i });
      return actions;
    }
  }
  return actions;
}

function genBinarySearch(arr, target) {
  const a = arr.slice();
  const actions = [];
  let lo = 0, hi = a.length - 1;
  while (lo <= hi) {
    const mid = Math.floor((lo + hi) / 2);
    actions.push({ type: "compare", i: mid, j: null });
    if (a[mid] === target) {
      actions.push({ type: "found", i: mid });
      return actions;
    } else if (a[mid] < target) {
      lo = mid + 1;
    } else {
      hi = mid - 1;
    }
  }
  return actions;
}

export default function App() {
  const [inputs, setInputs] = useState([12, 4, 8, 1, 7]);
  const [algorithm, setAlgorithm] = useState("bubble"); 
  const [actions, setActions] = useState([]); 
  const [pos, setPos] = useState(0); 
  const [playing, setPlaying] = useState(false);
  const [highlight, setHighlight] = useState(null); 
  const [current, setCurrent] = useState(inputs.slice()); 
  const speedRef = useRef(350);
  const timerRef = useRef(null);
  const snapshotRef = useRef(inputs.slice()); 
  const [searchTarget, setSearchTarget] = useState("");
  const [searchAlgo, setSearchAlgo] = useState("linear");
  const [mode, setMode] = useState("sort"); 
  const [message, setMessage] = useState("");

  useEffect(() => {
    setCurrent(inputs.slice().map(x => Number(x) || 0));
    snapshotRef.current = inputs.slice().map(x => Number(x) || 0);
    setActions([]);
    setPos(0);
    setPlaying(false);
    setHighlight(null);
  }, [inputs]);

  useEffect(() => {
    if (playing && pos < actions.length) {
      timerRef.current = setTimeout(() => stepForward(), speedRef.current);
      return () => clearTimeout(timerRef.current);
    } else {
      clearTimeout(timerRef.current);
    }
  }, [playing, pos, actions, speedRef.current]);

  function prepareSort() {
    setPlaying(false);
    setPos(0);
    setHighlight(null);
    const arr = current.slice();
    const gen = algorithm === "bubble" ? genBubble(arr) : genSelection(arr);
    setActions(gen);
    setMode("sort");
    setMessage(`Prepared ${gen.length} actions for ${algorithm}.`);
  }
   
  function prepareSearch() {
    setPlaying(false);
    setPos(0);
    setHighlight(null);
    const arr = current.slice().map(x => Number(x) || 0);
    const target = Number(searchTarget);
    if (Number.isNaN(target)) {
      setMessage("Enter a valid number to search.");
      return;
    }
    
    if (searchAlgo === "binary") {
      let sorted = true;
      for (let i = 1; i < arr.length; i++) if (arr[i] < arr[i - 1]) { sorted = false; break; }
      if (!sorted) {
        setMessage("Array is not sorted — binary search requires sorted array.");
        return;
      }
    }
    const gen = searchAlgo === "linear" ? genLinearSearch(arr, target) : genBinarySearch(arr, target);
    if (gen.length === 0) {
      setMessage("Target not found (no comparisons or not present).");
    } else {
      setMessage(`Prepared ${gen.length} actions for ${searchAlgo} search.`);
    }
    setActions(gen);
    setMode("search");
  }

  function stepForward() {
    if (pos >= actions.length) {
      setPlaying(false);
      setHighlight(null);
      return;
    }
    const act = actions[pos];
    setHighlight(act);
    setPos(p => p + 1);

    setCurrent(prev => {
      const copy = prev.slice();
      if (act.type === "swap") {
        const t = copy[act.i];
        copy[act.i] = copy[act.j];
        copy[act.j] = t;
      }
      return copy;
    });

    if (act.type === "found") {
      setPlaying(false);
      setMessage(`Found target at index ${act.i}`);
    }
  }

  function playPause() {
    if (actions.length === 0) {
      setMessage("Prepare first (Sort or Search).");
      return;
    }
    setPlaying(p => !p);
  }

  function resetAll() {
    setPlaying(false);
    setActions([]);
    setPos(0);
    setCurrent(snapshotRef.current.slice());
    setHighlight(null);
    setMessage("");
    setMode("sort");
  }

  function updateInput(idx, value) {
    const v = value.trim() === "" ? "" : Number(value);
    setInputs(prev => prev.map((x, i) => (i === idx ? v : x)));
  }
  function addBox() { setInputs(prev => [...prev, 0]); }
  function removeBox(i) { setInputs(prev => prev.filter((_, idx) => idx !== i)); }

  return (
    <div className="svc-root">
      <header className="svc-header">

  <div style={{ marginBottom: "20px" }}>
    <h1
      style={{
        fontSize: "32px",
        marginBottom: "6px",
        background: "linear-gradient(90deg, #4f46e5, #06b6d4)",
        WebkitBackgroundClip: "text",
        WebkitTextFillColor: "transparent",
        cursor:"pointer",
        fontWeight: "700"   }}>
      Sorting + Searching
    </h1>
  </div>

  <div className="controls">
          <div className="control-block">
            <div className="label" style={{fontStyle:"italic", cursor:"pointer"}}>Sort algorithm</div>
            <br>
            </br>
            <select value={algorithm} onChange={e => setAlgorithm(e.target.value)}>
              <option value="bubble" style={{cursor:"pointer"}}>Bubble</option>
              <option value="selection" style={{cursor:"pointer"}}>Selection</option>
            </select>
            <button onClick={prepareSort}>Prepare Sort</button>
          </div>
          <div className="control-block">
            <div className="label" style={{fontStyle:"italic", cursor:"pointer"}}>Search</div>
            <input className="search-input" placeholder="target" value={searchTarget} onChange={e => setSearchTarget(e.target.value)} />
            <select value={searchAlgo} onChange={e => setSearchAlgo(e.target.value)}>
              <option value="linear">Linear</option>
              <br></br>
              <option value="binary">Binary (requires sorted array)</option>
            </select>
            <br></br>
            <button onClick={prepareSearch}>Prepare Search</button>
          </div>
          <div className="control-block">
            <div className="label" style={{fontStyle:"italic", cursor:"pointer"}}>Speed</div>
            <input style={{cursor:"pointer"}} type="range" min="80" max="800" defaultValue={350} onChange={e => { speedRef.current = Number(e.target.value); }} />
          </div>
<br></br>
          <div className="btn-row">
            <button onClick={playPause}>{playing ? "Pause" : "Play"}</button>
            <button onClick={() => stepForward()}>Step</button>
            <button onClick={resetAll}>Reset</button>
          </div>
        </div>
      </header><br></br>
 <button style ={{alignItems:"anchor-center"}}>Sum: {current.reduce((a,b)=>a+b,0)}</button >

      <section className="boxes">
        {inputs.map((val, i) => (
          <div key={i} className="box">
            <input value={val} onChange={e => updateInput(i, e.target.value)} inputMode="numeric" aria-label={`value ${i}`} />
            <div className="box-actions">
              <button onClick={() => removeBox(i)} title="Remove">−</button>
            </div>
          </div>
        ))}
        <div className="box add-box" onClick={addBox}>+ Add</div>
      </section>
<br></br>
<button onClick={() => setInputs([...inputs].sort((a,b)=>b-a))}>
  Reverse<br></br>
</button>

     <button onClick={() => {
  const a=[...inputs];
  for(let i=0;i<3;i++){
    const x=Math.floor(Math.random()*a.length);
    const y=Math.floor(Math.random()*a.length);
    [a[x],a[y]]=[a[y],a[x]];
  }
  setInputs(a);
}}>Slight Shuffle</button>
<br></br>
      <section className="visual">
        <div className="bar-row" role="list" aria-label="array visualization">
          {current.map((v, i) => {
            const isCompare = highlight && highlight.type === "compare" && (highlight.i === i || highlight.j === i);
            const isSwap = highlight && highlight.type === "swap" && (highlight.i === i || highlight.j === i);
            const isFound = highlight && highlight.type === "found" && highlight.i === i;
            return (
              <div key={i}
              className={`vis-bar ${isCompare ? "compare" : ""} ${isSwap ? "swap" : ""} ${isFound ? "found" : ""}`}
              style={{ height: v * 9 + "px" }}>
              <div className="val">{v}</div>
              </div>
            );
          })}
        </div>

        <div className="status">
         
          <div>Mode: {mode} <br></br>Actions: {actions.length}</div>
          <div>Step: {pos}/{actions.length}</div>
          <div>Length: {current.length}</div> 
          <div className="message">{message}</div>
          <div>Action: {highlight?.type || "none"}</div>
          <div>Algorithm: {algorithm}</div>
          <div>Current Mode: {mode}</div>

        </div>
      </section>

    </div>
  );
}
