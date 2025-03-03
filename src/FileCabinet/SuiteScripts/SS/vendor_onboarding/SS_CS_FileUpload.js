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
            console.log(TITLE, window.vr_uploadButtons);
            if (Array.isArray(window.vr_uploadButtons) === false) {
                console.log(TITLE, `vr_uploadButtons is not a proper array. Exiting...`);
                return;
            }

            window.vr_uploadButtons.forEach(b => {
                let uploadButton = document.getElementById(`${b}_popup_new`);
                if (!uploadButton) { return true; }

                let onClick = uploadButton.onclick.toString();
                if (!onClick) { return true; }

                onClick = onClick.replaceAll('\n', ' ');
                let funcContent = onClick.substring(onClick.indexOf('{') + 1, onClick.indexOf('}'));
                funcContent = `window.wndFilePopup = ${funcContent}vr_setUploadFolder();`;
                console.log(`${TITLE} "${uploadButton.id}"`, funcContent);

                uploadButton.onclick = new Function('event', funcContent);
                return true;
            });
        };

        return {
            pageInit: (context) => {
                const TITLE = `${MODULE}.PageInit`;
                let { mode } = context;

                if ([ 'create', 'edit', 'copy' ].indexOf(mode) < 0) {
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