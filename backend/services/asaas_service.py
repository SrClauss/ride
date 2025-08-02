"""
Serviço de integração com Asaas
"""
import httpx
import json
import logging
from typing import Optional, List, Dict, Any
from datetime import datetime, timedelta

from config.payments import PaymentConfig, SUBSCRIPTION_PLANS
from schemas.payment_schemas import (
    CreateCustomerRequest,
    CreatePaymentRequest, 
    CreateSubscriptionRequest,
    UpdateSubscriptionRequest,
    AsaasCustomerResponse,
    AsaasPaymentResponse,
    AsaasSubscriptionResponse,
    PlanType
)

logger = logging.getLogger(__name__)

class AsaasService:
    """Serviço para integração com API do Asaas"""
    
    def __init__(self):
        from config.settings import settings
        
        self.base_url = settings.ASAAS_BASE_URL
        self.api_key = settings.ASAAS_API_KEY
        self.headers = {
            'access_token': self.api_key,
            'Content-Type': 'application/json',
            'User-Agent': 'RiderFinance/1.0'
        }
        
        env_type = "SANDBOX" if "sandbox" in self.base_url else "PRODUCTION"
        logger.info(f"AsaasService inicializado - Ambiente: {env_type}")
    
    async def _make_request(
        self, 
        method: str, 
        endpoint: str, 
        data: Optional[Dict] = None
    ) -> Dict[str, Any]:
        """Fazer requisição para API do Asaas"""
        url = f"{self.base_url}/{endpoint}"
        
        try:
            async with httpx.AsyncClient() as client:
                if method.upper() == 'GET':
                    response = await client.get(url, headers=self.headers, params=data)
                elif method.upper() == 'POST':
                    response = await client.post(url, headers=self.headers, json=data)
                elif method.upper() == 'PUT':
                    response = await client.put(url, headers=self.headers, json=data)
                elif method.upper() == 'DELETE':
                    response = await client.delete(url, headers=self.headers)
                else:
                    raise ValueError(f"Método HTTP não suportado: {method}")
                
                logger.info(f"Asaas API [{method}] {endpoint} - Status: {response.status_code}")
                
                if response.status_code >= 400:
                    error_data = response.json() if response.content else {}
                    logger.error(f"Erro na API Asaas: {error_data}")
                    raise Exception(f"Erro Asaas: {error_data.get('message', 'Erro desconhecido')}")
                
                return response.json()
                
        except httpx.RequestError as e:
            logger.error(f"Erro de conexão com Asaas: {str(e)}")
            raise Exception(f"Erro de conexão: {str(e)}")
    
    # === CLIENTES ===
    async def create_customer(self, customer_data: CreateCustomerRequest) -> AsaasCustomerResponse:
        """Criar cliente no Asaas"""
        data = customer_data.model_dump(exclude_none=True)
        result = await self._make_request('POST', 'customers', data)
        return AsaasCustomerResponse(**result)
    
    async def get_customer(self, customer_id: str) -> AsaasCustomerResponse:
        """Buscar cliente no Asaas"""
        result = await self._make_request('GET', f'customers/{customer_id}')
        return AsaasCustomerResponse(**result)
    
    async def update_customer(self, customer_id: str, customer_data: Dict) -> AsaasCustomerResponse:
        """Atualizar cliente no Asaas"""
        result = await self._make_request('PUT', f'customers/{customer_id}', customer_data)
        return AsaasCustomerResponse(**result)
    
    # === PAGAMENTOS ===
    async def create_payment(self, payment_data: CreatePaymentRequest) -> AsaasPaymentResponse:
        """Criar cobrança no Asaas"""
        data = payment_data.model_dump(exclude_none=True)
        result = await self._make_request('POST', 'payments', data)
        return AsaasPaymentResponse(**result)
    
    async def get_payment(self, payment_id: str) -> AsaasPaymentResponse:
        """Buscar pagamento no Asaas"""
        result = await self._make_request('GET', f'payments/{payment_id}')
        return AsaasPaymentResponse(**result)
    
    async def get_payments(self, filters: Optional[Dict] = None) -> List[AsaasPaymentResponse]:
        """Listar pagamentos no Asaas"""
        result = await self._make_request('GET', 'payments', filters or {})
        return [AsaasPaymentResponse(**payment) for payment in result.get('data', [])]
    
    # === ASSINATURAS ===
    async def create_subscription(self, subscription_data: CreateSubscriptionRequest) -> AsaasSubscriptionResponse:
        """Criar assinatura no Asaas"""
        data = subscription_data.dict(exclude_none=True)
        result = await self._make_request('POST', 'subscriptions', data)
        return AsaasSubscriptionResponse(**result)
    
    async def get_subscription(self, subscription_id: str) -> AsaasSubscriptionResponse:
        """Buscar assinatura no Asaas"""
        result = await self._make_request('GET', f'subscriptions/{subscription_id}')
        return AsaasSubscriptionResponse(**result)
    
    async def update_subscription(self, subscription_id: str, update_data: UpdateSubscriptionRequest) -> AsaasSubscriptionResponse:
        """Atualizar assinatura no Asaas"""
        data = update_data.dict(exclude_none=True)
        result = await self._make_request('PUT', f'subscriptions/{subscription_id}', data)
        return AsaasSubscriptionResponse(**result)
    
    async def cancel_subscription(self, subscription_id: str) -> Dict[str, Any]:
        """Cancelar assinatura no Asaas"""
        return await self._make_request('DELETE', f'subscriptions/{subscription_id}')
    
    # === WEBHOOKS ===
    async def create_webhook(self, url: str, events: List[str]) -> Dict[str, Any]:
        """Criar webhook no Asaas"""
        data = {
            'name': 'RiderFinance Webhook',
            'url': url,
            'email': 'webhook@riderfinance.com',
            'enabled': True,
            'interrupted': False,
            'authToken': PaymentConfig.ASAAS_WEBHOOK_SECRET,
            'events': events
        }
        return await self._make_request('POST', 'webhooks', data)
    
    async def get_webhooks(self) -> List[Dict[str, Any]]:
        """Listar webhooks configurados"""
        result = await self._make_request('GET', 'webhooks')
        return result.get('data', [])
    
    # === MÉTODOS AUXILIARES ===
    async def get_plan_price(self, plan_type: PlanType) -> float:
        """Obter preço do plano"""
        plan = SUBSCRIPTION_PLANS.get(plan_type.value)
        if not plan:
            raise ValueError(f"Plano não encontrado: {plan_type}")
        return plan['price']
    
    async def create_plan_subscription(
        self, 
        customer_id: str, 
        plan_type: PlanType,
        billing_type: str = 'PIX'
    ) -> AsaasSubscriptionResponse:
        """Criar assinatura de um plano específico"""
        plan = SUBSCRIPTION_PLANS.get(plan_type.value)
        if not plan:
            raise ValueError(f"Plano não encontrado: {plan_type}")
        
        # Próximo vencimento (amanhã)
        next_due_date = (datetime.now() + timedelta(days=1)).strftime('%Y-%m-%d')
        
        subscription_data = CreateSubscriptionRequest(
            customer=customer_id,
            billingType=billing_type,
            nextDueDate=next_due_date,
            value=plan['price'],
            cycle=plan['billing_cycle'],
            description=f"Assinatura {plan['name']} - Rider Finance"
        )
        
        return await self.create_subscription(subscription_data)
    
    async def health_check(self) -> Dict[str, Any]:
        """Verificar saúde da API Asaas"""
        try:
            # Tenta buscar os webhooks (endpoint simples)
            await self.get_webhooks()
            return {
                "status": "healthy",
                "environment": "production" if PaymentConfig.IS_PRODUCTION else "sandbox",
                "timestamp": datetime.now().isoformat()
            }
        except Exception as e:
            return {
                "status": "unhealthy",
                "error": str(e),
                "environment": "production" if PaymentConfig.IS_PRODUCTION else "sandbox",
                "timestamp": datetime.now().isoformat()
            }
