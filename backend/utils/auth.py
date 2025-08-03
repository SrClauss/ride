"""
Utilitários de autenticação JWT
"""
from datetime import datetime, timedelta, timezone
from typing import Optional, Dict, Any
import jwt
from passlib.context import CryptContext
from fastapi import Depends, HTTPException, status
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from sqlalchemy.orm import Session
from config.settings import settings
from config.database import get_db

# Context para hash de senhas
pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

# Security scheme for JWT
security = HTTPBearer()

class JWTHandler:
    """Classe para manipulação de tokens JWT"""
    
    @staticmethod
    def create_access_token(data: Dict[str, Any], expires_delta: Optional[timedelta] = None) -> str:
        """Criar token de acesso"""
        to_encode = data.copy()
        if expires_delta:
            expire = datetime.now(timezone.utc) + expires_delta
        else:
            expire = datetime.now(timezone.utc) + timedelta(minutes=settings.ACCESS_TOKEN_EXPIRE_MINUTES)
        
        to_encode.update({"exp": expire, "type": "access"})
        return jwt.encode(to_encode, settings.SECRET_KEY, algorithm=settings.ALGORITHM)
    
    @staticmethod
    def create_refresh_token(data: Dict[str, Any]) -> str:
        """Criar token de refresh"""
        to_encode = data.copy()
        expire = datetime.now(timezone.utc) + timedelta(days=settings.REFRESH_TOKEN_EXPIRE_DAYS)
        to_encode.update({"exp": expire, "type": "refresh"})
        return jwt.encode(to_encode, settings.SECRET_KEY, algorithm=settings.ALGORITHM)
    
    @staticmethod
    def decode_token(token: str) -> Optional[Dict[str, Any]]:
        """Decodificar token JWT"""
        try:
            payload = jwt.decode(token, settings.SECRET_KEY, algorithms=[settings.ALGORITHM])
            return payload
        except jwt.PyJWTError:
            return None
    
    @staticmethod
    def verify_token_type(token: str, expected_type: str) -> bool:
        """Verificar o tipo do token (access ou refresh)"""
        payload = JWTHandler.decode_token(token)
        if payload:
            return payload.get("type") == expected_type
        return False
    
    @staticmethod
    def get_user_id_from_token(token: str) -> Optional[str]:
        """Extrair ID do usuário do token JWT"""
        payload = JWTHandler.decode_token(token)
        if payload and payload.get("type") == "access":
            return payload.get("sub")
        return None

class PasswordHandler:
    """Classe para manipulação de senhas"""
    
    @staticmethod
    def hash_password(password: str) -> str:
        """Gerar hash da senha"""
        return pwd_context.hash(password)
    
    @staticmethod
    def verify_password(plain_password: str, hashed_password: str) -> bool:
        """Verificar se a senha está correta"""
        return pwd_context.verify(plain_password, hashed_password)

def get_current_user_id(token: str) -> Optional[str]:
    """Extrair ID do usuário do token JWT"""
    payload = JWTHandler.decode_token(token)
    if payload and payload.get("type") == "access":
        return payload.get("sub")
    return None

def get_current_user(
    credentials: HTTPAuthorizationCredentials = Depends(security),
    db: Session = Depends(get_db)
):
    """Dependency para obter o usuário atual autenticado"""
    from models import Usuario  # Import local para evitar circular imports
    
    credentials_exception = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Could not validate credentials",
        headers={"WWW-Authenticate": "Bearer"},
    )
    
    try:
        payload = JWTHandler.decode_token(credentials.credentials)
        if payload is None or payload.get("type") != "access":
            raise credentials_exception
        
        user_id: str = payload.get("sub")
        if user_id is None:
            raise credentials_exception
            
    except jwt.PyJWTError:
        raise credentials_exception
    
    user = db.query(Usuario).filter(Usuario.id == user_id).first()
    if user is None:
        raise credentials_exception
    
    return user

def verify_password(plain_password: str, hashed_password: str) -> bool:
    """Verificar senha (função auxiliar)"""
    return PasswordHandler.verify_password(plain_password, hashed_password)

def get_password_hash(password: str) -> str:
    """Gerar hash da senha (função auxiliar)"""
    return PasswordHandler.hash_password(password)
