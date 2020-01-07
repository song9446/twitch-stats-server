<canvas width={width} height={height} bind:this={canvas} />

<script>
  import { onMount } from "svelte";
  export let width;
  export let height;
  export let data;
  const axis_width = 2;
  /*
  option = {, 
    series: [{
      type: "line",
      name: "",
      data: [],
      right_yaxis: true,
      banner_format: function(x, y),
      area_style: canvas,
    }],
    xaxis_format: function(x),
    yaxis_format: function(x),
    right_yaxis_format: function(x),
  }
  */
  let canvas;
  function gen_canvas(width, height) {
    let canvas = document.createElement("canvas");
    canvas.width = width;
    canvas.height = height;
    return [canvas, canvas.getContext("2d")]
  }
  onMount(()=>{
    canvas.width = width;
    canvas.height = height;
    ctx.font = "10px Arial";
    let ctx = canvas.getContext("2d");
    let [axis_buffer, axis_ctx] = gen_canvas(canvas.width, canvas.height);
    let right_yaxis_exist = option.series.find(s=>s.right_yaxis);
    let [min_x, max_x] = [
        Math.min(...option.series.map(s=>Math.min(...s.data.map(d=>d[0])))), 
        Math.max(...option.series.map(s=>Math.max(...s.data.map(d=>d[0]))))];
    let [min_y_left, max_y_left] = [
        Math.min(...option.series.filter(s=>!s.right_yaxis).map(s=>Math.min(...s.data.map(d=>d[1])))), 
        Math.max(...option.series.filter(s=>!s.right_yaxis).map(s=>Math.max(...s.data.map(d=>d[1]))))];
    let [min_y_right, max_y_right] = [
        Math.min(...option.series.filter(s=>s.right_yaxis).map(s=>Math.min(...s.data.map(d=>d[1])))), 
        Math.max(...option.series.filter(s=>s.right_yaxis).map(s=>Math.max(...s.data.map(d=>d[1]))))];
    let margin_left = ctx.measureText(max_y_left).width,
        margin_right = ctx.measureText(max_y_right).width,
        margin_bottom = parseInt(ctx.font),
        margin_top = parseInt(ctx.font);
    let xaxis_scale = 7,
        yaxis_scale = 7;
    ctx.fillRect(margin_left, height - margin_bottom - margin_top, width - margin_left - margin_right, axis_width);
    ctx.textBaseline = "bottom";
    ctx.textAlign = "center";
    for(let i=0; i<xaxis_scale; ++i){
      let x = (width - margin_left - margin_right) * i / xaxis_scale + margin_left;
      ctx.fillText(option.xaxis_format((max_x - min_x)*i/xaxis_scale + min_x), x, height);
    }
    ctx.textBaseline = "middle";
    for(let i=0; i<yaxis_scale; ++i){
      let y = (height - margin_bottom - margin_top) * i / xaxis_scale + margin_top;
      ctx.textAlign = "left";
      ctx.fillText(option.yaxis_format((max_y_left - min_y_left)*i/yaxis_scale + min_y_left), 0, y);
      if(right_yaxis_exist){
        ctx.textAlign = "right";
        ctx.fillText(option.yaxis_format((max_y_right - min_y_right)*i/yaxis_scale + min_y_right), width, y);
      }
    }
    for(let item of option.series){
      ctx.beginPath();
      let coord_x, coord_y, first_run = false;
      for(let [x, y] of item.data) {
        coord_x = (width - margin_left - margin_right) * (x - min_x) / (max_x - min_x) + margin_left;
        if(item.right_yaxis)
          coord_y = (height - margin_top - margin_bottom) * (y - min_y_right) / (max_y_right - min_y_right) + margin_top;
        else
          coord_y = (height - margin_top - margin_bottom) * (y - min_y_left) / (max_y_left - min_y_left) + margin_top;
        if(!first_run){
          first_run = true;
          ctx.moveTo(coord_x, coord_y);
        }
        else
          ctx.lineTo(coord_x, coord_y);
      }
      ctx.stroke();
    }
  });
</script>
