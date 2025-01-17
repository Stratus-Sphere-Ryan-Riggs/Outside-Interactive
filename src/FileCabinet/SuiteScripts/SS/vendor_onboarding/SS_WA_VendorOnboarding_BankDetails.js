/**
 * @NApiVersion     2.1
 * @NScriptType     WorkflowActionScript
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
        const MODULE = `SS.WA.VendorOnboarding.BankDetails`;
        const BANK = SS_Constants.CustomRecords.BankDetails;
        const FIELDS = BANK.Fields;

        const createBankDetails = (options) => {
            const TITLE = `${MODULE}.CreateBankDetails`;
            let { record } = options;

            // Get bank detail mapping...
            // let vendorId = record.getValue({ fieldId: 'custrecord_2663_parent_vendor' });
            let vendorId = SS_Script.getParameter(SS_Constants.ScriptParameters.VendorOnboardingBankDetails.VendorLinkId);
            log.debug({ title: TITLE, details: `vendorId = ${vendorId}` });
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
            bankDetails.setValue({ fieldId: 'custrecord_2663_parent_vendor', value: vendorId });

            setBankingNumberFields({ record: bankDetails, value: bankDetails.getValue({ fieldId: FIELDS.BANK_NUMBER }) });

            let bankDetailsId = bankDetails.save({ enableSourcing: true });
            log.debug({ title: TITLE, details: `Successfully created bank details ${bankDetailsId}.` });
        };

        const getBankDetailMapping = (options) => {
            const TITLE = `${MODULE}.GetBankDetailMapping`;
            let { id } = options;

            let mappingSearchId = SS_Script.getParameter(SS_Constants.ScriptParameters.VendorOnboardingBankDetails.MappingSearchId);
            let mappingSearch = SS_Search.load({ id: mappingSearchId });
            // log.debug({ title: `${TITLE} mappingSearchId = ${mappingSearchId}`, details: JSON.stringify(mappingSearch) })
            
            mappingSearch.addExpression([ 'internalid', 'anyof', id ]);
            log.debug({ title: `${TITLE} filters`, details: JSON.stringify(mappingSearch.Expression) });

            let mappingResults = mappingSearch.getResults();
            log.debug({ title: `${TITLE} mappingResults = ${mappingResults.length}`, details: JSON.stringify(mappingResults) });

            return mappingResults;
        };

        const setBankingNumberFields = (options) => {
            const TITLE = `${MODULE}.SetBankingNumberFields`;
            let { record, value } = options;

            // Parse banking number field values
            if (value.length !== 9) {
                log.debug({ title: TITLE, details: `Bank routing number is invalid. Skipping...` });
                return;
            }

            let checkDigit = (
                (7 * (parseInt(value.charAt(0)) + parseInt(value.charAt(3)) + parseInt(value.charAt(6)))) +
                (3 * (parseInt(value.charAt(1)) + parseInt(value.charAt(4)) + parseInt(value.charAt(7)))) +
                (9 * (parseInt(value.charAt(2)) + parseInt(value.charAt(5))))
            ) % 10;

            if (checkDigit.toString() !== value.charAt(8).toString()) { return; }

            record.setValue({ fieldId: FIELDS.PROCESSOR_CODE, value: value.substring(0, 4) });
            record.setValue({ fieldId: FIELDS.BANK_CODE, value: value.substring(4, 8) });
            record.setValue({ fieldId: FIELDS.COUNTRY_CHECK, value: checkDigit });
        };

        const validate = (options) => {
            const TITLE = `${MODULE}.Validate`;

            let mappingSearchId = SS_Script.getParameter(SS_Constants.ScriptParameters.VendorOnboardingBankDetails.MappingSearchId);
            if (!mappingSearchId) {
                log.audit({ title: TITLE, details: `Missing parameter: Mapping saved search ID. Exiting...` });
                return false;
            }

            // Add additional 'false' conditions here...
            // let vendorLinkId = SS_Script.getParameter(SS_Constants.ScriptParameters.VendorOnboardingBankDetails.VendorLinkId);
            // if (!vendorLinkId) {
            //     log.audit({ title: TITLE, details: `Missing parameter: Vendor ID. Exiting...` });
            //     return false;
            // }

            return true;
        };

        return {
            onAction: (context) => {
                const TITLE = `${MODULE}.AfterSubmit`;
                let { newRecord } = context;

                if (validate(context) === false) { return; }

                createBankDetails({ record: newRecord });
            }
        };
    }
);