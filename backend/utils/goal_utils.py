"""
Utilitários e funções auxiliares para metas
Seguindo padrões estabelecidos no projeto
"""
from datetime import date, timedelta, datetime
from typing import Optional, Dict, Any, List, Tuple
from decimal import Decimal


def calculate_progress_percentage(current_value: float, target_value: float) -> float:
    """
    Calcula a porcentagem de progresso de uma meta
    
    Args:
        current_value: Valor atual da meta
        target_value: Valor objetivo da meta
        
    Returns:
        Porcentagem de progresso (pode ser > 100%)
    """
    if target_value <= 0:
        return 0.0
    return (current_value / target_value) * 100


def calculate_days_remaining(deadline: date) -> int:
    """
    Calcula quantos dias restam até o deadline
    
    Args:
        deadline: Data limite da meta
        
    Returns:
        Número de dias restantes (negativo se vencida)
    """
    today = date.today()
    delta = deadline - today
    return delta.days


def determine_goal_status(
    current_value: float, 
    target_value: float, 
    deadline: date,
    is_completed: bool = False
) -> str:
    """
    Determina o status atual da meta
    
    Args:
        current_value: Valor atual
        target_value: Valor objetivo
        deadline: Data limite
        is_completed: Se foi marcada como concluída
        
    Returns:
        Status da meta: 'completed', 'overdue', 'on_track', 'behind', 'at_risk'
    """
    if is_completed:
        return 'completed'
    
    days_remaining = calculate_days_remaining(deadline)
    progress_percentage = calculate_progress_percentage(current_value, target_value)
    
    if days_remaining < 0:
        return 'overdue'
    
    if progress_percentage >= 100:
        return 'completed'
    
    # Calcula se está no ritmo esperado
    days_total = (deadline - date.today()).days + days_remaining
    if days_total > 0:
        expected_progress = ((days_total - days_remaining) / days_total) * 100
        
        if progress_percentage >= expected_progress * 0.9:  # 90% do esperado
            return 'on_track'
        elif days_remaining <= 7:  # Menos de 7 dias
            return 'at_risk'
        else:
            return 'behind'
    
    return 'on_track'


def validate_goal_data(goal_data: Dict[str, Any]) -> List[str]:
    """
    Valida dados de uma meta
    
    Args:
        goal_data: Dicionário com dados da meta
        
    Returns:
        Lista de erros de validação (vazia se válido)
    """
    errors = []
    
    # Validar título
    titulo = goal_data.get('titulo', '').strip()
    if not titulo:
        errors.append("Título é obrigatório")
    elif len(titulo) < 3:
        errors.append("Título deve ter pelo menos 3 caracteres")
    elif len(titulo) > 200:
        errors.append("Título muito longo (máximo 200 caracteres)")
    
    # Validar valor objetivo
    valor_objetivo = goal_data.get('valor_objetivo')
    if valor_objetivo is None:
        errors.append("Valor objetivo é obrigatório")
    elif not isinstance(valor_objetivo, (int, float, Decimal)) or valor_objetivo <= 0:
        errors.append("Valor objetivo deve ser um número positivo")
    
    # Validar tipo
    tipo = goal_data.get('tipo')
    tipos_validos = ['diaria', 'semanal', 'mensal', 'anual']
    if tipo not in tipos_validos:
        errors.append(f"Tipo deve ser um de: {', '.join(tipos_validos)}")
    
    # Validar categoria
    categoria = goal_data.get('categoria')
    categorias_validas = ['receita', 'corridas', 'horas', 'eficiencia', 'despesas']
    if categoria not in categorias_validas:
        errors.append(f"Categoria deve ser uma de: {', '.join(categorias_validas)}")
    
    # Validar data limite
    data_limite = goal_data.get('data_limite')
    if data_limite and isinstance(data_limite, date):
        if data_limite < date.today():
            errors.append("Data limite não pode ser no passado")
    
    return errors


def format_goal_deadline(deadline: date) -> str:
    """
    Formata a data limite de uma meta de forma amigável
    
    Args:
        deadline: Data limite
        
    Returns:
        String formatada da data
    """
    days_remaining = calculate_days_remaining(deadline)
    
    if days_remaining < 0:
        days_overdue = abs(days_remaining)
        if days_overdue == 1:
            return "Venceu ontem"
        return f"Venceu há {days_overdue} dias"
    elif days_remaining == 0:
        return "Vence hoje"
    elif days_remaining == 1:
        return "Vence amanhã"
    elif days_remaining <= 7:
        return f"Vence em {days_remaining} dias"
    else:
        return deadline.strftime("%d/%m/%Y")


def get_goal_priority(
    progress_percentage: float,
    days_remaining: int,
    goal_type: str
) -> Tuple[str, int]:
    """
    Determina a prioridade de uma meta
    
    Args:
        progress_percentage: Porcentagem de progresso
        days_remaining: Dias restantes
        goal_type: Tipo da meta
        
    Returns:
        Tupla (priority_label, priority_score) onde score é 1-5 (5 = máxima prioridade)
    """
    score = 1
    
    # Aumento baseado em dias restantes
    if days_remaining < 0:
        score = 5  # Vencida = prioridade máxima
        return ("critical", score)
    elif days_remaining <= 3:
        score += 3
    elif days_remaining <= 7:
        score += 2
    elif days_remaining <= 14:
        score += 1
    
    # Ajuste baseado no progresso
    if progress_percentage < 25:
        score += 2
    elif progress_percentage < 50:
        score += 1
    
    # Ajuste baseado no tipo
    type_priority = {
        'diaria': 2,
        'semanal': 1,
        'mensal': 0,
        'anual': -1
    }
    score += type_priority.get(goal_type, 0)
    
    # Limitar score entre 1 e 5
    score = max(1, min(5, score))
    
    # Determinar label
    if score >= 5:
        priority_label = "critical"
    elif score >= 4:
        priority_label = "high"
    elif score >= 3:
        priority_label = "medium"
    elif score >= 2:
        priority_label = "low"
    else:
        priority_label = "minimal"
    
    return (priority_label, score)


def calculate_recommended_daily_amount(
    target_value: float,
    current_value: float,
    deadline: date
) -> float:
    """
    Calcula o valor diário recomendado para atingir a meta
    
    Args:
        target_value: Valor objetivo
        current_value: Valor atual
        deadline: Data limite
        
    Returns:
        Valor diário recomendado
    """
    days_remaining = calculate_days_remaining(deadline)
    
    if days_remaining <= 0:
        return 0.0
    
    remaining_amount = target_value - current_value
    if remaining_amount <= 0:
        return 0.0
    
    return remaining_amount / days_remaining


def calculate_recommended_weekly_amount(
    target_value: float,
    current_value: float,
    deadline: date
) -> float:
    """
    Calcula o valor semanal recomendado para atingir a meta
    
    Args:
        target_value: Valor objetivo
        current_value: Valor atual
        deadline: Data limite
        
    Returns:
        Valor semanal recomendado
    """
    daily_amount = calculate_recommended_daily_amount(target_value, current_value, deadline)
    return daily_amount * 7


def calculate_recommended_monthly_amount(
    target_value: float,
    current_value: float,
    deadline: date
) -> float:
    """
    Calcula o valor mensal recomendado para atingir a meta
    
    Args:
        target_value: Valor objetivo
        current_value: Valor atual
        deadline: Data limite
        
    Returns:
        Valor mensal recomendado
    """
    daily_amount = calculate_recommended_daily_amount(target_value, current_value, deadline)
    return daily_amount * 30


def is_goal_on_track(
    current_value: float,
    target_value: float,
    deadline: date,
    created_date: Optional[date] = None
) -> bool:
    """
    Verifica se a meta está no ritmo adequado
    
    Args:
        current_value: Valor atual
        target_value: Valor objetivo
        deadline: Data limite
        created_date: Data de criação (opcional, usa hoje se não fornecida)
        
    Returns:
        True se está no ritmo, False caso contrário
    """
    if created_date is None:
        created_date = date.today()
    
    total_days = (deadline - created_date).days
    days_passed = (date.today() - created_date).days
    
    if total_days <= 0 or days_passed <= 0:
        return True
    
    expected_progress = (days_passed / total_days) * 100
    current_progress = calculate_progress_percentage(current_value, target_value)
    
    # Considera "no ritmo" se está pelo menos 90% do progresso esperado
    return current_progress >= expected_progress * 0.9


def get_completion_forecast(
    current_value: float,
    target_value: float,
    deadline: date,
    created_date: Optional[date] = None
) -> Dict[str, Any]:
    """
    Calcula uma previsão de conclusão da meta
    
    Args:
        current_value: Valor atual
        target_value: Valor objetivo
        deadline: Data limite
        created_date: Data de criação (opcional)
        
    Returns:
        Dicionário com previsões de conclusão
    """
    if created_date is None:
        created_date = date.today()
    
    days_passed = (date.today() - created_date).days
    days_remaining = calculate_days_remaining(deadline)
    
    forecast = {
        'will_complete_on_time': False,
        'projected_completion_date': None,
        'days_ahead_or_behind': 0,
        'completion_probability': 0.0
    }
    
    if days_passed <= 0:
        return forecast
    
    # Calcular taxa de progresso diária
    daily_progress_rate = current_value / max(days_passed, 1)
    
    if daily_progress_rate > 0:
        # Calcular quantos dias serão necessários para completar
        remaining_value = target_value - current_value
        days_needed = remaining_value / daily_progress_rate
        
        projected_completion = date.today() + timedelta(days=int(days_needed))
        forecast['projected_completion_date'] = projected_completion
        
        # Verificar se vai completar no prazo
        if projected_completion <= deadline:
            forecast['will_complete_on_time'] = True
            forecast['days_ahead_or_behind'] = (deadline - projected_completion).days
        else:
            forecast['days_ahead_or_behind'] = -(projected_completion - deadline).days
        
        # Calcular probabilidade baseada no ritmo atual
        if days_remaining > 0:
            efficiency = (current_value / target_value) / (days_passed / (days_passed + days_remaining))
            forecast['completion_probability'] = min(100.0, max(0.0, efficiency * 100))
    
    return forecast


def calculate_goal_efficiency(
    current_value: float,
    target_value: float,
    deadline: date,
    created_date: Optional[date] = None
) -> float:
    """
    Calcula a eficiência atual da meta
    
    Args:
        current_value: Valor atual
        target_value: Valor objetivo
        deadline: Data limite
        created_date: Data de criação (opcional)
        
    Returns:
        Score de eficiência (0-100+)
    """
    if created_date is None:
        created_date = date.today()
    
    return calculate_efficiency_score(
        calculate_progress_percentage(current_value, target_value),
        (date.today() - created_date).days,
        (deadline - created_date).days
    )


def calculate_efficiency_score(
    progress_percentage: float,
    days_passed: int,
    total_days: int
) -> float:
    """
    Calcula um score de eficiência da meta
    
    Args:
        progress_percentage: Porcentagem de progresso atual
        days_passed: Dias que se passaram desde o início
        total_days: Total de dias da meta
        
    Returns:
        Score de eficiência (0-100+)
    """
    if total_days <= 0 or days_passed <= 0:
        return 0.0
    
    expected_progress = (days_passed / total_days) * 100
    
    if expected_progress == 0:
        return 100.0 if progress_percentage > 0 else 0.0
    
    return (progress_percentage / expected_progress) * 100


def get_goal_insights(
    current_value: float,
    target_value: float,
    deadline: date,
    goal_type: str,
    created_date: Optional[date] = None
) -> Dict[str, Any]:
    """
    Gera insights e análises sobre uma meta
    
    Args:
        current_value: Valor atual
        target_value: Valor objetivo
        deadline: Data limite
        goal_type: Tipo da meta
        created_date: Data de criação (opcional)
        
    Returns:
        Dicionário com insights da meta
    """
    progress_percentage = calculate_progress_percentage(current_value, target_value)
    days_remaining = calculate_days_remaining(deadline)
    status = determine_goal_status(current_value, target_value, deadline)
    priority_label, priority_score = get_goal_priority(progress_percentage, days_remaining, goal_type)
    
    insights = {
        'progress_percentage': round(progress_percentage, 2),
        'days_remaining': days_remaining,
        'status': status,
        'priority': {
            'label': priority_label,
            'score': priority_score
        },
        'recommendations': {
            'daily_amount': round(calculate_recommended_daily_amount(target_value, current_value, deadline), 2),
            'weekly_amount': round(calculate_recommended_weekly_amount(target_value, current_value, deadline), 2)
        }
    }
    
    # Adicionar eficiência se temos data de criação
    if created_date:
        total_days = (deadline - created_date).days
        days_passed = (date.today() - created_date).days
        insights['efficiency_score'] = round(calculate_efficiency_score(progress_percentage, days_passed, total_days), 2)
    
    # Mensagens motivacionais/alertas
    messages = []
    if status == 'overdue':
        messages.append("Meta vencida! Revise os objetivos ou estenda o prazo.")
    elif status == 'at_risk':
        messages.append("Meta em risco! Acelere o ritmo para atingir o objetivo.")
    elif status == 'behind':
        messages.append("Progresso abaixo do esperado. Considere ajustar a estratégia.")
    elif status == 'on_track':
        messages.append("Ótimo progresso! Continue no ritmo atual.")
    elif status == 'completed':
        messages.append("Parabéns! Meta atingida!")
    
    insights['messages'] = messages
    
    return insights
