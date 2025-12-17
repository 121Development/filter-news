export default {
    async fetch(request: Request, env: any, ctx: ExecutionContext) {
        console.log("Hello from the event builder!");
        return new Response("Hello from the event builder!");
    }
}