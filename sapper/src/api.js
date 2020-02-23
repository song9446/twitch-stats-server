import { CBOR } from './cbor.js';
import fetch from 'node-fetch';
const API_SERVER_HOST = "https://tsu.gg:3000"
const BLACKLIST = [
  462658994, //포칸지우티비
  484584043, //폭스홀짝
  474785904, //폭스족보단까얏발리
  466083252, //발리폭스원투족보
  468998632, //발리폭스홀짝족보
  468998632, //발리폭스버경족보
  463542108, //포칸투견족보
  480159898, //포칸마카오
  463016486, //포칸금은동이
  480566876, //포칸마카오족보
  462658994, //포칸지우티비
];
async function _fetch(path, params) {
  let res;
  if(this != null && this.fetch != null) 
    res = await this.fetch(path, params);
  /*else if(window != undefined && window.fetch != null)
    return await window.fetch(path);*/
  else
    res = await fetch(path, params);
  if(res.status != 200)
    throw res.status;
  else return res;
}
async function fetch_cbor(path) {
  let res = await _fetch(path);
  let body = await res.arrayBuffer();
  return CBOR.decode(body);
}
export const API = {
  streamer_map: async function () {
    return (await fetch_cbor(API_SERVER_HOST + "/api/streamer-map")).filter(s => !BLACKLIST.includes(s.id));
  },
  streamer: async function (id) {
    return await fetch_cbor(API_SERVER_HOST + `/api/streamer/${id}`);
  },
  thin_streamers: async function (search_or_ids) {
    if(typeof(search_or_ids) == "string") 
      return await fetch_cbor(API_SERVER_HOST + `/api/thin-streamers?search=${search_or_ids}`);
    else{
      search_or_ids = "ids[]=" + search_or_ids.join("&ids[]=")
      return await fetch_cbor(API_SERVER_HOST + `/api/thin-streamers?${search_or_ids}`);
    }
  },
  timeline: async function (id, from, to) {
    return await fetch_cbor(API_SERVER_HOST + `/api/streamer/${id}/timeline?from=${from.toISOString()}&to=${to.toISOString()}`);
  },
  similar_streamers: async function (id, offset=0) {
    if(!BLACKLIST.includes(id-0))
      return (await fetch_cbor(API_SERVER_HOST + `/api/streamer/${id}/similar-streamers?offset=${offset}`)).filter(s => !BLACKLIST.includes(s.id));
    else
      return (await fetch_cbor(API_SERVER_HOST + `/api/streamer/${id}/similar-streamers?offset=${offset}`)).filter(s => BLACKLIST.includes(s.id));
  },
  stream_ranges: async function (id, from, to) {
    return await fetch_cbor(API_SERVER_HOST + `/api/streamer/${id}/stream-ranges?from=${from.toISOString()}&to=${to.toISOString()}`);
    /*return [
        [new Date() / 1000 - 60*60*29, new Date()/1000 - 60*60*24],
        [new Date() / 1000 - 60*60*23, new Date()/1000 - 60*60*21],
        [new Date() / 1000 - 60*60*5, new Date()/1000 - 60*60*4],
        [new Date() / 1000 - 60*60*2, new Date()/1000 - 60*60],
      ];*/
  },
  comments: async function(id, offset=0) {
    return await fetch_cbor(API_SERVER_HOST + `/api/streamer/${id}/comments?offset=${offset}`);
  },
  write_comment: async function(id, nickname, password, contents, parent_id=null) {
    return await _fetch(API_SERVER_HOST + `/api/streamer/${id}/comments`, {
      method: "POST",
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        nickname: nickname, 
        password: password,
        contents: contents,
        parent_id: parent_id,
      }),
    })
  },
  vote_comment: async function(id, comment_id, upvote) {
    return await _fetch(API_SERVER_HOST + `/api/streamer/${id}/comments`, {
      method: "PATCH",
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        upvote: upvote,
        id: comment_id,
      }),
    });
  },
  fingerprint_hash: async function() {
    return await fetch_cbor(API_SERVER_HOST + '/api/me/fingerprint-hash');
  },
  keywords: async function(id) {
    return await fetch_cbor(API_SERVER_HOST + `/api/streamer/${id}/chatting/keywords`);
  },
  average_subscriber_distribution: async function(id) {
    return await fetch_cbor(API_SERVER_HOST + `/api/streamer/${id}/subscriber/average-distribution`);
  },
  realtime_chatting_speed_streamer_ranking: async function(offset=0) {
    return await fetch_cbor(API_SERVER_HOST + `/api/streamer-ranking/realtime-chatting-speed?offset=${offset}`);
  },
  average_viewer_count_streamer_ranking: async function(offset=0) {
    return await fetch_cbor(API_SERVER_HOST + `/api/streamer-ranking/average-viewer-count?offset=${offset}`);
  },
  streamer_ranking: async function(offset=0, order_by="chatting_speed", desc=true) {
    return (await fetch_cbor(API_SERVER_HOST + `/api/streamer-ranking?offset=${offset}&order_by=${order_by}&desc=${desc}`)).filter(s => !BLACKLIST.includes(s.id));
  },
  viewer_migration_counts: async function(id1, id2, from, to) {
    return await fetch_cbor(API_SERVER_HOST + `/api/viewer-migrations?id1=${id1}&id2=${id2}&from=${from.toISOString()}&to=${to.toISOString()}`);
  },
  viewer_migration_count_ranking: async function(offset) {
    return await fetch_cbor(API_SERVER_HOST + `/api/viewer-migration-ranking?offset=${offset}`);
  },
}
