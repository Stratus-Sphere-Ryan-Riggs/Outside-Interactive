/*** 
 * @NApiVersion 2.1
 * @NScriptType ScheduledScript
 * @NModuleScope SameAccount
 */

define(['N/task', 'N/search', 'N/runtime'],
    function (task, search, runtime) {

        function execute() {
            var logTitle = 'execute';
            try {
                log.debug(logTitle, "Script Start");
                var script = runtime.getCurrentScript();
                var jeSearchId = script.getParameter('custscript_journal_saved_search');
                var setSize = 5;
                var jeSearch = search.load({ id: jeSearchId });

                var jeIds = [];
                /* jeSearch.run().each(function (result) {
                    var id = result.getValue("internalid");
                    if (!jeIds.includes(id)) {
                        jeIds.push(id);
                    }
                    return true;
                }); */
                jeIds = getAllIds(jeSearch);
                log.debug(logTitle, JSON.stringify(jeIds))

                var chunks = groupArrayIntoChunks(jeIds, setSize);
                chunks.forEach(chunk => {
                    var mrTask = task.create({
                        taskType: task.TaskType.MAP_REDUCE,
                        scriptId: 'customscript_mr_set_je_source_adhoc',
                        params: {
                            custscript_journal_entry_ids: JSON.stringify(chunk)
                        }
                    });
                    var mrTaskId = mrTask.submit();
                    log.debug({
                        title: logTitle,
                        details: 'Successfully submitted MR task ID = ' + mrTaskId + '.'
                    });
                });
            } catch (err) {
                log.error('Get Input Data Error', err);
            }
        }

        function getAllIds(search) {
            let allResults = [];
            let results = [];
            let size = 1000;
            let start = 0;
            let end = size;

            do {
                results = search.run().getRange({ start, end });
                allResults = allResults.concat(results);
                start += size;
                end += size;
                // throw new Error('STOP');
            } while(results.length >= size);

            allResults = allResults.map(d => d.getValue("internalid")).sort((a, b) => a - b);
            allResults = [ ...new Set(allResults) ];

            return allResults;
        }

        function groupArrayIntoChunks(array, chunkSize) {
            const chunks = [];
            for (let i = 0; i < array.length; i += chunkSize) {
                chunks.push(array.slice(i, i + chunkSize));
            }
            return chunks;
        }

        return {
            execute: execute
        };

    });