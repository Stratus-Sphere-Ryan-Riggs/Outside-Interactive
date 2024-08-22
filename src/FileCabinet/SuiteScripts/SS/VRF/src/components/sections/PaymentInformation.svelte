<script>
    import { countryStates, currencies, formFields, formValues } from "../../store/pageData";
    import { onMount } from "svelte";

    import Card from "../form/Card.svelte";
    import Dropdown from "../form/Dropdown.svelte";
    import InputText from "../form/InputText.svelte";
    import RadioGroup from "../form/RadioGroup.svelte";
    import Row from "../form/Row.svelte";
    import TextArea from "../form/TextArea.svelte";

    export let id = 'banking';
    export let title = 'Banking';
</script>

<Card {id} {title}>

    <InputText
        id="{$formFields.ACCOUNT_NUMBER}"
        label="Account Number"
        cls="w160"
        bind:value={$formValues[$formFields.ACCOUNT_NUMBER]}
    />
    <InputText
        id="{$formFields.BANK_ROUTING_NUMBER}"
        label="ACH Routing Number"
        cls="w160"
        bind:value={$formValues[$formFields.BANK_ROUTING_NUMBER]}
    />
    <!-- bind:visible={isUSD}
    bind:optional={notUSD} -->

    <TextArea
        id="{$formFields.MISC_BANKING_DETAILS}"
        label="Banking Comments - Please include any additional information."
        bind:value={$formValues[$formFields.MISC_BANKING_DETAILS]}
        optional
    />

</Card>

<style></style>