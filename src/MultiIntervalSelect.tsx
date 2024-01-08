import React, { useState, useRef, MouseEventHandler, useEffect } from "react";
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
  width: number;
  height: number;
  initialValue: Interval[];
  onChange: (intervals: Interval[]) => void;
}

function MultiIntervalSelect(props: Props) {
  const { initialValue, width, height, domain, onChange } = props;

  const [intervals, setIntervals] = useState<Interval[]>(initialValue);
  const [movingHandle, setMovingHandle] = useState<string | null>(null);
  const containerRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    function stopMoving() {
      setMovingHandle(null);
    }

    window.addEventListener("mouseup", stopMoving);

    return () => {
      window.removeEventListener("mouseup", stopMoving);
    };
  }, []);

  const intervalToContainer = intervalValueToContainerPosition(
    width,
    domain
  );

  useEffect(() => {
    const handleMouseMove = (ev: MouseEvent) => {
      if (!containerRef.current || !movingHandle) return;
      const containerBox = containerRef.current?.getBoundingClientRect();

      const [indexStr, side] = movingHandle.split("-");
      const relevantIndex = Number(indexStr);
      const relevantInterval = intervals.find(
        (_i, ind) => ind === relevantIndex
      );
      const previousInterval = intervals[relevantIndex - 1];
      const nextInterval = intervals[relevantIndex + 1];
      const { min, max } = relevantInterval!;

      const mousePos = ev.clientX;
      const containerMin = containerBox.x;
      const positionInPx = mousePos - containerMin;
      const containerToInterval = containerPositionToIntervalValue(width, domain);
      const positionInInterval = containerToInterval(positionInPx);
      let newInterval: Interval = relevantInterval!;

      if (side === "left") {
        const minInIntervalBounded = Math.min(
          max,
          Math.max(
            positionInInterval,
            previousInterval ? previousInterval.max : domain.min
          )
        );
        newInterval = { min: minInIntervalBounded, max };
      } else {
        const maxInIntervalBounded = Math.max(
          min,
          Math.min(
            positionInInterval,
            nextInterval ? nextInterval.min : domain.max
          )
        );
        newInterval = { min, max: maxInIntervalBounded };
      }

      const newIntervals = intervals.map((i, index) =>
        index === relevantIndex ? newInterval : i
      );

      setIntervals(newIntervals);
      onChange(newIntervals);
    };

    window.addEventListener("mousemove", handleMouseMove);

    return () => {
      window.removeEventListener("mousemove", handleMouseMove);
    };
  }, [movingHandle, intervals, containerRef, onChange, width, height, domain]);

  const handleDoubleClick: MouseEventHandler<HTMLDivElement> = (ev) => {
    if (!containerRef.current) return;

    const containerBox = containerRef.current.getBoundingClientRect();

    const mousePos = ev.clientX;
    const mousePosInPx = mousePos - containerBox?.x;
    const containerToInterval = containerPositionToIntervalValue(
      width,
      domain
    );  
    const mousePosInIntervalValue = containerToInterval(mousePosInPx);

    const isOutsideIntervals = intervals.every(
      (i) => mousePosInIntervalValue < i.min || mousePosInIntervalValue > i.max
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
    width,
    height,
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
          onLeftDown={() => setMovingHandle(`${ind}-left`)}
          onRightDown={() => setMovingHandle(`${ind}-right`)}
          onDelete={onDelete(i)}
        />
      ))}
    </div>
  );
}

export default MultiIntervalSelect;