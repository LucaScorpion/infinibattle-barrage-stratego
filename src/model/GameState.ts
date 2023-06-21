import { Player } from './Player';
import { Cell } from './Cell';
import { Move } from './Move';
import { BattleResult } from './BattleResult';
import { Coordinate } from './Coordinate';

export interface GameState {
  ActivePlayer: Player;
  TurnNumber: number;
  Board: Cell[];
  LastMove?: Move;
  BattleResult?: BattleResult;
}

export function findCellByCoord(
  state: GameState,
  coord: Coordinate
): Cell | undefined {
  return state.Board.find(
    (c) => c.Coordinate.X === coord.X && c.Coordinate.Y === coord.Y
  );
}
