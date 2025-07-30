@echo off
echo ========================================
echo     RIDER FINANCE - DESENVOLVIMENTO
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

echo Iniciando os serviços...
echo.

REM Matar processos existentes (caso existam)
echo [1/4] Parando serviços existentes...
taskkill /f /im nginx.exe >nul 2>&1
taskkill /f /im python.exe >nul 2>&1
taskkill /f /im node.exe >nul 2>&1

REM Iniciar Backend (FastAPI)
echo [2/4] Iniciando Backend (FastAPI) na porta 8000...
start "BACKEND - FastAPI" cmd /k "cd /d backend && python -m venv venv && venv\Scripts\activate.bat && pip install -r requirements.txt && python main.py"

REM Aguardar um pouco para o backend iniciar
timeout /t 3 /nobreak >nul

REM Iniciar Frontend (Next.js)
echo [3/4] Iniciando Frontend (Next.js) na porta 3000...
start "FRONTEND - Next.js" cmd /k "cd /d frontend && npm install && npm run dev"

REM Aguardar um pouco para o frontend iniciar
timeout /t 5 /nobreak >nul

REM Iniciar Nginx (Proxy Reverso)
echo [4/4] Iniciando Nginx (Proxy Reverso) na porta 80...
start "NGINX - Proxy" cmd /k "cd /d nginx\nginx && nginx.exe"

echo.
echo ========================================
echo   SERVIÇOS INICIADOS COM SUCESSO!
echo ========================================
echo.
echo Frontend: http://localhost:3000
echo Backend:  http://localhost:8000
echo Nginx:    http://localhost (porta 80)
echo.
echo Pressione qualquer tecla para abrir o navegador...
pause >nul

REM Abrir navegador
start http://localhost

echo.
echo Para parar todos os serviços, execute: stop-dev.bat
pause
