/**
 * @NApiVersion     2.1
 * @NScriptType     Suitelet
 * @NModuleScope    SameAccount
 */

define(
    [
        '../common/SS_Constants',
        '../common/SS_Script',
        '../common/SS_VendorOnboarding'
    ],
    (
        SS_Constants,
        SS_Script,
        SS_VendorOnboarding
    ) => {
        const MODULE = `SS.SL|VendorOnboarding`;

        const onRequest = (context) => {
            let { request } = context;
            
            switch (request.method.toLowerCase()) {
                case 'get': {
                    renderForm(context);
                    break;
                }
                case 'post': {
                    processPost(context);
                    break;
                }
                default: { break; }
            }
        };

        const processPost = (context) => {
            const TITLE = `${MODULE}.ProcessPost`;
            let { request } = context;
            let { parameters } = request;
            if (!parameters.action) {
                log.error({ title: TITLE, details: `Missing required parameter: Action.` });
                return;
            }

            switch (parameters.action?.toLowerCase()) {
                case 'upload': {
                    uploadFile(context);
                    break;
                }
                case 'save': {
                    saveRequestData(context);
                    break;
                }
                default: break;
            }
        };

        const saveRequestData = (context) => {
            const TITLE = `${MODULE}.SaveRequestData`;
            let { request, response } = context;
            let { folder, request_id } = request.parameters;
            log.debug({ title: `${TITLE} parameters`, details: JSON.stringify(request.parameters) });
            
            let vendorRequestId = request_id;
            let data = JSON.parse(request.body);
            log.debug({ title: TITLE, details: JSON.stringify(data) });

            let updateStatus = SS_VendorOnboarding.save({ id: vendorRequestId, data });
            SS_VendorOnboarding.moveFiles({ from: folder, id: updateStatus.id });
            response.write({ output: JSON.stringify(updateStatus) });
        };

        const renderForm = (context) => {
            const TITLE = `${MODULE}.RenderForm`;
            let { request, response } = context;
            let vendorRequestId = request.parameters.request_id;

            let createParam = SS_Script.getParameter(SS_Constants.ScriptParameters.CreateVendorRequest);
            log.debug({ title: TITLE, details: `createParam = ${createParam}` });
            if (!createParam && !vendorRequestId) {
                let msg = `Missing required parameter: Vendor Request ID.`;
                log.error({ title: TITLE, details: msg });
                response.write({ output: msg });
                return;
            }

            response.write({
                output: SS_VendorOnboarding.render({ id: vendorRequestId })
            });
        };

        const uploadFile = (context) => {
            const TITLE = `${MODULE}.UploadFile`;
            let { request, response } = context;
            let { files } = request;
            if (!files.file) {
                let msg = `Missing required parameter: File.`;
                log.error({ title: TITLE, details: msg });
                return { status: false, message: msg };
            }

            let { folder } = request.parameters;
            if (!folder) {
                let msg = `Missing required parameter: Folder.`;
                log.error({ title: TITLE, details: msg });
                return { status: false, message: msg };
            }

            let uploadStatus = SS_VendorOnboarding.upload({ file: files.file, folder });
            response.write({ output: JSON.stringify(uploadStatus) });
        };

        return { onRequest };
    }
);