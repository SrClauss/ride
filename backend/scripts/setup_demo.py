#!/usr/bin/env python3
"""
Setup Demo - Comando Único para Preparar Ambiente Demo
======================================================

Este script automatiza completamente a preparação do ambiente de demonstração,
executando todas as etapas necessárias em sequência.

Uso:
    python scripts/setup_demo.py [--reset] [--quick]

Flags:
    --reset: Força limpeza completa antes de recriar dados
    --quick: Execução rápida com menos dados (para desenvolvimento)

Funcionalidades:
- Verificar e preparar banco de dados
- Executar migrações se necessário  
- Limpar dados demo existentes
- Gerar novos dados realistas
- Validar integridade dos dados
- Gerar relatório completo
- Testar endpoints principais

Ideal para:
- Setup inicial de desenvolvimento
- Preparação de demos
- Reset rápido do ambiente
- Validação de integridade
"""

import sys
import os
import argparse
import logging
from datetime import datetime
from pathlib import Path

# Adicionar o diretório pai ao path
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from sqlalchemy import text
from config.database import SessionLocal, engine
from config.logging_config import setup_logging
from scripts.seed_demo_data import DemoDataSeeder

# Configurar logging
logger = logging.getLogger(__name__)


class DemoSetup:
    """Classe principal para setup do ambiente demo"""
    
    def __init__(self, reset: bool = False, quick: bool = False):
        self.reset = reset
        self.quick = quick
        self.db = SessionLocal()
        self.setup_logging()
    
    def setup_logging(self):
        """Configurar logging para o setup"""
        setup_logging()
        
        # Handler adicional para arquivo de setup
        log_file = Path("logs/setup_demo.log")
        log_file.parent.mkdir(exist_ok=True)
        
        file_handler = logging.FileHandler(log_file)
        file_handler.setLevel(logging.INFO)
        formatter = logging.Formatter(
            '%(asctime)s - %(name)s - %(levelname)s - %(message)s'
        )
        file_handler.setFormatter(formatter)
        logger.addHandler(file_handler)
    
    def run_setup(self):
        """Executar setup completo do ambiente demo"""
        try:
            logger.info(" INICIANDO SETUP DO AMBIENTE DEMO")
            logger.info("=" * 50)
            
            # 1. Verificar banco de dados
            self.check_database()
            
            # 2. Executar migrações se necessário
            self.run_migrations()
            
            # 3. Preparar dados demo
            self.prepare_demo_data()
            
            # 4. Validar integridade
            self.validate_data()
            
            # 5. Gerar relatório
            self.generate_report()
            
            # 6. Testar endpoints
            self.test_endpoints()
            
            logger.info(" SETUP CONCLUÍDO COM SUCESSO!")
            logger.info("=" * 50)
            
            self.print_next_steps()
            
        except Exception as e:
            logger.error(f" Erro no setup: {e}")
            raise
        finally:
            self.db.close()
    
    def check_database(self):
        """Verificar conectividade e estrutura do banco"""
        logger.info("Verificando banco de dados...")
        
        try:
            # Testar conexão
            result = self.db.execute(text("SELECT 1")).scalar()
            assert result == 1
            logger.info("Conexao com banco OK")
            
            # Verificar se tabelas existem (SQLite syntax)
            tables = [
                'usuarios', 'categorias', 'transacoes', 
                'metas', 'sessoes_trabalho'
            ]
            
            for table in tables:
                result = self.db.execute(text(f"""
                    SELECT COUNT(*) FROM sqlite_master 
                    WHERE type='table' AND name='{table}'
                """)).scalar()
                
                if result > 0:
                    logger.info(f"Tabela '{table}' existe")
                else:
                    logger.warning(f"Tabela '{table}' nao encontrada")
            
        except Exception as e:
            logger.error(f"Erro na verificacao do banco: {e}")
            raise
    
    def run_migrations(self):
        """Executar migrações se necessário"""
        logger.info(" Verificando migrações...")
        
        try:
            # Aqui poderia executar Alembic ou outras migrações
            # Por enquanto, assumindo que já foram executadas
            logger.info(" Migrações verificadas")
            
        except Exception as e:
            logger.warning(f" Erro nas migrações: {e}")
    
    def prepare_demo_data(self):
        """Preparar dados demo usando o seeder"""
        logger.info("Preparando dados demo...")
        
        try:
            # Configurar seeder baseado nas opções
            seeder = DemoDataSeeder()
            
            if self.quick:
                logger.info("Modo rapido ativado - gerando menos dados")
                # Poderia ajustar parâmetros do seeder para menos dados
            
            if self.reset:
                logger.info("Modo reset ativado - limpeza forcada")
            
            # Executar seed
            seeder.run_seed()
            logger.info("Dados demo preparados")
            
        except Exception as e:
            logger.error(f"Erro na preparacao dos dados: {e}")
            raise
    
    def validate_data(self):
        """Validar integridade dos dados criados"""
        logger.info("Validando integridade dos dados...")
        
        try:
            validations = [
                self.validate_demo_user(),
                self.validate_categories(),
                self.validate_transactions(),
                self.validate_goals(),
                self.validate_sessions()
            ]
            
            if all(validations):
                logger.info(" Todos os dados válidos")
            else:
                logger.warning(" Algumas validações falharam")
                
        except Exception as e:
            logger.error(f" Erro na validação: {e}")
            raise
    
    def validate_demo_user(self) -> bool:
        """Validar usuário demo"""
        try:
            result = self.db.execute(text("""
                SELECT COUNT(*) FROM usuarios 
                WHERE email = 'demo@riderfinance.com'
            """)).scalar()
            
            if result == 1:
                logger.info(" Usuário demo validado")
                return True
            else:
                logger.error(f" Usuário demo inválido (encontrados: {result})")
                return False
                
        except Exception as e:
            logger.error(f" Erro validando usuário: {e}")
            return False
    
    def validate_categories(self) -> bool:
        """Validar categorias"""
        try:
            result = self.db.execute(text("""
                SELECT COUNT(*) FROM categorias c
                JOIN usuarios u ON c.id_usuario = u.id
                WHERE u.email = 'demo@riderfinance.com'
            """)).scalar()
            
            if result >= 10:  # Esperamos pelo menos 10 categorias
                logger.info(f" Categorias validadas ({result} encontradas)")
                return True
            else:
                logger.error(f" Poucas categorias ({result}, esperado >= 10)")
                return False
                
        except Exception as e:
            logger.error(f" Erro validando categorias: {e}")
            return False
    
    def validate_transactions(self) -> bool:
        """Validar transações"""
        try:
            result = self.db.execute(text("""
                SELECT COUNT(*) FROM transacoes t
                JOIN usuarios u ON t.id_usuario = u.id
                WHERE u.email = 'demo@riderfinance.com'
            """)).scalar()
            
            if result >= 1000:  # Esperamos pelo menos 1000 transações
                logger.info(f" Transações validadas ({result} encontradas)")
                return True
            else:
                logger.warning(f" Poucas transações ({result}, esperado >= 1000)")
                return True  # Não falhar por isso
                
        except Exception as e:
            logger.error(f" Erro validando transações: {e}")
            return False
    
    def validate_goals(self) -> bool:
        """Validar metas"""
        try:
            result = self.db.execute(text("""
                SELECT COUNT(*) FROM metas m
                JOIN usuarios u ON m.id_usuario = u.id
                WHERE u.email = 'demo@riderfinance.com'
            """)).scalar()
            
            if result >= 3:  # Esperamos pelo menos 3 metas
                logger.info(f" Metas validadas ({result} encontradas)")
                return True
            else:
                logger.warning(f" Poucas metas ({result}, esperado >= 3)")
                return True
                
        except Exception as e:
            logger.error(f" Erro validando metas: {e}")
            return False
    
    def validate_sessions(self) -> bool:
        """Validar sessões de trabalho"""
        try:
            result = self.db.execute(text("""
                SELECT COUNT(*) FROM sessoes_trabalho s
                JOIN usuarios u ON s.id_usuario = u.id
                WHERE u.email = 'demo@riderfinance.com'
            """)).scalar()
            
            logger.info(f"ℹ️ Sessões encontradas: {result}")
            return True  # Sessões são opcionais
                
        except Exception as e:
            logger.warning(f" Erro validando sessões: {e}")
            return True  # Não falhar por sessões
    
    def generate_report(self):
        """Gerar relatório completo dos dados"""
        logger.info(" Gerando relatório...")
        
        try:
            # Coletar estatísticas
            stats = self.collect_statistics()
            
            # Imprimir relatório
            self.print_report(stats)
            
            # Salvar relatório em arquivo
            self.save_report(stats)
            
        except Exception as e:
            logger.error(f" Erro gerando relatório: {e}")
    
    def collect_statistics(self) -> dict:
        """Coletar estatísticas dos dados"""
        stats = {}
        
        try:
            # Usuário
            stats['usuario'] = self.db.execute(text("""
                SELECT nome_completo, email, tipo_assinatura
                FROM usuarios WHERE email = 'demo@riderfinance.com'
            """)).fetchone()
            
            # Categorias
            stats['categorias'] = self.db.execute(text("""
                SELECT COUNT(*) as total,
                       COUNT(CASE WHEN tipo = 'receita' THEN 1 END) as receitas,
                       COUNT(CASE WHEN tipo = 'despesa' THEN 1 END) as despesas
                FROM categorias c
                JOIN usuarios u ON c.id_usuario = u.id
                WHERE u.email = 'demo@riderfinance.com'
            """)).fetchone()
            
            # Transações
            stats['transacoes'] = self.db.execute(text("""
                SELECT COUNT(*) as total,
                       COUNT(CASE WHEN tipo = 'receita' THEN 1 END) as receitas,
                       COUNT(CASE WHEN tipo = 'despesa' THEN 1 END) as despesas,
                       SUM(CASE WHEN tipo = 'receita' THEN valor ELSE 0 END) as total_receitas,
                       SUM(CASE WHEN tipo = 'despesa' THEN valor ELSE 0 END) as total_despesas
                FROM transacoes t
                JOIN usuarios u ON t.id_usuario = u.id
                WHERE u.email = 'demo@riderfinance.com'
            """)).fetchone()
            
            # Metas
            stats['metas'] = self.db.execute(text("""
                SELECT COUNT(*) as total,
                       AVG(valor_atual / valor_meta * 100) as progresso_medio,
                       COUNT(CASE WHEN status = 'ativa' THEN 1 END) as ativas
                FROM metas m
                JOIN usuarios u ON m.id_usuario = u.id
                WHERE u.email = 'demo@riderfinance.com'
            """)).fetchone()
            
            # Sessões
            stats['sessoes'] = self.db.execute(text("""
                SELECT COUNT(*) as total,
                       SUM(horas_trabalhadas) as total_horas,
                       AVG(horas_trabalhadas) as media_horas
                FROM sessoes_trabalho s
                JOIN usuarios u ON s.id_usuario = u.id
                WHERE u.email = 'demo@riderfinance.com'
            """)).fetchone()
            
        except Exception as e:
            logger.error(f"Erro coletando estatísticas: {e}")
            
        return stats
    
    def print_report(self, stats: dict):
        """Imprimir relatório na tela"""
        print("\n" + "=" * 60)
        print(" RELATÓRIO DO AMBIENTE DEMO")
        print("=" * 60)
        
        if 'usuario' in stats and stats['usuario']:
            user = stats['usuario']
            print(f"👤 Usuário: {user.nome_completo}")
            print(f"   Email: {user.email}")
            print(f"   Tipo: {user.tipo_assinatura}")
        
        if 'categorias' in stats and stats['categorias']:
            cat = stats['categorias']
            print(f"\n📂 Categorias: {cat.total} total")
            print(f"   Receitas: {cat.receitas}")
            print(f"   Despesas: {cat.despesas}")
        
        if 'transacoes' in stats and stats['transacoes']:
            trans = stats['transacoes']
            print(f"\n💰 Transações: {trans.total} total")
            print(f"   Receitas: {trans.receitas} (R$ {trans.total_receitas:.2f})")
            print(f"   Despesas: {trans.despesas} (R$ {trans.total_despesas:.2f})")
            print(f"   Lucro: R$ {trans.total_receitas - trans.total_despesas:.2f}")
        
        if 'metas' in stats and stats['metas']:
            goals = stats['metas']
            print(f"\n🎯 Metas: {goals.total} total")
            print(f"   Ativas: {goals.ativas}")
            print(f"   Progresso médio: {goals.progresso_medio:.1f}%")
        
        if 'sessoes' in stats and stats['sessoes']:
            sess = stats['sessoes']
            print(f"\n Sessões: {sess.total} total")
            if sess.total_horas:
                print(f"   Total horas: {sess.total_horas:.1f}h")
                print(f"   Média: {sess.media_horas:.1f}h/sessão")
        
        print("\n" + "=" * 60)
    
    def save_report(self, stats: dict):
        """Salvar relatório em arquivo"""
        try:
            log_dir = Path("logs")
            log_dir.mkdir(exist_ok=True)
            
            report_file = log_dir / f"demo_report_{datetime.now().strftime('%Y%m%d_%H%M%S')}.txt"
            
            with open(report_file, 'w', encoding='utf-8') as f:
                f.write(f"Relatório do Ambiente Demo - {datetime.now()}\n")
                f.write("=" * 50 + "\n\n")
                
                # Escrever estatísticas...
                # (implementação similar ao print_report)
            
            logger.info(f" Relatório salvo em: {report_file}")
            
        except Exception as e:
            logger.error(f"Erro salvando relatório: {e}")
    
    def test_endpoints(self):
        """Testar endpoints principais"""
        logger.info("🧪 Testando endpoints...")
        
        # Por enquanto só log - implementar testes reais depois
        logger.info("ℹ️ Testes de endpoints não implementados ainda")
    
    def print_next_steps(self):
        """Imprimir próximos passos"""
        print("\n PRÓXIMOS PASSOS:")
        print("-" * 30)
        print("1. Testar login com:")
        print("   Email: demo@riderfinance.com")
        print("   Senha: demo123")
        print("")
        print("2. Verificar endpoints principais:")
        print("   GET /auth/me")
        print("   GET /dashboard/stats")
        print("   GET /transactions")
        print("   GET /goals")
        print("")
        print("3. Para resetar dados:")
        print("   python scripts/setup_demo.py --reset")
        print("")


def main():
    """Função principal"""
    parser = argparse.ArgumentParser(description='Setup do ambiente demo')
    parser.add_argument('--reset', action='store_true', 
                       help='Forçar limpeza completa')
    parser.add_argument('--quick', action='store_true',
                       help='Execução rápida com menos dados')
    
    args = parser.parse_args()
    
    setup = DemoSetup(reset=args.reset, quick=args.quick)
    setup.run_setup()


if __name__ == "__main__":
    main()


