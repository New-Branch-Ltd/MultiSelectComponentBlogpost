import React, { useState } from 'react';
import Interval from './Interval';
import './App.css';
import { CONTAINER_WIDTH } from './constants';

interface IntervalType {
  min: number;
  max: number;
}

function App() {
  const [intervals, setIntervals] = useState<IntervalType[]>([{min: 0, max: 1000}])

  return (
    <div className="App">
      <h1>Multi-Interval Selector</h1>

      <div className="container" style={{width: `${CONTAINER_WIDTH}px`}}>
        {intervals.map((i, ind) => <Interval key={ind} min={i.min} max={i.max} />)}
      </div>
    </div>
  );
}

export default App;
