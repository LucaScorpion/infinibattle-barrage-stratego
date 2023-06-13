import { Rank } from './Rank';
import { Player } from './Player';
import { Coordinate } from './Coordinate';

export interface Cell {
  Rank?: Rank;
  Owner?: Player;
  IsWater: boolean;
  Coordinate: Coordinate;
}
