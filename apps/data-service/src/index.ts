interface Env {
//    NEW_ITEMS_QUEUE: Queue;
    AFTONBLADET_FEED_DO: DurableObjectNamespace;
  }

  import { WorkerEntrypoint } from 'cloudflare:workers';
  import { App } from './hono/app';
  //import { initDatabase } from '../../../packages/data-ops/src/database/db';
  
  export default class DataService extends WorkerEntrypoint<Env> {
	  
	  fetch(request: Request) {
		  return App.fetch(request, this.env, this.ctx)
	  }
  
}
  
  export { AftonbladetFeedDurableObject} from "@/durable-objects/aftonbladet-feed-do";