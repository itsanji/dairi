import React, { useContext, useEffect, useState } from "react";
import { api } from "../utils/constants";
import { GlobalContext } from "../contexts/globalContext";
import { SysInfo } from "../types/sysInfo";
import SystemInfo from "../components/Apps/SystemInfo";
import { AxiosInstance } from "axios";

const tools = [{
    name: "Run server scripts", function: async (fetch: AxiosInstance) => {
        console.log("start function", api().tools.script);
        try {
            const response = await fetch.get(api().tools.script);
            console.log(response.data);
        } catch (error) {
            console.error("Error running script:", error);
        }
    }
}]

const Dashboard: React.FC = () => {
    const globalContext = useContext(GlobalContext);
    const [fetched, setIsFetched] = useState(false);
    const [sysInfo, setSysInfo] = useState<SysInfo | null>(null);

    useEffect(() => {
        if (globalContext && globalContext.isLogged && !fetched) {
            globalContext.fetch.get(api().server.info)
                .then(data => {
                    console.log(data.data)
                    setSysInfo(data.data.sysInfo);
                })
            setIsFetched(true)
        }
    }, [globalContext])

    return <div>
        <h1 className="text-xl font-medium">Dash Board</h1>
        {sysInfo && <SystemInfo sysInfo={sysInfo} />}
        {globalContext.isLogged && (
            <div tabIndex={0} className="collapse collapse-open border-base-300 bg-base-200 border m-1">
                <div className="collapse-title text-xl font-medium">Quick Tools</div>
                <div className="px-4">
                    {tools.map((tool, index) => {
                        return (
                            <button key={index} className="btn btn-neutral w-44 m-1" onClick={() => tool.function(globalContext.fetch)}>
                                {tool.name}
                            </button>
                        )
                    })}

                </div>
            </div>
        )}

    </div>;
};

export default Dashboard;
