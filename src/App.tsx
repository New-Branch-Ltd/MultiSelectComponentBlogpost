import React, { MouseEventHandler, useRef, useState } from "react";
import sortBy from 'lodash/sortBy'
import Interval from "./Interval";
import "./App.css";
import { CONTAINER_WIDTH, HANDLE_WIDTH, INTERVAL_MAX, INTERVAL_MIN, IntervalType, containerPositionToIntervalValue, getBackgroundImageForIntervals } from "./domain";

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

  function onDelete(interval: IntervalType) {
    return () => {
      setIntervals(intervals.filter((i) => i !== interval));
    };
  }

  const handleDoubleClick: MouseEventHandler<HTMLDivElement> = (ev) => {
    if (!containerRef.current) return;

    const containerBox = containerRef.current.getBoundingClientRect();

    const mousePos = ev.clientX;
    const mousePosInPx = mousePos - containerBox?.x;
    const mousePosInIntervalValue = containerPositionToIntervalValue(mousePosInPx);

    const isOutsideIntervals = intervals.every(i => mousePosInIntervalValue < i.min - HANDLE_WIDTH || mousePosInIntervalValue > i.max + HANDLE_WIDTH)

    if (isOutsideIntervals) {
      const newInterval = {min: mousePosInIntervalValue - HANDLE_WIDTH, max: mousePosInIntervalValue + HANDLE_WIDTH}

      const newIntervals = sortBy([...intervals, newInterval], 'min')
      setIntervals(newIntervals)
    }
  }

  const background = getBackgroundImageForIntervals(intervals);

  return (
    <div className="App">
      <h1>Multi-Interval Selector</h1>

      <div
        ref={containerRef}
        className="container"
        style={{ width: `${CONTAINER_WIDTH}px`, background}}
        onDoubleClick={handleDoubleClick}
      >
        {intervals.map((i, ind) => (
          <Interval
            onChange={onIntervalChange(i)}
            onDelete={onDelete(i)}
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
