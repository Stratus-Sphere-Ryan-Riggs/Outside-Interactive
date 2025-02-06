/**
 *@NApiVersion 2.1
 *@NScriptType Suitelet
 */
 define(['N/record', 'N/runtime', 'N/ui/serverWidget', 'N/log', 'N/record', 'N/redirect'],
    function (record, runtime, serverWidget, log, record, redirect) {
    
        function onRequest(context) {
            const request = context.request;
            const response = context.response;
    
            if (request.method === 'GET') {
                createForm(response, request.parameters);
            } else if (request.method === 'POST') {
                processFormSubmission(request, response);
            }
        }

        function addOverlay (options) {
            let { form } = options;

            let field = form.addField({
                id: 'custpage_strat_overlay',
                label: 'Strat Overlay',
                type: 'inlinehtml'
            });
            field.defaultValue = `
            <style>
                #strat_overlay {
                    position: fixed; top: 0; left: 0; bottom: 0; right: 0;
                    width: 100%; height: 100%; z-index: 1000; background: rgba(0, 0, 0, 0.6);
                }
                .strat_overlay_spinner {
                    height: 100%; display: flex; justify-content: center; align-items: center;
                }
                .spinner {
                    width: 40px; height: 40px; border: 4px #ddd solid; border-top: 4px #2e93e6 solid;
                    border-radius: 50%; animation: sp-anime 0.8s infinite linear;
                }
                @keyframes sp-anime {
                    100% { transform: rotate(360deg); }
                }
                .overlay_hide { display: none; }
            </style>
            <div id="strat_overlay" class="overlay_hide">
                <div class="strat_overlay_spinner">
                    <span class="spinner"></span>
                </div>
            </div>`;
        }
        
        function createForm(response, params) {
            let formTitle = params.action === 'approve' ? 'Enter Approval Notes' : 'Enter Rejection Notes';
            let form = serverWidget.createForm({ title: formTitle });

            addOverlay({ form });
            setupFormField(form, 'custpage_recordid', params.recordid, 'Record ID', true);
            setupFormField(form, 'custpage_recordtype', params.recordtype, 'Record Type', true);
    
            if (params.action === 'approve') {
                setupFormField(form, 'custpage_approvalnotes', '', 'Approval Notes', false, false);
            } else if (params.action === 'reject') {
                setupFormField(form, 'custpage_rejectionnotes', '', 'Rejection Notes', false, true); // Make rejection notes mandatory
            }
    
            form.addSubmitButton({ label: 'Submit' });
            form.clientScriptModulePath = './str_cs_approvalrejection_notes_overlay';
            response.writePage(form);
        }
    
        function processFormSubmission(request, response) {
            const params = request.parameters;
            let vendorRequest = record.load({ type: params.custpage_recordtype, id: params.custpage_recordid });
            const anticipatedSpend = vendorRequest.getValue({ fieldId: 'custrecord_vr_anticipatedspend' });
            const currentUserRole = runtime.getCurrentUser().role;
    
            if (params.custpage_rejectionnotes) {
                processRejection(params.custpage_recordtype, params.custpage_recordid, params.custpage_rejectionnotes);
                // processRejection(vendorRequest, params.custpage_rejectionnotes);
            } else if (params.custpage_approvalnotes !== undefined) {
                applyApprovalLogic(vendorRequest, anticipatedSpend, currentUserRole, params.custpage_approvalnotes);
            }
    
            vendorRequest.save({ ignoreMandatoryFields: true });
            redirectToOpener(response);
        }
    
        // function processRejection(vendorRequest, rejectionNotes) {
        function processRejection(vendorRequestType, vendorRequestId, rejectionNotes) {
            const today = new Date();
            record.submitFields({
                type: vendorRequestType,
                id: vendorRequestId,
                values: {
                    custrecord_rejection_notes: rejectionNotes,
                    custrecord_vr_rejectedby: runtime.getCurrentUser().id,
                    custrecord_vr_rejecteddate: today
                },
                ignoreMandatoryFields: true
            });
            // vendorRequest.setValue({ fieldId: 'custrecord_rejection_notes', value: rejectionNotes });
            // vendorRequest.setValue({ fieldId: 'custrecord_vr_rejectedby', value: runtime.getCurrentUser().id });
            // vendorRequest.setValue({ fieldId: 'custrecord_vr_rejecteddate', value: today });
        }
    
        function applyApprovalLogic(vendorRequest, anticipatedSpend, currentUserRole, approvalNotes) {
            // Ensure sequential approval logic based on anticipatedSpend
            if (['1', '2'].includes(anticipatedSpend)) {
                setApprovalIfEmpty(vendorRequest, 1, currentUserRole, approvalNotes);
            } else if (['3', '4', '5'].includes(anticipatedSpend)) {
                if (!setApprovalIfEmpty(vendorRequest, 1, currentUserRole, approvalNotes)) {
                    setApprovalIfEmpty(vendorRequest, 2, currentUserRole, approvalNotes);
                }
            } else if (anticipatedSpend === '6') {
                if (!setApprovalIfEmpty(vendorRequest, 1, currentUserRole, approvalNotes) && 
                    !setApprovalIfEmpty(vendorRequest, 2, currentUserRole, approvalNotes)) {
                    setApprovalIfEmpty(vendorRequest, 3, currentUserRole, approvalNotes);
                }
            }
        }
    
        function setApprovalIfEmpty(vendorRequest, level, currentUserRole, approvalNotes) {
            const fieldsConfig = getFieldsConfig(level);
            // Proceed only if the approver field for this level is empty
            if (!vendorRequest.getValue({ fieldId: fieldsConfig.approver })) {
                const today = new Date();
                vendorRequest.setValue({ fieldId: fieldsConfig.approver, value: runtime.getCurrentUser().id });
                vendorRequest.setValue({ fieldId: fieldsConfig.approved, value: 1 }); // Assuming '1' means 'Yes'
                vendorRequest.setValue({ fieldId: fieldsConfig.date, value: today });
                vendorRequest.setValue({ fieldId: fieldsConfig.notes, value: approvalNotes || '' }); // Set approval notes even if they are empty
                log.debug(`Approval Level ${level} Fields Set`, { currentUserRole, approvalNotes });
                return true; // Indicates that this level was set
            }
            return false; // Indicates no action taken for this level
        }
    
        function getFieldsConfig(level) {
            return {
                1: { approver: 'custrecord_vr_ap1approver', approved: 'custrecord_vr_ap1approved', date: 'custrecord_vr_ap1date', notes: 'custrecord_vr_ap1approvalnotes' },
                2: { approver: 'custrecord_vr_ap2approver', approved: 'custrecord_vr_ap2approved', date: 'custrecord_vr_ap2date', notes: 'custrecord_vr_ap2approvalnotes' },
                3: { approver: 'custrecord_vr_ap3approver', approved: 'custrecord_vr_ap3approved', date: 'custrecord_vr_ap3date', notes: 'custrecord_vr_ap3approvalnotes' },
            }[level];
        }
    
        function isRoleEligibleForLevel(currentUserRole, level) {
            // In this context, all roles can fill out the first level, but specific roles for levels 2 and 3
            const roleEligibility = {
                1: [1031, 1030, 1023, 3], // All roles for level 1
                2: [1030, 1023, 3], // Specific roles for level 2
                3: [1030, 1023, 3] // Specific roles for level 3
            };
            return roleEligibility[level].includes(currentUserRole);
        }
    
        function redirectToOpener(response) {
            response.write('<html><head><script type="text/javascript">window.opener.location.reload(); window.close();</script></head><body></body></html>');
        }
    
        function setupFormField(form, id, defaultValue, label, isHidden, isMandatory = false) {
            let field = form.addField({ id, type: serverWidget.FieldType.TEXT, label });
            if (defaultValue) field.defaultValue = defaultValue;
            if (isHidden) field.updateDisplayType({ displayType: serverWidget.FieldDisplayType.HIDDEN });
            if (isMandatory) field.isMandatory = true;
        }
    
        return { onRequest };
    });    