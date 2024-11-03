use crate::naive_date_format;
use serde::{Deserialize, Serialize};
use sqlx::types::time::Date;
use sqlx::PgPool;

#[derive(Debug, Clone, Deserialize, Serialize)]
pub struct Note {
    id: i32,
    #[serde(with = "naive_date_format")]
    date: Date,
    content: String,
}

#[derive(Debug, Clone, Deserialize, Serialize)]
pub struct Guest {
    id: i32,
}

#[derive(Debug, Clone)]
pub struct Store {
    db: PgPool,
}

impl Store {
    pub fn new(db: PgPool) -> Self {
        Self { db }
    }

    pub async fn add_guest(&self) -> Result<Guest, sqlx::Error> {
        sqlx::query_as!(Guest, "INSERT INTO guests DEFAULT VALUES RETURNING id")
            .fetch_one(&self.db)
            .await
    }

    pub async fn get_notes_in_range(
        &self,
        start: Date,
        end: Date,
        guest_id: i32,
    ) -> Result<Vec<Note>, sqlx::Error> {
        sqlx::query_as!(
            Note,
            "SELECT id, date, content FROM notes WHERE date >= $1 AND date <= $2 AND guest_id = $3",
            start,
            end,
            guest_id
        )
        .fetch_all(&self.db)
        .await
    }

    pub async fn add_note(
        &self,
        date: Date,
        content: String,
        guest_id: i32,
    ) -> Result<Note, sqlx::Error> {
        sqlx::query_as!(
            Note,
            "INSERT INTO notes (date, content, guest_id) VALUES ($1, $2, $3) RETURNING id, date, content",
            date,
            content,
            guest_id
        )
        .fetch_one(&self.db)
        .await
    }

    pub async fn update_note(
        &self,
        id: i32,
        date: Date,
        content: String,
    ) -> Result<Note, sqlx::Error> {
        sqlx::query_as!(
            Note,
            "UPDATE notes SET date = $1, content = $2 WHERE id = $3 RETURNING id, date, content",
            date,
            content,
            id
        )
        .fetch_one(&self.db)
        .await
    }

    pub async fn delete_note(&self, id: i32) -> Result<Note, sqlx::Error> {
        sqlx::query_as!(
            Note,
            "DELETE FROM notes WHERE id = $1 RETURNING id, date, content",
            id
        )
        .fetch_one(&self.db)
        .await
    }
}
