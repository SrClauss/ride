use async_trait::async_trait;
use uuid::Uuid;
use serde::{Deserialize, Serialize};
use std::error::Error;

/// Trait que define operações CRUD básicas para todas as entidades
/// 
/// Esta trait fornece implementações automáticas para operações CRUD baseadas
/// em métodos fundamentais que devem ser implementados por cada entidade.
/// 
/// Métodos que DEVEM ser implementados:
/// - `db_insert`: Inserir no banco
/// - `db_select_by_id`: Buscar por ID no banco  
/// - `db_update`: Atualizar no banco
/// - `db_delete`: Deletar do banco
/// - `get_id`: Obter ID da entidade
/// - `validate`: Validar entidade
/// - `from_create_input`: Converter input de criação para entidade
/// - `apply_update_input`: Aplicar input de atualização à entidade
#[async_trait]
pub trait ICrudable<CreateInput, UpdateInput>: Clone + Send + Sync + Serialize + for<'de> Deserialize<'de>
where
    CreateInput: Send + Sync + 'static,
    UpdateInput: Send + Sync + 'static,
{
    type Error: Error + Send + Sync;

    // ========== MÉTODOS ABSTRATOS (devem ser implementados) ==========
    
    /// Inserir entidade no banco de dados
    async fn db_insert(&self) -> Result<Self, Self::Error>;
    
    /// Buscar entidade por ID no banco de dados
    async fn db_select_by_id(id: Uuid) -> Result<Option<Self>, Self::Error>;
    
    /// Atualizar entidade no banco de dados
    async fn db_update(&self) -> Result<Self, Self::Error>;
    
    /// Deletar entidade por ID do banco de dados
    async fn db_delete(id: Uuid) -> Result<bool, Self::Error>;
    
    /// Obter ID da entidade
    fn get_id(&self) -> Uuid;
    
    /// Validar entidade antes de persistir
    fn validate(&self) -> Result<(), Self::Error>;
    
    /// Converter input de criação para entidade
    fn from_create_input(input: CreateInput) -> Result<Self, Self::Error>;
    
    /// Aplicar input de atualização à entidade existente
    fn apply_update_input(&mut self, input: UpdateInput) -> Result<(), Self::Error>;

    /// Criar erro para entidade não encontrada
    fn entity_not_found_error(id: Uuid) -> Self::Error;

    // ========== MÉTODOS AUTO-IMPLEMENTADOS ==========

    /// Criar uma nova entidade
    async fn create(input: CreateInput) -> Result<Self, Self::Error> {
        let entity = Self::from_create_input(input)?;
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
        if Self::exists(id).await? {
            self.db_update().await
        } else {
            self.db_insert().await
        }
    }
}
