import { Cell } from './model/Cell';
import { MoveCommand } from './model/commands/MoveCommand';
import { addCoordinates, coordinateToString } from './model/Coordinate';
import { GameState } from './model/GameState';

export function allMoves(me: number, state: GameState): MoveCommand[] {
  // Get a map of all cells by coordinate.
  const cellsByCoord: Record<string, Cell> = {};
  state.Board.forEach(
    (c) => (cellsByCoord[coordinateToString(c.Coordinate)] = c)
  );

  // Get all cells with allied pieces.
  const myCells = state.Board.filter((c) => c.Owner === me);

  // Get all possible moves for each piece.
  return myCells.flatMap((cell) => {
    if (cell.Rank === 'Flag' || cell.Rank === 'Bomb') {
      return [];
    }

    const result: MoveCommand[] = [];

    const deltas = [
      { X: 1, Y: 0 },
      { X: -1, Y: 0 },
      { X: 0, Y: 1 },
      { X: 0, Y: -1 },
    ];

    for (const delta of deltas) {
      let target = cell.Coordinate;

      let steps = 0;
      while (steps < 1 || cell.Rank === 'Scout') {
        steps++;
        target = addCoordinates(target, delta);
        const targetCell = cellsByCoord[coordinateToString(target)];

        // Check if the target is out of bounds, water, or our own piece.
        if (!targetCell || targetCell.IsWater || targetCell.Owner == me) {
          break;
        }

        result.push({
          From: cell.Coordinate,
          To: target,
        });

        // After we encounter a piece, we can't move further.
        if (targetCell.Owner != null) {
          break;
        }
      }
    }

    return result;
  });
}
