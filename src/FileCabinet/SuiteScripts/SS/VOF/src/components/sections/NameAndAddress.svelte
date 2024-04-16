<script>
    import Card from "../form/Card.svelte";
    import Dropdown from "../form/Dropdown.svelte";
    import InputText from "../form/InputText.svelte";
    import Row from "../form/Row.svelte";
    import { callZipAPI } from "../../store/zip";
    import { countryStates, formFields, formValues, dropdownData, radioData } from "../../store/pageData";

    export let id = 'tax_info';
    export let title = `Tax Information`;

    let addressCountries = [
        { text: '', value: '' }
    ];
    let countries = [ ...new Set($countryStates.map(c => `${c.countryname}|${c.countryid}`)) ];
    let addressStates = [];

    addressCountries = addressCountries.concat(
        countries.map(c => {
            return {
                text: c.substring(0, c.indexOf('|')),
                value: c.substring(c.indexOf('|') + 1)
            };
        })
    );

    let taxClassifications = [];
    taxClassifications = taxClassifications.concat(
        $dropdownData[$formFields.TAX_CLASSIFICATION].map(c => {
            return {
                text: c.name,
                id: c.id
            };
        })
    );
    console.log('taxClassifications', taxClassifications);

    const onChangeZip = (e) => {
        let zip = e.detail.value;
        // console.log(`onChangeZip`, e.detail.value);
        let selectedCountry = $countryStates.find(s =>
            s.countryname === document.getElementById('custrecord_vr_country')['value']
        );
        callZipAPI({
            zip,
            country: selectedCountry.countryid,
            targets: {
                city: $formFields.CITY,
                state: $formFields.STATE
            }
        });
        // document.getElementById('custrecord_vr_city')
        // document.getElementById('custrecord_vr_state')
    };

    const onChangeCountry = (e) => {
        let states = $countryStates.filter(c =>
            c.countryname === e.detail.value &&
            !!c.statefullname === true
        );
        // statesOptional = states.length <= 0;
        // statesVisible = states.length > 0;

        addressStates = [
            { text: '', value: '' }
        ].concat(states.map(s => {
            return {
                text: s.statefullname,
                value: s.stateshortname
            };
        }));

        /* dispatch('change-country', {
            value: e.detail.value
        }); */
        formValues.update(o => {
            o[$formFields.COUNTRY] = e.detail.value;
            // o[$formFields.ADDRESS_1] = '';
            // o[$formFields.ADDRESS_2] = '';
            o[$formFields.CITY] = '';
            o[$formFields.STATE] = '';
            o[$formFields.ZIP] = '';
            return o;
        });
        console.log(`PrimaryInformation formValues`, $formValues);

        isUS = e.detail.value.toLowerCase() === 'united states';
        notUS = !isUS;
        // isUSCompany = isCompany === true && isUS === true;
        // notUSCompany = (isCompany === true && isUS === false) || isIndividual === true;
        isUSCompany = isCompany === true && isUS === true;
        notUSCompany = isCompany === true && isUS === false;
        isUSIndividual = isIndividual === true && isUS === true;
        notUSIndividual = isIndividual === true && isUS === false;

        console.log(`PrimaryInformation changeCountry`, `isCompany = ${isCompany}; isIndividual = ${isIndividual}; isUS = ${isUS}; isUSCompany = ${isUSCompany}; notUS = ${notUS}; notUSCompany = ${notUSCompany}`);
        taxIdLabel = `Tax ID ${isUS === true ? '(XX-XXXXXXX)' : ''}`;
    }
    onChangeCountry({ detail: { value: $formValues[$formFields.COUNTRY] } });

    $: vendorType = $formValues[$formFields.CATEGORY];
    $: isIndividual = vendorType === '1';
    $: isCompany = !isIndividual;
    $: isUS = $formValues[$formFields.COUNTRY].toLowerCase() === 'united states';
    $: notUS = !isUS;
    $: isCA = $formValues[$formFields.COUNTRY].toLowerCase() === 'canada';
    $: isUSorCA = isUS === true || isCA === true;
    $: notUSorCA = !isUSorCA;
    $: isUSCompany = isCompany === true && isUS === true;
    $: notUSCompany = isCompany === true && isUS === false;
    $: isUSIndividual = isIndividual === true && isUS === true;
    $: notUSIndividual = isIndividual === true && isUS === false;
    $: taxIdLabel = 'Tax ID' + (isUSCompany === true ? ' (XX-XXXXXXX)' : '') + ' (If not available, provide SSN).';
</script>

<Card {id} {title}>
    <Dropdown
        id="{$formFields.COUNTRY}"
        label="Country"
        cls="country"
        items={addressCountries}
        bind:value={$formValues[$formFields.COUNTRY]}
        on:change="{onChangeCountry}"
    />
    <InputText
        id="{$formFields.COMPANY_NAME}"
        label="Name as shown on your income tax return (must match box 1 of W-9 or W-8)"
        bind:value={$formValues[$formFields.COMPANY_NAME]}
    />
    <InputText
        id="{$formFields.DBA}"
        label="Business Name or DBA"
        bind:value={$formValues[$formFields.DBA]}
        optional
    />
    
    <InputText
        id="{$formFields.ADDRESSEE}"
        label="Addressee"
        bind:value={$formValues[$formFields.ADDRESSEE]}
    />
    <InputText
        id="{$formFields.ADDRESS_1}"
        label="Address - Line 1"
        bind:value={$formValues[$formFields.ADDRESS_1]}
    />
    <InputText
        id="{$formFields.ADDRESS_2}"
        label="Address - Line 2"
        optional
        bind:value={$formValues[$formFields.ADDRESS_2]}
    />

    <InputText
        id="{$formFields.ZIP_CODE}"
        label="Zip Code"
        cls="zip w120"
        bind:value={$formValues[$formFields.ZIP_CODE]}
        on:change={onChangeZip}
    />

    <InputText
        id="{$formFields.CITY}"
        label="City"
        bind:value={$formValues[$formFields.CITY]}
    />

    <Dropdown
        id="{$formFields.STATE}"
        label="State/Province"
        bind:items={addressStates}
        bind:value={$formValues[$formFields.STATE]}
        bind:visible={isUSorCA}
        bind:optional={notUSorCA}
    />

    <InputText
        id="{$formFields.STATE_INTL}"
        label="State/Province"
        bind:value={$formValues[$formFields.STATE_INTL]}
        bind:optional={isUSorCA}
        bind:visible={notUSorCA}
    />

    <InputText
        id="{$formFields.TAX_ID_US}"
        label={taxIdLabel}
        cls="w160"
        optional
        optionalLabel={false}
        bind:value={$formValues[$formFields.TAX_ID_US]}
        bind:visible={isUS}
    />
    <InputText
        id="{$formFields.SSN}"
        label="SSN (XXX-XX-XXXX)"
        cls="w160"
        optional
        optionalLabel={false}
        bind:value={$formValues[$formFields.SSN]}
        bind:visible={isUS}
    />
    <InputText
        id="{$formFields.TAX_ID_NON_US}"
        label="Business Tax ID/VAT Registration #"
        cls="w160"
        optional
        bind:value={$formValues[$formFields.TAX_ID_NON_US]}
        bind:visible={notUS}
    />
</Card>

<style></style>