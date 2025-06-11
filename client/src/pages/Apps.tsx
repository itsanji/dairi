import React from "react";
import { useNavigate } from "react-router-dom";

interface AppCard {
    id: string;
    title: string;
    description: string;
    icon: string;
    route: string;
}

const apps: AppCard[] = [
    {
        id: "exchange-rate",
        title: "Exchange Rate",
        description: "Real-time currency exchange rates with configurable currency pairs",
        icon: "💱",
        route: "/exchange-rate",
    },
    // More apps will be added here later
];

const Apps: React.FC = () => {
    const navigate = useNavigate();

    return (
        <div className="p-4">
            <h1 className="text-4xl font-bold mb-6">Applications</h1>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {apps.map((app) => (
                    <div
                        key={app.id}
                        className="card bg-base-100 shadow-xl hover:shadow-2xl transition-shadow cursor-pointer"
                        onClick={() => navigate(app.route)}
                    >
                        <div className="card-body">
                            <div className="flex items-center gap-3 mb-3">
                                <span className="text-3xl">{app.icon}</span>
                                <h2 className="card-title">{app.title}</h2>
                            </div>
                            <p>{app.description}</p>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default Apps;
