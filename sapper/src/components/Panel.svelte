<div class="{$$props.class} md:p-2 mt-2 mb-2 md:mb-0 border rounded-lg border-gray-600 md:border-none md:rounded-none">
<div class="panel md:bg-white md:border md:shadow w-full" 
  class:left="{left}"
  class:right="{right}"
  >
  <div class="title-container font-bold md:m-4 m-2 text-lg" class:show="{title_show || static_title}" on:mouseover={onmouseover} on:mouseleave={onmouseleave}>
    <slot name="title" >
    </slot>
    {#if tip}
      <Tip>
        <slot name="tip">
        </slot>
      </Tip>
    {/if}
  </div>
  <div class="overflow-hidden w-full h-full relative contents"
     on:mouseover={onmouseover} on:mouseleave={onmouseleave}>
    <slot name="contents">
    </slot>
  </div>
</div>
</div>

<script>
import Tip from './Tip.svelte';

export let tip = false;
export let static_title =false;
export let left =false;
export let right =false;

let title_show = false;
let timer = null;
function onmouseover(e) {
  title_show = true;
  /*  console.log(title_show);
  if(timer) {
    clearTimeout(timer);
    timer = null;
  }
  timer = setTimeout(()=>{
    console.log(title_show);
    title_show = false;
  }, 1000);*/
}

function onmouseleave(e) {
  title_show = false;
}
</script>


<style>
/*.title-container {
  position: relative;
  padding: 0.5rem;
}*/
/*.title-container.show {
  transform: translate(0, -100%);
  z-index: 3;
}*/
/*.panel {
  display: inline-block;
  position: relative;
  height: fit-content;
}*/


@media (min-width: 768px) { 
  .panel {
  }
  .contents {
  }
}

.contents {
  z-index: 2;
  border-radius: 2px;
}
.left {
  margin-left: 0;
}
.right {
  margin-right: 0;
}
</style>
