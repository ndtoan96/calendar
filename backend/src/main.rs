mod store;

use std::env;

use axum::{
    debug_handler,
    extract::{Path, Query, State},
    routing::{delete, get, post, put},
    Json, Router,
};
use serde::Deserialize;
use sqlx::types::time::Date;
use sqlx::PgPool;
use store::{Guest, Note, Store};
use time::serde::format_description;
use tower_http::{services::ServeDir, trace::TraceLayer};

format_description!(naive_date_format, Date, "[year]-[month]-[day]");

#[derive(Debug, Clone, Deserialize)]
struct RangeParams {
    #[serde(with = "naive_date_format")]
    start: Date,
    end: Date,
    guest_id: i32,
}

#[derive(Debug, Clone, Deserialize)]
struct UpdateNoteParams {
    #[serde(with = "naive_date_format")]
    date: Date,
    content: String,
}

#[derive(Debug, Clone, Deserialize)]
struct AddNoteParams {
    #[serde(with = "naive_date_format")]
    date: Date,
    content: String,
    guest_id: i32,
}

#[debug_handler]
async fn get_note_in_range(
    Query(params): Query<RangeParams>,
    State(store): State<Store>,
) -> Json<Vec<Note>> {
    Json(
        store
            .get_notes_in_range(params.start, params.end, params.guest_id)
            .await
            .unwrap(),
    )
}

#[debug_handler]
async fn update_note(
    Path(note_id): Path<i32>,
    State(store): State<Store>,
    Json(params): Json<UpdateNoteParams>,
) -> Json<Note> {
    Json(
        store
            .update_note(note_id, params.date, params.content)
            .await
            .unwrap(),
    )
}

#[debug_handler]
async fn add_note(State(store): State<Store>, Json(params): Json<AddNoteParams>) -> Json<Note> {
    Json(
        store
            .add_note(params.date, params.content, params.guest_id)
            .await
            .unwrap(),
    )
}

#[debug_handler]
async fn add_guest(State(store): State<Store>) -> Json<Guest> {
    Json(store.add_guest().await.unwrap())
}

#[debug_handler]
async fn delete_note(Path(note_id): Path<i32>, State(store): State<Store>) -> Json<Note> {
    Json(store.delete_note(note_id).await.unwrap())
}

#[tokio::main]
async fn main() {
    tracing_subscriber::fmt()
        .with_max_level(tracing::Level::DEBUG)
        .init();

    let db = PgPool::connect(&env::var("DATABASE_URL").unwrap())
        .await
        .unwrap();
    tracing::info!("Connected to database");
    let store = Store::new(db);

    let trace = TraceLayer::new_for_http();
    let app = Router::new()
        .route("/_health", get(|| async { "ok" }))
        .route("/api/guests", post(add_guest))
        .route("/api/notes", get(get_note_in_range))
        .route("/api/notes", post(add_note))
        .route("/api/notes/:note_id", put(update_note))
        .route("/api/notes/:note_id", delete(delete_note))
        .nest_service("/app", ServeDir::new("./app"))
        .with_state(store)
        .layer(trace);

    let address = "0.0.0.0:8080";
    let listener = tokio::net::TcpListener::bind(address).await.unwrap();
    tracing::info!("Listening on {}", address);
    axum::serve(listener, app).await.unwrap();
}
