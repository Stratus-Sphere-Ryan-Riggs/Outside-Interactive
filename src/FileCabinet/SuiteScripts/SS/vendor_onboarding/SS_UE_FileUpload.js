/**
 * @NApiVersion     2.1
 * @NScriptType     UserEventScript
 * @NModuleScope    SameAccount
 */

define(
    [
        '../common/SS_FileUpload',
        '../common/SS_Record',
        '../common/SS_Script',
        '../common/SS_Search',
        '../common/SS_UI'
    ],
    (
        SS_FileUpload,
        SS_Record,
        SS_Script,
        SS_Search,
        SS_UI
    ) => {
        const MODULE = `SS.UE.FileUpload`;
        const FIELDS = {
            UPLOAD_JS: {
                id: 'custpage_ue_fileupload_js',
                label: 'File Upload JS',
                type: 'inlinehtml'
            }
        };
        const PARAMS = {
            PARENT_FOLDER: 'custscript_ss_ue_file_upload_folder',
            REQUEST_TYPE: 'custscript_ss_ue_file_upload_reqtype'
        };
        const VENDOR_ONBOARDING_FILES_FOLDER = '526513';

        /**
         * Should only execute on UI context.
         * Add custom JS code for uploading files to temporary upload folder.
         */
        const addUploadScript = (options) => {
            const TITLE = `${MODULE}.AddUploadScript`;
            let { form, type } = options;

            if ([
                options.UserEventType.CREATE,
                options.UserEventType.EDIT
            ].indexOf(type) < 0) {
                log.audit({ title: TITLE, details: `Invalid event type (${type}). Exiting...` });
                return;
            }

            SS_UI.addField({
                field: FIELDS.UPLOAD_JS,
                defaultValue: getUploadScriptContent({}),
                parent: form,
             });
        };

        /**
         * Invoked immediately after creation of New Vendor Request record only.
         */
        const createUploadFolder = (options) => {
            const TITLE = `${MODULE}.CreateUploadFolder`;
            let { newRecord, type } = options;

            if ([
                options.UserEventType.CREATE,
                options.UserEventType.EDIT
            ].indexOf(type) < 0) {
                log.audit({ title: TITLE, details: `Invalid event type (${type}). Exiting...` });
                return;
            }

            let folderId = SS_FileUpload.createFolder({
                id: newRecord.id,
                name: getVendorName({ newRecord }),
                source: newRecord.getValue({ fieldId: 'custrecord_vr_source' })
            });
            SS_Record.submitFields({
                type: newRecord.type,
                id: newRecord.id,
                values: {
                    custrecord_vr_upload_folder: folderId
                }
            });
        };

        const getUploadScriptContent = (options) => {
            const TITLE = `${MODULE}.GetUploadScriptContent`;
            return `<script>
            window.str_fileUpload = (options) => {
                window.vr_uploadFolder = '${ createUploadFolder(options) }';
            };
            </script>`;
        };

        const getVendorName = (options) => {
            let { newRecord } = options;
            let output = '';

            let type = newRecord.getValue({ fieldId: 'custrecord_vr_category' });
            switch (type.toString()) {
                case '1': {
                    // Individual
                    output = `${newRecord.getValue({ fieldId: 'custrecord_vr_indivfirstname' })} ${newRecord.getValue({ fieldId: 'custrecord_vr_indivlastname' })}`
                    break;
                }
                case '2': {
                    // Company
                    output = `${newRecord.getValue({ fieldId: 'custrecord_vr_companyname' })}`;
                    break;
                }
            }

            return output;
        };

        return {
            beforeLoad: (context) => {
                // addUploadScript(context);
            },

            afterSubmit: (context) => {
                createUploadFolder(context);
            }
        }
    }
);