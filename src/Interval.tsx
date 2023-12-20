import React from "react";
import { useEffect, useRef } from "react";
import { HANDLE_WIDTH, intervalValueToContainerPosition } from "./constants";

interface Props {
  min: number;
  max: number;
}

function Interval({ min, max }: Props) {
  const leftHandleRef = useRef<HTMLDivElement>(null);
  const rightHandleRef = useRef<HTMLDivElement>(null);

  useEffect(() => {}, []);

  const pixelsLeft = intervalValueToContainerPosition(min);
  const pixelsRight = intervalValueToContainerPosition(max);

  return (
    <>
      <div
        ref={leftHandleRef}
        style={{
          position: "absolute",
          left: `${pixelsLeft}px`,
          width: `${HANDLE_WIDTH}px`
        }}
        className="left-handle"
      />
      <div
        ref={rightHandleRef}
        style={{
          position: "absolute",
          left: `${pixelsRight}px`,
          width: `${HANDLE_WIDTH}px`
        }}
        className="right-handle"
      />
    </>
  );
}

export default Interval;
