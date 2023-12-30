import { formFields, formValues } from "./pageData";
import { get } from "svelte/store";

export const callZipAPI = (options) => {
    let { zip, country, targets } = options;
    let url = `https://api.zipcodestack.com/v1/search?codes=${zip}&country=${country}&apikey=01HF2K4V0ZH5K535TDJZS1ZVB0`;
    fetch(url)
        .then(data => data.json())
        .then(data => {
            let results = data.results[zip];
            if (!results) { return; }
            if (results.length <= 0) { return; }

            console.log(`callZipAPI zip=${zip}; country=${country}`, results);
            formValues.update(o => {
                o[targets.city] = results[0].city;
                o[targets.state] = results[0].state;
                return o;
            });
        });
};
