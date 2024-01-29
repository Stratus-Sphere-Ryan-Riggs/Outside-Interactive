/**
 * @NApiVersion         2.1
 * @NModuleScope        SameAccount
 */

define(
    [
        './SS_Constants',
        './SS_DataTableTask',
        './SS_Search',
        './SS_UI'
    ],
    (
        SS_Constants,
        SS_DataTableTask,
        SS_Search,
        SS_UI
    ) => {
        const MODULE = `SS|DunningStatements`;
        const FORM = SS_Constants.Forms.DUNNING_STATEMENTS;
        const REQUEST_PARAMS = SS_Constants.RequestParameters;
        const REQUEST_FIELDS = REQUEST_PARAMS.DUNNING_STATEMENTS;
        const OPERATOR = SS_Search.Operator;
        const TRANSACTION = SS_Constants.Transaction;

        const buildSearchFilters = (options) => {
            const TITLE = `${MODULE}.BuildSearchFilters`;
            let {
                balance,
                cas,
                condition,
                customer,
                inProgress,
                lastcomm,
                level,
                subsidiary
            } = options;
            log.debug({ title: `${TITLE} options`, details: JSON.stringify(options) });
            let filters = [];

            if (cas) {
                filters = filters.concat([
                    [ `customermain.${SS_Constants.Entity.CustomFields.CAS}`, OPERATOR.ANYOF, cas ],
                    'AND'
                ]);
            }

            if (customer) {
                filters = filters.concat([
                    [ TRANSACTION.Fields.NAME, OPERATOR.ANYOF, customer ],
                    'AND'
                ]);
            }

            if (lastcomm) {
                filters = filters.concat([
                    [
                        [ TRANSACTION.CustomFields.LAST_COMMUNICATION_DATE, OPERATOR.ONORBEFORE, lastcomm ],
                        'OR',
                        [ TRANSACTION.CustomFields.LAST_COMMUNICATION_DATE, OPERATOR.ISEMPTY, null ]
                    ],
                    'AND'
                ]);
            }

            if (subsidiary) {
                filters = filters.concat([
                    [
                        TRANSACTION.Fields.SUBSIDIARY, OPERATOR.ANYOF, subsidiary
                    ],
                    'AND'
                ]
                );
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
                    [ `sum(${TRANSACTION.Fields.AMOUNT_REMAINING})`, operator, balance ],
                    'AND'
                ]);
            }

            let dunningLevel = SS_Constants.CustomLists.DunningLevels.Values.find(d => d.id === level);
            if (dunningLevel) {
                filters = filters.concat([
                    [ `max(${TRANSACTION.Fields.DAYS_OVERDUE})`, OPERATOR.BETWEEN, dunningLevel.from, dunningLevel.to ],
                    'AND'
                ]);
            }

            if (filters.length > 0) {
                filters.pop();
            }
            log.debug({ title: `${TITLE} END`, details: JSON.stringify(filters) });

            return filters;
        };

        const send = (options) => {
            const TITLE = `${MODULE}.Send`;
            let { body, query, response, script } = options;
            log.debug({ title: `${TITLE} body`, details: body });
            
            // Create MR Task
            let dtTask = SS_DataTableTask.create({
                data: body,
                type: SS_Constants.CustomLists.DataTableSuiteletTypes.DUNNING_STATEMENTS
            });
            log.debug({ title: `${TITLE} dtTask`, details: JSON.stringify(dtTask) });

            response.write({
                output: JSON.stringify(dtTask)
            });
        };

        const render = (options) => {
            const TITLE = `${MODULE}.Render`;
            let { request, response, defaultValues } = options;

            let queryParameters = SS_UI.readQueryParameters({ fields: REQUEST_FIELDS, request });
            log.debug({ title: `${TITLE} queryParameters`, details: JSON.stringify(queryParameters) });

            let parameterFields = SS_UI.mapParametersToFields({
                fields: REQUEST_FIELDS,
                form: FORM,
                parameters: queryParameters
            });
            log.debug({ title: `${TITLE} parameterFields`, details: JSON.stringify(parameterFields) });

            defaultValues = {
                ...defaultValues,
                ...parameterFields
            };
            log.debug({ title: `${TITLE} defaultValues`, details: JSON.stringify(defaultValues) });

            return SS_UI.buildForm({
                config: FORM,
                defaultValues: defaultValues
            });
        };
        
        return {
            buildSearchFilters,
            render,
            send
        };
    }
);