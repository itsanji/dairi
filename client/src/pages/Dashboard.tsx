import React, { useContext, useEffect, useState } from "react";
import { api } from "../utils/constants";
import { GlobalContext } from "../contexts/globalContext";
import { SysInfo } from "../types/sysInfo";
import SystemInfo from "../components/Apps/SystemInfo";

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
    </div>;
};

export default Dashboard;
