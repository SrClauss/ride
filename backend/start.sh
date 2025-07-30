#!/bin/bash

echo "🚀 Iniciando Rider Finance Backend..."

# Verificar se o Python está instalado
if ! command -v python3 &> /dev/null; then
    echo "❌ Python3 não encontrado! Instale Python 3.9+ primeiro."
    exit 1
fi

# Verificar se as dependências estão instaladas
echo "📦 Verificando dependências..."
if ! pip show fastapi &> /dev/null; then
    echo "📥 Instalando dependências..."
    pip install -r requirements.txt
    if [ $? -ne 0 ]; then
        echo "❌ Erro ao instalar dependências!"
        exit 1
    fi
fi

# Verificar arquivo .env
if [ ! -f .env ]; then
    echo "📋 Criando arquivo .env..."
    cp .env.example .env
fi

# Inicializar banco de dados
echo "🗄️ Inicializando banco de dados..."
python3 init_db.py
if [ $? -ne 0 ]; then
    echo "❌ Erro ao inicializar banco de dados!"
    exit 1
fi

# Testar aplicação
echo "🧪 Testando aplicação..."
python3 test_app.py
if [ $? -ne 0 ]; then
    echo "⚠️ Alguns testes falharam, mas continuando..."
fi

# Iniciar servidor
echo "🌐 Iniciando servidor na porta 8000..."
echo "📚 Documentação da API: http://localhost:8000/docs"
echo "🔍 Health Check: http://localhost:8000/health"
echo ""
echo "Pressione Ctrl+C para parar o servidor"
python3 main.py
