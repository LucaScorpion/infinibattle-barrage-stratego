import { PieceInfo } from './PieceInfo';
import { DIRECTIONS } from './directions';
import {
  addCoordinates,
  coordToString,
  stringToCoord,
} from './model/Coordinate';
import { Cell } from './model/Cell';
import { Player } from './model/Player';

const backRowBonus: Record<number, number> = {
  0: 2,
  1: 1,
  8: 1,
  9: 2,
};

export function calcFlagLikelihood(
  coordStr: string,
  info: PieceInfo,
  cells: Record<string, Cell>,
  me: Player
): number {
  if (info.rank || info.hasMoved || !info.possibleRanks.includes('Flag')) {
    return 0;
  }

  const coord = stringToCoord(coordStr);
  let result = backRowBonus[coord.Y] ?? 0;

  // Check on how many sides the piece is surrounded by opponent pieces, void, or water.
  for (const delta of DIRECTIONS) {
    const checkCoord = addCoordinates(coord, delta);
    const cell = cells[coordToString(checkCoord)];

    if (!cell || cell.IsWater || (cell.Owner != null && cell.Owner !== me)) {
      result++;
    }
  }

  return result;
}
