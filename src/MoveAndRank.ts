import { MoveCommand } from './model/commands/MoveCommand';
import { Rank } from './model/Rank';

export interface MoveAndRank {
  move: MoveCommand;
  rank: Rank;
}
