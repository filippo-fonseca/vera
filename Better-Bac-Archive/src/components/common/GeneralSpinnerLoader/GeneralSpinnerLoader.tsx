import React from "react";

const GeneralSpinnerLoader = () => {
    return (
        <div className="flex items-center justify-center h-64">
            <div className="animate-spin rounded-full h-6 w-6 border-t-2 border-r-2 border-pink-500"></div>
        </div>
    );
};

export default GeneralSpinnerLoader;
