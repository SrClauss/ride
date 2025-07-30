# 🏍️ Rider Finance Backend

Sistema de gestão financeira para motoboys e entregadores com integração de pagamentos.

## 🚀 Funcionalidades

- ✅ **Autenticação JWT** - Sistema completo de login/registro
- ✅ **Gestão de Transações** - Receitas e despesas
- ✅ **Categorias Personalizadas** - Organização financeira
- ✅ **Sessões de Trabalho** - Controle de jornada
- ✅ **Metas Financeiras** - Acompanhamento de objetivos
- ✅ **Integração Asaas** - Pagamentos e assinaturas
- ✅ **Webhooks** - Processamento automático de pagamentos
- ✅ **API REST** - Documentação automática com Swagger

## 🛠️ Tecnologias

- **FastAPI** - Framework web moderno
- **SQLAlchemy** - ORM para banco de dados
- **Pydantic** - Validação de dados
- **SQLite** - Banco de dados (desenvolvimento)
- **JWT** - Autenticação segura
- **Asaas** - Gateway de pagamentos
- **Pytest** - Testes automatizados

## 📦 Instalação

```bash
# Clonar repositório
git clone <repo-url>
cd rider_finance/backend

# Instalar dependências
pip install -r requirements.txt

# Configurar variáveis de ambiente
cp .env.example .env
# Editar .env com suas configurações

# Executar migrações
python scripts/init_db.py

# Iniciar servidor
python main.py
```

## 🔧 Configuração

### Variáveis de Ambiente (.env)

```properties
# Banco de dados
DATABASE_URL=sqlite:///./rider_finance.db

# JWT
SECRET_KEY=sua-chave-secreta
ACCESS_TOKEN_EXPIRE_MINUTES=30

# Asaas (Pagamentos)
ASAAS_API_KEY=sua-chave-asaas
ASAAS_BASE_URL=https://sandbox.asaas.com/api/v3
ASAAS_WEBHOOK_SECRET=seu-webhook-secret

# CORS
CORS_ORIGINS=["http://localhost:3000"]
```

## 🧪 Testes

```bash
# Executar todos os testes
python scripts/run_payment_tests.py

# Testes específicos
python tests/test_asaas_connection.py
python tests/test_api_endpoints.py

# Testar integração com Asaas
python tests/test_complete_flow.py
```

## 📚 API Endpoints

### Autenticação
- `POST /auth/register` - Registrar usuário
- `POST /auth/login` - Login
- `POST /auth/refresh` - Refresh token

### Transações
- `GET /transactions` - Listar transações
- `POST /transactions` - Criar transação
- `PUT /transactions/{id}` - Atualizar transação
- `DELETE /transactions/{id}` - Deletar transação

### Pagamentos
- `POST /api/v1/payments/subscriptions` - Criar assinatura
- `GET /api/v1/payments/subscriptions` - Listar assinaturas
- `DELETE /api/v1/payments/subscriptions/{id}` - Cancelar assinatura

### Webhooks
- `POST /webhooks/asaas/payment` - Webhook de pagamento
- `POST /webhooks/asaas/subscription` - Webhook de assinatura

## 🌐 Documentação da API

Acesse: `http://localhost:8000/docs`

## 🏗️ Estrutura do Projeto

```
backend/
├── main.py                 # Arquivo principal
├── api/                    # Rotas da API
├── config/                 # Configurações
├── models/                 # Modelos do banco
├── schemas/                # Schemas Pydantic
├── services/               # Lógica de negócio
├── utils/                  # Utilitários
├── tests/                  # Testes
└── scripts/                # Scripts auxiliares
```

## 🔄 Fluxo de Pagamentos

1. **Usuário se registra** na aplicação
2. **Cria assinatura** escolhendo um plano
3. **Sistema cria cliente** no Asaas
4. **Gera cobrança** automática
5. **Webhook notifica** sobre pagamentos
6. **Assinatura é ativada** automaticamente

## 🛡️ Segurança

- ✅ Autenticação JWT
- ✅ Validação de dados com Pydantic
- ✅ Rate limiting
- ✅ CORS configurado
- ✅ Middleware de segurança
- ✅ Validação de webhooks

## 📈 Monitoramento

- ✅ Logs estruturados
- ✅ Health check endpoint
- ✅ Métricas de API
- ✅ Error handling

## 🚀 Deploy

### Desenvolvimento
```bash
python main.py
```

### Produção
```bash
# Configurar variáveis de produção
export DATABASE_URL=postgresql://...
export ASAAS_BASE_URL=https://api.asaas.com/v3

# Executar com Gunicorn
gunicorn main:app -w 4 -k uvicorn.workers.UvicornWorker
```

## 🤝 Contribuição

1. Fork o projeto
2. Crie uma branch (`git checkout -b feature/nova-funcionalidade`)
3. Commit suas mudanças (`git commit -m 'Add: nova funcionalidade'`)
4. Push para a branch (`git push origin feature/nova-funcionalidade`)
5. Abra um Pull Request

## 📄 Licença

Este projeto está sob a licença MIT.
