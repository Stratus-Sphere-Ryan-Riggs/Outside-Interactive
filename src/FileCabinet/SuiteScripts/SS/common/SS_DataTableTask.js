/**
 * @NApiVersion         2.1
 * @NModuleScope        SameAccount
 */

define(
    [
        './SS_Constants',
        './SS_Record',
        './SS_Task',
        './SS_Url'
    ],
    (
        SS_Constants,
        SS_Record,
        SS_Task,
        SS_Url
    ) => {
        const MODULE = `SS.DataTableTask`;
        let TASK = SS_Constants.CustomRecords.DataTableTask;
        let FIELDS = TASK.Fields;

        const create = (options) => {
            const TITLE = `${MODULE}.Create`;
            let { data, type } = options;
            log.debug({ title: `${TITLE} data`, details: data });

            let taskRecord = {};
            try {
                let dtTask = SS_Record.create({ type: TASK.Id });
                dtTask.setValue({ fieldId: FIELDS.DATA, value: data });
                dtTask.setValue({ fieldId: FIELDS.STATUS, value: SS_Constants.CustomLists.DataTableTaskStatus.PENDING });
                dtTask.setValue({ fieldId: FIELDS.TYPE, value: type });
                
                let dtTaskId = dtTask.save();
                log.debug({ title: TITLE, details: `Successfully created Task ID ${dtTaskId}.` });

                let mrTaskParams = {};
                mrTaskParams[SS_Constants.ScriptParameters.DataTableTaskMapReduce.TaskRecord] = dtTaskId;
                let mrTask = SS_Task.createMapReduceTask({
                    scriptId: SS_Constants.Scripts.DataTableTaskMapReduce.scriptId,
                    params: mrTaskParams
                });
                if (mrTask.status === true) {
                    log.debug({ title: TITLE, details: `Successfully created map/reduce task ID ${mrTask.data}.` });
                    taskRecord = { status: true, data: dtTaskId };
                }
                else {
                    taskRecord = mrTask;
                }
            }
            catch (ex) {
                let errorMessage = ex.message || ex.toString();
                log.error({ title: TITLE, details: errorMessage });
                taskRecord = { status: false, error: errorMessage };
            }

            if (!taskRecord.status) {
                return taskRecord;
            }

            log.debug({ title: TITLE, details: `taskRecord = ${taskRecord.data}` });
            taskRecord.url = SS_Url.resolveRecord({
                recordType: TASK.Id,
                recordId: taskRecord.data
            });

            return taskRecord;
        };

        return {
            create
        };
    }
);