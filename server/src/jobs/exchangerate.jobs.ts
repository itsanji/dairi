import Elysia, { t, type InferContext } from "elysia";
import { jobEntry } from "./index.job";
import { Cron } from "croner";
import { redisClient } from "../utils/redis";


/**
 * Job Desc: Get latest exchange rate and save to redis
 * base currency: (Redis) idx:exchange:base default yen
 * target currency: (Redis) idx:exchange:target default usd
 */
const getExchangeRateJob = new Cron('0 * * * *', async () => {
	let base: string = "USD";
	let target: string = "JPY";
	const exchangeSetting = await redisClient.get('exchange')

	if (exchangeSetting) {
		const tempSettings = JSON.parse(exchangeSetting)
		base = tempSettings.base;
		target = tempSettings.target;
	}

	const resp = await fetch(`${Bun.env.EXCHANGE_RATE_ENDPOINT}/${Bun.env.EXCHANGE_RATE_API_KEY}/pair/${base}/${target}`).then(res => res.json());

	// updating to redis
	redisClient.set("exchange", JSON.stringify({
		base,
		target,
		price: resp.conversion_rate
	}))
})

const exchangeRate = new Elysia({name: 'exchange-rate'})
	.get("/exchange-rate", (_context: InferContext<typeof jobEntry>) => {
		return {hello: "world"}
	})

export {getExchangeRateJob, exchangeRate}