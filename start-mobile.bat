@echo off
echo Starting AI-Mitra Mobile App...
cd mobile
if not exist node_modules (
    echo Installing dependencies...
    call npm install
)
echo.
echo Mobile app starting...
echo Press 'w' for web browser or scan QR code with Expo Go app
echo.
call npx expo start
