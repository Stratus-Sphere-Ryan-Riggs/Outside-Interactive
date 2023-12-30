<script>
    import { formFields, formValues } from "../../store/pageData";

    const finalizeData = () => {
        let isSameLegal = $formValues[$formFields.SAME_AS_LEGAL_ADDRESS];
        console.log(`isSameLegal = ${isSameLegal}`);
        if (isSameLegal === true) {
            formValues.update(o => {
                o[$formFields.REMIT_TO_ADDR_1] = o[$formFields.ADDRESS_1];
                o[$formFields.REMIT_TO_ADDR_2] = o[$formFields.ADDRESS_2];
                o[$formFields.REMIT_TO_CITY] = o[$formFields.CITY];
                o[$formFields.REMIT_TO_STATE] = o[$formFields.STATE];
                o[$formFields.REMIT_TO_ZIP] = o[$formFields.ZIP_CODE];
                o[$formFields.REMIT_TO_COUNTRY] = o[$formFields.COUNTRY];

                return o;
            });
        }
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
            if (data.status === true) {
                alert('Vendor Request updated successfully.');
                window.location.href = '//www.osg.com';
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

        let errorSection = '';
        document.querySelectorAll('section').forEach(section => {
            console.log(`  *** checking section = ${section.id}`);
            section.querySelectorAll('.field:not(.optional) .fld').forEach(el => {
                let result = validate(el.id);
                if (result === false && errorSection === '') {
                    errorSection = section.id;
                }
            });
        });

        console.log(`errorSection = ${errorSection}`);
        if (errorSection !== '') {
            document.getElementById(errorSection).scrollIntoView();
            alert('Please fill out all required fields.');
            return;
        }

        finalizeData();
        submitData();
    };
</script>

<div id="footer">
    <button type="button" id="submit" name="submit" on:mouseup={onSubmit}>Submit Form</button>
    <button type="button" id="reset" name="reset">Reset</button>
</div>

<style>
    div {
        border-top: 1px solid var(--blue-interactive);
        background-color: white;
        margin-top: 20px;
        padding-top: 20px;
        padding-bottom: 40px;
        display: flex;
        flex-direction: row;
        align-items: center;
        justify-content: center;
        gap: 40px;
    }
    button {
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
        /* transform: translateY(-2px); */
    }
    #submit {
        background-color: var(--blue-interactive);
        color: white;
        font-weight: 500;
    }
</style>