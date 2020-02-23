'use strict';

function _interopDefault (ex) { return (ex && (typeof ex === 'object') && 'default' in ex) ? ex['default'] : ex; }

function _interopNamespace(e) {
    if (e && e.__esModule) { return e; } else {
        var n = {};
        if (e) {
            Object.keys(e).forEach(function (k) {
                var d = Object.getOwnPropertyDescriptor(e, k);
                Object.defineProperty(n, k, d.get ? d : {
                    enumerable: true,
                    get: function () {
                        return e[k];
                    }
                });
            });
        }
        n['default'] = e;
        return n;
    }
}

var sirv = _interopDefault(require('sirv'));
var polka = _interopDefault(require('polka'));
var compression = _interopDefault(require('compression'));
var fs = _interopDefault(require('fs'));
var path = _interopDefault(require('path'));
var Stream = _interopDefault(require('stream'));
var http = _interopDefault(require('http'));
var Url = _interopDefault(require('url'));
var https = _interopDefault(require('https'));
var zlib = _interopDefault(require('zlib'));

function noop() { }
function run(fn) {
    return fn();
}
function blank_object() {
    return Object.create(null);
}
function run_all(fns) {
    fns.forEach(run);
}
function safe_not_equal(a, b) {
    return a != a ? b == b : a !== b || ((a && typeof a === 'object') || typeof a === 'function');
}

let current_component;
function set_current_component(component) {
    current_component = component;
}
function get_current_component() {
    if (!current_component)
        throw new Error(`Function called outside component initialization`);
    return current_component;
}
function onMount(fn) {
    get_current_component().$$.on_mount.push(fn);
}
function setContext(key, context) {
    get_current_component().$$.context.set(key, context);
}
const escaped = {
    '"': '&quot;',
    "'": '&#39;',
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;'
};
function escape(html) {
    return String(html).replace(/["'&<>]/g, match => escaped[match]);
}
function each(items, fn) {
    let str = '';
    for (let i = 0; i < items.length; i += 1) {
        str += fn(items[i], i);
    }
    return str;
}
const missing_component = {
    $$render: () => ''
};
function validate_component(component, name) {
    if (!component || !component.$$render) {
        if (name === 'svelte:component')
            name += ' this={...}';
        throw new Error(`<${name}> is not a valid SSR component. You may need to review your build config to ensure that dependencies are compiled, rather than imported as pre-compiled modules`);
    }
    return component;
}
let on_destroy;
function create_ssr_component(fn) {
    function $$render(result, props, bindings, slots) {
        const parent_component = current_component;
        const $$ = {
            on_destroy,
            context: new Map(parent_component ? parent_component.$$.context : []),
            // these will be immediately discarded
            on_mount: [],
            before_update: [],
            after_update: [],
            callbacks: blank_object()
        };
        set_current_component({ $$ });
        const html = fn(result, props, bindings, slots);
        set_current_component(parent_component);
        return html;
    }
    return {
        render: (props = {}, options = {}) => {
            on_destroy = [];
            const result = { head: '', css: new Set() };
            const html = $$render(result, props, {}, options);
            run_all(on_destroy);
            return {
                html,
                css: {
                    code: Array.from(result.css).map(css => css.code).join('\n'),
                    map: null // TODO
                },
                head: result.head
            };
        },
        $$render
    };
}
function add_attribute(name, value, boolean) {
    if (value == null || (boolean && !value))
        return '';
    return ` ${name}${value === true ? '' : `=${typeof value === 'string' ? JSON.stringify(escape(value)) : `"${value}"`}`}`;
}

const API_SERVER_HOST = "http://133.130.88.43:3000";

/*
 * The MIT License (MIT)
 *
 * Copyright (c) 2014-2016 Patrick Gansterer <paroga@paroga.com>
 *
 * Permission is hereby granted, free of charge, to any person obtaining a copy
 * of this software and associated documentation files (the "Software"), to deal
 * in the Software without restriction, including without limitation the rights
 * to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
 * copies of the Software, and to permit persons to whom the Software is
 * furnished to do so, subject to the following conditions:
 *
 * The above copyright notice and this permission notice shall be included in all
 * copies or substantial portions of the Software.
 *
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
 * IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
 * FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
 * AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
 * LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
 * OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
 * SOFTWARE.
 */

var POW_2_24 = 5.960464477539063e-8,
    POW_2_32 = 4294967296,
    POW_2_53 = 9007199254740992;

function encode(value) {
  var data = new ArrayBuffer(256);
  var dataView = new DataView(data);
  var lastLength;
  var offset = 0;

  function prepareWrite(length) {
    var newByteLength = data.byteLength;
    var requiredLength = offset + length;
    while (newByteLength < requiredLength)
      newByteLength <<= 1;
    if (newByteLength !== data.byteLength) {
      var oldDataView = dataView;
      data = new ArrayBuffer(newByteLength);
      dataView = new DataView(data);
      var uint32count = (offset + 3) >> 2;
      for (var i = 0; i < uint32count; ++i)
        dataView.setUint32(i << 2, oldDataView.getUint32(i << 2));
    }

    lastLength = length;
    return dataView;
  }
  function commitWrite() {
    offset += lastLength;
  }
  function writeFloat64(value) {
    commitWrite(prepareWrite(8).setFloat64(offset, value));
  }
  function writeUint8(value) {
    commitWrite(prepareWrite(1).setUint8(offset, value));
  }
  function writeUint8Array(value) {
    var dataView = prepareWrite(value.length);
    for (var i = 0; i < value.length; ++i)
      dataView.setUint8(offset + i, value[i]);
    commitWrite();
  }
  function writeUint16(value) {
    commitWrite(prepareWrite(2).setUint16(offset, value));
  }
  function writeUint32(value) {
    commitWrite(prepareWrite(4).setUint32(offset, value));
  }
  function writeUint64(value) {
    var low = value % POW_2_32;
    var high = (value - low) / POW_2_32;
    var dataView = prepareWrite(8);
    dataView.setUint32(offset, high);
    dataView.setUint32(offset + 4, low);
    commitWrite();
  }
  function writeTypeAndLength(type, length) {
    if (length < 24) {
      writeUint8(type << 5 | length);
    } else if (length < 0x100) {
      writeUint8(type << 5 | 24);
      writeUint8(length);
    } else if (length < 0x10000) {
      writeUint8(type << 5 | 25);
      writeUint16(length);
    } else if (length < 0x100000000) {
      writeUint8(type << 5 | 26);
      writeUint32(length);
    } else {
      writeUint8(type << 5 | 27);
      writeUint64(length);
    }
  }

  function encodeItem(value) {
    var i;

    if (value === false)
      return writeUint8(0xf4);
    if (value === true)
      return writeUint8(0xf5);
    if (value === null)
      return writeUint8(0xf6);
    if (value === undefined)
      return writeUint8(0xf7);

    switch (typeof value) {
      case "number":
        if (Math.floor(value) === value) {
          if (0 <= value && value <= POW_2_53)
            return writeTypeAndLength(0, value);
          if (-POW_2_53 <= value && value < 0)
            return writeTypeAndLength(1, -(value + 1));
        }
        writeUint8(0xfb);
        return writeFloat64(value);

      case "string":
        var utf8data = [];
        for (i = 0; i < value.length; ++i) {
          var charCode = value.charCodeAt(i);
          if (charCode < 0x80) {
            utf8data.push(charCode);
          } else if (charCode < 0x800) {
            utf8data.push(0xc0 | charCode >> 6);
            utf8data.push(0x80 | charCode & 0x3f);
          } else if (charCode < 0xd800) {
            utf8data.push(0xe0 | charCode >> 12);
            utf8data.push(0x80 | (charCode >> 6)  & 0x3f);
            utf8data.push(0x80 | charCode & 0x3f);
          } else {
            charCode = (charCode & 0x3ff) << 10;
            charCode |= value.charCodeAt(++i) & 0x3ff;
            charCode += 0x10000;

            utf8data.push(0xf0 | charCode >> 18);
            utf8data.push(0x80 | (charCode >> 12)  & 0x3f);
            utf8data.push(0x80 | (charCode >> 6)  & 0x3f);
            utf8data.push(0x80 | charCode & 0x3f);
          }
        }

        writeTypeAndLength(3, utf8data.length);
        return writeUint8Array(utf8data);

      default:
        var length;
        if (Array.isArray(value)) {
          length = value.length;
          writeTypeAndLength(4, length);
          for (i = 0; i < length; ++i)
            encodeItem(value[i]);
        } else if (value instanceof Uint8Array) {
          writeTypeAndLength(2, value.length);
          writeUint8Array(value);
        } else {
          var keys = Object.keys(value);
          length = keys.length;
          writeTypeAndLength(5, length);
          for (i = 0; i < length; ++i) {
            var key = keys[i];
            encodeItem(key);
            encodeItem(value[key]);
          }
        }
    }
  }

  encodeItem(value);

  if ("slice" in data)
    return data.slice(0, offset);

  var ret = new ArrayBuffer(offset);
  var retView = new DataView(ret);
  for (var i = 0; i < offset; ++i)
    retView.setUint8(i, dataView.getUint8(i));
  return ret;
}

function decode(data, tagger, simpleValue) {
  var dataView = new DataView(data);
  var offset = 0;

  if (typeof tagger !== "function")
    tagger = function(value) { return value; };
  if (typeof simpleValue !== "function")
    simpleValue = function() { return undefined; };

  function commitRead(length, value) {
    offset += length;
    return value;
  }
  function readArrayBuffer(length) {
    return commitRead(length, new Uint8Array(data, offset, length));
  }
  function readFloat16() {
    var tempArrayBuffer = new ArrayBuffer(4);
    var tempDataView = new DataView(tempArrayBuffer);
    var value = readUint16();

    var sign = value & 0x8000;
    var exponent = value & 0x7c00;
    var fraction = value & 0x03ff;

    if (exponent === 0x7c00)
      exponent = 0xff << 10;
    else if (exponent !== 0)
      exponent += (127 - 15) << 10;
    else if (fraction !== 0)
      return (sign ? -1 : 1) * fraction * POW_2_24;

    tempDataView.setUint32(0, sign << 16 | exponent << 13 | fraction << 13);
    return tempDataView.getFloat32(0);
  }
  function readFloat32() {
    return commitRead(4, dataView.getFloat32(offset));
  }
  function readFloat64() {
    return commitRead(8, dataView.getFloat64(offset));
  }
  function readUint8() {
    return commitRead(1, dataView.getUint8(offset));
  }
  function readUint16() {
    return commitRead(2, dataView.getUint16(offset));
  }
  function readUint32() {
    return commitRead(4, dataView.getUint32(offset));
  }
  function readUint64() {
    return readUint32() * POW_2_32 + readUint32();
  }
  function readBreak() {
    if (dataView.getUint8(offset) !== 0xff)
      return false;
    offset += 1;
    return true;
  }
  function readLength(additionalInformation) {
    if (additionalInformation < 24)
      return additionalInformation;
    if (additionalInformation === 24)
      return readUint8();
    if (additionalInformation === 25)
      return readUint16();
    if (additionalInformation === 26)
      return readUint32();
    if (additionalInformation === 27)
      return readUint64();
    if (additionalInformation === 31)
      return -1;
    throw "Invalid length encoding";
  }
  function readIndefiniteStringLength(majorType) {
    var initialByte = readUint8();
    if (initialByte === 0xff)
      return -1;
    var length = readLength(initialByte & 0x1f);
    if (length < 0 || (initialByte >> 5) !== majorType)
      throw "Invalid indefinite length element";
    return length;
  }

  function appendUtf16Data(utf16data, length) {
    for (var i = 0; i < length; ++i) {
      var value = readUint8();
      if (value & 0x80) {
        if (value < 0xe0) {
          value = (value & 0x1f) <<  6
                | (readUint8() & 0x3f);
          length -= 1;
        } else if (value < 0xf0) {
          value = (value & 0x0f) << 12
                | (readUint8() & 0x3f) << 6
                | (readUint8() & 0x3f);
          length -= 2;
        } else {
          value = (value & 0x0f) << 18
                | (readUint8() & 0x3f) << 12
                | (readUint8() & 0x3f) << 6
                | (readUint8() & 0x3f);
          length -= 3;
        }
      }

      if (value < 0x10000) {
        utf16data.push(value);
      } else {
        value -= 0x10000;
        utf16data.push(0xd800 | (value >> 10));
        utf16data.push(0xdc00 | (value & 0x3ff));
      }
    }
  }

  function decodeItem() {
    var initialByte = readUint8();
    var majorType = initialByte >> 5;
    var additionalInformation = initialByte & 0x1f;
    var i;
    var length;

    if (majorType === 7) {
      switch (additionalInformation) {
        case 25:
          return readFloat16();
        case 26:
          return readFloat32();
        case 27:
          return readFloat64();
      }
    }

    length = readLength(additionalInformation);
    if (length < 0 && (majorType < 2 || 6 < majorType))
      throw "Invalid length";

    switch (majorType) {
      case 0:
        return length;
      case 1:
        return -1 - length;
      case 2:
        if (length < 0) {
          var elements = [];
          var fullArrayLength = 0;
          while ((length = readIndefiniteStringLength(majorType)) >= 0) {
            fullArrayLength += length;
            elements.push(readArrayBuffer(length));
          }
          var fullArray = new Uint8Array(fullArrayLength);
          var fullArrayOffset = 0;
          for (i = 0; i < elements.length; ++i) {
            fullArray.set(elements[i], fullArrayOffset);
            fullArrayOffset += elements[i].length;
          }
          return fullArray;
        }
        return readArrayBuffer(length);
      case 3:
        var utf16data = [];
        if (length < 0) {
          while ((length = readIndefiniteStringLength(majorType)) >= 0)
            appendUtf16Data(utf16data, length);
        } else
          appendUtf16Data(utf16data, length);
        return String.fromCharCode.apply(null, utf16data);
      case 4:
        var retArray;
        if (length < 0) {
          retArray = [];
          while (!readBreak())
            retArray.push(decodeItem());
        } else {
          retArray = new Array(length);
          for (i = 0; i < length; ++i)
            retArray[i] = decodeItem();
        }
        return retArray;
      case 5:
        var retObject = {};
        for (i = 0; i < length || length < 0 && !readBreak(); ++i) {
          var key = decodeItem();
          retObject[key] = decodeItem();
        }
        return retObject;
      case 6:
        return tagger(decodeItem(), length);
      case 7:
        switch (length) {
          case 20:
            return false;
          case 21:
            return true;
          case 22:
            return null;
          case 23:
            return undefined;
          default:
            return simpleValue(length);
        }
    }
  }

  var ret = decodeItem();
  if (offset !== data.byteLength)
    throw "Remaining bytes";
  return ret;
}

const CBOR = { encode: encode, decode: decode };

async function _fetch(path) {
  if(this != null && this.fetch != null) 
    return await this.fetch(path);
  else if(window != null && window.fetch != null)
    return await window.fetch(path);
  else
    return null;
}
const API = {
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
};

/* src/components/StreamerAutoComplete.svelte generated by Svelte v3.12.1 */

const StreamerAutoComplete = create_ssr_component(($$result, $$props, $$bindings, $$slots) => {
	let { streamers = [], selected = null, placeholder = "", onselect = (e)=>{} } = $$props;
  let { inputid = "", classes = "" } = $$props;
  let input_element;
  let input_value="";
  let filtered_streamers = [];

	if ($$props.streamers === void 0 && $$bindings.streamers && streamers !== void 0) $$bindings.streamers(streamers);
	if ($$props.selected === void 0 && $$bindings.selected && selected !== void 0) $$bindings.selected(selected);
	if ($$props.placeholder === void 0 && $$bindings.placeholder && placeholder !== void 0) $$bindings.placeholder(placeholder);
	if ($$props.onselect === void 0 && $$bindings.onselect && onselect !== void 0) $$bindings.onselect(onselect);
	if ($$props.inputid === void 0 && $$bindings.inputid && inputid !== void 0) $$bindings.inputid(inputid);
	if ($$props.classes === void 0 && $$bindings.classes && classes !== void 0) $$bindings.classes(classes);

	return `<div class="inline-block relative ${escape(classes)}">
	  <input${add_attribute("placeholder", placeholder, 0)}${add_attribute("id", inputid, 0)} class="px-2 border rounded focus:outline-none w-48 text-xs leading-loose pr-6"${add_attribute("value", input_value, 1)}${add_attribute("this", input_element, 1)}>
	  <svg xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" version="1.1" x="0px" y="0px" viewBox="0 0 56.966 56.966" style="enable-background:new 0 0 56.966 56.966;" xml:space="preserve" width="512px" height="512px" id="Capa_1" class="h-3 w-3 text-gray-600 fill-current absolute top-0 right-0 mt-2 mr-2">
	        <path d="M55.146,51.887L41.588,37.786c3.486-4.144,5.396-9.358,5.396-14.786c0-12.682-10.318-23-23-23s-23,10.318-23,23  s10.318,23,23,23c4.761,0,9.298-1.436,13.177-4.162l13.661,14.208c0.571,0.593,1.339,0.92,2.162,0.92  c0.779,0,1.518-0.297,2.079-0.837C56.255,54.982,56.293,53.08,55.146,51.887z M23.984,6c9.374,0,17,7.626,17,17s-7.626,17-17,17  s-17-7.626-17-17S14.61,6,23.984,6z"></path>
	  </svg>
	  <ul class="${[`absolute bg-white`,  "hidden" ].join(' ').trim() }">
	    ${each(filtered_streamers, (streamer) => `<li class="w-48 px-2 py-2 hover:bg-purple-500 hover:text-white text-black flex flex-row items-center truncate bg-white">
	        <img class="rounded-full h-8 w-8"${add_attribute("src", streamer.profile_image_url, 0)}>
	        <div class="px-2"><span>${escape(streamer._left)}</span><span class="text-red-500">${escape(streamer._center)}</span><span>${escape(streamer._right)}</span></div>
	      </li>`)}
	  </ul>
	</div>`;
});

/* src/components/StreamerMap.svelte generated by Svelte v3.12.1 */

const CLUSTERING_BORDER_WIDTH = 6;

const POTRAIT_MARGIN = 0;

const StreamerMap = create_ssr_component(($$result, $$props, $$bindings, $$slots) => {
	

let streamers;
let canvas;
let search = "";
let clustering_show = true;
let potrait_show = true;
let name_show = true;
let saturate_filter = true;
let piece_width, piece_height;
let hovered = null;
let mouse_x = 0, mouse_y = 0, mouse_in = false;
const COLOR_PALETTE = [
'#a6cee3',
'#1f78b4',
'#b2df8a',
'#33a02c',
'#fb9a99',
'#e31a1c',
'#fdbf6f',
'#ff7f00',
'#cab2d6',
'#6a3d9a',
'#ffff99',
'#b15928',
];
const PATTERNS = [
  [[1,1,1,1],
   [1,1,1,1],
   [1,1,1,1],
   [1,1,1,1]],
  [[1,0,1,1],
   [1,1,0,1],
   [1,1,1,0],
   [0,1,1,1]],
  [[1,0,1,0],
   [0,1,0,1],
   [1,0,1,0],
   [0,1,0,1]],
  [[1,1,1,1],
   [0,0,0,0],
   [1,1,1,1],
   [0,0,0,0]],
  [[0,1,0,1],
   [0,1,0,1],
   [0,1,0,1],
   [0,1,0,1]],
];
function highlight_streamer(ctx, s, color) {
  ctx.strokeStyle = color;
  ctx.fillStyle = color;
  ctx.globalAlpha = 0.5;
  ctx.fillRect(s.coordx, s.coordy, piece_width, piece_height);
  ctx.globalAlpha = 1.0;
  ctx.lineWidth = POTRAIT_MARGIN;
  ctx.strokeRect(s.coordx, s.coordy, piece_width, piece_height);
}

onMount(async ()=>{
  streamers = await API.streamer_map.call(undefined);
  canvas.ondblclick = function () {
    for(let s of streamers) 
      if(mouse_x < s.coordx + piece_width &&
        mouse_x >= s.coordx &&
        mouse_y < s.coordy + piece_height &&
        mouse_y >= s.coordy)
        location = `/streamer/${s.id}`;
  };
  const buffer_canvas = document.createElement("canvas"),
        buffer_ctx = buffer_canvas.getContext("2d");
  buffer_canvas.width = 4;
  buffer_canvas.height = 4;
  const FILL_STYLES = [];
  const FILL_COLORS = [];
  for(let i=0; i<PATTERNS.length; ++i)
    for(let j=0; j<COLOR_PALETTE.length; ++j){
       FILL_STYLES.push(gen_pattern(i, COLOR_PALETTE[j], COLOR_PALETTE[(j+1)%COLOR_PALETTE.length]));
       FILL_COLORS.push(COLOR_PALETTE[j]);
    }
  function gen_pattern(index, color1, color2=null, alpha=1.0) {
    buffer_canvas.width = PATTERNS[index].length;
    buffer_canvas.height = PATTERNS[0].length;
    buffer_ctx.clearRect(0, 0, buffer_canvas.width, buffer_canvas.height);
    buffer_ctx.fillStyle = color1;
    buffer_ctx.globalAlpha = alpha;
    for(let i=0; i<buffer_canvas.width; ++i)
      for(let j=0; j<buffer_canvas.height; ++j)
        if(PATTERNS[index][i][j])
          buffer_ctx.fillRect(i, j, 1, 1);
    if(color2){
      buffer_ctx.fillStyle = color2;
      for(let i=0; i<buffer_canvas.width; ++i)
        for(let j=0; j<buffer_canvas.height; ++j)
          if(!PATTERNS[index][i][j])
            buffer_ctx.fillRect(i, j, 1, 1);
    }
    return buffer_ctx.createPattern(buffer_canvas, "repeat");
  }
  let ctx = canvas.getContext("2d");
  let potrait_matrix_canvas = document.createElement("canvas"),
      potrait_matrix_ctx = potrait_matrix_canvas.getContext("2d");
  let name_matrix_canvas = document.createElement("canvas"),
      name_matrix_ctx = name_matrix_canvas.getContext("2d");
  potrait_matrix_canvas.width = canvas.width;
  potrait_matrix_canvas.height = canvas.height;
  name_matrix_canvas.width = canvas.width;
  name_matrix_canvas.height = canvas.height;
  canvas.onmousemove = function (e) {
    let rect = e.target.getBoundingClientRect();
    mouse_x = e.clientX - rect.left;
    mouse_y = e.clientY - rect.top;
    mouse_in = true;
  };
  canvas.onmouseout = function(e) { mouse_in = false; };
  streamers = (() => {
    let n = (Math.ceil(Math.sqrt(streamers.length)));
    piece_width = canvas.width/n - POTRAIT_MARGIN*2;
    piece_height = canvas.height/n - POTRAIT_MARGIN*2;
    let streamer_matrix = Array(n).fill().map(()=>Array(n).fill(null));
    for(let s of streamers) streamer_matrix[s.x][s.y] = s;
    for(let s of streamers) {
      let x = (piece_width + POTRAIT_MARGIN*2)*s.x + POTRAIT_MARGIN,
          y = (piece_height + POTRAIT_MARGIN*2)*s.y + POTRAIT_MARGIN;
      if(s.cluster >= 0 && (s.x-1 < 0 || streamer_matrix[s.x-1][s.y] == null || streamer_matrix[s.x-1][s.y].cluster != s.cluster))
        s.left_edge = true;
      if(s.cluster >= 0 && (s.x+1 >= streamer_matrix.length || streamer_matrix[s.x+1][s.y] == null || streamer_matrix[s.x+1][s.y].cluster != s.cluster))
        s.right_edge = true;
      if(s.cluster >= 0 && (s.y-1 < 0 || streamer_matrix[s.x][s.y-1] == null || streamer_matrix[s.x][s.y-1].cluster != s.cluster))
        s.top_edge = true;
      if(s.cluster >= 0 && (s.y+1 >= streamer_matrix.length || streamer_matrix[s.x][s.y+1] == null || streamer_matrix[s.x][s.y+1].cluster != s.cluster))
        s.bottom_edge = true;
      let image = new Image();
      image.onload = function () {
        potrait_matrix_ctx.drawImage(image, s.coordx, s.coordy, piece_width, piece_height);
      };
      image.src = s.profile_image_url;
      name_matrix_ctx.font = "10px Arial";
      let nx = x + CLUSTERING_BORDER_WIDTH,
          nw = piece_width - CLUSTERING_BORDER_WIDTH*2,
          w = name_matrix_ctx.measureText(s.name).width,
          l = Math.ceil(w/nw),
          piece_length = Math.floor(s.name.length / l),
          fh = parseInt(name_matrix_ctx.font),
          nh = fh*l,
          ny = y + piece_height - nh - CLUSTERING_BORDER_WIDTH;
      name_matrix_ctx.globalAlpha = 0.5;
      name_matrix_ctx.fillStyle = "#fff";
      name_matrix_ctx.fillRect(nx, ny, nw, nh);
      name_matrix_ctx.globalAlpha = 1.0;
      name_matrix_ctx.fillStyle = "#000";
      name_matrix_ctx.textBaseline = "top";
      name_matrix_ctx.textAlign = "center";
      for(let i=0; i<l-1; ++i)
        name_matrix_ctx.fillText(s.name.substr(i*piece_length, piece_length), x+piece_width*.5, ny + i*fh);
      name_matrix_ctx.fillText(s.name.slice((l-1)*piece_length), x+piece_width*.5, ny + (l-1)*fh);
      s.coordx = x;
      s.coordy = y;
    }
    return streamers;
  })();
  let frame;
  let frame_index = 0;
  ctx.font = "11px Arial";
  (function loop() {
    frame = requestAnimationFrame(loop);
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.save();
    ctx.filter = "saturate(10%)";
    ctx.drawImage(potrait_matrix_canvas, 0, 0);
    ctx.restore();
    for(let s of streamers){
      if( s.cluster >= 0){
        let color = FILL_COLORS[s.cluster],
            fill_style = FILL_STYLES[s.cluster];
        ctx.fillStyle = fill_style;
        if(hovered && s.cluster > -1 && hovered.cluster === s.cluster && frame_index%10 > 5) ;
        else{
          if(s.left_edge){
            let y=s.coordy, y2=y+piece_height;
            if(!s.bottom_edge)
              y2 += CLUSTERING_BORDER_WIDTH;
            if(!s.top_edge)
              y -= CLUSTERING_BORDER_WIDTH;
            ctx.fillRect(
                s.coordx,
                y,
                CLUSTERING_BORDER_WIDTH, y2-y);
          }
          if(s.right_edge){
            let y=s.coordy, y2=y+piece_height;
            if(!s.bottom_edge)
              y2 += CLUSTERING_BORDER_WIDTH;
            if(!s.top_edge)
              y -= CLUSTERING_BORDER_WIDTH;
            ctx.fillRect(
                s.coordx + piece_width - CLUSTERING_BORDER_WIDTH,
                y, 
                CLUSTERING_BORDER_WIDTH, y2-y);
          }
          if(s.top_edge){
            let x=s.coordx, x2=x + piece_width;
            if(!s.right_edge)
              x2 += CLUSTERING_BORDER_WIDTH;
            if(!s.left_edge)
              x -= CLUSTERING_BORDER_WIDTH;
            ctx.fillRect(
                x, 
                s.coordy,
                x2-x, CLUSTERING_BORDER_WIDTH);
          }
          if(s.bottom_edge){
            let x=s.coordx, x2=x+piece_width;
            if(!s.right_edge)
              x2 += CLUSTERING_BORDER_WIDTH;
            if(!s.left_edge)
              x -= CLUSTERING_BORDER_WIDTH;
            ctx.fillRect(
                x, 
                s.coordy + piece_height - CLUSTERING_BORDER_WIDTH,
                x2-x, CLUSTERING_BORDER_WIDTH);
          }
        }
      }
    }
    {
      ctx.drawImage(name_matrix_canvas, 0, 0);
    }
    if(mouse_in){
      for(let s of streamers) 
        if(mouse_x < s.coordx + piece_width &&
          mouse_x >= s.coordx &&
          mouse_y < s.coordy + piece_height &&
          mouse_y >= s.coordy)
          hovered = s;
      if(hovered){
        highlight_streamer(ctx, hovered, "#d4af37");
        if(search && hovered.id == search.id)
          search = "";
      }
    }
    else{
      hovered = null;
    }
    if(search){
      if(frame_index%10 > 5)
        highlight_streamer(ctx, search, "#d4af37");
    }
    frame_index += 1;
  }());
  return ()=>{
    cancelAnimationFrame(frame);
  }
});

	let $$settled;
	let $$rendered;

	do {
		$$settled = true;

		$$rendered = `<div class="w-full flex flex-row flex-wrap items-center my-4">
		  <div class="p-2">
		    ${validate_component(StreamerAutoComplete, 'StreamerAutoComplete').$$render($$result, {
			streamers: streamers,
			placeholder: "지도에서 찾기",
			selected: search
		}, {
			selected: $$value => { search = $$value; $$settled = false; }
		}, {})}
		  </div>
		  <div class="p-2 flex flex-row flex-wrap items-center">
		    <div class="px-2"><input type="checkbox" id="border" name="border"${add_attribute("checked", clustering_show, 1)}> <label for="border">국경</label></div>
		    <div class="px-2"><input type="checkbox" id="potrait" name="potrait"${add_attribute("checked", potrait_show, 1)}> <label for="potrait">초상화</label></div>
		    <div class="px-2"><input type="checkbox" id="saturate" name="saturate"${add_attribute("checked", saturate_filter, 1)}> <label for="saturate">흑백</label></div>
		    <div class="px-2"><input type="checkbox" id="name" name="name"${add_attribute("checked", name_show, 1)}> <label for="name">이름</label></div>
		  </div>
		</div>
		<div class="overflow-x-auto container">
		  <canvas width="1280" height="1280"${add_attribute("this", canvas, 1)}> </canvas>
		</div>

		`;
	} while (!$$settled);

	return $$rendered;
});

/* src/routes/index.svelte generated by Svelte v3.12.1 */

const Index = create_ssr_component(($$result, $$props, $$bindings, $$slots) => {
	return `${($$result.head += `<title>스트리머 지도</title>`, "")}

	<a href="hidden-links" style="visibility: hidden; position: absolute;"></a>
	${validate_component(StreamerMap, 'StreamerMap').$$render($$result, {}, {}, {})}`;
});

/* src/routes/hidden-links.svelte generated by Svelte v3.12.1 */

const Hidden_links = create_ssr_component(($$result, $$props, $$bindings, $$slots) => {
	return ``;
});

function unwrapExports (x) {
	return x && x.__esModule && Object.prototype.hasOwnProperty.call(x, 'default') ? x['default'] : x;
}

function createCommonjsModule(fn, module) {
	return module = { exports: {} }, fn(module, module.exports), module.exports;
}

var faUser = createCommonjsModule(function (module, exports) {
Object.defineProperty(exports, '__esModule', { value: true });
var prefix = 'fas';
var iconName = 'user';
var width = 448;
var height = 512;
var ligatures = [];
var unicode = 'f007';
var svgPathData = 'M224 256c70.7 0 128-57.3 128-128S294.7 0 224 0 96 57.3 96 128s57.3 128 128 128zm89.6 32h-16.7c-22.2 10.2-46.9 16-72.9 16s-50.6-5.8-72.9-16h-16.7C60.2 288 0 348.2 0 422.4V464c0 26.5 21.5 48 48 48h352c26.5 0 48-21.5 48-48v-41.6c0-74.2-60.2-134.4-134.4-134.4z';

exports.definition = {
  prefix: prefix,
  iconName: iconName,
  icon: [
    width,
    height,
    ligatures,
    unicode,
    svgPathData
  ]};

exports.faUser = exports.definition;
exports.prefix = prefix;
exports.iconName = iconName;
exports.width = width;
exports.height = height;
exports.ligatures = ligatures;
exports.unicode = unicode;
exports.svgPathData = svgPathData;
});

unwrapExports(faUser);
var faUser_1 = faUser.definition;
var faUser_2 = faUser.faUser;
var faUser_3 = faUser.prefix;
var faUser_4 = faUser.iconName;
var faUser_5 = faUser.width;
var faUser_6 = faUser.height;
var faUser_7 = faUser.ligatures;
var faUser_8 = faUser.unicode;
var faUser_9 = faUser.svgPathData;

var faUserSecret = createCommonjsModule(function (module, exports) {
Object.defineProperty(exports, '__esModule', { value: true });
var prefix = 'fas';
var iconName = 'user-secret';
var width = 448;
var height = 512;
var ligatures = [];
var unicode = 'f21b';
var svgPathData = 'M383.9 308.3l23.9-62.6c4-10.5-3.7-21.7-15-21.7h-58.5c11-18.9 17.8-40.6 17.8-64v-.3c39.2-7.8 64-19.1 64-31.7 0-13.3-27.3-25.1-70.1-33-9.2-32.8-27-65.8-40.6-82.8-9.5-11.9-25.9-15.6-39.5-8.8l-27.6 13.8c-9 4.5-19.6 4.5-28.6 0L182.1 3.4c-13.6-6.8-30-3.1-39.5 8.8-13.5 17-31.4 50-40.6 82.8-42.7 7.9-70 19.7-70 33 0 12.6 24.8 23.9 64 31.7v.3c0 23.4 6.8 45.1 17.8 64H56.3c-11.5 0-19.2 11.7-14.7 22.3l25.8 60.2C27.3 329.8 0 372.7 0 422.4v44.8C0 491.9 20.1 512 44.8 512h358.4c24.7 0 44.8-20.1 44.8-44.8v-44.8c0-48.4-25.8-90.4-64.1-114.1zM176 480l-41.6-192 49.6 32 24 40-32 120zm96 0l-32-120 24-40 49.6-32L272 480zm41.7-298.5c-3.9 11.9-7 24.6-16.5 33.4-10.1 9.3-48 22.4-64-25-2.8-8.4-15.4-8.4-18.3 0-17 50.2-56 32.4-64 25-9.5-8.8-12.7-21.5-16.5-33.4-.8-2.5-6.3-5.7-6.3-5.8v-10.8c28.3 3.6 61 5.8 96 5.8s67.7-2.1 96-5.8v10.8c-.1.1-5.6 3.2-6.4 5.8z';

exports.definition = {
  prefix: prefix,
  iconName: iconName,
  icon: [
    width,
    height,
    ligatures,
    unicode,
    svgPathData
  ]};

exports.faUserSecret = exports.definition;
exports.prefix = prefix;
exports.iconName = iconName;
exports.width = width;
exports.height = height;
exports.ligatures = ligatures;
exports.unicode = unicode;
exports.svgPathData = svgPathData;
});

unwrapExports(faUserSecret);
var faUserSecret_1 = faUserSecret.definition;
var faUserSecret_2 = faUserSecret.faUserSecret;
var faUserSecret_3 = faUserSecret.prefix;
var faUserSecret_4 = faUserSecret.iconName;
var faUserSecret_5 = faUserSecret.width;
var faUserSecret_6 = faUserSecret.height;
var faUserSecret_7 = faUserSecret.ligatures;
var faUserSecret_8 = faUserSecret.unicode;
var faUserSecret_9 = faUserSecret.svgPathData;

var faKey = createCommonjsModule(function (module, exports) {
Object.defineProperty(exports, '__esModule', { value: true });
var prefix = 'fas';
var iconName = 'key';
var width = 512;
var height = 512;
var ligatures = [];
var unicode = 'f084';
var svgPathData = 'M512 176.001C512 273.203 433.202 352 336 352c-11.22 0-22.19-1.062-32.827-3.069l-24.012 27.014A23.999 23.999 0 0 1 261.223 384H224v40c0 13.255-10.745 24-24 24h-40v40c0 13.255-10.745 24-24 24H24c-13.255 0-24-10.745-24-24v-78.059c0-6.365 2.529-12.47 7.029-16.971l161.802-161.802C163.108 213.814 160 195.271 160 176 160 78.798 238.797.001 335.999 0 433.488-.001 512 78.511 512 176.001zM336 128c0 26.51 21.49 48 48 48s48-21.49 48-48-21.49-48-48-48-48 21.49-48 48z';

exports.definition = {
  prefix: prefix,
  iconName: iconName,
  icon: [
    width,
    height,
    ligatures,
    unicode,
    svgPathData
  ]};

exports.faKey = exports.definition;
exports.prefix = prefix;
exports.iconName = iconName;
exports.width = width;
exports.height = height;
exports.ligatures = ligatures;
exports.unicode = unicode;
exports.svgPathData = svgPathData;
});

unwrapExports(faKey);
var faKey_1 = faKey.definition;
var faKey_2 = faKey.faKey;
var faKey_3 = faKey.prefix;
var faKey_4 = faKey.iconName;
var faKey_5 = faKey.width;
var faKey_6 = faKey.height;
var faKey_7 = faKey.ligatures;
var faKey_8 = faKey.unicode;
var faKey_9 = faKey.svgPathData;

var faSun = createCommonjsModule(function (module, exports) {
Object.defineProperty(exports, '__esModule', { value: true });
var prefix = 'fas';
var iconName = 'sun';
var width = 512;
var height = 512;
var ligatures = [];
var unicode = 'f185';
var svgPathData = 'M256 160c-52.9 0-96 43.1-96 96s43.1 96 96 96 96-43.1 96-96-43.1-96-96-96zm246.4 80.5l-94.7-47.3 33.5-100.4c4.5-13.6-8.4-26.5-21.9-21.9l-100.4 33.5-47.4-94.8c-6.4-12.8-24.6-12.8-31 0l-47.3 94.7L92.7 70.8c-13.6-4.5-26.5 8.4-21.9 21.9l33.5 100.4-94.7 47.4c-12.8 6.4-12.8 24.6 0 31l94.7 47.3-33.5 100.5c-4.5 13.6 8.4 26.5 21.9 21.9l100.4-33.5 47.3 94.7c6.4 12.8 24.6 12.8 31 0l47.3-94.7 100.4 33.5c13.6 4.5 26.5-8.4 21.9-21.9l-33.5-100.4 94.7-47.3c13-6.5 13-24.7.2-31.1zm-155.9 106c-49.9 49.9-131.1 49.9-181 0-49.9-49.9-49.9-131.1 0-181 49.9-49.9 131.1-49.9 181 0 49.9 49.9 49.9 131.1 0 181z';

exports.definition = {
  prefix: prefix,
  iconName: iconName,
  icon: [
    width,
    height,
    ligatures,
    unicode,
    svgPathData
  ]};

exports.faSun = exports.definition;
exports.prefix = prefix;
exports.iconName = iconName;
exports.width = width;
exports.height = height;
exports.ligatures = ligatures;
exports.unicode = unicode;
exports.svgPathData = svgPathData;
});

unwrapExports(faSun);
var faSun_1 = faSun.definition;
var faSun_2 = faSun.faSun;
var faSun_3 = faSun.prefix;
var faSun_4 = faSun.iconName;
var faSun_5 = faSun.width;
var faSun_6 = faSun.height;
var faSun_7 = faSun.ligatures;
var faSun_8 = faSun.unicode;
var faSun_9 = faSun.svgPathData;

var faMoon = createCommonjsModule(function (module, exports) {
Object.defineProperty(exports, '__esModule', { value: true });
var prefix = 'fas';
var iconName = 'moon';
var width = 512;
var height = 512;
var ligatures = [];
var unicode = 'f186';
var svgPathData = 'M283.211 512c78.962 0 151.079-35.925 198.857-94.792 7.068-8.708-.639-21.43-11.562-19.35-124.203 23.654-238.262-71.576-238.262-196.954 0-72.222 38.662-138.635 101.498-174.394 9.686-5.512 7.25-20.197-3.756-22.23A258.156 258.156 0 0 0 283.211 0c-141.309 0-256 114.511-256 256 0 141.309 114.511 256 256 256z';

exports.definition = {
  prefix: prefix,
  iconName: iconName,
  icon: [
    width,
    height,
    ligatures,
    unicode,
    svgPathData
  ]};

exports.faMoon = exports.definition;
exports.prefix = prefix;
exports.iconName = iconName;
exports.width = width;
exports.height = height;
exports.ligatures = ligatures;
exports.unicode = unicode;
exports.svgPathData = svgPathData;
});

unwrapExports(faMoon);
var faMoon_1 = faMoon.definition;
var faMoon_2 = faMoon.faMoon;
var faMoon_3 = faMoon.prefix;
var faMoon_4 = faMoon.iconName;
var faMoon_5 = faMoon.width;
var faMoon_6 = faMoon.height;
var faMoon_7 = faMoon.ligatures;
var faMoon_8 = faMoon.unicode;
var faMoon_9 = faMoon.svgPathData;

var faExternalLinkAlt = createCommonjsModule(function (module, exports) {
Object.defineProperty(exports, '__esModule', { value: true });
var prefix = 'fas';
var iconName = 'external-link-alt';
var width = 512;
var height = 512;
var ligatures = [];
var unicode = 'f35d';
var svgPathData = 'M432,320H400a16,16,0,0,0-16,16V448H64V128H208a16,16,0,0,0,16-16V80a16,16,0,0,0-16-16H48A48,48,0,0,0,0,112V464a48,48,0,0,0,48,48H400a48,48,0,0,0,48-48V336A16,16,0,0,0,432,320ZM488,0h-128c-21.37,0-32.05,25.91-17,41l35.73,35.73L135,320.37a24,24,0,0,0,0,34L157.67,377a24,24,0,0,0,34,0L435.28,133.32,471,169c15,15,41,4.5,41-17V24A24,24,0,0,0,488,0Z';

exports.definition = {
  prefix: prefix,
  iconName: iconName,
  icon: [
    width,
    height,
    ligatures,
    unicode,
    svgPathData
  ]};

exports.faExternalLinkAlt = exports.definition;
exports.prefix = prefix;
exports.iconName = iconName;
exports.width = width;
exports.height = height;
exports.ligatures = ligatures;
exports.unicode = unicode;
exports.svgPathData = svgPathData;
});

unwrapExports(faExternalLinkAlt);
var faExternalLinkAlt_1 = faExternalLinkAlt.definition;
var faExternalLinkAlt_2 = faExternalLinkAlt.faExternalLinkAlt;
var faExternalLinkAlt_3 = faExternalLinkAlt.prefix;
var faExternalLinkAlt_4 = faExternalLinkAlt.iconName;
var faExternalLinkAlt_5 = faExternalLinkAlt.width;
var faExternalLinkAlt_6 = faExternalLinkAlt.height;
var faExternalLinkAlt_7 = faExternalLinkAlt.ligatures;
var faExternalLinkAlt_8 = faExternalLinkAlt.unicode;
var faExternalLinkAlt_9 = faExternalLinkAlt.svgPathData;

/* src/components/ApexChart.svelte generated by Svelte v3.12.1 */

const LOCALE = {
"ko": {
  "name": "ko",
  "options": {
    "months": [
      "1월",
    "2월",
    "3월",
    "4월",
    "5월",
    "6월",
    "7월",
    "8월",
    "9월",
    "10월",
    "11월",
    "12월"
    ],
    "shortMonths": [
      "1월",
    "2월",
    "3월",
    "4월",
    "5월",
    "6월",
    "7월",
    "8월",
    "9월",
    "10월",
    "11월",
    "12월"
    ],
    "days": [
      "일요일",
    "월요일",
    "화요일",
    "수요일",
    "목요일",
    "금요일",
    "토요일"
    ],
    "shortDays": ["일", "월", "화", "수", "목", "금", "토"],
    "toolbar": {
      "exportToSVG": "SVG 다운로드",
      "exportToPNG": "PNG 다운로드",
      "exportToCSV": "CSV 다운로드",
      "menu": "메뉴",
      "selection": "선택",
      "selectionZoom": "선택영역 확대",
      "zoomIn": "확대",
      "zoomOut": "축소",
      "pan": "패닝",
      "reset": "원래대로"
    }
  }
}
};

const ApexChart = create_ssr_component(($$result, $$props, $$bindings, $$slots) => {
	let { classes, options } = $$props;
let ApexCharts;
let chart_el;
let { chart } = $$props;
let mounted = false;
onMount(async ()=>{
  ApexCharts = (await new Promise(function (resolve) { resolve(_interopNamespace(require('apexcharts'))); })).default;
});

	if ($$props.classes === void 0 && $$bindings.classes && classes !== void 0) $$bindings.classes(classes);
	if ($$props.options === void 0 && $$bindings.options && options !== void 0) $$bindings.options(options);
	if ($$props.chart === void 0 && $$bindings.chart && chart !== void 0) $$bindings.chart(chart);

	let width="100%";
	if(options && ApexCharts) {
      mounted = false;
      options.chart.events = options.chart.events || {};
      let last_onmounted = options.chart.events.mounted;
      options.chart.events.mounted = function(context, configs) {
        last_onmounted && last_onmounted(context, configs);
        mounted = true;
      };
      if(chart) chart.destroy();
      chart = new ApexCharts(chart_el, options);
      chart.render();
    }
	let height = isNaN(options.chart.height - 0)? options.chart.height || "auto" : options.chart.height + "px";

	return `<div${add_attribute("class", classes, 0)} style="height: ${escape(height)}"${add_attribute("this", chart_el, 1)}>
	${ !mounted ? `<div class="w-full h-full spinner" style="width: ${escape(width)}"></div>` : `` }
	</div>`;
});

const text_to_dark_color = (text) => {
  let hash = 0;
  if (text.length === 0) return hash;
  for (let i = 0; i < text.length; i++) {
    hash = text.charCodeAt(i) + ((hash << 5) - hash);
    hash = hash & hash;
  }
  let color = '#';
  for (let i = 0; i < 3; i++) {
    let value = (hash >> (i * 8)) % 200;
    color += ('00' + value.toString(16)).substr(-2);
  }
  return color;
};

/**
 * Springy v2.7.1
 *
 * Copyright (c) 2010-2013 Dennis Hotson
 *
 * Permission is hereby granted, free of charge, to any person
 * obtaining a copy of this software and associated documentation
 * files (the "Software"), to deal in the Software without
 * restriction, including without limitation the rights to use,
 * copy, modify, merge, publish, distribute, sublicense, and/or sell
 * copies of the Software, and to permit persons to whom the
 * Software is furnished to do so, subject to the following
 * conditions:
 *
 * The above copyright notice and this permission notice shall be
 * included in all copies or substantial portions of the Software.
 *
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND,
 * EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES
 * OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND
 * NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT
 * HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY,
 * WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING
 * FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR
 * OTHER DEALINGS IN THE SOFTWARE.
 */
const Springy = (function () {

	var Springy = {};

	var Graph = Springy.Graph = function() {
		this.nodeSet = {};
		this.nodes = [];
		this.edges = [];
		this.adjacency = {};

		this.nextNodeId = 0;
		this.nextEdgeId = 0;
		this.eventListeners = [];
	};

	var Node = Springy.Node = function(id, data) {
		this.id = id;
		this.data = (data !== undefined) ? data : {};

	// Data fields used by layout algorithm in this file:
	// this.data.mass
	// Data used by default renderer in springyui.js
	// this.data.label
	};

	var Edge = Springy.Edge = function(id, source, target, data) {
		this.id = id;
		this.source = source;
		this.target = target;
		this.data = (data !== undefined) ? data : {};

	// Edge data field used by layout alorithm
	// this.data.length
	// this.data.type
	};

	Graph.prototype.addNode = function(node) {
		if (!(node.id in this.nodeSet)) {
			this.nodes.push(node);
		}

		this.nodeSet[node.id] = node;

		this.notify();
		return node;
	};

	Graph.prototype.addNodes = function() {
		// accepts variable number of arguments, where each argument
		// is a string that becomes both node identifier and label
		for (var i = 0; i < arguments.length; i++) {
			var name = arguments[i];
			var node = new Node(name, {label:name});
			this.addNode(node);
		}
	};

	Graph.prototype.addEdge = function(edge) {
		var exists = false;
		this.edges.forEach(function(e) {
			if (edge.id === e.id) { exists = true; }
		});

		if (!exists) {
			this.edges.push(edge);
		}

		if (!(edge.source.id in this.adjacency)) {
			this.adjacency[edge.source.id] = {};
		}
		if (!(edge.target.id in this.adjacency[edge.source.id])) {
			this.adjacency[edge.source.id][edge.target.id] = [];
		}

		exists = false;
		this.adjacency[edge.source.id][edge.target.id].forEach(function(e) {
				if (edge.id === e.id) { exists = true; }
		});

		if (!exists) {
			this.adjacency[edge.source.id][edge.target.id].push(edge);
		}

		this.notify();
		return edge;
	};

	Graph.prototype.addEdges = function() {
		// accepts variable number of arguments, where each argument
		// is a triple [nodeid1, nodeid2, attributes]
		for (var i = 0; i < arguments.length; i++) {
			var e = arguments[i];
			var node1 = this.nodeSet[e[0]];
			if (node1 == undefined) {
				throw new TypeError("invalid node name: " + e[0]);
			}
			var node2 = this.nodeSet[e[1]];
			if (node2 == undefined) {
				throw new TypeError("invalid node name: " + e[1]);
			}
			var attr = e[2];

			this.newEdge(node1, node2, attr);
		}
	};

	Graph.prototype.newNode = function(data) {
		var node = new Node(this.nextNodeId++, data);
		this.addNode(node);
		return node;
	};

	Graph.prototype.newEdge = function(source, target, data) {
		var edge = new Edge(this.nextEdgeId++, source, target, data);
		this.addEdge(edge);
		return edge;
	};


	// add nodes and edges from JSON object
	Graph.prototype.loadJSON = function(json) {
	/**
	Springy's simple JSON format for graphs.
	historically, Springy uses separate lists
	of nodes and edges:
		{
			"nodes": [
				"center",
				"left",
				"right",
				"up",
				"satellite"
			],
			"edges": [
				["center", "left"],
				["center", "right"],
				["center", "up"]
			]
		}
	**/
		// parse if a string is passed (EC5+ browsers)
		if (typeof json == 'string' || json instanceof String) {
			json = JSON.parse( json );
		}

		if ('nodes' in json || 'edges' in json) {
			this.addNodes.apply(this, json['nodes']);
			this.addEdges.apply(this, json['edges']);
		}
	};


	// find the edges from node1 to node2
	Graph.prototype.getEdges = function(node1, node2) {
		if (node1.id in this.adjacency
			&& node2.id in this.adjacency[node1.id]) {
			return this.adjacency[node1.id][node2.id];
		}

		return [];
	};

	// remove a node and it's associated edges from the graph
	Graph.prototype.removeNode = function(node) {
		if (node.id in this.nodeSet) {
			delete this.nodeSet[node.id];
		}

		for (var i = this.nodes.length - 1; i >= 0; i--) {
			if (this.nodes[i].id === node.id) {
				this.nodes.splice(i, 1);
			}
		}

		this.detachNode(node);
	};

	// removes edges associated with a given node
	Graph.prototype.detachNode = function(node) {
		var tmpEdges = this.edges.slice();
		tmpEdges.forEach(function(e) {
			if (e.source.id === node.id || e.target.id === node.id) {
				this.removeEdge(e);
			}
		}, this);

		this.notify();
	};

	// remove a node and it's associated edges from the graph
	Graph.prototype.removeEdge = function(edge) {
		for (var i = this.edges.length - 1; i >= 0; i--) {
			if (this.edges[i].id === edge.id) {
				this.edges.splice(i, 1);
			}
		}

		for (var x in this.adjacency) {
			for (var y in this.adjacency[x]) {
				var edges = this.adjacency[x][y];

				for (var j=edges.length - 1; j>=0; j--) {
					if (this.adjacency[x][y][j].id === edge.id) {
						this.adjacency[x][y].splice(j, 1);
					}
				}

				// Clean up empty edge arrays
				if (this.adjacency[x][y].length == 0) {
					delete this.adjacency[x][y];
				}
			}

			// Clean up empty objects
			if (isEmpty(this.adjacency[x])) {
				delete this.adjacency[x];
			}
		}

		this.notify();
	};

	/* Merge a list of nodes and edges into the current graph. eg.
	var o = {
		nodes: [
			{id: 123, data: {type: 'user', userid: 123, displayname: 'aaa'}},
			{id: 234, data: {type: 'user', userid: 234, displayname: 'bbb'}}
		],
		edges: [
			{from: 0, to: 1, type: 'submitted_design', directed: true, data: {weight: }}
		]
	}
	*/
	Graph.prototype.merge = function(data) {
		var nodes = [];
		data.nodes.forEach(function(n) {
			nodes.push(this.addNode(new Node(n.id, n.data)));
		}, this);

		data.edges.forEach(function(e) {
			var from = nodes[e.from];
			var to = nodes[e.to];

			var id = (e.directed)
				? (id = e.type + "-" + from.id + "-" + to.id)
				: (from.id < to.id) // normalise id for non-directed edges
					? e.type + "-" + from.id + "-" + to.id
					: e.type + "-" + to.id + "-" + from.id;

			var edge = this.addEdge(new Edge(id, from, to, e.data));
			edge.data.type = e.type;
		}, this);
	};

	Graph.prototype.filterNodes = function(fn) {
		var tmpNodes = this.nodes.slice();
		tmpNodes.forEach(function(n) {
			if (!fn(n)) {
				this.removeNode(n);
			}
		}, this);
	};

	Graph.prototype.filterEdges = function(fn) {
		var tmpEdges = this.edges.slice();
		tmpEdges.forEach(function(e) {
			if (!fn(e)) {
				this.removeEdge(e);
			}
		}, this);
	};


	Graph.prototype.addGraphListener = function(obj) {
		this.eventListeners.push(obj);
	};

	Graph.prototype.notify = function() {
		this.eventListeners.forEach(function(obj){
			obj.graphChanged();
		});
	};

	// -----------
	var Layout = Springy.Layout = {};
	Layout.ForceDirected = function(graph, stiffness, repulsion, damping, minEnergyThreshold, maxSpeed) {
		this.graph = graph;
		this.stiffness = stiffness; // spring stiffness constant
		this.repulsion = repulsion; // repulsion constant
		this.damping = damping; // velocity damping factor
		this.minEnergyThreshold = minEnergyThreshold || 0.01; //threshold used to determine render stop
		this.maxSpeed = maxSpeed || Infinity; // nodes aren't allowed to exceed this speed

		this.nodePoints = {}; // keep track of points associated with nodes
		this.edgeSprings = {}; // keep track of springs associated with edges
	};

	Layout.ForceDirected.prototype.point = function(node) {
		if (!(node.id in this.nodePoints)) {
			var mass = (node.data.mass !== undefined) ? node.data.mass : 1.0;
			this.nodePoints[node.id] = new Layout.ForceDirected.Point(Vector.random(), mass);
		}

		return this.nodePoints[node.id];
	};

	Layout.ForceDirected.prototype.spring = function(edge) {
		if (!(edge.id in this.edgeSprings)) {
			var length = (edge.data.length !== undefined) ? edge.data.length : 1.0;

			var existingSpring = false;

			var from = this.graph.getEdges(edge.source, edge.target);
			from.forEach(function(e) {
				if (existingSpring === false && e.id in this.edgeSprings) {
					existingSpring = this.edgeSprings[e.id];
				}
			}, this);

			if (existingSpring !== false) {
				return new Layout.ForceDirected.Spring(existingSpring.point1, existingSpring.point2, 0.0, 0.0);
			}

			var to = this.graph.getEdges(edge.target, edge.source);
			from.forEach(function(e){
				if (existingSpring === false && e.id in this.edgeSprings) {
					existingSpring = this.edgeSprings[e.id];
				}
			}, this);

			if (existingSpring !== false) {
				return new Layout.ForceDirected.Spring(existingSpring.point2, existingSpring.point1, 0.0, 0.0);
			}

			this.edgeSprings[edge.id] = new Layout.ForceDirected.Spring(
				this.point(edge.source), this.point(edge.target), length, this.stiffness
			);
		}

		return this.edgeSprings[edge.id];
	};

	// callback should accept two arguments: Node, Point
	Layout.ForceDirected.prototype.eachNode = function(callback) {
		var t = this;
		this.graph.nodes.forEach(function(n){
			callback.call(t, n, t.point(n));
		});
	};

	// callback should accept two arguments: Edge, Spring
	Layout.ForceDirected.prototype.eachEdge = function(callback) {
		var t = this;
		this.graph.edges.forEach(function(e){
			callback.call(t, e, t.spring(e));
		});
	};

	// callback should accept one argument: Spring
	Layout.ForceDirected.prototype.eachSpring = function(callback) {
		var t = this;
		this.graph.edges.forEach(function(e){
			callback.call(t, t.spring(e));
		});
	};


	// Physics stuff
	Layout.ForceDirected.prototype.applyCoulombsLaw = function() {
		this.eachNode(function(n1, point1) {
			this.eachNode(function(n2, point2) {
				if (point1 !== point2)
				{
					var d = point1.p.subtract(point2.p);
					var distance = d.magnitude() + 0.1; // avoid massive forces at small distances (and divide by zero)
					var direction = d.normalise();

					// apply force to each end point
					point1.applyForce(direction.multiply(this.repulsion).divide(distance * distance * 0.5));
					point2.applyForce(direction.multiply(this.repulsion).divide(distance * distance * -0.5));
				}
			});
		});
	};

	Layout.ForceDirected.prototype.applyHookesLaw = function() {
		this.eachSpring(function(spring){
			var d = spring.point2.p.subtract(spring.point1.p); // the direction of the spring
			var displacement = spring.length - d.magnitude();
			var direction = d.normalise();

			// apply force to each end point
			spring.point1.applyForce(direction.multiply(spring.k * displacement * -0.5));
			spring.point2.applyForce(direction.multiply(spring.k * displacement * 0.5));
		});
	};

	Layout.ForceDirected.prototype.attractToCentre = function() {
		this.eachNode(function(node, point) {
			var direction = point.p.multiply(-1.0);
			point.applyForce(direction.multiply(this.repulsion / 50.0));
		});
	};


	Layout.ForceDirected.prototype.updateVelocity = function(timestep) {
		this.eachNode(function(node, point) {
			// Is this, along with updatePosition below, the only places that your
			// integration code exist?
			point.v = point.v.add(point.a.multiply(timestep)).multiply(this.damping);
			if (point.v.magnitude() > this.maxSpeed) {
			    point.v = point.v.normalise().multiply(this.maxSpeed);
			}
			point.a = new Vector(0,0);
		});
	};

	Layout.ForceDirected.prototype.updatePosition = function(timestep) {
		this.eachNode(function(node, point) {
			// Same question as above; along with updateVelocity, is this all of
			// your integration code?
			point.p = point.p.add(point.v.multiply(timestep));
		});
	};

	// Calculate the total kinetic energy of the system
	Layout.ForceDirected.prototype.totalEnergy = function(timestep) {
		var energy = 0.0;
		this.eachNode(function(node, point) {
			var speed = point.v.magnitude();
			energy += 0.5 * point.m * speed * speed;
		});

		return energy;
	};

	var __bind = function(fn, me){ return function(){ return fn.apply(me, arguments); }; }; // stolen from coffeescript, thanks jashkenas! ;-)

	Springy.requestAnimationFrame = __bind((this && (this.requestAnimationFrame ||
		this.webkitRequestAnimationFrame ||
		this.mozRequestAnimationFrame ||
		this.oRequestAnimationFrame ||
		this.msRequestAnimationFrame)) ||
		(function(callback, element) {
			setTimeout(callback, 10);
		}), this);


	/**
	 * Start simulation if it's not running already.
	 * In case it's running then the call is ignored, and none of the callbacks passed is ever executed.
	 */
	Layout.ForceDirected.prototype.start = function(render, onRenderStop, onRenderStart) {
		var t = this;

		if (this._started) return;
		this._started = true;
		this._stop = false;

		if (onRenderStart !== undefined) { onRenderStart(); }

		Springy.requestAnimationFrame(function step() {
			t.tick(0.03);

			if (render !== undefined) {
				render();
			}

			// stop simulation when energy of the system goes below a threshold
			if (t._stop || t.totalEnergy() < t.minEnergyThreshold) {
				t._started = false;
				if (onRenderStop !== undefined) { onRenderStop(); }
			} else {
				Springy.requestAnimationFrame(step);
			}
		});
	};

	Layout.ForceDirected.prototype.stop = function() {
		this._stop = true;
	};

	Layout.ForceDirected.prototype.tick = function(timestep) {
		this.applyCoulombsLaw();
		this.applyHookesLaw();
		this.attractToCentre();
		this.updateVelocity(timestep);
		this.updatePosition(timestep);
	};

	// Find the nearest point to a particular position
	Layout.ForceDirected.prototype.nearest = function(pos) {
		var min = {node: null, point: null, distance: null};
		var t = this;
		this.graph.nodes.forEach(function(n){
			var point = t.point(n);
			var distance = point.p.subtract(pos).magnitude();

			if (min.distance === null || distance < min.distance) {
				min = {node: n, point: point, distance: distance};
			}
		});

		return min;
	};

	// returns [bottomleft, topright]
	Layout.ForceDirected.prototype.getBoundingBox = function() {
		var bottomleft = new Vector(-2,-2);
		var topright = new Vector(2,2);

		this.eachNode(function(n, point) {
			if (point.p.x < bottomleft.x) {
				bottomleft.x = point.p.x;
			}
			if (point.p.y < bottomleft.y) {
				bottomleft.y = point.p.y;
			}
			if (point.p.x > topright.x) {
				topright.x = point.p.x;
			}
			if (point.p.y > topright.y) {
				topright.y = point.p.y;
			}
		});

		var padding = topright.subtract(bottomleft).multiply(0.07); // ~5% padding

		return {bottomleft: bottomleft.subtract(padding), topright: topright.add(padding)};
	};


	// Vector
	var Vector = Springy.Vector = function(x, y) {
		this.x = x;
		this.y = y;
	};

	Vector.random = function() {
		return new Vector(10.0 * (Math.random() - 0.5), 10.0 * (Math.random() - 0.5));
	};

	Vector.prototype.add = function(v2) {
		return new Vector(this.x + v2.x, this.y + v2.y);
	};

	Vector.prototype.subtract = function(v2) {
		return new Vector(this.x - v2.x, this.y - v2.y);
	};

	Vector.prototype.multiply = function(n) {
		return new Vector(this.x * n, this.y * n);
	};

	Vector.prototype.divide = function(n) {
		return new Vector((this.x / n) || 0, (this.y / n) || 0); // Avoid divide by zero errors..
	};

	Vector.prototype.magnitude = function() {
		return Math.sqrt(this.x*this.x + this.y*this.y);
	};

	Vector.prototype.normal = function() {
		return new Vector(-this.y, this.x);
	};

	Vector.prototype.normalise = function() {
		return this.divide(this.magnitude());
	};

	// Point
	Layout.ForceDirected.Point = function(position, mass) {
		this.p = position; // position
		this.m = mass; // mass
		this.v = new Vector(0, 0); // velocity
		this.a = new Vector(0, 0); // acceleration
	};

	Layout.ForceDirected.Point.prototype.applyForce = function(force) {
		this.a = this.a.add(force.divide(this.m));
	};

	// Spring
	Layout.ForceDirected.Spring = function(point1, point2, length, k) {
		this.point1 = point1;
		this.point2 = point2;
		this.length = length; // spring length at rest
		this.k = k; // spring constant (See Hooke's law) .. how stiff the spring is
	};

	// Layout.ForceDirected.Spring.prototype.distanceToPoint = function(point)
	// {
	// 	// hardcore vector arithmetic.. ohh yeah!
	// 	// .. see http://stackoverflow.com/questions/849211/shortest-distance-between-a-point-and-a-line-segment/865080#865080
	// 	var n = this.point2.p.subtract(this.point1.p).normalise().normal();
	// 	var ac = point.p.subtract(this.point1.p);
	// 	return Math.abs(ac.x * n.x + ac.y * n.y);
	// };

	/**
	 * Renderer handles the layout rendering loop
	 * @param onRenderStop optional callback function that gets executed whenever rendering stops.
	 * @param onRenderStart optional callback function that gets executed whenever rendering starts.
	 * @param onRenderFrame optional callback function that gets executed after each frame is rendered.
	 */
	var Renderer = Springy.Renderer = function(layout, clear, drawEdge, drawNode, onRenderStop, onRenderStart, onRenderFrame) {
		this.layout = layout;
		this.clear = clear;
		this.drawEdge = drawEdge;
		this.drawNode = drawNode;
		this.onRenderStop = onRenderStop;
		this.onRenderStart = onRenderStart;
		this.onRenderFrame = onRenderFrame;

		this.layout.graph.addGraphListener(this);
	};

	Renderer.prototype.graphChanged = function(e) {
		this.start();
	};

	/**
	 * Starts the simulation of the layout in use.
	 *
	 * Note that in case the algorithm is still or already running then the layout that's in use
	 * might silently ignore the call, and your optional <code>done</code> callback is never executed.
	 * At least the built-in ForceDirected layout behaves in this way.
	 *
	 * @param done An optional callback function that gets executed when the springy algorithm stops,
	 * either because it ended or because stop() was called.
	 */
	Renderer.prototype.start = function(done) {
		var t = this;
		this.layout.start(function render() {
			t.clear();

			t.layout.eachEdge(function(edge, spring) {
				t.drawEdge(edge, spring.point1.p, spring.point2.p);
			});

			t.layout.eachNode(function(node, point) {
				t.drawNode(node, point.p);
			});
			
			if (t.onRenderFrame !== undefined) { t.onRenderFrame(); }
		}, this.onRenderStop, this.onRenderStart);
	};

	Renderer.prototype.stop = function() {
		this.layout.stop();
	};

	// Array.forEach implementation for IE support..
	//https://developer.mozilla.org/en/JavaScript/Reference/Global_Objects/Array/forEach
	if ( !Array.prototype.forEach ) {
		Array.prototype.forEach = function( callback, thisArg ) {
			var T, k;
			if ( this == null ) {
				throw new TypeError( " this is null or not defined" );
			}
			var O = Object(this);
			var len = O.length >>> 0; // Hack to convert O.length to a UInt32
			if ( {}.toString.call(callback) != "[object Function]" ) {
				throw new TypeError( callback + " is not a function" );
			}
			if ( thisArg ) {
				T = thisArg;
			}
			k = 0;
			while( k < len ) {
				var kValue;
				if ( k in O ) {
					kValue = O[ k ];
					callback.call( T, kValue, k, O );
				}
				k++;
			}
		};
	}

	var isEmpty = function(obj) {
		for (var k in obj) {
			if (obj.hasOwnProperty(k)) {
				return false;
			}
		}
		return true;
	};

  return Springy;
})();

/* src/components/Network.svelte generated by Svelte v3.12.1 */

const css = {
	code: ".node.svelte-f7bcdt{position:absolute;display:inline-block;transform:translate(-50%, -50%)}",
	map: "{\"version\":3,\"file\":\"Network.svelte\",\"sources\":[\"Network.svelte\"],\"sourcesContent\":[\"<script>\\nimport { Springy } from \\\"./springy.js\\\"\\nimport { onMount } from \\\"svelte\\\";\\n\\nexport let nodes = [];\\nexport let edges = [];\\nexport let width = 500;\\nexport let height = 500;\\n\\nlet canvas;\\n\\n// node: {id, src, name}\\n// edge: {from, to, label}\\n\\nfunction project(p, width, height) {\\n\\treturn { x: (p.x + 5)/10 * width, y: (p.y + 5)/10 * height };\\n}\\n\\n$: if(canvas) {\\n\\tlet graph = new Springy.Graph();\\n\\tlet graph_nodes = {};\\n\\tlet ctx = canvas.getContext(\\\"2d\\\");\\n\\tctx.setLineDash([10, 10]);\\n\\tctx.globalAlpha = 0.5;\\n\\tfor(let node of nodes)\\n\\t\\tgraph_nodes[node.id] = graph.newNode(node);\\n\\tfor(let edge of edges)\\n\\t\\tgraph.newEdge(graph_nodes[edge.from], graph_nodes[edge.to]);\\n\\tlet layout = new Springy.Layout.ForceDirected(graph, 400.0, 400.0, 0.5);\\n\\tlet renderer = new Springy.Renderer(layout,\\n\\t\\tfunction clear() {\\n\\t\\t\\tctx.clearRect(0, 0, width, height);\\n\\t\\t},\\n\\t\\tfunction drawEdge(edge, p1, p2) {\\n\\t\\t\\tctx.beginPath();\\n\\t\\t\\tp1 = project(p1, width, height);\\n\\t\\t\\tp2 = project(p2, width, height);\\n\\t\\t\\tctx.moveTo(p1.x, p1.y);\\n\\t\\t\\tctx.lineTo(p2.x, p2.y);\\n\\t\\t\\tctx.stroke();\\n\\t\\t},\\n\\t\\tfunction drawNode(node, p) {\\n\\t\\t\\t//node = document.getElementById(node.data.id);\\n\\t\\t\\tnode = node.data.ref;\\n\\t\\t\\t/*if(node.data.image.complete) \\n\\t\\t\\t\\tctx.drawImage(node.data.image, p.x * width + node.image.width, p.y * height);*/\\n\\t\\t\\t// draw a node\\n\\t\\t\\tp = project(p, width, height);\\n\\t\\t\\tif(node){\\n\\t\\t\\t\\tnode.style.left = p.x + \\\"px\\\";\\n\\t\\t\\t\\tnode.style.top = p.y + \\\"px\\\";\\n\\t\\t\\t}\\n\\t\\t}\\n\\t);\\n\\trenderer.start();\\n}\\n</script>\\n\\n<div class=\\\"relative\\\">\\n<canvas bind:this={canvas} width={width} height={height}> </canvas>\\n{#each nodes as node}\\n\\t<div bind:this={node.ref} id=\\\"{node.id}\\\" class=\\\"node\\\">\\n\\t\\t<slot {node}></slot>\\n\\t</div>\\n{/each}\\n</div>\\n\\n\\n<style>\\n.node {\\n\\tposition: absolute; \\n\\tdisplay: inline-block;\\n\\ttransform: translate(-50%, -50%);\\n}\\n</style>\\n\"],\"names\":[],\"mappings\":\"AAqEA,KAAK,cAAC,CAAC,AACN,QAAQ,CAAE,QAAQ,CAClB,OAAO,CAAE,YAAY,CACrB,SAAS,CAAE,UAAU,IAAI,CAAC,CAAC,IAAI,CAAC,AACjC,CAAC\"}"
};

const Network = create_ssr_component(($$result, $$props, $$bindings, $$slots) => {
	

let { nodes = [], edges = [], width = 500, height = 500 } = $$props;

let canvas;

	if ($$props.nodes === void 0 && $$bindings.nodes && nodes !== void 0) $$bindings.nodes(nodes);
	if ($$props.edges === void 0 && $$bindings.edges && edges !== void 0) $$bindings.edges(edges);
	if ($$props.width === void 0 && $$bindings.width && width !== void 0) $$bindings.width(width);
	if ($$props.height === void 0 && $$bindings.height && height !== void 0) $$bindings.height(height);

	$$result.css.add(css);

	return `<div class="relative">
	<canvas${add_attribute("width", width, 0)}${add_attribute("height", height, 0)}${add_attribute("this", canvas, 1)}> </canvas>
	${each(nodes, (node) => `<div${add_attribute("id", node.id, 0)} class="node svelte-f7bcdt"${add_attribute("this", node.ref, 1)}>
			${$$slots.default ? $$slots.default({ node: node }) : ``}
		</div>`)}
	</div>`;
});

/* src/routes/streamer/[id].svelte generated by Svelte v3.12.1 */

const css$1 = {
	code: "\n.apexcharts-tooltip,\n.apexcharts-tooltip.active\n{transition:none !important;background-color:transparent !important;transform:translate(0, 1.5em) !important}\n.apexcharts-marker\n{transition:none !important}.apexcharts-yaxistooltip{background-color:transparent !important;border:none !important;transform:translate(1.2em, -.5em);transition:none !important}.apexcharts-xaxistooltip{background-color:transparent !important;border:none !important;transform:translate(3em, -.7em);transition:none !important}\n.apexcharts-yaxistooltip:before, \n.apexcharts-yaxistooltip:after, \n.apexcharts-xaxistooltip:before, \n.apexcharts-xaxistooltip:after{display:none !important} .custom-tooltip {background-color:#fffA !important}.is_streaming_marker{animation:svelte-foiadf-blinker 1s linear infinite}.is_streaming_label{animation:svelte-foiadf-blinker 1s linear infinite}@keyframes svelte-foiadf-blinker{50%{opacity:0}}",
	map: "{\"version\":3,\"file\":\"[id].svelte\",\"sources\":[\"[id].svelte\"],\"sourcesContent\":[\"<style>\\n.vertical-text {\\n  writing-mode: vertical-rl;\\n  text-orientation: sideways;\\n  transform: rotate(180deg);\\n}\\n:global(.annotation) {\\n  /*opacity: 0.5 !important;*/\\n /* filter: alpha(opacity=50);*/\\n  /* margin-top: -40px; */\\n}\\n/*:global(.tooltip) {\\n}*/\\n:global(\\n.apexcharts-tooltip,\\n.apexcharts-tooltip.active\\n) {\\n   transition: none !important;\\n   background-color: transparent !important;\\n  transform: translate(0, 1.5em) !important;\\n}\\n:global(\\n.apexcharts-marker\\n) {\\n   transition: none !important;\\n}\\n:global(.apexcharts-yaxistooltip) { \\n  background-color: transparent !important;\\n  border: none !important;\\n  transform: translate(1.2em, -.5em);\\n  transition: none !important;\\n}\\n:global(.apexcharts-xaxistooltip) {\\n  background-color: transparent !important;\\n  border: none !important;\\n  transform: translate(3em, -.7em);\\n  transition: none !important;\\n}\\n:global(\\n.apexcharts-yaxistooltip:before, \\n.apexcharts-yaxistooltip:after, \\n.apexcharts-xaxistooltip:before, \\n.apexcharts-xaxistooltip:after) {\\n  display: none !important;\\n}\\n:global( .custom-tooltip ) {\\n  background-color: #fffA !important;\\n}\\n:global(.is_streaming_marker) {\\n  animation: blinker 1s linear infinite;\\n}\\n:global(.is_streaming_label) {\\n  animation: blinker 1s linear infinite;\\n}\\n@keyframes blinker {\\n  50% {\\n    opacity: 0;\\n  }\\n}\\n</style>\\n\\n<script context=\\\"module\\\">\\n\\timport { API } from '../../api.js';\\n  export async function preload(page, session) {\\n    const { id } = page.params;\\n    let res = await API.streamer.call(this, id);\\n    return res;\\n  }\\n</script>\\n\\n<div class=\\\"hidden annotation tooltip apexcharts-tooltip apexcharts-tooltip apexcharts-xaxistooltip apexcharts-marker apexcharts-yaxistooltip custom-tooltip is_streaming_marker is_streaming_label\\\"></div>\\n<div class=\\\"w-full flex flex-row items-start flex-wrap justify-around m-4\\\">\\n  <div class=\\\"w-full flex flex-row items-start justify-around\\\">\\n    <div class=\\\"w-full md:w-auto p-4\\\">\\n\\t\\t\\t<h2 class=\\\"text-xl mt-2 font-semibold my-2\\\">프로필</h2>\\n      <img\\n        class=\\\"rounded-lg\\\"\\n        src=\\\"{streamer.profile_image_url}\\\"\\n        alt=\\\"프로필 이미지\\\"\\n      />\\n      <div class=\\\"py-2\\\">\\n\\t\\t\\t\\t{#if streamer.broadcaster_type == \\\"partner\\\"}\\n        <div class=\\\"text-xs tracking-wider text-gray-600 -mb-1 flex flex-row items-center\\\">\\n\\t\\t\\t\\t\\t<svg xmlns=\\\"http://www.w3.org/2000/svg\\\" viewBox=\\\"0 0 24 24\\\" class=\\\"w-4 h-4 inline-block\\\"><path fill=\\\"currentColor\\\" d=\\\"M2.149 0l-1.612 4.119v16.836h5.731v3.045h3.224l3.045-3.045h4.657l6.269-6.269v-14.686h-21.314zm19.164 13.612l-3.582 3.582h-5.731l-3.045 3.045v-3.045h-4.836v-15.045h17.194v11.463zm-3.582-7.343v6.262h-2.149v-6.262h2.149zm-5.731 0v6.262h-2.149v-6.262h2.149z\\\"/></svg>\\n\\t\\t\\t\\t\\t<span class=\\\"ml-2\\\">파트너</span>\\n\\t\\t\\t\\t</div>\\n\\t\\t\\t\\t{/if}\\n\\t\\t\\t\\t<div>\\n\\t\\t\\t\\t\\t<h1 class=\\\"text-3xl font-semibold tracking-wider\\\">{streamer.name}</h1>\\n\\t\\t\\t\\t\\t<a class=\\\"text-xs text-blue-500 flex flex-row items-center\\\" href=\\\"https://www.twitch.tv/{streamer.login}\\\">\\n\\t\\t\\t\\t\\t\\t<svg area-hidden=\\\"true\\\" role=\\\"img\\\" xmlns=\\\"http://www.w3.org/2000/svg\\\" viewBox=\\\"0 0 {faExternalLinkAlt.icon[0]} {faExternalLinkAlt.icon[1]}\\\" class=\\\"w-3 h-3 mr-1 overflow-visible inline-block\\\">\\n\\t\\t\\t\\t\\t\\t\\t<path fill=\\\"currentColor\\\" d=\\\"{faExternalLinkAlt.icon[4]}\\\"/>\\n\\t\\t\\t\\t\\t\\t</svg>\\n\\t\\t\\t\\t\\t\\t<span>트위치 채널 바로가기</span>\\n\\t\\t\\t\\t\\t</a>\\n\\t\\t\\t\\t</div>\\n        <div class=\\\"pt-4\\\">\\n          {streamer.description}\\n        </div>\\n      </div>\\n    </div>\\n    <div class=\\\"w-full md:w-auto flex flex-col flex-wrap justify-between ml-4 p-4\\\">\\n      <div>\\n        <h2 class=\\\"text-xl my-2 font-semibold\\\">비슷한 스트리머</h2>\\n\\t\\t\\t\\t<Network \\n\\t\\t\\t\\t\\tnodes={[...similar_streamers, streamer]} \\n\\t\\t\\t\\t\\tedges={similar_streamers.map(s => ({from: streamer.id, to: s.id}))}\\n\\t\\t\\t\\t\\twidth=500 height=500\\n\\t\\t\\t\\t\\tlet:node={node}>\\n\\t\\t\\t\\t\\t<a class=\\\"flex flex-col items-center\\\" href=\\\"/streamer/{node.id}\\\">\\n\\t\\t\\t\\t\\t\\t<img class=\\\"w-16 h-16 rounded-full\\\" src=\\\"{node.profile_image_url}\\\" art=\\\"프로필 사진\\\" />\\n\\t\\t\\t\\t\\t\\t<div class=\\\"flex flex-col items-center\\\"> \\n\\t\\t\\t\\t\\t\\t\\t<span class=\\\"text-sm\\\"> {node.name} </span>\\n\\t\\t\\t\\t\\t\\t\\t{#if node.similarity} <span class=\\\"text-xs text-gray-600 tracking-wider\\\"> ({(node.similarity*100).toFixed(1)}%) </span> {/if}\\n\\t\\t\\t\\t\\t\\t</div>\\n\\t\\t\\t\\t\\t</a>\\n\\t\\t\\t\\t</Network>\\n        <!--<div class=\\\"flex flex-row flex-wrap mt-1\\\">\\n        {#each similar_streamers as streamer}\\n          <a class=\\\"mr-1 pr-2 flex flex-col flex-wrap items-center rounded-sm\\\" \\n            href=\\\"/streamer/{streamer.id}\\\">\\n            <img class=\\\"w-16 h-16 rounded-full m-1\\\" art=\\\"프로필 이미지\\\" \\n              src=\\\"{streamer.profile_image_url}\\\"/>\\n            <div><span class=\\\"text-sm\\\"> {streamer.name} </span> \\n                 <span class=\\\"text-xs text-gray-600\\\">({(streamer.similarity*100).toFixed(1)}%)</span></div>\\n          </a>\\n        {/each}\\n        </div>-->\\n      </div>\\n    </div>\\n  </div>\\n  <div class=\\\"w-full mt-8 p-4\\\">\\n    <h2 class=\\\"w-full text-xl font-semibold my-2\\\">방송 타임라인</h2>\\n    <div class=\\\"w-full flex flex-row mt-1\\\">\\n      <div class=\\\"w-1/4 bg-gray-200 text-center\\\">\\n        <svg area-hidden=\\\"true\\\" role=\\\"img\\\" xmlns=\\\"http://www.w3.org/2000/svg\\\" viewBox=\\\"0 0 {faMoon.icon[0]} {faMoon.icon[1]}\\\" class=\\\"w-4 h-4 mr-2 overflow-visible inline-block text-yellow-700\\\">\\n          <path fill=\\\"currentColor\\\" d=\\\"{faMoon.icon[4]}\\\"/>\\n        </svg>\\n      </div>\\n      <div class=\\\"w-1/2 bg-yellow-300 text-center\\\">\\n        <svg area-hidden=\\\"true\\\" role=\\\"img\\\" xmlns=\\\"http://www.w3.org/2000/svg\\\" viewBox=\\\"0 0 {faSun.icon[0]} {faSun.icon[1]}\\\" class=\\\"w-4 h-4 mr-2 overflow-visible inline-block text-white\\\">\\n          <path fill=\\\"currentColor\\\" d=\\\"{faSun.icon[4]}\\\"/>\\n        </svg>\\n      </div>\\n      <div class=\\\"w-1/4 bg-gray-200 text-center\\\">\\n        <svg area-hidden=\\\"true\\\" role=\\\"img\\\" xmlns=\\\"http://www.w3.org/2000/svg\\\" viewBox=\\\"0 0 {faMoon.icon[0]} {faMoon.icon[1]}\\\" class=\\\"w-4 h-4 mr-2 overflow-visible inline-block text-yellow-700\\\">\\n          <path fill=\\\"currentColor\\\" d=\\\"{faMoon.icon[4]}\\\"/>\\n        </svg>\\n      </div>\\n    </div>\\n    <div class=\\\"w-full\\\">\\n    {#each chart_options as chart_option, i}\\n      <div class=\\\"w-full flex flex-row flex-wrap items-center relative\\\">\\n        <ApexChart classes=\\\"flex-grow border-t border-gray-900\\\" options={chart_option} />\\n        <div class=\\\"flex-none mr-2 absolute top-0 left-0 p-1\\\"> {[\\\"오늘\\\", \\\"어제\\\", \\\"그제\\\", \\\"엊그제\\\", \\\"4일전\\\", \\\"5일전\\\", \\\"6일전\\\"][i]} </div>\\n      </div>\\n    {/each}\\n    </div>\\n  </div>\\n</div>\\n\\n\\n<script>\\n  import { onMount } from \\\"svelte\\\";\\n  import { faUser } from '@fortawesome/free-solid-svg-icons/faUser'\\n  import { faUserLock } from '@fortawesome/free-solid-svg-icons/faUserLock'\\n  import { faUserSecret } from '@fortawesome/free-solid-svg-icons/faUserSecret'\\n  import { faUserCheck } from '@fortawesome/free-solid-svg-icons/faUserCheck'\\n  import { faKey } from '@fortawesome/free-solid-svg-icons/faKey'\\n  import { faSun } from '@fortawesome/free-solid-svg-icons/faSun'\\n  import { faMoon } from '@fortawesome/free-solid-svg-icons/faMoon'\\n  import { faExternalLinkAlt } from '@fortawesome/free-solid-svg-icons/faExternalLinkAlt'\\n  import ApexChart, { LOCALE } from \\\"../../components/ApexChart.svelte\\\";\\n  import { text_to_dark_color } from \\\"../../util.js\\\";\\n\\timport Network from \\\"../../components/Network.svelte\\\"; \\n  export let streamer;\\n  export let viewer_count_changes;\\n  export let chatter_count_changes;\\n  export let follower_count_changes;\\n  export let stream_metadata_changes;\\n  export let similar_streamers;\\n  let chart_options = [];\\n  $: {\\n    let i=0, j=0, l, m;\\n    let max_viewer_count = Math.max(...viewer_count_changes.map(x=>x[1]));\\n    let chatter_dates = chatter_count_changes.map(x=>x[0]),\\n        viewer_dates = viewer_count_changes.map(x=>x[0]);\\n    l = viewer_count_changes.length;\\n    for(let date of chatter_dates){\\n      while(i < l && viewer_count_changes[i][0] < date) ++i;\\n      if(i >= l)\\n        viewer_count_changes.push([date, viewer_count_changes[i-1][1]]);\\n      else if(viewer_count_changes[i][0] != date)\\n        viewer_count_changes.push([date, i > 0? Math.floor((viewer_count_changes[i-1][1] + viewer_count_changes[i][1])*0.5): viewer_count_changes[i][1] ]);\\n    }\\n    i = 0;\\n    l = chatter_count_changes.length;\\n    for(let date of viewer_dates){\\n      while(i < l && chatter_count_changes[i][0] < date) ++i;\\n      if(i >= l)\\n        chatter_count_changes.push([date, viewer_count_changes[i-1][1]]);\\n      else if(chatter_count_changes[i][0] != date)\\n        chatter_count_changes.push([date, i > 0? Math.floor((chatter_count_changes[i-1][1] + chatter_count_changes[i][1])*0.5): chatter_count_changes[i][1] ]);\\n    }\\n    viewer_count_changes = viewer_count_changes.sort((a, b) => a[0]-b[0])\\n    chatter_count_changes = chatter_count_changes.sort((a, b) => a[0]-b[0])\\n    let today = new Date();\\n    today.setHours(0,0,0,0);\\n    today = today.getTime()/1000;\\n    let weeks = [\\n      [today, today+24*60*60],\\n      ...[...Array(6).keys()].map(i => [today - 24*60*60*(i+1), today - 24*60*60*i]),\\n      ];\\n    let game_changes = stream_metadata_changes.filter((x, i) => \\n        (x.started_at != (i>0 && stream_metadata_changes[i-1].started_at)) || \\n        (x.game && x.game.id) != (i>0 && stream_metadata_changes[i-1].game && stream_metadata_changes[i-1].game.id))\\n    let game_changes_of_week = weeks.map(range => game_changes.filter(x => x.time>=range[0] && x.time<range[1]));\\n    /*let stream_ends = stream_metadata_changes.filter((x, i) => x.started_at != (i>0 && stream_metadata_changes[i-1].started_at))\\n    let stream_changes_of_week = weeks.map(range => stream_changes.filter(x => x.time>=range[0] && x.time<range[1]));*/\\n    let time_annotations = [[3, \\\"03:00\\\", 0.2], [6, \\\"06:00\\\", 0.5], [9, \\\"09:00\\\", 0.2], [12, \\\"12:00\\\", 0.8], [15, \\\"15:00\\\", 0.2], [18, \\\"18:00\\\", 0.5], [21, \\\"21:00\\\", 0.2], [24, \\\"24:00\\\", 1]];//, [0, \\\"\\\", 1]];\\n    let daynight_annotations = [[0, 6, \\\"새벽\\\", \\\"#edf2f7\\\"], [6, 18, \\\"낮\\\", \\\"#F8CA00\\\"], [18, 24, \\\"밤\\\", \\\"#edf2f7\\\"]];\\n    let xaxis_annotations = [...new Array(7).fill().keys()].map(i=>[\\n      ...daynight_annotations.map((i => (x => ({\\n        x: weeks[i][0] + 60*60*x[0],\\n        x2: weeks[i][0] + 60*60*x[1],\\n        fillColor: x[3],\\n        borderColor: x[3],\\n        opacity: 0.1,\\n        label: {\\n          borderColor: '#00000000',\\n          style: {\\n            fontSize: '8px',\\n            color: '#FFFFFF00',\\n            background: '#FFFF0000',\\n          },\\n          text: x[2],\\n        }\\n      })))(i)),\\n      ...time_annotations.map((i => (x => ({\\n        x: weeks[i][0] + 60*60*x[0],\\n        borderColor: `rgba(32, 32, 32, ${x[2]})`,\\n        strokeDashArray: 0,\\n        opacity: x[2],\\n        label: {\\n          borderColor: '#FFFF0000',\\n          style: {\\n            fontSize: '8px',\\n            color: `rgba(32,32,32,${x[2]})`,\\n            background: '#FFFF0000',\\n          },\\n          text: x[1],\\n        }\\n      })))(i)),\\n    ]);\\n\\n    function chunk(changes) {\\n      let changes_of_week = weeks.map(range => changes.filter(x => x[0]>=range[0] && x[0]<range[1]));\\n      let change_chunks_of_week = [...Array(7).keys()].map(k => [ \\n        k===6 || !game_changes_of_week[k+1].length? null: {\\n          data: changes_of_week[k].filter(x => !game_changes_of_week[k].length || x[0] < game_changes_of_week[k][0].time || \\n            (\\n              x[0] == game_changes_of_week[k][0].time \\n              && game_changes_of_week[k+1][game_changes_of_week[k+1].length-1].started_at == game_changes_of_week[k][0].started_at\\n            )\\n          ),\\n          game: game_changes_of_week[k+1][game_changes_of_week[k+1].length-1].game,\\n        },\\n        ...game_changes_of_week[k].map((gc, i) => ({\\n          data: [ \\n            ...((k < game_changes_of_week.length-1 && game_changes_of_week[k].length && game_changes_of_week[k+1].length && game_changes_of_week[k+1][0].started_at == game_changes_of_week[k][game_changes_of_week[k].length-1].started_at)?\\n              [[weeks[k][0], changes_of_week[k+1][changes_of_week[k+1].length-1][1]]]: []),\\n            ...changes_of_week[k].filter(x => \\n              x[0] >= gc.time && \\n              (\\n                i+1 >= game_changes_of_week[k].length || x[0] < game_changes_of_week[k][i+1].time || \\n                (x[0] == game_changes_of_week[k][i+1].time && game_changes_of_week[k][i+1].started_at == game_changes_of_week[k][i].started_at)\\n              )),\\n            ...((k>0 && game_changes_of_week[k].length && game_changes_of_week[k-1].length && changes_of_week[k].length && game_changes_of_week[k][0].started_at == game_changes_of_week[k-1][game_changes_of_week[k-1].length-1].started_at)?\\n              [[weeks[k][1], changes_of_week[k][changes_of_week[k].length-1][1]]]: []),\\n            ],\\n          game: gc.game,\\n        })),\\n      ].filter(x => x));\\n      return change_chunks_of_week;\\n    }\\n    let viewer_count_change_chunks_of_week = chunk(viewer_count_changes),\\n        chatter_count_change_chunks_of_week = chunk(chatter_count_changes);\\n    chart_options = [...Array(7).keys()].map(i => ({\\n      chart: { \\n        defaultLocale: \\\"ko\\\", \\n        locales: [LOCALE[\\\"ko\\\"]], \\n        height: 100, \\n        sparkline: {\\n          enabled: true,\\n        },\\n        toolbar: {\\n          autoSelected: 'pan',\\n          show: false\\n        },\\n        animations: {\\n          enabled: false,\\n        },\\n      }, \\n      series: [\\n        ...chatter_count_change_chunks_of_week[i].map(chunk => ({\\n          name: \\\"로그인 시청자\\\",\\n          type: \\\"area\\\",\\n          data: chunk.data.map(x => [x[0], x[1]]),\\n        })),\\n        ...viewer_count_change_chunks_of_week[i].map((chunk, j)=> ({\\n          name: \\\"전체 시청자\\\",\\n          type: \\\"area\\\",\\n          data: chunk.data.map(x => [x[0], x[1]]),\\n        })),\\n      ],\\n      xaxis: { \\n        type: 'numeric', \\n        min: weeks[i][0], \\n        max: weeks[i][1], \\n        position: \\\"top\\\",\\n        labels: { show: false } ,\\n        tooltip: {\\n          enabled: true,\\n          formatter: function(val, opts) {\\n            let d = new Date(val*1000),\\n                h = d.getHours(), m = d.getMinutes(),\\n                formated_time = `${h<12? \\\"오전\\\": \\\"오후\\\"} ${h>12? h-12: h}시 ${m}분`;\\n            return formated_time;\\n          }\\n        },\\n        crosshairs: {\\n          show: true,\\n          width: 1,\\n          position: 'front',\\n          opacity: 0.9,        \\n          stroke: {\\n              color: '#b6b6b6',\\n              width: 1,\\n              dashArray: 0,\\n          },\\n        },\\n      },\\n      yaxis: { \\n        min: 0, \\n        max: max_viewer_count,\\n        tooltip: {\\n          enabled: true, \\n          formatter: (val, opts) => val + \\\"명\\\",\\n        }, \\n        crosshairs: {\\n          stroke: {\\n            color: '#b6b6b6',\\n            width: 1,\\n            dashArray: 0,\\n          },\\n        },\\n      },\\n      grid: { padding: {left:0, right:0, top:0, bottom:0}},\\n      markers: {\\n        colors: [\\n          ...chatter_count_change_chunks_of_week[i].map(_ => \\\"#AAAAAA00\\\"),\\n          ...viewer_count_change_chunks_of_week[i].map(_ => \\\"#558FFb\\\"),\\n        ],\\n        hover: {\\n          size: 4,\\n        },\\n      },\\n      tooltip: { \\n        enabledOnSeries: [\\n          ...viewer_count_change_chunks_of_week[i].map((_, i)=>i + chatter_count_change_chunks_of_week[i].length),\\n        ],\\n        marker: { show: false }, \\n        //shared: false,\\n        followCursor: true,\\n        custom: function({series, seriesIndex, dataPointIndex, w}) {\\n          let l = chatter_count_change_chunks_of_week[i].length, \\n              j = seriesIndex % l,\\n              k = game_changes_of_week[i].length-l+j,\\n              d = new Date(seriesIndex >= l? viewer_count_change_chunks_of_week[i][j].data[dataPointIndex][0]*1000 : chatter_count_change_chunks_of_week[i][j].data[dataPointIndex][0]*1000),\\n              h = d.getHours(), m = d.getMinutes(),\\n              formated_time = `${w.globals.locale.days[d.getDay()]} ${h<12? \\\"오전\\\": \\\"오후\\\"} ${h>12? h-12: h}시 ${m}분`,\\n              metadata = k<0? game_changes_of_week[i+1][game_changes_of_week[i+1].length-1]: game_changes_of_week[i][k],\\n              elapsed_seconds = (d - metadata.started_at*1000)/1000,\\n              elapsed_days = Math.floor(elapsed_seconds/24/60/60),\\n              elapsed_hours = Math.floor(elapsed_seconds%(24*60*60)/60/60),\\n              elapsed_minutes = Math.floor(elapsed_seconds%(60*60)/60);\\n          return `\\n            <div class=\\\"flex flex-col font-sans custom-tooltip p-3\\\"> \\n              <div class=\\\"\\\">\\n                <div class=\\\"text-gray-600 text-xs font-semibold tracking-wide\\\">\\n                  ${h<12? \\\"AM\\\": \\\"PM\\\"} ${(\\\"0\\\"+(h>12? h-12: h)).slice(-2)}:${(\\\"0\\\"+m).slice(-2)}\\n                </div>\\n              </div>\\n              <div class=\\\"flex flex-col mt-2\\\">\\n                <div class=\\\"flex flex-row flex-wrap items-center text-gray-900\\\">\\n                  <svg area-hidden=\\\"true\\\" role=\\\"img\\\" xmlns=\\\"http://www.w3.org/2000/svg\\\" viewBox=\\\"0 0 ${faUser.icon[0]} ${faUser.icon[1]}\\\" class=\\\"w-4 h-4 mr-2 overflow-visible inline-block\\\">\\n                    <path fill=\\\"currentColor\\\" d=\\\"${faUser.icon[4]}\\\"/>\\n                  </svg>\\n                  <b>${series[j+l][dataPointIndex]}명</b>\\n                </div>\\n                <div class=\\\"flex flex-row flex-wrap items-center text-blue-500 mt-1 text-xs\\\">\\n                  <svg area-hidden=\\\"true\\\" role=\\\"img\\\" xmlns=\\\"http://www.w3.org/2000/svg\\\" viewBox=\\\"0 0 ${faUserSecret.icon[0]} ${faUserSecret.icon[1]}\\\" class=\\\"w-3 h-3 mr-2 overflow-visible inline-block\\\">\\n                    <path fill=\\\"currentColor\\\" d=\\\"${faUserSecret.icon[4]}\\\"/>\\n                  </svg>\\n                  <b>${series[j+l][dataPointIndex] - series[j][dataPointIndex]}명</b>\\n                </div>\\n                <div class=\\\"flex flex-row flex-wrap items-center text-green-500 mt-1 text-xs\\\">\\n                  <svg area-hidden=\\\"true\\\" role=\\\"img\\\" xmlns=\\\"http://www.w3.org/2000/svg\\\" viewBox=\\\"0 0 ${faKey.icon[0]} ${faKey.icon[1]}\\\" class=\\\"w-3 h-3 mr-2 overflow-visible inline-block\\\">\\n                    <path fill=\\\"currentColor\\\" d=\\\"${faKey.icon[4]}\\\"/>\\n                  </svg>\\n                  <b>${series[j][dataPointIndex]}명</b>\\n                </div>\\n              </div>\\n              <div class=\\\"text-xs px-2 mt-3 border rounded-full text-white\\\" style=\\\"background-color: ${text_to_dark_color(metadata.game && \\\"\\\" + metadata.game.id || \\\"\\\")}\\\">\\n                ${metadata.game != null? metadata.game.name: \\\"\\\"} \\n              </div>\\n          </div>`;\\n        }\\n      },\\n      dataLabels: { enabled: false },\\n      legend: { show: false },\\n      stroke: { show: false },\\n      fill: {\\n        colors: viewer_count_change_chunks_of_week[i].map(_ => \\\"#558FFb\\\"),\\n        opacity: 1.0,\\n        type: [\\n          ...chatter_count_change_chunks_of_week[i].map(chunk => 'image'),\\n          ...viewer_count_change_chunks_of_week[i].map(chunk => 'solid'),\\n        ],\\n        image: {\\n          src: viewer_count_change_chunks_of_week[i].map((chunk, j) => chunk.game?  chunk.game.box_art_url.replace(\\\"{width}\\\", \\\"40\\\").replace(\\\"{height}\\\", \\\"50\\\"): null),\\n\\t\\t\\t\\t\\topacity: 1.0,\\n          width: 40,\\n          height: 50,\\n        },\\n      },\\n      annotations: {\\n        position: \\\"front\\\",\\n        xaxis: xaxis_annotations[i],\\n        points: [\\n          (!streamer.is_streaming)? null: {\\n            x: viewer_count_changes[viewer_count_changes.length-1][0],\\n            y: viewer_count_changes[viewer_count_changes.length-1][1],\\n            marker: {\\n              size: 4,\\n              fillColor: \\\"#ff4560\\\",\\n              strokeColor: \\\"#ff4560\\\",\\n              radius: 2,\\n              cssClass: 'is_streaming_marker',\\n            },\\n            label: {\\n              borderColor: \\\"#FF456000\\\",\\n              offsetX: 24,\\n              offsetY: 18,\\n              text: \\\"방송중\\\",\\n              style: {\\n                cssClass: 'is_streaming_label',\\n                color: \\\"#FF4560\\\",\\n                background: \\\"#FF456000\\\"\\n              },\\n            },\\n          },\\n        ],\\n      },\\n    }));\\n  }\\n  /*follower_count_changes = follower_count_changes.map((fcc, i) => [fcc[0], i>0? fcc[1] - follower_count_changes[i-1][1]: 0])\\n  let follower_count_min = Math.min(...follower_count_changes.map(x=>x[1]));\\n  let follower_count_max = Math.max(...follower_count_changes.map(x=>x[1]));*/\\n</script>\\n\"],\"names\":[],\"mappings\":\"AAaQ;;;AAGR,AAAE,CAAC,AACA,UAAU,CAAE,IAAI,CAAC,UAAU,CAC3B,gBAAgB,CAAE,WAAW,CAAC,UAAU,CACzC,SAAS,CAAE,UAAU,CAAC,CAAC,CAAC,KAAK,CAAC,CAAC,UAAU,AAC3C,CAAC,AACO;;AAER,AAAE,CAAC,AACA,UAAU,CAAE,IAAI,CAAC,UAAU,AAC9B,CAAC,AACO,wBAAwB,AAAE,CAAC,AACjC,gBAAgB,CAAE,WAAW,CAAC,UAAU,CACxC,MAAM,CAAE,IAAI,CAAC,UAAU,CACvB,SAAS,CAAE,UAAU,KAAK,CAAC,CAAC,KAAK,CAAC,CAClC,UAAU,CAAE,IAAI,CAAC,UAAU,AAC7B,CAAC,AACO,wBAAwB,AAAE,CAAC,AACjC,gBAAgB,CAAE,WAAW,CAAC,UAAU,CACxC,MAAM,CAAE,IAAI,CAAC,UAAU,CACvB,SAAS,CAAE,UAAU,GAAG,CAAC,CAAC,KAAK,CAAC,CAChC,UAAU,CAAE,IAAI,CAAC,UAAU,AAC7B,CAAC,AACO;;;;8BAIsB,AAAE,CAAC,AAC/B,OAAO,CAAE,IAAI,CAAC,UAAU,AAC1B,CAAC,AACO,iBAAiB,AAAE,CAAC,AAC1B,gBAAgB,CAAE,KAAK,CAAC,UAAU,AACpC,CAAC,AACO,oBAAoB,AAAE,CAAC,AAC7B,SAAS,CAAE,qBAAO,CAAC,EAAE,CAAC,MAAM,CAAC,QAAQ,AACvC,CAAC,AACO,mBAAmB,AAAE,CAAC,AAC5B,SAAS,CAAE,qBAAO,CAAC,EAAE,CAAC,MAAM,CAAC,QAAQ,AACvC,CAAC,AACD,WAAW,qBAAQ,CAAC,AAClB,GAAG,AAAC,CAAC,AACH,OAAO,CAAE,CAAC,AACZ,CAAC,AACH,CAAC\"}"
};

async function preload(page, session) {
  const { id } = page.params;
  let res = await API.streamer.call(this, id);
  return res;
}

const Id = create_ssr_component(($$result, $$props, $$bindings, $$slots) => {
	 
  let { streamer, viewer_count_changes, chatter_count_changes, follower_count_changes, stream_metadata_changes, similar_streamers } = $$props;
  let chart_options = [];
  /*follower_count_changes = follower_count_changes.map((fcc, i) => [fcc[0], i>0? fcc[1] - follower_count_changes[i-1][1]: 0])
  let follower_count_min = Math.min(...follower_count_changes.map(x=>x[1]));
  let follower_count_max = Math.max(...follower_count_changes.map(x=>x[1]));*/

	if ($$props.streamer === void 0 && $$bindings.streamer && streamer !== void 0) $$bindings.streamer(streamer);
	if ($$props.viewer_count_changes === void 0 && $$bindings.viewer_count_changes && viewer_count_changes !== void 0) $$bindings.viewer_count_changes(viewer_count_changes);
	if ($$props.chatter_count_changes === void 0 && $$bindings.chatter_count_changes && chatter_count_changes !== void 0) $$bindings.chatter_count_changes(chatter_count_changes);
	if ($$props.follower_count_changes === void 0 && $$bindings.follower_count_changes && follower_count_changes !== void 0) $$bindings.follower_count_changes(follower_count_changes);
	if ($$props.stream_metadata_changes === void 0 && $$bindings.stream_metadata_changes && stream_metadata_changes !== void 0) $$bindings.stream_metadata_changes(stream_metadata_changes);
	if ($$props.similar_streamers === void 0 && $$bindings.similar_streamers && similar_streamers !== void 0) $$bindings.similar_streamers(similar_streamers);

	$$result.css.add(css$1);

	{
        let i=0, l;
        let max_viewer_count = Math.max(...viewer_count_changes.map(x=>x[1]));
        let chatter_dates = chatter_count_changes.map(x=>x[0]),
            viewer_dates = viewer_count_changes.map(x=>x[0]);
        l = viewer_count_changes.length;
        for(let date of chatter_dates){
          while(i < l && viewer_count_changes[i][0] < date) ++i;
          if(i >= l)
            viewer_count_changes.push([date, viewer_count_changes[i-1][1]]);
          else if(viewer_count_changes[i][0] != date)
            viewer_count_changes.push([date, i > 0? Math.floor((viewer_count_changes[i-1][1] + viewer_count_changes[i][1])*0.5): viewer_count_changes[i][1] ]);
        }
        i = 0;
        l = chatter_count_changes.length;
        for(let date of viewer_dates){
          while(i < l && chatter_count_changes[i][0] < date) ++i;
          if(i >= l)
            chatter_count_changes.push([date, viewer_count_changes[i-1][1]]);
          else if(chatter_count_changes[i][0] != date)
            chatter_count_changes.push([date, i > 0? Math.floor((chatter_count_changes[i-1][1] + chatter_count_changes[i][1])*0.5): chatter_count_changes[i][1] ]);
        }
        viewer_count_changes = viewer_count_changes.sort((a, b) => a[0]-b[0]);
        chatter_count_changes = chatter_count_changes.sort((a, b) => a[0]-b[0]);
        let today = new Date();
        today.setHours(0,0,0,0);
        today = today.getTime()/1000;
        let weeks = [
          [today, today+24*60*60],
          ...[...Array(6).keys()].map(i => [today - 24*60*60*(i+1), today - 24*60*60*i]),
          ];
        let game_changes = stream_metadata_changes.filter((x, i) => 
            (x.started_at != (i>0 && stream_metadata_changes[i-1].started_at)) || 
            (x.game && x.game.id) != (i>0 && stream_metadata_changes[i-1].game && stream_metadata_changes[i-1].game.id));
        let game_changes_of_week = weeks.map(range => game_changes.filter(x => x.time>=range[0] && x.time<range[1]));
        /*let stream_ends = stream_metadata_changes.filter((x, i) => x.started_at != (i>0 && stream_metadata_changes[i-1].started_at))
        let stream_changes_of_week = weeks.map(range => stream_changes.filter(x => x.time>=range[0] && x.time<range[1]));*/
        let time_annotations = [[3, "03:00", 0.2], [6, "06:00", 0.5], [9, "09:00", 0.2], [12, "12:00", 0.8], [15, "15:00", 0.2], [18, "18:00", 0.5], [21, "21:00", 0.2], [24, "24:00", 1]];//, [0, "", 1]];
        let daynight_annotations = [[0, 6, "새벽", "#edf2f7"], [6, 18, "낮", "#F8CA00"], [18, 24, "밤", "#edf2f7"]];
        let xaxis_annotations = [...new Array(7).fill().keys()].map(i=>[
          ...daynight_annotations.map((i => (x => ({
            x: weeks[i][0] + 60*60*x[0],
            x2: weeks[i][0] + 60*60*x[1],
            fillColor: x[3],
            borderColor: x[3],
            opacity: 0.1,
            label: {
              borderColor: '#00000000',
              style: {
                fontSize: '8px',
                color: '#FFFFFF00',
                background: '#FFFF0000',
              },
              text: x[2],
            }
          })))(i)),
          ...time_annotations.map((i => (x => ({
            x: weeks[i][0] + 60*60*x[0],
            borderColor: `rgba(32, 32, 32, ${x[2]})`,
            strokeDashArray: 0,
            opacity: x[2],
            label: {
              borderColor: '#FFFF0000',
              style: {
                fontSize: '8px',
                color: `rgba(32,32,32,${x[2]})`,
                background: '#FFFF0000',
              },
              text: x[1],
            }
          })))(i)),
        ]);
    
        function chunk(changes) {
          let changes_of_week = weeks.map(range => changes.filter(x => x[0]>=range[0] && x[0]<range[1]));
          let change_chunks_of_week = [...Array(7).keys()].map(k => [ 
            k===6 || !game_changes_of_week[k+1].length? null: {
              data: changes_of_week[k].filter(x => !game_changes_of_week[k].length || x[0] < game_changes_of_week[k][0].time || 
                (
                  x[0] == game_changes_of_week[k][0].time 
                  && game_changes_of_week[k+1][game_changes_of_week[k+1].length-1].started_at == game_changes_of_week[k][0].started_at
                )
              ),
              game: game_changes_of_week[k+1][game_changes_of_week[k+1].length-1].game,
            },
            ...game_changes_of_week[k].map((gc, i) => ({
              data: [ 
                ...((k < game_changes_of_week.length-1 && game_changes_of_week[k].length && game_changes_of_week[k+1].length && game_changes_of_week[k+1][0].started_at == game_changes_of_week[k][game_changes_of_week[k].length-1].started_at)?
                  [[weeks[k][0], changes_of_week[k+1][changes_of_week[k+1].length-1][1]]]: []),
                ...changes_of_week[k].filter(x => 
                  x[0] >= gc.time && 
                  (
                    i+1 >= game_changes_of_week[k].length || x[0] < game_changes_of_week[k][i+1].time || 
                    (x[0] == game_changes_of_week[k][i+1].time && game_changes_of_week[k][i+1].started_at == game_changes_of_week[k][i].started_at)
                  )),
                ...((k>0 && game_changes_of_week[k].length && game_changes_of_week[k-1].length && changes_of_week[k].length && game_changes_of_week[k][0].started_at == game_changes_of_week[k-1][game_changes_of_week[k-1].length-1].started_at)?
                  [[weeks[k][1], changes_of_week[k][changes_of_week[k].length-1][1]]]: []),
                ],
              game: gc.game,
            })),
          ].filter(x => x));
          return change_chunks_of_week;
        }
        let viewer_count_change_chunks_of_week = chunk(viewer_count_changes),
            chatter_count_change_chunks_of_week = chunk(chatter_count_changes);
        chart_options = [...Array(7).keys()].map(i => ({
          chart: { 
            defaultLocale: "ko", 
            locales: [LOCALE["ko"]], 
            height: 100, 
            sparkline: {
              enabled: true,
            },
            toolbar: {
              autoSelected: 'pan',
              show: false
            },
            animations: {
              enabled: false,
            },
          }, 
          series: [
            ...chatter_count_change_chunks_of_week[i].map(chunk => ({
              name: "로그인 시청자",
              type: "area",
              data: chunk.data.map(x => [x[0], x[1]]),
            })),
            ...viewer_count_change_chunks_of_week[i].map((chunk, j)=> ({
              name: "전체 시청자",
              type: "area",
              data: chunk.data.map(x => [x[0], x[1]]),
            })),
          ],
          xaxis: { 
            type: 'numeric', 
            min: weeks[i][0], 
            max: weeks[i][1], 
            position: "top",
            labels: { show: false } ,
            tooltip: {
              enabled: true,
              formatter: function(val, opts) {
                let d = new Date(val*1000),
                    h = d.getHours(), m = d.getMinutes(),
                    formated_time = `${h<12? "오전": "오후"} ${h>12? h-12: h}시 ${m}분`;
                return formated_time;
              }
            },
            crosshairs: {
              show: true,
              width: 1,
              position: 'front',
              opacity: 0.9,        
              stroke: {
                  color: '#b6b6b6',
                  width: 1,
                  dashArray: 0,
              },
            },
          },
          yaxis: { 
            min: 0, 
            max: max_viewer_count,
            tooltip: {
              enabled: true, 
              formatter: (val, opts) => val + "명",
            }, 
            crosshairs: {
              stroke: {
                color: '#b6b6b6',
                width: 1,
                dashArray: 0,
              },
            },
          },
          grid: { padding: {left:0, right:0, top:0, bottom:0}},
          markers: {
            colors: [
              ...chatter_count_change_chunks_of_week[i].map(_ => "#AAAAAA00"),
              ...viewer_count_change_chunks_of_week[i].map(_ => "#558FFb"),
            ],
            hover: {
              size: 4,
            },
          },
          tooltip: { 
            enabledOnSeries: [
              ...viewer_count_change_chunks_of_week[i].map((_, i)=>i + chatter_count_change_chunks_of_week[i].length),
            ],
            marker: { show: false }, 
            //shared: false,
            followCursor: true,
            custom: function({series, seriesIndex, dataPointIndex, w}) {
              let l = chatter_count_change_chunks_of_week[i].length, 
                  j = seriesIndex % l,
                  k = game_changes_of_week[i].length-l+j,
                  d = new Date(seriesIndex >= l? viewer_count_change_chunks_of_week[i][j].data[dataPointIndex][0]*1000 : chatter_count_change_chunks_of_week[i][j].data[dataPointIndex][0]*1000),
                  h = d.getHours(), m = d.getMinutes(),
                  formated_time = `${w.globals.locale.days[d.getDay()]} ${h<12? "오전": "오후"} ${h>12? h-12: h}시 ${m}분`,
                  metadata = k<0? game_changes_of_week[i+1][game_changes_of_week[i+1].length-1]: game_changes_of_week[i][k],
                  elapsed_seconds = (d - metadata.started_at*1000)/1000;
              return `
                <div class="flex flex-col font-sans custom-tooltip p-3"> 
              <div class="">
                <div class="text-gray-600 text-xs font-semibold tracking-wide">
                  ${h<12? "AM": "PM"} ${("0"+(h>12? h-12: h)).slice(-2)}:${("0"+m).slice(-2)}
                    </div>
              </div>
              <div class="flex flex-col mt-2">
                <div class="flex flex-row flex-wrap items-center text-gray-900">
                  <svg area-hidden="true" role="img" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${faUser_2.icon[0]} ${faUser_2.icon[1]}" class="w-4 h-4 mr-2 overflow-visible inline-block">
                    <path fill="currentColor" d="${faUser_2.icon[4]}"/>
                  </svg>
                  <b>${series[j+l][dataPointIndex]}명</b>
                </div>
                <div class="flex flex-row flex-wrap items-center text-blue-500 mt-1 text-xs">
                  <svg area-hidden="true" role="img" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${faUserSecret_2.icon[0]} ${faUserSecret_2.icon[1]}" class="w-3 h-3 mr-2 overflow-visible inline-block">
                    <path fill="currentColor" d="${faUserSecret_2.icon[4]}"/>
                  </svg>
                  <b>${series[j+l][dataPointIndex] - series[j][dataPointIndex]}명</b>
                </div>
                <div class="flex flex-row flex-wrap items-center text-green-500 mt-1 text-xs">
                  <svg area-hidden="true" role="img" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${faKey_2.icon[0]} ${faKey_2.icon[1]}" class="w-3 h-3 mr-2 overflow-visible inline-block">
                    <path fill="currentColor" d="${faKey_2.icon[4]}"/>
                  </svg>
                  <b>${series[j][dataPointIndex]}명</b>
                </div>
              </div>
              <div class="text-xs px-2 mt-3 border rounded-full text-white" style="background-color: ${text_to_dark_color(metadata.game && "" + metadata.game.id || "")}">
                ${metadata.game != null? metadata.game.name: ""} 
              </div>
          </div>`;
            }
          },
          dataLabels: { enabled: false },
          legend: { show: false },
          stroke: { show: false },
          fill: {
            colors: viewer_count_change_chunks_of_week[i].map(_ => "#558FFb"),
            opacity: 1.0,
            type: [
              ...chatter_count_change_chunks_of_week[i].map(chunk => 'image'),
              ...viewer_count_change_chunks_of_week[i].map(chunk => 'solid'),
            ],
            image: {
              src: viewer_count_change_chunks_of_week[i].map((chunk, j) => chunk.game?  chunk.game.box_art_url.replace("{width}", "40").replace("{height}", "50"): null),
    					opacity: 1.0,
              width: 40,
              height: 50,
            },
          },
          annotations: {
            position: "front",
            xaxis: xaxis_annotations[i],
            points: [
              (!streamer.is_streaming)? null: {
                x: viewer_count_changes[viewer_count_changes.length-1][0],
                y: viewer_count_changes[viewer_count_changes.length-1][1],
                marker: {
                  size: 4,
                  fillColor: "#ff4560",
                  strokeColor: "#ff4560",
                  radius: 2,
                  cssClass: 'is_streaming_marker',
                },
                label: {
                  borderColor: "#FF456000",
                  offsetX: 24,
                  offsetY: 18,
                  text: "방송중",
                  style: {
                    cssClass: 'is_streaming_label',
                    color: "#FF4560",
                    background: "#FF456000"
                  },
                },
              },
            ],
          },
        }));
      }

	return `<div class="hidden annotation tooltip apexcharts-tooltip apexcharts-tooltip apexcharts-xaxistooltip apexcharts-marker apexcharts-yaxistooltip custom-tooltip is_streaming_marker is_streaming_label"></div>
	<div class="w-full flex flex-row items-start flex-wrap justify-around m-4">
	  <div class="w-full flex flex-row items-start justify-around">
	    <div class="w-full md:w-auto p-4">
				<h2 class="text-xl mt-2 font-semibold my-2">프로필</h2>
	      <img class="rounded-lg"${add_attribute("src", streamer.profile_image_url, 0)} alt="프로필 이미지">
	      <div class="py-2">
					${ streamer.broadcaster_type == "partner" ? `<div class="text-xs tracking-wider text-gray-600 -mb-1 flex flex-row items-center">
						<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" class="w-4 h-4 inline-block"><path fill="currentColor" d="M2.149 0l-1.612 4.119v16.836h5.731v3.045h3.224l3.045-3.045h4.657l6.269-6.269v-14.686h-21.314zm19.164 13.612l-3.582 3.582h-5.731l-3.045 3.045v-3.045h-4.836v-15.045h17.194v11.463zm-3.582-7.343v6.262h-2.149v-6.262h2.149zm-5.731 0v6.262h-2.149v-6.262h2.149z"></path></svg>
						<span class="ml-2">파트너</span>
					</div>` : `` }
					<div>
						<h1 class="text-3xl font-semibold tracking-wider">${escape(streamer.name)}</h1>
						<a class="text-xs text-blue-500 flex flex-row items-center" href="https://www.twitch.tv/${escape(streamer.login)}">
							<svg area-hidden="true" role="img" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${escape(faExternalLinkAlt_2.icon[0])} ${escape(faExternalLinkAlt_2.icon[1])}" class="w-3 h-3 mr-1 overflow-visible inline-block">
								<path fill="currentColor"${add_attribute("d", faExternalLinkAlt_2.icon[4], 0)}></path>
							</svg>
							<span>트위치 채널 바로가기</span>
						</a>
					</div>
	        <div class="pt-4">
	          ${escape(streamer.description)}
	        </div>
	      </div>
	    </div>
	    <div class="w-full md:w-auto flex flex-col flex-wrap justify-between ml-4 p-4">
	      <div>
	        <h2 class="text-xl my-2 font-semibold">비슷한 스트리머</h2>
					${validate_component(Network, 'Network').$$render($$result, {
		nodes: [...similar_streamers, streamer],
		edges: similar_streamers.map(s => ({from: streamer.id, to: s.id})),
		width: "500",
		height: "500"
	}, {}, {
		default: ({ node: node }) => `
						<a class="flex flex-col items-center" href="/streamer/${escape(node.id)}">
							<img class="w-16 h-16 rounded-full"${add_attribute("src", node.profile_image_url, 0)} art="프로필 사진">
							<div class="flex flex-col items-center"> 
								<span class="text-sm"> ${escape(node.name)} </span>
								${ node.similarity ? `<span class="text-xs text-gray-600 tracking-wider"> (${escape((node.similarity*100).toFixed(1))}%) </span>` : `` }
							</div>
						</a>
					`
	})}
	        
	      </div>
	    </div>
	  </div>
	  <div class="w-full mt-8 p-4">
	    <h2 class="w-full text-xl font-semibold my-2">방송 타임라인</h2>
	    <div class="w-full flex flex-row mt-1">
	      <div class="w-1/4 bg-gray-200 text-center">
	        <svg area-hidden="true" role="img" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${escape(faMoon_2.icon[0])} ${escape(faMoon_2.icon[1])}" class="w-4 h-4 mr-2 overflow-visible inline-block text-yellow-700">
	          <path fill="currentColor"${add_attribute("d", faMoon_2.icon[4], 0)}></path>
	        </svg>
	      </div>
	      <div class="w-1/2 bg-yellow-300 text-center">
	        <svg area-hidden="true" role="img" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${escape(faSun_2.icon[0])} ${escape(faSun_2.icon[1])}" class="w-4 h-4 mr-2 overflow-visible inline-block text-white">
	          <path fill="currentColor"${add_attribute("d", faSun_2.icon[4], 0)}></path>
	        </svg>
	      </div>
	      <div class="w-1/4 bg-gray-200 text-center">
	        <svg area-hidden="true" role="img" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${escape(faMoon_2.icon[0])} ${escape(faMoon_2.icon[1])}" class="w-4 h-4 mr-2 overflow-visible inline-block text-yellow-700">
	          <path fill="currentColor"${add_attribute("d", faMoon_2.icon[4], 0)}></path>
	        </svg>
	      </div>
	    </div>
	    <div class="w-full">
	    ${each(chart_options, (chart_option, i) => `<div class="w-full flex flex-row flex-wrap items-center relative">
	        ${validate_component(ApexChart, 'ApexChart').$$render($$result, {
		classes: "flex-grow border-t border-gray-900",
		options: chart_option
	}, {}, {})}
	        <div class="flex-none mr-2 absolute top-0 left-0 p-1"> ${escape(["오늘", "어제", "그제", "엊그제", "4일전", "5일전", "6일전"][i])} </div>
	      </div>`)}
	    </div>
	  </div>
	</div>`;
});

/* src/routes/map.svelte generated by Svelte v3.12.1 */

async function preload$1(page, session) {
  let streamers = await API.streamer_map.call(this);
  return { streamers };
}

const CLUSTERING_BORDER_WIDTH$1 = 6;

const POTRAIT_MARGIN$1 = 0;

const Map$1 = create_ssr_component(($$result, $$props, $$bindings, $$slots) => {
	

let { streamers } = $$props;
let canvas;
let search = "";
let clustering_show = true;
let potrait_show = true;
let name_show = true;
let saturate_filter = false;
let piece_width, piece_height;
let hovered = null;
let mouse_x = 0, mouse_y = 0, mouse_in = false;
const COLOR_PALETTE = [
'#a6cee3',
'#1f78b4',
'#b2df8a',
'#33a02c',
'#fb9a99',
'#e31a1c',
'#fdbf6f',
'#ff7f00',
'#cab2d6',
'#6a3d9a',
'#ffff99',
'#b15928',
];
const PATTERNS = [
  [[1,1,1,1],
   [1,1,1,1],
   [1,1,1,1],
   [1,1,1,1]],
  [[1,0,1,1],
   [1,1,0,1],
   [1,1,1,0],
   [0,1,1,1]],
  [[1,0,1,0],
   [0,1,0,1],
   [1,0,1,0],
   [0,1,0,1]],
  [[1,1,1,1],
   [0,0,0,0],
   [1,1,1,1],
   [0,0,0,0]],
  [[0,1,0,1],
   [0,1,0,1],
   [0,1,0,1],
   [0,1,0,1]],
];
function highlight_streamer(ctx, s, color) {
  ctx.strokeStyle = color;
  ctx.fillStyle = color;
  ctx.globalAlpha = 0.5;
  ctx.fillRect(s.coordx, s.coordy, piece_width, piece_height);
  ctx.globalAlpha = 1.0;
  ctx.lineWidth = POTRAIT_MARGIN$1;
  ctx.strokeRect(s.coordx, s.coordy, piece_width, piece_height);
}

onMount(async ()=>{
  //streamers = await API.streamer_map.call(this);
  canvas.ondblclick = function () {
    for(let s of streamers) 
      if(mouse_x < s.coordx + piece_width &&
        mouse_x >= s.coordx &&
        mouse_y < s.coordy + piece_height &&
        mouse_y >= s.coordy)
        location = `/streamer/${s.id}`;
  };
  const buffer_canvas = document.createElement("canvas"),
        buffer_ctx = buffer_canvas.getContext("2d");
  buffer_canvas.width = 4;
  buffer_canvas.height = 4;
  const FILL_STYLES = [];
  const FILL_COLORS = [];
  for(let i=0; i<PATTERNS.length; ++i)
    for(let j=0; j<COLOR_PALETTE.length; ++j){
       FILL_STYLES.push(gen_pattern(i, COLOR_PALETTE[j], COLOR_PALETTE[(j+1)%COLOR_PALETTE.length]));
       FILL_COLORS.push(COLOR_PALETTE[j]);
    }
  function gen_pattern(index, color1, color2=null, alpha=1.0) {
    buffer_canvas.width = PATTERNS[index].length;
    buffer_canvas.height = PATTERNS[0].length;
    buffer_ctx.clearRect(0, 0, buffer_canvas.width, buffer_canvas.height);
    buffer_ctx.fillStyle = color1;
    buffer_ctx.globalAlpha = alpha;
    for(let i=0; i<buffer_canvas.width; ++i)
      for(let j=0; j<buffer_canvas.height; ++j)
        if(PATTERNS[index][i][j])
          buffer_ctx.fillRect(i, j, 1, 1);
    if(color2){
      buffer_ctx.fillStyle = color2;
      for(let i=0; i<buffer_canvas.width; ++i)
        for(let j=0; j<buffer_canvas.height; ++j)
          if(!PATTERNS[index][i][j])
            buffer_ctx.fillRect(i, j, 1, 1);
    }
    return buffer_ctx.createPattern(buffer_canvas, "repeat");
  }
  let ctx = canvas.getContext("2d");
  let potrait_matrix_canvas = document.createElement("canvas"),
      potrait_matrix_ctx = potrait_matrix_canvas.getContext("2d");
  let name_matrix_canvas = document.createElement("canvas"),
      name_matrix_ctx = name_matrix_canvas.getContext("2d");
  potrait_matrix_canvas.width = canvas.width;
  potrait_matrix_canvas.height = canvas.height;
  name_matrix_canvas.width = canvas.width;
  name_matrix_canvas.height = canvas.height;
  canvas.onmousemove = function (e) {
    let rect = e.target.getBoundingClientRect();
    mouse_x = e.clientX - rect.left;
    mouse_y = e.clientY - rect.top;
    mouse_in = true;
  };
  canvas.onmouseout = function(e) { mouse_in = false; };
  streamers = (() => {
    let n = (Math.ceil(Math.sqrt(streamers.length)));
    piece_width = canvas.width/n - POTRAIT_MARGIN$1*2;
    piece_height = canvas.height/n - POTRAIT_MARGIN$1*2;
    let streamer_matrix = Array(n).fill().map(()=>Array(n).fill(null));
    for(let s of streamers) streamer_matrix[s.x][s.y] = s;
    for(let s of streamers) {
      let x = (piece_width + POTRAIT_MARGIN$1*2)*s.x + POTRAIT_MARGIN$1,
          y = (piece_height + POTRAIT_MARGIN$1*2)*s.y + POTRAIT_MARGIN$1;
      if(s.cluster >= 0 && (s.x-1 < 0 || streamer_matrix[s.x-1][s.y] == null || streamer_matrix[s.x-1][s.y].cluster != s.cluster))
        s.left_edge = true;
      if(s.cluster >= 0 && (s.x+1 >= streamer_matrix.length || streamer_matrix[s.x+1][s.y] == null || streamer_matrix[s.x+1][s.y].cluster != s.cluster))
        s.right_edge = true;
      if(s.cluster >= 0 && (s.y-1 < 0 || streamer_matrix[s.x][s.y-1] == null || streamer_matrix[s.x][s.y-1].cluster != s.cluster))
        s.top_edge = true;
      if(s.cluster >= 0 && (s.y+1 >= streamer_matrix.length || streamer_matrix[s.x][s.y+1] == null || streamer_matrix[s.x][s.y+1].cluster != s.cluster))
        s.bottom_edge = true;
      let image = new Image();
      image.onload = function () {
        potrait_matrix_ctx.drawImage(image, s.coordx, s.coordy, piece_width, piece_height);
      };
      image.src = s.profile_image_url;
      name_matrix_ctx.font = "10px Arial";
      let nx = x + CLUSTERING_BORDER_WIDTH$1,
          nw = piece_width - CLUSTERING_BORDER_WIDTH$1*2,
          w = name_matrix_ctx.measureText(s.name).width,
          l = Math.ceil(w/nw),
          piece_length = Math.floor(s.name.length / l),
          fh = parseInt(name_matrix_ctx.font),
          nh = fh*l,
          ny = y + piece_height - nh - CLUSTERING_BORDER_WIDTH$1;
      name_matrix_ctx.globalAlpha = 0.7;
      name_matrix_ctx.fillStyle = "#fff";
      name_matrix_ctx.fillRect(nx, ny, nw, nh);
      name_matrix_ctx.globalAlpha = 1.0;
      name_matrix_ctx.fillStyle = "#000";
      name_matrix_ctx.textBaseline = "top";
      name_matrix_ctx.textAlign = "center";
      for(let i=0; i<l-1; ++i)
        name_matrix_ctx.fillText(s.name.substr(i*piece_length, piece_length), x+piece_width*.5, ny + i*fh);
      name_matrix_ctx.fillText(s.name.slice((l-1)*piece_length), x+piece_width*.5, ny + (l-1)*fh);
      s.coordx = x;
      s.coordy = y;
    }
    return streamers;
  })();
  let frame;
  let frame_index = 0;
  ctx.font = "11px Arial";
  (function loop() {
    frame = requestAnimationFrame(loop);
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.save();
    ctx.drawImage(potrait_matrix_canvas, 0, 0);
    ctx.restore();
    for(let s of streamers){
      if( s.cluster >= 0){
        let color = FILL_COLORS[s.cluster],
            fill_style = FILL_STYLES[s.cluster];
        ctx.fillStyle = fill_style;
        if(hovered && s.cluster > -1 && hovered.cluster === s.cluster && frame_index%10 > 5) ;
        else{
          if(s.left_edge){
            let y=s.coordy, y2=y+piece_height;
            if(!s.bottom_edge)
              y2 += CLUSTERING_BORDER_WIDTH$1;
            if(!s.top_edge)
              y -= CLUSTERING_BORDER_WIDTH$1;
            ctx.fillRect(
                s.coordx,
                y,
                CLUSTERING_BORDER_WIDTH$1, y2-y);
          }
          if(s.right_edge){
            let y=s.coordy, y2=y+piece_height;
            if(!s.bottom_edge)
              y2 += CLUSTERING_BORDER_WIDTH$1;
            if(!s.top_edge)
              y -= CLUSTERING_BORDER_WIDTH$1;
            ctx.fillRect(
                s.coordx + piece_width - CLUSTERING_BORDER_WIDTH$1,
                y, 
                CLUSTERING_BORDER_WIDTH$1, y2-y);
          }
          if(s.top_edge){
            let x=s.coordx, x2=x + piece_width;
            if(!s.right_edge)
              x2 += CLUSTERING_BORDER_WIDTH$1;
            if(!s.left_edge)
              x -= CLUSTERING_BORDER_WIDTH$1;
            ctx.fillRect(
                x, 
                s.coordy,
                x2-x, CLUSTERING_BORDER_WIDTH$1);
          }
          if(s.bottom_edge){
            let x=s.coordx, x2=x+piece_width;
            if(!s.right_edge)
              x2 += CLUSTERING_BORDER_WIDTH$1;
            if(!s.left_edge)
              x -= CLUSTERING_BORDER_WIDTH$1;
            ctx.fillRect(
                x, 
                s.coordy + piece_height - CLUSTERING_BORDER_WIDTH$1,
                x2-x, CLUSTERING_BORDER_WIDTH$1);
          }
        }
      }
    }
    {
      ctx.drawImage(name_matrix_canvas, 0, 0);
    }
    if(mouse_in){
      for(let s of streamers) 
        if(mouse_x < s.coordx + piece_width &&
          mouse_x >= s.coordx &&
          mouse_y < s.coordy + piece_height &&
          mouse_y >= s.coordy)
          hovered = s;
      if(hovered){
        highlight_streamer(ctx, hovered, "#d4af37");
        if(search && hovered.id == search.id)
          search = "";
      }
    }
    else{
      hovered = null;
    }
    if(search){
      if(frame_index%10 > 5)
        highlight_streamer(ctx, search, "#d4af37");
    }
		ctx.save();
		for(let s of streamers) {
			if(s.is_streaming){
				ctx.beginPath();
				ctx.globalAlpha = Math.abs(Math.sin(frame_index/20));
				ctx.arc(s.coordx + CLUSTERING_BORDER_WIDTH$1 + 4, s.coordy + CLUSTERING_BORDER_WIDTH$1 + 4, 3, 0, 2 * Math.PI, false);
				ctx.fillStyle = "#FF4560";
				ctx.fill();
			}
		}
		ctx.restore();
    frame_index += 1;
  }());
  return ()=>{
    cancelAnimationFrame(frame);
  }
});

	if ($$props.streamers === void 0 && $$bindings.streamers && streamers !== void 0) $$bindings.streamers(streamers);

	let $$settled;
	let $$rendered;

	do {
		$$settled = true;

		$$rendered = `${($$result.head += `<title>스트리머 지도</title>`, "")}

		<div class="w-full flex flex-row flex-wrap items-center my-4">
		  <div class="p-2">
		    ${validate_component(StreamerAutoComplete, 'StreamerAutoComplete').$$render($$result, {
			streamers: streamers,
			placeholder: "지도에서 찾기",
			selected: search
		}, {
			selected: $$value => { search = $$value; $$settled = false; }
		}, {})}
		  </div>
		  <div class="p-2 flex flex-row flex-wrap items-center">
		    <div class="px-2"><input type="checkbox" id="border" name="border"${add_attribute("checked", clustering_show, 1)}> <label for="border">국경</label></div>
		    <div class="px-2"><input type="checkbox" id="potrait" name="potrait"${add_attribute("checked", potrait_show, 1)}> <label for="potrait">초상화</label></div>
		    <div class="px-2"><input type="checkbox" id="saturate" name="saturate"${add_attribute("checked", saturate_filter, 1)}> <label for="saturate">흑백</label></div>
		    <div class="px-2"><input type="checkbox" id="name" name="name"${add_attribute("checked", name_show, 1)}> <label for="name">이름</label></div>
		  </div>
		</div>
		<div class="overflow-x-auto container">
		  <canvas width="1280" height="1280"${add_attribute("this", canvas, 1)}> </canvas>
		</div>`;
	} while (!$$settled);

	return $$rendered;
});

/* src/components/Navigation.svelte generated by Svelte v3.12.1 */

const css$2 = {
	code: ".current-link.svelte-1xzizd9{@apply border-purple-500 text-purple;}",
	map: "{\"version\":3,\"file\":\"Navigation.svelte\",\"sources\":[\"Navigation.svelte\"],\"sourcesContent\":[\"<script>\\nimport StreamerAutoComplete from \\\"./StreamerAutoComplete.svelte\\\";\\nconst pages = [\\n    {segment: \\\"map\\\", name: \\\"지도\\\"},\\n    {segment: \\\"straw\\\", name: \\\"빨대\\\"},\\n  ];\\n\\nexport let segment;\\n\\nfunction on_streamer_search(target) {\\n  window.location.pathname = \\\"/streamer/\\\" + target.id;\\n}\\n</script>\\n\\n<nav class=\\\"shadow bg-white w-full\\\" role=\\\"navigation\\\">\\n  <div class=\\\"container flex flex-row flex-wrap justify-between items-center m-auto\\\">\\n    <div class=\\\"p-2 flex flex-row flex-wrap text-center border-b md:border-0 w-full md:w-auto\\\">\\n      <div class=\\\"\\\">\\n        <a href=\\\"/\\\"> Home </a>\\n      </div> \\n      <div class=\\\"flex -mb-px justify-center items-end\\\">\\n        {#each pages as page}\\n          <a class=\\\"pb-2 -mb-2 ml-4 no-underline border-b-2 text-xs border-transparent {segment === page.segment? 'border-purple-500 text-purple-500' : ''}\\\" href=\\\"/{page.segment}\\\" \\n            class:current-link=\\\"{segment === page.segment}\\\">\\n            {page.name}</a> \\n        {/each}\\n      </div>\\n      <div class=\\\"flex -mb-px justify-center items-end w-full md:w-auto\\\">\\n        <label \\n          class=\\\"pb-2 -mb-2 ml-4 no-underline border-b-2 text-xs border-transparent {\\\"streamer\\\" === segment? 'border-purple-500 text-purple-500' : ''}\\\" \\n          for=\\\"streamer-search-input\\\"> \\n          스트리머 \\n        </label>\\n        <StreamerAutoComplete bind:onselect={on_streamer_search} placeholder=\\\"검색\\\" inputid=\\\"streamer-search-input\\\" classes=\\\"pb-2 -mb-2 ml-2\\\"/>\\n      </div> \\n    </div>\\n  </div>\\n</nav>\\n\\n<style>\\n  .current-link {\\n    @apply border-purple-500 text-purple;\\n  }\\n</style>\\n\"],\"names\":[],\"mappings\":\"AAwCE,aAAa,eAAC,CAAC,AACb,OAAO,iBAAiB,CAAC,WAAW,CAAC,AACvC,CAAC\"}"
};

const Navigation = create_ssr_component(($$result, $$props, $$bindings, $$slots) => {
	const pages = [
    {segment: "map", name: "지도"},
    {segment: "straw", name: "빨대"},
  ];

let { segment } = $$props;

function on_streamer_search(target) {
  window.location.pathname = "/streamer/" + target.id;
}

	if ($$props.segment === void 0 && $$bindings.segment && segment !== void 0) $$bindings.segment(segment);

	$$result.css.add(css$2);

	let $$settled;
	let $$rendered;

	do {
		$$settled = true;

		$$rendered = `<nav class="shadow bg-white w-full" role="navigation">
		  <div class="container flex flex-row flex-wrap justify-between items-center m-auto">
		    <div class="p-2 flex flex-row flex-wrap text-center border-b md:border-0 w-full md:w-auto">
		      <div class="">
		        <a href="/"> Home </a>
		      </div> 
		      <div class="flex -mb-px justify-center items-end">
		        ${each(pages, (page) => `<a class="${[`pb-2 -mb-2 ml-4 no-underline border-b-2 text-xs border-transparent ${escape(segment === page.segment? 'border-purple-500 text-purple-500' : '')} svelte-1xzizd9`, segment === page.segment ? "current-link" : ""].join(' ').trim() }" href="/${escape(page.segment)}">
		            ${escape(page.name)}</a>`)}
		      </div>
		      <div class="flex -mb-px justify-center items-end w-full md:w-auto">
		        <label class="pb-2 -mb-2 ml-4 no-underline border-b-2 text-xs border-transparent ${escape("streamer" === segment? 'border-purple-500 text-purple-500' : '')} svelte-1xzizd9" for="streamer-search-input"> 
		          스트리머 
		        </label>
		        ${validate_component(StreamerAutoComplete, 'StreamerAutoComplete').$$render($$result, {
			placeholder: "검색",
			inputid: "streamer-search-input",
			classes: "pb-2 -mb-2 ml-2",
			onselect: on_streamer_search
		}, {
			onselect: $$value => { on_streamer_search = $$value; $$settled = false; }
		}, {})}
		      </div> 
		    </div>
		  </div>
		</nav>`;
	} while (!$$settled);

	return $$rendered;
});

/* src/routes/_layout.svelte generated by Svelte v3.12.1 */

const Layout = create_ssr_component(($$result, $$props, $$bindings, $$slots) => {
	let { segment } = $$props;

	if ($$props.segment === void 0 && $$bindings.segment && segment !== void 0) $$bindings.segment(segment);

	return `${validate_component(Navigation, 'Navigation').$$render($$result, { segment: segment }, {}, {})}

	<div class="flex flex-col items-center md:m-auto" style="max-width: 1024px;">
	  ${$$slots.default ? $$slots.default({}) : ``}
	</div>`;
});

/* src/routes/_error.svelte generated by Svelte v3.12.1 */

const css$3 = {
	code: "h1.svelte-8od9u6,p.svelte-8od9u6{margin:0 auto}h1.svelte-8od9u6{font-size:2.8em;font-weight:700;margin:0 0 0.5em 0}p.svelte-8od9u6{margin:1em auto}@media(min-width: 480px){h1.svelte-8od9u6{font-size:4em}}",
	map: "{\"version\":3,\"file\":\"_error.svelte\",\"sources\":[\"_error.svelte\"],\"sourcesContent\":[\"<script>\\n\\texport let status;\\n\\texport let error;\\n\\n\\tconst dev = undefined === 'development';\\n</script>\\n\\n<style>\\n\\th1, p {\\n\\t\\tmargin: 0 auto;\\n\\t}\\n\\n\\th1 {\\n\\t\\tfont-size: 2.8em;\\n\\t\\tfont-weight: 700;\\n\\t\\tmargin: 0 0 0.5em 0;\\n\\t}\\n\\n\\tp {\\n\\t\\tmargin: 1em auto;\\n\\t}\\n\\n\\t@media (min-width: 480px) {\\n\\t\\th1 {\\n\\t\\t\\tfont-size: 4em;\\n\\t\\t}\\n\\t}\\n</style>\\n\\n<svelte:head>\\n\\t<title>{status}</title>\\n</svelte:head>\\n\\n<h1>{status}</h1>\\n\\n<p>{error.message}</p>\\n\\n{#if dev && error.stack}\\n\\t<pre>{error.stack}</pre>\\n{/if}\\n\"],\"names\":[],\"mappings\":\"AAQC,gBAAE,CAAE,CAAC,cAAC,CAAC,AACN,MAAM,CAAE,CAAC,CAAC,IAAI,AACf,CAAC,AAED,EAAE,cAAC,CAAC,AACH,SAAS,CAAE,KAAK,CAChB,WAAW,CAAE,GAAG,CAChB,MAAM,CAAE,CAAC,CAAC,CAAC,CAAC,KAAK,CAAC,CAAC,AACpB,CAAC,AAED,CAAC,cAAC,CAAC,AACF,MAAM,CAAE,GAAG,CAAC,IAAI,AACjB,CAAC,AAED,MAAM,AAAC,YAAY,KAAK,CAAC,AAAC,CAAC,AAC1B,EAAE,cAAC,CAAC,AACH,SAAS,CAAE,GAAG,AACf,CAAC,AACF,CAAC\"}"
};

const Error$1 = create_ssr_component(($$result, $$props, $$bindings, $$slots) => {
	let { status, error } = $$props;

	if ($$props.status === void 0 && $$bindings.status && status !== void 0) $$bindings.status(status);
	if ($$props.error === void 0 && $$bindings.error && error !== void 0) $$bindings.error(error);

	$$result.css.add(css$3);

	return `${($$result.head += `<title>${escape(status)}</title>`, "")}

	<h1 class="svelte-8od9u6">${escape(status)}</h1>

	<p class="svelte-8od9u6">${escape(error.message)}</p>

	${  `` }`;
});

// This file is generated by Sapper — do not edit it!

const d = decodeURIComponent;

const manifest = {
	server_routes: [
		
	],

	pages: [
		{
			// index.svelte
			pattern: /^\/$/,
			parts: [
				{ name: "index", file: "index.svelte", component: Index }
			]
		},

		{
			// hidden-links.svelte
			pattern: /^\/hidden-links\/?$/,
			parts: [
				{ name: "hidden$45links", file: "hidden-links.svelte", component: Hidden_links }
			]
		},

		{
			// streamer/[id].svelte
			pattern: /^\/streamer\/([^\/]+?)\/?$/,
			parts: [
				null,
				{ name: "streamer_$id", file: "streamer/[id].svelte", component: Id, preload: preload, params: match => ({ id: d(match[1]) }) }
			]
		},

		{
			// map.svelte
			pattern: /^\/map\/?$/,
			parts: [
				{ name: "map", file: "map.svelte", component: Map$1, preload: preload$1 }
			]
		}
	],

	root: Layout,
	root_preload: () => {},
	error: Error$1
};

const build_dir = "80";

const subscriber_queue = [];
/**
 * Create a `Writable` store that allows both updating and reading by subscription.
 * @param {*=}value initial value
 * @param {StartStopNotifier=}start start and stop notifications for subscriptions
 */
function writable(value, start = noop) {
    let stop;
    const subscribers = [];
    function set(new_value) {
        if (safe_not_equal(value, new_value)) {
            value = new_value;
            if (stop) { // store is ready
                const run_queue = !subscriber_queue.length;
                for (let i = 0; i < subscribers.length; i += 1) {
                    const s = subscribers[i];
                    s[1]();
                    subscriber_queue.push(s, value);
                }
                if (run_queue) {
                    for (let i = 0; i < subscriber_queue.length; i += 2) {
                        subscriber_queue[i][0](subscriber_queue[i + 1]);
                    }
                    subscriber_queue.length = 0;
                }
            }
        }
    }
    function update(fn) {
        set(fn(value));
    }
    function subscribe(run, invalidate = noop) {
        const subscriber = [run, invalidate];
        subscribers.push(subscriber);
        if (subscribers.length === 1) {
            stop = start(set) || noop;
        }
        run(value);
        return () => {
            const index = subscribers.indexOf(subscriber);
            if (index !== -1) {
                subscribers.splice(index, 1);
            }
            if (subscribers.length === 0) {
                stop();
                stop = null;
            }
        };
    }
    return { set, update, subscribe };
}

const CONTEXT_KEY = {};

/* src/node_modules/@sapper/internal/App.svelte generated by Svelte v3.12.1 */

const App = create_ssr_component(($$result, $$props, $$bindings, $$slots) => {
	

	let { stores, error, status, segments, level0, level1 = null } = $$props;

	setContext(CONTEXT_KEY, stores);

	if ($$props.stores === void 0 && $$bindings.stores && stores !== void 0) $$bindings.stores(stores);
	if ($$props.error === void 0 && $$bindings.error && error !== void 0) $$bindings.error(error);
	if ($$props.status === void 0 && $$bindings.status && status !== void 0) $$bindings.status(status);
	if ($$props.segments === void 0 && $$bindings.segments && segments !== void 0) $$bindings.segments(segments);
	if ($$props.level0 === void 0 && $$bindings.level0 && level0 !== void 0) $$bindings.level0(level0);
	if ($$props.level1 === void 0 && $$bindings.level1 && level1 !== void 0) $$bindings.level1(level1);

	return `


	${validate_component(Layout, 'Layout').$$render($$result, Object.assign({ segment: segments[0] }, level0.props), {}, {
		default: () => `
		${ error ? `${validate_component(Error$1, 'Error').$$render($$result, { error: error, status: status }, {}, {})}` : `${validate_component(((level1.component) || missing_component), 'svelte:component').$$render($$result, Object.assign(level1.props), {}, {})}` }
	`
	})}`;
});

function get_server_route_handler(routes) {
	async function handle_route(route, req, res, next) {
		req.params = route.params(route.pattern.exec(req.path));

		const method = req.method.toLowerCase();
		// 'delete' cannot be exported from a module because it is a keyword,
		// so check for 'del' instead
		const method_export = method === 'delete' ? 'del' : method;
		const handle_method = route.handlers[method_export];
		if (handle_method) {
			if (process.env.SAPPER_EXPORT) {
				const { write, end, setHeader } = res;
				const chunks = [];
				const headers = {};

				// intercept data so that it can be exported
				res.write = function(chunk) {
					chunks.push(Buffer.from(chunk));
					write.apply(res, arguments);
				};

				res.setHeader = function(name, value) {
					headers[name.toLowerCase()] = value;
					setHeader.apply(res, arguments);
				};

				res.end = function(chunk) {
					if (chunk) chunks.push(Buffer.from(chunk));
					end.apply(res, arguments);

					process.send({
						__sapper__: true,
						event: 'file',
						url: req.url,
						method: req.method,
						status: res.statusCode,
						type: headers['content-type'],
						body: Buffer.concat(chunks).toString()
					});
				};
			}

			const handle_next = (err) => {
				if (err) {
					res.statusCode = 500;
					res.end(err.message);
				} else {
					process.nextTick(next);
				}
			};

			try {
				await handle_method(req, res, handle_next);
			} catch (err) {
				console.error(err);
				handle_next(err);
			}
		} else {
			// no matching handler for method
			process.nextTick(next);
		}
	}

	return function find_route(req, res, next) {
		for (const route of routes) {
			if (route.pattern.test(req.path)) {
				handle_route(route, req, res, next);
				return;
			}
		}

		next();
	};
}

/*!
 * cookie
 * Copyright(c) 2012-2014 Roman Shtylman
 * Copyright(c) 2015 Douglas Christopher Wilson
 * MIT Licensed
 */

/**
 * Module exports.
 * @public
 */

var parse_1 = parse;
var serialize_1 = serialize;

/**
 * Module variables.
 * @private
 */

var decode$1 = decodeURIComponent;
var encode$1 = encodeURIComponent;
var pairSplitRegExp = /; */;

/**
 * RegExp to match field-content in RFC 7230 sec 3.2
 *
 * field-content = field-vchar [ 1*( SP / HTAB ) field-vchar ]
 * field-vchar   = VCHAR / obs-text
 * obs-text      = %x80-FF
 */

var fieldContentRegExp = /^[\u0009\u0020-\u007e\u0080-\u00ff]+$/;

/**
 * Parse a cookie header.
 *
 * Parse the given cookie header string into an object
 * The object has the various cookies as keys(names) => values
 *
 * @param {string} str
 * @param {object} [options]
 * @return {object}
 * @public
 */

function parse(str, options) {
  if (typeof str !== 'string') {
    throw new TypeError('argument str must be a string');
  }

  var obj = {};
  var opt = options || {};
  var pairs = str.split(pairSplitRegExp);
  var dec = opt.decode || decode$1;

  for (var i = 0; i < pairs.length; i++) {
    var pair = pairs[i];
    var eq_idx = pair.indexOf('=');

    // skip things that don't look like key=value
    if (eq_idx < 0) {
      continue;
    }

    var key = pair.substr(0, eq_idx).trim();
    var val = pair.substr(++eq_idx, pair.length).trim();

    // quoted values
    if ('"' == val[0]) {
      val = val.slice(1, -1);
    }

    // only assign once
    if (undefined == obj[key]) {
      obj[key] = tryDecode(val, dec);
    }
  }

  return obj;
}

/**
 * Serialize data into a cookie header.
 *
 * Serialize the a name value pair into a cookie string suitable for
 * http headers. An optional options object specified cookie parameters.
 *
 * serialize('foo', 'bar', { httpOnly: true })
 *   => "foo=bar; httpOnly"
 *
 * @param {string} name
 * @param {string} val
 * @param {object} [options]
 * @return {string}
 * @public
 */

function serialize(name, val, options) {
  var opt = options || {};
  var enc = opt.encode || encode$1;

  if (typeof enc !== 'function') {
    throw new TypeError('option encode is invalid');
  }

  if (!fieldContentRegExp.test(name)) {
    throw new TypeError('argument name is invalid');
  }

  var value = enc(val);

  if (value && !fieldContentRegExp.test(value)) {
    throw new TypeError('argument val is invalid');
  }

  var str = name + '=' + value;

  if (null != opt.maxAge) {
    var maxAge = opt.maxAge - 0;
    if (isNaN(maxAge)) throw new Error('maxAge should be a Number');
    str += '; Max-Age=' + Math.floor(maxAge);
  }

  if (opt.domain) {
    if (!fieldContentRegExp.test(opt.domain)) {
      throw new TypeError('option domain is invalid');
    }

    str += '; Domain=' + opt.domain;
  }

  if (opt.path) {
    if (!fieldContentRegExp.test(opt.path)) {
      throw new TypeError('option path is invalid');
    }

    str += '; Path=' + opt.path;
  }

  if (opt.expires) {
    if (typeof opt.expires.toUTCString !== 'function') {
      throw new TypeError('option expires is invalid');
    }

    str += '; Expires=' + opt.expires.toUTCString();
  }

  if (opt.httpOnly) {
    str += '; HttpOnly';
  }

  if (opt.secure) {
    str += '; Secure';
  }

  if (opt.sameSite) {
    var sameSite = typeof opt.sameSite === 'string'
      ? opt.sameSite.toLowerCase() : opt.sameSite;

    switch (sameSite) {
      case true:
        str += '; SameSite=Strict';
        break;
      case 'lax':
        str += '; SameSite=Lax';
        break;
      case 'strict':
        str += '; SameSite=Strict';
        break;
      case 'none':
        str += '; SameSite=None';
        break;
      default:
        throw new TypeError('option sameSite is invalid');
    }
  }

  return str;
}

/**
 * Try decoding a string using a decoding function.
 *
 * @param {string} str
 * @param {function} decode
 * @private
 */

function tryDecode(str, decode) {
  try {
    return decode(str);
  } catch (e) {
    return str;
  }
}

var cookie = {
	parse: parse_1,
	serialize: serialize_1
};

var chars = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ_$';
var unsafeChars = /[<>\b\f\n\r\t\0\u2028\u2029]/g;
var reserved = /^(?:do|if|in|for|int|let|new|try|var|byte|case|char|else|enum|goto|long|this|void|with|await|break|catch|class|const|final|float|short|super|throw|while|yield|delete|double|export|import|native|return|switch|throws|typeof|boolean|default|extends|finally|package|private|abstract|continue|debugger|function|volatile|interface|protected|transient|implements|instanceof|synchronized)$/;
var escaped$1 = {
    '<': '\\u003C',
    '>': '\\u003E',
    '/': '\\u002F',
    '\\': '\\\\',
    '\b': '\\b',
    '\f': '\\f',
    '\n': '\\n',
    '\r': '\\r',
    '\t': '\\t',
    '\0': '\\0',
    '\u2028': '\\u2028',
    '\u2029': '\\u2029'
};
var objectProtoOwnPropertyNames = Object.getOwnPropertyNames(Object.prototype).sort().join('\0');
function devalue(value) {
    var counts = new Map();
    function walk(thing) {
        if (typeof thing === 'function') {
            throw new Error("Cannot stringify a function");
        }
        if (counts.has(thing)) {
            counts.set(thing, counts.get(thing) + 1);
            return;
        }
        counts.set(thing, 1);
        if (!isPrimitive(thing)) {
            var type = getType(thing);
            switch (type) {
                case 'Number':
                case 'String':
                case 'Boolean':
                case 'Date':
                case 'RegExp':
                    return;
                case 'Array':
                    thing.forEach(walk);
                    break;
                case 'Set':
                case 'Map':
                    Array.from(thing).forEach(walk);
                    break;
                default:
                    var proto = Object.getPrototypeOf(thing);
                    if (proto !== Object.prototype &&
                        proto !== null &&
                        Object.getOwnPropertyNames(proto).sort().join('\0') !== objectProtoOwnPropertyNames) {
                        throw new Error("Cannot stringify arbitrary non-POJOs");
                    }
                    if (Object.getOwnPropertySymbols(thing).length > 0) {
                        throw new Error("Cannot stringify POJOs with symbolic keys");
                    }
                    Object.keys(thing).forEach(function (key) { return walk(thing[key]); });
            }
        }
    }
    walk(value);
    var names = new Map();
    Array.from(counts)
        .filter(function (entry) { return entry[1] > 1; })
        .sort(function (a, b) { return b[1] - a[1]; })
        .forEach(function (entry, i) {
        names.set(entry[0], getName(i));
    });
    function stringify(thing) {
        if (names.has(thing)) {
            return names.get(thing);
        }
        if (isPrimitive(thing)) {
            return stringifyPrimitive(thing);
        }
        var type = getType(thing);
        switch (type) {
            case 'Number':
            case 'String':
            case 'Boolean':
                return "Object(" + stringify(thing.valueOf()) + ")";
            case 'RegExp':
                return thing.toString();
            case 'Date':
                return "new Date(" + thing.getTime() + ")";
            case 'Array':
                var members = thing.map(function (v, i) { return i in thing ? stringify(v) : ''; });
                var tail = thing.length === 0 || (thing.length - 1 in thing) ? '' : ',';
                return "[" + members.join(',') + tail + "]";
            case 'Set':
            case 'Map':
                return "new " + type + "([" + Array.from(thing).map(stringify).join(',') + "])";
            default:
                var obj = "{" + Object.keys(thing).map(function (key) { return safeKey(key) + ":" + stringify(thing[key]); }).join(',') + "}";
                var proto = Object.getPrototypeOf(thing);
                if (proto === null) {
                    return Object.keys(thing).length > 0
                        ? "Object.assign(Object.create(null)," + obj + ")"
                        : "Object.create(null)";
                }
                return obj;
        }
    }
    var str = stringify(value);
    if (names.size) {
        var params_1 = [];
        var statements_1 = [];
        var values_1 = [];
        names.forEach(function (name, thing) {
            params_1.push(name);
            if (isPrimitive(thing)) {
                values_1.push(stringifyPrimitive(thing));
                return;
            }
            var type = getType(thing);
            switch (type) {
                case 'Number':
                case 'String':
                case 'Boolean':
                    values_1.push("Object(" + stringify(thing.valueOf()) + ")");
                    break;
                case 'RegExp':
                    values_1.push(thing.toString());
                    break;
                case 'Date':
                    values_1.push("new Date(" + thing.getTime() + ")");
                    break;
                case 'Array':
                    values_1.push("Array(" + thing.length + ")");
                    thing.forEach(function (v, i) {
                        statements_1.push(name + "[" + i + "]=" + stringify(v));
                    });
                    break;
                case 'Set':
                    values_1.push("new Set");
                    statements_1.push(name + "." + Array.from(thing).map(function (v) { return "add(" + stringify(v) + ")"; }).join('.'));
                    break;
                case 'Map':
                    values_1.push("new Map");
                    statements_1.push(name + "." + Array.from(thing).map(function (_a) {
                        var k = _a[0], v = _a[1];
                        return "set(" + stringify(k) + ", " + stringify(v) + ")";
                    }).join('.'));
                    break;
                default:
                    values_1.push(Object.getPrototypeOf(thing) === null ? 'Object.create(null)' : '{}');
                    Object.keys(thing).forEach(function (key) {
                        statements_1.push("" + name + safeProp(key) + "=" + stringify(thing[key]));
                    });
            }
        });
        statements_1.push("return " + str);
        return "(function(" + params_1.join(',') + "){" + statements_1.join(';') + "}(" + values_1.join(',') + "))";
    }
    else {
        return str;
    }
}
function getName(num) {
    var name = '';
    do {
        name = chars[num % chars.length] + name;
        num = ~~(num / chars.length) - 1;
    } while (num >= 0);
    return reserved.test(name) ? name + "_" : name;
}
function isPrimitive(thing) {
    return Object(thing) !== thing;
}
function stringifyPrimitive(thing) {
    if (typeof thing === 'string')
        return stringifyString(thing);
    if (thing === void 0)
        return 'void 0';
    if (thing === 0 && 1 / thing < 0)
        return '-0';
    var str = String(thing);
    if (typeof thing === 'number')
        return str.replace(/^(-)?0\./, '$1.');
    return str;
}
function getType(thing) {
    return Object.prototype.toString.call(thing).slice(8, -1);
}
function escapeUnsafeChar(c) {
    return escaped$1[c] || c;
}
function escapeUnsafeChars(str) {
    return str.replace(unsafeChars, escapeUnsafeChar);
}
function safeKey(key) {
    return /^[_$a-zA-Z][_$a-zA-Z0-9]*$/.test(key) ? key : escapeUnsafeChars(JSON.stringify(key));
}
function safeProp(key) {
    return /^[_$a-zA-Z][_$a-zA-Z0-9]*$/.test(key) ? "." + key : "[" + escapeUnsafeChars(JSON.stringify(key)) + "]";
}
function stringifyString(str) {
    var result = '"';
    for (var i = 0; i < str.length; i += 1) {
        var char = str.charAt(i);
        var code = char.charCodeAt(0);
        if (char === '"') {
            result += '\\"';
        }
        else if (char in escaped$1) {
            result += escaped$1[char];
        }
        else if (code >= 0xd800 && code <= 0xdfff) {
            var next = str.charCodeAt(i + 1);
            // If this is the beginning of a [high, low] surrogate pair,
            // add the next two characters, otherwise escape
            if (code <= 0xdbff && (next >= 0xdc00 && next <= 0xdfff)) {
                result += char + str[++i];
            }
            else {
                result += "\\u" + code.toString(16).toUpperCase();
            }
        }
        else {
            result += char;
        }
    }
    result += '"';
    return result;
}

// Based on https://github.com/tmpvar/jsdom/blob/aa85b2abf07766ff7bf5c1f6daafb3726f2f2db5/lib/jsdom/living/blob.js

// fix for "Readable" isn't a named export issue
const Readable = Stream.Readable;

const BUFFER = Symbol('buffer');
const TYPE = Symbol('type');

class Blob {
	constructor() {
		this[TYPE] = '';

		const blobParts = arguments[0];
		const options = arguments[1];

		const buffers = [];
		let size = 0;

		if (blobParts) {
			const a = blobParts;
			const length = Number(a.length);
			for (let i = 0; i < length; i++) {
				const element = a[i];
				let buffer;
				if (element instanceof Buffer) {
					buffer = element;
				} else if (ArrayBuffer.isView(element)) {
					buffer = Buffer.from(element.buffer, element.byteOffset, element.byteLength);
				} else if (element instanceof ArrayBuffer) {
					buffer = Buffer.from(element);
				} else if (element instanceof Blob) {
					buffer = element[BUFFER];
				} else {
					buffer = Buffer.from(typeof element === 'string' ? element : String(element));
				}
				size += buffer.length;
				buffers.push(buffer);
			}
		}

		this[BUFFER] = Buffer.concat(buffers);

		let type = options && options.type !== undefined && String(options.type).toLowerCase();
		if (type && !/[^\u0020-\u007E]/.test(type)) {
			this[TYPE] = type;
		}
	}
	get size() {
		return this[BUFFER].length;
	}
	get type() {
		return this[TYPE];
	}
	text() {
		return Promise.resolve(this[BUFFER].toString());
	}
	arrayBuffer() {
		const buf = this[BUFFER];
		const ab = buf.buffer.slice(buf.byteOffset, buf.byteOffset + buf.byteLength);
		return Promise.resolve(ab);
	}
	stream() {
		const readable = new Readable();
		readable._read = function () {};
		readable.push(this[BUFFER]);
		readable.push(null);
		return readable;
	}
	toString() {
		return '[object Blob]';
	}
	slice() {
		const size = this.size;

		const start = arguments[0];
		const end = arguments[1];
		let relativeStart, relativeEnd;
		if (start === undefined) {
			relativeStart = 0;
		} else if (start < 0) {
			relativeStart = Math.max(size + start, 0);
		} else {
			relativeStart = Math.min(start, size);
		}
		if (end === undefined) {
			relativeEnd = size;
		} else if (end < 0) {
			relativeEnd = Math.max(size + end, 0);
		} else {
			relativeEnd = Math.min(end, size);
		}
		const span = Math.max(relativeEnd - relativeStart, 0);

		const buffer = this[BUFFER];
		const slicedBuffer = buffer.slice(relativeStart, relativeStart + span);
		const blob = new Blob([], { type: arguments[2] });
		blob[BUFFER] = slicedBuffer;
		return blob;
	}
}

Object.defineProperties(Blob.prototype, {
	size: { enumerable: true },
	type: { enumerable: true },
	slice: { enumerable: true }
});

Object.defineProperty(Blob.prototype, Symbol.toStringTag, {
	value: 'Blob',
	writable: false,
	enumerable: false,
	configurable: true
});

/**
 * fetch-error.js
 *
 * FetchError interface for operational errors
 */

/**
 * Create FetchError instance
 *
 * @param   String      message      Error message for human
 * @param   String      type         Error type for machine
 * @param   String      systemError  For Node.js system error
 * @return  FetchError
 */
function FetchError(message, type, systemError) {
  Error.call(this, message);

  this.message = message;
  this.type = type;

  // when err.type is `system`, err.code contains system error code
  if (systemError) {
    this.code = this.errno = systemError.code;
  }

  // hide custom error implementation details from end-users
  Error.captureStackTrace(this, this.constructor);
}

FetchError.prototype = Object.create(Error.prototype);
FetchError.prototype.constructor = FetchError;
FetchError.prototype.name = 'FetchError';

let convert;
try {
	convert = require('encoding').convert;
} catch (e) {}

const INTERNALS = Symbol('Body internals');

// fix an issue where "PassThrough" isn't a named export for node <10
const PassThrough = Stream.PassThrough;

/**
 * Body mixin
 *
 * Ref: https://fetch.spec.whatwg.org/#body
 *
 * @param   Stream  body  Readable stream
 * @param   Object  opts  Response options
 * @return  Void
 */
function Body(body) {
	var _this = this;

	var _ref = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {},
	    _ref$size = _ref.size;

	let size = _ref$size === undefined ? 0 : _ref$size;
	var _ref$timeout = _ref.timeout;
	let timeout = _ref$timeout === undefined ? 0 : _ref$timeout;

	if (body == null) {
		// body is undefined or null
		body = null;
	} else if (isURLSearchParams(body)) {
		// body is a URLSearchParams
		body = Buffer.from(body.toString());
	} else if (isBlob(body)) ; else if (Buffer.isBuffer(body)) ; else if (Object.prototype.toString.call(body) === '[object ArrayBuffer]') {
		// body is ArrayBuffer
		body = Buffer.from(body);
	} else if (ArrayBuffer.isView(body)) {
		// body is ArrayBufferView
		body = Buffer.from(body.buffer, body.byteOffset, body.byteLength);
	} else if (body instanceof Stream) ; else {
		// none of the above
		// coerce to string then buffer
		body = Buffer.from(String(body));
	}
	this[INTERNALS] = {
		body,
		disturbed: false,
		error: null
	};
	this.size = size;
	this.timeout = timeout;

	if (body instanceof Stream) {
		body.on('error', function (err) {
			const error = err.name === 'AbortError' ? err : new FetchError(`Invalid response body while trying to fetch ${_this.url}: ${err.message}`, 'system', err);
			_this[INTERNALS].error = error;
		});
	}
}

Body.prototype = {
	get body() {
		return this[INTERNALS].body;
	},

	get bodyUsed() {
		return this[INTERNALS].disturbed;
	},

	/**
  * Decode response as ArrayBuffer
  *
  * @return  Promise
  */
	arrayBuffer() {
		return consumeBody.call(this).then(function (buf) {
			return buf.buffer.slice(buf.byteOffset, buf.byteOffset + buf.byteLength);
		});
	},

	/**
  * Return raw response as Blob
  *
  * @return Promise
  */
	blob() {
		let ct = this.headers && this.headers.get('content-type') || '';
		return consumeBody.call(this).then(function (buf) {
			return Object.assign(
			// Prevent copying
			new Blob([], {
				type: ct.toLowerCase()
			}), {
				[BUFFER]: buf
			});
		});
	},

	/**
  * Decode response as json
  *
  * @return  Promise
  */
	json() {
		var _this2 = this;

		return consumeBody.call(this).then(function (buffer) {
			try {
				return JSON.parse(buffer.toString());
			} catch (err) {
				return Body.Promise.reject(new FetchError(`invalid json response body at ${_this2.url} reason: ${err.message}`, 'invalid-json'));
			}
		});
	},

	/**
  * Decode response as text
  *
  * @return  Promise
  */
	text() {
		return consumeBody.call(this).then(function (buffer) {
			return buffer.toString();
		});
	},

	/**
  * Decode response as buffer (non-spec api)
  *
  * @return  Promise
  */
	buffer() {
		return consumeBody.call(this);
	},

	/**
  * Decode response as text, while automatically detecting the encoding and
  * trying to decode to UTF-8 (non-spec api)
  *
  * @return  Promise
  */
	textConverted() {
		var _this3 = this;

		return consumeBody.call(this).then(function (buffer) {
			return convertBody(buffer, _this3.headers);
		});
	}
};

// In browsers, all properties are enumerable.
Object.defineProperties(Body.prototype, {
	body: { enumerable: true },
	bodyUsed: { enumerable: true },
	arrayBuffer: { enumerable: true },
	blob: { enumerable: true },
	json: { enumerable: true },
	text: { enumerable: true }
});

Body.mixIn = function (proto) {
	for (const name of Object.getOwnPropertyNames(Body.prototype)) {
		// istanbul ignore else: future proof
		if (!(name in proto)) {
			const desc = Object.getOwnPropertyDescriptor(Body.prototype, name);
			Object.defineProperty(proto, name, desc);
		}
	}
};

/**
 * Consume and convert an entire Body to a Buffer.
 *
 * Ref: https://fetch.spec.whatwg.org/#concept-body-consume-body
 *
 * @return  Promise
 */
function consumeBody() {
	var _this4 = this;

	if (this[INTERNALS].disturbed) {
		return Body.Promise.reject(new TypeError(`body used already for: ${this.url}`));
	}

	this[INTERNALS].disturbed = true;

	if (this[INTERNALS].error) {
		return Body.Promise.reject(this[INTERNALS].error);
	}

	let body = this.body;

	// body is null
	if (body === null) {
		return Body.Promise.resolve(Buffer.alloc(0));
	}

	// body is blob
	if (isBlob(body)) {
		body = body.stream();
	}

	// body is buffer
	if (Buffer.isBuffer(body)) {
		return Body.Promise.resolve(body);
	}

	// istanbul ignore if: should never happen
	if (!(body instanceof Stream)) {
		return Body.Promise.resolve(Buffer.alloc(0));
	}

	// body is stream
	// get ready to actually consume the body
	let accum = [];
	let accumBytes = 0;
	let abort = false;

	return new Body.Promise(function (resolve, reject) {
		let resTimeout;

		// allow timeout on slow response body
		if (_this4.timeout) {
			resTimeout = setTimeout(function () {
				abort = true;
				reject(new FetchError(`Response timeout while trying to fetch ${_this4.url} (over ${_this4.timeout}ms)`, 'body-timeout'));
			}, _this4.timeout);
		}

		// handle stream errors
		body.on('error', function (err) {
			if (err.name === 'AbortError') {
				// if the request was aborted, reject with this Error
				abort = true;
				reject(err);
			} else {
				// other errors, such as incorrect content-encoding
				reject(new FetchError(`Invalid response body while trying to fetch ${_this4.url}: ${err.message}`, 'system', err));
			}
		});

		body.on('data', function (chunk) {
			if (abort || chunk === null) {
				return;
			}

			if (_this4.size && accumBytes + chunk.length > _this4.size) {
				abort = true;
				reject(new FetchError(`content size at ${_this4.url} over limit: ${_this4.size}`, 'max-size'));
				return;
			}

			accumBytes += chunk.length;
			accum.push(chunk);
		});

		body.on('end', function () {
			if (abort) {
				return;
			}

			clearTimeout(resTimeout);

			try {
				resolve(Buffer.concat(accum, accumBytes));
			} catch (err) {
				// handle streams that have accumulated too much data (issue #414)
				reject(new FetchError(`Could not create Buffer from response body for ${_this4.url}: ${err.message}`, 'system', err));
			}
		});
	});
}

/**
 * Detect buffer encoding and convert to target encoding
 * ref: http://www.w3.org/TR/2011/WD-html5-20110113/parsing.html#determining-the-character-encoding
 *
 * @param   Buffer  buffer    Incoming buffer
 * @param   String  encoding  Target encoding
 * @return  String
 */
function convertBody(buffer, headers) {
	if (typeof convert !== 'function') {
		throw new Error('The package `encoding` must be installed to use the textConverted() function');
	}

	const ct = headers.get('content-type');
	let charset = 'utf-8';
	let res, str;

	// header
	if (ct) {
		res = /charset=([^;]*)/i.exec(ct);
	}

	// no charset in content type, peek at response body for at most 1024 bytes
	str = buffer.slice(0, 1024).toString();

	// html5
	if (!res && str) {
		res = /<meta.+?charset=(['"])(.+?)\1/i.exec(str);
	}

	// html4
	if (!res && str) {
		res = /<meta[\s]+?http-equiv=(['"])content-type\1[\s]+?content=(['"])(.+?)\2/i.exec(str);

		if (res) {
			res = /charset=(.*)/i.exec(res.pop());
		}
	}

	// xml
	if (!res && str) {
		res = /<\?xml.+?encoding=(['"])(.+?)\1/i.exec(str);
	}

	// found charset
	if (res) {
		charset = res.pop();

		// prevent decode issues when sites use incorrect encoding
		// ref: https://hsivonen.fi/encoding-menu/
		if (charset === 'gb2312' || charset === 'gbk') {
			charset = 'gb18030';
		}
	}

	// turn raw buffers into a single utf-8 buffer
	return convert(buffer, 'UTF-8', charset).toString();
}

/**
 * Detect a URLSearchParams object
 * ref: https://github.com/bitinn/node-fetch/issues/296#issuecomment-307598143
 *
 * @param   Object  obj     Object to detect by type or brand
 * @return  String
 */
function isURLSearchParams(obj) {
	// Duck-typing as a necessary condition.
	if (typeof obj !== 'object' || typeof obj.append !== 'function' || typeof obj.delete !== 'function' || typeof obj.get !== 'function' || typeof obj.getAll !== 'function' || typeof obj.has !== 'function' || typeof obj.set !== 'function') {
		return false;
	}

	// Brand-checking and more duck-typing as optional condition.
	return obj.constructor.name === 'URLSearchParams' || Object.prototype.toString.call(obj) === '[object URLSearchParams]' || typeof obj.sort === 'function';
}

/**
 * Check if `obj` is a W3C `Blob` object (which `File` inherits from)
 * @param  {*} obj
 * @return {boolean}
 */
function isBlob(obj) {
	return typeof obj === 'object' && typeof obj.arrayBuffer === 'function' && typeof obj.type === 'string' && typeof obj.stream === 'function' && typeof obj.constructor === 'function' && typeof obj.constructor.name === 'string' && /^(Blob|File)$/.test(obj.constructor.name) && /^(Blob|File)$/.test(obj[Symbol.toStringTag]);
}

/**
 * Clone body given Res/Req instance
 *
 * @param   Mixed  instance  Response or Request instance
 * @return  Mixed
 */
function clone(instance) {
	let p1, p2;
	let body = instance.body;

	// don't allow cloning a used body
	if (instance.bodyUsed) {
		throw new Error('cannot clone body after it is used');
	}

	// check that body is a stream and not form-data object
	// note: we can't clone the form-data object without having it as a dependency
	if (body instanceof Stream && typeof body.getBoundary !== 'function') {
		// tee instance body
		p1 = new PassThrough();
		p2 = new PassThrough();
		body.pipe(p1);
		body.pipe(p2);
		// set instance body to teed body and return the other teed body
		instance[INTERNALS].body = p1;
		body = p2;
	}

	return body;
}

/**
 * Performs the operation "extract a `Content-Type` value from |object|" as
 * specified in the specification:
 * https://fetch.spec.whatwg.org/#concept-bodyinit-extract
 *
 * This function assumes that instance.body is present.
 *
 * @param   Mixed  instance  Any options.body input
 */
function extractContentType(body) {
	if (body === null) {
		// body is null
		return null;
	} else if (typeof body === 'string') {
		// body is string
		return 'text/plain;charset=UTF-8';
	} else if (isURLSearchParams(body)) {
		// body is a URLSearchParams
		return 'application/x-www-form-urlencoded;charset=UTF-8';
	} else if (isBlob(body)) {
		// body is blob
		return body.type || null;
	} else if (Buffer.isBuffer(body)) {
		// body is buffer
		return null;
	} else if (Object.prototype.toString.call(body) === '[object ArrayBuffer]') {
		// body is ArrayBuffer
		return null;
	} else if (ArrayBuffer.isView(body)) {
		// body is ArrayBufferView
		return null;
	} else if (typeof body.getBoundary === 'function') {
		// detect form data input from form-data module
		return `multipart/form-data;boundary=${body.getBoundary()}`;
	} else if (body instanceof Stream) {
		// body is stream
		// can't really do much about this
		return null;
	} else {
		// Body constructor defaults other things to string
		return 'text/plain;charset=UTF-8';
	}
}

/**
 * The Fetch Standard treats this as if "total bytes" is a property on the body.
 * For us, we have to explicitly get it with a function.
 *
 * ref: https://fetch.spec.whatwg.org/#concept-body-total-bytes
 *
 * @param   Body    instance   Instance of Body
 * @return  Number?            Number of bytes, or null if not possible
 */
function getTotalBytes(instance) {
	const body = instance.body;


	if (body === null) {
		// body is null
		return 0;
	} else if (isBlob(body)) {
		return body.size;
	} else if (Buffer.isBuffer(body)) {
		// body is buffer
		return body.length;
	} else if (body && typeof body.getLengthSync === 'function') {
		// detect form data input from form-data module
		if (body._lengthRetrievers && body._lengthRetrievers.length == 0 || // 1.x
		body.hasKnownLength && body.hasKnownLength()) {
			// 2.x
			return body.getLengthSync();
		}
		return null;
	} else {
		// body is stream
		return null;
	}
}

/**
 * Write a Body to a Node.js WritableStream (e.g. http.Request) object.
 *
 * @param   Body    instance   Instance of Body
 * @return  Void
 */
function writeToStream(dest, instance) {
	const body = instance.body;


	if (body === null) {
		// body is null
		dest.end();
	} else if (isBlob(body)) {
		body.stream().pipe(dest);
	} else if (Buffer.isBuffer(body)) {
		// body is buffer
		dest.write(body);
		dest.end();
	} else {
		// body is stream
		body.pipe(dest);
	}
}

// expose Promise
Body.Promise = global.Promise;

/**
 * headers.js
 *
 * Headers class offers convenient helpers
 */

const invalidTokenRegex = /[^\^_`a-zA-Z\-0-9!#$%&'*+.|~]/;
const invalidHeaderCharRegex = /[^\t\x20-\x7e\x80-\xff]/;

function validateName(name) {
	name = `${name}`;
	if (invalidTokenRegex.test(name) || name === '') {
		throw new TypeError(`${name} is not a legal HTTP header name`);
	}
}

function validateValue(value) {
	value = `${value}`;
	if (invalidHeaderCharRegex.test(value)) {
		throw new TypeError(`${value} is not a legal HTTP header value`);
	}
}

/**
 * Find the key in the map object given a header name.
 *
 * Returns undefined if not found.
 *
 * @param   String  name  Header name
 * @return  String|Undefined
 */
function find(map, name) {
	name = name.toLowerCase();
	for (const key in map) {
		if (key.toLowerCase() === name) {
			return key;
		}
	}
	return undefined;
}

const MAP = Symbol('map');
class Headers {
	/**
  * Headers class
  *
  * @param   Object  headers  Response headers
  * @return  Void
  */
	constructor() {
		let init = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : undefined;

		this[MAP] = Object.create(null);

		if (init instanceof Headers) {
			const rawHeaders = init.raw();
			const headerNames = Object.keys(rawHeaders);

			for (const headerName of headerNames) {
				for (const value of rawHeaders[headerName]) {
					this.append(headerName, value);
				}
			}

			return;
		}

		// We don't worry about converting prop to ByteString here as append()
		// will handle it.
		if (init == null) ; else if (typeof init === 'object') {
			const method = init[Symbol.iterator];
			if (method != null) {
				if (typeof method !== 'function') {
					throw new TypeError('Header pairs must be iterable');
				}

				// sequence<sequence<ByteString>>
				// Note: per spec we have to first exhaust the lists then process them
				const pairs = [];
				for (const pair of init) {
					if (typeof pair !== 'object' || typeof pair[Symbol.iterator] !== 'function') {
						throw new TypeError('Each header pair must be iterable');
					}
					pairs.push(Array.from(pair));
				}

				for (const pair of pairs) {
					if (pair.length !== 2) {
						throw new TypeError('Each header pair must be a name/value tuple');
					}
					this.append(pair[0], pair[1]);
				}
			} else {
				// record<ByteString, ByteString>
				for (const key of Object.keys(init)) {
					const value = init[key];
					this.append(key, value);
				}
			}
		} else {
			throw new TypeError('Provided initializer must be an object');
		}
	}

	/**
  * Return combined header value given name
  *
  * @param   String  name  Header name
  * @return  Mixed
  */
	get(name) {
		name = `${name}`;
		validateName(name);
		const key = find(this[MAP], name);
		if (key === undefined) {
			return null;
		}

		return this[MAP][key].join(', ');
	}

	/**
  * Iterate over all headers
  *
  * @param   Function  callback  Executed for each item with parameters (value, name, thisArg)
  * @param   Boolean   thisArg   `this` context for callback function
  * @return  Void
  */
	forEach(callback) {
		let thisArg = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : undefined;

		let pairs = getHeaders(this);
		let i = 0;
		while (i < pairs.length) {
			var _pairs$i = pairs[i];
			const name = _pairs$i[0],
			      value = _pairs$i[1];

			callback.call(thisArg, value, name, this);
			pairs = getHeaders(this);
			i++;
		}
	}

	/**
  * Overwrite header values given name
  *
  * @param   String  name   Header name
  * @param   String  value  Header value
  * @return  Void
  */
	set(name, value) {
		name = `${name}`;
		value = `${value}`;
		validateName(name);
		validateValue(value);
		const key = find(this[MAP], name);
		this[MAP][key !== undefined ? key : name] = [value];
	}

	/**
  * Append a value onto existing header
  *
  * @param   String  name   Header name
  * @param   String  value  Header value
  * @return  Void
  */
	append(name, value) {
		name = `${name}`;
		value = `${value}`;
		validateName(name);
		validateValue(value);
		const key = find(this[MAP], name);
		if (key !== undefined) {
			this[MAP][key].push(value);
		} else {
			this[MAP][name] = [value];
		}
	}

	/**
  * Check for header name existence
  *
  * @param   String   name  Header name
  * @return  Boolean
  */
	has(name) {
		name = `${name}`;
		validateName(name);
		return find(this[MAP], name) !== undefined;
	}

	/**
  * Delete all header values given name
  *
  * @param   String  name  Header name
  * @return  Void
  */
	delete(name) {
		name = `${name}`;
		validateName(name);
		const key = find(this[MAP], name);
		if (key !== undefined) {
			delete this[MAP][key];
		}
	}

	/**
  * Return raw headers (non-spec api)
  *
  * @return  Object
  */
	raw() {
		return this[MAP];
	}

	/**
  * Get an iterator on keys.
  *
  * @return  Iterator
  */
	keys() {
		return createHeadersIterator(this, 'key');
	}

	/**
  * Get an iterator on values.
  *
  * @return  Iterator
  */
	values() {
		return createHeadersIterator(this, 'value');
	}

	/**
  * Get an iterator on entries.
  *
  * This is the default iterator of the Headers object.
  *
  * @return  Iterator
  */
	[Symbol.iterator]() {
		return createHeadersIterator(this, 'key+value');
	}
}
Headers.prototype.entries = Headers.prototype[Symbol.iterator];

Object.defineProperty(Headers.prototype, Symbol.toStringTag, {
	value: 'Headers',
	writable: false,
	enumerable: false,
	configurable: true
});

Object.defineProperties(Headers.prototype, {
	get: { enumerable: true },
	forEach: { enumerable: true },
	set: { enumerable: true },
	append: { enumerable: true },
	has: { enumerable: true },
	delete: { enumerable: true },
	keys: { enumerable: true },
	values: { enumerable: true },
	entries: { enumerable: true }
});

function getHeaders(headers) {
	let kind = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : 'key+value';

	const keys = Object.keys(headers[MAP]).sort();
	return keys.map(kind === 'key' ? function (k) {
		return k.toLowerCase();
	} : kind === 'value' ? function (k) {
		return headers[MAP][k].join(', ');
	} : function (k) {
		return [k.toLowerCase(), headers[MAP][k].join(', ')];
	});
}

const INTERNAL = Symbol('internal');

function createHeadersIterator(target, kind) {
	const iterator = Object.create(HeadersIteratorPrototype);
	iterator[INTERNAL] = {
		target,
		kind,
		index: 0
	};
	return iterator;
}

const HeadersIteratorPrototype = Object.setPrototypeOf({
	next() {
		// istanbul ignore if
		if (!this || Object.getPrototypeOf(this) !== HeadersIteratorPrototype) {
			throw new TypeError('Value of `this` is not a HeadersIterator');
		}

		var _INTERNAL = this[INTERNAL];
		const target = _INTERNAL.target,
		      kind = _INTERNAL.kind,
		      index = _INTERNAL.index;

		const values = getHeaders(target, kind);
		const len = values.length;
		if (index >= len) {
			return {
				value: undefined,
				done: true
			};
		}

		this[INTERNAL].index = index + 1;

		return {
			value: values[index],
			done: false
		};
	}
}, Object.getPrototypeOf(Object.getPrototypeOf([][Symbol.iterator]())));

Object.defineProperty(HeadersIteratorPrototype, Symbol.toStringTag, {
	value: 'HeadersIterator',
	writable: false,
	enumerable: false,
	configurable: true
});

/**
 * Export the Headers object in a form that Node.js can consume.
 *
 * @param   Headers  headers
 * @return  Object
 */
function exportNodeCompatibleHeaders(headers) {
	const obj = Object.assign({ __proto__: null }, headers[MAP]);

	// http.request() only supports string as Host header. This hack makes
	// specifying custom Host header possible.
	const hostHeaderKey = find(headers[MAP], 'Host');
	if (hostHeaderKey !== undefined) {
		obj[hostHeaderKey] = obj[hostHeaderKey][0];
	}

	return obj;
}

/**
 * Create a Headers object from an object of headers, ignoring those that do
 * not conform to HTTP grammar productions.
 *
 * @param   Object  obj  Object of headers
 * @return  Headers
 */
function createHeadersLenient(obj) {
	const headers = new Headers();
	for (const name of Object.keys(obj)) {
		if (invalidTokenRegex.test(name)) {
			continue;
		}
		if (Array.isArray(obj[name])) {
			for (const val of obj[name]) {
				if (invalidHeaderCharRegex.test(val)) {
					continue;
				}
				if (headers[MAP][name] === undefined) {
					headers[MAP][name] = [val];
				} else {
					headers[MAP][name].push(val);
				}
			}
		} else if (!invalidHeaderCharRegex.test(obj[name])) {
			headers[MAP][name] = [obj[name]];
		}
	}
	return headers;
}

const INTERNALS$1 = Symbol('Response internals');

// fix an issue where "STATUS_CODES" aren't a named export for node <10
const STATUS_CODES = http.STATUS_CODES;

/**
 * Response class
 *
 * @param   Stream  body  Readable stream
 * @param   Object  opts  Response options
 * @return  Void
 */
class Response {
	constructor() {
		let body = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : null;
		let opts = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {};

		Body.call(this, body, opts);

		const status = opts.status || 200;
		const headers = new Headers(opts.headers);

		if (body != null && !headers.has('Content-Type')) {
			const contentType = extractContentType(body);
			if (contentType) {
				headers.append('Content-Type', contentType);
			}
		}

		this[INTERNALS$1] = {
			url: opts.url,
			status,
			statusText: opts.statusText || STATUS_CODES[status],
			headers,
			counter: opts.counter
		};
	}

	get url() {
		return this[INTERNALS$1].url || '';
	}

	get status() {
		return this[INTERNALS$1].status;
	}

	/**
  * Convenience property representing if the request ended normally
  */
	get ok() {
		return this[INTERNALS$1].status >= 200 && this[INTERNALS$1].status < 300;
	}

	get redirected() {
		return this[INTERNALS$1].counter > 0;
	}

	get statusText() {
		return this[INTERNALS$1].statusText;
	}

	get headers() {
		return this[INTERNALS$1].headers;
	}

	/**
  * Clone this response
  *
  * @return  Response
  */
	clone() {
		return new Response(clone(this), {
			url: this.url,
			status: this.status,
			statusText: this.statusText,
			headers: this.headers,
			ok: this.ok,
			redirected: this.redirected
		});
	}
}

Body.mixIn(Response.prototype);

Object.defineProperties(Response.prototype, {
	url: { enumerable: true },
	status: { enumerable: true },
	ok: { enumerable: true },
	redirected: { enumerable: true },
	statusText: { enumerable: true },
	headers: { enumerable: true },
	clone: { enumerable: true }
});

Object.defineProperty(Response.prototype, Symbol.toStringTag, {
	value: 'Response',
	writable: false,
	enumerable: false,
	configurable: true
});

const INTERNALS$2 = Symbol('Request internals');

// fix an issue where "format", "parse" aren't a named export for node <10
const parse_url = Url.parse;
const format_url = Url.format;

const streamDestructionSupported = 'destroy' in Stream.Readable.prototype;

/**
 * Check if a value is an instance of Request.
 *
 * @param   Mixed   input
 * @return  Boolean
 */
function isRequest(input) {
	return typeof input === 'object' && typeof input[INTERNALS$2] === 'object';
}

function isAbortSignal(signal) {
	const proto = signal && typeof signal === 'object' && Object.getPrototypeOf(signal);
	return !!(proto && proto.constructor.name === 'AbortSignal');
}

/**
 * Request class
 *
 * @param   Mixed   input  Url or Request instance
 * @param   Object  init   Custom options
 * @return  Void
 */
class Request {
	constructor(input) {
		let init = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {};

		let parsedURL;

		// normalize input
		if (!isRequest(input)) {
			if (input && input.href) {
				// in order to support Node.js' Url objects; though WHATWG's URL objects
				// will fall into this branch also (since their `toString()` will return
				// `href` property anyway)
				parsedURL = parse_url(input.href);
			} else {
				// coerce input to a string before attempting to parse
				parsedURL = parse_url(`${input}`);
			}
			input = {};
		} else {
			parsedURL = parse_url(input.url);
		}

		let method = init.method || input.method || 'GET';
		method = method.toUpperCase();

		if ((init.body != null || isRequest(input) && input.body !== null) && (method === 'GET' || method === 'HEAD')) {
			throw new TypeError('Request with GET/HEAD method cannot have body');
		}

		let inputBody = init.body != null ? init.body : isRequest(input) && input.body !== null ? clone(input) : null;

		Body.call(this, inputBody, {
			timeout: init.timeout || input.timeout || 0,
			size: init.size || input.size || 0
		});

		const headers = new Headers(init.headers || input.headers || {});

		if (inputBody != null && !headers.has('Content-Type')) {
			const contentType = extractContentType(inputBody);
			if (contentType) {
				headers.append('Content-Type', contentType);
			}
		}

		let signal = isRequest(input) ? input.signal : null;
		if ('signal' in init) signal = init.signal;

		if (signal != null && !isAbortSignal(signal)) {
			throw new TypeError('Expected signal to be an instanceof AbortSignal');
		}

		this[INTERNALS$2] = {
			method,
			redirect: init.redirect || input.redirect || 'follow',
			headers,
			parsedURL,
			signal
		};

		// node-fetch-only options
		this.follow = init.follow !== undefined ? init.follow : input.follow !== undefined ? input.follow : 20;
		this.compress = init.compress !== undefined ? init.compress : input.compress !== undefined ? input.compress : true;
		this.counter = init.counter || input.counter || 0;
		this.agent = init.agent || input.agent;
	}

	get method() {
		return this[INTERNALS$2].method;
	}

	get url() {
		return format_url(this[INTERNALS$2].parsedURL);
	}

	get headers() {
		return this[INTERNALS$2].headers;
	}

	get redirect() {
		return this[INTERNALS$2].redirect;
	}

	get signal() {
		return this[INTERNALS$2].signal;
	}

	/**
  * Clone this request
  *
  * @return  Request
  */
	clone() {
		return new Request(this);
	}
}

Body.mixIn(Request.prototype);

Object.defineProperty(Request.prototype, Symbol.toStringTag, {
	value: 'Request',
	writable: false,
	enumerable: false,
	configurable: true
});

Object.defineProperties(Request.prototype, {
	method: { enumerable: true },
	url: { enumerable: true },
	headers: { enumerable: true },
	redirect: { enumerable: true },
	clone: { enumerable: true },
	signal: { enumerable: true }
});

/**
 * Convert a Request to Node.js http request options.
 *
 * @param   Request  A Request instance
 * @return  Object   The options object to be passed to http.request
 */
function getNodeRequestOptions(request) {
	const parsedURL = request[INTERNALS$2].parsedURL;
	const headers = new Headers(request[INTERNALS$2].headers);

	// fetch step 1.3
	if (!headers.has('Accept')) {
		headers.set('Accept', '*/*');
	}

	// Basic fetch
	if (!parsedURL.protocol || !parsedURL.hostname) {
		throw new TypeError('Only absolute URLs are supported');
	}

	if (!/^https?:$/.test(parsedURL.protocol)) {
		throw new TypeError('Only HTTP(S) protocols are supported');
	}

	if (request.signal && request.body instanceof Stream.Readable && !streamDestructionSupported) {
		throw new Error('Cancellation of streamed requests with AbortSignal is not supported in node < 8');
	}

	// HTTP-network-or-cache fetch steps 2.4-2.7
	let contentLengthValue = null;
	if (request.body == null && /^(POST|PUT)$/i.test(request.method)) {
		contentLengthValue = '0';
	}
	if (request.body != null) {
		const totalBytes = getTotalBytes(request);
		if (typeof totalBytes === 'number') {
			contentLengthValue = String(totalBytes);
		}
	}
	if (contentLengthValue) {
		headers.set('Content-Length', contentLengthValue);
	}

	// HTTP-network-or-cache fetch step 2.11
	if (!headers.has('User-Agent')) {
		headers.set('User-Agent', 'node-fetch/1.0 (+https://github.com/bitinn/node-fetch)');
	}

	// HTTP-network-or-cache fetch step 2.15
	if (request.compress && !headers.has('Accept-Encoding')) {
		headers.set('Accept-Encoding', 'gzip,deflate');
	}

	let agent = request.agent;
	if (typeof agent === 'function') {
		agent = agent(parsedURL);
	}

	if (!headers.has('Connection') && !agent) {
		headers.set('Connection', 'close');
	}

	// HTTP-network fetch step 4.2
	// chunked encoding is handled by Node.js

	return Object.assign({}, parsedURL, {
		method: request.method,
		headers: exportNodeCompatibleHeaders(headers),
		agent
	});
}

/**
 * abort-error.js
 *
 * AbortError interface for cancelled requests
 */

/**
 * Create AbortError instance
 *
 * @param   String      message      Error message for human
 * @return  AbortError
 */
function AbortError(message) {
  Error.call(this, message);

  this.type = 'aborted';
  this.message = message;

  // hide custom error implementation details from end-users
  Error.captureStackTrace(this, this.constructor);
}

AbortError.prototype = Object.create(Error.prototype);
AbortError.prototype.constructor = AbortError;
AbortError.prototype.name = 'AbortError';

// fix an issue where "PassThrough", "resolve" aren't a named export for node <10
const PassThrough$1 = Stream.PassThrough;
const resolve_url = Url.resolve;

/**
 * Fetch function
 *
 * @param   Mixed    url   Absolute url or Request instance
 * @param   Object   opts  Fetch options
 * @return  Promise
 */
function fetch(url, opts) {

	// allow custom promise
	if (!fetch.Promise) {
		throw new Error('native promise missing, set fetch.Promise to your favorite alternative');
	}

	Body.Promise = fetch.Promise;

	// wrap http.request into fetch
	return new fetch.Promise(function (resolve, reject) {
		// build request object
		const request = new Request(url, opts);
		const options = getNodeRequestOptions(request);

		const send = (options.protocol === 'https:' ? https : http).request;
		const signal = request.signal;

		let response = null;

		const abort = function abort() {
			let error = new AbortError('The user aborted a request.');
			reject(error);
			if (request.body && request.body instanceof Stream.Readable) {
				request.body.destroy(error);
			}
			if (!response || !response.body) return;
			response.body.emit('error', error);
		};

		if (signal && signal.aborted) {
			abort();
			return;
		}

		const abortAndFinalize = function abortAndFinalize() {
			abort();
			finalize();
		};

		// send request
		const req = send(options);
		let reqTimeout;

		if (signal) {
			signal.addEventListener('abort', abortAndFinalize);
		}

		function finalize() {
			req.abort();
			if (signal) signal.removeEventListener('abort', abortAndFinalize);
			clearTimeout(reqTimeout);
		}

		if (request.timeout) {
			req.once('socket', function (socket) {
				reqTimeout = setTimeout(function () {
					reject(new FetchError(`network timeout at: ${request.url}`, 'request-timeout'));
					finalize();
				}, request.timeout);
			});
		}

		req.on('error', function (err) {
			reject(new FetchError(`request to ${request.url} failed, reason: ${err.message}`, 'system', err));
			finalize();
		});

		req.on('response', function (res) {
			clearTimeout(reqTimeout);

			const headers = createHeadersLenient(res.headers);

			// HTTP fetch step 5
			if (fetch.isRedirect(res.statusCode)) {
				// HTTP fetch step 5.2
				const location = headers.get('Location');

				// HTTP fetch step 5.3
				const locationURL = location === null ? null : resolve_url(request.url, location);

				// HTTP fetch step 5.5
				switch (request.redirect) {
					case 'error':
						reject(new FetchError(`redirect mode is set to error: ${request.url}`, 'no-redirect'));
						finalize();
						return;
					case 'manual':
						// node-fetch-specific step: make manual redirect a bit easier to use by setting the Location header value to the resolved URL.
						if (locationURL !== null) {
							// handle corrupted header
							try {
								headers.set('Location', locationURL);
							} catch (err) {
								// istanbul ignore next: nodejs server prevent invalid response headers, we can't test this through normal request
								reject(err);
							}
						}
						break;
					case 'follow':
						// HTTP-redirect fetch step 2
						if (locationURL === null) {
							break;
						}

						// HTTP-redirect fetch step 5
						if (request.counter >= request.follow) {
							reject(new FetchError(`maximum redirect reached at: ${request.url}`, 'max-redirect'));
							finalize();
							return;
						}

						// HTTP-redirect fetch step 6 (counter increment)
						// Create a new Request object.
						const requestOpts = {
							headers: new Headers(request.headers),
							follow: request.follow,
							counter: request.counter + 1,
							agent: request.agent,
							compress: request.compress,
							method: request.method,
							body: request.body,
							signal: request.signal,
							timeout: request.timeout
						};

						// HTTP-redirect fetch step 9
						if (res.statusCode !== 303 && request.body && getTotalBytes(request) === null) {
							reject(new FetchError('Cannot follow redirect with body being a readable stream', 'unsupported-redirect'));
							finalize();
							return;
						}

						// HTTP-redirect fetch step 11
						if (res.statusCode === 303 || (res.statusCode === 301 || res.statusCode === 302) && request.method === 'POST') {
							requestOpts.method = 'GET';
							requestOpts.body = undefined;
							requestOpts.headers.delete('content-length');
						}

						// HTTP-redirect fetch step 15
						resolve(fetch(new Request(locationURL, requestOpts)));
						finalize();
						return;
				}
			}

			// prepare response
			res.once('end', function () {
				if (signal) signal.removeEventListener('abort', abortAndFinalize);
			});
			let body = res.pipe(new PassThrough$1());

			const response_options = {
				url: request.url,
				status: res.statusCode,
				statusText: res.statusMessage,
				headers: headers,
				size: request.size,
				timeout: request.timeout,
				counter: request.counter
			};

			// HTTP-network fetch step 12.1.1.3
			const codings = headers.get('Content-Encoding');

			// HTTP-network fetch step 12.1.1.4: handle content codings

			// in following scenarios we ignore compression support
			// 1. compression support is disabled
			// 2. HEAD request
			// 3. no Content-Encoding header
			// 4. no content response (204)
			// 5. content not modified response (304)
			if (!request.compress || request.method === 'HEAD' || codings === null || res.statusCode === 204 || res.statusCode === 304) {
				response = new Response(body, response_options);
				resolve(response);
				return;
			}

			// For Node v6+
			// Be less strict when decoding compressed responses, since sometimes
			// servers send slightly invalid responses that are still accepted
			// by common browsers.
			// Always using Z_SYNC_FLUSH is what cURL does.
			const zlibOptions = {
				flush: zlib.Z_SYNC_FLUSH,
				finishFlush: zlib.Z_SYNC_FLUSH
			};

			// for gzip
			if (codings == 'gzip' || codings == 'x-gzip') {
				body = body.pipe(zlib.createGunzip(zlibOptions));
				response = new Response(body, response_options);
				resolve(response);
				return;
			}

			// for deflate
			if (codings == 'deflate' || codings == 'x-deflate') {
				// handle the infamous raw deflate response from old servers
				// a hack for old IIS and Apache servers
				const raw = res.pipe(new PassThrough$1());
				raw.once('data', function (chunk) {
					// see http://stackoverflow.com/questions/37519828
					if ((chunk[0] & 0x0F) === 0x08) {
						body = body.pipe(zlib.createInflate());
					} else {
						body = body.pipe(zlib.createInflateRaw());
					}
					response = new Response(body, response_options);
					resolve(response);
				});
				return;
			}

			// for br
			if (codings == 'br' && typeof zlib.createBrotliDecompress === 'function') {
				body = body.pipe(zlib.createBrotliDecompress());
				response = new Response(body, response_options);
				resolve(response);
				return;
			}

			// otherwise, use response as-is
			response = new Response(body, response_options);
			resolve(response);
		});

		writeToStream(req, request);
	});
}
/**
 * Redirect code matching
 *
 * @param   Number   code  Status code
 * @return  Boolean
 */
fetch.isRedirect = function (code) {
	return code === 301 || code === 302 || code === 303 || code === 307 || code === 308;
};

// expose Promise
fetch.Promise = global.Promise;

function get_page_handler(
	manifest,
	session_getter
) {
	const get_build_info =  (assets => () => assets)(JSON.parse(fs.readFileSync(path.join(build_dir, 'build.json'), 'utf-8')));

	const template =  (str => () => str)(read_template(build_dir));

	const has_service_worker = fs.existsSync(path.join(build_dir, 'service-worker.js'));

	const { server_routes, pages } = manifest;
	const error_route = manifest.error;

	function bail(req, res, err) {
		console.error(err);

		const message =  'Internal server error';

		res.statusCode = 500;
		res.end(`<pre>${message}</pre>`);
	}

	function handle_error(req, res, statusCode, error) {
		handle_page({
			pattern: null,
			parts: [
				{ name: null, component: error_route }
			]
		}, req, res, statusCode, error || new Error('Unknown error in preload function'));
	}

	async function handle_page(page, req, res, status = 200, error = null) {
		const is_service_worker_index = req.path === '/service-worker-index.html';
		const build_info




 = get_build_info();

		res.setHeader('Content-Type', 'text/html');
		res.setHeader('Cache-Control',  'max-age=600');

		// preload main.js and current route
		// TODO detect other stuff we can preload? images, CSS, fonts?
		let preloaded_chunks = Array.isArray(build_info.assets.main) ? build_info.assets.main : [build_info.assets.main];
		if (!error && !is_service_worker_index) {
			page.parts.forEach(part => {
				if (!part) return;

				// using concat because it could be a string or an array. thanks webpack!
				preloaded_chunks = preloaded_chunks.concat(build_info.assets[part.name]);
			});
		}

		if (build_info.bundler === 'rollup') {
			// TODO add dependencies and CSS
			const link = preloaded_chunks
				.filter(file => file && !file.match(/\.map$/))
				.map(file => `<${req.baseUrl}/client/${file}>;rel="modulepreload"`)
				.join(', ');

			res.setHeader('Link', link);
		} else {
			const link = preloaded_chunks
				.filter(file => file && !file.match(/\.map$/))
				.map((file) => {
					const as = /\.css$/.test(file) ? 'style' : 'script';
					return `<${req.baseUrl}/client/${file}>;rel="preload";as="${as}"`;
				})
				.join(', ');

			res.setHeader('Link', link);
		}

		const session = session_getter(req, res);

		let redirect;
		let preload_error;

		const preload_context = {
			redirect: (statusCode, location) => {
				if (redirect && (redirect.statusCode !== statusCode || redirect.location !== location)) {
					throw new Error(`Conflicting redirects`);
				}
				location = location.replace(/^\//g, ''); // leading slash (only)
				redirect = { statusCode, location };
			},
			error: (statusCode, message) => {
				preload_error = { statusCode, message };
			},
			fetch: (url, opts) => {
				const parsed = new Url.URL(url, `http://127.0.0.1:${process.env.PORT}${req.baseUrl ? req.baseUrl + '/' :''}`);

				if (opts) {
					opts = Object.assign({}, opts);

					const include_cookies = (
						opts.credentials === 'include' ||
						opts.credentials === 'same-origin' && parsed.origin === `http://127.0.0.1:${process.env.PORT}`
					);

					if (include_cookies) {
						opts.headers = Object.assign({}, opts.headers);

						const cookies = Object.assign(
							{},
							cookie.parse(req.headers.cookie || ''),
							cookie.parse(opts.headers.cookie || '')
						);

						const set_cookie = res.getHeader('Set-Cookie');
						(Array.isArray(set_cookie) ? set_cookie : [set_cookie]).forEach(str => {
							const match = /([^=]+)=([^;]+)/.exec(str);
							if (match) cookies[match[1]] = match[2];
						});

						const str = Object.keys(cookies)
							.map(key => `${key}=${cookies[key]}`)
							.join('; ');

						opts.headers.cookie = str;
					}
				}

				return fetch(parsed.href, opts);
			}
		};

		let preloaded;
		let match;
		let params;

		try {
			const root_preloaded = manifest.root_preload
				? manifest.root_preload.call(preload_context, {
					host: req.headers.host,
					path: req.path,
					query: req.query,
					params: {}
				}, session)
				: {};

			match = error ? null : page.pattern.exec(req.path);


			let toPreload = [root_preloaded];
			if (!is_service_worker_index) {
				toPreload = toPreload.concat(page.parts.map(part => {
					if (!part) return null;

					// the deepest level is used below, to initialise the store
					params = part.params ? part.params(match) : {};

					return part.preload
						? part.preload.call(preload_context, {
							host: req.headers.host,
							path: req.path,
							query: req.query,
							params
						}, session)
						: {};
				}));
			}

			preloaded = await Promise.all(toPreload);
		} catch (err) {
			if (error) {
				return bail(req, res, err)
			}

			preload_error = { statusCode: 500, message: err };
			preloaded = []; // appease TypeScript
		}

		try {
			if (redirect) {
				const location = Url.resolve((req.baseUrl || '') + '/', redirect.location);

				res.statusCode = redirect.statusCode;
				res.setHeader('Location', location);
				res.end();

				return;
			}

			if (preload_error) {
				handle_error(req, res, preload_error.statusCode, preload_error.message);
				return;
			}

			const segments = req.path.split('/').filter(Boolean);

			// TODO make this less confusing
			const layout_segments = [segments[0]];
			let l = 1;

			page.parts.forEach((part, i) => {
				layout_segments[l] = segments[i + 1];
				if (!part) return null;
				l++;
			});

			const props = {
				stores: {
					page: {
						subscribe: writable({
							host: req.headers.host,
							path: req.path,
							query: req.query,
							params
						}).subscribe
					},
					preloading: {
						subscribe: writable(null).subscribe
					},
					session: writable(session)
				},
				segments: layout_segments,
				status: error ? status : 200,
				error: error ? error instanceof Error ? error : { message: error } : null,
				level0: {
					props: preloaded[0]
				},
				level1: {
					segment: segments[0],
					props: {}
				}
			};

			if (!is_service_worker_index) {
				let l = 1;
				for (let i = 0; i < page.parts.length; i += 1) {
					const part = page.parts[i];
					if (!part) continue;

					props[`level${l++}`] = {
						component: part.component,
						props: preloaded[i + 1] || {},
						segment: segments[i]
					};
				}
			}

			const { html, head, css } = App.render(props);

			const serialized = {
				preloaded: `[${preloaded.map(data => try_serialize(data)).join(',')}]`,
				session: session && try_serialize(session, err => {
					throw new Error(`Failed to serialize session data: ${err.message}`);
				}),
				error: error && try_serialize(props.error)
			};

			let script = `__SAPPER__={${[
				error && `error:${serialized.error},status:${status}`,
				`baseUrl:"${req.baseUrl}"`,
				serialized.preloaded && `preloaded:${serialized.preloaded}`,
				serialized.session && `session:${serialized.session}`
			].filter(Boolean).join(',')}};`;

			if (has_service_worker) {
				script += `if('serviceWorker' in navigator)navigator.serviceWorker.register('${req.baseUrl}/service-worker.js');`;
			}

			const file = [].concat(build_info.assets.main).filter(file => file && /\.js$/.test(file))[0];
			const main = `${req.baseUrl}/client/${file}`;

			if (build_info.bundler === 'rollup') {
				if (build_info.legacy_assets) {
					const legacy_main = `${req.baseUrl}/client/legacy/${build_info.legacy_assets.main}`;
					script += `(function(){try{eval("async function x(){}");var main="${main}"}catch(e){main="${legacy_main}"};var s=document.createElement("script");try{new Function("if(0)import('')")();s.src=main;s.type="module";s.crossOrigin="use-credentials";}catch(e){s.src="${req.baseUrl}/client/shimport@${build_info.shimport}.js";s.setAttribute("data-main",main);}document.head.appendChild(s);}());`;
				} else {
					script += `var s=document.createElement("script");try{new Function("if(0)import('')")();s.src="${main}";s.type="module";s.crossOrigin="use-credentials";}catch(e){s.src="${req.baseUrl}/client/shimport@${build_info.shimport}.js";s.setAttribute("data-main","${main}")}document.head.appendChild(s)`;
				}
			} else {
				script += `</script><script src="${main}">`;
			}

			let styles;

			// TODO make this consistent across apps
			// TODO embed build_info in placeholder.ts
			if (build_info.css && build_info.css.main) {
				const css_chunks = new Set();
				if (build_info.css.main) css_chunks.add(build_info.css.main);
				page.parts.forEach(part => {
					if (!part) return;
					const css_chunks_for_part = build_info.css.chunks[part.file];

					if (css_chunks_for_part) {
						css_chunks_for_part.forEach(file => {
							css_chunks.add(file);
						});
					}
				});

				styles = Array.from(css_chunks)
					.map(href => `<link rel="stylesheet" href="client/${href}">`)
					.join('');
			} else {
				styles = (css && css.code ? `<style>${css.code}</style>` : '');
			}

			// users can set a CSP nonce using res.locals.nonce
			const nonce_attr = (res.locals && res.locals.nonce) ? ` nonce="${res.locals.nonce}"` : '';

			const body = template()
				.replace('%sapper.base%', () => `<base href="${req.baseUrl}/">`)
				.replace('%sapper.scripts%', () => `<script${nonce_attr}>${script}</script>`)
				.replace('%sapper.html%', () => html)
				.replace('%sapper.head%', () => `<noscript id='sapper-head-start'></noscript>${head}<noscript id='sapper-head-end'></noscript>`)
				.replace('%sapper.styles%', () => styles);

			res.statusCode = status;
			res.end(body);
		} catch(err) {
			if (error) {
				bail(req, res, err);
			} else {
				handle_error(req, res, 500, err);
			}
		}
	}

	return function find_route(req, res, next) {
		if (req.path === '/service-worker-index.html') {
			const homePage = pages.find(page => page.pattern.test('/'));
			handle_page(homePage, req, res);
			return;
		}

		for (const page of pages) {
			if (page.pattern.test(req.path)) {
				handle_page(page, req, res);
				return;
			}
		}

		handle_error(req, res, 404, 'Not found');
	};
}

function read_template(dir = build_dir) {
	return fs.readFileSync(`${dir}/template.html`, 'utf-8');
}

function try_serialize(data, fail) {
	try {
		return devalue(data);
	} catch (err) {
		if (fail) fail(err);
		return null;
	}
}

var mime_raw = "application/andrew-inset\t\t\tez\napplication/applixware\t\t\t\taw\napplication/atom+xml\t\t\t\tatom\napplication/atomcat+xml\t\t\t\tatomcat\napplication/atomsvc+xml\t\t\t\tatomsvc\napplication/ccxml+xml\t\t\t\tccxml\napplication/cdmi-capability\t\t\tcdmia\napplication/cdmi-container\t\t\tcdmic\napplication/cdmi-domain\t\t\t\tcdmid\napplication/cdmi-object\t\t\t\tcdmio\napplication/cdmi-queue\t\t\t\tcdmiq\napplication/cu-seeme\t\t\t\tcu\napplication/davmount+xml\t\t\tdavmount\napplication/docbook+xml\t\t\t\tdbk\napplication/dssc+der\t\t\t\tdssc\napplication/dssc+xml\t\t\t\txdssc\napplication/ecmascript\t\t\t\tecma\napplication/emma+xml\t\t\t\temma\napplication/epub+zip\t\t\t\tepub\napplication/exi\t\t\t\t\texi\napplication/font-tdpfr\t\t\t\tpfr\napplication/gml+xml\t\t\t\tgml\napplication/gpx+xml\t\t\t\tgpx\napplication/gxf\t\t\t\t\tgxf\napplication/hyperstudio\t\t\t\tstk\napplication/inkml+xml\t\t\t\tink inkml\napplication/ipfix\t\t\t\tipfix\napplication/java-archive\t\t\tjar\napplication/java-serialized-object\t\tser\napplication/java-vm\t\t\t\tclass\napplication/javascript\t\t\t\tjs\napplication/json\t\t\t\tjson map\napplication/jsonml+json\t\t\t\tjsonml\napplication/lost+xml\t\t\t\tlostxml\napplication/mac-binhex40\t\t\thqx\napplication/mac-compactpro\t\t\tcpt\napplication/mads+xml\t\t\t\tmads\napplication/marc\t\t\t\tmrc\napplication/marcxml+xml\t\t\t\tmrcx\napplication/mathematica\t\t\t\tma nb mb\napplication/mathml+xml\t\t\t\tmathml\napplication/mbox\t\t\t\tmbox\napplication/mediaservercontrol+xml\t\tmscml\napplication/metalink+xml\t\t\tmetalink\napplication/metalink4+xml\t\t\tmeta4\napplication/mets+xml\t\t\t\tmets\napplication/mods+xml\t\t\t\tmods\napplication/mp21\t\t\t\tm21 mp21\napplication/mp4\t\t\t\t\tmp4s\napplication/msword\t\t\t\tdoc dot\napplication/mxf\t\t\t\t\tmxf\napplication/octet-stream\tbin dms lrf mar so dist distz pkg bpk dump elc deploy\napplication/oda\t\t\t\t\toda\napplication/oebps-package+xml\t\t\topf\napplication/ogg\t\t\t\t\togx\napplication/omdoc+xml\t\t\t\tomdoc\napplication/onenote\t\t\t\tonetoc onetoc2 onetmp onepkg\napplication/oxps\t\t\t\toxps\napplication/patch-ops-error+xml\t\t\txer\napplication/pdf\t\t\t\t\tpdf\napplication/pgp-encrypted\t\t\tpgp\napplication/pgp-signature\t\t\tasc sig\napplication/pics-rules\t\t\t\tprf\napplication/pkcs10\t\t\t\tp10\napplication/pkcs7-mime\t\t\t\tp7m p7c\napplication/pkcs7-signature\t\t\tp7s\napplication/pkcs8\t\t\t\tp8\napplication/pkix-attr-cert\t\t\tac\napplication/pkix-cert\t\t\t\tcer\napplication/pkix-crl\t\t\t\tcrl\napplication/pkix-pkipath\t\t\tpkipath\napplication/pkixcmp\t\t\t\tpki\napplication/pls+xml\t\t\t\tpls\napplication/postscript\t\t\t\tai eps ps\napplication/prs.cww\t\t\t\tcww\napplication/pskc+xml\t\t\t\tpskcxml\napplication/rdf+xml\t\t\t\trdf\napplication/reginfo+xml\t\t\t\trif\napplication/relax-ng-compact-syntax\t\trnc\napplication/resource-lists+xml\t\t\trl\napplication/resource-lists-diff+xml\t\trld\napplication/rls-services+xml\t\t\trs\napplication/rpki-ghostbusters\t\t\tgbr\napplication/rpki-manifest\t\t\tmft\napplication/rpki-roa\t\t\t\troa\napplication/rsd+xml\t\t\t\trsd\napplication/rss+xml\t\t\t\trss\napplication/rtf\t\t\t\t\trtf\napplication/sbml+xml\t\t\t\tsbml\napplication/scvp-cv-request\t\t\tscq\napplication/scvp-cv-response\t\t\tscs\napplication/scvp-vp-request\t\t\tspq\napplication/scvp-vp-response\t\t\tspp\napplication/sdp\t\t\t\t\tsdp\napplication/set-payment-initiation\t\tsetpay\napplication/set-registration-initiation\t\tsetreg\napplication/shf+xml\t\t\t\tshf\napplication/smil+xml\t\t\t\tsmi smil\napplication/sparql-query\t\t\trq\napplication/sparql-results+xml\t\t\tsrx\napplication/srgs\t\t\t\tgram\napplication/srgs+xml\t\t\t\tgrxml\napplication/sru+xml\t\t\t\tsru\napplication/ssdl+xml\t\t\t\tssdl\napplication/ssml+xml\t\t\t\tssml\napplication/tei+xml\t\t\t\ttei teicorpus\napplication/thraud+xml\t\t\t\ttfi\napplication/timestamped-data\t\t\ttsd\napplication/vnd.3gpp.pic-bw-large\t\tplb\napplication/vnd.3gpp.pic-bw-small\t\tpsb\napplication/vnd.3gpp.pic-bw-var\t\t\tpvb\napplication/vnd.3gpp2.tcap\t\t\ttcap\napplication/vnd.3m.post-it-notes\t\tpwn\napplication/vnd.accpac.simply.aso\t\taso\napplication/vnd.accpac.simply.imp\t\timp\napplication/vnd.acucobol\t\t\tacu\napplication/vnd.acucorp\t\t\t\tatc acutc\napplication/vnd.adobe.air-application-installer-package+zip\tair\napplication/vnd.adobe.formscentral.fcdt\t\tfcdt\napplication/vnd.adobe.fxp\t\t\tfxp fxpl\napplication/vnd.adobe.xdp+xml\t\t\txdp\napplication/vnd.adobe.xfdf\t\t\txfdf\napplication/vnd.ahead.space\t\t\tahead\napplication/vnd.airzip.filesecure.azf\t\tazf\napplication/vnd.airzip.filesecure.azs\t\tazs\napplication/vnd.amazon.ebook\t\t\tazw\napplication/vnd.americandynamics.acc\t\tacc\napplication/vnd.amiga.ami\t\t\tami\napplication/vnd.android.package-archive\t\tapk\napplication/vnd.anser-web-certificate-issue-initiation\tcii\napplication/vnd.anser-web-funds-transfer-initiation\tfti\napplication/vnd.antix.game-component\t\tatx\napplication/vnd.apple.installer+xml\t\tmpkg\napplication/vnd.apple.mpegurl\t\t\tm3u8\napplication/vnd.aristanetworks.swi\t\tswi\napplication/vnd.astraea-software.iota\t\tiota\napplication/vnd.audiograph\t\t\taep\napplication/vnd.blueice.multipass\t\tmpm\napplication/vnd.bmi\t\t\t\tbmi\napplication/vnd.businessobjects\t\t\trep\napplication/vnd.chemdraw+xml\t\t\tcdxml\napplication/vnd.chipnuts.karaoke-mmd\t\tmmd\napplication/vnd.cinderella\t\t\tcdy\napplication/vnd.claymore\t\t\tcla\napplication/vnd.cloanto.rp9\t\t\trp9\napplication/vnd.clonk.c4group\t\t\tc4g c4d c4f c4p c4u\napplication/vnd.cluetrust.cartomobile-config\t\tc11amc\napplication/vnd.cluetrust.cartomobile-config-pkg\tc11amz\napplication/vnd.commonspace\t\t\tcsp\napplication/vnd.contact.cmsg\t\t\tcdbcmsg\napplication/vnd.cosmocaller\t\t\tcmc\napplication/vnd.crick.clicker\t\t\tclkx\napplication/vnd.crick.clicker.keyboard\t\tclkk\napplication/vnd.crick.clicker.palette\t\tclkp\napplication/vnd.crick.clicker.template\t\tclkt\napplication/vnd.crick.clicker.wordbank\t\tclkw\napplication/vnd.criticaltools.wbs+xml\t\twbs\napplication/vnd.ctc-posml\t\t\tpml\napplication/vnd.cups-ppd\t\t\tppd\napplication/vnd.curl.car\t\t\tcar\napplication/vnd.curl.pcurl\t\t\tpcurl\napplication/vnd.dart\t\t\t\tdart\napplication/vnd.data-vision.rdz\t\t\trdz\napplication/vnd.dece.data\t\t\tuvf uvvf uvd uvvd\napplication/vnd.dece.ttml+xml\t\t\tuvt uvvt\napplication/vnd.dece.unspecified\t\tuvx uvvx\napplication/vnd.dece.zip\t\t\tuvz uvvz\napplication/vnd.denovo.fcselayout-link\t\tfe_launch\napplication/vnd.dna\t\t\t\tdna\napplication/vnd.dolby.mlp\t\t\tmlp\napplication/vnd.dpgraph\t\t\t\tdpg\napplication/vnd.dreamfactory\t\t\tdfac\napplication/vnd.ds-keypoint\t\t\tkpxx\napplication/vnd.dvb.ait\t\t\t\tait\napplication/vnd.dvb.service\t\t\tsvc\napplication/vnd.dynageo\t\t\t\tgeo\napplication/vnd.ecowin.chart\t\t\tmag\napplication/vnd.enliven\t\t\t\tnml\napplication/vnd.epson.esf\t\t\tesf\napplication/vnd.epson.msf\t\t\tmsf\napplication/vnd.epson.quickanime\t\tqam\napplication/vnd.epson.salt\t\t\tslt\napplication/vnd.epson.ssf\t\t\tssf\napplication/vnd.eszigno3+xml\t\t\tes3 et3\napplication/vnd.ezpix-album\t\t\tez2\napplication/vnd.ezpix-package\t\t\tez3\napplication/vnd.fdf\t\t\t\tfdf\napplication/vnd.fdsn.mseed\t\t\tmseed\napplication/vnd.fdsn.seed\t\t\tseed dataless\napplication/vnd.flographit\t\t\tgph\napplication/vnd.fluxtime.clip\t\t\tftc\napplication/vnd.framemaker\t\t\tfm frame maker book\napplication/vnd.frogans.fnc\t\t\tfnc\napplication/vnd.frogans.ltf\t\t\tltf\napplication/vnd.fsc.weblaunch\t\t\tfsc\napplication/vnd.fujitsu.oasys\t\t\toas\napplication/vnd.fujitsu.oasys2\t\t\toa2\napplication/vnd.fujitsu.oasys3\t\t\toa3\napplication/vnd.fujitsu.oasysgp\t\t\tfg5\napplication/vnd.fujitsu.oasysprs\t\tbh2\napplication/vnd.fujixerox.ddd\t\t\tddd\napplication/vnd.fujixerox.docuworks\t\txdw\napplication/vnd.fujixerox.docuworks.binder\txbd\napplication/vnd.fuzzysheet\t\t\tfzs\napplication/vnd.genomatix.tuxedo\t\ttxd\napplication/vnd.geogebra.file\t\t\tggb\napplication/vnd.geogebra.tool\t\t\tggt\napplication/vnd.geometry-explorer\t\tgex gre\napplication/vnd.geonext\t\t\t\tgxt\napplication/vnd.geoplan\t\t\t\tg2w\napplication/vnd.geospace\t\t\tg3w\napplication/vnd.gmx\t\t\t\tgmx\napplication/vnd.google-earth.kml+xml\t\tkml\napplication/vnd.google-earth.kmz\t\tkmz\napplication/vnd.grafeq\t\t\t\tgqf gqs\napplication/vnd.groove-account\t\t\tgac\napplication/vnd.groove-help\t\t\tghf\napplication/vnd.groove-identity-message\t\tgim\napplication/vnd.groove-injector\t\t\tgrv\napplication/vnd.groove-tool-message\t\tgtm\napplication/vnd.groove-tool-template\t\ttpl\napplication/vnd.groove-vcard\t\t\tvcg\napplication/vnd.hal+xml\t\t\t\thal\napplication/vnd.handheld-entertainment+xml\tzmm\napplication/vnd.hbci\t\t\t\thbci\napplication/vnd.hhe.lesson-player\t\tles\napplication/vnd.hp-hpgl\t\t\t\thpgl\napplication/vnd.hp-hpid\t\t\t\thpid\napplication/vnd.hp-hps\t\t\t\thps\napplication/vnd.hp-jlyt\t\t\t\tjlt\napplication/vnd.hp-pcl\t\t\t\tpcl\napplication/vnd.hp-pclxl\t\t\tpclxl\napplication/vnd.hydrostatix.sof-data\t\tsfd-hdstx\napplication/vnd.ibm.minipay\t\t\tmpy\napplication/vnd.ibm.modcap\t\t\tafp listafp list3820\napplication/vnd.ibm.rights-management\t\tirm\napplication/vnd.ibm.secure-container\t\tsc\napplication/vnd.iccprofile\t\t\ticc icm\napplication/vnd.igloader\t\t\tigl\napplication/vnd.immervision-ivp\t\t\tivp\napplication/vnd.immervision-ivu\t\t\tivu\napplication/vnd.insors.igm\t\t\tigm\napplication/vnd.intercon.formnet\t\txpw xpx\napplication/vnd.intergeo\t\t\ti2g\napplication/vnd.intu.qbo\t\t\tqbo\napplication/vnd.intu.qfx\t\t\tqfx\napplication/vnd.ipunplugged.rcprofile\t\trcprofile\napplication/vnd.irepository.package+xml\t\tirp\napplication/vnd.is-xpr\t\t\t\txpr\napplication/vnd.isac.fcs\t\t\tfcs\napplication/vnd.jam\t\t\t\tjam\napplication/vnd.jcp.javame.midlet-rms\t\trms\napplication/vnd.jisp\t\t\t\tjisp\napplication/vnd.joost.joda-archive\t\tjoda\napplication/vnd.kahootz\t\t\t\tktz ktr\napplication/vnd.kde.karbon\t\t\tkarbon\napplication/vnd.kde.kchart\t\t\tchrt\napplication/vnd.kde.kformula\t\t\tkfo\napplication/vnd.kde.kivio\t\t\tflw\napplication/vnd.kde.kontour\t\t\tkon\napplication/vnd.kde.kpresenter\t\t\tkpr kpt\napplication/vnd.kde.kspread\t\t\tksp\napplication/vnd.kde.kword\t\t\tkwd kwt\napplication/vnd.kenameaapp\t\t\thtke\napplication/vnd.kidspiration\t\t\tkia\napplication/vnd.kinar\t\t\t\tkne knp\napplication/vnd.koan\t\t\t\tskp skd skt skm\napplication/vnd.kodak-descriptor\t\tsse\napplication/vnd.las.las+xml\t\t\tlasxml\napplication/vnd.llamagraphics.life-balance.desktop\tlbd\napplication/vnd.llamagraphics.life-balance.exchange+xml\tlbe\napplication/vnd.lotus-1-2-3\t\t\t123\napplication/vnd.lotus-approach\t\t\tapr\napplication/vnd.lotus-freelance\t\t\tpre\napplication/vnd.lotus-notes\t\t\tnsf\napplication/vnd.lotus-organizer\t\t\torg\napplication/vnd.lotus-screencam\t\t\tscm\napplication/vnd.lotus-wordpro\t\t\tlwp\napplication/vnd.macports.portpkg\t\tportpkg\napplication/vnd.mcd\t\t\t\tmcd\napplication/vnd.medcalcdata\t\t\tmc1\napplication/vnd.mediastation.cdkey\t\tcdkey\napplication/vnd.mfer\t\t\t\tmwf\napplication/vnd.mfmp\t\t\t\tmfm\napplication/vnd.micrografx.flo\t\t\tflo\napplication/vnd.micrografx.igx\t\t\tigx\napplication/vnd.mif\t\t\t\tmif\napplication/vnd.mobius.daf\t\t\tdaf\napplication/vnd.mobius.dis\t\t\tdis\napplication/vnd.mobius.mbk\t\t\tmbk\napplication/vnd.mobius.mqy\t\t\tmqy\napplication/vnd.mobius.msl\t\t\tmsl\napplication/vnd.mobius.plc\t\t\tplc\napplication/vnd.mobius.txf\t\t\ttxf\napplication/vnd.mophun.application\t\tmpn\napplication/vnd.mophun.certificate\t\tmpc\napplication/vnd.mozilla.xul+xml\t\t\txul\napplication/vnd.ms-artgalry\t\t\tcil\napplication/vnd.ms-cab-compressed\t\tcab\napplication/vnd.ms-excel\t\t\txls xlm xla xlc xlt xlw\napplication/vnd.ms-excel.addin.macroenabled.12\t\txlam\napplication/vnd.ms-excel.sheet.binary.macroenabled.12\txlsb\napplication/vnd.ms-excel.sheet.macroenabled.12\t\txlsm\napplication/vnd.ms-excel.template.macroenabled.12\txltm\napplication/vnd.ms-fontobject\t\t\teot\napplication/vnd.ms-htmlhelp\t\t\tchm\napplication/vnd.ms-ims\t\t\t\tims\napplication/vnd.ms-lrm\t\t\t\tlrm\napplication/vnd.ms-officetheme\t\t\tthmx\napplication/vnd.ms-pki.seccat\t\t\tcat\napplication/vnd.ms-pki.stl\t\t\tstl\napplication/vnd.ms-powerpoint\t\t\tppt pps pot\napplication/vnd.ms-powerpoint.addin.macroenabled.12\t\tppam\napplication/vnd.ms-powerpoint.presentation.macroenabled.12\tpptm\napplication/vnd.ms-powerpoint.slide.macroenabled.12\t\tsldm\napplication/vnd.ms-powerpoint.slideshow.macroenabled.12\t\tppsm\napplication/vnd.ms-powerpoint.template.macroenabled.12\t\tpotm\napplication/vnd.ms-project\t\t\tmpp mpt\napplication/vnd.ms-word.document.macroenabled.12\tdocm\napplication/vnd.ms-word.template.macroenabled.12\tdotm\napplication/vnd.ms-works\t\t\twps wks wcm wdb\napplication/vnd.ms-wpl\t\t\t\twpl\napplication/vnd.ms-xpsdocument\t\t\txps\napplication/vnd.mseq\t\t\t\tmseq\napplication/vnd.musician\t\t\tmus\napplication/vnd.muvee.style\t\t\tmsty\napplication/vnd.mynfc\t\t\t\ttaglet\napplication/vnd.neurolanguage.nlu\t\tnlu\napplication/vnd.nitf\t\t\t\tntf nitf\napplication/vnd.noblenet-directory\t\tnnd\napplication/vnd.noblenet-sealer\t\t\tnns\napplication/vnd.noblenet-web\t\t\tnnw\napplication/vnd.nokia.n-gage.data\t\tngdat\napplication/vnd.nokia.n-gage.symbian.install\tn-gage\napplication/vnd.nokia.radio-preset\t\trpst\napplication/vnd.nokia.radio-presets\t\trpss\napplication/vnd.novadigm.edm\t\t\tedm\napplication/vnd.novadigm.edx\t\t\tedx\napplication/vnd.novadigm.ext\t\t\text\napplication/vnd.oasis.opendocument.chart\t\todc\napplication/vnd.oasis.opendocument.chart-template\totc\napplication/vnd.oasis.opendocument.database\t\todb\napplication/vnd.oasis.opendocument.formula\t\todf\napplication/vnd.oasis.opendocument.formula-template\todft\napplication/vnd.oasis.opendocument.graphics\t\todg\napplication/vnd.oasis.opendocument.graphics-template\totg\napplication/vnd.oasis.opendocument.image\t\todi\napplication/vnd.oasis.opendocument.image-template\toti\napplication/vnd.oasis.opendocument.presentation\t\todp\napplication/vnd.oasis.opendocument.presentation-template\totp\napplication/vnd.oasis.opendocument.spreadsheet\t\tods\napplication/vnd.oasis.opendocument.spreadsheet-template\tots\napplication/vnd.oasis.opendocument.text\t\t\todt\napplication/vnd.oasis.opendocument.text-master\t\todm\napplication/vnd.oasis.opendocument.text-template\tott\napplication/vnd.oasis.opendocument.text-web\t\toth\napplication/vnd.olpc-sugar\t\t\txo\napplication/vnd.oma.dd2+xml\t\t\tdd2\napplication/vnd.openofficeorg.extension\t\toxt\napplication/vnd.openxmlformats-officedocument.presentationml.presentation\tpptx\napplication/vnd.openxmlformats-officedocument.presentationml.slide\tsldx\napplication/vnd.openxmlformats-officedocument.presentationml.slideshow\tppsx\napplication/vnd.openxmlformats-officedocument.presentationml.template\tpotx\napplication/vnd.openxmlformats-officedocument.spreadsheetml.sheet\txlsx\napplication/vnd.openxmlformats-officedocument.spreadsheetml.template\txltx\napplication/vnd.openxmlformats-officedocument.wordprocessingml.document\tdocx\napplication/vnd.openxmlformats-officedocument.wordprocessingml.template\tdotx\napplication/vnd.osgeo.mapguide.package\t\tmgp\napplication/vnd.osgi.dp\t\t\t\tdp\napplication/vnd.osgi.subsystem\t\t\tesa\napplication/vnd.palm\t\t\t\tpdb pqa oprc\napplication/vnd.pawaafile\t\t\tpaw\napplication/vnd.pg.format\t\t\tstr\napplication/vnd.pg.osasli\t\t\tei6\napplication/vnd.picsel\t\t\t\tefif\napplication/vnd.pmi.widget\t\t\twg\napplication/vnd.pocketlearn\t\t\tplf\napplication/vnd.powerbuilder6\t\t\tpbd\napplication/vnd.previewsystems.box\t\tbox\napplication/vnd.proteus.magazine\t\tmgz\napplication/vnd.publishare-delta-tree\t\tqps\napplication/vnd.pvi.ptid1\t\t\tptid\napplication/vnd.quark.quarkxpress\t\tqxd qxt qwd qwt qxl qxb\napplication/vnd.realvnc.bed\t\t\tbed\napplication/vnd.recordare.musicxml\t\tmxl\napplication/vnd.recordare.musicxml+xml\t\tmusicxml\napplication/vnd.rig.cryptonote\t\t\tcryptonote\napplication/vnd.rim.cod\t\t\t\tcod\napplication/vnd.rn-realmedia\t\t\trm\napplication/vnd.rn-realmedia-vbr\t\trmvb\napplication/vnd.route66.link66+xml\t\tlink66\napplication/vnd.sailingtracker.track\t\tst\napplication/vnd.seemail\t\t\t\tsee\napplication/vnd.sema\t\t\t\tsema\napplication/vnd.semd\t\t\t\tsemd\napplication/vnd.semf\t\t\t\tsemf\napplication/vnd.shana.informed.formdata\t\tifm\napplication/vnd.shana.informed.formtemplate\titp\napplication/vnd.shana.informed.interchange\tiif\napplication/vnd.shana.informed.package\t\tipk\napplication/vnd.simtech-mindmapper\t\ttwd twds\napplication/vnd.smaf\t\t\t\tmmf\napplication/vnd.smart.teacher\t\t\tteacher\napplication/vnd.solent.sdkm+xml\t\t\tsdkm sdkd\napplication/vnd.spotfire.dxp\t\t\tdxp\napplication/vnd.spotfire.sfs\t\t\tsfs\napplication/vnd.stardivision.calc\t\tsdc\napplication/vnd.stardivision.draw\t\tsda\napplication/vnd.stardivision.impress\t\tsdd\napplication/vnd.stardivision.math\t\tsmf\napplication/vnd.stardivision.writer\t\tsdw vor\napplication/vnd.stardivision.writer-global\tsgl\napplication/vnd.stepmania.package\t\tsmzip\napplication/vnd.stepmania.stepchart\t\tsm\napplication/vnd.sun.xml.calc\t\t\tsxc\napplication/vnd.sun.xml.calc.template\t\tstc\napplication/vnd.sun.xml.draw\t\t\tsxd\napplication/vnd.sun.xml.draw.template\t\tstd\napplication/vnd.sun.xml.impress\t\t\tsxi\napplication/vnd.sun.xml.impress.template\tsti\napplication/vnd.sun.xml.math\t\t\tsxm\napplication/vnd.sun.xml.writer\t\t\tsxw\napplication/vnd.sun.xml.writer.global\t\tsxg\napplication/vnd.sun.xml.writer.template\t\tstw\napplication/vnd.sus-calendar\t\t\tsus susp\napplication/vnd.svd\t\t\t\tsvd\napplication/vnd.symbian.install\t\t\tsis sisx\napplication/vnd.syncml+xml\t\t\txsm\napplication/vnd.syncml.dm+wbxml\t\t\tbdm\napplication/vnd.syncml.dm+xml\t\t\txdm\napplication/vnd.tao.intent-module-archive\ttao\napplication/vnd.tcpdump.pcap\t\t\tpcap cap dmp\napplication/vnd.tmobile-livetv\t\t\ttmo\napplication/vnd.trid.tpt\t\t\ttpt\napplication/vnd.triscape.mxs\t\t\tmxs\napplication/vnd.trueapp\t\t\t\ttra\napplication/vnd.ufdl\t\t\t\tufd ufdl\napplication/vnd.uiq.theme\t\t\tutz\napplication/vnd.umajin\t\t\t\tumj\napplication/vnd.unity\t\t\t\tunityweb\napplication/vnd.uoml+xml\t\t\tuoml\napplication/vnd.vcx\t\t\t\tvcx\napplication/vnd.visio\t\t\t\tvsd vst vss vsw\napplication/vnd.visionary\t\t\tvis\napplication/vnd.vsf\t\t\t\tvsf\napplication/vnd.wap.wbxml\t\t\twbxml\napplication/vnd.wap.wmlc\t\t\twmlc\napplication/vnd.wap.wmlscriptc\t\t\twmlsc\napplication/vnd.webturbo\t\t\twtb\napplication/vnd.wolfram.player\t\t\tnbp\napplication/vnd.wordperfect\t\t\twpd\napplication/vnd.wqd\t\t\t\twqd\napplication/vnd.wt.stf\t\t\t\tstf\napplication/vnd.xara\t\t\t\txar\napplication/vnd.xfdl\t\t\t\txfdl\napplication/vnd.yamaha.hv-dic\t\t\thvd\napplication/vnd.yamaha.hv-script\t\thvs\napplication/vnd.yamaha.hv-voice\t\t\thvp\napplication/vnd.yamaha.openscoreformat\t\t\tosf\napplication/vnd.yamaha.openscoreformat.osfpvg+xml\tosfpvg\napplication/vnd.yamaha.smaf-audio\t\tsaf\napplication/vnd.yamaha.smaf-phrase\t\tspf\napplication/vnd.yellowriver-custom-menu\t\tcmp\napplication/vnd.zul\t\t\t\tzir zirz\napplication/vnd.zzazz.deck+xml\t\t\tzaz\napplication/voicexml+xml\t\t\tvxml\napplication/wasm\t\t\t\twasm\napplication/widget\t\t\t\twgt\napplication/winhlp\t\t\t\thlp\napplication/wsdl+xml\t\t\t\twsdl\napplication/wspolicy+xml\t\t\twspolicy\napplication/x-7z-compressed\t\t\t7z\napplication/x-abiword\t\t\t\tabw\napplication/x-ace-compressed\t\t\tace\napplication/x-apple-diskimage\t\t\tdmg\napplication/x-authorware-bin\t\t\taab x32 u32 vox\napplication/x-authorware-map\t\t\taam\napplication/x-authorware-seg\t\t\taas\napplication/x-bcpio\t\t\t\tbcpio\napplication/x-bittorrent\t\t\ttorrent\napplication/x-blorb\t\t\t\tblb blorb\napplication/x-bzip\t\t\t\tbz\napplication/x-bzip2\t\t\t\tbz2 boz\napplication/x-cbr\t\t\t\tcbr cba cbt cbz cb7\napplication/x-cdlink\t\t\t\tvcd\napplication/x-cfs-compressed\t\t\tcfs\napplication/x-chat\t\t\t\tchat\napplication/x-chess-pgn\t\t\t\tpgn\napplication/x-conference\t\t\tnsc\napplication/x-cpio\t\t\t\tcpio\napplication/x-csh\t\t\t\tcsh\napplication/x-debian-package\t\t\tdeb udeb\napplication/x-dgc-compressed\t\t\tdgc\napplication/x-director\t\t\tdir dcr dxr cst cct cxt w3d fgd swa\napplication/x-doom\t\t\t\twad\napplication/x-dtbncx+xml\t\t\tncx\napplication/x-dtbook+xml\t\t\tdtb\napplication/x-dtbresource+xml\t\t\tres\napplication/x-dvi\t\t\t\tdvi\napplication/x-envoy\t\t\t\tevy\napplication/x-eva\t\t\t\teva\napplication/x-font-bdf\t\t\t\tbdf\napplication/x-font-ghostscript\t\t\tgsf\napplication/x-font-linux-psf\t\t\tpsf\napplication/x-font-pcf\t\t\t\tpcf\napplication/x-font-snf\t\t\t\tsnf\napplication/x-font-type1\t\t\tpfa pfb pfm afm\napplication/x-freearc\t\t\t\tarc\napplication/x-futuresplash\t\t\tspl\napplication/x-gca-compressed\t\t\tgca\napplication/x-glulx\t\t\t\tulx\napplication/x-gnumeric\t\t\t\tgnumeric\napplication/x-gramps-xml\t\t\tgramps\napplication/x-gtar\t\t\t\tgtar\napplication/x-hdf\t\t\t\thdf\napplication/x-install-instructions\t\tinstall\napplication/x-iso9660-image\t\t\tiso\napplication/x-java-jnlp-file\t\t\tjnlp\napplication/x-latex\t\t\t\tlatex\napplication/x-lzh-compressed\t\t\tlzh lha\napplication/x-mie\t\t\t\tmie\napplication/x-mobipocket-ebook\t\t\tprc mobi\napplication/x-ms-application\t\t\tapplication\napplication/x-ms-shortcut\t\t\tlnk\napplication/x-ms-wmd\t\t\t\twmd\napplication/x-ms-wmz\t\t\t\twmz\napplication/x-ms-xbap\t\t\t\txbap\napplication/x-msaccess\t\t\t\tmdb\napplication/x-msbinder\t\t\t\tobd\napplication/x-mscardfile\t\t\tcrd\napplication/x-msclip\t\t\t\tclp\napplication/x-msdownload\t\t\texe dll com bat msi\napplication/x-msmediaview\t\t\tmvb m13 m14\napplication/x-msmetafile\t\t\twmf wmz emf emz\napplication/x-msmoney\t\t\t\tmny\napplication/x-mspublisher\t\t\tpub\napplication/x-msschedule\t\t\tscd\napplication/x-msterminal\t\t\ttrm\napplication/x-mswrite\t\t\t\twri\napplication/x-netcdf\t\t\t\tnc cdf\napplication/x-nzb\t\t\t\tnzb\napplication/x-pkcs12\t\t\t\tp12 pfx\napplication/x-pkcs7-certificates\t\tp7b spc\napplication/x-pkcs7-certreqresp\t\t\tp7r\napplication/x-rar-compressed\t\t\trar\napplication/x-research-info-systems\t\tris\napplication/x-sh\t\t\t\tsh\napplication/x-shar\t\t\t\tshar\napplication/x-shockwave-flash\t\t\tswf\napplication/x-silverlight-app\t\t\txap\napplication/x-sql\t\t\t\tsql\napplication/x-stuffit\t\t\t\tsit\napplication/x-stuffitx\t\t\t\tsitx\napplication/x-subrip\t\t\t\tsrt\napplication/x-sv4cpio\t\t\t\tsv4cpio\napplication/x-sv4crc\t\t\t\tsv4crc\napplication/x-t3vm-image\t\t\tt3\napplication/x-tads\t\t\t\tgam\napplication/x-tar\t\t\t\ttar\napplication/x-tcl\t\t\t\ttcl\napplication/x-tex\t\t\t\ttex\napplication/x-tex-tfm\t\t\t\ttfm\napplication/x-texinfo\t\t\t\ttexinfo texi\napplication/x-tgif\t\t\t\tobj\napplication/x-ustar\t\t\t\tustar\napplication/x-wais-source\t\t\tsrc\napplication/x-x509-ca-cert\t\t\tder crt\napplication/x-xfig\t\t\t\tfig\napplication/x-xliff+xml\t\t\t\txlf\napplication/x-xpinstall\t\t\t\txpi\napplication/x-xz\t\t\t\txz\napplication/x-zmachine\t\t\t\tz1 z2 z3 z4 z5 z6 z7 z8\napplication/xaml+xml\t\t\t\txaml\napplication/xcap-diff+xml\t\t\txdf\napplication/xenc+xml\t\t\t\txenc\napplication/xhtml+xml\t\t\t\txhtml xht\napplication/xml\t\t\t\t\txml xsl\napplication/xml-dtd\t\t\t\tdtd\napplication/xop+xml\t\t\t\txop\napplication/xproc+xml\t\t\t\txpl\napplication/xslt+xml\t\t\t\txslt\napplication/xspf+xml\t\t\t\txspf\napplication/xv+xml\t\t\t\tmxml xhvml xvml xvm\napplication/yang\t\t\t\tyang\napplication/yin+xml\t\t\t\tyin\napplication/zip\t\t\t\t\tzip\naudio/adpcm\t\t\t\t\tadp\naudio/basic\t\t\t\t\tau snd\naudio/midi\t\t\t\t\tmid midi kar rmi\naudio/mp4\t\t\t\t\tm4a mp4a\naudio/mpeg\t\t\t\t\tmpga mp2 mp2a mp3 m2a m3a\naudio/ogg\t\t\t\t\toga ogg spx\naudio/s3m\t\t\t\t\ts3m\naudio/silk\t\t\t\t\tsil\naudio/vnd.dece.audio\t\t\t\tuva uvva\naudio/vnd.digital-winds\t\t\t\teol\naudio/vnd.dra\t\t\t\t\tdra\naudio/vnd.dts\t\t\t\t\tdts\naudio/vnd.dts.hd\t\t\t\tdtshd\naudio/vnd.lucent.voice\t\t\t\tlvp\naudio/vnd.ms-playready.media.pya\t\tpya\naudio/vnd.nuera.ecelp4800\t\t\tecelp4800\naudio/vnd.nuera.ecelp7470\t\t\tecelp7470\naudio/vnd.nuera.ecelp9600\t\t\tecelp9600\naudio/vnd.rip\t\t\t\t\trip\naudio/webm\t\t\t\t\tweba\naudio/x-aac\t\t\t\t\taac\naudio/x-aiff\t\t\t\t\taif aiff aifc\naudio/x-caf\t\t\t\t\tcaf\naudio/x-flac\t\t\t\t\tflac\naudio/x-matroska\t\t\t\tmka\naudio/x-mpegurl\t\t\t\t\tm3u\naudio/x-ms-wax\t\t\t\t\twax\naudio/x-ms-wma\t\t\t\t\twma\naudio/x-pn-realaudio\t\t\t\tram ra\naudio/x-pn-realaudio-plugin\t\t\trmp\naudio/x-wav\t\t\t\t\twav\naudio/xm\t\t\t\t\txm\nchemical/x-cdx\t\t\t\t\tcdx\nchemical/x-cif\t\t\t\t\tcif\nchemical/x-cmdf\t\t\t\t\tcmdf\nchemical/x-cml\t\t\t\t\tcml\nchemical/x-csml\t\t\t\t\tcsml\nchemical/x-xyz\t\t\t\t\txyz\nfont/collection\t\t\t\t\tttc\nfont/otf\t\t\t\t\totf\nfont/ttf\t\t\t\t\tttf\nfont/woff\t\t\t\t\twoff\nfont/woff2\t\t\t\t\twoff2\nimage/bmp\t\t\t\t\tbmp\nimage/cgm\t\t\t\t\tcgm\nimage/g3fax\t\t\t\t\tg3\nimage/gif\t\t\t\t\tgif\nimage/ief\t\t\t\t\tief\nimage/jpeg\t\t\t\t\tjpeg jpg jpe\nimage/ktx\t\t\t\t\tktx\nimage/png\t\t\t\t\tpng\nimage/prs.btif\t\t\t\t\tbtif\nimage/sgi\t\t\t\t\tsgi\nimage/svg+xml\t\t\t\t\tsvg svgz\nimage/tiff\t\t\t\t\ttiff tif\nimage/vnd.adobe.photoshop\t\t\tpsd\nimage/vnd.dece.graphic\t\t\t\tuvi uvvi uvg uvvg\nimage/vnd.djvu\t\t\t\t\tdjvu djv\nimage/vnd.dvb.subtitle\t\t\t\tsub\nimage/vnd.dwg\t\t\t\t\tdwg\nimage/vnd.dxf\t\t\t\t\tdxf\nimage/vnd.fastbidsheet\t\t\t\tfbs\nimage/vnd.fpx\t\t\t\t\tfpx\nimage/vnd.fst\t\t\t\t\tfst\nimage/vnd.fujixerox.edmics-mmr\t\t\tmmr\nimage/vnd.fujixerox.edmics-rlc\t\t\trlc\nimage/vnd.ms-modi\t\t\t\tmdi\nimage/vnd.ms-photo\t\t\t\twdp\nimage/vnd.net-fpx\t\t\t\tnpx\nimage/vnd.wap.wbmp\t\t\t\twbmp\nimage/vnd.xiff\t\t\t\t\txif\nimage/webp\t\t\t\t\twebp\nimage/x-3ds\t\t\t\t\t3ds\nimage/x-cmu-raster\t\t\t\tras\nimage/x-cmx\t\t\t\t\tcmx\nimage/x-freehand\t\t\t\tfh fhc fh4 fh5 fh7\nimage/x-icon\t\t\t\t\tico\nimage/x-mrsid-image\t\t\t\tsid\nimage/x-pcx\t\t\t\t\tpcx\nimage/x-pict\t\t\t\t\tpic pct\nimage/x-portable-anymap\t\t\t\tpnm\nimage/x-portable-bitmap\t\t\t\tpbm\nimage/x-portable-graymap\t\t\tpgm\nimage/x-portable-pixmap\t\t\t\tppm\nimage/x-rgb\t\t\t\t\trgb\nimage/x-tga\t\t\t\t\ttga\nimage/x-xbitmap\t\t\t\t\txbm\nimage/x-xpixmap\t\t\t\t\txpm\nimage/x-xwindowdump\t\t\t\txwd\nmessage/rfc822\t\t\t\t\teml mime\nmodel/iges\t\t\t\t\tigs iges\nmodel/mesh\t\t\t\t\tmsh mesh silo\nmodel/vnd.collada+xml\t\t\t\tdae\nmodel/vnd.dwf\t\t\t\t\tdwf\nmodel/vnd.gdl\t\t\t\t\tgdl\nmodel/vnd.gtw\t\t\t\t\tgtw\nmodel/vnd.mts\t\t\t\t\tmts\nmodel/vnd.vtu\t\t\t\t\tvtu\nmodel/vrml\t\t\t\t\twrl vrml\nmodel/x3d+binary\t\t\t\tx3db x3dbz\nmodel/x3d+vrml\t\t\t\t\tx3dv x3dvz\nmodel/x3d+xml\t\t\t\t\tx3d x3dz\ntext/cache-manifest\t\t\t\tappcache\ntext/calendar\t\t\t\t\tics ifb\ntext/css\t\t\t\t\tcss\ntext/csv\t\t\t\t\tcsv\ntext/html\t\t\t\t\thtml htm\ntext/n3\t\t\t\t\t\tn3\ntext/plain\t\t\t\t\ttxt text conf def list log in\ntext/prs.lines.tag\t\t\t\tdsc\ntext/richtext\t\t\t\t\trtx\ntext/sgml\t\t\t\t\tsgml sgm\ntext/tab-separated-values\t\t\ttsv\ntext/troff\t\t\t\t\tt tr roff man me ms\ntext/turtle\t\t\t\t\tttl\ntext/uri-list\t\t\t\t\turi uris urls\ntext/vcard\t\t\t\t\tvcard\ntext/vnd.curl\t\t\t\t\tcurl\ntext/vnd.curl.dcurl\t\t\t\tdcurl\ntext/vnd.curl.mcurl\t\t\t\tmcurl\ntext/vnd.curl.scurl\t\t\t\tscurl\ntext/vnd.dvb.subtitle\t\t\t\tsub\ntext/vnd.fly\t\t\t\t\tfly\ntext/vnd.fmi.flexstor\t\t\t\tflx\ntext/vnd.graphviz\t\t\t\tgv\ntext/vnd.in3d.3dml\t\t\t\t3dml\ntext/vnd.in3d.spot\t\t\t\tspot\ntext/vnd.sun.j2me.app-descriptor\t\tjad\ntext/vnd.wap.wml\t\t\t\twml\ntext/vnd.wap.wmlscript\t\t\t\twmls\ntext/x-asm\t\t\t\t\ts asm\ntext/x-c\t\t\t\t\tc cc cxx cpp h hh dic\ntext/x-fortran\t\t\t\t\tf for f77 f90\ntext/x-java-source\t\t\t\tjava\ntext/x-nfo\t\t\t\t\tnfo\ntext/x-opml\t\t\t\t\topml\ntext/x-pascal\t\t\t\t\tp pas\ntext/x-setext\t\t\t\t\tetx\ntext/x-sfv\t\t\t\t\tsfv\ntext/x-uuencode\t\t\t\t\tuu\ntext/x-vcalendar\t\t\t\tvcs\ntext/x-vcard\t\t\t\t\tvcf\nvideo/3gpp\t\t\t\t\t3gp\nvideo/3gpp2\t\t\t\t\t3g2\nvideo/h261\t\t\t\t\th261\nvideo/h263\t\t\t\t\th263\nvideo/h264\t\t\t\t\th264\nvideo/jpeg\t\t\t\t\tjpgv\nvideo/jpm\t\t\t\t\tjpm jpgm\nvideo/mj2\t\t\t\t\tmj2 mjp2\nvideo/mp4\t\t\t\t\tmp4 mp4v mpg4\nvideo/mpeg\t\t\t\t\tmpeg mpg mpe m1v m2v\nvideo/ogg\t\t\t\t\togv\nvideo/quicktime\t\t\t\t\tqt mov\nvideo/vnd.dece.hd\t\t\t\tuvh uvvh\nvideo/vnd.dece.mobile\t\t\t\tuvm uvvm\nvideo/vnd.dece.pd\t\t\t\tuvp uvvp\nvideo/vnd.dece.sd\t\t\t\tuvs uvvs\nvideo/vnd.dece.video\t\t\t\tuvv uvvv\nvideo/vnd.dvb.file\t\t\t\tdvb\nvideo/vnd.fvt\t\t\t\t\tfvt\nvideo/vnd.mpegurl\t\t\t\tmxu m4u\nvideo/vnd.ms-playready.media.pyv\t\tpyv\nvideo/vnd.uvvu.mp4\t\t\t\tuvu uvvu\nvideo/vnd.vivo\t\t\t\t\tviv\nvideo/webm\t\t\t\t\twebm\nvideo/x-f4v\t\t\t\t\tf4v\nvideo/x-fli\t\t\t\t\tfli\nvideo/x-flv\t\t\t\t\tflv\nvideo/x-m4v\t\t\t\t\tm4v\nvideo/x-matroska\t\t\t\tmkv mk3d mks\nvideo/x-mng\t\t\t\t\tmng\nvideo/x-ms-asf\t\t\t\t\tasf asx\nvideo/x-ms-vob\t\t\t\t\tvob\nvideo/x-ms-wm\t\t\t\t\twm\nvideo/x-ms-wmv\t\t\t\t\twmv\nvideo/x-ms-wmx\t\t\t\t\twmx\nvideo/x-ms-wvx\t\t\t\t\twvx\nvideo/x-msvideo\t\t\t\t\tavi\nvideo/x-sgi-movie\t\t\t\tmovie\nvideo/x-smv\t\t\t\t\tsmv\nx-conference/x-cooltalk\t\t\t\tice\n";

const map = new Map();

mime_raw.split('\n').forEach((row) => {
	const match = /(.+?)\t+(.+)/.exec(row);
	if (!match) return;

	const type = match[1];
	const extensions = match[2].split(' ');

	extensions.forEach(ext => {
		map.set(ext, type);
	});
});

function lookup(file) {
	const match = /\.([^\.]+)$/.exec(file);
	return match && map.get(match[1]);
}

function middleware(opts


 = {}) {
	const { session, ignore } = opts;

	let emitted_basepath = false;

	return compose_handlers(ignore, [
		(req, res, next) => {
			if (req.baseUrl === undefined) {
				let { originalUrl } = req;
				if (req.url === '/' && originalUrl[originalUrl.length - 1] !== '/') {
					originalUrl += '/';
				}

				req.baseUrl = originalUrl
					? originalUrl.slice(0, -req.url.length)
					: '';
			}

			if (!emitted_basepath && process.send) {
				process.send({
					__sapper__: true,
					event: 'basepath',
					basepath: req.baseUrl
				});

				emitted_basepath = true;
			}

			if (req.path === undefined) {
				req.path = req.url.replace(/\?.*/, '');
			}

			next();
		},

		fs.existsSync(path.join(build_dir, 'service-worker.js')) && serve({
			pathname: '/service-worker.js',
			cache_control: 'no-cache, no-store, must-revalidate'
		}),

		fs.existsSync(path.join(build_dir, 'service-worker.js.map')) && serve({
			pathname: '/service-worker.js.map',
			cache_control: 'no-cache, no-store, must-revalidate'
		}),

		serve({
			prefix: '/client/',
			cache_control:  'max-age=31536000, immutable'
		}),

		get_server_route_handler(manifest.server_routes),

		get_page_handler(manifest, session || noop$1)
	].filter(Boolean));
}

function compose_handlers(ignore, handlers) {
	const total = handlers.length;

	function nth_handler(n, req, res, next) {
		if (n >= total) {
			return next();
		}

		handlers[n](req, res, () => nth_handler(n+1, req, res, next));
	}

	return !ignore
		? (req, res, next) => nth_handler(0, req, res, next)
		: (req, res, next) => {
			if (should_ignore(req.path, ignore)) {
				next();
			} else {
				nth_handler(0, req, res, next);
			}
		};
}

function should_ignore(uri, val) {
	if (Array.isArray(val)) return val.some(x => should_ignore(uri, x));
	if (val instanceof RegExp) return val.test(uri);
	if (typeof val === 'function') return val(uri);
	return uri.startsWith(val.charCodeAt(0) === 47 ? val : `/${val}`);
}

function serve({ prefix, pathname, cache_control }



) {
	const filter = pathname
		? (req) => req.path === pathname
		: (req) => req.path.startsWith(prefix);

	const cache = new Map();

	const read =  (file) => (cache.has(file) ? cache : cache.set(file, fs.readFileSync(path.resolve(build_dir, file)))).get(file);

	return (req, res, next) => {
		if (filter(req)) {
			const type = lookup(req.path);

			try {
				const file = decodeURIComponent(req.path.slice(1));
				const data = read(file);

				res.setHeader('Content-Type', type);
				res.setHeader('Cache-Control', cache_control);
				res.end(data);
			} catch (err) {
				res.statusCode = 404;
				res.end('not found');
			}
		} else {
			next();
		}
	};
}

function noop$1(){}

const { PORT, NODE_ENV } = process.env;
const dev = NODE_ENV === 'development';

polka() // You can also use Express
	.use(
		compression({ threshold: 0 }),
		sirv('static', { dev }),
		middleware()
	)
	.listen(PORT, err => {
		if (err) console.log('error', err);
	});
