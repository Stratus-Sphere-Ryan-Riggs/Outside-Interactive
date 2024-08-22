<script>
    import Card from "../form/Card.svelte";
    import InputText from "../form/InputText.svelte";
    import TextArea from "../form/TextArea.svelte";
    
    import { formFields } from "../../store/pageData";

    export let id = 'primary_information';
    export let title = 'Primary Information';
</script>

<Card {id} {title}>
    <InputText
        id="{$formFields.REQUESTER_EMAIL}"
        label="Requester's Outsideinc email address"
    />
    <InputText
        id="{$formFields.REQUESTER_FIRST_NAME}"
        label="Customer first name"
    />
    <InputText
        id="{$formFields.REQUESTER_LAST_NAME}"
        label="Customer last name"
    />
    <InputText
        id="{$formFields.PURCHASING_CONTACT_EMAIL}"
        label="Customer email"
    />
    <TextArea
        id="{$formFields.VENDOR_COMMENTS}"
        label="Additional membership info"
        optional
    />

</Card>
