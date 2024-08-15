<script>
    export let id = "cb_field";
    export let label = "Checkbox";
    export let checked = false;
    export let visible = false;
    export let wr = '';

    import { createEventDispatcher } from "svelte";
    const dispatch = createEventDispatcher();

    let wrCls = [ 'field-cb' ];
    if (wr) {
        wrCls = wrCls.concat(wr.split(' '));
    }

    const onChange = () => {
        console.log(`onChange id = ${id}`, `checked = ${checked}`);

        dispatch('change', {
            id,
            value: checked
        });
        
        // console.log(`  ++ InputCheckbox id=${id} checked=${checked}`, $formValues);
    };

    /* export const update = (params) => {
        // optional = params ? params.optional : "F";
        visible = params ? params.visible : "T";

        wrCls = [ 'field-cb' ];
        /* if (optional === "T") {
            wrCls.push('optional');
        } */
        /* if (visible === false) {
            wrCls.push('hidden');
        }
        else {
            wrCls = wrCls.filter(c => c !== 'hidden');
        }

        if (wr) {
            wrCls = wrCls.concat(wr.split(' '));
        } */

        /* fldCls = [ 'fld' ];
        if (cls) {
            fldCls = fldCls.concat(cls.split(' '));
        } *
    };
    
    update(); */
</script>

<div class="field-cb" class:hidden={visible===false}>
    <input type="checkbox" name="{id}" id="{id}" class="fld" bind:checked={checked} on:change={onChange}>
    <label for="{id}">{label}</label>
</div>

<style>
    .field-cb {
        display: flex;
        align-items: center;
        box-sizing: border-box;
    }
    .field-cb label {
        font-size: 0.875rem;
        padding: 0 2px;
        cursor: pointer;
        display: flex;
        align-items: center;
    }
    .field-cb input {
        cursor: pointer;
        opacity: 0;
        position: absolute;
    }
    .field-cb label::before {
        content: '';
        width: 18px;
        height: 18px;
        border-radius: 4px;
        margin-right: 12px;
        padding: 4px;
        /* margin-top: 0px; */
        border: .05em solid var(--gray-lite-1);
    }
    .field-cb label:hover::before,
    .field-cb input:hover + label::before {
        background-color: var(--gray-lite-1);
    }
    .field-cb input:checked + label::before {
        content: '\002714';
        background-color: var(--brown-interactive);
        display: flex;
        justify-content: center;
        align-items: center;
        color: white;
    }
</style>