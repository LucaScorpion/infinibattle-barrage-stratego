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
import { Player } from './model/Player';
import { isGuaranteedLoss, PieceInfo } from './PieceInfo';

export function findPath(
  from: Coordinate,
  to: Coordinate,
  cells: Record<string, Cell>,
  opponentPieceInfo: Record<string, PieceInfo>,
  me: Player,
  rank: Rank
): Coordinate[] {
  const queue: Coordinate[] = [from];
  const explored = new Set(coordToString(from));
  const parents: Record<string, Coordinate> = {};

  while (queue.length) {
    const cell = queue.splice(0, 1)[0];

    if (coordEquals(cell, to)) {
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
      const neighborPieceInfo = opponentPieceInfo[neighborStr];
      if (neighborPieceInfo) {
        // Check if we can (potentially) defeat this piece.
        if (isGuaranteedLoss(rank, neighborPieceInfo)) {
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
  if (rank === 'Scout' && path.length > 1) {
    const delta = subCoordinates(path[0], from);

    let upTo = 0;
    while (upTo < path.length - 1) {
      // Check if the current cell is free, i.e. if we can keep moving.
      const cell = cells[coordToString(path[upTo])];
      if (cell.Owner != null) {
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
