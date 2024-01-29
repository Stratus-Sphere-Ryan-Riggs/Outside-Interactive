/**
 * @NApiVersion     2.1
 * @NScriptType     MapReduceScript
 */

define(
    [
        '../common/SS_Constants',
        '../common/SS_Record',
        '../common/SS_Script',
        '../common/SS_Search',
        '../common/SS_String',
    ],
    (
        SS_Constants,
        SS_Record,
        SS_Script,
        SS_Search,
        SS_String,
    ) => {
        const MODULE = `SS.MR|DataTableTask`;
        const OPERATOR = SS_Search.Operator;
        const TASK = SS_Constants.CustomRecords.DataTableTask;
        const FIELDS = TASK.Fields;
        const STATUS = SS_Constants.CustomLists.DataTableTaskStatus;
        const TYPES = SS_Constants.CustomLists.DataTableTaskType;

        const getInputData = () => {
            const TITLE = `${MODULE}.GetInputData`;
            let taskRecordId = SS_Script.getParameter({ name: SS_Constants.ScriptParameters.DataTableTaskMapReduce.TaskRecord });
            if (!taskRecordId) {
                log.error({ title: TITLE, details: `Missing required value: MR Task Record.`});
                return;
            }

            let taskRecord = SS_Record.load({
                type: TASK.Id,
                id: taskRecordId
            });

            let contents = taskRecord.getHeaderValue({ fieldId: FIELDS.DATA });
            let jsonContents = JSON.parse(contents);
            log.debug({ title: `${TITLE} jsonContents`, details: JSON.stringify(jsonContents) });

            taskRecord.setHeaderValue({ fieldId: FIELDS.EXPECTED, value: jsonContents.list.length });
            taskRecord.setHeaderValue({ fieldId: FIELDS.STATUS, value: STATUS.IN_PROGRESS });
            taskRecord.save();

            return jsonContents.list.map(d => {
                return {
                    ...d,
                    task: taskRecordId
                }
            });
        };

        const map = (context) => {
            const title = `${MODULE}.Map`;
            let { value } = context;
            let data = JSON.parse(value);
            log.debug({ title: `${title} data`, details: JSON.stringify(data) });

            for (let i = 0, count = data.list.length; i < count; i++) {
                context.write({
                    key: data.list[i],
                    value: {
                        invoice: invoiceId,
                        error,
                        task: data.task
                    }
                });
            }
        };

        const reduce = (context) => {
            const TITLE = `${MODULE}.Reduce`;
            let { key, values } = context;
            /* log.debug({ title: `${TITLE} key = ${key}`, details: `media ID = ${values[0]}` });

            let jsonValues = JSON.parse(values[0]);
            let { invoice, error, status } = jsonValues;

            if (error && status === MEDIA_STATUS.ERROR) {
                context.write({
                    key: SS_String.generateRandomString(),
                    value: jsonValues
                });
                return;
            }

            context.write({
                key: SS_String.generateRandomString(),
                value: jsonValues
            }); */
        };

        const summarize = (summary) => {
            const TITLE = `${MODULE}.Summarize`;
            let { mapSummary, reduceSummary, output } = summary;

            /* let invoiceTasks = [];
            output.iterator().each((key, val) => {
                invoiceTasks.push(JSON.parse(val));

                return true;
            });

            let tasks = invoiceTasks.map(d => d.task);
            tasks = [ ...new Set(tasks) ];

            for (let i = 0, count = tasks.length; i < count; i++) {
                let taskResults = invoiceTasks.filter(d => d.task === tasks[i]);
                let invoices = taskResults.filter(tr => !!tr.invoice === true).map(tr => tr.invoice);
                let errors = taskResults.map(tr => tr.error);

                let invoicingTask = SS_Record.load({ type: TASK.Id, id: tasks[i] });
                let invoicesExpected = invoicingTask.getHeaderValue({ fieldId: FIELDS.INVOICES_EXPECTED });
                let invoicesGenerated = invoices.length;

                let updateValues = {};
                updateValues[FIELDS.INVOICES] = invoices;
                updateValues[FIELDS.INVOICES_GENERATED] = invoicesGenerated;
                updateValues[FIELDS.STATUS] = invoicesGenerated > 0 ?
                    (invoicesGenerated === invoicesExpected ?
                        STATUS.COMPLETED : STATUS.COMPLETED_WITH_ERRORS) :
                    STATUS.FAILED;
                updateValues[FIELDS.ERRORS] = errors.join('\n');
                
                invoicingTask.setHeaderValues(updateValues);
                invoicingTask.save();
                log.debug({ title: TITLE, details: `Successfully updated invoicing task ID ${tasks[i]}.` });
            } */
        };

        return {
            getInputData,
            map,
            reduce,
            summarize
        };
    }
);
