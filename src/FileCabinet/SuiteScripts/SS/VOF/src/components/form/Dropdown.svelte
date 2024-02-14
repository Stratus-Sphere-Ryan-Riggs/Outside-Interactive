<script>
    export let id = "dd_field";
    export let label = "Dropdown";
    export let optional = false;
    export let visible = true;
    export let value = "";
    export let wr = '';
    export let cls = '';
    export let items = [];

    import { createEventDispatcher } from "svelte";
    import { formFields, formValues } from "../../store/pageData";
    const dispatch = createEventDispatcher();

    let wrCls = [ 'field' ];
    if (wr) {
        wrCls = wrCls.concat(wr.split(' '));
    }
    
    let fldCls = [ 'fld' ];
    if (cls) {
        fldCls = fldCls.concat(cls.split(' '));
    }

    $: isChanged = false;
    /* const validate = () => {
        let el = document.getElementById(id);
        console.log(`onChange id = ${id}, optional = ${optional}`, el['value']);

        let errorSpan = document.getElementById(`${id}_error`);
        if (errorSpan.classList.contains('hidden') === true) {
            console.log(`${id} showing...`);
            errorSpan.classList.remove('hidden');
        }

        if (optional === true) {
            console.log('not required...');
            return;
        }

        if (el['selectedIndex'] > 0) {
            console.log(`${id} hiding...`);
            errorSpan.classList.add('hidden');
        }

        console.log(`  ++ Dropdown id=${id} value=${value}`, $formValues);
    }; */

    const onChange = () => {
        let el = document.getElementById(id);
        console.log(`onChange id = ${id}, optional = ${optional}`, el['value']);

        isChanged = true;
        dispatch('change', {
            id,
            value: el['value']
        });

        // validate();
    };
</script>

<div class="{wrCls.join(' ')}"
    class:optional={optional === true}
    class:hidden={visible === false}
>
    <label for="{id}">{label}</label>
    <select id="{id}" class="{fldCls.join(' ')}" on:change={onChange} bind:value={value}>
        {#each items as item}
            <!-- <option value="{item.value}" selected={item.value === value || item.text === value}>{item.text}</option> -->
            <!-- <option value="{item.text}" selected={item.text === value}>{item.text}</option> -->
            <option value="{item.text}">{item.text}</option>
        {/each}
    </select>
    <span id="{id}_error" class="field-error"
        class:hidden={isChanged === false || !!value === true || optional === true}>{label} is required.</span>
</div>

<style>
    select {
        background-color: white;
        border-radius: 4px;
        padding: 0.75rem 1rem;
        border: 1px solid #DEDEDE;
        font-size: 0.875rem;
    }
</style>