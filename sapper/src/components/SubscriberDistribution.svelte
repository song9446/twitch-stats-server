<div class="w-full text-xs p-2 overflow-hidden flex flex-col items-start justify-end whitespace-no-wrap" bind:this={container}>
  {#each distribution as d}
    <div class="flex flex-row w-full items-center">
      <div class="w-16 text-center pr-2">{ d[0] >= 0? d[0] + "개월" : "비구독" }</div>
      <div class="bg-primary-600 flex items-center h-full text-gray-600 pt-px" style="width: {d[1]/max_ratio*50}%; min-width: 1px"> 
        <span class="pl-2" style="margin-left: 100%;">
        {(d[1]*100).toFixed(1)}%
        </span>
      </div>
    </div>
  {/each}
    <div class="flex flex-row pt-2 w-full font-bold">
      <div class="w-16 text-center pr-2">구독월수</div>
      <div class="flex-1 text-center">비율</div>
    </div>
</div>

<script>
import { onMount } from "svelte";
import { API } from "../api.js"
export let streamer_id;
let container;
let WordCloud_;

let last_streamer_id = null;
let distribution = [];
let max_ratio = 0;

$: if(last_streamer_id != streamer_id) {
  last_streamer_id = streamer_id;
  API.average_subscriber_distribution(streamer_id).then(_distribution => {
    let sum = _distribution.reduce((a,b) => a + b[1], 0);
    _distribution = _distribution.map(x => [x[0], x[1]/sum]);
    max_ratio = Math.max(..._distribution.map(x => x[1]));
    distribution = _distribution.reverse();
  });
}

onMount(()=>{
  let width = container.getBoundingClientRect().width,
    height = container.getBoundingClientRect().height;
  //container.style.minHeight = width + "px";
});
</script>
