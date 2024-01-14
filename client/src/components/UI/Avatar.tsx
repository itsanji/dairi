import { minidenticon } from "minidenticons";
import React, { CSSProperties, useMemo } from "react";

interface MinidenticonImgProps {
    username: string;
    saturation?: string;
    lightness?: string;
    style?: CSSProperties;
    className?: string;
    onClick?: () => void;
}

const MinidenticonImg: React.FC<MinidenticonImgProps> = ({ username, saturation, lightness, ...props }) => {
    const svgURI = useMemo(
        () => "data:image/svg+xml;utf8," + encodeURIComponent(minidenticon(username, saturation, lightness)),
        [username, saturation, lightness]
    );
    return <img src={svgURI} alt={username} {...props} />;
};

export default MinidenticonImg;
