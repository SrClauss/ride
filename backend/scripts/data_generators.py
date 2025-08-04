#!/usr/bin/env python3
"""
Gerador de Dados Realistas para Demo
====================================

Este módulo contém funções auxiliares para gerar dados consistentes e realistas
para o ambiente de demonstração do Rider Finance.

Funcionalidades:
- Gerar transações distribuídas ao longo do tempo
- Criar sessões de trabalho realistas
- Gerar metas com progresso variado
- Calcular valores monetários coerentes

Usado pelo script seed_demo_data.py para manter código organizado e reutilizável.
"""

import random
from datetime import datetime, timedelta, date, time
from decimal import Decimal
from typing import List, Dict, Tuple
import uuid


class DataGenerator:
    """Classe para gerar dados realistas de demonstração"""
    
    def __init__(self):
        self.setup_data_patterns()
    
    def setup_data_patterns(self):
        """Configurar padrões de dados realistas"""
        
        # Padrões de horários para diferentes tipos de trabalho
        self.work_patterns = {
            'morning': {
                'start_range': (6, 9),
                'duration_range': (3, 5),
                'peak_probability': 0.8
            },
            'afternoon': {
                'start_range': (12, 16),
                'duration_range': (3, 6),
                'peak_probability': 0.6
            },
            'evening': {
                'start_range': (18, 21),
                'duration_range': (2, 4),
                'peak_probability': 0.9
            }
        }
        
        # Padrões de valores para diferentes categorias
        self.value_patterns = {
            'receita': {
                'Uber': (12, 65),
                '99': (10, 58),
                'iFood': (8, 45),
                'InDrive': (15, 70),
                'Outros Apps': (10, 55)
            },
            'despesa': {
                'Combustível': (35, 150),
                'Manutenção': (50, 800),
                'Alimentação': (8, 35),
                'Pedágio': (5, 25),
                'Limpeza': (15, 80)
            }
        }
        
        # Padrões de frequência por dia da semana
        self.frequency_patterns = {
            0: {'min': 4, 'max': 8, 'weight': 0.9},  # Segunda
            1: {'min': 3, 'max': 7, 'weight': 0.8},  # Terça
            2: {'min': 4, 'max': 8, 'weight': 0.85}, # Quarta
            3: {'min': 5, 'max': 9, 'weight': 0.9},  # Quinta
            4: {'min': 6, 'max': 10, 'weight': 1.0}, # Sexta
            5: {'min': 3, 'max': 7, 'weight': 0.7},  # Sábado
            6: {'min': 1, 'max': 4, 'weight': 0.4}   # Domingo
        }
    
    def generate_transactions_timeline(self, start_date: date, end_date: date, 
                                     categories: List[Dict]) -> List[Dict]:
        """
        Gerar transações distribuídas realisticamente ao longo do tempo
        
        Args:
            start_date: Data de início
            end_date: Data de fim
            categories: Lista de categorias disponíveis
            
        Returns:
            Lista de dados de transações
        """
        transactions = []
        current_date = start_date
        
        while current_date <= end_date:
            weekday = current_date.weekday()
            
            # Determinar se trabalha no dia baseado em padrões realistas
            work_probability = self.frequency_patterns[weekday]['weight']
            
            if random.random() < work_probability:
                day_transactions = self.generate_day_transactions(
                    current_date, categories, weekday
                )
                transactions.extend(day_transactions)
            
            current_date += timedelta(days=1)
        
        return transactions
    
    def generate_day_transactions(self, work_date: date, categories: List[Dict], 
                                weekday: int) -> List[Dict]:
        """Gerar transações para um dia específico"""
        transactions = []
        
        # Determinar número de transações baseado no dia da semana
        pattern = self.frequency_patterns[weekday]
        num_transactions = random.randint(pattern['min'], pattern['max'])
        
        # Separar categorias por tipo
        receita_cats = [c for c in categories if c['tipo'] == 'receita']
        despesa_cats = [c for c in categories if c['tipo'] == 'despesa']
        
        # Gerar transações com distribuição realista (80% receitas, 20% despesas)
        for i in range(num_transactions):
            if random.random() < 0.8:  # 80% receitas
                category = random.choice(receita_cats)
                transaction = self.create_transaction_data(
                    work_date, category, 'receita', i, num_transactions
                )
            else:  # 20% despesas
                category = random.choice(despesa_cats)
                transaction = self.create_transaction_data(
                    work_date, category, 'despesa', i, num_transactions
                )
            
            transactions.append(transaction)
        
        return transactions
    
    def create_transaction_data(self, work_date: date, category: Dict, 
                              tipo: str, transaction_index: int, 
                              total_transactions: int) -> Dict:
        """Criar dados de uma transação específica"""
        
        # Gerar horário realista baseado na distribuição do dia
        transaction_time = self.generate_realistic_time(
            work_date, transaction_index, total_transactions
        )
        
        # Gerar valor baseado na categoria e padrões
        valor = self.generate_realistic_value(category['nome'], tipo)
        
        # Gerar descrição realista
        descricao = self.generate_realistic_description(category['nome'], tipo)
        
        return {
            'data_transacao': transaction_time,
            'valor': valor,
            'tipo': tipo,
            'descricao': descricao,
            'categoria_id': category['id']
        }
    
    def generate_realistic_time(self, work_date: date, index: int, 
                              total: int) -> datetime:
        """Gerar horário realista para transação"""
        
        # Distribuir transações ao longo do dia de trabalho (6h-22h)
        start_hour = 6
        end_hour = 22
        total_minutes = (end_hour - start_hour) * 60
        
        # Distribuir com alguma aleatoriedade
        if total > 1:
            base_minutes = (total_minutes / total) * index
            random_offset = random.randint(-30, 30)  # ±30 min de variação
            final_minutes = max(0, min(total_minutes, base_minutes + random_offset))
        else:
            final_minutes = random.randint(0, total_minutes)
        
        hours = int(final_minutes // 60) + start_hour
        minutes = int(final_minutes % 60)
        
        return datetime.combine(work_date, time(hours, minutes))
    
    def generate_realistic_value(self, categoria_nome: str, tipo: str) -> Decimal:
        """Gerar valor realista baseado na categoria"""
        
        if tipo in self.value_patterns and categoria_nome in self.value_patterns[tipo]:
            min_val, max_val = self.value_patterns[tipo][categoria_nome]
            
            # Usar distribuição normal para valores mais realistas
            mean = (min_val + max_val) / 2
            std = (max_val - min_val) / 6  # 99.7% dos valores dentro do range
            
            value = random.normalvariate(mean, std)
            value = max(min_val, min(max_val, value))  # Clamp no range
            
            return Decimal(str(round(value, 2)))
        else:
            # Valores padrão se categoria não encontrada
            if tipo == 'receita':
                return Decimal(str(round(random.uniform(10, 60), 2)))
            else:
                return Decimal(str(round(random.uniform(20, 100), 2)))
    
    def generate_realistic_description(self, categoria_nome: str, tipo: str) -> str:
        """Gerar descrição realista para transação"""
        
        descriptions = {
            'receita': {
                'Uber': [
                    "Corrida para Centro", "Viagem Aeroporto", "Corrida Zona Sul",
                    "Trajeto Empresarial", "Corrida Shopping", "Viagem Estação",
                    "Corrida Hospital", "Trajeto Universidade", "Corrida Evento"
                ],
                '99': [
                    "Corrida 99", "Viagem 99 Pop", "99 Confort", "Corrida Zona Norte",
                    "Trajeto 99", "Viagem Centro", "Corrida Residencial"
                ],
                'iFood': [
                    "Entrega Restaurante", "Delivery Fast Food", "Entrega Centro",
                    "Delivery Shopping", "Entrega Residencial", "Pedido Express"
                ],
                'InDrive': [
                    "Viagem InDrive", "Corrida Negociada", "Trajeto InDrive",
                    "Corrida Personalizada", "Viagem Zona Oeste"
                ],
                'Outros Apps': [
                    "Corrida Cabify", "Entrega Rappi", "Viagem 99Moto",
                    "Delivery Uber Eats", "Corrida Beat"
                ]
            },
            'despesa': {
                'Combustível': [
                    "Abastecimento", "Gasolina Comum", "Etanol", "Gasolina Aditivada",
                    "Combustível Shell", "Posto Ipiranga", "Combustível BR"
                ],
                'Manutenção': [
                    "Troca de Óleo", "Revisão", "Alinhamento", "Pneus Novos",
                    "Freios", "Filtro de Ar", "Velas", "Mecânico", "Lavagem"
                ],
                'Alimentação': [
                    "Lanche Rápido", "Almoço", "Café", "Água", "Refrigerante",
                    "Sanduíche", "Refeição", "Lanchonete"
                ],
                'Pedágio': [
                    "Pedágio Marginal", "Pedágio Raposo", "Pedágio Castello",
                    "Pedágio Ayrton Senna", "Pedágio Régis Bittencourt"
                ],
                'Limpeza': [
                    "Lavagem Simples", "Enceramento", "Aspiração", "Lavagem Completa",
                    "Limpeza Interna", "Cera Automotiva"
                ]
            }
        }
        
        if tipo in descriptions and categoria_nome in descriptions[tipo]:
            return random.choice(descriptions[tipo][categoria_nome])
        else:
            return f"{categoria_nome} - {tipo.title()}"
    
    def generate_work_sessions(self, start_date: date, end_date: date) -> List[Dict]:
        """Gerar sessões de trabalho realistas"""
        sessions = []
        current_date = start_date
        
        while current_date <= end_date:
            weekday = current_date.weekday()
            
            # Probabilidade de trabalhar baseada no dia da semana
            work_probability = self.frequency_patterns[weekday]['weight']
            
            if random.random() < work_probability:
                day_sessions = self.generate_day_sessions(current_date, weekday)
                sessions.extend(day_sessions)
            
            current_date += timedelta(days=1)
        
        return sessions
    
    def generate_day_sessions(self, work_date: date, weekday: int) -> List[Dict]:
        """Gerar sessões para um dia específico"""
        sessions = []
        
        # Determinar número de turnos baseado no dia
        if weekday < 5:  # Dias úteis
            num_sessions = random.choices([1, 2, 3], weights=[0.2, 0.6, 0.2])[0]
        else:  # Fins de semana
            num_sessions = random.choices([1, 2], weights=[0.7, 0.3])[0]
        
        for session_num in range(num_sessions):
            session = self.create_session_data(work_date, session_num, weekday)
            sessions.append(session)
        
        return sessions
    
    def create_session_data(self, work_date: date, session_num: int, 
                          weekday: int) -> Dict:
        """Criar dados de uma sessão específica"""
        
        # Determinar padrão do turno
        if session_num == 0:
            pattern = self.work_patterns['morning']
        elif session_num == 1:
            pattern = self.work_patterns['afternoon']
        else:
            pattern = self.work_patterns['evening']
        
        # Gerar horários
        start_hour = random.randint(*pattern['start_range'])
        duration = random.uniform(*pattern['duration_range'])
        
        # Ajustar para fins de semana (geralmente mais curto)
        if weekday >= 5:
            duration *= 0.7
        
        start_time = datetime.combine(work_date, time(start_hour))
        end_time = start_time + timedelta(hours=duration)
        
        # Calcular métricas
        km_rodados = duration * random.uniform(15, 35)  # 15-35 km/h
        corridas = max(1, int(duration * random.uniform(1.5, 3)))  # 1.5-3 corridas/h
        
        return {
            'data_inicio': start_time,
            'data_fim': end_time,
            'horas_trabalhadas': Decimal(str(round(duration, 2))),
            'km_rodados': Decimal(str(round(km_rodados, 2))),
            'corridas_realizadas': corridas,
            'observacoes': self.generate_session_notes(weekday, session_num, corridas),
            'status': 'finalizada'
        }
    
    def generate_session_notes(self, weekday: int, session_num: int, 
                             corridas: int) -> str:
        """Gerar observações para sessão"""
        notes = []
        
        # Observações do período
        period_notes = {
            0: ["Rush matinal", "Movimento bom manhã", "Trânsito intenso"],
            1: ["Tarde tranquila", "Almoço movimentado", "Horário comercial"],
            2: ["Noite agitada", "Happy hour", "Volta para casa"]
        }
        
        # Observações do dia
        day_notes = [
            "Segunda produtiva", "Terça normal", "Quarta equilibrada",
            "Quinta movimentada", "Sexta intensa", "Sábado bom", "Domingo calmo"
        ]
        
        notes.append(day_notes[weekday])
        notes.append(random.choice(period_notes.get(session_num, ["Turno normal"])))
        
        # Observações baseadas em performance
        if corridas >= 8:
            notes.append("Muitas corridas!")
        elif corridas <= 3:
            notes.append("Poucas corridas")
        
        return " • ".join(notes)
    
    def generate_goals(self) -> List[Dict]:
        """Gerar metas realistas com progresso variado"""
        
        goals_templates = [
            {
                'title': 'Reserva de Emergência',
                'description': 'Fundo para emergências e imprevistos',
                'category': 'emergency',
                'target_range': (3000, 8000),
                'progress_range': (0.4, 0.8),
                'deadline_months': (6, 12)
            },
            {
                'title': 'Novo Smartphone',
                'description': 'Trocar celular para trabalho',
                'category': 'purchase',
                'target_range': (1500, 3500),
                'progress_range': (0.2, 0.6),
                'deadline_months': (3, 8)
            },
            {
                'title': 'Fundo de Investimento',
                'description': 'Investir para o futuro',
                'category': 'investment',
                'target_range': (10000, 20000),
                'progress_range': (0.1, 0.4),
                'deadline_months': (12, 24)
            },
            {
                'title': 'Troca de Carro',
                'description': 'Upgrade do veículo de trabalho',
                'category': 'purchase',
                'target_range': (15000, 35000),
                'progress_range': (0.8, 1.0),
                'deadline_months': (8, 18)
            },
            {
                'title': 'Curso de Capacitação',
                'description': 'Investir em educação e qualificação',
                'category': 'education',
                'target_range': (800, 2500),
                'progress_range': (0.5, 1.0),
                'deadline_months': (4, 10)
            }
        ]
        
        goals = []
        for template in goals_templates:
            # Calcular valores
            target_value = random.uniform(*template['target_range'])
            progress_ratio = random.uniform(*template['progress_range'])
            current_value = target_value * progress_ratio
            
            # Calcular deadline
            months_ahead = random.randint(*template['deadline_months'])
            deadline = datetime.now() + timedelta(days=30 * months_ahead)
            
            goal = {
                'title': template['title'],
                'description': template['description'],
                'category': template['category'],
                'targetValue': Decimal(str(round(target_value, 2))),
                'currentValue': Decimal(str(round(current_value, 2))),
                'deadline': deadline.date()
            }
            
            goals.append(goal)
        
        return goals
    
    def calculate_realistic_values(self, transactions: List[Dict]) -> Dict:
        """Calcular valores agregados realistas"""
        
        total_receitas = sum(
            t['valor'] for t in transactions if t['tipo'] == 'receita'
        )
        total_despesas = sum(
            t['valor'] for t in transactions if t['tipo'] == 'despesa'
        )
        
        return {
            'total_receitas': total_receitas,
            'total_despesas': total_despesas,
            'lucro_liquido': total_receitas - total_despesas,
            'margem_lucro': (total_receitas - total_despesas) / total_receitas if total_receitas > 0 else 0,
            'total_transacoes': len(transactions),
            'receitas_count': len([t for t in transactions if t['tipo'] == 'receita']),
            'despesas_count': len([t for t in transactions if t['tipo'] == 'despesa'])
        }
