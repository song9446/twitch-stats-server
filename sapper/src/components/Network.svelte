<script>
import { Springy } from "./springy.js"
import { onMount } from "svelte";

const WIDTH = 512, HEIGHT = 512;

export let nodes = [];
export let edges = [];
export let onrendered  = ()=>{};
/*export let width = 500;
export let height = 500;*/

let canvas;

let renderer;

// node: {id, src, name}
// edge: {from, to, label}

function project(p, width, height) {
	return { x: (p.x + 5)/10 * width, y: (p.y + 5)/10 * height };
}

let last_nodes;
let last_edges;

$: if(canvas && (nodes != last_nodes || edges != last_edges)) {
  last_nodes = nodes;
  last_edges = edges;
	let graph = new Springy.Graph();
	let graph_nodes = {};
  let width = canvas.getBoundingClientRect().width,
      height = canvas.getBoundingClientRect().height;
	let ctx = canvas.getContext("2d");
	ctx.setLineDash([7, 7]);
	ctx.globalAlpha = 0.5;
	for(let node of nodes)
		graph_nodes[node.id] = graph.newNode(node);
	for(let edge of edges)
    graph.newEdge(graph_nodes[edge.from], graph_nodes[edge.to], edge);
	let layout = new Springy.Layout.ForceDirected(graph, 400.0, 400.0, 0.6, 0.0001);
	if(renderer) renderer.stop();
	renderer = new Springy.Renderer(layout,
		function clear() {
			ctx.clearRect(0, 0, WIDTH, HEIGHT);
		},
		function drawEdge(edge, p1, p2) {
			ctx.beginPath();
			p1 = project(p1, WIDTH, HEIGHT);
			p2 = project(p2, WIDTH, HEIGHT);
      ctx.lineWidth = (edge.data.strength) || 1.0;
      ctx.globalAlpha = (edge.data.strength) || 1.0;
			ctx.moveTo(p1.x, p1.y);
			ctx.lineTo(p2.x, p2.y);
			ctx.stroke();
		},
		function drawNode(node, p) {
			//node = document.getElementById(node.data.id);
			node = node.data.ref;
			/*if(node.data.image.complete) 
				ctx.drawImage(node.data.image, p.x * width + node.image.width, p.y * height);*/
			// draw a node
			p = project(p, width, height);
			if(node){
        if(parseInt(node.style.left) != Math.floor(p.x))
<<<<<<< HEAD
          node.style.left = p.x*100/width + "%";
        if(parseInt(node.style.top) != Math.floor(p.y))
          node.style.top = p.y*100/height + "%";
=======
          node.style.left = Math.floor(p.x) + "px";
        if(parseInt(node.style.top) != Math.floor(p.y))
          node.style.top = Math.floor(p.y) + "px";
>>>>>>> d2889d99c97bdce47071bfd176272aab8192b643
			}
		},
    function onRenderStop() {
      onrendered();
    }
	);
	renderer.start();
}
</script>

<div class="relative {$$props.class}">
<canvas bind:this={canvas} width={WIDTH} height={HEIGHT} class="w-full"> </canvas>
{#each nodes as node}
	<div bind:this={node.ref} id="{node.id}" class="node">
		<slot {node}></slot>
	</div>
{/each}
</div>


<style>
.node {
	position: absolute; 
	display: inline-block;
	transform: translate(-50%, -50%);
  width: fit-content;
  top: 50%;
  left: 50%;
}
</style>
