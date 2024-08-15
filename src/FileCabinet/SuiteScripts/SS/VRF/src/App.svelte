<script>
    import Banking from './components/sections/Banking.svelte';
    import Button from './components/form/Button.svelte';
    import Documents from './components/sections/Documents.svelte';
    import Header from './components/header/Header.svelte';
    import PrimaryInformation from './components/sections/PrimaryInformation.svelte';
    import NameAndAddress from './components/sections/NameAndAddress.svelte';
    import Footer from './components/footer/Footer.svelte';
    import LegalDisclaimer from './components/sections/LegalDisclaimer.svelte';

    let isUS = true;
    $: country = '';
    const onChangeCountry = (e) => {
        console.log(`App onChangeCountry`, e.detail);
        country = e.detail.value.toLowerCase();
        console.log('country', country);
        // isUS = country === 'united states';
    };
</script>

<div id="overlay" class="hidden">
    <div class="cv-spinner">
      <span class="spinner"></span>
    </div>
</div>

<main>
    <div class="sections">
        <Header />
        <PrimaryInformation title="Vendor Information" />
        <!-- <NameAndAddress title="Name and Address" /> -->
        <!-- <Documents title="Documents" /> -->
        <!-- <Banking title="Banking Information" /> -->
        <!-- <LegalDisclaimer title="Legal Disclaimer" /> -->
    </div>

    <Footer />
</main>

<style>
    main {
        display: flex;
        flex-direction: column;
        gap: 32px;
        /* flex: 1; */
        /* display: grid;
        grid-template-columns: 300px 1fr; */
        max-width: 720px;
        min-width: 480px;
        width: 50%;
        margin: 0 auto;
        padding-bottom: 4rem;
        /* padding-top: 100px; */
        /* border-left: 1px solid white; */
        /* border-right: 1px solid white; */

        /* flex: 1;
        display: grid;
        grid-template-columns: 300px 1fr;
        max-width: 1080px;
        width: 70%;
        margin: 0 auto;
        padding-top: 100px;
        background-color: white;
        border-left: 20px solid white;
        border-right: 20px solid white; */
    }
    .sections {
        display: flex;
        flex-direction: column;
        gap: 1rem;
    }
    /* .content {
        display: flex;
        flex-direction: column;
        gap: 20px;
    }
    .sections {
        display: flex;
        flex-direction: column;
        gap: 60px;
    } */
    #overlay{	
        position: fixed;
        top: 0;
        z-index: 100;
        width: 100%;
        height:100%;
        background: rgba(0,0,0,0.6);
    }
    .cv-spinner {
        height: 100%;
        display: flex;
        justify-content: center;
        align-items: center;  
    }
    .spinner {
        width: 40px;
        height: 40px;
        border: 4px #ddd solid;
        border-top: 4px #2e93e6 solid;
        border-radius: 50%;
        animation: sp-anime 0.8s infinite linear;
    }
    @keyframes sp-anime {
        100% { 
            transform: rotate(360deg); 
        }
    }
    .buttons, .left, .right {
        display: flex;
        flex-direction: row;
        align-items: center;
    }
    .buttons {
        justify-content: space-between;
    }
    .buttons .left, .buttons .right {
        gap: 12px;
    }
</style>
