import { observer } from "mobx-react";
import React, { useEffect, useState } from "react";
import classNames from "classnames";
import { CircleCheck, CircleX } from "lucide-react";

type ToastProps = {
    text: string;
    isVisible: boolean;
    duration?: number;
    isSuccessToast?: boolean;
};

const Toast = ({
    text,
    isVisible,
    duration = 3000,
    isSuccessToast,
}: ToastProps) => {
    const [show, setShow] = useState(isVisible);
    const [render, setRender] = useState(isVisible);

    useEffect(() => {
        let timer: NodeJS.Timeout;
        if (isVisible) {
            setRender(true);
            setShow(true);
            timer = setTimeout(() => {
                setShow(false);
            }, duration);
        } else {
            setShow(false);
        }

        return () => clearTimeout(timer);
    }, [isVisible, duration]);

    useEffect(() => {
        if (!show) {
            const timer = setTimeout(() => {
                setRender(false);
            }, 500); // Match this duration with the swipeOutRight animation duration
            return () => clearTimeout(timer);
        }
    }, [show]);

    if (!render) return null;

    return (
        <div
            className={classNames(
                "max-w-fit absolute right-4 top-4 bg-white z-[999] border border-gray-200 rounded-xl shadow-lg",
                show ? "animate-swipeInRight" : "animate-swipeOutRight",
                "transition-transform"
            )}
            role="alert"
        >
            <div className="flex p-4 items-center">
                <div className="flex-shrink-0 flex">
                    {isSuccessToast ? (
                        <CircleCheck size={16} className="stroke-green-500" />
                    ) : (
                        <CircleX size={16} className="stroke-red-500" />
                    )}
                </div>
                <div className="ms-3">
                    <p className="text-sm text-gray-700">{text}</p>
                </div>
            </div>
        </div>
    );
};

export default observer(Toast);
