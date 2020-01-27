<svelte:head>
	<title> 트수gg - {streamer.name} </title>
</svelte:head>

<script context="module">
	import { API } from '../../api.js';
  export async function preload(page, session) {
    const { id } = page.params;
    let streamer = await API.streamer.call(this, id);
    let similar_streamers = await API.similar_streamers.call(this, id);
    return { streamer, similar_streamers };
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
    <span class="ml-2">
      {#if badges.has("twitch")}
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" class="w-4 h-4 inline-block text-primary-900"><path fill="currentColor" d="M2.149 0l-1.612 4.119v16.836h5.731v3.045h3.224l3.045-3.045h4.657l6.269-6.269v-14.686h-21.314zm19.164 13.612l-3.582 3.582h-5.731l-3.045 3.045v-3.045h-4.836v-15.045h17.194v11.463zm-3.582-7.343v6.262h-2.149v-6.262h2.149zm-5.731 0v6.262h-2.149v-6.262h2.149z"/></svg>
      {/if}
    </span>
  </div>
  <div class="mt-12">
    {streamer.description}
  </div>
  <div class="mt-8">
    <a class="text-xs text-blue-500 flex flex-row items-center" href="https://www.twitch.tv/{streamer.login}">
      <svg area-hidden="true" role="img" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 {faExternalLinkAlt.icon[0]} {faExternalLinkAlt.icon[1]}" class="w-3 h-3 mr-1 overflow-visible inline-block">
        <path fill="currentColor" d="{faExternalLinkAlt.icon[4]}"/>
      </svg>
      <span>트위치 채널</span>
    </a>
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
    <tr>
        <td class="text-right">방송분산도</td>
        <td class="pl-6 font-bold text-base">{(streaming_time_ranges_variance * 100).toFixed(1)}%</td>
    </tr>
  </table>
</div>

<div class="flex flex-col items-center m-auto container">
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
  import { text_to_dark_color } from "../../util.js";
	import Panel from "../../components/Panel.svelte"; 
	import Network from "../../components/Network.svelte"; 
	import Timeline2 from "../../components/Timeline2.svelte"; 
	import StreamSpiral from "../../components/StreamSpiral.svelte"; 

  export let streamer;
  export let similar_streamers;
  export let mean_streaming_time_ranges = [];
  export let mean_streaming_time_reliability = 0.0;
  export let streaming_time_ranges_variance = 0.0;
  export let total_streaming_time_ratio = 0.0;

  let timelines = [];
  let last_streamer = streamer;
  $: badges = new Set([
    streamer.broadcaster_type == "partner"? "twitch": null,
  ]);
  $: {
    if(last_streamer != streamer){
      timelines  = [];
      last_streamer = streamer;
      load_timeline();
    }
  }

  function load_timeline() {
    if(timelines.length){
      for(let i=1; i<=7; ++i)
        timelines.push(timelines[timelines.length-1]+i)
      timelines = timelines;
    }
    else
      timelines = [0,1,2,3,4,5,6]
  }
  load_timeline();
</script>
