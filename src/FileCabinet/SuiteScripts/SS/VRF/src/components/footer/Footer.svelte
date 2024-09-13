<script>
    import { formFields, formValues } from "../../store/pageData";
    // import Button from '../components/form/Button.svelte';
    import Button from "../form/Button.svelte";

    const finalizeData = () => {
        let isUSD = $formValues[$formFields.COUNTRY]?.toLowerCase() === 'united states' &&
            $formValues[$formFields.CURRENCY]?.toLowerCase() === 'usd';
        let isCAD = $formValues[$formFields.COUNTRY]?.toLowerCase() === 'canada' &&
            $formValues[$formFields.CURRENCY]?.toLowerCase() === 'cad';
        let isACH = $formValues[$formFields.PAYMENT_TYPE] === '2';
        console.log(`isUSD = ${isUSD}; isACH = ${isACH}`);

        if (isACH === true) {
            formValues.update(o => {
                o[$formFields.PREFERRED_PAYMENT_METHOD_2] = '1';
                return o;
            });
        }
        
        formValues.update(o => {
            o[$formFields.ACCOUNT_NUMBER] = isACH === true ? o[$formFields.ACCOUNT_NUMBER] : '';
            o[$formFields.BANK_ROUTING_NUMBER] = isUSD === true && isACH === true ?
                o[$formFields.BANK_ROUTING_NUMBER] : '';
            o[$formFields.ADDRESSEE] = isUSD === true && isACH === false ? o[$formFields.ADDRESSEE] : '';
            o[$formFields.ADDRESS_1] = isUSD === true && isACH === false ? o[$formFields.ADDRESS_1] : '';
            o[$formFields.CITY] = isUSD === true && isACH === false ? o[$formFields.CITY] : '';
            o[$formFields.STATE] = isUSD === true && isACH === false ? o[$formFields.STATE] : '';
            o[$formFields.ZIP_CODE] = isUSD === true && isACH === false ? o[$formFields.ZIP_CODE] : '';
            o[$formFields.FINANCIAL_INSTITUTION] = isCAD === true ? o[$formFields.FINANCIAL_INSTITUTION] : '';
            o[$formFields.BRANCH_TRANSIT_NUMBER] = isCAD === true ? o[$formFields.BRANCH_TRANSIT_NUMBER] : '';
            
            return o;
        });

        // console.clear();
        console.log($formValues);
    };

    const submitData = () => {
        console.log(`SUBMIT`, $formValues);
        let overlay = document.getElementById('overlay');
        overlay.classList.remove('hidden');

        fetch(
            `${window['backendURL']}&request_id=${$formValues.id}&action=save`,
            {
                method: 'POST',
                body: JSON.stringify($formValues)
            }
        ).then(data => data.json())
        .then(data => {
            // return;
            if (data.status === true) {
                alert('Vendor Request updated successfully.');
                window.location.href = '//www.outsideinc.com/';
            }
            else {
                alert(`An error occured while submitting the data: ${data.message}`);
                overlay.classList.add('hidden');
            }
        });
    };
    
    const validate = (id) => {
        let errorSpan = document.getElementById(`${id}_error`);
        if (errorSpan.classList.contains('hidden') === true) {
            errorSpan.classList.remove('hidden');
        }

        if (errorSpan.closest('.field').classList.contains('optional') === true) {
            return true;
        }

        let value = $formValues[id];
        if (!!value === true) {
            errorSpan.classList.add('hidden');
        }

        console.log(`  ++ validate id=${id} value=${value}; result = ${!!value}`);
        return !!value;
    }

    const onSubmit = () => {
        console.log(`  *** SUBMIT ***`);
        console.log('formFields', $formFields);
        console.log('formValues', $formValues);
        window['alertedTax'] = false;

        let errorSection = '';
        document.querySelectorAll('div.card').forEach(section => {
            console.log(`  *** checking section = ${section['dataset'].id}`);
            section.querySelectorAll('.field:not(.optional) .fld, .fld.tax').forEach(el => {
                let result = validate(el.id);
                // console.log(`   >>> result = ${result}`);
                if (result === false && errorSection === '') {
                    errorSection = section['dataset'].id;
                    // console.log(`   >>> errorSection = ${errorSection}`);
                }
            });
        });

        if (errorSection) {
            console.log(`errorSection = ${errorSection}`);
            alert('Please fill out all required fields.');
            document.querySelector(`div.card[data-id=${errorSection}]`).scrollIntoView();
            return;
        }

        /* console.log(`isUS???`, $formValues[$formFields.COUNTRY].toLowerCase() === 'united states');
        if ((
                $formValues[$formFields.COUNTRY].toLowerCase() === 'united states' &&
                    !!$formValues[$formFields.TAX_ID_US] === false &&
                    !!$formValues[$formFields.SSN] === false
            ) &&
            window['alertedTax'] === false
        ) {
            window['alertedTax'] = true;
            errorSection = 'tax_info';
            console.log(`   >>> errorSection = ${errorSection}`);
            customAlert = true;
            alert('Please enter either a business Tax ID or Social Security Number in the Name and Address section.');
            document.querySelector(`div.card[data-id=${errorSection}]`).scrollIntoView();
            return;
        } */

        /* if ($formValues[$formFields.LEGAL_DISCLAIMER] === false) {
            errorSection = 'disclaimer';
            customAlert = true;
            alert('Agreement to legal disclaimer is required to submit form.');
            document.querySelector(`div.card[data-id=${errorSection}]`).scrollIntoView();
            return;
        } */

        /* console.log(`customAlert = ${customAlert}; errorSection = ${errorSection}`);

        if (customAlert === false && !!errorSection === true) {
            alert('Please fill out all required fields.');
        }

        if (errorSection) {
            console.log(`errorSection = ${errorSection}`);
            document.querySelector(`div.card[data-id=${errorSection}]`).scrollIntoView();
            return;
        } */

        finalizeData();
        submitData();
    };
</script>

<div id="footer" class="buttons">
    <Button id="reset" label="Reset" />
    <Button id="submit" label="Submit Formzzz" submit on:click={onSubmit} />
    <!-- <button type="button" id="submit" name="submit" on:mouseup={onSubmit}>Submit Form</button> -->
    <!-- <button type="button" id="reset" name="reset">Reset</button> -->
</div>

<style>
    div.buttons {
        /* border-top: 1px solid var(--blue-interactive); */
        /* background-color: white; */
        /* margin-top: 20px; */
        /* padding-top: 20px; */
        /* padding-bottom: 40px; */
        display: flex;
        flex-direction: row;
        align-items: center;
        justify-content: space-between;
    }
    /* button {
        padding: 12px 24px;
        border-radius: 4px;
        border: 0;
        cursor: pointer;
        opacity: 0.9;
        transition: all 100ms ease-in-out;
    }
    button:hover {
        box-shadow: rgba(0, 0, 0, 0.1) 0px 4px 12px;
        opacity: 1;
        * transform: translateY(-2px); *
    }
    #submit {
        background-color: var(--blue-interactive);
        color: white;
        font-weight: 500;
    } */
</style>