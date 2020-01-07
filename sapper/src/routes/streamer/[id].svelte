<script context="module">
	import { API } from '../../api.js';
  export async function preload(page, session) {
    const { id } = page.params;
    let res = await API.streamer.call(this, id);
    return res;
  }
</script>

<div class="hidden annotation tooltip apexcharts-tooltip apexcharts-tooltip apexcharts-xaxistooltip apexcharts-marker apexcharts-yaxistooltip custom-tooltip is_streaming_marker is_streaming_label"></div>
<div class="w-full flex flex-row items-start flex-wrap justify-around m-4">
  <div class="w-full flex md:flex-row md:items-start flex-col items-center md:justify-around flex-wrap">
    <div class="w-auto p-4">
			<h2 class="text-xl mt-2 font-semibold my-2">프로필</h2>
      <img
        class="rounded-lg"
        src="{streamer.profile_image_url}"
        alt="프로필 이미지"
      />
      <div class="py-2">
				{#if streamer.broadcaster_type == "partner"}
        <div class="text-xs tracking-wider text-gray-600 -mb-1 flex flex-row items-center">
					<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" class="w-4 h-4 inline-block"><path fill="currentColor" d="M2.149 0l-1.612 4.119v16.836h5.731v3.045h3.224l3.045-3.045h4.657l6.269-6.269v-14.686h-21.314zm19.164 13.612l-3.582 3.582h-5.731l-3.045 3.045v-3.045h-4.836v-15.045h17.194v11.463zm-3.582-7.343v6.262h-2.149v-6.262h2.149zm-5.731 0v6.262h-2.149v-6.262h2.149z"/></svg>
					<span class="ml-2">파트너</span>
				</div>
				{/if}
				<div>
					<h1 class="text-3xl font-semibold tracking-wider">{streamer.name}</h1>
					<a class="text-xs text-blue-500 flex flex-row items-center" href="https://www.twitch.tv/{streamer.login}">
						<svg area-hidden="true" role="img" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 {faExternalLinkAlt.icon[0]} {faExternalLinkAlt.icon[1]}" class="w-3 h-3 mr-1 overflow-visible inline-block">
							<path fill="currentColor" d="{faExternalLinkAlt.icon[4]}"/>
						</svg>
						<span>트위치 채널 바로가기</span>
					</a>
				</div>
        <div class="pt-4">
          {streamer.description}
        </div>
      </div>
    </div>
    <div class="md:w-auto flex flex-col flex-wrap justify-between p-4">
      <div>
        <h2 class="text-xl my-2 font-semibold">비슷한 스트리머</h2>
				<Network 
					nodes={[...similar_streamers, streamer]} 
					edges={similar_streamers.map(s => ({from: streamer.id, to: s.id}))}
          classes="md:w-144 w-full"
          onrendered={()=>{render_order += 1}}
					let:node={node}>
					<a class="flex flex-col flex-wrap items-center" href="/streamer/{node.id}">
						<img class="w-16 h-16 rounded-full" src="{node.profile_image_url}" art="프로필 사진" />
						<div class="flex flex-col flex-wrap items-center"> 
							<span class="text-sm"> {node.name} </span>
							{#if node.similarity} <span class="text-xs text-gray-600 tracking-wider"> ({(node.similarity*100).toFixed(1)}%) </span> {/if}
						</div>
					</a>
				</Network>
      </div>
    </div>
  </div>
  <div class="w-full mt-8 p-4">
    <h2 class="w-full text-xl font-semibold my-2">방송 타임라인</h2>
    {#if render_order >= 1}
    <Timeline 
      {streamer}
      {viewer_count_changes}
      {chatter_count_changes}
      {follower_count_changes}
      {stream_metadata_changes}
      />
    {:else}
    <div class="w-full h-64 spinner"/>
    {/if}
  </div>
</div>


<script>
  import { onMount } from "svelte";
  import { faExternalLinkAlt } from '@fortawesome/free-solid-svg-icons/faExternalLinkAlt'
  import { text_to_dark_color } from "../../util.js";
	import Network from "../../components/Network.svelte"; 
	import Timeline from "../../components/Timeline.svelte"; 
  export let streamer;
  export let viewer_count_changes;
  export let chatter_count_changes;
  export let follower_count_changes;
  export let stream_metadata_changes;
  export let similar_streamers;

  let render_order = 0;
</script>
