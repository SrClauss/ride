"""
Script para corrigir dependências e reinstalar
"""
import subprocess
import sys
import os

def run_command(command, description):
    """Executa comando e mostra resultado"""
    print(f"🔧 {description}...")
    try:
        result = subprocess.run(command, shell=True, capture_output=True, text=True)
        if result.returncode == 0:
            print(f"✅ {description} - Sucesso")
            return True
        else:
            print(f"❌ {description} - Erro:")
            print(result.stderr)
            return False
    except Exception as e:
        print(f"❌ {description} - Exceção: {str(e)}")
        return False

def fix_dependencies():
    """Corrige problemas de dependências"""
    print("🚀 Corrigindo dependências do Rider Finance...")
    
    # 1. Desinstalar bcrypt problemático
    print("\n1️⃣ Removendo versões conflitantes...")
    run_command("pip uninstall -y bcrypt passlib", "Removendo bcrypt e passlib")
    
    # 2. Reinstalar versões compatíveis
    print("\n2️⃣ Instalando versões compatíveis...")
    commands = [
        ("pip install bcrypt==4.0.1", "Instalando bcrypt 4.0.1"),
        ("pip install passlib[bcrypt]==1.7.4", "Instalando passlib 1.7.4"),
        ("pip install -r requirements.txt", "Instalando demais dependências")
    ]
    
    for command, desc in commands:
        if not run_command(command, desc):
            return False
    
    print("\n✅ Dependências corrigidas com sucesso!")
    return True

if __name__ == "__main__":
    success = fix_dependencies()
    if success:
        print("\n🎉 Agora execute novamente: python main.py")
    else:
        print("\n❌ Falha ao corrigir dependências")
    
    input("\nPressione Enter para continuar...")
    sys.exit(0 if success else 1)
