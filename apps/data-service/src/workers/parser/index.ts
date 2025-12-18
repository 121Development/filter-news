interface Env {
        NEW_ITEMS_QUEUE: Queue;
      }

import { WorkerEntrypoint } from "cloudflare:workers";

  export default class ParserWorker extends WorkerEntrypoint<Env> {
    constructor(ctx: ExecutionContext, env: Env) {
        super(ctx, env);
    }

    fetch(request: Request) {
        console.log("Hello from the parser!");
        return new Response("Hello from the parser!");
    }

    queue(batch: MessageBatch<unknown>): void | Promise<void> {
        for (const message of batch.messages) {
          console.log('Received', message);
        }
      }
    }