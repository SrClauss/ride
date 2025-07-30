"""
Script para testar a aplicação
"""
import sys
import os
import asyncio
from datetime import datetime

# Adicionar o diretório raiz ao path
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

from config.database import SessionLocal, create_tables
from services.auth_service import AuthService
from services.user_service import UserService
from services.category_service import CategoryService
from services.transaction_service import TransactionService
from config.logging_config import logger

async def test_app():
    """Testa funcionalidades básicas da aplicação"""
    db = SessionLocal()
    
    try:
        logger.info("🧪 Iniciando testes da aplicação...")
        
        # 1. Criar tabelas
        logger.info("1️⃣ Criando tabelas...")
        create_tables()
        logger.info("✅ Tabelas criadas")
        
        # 2. Registrar usuário de teste
        logger.info("2️⃣ Registrando usuário de teste...")
        user = AuthService.register_user(
            db=db,
            nome_usuario="teste_usuario",
            email="teste@exemplo.com",
            senha="senha123",
            nome_completo="Usuário de Teste"
        )
        logger.info(f"✅ Usuário criado: {user.nome_usuario}")
        
        # 3. Criar configurações padrão
        logger.info("3️⃣ Criando configurações padrão...")
        UserService.create_default_settings(db, user)
        logger.info("✅ Configurações criadas")
        
        # 4. Criar categorias padrão
        logger.info("4️⃣ Criando categorias padrão...")
        CategoryService.create_default_categories(db, user.id)
        categories = CategoryService.get_user_categories(db, user.id)
        logger.info(f"✅ {len(categories)} categorias criadas")
        
        # 5. Criar transação de teste
        logger.info("5️⃣ Criando transação de teste...")
        receita_category = next((cat for cat in categories if cat.tipo == "receita"), None)
        if receita_category:
            transaction = TransactionService.create_transaction(
                db=db,
                user_id=user.id,
                id_categoria=receita_category.id,
                valor=50.00,
                tipo="receita",
                descricao="Corrida de teste"
            )
            logger.info(f"✅ Transação criada: R$ {transaction.valor}")
        
        # 6. Testar autenticação
        logger.info("6️⃣ Testando autenticação...")
        auth_user = AuthService.authenticate_user(db, "teste@exemplo.com", "senha123")
        tokens = AuthService.create_tokens(auth_user)
        logger.info("✅ Autenticação funcionando")
        
        # 7. Testar relatórios
        logger.info("7️⃣ Testando relatórios...")
        summary = TransactionService.get_transactions_summary(db, user.id)
        logger.info(f"✅ Resumo: R$ {summary['total_receitas']} receitas")
        
        logger.info("🎉 Todos os testes passaram! Aplicação funcionando corretamente.")
        return True
        
    except Exception as e:
        logger.error(f"❌ Erro nos testes: {str(e)}")
        return False
    finally:
        db.close()

if __name__ == "__main__":
    success = asyncio.run(test_app())
    sys.exit(0 if success else 1)
