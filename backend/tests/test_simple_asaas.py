"""
Teste simples para verificar se a chave de API está funcionando
"""
import os
import httpx
import asyncio
from dotenv import load_dotenv

# Carregar variáveis do .env
load_dotenv()

async def test_simple_asaas():
    """Teste direto da API Asaas"""
    api_key = os.getenv('ASAAS_API_KEY')
    base_url = os.getenv('ASAAS_BASE_URL', 'https://sandbox.asaas.com/api/v3')
    
    print(f"CHAVE DE API: {api_key[:20]}...")
    print(f"URL Base: {base_url}")
    
    headers = {
        'access_token': api_key,
        'Content-Type': 'application/json',
        'User-Agent': 'RiderFinance/1.0'
    }
    
    try:
        async with httpx.AsyncClient() as client:
            # Fazer uma requisição simples
            response = await client.get(
                f"{base_url}/customers",
                headers=headers,
                params={"limit": 1}
            )
            
            print(f"Status: {response.status_code}")
            print(f"Response: {response.text}")
            
            if response.status_code == 200:
                print("API Asaas funcionando!")
                return True
            else:
                print("Erro na API Asaas")
                return False
                
    except Exception as e:
        print(f"ERRO: {str(e)}")
        return False

if __name__ == "__main__":
    print("TESTE DIRETO DA API ASAAS...")
    result = asyncio.run(test_simple_asaas())
