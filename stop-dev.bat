@echo off
echo ========================================
echo    PARANDO RIDER FINANCE - DEV
echo ========================================
echo.

echo Parando todos os serviços...

REM Parar Nginx
echo [1/3] Parando Nginx...
taskkill /f /im nginx.exe >nul 2>&1

REM Parar Backend (Python/FastAPI)
echo [2/3] Parando Backend (FastAPI)...
taskkill /f /im python.exe >nul 2>&1

REM Parar Frontend (Node.js/Next.js)
echo [3/3] Parando Frontend (Next.js)...
taskkill /f /im node.exe >nul 2>&1

echo.
echo ========================================
echo     TODOS OS SERVIÇOS PARADOS!
echo ========================================
echo.
pause
