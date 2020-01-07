<script>
  import { API } from '../api.js';
  export let streamers = [];
  export let selected = null;
  export let placeholder = "";
  export let onselect = (e)=>{}
  export let inputid = "";
  let input_element;
  let input_value="";
  let last_keyword;
  let focused = false;
  let filtered_streamers = [];

  function filter(streamers, keyword){
      filtered_streamers = keyword? streamers.filter(s => s.name.search(keyword) >= 0): [];
      for(let s of filtered_streamers){
        let i = s.name.search(input_value);
        s._left = s.name.slice(0, i);
        s._center = input_value;
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
    onselect(selected);
    console.log("click");
  }
</script>

<div class="inline-block relative {$$props.class}" >
  <input 
    placeholder={placeholder}
    id = "{inputid}"
    class="px-6 border rounded focus:outline-none w-48 text-xs leading-loose pr-6 transition-all focus:outline-0 border border-transparent focus:bg-white focus:border-primary-600 placeholder-gray-600 rounded-lg  bg-primary-100"
    on:focus={e=>focused=true} on:keyup={on_input_change} bind:value={input_value} bind:this={input_element}
    on:blur={e=>focused=false} />
  <svg xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" version="1.1" x="0px" y="0px" viewBox="0 0 56.966 56.966" style="enable-background:new 0 0 56.966 56.966;" xml:space="preserve" width="512px" height="512px" id="Capa_1" class="h-3 w-3 text-gray-600 fill-current absolute top-0 left-0 mt-2 ml-2">
        <path d="M55.146,51.887L41.588,37.786c3.486-4.144,5.396-9.358,5.396-14.786c0-12.682-10.318-23-23-23s-23,10.318-23,23  s10.318,23,23,23c4.761,0,9.298-1.436,13.177-4.162l13.661,14.208c0.571,0.593,1.339,0.92,2.162,0.92  c0.779,0,1.518-0.297,2.079-0.837C56.255,54.982,56.293,53.08,55.146,51.887z M23.984,6c9.374,0,17,7.626,17,17s-7.626,17-17,17  s-17-7.626-17-17S14.61,6,23.984,6z"></path>
  </svg>
  <ul class="absolute bg-white" class:hidden="{!focused}">
    {#each filtered_streamers as streamer}
      <li on:mousedown={e=>on_list_click(streamer)} class="w-48 px-2 py-2 hover:bg-purple-500 hover:text-white text-black flex flex-row items-center truncate bg-white">
        <img class="rounded-full h-8 w-8" src={streamer.profile_image_url} />
        <div class="px-2"><span>{streamer._left}</span><span class="text-red-500">{streamer._center}</span><span>{streamer._right}</span></div>
      </li>
    {/each}
  </ul>
</div>


<style>
</style>
