<script>
    import { countryStates, currencies, formFields, formValues } from "../../store/pageData";
    import { onMount } from "svelte";

    import Blurb from "../form/Blurb.svelte";
    import Card from "../form/Card.svelte";
    import Dropdown from "../form/Dropdown.svelte";
    import InputCheckbox from "../form/InputCheckbox.svelte";
    import InputText from "../form/InputText.svelte";
    import RadioGroup from "../form/RadioGroup.svelte";
    import Row from "../form/Row.svelte";

    export let id = 'banking';
    export let title = 'Banking';

    let paymentMethods = [
        { text: 'Wire', value: '1' },
        { text: 'ACH/EFT', value: '2' }
    ];
    let accountTypes = [
        { text: 'Checking', value: '1' },
        { text: 'Savings', value: '2' }
    ];

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

    let bankStates = [
        { text: '', value: '' }
    ];

    let bankCurrencies = [
        { text: '', value: '' },
    ];
    bankCurrencies = bankCurrencies.concat(
        $currencies.map(c => {
            return {
                text: c.name,
                value: c.symbol
            };
        })
    );

    // console.log(`BANKING START`, $formValues);
    const onChangeCurrency = (e) => {
        console.log(`onChangeCurrency value = ${e.detail.value}`);
        formValues.update(o => {
            o[$formFields.BANK_CURRENCY] = e.detail.value;
            return o;
        });
    };

    const onChangeCountry = (e) => {
        console.log(`BANKING onChangeCountry`, e);
        bankCountry = e.detail.value;
        bankCurrency = bankCountry === 'United States' ? 'USD' : '';
        formValues.update(o => {
            o[$formFields.BANK_COUNTRY] = bankCountry;
            o[$formFields.BANK_CURRENCY] = bankCurrency;
            return o;
        });

        isDomestic = bankCountry === 'United States';
        isInternational = !isDomestic;

        if (e.origin !== 'method') {
            paymentMethod = isDomestic === true ? '1' : '2';
            formValues.update(o => {
                o[$formFields.BANK_DETAIL_METHOD] = paymentMethod;
                return o;
            });
        }

        isUK = bankCountry === 'United Kingdom';

        let states = $countryStates.filter(c =>
            (c.countryid === bankCountry || c.countryname === bankCountry) &&
            !!c.statefullname === true
        );
        // hasStates = isInternational === true && states.length > 0;
        hasStates = states.length > 0;
        noStates = !hasStates;
        hasInternationalStates = isInternational === true && states.length > 0;

        console.log(`bankCountry = ${bankCountry}; isDomestic = ${isDomestic}; isInternational = ${isInternational}; isUK = ${isUK}; isNotUK = ${isNotUK}; hasStates = ${hasStates}; noStates = ${noStates}`);

        bankStates = [
            { text: '', value: '' }
        ].concat(states.map(s => {
            return {
                text: s.statefullname,
                value: s.stateshortname
            };
        }));
    }

    const onChangePaymentMethod = (e) => {
        console.log(`onChangePaymentMethod value = ${e.detail.value}`);
        paymentMethod = e.detail.value;
        formValues.update(o => {
            o[$formFields.BANK_DETAIL_METHOD] = e.detail.value;
            return o;
        });
        console.log(`onChangePaymentMethod updated BANK_DETAIL_METHOD = ${$formValues[$formFields.BANK_DETAIL_METHOD]}`);

        onChangeCountry({
            origin: 'method',
            detail: {
                value: e.detail.value === '1' ? "United States" : ""
            }
        });
        onChangeCurrency({
            detail: {
                value: e.detail.value === '1' ? "USD" : ""
            }
        });
    };

    const onChangeTypeOfAccount = (e) => {
        // console.log(`onChangeTypeOfAccount value = ${e.detail.value}`);
        formValues.update(o => {
            o[$formFields.TYPE_OF_ACCOUNT] = e.detail.value;
            return o;
        });
    };

    $: bankCountry = '';
    $: bankCurrency = '';
    $: isDomestic = bankCountry === 'United States';
    $: isInternational = !isDomestic;
    $: paymentMethod = isDomestic === true ? '1' : '2';
    $: isUK = bankCountry === 'United Kingdom';
    $: isNotUK = !isUK;
    $: hasStates = false;
    $: noStates = !hasStates;
    $: hasInternationalStates = false;
    // $: noInternationalStates = !hasInternationalStates;
    $: typeOfAccount = $formValues[$formFields.TYPE_OF_ACCOUNT] || '1';

    onMount(() => {
        bankCountry = $formValues[$formFields.REMIT_TO_COUNTRY] || $formValues[$formFields.BANK_COUNTRY];
        bankCurrency = $formValues[$formFields.BANK_CURRENCY] ||
            (bankCountry === 'United States' ? 'USD' : '');
        isDomestic = bankCountry === 'United States';
        isInternational = !isDomestic;
        paymentMethod = isDomestic === true ? '1' : '2';
        isUK = bankCountry === 'United Kingdom';
        isNotUK = !isUK;
        hasStates = false;
        noStates = !hasStates;
        hasInternationalStates = false;
        // $: noInternationalStates = !hasInternationalStates;
        typeOfAccount = $formValues[$formFields.TYPE_OF_ACCOUNT] || '1';
        onChangeCountry({
            detail: {
                value: bankCountry
            }
        });
        /* onChangeBankingMethod({
            detail: {
                value: $formValues[$formFields.BANK_DETAIL_METHOD]
            }
        }); */
        /* if (!$formValues[$formFields.BANK_DETAIL_METHOD]) {
            formValues.update(o => {
                o[$formFields.BANK_DETAIL_METHOD] = '1';
                o[$formFields.BANK_COUNTRY] = 'United States';
                o[$formFields.BANK_CURRENCY] = 'USD';
                return o;
            });
        }

        if (!$formValues[$formFields.TYPE_OF_ACCOUNT]) {
            formValues.update(o => {
                o[$formFields.TYPE_OF_ACCOUNT] = '1';
                return o;
            });
        } */
    });
</script>

<Card {id} {title}>
    <Dropdown
        id="{$formFields.CURRENCY}"
        label="Currency"
        cls="currency w160"
        bind:items={bankCurrencies}
        bind:value={bankCurrency}
        on:change={onChangeCurrency}
    />
    <RadioGroup
        id="{$formFields.PAYMENT_TYPE}"
        label="Payment Method"
        bind:items={paymentMethods}
        bind:value={paymentMethod}
        on:change={onChangePaymentMethod}
    />
    <Dropdown
        id="{$formFields.BANK_COUNTRY}"
        label="Bank Country"
        cls="country w400"
        bind:items={bankCountries}
        bind:value={bankCountry}
        on:change={onChangeCountry}
    />
    
    <Blurb id="blurb_legal_disclaimer">
        <span class="title">Legal Disclaimer</span>
        <span class="blurb">I (we) hereby authorize Outside Interactive Inc. or its affiliated entities (THE COMPANY) to initiate entries to my (our) checking/savings accoutns at the financial institution listed below (THE FINANCIAL INSTITUTION), and, if nevessary, initiate adjustments for any transations credited/debited in error. This authority will remain in effect until THE COMPANY is notified by me (us) in writing to cancel it in such time as to afford THE COMPANY and THE FINANCIAL INSTITUTION a reasonable opportunity to act on it.</span>
    </Blurb>

    <InputCheckbox
        id="{$formFields.LEGAL_DISCLAIMER}"
        label="Do you agree?"
        bind:checked={$formValues[$formFields.LEGAL_DISCLAIMER]}
    />

    <InputCheckbox
        id="{$formFields.FPS_ID}"
        label="Do you have an FPS ID?"
        checked={false}
        on:change={onChangeTypeOfAccount}
    />

    <InputText
        id="{$formFields.FPS_ID_IS_YES}"
        label="Email, FPS ID, or Mobile Number Linked to Recipient's Account"
        bind:value={$formValues[$formFields.FPS_ID_IS_YES]}
    />

    <InputText
        id="{$formFields.ACCOUNT_HOLDER_FULL_NAME}"
        label="Full Name of Account Holder"
        bind:value={$formValues[$formFields.ACCOUNT_HOLDER_FULL_NAME]}
    />

    <InputText
        id="{$formFields.IBAN}"
        label="IBAN"
        cls="w80"
        optional
        bind:visible={isInternational}
        bind:value={$formValues[$formFields.IBAN]}
    />

    <InputText
        id="{$formFields.SWIFT_BIC_CODE}"
        label="SWIFT/BIC Code"
        cls="w160"
        bind:value={$formValues[$formFields.SWIFT_BIC_CODE]}
    />

    <InputText
        id="{$formFields.BANK_SORT_CODE}"
        label="UK Sort Code"
        cls="w120"
        bind:optional={isNotUK}
        bind:visible={isUK}
        bind:value={$formValues[$formFields.BANK_SORT_CODE]}
    />
    
    <Row>
        <InputText
            id="{$formFields.BANK_ROUTING_NUMBER}"
            label="ACH Routing Number"
            cls="w160"
            bind:value={$formValues[$formFields.BANK_ROUTING_NUMBER]}
        />
        <InputText
            id="{$formFields.ACCOUNT_NUMBER}"
            label="Account Number"
            cls="w160"
            bind:value={$formValues[$formFields.ACCOUNT_NUMBER]}
        />
    </Row>

        <InputText
            id="{$formFields.BANK_CITY}"
            label="City"
            cls="w240"
            bind:visible={isInternational}
            bind:value={$formValues[$formFields.BANK_CITY]}
        />
        <InputText
            id="{$formFields.BANK_STREET}"
            label="Recipient Address"
            bind:visible={isInternational}
            bind:value={$formValues[$formFields.BANK_STREET]}
        />

        <InputText
            id="{$formFields.BANK_ZIP}"
            label="Postal Code"
            wr="bank_intl"
            cls="w80"
            bind:visible={isInternational}
            bind:value={$formValues[$formFields.BANK_ZIP]}
        />

    <InputText
        id="{$formFields.REMITTANCE_EMAIL}"
        label="Email for Remittance"
        bind:value={$formValues[$formFields.REMITTANCE_EMAIL]}
    />

    <InputText
        id="{$formFields.DIFFERENT_NAME}"
        label="Name (if different from account holder name)"
        optional
        bind:value={$formValues[$formFields.DIFFERENT_NAME]}
    />

    <Row>
        <InputText
            id="{$formFields.RECEIVING_ACCT_NUMBER}"
            label="Receiving Account Number"
            wr="bank_intl"
            cls="w120"
            bind:value={$formValues[$formFields.RECEIVING_ACCT_NUMBER]}
        />
        <InputText
            id="{$formFields.BANK_ROUTING_NUMBER}"
            label="Bank Routing Number"
            wr="bank_intl"
            cls="w120"
            bind:optional={isInternational}
            bind:value={$formValues[$formFields.BANK_ROUTING_NUMBER]}
        />
    </Row>

    <Row
        bind:visible={isInternational}
    >
        <InputText
            id="{$formFields.FINANCIAL_INSTITUTION}"
            label="Financial Institution Number (3 digits)"
            wr="bank_intl"
            cls="w80"
            optional
            bind:visible={isInternational}
            bind:value={$formValues[$formFields.FINANCIAL_INSTITUTION]}
        />
        <InputText
            id="{$formFields.BRANCH_TRANSIT_NUMBER}"
            label="Branch Transit Number (5 digits)"
            wr="bank_intl"
            cls="w80"
            optional
            bind:visible={isInternational}
            bind:value={$formValues[$formFields.BRANCH_TRANSIT_NUMBER]}
        />
    </Row>

    <Row
        bind:visible={isInternational}
    >
        <InputText
            id="{$formFields.BSB_CODE}"
            label="BSB Code"
            wr="bank_intl"
            cls="w80"
            optional
            bind:visible={isInternational}
            bind:value={$formValues[$formFields.BSB_CODE]}
        />
    </Row>

</Card>
