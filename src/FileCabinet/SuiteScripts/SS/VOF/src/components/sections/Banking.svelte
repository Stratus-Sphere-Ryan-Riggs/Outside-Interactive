<script>
    import { countryStates, currencies, formFields, formValues } from "../../store/pageData";
    import { onMount } from "svelte";

    import Section from "../form/Section.svelte";
    import InputText from "../form/InputText.svelte";
    import Dropdown from "../form/Dropdown.svelte";
    import RadioGroup from "../form/RadioGroup.svelte";
    import Row from "../form/Row.svelte";

    export let id = 'banking';
    export let title = 'Banking';

    let bankingMethods = [
        { text: 'Domestic (United States)', value: '1' },
        { text: 'International', value: '2' }
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
            bankingMethod = isDomestic === true ? '1' : '2';
            formValues.update(o => {
                o[$formFields.BANK_DETAIL_METHOD] = bankingMethod;
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

    const onChangeBankingMethod = (e) => {
        console.log(`onChangeBankingMethod value = ${e.detail.value}`);
        bankingMethod = e.detail.value;
        formValues.update(o => {
            o[$formFields.BANK_DETAIL_METHOD] = e.detail.value;
            return o;
        });
        console.log(`onChangeBankingMethod updated BANK_DETAIL_METHOD = ${$formValues[$formFields.BANK_DETAIL_METHOD]}`);

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
    $: bankingMethod = isDomestic === true ? '1' : '2';
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
        bankingMethod = isDomestic === true ? '1' : '2';
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

<Section id="{id}" title="{title}">
    <RadioGroup
        id="{$formFields.BANK_DETAIL_METHOD}"
        label="Banking Method (Select one)"
        bind:items={bankingMethods}
        bind:value={bankingMethod}
        on:change={onChangeBankingMethod}
    />
    <Dropdown
        id="{$formFields.BANK_COUNTRY}"
        label="Country"
        cls="country w400"
        bind:items={bankCountries}
        bind:value={bankCountry}
        on:change={onChangeCountry}
    />
    <Dropdown
        id="{$formFields.BANK_CURRENCY}"
        label="Currency"
        cls="currency w160"
        bind:items={bankCurrencies}
        bind:value={bankCurrency}
        on:change={onChangeCurrency}
    />
    <InputText
        id="{$formFields.RECEIVING_BANK_NAME}"
        label="Receiving Bank Name"
        bind:value={$formValues[$formFields.RECEIVING_BANK_NAME]}
    />
    <InputText
        id="{$formFields.BANK_STREET}"
        label="Receiving Bank Street Address"
        wr="bank_intl"
        optional
        bind:visible={isInternational}
        bind:value={$formValues[$formFields.BANK_STREET]}
    />

    <Row
        bind:visible={isInternational}
    >
        <InputText
            id="{$formFields.BANK_CITY}"
            label="Receiving Bank City"
            wr="bank_intl"
            cls="w240"
            optional
            bind:visible={isInternational}
            bind:value={$formValues[$formFields.BANK_CITY]}
        />
        <InputText
            id="{$formFields.BANK_ZIP}"
            label="Postal Code"
            wr="bank_intl"
            cls="w80"
            optional
            bind:visible={isInternational}
            bind:value={$formValues[$formFields.BANK_ZIP]}
        />
    </Row>

    <Dropdown
        id="{$formFields.BANK_STATE}"
        label="Receiving State/Province"
        wr="bank_intl"
        cls="w240"
        bind:items={bankStates}
        optional
        bind:visible={hasStates}
        bind:value={$formValues[$formFields.BANK_STATE]}
    />

    <Row>
        <RadioGroup
            id="{$formFields.TYPE_OF_ACCOUNT}"
            label="Type of Account (Select one)"
            bind:items={accountTypes}
            bind:value={typeOfAccount}
            on:change={onChangeTypeOfAccount}
        />

        <InputText
            id="{$formFields.CREDITOR_SWIFT_CODE}"
            label="Credit Agent BIC / Swift Code"
            wr="bank_intl"
            cls="w80"
            optional
            bind:value={$formValues[$formFields.CREDITOR_SWIFT_CODE]}
        />
    </Row>

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
            id="{$formFields.IBAN}"
            label="IBAN"
            wr="bank_intl"
            cls="w80"
            optional
            bind:visible={isInternational}
            bind:value={$formValues[$formFields.IBAN]}
        />
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

    <InputText
        id="{$formFields.BANK_SORT_CODE}"
        label="Bank Sort Code (UK only)"
        wr="bank_intl"
        cls="w120"
        bind:optional={isNotUK}
        bind:visible={isUK}
        bind:value={$formValues[$formFields.BANK_SORT_CODE]}
    />
    <InputText
        id="{$formFields.PURPOSE_OF_PAYMENT}"
        label="Purpose of Payment"
        wr="bank_intl"
        bind:value={$formValues[$formFields.PURPOSE_OF_PAYMENT]}
    />
    <InputText
        id="{$formFields.MISC_BANKING_DETAILS}"
        label="Miscellaneous Banking Details"
        bind:value={$formValues[$formFields.MISC_BANKING_DETAILS]}
    />
</Section>
