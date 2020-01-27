<div class="panel {$$props.class}" 
  class:static-title="{static_title}"
  class:left="{left}"
  class:right="{right}"
  >
  <div class="title-container" class:show="{title_show || static_title}" on:mouseover={onmouseover} on:mouseleave={onmouseleave}>
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
.title-container {
  position: relative;
  padding: 0.5rem;
}
/*.title-container.show {
  transform: translate(0, -100%);
  z-index: 3;
}*/
.panel {
  display: inline-block;
  position: relative;
  margin: 2.0rem 0rem 0rem 0rem;
}


@media (min-width: 768px) { 
  .panel {
    margin: 3.0rem 1.5rem 0rem 1.5rem;
  }
  .title-container {
    position: absolute;
    top: 0;
    left: 0;
    padding: 0.5rem;
    transform: translate(0, 0);
    transition: all 300ms;
    z-index: 1;
  }
  .title-container.show {
    transform: translate(0, -100%);
    z-index: 3;
  }
  .contents {
    box-shadow: 2px 2px 8px rgba(0,0,0,0.1);
    background-color: white;
    border: 1px solid #eee;
  }
}

.static-title {
  margin-top: 5.0rem;
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
