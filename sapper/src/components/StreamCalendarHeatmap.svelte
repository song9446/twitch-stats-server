<div class="{$$props.class} relative flex flex-row items-center" class:pt-4={is_head}>
  <div class="text-center text-md w-16">
    {month}월
  </div>
  <div class="relative pr-2 flex-1">
    <svg 
       class="overflow-visible"
       viewBox="0,{is_head? 0:1},7,{Math.floor((calendar_values.length + start_day)/7) + 1 + is_head - !is_head}"
       on:mouseover={handleMousemove}
       on:mousemove={handleMousemove} >
      <g>
        {#if is_head}
        {#each ["일", "월", "화", "수", "목", "금", "토"] as day, i}
          <text 
           x="{i+0.5}" 
           y="0.5"
           text-anchor="middle"
           alignment-baseline="middle"
           {day}
           style="fill: {i==0 || i==6? '#FF4560': '#444444'}; font-size: 0.5px"
           >
           {day}
          </text>
        {/each}
        {/if}
        {#each calendar_values as v, i}
        <rect 
           x="{(i+start_day)%7}" 
           y="{Math.floor((i+start_day)/7 + is_head)}" 
           width="{1}" 
           height="{1}" 
           stroke="#444444"
           stroke-width="0.01"
           fill="rgb({r}, {g}, {b}, {v? Math.min(v/(max_val*0.5), 1): 0})"
           on:mouseover={e => hovered_rect = [i, v, e.target]}
           on:mouseout={e => { if(hovered_rect[0] == i) hovered_rect = null;}}
           />
        <text
           x="{(i+start_day)%7 + 0.5}" 
           y="{Math.floor((i+start_day)/7 + is_head) + 0.5}"
           text-anchor="middle"
           alignment-baseline="middle"
           style="opacity: 0.25; fill: {(i+start_day)%7==0 || (i+start_day)%7==6? '#FF4560': '#444444'}; font-size: 0.5px; font-weight: bold; pointer-events:none;"
           >
          {i+1}
        </text>
        {/each}
        {#if !is_head}
          {#each [0,1,2,3,4,5,6] as i}
            <line 
               x1="{(i + start_day)%7}" 
               y1="{Math.floor((i+start_day)/7 + is_head)}"
               x2="{(i + start_day)%7+1}"
               y2="{Math.floor((i+start_day)/7 + is_head)}"
               stroke-width="0.05"
               stroke="#222222"
                    />
          {/each}
          {#if start_day}
            <line 
               x1="{start_day%7}" 
               y1="{Math.floor((start_day)/7 + is_head)}"
               x2="{start_day%7}"
               y2="{Math.floor((start_day)/7 + is_head + 1)}"
               stroke-width="0.05"
               stroke="#222222"
                    />
          {/if}
        {/if}
      </g>
    </svg>
    {#if hovered_rect}
      <div 
         class="fixed text-white z-50 bg-gray-900 opacity-75 p-2 text-xs text-center" 
         style="top: {m.y + 10}px; left: {m.x}px; transform: translate(-50%, 0);">
        <span><span class="text-sm">{month}</span>월<span class="text-sm">{hovered_rect[0]+1}</span>일</span><br>
        <span><span class="text-normal">{hovered_rect[1].toFixed(1)}</span>시간 방송함</span>
      </div>
    {/if}
  </div>
</div>

<script context="module">
</script>

<script>
import { onMount } from "svelte";
import { API } from '../api.js';
export let streamer;
export let month_offset = 0
export let is_head = true;
let now = new Date(); 
let hovered_rect = null;
$: to = new Date(now.getFullYear(), now.getMonth()+1 + month_offset, 1);
$: from = new Date(now.getFullYear(), now.getMonth() + month_offset, 1);
$: month = from.getMonth()+1;
$: start_day = from.getDay();
$: max_val = Math.max(...calendar_values);

let calendar_values = new Array(new Date(now.getFullYear(), now.getMonth()+month_offset+1, 0).getDate()).fill(0);
let last_streamer;
$: if(last_streamer != streamer) {
  last_streamer = streamer;
  API.stream_ranges(streamer.id, from, to).then(stream_ranges => {
    stream_ranges = stream_ranges.filter(r => r[0] >= from.getTime()/1000 && r[0] < to.getTime()/1000)
    if(!stream_ranges)
      return null;
    let date_to_stream_time = {};
    let values = new Array(new Date(now.getFullYear(), now.getMonth()+month_offset+1, 0).getDate()).fill(0);
    for(let r of stream_ranges) {
      let date = new Date(r[0]*1000);
      values[date.getDate()-1] += (r[1] - r[0])/3600;
    }
    calendar_values = values;
  });
};

const r = 205;
const g = 168;
const b = 199;
function value_to_color(v) {
  let n = v? Math.min(v/(max_val*0.5), 1): 0;
  return `rgb(${r}, ${g}, ${b}, ${n})`;
}

let m = { x: 0, y: 0 };

function handleMousemove(event) {
  m.x = event.clientX;
  m.y = event.clientY;
}
</script>
