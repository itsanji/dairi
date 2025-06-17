import { Cron } from "croner";
import { redisClient } from "../utils/redis";

interface ExchangeRateResponse {
    result: string;
    documentation: string;
    terms_of_use: string;
    time_last_update_unix: number;
    time_last_update_utc: string;
    time_next_update_unix: number;
    time_next_update_utc: string;
    base_code: string;
    target_code: string;
    conversion_rate: number;
}

interface ExchangeRateData {
    base: string;
    target: string;
    rate: number;
    lastUpdated: string;
    nextUpdate: string;
}

async function updateExchangeRate() {
    try {
        let base: string = "USD";
        let target: string = "JPY";
        const exchangeSetting = await redisClient.get("exchange:settings");

        if (exchangeSetting) {
            const tempSettings = JSON.parse(exchangeSetting);
            base = tempSettings.base;
            target = tempSettings.target;
        }

        // Save settings back to Redis in case they were defaults
        await redisClient.set(
            "exchange:settings",
            JSON.stringify({
                base,
                target,
            })
        );

        // Fetch the latest exchange rate
        const response = await fetch(`${process.env.EXCHANGE_RATE_ENDPOINT}/${process.env.EXCHANGE_RATE_API_KEY}/pair/${base}/${target}`);

        if (!response.ok) {
            throw new Error(`API responded with status: ${response.status}`);
        }

        const data = (await response.json()) as ExchangeRateResponse;

        // Format and save data to Redis
        const exchangeData: ExchangeRateData = {
            base: data.base_code,
            target: data.target_code,
            rate: data.conversion_rate,
            lastUpdated: data.time_last_update_utc,
            nextUpdate: data.time_next_update_utc,
        };

        // Store the exchange rate data with TTL of 2 hours (longer than job interval)
        await redisClient.setEx("exchange:rate", 7200, JSON.stringify(exchangeData));

        console.log(`Exchange rate updated: 1 ${base} = ${data.conversion_rate} ${target}`);
        return exchangeData;
    } catch (error) {
        console.error("Error fetching exchange rate:", error);
        throw error;
    }
}

/**
 * Job: Get latest exchange rate and save to redis
 * Schedule: Runs at minute 0 of every hour
 * Action: Fetches exchange rate from API and saves to Redis
 */
export const exchangeRateJob = new Cron("0 * * * *", updateExchangeRate);

export { updateExchangeRate };
