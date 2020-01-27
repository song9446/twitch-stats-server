<div class="relative inline-block align-top" on:mouseover={mouseover} on:mouseout={mouseout} on:click={click} on:touchstart={click} class:cursor-pointer={click}>
  <div class="absolute ml-6 tooltip-arrow bg-black text-white text-xs opacity-75 p-2" class:hidden={!mouse_overed}>
    <slot></slot>
  </div>
  <svg area-hidden="true" role="img" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 {faQuestion.icon[0]} {faQuestion.icon[1]}" class="w-4 h-4 -mt-1 overflow-visible inline-block">
    <path fill="currentColor" d="{faQuestion.icon[4]}"/>
  </svg>
</div>

<style>
.tooltip-arrow {
  box-shadow: 0 3px 6px rgba(0, 0, 0, 0.1);
  z-index: 500;
  width: max-content;
}
.tooltip-arrow::before {
  content: "";
  position: absolute;
  top: 0.4rem;
  right: 100%;
  border-width: 6px;
  border-style: solid;
  border-color: transparent #000 transparent transparent;
}
.tooltip-arrow::after {
  content: "";
  position: absolute;
  top: calc(0.4rem + 1px);
  right: calc(100% - 1px); 
  border-width: 5px;
  border-style: solid;
  border-color: transparent #000 transparent transparent;
}
</style>

<script>
import { faQuestion as faQuestion } from '@fortawesome/free-solid-svg-icons/faQuestion'
let mouse_overed = false;
function mouseover(){
  mouse_overed = true;
}
function mouseout(){
  mouse_overed = false;
}
export let click = null;
</script>
