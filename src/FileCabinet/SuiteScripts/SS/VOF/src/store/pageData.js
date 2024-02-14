import { readable, writable } from "svelte/store";

export const countryStates = readable(window['stateCountryData']);
export const currencies = readable(window['currencyData']);
export const formFields = readable(window['fieldData']);
export const formValues = writable(window['vendorRequestData']);
export const taxClassifications = readable(window['taxClassifications']);

console.log('vendorRequestData', window['vendorRequestData']);

export const updateRemittance = () => {
};
