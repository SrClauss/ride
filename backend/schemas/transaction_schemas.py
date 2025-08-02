"""
Schemas Pydantic para transações
"""
from pydantic import BaseModel, Field, field_validator, ConfigDict
from typing import Optional, List
from datetime import datetime

class TransactionCreate(BaseModel):
    """Schema para criação de transação"""
    id_categoria: str = Field(..., description="ID da categoria")
    valor: float = Field(..., gt=0, description="Valor da transação")
    tipo: str = Field(..., description="Tipo: receita ou despesa")
    descricao: Optional[str] = Field(None, max_length=1000, description="Descrição")
    data: Optional[datetime] = Field(None, description="Data da transação")
    origem: Optional[str] = Field(None, max_length=50, description="Origem da transação")
    id_externo: Optional[str] = Field(None, max_length=100, description="ID externo")
    plataforma: Optional[str] = Field(None, max_length=50, description="Plataforma")
    observacoes: Optional[str] = Field(None, description="Observações")
    tags: Optional[List[str]] = Field(None, description="Tags")

    @field_validator('tipo')
    @classmethod
    def validar_tipo(cls, v):
        if v not in ['receita', 'despesa']:
            raise ValueError("Tipo deve ser 'receita' ou 'despesa'")
        return v

    @field_validator('valor')
    @classmethod
    def validar_valor(cls, v):
        if v > 999999.99:
            raise ValueError("Valor muito alto")
        return round(v, 2)

class TransactionUpdate(BaseModel):
    """Schema para atualização de transação"""
    id_categoria: Optional[str] = None
    valor: Optional[float] = Field(None, gt=0)
    descricao: Optional[str] = Field(None, max_length=1000)
    data: Optional[datetime] = None
    observacoes: Optional[str] = None
    tags: Optional[List[str]] = None

    @field_validator('valor')
    @classmethod
    def validar_valor(cls, v):
        if v is not None and v > 999999.99:
            raise ValueError("Valor muito alto")
        return round(v, 2) if v is not None else v

class TransactionResponse(BaseModel):
    """Schema para resposta de transação"""
    id: str
    id_usuario: str
    id_categoria: str
    valor: float
    descricao: Optional[str]
    tipo: str
    data: datetime
    origem: Optional[str]
    id_externo: Optional[str]
    plataforma: Optional[str]
    observacoes: Optional[str]
    tags: Optional[str]
    criado_em: datetime
    nome_categoria: Optional[str]

    model_config = ConfigDict(from_attributes=True)

class TransactionFilters(BaseModel):
    """Schema para filtros de transação"""
    page: int = Field(1, ge=1, description="Página")
    per_page: int = Field(50, ge=1, le=100, description="Itens por página")
    tipo: Optional[str] = Field(None, description="Tipo: receita ou despesa")
    categoria_id: Optional[str] = Field(None, description="ID da categoria")
    data_inicio: Optional[datetime] = Field(None, description="Data inicial")
    data_fim: Optional[datetime] = Field(None, description="Data final")
    busca: Optional[str] = Field(None, description="Termo de busca")
    ordenar_por: str = Field("data", description="Campo para ordenação")
    ordem: str = Field("desc", description="Ordem: asc ou desc")

    @field_validator('tipo')
    @classmethod
    def validar_tipo(cls, v):
        if v and v not in ['receita', 'despesa']:
            raise ValueError("Tipo deve ser 'receita' ou 'despesa'")
        return v

    @field_validator('ordenar_por')
    @classmethod
    def validar_ordenar_por(cls, v):
        if v not in ['data', 'valor', 'categoria']:
            raise ValueError("ordenar_por deve ser 'data', 'valor' ou 'categoria'")
        return v

    @field_validator('ordem')
    @classmethod
    def validar_ordem(cls, v):
        if v not in ['asc', 'desc']:
            raise ValueError("ordem deve ser 'asc' ou 'desc'")
        return v

class TransactionSummary(BaseModel):
    """Schema para resumo de transações"""
    total_receitas: float
    total_despesas: float
    saldo: float
    count_receitas: int
    count_despesas: int
    total_transacoes: int

class TransactionByCategory(BaseModel):
    """Schema para transações por categoria"""
    categoria_id: str
    categoria_nome: str
    categoria_tipo: str
    categoria_cor: Optional[str]
    categoria_icone: Optional[str]
    total: float
    count: int

class DailyTransaction(BaseModel):
    """Schema para transações diárias"""
    data: str
    receitas: float
    despesas: float
    saldo: float
    count_receitas: int
    count_despesas: int
    total_transacoes: int
