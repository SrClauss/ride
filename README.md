# Rider Finance - Sistema Financeiro para Motoristas

## 🚀 Início Rápido

### Opção 1: Desenvolvimento com 3 Terminais Separados (Recomendado)
```bash
# Windows
.\start-dev-terminals.bat

# Linux/Mac
./start-dev.sh
```

### Opção 2: Desenvolvimento em Background
```bash
# Windows
.\start-dev.bat

# Para parar
.\stop-dev.bat
```

## 🏗️ Arquitetura

```
├── backend/          # FastAPI (Port 8000)
├── frontend/         # Next.js (Port 3000)
├── nginx/           # Nginx Proxy (Port 80)
└── scripts/         # Scripts de desenvolvimento
```

## 🌐 URLs de Acesso

- **Produção (via Nginx)**: http://localhost
- **Frontend (desenvolvimento)**: http://localhost:3000
- **Backend (API)**: http://localhost:8000
- **Documentação da API**: http://localhost:8000/docs

## 📦 Serviços

### Backend (FastAPI)
- **Porta**: 8000
- **Tecnologia**: Python + FastAPI + SQLAlchemy
- **Banco**: SQLite (`rider_finance.db`)
- **Features**: Auth JWT, CRUD, Integração Asaas

### Frontend (Next.js)
- **Porta**: 3000  
- **Tecnologia**: Next.js 15 + TypeScript + Material-UI
- **Features**: Dashboard, Tema Escuro, Autenticação
- **Testes**: Jest + Testing Library

### Nginx (Proxy Reverso)
- **Porta**: 80
- **Configuração**: `nginx/nginx/conf/nginx.conf`
- **Roteamento**:
  - `/` → Frontend (Next.js)
  - `/api/` → Backend (FastAPI)

## 🗄️ Banco de Dados

O arquivo `rider_finance.db` principal está na pasta `backend/`. Este é o banco mais atualizado com todos os dados.

## 🛠️ Comandos Úteis

### Backend
```bash
cd backend

# Ativar ambiente virtual
venv\Scripts\activate    # Windows
source venv/bin/activate # Linux/Mac

# Instalar dependências
pip install -r requirements.txt

# Executar testes
pytest

# Iniciar servidor
python main.py
```

### Frontend
```bash
cd frontend

# Instalar dependências
npm install

# Executar testes
npm test

# Desenvolvimento
npm run dev

# Build para produção
npm run build
```

### Nginx
```bash
cd nginx/nginx

# Iniciar
nginx

# Recarregar configuração
nginx -s reload

# Parar
nginx -s stop
```

## 🔧 Configuração

### Variáveis de Ambiente

**Backend** (`.env`):
```bash
DATABASE_URL=sqlite:///./rider_finance.db
SECRET_KEY=sua-chave-secreta
ASAAS_API_KEY=sua-chave-asaas
```

**Frontend** (`.env.local`):
```bash
NEXT_PUBLIC_API_URL=http://localhost/api
NEXT_PUBLIC_APP_NAME=Rider Finance
```

## 🧪 Testes

### Backend
```bash
cd backend
pytest                    # Todos os testes
pytest tests/test_auth.py  # Testes específicos
```

### Frontend
```bash
cd frontend
npm test                   # Todos os testes
npm run test:watch         # Watch mode
npm run test:coverage      # Com cobertura
```

## 📁 Estrutura de Pastas

```
rider_finance/
├── backend/
│   ├── api/              # Rotas da API
│   ├── config/           # Configurações
│   ├── models/           # Modelos SQLAlchemy
│   ├── schemas/          # Schemas Pydantic
│   ├── services/         # Lógica de negócio
│   ├── tests/            # Testes
│   └── main.py           # Aplicação principal
├── frontend/
│   ├── src/
│   │   ├── app/          # Páginas Next.js
│   │   ├── components/   # Componentes React
│   │   ├── store/        # Estado global
│   │   ├── services/     # API calls
│   │   └── theme/        # Temas Material-UI
│   └── package.json
├── nginx/
│   └── nginx/
│       └── conf/
│           └── nginx.conf
├── start-dev-terminals.bat  # Script Windows (3 terminais)
├── start-dev.bat           # Script Windows (background)
├── start-dev.sh            # Script Linux/Mac
└── stop-dev.bat            # Parar serviços
```

## 🎨 UI/UX

- **Design System**: Material-UI com tema escuro inspirado no Uber
- **Paleta**: Preto/cinza escuro + verde #2BD34F
- **Componentes**: Dashboard, Sidebar, Header, Cards, Modais
- **Responsivo**: Mobile-first design
- **Testes**: 14 testes unitários do reducer passando ✅

## 🚨 Solução de Problemas

### Porta em uso
```bash
# Windows
netstat -ano | findstr :8000
taskkill /pid <PID> /f

# Linux/Mac  
lsof -i :8000
kill -9 <PID>
```

### Nginx não inicia
- Verificar se a porta 80 está livre
- Executar como administrador
- Verificar logs em `nginx/nginx/logs/`

### Frontend não conecta com API
- Verificar `NEXT_PUBLIC_API_URL` no `.env.local`
- Confirmar se nginx está roteando `/api/` corretamente
- Verificar CORS no backend

## 📝 Próximos Passos

1. ✅ **Estrutura base** - Backend + Frontend + Nginx
2. ✅ **Autenticação** - JWT + Context API  
3. ✅ **Dashboard** - Cards, gráficos, estatísticas
4. 🔄 **Transações** - CRUD completo
5. 🔄 **Metas** - Sistema de objetivos
6. 🔄 **Relatórios** - Analytics avançado
7. 🔄 **Integração Asaas** - Pagamentos

## 📞 Suporte

Para dúvidas sobre o desenvolvimento, verifique:
- Logs do backend: `backend/logs/`
- Logs do nginx: `nginx/nginx/logs/`
- Console do navegador para frontend
