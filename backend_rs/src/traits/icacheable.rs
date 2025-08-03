use async_trait::async_trait;
use uuid::Uuid;
use serde::{Deserialize, Serialize};
use std::error::Error;
use std::time::Duration;

/// Estratégias de invalidação de cache
#[derive(Debug, Clone, Serialize, Deserialize)]
pub enum CacheInvalidationStrategy {
    /// Invalidar imediatamente após atualização
    Immediate,
    /// Invalidar após um tempo específico (TTL)
    TTL(Duration),
    /// Invalidar manualmente
    Manual,
}

/// Configuração de cache para entidades
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct CacheConfig {
    /// Tempo de vida padrão no cache
    pub default_ttl: Duration,
    /// Estratégia de invalidação
    pub invalidation_strategy: CacheInvalidationStrategy,
    /// Tamanho máximo do cache
    pub max_size: usize,
    /// Prefixo para chaves de cache
    pub key_prefix: String,
}

impl Default for CacheConfig {
    fn default() -> Self {
        Self {
            default_ttl: Duration::from_secs(300), // 5 minutos
            invalidation_strategy: CacheInvalidationStrategy::TTL(Duration::from_secs(300)),
            max_size: 1000,
            key_prefix: "default".to_string(),
        }
    }
}

/// Trait que define capacidades de cache para entidades
/// 
/// Esta trait fornece métodos para cache inteligente e eficiente,
/// com invalidação automática e estratégias configuráveis
#[async_trait]
pub trait ICacheable: Clone + Send + Sync + Serialize + for<'de> Deserialize<'de>
{
    type Error: Error + Send + Sync;

    // ========== MÉTODOS ABSTRATOS (devem ser implementados) ==========
    
    /// Obter entidade do cache
    async fn cache_get(key: &str) -> Result<Option<Self>, Self::Error>;
    
    /// Armazenar entidade no cache
    async fn cache_set(key: &str, value: &Self, ttl: Option<Duration>) -> Result<(), Self::Error>;
    
    /// Remover entidade do cache
    async fn cache_delete(key: &str) -> Result<bool, Self::Error>;
    
    /// Limpar todo o cache para este tipo de entidade
    async fn cache_clear_all() -> Result<(), Self::Error>;
    
    /// Obter configuração de cache
    fn get_cache_config() -> CacheConfig;
    
    /// Gerar chave de cache para uma entidade
    fn generate_cache_key(id: Uuid) -> String;

    // ========== MÉTODOS AUTO-IMPLEMENTADOS ==========

    /// Buscar entidade no cache por ID
    async fn get_from_cache(id: Uuid) -> Result<Option<Self>, Self::Error> {
        let key = Self::generate_cache_key(id);
        Self::cache_get(&key).await
    }

    /// Armazenar entidade no cache
    async fn store_in_cache(&self, id: Uuid) -> Result<(), Self::Error> {
        let key = Self::generate_cache_key(id);
        let config = Self::get_cache_config();
        Self::cache_set(&key, self, Some(config.default_ttl)).await
    }

    /// Invalidar entidade do cache
    async fn invalidate_cache(id: Uuid) -> Result<bool, Self::Error> {
        let key = Self::generate_cache_key(id);
        Self::cache_delete(&key).await
    }

    /// Invalidar múltiplas entidades do cache
    async fn invalidate_multiple_cache(ids: Vec<Uuid>) -> Result<Vec<bool>, Self::Error> {
        let mut results = Vec::new();
        for id in ids {
            let result = Self::invalidate_cache(id).await?;
            results.push(result);
        }
        Ok(results)
    }

    /// Verificar se entidade existe no cache
    async fn exists_in_cache(id: Uuid) -> Result<bool, Self::Error> {
        let cached = Self::get_from_cache(id).await?;
        Ok(cached.is_some())
    }

    /// Atualizar entidade no cache (se existe)
    async fn update_cache(&self, id: Uuid) -> Result<(), Self::Error> {
        if Self::exists_in_cache(id).await? {
            self.store_in_cache(id).await?;
        }
        Ok(())
    }

    /// Obter ou armazenar no cache (cache-aside pattern)
    async fn get_or_cache<F, Fut>(id: Uuid, fallback: F) -> Result<Self, Self::Error>
    where
        F: FnOnce() -> Fut + Send,
        Fut: std::future::Future<Output = Result<Self, Self::Error>> + Send,
    {
        // Tenta buscar no cache primeiro
        if let Some(cached) = Self::get_from_cache(id).await? {
            return Ok(cached);
        }

        // Se não estiver no cache, executa fallback
        let entity = fallback().await?;
        
        // Armazena no cache para próximas consultas
        entity.store_in_cache(id).await?;
        
        Ok(entity)
    }

    /// Invalidar cache baseado na estratégia configurada
    async fn smart_invalidate(&self, id: Uuid) -> Result<(), Self::Error> {
        let config = Self::get_cache_config();
        
        match config.invalidation_strategy {
            CacheInvalidationStrategy::Immediate => {
                Self::invalidate_cache(id).await?;
            }
            CacheInvalidationStrategy::Manual => {
                // Não invalida automaticamente
            }
            CacheInvalidationStrategy::TTL(_) => {
                // TTL é tratado automaticamente pelo cache
                // Apenas atualiza com novo TTL
                self.store_in_cache(id).await?;
            }
        }
        
        Ok(())
    }
}
