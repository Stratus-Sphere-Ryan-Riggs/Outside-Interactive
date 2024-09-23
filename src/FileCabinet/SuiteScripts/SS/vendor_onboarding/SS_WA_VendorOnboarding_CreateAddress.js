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

        const addSubsidiaries = (record) => {
            const TITLE = `${MODULE}.AddSubsidiaries`;
            // addSubsidiaryLine({ record, value: SS_Constants.Subsidiaries.OUTSIDE_INC });
            addSubsidiaryLine({ record, value: SS_Constants.Subsidiaries.OUTSIDE_INC_CANADA });
        };

        const addSubsidiaryLine = (options) => {
            const TITLE = `${MODULE}.AddSubsidiaryLine`;
            let { record, value } = options;

            let sublist = { sublistId: 'submachine' };
            record.selectNewLine(sublist);
            record.setCurrentSublistValue({ ...sublist, fieldId: 'subsidiary', value });
            record.commitLine(sublist);
        };

        const getLegalAddress = (record) => {
            return {
                addressee: record.getValue({ fieldId: FIELDS.ADDRESSEE }),
                address_1: record.getValue({ fieldId: FIELDS.ADDRESS_1 }),
                address_2: record.getValue({ fieldId: FIELDS.ADDRESS_2 }),
                city: record.getValue({ fieldId: FIELDS.CITY }),
                state: (record.getText({ fieldId: FIELDS.COUNTRY }) || '').toLowerCase() === 'united states' ?
                    record.getText({ fieldId: FIELDS.STATE }) : record.getValue({ fieldId: FIELDS.STATE_INTL }),
                zip: record.getValue({ fieldId: FIELDS.ZIP_CODE }),
                country: record.getText({ fieldId: FIELDS.COUNTRY }),
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
            // let companyName = record.getHeaderValue({ fieldId: SS_Constants.Entity.COMPANY_NAME });
            // log.debug({ title: `${TITLE}`, details: `companyName = ${companyName}` });
            
            addr.setValue({ fieldId: 'addressee', value: address.addressee });
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
            log.debug({ title: `legalAddress`, details: JSON.stringify(legalAddress) });

            let vendor = SS_Record.load({
                type: SS_Record.Type.VENDOR,
                id: linkToVendor,
                isDynamic: true
            });

            if (vendorRequest.getValue({ fieldId: 'custrecord_vr_source' }) !== '5') {
                createAddressBookLine({
                    address: legalAddress,
                    defaultBilling: true,
                    defaultShipping: true,
                    label: legalAddress.address_1,
                    record: vendor
                });
            }

            addSubsidiaries(vendor);
            
            let id = vendor.save();
            log.debug({ title: TITLE, details: `Addresses for vendor ${id} were successfully created.` });
        };

        return { onAction };
    }
);