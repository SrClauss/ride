use tracing::{info, Level};
use tracing_subscriber::FmtSubscriber;

// Módulos do projeto
mod traits;
mod models;
mod services;
mod handlers;
mod config;
mod cache;
mod errors;

#[tokio::main]
async fn main() {
    // Configurar logging
    let subscriber = FmtSubscriber::builder()
        .with_max_level(Level::INFO)
        .finish();
    tracing::subscriber::set_global_default(subscriber)
        .expect("Setting default subscriber failed");

    info!("🦀 Rider Finance Backend RS - Iniciando...");

    // TODO: Implementar servidor Axum
    info!("✅ Traits fundamentais carregadas:");
    info!("   - ICrudable: Operações CRUD básicas");
    info!("   - IQuerable: Consultas avançadas com filtros e paginação");
    info!("   - ICacheable: Cache inteligente com Sled");
    
    info!("🚀 Backend Rust pronto para implementação!");
}
