import { SetupBoardCommand } from './model/commands/SetupBoardCommand';

export const setupOne: SetupBoardCommand = {
  Pieces: [
    {
      Rank: 'Marshal',
      Position: { X: 3, Y: 1 },
    },
    {
      Rank: 'General',
      Position: { X: 2, Y: 2 },
    },
    {
      Rank: 'Miner',
      Position: { X: 5, Y: 3 },
    },
    {
      Rank: 'Scout',
      Position: { X: 3, Y: 0 },
    },
    {
      Rank: 'Scout',
      Position: { X: 8, Y: 3 },
    },
    {
      Rank: 'Spy',
      Position: { X: 1, Y: 0 },
    },
    {
      Rank: 'Bomb',
      Position: { X: 1, Y: 1 },
    },
    {
      Rank: 'Flag',
      Position: { X: 2, Y: 1 },
    },
  ],
};
