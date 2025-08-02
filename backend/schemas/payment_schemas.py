"""
Schemas para pagamentos e assinaturas
"""
from pydantic import BaseModel, Field, field_validator, ConfigDict
from typing import Optional, List, Dict, Any
from datetime import datetime
from enum import Enum

class BillingType(str, Enum):
    """Tipos de cobrança do Asaas"""
    BOLETO = "BOLETO"
    CREDIT_CARD = "CREDIT_CARD" 
    PIX = "PIX"
    UNDEFINED = "UNDEFINED"

class PaymentStatus(str, Enum):
    """Status do pagamento"""
    PENDING = "PENDING"
    RECEIVED = "RECEIVED"
    CONFIRMED = "CONFIRMED"
    OVERDUE = "OVERDUE"
    REFUNDED = "REFUNDED"
    RECEIVED_IN_CASH = "RECEIVED_IN_CASH"
    REFUND_REQUESTED = "REFUND_REQUESTED"
    CHARGEBACK_REQUESTED = "CHARGEBACK_REQUESTED"
    CHARGEBACK_DISPUTE = "CHARGEBACK_DISPUTE"
    AWAITING_CHARGEBACK_REVERSAL = "AWAITING_CHARGEBACK_REVERSAL"

class SubscriptionStatus(str, Enum):
    """Status da assinatura"""
    ACTIVE = "ACTIVE"
    INACTIVE = "INACTIVE"
    EXPIRED = "EXPIRED"

class PlanType(str, Enum):
    """Tipos de plano"""
    BASIC = "basic"
    PRO = "pro" 
    PREMIUM = "premium"

# Schemas de Request
class CreateCustomerRequest(BaseModel):
    """Criar cliente no Asaas"""
    name: str = Field(..., min_length=1, max_length=100)
    email: str = Field(..., pattern=r'^[^@]+@[^@]+\.[^@]+$')
    phone: Optional[str] = Field(None, pattern=r'^\+?[\d\s\-\(\)]+$')
    cpfCnpj: Optional[str] = None
    
    model_config = ConfigDict(
        json_schema_extra={
            "example": {
                "name": "João Silva",
                "email": "joao@email.com",
                "phone": "+5511999999999",
                "cpfCnpj": "12345678901"
            }
        }
    )

class CreatePaymentRequest(BaseModel):
    """Criar cobrança no Asaas"""
    customer: str  # ID do cliente
    billingType: BillingType
    value: float = Field(..., gt=0)
    dueDate: str  # YYYY-MM-DD
    description: Optional[str] = None
    externalReference: Optional[str] = None
    
    @field_validator('value')
    @classmethod
    def validate_value(cls, v):
        if v <= 0:
            raise ValueError('Valor deve ser maior que zero')
        return round(v, 2)

class CreateSubscriptionRequest(BaseModel):
    """Criar assinatura no Asaas"""
    customer: str  # ID do cliente
    billingType: BillingType
    nextDueDate: str  # YYYY-MM-DD
    value: float = Field(..., gt=0)
    cycle: str = Field(default="MONTHLY")  # WEEKLY, MONTHLY, QUARTERLY, YEARLY
    description: Optional[str] = None
    
class UpdateSubscriptionRequest(BaseModel):
    """Atualizar assinatura"""
    value: Optional[float] = None
    nextDueDate: Optional[str] = None
    cycle: Optional[str] = None
    
# Schemas de Response
class AsaasCustomerResponse(BaseModel):
    """Response do cliente Asaas"""
    id: str
    name: str
    email: str
    phone: Optional[str]
    cpfCnpj: Optional[str]
    dateCreated: str
    
class AsaasPaymentResponse(BaseModel):
    """Response do pagamento Asaas"""
    id: str
    customer: str
    subscription: Optional[str]
    value: float
    netValue: float
    originalValue: Optional[float]
    interestValue: Optional[float]
    description: Optional[str]
    billingType: str
    status: str
    dueDate: str
    originalDueDate: str
    paymentDate: Optional[str]
    clientPaymentDate: Optional[str]
    externalReference: Optional[str]
    invoiceUrl: Optional[str]
    bankSlipUrl: Optional[str]
    transactionReceiptUrl: Optional[str]

class AsaasSubscriptionResponse(BaseModel):
    """Response da assinatura Asaas"""
    id: str
    customer: str
    value: float
    netValue: Optional[float] = None  # Opcional pois nem sempre vem da API
    cycle: str
    billingType: str
    nextDueDate: str
    description: Optional[str]
    status: str
    dateCreated: str

# Schemas para Webhooks
class WebhookPayload(BaseModel):
    """Payload base do webhook"""
    event: str  # PAYMENT_CREATED, PAYMENT_UPDATED, etc
    payment: Optional[Dict[str, Any]] = None
    subscription: Optional[Dict[str, Any]] = None

class PaymentWebhookData(BaseModel):
    """Dados do webhook de pagamento"""
    id: str
    customer: str
    subscription: Optional[str]
    value: float
    status: PaymentStatus
    billingType: BillingType
    dueDate: str
    paymentDate: Optional[str]
    externalReference: Optional[str]

# Schemas internos
class SubscriptionCreate(BaseModel):
    """Criar assinatura interna"""
    user_id: str
    plan_type: PlanType
    asaas_customer_id: str
    asaas_subscription_id: Optional[str] = None
    
class SubscriptionUpdate(BaseModel):
    """Atualizar assinatura interna"""
    status: Optional[SubscriptionStatus] = None
    plan_type: Optional[PlanType] = None
    asaas_subscription_id: Optional[str] = None
    expires_at: Optional[datetime] = None

class SubscriptionResponse(BaseModel):
    """Response da assinatura interna"""
    id: str
    user_id: str = Field(alias="id_usuario")
    plan_type: PlanType = Field(alias="tipo_plano")
    status: SubscriptionStatus
    asaas_customer_id: str
    asaas_subscription_id: Optional[str]
    current_period_start: datetime = Field(alias="periodo_inicio")
    current_period_end: datetime = Field(alias="periodo_fim")
    created_at: datetime = Field(alias="criado_em")
    updated_at: datetime = Field(alias="atualizado_em")
    
    model_config = ConfigDict(from_attributes=True, populate_by_name=True)
