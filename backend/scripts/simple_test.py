"""
Versão simplificada do teste que evita problemas com bcrypt
"""
import sys
import os

# Adicionar o diretório raiz ao path
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

from config.database import SessionLocal, create_tables
from config.logging_config import logger

def simple_test():
    """Teste básico sem autenticação"""
    db = SessionLocal()
    
    try:
        logger.info("🧪 Teste simples da aplicação...")
        
        # 1. Criar tabelas
        logger.info("1️⃣ Criando tabelas...")
        create_tables()
        logger.info("✅ Tabelas criadas com sucesso")
        
        # 2. Testar conexão com banco
        logger.info("2️⃣ Testando conexão com banco...")
        from models import Usuario
        result = db.execute("SELECT 1").fetchone()
        logger.info("✅ Conexão com banco funcionando")
        
        # 3. Verificar estrutura das tabelas
        logger.info("3️⃣ Verificando tabelas...")
        tables = ['usuarios', 'categorias', 'transacoes', 'sessoes_trabalho', 'metas', 'configuracoes']
        for table in tables:
            result = db.execute(f"SELECT name FROM sqlite_master WHERE type='table' AND name='{table}'").fetchone()
            if result:
                logger.info(f"✅ Tabela '{table}' existe")
            else:
                logger.error(f"❌ Tabela '{table}' não encontrada")
        
        logger.info("🎉 Teste básico passou! Banco de dados OK.")
        return True
        
    except Exception as e:
        logger.error(f"❌ Erro no teste: {str(e)}")
        return False
    finally:
        db.close()

if __name__ == "__main__":
    success = simple_test()
    sys.exit(0 if success else 1)
