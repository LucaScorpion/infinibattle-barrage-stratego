export type Rank =
  | 'Bomb'
  | 'Marshal'
  | 'General'
  | 'Miner'
  | 'Scout'
  | 'Spy'
  | 'Flag'
  | '?';

export function canMove(r: Rank): boolean {
  return r !== 'Bomb' && r !== 'Flag';
}
