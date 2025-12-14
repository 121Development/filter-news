// src/durable-objects/FeedDurableObject.ts

import type { Env } from "../env";
import type { NewItemsQueueMessage } from "../types/messages";

interface FeedDOState {
  lastPolledAt?: number;
  lastEtag?: string;
  lastModified?: string;
  recentFingerprints: string[];
}

export class FeedDurableObject {
  private state: DurableObjectState;
  private env: Env;
  private feedId: string;

  constructor(state: DurableObjectState, env: Env) {
    this.state = state;
    this.env = env;
    this.feedId = state.id.toString(); // or derive from name
  }

  async fetch(request: Request): Promise<Response> {
    const url = new URL(request.url);

    if (url.pathname === "/poll" && request.method === "POST") {
      await this.poll();
      return new Response("ok");
    }

    return new Response("Not found", { status: 404 });
  }

  private async poll(): Promise<void> {
    const st = await this.loadState();
    const now = Date.now();

    // TODO: get feed URL + sourceId from DB based on this.feedId
    const { feedUrl, sourceId } = await this.resolveFeedMetadata();

    // TODO: fetch & parse the RSS feed
    const items = await this.fetchAndParseFeed(feedUrl, sourceId);

    const newFingerprints: string[] = [];

    for (const item of items) {
      const fingerprint = this.computeFingerprint(item.title, item.url);
      if (st.recentFingerprints.includes(fingerprint)) continue;

      const msg: NewItemsQueueMessage = {
        type: "NEW_FEED_ITEM",
        feedId: this.feedId,
        sourceId,
        itemGuid: item.guid,
        url: item.url,
        title: item.title,
        publishedAt: item.publishedAt,
        rawFeedMeta: { rawPubDate: item.rawPubDate },
        fingerprint,
        firstSeenAt: now,
      };

      await this.env.NEW_ITEMS_QUEUE.send(msg);
      newFingerprints.push(fingerprint);
    }

    st.recentFingerprints = [...newFingerprints, ...st.recentFingerprints].slice(0, 200);
    st.lastPolledAt = now;

    await this.saveState(st);
  }

  private async loadState(): Promise<FeedDOState> {
    const data = await this.state.storage.get<FeedDOState>("state");
    return data ?? { recentFingerprints: [] };
  }

  private async saveState(st: FeedDOState): Promise<void> {
    await this.state.storage.put("state", st);
  }

  private async resolveFeedMetadata(): Promise<{ feedUrl: string; sourceId: string }> {
    // TODO: lookup from D1 (feeds table)
    return {
      feedUrl: "https://example.com/rss",
      sourceId: "example-source",
    };
  }

  private async fetchAndParseFeed(
    feedUrl: string,
    sourceId: string
  ): Promise<
    {
      guid?: string;
      title: string;
      url: string;
      rawPubDate?: string;
      publishedAt?: number;
    }[]
  > {
    // TODO: fetch RSS, parse items
    return [];
  }

  private computeFingerprint(title: string, url: string): string {
    // placeholder
    return `fp_${title.length}_${url.length}`;
  }
}
