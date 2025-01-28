/**
 * Wrapper module for N/runtime
 * 
 * @NApiVersion     2.1
 * @NModuleScope    SameAccount
 */

define(
    [
        'N/runtime'
    ],
    (
        NS_Runtime
    ) => {
        return {
            get AccountId() {
                return NS_Runtime.accountId;
            },
            get Environment() {
                return NS_Runtime.envType;
            },
            get ExecutionContext() {
                return NS_Runtime.executionContext;
            },

            isUserInterface() {
                return NS_Runtime.executionContext === NS_Runtime.ContextType.USER_INTERFACE;
            }
        };
    }
);