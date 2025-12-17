import { sqliteTable, AnySQLiteColumn, foreignKey, text, integer, index, primaryKey, real } from "drizzle-orm/sqlite-core"
  import { sql } from "drizzle-orm"

export const eventItems = sqliteTable("event_items", {
	id: text().primaryKey(),
	eventId: text("event_id").notNull().references(() => events.id, { onDelete: "cascade" } ),
	newsItemId: text("news_item_id").notNull().references(() => newsItems.id, { onDelete: "cascade" } ),
	sourceId: text("source_id").notNull().references(() => sources.id),
	url: text().notNull(),
	addedAt: integer("added_at").notNull(),
});

export const schemaVersion = sqliteTable("schema_version", {
	version: integer().primaryKey(),
	appliedAt: integer("applied_at").notNull(),
	description: text(),
});

export const feeds = sqliteTable("feeds", {
	id: text().primaryKey(),
	sourceId: text("source_id").notNull().references(() => sources.id),
	url: text().notNull(),
	description: text(),
	language: text(),
	region: text(),
	isActive: integer("is_active").default(1).notNull(),
	createdAt: integer("created_at").notNull(),
	updatedAt: integer("updated_at").notNull(),
});

export const newsItems = sqliteTable("news_items", {
	id: text().primaryKey(),
	sourceId: text("source_id").notNull().references(() => sources.id),
	feedId: text("feed_id").references(() => feeds.id),
	url: text().notNull(),
	itemGuid: text("item_guid"),
	title: text().notNull(),
	publishedAt: integer("published_at"),
	fetchedAt: integer("fetched_at").notNull(),
	language: text(),
	locationHint: text("location_hint"),
	contentRawHtml: text("content_raw_html"),
	contentText: text("content_text"),
	hashFingerprint: text("hash_fingerprint").notNull(),
	parseStatus: text("parse_status").default("pending"),
	categorizeStatus: text("categorize_status").default("pending"),
	compareStatus: text("compare_status").default("pending"),
	errorCount: integer("error_count").default(0),
	lastError: text("last_error"),
	archivedAt: integer("archived_at"),
	deletedAt: integer("deleted_at"),
	createdAt: integer("created_at").notNull(),
	updatedAt: integer("updated_at").notNull(),
},
(table) => [
	index("idx_news_items_published_at").on(table.publishedAt),
]);

export const newsItemCategories = sqliteTable("news_item_categories", {
	newsItemId: text("news_item_id").notNull().references(() => newsItems.id, { onDelete: "cascade" } ),
	category: text().notNull(),
},
(table) => [
	primaryKey({ columns: [table.newsItemId, table.category], name: "news_item_categories_news_item_id_category_pk"})
]);

export const newsItemTags = sqliteTable("news_item_tags", {
	newsItemId: text("news_item_id").notNull().references(() => newsItems.id, { onDelete: "cascade" } ),
	tag: text().notNull(),
},
(table) => [
	primaryKey({ columns: [table.newsItemId, table.tag], name: "news_item_tags_news_item_id_tag_pk"})
]);

export const events = sqliteTable("events", {
	id: text().primaryKey(),
	firstSeenAt: integer("first_seen_at").notNull(),
	updatedAt: integer("updated_at").notNull(),
	representativeTitle: text("representative_title"),
	currentSummary: text("current_summary"),
	dominantCategories: text("dominant_categories"),
	severityScore: real("severity_score"),
	embeddingRef: text("embedding_ref"),
	embeddingModel: text("embedding_model"),
	archivedAt: integer("archived_at"),
	deletedAt: integer("deleted_at"),
	updatedSummaryAt: integer("updated_summary_at"),
	createdAt: integer("created_at").notNull(),
});

export const sources = sqliteTable("sources", {
	id: text().primaryKey(),
	name: text().notNull(),
	homepageUrl: text("homepage_url"),
	createdAt: integer("created_at").notNull(),
	updatedAt: integer("updated_at").notNull(),
});

