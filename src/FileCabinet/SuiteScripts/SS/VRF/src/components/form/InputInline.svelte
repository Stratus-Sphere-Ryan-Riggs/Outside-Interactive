<script>
    export let id = "inline_field";
    export let label = "Inline Field";
    export let value = "";
    export let optional = false;
    export let visible = true;
    export let wr = '';
    export let cls = '';

    import { formFields, formValues } from "../../store/pageData";

    let wrCls = [ 'field', 'inline' ];
    if (wr) {
        wrCls = wrCls.concat(wr.split(' '));
    }

    let fldCls = [ 'fld' ];
    if (cls) {
        fldCls = fldCls.concat(cls.split(' '));
    }
</script>

<div class="{wrCls.join(' ')}"
    class:hidden={visible === false}
>
    <label for="{id}">{label}</label>
    <span class="content" id="{id}">{value}</span>
</div>

<style>
</style>