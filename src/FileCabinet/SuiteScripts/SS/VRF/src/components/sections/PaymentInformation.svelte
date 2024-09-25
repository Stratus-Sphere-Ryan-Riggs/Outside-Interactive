<script>
    import { countryStates, formFields, formValues, refundMethod, selectedCountry, selectedCurrency, stateList } from "../../store/pageData";
    import { callZipAPI } from "../../store/zip";

    import Card from "../form/Card.svelte";
    import Dropdown from "../form/Dropdown.svelte";
    import InputText from "../form/InputText.svelte";
    import RadioGroup from "../form/RadioGroup.svelte";
    import Row from "../form/Row.svelte";
    import TextArea from "../form/TextArea.svelte";

    export let id = 'payment_info';
    export let title = 'Payment Information';

    let refundMethods = [];
    /* let paymentMethods = [
        { text: 'Wire', value: '1' },
        { text: 'ACH/EFT', value: '2' }
    ]; */
    // let bankCountry = '';
    // let bankCurrency = '';

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

    const onChangeRefundMethod = (e) => {
        console.log(`onChangeRefundMethod value = ${e.detail.value}`);
        $refundMethod = e.detail.value;
        /* formValues.update(o => {
            o[$formFields.PAYMENT_TYPE] = e.detail.value;
            return o;
        }); */
        console.log(`onChangeRefundMethod updated refundMethod = ${$refundMethod}`);
    };

    /* const onChangePaymentMethod = (e) => {
        console.log(`onChangePaymentMethod value = ${e.detail.value}`);
        paymentMethod = e.detail.value;
        formValues.update(o => {
            o[$formFields.PAYMENT_TYPE] = e.detail.value;
            return o;
        });
        console.log(`onChangePaymentMethod updated PAYMENT_TYPE = ${$formValues[$formFields.PAYMENT_TYPE]}`);
    }; */

    const updateRefundMethod = () => {
        // bankCountry = $selectedCountry?.toLowerCase();
        // bankCurrency = $selectedCurrency?.toLowerCase();
        console.log(`updateRefundMethod`, `selectedCountry = ${selectedCountry}; selectedCurrency = ${selectedCurrency}`);
        isUS = $selectedCountry === 'united states';
        isUSD = isUS === true && $selectedCurrency === 'usd';
        isCA = $selectedCountry === 'canada';
        isCAD = isCA === true && $selectedCurrency === 'cad';
        isUSDWire = isUSD === true && $refundMethod === '2';
        notUSDWire = !isUSDWire;
        isUSDACH = isUSD === true && $refundMethod === '1';
        isCADACH = isCAD === true && $refundMethod === '1';
        notCADACH = !isCADACH;
        isCADTransfer = isCAD === true && $refundMethod === '3';
        notCADTransfer = !isCADTransfer;
        isUSDACHOrCAD = isUSDACH === true || isCAD === true;
        notUSDACHOrCAD = !isUSDACHOrCAD;

        refundMethods = [ { text: 'Refund by ACH', value: '1' } ];
        if (isUSD === true) {
            refundMethods.push({ text: 'Refund by check', value: '2' });
        }
        else if (isCAD === true) {
            refundMethods.push({ text: 'Refund by E-Transfer', value: '3' });
        }
        $refundMethod = '1';
        console.log(`isUSD = ${isUSD}; isCAD = ${isCAD}; refundMethod = ${$refundMethod}`);

        /* if (isUSDACH === true) {
            $refundMethod = '1';
        }
        else {
            $refundMethod = '2';
        } */
        console.log(`updateRefundMethod`, { $selectedCountry, $selectedCurrency, refundMethod });

        /* formValues.update(o => {
            o[$formFields.PAYMENT_TYPE] = paymentMethod;
            return o;
        }); */
    };

    /* const updateBankPaymentMethod = () => {
        bankCountry = $formValues[$formFields.COUNTRY]?.toLowerCase();
        bankCurrency = $formValues[$formFields.CURRENCY]?.toLowerCase();
        isUS = bankCountry === 'united states';
        isUSD = isUS === true && bankCurrency === 'usd';
        isCA = bankCountry === 'canada';
        isCAD = isCA === true && bankCurrency === 'cad';
        isUSDOrCAD = isUSD === true || isCAD === true;
        notUSDAndCAD = !isUSDOrCAD;
        isUSDWire = isUSD === true && paymentMethod === '1';
        notUSDWire = !isUSDWire;
        isUSDACH = isUSD === true && paymentMethod === '2';
        notUSDACH = !isUSDACH;
        isUSDACHOrCAD = isUSDACH === true || isCAD === true;
        notUSDACHOrCAD = !isUSDACHOrCAD;

        console.log(`isUSD = ${isUSD}; isCAD = ${isCAD}; paymentMethod = ${paymentMethod}`);

        if (isUSDACH === true) {
            paymentMethod = '2';
        }
        else {
            paymentMethod = '1';
        }
        console.log(`updateBankPaymentMethod`, { bankCountry, bankCurrency, paymentMethod });

        formValues.update(o => {
            o[$formFields.PAYMENT_TYPE] = paymentMethod;
            return o;
        });
    }; */

    const updateCountry = () => {
        // $selectedCountry = $formValues[$formFields.COUNTRY];
        console.log(`PaymentInformation updateCountry bankCountry = ${$selectedCurrency}`);

        // updateBankPaymentMethod();
        updateRefundMethod();
    };

    const updateCurrency = () => {
        $selectedCurrency = $formValues[$formFields.CURRENCY];
        console.log(`PaymentInformation updateCurrency bankCurrency = ${$selectedCurrency}`);

        // updateBankPaymentMethod();
        updateRefundMethod();
    };

    $: $selectedCountry, updateRefundMethod();
    $: $selectedCurrency, updateRefundMethod();
    
    // $: paymentMethod = '';
    // $: refundMethod = '';
    $: isUS = $selectedCountry?.toLowerCase() === 'united states';
    $: notUS = !isUS;
    $: isUSD = isUS === true && $selectedCurrency?.toLowerCase() === 'usd';
    $: notUSD = !isUSD;
    $: isCA = $selectedCountry?.toLowerCase() === 'canada';
    $: isCAD = isCA === true && $selectedCurrency?.toLowerCase() === 'cad';
    $: notCAD = !isCAD;
    $: isUSDOrCAD = isUSD === true || isCAD === true;
    $: notUSDAndCAD = !isUSDOrCAD;
    $: isOther = notUSD === true && notCAD === true;
    $: notOther = !isOther;
    // $: isUSDWire = isUSD === true && paymentMethod === '1';
    $: isUSDWire = isUSD === true && $refundMethod === '2';
    $: notUSDWire = !isUSDWire;
    // $: isUSDACH = isUSD === true && paymentMethod === '2';
    $: isUSDACH = isUSD === true && $refundMethod === '1';
    $: notUSDACH = !isUSDACH;
    $: isCADACH = isCAD === true && $refundMethod === '1';
    $: notCADACH = !isCADACH;
    $: isCADTransfer = isCAD === true && $refundMethod === '3';
    $: notCADTransfer = !isCADTransfer;
    $: isUSDACHOrCAD = isUSDACH === true || isCAD === true;
    $: notUSDACHOrCAD = !isUSDACHOrCAD;
    $: isUSDACHOrCADACH = isUSDACH === true || isCADACH === true;
    $: notUSDACHOrCADACH = !isUSDACHOrCADACH;
    $: bankingDetailLabel = isOther === true ? "International Wire Payment Information" : "Banking Comments";
</script>

<Card {id} {title}>

    <!-- <RadioGroup
        id="{$formFields.PAYMENT_TYPE}"
        label="Payment Method"
        bind:items={paymentMethods}
        bind:value={paymentMethod}
        bind:visible={isUSD}
        on:change={onChangePaymentMethod}
    /> -->

    <RadioGroup
        id="refund_method"
        label="Refund Method"
        bind:items={refundMethods}
        bind:value={$refundMethod}
        bind:visible={isUSDOrCAD}
        on:change={onChangeRefundMethod}
    />

    <Row
        bind:visible={isUSDACHOrCADACH}
    >
        <InputText
            id="{$formFields.ACCOUNT_NUMBER}"
            label="Account Number"
            cls="w160"
            bind:optional={notUSDACHOrCADACH}
            bind:value={$formValues[$formFields.ACCOUNT_NUMBER]}
        />
        <InputText
            id="{$formFields.BANK_ROUTING_NUMBER}"
            label="ACH Routing Number"
            cls="w160"
            bind:value={$formValues[$formFields.BANK_ROUTING_NUMBER]}
            bind:visible={isUSDACH}
            bind:optional={notUSDACH}
        />
    </Row>

    <Row
        bind:visible={isCADACH}
    >
        <InputText
            id="{$formFields.FINANCIAL_INSTITUTION}"
            label="Financial Institution Number (3 digits)"
            wr="bank_intl"
            cls="w80"
            bind:optional={notCADACH}
            bind:value={$formValues[$formFields.FINANCIAL_INSTITUTION]}
        />
        <InputText
            id="{$formFields.BRANCH_TRANSIT_NUMBER}"
            label="Transit Number (5 digits)"
            wr="bank_intl"
            cls="w80"
            bind:optional={notCADACH}
            bind:value={$formValues[$formFields.BRANCH_TRANSIT_NUMBER]}
        />
    </Row>

    <div
        style="display: flex; flex-direction: column; gap: 2rem;"
        class:hidden={notUSDWire}
    >
        <InputText
            id="{$formFields.ADDRESSEE}"
            label="Addressee"
            bind:value={$formValues[$formFields.ADDRESSEE]}
            bind:optional={notUSDWire}
        />
        <InputText
            id="{$formFields.ADDRESS_1}"
            label="Address - Line 1"
            bind:value={$formValues[$formFields.ADDRESS_1]}
            bind:optional={notUSDWire}
        />
        <InputText
            id="{$formFields.ZIP_CODE}"
            label="Zip Code"
            cls="zip w120"
            on:change={onChangeZip}
            bind:value={$formValues[$formFields.ZIP_CODE]}
            bind:optional={notUSDWire}
        />
    </div>

    <Row bind:visible={isUSDWire}>
        <InputText
            id="{$formFields.CITY}"
            label="City"
            bind:value={$formValues[$formFields.CITY]}
            bind:optional={notUSDWire}
        />
        <Dropdown
            id="{$formFields.STATE}"
            label="State/Province"
            bind:items={$stateList}
            bind:value={$formValues[$formFields.STATE]}
            bind:optional={notUSDWire}
        />
    </Row>

    <InputText
        id="{$formFields.INTERAC_EMAIL}"
        label="Interac (e-Transfer) Registered Email"
        bind:optional={notCADTransfer}
        bind:value={$formValues[$formFields.INTERAC_EMAIL]}
        bind:visible={isCADTransfer}
    />

    <TextArea
        id="{$formFields.MISC_BANKING_DETAILS}"
        label={bankingDetailLabel}
        bind:optional={notOther}
        bind:value={$formValues[$formFields.MISC_BANKING_DETAILS]}
    />

</Card>

<style></style>