/**
 * Wrapper module for the following custom record: Strat | Address Form Mapping
 * 
 * @NApiVersion     2.1
 * @NModuleScope    SameAccount
 */

define(
    [
        './SS_Record',
        './SS_Search'
    ],
    (
        SS_Record,
        SS_Search
    ) => {
        const MODULE = `SS.AddressFormMapping`;
        const ADDRESS_FORM_MAPPING = {
            Id: 'customrecord_str_add_map',
            Fields: {
                ADDRESSEE: 'custrecord_str_add_map_addressee',
                ADDRESS_1: 'custrecord_str_add_map_addr1',
                ADDRESS_2: 'custrecord_str_add_map_addr2',
                ADDRESS_3: 'custrecord_str_add_map_addr3',
                ADDRESS_4: 'custrecord_str_add_map_addr4',
                ATTENTION: 'custrecord_str_add_map_attention',
                CITY: 'custrecord_str_add_map_city',
                COUNTRY: 'custrecord_str_add_map_country',
                IS_INACTIVE: 'isinactive',
                IS_STATE_DROPDOWN: 'custrecord_str_add_map_isstatedd',
                STATE: 'custrecord_str_add_map_state',
                ZIP_POSTAL: 'custrecord_str_add_map_zip'
            }
        };
        const FIELDS = ADDRESS_FORM_MAPPING.Fields;

        const getMappingByCountry = (options) => {
            const TITLE = `${MODULE}.GetMappingByCountry`;
            let { country } = options;

            let filters = [
                [ FIELDS.IS_INACTIVE, 'is', false ]
            ];
            if (country) {
                filters.push('AND');
                filters.push([ FIELDS.COUNTRY, 'anyof', country ]);
            }

            let mapSearch = SS_Search.create({
                type: ADDRESS_FORM_MAPPING.Id,
                filters,
                columns: Object.values(FIELDS)
            });
            let mapResults = mapSearch.getResults();
            log.debug({ title: `${TITLE} mapResults`, details: JSON.stringify(mapResults) });

            return mapResults.length > 0 ? mapResults[0] : null;
        };

        return {
            mapAddress: (options) => {
                const TITLE = `${MODULE}.MapAddress`;
                let { country, data } = options;

                let mapping = getMappingByCountry({ country });
                if (!mapping) {
                    log.audit({ title: TITLE, details: `Unable to find address form mapping for country ${country}. Exiting...` });
                    return data;
                }

                let output = {};
                for (const [ key, value ] of Object.entries(mapping)) {
                    let arr = key.split('_');
                    let dataKey = arr[arr.length - 1];
                    output[value] = data[dataKey];
                }

                // log.debug({ title: `${TITLE} output`, details: JSON.stringify(output) });
                return output;
            }
        };
    }
);