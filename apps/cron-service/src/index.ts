import { WorkerEntrypoint } from 'cloudflare:workers';
import { AftonbladetFeedDurableObject } from "../durable-objects/aftonbladet-feed-do";

interface Env {
    //NEW_ITEMS_QUEUE: Queue<NewItemMessage>;
    AFTONBLADET_FEED_DO: DurableObjectNamespace<AftonbladetFeedDurableObject>;
  }

export default class CronService extends WorkerEntrypoint<Env> {

    async scheduled(controller: ScheduledController) {

        const aftonbladetFeedDO = this.env.AFTONBLADET_FEED_DO.getByName("AftonbladetFeedDurableObject");
        if (!aftonbladetFeedDO) {
            throw new Error("Aftonbladet feed DO not found");
        }
        await aftonbladetFeedDO.parseRSSFeed();
        console.log("[CRON PARSE RSS FEED] ");
    }

    async queue(batch: MessageBatch<unknown>): Promise<void> {
        for (const message of batch.messages) {
        console.log('Received', message);
        }
  }
}

export { AftonbladetFeedDurableObject } from "../durable-objects/aftonbladet-feed-do"