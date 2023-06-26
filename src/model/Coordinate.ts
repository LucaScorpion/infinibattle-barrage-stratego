export interface Coordinate {
  X: number;
  Y: number;
}

export function coordToString(c: Coordinate): string {
  return `${c.X},${c.Y}`;
}

export function stringToCoord(s: string): Coordinate {
  const [xs, ys] = s.split(',');
  return {
    X: parseInt(xs, 10),
    Y: parseInt(ys, 10),
  };
}

export function addCoordinates(a: Coordinate, b: Coordinate): Coordinate {
  return {
    X: a.X + b.X,
    Y: a.Y + b.Y,
  };
}

export function subCoordinates(a: Coordinate, b: Coordinate): Coordinate {
  return {
    X: a.X - b.X,
    Y: a.Y - b.Y,
  };
}

export function flip(c: Coordinate): Coordinate {
  return {
    X: c.X,
    Y: Math.abs(9 - c.Y),
  };
}

export function coordEquals(a: Coordinate, b: Coordinate): boolean {
  return a.X === b.X && a.Y === b.Y;
}
