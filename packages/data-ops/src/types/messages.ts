// src/types/messages.ts

import type { TimestampMs, UUID } from "./domain";

// 1) Feed DO → Parser
export type NewItemMessage = {
  type: "NEW_FEED_ITEM";
  feedId: string;
  sourceId: string;
  itemGuid?: string;
  url: string;
  title: string;
  publishedAt?: TimestampMs;
  rawFeedMeta?: {
    rawPubDate?: string;
    extra?: Record<string, unknown>;
  };
  fingerprint: string;
  firstSeenAt: TimestampMs;
};

// 2) Parser → Categoriser
export type ParsedItemMessage = {
  type: "PARSED_ITEM_READY";
  newsItemId: UUID;
  sourceId: string;
  feedId?: string;
  url: string;
  title: string;
  contentText: string;
  publishedAt?: TimestampMs;
  language?: string;
  locationHint?: string;
};

// 3) Categoriser → Event Builder
export type CategorisedItemMessage = {
  type: "CATEGORISED_ITEM";
  newsItemId: UUID;
  sourceId: string;
  url: string;
  title: string;
  contentText: string;
  publishedAt?: TimestampMs;
  categories: string[];
  tags: string[];
  language?: string;
};

// 4) Event Builder → Summariser
export type SummarisationReason = "NEW_ITEM" | "TIMEOUT" | "MANUAL";

export type SummarisationMessage = {
  type: "SUMMARISE_EVENT";
  eventId: UUID;
  reason: SummarisationReason;
};

// Convenience aliases for queue bindings
export type NewItemsQueueMessage = NewItemMessage;
export type CategoriserQueueMessage = ParsedItemMessage;
export type SimilarityQueueMessage = CategorisedItemMessage;
export type SummarisationQueueMessage = SummarisationMessage;
