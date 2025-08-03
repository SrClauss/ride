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
/// Esta trait é 100% AUTO-IMPLEMENTADA usando reflection e convenções.
/// As entidades NÃO PRECISAM implementar nenhum método abstrato!
/// 
/// Funciona automaticamente para qualquer entidade que implemente ICrudable.
#[async_trait]
pub trait IQuerable: Clone + Send + Sync + Serialize + for<'de> Deserialize<'de>
{
    type Error: Error + Send + Sync;

    // ========== MÉTODOS OPCIONAIS (implementação padrão) ==========

    /// Campos pesquisáveis por texto (implementação padrão vazia)
    fn searchable_fields() -> Vec<&'static str> {
        // Por padrão, nenhum campo é pesquisável por texto
        // Override para especificar campos como "name", "description", etc.
        vec![]
    }

    /// Campo de ordenação padrão (implementação padrão: created_at)
    fn default_sort_field() -> &'static str {
        "created_at"
    }

    // ========== MÉTODOS 100% AUTO-IMPLEMENTADOS ==========
    
    /// Buscar todas as entidades com filtros, paginação e ordenação (AUTO-IMPLEMENTADO)
    async fn db_find_all(
        _filters: Option<QueryFilters>,
        _pagination: Option<PaginationParams>,
        _sort: Option<SortOrder>
    ) -> Result<PaginatedResult<Self>, Self::Error> {
        // TODO: Implementação usando Diesel + reflection
        // Vai gerar SQL automaticamente baseado nos filtros
        todo!("Auto-implemented using Diesel reflection and dynamic query building")
    }
    
    /// Contar entidades que atendem aos filtros (AUTO-IMPLEMENTADO)
    async fn db_count(_filters: Option<QueryFilters>) -> Result<u64, Self::Error> {
        // TODO: Implementação usando Diesel + reflection
        // SELECT COUNT(*) FROM {table} WHERE {filters}
        todo!("Auto-implemented using Diesel reflection")
    }
    
    /// Buscar entidades por IDs específicos (AUTO-IMPLEMENTADO)
    async fn db_find_by_ids(_ids: Vec<Uuid>) -> Result<Vec<Self>, Self::Error> {
        // TODO: Implementação usando Diesel + reflection
        // SELECT * FROM {table} WHERE id IN (?)
        todo!("Auto-implemented using Diesel reflection")
    }

    // ========== MÉTODOS AUTO-IMPLEMENTADOS DE ALTO NÍVEL ==========

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

    /// Buscar por campo específico (AUTO-IMPLEMENTADO)
    async fn find_by_field(field: &str, value: serde_json::Value) -> Result<Vec<Self>, Self::Error> {
        let mut filters = QueryFilters::default();
        filters.field_filters.insert(field.to_string(), value);
        Self::find_filtered(filters).await
    }

    /// Busca textual em campos pesquisáveis (AUTO-IMPLEMENTADO)
    async fn search(query: &str) -> Result<Vec<Self>, Self::Error> {
        let mut filters = QueryFilters::default();
        filters.search_query = Some(query.to_string());
        filters.search_fields = Self::searchable_fields().iter().map(|s| s.to_string()).collect();
        Self::find_filtered(filters).await
    }

    /// Buscar primeira entidade que atende aos filtros
    async fn find_first(filters: QueryFilters) -> Result<Option<Self>, Self::Error> {
        let pagination = PaginationParams { page: 1, per_page: 1 };
        let result = Self::db_find_all(Some(filters), Some(pagination), None).await?;
        Ok(result.data.into_iter().next())
    }
}
