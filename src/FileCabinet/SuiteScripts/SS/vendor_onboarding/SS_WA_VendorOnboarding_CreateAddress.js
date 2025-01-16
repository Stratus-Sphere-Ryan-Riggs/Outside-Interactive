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
                state: [ 'united states', 'canada' ].indexOf((record.getText({ fieldId: FIELDS.COUNTRY }) || '').toLowerCase()) >= 0 ?
                    record.getText({ fieldId: FIELDS.STATE }) : record.getValue({ fieldId: FIELDS.STATE_INTL }),
                zip: record.getValue({ fieldId: FIELDS.ZIP_CODE }),
                country: record.getText({ fieldId: FIELDS.COUNTRY }),
            };
        };

        const createAddressBookLine = (options) => {
            const TITLE = `${MODULE}.CreateAddressBookLine`;
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
            log.debug({ title: `createAddressBookLine addr`, details: JSON.stringify(addr) });
            // let companyName = record.getHeaderValue({ fieldId: SS_Constants.Entity.COMPANY_NAME });
            // log.debug({ title: `${TITLE}`, details: `companyName = ${companyName}` });

            log.debug({ title: `createAddressBookLine address`, details: JSON.stringify(address) });
            log.debug({ title: `createAddressBookLine address.addressee`, details: address.addressee });
            addr.setText({ fieldId: 'country', text: address.country });
            addr.setValue({ fieldId: 'city', value: address.city });
            addr.setText({ fieldId: 'state', text: address.state });
            addr.setValue({ fieldId: 'zip', value: address.zip });
            addr.setValue({ fieldId: 'addr1', value: address.address_1 });
            addr.setValue({ fieldId: 'addr2', value: address.address_2 });
            addr.setValue({ fieldId: 'addressee', value: address.addressee });

            log.debug({ title: `createAddressBookLine`, details: `Committing address line...` });

            try {
                record.commitLine(sublist);
            }
            catch (ex) {
                log.audit({ title: TITLE, details: `Error adding vendor address: ${ex.message || ex.toString()}` });

                // ...dump address text into custom field on vendor record
                record.setValue({ fieldId: 'custentity_strat_vendoraddressdetails', value: JSON.stringify(address) });

                // ...flag vendor record
                record.setValue({ fieldId: 'custentity_strat_venaddress_issue', value: true });
            }
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

            let createAddress = (
                (vendorRequest.getValue({ fieldId: 'custrecord_vr_source' }) !== '5') ||
                (
                    vendorRequest.getValue({ fieldId: 'custrecord_vr_source' }) === '5' &&
                    vendorRequest.getValue({ fieldId: 'custrecord_vr_pref_payment_method' }) === '4'
                )
            );

            addSubsidiaries(vendor);
            log.debug({ title: TITLE, details: `Subsidiaries for new vendor were successfully created.` });

            if (createAddress === true) {
                createAddressBookLine({
                    address: legalAddress,
                    defaultBilling: true,
                    defaultShipping: true,
                    label: legalAddress.address_1,
                    record: vendor
                });
            }
            
            let id = vendor.save();
            log.debug({ title: TITLE, details: `Addresses for vendor ${id} were successfully created.` });
        };

        return { onAction };
    }
);