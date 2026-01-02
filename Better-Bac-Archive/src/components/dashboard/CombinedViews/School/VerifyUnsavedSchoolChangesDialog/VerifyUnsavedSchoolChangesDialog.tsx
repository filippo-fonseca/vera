import CustomAlertDialog from "@BetterBac/components/common/CustomAlertDialog";
import { useSchoolStore } from "@BetterBac/state/Admin/School.store";
import { observer } from "mobx-react";
import React from "react";

const VerifyUnsavedSchoolChangesDialog = () => {
    const schoolStore = useSchoolStore();
    return (
        <CustomAlertDialog
            open={schoolStore.isVerifyUnsavedChangesDialogOpen}
            onCancelClick={() =>
                schoolStore.setIsVerifyUnsavedChangesDialogOpen(false)
            }
            onConfirmClick={() => {
                schoolStore.pendingOnClick();
                schoolStore.resetAll();
            }}
        />
    );
};

export default observer(VerifyUnsavedSchoolChangesDialog);
