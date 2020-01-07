<script>
import Tailwindcss from './Tailwindcss.svelte';
import StreamerAutoComplete from "./StreamerAutoComplete.svelte";
const pages = [
    {path: "/map", name: "지도"},
    {path: "/straw", name: "빨대"},
  ];

function on_streamer_search(target) {
  window.location.pathname = "/streamer/target.id";
}
</script>
<Tailwindcss/>
<nav class="flex flex-row flex-wrap justify-between shadow bg-white w-full items-center" role="navigation">
  <div class="p-2 flex flex-row flex-wrap text-center border-b md:border-0 w-full md:w-auto">
    <div class="">
      <a href="/"> Home </a>
    </div> 
    <div class="flex -mb-px justify-center items-end">
      {#each pages as page}
        <a class="pb-2 -mb-2 ml-4 no-underline border-b-2 text-xs border-transparent" href="#{page.hash}" 
          class:current-link="{window.location.pathname === page.path}">
          {page.name}</a> 
      {/each}
    </div>
  </div>
  <div class="w-full md:w-auto p-2 text-center">
    <StreamerAutoComplete streamers={streamers} bind:onselect={on_streamer_search} placeholder="스트리머 검색" />
  </div> 
</nav>

<style>
  .current-link {
    @apply border-purple-500 text-purple-500
  }
</style>
