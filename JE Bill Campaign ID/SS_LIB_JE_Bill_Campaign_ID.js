/**
 * @NApiVersion         2.1
 */

define(
    [
        'N/log',
        'N/record',
        'N/runtime',
        'N/search'
    ],
    (
        nsLog,
        nsRecord,
        nsRuntime,
        nsSearch
    ) => {
        const MODULE_NAME = `LIB|JE Bill Campaign ID`;

        const buildBillSearch = ({ journalEntry, searchId }) => {
            let title = `${MODULE_NAME}.BuildBillSearch`;

            let billIdList = [];
            let lineCount = journalEntry.getLineCount({ sublistId: 'line' });
            for (let i = 0; i < lineCount; i++) {
                billIdList.push(
                    journalEntry.getSublistValue({ sublistId: 'line', line: i, fieldId: 'custcol_ss_oi_source_trans' })
                );
            }
            
            let billSearch = nsSearch.load({ id: searchId });
            billSearch.filterExpression = [
                ...billSearch.filterExpression,
                'AND',
                [ 'internalid', 'anyof', [ ...new Set(billIdList) ] ]
            ];
            nsLog.debug({ title: title, details: JSON.stringify(billSearch.filterExpression) });

            return billSearch;
        };

        const getAllResults = (options) => {
            let title = `${MODULE_NAME}.GetAllResults`;
            let allResults = [];
            let results = [];
            let size = 1000;
            let start = 0;
            let end = size;

            do {
                results = options.search.run().getRange({ start: start, end: end });
                allResults = [ ...allResults, ...results ];
                start += size;
                end += size;
            } while (results.length >= size);
            
            return allResults;
        };

        const getJournalBillData = ({ journalEntry, parameters }) => {
            let title = `${MODULE_NAME}.GetJournalBillData`;
            let billSearch = buildBillSearch({ journalEntry, searchId: parameters.SearchCampaignIds });
            let billResults = getAllResults({ search: billSearch });
            nsLog.debug({ title: `${title} billResults`, details: `length = ${billResults.length}` });

            let billData = billResults.filter(result => {
                let campaignId = result.getValue({ name: 'custcol_ss_oi_line_campaignid' });
                return campaignId !== '' && campaignId !== null && campaignId !== undefined;
            }).map(result => {
                return {
                    id: result.id,
                    amount: parseNumber(result.getValue({ name: 'amount' })),
                    campaignId: result.getValue({ name: 'custcol_ss_oi_line_campaignid' })
                    // memo: result.getValue({ name: 'memo' })
                };
            });
            nsLog.debug({ title: `${title} billData`, details: JSON.stringify(billData) });

            return billData;
        };

        const getScriptParameters = () => {
            let script = nsRuntime.getCurrentScript();
            let parameters = {};
            
            parameters.SearchCampaignIds = script.getParameter({ name: 'custscript_ss_ue_je_bill_campaignid_ss' });
            
            return parameters;
        };

        const parseNumber = (value) => {
            let output = value.toString();
            output = parseFloat(output);
            return output;
        };

        const updateLineCampaignIds = ({ journalId }) => {
            let title = `${MODULE_NAME}.UpdateLineCampaignIds`;

            let parameters = getScriptParameters();
            if (!parameters.SearchCampaignIds) {
                nsLog.error({ title: title, details: `Missing parameer: Campaign ID saved search.` });
                return;
            }

            let journalEntry = nsRecord.load({ type: nsRecord.Type.JOURNAL_ENTRY, id: journalId });
            let billData = getJournalBillData({ journalEntry, parameters });
            if (billData.length <= 0) {
                nsLog.debug({ title: title, details: `No campaign ID values found for any related Bills.` });
                return;
            }

            let journalLineCount = journalEntry.getLineCount({ sublistId: 'line' });
            
            for (let i = 0; i < journalLineCount; i++) {
                let sublistLine = { sublistId: 'line', line: i };

                let lineId = journalEntry.getSublistValue({ ...sublistLine, fieldId: 'custcol_ss_oi_source_trans' });
                let lineAmount = journalEntry.getSublistValue({ ...sublistLine, fieldId: 'credit' }) || journalEntry.getSublistValue({ ...sublistLine, fieldId: 'debit' });
                // let lineMemo = journalEntry.getSublistValue({ ...sublistLine, fieldId: 'memo' });

                let billLineData = billData.find(b => b.id == lineId && b.amount == lineAmount);
                // nsLog.debug({ title: `${title} i=${i}, lineId=${lineId}, lineAmount=${lineAmount}`, details: `lineMemo = ${lineMemo}` });
                nsLog.debug({ title: `${title} i=${i} lineId=${lineId}, lineAmount=${lineAmount}`, details: billLineData ? JSON.stringify(billLineData) : '-NONE-' });
                if (!billLineData) { continue; }

                nsLog.debug({ title: title, details: `Setting Campaign ID for line ${i} = ${billLineData.campaignId}` });
                journalEntry.setSublistValue({
                    ...sublistLine,
                    fieldId: 'custcol_ss_oi_line_campaignid',
                    value: billLineData.campaignId
                });
            }

            journalEntry.save();
            nsLog.debug({ title: title, details: `Successfully updated Journal Entry ${journalId}` });
        };

        return {
            UpdateLineCampaignIds: updateLineCampaignIds
        };
    }
);