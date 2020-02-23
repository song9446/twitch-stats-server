<svelte:head>
  <title> 트수gg - 시청자 이동{title_sufix}</title>
</svelte:head>


<div class="p-6 xl:absolute relative container m-auto">
  <h1 class="md:text-3xl text-2xl inline-block">시청자 이동</h1>
  <Tip >
    <span slot="tip"> 
    여러 방송 사이에서 시청자의 흐름을 살펴볼 수 있습니다.<br> 
    날짜와 스트리머를 선택해보세요.<br>
    * 약 한시간 간격으로 업데이트 됩니다.
    </span>
  </Tip>
</div>
<div class="container m-auto flex flex-col items-stretch pb-8">
  <table class="text-center mb-12 mt-6">
    <thead>
      <tr>
        <th> 날짜 </th>
        <th> 스트리머1 </th>
        <th> 스트리머2 </th>
      </tr>
    </thead>
    <tbody>
    <tr>
      <td>
        <Datepicker 
           end={new Date()} 
           format={d=>d.toLocaleDateString()} 
           selected={date} 
           on:dateSelected={on_date_pick} 
           >
           <button class="p-2 px-4 bg-white border w-full truncate">
             {date.toLocaleDateString()}
           </button>
        </Datepicker>
      </td>
      <td>
        <StreamerAutoComplete 
           bind:onselect={on_streamer_search1} 
           placeholder="스트리머 선택1" 
           id="migration-streamer-search1" 
           inputid="migration-streamer-search1-input"
           input_value={streamer1? streamer1.name: ""}
           input_class="bg-white text-sm w-full transition-all transition-100 pl-7 py-2 truncate border" />
      </td>
      <td>
        <StreamerAutoComplete 
           bind:onselect={on_streamer_search2}
           placeholder="스트리머 선택2" 
           id="migration-streamer-search2" 
           inputid="migration-streamer-search2-input"
           input_value={streamer2? streamer2.name: ""}
           input_class="bg-white text-sm w-full transition-all transition-100 pl-7 py-2 truncate border" />
     </td>
    </tr>
    </tbody>
  </table>
  <div class="flex flex-row w-full items-center z-20">
    <div class="">
      <a href="{streamer1? '/streamer/' + streamer1.id : ''}"
        for="migration-streamer-search1-input"
        class="w-24 flex flex-col items-center justify-center overflow-visible relative">
        {#if streamer1}
          <img class="rounded-full h-24 w-24 border border-gray-600" src={streamer1.profile_image_url} />
          <div class="pt-2 absolute" style="top: 100%"><span>{streamer1.name}</span></div>
        {:else}
          <div class="rounded-full h-24 w-24 bg-gray-100" > </div>
          <div class="pt-2 text-transparent text-gray-400 absolute" style="top: 100%"><span>?</span></div>
        {/if}
      </a>
    </div>
    <MigrationTimeline 
       streamer={streamer1} 
       height="150"
       {date} />
  </div>
  <div class="flex flex-row w-full">
    <div class="w-24"></div>
    <Migrations 
         migrations={viewer_migrations}
         class="flex-1"
         id1={streamer1 && streamer1.id}
         id2={streamer2 && streamer2.id} />
  </div>
  <div class="flex flex-row w-full items-center z-10">
    <div>
      <a href="{streamer2? '/streamer/' + streamer2.id : ''}"
        for="migration-streamer-search2-input"
        class="w-24 flex flex-col items-center justify-center overflow-visible cursor-pointer relative">
        {#if streamer2}
          <img class="rounded-full h-24 w-24 border border-gray-600" src={streamer2.profile_image_url} />
          <div class="pt-2 absolute" style="top: 100%"><span>{streamer2.name}</span></div>
        {:else}
          <div class="rounded-full h-24 w-24 bg-gray-100" > </div>
          <div class="pt-2 text-transparent text-gray-400 absolute" style="top: 100%"><span>?</span></div>
        {/if}
      </a>
    </div>
    <MigrationTimeline 
       streamer={streamer2} 
       height="150"
       {date} />
  </div>
</div>


<script context="module">
	import { API } from '../../api.js';

  export async function preload(page, session) {
    if(page.query.id1 && page.query.id2 && page.query.date) {
      let [streamer1, streamer2] = await API.thin_streamers([page.query.id1, page.query.id2]);
      let time = new Date(page.query.date-0); time.setHours(0,0,0,0);
      let from = time,
          to = new Date(time.getTime() + 1000*60*60*24);
      let viewer_migrations = await API.viewer_migration_counts(page.query.id1, page.query.id2, from, to);
      let date = new Date(page.query.date-0);
      return { streamer1, streamer2, viewer_migrations, date };
    }
    else {
      let date = new Date(); date.setHours(0,0,0,0);
      return { date };
    }
  }
</script>

<script>
  import StreamerAutoComplete from '../../components/StreamerAutoComplete.svelte';
	import MigrationTimeline from '../../components/MigrationTimeline.svelte';
	import Migrations from '../../components/Migrations.svelte';
	import Tip from '../../components/Tip.svelte';
  import Datepicker from "svelte-calendar";

  export let streamer1;
  export let streamer2;
  export let viewer_migrations = [];
  export let date = new Date();
  let title_sufix = streamer1 && streamer2? `| ${streamer1.name} <-> ${streamer2.name}`: '';



  function try_load(){
    if(streamer1 && streamer2 && date){
      window.location.search = `id1=${streamer1.id}&id2=${streamer2.id}&date=${date.getTime()}`;
    }
  }

  function on_date_pick(e) {
    if(e.detail.date != date){
      date = e.detail.date;
      try_load();
    }
  }
  function on_streamer_search1(target) {
    if(streamer1 != target){
      streamer1 = target;
      try_load();
    }
  }
  function on_streamer_search2(target) {
    if(streamer2 != target){
      streamer2 = target;
      try_load();
    }
  }
</script>

<style>
  :global(.contents-wrapper) {
    z-index: 50 !important;
  }
</style>
