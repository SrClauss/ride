"""
Aplicação principal FastAPI
"""
from fastapi import FastAPI, HTTPException, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.middleware.trustedhost import TrustedHostMiddleware
from fastapi.responses import JSONResponse
from contextlib import asynccontextmanager

from config.settings import settings
from config.database import create_tables
from config.logging_config import logger
from utils.exceptions import RiderFinanceException
from utils.helpers import ResponseFormatter
from utils.middleware import setup_middleware

# Importar routers
from api.auth import router as auth_router
from api.categories import router as categories_router
from api.transactions import router as transactions_router
from api.payments import router as payments_router
from api.webhooks import router as webhooks_router

@asynccontextmanager
async def lifespan(app: FastAPI):
    """Gerencia o ciclo de vida da aplicação"""
    # Startup
    logger.info("Iniciando aplicação Rider Finance")
    create_tables()
    logger.info("Tabelas do banco de dados criadas/verificadas")
    
    # Configurar webhooks do Asaas
    try:
        from services.asaas_service import AsaasService
        from config.payments import PaymentConfig
        
        asaas = AsaasService()
        
        # Criar webhooks se não existirem
        webhook_url = PaymentConfig.get_webhook_url("asaas/payment")
        events = [
            "PAYMENT_CREATED",
            "PAYMENT_UPDATED", 
            "PAYMENT_RECEIVED",
            "PAYMENT_OVERDUE",
            "PAYMENT_DELETED",
            "PAYMENT_RESTORED"
        ]
        
        existing_webhooks = await asaas.get_webhooks()
        webhook_exists = any(w.get('url') == webhook_url for w in existing_webhooks)
        
        if not webhook_exists:
            await asaas.create_webhook(webhook_url, events)
            logger.info(f"Webhook criado: {webhook_url}")
        else:
            logger.info("Webhooks já configurados")
            
    except Exception as e:
        logger.warning(f"Erro ao configurar webhooks: {str(e)}")
    
    yield
    
    # Shutdown
    logger.info("Encerrando aplicação Rider Finance")

# Criação da aplicação
app = FastAPI(
    title=settings.APP_NAME,
    version=settings.APP_VERSION,
    description="API para gestão financeira de motoristas de aplicativo",
    lifespan=lifespan
)

# Configurar middleware
setup_middleware(app)

# Middleware de hosts confiáveis (opcional para produção)
if not settings.DEBUG:
    app.add_middleware(
        TrustedHostMiddleware,
        allowed_hosts=["*"]  # Configure com seus domínios em produção
    )

# Handlers de exceção
@app.exception_handler(RiderFinanceException)
async def rider_finance_exception_handler(request: Request, exc: RiderFinanceException):
    """Handler para exceções customizadas"""
    logger.warning(f"Exceção da aplicação: {exc.message} - {exc.code}")
    return JSONResponse(
        status_code=400,
        content=ResponseFormatter.error(exc.message, exc.code, exc.details)
    )

@app.exception_handler(404)
async def not_found_handler(request: Request, exc: HTTPException):
    """Handler para 404"""
    return JSONResponse(
        status_code=404,
        content=ResponseFormatter.error("Recurso não encontrado", "NOT_FOUND")
    )

@app.exception_handler(500)
async def internal_error_handler(request: Request, exc: Exception):
    """Handler para erros internos"""
    logger.error(f"Erro interno: {str(exc)}")
    return JSONResponse(
        status_code=500,
        content=ResponseFormatter.error("Erro interno do servidor", "INTERNAL_ERROR")
    )

# Middleware de logging de requisições
@app.middleware("http")
async def log_requests(request: Request, call_next):
    """Log de requisições HTTP"""
    logger.info(f"Requisição: {request.method} {request.url}")
    
    response = await call_next(request)
    
    logger.info(f"Resposta: {request.method} {request.url} - Status: {response.status_code}")
    
    return response

# Rotas da API
app.include_router(auth_router)
app.include_router(categories_router)
app.include_router(transactions_router)
app.include_router(payments_router)
app.include_router(webhooks_router)

# Rota de health check
@app.get("/health")
def health_check():
    """Endpoint de verificação de saúde"""
    return ResponseFormatter.success(
        data={
            "status": "healthy",
            "version": settings.APP_VERSION,
            "app": settings.APP_NAME
        },
        message="Aplicação funcionando normalmente"
    )

# Rota raiz
@app.get("/")
def root():
    """Endpoint raiz"""
    return ResponseFormatter.success(
        data={
            "app": settings.APP_NAME,
            "version": settings.APP_VERSION,
            "docs": "/docs",
            "health": "/health"
        },
        message="Bem-vindo à API do Rider Finance"
    )

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(
        "main:app",
        host="0.0.0.0",
        port=8000,
        reload=settings.DEBUG
    )
