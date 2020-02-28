function random_hsl_color(min, max, seed) {
  let random;
  if(typeof(seed) == "string")
    random = mulberry32(hash(seed));
  else
    random = mulberry32(seed);
  return 'hsl(' +
    (random() * 360).toFixed() + ',' +
    (random() * 30 + 70).toFixed() + '%,' +
    (random() * (max - min) + min).toFixed() + '%)';
}
function mulberry32(a) {
  return function() {
    var t = a += 0x6D2B79F5;
    t = Math.imul(t ^ t >>> 15, t | 1);
    t ^= t + Math.imul(t ^ t >>> 7, t | 61);
    return ((t ^ t >>> 14) >>> 0) / 4294967296;
  }
}
function hash(seed) {
  let hash = 0, i, chr;
  if (seed.length === 0) return hash;
  for (i = 0; i < seed.length; i++) {
    chr   = seed.charCodeAt(i);
    hash  = ((hash << 5) - hash) + chr;
    hash |= 0; 
  }
  return hash;
};
export const dark_random_color = (seed) => {
  return random_hsl_color(10, 50, seed);
}



const locales = {
  prefix: '',
  sufix:  '',
  
  seconds: '몇초전',
  minute:  '1분전',
  minutes: '%d분전',
  hour:    '한시간전',
  hours:   '%d시간전',
  day:     '하루전',
  days:    '%d일전',
  month:   '한달전',
  months:  '%d달전',
  year:    '일년전',
  years:   '%d년전'
};

export const time_ago = function(time) {
  var seconds = Math.floor((new Date() - time) / 1000),
      separator = locales.separator || ' ',
      words = locales.prefix + separator,
      interval = 0,
      intervals = {
        year:   seconds / 31536000,
        month:  seconds / 2592000,
        day:    seconds / 86400,
        hour:   seconds / 3600,
        minute: seconds / 60
      };
  
  var distance = locales.seconds;
  
  for (var key in intervals) {
    interval = Math.floor(intervals[key]);
    
    if (interval > 1) {
      distance = locales[key + 's'];
      break;
    } else if (interval === 1) {
      distance = locales[key];
      break;
    }
  }
  
  distance = distance.replace(/%d/i, interval);
  words += distance + separator + locales.sufix;
  return words.trim();
};

export const findLastIndex = function(array, predicate) {
    let l = array.length;
    while (l--) {
        if (predicate(array[l], l, array))
            return l;
    }
    return -1;
}
