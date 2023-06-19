import { MoveCommand } from './model/commands/MoveCommand';

export const WINNING_SCORE = 100;
export const BATTLE_WIN_SCORE = 90;

export const BATTLE_LOSE_SCORE = -90;
export const LOSING_SCORE = -100;

export interface MoveWithScore {
  move: MoveCommand;
  score: number;
}
