<script>
    import { createEventDispatcher } from "svelte";
    const dispatch = createEventDispatcher();

    export let label = "Button";
    export let id = "button_id";
    // export let visible = false;
    export let submit = false;

    let btnClassList = [];
    /* if (visible === false && btnClassList.indexOf('hidden') < 0) {
        btnClassList.push('hidden');
    }
    if (visible === true && btnClassList.indexOf('hidden') >= 0) {
        btnClassList = btnClassList.filter(c => c !== 'hidden');
    } */

    if (submit === true && btnClassList.indexOf('submit') < 0) {
        btnClassList.push('submit');
    }
    $: btnClass = btnClassList.join(' ');

    const onButtonClick = (e) => {
        dispatch('click', {
            id
        });
    };
</script>

<button type="button" data-id="btn_{id}" class={btnClass} on:click={onButtonClick}>{label}</button>

<style>
    button {
        padding: 12px 24px;
        background-color: white;
        color: var(--gray-text-1);
        border-radius: 4px;
        border: 0;
        cursor: pointer;
        font-size: 0.875rem;
        opacity: 0.9;
        transition: all 100ms ease-in-out;
        background-color: white;
        box-shadow: rgba(0, 0, 0, 0.16) 0px 1px 4px;
    }
    button:hover {
        box-shadow: rgba(0, 0, 0, 0.1) 0px 4px 12px;
        opacity: 1;
    }
    .submit {
        background-color: var(--brown-interactive);
        color: white;
    }
</style>