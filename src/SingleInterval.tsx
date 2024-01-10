import React from "react";
import type { Interval } from "./types";

interface Props {
  interval: Interval;
  offsetLeft: number;
  width: number;
  onLeftDown: () => void;
  onRightDown: () => void;
  onDelete: () => void;
}

function SingleInterval(props: Props) {
  const {
    interval,
    offsetLeft,
    width,
    onLeftDown, 
    onRightDown,
    onDelete,
  } = props;

  return (
    <div
      className="single-interval"
      style={{ left: offsetLeft, width }}
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
