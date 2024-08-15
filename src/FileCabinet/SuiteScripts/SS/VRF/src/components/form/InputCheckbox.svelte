<script>
    export let id = "cb_field";
    export let label = "Checkbox";
    export let checked;
    export let required = false;
    export let visible = true;
    export let wr = '';

    import { createEventDispatcher } from "svelte";
    import { formFields, formValues } from "../../store/pageData";
    const dispatch = createEventDispatcher();

    let wrCls = [ 'field-cb' ];
    if (wr) {
        wrCls = wrCls.concat(wr.split(' '));
    }

    const onChange = () => {
        // let el = document.getElementById(id);
        // console.log(`onChange id = ${id}`, el);
        console.log(`onChange id = ${id}`, `checked = ${checked}`);
        // checked = el['checked'];

        dispatch('change', {
            id,
            value: checked
            // value: el['checked']
        });
        
        console.log(`  ++ InputCheckbox id=${id} checked=${checked}`, $formValues);
    };

    /* export const update = (params) => {
        // optional = params ? params.optional : "F";
        visible = params ? params.visible : "T";

        wrCls = [ 'field-cb' ];
        /* if (optional === "T") {
            wrCls.push('optional');
        } */
        if (visible === false) {
            wrCls.push('hidden');
        }
        if (wr) {
            wrCls = wrCls.concat(wr.split(' '));
        }

        /* fldCls = [ 'fld' ];
        if (cls) {
            fldCls = fldCls.concat(cls.split(' '));
        } *
    };
    
    update(); */
</script>

<div class="{wrCls.join(' ')}">
    <input type="checkbox" name="{id}" id="{id}"
        class="fld"
        bind:checked={checked}
        on:change={onChange}>
    <label for="{id}" class:required={required === true}>{label}</label>
</div>

<style>
    .field-cb {
        display: flex;
        align-items: center;
        box-sizing: border-box;
    }
    .field-cb label {
        font-size: 0.875rem;
        padding: 0 4px;
        cursor: pointer;
        display: flex;
    }
    .field-cb label.required {
        font-weight: bold;
    }
    .field-cb input {
        cursor: pointer;
        opacity: 0;
        position: absolute;
    }
    .field-cb label::before {
        content: '';
        width: 1.25rem;
        height: 1.25rem;
        border-radius: 2px;
        margin-right: 1.125rem;
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