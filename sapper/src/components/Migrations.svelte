<svg class="w-full overflow-visible opacity-50 {$$props.class}" viewBox="0 0 {width} {height}" width="{width}" height="{height}" bind:this={svg}>
  <defs>
    <marker id="head" 
      markerWidth="2" markerHeight="4" 
                      refX="0.1" refY="2" orient="auto" >
      <path d="M0,0 V4 L2,2 Z" fill="#718096" />
    </marker>
  </defs>
  <g>
    {#each paths as path}
    <path
      marker-end="url(#head)"
      stroke-width="{path.width}" 
      fill="none" 
      stroke="#718096" 
      d="{path.path}"
      />
      <text 
        fill="#718096" 
        font-size="{10 + path.width*2}" 
        font-family="Arial" 
        transform="translate({path.x + path.width}, {height*0.5}) rotate(90)"
        text-anchor="middle"
        >
        {path.count}명
      </text>
    {/each}
  </g>
</svg>
<script>
  import { onMount } from "svelte";
  const length = 10;
  let width = 1;
  let svg;
  export let height = 100;
  export let timeline_height = 150;
  export let migrations;
  export let id1;
  export let id2;
  let today;
  onMount(()=> {
    width = svg.getBoundingClientRect().width;
  });
  $: {
    if(migrations.length){
      today = new Date(migrations[0].time);
      today.setHours(0,0,0,0)
    }
  }
  $: paths = migrations.map(m => {
    let x = (new Date(m.time).getTime() - today.getTime() - 30*60*1000)*width/(24*60*60*1000);
    let w = Math.max(1, (Math.sqrt(m.migration_count) / 5)*width/1000);
    if(m.source == id1)
      //return `M${x},${0} C${x + length},${0} ${x},${height} ${x + length},${height}`;
      return {"path": `M${x},${-timeline_height*0.5} L${x},${height*2/3 - w*1.5}`, "width": w, "count": m.migration_count, "x": x};
    else
      //return `M${x},${height} C${x + length},${height} ${x},${0} ${x + length},${0}`;
      return {"path": `M${x},${height+timeline_height*0.5} L${x},${height*1/3 + w*1.5}`, "width": w, "count": m.migration_count, "x": x};
  });
</script>
