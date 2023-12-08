/**
 * @NApiVersion         2.1
 * @NScriptType         UserEventScript
 */

define(
    [
        'N/log',
        'N/runtime',
        './SS_LIB_JE_Bill_Campaign_ID'
    ],
    (
        nsLog,
        nsRuntime,

        ssCampaignId
    ) => {
        const MODULE_NAME = `UE|JE Bill Campaign ID`;
        
        const afterSubmit = (context) => {
            if (!validateExecution(context)) {
                return;
            }

            ssCampaignId.UpdateLineCampaignIds({ journalId: context.newRecord.id });
        };

        const validateExecution = (context) => {
            if ([
                context.UserEventType.CREATE,
                context.UserEventType.EDIT
            ].indexOf(context.type) < 0) {
                return false;
            }

            return true;
        };

        return { afterSubmit };
    }
);