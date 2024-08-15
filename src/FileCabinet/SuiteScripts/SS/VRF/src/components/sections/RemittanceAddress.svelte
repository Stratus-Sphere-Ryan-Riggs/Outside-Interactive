<script>
    import { callZipAPI } from "../../store/zip";
    import { countryStates, formFields, formValues } from "../../store/pageData";
    import { onMount } from "svelte";

    import Section from "../form/Section.svelte";
    import InputCheckbox from "../form/InputCheckbox.svelte";
    import InputText from "../form/InputText.svelte";
    import Dropdown from "../form/Dropdown.svelte";
    import Row from "../form/Row.svelte";

    export let id = 'remit_address';
    export let title = 'Remittance Address';

    let addressCountries = [
        { text: '', value: '' }
    ];
    let addressStates = [
        { text: '', value: '' }
    ];
    let statesOptional = true;
    let statesVisible = false;
    let sameAsLegalCls = [];
    let sameAsLegal = false;

    onMount(() => {
        let countries = [ ...new Set($countryStates.map(c => `${c.countryname}|${c.countryid}`)) ];
        addressCountries = addressCountries.concat(
            countries.map(c => {
                return {
                    text: c.substring(0, c.indexOf('|')),
                    value: c.substring(c.indexOf('|') + 1)
                };
            })
        );
    });

    const onChangeCountry = (e) => {
        let states = $countryStates.filter(c =>
            c.countryname === e.detail.value &&
            !!c.statefullname === true
        );
        statesOptional = states.length <= 0 || sameAsLegal === true;
        statesVisible = states.length > 0;

        addressStates = [
            { text: '', value: '' }
        ].concat(states.map(s => {
            return {
                text: s.statefullname,
                value: s.stateshortname
            };
        }));

        formValues.update(o => {
            o[$formFields.REMIT_TO_COUNTRY] = '';
            o[$formFields.REMIT_TO_STATE] = '';
            o[$formFields.REMIT_TO_ADDR_1] = '';
            o[$formFields.REMIT_TO_ADDR_2] = '';
            o[$formFields.REMIT_TO_ZIP] = '';
            o[$formFields.REMIT_TO_CITY] = '';
            o[$formFields.BANK_COUNTRY] = e.detail.value;
            o[$formFields.BANK_CURRENCY] = e.detail.value === 'United States' ? 'USD' : '';
            return o;
        });
    }
    onChangeCountry({
        detail: {
            value: $formValues[$formFields.REMIT_TO_COUNTRY]
        }
    });

    const toggleSameAsLegal = (e) => {
        // console.log(`id = ${e.detail.id}, checked = ${e.detail.value}`);
        sameAsLegalCls = [];
        sameAsLegal = false;
        if (e.detail.value === true) {
            sameAsLegalCls.push('hidden');
            sameAsLegal = true;
        }

        onChangeCountry({
            detail: {
                value: $formValues[$formFields.COUNTRY]
            }
        });
        formValues.update(o => {
            o[$formFields.REMIT_TO_COUNTRY] = o[$formFields.COUNTRY];
            o[$formFields.REMIT_TO_STATE] = o[$formFields.STATE];
            o[$formFields.REMIT_TO_ADDR_1] = o[$formFields.ADDRESS_1];
            o[$formFields.REMIT_TO_ADDR_2] = o[$formFields.ADDRESS_2];
            o[$formFields.REMIT_TO_ZIP] = o[$formFields.ZIP_CODE];
            o[$formFields.REMIT_TO_CITY] = o[$formFields.CITY];
            return o;
        });
    };
    toggleSameAsLegal({
        detail: {
            value: $formValues[$formFields.SAME_AS_LEGAL_ADDRESS] === true
        }
    });

    const onChangeZip = (e) => {
        let zip = e.detail.value;
        console.log(`onChangeZip`, e.detail.value);
        let selectedCountry = $countryStates.find(s =>
            s.countryname === document.getElementById('custrecord_vr_country')['value']
        );
        callZipAPI({
            zip,
            country: $formValues[$formFields.REMIT_TO_COUNTRY],
            targets: {
                city: $formFields.REMIT_TO_CITY,
                state: $formFields.REMIT_TO_STATE
            }
        });
    };
    
    $: remitCountry = sameAsLegal === true ? $formValues[$formFields.COUNTRY] : $formValues[$formFields.REMIT_TO_COUNTRY];
    $: remitAddress1 = sameAsLegal === true ? $formValues[$formFields.ADDRESS_1] : $formValues[$formFields.REMIT_TO_ADDR_1];
    $: remitAddress2 = sameAsLegal === true ? $formValues[$formFields.ADDRESS_2] : $formValues[$formFields.REMIT_TO_ADDR_2];
    $: remitCity = sameAsLegal === true ? $formValues[$formFields.CITY] : $formValues[$formFields.REMIT_TO_CITY];
    $: remitState = sameAsLegal === true ? $formValues[$formFields.STATE] : $formValues[$formFields.REMIT_TO_STATE];
    $: remitZip = sameAsLegal === true ? $formValues[$formFields.ZIP_CODE] : $formValues[$formFields.REMIT_TO_ZIP];
</script>

<Section id="{id}" title="{title}">
    <InputCheckbox
        id="{$formFields.SAME_AS_LEGAL_ADDRESS}"
        label="Same as legal address?"
        bind:checked={$formValues[$formFields.SAME_AS_LEGAL_ADDRESS]}
        on:change={toggleSameAsLegal}
    />
    <div id="same_as_legal" class={sameAsLegalCls.join(' ')}>
        <Dropdown
            id="{$formFields.REMIT_TO_COUNTRY}"
            label="Country"
            cls="country w400"
            bind:items={addressCountries}
            bind:optional={sameAsLegal}
            bind:value={$formValues[$formFields.REMIT_TO_COUNTRY]}
            on:change="{onChangeCountry}"
        />
        <InputText
            id="{$formFields.REMIT_TO_ADDR_1}"
            label="Address (Line 1)"
            bind:optional={sameAsLegal}
            bind:value={$formValues[$formFields.REMIT_TO_ADDR_1]}
        />
        <InputText
            id="{$formFields.REMIT_TO_ADDR_2}"
            label="Address (Line 2)"
            optional
            bind:value={$formValues[$formFields.REMIT_TO_ADDR_2]}
        />
        
            <InputText
                id="{$formFields.REMIT_TO_ZIP}"
                label="Zip Code"
                cls="zip w80"
                bind:optional={sameAsLegal}
                bind:value={$formValues[$formFields.REMIT_TO_ZIP]}
                on:change={onChangeZip}
            />
            <InputText
                id="{$formFields.REMIT_TO_CITY}"
                label="City"
                cls="w240"
                bind:optional={sameAsLegal}
                bind:value={$formValues[$formFields.REMIT_TO_CITY]}
            />
        
        <Dropdown
            id="{$formFields.REMIT_TO_STATE}"
            label="State"
            cls="w240"
            bind:items={addressStates}
            bind:optional={statesOptional}
            bind:visible={statesVisible}
            bind:value={$formValues[$formFields.REMIT_TO_STATE]}
        />
    </div>
</Section>

<style>
    #same_as_legal {
        display: flex;
        flex-direction: column;
        gap: 28px;
    }
</style>
