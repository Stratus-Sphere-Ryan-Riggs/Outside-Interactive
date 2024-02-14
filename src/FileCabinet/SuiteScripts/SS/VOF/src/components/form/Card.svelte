<script>
    export let title = '[Title]';
    export let subtitle = '';
    export let id = (new Date()).getTime().toString();
    export let notitle = false;
    export let compress = false;
    
</script>

<div class="card" data-id={id}>
    <div class="title" class:hidden={notitle === true}>
        <span>{title}</span>
        <span>{subtitle}</span>
    </div>
    <div class="content" class:compress={compress === true}>
        <slot />
    </div>
</div>

<style>
    .card {
        width: 100%;
        background-color: white;
        border-radius: 8px;
        margin: 0;
        padding: 0;
        box-shadow: rgba(0, 0, 0, 0.16) 0px 1px 4px;
    }
    .card > .title {
        background-color: rgb(135, 91, 5);
        border-top-left-radius: 8px;
        border-top-right-radius: 8px;
        color: white;
        font-size: 1.125rem;
        font-weight: 500;
        padding: 1rem 2.5rem;
        display: flex;
        flex-direction: row;
        align-items: center;
        justify-content: space-between;
    }
    .card > .content {
        font-size: 0.875rem;
        color: #333;
        padding: 2rem 3rem 3.5rem;
        display: flex;
        flex-direction: column;
        gap: 2rem;
    }
    .card > .content.compress {
        font-size: 0.875rem;
        color: #333;
        padding: 1rem 3rem 1.5rem;
        display: flex;
        flex-direction: column;
        gap: 0.5rem;
    }
</style>