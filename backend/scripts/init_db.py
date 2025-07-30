"""
Script para criar/verificar banco de dados
"""
import sys
import os

# Adicionar o diretório raiz ao path
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

from config.database import create_tables
from config.logging_config import logger

def init_database():
    """Inicializa o banco de dados"""
    try:
        logger.info("Criando tabelas do banco de dados...")
        create_tables()
        logger.info("✅ Banco de dados inicializado com sucesso!")
        return True
    except Exception as e:
        logger.error(f"❌ Erro ao criar banco de dados: {str(e)}")
        return False

if __name__ == "__main__":
    success = init_database()
    sys.exit(0 if success else 1)
