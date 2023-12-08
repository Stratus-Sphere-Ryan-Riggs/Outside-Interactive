/**
 *@NApiVersion 2.1
 *@NScriptType MapReduceScript
 */
define(['N/record', 'N/search', 'N/runtime'],
    function (record, search, runtime) {

        function getInputData() {
            var logTitle = 'getInputData';
            try {
                log.debug(logTitle, "Script Start");
                var script = runtime.getCurrentScript();
                var jeSearchId = script.getParameter('custscript_journal_entry_search');
                var jeSearch = search.load({ id: jeSearchId });
                return jeSearch;
            } catch (error) {
                log.error(logTitle, 'error: ' + error);
            }
        }

        function map(context){
            var logTitle = 'map';
            try {
                log.debug(logTitle, "Map Start :" + JSON.stringify(context));
                context.write({key: context.key, value: context.key});
            } catch (error) {
                log.error(logTitle, 'error: ' + error);
            }
        }


        function reduce(context) {
            var logTitle = 'reduce';
            try {
                log.debug(logTitle, "Reduce Start");
                var jeId = context.key;

                var journalRecord = record.load({
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
                });
            } catch (error) {
                log.error(logTitle, 'error: ' + error);
            }
        }

        function summarize(summary) {
            var logTitle = 'summarize';
            try {
                log.debug(logTitle, 'End');
            } catch (error) {
                log.error(logTitle, 'error: ' + error);
            }
        }

        return {
            getInputData: getInputData,
            map: map,
            reduce: reduce,
            summarize: summarize
        };
    });