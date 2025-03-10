import { Cron } from "croner";
import Elysia from "elysia";
import { exchangeRate, getExchangeRateJob } from "./exchangerate.jobs";

// jobs entry
export const jobEntry = new Elysia({
    name: "jobs-entry",
    prefix: "/jobs"
})
    .state("cron-jobs", () => [getExchangeRateJob] as Cron[])
    .use(exchangeRate);
