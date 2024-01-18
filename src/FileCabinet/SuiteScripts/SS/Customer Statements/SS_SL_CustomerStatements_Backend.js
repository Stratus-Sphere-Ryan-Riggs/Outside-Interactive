/**
 * @NApiVersion     2.1
 * @NScriptType     Suitelet
 * @NModuleScope    SameAccount
 */

define(
    [
        './SS_Lib_CustomerStatements'
    ],
    (
        LIB
    ) => {
        const MODULE = `SS.SL|CustomerStatementsBackend`;

        const onRequest = (context) => {
            let title = `${MODULE}.Request`;
            let { request, response } = context;

            let requestParameters = LIB.getRequestParameters({ request });
            if (!request.parameters.action) {
                sendError({
                    response,
                    title: title,
                    error: 'Missing required value: Action.'
                });
                return;
            }

            switch(request.parameters.action.toLowerCase()) {
                case 'search': {
                    let data = LIB.getTableData({ parameters: requestParameters });
                    response.write({
                        output: JSON.stringify({
                            status: 1,
                            output: data || ''
                        })
                    });
                    break;
                }
                case 'process': {
                    let jsonBody = parseRequestBody({ input: request.body });
                    if (!jsonBody) {
                        sendError({
                            response,
                            title,
                            error: `Unable to parse request body: ${request.body}`
                        });
                        return;
                    }

                    let output = LIB.processStatements({ parameters: jsonBody });
                    response.write({ output: JSON.stringify(output) });
                    break;
                }
                default: {
                    sendError({
                        response,
                        title,
                        error: 'Invalid action. Exiting...'
                    });
                    break;
                }
            }
        };

        const sendError = (options) => {
            let message =  options.error.message || options.error.toString();
            log.error({ title: options.title, details: message });
            options.response.write({
                output: JSON.stringify({ status: 0, error:  message })
            });
        };

        return { onRequest };
    }
);
