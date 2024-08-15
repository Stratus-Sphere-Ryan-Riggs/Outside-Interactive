<script>
    export let id = "text_field";
    export let label = "Text Field";
    export let value = "";
    export let maxlength = 80;
    export let optional = false;
    export let optionalLabel = true;
    export let visible = true;
    export let wr = '';
    export let cls = '';

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
    const onBlur = () => {
        console.log(`onChange id = ${id}, required = ${optional}`, value);
        isChanged = true;
        dispatch('change', { value });

        let errorSpan = document.getElementById(`${id}_error`);
        if (errorSpan.classList.contains('hidden') === false) {
            errorSpan.classList.add('hidden');
        }

        if (optional === true) {
            console.log(`${id} is optional...`);
            return;
        }

        if (!!value === false) {
            errorSpan.classList.remove('hidden');
        }
        console.log(`  ++ InputText id=${id} value=${value}`, $formValues);
    }
</script>

<div class="{wrCls.join(' ')}"
    class:optional={optional === true}
    class:optional-no-label={optionalLabel === false}
    class:hidden={visible === false}
>
    <label for="{id}">{label}</label>
    <input type="text"
        id="{id}"
        name="{id}"
        class="{fldCls.join(' ')}"
        bind:value="{value}"
        maxlength="{maxlength}"
        on:blur="{onBlur}"
    />
    <span id="{id}_error" class="field-error"
        class:hidden={isChanged === false || !!value === true || optional === true}>{label} is required.</span>
</div>

<style>
    /* input[type=text] {
        ** width: 400px; **
        background-color: white;
        border-radius: 4px;
        padding: 0.75rem 1rem;
        border: 1px solid #DEDEDE;
        font-size: 0.875rem;
    } */
</style>