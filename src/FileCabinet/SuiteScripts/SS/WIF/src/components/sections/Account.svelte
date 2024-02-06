<script>
    import Card from "../shared/Card.svelte";
    import Dropdown from "../shared/Dropdown.svelte";
    import InputCheckbox from "../shared/InputCheckbox.svelte";
    import InputText from "../shared/InputText.svelte";
    import { wifStore } from "../../store/store";

    export let id = '';
    export let visible = false;

    const accountTypes = [
        { text: 'Checking', value: '1' },
        { text: 'Savings', value: '2' }
    ];

    const buildAccountNumberLabel = () => {
        let fieldLabel = 'Account Number';
        console.log(`isNZD`, isNZD);

        if (bankOutsideUS === true && isOther === true) {
            fieldLabel = `IBAN / ${fieldLabel}`;
        }
        else if (isNZD === true) {
            fieldLabel = `${fieldLabel} (00-0000-0000000-00)`;
        }

        console.log('fieldLabel', fieldLabel);
        return fieldLabel;
    };

    $: isUSD = $wifStore['currency'] === 'usd';
    $: isEUR = $wifStore['currency'] === 'eur';
    $: isNotEUR = !isEUR;
    $: isARS = $wifStore['currency'] === 'ars';
    $: isNotARS = !isARS;
    $: isAUD = $wifStore['currency'] === 'aud';
    $: isNotAUD = !isAUD;
    $: isCAD = $wifStore['currency'] === 'cad';
    $: isNotCAD = !isCAD;
    $: isCLP = $wifStore['currency'] === 'clp';
    $: isNotCLP = !isCLP;
    $: isGBP = $wifStore['currency'] === 'gbp';
    $: isNotGBP = !isGBP;
    $: isMXN = $wifStore['currency'] === 'mxn';
    $: isNotMXN = !isMXN;
    $: isNZD = $wifStore['currency'] === 'nzd';
    $: isOther = $wifStore['currency'] === 'other';
    $: isNotOther = !isOther;

    $: bankInUS = !!$wifStore['bankInUS'] === true && isUSD === true;
    $: bankOutsideUS = !!$wifStore['bankInUS'] === false && isUSD === true;
    $: optionalACH = bankOutsideUS === true || isUSD === false;
    $: optionalSwift = bankOutsideUS === false || isNotOther === true;
    $: accountNumberLabel = (bankOutsideUS === true || isOther === true) ?
        `IBAN / Account Number` :
        ((isNZD === true) ? `Account Number (00-0000-0000000-00)` : `Account Number`);
    $: hasAccountNumber = ['eur', 'ars'].indexOf($wifStore['currency']) < 0;
    $: noAccountNumber = !hasAccountNumber;
    $: hasAccountType = ['gbp', 'hkd', 'mxn', 'nzd', 'sgd', 'other'].indexOf($wifStore['currency']) < 0;
    $: noAccountType = !hasAccountType;
    $: hasBankName = ['usd'].indexOf($wifStore['currency']) < 0;
    $: noBankName = !hasBankName;
</script>

<Card title="Account Holder" subtitle="2 of 4" bind:visible={visible} {id}>
    <InputText
        id="custrecord_vr_fullnameaccountholder"
        label="Full Name of Account Holder"
    />
    <InputText
        id="custrecord_vr_clabe"
        label="CLABE"
        bind:visible={isMXN}
        bind:optional={isNotMXN}
    />
    <InputText
        id="custrecord_vr_curp"
        label="CURP"
        bind:visible={isMXN}
        bind:optional={isNotMXN}
    />
    <InputText
        id="custrecord_vr_bankroutingnumber"
        label="ACH Routing Number"
        bind:visible={bankInUS}
        bind:optional={optionalACH}
    />
    <InputText
        id="custrecord_vr_bicswift"
        label="SWIFT / BIC Code"
        bind:visible={bankOutsideUS}
        bind:optional={optionalSwift}
    />
    <InputText
        id="custrecord_vr_intl_iban"
        label="IBAN"
        bind:visible={isEUR}
        bind:optional={isNotEUR}
    />
    <InputText
        id="custrecord_vr_cbuaccountnumber"
        label="Account Number (CBU)"
        bind:visible={isARS}
        bind:optional={isNotARS}
    />
    <InputText
        id="custrecord_vr_cuilcuit"
        label="Tax ID: CUIL / CUIT"
        bind:visible={isARS}
        bind:optional={isNotARS}
    />
    <InputText
        id="custrecord_vr_intl_bsbcode"
        label="BSB Code"
        bind:visible={isAUD}
        bind:optional={isNotAUD}
    />
    <InputText
        id="custrecord_vr_intl_fininstnum"
        label="Institution Number (3 digits)"
        bind:visible={isCAD}
        bind:optional={isNotCAD}
    />
    <InputText
        id="custrecord_vr_intl_branchtransnum"
        label="Transit Number (5 digits)"
        bind:visible={isCAD}
        bind:optional={isNotCAD}
    />
    <InputText
        id="custrecord_vr_intl_banksortcode"
        label="UK Sort Code"
        bind:visible={isGBP}
        bind:optional={isNotGBP}
    />
    <InputText
        id="custrecord_vr_accountnumber"
        bind:label={accountNumberLabel}
        bind:visible={hasAccountNumber}
        bind:optional={noAccountNumber}
    />
    <Dropdown id="custrecord_vr_accountype"
        items={accountTypes}
        label="Account Type"
        bind:visible={hasAccountType}
        bind:optional={noAccountType}
    />
    <InputText
        id="custrecord_vr_receivingbankname"
        label="Bank Name"
        bind:visible={hasBankName}
        bind:optional={noBankName}
    />
    <InputText
        id="custrecord_vr_rut"
        label="Recipient's RUT number (Rol Unico Tributario)"
        bind:visible={isCLP}
        bind:optional={isNotCLP}
    />
</Card>


<style></style>