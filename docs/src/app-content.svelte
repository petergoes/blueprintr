<svelte:options tag="app-content" />

<style>
:host {
  display: block;
}

div {
  max-width: 72ch;
  margin: 0 auto;
}
</style>

<div>
  <slot></slot>
</div>