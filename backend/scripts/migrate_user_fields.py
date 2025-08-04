"""
Script para adicionar novos campos ao modelo Usuario
"""
import sys
import os

# Adicionar o diretório raiz ao path
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from sqlalchemy import text
from config.database import engine
from config.logging_config import logger

def migrate_user_fields():
    """Adiciona novos campos à tabela usuarios"""
    try:
        with engine.connect() as conn:
            # Verificar se os campos já existem
            result = conn.execute(text("PRAGMA table_info(usuarios)"))
            columns = [row[1] for row in result.fetchall()]
            
            # Adicionar campo veiculo se não existir
            if 'veiculo' not in columns:
                logger.info("Adicionando campo 'veiculo' à tabela usuarios...")
                conn.execute(text("ALTER TABLE usuarios ADD COLUMN veiculo VARCHAR(200)"))
                logger.info("✅ Campo 'veiculo' adicionado com sucesso!")
            else:
                logger.info("Campo 'veiculo' já existe.")
            
            # Adicionar campo data_inicio_atividade se não existir
            if 'data_inicio_atividade' not in columns:
                logger.info("Adicionando campo 'data_inicio_atividade' à tabela usuarios...")
                conn.execute(text("ALTER TABLE usuarios ADD COLUMN data_inicio_atividade DATE"))
                logger.info("✅ Campo 'data_inicio_atividade' adicionado com sucesso!")
            else:
                logger.info("Campo 'data_inicio_atividade' já existe.")
            
            conn.commit()
            
        logger.info("✅ Migração concluída com sucesso!")
        return True
        
    except Exception as e:
        logger.error(f"❌ Erro durante a migração: {str(e)}")
        return False

if __name__ == "__main__":
    success = migrate_user_fields()
    sys.exit(0 if success else 1)
