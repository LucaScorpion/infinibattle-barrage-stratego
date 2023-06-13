import { Rank } from './Rank';
import { Player } from './Player';

export interface GameInit {
  You: Player;
  AvailablePieces: Rank[];
}
