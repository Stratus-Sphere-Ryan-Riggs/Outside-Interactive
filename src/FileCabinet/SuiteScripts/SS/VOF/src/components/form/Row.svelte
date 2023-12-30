<script>
    export let optional = false;
    export let visible = true;
</script>

<div class="col-2"
    class:optional={optional === true}
    class:hidden={visible === false}
>
    <slot />
</div>

<style>
    .col-2 {
        display: grid;
        grid-template-columns: 1fr 1fr;
    }
</style>