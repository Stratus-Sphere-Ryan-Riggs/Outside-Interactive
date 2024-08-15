<script>
    export let id = "text_field";
    export let label = "Text Field";
    export let value = "";
    export let optional = false;
    export let visible = true;
    export let cls = '';

    import { createEventDispatcher } from "svelte";
    import { formValues } from "../../store/pageData";
    const dispatch = createEventDispatcher();

    let wrCls = [ 'field' ];
    if (optional === true) {
        wrCls.push('optional');
    }

    let fldCls = [ 'fld', 'file' ];
    if (cls) {
        fldCls = fldCls.concat(cls.split(' '));
    }

    $: isChanged = false;
    const onChange = (e) => {
        /* let errorSpan = document.getElementById(`${id}_error`);
        if (errorSpan.classList.contains('hidden') === false) {
            errorSpan.classList.add('hidden');
        }

        if (optional === true) {
            return;
        }

        if(e.target.files.length <= 0) {
            errorSpan.classList.remove('hidden');
            return;
        } */

        isChanged = true;
        dispatch('change', {
            id,
            file: e.target.files[0]
        });

        /* if (!!value === true) {
            errorSpan.classList.add('hidden');
        } */
        console.log(`  ++ InputFile id=${id} value=${value}`, $formValues);
    };
</script>

<div class="{wrCls.join(' ')}"
    class:optional={optional === true}
    class:hidden={visible === false}
>
    <label for="{id}">{label}</label>
    <input type="file"
        id="{id}"
        name="{id}"
        class="{fldCls.join(' ')}"
        value="{value}"
        on:change={onChange}
    />
    <span id="{id}_error" class="field-error"
        class:hidden={isChanged === false || !!value === true || optional === true}>{label} is required.</span>
</div>

<style>
    input[type=file] {
        /* width: 400px; */
        background-color: white;
        border-radius: 4px;
        padding: 0.75rem 1rem;
        border: 1px solid #DEDEDE;
        font-size: 0.875rem;
    }
</style>