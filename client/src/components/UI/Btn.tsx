import React, { CSSProperties } from "react";

interface BtnProps {
    children?: React.ReactNode;
    style?: CSSProperties;
    className?: string;
    onClick?: (args: any) => void;
}

const Btn: React.FC<BtnProps> = ({ children, style, className, onClick }) => {
    return (
        <button onClick={onClick} style={style} className={"btn btn-outline" + (className || "")}>
            {children}
        </button>
    );
};
export default Btn;
