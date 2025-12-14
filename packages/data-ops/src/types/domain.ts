// src/types/domain.ts

export type TimestampMs = number;
export type UUID = string;

export type PipelineStatus = "pending" | "ok" | "failed";

export interface Source {
  id: string;
  name: string;
  homepageUrl?: string;
}

export interface Feed {
  id: string;
  sourceId: string;
  url: string;
  description?: string;
  language?: string;
  region?: string;
  isActive: boolean;
}

export interface NewsItem {
  id: UUID;
  sourceId: string;
  feedId?: string;
  url: string;
  itemGuid?: string;
  title: string;
  publishedAt?: TimestampMs;
  fetchedAt: TimestampMs;

  language?: string;
  locationHint?: string;
  contentRawHtml?: string;
  contentText?: string;

  hashFingerprint: string;

  parseStatus: PipelineStatus;
  categorizeStatus: PipelineStatus;
  compareStatus: PipelineStatus;
  errorCount: number;
  lastError?: string;

  archivedAt?: TimestampMs | null;
  deletedAt?: TimestampMs | null;

  createdAt: TimestampMs;
  updatedAt: TimestampMs;
}

export interface Event {
  id: UUID;
  firstSeenAt: TimestampMs;
  updatedAt: TimestampMs;

  representativeTitle?: string;
  currentSummary?: string;
  dominantCategories?: string[];
  severityScore?: number;

  embeddingRef?: string;
  embeddingModel?: string;

  archivedAt?: TimestampMs | null;
  deletedAt?: TimestampMs | null;

  updatedSummaryAt?: TimestampMs;
  createdAt: TimestampMs;
}
