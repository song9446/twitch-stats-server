<div class="w-full relative">
  <div class="w-full">
    <svg class="flex-grow border-gray-900 w-full" width={width} height={height} bind:this={svg}>
      <defs>
        {#each Object.values(games) as game}
        <pattern id="game-box-art-{game.id}" width={game_box_art_width} height={game_box_art_height} patternUnits="userSpaceOnUse" y={height*0.25}>
          {#if game.box_art_url}
            <image xlink:href={game.box_art_url.replace("{width}", game_box_art_width).replace("{height}", game_box_art_height)} width={game_box_art_width} height={game_box_art_height} x=0 y=0 > </image>
          {/if}
        </pattern>
        {/each}
        <marker id="bighead" 
          markerWidth="4" markerHeight="8" 
                          refX="0.1" refY="4" orient="auto" >
          <path d="M0,0 V8 L4,4 Z" fill="#444" />
        </marker>
      </defs>
      <!--<g shape-rendering="crispEdges">
        <line x1="{width*0/8}" x2="{width*0/8}" y1="0" y2="{height}" stroke-width="1.0" stroke="#444"></line>
        <text x="0" y="0" fill="#444" font-size="10" font-family="Arial" transform="translate({width*0/8 + 3}, 3) rotate(90)">
          0am
        </text>
        <line x1="{width*1/8}" x2="{width*1/8}" y1="0" y2="{height}" stroke-width="1.0" stroke="#aaa"></line>
        <text x="0" y="0" fill="#aaa" font-size="10" font-family="Arial" transform="translate({width*1/8 + 3}, 3) rotate(90)">
          3am
        </text>
        <line x1="{width*2/8}" x2="{width*2/8}" y1="0" y2="{height}" stroke-width="1.0" stroke="#666"></line>
        <text fill="#666" font-size="10" font-family="Arial" transform="translate({width*2/8 + 3}, 3) rotate(90)">
          6am
        </text>
        <line x1="{width*3/8}" x2="{width*3/8}" y1="0" y2="{height}" stroke-width="1.0" stroke="#aaa"></line>
        <text fill="#aaa" font-size="10" font-family="Arial" transform="translate({width*3/8 + 3}, 3) rotate(90)">
          9am
        </text>
        <line x1="{width*4/8}" x2="{width*4/8}" y1="0" y2="{height}" stroke-width="1.0" stroke="#444"></line>
        <text fill="#444" font-size="10" font-family="Arial" transform="translate({width*4/8 + 3}, 3) rotate(90)">
          정오
        </text>
        <line x1="{width*5/8}" x2="{width*5/8}" y1="0" y2="{height}" stroke-width="1.0" stroke="#aaa"></line>
        <text fill="#aaa" font-size="10" font-family="Arial" transform="translate({width*5/8 + 3}, 3) rotate(90)">
          3pm
        </text>
        <line x1="{width*6/8}" x2="{width*6/8}" y1="0" y2="{height}" stroke-width="1.0" stroke="#666"></line>
        <text fill="#666" font-size="10" font-family="Arial" transform="translate({width*6/8 + 3}, 3) rotate(90)">
          6pm
        </text>
        <line x1="{width*7/8}" x2="{width*7/8}" y1="0" y2="{height}" stroke-width="1.0" stroke="#aaa"></line>
        <text fill="#aaa" font-size="10" font-family="Arial" transform="translate({width*7/8 + 3}, 3) rotate(90)">
          9pm
        </text>
        <line x1="{width*8/8}" x2="{width*8/8}" y1="0" y2="{height}" stroke-width="1.0" stroke="#444"></line>
        <text x="0" y="0" fill="#444" font-size="10" font-family="Arial" transform="translate({width*8/8 + 3}, 3) rotate(90)">
          12pm
        </text>
      </g>-->
      <g stroke="#A0AEC0" stroke-width=1.0>
      <path 
         d="M0,{height*0.5} L{width - 4},{height*0.5}" 
         fill="none"
         marker-end="url(#bighead)"
      /> 
        {#each data_chunks as data}
          {#if data[0] && data[0][5] && data[0][5].game && games[data[0][5].game.id] && data[0][5].game.box_art_url}
            <path 
              style="fill:url(#game-box-art-{data[0][5].game.id}); stroke-linejoin: round;"
               d="{data.path}" />
          {:else}
            <path 
              style="stroke-linejoin: round;"
              fill="#000000" 
               d="{data.path}" />
          {/if}
        {/each}
      </g>
      <g shape-rendering="crispEdges">
        <line class:hidden={tooltip_data == null} x1={tooltip_x} x2={tooltip_x} y1={0} y2={height} stroke="#000000" stroke-width=0.5 
          stroke-dasharray="4 1"
          />
      </g>
    </svg>
  </div>
	{#if tooltip_data} 
    <div class="absolute bg-white opacity-75 z-50" style="{tooltip_x < width*0.5? 'left:' + (tooltip_x+5) + 'px': 'right:' + ((width-tooltip_x)+5) + 'px'}; top: {tooltip_y + 5}px"> 
            <div class="flex flex-col font-sans custom-tooltip p-3 w-48 flex-unwrap"> 
							<div class="text-gray-600 text-xs font-semibold tracking-wide">
								{tooltip_data_time_format(tooltip_data)}
							</div>
              <p class="break-all mt-1 text-gray italic tracking-tight" style="font-size: 0.5rem">
								{tooltip_data[5].title}
              </p>
                <div class="mt-1 flex flex-row flex-wrap items-center text-gray-900">
                  <svg area-hidden="true" role="img" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 {faUser.icon[0]} {faUser.icon[1]}" class="w-4 h-4 mr-2 overflow-visible inline-block">
                    <path fill="currentColor" d="{faUser.icon[4]}"/>
                  </svg>
                  <b>{tooltip_data[1]}명</b>
                </div>
                <div class="flex flex-row flex-wrap items-center text-gray-600 text-xs">
                  <svg area-hidden="true" role="img" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 {faUserSecret.icon[0]} {faUserSecret.icon[1]}" class="w-3 h-3 mr-2 overflow-visible inline-block">
                    <path fill="currentColor" d="{faUserSecret.icon[4]}"/>
                  </svg>
                  <b>{tooltip_data[1] - tooltip_data[2]}명</b>
                </div>
                <div class="flex flex-row flex-wrap items-center text-yellow-700 text-xs">
                  <svg area-hidden="true" role="img" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 {faKey.icon[0]} {faKey.icon[1]}" class="w-3 h-3 mr-2 overflow-visible inline-block">
                    <path fill="currentColor" d="{faKey.icon[4]}"/>
                  </svg>
                  <b>{tooltip_data[2]}명</b>
                </div>
                <div class="mt-1 flex flex-row flex-wrap items-center" style="color: #FF6F61">
                  <svg area-hidden="true" role="img" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 {faCommentDots.icon[0]} {faCommentDots.icon[1]}" class="w-4 h-4 mr-2 overflow-visible inline-block">
                    <path fill="currentColor" d="{faCommentDots.icon[4]}"/>
                  </svg>
                  <b>{tooltip_data[4].toFixed(1)}채팅/초</b>
                </div>
                <div class="mt-1 flex flex-row flex-wrap items-center text-purple-600">
                  <svg area-hidden="true" role="img" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 {faHistory.icon[0]} {faHistory.icon[1]}" class="w-4 h-4 mr-2 overflow-visible inline-block">
                    <path fill="currentColor" d="{faHistory.icon[4]}"/>
                  </svg>
                  <b>업타임 {Math.floor((tooltip_data[0] - tooltip_data[5].started_at) / 3600)}시간{Math.round((tooltip_data[0] - tooltip_data[5].started_at) % 3600 / 60)}분</b>
                </div>
              <p class="mt-2 text-xs px-1 border rounded-full text-white text-center" style="background-color: {dark_random_color(tooltip_data[5].game && tooltip_data[5].game.id || 0)}">
                {tooltip_data[5].game != null? tooltip_data[5].game.name : ""}
              </p>
          </div>
    </div>
	{/if}
</div>

<script context="module">
  import { writable } from 'svelte/store';
  let max_y_axis = writable(0);
  let max_y_axis_right = writable(0);

	function tooltip_data_time_format(data) {
		let d = new Date(data[0]*1000),
				h = d.getHours(), m = d.getMinutes();
		return `${h<12? "AM": "PM"} ${("0"+(h>12? h-12: h)).slice(-2)}:${("0"+m).slice(-2)}`;
	}
</script>

<script>
import { onMount } from "svelte";
import { faUser } from '@fortawesome/free-solid-svg-icons/faUser'
import { faUserLock } from '@fortawesome/free-solid-svg-icons/faUserLock'
import { faUserSecret } from '@fortawesome/free-solid-svg-icons/faUserSecret'
import { faUserCheck } from '@fortawesome/free-solid-svg-icons/faUserCheck'
import { faCommentDots } from '@fortawesome/free-solid-svg-icons/faCommentDots'
import { faKey } from '@fortawesome/free-solid-svg-icons/faKey'
import { faSun } from '@fortawesome/free-solid-svg-icons/faSun'
import { faMoon } from '@fortawesome/free-solid-svg-icons/faMoon'
import { faExternalLinkAlt } from '@fortawesome/free-solid-svg-icons/faExternalLinkAlt'
import { faHistory } from '@fortawesome/free-solid-svg-icons/faHistory';
import { dark_random_color, findLastIndex } from "../util.js";
import { API } from '../api.js';

export let date;
export let streamer;



let tooltip_x=0, 
		tooltip_y=0, 
		tooltip_data=null;

let today = new Date(date); today.setHours(0,0,0,0);
let to = new Date(today.getTime() + 1000*60*60*24);
let from = today;

export let height = 100;
let width = 500;

let games = {};
let data_chunks = [];
let last_data = null;
$: game_box_art_width = height*0.4;
$: game_box_art_height = height*0.5;

let svg;

let to_timestamp = to.getTime()/1000;
let from_timestamp = from.getTime()/1000;
function xscale(x) {
  return width * (x - from_timestamp) / (24*60*60);
}
function ixscale(x) {
  return x / width * (24*60*60) + from_timestamp
}
function yscale(x) {
  return height * ($max_y_axis - x) / $max_y_axis;
}
function yscale_right(x) {
  return height * ($max_y_axis_right - x) / $max_y_axis_right + 3;
}
function update_path() {
  for(let data of data_chunks){
    data.path = 
      `M${xscale(data[0][0])},${height*0.5}` +
      data.map(d=>
        `L${xscale(d[0])},${yscale(d[2])*0.5}`
      ).join("") + 
      data.map((_, i, arr) =>
        `L${xscale(arr[arr.length - i - 1][0])},${yscale(arr[arr.length - i - 1][2])*-0.5 + height*1.0}`
      ).join("") + 
      `L${xscale(data[0][0])},${height*0.5}`;
  }
  data_chunks = data_chunks;
}
let last_max_y_axis = $max_y_axis;
let last_max_y_axis_right = $max_y_axis_right;
$: if(data_chunks && ((last_max_y_axis != $max_y_axis) || (last_max_y_axis_right != $max_y_axis_right))) {
  last_max_y_axis = $max_y_axis;
  last_max_y_axis_right = $max_y_axis_right;
  update_path();
}

let now_x = null;

onMount(async ()=> {
	width = svg.getBoundingClientRect().width;
  now_x = xscale(new Date().getTime()/1000);
  if(streamer == null)
    return;
  let {stream_changes, stream_metadata_changes} = await API.timeline(streamer.id, from, to);
  last_data = stream_changes[stream_changes.length-1];
  max_y_axis.update(x => Math.max(x, ...stream_changes.map(d=>Math.max(d[2]))));
  max_y_axis_right.update(x => Math.max(x, ...stream_changes.map(d=>d[4])));
  let j=0;
  let metadatas = stream_changes.map(x => {
    while(stream_metadata_changes.length > j && x[0] >= stream_metadata_changes[j].time) ++j;
    if(x[1] === null) return null;
    else if(j>0) return stream_metadata_changes[j-1];
    else return null;
  });
  stream_changes = stream_changes.map((d, i)=>[...d, metadatas[i]]);
  let sm_n = 20, chatting_speed_sm = [stream_changes.slice(0, sm_n).reduce((a,b)=>a+b[4], 0)/sm_n];
  for(let i=sm_n, l=stream_changes.length, sm=chatting_speed_sm[0]; i<l; ++i){
    sm = sm + (stream_changes[i][4] - stream_changes[i-sm_n][4])/sm_n;
    chatting_speed_sm.push(sm);
  }
  for(let i=0, sm=0; i<Math.min(sm_n, stream_changes.length); ++i){
    sm = sm*i/(i+1) + stream_changes[i][4]/(i+1);
    stream_changes[i][4] = sm;
  }
  for(let i=0, l=chatting_speed_sm.length; i<l; ++i)
    stream_changes[Math.min(stream_changes.length-1, i + sm_n-1)][4] = chatting_speed_sm[i];

	svg.onmousemove = function(e){
		let x = e.clientX - svg.getBoundingClientRect().x, 
				y = e.clientY - svg.getBoundingClientRect().y;
    tooltip_x = x; 
    tooltip_y = y;
    let target_date = ixscale(x);
    let right_index = stream_changes.findIndex(d => d[0] >= target_date),
        left_index = findLastIndex(stream_changes, d => d[0] <= target_date);
    let nearest_index; 
    if(right_index >= 0 && left_index >= 0) 
      nearest_index = Math.abs(stream_changes[left_index][0] - target_date) <= Math.abs(stream_changes[right_index][0] - target_date)?
        left_index: right_index;
    else if(right_index >= 0)
      nearest_index = right_index;
    else if(left_index >= 0)
      nearest_index = left_index;
    else {
      tooltip_data = null;
      return;
    }

    if(Math.abs(stream_changes[nearest_index][0] - target_date) < 60*60) {// || right_index != 0 && metadatas[right_index].started_at == metadatas[right_index-1].started_at) {
      tooltip_data = stream_changes[nearest_index];
    }
    else 
      tooltip_data = null;
  }
  svg.onmouseleave = function(e){
    tooltip_data = null;
  }
  data_chunks.push([]);
	for(let i=0, l=stream_changes.length, j=0; i<l; ++i) {
   	  if(i>0 && metadatas[i] != metadatas[i-1] && 
          ((metadatas[i] == null || metadatas[i-1] == null) || 
            metadatas[i].started_at != metadatas[i-1].started_at || 
            (metadatas[i].game && metadatas[i].game.id) != (metadatas[i-1].game && metadatas[i-1].game.id) ||
            metadatas[i].title != metadatas[i-1].title)){
        ++j;
        data_chunks.push([]);
        if(metadatas[i] && metadatas[i-1] && metadatas[i].started_at == metadatas[i-1].started_at){
          let mid = stream_changes[i].slice(0, 5).map((d, j) => Math.floor((d + stream_changes[i-1][j])*0.5));
          data_chunks[j-1].push([...mid, metadatas[i-1]])
          data_chunks[j].push([...mid, metadatas[i]])
        }
      }
      data_chunks[j].push(stream_changes[i])
  }
  update_path();
  data_chunks = data_chunks;
  for(let data of data_chunks){
  	if(data[0] == null || data[0][5] == null || data[0][5].game == null) continue;
		games[data[0][5].game.id] = data[0][5].game;
	}
});
</script>

<style>
.is_streaming_label {
  animation: blinker 1s linear infinite;
}
@keyframes blinker {
  50% {
    opacity: 0;
  }
}
</style>
