/**
 * @NApiVersion     2.1
 * @NScriptType     ClientScript
 * @NModuleScope    SameAccount
 */

define(
    [
        '../common/SS_Constants'
    ],
    (
        SS_Constants
    ) => {
        const MODULE = `SS.CS.FileUpload`;
        const VENDOR_REQUEST = SS_Constants.CustomRecords.VendorRequest;
        const FIELDS = VENDOR_REQUEST.Fields;

        const updateFileUploadHandlers = () => {
            const TITLE = `${MODULE}.UpdateFileUploadHandlers`;
            
            let folderId = window.vr_uploadFolder;
            if (!folderId) {
                console.log(TITLE, `Missing required parameter: ${folderId}. Exiting...`);
                return;
            }

            // TODO: Update each file upload button handler
        };

        return {
            pageInit: (context) => {
                const TITLE = `${MODULE}.PageInit`;
                let { mode } = context;

                if ([ 'create', 'copy' ].indexOf(mode) < 0) {
                    console.log(TITLE, `Invalid mode (${mode}). Exiting Page Init...`);
                    return;
                }

                window.vr_uploadFolder = nlapiGetFieldValue(VENDOR_REQUEST.Fields.UPLOAD_FOLDER);
                console.log('SS Vendor Request Upload Folder', window.vr_uploadFolder);

                updateFileUploadHandlers();
            }
        };
    }
);