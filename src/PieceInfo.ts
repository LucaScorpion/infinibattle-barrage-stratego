import { Rank } from './model/Rank';

export class PieceInfo {
  // A known rank, undefined if unsure.
  public rank?: Rank;

  public hasMoved = false;
}
