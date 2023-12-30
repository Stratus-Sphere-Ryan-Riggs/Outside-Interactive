<script>
    export let title = 'Title';
</script>

<header>
    <div class="container">
        <!-- <img
            decoding="async" loading="lazy" width="94" height="50"
            alt="osg-logo" title="osg-logo" class="wp-image-835"
            src="https://www.osg.com/wp-content/uploads/2023/03/osg-logo.png"> -->
        <span class="title">{title}</span>
    </div>
</header>

<style>
    header {
        flex: 0;
        padding-top: 16px;
        padding-bottom: 16px;
        position: fixed;
        top: 0 !important;
        left: 0 !important;
        right: 0 !important;
        border-bottom: 1px solid rgba(0, 0, 0, 0.24);
        box-shadow: rgba(0, 0, 0, 0.15) 1.95px 1.95px 2.6px;
        background-color: white;
        z-index: 5000;
    }
    header > div {
        display: flex;
        flex-direction: row;
        align-items: center;
        justify-content: space-between;
    }
    header span.title {
        font-size: 24px;
        font-weight: bold;
        color: var(--blue-interactive);
    }
</style>
