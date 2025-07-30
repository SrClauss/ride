"""
Serviço de categorias
"""
from typing import List, Optional
from sqlalchemy.orm import Session
from sqlalchemy import or_

from models import Categoria, CATEGORIAS_PADRAO
from utils.helpers import now_utc
from utils.exceptions import NotFoundError, ValidationError, ConflictError
from config.logging_config import logger

class CategoryService:
    """Serviço para gestão de categorias"""
    
    @staticmethod
    def create_default_categories(db: Session, user_id: str) -> None:
        """Cria categorias padrão para usuário"""
        
        for cat_data in CATEGORIAS_PADRAO:
            category = Categoria(
                id_usuario=user_id,
                nome=cat_data["nome"],
                tipo=cat_data["tipo"],
                icone=cat_data["icone"],
                cor=cat_data["cor"],
                eh_padrao=True
            )
            db.add(category)
        
        try:
            db.commit()
            logger.info(f"Categorias padrão criadas para usuário: {user_id}")
        except Exception as e:
            db.rollback()
            logger.error(f"Erro ao criar categorias padrão: {str(e)}")
            raise ValidationError("Erro ao criar categorias padrão")
    
    @staticmethod
    def get_user_categories(
        db: Session,
        user_id: str,
        tipo: Optional[str] = None,
        apenas_ativas: bool = True
    ) -> List[Categoria]:
        """Obtém categorias do usuário"""
        
        query = db.query(Categoria).filter(Categoria.id_usuario == user_id)
        
        if tipo:
            query = query.filter(Categoria.tipo == tipo)
        
        if apenas_ativas:
            query = query.filter(Categoria.eh_ativa == True)
        
        return query.order_by(Categoria.nome).all()
    
    @staticmethod
    def get_category_by_id(db: Session, category_id: str, user_id: str) -> Categoria:
        """Busca categoria por ID"""
        category = db.query(Categoria).filter(
            Categoria.id == category_id,
            Categoria.id_usuario == user_id
        ).first()
        
        if not category:
            raise NotFoundError("Categoria", category_id)
        
        return category
    
    @staticmethod
    def create_category(
        db: Session,
        user_id: str,
        nome: str,
        tipo: str,
        icone: Optional[str] = None,
        cor: Optional[str] = None
    ) -> Categoria:
        """Cria nova categoria"""
        
        # Verifica se já existe categoria com mesmo nome e tipo
        existing = db.query(Categoria).filter(
            Categoria.id_usuario == user_id,
            Categoria.nome == nome.strip(),
            Categoria.tipo == tipo,
            Categoria.eh_ativa == True
        ).first()
        
        if existing:
            raise ConflictError(f"Já existe uma categoria {tipo} com o nome '{nome}'")
        
        category = Categoria(
            id_usuario=user_id,
            nome=nome,
            tipo=tipo,
            icone=icone or "fas fa-circle",
            cor=cor or "#6B7280"
        )
        
        try:
            db.add(category)
            db.commit()
            db.refresh(category)
            logger.info(f"Categoria criada: {nome} para usuário {user_id}")
            return category
        except Exception as e:
            db.rollback()
            logger.error(f"Erro ao criar categoria: {str(e)}")
            raise ValidationError("Erro ao criar categoria")
    
    @staticmethod
    def update_category(
        db: Session,
        category_id: str,
        user_id: str,
        nome: Optional[str] = None,
        icone: Optional[str] = None,
        cor: Optional[str] = None
    ) -> Categoria:
        """Atualiza categoria"""
        
        category = CategoryService.get_category_by_id(db, category_id, user_id)
        
        # Verifica se pode editar (categorias padrão podem ter restrições)
        if category.eh_padrao and nome and nome != category.nome:
            # Permite editar nome de categorias padrão, mas avisa
            logger.warning(f"Editando nome de categoria padrão: {category.nome} -> {nome}")
        
        if nome:
            # Verifica conflito de nomes
            existing = db.query(Categoria).filter(
                Categoria.id_usuario == user_id,
                Categoria.nome == nome.strip(),
                Categoria.tipo == category.tipo,
                Categoria.id != category_id,
                Categoria.eh_ativa == True
            ).first()
            
            if existing:
                raise ConflictError(f"Já existe uma categoria {category.tipo} com o nome '{nome}'")
            
            category.nome = nome
        
        if icone:
            category.icone = icone
        
        if cor:
            category.cor = cor
        
        category.atualizado_em = now_utc()
        
        try:
            db.commit()
            db.refresh(category)
            logger.info(f"Categoria atualizada: {category.nome} para usuário {user_id}")
            return category
        except Exception as e:
            db.rollback()
            logger.error(f"Erro ao atualizar categoria: {str(e)}")
            raise ValidationError("Erro ao atualizar categoria")
    
    @staticmethod
    def delete_category(db: Session, category_id: str, user_id: str) -> None:
        """Remove categoria (soft delete)"""
        
        category = CategoryService.get_category_by_id(db, category_id, user_id)
        
        # Verifica se categoria está em uso
        from models import Transacao
        transacoes_count = db.query(Transacao).filter(
            Transacao.id_categoria == category_id
        ).count()
        
        if transacoes_count > 0:
            # Soft delete - apenas desativa
            category.eh_ativa = False
            category.atualizado_em = now_utc()
            action = "desativada"
        else:
            # Hard delete - remove completamente
            db.delete(category)
            action = "removida"
        
        try:
            db.commit()
            logger.info(f"Categoria {action}: {category.nome} para usuário {user_id}")
        except Exception as e:
            db.rollback()
            logger.error(f"Erro ao remover categoria: {str(e)}")
            raise ValidationError("Erro ao remover categoria")
    
    @staticmethod
    def get_categories_by_type(db: Session, user_id: str, tipo: str) -> List[Categoria]:
        """Obtém categorias por tipo específico"""
        return CategoryService.get_user_categories(db, user_id, tipo=tipo)
    
    @staticmethod
    def search_categories(db: Session, user_id: str, termo: str) -> List[Categoria]:
        """Busca categorias por termo"""
        return db.query(Categoria).filter(
            Categoria.id_usuario == user_id,
            Categoria.eh_ativa == True,
            Categoria.nome.ilike(f"%{termo}%")
        ).order_by(Categoria.nome).all()
    
    @staticmethod
    def get_category_usage_stats(db: Session, category_id: str, user_id: str) -> dict:
        """Obtém estatísticas de uso da categoria"""
        from models import Transacao
        from sqlalchemy import func, desc
        
        category = CategoryService.get_category_by_id(db, category_id, user_id)
        
        # Contagem total de transações
        total_transacoes = db.query(func.count(Transacao.id)).filter(
            Transacao.id_categoria == category_id
        ).scalar() or 0
        
        # Valor total
        valor_total = db.query(func.sum(Transacao.valor)).filter(
            Transacao.id_categoria == category_id
        ).scalar() or 0.0
        
        # Última transação
        ultima_transacao = db.query(Transacao).filter(
            Transacao.id_categoria == category_id
        ).order_by(desc(Transacao.data)).first()
        
        return {
            "categoria": category.para_dict(),
            "total_transacoes": total_transacoes,
            "valor_total": float(valor_total),
            "ultima_transacao": ultima_transacao.data.isoformat() if ultima_transacao else None
        }
