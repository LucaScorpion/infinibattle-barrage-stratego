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
import { canMove, Rank } from './model/Rank';
import { getOpponentRank, getWinner, weWin } from './battleResult';
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
  private readonly defeatedPieces: Rank[] = [];

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

    // Get all cells with allied pieces.
    const myCells = state.Board.filter((c) => c.Owner === this.me);

    // Get all known opponent ranks (current and defeated).
    const knownOpponentRanks = Object.values(this.opponentPieceInfo)
      .map((i) => i.rank)
      .filter((r) => !!r);
    this.defeatedPieces.forEach((r) => knownOpponentRanks.push(r));

    // Get all unknown (leftover) opponent ranks.
    const unknownOpponentRanks = [...this.availablePieces];

    // For each unknown opponent cell, get the possible ranks.
    Object.values(this.opponentPieceInfo).forEach((info) => {
      let options = [...unknownOpponentRanks];

      if (info.hasMoved) {
        options = options.filter(canMove);
      }

      // If there is only 1 option, it's simple.
      if (options.length === 1) {
        info.rank = options[0];
      }

      info.possibleRanks = options;
    });

    // Get all unknown, unmoved opponent pieces.
    const unknownUnmovedOpponentPieces = Object.values(this.opponentPieceInfo)
      .filter((i) => !i.hasMoved)
      .filter((i) => !i.rank);

    if (unknownUnmovedOpponentPieces.length === 1) {
      // If there is 1 unknown, unmoved piece left, that must be the flag.
      unknownUnmovedOpponentPieces[0].rank = 'Flag';
    } else if (unknownUnmovedOpponentPieces.length === 2) {
      // If there are 2 unknown, unmoved pieces left, they must be the flag and bomb.
      unknownUnmovedOpponentPieces[0].possibleRanks = ['Flag', 'Bomb'];
      unknownUnmovedOpponentPieces[1].possibleRanks = ['Flag', 'Bomb'];
    }

    // Get all possible moves.
    const allMoves = myCells.flatMap((c) =>
      this.getMovesForCell(cellsByCoord, c)
    );

    // TODO: Find known winnable fights, prioritise those.

    // If we know the flag location, go for it.
    let target = Object.entries(this.opponentPieceInfo).find(
      (i) => i[1].rank === 'Flag'
    );
    let targetCoord = target ? stringToCoord(target[0]) : undefined;

    if (!target || !targetCoord) {
      // If we don't know for sure, calculate the flag likelihood for each option.
      this.calcFlagLikelihoods(cellsByCoord);

      // Find the cell most likely to be the flag.
      target = Object.entries(this.opponentPieceInfo).sort(
        (a, b) => b[1].flagLikelihood - a[1].flagLikelihood
      )[0];
      targetCoord = stringToCoord(target[0]);
    }

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
    if (!canMove(cell.Rank as Rank)) {
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
    const coordStr = coordToString(state.BattleResult.Position);

    // Check if we lost.
    if (winner && winner.Player !== this.me) {
      // Move the opponent piece info.
      this.opponentPieceInfo[coordStr].rank = winner.Rank;
    }

    // If the opponent lost a piece, remove it from the info.
    if (!winner || winner.Player === this.me) {
      delete this.opponentPieceInfo[coordStr];
      this.defeatedPieces.push(getOpponentRank(state.BattleResult, this.me));
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
