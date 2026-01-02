import { useGeneralStore } from "@BetterBac/state/General.store";
import { observer } from "mobx-react";

const SchoolHome = () => {
    const generalStore = useGeneralStore();
    return (
        <>
            <h2 className="text-xl font-bold mb-4">
                {generalStore.activeSchoolDashboardState}
                <br />
                maybe include some stats here or something for home page
            </h2>
        </>
    );
};

export default observer(SchoolHome);
