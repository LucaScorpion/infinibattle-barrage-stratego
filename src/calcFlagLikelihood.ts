import { GameState, findCellByCoord } from './model/GameState';
import { PieceInfo } from './PieceInfo';
import { DIRECTIONS } from './directions';
import { addCoordinates, stringToCoord } from './model/Coordinate';

export function calcFlagLikelihood(
  coordStr: string,
  info: PieceInfo,
  state: GameState,
  me: number
): number {
  if (info.rank || info.hasMoved) {
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
      const cell = findCellByCoord(state, coord);

      // If we are out of bounds, return the maximum value.
      if (!cell) {
        deltaResult = 8;
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
