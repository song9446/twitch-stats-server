<div class="modal" bind:this={el} on:keydown={onkeydown} on:mousedown={onmousedown} on:touchstart={ontouchstart}>
  <div class="relative container" bind:this={inner_el}>
    <button class="absolute right-0 top-0 bg-black text-white opacity-75 w-6" on:click={onclick}>X</button>
    <slot></slot>
  </div>
</div>

<style>
  .modal {
    position: fixed;
    z-index: 5000;
    top: 0;
    height: 100vh;
    width: 100vw;
    justify-content: center;
    align-items: center;
    display: flex;
    opacity: 0;
    background-color: #000000dd;
    visibility: hidden;
    transition: visibility 0s, opacity 0.25s ease-out;
  }
  :global(.modal.show) {
    visibility: visible;
    opacity: 1.0;
  }
  .container {
    width: max-content;
    max-width: 100vw;
  }
</style>

<script context="module">
  let elements = {},
      next_id = 0;
  export function show(id) {
    elements[id].classList.add("show");
  }
  export function hide(id) {
    elements[id].classList.remove("show");
  }
</script>

<script>
	import { onMount, onDestroy } from 'svelte';
  let id = next_id++;
  let el, inner_el;
  function ontouchstart(e){
    e.pageX = e.touches[0].pageX;
    e.pageY = e.touches[0].pageY;
    return onmousedown(e);
  }
  function onmousedown(e){
    let x = e.pageX,
      y = e.pageY,
      r = inner_el.getBoundingClientRect();
    console.log(x, r.x, r.width)
    if(x < r.x || x > r.x + r.width || y < r.y || y > r.y+r.height)
      hide(id);
  }
  function onclick(e){
    hide(id);
  }
  function onkeydown(e){
    if(e.keyCode == 27){
      hide(id);
    }
  }
  onMount(async ()=>{
    elements[id] = el;
  });
  onDestroy(()=>{
    elements[id] = undefined;
  });
</script>
