<<<<<<< HEAD
<svelte:head>
	<title>스트리머 순위 - 트수gg</title>
</svelte:head>

<svg class="hidden">
</svg>
<div class="flex flex-col md:items-start items-stretch container m-auto w-full">
  <div class="pt-10 pb-2 m-auto">
    <StreamerAutoComplete bind:onselect={on_streamer_search} 
          placeholder="스트리머 검색" 
          inputid="streamer-search-input" 
          id="navigation-streamer-search"
          class="w-full md:w-128"
          input_class="border w-full text-normal p-6 px-7 py-4 pl-10 bg-white shadow"
          autocomplete_class="w-full"
          icon_class="w-4 h-4 ml-2"
          />
    <div class="text-sm text-gray-400 mt-2 text-center">
      * 시청자가 25명 이상인 스트리머가 자동으로 등록됩니다.
    </div>
  </div>
  <Panel class="md:p-4">
    <h3 slot="title" class="inline-block md:font-base font-2xl"> 
      실시간 시청자 이동
      <Tip>
        <span slot="tip"> 
          스트리머 간 시청자의 흐름을 실시간으로 살펴볼수 있습니다.<br>
          각 화살표를 클릭해서 더 자세한 정보를 확인해보세요.
        <br>
        * 약 한 시간 간격으로 업데이트됩니다.
        </span>
      </Tip>
      {#if viewer_migration_count_ranking.length}
        <span class="text-gray-600 ml-2 text-sm">
          {time_ago(new Date(viewer_migration_count_ranking[0].time))}에 업데이트됨
        </span>
      {/if}
    </h3>
    <div slot="contents" class="w-full text-xs whitespace-no-wrap flex flex-row flex-wrap">
      {#each viewer_migration_count_ranking as v, i (v.source_id + "-" + v.destination_id)}
        <div class="md:w-1/5 w-1/2 p-2">
          <span class="flex flex-row items-center justify-center">
            <a class="flex-none p-2" href="/streamer/{v.source_id}">
              <img class="rounded-full h-12 w-12 border border-gray-600" src={v.source_profile_image_url} />
              <div class="pt-1 truncate w-12" title="{v.source_name}">{v.source_name}</div>
            </a>
            <a class="text-center" href="/migration?id1={v.source_id}&id2={v.destination_id}&date={new Date().getTime()}">
              <svg class="w-8 h-4 overflow-visible inline-block" viewBox="0,0,20,1">
                <defs>
                  <marker id="head" 
                    markerWidth="2" markerHeight="4" 
                                    refX="0.1" refY="2" orient="auto" >
                    <path d="M0,0 V4 L2,2 Z" fill="currentColor" />
                </defs>
                  <path fill="currentColor" d="M0,0 L{20-Math.sqrt(v.migration_count)/10*2},0" stroke-width="{Math.sqrt(v.migration_count)/10}" stroke="currentColor" marker-end="url(#head)" />
              </svg>
              <div class="text-gray-600">
                {v.migration_count}명
              </div>
            </a>
            <a class="flex-none p-2" href="/streamer/{v.destination_id}">
              <img class="rounded-full h-12 w-12 border border-gray-600" src={v.destination_profile_image_url} />
              <div class="pt-1 truncate w-12" title="{v.destination_name}">{v.destination_name}</div>
            </a>
          </span>
        </div>
      {/each}
        <button on:click={load_viewer_migration_count_ranking} class="w-full py-4 border-t">
            더 보기
        </button>
    </div>
  </Panel>
  <Panel class="md:p-4">
    <h3 slot="title" class="inline-block md:font-base font-2xl"> 
      스트리머 순위
      <Tip>
        <span slot="tip"> 
        다양한 지표를 기준으로 스트리머 순위를 확인할 수 있습니다.<br> 
        표 상단의 각 지표를 클릭하여 정렬시켜보세요.<br>
        * 약 5분 간격으로 업데이트됩니다.
        </span>
      </Tip>
      {#if viewer_migration_count_ranking.length}
        <span class="text-gray-600 ml-2 text-sm">
          {time_ago(new Date(ranking_update_time))}에 업데이트됨
        </span>
      {/if}
    </h3>
    <table slot="contents" class="w-full text-xs whitespace-no-wrap streamer-ranking" width="1000">
      <thead>
        <tr class="border-b border-gray-400">
          <th class="" width="50">순위</th>
          <th width="400">스트리머</th>
          <th width="100" class="group cursor-pointer hover:bg-red-600 hover:text-white text-red-600 border-red-600" 
              class:ordered={state.order_by=="chatting_speed"} 
              on:click={e=>change_order("chatting_speed", true)} title="실시간 채팅속도">
            {#if state.order_by == "chatting_speed"}
              {#if state.desc}
                <FaIcon icon={faCaretDown} class="w-4 h-4" />
              {:else}
                <FaIcon icon={faCaretUp} class="w-4 h-4" />
              {/if}
            {/if}
            <FaIcon icon={faComment} class="w-4 h-4" />
            <span class="xl:inline hidden text-gray-800 group-hover:text-white">
              실시간 채팅속도
            </span>
          </th>
          <th width="100" class="group cursor-pointer hover:bg-yellow-600 hover:text-white text-yellow-600 border-yellow-600" 
              class:ordered={state.order_by=="viewer_count"}
              on:click={e=>change_order("viewer_count", true)} title="실청자">
            {#if state.order_by == "viewer_count"}
              {#if state.desc}
                <FaIcon icon={faCaretDown} class="w-4 h-4" />
              {:else}
                <FaIcon icon={faCaretUp} class="w-4 h-4" />
              {/if}
            {/if}
            <FaIcon icon={faUser} class="w-4 h-4" />
            <span class="xl:inline hidden text-gray-800 group-hover:text-white">
              실청자 
            </span>
          </th>
          <th width="100" class="group cursor-pointer hover:bg-purple-600 hover:text-white text-purple-600 border-purple-600" 
              class:ordered={state.order_by=="follower_count"}
              on:click={e=>change_order("follower_count", true)} title="팔로워">
            {#if state.order_by == "follower_count"}
              {#if state.desc}
                <FaIcon icon={faCaretDown} class="w-4 h-4" />
              {:else}
                <FaIcon icon={faCaretUp} class="w-4 h-4" />
              {/if}
            {/if}
            <FaIcon icon={faStar} class="w-4 h-4" />
            <span class="xl:inline hidden text-gray-800 group-hover:text-white">
              팔로워
            </span>
          </th>
          <th width="100" class="group cursor-pointer hover:bg-orange-600 hover:text-white text-orange-600 border-orange-600" 
              class:ordered={state.order_by=="average_viewer_count"}
              on:click={e=>change_order("average_viewer_count", true)} title="평청자">
            {#if state.order_by == "average_viewer_count"}
              {#if state.desc}
                <FaIcon icon={faCaretDown} class="w-4 h-4" />
              {:else}
                <FaIcon icon={faCaretUp} class="w-4 h-4" />
              {/if}
            {/if}
            <FaIcon icon={faUserClock} class="w-5 h-4" />
            <span class="xl:inline hidden text-gray-800 group-hover:text-white">
              평청자 
            </span>
          </th>
          <th width="100" class="group cursor-pointer hover:bg-green-600 hover:text-white text-green-600 hidden md:table-cell border-green-600" 
              class:ordered={state.order_by=="viewer_chatter_ratio"}
              on:click={e=>change_order("viewer_chatter_ratio", false)} title="로그인/실청자 비율">
            {#if state.order_by == "viewer_chatter_ratio"}
              {#if state.desc}
                <FaIcon icon={faCaretDown} class="w-4 h-4" />
              {:else}
                <FaIcon icon={faCaretUp} class="w-4 h-4" />
              {/if}
            {/if}
            <FaIcon icon={faUserLock} class="w-5 h-4" />
            <span class="xl:inline hidden text-gray-800 group-hover:text-white">
              로그인비
            </span>
          </th>
          <th width="100" class="group cursor-pointer hover:bg-teal-600 hover:text-white text-teal-600 hidden md:table-cell border-teal-600" 
              class:ordered={state.order_by=="average_subscriber_ratio"}
              on:click={e=>change_order("average_subscriber_ratio", true)} title="구독자비율">
            {#if state.order_by == "average_subscriber_ratio"}
              {#if state.desc}
                <FaIcon icon={faCaretDown} class="w-4 h-4" />
              {:else}
                <FaIcon icon={faCaretUp} class="w-4 h-4" />
              {/if}
            {/if}
            <span>
              <FaIcon icon={faUser} class="w-4 h-4" />
              <FaIcon icon={faDollarSign} class="w-3 h-3 -ml-2 -mt-2" />
            </span>
            <span class="xl:inline hidden text-gray-800 group-hover:text-white">
              구독자비 
            </span>
          </th>
          <th width="100" class="group cursor-pointer hover:bg-blue-600 hover:text-white text-blue-600 border-blue-600 hidden md:table-cell" 
              class:ordered={state.order_by=="streaming_hours_per_week"}
              on:click={e=>change_order("streaming_hours_per_week", true)} title="방송시간">
            {#if state.order_by == "streaming_hours_per_week"}
              {#if state.desc}
                <svg area-hidden="true" role="img" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 {faCaretDown.icon[0]} {faCaretDown.icon[1]}" class="w-4 h-4 overflow-visible inline-block">
                  <path fill="currentColor" d="{faCaretDown.icon[4]}"/>
                </svg>
              {:else}
                <svg area-hidden="true" role="img" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 {faCaretUp.icon[0]} {faCaretUp.icon[1]}" class="w-4 h-4 overflow-visible inline-block">
                  <path fill="currentColor" d="{faCaretUp.icon[4]}"/>
                </svg>
              {/if}
            {/if}
            {#if state.order_by == "streaming_hours_per_week"}
              {#if state.desc}
                <FaIcon icon={faCaretDown} class="w-4 h-4" />
              {:else}
                <FaIcon icon={faCaretUp} class="w-4 h-4" />
              {/if}
            {/if}
            <FaIcon icon={faHourglassHalf} class="w-4 h-4" />
            <span class="xl:inline hidden text-gray-800 group-hover:text-white">
              방송시간 
            </span>
          </th>
          <th width="100" class="hidden md:table-cell" title="마지막 방송">
            <FaIcon icon={faHistory} class="w-4 h-4" />
            <span class="xl:inline hidden text-gray-800">
              마지막 방송
            </span>
          </th>
        </tr>
      </thead>
      <tbody class="">
        {#each rankings[JSON.stringify(state)] as streamer, i (streamer.id)}
        <tr class="odd:bg-gray-100">
          <td class="text-xl text-gray-600 text-center">
            {i+1}
          </td>
          <td class="flex flex-row items-center max-w-5xl">
            <a class="flex-none self-start md:self-center" href="/streamer/{streamer.id}">
              <img class="rounded-full md:h-12 md:w-12 h-8 w-8 border border-gray-600" src={streamer.profile_image_url} />
            </a>
            <div class="flex-shrink md:pl-2 text-left">
              <div>
                <a class="" href="/streamer/{streamer.id}">
                  <span class="pl-2">{streamer.name}</span>
                </a>
                <Badges {streamer} class="inline-block block ml-1"> </Badges>
              </div>
              <GameBadges {streamer} class="flex flex-row md:ml-2 -ml-8 md:pt-1 pt-4 flex-wrap"> </GameBadges>
            </div>
          </td>
          <td class="text-red-600">
            {#if streamer.chatting_speed}
              {streamer.chatting_speed.toFixed(1)}개/초
            {/if}
          </td>
          <td class="text-yellow-600">
            {#if streamer.viewer_count != null}
              {streamer.viewer_count.toLocaleString('ko', {useGrouping:true})}명
            {/if}
          </td>
          <td class="text-purple-600">
            {streamer.follower_count.toLocaleString('ko', {useGrouping:true})}명
          </td>
          <td class="text-orange-600">
            {streamer.average_viewer_count.toLocaleString('ko', {useGrouping:true})}명
          </td>
          <td class="text-green-600 hidden md:table-cell">
            {#if streamer.viewer_chatter_ratio != null}
              {(streamer.viewer_chatter_ratio*100).toFixed(1)}%
            {/if}
          </td>
          <td class="text-teal-600 hidden md:table-cell">
            {#if streamer.average_subscriber_ratio}
              {(streamer.average_subscriber_ratio*100).toFixed(1)}%
            {/if}
          </td>
          <td class="text-blue-600 w-32 hidden md:table-cell">
            {#if streamer.streaming_hours_per_week}
              주 {streamer.streaming_hours_per_week.toFixed(1)}시간
            {:else}
            {/if}
          </td>
          <td class="text-gray-600 hidden md:table-cell">
            {#if streamer.is_streaming}
              지금
            {:else if streamer.last_streaming_time}
              {time_ago(new Date(streamer.last_streaming_time))}
            {:else}
            {/if}
          </td>
        </tr>
        {/each}
      </tbody>
      <tfoot>
        <tr class="">
          <td colspan="42" class="">
            <button on:click={load_ranking} class="w-full py-4 border-t">
                더 보기
            </button>
          </td>
        </tr>
      </tfoot>
    </table>
  </Panel>
</div>

<script>
import { onMount } from "svelte";
import { API } from '../api.js';
import Panel from "../components/Panel.svelte";
import Badges from "../components/Badges.svelte";
import GameBadges from "../components/GameBadges.svelte";
import Tip from '../components/Tip.svelte';
import FaIcon from '../components/FaIcon.svelte';
import StreamerAutoComplete from "../components/StreamerAutoComplete.svelte";
import { time_ago } from "../util.js";

import { faComment } from '@fortawesome/free-solid-svg-icons/faComment';
import { faKey } from '@fortawesome/free-solid-svg-icons/faKey';
import { faUser } from '@fortawesome/free-solid-svg-icons/faUser';
import { faUserClock } from '@fortawesome/free-solid-svg-icons/faUserClock';
import { faUserLock } from '@fortawesome/free-solid-svg-icons/faUserLock';
import { faHourglassHalf } from '@fortawesome/free-solid-svg-icons/faHourglassHalf';
import { faHistory } from '@fortawesome/free-solid-svg-icons/faHistory';
import { faDollarSign } from '@fortawesome/free-solid-svg-icons/faDollarSign';
import { faStar } from '@fortawesome/free-solid-svg-icons/faStar';
import { faArrowRight } from '@fortawesome/free-solid-svg-icons/faArrowRight';
import { faExchangeAlt } from '@fortawesome/free-solid-svg-icons/faExchangeAlt';
import { faCaretUp } from '@fortawesome/free-solid-svg-icons/faCaretUp';
import { faCaretDown } from '@fortawesome/free-solid-svg-icons/faCaretDown';

let state = {
  "order_by": "chatting_speed",
  "desc": true,
}

let current_order_by = "chatting_speed";
let current_desc = true;
let rankings = { };
let offsets = { };
let ranking_update_time = null;

let viewer_migration_count_ranking = [];
let viewer_migration_count_offset = 0;

function change_order(order_by, desc) {
  /*if(order_by == state.order_by)
    state.desc = !state.desc;
  else*/
    state = {
      "order_by": order_by,
      "desc":  desc,
    };
  if(!rankings[JSON.stringify(state)]) {
    load_ranking();
  }
}

function load_ranking(){
  if(offsets[JSON.stringify(state)] == null)
    offsets[JSON.stringify(state)] = 0;
  if(rankings[JSON.stringify(state)] == null)
    rankings[JSON.stringify(state)] = [];
  offsets[JSON.stringify(state)] = rankings[JSON.stringify(state)].length;
  let last_state = {
    "order_by": state.order_by,
    "desc": state.desc
  };
  API.streamer_ranking(offsets[JSON.stringify(last_state)], last_state.order_by, last_state.desc).then(ranking => {
    if(ranking){
      rankings[JSON.stringify(last_state)] = [...rankings[JSON.stringify(last_state)], ...ranking]
      console.log(ranking);
      ranking_update_time = Math.max(ranking_update_time, ...ranking.map(r => new Date(r.last_streaming_time).getTime()));
      console.log(ranking_update_time);
      console.log(new Date(ranking_update_time));
    }
  });
}

function load_viewer_migration_count_ranking(){
  viewer_migration_count_offset = viewer_migration_count_ranking.length;
  API.viewer_migration_count_ranking(viewer_migration_count_offset).then(ranking => {
    if(ranking){
      viewer_migration_count_ranking = [...viewer_migration_count_ranking, ...ranking];
    }
  });
}

load_ranking();
load_viewer_migration_count_ranking();

function on_streamer_search(target) {
  window.location.pathname = "/streamer/" + target.id;
}
</script>

<style>
  @media (min-width: 768px) { 
    .streamer-ranking tbody td {
      padding: 0.5rem 0.25rem;
      padding-top: 1.0rem;
      padding-bottom: 1.0rem;
      text-align: center;
    }
    .streamer-ranking thead th {
      padding-left: 1rem;
      padding-right: 1rem;
      padding-bottom: .5rem;
      padding-top: .5rem;
    }
  }
  .streamer-ranking tbody td {
    padding: 0.5rem 0.25rem;
    padding-top: 1.0rem;
    padding-bottom: 1.0rem;
    text-align: center;
  }
  .streamer-ranking thead th {
    padding-left: 0.5rem;
    padding-right: 0.5rem;
    padding-bottom: .5rem;
    padding-top: .5rem;
  }
  .streamer-ranking tbody tr td:last-child {
    padding-right: 1rem;
  }
  .streamer-ranking .ordered {
    border-bottom-width: 2px;
  }
</style>
=======
<script>
import { onMount } from "svelte";
onMount(()=>{
  window.location = "map";
});
</script>

<svelte:head>
	<title>스트리머 지도</title>
</svelte:head>

<div>
잠시만요..
</div>

>>>>>>> d2889d99c97bdce47071bfd176272aab8192b643
