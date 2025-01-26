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

        const afterSubmit = (context) => {
            const TITLE = `${MODULE}.AfterSubmit`;

            setAltName(context);
            moveFiles(context);
        };

        const moveFiles = (context) => {
            const TITLE = `${MODULE}.MoveFiles`;
            let { newRecord } = context;
        };

        const setAltName = (context) => {
            const TITLE = `${MODULE}.SetAltName`;
            const FIELDS = SS_Constants.Transaction.Fields;
            let { newRecord, type } = context;

            if (type !== context.UserEventType.CREATE) { return; }
            
            let updateValues = {};
            updateValues[FIELDS.ALT_NAME] = newRecord.id;

            SS_Record.submitFields({
                type: SS_Constants.CustomRecords.VendorRequest.Id,
                id: newRecord.id,
                values: updateValues
            });
        };

        return { afterSubmit };
    }
);