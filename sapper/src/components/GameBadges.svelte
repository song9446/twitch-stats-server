<ul class="{$$props.class} font-bold rounded-lg">
  {#each badges as badge}
    {#if !badge[2]}
      <li class="mb-1 mr-1">
        <Tip position="bottom">
          <div slot="contents" class="px-1 py-px font-bold rounded-lg truncate" style="color: {badge[1]}; border: 2px solid {badge[1]}; max-width: 12rem;"
                                                                                title="{badge[0]}">
            {badge[0]}
          </div>
          <span slot="tip">
            {badge[3]}
          </span>
        </Tip>
      </li>
    {:else}
      <li class="mb-1 mr-1">
        <Tip position="bottom">
          <div slot="contents" class="px-1 py-px font-bold rounded-lg truncate" style="color: white; background-color: {badge[1]}; border: 2px solid {badge[1]}; max-width: 12rem;"
                                                                                title="{badge[0]}">
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
  import Tip from "./Tip.svelte";
  export let streamer; 
  let last_streamer = null;
  let badges = [];
  $: if(streamer != last_streamer){
    last_streamer = streamer;
    badges = [];
    if(streamer.primary_game_name)
      badges.push([streamer.primary_game_name, dark_random_color(streamer.primary_game_id), 1, "가장 많이하는 컨텐츠"]);
    if(streamer.secondary_game_name)
      badges.push([streamer.secondary_game_name, dark_random_color(streamer.secondary_game_id), 1, "두번째로 많이하는 컨텐츠"]);
    badges = badges;
  }
</script>

<style>
  li {
    font-size: 0.5rem;
    /* white-space: normal;*/
    text-align: center;
  }
</style>
