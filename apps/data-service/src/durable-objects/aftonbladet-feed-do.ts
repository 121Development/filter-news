// src/durable-objects/FeedDurableObject.ts
import { DurableObject } from "cloudflare:workers";
import { XMLParser } from 'fast-xml-parser';

export class AftonbladetFeedDurableObject extends DurableObject {
  count: number = 0

  constructor(ctx: DurableObjectState, env: Env) {
      super(ctx, env)
      ctx.blockConcurrencyWhile(async () => {
          this.count = await ctx.storage.get("count") || this.count
      })
  }

  async increment() {
      this.count++
      await this.ctx.storage.put("count", this.count)
  }

  async getCount() {
      return this.count
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
    const hashes = await this.ctx.storage.get<string[]>("hashes") || [];

    if (hashes.includes(hash)) {
      console.log(`Item with hash ${hash} already exists, skipping...`);
      return false;
    }

    hashes.push(hash);
    await this.ctx.storage.put("hashes", hashes);
    await this.ctx.storage.put(`item:${hash}`, item);
    console.log(`Added item with hash ${hash} to storage`);
    return true;
  }

  async parseRSSFeed() {
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
          newItems.push(item);
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