import {
  addCoordinates,
  coordEquals,
  Coordinate,
  coordToString,
  subCoordinates,
} from './model/Coordinate';
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

  path.reverse();

  // Simplify the path for the scout.
  // Note that we need to check if the first cell is free.
  if (
    rank === 'Scout' &&
    path.length > 1 &&
    cells[coordToString(path[0])].Owner == null
  ) {
    const delta = subCoordinates(path[0], from);

    let upTo = 0;
    while (upTo < path.length - 1) {
      // Check if the next cell is free.
      const nextCell = cells[coordToString(path[upTo + 1])];
      if (nextCell.Owner != null) {
        break;
      }

      // Check if we keep moving in the same direction.
      const nextDelta = subCoordinates(path[upTo + 1], path[upTo]);
      if (!coordEquals(delta, nextDelta)) {
        break;
      }

      upTo++;
    }

    path.splice(0, upTo);
  }

  return path;
}

function couldDefeat(friendly: Rank, enemy?: Rank): boolean {
  // Be optimistic.
  if (!enemy || enemy === '?') {
    return true;
  }

  return weWin(friendly, enemy);
}
