import { SetupBoardCommand } from './model/commands/SetupBoardCommand';

// Note that the order these are in also defines the preferred move order.
export const setupOne: SetupBoardCommand = {
  Pieces: [
    {
      Rank: 'Miner',
      Position: { X: 5, Y: 3 },
    },
    {
      Rank: 'Scout',
      Position: { X: 8, Y: 3 },
    },
    {
      Rank: 'Scout',
      Position: { X: 0, Y: 1 },
    },
    {
      Rank: 'Marshal',
      Position: { X: 2, Y: 2 },
    },
    {
      Rank: 'Spy',
      Position: { X: 3, Y: 0 },
    },
    {
      Rank: 'General',
      Position: { X: 3, Y: 1 },
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
