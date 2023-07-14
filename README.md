# Infinibattle Barrage Stratego Bot

A bot designed to play [Barrage Stratego](https://www.ultraboardgames.com/stratego/barrage-stratego.php).

## Strategy

Before doing anything, the bot will do a whole bunch of administration to keep track of the opponent's pieces.
This includes updating the ranks and positions, and keeping track of all _possible_ ranks for unknown pieces.

The bot also selects one piece which will it try to move every turn, to give the opponent as little info as possible.

A move will be selected in this order:

1. If there is a move which results in a known winnable fight, that is picked.
2. If we know the flag location, we move our piece towards it.
3. Calculate the flag likelyhood for each piece, and move our piece towards the opponent piece most likely to be the flag.
4. As an absolute last resort, just pick a random move. This should never happen in practice though, only if the bot has a bug.

## Uploading

To automatically upload your bot, create an `apiKey` file with your bot API key.
You can then run `./upload.sh`.
This will run an NPM build, zip the build folder, and upload it.

**NOTE:** The bot entrypoint should be `build/index.js`.
