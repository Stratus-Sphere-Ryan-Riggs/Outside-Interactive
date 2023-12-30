/**
 * Wrapper module for N/ui/dialog
 * 
 * @NApiVersion     2.1
 * @NModuleScope    SameAccount
 */

define(
    [
        'N/ui/dialog'
    ],
    (
        NS_Dialog
    ) => {
        return {
            alert: (options) => {
                return NS_Dialog.alert(options)
            },
            confirm: (options) => {
                return NS_Dialog.confirm(options);
            },
            create: (options) => {
                return NS_Dialog.create(options);
            }
        };
    }
);