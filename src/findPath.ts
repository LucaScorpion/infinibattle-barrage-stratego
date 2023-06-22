import { addCoordinates, Coordinate, coordToString } from './model/Coordinate';
import { Cell } from './model/Cell';
import { DIRECTIONS } from './directions';
import { Rank } from './model/Rank';
import { weWin } from './battleResult';
import { Player } from './model/Player';

export function findPath(
  from: Coordinate,
  to: Coordinate,
  cells: Record<string, Cell>,
  me: Player,
  rank: Rank
): Coordinate[] {
  const queue: Coordinate[] = [from];
  const explored = new Set(coordToString(from));
  const parents: Record<string, Coordinate> = {};

  while (queue.length) {
    const cell = queue.splice(0, 1)[0];

    if (cell.X === to.X && cell.Y === to.Y) {
      break;
    }

    for (const delta of DIRECTIONS) {
      const neighbor = addCoordinates(cell, delta);
      const neighborStr = coordToString(neighbor);

      // Check if we already checked this neighbor, otherwise mark it so.
      if (explored.has(neighborStr)) {
        continue;
      }
      explored.add(neighborStr);
      parents[neighborStr] = cell;

      const neighborCell = cells[neighborStr];

      // Check if the neighbor is out of bounds, water, or our own piece.
      if (!neighborCell || neighborCell.IsWater || neighborCell.Owner === me) {
        continue;
      }

      // Check if the cell has an enemy piece.
      if (neighborCell.Owner != null) {
        // Check if we can (potentially) defeat this piece.
        if (!couldDefeat(rank, neighborCell.Rank)) {
          continue;
        }
      }

      queue.push(neighbor);
    }
  }

  const path: Coordinate[] = [to];
  let parent = parents[coordToString(to)];

  // Build the path up to (but excluding) the from.
  while (parent && (parent.X !== from.X || parent.Y !== from.Y)) {
    path.push(parent);
    parent = parents[coordToString(path[path.length - 1])];
  }

  // TODO: Cut out longer sections that the scout can cover.

  return path.reverse();
}

function couldDefeat(friendly: Rank, enemy?: Rank): boolean {
  // Be optimistic.
  if (!enemy || enemy === '?') {
    return true;
  }

  return weWin(friendly, enemy);
}
