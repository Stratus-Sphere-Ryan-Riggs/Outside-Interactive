/**
 * Wrapper module for N/url
 * 
 * @NApiVersion         2.1
 * @NModuleScope        SameAccount
 */

define(
    [
        'N/url'
    ],
    (
        NS_Url
    ) => {
        return {
            resolveRecord (options) {
                return NS_Url.resolveRecord(options);
            },
            resolveScript (options) {
                return NS_Url.resolveScript(options);
            }
        };
    }
);