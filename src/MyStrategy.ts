import { Strategy } from './Strategy';
import { PLAYER_BLUE } from './model/Player';
import {
  RankAndPosition,
  SetupBoardCommand,
} from './model/commands/SetupBoardCommand';
import { GameInit } from './model/GameInit';
import { GameState } from './model/GameState';
import { MoveCommand } from './model/commands/MoveCommand';
import { Cell } from './model/Cell';
import {
  addCoordinates,
  coordToString,
  flip,
  stringToCoord,
} from './model/Coordinate';
import { PieceInfo } from './PieceInfo';
import { distance } from './distance';
import { Rank } from './model/Rank';
import { getWinner, weWin } from './battleResult';
import { setupOne } from './setupOne';
import {
  BATTLE_LOSE_SCORE,
  BATTLE_WIN_SCORE,
  MoveWithScore,
  WINNING_SCORE,
} from './MoveWithScore';
import { MoveAndRank } from './MoveAndRank';
import { calcFlagLikelihood } from './calcFlagLikelihood';
import { DIRECTIONS } from './directions';
import { findPath } from './findPath';

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
    this.processOpponentLastMove(state);
    this.processBattleResult(state);

    // Get a map of all cells by coordinate.
    const cellsByCoord: Record<string, Cell> = {};
    state.Board.forEach((c) => (cellsByCoord[coordToString(c.Coordinate)] = c));

    this.calcFlagLikelihoods(cellsByCoord);

    // Get all cells with allied pieces.
    const myCells = state.Board.filter((c) => c.Owner === this.me);

    // TODO: Find known winnable fights, prioritise those.

    // Find the cell most likely to be the flag.
    const target = Object.entries(this.opponentPieceInfo).sort(
      (a, b) => b[1].flagLikelihood - a[1].flagLikelihood
    )[0];
    const targetCoord = stringToCoord(target[0]);

    // TODO: Get right piece to move.
    const movePiece = myCells.find(
      (c) => c.Rank !== 'Bomb' && c.Rank !== 'Flag'
    ) as Cell;
    const from = movePiece.Coordinate;

    const path = findPath(
      from,
      targetCoord,
      cellsByCoord,
      this.me,
      movePiece.Rank as Rank
    );

    if (path.length === 0) {
      // TODO: Try the next piece when this happens.
      throw new Error(
        `Could not find a path from ${coordToString(from)} to ${target[0]}`
      );
    }

    return { From: from, To: path[0] };

    // Previous logic:
    /*
    // Get all possible moves for each piece, sorted by score.
    const moves = myCells
      .flatMap((c) => this.getMovesForCell(cellsByCoord, c))
      .map((m) => this.scoreMove(m))
      .sort((a, b) => b.score - a.score);

    return moves[0].move;
     */
  }

  protected processOpponentMove(state: GameState): void {
    this.setupPieceInfo(state);
    this.processBattleResult(state);
  }

  private getMovesForCell(
    cellsByCoord: Record<string, Cell>,
    cell: Cell
  ): MoveAndRank[] {
    if (cell.Rank === 'Flag' || cell.Rank === 'Bomb') {
      return [];
    }

    const result: MoveCommand[] = [];

    for (const delta of DIRECTIONS) {
      let target = cell.Coordinate;

      let steps = 0;
      while (steps < 1 || cell.Rank === 'Scout') {
        steps++;
        target = addCoordinates(target, delta);
        const targetCell = cellsByCoord[coordToString(target)];

        // Check if the target is out of bounds, water, or our own piece.
        if (!targetCell || targetCell.IsWater || targetCell.Owner == this.me) {
          break;
        }

        result.push({
          From: cell.Coordinate,
          To: target,
        });

        // After we encounter a piece, we can't move further.
        if (targetCell.Owner != null) {
          break;
        }
      }
    }

    return result.map(
      (move): MoveAndRank => ({ move, rank: cell.Rank as Rank })
    );
  }

  private scoreMove(m: MoveAndRank): MoveWithScore {
    const move = m.move;
    const rank = m.rank;
    const opponentPiece = this.opponentPieceInfo[coordToString(move.To)];

    // TODO: Determine flag likelihood.
    if (opponentPiece && opponentPiece.flagLikelihood >= 80) {
      return { move, score: WINNING_SCORE };
    }

    // If it is a known rank, check if we can win.
    if (opponentPiece?.rank && opponentPiece.rank !== '?') {
      return {
        move,
        score: weWin(rank, opponentPiece.rank)
          ? BATTLE_WIN_SCORE
          : BATTLE_LOSE_SCORE,
      };
    }

    return {
      move,
      score: 0,
    };
  }

  private setupPieceInfo(state: GameState): void {
    if (state.TurnNumber !== 0) {
      return;
    }

    state.Board.filter(
      (c) => c.Owner != undefined && c.Owner !== this.me
    ).forEach((c) => {
      this.opponentPieceInfo[coordToString(c.Coordinate)] = new PieceInfo();
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
      this.opponentPieceInfo[coordToString(state.BattleResult.Position)].rank =
        winner.Rank;
    }
  }

  private calcFlagLikelihoods(cells: Record<string, Cell>): void {
    Object.entries(this.opponentPieceInfo).forEach(
      ([coord, i]) =>
        (i.flagLikelihood = calcFlagLikelihood(coord, i, cells, this.me))
    );
  }

  private processOpponentLastMove(state: GameState) {
    if (!state.LastMove) {
      return;
    }

    const info = this.opponentPieceInfo[coordToString(state.LastMove.From)];

    // Move the opponent piece in the piece info.
    this.opponentPieceInfo[coordToString(state.LastMove.To)] = info;
    delete this.opponentPieceInfo[coordToString(state.LastMove.From)];

    info.hasMoved = true;

    // If a piece moved more than 1, it's a scout.
    if (distance(state.LastMove.From, state.LastMove.To) > 1) {
      info.rank = 'Scout';
    }
  }
}
