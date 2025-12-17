import { relations } from "drizzle-orm/relations";
import { newsItems, eventItems, events, sources, feeds, newsItemCategories, newsItemTags } from "./schema";

export const eventItemsRelations = relations(eventItems, ({one}) => ({
	newsItem: one(newsItems, {
		fields: [eventItems.newsItemId],
		references: [newsItems.id]
	}),
	event: one(events, {
		fields: [eventItems.eventId],
		references: [events.id]
	}),
	source: one(sources, {
		fields: [eventItems.sourceId],
		references: [sources.id]
	}),
}));

export const newsItemsRelations = relations(newsItems, ({one, many}) => ({
	eventItems: many(eventItems),
	feed: one(feeds, {
		fields: [newsItems.feedId],
		references: [feeds.id]
	}),
	source: one(sources, {
		fields: [newsItems.sourceId],
		references: [sources.id]
	}),
	newsItemCategories: many(newsItemCategories),
	newsItemTags: many(newsItemTags),
}));

export const eventsRelations = relations(events, ({many}) => ({
	eventItems: many(eventItems),
}));

export const sourcesRelations = relations(sources, ({many}) => ({
	eventItems: many(eventItems),
	feeds: many(feeds),
	newsItems: many(newsItems),
}));

export const feedsRelations = relations(feeds, ({one, many}) => ({
	source: one(sources, {
		fields: [feeds.sourceId],
		references: [sources.id]
	}),
	newsItems: many(newsItems),
}));

export const newsItemCategoriesRelations = relations(newsItemCategories, ({one}) => ({
	newsItem: one(newsItems, {
		fields: [newsItemCategories.newsItemId],
		references: [newsItems.id]
	}),
}));

export const newsItemTagsRelations = relations(newsItemTags, ({one}) => ({
	newsItem: one(newsItems, {
		fields: [newsItemTags.newsItemId],
		references: [newsItems.id]
	}),
}));