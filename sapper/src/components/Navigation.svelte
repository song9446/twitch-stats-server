<script>
import StreamerAutoComplete from "./StreamerAutoComplete.svelte";
const pages = [
    {segment: "map", name: "지도"},
    /*{segment: "straw", name: "빨대"},*/
  ];

export let segment;

function on_streamer_search(target) {
  window.location.pathname = "/streamer/" + target.id;
}
</script>

<nav class="bg-white w-full relative z-40" role="navigation">
  <div class="container flex flex-row flex-wrap justify-between items-center m-auto">
    <div class="flex flex-row items-center flex-wrap">
      <div class="ml-4">
        <a href="/" class="text-xl font-bold tracking-wider title"> 트수 gg </a>
      </div> 
      <div class="flex overflow-hidden">
        {#each pages as page}
          <a class="py-3 ml-6 -mb-px no-underline border-b-3 text-sm border-transparent {segment === page.segment? 'border-primary-600 text-primary-600' : ''}" href="/{page.segment}" 
            class:current-link="{segment === page.segment}">
            {page.name}</a> 
        {/each}
      </div>
      <div class="flex items-center -mb-px border-b-3 border-transparent {"streamer" === segment? 'border-primary-600 text-primary-600' : ''}">
        <label 
          class="py-3 ml-6 text-sm"
          for="streamer-search-input"> 
          스트리머 
        </label>
        <StreamerAutoComplete bind:onselect={on_streamer_search} placeholder="검색" inputid="streamer-search-input" class="ml-2" id="navigation-streamer-search"/>
      </div> 
    </div>
  </div>
</nav>

<style>
  .current-link {
    @apply border-purple-500 text-purple;
  }
  .title {
    text-shadow: 3px 3px 0 #CDA8C7, -1px -1px 0 #CDA8C7, 1px -1px 0 #CDA8C7, -1px 1px 0 #CDA8C7, 1px 1px 0 #CDA8C7;
    color: white;
  }
</style>
