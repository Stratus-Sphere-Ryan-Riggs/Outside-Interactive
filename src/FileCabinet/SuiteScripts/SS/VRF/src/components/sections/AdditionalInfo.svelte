<script>
    import { formFields, formValues } from "../../store/pageData";
    import Section from "../form/Section.svelte";
    import InputText from "../form/InputText.svelte";
    import TextArea from "../form/TextArea.svelte";

    export let id = 'addl_info';
    export let title = 'Additional Information';

    /* let w9 = {};
    export const update = (params) => {
        w9 = {
            optional: params.country.toLowerCase() === "us" ? "F" : "T",
            visible: params.country.toLowerCase() === "us" ? "T" : "F"
        };
    }; */
    // console.log(`ADDITIONAL INFO country`, $formValues[$formFields.COUNTRY]);
    // $: isUS = $formValues[$formFields.COUNTRY].toLowerCase() === 'united states';
    // console.log(`ADDITIONAL INFO isUS = ${isUS}`);
    $: isUS = $formValues[$formFields.REMIT_TO_COUNTRY] === 'United States';
    $: taxId = {
        optional: isUS === false,
        visible: isUS === true
    };
</script>

<Section id="{id}" title="{title}">
    <InputText
        id="{$formFields.TAX_ID}"
        label="Company W-9 Tax ID (US only)"
        cls="w160"
        bind:optional={taxId.optional}
        bind:visible={taxId.visible}
        bind:value={$formValues[$formFields.TAX_ID]}
    />
    <InputText
        id="{$formFields.TAX_ID}"
        label="SSN (US only)"
        cls="w160"
        bind:optional={taxId.optional}
        bind:visible={taxId.visible}
        bind:value={$formValues[$formFields.TAX_ID]}
    />
    <TextArea
        id="{$formFields.TYPICAL_PRODUCTS_SERVICES}"
        label="Typical Products / Services"
        bind:value={$formValues[$formFields.TYPICAL_PRODUCTS_SERVICES]}
    />
    <TextArea
        id="{$formFields.ADDITIONAL_VENDOR_INFO}"
        label="Additional Vendor Information / Instruction"
        bind:value={$formValues[$formFields.ADDITIONAL_VENDOR_INFO]}
    />
</Section>
