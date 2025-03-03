/**
 * @NApiVersion     2.1
 * @NModuleScope    SameAccount
 */

define(
    [
        './SS_Constants',
        './SS_File',
        './SS_FileUpload',
        './SS_Format',
        './SS_Query',
        './SS_Record',
        './SS_Script',
        './SS_Url'
    ],
    (
        SS_Constants,
        SS_File,
        SS_FileUpload,
        SS_Format,
        SS_Query,
        SS_Record,
        SS_Script,
        SS_Url
    ) => {
        const MODULE = `SS|VendorOnboarding`;
        const VENDOR_REQUEST = SS_Constants.CustomRecords.VendorRequest;
        const FIELDS = VENDOR_REQUEST.Fields;
        const SOURCES = SS_Constants.CustomLists.VendorRequestSource;

        const buildBackendUrl = (options) => {
            const TITLE = `${MODULE}.BuildBackendUrl`;
            let { id } = options;

            let urlParams = {
                scriptId: SS_Script.Id,
                deploymentId: SS_Script.DeploymentId,
                returnExternalUrl: true
            };
            if (id) {
                urlParams.params = {
                    request_id: id
                };
            }

            let backendUrl = SS_Url.resolveScript(urlParams);
            log.debug({ title: TITLE, details: backendUrl });

            return backendUrl;
        };

        const getDropdownData = () => {
            let TITLE = `${MODULE}.GetDropdownData`;
            let ddData = {};
            const FIELDS = SS_Constants.CustomRecords.VendorRequest.Fields;

            let taxClassifications = SS_Query.getCustomListValues(SS_Constants.CustomLists.TaxClassification);
            log.debug({ title: `${TITLE} taxClassifications`, details: JSON.stringify(taxClassifications) });
            ddData[FIELDS.TAX_CLASSIFICATION] = taxClassifications;

            return ddData;
        };

        const getFiles = (options) => {
            const TITLE = `${MODULE}.GetFiles`;
            let { id, record } = options;
            let output = {};

            if (!id && !record) {
                log.audit({ title: TITLE, details: `Missing required parameter: ID or record object.` });
                return output;
            }
            
            let requestRecord = record || SS_Record.load({ type: VENDOR_REQUEST.Id, id });
            let requestSource = requestRecord.getValue({ fieldId: FIELDS.SOURCE })
            let FILE_FIELDS = [];

            switch (requestSource) {
                case SOURCES.ONLINE_FORM: {
                    FILE_FIELDS[
                        FIELDS.W9,
                        FIELDS.SOC_CERTIFICATE,
                        FIELDS.CERTIFICATE_OF_INSURANCE,
                        FIELDS.DATA_BREACH_REPORT,
                        FIELDS.OFAC_CHECK
                    ];
                    break;
                }
                case SOURCES.REFUNDS: {
                    FILE_FIELDS = [
                        FIELDS.ORIGINAL_RECEIPT_DOCUMENT
                    ];
                    break;
                }
            }

            FILE_FIELDS.forEach(fieldId => {
                output[fieldId] = requestRecord.getValue({ fieldId });
            });
            log.debug({ title: `${TITLE} output`, details: JSON.stringify(output) });

            return output;
        };

        const getRadioGroupData = () => {
            let TITLE = `${MODULE}.GetRadioGroupData`;
            let listData = {};
            const FIELDS = SS_Constants.CustomRecords.VendorRequest.Fields;

            let bankingMethods = SS_Query.getCustomListValues(SS_Constants.CustomLists.BankingMethod);
            log.debug({ title: `${TITLE} bankingMethods`, details: JSON.stringify(bankingMethods) });
            listData[FIELDS.BANK_DETAIL_METHOD] = bankingMethods;

            let typesOfAccount = SS_Query.getCustomListValues(SS_Constants.CustomLists.TypeOfAccount);
            log.debug({ title: `${TITLE} typesOfAccount`, details: JSON.stringify(typesOfAccount) });
            listData[FIELDS.TYPE_OF_ACCOUNT] = typesOfAccount;

            return listData;
        };

        const getProductsRefunded = () => {
            const TITLE = `${MODULE}.GetProductsRefunded`;

            let refundReasons = SS_Query.getCustomListValues(SS_Constants.CustomLists.ProductsRefunded);
            log.debug({ title: `${TITLE} refundReasons`, details: JSON.stringify(refundReasons) });

            return refundReasons;
        };

        const getRefundReasons = () => {
            const TITLE = `${MODULE}.GetRefundReasons`;

            let refundReasons = SS_Query.getCustomListValues(SS_Constants.CustomLists.RefundReasons);
            log.debug({ title: `${TITLE} refundReasons`, details: JSON.stringify(refundReasons) });

            return refundReasons;
        };

        const getVendorName = (options) => {
            let { record } = options;
            let output = '';

            let type = record.getValue({ fieldId: FIELDS.CATEGORY });
            switch (type.toString()) {
                case '1': {
                    // Individual
                    output = `${record.getValue({ fieldId: FIELDS.FIRST_NAME })} ${record.getValue({ fieldId: FIELDS.LAST_NAME })}`
                    break;
                }
                case '2': {
                    // Company
                    output = `${record.getValue({ fieldId: FIELDS.COMPANY_NAME })}`;
                    break;
                }
            }

            return output;
        };

        const moveFiles = (options) => {
            const TITLE = `${MODULE}.MoveFiles`;
            let { id, from } = options;
            log.debug({ title: `${TITLE} options`, details: JSON.stringify(options) });

            if (!id) {
                log.error({ title: TITLE, details: `Missing required value: Request ID.` });
                return;
            }

            if (!from) {
                log.error({ title: TITLE, details: `Missing required value: From Folder ID.` });
                return;
            }

            try {
                let vendorRequest = SS_Record.load({ type: VENDOR_REQUEST.Id, id });
                let vendorRequestFiles = getFiles({ record: vendorRequest });
                let folderId = SS_FileUpload.createFolder({
                    id,
                    name: getVendorName({ record: vendorRequest }),
                    source: vendorRequest.getValue({ fieldId: FIELDS.SOURCE })
                });
    
                /* if (SS_FileUpload.move({ from, to: folderId }) === false) {
                    log.debug({ title: TITLE, detail: `Something went wrong...` });
                    return;
                } */
                let movedFiles = SS_FileUpload.move({ from: parseInt(from), to: folderId });
                if (movedFiles.length <= 0) {
                    log.audit({ title: TITLE, details: `No files were moved.` });
                    return;
                }
                log.debug({ title: TITLE, detail: `Successfully moved files from folder ${from} to ${folderId}` });

                updateFileLinks({
                    files: movedFiles,
                    id,
                    reference: vendorRequestFiles
                });
            }
            catch (ex) {
                log.error({ title: TITLE, details: ex.toString() });
                return;
            }
        };

        const readVendorRequestValues = (options) => {
            const TITLE = `${MODULE}.ReadVendorRequestValues`;
            let VENDOR_REQUEST = SS_Constants.CustomRecords.VendorRequest;
            let { id } = options;

            let vendorRequest = SS_Record.load({ id, type: VENDOR_REQUEST.Id });
            let isSubmitted = vendorRequest.getHeaderValue({ fieldId: 'custrecord_vr_vendorformsubmitted' });
            log.debug({ title: `${TITLE} isSubmitted`, details: isSubmitted });
            if (isSubmitted === true) {
                return 'This vendor request has already been submitted...';
            }
            
            const FIELDS = VENDOR_REQUEST.Fields;
            let headerValues = vendorRequest.getHeaderValues({ fields: Object.values(FIELDS) });
            headerValues['custrecord_vr_ns5categories'] = vendorRequest.getHeaderValue({ fieldId: 'custrecord_vr_ns5categories' });
            log.debug({ title: `${TITLE} headerValues`, details: JSON.stringify(headerValues) });

            [   FIELDS.COUNTRY,
                FIELDS.STATE,
                FIELDS.BANK_COUNTRY,
                FIELDS.BANK_CURRENCY,
                FIELDS.REMIT_TO_COUNTRY,
                FIELDS.REMIT_TO_STATE
            ].forEach(fieldId => headerValues[fieldId] = vendorRequest.getHeaderText({ fieldId }) );
            log.debug({ title: `${TITLE} headerValues`, details: JSON.stringify(headerValues) });

            return headerValues;
        };

        const render = (options) => {
            const TITLE = `${MODULE}.Render`;
            let { id } = options;
            let templateParam = SS_Script.getParameter(SS_Constants.ScriptParameters.HtmlTemplateFile);
            if (!templateParam) {
                let message = `Missing required value: HTML Template File`
                log.error({ title: TITLE, details: message });
                return message;
            }

            const VENDOR_REQUEST = SS_Constants.CustomRecords.VendorRequest;
            const FIELDS = VENDOR_REQUEST.Fields;
            let renderValue = SS_File.read({ name: templateParam });
            let backendUrl = buildBackendUrl(options);
            let headerValues = id ? readVendorRequestValues(options) : null;
            let now = new Date().getTime().toString();
            let mapValues = {
                BACKEND_URL: backendUrl,
                CURRENCIES: JSON.stringify(SS_Query.Currencies),
                DROPDOWN_DATA: JSON.stringify(getDropdownData()),
                FIELD_DATA: JSON.stringify(FIELDS),
                PRODUCT_REFUNDED: JSON.stringify(getProductsRefunded()),
                RADIO_DATA: JSON.stringify(getRadioGroupData()),
                REFUND_REASON: JSON.stringify(getRefundReasons()),
                STATE_COUNTRIES: JSON.stringify(SS_Query.StatesWithCountries),
                TIME_STAMP: now,
                UPLOAD_FOLDER: headerValues?.[FIELDS.UPLOAD_FOLDER] || SS_FileUpload.createFolder({ name: now })
            };
            if (id) {
                mapValues = {
                    ...mapValues,
                    REQUEST_DATA: JSON.stringify(headerValues),
                    SERVICE_PROVIDER: headerValues['custrecord_vr_ns5categories'] === SS_Constants.NS5_Categories.ON_BOARD,
                };
            }

            return replaceValues({
                input: renderValue,
                map: mapValues
            });
            /* renderValue = renderValue.replace('{BACKEND_URL}', backendUrl);

            let currencies = ;
            renderValue = renderValue.replace('{CURRENCIES}', JSON.stringify(currencies));

            let stateCountries = ;
            renderValue = renderValue.replaceAll('{STATE_COUNTRIES}', JSON.stringify(stateCountries));

            let timeStamp = new Date().getTime().toString();
            renderValue = renderValue.replaceAll('{TIME_STAMP}', timeStamp); */

            // return renderValue;
        };

        const replaceValues = (options) => {
            let { input, map } = options;

            for (const [key, value] of Object.entries(map)) {
                input = input.replaceAll(`{${key}}`, value);
            }

            return input;
        };

        const save = (options) => {
            const TITLE = `${MODULE}.Save`;
            let { id, data } = options;

            const FIELDS = SS_Constants.CustomRecords.VendorRequest.Fields;
            const FIELDS_EXCLUDE = [
                // FIELDS.W9,
                // FIELDS.CERTIFICATE_OF_INSURANCE
            ];
            const FIELDS_SETBYTEXT = [
                FIELDS.COUNTRY,
                FIELDS.STATE,
                FIELDS.BANK_COUNTRY,
                FIELDS.CURRENCY,
                FIELDS.PRODUCT_REFUNDED,
                FIELDS.REFUND_REASON
            ];
            const FIELDS_DATE = [
                FIELDS.REFUND_PERIOD_START_DATE,
                FIELDS.REFUND_PERIOD_END_DATE
            ];

            try {
                log.debug({ title: `${TITLE} id = ${id}`, details: JSON.stringify(options) });
                let vendorRequest = isNaN(parseInt(id)) === true ?
                    SS_Record.create({ type: SS_Constants.CustomRecords.VendorRequest.Id }) :
                    SS_Record.load({ id, type: SS_Constants.CustomRecords.VendorRequest.Id });
                let fields = Object.values(FIELDS);
                for (let i = 0, count = fields.length; i < count; i++) {
                    let fieldId = fields[i];
                    if (FIELDS_EXCLUDE.includes(fieldId)) {
                        continue;
                    }

                    if (data.hasOwnProperty(fieldId) === false) {
                        continue;
                    }
    
                    if (FIELDS_SETBYTEXT.includes(fieldId)) {
                        log.debug({ title: `${TITLE} FIELDS_SETBYTEXT fieldId = ${fieldId}; value = ${data[fieldId]}`, details: data[fieldId] });
                        vendorRequest.setHeaderText({ fieldId, text: data[fieldId] });
                        continue;
                    }
    
                    if (FIELDS_DATE.includes(fieldId)) {
                        log.debug({ title: `${TITLE} FIELDS_DATE fieldId = ${fieldId}`, details: `value = "${data[fieldId]}"` });

                        if (!!data[fieldId] === false) {
                            log.debug({ title: TITLE, details: `${fieldId} is BLANK. Skipping...` });
                            continue;
                        }

                        let dateValue = SS_Format.format({ type: 'Date', value: new Date(data[fieldId]) });
                        vendorRequest.setHeaderText({ fieldId, text: dateValue });
                        continue;
                    }
    
                    if (!!data[fieldId] === true) {
                        log.debug({ title: `${TITLE} fieldId = ${fieldId}`, details: data[fieldId] });
                        vendorRequest.setHeaderValue({ fieldId, value: data[fieldId] });
                    }
                }

                vendorRequest.setHeaderValue({ fieldId: 'custrecord_vr_vendorformsubmitted', value: true });
                let requestId = vendorRequest.save({ ignoreMandatoryFields: true });
                log.debug({ title: TITLE, detail: `Successfully updated Vendor Request ID = ${requestId}` });
                return { status: true, id: requestId };
            }
            catch (ex) {
                log.error({ title: TITLE, details: ex.toString() });
                return { status: false, message: ex.message || ex.toString() };
            }
        };

        const updateFileLinks = (options) => {
            const TITLE = `${MODULE}.UpdateFileLinks`;
            let { files, id, reference } = options;

            if (files?.length <= 0) {
                log.audit({ title: TITLE, details: `Missing required parameter: Files. Exiting...` });
                return;
            }

            if (!id) {
                log.audit({ title: TITLE, details: `Missing required parameter: Vendor Request ID.` });
                return;
            }

            if (!reference) {
                log.audit({ title: TITLE, details: `Missing required parameter: File reference. Exiting...` });
                return;
            }

            let doUpdate = false;
            let values = {};
            for (const [ fieldId, value ] of Object.entries(reference)) {
                let fileObject = files.find(f => f.old === value);
                if (!fileObject) { continue; }

                values[fieldId] = fileObject.new;
                doUpdate = true;
            }
            log.debug({ title: `${TITLE} values`, details: JSON.stringify(values) });

            if (doUpdate === false) {
                log.audit({ title: TITLE, details: `No matching files to update. Exiting...` });
                return;
            }
            SS_Record.submitFields({
                type: VENDOR_REQUEST.Id,
                id,
                values
            });
        };

        const upload = (options) => {
            const TITLE = `${MODULE}.Upload`;
            let { file, folder } = options;
            // let folder = SS_Script.getParameter(SS_Constants.ScriptParameters.FileUploadFolder);
            if (!folder) {
                let message = `Missing required parameter: Folder.`;
                log.error({ title: TITLE, details: message });
                return { status: false, message };
            }
            log.debug({ title: TITLE, details: JSON.stringify(file) });

            try {
                log.debug({ title: TITLE, details: 'here' });
                return SS_File.create({ ...file, folder });
            }
            catch (ex) {
                let message = ex.message || ex.toString();
                log.error({ title: TITLE, details: ex.toString() });
                return { status: false, message };
            }
        };

        return {
            moveFiles,
            render,
            save,
            upload
        };
    }
);