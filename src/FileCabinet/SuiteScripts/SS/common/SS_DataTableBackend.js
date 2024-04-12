/**
 * @NApiVersion         2.1
 * @NModuleScope        SameAccount
 */

define(
    [
        './SS_Constants',
        './SS_File',
        './SS_Script',
        './SS_Search',
        './SS_String',
        './SS_UI',
        './SS_Url',

        './SS_DunningStatements',
    ],
    (
        SS_Constants,
        SS_File,
        SS_Script,
        SS_Search,
        SS_String,
        SS_UI,
        SS_Url,

        SS_DunningStatements,
    ) => {
        const MODULE = `SS|DataTableBackend`;
        const TYPES = SS_Constants.CustomLists.DataTableSuiteletTypes;

        const HANDLERS = {
            'dunning_statement': SS_DunningStatements.send
        };

        const buildSearchFilters = (options) => {
            const TITLE = `${MODULE}.BuildSearchFilters`;
            let { parameters } = options;
            let filters = [];

            switch (parameters.type) {
                case TYPES.DUNNING_STATEMENTS: {
                    filters = SS_DunningStatements.buildSearchFilters(parameters);
                    break;
                }
            }

            return filters;
        };

        const getInProgressTasks = (options) => {
            const TITLE = `${MODULE}.GetInProgressTasks`;
            let { searchId, type } = options;

            let taskSearch = SS_Search.load({ id: searchId });
            if (!taskSearch) {
                log.error({ title: TITLE, details: `Unable to load Customer Statement Task saved search.` });
                return;
            }
            taskSearch.Expression = [
                ...taskSearch.Expression,
                'AND',
                [ SS_Constants.CustomRecords.DataTableTask.Fields.TYPE, 'anyof', type ]
            ];
            
            let inProgress = [];
            let tasks = taskSearch.getResults();
            for (let i = 0, count = tasks.length; i < count; i++) {
                log.debug({ title: `${TITLE} i=${i} task`, details: JSON.stringify(tasks[i]) });
                let contents = tasks[i].data;
                let jsonContents = JSON.parse(contents);
                log.debug({ title: `${TITLE} i=${i} inProgress`, details: JSON.stringify(jsonContents) });

                inProgress = inProgress.concat(jsonContents.list.map(d => d.id));
            }
            inProgress = [ ...new Set(inProgress) ];
            log.debug({ title: `${TITLE} inProgress = ${inProgress.length}`, details: JSON.stringify(inProgress) });

            return inProgress;
        };

        const getTableData = (options) => {
            const TITLE = `${MODULE}.GetTableData`;
            let { query, searchId } = options;
            log.debug({ title: `${TITLE} options`, details: JSON.stringify(options) });

            let dataRowSearch = SS_Search.load({ id: searchId });
            if (!dataRowSearch) {
                log.error({ title: TITLE, details: `Unable to load DataTable rows saved search.` });
                return null;
            }

            log.debug({ title: `${TITLE} parameters`, details: JSON.stringify(query) });
            log.debug({ title: `${TITLE} dataRowSearch.Expression`, details: JSON.stringify(dataRowSearch.Expression) });
            let filters = buildSearchFilters({ parameters: query });
            if (filters.length > 0) {
                filters.unshift('AND');
            }
            // log.debug({ title: `${TITLE} ...dataRowSearch.Expression`, details: JSON.stringify(...dataRowSearch.Expression) });
            log.debug({ title: `${TITLE} filters`, details: JSON.stringify(filters) });

            dataRowSearch.Expression = [ ...dataRowSearch.Expression, ...filters ];
            log.debug({ title: `${TITLE} filterExpression`, details: JSON.stringify(dataRowSearch.Expression) });

            let data = { columns: [], rows: [] };
            let dataRowColumns = dataRowSearch.Columns;
            for (let i = 0, count = dataRowColumns.length; i < count; i++) {
                let label = dataRowColumns[i].label;
                let labelId = SS_String.normalize(label);
                if (labelId.indexOf('_text') > 0) {
                    log.audit({ title: `${TITLE} labelId BEFORE TEXT`, details: `labelId BEFORE TRIM = ${labelId}` });
                    labelId = labelId.substring(0, labelId.indexOf('_text'));
                    log.audit({ title: `${TITLE} labelId AFTER TEXT`, details: `labelId AFTER TRIM = ${labelId}` });
                }
                data.columns.push({
                    data: labelId,
                    title: label
                });
            }
            log.debug({ title: `${TITLE} data.columns`, details: JSON.stringify(data.columns) });

            data.rows = dataRowSearch.getResults();
            return data;
        };

        const process = (options) => {
            const TITLE = `${MODULE}.Process`;
            let { request, response } = options;
            
            const scriptParams = readScriptParameters({ response });
            if (!scriptParams) { return; }
            log.debug({ title: `${TITLE} scriptParams`, details: JSON.stringify(scriptParams) });

            const queryParameters = readQueryParameters(options);
            if (!queryParameters) { return; }

            if (queryParameters.action.toLowerCase() === 'search') {
                search({
                    body: request.body,
                    query: queryParameters,
                    response,
                    script: scriptParams
                })
            }
            else {
                const handler = HANDLERS[queryParameters.action];
                if (!handler) {
                    sendError({
                        error: `Missing handler for action (${queryParameters.action}).`,
                        response,
                        title: TITLE
                    });
                    return;
                }
    
                HANDLERS[queryParameters.action].apply(
                    null,
                    [{
                        body: request.body,
                        query: queryParameters,
                        response,
                        script: scriptParams
                    }]
                );
            }
        };

        const readQueryParameters = (options) => {
            const TITLE = `${MODULE}.ReadQueryParameters`;
            let { request, response } = options;
            let { parameters } = request;
            let err = '';

            if (!parameters.action) {
                sendError({
                    error: `Missing required parameter: Action.`,
                    response,
                    title: TITLE
                });
                return null;
            }

            if (!parameters.sltype) {
                sendError({
                    error: `Missing required parameter: Suitelet Type.`,
                    response,
                    title: TITLE
                });
                return null;
            }

            let returnValues = {
                action: parameters.action,
                type: parameters.sltype
            };
            for (const [key, val] of Object.entries(parameters)) {
                returnValues[key] = val;
            }

            return returnValues;
        };

        const readScriptParameters = (options) => {
            const TITLE = `${MODULE}.ReadScriptParameters`;
            const PARAMS = SS_Constants.ScriptParameters.DataTableSuiteletBackend;
            let { response } = options;

            let scriptParams = {
                inProgressTaskSearch    : SS_Script.getParameter({ name: PARAMS.InProgressTasks }),
                rowSearch               : SS_Script.getParameter({ name: PARAMS.RowSearch }),
                taskFolder              : SS_Script.getParameter({ name: PARAMS.TaskFolder })
            };

            if (!scriptParams.inProgressTaskSearch) {
                sendError({
                    error: `Missing required value: In Progress Tasks saved search.`,
                    response,
                    title: TITLE
                });
                return null;
            }

            if (!scriptParams.rowSearch) {
                sendError({
                    error: `Missing required value: Data Table Rows saved search.`,
                    response,
                    title: TITLE
                });
                return null;
            }

            if (!scriptParams.taskFolder) {
                sendError({
                    error: `Missing required value: Tasks Folder ID.`,
                    response,
                    title: TITLE
                });
                return null;
            }

            return scriptParams;
        };

        const search = (options) => {
            const TITLE = `${MODULE}.Search`;
            log.debug({ title: TITLE, details: JSON.stringify(options) });
            let { query, response, script } = options;
            
            let inProgressTasks = getInProgressTasks({
                searchId: script.inProgressTaskSearch,
                type: query.type
            });

            let tableData = getTableData({
                query,
                searchId: script.rowSearch
            });
            tableData.rows = tableData.rows.filter(row => inProgressTasks.indexOf(row.id) < 0);
            log.debug({ title: `${TITLE} tableData = ${tableData.rows.length}`, details: JSON.stringify([tableData.rows[0]]) });

            response.write({
                output: JSON.stringify({
                    status: true,
                    output: tableData
                })
            });
        };

        const sendError = (options) => {
            const TITLE = `${MODULE}.SendError`;
            let { error, response, title } = options;

            log.error({ title: `${TITLE}:${title}`, details: JSON.stringify(error) });
            response.write({
                output: JSON.stringify({
                    status: false,
                    error
                })
            });
        };

        return {
            process
        };
    }
);