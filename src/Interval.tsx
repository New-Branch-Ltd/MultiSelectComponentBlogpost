import React, { MouseEventHandler, useEffect, useState } from "react";
import { HANDLE_WIDTH, containerPositionToIntervalValue, intervalValueToContainerPosition } from "./constants";

interface Props {
  containerRef: React.MutableRefObject<HTMLDivElement | null>;
  onChange: (newMin: number, newMax: number) => void;
  min: number;
  max: number;
}

function Interval({ min, max, containerRef, onChange }: Props) {
  const [leftMoving, setLeftMoving] = useState(false);
  const [rightMoving, setRightMoving] = useState(false);

  const pixelsLeft = intervalValueToContainerPosition(min);
  const pixelsRight = intervalValueToContainerPosition(max);

  useEffect(() => {
    function stopMoving() {
      setLeftMoving(false)
      setRightMoving(false)
    }

    window.addEventListener('mouseup', stopMoving)

    return () => {
      window.removeEventListener('mouseup', stopMoving)
    }
  }, [])

  function onLeftHandleMouseDown() {
    setLeftMoving(true)
  }

  function onRightHandleMouseDown() {
    setRightMoving(true)
  }

  const onLeftMouseMove: MouseEventHandler<HTMLDivElement> = (ev) => {
    if (leftMoving && containerRef.current) {  
      const containerBox = containerRef.current?.getBoundingClientRect();
    
      const mousePos = ev.clientX;
      const containerMin = containerBox.x;

      const minInPx = mousePos - containerMin - HANDLE_WIDTH / 2;
      const minInInterval = containerPositionToIntervalValue(minInPx)

      onChange(minInInterval, max)
    }
  }

  const onRightMouseMove: MouseEventHandler<HTMLDivElement> = (ev) => {
    if (rightMoving && containerRef.current) {
      const containerBox = containerRef.current?.getBoundingClientRect();
    
      const mousePos = ev.clientX;
      const containerMin = containerBox.x;

      const maxInPx = mousePos - containerMin - HANDLE_WIDTH / 2;
      const maxInInterval = containerPositionToIntervalValue(maxInPx)

      onChange(min, maxInInterval)
    }
  }

  return (
    <>
      <div
        style={{
          position: "absolute",
          left: `${pixelsLeft}px`,
          width: `${HANDLE_WIDTH}px`
        }}
        className="left-handle"
        onMouseDown={onLeftHandleMouseDown}
        onMouseMove={onLeftMouseMove}
      />
      <div
        style={{
          position: "absolute",
          left: `${pixelsRight}px`,
          width: `${HANDLE_WIDTH}px`
        }}
        className="right-handle"
        onMouseDown={onRightHandleMouseDown}
        onMouseMove={onRightMouseMove}
      />
    </>
  );
}

export default Interval;
