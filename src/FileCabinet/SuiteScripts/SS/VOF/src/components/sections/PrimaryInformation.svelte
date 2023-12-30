<script>
    import Section from "../form/Section.svelte";
    import InputText from "../form/InputText.svelte";
    import InputTelephone from "../form/InputTelephone.svelte";
    
    import { formFields, formValues } from "../../store/pageData";
    import Row from "../form/Row.svelte";

    export let id = 'primary_information';
    export let title = 'Primary Information';

    // console.log(`formValues`, formValues);
</script>

<Section id="{id}" title="{title}">
    <InputText
        id="{$formFields.VENDOR_NAME}"
        label="Vendor Name"
        bind:value={$formValues[$formFields.VENDOR_NAME]}
    />
    <InputText
        id="{$formFields.PRIMARY_CONTACT}"
        label="Primary Contact (Full Name)"
        bind:value={$formValues[$formFields.PRIMARY_CONTACT]}
    />
    <InputText
        id="{$formFields.EMAIL}"
        label="Email"
        bind:value={$formValues[$formFields.EMAIL]}
    />
    <Row>
        <InputTelephone
            id="{$formFields.PHONE}"
            label="Telephone"
            bind:value={$formValues[$formFields.PHONE]}
        />
        <InputTelephone
            id="{$formFields.FAX}"
            label="Fax"
            optional="T"
            bind:value={$formValues[$formFields.FAX]}
        />
    </Row>
</Section>
