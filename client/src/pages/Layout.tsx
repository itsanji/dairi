import React from "react";
import { Outlet } from "react-router-dom";

const Layout: React.FC = () => {
    return (
        <>
            <div>Layout</div>
            <Outlet />
        </>
    );
};

export default Layout;
