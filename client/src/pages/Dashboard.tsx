import React, { useContext, useEffect, useState } from "react";
import { api } from "../utils/constants";
import { GlobalContext } from "../contexts/globalContext";
import { SysInfo } from "../types/sysInfo";
import SystemInfo from "../components/Apps/SystemInfo";
import { toast } from "react-toastify";

interface ExchangeRateData {
    base: string;
    target: string;
    rate: number;
    lastUpdated: string;
    nextUpdate: string;
}

const Dashboard: React.FC = () => {
    const globalContext = useContext(GlobalContext);
    const [fetched, setIsFetched] = useState(false);
    const [sysInfo, setSysInfo] = useState<SysInfo | null>(null);
    const [exchangeRate, setExchangeRate] = useState<ExchangeRateData | null>(null);
    const [loading, setLoading] = useState(false);
    const [lastUpdated, setLastUpdated] = useState<string>("");

    // getting system info
    useEffect(() => {
        if (globalContext && globalContext.isLogged && !fetched) {
            globalContext.fetch.get(api().server.info)
                .then(({ data }) => {
                    setSysInfo(data.data.sysInfo);
                })
            setIsFetched(true)
        }
    }, [globalContext])

    //get exchange rate
    const fetchExchangeRate = async () => {
        setLoading(true);
        try {
            const response = await globalContext.fetch.get(api().jobs.exchangeRate);
            if (response.data.success) {
                setExchangeRate(response.data.data);
                setLastUpdated(new Date().toLocaleTimeString());
                toast.success("Exchange rate updated successfully");
            } else {
                console.error("Failed to fetch exchange rate:", response.data.message);
                toast.error(response.data.message || "Failed to fetch exchange rate");
            }
        } catch (error) {
            console.error("Error fetching exchange rate:", error);
            toast.error("Error fetching exchange rate");
        } finally {
            setLoading(false);
        }
    };

    // Fetch exchange rate on component mount and every 5 minutes
    useEffect(() => {
        if (globalContext && globalContext.isLogged) {
            // Initial fetch
            fetchExchangeRate();

            // Set up interval for every 5 minutes (300000 ms)
            const intervalId = setInterval(() => {
                fetchExchangeRate();
            }, 300000);

            // Clean up interval on component unmount
            return () => clearInterval(intervalId);
        }
    }, [globalContext?.isLogged]);

    return <div>
        <h1 className="text-xl font-medium">Dash Board</h1>
        {sysInfo && <SystemInfo sysInfo={sysInfo} />}

        <div className="mt-8">
            <div className="flex justify-between items-center mb-4">
                <h2 className="text-lg font-medium">Exchange Rate</h2>
                <button
                    className="btn btn-primary btn-sm"
                    onClick={fetchExchangeRate}
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

            {loading && !exchangeRate && (
                <div className="flex items-center">
                    <div className="loading loading-spinner loading-md mr-2"></div>
                    <span>Loading exchange rate data...</span>
                </div>
            )}

            {exchangeRate && (
                <div className="p-4 border rounded-md shadow-sm">
                    <div className="flex justify-between items-center">
                        <p className="font-bold text-xl">
                            1 {exchangeRate.base} = {exchangeRate.rate} {exchangeRate.target}
                        </p>
                        {loading && (
                            <div className="loading loading-spinner loading-sm"></div>
                        )}
                    </div>
                    <div className="text-sm text-gray-500 mt-2">
                        <p>Last updated: {exchangeRate.lastUpdated}</p>
                        <p>Next update: {exchangeRate.nextUpdate}</p>
                        {lastUpdated && (
                            <p className="text-xs mt-1">
                                Frontend refresh: {lastUpdated}
                                (auto-updates every 5 minutes)
                            </p>
                        )}
                    </div>
                </div>
            )}
        </div>
    </div>;
};

export default Dashboard;
