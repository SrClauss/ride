use async_trait::async_trait;
use uuid::Uuid;
use serde::{Deserialize, Serialize};
use std::error::Error;

/// Trait que define operações CRUD básicas para todas as entidades
/// 
/// Esta trait garante que todas as entidades implementem operações
/// consistentes de Create, Read, Update e Delete
#[async_trait]
pub trait ICrudable<T, CreateInput, UpdateInput>
where
    T: Clone + Send + Sync + Serialize + for<'de> Deserialize<'de>,
    CreateInput: Send + Sync,
    UpdateInput: Send + Sync,
{
    type Error: Error + Send + Sync;

    /// Criar uma nova entidade
    async fn create(input: CreateInput) -> Result<T, Self::Error>;

    /// Buscar entidade por ID
    async fn find_by_id(id: Uuid) -> Result<Option<T>, Self::Error>;

    /// Atualizar entidade existente
    async fn update(id: Uuid, input: UpdateInput) -> Result<T, Self::Error>;

    /// Deletar entidade por ID
    async fn delete(id: Uuid) -> Result<bool, Self::Error>;

    /// Verificar se entidade existe
    async fn exists(id: Uuid) -> Result<bool, Self::Error> {
        match Self::find_by_id(id).await {
            Ok(Some(_)) => Ok(true),
            Ok(None) => Ok(false),
            Err(e) => Err(e),
        }
    }

    /// Obter ID da entidade (para entities que implementam esta trait)
    fn get_id(&self) -> Uuid;

    /// Verificar se a entidade é válida antes de persistir
    fn validate(&self) -> Result<(), Self::Error>;
}
