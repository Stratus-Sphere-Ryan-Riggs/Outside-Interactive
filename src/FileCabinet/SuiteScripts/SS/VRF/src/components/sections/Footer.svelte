<script>
    import { createEventDispatcher, onMount } from "svelte";
    import Button from "../shared/Button.svelte";

    const dispatch = createEventDispatcher();
    export let step = 0;
    export let max = 1;

    $: isNotFirst = step > 0 && max > 1;
    $: isLast = step === (max - 1);
    $: isNotLast = isLast === false && max > 1;
    
    console.log('Footer', `step = ${step}; max = ${max}`);
    console.log('Footer', `isNotFirst = ${isNotFirst}; isLast = ${isLast}; isNotLast = ${isNotLast}`);

    const onButtonClick = (e) => {
        console.log('Footer', e.detail.id);
        dispatch('click', {
            value: e.detail.id
        });

        switch (e.detail.id) {
            case 'back': {
                if (--step < 0) { step = 0; }
                break;
            }
            case 'next': {
                if (++step >= max) { step = max - 1; }
                break;
            }
        }
        step = step;
        console.log('Footer', `step = ${step}; max = ${max}`);
        console.log('Footer', `isNotFirst = ${isNotFirst}; isLast = ${isLast}; isNotLast = ${isNotLast}`);
    };
</script>

<div class="buttons">
    <div class="left">
        <Button id="back" label="Back" bind:visible={isNotFirst} on:click={onButtonClick}/>
        <Button id="clear" label="Clear" on:click={onButtonClick} />
    </div>
    <div class="right">
        <Button id="next" label="Next" bind:visible={isNotLast} on:click={onButtonClick} />
        <Button id="submit" label="Submit" bind:visible={isLast} submit on:click={onButtonClick} />
    </div>
</div>

<style>
    .buttons, .left, .right {
        display: flex;
        flex-direction: row;
        align-items: center;
    }
    .buttons {
        justify-content: space-between;
    }
    .left, .right {
        gap: 12px;
    }
</style>