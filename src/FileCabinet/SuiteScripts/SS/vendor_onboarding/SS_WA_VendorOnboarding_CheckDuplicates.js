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
            let { emails, fieldId, type } = options;
            let output = false;
            log.debug({ title: TITLE, details: JSON.stringify(options) });

            if (emails.length <= 0) { return output; }

            let filters = [];
            emails.forEach(email => {
                filters.push([
                    // [ 'email', 'is', email ],
                    // 'OR',
                    [ fieldId, 'is', email ]
                ]);
                filters.push('OR');
            });
            filters.pop();

            let requestSearch = SS_Search.create({ type, filters });
            let requestResults = requestSearch.getResults();
            log.debug({ title: TITLE, details: requestResults.length });
            return requestResults.length > 0;
        };

        return {
            onAction: (context) => {
                const TITLE = `${MODULE}.Action`;
                let { newRecord, type } = context;
                let emails = [];

                if ([
                    'delete'
                ].indexOf(type) >= 0) {
                    log.debug({ title: TITLE, details: `Invalid event type: ${type}. Exiting...` });
                    return 'F';
                }
                // let email = newRecord.getValue({ fieldId: 'email' });
                // if (email) { emails.push(email); }

                let email = newRecord.getValue({ fieldId: FIELDS.PURCHASING_CONTACT_EMAIL });
                if (email) { emails.push(email); }

                if (emails.length <= 0) { return 'F'; }
                
                let isDuplicate = hasDuplicates({ emails, fieldId: FIELDS.PURCHASING_CONTACT_EMAIL, type: VENDOR_REQUEST.Id });
                if (isDuplicate === true) { return 'T'; }

                return hasDuplicates({ emails, fieldId: 'email', type: 'vendor' }) === true ? 'T' : 'F';
            }
        };
    }
);