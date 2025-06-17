import React, { useContext, useEffect, useState } from "react";
import { GlobalContext } from "../contexts/globalContext";
import { api } from "../utils/constants";
import { toast } from "react-toastify";

interface ExchangeRate {
	base: string;
	target: string;
	rate: number;
	lastUpdated: string;
	nextUpdate: string;
}

interface Settings {
	base: string;
	target: string;
}

const ExchangeRate: React.FC = () => {
	const globalContext = useContext(GlobalContext);
	const [rate, setRate] = useState<ExchangeRate | null>(null);
	const [settings, setSettings] = useState<Settings>({
		base: "USD",
		target: "JPY"
	});
	const [loading, setLoading] = useState(true);
	const [updating, setUpdating] = useState(false);

	// Common currency codes
	const currencies = [
		"USD", "EUR", "GBP", "JPY", "AUD", "CAD", "CHF", "CNY", "INR", "SGD",
		"THB", "MYR", "IDR", "PHP", "VND", "KRW", "NZD", "HKD", "TWD", "BRL"
	];

	const fetchSettings = async () => {
		try {
			const { data } = await globalContext.fetch.get(api().jobs.exchangeRate);
			if (data.success && data.data) {
				setSettings({
					base: data.data.base,
					target: data.data.target
				});
			}
		} catch (error) {
			console.error("Error fetching settings:", error);
		}
	};

	const fetchRate = async () => {
		try {
			const { data } = await globalContext.fetch.post(api().jobs.exchangeRateUpdate);
			if (!data.success) {
				toast.error(data.error);
				return;
			}
			setRate(data.data);
			toast.success("Exchange rate updated successfully");
		} catch (error) {
			toast.error("Failed to fetch exchange rate");
			console.error(error);
		} finally {
			setLoading(false);
		}
	};

	const updateSettings = async () => {
		setUpdating(true);
		try {
			const { data } = await globalContext.fetch.put(api().jobs.exchangeRateSettings, settings);
			if (!data.success) {
				toast.error(data.error);
				return;
			}
			toast.success("Settings updated successfully");
			fetchRate(); // Refresh rate with new settings
		} catch (error) {
			toast.error("Failed to update settings");
			console.error(error);
		} finally {
			setUpdating(false);
		}
	};

	useEffect(() => {
		fetchSettings();
		fetchRate();
		// Refresh rate every minute
		const interval = setInterval(fetchRate, 60000);
		return () => clearInterval(interval);
	}, []);

	if (loading) {
		return <div className="flex justify-center items-center h-64"><span className="loading loading-spinner loading-lg"></span></div>;
	}

	return (
		<div className="p-4">
			<div className="max-w-4xl mx-auto">
				<h1 className="text-4xl font-bold mb-8">Exchange Rate Monitor</h1>

				{/* Settings Card */}
				<div className="card bg-base-100 shadow-xl mb-8">
					<div className="card-body">
						<h2 className="card-title">Currency Pair Settings</h2>
						<div className="grid grid-cols-1 md:grid-cols-2 gap-4">
							<div className="form-control">
								<label className="label">
									<span className="label-text">Base Currency</span>
								</label>
								<select
									className="select select-bordered w-full"
									value={settings.base}
									onChange={(e) => setSettings({ ...settings, base: e.target.value })}
								>
									{currencies.map(currency => (
										<option key={currency} value={currency}>{currency}</option>
									))}
								</select>
							</div>
							<div className="form-control">
								<label className="label">
									<span className="label-text">Target Currency</span>
								</label>
								<select
									className="select select-bordered w-full"
									value={settings.target}
									onChange={(e) => setSettings({ ...settings, target: e.target.value })}
								>
									{currencies.map(currency => (
										<option key={currency} value={currency}>{currency}</option>
									))}
								</select>
							</div>
						</div>
						<div className="card-actions justify-end mt-4">
							<button
								className="btn btn-primary"
								onClick={updateSettings}
								disabled={updating}
							>
								{updating ? <span className="loading loading-spinner"></span> : "Update Settings"}
							</button>
						</div>
					</div>
				</div>

				{/* Rate Display Card */}
				{rate && (
					<div className="card bg-base-100 shadow-xl">
						<div className="card-body">
							<div className="flex justify-between items-center">
								<h2 className="card-title">Current Exchange Rate</h2>
								<button
									className="btn btn-primary btn-sm"
									onClick={fetchRate}
									disabled={loading}
								>
									{loading ? (
										<>
											<span className="loading loading-spinner loading-xs"></span>
											Updating...
										</>
									) : (
										<>
											<svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
												<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
											</svg>
											Update Now
										</>
									)}
								</button>
							</div>
							<div className="stats shadow">
								<div className="stat">
									<div className="stat-title">Rate</div>
									<div className="stat-value text-primary">{rate.rate.toFixed(4)}</div>
									<div className="stat-desc">
										{rate.base} to {rate.target}
									</div>
								</div>
								<div className="stat">
									<div className="stat-title">Last Updated</div>
									<div className="stat-value text-secondary text-2xl">
										{new Date(rate.lastUpdated).toLocaleTimeString()}
									</div>
									<div className="stat-desc">
										Next update: {new Date(rate.nextUpdate).toLocaleTimeString()}
									</div>
								</div>
							</div>
						</div>
					</div>
				)}
			</div>
		</div>
	);
};

export default ExchangeRate; 