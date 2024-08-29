import { writable } from "svelte/store";

let requestData = writable({});

function createStore() {
    let initialValue = {};
    const { subscribe, update, set } = writable(initialValue);

    return {
        subscribe,

        init() {
            requestData.set(window['requestData']);
        }
    }
}

export default createStore();
