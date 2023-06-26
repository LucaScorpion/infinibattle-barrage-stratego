import { PieceInfo } from './PieceInfo';
import { DIRECTIONS } from './directions';
import {
  addCoordinates,
  coordToString,
  stringToCoord,
} from './model/Coordinate';
import { Cell } from './model/Cell';
import { Player } from './model/Player';

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
  let result = 0;

  // Sum the distance to a free (or friendly) cell in each direction.
  for (const delta of DIRECTIONS) {
    let checkCoord = { ...coord };
    let deltaResult = 0;

    while (true) {
      checkCoord = addCoordinates(checkCoord, delta);
      const cell = cells[coordToString(checkCoord)];

      // If we are out of bounds, add 2.
      if (!cell) {
        deltaResult += 2;
        break;
      }

      // If the cell is not water, is free, or contains our piece, we are done.
      if (!cell.IsWater && (cell.Owner == null || cell.Owner === me)) {
        break;
      }

      deltaResult++;
    }

    result += deltaResult;
  }

  return result;
}
