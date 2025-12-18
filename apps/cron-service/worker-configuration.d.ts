/* eslint-disable */
// Minimal type definitions for cron-service
interface ScheduledController {
    readonly scheduledTime: number;
    readonly cron: string;
    noRetry(): void;
}

interface ExecutionContext {
    waitUntil(promise: Promise<any>): void;
    passThroughOnException(): void;
}

declare namespace Cloudflare {
    interface Env {
        AFTONBLADET_FEED_DO: DurableObjectNamespace<any>;
        DATA_SERVICE: Fetcher;
    }
}

interface BaseEnv extends Cloudflare.Env {}
