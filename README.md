# TMP-Spring-20-Hackathon
Electron app to aid in running blt project

## Required tools
```bash
# with pipenv (currently broken)
brew install pipenv
mkdir scripts/.venv
# with virtualenv
cd scripts
python3 -m pip install virtualenv
python -m venv .venv

```

## Build and install
```bash
# installs dependencies
yarn install && yarn build && (cd scripts; pipenv install)
# starts live reload server
npm start
# starts server
node app.js
```

## For Development
```bash
# start a livereaload server 
npm start 

# start the webserver
node app.js
```

## For Releases
```bash
# run the electron app
npm run electron

# run the web app
npm run web
```