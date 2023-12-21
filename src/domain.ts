export const CONTAINER_WIDTH = 800;
export const HANDLE_WIDTH = 20;
export const INTERVAL_MIN = 0;
export const INTERVAL_MAX = 1000;

export interface IntervalType {
  min: number;
  max: number;
}


export function intervalValueToContainerPosition(intervalValue: number) {
  return (intervalValue * CONTAINER_WIDTH) / INTERVAL_MAX;
}

export function containerPositionToIntervalValue(containerPosition: number) {
  return (containerPosition * (INTERVAL_MAX - INTERVAL_MIN)) / CONTAINER_WIDTH
}