from sqlalchemy import Column, String, Integer, Float, Boolean, DateTime, Text, ForeignKey
from sqlalchemy.orm import declarative_base, relationship, validates
from sqlalchemy.sql import func
from datetime import datetime, timezone
import uuid
import re
import json

Base = declarative_base()

def generate_ulid():
    """Função para gerar UUID como string."""
    return str(uuid.uuid4())

class Usuario(Base):
    """Modelo de usuário com validações embutidas"""
    __tablename__ = "usuarios"
    
    id = Column(String, primary_key=True, default=generate_ulid)
    nome_usuario = Column(String(50), unique=True, nullable=False, index=True)
    email = Column(String(255), unique=True, nullable=False, index=True)
    senha = Column(String(255), nullable=False)
    nome_completo = Column(String(100))
    telefone = Column(String(20))
    
    # Campos de pagamento
    eh_pago = Column(Boolean, default=False)
    id_pagamento = Column(String(100))
    metodo_pagamento = Column(String(50))
    status_pagamento = Column(String(50), default="pendente")
    tipo_assinatura = Column(String(50), default="mensal")
    trial_termina_em = Column(DateTime)
    
    # Timestamps
    criado_em = Column(DateTime, default=lambda: datetime.now(timezone.utc))
    atualizado_em = Column(DateTime, default=lambda: datetime.now(timezone.utc), onupdate=lambda: datetime.now(timezone.utc))
    
    # Relacionamentos
    categorias = relationship("Categoria", back_populates="usuario", cascade="all, delete-orphan")
    transacoes = relationship("Transacao", back_populates="usuario", cascade="all, delete-orphan")
    sessoes_trabalho = relationship("SessaoTrabalho", back_populates="usuario", cascade="all, delete-orphan")
    metas = relationship("Meta", back_populates="usuario", cascade="all, delete-orphan")
    configuracoes = relationship("Configuracao", back_populates="usuario", cascade="all, delete-orphan")
    assinaturas = relationship("Assinatura", back_populates="usuario", cascade="all, delete-orphan")
    
    @validates('email')
    def validar_email(self, key, email):
        if not email or '@' not in email:
            raise ValueError("Email inválido")
        if len(email) > 255:
            raise ValueError("Email muito longo")
        return email.lower().strip()
    
    @validates('nome_usuario')
    def validar_nome_usuario(self, key, nome_usuario):
        if not nome_usuario or len(nome_usuario) < 3:
            raise ValueError("Nome de usuário deve ter pelo menos 3 caracteres")
        if len(nome_usuario) > 50:
            raise ValueError("Nome de usuário muito longo")
        if not re.match(r'^[a-zA-Z0-9_]+$', nome_usuario):
            raise ValueError("Nome de usuário deve conter apenas letras, números e underscore")
        return nome_usuario.lower().strip()
    
    @validates('telefone')
    def validar_telefone(self, key, telefone):
        if telefone and len(telefone) > 20:
            raise ValueError("Telefone muito longo")
        return telefone
    
    def para_dict(self):
        return {
            'id': self.id,
            'nome_usuario': self.nome_usuario,
            'email': self.email,
            'nome_completo': self.nome_completo,
            'telefone': self.telefone,
            'eh_pago': self.eh_pago,
            'status_pagamento': self.status_pagamento,
            'tipo_assinatura': self.tipo_assinatura,
            'trial_termina_em': self.trial_termina_em.isoformat() if self.trial_termina_em else None,
            'criado_em': self.criado_em.isoformat() if self.criado_em else None
        }


class Categoria(Base):
    """Modelo de categoria com validações embutidas"""
    __tablename__ = "categorias"
    
    id = Column(String, primary_key=True, default=generate_ulid)
    id_usuario = Column(String, ForeignKey("usuarios.id"), nullable=True)  # Null para categorias padrão
    nome = Column(String(100), nullable=False)
    tipo = Column(String(20), nullable=False)  # 'receita' ou 'despesa'
    icone = Column(String(100))  # Font Awesome class
    cor = Column(String(7))   # Hex color
    eh_padrao = Column(Boolean, default=False)
    eh_ativa = Column(Boolean, default=True)
    
    # Timestamps
    criado_em = Column(DateTime, default=lambda: datetime.now(timezone.utc))
    atualizado_em = Column(DateTime, default=lambda: datetime.now(timezone.utc), onupdate=lambda: datetime.now(timezone.utc))
    
    # Relacionamentos
    usuario = relationship("Usuario", back_populates="categorias")
    transacoes = relationship("Transacao", back_populates="categoria")
    
    @validates('nome')
    def validar_nome(self, key, nome):
        if not nome or len(nome.strip()) < 2:
            raise ValueError("Nome da categoria deve ter pelo menos 2 caracteres")
        if len(nome) > 100:
            raise ValueError("Nome da categoria muito longo")
        return nome.strip()
    
    @validates('tipo')
    def validar_tipo(self, key, tipo_valor):
        if tipo_valor not in ['receita', 'despesa']:
            raise ValueError("Tipo deve ser 'receita' ou 'despesa'")
        return tipo_valor
    
    @validates('cor')
    def validar_cor(self, key, cor):
        if cor and not re.match(r'^#[0-9A-Fa-f]{6}$', cor):
            raise ValueError("Cor deve estar no formato hexadecimal (#RRGGBB)")
        return cor
    
    def para_dict(self):
        return {
            'id': self.id,
            'id_usuario': self.id_usuario,
            'nome': self.nome,
            'tipo': self.tipo,
            'icone': self.icone,
            'cor': self.cor,
            'eh_padrao': self.eh_padrao,
            'eh_ativa': self.eh_ativa,
            'criado_em': self.criado_em.isoformat() if self.criado_em else None
        }


class Transacao(Base):
    """Modelo de transação com validações embutidas"""
    __tablename__ = "transacoes"
    
    id = Column(String, primary_key=True, default=generate_ulid)
    id_usuario = Column(String, ForeignKey("usuarios.id"), nullable=False)
    id_categoria = Column(String, ForeignKey("categorias.id"), nullable=False)
    
    valor = Column(Float, nullable=False)
    descricao = Column(Text)
    tipo = Column(String(20), nullable=False)  # 'receita' ou 'despesa'
    data = Column(DateTime, nullable=False, default=lambda: datetime.now(timezone.utc))
    
    # Campos para importação/integração
    origem = Column(String(50))  # 'uber', '99', 'indrive', 'manual', etc
    id_externo = Column(String(100))  # ID da transação na plataforma externa
    plataforma = Column(String(50))  # Plataforma de origem
    
    # Metadados
    observacoes = Column(Text)
    tags = Column(String(500))  # JSON array ou string separada por vírgulas
    
    # Timestamps
    criado_em = Column(DateTime, default=lambda: datetime.now(timezone.utc))
    atualizado_em = Column(DateTime, default=lambda: datetime.now(timezone.utc), onupdate=lambda: datetime.now(timezone.utc))
    
    # Relacionamentos
    usuario = relationship("Usuario", back_populates="transacoes")
    categoria = relationship("Categoria", back_populates="transacoes")
    
    @validates('valor')
    def validar_valor(self, key, valor):
        if valor is None or valor <= 0:
            raise ValueError("Valor deve ser maior que zero")
        if valor > 999999.99:
            raise ValueError("Valor muito alto")
        return round(float(valor), 2)
    
    @validates('tipo')
    def validar_tipo(self, key, tipo_valor):
        if tipo_valor not in ['receita', 'despesa']:
            raise ValueError("Tipo deve ser 'receita' ou 'despesa'")
        return tipo_valor
    
    @validates('descricao')
    def validar_descricao(self, key, descricao):
        if descricao and len(descricao) > 1000:
            raise ValueError("Descrição muito longa")
        return descricao.strip() if descricao else None
    
    def para_dict(self):
        return {
            'id': self.id,
            'id_usuario': self.id_usuario,
            'id_categoria': self.id_categoria,
            'valor': self.valor,
            'descricao': self.descricao,
            'tipo': self.tipo,
            'data': self.data.isoformat() if self.data else None,
            'origem': self.origem,
            'id_externo': self.id_externo,
            'plataforma': self.plataforma,
            'observacoes': self.observacoes,
            'tags': self.tags,
            'criado_em': self.criado_em.isoformat() if self.criado_em else None,
            'nome_categoria': self.categoria.nome if self.categoria else None
        }


class SessaoTrabalho(Base):
    """Modelo de sessão de trabalho com validações embutidas"""
    __tablename__ = "sessoes_trabalho"
    
    id = Column(String, primary_key=True, default=generate_ulid)
    id_usuario = Column(String, ForeignKey("usuarios.id"), nullable=False)
    
    inicio = Column(DateTime, nullable=False)
    fim = Column(DateTime)
    total_minutos = Column(Integer)
    
    # Localização
    local_inicio = Column(String(200))
    local_fim = Column(String(200))
    
    # Estatísticas da sessão
    total_corridas = Column(Integer, default=0)
    total_ganhos = Column(Float, default=0.0)
    total_gastos = Column(Float, default=0.0)
    
    # Metadados
    plataforma = Column(String(50))  # Plataforma principal usada
    observacoes = Column(Text)
    clima = Column(String(100))
    
    # Status
    eh_ativa = Column(Boolean, default=False)
    
    # Timestamps
    criado_em = Column(DateTime, default=lambda: datetime.now(timezone.utc))
    atualizado_em = Column(DateTime, default=lambda: datetime.now(timezone.utc), onupdate=lambda: datetime.now(timezone.utc))
    
    # Relacionamentos
    usuario = relationship("Usuario", back_populates="sessoes_trabalho")
    
    @validates('inicio')
    def validar_inicio(self, key, inicio):
        if not inicio:
            raise ValueError("Hora de início é obrigatória")
        return inicio
    
    @validates('fim')
    def validar_fim(self, key, fim):
        if fim and self.inicio and fim <= self.inicio:
            raise ValueError("Hora de fim deve ser posterior à hora de início")
        return fim
    
    @validates('total_minutos')
    def validar_total_minutos(self, key, total_minutos):
        if total_minutos is not None and total_minutos < 0:
            raise ValueError("Total de minutos não pode ser negativo")
        return total_minutos
    
    def calcular_duracao(self):
        """Calcula duração automaticamente"""
        if self.inicio and self.fim:
            delta = self.fim - self.inicio
            self.total_minutos = int(delta.total_seconds() / 60)
        return self.total_minutos
    
    def para_dict(self):
        return {
            'id': self.id,
            'id_usuario': self.id_usuario,
            'inicio': self.inicio.isoformat() if self.inicio else None,
            'fim': self.fim.isoformat() if self.fim else None,
            'total_minutos': self.total_minutos,
            'local_inicio': self.local_inicio,
            'local_fim': self.local_fim,
            'total_corridas': self.total_corridas,
            'total_ganhos': self.total_ganhos,
            'total_gastos': self.total_gastos,
            'plataforma': self.plataforma,
            'observacoes': self.observacoes,
            'eh_ativa': self.eh_ativa,
            'criado_em': self.criado_em.isoformat() if self.criado_em else None
        }


class Meta(Base):
    """Modelo de meta/objetivo com validações embutidas"""
    __tablename__ = "metas"
    
    id = Column(String, primary_key=True, default=generate_ulid)
    id_usuario = Column(String, ForeignKey("usuarios.id"), nullable=False)
    
    titulo = Column(String(200), nullable=False)
    descricao = Column(Text)
    tipo = Column(String(50), nullable=False)  # 'diaria', 'semanal', 'mensal', 'anual'
    categoria = Column(String(50), nullable=False)  # 'receita', 'corridas', 'horas', 'eficiencia'
    
    # Valores da meta
    valor_alvo = Column(Float, nullable=False)
    valor_atual = Column(Float, default=0.0)
    unidade = Column(String(20))  # 'BRL', 'corridas', 'horas', etc
    
    # Período da meta
    data_inicio = Column(DateTime, nullable=False)
    data_fim = Column(DateTime)
    
    # Status
    eh_ativa = Column(Boolean, default=True)
    eh_concluida = Column(Boolean, default=False)
    concluida_em = Column(DateTime)
    
    # Configurações
    lembrete_ativo = Column(Boolean, default=False)
    frequencia_lembrete = Column(String(50))  # 'diario', 'semanal'
    
    # Timestamps
    criado_em = Column(DateTime, default=lambda: datetime.now(timezone.utc))
    atualizado_em = Column(DateTime, default=lambda: datetime.now(timezone.utc), onupdate=lambda: datetime.now(timezone.utc))
    
    # Relacionamentos
    usuario = relationship("Usuario", back_populates="metas")
    
    @validates('titulo')
    def validar_titulo(self, key, titulo):
        if not titulo or len(titulo.strip()) < 3:
            raise ValueError("Título deve ter pelo menos 3 caracteres")
        if len(titulo) > 200:
            raise ValueError("Título muito longo")
        return titulo.strip()
    
    @validates('tipo')
    def validar_tipo(self, key, tipo_valor):
        tipos_validos = ['diaria', 'semanal', 'mensal', 'anual']
        if tipo_valor not in tipos_validos:
            raise ValueError(f"Tipo deve ser um de: {', '.join(tipos_validos)}")
        return tipo_valor
    
    @validates('categoria')
    def validar_categoria(self, key, categoria):
        categorias_validas = ['receita', 'corridas', 'horas', 'eficiencia', 'despesas']
        if categoria not in categorias_validas:
            raise ValueError(f"Categoria deve ser uma de: {', '.join(categorias_validas)}")
        return categoria
    
    @validates('valor_alvo')
    def validar_valor_alvo(self, key, valor_alvo):
        if valor_alvo is None or valor_alvo <= 0:
            raise ValueError("Valor da meta deve ser maior que zero")
        return float(valor_alvo)
    
    def calcular_porcentagem_progresso(self):
        """Calcula porcentagem de progresso"""
        if self.valor_alvo <= 0:
            return 0
        return (self.valor_atual / self.valor_alvo) * 100
    
    @property
    def progresso_percentual(self):
        """Propriedade para acessar o progresso percentual"""
        return self.calcular_porcentagem_progresso()
    
    def marcar_concluida(self):
        """Marca meta como completada"""
        self.eh_concluida = True
        self.concluida_em = datetime.now(timezone.utc)
    
    def para_dict(self):
        return {
            'id': self.id,
            'id_usuario': self.id_usuario,
            'titulo': self.titulo,
            'descricao': self.descricao,
            'tipo': self.tipo,
            'categoria': self.categoria,
            'valor_alvo': self.valor_alvo,
            'valor_atual': self.valor_atual,
            'unidade': self.unidade,
            'data_inicio': self.data_inicio.isoformat() if self.data_inicio else None,
            'data_fim': self.data_fim.isoformat() if self.data_fim else None,
            'eh_ativa': self.eh_ativa,
            'eh_concluida': self.eh_concluida,
            'concluida_em': self.concluida_em.isoformat() if self.concluida_em else None,
            'porcentagem_progresso': self.calcular_porcentagem_progresso(),
            'lembrete_ativo': self.lembrete_ativo,
            'criado_em': self.criado_em.isoformat() if self.criado_em else None
        }


class Configuracao(Base):
    """Modelo de configurações com validações embutidas"""
    __tablename__ = "configuracoes"
    
    id = Column(String, primary_key=True, default=generate_ulid)
    id_usuario = Column(String, ForeignKey("usuarios.id"), nullable=False)
    
    chave = Column(String(100), nullable=False)
    valor = Column(Text)
    categoria = Column(String(50))  # 'notificacao', 'aparencia', 'privacidade', etc
    
    # Metadados
    descricao = Column(String(500))
    tipo_dado = Column(String(20))  # 'string', 'boolean', 'number', 'json'
    eh_publica = Column(Boolean, default=False)
    
    # Timestamps
    criado_em = Column(DateTime, default=lambda: datetime.now(timezone.utc))
    atualizado_em = Column(DateTime, default=lambda: datetime.now(timezone.utc), onupdate=lambda: datetime.now(timezone.utc))
    
    # Relacionamentos
    usuario = relationship("Usuario", back_populates="configuracoes")
    
    @validates('chave')
    def validar_chave(self, key, valor_chave):
        if not valor_chave or len(valor_chave.strip()) < 2:
            raise ValueError("Chave deve ter pelo menos 2 caracteres")
        if len(valor_chave) > 100:
            raise ValueError("Chave muito longa")
        return valor_chave.strip().lower()
    
    @validates('tipo_dado')
    def validar_tipo_dado(self, key, tipo_dado):
        tipos_validos = ['string', 'boolean', 'number', 'json']
        if tipo_dado and tipo_dado not in tipos_validos:
            raise ValueError(f"Tipo de dado deve ser um de: {', '.join(tipos_validos)}")
        return tipo_dado
    
    def obter_valor_tipado(self):
        """Retorna valor convertido para o tipo correto"""
        if not self.valor:
            return None
            
        if self.tipo_dado == 'boolean':
            return self.valor.lower() in ['true', '1', 'yes', 'sim']
        elif self.tipo_dado == 'number':
            try:
                return float(self.valor) if '.' in self.valor else int(self.valor)
            except ValueError:
                return 0
        elif self.tipo_dado == 'json':
            try:
                import json
                return json.loads(self.valor)
            except json.JSONDecodeError:
                return {}
        else:
            return self.valor
    
    def para_dict(self):
        return {
            'id': self.id,
            'id_usuario': self.id_usuario,
            'chave': self.chave,
            'valor': self.valor,
            'valor_tipado': self.obter_valor_tipado(),
            'categoria': self.categoria,
            'descricao': self.descricao,
            'tipo_dado': self.tipo_dado,
            'eh_publica': self.eh_publica,
            'criado_em': self.criado_em.isoformat() if self.criado_em else None
        }


# Dados padrão para categorias
CATEGORIAS_PADRAO = [
    # Categorias de receita
    {"nome": "Uber", "tipo": "receita", "icone": "fab fa-uber", "cor": "#000000"},
    {"nome": "99", "tipo": "receita", "icone": "fas fa-taxi", "cor": "#FFD700"},
    {"nome": "inDrive", "tipo": "receita", "icone": "fas fa-car", "cor": "#00BFFF"},
    {"nome": "Particular", "tipo": "receita", "icone": "fas fa-user", "cor": "#32CD32"},
    {"nome": "Aluguel", "tipo": "receita", "icone": "fas fa-home", "cor": "#FF6347"},
    {"nome": "Outros", "tipo": "receita", "icone": "fas fa-plus-circle", "cor": "#9370DB"},
    
    # Categorias de despesa
    {"nome": "Combustível", "tipo": "despesa", "icone": "fas fa-gas-pump", "cor": "#FF4500"},
    {"nome": "Manutenção", "tipo": "despesa", "icone": "fas fa-wrench", "cor": "#808080"},
    {"nome": "Alimentação", "tipo": "despesa", "icone": "fas fa-utensils", "cor": "#FFA500"},
    {"nome": "Lazer", "tipo": "despesa", "icone": "fas fa-gamepad", "cor": "#FF69B4"},
    {"nome": "Seguro", "tipo": "despesa", "icone": "fas fa-shield-alt", "cor": "#4169E1"},
    {"nome": "Outros", "tipo": "despesa", "icone": "fas fa-minus-circle", "cor": "#DC143C"},
]

# Configurações padrão para usuários
CONFIGURACOES_PADRAO_USUARIO = [
    {"chave": "notificacoes_ativas", "valor": "true", "categoria": "notificacao", "tipo_dado": "boolean"},
    {"chave": "alertas_sonoros", "valor": "true", "categoria": "notificacao", "tipo_dado": "boolean"},
    {"chave": "relatorios_email", "valor": "false", "categoria": "notificacao", "tipo_dado": "boolean"},
    {"chave": "tema", "valor": "claro", "categoria": "aparencia", "tipo_dado": "string"},
    {"chave": "moeda", "valor": "BRL", "categoria": "localizacao", "tipo_dado": "string"},
    {"chave": "fuso_horario", "valor": "America/Sao_Paulo", "categoria": "localizacao", "tipo_dado": "string"},
    {"chave": "backup_automatico", "valor": "true", "categoria": "dados", "tipo_dado": "boolean"},
    {"chave": "lembrete_sessao", "valor": "60", "categoria": "trabalho", "tipo_dado": "number"},  # minutos
]

class Assinatura(Base):
    """Modelo de assinatura do usuário"""
    __tablename__ = "assinaturas"
    
    id = Column(String, primary_key=True, default=generate_ulid)
    id_usuario = Column(String, ForeignKey('usuarios.id'), nullable=False)
    
    # Dados do plano
    tipo_plano = Column(String(20), nullable=False)  # basic, pro, premium
    status = Column(String(20), nullable=False, default='ACTIVE')  # ACTIVE, INACTIVE, EXPIRED
    
    # Integração Asaas
    asaas_customer_id = Column(String(100), nullable=False)
    asaas_subscription_id = Column(String(100), nullable=True)
    
    # Período da assinatura
    periodo_inicio = Column(DateTime, nullable=False, default=func.now())
    periodo_fim = Column(DateTime, nullable=False)
    
    # Controle
    cancelada_em = Column(DateTime, nullable=True)
    criado_em = Column(DateTime, default=func.now())
    atualizado_em = Column(DateTime, default=func.now(), onupdate=func.now())
    
    # Relacionamentos
    usuario = relationship("Usuario", back_populates="assinaturas")
    
    @validates('tipo_plano')
    def validate_tipo_plano(self, key, value):
        """Validar tipo do plano"""
        tipos_validos = ['basic', 'pro', 'premium']
        if value not in tipos_validos:
            raise ValueError(f"Tipo de plano deve ser um de: {tipos_validos}")
        return value
    
    @validates('status')
    def validate_status(self, key, value):
        """Validar status da assinatura"""
        status_validos = ['ACTIVE', 'INACTIVE', 'EXPIRED']
        if value not in status_validos:
            raise ValueError(f"Status deve ser um de: {status_validos}")
        return value
    
    @property
    def is_active(self) -> bool:
        """Verificar se assinatura está ativa"""
        return (
            self.status == 'ACTIVE' and 
            self.periodo_fim > datetime.now(timezone.utc)
        )
    
    @property
    def days_remaining(self) -> int:
        """Dias restantes da assinatura"""
        if not self.is_active:
            return 0
        delta = self.periodo_fim - datetime.now(timezone.utc)
        return max(0, delta.days)
    
    def __repr__(self):
        return f"<Assinatura(id={self.id}, usuario={self.id_usuario}, plano={self.tipo_plano}, status={self.status})>"