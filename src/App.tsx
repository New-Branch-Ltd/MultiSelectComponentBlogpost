import { noop } from "lodash";
import React from "react";
import "./App.css";
import MultiIntervalSelect from "./MultiIntervalSelect";

function App() {
  return (
    <div className="App">
      <MultiIntervalSelect
        domain={{ min: 0, max: 1000 }}
        width={500}
        height={200}
        initialValue={[{ min: 0, max: 200 }]}
        onChange={noop}
      />
    </div>
  );
}

export default App;
