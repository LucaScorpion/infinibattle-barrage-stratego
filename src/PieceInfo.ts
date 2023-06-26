import { Rank } from './model/Rank';
import { weWin } from './battleResult';

export class PieceInfo {
  // A known rank, undefined if unsure.
  public rank?: Rank;

  public hasMoved = false;

  public flagLikelihood = 0;

  public possibleRanks: Rank[] = [];
}

export function isGuaranteedWin(me: Rank, opponent: PieceInfo): boolean {
  if (opponent.rank) {
    return weWin(me, opponent.rank);
  }

  // Check if all possible outcomes result in us winning.
  return !opponent.possibleRanks.map((r) => weWin(me, r)).includes(false);
}

export function isGuaranteedLoss(me: Rank, opponent: PieceInfo): boolean {
  if (opponent.rank) {
    return !weWin(me, opponent.rank);
  }

  // Check if all possible outcomes result in us losing.
  return !opponent.possibleRanks.map((r) => weWin(me, r)).includes(true);
}
