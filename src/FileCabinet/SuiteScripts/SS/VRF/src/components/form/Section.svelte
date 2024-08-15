<script>
    export let id = 'section';
    export let title = 'Section Title';
</script>

<section id="{id}">
    <div class="title">{title}</div>
    <div class="fields">
        <slot></slot>
    </div>
</section>

<style>
section {
    display: flex;
    flex-direction: column;
    gap: 28px;
    font-size: 12px;
    scroll-margin-top: 100px;
}
section > .title {
    background-color: var(--blue-interactive);
    opacity: 0.8;
    color: white;
    font-size: 14px;
    font-weight: bold;
    padding: 8px 16px;
}
.fields {
    padding-left: 20px;
    display: flex;
    flex-direction: column;
    gap: 24px;
}
</style>