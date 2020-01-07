<script>
  import Navigation from "../components/Navigation.svelte";

	export let segment;
</script>

<Navigation {segment} />

<div class="flex flex-col items-center m-auto container">
  <slot></slot>
</div>
