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
