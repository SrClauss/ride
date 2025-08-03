/// Traits fundamentais do sistema
/// 
/// Este módulo define as abstrações principais que todas as entidades
/// do sistema devem implementar para garantir consistência e funcionalidade

pub mod icrudable;
pub mod iquerable;
pub mod icacheable;

// Re-exports para facilitar o uso
pub use icrudable::ICrudable;
pub use iquerable::{IQuerable, PaginatedResult, PaginationParams, QueryFilters, SortOrder, DateRange};
pub use icacheable::{ICacheable, CacheConfig, CacheInvalidationStrategy};

/// Trait composta que combina todas as capacidades principais
/// 
/// Entidades que implementam esta trait possuem funcionalidades completas
/// de CRUD, consultas avançadas e cache inteligente
pub trait IEntity<T, CreateInput, UpdateInput>:
    ICrudable<T, CreateInput, UpdateInput>
    + IQuerable<T>
    + ICacheable<T>
    + Clone
    + Send
    + Sync
where
    T: Clone + Send + Sync + serde::Serialize + for<'de> serde::Deserialize<'de>,
    CreateInput: Send + Sync,
    UpdateInput: Send + Sync,
{
}

// Implementação automática para qualquer tipo que implemente todas as traits
impl<E, T, CreateInput, UpdateInput> IEntity<T, CreateInput, UpdateInput> for E
where
    E: ICrudable<T, CreateInput, UpdateInput>
        + IQuerable<T>
        + ICacheable<T>
        + Clone
        + Send
        + Sync,
    T: Clone + Send + Sync + serde::Serialize + for<'de> serde::Deserialize<'de>,
    CreateInput: Send + Sync,
    UpdateInput: Send + Sync,
{
}
