export default {
    async scheduled(_: ScheduledController, env: any, ctx: ExecutionContext) {
        const now = new Date().toISOString();
        console.log("[CRON HELLO]", now);
  }
};