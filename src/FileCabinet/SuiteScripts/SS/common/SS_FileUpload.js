/**
 * @NApiVersion     2.1
 * @NModuleScope    SameAccount
 */

define(
    [
        '../common/SS_File',
        '../common/SS_Record',
        '../common/SS_Search'
    ],
    (
        SS_File,
        SS_Record,
        SS_Search
    ) => {
        const MODULE = `SS.FileUpload`;
        const FOLDERS = [
            {
                /* Online Form */
                source: '1',
                folder: '526513'
            },
            {
                /* _Refunds */
                source: '5',
                folder: '598457'
            },
            {
                temp: true,
                folder: '603010'
            }
        ];

        const createTemporaryFolder = (options) => {
            const TITLE = `${MODULE}.CreateTemporaryFolder`;
            let { name } = options;

            name = `REFUND_${name || (new Date()).getTime().toString()}`;

            let folder = SS_Record.create({ type: 'folder' });
            folder.setValue({ fieldId: 'name', value: name });
            folder.setValue({ fieldId: 'parent', value: getSourceFolder({}) });

            let folderId = folder.save();
            log.debug({ title: TITLE, details: `Successfully created temporary folder ID ${folderId}` })

            return folderId;
        };

        const getSourceFolder = (options) => {
            const TITLE = `${MODULE}.GetSourceFolder`;
            let { source } = options;

            let folder = source ?
                FOLDERS.find(f => f.source === source && f.temp !== true) :
                FOLDERS.find(f => f.temp === true);
            log.debug({ title: TITLE, details: JSON.stringify(folder) });

            /* Default folder is "Attachments Received" */
            return folder?.folder || -10;
        };

        const getUploadFolder = (options) => {
            const TITLE = `${MODULE}.GetFolder`;
            let { id } = options;

            let folderSearch = SS_Search.create({
                type: 'folder',
                filters: [ 'name', 'startswith', `${id}_` ]
            });

            let folderResults = folderSearch.getResults();
            log.debug({ title: TITLE, details: JSON.stringify(folderResults) });

            return folderResults.length > 0 ? folderResults[0].id : '';
        };

        const updateRequestUploadFolder = (options) => {
            const TITLE = `${MODULE}.UpdateRequestUploadFolder`;
            let { id, folder } = options;

            SS_Record.submitFields({
                type: 'customrecord_vendor_request',
                id: id,
                values: {
                    custrecord_vr_upload_folder: folder
                }
            });
        };

        return {
            createFolder: (options) => {
                const TITLE = `${MODULE}.CreateFolder`;
                let { id, name, source } = options;
                
                if (!id) {
                    return createTemporaryFolder({ name });
                }

                let folderId = getUploadFolder(options);
                if (folderId) {
                    log.audit({ title: TITLE, details: `A folder for this record already exists. Exiting...` });
                    return folderId;
                }

                let folder = SS_Record.create({ type: 'folder' });
                folder.setValue({ fieldId: 'name', value: `${id}_${name}` });
                folder.setValue({ fieldId: 'parent', value: getSourceFolder({ source }) });

                folderId = folder.save();
                log.debug({ title: TITLE, details: `Successfully created new folder ID ${folderId}` })

                return folderId;
            },

            getFolder: (options) => {
                return getUploadFolder(options);
            },

            move: (options) => {
                const TITLE = `${MODULE}.Move`;
                let { from, to } = options;
                log.debug({ title: `${TITLE} options`, details: JSON.stringify(options) });

                let fileSearch = SS_Search.create({
                    type: 'file',
                    filters: [
                        'folder', 'anyof', from
                    ]
                });
                let fileResults = fileSearch.getResults();
                log.debug({ title: `${TITLE} fileResults`, details: JSON.stringify(fileResults) });
                if (fileResults.length <= 0) {
                    log.audit({ title: TITLE, details: `No files found within folder ID ${from}. Exiting...` });
                    return false;
                }

                let output = [];
                try {
                    for (let i=0, count=fileResults.length; i < count; i++) {
                        let fileId = parseInt(fileResults[i].id);
                        fileId = SS_File.copy({ id: fileId, folder: to, move: true });
                        log.debug({ title: TITLE, details: `Successfully moved file ${fileId} to folder ${to}.` });

                        output.push({ old: fileResults[i].id, new: fileId });
                    }
    
                    // return true;
                }
                catch (ex) {
                    log.error({ title: TITLE, details: ex.toString() });
                    // return false;
                }

                log.debug({ title: `${TITLE} output`, details: JSON.stringify(output) });
                return output;
            },

            upload: (options) => {}
        };
    }
);