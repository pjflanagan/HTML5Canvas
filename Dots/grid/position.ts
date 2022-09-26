import { Position } from "./types";

export function addToPosition(a: Position, b: [number, number]) {
  return {
    x: a.x + b[0],
    y: a.y + b[1]
  }
}

export function arePositionsEqual(a: Position, b: Position): boolean {
  return a.x === b.x && a.y === b.y;
}

function pad(size = 8) {
  var s = String(this);
  while (s.length < (size)) {s = "0" + s;}
  return s;
}

export function serializePosition(position: Position): string {
  const x = pad(Math.floor(position.x * 1000));
  const y = pad(Math.floor(position.y * 1000));
  return `${x}-${y}`;
}