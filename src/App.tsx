import React, { useRef, useState } from 'react';
import Interval from './Interval';
import './App.css';
import { CONTAINER_WIDTH } from './constants';

interface IntervalType {
  min: number;
  max: number;
}

function App() {
  const [intervals, setIntervals] = useState<IntervalType[]>([{min: 50, max: 733}])
  const containerRef = useRef<HTMLDivElement | null>(null);

  function onIntervalChange(i: IntervalType) {
    return (newMin: number, newMax: number) => {
      setIntervals(intervals.map(ri => ri === i ? {min: newMin, max: newMax} : ri))
    }
  }

  return (
    <div className="App">
      <h1>Multi-Interval Selector</h1>

      <div ref={containerRef} className="container" style={{width: `${CONTAINER_WIDTH}px`}}>
        {intervals.map((i, ind) => <Interval onChange={onIntervalChange(i)} key={ind} min={i.min} max={i.max} containerRef={containerRef} />)}
      </div>
    </div>
  );
}

export default App;
