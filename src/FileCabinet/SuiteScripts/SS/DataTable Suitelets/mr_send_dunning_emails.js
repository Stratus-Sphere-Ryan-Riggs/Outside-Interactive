/**
 *@NApiVersion 2.1
 *@NScriptType MapReduceScript
 */
define(['N/record', 'N/search', 'N/runtime', 'N/format', 'N/runtime', 'N/render', 'N/email', 'N/xml', 'N/file'],
    function (record, search, runtime, format, runtime, render, email, xml, file) {

        const CURRENCIES = { 'USD': '$', 'GBP': '£', 'CAD': '$', 'EUR': '€', 'AUD': '$', 'MXN': '$', 'JPY': '￥', 'NZD': '$' }
        const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']

        function getInputData() {
            var logTitle = 'getInputData';
            try {
                log.debug(logTitle, "Script Start");
                var script = runtime.getCurrentScript();
                var customersArrayStr = script.getParameter('custscript_ss_customers_array');
                var customersArray = JSON.parse(customersArrayStr);
                return customersArray;
            } catch (error) {
                log.error(logTitle, 'error: ' + error);
            }
        }

        function reduce(context) {
            var logTitle = 'reduce';
            var errorEmailSender;
            try {
                log.debug(logTitle, "Reduce Start");
                log.debug(logTitle, "context: " + JSON.stringify(context));
                var contextValues = JSON.parse(context.values[0]);

                //SBX
                //var dunningIds = [null, 1, 2, 3, null, 4, 'Statement']; //ver PROD.
                //PROD
                var dunningIds = [null, null, 1, 2, 3, 4, 'Statement'];
                var script = runtime.getCurrentScript();
                var invoiceSearchId = script.getParameter('custscript_ss_invoices_saved_search');
                var invoiceGroupComponentsSearchId = script.getParameter('custscript_ss_invoices_group_comp');
                var dunningSearchId = script.getParameter('custscript_ss_dunnings_search');
                var dunningMessageSearchId = script.getParameter('custscript_ss_dunning_msg_search');
                var emailMessageSearchId = script.getParameter('custscript_ss_email_msg_search');
                var statementFormId = script.getParameter('custscript_ss_statement_form');
                var fileCabinetFolderForInvoicePdfs = script.getParameter('custscript_ss_invoice_pdf_folder');
                var invoiceGroupEmailTemplateId = script.getParameter('custscript_ss_invoice_group_template');
                log.debug(logTitle, "statementFormId: " + statementFormId);
                var invoiceSearch = search.load({ id: invoiceSearchId });
                var dunningSearch = search.load({ id: dunningSearchId });
                var emailMessageSearch = search.load({ id: emailMessageSearchId });
                var dunningMessageSearch = search.load({ id: dunningMessageSearchId });
                var dunningLevel = contextValues.level;
                var customerId = contextValues.customer;
                var subsId = contextValues.subsidiary;
                var overrideEmailsList = contextValues.overrideEmails;

                log.debug(logTitle, "dunningLevel: " + dunningLevel);
                log.debug(logTitle, "customerId: " + customerId);
                log.debug(logTitle, "subsId sss: " + subsId);

                var dunningLevelId = dunningIds.indexOf(dunningLevel);
                log.debug(logTitle, "dunningLevelId: " + dunningLevelId);
                if (!isEmpty(dunningLevelId)) {
                    var levelFilter = search.createFilter({
                        name: 'custrecord_ss_level',
                        operator: search.Operator.ANYOF,
                        values: dunningLevelId
                    });
                    dunningSearch.filters.push(levelFilter);
                    var dunningRecordId;
                    dunningSearch.run().each(function (result) {
                        dunningRecordId = result.getValue('internalid')
                        return false;
                    });
                    log.debug(logTitle, "dunningRecordId: " + dunningRecordId);

                    if (!isEmpty(dunningRecordId)) {
                        var customerLanguageObj = search.lookupFields({
                            type: record.Type.CUSTOMER,
                            id: customerId,
                            columns: ["language", "companyname"],
                        });
                        log.debug(logTitle, "customerLanguageObj: " + JSON.stringify(customerLanguageObj));
                        var customerLanguage = customerLanguageObj.language[0].text;
                        var customerName = customerLanguageObj.companyname;
                        log.debug(logTitle, "customerLanguage: " + customerLanguage);

                        var dunningRecordFilter = search.createFilter({
                            name: 'custrecord_ss_dunning_parent',
                            operator: search.Operator.ANYOF,
                            values: dunningRecordId
                        });
                        dunningMessageSearch.filters.push(dunningRecordFilter);
                        var dunningMessageRecordId, dunningMessageDefaultRecordId;
                        dunningMessageSearch.run().each(function (result) {
                            var dunningMessageLanguage = result.getText('custrecord_ss_dunning_language');
                            var dunningMessageSubsidiary = result.getValue('custrecord_ss_dunning_subsidiary');
                            var dunningMessageDefault = result.getValue('custrecord_ss_dunning_default');
                            log.debug(logTitle, "dunningMessageLanguage: " + dunningMessageLanguage + ". dunningMessageSubsidiary: " + dunningMessageSubsidiary + ". dunningMessageDefault: " + dunningMessageDefault);
                            log.debug(logTitle, "customerLanguage: " + customerLanguage + ". subsId: " + subsId);
                            if (dunningMessageLanguage == customerLanguage && dunningMessageSubsidiary == subsId) {
                                dunningMessageRecordId = result.getValue('internalid');
                                return false;
                            } else if (dunningMessageDefault == true) {
                                dunningMessageDefaultRecordId = result.getValue('internalid');
                            }
                            return true;
                            /*var dunningMessageLanguage = result.getText('custrecord_ss_dunning_language');
                            log.debug(logTitle, "dunningMessageLanguage: " + dunningMessageLanguage);
                            if (dunningMessageLanguage == customerLanguage) {
                                dunningMessageRecordId = result.getValue('internalid');
                                return false;
                            } else if (dunningMessageLanguage == 'English (US)') {
                                dunningMessageEnglishRecordId = result.getValue('internalid');
                            }
                            return true;*/
                        });
                        log.debug(logTitle, "dunningMessageRecordId: " + dunningMessageRecordId);
                        log.debug(logTitle, "dunningMessageDefaultRecordId: " + dunningMessageDefaultRecordId);

                        dunningMessageRecordId = !isEmpty(dunningMessageRecordId) ? dunningMessageRecordId : dunningMessageDefaultRecordId;
                        log.audit("MaM", "dunningMessageRecordId " + dunningMessageRecordId);
                        if (!isEmpty(dunningMessageRecordId)) {
                            log.audit("MaM", "dunningMessageRecordId !empty");
                            var dunningMessageInfo = search.lookupFields({ type: "customrecord_ss_dunning_message", id: dunningMessageRecordId, columns: ['custrecord_ss_dunning_message', 'custrecord_ss_dunning_subject', 'custrecord_ss_dunning_signature'], });
                            var message = dunningMessageInfo.custrecord_ss_dunning_message;
                            var subject = dunningMessageInfo.custrecord_ss_dunning_subject;
                            //DATE
                            const today = new Date();
                            const yyyy = today.getFullYear();
                            let mm = today.getMonth() + 1;
                            let dd = today.getDate();

                            if (dd < 10) dd = '0' + dd;
                            if (mm < 10) mm = '0' + mm;

                            const formattedToday = mm + '/' + dd + '/' + yyyy;
                            subject = subject.replace('{client}', customerName);
                            subject = subject.replace('{today}', formattedToday);

                            message = message.replace('{client}', customerName);
                            message = message.replace('{today}', formattedToday);

                            var signature = dunningMessageInfo.custrecord_ss_dunning_signature;
                            //var dunningInfo = search.lookupFields({ type: "customrecord_ss_dunning_set_up", id: dunningRecordId, columns: 'custrecord_ss_dunning_email' });
                            //var sender = dunningInfo.custrecord_ss_dunning_email[0].value;
                            var dunningMessageInfo = search.lookupFields({ type: "customrecord_ss_dunning_message", id: dunningMessageRecordId, columns: 'custrecord_ss_dunning_sent_from' });
                            var sender = dunningMessageInfo.custrecord_ss_dunning_sent_from[0].value;
                            errorEmailSender = sender;
                            var invoiceEmails = [];


                            var singleInvoices = [];
                            var groupsCovered = [];
                            var bodyStr = message;
                            log.audit("MaM", "contextValues.invoice " + contextValues.invoice);
                            if (!isEmpty(contextValues.invoice)) {
                                log.audit("MaM", "contextValues.invoiceGroup " + contextValues.invoiceGroup);
                                bodyStr += '<br /><br /><table style="width:98%; border: 1px solid black; border-collapse: collapse;"><th style="width:11%;  border: 1px solid black; border-collapse: collapse; background-color: #E2E2E2;">Advertiser</th><th style="width:14%;  border: 1px solid black; border-collapse: collapse; background-color: #E2E2E2;">Invoice</th><th style="width:13%; border: 1px solid black; border-collapse: collapse; background-color: #E2E2E2;">Invoice Date</th><th style="width:13%; border: 1px solid black; border-collapse: collapse; background-color: #E2E2E2;">Due Date</th><th style="width:9%; border: 1px solid black; border-collapse: collapse; background-color: #E2E2E2;">Days Overdue</th><th style="width:6%; border: 1px solid black; border-collapse: collapse; background-color: #E2E2E2;">Currency</th>  <th style="width:17%; border: 1px solid black; border-collapse: collapse; background-color: #E2E2E2;">Invoice Amount</th><th style="width:17%; border: 1px solid black; border-collapse: collapse; background-color: #E2E2E2;">Amount Remaining</th>';
                                if (contextValues.invoiceGroup) {
                                    groupsCovered.push(contextValues.invoice);
                                    var invoiceGroupComponentsSearch = search.load({ id: invoiceGroupComponentsSearchId });
                                    var groupFilter = search.createFilter({
                                        name: 'groupedto',
                                        operator: search.Operator.ANYOF,
                                        values: contextValues.invoice
                                    });
                                    invoiceGroupComponentsSearch.filters.push(groupFilter);
                                    var maxDaysOverdue = 0;
                                    var groupAmount = 0;
                                    var groupAmountRemaining = 0;
                                    var groupCurrency;
                                    var advertiser;
                                    invoiceGroupComponentsSearch.run().each(function (component) {
                                        groupCurrency = component.getText('currency');
                                        var compDaysOverdue = component.getValue('daysoverdue');
                                        if (compDaysOverdue > maxDaysOverdue) {
                                            maxDaysOverdue = Number(compDaysOverdue);
                                        }
                                        //fx?
                                        groupAmount += Number(component.getValue('amount'));
                                        groupAmountRemaining += Number(component.getValue('amountremaining'));
                                        advertiser = component.getValue('custbody_atlas_advertiser_lst');
                                        return true;
                                    });

                                    log.debug("MMM", JSON.stringify(contextValues));
                                    var invoiceGroupInfo = search.lookupFields({
                                        type: "invoicegroup",
                                        id: contextValues.invoiceId,
                                        columns: ["custrecord_pom_email_for_notification", "trandate", "duedate"],
                                    });
                                    var invoiceGroupEmail = invoiceGroupInfo.custrecord_pom_email_for_notification;
                                    var dueDate = new Date(invoiceGroupInfo.duedate);
                                    var invDate = new Date(invoiceGroupInfo.trandate);

                                    if (!isEmpty(invoiceGroupEmail) && (invoiceEmails.indexOf(invoiceGroupEmail) == -1)) {
                                        invoiceEmails.push(invoiceGroupEmail);
                                    }

                                    bodyStr += '<tr style="text-align: center;">    <td style="width:11%; border: 1px solid black; border-collapse: collapse;">' + advertiser + '</td>    <td style="width:14%; border: 1px solid black; border-collapse: collapse;">' + contextValues.invoice + '</td>    <td style="width:13%; border: 1px solid black; border-collapse: collapse;">' + formatLongDate(invDate) + '</td>    <td style="width:13%; border: 1px solid black; border-collapse: collapse;">' + formatLongDate(dueDate) + '</td>    <td style="width:9%; border: 1px solid black; border-collapse: collapse;">' + maxDaysOverdue + '</td>    <td style="width:6%; border: 1px solid black; border-collapse: collapse;">' + groupCurrency + '</td>    <td style="width:17%; border: 1px solid black; border-collapse: collapse;">' + format.format({ value: groupAmount, type: format.Type.CURRENCY }) + '</td>    <td style="width:17%; border: 1px solid black; border-collapse: collapse;">' + format.format({ value: groupAmountRemaining, type: format.Type.CURRENCY }) + '</td></tr>';
                                    var invoiceGroupNumFilter = search.createFilter({
                                        name: 'groupedto',
                                        operator: search.Operator.ANYOF,
                                        values: contextValues.invoice
                                    });
                                    invoiceSearch.filters.push(invoiceGroupNumFilter);
                                } else {
                                    log.audit("MaM", "!invoiceGroup" + contextValues.invoiceId);
                                    singleInvoices.push(contextValues.invoiceId);
                                    var invoiceInfo = search.lookupFields({
                                        type: record.Type.INVOICE,
                                        id: contextValues.invoiceId,
                                        columns: ["invoicenum", "daysoverdue", "currency", "amount", "amountremaining", "custbody_email_address_invoice", "trandate", "duedate", "custbody_atlas_advertiser_lst, custbody_ss_primary_billing_email"],
                                    });
                                    var dueDate = new Date(invoiceInfo.duedate);
                                    var invDate = new Date(invoiceInfo.trandate);
                                    var invNum = invoiceInfo.invoicenum;
                                    var invDaysOverdue = invoiceInfo.daysoverdue;
                                    log.audit("MaM", "invoiceInfo " + JSON.stringify(invoiceInfo));
                                    var invCurrency = invoiceInfo.currency[0].text;
                                    var invAmount = invoiceInfo.amount;
                                    var invAmountRemaining = invoiceInfo.amountremaining;
                                    var advertiser = !isEmpty(invoiceInfo.custbody_atlas_advertiser_lst[0]) ? invoiceInfo.custbody_atlas_advertiser_lst[0].text : "";

                                    bodyStr += '<tr style="text-align: center;"> <td style="width:11%; border: 1px solid black; border-collapse: collapse;">' + advertiser + '</td> <td style="width:14%; border: 1px solid black; border-collapse: collapse;">' + invNum + '</td> <td style="width:13%; border: 1px solid black; border-collapse: collapse;">' + formatLongDate(invDate) + '</td> <td style="width:13%; border: 1px solid black; border-collapse: collapse;">' + formatLongDate(dueDate) + '</td> <td style="width:9%; border: 1px solid black; border-collapse: collapse;">' + invDaysOverdue + '</td> <td style="width:6%; border: 1px solid black; border-collapse: collapse;">' + invCurrency + '</td><td style="width:17%; border: 1px solid black; border-collapse: collapse;">' + format.format({ value: invAmount, type: format.Type.CURRENCY }) + '</td><td style="width:17%; border: 1px solid black; border-collapse: collapse;">' + format.format({ value: invAmountRemaining, type: format.Type.CURRENCY }) + '</td></tr>';

                                    var invoiceIdFilter = search.createFilter({
                                        name: 'internalid',
                                        operator: search.Operator.ANYOF,
                                        values: contextValues.invoiceId
                                    });
                                    invoiceSearch.filters.push(invoiceIdFilter);
                                    var emailAddressesForNotification = invoiceInfo.custbody_email_address_invoice;
                                    var primaryEmails = invoiceInfo.custbody_ss_primary_billing_email;

                                    var emailsArr = [];
                                    if (!isEmpty(primaryEmails) && !isEmpty(emailAddressesForNotification)) {
                                        emailsArr = primaryEmails.split(';').concat(emailAddressesForNotification.split(';'));
                                    } else if (!isEmpty(primaryEmails) && isEmpty(emailAddressesForNotification)) {
                                        emailsArr = primaryEmails.split(';');
                                    } else if (isEmpty(primaryEmails) && !isEmpty(emailAddressesForNotification)) {
                                        emailsArr = emailAddressesForNotification.split(';');
                                    }
                                    emailsArr = removeDuplicates(emailsArr);
                                    log.debug('setEmails', 'emailsArr: ' + JSON.stringify(emailsArr));
                                    for (var i = 0; i < emailsArr.length; i++) {
                                        if (invoiceEmails.indexOf(emailsArr[i]) == -1) {
                                            invoiceEmails.push(emailsArr[i]);
                                        }
                                    }
                                }
                                bodyStr += '</table>';
                            } else {
                                log.audit("MaM", "!invoice");
                                var customerFilter = search.createFilter({
                                    name: 'internalid',
                                    join: 'customermain',
                                    operator: search.Operator.ANYOF,
                                    values: customerId
                                });
                                invoiceSearch.filters.push(customerFilter);
                                var subsidiaryFilter = search.createFilter({
                                    name: 'subsidiary',
                                    operator: search.Operator.ANYOF,
                                    values: subsId
                                });
                                invoiceSearch.filters.push(subsidiaryFilter);

                                var totalAmountRemaining = 0;
                                var currency;
                                var rowsArr = [];
                                var currencies = [];
                                invoiceSearch.run().each(function (result) {
                                    var group = result.getValue('groupedto');
                                    if (isEmpty(group)) {
                                        var dueDate = new Date(result.getValue('duedate'));
                                        var invDate = new Date(result.getValue('trandate'));
                                        //bodyStr += '<tr style="text-align: center;"><td style="width:18%; border: 1px solid black; border-collapse: collapse;">' + result.getValue('invoicenum') + '</td>  <td style="width:13%; border: 1px solid black; border-collapse: collapse;">' + formatLongDate(invDate) + '</td> <td style="width:13%; border: 1px solid black; border-collapse: collapse;">' + formatLongDate(dueDate) + '</td> <td style="width:12%; border: 1px solid black; border-collapse: collapse;">' + result.getValue('daysoverdue') + '</td><td style="width:22%; border: 1px solid black; border-collapse: collapse;">' + CURRENCIES[result.getText('currency')] + format.format({ value: result.getValue('amount'), type: format.Type.CURRENCY }) + '</td><td style="width:22%; border: 1px solid black; border-collapse: collapse;">' + CURRENCIES[result.getText('currency')] + format.format({ value: result.getValue('amountremaining'), type: format.Type.CURRENCY }) + '</td></tr>';
                                        //totalAmountRemaining += Number(result.getValue('amountremaining'));

                                        var resObj = {
                                            invNum: result.getValue('invoicenum'),
                                            invDate: formatLongDate(invDate),
                                            dueDate: formatLongDate(dueDate),
                                            daysOverdue: result.getValue('daysoverdue'),
                                            currency: result.getText('currency'),
                                            amount: format.format({ value: result.getValue('fxamount'), type: format.Type.CURRENCY }),
                                            amountRemaining: format.format({ value: result.getValue('fxamountremaining'), type: format.Type.CURRENCY }),
                                            advertiser: result.getText('custbody_atlas_advertiser_lst')
                                        };
                                        rowsArr.push(resObj);

                                        if (currencies.indexOf(result.getText('currency')) == -1) {
                                            currencies.push(result.getText('currency'));
                                        }
                                        var invoiceEmailForNotifications = result.getValue('custbody_email_address_invoice');

                                        var emailAddressesForNotification = result.getValue('custbody_email_address_invoice');
                                        var primaryEmails = result.getValue('custbody_ss_primary_billing_email')

                                        var emailsArr = [];
                                        if (!isEmpty(primaryEmails) && !isEmpty(emailAddressesForNotification)) {
                                            emailsArr = primaryEmails.split(';').concat(emailAddressesForNotification.split(';'));
                                        } else if (!isEmpty(primaryEmails) && isEmpty(emailAddressesForNotification)) {
                                            emailsArr = primaryEmails.split(';');
                                        } else if (isEmpty(primaryEmails) && !isEmpty(emailAddressesForNotification)) {
                                            emailsArr = emailAddressesForNotification.split(';');
                                        }
                                        emailsArr = removeDuplicates(emailsArr);
                                        log.debug('setEmails', 'emailsArr: ' + JSON.stringify(emailsArr));
                                        for (var i = 0; i < emailsArr.length; i++) {
                                            if (invoiceEmails.indexOf(emailsArr[i]) == -1) {
                                                invoiceEmails.push(emailsArr[i]);
                                            }
                                        }
                                        singleInvoices.push(result.getValue('internalid'));
                                    } else {
                                        if (groupsCovered.indexOf(group) == -1) {
                                            var groupNum = result.getText('groupedto');
                                            var groupDates = search.lookupFields({
                                                type: 'invoicegroup',
                                                id: groupNum,
                                                columns: ["trandate", "duedate", "custrecord_pom_email_for_notification"],
                                            });
                                            var dueDate = new Date(groupDates.duedate);
                                            var invDate = new Date(groupDates.trandate);
                                            var invoiceEmailForNotifications = groupDates.custrecord_pom_email_for_notification;

                                            var invoiceGroupComponentsSearch = search.load({ id: invoiceGroupComponentsSearchId });
                                            var groupFilter = search.createFilter({
                                                name: 'groupedto',
                                                operator: search.Operator.ANYOF,
                                                values: group
                                            });
                                            invoiceGroupComponentsSearch.filters.push(groupFilter);
                                            var maxDaysOverdue = 0;
                                            var groupAmount = 0;
                                            var groupAmountRemaining = 0;
                                            var groupCurrency;
                                            var advertiser;
                                            invoiceGroupComponentsSearch.run().each(function (component) {
                                                groupCurrency = component.getText('currency');
                                                var compDaysOverdue = component.getValue('daysoverdue');
                                                if (compDaysOverdue > maxDaysOverdue) {
                                                    maxDaysOverdue = Number(compDaysOverdue);
                                                }
                                                groupAmount += Number(component.getValue('fxamount'));
                                                groupAmountRemaining += Number(component.getValue('fxamountremaining'));
                                                advertiser = result.getText('custbody_atlas_advertiser_lst');
                                                return true;
                                            });
                                            //bodyStr += '<tr style="text-align: center;"><td style="width:18%; border: 1px solid black; border-collapse: collapse;">' + "Invoice #" + groupNum + '</td> <td style="width:13%; border: 1px solid black; border-collapse: collapse;">' + formatLongDate(invDate) + '</td> <td style="width:13%; border: 1px solid black; border-collapse: collapse;">' + formatLongDate(dueDate) + '</td>  <td style="width:12%; border: 1px solid black; border-collapse: collapse;">' + maxDaysOverdue + '</td><td style="width:22%; border: 1px solid black; border-collapse: collapse;">' + CURRENCIES[groupCurrency] + format.format({ value: groupAmount, type: format.Type.CURRENCY }) + '</td><td style="width:22%; border: 1px solid black; border-collapse: collapse;">' + CURRENCIES[groupCurrency] + format.format({ value: groupAmountRemaining, type: format.Type.CURRENCY }) + '</td></tr>';
                                            //totalAmountRemaining += Number(groupAmountRemaining);
                                            groupsCovered.push(group);

                                            var resObj = {
                                                invNum: "Invoice #" + groupNum,
                                                invDate: formatLongDate(invDate),
                                                dueDate: formatLongDate(dueDate),
                                                daysOverdue: maxDaysOverdue,
                                                currency: groupCurrency,
                                                amount: format.format({ value: groupAmount, type: format.Type.CURRENCY }),
                                                amountRemaining: format.format({ value: groupAmountRemaining, type: format.Type.CURRENCY }),
                                                advertiser: advertiser
                                            };
                                            rowsArr.push(resObj);
                                            if (currencies.indexOf(groupCurrency) == -1) {
                                                currencies.push(groupCurrency);
                                            }

                                            if (!isEmpty(invoiceEmailForNotifications) && (invoiceEmails.indexOf(invoiceEmailForNotifications) == -1)) {
                                                invoiceEmails.push(invoiceEmailForNotifications);
                                            }
                                        }
                                    }
                                    currency = result.getText('currency');

                                    return true;
                                });
                                var groupedRows = groupByKey(rowsArr, 'currency');
                                log.debug("MM2", JSON.stringify(groupedRows));
                                log.debug("MM2", JSON.stringify(currencies));
                                //var formattedAmountRemaining = format.format({ value: totalAmountRemaining, type: format.Type.CURRENCY });
                                //bodyStr += '<tr style="text-align: center;"><td style="width:18%; border-left: 1px solid white; border-bottom: 1px solid white;"> </td><td style="width:13%; border-bottom: 1px solid white;"> </td><td style="width:13%; border-bottom: 1px solid white;"> </td><td style="width:12%; border-bottom: 1px solid white;"> </td><td style="width:22%; border-bottom: 1px solid white;"> </td><td style="width:22%; border: 1px solid black; border-collapse: collapse; background-color: #E2E2E2; font-weight: bold;">' + CURRENCIES[currency] + formattedAmountRemaining + '</td></tr>';
                                for (var i = 0; i < currencies.length; i++) {
                                    var currencyRows = groupedRows[currencies[i]];
                                    bodyStr += '<br /><br /><table style="width:98%; border: 1px solid black; border-collapse: collapse;"><th style="width:11%;  border: 1px solid black; border-collapse: collapse; background-color: #E2E2E2;">Advertiser</th><th style="width:14%;  border: 1px solid black; border-collapse: collapse; background-color: #E2E2E2;">Invoice</th><th style="width:13%; border: 1px solid black; border-collapse: collapse; background-color: #E2E2E2;">Invoice Date</th><th style="width:13%; border: 1px solid black; border-collapse: collapse; background-color: #E2E2E2;">Due Date</th><th style="width:9%; border: 1px solid black; border-collapse: collapse; background-color: #E2E2E2;">Days Overdue</th><th style="width:6%; border: 1px solid black; border-collapse: collapse; background-color: #E2E2E2;">Currency</th>  <th style="width:17%; border: 1px solid black; border-collapse: collapse; background-color: #E2E2E2;">Invoice Amount</th><th style="width:17%; border: 1px solid black; border-collapse: collapse; background-color: #E2E2E2;">Amount Remaining</th>';
                                    for (var j = 0; j < currencyRows.length; j++) {
                                        bodyStr += '<tr style="text-align: center;"> <td style="width:11%; border: 1px solid black; border-collapse: collapse;">' + currencyRows[j].advertiser + '</td> <td style="width:14%; border: 1px solid black; border-collapse: collapse;">' + currencyRows[j].invNum + '</td> <td style="width:13%; border: 1px solid black; border-collapse: collapse;">' + currencyRows[j].invDate + '</td> <td style="width:13%; border: 1px solid black; border-collapse: collapse;">' + currencyRows[j].dueDate + '</td> <td style="width:9%; border: 1px solid black; border-collapse: collapse;">' + currencyRows[j].daysOverdue + '</td> <td style="width:6%; border: 1px solid black; border-collapse: collapse;">' + currencyRows[j].currency + '</td><td style="width:17%; border: 1px solid black; border-collapse: collapse;">' + currencyRows[j].amount + '</td><td style="width:17%; border: 1px solid black; border-collapse: collapse;">' + currencyRows[j].amountRemaining + '</td></tr>';
                                    }
                                    bodyStr += '</table>';
                                }

                            }
                            log.audit("MaM", "AAA ");

                            bodyStr += '<br />';
                            bodyStr += signature;

                            var renderer = render.create();
                            renderer.templateContent = bodyStr;
                            var emailBody = renderer.renderAsString();

                            log.audit("MM1", "SubsidiaryId: " + subsId);
                            var customerStatement = render.statement({ entityId: Number(customerId), printMode: render.PrintMode.PDF, openTransactionsOnly: true, inCustLocale: true, formId: Number(statementFormId), subsidiaryId: Number(subsId) });

                            var consolidatedPDF;
                            if (!isEmpty(contextValues.invoice)) {
                                if (contextValues.invoiceGroup) {
                                    var renderer = render.create();
                                    renderer.setTemplateById(invoiceGroupEmailTemplateId);
                                    renderer.addRecord({
                                        templateName: 'record',
                                        record: record.load({
                                            type: 'invoicegroup',
                                            id: Number(contextValues.invoiceId)
                                        }),
                                    });
                                    consolidatedPDF = renderer.renderAsPdf();
                                    consolidatedPDF.name = "Invoice.pdf";
                                } else {
                                    consolidatedPDF = render.transaction({ entityId: Number(contextValues.invoiceId), printMode: render.PrintMode.PDF });
                                    consolidatedPDF.name = "Invoice.pdf";
                                }
                            } else {
                                //Consolidate Invoice PDFs
                                var xmlInvoices = "<?xml version=\"1.0\"?>\n<!DOCTYPE pdf PUBLIC \"-//big.faceless.org//report\" \"report-1.1.dtd\">\n";
                                xmlInvoices += "<pdfset>";
                                for (var i = 0; i < singleInvoices.length; i++) {
                                    log.audit("MM1", "singleInvoices[i]: " + singleInvoices[i]);
                                    var pdfFile = render.transaction({ entityId: Number(singleInvoices[i]), printMode: render.PrintMode.PDF });
                                    log.audit("MM1", "pdfFile1 Ok");
                                    pdfFile.folder = fileCabinetFolderForInvoicePdfs;
                                    pdfFile.isOnline = true;
                                    var fileId = pdfFile.save();
                                    var fileUrl = file.load({ id: fileId }).url;
                                    var pdfFileUrl = xml.escape({ xmlText: fileUrl });
                                    xmlInvoices += "<pdf src='" + pdfFileUrl + "'/>";
                                }
                                log.audit("MM1", "groupsCovered.length" + groupsCovered.length);
                                for (var i = 0; i < groupsCovered.length; i++) {
                                    log.audit("MM1", "groupsCovered[i]" + groupsCovered[i]);
                                    //var pdfFile = render.transaction({ entityId: Number(groupsCovered[i]), printMode: render.PrintMode.PDF });
                                    var renderer = render.create();
                                    renderer.setTemplateById(invoiceGroupEmailTemplateId);
                                    renderer.addRecord({
                                        templateName: 'record',
                                        record: record.load({
                                            type: 'invoicegroup',
                                            id: Number(groupsCovered[i])
                                        }),
                                    });
                                    var pdfFile = renderer.renderAsPdf();
                                    log.audit("MM1", "pdfFileG Ok. name: " + pdfFile.name);
                                    pdfFile.folder = fileCabinetFolderForInvoicePdfs;
                                    pdfFile.isOnline = true;
                                    pdfFile.name = "report_" + groupsCovered[i].toString() + ".pdf";
                                    var fileId = pdfFile.save();
                                    var fileUrl = file.load({ id: fileId }).url;
                                    var pdfFileUrl = xml.escape({ xmlText: fileUrl });
                                    xmlInvoices += "<pdf src='" + pdfFileUrl + "'/>";
                                }
                                log.audit("MM1", "pdfFiles Ok.");
                                xmlInvoices += "</pdfset>";
                                consolidatedPDF = render.xmlToPdf({ xmlString: xmlInvoices });
                                consolidatedPDF.name = "Invoices.pdf";
                            }

                            var customerSalesRepInfo = search.lookupFields({
                                type: record.Type.CUSTOMER,
                                id: customerId,
                                columns: ["salesrep", "email"],
                            });
                            //var customerSalesRep = customerSalesRepInfo.salesrep[0];
                            var customerEmail = customerSalesRepInfo.email;
                            if (!isEmpty(customerEmail) && (invoiceEmails.indexOf(customerEmail) == -1)) {
                                invoiceEmails.push(customerEmail);
                            }
                            log.debug("MM", "Emails: " + JSON.stringify(invoiceEmails));
                            if (invoiceEmails.length > 0) {
                                var additionals = getAdditionalRecipients(customerId);
                                if (!isEmpty(sender)) {
                                    var invoiceEmails = invoiceEmails.concat(additionals);
                                    invoiceEmails = removeDuplicates(invoiceEmails);

                                    if(!isEmpty(overrideEmailsList)){
                                        var overrideEmailsListArr = overrideEmailsList.replace(/\s/g, '');
                                        var recipientsArr = overrideEmailsListArr.split(";");
                                        var cleanRecipientsArr = cleanRecipientsArray(recipientsArr);
                                        email.send({
                                            author: sender,
                                            recipients: cleanRecipientsArr,
                                            subject: subject,
                                            body: emailBody,
                                            attachments: [customerStatement, consolidatedPDF],
                                            relatedRecords: { entityId: customerId }
                                        });
                                    }else{
                                        const chunkSize = 10;
                                        for (let i = 0; i < invoiceEmails.length; i += chunkSize) {
                                            const chunk = invoiceEmails.slice(i, i + chunkSize);
                                            email.send({
                                                author: sender,
                                                recipients: chunk,
                                                subject: subject,
                                                body: emailBody,
                                                attachments: [customerStatement, consolidatedPDF],
                                                relatedRecords: { entityId: customerId }
                                            });
                                        }
                                    }
                                    var emailMessageId;
                                    var customerFilter = search.createFilter({
                                        name: 'internalid',
                                        join: 'customer',
                                        operator: search.Operator.ANYOF,
                                        values: customerId
                                    });
                                    emailMessageSearch.filters.push(customerFilter);
                                    emailMessageSearch.run().each(function (result) {
                                        emailMessageId = result.getValue('internalid')
                                        return false;
                                    });
                                    var dateToday = new Date();
                                    //dateToday = format.format({ value: dateToday, type: format.Type.DATE });

                                    log.debug(logTitle, "AAA::" + dunningLevel);
                                    log.debug(logTitle, "bbb::" + JSON.stringify(singleInvoices));
                                    log.debug(logTitle, "bbb2::" + JSON.stringify(groupsCovered));
                                    for (var i = 0; i < singleInvoices.length; i++) {
                                        createStatementEmailRecord(null, singleInvoices[i], emailMessageId, dateToday);
                                        if (dunningLevel == 'Statement') {
                                            log.debug(logTitle, "A1::" + singleInvoices[i]);
                                            record.submitFields({
                                                type: record.Type.INVOICE,
                                                id: singleInvoices[i],
                                                values: { 'custbody_ss_last_statement_comm_date': dateToday }
                                            });
                                        } else {
                                            log.debug(logTitle, "A2::" + singleInvoices[i]);
                                            record.submitFields({
                                                type: record.Type.INVOICE,
                                                id: singleInvoices[i],
                                                values: { 'custbody_ss_last_dunning_comm_date': dateToday }
                                            });
                                        }
                                    }
                                    for (var i = 0; i < groupsCovered.length; i++) {
                                        var invoiceGroupComponentsSearch = search.load({ id: invoiceGroupComponentsSearchId });
                                        var groupFilter = search.createFilter({
                                            name: 'groupedto',
                                            operator: search.Operator.ANYOF,
                                            values: groupsCovered[i]
                                        });
                                        invoiceGroupComponentsSearch.filters.push(groupFilter);
                                        invoiceGroupComponentsSearch.run().each(function (component) {
                                            createStatementEmailRecord(groupsCovered[i], component.getText('internalid'), emailMessageId, dateToday);
                                            if (dunningLevel == 'Statement') {
                                                log.debug(logTitle, "B1::" + component.getText('internalid'));
                                                record.submitFields({
                                                    type: record.Type.INVOICE,
                                                    id: component.getText('internalid'),
                                                    values: { 'custbody_ss_last_statement_comm_date': dateToday }
                                                });
                                            } else {
                                                log.debug(logTitle, "B2::" + component.getText('internalid'));
                                                record.submitFields({
                                                    type: record.Type.INVOICE,
                                                    id: component.getText('internalid'),
                                                    values: { 'custbody_ss_last_dunning_comm_date': dateToday }
                                                });
                                            }
                                            return true;
                                        });

                                        record.submitFields({
                                            type: "invoicegroup",
                                            id: groupsCovered[i],
                                            values: {
                                                custrecord_ss_last_comm_email_id_g: emailMessageId,
                                                custrecord_ss_last_communication_date_g: dateToday
                                            }
                                        });
                                    }

                                    /*invoiceSearch.run().each(function (result) {
                                        var invGroup = result.getValue('groupedto');
                                        if (!isEmpty(invGroup)) {
                                            record.submitFields({
                                                type: "invoicegroup",
                                                id: invGroup,
                                                values: {
                                                    custrecord_ss_last_comm_email_id_g: emailMessageId,
                                                    custrecord_ss_last_communication_date_g: dateToday
                                                }
                                            });
                                        } else {
                                            record.submitFields({
                                                type: record.Type.INVOICE,
                                                id: result.getValue('internalid'),
                                                values: {
                                                    custbody_ss_last_comm_email_id: emailMessageId,
                                                    custbody_ss_last_communication_date: dateToday
                                                }
                                            });
                                        }
                                        return true;
                                    });*/
                                    //Remove Invoice PDFs from File Cabinet?
                                } else {
                                    log.error(logTitle, 'Error: No sender.');
                                }
                            } else {
                                log.error(logTitle, 'Error: No emails for customer.');
                            }
                        } else {
                            log.error(logTitle, 'Error: No dunning message found.');
                        }
                    } else {
                        log.error(logTitle, 'Error: No dunning record found.');
                    }
                }
            } catch (error) {
                log.error(logTitle, 'error: ' + error);
                email.send({
                    author: errorEmailSender,
                    recipients: errorEmailSender,
                    subject: "Dunning Script Error",
                    body: error.message
                });
            }
        }

        function summarize(summary) {
            var logTitle = 'summarize';
            try {
                log.debug(logTitle, 'End');
            } catch (error) {
                log.error(logTitle, 'error: ' + error);
            }
        }

        function formatLongDate(value) {
            var logTitle = 'formatLongDate';
            try {
                const year = value.getFullYear();
                const monthIndex = value.getMonth();
                const date = value.getDate();

                var retDate = MONTHS[monthIndex] + " " + date + ", " + year;
                log.debug("retDate", retDate);
                return retDate;
            } catch (error) {
                log.error(logTitle, 'error: ' + error);
            }

        }

        function groupByKey(array, key) {
            return array
                .reduce((hash, obj) => {
                    if (obj[key] === undefined) return hash;
                    return Object.assign(hash, { [obj[key]]: (hash[obj[key]] || []).concat(obj) })
                }, {})
        }

        function createStatementEmailRecord(invoiceGroupId, invoiceId, emailId, emailDate) {
            var logTitle = "createStatementEmailRecord";
            try {
                log.debug(logTitle, 'Creating Statements & Dunning Record');
                var dunningRecord = record.create({ type: 'customrecord_ss_statements_dunning', isDynamic: true });
                if (!isEmpty(invoiceGroupId)) {
                    dunningRecord.setValue({ fieldId: 'custrecord_ss_statement_invoice_group', value: invoiceGroupId, ignoreFieldChange: false });
                }
                dunningRecord.setValue({ fieldId: 'custrecord_ss_statement_invoice', value: invoiceId, ignoreFieldChange: false });
                dunningRecord.setValue({ fieldId: 'custrecord_ss_statement_email_id', value: emailId, ignoreFieldChange: false });
                dunningRecord.setValue({ fieldId: 'custrecord_ss_statement_date', value: emailDate, ignoreemailDateFieldChange: false });
                dunningRecord.save();
            } catch (error) {
                log.error(logTitle, error);
            }
        }

        function removeDuplicates(emailsArr) {
            let uniqueElements = [];
            emailsArr.forEach((element) => {
                if (!uniqueElements.includes(element)) {
                    uniqueElements.push(element);
                }
            });
            return uniqueElements;
        }

        function getAdditionalRecipients(customerId){
            var logTitle = "getAdditionalRecipients";
            try {
                var customerInfoObj = search.lookupFields({
                    type: record.Type.CUSTOMER,
                    id: customerId,
                    columns: ["custentity_ss_additional_emails"],
                });
                var additionalEmailsStr = customerInfoObj.custentity_ss_additional_emails;
                var emailsArr = additionalEmailsStr.split(';');
                return emailsArr;
            } catch (error) {
                log.error(logTitle, error);
            }
        }

        function removeDuplicates(emailsArr) {
            let uniqueElements = [];
            emailsArr.forEach((element) => {
                if (!uniqueElements.includes(element)) {
                    uniqueElements.push(element);
                }
            });
            return uniqueElements;
        }

        function cleanRecipientsArray(recipientsArr) {
            var logTitle = "cleanRecipientsArray";
            try {
                var retArr = [];
                var emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
                for (var i = 0; i < recipientsArr.length; i++) {
                    var email = recipientsArr[i].trim();
                    if (emailRegex.test(email)) {
                        retArr.push(email);
                    }
                }
                return retArr;
            } catch (error) {
                log.error(logTitle, error);
            }
        }

        function isEmpty(value) {
            if (value == null || value == undefined || value == 'undefined' || value === '') { return true; }
            return false;
        }

        return {
            getInputData: getInputData,
            reduce: reduce,
            summarize: summarize
        };
    });