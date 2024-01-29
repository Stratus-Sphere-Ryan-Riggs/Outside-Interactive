/**
 * @NApiVersion         2.1
 * @NModuleScope        SameAccount
 */

define(
    [
        './SS_Constants',
        './SS_File',
        './SS_Script',
        './SS_UI',
        './SS_Url',

        './SS_DunningStatements',
    ],
    (
        SS_Constants,
        SS_File,
        SS_Script,
        SS_UI,
        SS_Url,

        SS_DunningStatements,
    ) => {
        const MODULE = `SS|DataTableSuitelet`;
        const TYPES = SS_Constants.CustomLists.DataTableSuiteletTypes;

        /* const createStatementTask = (options) => {
            let title = `${MODULE}.CreateStatementTask`;
            let { parameters } = options;
            log.debug({ title: `${title} parameters`, details: JSON.stringify(parameters) });

            let taskRecord = createStatementTaskRecord(options);
            if (!taskRecord.status) {
                return taskRecord;
            }

            log.debug({ title: TITLE, details: `taskRecord = ${taskRecord.data}` });
            
            *** let params = {};
            params[SS_Constants.ScriptParameters.MapReduceTaskRecord] = taskRecord.data;

            let taskStatus = SS_Task.createMapReduceTask({
                scriptId: SS_Constants.Scripts.MapReduceTask.scriptId,
                params
            });
            log.debug({ title: `${title} taskStatus`, details: JSON.stringify(taskStatus) }); ***
            
            taskRecord.url = SS_Url.resolveRecord({
                recordType: SS_Constants.CustomRecords.MapReduceTask.Id,
                recordId: taskRecord.data
            });
            return taskRecord;
        }; */

        const getDefaultUrlValues = (options) => {
            const TITLE = `${MODULE}.GetDefaultUrlValues`;
            const SCRIPT = SS_Constants.Scripts.DataTableSuitelet;
            log.debug({ title: `${TITLE} SCRIPT`, details: JSON.stringify(SCRIPT) });
            let deploymentId = null;
            
            switch (options.type) {
                case TYPES.DUNNING_STATEMENTS: {
                    deploymentId = SCRIPT.DUNNING_STATEMENTS.deploymentId;
                    break;
                }
            }

            return {
                Backend: SS_Url.resolveScript({
                    scriptId: SCRIPT.BACKEND.scriptId,
                    deploymentId
                }),
                Transaction: '/app/accounting/transactions/transaction.nl?id='
            };
        };

        /**
         * 
         * @param {Object} options 
         * @param {Object} options.renderOptions
         * @param {int}    options.type
         * @returns 
         * @description    This is where we will add additional cases for other Suitelet types.
         */
        const getRenderedForm = (options) => {
            const TITLE = `${MODULE}.GetRenderedForm`;
            let { renderOptions, type } = options;
            let renderedForm = null;

            switch (options.type) {
                case TYPES.DUNNING_STATEMENTS: {
                    renderedForm = SS_DunningStatements.render(renderOptions);
                    break;
                }

                // TODO: Cases can be added here for additional Suitelet types.

            }

            return renderedForm;
        };

        const readScriptParameters = () => {
            const TITLE = `${MODULE}.ReadScriptParameters`;
            const PARAMS = SS_Constants.ScriptParameters.DataTableSuitelet;

            let scriptParams = {
                type: SS_Script.getParameter({ name: PARAMS.Type })
            };

            if (!scriptParams.type) {
                log.error({ title: TITLE, details: `Missing required value: Type.` });
                return null;
            }

            return scriptParams;
        };

        const render = (options) => {
            const TITLE = `${MODULE}.Render`;
            
            const scriptParams = readScriptParameters();
            if (!scriptParams) { return; }
            log.debug({ title: `${TITLE} scriptParams`, details: JSON.stringify(scriptParams) });

            let { request, response } = options;
            let renderOptions = {
                request,
                response,
                defaultValues: {
                    custpage_url_values: JSON.stringify(getDefaultUrlValues({ type: scriptParams.type }))
                }
            };
            
            let renderedForm = getRenderedForm({
                type: scriptParams.type,
                renderOptions
            });
            if (!renderedForm) {
                log.error({ title: TITLE, details: `Unable to render form. Please see Execution Logs for details.` });
                return;
            }

            writeDataTable({
                form: renderedForm,
                template: SS_Constants.Templates.DataTableSuitelet
            });
            response.writePage({ pageObject: renderedForm });
            log.debug({ title: TITLE, details: `Successfully built Suitelet form.` });
        };

        const writeDataTable = (options) => {
            let title = `${MODULE}.WriteDataTable`;
            let { form, template } = options;
            let tableContents = SS_File.read({ name: template });
            log.debug({ title: title, details: tableContents });

            let tableField = SS_UI.getField({ id: 'custpage_table', parent: form });
            tableField.defaultValue = tableContents;
        };

        return {
            render
        };
    }
);