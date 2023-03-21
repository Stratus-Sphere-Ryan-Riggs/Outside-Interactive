/**
 * @NApiVersion         2.1
 * @NScriptType         Suitelet
 * @NModuleScope        SameAccount
 */

define(
    [
        'N/log',
        'N/runtime',
        'N/search'
    ],
    (
        log,
        runtime,
        search
    ) => {
        const onRequest = ({ request, response }) => {
            let title = 'onRequest';
            let script = runtime.getCurrentScript();

            let srch = search.load({
                id: 'customsearch_mv_all_trans_lines'
            });
        };

        const reduce = ({ key, value }) => {
            let title = 'reduce';
        };

        const summarize = (summary) => {
            let title = 'summarize';
        };

    }
);