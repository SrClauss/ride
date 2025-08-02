"""
Schemas Pydantic para autenticação
"""
from pydantic import BaseModel, EmailStr, Field, ConfigDict
from typing import Optional
from datetime import datetime

class UserRegister(BaseModel):
    """Schema para registro de usuário"""
    nome_usuario: str = Field(..., min_length=3, max_length=50, description="Nome de usuário")
    email: EmailStr = Field(..., description="Email do usuário")
    senha: str = Field(..., min_length=6, description="Senha do usuário")
    nome_completo: Optional[str] = Field(None, max_length=100, description="Nome completo")
    telefone: Optional[str] = Field(None, max_length=20, description="Telefone")

class UserLogin(BaseModel):
    """Schema para login de usuário"""
    login: str = Field(..., description="Email ou nome de usuário")
    senha: str = Field(..., description="Senha")

class TokenResponse(BaseModel):
    """Schema para resposta de token"""
    access_token: str
    refresh_token: str
    token_type: str = "bearer"
    expires_in: int

class TokenRefresh(BaseModel):
    """Schema para refresh de token"""
    refresh_token: str

class ChangePassword(BaseModel):
    """Schema para alteração de senha"""
    senha_atual: str = Field(..., description="Senha atual")
    nova_senha: str = Field(..., min_length=6, description="Nova senha")

class UserProfile(BaseModel):
    """Schema para perfil do usuário"""
    id: str
    nome_usuario: str
    email: str
    nome_completo: Optional[str]
    telefone: Optional[str]
    eh_pago: bool
    status_pagamento: str
    tipo_assinatura: str
    trial_termina_em: Optional[datetime]
    criado_em: datetime

    model_config = ConfigDict(from_attributes=True)

class UserUpdate(BaseModel):
    """Schema para atualização de perfil"""
    nome_completo: Optional[str] = Field(None, max_length=100)
    telefone: Optional[str] = Field(None, max_length=20)
