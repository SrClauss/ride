use async_trait::async_trait;
use serde::{Deserialize, Serialize};
use std::error::Error;
use std::time::Duration;
use uuid::Uuid;

/// Estratégias de invalidação de cache
#[derive(Debug, Clone, Serialize, Deserialize)]
pub enum CacheInvalidationStrategy {
    /// Invalidação por tempo (TTL)
    TimeToLive(Duration),
    /// Invalidação manual
    Manual,
    /// Invalidação por tags
    Tagged(Vec<String>),
    /// Invalidação em cascata (quando entidades relacionadas mudam)
    Cascade(Vec<String>),
}

/// Configuração de cache para uma entidade
#[derive(Debug, Clone)]
pub struct CacheConfig {
    /// TTL padrão para entidades desta tipo
    pub default_ttl: Duration,
    /// Estratégia de invalidação
    pub invalidation_strategy: CacheInvalidationStrategy,
    /// Prefixo das chaves no cache
    pub key_prefix: String,
    /// Se deve fazer cache de consultas (além de entidades individuais)
    pub cache_queries: bool,
    /// TTL específico para cache de consultas
    pub query_cache_ttl: Duration,
}

impl Default for CacheConfig {
    fn default() -> Self {
        Self {
            default_ttl: Duration::from_secs(300), // 5 minutos
            invalidation_strategy: CacheInvalidationStrategy::TimeToLive(Duration::from_secs(300)),
            key_prefix: "entity".to_string(),
            cache_queries: true,
            query_cache_ttl: Duration::from_secs(60), // 1 minuto para queries
        }
    }
}

/// Trait que define capacidades de cache para entidades
/// 
/// Esta trait permite cache inteligente com diferentes estratégias de invalidação
#[async_trait]
pub trait ICacheable<T>
where
    T: Clone + Send + Sync + Serialize + for<'de> Deserialize<'de>,
{
    type Error: Error + Send + Sync;

    /// Configuração de cache para esta entidade
    fn cache_config() -> CacheConfig;

    /// Gerar chave de cache para uma entidade específica
    fn cache_key(id: Uuid) -> String {
        format!("{}:{}", Self::cache_config().key_prefix, id)
    }

    /// Gerar chave de cache para consultas
    fn query_cache_key(query_hash: &str) -> String {
        format!("{}:query:{}", Self::cache_config().key_prefix, query_hash)
    }

    /// Gerar chave para cache de contagem
    fn count_cache_key(query_hash: &str) -> String {
        format!("{}:count:{}", Self::cache_config().key_prefix, query_hash)
    }

    /// Buscar entidade no cache
    async fn get_from_cache(id: Uuid) -> Result<Option<T>, Self::Error>;

    /// Armazenar entidade no cache
    async fn set_in_cache(id: Uuid, entity: &T) -> Result<(), Self::Error>;

    /// Armazenar entidade no cache com TTL customizado
    async fn set_in_cache_with_ttl(
        id: Uuid,
        entity: &T,
        ttl: Duration,
    ) -> Result<(), Self::Error>;

    /// Remover entidade específica do cache
    async fn invalidate_cache(id: Uuid) -> Result<(), Self::Error>;

    /// Invalidar cache por padrão (ex: todos os usuários)
    async fn invalidate_cache_pattern(pattern: &str) -> Result<(), Self::Error>;

    /// Invalidar cache por tags
    async fn invalidate_cache_by_tags(tags: Vec<String>) -> Result<(), Self::Error>;

    /// Limpar todo o cache desta entidade
    async fn clear_all_cache() -> Result<(), Self::Error>;

    /// Cache de consulta (armazenar resultado de queries)
    async fn get_query_from_cache(query_hash: &str) -> Result<Option<Vec<T>>, Self::Error>;

    /// Armazenar resultado de consulta no cache
    async fn set_query_in_cache(
        query_hash: &str,
        results: &[T],
    ) -> Result<(), Self::Error>;

    /// Cache de contagem
    async fn get_count_from_cache(query_hash: &str) -> Result<Option<u64>, Self::Error>;

    /// Armazenar contagem no cache
    async fn set_count_in_cache(
        query_hash: &str,
        count: u64,
    ) -> Result<(), Self::Error>;

    /// Invalidar cache de queries relacionadas
    async fn invalidate_query_cache() -> Result<(), Self::Error>;

    /// Método utilitário para buscar com cache automático
    async fn find_with_cache(id: Uuid) -> Result<Option<T>, <Self as super::icrudable::ICrudable<T, (), ()>>::Error>
    where
        Self: super::icrudable::ICrudable<T, (), ()>,
    {
        // Tenta buscar no cache primeiro
        if let Ok(Some(cached)) = Self::get_from_cache(id).await {
            return Ok(Some(cached));
        }

        // Se não encontrou no cache, busca no banco
        let entity = Self::find_by_id(id).await?;

        // Se encontrou, armazena no cache
        if let Some(ref entity_data) = entity {
            let _ = Self::set_in_cache(id, entity_data).await;
        }

        Ok(entity)
    }

    /// Atualizar entidade e invalidar cache relacionado
    async fn update_and_invalidate_cache(
        id: Uuid,
        update_fn: impl FnOnce() -> Result<T, <Self as super::icrudable::ICrudable<T, (), ()>>::Error> + Send,
    ) -> Result<T, <Self as super::icrudable::ICrudable<T, (), ()>>::Error>
    where
        Self: super::icrudable::ICrudable<T, (), ()>,
    {
        // Executa a atualização
        let updated_entity = update_fn()?;

        // Invalida o cache da entidade específica
        let _ = Self::invalidate_cache(id).await;

        // Invalida cache de queries relacionadas
        let _ = Self::invalidate_query_cache().await;

        // Armazena a versão atualizada no cache
        let _ = Self::set_in_cache(id, &updated_entity).await;

        Ok(updated_entity)
    }

    /// Gerar hash para query (usado como chave de cache)
    fn generate_query_hash(query_data: &str) -> String {
        use std::collections::hash_map::DefaultHasher;
        use std::hash::{Hash, Hasher};

        let mut hasher = DefaultHasher::new();
        query_data.hash(&mut hasher);
        format!("{:x}", hasher.finish())
    }
}
