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
    import TextArea from "../form/TextArea.svelte";

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

    const onChangeAccountType = (e) => {
        console.log(`onChangeAccountType value = ${e.detail.value}`);
        formValues.update(o => {
            o[$formFields.ACCOUNT_TYPE] = e.detail.value;
            return o;
        });
    };

    // console.log(`BANKING START`, $formValues);
    const onChangeCurrency = (e) => {
        console.log(`onChangeCurrency value = ${e.detail.value}`);
        formValues.update(o => {
            o[$formFields.CURRENCY] = e.detail.value;
            return o;
        });

        updateBankPaymentMethod();
        logVariables();
    };

    const onChangeCountry = (e) => {
        console.log(`BANKING onChangeCountry "${e.detail.value.toLowerCase()}"`, e);
        bankCountry = e.detail.value;

        switch (bankCountry.toLowerCase()) {
            case 'united states': {
                bankCurrency = 'USD';
                break;
            }
            case 'canada': {
                bankCurrency = 'CAD';
                break;
            }
            default: {
                bankCurrency = '';
                break;
            }
        }
        // bankCurrency = bankCountry === 'United States' ? 'USD' : '';
        formValues.update(o => {
            o[$formFields.BANK_COUNTRY] = bankCountry;
            o[$formFields.CURRENCY] = bankCurrency;
            return o;
        });

        console.log(`bankCountry = ${bankCountry}; bankCurrency = ${bankCurrency}`);
        updateBankPaymentMethod();
        logVariables();

        let states = $countryStates.filter(c =>
            (c.countryid === bankCountry || c.countryname === bankCountry) &&
            !!c.statefullname === true
        );

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

    const updateBankPaymentMethod = () => {
        bankCountry = $formValues[$formFields.BANK_COUNTRY].toLowerCase();
        bankCurrency = $formValues[$formFields.CURRENCY].toLowerCase();
        isUS = bankCountry === 'united states';
        isUSD = isUS === true && bankCurrency === 'usd';
        isCA = bankCountry === 'canada';
        isCAD = isCA === true && bankCurrency === 'cad';

        console.log(`isUSD = ${isUSD}; isCAD = ${isCAD}`);

        if (isUSD === true || isCAD === true) {
            paymentMethod = '2';
        }
        else {
            paymentMethod = '1';
        }
        console.log(`updateBankPaymentMethod`, { bankCountry, bankCurrency, isUS, isUSD, isCA, isCAD, paymentMethod });

        formValues.update(o => {
            o[$formFields.PAYMENT_TYPE] = paymentMethod;
            return o;
        });
    };

    const onChangeFPS = (e) => {
        // console.log(`onChangeTypeOfAccount value = ${e.detail.value}`);
        /* formValues.update(o => {
            o[$formFields.TYPE_OF_ACCOUNT] = e.detail.value;
            return o;
        }); */
        console.log(`onChangeFPS e =>>>`, e.detail.value);
        formValues.update(o => {
            o[$formFields.FPS_ID] = e.detail.value;
            return o;
        });
    };

    $: accountType = $formValues[$formFields.ACCOUNT_TYPE];
    $: bankCountry = $formValues[$formFields.BANK_COUNTRY];
    $: bankCurrency = $formValues[$formFields.CURRENCY];
    
    $: isUS = bankCountry.toLowerCase() === 'united states';
    $: isUSD = isUS === true && bankCurrency.toLowerCase() === 'usd';
    $: notUSD = !isUSD;
    $: isCA = $formValues[$formFields.BANK_COUNTRY].toLowerCase() === 'canada';
    $: isCAD = isCA === true && $formValues[$formFields.CURRENCY].toLowerCase() === 'cad';
    $: notCAD = !isCAD;
    $: isOther = notUSD === true && notCAD === true;
    $: notOther = !isOther;
    $: updateBankPaymentMethod();

    $: isNotUS = !isUS;
    $: isHK = bankCountry.toLowerCase() === 'hong kong';
    $: notHK = !isHK;
    $: isInternational = !isUS;
    $: isUK = bankCountry.toLowerCase() === 'united kingdom';
    $: isNotUK = !isUK;
    $: isFPS = $formValues[$formFields.FPS_ID] === true;
    $: usdBankInUS = bankCurrency.toLowerCase() === 'usd' && isUS === true;
    $: usdBankNotInUS = bankCurrency.toLowerCase() === 'usd' && isUS === false;
    // $: accountNumberLabel = `${(usdBankInUS === true ? '' : 'IBAN / ')}Account Number`;
    $: accountNumberLabel = `${(isOther === true ? 'IBAN / ' : '')}Account Number`;

    $: paymentMethod = '';
    $: hasAccountNumber = (
        [ 'usd', 'aud', 'cad', 'clp', 'gbp', 'hkd' ].indexOf(bankCurrency.toLowerCase()) >= 0
    );
    $: noAccountNumber = !hasAccountNumber;
    $: hasAccountType = (
        usdBankInUS === true ||
        [ 'ars', 'aud', 'cad', 'eur' ].indexOf(bankCurrency.toLowerCase()) >= 0
    );
    $: hasIBAN = [ 'eur' ].indexOf(bankCurrency.toLowerCase()) >= 0;
    $: noIBAN = !hasIBAN;
    $: noBankName = [ 'cad', 'usd' ].indexOf(bankCurrency.toLowerCase()) >= 0;
    $: hasBankName = !noBankName;
    $: noAccountType = !hasAccountType;
    $: hasCBU = [ 'ars' ].indexOf(bankCurrency.toLowerCase()) >= 0;
    $: noCBU = !hasCBU;
    $: hasBSB = [ 'aud' ].indexOf(bankCurrency.toLowerCase()) >= 0;
    $: noBSB = !hasBSB;
    $: hasInst = [ 'cad' ].indexOf(bankCurrency.toLowerCase()) >= 0;
    $: noInst = !hasInst;
    
    $: hasStates = false;
    $: noStates = !hasStates;
    $: hasInternationalStates = false;
    // $: noInternationalStates = !hasInternationalStates;
    $: typeOfAccount = $formValues[$formFields.TYPE_OF_ACCOUNT] || '1';
    $: agree = $formValues[$formFields.LEGAL_DISCLAIMER] === false;
    $: showDetails = $formValues[$formFields.BANK_COUNTRY] !== '' &&
        $formValues[$formFields.CURRENCY] !== '' &&
        (
            isHK === true ? isFPS === true : true
        );

    const logVariables = () => {
        console.log({
            bankCountry,
            bankCurrency,
            isCA,
            isUS,
            isHK,
            notHK,
            isInternational,
            isUK,
            isNotUK,
            usdBankInUS,
            usdBankNotInUS,
            // paymentMethod,
            hasStates,
            noStates,
            hasInternationalStates,
            typeOfAccount,
            agree,
            showDetails,
            hasFPSID: $formValues[$formFields.FPS_ID]
        });
    };

    onMount(() => {
        bankCountry = $formValues[$formFields.REMIT_TO_COUNTRY] || $formValues[$formFields.BANK_COUNTRY];
        bankCurrency = $formValues[$formFields.CURRENCY] ||
            (bankCountry.toLowerCase() === 'united states' ? 'USD' : '');
        // isUS = bankCountry.toLowerCase() === 'united states';
        // isInternational = !isUS();
        // paymentMethod = isUS === true ? '1' : '2';
        // isUK = bankCountry.toLowerCase() === 'united kingdom';
        // isNotUK = !isUK;
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

        onChangeAccountType({
            detail: {
                value: '1'
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
    /*
    <div class:hidden={isHK === false}>
        <InputCheckbox
            id="{$formFields.FPS_ID}"
            label="Do you have an FPS ID?"
            checked={false}
            on:change={onChangeFPS}
        />
    </div>
        <InputText
            id="{$formFields.FPS_ID_IS_YES}"
            label="Email, FPS ID, or Mobile Number Linked to Recipient's Account"
            bind:value={$formValues[$formFields.FPS_ID_IS_YES]}
            bind:visible={isHK}
        />
        <div class:hidden={isNotUK}>
            <InputText
                id="{$formFields.BANK_SORT_CODE}"
                label="UK Sort Code"
                cls="w120"
                bind:optional={isNotUK}
                bind:visible={isUK}
                bind:value={$formValues[$formFields.BANK_SORT_CODE]}
            />
        </div>
                <InputText
                    id="{$formFields.BSB_CODE}"
                    label="BSB Code"
                    wr="bank_intl"
                    cls="w120"
                    bind:optional={noBSB}
                    bind:visible={hasBSB}
                    bind:value={$formValues[$formFields.BSB_CODE]}
                />
        <div class:hidden={true}>
            <Row>
                <InputText
                    id="{$formFields.ACCOUNT_NUMBER_CBU}"
                    label="Account Number (CBU)"
                    bind:optional={noCBU}
                    bind:value={$formValues[$formFields.ACCOUNT_NUMBER_CBU]}
                />
                <InputText
                    id="{$formFields.TAX_ID_CUIL_CUIT}"
                    label="Tax ID: CUIL / CUIT"
                    bind:optional={noCBU}
                    bind:value={$formValues[$formFields.TAX_ID_CUIL_CUIT]}
                />
            </Row>
        </div>
                <InputText
                    id="{$formFields.IBAN}"
                    label="IBAN"
                    cls="w160"
                    bind:value={$formValues[$formFields.IBAN]}
                    bind:visible={hasIBAN}
                    bind:optional={noIBAN}
                />
    */
</script>

<Card {id} {title}>
    <Dropdown
        id="{$formFields.BANK_COUNTRY}"
        label="Bank Country"
        cls="country w400"
        bind:items={bankCountries}
        bind:value={bankCountry}
        on:change={onChangeCountry}
    />
    <Dropdown
        id="{$formFields.CURRENCY}"
        label="Payment Currency"
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


    <div class="agree-section" class:hidden={showDetails === false}>
        <InputText
            id="{$formFields.ACCOUNT_HOLDER_FULL_NAME}"
            label="Full Name of Account Holder"
            bind:value={$formValues[$formFields.ACCOUNT_HOLDER_FULL_NAME]}
        />

            <InputText
                id="{$formFields.FINANCIAL_INSTITUTION}"
                label="Financial Institution Number (3 digits)"
                wr="bank_intl"
                cls="w80"
                bind:optional={notCAD}
                bind:value={$formValues[$formFields.FINANCIAL_INSTITUTION]}
                bind:visible={isCAD}
            />
            <InputText
                id="{$formFields.BRANCH_TRANSIT_NUMBER}"
                label="Transit Number (5 digits)"
                wr="bank_intl"
                cls="w80"
                bind:optional={notCAD}
                bind:value={$formValues[$formFields.BRANCH_TRANSIT_NUMBER]}
                bind:visible={isCAD}
            />

        <InputText
            id="{$formFields.BANK_ROUTING_NUMBER}"
            label="ACH Routing Number"
            cls="w160"
            bind:value={$formValues[$formFields.BANK_ROUTING_NUMBER]}
            bind:visible={isUSD}
            bind:optional={notUSD}
        />
        <InputText
            id="{$formFields.SWIFT_BIC_CODE}"
            label="SWIFT/BIC Code"
            cls="w160"
            bind:value={$formValues[$formFields.SWIFT_BIC_CODE]}
            bind:visible={isOther}
            bind:optional={notOther}
        />

        <InputText
            id="{$formFields.ACCOUNT_NUMBER}"
            label={accountNumberLabel}
            cls="w160"
            bind:value={$formValues[$formFields.ACCOUNT_NUMBER]}
        />


        <RadioGroup
            id="{$formFields.ACCOUNT_TYPE}"
            label="Account Type"
            bind:items={accountTypes}
            bind:value={$formValues[$formFields.ACCOUNT_TYPE]}
            on:change={onChangeAccountType}
        />

        <InputText
            id="{$formFields.BANK_STREET}"
            label="Recipient Address"
            bind:value={$formValues[$formFields.BANK_STREET]}
        />
        
        <Row>
            <InputText
                id="{$formFields.BANK_CITY}"
                label="City"
                cls="w240"
                bind:value={$formValues[$formFields.BANK_CITY]}
            />
            <InputText
                id="{$formFields.BANK_ZIP}"
                label="Post Code"
                wr="bank_intl"
                cls="w120"
                bind:value={$formValues[$formFields.BANK_ZIP]}
            />
        </Row>

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
        
        <InputText
            id="{$formFields.RECEIVING_BANK_NAME}"
            label="Bank Name"
            bind:optional={noBankName}
            bind:value={$formValues[$formFields.RECEIVING_BANK_NAME]}
            bind:visible={hasBankName}
        />

        <TextArea
            id="{$formFields.MISC_BANKING_DETAILS}"
            label="Banking Comments - Please include any additional information."
            bind:value={$formValues[$formFields.MISC_BANKING_DETAILS]}
            optional
        />
        <!-- 
            bind:optional={isUS}
            bind:visible={isNotUS}
         -->

    </div>

</Card>

<style>
    .agree-section {
        display: flex;
        flex-direction: column;
        gap: 2rem;
    }
</style>