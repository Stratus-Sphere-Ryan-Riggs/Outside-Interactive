<script>
    import Blurb from "../form/Blurb.svelte";
    import Card from "../form/Card.svelte";
    import InputFile from "../form/InputFile.svelte";

    import { formFields, formValues } from "../../store/pageData";

    export let id = 'documents';
    export let title = 'Documents';

    // $: w9Optional = $formValues[$formFields.REMIT_TO_COUNTRY] !== 'United States';
    // $: w9Visible = !w9Optional;
    // $: insuranceOptional = window['isServiceProvider'] === false;

    const annualSpend = [ '5', '6' ];
    $: isInsuranceOptional = annualSpend.indexOf($formValues[$formFields.ANTICIPATED_ANNUAL_SPEND].toString()) < 0;

    const onFileChange = (e) => {
        let file = e.detail.file;
        console.log(`InputFile >>> selected file = ${file.name}`);

        let formData = new FormData();
        formData.append("file", file);
        fetch(
            `${window['backendURL']}&action=upload&folder=${window['uploadFolder']}`,
            {
                method: 'POST',
                body: formData
            }
        ).then(data => data.json())
        .then(data => {
            console.log(`file upload = ${file.name}; id = ${e.detail.id}`, data);
            if (data.status === true) {
                console.log(`   >>> id = ${data.data.id}`);
                formValues.update(o => {
                    o[e.detail.id] = data.data.id;
                    return o;
                });
                console.log($formValues);
            }
            else {
                alert(`An error occured during file upload: ${data.message}`);
            }
        });
    };
</script>

<Card {id} {title}>
    <Blurb id="blurb_legal_disclaimer">
        <span class="blurb">For US-based vendors and International vendors subject to US taxes, please provide a completed W-9.&nbsp;&nbsp;<a href="https://www.irs.gov/pub/irs-pdf/fw9.pdf" target="_blank">Link to W-9 form</a><br/><br/>For International vendors not subject to taxes in the US, please provide a completed W-8BEN or W-8BEN-E.<br/><a href="https://www.irs.gov/pub/irs-pdf/fw8ben.pdf" target="_blank">Link to W-8BEN form</a> (for individuals)<br/><a href="https://www.irs.gov/pub/irs-pdf/fw8bene.pdf" target="_blank">Link to W-8BEN-E form</a> (for entities/companies)<br/><br/>Please ensure uploaded attachment is completed in its entirety.</span>
    </Blurb>
    <InputFile
        id="{$formFields.W9}"
        label="IRS Tax Form (W-9, W-8 BEN, W-8 BEN-E)"
        on:change={onFileChange}
    />
    <InputFile
        id="{$formFields.CERTIFICATE_OF_INSURANCE}"
        label="Certificate of Insurance"
        bind:optional={isInsuranceOptional}
        on:change={onFileChange}
    />
</Card>
