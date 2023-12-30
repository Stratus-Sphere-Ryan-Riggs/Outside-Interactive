<script>
    import Section from "../form/Section.svelte";
    import InputCheckbox from "../form/InputCheckbox.svelte";
    import InputText from "../form/InputText.svelte";

    import { formFields, formValues } from "../../store/pageData";

    export let id = 'small_business';
    export let title = 'Small Business Categories';

    $: isSmallBiz = !!$formValues[$formFields.IS_BIZ_SMALL];
    $: isNotSmallBiz = !(!!isSmallBiz);
    console.log(`isSmallBiz = ${!!isSmallBiz}`, $formValues);

    const onChangeSmallBiz = (e) => {
        console.log(`onChangeSmallBiz value = ${e.detail.value}`);
        isSmallBiz = e.detail.value;
        formValues.update(o => {
            o[$formFields.IS_BIZ_SMALL] = e.detail.value;
            return o;
        });

        document.querySelectorAll('.small_biz_opt').forEach(el => {
            console.log(el);
            if (el.classList.contains('hidden') === false) {
                console.log(`adding hidden class from ${el.id}`);
                el.classList.add('hidden');
            }

            if (e.detail.value === true && el.classList.contains('hidden') === true) {
                console.log(`removing hidden class from ${el.id}`);
                el.classList.remove('hidden');
            }
        });
    };
    onChangeSmallBiz({
        detail: { value: !!$formValues[$formFields.IS_BIZ_SMALL] }
    });

    $: isGHGOptional = $formValues[$formFields.GHG_EMISSIONS_CALC] === false;
    const onChangeGHG = (e) => {
        console.log(`onChangeGHG value = ${e.detail.value}`);
        isGHGOptional = e.detail.value === false;
        /* ghgAmounts.update({
            optional: e.detail.value === true ? "F" : "T",
            visible: e.detail.value === true ? "T" : "F"
        }); */
        /* document.querySelectorAll('.ghg').forEach(el => {
            if (el.classList.contains('hidden') === false) {
                el.classList.add('hidden');
                el.classList.add('optional');
            }
            if (e.detail.value === true && el.classList.contains('hidden') === true) {
                el.classList.remove('hidden');
                el.classList.remove('optional');
            }
        }); */
    };
</script>

<Section id="{id}" title="{title}">
    <InputCheckbox
        id="{$formFields.IS_BIZ_SMALL}"
        label="Small Business?"
        bind:checked={$formValues[$formFields.IS_BIZ_SMALL]}
        on:change={onChangeSmallBiz}
    />

    <div class="small_biz_opt"
        class:hidden={isNotSmallBiz}
    >
        <InputText
            id="{$formFields.NAICS_CODE}"
            label="NAICS Code"
            cls="w120"
            bind:optional={isNotSmallBiz}
            bind:value={$formValues[$formFields.NAICS_CODE]}
            />
        <InputText
            id="{$formFields.REVENUE}"
            label="Revenue"
            cls="w120"
            bind:optional={isNotSmallBiz}
            bind:value={$formValues[$formFields.REVENUE]}
        />
        <InputText
            id="{$formFields.NUMBER_OF_EMPLOYEES}"
            label="Number of Employees"
            cls="w120"
            bind:optional={isNotSmallBiz}
            bind:value={$formValues[$formFields.NUMBER_OF_EMPLOYEES]}
        />

        <InputCheckbox
            id="{$formFields.IS_BIZ_WOMEN_OWNED}"
            label="Women-owned Business?"
            bind:checked={$formValues[$formFields.IS_BIZ_WOMEN_OWNED]}
        />
        <InputCheckbox
            id="{$formFields.IS_BIZ_VETERAN_OWNED}"
            label="Veteran-owned Business?"
            bind:checked={$formValues[$formFields.IS_BIZ_VETERAN_OWNED]}
        />
        <InputCheckbox
            id="{$formFields.IS_BIZ_SMALL_HUBZONE}"
            label="HubZone Small Business?"
            bind:checked={$formValues[$formFields.IS_BIZ_SMALL_HUBZONE]}
        />
        <InputCheckbox
            id="{$formFields.IS_BIZ_SMALL_VET_DISABLED}"
            label="Service-Disabled Veteran-Owned Small Business?"
            bind:checked={$formValues[$formFields.IS_BIZ_SMALL_VET_DISABLED]}
        />
        <InputCheckbox
            id="{$formFields.AFFIRMATIVE_ACTION_ACK}"
            label="Affirmative Action Acknowledge?"
            bind:checked={$formValues[$formFields.AFFIRMATIVE_ACTION_ACK]}
        />
        <InputCheckbox
            id="{$formFields.IS_BIZ_SMALL_MINORITY}"
            label="Minority-Owned Small Business?"
            bind:checked={$formValues[$formFields.IS_BIZ_SMALL_MINORITY]}
        />

        <InputCheckbox
            id="{$formFields.GHG_EMISSIONS_CALC}"
            label="GHG Emissions Calculated?"
            bind:checked={$formValues[$formFields.GHG_EMISSIONS_CALC]}
            on:change={onChangeGHG}
        />
        <InputText
            id="{$formFields.GHG_EMISSION_AMOUNTS}"
            label="GHG Emission Amounts"
            cls="w80"
            bind:optional={isGHGOptional}
            bind:visible={$formValues[$formFields.GHG_EMISSIONS_CALC]}
            bind:value={$formValues[$formFields.GHG_EMISSION_AMOUNTS]}
        />
        <InputCheckbox
            id="{$formFields.GHG_EMISSIONS_AUDITED}"
            label="GHG Emissions Audited?"
            bind:checked={$formValues[$formFields.GHG_EMISSIONS_AUDITED]}
        />

        <InputCheckbox
            id="{$formFields.ANTI_HUMAN_TRAF_POLICY}"
            label="Anti-Human Trafficking Policy?"
            bind:checked={$formValues[$formFields.ANTI_HUMAN_TRAF_POLICY]}
        />
        <InputCheckbox
            id="{$formFields.HAS_SUSTAINABILITY_REPORT}"
            label="Sustainability Report Available?"
            bind:checked={$formValues[$formFields.HAS_SUSTAINABILITY_REPORT]}
        />
        <InputCheckbox
            id="{$formFields.ANTI_BRIBERY_POLICY}"
            label="Anti-Bribery and Anti-Corruption Policy?"
            bind:checked={$formValues[$formFields.ANTI_BRIBERY_POLICY]}
        />
    </div>
</Section>

<style>
    .small_biz_opt {
        display: flex;
        flex-direction: column;
        gap: 28px;
    }
</style>