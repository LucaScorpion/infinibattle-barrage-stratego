#!/usr/bin/env bash
set -eu

echo 'Removing old bot.zip'
rm -f 'bot.zip'

echo 'Running NPM build'
npm run build

echo 'Creating bot.zip'
zip -r 'bot.zip' 'build'

echo 'Uploading bot'
apiKey=$(cat 'apiKey' | xargs)
curl -X POST "https://infinibattle.infi.nl/Api/UploadBot/${apiKey}" -F 'File=@bot.zip'
echo
