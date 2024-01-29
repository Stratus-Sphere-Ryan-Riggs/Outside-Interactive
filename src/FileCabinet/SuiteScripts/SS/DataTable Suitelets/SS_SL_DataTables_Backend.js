/**
 * @NApiVersion     2.1
 * @NScriptType     Suitelet
 * @NModuleScope    SameAccount
 */

define(
    [
        '../common/SS_DataTableBackend'
    ],
    (
        DataTableBackend
    ) => {
        const MODULE = `SS.SL|DataTableBackend`;

        const onRequest = (context) => {
            DataTableBackend.process(context);
        };

        return { onRequest };
    }
);
