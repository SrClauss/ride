"""
Script de migração para alinhar categorias de metas com o frontend
"""
import sqlite3
import sys
from pathlib import Path

# Adicionar diretório do backend ao path
backend_dir = Path(__file__).parent.parent
sys.path.append(str(backend_dir))

def migrate_goal_categories():
    """Migra categorias de metas para alinhamento com frontend"""
    
    # Mapeamento de categorias antigas para novas
    category_mapping = {
        'emergencia': 'emergency',
        'investimento': 'investment', 
        'lazer': 'purchase',  # Mapeamento aproximado
        'educacao': 'education',
        'saude': 'health',
        'transporte': 'travel',  # Mapeamento aproximado
        'alimentacao': 'other',
        'moradia': 'other',
        'dividas': 'other',
        'outros': 'other'
    }
    
    # Conectar ao banco
    db_path = backend_dir / "rider_finance.db"
    if not db_path.exists():
        print(f"❌ Banco de dados não encontrado: {db_path}")
        return False
    
    try:
        conn = sqlite3.connect(str(db_path))
        cursor = conn.cursor()
        
        print("🔄 Iniciando migração das categorias de metas...")
        
        # Verificar se existem metas
        cursor.execute("SELECT COUNT(*) FROM metas")
        total_metas = cursor.fetchone()[0]
        print(f"📊 Total de metas encontradas: {total_metas}")
        
        if total_metas == 0:
            print("✅ Nenhuma meta para migrar")
            return True
        
        # Migrar cada categoria
        updates_count = 0
        for old_category, new_category in category_mapping.items():
            cursor.execute("""
                UPDATE metas 
                SET categoria = ? 
                WHERE categoria = ?
            """, (new_category, old_category))
            
            rows_updated = cursor.rowcount
            if rows_updated > 0:
                print(f"✅ Migrado {rows_updated} metas de '{old_category}' para '{new_category}'")
                updates_count += rows_updated
        
        # Commit das alterações
        conn.commit()
        print(f"🎉 Migração concluída! {updates_count} metas atualizadas")
        
        # Verificar categorias finais
        cursor.execute("SELECT categoria, COUNT(*) FROM metas GROUP BY categoria")
        categories_final = cursor.fetchall()
        print("\n📋 Distribuição final das categorias:")
        for cat, count in categories_final:
            print(f"  - {cat}: {count} metas")
        
        return True
        
    except Exception as e:
        print(f"❌ Erro durante migração: {e}")
        return False
    finally:
        if 'conn' in locals():
            conn.close()

if __name__ == "__main__":
    print("🚀 Iniciando migração de categorias de metas...")
    success = migrate_goal_categories()
    
    if success:
        print("\n✅ Migração realizada com sucesso!")
        print("🔧 As categorias de metas agora estão alinhadas com o frontend")
    else:
        print("\n❌ Falha na migração")
        sys.exit(1)
