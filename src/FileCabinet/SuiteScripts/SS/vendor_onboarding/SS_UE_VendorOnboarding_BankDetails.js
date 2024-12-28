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
        const MODULE = `SS.UE.VendorOnboarding.BankDetails`;

        const createBankDetails = (options) => {
            const TITLE = `${MODULE}.CreateBankDetails`;
            let { record } = options;

            // Create bank details record...
        };

        const validate = (options) => {
            const TITLE = `${MODULE}.Validate`;
            let { newRecord, type } = options;

            if ([
                options.UserEventType.CREATE
            ].indexOf(type) < 0) {
                log.audit({ title: TITLE, details: `Invalid event type (${type}). Exiting...` });
                return false;
            }

            // Add 'false' conditions here...

            return true;
        };

        return {
            afterSubmit: (context) => {
                const TITLE = `${MODULE}.AfterSubmit`;
                let { newRecord, type } = context;

                if (validate(context) === false) { return; }

                createBankDetails({ record: newRecord });
            }
        };
    }
);