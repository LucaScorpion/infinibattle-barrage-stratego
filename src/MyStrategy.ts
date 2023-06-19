import { Strategy } from './Strategy';
import { PLAYER_BLUE } from './model/Player';
import {
  RankAndPosition,
  SetupBoardCommand,
} from './model/commands/SetupBoardCommand';
import { GameInit } from './model/GameInit';
import { GameState } from './model/GameState';
import { MoveCommand } from './model/commands/MoveCommand';
import { coordinateToString, flip } from './model/Coordinate';
import { PieceInfo } from './PieceInfo';
import { distance } from './distance';
import { Rank } from './model/Rank';
import { getWinner } from './battleResult';
import { setupOne } from './setupOne';
import { allMoves } from './allMoves';

export class MyStrategy extends Strategy {
  private availablePieces: Rank[] = [];
  private readonly opponentPieceInfo: Record<string, PieceInfo> = {};

  protected doSetupBoard(init: GameInit): SetupBoardCommand {
    this.availablePieces = init.AvailablePieces;

    const setup = setupOne;

    // If we are blue, flip the setup coordinates.
    if (init.You === PLAYER_BLUE) {
      setup.Pieces = setup.Pieces.map(
        (p): RankAndPosition => ({ ...p, Position: flip(p.Position) })
      );
    }

    return setup;
  }

  protected doMove(state: GameState): MoveCommand {
    this.setupPieceInfo(state);
    this.processLastMove(state);
    this.processBattleResult(state);

    // Pick a random move.
    const allPossibleMoves = allMoves(this.me, state);
    const randomIndex = Math.floor(Math.random() * allPossibleMoves.length);
    return allPossibleMoves[randomIndex];
  }

  protected processOpponentMove(state: GameState): void {
    this.setupPieceInfo(state);
    this.processBattleResult(state);
  }

  private setupPieceInfo(state: GameState): void {
    if (state.TurnNumber !== 0) {
      return;
    }

    state.Board.filter(
      (c) => c.Owner != undefined && c.Owner !== this.me
    ).forEach((c) => {
      this.opponentPieceInfo[coordinateToString(c.Coordinate)] =
        new PieceInfo();
    });
  }

  private processBattleResult(state: GameState): void {
    if (!state.BattleResult) {
      return;
    }

    const winner = getWinner(state.BattleResult);

    // Check if we lost.
    if (winner && winner.Player !== this.me) {
      // Move the opponent piece info.
      this.opponentPieceInfo[
        coordinateToString(state.BattleResult.Position)
      ].rank = winner.Rank;
    }
  }

  private processLastMove(state: GameState) {
    if (!state.LastMove) {
      return;
    }

    const info =
      this.opponentPieceInfo[coordinateToString(state.LastMove.From)];

    // Move the opponent piece in the piece info.
    this.opponentPieceInfo[coordinateToString(state.LastMove.To)] = info;
    delete this.opponentPieceInfo[coordinateToString(state.LastMove.From)];

    info.hasMoved = true;

    // If a piece moved more than 1, it's a scout.
    if (distance(state.LastMove.From, state.LastMove.To) > 1) {
      info.rank = 'Scout';
    }
  }
}
