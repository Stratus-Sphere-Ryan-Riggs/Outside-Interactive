/**
 * @NApiVersion     2.1
 * @NScriptType     Suitelet
 */

define(
    [
        './SS_Lib_CustomerStatements'
    ],
    (
        CustomerStatements
    ) => {
        const MODULE = 'SS.SL|CustomerStatements';

        const onRequest = (options) => {
            const title = `${MODULE}.Request`;
            let { request, response } = options;

            let ui = CustomerStatements.buildUI({ request });
            if (ui.status <= 0) {
                response.write({ output: ui.error });
                return;
            }

            response.writePage({ pageObject: ui.object });
        };

        return { onRequest };
    }
);