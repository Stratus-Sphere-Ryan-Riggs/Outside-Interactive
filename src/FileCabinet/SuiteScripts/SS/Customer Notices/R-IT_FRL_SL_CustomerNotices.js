/**
 * @NApiVersion 2.x
 * @NScriptType Suitelet
 * @NModuleScope Public
 */

define(['N/ui/serverWidget', 'N/record', 'N/error', 'N/search', 'N/format', 'N/runtime', 'N/render', 'N/email', 'N/task'],

    function (serverWidget, record, error, search, format, runtime, render, email, task) {

        var process = "Customer Notices";

        /**
         * Definition of the Suitelet script trigger point.         
         * @param {Object} context
         * @param {ServerRequest} context.request - Encapsulation of the incoming request
         * @param {ServerResponse} context.response - Encapsulation of the Suitelet response
         */
        function onRequest(context) {

            try {

                var form = serverWidget.createForm({
                    title: 'Send Customer Notices'
                });

                form.clientScriptModulePath = './R-IT_FRL_CS_CustomerNotices.js'

                log.debug(process, 'Begin SuiteLet');

                //GROUPS AND TABS            
                var filtersGroup = form.addFieldGroup({
                    id: 'filtersgroup',
                    label: 'Search Criteria'
                });

                var grupoDatos = form.addFieldGroup({
                    id: 'infoadd',
                    label: 'Informacion Adicional'
                });

                var tabDetails = form.addTab({
                    id: 'tabdetail',
                    label: 'Details'
                });

                var subTabCust = form.addSubtab({
                    id: 'subtabcust',
                    label: 'Customer Overdue Balance',
                    tab: 'tabdetail'
                });

                var subTabInv = form.addSubtab({
                    id: 'subtabinv',
                    label: 'Overdue Invoices',
                    tab: 'tabdetail'
                });

                var subTabStatements = form.addSubtab({
                    id: 'subtabstatements',
                    label: 'Email Statements',
                    tab: 'tabdetail'
                });

                // FIELDS
                var btnAction = form.addField({
                    id: 'custpage_optionflag',
                    label: 'Option Flag:',
                    type: serverWidget.FieldType.TEXT,
                    container: 'filtersgroup'
                }).updateDisplayType({
                    displayType: serverWidget.FieldDisplayType.HIDDEN
                });
                btnAction.defaultValue = "Notice";

                var subsidiary = form.addField({
                    id: 'custpage_subsid',
                    label: 'Subsidiary',
                    type: serverWidget.FieldType.SELECT,
                    source: 'subsidiary',
                    container: 'filtersgroup'
                });
                //subsidiary.isMandatory = true;

                var levels = form.addField({
                    id: 'custpage_levels',
                    label: 'Levels',
                    source: 'customlist_ss_dunning_levels',
                    type: serverWidget.FieldType.SELECT,
                    container: 'filtersgroup'
                });

                var customer = form.addField({
                    id: 'custpage_customer',
                    label: 'Customer',
                    type: serverWidget.FieldType.SELECT,
                    source: 'customer',
                    container: 'filtersgroup'
                });

                var condition = form.addField({
                    id : 'custpage_condition',
                    type : serverWidget.FieldType.SELECT,
                    label : 'Condition',
                    container: 'filtersgroup'
                });

                var cas = form.addField({
                    id: 'custpage_cas',
                    label: 'CAS',
                    type: serverWidget.FieldType.SELECT,
                    source: 'employee',
                    container: 'filtersgroup'
                });

                log.debug(process, 'SuiteLet2');

                condition.addSelectOption({
                    value : '',
                    text : ''
                });
                condition.addSelectOption({
                    value : 'equalGreat',
                    text : 'Equal To or Greater Than'
                });
                condition.addSelectOption({
                    value : 'equalLess',
                    text : 'Equal To or Less Than'
                });
                condition.addSelectOption({
                    value : 'equal',
                    text : 'Equal To'
                });

                log.debug(process, 'SuiteLet3');

                condition.updateBreakType({
                    breakType : serverWidget.FieldBreakType.STARTROW
                });
                
                var openBalance = form.addField({
                    id: 'custpage_open_balance',
                    label: 'Open Balance (USD)',
                    type: serverWidget.FieldType.CURRENCY,
                    container: 'filtersgroup'
                });

                var lastcomm = form.addField({
                    id: 'custpage_lastcomm',
                    label: 'Last Communication',
                    source: 'customlist_ss_last_comm',
                    type: serverWidget.FieldType.DATE,
                    container: 'filtersgroup'
                });

                if (!empty(context.request.parameters.custpage_subsid)) {
                    subsidiary.defaultValue = context.request.parameters.custpage_subsid;
                }

                if (!empty(context.request.parameters.custpage_levels)) {
                    levels.defaultValue = context.request.parameters.custpage_levels;
                }

                if (!empty(context.request.parameters.custpage_customer)) {
                    customer.defaultValue = context.request.parameters.custpage_customer;
                }

                if (!empty(context.request.parameters.custpage_cas)) {
                    cas.defaultValue = context.request.parameters.custpage_cas;
                }

                if (!empty(context.request.parameters.custpage_lastcomm)) {
                    log.audit("AAABC", "A_ " + context.request.parameters.custpage_lastcomm)
                    lastcomm.defaultValue = context.request.parameters.custpage_lastcomm;
                }

                if (!empty(context.request.parameters.custpage_condition) && !empty(context.request.parameters.custpage_open_balance)) {
                    condition.defaultValue = context.request.parameters.custpage_condition;
                    openBalance.defaultValue = context.request.parameters.custpage_open_balance;
                }

                log.debug(process, 'SuiteLet4');
                // DUNNING SUBLIST
                var sublistCustomers = form.addSublist({
                    id: 'listcustlevel',
                    type: serverWidget.SublistType.LIST,
                    label: 'Customers to send letters',
                    tab: 'subtabcust'
                });

                sublistCustomers.addField({
                    id: 'toprocess',
                    label: 'To be processed',
                    type: serverWidget.FieldType.CHECKBOX
                }).updateDisplayType({
                    displayType: serverWidget.FieldDisplayType.ENTRY
                });

                sublistCustomers.addField({
                    id: 'customersf',
                    label: 'Customer',
                    type: serverWidget.FieldType.SELECT,
                    source: 'customer'
                }).updateDisplayType({
                    displayType: serverWidget.FieldDisplayType.INLINE
                });

                sublistCustomers.addField({
                    id: 'subsidiarysf',
                    label: 'Subsidiary',
                    type: serverWidget.FieldType.TEXT
                }).updateDisplayType({
                    displayType: serverWidget.FieldDisplayType.INLINE
                });

                sublistCustomers.addField({
                    id: 'ninvoices',
                    label: 'Number of Invoices',
                    type: serverWidget.FieldType.TEXT
                }).updateDisplayType({
                    displayType: serverWidget.FieldDisplayType.INLINE
                });

                sublistCustomers.addField({
                    id: 'amountremaining',
                    label: 'Amount Past Due (USD)',
                    type: serverWidget.FieldType.CURRENCY
                }).updateDisplayType({
                    displayType: serverWidget.FieldDisplayType.INLINE
                });

                sublistCustomers.addField({
                    id: 'openbalance',
                    label: 'Open Balance (USD)',
                    type: serverWidget.FieldType.CURRENCY
                }).updateDisplayType({
                    displayType: serverWidget.FieldDisplayType.INLINE
                });

                /*sublistCustomers.addField({
                    id: 'currencysf',
                    label: 'Currency',
                    type: serverWidget.FieldType.TEXT
                }).updateDisplayType({
                    displayType: serverWidget.FieldDisplayType.INLINE
                });*/

                sublistCustomers.addField({
                    id: 'duedatesf',
                    label: 'Due Date',
                    type: serverWidget.FieldType.DATE
                }).updateDisplayType({
                    displayType: serverWidget.FieldDisplayType.INLINE
                });

                sublistCustomers.addField({
                    id: 'dunninglevelsf',
                    label: 'Current Dunning Level',
                    type: serverWidget.FieldType.TEXT,
                    //source: 'customlist_ss_dunning_levels'
                }).updateDisplayType({
                    displayType: serverWidget.FieldDisplayType.INLINE
                });

                sublistCustomers.addField({
                    id: 'dunningleveljson',
                    label: 'DunningLevelJSON',
                    type: serverWidget.FieldType.TEXT
                }).updateDisplayType({
                    displayType: serverWidget.FieldDisplayType.HIDDEN
                });

                sublistCustomers.addField({
                    id: 'languagesf',
                    label: 'Language',
                    type: serverWidget.FieldType.TEXT
                }).updateDisplayType({
                    displayType: serverWidget.FieldDisplayType.INLINE
                });

                sublistCustomers.addField({
                    id: 'daysoverduesf',
                    label: 'Days Overdue',
                    type: serverWidget.FieldType.TEXT
                }).updateDisplayType({
                    displayType: serverWidget.FieldDisplayType.INLINE
                });

                sublistCustomers.addField({
                    id: 'lastcommsf',
                    label: 'Last Communication',
                    type: serverWidget.FieldType.DATE
                }).updateDisplayType({
                    displayType: serverWidget.FieldDisplayType.INLINE
                });

                sublistCustomers.addMarkAllButtons();
                log.debug(process, 'SuiteLet5');
                //BUTTONS
                form.addSubmitButton({
                    label: 'Send Notices'
                });

                if (context.request.method === 'GET') {
                    log.debug(process, 'SuiteLet6');
                    var respDunningInfo = getDunningInfo();
                    log.debug(process, 'respDunningInfo: ' + JSON.stringify(respDunningInfo));
                    if (!respDunningInfo.error && respDunningInfo.data.result.length > 0) {
                        //log.debug(process, JSON.stringify(respDunningInfo.data.result));
                        loadSubList(sublistCustomers, respDunningInfo.data, false);
                    }
                    log.debug(process, 'SuiteLet7');
                    context.response.writePage(form);
                } else {
                    var accountSubsidiaries = getAcctSubsidiaries();
                    log.debug(process, 'POST custpage_optionflag' + context.request.parameters.custpage_optionflag);
                    var optionFlag = empty(context.request.parameters.custpage_optionflag) ? context.request.parameters.submitter : context.request.parameters.custpage_optionflag;
                    log.debug(process, 'POST optionFlag: ' + optionFlag);

                    var btnIds = ['NextLevel', 'Level1', 'Level2', 'Level3', 'Level4'];
                    var option = !(btnIds.indexOf(optionFlag) == -1);

                    if (!empty(optionFlag)) {

                        if (optionFlag == 'Notice') {
                            var contextRequest = context.request;
                            var lineCount = contextRequest.getLineCount({ group: 'listcustlevel' });
                            var customersArr = [];
                            for (var i = 0; i < lineCount; i++) {
                                var lineSelected = contextRequest.getSublistValue({ group: 'listcustlevel', name: 'toprocess', line: i });
                                if (lineSelected == 'T') {
                                    var dunningLevel = "Notice";
                                    var custObj = {
                                        customer: contextRequest.getSublistValue({ group: 'listcustlevel', name: 'customersf', line: i }),
                                        level: dunningLevel,
                                        subsidiary: accountSubsidiaries[contextRequest.getSublistValue({ group: 'listcustlevel', name: 'subsidiarysf', line: i })]
                                    }
                                    customersArr.push(custObj);
                                }
                            }
                            var script = runtime.getCurrentScript();
                            var sendDunningScriptId = script.getParameter('custscript_ss_mr_script_notices');
                            // var sendDunningScriptDeploymentId = script.getParameter('custscript_mr_script_dep_dunning_st');
                            // sendDl(customersArr, sendDunningScriptId, sendDunningScriptDeploymentId);
                            sendDl(customersArr, sendDunningScriptId);
                            //NEW
                            var respDunningInfo = getDunningInfo();

                            if (!respDunningInfo.error && respDunningInfo.data.result.length > 0) {
                                //log.debug(process, JSON.stringify(respDunningInfo.data.result));
                                loadSubList(sublistCustomers, respDunningInfo.data, false);
                                clearFilters(subsidiary, levels, customer, condition, openBalance, cas, lastcomm);
                            }
                            //END NEW
                        } else if (optionFlag == 'FILTERS') {

                            log.debug(process, 'Begin FILTERS');

                            var respDunningInfo = getDunningInfo(subsidiary.defaultValue, levels.defaultValue, customer.defaultValue, condition.defaultValue, openBalance.defaultValue, cas.defaultValue, lastcomm.defaultValue);

                            if (!respDunningInfo.error && respDunningInfo.data.result.length > 0) {
                                log.debug(process, JSON.stringify(respDunningInfo));

                                loadSubList(sublistCustomers, respDunningInfo.data, false);
                            }
                        }
                    }
                    context.response.writePage(form);
                }
            } catch (excep) {
                log.error(process, 'Excepcion : ' + excep.message);
            }
        }

        function loadSubList(sublistCustomers, data, markAll) {

            var objResponse = { error: false, message: '' };

            try {
                log.audit("MM", data.result.length);
                if (!empty(data) && data.result.length > 0) {

                    for (var i = 0; i < data.result.length; i++) {

                        if (markAll) {
                            sublistCustomers.setSublistValue({
                                id: 'toprocess',
                                line: i,
                                value: 'T'
                            });
                        }

                        var customer = data.result[i].getValue({ name: data.columns[0] });
                        if (!empty(customer)) {
                            sublistCustomers.setSublistValue({
                                id: 'customersf',
                                line: i,
                                value: customer
                            });
                        }

                        var subsidiary = data.result[i].getValue({ name: data.columns[1] });
                        log.debug('MM SUBS.', JSON.stringify(data.result[i]));
                        if (!empty(subsidiary)) {
                            sublistCustomers.setSublistValue({
                                id: 'subsidiarysf',
                                line: i,
                                value: subsidiary
                            });
                        }


                        var noInvoices = data.result[i].getValue({ name: data.columns[2] });
                        if (!empty(noInvoices)) {
                            sublistCustomers.setSublistValue({
                                id: 'ninvoices',
                                line: i,
                                value: noInvoices
                            });
                        }


                        var amtRemaining = data.result[i].getValue({ name: data.columns[3] });
                        if (!empty(amtRemaining)) {
                            sublistCustomers.setSublistValue({
                                id: 'amountremaining',
                                line: i,
                                value: amtRemaining
                            });
                        }

                        var openBalance = data.result[i].getValue({ name: data.columns[12] });
                        if (!empty(openBalance)) {
                            sublistCustomers.setSublistValue({
                                id: 'openbalance',
                                line: i,
                                value: openBalance
                            });
                        }

                        var currency = data.result[i].getText({ name: data.columns[4] });
                        /*if (!empty(currency)) {
                            sublistCustomers.setSublistValue({
                                id: 'currencysf',
                                line: i,
                                value: currency
                            });
                        }*/


                        var dueDate = data.result[i].getValue({ name: data.columns[5] });
                        if (!empty(dueDate)) {
                            sublistCustomers.setSublistValue({
                                id: 'duedatesf',
                                line: i,
                                value: dueDate
                            });
                        }


                        var currentDunningLevel = data.result[i].getValue({ name: data.columns[7] });
                        if (!empty(currentDunningLevel)) {
                            sublistCustomers.setSublistValue({
                                id: 'dunninglevelsf',
                                line: i,
                                value: currentDunningLevel
                            });
                        }

                        /*sublistCustomers.setSublistValue({
                            id: 'dunningleveljson',
                            line: i,
                            value: data.result[i].getValue({ name: data.columns[7] })
                        });*/

                        var language = data.result[i].getText({ name: data.columns[8] })
                        if (!empty(language)) {
                            sublistCustomers.setSublistValue({
                                id: 'languagesf',
                                line: i,
                                value: language
                            });
                        }

                        var daysOverdue = data.result[i].getValue({ name: data.columns[9] });
                        if (!empty(daysOverdue)) {
                            sublistCustomers.setSublistValue({
                                id: 'daysoverduesf',
                                line: i,
                                value: daysOverdue
                            });
                        }

                        var lastCommDate = data.result[i].getValue({ name: data.columns[11] });
                        if (!empty(lastCommDate)) {
                            sublistCustomers.setSublistValue({
                                id: 'lastcommsf',
                                line: i,
                                value: lastCommDate
                            });
                        }
                    }
                }

            } catch (exL) {
                objResponse.error = true;
                objResponse.message = 'Exception - Details: ' + exL.message;
                log.debug(process, JSON.stringify(objResponse));
            }

            return objResponse;
        }

        function sendDl(customersArr, mrScriptId, mrDeploymentId) {
            log.debug('sendDl customersArr', JSON.stringify(customersArr));
            var objResponse = { error: false, message: '', data: null };
            try {
                var mrScriptTask = task.create({
                    taskType: task.TaskType.MAP_REDUCE,
                    scriptId: mrScriptId,
                    // deploymentId: mrDeploymentId,
                    params: {
                        custscript_ss_notices_customer_array: JSON.stringify(customersArr)
                    }
                });
                var taskId = mrScriptTask.submit();
                log.debug("sendDl", "mapReduceTaskId: " + taskId);
            } catch (ex) {
                objResponse.error = true;
                objResponse.message = 'Exception - Details: ' + ex.message;
                log.debug(process, JSON.stringify(objResponse));
            }
        }

        function getDunningInfo(subsid, dlevel, customer, condition, openBalance, cas, lastcomm) {

            var objResponse = { error: false, message: '', data: null };

            try {
                var searchObj = search.load({
                    id: 'customsearch_ss_dunning_4'
                });

                var filters = searchObj.filterExpression;

                //log.debug(process, JSON.stringify(filters));

                if (!empty(subsid)) {
                    filters.push("AND", ["subsidiary", "anyof", subsid]);
                }

                if (!empty(cas)) {
                    filters.push("AND", ["customermain.custentity_cas", "anyof", cas]);
                }

                if (!empty(lastcomm)) {
                    filters.push("AND", [["custbody_ss_last_statement_comm_date","onorbefore",lastcomm],"OR",["custbody_ss_last_statement_comm_date","isempty",""]]);
                }

                if (!empty(customer)) {
                    filters.push("AND", ["name", "anyof", customer]);
                }

                if (!empty(condition) && !empty(openBalance)) {
                    if(condition == "equal"){
                        filters.push("AND", ["sum(amountremaining)", "equalto", openBalance]);
                    }else if(condition == "equalGreat"){
                        filters.push("AND", ["sum(amountremaining)", "greaterthanorequalto", openBalance]);
                    }else if(condition == "equalLess"){
                        filters.push("AND", ["sum(amountremaining)", "lessthanorequalto", openBalance]);
                    }
                }

                // var levelIds = [null, '1', '2', '3', '0', '4'];
                var levelIds = [null, '0', '1', '2', '3', '4'];
                var dunningLevelNum = levelIds[dlevel];
                log.audit('MM', "dlevel: " + dlevel);
                log.audit('MM', "dunningLevelNum: " + dunningLevelNum);
                if (!empty(dlevel)) {
                    if (dunningLevelNum == '0') {
                        filters.push("AND", ["max(daysoverdue)", "between", 0, 0]);
                    } else if (dunningLevelNum == '1') {
                        filters.push("AND", ["max(daysoverdue)", "between", 1, 30]);
                    } else if (dunningLevelNum == '2') {
                        filters.push("AND", ["max(daysoverdue)", "between", 31, 60]);
                    } else if (dunningLevelNum == '3') {
                        filters.push("AND", ["max(daysoverdue)", "between", 61, 90]);
                    } else if (dunningLevelNum == '4') {
                        filters.push("AND", ["max(daysoverdue)", "greaterthan", 90, 0]);
                    }
                }
                //filters.push("AND", ["max(custbody_ss_dunning_levels)", "is", levelIds[dlevel]]);

                searchObj.filterExpression = filters;
                log.debug(process, JSON.stringify(searchObj.filterExpression));


                searchObj = pagSearch(searchObj.run());

                if (!empty(searchObj) && searchObj.result.length > 0) {
                    objResponse.data = searchObj;
                }
            } catch (exD) {
                objResponse.error = true;
                objResponse.message = 'Exception - Details: ' + exD.message;
            }
            return objResponse;
        }

        function clearFilters(subsidiary, levels, customer, condition, openBalance, cas, lastcomm) {
            var logTitle = "clearFilters";
            try {
                subsidiary.defaultValue = null;
                levels.defaultValue = null;
                customer.defaultValue = null;
                condition.defaultValue = null;
                openBalance.defaultValue = null;
                cas.defaultValue = null;
                lastcomm.defaultValue = null;
            } catch (exD) {
                log.error(logTitle, 'error: ' + exD);
            }
        }


        function pagSearch(searchSet) {

            var finalResultSet = null;
            var auxResult;
            var i = 0;
            var resultStep = 1000; // N rows returned per loop (max 1000)

            do {
                auxResult = searchSet.getRange({ start: i, end: i + resultStep });

                if (!empty(auxResult) && auxResult.length > 0) {
                    finalResultSet = ((i === 0) ? auxResult : finalResultSet.concat(auxResult));
                }

                i += resultStep;

            } while (!empty(auxResult) && auxResult.length > 0)

            return { result: finalResultSet, columns: searchSet.columns };
        }

        function getAcctSubsidiaries() {
            try {
                var retArr = [];
                var subsidiarySearchObj = search.create({
                    type: "subsidiary",
                    filters:[],
                    columns:[search.createColumn({ name: "namenohierarchy", label: "Name (no hierarchy)" }), search.createColumn({ name: "internalid", label: "Internal ID" })]
                });
                subsidiarySearchObj.run().each(function (result) {
                    retArr[result.getValue('namenohierarchy')] = result.getValue('internalid');
                    return true;
                });
                return retArr;
            } catch (exD) {
                log.error(logTitle, 'error: ' + exD);
            }
        }

        function empty(val) {
            return val === '' || val === null || val === undefined;
        }

        return {
            onRequest: onRequest
        };

    });