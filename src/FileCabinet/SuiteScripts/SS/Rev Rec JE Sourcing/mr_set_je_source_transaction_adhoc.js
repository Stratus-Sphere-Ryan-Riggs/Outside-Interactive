/**
 *@NApiVersion 2.1
 *@NScriptType MapReduceScript
 */
define(['N/record', 'N/search', 'N/runtime', './lib_set_je_source_transaction'],
    function (record, search, runtime, LIB) {

        function getInputData() {
            var logTitle = 'getInputData';
            try {
                log.debug(logTitle, "Script Start");
                var script = runtime.getCurrentScript();
                var jeId = script.getParameter('custscript_journal_entry_id');
                
                var jeRecord = record.load({
                    type: record.Type.JOURNAL_ENTRY,
                    id: jeId,
                    isDynamic: true
                });

                var isProcessed = jeRecord.getValue({
                    fieldId: 'custbody_oi_source_transactions'
                });
                if (isProcessed == true || isProcessed == 'T') {
                    log.debug(logTitle, 'This JE has already been processed. Exiting...');
                    return;
                }

                var lineCount = jeRecord.getLineCount({ sublistId: 'line' });
                log.debug(logTitle, "lines: " + lineCount);
                
                var jeLines = [];
                for (var i=0; i<lineCount; i++) {
                    var jeLine = { id: jeId, line: i };
                    var lineSourceRecPlan = jeRecord.getSublistValue({ sublistId: 'line', fieldId: 'sourcerevenueplan', line: i });
                    log.debug(logTitle, "lineSourceRecPlan: " + lineSourceRecPlan);
                    jeLine.sourceRecPlan = lineSourceRecPlan;

                    var lineSchedule = jeRecord.getSublistValue({ sublistId: 'line', fieldId: 'schedulenum', line: i });
                    log.debug(logTitle, "lineSchedule: " + lineSchedule);
                    jeLine.schedule = lineSchedule;

                    jeLines.push(jeLine);
                }

                return jeLines;
            } catch (error) {
                log.error(logTitle, 'error: ' + error);
            }
        }

        /* function map(context){
            var logTitle = 'map';
            try {
                log.debug(logTitle, "Map Start :" + JSON.stringify(context));
                var valueObject = JSON.parse(context.value);

                context.write(valueObject);
            } catch (error) {
                log.error(logTitle, 'error: ' + error);
            }
        } */


        function reduce(context) {
            var logTitle = 'reduce';
            try {
                log.debug(logTitle, "Reduce Start");
                log.debug(logTitle, context.values[0]);
                var valueObject = JSON.parse(context.values[0]);
                // var jeId = context.key;

                /* var journalRecord = record.load({
                    type: record.Type.JOURNAL_ENTRY,
                    id: jeId,
                    isDynamic: true
                });
                journalRecord.setValue({
                    fieldId: 'custbody_oi_source_transactions',
                    value: true,
                });
                journalRecord.save({
                    enableSourcing: false,
                    ignoreMandatoryFields: true
                }); */

                // var keySourceArray = LIB.getKeySourceArray({ id: jeId });
                // for (var i = 0; i < lineCount; i++) {
                    // var lineSourceRecPlan = jeRecord.getSublistValue({ sublistId: 'line', fieldId: 'sourcerevenueplan', line: i });
                    // log.debug(logTitle, "lineSourceRecPlan: " + lineSourceRecPlan);
                    var lineSourceRecPlan = valueObject.sourceRecPlan;
                    if (!LIB.isEmpty(lineSourceRecPlan)) {
                        var transactionId = LIB.getSourceTransactionId({ id: lineSourceRecPlan });
                        log.debug(logTitle, "transactionId: " + transactionId);
                        if (!LIB.isEmpty(transactionId)) {
                            // jeRecord.setSublistValue({ sublistId: 'line', fieldId: 'custcol_ss_oi_source_trans', line: i, value: transactionId });
                            context.write({
                                key: valueObject.id + '_' + valueObject.line,
                                value: transactionId
                            });
                        }
                    }
                    //---
                    // var lineShedule = jeRecord.getSublistValue({ sublistId: 'line', fieldId: 'schedulenum', line: i });
                    // log.debug(logTitle, "lineShedule: " + lineShedule);
                    var lineSchedule = valueObject.schedule;
                    if (!LIB.isEmpty(lineSchedule)) {
                        var sourceTran = LIB.getSourceTransactionIdAmortSched({ id: lineSchedule });
                        log.debug(logTitle, "sourceTran: " + sourceTran);
                        if (!LIB.isEmpty(sourceTran)) {
                            // jeRecord.setSublistValue({ sublistId: 'line', fieldId: 'custcol_ss_oi_source_trans', line: i, value: sourceTran });
                            context.write({
                                key: valueObject.id + '_' + valueObject.line,
                                value: sourceTran
                            });
                        }
                    }
                // }

                /* jeRecord.save({
                    enableSourcing: false,
                    ignoreMandatoryFields: true
                });
                log.debug({ title: logTitle, details: `Successfully saved JE ID = ${jeId}.` }); */
            } catch (error) {
                log.error(logTitle, 'error: ' + error);
            }
        }

        function summarize(summary) {
            var logTitle = 'summarize';
            try {
                log.debug(logTitle, 'End');

                var hasErrors = false;
                summary.reduceSummary.errors.iterator().each(function(key, error) {
                    log.error(logTitle, JSON.stringify(error));
                    hasErrors = true;
                    return true;
                });

                if (hasErrors === true) {
                    return;
                }

                var jeLines = [];
                var jeId;
                summary.output.iterator().each(function (key, value) {
                    log.debug(logTitle, 'key = ' + key);
                    var pair = key.split('_');
                    jeId = pair[0];

                    // jeLines.push(JSON.parse(value));
                    log.debug(logTitle, value);
                    jeLines.push({
                        line: pair[1],
                        value: value
                    });
                    return true;
                });
                log.debug({
                    title: logTitle,
                    details: 'JE ID = ' + jeId
                });

                var jeRecord = record.load({
                    type: record.Type.JOURNAL_ENTRY,
                    id: jeId
                });

                for (var i=0, ilen=jeLines.length; i<ilen; i++) {
                    jeRecord.setSublistValue({
                        sublistId: 'line',
                        fieldId: 'custcol_ss_oi_source_transaction',
                        line: i,
                        value: jeLines[i].value
                    });
                }

                jeRecord.setValue({
                    fieldId: 'custbody_oi_source_transactions',
                    value: true
                });
                jeRecord.save({
                    enableSourcing: false,
                    ignoreMandatoryFields: true
                });
                log.debug({ title: logTitle, details: `Successfully saved JE ID = ${jeId}.` });
            } catch (error) {
                log.error(logTitle, 'error: ' + error);
            }
        }

        return {
            getInputData: getInputData,
            // map: map,
            reduce: reduce,
            summarize: summarize
        };
    });