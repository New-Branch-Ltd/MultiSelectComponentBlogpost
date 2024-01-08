import React from "react";
import type { Interval } from "./types";

interface Props {
  interval: Interval;
  intervalToContainer: (intervalValue: number) => number;
  onLeftDown: () => void;
  onRightDown: () => void;
  onDelete: () => void;
}

function SingleInterval(props: Props) {
  const {
    interval,
    intervalToContainer,
    onLeftDown, 
    onRightDown,
    onDelete,
  } = props;
  const { min, max } = interval;

  const pixelsLeft = intervalToContainer(min);
  const pixelsRight = intervalToContainer(max);

  return (
    <div
      className="single-interval"
      style={{ left: pixelsLeft, width: pixelsRight - pixelsLeft }}
    >
      <div className="left-handle" onMouseDown={onLeftDown}>
        <span className="value">{Number(interval.min).toFixed(1)}</span>
      </div>
      <div className="right-handle" onMouseDown={onRightDown}>
        <span className="value">{Number(interval.max).toFixed(1)}</span>
      </div>
      <button type="button" className="delete-button" onClick={onDelete}>
        X
      </button>
    </div>
  );
}

export default SingleInterval;
