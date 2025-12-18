interface Env {
    //NEW_ITEMS_QUEUE: Queue<NewItemMessage>;
    AFTONBLADET_FEED_DO: DurableObjectNamespace;
  }

  import { WorkerEntrypoint } from 'cloudflare:workers';
  import { App } from './hono/app';
  //import { initDatabase } from '../../../packages/data-ops/src/database/db';
  
  export default class DataService extends WorkerEntrypoint<Env> {
	  
	  fetch(request: Request) {
		  return App.fetch(request, this.env, this.ctx)
	  }
    async queue(batch: MessageBatch<unknown>): Promise<void> {
      for (const message of batch.messages) {
        console.log('Received', message);
      }
    }
}
  
  export { AftonbladetFeedDurableObject} from "@/durable-objects/aftonbladet-feed-do";