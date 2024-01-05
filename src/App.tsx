import { noop } from "lodash";
import React from "react";
import "./App.css";
import MultiInterval from "./MultiInterval";

function App() {
  return (
    <div className="App">
      <MultiInterval
        domain={{ min: 0, max: 1000 }}
        container={{ width: 500, height: 200 }}
        initial={[{ min: 0, max: 1000 }]}
        onChange={noop}
      />
    </div>
  );
}

export default App;
