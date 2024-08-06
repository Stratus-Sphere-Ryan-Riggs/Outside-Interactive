<script>
    import Card from "../form/Card.svelte";
</script>

<header>
    <div class="logo"></div>
    <Card notitle compress>
        <span class="form-title">Vendor Onboarding Form</span>
        <span class="form-subtitle">Please fill out all required fields.</span>
        <span class="form-subtitle">If you have any questions or issues completing this form, please contact us at <a href="mailto:vendors@outsideinc.com">vendors@outsideinc.com</a>.</span>
    </Card>
</header>

<style>
    header {
        display: flex;
        flex-direction: column;
        gap: 1rem;
    }
    header > div {
        display: flex;
        flex-direction: row;
        align-items: center;
        justify-content: space-between;
    }
    header > .logo {
        max-height: 22.5vw; 
        height: 10rem;
        background-image: url('https://5678674-sb2.app.netsuite.com/core/media/media.nl?id=724182&c=5678674_SB2&h=ojxlRbsRGTdMghyEc7UmNbcqD9HL7HNgzWAg2dBI7MXT908A&_xt=.svg');
        background-position: center;
        background-repeat: no-repeat;
        margin: 1.75rem 0 0;
    }
    .form-title {
        font-size: 2rem;
        font-weight: 500;
    }
    .form-subtitle {
        font-size: 0.875rem;
        font-weight: 400;
    }
</style>
