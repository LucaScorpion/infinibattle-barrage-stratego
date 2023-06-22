import { BattleResult, RankAndPlayer } from './model/BattleResult';
import { Rank } from './model/Rank';
import { Player } from './model/Player';

export function getWinner(battle: BattleResult): RankAndPlayer | undefined {
  if (battle.Winner === battle.Attacker.Player) {
    return battle.Attacker;
  }
  if (battle.Winner === battle.Defender.Player) {
    return battle.Defender;
  }
}

const rankOrder: Rank[] = [
  'Bomb',
  'Marshal',
  'General',
  'Miner',
  'Scout',
  'Spy',
  'Flag',
];

/**
 * Check if we would win a battle.
 * Note that this assumes that we are the attacker.
 */
export function weWin(me: Rank, opponent: Rank): boolean {
  if (opponent === 'Bomb') {
    return me === 'Miner';
  }

  if (opponent === 'Marshal') {
    return me === 'Spy';
  }

  return rankOrder.indexOf(me) < rankOrder.indexOf(opponent);
}

export function getOpponentRank(battle: BattleResult, me: Player): Rank {
  if (battle.Attacker.Player !== me) {
    return battle.Attacker.Rank;
  }
  return battle.Defender.Rank;
}
