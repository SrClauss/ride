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
    """Categorias de meta disponíveis (alinhadas com frontend)"""
    EMERGENCY = "emergency"
    INVESTMENT = "investment"
    PURCHASE = "purchase"
    TRAVEL = "travel"
    EDUCATION = "education"
    HEALTH = "health"
    OTHER = "other"


class StatusMeta(str, Enum):
    """Status de meta disponíveis (alinhados com frontend)"""
    ACTIVE = "active"
    COMPLETED = "completed"
    PAUSED = "paused"


class MetaBase(BaseModel):
    """Schema base para metas (alinhado com frontend)"""
    title: str = Field(..., min_length=1, max_length=200, description="Título da meta")
    description: Optional[str] = Field(None, max_length=1000, description="Descrição da meta")
    targetValue: Decimal = Field(..., gt=0, description="Valor alvo da meta")
    deadline: Optional[datetime] = Field(None, description="Data limite para atingir a meta")
    category: CategoriaMeta = Field(..., description="Categoria da meta")

    @field_validator('title')
    @classmethod
    def validate_title(cls, v: str) -> str:
        """Validar título da meta"""
        if not v or not v.strip():
            raise ValueError("Título da meta não pode estar vazio")
        return v.strip()

    @field_validator('deadline')
    @classmethod
    def validate_deadline(cls, v: Optional[datetime]) -> Optional[datetime]:
        """Validar deadline"""
        if v and v <= datetime.now():
            raise ValueError("Deadline deve ser no futuro")
        return v

    @field_validator('targetValue')
    @classmethod
    def validate_target_value(cls, v: Decimal) -> Decimal:
        """Validar valor alvo"""
        if v <= 0:
            raise ValueError("Valor alvo deve ser positivo")
        return v


class MetaCreate(MetaBase):
    """Schema para criação de meta"""
    currentValue: Optional[Decimal] = Field(
        default=Decimal("0.00"), 
        ge=0, 
        description="Valor atual já economizado"
    )

    @field_validator('currentValue')
    @classmethod
    def validate_current_value(cls, v: Optional[Decimal]) -> Decimal:
        """Validar valor atual"""
        if v is None:
            return Decimal("0.00")
        if v < 0:
            raise ValueError("Valor atual não pode ser negativo")
        return v


class MetaUpdate(BaseModel):
    """Schema para atualização de meta"""
    title: Optional[str] = Field(None, min_length=1, max_length=200)
    description: Optional[str] = Field(None, max_length=1000)
    category: Optional[CategoriaMeta] = None
    targetValue: Optional[Decimal] = Field(None, gt=0)
    deadline: Optional[datetime] = None
    status: Optional[StatusMeta] = None

    @field_validator('title')
    @classmethod
    def validate_title(cls, v: Optional[str]) -> Optional[str]:
        """Validar título da meta"""
        if v is not None:
            if not v or not v.strip():
                raise ValueError("Nome da meta não pode estar vazio")
            return v.strip()
        return v

    @field_validator('deadline')
    @classmethod
    def validate_deadline(cls, v: Optional[datetime]) -> Optional[datetime]:
        """Validar deadline"""
        if v and v <= datetime.now():
            raise ValueError("Deadline deve ser no futuro")
        return v

    @field_validator('targetValue')
    @classmethod
    def validate_target_value(cls, v: Optional[Decimal]) -> Optional[Decimal]:
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
    """Schema de resposta para meta (alinhado com frontend)"""
    id: str
    title: str
    description: Optional[str]
    targetValue: Decimal
    currentValue: Decimal
    deadline: Optional[datetime]
    category: CategoriaMeta
    status: StatusMeta
    createdAt: datetime
    updatedAt: datetime

    model_config = ConfigDict(from_attributes=True)
    
    @field_serializer('targetValue', 'currentValue')
    def serialize_decimal(self, value):
        if isinstance(value, Decimal):
            return float(value)
        return value
        
    @field_serializer('createdAt', 'updatedAt', 'deadline')
    def serialize_datetime(self, value):
        if isinstance(value, datetime):
            return value.isoformat()
        return value
