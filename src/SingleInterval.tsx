import React, { useEffect, useState } from "react";
import type { Interval } from "./types";

interface Props {
  containerRef: React.MutableRefObject<HTMLDivElement | null>;
  interval: Interval;
  intervalToContainer: (intervalValue: number) => number;
  containerToInterval: (containerPosition: number) => number;
  onChange: (newInterval: Interval) => void;
  onDelete: () => void;
}

function SingleInterval(props: Props) {
  const {
    containerRef,
    interval,
    intervalToContainer,
    containerToInterval,
    onChange,
    onDelete,
  } = props;
  const { min, max } = interval;

  const [leftMoving, setLeftMoving] = useState(false);
  const [rightMoving, setRightMoving] = useState(false);

  useEffect(() => {
    function stopMoving() {
      setLeftMoving(false);
      setRightMoving(false);
    }

    window.addEventListener("mouseup", stopMoving);

    return () => {
      window.removeEventListener("mouseup", stopMoving);
    };
  }, []);

  useEffect(() => {
    const handleMouseMove = (ev: MouseEvent) => {
      if (!containerRef.current) return;

      if (leftMoving) {
        const containerBox = containerRef.current?.getBoundingClientRect();

        const mousePos = ev.clientX;
        const containerMin = containerBox.x;

        const minInPx = mousePos - containerMin;
        const minInInterval = containerToInterval(minInPx);

        onChange({ min: minInInterval, max });
      } else if (rightMoving) {
        const containerBox = containerRef.current?.getBoundingClientRect();

        const mousePos = ev.clientX;
        const containerMin = containerBox.x;

        const maxInPx = mousePos - containerMin;
        const maxInInterval = containerToInterval(maxInPx);

        onChange({ min, max: maxInInterval });
      }
    };

    console.log('change!')
    window.addEventListener("mousemove", handleMouseMove);

    return () => {
      console.log('clean!')
      window.removeEventListener("mousemove", handleMouseMove);
    };
  }, [leftMoving, rightMoving, min, max, containerRef, containerToInterval, onChange]);

  function onLeftHandleMouseDown() {
    setLeftMoving(true);
  }

  function onRightHandleMouseDown() {
    setRightMoving(true);
  }

  const pixelsLeft = intervalToContainer(min);
  const pixelsRight = intervalToContainer(max);

  return (
    <div
      className="single-interval"
      style={{ left: pixelsLeft, width: pixelsRight - pixelsLeft }}
    >
      <div className="left-handle" onMouseDown={onLeftHandleMouseDown}>
        <span className="value">{Number(interval.min).toFixed(1)}</span>
      </div>
      <div className="right-handle" onMouseDown={onRightHandleMouseDown}>
        <span className="value">{Number(interval.max).toFixed(1)}</span>
      </div>
      <button type="button" className="delete-button" onClick={onDelete}>
        X
      </button>
    </div>
  );
}

export default SingleInterval;
