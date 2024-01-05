import type { Interval } from "./types";

export function intervalValueToContainerPosition(
  containerWidth: number,
  interval: Interval
) {
  return (intervalValue: number) =>
    (intervalValue * containerWidth) / (interval.max - interval.min);
}

export function containerPositionToIntervalValue(
  containerWidth: number,
  interval: Interval
) {
  return (containerPosition: number) =>
    (containerPosition * (interval.max - interval.min)) / containerWidth;
}
