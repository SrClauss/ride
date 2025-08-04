#!/usr/bin/env python3
"""
Script de Seed para Dados Demo
==============================

Este script cria um usuário de teste com dados históricos extensivos e realistas 
baseados nos mocks do frontend para testes completos de funcionalidades.

Uso:
    python scripts/seed_demo_data.py

Funcionalidades:
- Criar usuário demo premium com credenciais fixas (demo@riderfinance.com / demo123)
- Inserir 10 categorias padrão (5 receitas + 5 despesas) baseadas em apps de motorista
- Gerar 3.000+ transações históricas dos últimos 2 anos (2023-2025)
- Criar 5 metas diversificadas (ativas, em progresso, concluídas)
- Valores e descrições realistas para cada tipo de transação
- Horários e frequências consistentes com trabalho de motorista
- Dados ideais para testar pesquisas, filtros, analytics e dashboards

Dados Gerados:
- 👤 1 usuário premium ativo
- 📂 10 categorias (Uber, 99, iFood, InDrive, Combustível, Manutenção, etc.)
- 💰 ~3.200 transações com valores realistas (R$ 8,00 a R$ 800,00)
- 🎯 5 metas (R$ 1.200 a R$ 15.000) com diferentes status
- 📅 Dados distribuídos por 2 anos para análises temporais
"""

import sys
import os
from datetime import datetime, timedelta, date
from decimal import Decimal
import logging
import random
import uuid
from typing import List, Dict

# Adicionar o diretório pai ao path para importar módulos do projeto
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from sqlalchemy.orm import Session
from config.database import SessionLocal, engine
from models import Base, Usuario, Categoria, Meta, Transacao, SessaoTrabalho
from services.auth_service import AuthService
from services.category_service import CategoryService
from services.goal_service import GoalService
from services.transaction_service import TransactionService
from services.session_service import SessionService
from schemas.auth_schemas import UserRegister
from schemas.category_schemas import CategoryCreate
from schemas.goal_schemas import MetaCreate, CategoriaMeta
from schemas.transaction_schemas import TransactionCreate

# Constantes para tipos de transação
TIPO_RECEITA = "receita"
TIPO_DESPESA = "despesa"
import uuid

# Configurar logging
logging.basicConfig(level=logging.INFO, format='%(levelname)s - %(message)s')
logger = logging.getLogger(__name__)

# Configurações para geração de dados históricos
ANOS_HISTORICO = 2  # Últimos 2 anos
TRANSACOES_POR_DIA_MIN = 2  # Mínimo de transações por dia
TRANSACOES_POR_DIA_MAX = 8  # Máximo de transações por dia
DIAS_TRABALHO_SEMANA = [0, 1, 2, 3, 4, 5]  # Segunda a sábado
PROBABILIDADE_TRABALHO_DOMINGO = 0.3  # 30% chance de trabalhar domingo

# Valores realistas para diferentes tipos de transação
VALORES_RECEITA = {
    "Uber": (12.50, 85.00),
    "99": (15.00, 90.00), 
    "iFood": (8.00, 45.00),
    "InDrive": (10.00, 70.00),
    "Outros Apps": (12.00, 60.00)
}

VALORES_DESPESA = {
    "Combustível": (35.00, 180.00),
    "Manutenção": (50.00, 800.00),
    "Alimentação": (15.00, 80.00),
    "Pedágio": (6.50, 25.00),
    "Limpeza": (20.00, 120.00)
}

# Constantes do usuário demo
DEMO_USER_ID = "demo-user-2025"
DEMO_EMAIL = "demo@riderfinance.com"
DEMO_PASSWORD = "demo123"
DEMO_USERNAME = "rider_demo"

class DemoDataSeeder:
    """Classe principal para gerenciar o seed dos dados demo"""
    
    def __init__(self):
        self.db = SessionLocal()
        self.demo_user = None
        
    def __enter__(self):
        return self
        
    def __exit__(self, exc_type, exc_val, exc_tb):
        self.db.close()
        
    def run_seed(self):
        """Executar todo o processo de seed dos dados demo"""
        try:
            logger.info("🌱 Iniciando seed dos dados demo...")
            
            # 1. Limpar dados existentes
            self.cleanup_existing_data()
            
            # 2. Criar usuário demo
            self.create_demo_user()
            
            # 3. Criar categorias padrão
            self.create_demo_categories()
            
            # 4. Gerar dados históricos dos últimos anos
            self.generate_historical_data()
            
            # 5. Criar metas de exemplo
            self.create_demo_goals()
            
            # 6. Gerar sessões de trabalho históricas
            self.generate_work_sessions()
            
            logger.info("✅ Seed dos dados demo concluído com sucesso!")
            self.print_summary()
            
        except Exception as e:
            logger.error(f"❌ Erro durante o seed: {e}")
            self.db.rollback()
            raise
        finally:
            self.db.close()
    
    def cleanup_existing_data(self):
        """Limpar dados existentes do usuário demo"""
        logger.info("🧹 Limpando dados existentes do usuário demo...")
        
        # Buscar usuário demo existente
        existing_user = self.db.query(Usuario).filter(
            Usuario.email == DEMO_EMAIL
        ).first()
        
        if existing_user:
            user_id = existing_user.id
            
            # Deletar dados relacionados em ordem (respeitando foreign keys)
            self.db.query(Transacao).filter(Transacao.id_usuario == user_id).delete()
            self.db.query(SessaoTrabalho).filter(SessaoTrabalho.id_usuario == user_id).delete()
            self.db.query(Meta).filter(Meta.id_usuario == user_id).delete()
            self.db.query(Categoria).filter(Categoria.id_usuario == user_id).delete()
            self.db.query(Usuario).filter(Usuario.id == user_id).delete()
            
            self.db.commit()
            logger.info(f"🗑️ Dados do usuário demo removidos: {user_id}")
    
    def create_demo_user(self):
        """Criar usuário demo com credenciais fixas"""
        logger.info("👤 Criando usuário demo...")
        
        # Criar usuário usando o serviço de auth
        self.demo_user = AuthService.register_user(
            db=self.db,
            nome_usuario=DEMO_USERNAME,
            email=DEMO_EMAIL,
            senha=DEMO_PASSWORD,
            nome_completo="João Motorista Demo",
            telefone="(11) 99999-9999"
        )
        
        # Atualizar para assinatura premium e dados adicionais
        user_obj = self.db.query(Usuario).filter(Usuario.id == self.demo_user.id).first()
        user_obj.tipo_assinatura = "premium"
        user_obj.eh_pago = True
        user_obj.status_pagamento = "ativo"
        user_obj.veiculo = "Honda Civic 2020 - ABC-1234"
        user_obj.data_inicio_atividade = datetime(2023, 1, 15)  # Início há 2 anos
        
        self.db.commit()
        
        logger.info(f"✅ Usuário demo criado: {self.demo_user.id}")
        logger.info(f"📧 Email: {DEMO_EMAIL}")
        logger.info(f"🔑 Senha: {DEMO_PASSWORD}")
    
    def create_demo_categories(self):
        """Criar categorias padrão baseadas nos mocks do frontend"""
        logger.info("📂 Criando categorias demo...")
        
        # Categorias de receita (apps de transporte)
        receita_categories = [
            {"nome": "Uber", "cor": "#000000", "icone": "car"},
            {"nome": "99", "cor": "#FFD700", "icone": "car"},
            {"nome": "iFood", "cor": "#EA1E2C", "icone": "motorcycle"},
            {"nome": "InDrive", "cor": "#1E90FF", "icone": "car"},
            {"nome": "Outros Apps", "cor": "#6A5ACD", "icone": "smartphone"}
        ]
        
        # Categorias de despesa
        despesa_categories = [
            {"nome": "Combustível", "cor": "#FF4444", "icone": "fuel"},
            {"nome": "Manutenção", "cor": "#FF8800", "icone": "wrench"},
            {"nome": "Alimentação", "cor": "#4CAF50", "icone": "utensils"},
            {"nome": "Pedágio", "cor": "#9C27B0", "icone": "road"},
            {"nome": "Limpeza", "cor": "#2196F3", "icone": "spray-can"}
        ]
        
        created_count = 0
        
        # Criar categorias de receita
        for cat_data in receita_categories:
            CategoryService.create_category(
                db=self.db,
                user_id=self.demo_user.id,
                nome=cat_data["nome"],
                tipo=TIPO_RECEITA,
                icone=cat_data["icone"],
                cor=cat_data["cor"]
            )
            created_count += 1
        
        # Criar categorias de despesa  
        for cat_data in despesa_categories:
            CategoryService.create_category(
                db=self.db,
                user_id=self.demo_user.id,
                nome=cat_data["nome"],
                tipo=TIPO_DESPESA,
                icone=cat_data["icone"],
                cor=cat_data["cor"]
            )
            created_count += 1
        
        logger.info(f"✅ {created_count} categorias criadas")
    
    def create_demo_goals(self):
        """Criar metas de exemplo baseadas nos mocks do frontend"""
        logger.info("🎯 Criando metas demo...")
        
        # Meta 1: Reserva de Emergência (meta antiga, já em progresso)
        goal1_data = MetaCreate(
            title="Reserva de Emergência",
            description="Construir uma reserva para emergências e imprevistos",
            targetValue=Decimal("5000.00"),
            currentValue=Decimal("3250.00"),  # Mais progresso pois é antiga
            category=CategoriaMeta.EMERGENCY,
            deadline=datetime(2025, 12, 31)
        )
        
        goal1 = GoalService.create_goal(self.db, self.demo_user.id, goal1_data)
        
        # Meta 2: Novo Smartphone (meta recente)
        goal2_data = MetaCreate(
            title="Novo Smartphone",
            description="Comprar um smartphone novo para trabalho",
            targetValue=Decimal("2500.00"),
            currentValue=Decimal("800.00"),
            category=CategoriaMeta.PURCHASE,
            deadline=datetime(2025, 10, 15)
        )
        
        goal2 = GoalService.create_goal(self.db, self.demo_user.id, goal2_data)
        
        # Meta 3: Investimento (meta de longo prazo)
        goal3_data = MetaCreate(
            title="Fundo de Investimento",
            description="Começar a investir para o futuro",
            targetValue=Decimal("15000.00"),
            currentValue=Decimal("2500.00"),  # Progresso de 2 anos
            category=CategoriaMeta.INVESTMENT,
            deadline=datetime(2026, 6, 30)
        )
        
        goal3 = GoalService.create_goal(self.db, self.demo_user.id, goal3_data)
        
        # Meta 4: Troca de Carro (meta concluída no passado - ajustar deadline)
        goal4_data = MetaCreate(
            title="Troca de Carro",
            description="Trocar o carro por um modelo mais novo",
            targetValue=Decimal("8000.00"),
            currentValue=Decimal("8000.00"),  # Meta concluída
            category=CategoriaMeta.PURCHASE,
            deadline=datetime(2025, 12, 31)  # Deadline no futuro para validação
        )
        
        goal4 = GoalService.create_goal(self.db, self.demo_user.id, goal4_data)
        
        # Meta 5: Curso de Inglês (meta concluída - ajustar deadline)
        goal5_data = MetaCreate(
            title="Curso de Inglês",
            description="Fazer um curso de inglês para melhorar atendimento",
            targetValue=Decimal("1200.00"),
            currentValue=Decimal("1200.00"),
            category=CategoriaMeta.EDUCATION,
            deadline=datetime(2025, 11, 30)  # Deadline no futuro para validação
        )
        
        goal5 = GoalService.create_goal(self.db, self.demo_user.id, goal5_data)
        
        logger.info(f"✅ 5 metas criadas (incluindo algumas concluídas)")
    
    def generate_historical_data(self):
        """Gerar dados históricos dos últimos anos"""
        logger.info("📊 Gerando dados históricos dos últimos anos...")
        
        # Definir período histórico
        end_date = datetime.now().date()
        start_date = end_date - timedelta(days=365 * ANOS_HISTORICO)
        
        # Buscar categorias criadas
        categorias_receita = self.db.query(Categoria).filter(
            Categoria.id_usuario == self.demo_user.id,
            Categoria.tipo == TIPO_RECEITA
        ).all()
        
        categorias_despesa = self.db.query(Categoria).filter(
            Categoria.id_usuario == self.demo_user.id,
            Categoria.tipo == TIPO_DESPESA
        ).all()
        
        total_transacoes = 0
        current_date = start_date
        
        logger.info(f"📅 Gerando transações de {start_date} até {end_date}")
        
        while current_date <= end_date:
            # Verificar se é dia de trabalho
            if self._should_work_today(current_date):
                # Gerar transações para o dia
                transacoes_dia = self._generate_day_transactions(
                    current_date, categorias_receita, categorias_despesa
                )
                total_transacoes += transacoes_dia
                
                # Commit a cada 50 dias para não sobrecarregar
                if (current_date - start_date).days % 50 == 0:
                    self.db.commit()
                    logger.info(f"⏳ Processados {(current_date - start_date).days} dias...")
            
            current_date += timedelta(days=1)
        
        self.db.commit()
        logger.info(f"✅ {total_transacoes} transações históricas criadas")
    
    def _should_work_today(self, data: date) -> bool:
        """Determinar se deve trabalhar em um dia específico"""
        dia_semana = data.weekday()
        
        # Segunda a sábado - sempre trabalha
        if dia_semana in DIAS_TRABALHO_SEMANA:
            return True
        
        # Domingo - probabilidade menor
        if dia_semana == 6:  # Domingo
            return random.random() < PROBABILIDADE_TRABALHO_DOMINGO
        
        return False
    
    def _generate_day_transactions(self, data: date, categorias_receita: List, categorias_despesa: List) -> int:
        """Gerar transações para um dia específico"""
        num_transacoes = random.randint(TRANSACOES_POR_DIA_MIN, TRANSACOES_POR_DIA_MAX)
        
        # 70% receitas, 30% despesas
        num_receitas = int(num_transacoes * 0.7)
        num_despesas = num_transacoes - num_receitas
        
        transacoes_criadas = 0
        
        # Gerar receitas
        for _ in range(num_receitas):
            categoria = random.choice(categorias_receita)
            valor_min, valor_max = VALORES_RECEITA.get(categoria.nome, (15.00, 60.00))
            valor = round(random.uniform(valor_min, valor_max), 2)
            
            # Horário aleatório entre 6h e 22h
            hora = random.randint(6, 22)
            minuto = random.randint(0, 59)
            data_hora = datetime.combine(data, datetime.min.time().replace(hour=hora, minute=minuto))
            
            self._create_transaction(
                categoria=categoria,
                valor=valor,
                tipo=TIPO_RECEITA,
                data=data_hora,
                descricao=self._generate_receita_description(categoria.nome)
            )
            transacoes_criadas += 1
        
        # Gerar despesas
        for _ in range(num_despesas):
            categoria = random.choice(categorias_despesa)
            valor_min, valor_max = VALORES_DESPESA.get(categoria.nome, (20.00, 100.00))
            valor = round(random.uniform(valor_min, valor_max), 2)
            
            # Horário aleatório
            hora = random.randint(7, 21)
            minuto = random.randint(0, 59)
            data_hora = datetime.combine(data, datetime.min.time().replace(hour=hora, minute=minuto))
            
            self._create_transaction(
                categoria=categoria,
                valor=valor,
                tipo=TIPO_DESPESA,
                data=data_hora,
                descricao=self._generate_despesa_description(categoria.nome)
            )
            transacoes_criadas += 1
        
        return transacoes_criadas
    
    def _create_transaction(self, categoria, valor: float, tipo: str, data: datetime, descricao: str):
        """Criar uma transação individual"""
        TransactionService.create_transaction(
            db=self.db,
            user_id=self.demo_user.id,
            id_categoria=categoria.id,
            valor=valor,
            tipo=tipo,
            descricao=descricao,
            data=data
        )
    
    def _generate_receita_description(self, categoria_nome: str) -> str:
        """Gerar descrições realistas para receitas"""
        descriptions = {
            "Uber": [
                "Corrida Vila Madalena → Centro",
                "Viagem Aeroporto → Moema", 
                "Corrida Paulista → Ibirapuera",
                "Viagem Bela Vista → Jardins",
                "Corrida Liberdade → Vila Olímpia"
            ],
            "99": [
                "Corrida Brooklin → Pinheiros",
                "Viagem Santana → Centro",
                "Corrida Tatuapé → Vila Madalena",
                "Viagem Ipiranga → Jardins",
                "Corrida Lapa → Consolação"
            ],
            "iFood": [
                "Entrega McDonald's",
                "Delivery Burger King",
                "Entrega restaurante japonês",
                "Delivery pizzaria",
                "Entrega açaí"
            ],
            "InDrive": [
                "Corrida negociada - Centro",
                "Viagem acordada - Zona Sul",
                "Corrida personalizada",
                "Viagem especial"
            ],
            "Outros Apps": [
                "Corrida Cabify",
                "Delivery Rappi", 
                "Corrida Lalamove",
                "Entrega especial"
            ]
        }
        
        return random.choice(descriptions.get(categoria_nome, ["Receita"]))
    
    def _generate_despesa_description(self, categoria_nome: str) -> str:
        """Gerar descrições realistas para despesas"""
        descriptions = {
            "Combustível": [
                "Abastecimento Shell",
                "Gasolina Posto Ipiranga",
                "Álcool BR Petrobras",
                "Combustível Alesat",
                "Gasolina aditivada"
            ],
            "Manutenção": [
                "Troca de óleo",
                "Alinhamento e balanceamento",
                "Revisão preventiva",
                "Troca de pastilha de freio",
                "Filtro de ar",
                "Pneu novo",
                "Bateria"
            ],
            "Alimentação": [
                "Almoço",
                "Lanche rápido",
                "Café da manhã",
                "Janta",
                "Água e refrigerante"
            ],
            "Pedágio": [
                "Pedagio Imigrantes",
                "Rodoanel",
                "Marginal Pinheiros",
                "Pedagio Anchieta"
            ],
            "Limpeza": [
                "Lavagem completa",
                "Enceramento",
                "Aspiração",
                "Lavagem simples"
            ]
        }
        
        return random.choice(descriptions.get(categoria_nome, ["Despesa"]))
    
    def generate_work_sessions(self):
        """Gerar sessões de trabalho históricas"""
        logger.info("⏱️ Gerando sessões de trabalho históricas...")
        
        sessions_created = 0
        current_date = datetime.now().date() - timedelta(days=730)  # 2 anos atrás
        end_date = datetime.now().date()
        
        while current_date <= end_date:
            # Determinar se é dia de trabalho (segunda a sábado)
            weekday = current_date.weekday()  # 0=segunda, 6=domingo
            
            # Probabilidade de trabalhar:
            # Segunda-Sexta: 90% de chance
            # Sábado: 70% de chance  
            # Domingo: 30% de chance
            work_probability = 0.9 if weekday < 5 else (0.7 if weekday == 5 else 0.3)
            
            if random.random() < work_probability:
                # Determinar número de sessões (turnos) no dia
                if weekday < 5:  # Dias úteis
                    num_sessions = random.choices([1, 2, 3], weights=[0.2, 0.6, 0.2])[0]
                else:  # Fins de semana
                    num_sessions = random.choices([1, 2], weights=[0.7, 0.3])[0]
                
                # Gerar sessões do dia
                for session_num in range(num_sessions):
                    session = self.create_work_session(current_date, session_num, weekday)
                    if session:
                        sessions_created += 1
            
            current_date += timedelta(days=1)
        
        logger.info(f"✅ {sessions_created} sessões de trabalho criadas")
    
    def create_work_session(self, work_date: date, session_num: int, weekday: int):
        """Criar uma sessão de trabalho específica"""
        try:
            # Definir horários baseados no turno e dia da semana
            if session_num == 0:  # Manhã
                start_hour = random.randint(6, 8)
                duration_hours = random.uniform(3, 5)
            elif session_num == 1:  # Tarde  
                start_hour = random.randint(12, 15)
                duration_hours = random.uniform(3, 6)
            else:  # Noite
                start_hour = random.randint(18, 20)
                duration_hours = random.uniform(2, 4)
            
            # Ajustar duração para fins de semana (geralmente mais curtas)
            if weekday >= 5:  # Sábado/Domingo
                duration_hours *= 0.7
            
            # Criar timestamps
            start_time = datetime.combine(work_date, datetime.min.time().replace(hour=start_hour))
            end_time = start_time + timedelta(hours=duration_hours)
            
            # Calcular métricas da sessão
            km_rodados = duration_hours * random.uniform(15, 35)  # 15-35 km/h média
            corridas_realizadas = max(1, int(duration_hours * random.uniform(1.5, 3)))  # 1.5-3 corridas/h
            
            # Gerar observações realistas
            observations = self.generate_session_observations(weekday, session_num, corridas_realizadas)
            
            # Criar a sessão
            session_data = {
                'id_usuario': self.demo_user.id,
                'inicio': start_time,
                'fim': end_time,
                'total_minutos': int(duration_hours * 60),
                'total_corridas': corridas_realizadas,
                'observacoes': observations,
                'eh_ativa': False
            }
            
            session = SessaoTrabalho(**session_data)
            self.db.add(session)
            
            return session
            
        except Exception as e:
            logger.error(f"Erro ao criar sessão de trabalho: {e}")
            return None
    
    def generate_session_observations(self, weekday: int, session_num: int, corridas: int) -> str:
        """Gerar observações realistas para a sessão"""
        observations = []
        
        # Observações baseadas no período
        period_obs = {
            0: ["Movimento matinal bom", "Rush da manhã", "Trânsito intenso", "Muitas corridas curtas"],
            1: ["Tarde calma", "Almoço movimentado", "Trânsito moderado", "Corridas médias"],
            2: ["Noite agitada", "Happy hour", "Corridas para casa", "Movimento noturno"]
        }
        
        # Observações baseadas no dia da semana
        day_obs = {
            0: "Segunda-feira produtiva",  # Segunda
            1: "Terça normal",             # Terça
            2: "Quarta equilibrada",       # Quarta
            3: "Quinta movimentada",       # Quinta
            4: "Sexta agitada",           # Sexta
            5: "Sábado divertido",        # Sábado
            6: "Domingo tranquilo"        # Domingo
        }
        
        observations.append(day_obs.get(weekday, "Dia normal"))
        observations.append(random.choice(period_obs.get(session_num, ["Trabalho padrão"])))
        
        # Observações baseadas no número de corridas
        if corridas >= 8:
            observations.append("Muitas corridas!")
        elif corridas <= 3:
            observations.append("Poucas corridas")
        
        # Observações aleatórias ocasionais
        random_obs = [
            "Combustível ok", "App estável", "Passageiros educados", 
            "Trânsito bom", "Chuva leve", "Calor forte", "Tempo bom",
            "Região movimentada", "Área tranquila", "Centro agitado"
        ]
        
        if random.random() < 0.3:  # 30% de chance
            observations.append(random.choice(random_obs))
        
        return " • ".join(observations)
    
    def print_summary(self):
        """Imprimir resumo dos dados criados"""
        logger.info("\n" + "="*50)
        logger.info("📊 RESUMO DOS DADOS DEMO CRIADOS")
        logger.info("="*50)
        
        # Contar dados criados
        users = self.db.query(Usuario).filter(Usuario.email == DEMO_EMAIL).count()
        categories = self.db.query(Categoria).filter(Categoria.id_usuario == self.demo_user.id).count()
        goals = self.db.query(Meta).filter(Meta.id_usuario == self.demo_user.id).count()
        transactions = self.db.query(Transacao).filter(Transacao.id_usuario == self.demo_user.id).count()
        sessions = self.db.query(SessaoTrabalho).filter(SessaoTrabalho.id_usuario == self.demo_user.id).count()
        
        logger.info(f"👤 Usuários: {users}")
        logger.info(f"📂 Categorias: {categories}")
        logger.info(f"🎯 Metas: {goals}")
        logger.info(f"💰 Transações: {transactions}")
        logger.info(f"⏱️ Sessões: {sessions}")
        logger.info("")
        logger.info("🔐 CREDENCIAIS DE LOGIN:")
        logger.info(f"📧 Email: {DEMO_EMAIL}")
        logger.info(f"🔑 Senha: {DEMO_PASSWORD}")
        logger.info("="*50)


def main():
    """Função principal do script"""
    try:
        # Verificar se o banco está acessível
        with engine.connect() as conn:
            logger.info("🔌 Conexão com banco de dados estabelecida")
        
        # Executar seed
        with DemoDataSeeder() as seeder:
            seeder.run_seed()
            
    except Exception as e:
        logger.error(f"💥 Falha na execução do script: {e}")
        sys.exit(1)


if __name__ == "__main__":
    main()
