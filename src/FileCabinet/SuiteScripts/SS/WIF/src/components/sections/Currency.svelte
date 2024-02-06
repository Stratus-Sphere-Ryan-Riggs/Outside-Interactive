<script>
    import Card from "../shared/Card.svelte";
    import Dropdown from "../shared/Dropdown.svelte";
    import InputCheckbox from "../shared/InputCheckbox.svelte";
    import InputText from "../shared/InputText.svelte";
    import { formFields, wifStore } from "../../store/store";
    import { createEventDispatcher } from "svelte";
    // const dispatch = createEventDispatcher();

    export let id = '';
    export let value = '';
    export let visible = false;

    let currencies = [
        { text: '-- Select Currency --', value: '' },
        { text: 'United States Dollar', value: 'usd' },
        { text: 'Argentine Peso', value: 'ars' },
        { text: 'Australian Dollar', value: 'aud' },
        { text: 'Canada Dollar', value: 'cad' },
        { text: 'Chilean Peso', value: 'clp' },
        { text: 'Euro', value: 'eur' },
        { text: 'British Pound', value: 'gbp' },
        { text: 'Hong Kong Dollar', value: 'hkd' },
        { text: 'Mexican Peso', value: 'mxn' },
        { text: 'New Zealand Dollar', value: 'nzd' },
        { text: 'Singapore Dollar', value: 'sgd' },
        { text: 'Other', value: 'other' },
    ];

    // let isUSD = false;
    const changeCurrency = (e) => {
        console.log('changeCurrency', e.detail);
        wifStore.update(o => {
            o['currency'] = e.detail.value;
            return o;
        });
        console.log('changeCurrency wifStore', $wifStore);
    };

    const changeLocatedInUS = (e) => {
        console.log('changeLocatedInUS', e.detail);
        // value = e.detail.value;
        // dispatch('changelocation', { value });
        wifStore.update(o => {
            o['bankInUS'] = e.detail.value;
            return o;
        });
        console.log('changeLocatedInUS wifStore', $wifStore);
    };

    const changeHasFPSID = (e) => {
        console.log('changeHasFPSID', e.detail);
        wifStore.update(o => {
            o['isFPS'] = e.detail.value;
            return o;
        });
        console.log('changeHasFPSID wifStore', $wifStore);
    };

    export const validate = () => {
        console.log('Currency.Validate');
        let currency = $wifStore['currency']
        if (!!currency === false) {
            return false;
        }

        // if (currency === 'hkd' && !!$wifStore[''])
    };

    $: isUSD = $wifStore['currency'] === 'usd';
    $: isHKD = $wifStore['currency'] === 'hkd';
    $: isFPS = isHKD === true && $wifStore['isFPS'] === true;
    $: isNotFPS = !isFPS;
</script>

<Card title="Select Currency" subtitle="1 of 4" bind:visible={visible} {id}>
    <Dropdown id="currency"
        items={currencies}
        label="Select Currency"
        bind:value={value}
        on:change={changeCurrency}
    />
    <InputCheckbox
        id="located_in_us"
        label="Is your bank located in the United States?"
        bind:visible={isUSD}
        on:change={changeLocatedInUS}
    />
    <InputCheckbox
        id="custrecord_vr_hkdfpdid"
        label="Do you have an FPS ID?"
        bind:visible={isHKD}
        on:change={changeHasFPSID}
    />
    <InputText
        id="custrecord_vr_fpsidisyes"
        label="Email, FPS ID, or Mobile Number Linked To Recipient's Account"
        bind:optional={isNotFPS}
        bind:visible={isFPS}
    />
</Card>

<style></style>