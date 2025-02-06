/**
 * @NApiVersion 2.1
 * @NModuleScope SameAccount
 * @NScriptType Suitelet
 */

define(
    [
        '../common/SS_AddressFormMapping'
    ],
    (
        SS_AddressFormMapping
    ) => {
        const MODULE = `SS.SL.Test`;

        const processGet = (options) => {
            const TITLE = `${MODULE}.GET`;
            let { request, response } = options;
            let { country } = request.parameters;

            let data = {
                attention: 'TEST',
                addressee: 'TEST ADDRESSEE',
                addr1: 'Aguilar Street',
                addr2: 'Barangay 402',
                addr3: 'Zone 42',
                addr4: '123',
                city: 'Sampaloc',
                state: 'MM',
                zip: '4322'
            };
            log.debug({ title: `${TITLE} data`, details: JSON.stringify(data) });
            
            let address = SS_AddressFormMapping.mapAddress({
                country,
                data
            });
            log.debug({ title: `${TITLE} address`, details: JSON.stringify(address) });
        };

        return {
            onRequest: (context) => {
                let { request, response } = context;
                
                switch (request.method.toLowerCase()) {
                    case 'get': {
                        processGet(context);
                        break;
                    }
                }
            }
        };
    }
);