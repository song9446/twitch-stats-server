{#if header}
<div class="w-full flex flex-row">
  <div class="w-1/4 bg-gray-500 text-center overflow-hidden flex flex-row justify-around items-center">
    {#each ["mb-2", "mb-1", "-mb-2", "-mb-8"] as mb}
    <svg area-hidden="true" role="img" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 {faMoon.icon[0]} {faMoon.icon[1]}" class="{mb} w-4 h-4 overflow-visible inline-block text-yellow-400">
      <path fill="currentColor" d="{faMoon.icon[4]}"/>
    </svg>
    {/each}
  </div>
  <div class="w-1/2 bg-white text-center overflow-hidden flex flex-row justify-around items-center">
    {#each ["-mb-8", "-mb-2", "mb-1", "mb-2", "mb-1", "-mb-2", "-mb-8"] as mb}
    <svg area-hidden="true" role="img" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 {faSun.icon[0]} {faSun.icon[1]}" class="{mb} w-4 h-4 overflow-visible inline-block text-red-400">
      <path fill="currentColor" d="{faSun.icon[4]}"/>
    </svg>
    {/each}
  </div>
  <div class="w-1/4 bg-gray-500 text-center overflow-hidden flex flex-row justify-around items-center">
    {#each ["mb-2", "mb-1", "-mb-2", "-mb-8"].reverse() as mb}
    <svg area-hidden="true" role="img" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 {faMoon.icon[0]} {faMoon.icon[1]}" class="{mb} w-4 h-4 overflow-visible inline-block text-yellow-400">
      <path fill="currentColor" d="{faMoon.icon[4]}"/>
    </svg>
    {/each}
  </div>
</div>
{/if}
<div class="w-full relative border-t">
  <div class="w-full absolute bg-gray-500" style="height: {height}px"></div>
  <div class="w-3/4 absolute bg-white" style="height: {height}px"></div>
  <div class="w-1/2 absolute bg-white" style="height: {height}px"></div>
  <div class="w-1/4 absolute bg-gray-500" style="height: {height}px"></div>
  <div class="w-full">
    <div class="w-full flex flex-row flex-wrap items-center relative">
      <svg class="flex-grow border-gray-900" width={width} height={height} bind:this={svg}>
				<defs>
					{#each Object.values(games) as game}
					<pattern id="game-box-art-{game.id}" width={game_box_art_width} height={game_box_art_height} patternUnits="userSpaceOnUse">
            {#if game.box_art_url}
              <image xlink:href={game.box_art_url.replace("{width}", game_box_art_width).replace("{height}", game_box_art_height)} width={game_box_art_width} height={game_box_art_height} x=0 y=0 > </image>
            {/if}
					</pattern>
					{/each}
				</defs>
        <g shape-rendering="crispEdges">
          <line x1="{width*1/8}" x2="{width*1/8}" y1="0" y2="100" stroke-width="1.0" stroke="#eee"></line>
          <text x="0" y="0" fill="#eee" font-size="10" font-family="Arial" transform="translate({width*1/8 + 3}, 3) rotate(90)">
            3am
          </text>
          <!--<line x1="{width*2/8}" x2="{width*2/8}" y1="0" y2="100" stroke-width="1.0" stroke="#eee"></line>-->
          <text fill="#aaa" font-size="10" font-family="Arial" transform="translate({width*2/8 + 3}, 3) rotate(90)">
            6am
          </text>
          <line x1="{width*3/8}" x2="{width*3/8}" y1="0" y2="100" stroke-width="1.0" stroke="#aaa"></line>
          <text fill="#aaa" font-size="10" font-family="Arial" transform="translate({width*3/8 + 3}, 3) rotate(90)">
            9am
          </text>
          <line x1="{width*4/8}" x2="{width*4/8}" y1="0" y2="100" stroke-width="1.0" stroke="#777"></line>
          <text fill="#777" font-size="10" font-family="Arial" transform="translate({width*4/8 + 3}, 3) rotate(90)">
            정오
          </text>
          <line x1="{width*5/8}" x2="{width*5/8}" y1="0" y2="100" stroke-width="1.0" stroke="#aaa"></line>
          <text fill="#aaa" font-size="10" font-family="Arial" transform="translate({width*5/8 + 3}, 3) rotate(90)">
            3pm
          </text>
          <!--<line x1="{width*6/8}" x2="{width*6/8}" y1="0" y2="100" stroke-width="1.0" stroke="#aaa"></line>-->
          <text fill="#eee" font-size="10" font-family="Arial" transform="translate({width*6/8 + 3}, 3) rotate(90)">
            6pm
          </text>
          <line x1="{width*7/8}" x2="{width*7/8}" y1="0" y2="100" stroke-width="1.0" stroke="#eee"></line>
          <text fill="#eee" font-size="10" font-family="Arial" transform="translate({width*7/8 + 3}, 3) rotate(90)">
            9pm
          </text>
          {#if days_ago == 0 && now_x}
          <line x1="{now_x}" x2={now_x} y1={0} y2={height} stroke="#FF4560" stroke-width=0.5 
            stroke-dasharray="4 4"
            />
          <text fill="#FF4560" font-size="10" font-family="Arial" transform="translate({now_x + 3}, 3) rotate(90)">
            현재
          </text>
          {/if}
        </g>
				<g>
					{#each data_chunks as data}
            <!--<path fill="#CDA8C7" stroke="#B498AE" stroke-width=1.0 d="{data.path[0]}" />-->
            <path fill="#CBD5E0" stroke="#A0AEC0" stroke-width=1.0 d="{data.path[0]}" />
            {#if data[0] && data[0][5] && data[0][5].game && games[data[0][5].game.id] && data[0][5].game.box_art_url}
              <path 
                style="fill:url(#game-box-art-{data[0][5].game.id})"
                stroke="#A0AEC0" stroke-width=1.0 d="{data.path[1]}" />
            {:else}
              <path 
                fill="#000000" 
                stroke="#B498AE" stroke-width=1.0 d="{data.path[1]}" />
            {/if}
            <path fill="none" stroke="#FF4560" stroke-width=3.0 d="{data.path[2]}" stroke-linecap="round" stroke-dasharray="1 6" />
          {/each}
          {#if streamer.is_streaming && days_ago == 0 && last_data}
            <circle 
              cx={xscale(last_data[0])} 
              cy={height * ($max_y_axis - (last_data[1])) / $max_y_axis} 
              r=4
              class="is_streaming_label"
              fill="#FF4560" />
            <text fill="#FF4560" font-size="10" font-family="Arial" 
              x={xscale(last_data[0]) + 6}
              y={height * ($max_y_axis - (last_data[1])) / $max_y_axis}
              class="is_streaming_label">
              방송중
            </text>
          {/if}
				</g>
        <g shape-rendering="crispEdges">
          <line class:hidden={tooltip_data == null} x1={tooltip_x} x2={tooltip_x} y1={0} y2={height} stroke="#000000" stroke-width=0.5 
            stroke-dasharray="4 1"
            />
        </g>
			</svg>
      <div class="flex-none mr-2 absolute left-0 top-0 p-1 text-white pointer-events-none"> {["오늘", "어제", "그제", "엊그제"][days_ago] || days_ago + "일전"} </div>
    </div>
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
<<<<<<< HEAD
                <div class="mt-1 flex flex-row flex-wrap items-center text-purple-600">
                  <svg area-hidden="true" role="img" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 {faHistory.icon[0]} {faHistory.icon[1]}" class="w-4 h-4 mr-2 overflow-visible inline-block">
                    <path fill="currentColor" d="{faHistory.icon[4]}"/>
                  </svg>
                  <b>업타임 {Math.floor((tooltip_data[0] - tooltip_data[5].started_at) / 3600)}시간{Math.round((tooltip_data[0] - tooltip_data[5].started_at) % 3600 / 60)}분</b>
                </div>
              <p class="mt-2 text-xs px-1 border rounded-full text-white text-center" style="background-color: {dark_random_color(tooltip_data[5].game && tooltip_data[5].game.id || 0)}">
=======
              <p class="mt-2 text-xs px-1 border rounded-full text-white text-center" style="background-color: {text_to_dark_color(tooltip_data[5].game && '' + tooltip_data[5].game.id || '')}">
>>>>>>> d2889d99c97bdce47071bfd176272aab8192b643
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
<<<<<<< HEAD
import { faHistory } from '@fortawesome/free-solid-svg-icons/faHistory';
import { dark_random_color, findLastIndex } from "../util.js";
=======
import { text_to_dark_color } from "../util.js";
>>>>>>> d2889d99c97bdce47071bfd176272aab8192b643
import { API } from '../api.js';

export let days_ago;
export let streamer;
export let header = false;

let tooltip_x=0, 
		tooltip_y=0, 
		tooltip_data=null;


if(days_ago === 0) {
  max_y_axis.set(0)
  max_y_axis_right.set(0)
}

let today = new Date(); today.setHours(0,0,0,0);
let to = new Date(today.getTime() - 1000*60*60*24*(days_ago-1));
let from = new Date(today.getTime() - 1000*60*60*24*days_ago);

let height = 100;
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
    data.path = [
      `M${xscale(data[0][0])},${height}` +
        data.map(d=>
          `L${xscale(d[0])},${yscale(d[1])}`
        ).join("") + 
        `L${xscale(data[data.length-1][0])},${height}` +
        `L${xscale(data[0][0])},${height}`,
      `M${xscale(data[0][0])},${height}` +
        data.map(d=>
          `L${xscale(d[0])},${yscale(d[2])}`
        ).join("") + 
        `L${xscale(data[data.length-1][0])},${height}` +
        `L${xscale(data[0][0])},${height}`, 
      `M${xscale(data[0][0])},${yscale_right(data[0][4])}` +
        data.map(d=>
          `L${xscale(d[0])},${yscale_right(d[4])}`
        ).join(""),
    ];
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
  let {stream_changes, stream_metadata_changes} = await API.timeline(streamer.id, from, to);
  last_data = stream_changes[stream_changes.length-1];
  max_y_axis.update(x => Math.max(x, ...stream_changes.map(d=>Math.max(d[2], d[1]))));
  max_y_axis_right.update(x => Math.max(x, ...stream_changes.map(d=>d[4])));
  let j=0;
  let metadatas = stream_changes.map(x => {
    while(stream_metadata_changes.length > j && x[0] >= stream_metadata_changes[j].time) ++j;
    if(x[1] === null) return null;
    else if(j>0) return stream_metadata_changes[j-1];
    else return null;
  });
<<<<<<< HEAD
  stream_changes = stream_changes.map((d, i)=>[...d, metadatas[i]]);
  let sm_n = 3, chatting_speed_sm = [stream_changes.slice(0, sm_n).reduce((a,b)=>a+b[4], 0)/sm_n];
  for(let i=sm_n, l=stream_changes.length, sm=chatting_speed_sm[0]; i<l; ++i){
    sm = sm + (stream_changes[i][4] - stream_changes[i-sm_n][4])/sm_n;
    chatting_speed_sm.push(sm);
=======
  console.log(stream_metadata_changes);
  stream_changes = stream_changes.map((d, i)=>[...d, metadatas[i]]);
  let sm_n = 20, chatting_speed_sm = [stream_changes.slice(0, sm_n).reduce((a,b)=>a+b[4], 0)/sm_n];
  console.log(chatting_speed_sm);
  for(let i=sm_n, l=stream_changes.length, sm=chatting_speed_sm[0]; i<l; ++i){
    sm = sm + (stream_changes[i][4] - stream_changes[i-sm_n][4])/sm_n;
    chatting_speed_sm.push(sm);
    console.log(sm);
>>>>>>> d2889d99c97bdce47071bfd176272aab8192b643
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
<<<<<<< HEAD
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

    if(Math.abs(stream_changes[nearest_index][0] - target_date) < 60*60){ // || right_index != 0 && metadatas[right_index].started_at == metadatas[right_index-1].started_at) {
=======
    let right_index = stream_changes.findIndex(d => d[0] >= target_date);
    if(right_index < 0){
      tooltip_data = null;
      return;
    }
    let nearest_index = right_index != 0 && Math.abs(stream_changes[right_index-1][0] - target_date) <= Math.abs(stream_changes[right_index][0] - target_date)?
            right_index-1 : right_index;
    if(Math.abs(stream_changes[nearest_index][0] - target_date) < 60*60 || right_index != 0 && metadatas[right_index].started_at == metadatas[right_index-1].started_at) {
>>>>>>> d2889d99c97bdce47071bfd176272aab8192b643
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
