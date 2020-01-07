import { CBOR } from './cbor.js';
const API_SERVER_HOST = "https://notroll.gg:3000"
async function _fetch(path) {
  if(this != null && this.fetch != null) 
    return await this.fetch(path);
  else if(window != null && window.fetch != null)
    return await window.fetch(path);
  else
    return null;
}
export const API = {
  streamer_map: async function () {
    let res = await _fetch.call(this, API_SERVER_HOST + "/api/streamer-map");
    if(res != null){
      let body = await res.arrayBuffer();
      return CBOR.decode(body);
    } else return null;
  },
  streamer: async function (id) {
    let res = await _fetch.call(this, API_SERVER_HOST + `/api/streamer/${id}`);
    if(res != null) {
      let body = await res.arrayBuffer();
      return CBOR.decode(body);
    } else return null;
  },
  thin_streamers: async function (search) {
    let res = await _fetch.call(this, API_SERVER_HOST + `/api/thin-streamers?search=${search}`);
    if(res != null) {
      let body = await res.arrayBuffer();
      return CBOR.decode(body);
    } else return null;
  },
}
