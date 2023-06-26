import { GameInit } from './model/GameInit';
import { SetupBoardCommand } from './model/commands/SetupBoardCommand';
import { GameState } from './model/GameState';
import { MoveCommand } from './model/commands/MoveCommand';
import { Player, PLAYER_RED } from './model/Player';

export abstract class Strategy {
  protected me: Player = PLAYER_RED;

  protected abstract doSetupBoard(init: GameInit): SetupBoardCommand;

  protected abstract doMove(state: GameState): MoveCommand;

  protected abstract processMoveResult(state: GameState): void;

  public setupBoard(init: GameInit): SetupBoardCommand {
    this.me = init.You;
    return this.doSetupBoard(init);
  }

  public move(state: GameState): MoveCommand | undefined {
    if (state.ActivePlayer === this.me) {
      const moveResult = this.doMove(state);
      if (!moveResult) {
        throw new Error('No move given!');
      }
      return moveResult;
    } else {
      this.processMoveResult(state);
    }
  }
}
