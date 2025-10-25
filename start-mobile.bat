@echo off
echo 🚀 Iniciando aplicacion para acceso movil...
echo.
echo 📱 Tu IP local es: 192.168.1.142
echo 📱 Frontend estara disponible en: http://192.168.1.142:3000
echo 📱 Backend estara disponible en: http://192.168.1.142:5000
echo.
echo 💡 IMPORTANTE: Asegurate de que tu celular este conectado a la misma red WiFi
echo 💡 El frontend detectara automaticamente la IP y se conectara al backend correcto
echo.

cd /d "%~dp0backend"
echo 🔧 Iniciando backend en puerto 5000...
start "Backend Server" cmd /k "echo Backend iniciado en http://192.168.1.142:5000 && node src/index.js"

timeout /t 5 /nobreak > nul

cd /d "%~dp0frontend"
echo 🎨 Iniciando frontend en puerto 3000...
start "Frontend Server" cmd /k "echo Frontend iniciado en http://192.168.1.142:3000 && npm start"

echo.
echo ✅ Servidores iniciando...
echo 📱 En tu celular, ve a: http://192.168.1.142:3000
echo 🔍 El frontend detectara automaticamente que estas en movil y usara la IP correcta
echo.
pause