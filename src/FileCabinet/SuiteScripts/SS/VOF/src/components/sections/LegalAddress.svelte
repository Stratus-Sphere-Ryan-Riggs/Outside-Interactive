<script>
    import { callZipAPI } from "../../store/zip";
    import { countryStates, formFields, formValues } from "../../store/pageData";
    import { createEventDispatcher } from "svelte";
    import { onMount } from "svelte";
    
    import Card from "../form/Card.svelte";
    import Dropdown from "../form/Dropdown.svelte";
    import InputText from "../form/InputText.svelte";
    import Row from "../form/Row.svelte";

    export let id = 'legal_address';
    export let title = 'Legal Address';

    const dispatch = createEventDispatcher();

    let addressCountries = [
        { text: '', value: '' }
    ];
    let addressStates = [
        { text: '', value: '' }
    ];
    let statesOptional = true;
    let statesVisible = false;
    let countries = [ ...new Set($countryStates.map(c => `${c.countryname}|${c.countryid}`)) ];

    addressCountries = addressCountries.concat(
        countries.map(c => {
            return {
                text: c.substring(0, c.indexOf('|')),
                value: c.substring(c.indexOf('|') + 1)
            };
        })
    );

    let stateField;
    const onChangeCountry = (e) => {
        let states = $countryStates.filter(c =>
            c.countryname === e.detail.value &&
            !!c.statefullname === true
        );
        statesOptional = states.length <= 0;
        statesVisible = states.length > 0;

        addressStates = [
            { text: '', value: '' }
        ].concat(states.map(s => {
            return {
                text: s.statefullname,
                value: s.stateshortname
            };
        }));

        dispatch('change-country', {
            value: e.detail.value
        });
        formValues.update(o => {
            o[$formFields.ADDRESS_1] = '';
            o[$formFields.ADDRESS_2] = '';
            o[$formFields.CITY] = '';
            o[$formFields.STATE] = '';
            o[$formFields.ZIP] = '';
            return o;
        });
    }
    onChangeCountry({ detail: { value: $formValues[$formFields.COUNTRY] } });

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
    <Dropdown
        id="{$formFields.COUNTRY}"
        label="Country"
        cls="country"
        items={addressCountries}
        bind:value={$formValues[$formFields.COUNTRY]}
        on:change="{onChangeCountry}"
    />
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

    <Row>
        <InputText
            id="{$formFields.ZIP_CODE}"
            label="Zip Code"
            cls="zip w120"
            bind:value={$formValues[$formFields.ZIP_CODE]}
            on:change={onChangeZip}
        />
        <InputText
            id="{$formFields.CITY}"
            label="City"
            bind:value={$formValues[$formFields.CITY]}
        />
    </Row>

    <InputText
        id="{$formFields.STATE}"
        label="State/Province"
        bind:value={$formValues[$formFields.STATE]}
    />
</Card>
