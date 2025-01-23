/**
 * @NApiVersion     2.1
 * @NModuleScope    SameAccount
 */

define(
    [
        '../common/SS_Record',
        '../common/SS_Search'
    ],
    (
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

        const createTemporaryFolder = () => {
            const TITLE = `${MODULE}.CreateTemporaryFolder`;

            let folder = SS_Record.create({ type: 'folder' });
            folder.setValue({
                fieldId: 'name',
                value: `VOF_TEMP_${(new Date()).getTime().toString()}`
            });
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
                    return createTemporaryFolder();
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

            move: (options) => {},

            upload: (options) => {}
        };
    }
);