/**
 * @NApiVersion     2.1
 * @NScriptType     WorkflowActionScript
 * @NModuleScope    SameAccount
 */

define(
    [
        '../common/SS_Constants',
        '../common/SS_Search'
    ],
    (
        SS_Constants,
        SS_Search
    ) => {
        const MODULE = `SS.WA.VendorOnboarding.CheckDuplicates`;
        const VENDOR_REQUEST = SS_Constants.CustomRecords.VendorRequest;
        const FIELDS = VENDOR_REQUEST.Fields;

        const hasDuplicates = (options) => {
            const TITLE = `${MODULE}.HasDuplicates`;
            let { emails } = options;
            let output = false;

            if (emails.length <= 0) { return output; }

            let filters = [];
            emails.forEach(email => {
                filters.push([
                    [ 'email', 'is', email ],
                    'OR',
                    [ FIELDS.PURCHASING_CONTACT_EMAIL, 'is', email ]
                ]);
                filters.push('OR');
            });
            filters.pop();

            let requestSearch = SS_Search.create({
                type: VENDOR_REQUEST.Id,
                filters
            });
            let requestResults = requestSearch.getJSON();
            log.debug({ title: TITLE, details: requestResults.length });
            return requestResults.length > 0;
        };

        return {
            onAction: (context) => {
                const TITLE = `${MODULE}.Action`;
                let { newRecord } = context;
                let emails = [];

                let email = newRecord.getValue({ fieldId: 'email' });
                if (email) { emails.push(email); }

                email = newRecord.getValue({ fieldId: FIELDS.PURCHASING_CONTACT_EMAIL });
                if (email) { emails.push(email); }

                if (emails.length <= 0) { return false; }
                
                return hasDuplicates({ emails });
            }
        };
    }
);