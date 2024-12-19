/**
 * @NApiVersion     2.1
 * @NScriptType     WorkflowActionScript
 * @NModuleScope    SameAccount
 */

define(
    [
        '../common/SS_Constants',
        '../common/SS_Record',
        '../common/SS_Search'
    ],
    (
        SS_Constants,
        SS_Record,
        SS_Search
    ) => {
        const MODULE = `SS.WA.VendorOnboarding.CheckDuplicates`;
        const VENDOR_REQUEST = SS_Constants.CustomRecords.VendorRequest;
        const FIELDS = VENDOR_REQUEST.Fields;

        return {
            onAction: (context) => {
                const TITLE = `${MODULE}.Action`;
                let { newRecord } = context;
                let emails = [];

                let email = newRecord.getValue({ fieldId: 'email' });
                if (email) { emails.push(email); }

                email = newRecord.getValue({ fieldId: FIELDS.PURCHASING_CONTACT_EMAIL });
                if (email) { emails.push(email); }
                
                let hasDuplicates = searchDuplicates({ emails });
            }
        };
    }
);