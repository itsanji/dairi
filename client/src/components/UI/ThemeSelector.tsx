import React, { useContext } from "react";
import { GlobalContext } from "../../contexts/globalContext";
import { constants } from "../../utils/constants";

interface ThemeSelectorProps {
    children?: React.ReactNode;
}

const ThemeSelector: React.FC<ThemeSelectorProps> = ({}) => {
    const globalContext = useContext(GlobalContext);
    return (
        <>
            <details className="dropdown">
                <summary className="mx-1 btn">{globalContext.theme} ⇓</summary>
                <ul className="p-2 shadow menu dropdown-content z-[1] bg-base-100 rounded-box w-52">
                    {constants.selectableThemes.map((theme, index) => (
                        <li
                            key={index}
                            onClick={() => {
                                globalContext.updateTheme(theme);
                            }}
                        >
                            <div>{theme}</div>
                        </li>
                    ))}
                </ul>
            </details>
        </>
    );
};
export default ThemeSelector;
