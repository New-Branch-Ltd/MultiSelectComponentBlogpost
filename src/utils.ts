import type { Interval } from "./types";

export function domainValueToContainerPosition(
  containerWidth: number,
  domain: Interval
) {
  return (intervalValue: number) =>
    (intervalValue * containerWidth) / (domain.max - domain.min);
}

export function containerPositionToDomainValue(
  containerWidth: number,
  domain: Interval
) {
  return (containerPosition: number) =>
    (containerPosition * (domain.max - domain.min)) / containerWidth;
}
