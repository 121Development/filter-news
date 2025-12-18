// src/durable-objects/FeedDurableObject.ts
import { DurableObject } from "cloudflare:workers";
import { XMLParser } from 'fast-xml-parser';
import { NewItemMessageSchema } from "../../../../packages/data-ops/src/types/messages";

export class AftonbladetFeedDurableObject extends DurableObject {
  hashes: string[] = [];

  constructor(ctx: DurableObjectState, env: Env) {
      super(ctx, env)
      ctx.blockConcurrencyWhile(async () => {
          this.hashes = await this.ctx.storage.get<string[]>("hashes") || this.hashes;
      })
  }

  async generateHash(text: string): Promise<string> {
    const encoder = new TextEncoder();
    const data = encoder.encode(text);
    const hashBuffer = await crypto.subtle.digest('SHA-256', data);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    const hashHex = hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
    return hashHex;
  }

  async checkAndAddItem(hash: string, item: any): Promise<boolean> {
    if (this.hashes.includes(hash)) {
      //console.log(`Item with hash ${hash} already exists, skipping...`);
      return false;
    }

    this.hashes.push(hash);
    await this.ctx.storage.put("hashes", this.hashes);
    await this.ctx.storage.put(`item:${hash}`, item);
    console.log(`Added item with hash ${hash} to storage`);
    return true;
  }

  async parseRSSFeed() {
    //await this.env.NEW_ITEMS_QUEUE.send("Cron checker message");
    const response = await fetch('https://rss.aftonbladet.se/rss2/small/pages/sections/senastenytt/');
    const xmlData = await response.text();

    const parser = new XMLParser();
    const result = parser.parse(xmlData);

    const items = result?.rss?.channel?.item;

    if (items && items.length > 0) {
      const processedItems = await Promise.all(
        items.slice(0, 5).map(async (item: any) => {
          const title = item?.title || '';
          const link = item?.link?.replace('?utm_medium=rss', '') || '';
          const hash = await this.generateHash(title + link);

          return {
            title,
            link,
            hash
          };
        })
      );

      const newItems = [];
      for (const item of processedItems) {
        const isNew = await this.checkAndAddItem(item.hash, item);
        if (isNew) {
          const queueMessage = NewItemMessageSchema.parse({
            type: "NEW_FEED_ITEM",
            feedId: "aftonbladet",
            sourceId: "aftonbladet",
            itemGuid: undefined,
            url: item.link,
            title: item.title,
            publishedAt: undefined,
            fingerprint: item.hash,
            firstSeenAt: Date.now(),
          });

          newItems.push(item);
          await this.env.NEW_ITEMS_QUEUE.send(queueMessage);
          console.log(`Added item with title ${queueMessage.title} to queue`);
        }
      }

      // console.log("Parsed 5 items:");
      // newItems.forEach((item: any, index: number) => {
      //   console.log(`\nItem ${index + 1}:`);
      //   console.log("Title:", item.title);
      //   console.log("Link:", item.link);
      //   console.log("Hash:", item.hash);
      // });

      const allHashes = await this.ctx.storage.get<string[]>("hashes") || [];

      return {
        message: 'RSS Feed parsed successfully',
        items: newItems,
        newItemsCount: newItems.length,
        totalItems: items.length,
        totalInStorage: allHashes.length
      };
    }

    return {
      message: 'RSS Feed parsed but no items found'
    };
  }

  async getHashes() {
    return await this.ctx.storage.get<string[]>("hashes") || [];
  }

  async getItemByHash(hash: string) {
    return await this.ctx.storage.get(`item:${hash}`);
  }

  async deleteOldHashes(keepCount: number = 10) {
    const hashes = await this.ctx.storage.get<string[]>("hashes") || [];
    const latestHashes = hashes.slice(0, keepCount);
    const hashesToDelete = hashes.slice(keepCount);

    // Delete old items
    for (const hash of hashesToDelete) {
      await this.ctx.storage.delete(`item:${hash}`);
    }

    await this.ctx.storage.put("hashes", latestHashes);
    return latestHashes;
  }

}