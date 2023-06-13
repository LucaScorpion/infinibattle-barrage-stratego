export interface Coordinate {
  X: number;
  Y: number;
}

export function coordinateToString(c: Coordinate): string {
  return `${c.X},${c.Y}`;
}

export function addCoordinates(a: Coordinate, b: Coordinate): Coordinate {
  return {
    X: a.X + b.X,
    Y: a.Y + b.Y,
  };
}
