<script>
    import { countryStates, currencies, formFields, formValues, refundReasons, stateList } from "../../store/pageData";
    import { onMount } from "svelte";

    import Card from "../form/Card.svelte";
    import Dropdown from "../form/Dropdown.svelte";
    import InputText from "../form/InputText.svelte";
    import Row from "../form/Row.svelte";
    import TextArea from "../form/TextArea.svelte";
    import InputDate from "../form/InputDate.svelte";
    import InputFile from "../form/InputFile.svelte";

    export let id = 'refund_details';
    export let title = 'Refund Details';

    console.log('formValues', $formValues);
    let bankCurrencies = [
        { text: '', value: '' },
        // { text: 'USD', value: 'USD' },
        // { text: 'CAD', value: 'CAD' },
        // { text: 'Other', value: 'Other' }
    ];
    bankCurrencies = bankCurrencies.concat(
        $currencies.map(c => {
            return {
                text: c.name,
                value: c.symbol
            };
        })
    );

    const onChangeCurrency = (e) => {
        console.log(`onChangeCurrency value = ${e.detail.value}`);
        formValues.update(o => {
            o[$formFields.CURRENCY] = e.detail.value;
            return o;
        });

        // updateBankPaymentMethod();
        // logVariables();
    };

    // $: bankCurrency = $formValues[$formFields.CURRENCY];
    let bankCurrency = '';

    console.log('refundReasons', $refundReasons);
    let reasonsForRefund = [
        { text: '', value: '' },
        ...$refundReasons.map(r => {
            return {
                text: r.name,
                value: r.id
            };
        })
    ];

    const onFileChange = (e) => {
        let file = e.detail.file;
        console.log(`InputFile >>> selected file = ${file.name}`);

        let formData = new FormData();
        formData.append("file", file);
        fetch(
            `${window['backendURL']}&action=upload`,
            {
                method: 'POST',
                body: formData
            }
        ).then(data => data.json())
        .then(data => {
            console.log(`file upload = ${file.name}; id = ${e.detail.id}`, data);
            if (data.status === true) {
                console.log(`   >>> id = ${data.data.id}`);
                formValues.update(o => {
                    o[e.detail.id] = data.data.id;
                    return o;
                });
                console.log($formValues);
            }
            else {
                alert(`An error occured during file upload: ${data.message}`);
            }
        });
    };

    let countries = [ ...new Set($countryStates.map(c => `${c.countryname}|${c.countryid}`)) ];
    let bankCountries = [
        { text: '', value: '' }
    ];
    bankCountries = bankCountries.concat(
        countries.map(c => {
            return {
                text: c.substring(0, c.indexOf('|')),
                value: c.substring(c.indexOf('|') + 1)
            };
        })
    );

    const onChangeCountry = (e) => {
        console.log(`PaymentInformation onChangeCountry "${e.detail.value.toLowerCase()}"`, e);
        bankCountry = e.detail.value;

        formValues.update(o => {
            o[$formFields.COUNTRY] = e.detail.value;
            return o;
        });
        console.log(`RefundDetails formValues`, $formValues);

        let states = $countryStates.filter(c =>
            c.countryname === e.detail.value &&
            !!c.statefullname === true
        );
        console.log('states', states);

        let addressStates = [
            { text: '', value: '' }
        ].concat(states.map(s => {
            return {
                text: s.statefullname,
                value: s.stateshortname
            };
        }));
        stateList.update(d => { d = addressStates; return d; });
    }

    $: bankCountry = '';
</script>

<Card {id} {title}>

    <Row>
        <InputText
            id="{$formFields.REFUND_AMOUNT}"
            label="Amount being refunded"
            cls="w160"
            bind:value={$formValues[$formFields.REFUND_AMOUNT]}
        />
        <!-- bind:value={bankCurrency} -->
    </Row>

    <Row>
        <InputDate
            id="{$formFields.REFUND_PERIOD_START_DATE}"
            label="Refund period start date"
            bind:value={$formValues[$formFields.REFUND_PERIOD_START_DATE]}
        />
        <InputDate
            id="{$formFields.REFUND_PERIOD_END_DATE}"
            label="Refund period start date"
            bind:value={$formValues[$formFields.REFUND_PERIOD_END_DATE]}
        />
    </Row>

    <Dropdown
        id="{$formFields.REFUND_REASON}"
        label="Reason for refund"
        bind:items={reasonsForRefund}
        bind:value={$formValues[$formFields.REFUND_REASON]}
    />
    <InputFile
        id="{$formFields.ORIGINAL_RECEIPT_DOCUMENT}"
        label="Attach original receipt, including tax"
        on:change={onFileChange}
    />
    <Dropdown
        id="{$formFields.COUNTRY}"
        label="Country"
        cls="country w400"
        bind:items={bankCountries}
        on:change={onChangeCountry}
    />
    <!-- bind:value={bankCountry} -->
    <Dropdown
        id="{$formFields.CURRENCY}"
        label="Currency"
        cls="currency w160"
        bind:items={bankCurrencies}
        on:change={onChangeCurrency}
    />

</Card>

<style></style>