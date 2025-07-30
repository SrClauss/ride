"""
Serviço de transações
"""
from datetime import datetime, timedelta
from typing import List, Optional, Dict, Any, Tuple
from sqlalchemy.orm import Session
from sqlalchemy import func, desc, asc, and_, or_, extract

from models import Transacao, Categoria
from utils.helpers import now_utc, get_period_dates, parse_tags, tags_to_string
from utils.exceptions import NotFoundError, ValidationError
from config.logging_config import logger

class TransactionService:
    """Serviço para gestão de transações"""
    
    @staticmethod
    def create_transaction(
        db: Session,
        user_id: str,
        id_categoria: str,
        valor: float,
        tipo: str,
        descricao: Optional[str] = None,
        data: Optional[datetime] = None,
        origem: Optional[str] = None,
        id_externo: Optional[str] = None,
        plataforma: Optional[str] = None,
        observacoes: Optional[str] = None,
        tags: Optional[List[str]] = None
    ) -> Transacao:
        """Cria nova transação"""
        
        # Verifica se categoria existe e pertence ao usuário
        category = db.query(Categoria).filter(
            Categoria.id == id_categoria,
            Categoria.id_usuario == user_id,
            Categoria.eh_ativa == True
        ).first()
        
        if not category:
            raise NotFoundError("Categoria", id_categoria)
        
        # Verifica se tipo da transação bate com tipo da categoria
        if category.tipo != tipo:
            raise ValidationError(f"Tipo da transação ({tipo}) não confere com tipo da categoria ({category.tipo})")
        
        transaction = Transacao(
            id_usuario=user_id,
            id_categoria=id_categoria,
            valor=valor,
            tipo=tipo,
            descricao=descricao,
            data=data or now_utc(),
            origem=origem,
            id_externo=id_externo,
            plataforma=plataforma,
            observacoes=observacoes,
            tags=tags_to_string(tags) if tags else None
        )
        
        try:
            db.add(transaction)
            db.commit()
            db.refresh(transaction)
            logger.info(f"Transação criada: {valor} {tipo} para usuário {user_id}")
            return transaction
        except Exception as e:
            db.rollback()
            logger.error(f"Erro ao criar transação: {str(e)}")
            raise ValidationError("Erro ao criar transação")
    
    @staticmethod
    def get_transaction_by_id(db: Session, transaction_id: str, user_id: str) -> Transacao:
        """Busca transação por ID"""
        transaction = db.query(Transacao).filter(
            Transacao.id == transaction_id,
            Transacao.id_usuario == user_id
        ).first()
        
        if not transaction:
            raise NotFoundError("Transação", transaction_id)
        
        return transaction
    
    @staticmethod
    def get_user_transactions(
        db: Session,
        user_id: str,
        page: int = 1,
        per_page: int = 50,
        tipo: Optional[str] = None,
        categoria_id: Optional[str] = None,
        data_inicio: Optional[datetime] = None,
        data_fim: Optional[datetime] = None,
        busca: Optional[str] = None,
        ordenar_por: str = "data",
        ordem: str = "desc"
    ) -> Tuple[List[Transacao], int]:
        """Obtém transações do usuário com filtros e paginação"""
        
        query = db.query(Transacao).filter(Transacao.id_usuario == user_id)
        
        # Filtros
        if tipo:
            query = query.filter(Transacao.tipo == tipo)
        
        if categoria_id:
            query = query.filter(Transacao.id_categoria == categoria_id)
        
        if data_inicio:
            query = query.filter(Transacao.data >= data_inicio)
        
        if data_fim:
            query = query.filter(Transacao.data <= data_fim)
        
        if busca:
            search_term = f"%{busca}%"
            query = query.filter(or_(
                Transacao.descricao.ilike(search_term),
                Transacao.observacoes.ilike(search_term),
                Transacao.tags.ilike(search_term)
            ))
        
        # Contagem total
        total = query.count()
        
        # Ordenação
        if ordenar_por == "valor":
            order_field = Transacao.valor
        elif ordenar_por == "categoria":
            order_field = Categoria.nome
            query = query.join(Categoria)
        else:  # data
            order_field = Transacao.data
        
        if ordem == "asc":
            query = query.order_by(asc(order_field))
        else:
            query = query.order_by(desc(order_field))
        
        # Paginação
        offset = (page - 1) * per_page
        transactions = query.offset(offset).limit(per_page).all()
        
        return transactions, total
    
    @staticmethod
    def update_transaction(
        db: Session,
        transaction_id: str,
        user_id: str,
        id_categoria: Optional[str] = None,
        valor: Optional[float] = None,
        descricao: Optional[str] = None,
        data: Optional[datetime] = None,
        observacoes: Optional[str] = None,
        tags: Optional[List[str]] = None
    ) -> Transacao:
        """Atualiza transação"""
        
        transaction = TransactionService.get_transaction_by_id(db, transaction_id, user_id)
        
        if id_categoria:
            # Verifica se nova categoria existe e pertence ao usuário
            category = db.query(Categoria).filter(
                Categoria.id == id_categoria,
                Categoria.id_usuario == user_id,
                Categoria.eh_ativa == True
            ).first()
            
            if not category:
                raise NotFoundError("Categoria", id_categoria)
            
            # Verifica se tipo da categoria bate com tipo da transação
            if category.tipo != transaction.tipo:
                raise ValidationError(f"Tipo da categoria ({category.tipo}) não confere com tipo da transação ({transaction.tipo})")
            
            transaction.id_categoria = id_categoria
        
        if valor is not None:
            transaction.valor = valor
        
        if descricao is not None:
            transaction.descricao = descricao
        
        if data is not None:
            transaction.data = data
        
        if observacoes is not None:
            transaction.observacoes = observacoes
        
        if tags is not None:
            transaction.tags = tags_to_string(tags)
        
        transaction.atualizado_em = now_utc()
        
        try:
            db.commit()
            db.refresh(transaction)
            logger.info(f"Transação atualizada: {transaction_id} para usuário {user_id}")
            return transaction
        except Exception as e:
            db.rollback()
            logger.error(f"Erro ao atualizar transação: {str(e)}")
            raise ValidationError("Erro ao atualizar transação")
    
    @staticmethod
    def delete_transaction(db: Session, transaction_id: str, user_id: str) -> None:
        """Remove transação"""
        
        transaction = TransactionService.get_transaction_by_id(db, transaction_id, user_id)
        
        try:
            db.delete(transaction)
            db.commit()
            logger.info(f"Transação removida: {transaction_id} para usuário {user_id}")
        except Exception as e:
            db.rollback()
            logger.error(f"Erro ao remover transação: {str(e)}")
            raise ValidationError("Erro ao remover transação")
    
    @staticmethod
    def get_transactions_summary(
        db: Session,
        user_id: str,
        data_inicio: Optional[datetime] = None,
        data_fim: Optional[datetime] = None
    ) -> Dict[str, Any]:
        """Obtém resumo das transações"""
        
        query = db.query(Transacao).filter(Transacao.id_usuario == user_id)
        
        if data_inicio:
            query = query.filter(Transacao.data >= data_inicio)
        
        if data_fim:
            query = query.filter(Transacao.data <= data_fim)
        
        # Totais por tipo
        receitas = query.filter(Transacao.tipo == "receita")
        despesas = query.filter(Transacao.tipo == "despesa")
        
        total_receitas = receitas.with_entities(func.sum(Transacao.valor)).scalar() or 0.0
        total_despesas = despesas.with_entities(func.sum(Transacao.valor)).scalar() or 0.0
        
        count_receitas = receitas.count()
        count_despesas = despesas.count()
        
        saldo = total_receitas - total_despesas
        
        return {
            "total_receitas": float(total_receitas),
            "total_despesas": float(total_despesas),
            "saldo": float(saldo),
            "count_receitas": count_receitas,
            "count_despesas": count_despesas,
            "total_transacoes": count_receitas + count_despesas
        }
    
    @staticmethod
    def get_transactions_by_category(
        db: Session,
        user_id: str,
        data_inicio: Optional[datetime] = None,
        data_fim: Optional[datetime] = None
    ) -> List[Dict[str, Any]]:
        """Obtém transações agrupadas por categoria"""
        
        query = db.query(
            Categoria.id,
            Categoria.nome,
            Categoria.tipo,
            Categoria.cor,
            Categoria.icone,
            func.sum(Transacao.valor).label('total'),
            func.count(Transacao.id).label('count')
        ).join(Transacao).filter(Transacao.id_usuario == user_id)
        
        if data_inicio:
            query = query.filter(Transacao.data >= data_inicio)
        
        if data_fim:
            query = query.filter(Transacao.data <= data_fim)
        
        results = query.group_by(Categoria.id).order_by(desc('total')).all()
        
        return [
            {
                "categoria_id": result.id,
                "categoria_nome": result.nome,
                "categoria_tipo": result.tipo,
                "categoria_cor": result.cor,
                "categoria_icone": result.icone,
                "total": float(result.total),
                "count": result.count
            }
            for result in results
        ]
    
    @staticmethod
    def get_daily_transactions(
        db: Session,
        user_id: str,
        data_inicio: Optional[datetime] = None,
        data_fim: Optional[datetime] = None
    ) -> List[Dict[str, Any]]:
        """Obtém transações agrupadas por dia"""
        
        query = db.query(
            func.date(Transacao.data).label('data'),
            Transacao.tipo,
            func.sum(Transacao.valor).label('total'),
            func.count(Transacao.id).label('count')
        ).filter(Transacao.id_usuario == user_id)
        
        if data_inicio:
            query = query.filter(Transacao.data >= data_inicio)
        
        if data_fim:
            query = query.filter(Transacao.data <= data_fim)
        
        results = query.group_by(
            func.date(Transacao.data),
            Transacao.tipo
        ).order_by(desc('data')).all()
        
        # Agrupa por data
        daily_data = {}
        for result in results:
            date_str = result.data.isoformat()
            
            if date_str not in daily_data:
                daily_data[date_str] = {
                    "data": date_str,
                    "receitas": 0.0,
                    "despesas": 0.0,
                    "count_receitas": 0,
                    "count_despesas": 0
                }
            
            if result.tipo == "receita":
                daily_data[date_str]["receitas"] = float(result.total)
                daily_data[date_str]["count_receitas"] = result.count
            else:
                daily_data[date_str]["despesas"] = float(result.total)
                daily_data[date_str]["count_despesas"] = result.count
        
        # Calcula saldo diário
        for data in daily_data.values():
            data["saldo"] = data["receitas"] - data["despesas"]
            data["total_transacoes"] = data["count_receitas"] + data["count_despesas"]
        
        return list(daily_data.values())
    
    @staticmethod
    def search_transactions(
        db: Session,
        user_id: str,
        termo: str,
        limit: int = 20
    ) -> List[Transacao]:
        """Busca transações por termo"""
        
        search_term = f"%{termo}%"
        return db.query(Transacao).filter(
            Transacao.id_usuario == user_id,
            or_(
                Transacao.descricao.ilike(search_term),
                Transacao.observacoes.ilike(search_term),
                Transacao.tags.ilike(search_term)
            )
        ).order_by(desc(Transacao.data)).limit(limit).all()
