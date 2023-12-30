/**
 * Wrapper module for N/currentRecord
 * 
 * @NApiVersion     2.1
 * @NModuleScope    SameAccount
 */

define(
    [
        'N/currentRecord',
        './SS_Record'
    ],
    (
        NS_CurrentRecord,
        SS_Record
    ) => {
        return {
            get() {
                return SS_Record.cast(NS_CurrentRecord.get());
            }
        }
    }
);