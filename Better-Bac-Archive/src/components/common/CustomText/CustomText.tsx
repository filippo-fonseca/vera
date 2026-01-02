import React from "react";
import { FadeText, FadeTextProps } from "./FadeText";

const CustomText = (props: FadeTextProps) => {
    return (
        <FadeText
            className={props.className}
            style={props.style}
            direction={props.direction ?? "up"}
            framerProps={{
                show: { transition: { delay: 0.2 } },
            }}
        >
            {props.children}
        </FadeText>
    );
};

export default CustomText;
