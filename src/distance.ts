import { Coordinate } from './model/Coordinate';

export function distance(from: Coordinate, to: Coordinate): number {
  return Math.abs(from.X - to.X) + Math.abs(from.Y - to.Y);
}
