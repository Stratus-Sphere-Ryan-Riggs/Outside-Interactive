/**
 * @NApiVersion         2.1
 * @NScriptType         ClientScript       
 * @NModuleScope        SameAccount
 */

define(
    [
        '../common/SS_Constants',
        '../common/SS_CurrentRecord',
        '../common/SS_Dialog',
        '../common/SS_Format',
        '../common/SS_String',

        './SS_Constants_CustomerStatements'
    ],
    (
        SS_Constants,
        SS_CR,
        SS_Dialog,
        SS_Format,
        SS_String
    ) => {
        const TABLE_ID = 'custpage_table';
        const TITLE = 'Send Customer Statements';
        let DATA_TABLE = null;

        const applyFilters = () => {
            let thisRecord = SS_CR.get();
            let params = [];

            let filters = SS_Constants.Forms.DUNNING_STATEMENTS.Fields.filter(f => f.filter === true);
            for (let i = 0, count = filters.length; i < count; i++) {
                let key = SS_String.normalize(filters[i].label);
                console.log(`key = "${key}"`);

                let value = thisRecord.getValue({ fieldId: filters[i].id });
                if (['lastcommunication'].includes(key)) {
                    value = thisRecord.getText({ fieldId: filters[i].id });
                }
                if (!value) { continue; }

                params.push(`${key}=${value}`);
            }
            console.log('params', params);

            sendRequest({
                urlParams: params,
                action: 'search',
                type: SS_Constants.CustomLists.DataTableSuiteletTypes.DUNNING_STATEMENTS,
                success: (data) => {
                    console.log('backend response', data);
                    if (data.status === false) {
                        alert(data.error);
                        return;
                    }

                    window.suiteletTableData = data.output;
                    initDataTable();
                    getById('datatable_container').classList.remove('hidden');
                }
            });
        };

        const buildUrlWithParams = (options) => {
            let urlPath = window.urlValues.Backend;
            let { action, type, urlParams } = options;
            let parts = [ urlPath, `action=${action}`, `sltype=${type}` ];

            if (urlParams) {
                if (urlParams.length > 0) {
                    parts.push(urlParams.join('&'));
                }
            }
            console.log(`parts = ${parts.length}`, parts);
            return parts.join('&');
        };

        const getById = (id) => {
            return document.getElementById(id);
        };

        const getSelectedIds = () => {
            let selectedRows = DATA_TABLE.column(0).checkboxes.selected();
            console.log('selectedRows', selectedRows);

            let selectedIds = [];
            jQuery.each(selectedRows, (index, rowValue) => {
                console.log(`getSelectedIds index=${index}`, rowValue);
                let inputText = query(`#${TABLE_ID} input[type="text"][data-override-client="${rowValue}"]`);
                console.log(`#${TABLE_ID} input[type="text"][data-override-client="${rowValue}"]`, inputText);
                console.log('input value', inputText.value);
                selectedIds.push({
                    id: rowValue,
                    override: inputText.value
                });
            });
            selectedIds = [ ...new Set(selectedIds) ];
            console.log({ orders: selectedIds });
            
            return selectedIds;
        };

        const initDataTable = () => {
            if (DataTable.isDataTable(`#${TABLE_ID}`)) {
                console.log(`destroying ${TABLE_ID}`);
                jQuery(`#${TABLE_ID}`).DataTable().destroy();
                getById(TABLE_ID).textContent = '';
            }

            // let displayData = window.suiteletTableData?.display;
            let displayData = window.suiteletTableData;
            if (!displayData) {
                console.log('displayData is NULL');
                return;
            }
            
            console.log('displayData', displayData);
            let dataColumns = displayData.columns;
            let columnIndexes = {};
            for (let i = 0, count = dataColumns.length; i < count; i++) {
                let col = dataColumns[i];
                columnIndexes[col.data] = dataColumns.findIndex(c => c.data === col.data);
            }
            console.log(`columnIndexes`, columnIndexes);

            DATA_TABLE = jQuery(`#${TABLE_ID}`).DataTable({
                columnDefs: [{
                    targets: 0,
                    checkboxes: {
                        selectAllPages: false,
                        selectRow: true
                    }
                }, {
                    targets: dataColumns.findIndex(c => c.data === 'amountpastdueusd'),
                    className: 'dt-body-right',
                    render: function (data) {
                        return columnIndexes.amountpastdueusd >= 0 ? DataTable.render.number(',', '.', 2, '$').display(data) : data;
                    }
                }, {
                    targets: dataColumns.findIndex(c => c.data === 'openbalanceusd'),
                    className: 'dt-body-right',
                    render: function (data) {
                        return columnIndexes.openbalanceusd >= 0 ? DataTable.render.number(',', '.', 2, '$').display(data) : data;
                    }
                }, {
                    targets: dataColumns.findIndex(c => c.data === 'overrideemailrecipients') || -1,
                    render: function (data) {
                        return columnIndexes.overrideemailrecipients >= 0 ?
                            `<input type="text" style="padding:4px 6px; width: 250px; font-size: inherit;" data-override-client="${data.trim()}">` : data;
                    }
                }],
                columns: dataColumns,
                data: displayData.rows,
                pageLength: 25,
                pagingType: 'full_numbers',
                order: [[1, 'asc']],
                select: { style: 'multi' }
            });
        };

        const pageInit = (context) => {
            console.log('hello');
            window.onbeforeunload = null;
            
            let tableElement = getById(TABLE_ID);
            console.log(`pageInit`, tableElement);
            if (!tableElement) {
                return;
            }

            let layoutTable = tableElement.closest('.uir-outside-fields-table');
            layoutTable.style.width = "100%";
            layoutTable.style.margin = "20px 0 0 0";

            let urlValues = context.currentRecord.getValue({ fieldId: 'custpage_url_values' });
            console.log(`urlValues => ${urlValues}`);
            if (urlValues) {
                window.urlValues = JSON.parse(urlValues);
            }
            applyFilters();
        };

        const query = (selector) => {
            return document.querySelector(selector);
        };

        const saveRecord = (context) => {
            if (!DataTable.isDataTable(`#${TABLE_ID}`)) {
                SS_Dialog.alert({
                    title: 'WARNING: No data found.',
                    message: 'Click on the "Apply Filters" button to retrieve data from the server.'
                });
                return;
            }

            let selectedIds = getSelectedIds();
            if (selectedIds.length <= 0) {
                SS_Dialog.alert({
                    title: 'WARNING: No rows selected.',
                    message: 'Please select at least one row to generate.'
                });
                return;
            }
            console.log('selectedIds', selectedIds);

            let statementCount = selectedIds.length;
            SS_Dialog.confirm({
                title: TITLE,
                message: `You are about to send ${statementCount} customer statement${ statementCount > 1 ? 's' : '' }. Are you sure you want to proceed?`
            }).then(result => {
                console.log('dialog selectedIds', selectedIds);
                console.log('result', result);
                if (!result) {
                    return;
                }

                sendCustomerStatementRequest(selectedIds);
            });
            return false;
        };

        const sendCustomerStatementRequest = (list) => {
            sendRequest({
                action: 'dunning_statement',
                requestParams: {
                    method: 'post',
                    headers: {
                        'Accept': 'application/json',
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({ list })
                },
                success: (data) => {
                    console.log('POST backend response', data);
                    if (!data.status) {
                        SS_Dialog.alert({
                            message: data.error,
                            title: `ERROR: ${TITLE}`
                        });
                        return;
                    }

                    console.log('here...');
                    SS_Dialog.alert({
                        message: `The task has been queued successfully.<br><br><a href="${data.url}" target="_blank">View Task Status</a>`,
                        title: `SUCCESS: ${TITLE}`
                    });
                    applyFilters();
                },
                type: SS_Constants.CustomLists.DataTableSuiteletTypes.DUNNING_STATEMENTS
            });
        };

        const sendRequest = (options) => {
            const TITLE = `sendRequest`;
            let { action, requestParams, success } = options;
            if (!action) {
                console.log(`Missing action.`);
                return;
            }

            console.log(`sendRequest parameters`, requestParams);
            let applyUrl = buildUrlWithParams(options);
            // console.log('applyUrl', applyUrl);
            // if (!applyUrl) { return; }

            // applyUrl = [ applyUrl, `action=${options.action}` ].join('&');
            console.log(`applyUrl ==> `, applyUrl);
            // return;

            fetch(applyUrl, requestParams)
                .then(data => data.json())
                .then(options.success);
        };

        return {
            applyFilters,
            pageInit,
            saveRecord
        };
    }
);