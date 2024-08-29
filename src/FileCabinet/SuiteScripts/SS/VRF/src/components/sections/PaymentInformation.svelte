<script>
    import { countryStates, formFields, formValues, stateList } from "../../store/pageData";
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

    $: bankCountry = $formValues[$formFields.COUNTRY];
    $: bankCurrency = $formValues[$formFields.CURRENCY];
    
    $: isUS = bankCountry?.toLowerCase() === 'united states';
    $: notUS = !isUS;
    $: isUSD = isUS === true && bankCurrency?.toLowerCase() === 'usd';
    $: notUSD = !isUSD;
    $: isCA = $formValues[$formFields.COUNTRY]?.toLowerCase() === 'canada';
    $: isCAD = isCA === true && $formValues[$formFields.CURRENCY].toLowerCase() === 'cad';
    $: notCAD = !isCAD;
    $: isOther = notUSD === true && notCAD === true;
    // $: notOther = !isOther;
    $: bankingDetailLabel = isOther === true ? "International Wire Payment Information" : "Banking Comments";

    /* const onChangeCountry = (e) => {
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
        }); ****
        formValues.update(o => {
            o[$formFields.COUNTRY] = e.detail.value;
            o[$formFields.CITY] = '';
            o[$formFields.STATE] = '';
            o[$formFields.ZIP] = '';
            return o;
        });
        console.log(`PrimaryInformation formValues`, $formValues);

        isUS = e.detail.value.toLowerCase() === 'united states';
        notUS = !isUS;
    }
    onChangeCountry({ detail: { value: $formValues[$formFields.COUNTRY] } }); */
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

    <Row>
        <InputText
            id="{$formFields.FINANCIAL_INSTITUTION}"
            label="Financial Institution Number (3 digits)"
            wr="bank_intl"
            cls="w80"
            bind:value={$formValues[$formFields.FINANCIAL_INSTITUTION]}
            bind:visible={isCAD}
        />
        <InputText
            id="{$formFields.BRANCH_TRANSIT_NUMBER}"
            label="Transit Number (5 digits)"
            wr="bank_intl"
            cls="w80"
            bind:value={$formValues[$formFields.BRANCH_TRANSIT_NUMBER]}
            bind:visible={isCAD}
        />
    </Row>

    <InputText
        id="{$formFields.ADDRESSEE}"
        label="Addressee"
        bind:value={$formValues[$formFields.ADDRESSEE]}
        bind:visible={isUSD}
        bind:optional={notUSD}
    />
    <InputText
        id="{$formFields.ADDRESS_1}"
        label="Address - Line 1"
        bind:value={$formValues[$formFields.ADDRESS_1]}
        bind:visible={isUSD}
        bind:optional={notUSD}
    />
    <InputText
        id="{$formFields.ZIP_CODE}"
        label="Zip Code"
        cls="zip w120"
        on:change={onChangeZip}
        bind:value={$formValues[$formFields.ZIP_CODE]}
        bind:visible={isUSD}
        bind:optional={notUSD}
    />

    <Row bind:visible={isUSD}>
        <InputText
            id="{$formFields.CITY}"
            label="City"
            bind:value={$formValues[$formFields.CITY]}
            bind:visible={isUSD}
            bind:optional={notUSD}
        />
        <Dropdown
            id="{$formFields.STATE}"
            label="State/Province"
            bind:items={$stateList}
            bind:value={$formValues[$formFields.STATE]}
            bind:visible={isUSD}
            bind:optional={notUSD}
        />
    </Row>

    <TextArea
        id="{$formFields.MISC_BANKING_DETAILS}"
        label={bankingDetailLabel}
        optional
        bind:value={$formValues[$formFields.MISC_BANKING_DETAILS]}
    />

</Card>

<style></style>