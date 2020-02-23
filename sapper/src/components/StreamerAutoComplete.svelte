<script context="module">
  let next_id=0;
  const recent_search_history_length = 10;
  const local_storage_recent_search_key = 'streamer-auto-complete-recent-search-history';
  function load_recent_search(id){
    return JSON.parse(localStorage.getItem(local_storage_recent_search_key + id)) || [];
  }
  function save_recent_search(id, recent_search){
    return localStorage.setItem(local_storage_recent_search_key + id, JSON.stringify(recent_search));
  }
</script>
<script>
  import { API } from '../api.js';
  import { onMount } from 'svelte';

  export let streamers = [];
  export let selected = null;
  export let placeholder = "";
  export let onselect = (e)=>{}
  export let inputid = "";
<<<<<<< HEAD
  export let input_class = "border rounded focus:outline-none md:w-48 w-32 text-sm leading-loose pr-5 transition-all focus:outline-0 border border-transparent focus:bg-white focus:border-primary-600 placeholder-gray-600 rounded-lg  bg-primary-100 pl-7";
  export let icon = true;
  export let id = next_id++;
  export let autocomplete_class = "md:w-48 w-32";
  export let icon_class = "w-3 h-3";
  
  
  let input_element;
  export let input_value="";
=======
  export let input_class = "border rounded focus:outline-none w-48 text-sm leading-loose pr-5 transition-all focus:outline-0 border border-transparent focus:bg-white focus:border-primary-600 placeholder-gray-600 rounded-lg  bg-primary-100 pl-7";
  export let icon = true;
  export let id = next_id++;
  
  
  let input_element;
  let input_value="";
>>>>>>> d2889d99c97bdce47071bfd176272aab8192b643
  let last_keyword;
  let focused = false;
  let filtered_streamers = [];
  let recent_search_history = [];

  onMount(()=>{
    recent_search_history = load_recent_search(id);
<<<<<<< HEAD
    recent_search_history = recent_search_history.map(r => streamers.find(s => s.id == r.id) || r);
=======
    console.log("recent", recent_search_history);
>>>>>>> d2889d99c97bdce47071bfd176272aab8192b643
  });

  function add_streamer_to_recent_search_history(streamer) {
    let index = recent_search_history.findIndex(s=>s.id == streamer.id);
    if(index >= 0)
      recent_search_history.splice(index, 1);
    recent_search_history = [streamer, ...recent_search_history.slice(0, recent_search_history_length-1)];
  }

  function filter(streamers, keyword){
<<<<<<< HEAD
      filtered_streamers = keyword? streamers.filter(s => s.name.toLocaleLowerCase().search(keyword.toLocaleLowerCase()) >= 0): [];
      for(let s of filtered_streamers){
        let i = s.name.toLocaleLowerCase().search(keyword.toLocaleLowerCase());
        s._left = s.name.slice(0, i);
        s._center = s.name.slice(i, i+keyword.length);
=======
      filtered_streamers = keyword? streamers.filter(s => s.name.search(keyword) >= 0): [];
      for(let s of filtered_streamers){
        let i = s.name.search(keyword);
        s._left = s.name.slice(0, i);
        s._center = keyword;
>>>>>>> d2889d99c97bdce47071bfd176272aab8192b643
        s._right = s.name.slice(i + keyword.length);
      }
      //selected = filtered_streamers.find(s => s.name === keyword);
  }
  function on_input_change(e) {
    let keyword = input_value;
    if(last_keyword == keyword) 
      return;
    last_keyword = keyword;
    if(streamers.length){
      filter(streamers, keyword);
    }
    else {
      API.thin_streamers(keyword)
        .then(streamers=>{
          filter(streamers, keyword);
        });
    }
  }
  function on_list_click(streamer) {
    selected = streamer;
    input_element.value = streamer.name;
    input_element.blur();
    add_streamer_to_recent_search_history(streamer);
    save_recent_search(id, recent_search_history);
<<<<<<< HEAD
    onselect(selected);
=======
    console.log("recent_set", recent_search_history);
    onselect(selected);
    console.log("click");
>>>>>>> d2889d99c97bdce47071bfd176272aab8192b643
  }
  function remove_from_recent_history(streamer, e) {
    recent_search_history = recent_search_history.filter(e=>e.id != streamer.id);
    save_recent_search(id, recent_search_history);
    focus = true;
    return e.preventDefault() && false;
  }
</script>

<div class="inline-block relative {$$props.class}" >
  <input 
    placeholder={placeholder}
    id = "{inputid}"
    class="{input_class}"
    on:focus={e=>focused=true} on:keyup={on_input_change} bind:value={input_value} bind:this={input_element}
    on:blur={e=>focused=false} />
  {#if icon === true}
<<<<<<< HEAD
  <svg xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" version="1.1" x="0px" y="0px" viewBox="0 0 56.966 56.966" xml:space="preserve" width="512px" height="512px" id="Capa_1" class="{icon_class} text-gray-600 fill-current absolute" style="enable-background:new 0 0 56.966 56.966; top: 50%; transform: translateY(-50%); left: 0.6rem;">
=======
  <svg xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" version="1.1" x="0px" y="0px" viewBox="0 0 56.966 56.966" xml:space="preserve" width="512px" height="512px" id="Capa_1" class="h-3 w-3 text-gray-600 fill-current absolute" style="enable-background:new 0 0 56.966 56.966; top: 50%; transform: translateY(-50%); left: 0.6rem;">
>>>>>>> d2889d99c97bdce47071bfd176272aab8192b643
        <path d="M55.146,51.887L41.588,37.786c3.486-4.144,5.396-9.358,5.396-14.786c0-12.682-10.318-23-23-23s-23,10.318-23,23  s10.318,23,23,23c4.761,0,9.298-1.436,13.177-4.162l13.661,14.208c0.571,0.593,1.339,0.92,2.162,0.92  c0.779,0,1.518-0.297,2.079-0.837C56.255,54.982,56.293,53.08,55.146,51.887z M23.984,6c9.374,0,17,7.626,17,17s-7.626,17-17,17  s-17-7.626-17-17S14.61,6,23.984,6z"></path>
  </svg>
  {/if}
  <ul class="absolute bg-white z-50" class:hidden="{!focused}">
    {#if !input_value && recent_search_history}
      {#each recent_search_history as streamer}
<<<<<<< HEAD
        <li on:mousedown={e=>on_list_click(streamer)} class="md:w-48 w-32 px-2 py-2 hover:bg-purple-500 hover:text-white text-black flex flex-row items-center truncate bg-white flex-wrap">
          <img class="rounded-full h-8 w-8" src={streamer.profile_image_url} />
          <div class="px-2"><span>{streamer.name}</span></div>
        </li>
        <button style="line-height: 1rem" class="absolute right-0 w-4 h-4 text-center -mr-6 -mt-8 text-gray-800 bg-white rounded-full" on:mousedown={e=>remove_from_recent_history(streamer, e)}>🞩</button>
      {/each}
    {:else}
      {#each filtered_streamers as streamer}
        <li on:mousedown={e=>on_list_click(streamer)} class="{autocomplete_class} px-2 py-2 hover:bg-purple-500 hover:text-white text-black flex flex-row items-center truncate bg-white">
=======
        <li on:mousedown={e=>on_list_click(streamer)} class="w-48 px-2 py-2 hover:bg-purple-500 hover:text-white text-black flex flex-row items-center truncate bg-white flex-wrap">
          <img class="rounded-full h-8 w-8" src={streamer.profile_image_url} />
          <div class="px-2"><span>{streamer._left}</span><span class="text-red-500">{streamer._center}</span><span>{streamer._right}</span></div>
        </li>
        <button class="absolute right-0 w-4 h-4 -mr-6 -mt-8 text-gray-800 flex flex-col items-center justify-center" on:mousedown={e=>remove_from_recent_history(streamer, e)}>X</button>
      {/each}
    {:else}
      {#each filtered_streamers as streamer}
        <li on:mousedown={e=>on_list_click(streamer)} class="w-48 px-2 py-2 hover:bg-purple-500 hover:text-white text-black flex flex-row items-center truncate bg-white">
>>>>>>> d2889d99c97bdce47071bfd176272aab8192b643
          <img class="rounded-full h-8 w-8" src={streamer.profile_image_url} />
          <div class="px-2"><span>{streamer._left}</span><span class="text-red-500">{streamer._center}</span><span>{streamer._right}</span></div>
        </li>
      {/each}
    {/if}
  </ul>
</div>


<style>
</style>
