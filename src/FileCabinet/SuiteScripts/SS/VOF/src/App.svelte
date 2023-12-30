<script>
    import Header from './components/header/Header.svelte';
    import Sidebar from './components/sidebar/Sidebar.svelte';
    import PrimaryInformation from './components/sections/PrimaryInformation.svelte';
    import LegalAddress from './components/sections/LegalAddress.svelte';
    import RemittanceAddress from './components/sections/RemittanceAddress.svelte';
    import AdditionalInfo from './components/sections/AdditionalInfo.svelte';
    import Documents from './components/sections/Documents.svelte';
    import Banking from './components/sections/Banking.svelte';
    import SmallBusiness from './components/sections/SmallBusiness.svelte';
    import Footer from './components/footer/Footer.svelte';

    let isUS = true;
    const onChangeCountry = (e) => {
        console.log(`App onChangeCountry`, e.detail);
        isUS = e.detail.value.toLowerCase() === 'united states';
    };
</script>

<div id="overlay" class="hidden">
    <div class="cv-spinner">
      <span class="spinner"></span>
    </div>
</div>

<Header title="New Vendor Request / Amendment" />

<main>
    <Sidebar />

    <div class="content">
        <span class="reminder">Please ensure all required details are fully completed.</span>
        <div class="sections">
            <PrimaryInformation />
            <LegalAddress on:change-country={onChangeCountry} />
            <RemittanceAddress />
            <AdditionalInfo bind:isUS={isUS} />
            <Documents />
            <Banking />
            <SmallBusiness />
        </div>

        <Footer />
    </div>
</main>

<style>
    main {
        flex: 1;
        display: grid;
        grid-template-columns: 300px 1fr;
        max-width: 1080px;
        width: 70%;
        margin: 0 auto;
        padding-top: 100px;
        background-color: white;
        border-left: 20px solid white;
        border-right: 20px solid white;
    }
    .content {
        display: flex;
        flex-direction: column;
        gap: 20px;
    }
    .sections {
        display: flex;
        flex-direction: column;
        gap: 60px;
    }
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
</style>
