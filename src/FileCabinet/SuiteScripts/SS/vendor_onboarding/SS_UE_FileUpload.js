/**
 * @NApiVersion     2.1
 * @NScriptType     UserEventScript
 * @NModuleScope    SameAccount
 */

define(
    [
        '../common/SS_Constants',
        '../common/SS_FileUpload',
        '../common/SS_Record',
        '../common/SS_Runtime',
        '../common/SS_UI',
        '../common/SS_VendorOnboarding'
    ],
    (
        SS_Constants,
        SS_FileUpload,
        SS_Record,
        SS_Runtime,
        SS_UI,
        SS_VendorOnboarding
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
        const VENDOR_REQUEST = SS_Constants.CustomRecords.VendorRequest;
        const VR_FIELDS = VENDOR_REQUEST.Fields;

        const createTempFolder = (options) => {
            const TITLE = `${MODULE}.CreateTempFolder`;
            let { newRecord, type } = options;

            if (SS_Runtime.isUserInterface === false) {
                log.audit({ title: TITLE, details: `Invalid execution context (${SS_Runtime.ExecutionContext}). Exiting...` });
                return;
            }

            if ([
                options.UserEventType.CREATE,
                options.UserEventType.COPY
            ].indexOf(type) < 0) {
                log.audit({ title: TITLE, details: `Invalid event type (${type}). Exiting...` });
                return;
            }
            
            let folderId = SS_FileUpload.createFolder({});
            newRecord.setValue({ fieldId: VENDOR_REQUEST.Fields.UPLOAD_FOLDER, value: folderId });
        };

        /**
         * Invoked immediately after creation of New Vendor Request record only.
         */
        const upsertUploadFolder = (options) => {
            const TITLE = `${MODULE}.UpsertUploadFolder`;
            let { newRecord, type } = options;

            log.debug({ title: TITLE, details: `type = ${type}; context = ${SS_Runtime.ExecutionContext}` });
            if ([
                options.UserEventType.CREATE,
                options.UserEventType.EDIT
            ].indexOf(type) < 0) {
                log.audit({ title: TITLE, details: `Invalid event type (${type}). Exiting...` });
                return;
            }

            let uploadFolder = newRecord.getValue({ fieldId: VENDOR_REQUEST.Fields.UPLOAD_FOLDER });
            let source = newRecord.getValue({ fieldId: VENDOR_REQUEST.Fields.SOURCE });

            if (uploadFolder) {
                let vendorName = getVendorName({ newRecord });
                log.debug({ title: TITLE, details: `uploadFolder = ${uploadFolder}; vendorName = ${vendorName}` });
                SS_Record.submitFields({
                    type: 'folder',
                    id: uploadFolder,
                    values: { name: `${newRecord.id}_${vendorName}` }
                });
                log.audit({ title: TITLE, details: `Successfully updated folder name to ${vendorName}` })
            }
            else {
                log.debug({ title: TITLE, details: `creating new folder...` });
                let folderId = SS_FileUpload.createFolder({
                    id: newRecord.id,
                    name: getVendorName({ newRecord }),
                    source: newRecord.getValue({ fieldId: 'custrecord_vr_source' })
                });
                let values = {};
                values[VENDOR_REQUEST.Fields.UPLOAD_FOLDER] = folderId;
                SS_Record.submitFields({ type: newRecord.type, id: newRecord.id, values });
            }

            if (!uploadFolder) {
                log.audit({ title: TITLE, details: `Missing required parameter: Upload folder. Exiting...` });
                return;
            }

            if (source === SS_Constants.CustomLists.VendorRequestSource.ONLINE_FORM) {
                log.audit({ title: TITLE, details: `Source is 'Online Form'. Exiting...` });
                return;
            }

            if (source === SS_Constants.CustomLists.VendorRequestSource.REFUNDS) {
                SS_VendorOnboarding.moveFiles({ id: newRecord.id, from: uploadFolder });
            }
            else {
                SS_FileUpload.changeFolderParent({ id: uploadFolder, source });
                // let updateValues = {};
                // updateValues[] = 
                // SS_Record.submitFields({
                //     type: newRecord.type,
                //     id: newRecord.id,
                //     values: { name: `${newRecord.id}_${vendorName}` }
                // });
                // log.audit({ title: TITLE, details: `Successfully updated folder name to ${vendorName}` })
            }
        };

        const getUploadScriptContent = (options) => {
            const TITLE = `${MODULE}.GetUploadScriptContent`;
            const BUTTONS = [
                VR_FIELDS.W9,
                VR_FIELDS.SOC_CERTIFICATE,
                VR_FIELDS.CERTIFICATE_OF_INSURANCE,
                VR_FIELDS.DATA_BREACH_REPORT,
                VR_FIELDS.OFAC_CHECK,
                VR_FIELDS.ORIGINAL_RECEIPT_DOCUMENT
            ];
            log.debug({ title: TITLE, details: JSON.stringify(BUTTONS) });

            return `<script>
                window.vr_uploadFolder = nlapiGetFieldValue('${VENDOR_REQUEST.Fields.UPLOAD_FOLDER}');
                console.log('SS Vendor Request Upload Folder', window.vr_uploadFolder);

                window.vr_uploadButtons = ${JSON.stringify(BUTTONS)};
                window.vr_setUploadFolder = () => {
                    try {
                        let wndBody = window.wndFilePopup.document.body;
                        window.wndFilePopup.nlapiSetFieldValue('folder', window.vr_uploadFolder);
                    }
                    catch (e) {
                        setTimeout("window.vr_setUploadFolder()", 500);
                    }
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

        /**
         * Should only execute on UI context.
         * Add custom JS code for uploading files to temporary upload folder.
         */
        const updateFileUploadHandlers = (options) => {
            const TITLE = `${MODULE}.UpdateFileUploadHandlers`;
            let { form, type } = options;

            if (SS_Runtime.isUserInterface === false) {
                log.audit({ title: TITLE, details: `Invalid execution context (${SS_Runtime.ExecutionContext}). Exiting...` });
                return;
            }

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

        return {
            beforeLoad: (context) => {
                createTempFolder(context);
                updateFileUploadHandlers(context);
            },

            afterSubmit: (context) => {
                upsertUploadFolder(context);
            }
        }
    }
);