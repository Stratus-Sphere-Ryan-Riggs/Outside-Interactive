<script>
    export let id = "textarea_field";
    export let label = "Text Area Field";
    export let value = "";
    export let optional = false;
    export let visible = true;
    export let wr = '';
    export let cls = '';
    
    import { formFields, formValues } from "../../store/pageData";

    let wrCls = [ 'field' ];
    if (wr) {
        wrCls = wrCls.concat(wr.split(' '));
    }
    /* if (required === false) {
        wrCls.push('optional');
    } */

    let fldCls = [ 'fld' ];
    if (cls) {
        fldCls = fldCls.concat(cls.split(' '));
    }

    $: isChanged = false;
    const onBlur = () => {
        console.log(`  ++ TextArea id=${id} value=${value}`, $formValues[$formFields[id]]);
        isChanged = true;
    };
</script>

<div class="{wrCls.join(' ')}"
    class:optional={optional === true}
    class:hidden={visible === false}
>
    <label for="{id}">{label}</label>
    <textarea id="{id}" class="{fldCls.join(' ')}" on:blur={onBlur} bind:value={value}></textarea>
    <span id="{id}_error" class="field-error"
        class:hidden={isChanged === false || !!value === true || optional === true}>{label} is required.</span>
</div>

<style>
    textarea {
        background-color: white;
        border-radius: 4px;
        padding: 0.75rem 1rem;
        border: 1px solid #DEDEDE;
        font-size: 0.875rem;
        height: 5rem;
    }
</style>