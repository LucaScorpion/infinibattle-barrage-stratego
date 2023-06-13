import { Rank } from '../Rank';
import { Coordinate } from '../Coordinate';

export interface SetupBoardCommand {
  Pieces: RankAndPosition[];
}

export interface RankAndPosition {
  Rank: Rank;
  Position: Coordinate;
}
