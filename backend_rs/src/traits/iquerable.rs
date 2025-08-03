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
}

impl Default for PaginationParams {
    fn default() -> Self {
        Self {
            page: 1,
            per_page: 10,
        }
    }
}

/// Resultado paginado
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct PaginatedResult<T> {
    pub data: Vec<T>,
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
/// Esta trait fornece métodos padronizados para buscar, filtrar,
/// paginar e ordenar entidades de forma eficiente e consistente
#[async_trait]
pub trait IQuerable: Clone + Send + Sync + Serialize + for<'de> Deserialize<'de>
{
    type Error: Error + Send + Sync;

    // ========== MÉTODOS ABSTRATOS (devem ser implementados) ==========
    
    /// Buscar todas as entidades com filtros, paginação e ordenação
    async fn db_find_all(
        filters: Option<QueryFilters>,
        pagination: Option<PaginationParams>,
        sort: Option<SortOrder>
    ) -> Result<PaginatedResult<Self>, Self::Error>;
    
    /// Contar entidades que atendem aos filtros
    async fn db_count(filters: Option<QueryFilters>) -> Result<u64, Self::Error>;
    
    /// Buscar entidades por IDs específicos
    async fn db_find_by_ids(ids: Vec<Uuid>) -> Result<Vec<Self>, Self::Error>;

    // ========== MÉTODOS AUTO-IMPLEMENTADOS ==========

    /// Buscar todas as entidades (sem filtros)
    async fn find_all() -> Result<Vec<Self>, Self::Error> {
        let result = Self::db_find_all(None, None, None).await?;
        Ok(result.data)
    }

    /// Buscar com paginação
    async fn find_paginated(
        page: u32,
        per_page: u32
    ) -> Result<PaginatedResult<Self>, Self::Error> {
        let pagination = PaginationParams { page, per_page };
        Self::db_find_all(None, Some(pagination), None).await
    }

    /// Buscar com filtros
    async fn find_filtered(filters: QueryFilters) -> Result<Vec<Self>, Self::Error> {
        let result = Self::db_find_all(Some(filters), None, None).await?;
        Ok(result.data)
    }

    /// Buscar com ordenação
    async fn find_sorted(sort: SortOrder) -> Result<Vec<Self>, Self::Error> {
        let result = Self::db_find_all(None, None, Some(sort)).await?;
        Ok(result.data)
    }

    /// Buscar com todos os parâmetros
    async fn find_with_params(
        filters: Option<QueryFilters>,
        pagination: Option<PaginationParams>,
        sort: Option<SortOrder>
    ) -> Result<PaginatedResult<Self>, Self::Error> {
        Self::db_find_all(filters, pagination, sort).await
    }

    /// Contar total de entidades
    async fn count_all() -> Result<u64, Self::Error> {
        Self::db_count(None).await
    }

    /// Contar entidades com filtros
    async fn count_filtered(filters: QueryFilters) -> Result<u64, Self::Error> {
        Self::db_count(Some(filters)).await
    }

    /// Buscar por múltiplos IDs
    async fn find_by_ids(ids: Vec<Uuid>) -> Result<Vec<Self>, Self::Error> {
        Self::db_find_by_ids(ids).await
    }

    /// Verificar se existem entidades que atendem aos filtros
    async fn exists_with_filters(filters: QueryFilters) -> Result<bool, Self::Error> {
        let count = Self::db_count(Some(filters)).await?;
        Ok(count > 0)
    }
}
