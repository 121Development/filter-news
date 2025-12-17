-- Current sql file was generated after introspecting the database
-- If you want to run this migration please uncomment this code before executing migrations
/*
CREATE TABLE `event_items` (
	`id` text PRIMARY KEY,
	`event_id` text NOT NULL,
	`news_item_id` text NOT NULL,
	`source_id` text NOT NULL,
	`url` text NOT NULL,
	`added_at` integer NOT NULL,
	FOREIGN KEY (`news_item_id`) REFERENCES `news_items`(`id`) ON UPDATE no action ON DELETE cascade,
	FOREIGN KEY (`event_id`) REFERENCES `events`(`id`) ON UPDATE no action ON DELETE cascade,
	FOREIGN KEY (`source_id`) REFERENCES `sources`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE TABLE `schema_version` (
	`version` integer PRIMARY KEY,
	`applied_at` integer NOT NULL,
	`description` text
);
--> statement-breakpoint
CREATE TABLE `feeds` (
	`id` text PRIMARY KEY,
	`source_id` text NOT NULL,
	`url` text NOT NULL,
	`description` text,
	`language` text,
	`region` text,
	`is_active` integer DEFAULT 1 NOT NULL,
	`created_at` integer NOT NULL,
	`updated_at` integer NOT NULL,
	FOREIGN KEY (`source_id`) REFERENCES `sources`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE TABLE `news_items` (
	`id` text PRIMARY KEY,
	`source_id` text NOT NULL,
	`feed_id` text,
	`url` text NOT NULL,
	`item_guid` text,
	`title` text NOT NULL,
	`published_at` integer,
	`fetched_at` integer NOT NULL,
	`language` text,
	`location_hint` text,
	`content_raw_html` text,
	`content_text` text,
	`hash_fingerprint` text NOT NULL,
	`parse_status` text DEFAULT 'pending',
	`categorize_status` text DEFAULT 'pending',
	`compare_status` text DEFAULT 'pending',
	`error_count` integer DEFAULT 0,
	`last_error` text,
	`archived_at` integer,
	`deleted_at` integer,
	`created_at` integer NOT NULL,
	`updated_at` integer NOT NULL,
	FOREIGN KEY (`feed_id`) REFERENCES `feeds`(`id`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`source_id`) REFERENCES `sources`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE INDEX `idx_news_items_published_at` ON `news_items` (`published_at`);--> statement-breakpoint
CREATE TABLE `news_item_categories` (
	`news_item_id` text NOT NULL,
	`category` text NOT NULL,
	PRIMARY KEY(`news_item_id`, `category`),
	FOREIGN KEY (`news_item_id`) REFERENCES `news_items`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE TABLE `news_item_tags` (
	`news_item_id` text NOT NULL,
	`tag` text NOT NULL,
	PRIMARY KEY(`news_item_id`, `tag`),
	FOREIGN KEY (`news_item_id`) REFERENCES `news_items`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE TABLE `events` (
	`id` text PRIMARY KEY,
	`first_seen_at` integer NOT NULL,
	`updated_at` integer NOT NULL,
	`representative_title` text,
	`current_summary` text,
	`dominant_categories` text,
	`severity_score` real,
	`embedding_ref` text,
	`embedding_model` text,
	`archived_at` integer,
	`deleted_at` integer,
	`updated_summary_at` integer,
	`created_at` integer NOT NULL
);

*/