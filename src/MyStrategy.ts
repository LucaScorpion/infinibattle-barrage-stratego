import { Strategy } from './Strategy';
import { PLAYER_RED } from './model/Player';
import { SetupBoardCommand } from './model/commands/SetupBoardCommand';
import { GameInit } from './model/GameInit';
import { GameState } from './model/GameState';
import { MoveCommand } from './model/commands/MoveCommand';
import { Cell } from './model/Cell';
import { addCoordinates, coordinateToString } from './model/Coordinate';
import { PieceInfo } from './PieceInfo';
import { distance } from './distance';
import { Rank } from './model/Rank';
import { BattleResult, RankAndPlayer } from './model/BattleResult';

export class MyStrategy extends Strategy {
  private availablePieces: Rank[] = [];
  private readonly pieceInfos: Record<string, PieceInfo> = {};

  protected doSetupBoard(init: GameInit): SetupBoardCommand {
    this.availablePieces = init.AvailablePieces;

    const row = init.You === PLAYER_RED ? 0 : 6;

    const result: SetupBoardCommand = {
      Pieces: [],
    };

    init.AvailablePieces.forEach((p, i) => {
      result.Pieces.push({
        Rank: p,
        Position: {
          X: i,
          Y: row + Math.floor(Math.random() * 4),
        },
      });
    });

    return result;
  }

  protected doMove(state: GameState): MoveCommand {
    this.setupPieceInfo(state);

    // Get a map of all cells by coordinate.
    const cellsByCoord: Record<string, Cell> = {};
    state.Board.forEach(
      (c) => (cellsByCoord[coordinateToString(c.Coordinate)] = c)
    );

    // Get all cells with allied pieces.
    const myCells = state.Board.filter((c) => c.Owner === this.me);
    // Get all possible moves for each piece.
    const allPossibleMoves = myCells.flatMap((c) =>
      this.getMovesForCell(cellsByCoord, c)
    );

    // Pick a random move.
    const randomIndex = Math.floor(Math.random() * allPossibleMoves.length);
    return allPossibleMoves[randomIndex];
  }

  protected processOpponentMove(state: GameState): void {
    this.setupPieceInfo(state);

    if (!state.LastMove) {
      return;
    }

    const info = this.pieceInfos[coordinateToString(state.LastMove.From)];

    this.pieceInfos[coordinateToString(state.LastMove.To)] = info;
    delete this.pieceInfos[coordinateToString(state.LastMove.From)];

    info.hasMoved = true;

    if (distance(state.LastMove.From, state.LastMove.To) > 1) {
      info.rank = 'Scout';
    }
  }

  private getMovesForCell(
    cellsByCoord: Record<string, Cell>,
    cell: Cell
  ): MoveCommand[] {
    if (cell.Rank === 'Flag' || cell.Rank === 'Bomb') {
      return [];
    }

    const result: MoveCommand[] = [];

    const deltas = [
      { X: 1, Y: 0 },
      { X: -1, Y: 0 },
      { X: 0, Y: 1 },
      { X: 0, Y: -1 },
    ];

    for (const delta of deltas) {
      let target = cell.Coordinate;

      let steps = 0;
      while (steps < 1 || cell.Rank === 'Scout') {
        steps++;
        target = addCoordinates(target, delta);
        const targetCell = cellsByCoord[coordinateToString(target)];

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

    return result;
  }

  private setupPieceInfo(state: GameState): void {
    if (state.TurnNumber !== 0) {
      return;
    }

    state.Board.filter(
      (c) => c.Owner != undefined && c.Owner !== this.me
    ).forEach((c) => {
      this.pieceInfos[coordinateToString(c.Coordinate)] = new PieceInfo();
    });
  }

  private processBattleResult(state: GameState): void {
    if (!state.BattleResult) {
      return;
    }

    const winner = this.getWinner(state.BattleResult);
    if (winner && winner.Player !== this.me) {
      this.pieceInfos[coordinateToString(state.BattleResult.Position)].rank =
        winner.Rank;
    }
  }

  private getWinner(battle: BattleResult): RankAndPlayer | undefined {
    if (battle.Winner === battle.Attacker.Player) {
      return battle.Attacker;
    }
    if (battle.Winner === battle.Defender.Player) {
      return battle.Defender;
    }
  }
}
