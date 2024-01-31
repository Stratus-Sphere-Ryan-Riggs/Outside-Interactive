<script>
    export let title = '[Title]';
</script>

<div class="card">
    <div class="title">Select Currency</div>
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
    }
    .card > * {
        padding: 12px 18px;
    }
    .card > .title {
        background-color: rgb(135, 91, 5);
        border-top-left-radius: 8px;
        border-top-right-radius: 8px;
        color: white;
        font-size: 1rem;
        font-weight: bold;
    }
    .card > .content {
        font-size: 0.875rem;
        color: #333;
    }
</style>