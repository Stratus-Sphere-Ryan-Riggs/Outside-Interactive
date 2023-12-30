// API KEYS
// - Zip Code Stack: 01HF2K4V0ZH5K535TDJZS1ZVB0
//  - Zip Code URL: https://api.zipcodestack.com/v1/search?codes=99501&country=us&apikey=01HF2K4V0ZH5K535TDJZS1ZVB0

const FIELDS = window.fieldData;
window.formFields = [];

function newElement(options) {
    let { classList, id, type } = options;
    let element = document.createElement(type);
    if (id) {
        element.setAttribute('id', id);
    }
    if (classList) {
        classList.forEach(cls => element.classList.add(cls));
    }

    return element;
}

function getById(id) {
    return document.getElementById(id);
}

function getFieldType(id) {
    return getById(id).type;
}

function query(selector) {
    return document.querySelector(selector);
}

function queryAll(selector) {
    return document.querySelectorAll(selector);
}

function queryIds(selector) {
    let idList = [];
    queryAll(selector).forEach(f => idList.push(f.id));
    return idList;
}

function callZipAPI(options) {
    let { zip, country, targets } = options;
    if (!zip || !country || !targets) { console.log('1', options); return null; }
    // if (!!Object.keys(targets).length) { console.log('2', options); return null; }

    let url = `https://api.zipcodestack.com/v1/search?codes=${zip}&country=${country}&apikey=01HF2K4V0ZH5K535TDJZS1ZVB0`;
    fetch(url)
        .then(data => data.json())
        .then(data => {
            let results = data.results[zip];
            if (!results) { return; }
            if (results.length <= 0) { return; }

            targets.city.value = results[0].city;
            let selectedIndex = -1;
            for (let i = 0, count = targets.state.options.length; i < count; i++) {
                if (
                    targets.state.options[i].text === results[0].state_en ||
                    targets.state.options[i].value === results[0].state_code
                ) {
                    selectedIndex = i;
                    break;
                }
            }
            targets.state.options.selectedIndex = selectedIndex;
            // validateForm();
        });
}

// TO BE REFERENCED
function toggleError(options) {
    let { field, error } = options;
    if (!field) { return; }
    let div = field.closest('div');
    (!!error === true) ? div.classList.add('error') : div.classList.remove('error');
}

/* function toggleRequired(options) {
    let { field } = options;
    if (!field) { return; }

    let div = field.closest('div');
} */

function toggleField(options) {
    let { field } = options;
    if (!field) { return; }

    let div = field.closest('div');

    if (options.hasOwnProperty('show')) {
        let show = !!options.show;
        show === true ? div.classList.remove('hidden') : div.classList.add('hidden');
    }

    if (options.hasOwnProperty('required')) {
        let required = !!options.required;
        required === true ? div.classList.remove('optional') :
            div.classList.add('optional');
    
        let formField = window.formFields.find(f => f.id === field.id);
        if (formField) {
            formField.required = required;
        }
    }
}

function buildCountryDropdowns() {
    if (!window.stateCountryData) { return; }
    console.log(window.stateCountryData);

    let countries = [
        ...new Set(window.stateCountryData.map(c => `${c.countryid}|${c.countryname}`))
    ];
    let optionsText = '';
    for (let i = 0, count = countries.length; i < count; i++) {
        let parts = countries[i].split('|');
        optionsText = `${optionsText}<option value="${parts[0]}">${parts[1]}</option>`;
    }

    queryAll('select.country').forEach(select => {
        select.innerHTML = optionsText;
    });
}

function buildCurrencyDropdowns() {
    if (!window.currencyData) { return; }
    console.log(window.currencyData);

    let optionsText = '<option value="">-- Select one --</option>';
    for (let i = 0, count = window.currencyData.length; i < count; i++) {
        let curr = window.currencyData[i];
        optionsText = `${optionsText}<option value="${curr.symbol}">${curr.name}</option>`;
    }

    queryAll('select.currency').forEach(select => {
        console.log(select);
        select.innerHTML = optionsText;
    });
}

function buildRadioGroups() {
    if (!window.radioGroupData) { return; }
    if (!window.vendorRequestData) { return; }

    for (const [listKey, listValue] of Object.entries(window.radioGroupData)) {
        let group = getById(`${listKey}_grp`);
        let groupContent = '';

        for (let i = 0, count = listValue.length; i < count; i++) {
            groupContent = `${groupContent}
            <div class="field-rb">
                <input type="radio" name="${listKey}" id="${listKey}_${listValue[i].id}" value="${listValue[i].id}" />
                <label for="${listKey}_${listValue[i].id}">${listValue[i].name}</label>
            </div>
            `;
        }

        group.innerHTML = groupContent;
    }
}

function buildStateDropdowns(options) {
    if (!window.stateCountryData) { return; }

    let optionsText = '';
    let selectedIndex = -1;
    let { country, fieldId } = options;
    let states = window.stateCountryData.filter(row => row.countryname === country && !!row.stateid === true);
    console.log('states', states);

    if (states.length > 0) {
        for (let i = 0, count = states.length; i < count; i++) {
            optionsText = `${optionsText}<option value="${states[i].stateshortname}">${states[i].statefullname}</option>`;
            if (states[i].statefullname === window.vendorRequestData[fieldId]) {
                selectedIndex = i;
            }
        }
    }

    let dropDown = getById(fieldId);
    dropDown.innerHTML = optionsText;
    dropDown.selectedIndex = selectedIndex;

    toggleField({ field: dropDown, show: states.length > 0, required: states.length > 0 });
}

function populateFormData(data) {
    /* let excludeFields = [
        'custrecord_vr_certofinsurance',
        'custrecord_vr_w9'
    ]; */

    for (const [key, value] of Object.entries(data)) {
        console.log(key, value);
        // if (excludeFields.includes(key)) { continue; }

        let field = getById(key);
        if (!field) { continue; }
        if (field.type === 'file') { continue; }
        
        field.value = value;
    }

    [
        { country: 'custrecord_vr_country', state: 'custrecord_vr_state' },
        { country: 'custrecord_vr_remcountry', state: 'custrecord_vr_remstate' },
    ].forEach(row => {
        let dropDown = getById(row.country);
        for (let i = 0, count = dropDown.options.length; i < count; i++) {
            let el = dropDown.options[i];
            if (el.text === data[row.country]) {
                dropDown.selectedIndex = i;
                buildStateDropdowns({ country: el.text, fieldId: row.state });
                break;
            }
        }
    });

    queryAll('input[type=checkbox]').forEach(field => {
        console.log(`   >>> checkbox = ${field.id}; checked = ${data[field.id]}`);
        field.checked = (data[field.id] === true)
        if (field.id === FIELDS.IS_BIZ_SMALL) {
            console.log(`   >>> FIRING EVENT key = custrecord_vr_smallbiz`);
            toggleSmallBizOptions({ show: field.checked });
        }
        if (field.id === FIELDS.GHG_EMISSIONS_CALC) {
            toggleField({
                field: getById(FIELDS.GHG_EMISSION_AMOUNTS),
                required: field.checked
            });
        }
    });

    for (const grpKey of Object.keys(window.radioGroupData)) {
        let fieldId = `${grpKey}_${data[grpKey]}`;
        let rb = getById(fieldId);
        if (rb) {
            console.log(`   >>> radio = ${grpKey}; value = ${data[grpKey]}`);
            rb.checked = true;
        }
    }
}

function getFormData() {
    /* let checkboxFields = queryAll('input[type=checkbox]');
    let checkboxIds = [];
    checkboxFields.forEach(field => checkboxIds.push(field.id)); */

    let checkboxFields = queryIds('input[type=checkbox]');
    let dropDownFields = queryIds('select');
    let fileFields = queryIds('input[type=file]');
    let fieldIds = Object.keys(window.vendorRequestData);

    for (let i = 0, count = fieldIds.length; i < count; i++) {
        let fieldId = fieldIds[i];
        if (fileFields.includes(fieldId)) { continue; }
        
        let field = getById(fieldId);
        let radioGroup = null;
        if (!field) {
            radioGroup = getById(`${fieldId}_grp`);
            if (!radioGroup) { continue; }
        }

        let fieldValue = '';
        if (field) {
            if (dropDownFields.includes(fieldId) === true) {
                fieldValue = field.options[field.options.selectedIndex]?.text;
            }
            else if (checkboxFields.includes(fieldId) === true) {
                fieldValue = field.checked;
            }
            else {
                fieldValue = field.value;
            }
        }
        else if (radioGroup) {
            fieldValue = radioGroup.querySelector('input[type=radio]:checked')?.value;
        }

        window.vendorRequestData[fieldId] = fieldValue;
    }
    console.log('data to submit', window.vendorRequestData);
}

function toggleSmallBizOptions(options) {
    let smallBizOptions = queryAll('.small_biz_opt');
    console.log(smallBizOptions);

    let { show, scroll } = options;
    if (show === true) {
        smallBizOptions.forEach(el => el.classList.remove('hidden'));
        if (scroll === true) {
            query('a[href="#small_business"]').click();
        }
    }
    else {
        smallBizOptions.forEach(el => el.classList.add('hidden'));
    }
    console.log('custrecord_vr_smallbiz checked = ', event.target.checked);
}

function validateField(options) {
    let { field } = options;
    let parts = field.id.split('_');
    let formField = null;
    let formFieldId = (field.type === 'radio') ?
        parts.slice(0, parts.length - 1).join('_') :
        field.id;
    formField = window.formFields.find(f => f.id === formFieldId);
    console.log(`*** validateField field.id = ${field.id}, formFieldId = ${formFieldId}`, formField);
    if (!formField) {
        console.log(`formField not found: ${formFieldId} (type = ${field.type}, original id = ${field.id})`);
        return;
    }

    // let { id, required, value } = options;
    let div = getById(field.type === 'radio' ? `${formFieldId}_grp` : formFieldId).closest('div.field');
    div.classList.remove('error');
    
    let fieldError = div.querySelector('span.field-error')
    if (fieldError) {
        div.removeChild(fieldError);
    }

    if (formField.required === false) {
        return true;
    }

    let hasError = false;
    if (field.type === 'radio') {
        let checked = div.querySelectorAll('input[type=radio]:checked');
        console.log(`${div.id} checked`, checked);
        hasError = checked.length <= 0;
    }
    else if (!field.value) {
        hasError = true;
    }

    if (hasError === false) { return true; }
    
    div.classList.add('error');
    let span = newElement({ type: 'span', classList: ['field-error'] });
    let label = div.querySelector('label');
    span.textContent = `${label.textContent} is required.`
    div.appendChild(span);

    return false;
}

function validateForm() {
    let isValid = { status: true, fields: [] };
    getFormData();

    // TODO: Loop through each section instead of all fields
    let sections = queryAll('section');
    let scrollToSection = '';
    sections.forEach(section => {
        console.log('>>> reading section = ', section.id);
        
        let fieldGroups = section.querySelectorAll('.field');
        fieldGroups.forEach(group => {
            if (group.classList.contains('optional')) {
                return;
            }

            let inputFields = group.querySelectorAll('.fld, input[type=radio]');
            console.log('inputFields', inputFields);
            if (inputFields.length <= 0) {
                console.log(`inputFields not found`);
                return;
            }

            let inputField = inputFields[0];
            // console.log('inputField', inputField);

            /* let parts = inputField.id.split('_');
            let formField = null;
            let formFieldId = (inputField.type === 'radio') ?
                parts.slice(0, parts.length - 1).join('_') :
                inputField.id;
            formField = window.formFields.find(f => f.id === formFieldId);
            if (!formField) {
                console.log(`formField not found: ${formFieldId}`);
                return;
            } */
            // let validate = validateField({ ...formField, value: inputField.value });
            let validate = validateField({ field: inputField })
            console.log(`inputField = ${inputField.id}`, validate);

            if (validate === true) {
                return;
            }
            
            if (!scrollToSection) {
                console.log(`    >>> scrollToSection = ${section.id}`);
                scrollToSection = section.id;
            }

            /* if (hasSectionError === false) {
                hasSectionError = validateField({ ...formField, value: inputField.value }) === false;
                console.log(`    >>> hasSectionError=${hasSectionError} on field ${inputField.id}`);
            } */
            // return;
        });

        /* if (hasSectionError === true && !!scrollToSection === false) {
            console.log(`    >>> scrollToSection = ${section.id}`);
            scrollToSection = section.id;
        } */
    });

    if (!!scrollToSection === true) {
        console.log(`scrollToSection`, scrollToSection);
        getById(scrollToSection).scrollIntoView();
        scrollToSection = '';
        return false;
    }

    return true;

    /* for (let i = 0, count = window.formFields.length; i < count; i++) {
        let formField = window.formFields[i];
        if (formField.required === false) {
            continue;
        }

        validateField({ ...formField, value: window.vendorRequestData[formField.id] });
    }

    console.log('isValid', isValid.fields);
    return isValid; */
}

window.addEventListener('DOMContentLoaded', () => {
    const observer = new IntersectionObserver(entries => {
        entries.forEach(entry => {
            const id = entry.target.getAttribute('id');
            let navParent = document.querySelector(`nav li a[href="#${id}"]`).parentElement;
            
            if (entry.intersectionRatio > 0) {
                navParent.classList.add('active');
            }
            else {
                navParent.classList.remove('active');
            }
        });
    });
    queryAll('section[id]').forEach(section => {
        observer.observe(section);
    });

    console.log(window.vendorRequestData);
    buildCountryDropdowns();
    buildCurrencyDropdowns();
    buildRadioGroups();
    
    for (const fieldId of Object.values(window.fieldData)) {
        let isRadioGroup = false;
        let field = getById(fieldId);
        if (!field) {
            isRadioGroup = !!getById(`${fieldId}_grp`);
        }
        else if ([ 'checkbox' ].includes(field.type) === true) { continue; }

        if (isRadioGroup === true) {
            window.formFields.push({ id: fieldId, required: true });
        }
        else if (!!field === true) {
            let isOptional = field.closest('div').classList.contains('optional') === true;
            window.formFields.push({ id: fieldId, required: !isOptional });
        }
    }

    toggleField({
        field: getById(FIELDS.CERTIFICATE_OF_INSURANCE),
        required: window.isServiceProvider === true
    });

    queryAll('.fld').forEach(el => {
        el.addEventListener('change', event => {
            /* let formField = window.formFields.find(f => f.id === event.target.id);
            if (!formField) {
                console.log(`formField not found: ${event.target.id}`);
                return;
            }
            validateField({ ...formField, value: event.target.value }); */
            validateField({ field: event.target });
        })
    });

    let stateCountryFields = [
        { country: FIELDS.COUNTRY, state: FIELDS.STATE },
        { country: FIELDS.REMIT_TO_COUNTRY, state: FIELDS.REMIT_TO_STATE },
    ];
    queryAll('.country').forEach(el =>
        el.addEventListener('change', (event) => {
            console.log(`target`, event.target.id);
            let countryName = event.target.options[event.target.selectedIndex].text;
            let countryValue = event.target.value;
            // console.log(`target id = ${event.target.id}, value = ${countryValue}`, `index = ${event.target.selectedIndex}; text = ${countryName}`);

            let stateField = stateCountryFields.find(c => c.country === event.target.id);
            // if (!stateField) { return; }

            if (stateField) {
                buildStateDropdowns({
                    country: countryName,
                    fieldId: stateField.state
                });
            }
            // validateForm();

            let isUS = (event.target.id === FIELDS.COUNTRY && countryValue.toLowerCase() === 'us');
            toggleField({
                field: getById(FIELDS.TAX_ID),
                required: isUS,
                show: isUS
            });

            console.log(`target id = ${event.target.id}, value = ${countryValue.toLowerCase()}`, `index = ${event.target.selectedIndex}; text = ${countryName}`);
            let bankCurrency = getById(FIELDS.BANK_CURRENCY);
            if (event.target.id === FIELDS.BANK_COUNTRY && countryValue.toLowerCase() === 'us') {
                console.log('checking domestic');
                getById(`${FIELDS.BANK_DETAIL_METHOD}_1`).checked = true;
                bankCurrency.selectedIndex = bankCurrency.querySelector(`option[value="USD"]`).index;
            }
            else {
                console.log('checking international');
                getById(`${FIELDS.BANK_DETAIL_METHOD}_2`).checked = true;
                bankCurrency.selectedIndex = -1;
            }
            validateField({ field: getById(`${FIELDS.BANK_DETAIL_METHOD}_1`) });
            validateField({ field: bankCurrency });
            /* if (isUS) {
                let bankCountry = getById(FIELDS.BANK_COUNTRY);
                bankCountry.selectedIndex = bankCountry.querySelector(`option[value="US"]`).index;

                let bankCurrency = getById(FIELDS.BANK_CURRENCY);
                bankCurrency.selectedIndex = bankCurrency.querySelector(`option[value="USD"]`).index;
            } */

            /* toggleField({
                field: getById(FIELDS.W9),
                show: isUS
            }); */
        })
    );

    getById(FIELDS.SAME_AS_LEGAL_ADDRESS).addEventListener('change', (event) => {
        let field = getById(FIELDS.REMIT_TO_COUNTRY);
        // let countryName = field.options[field.selectedIndex].text;
        let countryName = field.options[field.selectedIndex]?.text;
        console.log(`target value = ${field.value}`, `index = ${field.selectedIndex}; text = ${countryName}`);

        if (countryName) {
            buildStateDropdowns({
                country: countryName,
                fieldId: FIELDS.REMIT_TO_STATE
            });
        }

        let remitOptions = queryAll('.remit_opt');
        remitOptions.forEach(el => {
            let field = el.querySelector('.fld');
            if (!field) { return; }
            // if (field.id === FIELDS.REMIT_TO_STATE) { return; }

            toggleField({ field, show: event.target.checked === false, required: event.target.checked === false });
        });
        
        getById(FIELDS.REMIT_TO_ADDR_1).value = getById(FIELDS.ADDRESS_1).value;
        getById(FIELDS.REMIT_TO_ADDR_2).value = getById(FIELDS.ADDRESS_2).value;
        getById(FIELDS.REMIT_TO_COUNTRY).value = getById(FIELDS.COUNTRY).value;
        getById(FIELDS.REMIT_TO_ZIP).value = getById(FIELDS.ZIP_CODE).value;
        getById(FIELDS.REMIT_TO_CITY).value = getById(FIELDS.CITY).value;
        getById(FIELDS.REMIT_TO_STATE).value = getById(FIELDS.STATE).value;
        
        // validateForm();
    });

    let zipFields = [
        { zip: FIELDS.ZIP_CODE, city: FIELDS.CITY, state: FIELDS.STATE, country: FIELDS.COUNTRY },
        { zip: FIELDS.REMIT_TO_ZIP, city: FIELDS.REMIT_TO_CITY, state: FIELDS.REMIT_TO_STATE, country: FIELDS.REMIT_TO_COUNTRY }
    ];
    queryAll('.zip').forEach(el => {
        el.addEventListener('change', (event) => {
            let zipCode = event.target.value;
            console.log(`target id=${event.target.id}`, `value = ${event.target.value}`);

            let zipField = zipFields.find(field => field.zip === event.target.id);
            console.log(`zipField`, zipField);
            if (!zipField) { return; }

            callZipAPI({
                zip: zipCode,
                country: getById(zipField.country).value,
                targets: {
                    city: getById(zipField.city),
                    state: getById(zipField.state)
                }
            });
        })
    });

    queryAll('input[type=file]').forEach(el =>
        el.addEventListener('change', (event) => {
            let fieldId = event.target.id;
            let field = getById(fieldId);
            console.log(field);
            console.log(field?.files.length);
            if (field?.files.length <= 0) {
                return;
            }
            console.log(fieldId, field.files[0].name);

            let formData = new FormData();
            formData.append("file", field.files[0]);
            fetch(
                `${window.backendURL}&action=upload`,
                {
                    method: 'POST',
                    body: formData
                }
            ).then(data => data.json())
            .then(data => {
                console.log(`file upload = ${field.files[0].name}`, data);
                if (data.status === true) {
                    window.vendorRequestData[fieldId] = data.file.id;
                }
                else {
                    alert(`An error occured during file upload: ${data.message}`);
                }
            });
        })
    );

    queryAll(`#${FIELDS.BANK_DETAIL_METHOD}_grp input[type=radio]`).forEach(el => {
        el.addEventListener('change', event => {
            console.log(`  ===> bank method = ${event.target.id}`, event.target.value);
            let bankCountry = getById(FIELDS.BANK_COUNTRY);
            let bankCurrency = getById(FIELDS.BANK_CURRENCY);

            switch (event.target.value) {
                case '1': {
                    bankCountry.selectedIndex = bankCountry.querySelector(`option[value="US"]`).index;
                    bankCurrency.selectedIndex = bankCurrency.querySelector(`option[value="USD"]`).index;
                    break;
                }
                case '2': {
                    bankCountry.selectedIndex = -1;
                    bankCurrency.selectedIndex = -1;
                    break;
                }
                default: break;
            }

            validateField({ field: event.target });
            validateField({ field: bankCountry });
            validateField({ field: bankCurrency });
        });
    });

    queryAll(`#${FIELDS.TYPE_OF_ACCOUNT}_grp input[type=radio]`).forEach(el => {
        el.addEventListener('change', event => {
            validateField({ field: event.target });
        });
    });

    getById(FIELDS.IS_BIZ_SMALL).addEventListener('change', event => {
        toggleSmallBizOptions({ show: event.target.checked, scroll: true });
    });

    getById(FIELDS.GHG_EMISSIONS_CALC).addEventListener('change', event => {
        toggleField({
            field: getById(FIELDS.GHG_EMISSION_AMOUNTS),
            required: event.target.checked === true
        });
    });

    getById('submit').addEventListener('mouseup', event => {
        if (confirm('Are you sure you want to submit this data?') === false) {
            return;
        }

        // getFormData();
        let validate = validateForm();
        /* if (validate.fields.length > 0) {
            for (let i = 0, count = validate.fields.length; i < count; i++) {
                let field = getById(validate.fields[i]);
            }
        } */
        if (validate === false) {
            return;
        }
        // return;
        fetch(
            `${window.backendURL}&request_id=${window.vendorRequestData.id}&action=save`,
            {
                method: 'POST',
                body: JSON.stringify(window.vendorRequestData)
            }
        ).then(data => data.json())
        .then(data => {
            if (data.status === true) {
                alert('Vendor Request updated successfully.');
                window.location.href = '//www.osg.com';
            }
            else {
                alert(`An error occured while submitting the data: ${data.message}`);
            }
        });
    });

    getById('reset').addEventListener('mouseup', event => {
        if (confirm('Are you sure you want to reset the form to its previous data?') === false) {
            return;
        }

        populateFormData(window.vendorRequestBackup);
        validateForm();
    });

    populateFormData(window.vendorRequestData);
});