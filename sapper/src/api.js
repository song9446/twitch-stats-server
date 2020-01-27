import { CBOR } from './cbor.js';
import fetch from 'node-fetch';
const API_SERVER_HOST = "https://tsu.gg:3000"
async function _fetch(path) {
  if(this != null && this.fetch != null) 
    return await this.fetch(path);
  /*else if(window != undefined && window.fetch != null)
    return await window.fetch(path);*/
  else
    return await fetch(path);
}
async function fetch_cbor(path) {
  let res = await _fetch(path);
  if(res.status !== 200){
    alert(res.status);
  } 
  else {
    let body = await res.arrayBuffer();
    return CBOR.decode(body);
  }
}
export const API = {
  streamer_map: async function () {
    return await fetch_cbor(API_SERVER_HOST + "/api/streamer-map");
  },
  streamer: async function (id) {
    return await fetch_cbor(API_SERVER_HOST + `/api/streamer/${id}`);
  },
  thin_streamers: async function (search) {
    return await fetch_cbor(API_SERVER_HOST + `/api/thin-streamers?search=${search}`);
  },
  timeline: async function (id, from, to) {
    return await fetch_cbor(API_SERVER_HOST + `/api/streamer/${id}/timeline?from=${from.toISOString()}&to=${to.toISOString()}`);
  },
  similar_streamers: async function (id) {
    return await fetch_cbor(API_SERVER_HOST + `/api/streamer/${id}/similar-streamers`);
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
}
