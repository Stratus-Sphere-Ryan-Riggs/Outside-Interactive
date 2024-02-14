<script>
    import Card from "../form/Card.svelte";
    import Dropdown from "../form/Dropdown.svelte";
    import InputInline from "../form/InputInline.svelte";
    import InputText from "../form/InputText.svelte";
    import InputTelephone from "../form/InputTelephone.svelte";
    import RadioGroup from "../form/RadioGroup.svelte";
    import TextArea from "../form/TextArea.svelte";
    
    import { formFields, formValues, taxClassifications } from "../../store/pageData";
    import Row from "../form/Row.svelte";

    export let id = 'primary_information';
    export let title = 'Primary Information';

    let vendorTypes = [
        { text: 'Individual', value: '1' },
        { text: 'Company', value: '2' }
    ];

    const onChangeVendorType = (e) => {
        console.log(`onChangeVendorType value = ${e.detail.value}`);
        vendorType = e.detail.value;
        formValues.update(o => {
            o[$formFields.CATEGORY] = e.detail.value;
            return o;
        });
        console.log(`onChangeVendorType updated CATEGORY = ${$formValues[$formFields.CATEGORY]}`);

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

    $: vendorType = $formValues[$formFields.CATEGORY];
    $: isIndividual = vendorType === '1';
    $: isCompany = !isIndividual;
    // console.log(`formValues`, formValues);
</script>

<Card {id} {title}>
    <RadioGroup
        id="{$formFields.CATEGORY}"
        label="Type"
        bind:items={vendorTypes}
        bind:value={vendorType}
        on:change={onChangeVendorType}
    />
    <InputText
        id="{$formFields.FIRST_NAME}"
        label="First Name"
        bind:value={$formValues[$formFields.FIRST_NAME]}
        bind:optional={isCompany}
        bind:visible={isIndividual}
    />
    <InputText
        id="{$formFields.LAST_NAME}"
        label="Last Name"
        bind:value={$formValues[$formFields.LAST_NAME]}
        bind:optional={isCompany}
        bind:visible={isIndividual}
    />
    <InputText
        id="{$formFields.COMPANY_NAME}"
        label="Company Legal Name"
        bind:value={$formValues[$formFields.COMPANY_NAME]}
        bind:optional={isIndividual}
        bind:visible={isCompany}
    />
    <InputText
        id="{$formFields.DBA}"
        label="DBA"
        bind:value={$formValues[$formFields.DBA]}
        optional
    />
    <InputText
        id="{$formFields.PURCHASING_CONTACT}"
        label="Purchasing Contact"
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
        optional
        bind:value={$formValues[$formFields.MAIN_ACCT_CONTACT]}
    />
    <InputText
        id="{$formFields.MAIN_ACCT_CONTACT_EMAIL}"
        label="Main Accounting Contact Email"
        optional
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
        bind:value={$formValues[$formFields.OUTSIDE_REP_CONTACT]}
    />
    <TextArea
        id="{$formFields.VENDOR_COMMENTS}"
        label="Vendor Comments"
        bind:value={$formValues[$formFields.VENDOR_COMMENTS]}
    />
    <InputInline
        id="{$formFields.PAYMENT_TERMS}"
        label="Reinforcement of Company Payment Terms"
        bind:value={$formValues[$formFields.PAYMENT_TERMS]}
    />

    <Row>
        <InputText
            id="{$formFields.TAX_ID_US}"
            label="Tax ID"
            cls="w160"
            bind:optional={isCompany}
            bind:value={$formValues[$formFields.TAX_ID_US]}
        />
        <InputText
            id="{$formFields.SSN}"
            label="SSN"
            cls="w160"
            bind:optional={isCompany}
            bind:value={$formValues[$formFields.SSN]}
        />
        <InputText
            id="{$formFields.TAX_ID_NON_US}"
            label="Non-US Tax ID"
            cls="w160"
            visible={false}
            bind:optional={isIndividual}
            bind:value={$formValues[$formFields.TAX_ID_NON_US]}
        />
    </Row>

    <Dropdown
        id="{$formFields.TAX_CLASSIFICATION}"
        label="Tax Classification"
        items={$taxClassifications}
        bind:value={$formValues[$formFields.TAX_CLASSIFICATION]}
    />

</Card>
