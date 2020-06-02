<svelte:head>
	<title> 스트리머 뉴스 - 트수gg</title>
</svelte:head>

<script context="module">
	import { API } from '../../api.js';
  export async function preload(page, session) {
    const { id } = page.params;
    let streamer = await API.streamer.call(this, id);
    let similar_streamers = await API.similar_streamers.call(this, id);
    let similar_streamers_top10 = similar_streamers.slice(0, 10);
    return { streamer, similar_streamers, similar_streamers_top10 };
  }
</script>
<!--
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
      활발한 뉴스
      <Tip>
        <span slot="tip"> 
          실시간으로 조회, 댓글 등 활동이 많은 뉴스입니다. <br>
        </span>
      </Tip>
    </h3>
    <table slot="contents" class="w-full text-xs whitespace-no-wrap streamer-ranking" width="1000">
      {#each rankings[JSON.stringify(state)] as streamer, i (streamer.id)}
      <td class="text-xl text-gray-600 text-center">
        {i+1}
      </td>
    </table>
  </Panel>
</div>
-->

<script>
import { onMount } from "svelte";
import Panel from "../../components/Panel.svelte";
import GameBadges from "../../components/GameBadges.svelte";
import Tip from '../../components/Tip.svelte';
import FaIcon from '../../components/FaIcon.svelte';
import StreamerAutoComplete from "../../components/StreamerAutoComplete.svelte";
import { time_ago } from "../../util.js";
</script>
