/**
 * Copyright 2023 Stratus-Sphere
 * All rights reserved
 * 
 * Summary:
 * Data fix script to set Charge Rule stage on Charge records.
 * 
 * @NApiVersion         2.1
 * @NScriptType         UserEventScript
 * @NModuleScope        SameAccount
 * @author              mvillarama
 * 
 * Date                 Summary
 * =====================================================================
 * 2023/03/13           Initial version
 * 
 */

define(
    [
        'N/log',
        'N/record',
        'N/search'
    ],
    (
        log,
        record,
        search
    ) => {
        const afterSubmit = (context) => {
            let title = 'afterSubmit';

            updateCreatedFrom({
                context: context
            });
        };

        const updateCreatedFrom = (options) => {
            let title = 'updateCreatedFrom';
            let context = options.context;

            let validEvents = [
                'create',
                'edit'
            ];
            if (validEvents.indexOf(context.type) < 0) {
                log.error({
                    title: title,
                    details: `Invalid event type = ${context.type}. Exiting...`
                });
                return;
            }

            let thisRecord = context.newRecord;
            let sublistId = 'revenueelement';

            let refId = thisRecord.getSublistValue({
                sublistId: sublistId,
                fieldId: 'referenceid',
                line: 0
            });
            log.debug({
                title: title,
                details: `refId = ${refId}`
            });

            if (!refId) {
                log.error({
                    title: title,
                    details: `Missing reference transaction. Exiting...`
                });
                return;
            }

            let internalId = refId.split('_')[1];
            let searchTransaction = search.create({
                type: 'transaction',
                filters: [
                    search.createFilter({
                        name: 'internalid',
                        operator: 'anyof',
                        values: [ internalId ]
                    }),
                    search.createFilter({
                        name: 'mainline',
                        operator: 'is',
                        values: [ 'T' ]
                    })
                ],
                columns: [
                    'internalid',
                    'type'
                ]
            });
            let resultTransaction = searchTransaction.run().getRange({
                start: 0,
                end: 1
            });
            if (resultTransaction.length <= 0) {
                log.error({
                    title: title,
                    details: `No matching transaction found for internal ID ${internalId}.`
                });
                return;
            }
            log.debug({
                title: `${title} resultTransaction`,
                details: JSON.stringify(resultTransaction)
            });

            let sourceId = resultTransaction[0].id;
            log.debug({
                title: title,
                details: `sourceId = ${sourceId}`
            });

            record.submitFields({
                type: thisRecord.type,
                id: thisRecord.id,
                values: {
                    custbody_str_created_from: sourceId
                }
            });
            log.debug({
                title: title,
                details: `Successfully updated Created From field = ${sourceId}.`
            });
        };

        return {
            afterSubmit
        };
    }
);