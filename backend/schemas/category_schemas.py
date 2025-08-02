"""
Schemas Pydantic para categorias
"""
from pydantic import BaseModel, Field, field_validator, ConfigDict
from typing import Optional
from datetime import datetime
import re

class CategoryCreate(BaseModel):
    """Schema para criação de categoria"""
    nome: str = Field(..., min_length=2, max_length=100, description="Nome da categoria")
    tipo: str = Field(..., description="Tipo: receita ou despesa")
    icone: Optional[str] = Field("fas fa-circle", description="Classe do ícone Font Awesome")
    cor: Optional[str] = Field("#6B7280", description="Cor hexadecimal")

    @field_validator('tipo')
    @classmethod
    def validar_tipo(cls, v):
        if v not in ['receita', 'despesa']:
            raise ValueError("Tipo deve ser 'receita' ou 'despesa'")
        return v

    @field_validator('cor')
    @classmethod
    def validar_cor(cls, v):
        if v and not re.match(r'^#[0-9A-Fa-f]{6}$', v):
            raise ValueError("Cor deve estar no formato hexadecimal (#RRGGBB)")
        return v

class CategoryUpdate(BaseModel):
    """Schema para atualização de categoria"""
    nome: Optional[str] = Field(None, min_length=2, max_length=100)
    icone: Optional[str] = None
    cor: Optional[str] = None

    @field_validator('cor')
    @classmethod
    def validar_cor(cls, v):
        if v and not re.match(r'^#[0-9A-Fa-f]{6}$', v):
            raise ValueError("Cor deve estar no formato hexadecimal (#RRGGBB)")
        return v

class CategoryResponse(BaseModel):
    """Schema para resposta de categoria"""
    id: str
    id_usuario: str
    nome: str
    tipo: str
    icone: Optional[str]
    cor: Optional[str]
    eh_padrao: bool
    eh_ativa: bool
    criado_em: datetime

    model_config = ConfigDict(from_attributes=True)

class CategoryUsageStats(BaseModel):
    """Schema para estatísticas de uso da categoria"""
    categoria: CategoryResponse
    total_transacoes: int
    valor_total: float
    ultima_transacao: Optional[datetime]
