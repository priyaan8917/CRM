@echo off
cd /d "%~dp0"
node --version
if errorlevel 1 (
 echo Install Node.js 24 first, then reopen this file.
 pause
 exit /b 1
)
if not exist node_modules (
 call npm.cmd ci
 if errorlevel 1 (
  echo Installation failed. Read the error above.
  pause
  exit /b 1
 )
)
call npm.cmd start
pause
