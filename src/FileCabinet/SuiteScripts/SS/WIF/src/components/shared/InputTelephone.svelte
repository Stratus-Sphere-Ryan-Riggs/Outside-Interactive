<script>
    export let id = "tel_field";
    export let label = "Telephone Field";
    export let value = "";
    export let optional = "F";
    export let cls = '';

    import { createEventDispatcher } from "svelte";
    import { formFields, formValues } from "../../store/pageData";
    const dispatch = createEventDispatcher();

    let wrCls = [ 'field' ];
    if (optional === "T") {
        wrCls.push('optional');
    }

    let fldCls = [ 'fld', 'w120' ];
    if (cls) {
        fldCls = fldCls.concat(cls.split(' '));
    }

    function onBlur() {
        let el = document.getElementById(this.id);
        console.log(`onChange id = ${this.id}, required = ${this.required}`, el['value']);

        dispatch('change', {});

        let errorSpan = document.getElementById(`${this.id}_error`);
        if (errorSpan.classList.contains('hidden') === true) {
            console.log('showing...');
            errorSpan.classList.remove('hidden');
        }

        if (this.optional === "T") {
            console.log('not required...');
            return;
        }

        if (!!el['value'] === true) {
            console.log('hiding...');
            errorSpan.classList.add('hidden');
        }
        
        console.log(`  ++ InputTelephone id=${id} value=${value}`, $formValues);
    }
</script>

<div class="{wrCls.join(' ')}">
    <label for="{id}">{label}</label>
    <input type="tel"
        id="{id}"
        name="{id}"
        class="{fldCls.join(' ')}"
        bind:value="{value}"
        on:blur={onBlur}
    />
    <span id="{id}_error" class="field-error hidden">{label} is required.</span>
</div>

<style>
</style>
