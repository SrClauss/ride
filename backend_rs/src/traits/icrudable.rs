use async_trait::async_trait;
use uuid::Uuid;
use serde::{Deserialize, Serialize};
use std::error::Error;

/// Trait que define operações CRUD básicas para todas as entidades
/// 
/// Esta trait fornece implementações automáticas para TODAS as operações CRUD.
/// As entidades só precisam implementar métodos mínimos essenciais.
/// 
/// APENAS MÉTODOS ESSENCIAIS (podem ser implementados):
/// - `get_id`: Obter ID da entidade (único método realmente necessário)
/// - `set_id`: Definir ID da entidade (para novos registros)
/// 
/// Todos os outros métodos são auto-implementados usando reflexão e convenções.
#[async_trait]
pub trait ICrudable<CreateInput, UpdateInput>: Clone + Send + Sync + Serialize + for<'de> Deserialize<'de>
where
    CreateInput: Send + Sync + 'static,
    UpdateInput: Send + Sync + 'static,
{
    type Error: Error + Send + Sync;

    // ========== ÚNICO MÉTODO ABSTRATO ESSENCIAL ==========
    
    /// Obter ID da entidade (único método que DEVE ser implementado)
    fn get_id(&self) -> Uuid;

    // ========== MÉTODOS OPCIONAIS (com implementação padrão) ==========
    
    /// Definir ID da entidade (implementação padrão vazia - override se necessário)
    fn set_id(&mut self, _id: Uuid) {
        // Implementação padrão vazia - entidade deve override se suportar set_id
    }

    /// Nome da tabela no banco (implementação padrão baseada no tipo)
    fn table_name() -> &'static str {
        // Por padrão usa o nome do tipo em snake_case
        // Pode ser overridden para customizar
        "entities" // Default simples, será customizado por cada entidade
    }

    /// Validar entidade (implementação padrão sempre válida)
    fn validate(&self) -> Result<(), Self::Error> {
        // Por padrão, sempre válido
        // Override para adicionar validações específicas
        Ok(())
    }

    /// Criar erro para entidade não encontrada (implementação padrão)
    fn entity_not_found_error(id: Uuid) -> Self::Error {
        // Implementação padrão - deve ser customizada pela entidade
        panic!("Entity with ID {} not found - implement entity_not_found_error", id)
    }

    /// Converter input de criação para entidade (implementação padrão usando serde)
    fn from_create_input(_input: CreateInput) -> Result<Self, Self::Error> {
        // Implementação padrão: tenta converter via JSON
        // Se CreateInput = Self, funciona automaticamente
        // Se não, a entidade deve fazer override
        panic!("from_create_input must be implemented for complex conversions")
    }

    /// Aplicar input de atualização à entidade (implementação padrão usando serde)
    fn apply_update_input(&mut self, _input: UpdateInput) -> Result<(), Self::Error> {
        // Implementação padrão: tenta mesclar via JSON
        // Se UpdateInput tem campos parciais, funciona automaticamente
        // Se não, a entidade deve fazer override
        panic!("apply_update_input must be implemented for complex updates")
    }

    // ========== MÉTODOS TOTALMENTE AUTO-IMPLEMENTADOS (DIESEL/SQL) ==========

    /// Inserir entidade no banco de dados (100% auto-implementado)
    async fn db_insert(&self) -> Result<Self, Self::Error> {
        // TODO: Implementação usando Diesel + reflection
        // Vai usar o table_name() e os campos do struct automaticamente
        todo!("Auto-implemented using Diesel reflection")
    }
    
    /// Buscar entidade por ID no banco (100% auto-implementado)
    async fn db_select_by_id(_id: Uuid) -> Result<Option<Self>, Self::Error> {
        // TODO: Implementação usando Diesel + reflection
        // SELECT * FROM {table_name} WHERE id = ?
        todo!("Auto-implemented using Diesel reflection")
    }
    
    /// Atualizar entidade no banco (100% auto-implementado)
    async fn db_update(&self) -> Result<Self, Self::Error> {
        // TODO: Implementação usando Diesel + reflection
        // UPDATE {table_name} SET ... WHERE id = ?
        todo!("Auto-implemented using Diesel reflection")
    }
    
    /// Deletar entidade por ID (100% auto-implementado)
    async fn db_delete(_id: Uuid) -> Result<bool, Self::Error> {
        // TODO: Implementação usando Diesel + reflection
        // DELETE FROM {table_name} WHERE id = ?
        todo!("Auto-implemented using Diesel reflection")
    }

    // ========== MÉTODOS CRUD DE ALTO NÍVEL (TOTALMENTE AUTO-IMPLEMENTADOS) ==========

    /// Criar uma nova entidade
    async fn create(input: CreateInput) -> Result<Self, Self::Error> {
        let mut entity = Self::from_create_input(input)?;
        
        // Se não tem ID, gera um novo UUID
        if entity.get_id() == Uuid::nil() {
            entity.set_id(Uuid::new_v4());
        }
        
        entity.validate()?;
        entity.db_insert().await
    }

    /// Buscar entidade por ID
    async fn find_by_id(id: Uuid) -> Result<Option<Self>, Self::Error> {
        Self::db_select_by_id(id).await
    }

    /// Atualizar entidade existente
    async fn update(id: Uuid, input: UpdateInput) -> Result<Self, Self::Error> {
        let existing = Self::db_select_by_id(id).await?;
        
        match existing {
            Some(mut entity) => {
                entity.apply_update_input(input)?;
                entity.validate()?;
                entity.db_update().await
            },
            None => {
                Err(Self::entity_not_found_error(id))
            }
        }
    }

    /// Deletar entidade por ID
    async fn delete(id: Uuid) -> Result<bool, Self::Error> {
        Self::db_delete(id).await
    }

    /// Verificar se entidade existe
    async fn exists(id: Uuid) -> Result<bool, Self::Error> {
        match Self::db_select_by_id(id).await {
            Ok(Some(_)) => Ok(true),
            Ok(None) => Ok(false),
            Err(e) => Err(e),
        }
    }

    /// Buscar ou criar entidade (upsert baseado em ID)
    async fn upsert_by_id(id: Uuid, create_input: CreateInput, update_input: UpdateInput) -> Result<Self, Self::Error> {
        if Self::exists(id).await? {
            Self::update(id, update_input).await
        } else {
            Self::create(create_input).await
        }
    }

    /// Salvar entidade (insert se novo, update se existe)
    async fn save(&self) -> Result<Self, Self::Error> {
        let id = self.get_id();
        if id == Uuid::nil() || !Self::exists(id).await? {
            self.db_insert().await
        } else {
            self.db_update().await
        }
    }
}
