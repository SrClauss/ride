/// Traits fundamentais do sistema
/// 
/// Este módulo define as abstrações principais que todas as entidades
/// do sistema devem implementar para garantir consistência e funcionalidade

pub mod icrudable;
pub mod iquerable;
pub mod icacheable;

// Re-exports para facilitar o uso
pub use icrudable::ICrudable;
pub use iquerable::{IQuerable};
pub use icacheable::{ICacheable};

/// Trait composta que combina todas as capacidades principais
/// 
/// Entidades que implementam esta trait possuem funcionalidades completas
/// de CRUD, consultas avançadas e cache inteligente
pub trait IEntity<CreateInput, UpdateInput>:
    ICrudable<CreateInput, UpdateInput>
    + IQuerable
    + ICacheable
    + Clone
    + Send
    + Sync
where
    CreateInput: Send + Sync + 'static,
    UpdateInput: Send + Sync + 'static,
{
}

// Implementação automática para qualquer tipo que implemente todas as traits
impl<E, CreateInput, UpdateInput> IEntity<CreateInput, UpdateInput> for E
where
    E: ICrudable<CreateInput, UpdateInput>
        + IQuerable
        + ICacheable
        + Clone
        + Send
        + Sync,
    CreateInput: Send + Sync + 'static,
    UpdateInput: Send + Sync + 'static,
{
}
