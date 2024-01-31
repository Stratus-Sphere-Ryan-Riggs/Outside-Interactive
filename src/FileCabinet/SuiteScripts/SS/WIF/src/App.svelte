<script>
    import Card from "./components/shared/Card.svelte";
    import Dropdown from "./components/shared/Dropdown.svelte";

    let currencies = [
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
        { text: 'other', value: 'other' },
    ];
</script>

<main>
    <Card title="Select Currency">
        <Dropdown id="currency"
            items={currencies}
        />
    </Card>
</main>

<style>
</style>