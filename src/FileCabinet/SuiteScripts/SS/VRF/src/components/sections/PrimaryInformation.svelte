<script>
    import Card from "../form/Card.svelte";
    import InputText from "../form/InputText.svelte";
    import TextArea from "../form/TextArea.svelte";
    
    import { formFields, formValues } from "../../store/pageData";

    export let id = 'primary_information';
    export let title = 'Primary Information';
</script>

<Card {id} {title}>
    <InputText
        id="{$formFields.REQUESTER_EMAIL}"
        label="Requester's Outside Inc. Email Address"
        bind:value={$formValues[$formFields.REQUESTER_EMAIL]}
    />
    <InputText
        id="{$formFields.FIRST_NAME}"
        label="Customer First Name"
        bind:value={$formValues[$formFields.FIRST_NAME]}
    />
    <InputText
        id="{$formFields.LAST_NAME}"
        label="Customer Last Name"
        bind:value={$formValues[$formFields.LAST_NAME]}
    />
    <InputText
        id="{$formFields.PURCHASING_CONTACT_EMAIL}"
        label="Customer Email"
        bind:value={$formValues[$formFields.PURCHASING_CONTACT_EMAIL]}
    />
    <TextArea
        id="{$formFields.VENDOR_COMMENTS}"
        label="Additional Membership Info"
        optional
        bind:value={$formValues[$formFields.VENDOR_COMMENTS]}
    />

</Card>
