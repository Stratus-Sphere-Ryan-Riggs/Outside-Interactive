/**
 * @NApiVersion     2.1
 * @NScriptType     UserEventScript
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
        const MODULE = `SS.UE|VendorRequest`;

        const setAltName = (context) => {
            const TITLE = `${MODULE}.SetAltName`;
            const FIELDS = SS_Constants.Transaction.Fields;
            let { newRecord, type } = context;

            if ([
                context.UserEventType.CREATE,
                context.UserEventType.EDIT
            ].indexOf(type) < 0) {
                log.audit({ title: TITLE, details: `Invalid view (${type}). Exiting...` });
                return;
            }
            
            let updateValues = {};
            updateValues[FIELDS.ALT_NAME] = newRecord.id;

            SS_Record.submitFields({
                type: SS_Constants.CustomRecords.VendorRequest.Id,
                id: newRecord.id,
                values: updateValues
            });
            log.audit({ title: TITLE, details: `Successfully updated record ${newRecord.id}.` });
        };

        return {
            afterSubmit: (context) => {
                setAltName(context);
            }
        };
    }
);