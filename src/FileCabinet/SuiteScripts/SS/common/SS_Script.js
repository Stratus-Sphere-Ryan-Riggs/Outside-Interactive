/**
 * Wrapper module for N/runtime - Script object
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
        const MODULE = `SS|Script`;

        const TRIGGERS = {
            ClientScript: {
                FIELD_CHANGED: 'Field Changed',
                PAGE_INIT: 'Page Init',
                SAVE_RECORD: 'Save Record',
                VALIDATE_FIELD: 'Validate Field'
            },
            MapReduce: {
                GET_INPUT_DATA: 'Get Input Data',
                MAP: 'Map',
                REDUCE: 'Reduce',
                SUMMARIZE: 'Summarize'
            },
            RESTlet: {},
            Scheduled: {},
            Suitelet: {},
            UserEvent: {
                AFTER_SUBMIT: 'After Submit',
                BEFORE_LOAD: 'Before Load',
                BEFORE_SUBMIT: 'Before Submit'
            },
            WorkflowAction: {
                ACTION: 'On Action'
            }
        };

        return {
            get ApiVersion() {
                return this.Script.apiVersion;
            },
            get BundleIds() {
                return this.Script.bundleIds;
            },
            get DeploymentId() {
                return this.Script.deploymentId;
            },
            get Id() {
                return this.Script.id;
            },
            get LogLevel() {
                return this.Script.logLevel;
            },
            get RemainingUsage() {
                return this.Script.getRemainingUsage();
            },
            get Script() {
                return NS_Runtime.getCurrentScript();
            },
            get Triggers() {
                return TRIGGERS;
            },
            get UserEventTypes() {
                return USER_EVENT_TYPES;
            },

            execute(options) {
                const TITLE = `${MODULE}.Execute`;
                let { fn, params, stopOnError } = options;

                if (stopOnError) {
                    fn.call(null, params);
                    return;
                }

                try {
                    fn.call(null, params);
                }
                catch (ex) {
                    log.error({ title: `${TITLE} Function: ${fn.name}`, details: ex.toString() });
                }
            },
            executeTrigger(options) {
                let TITLE = `${MODULE}.ExecuteTrigger`;

                if (!!(options?.functions?.length) === false) {
                    log.error({ title: TITLE, details: `No functions to execute.` });
                    return;
                }

                let { functions, trigger } = options;
                log.debug({ title: TITLE, details: `trigger = ${trigger}` });

                TITLE = `${TITLE}.${trigger || ''}`;
                try {
                    for (let i = 0, count = functions.length; i < count; i++) {
                        let { fn } = functions[i];
                        TITLE = `${TITLE} Function: ${fn.name}`;
                        this.execute(functions[i]);
                    }
                }
                catch (ex) {
                    log.error({ title: TITLE, details: ex.toString() });
                }
            },
            getParameter(name) {
                return this.Script.getParameter(name);
            },
            getAllParameters(options) {
                const title = `${MODULE}.GetAllParameters`;
                let objParameters = {};
    
                for (const [key, value] of Object.entries(options.map)) {
                    let objParam = {};
                    objParam[key] = this.getParameter(value)
                    objParameters = {
                        ...objParameters,
                        ...objParam
                    };
                }
    
                return objParameters;
            }
        };
    }
);