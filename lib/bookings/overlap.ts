/** Half-open interval overlap: [aStart, aEnd) vs [bStart, bEnd). */
export function intervalsOverlap(
  aStart: number,
  aEnd: number,
  bStart: number,
  bEnd: number,
): boolean {
  return aStart < bEnd && bStart < aEnd;
}
