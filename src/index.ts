import readline from 'readline';
import { GameInit } from './model/GameInit';
import { RandomStrategy } from './RandomStrategy';
import { GameState } from './model/GameState';

const strategy = new RandomStrategy();

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
  terminal: false,
});

rl.once('line', (initRaw) => {
  const init = JSON.parse(initRaw) as GameInit;
  console.log(JSON.stringify(strategy.setupBoard(init)));

  rl.on('line', (stateRaw) => {
    const state = JSON.parse(stateRaw) as GameState;
    const moveCmd = strategy.move(state);
    if (moveCmd) {
      console.log(JSON.stringify(moveCmd));
    }
  });
});

console.log('bot-start');
