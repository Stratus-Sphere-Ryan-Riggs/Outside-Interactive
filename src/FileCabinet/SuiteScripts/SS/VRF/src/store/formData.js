import { writable } from "svelte/store";

let vendorRequestData = writable({});

function createStore() {
    let initialValue = {};
    const { subscribe, update, set } = writable(initialValue);

    return {
        subscribe,

        init() {
            vendorRequestData.set(window['vendorRequestData']);
        }
    }
}

export default createStore();
