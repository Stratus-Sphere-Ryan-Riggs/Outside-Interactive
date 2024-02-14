<script>
    import Card from "../form/Card.svelte";
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

<Card {id} {title}>
    <InputFile
        id="{$formFields.W9}"
        label="W-9/W-8"
        on:change={onFileChange}
    />
    <InputFile
        id="{$formFields.CERTIFICATE_OF_INSURANCE}"
        label="Certificate of Insurance"
        on:change={onFileChange}
    />
    <InputFile
        id="{$formFields.SOC_CERTIFICATE}"
        label="SOC"
        on:change={onFileChange}
    />
    <InputFile
        id="{$formFields.DATA_BREACH_REPORT}"
        label="Data Breach Report"
        optional
        on:change={onFileChange}
    />
    <InputFile
        id="{$formFields.OFAC_CHECK}"
        label="OFAC Check"
        on:change={onFileChange}
    />
</Card>
