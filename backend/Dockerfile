# Dockerfile para Rider Finance Backend
FROM python:3.11-slim

# Definir diretório de trabalho
WORKDIR /app

# Instalar dependências do sistema
RUN apt-get update && apt-get install -y \
    gcc \
    && rm -rf /var/lib/apt/lists/*

# Copiar arquivos de dependências
COPY requirements.txt .

# Instalar dependências Python
RUN pip install --no-cache-dir -r requirements.txt

# Copiar código da aplicação
COPY . .

# Criar usuário não-root
RUN useradd -m -u 1000 riderfinance && chown -R riderfinance:riderfinance /app
USER riderfinance

# Expor porta
EXPOSE 8000

# Comando para executar a aplicação
CMD ["python", "main.py"]
