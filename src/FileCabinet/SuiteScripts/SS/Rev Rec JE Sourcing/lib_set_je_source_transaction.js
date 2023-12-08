/**
 * @NApiVersion         2.1
 * @NModuleScope        Public
 */

define(
    [
        'N/log',
        'N/record',
        'N/search'
    ],
    (
        log,
        record,
        search
    ) => {
        const getSourceTransactionId = (options) => {
            let logTitle = 'getSourceTransactionId';
            try {
                log.debug(logTitle, JSON.stringify(options));
                let revenueplanSearchObj = search.create({
                    type: "revenueplan",
                    filters: [["recordnumber", "is", options.id]],
                    columns:
                        [search.createColumn({ name: "recordnumber", sort: search.Sort.ASC, label: "Number" }),
                        search.createColumn({ name: "createdfrom", label: "Created From" })]
                });
                let createdFromNum;
                revenueplanSearchObj.run().each(function (result) {
                    createdFromNum = result.getValue({ name: "createdfrom" });
                    log.debug(logTitle, "createdFromNum: " + createdFromNum);
                    return false;
                });
    
    
                if (!isEmpty(createdFromNum)) {
                    let source;
                    let revenueelementSearchObj = search.create({
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
                        let transactionType = source.split(" ")[0];
                        let index = source.lastIndexOf('#');
                        let transactionId = source.substring(index + 1);
                        log.debug(logTitle, "transactionId: " + transactionId);
                        log.debug(logTitle, "transactionType: " + transactionType);
    
                        let retId;
                        let searchType;
                        let tranType;
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
                        let tranSearchObj = search.create({
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
        };
    
        const getSourceTransactionIdAmortSched = (options) => {
            var logTitle = 'getSourceTransactionId';
            try {
                var amortizationscheduleSearchObj = search.create({
                    type: "amortizationschedule",
                    filters:
                    [["internalid","anyof",options.id]],
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
    
        const getKeySourceArray = (options) => {
            let logTitle = "getKeySourceArray";
            
            try{
                let lineSourceTrans = [];
                let journalentrySearchObj = search.create({
                    type: "journalentry",
                    filters: [
                        ["type", "anyof", "Journal"],
                        "AND",
                        ["multisubsidiary", "is", "F"],
                        "AND",
                        ["advintercompany", "is", "F"],
                        "AND",
                        ["internalid", "anyof", options.id],
                        "AND",
                        ["amortizationschedule.internalid", "noneof", "@NONE@"]
                    ],
                    columns: [
                        search.createColumn({ name: "lineuniquekey", label: "Line Unique Key" }),
                        search.createColumn({ name: "srctran", join: "amortizationSchedule", label: "Source Transaction" })
                    ]
                });
                
                journalentrySearchObj.run().each(function (result) {
                    let sourceTran = result.getValue({ name: "srctran", join: "amortizationSchedule"});
                    let lineUniqueKey = result.getValue({ name: "lineuniquekey"});
                    lineSourceTrans[lineUniqueKey] = sourceTran;
                    return true;
                });
    
                return lineSourceTrans;
            } catch (error) {
                log.error(logTitle, error);
                return null;
            }
        };

        const isEmpty = (value) => {
            if (
                value == null ||
                value == undefined ||
                value == 'undefined' ||
                value === ''
            ) { return true; }
            return false;
        }
    
        return {
            getKeySourceArray,
            getSourceTransactionId,
            getSourceTransactionIdAmortSched,
            isEmpty
        };
    }
);