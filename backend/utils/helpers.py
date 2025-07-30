"""
Utilitários gerais da aplicação
"""
import hashlib
import secrets
from datetime import datetime, timezone, timedelta
from typing import Optional, Any, Dict
import ulid
import json
from passlib.context import CryptContext

# Contexto para hash de senhas
pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

def generate_ulid() -> str:
    """Gera um novo ULID como string"""
    return str(ulid.ULID())

def hash_password(password: str) -> str:
    """Gera hash da senha"""
    return pwd_context.hash(password)

def verify_password(plain_password: str, hashed_password: str) -> bool:
    """Verifica se a senha está correta"""
    return pwd_context.verify(plain_password, hashed_password)

def generate_random_token(length: int = 32) -> str:
    """Gera token aleatório"""
    return secrets.token_urlsafe(length)

def now_utc() -> datetime:
    """Retorna datetime atual em UTC"""
    return datetime.now(timezone.utc)

def format_currency(value: float, currency: str = "BRL") -> str:
    """Formata valor como moeda"""
    if currency == "BRL":
        return f"R$ {value:,.2f}".replace(",", "X").replace(".", ",").replace("X", ".")
    return f"{value:,.2f}"

def calculate_trial_end_date(days: int = 7) -> datetime:
    """Calcula data de fim do trial"""
    return now_utc() + timedelta(days=days)

def is_trial_expired(trial_end_date: Optional[datetime]) -> bool:
    """Verifica se o trial expirou"""
    if not trial_end_date:
        return True
    return now_utc() > trial_end_date

def sanitize_string(text: Optional[str]) -> Optional[str]:
    """Sanitiza string removendo espaços e caracteres especiais"""
    if not text:
        return None
    return text.strip()

def parse_tags(tags_str: Optional[str]) -> list:
    """Converte string de tags em lista"""
    if not tags_str:
        return []
    
    try:
        # Tenta parsear como JSON
        return json.loads(tags_str)
    except json.JSONDecodeError:
        # Se falhar, divide por vírgulas
        return [tag.strip() for tag in tags_str.split(",") if tag.strip()]

def tags_to_string(tags: list) -> str:
    """Converte lista de tags para string JSON"""
    return json.dumps(tags) if tags else ""

def calculate_percentage(current: float, target: float) -> float:
    """Calcula porcentagem de progresso"""
    if target <= 0:
        return 0
    return min(100, (current / target) * 100)

def get_period_dates(period_type: str, date: Optional[datetime] = None) -> tuple[datetime, datetime]:
    """
    Retorna data de início e fim para um período
    """
    if not date:
        date = now_utc()
    
    if period_type == "diaria":
        start = date.replace(hour=0, minute=0, second=0, microsecond=0)
        end = start + timedelta(days=1) - timedelta(microseconds=1)
    
    elif period_type == "semanal":
        # Segunda-feira da semana
        days_since_monday = date.weekday()
        start = (date - timedelta(days=days_since_monday)).replace(hour=0, minute=0, second=0, microsecond=0)
        end = start + timedelta(days=7) - timedelta(microseconds=1)
    
    elif period_type == "mensal":
        start = date.replace(day=1, hour=0, minute=0, second=0, microsecond=0)
        if start.month == 12:
            end = start.replace(year=start.year + 1, month=1)
        else:
            end = start.replace(month=start.month + 1)
        end = end - timedelta(microseconds=1)
    
    elif period_type == "anual":
        start = date.replace(month=1, day=1, hour=0, minute=0, second=0, microsecond=0)
        end = start.replace(year=start.year + 1) - timedelta(microseconds=1)
    
    else:
        raise ValueError(f"Tipo de período inválido: {period_type}")
    
    return start, end

def mask_email(email: str) -> str:
    """Mascara email para logs"""
    if "@" not in email:
        return email
    
    local, domain = email.split("@", 1)
    if len(local) <= 2:
        masked_local = "*" * len(local)
    else:
        masked_local = local[0] + "*" * (len(local) - 2) + local[-1]
    
    return f"{masked_local}@{domain}"

def validate_hex_color(color: str) -> bool:
    """Valida se é uma cor hexadecimal válida"""
    import re
    return bool(re.match(r'^#[0-9A-Fa-f]{6}$', color))

class ResponseFormatter:
    """Formatador de respostas da API"""
    
    @staticmethod
    def success(data: Any = None, message: str = "Sucesso") -> Dict[str, Any]:
        """Resposta de sucesso"""
        return {
            "success": True,
            "message": message,
            "data": data,
            "timestamp": now_utc().isoformat()
        }
    
    @staticmethod
    def error(message: str = "Erro interno", code: str = "INTERNAL_ERROR", details: Any = None) -> Dict[str, Any]:
        """Resposta de erro"""
        return {
            "success": False,
            "message": message,
            "code": code,
            "details": details,
            "timestamp": now_utc().isoformat()
        }
    
    @staticmethod
    def paginated(data: list, total: int, page: int, per_page: int) -> Dict[str, Any]:
        """Resposta paginada"""
        total_pages = (total + per_page - 1) // per_page
        
        return {
            "success": True,
            "data": data,
            "pagination": {
                "total": total,
                "page": page,
                "per_page": per_page,
                "total_pages": total_pages,
                "has_next": page < total_pages,
                "has_prev": page > 1
            },
            "timestamp": now_utc().isoformat()
        }
