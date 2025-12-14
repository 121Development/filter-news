# Implementation Plan (Step-by-step)

Each step is short and has a clear “done when” condition.

---

## Phase 0 — Foundations

1. **Create repo skeleton**
   - Add folders: `workers/cron`, `workers/parser`, `workers/categoriser`, `workers/event-builder`, `workers/summariser`, plus shared `types/`.
   - **Done when:** each worker folder can deploy a hello-world service.

2. **Define message contracts + shared types**
   - Implement `types/messages.ts` and `types/domain.ts`.
   - **Done when:** all workers compile and import shared types.

3. **Create D1 database + apply Phase-1 schema**
   - Add migrations for: `sources`, `feeds`, `news_items`, `news_item_categories`, `news_item_tags`, `events`, `event_items`.
   - **Done when:** tables exist and a simple `SELECT` works locally.

4. **Seed sources + feeds**
   - Insert your top 3 sources + feed rows.
   - **Done when:** `SELECT * FROM feeds;` returns the expected 3 rows.

---

## Phase 1 — Ingestion: detect new items (DO + cron)

5. **Implement Feed DO state**
   - Store `recentFingerprints`, `lastPolledAt`, optional `etag/last-modified`.
   - **Done when:** state persists and keeps last ~200 fingerprints.

6. **Implement RSS fetch + parse in Feed DO**
   - Fetch RSS, parse `{guid,title,link,pubDate}`.
   - Compute fingerprint and compare vs `recentFingerprints`.
   - **Done when:** DO can list parsed feed items for at least one source.

7. **Cron Worker pings the 3 DOs**
   - Every minute call `/poll` on each DO.
   - **Done when:** logs show 3 polls per minute.

8. **DO emits to `new-items` queue**
   - On new item, enqueue `NEW_FEED_ITEM`.
   - **Done when:** parser receives queue deliveries.

---

## Phase 2 — Parsing (source extractors + Firecrawl fallback)

9. **Implement Parser worker consumer for `new-items`**
   - Validate message shape, ack/retry correctly.
   - **Done when:** messages are consumed without crashing.

10. **DB insert idempotency**
   - Insert into `news_items` using uniqueness on `(source_id,url)` and/or `(source_id,item_guid)`.
   - **Done when:** sending the same URL twice produces only one DB row.

11. **Fetch HTML + store raw + extracted text**
   - Fetch page HTML, store `content_raw_html`, extract `content_text` (basic).
   - **Done when:** both fields populate for one source.

12. **Extractor registry**
   - Implement `EXTRACTORS[sourceId]` with at least one real source extractor.
   - **Done when:** one outlet consistently extracts clean main text.

13. **Firecrawl default extractor**
   - If no extractor exists or quality gate fails, call Firecrawl with strict schema output.
   - **Done when:** an unknown site still produces usable `content_text`.

14. **Parser emits `PARSED_ITEM_READY` → `categoriser` queue**
   - **Done when:** categoriser receives messages with `newsItemId` + `contentText`.

---

## Phase 3 — Categorisation + tags

15. **Implement Categoriser worker consumer**
   - Start rule-based: keywords → categories/tags.
   - **Done when:** rows are inserted into `news_item_categories` and `news_item_tags`.

16. **Handle low-quality inputs**
   - If missing/short `contentText`, set `categorize_status=failed` + `last_error`.
   - **Done when:** bad inputs don’t proceed to similarity.

17. **Categoriser emits `CATEGORISED_ITEM` → `similarity` queue**
   - **Done when:** event-builder receives categorised messages.

---

## Phase 4 — Similarity + meta-events

18. **Event Builder v0 (no embeddings)**
   - Use heuristic: time window + token overlap + title similarity.
   - **Done when:** `events` and `event_items` are created and linked.

19. **Idempotent event linking**
   - Ensure `UNIQUE(event_id, news_item_id)` prevents duplicates.
   - **Done when:** replaying the same message does not duplicate `event_items`.

20. **Add embeddings + vector search**
   - Compute embedding for items/events, query vector store for candidate events.
   - **Done when:** cross-source articles reliably attach to the same event.

21. **Event Builder emits `SUMMARISE_EVENT` → `summarisation` queue**
   - **Done when:** summariser receives event IDs after event updates.

---

## Phase 5 — Summarisation (incremental + debounced)

22. **Implement Summariser worker**
   - Load event + items, call LLM, write `events.current_summary`.
   - **Done when:** summaries appear in DB for new events.

23. **Debounce summarisation**
   - Skip if `now - updated_summary_at < X` minutes.
   - **Done when:** bursts don’t trigger repeated LLM calls.

24. **Re-summarise on new attachments**
   - Re-run summary when a new item is attached to an event.
   - **Done when:** adding a second source updates the summary.

---

## Phase 6 — Reliability & ops

25. **Dead-letter queues per stage**
   - Configure DLQs and log enough context for replay.
   - **Done when:** forced failures land in DLQ with identifiable payloads.

26. **Observability baseline**
   - Standardize logs with: `stage`, `sourceId`, `feedId`, `newsItemId`, `eventId`.
   - **Done when:** you can trace one item across stages using IDs.

27. **Backfill / reparse mechanism**
   - Add script or endpoint to re-enqueue parsing for URLs/newsItemIds.
   - **Done when:** you can upgrade an extractor and safely reprocess historical items.

---

## Phase 7 — (Later) Notifications

28. **Add users/filters/notifications tables**
   - Implement filter evaluation in code.
   - **Done when:** matching events create `notifications` rows.

29. **Delivery worker**
   - Start with logging delivery, later swap in email/webhook.
   - **Done when:** `pending` → `sent` transitions occur.

---

## Suggested working rhythm with an AI companion

- For each step:
  1. Ask the AI for minimal code changes + a small test plan.
  2. Implement and run the test.
  3. Only then move to the next step.

