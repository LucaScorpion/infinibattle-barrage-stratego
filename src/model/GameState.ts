import { Player } from './Player';
import { Cell } from './Cell';
import { Move } from './Move';
import { BattleResult } from './BattleResult';

export interface GameState {
  ActivePlayer: Player;
  TurnNumber: number;
  Board: Cell[];
  LastMove?: Move;
  BattleResult?: BattleResult;
}
