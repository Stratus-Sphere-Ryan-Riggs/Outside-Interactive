<script>
    import Card from "../shared/Card.svelte";
    import InputCheckbox from "../shared/InputCheckbox.svelte";
    import { wifStore } from "../../store/store";

    export let id = '';
    export let visible = false;

    const onChangeAgree = (e) => {
        console.log(e.detail);
        wifStore.update(o => {
            o['agree'] = e.detail.value;
            return o;
        });
        console.log('onChangeAgree wifStore', $wifStore);
    };
</script>

<Card title="Legal Disclaimer" subtitle="4 of 4" bind:visible={visible} {id}>
    <span>I (we) hereby authorize Outside Interactive Inc (the Company) to initiate entries to my (our) checking/savings...</span>
    <InputCheckbox
        id="custrecord_vr_legaldisclaimercheckbox"
        label="Do you agree?"
        visible
        on:change={onChangeAgree}
    />
</Card>


<style></style>