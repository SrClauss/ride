# Rider Finance Backend

Backend API para aplicação de gestão financeira para motoristas de aplicativo.

## 🚀 Funcionalidades

- **Autenticação JWT** com refresh tokens
- **Gestão de usuários** com período de trial
- **Categorias** padrão para receitas e despesas
- **Transações** com filtros avançados e busca
- **Relatórios** e analytics
- **API REST** completa e documentada

## 🛠️ Tecnologias

- **FastAPI** - Framework web moderno e rápido
- **SQLAlchemy** - ORM para banco de dados
- **Pydantic** - Validação de dados
- **JWT** - Autenticação segura
- **SQLite** - Banco de dados (desenvolvimento)

## 📋 Requisitos

- Python 3.9+
- pip

## 🔧 Instalação e Execução

### **Método Rápido (Recomendado)**

1. **Clone o repositório:**
```bash
git clone <repository-url>
cd rider_finance/backend
```

2. **Execute o script de inicialização:**

**Windows:**
```bash
start.bat
```

**Linux/Mac:**
```bash
chmod +x start.sh
./start.sh
```

O script automaticamente:
- ✅ Verifica dependências do Python
- 📦 Instala dependências (se necessário)
- 📋 Cria arquivo `.env` (se não existir)
- 🗄️ Inicializa banco de dados
- 🧪 Executa testes básicos
- 🚀 Inicia o servidor

### **Método Manual**

1. **Instale as dependências:**
```bash
pip install -r requirements.txt
```

2. **Configure as variáveis de ambiente:**
```bash
copy .env.example .env  # Windows
# ou
cp .env.example .env    # Linux/Mac
```

3. **Inicialize o banco de dados:**
```bash
python init_db.py
```

4. **Teste a aplicação (opcional):**
```bash
python test_app.py
```

5. **Execute a aplicação:**
```bash
python main.py
```

A API estará disponível em `http://localhost:8000`

### **URLs Importantes**
- **API Base**: `http://localhost:8000`
- **Documentação Swagger**: `http://localhost:8000/docs`
- **ReDoc**: `http://localhost:8000/redoc`
- **Health Check**: `http://localhost:8000/health`

## 📚 Documentação

- **Swagger UI**: `http://localhost:8000/docs`
- **ReDoc**: `http://localhost:8000/redoc`

## 🔐 Autenticação

A API usa JWT (JSON Web Tokens) para autenticação:

1. **Registro**: `POST /auth/register`
2. **Login**: `POST /auth/login`
3. **Refresh**: `POST /auth/refresh`

Inclua o token no header das requisições:
```
Authorization: Bearer <token>
```

## 📊 Endpoints Principais

### Autenticação
- `POST /auth/register` - Registrar usuário
- `POST /auth/login` - Login
- `GET /auth/me` - Perfil do usuário
- `PUT /auth/me` - Atualizar perfil

### Categorias
- `GET /categories/` - Listar categorias
- `POST /categories/` - Criar categoria
- `PUT /categories/{id}` - Atualizar categoria
- `DELETE /categories/{id}` - Remover categoria

### Transações
- `GET /transactions/` - Listar transações
- `POST /transactions/` - Criar transação
- `PUT /transactions/{id}` - Atualizar transação
- `DELETE /transactions/{id}` - Remover transação
- `GET /transactions/summary/overview` - Resumo financeiro

## 🏗️ Estrutura do Projeto

```
backend/
├── api/              # Rotas da API
├── config/           # Configurações
├── models/           # Modelos do banco de dados
├── schemas/          # Schemas Pydantic
├── services/         # Lógica de negócio
├── utils/            # Utilitários
├── main.py           # Aplicação principal
└── requirements.txt  # Dependências
```

## 🔄 Desenvolvimento

### Executar testes:
```bash
pytest
```

### Formatar código:
```bash
black .
isort .
```

### Adicionar nova migração:
```bash
alembic revision --autogenerate -m "Descrição da mudança"
alembic upgrade head
```

## 🌟 Principais Features

### Sistema de Trial
- 7 dias de trial gratuito para novos usuários
- Bloqueio automático após expiração
- Gestão de assinaturas

### Categorias Inteligentes
- Categorias padrão pré-configuradas
- Suporte a ícones Font Awesome
- Cores personalizáveis

### Transações Avançadas
- Filtros por data, categoria, tipo
- Busca em texto completo
- Paginação otimizada
- Relatórios automáticos

### Segurança
- Hash de senhas com bcrypt
- Tokens JWT seguros
- Validação rigorosa de dados
- Rate limiting (futuro)

## 📈 Próximos Passos

- [ ] Sessões de trabalho
- [ ] Sistema de metas
- [ ] Notificações
- [ ] Integração com APIs externas
- [ ] Cache Redis
- [ ] Backup automático
- [ ] Relatórios PDF

## 🤝 Contribuição

1. Fork o projeto
2. Crie uma branch para sua feature
3. Commit suas mudanças
4. Push para a branch
5. Abra um Pull Request

## 📄 Licença

Este projeto está sob a licença MIT.
