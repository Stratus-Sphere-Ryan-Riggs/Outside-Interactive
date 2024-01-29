/**
 * @NApiVersion     2.1
 * @NScriptType     Suitelet
 */

define(
    [
        '../common/SS_DataTableSuitelet'
    ],
    (
        DataTableSuitelet
    ) => {
        const MODULE = 'SS.SL|DataTables';

        const onRequest = (options) => {
            const title = `${MODULE}.Request`;
            
            DataTableSuitelet.render(options);
        };

        return { onRequest };
    }
);