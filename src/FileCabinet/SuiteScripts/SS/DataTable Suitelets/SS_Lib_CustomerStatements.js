/**
 * @NApiVersion         2.1
 * @NModuleScope        SameAccount
 */

define(
    [
        '../common/SS_Constants',
        '../common/SS_File',
        '../common/SS_Record',
        '../common/SS_Script',
        '../common/SS_Search',
        '../common/SS_String',
        '../common/SS_UI',
        '../common/SS_Url',
        '../common/SS_Transaction'
    ],
    (
        SS_Constants,
        SS_File,
        SS_Record,
        SS_Script,
        SS_Search,
        SS_String,
        SS_UI,
        SS_Url,
        SS_Transaction
    ) => {
        const MODULE = `SS|CustomerStatements`;

        const FORM = SS_Constants.Forms.CustomerStatements;
        const OPERATOR = SS_Search.Operator;
        const REQUEST_PARAMS = SS_Constants.RequestParameters.CustomerStatements;
        const SCRIPT_PARAMS = SS_Constants.ScriptParameters.CustomerStatements;
        const TRANSACTION = SS_Constants.Transaction;

        const buildSearchFilters = (options) => {
            const TITLE = `${MODULE}.BuildSearchFilters`;
            let {
                balance,
                cas,
                condition,
                customer,
                lastcomm,
                level,
                searchObject,
                subsidiary
            } = options;
            log.debug({ title: `${TITLE} options`, details: JSON.stringify(options) });
            let filters = [];

            if (cas) {
                filters = filters.concat([
                    `customermain.${SS_Constants.Entity.CustomFields.CAS}`, OPERATOR.ANYOF, cas
                ], 'AND');
            }

            if (customer) {
                filters = filters.concat([
                    TRANSACTION.Fields.NAME, OPERATOR.ANYOF, customer
                ], 'AND');
            }

            if (lastcomm) {
                filters = filters.concat([
                    [ TRANSACTION.CustomFields.LAST_COMMUNICATION_DATE, OPERATOR.ONORBEFORE, lastcomm ],
                    'OR',
                    [ TRANSACTION.CustomFields.LAST_COMMUNICATION_DATE, OPERATOR.ISEMPTY, null ]
                ], 'AND');
            }

            if (subsidiary) {
                filters = filters.concat([
                    TRANSACTION.Fields.SUBSIDIARY, OPERATOR.ANYOF, subsidiary
                ], 'AND');
            }

            if (condition && !!balance === true) {
                let operator = OPERATOR.EQUALTO;
                switch (condition.toLowerCase()) {
                    case 'equalgreat': {
                        operator = OPERATOR.GREATERTHANOREQUALTO;
                        break;
                    }
                    case 'equalless': {
                        operator = OPERATOR.LESSTHANOREQUALTO;
                        break;
                    }
                }
                filters = filters.concat([
                    `sum(${TRANSACTION.Fields.AMOUNT_REMAINING})`, operator, balance
                ], 'AND');
            }

            let dunningLevel = SS_Constants.CustomLists.DunningLevels.Values.find(d => d.id === level);
            if (dunningLevel) {
                filters = filters.concat([
                    `max(${TRANSACTION.Fields.DAYS_OVERDUE})`, OPERATOR.BETWEEN, dunningLevel.from, dunningLevel.to
                ], 'AND');
            }

            if (filters.length > 0) {
                filters.pop();
            }
            log.debug({ title: `${TITLE} END`, details: JSON.stringify(filters) });

            return filters;
        };

        const buildUI = (options) => {
            let title = `${MODULE}.BuildUI`;
            let { request } = options;
            let requestParameters = getRequestParameters({ request });
            log.debug({ title: `${title} requestParameters`, details: JSON.stringify(requestParameters) });

            let defaultValues = mapParametersToFields({ parameters: requestParameters });
            defaultValues.custpage_url_values = JSON.stringify(getUrlValues());

            let form = SS_UI.buildForm({
                config: FORM,
                defaultValues: defaultValues
            });

            /* let dataTableFileName = SS_Script.getParameter({ name: SCRIPT_PARAMS.HtmlTemplateFile });
            if (!dataTableFileName) {
                let error = ERROR_MISSINGPARAM({ type: ERROR_TYPES.MISSING_DATATABLE_HTML });
                log.error({ title: title, details: error });
                return { status: 0, error: error };
            }
            log.debug({ title: title, details: `dataTableFileName = ${dataTableFileName}` }); */

            /* let data = getTableData({ parameters: requestParameters });
            log.debug({ title: title, details: JSON.stringify(data) });

            if (data) {
                writeDataTable({ data, form, template: dataTableFileName });
            } */
            writeDataTable({ form, template: SS_Constants.Templates.DataTable });

            return { status: 1, object: form };
        };

        const createStatementTask = (options) => {
            let title = `${MODULE}.CreateStatementTask`;
            let { parameters } = options;
            log.debug({ title: `${title} parameters`, details: JSON.stringify(parameters) });

            let taskRecord = createStatementTaskRecord(options);
            if (!taskRecord.status) {
                return taskRecord;
            }

            log.debug({ title: TITLE, details: `taskRecord = ${taskRecord.data}` });
            
            /* let params = {};
            params[SS_Constants.ScriptParameters.MapReduceTaskRecord] = taskRecord.data;

            let taskStatus = SS_Task.createMapReduceTask({
                scriptId: SS_Constants.Scripts.MapReduceTask.scriptId,
                params
            });
            log.debug({ title: `${title} taskStatus`, details: JSON.stringify(taskStatus) }); */
            
            taskRecord.url = SS_Url.resolveRecord({
                recordType: SS_Constants.CustomRecords.MapReduceTask.Id,
                recordId: taskRecord.data
            });
            return taskRecord;
        };

        const createStatementTaskRecord = (options) => {
            let title = `${MODULE}.CreateStatementTaskRecord`;
            let { parameters } = options;
            let TASK = SS_Constants.CustomRecords.MapReduceTask
            let FIELDS = TASK.Fields;

            try {
                let mrTask = SS_Record.create({ type: TASK.Id });
                mrTask.setValue({ fieldId: FIELDS.DATA, value: parameters });
                mrTask.setValue({ fieldId: FIELDS.STATUS, value: SS_Constants.CustomLists.MapReduceTaskStatus.PENDING });
                mrTask.setValue({ fieldId: FIELDS.TYPE, value: SS_Constants.CustomLists.MapReduceType.CUSTOMER_STATEMENT });
                
                let mrTaskId = mrTask.save();
                log.debug({ title, details: `Successfully created Task ID ${mrTaskId}.` });
                return { status: true, data: mrTaskId };
            }
            catch (ex) {
                let errorMessage = ex.message || ex.toString();
                log.error({ title, details: errorMessage });
                return { status: false, error: errorMessage };
            }
        };

        const getRequestParameters = (options) => {
            let title = `${MODULE}.GetRequestParameters`;
            let output = {};
            let { request } = options;
            let params = request.parameters;

            output.action = params.action;
            for (let i = 0, count = REQUEST_PARAMS.length; i < count; i++) {
                let key = REQUEST_PARAMS[i];
                output[key] = params[key];
            }

            log.debug({ title: title, details: JSON.stringify(output) });
            return output;
        };

        const getTableData = (options) => {
            let title = `${MODULE}.GetTableData`;
            let { parameters } = options;

            let taskSearch = loadSearch({ searchId: SCRIPT_PARAMS.TaskSearchId });
            if (!taskSearch) {
                log.error({ title, details: `Unable to load Customer Statement Task saved search.` });
                return;
            }
            
            let inProgress = [];
            let tasks = taskSearch.getResults();
            for (let i = 0, count = tasks.length; i < count; i++) {
                log.debug({ title: `${title} i=${i} task`, details: JSON.stringify(tasks[i]) });
                let contents = tasks[i].invoicingdata;
                let jsonContents = JSON.parse(contents);
                inProgress = jsonContents.idList.reduce((total, next) => {
                    total = total.concat(next.list);
                    return total;
                }, []);
            }
            inProgress = [ ...new Set(inProgress) ];
            log.debug({ title: `${title} inProgress = ${inProgress.length}`, details: JSON.stringify(inProgress) });
            parameters.tasks = inProgress;

            let statementSearch = loadSearch({ searchId: SCRIPT_PARAMS.StatementSearchId });
            if (!statementSearch) {
                log.error({ title, details: `Unable to load Customer Statement saved search.` });
                return null;
            }

            log.debug({ title: `${title} parameters`, details: JSON.stringify(parameters) });
            log.debug({ title: `${title} statementSearch.Expression`, details: JSON.stringify(statementSearch.Expression) });
            statementSearch.Expression = [
                ...statementSearch.Expression,
                ...buildSearchFilters({ parameters })
            ];
            log.debug({ title: `${title} filterExpression`, details: JSON.stringify(statementSearch.Expression) });

            let data = { columns: [], rows: [] };
            let statementColumns = statementSearch.Columns;
            for (let i = 0, count = statementColumns.length; i < count; i++) {
                let label = statementColumns[i].label;
                data.columns.push({
                    data: SS_String.normalize(label),
                    title: label
                });
            }
            log.debug({ title: `${title} data.columns`, details: JSON.stringify(data.columns) });

            data.rows = statementSearch.getResults();
            return data;
        };

        const getUrlValues = () => {
            return {
                Backend: SS_Url.resolveScript(SS_Constants.Scripts.CustomerStatement.Backend),
                Transaction: '/app/accounting/transactions/transaction.nl?id='
            };
        };

        const loadSearch = (options) => {
            let title = `${MODULE}.LoadSearch`;
            let { searchId } = options;
            let searchIdParam = SS_Script.getParameter({ name: searchId });
            if (!searchIdParam) {
                log.error({ title: title, details: ERROR_MISSINGPARAM({ type: ERROR_TYPES.MISSING_MEDIA_SEARCH })})
                return null;
            }

            return SS_Search.load({ id: searchIdParam });
        };

        const mapParametersToFields = (options) => {
            let title = `${MODULE}.MapParametersToFields`;
            let { parameters } = options;
            let output = {};

            for (let i = 0, count = REQUEST_PARAMS.length; i < count; i++) {
                let key = REQUEST_PARAMS[i];
                if (!parameters[key]) {
                    continue;
                }

                let field = FORM.Fields.find(f => {
                    return f.filter === true &&
                        key === SS_String.normalize(f.label);
                })?.id
                if (!field) {
                    continue;
                }
                output[field] = parameters[key];
            }
            log.debug({ title: `${title} output`, details: JSON.stringify(output) });

            return output;
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
            buildUI,
            createStatementTask,
            getRequestParameters,
            getTableData
        };
    }
);