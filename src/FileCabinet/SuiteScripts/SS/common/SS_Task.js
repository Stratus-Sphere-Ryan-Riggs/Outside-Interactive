/**
 * Wrapper module for N/task
 * 
 * @NApiVersion     2.1
 * @NModuleScope    SameAccount
 * 
 */

define(
    [
        'N/task'
    ],
    (
        NS_Task
    ) => {
        const MODULE = 'SS.Task';

        return {
            createMapReduceTask(options) {
                const title = `${MODULE}.CreateMapReduceTask`;
                log.debug({ title, details: JSON.stringify(options) });

                if (!options.scriptId) {
                    return { status: false, error: 'Missing required value: Script ID.' };
                }
    
                let taskMapReduce = NS_Task.create({
                    taskType: NS_Task.TaskType.MAP_REDUCE,
                    ...options
                });
                try {
                    let taskId = taskMapReduce.submit();
                    log.debug({ title, details: `Successfully created Map/Reduce task ID: ${taskId}` });
                    return { status: true, data: taskId };
                }
                catch (ex) {
                    return { status: false, error: ex.toString() };
                }
            }
        };
    }
);