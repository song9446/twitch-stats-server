<ul class="{$$props.class} font-bold rounded-lg">
  {#if streamer.broadcaster_type == "partner"}
    <li class="py-px mb-1 mr-1 inline-block">
      <Tip position="bottom">
        <div slot="contents">
          <img src="/twitch_glitch.png" alt="partner" class="w-3 h-3 inline"/>
        </div>
        <span slot="tip">
          트위치 파트너 스트리머
        </span>
      </Tip>
    </li>
  {/if}
  {#if streamer.broadcaster_type == "affiliate"}
    <li class="py-px mb-1 mr-1 inline-block">
      <Tip position="bottom">
        <div slot="contents">
          <img src="/verified_icon.png" alt="affiliate" class="w-3 h-3 inline"/>
        </div>
        <span slot="tip">
          트위치 제휴 스트리머
        </span>
      </Tip>
    </li>
  {/if}
  {#if 0}
  {#if streamer.streaming_hours_per_week >= 56}
    <li class="py-px mb-1 mr-1 inline-block">
      <Tip position="bottom">
        <div slot="contents">
          <svg area-hidden="true" role="img" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 {faRobot.icon[0]} {faRobot.icon[1]}" class="w-4 h-4 overflow-visible inline-block">
            <path fill="currentColor" d="{faRobot.icon[4]}"/>
          </svg>
        </div>
        <span slot="tip">
          로봇 - 이 스트리머는 한 주에 56시간 이상 방송합니다.
        </span>
      </Tip>
    </li>
  {/if}
  {#if streamer.average_viewer_count >= 10000}
    <li class="py-px mb-1 mr-1 inline-block">
      <Tip position="bottom">
        <div slot="contents">
          <svg area-hidden="true" role="img" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 {faCity.icon[0]} {faCity.icon[1]}" class="w-4 h-4 overflow-visible inline-block">
            <path fill="currentColor" d="{faCity.icon[4]}"/>
          </svg>
        </div>
        <span slot="tip">
          도시 - 이 스트리머의 방송을 평균 만명 이상 시청합니다.
        </span>
      </Tip>
    </li>
  {:else if streamer.average_viewer_count >= 1000}
    <li class="py-px mb-1 mr-1 inline-block">
      <Tip position="bottom">
        <div slot="contents">
          <svg area-hidden="true" role="img" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 {faBuilding.icon[0]} {faBuilding.icon[1]}" class="w-4 h-4 overflow-visible inline-block">
            <path fill="currentColor" d="{faBuilding.icon[4]}"/>
          </svg>
        </div>
        <span slot="tip">
          빌딩 - 이 스트리머의 방송을 평균 천명 이상 시청합니다.
        </span>
      </Tip>
    </li>
  {:else if streamer.average_viewer_count >= 100}
    <li class="py-px mb-1 mr-1 inline-block">
      <Tip position="bottom">
        <div slot="contents">
          <svg area-hidden="true" role="img" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 {faHome.icon[0]} {faHome.icon[1]}" class="w-4 h-4 overflow-visible inline-block">
            <path fill="currentColor" d="{faHome.icon[4]}"/>
          </svg>
        </div>
        <span slot="tip">
          주택 - 이 스트리머의 방송을 평균 백명 이상 시청합니다.
        </span>
      </Tip>
    </li>
  {/if}
  {/if}
  {#if streamer.is_streaming}
    <!--<li class="py-px mb-1 mr-1 font-bold rounded-lg tracking-tighter inline-block" style="color: #FF4560;">ON AIR</li>-->
  {/if}
  {#each badges as badge}
    {#if !badge[2]}
      <li class="mb-1 mr-1 inline-block">
        <Tip position="bottom">
          <div slot="contents" class="px-1 py-px font-bold rounded-lg" style="color: {badge[1]}; border: 2px solid {badge[1]};">
            {badge[0]}
          </div>
          <span slot="tip">
            {badge[3]}
          </span>
        </Tip>
      </li>
    {:else}
      <li class="mb-1 mr-1 inline-block">
        <Tip position="bottom">
          <div slot="contents" class="px-1 py-px font-bold rounded-lg" style="color: white; background-color: {badge[1]}; border: 2px solid {badge[1]};">
            {badge[0]}
          </div>
          <span slot="tip">
            {badge[3]}
          </span>
        </Tip>
      </li>
    {/if}
  {/each}
</ul>

<script>
  import { dark_random_color } from "../util.js";
  import { faRobot } from '@fortawesome/free-solid-svg-icons/faRobot';
  import { faBuilding } from '@fortawesome/free-solid-svg-icons/faBuilding';
  import { faHome } from '@fortawesome/free-solid-svg-icons/faHome';
  import { faCity } from '@fortawesome/free-solid-svg-icons/faCity';
  import Tip from "./Tip.svelte";
  export let streamer; 
  let last_streamer = null;
  let badges = [];
  $: if(streamer != last_streamer){
    last_streamer = streamer;
  }
</script>

<style>
  li {
    font-size: 0.5rem;
  }
</style>
