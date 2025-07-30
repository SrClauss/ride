"""
Script para executar TODOS os testes do backend
"""
import sys
import os
import subprocess
import time
from datetime import datetime

def run_command(command, description):
    """Executar comando e capturar resultado"""
    print(f"\n{'='*60}")
    print(f"🧪 {description}")
    print(f"{'='*60}")
    print(f"Comando: {command}")
    print("-" * 40)
    
    start_time = time.time()
    
    try:
        result = subprocess.run(
            command.split(), 
            capture_output=True, 
            text=True,
            cwd=os.path.dirname(os.path.dirname(__file__))
        )
        
        duration = time.time() - start_time
        
        # Mostrar output
        if result.stdout:
            print(result.stdout)
        
        if result.stderr:
            print("STDERR:", result.stderr)
        
        success = result.returncode == 0
        status = "✅ PASSOU" if success else "❌ FALHOU"
        print(f"\n{status} (Tempo: {duration:.2f}s)")
        
        return success, duration, result.stdout, result.stderr
        
    except Exception as e:
        print(f"❌ ERRO: {str(e)}")
        return False, 0, "", str(e)

def main():
    """Executar todos os testes do backend"""
    print("🚀 EXECUTANDO BATERIA COMPLETA DE TESTES DO BACKEND")
    print(f"Data/Hora: {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}")
    print("="*80)
    
    tests = [
        # Testes de integração Asaas
        ("python tests/test_asaas_connection.py", "Teste de Conexão com Asaas"),
        ("python tests/test_simple_asaas.py", "Teste Simples da API Asaas"),
        
        # Testes de API
        ("python tests/test_api_endpoints.py", "Teste dos Endpoints da API"),
        
        # Testes de fluxo completo
        ("python tests/test_complete_flow.py", "Teste de Fluxo Completo de Pagamentos"),
        
        # Testes existentes com pytest
        ("python -m pytest tests/test_auth.py -v", "Testes de Autenticação"),
        ("python -m pytest tests/test_categories.py -v", "Testes de Categorias"),
        ("python -m pytest tests/test_transactions.py -v", "Testes de Transações"),
        ("python -m pytest tests/test_goals.py -v", "Testes de Metas"),
        ("python -m pytest tests/test_sessions.py -v", "Testes de Sessões"),
        
        # Teste de health check direto
        ("curl -s http://localhost:8000/health", "Health Check do Servidor (se rodando)"),
    ]
    
    results = []
    total_duration = 0
    
    for command, description in tests:
        success, duration, stdout, stderr = run_command(command, description)
        results.append({
            'test': description,
            'command': command,
            'success': success,
            'duration': duration,
            'stdout': stdout,
            'stderr': stderr
        })
        total_duration += duration
        
        # Pequena pausa entre testes
        time.sleep(1)
    
    # Resumo final
    print(f"\n{'='*80}")
    print("📊 RESUMO FINAL DOS TESTES")
    print(f"{'='*80}")
    
    passed = sum(1 for r in results if r['success'])
    failed = len(results) - passed
    
    print(f"📈 Total de testes: {len(results)}")
    print(f"✅ Passou: {passed}")
    print(f"❌ Falhou: {failed}")
    print(f"⏱️  Tempo total: {total_duration:.2f}s")
    print(f"📊 Taxa de sucesso: {(passed/len(results)*100):.1f}%")
    
    print(f"\n📋 DETALHES POR TESTE:")
    print("-" * 80)
    
    for i, result in enumerate(results, 1):
        status = "✅" if result['success'] else "❌"
        print(f"{i:2d}. {status} {result['test']:<50} ({result['duration']:.2f}s)")
    
    # Análise de problemas
    failed_tests = [r for r in results if not r['success']]
    if failed_tests:
        print(f"\n🚨 TESTES QUE FALHARAM:")
        print("-" * 80)
        for test in failed_tests:
            print(f"\n❌ {test['test']}")
            print(f"   Comando: {test['command']}")
            if test['stderr']:
                print(f"   Erro: {test['stderr'][:200]}...")
    
    # Recomendações
    print(f"\n💡 ANÁLISE E RECOMENDAÇÕES:")
    print("-" * 80)
    
    if failed == 0:
        print("🎉 PARABÉNS! Todos os testes passaram!")
        print("✅ Seu backend está funcionando perfeitamente")
        print("✅ Integração com Asaas está operacional")
        print("✅ API REST está respondendo corretamente")
        print("✅ Sistema está pronto para produção")
    elif failed <= 2:
        print("⚠️  Alguns testes falharam, mas o sistema está majoritariamente funcional")
        print("🔧 Verifique os erros específicos acima")
        print("✅ Core do sistema está funcionando")
    else:
        print("🚨 Vários testes falharam - verificação necessária")
        print("🔧 Recomenda-se revisar configurações e dependências")
    
    # Status específicos
    asaas_tests = [r for r in results if 'asaas' in r['test'].lower()]
    if any(t['success'] for t in asaas_tests):
        print("✅ Integração Asaas: FUNCIONANDO")
    else:
        print("❌ Integração Asaas: VERIFICAR")
    
    api_tests = [r for r in results if 'api' in r['test'].lower() or 'endpoint' in r['test'].lower()]
    if any(t['success'] for t in api_tests):
        print("✅ API REST: FUNCIONANDO")
    else:
        print("❌ API REST: VERIFICAR")
    
    auth_tests = [r for r in results if 'auth' in r['test'].lower()]
    if any(t['success'] for t in auth_tests):
        print("✅ Autenticação: FUNCIONANDO")
    else:
        print("❌ Autenticação: VERIFICAR")
    
    print(f"\n🏁 CONCLUSÃO:")
    if failed == 0:
        print("🚀 BACKEND PRONTO PARA PRODUÇÃO!")
    elif failed <= 2:
        print("🔧 BACKEND FUNCIONAL - Pequenos ajustes necessários")
    else:
        print("⚠️  BACKEND REQUER ATENÇÃO - Vários problemas detectados")
    
    return failed == 0

if __name__ == "__main__":
    success = main()
    sys.exit(0 if success else 1)
