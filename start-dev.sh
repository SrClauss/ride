#!/bin/bash

echo "========================================"
echo "     RIDER FINANCE - DESENVOLVIMENTO"
echo "========================================"
echo

# Verificar se os diretórios existem
if [ ! -d "backend" ]; then
    echo "ERRO: Pasta backend não encontrada!"
    exit 1
fi

if [ ! -d "frontend" ]; then
    echo "ERRO: Pasta frontend não encontrada!"
    exit 1
fi

if [ ! -f "nginx/nginx/sbin/nginx" ] && [ ! -f "/usr/local/bin/nginx" ]; then
    echo "ERRO: Nginx não encontrado!"
    exit 1
fi

echo "Iniciando os serviços..."
echo

# Função para matar processos
cleanup() {
    echo "Parando serviços..."
    pkill -f "python.*main.py" 2>/dev/null
    pkill -f "next-server" 2>/dev/null
    pkill -f nginx 2>/dev/null
    exit 0
}

# Capturar Ctrl+C para cleanup
trap cleanup SIGINT SIGTERM

# Iniciar Backend (FastAPI)
echo "[1/4] Iniciando Backend (FastAPI) na porta 8000..."
cd backend
python3 -m venv venv 2>/dev/null || true
source venv/bin/activate
pip install -r requirements.txt >/dev/null 2>&1
python main.py &
BACKEND_PID=$!
cd ..

# Aguardar um pouco para o backend iniciar
sleep 3

# Iniciar Frontend (Next.js)
echo "[2/4] Iniciando Frontend (Next.js) na porta 3000..."
cd frontend
npm install >/dev/null 2>&1
npm run dev &
FRONTEND_PID=$!
cd ..

# Aguardar um pouco para o frontend iniciar
sleep 5

# Iniciar Nginx (Proxy Reverso)
echo "[3/4] Iniciando Nginx (Proxy Reverso) na porta 80..."
if [ -f "nginx/nginx/sbin/nginx" ]; then
    cd nginx/nginx
    ./sbin/nginx -c "$(pwd)/conf/nginx.conf"
    cd ../..
else
    nginx -c "$(pwd)/nginx/nginx/conf/nginx.conf"
fi

echo
echo "========================================"
echo "   SERVIÇOS INICIADOS COM SUCESSO!"
echo "========================================"
echo
echo "Frontend: http://localhost:3000"
echo "Backend:  http://localhost:8000"
echo "Nginx:    http://localhost (porta 80)"
echo
echo "Pressione Ctrl+C para parar todos os serviços..."

# Aguardar indefinidamente
wait
