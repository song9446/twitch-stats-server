<div class="w-full h-full flex flex-col text-xs">
  <div class="flex flex-row p-2 items-stretch">
    <!--<input bind:value={nickname} class="w-32 border p-2" placeholder="닉네임"/>-->
    <div class="w-4">
      {#if profile_image_uri}
      <img class="w-full h-full" src="{profile_image_uri}" />
      {:else}
      <div class="w-full h-full spinner"></div>
      {/if}
    </div>
    <!--<input type="password" bind:value={password} class="w-32 border p-2 ml-2" placeholder="비밀번호"/>-->
    <textarea bind:value={contents} class="flex-1 p-1 ml-4 border" rows="2"></textarea>
    <button class="border text-center p-2 text-white bg-primary-600" on:click={submit}> 등록 </button>
  </div>
  <div class="flex-1">
    {#if comments}
      {#each comments as comment, i (comment.id)}
        <div class="border-b flex flex-row p-2 items-stretch" class:opacity-50={!comment.agreed && comment.upvote - comment.downvote <= -5}>
          <div class="text-gray-600 m-auto w-4 text-right"
               class:text-xs={Math.abs(comment.upvote - comment.downvote) >= 10}
               class:text-lg={Math.abs(comment.upvote - comment.downvote) < 10}> {comment.upvote - comment.downvote} </div>
          <div class="flex flex-col justify-center mr-2 ml-1 text-gray-600">
            <button on:click={e=>vote(comment.id, true, i)}><FaIcon class="w-4 h-4" icon={faArrowUp} /></button>
            <button on:click={e=>vote(comment.id, false, i)}><FaIcon class="w-4 h-4" icon={faArrowDown} /></button>
          </div>
          <div class="w-4"> 
            <img class="w-full h-full" src="{hash_to_image_uri(comment.fingerprint_hash)}"> 
          </div>
          {#if comment.agreed || comment.upvote - comment.downvote > -5}
            <div class="ml-4 flex-1 flex flex-row items-center"> {comment.contents} </div>
          {:else}
            <button class="flex-1 text-left pl-4" on:click={e=> comments[i].agreed = true}>
              ~ 펼치기 ~
            </button>
          {/if}
          <!--<div class="text-gray-600 ml-2 text-center"> {time_ago(new Date(comment.time))} </div>-->
        </div>
      {:else}
        <div class="w-full h-full flex justify-center items-center text-xl text-gray-600 pb-2 pt-2">
          <div>
            댓글이 없어요 ㅜㅜ
          </div>
        </div>
      {/each}
      {#if load_more_loading}
      <div on:click={load_more} class="w-full border-t p-2 spinner"></div>
      {:else}
      <button on:click={load_more} class="w-full border-t py-3 text-normal">더 보기</button>
      {/if}
    {:else} 
      <div class="w-full h-full spinner text-4xl"/> 
    {/if}
  </div>
</div>

<script>
import { onMount } from "svelte";
import { API } from '../api.js';
import FaIcon from './FaIcon.svelte';
import { faArrowUp } from '@fortawesome/free-solid-svg-icons/faArrowUp';
import { faArrowDown } from '@fortawesome/free-solid-svg-icons/faArrowDown';
import { time_ago } from "../util.js";
import Toast from 'svelte-toast'
const toast = new Toast();

export let streamer_id;

let nickname = "guest";
let password = "1234";
let contents;

let comments;

let load_more_loading = false;

let profile_image_uri;

function refresh_comments(){
  API.comments(streamer_id).then(_comments => {
    comments = _comments;
  }).catch(e => {
  });
}
function load_more(){
  if(comments.length){
    load_more_loading = true;
    API.comments(streamer_id, comments.length).then(_comments => {
      comments = [...comments, ..._comments];
      load_more_loading = false;
    });
  }
}

const base64abc = (() => {
	let abc = [],
		A = "A".charCodeAt(0),
		a = "a".charCodeAt(0),
		n = "0".charCodeAt(0);
	for (let i = 0; i < 26; ++i) {
		abc.push(String.fromCharCode(A + i));
	}
	for (let i = 0; i < 26; ++i) {
		abc.push(String.fromCharCode(a + i));
	}
	for (let i = 0; i < 10; ++i) {
		abc.push(String.fromCharCode(n + i));
	}
	abc.push("+");
	abc.push("/");
	return abc;
})();

function bytesToBase64(bytes) {
	let result = '', i, l = bytes.length;
	for (i = 2; i < l; i += 3) {
		result += base64abc[bytes[i - 2] >> 2];
		result += base64abc[((bytes[i - 2] & 0x03) << 4) | (bytes[i - 1] >> 4)];
		result += base64abc[((bytes[i - 1] & 0x0F) << 2) | (bytes[i] >> 6)];
		result += base64abc[bytes[i] & 0x3F];
	}
	if (i === l + 1) { // 1 octet missing
		result += base64abc[bytes[i - 2] >> 2];
		result += base64abc[(bytes[i - 2] & 0x03) << 4];
		result += "==";
	}
	if (i === l) { // 2 octets missing
		result += base64abc[bytes[i - 2] >> 2];
		result += base64abc[((bytes[i - 2] & 0x03) << 4) | (bytes[i - 1] >> 4)];
		result += base64abc[(bytes[i - 1] & 0x0F) << 2];
		result += "=";
	}
	return result;
}

function hash_to_image_uri(hash){
  return `https://avatars.dicebear.com/v2/identicon/${escape(bytesToBase64(hash))}.svg`;
}

refresh_comments();

API.fingerprint_hash().then(hash => {
  profile_image_uri = hash_to_image_uri(hash);
});

function submit(){
  API.write_comment(streamer_id, nickname, password, contents).then(res => {
    refresh_comments();
  });
}

function score(comment){
  let n = comment.upvote + comment.downvote,
      p = comment.upvote / n,
      z = 1.281551565545,
      l = p + 1/(2*n)*z*z,
      r = z*Math.sqrt(p*(1-p)/n + z*z/(4*n*n)),
      under = 1+1/n*z*z;
  return (1 - r) / under;
}
function vote(id, upvote, idx){
  API.vote_comment(streamer_id, id, upvote).then(res => {
    if(upvote)
      comments[idx].upvote = comments[idx].upvote + 1;
    else
      comments[idx].downvote = comments[idx].downvote + 1;
    comments[idx].score = score(comments[idx]);
    comments = comments.sort((a, b) => b.score - a.score || b.parent_id - a.parent_id || b.id - a.id)
  }).catch(e => {
    if(e == 400) {
      toast.show('중복 평가는 안돼요!');
    }
  });
}

let last_streamer_id;
$: if(last_streamer_id != streamer_id) {
  last_streamer_id = streamer_id;
  refresh_comments();
}
</script>
