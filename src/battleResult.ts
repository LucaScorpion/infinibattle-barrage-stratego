import { BattleResult, RankAndPlayer } from './model/BattleResult';

export function getWinner(battle: BattleResult): RankAndPlayer | undefined {
  if (battle.Winner === battle.Attacker.Player) {
    return battle.Attacker;
  }
  if (battle.Winner === battle.Defender.Player) {
    return battle.Defender;
  }
}
