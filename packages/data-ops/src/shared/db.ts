// src/shared/db.ts

import type { Env } from "../env.ts";
import type { UUID } from "../types/domain";

export async function insertNewsItemIfNotExists(
  env: Env,
  data: {
    sourceId: string;
    feedId?: string;
    url: string;
    itemGuid?: string;
    title: string;
    publishedAt?: number;
    contentRawHtml?: string;
    contentText?: string;
    hashFingerprint: string;
  }
): Promise<UUID> {
  const id = crypto.randomUUID();
  const now = Date.now();

  // Example: try insert, if conflict, return existing id
  const stmt = env.DB.prepare(
    `
    INSERT INTO news_items (
      id, source_id, feed_id, url, item_guid, title,
      published_at, fetched_at, content_raw_html, content_text,
      hash_fingerprint, parse_status, categorize_status, compare_status,
      error_count, created_at, updated_at
    )
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'pending', 'pending', 'pending', 0, ?, ?)
    ON CONFLICT(source_id, url) DO UPDATE SET updated_at = excluded.updated_at
  `
  );

  await stmt
    .bind(
      id,
      data.sourceId,
      data.feedId ?? null,
      data.url,
      data.itemGuid ?? null,
      data.title,
      data.publishedAt ?? null,
      now,
      data.contentRawHtml ?? null,
      data.contentText ?? null,
      data.hashFingerprint,
      now,
      now
    )
    .run();

  // For real: if conflict, you might want to SELECT the ID back.
  return id;
}
