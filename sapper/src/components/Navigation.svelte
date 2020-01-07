<script>
import StreamerAutoComplete from "./StreamerAutoComplete.svelte";
const pages = [
    {segment: "map", name: "지도"},
    {segment: "straw", name: "빨대"},
  ];

export let segment;

function on_streamer_search(target) {
  window.location.pathname = "/streamer/" + target.id;
}
</script>

<nav class="shadow bg-white w-full" role="navigation">
  <div class="container flex flex-row flex-wrap justify-between items-center m-auto">
    <div class="flex flex-row items-center flex-wrap">
      <div class="ml-4">
        <a href="/"> Home </a>
      </div> 
      <div class="flex">
        {#each pages as page}
          <a class="py-2 ml-4 no-underline border-b-2 text-xs border-transparent {segment === page.segment? 'border-primary-600 text-primary-600' : ''}" href="/{page.segment}" 
            class:current-link="{segment === page.segment}">
            {page.name}</a> 
        {/each}
      </div>
      <div class="flex items-center">
        <label 
          class="py-2 ml-4 no-underline border-b-2 text-xs border-transparent {"streamer" === segment? 'border-primary-600 text-purple-600' : ''}" 
          for="streamer-search-input"> 
          스트리머 
        </label>
        <StreamerAutoComplete bind:onselect={on_streamer_search} placeholder="검색" inputid="streamer-search-input" class="ml-2"/>
      </div> 
    </div>
  </div>
</nav>

<style>
  .current-link {
    @apply border-purple-500 text-purple;
  }
</style>
