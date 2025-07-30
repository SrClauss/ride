"""
Sistema de logging avançado
"""
import logging
import sys
from pathlib import Path
from datetime import datetime
import json

class StructuredFormatter(logging.Formatter):
    """Formatter para logs estruturados em JSON"""
    
    def format(self, record):
        log_data = {
            'timestamp': datetime.utcnow().isoformat(),
            'level': record.levelname,
            'module': record.name,
            'message': record.getMessage(),
            'function': record.funcName,
            'line': record.lineno
        }
        
        # Adicionar informações extras se existirem
        if hasattr(record, 'user_id'):
            log_data['user_id'] = record.user_id
        
        if hasattr(record, 'request_id'):
            log_data['request_id'] = record.request_id
        
        if hasattr(record, 'duration'):
            log_data['duration'] = record.duration
        
        if record.exc_info:
            log_data['exception'] = self.formatException(record.exc_info)
        
        return json.dumps(log_data, ensure_ascii=False)

def setup_advanced_logging():
    """Configurar sistema de logging avançado"""
    
    # Criar diretório de logs se não existir
    logs_dir = Path("logs")
    logs_dir.mkdir(exist_ok=True)
    
    # Configurar logger raiz
    root_logger = logging.getLogger()
    root_logger.setLevel(logging.INFO)
    
    # Limpar handlers existentes
    root_logger.handlers.clear()
    
    # Handler para console (desenvolvimento)
    console_handler = logging.StreamHandler(sys.stdout)
    console_handler.setLevel(logging.INFO)
    console_formatter = logging.Formatter(
        '%(asctime)s - %(name)s - %(levelname)s - %(message)s'
    )
    console_handler.setFormatter(console_formatter)
    root_logger.addHandler(console_handler)
    
    # Handler para arquivo de aplicação
    app_handler = logging.FileHandler(logs_dir / "app.log")
    app_handler.setLevel(logging.INFO)
    app_handler.setFormatter(StructuredFormatter())
    root_logger.addHandler(app_handler)
    
    # Handler para erros
    error_handler = logging.FileHandler(logs_dir / "error.log")
    error_handler.setLevel(logging.ERROR)
    error_handler.setFormatter(StructuredFormatter())
    root_logger.addHandler(error_handler)
    
    # Handler para pagamentos (logs específicos)
    payments_handler = logging.FileHandler(logs_dir / "payments.log")
    payments_handler.setLevel(logging.INFO)
    payments_handler.setFormatter(StructuredFormatter())
    
    # Logger específico para pagamentos
    payments_logger = logging.getLogger("payments")
    payments_logger.addHandler(payments_handler)
    payments_logger.setLevel(logging.INFO)
    
    return root_logger

# Logger personalizado para requests
class RequestLogger:
    """Logger personalizado para requisições"""
    
    def __init__(self):
        self.logger = logging.getLogger("requests")
    
    def log_request(self, method: str, url: str, user_id: str = None, 
                   duration: float = None, status_code: int = None):
        """Log de requisição"""
        extra = {}
        if user_id:
            extra['user_id'] = user_id
        if duration:
            extra['duration'] = duration
        if status_code:
            extra['status_code'] = status_code
        
        self.logger.info(f"{method} {url}", extra=extra)
    
    def log_error(self, error: Exception, context: dict = None):
        """Log de erro com contexto"""
        extra = context or {}
        self.logger.error(f"Erro: {str(error)}", extra=extra, exc_info=True)

# Logger para pagamentos
class PaymentLogger:
    """Logger específico para operações de pagamento"""
    
    def __init__(self):
        self.logger = logging.getLogger("payments")
    
    def log_payment_created(self, payment_id: str, user_id: str, amount: float):
        """Log de pagamento criado"""
        self.logger.info(
            f"Pagamento criado: {payment_id}",
            extra={
                'payment_id': payment_id,
                'user_id': user_id,
                'amount': amount,
                'event': 'payment_created'
            }
        )
    
    def log_webhook_received(self, event: str, payment_id: str = None):
        """Log de webhook recebido"""
        extra = {
            'event': 'webhook_received',
            'webhook_event': event
        }
        if payment_id:
            extra['payment_id'] = payment_id
        
        self.logger.info(f"Webhook recebido: {event}", extra=extra)
    
    def log_subscription_status_change(self, subscription_id: str, 
                                     old_status: str, new_status: str):
        """Log de mudança de status de assinatura"""
        self.logger.info(
            f"Status da assinatura alterado: {subscription_id}",
            extra={
                'subscription_id': subscription_id,
                'old_status': old_status,
                'new_status': new_status,
                'event': 'subscription_status_change'
            }
        )
