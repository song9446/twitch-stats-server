<div class="w-full">
  <div class="w-full flex flex-row mt-1">
    <div class="w-1/4 bg-gray-200 text-center">
      <svg area-hidden="true" role="img" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 {faMoon.icon[0]} {faMoon.icon[1]}" class="w-4 h-4 mr-2 overflow-visible inline-block text-yellow-700">
        <path fill="currentColor" d="{faMoon.icon[4]}"/>
      </svg>
    </div>
    <div class="w-1/2 bg-yellow-300 text-center">
      <svg area-hidden="true" role="img" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 {faSun.icon[0]} {faSun.icon[1]}" class="w-4 h-4 mr-2 overflow-visible inline-block text-white">
        <path fill="currentColor" d="{faSun.icon[4]}"/>
      </svg>
    </div>
    <div class="w-1/4 bg-gray-200 text-center">
      <svg area-hidden="true" role="img" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 {faMoon.icon[0]} {faMoon.icon[1]}" class="w-4 h-4 mr-2 overflow-visible inline-block text-yellow-700">
        <path fill="currentColor" d="{faMoon.icon[4]}"/>
      </svg>
    </div>
  </div>
  <div class="w-full">
  {#each chart_options as chart_option, i}
    <div class="w-full flex flex-row flex-wrap items-center relative">
      <ApexChart class="flex-grow border-t border-gray-900" options={chart_option} />
      <div class="flex-none mr-2 absolute top-0 left-0 p-1"> {["오늘", "어제", "그제", "엊그제", "4일전", "5일전", "6일전"][i]} </div>
    </div>
  {/each}
  </div>
</div>

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

export let streamer;
export let viewer_count_changes = [];
export let chatter_count_changes = [];
export let follower_count_changes = [];
export let stream_metadata_changes = [];

let chart_options = [];
$: {
    let i=0, j=0, l, m;
    let max_viewer_count = Math.max(...viewer_count_changes.map(x=>x[1]));
    let chatter_dates = chatter_count_changes.map(x=>x[0]),
        viewer_dates = viewer_count_changes.map(x=>x[0]);
    l = viewer_count_changes.length;
    for(let date of chatter_dates){
      while(i < l && viewer_count_changes[i][0] < date) ++i;
      if(i >= l)
        viewer_count_changes.push([date, viewer_count_changes[i-1][1]]);
      else if(viewer_count_changes[i][0] != date)
        viewer_count_changes.push([date, i > 0? Math.floor((viewer_count_changes[i-1][1] + viewer_count_changes[i][1])*0.5): viewer_count_changes[i][1] ]);
    }
    i = 0;
    l = chatter_count_changes.length;
    for(let date of viewer_dates){
      while(i < l && chatter_count_changes[i][0] < date) ++i;
      if(i >= l)
        chatter_count_changes.push([date, viewer_count_changes[i-1][1]]);
      else if(chatter_count_changes[i][0] != date)
        chatter_count_changes.push([date, i > 0? Math.floor((chatter_count_changes[i-1][1] + chatter_count_changes[i][1])*0.5): chatter_count_changes[i][1] ]);
    }
    viewer_count_changes = viewer_count_changes.sort((a, b) => a[0]-b[0])
    chatter_count_changes = chatter_count_changes.sort((a, b) => a[0]-b[0])
    let today = new Date();
    today.setHours(0,0,0,0);
    today = today.getTime()/1000;
    let weeks = [
      [today, today+24*60*60],
      ...[...Array(6).keys()].map(i => [today - 24*60*60*(i+1), today - 24*60*60*i]),
      ];
    let game_changes = stream_metadata_changes.filter((x, i) => 
        (x.started_at != (i>0 && stream_metadata_changes[i-1].started_at)) || 
        (x.game && x.game.id) != (i>0 && stream_metadata_changes[i-1].game && stream_metadata_changes[i-1].game.id))
    let game_changes_of_week = weeks.map(range => game_changes.filter(x => x.time>=range[0] && x.time<range[1]));
    /*let stream_ends = stream_metadata_changes.filter((x, i) => x.started_at != (i>0 && stream_metadata_changes[i-1].started_at))
    let stream_changes_of_week = weeks.map(range => stream_changes.filter(x => x.time>=range[0] && x.time<range[1]));*/
    let time_annotations = [[3, "03:00", 0.2], [6, "06:00", 0.5], [9, "09:00", 0.2], [12, "12:00", 0.8], [15, "15:00", 0.2], [18, "18:00", 0.5], [21, "21:00", 0.2], [24, "24:00", 1], [0, "", 1]];
    let daynight_annotations = [[0, 6, "새벽", "#edf2f7"], [6, 18, "낮", "#F8CA00"], [18, 24, "밤", "#edf2f7"]];
    let xaxis_annotations = [...new Array(7).fill().keys()].map(i=>[
      ...daynight_annotations.map((i => (x => ({
        x: weeks[i][0] + 60*60*x[0],
        x2: weeks[i][0] + 60*60*x[1],
        fillColor: x[3],
        borderColor: x[3],
        opacity: 0.1,
        label: {
          borderColor: '#00000000',
          style: {
            fontSize: '8px',
            color: '#FFFFFF00',
            background: '#FFFF0000',
          },
          text: x[2],
        }
      })))(i)),
      ...time_annotations.map((i => (x => ({
        x: weeks[i][0] + 60*60*x[0],
        borderColor: `rgba(32, 32, 32, ${x[2]})`,
        strokeDashArray: 0,
        opacity: x[2],
        label: {
          borderColor: '#FFFF0000',
          style: {
            fontSize: '8px',
            color: `rgba(32,32,32,${x[2]})`,
            background: '#FFFF0000',
          },
          text: x[1],
        }
      })))(i)),
    ]);

    function chunk(changes) {
      let changes_of_week = weeks.map(range => changes.filter(x => x[0]>=range[0] && x[0]<range[1]));
      let change_chunks_of_week = [...Array(7).keys()].map(k => [ 
        k===6 || !game_changes_of_week[k+1].length? null: {
          data: changes_of_week[k].filter(x => !game_changes_of_week[k].length || x[0] < game_changes_of_week[k][0].time || 
            (
              x[0] == game_changes_of_week[k][0].time 
              && game_changes_of_week[k+1][game_changes_of_week[k+1].length-1].started_at == game_changes_of_week[k][0].started_at
            )
          ),
          game: game_changes_of_week[k+1][game_changes_of_week[k+1].length-1].game,
        },
        ...game_changes_of_week[k].map((gc, i) => ({
          data: [ 
            ...((k < game_changes_of_week.length-1 && game_changes_of_week[k].length && game_changes_of_week[k+1].length && game_changes_of_week[k+1][0].started_at == game_changes_of_week[k][game_changes_of_week[k].length-1].started_at)?
              [[weeks[k][0], changes_of_week[k+1][changes_of_week[k+1].length-1][1]]]: []),
            ...changes_of_week[k].filter(x => 
              x[0] >= gc.time && 
              (
                i+1 >= game_changes_of_week[k].length || x[0] < game_changes_of_week[k][i+1].time || 
                (x[0] == game_changes_of_week[k][i+1].time && game_changes_of_week[k][i+1].started_at == game_changes_of_week[k][i].started_at)
              )),
            ...((k>0 && game_changes_of_week[k].length && game_changes_of_week[k-1].length && changes_of_week[k].length && game_changes_of_week[k][0].started_at == game_changes_of_week[k-1][game_changes_of_week[k-1].length-1].started_at)?
              [[weeks[k][1], changes_of_week[k][changes_of_week[k].length-1][1]]]: []),
            ],
          game: gc.game,
        })),
      ].filter(x => x));
      return change_chunks_of_week;
    }
    let viewer_count_change_chunks_of_week = chunk(viewer_count_changes),
        chatter_count_change_chunks_of_week = chunk(chatter_count_changes);
    console.log(chatter_count_change_chunks_of_week);
    chart_options = [...Array(7).keys()].map(i => ({
      chart: { 
        defaultLocale: "ko", 
        locales: [LOCALE["ko"]], 
        height: 100, 
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
        ...chatter_count_change_chunks_of_week[i].map(chunk => ({
          name: "로그인 시청자",
          type: "area",
          data: chunk.data.map(x => [x[0], x[1]]),
        })),
        ...viewer_count_change_chunks_of_week[i].map((chunk, j)=> ({
          name: "전체 시청자",
          type: "area",
          data: chunk.data.map(x => [x[0], x[1]]),
        })),
      ],
      xaxis: { 
        type: 'numeric', 
        min: weeks[i][0], 
        max: weeks[i][1], 
        position: "top",
        labels: { show: false } ,
        tooltip: {
          enabled: true,
          formatter: function(val, opts) {
            let d = new Date(val*1000),
                h = d.getHours(), m = d.getMinutes(),
                formated_time = `${h<12? "오전": "오후"} ${h>12? h-12: h}시 ${m}분`;
            return formated_time;
          }
        },
        crosshairs: {
          show: true,
          width: 1,
          position: 'front',
          opacity: 0.9,        
          stroke: {
              color: '#b6b6b6',
              width: 1,
              dashArray: 0,
          },
        },
      },
      yaxis: { 
        min: 0, 
        max: max_viewer_count,
        tooltip: {
          enabled: true, 
          formatter: (val, opts) => val + "명",
        }, 
        crosshairs: {
          stroke: {
            color: '#b6b6b6',
            width: 1,
            dashArray: 0,
          },
        },
      },
      grid: { padding: {left:0, right:0, top:0, bottom:0}},
      markers: {
        colors: [
          ...chatter_count_change_chunks_of_week[i].map(_ => "#AAAAAA00"),
          ...viewer_count_change_chunks_of_week[i].map(_ => "#558FFb"),
        ],
        hover: {
          size: 4,
        },
      },
      tooltip: { 
        enabledOnSeries: [
          ...viewer_count_change_chunks_of_week[i].map((i=>((_, j)=>j + chatter_count_change_chunks_of_week[i].length))(i)),
        ],
        marker: { show: false }, 
        //shared: false,
        followCursor: true,
        custom: function({series, seriesIndex, dataPointIndex, w}) {
          let l = chatter_count_change_chunks_of_week[i].length, 
              j = seriesIndex % l,
              k = game_changes_of_week[i].length-l+j,
              d = new Date(seriesIndex >= l? viewer_count_change_chunks_of_week[i][j].data[dataPointIndex][0]*1000 : chatter_count_change_chunks_of_week[i][j].data[dataPointIndex][0]*1000),
              h = d.getHours(), m = d.getMinutes(),
              formated_time = `${w.globals.locale.days[d.getDay()]} ${h<12? "오전": "오후"} ${h>12? h-12: h}시 ${m}분`,
              metadata = k<0? game_changes_of_week[i+1][game_changes_of_week[i+1].length-1]: game_changes_of_week[i][k],
              elapsed_seconds = (d - metadata.started_at*1000)/1000,
              elapsed_days = Math.floor(elapsed_seconds/24/60/60),
              elapsed_hours = Math.floor(elapsed_seconds%(24*60*60)/60/60),
              elapsed_minutes = Math.floor(elapsed_seconds%(60*60)/60);
          return `
            <div class="flex flex-col font-sans custom-tooltip p-3"> 
              <div class="">
                <div class="text-gray-600 text-xs font-semibold tracking-wide">
                  ${h<12? "AM": "PM"} ${("0"+(h>12? h-12: h)).slice(-2)}:${("0"+m).slice(-2)}
                </div>
              </div>
              <div class="flex flex-col mt-2">
                <div class="flex flex-row flex-wrap items-center text-gray-900">
                  <svg area-hidden="true" role="img" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${faUser.icon[0]} ${faUser.icon[1]}" class="w-4 h-4 mr-2 overflow-visible inline-block">
                    <path fill="currentColor" d="${faUser.icon[4]}"/>
                  </svg>
                  <b>${series[j+l][dataPointIndex]}명</b>
                </div>
                <div class="flex flex-row flex-wrap items-center text-blue-500 mt-1 text-xs">
                  <svg area-hidden="true" role="img" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${faUserSecret.icon[0]} ${faUserSecret.icon[1]}" class="w-3 h-3 mr-2 overflow-visible inline-block">
                    <path fill="currentColor" d="${faUserSecret.icon[4]}"/>
                  </svg>
                  <b>${series[j+l][dataPointIndex] - series[j][dataPointIndex]}명</b>
                </div>
                <div class="flex flex-row flex-wrap items-center text-green-500 mt-1 text-xs">
                  <svg area-hidden="true" role="img" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${faKey.icon[0]} ${faKey.icon[1]}" class="w-3 h-3 mr-2 overflow-visible inline-block">
                    <path fill="currentColor" d="${faKey.icon[4]}"/>
                  </svg>
                  <b>${series[j][dataPointIndex]}명</b>
                </div>
              </div>
              <div class="text-xs px-2 mt-3 border rounded-full text-white" style="background-color: ${text_to_dark_color(metadata.game && "" + metadata.game.id || "")}">
                ${metadata.game != null? metadata.game.name: ""} 
              </div>
          </div>`;
        }
      },
      dataLabels: { enabled: false },
      legend: { show: false },
      stroke: { show: false },
      fill: {
        colors: viewer_count_change_chunks_of_week[i].map(_ => "#558FFb"),
        opacity: 1.0,
        type: [
          ...chatter_count_change_chunks_of_week[i].map(chunk => 'image'),
          ...viewer_count_change_chunks_of_week[i].map(chunk => 'solid'),
        ],
        image: {
          src: viewer_count_change_chunks_of_week[i].map((chunk, j) => chunk.game?  chunk.game.box_art_url.replace("{width}", "40").replace("{height}", "50"): null),
					opacity: 1.0,
          width: 40,
          height: 50,
        },
      },
      annotations: {
        position: "front",
        xaxis: xaxis_annotations[i],
        points: [
          (!streamer.is_streaming)? null: {
            x: viewer_count_changes[viewer_count_changes.length-1][0],
            y: viewer_count_changes[viewer_count_changes.length-1][1],
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
          },
        ],
      },
    }));
  }
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
