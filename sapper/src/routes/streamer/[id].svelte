<svelte:head>
	<title> 트수gg - {streamer.name} </title>
</svelte:head>

<script context="module">
	import { API } from '../../api.js';
  export async function preload(page, session) {
    const { id } = page.params;
    let streamer = await API.streamer.call(this, id);
    let similar_streamers = await API.similar_streamers.call(this, id);
<<<<<<< HEAD
    let similar_streamers_top10 = similar_streamers.slice(0, 10);
    return { streamer, similar_streamers, similar_streamers_top10 };
=======
    return { streamer, similar_streamers };
>>>>>>> d2889d99c97bdce47071bfd176272aab8192b643
  }
</script>


<div class="w-full md:h-48 h-40 bg-primary-600">
</div>


<div class="container m-auto flex flex-col md:items-start items-center px-4">
  <img
    class="rounded-lg w-64 h-64 md:w-auto md:self-start self-center md:h-auto md:-mt-40 -mt-32 z-5 border-4 border-gray-200 bg-gray-200"
    src="{streamer.profile_image_url}"
    alt="프로필 이미지"
  />
  <div class="mt-8">
    <h1 class="text-4xl tracking-wider inline">{streamer.name}</h1>
<<<<<<< HEAD
    <Badges streamer={streamer} class="ml-2"> </Badges>
    <GameBadges streamer={streamer} class="flex flex-row pt-2 flex-wrap"> </GameBadges>
=======
    <span class="ml-2">
      {#if badges.has("twitch")}
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" class="w-4 h-4 inline-block text-primary-900"><path fill="currentColor" d="M2.149 0l-1.612 4.119v16.836h5.731v3.045h3.224l3.045-3.045h4.657l6.269-6.269v-14.686h-21.314zm19.164 13.612l-3.582 3.582h-5.731l-3.045 3.045v-3.045h-4.836v-15.045h17.194v11.463zm-3.582-7.343v6.262h-2.149v-6.262h2.149zm-5.731 0v6.262h-2.149v-6.262h2.149z"/></svg>
      {/if}
    </span>
>>>>>>> d2889d99c97bdce47071bfd176272aab8192b643
  </div>
  <div class="mt-12">
    {streamer.description}
  </div>
<<<<<<< HEAD
  <div class="mt-8 flex flex-row">
=======
  <div class="mt-8">
>>>>>>> d2889d99c97bdce47071bfd176272aab8192b643
    <a class="text-xs text-blue-500 flex flex-row items-center" href="https://www.twitch.tv/{streamer.login}">
      <svg area-hidden="true" role="img" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 {faExternalLinkAlt.icon[0]} {faExternalLinkAlt.icon[1]}" class="w-3 h-3 mr-1 overflow-visible inline-block">
        <path fill="currentColor" d="{faExternalLinkAlt.icon[4]}"/>
      </svg>
      <span>트위치 채널</span>
    </a>
<<<<<<< HEAD
    <a class="text-xs text-blue-500 flex flex-row items-center ml-4" href="/map?interest_streamer_id={streamer.id}">
      <svg area-hidden="true" role="img" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 {faExternalLinkAlt.icon[0]} {faExternalLinkAlt.icon[1]}" class="w-3 h-3 mr-1 overflow-visible inline-block">
        <path fill="currentColor" d="{faExternalLinkAlt.icon[4]}"/>
      </svg>
      <span>지도에서 찾기</span>
    </a>
  </div>
  <table class="mt-6 text-xs">
    <tr>
        <td class="w-1 bg-orange-400"> </td>
        <td class="text-left p-1">평청자</td>
        <td class="pl-6 text-orange-400">
          <span class="font-bold text-base">{streamer.average_viewer_count.toLocaleString('ko', {useGrouping:true})}</span>
          명
        </td>
    </tr>
    <tr>
        <td class="w-1 bg-purple-400"> </td>
        <td class="text-left p-1">팔로워</td>
        <td class="pl-6 text-purple-400">
          <span class="font-bold text-base">{streamer.follower_count.toLocaleString('ko', {useGrouping:true})}</span>
          명
        </td>
    </tr>
    <tr>
        <td class="w-1 bg-blue-400"> </td>
        <td class="text-left p-1">방송량</td>
        <td class="pl-6 text-blue-400">
          주 
          <span class="font-bold text-base">{(streamer.streaming_hours_per_week || 0).toFixed(1)}</span> 시간</td>
    </tr>
    <tr>
        <td class="w-1 bg-green-400"> </td>
        <td class="text-left p-1">방송시간대</td>
        <td class="pl-6 text-green-400">
          <span class="pr-2">
            <span class="font-bold text-base">{Math.floor(streaming_start_time/3600)}</span>시 
            <span class="font-bold text-base">{Math.floor(streaming_start_time%3600/60)}</span>분 
            <span class="text-gray-600"> (±{(streaming_start_time_std/3600).toFixed(1)}시간) </span> 
            ~
            <span class="font-bold text-base">{Math.floor(streaming_end_time/3600)}</span>시 
            <span class="font-bold text-base">{Math.floor(streaming_end_time%3600/60)}</span>분
            <span class="text-gray-600"> (±{(streaming_end_time_std/3600).toFixed(1)}시간) </span> 
          </span>
        </td>
    </tr>
    <tr>
        <td class="w-1 bg-teal-400"> </td>
        <td class="text-left p-1">주방송시간</td>
        <td class="pl-6 text-teal-400">
=======
  </div>
  <table class="mt-6 text-xs">
    <tr>
        <td class="text-right">평청자</td>
        <td class="pl-6">
          <span class="font-bold text-base">{streamer.average_viewer_count}</span>
          명
        </td>
    </tr>
    <!--<tr>
        <td class="">팔로워</td>
        <td class="ml-4 font-bold text-base">{streamer.follower_count}</td>
    </tr>-->
    <tr>
        <td class="text-right">방송시간</td>
        <td class="pl-6">
          하루에 
          <span class="font-bold text-base">{(total_streaming_time_ratio * 24).toFixed(1)}</span> 시간</td>
    </tr>
    <tr>
        <td class="text-right">방송시간대</td>
        <td class="pl-6">
>>>>>>> d2889d99c97bdce47071bfd176272aab8192b643
          {#each mean_streaming_time_ranges as range}
            <span class="pr-2">
              <span class="font-bold text-base">{Math.floor(range[0]/3600)}</span>시 
              <span class="font-bold text-base">{Math.floor(range[0]%3600/60)}</span>분 ~ 
              <span class="font-bold text-base">{Math.floor(range[1]/3600)}</span>시 
              <span class="font-bold text-base">{Math.floor(range[1]%3600/60)}</span>분
            </span>
          {/each}
          <span class="text-gray-600"> 
            ({(mean_streaming_time_reliability * 100).toFixed(0)}% 확률)
          </span> 
        </td>
    </tr>
<<<<<<< HEAD
    <!--<tr>
        <td class="text-right">방송분산도</td>
        <td class="pl-6 font-bold text-base">{(streaming_time_ranges_variance * 100).toFixed(1)}%</td>
    </tr>-->
=======
    <tr>
        <td class="text-right">방송분산도</td>
        <td class="pl-6 font-bold text-base">{(streaming_time_ranges_variance * 100).toFixed(1)}%</td>
    </tr>
>>>>>>> d2889d99c97bdce47071bfd176272aab8192b643
  </table>
</div>

<div class="flex flex-col items-center m-auto container">
<<<<<<< HEAD
  <div class="flex md:flex-row flex-col w-full items-stretch flex-wrap mt-8">
    <div class="flex flex-col md:w-1/2 w-full md:pr-2">
      <Panel class="w-full">
        <h2 slot="title" class="inline-block md:font-base font-2xl"> 시청자 유사도</h2>
        <div slot="contents" class="">
          <Network 
            {streamer}
            nodes={[...similar_streamers_top10, streamer]} 
            edges={similar_streamers_top10.map(s => ({from: streamer.id, to: s.id, length: Math.max(0.1, 1-(s.similarity*s.similarity*10)), strength: s.similarity*s.similarity*100}))}
            class="w-full p-6"
            onrendered={()=>{0 && load_timeline()}}
            let:node={node}>
            <a class="flex flex-col w-10 md:w-16 flex-wrap items-center" href="/streamer/{node.id}">
              <img class="w-10 h-10 md:w-16 md:h-16 rounded-full bg-white border border-gray-600" src="{node.profile_image_url}" art="프로필 사진" />
              <div class="flex flex-col flex-wrap items-center"> 
                <span class="md:text-sm text-xs"> {node.name} </span>
                {#if node.similarity} <span class="text-xs text-gray-600 tracking-wider"> ({(node.similarity*100).toFixed(1)}%) </span> {/if}
              </div>
            </a>
          </Network>
          <div class="flex flex-row flex-wrap w-full">
          {#each similar_streamers.slice(10) as node}
            <a class="flex flex-col w-1/5 flex-wrap items-center my-2" href="/streamer/{node.id}">
              <img class="w-10 h-10 md:w-16 md:h-16 rounded-full bg-white border border-gray-600" src="{node.profile_image_url}" art="프로필 사진" />
              <div class="flex flex-col flex-wrap items-center"> 
                <span class="md:text-sm text-xs"> {node.name} </span>
                {#if node.similarity} <span class="text-xs text-gray-600 tracking-wider"> ({(node.similarity*100).toFixed(1)}%) </span> {/if}
              </div>
            </a>
          {/each}
          </div>
          <button class="w-full py-3 border-t" on:click={e=>API.similar_streamers(streamer.id, similar_streamers.length).then(res => similar_streamers = [...similar_streamers, ...res])}>
            더 보기
          </button>
        </div>
      </Panel>
      <div class="flex md:flex-row flex-col">
        <div class="flex flex-col w-full md:w-1/2">
          <Panel class="w-full">
            <h2 slot="title" class="inline-block md:font-base font-2xl"> 방송 달력</h2>
            <div slot="contents" class="h-full">
              {#each month_offsets as month_offset, i (month_offset)}
              <div class="pr-4">
                <StreamCalendarHeatmap 
                  class="w-full h-full" 
                  {month_offset}
                  is_head={i==0}
                  streamer={streamer} />
              </div>
              {/each}
              <button class="w-full py-3 border-t mt-2" on:click={e=>month_offsets = [month_offsets[0]-1, ...month_offsets]}> 더 보기 </button>
            </div>
          </Panel>
          <Panel class="w-full">
            <h2 slot="title" class="inline-block md:font-base font-2xl"> 방송 주기 </h2>
            <div slot="contents" class="h-full">
              <StreamSpiral 
                bind:mean_streaming_time_ranges={mean_streaming_time_ranges}
                bind:mean_streaming_time_reliability={mean_streaming_time_reliability}
                bind:streaming_time_ranges_variance={streaming_time_ranges_variance}
                bind:total_streaming_time_ratio={total_streaming_time_ratio}
                bind:streaming_start_time={streaming_start_time}
                bind:streaming_start_time_std={streaming_start_time_std}
                bind:streaming_end_time={streaming_end_time}
                bind:streaming_end_time_std={streaming_end_time_std}
                class="w-full h-full -mt-4" 
                streamer={streamer}/>
            </div>
          </Panel>
        </div>
        <div class="flex flex-col w-full md:w-1/2">
          <Panel class="w-full">
            <h2 slot="title" class="inline-block"> 구독자 비율 </h2>
            <div slot="contents" class="w-full p-2 h-full">
              <SubscriberDistribution streamer_id={streamer.id}/>
            </div>
          </Panel>
          <Panel class="w-full">
            <h2 slot="title" class="inline-block"> 구독자 채팅 비율 </h2>
            <div slot="contents" class="md:w-full w-48 p-4 h-full m-auto">
              <div 
                class="rounded-full inline-block w-full"
                style="background: radial-gradient(white 60%, transparent 61%), conic-gradient(#CDA8C7 0% {streamer.average_subscriber_chat_ratio*100}%, #e2e8f0 {streamer.average_subscriber_chat_ratio*100}% 100%); padding-bottom: 100%;">
                <div class="absolute text-3xl font-bold text-primary-600" style="left: 50%; top: 50%; transform: translate(-50%, -50%);"> 
                  {(streamer.average_subscriber_chat_ratio*100).toFixed(0)}%
                </div>
              </div>
            </div>
          </Panel>
        </div>
      </div>
    </div>
    <div class="flex flex-col w-full md:w-1/2 md:pl-2">
      <Panel class="w-full">
        <h2 slot="title" class="inline-block"> 최근 방송 채팅 키워드 </h2>
        <div slot="contents" class="w-full p-2 h-full">
          <KeywordCloud streamer_id={streamer.id}/>
        </div>
      </Panel>
      <Panel class="w-full">
        <h2 slot="title" class="inline-block"> 댓글 </h2>
        <div slot="contents" class="w-full p-2">
          <Comments streamer_id={streamer.id}/>
        </div>
      </Panel>
    </div>
  </div>

=======
  <div class="flex md:flex-row flex-col w-full items-stretch">
    <Panel class="md:w-1/2 w-full" left>
      <h2 slot="title" class="inline-block md:font-base font-2xl"> 방송 주기 </h2>
      <div slot="contents" class="h-full">
        <StreamSpiral 
          bind:mean_streaming_time_ranges={mean_streaming_time_ranges}
          bind:mean_streaming_time_reliability={mean_streaming_time_reliability}
          bind:streaming_time_ranges_variance={streaming_time_ranges_variance}
          bind:total_streaming_time_ratio={total_streaming_time_ratio}
          class="w-full h-full" 
          streamer={streamer}/>
      </div>
    </Panel>
    <Panel class="md:w-1/2 w-full" right>
      <h2 slot="title" class="inline-block md:font-base font-2xl"> 비슷한 스트리머 </h2>
      <div slot="contents" class="p-6">
        <Network 
          {streamer}
          nodes={[...similar_streamers, streamer]} 
          edges={similar_streamers.map(s => ({from: streamer.id, to: s.id, length: Math.max(0.1, 1-(s.similarity*s.similarity*10)), strength: s.similarity*s.similarity*100}))}
          class="w-full"
          onrendered={()=>{0 && load_timeline()}}
          let:node={node}>
          <a class="flex flex-col w-10 md:w-16 flex-wrap items-center" href="/streamer/{node.id}">
            <img class="w-10 h-10 md:w-16 md:h-16 rounded-full" src="{node.profile_image_url}" art="프로필 사진" />
            <div class="flex flex-col flex-wrap items-center"> 
              <span class="md:text-sm text-xs"> {node.name} </span>
              {#if node.similarity} <span class="text-xs text-gray-600 tracking-wider"> ({(node.similarity*100).toFixed(1)}%) </span> {/if}
            </div>
          </a>
        </Network>
      </div>
    </Panel>
  </div>
>>>>>>> d2889d99c97bdce47071bfd176272aab8192b643
  <Panel class="w-full">
    <h2 slot="title" class="inline-block md:font-base font-2xl"> 방송 타임라인 </h2>
    <div slot="contents" class="w-full">
      {#each timelines as days_ago ("" + streamer.id + "-" + days_ago)}
        <Timeline2 {streamer} {days_ago} header={days_ago===0}/>
      {:else} 
        <div class="w-full h-64 spinner"/> 
      {/each}
      <button on:click={load_timeline} class="w-full border-t p-2">더 보기</button>
    </div>
  </Panel>
</div>


<script>
  import { onMount } from "svelte";
  import { faExternalLinkAlt } from '@fortawesome/free-solid-svg-icons/faExternalLinkAlt'
<<<<<<< HEAD
=======
  import { text_to_dark_color } from "../../util.js";
>>>>>>> d2889d99c97bdce47071bfd176272aab8192b643
	import Panel from "../../components/Panel.svelte"; 
	import Network from "../../components/Network.svelte"; 
	import Timeline2 from "../../components/Timeline2.svelte"; 
	import StreamSpiral from "../../components/StreamSpiral.svelte"; 
<<<<<<< HEAD
	import Comments from "../../components/Comments.svelte"; 
	import KeywordCloud from "../../components/KeywordCloud.svelte"; 
	import SubscriberDistribution from "../../components/SubscriberDistribution.svelte"; 
	import Badges from "../../components/Badges.svelte"; 
	import GameBadges from "../../components/GameBadges.svelte"; 
	import StreamCalendarHeatmap from "../../components/StreamCalendarHeatmap.svelte"; 
  import { flip } from "svelte/animate";

  export let streamer;
  export let similar_streamers;
  export let similar_streamers_top10;
=======

  export let streamer;
  export let similar_streamers;
>>>>>>> d2889d99c97bdce47071bfd176272aab8192b643
  export let mean_streaming_time_ranges = [];
  export let mean_streaming_time_reliability = 0.0;
  export let streaming_time_ranges_variance = 0.0;
  export let total_streaming_time_ratio = 0.0;
<<<<<<< HEAD
  export let streaming_start_time = 0.0;
  export let streaming_start_time_std = 0.0;
  export let streaming_end_time = 0.0;
  export let streaming_end_time_std = 0.0;

  let timelines = [];
  let last_streamer = streamer;
=======

  let timelines = [];
  let last_streamer = streamer;
  $: badges = new Set([
    streamer.broadcaster_type == "partner"? "twitch": null,
  ]);
>>>>>>> d2889d99c97bdce47071bfd176272aab8192b643
  $: {
    if(last_streamer != streamer){
      timelines  = [];
      last_streamer = streamer;
      load_timeline();
    }
  }

  function load_timeline() {
    if(timelines.length){
<<<<<<< HEAD
      for(let i=0; i<7; ++i)
        timelines.push(timelines[timelines.length-1]+1)
=======
      for(let i=1; i<=7; ++i)
        timelines.push(timelines[timelines.length-1]+i)
>>>>>>> d2889d99c97bdce47071bfd176272aab8192b643
      timelines = timelines;
    }
    else
      timelines = [0,1,2,3,4,5,6]
  }
  load_timeline();
<<<<<<< HEAD


  let month_offsets = [-1, 0];
=======
>>>>>>> d2889d99c97bdce47071bfd176272aab8192b643
</script>
