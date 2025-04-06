import React, { useContext, useEffect, useState } from "react";
import { api } from "../utils/constants";
import { GlobalContext } from "../contexts/globalContext";
import { SysInfo } from "../types/sysInfo";
import SystemInfo from "../components/Apps/SystemInfo";

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
            const response = await globalContext.fetch.get(api().exchangeGroup.exchangeRate);
            if (response.data.success) {
                setExchangeRate(response.data.data);
                setLastUpdated(new Date().toLocaleTimeString());
            } else {
                console.error("Failed to fetch exchange rate:", response.data.message);
            }
        } catch (error) {
            console.error("Error fetching exchange rate:", error);
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
            <h2 className="text-lg font-medium mb-4">Exchange Rate</h2>

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
