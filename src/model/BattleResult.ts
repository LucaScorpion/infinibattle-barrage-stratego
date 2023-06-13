import { Player } from './Player';
import { Rank } from './Rank';
import { Coordinate } from './Coordinate';

export interface BattleResult {
  Winner?: Player;
  Attacker: RankAndPlayer;
  Defender: RankAndPlayer;
  Position: Coordinate;
}

export interface RankAndPlayer {
  Rank: Rank;
  Player: Player;
}
