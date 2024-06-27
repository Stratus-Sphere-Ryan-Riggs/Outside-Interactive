<script>
    import { countryStates, currencies, formFields, formValues } from "../../store/pageData";
    import Blurb from "../form/Blurb.svelte";
    import Card from "../form/Card.svelte";
    import InputCheckbox from "../form/InputCheckbox.svelte";

    export let id = 'disclaimer';
    export let title = 'Legal Disclaimer';
</script>

<Card {id} {title}>
    <Blurb id="blurb_legal_disclaimer">
        <span class="title">Legal Disclaimer</span>
        <span class="blurb">I (we) hereby authorize Outside Interactive Inc. or its affiliated entities (THE COMPANY) to initiate entries to my (our) checking/savings accounts at the financial institution listed below (THE FINANCIAL INSTITUTION), and, if necessary, initiate adjustments for any transactions credited/debited in error. This authority will remain in effect until THE COMPANY is notified by me (us) in writing to cancel it in such time as to afford THE COMPANY and THE FINANCIAL INSTITUTION a reasonable opportunity to act on it.</span>
    </Blurb>
    
    <InputCheckbox
        id="{$formFields.LEGAL_DISCLAIMER}"
        label="Do you agree?"
        required={true}
        bind:checked={$formValues[$formFields.LEGAL_DISCLAIMER]}
    />
</Card>

<Card {id} {title}>
    <Blurb id="blurb_legal_disclaimer">
        <span class="title">Legal Disclaimer</span>
        <span class="blurb">I (we) hereby authorize Outside Interactive Inc. or its affiliated entities (THE COMPANY) to initiate entries to my (our) checking/savings accounts at the financial institution listed below (THE FINANCIAL INSTITUTION), and, if necessary, initiate adjustments for any transactions credited/debited in error. This authority will remain in effect until THE COMPANY is notified by me (us) in writing to cancel it in such time as to afford THE COMPANY and THE FINANCIAL INSTITUTION a reasonable opportunity to act on it.</span>
    </Blurb>
    
    <InputCheckbox
        id="{$formFields.LEGAL_DISCLAIMER}"
        label="Do you agree?"
        required={true}
        bind:checked={$formValues[$formFields.LEGAL_DISCLAIMER]}
    />
</Card>

<Card {id} {title}>
    <Blurb id="blurb_legal_disclaimer">
        <span class="title">Legal Disclaimer</span>
        <span class="blurb">I (we) hereby authorize Outside Interactive Inc. or its affiliated entities (THE COMPANY) to initiate entries to my (our) checking/savings accounts at the financial institution listed below (THE FINANCIAL INSTITUTION), and, if necessary, initiate adjustments for any transactions credited/debited in error. This authority will remain in effect until THE COMPANY is notified by me (us) in writing to cancel it in such time as to afford THE COMPANY and THE FINANCIAL INSTITUTION a reasonable opportunity to act on it.</span>
    </Blurb>

    <InputCheckbox
        id="{$formFields.LEGAL_DISCLAIMER}"
        label="Do you agree?"
        required={true}
        bind:checked={$formValues[$formFields.LEGAL_DISCLAIMER]}
    />

</Card>
<style></style>