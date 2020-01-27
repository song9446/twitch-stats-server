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
  <div class="w-full absolute bg-gray-500" style="top: {SERIES_HEIGHT*HEAD_RATIO}px; height: {SERIES_HEIGHT*(1-HEAD_RATIO)}px"></div>
  <div class="w-3/4 absolute bg-white" style="top: {SERIES_HEIGHT*HEAD_RATIO}px; height: {SERIES_HEIGHT*(1-HEAD_RATIO)}px"></div>
  <div class="w-1/2 absolute bg-white" style="top: {SERIES_HEIGHT*HEAD_RATIO}px; height: {SERIES_HEIGHT*(1-HEAD_RATIO)}px"></div>
  <div class="w-1/4 absolute bg-gray-500" style="top: {SERIES_HEIGHT*HEAD_RATIO}px; height: {SERIES_HEIGHT*(1-HEAD_RATIO)}px"></div>
  <div class="w-full">
  {#if chart_option}
    <div class="w-full flex flex-row flex-wrap items-center relative">
      <ApexChart class="flex-grow border-gray-900" options={chart_option} />
      <div class="flex-none mr-2 absolute left-0 p-1 text-white pointer-events-none" style="top: {SERIES_HEIGHT*HEAD_RATIO}px"> {["오늘", "어제", "그제", "엊그제"][days_ago] || days_ago + "일전"} </div>
    </div>
  {/if}
  </div>
</div>

<script context="module">
  import { writable } from 'svelte/store';
  let max_y_axis = writable(0);
</script>

<script>
import { onMount } from "svelte";
import { faUser } from '@fortawesome/free-solid-svg-icons/faUser'
import { faUserLock } from '@fortawesome/free-solid-svg-icons/faUserLock'
import { faUserSecret } from '@fortawesome/free-solid-svg-icons/faUserSecret'
import { faUserCheck } from '@fortawesome/free-solid-svg-icons/faUserCheck'
import { faKey } from '@fortawesome/free-solid-svg-icons/faKey'
import { faSun } from '@fortawesome/free-solid-svg-icons/faSun'
import { faMoon } from '@fortawesome/free-solid-svg-icons/faMoon'
import { faExternalLinkAlt } from '@fortawesome/free-solid-svg-icons/faExternalLinkAlt'
import ApexChart, { LOCALE } from "./ApexChart.svelte";
import { text_to_dark_color } from "../util.js";
import { API } from '../api.js';

export let days_ago;
export let streamer;
export let header = false;

if(days_ago === 0) max_y_axis.set(0)

let today = new Date(); today.setHours(0,0,0,0);
let to = new Date(today.getTime() - 1000*60*60*24*(days_ago-1));
let from = new Date(today.getTime() - 1000*60*60*24*days_ago);

//let chart;

const HEAD_RATIO = 0; header? 0.25: 0;
const SERIES_HEIGHT = 100; header? 125: 100;
const TIME_ANNOTATIONS = [
  [0, "", 1], [3, "03:00", 0.2, "#ffffff"], [6, "06:00", 0.5, "#ffffff"], 
  [9, "09:00", 0.2, "#000000"], [12, "12:00", 0.8, "#000000"], [15, "15:00", 0.2, "#000000"], [18, "18:00", 0.5, "#000000"], 
  [21, "21:00", 0.2, "#ffffff"], [24, "24:00", 1, "#ffffff"], ];

let chart_option = null;

let chart_image_url = "";

$: if(chart_option) {
  chart_option.yaxis.max = $max_y_axis + $max_y_axis * HEAD_RATIO;
  chart_option = chart_option;
}

onMount(async ()=> {
  let {stream_changes, stream_metadata_changes} = await API.timeline(streamer.id, from, to);

  stream_changes.sort((a, b) => a[0] - b[0]);
  let j=0;
  let metadatas = stream_changes.map(x => {
    while(stream_metadata_changes.length > j && x[0] >= stream_metadata_changes[j].time) ++j;
    if(x[1] === null) return null;
    else if(j>0) return stream_metadata_changes[j-1];
    else return null;
  });
  let viewer_data = stream_changes.map(x => x[1]),
      chatter_data = stream_changes.map(x => x[2]),
      categories = stream_changes.map(x => x[0]);

  max_y_axis.update(x => Math.max(x, ...viewer_data, ...chatter_data));

  let filtered_categorie_indexes = categories.map((x, i) => i)
    .filter((i,j) => j==0 || 
      metadatas[i] != null && (metadatas[i+1] == null || metadatas[i-1] == null) || 
      (metadatas[i] && metadatas[i].game && metadatas[i].game.id) != (metadatas[i-1] && metadatas[i-1].game && metadatas[i-1].game.id) ||
      (metadatas[i+1] && metadatas[i+1].game && metadatas[i+1].game.id) != (metadatas[i] && metadatas[i].game && metadatas[i].game.id));
  console.log(filtered_categorie_indexes);

  let viewer_data_chunks = [[]], chatter_data_chunks = [[]], metadata_chunks = [[]];
  for(let i=0, l=categories.length, j=0; i<l; ++i) {
    if(categories[i] >= to.getTime()/1000) break;
    if(i>0 && metadatas[i] != metadatas[i-1]){
      ++j;
      viewer_data_chunks.push([]);
      chatter_data_chunks.push([]);
      metadata_chunks.push([]);
    }
    viewer_data_chunks[j].push([categories[i], viewer_data[i]]);
    chatter_data_chunks[j].push([categories[i], chatter_data[i]]);
    metadata_chunks[j].push(metadatas[i]);
  }
  console.log(viewer_data_chunks);

  chart_option = {
      chart: { 
        defaultLocale: "ko", 
        locales: [LOCALE["ko"]], 
        height: SERIES_HEIGHT, 
        sparkline: {
          enabled: true,
        },
        toolbar: {
          autoSelected: 'pan',
          show: false
        },
        animations: {
          enabled: false,
        },
      },
      series: [
        ...chatter_data_chunks.map(x => (
          { name: "로그인 시청자",
            type: "area",
            data: x, 
        })),
        ...viewer_data_chunks.map(x => (
          { name: "전체 시청자",
            type: "area",
            data: x, 
        })),
      ],
      xaxis: { 
        categories: categories,
        type: 'numeric', 
        min: from.getTime()/1000,
        max: to.getTime()/1000,
        crosshairs: { show: false },
      },
      yaxis: {
        min: 0, 
        max: $max_y_axis + $max_y_axis * HEAD_RATIO,
        crosshairs: {
          stroke: {
            color: '#DDDAE5',//'#b6b6b6',
          },
        },
        labels: {
          formatter: (v) => Math.floor(v) + "명",
           style: {
              color: "#ffff00",
          },
          color: "#ffff00",
        },
      },
      stroke: { show: false },
      fill: {
        colors: [
          ...chatter_data_chunks.filter((_, j) => metadata_chunks[j][0] == null || metadata_chunks[j][0].game == null).map(_ => "#B498AE"),
          ...viewer_data_chunks.map(_ => "#CDA8C7"),
        ],
        opacity: 1.0,
        type: [
          ...chatter_data_chunks.map((chunk, j) => metadata_chunks[j][0] != null && metadata_chunks[j][0].game != null? 'image': 'solid'),
          ...viewer_data_chunks.map(chunk => 'solid'),
        ],
        image: {
          src: metadata_chunks.filter(chunk => chunk[0] != null && chunk[0].game != null).map(chunk => chunk[0].game.box_art_url.replace("{width}", (SERIES_HEIGHT*0.4).toFixed(0)).replace("{height}", (SERIES_HEIGHT*0.5).toFixed(0))),
          width: SERIES_HEIGHT*0.4,
          height: SERIES_HEIGHT*0.5,
        },
      },
      tooltip: { 
        marker: { show: false }, 
        custom: function({series, seriesIndex, dataPointIndex, w}) {
          let l = chatter_data_chunks.length, 
              j = seriesIndex % l,
              d = new Date(seriesIndex > l? viewer_data_chunks[j][dataPointIndex][0]*1000 : chatter_data_chunks[j][dataPointIndex][0]*1000),
              h = d.getHours(), m = d.getMinutes(),
              formated_time = `${w.globals.locale.days[d.getDay()]} ${h<12? "오전": "오후"} ${h>12? h-12: h}시 ${m}분`,
              metadata = metadata_chunks[j][dataPointIndex];
          if(metadata == null) return;
          let elapsed_seconds = (d - metadata.started_at*1000)/1000,
              elapsed_days = Math.floor(elapsed_seconds/24/60/60),
              elapsed_hours = Math.floor(elapsed_seconds%(24*60*60)/60/60),
              elapsed_minutes = Math.floor(elapsed_seconds%(60*60)/60);
          return `
            <div class="flex flex-col font-sans custom-tooltip p-3 w-48 flex-unwrap"> 
              <div class="">
                <div class="text-gray-600 text-xs font-semibold tracking-wide">
                  ${h<12? "AM": "PM"} ${("0"+(h>12? h-12: h)).slice(-2)}:${("0"+m).slice(-2)}
                </div>
              </div>
              <p class="break-all mt-1 text-gray italic tracking-tight" style="font-size: 0.5rem">
                ${metadata.title}
              </p>
              <div class="flex flex-col mt-1">
                <div class="flex flex-row flex-wrap items-center text-gray-900">
                  <svg area-hidden="true" role="img" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${faUser.icon[0]} ${faUser.icon[1]}" class="w-4 h-4 mr-2 overflow-visible inline-block">
                    <path fill="currentColor" d="${faUser.icon[4]}"/>
                  </svg>
                  <b>${series[j+l][dataPointIndex]}명</b>
                </div>
                <div class="flex flex-row flex-wrap items-center text-primary-600 text-xs">
                  <svg area-hidden="true" role="img" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${faUserSecret.icon[0]} ${faUserSecret.icon[1]}" class="w-3 h-3 mr-2 overflow-visible inline-block">
                    <path fill="currentColor" d="${faUserSecret.icon[4]}"/>
                  </svg>
                  <b>${series[j+l][dataPointIndex] - series[j][dataPointIndex]}명</b>
                </div>
                <div class="flex flex-row flex-wrap items-center text-green-700 text-xs">
                  <svg area-hidden="true" role="img" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${faKey.icon[0]} ${faKey.icon[1]}" class="w-3 h-3 mr-2 overflow-visible inline-block">
                    <path fill="currentColor" d="${faKey.icon[4]}"/>
                  </svg>
                  <b>${series[j][dataPointIndex]}명</b>
                </div>
              </div>
              <p class="text-xs px-1 mt-2 border rounded-full text-white text-center" style="background-color: ${text_to_dark_color(metadata.game && "" + metadata.game.id || "")}">
                ${metadata.game != null? metadata.game.name: ""} 
              </p>
          </div>`;
        }
      },
      annotations: {
        xaxis:  
          [[0, "", 1], [3, "03:00", 0.2, "#ffffff"], [6, "06:00", 0.5, "#ffffff"], 
          [9, "09:00", 0.2, "#000000"], [12, "12:00", 0.8, "#000000"], [15, "15:00", 0.2, "#000000"], [18, "18:00", 0.5, "#000000"], 
          [21, "21:00", 0.2, "#ffffff"], [24, "24:00", 1, "#ffffff"], ].map(x => ({
            x: from.getTime()/1000 + 60*60*x[0],
            borderColor: x[3] + ("0" + (Math.floor(x[2]*255)).toString(16)).slice(-2),
            strokeDashArray: 0,
            opacity: x[2],
            label: {
              borderColor: '#FFFF0000',
              style: {
                fontSize: '8px',
                color: x[3] + ("0" + (Math.floor(x[2]*255)).toString(16)).slice(-2),
                background: '#FFFF0000',
              },
              text: x[1],
            }
          })),
          points: (days_ago === 0 && streamer.is_streaming)? [{
            x: categories[categories.length-1],
            y: viewer_data[viewer_data.length-1],
            marker: {
              size: 4,
              fillColor: "#ff4560",
              strokeColor: "#ff4560",
              radius: 2,
              cssClass: 'is_streaming_marker',
            },
            label: {
              borderColor: "#FF456000",
              offsetX: 24,
              offsetY: 18,
              text: "방송중",
              style: {
                cssClass: 'is_streaming_label',
                color: "#FF4560",
                background: "#FF456000"
              },
            },
        }]: [],
      },
  };
});

</script>

<style>
.vertical-text {
  writing-mode: vertical-rl;
  text-orientation: sideways;
  transform: rotate(180deg);
}
:global(.annotation) {
  /*opacity: 0.5 !important;*/
 /* filter: alpha(opacity=50);*/
  /* margin-top: -40px; */
}
/*:global(.tooltip) {
}*/
:global(
.apexcharts-tooltip,
.apexcharts-tooltip.active
) {
   transition: none !important;
   background-color: transparent !important;
  transform: translate(0, 1.5em) !important;
  white-space: unset !important;
}
:global(
.apexcharts-marker
) {
   transition: none !important;
}
:global(.apexcharts-yaxistooltip) { 
  background-color: transparent !important;
  border: none !important;
  transform: translate(1.2em, -.5em);
  transition: none !important;
}
:global(.apexcharts-xaxistooltip) {
  background-color: transparent !important;
  border: none !important;
  transform: translate(3em, -.7em);
  transition: none !important;
}
:global(
.apexcharts-yaxistooltip:before, 
.apexcharts-yaxistooltip:after, 
.apexcharts-xaxistooltip:before, 
.apexcharts-xaxistooltip:after) {
  display: none !important;
}
:global( .custom-tooltip ) {
  background-color: #fffA !important;
}
:global(.is_streaming_marker) {
  animation: blinker 1s linear infinite;
}
:global(.is_streaming_label) {
  animation: blinker 1s linear infinite;
}
@keyframes blinker {
  50% {
    opacity: 0;
  }
}
</style>
