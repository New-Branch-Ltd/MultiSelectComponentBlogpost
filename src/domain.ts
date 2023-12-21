export const CONTAINER_WIDTH = 800;
export const HANDLE_WIDTH = 20;
export const INTERVAL_MIN = 0;
export const INTERVAL_MAX = 1000;
export const SELECTED_COLOR = "red";
export const UNSELECTED_COLOR = "yellow";

export interface IntervalType {
  min: number;
  max: number;
}

export function intervalValueToContainerPosition(intervalValue: number) {
  return (intervalValue * CONTAINER_WIDTH) / INTERVAL_MAX;
}

export function containerPositionToIntervalValue(containerPosition: number) {
  return (containerPosition * (INTERVAL_MAX - INTERVAL_MIN)) / CONTAINER_WIDTH;
}

export function getBackgroundImageForIntervals(
  intervals: IntervalType[]
): string {
  return (
    intervals.reduce(
      (acc, interval) =>
        acc +
        `,${UNSELECTED_COLOR} ${intervalValueToContainerPosition(
          interval.min
        ) + HANDLE_WIDTH}px, ${SELECTED_COLOR} ${intervalValueToContainerPosition(
          interval.min
        )}px ${intervalValueToContainerPosition(
          interval.max
        )}px, ${UNSELECTED_COLOR} ${intervalValueToContainerPosition(
          interval.max
        )}px`,
      "linear-gradient(to right "
    ) + ")"
  );
}
