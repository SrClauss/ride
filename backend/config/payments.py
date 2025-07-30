"""
Configurações de pagamento - Asaas
"""
import os
from typing import Optional

class PaymentConfig:
    """Configurações do Asaas"""
    
    # Configurações principais
    ASAAS_API_KEY: str = os.getenv('ASAAS_API_KEY', 'aact_YTU5YTE0M2M2N2I4MTliNzk0YTI5N2U5MzdjNWZmNDQ6OjAwMDAwMDAwMDAwMDAwNTU2Njk6OiRhYWRmYTczYzQwNzUwMDQxZjIyYWZkMTI1MTE4YjNmNDkxNWZlZWE4N2YwM2U3YTA5YzliZGY3NTVmN2NmNmQz')
    ASAAS_BASE_URL: str = os.getenv('ASAAS_BASE_URL', 'https://sandbox.asaas.com/api/v3')
    ASAAS_WEBHOOK_SECRET: str = os.getenv('ASAAS_WEBHOOK_SECRET', 'webhook_secret_123')
    
    # Auto-detecta ambiente
    IS_PRODUCTION: bool = 'sandbox' not in ASAAS_BASE_URL
    IS_SANDBOX: bool = not IS_PRODUCTION
    
    # URLs dos webhooks
    WEBHOOK_BASE_URL: str = os.getenv('WEBHOOK_BASE_URL', 'http://localhost:8000')
    
    @classmethod
    def get_headers(cls) -> dict:
        """Headers para requisições Asaas"""
        return {
            'access_token': cls.ASAAS_API_KEY,
            'Content-Type': 'application/json',
            'User-Agent': 'RiderFinance/1.0'
        }
    
    @classmethod
    def get_webhook_url(cls, endpoint: str) -> str:
        """URL completa do webhook"""
        return f"{cls.WEBHOOK_BASE_URL}/webhooks/{endpoint}"
    
    @classmethod
    def validate_config(cls) -> bool:
        """Valida se as configurações estão corretas"""
        if not cls.ASAAS_API_KEY:
            raise ValueError("ASAAS_API_KEY não configurado")
        
        if not cls.ASAAS_API_KEY.startswith('aact_'):
            raise ValueError("ASAAS_API_KEY inválido")
            
        return True

# Planos disponíveis
SUBSCRIPTION_PLANS = {
    'basic': {
        'name': 'Básico',
        'description': 'Funcionalidades essenciais para motoristas',
        'price': 9.90,
        'features': [
            'Controle de receitas e gastos',
            'Metas básicas',
            'Relatórios simples',
            'Até 500 transações/mês'
        ],
        'billing_cycle': 'MONTHLY'
    },
    'pro': {
        'name': 'Profissional', 
        'description': 'Para motoristas que querem maximizar lucros',
        'price': 19.90,
        'features': [
            'Tudo do plano Básico',
            'Metas avançadas e automações',
            'Relatórios detalhados com gráficos',
            'Transações ilimitadas',
            'Importação de faturas automática',
            'Suporte prioritário'
        ],
        'billing_cycle': 'MONTHLY'
    },
    'premium': {
        'name': 'Premium',
        'description': 'Para frotas e múltiplos veículos',
        'price': 39.90,
        'features': [
            'Tudo do plano Profissional',
            'Múltiplos veículos',
            'Gestão de equipe',
            'API personalizada',
            'Relatórios personalizados',
            'Consultoria financeira',
            'White label'
        ],
        'billing_cycle': 'MONTHLY'
    }
}
