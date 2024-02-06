<script>
    import Card from "../shared/Card.svelte";
    import InputText from "../shared/InputText.svelte";

    export let id = '';
    export let visible = false;
</script>

<Card title="Recipient Address" subtitle="3 of 4" bind:visible={visible} {id}>
    <InputText
        id="custrecord_vr_intl_bankcity"
        label="City"
        />
    <InputText
        id="custrecord_vr_intl_bankstreetaddress"
        label="Recipient Address"
        />
    <InputText
        id="custrecord_vr_intl_postalcode"
        label="Post Code"
        />
    <InputText
        id="custrecord_vr_remittanceemail"
        label="Email For Remittance"
        />
    <InputText
        id="custrecord_vr_differentname"
        label="Name (if different from account holder name)"
        optional
        />
</Card>

<style></style>