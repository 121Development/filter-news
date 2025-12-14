export default {
    async fetch(request: Request, env: any, ctx: ExecutionContext) {
        console.log("Hello from the categoriser!");
        return new Response("Hello from the categoriser!");
    }
}