<script>
    import Account from "./components/sections/Account.svelte";
    import Address from "./components/sections/Address.svelte";
    import Button from "./components/shared/Button.svelte";
    import Currency from "./components/sections/Currency.svelte";
    import Disclaimer from "./components/sections/Disclaimer.svelte";
    import { wifStore } from "./store/store";

    const components = [
        { step: 0, component: Currency },
        { step: 1, component: Account },
        { step: 2, component: Address },
        { step: 3, component: Disclaimer }
    ];
    let step = 0;
    let max = components.length;

    const query = (selector) => {
        console.log(`query: ${selector}`);
        if (!selector) { return null; }
        return document.querySelector(selector);
    };

    const onButtonClick = (e) => {
        console.log('App button click', e.detail.id);
        let action = e.detail.id ? e.detail.id.toLowerCase() : '';
        switch (action) {
            case 'back': {
                step = step - 1;
                if (step < 0) { step = 0; }
                break;
            }
            case 'clear': {
                if (confirm('Are you sure you want to clear the form and start over?') === false) {
                    return;
                }
                wifStore.update(o => {
                    return {};
                });

                break;
            }
            case 'next': {
                if (validateStep(step) === false) {
                    alert('Please fill out all required fields.');
                    return;
                }
                /* if (step === 0 && !!$wifStore['currency'] === false) {
                    alert('Please select a Currency to continue.');
                    return;
                } */

                step = step + 1;
                if (step >= components.length) { step = components.length - 1; }
                break;
            }
            case 'submit': {
                if (!!$wifStore['agree'] !== true) {
                    alert('You must agree to the Legal Disclaimer to submit this form.');
                    return;
                }
                break;
            }
        }
    };

    const validateStep = (stepId) => {
        console.log(`validateStep`, `stepId=${stepId}`);
        let isValid = true;

        let container = query(`div.card[data-id="${stepId}"]`);
        console.log(`validateStep container`, container);
        if (!container) { return true; }

        let requiredFields = container.querySelectorAll('.field:not(.optional)');
        console.log(`validateStep requiredFields`, requiredFields);

        requiredFields.forEach(fld => {
            let fldInput = fld.querySelector('.fld');
            if (!fldInput) { return; }

            let errorField = fld.querySelector('.field-error');
            console.log(`validateStep errorField`, errorField);
            console.log(`fldInput`, `value = ${fldInput.value}; fldInput.classList = ${fldInput.classList}`);

            if (!!fldInput.value === false && fldInput.classList.contains('hidden') == false) {
                isValid = false;
                errorField.classList.remove('hidden');
            }
            else if (!!fldInput.value === true && errorField.classList.contains('hidden') == true) {
                errorField.classList.add('hidden');
            }
        });

        return isValid;
    };

    $: visibleCurrency = step === 0;
    $: visibleAccount = step === 1;
    $: visibleAddress = step === 2;
    $: visibleDisclaimer = step === 3;
    $: isNotFirst = step > 0 && max > 1;
    $: isLast = step === (max - 1);
    $: isNotLast = isLast === false && max > 1;
</script>

<div id="overlay" class="hidden">
    <div class="cv-spinner">
      <span class="spinner"></span>
    </div>
</div>

<main>
    <span class="reminder">Please ensure all required details are fully completed.</span>
    <div class="sections">
        <Currency visible={visibleCurrency} id='0' />
        <Account visible={visibleAccount} id='1' />
        <Address visible={visibleAddress} id='2' />
        <Disclaimer visible={visibleDisclaimer} id='3' />
    </div>

    <div class="buttons">
        <div class="left">
            <Button id="back" label="Back" bind:visible={isNotFirst} on:click={onButtonClick}/>
            <Button id="clear" label="Clear" visible on:click={onButtonClick} />
        </div>
        <div class="right">
            <Button id="next" label="Next" bind:visible={isNotLast} on:click={onButtonClick} />
            <Button id="submit" label="Submit" bind:visible={isLast} submit on:click={onButtonClick} />
        </div>
    </div>
</main>

<style>
    main {
        display: flex;
        flex-direction: column;
        gap: 32px;
        /* flex: 1; */
        /* display: grid;
        grid-template-columns: 300px 1fr; */
        max-width: 1080px;
        min-width: 480px;
        width: 50%;
        margin: 0 auto;
        /* padding-top: 100px; */
        /* border-left: 1px solid white; */
        /* border-right: 1px solid white; */
    }
    .sections {
        display: flex;
        flex-direction: column;
        gap: 32px;
    }
    #overlay{	
        position: fixed;
        top: 0;
        z-index: 100;
        width: 100%;
        height:100%;
        background: rgba(0,0,0,0.6);
    }
    .cv-spinner {
        height: 100%;
        display: flex;
        justify-content: center;
        align-items: center;  
    }
    .spinner {
        width: 40px;
        height: 40px;
        border: 4px #ddd solid;
        border-top: 4px #2e93e6 solid;
        border-radius: 50%;
        animation: sp-anime 0.8s infinite linear;
    }
    @keyframes sp-anime {
        100% { 
            transform: rotate(360deg); 
        }
    }
    .buttons, .left, .right {
        display: flex;
        flex-direction: row;
        align-items: center;
    }
    .buttons {
        justify-content: space-between;
    }
    .buttons .left, .buttons .right {
        gap: 12px;
    }
</style>