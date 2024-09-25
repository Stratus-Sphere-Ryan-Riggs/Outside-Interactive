import { readable, writable } from "svelte/store";

export const countryStates = readable(window['stateCountryData']);
export const stateList = writable([]);
export const currencies = readable(window['currencyData']);
export const formFields = readable(window['fieldData']);
export const formValues = writable(window['requestData']);
export const dropdownData = readable(window['dropdownData']);
export const productsRefunded = readable(window['productsRefunded']);
export const refundReasons = readable(window['refundReasons']);
export const refundMethod = writable('2');
export const selectedCountry = writable('');
export const selectedCurrency = writable('');
// export const radioData = readable(window['radioGroupData']);

console.log('requestData', window['requestData']);

export const updateRemittance = () => {
};
