<div class="{$$props.class} relative">
<<<<<<< HEAD
<canvas bind:this={canvas} class="w-full">
=======
<canvas bind:this={canvas} class="w-full h-full">
>>>>>>> d2889d99c97bdce47071bfd176272aab8192b643
</canvas>
<canvas bind:this={ui_canvas} class="absolute w-full h-full" on:mousemove={mousemove} on:mouseover={mouseover} on:mouseleave={mouseleave}>
</canvas>
</div>

<script context="module">
function is_overlap(ranges, point){
  let res = ranges.some(range => range[0] <= point && point <= range[1])
<<<<<<< HEAD
=======
  //console.log(ranges.map(j=>j.map(k=>k/60/60)), point/60/60, res);
>>>>>>> d2889d99c97bdce47071bfd176272aab8192b643
  return res;
}
function fill_hole(ranges, interval){
  let filled = [ranges[0]];
  for(let i=1, l=ranges.length; i<l; ++i){
    let last = filled.pop();
    if(Math.abs(ranges[i][0] - last[1]) < interval)
      filled.push([last[0], ranges[i][1]]);
    else{
      filled.push(last);
      filled.push(ranges[i]);
    }
  }
  return filled;
}
</script>

<script>
import { onMount } from "svelte";
import { API } from '../api.js';
export let streamer;
export let mean_streaming_time_ranges = [];
export let mean_streaming_time_reliability = 0.0;
export let streaming_time_ranges_variance = 0.0;
export let total_streaming_time_ratio = 0.0;
export let streaming_time_ranges_regularity = 0.0; 
<<<<<<< HEAD
export let streaming_start_time = 0.0; 
export let streaming_end_time = 0.0; 
export let streaming_start_time_std= 0.0; 
export let streaming_end_time_std= 0.0; 
=======
>>>>>>> d2889d99c97bdce47071bfd176272aab8192b643
const days_ago = 7*8;
const interval = 60*60*24;
let today = new Date(); today.setHours(0,0,0,0);
let to = new Date(today.getTime() + 1000*60*60*24);
let from = new Date(today.getTime() - 1000*60*60*24*(days_ago-1));

let canvas;
let ui_canvas;

let last_streamer = null;

let mouse_in = false;
let mouse_x = 0; 
let mouse_y = 0;
function mousemove(e){
  mouse_in = true;
  mouse_x = e.clientX - canvas.getBoundingClientRect().x;
  mouse_y = e.clientY - canvas.getBoundingClientRect().y;
}
function mouseover(){
  mouse_in = true;
}
function mouseleave(){
  mouse_in = false;
}

$: if(canvas && last_streamer != streamer) {
  last_streamer = streamer;
  mean_streaming_time_ranges = [];
  total_streaming_time_ratio = 0.0;
  streaming_time_ranges_variance = 0.0;
  mean_streaming_time_reliability = 0.0;
  API.stream_ranges(streamer.id, from, to).then(stream_ranges => {
<<<<<<< HEAD
=======
  let strea
>>>>>>> d2889d99c97bdce47071bfd176272aab8192b643
  //let stream_ranges = await API.stream_ranges(streamer.id, from, to);
  if(!stream_ranges)
    return null;
  let trimed_from = new Date(stream_ranges[0][0]*1000); trimed_from.setHours(0,0,0,0);
  let from_timestamp = Math.round(trimed_from.getTime()/1000),
      to_timestamp = Math.round(to.getTime()/1000);
  let chunks = [[]];
  for(let i=0, j=0, l=stream_ranges.length; i<l; ++i){
<<<<<<< HEAD
    total_streaming_time_ratio += (stream_ranges[i][1] - stream_ranges[i][0]) / (to_timestamp - stream_ranges[0][0]);
=======
    total_streaming_time_ratio += (stream_ranges[i][1] - stream_ranges[i][0]) / (to_timestamp - from_timestamp);
>>>>>>> d2889d99c97bdce47071bfd176272aab8192b643
    while(stream_ranges[i][1] >= from_timestamp + (j+2)*interval) {
      chunks.push([]);
      ++j;
      continue;
    }
    if(stream_ranges[i][1] >= from_timestamp + (j+1)*interval) {
      chunks.push([]);
      if(stream_ranges[i][0] < from_timestamp + (j+1)*interval) {
        chunks[j].push([(stream_ranges[i][0] - from_timestamp) % interval, interval])
        chunks[j+1].push([0, (stream_ranges[i][1] - from_timestamp) % interval]);
      }
      else {
        chunks[j+1].push(stream_ranges[i].map(v => (v-from_timestamp)%interval));
      }
      ++j;
      continue;
    }
    chunks[j].push(stream_ranges[i].map(v => (v-from_timestamp)%interval));
  }
  let splits = new Set();
  for(let ranges of chunks){
    for(let range of ranges){
      splits.add(range[0]);
      splits.add(range[1]);
    }
  }
  splits = [...splits].sort((a,b)=>a-b);
  let mean = [],
      total = 0;
  for(let i=0, l=splits.length-1; i<l; ++i) 
    mean.push(chunks.reduce((res, ranges)=>res + (is_overlap(ranges, (splits[i] + splits[i+1])*0.5)? 1:0), 0) / chunks.length);
  for(let i=0, l=mean.length; i<l; ++i) 
    total += mean[i]>0? splits[i+1]-splits[i]: 0;
  streaming_time_ranges_variance = chunks.reduce((res,ranges)=>{
    let v = mean.map((v, i)=>Math.abs(is_overlap(ranges, (splits[i] + splits[i+1])*0.5) - v)*(splits[i+1]-splits[i])).reduce((a,b)=>a+b) / total;
    return res + v*v;
  }, 0) / chunks.length;
  let filled_ranges = fill_hole(stream_ranges, 60*60).map(v=>[(v[0]-from_timestamp)%interval / interval, (v[1]-from_timestamp)%interval / interval]);
  let mean2 = filled_ranges.reduce((a,b)=>[a[0]+b[0], a[1]+b[1]]).map(v=>v/filled_ranges.length);
  let var2 = filled_ranges.reduce((res,v) => [res[0] + (v[0]-mean2[0])*(v[0]-mean2[0]), res[1] + (v[1]-mean2[1])*(v[1]-mean2[1])], [0,0]).map(v=>v/filled_ranges.length);
<<<<<<< HEAD
=======
  console.log(filled_ranges);
  console.log("mean2, var2", mean2, var2);
>>>>>>> d2889d99c97bdce47071bfd176272aab8192b643
  streaming_time_ranges_regularity  = 0.0;
  for(let i=0, l=chunks.length; i<l; ++i){
    for(let j=i+1; j<l; ++j){
      let diff = 0;
      for(let k=0, m=splits.length-1; k<m; ++k)
        diff += Math.abs(is_overlap(chunks[i], (splits[k+1] + splits[k])*0.5) - is_overlap(chunks[j], (splits[k+1] + splits[k])*0.5)) * (splits[k+1]-splits[k])
      streaming_time_ranges_regularity += diff / total;
    }
  }
  streaming_time_ranges_regularity = streaming_time_ranges_regularity / ((chunks.length) * (chunks.length-1) / 2)
<<<<<<< HEAD
  let a = 0, b=0;
  let mean_of_mean = mean.map((v, i) => (splits[i+1] - splits[i]) * v).reduce((a,b)=>a+b) / total;
=======
  console.log(splits, chunks, streaming_time_ranges_variance, mean, streaming_time_ranges_regularity);
  let a = 0, b=0;
  let mean_of_mean = mean.map((v, i) => (splits[i+1] - splits[i]) * v).reduce((a,b)=>a+b) / total;
  console.log("mean of mean", mean_of_mean);
>>>>>>> d2889d99c97bdce47071bfd176272aab8192b643
  mean_of_mean = 0.5;
  mean_streaming_time_reliability = 
    mean.map((v, i) => v >= mean_of_mean? (splits[i+1]-splits[i])*v: 0).reduce((a,b)=>a+b) / 
    mean.map((v, i) => v >= mean_of_mean? (splits[i+1]-splits[i]): 0).reduce((a,b)=>a+b);
  let circling = (splits[0] == 0 && splits[splits.length-1] == interval),
      i_start = 0, mean_length = mean.length;
  if(circling && mean[0] >= mean_of_mean)
    while(mean[(i_start-1 + mean_length) % mean_length] >= mean_of_mean && i_start >= -mean_length) 
      i_start -= 1;
  for(let i=0, l=mean.length; i<l; ++i) {
    if(mean[(i+i_start+l)%l] >= mean_of_mean) {
      let last_range = mean_streaming_time_ranges.pop();
      if(last_range && Math.abs(last_range[1] % interval - splits[(i+i_start+l)%l] % interval) <= 60*60)
        mean_streaming_time_ranges.push([last_range[0], splits[(i+i_start+l)%l+1]]);
      else{
        if(last_range) mean_streaming_time_ranges.push(last_range);
        mean_streaming_time_ranges.push([splits[(i+i_start+l)%l], splits[(i+i_start+l)%l+1]]);
      }
    }
  }
<<<<<<< HEAD
  if(mean_streaming_time_ranges.length>1 && Math.abs(mean_streaming_time_ranges[mean_streaming_time_ranges.length-1][1] - mean_streaming_time_ranges[0][0]) <= 60*60)
    mean_streaming_time_ranges[0][0] = mean_streaming_time_ranges.pop()[0]
  mean_streaming_time_ranges = mean_streaming_time_ranges;


  let stream_ranges_processed = fill_hole(stream_ranges, 60*60)
      .map(v=>[(v[0]-from_timestamp)%interval, (v[1]-from_timestamp)%interval]);
  let stream_ranges_vector = stream_ranges_processed
      .map(v=>[v[0]/interval*Math.PI*2, v[1]/interval*Math.PI*2])
      .map(v=>[[Math.sin(v[0]), Math.cos(v[0])], [Math.sin(v[1]), Math.cos(v[1])]]);
  streaming_start_time = (Math.atan2(...stream_ranges_vector.reduce((a, s) => [a[0]+s[0][0], a[1]+s[0][1]], [0,0])) + Math.PI*2)%(Math.PI*2)/(Math.PI*2) * interval;
  streaming_end_time = (Math.atan2(...stream_ranges_vector.reduce((a, s) => [a[0]+s[1][0], a[1]+s[1][1]], [0,0])) + Math.PI*2)%(Math.PI*2)/(Math.PI*2) * interval;
  //streaming_start_time = stream_ranges_processed.map(s=>s[0]).sort()[Math.floor(stream_ranges_processed.length/2)];
  //streaming_end_time = stream_ranges_processed.map(s=>s[1]).sort()[Math.floor(stream_ranges_processed.length/2)];
  streaming_start_time_std = Math.sqrt(
    stream_ranges_processed
      .map(s => Math.abs(s[0]-streaming_start_time))
      .map(v => v < interval*0.5? v: interval-v)
      .reduce((a, s) => a+s*s, 0)/(stream_ranges_processed.length-1));
  streaming_end_time_std = Math.sqrt(
    stream_ranges_processed
      .map(s => Math.abs(s[1]-streaming_end_time))
      .map(v => v < interval*0.5? v: interval-v)
      .reduce((a, s) => a+s*s, 0)/(stream_ranges_processed.length-1));
=======
  mean_streaming_time_ranges = mean_streaming_time_ranges;
  console.log("mean ranges", mean_streaming_time_ranges);
  console.log("mean rel", mean_streaming_time_reliability);
>>>>>>> d2889d99c97bdce47071bfd176272aab8192b643

  let width = canvas.getBoundingClientRect().width,
      height = canvas.getBoundingClientRect().width;
  canvas.width = width;
  canvas.height = height;
  ui_canvas.width = width;
  ui_canvas.height = height;

  let ctx = canvas.getContext("2d");
  //ctx.fillStyle = "#2d3748";
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  ctx.fillStyle = "#B498AE";
  ctx.strokeStyle = "#2d3748";
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  

  from_timestamp = Math.round(from.getTime()/1000);
  to_timestamp = Math.round(to.getTime()/1000);
  let day_text = ["일", "월", "화", "수", "목", "금", "토"];
  let ticks = 720,
      font_size = 15,
      outer_circle_width = 5,
      inner_pad_from_outer_circle = 30,
      outer_pad = 30,
      min_r = 0.0,
      max_r = 1.0 - (outer_circle_width + outer_pad + inner_pad_from_outer_circle)/(width*0.5),
      n_spin = days_ago/7,
      h = (max_r-min_r) / (n_spin+1),
      total_angle = n_spin * Math.PI * 2,
      angle_start = -Math.PI*0.5 + Math.PI*2/7*from.getDay(),
      day_start = from.getDay();
  ctx.beginPath();
  for(let range of stream_ranges){
    let i_l = Math.round(ticks * (range[0] - from_timestamp) / (to_timestamp - from_timestamp)),
        i_r = Math.round(ticks * (range[1] - from_timestamp) / (to_timestamp - from_timestamp));
    let t = i_l/ticks,
        angle = total_angle * t + angle_start,
        d = (max_r - min_r - h)*t + min_r,
        sx=width*0.5 + d*width*0.5*Math.cos(angle),
        sy=height*0.5 + d*height*0.5*Math.sin(angle);
    ctx.moveTo(sx, sy);
    for(let i=i_l+1;i<=i_r; ++i){
      let t = i/ticks,
          angle = total_angle * t + angle_start,
          d = (max_r - min_r - h)*t + min_r,
          x=width*0.5 + d*width*0.5*Math.cos(angle),
          y=height*0.5 + d*height*0.5*Math.sin(angle);
      ctx.lineTo(x, y);
    }
    for(let i=i_r; i>=i_l; --i){
      let t = i/ticks,
          angle = total_angle * t + angle_start,
          d = (max_r - min_r - h)*t + min_r + h,
          x=width*0.5 + d*width*0.5*Math.cos(angle),
          y=height*0.5 + d*height*0.5*Math.sin(angle);
      ctx.lineTo(x, y);
    }
    ctx.lineTo(sx, sy);
  }
  ctx.fill();
  ctx.save();
  ctx.globalAlpha = 1/n_spin;
  ctx.beginPath();
  for(let range of stream_ranges){
    let i_l = Math.round(ticks * (range[0] - from_timestamp) / (to_timestamp - from_timestamp)),
        i_r = Math.round(ticks * (range[1] - from_timestamp) / (to_timestamp - from_timestamp));
    let t = i_l/ticks,
        angle = total_angle * t + angle_start,
        d = (1 - (outer_pad + outer_circle_width)/(width*0.5)),
        sx=width*0.5 + d*width*0.5*Math.cos(angle),
        sy=height*0.5 + d*height*0.5*Math.sin(angle);
    ctx.moveTo(sx, sy);
    for(let i=i_l+1;i<=i_r; ++i){
      let t = i/ticks,
          angle = total_angle * t + angle_start,
          d = (1 - (outer_pad + outer_circle_width)/(width*0.5)),
          x=width*0.5 + d*width*0.5*Math.cos(angle),
          y=height*0.5 + d*height*0.5*Math.sin(angle);
      ctx.lineTo(x, y);
    }
    for(let i=i_r; i>=i_l; --i){
      let t = i/ticks,
          angle = total_angle * t + angle_start,
          d = (1 - (outer_pad)/(width*0.5)),
          //d = (max_r - min_r - h)*t + min_r + h,
          x=width*0.5 + d*width*0.5*Math.cos(angle),
          y=height*0.5 + d*height*0.5*Math.sin(angle);
      ctx.lineTo(x, y);
    }
    ctx.lineTo(sx, sy);
  }
  ctx.fill();
  ctx.restore();
  ctx.beginPath();
  ctx.moveTo(width*0.5 + (width*0.5 - outer_pad - outer_circle_width)*Math.cos(angle_start), height*0.5 + (height*0.5 - outer_pad - outer_circle_width)*Math.sin(angle_start));
  for(let i=0; i<=Math.ceil(ticks/n_spin); ++i){
    let angle = Math.PI*2 * (i/Math.ceil(ticks/n_spin)) + angle_start,
        x=width*0.5 + (width*0.5 - outer_circle_width - outer_pad)*Math.cos(angle),
        y=height*0.5 + (height*0.5 - outer_pad - outer_circle_width)*Math.sin(angle);
    ctx.lineTo(x, y);
  }
  ctx.stroke();
  ctx.beginPath();
  ctx.moveTo(width*0.5 + (width*0.5 - outer_pad)*Math.cos(angle_start), height*0.5 + (height*0.5 - outer_pad)*Math.sin(angle_start));
  for(let i=0; i<=Math.ceil(ticks/n_spin); ++i){
    let angle = Math.PI*2 * (i/Math.ceil(ticks/n_spin)) + angle_start,
        x=width*0.5 + (width*0.5 - outer_pad)*Math.cos(angle),
        y=height*0.5 + (height*0.5 - outer_pad)*Math.sin(angle);
    ctx.lineTo(x, y);
  }
  ctx.stroke();
  ctx.beginPath();
  for(let i=0; i<=Math.ceil(ticks * (total_angle+Math.PI*2)/total_angle); ++i){
  //for(let i=0; i<=ticks; ++i){
    let t = i/ticks,
        angle = total_angle * t + angle_start,
        d = (max_r - min_r - h)*t + min_r,
        x=width*0.5 + d*width*0.5*Math.cos(angle),
        y=height*0.5 + d*height*0.5*Math.sin(angle);
    ctx.lineTo(x, y);
  }
  ctx.moveTo(width*0.5, height*0.5);
  for(let i=0; i<7; ++i){
    let t = (n_spin-1)/n_spin + i/n_spin/7,
        angle = total_angle * t + angle_start,
        //angle = Math.PI*2 / 7 * i + angle_start,
        d1 = (max_r - min_r)*(t + (i==0? 1/n_spin:0)) + min_r,
        d2 = (max_r - min_r)*t + min_r,
        //d = (1 - (outer_pad + outer_c/width*0.5)*t,
        x=width*0.5 + d1*width*0.5*Math.cos(angle),
        y=height*0.5 + d1*height*0.5*Math.sin(angle);
        //x = width*0.5 + max_r*width*0.5*Math.cos(angle),
        //y = height*0.5 + max_r*height*0.5*Math.sin(angle);
    ctx.moveTo(width*0.5, height*0.5);
    ctx.lineTo(x, y);
    let x2 = width*0.5 + (d2*width*0.5 + font_size)*Math.cos(angle + Math.PI*2/7/2),
        y2 = height*0.5 + (d2*height*0.5 + font_size)*Math.sin(angle + Math.PI*2/7/2);
    if((i+day_start)%7 == 0 || (i+day_start)%7 == 6) ctx.fillStyle = "#E53E3E";
    else ctx.fillStyle = "#2d3748";
    ctx.fillText(day_text[(i+day_start)%7], x2, y2);
  }
  ctx.stroke();
  let frame;
  /*(function loop() {
    frame = requestAnimationFrame(loop);
    if(search) 
    ctx.clearRect(0, 0, canvas.width, canvas.height);
  }());
  return ()=>{
    cancelAnimationFrame(frame);
  }*/
})};
</script>
