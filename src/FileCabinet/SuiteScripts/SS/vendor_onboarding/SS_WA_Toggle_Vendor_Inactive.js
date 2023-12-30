/**
 * @NApiVersion     2.1
 * @NScriptType     WorkflowActionScript
 * @NModuleScope    SameAccount
 */

define(
    [
        '../common/SS_Constants',
        '../common/SS_Record'
    ],
    (
        SS_Constants,
        SS_Record
    ) => {
        const MODULE = `SS.WA|VendorOnboarding.ToggleVendorInactive`;
        const VENDOR_REQUEST = SS_Constants.CustomRecords.VendorRequest;
        const REQUEST_FIELDS = VENDOR_REQUEST.Fields;

        const onAction = (context) => {
            const TITLE = `${MODULE}.Action`;
            let { newRecord } = context;
            let linkToVendor = newRecord.getValue({ fieldId: 'custrecord_vr_link_vendor' });
            if (!linkToVendor) {
                return;
            }

            let vendorRequest = SS_Record.load({
                type: VENDOR_REQUEST.Id,
                id: newRecord.id,
                isDynamic: true
            });
        };

        return { onAction };
    }
);