import { observer } from "mobx-react";
import React from "react";
import StudentList from "./StudentList";

const ClassDirectory = () => {
    return (
        <div
            className={`flex-1 h-full flex items-center flex-col w-full p-6 bg-white border rounded-xl shadow-md`}
        >
            <StudentList />
        </div>
    );
};

export default observer(ClassDirectory);
