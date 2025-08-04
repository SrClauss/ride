@echo off
echo ========================================
echo     RIDER FINANCE - DEV (VS CODE)
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
    echo ERRO: nginx.exe não encontrado em nginx\nginx\!
    pause
    exit /b 1
)

echo [1/4] Iniciando Backend (Python FastAPI)...
code --new-window --folder-uri "file:///%CD:\=/%" --command "workbench.action.terminal.new" --command "workbench.action.terminal.sendSequence" --args "cd backend && python main.py\r"

timeout /t 2 /nobreak >nul

echo [2/4] Iniciando Frontend (Next.js)...
code --command "workbench.action.terminal.new" --command "workbench.action.terminal.sendSequence" --args "cd frontend && npm run dev\r"

timeout /t 2 /nobreak >nul

echo [3/4] Iniciando Nginx (Proxy)...
code --command "workbench.action.terminal.new" --command "workbench.action.terminal.sendSequence" --args "cd nginx\nginx && nginx.exe\r"

timeout /t 3 /nobreak >nul

echo [4/4] Abrindo navegador...
start "" "http://localhost"

echo.
echo ========================================
echo ✅ TODOS OS SERVIÇOS INICIADOS NO VS CODE!
echo ========================================
echo.
echo 🖥️  Backend:   http://localhost:8000
echo 🌐 Frontend:  http://localhost:3000  
echo 🔗 Nginx:     http://localhost
echo.
echo ✨ Verifique os terminais no VS Code!
echo.
pause
