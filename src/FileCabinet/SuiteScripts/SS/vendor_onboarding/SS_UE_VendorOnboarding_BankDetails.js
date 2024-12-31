/**
 * @NApiVersion     2.1
 * @NScriptType     UserEventScript
 * @NModuleScope    SameAccount
 */

define(
    [
        '../common/SS_Constants',
        '../common/SS_Record',
        '../common/SS_Script',
        '../common/SS_Search',
        'N/record'
    ],
    (
        SS_Constants,
        SS_Record,
        SS_Script,
        SS_Search,

        NS_Record
    ) => {
        const MODULE = `SS.UE.VendorOnboarding.BankDetails`;
        const BANK = SS_Constants.CustomRecords.BankDetails;

        const createBankDetails = (options) => {
            const TITLE = `${MODULE}.CreateBankDetails`;
            let { record } = options;

            // Get bank detail mapping...
            let mapping = getBankDetailMapping({ id: record.id });
            if (mapping.length <= 0) {
                log.audit({ title: TITLE, details: `No field mapping retrieved for vendor request ID ${record.id}.` });
                return;
            }

            // Create bank details record...
            let bankDetails = SS_Record.create({ type: BANK.Id, isDynamic: true });
            for (const [ fieldId, value ] of Object.entries(mapping[0])) {
                if (fieldId === 'id') { continue; }
                if (fieldId.endsWith('_TEXT')) {
                    // log.debug({ title: TITLE, details: `Setting field text ${fieldId} = "${value}".` });
                    bankDetails.setText({ fieldId, text: value });
                }
                else {
                    // log.debug({ title: TITLE, details: `Setting field value ${fieldId} = "${value}".` });
                    bankDetails.setValue({ fieldId, value });
                }
            }
            let bankDetailsId = bankDetails.save({ enableSourcing: true });
            log.debug({ title: TITLE, details: `Successfully created bank details ${bankDetailsId}.` });
        };

        const getBankDetailMapping = (options) => {
            const TITLE = `${MODULE}.GetBankDetailMapping`;
            let { id } = options;

            let mappingSearchId = SS_Script.getParameter(SS_Constants.ScriptParameters.VendorOnboardingBankDetails.MappingSearchId);
            let mappingSearch = SS_Search.load({ id: mappingSearchId });
            log.debug({ title: `${TITLE} mappingSearchId = ${mappingSearchId}`, details: JSON.stringify(mappingSearch) })
            
            mappingSearch.addExpression([ 'internalid', 'anyof', id ]);

            let mappingResults = mappingSearch.getResults();
            log.debug({ title: `${TITLE} mappingResults = ${mappingResults.length}`, details: JSON.stringify(mappingResults) });

            return mappingResults;
        };

        const validate = (options) => {
            const TITLE = `${MODULE}.Validate`;
            let { newRecord, type } = options;

            // if ([
            //     options.UserEventType.CREATE
            // ].indexOf(type) < 0) {
            //     log.audit({ title: TITLE, details: `Invalid event type (${type}). Exiting...` });
            //     return false;
            // }

            let mappingSearchId = SS_Script.getParameter(SS_Constants.ScriptParameters.VendorOnboardingBankDetails.MappingSearchId);
            if (!mappingSearchId) {
                log.audit({ title: TITLE, details: `Missing mapping saved search ID. Exiting...` });
                return false;
            }

            // Add additional 'false' conditions here...

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