import React, { MouseEventHandler, useEffect, useRef, useState } from "react";
import { HANDLE_WIDTH, intervalValueToContainerPosition } from "./constants";

interface Props {
  min: number;
  max: number;
}

function Interval({ min, max }: Props) {
  const [leftMoving, setLeftMoving] = useState(false);
  const [rightMoving, setRightMoving] = useState(false);

  const leftHandleRef = useRef<HTMLDivElement>(null);
  const rightHandleRef = useRef<HTMLDivElement>(null);

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
    if (leftMoving) {
      console.log('LEFT MOUSE: ', ev)
    }
  }

  const onRightMouseMove: MouseEventHandler<HTMLDivElement> = (ev) => {
    if (rightMoving) {
      console.log('RIGHT MOUSE: ', ev)
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
