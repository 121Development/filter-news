export default {
    async fetch(request: Request, env: any, ctx: ExecutionContext) {
        console.log("Hello from the summariser!");
        return new Response("Hello from the summariser!");
    }
}