export default {
    async scheduled(_: ScheduledController, env: any, ctx: ExecutionContext) {

        const aftonbladetFeedDO = env.AFTONBLADET_FEED_DO.getByName("AftonbladetFeedDurableObject");
        if (!aftonbladetFeedDO) {
            throw new Error("Aftonbladet feed DO not found");
        }
        await aftonbladetFeedDO.parseRSSFeed();
        console.log("[CRON PARSE RSS FEED] ");
    },
};

export { AftonbladetFeedDurableObject} from "@/durable-objects/aftonbladet-feed-do"

//async fetch(req, env): Promise<Response> {
//    return new Response("Todo");
// } satisfies ExportedHandler<Env>;