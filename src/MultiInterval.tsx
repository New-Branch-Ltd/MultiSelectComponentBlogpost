import React, { useState, useRef, MouseEventHandler } from "react";
import { sortBy } from "lodash";
import type { Interval } from "./types";
import SingleInterval from "./SingleInterval";
import {
  intervalValueToContainerPosition,
  containerPositionToIntervalValue,
} from "./utils";

const SELECTED_COLOR = "#FFDCA9";
const UNSELECTED_COLOR = "#FCF9BE";
const HANDLE_WIDTH = 20;

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
      const previousInterval = intervals[currentIntervalIndex - 1];
      const nextInterval = intervals[currentIntervalIndex + 1];

      const newIntervalMin = Math.max(
        newInterval.min,
        previousInterval
          ? previousInterval.max + 2 * containerToInterval(HANDLE_WIDTH)
          : domain.min
      );

      const newIntervalMax = Math.min(
        newInterval.max,
        nextInterval
          ? nextInterval.min - 2 * containerToInterval(HANDLE_WIDTH)
          : domain.max
      );

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
    const handleOffsetInInterval = containerToInterval(2 * HANDLE_WIDTH)

    const isOutsideIntervals = intervals.every(
      (i) =>
        mousePosInIntervalValue < i.min - handleOffsetInInterval ||
        mousePosInIntervalValue > i.max + handleOffsetInInterval
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

  function getBackgroundImageForIntervals(intervals: Interval[]): string {
    if (intervals.length === 0) {
      return UNSELECTED_COLOR;
    }

    return (
      intervals.reduce(
        (acc, interval) =>
          acc +
          `,${UNSELECTED_COLOR} ${intervalToContainer(
            interval.min
          )}px, ${SELECTED_COLOR} ${intervalToContainer(
            interval.min
          )}px ${intervalToContainer(
            interval.max
          )}px, ${UNSELECTED_COLOR} ${intervalToContainer(interval.max)}px`,
        "linear-gradient(to right "
      ) + ")"
    );
  }

  function onDelete(interval: Interval) {
    return () => {
      const newIntervals = intervals.filter((i) => i !== interval);
      setIntervals(newIntervals);
      props.onChange(newIntervals);
    };
  }

  const style = {
    background: getBackgroundImageForIntervals(intervals),
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
