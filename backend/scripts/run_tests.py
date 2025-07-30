"""
Script para executar todos os testes
"""
import subprocess
import sys

def run_tests():
    """Executar suite de testes"""
    print("🧪 Executando testes do backend...")
    
    try:
        # Executar pytest
        result = subprocess.run([
            sys.executable, "-m", "pytest", 
            "tests/",
            "-v",
            "--tb=short"
        ], cwd=".", capture_output=True, text=True)
        
        print("📊 Resultado dos testes:")
        print(result.stdout)
        
        if result.stderr:
            print("⚠️ Avisos/Erros:")
            print(result.stderr)
        
        if result.returncode == 0:
            print("✅ Todos os testes passaram!")
        else:
            print("❌ Alguns testes falharam")
        
        return result.returncode == 0
        
    except Exception as e:
        print(f"❌ Erro ao executar testes: {e}")
        return False

if __name__ == "__main__":
    success = run_tests()
    sys.exit(0 if success else 1)
