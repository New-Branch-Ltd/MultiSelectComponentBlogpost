import React, { useEffect, useState } from "react";
import type { Interval } from "./types";

const HANDLE_WIDTH = 20;

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

        const minInPx = mousePos - containerMin + HANDLE_WIDTH / 2;
        const minInInterval = containerToInterval(minInPx);

        if (minInInterval < max) {
          onChange({ min: minInInterval, max });
        }
      } else if (rightMoving) {
        const containerBox = containerRef.current?.getBoundingClientRect();

        const mousePos = ev.clientX;
        const containerMin = containerBox.x;

        const maxInPx = mousePos - containerMin - HANDLE_WIDTH / 2;
        const maxInInterval = containerToInterval(maxInPx);

        if (min < maxInInterval) {
          onChange({ min, max: maxInInterval });
        }
      }
    };

    window.addEventListener("mousemove", handleMouseMove);

    return () => {
      window.removeEventListener("mousemove", handleMouseMove);
    };
  }, [leftMoving, rightMoving]);

  function onLeftHandleMouseDown() {
    setLeftMoving(true);
  }

  function onRightHandleMouseDown() {
    setRightMoving(true);
  }

  const pixelsLeft = intervalToContainer(min);
  const pixelsRight = intervalToContainer(max);

  return (
    <>
      <div
        style={{
          position: "absolute",
          left: `${pixelsLeft - HANDLE_WIDTH}px`,
          width: `${HANDLE_WIDTH}px`,
        }}
        className="left-handle"
        onMouseDown={onLeftHandleMouseDown}
      >
        <span className="value">{Number(interval.min).toFixed(1)}</span>
      </div>
      <div
        style={{
          position: "absolute",
          left: `${pixelsRight}px`,
          width: `${HANDLE_WIDTH}px`,
        }}
        className="right-handle"
        onMouseDown={onRightHandleMouseDown}
      >
        <span className="value">{Number(interval.max).toFixed(1)}</span>
      </div>
      <button
        type="button"
        style={{
          position: "absolute",
          left: `${pixelsRight + HANDLE_WIDTH}px`,
          top: `-${HANDLE_WIDTH}px`,
        }}
        onClick={onDelete}
      >
        X
      </button>
    </>
  );
}

export default SingleInterval;
