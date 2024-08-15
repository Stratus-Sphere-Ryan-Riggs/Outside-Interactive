<script>
    export let title = '[Title]';
    export let subtitle = '';
    export let visible = false;
    export let id = (new Date()).getTime().toString();
</script>

<div class="card" class:hidden={visible===false} data-id={id}>
    <div class="title">
        <span>{title}</span>
        <span>{subtitle}</span>
    </div>
    <div class="content">
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
        font-size: 1rem;
        font-weight: bold;
        padding: 16px 24px;
        display: flex;
        flex-direction: row;
        align-items: center;
        justify-content: space-between;
    }
    .card > .content {
        font-size: 0.875rem;
        color: #333;
        padding: 24px 24px 40px;
        display: flex;
        flex-direction: column;
        gap: 24px;
    }
</style>