"""
Script para executar os testes de pagamento organizados
"""
import sys
import os
import subprocess

def run_test(test_file):
    """Executar um arquivo de teste específico"""
    test_path = os.path.join("tests", test_file)
    
    if not os.path.exists(test_path):
        print(f"❌ Arquivo de teste não encontrado: {test_path}")
        return False
    
    print(f"\n🧪 Executando: {test_file}")
    print("=" * 50)
    
    try:
        result = subprocess.run([sys.executable, test_path], 
                              capture_output=False, 
                              cwd=os.path.dirname(os.path.dirname(__file__)))
        
        if result.returncode == 0:
            print(f"✅ {test_file} passou!")
            return True
        else:
            print(f"❌ {test_file} falhou!")
            return False
            
    except Exception as e:
        print(f"❌ Erro ao executar {test_file}: {str(e)}")
        return False

def main():
    """Executar todos os testes de pagamento"""
    print("🚀 EXECUTANDO SUITE DE TESTES DE PAGAMENTO")
    print("=" * 60)
    
    # Lista de testes para executar
    tests = [
        "test_asaas_connection.py",
        "test_simple_asaas.py", 
        "test_complete_flow.py"
    ]
    
    results = []
    
    for test in tests:
        success = run_test(test)
        results.append((test, success))
    
    # Resumo final
    print("\n📊 RESUMO DOS TESTES")
    print("=" * 60)
    
    passed = 0
    failed = 0
    
    for test, success in results:
        status = "✅ PASSOU" if success else "❌ FALHOU"
        print(f"{test:<30} {status}")
        if success:
            passed += 1
        else:
            failed += 1
    
    print(f"\n📈 Total: {len(results)} | ✅ Passou: {passed} | ❌ Falhou: {failed}")
    
    if failed == 0:
        print("\n🎉 TODOS OS TESTES PASSARAM!")
        return True
    else:
        print(f"\n⚠️  {failed} TESTE(S) FALHARAM")
        return False

if __name__ == "__main__":
    success = main()
    sys.exit(0 if success else 1)
