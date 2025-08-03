use async_trait::async_trait;
use serde::{Deserialize, Serialize};
use std::collections::HashMap;
use std::error::Error;
use uuid::Uuid;

/// Critérios de ordenação
#[derive(Debug, Clone, Serialize, Deserialize)]
pub enum SortOrder {
    Asc,
    Desc,
}

/// Parâmetros de paginação
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct PaginationParams {
    pub page: u32,
    pub per_page: u32,
    pub max_per_page: u32,
}

impl Default for PaginationParams {
    fn default() -> Self {
        Self {
            page: 1,
            per_page: 10,
            max_per_page: 100,
        }
    }
}

/// Resultado paginado
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct PaginatedResult<T> {
    pub items: Vec<T>,
    pub total_count: u64,
    pub page: u32,
    pub per_page: u32,
    pub total_pages: u32,
    pub has_next: bool,
    pub has_prev: bool,
}

/// Filtros genéricos para consultas
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct QueryFilters {
    /// Filtros por campos específicos
    pub field_filters: HashMap<String, serde_json::Value>,
    /// Busca textual livre
    pub search_query: Option<String>,
    /// Campos para busca textual
    pub search_fields: Vec<String>,
    /// Filtros de data
    pub date_range: Option<DateRange>,
    /// IDs específicos para incluir
    pub include_ids: Option<Vec<Uuid>>,
    /// IDs específicos para excluir
    pub exclude_ids: Option<Vec<Uuid>>,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct DateRange {
    pub start: Option<chrono::DateTime<chrono::Utc>>,
    pub end: Option<chrono::DateTime<chrono::Utc>>,
}

impl Default for QueryFilters {
    fn default() -> Self {
        Self {
            field_filters: HashMap::new(),
            search_query: None,
            search_fields: Vec::new(),
            date_range: None,
            include_ids: None,
            exclude_ids: None,
        }
    }
}

/// Trait que define capacidades avançadas de consulta para entidades
/// 
/// Esta trait permite consultas complexas, filtros, ordenação e paginação
#[async_trait]
pub trait IQuerable<T>
where
    T: Clone + Send + Sync + Serialize + for<'de> Deserialize<'de>,
{
    type Error: Error + Send + Sync;

    /// Buscar todas as entidades (sem filtros)
    async fn find_all() -> Result<Vec<T>, Self::Error>;

    /// Buscar entidades com filtros simples
    async fn find_by_field(field: &str, value: serde_json::Value) -> Result<Vec<T>, Self::Error>;

    /// Consulta avançada com filtros, ordenação e paginação
    async fn query(
        filters: QueryFilters,
        sort_by: Option<String>,
        sort_order: Option<SortOrder>,
        pagination: Option<PaginationParams>,
    ) -> Result<PaginatedResult<T>, Self::Error>;

    /// Contar entidades que atendem aos filtros
    async fn count(filters: QueryFilters) -> Result<u64, Self::Error>;

    /// Buscar entidades por múltiplos IDs
    async fn find_by_ids(ids: Vec<Uuid>) -> Result<Vec<T>, Self::Error>;

    /// Buscar entidades por campo de referência (ex: user_id)
    async fn find_by_reference(
        reference_field: &str,
        reference_id: Uuid,
    ) -> Result<Vec<T>, Self::Error>;

    /// Buscar primeira entidade que atende aos critérios
    async fn find_first(filters: QueryFilters) -> Result<Option<T>, Self::Error>;

    /// Verificar se existe alguma entidade que atende aos critérios
    async fn exists_with_criteria(filters: QueryFilters) -> Result<bool, Self::Error>;

    /// Busca paginada simples (sem filtros complexos)
    async fn find_paginated(
        page: u32,
        per_page: u32,
    ) -> Result<PaginatedResult<T>, Self::Error> {
        Self::query(
            QueryFilters::default(),
            None,
            None,
            Some(PaginationParams {
                page,
                per_page,
                max_per_page: 100,
            }),
        )
        .await
    }
}
