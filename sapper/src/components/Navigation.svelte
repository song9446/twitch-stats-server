<script>
import StreamerAutoComplete from "./StreamerAutoComplete.svelte";
import { faMap } from '@fortawesome/free-solid-svg-icons/faMap'
import { faExchangeAlt } from '@fortawesome/free-solid-svg-icons/faExchangeAlt'
const pages = [
    {segment: "map", name: "지도", icon: faMap},
    {segment: "migration", name: "시청자 이동", icon: faExchangeAlt},
    /*{segment: "straw", name: "빨대"},*/
  ];

export let segment;

function on_streamer_search(target) {
  window.location.pathname = "/streamer/" + target.id;
}
console.log("segment", segment);
</script>

<nav class="bg-white w-full relative z-40 shadow" role="navigation">
  <div class="container flex flex-row flex-wrap justify-between items-center m-auto">
    <div class="flex flex-row items-center flex-wrap md:justify-start justify-between w-full">
      <div class="flex flex-row items-center">
        <a href="/" class="title-container transition-all transition-100 text-xl font-bold tracking-wider">
          <span class="pl-2">트수 gg </span>
        </a> 
        <div class="flex overflow-hidden">
          {#each pages as page}
            <a class="hidden md:inline-block py-3 ml-8 -mb-px no-underline border-3 text-lg border-transparent" href="/{page.segment}" 
              class:current-link="{segment === page.segment}">
              {page.name}</a> 
            <a class="md:hidden inline-block py-3 ml-8 -mb-px no-underline border-3 text-gray-600 text-sm border-transparent" href="/{page.segment}"
              class:current-link="{segment === page.segment}"> 
              <svg area-hidden="true" role="img" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 {page.icon.icon[0]} {page.icon.icon[1]}" class="w-6 h-6 overflow-visible inline-block">
                <path fill="currentColor" d="{page.icon.icon[4]}"/>
              </svg>
            </a> 
          {/each}
        </div>
      </div>
      {#if segment != null}
        <div class="flex items-center -mb-px border-3 border-transparent {"streamer" === segment? 'border-b-primary-600 text-primary-600' : ''}">
          <label 
            class="py-3 ml-6 text-lg hidden md:inline"
            for="streamer-search-input"> 
            스트리머 
          </label>
          <StreamerAutoComplete bind:onselect={on_streamer_search} placeholder="검색" inputid="streamer-search-input" class="ml-4" id="navigation-streamer-search"/>
        </div> 
      {/if}
    </div>
  </div>
</nav>

<style>
  .current-link {
    border-bottom-color: #CDA8C7;
    color: #CDA8C7;
  }
  .title {
  }
  .title-container {
    margin-top: 0;
    margin-bottom: 0;
    margin-left: 0.5rem;
    margin-right: 0;
    text-shadow: 3px 3px 0 #CDA8C7, -1px -1px 0 #CDA8C7, 1px -1px 0 #CDA8C7, -1px 1px 0 #CDA8C7, 1px 1px 0 #CDA8C7;
    color: white;
  }
  .title-container:hover {
    margin-top: -3px;
    margin-left: calc(0.5rem - 3px);
    margin-right: 3px;
    margin-bottom: 3px;
    text-shadow: 6px 6px 1px #CDA8C7, -1px -1px 0 #CDA8C7, 1px -1px 0 #CDA8C7, -1px 1px 0 #CDA8C7, 1px 1px 0 #CDA8C7;
  }
  .title:hover {
  }
</style>
