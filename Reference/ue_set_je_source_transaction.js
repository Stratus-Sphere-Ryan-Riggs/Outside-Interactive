/**
 * @NApiVersion 2.0
 * @NScriptType userEventScript
 * @NModuleScope Public
 *
 */

define(['N/search', "N/record"], function (search, record) {

    function beforeSubmit(context) {
        var logTitle = 'beforeSubmit';
        try {
            log.debug(logTitle, '** START **');
            var jeRecord = context.newRecord;
            var keySourceArray = getKeySourceArray(jeRecord.id);

            var lineCount = jeRecord.getLineCount({ sublistId: 'line' });
            log.debug(logTitle, "lines: " + lineCount);
            for (var i = 0; i < lineCount; i++) {
                var lineSourceRecPlan = jeRecord.getSublistValue({ sublistId: 'line', fieldId: 'sourcerevenueplan', line: i });
                log.debug(logTitle, "lineSourceRecPlan: " + lineSourceRecPlan);
                if (!isEmpty(lineSourceRecPlan)) {
                    var transactionId = getSourceTransactionId(lineSourceRecPlan);
                    log.debug(logTitle, "transactionId: " + transactionId);
                    if (!isEmpty(transactionId)) {
                        jeRecord.setSublistValue({ sublistId: 'line', fieldId: 'custcol_ss_oi_source_trans', line: i, value: transactionId });
                    }
                }
                //---
                var lineShedule = jeRecord.getSublistValue({ sublistId: 'line', fieldId: 'schedulenum', line: i });
                log.debug(logTitle, "lineShedule: " + lineShedule);
                if (!isEmpty(lineShedule)) {
                    var sourceTran = getSourceTransactionIdAmortSched(lineShedule);
                    log.debug(logTitle, "sourceTran: " + sourceTran);
                    if (!isEmpty(sourceTran)) {
                        jeRecord.setSublistValue({ sublistId: 'line', fieldId: 'custcol_ss_oi_source_trans', line: i, value: sourceTran });
                    }
                }
            }
            log.debug(logTitle, '** END **');
        } catch (error) {
            log.error(logTitle, error);
        }
    }
    
    function afterSubmit(context) {
        var logTitle = 'afterSubmit';
        try {
            log.debug(logTitle, '** START **');
        } catch (error) {
            log.error(logTitle, error);
        }
    }

    function getSourceTransactionId(revPlanNum) {
        var logTitle = 'getSourceTransactionId';
        try {
            log.debug(logTitle, "revPlanNum: " + revPlanNum);
            var revenueplanSearchObj = search.create({
                type: "revenueplan",
                filters: [["recordnumber", "is", revPlanNum]],
                columns:
                    [search.createColumn({ name: "recordnumber", sort: search.Sort.ASC, label: "Number" }),
                    search.createColumn({ name: "createdfrom", label: "Created From" })]
            });
            var createdFromNum;
            revenueplanSearchObj.run().each(function (result) {
                createdFromNum = result.getValue({ name: "createdfrom" });
                log.debug(logTitle, "createdFromNum: " + createdFromNum);
                return false;
            });


            if (!isEmpty(createdFromNum)) {
                var source;
                var revenueelementSearchObj = search.create({
                    type: "revenueelement",
                    filters: [["recordnumber", "equalto", createdFromNum]],
                    columns:
                        [search.createColumn({ name: "recordnumber", label: "Number" }),
                        search.createColumn({ name: "source", label: "Source" })]
                });
                revenueelementSearchObj.run().each(function (result) {
                    log.debug(logTitle, JSON.stringify(result));
                    source = result.getText({ name: "source" });
                    return false;
                });


                log.debug(logTitle, "source: " + source);
                if (!isEmpty(source)) {
                    var transactionType = source.split(" ")[0];
                    var index = source.lastIndexOf('#');
                    var transactionId = source.substring(index + 1);
                    log.debug(logTitle, "transactionId: " + transactionId);
                    log.debug(logTitle, "transactionType: " + transactionType);

                    var retId;
                    var searchType;
                    var tranType;
                    if (transactionType == 'Invoice') {
                        searchType = "invoice";
                        tranType = "CustInvc";
                    } else if (transactionType == 'Credit') {
                        searchType = "creditmemo";
                        tranType = "CustCred";
                    } else if (transactionType == 'Insertion') {
                        searchType = "salesorder";
                        tranType = "SalesOrd";
                    }
                    var tranSearchObj = search.create({
                        type: searchType,
                        filters:
                            [["type", "anyof", tranType], "AND", ["number", "equalto", transactionId], "AND", ["mainline", "is", "T"]],
                        columns:
                            [search.createColumn({ name: "internalid", label: "Internal ID" })]
                    });
                    tranSearchObj.run().each(function (result) {
                        retId = result.getValue('internalid');
                        return false;
                    });
                    log.debug(logTitle, "RET ID: " + retId)
                    return retId;
                }
            }
        } catch (error) {
            log.error(logTitle, error);
        }
    }


    function getSourceTransactionIdAmortSched(amortSchedId) {
        var logTitle = 'getSourceTransactionId';
        try {
            var amortizationscheduleSearchObj = search.create({
                type: "amortizationschedule",
                filters:
                [["internalid","anyof",amortSchedId]],
                columns:
                [
                search.createColumn({name: "name", label: "Schedule Name"}),
                search.createColumn({name: "srctran", label: "Source Transaction"})
                ]
            });
            var sourceTran = null;
            amortizationscheduleSearchObj.run().each(function(result){
                sourceTran = result.getValue("srctran");
                return true;
            });
            return sourceTran;
        } catch (error) {
            log.error(logTitle, error);
        }
    }

    function getKeySourceArray(jeRecordId){
        var logTitle = ";";
        try{
            var lineSourceTrans = [];
            var journalentrySearchObj = search.create({
                type: "journalentry",
                filters:
                    [["type", "anyof", "Journal"], "AND", ["multisubsidiary", "is", "F"], "AND", ["advintercompany", "is", "F"], "AND", ["internalid", "anyof", jeRecordId], "AND", ["amortizationschedule.internalid", "noneof", "@NONE@"]],
                columns:
                    [search.createColumn({ name: "lineuniquekey", label: "Line Unique Key" }), search.createColumn({ name: "srctran", join: "amortizationSchedule", label: "Source Transaction" })]
            });
            
            journalentrySearchObj.run().each(function (result) {
                var sourceTran = result.getValue({ name: "srctran", join: "amortizationSchedule"});
                var lineUniqueKey = result.getValue({ name: "lineuniquekey"});
                lineSourceTrans[lineUniqueKey] = sourceTran;
                return true;
            });

            return lineSourceTrans;
        } catch (error) {
            log.error(logTitle, error);
        }
        
    }

    function isEmpty(value) {
        if (value == null || value == undefined || value == 'undefined' || value === '') { return true; }
        return false;
    }

    return {
        beforeSubmit: beforeSubmit,
        afterSubmit: afterSubmit
    };
});