import { MoveCommand } from './model/commands/MoveCommand';
import { Rank } from './model/Rank';

export interface MoveAndRank {
  move: MoveCommand;
  rank: Rank;
}

export const ATTACK_ORDER: Rank[] = [
  'Flag',
  'Marshal',
  'General',
  'Scout',
  'Miner',
  'Spy',
  'Bomb',
];
