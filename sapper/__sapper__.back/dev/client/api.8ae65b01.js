import './index.1eb00da2.js';

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

function unwrapExports (x) {
	return x && x.__esModule && Object.prototype.hasOwnProperty.call(x, 'default') ? x['default'] : x;
}

function createCommonjsModule(fn, module) {
	return module = { exports: {} }, fn(module, module.exports), module.exports;
}

var browser = createCommonjsModule(function (module, exports) {

// ref: https://github.com/tc39/proposal-global
var getGlobal = function () {
	// the only reliable means to get the global object is
	// `Function('return this')()`
	// However, this causes CSP violations in Chrome apps.
	if (typeof self !== 'undefined') { return self; }
	if (typeof window !== 'undefined') { return window; }
	if (typeof global !== 'undefined') { return global; }
	throw new Error('unable to locate global object');
};

var global = getGlobal();

module.exports = exports = global.fetch;

// Needed for TypeScript and Webpack.
exports.default = global.fetch.bind(global);

exports.Headers = global.Headers;
exports.Request = global.Request;
exports.Response = global.Response;
});
var browser_1 = browser.Headers;
var browser_2 = browser.Request;
var browser_3 = browser.Response;

const API_SERVER_HOST = "https://tsu.gg:3000";
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
    res = await browser(path, params);
  if(res.status != 200)
    throw res.status;
  else return res;
}
async function fetch_cbor(path) {
  let res = await _fetch(path);
  let body = await res.arrayBuffer();
  return CBOR.decode(body);
}
const API = {
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
      search_or_ids = "ids[]=" + search_or_ids.join("&ids[]=");
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
};

export { API as A, createCommonjsModule as c, unwrapExports as u };
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiYXBpLjhhZTY1YjAxLmpzIiwic291cmNlcyI6WyIuLi8uLi8uLi9zcmMvY2Jvci5qcyIsIi4uLy4uLy4uL25vZGVfbW9kdWxlcy9ub2RlLWZldGNoL2Jyb3dzZXIuanMiLCIuLi8uLi8uLi9zcmMvYXBpLmpzIl0sInNvdXJjZXNDb250ZW50IjpbIi8qXG4gKiBUaGUgTUlUIExpY2Vuc2UgKE1JVClcbiAqXG4gKiBDb3B5cmlnaHQgKGMpIDIwMTQtMjAxNiBQYXRyaWNrIEdhbnN0ZXJlciA8cGFyb2dhQHBhcm9nYS5jb20+XG4gKlxuICogUGVybWlzc2lvbiBpcyBoZXJlYnkgZ3JhbnRlZCwgZnJlZSBvZiBjaGFyZ2UsIHRvIGFueSBwZXJzb24gb2J0YWluaW5nIGEgY29weVxuICogb2YgdGhpcyBzb2Z0d2FyZSBhbmQgYXNzb2NpYXRlZCBkb2N1bWVudGF0aW9uIGZpbGVzICh0aGUgXCJTb2Z0d2FyZVwiKSwgdG8gZGVhbFxuICogaW4gdGhlIFNvZnR3YXJlIHdpdGhvdXQgcmVzdHJpY3Rpb24sIGluY2x1ZGluZyB3aXRob3V0IGxpbWl0YXRpb24gdGhlIHJpZ2h0c1xuICogdG8gdXNlLCBjb3B5LCBtb2RpZnksIG1lcmdlLCBwdWJsaXNoLCBkaXN0cmlidXRlLCBzdWJsaWNlbnNlLCBhbmQvb3Igc2VsbFxuICogY29waWVzIG9mIHRoZSBTb2Z0d2FyZSwgYW5kIHRvIHBlcm1pdCBwZXJzb25zIHRvIHdob20gdGhlIFNvZnR3YXJlIGlzXG4gKiBmdXJuaXNoZWQgdG8gZG8gc28sIHN1YmplY3QgdG8gdGhlIGZvbGxvd2luZyBjb25kaXRpb25zOlxuICpcbiAqIFRoZSBhYm92ZSBjb3B5cmlnaHQgbm90aWNlIGFuZCB0aGlzIHBlcm1pc3Npb24gbm90aWNlIHNoYWxsIGJlIGluY2x1ZGVkIGluIGFsbFxuICogY29waWVzIG9yIHN1YnN0YW50aWFsIHBvcnRpb25zIG9mIHRoZSBTb2Z0d2FyZS5cbiAqXG4gKiBUSEUgU09GVFdBUkUgSVMgUFJPVklERUQgXCJBUyBJU1wiLCBXSVRIT1VUIFdBUlJBTlRZIE9GIEFOWSBLSU5ELCBFWFBSRVNTIE9SXG4gKiBJTVBMSUVELCBJTkNMVURJTkcgQlVUIE5PVCBMSU1JVEVEIFRPIFRIRSBXQVJSQU5USUVTIE9GIE1FUkNIQU5UQUJJTElUWSxcbiAqIEZJVE5FU1MgRk9SIEEgUEFSVElDVUxBUiBQVVJQT1NFIEFORCBOT05JTkZSSU5HRU1FTlQuIElOIE5PIEVWRU5UIFNIQUxMIFRIRVxuICogQVVUSE9SUyBPUiBDT1BZUklHSFQgSE9MREVSUyBCRSBMSUFCTEUgRk9SIEFOWSBDTEFJTSwgREFNQUdFUyBPUiBPVEhFUlxuICogTElBQklMSVRZLCBXSEVUSEVSIElOIEFOIEFDVElPTiBPRiBDT05UUkFDVCwgVE9SVCBPUiBPVEhFUldJU0UsIEFSSVNJTkcgRlJPTSxcbiAqIE9VVCBPRiBPUiBJTiBDT05ORUNUSU9OIFdJVEggVEhFIFNPRlRXQVJFIE9SIFRIRSBVU0UgT1IgT1RIRVIgREVBTElOR1MgSU4gVEhFXG4gKiBTT0ZUV0FSRS5cbiAqL1xuXG52YXIgUE9XXzJfMjQgPSA1Ljk2MDQ2NDQ3NzUzOTA2M2UtOCxcbiAgICBQT1dfMl8zMiA9IDQyOTQ5NjcyOTYsXG4gICAgUE9XXzJfNTMgPSA5MDA3MTk5MjU0NzQwOTkyO1xuXG5mdW5jdGlvbiBlbmNvZGUodmFsdWUpIHtcbiAgdmFyIGRhdGEgPSBuZXcgQXJyYXlCdWZmZXIoMjU2KTtcbiAgdmFyIGRhdGFWaWV3ID0gbmV3IERhdGFWaWV3KGRhdGEpO1xuICB2YXIgbGFzdExlbmd0aDtcbiAgdmFyIG9mZnNldCA9IDA7XG5cbiAgZnVuY3Rpb24gcHJlcGFyZVdyaXRlKGxlbmd0aCkge1xuICAgIHZhciBuZXdCeXRlTGVuZ3RoID0gZGF0YS5ieXRlTGVuZ3RoO1xuICAgIHZhciByZXF1aXJlZExlbmd0aCA9IG9mZnNldCArIGxlbmd0aDtcbiAgICB3aGlsZSAobmV3Qnl0ZUxlbmd0aCA8IHJlcXVpcmVkTGVuZ3RoKVxuICAgICAgbmV3Qnl0ZUxlbmd0aCA8PD0gMTtcbiAgICBpZiAobmV3Qnl0ZUxlbmd0aCAhPT0gZGF0YS5ieXRlTGVuZ3RoKSB7XG4gICAgICB2YXIgb2xkRGF0YVZpZXcgPSBkYXRhVmlldztcbiAgICAgIGRhdGEgPSBuZXcgQXJyYXlCdWZmZXIobmV3Qnl0ZUxlbmd0aCk7XG4gICAgICBkYXRhVmlldyA9IG5ldyBEYXRhVmlldyhkYXRhKTtcbiAgICAgIHZhciB1aW50MzJjb3VudCA9IChvZmZzZXQgKyAzKSA+PiAyO1xuICAgICAgZm9yICh2YXIgaSA9IDA7IGkgPCB1aW50MzJjb3VudDsgKytpKVxuICAgICAgICBkYXRhVmlldy5zZXRVaW50MzIoaSA8PCAyLCBvbGREYXRhVmlldy5nZXRVaW50MzIoaSA8PCAyKSk7XG4gICAgfVxuXG4gICAgbGFzdExlbmd0aCA9IGxlbmd0aDtcbiAgICByZXR1cm4gZGF0YVZpZXc7XG4gIH1cbiAgZnVuY3Rpb24gY29tbWl0V3JpdGUoKSB7XG4gICAgb2Zmc2V0ICs9IGxhc3RMZW5ndGg7XG4gIH1cbiAgZnVuY3Rpb24gd3JpdGVGbG9hdDY0KHZhbHVlKSB7XG4gICAgY29tbWl0V3JpdGUocHJlcGFyZVdyaXRlKDgpLnNldEZsb2F0NjQob2Zmc2V0LCB2YWx1ZSkpO1xuICB9XG4gIGZ1bmN0aW9uIHdyaXRlVWludDgodmFsdWUpIHtcbiAgICBjb21taXRXcml0ZShwcmVwYXJlV3JpdGUoMSkuc2V0VWludDgob2Zmc2V0LCB2YWx1ZSkpO1xuICB9XG4gIGZ1bmN0aW9uIHdyaXRlVWludDhBcnJheSh2YWx1ZSkge1xuICAgIHZhciBkYXRhVmlldyA9IHByZXBhcmVXcml0ZSh2YWx1ZS5sZW5ndGgpO1xuICAgIGZvciAodmFyIGkgPSAwOyBpIDwgdmFsdWUubGVuZ3RoOyArK2kpXG4gICAgICBkYXRhVmlldy5zZXRVaW50OChvZmZzZXQgKyBpLCB2YWx1ZVtpXSk7XG4gICAgY29tbWl0V3JpdGUoKTtcbiAgfVxuICBmdW5jdGlvbiB3cml0ZVVpbnQxNih2YWx1ZSkge1xuICAgIGNvbW1pdFdyaXRlKHByZXBhcmVXcml0ZSgyKS5zZXRVaW50MTYob2Zmc2V0LCB2YWx1ZSkpO1xuICB9XG4gIGZ1bmN0aW9uIHdyaXRlVWludDMyKHZhbHVlKSB7XG4gICAgY29tbWl0V3JpdGUocHJlcGFyZVdyaXRlKDQpLnNldFVpbnQzMihvZmZzZXQsIHZhbHVlKSk7XG4gIH1cbiAgZnVuY3Rpb24gd3JpdGVVaW50NjQodmFsdWUpIHtcbiAgICB2YXIgbG93ID0gdmFsdWUgJSBQT1dfMl8zMjtcbiAgICB2YXIgaGlnaCA9ICh2YWx1ZSAtIGxvdykgLyBQT1dfMl8zMjtcbiAgICB2YXIgZGF0YVZpZXcgPSBwcmVwYXJlV3JpdGUoOCk7XG4gICAgZGF0YVZpZXcuc2V0VWludDMyKG9mZnNldCwgaGlnaCk7XG4gICAgZGF0YVZpZXcuc2V0VWludDMyKG9mZnNldCArIDQsIGxvdyk7XG4gICAgY29tbWl0V3JpdGUoKTtcbiAgfVxuICBmdW5jdGlvbiB3cml0ZVR5cGVBbmRMZW5ndGgodHlwZSwgbGVuZ3RoKSB7XG4gICAgaWYgKGxlbmd0aCA8IDI0KSB7XG4gICAgICB3cml0ZVVpbnQ4KHR5cGUgPDwgNSB8IGxlbmd0aCk7XG4gICAgfSBlbHNlIGlmIChsZW5ndGggPCAweDEwMCkge1xuICAgICAgd3JpdGVVaW50OCh0eXBlIDw8IDUgfCAyNCk7XG4gICAgICB3cml0ZVVpbnQ4KGxlbmd0aCk7XG4gICAgfSBlbHNlIGlmIChsZW5ndGggPCAweDEwMDAwKSB7XG4gICAgICB3cml0ZVVpbnQ4KHR5cGUgPDwgNSB8IDI1KTtcbiAgICAgIHdyaXRlVWludDE2KGxlbmd0aCk7XG4gICAgfSBlbHNlIGlmIChsZW5ndGggPCAweDEwMDAwMDAwMCkge1xuICAgICAgd3JpdGVVaW50OCh0eXBlIDw8IDUgfCAyNik7XG4gICAgICB3cml0ZVVpbnQzMihsZW5ndGgpO1xuICAgIH0gZWxzZSB7XG4gICAgICB3cml0ZVVpbnQ4KHR5cGUgPDwgNSB8IDI3KTtcbiAgICAgIHdyaXRlVWludDY0KGxlbmd0aCk7XG4gICAgfVxuICB9XG5cbiAgZnVuY3Rpb24gZW5jb2RlSXRlbSh2YWx1ZSkge1xuICAgIHZhciBpO1xuXG4gICAgaWYgKHZhbHVlID09PSBmYWxzZSlcbiAgICAgIHJldHVybiB3cml0ZVVpbnQ4KDB4ZjQpO1xuICAgIGlmICh2YWx1ZSA9PT0gdHJ1ZSlcbiAgICAgIHJldHVybiB3cml0ZVVpbnQ4KDB4ZjUpO1xuICAgIGlmICh2YWx1ZSA9PT0gbnVsbClcbiAgICAgIHJldHVybiB3cml0ZVVpbnQ4KDB4ZjYpO1xuICAgIGlmICh2YWx1ZSA9PT0gdW5kZWZpbmVkKVxuICAgICAgcmV0dXJuIHdyaXRlVWludDgoMHhmNyk7XG5cbiAgICBzd2l0Y2ggKHR5cGVvZiB2YWx1ZSkge1xuICAgICAgY2FzZSBcIm51bWJlclwiOlxuICAgICAgICBpZiAoTWF0aC5mbG9vcih2YWx1ZSkgPT09IHZhbHVlKSB7XG4gICAgICAgICAgaWYgKDAgPD0gdmFsdWUgJiYgdmFsdWUgPD0gUE9XXzJfNTMpXG4gICAgICAgICAgICByZXR1cm4gd3JpdGVUeXBlQW5kTGVuZ3RoKDAsIHZhbHVlKTtcbiAgICAgICAgICBpZiAoLVBPV18yXzUzIDw9IHZhbHVlICYmIHZhbHVlIDwgMClcbiAgICAgICAgICAgIHJldHVybiB3cml0ZVR5cGVBbmRMZW5ndGgoMSwgLSh2YWx1ZSArIDEpKTtcbiAgICAgICAgfVxuICAgICAgICB3cml0ZVVpbnQ4KDB4ZmIpO1xuICAgICAgICByZXR1cm4gd3JpdGVGbG9hdDY0KHZhbHVlKTtcblxuICAgICAgY2FzZSBcInN0cmluZ1wiOlxuICAgICAgICB2YXIgdXRmOGRhdGEgPSBbXTtcbiAgICAgICAgZm9yIChpID0gMDsgaSA8IHZhbHVlLmxlbmd0aDsgKytpKSB7XG4gICAgICAgICAgdmFyIGNoYXJDb2RlID0gdmFsdWUuY2hhckNvZGVBdChpKTtcbiAgICAgICAgICBpZiAoY2hhckNvZGUgPCAweDgwKSB7XG4gICAgICAgICAgICB1dGY4ZGF0YS5wdXNoKGNoYXJDb2RlKTtcbiAgICAgICAgICB9IGVsc2UgaWYgKGNoYXJDb2RlIDwgMHg4MDApIHtcbiAgICAgICAgICAgIHV0ZjhkYXRhLnB1c2goMHhjMCB8IGNoYXJDb2RlID4+IDYpO1xuICAgICAgICAgICAgdXRmOGRhdGEucHVzaCgweDgwIHwgY2hhckNvZGUgJiAweDNmKTtcbiAgICAgICAgICB9IGVsc2UgaWYgKGNoYXJDb2RlIDwgMHhkODAwKSB7XG4gICAgICAgICAgICB1dGY4ZGF0YS5wdXNoKDB4ZTAgfCBjaGFyQ29kZSA+PiAxMik7XG4gICAgICAgICAgICB1dGY4ZGF0YS5wdXNoKDB4ODAgfCAoY2hhckNvZGUgPj4gNikgICYgMHgzZik7XG4gICAgICAgICAgICB1dGY4ZGF0YS5wdXNoKDB4ODAgfCBjaGFyQ29kZSAmIDB4M2YpO1xuICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICBjaGFyQ29kZSA9IChjaGFyQ29kZSAmIDB4M2ZmKSA8PCAxMDtcbiAgICAgICAgICAgIGNoYXJDb2RlIHw9IHZhbHVlLmNoYXJDb2RlQXQoKytpKSAmIDB4M2ZmO1xuICAgICAgICAgICAgY2hhckNvZGUgKz0gMHgxMDAwMDtcblxuICAgICAgICAgICAgdXRmOGRhdGEucHVzaCgweGYwIHwgY2hhckNvZGUgPj4gMTgpO1xuICAgICAgICAgICAgdXRmOGRhdGEucHVzaCgweDgwIHwgKGNoYXJDb2RlID4+IDEyKSAgJiAweDNmKTtcbiAgICAgICAgICAgIHV0ZjhkYXRhLnB1c2goMHg4MCB8IChjaGFyQ29kZSA+PiA2KSAgJiAweDNmKTtcbiAgICAgICAgICAgIHV0ZjhkYXRhLnB1c2goMHg4MCB8IGNoYXJDb2RlICYgMHgzZik7XG4gICAgICAgICAgfVxuICAgICAgICB9XG5cbiAgICAgICAgd3JpdGVUeXBlQW5kTGVuZ3RoKDMsIHV0ZjhkYXRhLmxlbmd0aCk7XG4gICAgICAgIHJldHVybiB3cml0ZVVpbnQ4QXJyYXkodXRmOGRhdGEpO1xuXG4gICAgICBkZWZhdWx0OlxuICAgICAgICB2YXIgbGVuZ3RoO1xuICAgICAgICBpZiAoQXJyYXkuaXNBcnJheSh2YWx1ZSkpIHtcbiAgICAgICAgICBsZW5ndGggPSB2YWx1ZS5sZW5ndGg7XG4gICAgICAgICAgd3JpdGVUeXBlQW5kTGVuZ3RoKDQsIGxlbmd0aCk7XG4gICAgICAgICAgZm9yIChpID0gMDsgaSA8IGxlbmd0aDsgKytpKVxuICAgICAgICAgICAgZW5jb2RlSXRlbSh2YWx1ZVtpXSk7XG4gICAgICAgIH0gZWxzZSBpZiAodmFsdWUgaW5zdGFuY2VvZiBVaW50OEFycmF5KSB7XG4gICAgICAgICAgd3JpdGVUeXBlQW5kTGVuZ3RoKDIsIHZhbHVlLmxlbmd0aCk7XG4gICAgICAgICAgd3JpdGVVaW50OEFycmF5KHZhbHVlKTtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICB2YXIga2V5cyA9IE9iamVjdC5rZXlzKHZhbHVlKTtcbiAgICAgICAgICBsZW5ndGggPSBrZXlzLmxlbmd0aDtcbiAgICAgICAgICB3cml0ZVR5cGVBbmRMZW5ndGgoNSwgbGVuZ3RoKTtcbiAgICAgICAgICBmb3IgKGkgPSAwOyBpIDwgbGVuZ3RoOyArK2kpIHtcbiAgICAgICAgICAgIHZhciBrZXkgPSBrZXlzW2ldO1xuICAgICAgICAgICAgZW5jb2RlSXRlbShrZXkpO1xuICAgICAgICAgICAgZW5jb2RlSXRlbSh2YWx1ZVtrZXldKTtcbiAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICB9XG4gIH1cblxuICBlbmNvZGVJdGVtKHZhbHVlKTtcblxuICBpZiAoXCJzbGljZVwiIGluIGRhdGEpXG4gICAgcmV0dXJuIGRhdGEuc2xpY2UoMCwgb2Zmc2V0KTtcblxuICB2YXIgcmV0ID0gbmV3IEFycmF5QnVmZmVyKG9mZnNldCk7XG4gIHZhciByZXRWaWV3ID0gbmV3IERhdGFWaWV3KHJldCk7XG4gIGZvciAodmFyIGkgPSAwOyBpIDwgb2Zmc2V0OyArK2kpXG4gICAgcmV0Vmlldy5zZXRVaW50OChpLCBkYXRhVmlldy5nZXRVaW50OChpKSk7XG4gIHJldHVybiByZXQ7XG59XG5cbmZ1bmN0aW9uIGRlY29kZShkYXRhLCB0YWdnZXIsIHNpbXBsZVZhbHVlKSB7XG4gIHZhciBkYXRhVmlldyA9IG5ldyBEYXRhVmlldyhkYXRhKTtcbiAgdmFyIG9mZnNldCA9IDA7XG5cbiAgaWYgKHR5cGVvZiB0YWdnZXIgIT09IFwiZnVuY3Rpb25cIilcbiAgICB0YWdnZXIgPSBmdW5jdGlvbih2YWx1ZSkgeyByZXR1cm4gdmFsdWU7IH07XG4gIGlmICh0eXBlb2Ygc2ltcGxlVmFsdWUgIT09IFwiZnVuY3Rpb25cIilcbiAgICBzaW1wbGVWYWx1ZSA9IGZ1bmN0aW9uKCkgeyByZXR1cm4gdW5kZWZpbmVkOyB9O1xuXG4gIGZ1bmN0aW9uIGNvbW1pdFJlYWQobGVuZ3RoLCB2YWx1ZSkge1xuICAgIG9mZnNldCArPSBsZW5ndGg7XG4gICAgcmV0dXJuIHZhbHVlO1xuICB9XG4gIGZ1bmN0aW9uIHJlYWRBcnJheUJ1ZmZlcihsZW5ndGgpIHtcbiAgICByZXR1cm4gY29tbWl0UmVhZChsZW5ndGgsIG5ldyBVaW50OEFycmF5KGRhdGEsIG9mZnNldCwgbGVuZ3RoKSk7XG4gIH1cbiAgZnVuY3Rpb24gcmVhZEZsb2F0MTYoKSB7XG4gICAgdmFyIHRlbXBBcnJheUJ1ZmZlciA9IG5ldyBBcnJheUJ1ZmZlcig0KTtcbiAgICB2YXIgdGVtcERhdGFWaWV3ID0gbmV3IERhdGFWaWV3KHRlbXBBcnJheUJ1ZmZlcik7XG4gICAgdmFyIHZhbHVlID0gcmVhZFVpbnQxNigpO1xuXG4gICAgdmFyIHNpZ24gPSB2YWx1ZSAmIDB4ODAwMDtcbiAgICB2YXIgZXhwb25lbnQgPSB2YWx1ZSAmIDB4N2MwMDtcbiAgICB2YXIgZnJhY3Rpb24gPSB2YWx1ZSAmIDB4MDNmZjtcblxuICAgIGlmIChleHBvbmVudCA9PT0gMHg3YzAwKVxuICAgICAgZXhwb25lbnQgPSAweGZmIDw8IDEwO1xuICAgIGVsc2UgaWYgKGV4cG9uZW50ICE9PSAwKVxuICAgICAgZXhwb25lbnQgKz0gKDEyNyAtIDE1KSA8PCAxMDtcbiAgICBlbHNlIGlmIChmcmFjdGlvbiAhPT0gMClcbiAgICAgIHJldHVybiAoc2lnbiA/IC0xIDogMSkgKiBmcmFjdGlvbiAqIFBPV18yXzI0O1xuXG4gICAgdGVtcERhdGFWaWV3LnNldFVpbnQzMigwLCBzaWduIDw8IDE2IHwgZXhwb25lbnQgPDwgMTMgfCBmcmFjdGlvbiA8PCAxMyk7XG4gICAgcmV0dXJuIHRlbXBEYXRhVmlldy5nZXRGbG9hdDMyKDApO1xuICB9XG4gIGZ1bmN0aW9uIHJlYWRGbG9hdDMyKCkge1xuICAgIHJldHVybiBjb21taXRSZWFkKDQsIGRhdGFWaWV3LmdldEZsb2F0MzIob2Zmc2V0KSk7XG4gIH1cbiAgZnVuY3Rpb24gcmVhZEZsb2F0NjQoKSB7XG4gICAgcmV0dXJuIGNvbW1pdFJlYWQoOCwgZGF0YVZpZXcuZ2V0RmxvYXQ2NChvZmZzZXQpKTtcbiAgfVxuICBmdW5jdGlvbiByZWFkVWludDgoKSB7XG4gICAgcmV0dXJuIGNvbW1pdFJlYWQoMSwgZGF0YVZpZXcuZ2V0VWludDgob2Zmc2V0KSk7XG4gIH1cbiAgZnVuY3Rpb24gcmVhZFVpbnQxNigpIHtcbiAgICByZXR1cm4gY29tbWl0UmVhZCgyLCBkYXRhVmlldy5nZXRVaW50MTYob2Zmc2V0KSk7XG4gIH1cbiAgZnVuY3Rpb24gcmVhZFVpbnQzMigpIHtcbiAgICByZXR1cm4gY29tbWl0UmVhZCg0LCBkYXRhVmlldy5nZXRVaW50MzIob2Zmc2V0KSk7XG4gIH1cbiAgZnVuY3Rpb24gcmVhZFVpbnQ2NCgpIHtcbiAgICByZXR1cm4gcmVhZFVpbnQzMigpICogUE9XXzJfMzIgKyByZWFkVWludDMyKCk7XG4gIH1cbiAgZnVuY3Rpb24gcmVhZEJyZWFrKCkge1xuICAgIGlmIChkYXRhVmlldy5nZXRVaW50OChvZmZzZXQpICE9PSAweGZmKVxuICAgICAgcmV0dXJuIGZhbHNlO1xuICAgIG9mZnNldCArPSAxO1xuICAgIHJldHVybiB0cnVlO1xuICB9XG4gIGZ1bmN0aW9uIHJlYWRMZW5ndGgoYWRkaXRpb25hbEluZm9ybWF0aW9uKSB7XG4gICAgaWYgKGFkZGl0aW9uYWxJbmZvcm1hdGlvbiA8IDI0KVxuICAgICAgcmV0dXJuIGFkZGl0aW9uYWxJbmZvcm1hdGlvbjtcbiAgICBpZiAoYWRkaXRpb25hbEluZm9ybWF0aW9uID09PSAyNClcbiAgICAgIHJldHVybiByZWFkVWludDgoKTtcbiAgICBpZiAoYWRkaXRpb25hbEluZm9ybWF0aW9uID09PSAyNSlcbiAgICAgIHJldHVybiByZWFkVWludDE2KCk7XG4gICAgaWYgKGFkZGl0aW9uYWxJbmZvcm1hdGlvbiA9PT0gMjYpXG4gICAgICByZXR1cm4gcmVhZFVpbnQzMigpO1xuICAgIGlmIChhZGRpdGlvbmFsSW5mb3JtYXRpb24gPT09IDI3KVxuICAgICAgcmV0dXJuIHJlYWRVaW50NjQoKTtcbiAgICBpZiAoYWRkaXRpb25hbEluZm9ybWF0aW9uID09PSAzMSlcbiAgICAgIHJldHVybiAtMTtcbiAgICB0aHJvdyBcIkludmFsaWQgbGVuZ3RoIGVuY29kaW5nXCI7XG4gIH1cbiAgZnVuY3Rpb24gcmVhZEluZGVmaW5pdGVTdHJpbmdMZW5ndGgobWFqb3JUeXBlKSB7XG4gICAgdmFyIGluaXRpYWxCeXRlID0gcmVhZFVpbnQ4KCk7XG4gICAgaWYgKGluaXRpYWxCeXRlID09PSAweGZmKVxuICAgICAgcmV0dXJuIC0xO1xuICAgIHZhciBsZW5ndGggPSByZWFkTGVuZ3RoKGluaXRpYWxCeXRlICYgMHgxZik7XG4gICAgaWYgKGxlbmd0aCA8IDAgfHwgKGluaXRpYWxCeXRlID4+IDUpICE9PSBtYWpvclR5cGUpXG4gICAgICB0aHJvdyBcIkludmFsaWQgaW5kZWZpbml0ZSBsZW5ndGggZWxlbWVudFwiO1xuICAgIHJldHVybiBsZW5ndGg7XG4gIH1cblxuICBmdW5jdGlvbiBhcHBlbmRVdGYxNkRhdGEodXRmMTZkYXRhLCBsZW5ndGgpIHtcbiAgICBmb3IgKHZhciBpID0gMDsgaSA8IGxlbmd0aDsgKytpKSB7XG4gICAgICB2YXIgdmFsdWUgPSByZWFkVWludDgoKTtcbiAgICAgIGlmICh2YWx1ZSAmIDB4ODApIHtcbiAgICAgICAgaWYgKHZhbHVlIDwgMHhlMCkge1xuICAgICAgICAgIHZhbHVlID0gKHZhbHVlICYgMHgxZikgPDwgIDZcbiAgICAgICAgICAgICAgICB8IChyZWFkVWludDgoKSAmIDB4M2YpO1xuICAgICAgICAgIGxlbmd0aCAtPSAxO1xuICAgICAgICB9IGVsc2UgaWYgKHZhbHVlIDwgMHhmMCkge1xuICAgICAgICAgIHZhbHVlID0gKHZhbHVlICYgMHgwZikgPDwgMTJcbiAgICAgICAgICAgICAgICB8IChyZWFkVWludDgoKSAmIDB4M2YpIDw8IDZcbiAgICAgICAgICAgICAgICB8IChyZWFkVWludDgoKSAmIDB4M2YpO1xuICAgICAgICAgIGxlbmd0aCAtPSAyO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgIHZhbHVlID0gKHZhbHVlICYgMHgwZikgPDwgMThcbiAgICAgICAgICAgICAgICB8IChyZWFkVWludDgoKSAmIDB4M2YpIDw8IDEyXG4gICAgICAgICAgICAgICAgfCAocmVhZFVpbnQ4KCkgJiAweDNmKSA8PCA2XG4gICAgICAgICAgICAgICAgfCAocmVhZFVpbnQ4KCkgJiAweDNmKTtcbiAgICAgICAgICBsZW5ndGggLT0gMztcbiAgICAgICAgfVxuICAgICAgfVxuXG4gICAgICBpZiAodmFsdWUgPCAweDEwMDAwKSB7XG4gICAgICAgIHV0ZjE2ZGF0YS5wdXNoKHZhbHVlKTtcbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIHZhbHVlIC09IDB4MTAwMDA7XG4gICAgICAgIHV0ZjE2ZGF0YS5wdXNoKDB4ZDgwMCB8ICh2YWx1ZSA+PiAxMCkpO1xuICAgICAgICB1dGYxNmRhdGEucHVzaCgweGRjMDAgfCAodmFsdWUgJiAweDNmZikpO1xuICAgICAgfVxuICAgIH1cbiAgfVxuXG4gIGZ1bmN0aW9uIGRlY29kZUl0ZW0oKSB7XG4gICAgdmFyIGluaXRpYWxCeXRlID0gcmVhZFVpbnQ4KCk7XG4gICAgdmFyIG1ham9yVHlwZSA9IGluaXRpYWxCeXRlID4+IDU7XG4gICAgdmFyIGFkZGl0aW9uYWxJbmZvcm1hdGlvbiA9IGluaXRpYWxCeXRlICYgMHgxZjtcbiAgICB2YXIgaTtcbiAgICB2YXIgbGVuZ3RoO1xuXG4gICAgaWYgKG1ham9yVHlwZSA9PT0gNykge1xuICAgICAgc3dpdGNoIChhZGRpdGlvbmFsSW5mb3JtYXRpb24pIHtcbiAgICAgICAgY2FzZSAyNTpcbiAgICAgICAgICByZXR1cm4gcmVhZEZsb2F0MTYoKTtcbiAgICAgICAgY2FzZSAyNjpcbiAgICAgICAgICByZXR1cm4gcmVhZEZsb2F0MzIoKTtcbiAgICAgICAgY2FzZSAyNzpcbiAgICAgICAgICByZXR1cm4gcmVhZEZsb2F0NjQoKTtcbiAgICAgIH1cbiAgICB9XG5cbiAgICBsZW5ndGggPSByZWFkTGVuZ3RoKGFkZGl0aW9uYWxJbmZvcm1hdGlvbik7XG4gICAgaWYgKGxlbmd0aCA8IDAgJiYgKG1ham9yVHlwZSA8IDIgfHwgNiA8IG1ham9yVHlwZSkpXG4gICAgICB0aHJvdyBcIkludmFsaWQgbGVuZ3RoXCI7XG5cbiAgICBzd2l0Y2ggKG1ham9yVHlwZSkge1xuICAgICAgY2FzZSAwOlxuICAgICAgICByZXR1cm4gbGVuZ3RoO1xuICAgICAgY2FzZSAxOlxuICAgICAgICByZXR1cm4gLTEgLSBsZW5ndGg7XG4gICAgICBjYXNlIDI6XG4gICAgICAgIGlmIChsZW5ndGggPCAwKSB7XG4gICAgICAgICAgdmFyIGVsZW1lbnRzID0gW107XG4gICAgICAgICAgdmFyIGZ1bGxBcnJheUxlbmd0aCA9IDA7XG4gICAgICAgICAgd2hpbGUgKChsZW5ndGggPSByZWFkSW5kZWZpbml0ZVN0cmluZ0xlbmd0aChtYWpvclR5cGUpKSA+PSAwKSB7XG4gICAgICAgICAgICBmdWxsQXJyYXlMZW5ndGggKz0gbGVuZ3RoO1xuICAgICAgICAgICAgZWxlbWVudHMucHVzaChyZWFkQXJyYXlCdWZmZXIobGVuZ3RoKSk7XG4gICAgICAgICAgfVxuICAgICAgICAgIHZhciBmdWxsQXJyYXkgPSBuZXcgVWludDhBcnJheShmdWxsQXJyYXlMZW5ndGgpO1xuICAgICAgICAgIHZhciBmdWxsQXJyYXlPZmZzZXQgPSAwO1xuICAgICAgICAgIGZvciAoaSA9IDA7IGkgPCBlbGVtZW50cy5sZW5ndGg7ICsraSkge1xuICAgICAgICAgICAgZnVsbEFycmF5LnNldChlbGVtZW50c1tpXSwgZnVsbEFycmF5T2Zmc2V0KTtcbiAgICAgICAgICAgIGZ1bGxBcnJheU9mZnNldCArPSBlbGVtZW50c1tpXS5sZW5ndGg7XG4gICAgICAgICAgfVxuICAgICAgICAgIHJldHVybiBmdWxsQXJyYXk7XG4gICAgICAgIH1cbiAgICAgICAgcmV0dXJuIHJlYWRBcnJheUJ1ZmZlcihsZW5ndGgpO1xuICAgICAgY2FzZSAzOlxuICAgICAgICB2YXIgdXRmMTZkYXRhID0gW107XG4gICAgICAgIGlmIChsZW5ndGggPCAwKSB7XG4gICAgICAgICAgd2hpbGUgKChsZW5ndGggPSByZWFkSW5kZWZpbml0ZVN0cmluZ0xlbmd0aChtYWpvclR5cGUpKSA+PSAwKVxuICAgICAgICAgICAgYXBwZW5kVXRmMTZEYXRhKHV0ZjE2ZGF0YSwgbGVuZ3RoKTtcbiAgICAgICAgfSBlbHNlXG4gICAgICAgICAgYXBwZW5kVXRmMTZEYXRhKHV0ZjE2ZGF0YSwgbGVuZ3RoKTtcbiAgICAgICAgcmV0dXJuIFN0cmluZy5mcm9tQ2hhckNvZGUuYXBwbHkobnVsbCwgdXRmMTZkYXRhKTtcbiAgICAgIGNhc2UgNDpcbiAgICAgICAgdmFyIHJldEFycmF5O1xuICAgICAgICBpZiAobGVuZ3RoIDwgMCkge1xuICAgICAgICAgIHJldEFycmF5ID0gW107XG4gICAgICAgICAgd2hpbGUgKCFyZWFkQnJlYWsoKSlcbiAgICAgICAgICAgIHJldEFycmF5LnB1c2goZGVjb2RlSXRlbSgpKTtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICByZXRBcnJheSA9IG5ldyBBcnJheShsZW5ndGgpO1xuICAgICAgICAgIGZvciAoaSA9IDA7IGkgPCBsZW5ndGg7ICsraSlcbiAgICAgICAgICAgIHJldEFycmF5W2ldID0gZGVjb2RlSXRlbSgpO1xuICAgICAgICB9XG4gICAgICAgIHJldHVybiByZXRBcnJheTtcbiAgICAgIGNhc2UgNTpcbiAgICAgICAgdmFyIHJldE9iamVjdCA9IHt9O1xuICAgICAgICBmb3IgKGkgPSAwOyBpIDwgbGVuZ3RoIHx8IGxlbmd0aCA8IDAgJiYgIXJlYWRCcmVhaygpOyArK2kpIHtcbiAgICAgICAgICB2YXIga2V5ID0gZGVjb2RlSXRlbSgpO1xuICAgICAgICAgIHJldE9iamVjdFtrZXldID0gZGVjb2RlSXRlbSgpO1xuICAgICAgICB9XG4gICAgICAgIHJldHVybiByZXRPYmplY3Q7XG4gICAgICBjYXNlIDY6XG4gICAgICAgIHJldHVybiB0YWdnZXIoZGVjb2RlSXRlbSgpLCBsZW5ndGgpO1xuICAgICAgY2FzZSA3OlxuICAgICAgICBzd2l0Y2ggKGxlbmd0aCkge1xuICAgICAgICAgIGNhc2UgMjA6XG4gICAgICAgICAgICByZXR1cm4gZmFsc2U7XG4gICAgICAgICAgY2FzZSAyMTpcbiAgICAgICAgICAgIHJldHVybiB0cnVlO1xuICAgICAgICAgIGNhc2UgMjI6XG4gICAgICAgICAgICByZXR1cm4gbnVsbDtcbiAgICAgICAgICBjYXNlIDIzOlxuICAgICAgICAgICAgcmV0dXJuIHVuZGVmaW5lZDtcbiAgICAgICAgICBkZWZhdWx0OlxuICAgICAgICAgICAgcmV0dXJuIHNpbXBsZVZhbHVlKGxlbmd0aCk7XG4gICAgICAgIH1cbiAgICB9XG4gIH1cblxuICB2YXIgcmV0ID0gZGVjb2RlSXRlbSgpO1xuICBpZiAob2Zmc2V0ICE9PSBkYXRhLmJ5dGVMZW5ndGgpXG4gICAgdGhyb3cgXCJSZW1haW5pbmcgYnl0ZXNcIjtcbiAgcmV0dXJuIHJldDtcbn1cblxuZXhwb3J0IGNvbnN0IENCT1IgPSB7IGVuY29kZTogZW5jb2RlLCBkZWNvZGU6IGRlY29kZSB9O1xuXG4iLCJcInVzZSBzdHJpY3RcIjtcblxuLy8gcmVmOiBodHRwczovL2dpdGh1Yi5jb20vdGMzOS9wcm9wb3NhbC1nbG9iYWxcbnZhciBnZXRHbG9iYWwgPSBmdW5jdGlvbiAoKSB7XG5cdC8vIHRoZSBvbmx5IHJlbGlhYmxlIG1lYW5zIHRvIGdldCB0aGUgZ2xvYmFsIG9iamVjdCBpc1xuXHQvLyBgRnVuY3Rpb24oJ3JldHVybiB0aGlzJykoKWBcblx0Ly8gSG93ZXZlciwgdGhpcyBjYXVzZXMgQ1NQIHZpb2xhdGlvbnMgaW4gQ2hyb21lIGFwcHMuXG5cdGlmICh0eXBlb2Ygc2VsZiAhPT0gJ3VuZGVmaW5lZCcpIHsgcmV0dXJuIHNlbGY7IH1cblx0aWYgKHR5cGVvZiB3aW5kb3cgIT09ICd1bmRlZmluZWQnKSB7IHJldHVybiB3aW5kb3c7IH1cblx0aWYgKHR5cGVvZiBnbG9iYWwgIT09ICd1bmRlZmluZWQnKSB7IHJldHVybiBnbG9iYWw7IH1cblx0dGhyb3cgbmV3IEVycm9yKCd1bmFibGUgdG8gbG9jYXRlIGdsb2JhbCBvYmplY3QnKTtcbn1cblxudmFyIGdsb2JhbCA9IGdldEdsb2JhbCgpO1xuXG5tb2R1bGUuZXhwb3J0cyA9IGV4cG9ydHMgPSBnbG9iYWwuZmV0Y2g7XG5cbi8vIE5lZWRlZCBmb3IgVHlwZVNjcmlwdCBhbmQgV2VicGFjay5cbmV4cG9ydHMuZGVmYXVsdCA9IGdsb2JhbC5mZXRjaC5iaW5kKGdsb2JhbCk7XG5cbmV4cG9ydHMuSGVhZGVycyA9IGdsb2JhbC5IZWFkZXJzO1xuZXhwb3J0cy5SZXF1ZXN0ID0gZ2xvYmFsLlJlcXVlc3Q7XG5leHBvcnRzLlJlc3BvbnNlID0gZ2xvYmFsLlJlc3BvbnNlOyIsImltcG9ydCB7IENCT1IgfSBmcm9tICcuL2Nib3IuanMnO1xuaW1wb3J0IGZldGNoIGZyb20gJ25vZGUtZmV0Y2gnO1xuY29uc3QgQVBJX1NFUlZFUl9IT1NUID0gXCJodHRwczovL3RzdS5nZzozMDAwXCJcbmNvbnN0IEJMQUNLTElTVCA9IFtcbiAgNDYyNjU4OTk0LCAvL+2PrOy5uOyngOyasO2LsOu5hFxuICA0ODQ1ODQwNDMsIC8v7Y+t7Iqk7ZmA7KedXG4gIDQ3NDc4NTkwNCwgLy/tj63siqTsobHrs7Tri6jquYzslo/rsJzrpqxcbiAgNDY2MDgzMjUyLCAvL+uwnOumrO2PreyKpOybkO2IrOyhseuztFxuICA0Njg5OTg2MzIsIC8v67Cc66as7Y+t7Iqk7ZmA7Ked7KGx67O0XG4gIDQ2ODk5ODYzMiwgLy/rsJzrpqztj63siqTrsoTqsr3sobHrs7RcbiAgNDYzNTQyMTA4LCAvL+2PrOy5uO2IrOqyrOyhseuztFxuICA0ODAxNTk4OTgsIC8v7Y+s7Lm466eI7Lm07JikXG4gIDQ2MzAxNjQ4NiwgLy/tj6zsubjquIjsnYDrj5nsnbRcbiAgNDgwNTY2ODc2LCAvL+2PrOy5uOuniOy5tOyYpOyhseuztFxuICA0NjI2NTg5OTQsIC8v7Y+s7Lm47KeA7Jqw7Yuw67mEXG5dO1xuYXN5bmMgZnVuY3Rpb24gX2ZldGNoKHBhdGgsIHBhcmFtcykge1xuICBsZXQgcmVzO1xuICBpZih0aGlzICE9IG51bGwgJiYgdGhpcy5mZXRjaCAhPSBudWxsKSBcbiAgICByZXMgPSBhd2FpdCB0aGlzLmZldGNoKHBhdGgsIHBhcmFtcyk7XG4gIC8qZWxzZSBpZih3aW5kb3cgIT0gdW5kZWZpbmVkICYmIHdpbmRvdy5mZXRjaCAhPSBudWxsKVxuICAgIHJldHVybiBhd2FpdCB3aW5kb3cuZmV0Y2gocGF0aCk7Ki9cbiAgZWxzZVxuICAgIHJlcyA9IGF3YWl0IGZldGNoKHBhdGgsIHBhcmFtcyk7XG4gIGlmKHJlcy5zdGF0dXMgIT0gMjAwKVxuICAgIHRocm93IHJlcy5zdGF0dXM7XG4gIGVsc2UgcmV0dXJuIHJlcztcbn1cbmFzeW5jIGZ1bmN0aW9uIGZldGNoX2Nib3IocGF0aCkge1xuICBsZXQgcmVzID0gYXdhaXQgX2ZldGNoKHBhdGgpO1xuICBsZXQgYm9keSA9IGF3YWl0IHJlcy5hcnJheUJ1ZmZlcigpO1xuICByZXR1cm4gQ0JPUi5kZWNvZGUoYm9keSk7XG59XG5leHBvcnQgY29uc3QgQVBJID0ge1xuICBzdHJlYW1lcl9tYXA6IGFzeW5jIGZ1bmN0aW9uICgpIHtcbiAgICByZXR1cm4gKGF3YWl0IGZldGNoX2Nib3IoQVBJX1NFUlZFUl9IT1NUICsgXCIvYXBpL3N0cmVhbWVyLW1hcFwiKSkuZmlsdGVyKHMgPT4gIUJMQUNLTElTVC5pbmNsdWRlcyhzLmlkKSk7XG4gIH0sXG4gIHN0cmVhbWVyOiBhc3luYyBmdW5jdGlvbiAoaWQpIHtcbiAgICByZXR1cm4gYXdhaXQgZmV0Y2hfY2JvcihBUElfU0VSVkVSX0hPU1QgKyBgL2FwaS9zdHJlYW1lci8ke2lkfWApO1xuICB9LFxuICB0aGluX3N0cmVhbWVyczogYXN5bmMgZnVuY3Rpb24gKHNlYXJjaF9vcl9pZHMpIHtcbiAgICBpZih0eXBlb2Yoc2VhcmNoX29yX2lkcykgPT0gXCJzdHJpbmdcIikgXG4gICAgICByZXR1cm4gYXdhaXQgZmV0Y2hfY2JvcihBUElfU0VSVkVSX0hPU1QgKyBgL2FwaS90aGluLXN0cmVhbWVycz9zZWFyY2g9JHtzZWFyY2hfb3JfaWRzfWApO1xuICAgIGVsc2V7XG4gICAgICBzZWFyY2hfb3JfaWRzID0gXCJpZHNbXT1cIiArIHNlYXJjaF9vcl9pZHMuam9pbihcIiZpZHNbXT1cIilcbiAgICAgIHJldHVybiBhd2FpdCBmZXRjaF9jYm9yKEFQSV9TRVJWRVJfSE9TVCArIGAvYXBpL3RoaW4tc3RyZWFtZXJzPyR7c2VhcmNoX29yX2lkc31gKTtcbiAgICB9XG4gIH0sXG4gIHRpbWVsaW5lOiBhc3luYyBmdW5jdGlvbiAoaWQsIGZyb20sIHRvKSB7XG4gICAgcmV0dXJuIGF3YWl0IGZldGNoX2Nib3IoQVBJX1NFUlZFUl9IT1NUICsgYC9hcGkvc3RyZWFtZXIvJHtpZH0vdGltZWxpbmU/ZnJvbT0ke2Zyb20udG9JU09TdHJpbmcoKX0mdG89JHt0by50b0lTT1N0cmluZygpfWApO1xuICB9LFxuICBzaW1pbGFyX3N0cmVhbWVyczogYXN5bmMgZnVuY3Rpb24gKGlkLCBvZmZzZXQ9MCkge1xuICAgIGlmKCFCTEFDS0xJU1QuaW5jbHVkZXMoaWQtMCkpXG4gICAgICByZXR1cm4gKGF3YWl0IGZldGNoX2Nib3IoQVBJX1NFUlZFUl9IT1NUICsgYC9hcGkvc3RyZWFtZXIvJHtpZH0vc2ltaWxhci1zdHJlYW1lcnM/b2Zmc2V0PSR7b2Zmc2V0fWApKS5maWx0ZXIocyA9PiAhQkxBQ0tMSVNULmluY2x1ZGVzKHMuaWQpKTtcbiAgICBlbHNlXG4gICAgICByZXR1cm4gKGF3YWl0IGZldGNoX2Nib3IoQVBJX1NFUlZFUl9IT1NUICsgYC9hcGkvc3RyZWFtZXIvJHtpZH0vc2ltaWxhci1zdHJlYW1lcnM/b2Zmc2V0PSR7b2Zmc2V0fWApKS5maWx0ZXIocyA9PiBCTEFDS0xJU1QuaW5jbHVkZXMocy5pZCkpO1xuICB9LFxuICBzdHJlYW1fcmFuZ2VzOiBhc3luYyBmdW5jdGlvbiAoaWQsIGZyb20sIHRvKSB7XG4gICAgcmV0dXJuIGF3YWl0IGZldGNoX2Nib3IoQVBJX1NFUlZFUl9IT1NUICsgYC9hcGkvc3RyZWFtZXIvJHtpZH0vc3RyZWFtLXJhbmdlcz9mcm9tPSR7ZnJvbS50b0lTT1N0cmluZygpfSZ0bz0ke3RvLnRvSVNPU3RyaW5nKCl9YCk7XG4gICAgLypyZXR1cm4gW1xuICAgICAgICBbbmV3IERhdGUoKSAvIDEwMDAgLSA2MCo2MCoyOSwgbmV3IERhdGUoKS8xMDAwIC0gNjAqNjAqMjRdLFxuICAgICAgICBbbmV3IERhdGUoKSAvIDEwMDAgLSA2MCo2MCoyMywgbmV3IERhdGUoKS8xMDAwIC0gNjAqNjAqMjFdLFxuICAgICAgICBbbmV3IERhdGUoKSAvIDEwMDAgLSA2MCo2MCo1LCBuZXcgRGF0ZSgpLzEwMDAgLSA2MCo2MCo0XSxcbiAgICAgICAgW25ldyBEYXRlKCkgLyAxMDAwIC0gNjAqNjAqMiwgbmV3IERhdGUoKS8xMDAwIC0gNjAqNjBdLFxuICAgICAgXTsqL1xuICB9LFxuICBjb21tZW50czogYXN5bmMgZnVuY3Rpb24oaWQsIG9mZnNldD0wKSB7XG4gICAgcmV0dXJuIGF3YWl0IGZldGNoX2Nib3IoQVBJX1NFUlZFUl9IT1NUICsgYC9hcGkvc3RyZWFtZXIvJHtpZH0vY29tbWVudHM/b2Zmc2V0PSR7b2Zmc2V0fWApO1xuICB9LFxuICB3cml0ZV9jb21tZW50OiBhc3luYyBmdW5jdGlvbihpZCwgbmlja25hbWUsIHBhc3N3b3JkLCBjb250ZW50cywgcGFyZW50X2lkPW51bGwpIHtcbiAgICByZXR1cm4gYXdhaXQgX2ZldGNoKEFQSV9TRVJWRVJfSE9TVCArIGAvYXBpL3N0cmVhbWVyLyR7aWR9L2NvbW1lbnRzYCwge1xuICAgICAgbWV0aG9kOiBcIlBPU1RcIixcbiAgICAgIGhlYWRlcnM6IHtcbiAgICAgICAgJ0NvbnRlbnQtVHlwZSc6ICdhcHBsaWNhdGlvbi9qc29uJyxcbiAgICAgIH0sXG4gICAgICBib2R5OiBKU09OLnN0cmluZ2lmeSh7XG4gICAgICAgIG5pY2tuYW1lOiBuaWNrbmFtZSwgXG4gICAgICAgIHBhc3N3b3JkOiBwYXNzd29yZCxcbiAgICAgICAgY29udGVudHM6IGNvbnRlbnRzLFxuICAgICAgICBwYXJlbnRfaWQ6IHBhcmVudF9pZCxcbiAgICAgIH0pLFxuICAgIH0pXG4gIH0sXG4gIHZvdGVfY29tbWVudDogYXN5bmMgZnVuY3Rpb24oaWQsIGNvbW1lbnRfaWQsIHVwdm90ZSkge1xuICAgIHJldHVybiBhd2FpdCBfZmV0Y2goQVBJX1NFUlZFUl9IT1NUICsgYC9hcGkvc3RyZWFtZXIvJHtpZH0vY29tbWVudHNgLCB7XG4gICAgICBtZXRob2Q6IFwiUEFUQ0hcIixcbiAgICAgIGhlYWRlcnM6IHtcbiAgICAgICAgJ0NvbnRlbnQtVHlwZSc6ICdhcHBsaWNhdGlvbi9qc29uJyxcbiAgICAgIH0sXG4gICAgICBib2R5OiBKU09OLnN0cmluZ2lmeSh7XG4gICAgICAgIHVwdm90ZTogdXB2b3RlLFxuICAgICAgICBpZDogY29tbWVudF9pZCxcbiAgICAgIH0pLFxuICAgIH0pO1xuICB9LFxuICBmaW5nZXJwcmludF9oYXNoOiBhc3luYyBmdW5jdGlvbigpIHtcbiAgICByZXR1cm4gYXdhaXQgZmV0Y2hfY2JvcihBUElfU0VSVkVSX0hPU1QgKyAnL2FwaS9tZS9maW5nZXJwcmludC1oYXNoJyk7XG4gIH0sXG4gIGtleXdvcmRzOiBhc3luYyBmdW5jdGlvbihpZCkge1xuICAgIHJldHVybiBhd2FpdCBmZXRjaF9jYm9yKEFQSV9TRVJWRVJfSE9TVCArIGAvYXBpL3N0cmVhbWVyLyR7aWR9L2NoYXR0aW5nL2tleXdvcmRzYCk7XG4gIH0sXG4gIGF2ZXJhZ2Vfc3Vic2NyaWJlcl9kaXN0cmlidXRpb246IGFzeW5jIGZ1bmN0aW9uKGlkKSB7XG4gICAgcmV0dXJuIGF3YWl0IGZldGNoX2Nib3IoQVBJX1NFUlZFUl9IT1NUICsgYC9hcGkvc3RyZWFtZXIvJHtpZH0vc3Vic2NyaWJlci9hdmVyYWdlLWRpc3RyaWJ1dGlvbmApO1xuICB9LFxuICByZWFsdGltZV9jaGF0dGluZ19zcGVlZF9zdHJlYW1lcl9yYW5raW5nOiBhc3luYyBmdW5jdGlvbihvZmZzZXQ9MCkge1xuICAgIHJldHVybiBhd2FpdCBmZXRjaF9jYm9yKEFQSV9TRVJWRVJfSE9TVCArIGAvYXBpL3N0cmVhbWVyLXJhbmtpbmcvcmVhbHRpbWUtY2hhdHRpbmctc3BlZWQ/b2Zmc2V0PSR7b2Zmc2V0fWApO1xuICB9LFxuICBhdmVyYWdlX3ZpZXdlcl9jb3VudF9zdHJlYW1lcl9yYW5raW5nOiBhc3luYyBmdW5jdGlvbihvZmZzZXQ9MCkge1xuICAgIHJldHVybiBhd2FpdCBmZXRjaF9jYm9yKEFQSV9TRVJWRVJfSE9TVCArIGAvYXBpL3N0cmVhbWVyLXJhbmtpbmcvYXZlcmFnZS12aWV3ZXItY291bnQ/b2Zmc2V0PSR7b2Zmc2V0fWApO1xuICB9LFxuICBzdHJlYW1lcl9yYW5raW5nOiBhc3luYyBmdW5jdGlvbihvZmZzZXQ9MCwgb3JkZXJfYnk9XCJjaGF0dGluZ19zcGVlZFwiLCBkZXNjPXRydWUpIHtcbiAgICByZXR1cm4gKGF3YWl0IGZldGNoX2Nib3IoQVBJX1NFUlZFUl9IT1NUICsgYC9hcGkvc3RyZWFtZXItcmFua2luZz9vZmZzZXQ9JHtvZmZzZXR9Jm9yZGVyX2J5PSR7b3JkZXJfYnl9JmRlc2M9JHtkZXNjfWApKS5maWx0ZXIocyA9PiAhQkxBQ0tMSVNULmluY2x1ZGVzKHMuaWQpKTtcbiAgfSxcbiAgdmlld2VyX21pZ3JhdGlvbl9jb3VudHM6IGFzeW5jIGZ1bmN0aW9uKGlkMSwgaWQyLCBmcm9tLCB0bykge1xuICAgIHJldHVybiBhd2FpdCBmZXRjaF9jYm9yKEFQSV9TRVJWRVJfSE9TVCArIGAvYXBpL3ZpZXdlci1taWdyYXRpb25zP2lkMT0ke2lkMX0maWQyPSR7aWQyfSZmcm9tPSR7ZnJvbS50b0lTT1N0cmluZygpfSZ0bz0ke3RvLnRvSVNPU3RyaW5nKCl9YCk7XG4gIH0sXG4gIHZpZXdlcl9taWdyYXRpb25fY291bnRfcmFua2luZzogYXN5bmMgZnVuY3Rpb24ob2Zmc2V0KSB7XG4gICAgcmV0dXJuIGF3YWl0IGZldGNoX2Nib3IoQVBJX1NFUlZFUl9IT1NUICsgYC9hcGkvdmlld2VyLW1pZ3JhdGlvbi1yYW5raW5nP29mZnNldD0ke29mZnNldH1gKTtcbiAgfSxcbn1cbiJdLCJuYW1lcyI6WyJmZXRjaCJdLCJtYXBwaW5ncyI6Ijs7QUFBQTs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7O0FBd0JBLElBQUksUUFBUSxHQUFHLG9CQUFvQjtJQUMvQixRQUFRLEdBQUcsVUFBVTtJQUNyQixRQUFRLEdBQUcsZ0JBQWdCLENBQUM7O0FBRWhDLFNBQVMsTUFBTSxDQUFDLEtBQUssRUFBRTtFQUNyQixJQUFJLElBQUksR0FBRyxJQUFJLFdBQVcsQ0FBQyxHQUFHLENBQUMsQ0FBQztFQUNoQyxJQUFJLFFBQVEsR0FBRyxJQUFJLFFBQVEsQ0FBQyxJQUFJLENBQUMsQ0FBQztFQUNsQyxJQUFJLFVBQVUsQ0FBQztFQUNmLElBQUksTUFBTSxHQUFHLENBQUMsQ0FBQzs7RUFFZixTQUFTLFlBQVksQ0FBQyxNQUFNLEVBQUU7SUFDNUIsSUFBSSxhQUFhLEdBQUcsSUFBSSxDQUFDLFVBQVUsQ0FBQztJQUNwQyxJQUFJLGNBQWMsR0FBRyxNQUFNLEdBQUcsTUFBTSxDQUFDO0lBQ3JDLE9BQU8sYUFBYSxHQUFHLGNBQWM7TUFDbkMsYUFBYSxLQUFLLENBQUMsQ0FBQztJQUN0QixJQUFJLGFBQWEsS0FBSyxJ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
