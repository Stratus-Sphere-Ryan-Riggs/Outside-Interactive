<script>
    export let optional = false;
    export let visible = true;
    export let columns = "2";
</script>

<div class="col-{columns}"
    class:optional={optional === true}
    class:hidden={visible === false}
>
    <slot />
</div>

<style>
    .col-2 {
        display: grid;
        grid-template-columns: 1fr 1fr;
        gap: 2rem;
    }
    .col-3 {
        display: grid;
        grid-template-columns: 1fr 1fr 1fr;
        gap: 2rem;
    }
</style>