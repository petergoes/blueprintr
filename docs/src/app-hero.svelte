<svelte:options tag="app-hero" />

<script>
	export let title = 'Blueprintr';
</script>

<style>
:host {
  display: flex;
  min-height: 50vh;
  justify-content: center;
  align-items: center;
}

h1 {
  margin: 0;
}
</style>


<header>
  <h1>
    <slot name="title"></slot>
  </h1>
</header>