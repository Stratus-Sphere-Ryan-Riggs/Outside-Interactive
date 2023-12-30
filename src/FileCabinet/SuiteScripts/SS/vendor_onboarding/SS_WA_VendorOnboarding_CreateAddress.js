/**
 * @NApiVersion     2.1
 * @NScriptType     WorkflowActionScript
 * @NModuleScope    SameAccount
 */

define(
    [
        '../common/SS_Constants',
        '../common/SS_Record'
    ],
    (
        SS_Constants,
        SS_Record
    ) => {
        const MODULE = `SS.WA|VendorOnboarding.CreateAddress`;
        const VENDOR_REQUEST = SS_Constants.CustomRecords.VendorRequest;
        const FIELDS = VENDOR_REQUEST.Fields;

        const getLegalAddress = (record) => {
            return {
                address_1: record.getValue({ fieldId: FIELDS.ADDRESS_1 }),
                address_2: record.getValue({ fieldId: FIELDS.ADDRESS_2 }),
                city: record.getValue({ fieldId: FIELDS.CITY }),
                state: record.getText({ fieldId: FIELDS.STATE }),
                zip: record.getValue({ fieldId: FIELDS.ZIP_CODE }),
                country: record.getText({ fieldId: FIELDS.COUNTRY }),
            };
        };

        const getRemittanceAddress = (record) => {
            return {
                sameAsLegal: record.getValue({ fieldId: FIELDS.SAME_AS_LEGAL_ADDRESS }),
                address_1: record.getValue({ fieldId: FIELDS.REMIT_TO_ADDR_1 }),
                address_2: record.getValue({ fieldId: FIELDS.REMIT_TO_ADDR_2 }),
                city: record.getValue({ fieldId: FIELDS.REMIT_TO_CITY }),
                state: record.getText({ fieldId: FIELDS.REMIT_TO_STATE }),
                zip: record.getValue({ fieldId: FIELDS.REMIT_TO_ZIP }),
                country: record.getText({ fieldId: FIELDS.REMIT_TO_COUNTRY }),
            };
        };

        const createAddressBookLine = (options) => {
            let { address, defaultBilling, defaultShipping, label, record } = options;

            let sublist = { sublistId: 'addressbook' };
            record.selectNewLine(sublist);
            record.setCurrentSublistValue({ ...sublist, fieldId: 'label', value: label });
            record.setCurrentSublistValue({ ...sublist, fieldId: 'defaultbilling', value: defaultBilling });
            record.setCurrentSublistValue({ ...sublist, fieldId: 'defaultshipping', value: defaultShipping });

            let addr = record.getCurrentSublistSubrecord({
                ...sublist,
                fieldId: 'addressbookaddress'
            });
            addr.setText({ fieldId: 'country', text: address.country });
            addr.setValue({ fieldId: 'city', value: address.city });
            addr.setText({ fieldId: 'state', text: address.state });
            addr.setValue({ fieldId: 'zip', value: address.zip });
            addr.setValue({ fieldId: 'addr1', value: address.address_1 });
            addr.setValue({ fieldId: 'addr2', value: address.address_2 });

            record.commitLine(sublist);
        };

        const onAction = (context) => {
            const TITLE = `${MODULE}.Action`;
            let { newRecord } = context;
            let linkToVendor = newRecord.getValue({ fieldId: 'custrecord_vr_link_vendor' });
            if (!linkToVendor) {
                return;
            }

            let vendorRequest = SS_Record.load({
                type: VENDOR_REQUEST.Id,
                id: newRecord.id,
                isDynamic: true
            });

            let legalAddress = getLegalAddress(vendorRequest);
            let remittanceAddress = getRemittanceAddress(vendorRequest);
            log.debug({ title: `remittanceAddress`, details: JSON.stringify(remittanceAddress) });

            let vendor = SS_Record.load({
                type: SS_Record.Type.VENDOR,
                id: linkToVendor,
                isDynamic: true
            });

            createAddressBookLine({
                address: legalAddress,
                defaultBilling: remittanceAddress.sameAsLegal,
                defaultShipping: true,
                label: legalAddress.address_1,
                record: vendor
            });

            if (remittanceAddress.sameAsLegal === false) {
                createAddressBookLine({
                    address: remittanceAddress,
                    defaultBilling: true,
                    defaultShipping: false,
                    label: remittanceAddress.address_1,
                    record: vendor
                });
            }
            
            let id = vendor.save();
            log.debug({ title: TITLE, details: `Addresses for vendor ${id} were successfully created.` });
        };

        return { onAction };
    }
);