<script>
    export let id = "rb_field";
    export let label = "Radio";
    export let value = "";
    export let visible = true;
    export let items = [];

    import { createEventDispatcher } from "svelte";
    import { formFields, formValues } from "../../store/pageData";
    const dispatch = createEventDispatcher();

    const onChange = (e) => {
        console.log(`${id} val=${e.target.value}`);
        dispatch('change', {
            value: e.target.value
        });
        
        console.log(`  ++ RadioGroup id=${id} value=${value}`, $formValues);
    };
</script>

<div class="field"
    class:hidden={visible === false}
>
    <label for="{id}_grp">{label}</label>
    <div class="field-rb-grp" id="{id}_grp">
        {#each items as item}
            <div class="field-rb">
                <input type="radio" name="{id}" id="{id}_{item.value}" value="{item.value}"
                    on:change={onChange} checked={value === item.value}
                />
                <label for="{id}_{item.value}">{item.text}</label>
            </div>
        {/each}
    </div>
</div>

<style>
</style>