// src/shared/pipeline-status.ts

import type { Env } from "../env";
import type { UUID, PipelineStatus } from "../types/domain";

export async function updateNewsItemStatus(
  env: Env,
  newsItemId: UUID,
  field: "parse_status" | "categorize_status" | "compare_status",
  status: PipelineStatus
): Promise<void> {
  const sql = `
    UPDATE news_items
    SET ${field} = ?, updated_at = ?
    WHERE id = ?
  `;
  await env.DB.prepare(sql).bind(status, Date.now(), newsItemId).run();
}

export async function incrementNewsItemError(
  env: Env,
  newsItemId: UUID,
  error: unknown
): Promise<void> {
  const msg =
    error instanceof Error ? error.message.slice(0, 500) : String(error).slice(0, 500);

  const sql = `
    UPDATE news_items
    SET error_count = error_count + 1,
        last_error = ?,
        updated_at = ?
    WHERE id = ?
  `;
  await env.DB.prepare(sql).bind(msg, Date.now(), newsItemId).run();
}
