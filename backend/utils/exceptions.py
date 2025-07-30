"""
Exceções customizadas da aplicação
"""
from typing import Optional, Any

class RiderFinanceException(Exception):
    """Exceção base da aplicação"""
    
    def __init__(self, message: str, code: str = "GENERIC_ERROR", details: Any = None):
        self.message = message
        self.code = code
        self.details = details
        super().__init__(self.message)

class ValidationError(RiderFinanceException):
    """Erro de validação"""
    
    def __init__(self, message: str, details: Any = None):
        super().__init__(message, "VALIDATION_ERROR", details)

class NotFoundError(RiderFinanceException):
    """Recurso não encontrado"""
    
    def __init__(self, resource: str, identifier: str = ""):
        message = f"{resource} não encontrado"
        if identifier:
            message += f": {identifier}"
        super().__init__(message, "NOT_FOUND")

class UnauthorizedError(RiderFinanceException):
    """Acesso não autorizado"""
    
    def __init__(self, message: str = "Acesso não autorizado"):
        super().__init__(message, "UNAUTHORIZED")

class ForbiddenError(RiderFinanceException):
    """Acesso proibido"""
    
    def __init__(self, message: str = "Acesso proibido"):
        super().__init__(message, "FORBIDDEN")

class ConflictError(RiderFinanceException):
    """Conflito de dados"""
    
    def __init__(self, message: str, details: Any = None):
        super().__init__(message, "CONFLICT", details)

class BusinessLogicError(RiderFinanceException):
    """Erro de lógica de negócio"""
    
    def __init__(self, message: str, details: Any = None):
        super().__init__(message, "BUSINESS_LOGIC_ERROR", details)

class PaymentRequiredError(RiderFinanceException):
    """Pagamento necessário"""
    
    def __init__(self, message: str = "Assinatura ativa necessária"):
        super().__init__(message, "PAYMENT_REQUIRED")

class TrialExpiredError(PaymentRequiredError):
    """Trial expirado"""
    
    def __init__(self):
        super().__init__("Período de trial expirado. Assine para continuar usando.")

class RateLimitError(RiderFinanceException):
    """Limite de taxa excedido"""
    
    def __init__(self, message: str = "Muitas requisições. Tente novamente em alguns minutos."):
        super().__init__(message, "RATE_LIMIT_EXCEEDED")
