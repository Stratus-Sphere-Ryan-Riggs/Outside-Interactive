<script>
    import Card from "../form/Card.svelte";

    export let title = 'Title';
</script>

<header>
    <div class="logo"></div>
    <Card notitle compress>
        <span class="form-title">Vendor Onboarding Form</span>
        <span class="form-subtitle">Please fill out all required fields.</span>
    </Card>
    <!-- <div class="container"> -->
        <!-- <img
            decoding="async" loading="lazy" width="94" height="50"
            alt="osg-logo" title="osg-logo" class="wp-image-835"
            src="https://www.osg.com/wp-content/uploads/2023/03/osg-logo.png"> -->
        <!-- <span class="title">{title}</span> -->
    <!-- </div> -->
</header>

<style>
    header {
        display: flex;
        flex-direction: column;
        gap: 1rem;
        /* flex: 0;
        padding-top: 16px;
        padding-bottom: 16px;
        position: fixed;
        top: 0 !important;
        left: 0 !important;
        right: 0 !important;
        border-bottom: 1px solid rgba(0, 0, 0, 0.24);
        box-shadow: rgba(0, 0, 0, 0.15) 1.95px 1.95px 2.6px;
        background-color: white;
        z-index: 5000; */
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
        background-image: url(https://lh5.googleusercontent.com/AeQ5LXLqUSrfgyUYm9E1KpFesERFeR9sm3NzR5j31TaQB0J4DTBRdVHDHrgL_VC2oSaHIu7ozCOCO59d0cKJQM_Y12L071EfBi_c0TAZzr2We0YC_nGbGwdaftczmrW46w=w1496);
        background-size: cover;
        background-position: center;
        border: 1px solid rgb(218, 220, 224);
        border-radius: 0.5rem;
        margin-top: 0.75rem;
    }
    /* header span.title {
        font-size: 24px;
        font-weight: bold;
        color: var(--blue-interactive);
    } */
    .form-title {
        font-size: 2rem;
        font-weight: 500;
    }
    .form-subtitle {
        font-size: 0.875rem;
        font-weight: 400;
    }
</style>
