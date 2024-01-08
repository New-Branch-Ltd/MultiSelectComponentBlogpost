import React, { useState, useRef, MouseEventHandler } from "react";
import { sortBy } from "lodash";
import type { Interval } from "./types";
import SingleInterval from "./SingleInterval";
import {
  intervalValueToContainerPosition,
  containerPositionToIntervalValue,
} from "./utils";

interface Props {
  domain: {
    min: number;
    max: number;
  };
  container: {
    width: number;
    height: number;
  };
  initial: Interval[];
  onChange: (intervals: Interval[]) => void;
}

function MultiInterval(props: Props) {
  const { initial, container, domain } = props;

  const [intervals, setIntervals] = useState<Interval[]>(initial);
  const containerRef = useRef<HTMLDivElement | null>(null);



  const intervalToContainer = intervalValueToContainerPosition(
    container.width,
    domain
  );
  const containerToInterval = containerPositionToIntervalValue(
    container.width,
    domain
  );

  function onIntervalChange(interval: Interval) {
    return (newInterval: Interval) => {
      const currentIntervalIndex = intervals.findIndex((i) => i === interval);
      const currentInterval = intervals[currentIntervalIndex];
      const previousInterval = intervals[currentIntervalIndex - 1];
      const nextInterval = intervals[currentIntervalIndex + 1];

      let newIntervalMin = currentInterval.min;
      let newIntervalMax = currentInterval.max;

      if (currentInterval.min === newInterval.min) {
        // dragging right
        newIntervalMax = Math.max(newIntervalMin, Math.min(newInterval.max, nextInterval ? nextInterval.min : domain.max))
      } else {
        // dragging left
        newIntervalMin = Math.min(newIntervalMax, Math.max(newInterval.min, previousInterval ? previousInterval.max : domain.min))
      }
      
      const newIntervalBounded: Interval = {
        min: newIntervalMin,
        max: newIntervalMax,
      };

      const newIntervals = intervals.map((i) =>
        i === interval ? newIntervalBounded : i
      );

      setIntervals(newIntervals);
      props.onChange(newIntervals);
    };
  }

  const handleDoubleClick: MouseEventHandler<HTMLDivElement> = (ev) => {
    if (!containerRef.current) return;

    const containerBox = containerRef.current.getBoundingClientRect();

    const mousePos = ev.clientX;
    const mousePosInPx = mousePos - containerBox?.x;
    const mousePosInIntervalValue = containerToInterval(mousePosInPx);

    const isOutsideIntervals = intervals.every(
      (i) =>
        mousePosInIntervalValue < i.min ||
        mousePosInIntervalValue > i.max 
    );

    if (isOutsideIntervals) {
      const newInterval = {
        min: mousePosInIntervalValue,
        max: mousePosInIntervalValue,
      };

      const newIntervals = sortBy([...intervals, newInterval], "min");
      setIntervals(newIntervals);
      props.onChange(newIntervals);
    }
  };

  function onDelete(interval: Interval) {
    return () => {
      const newIntervals = intervals.filter((i) => i !== interval);
      setIntervals(newIntervals);
      props.onChange(newIntervals);
    };
  }

  const style = {
    width: `${container.width}px`,
    height: `${container.height}px`,
  };

  return (
    <div
      className="container"
      style={style}
      ref={containerRef}
      onDoubleClick={handleDoubleClick}
    >
      {intervals.map((i, ind) => (
        <SingleInterval
          key={ind}
          interval={i}
          intervalToContainer={intervalToContainer}
          containerToInterval={containerToInterval}
          containerRef={containerRef}
          onChange={onIntervalChange(i)}
          onDelete={onDelete(i)}
        />
      ))}
    </div>
  );
}

export default MultiInterval;
