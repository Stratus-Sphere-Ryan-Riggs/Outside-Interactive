<script>
    import Card from "../form/Card.svelte";
    import Dropdown from "../form/Dropdown.svelte";
    import InputInline from "../form/InputInline.svelte";
    import InputText from "../form/InputText.svelte";
    import InputTelephone from "../form/InputTelephone.svelte";
    import RadioGroup from "../form/RadioGroup.svelte";
    import TextArea from "../form/TextArea.svelte";
    
    import { countryStates, formFields, formValues, dropdownData, radioData } from "../../store/pageData";
    import Row from "../form/Row.svelte";
    import { fields } from "../../store/fields";

    export let id = 'primary_information';
    export let title = 'Primary Information';

    let vendorTypes = [
        { text: 'Individual', value: '1' },
        { text: 'Company', value: '2' }
    ];

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

    const onChangeVendorType = (e) => {
        console.log(`onChangeVendorType value = ${e.detail.value}`);
        vendorType = e.detail.value;
        formValues.update(o => {
            o[$formFields.CATEGORY] = e.detail.value;
            return o;
        });
        console.log(`onChangeVendorType updated CATEGORY = ${$formValues[$formFields.CATEGORY]}`);

        vendorType = $formValues[$formFields.CATEGORY];
        /* onChangeCountry({
            origin: 'method',
            detail: {
                value: e.detail.value === '1' ? "United States" : ""
            }
        });
        onChangeCurrency({
            detail: {
                value: e.detail.value === '1' ? "USD" : ""
            }
        }); */
    };

    /* const changeCountry = (c) => {
        isUS = c.toLowerCase() === 'united states';
        notUS = !isUS;
        // isUSCompany = isCompany === true && isUS === true;
        // notUSCompany = (isCompany === true && isUS === false) || isIndividual === true;
        isUSCompany = isCompany === true && isUS === true;
        notUSCompany = isCompany === true && isUS === false;
        isUSIndividual = isIndividual === true && isUS === true;
        notUSIndividual = isIndividual === true && isUS === false;

        console.log(`PrimaryInformation changeCountry`, `isCompany = ${isCompany}; isIndividual = ${isIndividual}; isUS = ${isUS}; isUSCompany = ${isUSCompany}; notUS = ${notUS}; notUSCompany = ${notUSCompany}`);
        taxIdLabel = `Tax ID ${isUS === true ? '(XX-XXXXXXX)' : ''}`;
    }; */

    // $: country = $formValues[$formFields.COUNTRY];
    // $: changeCountry($formValues[$formFields.COUNTRY]);
    $: taxIdLabel = '';
    $: vendorType = $formValues[$formFields.CATEGORY];
    $: isIndividual = vendorType === '1';
    $: isCompany = !isIndividual;
    $: outsideRepContact = `${$formValues[$formFields.REQUESTER_FIRST_NAME]} ${$formValues[$formFields.REQUESTER_LAST_NAME]}`;
    // $: paymentTerms = $formValues[$formFields.PAYMENT_TERMS];
    console.log(`dropdownData`, $dropdownData);

    $: isUS = $formValues[$formFields.COUNTRY].toLowerCase() === 'united states';
    $: notUS = !isUS;
    $: isUSCompany = isCompany === true && isUS === true;
    $: notUSCompany = isCompany === true && isUS === false;
    $: isUSIndividual = isIndividual === true && isUS === true;
    $: notUSIndividual = isIndividual === true && isUS === false;
    console.log(`MOUNT REACTIVE`, `isUS = ${isUS}; isUSCompany = ${isUSCompany}; notUS = ${notUS}; notUSCompany = ${notUSCompany}; isUSIndividual = ${isUSIndividual}; notUSIndividual = ${notUSIndividual}`);

    /*
    <!-- For removal -->
    <RadioGroup
        id="{$formFields.CATEGORY}"
        label="Type"
        bind:items={vendorTypes}
        bind:value={vendorType}
        on:change={onChangeVendorType}
    />
    */
</script>

<Card {id} {title}>
    <InputText
        id="{$formFields.PURCHASING_CONTACT}"
        label="Purchasing Contact Name"
        bind:value={$formValues[$formFields.PURCHASING_CONTACT]}
    />
    <InputText
        id="{$formFields.PURCHASING_CONTACT_EMAIL}"
        label="Purchasing Contact Email"
        bind:value={$formValues[$formFields.PURCHASING_CONTACT_EMAIL]}
    />
    <InputText
        id="{$formFields.MAIN_ACCT_CONTACT}"
        label="Main Accounting Contact"
        bind:value={$formValues[$formFields.MAIN_ACCT_CONTACT]}
    />
    <InputText
        id="{$formFields.MAIN_ACCT_CONTACT_EMAIL}"
        label="Main Accounting Contact Email"
        bind:value={$formValues[$formFields.MAIN_ACCT_CONTACT_EMAIL]}
    />
    <InputTelephone
        id="{$formFields.PHONE}"
        label="Phone #"
        bind:value={$formValues[$formFields.PHONE]}
    />
    <InputInline
        id="{$formFields.OUTSIDE_REP_CONTACT}"
        label="Name of Outside Rep Contact"
        bind:value={outsideRepContact}
    />
    <TextArea
        id="{$formFields.VENDOR_COMMENTS}"
        label="Vendor Comments"
        bind:value={$formValues[$formFields.VENDOR_COMMENTS]}
    />

</Card>
