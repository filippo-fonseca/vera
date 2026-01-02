import React from "react";
import {
    Calendar as CalendarIcon,
    FolderKanban,
    List as ListIcon,
    ScatterChart,
    TrendingUp,
} from "lucide-react";
import { cn } from "@BetterBac/lib/utils";
import { Dock, DockIcon } from "@BetterBac/components/common/Dock";
import { useAssignmentsTabStore } from "@BetterBac/state/CourseView/AssignmentsTab.store";
import {
    AssignmentsTabState,
    GradesTabState,
} from "@BetterBac/lib/GlobalTypes";
import { useGeneralStore } from "@BetterBac/state/General.store";
import { useGradesTabStore } from "@BetterBac/state/CourseView/GradesTab.store";
import { observer } from "mobx-react";

export type IconProps = React.HTMLAttributes<SVGElement>;
const ViewSwitcher = () => {
    const gradesTabStore = useGradesTabStore();

    const DATA = {
        navbar: [
            {
                onClick: () =>
                    gradesTabStore.setGradesTabState(GradesTabState.TREND),
                icon: TrendingUp,
                label: "Trend",
                isActive: gradesTabStore.gradesTabState == GradesTabState.TREND,
            },
            {
                onClick: () =>
                    gradesTabStore.setGradesTabState(
                        GradesTabState.GRADE_DENSITY
                    ),
                icon: ScatterChart,
                label: "Grade Density",
                isActive:
                    gradesTabStore.gradesTabState ==
                    GradesTabState.GRADE_DENSITY,
            },
        ],
    };

    return (
        <Dock direction="middle">
            {DATA.navbar.map(item => (
                <DockIcon key={item.label}>
                    <div
                        onClick={item.onClick}
                        className={cn(
                            "rounded-lg p-2",
                            item.isActive ? "bg-gray-200" : "bg-transparent"
                        )}
                    >
                        <item.icon className="size-4" />
                    </div>
                </DockIcon>
            ))}
        </Dock>
    );
};

export default observer(ViewSwitcher);
