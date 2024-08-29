<script>
    import { countryStates, formFields, formValues } from "../../store/pageData";
    import { callZipAPI } from "../../store/zip";

    import Card from "../form/Card.svelte";
    import Dropdown from "../form/Dropdown.svelte";
    import InputText from "../form/InputText.svelte";
    import Row from "../form/Row.svelte";
    import TextArea from "../form/TextArea.svelte";

    export let id = 'banking';
    export let title = 'Banking';

    let addressStates = [];

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

    <Row>

        <InputText
            id="{$formFields.FINANCIAL_INSTITUTION}"
            label="Financial Institution Number (3 digits)"
            wr="bank_intl"
            cls="w80"
            bind:value={$formValues[$formFields.FINANCIAL_INSTITUTION]}
        />
        <!-- bind:optional={notCAD}
        bind:visible={isCAD} -->

        <InputText
            id="{$formFields.BRANCH_TRANSIT_NUMBER}"
            label="Transit Number (5 digits)"
            wr="bank_intl"
            cls="w80"
            bind:value={$formValues[$formFields.BRANCH_TRANSIT_NUMBER]}
        />
        <!-- bind:optional={notCAD}
        bind:visible={isCAD} -->
        
    </Row>

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
        on:change={onChangeZip}
        bind:value={$formValues[$formFields.ZIP_CODE]}
    />

    <Row>
        
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
        />

    </Row>

    <TextArea
        id="{$formFields.MISC_BANKING_DETAILS}"
        label="Banking Comments"
        optional
        bind:value={$formValues[$formFields.MISC_BANKING_DETAILS]}
    />

</Card>

<style></style>