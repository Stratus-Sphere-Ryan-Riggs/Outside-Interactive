/**
 * Wrapper module for serverRequest object
 * 
 * @NApiVersion         2.1
 * @NModuleScope        SameAccount
 */

define(
    [],
    () => {
        const MODULE_NAME = 'SS.Request';
        
        return {
            getParameter (options) {
                if (!options.request) {
                    return {};
                }
    
                let objParam = {};
                objParam[options.field] = options.request.parameters[options.field];
    
                return objParam;
            },
            getAllParameters (options) {
                let title = `${MODULE_NAME}.GetAllParameters`;
                let objParams = {};
                if (!options.request) {
                    return objParams;
                }
    
                if (!options.fields?.length) {
                    return objParams;
                }
    
                for (let i = 0, length = options.fields.length; i < length; i++) {
                    objParams = {
                        ...objParams,
                        ...getParameter({ request: options.request, field: options.fields[i] })
                    };
                }
                objParams = {
                    ...objParams,
                    ...getParameter({ request: options.request, field: 'dosearch' })
                }
    
                return objParams;
            }
        };
    }
);