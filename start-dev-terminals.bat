@echo off
echo ========================================
echo     RIDER FINANCE - DEV (3 TERMINAIS)
echo ========================================
echo.

REM Verificar se os diretórios existem
if not exist "backend" (
    echo ERRO: Pasta backend não encontrada!
    pause
    exit /b 1
)

if not exist "frontend" (
    echo ERRO: Pasta frontend não encontrada!
    pause
    exit /b 1
)

if not exist "nginx\nginx\nginx.exe" (
    echo ERRO: Nginx não encontrado!
    pause
    exit /b 1
)

echo Parando serviços existentes...
taskkill /f /im nginx.exe >nul 2>&1
taskkill /f /im python.exe >nul 2>&1
taskkill /f /im node.exe >nul 2>&1

echo.
echo Abrindo 3 terminais para desenvolvimento:
echo [1] Backend (FastAPI) - Porta 8000
echo [2] Frontend (Next.js) - Porta 3000  
echo [3] Nginx (Proxy) - Porta 80
echo.

REM Terminal 1: Backend
start "🚀 BACKEND - FastAPI (Port 8000)" cmd /k "cd /d backend && echo BACKEND - FASTAPI (PORTA 8000) && echo. && venv\Scripts\activate.bat && echo Iniciando FastAPI... && python main.py"

REM Aguardar um pouco
timeout /t 2 /nobreak >nul

REM Terminal 2: Frontend
start "⚡ FRONTEND - Next.js (Port 3000)" cmd /k "cd /d frontend && echo FRONTEND - NEXT.JS (PORTA 3000) && echo. && echo Iniciando Next.js... && npm run dev"

REM Aguardar um pouco mais
timeout /t 3 /nobreak >nul

REM Terminal 3: Nginx
start "🌐 NGINX - Proxy (Port 80)" cmd /k "cd /d nginx\nginx && echo ======================================== && echo     NGINX - PROXY (PORTA 80) && echo ======================================== && echo. && echo Frontend: http://localhost:3000 && echo Backend:  http://localhost:8000 && echo Nginx:    http://localhost && echo. && echo Iniciando Nginx... && nginx.exe && echo. && echo Nginx rodando! Acesse: http://localhost && echo Para recarregar config: nginx -s reload && echo Para parar: nginx -s stop"

echo.
echo ========================================
echo     TERMINAIS ABERTOS COM SUCESSO!
echo ========================================
echo.
echo URLs de acesso:
echo - Frontend direto: http://localhost:3000
echo - Backend direto:  http://localhost:8000
echo - Via Nginx:       http://localhost
echo.
echo Aguarde alguns segundos para tudo inicializar...
timeout /t 5 /nobreak >nul

echo Abrindo navegador...
start http://localhost

echo.
echo Para parar tudo: stop-dev.bat ou feche os terminais
pause
