@echo off
set PATH=%PATH%;C:\Program Files\nodejs
cd /d "%~dp0"
npm start -- --port 8087 --clear --tunnel > server_output.txt 2>&1
