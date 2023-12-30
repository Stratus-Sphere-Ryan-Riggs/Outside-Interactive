<script>
    import Section from "../form/Section.svelte";
    import InputFile from "../form/InputFile.svelte";

    import { formFields, formValues } from "../../store/pageData";

    export let id = 'documents';
    export let title = 'Documents';

    $: w9Optional = $formValues[$formFields.REMIT_TO_COUNTRY] !== 'United States';
    $: w9Visible = !w9Optional;
    $: insuranceOptional = window['isServiceProvider'] === false;

    const onFileChange = (e) => {
        let file = e.detail.file;
        console.log(`InputFile >>> selected file = ${file.name}`);

        let formData = new FormData();
        formData.append("file", file);
        fetch(
            `${window['backendURL']}&action=upload`,
            {
                method: 'POST',
                body: formData
            }
        ).then(data => data.json())
        .then(data => {
            console.log(`file upload = ${file.name}; id = ${e.detail.id}`, data);
            if (data.status === true) {
                formValues.update(o => {
                    o[e.detail.id] = data.file.id;
                    return o;
                });
            }
            else {
                alert(`An error occured during file upload: ${data.message}`);
            }
        });
    };
</script>

<Section id="{id}" title="{title}">
    <InputFile
        id="custrecord_vr_w9"
        label="W-9"
        bind:optional={w9Optional}
        bind:visible={w9Visible}
        on:change={onFileChange}
    />
    <InputFile
        id="custrecord_vr_certofinsurance"
        label="Certificate of Insurance"
        bind:optional={insuranceOptional}
        on:change={onFileChange}
    />
    <InputFile
        id="custrecord_signed_tc"
        label="Terms & Conditions"
        optional
        on:change={onFileChange}
    />
</Section>
