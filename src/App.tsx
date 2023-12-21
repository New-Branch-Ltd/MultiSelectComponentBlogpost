import React, { useRef, useState } from 'react';
import Interval from './Interval';
import './App.css';
import { CONTAINER_WIDTH, IntervalType } from './domain';

function App() {
  const [intervals, setIntervals] = useState<IntervalType[]>([{min: 50, max: 180}, {min: 344, max: 655}])
  const containerRef = useRef<HTMLDivElement | null>(null);

  function onIntervalChange(interval: IntervalType) {
    return (newInterval: IntervalType) => {
      setIntervals(intervals.map(i => i === interval ? newInterval : i))
    }
  }

  return (
    <div className="App">
      <h1>Multi-Interval Selector</h1>

      <div ref={containerRef} className="container" style={{width: `${CONTAINER_WIDTH}px`}}>
        {intervals.map((i, ind) => <Interval onChange={onIntervalChange(i)} key={ind} interval={i} containerRef={containerRef} />)}
      </div>
    </div>
  );
}

export default App;
