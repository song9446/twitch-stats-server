<script>
import { Springy } from "./springy.js"

export let nodes = [];
export let edges = [];

$: {
	let graph = new Springy.Graph();
	streamers.map(s => graph.newNode(s));
	let node1 = graph.newNode({label: '1'});
	let node2 = graph.newNode({label: '2'});
}

graph.newEdge(node1, node2);

let layout = new Springy.Layout.ForceDirected(graph, 400.0, 400.0, 0.5);

let renderer = new Springy.Renderer(layout,
  function clear() {
    // code to clear screen
  },
  function drawEdge(edge, p1, p2) {
    // draw an edge
  },
  function drawNode(node, p) {
    // draw a node
  }
);

renderer.start();

</script>
