import { WorkerEntrypoint } from "cloudflare:workers";

  export default class ParserWorker extends WorkerEntrypoint<Env> {
    constructor(ctx: ExecutionContext, env: Env) {
        super(ctx, env);
    }

    fetch(request: Request) {
        console.log("Hello from the parser!");
        return new Response("Hello from the parser!");
    }

  }