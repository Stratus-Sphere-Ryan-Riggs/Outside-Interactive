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

            let filters = SS_Constants.Forms.CustomerStatements.Fields.filter(f => f.filter === true);
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
                success: (data) => {
                    console.log('backend response', data);
                    if (data.status <= 0) {
                        alert(data.error);
                        return;
                    }

                    let tableData = collateData(data.output);
                    window.suiteletTableData = tableData;
                    initDataTable();
                    getById('datatable_container').classList.remove('hidden');
                }
            });
        };

        const buildUrlWithParams = (options) => {
            // let urlPath = nsCR.get().getValue({ fieldId: 'custpage_url_values' });
            let urlPath = window.urlValues.Backend;
            let { action, urlParams } = options;
            let parts = [ urlPath, `action=${action}` ];

            if (!!urlParams === true) {
                parts.push(urlParams.join('&'));
            }
            console.log(`parts = ${parts.length}`, parts);
            return parts.join('&');

            // return urlPath;
        };

        const collateData = (options) => {
            let { consolidated, data } = options;
            let keys = [ 'transactionnumber' ];
            if (consolidated === false) {
                keys.push('invoicedate');
            }

            let groupedData = data.rows.reduce((objectsByKeyValue, obj) => {
                const value = keys.map(key => obj[key]).join('-');
                objectsByKeyValue[value] = (objectsByKeyValue[value] || []).concat(obj);
                return objectsByKeyValue;
            }, {});
            console.log(`groupedData`, groupedData);

            let hideColumns = [
                'id',
                'item',
                'mediafulfillment'
            ];
            let showColumns = data.columns.filter(col => hideColumns.includes(col.data) === false);
            let displayData = { rows: [] };

            let keyData = [];
            for (const [groupKey, groupValue] of Object.entries(groupedData)) {
                let rowKey = SS_String.generateRandomString();
                let rowObject = { key: rowKey, link: rowKey };

                for (let i = 0, showCount = showColumns.length; i < showCount; i++) {
                    let showCol = showColumns[i].data;

                    if (showCol === 'invoiceamount') {
                        rowObject[showCol] = groupValue.reduce((total, next) => total += parseFloat(next.invoiceamount), 0);
                    }
                    else {
                        rowObject[showCol] = groupValue[0][showCol];
                    }
                }
                console.log(`rowKey = ${rowKey}`, rowObject);

                let keyObject = { key: rowKey };
                for (let i = 0, hideCount = hideColumns.length; i < hideCount; i++) {
                    let hideCol = hideColumns[i];
                    keyObject[hideCol] = groupValue.map(g => g[hideCol]);
                }
                keyData.push(keyObject);

                displayData.rows.push(rowObject);
            }

            // DO NOT CHANGE - Specific unshift order
            showColumns.unshift({ data: 'link', title: '' });
            showColumns.unshift({ data: 'key', title: 'Select' });

            displayData.columns = showColumns;

            return {
                display: displayData,
                grouped: groupedData,
                keys: keyData,
                raw: data,
            };
        };

        const getById = (id) => {
            return document.getElementById(id);
        };

        const getSelectedIds = () => {
            let selectedRows = DATA_TABLE.column(0).checkboxes.selected();
            console.log('selectedRows', selectedRows);

            let selectedIds = [];
            let selectedKeys = [];
            jQuery.each(selectedRows, (index, value) => {
                selectedKeys.push(value);
            })
            selectedKeys = [ ...new Set(selectedKeys) ];
            console.log({ orders: selectedKeys });

            for (let i = 0, count = selectedKeys.length; i < count; i++) {
                let keyData = window.suiteletTableData.keys.find(row => row.key === selectedKeys[i]);
                selectedIds.push({ index: i, list: keyData.id });
                // selectedIds = selectedIds.concat(keyData.id);
            }
            // console.log('selectedIds', selectedIds);

            return selectedIds;
        };

        const initDataTable = () => {
            if (DataTable.isDataTable(`#${TABLE_ID}`)) {
                console.log(`destroying ${TABLE_ID}`);
                jQuery(`#${TABLE_ID}`).DataTable().destroy();
                getById(TABLE_ID).textContent = '';
            }

            let displayData = window.suiteletTableData?.display;
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

            DATA_TABLE = jQuery(`#${TABLE_ID}`).DataTable({
                columnDefs: [{
                    targets: 0,
                    checkboxes: {
                        selectAllPages: false,
                        selectRow: true
                    }
                }, {
                    targets: dataColumns.findIndex(c => c.data === 'invoiceamount'),
                    className: 'dt-body-right',
                    render: function (data) {
                        return columnIndexes.invoiceamount >= 0 ? DataTable.render.number(',', '.', 2, '$').display(data) : data;
                    }
                }, {
                    targets: dataColumns.findIndex(c => c.data === 'link') || -1,
                    className: 'dt-body-center',
                    render: function (data) {
                        return columnIndexes.link >= 0 ?
                            `<a href="#" onclick="javascript:event.preventDefault();showKeyDetails('${data.trim()}');">View Details</a>` : data;
                    }
                }, {
                    targets: dataColumns.findIndex(c => c.data === 'transactionnumber'),
                    className: 'dt-body-center',
                    render: function (data) {
                        let parts = data.split(';');
                        return columnIndexes.transactionnumber >= 0 ?
                            `<a href="${window.urlValues.Transaction}${parts[0]}" target="_blank">${parts[1]}</a>` : parts[1];
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

            /* let selectedIdValues = selectedIds.reduce((all, row) => {
                all = all.concat(row.list);
                return all;
            }, []);
            console.log('selectedIdValues', selectedIdValues);
            let selectedRowData = window.suiteletTableData.raw.rows.filter(row => selectedIds.indexOf(row.id) >= 0);
            console.log('selectedRowData', selectedRowData);

            let invoiceCount = [ ...new Set(selectedRowData.map(row => row.transactionnumber)) ].length;
            let consolidated = context.currentRecord.getValue({ fieldId: 'custpage_consolidate' });
            if (consolidated) {
                invoiceCount = [ ...new Set(selectedRowData.map(row => row.customer)) ].length;
            } */

            let statementCount = selectedIds.length;
            SS_Dialog.confirm({
                title: TITLE,
                message: `You are about to send ${statementCount} customer statement${ statementCount > 1 ? 's' : '' }. Are you sure you want to proceed?`
            }).then(result => {
                console.log('selectedIds', selectedIds);
                console.log('result', result);
                if (!result) {
                    return;
                }

                sendCustomerStatementRequest(selectedIds);
            });
            return false;
        };

        const sendCustomerStatementRequest = (idList) => {
            sendRequest({
                action: 'process_statements',
                requestParams: {
                    method: 'post',
                    headers: {
                        'Accept': 'application/json',
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({ idList })
                },
                success: (data) => {
                    console.log('backend response', data);
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
                }
            });
        };

        const sendRequest = (options) => {
            if (!options.action) {
                console.log(`Missing action.`);
                return;
            }

            console.log(`sendRequest parameters`, options.requestParams);
            let applyUrl = buildUrlWithParams(options);
            // console.log('applyUrl', applyUrl);
            // if (!applyUrl) { return; }

            // applyUrl = [ applyUrl, `action=${options.action}` ].join('&');
            console.log(`applyUrl ==> `, applyUrl);
            return;

            fetch(applyUrl, options.requestParams)
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