"""
Middleware personalizado para a aplicação
"""
from fastapi import Request, Response
from starlette.middleware.base import BaseHTTPMiddleware
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
import time
import uuid
import logging

logger = logging.getLogger(__name__)

class RequestIDMiddleware(BaseHTTPMiddleware):
    """Middleware para adicionar ID único a cada requisição"""
    
    async def dispatch(self, request: Request, call_next):
        # Gerar ID único para a requisição
        request_id = str(uuid.uuid4())
        request.state.request_id = request_id
        
        # Adicionar ao header de resposta
        response = await call_next(request)
        response.headers["X-Request-ID"] = request_id
        
        return response

class LoggingMiddleware(BaseHTTPMiddleware):
    """Middleware para logging de requisições"""
    
    async def dispatch(self, request: Request, call_next):
        start_time = time.time()
        
        # Log da requisição
        logger.info(
            f"Requisição iniciada: {request.method} {request.url.path} "
            f"- IP: {request.client.host} "
            f"- User-Agent: {request.headers.get('user-agent', 'N/A')}"
        )
        
        response = await call_next(request)
        
        # Calcular tempo de processamento
        process_time = time.time() - start_time
        
        # Log da resposta
        logger.info(
            f"Requisição concluída: {request.method} {request.url.path} "
            f"- Status: {response.status_code} "
            f"- Tempo: {process_time:.3f}s"
        )
        
        # Adicionar header de tempo de processamento
        response.headers["X-Process-Time"] = str(process_time)
        
        return response

class ErrorHandlerMiddleware(BaseHTTPMiddleware):
    """Middleware para tratamento global de erros"""
    
    async def dispatch(self, request: Request, call_next):
        try:
            response = await call_next(request)
            return response
            
        except Exception as e:
            request_id = getattr(request.state, 'request_id', 'unknown')
            
            logger.error(
                f"Erro não tratado [Request ID: {request_id}]: {str(e)}",
                exc_info=True
            )
            
            return JSONResponse(
                status_code=500,
                content={
                    "error": "Erro interno do servidor",
                    "request_id": request_id,
                    "message": "Entre em contato com o suporte técnico"
                }
            )

class SecurityHeadersMiddleware(BaseHTTPMiddleware):
    """Middleware para adicionar headers de segurança"""
    
    async def dispatch(self, request: Request, call_next):
        response = await call_next(request)
        
        # Headers de segurança
        response.headers["X-Content-Type-Options"] = "nosniff"
        response.headers["X-Frame-Options"] = "DENY"
        response.headers["X-XSS-Protection"] = "1; mode=block"
        response.headers["Referrer-Policy"] = "strict-origin-when-cross-origin"
        response.headers["Permissions-Policy"] = "geolocation=(), microphone=(), camera=()"
        
        return response

def setup_cors(app):
    """Configurar CORS"""
    app.add_middleware(
        CORSMiddleware,
        allow_origins=[
            "http://localhost:3000",  # React dev
            "http://localhost:5173",  # Vite dev
            "https://riderfinance.app",  # Produção
            "https://*.riderfinance.app",  # Subdomínios
        ],
        allow_credentials=True,
        allow_methods=["GET", "POST", "PUT", "DELETE", "OPTIONS", "PATCH"],
        allow_headers=["*"],
        expose_headers=["X-Request-ID", "X-Process-Time"]
    )

def setup_middleware(app):
    """Configurar todos os middlewares"""
    
    # Ordem importa! Do último para o primeiro na execução
    app.add_middleware(SecurityHeadersMiddleware)
    app.add_middleware(ErrorHandlerMiddleware)
    app.add_middleware(LoggingMiddleware)
    app.add_middleware(RequestIDMiddleware)
    
    # CORS por último
    setup_cors(app)
