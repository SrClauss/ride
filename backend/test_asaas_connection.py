"""
Teste rápido da integração com Asaas
"""
import asyncio
import sys
import os

# Adicionar o diretório backend ao path
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

from services.asaas_service import AsaasService

async def test_asaas_connection():
    """Testar conexão com Asaas"""
    print("🔍 Testando conexão com Asaas...")
    
    try:
        asaas = AsaasService()
        
        # Testar se conseguimos fazer uma requisição básica (listar clientes)
        response = await asaas._make_request("GET", "customers", {"limit": 1})
        
        if response:
            print("✅ Conexão com Asaas funcionando!")
            print(f"📊 Response: {response}")
            return True
        else:
            print("❌ Falha na conexão com Asaas")
            return False
            
    except Exception as e:
        print(f"❌ Erro ao conectar com Asaas: {str(e)}")
        return False

if __name__ == "__main__":
    print("🚀 Testando integração Asaas...")
    result = asyncio.run(test_asaas_connection())
    
    if result:
        print("\n🎉 Integração Asaas configurada corretamente!")
    else:
        print("\n⚠️  Verifique a chave de API e configurações")
