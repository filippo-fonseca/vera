import React from "react";
import { Calendar as CalendarIcon, List as ListIcon } from "lucide-react";
import { cn } from "@BetterBac/lib/utils";
import { Dock, DockIcon } from "@BetterBac/components/common/Dock";
import { useAssignmentsTabStore } from "@BetterBac/state/CourseView/AssignmentsTab.store";
import { AssignmentsTabState } from "@BetterBac/lib/GlobalTypes";

export type IconProps = React.HTMLAttributes<SVGElement>;

export default function ViewSwitcher() {
    const assignmentsTabStore = useAssignmentsTabStore();

    const DATA = {
        navbar: [
            {
                onClick: () =>
                    assignmentsTabStore.setAssignmentsTabState(
                        AssignmentsTabState.CALENDAR_VIEW
                    ),
                icon: CalendarIcon,
                label: "Calendar View",
                isActive:
                    assignmentsTabStore.assignmentsTabState ==
                    AssignmentsTabState.CALENDAR_VIEW,
            },
            {
                onClick: () =>
                    assignmentsTabStore.setAssignmentsTabState(
                        AssignmentsTabState.LIST_VIEW
                    ),
                icon: ListIcon,
                label: "List View",
                isActive:
                    assignmentsTabStore.assignmentsTabState ==
                    AssignmentsTabState.LIST_VIEW,
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
}
