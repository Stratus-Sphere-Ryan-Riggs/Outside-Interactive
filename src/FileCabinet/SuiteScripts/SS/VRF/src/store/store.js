import { writable } from "svelte/store";

let wifStore = writable({});
let formFields = writable({
    
});

export {
    wifStore,
    formFields
};