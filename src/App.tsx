import React, { useRef, useState } from "react";
import Interval from "./Interval";
import "./App.css";
import { CONTAINER_WIDTH, INTERVAL_MAX, INTERVAL_MIN, IntervalType, getBackgroundImageForIntervals } from "./domain";

function App() {
  const [intervals, setIntervals] = useState<IntervalType[]>([
    { min: 50, max: 180 },
    { min: 344, max: 655 },
  ]);
  const containerRef = useRef<HTMLDivElement | null>(null);

  function onIntervalChange(interval: IntervalType) {
    return (newInterval: IntervalType) => {
      const currentIntervalIndex = intervals.findIndex(i => i === interval);
      const previousInterval = intervals[currentIntervalIndex - 1];
      const nextInterval = intervals[currentIntervalIndex + 1];

      const newIntervalMin = Math.min(Math.max(newInterval.min, previousInterval?.max ?? INTERVAL_MIN), newInterval.max)
      const newIntervalMax = Math.max(Math.min(newInterval.max, nextInterval?.min ?? INTERVAL_MAX,), newInterval.min)

      const newIntervalBounded: IntervalType = {min: newIntervalMin, max: newIntervalMax}

      setIntervals(intervals.map((i) => (i === interval ? newIntervalBounded : i)));
    };
  }

  const background = getBackgroundImageForIntervals(intervals);

  return (
    <div className="App">
      <h1>Multi-Interval Selector</h1>

      <div
        ref={containerRef}
        className="container"
        style={{ width: `${CONTAINER_WIDTH}px`, background}}
      >
        {intervals.map((i, ind) => (
          <Interval
            onChange={onIntervalChange(i)}
            key={ind}
            interval={i}
            containerRef={containerRef}
          />
        ))}
      </div>

      <h2>Intervals</h2>

      {intervals.map(interval => (<div>
        <span>({interval.min}, {interval.max})</span>
      </div>))}
    </div>
  );
}

export default App;
