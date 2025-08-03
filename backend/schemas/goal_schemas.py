"""
Schemas Pydantic para metas/goals
"""
from typing import Optional
from datetime import datetime
from decimal import Decimal
from enum import Enum
from pydantic import BaseModel, Field, field_validator, ConfigDict, field_serializer


class TipoMeta(str, Enum):
    """Tipos de meta disponíveis"""
    ECONOMIA = "economia"
    GASTO = "gasto"
    RECEITA = "receita"


class CategoriaMeta(str, Enum):
    """Categorias de meta disponíveis"""
    EMERGENCIA = "emergencia"
    LAZER = "lazer"
    EDUCACAO = "educacao"
    SAUDE = "saude"
    TRANSPORTE = "transporte"
    ALIMENTACAO = "alimentacao"
    MORADIA = "moradia"
    INVESTIMENTO = "investimento"
    DIVIDAS = "dividas"
    OUTROS = "outros"


class MetaBase(BaseModel):
    """Schema base para metas"""
    nome: str = Field(..., min_length=1, max_length=200, description="Nome da meta")
    descricao: Optional[str] = Field(None, max_length=1000, description="Descrição da meta")
    tipo: TipoMeta = Field(..., description="Tipo da meta")
    categoria: CategoriaMeta = Field(..., description="Categoria da meta")
    valor_alvo: Decimal = Field(..., gt=0, description="Valor alvo da meta")
    data_limite: Optional[datetime] = Field(None, description="Data limite para atingir a meta")

    @field_validator('nome')
    @classmethod
    def validate_nome(cls, v: str) -> str:
        """Validar nome da meta"""
        if not v or not v.strip():
            raise ValueError("Nome da meta não pode estar vazio")
        return v.strip()

    @field_validator('data_limite')
    @classmethod
    def validate_data_limite(cls, v: Optional[datetime]) -> Optional[datetime]:
        """Validar data limite"""
        if v and v <= datetime.now():
            raise ValueError("Data limite deve ser no futuro")
        return v

    @field_validator('valor_alvo')
    @classmethod
    def validate_valor_alvo(cls, v: Decimal) -> Decimal:
        """Validar valor alvo"""
        if v <= 0:
            raise ValueError("Valor alvo deve ser positivo")
        return v


class MetaCreate(MetaBase):
    """Schema para criação de meta"""
    valor_inicial: Optional[Decimal] = Field(
        default=Decimal("0.00"), 
        ge=0, 
        description="Valor inicial já economizado/gasto"
    )

    @field_validator('valor_inicial')
    @classmethod
    def validate_valor_inicial(cls, v: Optional[Decimal]) -> Decimal:
        """Validar valor inicial"""
        if v is None:
            return Decimal("0.00")
        if v < 0:
            raise ValueError("Valor inicial não pode ser negativo")
        return v


class MetaUpdate(BaseModel):
    """Schema para atualização de meta"""
    nome: Optional[str] = Field(None, min_length=1, max_length=200)
    descricao: Optional[str] = Field(None, max_length=1000)
    tipo: Optional[TipoMeta] = None
    categoria: Optional[CategoriaMeta] = None
    valor_alvo: Optional[Decimal] = Field(None, gt=0)
    data_limite: Optional[datetime] = None

    @field_validator('nome')
    @classmethod
    def validate_nome(cls, v: Optional[str]) -> Optional[str]:
        """Validar nome da meta"""
        if v is not None:
            if not v or not v.strip():
                raise ValueError("Nome da meta não pode estar vazio")
            return v.strip()
        return v

    @field_validator('data_limite')
    @classmethod
    def validate_data_limite(cls, v: Optional[datetime]) -> Optional[datetime]:
        """Validar data limite"""
        if v and v <= datetime.now():
            raise ValueError("Data limite deve ser no futuro")
        return v

    @field_validator('valor_alvo')
    @classmethod
    def validate_valor_alvo(cls, v: Optional[Decimal]) -> Optional[Decimal]:
        """Validar valor alvo"""
        if v is not None and v <= 0:
            raise ValueError("Valor alvo deve ser positivo")
        return v


class MetaProgressUpdate(BaseModel):
    """Schema para atualização de progresso da meta"""
    valor_adicional: Decimal = Field(..., description="Valor a ser adicionado (pode ser negativo)")
    observacoes: Optional[str] = Field(None, max_length=500, description="Observações sobre o progresso")

    @field_validator('observacoes')
    @classmethod
    def validate_observacoes(cls, v: Optional[str]) -> Optional[str]:
        """Validar observações"""
        if v is not None and v.strip():
            return v.strip()
        return None


class MetaResponse(BaseModel):
    """Schema de resposta para meta"""
    id: str
    user_id: str
    nome: str
    descricao: Optional[str]
    tipo: str
    categoria: str
    valor_alvo: Decimal
    valor_atual: Decimal
    percentual_progresso: float
    meta_atingida: bool
    ativa: bool
    data_limite: Optional[datetime]
    created_at: datetime
    updated_at: datetime

    model_config = ConfigDict(from_attributes=True)
    
    @field_serializer('valor_alvo', 'valor_atual', 'percentual_progresso')
    def serialize_decimal(self, value):
        if isinstance(value, Decimal):
            return float(value)
        return value
        
    @field_serializer('created_at', 'updated_at', 'data_limite')
    def serialize_datetime(self, value):
        if isinstance(value, datetime):
            return value.isoformat()
        return value
