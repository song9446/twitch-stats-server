import { S as SvelteComponentDev, i as init, s as safe_not_equal, d as dispatch_dev, I as assign$2, N as exclude_internal_props, D as create_slot, e as element, a as space, c as claim_element, f as children, k as claim_space, j as detach_dev, l as attr_dev, o as add_location, p as insert_dev, q as append_dev, E as get_slot_changes, F as get_slot_context, w as transition_in, x as transition_out, z as group_outros, A as check_outros, B as destroy_each, r as binding_callbacks, W as validate_store, X as component_subscribe, M as onMount, b as svg_element, n as noop, t as text, h as claim_text, O as set_style, G as set_data_dev, H as empty, m as toggle_class, Y as xlink_attr, P as listen_dev, R as run_all, Q as set_input_value, v as mount_component, y as destroy_component, T as update_keyed_each, V as outro_and_destroy_block, u as bind, C as add_flush_callback } from './index.1eb00da2.js';
import { A as API, c as createCommonjsModule, u as unwrapExports } from './api.8ae65b01.js';
import { w as writable } from './index.727acde3.js';
import './Tip.e61592d1.js';
import { P as Panel } from './Panel.c7bb1527.js';
import { c as findLastIndex, f as faUser_2, e as faKey_2, b as faHistory_2, d as dark_random_color } from './faHistory.56473669.js';
import { F as FaIcon, B as Badges, G as GameBadges } from './FaIcon.489b719f.js';
import { b as faMoon_2, d as faSun_2, f as faUserSecret_2, a as faCommentDots_2, e as faExternalLinkAlt_2 } from './index.fe26b672.js';

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

const file = "src/components/Network.svelte";

const get_default_slot_changes = ({ node, nodes }) => ({ node: nodes });
const get_default_slot_context = ({ node, nodes }) => ({ node: node });

function get_each_context(ctx, list, i) {
	const child_ctx = Object.create(ctx);
	child_ctx.node = list[i];
	child_ctx.each_value = list;
	child_ctx.node_index = i;
	return child_ctx;
}

// (81:0) {#each nodes as node}
function create_each_block(ctx) {
	var div, t, node = ctx.node, div_id_value, current;

	const default_slot_template = ctx.$$slots.default;
	const default_slot = create_slot(default_slot_template, ctx, get_default_slot_context);

	const assign_div = () => ctx.div_binding(div, node);
	const unassign_div = () => ctx.div_binding(null, node);

	const block = {
		c: function create() {
			div = element("div");

			if (default_slot) default_slot.c();
			t = space();
			this.h();
		},

		l: function claim(nodes) {
			div = claim_element(nodes, "DIV", { id: true, class: true }, false);
			var div_nodes = children(div);

			if (default_slot) default_slot.l(div_nodes);
			t = claim_space(div_nodes);
			div_nodes.forEach(detach_dev);
			this.h();
		},

		h: function hydrate() {
			attr_dev(div, "id", div_id_value = ctx.node.id);
			attr_dev(div, "class", "node svelte-160k95n");
			add_location(div, file, 81, 1, 2265);
		},

		m: function mount(target, anchor) {
			insert_dev(target, div, anchor);

			if (default_slot) {
				default_slot.m(div, null);
			}

			append_dev(div, t);
			assign_div();
			current = true;
		},

		p: function update(changed, new_ctx) {
			ctx = new_ctx;

			if (default_slot && default_slot.p && (changed.$$scope || changed.nodes)) {
				default_slot.p(
					get_slot_changes(default_slot_template, ctx, changed, get_default_slot_changes),
					get_slot_context(default_slot_template, ctx, get_default_slot_context)
				);
			}

			if (node !== ctx.node) {
				unassign_div();
				node = ctx.node;
				assign_div();
			}

			if ((!current || changed.nodes) && div_id_value !== (div_id_value = ctx.node.id)) {
				attr_dev(div, "id", div_id_value);
			}
		},

		i: function intro(local) {
			if (current) return;
			transition_in(default_slot, local);
			current = true;
		},

		o: function outro(local) {
			transition_out(default_slot, local);
			current = false;
		},

		d: function destroy(detaching) {
			if (detaching) {
				detach_dev(div);
			}

			if (default_slot) default_slot.d(detaching);
			unassign_div();
		}
	};
	dispatch_dev("SvelteRegisterBlock", { block, id: create_each_block.name, type: "each", source: "(81:0) {#each nodes as node}", ctx });
	return block;
}

function create_fragment(ctx) {
	var div, canvas_1, t, div_class_value, current;

	let each_value = ctx.nodes;

	let each_blocks = [];

	for (let i = 0; i < each_value.length; i += 1) {
		each_blocks[i] = create_each_block(get_each_context(ctx, each_value, i));
	}

	const out = i => transition_out(each_blocks[i], 1, 1, () => {
		each_blocks[i] = null;
	});

	const block = {
		c: function create() {
			div = element("div");
			canvas_1 = element("canvas");
			t = space();

			for (let i = 0; i < each_blocks.length; i += 1) {
				each_blocks[i].c();
			}
			this.h();
		},

		l: function claim(nodes) {
			div = claim_element(nodes, "DIV", { class: true }, false);
			var div_nodes = children(div);

			canvas_1 = claim_element(div_nodes, "CANVAS", { width: true, height: true, class: true }, false);
			var canvas_1_nodes = children(canvas_1);

			canvas_1_nodes.forEach(detach_dev);
			t = claim_space(div_nodes);

			for (let i = 0; i < each_blocks.length; i += 1) {
				each_blocks[i].l(div_nodes);
			}

			div_nodes.forEach(detach_dev);
			this.h();
		},

		h: function hydrate() {
			attr_dev(canvas_1, "width", WIDTH);
			attr_dev(canvas_1, "height", HEIGHT);
			attr_dev(canvas_1, "class", "w-full");
			add_location(canvas_1, file, 79, 0, 2159);
			attr_dev(div, "class", div_class_value = "relative " + ctx.$$props.class + " svelte-160k95n");
			add_location(div, file, 78, 0, 2120);
		},

		m: function mount(target, anchor) {
			insert_dev(target, div, anchor);
			append_dev(div, canvas_1);
			ctx.canvas_1_binding(canvas_1);
			append_dev(div, t);

			for (let i = 0; i < each_blocks.length; i += 1) {
				each_blocks[i].m(div, null);
			}

			current = true;
		},

		p: function update(changed, ctx) {
			if (changed.nodes || changed.$$scope) {
				each_value = ctx.nodes;

				let i;
				for (i = 0; i < each_value.length; i += 1) {
					const child_ctx = get_each_context(ctx, each_value, i);

					if (each_blocks[i]) {
						each_blocks[i].p(changed, child_ctx);
						transition_in(each_blocks[i], 1);
					} else {
						each_blocks[i] = create_each_block(child_ctx);
						each_blocks[i].c();
						transition_in(each_blocks[i], 1);
						each_blocks[i].m(div, null);
					}
				}

				group_outros();
				for (i = each_value.length; i < each_blocks.length; i += 1) {
					out(i);
				}
				check_outros();
			}

			if ((!current || changed.$$props) && div_class_value !== (div_class_value = "relative " + ctx.$$props.class + " svelte-160k95n")) {
				attr_dev(div, "class", div_class_value);
			}
		},

		i: function intro(local) {
			if (current) return;
			for (let i = 0; i < each_value.length; i += 1) {
				transition_in(each_blocks[i]);
			}

			current = true;
		},

		o: function outro(local) {
			each_blocks = each_blocks.filter(Boolean);
			for (let i = 0; i < each_blocks.length; i += 1) {
				transition_out(each_blocks[i]);
			}

			current = false;
		},

		d: function destroy(detaching) {
			if (detaching) {
				detach_dev(div);
			}

			ctx.canvas_1_binding(null);

			destroy_each(each_blocks, detaching);
		}
	};
	dispatch_dev("SvelteRegisterBlock", { block, id: create_fragment.name, type: "component", source: "", ctx });
	return block;
}

const WIDTH = 512, HEIGHT = 512;

function project(p, width, height) {
return { x: (p.x + 5)/10 * width, y: (p.y + 5)/10 * height };
}

function instance($$self, $$props, $$invalidate) {
	

let { nodes = [], edges = [], onrendered  = ()=>{} } = $$props;
/*export let width = 500;
export let height = 500;*/

let canvas;

let renderer;

let last_nodes;
let last_edges;

	let { $$slots = {}, $$scope } = $$props;

	function canvas_1_binding($$value) {
		binding_callbacks[$$value ? 'unshift' : 'push'](() => {
			$$invalidate('canvas', canvas = $$value);
		});
	}

	function div_binding($$value, node) {
		if (node.ref === $$value) return;
		binding_callbacks[$$value ? 'unshift' : 'push'](() => {
			node.ref = $$value;
			$$invalidate('node', node), $$invalidate('canvas', canvas), $$invalidate('nodes', nodes), $$invalidate('last_nodes', last_nodes), $$invalidate('edges', edges), $$invalidate('last_edges', last_edges), $$invalidate('renderer', renderer), $$invalidate('onrendered', onrendered);
		});
	}

	$$self.$set = $$new_props => {
		$$invalidate('$$props', $$props = assign$2(assign$2({}, $$props), $$new_props));
		if ('nodes' in $$new_props) $$invalidate('nodes', nodes = $$new_props.nodes);
		if ('edges' in $$new_props) $$invalidate('edges', edges = $$new_props.edges);
		if ('onrendered' in $$new_props) $$invalidate('onrendered', onrendered = $$new_props.onrendered);
		if ('$$scope' in $$new_props) $$invalidate('$$scope', $$scope = $$new_props.$$scope);
	};

	$$self.$capture_state = () => {
		return { nodes, edges, onrendered, canvas, renderer, last_nodes, last_edges };
	};

	$$self.$inject_state = $$new_props => {
		$$invalidate('$$props', $$props = assign$2(assign$2({}, $$props), $$new_props));
		if ('nodes' in $$props) $$invalidate('nodes', nodes = $$new_props.nodes);
		if ('edges' in $$props) $$invalidate('edges', edges = $$new_props.edges);
		if ('onrendered' in $$props) $$invalidate('onrendered', onrendered = $$new_props.onrendered);
		if ('canvas' in $$props) $$invalidate('canvas', canvas = $$new_props.canvas);
		if ('renderer' in $$props) $$invalidate('renderer', renderer = $$new_props.renderer);
		if ('last_nodes' in $$props) $$invalidate('last_nodes', last_nodes = $$new_props.last_nodes);
		if ('last_edges' in $$props) $$invalidate('last_edges', last_edges = $$new_props.last_edges);
	};

	$$self.$$.update = ($$dirty = { canvas: 1, nodes: 1, last_nodes: 1, edges: 1, last_edges: 1, renderer: 1, onrendered: 1 }) => {
		if ($$dirty.canvas || $$dirty.nodes || $$dirty.last_nodes || $$dirty.edges || $$dirty.last_edges || $$dirty.renderer || $$dirty.onrendered) { if(canvas && (nodes != last_nodes || edges != last_edges)) {
		  $$invalidate('last_nodes', last_nodes = nodes);
		  $$invalidate('last_edges', last_edges = edges);
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
			$$invalidate('renderer', renderer = new Springy.Renderer(layout,
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
		          node.style.left = p.x*100/width + "%";
		        if(parseInt(node.style.top) != Math.floor(p.y))
		          node.style.top = p.y*100/height + "%";
					}
				},
		    function onRenderStop() {
		      onrendered();
		    }
			));
			renderer.start();
		} }
	};

	return {
		nodes,
		edges,
		onrendered,
		canvas,
		$$props,
		canvas_1_binding,
		div_binding,
		$$props: $$props = exclude_internal_props($$props),
		$$slots,
		$$scope
	};
}

class Network extends SvelteComponentDev {
	constructor(options) {
		super(options);
		init(this, options, instance, create_fragment, safe_not_equal, ["nodes", "edges", "onrendered"]);
		dispatch_dev("SvelteRegisterComponent", { component: this, tagName: "Network", options, id: create_fragment.name });
	}

	get nodes() {
		throw new Error("<Network>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
	}

	set nodes(value) {
		throw new Error("<Network>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
	}

	get edges() {
		throw new Error("<Network>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
	}

	set edges(value) {
		throw new Error("<Network>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
	}

	get onrendered() {
		throw new Error("<Network>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
	}

	set onrendered(value) {
		throw new Error("<Network>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
	}
}

/* src/components/Timeline2.svelte generated by Svelte v3.12.1 */

const file$1 = "src/components/Timeline2.svelte";

function get_each_context$1(ctx, list, i) {
	const child_ctx = Object.create(ctx);
	child_ctx.data = list[i];
	return child_ctx;
}

function get_each_context_1(ctx, list, i) {
	const child_ctx = Object.create(ctx);
	child_ctx.game = list[i];
	return child_ctx;
}

function get_each_context_2(ctx, list, i) {
	const child_ctx = Object.create(ctx);
	child_ctx.mb = list[i];
	return child_ctx;
}

function get_each_context_3(ctx, list, i) {
	const child_ctx = Object.create(ctx);
	child_ctx.mb = list[i];
	return child_ctx;
}

function get_each_context_4(ctx, list, i) {
	const child_ctx = Object.create(ctx);
	child_ctx.mb = list[i];
	return child_ctx;
}

// (1:0) {#if header}
function create_if_block_5(ctx) {
	var div3, div0, t0, div1, t1, div2;

	let each_value_4 = ["mb-2", "mb-1", "-mb-2", "-mb-8"];

	let each_blocks_2 = [];

	for (let i = 0; i < 4; i += 1) {
		each_blocks_2[i] = create_each_block_4(get_each_context_4(ctx, each_value_4, i));
	}

	let each_value_3 = ["-mb-8", "-mb-2", "mb-1", "mb-2", "mb-1", "-mb-2", "-mb-8"];

	let each_blocks_1 = [];

	for (let i = 0; i < 7; i += 1) {
		each_blocks_1[i] = create_each_block_3(get_each_context_3(ctx, each_value_3, i));
	}

	let each_value_2 = ["mb-2", "mb-1", "-mb-2", "-mb-8"].reverse();

	let each_blocks = [];

	for (let i = 0; i < each_value_2.length; i += 1) {
		each_blocks[i] = create_each_block_2(get_each_context_2(ctx, each_value_2, i));
	}

	const block = {
		c: function create() {
			div3 = element("div");
			div0 = element("div");

			for (let i = 0; i < 4; i += 1) {
				each_blocks_2[i].c();
			}

			t0 = space();
			div1 = element("div");

			for (let i = 0; i < 7; i += 1) {
				each_blocks_1[i].c();
			}

			t1 = space();
			div2 = element("div");

			for (let i = 0; i < each_blocks.length; i += 1) {
				each_blocks[i].c();
			}
			this.h();
		},

		l: function claim(nodes) {
			div3 = claim_element(nodes, "DIV", { class: true }, false);
			var div3_nodes = children(div3);

			div0 = claim_element(div3_nodes, "DIV", { class: true }, false);
			var div0_nodes = children(div0);

			for (let i = 0; i < 4; i += 1) {
				each_blocks_2[i].l(div0_nodes);
			}

			div0_nodes.forEach(detach_dev);
			t0 = claim_space(div3_nodes);

			div1 = claim_element(div3_nodes, "DIV", { class: true }, false);
			var div1_nodes = children(div1);

			for (let i = 0; i < 7; i += 1) {
				each_blocks_1[i].l(div1_nodes);
			}

			div1_nodes.forEach(detach_dev);
			t1 = claim_space(div3_nodes);

			div2 = claim_element(div3_nodes, "DIV", { class: true }, false);
			var div2_nodes = children(div2);

			for (let i = 0; i < each_blocks.length; i += 1) {
				each_blocks[i].l(div2_nodes);
			}

			div2_nodes.forEach(detach_dev);
			div3_nodes.forEach(detach_dev);
			this.h();
		},

		h: function hydrate() {
			attr_dev(div0, "class", "w-1/4 bg-gray-500 text-center overflow-hidden flex flex-row justify-around items-center");
			add_location(div0, file$1, 2, 2, 50);
			attr_dev(div1, "class", "w-1/2 bg-white text-center overflow-hidden flex flex-row justify-around items-center");
			add_location(div1, file$1, 9, 2, 484);
			attr_dev(div2, "class", "w-1/4 bg-gray-500 text-center overflow-hidden flex flex-row justify-around items-center");
			add_location(div2, file$1, 16, 2, 935);
			attr_dev(div3, "class", "w-full flex flex-row");
			add_location(div3, file$1, 1, 0, 13);
		},

		m: function mount(target, anchor) {
			insert_dev(target, div3, anchor);
			append_dev(div3, div0);

			for (let i = 0; i < 4; i += 1) {
				each_blocks_2[i].m(div0, null);
			}

			append_dev(div3, t0);
			append_dev(div3, div1);

			for (let i = 0; i < 7; i += 1) {
				each_blocks_1[i].m(div1, null);
			}

			append_dev(div3, t1);
			append_dev(div3, div2);

			for (let i = 0; i < each_blocks.length; i += 1) {
				each_blocks[i].m(div2, null);
			}
		},

		p: function update(changed, ctx) {
			if (changed.faMoon) {
				each_value_4 = ["mb-2", "mb-1", "-mb-2", "-mb-8"];

				let i;
				for (i = 0; i < each_value_4.length; i += 1) {
					const child_ctx = get_each_context_4(ctx, each_value_4, i);

					if (each_blocks_2[i]) {
						each_blocks_2[i].p(changed, child_ctx);
					} else {
						each_blocks_2[i] = create_each_block_4(child_ctx);
						each_blocks_2[i].c();
						each_blocks_2[i].m(div0, null);
					}
				}

				for (; i < 4; i += 1) {
					each_blocks_2[i].d(1);
				}
			}

			if (changed.faSun) {
				each_value_3 = ["-mb-8", "-mb-2", "mb-1", "mb-2", "mb-1", "-mb-2", "-mb-8"];

				let i;
				for (i = 0; i < each_value_3.length; i += 1) {
					const child_ctx = get_each_context_3(ctx, each_value_3, i);

					if (each_blocks_1[i]) {
						each_blocks_1[i].p(changed, child_ctx);
					} else {
						each_blocks_1[i] = create_each_block_3(child_ctx);
						each_blocks_1[i].c();
						each_blocks_1[i].m(div1, null);
					}
				}

				for (; i < 7; i += 1) {
					each_blocks_1[i].d(1);
				}
			}

			if (changed.faMoon) {
				each_value_2 = ["mb-2", "mb-1", "-mb-2", "-mb-8"].reverse();

				let i;
				for (i = 0; i < each_value_2.length; i += 1) {
					const child_ctx = get_each_context_2(ctx, each_value_2, i);

					if (each_blocks[i]) {
						each_blocks[i].p(changed, child_ctx);
					} else {
						each_blocks[i] = create_each_block_2(child_ctx);
						each_blocks[i].c();
						each_blocks[i].m(div2, null);
					}
				}

				for (; i < each_blocks.length; i += 1) {
					each_blocks[i].d(1);
				}
				each_blocks.length = each_value_2.length;
			}
		},

		d: function destroy(detaching) {
			if (detaching) {
				detach_dev(div3);
			}

			destroy_each(each_blocks_2, detaching);

			destroy_each(each_blocks_1, detaching);

			destroy_each(each_blocks, detaching);
		}
	};
	dispatch_dev("SvelteRegisterBlock", { block, id: create_if_block_5.name, type: "if", source: "(1:0) {#if header}", ctx });
	return block;
}

// (4:4) {#each ["mb-2", "mb-1", "-mb-2", "-mb-8"] as mb}
function create_each_block_4(ctx) {
	var svg_1, path;

	const block = {
		c: function create() {
			svg_1 = svg_element("svg");
			path = svg_element("path");
			this.h();
		},

		l: function claim(nodes) {
			svg_1 = claim_element(nodes, "svg", { "area-hidden": true, role: true, xmlns: true, viewBox: true, class: true }, true);
			var svg_1_nodes = children(svg_1);

			path = claim_element(svg_1_nodes, "path", { fill: true, d: true }, true);
			var path_nodes = children(path);

			path_nodes.forEach(detach_dev);
			svg_1_nodes.forEach(detach_dev);
			this.h();
		},

		h: function hydrate() {
			attr_dev(path, "fill", "currentColor");
			attr_dev(path, "d", faMoon_2.icon[4]);
			add_location(path, file$1, 5, 6, 401);
			attr_dev(svg_1, "area-hidden", "true");
			attr_dev(svg_1, "role", "img");
			attr_dev(svg_1, "xmlns", "http://www.w3.org/2000/svg");
			attr_dev(svg_1, "viewBox", "0 0 " + faMoon_2.icon[0] + " " + faMoon_2.icon[1]);
			attr_dev(svg_1, "class", "" + ctx.mb + " w-4 h-4 overflow-visible inline-block text-yellow-400" + " svelte-1mrw0kg");
			add_location(svg_1, file$1, 4, 4, 209);
		},

		m: function mount(target, anchor) {
			insert_dev(target, svg_1, anchor);
			append_dev(svg_1, path);
		},

		p: noop,

		d: function destroy(detaching) {
			if (detaching) {
				detach_dev(svg_1);
			}
		}
	};
	dispatch_dev("SvelteRegisterBlock", { block, id: create_each_block_4.name, type: "each", source: "(4:4) {#each [\"mb-2\", \"mb-1\", \"-mb-2\", \"-mb-8\"] as mb}", ctx });
	return block;
}

// (11:4) {#each ["-mb-8", "-mb-2", "mb-1", "mb-2", "mb-1", "-mb-2", "-mb-8"] as mb}
function create_each_block_3(ctx) {
	var svg_1, path;

	const block = {
		c: function create() {
			svg_1 = svg_element("svg");
			path = svg_element("path");
			this.h();
		},

		l: function claim(nodes) {
			svg_1 = claim_element(nodes, "svg", { "area-hidden": true, role: true, xmlns: true, viewBox: true, class: true }, true);
			var svg_1_nodes = children(svg_1);

			path = claim_element(svg_1_nodes, "path", { fill: true, d: true }, true);
			var path_nodes = children(path);

			path_nodes.forEach(detach_dev);
			svg_1_nodes.forEach(detach_dev);
			this.h();
		},

		h: function hydrate() {
			attr_dev(path, "fill", "currentColor");
			attr_dev(path, "d", faSun_2.icon[4]);
			add_location(path, file$1, 12, 6, 853);
			attr_dev(svg_1, "area-hidden", "true");
			attr_dev(svg_1, "role", "img");
			attr_dev(svg_1, "xmlns", "http://www.w3.org/2000/svg");
			attr_dev(svg_1, "viewBox", "0 0 " + faSun_2.icon[0] + " " + faSun_2.icon[1]);
			attr_dev(svg_1, "class", "" + ctx.mb + " w-4 h-4 overflow-visible inline-block text-red-400" + " svelte-1mrw0kg");
			add_location(svg_1, file$1, 11, 4, 666);
		},

		m: function mount(target, anchor) {
			insert_dev(target, svg_1, anchor);
			append_dev(svg_1, path);
		},

		p: noop,

		d: function destroy(detaching) {
			if (detaching) {
				detach_dev(svg_1);
			}
		}
	};
	dispatch_dev("SvelteRegisterBlock", { block, id: create_each_block_3.name, type: "each", source: "(11:4) {#each [\"-mb-8\", \"-mb-2\", \"mb-1\", \"mb-2\", \"mb-1\", \"-mb-2\", \"-mb-8\"] as mb}", ctx });
	return block;
}

// (18:4) {#each ["mb-2", "mb-1", "-mb-2", "-mb-8"].reverse() as mb}
function create_each_block_2(ctx) {
	var svg_1, path;

	const block = {
		c: function create() {
			svg_1 = svg_element("svg");
			path = svg_element("path");
			this.h();
		},

		l: function claim(nodes) {
			svg_1 = claim_element(nodes, "svg", { "area-hidden": true, role: true, xmlns: true, viewBox: true, class: true }, true);
			var svg_1_nodes = children(svg_1);

			path = claim_element(svg_1_nodes, "path", { fill: true, d: true }, true);
			var path_nodes = children(path);

			path_nodes.forEach(detach_dev);
			svg_1_nodes.forEach(detach_dev);
			this.h();
		},

		h: function hydrate() {
			attr_dev(path, "fill", "currentColor");
			attr_dev(path, "d", faMoon_2.icon[4]);
			add_location(path, file$1, 19, 6, 1296);
			attr_dev(svg_1, "area-hidden", "true");
			attr_dev(svg_1, "role", "img");
			attr_dev(svg_1, "xmlns", "http://www.w3.org/2000/svg");
			attr_dev(svg_1, "viewBox", "0 0 " + faMoon_2.icon[0] + " " + faMoon_2.icon[1]);
			attr_dev(svg_1, "class", "" + ctx.mb + " w-4 h-4 overflow-visible inline-block text-yellow-400" + " svelte-1mrw0kg");
			add_location(svg_1, file$1, 18, 4, 1104);
		},

		m: function mount(target, anchor) {
			insert_dev(target, svg_1, anchor);
			append_dev(svg_1, path);
		},

		p: noop,

		d: function destroy(detaching) {
			if (detaching) {
				detach_dev(svg_1);
			}
		}
	};
	dispatch_dev("SvelteRegisterBlock", { block, id: create_each_block_2.name, type: "each", source: "(18:4) {#each [\"mb-2\", \"mb-1\", \"-mb-2\", \"-mb-8\"].reverse() as mb}", ctx });
	return block;
}

// (37:12) {#if game.box_art_url}
function create_if_block_4(ctx) {
	var image, image_xlink_href_value;

	const block = {
		c: function create() {
			image = svg_element("image");
			this.h();
		},

		l: function claim(nodes) {
			image = claim_element(nodes, "image", { "xlink:href": true, width: true, height: true, x: true, y: true }, true);
			var image_nodes = children(image);

			image_nodes.forEach(detach_dev);
			this.h();
		},

		h: function hydrate() {
			xlink_attr(image, "xlink:href", image_xlink_href_value = ctx.game.box_art_url.replace("{width}", ctx.game_box_art_width).replace("{height}", ctx.game_box_art_height));
			attr_dev(image, "width", ctx.game_box_art_width);
			attr_dev(image, "height", ctx.game_box_art_height);
			attr_dev(image, "x", "0");
			attr_dev(image, "y", "0");
			add_location(image, file$1, 37, 14, 2145);
		},

		m: function mount(target, anchor) {
			insert_dev(target, image, anchor);
		},

		p: function update(changed, ctx) {
			if ((changed.games || changed.game_box_art_width || changed.game_box_art_height) && image_xlink_href_value !== (image_xlink_href_value = ctx.game.box_art_url.replace("{width}", ctx.game_box_art_width).replace("{height}", ctx.game_box_art_height))) {
				xlink_attr(image, "xlink:href", image_xlink_href_value);
			}

			if (changed.game_box_art_width) {
				attr_dev(image, "width", ctx.game_box_art_width);
			}

			if (changed.game_box_art_height) {
				attr_dev(image, "height", ctx.game_box_art_height);
			}
		},

		d: function destroy(detaching) {
			if (detaching) {
				detach_dev(image);
			}
		}
	};
	dispatch_dev("SvelteRegisterBlock", { block, id: create_if_block_4.name, type: "if", source: "(37:12) {#if game.box_art_url}", ctx });
	return block;
}

// (35:5) {#each Object.values(games) as game}
function create_each_block_1(ctx) {
	var pattern, pattern_id_value;

	var if_block = (ctx.game.box_art_url) && create_if_block_4(ctx);

	const block = {
		c: function create() {
			pattern = svg_element("pattern");
			if (if_block) if_block.c();
			this.h();
		},

		l: function claim(nodes) {
			pattern = claim_element(nodes, "pattern", { id: true, width: true, height: true, patternUnits: true }, true);
			var pattern_nodes = children(pattern);

			if (if_block) if_block.l(pattern_nodes);
			pattern_nodes.forEach(detach_dev);
			this.h();
		},

		h: function hydrate() {
			attr_dev(pattern, "id", pattern_id_value = "game-box-art-" + ctx.game.id);
			attr_dev(pattern, "width", ctx.game_box_art_width);
			attr_dev(pattern, "height", ctx.game_box_art_height);
			attr_dev(pattern, "patternUnits", "userSpaceOnUse");
			add_location(pattern, file$1, 35, 5, 1972);
		},

		m: function mount(target, anchor) {
			insert_dev(target, pattern, anchor);
			if (if_block) if_block.m(pattern, null);
		},

		p: function update(changed, ctx) {
			if (ctx.game.box_art_url) {
				if (if_block) {
					if_block.p(changed, ctx);
				} else {
					if_block = create_if_block_4(ctx);
					if_block.c();
					if_block.m(pattern, null);
				}
			} else if (if_block) {
				if_block.d(1);
				if_block = null;
			}

			if ((changed.games) && pattern_id_value !== (pattern_id_value = "game-box-art-" + ctx.game.id)) {
				attr_dev(pattern, "id", pattern_id_value);
			}

			if (changed.game_box_art_width) {
				attr_dev(pattern, "width", ctx.game_box_art_width);
			}

			if (changed.game_box_art_height) {
				attr_dev(pattern, "height", ctx.game_box_art_height);
			}
		},

		d: function destroy(detaching) {
			if (detaching) {
				detach_dev(pattern);
			}

			if (if_block) if_block.d();
		}
	};
	dispatch_dev("SvelteRegisterBlock", { block, id: create_each_block_1.name, type: "each", source: "(35:5) {#each Object.values(games) as game}", ctx });
	return block;
}

// (72:10) {#if days_ago == 0 && now_x}
function create_if_block_3(ctx) {
	var line, text_1, t, text_1_transform_value;

	const block = {
		c: function create() {
			line = svg_element("line");
			text_1 = svg_element("text");
			t = text("현재\n          ");
			this.h();
		},

		l: function claim(nodes) {
			line = claim_element(nodes, "line", { x1: true, x2: true, y1: true, y2: true, stroke: true, "stroke-width": true, "stroke-dasharray": true }, true);
			var line_nodes = children(line);

			line_nodes.forEach(detach_dev);

			text_1 = claim_element(nodes, "text", { fill: true, "font-size": true, "font-family": true, transform: true }, true);
			var text_1_nodes = children(text_1);

			t = claim_text(text_1_nodes, "현재\n          ");
			text_1_nodes.forEach(detach_dev);
			this.h();
		},

		h: function hydrate() {
			attr_dev(line, "x1", ctx.now_x);
			attr_dev(line, "x2", ctx.now_x);
			attr_dev(line, "y1", 0);
			attr_dev(line, "y2", height);
			attr_dev(line, "stroke", "#FF4560");
			attr_dev(line, "stroke-width", "0.5");
			attr_dev(line, "stroke-dasharray", "4 4");
			add_location(line, file$1, 72, 10, 4317);
			attr_dev(text_1, "fill", "#FF4560");
			attr_dev(text_1, "font-size", "10");
			attr_dev(text_1, "font-family", "Arial");
			attr_dev(text_1, "transform", text_1_transform_value = "translate(" + (ctx.now_x + 3) + ", 3) rotate(90)");
			add_location(text_1, file$1, 75, 10, 4461);
		},

		m: function mount(target, anchor) {
			insert_dev(target, line, anchor);
			insert_dev(target, text_1, anchor);
			append_dev(text_1, t);
		},

		p: function update(changed, ctx) {
			if (changed.now_x) {
				attr_dev(line, "x1", ctx.now_x);
				attr_dev(line, "x2", ctx.now_x);
			}

			if ((changed.now_x) && text_1_transform_value !== (text_1_transform_value = "translate(" + (ctx.now_x + 3) + ", 3) rotate(90)")) {
				attr_dev(text_1, "transform", text_1_transform_value);
			}
		},

		d: function destroy(detaching) {
			if (detaching) {
				detach_dev(line);
				detach_dev(text_1);
			}
		}
	};
	dispatch_dev("SvelteRegisterBlock", { block, id: create_if_block_3.name, type: "if", source: "(72:10) {#if days_ago == 0 && now_x}", ctx });
	return block;
}

// (89:12) {:else}
function create_else_block(ctx) {
	var path, path_d_value;

	const block = {
		c: function create() {
			path = svg_element("path");
			this.h();
		},

		l: function claim(nodes) {
			path = claim_element(nodes, "path", { fill: true, stroke: true, "stroke-width": true, d: true }, true);
			var path_nodes = children(path);

			path_nodes.forEach(detach_dev);
			this.h();
		},

		h: function hydrate() {
			attr_dev(path, "fill", "#000000");
			attr_dev(path, "stroke", "#B498AE");
			attr_dev(path, "stroke-width", "1.0");
			attr_dev(path, "d", path_d_value = ctx.data.path[1]);
			add_location(path, file$1, 89, 14, 5170);
		},

		m: function mount(target, anchor) {
			insert_dev(target, path, anchor);
		},

		p: function update(changed, ctx) {
			if ((changed.data_chunks) && path_d_value !== (path_d_value = ctx.data.path[1])) {
				attr_dev(path, "d", path_d_value);
			}
		},

		d: function destroy(detaching) {
			if (detaching) {
				detach_dev(path);
			}
		}
	};
	dispatch_dev("SvelteRegisterBlock", { block, id: create_else_block.name, type: "else", source: "(89:12) {:else}", ctx });
	return block;
}

// (85:12) {#if data[0] && data[0][5] && data[0][5].game && games[data[0][5].game.id] && data[0][5].game.box_art_url}
function create_if_block_2(ctx) {
	var path, path_d_value;

	const block = {
		c: function create() {
			path = svg_element("path");
			this.h();
		},

		l: function claim(nodes) {
			path = claim_element(nodes, "path", { style: true, stroke: true, "stroke-width": true, d: true }, true);
			var path_nodes = children(path);

			path_nodes.forEach(detach_dev);
			this.h();
		},

		h: function hydrate() {
			set_style(path, "fill", "url(#game-box-art-" + ctx.data[0][5].game.id + ")");
			attr_dev(path, "stroke", "#A0AEC0");
			attr_dev(path, "stroke-width", "1.0");
			attr_dev(path, "d", path_d_value = ctx.data.path[1]);
			add_location(path, file$1, 85, 14, 4988);
		},

		m: function mount(target, anchor) {
			insert_dev(target, path, anchor);
		},

		p: function update(changed, ctx) {
			if (changed.data_chunks) {
				set_style(path, "fill", "url(#game-box-art-" + ctx.data[0][5].game.id + ")");
			}

			if ((changed.data_chunks) && path_d_value !== (path_d_value = ctx.data.path[1])) {
				attr_dev(path, "d", path_d_value);
			}
		},

		d: function destroy(detaching) {
			if (detaching) {
				detach_dev(path);
			}
		}
	};
	dispatch_dev("SvelteRegisterBlock", { block, id: create_if_block_2.name, type: "if", source: "(85:12) {#if data[0] && data[0][5] && data[0][5].game && games[data[0][5].game.id] && data[0][5].game.box_art_url}", ctx });
	return block;
}

// (82:5) {#each data_chunks as data}
function create_each_block$1(ctx) {
	var path0, path0_d_value, path1, path1_d_value;

	function select_block_type(changed, ctx) {
		if (ctx.data[0] && ctx.data[0][5] && ctx.data[0][5].game && ctx.games[ctx.data[0][5].game.id] && ctx.data[0][5].game.box_art_url) return create_if_block_2;
		return create_else_block;
	}

	var current_block_type = select_block_type(null, ctx);
	var if_block = current_block_type(ctx);

	const block = {
		c: function create() {
			path0 = svg_element("path");
			if_block.c();
			path1 = svg_element("path");
			this.h();
		},

		l: function claim(nodes) {
			path0 = claim_element(nodes, "path", { fill: true, stroke: true, "stroke-width": true, d: true }, true);
			var path0_nodes = children(path0);

			path0_nodes.forEach(detach_dev);
			if_block.l(nodes);

			path1 = claim_element(nodes, "path", { fill: true, stroke: true, "stroke-width": true, d: true, "stroke-linecap": true, "stroke-dasharray": true }, true);
			var path1_nodes = children(path1);

			path1_nodes.forEach(detach_dev);
			this.h();
		},

		h: function hydrate() {
			attr_dev(path0, "fill", "#CBD5E0");
			attr_dev(path0, "stroke", "#A0AEC0");
			attr_dev(path0, "stroke-width", "1.0");
			attr_dev(path0, "d", path0_d_value = ctx.data.path[0]);
			add_location(path0, file$1, 83, 12, 4778);
			attr_dev(path1, "fill", "none");
			attr_dev(path1, "stroke", "#FF4560");
			attr_dev(path1, "stroke-width", "3.0");
			attr_dev(path1, "d", path1_d_value = ctx.data.path[2]);
			attr_dev(path1, "stroke-linecap", "round");
			attr_dev(path1, "stroke-dasharray", "1 6");
			add_location(path1, file$1, 93, 12, 5311);
		},

		m: function mount(target, anchor) {
			insert_dev(target, path0, anchor);
			if_block.m(target, anchor);
			insert_dev(target, path1, anchor);
		},

		p: function update(changed, ctx) {
			if ((changed.data_chunks) && path0_d_value !== (path0_d_value = ctx.data.path[0])) {
				attr_dev(path0, "d", path0_d_value);
			}

			if (current_block_type === (current_block_type = select_block_type(changed, ctx)) && if_block) {
				if_block.p(changed, ctx);
			} else {
				if_block.d(1);
				if_block = current_block_type(ctx);
				if (if_block) {
					if_block.c();
					if_block.m(path1.parentNode, path1);
				}
			}

			if ((changed.data_chunks) && path1_d_value !== (path1_d_value = ctx.data.path[2])) {
				attr_dev(path1, "d", path1_d_value);
			}
		},

		d: function destroy(detaching) {
			if (detaching) {
				detach_dev(path0);
			}

			if_block.d(detaching);

			if (detaching) {
				detach_dev(path1);
			}
		}
	};
	dispatch_dev("SvelteRegisterBlock", { block, id: create_each_block$1.name, type: "each", source: "(82:5) {#each data_chunks as data}", ctx });
	return block;
}

// (96:10) {#if streamer.is_streaming && days_ago == 0 && last_data}
function create_if_block_1(ctx) {
	var circle, circle_cx_value, circle_cy_value, text_1, t, text_1_x_value, text_1_y_value;

	const block = {
		c: function create() {
			circle = svg_element("circle");
			text_1 = svg_element("text");
			t = text("방송중\n            ");
			this.h();
		},

		l: function claim(nodes) {
			circle = claim_element(nodes, "circle", { cx: true, cy: true, r: true, class: true, fill: true }, true);
			var circle_nodes = children(circle);

			circle_nodes.forEach(detach_dev);

			text_1 = claim_element(nodes, "text", { fill: true, "font-size": true, "font-family": true, x: true, y: true, class: true }, true);
			var text_1_nodes = children(text_1);

			t = claim_text(text_1_nodes, "방송중\n            ");
			text_1_nodes.forEach(detach_dev);
			this.h();
		},

		h: function hydrate() {
			attr_dev(circle, "cx", circle_cx_value = ctx.xscale(ctx.last_data[0]));
			attr_dev(circle, "cy", circle_cy_value = height * (ctx.$max_y_axis - (ctx.last_data[1])) / ctx.$max_y_axis);
			attr_dev(circle, "r", "4");
			attr_dev(circle, "class", "is_streaming_label svelte-1mrw0kg");
			attr_dev(circle, "fill", "#FF4560");
			add_location(circle, file$1, 96, 12, 5529);
			attr_dev(text_1, "fill", "#FF4560");
			attr_dev(text_1, "font-size", "10");
			attr_dev(text_1, "font-family", "Arial");
			attr_dev(text_1, "x", text_1_x_value = ctx.xscale(ctx.last_data[0]) + 6);
			attr_dev(text_1, "y", text_1_y_value = height * (ctx.$max_y_axis - (ctx.last_data[1])) / ctx.$max_y_axis);
			attr_dev(text_1, "class", "is_streaming_label svelte-1mrw0kg");
			add_location(text_1, file$1, 102, 12, 5756);
		},

		m: function mount(target, anchor) {
			insert_dev(target, circle, anchor);
			insert_dev(target, text_1, anchor);
			append_dev(text_1, t);
		},

		p: function update(changed, ctx) {
			if ((changed.last_data) && circle_cx_value !== (circle_cx_value = ctx.xscale(ctx.last_data[0]))) {
				attr_dev(circle, "cx", circle_cx_value);
			}

			if ((changed.$max_y_axis || changed.last_data) && circle_cy_value !== (circle_cy_value = height * (ctx.$max_y_axis - (ctx.last_data[1])) / ctx.$max_y_axis)) {
				attr_dev(circle, "cy", circle_cy_value);
			}

			if ((changed.last_data) && text_1_x_value !== (text_1_x_value = ctx.xscale(ctx.last_data[0]) + 6)) {
				attr_dev(text_1, "x", text_1_x_value);
			}

			if ((changed.$max_y_axis || changed.last_data) && text_1_y_value !== (text_1_y_value = height * (ctx.$max_y_axis - (ctx.last_data[1])) / ctx.$max_y_axis)) {
				attr_dev(text_1, "y", text_1_y_value);
			}
		},

		d: function destroy(detaching) {
			if (detaching) {
				detach_dev(circle);
				detach_dev(text_1);
			}
		}
	};
	dispatch_dev("SvelteRegisterBlock", { block, id: create_if_block_1.name, type: "if", source: "(96:10) {#if streamer.is_streaming && days_ago == 0 && last_data}", ctx });
	return block;
}

// (120:1) {#if tooltip_data}
function create_if_block(ctx) {
	var div7, div6, div0, t0_value = tooltip_data_time_format(ctx.tooltip_data) + "", t0, t1, p0, t2_value = ctx.tooltip_data[5].title + "", t2, t3, div1, svg0, path0, t4, b0, t5_value = ctx.tooltip_data[1] + "", t5, t6, t7, div2, svg1, path1, t8, b1, t9_value = ctx.tooltip_data[1] - ctx.tooltip_data[2] + "", t9, t10, t11, div3, svg2, path2, t12, b2, t13_value = ctx.tooltip_data[2] + "", t13, t14, t15, div4, svg3, path3, t16, b3, t17_value = ctx.tooltip_data[4].toFixed(1) + "", t17, t18, t19, div5, svg4, path4, t20, b4, t21, t22_value = ctx.Math.floor((ctx.tooltip_data[0] - ctx.tooltip_data[5].started_at) / 3600) + "", t22, t23, t24_value = ctx.Math.round((ctx.tooltip_data[0] - ctx.tooltip_data[5].started_at) % 3600 / 60) + "", t24, t25, t26, p1, t27_value = ctx.tooltip_data[5].game != null? ctx.tooltip_data[5].game.name : "" + "", t27, div7_style_value;

	const block = {
		c: function create() {
			div7 = element("div");
			div6 = element("div");
			div0 = element("div");
			t0 = text(t0_value);
			t1 = space();
			p0 = element("p");
			t2 = text(t2_value);
			t3 = space();
			div1 = element("div");
			svg0 = svg_element("svg");
			path0 = svg_element("path");
			t4 = space();
			b0 = element("b");
			t5 = text(t5_value);
			t6 = text("명");
			t7 = space();
			div2 = element("div");
			svg1 = svg_element("svg");
			path1 = svg_element("path");
			t8 = space();
			b1 = element("b");
			t9 = text(t9_value);
			t10 = text("명");
			t11 = space();
			div3 = element("div");
			svg2 = svg_element("svg");
			path2 = svg_element("path");
			t12 = space();
			b2 = element("b");
			t13 = text(t13_value);
			t14 = text("명");
			t15 = space();
			div4 = element("div");
			svg3 = svg_element("svg");
			path3 = svg_element("path");
			t16 = space();
			b3 = element("b");
			t17 = text(t17_value);
			t18 = text("채팅/초");
			t19 = space();
			div5 = element("div");
			svg4 = svg_element("svg");
			path4 = svg_element("path");
			t20 = space();
			b4 = element("b");
			t21 = text("업타임 ");
			t22 = text(t22_value);
			t23 = text("시간");
			t24 = text(t24_value);
			t25 = text("분");
			t26 = space();
			p1 = element("p");
			t27 = text(t27_value);
			this.h();
		},

		l: function claim(nodes) {
			div7 = claim_element(nodes, "DIV", { class: true, style: true }, false);
			var div7_nodes = children(div7);

			div6 = claim_element(div7_nodes, "DIV", { class: true }, false);
			var div6_nodes = children(div6);

			div0 = claim_element(div6_nodes, "DIV", { class: true }, false);
			var div0_nodes = children(div0);

			t0 = claim_text(div0_nodes, t0_value);
			div0_nodes.forEach(detach_dev);
			t1 = claim_space(div6_nodes);

			p0 = claim_element(div6_nodes, "P", { class: true, style: true }, false);
			var p0_nodes = children(p0);

			t2 = claim_text(p0_nodes, t2_value);
			p0_nodes.forEach(detach_dev);
			t3 = claim_space(div6_nodes);

			div1 = claim_element(div6_nodes, "DIV", { class: true }, false);
			var div1_nodes = children(div1);

			svg0 = claim_element(div1_nodes, "svg", { "area-hidden": true, role: true, xmlns: true, viewBox: true, class: true }, true);
			var svg0_nodes = children(svg0);

			path0 = claim_element(svg0_nodes, "path", { fill: true, d: true }, true);
			var path0_nodes = children(path0);

			path0_nodes.forEach(detach_dev);
			svg0_nodes.forEach(detach_dev);
			t4 = claim_space(div1_nodes);

			b0 = claim_element(div1_nodes, "B", {}, false);
			var b0_nodes = children(b0);

			t5 = claim_text(b0_nodes, t5_value);
			t6 = claim_text(b0_nodes, "명");
			b0_nodes.forEach(detach_dev);
			div1_nodes.forEach(detach_dev);
			t7 = claim_space(div6_nodes);

			div2 = claim_element(div6_nodes, "DIV", { class: true }, false);
			var div2_nodes = children(div2);

			svg1 = claim_element(div2_nodes, "svg", { "area-hidden": true, role: true, xmlns: true, viewBox: true, class: true }, true);
			var svg1_nodes = children(svg1);

			path1 = claim_element(svg1_nodes, "path", { fill: true, d: true }, true);
			var path1_nodes = children(path1);

			path1_nodes.forEach(detach_dev);
			svg1_nodes.forEach(detach_dev);
			t8 = claim_space(div2_nodes);

			b1 = claim_element(div2_nodes, "B", {}, false);
			var b1_nodes = children(b1);

			t9 = claim_text(b1_nodes, t9_value);
			t10 = claim_text(b1_nodes, "명");
			b1_nodes.forEach(detach_dev);
			div2_nodes.forEach(detach_dev);
			t11 = claim_space(div6_nodes);

			div3 = claim_element(div6_nodes, "DIV", { class: true }, false);
			var div3_nodes = children(div3);

			svg2 = claim_element(div3_nodes, "svg", { "area-hidden": true, role: true, xmlns: true, viewBox: true, class: true }, true);
			var svg2_nodes = children(svg2);

			path2 = claim_element(svg2_nodes, "path", { fill: true, d: true }, true);
			var path2_nodes = children(path2);

			path2_nodes.forEach(detach_dev);
			svg2_nodes.forEach(detach_dev);
			t12 = claim_space(div3_nodes);

			b2 = claim_element(div3_nodes, "B", {}, false);
			var b2_nodes = children(b2);

			t13 = claim_text(b2_nodes, t13_value);
			t14 = claim_text(b2_nodes, "명");
			b2_nodes.forEach(detach_dev);
			div3_nodes.forEach(detach_dev);
			t15 = claim_space(div6_nodes);

			div4 = claim_element(div6_nodes, "DIV", { class: true, style: true }, false);
			var div4_nodes = children(div4);

			svg3 = claim_element(div4_nodes, "svg", { "area-hidden": true, role: true, xmlns: true, viewBox: true, class: true }, true);
			var svg3_nodes = children(svg3);

			path3 = claim_element(svg3_nodes, "path", { fill: true, d: true }, true);
			var path3_nodes = children(path3);

			path3_nodes.forEach(detach_dev);
			svg3_nodes.forEach(detach_dev);
			t16 = claim_space(div4_nodes);

			b3 = claim_element(div4_nodes, "B", {}, false);
			var b3_nodes = children(b3);

			t17 = claim_text(b3_nodes, t17_value);
			t18 = claim_text(b3_nodes, "채팅/초");
			b3_nodes.forEach(detach_dev);
			div4_nodes.forEach(detach_dev);
			t19 = claim_space(div6_nodes);

			div5 = claim_element(div6_nodes, "DIV", { class: true }, false);
			var div5_nodes = children(div5);

			svg4 = claim_element(div5_nodes, "svg", { "area-hidden": true, role: true, xmlns: true, viewBox: true, class: true }, true);
			var svg4_nodes = children(svg4);

			path4 = claim_element(svg4_nodes, "path", { fill: true, d: true }, true);
			var path4_nodes = children(path4);

			path4_nodes.forEach(detach_dev);
			svg4_nodes.forEach(detach_dev);
			t20 = claim_space(div5_nodes);

			b4 = claim_element(div5_nodes, "B", {}, false);
			var b4_nodes = children(b4);

			t21 = claim_text(b4_nodes, "업타임 ");
			t22 = claim_text(b4_nodes, t22_value);
			t23 = claim_text(b4_nodes, "시간");
			t24 = claim_text(b4_nodes, t24_value);
			t25 = claim_text(b4_nodes, "분");
			b4_nodes.forEach(detach_dev);
			div5_nodes.forEach(detach_dev);
			t26 = claim_space(div6_nodes);

			p1 = claim_element(div6_nodes, "P", { class: true, style: true }, false);
			var p1_nodes = children(p1);

			t27 = claim_text(p1_nodes, t27_value);
			p1_nodes.forEach(detach_dev);
			div6_nodes.forEach(detach_dev);
			div7_nodes.forEach(detach_dev);
			this.h();
		},

		h: function hydrate() {
			attr_dev(div0, "class", "text-gray-600 text-xs font-semibold tracking-wide");
			add_location(div0, file$1, 122, 7, 6756);
			attr_dev(p0, "class", "break-all mt-1 text-gray italic tracking-tight");
			set_style(p0, "font-size", "0.5rem");
			add_location(p0, file$1, 125, 14, 6897);
			attr_dev(path0, "fill", "currentColor");
			attr_dev(path0, "d", faUser_2.icon[4]);
			add_location(path0, file$1, 130, 20, 7327);
			attr_dev(svg0, "area-hidden", "true");
			attr_dev(svg0, "role", "img");
			attr_dev(svg0, "xmlns", "http://www.w3.org/2000/svg");
			attr_dev(svg0, "viewBox", "0 0 " + faUser_2.icon[0] + " " + faUser_2.icon[1]);
			attr_dev(svg0, "class", "w-4 h-4 mr-2 overflow-visible inline-block");
			add_location(svg0, file$1, 129, 18, 7137);
			add_location(b0, file$1, 132, 18, 7419);
			attr_dev(div1, "class", "mt-1 flex flex-row flex-wrap items-center text-gray-900");
			add_location(div1, file$1, 128, 16, 7049);
			attr_dev(path1, "fill", "currentColor");
			attr_dev(path1, "d", faUserSecret_2.icon[4]);
			add_location(path1, file$1, 136, 20, 7777);
			attr_dev(svg1, "area-hidden", "true");
			attr_dev(svg1, "role", "img");
			attr_dev(svg1, "xmlns", "http://www.w3.org/2000/svg");
			attr_dev(svg1, "viewBox", "0 0 " + faUserSecret_2.icon[0] + " " + faUserSecret_2.icon[1]);
			attr_dev(svg1, "class", "w-3 h-3 mr-2 overflow-visible inline-block");
			add_location(svg1, file$1, 135, 18, 7575);
			add_location(b1, file$1, 138, 18, 7875);
			attr_dev(div2, "class", "flex flex-row flex-wrap items-center text-gray-600 text-xs");
			add_location(div2, file$1, 134, 16, 7484);
			attr_dev(path2, "fill", "currentColor");
			attr_dev(path2, "d", faKey_2.icon[4]);
			add_location(path2, file$1, 142, 20, 8239);
			attr_dev(svg2, "area-hidden", "true");
			attr_dev(svg2, "role", "img");
			attr_dev(svg2, "xmlns", "http://www.w3.org/2000/svg");
			attr_dev(svg2, "viewBox", "0 0 " + faKey_2.icon[0] + " " + faKey_2.icon[1]);
			attr_dev(svg2, "class", "w-3 h-3 mr-2 overflow-visible inline-block");
			add_location(svg2, file$1, 141, 18, 8051);
			add_location(b2, file$1, 144, 18, 8330);
			attr_dev(div3, "class", "flex flex-row flex-wrap items-center text-yellow-700 text-xs");
			add_location(div3, file$1, 140, 16, 7958);
			attr_dev(path3, "fill", "currentColor");
			attr_dev(path3, "d", faCommentDots_2.icon[4]);
			add_location(path3, file$1, 148, 20, 8696);
			attr_dev(svg3, "area-hidden", "true");
			attr_dev(svg3, "role", "img");
			attr_dev(svg3, "xmlns", "http://www.w3.org/2000/svg");
			attr_dev(svg3, "viewBox", "0 0 " + faCommentDots_2.icon[0] + " " + faCommentDots_2.icon[1]);
			attr_dev(svg3, "class", "w-4 h-4 mr-2 overflow-visible inline-block");
			add_location(svg3, file$1, 147, 18, 8492);
			add_location(b3, file$1, 150, 18, 8795);
			attr_dev(div4, "class", "mt-1 flex flex-row flex-wrap items-center");
			set_style(div4, "color", "#FF6F61");
			add_location(div4, file$1, 146, 16, 8395);
			attr_dev(path4, "fill", "currentColor");
			attr_dev(path4, "d", faHistory_2.icon[4]);
			add_location(path4, file$1, 154, 20, 9160);
			attr_dev(svg4, "area-hidden", "true");
			attr_dev(svg4, "role", "img");
			attr_dev(svg4, "xmlns", "http://www.w3.org/2000/svg");
			attr_dev(svg4, "viewBox", "0 0 " + faHistory_2.icon[0] + " " + faHistory_2.icon[1]);
			attr_dev(svg4, "class", "w-4 h-4 mr-2 overflow-visible inline-block");
			add_location(svg4, file$1, 153, 18, 8964);
			add_location(b4, file$1, 156, 18, 9255);
			attr_dev(div5, "class", "mt-1 flex flex-row flex-wrap items-center text-purple-600");
			add_location(div5, file$1, 152, 16, 8874);
			attr_dev(p1, "class", "mt-2 text-xs px-1 border rounded-full text-white text-center");
			set_style(p1, "background-color", dark_random_color(ctx.tooltip_data[5].game && ctx.tooltip_data[5].game.id || 0));
			add_location(p1, file$1, 158, 14, 9446);
			attr_dev(div6, "class", "flex flex-col font-sans custom-tooltip p-3 w-48 flex-unwrap");
			add_location(div6, file$1, 121, 12, 6674);
			attr_dev(div7, "class", "absolute bg-white opacity-75 z-50");
			attr_dev(div7, "style", div7_style_value = "" + (ctx.tooltip_x < ctx.width*0.5? 'left:' + (ctx.tooltip_x+5) + 'px': 'right:' + ((ctx.width-ctx.tooltip_x)+5) + 'px') + "; top: " + (ctx.tooltip_y + 5) + "px");
			add_location(div7, file$1, 120, 4, 6484);
		},

		m: function mount(target, anchor) {
			insert_dev(target, div7, anchor);
			append_dev(div7, div6);
			append_dev(div6, div0);
			append_dev(div0, t0);
			append_dev(div6, t1);
			append_dev(div6, p0);
			append_dev(p0, t2);
			append_dev(div6, t3);
			append_dev(div6, div1);
			append_dev(div1, svg0);
			append_dev(svg0, path0);
			append_dev(div1, t4);
			append_dev(div1, b0);
			append_dev(b0, t5);
			append_dev(b0, t6);
			append_dev(div6, t7);
			append_dev(div6, div2);
			append_dev(div2, svg1);
			append_dev(svg1, path1);
			append_dev(div2, t8);
			append_dev(div2, b1);
			append_dev(b1, t9);
			append_dev(b1, t10);
			append_dev(div6, t11);
			append_dev(div6, div3);
			append_dev(div3, svg2);
			append_dev(svg2, path2);
			append_dev(div3, t12);
			append_dev(div3, b2);
			append_dev(b2, t13);
			append_dev(b2, t14);
			append_dev(div6, t15);
			append_dev(div6, div4);
			append_dev(div4, svg3);
			append_dev(svg3, path3);
			append_dev(div4, t16);
			append_dev(div4, b3);
			append_dev(b3, t17);
			append_dev(b3, t18);
			append_dev(div6, t19);
			append_dev(div6, div5);
			append_dev(div5, svg4);
			append_dev(svg4, path4);
			append_dev(div5, t20);
			append_dev(div5, b4);
			append_dev(b4, t21);
			append_dev(b4, t22);
			append_dev(b4, t23);
			append_dev(b4, t24);
			append_dev(b4, t25);
			append_dev(div6, t26);
			append_dev(div6, p1);
			append_dev(p1, t27);
		},

		p: function update(changed, ctx) {
			if ((changed.tooltip_data) && t0_value !== (t0_value = tooltip_data_time_format(ctx.tooltip_data) + "")) {
				set_data_dev(t0, t0_value);
			}

			if ((changed.tooltip_data) && t2_value !== (t2_value = ctx.tooltip_data[5].title + "")) {
				set_data_dev(t2, t2_value);
			}

			if ((changed.tooltip_data) && t5_value !== (t5_value = ctx.tooltip_data[1] + "")) {
				set_data_dev(t5, t5_value);
			}

			if ((changed.tooltip_data) && t9_value !== (t9_value = ctx.tooltip_data[1] - ctx.tooltip_data[2] + "")) {
				set_data_dev(t9, t9_value);
			}

			if ((changed.tooltip_data) && t13_value !== (t13_value = ctx.tooltip_data[2] + "")) {
				set_data_dev(t13, t13_value);
			}

			if ((changed.tooltip_data) && t17_value !== (t17_value = ctx.tooltip_data[4].toFixed(1) + "")) {
				set_data_dev(t17, t17_value);
			}

			if ((changed.tooltip_data) && t22_value !== (t22_value = ctx.Math.floor((ctx.tooltip_data[0] - ctx.tooltip_data[5].started_at) / 3600) + "")) {
				set_data_dev(t22, t22_value);
			}

			if ((changed.tooltip_data) && t24_value !== (t24_value = ctx.Math.round((ctx.tooltip_data[0] - ctx.tooltip_data[5].started_at) % 3600 / 60) + "")) {
				set_data_dev(t24, t24_value);
			}

			if ((changed.tooltip_data) && t27_value !== (t27_value = ctx.tooltip_data[5].game != null? ctx.tooltip_data[5].game.name : "" + "")) {
				set_data_dev(t27, t27_value);
			}

			if (changed.tooltip_data) {
				set_style(p1, "background-color", dark_random_color(ctx.tooltip_data[5].game && ctx.tooltip_data[5].game.id || 0));
			}

			if ((changed.tooltip_x || changed.width || changed.tooltip_y) && div7_style_value !== (div7_style_value = "" + (ctx.tooltip_x < ctx.width*0.5? 'left:' + (ctx.tooltip_x+5) + 'px': 'right:' + ((ctx.width-ctx.tooltip_x)+5) + 'px') + "; top: " + (ctx.tooltip_y + 5) + "px")) {
				attr_dev(div7, "style", div7_style_value);
			}
		},

		d: function destroy(detaching) {
			if (detaching) {
				detach_dev(div7);
			}
		}
	};
	dispatch_dev("SvelteRegisterBlock", { block, id: create_if_block.name, type: "if", source: "(120:1) {#if tooltip_data}", ctx });
	return block;
}

function create_fragment$1(ctx) {
	var t0, div7, div0, t1, div1, t2, div2, t3, div3, t4, div6, div5, svg_1, defs, g0, line0, line0_x__value, line0_x__value_1, text0, t5, text0_transform_value, text1, t6, text1_transform_value, line1, line1_x__value, line1_x__value_1, text2, t7, text2_transform_value, line2, line2_x__value, line2_x__value_1, text3, t8, text3_transform_value, line3, line3_x__value, line3_x__value_1, text4, t9, text4_transform_value, text5, t10, text5_transform_value, line4, line4_x__value, line4_x__value_1, text6, t11, text6_transform_value, g1, each1_anchor, g2, line5, t12, div4, t13_value = ["오늘", "어제", "그제", "엊그제"][ctx.days_ago] || ctx.days_ago + "일전" + "", t13, t14;

	var if_block0 = (ctx.header) && create_if_block_5(ctx);

	let each_value_1 = Object.values(ctx.games);

	let each_blocks_1 = [];

	for (let i = 0; i < each_value_1.length; i += 1) {
		each_blocks_1[i] = create_each_block_1(get_each_context_1(ctx, each_value_1, i));
	}

	var if_block1 = (ctx.days_ago == 0 && ctx.now_x) && create_if_block_3(ctx);

	let each_value = ctx.data_chunks;

	let each_blocks = [];

	for (let i = 0; i < each_value.length; i += 1) {
		each_blocks[i] = create_each_block$1(get_each_context$1(ctx, each_value, i));
	}

	var if_block2 = (ctx.streamer.is_streaming && ctx.days_ago == 0 && ctx.last_data) && create_if_block_1(ctx);

	var if_block3 = (ctx.tooltip_data) && create_if_block(ctx);

	const block = {
		c: function create() {
			if (if_block0) if_block0.c();
			t0 = space();
			div7 = element("div");
			div0 = element("div");
			t1 = space();
			div1 = element("div");
			t2 = space();
			div2 = element("div");
			t3 = space();
			div3 = element("div");
			t4 = space();
			div6 = element("div");
			div5 = element("div");
			svg_1 = svg_element("svg");
			defs = svg_element("defs");

			for (let i = 0; i < each_blocks_1.length; i += 1) {
				each_blocks_1[i].c();
			}

			g0 = svg_element("g");
			line0 = svg_element("line");
			text0 = svg_element("text");
			t5 = text("3am\n          ");
			text1 = svg_element("text");
			t6 = text("6am\n          ");
			line1 = svg_element("line");
			text2 = svg_element("text");
			t7 = text("9am\n          ");
			line2 = svg_element("line");
			text3 = svg_element("text");
			t8 = text("정오\n          ");
			line3 = svg_element("line");
			text4 = svg_element("text");
			t9 = text("3pm\n          ");
			text5 = svg_element("text");
			t10 = text("6pm\n          ");
			line4 = svg_element("line");
			text6 = svg_element("text");
			t11 = text("9pm\n          ");
			if (if_block1) if_block1.c();
			g1 = svg_element("g");

			for (let i = 0; i < each_blocks.length; i += 1) {
				each_blocks[i].c();
			}

			each1_anchor = empty();
			if (if_block2) if_block2.c();
			g2 = svg_element("g");
			line5 = svg_element("line");
			t12 = space();
			div4 = element("div");
			t13 = text(t13_value);
			t14 = space();
			if (if_block3) if_block3.c();
			this.h();
		},

		l: function claim(nodes) {
			if (if_block0) if_block0.l(nodes);
			t0 = claim_space(nodes);

			div7 = claim_element(nodes, "DIV", { class: true }, false);
			var div7_nodes = children(div7);

			div0 = claim_element(div7_nodes, "DIV", { class: true, style: true }, false);
			var div0_nodes = children(div0);

			div0_nodes.forEach(detach_dev);
			t1 = claim_space(div7_nodes);

			div1 = claim_element(div7_nodes, "DIV", { class: true, style: true }, false);
			var div1_nodes = children(div1);

			div1_nodes.forEach(detach_dev);
			t2 = claim_space(div7_nodes);

			div2 = claim_element(div7_nodes, "DIV", { class: true, style: true }, false);
			var div2_nodes = children(div2);

			div2_nodes.forEach(detach_dev);
			t3 = claim_space(div7_nodes);

			div3 = claim_element(div7_nodes, "DIV", { class: true, style: true }, false);
			var div3_nodes = children(div3);

			div3_nodes.forEach(detach_dev);
			t4 = claim_space(div7_nodes);

			div6 = claim_element(div7_nodes, "DIV", { class: true }, false);
			var div6_nodes = children(div6);

			div5 = claim_element(div6_nodes, "DIV", { class: true }, false);
			var div5_nodes = children(div5);

			svg_1 = claim_element(div5_nodes, "svg", { class: true, width: true, height: true }, true);
			var svg_1_nodes = children(svg_1);

			defs = claim_element(svg_1_nodes, "defs", {}, true);
			var defs_nodes = children(defs);

			for (let i = 0; i < each_blocks_1.length; i += 1) {
				each_blocks_1[i].l(defs_nodes);
			}

			defs_nodes.forEach(detach_dev);

			g0 = claim_element(svg_1_nodes, "g", { "shape-rendering": true }, true);
			var g0_nodes = children(g0);

			line0 = claim_element(g0_nodes, "line", { x1: true, x2: true, y1: true, y2: true, "stroke-width": true, stroke: true }, true);
			var line0_nodes = children(line0);

			line0_nodes.forEach(detach_dev);

			text0 = claim_element(g0_nodes, "text", { x: true, y: true, fill: true, "font-size": true, "font-family": true, transform: true }, true);
			var text0_nodes = children(text0);

			t5 = claim_text(text0_nodes, "3am\n          ");
			text0_nodes.forEach(detach_dev);

			text1 = claim_element(g0_nodes, "text", { fill: true, "font-size": true, "font-family": true, transform: true }, true);
			var text1_nodes = children(text1);

			t6 = claim_text(text1_nodes, "6am\n          ");
			text1_nodes.forEach(detach_dev);

			line1 = claim_element(g0_nodes, "line", { x1: true, x2: true, y1: true, y2: true, "stroke-width": true, stroke: true }, true);
			var line1_nodes = children(line1);

			line1_nodes.forEach(detach_dev);

			text2 = claim_element(g0_nodes, "text", { fill: true, "font-size": true, "font-family": true, transform: true }, true);
			var text2_nodes = children(text2);

			t7 = claim_text(text2_nodes, "9am\n          ");
			text2_nodes.forEach(detach_dev);

			line2 = claim_element(g0_nodes, "line", { x1: true, x2: true, y1: true, y2: true, "stroke-width": true, stroke: true }, true);
			var line2_nodes = children(line2);

			line2_nodes.forEach(detach_dev);

			text3 = claim_element(g0_nodes, "text", { fill: true, "font-size": true, "font-family": true, transform: true }, true);
			var text3_nodes = children(text3);

			t8 = claim_text(text3_nodes, "정오\n          ");
			text3_nodes.forEach(detach_dev);

			line3 = claim_element(g0_nodes, "line", { x1: true, x2: true, y1: true, y2: true, "stroke-width": true, stroke: true }, true);
			var line3_nodes = children(line3);

			line3_nodes.forEach(detach_dev);

			text4 = claim_element(g0_nodes, "text", { fill: true, "font-size": true, "font-family": true, transform: true }, true);
			var text4_nodes = children(text4);

			t9 = claim_text(text4_nodes, "3pm\n          ");
			text4_nodes.forEach(detach_dev);

			text5 = claim_element(g0_nodes, "text", { fill: true, "font-size": true, "font-family": true, transform: true }, true);
			var text5_nodes = children(text5);

			t10 = claim_text(text5_nodes, "6pm\n          ");
			text5_nodes.forEach(detach_dev);

			line4 = claim_element(g0_nodes, "line", { x1: true, x2: true, y1: true, y2: true, "stroke-width": true, stroke: true }, true);
			var line4_nodes = children(line4);

			line4_nodes.forEach(detach_dev);

			text6 = claim_element(g0_nodes, "text", { fill: true, "font-size": true, "font-family": true, transform: true }, true);
			var text6_nodes = children(text6);

			t11 = claim_text(text6_nodes, "9pm\n          ");
			text6_nodes.forEach(detach_dev);
			if (if_block1) if_block1.l(g0_nodes);
			g0_nodes.forEach(detach_dev);

			g1 = claim_element(svg_1_nodes, "g", {}, true);
			var g1_nodes = children(g1);

			for (let i = 0; i < each_blocks.length; i += 1) {
				each_blocks[i].l(g1_nodes);
			}

			each1_anchor = empty();
			if (if_block2) if_block2.l(g1_nodes);
			g1_nodes.forEach(detach_dev);

			g2 = claim_element(svg_1_nodes, "g", { "shape-rendering": true }, true);
			var g2_nodes = children(g2);

			line5 = claim_element(g2_nodes, "line", { x1: true, x2: true, y1: true, y2: true, stroke: true, "stroke-width": true, "stroke-dasharray": true }, true);
			var line5_nodes = children(line5);

			line5_nodes.forEach(detach_dev);
			g2_nodes.forEach(detach_dev);
			svg_1_nodes.forEach(detach_dev);
			t12 = claim_space(div5_nodes);

			div4 = claim_element(div5_nodes, "DIV", { class: true }, false);
			var div4_nodes = children(div4);

			t13 = claim_text(div4_nodes, t13_value);
			div4_nodes.forEach(detach_dev);
			div5_nodes.forEach(detach_dev);
			div6_nodes.forEach(detach_dev);
			t14 = claim_space(div7_nodes);
			if (if_block3) if_block3.l(div7_nodes);
			div7_nodes.forEach(detach_dev);
			this.h();
		},

		h: function hydrate() {
			attr_dev(div0, "class", "w-full absolute bg-gray-500");
			set_style(div0, "height", "" + height + "px");
			add_location(div0, file$1, 26, 2, 1431);
			attr_dev(div1, "class", "w-3/4 absolute bg-white");
			set_style(div1, "height", "" + height + "px");
			add_location(div1, file$1, 27, 2, 1508);
			attr_dev(div2, "class", "w-1/2 absolute bg-white");
			set_style(div2, "height", "" + height + "px");
			add_location(div2, file$1, 28, 2, 1581);
			attr_dev(div3, "class", "w-1/4 absolute bg-gray-500");
			set_style(div3, "height", "" + height + "px");
			add_location(div3, file$1, 29, 2, 1654);
			add_location(defs, file$1, 33, 4, 1918);
			attr_dev(line0, "x1", line0_x__value = ctx.width*1/8);
			attr_dev(line0, "x2", line0_x__value_1 = ctx.width*1/8);
			attr_dev(line0, "y1", "0");
			attr_dev(line0, "y2", "100");
			attr_dev(line0, "stroke-width", "1.0");
			attr_dev(line0, "stroke", "#eee");
			add_location(line0, file$1, 43, 10, 2447);
			attr_dev(text0, "x", "0");
			attr_dev(text0, "y", "0");
			attr_dev(text0, "fill", "#eee");
			attr_dev(text0, "font-size", "10");
			attr_dev(text0, "font-family", "Arial");
			attr_dev(text0, "transform", text0_transform_value = "translate(" + (ctx.width*1/8 + 3) + ", 3) rotate(90)");
			add_location(text0, file$1, 44, 10, 2554);
			attr_dev(text1, "fill", "#aaa");
			attr_dev(text1, "font-size", "10");
			attr_dev(text1, "font-family", "Arial");
			attr_dev(text1, "transform", text1_transform_value = "translate(" + (ctx.width*2/8 + 3) + ", 3) rotate(90)");
			add_location(text1, file$1, 48, 10, 2831);
			attr_dev(line1, "x1", line1_x__value = ctx.width*3/8);
			attr_dev(line1, "x2", line1_x__value_1 = ctx.width*3/8);
			attr_dev(line1, "y1", "0");
			attr_dev(line1, "y2", "100");
			attr_dev(line1, "stroke-width", "1.0");
			attr_dev(line1, "stroke", "#aaa");
			add_location(line1, file$1, 51, 10, 2982);
			attr_dev(text2, "fill", "#aaa");
			attr_dev(text2, "font-size", "10");
			attr_dev(text2, "font-family", "Arial");
			attr_dev(text2, "transform", text2_transform_value = "translate(" + (ctx.width*3/8 + 3) + ", 3) rotate(90)");
			add_location(text2, file$1, 52, 10, 3089);
			attr_dev(line2, "x1", line2_x__value = ctx.width*4/8);
			attr_dev(line2, "x2", line2_x__value_1 = ctx.width*4/8);
			attr_dev(line2, "y1", "0");
			attr_dev(line2, "y2", "100");
			attr_dev(line2, "stroke-width", "1.0");
			attr_dev(line2, "stroke", "#777");
			add_location(line2, file$1, 55, 10, 3240);
			attr_dev(text3, "fill", "#777");
			attr_dev(text3, "font-size", "10");
			attr_dev(text3, "font-family", "Arial");
			attr_dev(text3, "transform", text3_transform_value = "translate(" + (ctx.width*4/8 + 3) + ", 3) rotate(90)");
			add_location(text3, file$1, 56, 10, 3347);
			attr_dev(line3, "x1", line3_x__value = ctx.width*5/8);
			attr_dev(line3, "x2", line3_x__value_1 = ctx.width*5/8);
			attr_dev(line3, "y1", "0");
			attr_dev(line3, "y2", "100");
			attr_dev(line3, "stroke-width", "1.0");
			attr_dev(line3, "stroke", "#aaa");
			add_location(line3, file$1, 59, 10, 3497);
			attr_dev(text4, "fill", "#aaa");
			attr_dev(text4, "font-size", "10");
			attr_dev(text4, "font-family", "Arial");
			attr_dev(text4, "transform", text4_transform_value = "translate(" + (ctx.width*5/8 + 3) + ", 3) rotate(90)");
			add_location(text4, file$1, 60, 10, 3604);
			attr_dev(text5, "fill", "#eee");
			attr_dev(text5, "font-size", "10");
			attr_dev(text5, "font-family", "Arial");
			attr_dev(text5, "transform", text5_transform_value = "translate(" + (ctx.width*6/8 + 3) + ", 3) rotate(90)");
			add_location(text5, file$1, 64, 10, 3869);
			attr_dev(line4, "x1", line4_x__value = ctx.width*7/8);
			attr_dev(line4, "x2", line4_x__value_1 = ctx.width*7/8);
			attr_dev(line4, "y1", "0");
			attr_dev(line4, "y2", "100");
			attr_dev(line4, "stroke-width", "1.0");
			attr_dev(line4, "stroke", "#eee");
			add_location(line4, file$1, 67, 10, 4020);
			attr_dev(text6, "fill", "#eee");
			attr_dev(text6, "font-size", "10");
			attr_dev(text6, "font-family", "Arial");
			attr_dev(text6, "transform", text6_transform_value = "translate(" + (ctx.width*7/8 + 3) + ", 3) rotate(90)");
			add_location(text6, file$1, 68, 10, 4127);
			attr_dev(g0, "shape-rendering", "crispEdges");
			add_location(g0, file$1, 42, 8, 2404);
			add_location(g1, file$1, 80, 4, 4633);
			attr_dev(line5, "x1", ctx.tooltip_x);
			attr_dev(line5, "x2", ctx.tooltip_x);
			attr_dev(line5, "y1", 0);
			attr_dev(line5, "y2", height);
			attr_dev(line5, "stroke", "#000000");
			attr_dev(line5, "stroke-width", "0.5");
			attr_dev(line5, "stroke-dasharray", "4 1");
			toggle_class(line5, "hidden", ctx.tooltip_data == null);
			add_location(line5, file$1, 111, 10, 6084);
			attr_dev(g2, "shape-rendering", "crispEdges");
			add_location(g2, file$1, 110, 8, 6041);
			attr_dev(svg_1, "class", "flex-grow border-gray-900");
			attr_dev(svg_1, "width", ctx.width);
			attr_dev(svg_1, "height", height);
			add_location(svg_1, file$1, 32, 6, 1828);
			attr_dev(div4, "class", "flex-none mr-2 absolute left-0 top-0 p-1 text-white pointer-events-none");
			add_location(div4, file$1, 116, 6, 6289);
			attr_dev(div5, "class", "w-full flex flex-row flex-wrap items-center relative");
			add_location(div5, file$1, 31, 4, 1755);
			attr_dev(div6, "class", "w-full");
			add_location(div6, file$1, 30, 2, 1730);
			attr_dev(div7, "class", "w-full relative border-t");
			add_location(div7, file$1, 25, 0, 1390);
		},

		m: function mount(target, anchor) {
			if (if_block0) if_block0.m(target, anchor);
			insert_dev(target, t0, anchor);
			insert_dev(target, div7, anchor);
			append_dev(div7, div0);
			append_dev(div7, t1);
			append_dev(div7, div1);
			append_dev(div7, t2);
			append_dev(div7, div2);
			append_dev(div7, t3);
			append_dev(div7, div3);
			append_dev(div7, t4);
			append_dev(div7, div6);
			append_dev(div6, div5);
			append_dev(div5, svg_1);
			append_dev(svg_1, defs);

			for (let i = 0; i < each_blocks_1.length; i += 1) {
				each_blocks_1[i].m(defs, null);
			}

			append_dev(svg_1, g0);
			append_dev(g0, line0);
			append_dev(g0, text0);
			append_dev(text0, t5);
			append_dev(g0, text1);
			append_dev(text1, t6);
			append_dev(g0, line1);
			append_dev(g0, text2);
			append_dev(text2, t7);
			append_dev(g0, line2);
			append_dev(g0, text3);
			append_dev(text3, t8);
			append_dev(g0, line3);
			append_dev(g0, text4);
			append_dev(text4, t9);
			append_dev(g0, text5);
			append_dev(text5, t10);
			append_dev(g0, line4);
			append_dev(g0, text6);
			append_dev(text6, t11);
			if (if_block1) if_block1.m(g0, null);
			append_dev(svg_1, g1);

			for (let i = 0; i < each_blocks.length; i += 1) {
				each_blocks[i].m(g1, null);
			}

			append_dev(g1, each1_anchor);
			if (if_block2) if_block2.m(g1, null);
			append_dev(svg_1, g2);
			append_dev(g2, line5);
			ctx.svg_1_binding(svg_1);
			append_dev(div5, t12);
			append_dev(div5, div4);
			append_dev(div4, t13);
			append_dev(div7, t14);
			if (if_block3) if_block3.m(div7, null);
		},

		p: function update(changed, ctx) {
			if (ctx.header) {
				if (if_block0) {
					if_block0.p(changed, ctx);
				} else {
					if_block0 = create_if_block_5(ctx);
					if_block0.c();
					if_block0.m(t0.parentNode, t0);
				}
			} else if (if_block0) {
				if_block0.d(1);
				if_block0 = null;
			}

			if (changed.games || changed.game_box_art_width || changed.game_box_art_height) {
				each_value_1 = Object.values(ctx.games);

				let i;
				for (i = 0; i < each_value_1.length; i += 1) {
					const child_ctx = get_each_context_1(ctx, each_value_1, i);

					if (each_blocks_1[i]) {
						each_blocks_1[i].p(changed, child_ctx);
					} else {
						each_blocks_1[i] = create_each_block_1(child_ctx);
						each_blocks_1[i].c();
						each_blocks_1[i].m(defs, null);
					}
				}

				for (; i < each_blocks_1.length; i += 1) {
					each_blocks_1[i].d(1);
				}
				each_blocks_1.length = each_value_1.length;
			}

			if ((changed.width) && line0_x__value !== (line0_x__value = ctx.width*1/8)) {
				attr_dev(line0, "x1", line0_x__value);
			}

			if ((changed.width) && line0_x__value_1 !== (line0_x__value_1 = ctx.width*1/8)) {
				attr_dev(line0, "x2", line0_x__value_1);
			}

			if ((changed.width) && text0_transform_value !== (text0_transform_value = "translate(" + (ctx.width*1/8 + 3) + ", 3) rotate(90)")) {
				attr_dev(text0, "transform", text0_transform_value);
			}

			if ((changed.width) && text1_transform_value !== (text1_transform_value = "translate(" + (ctx.width*2/8 + 3) + ", 3) rotate(90)")) {
				attr_dev(text1, "transform", text1_transform_value);
			}

			if ((changed.width) && line1_x__value !== (line1_x__value = ctx.width*3/8)) {
				attr_dev(line1, "x1", line1_x__value);
			}

			if ((changed.width) && line1_x__value_1 !== (line1_x__value_1 = ctx.width*3/8)) {
				attr_dev(line1, "x2", line1_x__value_1);
			}

			if ((changed.width) && text2_transform_value !== (text2_transform_value = "translate(" + (ctx.width*3/8 + 3) + ", 3) rotate(90)")) {
				attr_dev(text2, "transform", text2_transform_value);
			}

			if ((changed.width) && line2_x__value !== (line2_x__value = ctx.width*4/8)) {
				attr_dev(line2, "x1", line2_x__value);
			}

			if ((changed.width) && line2_x__value_1 !== (line2_x__value_1 = ctx.width*4/8)) {
				attr_dev(line2, "x2", line2_x__value_1);
			}

			if ((changed.width) && text3_transform_value !== (text3_transform_value = "translate(" + (ctx.width*4/8 + 3) + ", 3) rotate(90)")) {
				attr_dev(text3, "transform", text3_transform_value);
			}

			if ((changed.width) && line3_x__value !== (line3_x__value = ctx.width*5/8)) {
				attr_dev(line3, "x1", line3_x__value);
			}

			if ((changed.width) && line3_x__value_1 !== (line3_x__value_1 = ctx.width*5/8)) {
				attr_dev(line3, "x2", line3_x__value_1);
			}

			if ((changed.width) && text4_transform_value !== (text4_transform_value = "translate(" + (ctx.width*5/8 + 3) + ", 3) rotate(90)")) {
				attr_dev(text4, "transform", text4_transform_value);
			}

			if ((changed.width) && text5_transform_value !== (text5_transform_value = "translate(" + (ctx.width*6/8 + 3) + ", 3) rotate(90)")) {
				attr_dev(text5, "transform", text5_transform_value);
			}

			if ((changed.width) && line4_x__value !== (line4_x__value = ctx.width*7/8)) {
				attr_dev(line4, "x1", line4_x__value);
			}

			if ((changed.width) && line4_x__value_1 !== (line4_x__value_1 = ctx.width*7/8)) {
				attr_dev(line4, "x2", line4_x__value_1);
			}

			if ((changed.width) && text6_transform_value !== (text6_transform_value = "translate(" + (ctx.width*7/8 + 3) + ", 3) rotate(90)")) {
				attr_dev(text6, "transform", text6_transform_value);
			}

			if (ctx.days_ago == 0 && ctx.now_x) {
				if (if_block1) {
					if_block1.p(changed, ctx);
				} else {
					if_block1 = create_if_block_3(ctx);
					if_block1.c();
					if_block1.m(g0, null);
				}
			} else if (if_block1) {
				if_block1.d(1);
				if_block1 = null;
			}

			if (changed.data_chunks || changed.games) {
				each_value = ctx.data_chunks;

				let i;
				for (i = 0; i < each_value.length; i += 1) {
					const child_ctx = get_each_context$1(ctx, each_value, i);

					if (each_blocks[i]) {
						each_blocks[i].p(changed, child_ctx);
					} else {
						each_blocks[i] = create_each_block$1(child_ctx);
						each_blocks[i].c();
						each_blocks[i].m(g1, each1_anchor);
					}
				}

				for (; i < each_blocks.length; i += 1) {
					each_blocks[i].d(1);
				}
				each_blocks.length = each_value.length;
			}

			if (ctx.streamer.is_streaming && ctx.days_ago == 0 && ctx.last_data) {
				if (if_block2) {
					if_block2.p(changed, ctx);
				} else {
					if_block2 = create_if_block_1(ctx);
					if_block2.c();
					if_block2.m(g1, null);
				}
			} else if (if_block2) {
				if_block2.d(1);
				if_block2 = null;
			}

			if (changed.tooltip_x) {
				attr_dev(line5, "x1", ctx.tooltip_x);
				attr_dev(line5, "x2", ctx.tooltip_x);
			}

			if (changed.tooltip_data) {
				toggle_class(line5, "hidden", ctx.tooltip_data == null);
			}

			if (changed.width) {
				attr_dev(svg_1, "width", ctx.width);
			}

			if ((changed.days_ago) && t13_value !== (t13_value = ["오늘", "어제", "그제", "엊그제"][ctx.days_ago] || ctx.days_ago + "일전" + "")) {
				set_data_dev(t13, t13_value);
			}

			if (ctx.tooltip_data) {
				if (if_block3) {
					if_block3.p(changed, ctx);
				} else {
					if_block3 = create_if_block(ctx);
					if_block3.c();
					if_block3.m(div7, null);
				}
			} else if (if_block3) {
				if_block3.d(1);
				if_block3 = null;
			}
		},

		i: noop,
		o: noop,

		d: function destroy(detaching) {
			if (if_block0) if_block0.d(detaching);

			if (detaching) {
				detach_dev(t0);
				detach_dev(div7);
			}

			destroy_each(each_blocks_1, detaching);

			if (if_block1) if_block1.d();

			destroy_each(each_blocks, detaching);

			if (if_block2) if_block2.d();
			ctx.svg_1_binding(null);
			if (if_block3) if_block3.d();
		}
	};
	dispatch_dev("SvelteRegisterBlock", { block, id: create_fragment$1.name, type: "component", source: "", ctx });
	return block;
}

let max_y_axis = writable(0);
let max_y_axis_right = writable(0);

	function tooltip_data_time_format(data) {
		let d = new Date(data[0]*1000),
				h = d.getHours(), m = d.getMinutes();
		return `${h<12? "AM": "PM"} ${("0"+(h>12? h-12: h)).slice(-2)}:${("0"+m).slice(-2)}`;
	}

let height = 100;

function instance$1($$self, $$props, $$invalidate) {
	let $max_y_axis, $max_y_axis_right;

	validate_store(max_y_axis, 'max_y_axis');
	component_subscribe($$self, max_y_axis, $$value => { $max_y_axis = $$value; $$invalidate('$max_y_axis', $max_y_axis); });
	validate_store(max_y_axis_right, 'max_y_axis_right');
	component_subscribe($$self, max_y_axis_right, $$value => { $max_y_axis_right = $$value; $$invalidate('$max_y_axis_right', $max_y_axis_right); });

	

let { days_ago, streamer, header = false } = $$props;

let tooltip_x=0, 
		tooltip_y=0, 
		tooltip_data=null;


if(days_ago === 0) {
  max_y_axis.set(0);
  max_y_axis_right.set(0);
}

let today = new Date(); today.setHours(0,0,0,0);
let to = new Date(today.getTime() - 1000*60*60*24*(days_ago-1));
let from = new Date(today.getTime() - 1000*60*60*24*days_ago);
let width = 500;

let games = {};
let data_chunks = [];
let last_data = null;

let svg;

let to_timestamp = to.getTime()/1000;
let from_timestamp = from.getTime()/1000;
function xscale(x) {
  return width * (x - from_timestamp) / (24*60*60);
}
function ixscale(x) {
  return x / width * (24*60*60) + from_timestamp
}
function yscale(x) {
  return height * ($max_y_axis - x) / $max_y_axis;
}
function yscale_right(x) {
  return height * ($max_y_axis_right - x) / $max_y_axis_right + 3;
}
function update_path() {
  for(let data of data_chunks){
    data.path = [
      `M${xscale(data[0][0])},${height}` +
        data.map(d=>
          `L${xscale(d[0])},${yscale(d[1])}`
        ).join("") + 
        `L${xscale(data[data.length-1][0])},${height}` +
        `L${xscale(data[0][0])},${height}`,
      `M${xscale(data[0][0])},${height}` +
        data.map(d=>
          `L${xscale(d[0])},${yscale(d[2])}`
        ).join("") + 
        `L${xscale(data[data.length-1][0])},${height}` +
        `L${xscale(data[0][0])},${height}`, 
      `M${xscale(data[0][0])},${yscale_right(data[0][4])}` +
        data.map(d=>
          `L${xscale(d[0])},${yscale_right(d[4])}`
        ).join(""),
    ];
  }
  $$invalidate('data_chunks', data_chunks);
}
let last_max_y_axis = $max_y_axis;
let last_max_y_axis_right = $max_y_axis_right;

let now_x = null;

onMount(async ()=> {
	$$invalidate('width', width = svg.getBoundingClientRect().width);
  $$invalidate('now_x', now_x = xscale(new Date().getTime()/1000));
  let {stream_changes, stream_metadata_changes} = await API.timeline(streamer.id, from, to);
  $$invalidate('last_data', last_data = stream_changes[stream_changes.length-1]);
  max_y_axis.update(x => Math.max(x, ...stream_changes.map(d=>Math.max(d[2], d[1]))));
  max_y_axis_right.update(x => Math.max(x, ...stream_changes.map(d=>d[4])));
  let j=0;
  let metadatas = stream_changes.map(x => {
    while(stream_metadata_changes.length > j && x[0] >= stream_metadata_changes[j].time) ++j;
    if(x[1] === null) return null;
    else if(j>0) return stream_metadata_changes[j-1];
    else return null;
  });
  stream_changes = stream_changes.map((d, i)=>[...d, metadatas[i]]);
  let sm_n = 3, chatting_speed_sm = [stream_changes.slice(0, sm_n).reduce((a,b)=>a+b[4], 0)/sm_n];
  for(let i=sm_n, l=stream_changes.length, sm=chatting_speed_sm[0]; i<l; ++i){
    sm = sm + (stream_changes[i][4] - stream_changes[i-sm_n][4])/sm_n;
    chatting_speed_sm.push(sm);
  }
  for(let i=0, sm=0; i<Math.min(sm_n, stream_changes.length); ++i){
    sm = sm*i/(i+1) + stream_changes[i][4]/(i+1);
    stream_changes[i][4] = sm;
  }
  for(let i=0, l=chatting_speed_sm.length; i<l; ++i)
    stream_changes[Math.min(stream_changes.length-1, i + sm_n-1)][4] = chatting_speed_sm[i];

	$$invalidate('svg', svg.onmousemove = function(e){
		let x = e.clientX - svg.getBoundingClientRect().x, 
				y = e.clientY - svg.getBoundingClientRect().y;
    $$invalidate('tooltip_x', tooltip_x = x); 
    $$invalidate('tooltip_y', tooltip_y = y);
    let target_date = ixscale(x);
    let right_index = stream_changes.findIndex(d => d[0] >= target_date),
        left_index = findLastIndex(stream_changes, d => d[0] <= target_date);
    let nearest_index; 
    if(right_index >= 0 && left_index >= 0) 
      nearest_index = Math.abs(stream_changes[left_index][0] - target_date) <= Math.abs(stream_changes[right_index][0] - target_date)?
        left_index: right_index;
    else if(right_index >= 0)
      nearest_index = right_index;
    else if(left_index >= 0)
      nearest_index = left_index;
    else {
      $$invalidate('tooltip_data', tooltip_data = null);
      return;
    }

    if(Math.abs(stream_changes[nearest_index][0] - target_date) < 60*60){ // || right_index != 0 && metadatas[right_index].started_at == metadatas[right_index-1].started_at) {
      $$invalidate('tooltip_data', tooltip_data = stream_changes[nearest_index]);
    }
    else 
      $$invalidate('tooltip_data', tooltip_data = null);
  }, svg);
  $$invalidate('svg', svg.onmouseleave = function(e){
    $$invalidate('tooltip_data', tooltip_data = null);
  }, svg);
  data_chunks.push([]);
	for(let i=0, l=stream_changes.length, j=0; i<l; ++i) {
   	  if(i>0 && metadatas[i] != metadatas[i-1] && 
          ((metadatas[i] == null || metadatas[i-1] == null) || 
            metadatas[i].started_at != metadatas[i-1].started_at || 
            (metadatas[i].game && metadatas[i].game.id) != (metadatas[i-1].game && metadatas[i-1].game.id) ||
            metadatas[i].title != metadatas[i-1].title)){
        ++j;
        data_chunks.push([]);
        if(metadatas[i] && metadatas[i-1] && metadatas[i].started_at == metadatas[i-1].started_at){
          let mid = stream_changes[i].slice(0, 5).map((d, j) => Math.floor((d + stream_changes[i-1][j])*0.5));
          data_chunks[j-1].push([...mid, metadatas[i-1]]);
          data_chunks[j].push([...mid, metadatas[i]]);
        }
      }
      data_chunks[j].push(stream_changes[i]);
  }
  update_path();
  $$invalidate('data_chunks', data_chunks);
  for(let data of data_chunks){
  	if(data[0] == null || data[0][5] == null || data[0][5].game == null) continue;
		$$invalidate('games', games[data[0][5].game.id] = data[0][5].game, games);
	}
});

	const writable_props = ['days_ago', 'streamer', 'header'];
	Object.keys($$props).forEach(key => {
		if (!writable_props.includes(key) && !key.startsWith('$$')) console.warn(`<Timeline2> was created with unknown prop '${key}'`);
	});

	function svg_1_binding($$value) {
		binding_callbacks[$$value ? 'unshift' : 'push'](() => {
			$$invalidate('svg', svg = $$value);
		});
	}

	$$self.$set = $$props => {
		if ('days_ago' in $$props) $$invalidate('days_ago', days_ago = $$props.days_ago);
		if ('streamer' in $$props) $$invalidate('streamer', streamer = $$props.streamer);
		if ('header' in $$props) $$invalidate('header', header = $$props.header);
	};

	$$self.$capture_state = () => {
		return { max_y_axis, max_y_axis_right, days_ago, streamer, header, tooltip_x, tooltip_y, tooltip_data, today, to, from, height, width, games, data_chunks, last_data, svg, to_timestamp, from_timestamp, last_max_y_axis, last_max_y_axis_right, now_x, game_box_art_width, game_box_art_height, $max_y_axis, $max_y_axis_right };
	};

	$$self.$inject_state = $$props => {
		if ('days_ago' in $$props) $$invalidate('days_ago', days_ago = $$props.days_ago);
		if ('streamer' in $$props) $$invalidate('streamer', streamer = $$props.streamer);
		if ('header' in $$props) $$invalidate('header', header = $$props.header);
		if ('tooltip_x' in $$props) $$invalidate('tooltip_x', tooltip_x = $$props.tooltip_x);
		if ('tooltip_y' in $$props) $$invalidate('tooltip_y', tooltip_y = $$props.tooltip_y);
		if ('tooltip_data' in $$props) $$invalidate('tooltip_data', tooltip_data = $$props.tooltip_data);
		if ('today' in $$props) today = $$props.today;
		if ('to' in $$props) to = $$props.to;
		if ('from' in $$props) from = $$props.from;
		if ('height' in $$props) $$invalidate('height', height = $$props.height);
		if ('width' in $$props) $$invalidate('width', width = $$props.width);
		if ('games' in $$props) $$invalidate('games', games = $$props.games);
		if ('data_chunks' in $$props) $$invalidate('data_chunks', data_chunks = $$props.data_chunks);
		if ('last_data' in $$props) $$invalidate('last_data', last_data = $$props.last_data);
		if ('svg' in $$props) $$invalidate('svg', svg = $$props.svg);
		if ('to_timestamp' in $$props) to_timestamp = $$props.to_timestamp;
		if ('from_timestamp' in $$props) from_timestamp = $$props.from_timestamp;
		if ('last_max_y_axis' in $$props) $$invalidate('last_max_y_axis', last_max_y_axis = $$props.last_max_y_axis);
		if ('last_max_y_axis_right' in $$props) $$invalidate('last_max_y_axis_right', last_max_y_axis_right = $$props.last_max_y_axis_right);
		if ('now_x' in $$props) $$invalidate('now_x', now_x = $$props.now_x);
		if ('game_box_art_width' in $$props) $$invalidate('game_box_art_width', game_box_art_width = $$props.game_box_art_width);
		if ('game_box_art_height' in $$props) $$invalidate('game_box_art_height', game_box_art_height = $$props.game_box_art_height);
		if ('$max_y_axis' in $$props) max_y_axis.set($max_y_axis);
		if ('$max_y_axis_right' in $$props) max_y_axis_right.set($max_y_axis_right);
	};

	let game_box_art_width, game_box_art_height;

	$$self.$$.update = ($$dirty = { height: 1, data_chunks: 1, last_max_y_axis: 1, $max_y_axis: 1, last_max_y_axis_right: 1, $max_y_axis_right: 1 }) => {
		if ($$dirty.height) { $$invalidate('game_box_art_width', game_box_art_width = height*0.4); }
		if ($$dirty.height) { $$invalidate('game_box_art_height', game_box_art_height = height*0.5); }
		if ($$dirty.data_chunks || $$dirty.last_max_y_axis || $$dirty.$max_y_axis || $$dirty.last_max_y_axis_right || $$dirty.$max_y_axis_right) { if(data_chunks && ((last_max_y_axis != $max_y_axis) || (last_max_y_axis_right != $max_y_axis_right))) {
      $$invalidate('last_max_y_axis', last_max_y_axis = $max_y_axis);
      $$invalidate('last_max_y_axis_right', last_max_y_axis_right = $max_y_axis_right);
      update_path();
    } }
	};

	return {
		days_ago,
		streamer,
		header,
		tooltip_x,
		tooltip_y,
		tooltip_data,
		width,
		games,
		data_chunks,
		last_data,
		svg,
		xscale,
		now_x,
		game_box_art_width,
		game_box_art_height,
		$max_y_axis,
		Math,
		svg_1_binding
	};
}

class Timeline2 extends SvelteComponentDev {
	constructor(options) {
		super(options);
		init(this, options, instance$1, create_fragment$1, safe_not_equal, ["days_ago", "streamer", "header"]);
		dispatch_dev("SvelteRegisterComponent", { component: this, tagName: "Timeline2", options, id: create_fragment$1.name });

		const { ctx } = this.$$;
		const props = options.props || {};
		if (ctx.days_ago === undefined && !('days_ago' in props)) {
			console.warn("<Timeline2> was created without expected prop 'days_ago'");
		}
		if (ctx.streamer === undefined && !('streamer' in props)) {
			console.warn("<Timeline2> was created without expected prop 'streamer'");
		}
	}

	get days_ago() {
		throw new Error("<Timeline2>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
	}

	set days_ago(value) {
		throw new Error("<Timeline2>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
	}

	get streamer() {
		throw new Error("<Timeline2>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
	}

	set streamer(value) {
		throw new Error("<Timeline2>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
	}

	get header() {
		throw new Error("<Timeline2>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
	}

	set header(value) {
		throw new Error("<Timeline2>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
	}
}

/* src/components/StreamSpiral.svelte generated by Svelte v3.12.1 */

const file$2 = "src/components/StreamSpiral.svelte";

function create_fragment$2(ctx) {
	var div, canvas0, t, canvas1, div_class_value, dispose;

	const block = {
		c: function create() {
			div = element("div");
			canvas0 = element("canvas");
			t = space();
			canvas1 = element("canvas");
			this.h();
		},

		l: function claim(nodes) {
			div = claim_element(nodes, "DIV", { class: true }, false);
			var div_nodes = children(div);

			canvas0 = claim_element(div_nodes, "CANVAS", { class: true }, false);
			var canvas0_nodes = children(canvas0);

			canvas0_nodes.forEach(detach_dev);
			t = claim_space(div_nodes);

			canvas1 = claim_element(div_nodes, "CANVAS", { class: true }, false);
			var canvas1_nodes = children(canvas1);

			canvas1_nodes.forEach(detach_dev);
			div_nodes.forEach(detach_dev);
			this.h();
		},

		h: function hydrate() {
			attr_dev(canvas0, "class", "w-full");
			add_location(canvas0, file$2, 1, 0, 39);
			attr_dev(canvas1, "class", "absolute w-full h-full");
			add_location(canvas1, file$2, 3, 0, 92);
			attr_dev(div, "class", div_class_value = "" + ctx.$$props.class + " relative");
			add_location(div, file$2, 0, 0, 0);

			dispose = [
				listen_dev(canvas1, "mousemove", ctx.mousemove),
				listen_dev(canvas1, "mouseover", ctx.mouseover),
				listen_dev(canvas1, "mouseleave", ctx.mouseleave)
			];
		},

		m: function mount(target, anchor) {
			insert_dev(target, div, anchor);
			append_dev(div, canvas0);
			ctx.canvas0_binding(canvas0);
			append_dev(div, t);
			append_dev(div, canvas1);
			ctx.canvas1_binding(canvas1);
		},

		p: function update(changed, ctx) {
			if ((changed.$$props) && div_class_value !== (div_class_value = "" + ctx.$$props.class + " relative")) {
				attr_dev(div, "class", div_class_value);
			}
		},

		i: noop,
		o: noop,

		d: function destroy(detaching) {
			if (detaching) {
				detach_dev(div);
			}

			ctx.canvas0_binding(null);
			ctx.canvas1_binding(null);
			run_all(dispose);
		}
	};
	dispatch_dev("SvelteRegisterBlock", { block, id: create_fragment$2.name, type: "component", source: "", ctx });
	return block;
}

function is_overlap(ranges, point){
let res = ranges.some(range => range[0] <= point && point <= range[1]);
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

function instance$2($$self, $$props, $$invalidate) {
	
let { streamer, mean_streaming_time_ranges = [], mean_streaming_time_reliability = 0.0, streaming_time_ranges_variance = 0.0, total_streaming_time_ratio = 0.0, streaming_time_ranges_regularity = 0.0, streaming_start_time = 0.0, streaming_end_time = 0.0, streaming_start_time_std= 0.0, streaming_end_time_std= 0.0 } = $$props; 
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
	function canvas0_binding($$value) {
		binding_callbacks[$$value ? 'unshift' : 'push'](() => {
			$$invalidate('canvas', canvas = $$value);
		});
	}

	function canvas1_binding($$value) {
		binding_callbacks[$$value ? 'unshift' : 'push'](() => {
			$$invalidate('ui_canvas', ui_canvas = $$value);
		});
	}

	$$self.$set = $$new_props => {
		$$invalidate('$$props', $$props = assign$2(assign$2({}, $$props), $$new_props));
		if ('streamer' in $$new_props) $$invalidate('streamer', streamer = $$new_props.streamer);
		if ('mean_streaming_time_ranges' in $$new_props) $$invalidate('mean_streaming_time_ranges', mean_streaming_time_ranges = $$new_props.mean_streaming_time_ranges);
		if ('mean_streaming_time_reliability' in $$new_props) $$invalidate('mean_streaming_time_reliability', mean_streaming_time_reliability = $$new_props.mean_streaming_time_reliability);
		if ('streaming_time_ranges_variance' in $$new_props) $$invalidate('streaming_time_ranges_variance', streaming_time_ranges_variance = $$new_props.streaming_time_ranges_variance);
		if ('total_streaming_time_ratio' in $$new_props) $$invalidate('total_streaming_time_ratio', total_streaming_time_ratio = $$new_props.total_streaming_time_ratio);
		if ('streaming_time_ranges_regularity' in $$new_props) $$invalidate('streaming_time_ranges_regularity', streaming_time_ranges_regularity = $$new_props.streaming_time_ranges_regularity);
		if ('streaming_start_time' in $$new_props) $$invalidate('streaming_start_time', streaming_start_time = $$new_props.streaming_start_time);
		if ('streaming_end_time' in $$new_props) $$invalidate('streaming_end_time', streaming_end_time = $$new_props.streaming_end_time);
		if ('streaming_start_time_std' in $$new_props) $$invalidate('streaming_start_time_std', streaming_start_time_std = $$new_props.streaming_start_time_std);
		if ('streaming_end_time_std' in $$new_props) $$invalidate('streaming_end_time_std', streaming_end_time_std = $$new_props.streaming_end_time_std);
	};

	$$self.$capture_state = () => {
		return { streamer, mean_streaming_time_ranges, mean_streaming_time_reliability, streaming_time_ranges_variance, total_streaming_time_ratio, streaming_time_ranges_regularity, streaming_start_time, streaming_end_time, streaming_start_time_std, streaming_end_time_std, today, to, from, canvas, ui_canvas, last_streamer, mouse_in, mouse_x, mouse_y };
	};

	$$self.$inject_state = $$new_props => {
		$$invalidate('$$props', $$props = assign$2(assign$2({}, $$props), $$new_props));
		if ('streamer' in $$props) $$invalidate('streamer', streamer = $$new_props.streamer);
		if ('mean_streaming_time_ranges' in $$props) $$invalidate('mean_streaming_time_ranges', mean_streaming_time_ranges = $$new_props.mean_streaming_time_ranges);
		if ('mean_streaming_time_reliability' in $$props) $$invalidate('mean_streaming_time_reliability', mean_streaming_time_reliability = $$new_props.mean_streaming_time_reliability);
		if ('streaming_time_ranges_variance' in $$props) $$invalidate('streaming_time_ranges_variance', streaming_time_ranges_variance = $$new_props.streaming_time_ranges_variance);
		if ('total_streaming_time_ratio' in $$props) $$invalidate('total_streaming_time_ratio', total_streaming_time_ratio = $$new_props.total_streaming_time_ratio);
		if ('streaming_time_ranges_regularity' in $$props) $$invalidate('streaming_time_ranges_regularity', streaming_time_ranges_regularity = $$new_props.streaming_time_ranges_regularity);
		if ('streaming_start_time' in $$props) $$invalidate('streaming_start_time', streaming_start_time = $$new_props.streaming_start_time);
		if ('streaming_end_time' in $$props) $$invalidate('streaming_end_time', streaming_end_time = $$new_props.streaming_end_time);
		if ('streaming_start_time_std' in $$props) $$invalidate('streaming_start_time_std', streaming_start_time_std = $$new_props.streaming_start_time_std);
		if ('streaming_end_time_std' in $$props) $$invalidate('streaming_end_time_std', streaming_end_time_std = $$new_props.streaming_end_time_std);
		if ('today' in $$props) today = $$new_props.today;
		if ('to' in $$props) $$invalidate('to', to = $$new_props.to);
		if ('from' in $$props) $$invalidate('from', from = $$new_props.from);
		if ('canvas' in $$props) $$invalidate('canvas', canvas = $$new_props.canvas);
		if ('ui_canvas' in $$props) $$invalidate('ui_canvas', ui_canvas = $$new_props.ui_canvas);
		if ('last_streamer' in $$props) $$invalidate('last_streamer', last_streamer = $$new_props.last_streamer);
		if ('mouse_in' in $$props) mouse_in = $$new_props.mouse_in;
		if ('mouse_x' in $$props) mouse_x = $$new_props.mouse_x;
		if ('mouse_y' in $$props) mouse_y = $$new_props.mouse_y;
	};

	$$self.$$.update = ($$dirty = { canvas: 1, last_streamer: 1, streamer: 1, from: 1, to: 1, streaming_time_ranges_regularity: 1, mean_streaming_time_ranges: 1, streaming_start_time: 1, streaming_end_time: 1 }) => {
		if ($$dirty.canvas || $$dirty.last_streamer || $$dirty.streamer || $$dirty.from || $$dirty.to || $$dirty.streaming_time_ranges_regularity || $$dirty.mean_streaming_time_ranges || $$dirty.streaming_start_time || $$dirty.streaming_end_time) { if(canvas && last_streamer != streamer) {
      $$invalidate('last_streamer', last_streamer = streamer);
      $$invalidate('mean_streaming_time_ranges', mean_streaming_time_ranges = []);
      $$invalidate('total_streaming_time_ratio', total_streaming_time_ratio = 0.0);
      $$invalidate('streaming_time_ranges_variance', streaming_time_ranges_variance = 0.0);
      $$invalidate('mean_streaming_time_reliability', mean_streaming_time_reliability = 0.0);
      API.stream_ranges(streamer.id, from, to).then(stream_ranges => {
      //let stream_ranges = await API.stream_ranges(streamer.id, from, to);
      if(!stream_ranges)
        return null;
      let trimed_from = new Date(stream_ranges[0][0]*1000); trimed_from.setHours(0,0,0,0);
      let from_timestamp = Math.round(trimed_from.getTime()/1000),
          to_timestamp = Math.round(to.getTime()/1000);
      let chunks = [[]];
      for(let i=0, j=0, l=stream_ranges.length; i<l; ++i){
        $$invalidate('total_streaming_time_ratio', total_streaming_time_ratio += (stream_ranges[i][1] - stream_ranges[i][0]) / (to_timestamp - stream_ranges[0][0]));
        while(stream_ranges[i][1] >= from_timestamp + (j+2)*interval) {
          chunks.push([]);
          ++j;
          continue;
        }
        if(stream_ranges[i][1] >= from_timestamp + (j+1)*interval) {
          chunks.push([]);
          if(stream_ranges[i][0] < from_timestamp + (j+1)*interval) {
            chunks[j].push([(stream_ranges[i][0] - from_timestamp) % interval, interval]);
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
      $$invalidate('streaming_time_ranges_variance', streaming_time_ranges_variance = chunks.reduce((res,ranges)=>{
        let v = mean.map((v, i)=>Math.abs(is_overlap(ranges, (splits[i] + splits[i+1])*0.5) - v)*(splits[i+1]-splits[i])).reduce((a,b)=>a+b) / total;
        return res + v*v;
      }, 0) / chunks.length);
      let filled_ranges = fill_hole(stream_ranges, 60*60).map(v=>[(v[0]-from_timestamp)%interval / interval, (v[1]-from_timestamp)%interval / interval]);
      let mean2 = filled_ranges.reduce((a,b)=>[a[0]+b[0], a[1]+b[1]]).map(v=>v/filled_ranges.length);
      let var2 = filled_ranges.reduce((res,v) => [res[0] + (v[0]-mean2[0])*(v[0]-mean2[0]), res[1] + (v[1]-mean2[1])*(v[1]-mean2[1])], [0,0]).map(v=>v/filled_ranges.length);
      $$invalidate('streaming_time_ranges_regularity', streaming_time_ranges_regularity  = 0.0);
      for(let i=0, l=chunks.length; i<l; ++i){
        for(let j=i+1; j<l; ++j){
          let diff = 0;
          for(let k=0, m=splits.length-1; k<m; ++k)
            diff += Math.abs(is_overlap(chunks[i], (splits[k+1] + splits[k])*0.5) - is_overlap(chunks[j], (splits[k+1] + splits[k])*0.5)) * (splits[k+1]-splits[k]);
          $$invalidate('streaming_time_ranges_regularity', streaming_time_ranges_regularity += diff / total);
        }
      }
      $$invalidate('streaming_time_ranges_regularity', streaming_time_ranges_regularity = streaming_time_ranges_regularity / ((chunks.length) * (chunks.length-1) / 2));
      let mean_of_mean = mean.map((v, i) => (splits[i+1] - splits[i]) * v).reduce((a,b)=>a+b) / total;
      mean_of_mean = 0.5;
      $$invalidate('mean_streaming_time_reliability', mean_streaming_time_reliability = 
        mean.map((v, i) => v >= mean_of_mean? (splits[i+1]-splits[i])*v: 0).reduce((a,b)=>a+b) / 
        mean.map((v, i) => v >= mean_of_mean? (splits[i+1]-splits[i]): 0).reduce((a,b)=>a+b));
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
      if(mean_streaming_time_ranges.length>1 && Math.abs(mean_streaming_time_ranges[mean_streaming_time_ranges.length-1][1] - mean_streaming_time_ranges[0][0]) <= 60*60)
        $$invalidate('mean_streaming_time_ranges', mean_streaming_time_ranges[0][0] = mean_streaming_time_ranges.pop()[0], mean_streaming_time_ranges);
      $$invalidate('mean_streaming_time_ranges', mean_streaming_time_ranges), $$invalidate('canvas', canvas), $$invalidate('last_streamer', last_streamer), $$invalidate('streamer', streamer), $$invalidate('from', from), $$invalidate('to', to), $$invalidate('streaming_time_ranges_regularity', streaming_time_ranges_regularity), $$invalidate('streaming_start_time', streaming_start_time), $$invalidate('streaming_end_time', streaming_end_time);
    
    
      let stream_ranges_processed = fill_hole(stream_ranges, 60*60)
          .map(v=>[(v[0]-from_timestamp)%interval, (v[1]-from_timestamp)%interval]);
      let stream_ranges_vector = stream_ranges_processed
          .map(v=>[v[0]/interval*Math.PI*2, v[1]/interval*Math.PI*2])
          .map(v=>[[Math.sin(v[0]), Math.cos(v[0])], [Math.sin(v[1]), Math.cos(v[1])]]);
      $$invalidate('streaming_start_time', streaming_start_time = (Math.atan2(...stream_ranges_vector.reduce((a, s) => [a[0]+s[0][0], a[1]+s[0][1]], [0,0])) + Math.PI*2)%(Math.PI*2)/(Math.PI*2) * interval);
      $$invalidate('streaming_end_time', streaming_end_time = (Math.atan2(...stream_ranges_vector.reduce((a, s) => [a[0]+s[1][0], a[1]+s[1][1]], [0,0])) + Math.PI*2)%(Math.PI*2)/(Math.PI*2) * interval);
      //streaming_start_time = stream_ranges_processed.map(s=>s[0]).sort()[Math.floor(stream_ranges_processed.length/2)];
      //streaming_end_time = stream_ranges_processed.map(s=>s[1]).sort()[Math.floor(stream_ranges_processed.length/2)];
      $$invalidate('streaming_start_time_std', streaming_start_time_std = Math.sqrt(
        stream_ranges_processed
          .map(s => Math.abs(s[0]-streaming_start_time))
          .map(v => v < interval*0.5? v: interval-v)
          .reduce((a, s) => a+s*s, 0)/(stream_ranges_processed.length-1)));
      $$invalidate('streaming_end_time_std', streaming_end_time_std = Math.sqrt(
        stream_ranges_processed
          .map(s => Math.abs(s[1]-streaming_end_time))
          .map(v => v < interval*0.5? v: interval-v)
          .reduce((a, s) => a+s*s, 0)/(stream_ranges_processed.length-1)));
    
      let width = canvas.getBoundingClientRect().width,
          height = canvas.getBoundingClientRect().width;
      $$invalidate('canvas', canvas.width = width, canvas);
      $$invalidate('canvas', canvas.height = height, canvas);
      $$invalidate('ui_canvas', ui_canvas.width = width, ui_canvas);
      $$invalidate('ui_canvas', ui_canvas.height = height, ui_canvas);
    
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
      /*(function loop() {
        frame = requestAnimationFrame(loop);
        if(search) 
        ctx.clearRect(0, 0, canvas.width, canvas.height);
      }());
      return ()=>{
        cancelAnimationFrame(frame);
      }*/
    });} }
	};

	return {
		streamer,
		mean_streaming_time_ranges,
		mean_streaming_time_reliability,
		streaming_time_ranges_variance,
		total_streaming_time_ratio,
		streaming_time_ranges_regularity,
		streaming_start_time,
		streaming_end_time,
		streaming_start_time_std,
		streaming_end_time_std,
		canvas,
		ui_canvas,
		mousemove,
		mouseover,
		mouseleave,
		$$props,
		canvas0_binding,
		canvas1_binding,
		$$props: $$props = exclude_internal_props($$props)
	};
}

class StreamSpiral extends SvelteComponentDev {
	constructor(options) {
		super(options);
		init(this, options, instance$2, create_fragment$2, safe_not_equal, ["streamer", "mean_streaming_time_ranges", "mean_streaming_time_reliability", "streaming_time_ranges_variance", "total_streaming_time_ratio", "streaming_time_ranges_regularity", "streaming_start_time", "streaming_end_time", "streaming_start_time_std", "streaming_end_time_std"]);
		dispatch_dev("SvelteRegisterComponent", { component: this, tagName: "StreamSpiral", options, id: create_fragment$2.name });

		const { ctx } = this.$$;
		const props = options.props || {};
		if (ctx.streamer === undefined && !('streamer' in props)) {
			console.warn("<StreamSpiral> was created without expected prop 'streamer'");
		}
	}

	get streamer() {
		throw new Error("<StreamSpiral>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
	}

	set streamer(value) {
		throw new Error("<StreamSpiral>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
	}

	get mean_streaming_time_ranges() {
		throw new Error("<StreamSpiral>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
	}

	set mean_streaming_time_ranges(value) {
		throw new Error("<StreamSpiral>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
	}

	get mean_streaming_time_reliability() {
		throw new Error("<StreamSpiral>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
	}

	set mean_streaming_time_reliability(value) {
		throw new Error("<StreamSpiral>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
	}

	get streaming_time_ranges_variance() {
		throw new Error("<StreamSpiral>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
	}

	set streaming_time_ranges_variance(value) {
		throw new Error("<StreamSpiral>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
	}

	get total_streaming_time_ratio() {
		throw new Error("<StreamSpiral>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
	}

	set total_streaming_time_ratio(value) {
		throw new Error("<StreamSpiral>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
	}

	get streaming_time_ranges_regularity() {
		throw new Error("<StreamSpiral>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
	}

	set streaming_time_ranges_regularity(value) {
		throw new Error("<StreamSpiral>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
	}

	get streaming_start_time() {
		throw new Error("<StreamSpiral>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
	}

	set streaming_start_time(value) {
		throw new Error("<StreamSpiral>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
	}

	get streaming_end_time() {
		throw new Error("<StreamSpiral>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
	}

	set streaming_end_time(value) {
		throw new Error("<StreamSpiral>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
	}

	get streaming_start_time_std() {
		throw new Error("<StreamSpiral>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
	}

	set streaming_start_time_std(value) {
		throw new Error("<StreamSpiral>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
	}

	get streaming_end_time_std() {
		throw new Error("<StreamSpiral>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
	}

	set streaming_end_time_std(value) {
		throw new Error("<StreamSpiral>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
	}
}

var faArrowUp = createCommonjsModule(function (module, exports) {
Object.defineProperty(exports, '__esModule', { value: true });
var prefix = 'fas';
var iconName = 'arrow-up';
var width = 448;
var height = 512;
var ligatures = [];
var unicode = 'f062';
var svgPathData = 'M34.9 289.5l-22.2-22.2c-9.4-9.4-9.4-24.6 0-33.9L207 39c9.4-9.4 24.6-9.4 33.9 0l194.3 194.3c9.4 9.4 9.4 24.6 0 33.9L413 289.4c-9.5 9.5-25 9.3-34.3-.4L264 168.6V456c0 13.3-10.7 24-24 24h-32c-13.3 0-24-10.7-24-24V168.6L69.2 289.1c-9.3 9.8-24.8 10-34.3.4z';

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

exports.faArrowUp = exports.definition;
exports.prefix = prefix;
exports.iconName = iconName;
exports.width = width;
exports.height = height;
exports.ligatures = ligatures;
exports.unicode = unicode;
exports.svgPathData = svgPathData;
});

unwrapExports(faArrowUp);
var faArrowUp_1 = faArrowUp.definition;
var faArrowUp_2 = faArrowUp.faArrowUp;
var faArrowUp_3 = faArrowUp.prefix;
var faArrowUp_4 = faArrowUp.iconName;
var faArrowUp_5 = faArrowUp.width;
var faArrowUp_6 = faArrowUp.height;
var faArrowUp_7 = faArrowUp.ligatures;
var faArrowUp_8 = faArrowUp.unicode;
var faArrowUp_9 = faArrowUp.svgPathData;

var faArrowDown = createCommonjsModule(function (module, exports) {
Object.defineProperty(exports, '__esModule', { value: true });
var prefix = 'fas';
var iconName = 'arrow-down';
var width = 448;
var height = 512;
var ligatures = [];
var unicode = 'f063';
var svgPathData = 'M413.1 222.5l22.2 22.2c9.4 9.4 9.4 24.6 0 33.9L241 473c-9.4 9.4-24.6 9.4-33.9 0L12.7 278.6c-9.4-9.4-9.4-24.6 0-33.9l22.2-22.2c9.5-9.5 25-9.3 34.3.4L184 343.4V56c0-13.3 10.7-24 24-24h32c13.3 0 24 10.7 24 24v287.4l114.8-120.5c9.3-9.8 24.8-10 34.3-.4z';

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

exports.faArrowDown = exports.definition;
exports.prefix = prefix;
exports.iconName = iconName;
exports.width = width;
exports.height = height;
exports.ligatures = ligatures;
exports.unicode = unicode;
exports.svgPathData = svgPathData;
});

unwrapExports(faArrowDown);
var faArrowDown_1 = faArrowDown.definition;
var faArrowDown_2 = faArrowDown.faArrowDown;
var faArrowDown_3 = faArrowDown.prefix;
var faArrowDown_4 = faArrowDown.iconName;
var faArrowDown_5 = faArrowDown.width;
var faArrowDown_6 = faArrowDown.height;
var faArrowDown_7 = faArrowDown.ligatures;
var faArrowDown_8 = faArrowDown.unicode;
var faArrowDown_9 = faArrowDown.svgPathData;

/*
object-assign
(c) Sindre Sorhus
@license MIT
*/
/* eslint-disable no-unused-vars */
var getOwnPropertySymbols = Object.getOwnPropertySymbols;
var hasOwnProperty = Object.prototype.hasOwnProperty;
var propIsEnumerable = Object.prototype.propertyIsEnumerable;

function toObject(val) {
	if (val === null || val === undefined) {
		throw new TypeError('Object.assign cannot be called with null or undefined');
	}

	return Object(val);
}

function shouldUseNative() {
	try {
		if (!Object.assign) {
			return false;
		}

		// Detect buggy property enumeration order in older V8 versions.

		// https://bugs.chromium.org/p/v8/issues/detail?id=4118
		var test1 = new String('abc');  // eslint-disable-line no-new-wrappers
		test1[5] = 'de';
		if (Object.getOwnPropertyNames(test1)[0] === '5') {
			return false;
		}

		// https://bugs.chromium.org/p/v8/issues/detail?id=3056
		var test2 = {};
		for (var i = 0; i < 10; i++) {
			test2['_' + String.fromCharCode(i)] = i;
		}
		var order2 = Object.getOwnPropertyNames(test2).map(function (n) {
			return test2[n];
		});
		if (order2.join('') !== '0123456789') {
			return false;
		}

		// https://bugs.chromium.org/p/v8/issues/detail?id=3056
		var test3 = {};
		'abcdefghijklmnopqrst'.split('').forEach(function (letter) {
			test3[letter] = letter;
		});
		if (Object.keys(Object.assign({}, test3)).join('') !==
				'abcdefghijklmnopqrst') {
			return false;
		}

		return true;
	} catch (err) {
		// We don't expect any of the above to throw, but better to be safe.
		return false;
	}
}

var objectAssign = shouldUseNative() ? Object.assign : function (target, source) {
	var from;
	var to = toObject(target);
	var symbols;

	for (var s = 1; s < arguments.length; s++) {
		from = Object(arguments[s]);

		for (var key in from) {
			if (hasOwnProperty.call(from, key)) {
				to[key] = from[key];
			}
		}

		if (getOwnPropertySymbols) {
			symbols = getOwnPropertySymbols(from);
			for (var i = 0; i < symbols.length; i++) {
				if (propIsEnumerable.call(from, symbols[i])) {
					to[symbols[i]] = from[symbols[i]];
				}
			}
		}
	}

	return to;
};

function _interopDefault (ex) { return (ex && (typeof ex === 'object') && 'default' in ex) ? ex['default'] : ex; }

var assign = _interopDefault(objectAssign);

function assign$1 ( target ) {
	var arguments$1 = arguments;

	for ( var i = 1; i < arguments.length; i += 1 ) {
		var source = arguments$1[i];
		for ( var k in source ) { target[k] = source[k]; }
	}

	return target;
}

function appendNode ( node, target ) {
	target.appendChild( node );
}

function insertNode ( node, target, anchor ) {
	target.insertBefore( node, anchor );
}

function detachNode ( node ) {
	node.parentNode.removeChild( node );
}

function createElement ( name ) {
	return document.createElement( name );
}

function createText ( data ) {
	return document.createTextNode( data );
}

function setAttribute ( node, attribute, value ) {
	node.setAttribute( attribute, value );
}

function differs ( a, b ) {
	return ( a !== b ) || ( a && ( typeof a === 'object' ) || ( typeof a === 'function' ) );
}

function dispatchObservers ( component, group, newState, oldState ) {
	for ( var key in group ) {
		if ( !( key in newState ) ) { continue; }

		var newValue = newState[ key ];
		var oldValue = oldState[ key ];

		if ( differs( newValue, oldValue ) ) {
			var callbacks = group[ key ];
			if ( !callbacks ) { continue; }

			for ( var i = 0; i < callbacks.length; i += 1 ) {
				var callback = callbacks[i];
				if ( callback.__calling ) { continue; }

				callback.__calling = true;
				callback.call( component, newValue, oldValue );
				callback.__calling = false;
			}
		}
	}
}

function get ( key ) {
	return key ? this._state[ key ] : this._state;
}

function fire ( eventName, data ) {
	var this$1 = this;

	var handlers = eventName in this._handlers && this._handlers[ eventName ].slice();
	if ( !handlers ) { return; }

	for ( var i = 0; i < handlers.length; i += 1 ) {
		handlers[i].call( this$1, data );
	}
}

function observe ( key, callback, options ) {
	var group = ( options && options.defer ) ? this._observers.post : this._observers.pre;

	( group[ key ] || ( group[ key ] = [] ) ).push( callback );

	if ( !options || options.init !== false ) {
		callback.__calling = true;
		callback.call( this, this._state[ key ] );
		callback.__calling = false;
	}

	return {
		cancel: function () {
			var index = group[ key ].indexOf( callback );
			if ( ~index ) { group[ key ].splice( index, 1 ); }
		}
	};
}

function on ( eventName, handler ) {
	if ( eventName === 'teardown' ) { return this.on( 'destroy', handler ); }

	var handlers = this._handlers[ eventName ] || ( this._handlers[ eventName ] = [] );
	handlers.push( handler );

	return {
		cancel: function () {
			var index = handlers.indexOf( handler );
			if ( ~index ) { handlers.splice( index, 1 ); }
		}
	};
}

function set ( newState ) {
	this._set( assign$1( {}, newState ) );
	this._root._flush();
}

function _flush () {
	var this$1 = this;

	if ( !this._renderHooks ) { return; }

	while ( this._renderHooks.length ) {
		this$1._renderHooks.pop()();
	}
}

var proto = {
	get: get,
	fire: fire,
	observe: observe,
	on: on,
	set: set,
	_flush: _flush
};

function recompute ( state, newState, oldState, isInitial ) {
	if ( isInitial || ( 'position' in newState && differs( state.position, oldState.position ) ) ) {
		state._position = newState._position = template.computed._position( state.position );
	}
}

var template = (function () {
  return {
    data: function data () {
      return {
        msg: '',
        type: '',
        position: 'bottom-center'
      }
    },
    computed: {
      _position: function _position (position) { return position.split('-').join(' ') }
    }
  }
}());

var added_css = false;
function add_css () {
	var style = createElement( 'style' );
	style.textContent = "\n  [svelte-17148720].toast-container, [svelte-17148720] .toast-container {\n    position: fixed;\n    z-index: 999;\n  }\n  [svelte-17148720].top, [svelte-17148720] .top {\n    top: 15px;\n  }\n  [svelte-17148720].bottom, [svelte-17148720] .bottom {\n    bottom: 15px;\n  }\n  [svelte-17148720].left, [svelte-17148720] .left {\n    left: 15px;\n  }\n  [svelte-17148720].right, [svelte-17148720] .right {\n    right: 15px;\n  }\n  [svelte-17148720].center, [svelte-17148720] .center {\n    left: 50%;\n    transform: translateX(-50%);\n    -webkit-transform: translateX(-50%);\n  }\n  [svelte-17148720].toast, [svelte-17148720] .toast {\n    height: 38px;\n    line-height: 38px;\n    padding: 0 20px;\n    box-shadow: 0 1px 3px rgba(0, 0, 0, .12), 0 1px 2px rgba(0, 0, 0, .24);\n    color: #FFF;\n    -webkit-transition: opacity 0.2s, -webkit-transform 0.2s;\n    transition: opacity 0.2s, transform 0.2s, -webkit-transform 0.2s;\n    -webkit-transform: translateY(35px);\n    transform: translateY(35px);\n    opacity: 0;\n    max-width: 200px;\n    white-space: nowrap;\n    overflow: hidden;\n    text-overflow: ellipsis;\n  }\n  [svelte-17148720].info, [svelte-17148720] .info {\n    background-color: #0091EA;\n  }\n  [svelte-17148720].success, [svelte-17148720] .success {\n    background-color: #4CAF50;\n  }\n  [svelte-17148720].error, [svelte-17148720] .error {\n    background-color: #F44336;\n  }\n  [svelte-17148720].default, [svelte-17148720] .default {\n    background-color: #353535;\n  }\n  [svelte-17148720].anim, [svelte-17148720] .anim {\n    opacity: 1;\n    -webkit-transform: translateY(0);\n    transform: translateY(0);\n  }\n";
	appendNode( style, document.head );

	added_css = true;
}

function create_main_fragment ( state, component ) {
	var div_class_value, div_1_class_value, text_value;

	var div = createElement( 'div' );
	setAttribute( div, 'svelte-17148720', '' );
	div.className = div_class_value = "toast-container " + ( state._position );
	var div_1 = createElement( 'div' );
	appendNode( div_1, div );
	div_1.className = div_1_class_value = "toast " + ( state.type );
	var text = createText( text_value = state.msg );
	appendNode( text, div_1 );

	return {
		mount: function ( target, anchor ) {
			insertNode( div, target, anchor );
		},

		update: function ( changed, state ) {
			if ( div_class_value !== ( div_class_value = "toast-container " + ( state._position ) ) ) {
				div.className = div_class_value;
			}

			if ( div_1_class_value !== ( div_1_class_value = "toast " + ( state.type ) ) ) {
				div_1.className = div_1_class_value;
			}

			if ( text_value !== ( text_value = state.msg ) ) {
				text.data = text_value;
			}
		},

		destroy: function ( detach ) {
			if ( detach ) {
				detachNode( div );
			}
		}
	};
}

function Toast$2 ( options ) {
	options = options || {};
	this._state = assign$1( template.data(), options.data );
	recompute( this._state, this._state, {}, true );

	this._observers = {
		pre: Object.create( null ),
		post: Object.create( null )
	};

	this._handlers = Object.create( null );

	this._root = options._root || this;
	this._yield = options._yield;

	this._torndown = false;
	if ( !added_css ) { add_css(); }

	this._fragment = create_main_fragment( this._state);
	if ( options.target ) { this._fragment.mount( options.target, null ); }
}

assign$1( Toast$2.prototype, proto );

Toast$2.prototype._set = function _set ( newState ) {
	var oldState = this._state;
	this._state = assign$1( {}, oldState, newState );
	recompute( this._state, newState, oldState, false );
	dispatchObservers( this, this._observers.pre, newState, oldState );
	if ( this._fragment ) { this._fragment.update( newState, this._state ); }
	dispatchObservers( this, this._observers.post, newState, oldState );
};

Toast$2.prototype.teardown = Toast$2.prototype.destroy = function destroy ( detach ) {
	this.fire( 'destroy' );

	this._fragment.destroy( detach !== false );
	this._fragment = null;

	this._state = {};
	this._torndown = true;
};

var Toast = function Toast (opts) {
  this.opts = opts || {
    position: 'bottom-center',
    duration: 2000
  };
};

Toast.prototype.show = function show (msg, opts) {
    if ( opts === void 0 ) opts = {};

  this._show(msg, opts, 'default');
};

Toast.prototype.info = function info (msg, opts) {
    if ( opts === void 0 ) opts = {};

  this._show(msg, opts, 'info');
};

Toast.prototype.success = function success (msg, opts) {
    if ( opts === void 0 ) opts = {};

  this._show(msg, opts, 'success');
};

Toast.prototype.error = function error (msg, opts) {
    if ( opts === void 0 ) opts = {};

  this._show(msg, opts, 'error');
};

Toast.prototype._show = function _show (msg, opts, type) {
  var _opts = assign({}, this.opts, opts);
  var t = new Toast$2({
    target: document.querySelector('body'),
    data: {
      msg: msg,
      type: type,
      postion: _opts.postion
    }
  });

  setTimeout(function () {
    t.set({ type: t.get('type') + ' ' + 'anim' });
  }, 0);

  setTimeout(function () {
    t.destroy();
  }, _opts.duration);
};

var svelteToast = Toast;

/* src/components/Comments.svelte generated by Svelte v3.12.1 */

const file$3 = "src/components/Comments.svelte";

function get_each_context$2(ctx, list, i) {
	const child_ctx = Object.create(ctx);
	child_ctx.comment = list[i];
	child_ctx.i = i;
	return child_ctx;
}

// (7:6) {:else}
function create_else_block_4(ctx) {
	var div;

	const block = {
		c: function create() {
			div = element("div");
			this.h();
		},

		l: function claim(nodes) {
			div = claim_element(nodes, "DIV", { class: true }, false);
			var div_nodes = children(div);

			div_nodes.forEach(detach_dev);
			this.h();
		},

		h: function hydrate() {
			attr_dev(div, "class", "w-full h-full spinner");
			add_location(div, file$3, 7, 6, 316);
		},

		m: function mount(target, anchor) {
			insert_dev(target, div, anchor);
		},

		p: noop,

		d: function destroy(detaching) {
			if (detaching) {
				detach_dev(div);
			}
		}
	};
	dispatch_dev("SvelteRegisterBlock", { block, id: create_else_block_4.name, type: "else", source: "(7:6) {:else}", ctx });
	return block;
}

// (5:6) {#if profile_image_uri}
function create_if_block_3$1(ctx) {
	var img;

	const block = {
		c: function create() {
			img = element("img");
			this.h();
		},

		l: function claim(nodes) {
			img = claim_element(nodes, "IMG", { class: true, src: true }, false);
			var img_nodes = children(img);

			img_nodes.forEach(detach_dev);
			this.h();
		},

		h: function hydrate() {
			attr_dev(img, "class", "w-full h-full");
			attr_dev(img, "src", ctx.profile_image_uri);
			add_location(img, file$3, 5, 6, 240);
		},

		m: function mount(target, anchor) {
			insert_dev(target, img, anchor);
		},

		p: function update(changed, ctx) {
			if (changed.profile_image_uri) {
				attr_dev(img, "src", ctx.profile_image_uri);
			}
		},

		d: function destroy(detaching) {
			if (detaching) {
				detach_dev(img);
			}
		}
	};
	dispatch_dev("SvelteRegisterBlock", { block, id: create_if_block_3$1.name, type: "if", source: "(5:6) {#if profile_image_uri}", ctx });
	return block;
}

// (50:4) {:else}
function create_else_block_3(ctx) {
	var div;

	const block = {
		c: function create() {
			div = element("div");
			this.h();
		},

		l: function claim(nodes) {
			div = claim_element(nodes, "DIV", { class: true }, false);
			var div_nodes = children(div);

			div_nodes.forEach(detach_dev);
			this.h();
		},

		h: function hydrate() {
			attr_dev(div, "class", "w-full h-full spinner text-4xl");
			add_location(div, file$3, 50, 6, 2537);
		},

		m: function mount(target, anchor) {
			insert_dev(target, div, anchor);
		},

		p: noop,
		i: noop,
		o: noop,

		d: function destroy(detaching) {
			if (detaching) {
				detach_dev(div);
			}
		}
	};
	dispatch_dev("SvelteRegisterBlock", { block, id: create_else_block_3.name, type: "else", source: "(50:4) {:else}", ctx });
	return block;
}

// (16:4) {#if comments}
function create_if_block$1(ctx) {
	var each_blocks = [], each_1_lookup = new Map(), t, if_block_anchor, current;

	let each_value = ctx.comments;

	const get_key = ctx => ctx.comment.id;

	for (let i = 0; i < each_value.length; i += 1) {
		let child_ctx = get_each_context$2(ctx, each_value, i);
		let key = get_key(child_ctx);
		each_1_lookup.set(key, each_blocks[i] = create_each_block$2(key, child_ctx));
	}

	let each_1_else = null;

	if (!each_value.length) {
		each_1_else = create_else_block_2(ctx);
		each_1_else.c();
	}

	function select_block_type_3(changed, ctx) {
		if (ctx.load_more_loading) return create_if_block_1$1;
		return create_else_block$1;
	}

	var current_block_type = select_block_type_3(null, ctx);
	var if_block = current_block_type(ctx);

	const block = {
		c: function create() {
			for (let i = 0; i < each_blocks.length; i += 1) {
				each_blocks[i].c();
			}

			t = space();
			if_block.c();
			if_block_anchor = empty();
		},

		l: function claim(nodes) {
			for (let i = 0; i < each_blocks.length; i += 1) {
				each_blocks[i].l(nodes);
			}

			t = claim_space(nodes);
			if_block.l(nodes);
			if_block_anchor = empty();
		},

		m: function mount(target, anchor) {
			for (let i = 0; i < each_blocks.length; i += 1) {
				each_blocks[i].m(target, anchor);
			}

			if (each_1_else) {
				each_1_else.m(target, anchor);
			}

			insert_dev(target, t, anchor);
			if_block.m(target, anchor);
			insert_dev(target, if_block_anchor, anchor);
			current = true;
		},

		p: function update(changed, ctx) {
			const each_value = ctx.comments;

			group_outros();
			each_blocks = update_keyed_each(each_blocks, changed, get_key, 1, ctx, each_value, each_1_lookup, t.parentNode, outro_and_destroy_block, create_each_block$2, t, get_each_context$2);
			check_outros();

			if (each_value.length) {
				if (each_1_else) {
					each_1_else.d(1);
					each_1_else = null;
				}
			} else if (!each_1_else) {
				each_1_else = create_else_block_2(ctx);
				each_1_else.c();
				each_1_else.m(t.parentNode, t);
			}

			if (current_block_type !== (current_block_type = select_block_type_3(changed, ctx))) {
				if_block.d(1);
				if_block = current_block_type(ctx);
				if (if_block) {
					if_block.c();
					if_block.m(if_block_anchor.parentNode, if_block_anchor);
				}
			}
		},

		i: function intro(local) {
			if (current) return;
			for (let i = 0; i < each_value.length; i += 1) {
				transition_in(each_blocks[i]);
			}

			current = true;
		},

		o: function outro(local) {
			for (let i = 0; i < each_blocks.length; i += 1) {
				transition_out(each_blocks[i]);
			}

			current = false;
		},

		d: function destroy(detaching) {
			for (let i = 0; i < each_blocks.length; i += 1) {
				each_blocks[i].d(detaching);
			}

			if (each_1_else) each_1_else.d(detaching);

			if (detaching) {
				detach_dev(t);
			}

			if_block.d(detaching);

			if (detaching) {
				detach_dev(if_block_anchor);
			}
		}
	};
	dispatch_dev("SvelteRegisterBlock", { block, id: create_if_block$1.name, type: "if", source: "(16:4) {#if comments}", ctx });
	return block;
}

// (38:6) {:else}
function create_else_block_2(ctx) {
	var div1, div0, t;

	const block = {
		c: function create() {
			div1 = element("div");
			div0 = element("div");
			t = text("댓글이 없어요 ㅜㅜ");
			this.h();
		},

		l: function claim(nodes) {
			div1 = claim_element(nodes, "DIV", { class: true }, false);
			var div1_nodes = children(div1);

			div0 = claim_element(div1_nodes, "DIV", {}, false);
			var div0_nodes = children(div0);

			t = claim_text(div0_nodes, "댓글이 없어요 ㅜㅜ");
			div0_nodes.forEach(detach_dev);
			div1_nodes.forEach(detach_dev);
			this.h();
		},

		h: function hydrate() {
			add_location(div0, file$3, 39, 10, 2222);
			attr_dev(div1, "class", "w-full h-full flex justify-center items-center text-xl text-gray-600 pb-2 pt-2");
			add_location(div1, file$3, 38, 8, 2119);
		},

		m: function mount(target, anchor) {
			insert_dev(target, div1, anchor);
			append_dev(div1, div0);
			append_dev(div0, t);
		},

		d: function destroy(detaching) {
			if (detaching) {
				detach_dev(div1);
			}
		}
	};
	dispatch_dev("SvelteRegisterBlock", { block, id: create_else_block_2.name, type: "else", source: "(38:6) {:else}", ctx });
	return block;
}

// (31:10) {:else}
function create_else_block_1(ctx) {
	var button, t, dispose;

	function click_handler_2(...args) {
		return ctx.click_handler_2(ctx, ...args);
	}

	const block = {
		c: function create() {
			button = element("button");
			t = text("~ 펼치기 ~");
			this.h();
		},

		l: function claim(nodes) {
			button = claim_element(nodes, "BUTTON", { class: true }, false);
			var button_nodes = children(button);

			t = claim_text(button_nodes, "~ 펼치기 ~");
			button_nodes.forEach(detach_dev);
			this.h();
		},

		h: function hydrate() {
			attr_dev(button, "class", "flex-1 text-left pl-4");
			add_location(button, file$3, 31, 12, 1838);
			dispose = listen_dev(button, "click", click_handler_2);
		},

		m: function mount(target, anchor) {
			insert_dev(target, button, anchor);
			append_dev(button, t);
		},

		p: function update(changed, new_ctx) {
			ctx = new_ctx;
		},

		d: function destroy(detaching) {
			if (detaching) {
				detach_dev(button);
			}

			dispose();
		}
	};
	dispatch_dev("SvelteRegisterBlock", { block, id: create_else_block_1.name, type: "else", source: "(31:10) {:else}", ctx });
	return block;
}

// (29:10) {#if comment.agreed || comment.upvote - comment.downvote > -5}
function create_if_block_2$1(ctx) {
	var div, t_value = ctx.comment.contents + "", t;

	const block = {
		c: function create() {
			div = element("div");
			t = text(t_value);
			this.h();
		},

		l: function claim(nodes) {
			div = claim_element(nodes, "DIV", { class: true }, false);
			var div_nodes = children(div);

			t = claim_text(div_nodes, t_value);
			div_nodes.forEach(detach_dev);
			this.h();
		},

		h: function hydrate() {
			attr_dev(div, "class", "ml-4 flex-1 flex flex-row items-center");
			add_location(div, file$3, 29, 12, 1729);
		},

		m: function mount(target, anchor) {
			insert_dev(target, div, anchor);
			append_dev(div, t);
		},

		p: function update(changed, ctx) {
			if ((changed.comments) && t_value !== (t_value = ctx.comment.contents + "")) {
				set_data_dev(t, t_value);
			}
		},

		d: function destroy(detaching) {
			if (detaching) {
				detach_dev(div);
			}
		}
	};
	dispatch_dev("SvelteRegisterBlock", { block, id: create_if_block_2$1.name, type: "if", source: "(29:10) {#if comment.agreed || comment.upvote - comment.downvote > -5}", ctx });
	return block;
}

// (17:6) {#each comments as comment, i (comment.id)}
function create_each_block$2(key_1, ctx) {
	var div3, div0, t0_value = ctx.comment.upvote - ctx.comment.downvote + "", t0, t1, div1, button0, t2, button1, t3, div2, img, img_src_value, t4, current, dispose;

	var faicon0 = new FaIcon({
		props: { class: "w-4 h-4", icon: faArrowUp_2 },
		$$inline: true
	});

	function click_handler(...args) {
		return ctx.click_handler(ctx, ...args);
	}

	var faicon1 = new FaIcon({
		props: { class: "w-4 h-4", icon: faArrowDown_2 },
		$$inline: true
	});

	function click_handler_1(...args) {
		return ctx.click_handler_1(ctx, ...args);
	}

	function select_block_type_2(changed, ctx) {
		if (ctx.comment.agreed || ctx.comment.upvote - ctx.comment.downvote > -5) return create_if_block_2$1;
		return create_else_block_1;
	}

	var current_block_type = select_block_type_2(null, ctx);
	var if_block = current_block_type(ctx);

	const block = {
		key: key_1,

		first: null,

		c: function create() {
			div3 = element("div");
			div0 = element("div");
			t0 = text(t0_value);
			t1 = space();
			div1 = element("div");
			button0 = element("button");
			faicon0.$$.fragment.c();
			t2 = space();
			button1 = element("button");
			faicon1.$$.fragment.c();
			t3 = space();
			div2 = element("div");
			img = element("img");
			t4 = space();
			if_block.c();
			this.h();
		},

		l: function claim(nodes) {
			div3 = claim_element(nodes, "DIV", { class: true }, false);
			var div3_nodes = children(div3);

			div0 = claim_element(div3_nodes, "DIV", { class: true }, false);
			var div0_nodes = children(div0);

			t0 = claim_text(div0_nodes, t0_value);
			div0_nodes.forEach(detach_dev);
			t1 = claim_space(div3_nodes);

			div1 = claim_element(div3_nodes, "DIV", { class: true }, false);
			var div1_nodes = children(div1);

			button0 = claim_element(div1_nodes, "BUTTON", {}, false);
			var button0_nodes = children(button0);

			faicon0.$$.fragment.l(button0_nodes);
			button0_nodes.forEach(detach_dev);
			t2 = claim_space(div1_nodes);

			button1 = claim_element(div1_nodes, "BUTTON", {}, false);
			var button1_nodes = children(button1);

			faicon1.$$.fragment.l(button1_nodes);
			button1_nodes.forEach(detach_dev);
			div1_nodes.forEach(detach_dev);
			t3 = claim_space(div3_nodes);

			div2 = claim_element(div3_nodes, "DIV", { class: true }, false);
			var div2_nodes = children(div2);

			img = claim_element(div2_nodes, "IMG", { class: true, src: true }, false);
			var img_nodes = children(img);

			img_nodes.forEach(detach_dev);
			div2_nodes.forEach(detach_dev);
			t4 = claim_space(div3_nodes);
			if_block.l(div3_nodes);
			div3_nodes.forEach(detach_dev);
			this.h();
		},

		h: function hydrate() {
			attr_dev(div0, "class", "text-gray-600 m-auto w-4 text-right");
			toggle_class(div0, "text-xs", ctx.Math.abs(ctx.comment.upvote - ctx.comment.downvote) >= 10);
			toggle_class(div0, "text-lg", ctx.Math.abs(ctx.comment.upvote - ctx.comment.downvote) < 10);
			add_location(div0, file$3, 18, 10, 928);
			add_location(button0, file$3, 22, 12, 1271);
			add_location(button1, file$3, 23, 12, 1384);
			attr_dev(div1, "class", "flex flex-col justify-center mr-2 ml-1 text-gray-600");
			add_location(div1, file$3, 21, 10, 1192);
			attr_dev(img, "class", "w-full h-full");
			attr_dev(img, "src", img_src_value = ctx.hash_to_image_uri(ctx.comment.fingerprint_hash));
			add_location(img, file$3, 26, 12, 1546);
			attr_dev(div2, "class", "w-4");
			add_location(div2, file$3, 25, 10, 1515);
			attr_dev(div3, "class", "border-b flex flex-row p-2 items-stretch");
			toggle_class(div3, "opacity-50", !ctx.comment.agreed && ctx.comment.upvote - ctx.comment.downvote <= -5);
			add_location(div3, file$3, 17, 8, 785);

			dispose = [
				listen_dev(button0, "click", click_handler),
				listen_dev(button1, "click", click_handler_1)
			];

			this.first = div3;
		},

		m: function mount(target, anchor) {
			insert_dev(target, div3, anchor);
			append_dev(div3, div0);
			append_dev(div0, t0);
			append_dev(div3, t1);
			append_dev(div3, div1);
			append_dev(div1, button0);
			mount_component(faicon0, button0, null);
			append_dev(div1, t2);
			append_dev(div1, button1);
			mount_component(faicon1, button1, null);
			append_dev(div3, t3);
			append_dev(div3, div2);
			append_dev(div2, img);
			append_dev(div3, t4);
			if_block.m(div3, null);
			current = true;
		},

		p: function update(changed, new_ctx) {
			ctx = new_ctx;
			if ((!current || changed.comments) && t0_value !== (t0_value = ctx.comment.upvote - ctx.comment.downvote + "")) {
				set_data_dev(t0, t0_value);
			}

			if ((changed.Math || changed.comments)) {
				toggle_class(div0, "text-xs", ctx.Math.abs(ctx.comment.upvote - ctx.comment.downvote) >= 10);
				toggle_class(div0, "text-lg", ctx.Math.abs(ctx.comment.upvote - ctx.comment.downvote) < 10);
			}

			if ((!current || changed.comments) && img_src_value !== (img_src_value = ctx.hash_to_image_uri(ctx.comment.fingerprint_hash))) {
				attr_dev(img, "src", img_src_value);
			}

			if (current_block_type === (current_block_type = select_block_type_2(changed, ctx)) && if_block) {
				if_block.p(changed, ctx);
			} else {
				if_block.d(1);
				if_block = current_block_type(ctx);
				if (if_block) {
					if_block.c();
					if_block.m(div3, null);
				}
			}

			if (changed.comments) {
				toggle_class(div3, "opacity-50", !ctx.comment.agreed && ctx.comment.upvote - ctx.comment.downvote <= -5);
			}
		},

		i: function intro(local) {
			if (current) return;
			transition_in(faicon0.$$.fragment, local);

			transition_in(faicon1.$$.fragment, local);

			current = true;
		},

		o: function outro(local) {
			transition_out(faicon0.$$.fragment, local);
			transition_out(faicon1.$$.fragment, local);
			current = false;
		},

		d: function destroy(detaching) {
			if (detaching) {
				detach_dev(div3);
			}

			destroy_component(faicon0);

			destroy_component(faicon1);

			if_block.d();
			run_all(dispose);
		}
	};
	dispatch_dev("SvelteRegisterBlock", { block, id: create_each_block$2.name, type: "each", source: "(17:6) {#each comments as comment, i (comment.id)}", ctx });
	return block;
}

// (47:6) {:else}
function create_else_block$1(ctx) {
	var button, t, dispose;

	const block = {
		c: function create() {
			button = element("button");
			t = text("더 보기");
			this.h();
		},

		l: function claim(nodes) {
			button = claim_element(nodes, "BUTTON", { class: true }, false);
			var button_nodes = children(button);

			t = claim_text(button_nodes, "더 보기");
			button_nodes.forEach(detach_dev);
			this.h();
		},

		h: function hydrate() {
			attr_dev(button, "class", "w-full border-t py-3 text-normal");
			add_location(button, file$3, 47, 6, 2422);
			dispose = listen_dev(button, "click", ctx.load_more);
		},

		m: function mount(target, anchor) {
			insert_dev(target, button, anchor);
			append_dev(button, t);
		},

		d: function destroy(detaching) {
			if (detaching) {
				detach_dev(button);
			}

			dispose();
		}
	};
	dispatch_dev("SvelteRegisterBlock", { block, id: create_else_block$1.name, type: "else", source: "(47:6) {:else}", ctx });
	return block;
}

// (45:6) {#if load_more_loading}
function create_if_block_1$1(ctx) {
	var div, dispose;

	const block = {
		c: function create() {
			div = element("div");
			this.h();
		},

		l: function claim(nodes) {
			div = claim_element(nodes, "DIV", { class: true }, false);
			var div_nodes = children(div);

			div_nodes.forEach(detach_dev);
			this.h();
		},

		h: function hydrate() {
			attr_dev(div, "class", "w-full border-t p-2 spinner");
			add_location(div, file$3, 45, 6, 2333);
			dispose = listen_dev(div, "click", ctx.load_more);
		},

		m: function mount(target, anchor) {
			insert_dev(target, div, anchor);
		},

		d: function destroy(detaching) {
			if (detaching) {
				detach_dev(div);
			}

			dispose();
		}
	};
	dispatch_dev("SvelteRegisterBlock", { block, id: create_if_block_1$1.name, type: "if", source: "(45:6) {#if load_more_loading}", ctx });
	return block;
}

function create_fragment$3(ctx) {
	var div3, div1, div0, t0, textarea, t1, button, t2, t3, div2, current_block_type_index, if_block1, current, dispose;

	function select_block_type(changed, ctx) {
		if (ctx.profile_image_uri) return create_if_block_3$1;
		return create_else_block_4;
	}

	var current_block_type = select_block_type(null, ctx);
	var if_block0 = current_block_type(ctx);

	var if_block_creators = [
		create_if_block$1,
		create_else_block_3
	];

	var if_blocks = [];

	function select_block_type_1(changed, ctx) {
		if (ctx.comments) return 0;
		return 1;
	}

	current_block_type_index = select_block_type_1(null, ctx);
	if_block1 = if_blocks[current_block_type_index] = if_block_creators[current_block_type_index](ctx);

	const block = {
		c: function create() {
			div3 = element("div");
			div1 = element("div");
			div0 = element("div");
			if_block0.c();
			t0 = space();
			textarea = element("textarea");
			t1 = space();
			button = element("button");
			t2 = text("등록");
			t3 = space();
			div2 = element("div");
			if_block1.c();
			this.h();
		},

		l: function claim(nodes) {
			div3 = claim_element(nodes, "DIV", { class: true }, false);
			var div3_nodes = children(div3);

			div1 = claim_element(div3_nodes, "DIV", { class: true }, false);
			var div1_nodes = children(div1);

			div0 = claim_element(div1_nodes, "DIV", { class: true }, false);
			var div0_nodes = children(div0);

			if_block0.l(div0_nodes);
			div0_nodes.forEach(detach_dev);
			t0 = claim_space(div1_nodes);

			textarea = claim_element(div1_nodes, "TEXTAREA", { class: true, rows: true }, false);
			var textarea_nodes = children(textarea);

			textarea_nodes.forEach(detach_dev);
			t1 = claim_space(div1_nodes);

			button = claim_element(div1_nodes, "BUTTON", { class: true }, false);
			var button_nodes = children(button);

			t2 = claim_text(button_nodes, "등록");
			button_nodes.forEach(detach_dev);
			div1_nodes.forEach(detach_dev);
			t3 = claim_space(div3_nodes);

			div2 = claim_element(div3_nodes, "DIV", { class: true }, false);
			var div2_nodes = children(div2);

			if_block1.l(div2_nodes);
			div2_nodes.forEach(detach_dev);
			div3_nodes.forEach(detach_dev);
			this.h();
		},

		h: function hydrate() {
			attr_dev(div0, "class", "w-4");
			add_location(div0, file$3, 3, 4, 186);
			attr_dev(textarea, "class", "flex-1 p-1 ml-4 border");
			attr_dev(textarea, "rows", "2");
			add_location(textarea, file$3, 11, 4, 491);
			attr_dev(button, "class", "border text-center p-2 text-white bg-primary-600");
			add_location(button, file$3, 12, 4, 579);
			attr_dev(div1, "class", "flex flex-row p-2 items-stretch");
			add_location(div1, file$3, 1, 2, 52);
			attr_dev(div2, "class", "flex-1");
			add_location(div2, file$3, 14, 2, 687);
			attr_dev(div3, "class", "w-full h-full flex flex-col text-xs");
			add_location(div3, file$3, 0, 0, 0);

			dispose = [
				listen_dev(textarea, "input", ctx.textarea_input_handler),
				listen_dev(button, "click", ctx.submit)
			];
		},

		m: function mount(target, anchor) {
			insert_dev(target, div3, anchor);
			append_dev(div3, div1);
			append_dev(div1, div0);
			if_block0.m(div0, null);
			append_dev(div1, t0);
			append_dev(div1, textarea);

			set_input_value(textarea, ctx.contents);

			append_dev(div1, t1);
			append_dev(div1, button);
			append_dev(button, t2);
			append_dev(div3, t3);
			append_dev(div3, div2);
			if_blocks[current_block_type_index].m(div2, null);
			current = true;
		},

		p: function update(changed, ctx) {
			if (current_block_type === (current_block_type = select_block_type(changed, ctx)) && if_block0) {
				if_block0.p(changed, ctx);
			} else {
				if_block0.d(1);
				if_block0 = current_block_type(ctx);
				if (if_block0) {
					if_block0.c();
					if_block0.m(div0, null);
				}
			}

			if (changed.contents) set_input_value(textarea, ctx.contents);

			var previous_block_index = current_block_type_index;
			current_block_type_index = select_block_type_1(changed, ctx);
			if (current_block_type_index === previous_block_index) {
				if_blocks[current_block_type_index].p(changed, ctx);
			} else {
				group_outros();
				transition_out(if_blocks[previous_block_index], 1, 1, () => {
					if_blocks[previous_block_index] = null;
				});
				check_outros();

				if_block1 = if_blocks[current_block_type_index];
				if (!if_block1) {
					if_block1 = if_blocks[current_block_type_index] = if_block_creators[current_block_type_index](ctx);
					if_block1.c();
				}
				transition_in(if_block1, 1);
				if_block1.m(div2, null);
			}
		},

		i: function intro(local) {
			if (current) return;
			transition_in(if_block1);
			current = true;
		},

		o: function outro(local) {
			transition_out(if_block1);
			current = false;
		},

		d: function destroy(detaching) {
			if (detaching) {
				detach_dev(div3);
			}

			if_block0.d();
			if_blocks[current_block_type_index].d();
			run_all(dispose);
		}
	};
	dispatch_dev("SvelteRegisterBlock", { block, id: create_fragment$3.name, type: "component", source: "", ctx });
	return block;
}

let nickname = "guest";

let password = "1234";

function score(comment){
let n = comment.upvote + comment.downvote,
    p = comment.upvote / n,
    z = 1.281551565545,
    r = z*Math.sqrt(p*(1-p)/n + z*z/(4*n*n)),
    under = 1+1/n*z*z;
return (1 - r) / under;
}

function instance$3($$self, $$props, $$invalidate) {
	
const toast = new svelteToast();

let { streamer_id } = $$props;
let contents;

let comments;

let load_more_loading = false;

let profile_image_uri;

function refresh_comments(){
  API.comments(streamer_id).then(_comments => {
    $$invalidate('comments', comments = _comments);
  }).catch(e => {
  });
}
function load_more(){
  if(comments.length){
    $$invalidate('load_more_loading', load_more_loading = true);
    API.comments(streamer_id, comments.length).then(_comments => {
      $$invalidate('comments', comments = [...comments, ..._comments]);
      $$invalidate('load_more_loading', load_more_loading = false);
    });
  }
}

const base64abc = (() => {
	let abc = [],
		A = "A".charCodeAt(0),
		a = "a".charCodeAt(0),
		n = "0".charCodeAt(0);
	for (let i = 0; i < 26; ++i) {
		abc.push(String.fromCharCode(A + i));
	}
	for (let i = 0; i < 26; ++i) {
		abc.push(String.fromCharCode(a + i));
	}
	for (let i = 0; i < 10; ++i) {
		abc.push(String.fromCharCode(n + i));
	}
	abc.push("+");
	abc.push("/");
	return abc;
})();

function bytesToBase64(bytes) {
	let result = '', i, l = bytes.length;
	for (i = 2; i < l; i += 3) {
		result += base64abc[bytes[i - 2] >> 2];
		result += base64abc[((bytes[i - 2] & 0x03) << 4) | (bytes[i - 1] >> 4)];
		result += base64abc[((bytes[i - 1] & 0x0F) << 2) | (bytes[i] >> 6)];
		result += base64abc[bytes[i] & 0x3F];
	}
	if (i === l + 1) { // 1 octet missing
		result += base64abc[bytes[i - 2] >> 2];
		result += base64abc[(bytes[i - 2] & 0x03) << 4];
		result += "==";
	}
	if (i === l) { // 2 octets missing
		result += base64abc[bytes[i - 2] >> 2];
		result += base64abc[((bytes[i - 2] & 0x03) << 4) | (bytes[i - 1] >> 4)];
		result += base64abc[(bytes[i - 1] & 0x0F) << 2];
		result += "=";
	}
	return result;
}

function hash_to_image_uri(hash){
  return `https://avatars.dicebear.com/v2/identicon/${escape(bytesToBase64(hash))}.svg`;
}

refresh_comments();

API.fingerprint_hash().then(hash => {
  $$invalidate('profile_image_uri', profile_image_uri = hash_to_image_uri(hash));
});

function submit(){
  API.write_comment(streamer_id, nickname, password, contents).then(res => {
    refresh_comments();
  });
}
function vote(id, upvote, idx){
  API.vote_comment(streamer_id, id, upvote).then(res => {
    if(upvote)
      $$invalidate('comments', comments[idx].upvote = comments[idx].upvote + 1, comments);
    else
      $$invalidate('comments', comments[idx].downvote = comments[idx].downvote + 1, comments);
    $$invalidate('comments', comments[idx].score = score(comments[idx]), comments);
    $$invalidate('comments', comments = comments.sort((a, b) => b.score - a.score || b.parent_id - a.parent_id || b.id - a.id));
  }).catch(e => {
    if(e == 400) {
      toast.show('중복 평가는 안돼요!');
    }
  });
}

let last_streamer_id;

	const writable_props = ['streamer_id'];
	Object.keys($$props).forEach(key => {
		if (!writable_props.includes(key) && !key.startsWith('$$')) console.warn(`<Comments> was created with unknown prop '${key}'`);
	});

	function textarea_input_handler() {
		contents = this.value;
		$$invalidate('contents', contents);
	}

	const click_handler = ({ comment, i }, e) => vote(comment.id, true, i);

	const click_handler_1 = ({ comment, i }, e) => vote(comment.id, false, i);

	const click_handler_2 = ({ i }, e) => $$invalidate('comments', comments[i].agreed = true, comments);

	$$self.$set = $$props => {
		if ('streamer_id' in $$props) $$invalidate('streamer_id', streamer_id = $$props.streamer_id);
	};

	$$self.$capture_state = () => {
		return { streamer_id, nickname, password, contents, comments, load_more_loading, profile_image_uri, last_streamer_id };
	};

	$$self.$inject_state = $$props => {
		if ('streamer_id' in $$props) $$invalidate('streamer_id', streamer_id = $$props.streamer_id);
		if ('nickname' in $$props) nickname = $$props.nickname;
		if ('password' in $$props) password = $$props.password;
		if ('contents' in $$props) $$invalidate('contents', contents = $$props.contents);
		if ('comments' in $$props) $$invalidate('comments', comments = $$props.comments);
		if ('load_more_loading' in $$props) $$invalidate('load_more_loading', load_more_loading = $$props.load_more_loading);
		if ('profile_image_uri' in $$props) $$invalidate('profile_image_uri', profile_image_uri = $$props.profile_image_uri);
		if ('last_streamer_id' in $$props) $$invalidate('last_streamer_id', last_streamer_id = $$props.last_streamer_id);
	};

	$$self.$$.update = ($$dirty = { last_streamer_id: 1, streamer_id: 1 }) => {
		if ($$dirty.last_streamer_id || $$dirty.streamer_id) { if(last_streamer_id != streamer_id) {
      $$invalidate('last_streamer_id', last_streamer_id = streamer_id);
      refresh_comments();
    } }
	};

	return {
		streamer_id,
		contents,
		comments,
		load_more_loading,
		profile_image_uri,
		load_more,
		hash_to_image_uri,
		submit,
		vote,
		Math,
		textarea_input_handler,
		click_handler,
		click_handler_1,
		click_handler_2
	};
}

class Comments extends SvelteComponentDev {
	constructor(options) {
		super(options);
		init(this, options, instance$3, create_fragment$3, safe_not_equal, ["streamer_id"]);
		dispatch_dev("SvelteRegisterComponent", { component: this, tagName: "Comments", options, id: create_fragment$3.name });

		const { ctx } = this.$$;
		const props = options.props || {};
		if (ctx.streamer_id === undefined && !('streamer_id' in props)) {
			console.warn("<Comments> was created without expected prop 'streamer_id'");
		}
	}

	get streamer_id() {
		throw new Error("<Comments>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
	}

	set streamer_id(value) {
		throw new Error("<Comments>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
	}
}

/* src/components/KeywordCloud.svelte generated by Svelte v3.12.1 */

const file$4 = "src/components/KeywordCloud.svelte";

function create_fragment$4(ctx) {
	var canvas_1;

	const block = {
		c: function create() {
			canvas_1 = element("canvas");
			this.h();
		},

		l: function claim(nodes) {
			canvas_1 = claim_element(nodes, "CANVAS", { class: true }, false);
			var canvas_1_nodes = children(canvas_1);

			canvas_1_nodes.forEach(detach_dev);
			this.h();
		},

		h: function hydrate() {
			attr_dev(canvas_1, "class", "w-full");
			add_location(canvas_1, file$4, 0, 0, 0);
		},

		m: function mount(target, anchor) {
			insert_dev(target, canvas_1, anchor);
			ctx.canvas_1_binding(canvas_1);
		},

		p: noop,
		i: noop,
		o: noop,

		d: function destroy(detaching) {
			if (detaching) {
				detach_dev(canvas_1);
			}

			ctx.canvas_1_binding(null);
		}
	};
	dispatch_dev("SvelteRegisterBlock", { block, id: create_fragment$4.name, type: "component", source: "", ctx });
	return block;
}

function instance$4($$self, $$props, $$invalidate) {
	
let { streamer_id } = $$props;
let canvas;
let WordCloud;
let width;
let height;

let last_streamer_id = null;
onMount(async ()=>{
  $$invalidate('width', width = canvas.getBoundingClientRect().width),
  height = canvas.getBoundingClientRect().height;
  $$invalidate('canvas', canvas.width = width, canvas);
  $$invalidate('canvas', canvas.height = width, canvas);
  let { WordCloud:w } = await import('./wordcloud2.ef292c4e.js');
  $$invalidate('WordCloud', WordCloud = w);
});

	const writable_props = ['streamer_id'];
	Object.keys($$props).forEach(key => {
		if (!writable_props.includes(key) && !key.startsWith('$$')) console.warn(`<KeywordCloud> was created with unknown prop '${key}'`);
	});

	function canvas_1_binding($$value) {
		binding_callbacks[$$value ? 'unshift' : 'push'](() => {
			$$invalidate('canvas', canvas = $$value);
		});
	}

	$$self.$set = $$props => {
		if ('streamer_id' in $$props) $$invalidate('streamer_id', streamer_id = $$props.streamer_id);
	};

	$$self.$capture_state = () => {
		return { streamer_id, canvas, WordCloud, width, height, last_streamer_id };
	};

	$$self.$inject_state = $$props => {
		if ('streamer_id' in $$props) $$invalidate('streamer_id', streamer_id = $$props.streamer_id);
		if ('canvas' in $$props) $$invalidate('canvas', canvas = $$props.canvas);
		if ('WordCloud' in $$props) $$invalidate('WordCloud', WordCloud = $$props.WordCloud);
		if ('width' in $$props) $$invalidate('width', width = $$props.width);
		if ('height' in $$props) height = $$props.height;
		if ('last_streamer_id' in $$props) $$invalidate('last_streamer_id', last_streamer_id = $$props.last_streamer_id);
	};

	$$self.$$.update = ($$dirty = { WordCloud: 1, last_streamer_id: 1, streamer_id: 1, canvas: 1, width: 1 }) => {
		if ($$dirty.WordCloud || $$dirty.last_streamer_id || $$dirty.streamer_id || $$dirty.canvas || $$dirty.width) { if(WordCloud && last_streamer_id != streamer_id) {
      $$invalidate('last_streamer_id', last_streamer_id = streamer_id);
      API.keywords(streamer_id).then(keywords => {
        keywords = keywords.filter(x => x[0] != "ㅋㅋ" && x[0] != "ㄷㄷ");
        let max_fraction = Math.max(...keywords.map(x => x[1])),
            min_fraction = Math.min(...keywords.map(x => x[1]));
        //keywords = keywords.map(x => [x[0], (x[1] - min_fraction)/(max_fraction-min_fraction)*120 + 9]);
        keywords = keywords.map(x => [x[0], (x[1] - min_fraction)/(max_fraction-min_fraction)*9.2 + 0.8]);
        let area = keywords.reduce((res,b) => res + b[0].length*b[1], 0);
        WordCloud(canvas, {
          list: keywords,
          gridSize: Math.round(16 * width / 1024),
          weightFactor: width / 1024 * 32 * 380/area,
          fontFamily: '-apple-system, BlinkMacSystemFont, Segoe UI, Roboto, Helvetica Neue, Arial, Noto Sans, sans-serif, Apple Color Emoji, Segoe UI Emoji, Segoe UI Symbol, Noto Color Emoji',
          fontWeight: "bold",
          color: 'random-dark',
          backgroundColor: 'transparent',
          rotateRatio: 0,
          rotationSteps: 1
          ,  ellipticity: 1,
          /*shape: function(theta) {
            var max = 195;
            var leng = [134,135,135,135,135,135,135,135,135,135,135,135,135,136,136,136,136,136,137,137,137,138,138,138,138,139,139,140,140,140,141,141,142,142,143,143,144,144,145,145,146,147,147,148,149,149,150,151,152,153,153,154,155,156,157,158,159,160,161,162,163,164,165,167,168,169,170,172,173,175,176,178,179,181,182,184,186,188,189,191,193,195,195,193,192,190,188,187,185,184,182,181,179,178,177,175,174,173,172,171,169,168,167,166,165,164,163,163,162,161,160,159,158,158,157,156,155,155,154,154,153,152,152,151,151,150,150,149,149,148,148,148,147,147,146,146,146,145,145,145,145,144,144,144,144,144,143,143,143,143,143,143,143,143,143,143,143,143,143,143,143,143,143,143,143,143,143,143,143,144,144,144,144,144,145,145,145,145,146,146,146,147,147,147,148,148,149,149,150,150,151,151,152,152,153,153,154,155,155,156,157,157,158,159,160,161,162,162,163,164,165,166,167,168,169,170,172,173,174,175,176,178,179,180,182,183,185,186,188,190,191,193,195,193,191,189,187,185,183,182,180,178,177,175,174,172,171,169,168,167,166,164,163,162,161,160,159,158,157,156,155,154,153,152,151,150,150,149,148,147,147,146,145,145,144,143,143,142,142,141,141,140,140,139,139,138,138,138,137,137,136,136,136,136,135,135,135,134,134,134,134,134,133,133,133,133,133,133,133,133,133,133,133,133,133,133,133,133,133,133,133,133,133,133,133,133,133,134,134,134,134,134,135,135,135,135,136,136,136,137,137,137,138,138,139,139,140,140,140,141,142,142,143,143,144,144,145,146,146,147,148,149,149,150,151,152,153,154,154,155,156,157,158,159,160,160,158,156,154,152,150,148,146,144,143,141,139,138,136,135,133,132,131,129,128,127,126,124,123,122,121,120,119,118,117,116,115,114,114,113,112,111,110,111,109,108,108,110,112,114,116,118,120,122,125,127,130,133,136,139,142,145,149,149,147,144,140,136,135,131,129,126,125,121,120,118,115,114,113,110,108,107,105,103,102,101,100,97,96,95,94,93,92,92,92,92,92,92,93,92,92,92,92,92,92,92,92,92,92,92,92,92,93,92,92,92,93,93,93,93,93,93,94,94,94,94,94,95,95,95,95,96,96,96,97,97,97,98,98,98,99,99,100,101,101,101,102,102,103,103,104,104,105,105,106,107,107,108,109,109,110,111,112,112,113,114,115,116,117,118,119,120,121,121,121,121,122,122,122,122,121,121,121,121,122,122,122,122,122,122,122,122,123,123,123,123,123,123,123,124,124,124,125,125,125,125,126,126,126,127,127,128,128,129,129,130,130,131,131,132,132,133,133,134,134,135,136,136,137,138,139,140,139,139,139,138,138,138,137,137,137,137,136,136,136,136,136,135,135,135,135,135,135,135,135,135,135,135,136];
    
            return leng[(theta / (2 * Math.PI)) * leng.length | 0] / max;
          }*/
        });
    
      });
    } }
	};

	return { streamer_id, canvas, canvas_1_binding };
}

class KeywordCloud extends SvelteComponentDev {
	constructor(options) {
		super(options);
		init(this, options, instance$4, create_fragment$4, safe_not_equal, ["streamer_id"]);
		dispatch_dev("SvelteRegisterComponent", { component: this, tagName: "KeywordCloud", options, id: create_fragment$4.name });

		const { ctx } = this.$$;
		const props = options.props || {};
		if (ctx.streamer_id === undefined && !('streamer_id' in props)) {
			console.warn("<KeywordCloud> was created without expected prop 'streamer_id'");
		}
	}

	get streamer_id() {
		throw new Error("<KeywordCloud>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
	}

	set streamer_id(value) {
		throw new Error("<KeywordCloud>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
	}
}

/* src/components/SubscriberDistribution.svelte generated by Svelte v3.12.1 */

const file$5 = "src/components/SubscriberDistribution.svelte";

function get_each_context$3(ctx, list, i) {
	const child_ctx = Object.create(ctx);
	child_ctx.d = list[i];
	return child_ctx;
}

// (2:2) {#each distribution as d}
function create_each_block$3(ctx) {
	var div2, div0, t0_value = ctx.d[0] >= 0? ctx.d[0] + "개월" : "비구독" + "", t0, t1, div1, span, t2_value = (ctx.d[1]*100).toFixed(1) + "", t2, t3;

	const block = {
		c: function create() {
			div2 = element("div");
			div0 = element("div");
			t0 = text(t0_value);
			t1 = space();
			div1 = element("div");
			span = element("span");
			t2 = text(t2_value);
			t3 = text("%");
			this.h();
		},

		l: function claim(nodes) {
			div2 = claim_element(nodes, "DIV", { class: true }, false);
			var div2_nodes = children(div2);

			div0 = claim_element(div2_nodes, "DIV", { class: true }, false);
			var div0_nodes = children(div0);

			t0 = claim_text(div0_nodes, t0_value);
			div0_nodes.forEach(detach_dev);
			t1 = claim_space(div2_nodes);

			div1 = claim_element(div2_nodes, "DIV", { class: true, style: true }, false);
			var div1_nodes = children(div1);

			span = claim_element(div1_nodes, "SPAN", { class: true, style: true }, false);
			var span_nodes = children(span);

			t2 = claim_text(span_nodes, t2_value);
			t3 = claim_text(span_nodes, "%");
			span_nodes.forEach(detach_dev);
			div1_nodes.forEach(detach_dev);
			div2_nodes.forEach(detach_dev);
			this.h();
		},

		h: function hydrate() {
			attr_dev(div0, "class", "w-16 text-center pr-2");
			add_location(div0, file$5, 3, 6, 214);
			attr_dev(span, "class", "pl-2");
			set_style(span, "margin-left", "100%");
			add_location(span, file$5, 5, 8, 431);
			attr_dev(div1, "class", "bg-primary-600 flex items-center h-full text-gray-600 pt-px");
			set_style(div1, "width", "" + ctx.d[1]/ctx.max_ratio*50 + "%");
			set_style(div1, "min-width", "1px");
			add_location(div1, file$5, 4, 6, 296);
			attr_dev(div2, "class", "flex flex-row w-full items-center");
			add_location(div2, file$5, 2, 4, 160);
		},

		m: function mount(target, anchor) {
			insert_dev(target, div2, anchor);
			append_dev(div2, div0);
			append_dev(div0, t0);
			append_dev(div2, t1);
			append_dev(div2, div1);
			append_dev(div1, span);
			append_dev(span, t2);
			append_dev(span, t3);
		},

		p: function update(changed, ctx) {
			if ((changed.distribution) && t0_value !== (t0_value = ctx.d[0] >= 0? ctx.d[0] + "개월" : "비구독" + "")) {
				set_data_dev(t0, t0_value);
			}

			if ((changed.distribution) && t2_value !== (t2_value = (ctx.d[1]*100).toFixed(1) + "")) {
				set_data_dev(t2, t2_value);
			}

			if (changed.distribution || changed.max_ratio) {
				set_style(div1, "width", "" + ctx.d[1]/ctx.max_ratio*50 + "%");
			}
		},

		d: function destroy(detaching) {
			if (detaching) {
				detach_dev(div2);
			}
		}
	};
	dispatch_dev("SvelteRegisterBlock", { block, id: create_each_block$3.name, type: "each", source: "(2:2) {#each distribution as d}", ctx });
	return block;
}

function create_fragment$5(ctx) {
	var div3, t0, div2, div0, t1, t2, div1, t3;

	let each_value = ctx.distribution;

	let each_blocks = [];

	for (let i = 0; i < each_value.length; i += 1) {
		each_blocks[i] = create_each_block$3(get_each_context$3(ctx, each_value, i));
	}

	const block = {
		c: function create() {
			div3 = element("div");

			for (let i = 0; i < each_blocks.length; i += 1) {
				each_blocks[i].c();
			}

			t0 = space();
			div2 = element("div");
			div0 = element("div");
			t1 = text("구독월수");
			t2 = space();
			div1 = element("div");
			t3 = text("비율");
			this.h();
		},

		l: function claim(nodes) {
			div3 = claim_element(nodes, "DIV", { class: true }, false);
			var div3_nodes = children(div3);

			for (let i = 0; i < each_blocks.length; i += 1) {
				each_blocks[i].l(div3_nodes);
			}

			t0 = claim_space(div3_nodes);

			div2 = claim_element(div3_nodes, "DIV", { class: true }, false);
			var div2_nodes = children(div2);

			div0 = claim_element(div2_nodes, "DIV", { class: true }, false);
			var div0_nodes = children(div0);

			t1 = claim_text(div0_nodes, "구독월수");
			div0_nodes.forEach(detach_dev);
			t2 = claim_space(div2_nodes);

			div1 = claim_element(div2_nodes, "DIV", { class: true }, false);
			var div1_nodes = children(div1);

			t3 = claim_text(div1_nodes, "비율");
			div1_nodes.forEach(detach_dev);
			div2_nodes.forEach(detach_dev);
			div3_nodes.forEach(detach_dev);
			this.h();
		},

		h: function hydrate() {
			attr_dev(div0, "class", "w-16 text-center pr-2");
			add_location(div0, file$5, 12, 6, 621);
			attr_dev(div1, "class", "flex-1 text-center");
			add_location(div1, file$5, 13, 6, 673);
			attr_dev(div2, "class", "flex flex-row pt-2 w-full font-bold");
			add_location(div2, file$5, 11, 4, 565);
			attr_dev(div3, "class", "w-full text-xs p-2 overflow-hidden flex flex-col items-start justify-end whitespace-no-wrap");
			add_location(div3, file$5, 0, 0, 0);
		},

		m: function mount(target, anchor) {
			insert_dev(target, div3, anchor);

			for (let i = 0; i < each_blocks.length; i += 1) {
				each_blocks[i].m(div3, null);
			}

			append_dev(div3, t0);
			append_dev(div3, div2);
			append_dev(div2, div0);
			append_dev(div0, t1);
			append_dev(div2, t2);
			append_dev(div2, div1);
			append_dev(div1, t3);
			ctx.div3_binding(div3);
		},

		p: function update(changed, ctx) {
			if (changed.distribution || changed.max_ratio) {
				each_value = ctx.distribution;

				let i;
				for (i = 0; i < each_value.length; i += 1) {
					const child_ctx = get_each_context$3(ctx, each_value, i);

					if (each_blocks[i]) {
						each_blocks[i].p(changed, child_ctx);
					} else {
						each_blocks[i] = create_each_block$3(child_ctx);
						each_blocks[i].c();
						each_blocks[i].m(div3, t0);
					}
				}

				for (; i < each_blocks.length; i += 1) {
					each_blocks[i].d(1);
				}
				each_blocks.length = each_value.length;
			}
		},

		i: noop,
		o: noop,

		d: function destroy(detaching) {
			if (detaching) {
				detach_dev(div3);
			}

			destroy_each(each_blocks, detaching);

			ctx.div3_binding(null);
		}
	};
	dispatch_dev("SvelteRegisterBlock", { block, id: create_fragment$5.name, type: "component", source: "", ctx });
	return block;
}

function instance$5($$self, $$props, $$invalidate) {
	
let { streamer_id } = $$props;
let container;
let WordCloud_;

let last_streamer_id = null;
let distribution = [];
let max_ratio = 0;

onMount(()=>{
  let width = container.getBoundingClientRect().width,
    height = container.getBoundingClientRect().height;
  //container.style.minHeight = width + "px";
});

	const writable_props = ['streamer_id'];
	Object.keys($$props).forEach(key => {
		if (!writable_props.includes(key) && !key.startsWith('$$')) console.warn(`<SubscriberDistribution> was created with unknown prop '${key}'`);
	});

	function div3_binding($$value) {
		binding_callbacks[$$value ? 'unshift' : 'push'](() => {
			$$invalidate('container', container = $$value);
		});
	}

	$$self.$set = $$props => {
		if ('streamer_id' in $$props) $$invalidate('streamer_id', streamer_id = $$props.streamer_id);
	};

	$$self.$capture_state = () => {
		return { streamer_id, container, WordCloud_, last_streamer_id, distribution, max_ratio };
	};

	$$self.$inject_state = $$props => {
		if ('streamer_id' in $$props) $$invalidate('streamer_id', streamer_id = $$props.streamer_id);
		if ('container' in $$props) $$invalidate('container', container = $$props.container);
		if ('WordCloud_' in $$props) WordCloud_ = $$props.WordCloud_;
		if ('last_streamer_id' in $$props) $$invalidate('last_streamer_id', last_streamer_id = $$props.last_streamer_id);
		if ('distribution' in $$props) $$invalidate('distribution', distribution = $$props.distribution);
		if ('max_ratio' in $$props) $$invalidate('max_ratio', max_ratio = $$props.max_ratio);
	};

	$$self.$$.update = ($$dirty = { last_streamer_id: 1, streamer_id: 1 }) => {
		if ($$dirty.last_streamer_id || $$dirty.streamer_id) { if(last_streamer_id != streamer_id) {
      $$invalidate('last_streamer_id', last_streamer_id = streamer_id);
      API.average_subscriber_distribution(streamer_id).then(_distribution => {
        let sum = _distribution.reduce((a,b) => a + b[1], 0);
        _distribution = _distribution.map(x => [x[0], x[1]/sum]);
        $$invalidate('max_ratio', max_ratio = Math.max(..._distribution.map(x => x[1])));
        $$invalidate('distribution', distribution = _distribution.reverse());
      });
    } }
	};

	return {
		streamer_id,
		container,
		distribution,
		max_ratio,
		div3_binding
	};
}

class SubscriberDistribution extends SvelteComponentDev {
	constructor(options) {
		super(options);
		init(this, options, instance$5, create_fragment$5, safe_not_equal, ["streamer_id"]);
		dispatch_dev("SvelteRegisterComponent", { component: this, tagName: "SubscriberDistribution", options, id: create_fragment$5.name });

		const { ctx } = this.$$;
		const props = options.props || {};
		if (ctx.streamer_id === undefined && !('streamer_id' in props)) {
			console.warn("<SubscriberDistribution> was created without expected prop 'streamer_id'");
		}
	}

	get streamer_id() {
		throw new Error("<SubscriberDistribution>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
	}

	set streamer_id(value) {
		throw new Error("<SubscriberDistribution>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
	}
}

/* src/components/StreamCalendarHeatmap.svelte generated by Svelte v3.12.1 */

const file$6 = "src/components/StreamCalendarHeatmap.svelte";

function get_each_context$4(ctx, list, i) {
	const child_ctx = Object.create(ctx);
	child_ctx.i = list[i];
	return child_ctx;
}

function get_each_context_1$1(ctx, list, i) {
	const child_ctx = Object.create(ctx);
	child_ctx.v = list[i];
	child_ctx.i = i;
	return child_ctx;
}

function get_each_context_2$1(ctx, list, i) {
	const child_ctx = Object.create(ctx);
	child_ctx.day = list[i];
	child_ctx.i = i;
	return child_ctx;
}

// (12:8) {#if is_head}
function create_if_block_3$2(ctx) {
	var each_1_anchor;

	let each_value_2 = ["일", "월", "화", "수", "목", "금", "토"];

	let each_blocks = [];

	for (let i = 0; i < 7; i += 1) {
		each_blocks[i] = create_each_block_2$1(get_each_context_2$1(ctx, each_value_2, i));
	}

	const block = {
		c: function create() {
			for (let i = 0; i < 7; i += 1) {
				each_blocks[i].c();
			}

			each_1_anchor = empty();
		},

		l: function claim(nodes) {
			for (let i = 0; i < 7; i += 1) {
				each_blocks[i].l(nodes);
			}

			each_1_anchor = empty();
		},

		m: function mount(target, anchor) {
			for (let i = 0; i < 7; i += 1) {
				each_blocks[i].m(target, anchor);
			}

			insert_dev(target, each_1_anchor, anchor);
		},

		d: function destroy(detaching) {
			destroy_each(each_blocks, detaching);

			if (detaching) {
				detach_dev(each_1_anchor);
			}
		}
	};
	dispatch_dev("SvelteRegisterBlock", { block, id: create_if_block_3$2.name, type: "if", source: "(12:8) {#if is_head}", ctx });
	return block;
}

// (13:8) {#each ["일", "월", "화", "수", "목", "금", "토"] as day, i}
function create_each_block_2$1(ctx) {
	var text_1, t;

	const block = {
		c: function create() {
			text_1 = svg_element("text");
			t = text(ctx.day);
			this.h();
		},

		l: function claim(nodes) {
			text_1 = claim_element(nodes, "text", { x: true, y: true, "text-anchor": true, "alignment-baseline": true, day: true, style: true }, true);
			var text_1_nodes = children(text_1);

			t = claim_text(text_1_nodes, ctx.day);
			text_1_nodes.forEach(detach_dev);
			this.h();
		},

		h: function hydrate() {
			attr_dev(text_1, "x", ctx.i+0.5);
			attr_dev(text_1, "y", "0.5");
			attr_dev(text_1, "text-anchor", "middle");
			attr_dev(text_1, "alignment-baseline", "middle");
			attr_dev(text_1, "day", ctx.day);
			set_style(text_1, "fill", (ctx.i==0 || ctx.i==6? '#FF4560': '#444444'));
			set_style(text_1, "font-size", "0.5px");
			add_location(text_1, file$6, 13, 10, 525);
		},

		m: function mount(target, anchor) {
			insert_dev(target, text_1, anchor);
			append_dev(text_1, t);
		},

		p: noop,

		d: function destroy(detaching) {
			if (detaching) {
				detach_dev(text_1);
			}
		}
	};
	dispatch_dev("SvelteRegisterBlock", { block, id: create_each_block_2$1.name, type: "each", source: "(13:8) {#each [\"일\", \"월\", \"화\", \"수\", \"목\", \"금\", \"토\"] as day, i}", ctx });
	return block;
}

// (26:8) {#each calendar_values as v, i}
function create_each_block_1$1(ctx) {
	var rect, rect_x_value, rect_y_value, rect_fill_value, text_1, t_value = ctx.i+1 + "", t, text_1_x_value, text_1_y_value, dispose;

	function mouseover_handler(...args) {
		return ctx.mouseover_handler(ctx, ...args);
	}

	function mouseout_handler(...args) {
		return ctx.mouseout_handler(ctx, ...args);
	}

	const block = {
		c: function create() {
			rect = svg_element("rect");
			text_1 = svg_element("text");
			t = text(t_value);
			this.h();
		},

		l: function claim(nodes) {
			rect = claim_element(nodes, "rect", { x: true, y: true, width: true, height: true, stroke: true, "stroke-width": true, fill: true }, true);
			var rect_nodes = children(rect);

			rect_nodes.forEach(detach_dev);

			text_1 = claim_element(nodes, "text", { x: true, y: true, "text-anchor": true, "alignment-baseline": true, style: true }, true);
			var text_1_nodes = children(text_1);

			t = claim_text(text_1_nodes, t_value);
			text_1_nodes.forEach(detach_dev);
			this.h();
		},

		h: function hydrate() {
			attr_dev(rect, "x", rect_x_value = (ctx.i+ctx.start_day)%7);
			attr_dev(rect, "y", rect_y_value = ctx.Math.floor((ctx.i+ctx.start_day)/7 + ctx.is_head));
			attr_dev(rect, "width", 1);
			attr_dev(rect, "height", 1);
			attr_dev(rect, "stroke", "#444444");
			attr_dev(rect, "stroke-width", "0.01");
			attr_dev(rect, "fill", rect_fill_value = "rgb(" + r + ", " + g + ", " + b + ", " + (ctx.v? ctx.Math.min(ctx.v/(ctx.max_val*0.5), 1): 0) + ")");
			add_location(rect, file$6, 26, 8, 869);
			attr_dev(text_1, "x", text_1_x_value = (ctx.i+ctx.start_day)%7 + 0.5);
			attr_dev(text_1, "y", text_1_y_value = ctx.Math.floor((ctx.i+ctx.start_day)/7 + ctx.is_head) + 0.5);
			attr_dev(text_1, "text-anchor", "middle");
			attr_dev(text_1, "alignment-baseline", "middle");
			set_style(text_1, "opacity", "0.25");
			set_style(text_1, "fill", ((ctx.i+ctx.start_day)%7==0 || (ctx.i+ctx.start_day)%7==6? '#FF4560': '#444444'));
			set_style(text_1, "font-size", "0.5px");
			set_style(text_1, "font-weight", "bold");
			set_style(text_1, "pointer-events", "none");
			add_location(text_1, file$6, 37, 8, 1313);

			dispose = [
				listen_dev(rect, "mouseover", mouseover_handler),
				listen_dev(rect, "mouseout", mouseout_handler)
			];
		},

		m: function mount(target, anchor) {
			insert_dev(target, rect, anchor);
			insert_dev(target, text_1, anchor);
			append_dev(text_1, t);
		},

		p: function update(changed, new_ctx) {
			ctx = new_ctx;
			if ((changed.start_day) && rect_x_value !== (rect_x_value = (ctx.i+ctx.start_day)%7)) {
				attr_dev(rect, "x", rect_x_value);
			}

			if ((changed.start_day || changed.is_head) && rect_y_value !== (rect_y_value = ctx.Math.floor((ctx.i+ctx.start_day)/7 + ctx.is_head))) {
				attr_dev(rect, "y", rect_y_value);
			}

			if ((changed.calendar_values || changed.max_val) && rect_fill_value !== (rect_fill_value = "rgb(" + r + ", " + g + ", " + b + ", " + (ctx.v? ctx.Math.min(ctx.v/(ctx.max_val*0.5), 1): 0) + ")")) {
				attr_dev(rect, "fill", rect_fill_value);
			}

			if ((changed.start_day) && text_1_x_value !== (text_1_x_value = (ctx.i+ctx.start_day)%7 + 0.5)) {
				attr_dev(text_1, "x", text_1_x_value);
			}

			if ((changed.start_day || changed.is_head) && text_1_y_value !== (text_1_y_value = ctx.Math.floor((ctx.i+ctx.start_day)/7 + ctx.is_head) + 0.5)) {
				attr_dev(text_1, "y", text_1_y_value);
			}

			if (changed.start_day) {
				set_style(text_1, "fill", ((ctx.i+ctx.start_day)%7==0 || (ctx.i+ctx.start_day)%7==6? '#FF4560': '#444444'));
			}
		},

		d: function destroy(detaching) {
			if (detaching) {
				detach_dev(rect);
				detach_dev(text_1);
			}

			run_all(dispose);
		}
	};
	dispatch_dev("SvelteRegisterBlock", { block, id: create_each_block_1$1.name, type: "each", source: "(26:8) {#each calendar_values as v, i}", ctx });
	return block;
}

// (48:8) {#if !is_head}
function create_if_block_1$2(ctx) {
	var each_1_anchor, if_block_anchor;

	let each_value = [0,1,2,3,4,5,6];

	let each_blocks = [];

	for (let i = 0; i < 7; i += 1) {
		each_blocks[i] = create_each_block$4(get_each_context$4(ctx, each_value, i));
	}

	var if_block = (ctx.start_day) && create_if_block_2$2(ctx);

	const block = {
		c: function create() {
			for (let i = 0; i < 7; i += 1) {
				each_blocks[i].c();
			}

			each_1_anchor = empty();
			if (if_block) if_block.c();
			if_block_anchor = empty();
		},

		l: function claim(nodes) {
			for (let i = 0; i < 7; i += 1) {
				each_blocks[i].l(nodes);
			}

			each_1_anchor = empty();
			if (if_block) if_block.l(nodes);
			if_block_anchor = empty();
		},

		m: function mount(target, anchor) {
			for (let i = 0; i < 7; i += 1) {
				each_blocks[i].m(target, anchor);
			}

			insert_dev(target, each_1_anchor, anchor);
			if (if_block) if_block.m(target, anchor);
			insert_dev(target, if_block_anchor, anchor);
		},

		p: function update(changed, ctx) {
			if (changed.start_day || changed.Math || changed.is_head) {
				each_value = [0,1,2,3,4,5,6];

				let i;
				for (i = 0; i < each_value.length; i += 1) {
					const child_ctx = get_each_context$4(ctx, each_value, i);

					if (each_blocks[i]) {
						each_blocks[i].p(changed, child_ctx);
					} else {
						each_blocks[i] = create_each_block$4(child_ctx);
						each_blocks[i].c();
						each_blocks[i].m(each_1_anchor.parentNode, each_1_anchor);
					}
				}

				for (; i < 7; i += 1) {
					each_blocks[i].d(1);
				}
			}

			if (ctx.start_day) {
				if (if_block) {
					if_block.p(changed, ctx);
				} else {
					if_block = create_if_block_2$2(ctx);
					if_block.c();
					if_block.m(if_block_anchor.parentNode, if_block_anchor);
				}
			} else if (if_block) {
				if_block.d(1);
				if_block = null;
			}
		},

		d: function destroy(detaching) {
			destroy_each(each_blocks, detaching);

			if (detaching) {
				detach_dev(each_1_anchor);
			}

			if (if_block) if_block.d(detaching);

			if (detaching) {
				detach_dev(if_block_anchor);
			}
		}
	};
	dispatch_dev("SvelteRegisterBlock", { block, id: create_if_block_1$2.name, type: "if", source: "(48:8) {#if !is_head}", ctx });
	return block;
}

// (49:10) {#each [0,1,2,3,4,5,6] as i}
function create_each_block$4(ctx) {
	var line, line_x__value, line_y__value, line_x__value_1, line_y__value_1;

	const block = {
		c: function create() {
			line = svg_element("line");
			this.h();
		},

		l: function claim(nodes) {
			line = claim_element(nodes, "line", { x1: true, y1: true, x2: true, y2: true, "stroke-width": true, stroke: true }, true);
			var line_nodes = children(line);

			line_nodes.forEach(detach_dev);
			this.h();
		},

		h: function hydrate() {
			attr_dev(line, "x1", line_x__value = (ctx.i + ctx.start_day)%7);
			attr_dev(line, "y1", line_y__value = ctx.Math.floor((ctx.i+ctx.start_day)/7 + ctx.is_head));
			attr_dev(line, "x2", line_x__value_1 = (ctx.i + ctx.start_day)%7+1);
			attr_dev(line, "y2", line_y__value_1 = ctx.Math.floor((ctx.i+ctx.start_day)/7 + ctx.is_head));
			attr_dev(line, "stroke-width", "0.05");
			attr_dev(line, "stroke", "#222222");
			add_location(line, file$6, 49, 12, 1790);
		},

		m: function mount(target, anchor) {
			insert_dev(target, line, anchor);
		},

		p: function update(changed, ctx) {
			if ((changed.start_day) && line_x__value !== (line_x__value = (ctx.i + ctx.start_day)%7)) {
				attr_dev(line, "x1", line_x__value);
			}

			if ((changed.start_day || changed.is_head) && line_y__value !== (line_y__value = ctx.Math.floor((ctx.i+ctx.start_day)/7 + ctx.is_head))) {
				attr_dev(line, "y1", line_y__value);
			}

			if ((changed.start_day) && line_x__value_1 !== (line_x__value_1 = (ctx.i + ctx.start_day)%7+1)) {
				attr_dev(line, "x2", line_x__value_1);
			}

			if ((changed.start_day || changed.is_head) && line_y__value_1 !== (line_y__value_1 = ctx.Math.floor((ctx.i+ctx.start_day)/7 + ctx.is_head))) {
				attr_dev(line, "y2", line_y__value_1);
			}
		},

		d: function destroy(detaching) {
			if (detaching) {
				detach_dev(line);
			}
		}
	};
	dispatch_dev("SvelteRegisterBlock", { block, id: create_each_block$4.name, type: "each", source: "(49:10) {#each [0,1,2,3,4,5,6] as i}", ctx });
	return block;
}

// (59:10) {#if start_day}
function create_if_block_2$2(ctx) {
	var line, line_x__value, line_y__value, line_x__value_1, line_y__value_1;

	const block = {
		c: function create() {
			line = svg_element("line");
			this.h();
		},

		l: function claim(nodes) {
			line = claim_element(nodes, "line", { x1: true, y1: true, x2: true, y2: true, "stroke-width": true, stroke: true }, true);
			var line_nodes = children(line);

			line_nodes.forEach(detach_dev);
			this.h();
		},

		h: function hydrate() {
			attr_dev(line, "x1", line_x__value = ctx.start_day%7);
			attr_dev(line, "y1", line_y__value = ctx.Math.floor((ctx.start_day)/7 + ctx.is_head));
			attr_dev(line, "x2", line_x__value_1 = ctx.start_day%7);
			attr_dev(line, "y2", line_y__value_1 = ctx.Math.floor((ctx.start_day)/7 + ctx.is_head + 1));
			attr_dev(line, "stroke-width", "0.05");
			attr_dev(line, "stroke", "#222222");
			add_location(line, file$6, 59, 12, 2146);
		},

		m: function mount(target, anchor) {
			insert_dev(target, line, anchor);
		},

		p: function update(changed, ctx) {
			if ((changed.start_day) && line_x__value !== (line_x__value = ctx.start_day%7)) {
				attr_dev(line, "x1", line_x__value);
			}

			if ((changed.start_day || changed.is_head) && line_y__value !== (line_y__value = ctx.Math.floor((ctx.start_day)/7 + ctx.is_head))) {
				attr_dev(line, "y1", line_y__value);
			}

			if ((changed.start_day) && line_x__value_1 !== (line_x__value_1 = ctx.start_day%7)) {
				attr_dev(line, "x2", line_x__value_1);
			}

			if ((changed.start_day || changed.is_head) && line_y__value_1 !== (line_y__value_1 = ctx.Math.floor((ctx.start_day)/7 + ctx.is_head + 1))) {
				attr_dev(line, "y2", line_y__value_1);
			}
		},

		d: function destroy(detaching) {
			if (detaching) {
				detach_dev(line);
			}
		}
	};
	dispatch_dev("SvelteRegisterBlock", { block, id: create_if_block_2$2.name, type: "if", source: "(59:10) {#if start_day}", ctx });
	return block;
}

// (72:4) {#if hovered_rect}
function create_if_block$2(ctx) {
	var div, span2, span0, t0, t1, span1, t2_value = ctx.hovered_rect[0]+1 + "", t2, t3, br, t4, span4, span3, t5_value = ctx.hovered_rect[1].toFixed(1) + "", t5, t6;

	const block = {
		c: function create() {
			div = element("div");
			span2 = element("span");
			span0 = element("span");
			t0 = text(ctx.month);
			t1 = text("월");
			span1 = element("span");
			t2 = text(t2_value);
			t3 = text("일");
			br = element("br");
			t4 = space();
			span4 = element("span");
			span3 = element("span");
			t5 = text(t5_value);
			t6 = text("시간 방송함");
			this.h();
		},

		l: function claim(nodes) {
			div = claim_element(nodes, "DIV", { class: true, style: true }, false);
			var div_nodes = children(div);

			span2 = claim_element(div_nodes, "SPAN", {}, false);
			var span2_nodes = children(span2);

			span0 = claim_element(span2_nodes, "SPAN", { class: true }, false);
			var span0_nodes = children(span0);

			t0 = claim_text(span0_nodes, ctx.month);
			span0_nodes.forEach(detach_dev);
			t1 = claim_text(span2_nodes, "월");

			span1 = claim_element(span2_nodes, "SPAN", { class: true }, false);
			var span1_nodes = children(span1);

			t2 = claim_text(span1_nodes, t2_value);
			span1_nodes.forEach(detach_dev);
			t3 = claim_text(span2_nodes, "일");
			span2_nodes.forEach(detach_dev);

			br = claim_element(div_nodes, "BR", {}, false);
			var br_nodes = children(br);

			br_nodes.forEach(detach_dev);
			t4 = claim_space(div_nodes);

			span4 = claim_element(div_nodes, "SPAN", {}, false);
			var span4_nodes = children(span4);

			span3 = claim_element(span4_nodes, "SPAN", { class: true }, false);
			var span3_nodes = children(span3);

			t5 = claim_text(span3_nodes, t5_value);
			span3_nodes.forEach(detach_dev);
			t6 = claim_text(span4_nodes, "시간 방송함");
			span4_nodes.forEach(detach_dev);
			div_nodes.forEach(detach_dev);
			this.h();
		},

		h: function hydrate() {
			attr_dev(span0, "class", "text-sm");
			add_location(span0, file$6, 75, 14, 2703);
			attr_dev(span1, "class", "text-sm");
			add_location(span1, file$6, 75, 51, 2740);
			add_location(span2, file$6, 75, 8, 2697);
			add_location(br, file$6, 75, 107, 2796);
			attr_dev(span3, "class", "text-normal");
			add_location(span3, file$6, 76, 14, 2815);
			add_location(span4, file$6, 76, 8, 2809);
			attr_dev(div, "class", "fixed text-white z-50 bg-gray-900 opacity-75 p-2 text-xs text-center");
			set_style(div, "top", "" + (ctx.m.y + 10) + "px");
			set_style(div, "left", "" + ctx.m.x + "px");
			set_style(div, "transform", "translate(-50%, 0)");
			add_location(div, file$6, 72, 6, 2513);
		},

		m: function mount(target, anchor) {
			insert_dev(target, div, anchor);
			append_dev(div, span2);
			append_dev(span2, span0);
			append_dev(span0, t0);
			append_dev(span2, t1);
			append_dev(span2, span1);
			append_dev(span1, t2);
			append_dev(span2, t3);
			append_dev(div, br);
			append_dev(div, t4);
			append_dev(div, span4);
			append_dev(span4, span3);
			append_dev(span3, t5);
			append_dev(span4, t6);
		},

		p: function update(changed, ctx) {
			if (changed.month) {
				set_data_dev(t0, ctx.month);
			}

			if ((changed.hovered_rect) && t2_value !== (t2_value = ctx.hovered_rect[0]+1 + "")) {
				set_data_dev(t2, t2_value);
			}

			if ((changed.hovered_rect) && t5_value !== (t5_value = ctx.hovered_rect[1].toFixed(1) + "")) {
				set_data_dev(t5, t5_value);
			}

			if (changed.m) {
				set_style(div, "top", "" + (ctx.m.y + 10) + "px");
				set_style(div, "left", "" + ctx.m.x + "px");
			}
		},

		d: function destroy(detaching) {
			if (detaching) {
				detach_dev(div);
			}
		}
	};
	dispatch_dev("SvelteRegisterBlock", { block, id: create_if_block$2.name, type: "if", source: "(72:4) {#if hovered_rect}", ctx });
	return block;
}

function create_fragment$6(ctx) {
	var div2, div0, t0, t1, t2, div1, svg, g_1, if_block0_anchor, each_1_anchor, svg_viewBox_value, t3, div2_class_value, dispose;

	var if_block0 = (ctx.is_head) && create_if_block_3$2(ctx);

	let each_value_1 = ctx.calendar_values;

	let each_blocks = [];

	for (let i = 0; i < each_value_1.length; i += 1) {
		each_blocks[i] = create_each_block_1$1(get_each_context_1$1(ctx, each_value_1, i));
	}

	var if_block1 = (!ctx.is_head) && create_if_block_1$2(ctx);

	var if_block2 = (ctx.hovered_rect) && create_if_block$2(ctx);

	const block = {
		c: function create() {
			div2 = element("div");
			div0 = element("div");
			t0 = text(ctx.month);
			t1 = text("월");
			t2 = space();
			div1 = element("div");
			svg = svg_element("svg");
			g_1 = svg_element("g");
			if (if_block0) if_block0.c();
			if_block0_anchor = empty();

			for (let i = 0; i < each_blocks.length; i += 1) {
				each_blocks[i].c();
			}

			each_1_anchor = empty();
			if (if_block1) if_block1.c();
			t3 = space();
			if (if_block2) if_block2.c();
			this.h();
		},

		l: function claim(nodes) {
			div2 = claim_element(nodes, "DIV", { class: true }, false);
			var div2_nodes = children(div2);

			div0 = claim_element(div2_nodes, "DIV", { class: true }, false);
			var div0_nodes = children(div0);

			t0 = claim_text(div0_nodes, ctx.month);
			t1 = claim_text(div0_nodes, "월");
			div0_nodes.forEach(detach_dev);
			t2 = claim_space(div2_nodes);

			div1 = claim_element(div2_nodes, "DIV", { class: true }, false);
			var div1_nodes = children(div1);

			svg = claim_element(div1_nodes, "svg", { class: true, viewBox: true }, true);
			var svg_nodes = children(svg);

			g_1 = claim_element(svg_nodes, "g", {}, true);
			var g_1_nodes = children(g_1);

			if (if_block0) if_block0.l(g_1_nodes);
			if_block0_anchor = empty();

			for (let i = 0; i < each_blocks.length; i += 1) {
				each_blocks[i].l(g_1_nodes);
			}

			each_1_anchor = empty();
			if (if_block1) if_block1.l(g_1_nodes);
			g_1_nodes.forEach(detach_dev);
			svg_nodes.forEach(detach_dev);
			t3 = claim_space(div1_nodes);
			if (if_block2) if_block2.l(div1_nodes);
			div1_nodes.forEach(detach_dev);
			div2_nodes.forEach(detach_dev);
			this.h();
		},

		h: function hydrate() {
			attr_dev(div0, "class", "text-center text-md w-16");
			add_location(div0, file$6, 1, 2, 89);
			add_location(g_1, file$6, 10, 6, 427);
			attr_dev(svg, "class", "overflow-visible");
			attr_dev(svg, "viewBox", svg_viewBox_value = "0," + (ctx.is_head? 0:1) + ",7," + (ctx.Math.floor((ctx.calendar_values.length + ctx.start_day)/7) + 1 + ctx.is_head - !ctx.is_head));
			add_location(svg, file$6, 5, 4, 191);
			attr_dev(div1, "class", "relative pr-2 flex-1");
			add_location(div1, file$6, 4, 2, 152);
			attr_dev(div2, "class", div2_class_value = "" + ctx.$$props.class + " relative flex flex-row items-center");
			toggle_class(div2, "pt-4", ctx.is_head);
			add_location(div2, file$6, 0, 0, 0);

			dispose = [
				listen_dev(svg, "mouseover", ctx.handleMousemove),
				listen_dev(svg, "mousemove", ctx.handleMousemove)
			];
		},

		m: function mount(target, anchor) {
			insert_dev(target, div2, anchor);
			append_dev(div2, div0);
			append_dev(div0, t0);
			append_dev(div0, t1);
			append_dev(div2, t2);
			append_dev(div2, div1);
			append_dev(div1, svg);
			append_dev(svg, g_1);
			if (if_block0) if_block0.m(g_1, null);
			append_dev(g_1, if_block0_anchor);

			for (let i = 0; i < each_blocks.length; i += 1) {
				each_blocks[i].m(g_1, null);
			}

			append_dev(g_1, each_1_anchor);
			if (if_block1) if_block1.m(g_1, null);
			append_dev(div1, t3);
			if (if_block2) if_block2.m(div1, null);
		},

		p: function update(changed, ctx) {
			if (changed.month) {
				set_data_dev(t0, ctx.month);
			}

			if (ctx.is_head) {
				if (!if_block0) {
					if_block0 = create_if_block_3$2(ctx);
					if_block0.c();
					if_block0.m(g_1, if_block0_anchor);
				}
			} else if (if_block0) {
				if_block0.d(1);
				if_block0 = null;
			}

			if (changed.start_day || changed.Math || changed.is_head || changed.r || changed.g || changed.b || changed.calendar_values || changed.max_val) {
				each_value_1 = ctx.calendar_values;

				let i;
				for (i = 0; i < each_value_1.length; i += 1) {
					const child_ctx = get_each_context_1$1(ctx, each_value_1, i);

					if (each_blocks[i]) {
						each_blocks[i].p(changed, child_ctx);
					} else {
						each_blocks[i] = create_each_block_1$1(child_ctx);
						each_blocks[i].c();
						each_blocks[i].m(g_1, each_1_anchor);
					}
				}

				for (; i < each_blocks.length; i += 1) {
					each_blocks[i].d(1);
				}
				each_blocks.length = each_value_1.length;
			}

			if (!ctx.is_head) {
				if (if_block1) {
					if_block1.p(changed, ctx);
				} else {
					if_block1 = create_if_block_1$2(ctx);
					if_block1.c();
					if_block1.m(g_1, null);
				}
			} else if (if_block1) {
				if_block1.d(1);
				if_block1 = null;
			}

			if ((changed.is_head || changed.calendar_values || changed.start_day) && svg_viewBox_value !== (svg_viewBox_value = "0," + (ctx.is_head? 0:1) + ",7," + (ctx.Math.floor((ctx.calendar_values.length + ctx.start_day)/7) + 1 + ctx.is_head - !ctx.is_head))) {
				attr_dev(svg, "viewBox", svg_viewBox_value);
			}

			if (ctx.hovered_rect) {
				if (if_block2) {
					if_block2.p(changed, ctx);
				} else {
					if_block2 = create_if_block$2(ctx);
					if_block2.c();
					if_block2.m(div1, null);
				}
			} else if (if_block2) {
				if_block2.d(1);
				if_block2 = null;
			}

			if ((changed.$$props) && div2_class_value !== (div2_class_value = "" + ctx.$$props.class + " relative flex flex-row items-center")) {
				attr_dev(div2, "class", div2_class_value);
			}

			if ((changed.$$props || changed.is_head)) {
				toggle_class(div2, "pt-4", ctx.is_head);
			}
		},

		i: noop,
		o: noop,

		d: function destroy(detaching) {
			if (detaching) {
				detach_dev(div2);
			}

			if (if_block0) if_block0.d();

			destroy_each(each_blocks, detaching);

			if (if_block1) if_block1.d();
			if (if_block2) if_block2.d();
			run_all(dispose);
		}
	};
	dispatch_dev("SvelteRegisterBlock", { block, id: create_fragment$6.name, type: "component", source: "", ctx });
	return block;
}

const r = 205;

const g = 168;

const b = 199;

function instance$6($$self, $$props, $$invalidate) {
	
let { streamer, month_offset = 0, is_head = true } = $$props;
let now = new Date(); 
let hovered_rect = null;

let calendar_values = new Array(new Date(now.getFullYear(), now.getMonth()+month_offset+1, 0).getDate()).fill(0);
let last_streamer;
let m = { x: 0, y: 0 };

function handleMousemove(event) {
  $$invalidate('m', m.x = event.clientX, m);
  $$invalidate('m', m.y = event.clientY, m);
}

	const mouseover_handler = ({ i, v }, e) => $$invalidate('hovered_rect', hovered_rect = [i, v, e.target]);

	const mouseout_handler = ({ i }, e) => { if(hovered_rect[0] == i) $$invalidate('hovered_rect', hovered_rect = null);};

	$$self.$set = $$new_props => {
		$$invalidate('$$props', $$props = assign$2(assign$2({}, $$props), $$new_props));
		if ('streamer' in $$new_props) $$invalidate('streamer', streamer = $$new_props.streamer);
		if ('month_offset' in $$new_props) $$invalidate('month_offset', month_offset = $$new_props.month_offset);
		if ('is_head' in $$new_props) $$invalidate('is_head', is_head = $$new_props.is_head);
	};

	$$self.$capture_state = () => {
		return { streamer, month_offset, is_head, now, hovered_rect, calendar_values, last_streamer, m, to, from, month, start_day, max_val };
	};

	$$self.$inject_state = $$new_props => {
		$$invalidate('$$props', $$props = assign$2(assign$2({}, $$props), $$new_props));
		if ('streamer' in $$props) $$invalidate('streamer', streamer = $$new_props.streamer);
		if ('month_offset' in $$props) $$invalidate('month_offset', month_offset = $$new_props.month_offset);
		if ('is_head' in $$props) $$invalidate('is_head', is_head = $$new_props.is_head);
		if ('now' in $$props) $$invalidate('now', now = $$new_props.now);
		if ('hovered_rect' in $$props) $$invalidate('hovered_rect', hovered_rect = $$new_props.hovered_rect);
		if ('calendar_values' in $$props) $$invalidate('calendar_values', calendar_values = $$new_props.calendar_values);
		if ('last_streamer' in $$props) $$invalidate('last_streamer', last_streamer = $$new_props.last_streamer);
		if ('m' in $$props) $$invalidate('m', m = $$new_props.m);
		if ('to' in $$props) $$invalidate('to', to = $$new_props.to);
		if ('from' in $$props) $$invalidate('from', from = $$new_props.from);
		if ('month' in $$props) $$invalidate('month', month = $$new_props.month);
		if ('start_day' in $$props) $$invalidate('start_day', start_day = $$new_props.start_day);
		if ('max_val' in $$props) $$invalidate('max_val', max_val = $$new_props.max_val);
	};

	let to, from, month, start_day, max_val;

	$$self.$$.update = ($$dirty = { now: 1, month_offset: 1, from: 1, last_streamer: 1, streamer: 1, to: 1, calendar_values: 1 }) => {
		if ($$dirty.now || $$dirty.month_offset) { $$invalidate('to', to = new Date(now.getFullYear(), now.getMonth()+1 + month_offset, 1)); }
		if ($$dirty.now || $$dirty.month_offset) { $$invalidate('from', from = new Date(now.getFullYear(), now.getMonth() + month_offset, 1)); }
		if ($$dirty.from) { $$invalidate('month', month = from.getMonth()+1); }
		if ($$dirty.from) { $$invalidate('start_day', start_day = from.getDay()); }
		if ($$dirty.last_streamer || $$dirty.streamer || $$dirty.from || $$dirty.to || $$dirty.now || $$dirty.month_offset) { if(last_streamer != streamer) {
      $$invalidate('last_streamer', last_streamer = streamer);
      API.stream_ranges(streamer.id, from, to).then(stream_ranges => {
        stream_ranges = stream_ranges.filter(r => r[0] >= from.getTime()/1000 && r[0] < to.getTime()/1000);
        if(!stream_ranges)
          return null;
        let values = new Array(new Date(now.getFullYear(), now.getMonth()+month_offset+1, 0).getDate()).fill(0);
        for(let r of stream_ranges) {
          let date = new Date(r[0]*1000);
          values[date.getDate()-1] += (r[1] - r[0])/3600;
        }
        $$invalidate('calendar_values', calendar_values = values);
      });
    } }
		if ($$dirty.calendar_values) { $$invalidate('max_val', max_val = Math.max(...calendar_values)); }
	};

	return {
		streamer,
		month_offset,
		is_head,
		hovered_rect,
		calendar_values,
		m,
		handleMousemove,
		month,
		start_day,
		max_val,
		Math,
		$$props,
		mouseover_handler,
		mouseout_handler,
		$$props: $$props = exclude_internal_props($$props)
	};
}

class StreamCalendarHeatmap extends SvelteComponentDev {
	constructor(options) {
		super(options);
		init(this, options, instance$6, create_fragment$6, safe_not_equal, ["streamer", "month_offset", "is_head"]);
		dispatch_dev("SvelteRegisterComponent", { component: this, tagName: "StreamCalendarHeatmap", options, id: create_fragment$6.name });

		const { ctx } = this.$$;
		const props = options.props || {};
		if (ctx.streamer === undefined && !('streamer' in props)) {
			console.warn("<StreamCalendarHeatmap> was created without expected prop 'streamer'");
		}
	}

	get streamer() {
		throw new Error("<StreamCalendarHeatmap>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
	}

	set streamer(value) {
		throw new Error("<StreamCalendarHeatmap>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
	}

	get month_offset() {
		throw new Error("<StreamCalendarHeatmap>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
	}

	set month_offset(value) {
		throw new Error("<StreamCalendarHeatmap>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
	}

	get is_head() {
		throw new Error("<StreamCalendarHeatmap>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
	}

	set is_head(value) {
		throw new Error("<StreamCalendarHeatmap>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
	}
}

/* src/routes/streamer/[id].svelte generated by Svelte v3.12.1 */

const file$7 = "src/routes/streamer/[id].svelte";

function get_each_context$5(ctx, list, i) {
	const child_ctx = Object.create(ctx);
	child_ctx.days_ago = list[i];
	return child_ctx;
}

function get_each_context_1$2(ctx, list, i) {
	const child_ctx = Object.create(ctx);
	child_ctx.month_offset = list[i];
	child_ctx.i = i;
	return child_ctx;
}

function get_each_context_2$2(ctx, list, i) {
	const child_ctx = Object.create(ctx);
	child_ctx.node = list[i];
	return child_ctx;
}

function get_each_context_3$1(ctx, list, i) {
	const child_ctx = Object.create(ctx);
	child_ctx.range = list[i];
	return child_ctx;
}

// (29:4) <Badges streamer={streamer} class="ml-2">
function create_default_slot_10(ctx) {
	const block = {
		c: noop,
		l: noop,
		m: noop,
		d: noop
	};
	dispatch_dev("SvelteRegisterBlock", { block, id: create_default_slot_10.name, type: "slot", source: "(29:4) <Badges streamer={streamer} class=\"ml-2\">", ctx });
	return block;
}

// (30:4) <GameBadges streamer={streamer} class="flex flex-row pt-2 flex-wrap">
function create_default_slot_9(ctx) {
	const block = {
		c: noop,
		l: noop,
		m: noop,
		d: noop
	};
	dispatch_dev("SvelteRegisterBlock", { block, id: create_default_slot_9.name, type: "slot", source: "(30:4) <GameBadges streamer={streamer} class=\"flex flex-row pt-2 flex-wrap\">", ctx });
	return block;
}

// (92:10) {#each mean_streaming_time_ranges as range}
function create_each_block_3$1(ctx) {
	var span4, span0, t0_value = Math.floor(ctx.range[0]/3600) + "", t0, t1, span1, t2_value = Math.floor(ctx.range[0]%3600/60) + "", t2, t3, span2, t4_value = Math.floor(ctx.range[1]/3600) + "", t4, t5, span3, t6_value = Math.floor(ctx.range[1]%3600/60) + "", t6, t7;

	const block = {
		c: function create() {
			span4 = element("span");
			span0 = element("span");
			t0 = text(t0_value);
			t1 = text("시 \n              ");
			span1 = element("span");
			t2 = text(t2_value);
			t3 = text("분 ~ \n              ");
			span2 = element("span");
			t4 = text(t4_value);
			t5 = text("시 \n              ");
			span3 = element("span");
			t6 = text(t6_value);
			t7 = text("분");
			this.h();
		},

		l: function claim(nodes) {
			span4 = claim_element(nodes, "SPAN", { class: true }, false);
			var span4_nodes = children(span4);

			span0 = claim_element(span4_nodes, "SPAN", { class: true }, false);
			var span0_nodes = children(span0);

			t0 = claim_text(span0_nodes, t0_value);
			span0_nodes.forEach(detach_dev);
			t1 = claim_text(span4_nodes, "시 \n              ");

			span1 = claim_element(span4_nodes, "SPAN", { class: true }, false);
			var span1_nodes = children(span1);

			t2 = claim_text(span1_nodes, t2_value);
			span1_nodes.forEach(detach_dev);
			t3 = claim_text(span4_nodes, "분 ~ \n              ");

			span2 = claim_element(span4_nodes, "SPAN", { class: true }, false);
			var span2_nodes = children(span2);

			t4 = claim_text(span2_nodes, t4_value);
			span2_nodes.forEach(detach_dev);
			t5 = claim_text(span4_nodes, "시 \n              ");

			span3 = claim_element(span4_nodes, "SPAN", { class: true }, false);
			var span3_nodes = children(span3);

			t6 = claim_text(span3_nodes, t6_value);
			span3_nodes.forEach(detach_dev);
			t7 = claim_text(span4_nodes, "분");
			span4_nodes.forEach(detach_dev);
			this.h();
		},

		h: function hydrate() {
			attr_dev(span0, "class", "font-bold text-base");
			add_location(span0, file$7, 93, 14, 3970);
			attr_dev(span1, "class", "font-bold text-base");
			add_location(span1, file$7, 94, 14, 4055);
			attr_dev(span2, "class", "font-bold text-base");
			add_location(span2, file$7, 95, 14, 4145);
			attr_dev(span3, "class", "font-bold text-base");
			add_location(span3, file$7, 96, 14, 4230);
			attr_dev(span4, "class", "pr-2");
			add_location(span4, file$7, 92, 12, 3936);
		},

		m: function mount(target, anchor) {
			insert_dev(target, span4, anchor);
			append_dev(span4, span0);
			append_dev(span0, t0);
			append_dev(span4, t1);
			append_dev(span4, span1);
			append_dev(span1, t2);
			append_dev(span4, t3);
			append_dev(span4, span2);
			append_dev(span2, t4);
			append_dev(span4, t5);
			append_dev(span4, span3);
			append_dev(span3, t6);
			append_dev(span4, t7);
		},

		p: function update(changed, ctx) {
			if ((changed.mean_streaming_time_ranges) && t0_value !== (t0_value = Math.floor(ctx.range[0]/3600) + "")) {
				set_data_dev(t0, t0_value);
			}

			if ((changed.mean_streaming_time_ranges) && t2_value !== (t2_value = Math.floor(ctx.range[0]%3600/60) + "")) {
				set_data_dev(t2, t2_value);
			}

			if ((changed.mean_streaming_time_ranges) && t4_value !== (t4_value = Math.floor(ctx.range[1]/3600) + "")) {
				set_data_dev(t4, t4_value);
			}

			if ((changed.mean_streaming_time_ranges) && t6_value !== (t6_value = Math.floor(ctx.range[1]%3600/60) + "")) {
				set_data_dev(t6, t6_value);
			}
		},

		d: function destroy(detaching) {
			if (detaching) {
				detach_dev(span4);
			}
		}
	};
	dispatch_dev("SvelteRegisterBlock", { block, id: create_each_block_3$1.name, type: "each", source: "(92:10) {#each mean_streaming_time_ranges as range}", ctx });
	return block;
}

// (116:8) <h2 slot="title" class="inline-block md:font-base font-2xl">
function create_title_slot_7(ctx) {
	var h2, t;

	const block = {
		c: function create() {
			h2 = element("h2");
			t = text("시청자 유사도");
			this.h();
		},

		l: function claim(nodes) {
			h2 = claim_element(nodes, "H2", { slot: true, class: true }, false);
			var h2_nodes = children(h2);

			t = claim_text(h2_nodes, "시청자 유사도");
			h2_nodes.forEach(detach_dev);
			this.h();
		},

		h: function hydrate() {
			attr_dev(h2, "slot", "title");
			attr_dev(h2, "class", "inline-block md:font-base font-2xl");
			add_location(h2, file$7, 115, 8, 4914);
		},

		m: function mount(target, anchor) {
			insert_dev(target, h2, anchor);
			append_dev(h2, t);
		},

		d: function destroy(detaching) {
			if (detaching) {
				detach_dev(h2);
			}
		}
	};
	dispatch_dev("SvelteRegisterBlock", { block, id: create_title_slot_7.name, type: "slot", source: "(116:8) <h2 slot=\"title\" class=\"inline-block md:font-base font-2xl\">", ctx });
	return block;
}

// (129:16) {#if node.similarity}
function create_if_block_1$3(ctx) {
	var span, t0, t1_value = (ctx.node.similarity*100).toFixed(1) + "", t1, t2;

	const block = {
		c: function create() {
			span = element("span");
			t0 = text("(");
			t1 = text(t1_value);
			t2 = text("%)");
			this.h();
		},

		l: function claim(nodes) {
			span = claim_element(nodes, "SPAN", { class: true }, false);
			var span_nodes = children(span);

			t0 = claim_text(span_nodes, "(");
			t1 = claim_text(span_nodes, t1_value);
			t2 = claim_text(span_nodes, "%)");
			span_nodes.forEach(detach_dev);
			this.h();
		},

		h: function hydrate() {
			attr_dev(span, "class", "text-xs text-gray-600 tracking-wider");
			add_location(span, file$7, 128, 38, 5846);
		},

		m: function mount(target, anchor) {
			insert_dev(target, span, anchor);
			append_dev(span, t0);
			append_dev(span, t1);
			append_dev(span, t2);
		},

		p: function update(changed, ctx) {
			if ((changed.node) && t1_value !== (t1_value = (ctx.node.similarity*100).toFixed(1) + "")) {
				set_data_dev(t1, t1_value);
			}
		},

		d: function destroy(detaching) {
			if (detaching) {
				detach_dev(span);
			}
		}
	};
	dispatch_dev("SvelteRegisterBlock", { block, id: create_if_block_1$3.name, type: "if", source: "(129:16) {#if node.similarity}", ctx });
	return block;
}

// (118:10) <Network              {streamer}             nodes={[...similar_streamers_top10, streamer]}              edges={similar_streamers_top10.map(s => ({from: streamer.id, to: s.id, length: Math.max(0.1, 1-(s.similarity*s.similarity*10)), strength: s.similarity*s.similarity*100}))}             class="w-full p-6"             onrendered={()=>{0 && load_timeline()}}             let:node={node}>
function create_default_slot_8(ctx) {
	var a, img, img_src_value, t0, div, span, t1_value = ctx.node.name + "", t1, t2, a_href_value;

	var if_block = (ctx.node.similarity) && create_if_block_1$3(ctx);

	const block = {
		c: function create() {
			a = element("a");
			img = element("img");
			t0 = space();
			div = element("div");
			span = element("span");
			t1 = text(t1_value);
			t2 = space();
			if (if_block) if_block.c();
			this.h();
		},

		l: function claim(nodes) {
			a = claim_element(nodes, "A", { class: true, href: true }, false);
			var a_nodes = children(a);

			img = claim_element(a_nodes, "IMG", { class: true, src: true, art: true }, false);
			var img_nodes = children(img);

			img_nodes.forEach(detach_dev);
			t0 = claim_space(a_nodes);

			div = claim_element(a_nodes, "DIV", { class: true }, false);
			var div_nodes = children(div);

			span = claim_element(div_nodes, "SPAN", { class: true }, false);
			var span_nodes = children(span);

			t1 = claim_text(span_nodes, t1_value);
			span_nodes.forEach(detach_dev);
			t2 = claim_space(div_nodes);
			if (if_block) if_block.l(div_nodes);
			div_nodes.forEach(detach_dev);
			a_nodes.forEach(detach_dev);
			this.h();
		},

		h: function hydrate() {
			attr_dev(img, "class", "w-10 h-10 md:w-16 md:h-16 rounded-full bg-white border border-gray-600");
			attr_dev(img, "src", img_src_value = ctx.node.profile_image_url);
			attr_dev(img, "art", "프로필 사진");
			add_location(img, file$7, 125, 14, 5541);
			attr_dev(span, "class", "md:text-sm text-xs");
			add_location(span, file$7, 127, 16, 5754);
			attr_dev(div, "class", "flex flex-col flex-wrap items-center");
			add_location(div, file$7, 126, 14, 5686);
			attr_dev(a, "class", "flex flex-col w-10 md:w-16 flex-wrap items-center");
			attr_dev(a, "href", a_href_value = "/streamer/" + ctx.node.id);
			add_location(a, file$7, 124, 12, 5438);
		},

		m: function mount(target, anchor) {
			insert_dev(target, a, anchor);
			append_dev(a, img);
			append_dev(a, t0);
			append_dev(a, div);
			append_dev(div, span);
			append_dev(span, t1);
			append_dev(div, t2);
			if (if_block) if_block.m(div, null);
		},

		p: function update(changed, ctx) {
			if ((changed.node) && img_src_value !== (img_src_value = ctx.node.profile_image_url)) {
				attr_dev(img, "src", img_src_value);
			}

			if ((changed.node) && t1_value !== (t1_value = ctx.node.name + "")) {
				set_data_dev(t1, t1_value);
			}

			if (ctx.node.similarity) {
				if (if_block) {
					if_block.p(changed, ctx);
				} else {
					if_block = create_if_block_1$3(ctx);
					if_block.c();
					if_block.m(div, null);
				}
			} else if (if_block) {
				if_block.d(1);
				if_block = null;
			}

			if ((changed.node) && a_href_value !== (a_href_value = "/streamer/" + ctx.node.id)) {
				attr_dev(a, "href", a_href_value);
			}
		},

		d: function destroy(detaching) {
			if (detaching) {
				detach_dev(a);
			}

			if (if_block) if_block.d();
		}
	};
	dispatch_dev("SvelteRegisterBlock", { block, id: create_default_slot_8.name, type: "slot", source: "(118:10) <Network              {streamer}             nodes={[...similar_streamers_top10, streamer]}              edges={similar_streamers_top10.map(s => ({from: streamer.id, to: s.id, length: Math.max(0.1, 1-(s.similarity*s.similarity*10)), strength: s.similarity*s.similarity*100}))}             class=\"w-full p-6\"             onrendered={()=>{0 && load_timeline()}}             let:node={node}>", ctx });
	return block;
}

// (139:16) {#if node.similarity}
function create_if_block$3(ctx) {
	var span, t0, t1_value = (ctx.node.similarity*100).toFixed(1) + "", t1, t2;

	const block = {
		c: function create() {
			span = element("span");
			t0 = text("(");
			t1 = text(t1_value);
			t2 = text("%)");
			this.h();
		},

		l: function claim(nodes) {
			span = claim_element(nodes, "SPAN", { class: true }, false);
			var span_nodes = children(span);

			t0 = claim_text(span_nodes, "(");
			t1 = claim_text(span_nodes, t1_value);
			t2 = claim_text(span_nodes, "%)");
			span_nodes.forEach(detach_dev);
			this.h();
		},

		h: function hydrate() {
			attr_dev(span, "class", "text-xs text-gray-600 tracking-wider");
			add_location(span, file$7, 138, 38, 6536);
		},

		m: function mount(target, anchor) {
			insert_dev(target, span, anchor);
			append_dev(span, t0);
			append_dev(span, t1);
			append_dev(span, t2);
		},

		p: function update(changed, ctx) {
			if ((changed.similar_streamers) && t1_value !== (t1_value = (ctx.node.similarity*100).toFixed(1) + "")) {
				set_data_dev(t1, t1_value);
			}
		},

		d: function destroy(detaching) {
			if (detaching) {
				detach_dev(span);
			}
		}
	};
	dispatch_dev("SvelteRegisterBlock", { block, id: create_if_block$3.name, type: "if", source: "(139:16) {#if node.similarity}", ctx });
	return block;
}

// (134:10) {#each similar_streamers.slice(10) as node}
function create_each_block_2$2(ctx) {
	var a, img, img_src_value, t0, div, span, t1_value = ctx.node.name + "", t1, t2, t3, a_href_value;

	var if_block = (ctx.node.similarity) && create_if_block$3(ctx);

	const block = {
		c: function create() {
			a = element("a");
			img = element("img");
			t0 = space();
			div = element("div");
			span = element("span");
			t1 = text(t1_value);
			t2 = space();
			if (if_block) if_block.c();
			t3 = space();
			this.h();
		},

		l: function claim(nodes) {
			a = claim_element(nodes, "A", { class: true, href: true }, false);
			var a_nodes = children(a);

			img = claim_element(a_nodes, "IMG", { class: true, src: true, art: true }, false);
			var img_nodes = children(img);

			img_nodes.forEach(detach_dev);
			t0 = claim_space(a_nodes);

			div = claim_element(a_nodes, "DIV", { class: true }, false);
			var div_nodes = children(div);

			span = claim_element(div_nodes, "SPAN", { class: true }, false);
			var span_nodes = children(span);

			t1 = claim_text(span_nodes, t1_value);
			span_nodes.forEach(detach_dev);
			t2 = claim_space(div_nodes);
			if (if_block) if_block.l(div_nodes);
			div_nodes.forEach(detach_dev);
			t3 = claim_space(a_nodes);
			a_nodes.forEach(detach_dev);
			this.h();
		},

		h: function hydrate() {
			attr_dev(img, "class", "w-10 h-10 md:w-16 md:h-16 rounded-full bg-white border border-gray-600");
			attr_dev(img, "src", img_src_value = ctx.node.profile_image_url);
			attr_dev(img, "art", "프로필 사진");
			add_location(img, file$7, 135, 14, 6231);
			attr_dev(span, "class", "md:text-sm text-xs");
			add_location(span, file$7, 137, 16, 6444);
			attr_dev(div, "class", "flex flex-col flex-wrap items-center");
			add_location(div, file$7, 136, 14, 6376);
			attr_dev(a, "class", "flex flex-col w-1/5 flex-wrap items-center my-2");
			attr_dev(a, "href", a_href_value = "/streamer/" + ctx.node.id);
			add_location(a, file$7, 134, 12, 6130);
		},

		m: function mount(target, anchor) {
			insert_dev(target, a, anchor);
			append_dev(a, img);
			append_dev(a, t0);
			append_dev(a, div);
			append_dev(div, span);
			append_dev(span, t1);
			append_dev(div, t2);
			if (if_block) if_block.m(div, null);
			append_dev(a, t3);
		},

		p: function update(changed, ctx) {
			if ((changed.similar_streamers) && img_src_value !== (img_src_value = ctx.node.profile_image_url)) {
				attr_dev(img, "src", img_src_value);
			}

			if ((changed.similar_streamers) && t1_value !== (t1_value = ctx.node.name + "")) {
				set_data_dev(t1, t1_value);
			}

			if (ctx.node.similarity) {
				if (if_block) {
					if_block.p(changed, ctx);
				} else {
					if_block = create_if_block$3(ctx);
					if_block.c();
					if_block.m(div, null);
				}
			} else if (if_block) {
				if_block.d(1);
				if_block = null;
			}

			if ((changed.similar_streamers) && a_href_value !== (a_href_value = "/streamer/" + ctx.node.id)) {
				attr_dev(a, "href", a_href_value);
			}
		},

		d: function destroy(detaching) {
			if (detaching) {
				detach_dev(a);
			}

			if (if_block) if_block.d();
		}
	};
	dispatch_dev("SvelteRegisterBlock", { block, id: create_each_block_2$2.name, type: "each", source: "(134:10) {#each similar_streamers.slice(10) as node}", ctx });
	return block;
}

// (117:8) <div slot="contents" class="">
function create_contents_slot_7(ctx) {
	var div0, t0, div1, t1, button, t2, current, dispose;

	var network = new Network({
		props: {
		streamer: ctx.streamer,
		nodes: [...ctx.similar_streamers_top10, ctx.streamer],
		edges: ctx.similar_streamers_top10.map(ctx.func),
		class: "w-full p-6",
		onrendered: ctx.func_1,
		$$slots: {
		default: [create_default_slot_8, ({ node: node }) => ({ node })]
	},
		$$scope: { ctx }
	},
		$$inline: true
	});

	let each_value_2 = ctx.similar_streamers.slice(10);

	let each_blocks = [];

	for (let i = 0; i < each_value_2.length; i += 1) {
		each_blocks[i] = create_each_block_2$2(get_each_context_2$2(ctx, each_value_2, i));
	}

	const block = {
		c: function create() {
			div0 = element("div");
			network.$$.fragment.c();
			t0 = space();
			div1 = element("div");

			for (let i = 0; i < each_blocks.length; i += 1) {
				each_blocks[i].c();
			}

			t1 = space();
			button = element("button");
			t2 = text("더 보기");
			this.h();
		},

		l: function claim(nodes) {
			div0 = claim_element(nodes, "DIV", { slot: true, class: true }, false);
			var div0_nodes = children(div0);

			network.$$.fragment.l(div0_nodes);
			t0 = claim_space(div0_nodes);

			div1 = claim_element(div0_nodes, "DIV", { class: true }, false);
			var div1_nodes = children(div1);

			for (let i = 0; i < each_blocks.length; i += 1) {
				each_blocks[i].l(div1_nodes);
			}

			div1_nodes.forEach(detach_dev);
			t1 = claim_space(div0_nodes);

			button = claim_element(div0_nodes, "BUTTON", { class: true }, false);
			var button_nodes = children(button);

			t2 = claim_text(button_nodes, "더 보기");
			button_nodes.forEach(detach_dev);
			div0_nodes.forEach(detach_dev);
			this.h();
		},

		h: function hydrate() {
			attr_dev(div1, "class", "flex flex-row flex-wrap w-full");
			add_location(div1, file$7, 132, 10, 6019);
			attr_dev(button, "class", "w-full py-3 border-t");
			add_location(button, file$7, 143, 10, 6723);
			attr_dev(div0, "slot", "contents");
			attr_dev(div0, "class", "");
			add_location(div0, file$7, 116, 8, 4996);
			dispose = listen_dev(button, "click", ctx.click_handler);
		},

		m: function mount(target, anchor) {
			insert_dev(target, div0, anchor);
			mount_component(network, div0, null);
			append_dev(div0, t0);
			append_dev(div0, div1);

			for (let i = 0; i < each_blocks.length; i += 1) {
				each_blocks[i].m(div1, null);
			}

			append_dev(div0, t1);
			append_dev(div0, button);
			append_dev(button, t2);
			current = true;
		},

		p: function update(changed, ctx) {
			var network_changes = {};
			if (changed.streamer) network_changes.streamer = ctx.streamer;
			if (changed.similar_streamers_top10 || changed.streamer) network_changes.nodes = [...ctx.similar_streamers_top10, ctx.streamer];
			if (changed.similar_streamers_top10 || changed.streamer) network_changes.edges = ctx.similar_streamers_top10.map(ctx.func);
			if (changed.$$scope) network_changes.$$scope = { changed, ctx };
			network.$set(network_changes);

			if (changed.similar_streamers) {
				each_value_2 = ctx.similar_streamers.slice(10);

				let i;
				for (i = 0; i < each_value_2.length; i += 1) {
					const child_ctx = get_each_context_2$2(ctx, each_value_2, i);

					if (each_blocks[i]) {
						each_blocks[i].p(changed, child_ctx);
					} else {
						each_blocks[i] = create_each_block_2$2(child_ctx);
						each_blocks[i].c();
						each_blocks[i].m(div1, null);
					}
				}

				for (; i < each_blocks.length; i += 1) {
					each_blocks[i].d(1);
				}
				each_blocks.length = each_value_2.length;
			}
		},

		i: function intro(local) {
			if (current) return;
			transition_in(network.$$.fragment, local);

			current = true;
		},

		o: function outro(local) {
			transition_out(network.$$.fragment, local);
			current = false;
		},

		d: function destroy(detaching) {
			if (detaching) {
				detach_dev(div0);
			}

			destroy_component(network);

			destroy_each(each_blocks, detaching);

			dispose();
		}
	};
	dispatch_dev("SvelteRegisterBlock", { block, id: create_contents_slot_7.name, type: "slot", source: "(117:8) <div slot=\"contents\" class=\"\">", ctx });
	return block;
}

// (115:6) <Panel class="w-full">
function create_default_slot_7(ctx) {
	var t;

	const block = {
		c: function create() {
			t = space();
		},

		l: function claim(nodes) {
			t = claim_space(nodes);
		},

		m: function mount(target, anchor) {
			insert_dev(target, t, anchor);
		},

		p: noop,
		i: noop,
		o: noop,

		d: function destroy(detaching) {
			if (detaching) {
				detach_dev(t);
			}
		}
	};
	dispatch_dev("SvelteRegisterBlock", { block, id: create_default_slot_7.name, type: "slot", source: "(115:6) <Panel class=\"w-full\">", ctx });
	return block;
}

// (152:12) <h2 slot="title" class="inline-block md:font-base font-2xl">
function create_title_slot_6(ctx) {
	var h2, t;

	const block = {
		c: function create() {
			h2 = element("h2");
			t = text("방송 달력");
			this.h();
		},

		l: function claim(nodes) {
			h2 = claim_element(nodes, "H2", { slot: true, class: true }, false);
			var h2_nodes = children(h2);

			t = claim_text(h2_nodes, "방송 달력");
			h2_nodes.forEach(detach_dev);
			this.h();
		},

		h: function hydrate() {
			attr_dev(h2, "slot", "title");
			attr_dev(h2, "class", "inline-block md:font-base font-2xl");
			add_location(h2, file$7, 151, 12, 7110);
		},

		m: function mount(target, anchor) {
			insert_dev(target, h2, anchor);
			append_dev(h2, t);
		},

		d: function destroy(detaching) {
			if (detaching) {
				detach_dev(h2);
			}
		}
	};
	dispatch_dev("SvelteRegisterBlock", { block, id: create_title_slot_6.name, type: "slot", source: "(152:12) <h2 slot=\"title\" class=\"inline-block md:font-base font-2xl\">", ctx });
	return block;
}

// (154:14) {#each month_offsets as month_offset, i (month_offset)}
function create_each_block_1$2(key_1, ctx) {
	var div, current;

	var streamcalendarheatmap = new StreamCalendarHeatmap({
		props: {
		class: "w-full h-full",
		month_offset: ctx.month_offset,
		is_head: ctx.i==0,
		streamer: ctx.streamer
	},
		$$inline: true
	});

	const block = {
		key: key_1,

		first: null,

		c: function create() {
			div = element("div");
			streamcalendarheatmap.$$.fragment.c();
			this.h();
		},

		l: function claim(nodes) {
			div = claim_element(nodes, "DIV", { class: true }, false);
			var div_nodes = children(div);

			streamcalendarheatmap.$$.fragment.l(div_nodes);
			div_nodes.forEach(detach_dev);
			this.h();
		},

		h: function hydrate() {
			attr_dev(div, "class", "pr-4");
			add_location(div, file$7, 154, 14, 7315);
			this.first = div;
		},

		m: function mount(target, anchor) {
			insert_dev(target, div, anchor);
			mount_component(streamcalendarheatmap, div, null);
			current = true;
		},

		p: function update(changed, ctx) {
			var streamcalendarheatmap_changes = {};
			if (changed.month_offsets) streamcalendarheatmap_changes.month_offset = ctx.month_offset;
			if (changed.month_offsets) streamcalendarheatmap_changes.is_head = ctx.i==0;
			if (changed.streamer) streamcalendarheatmap_changes.streamer = ctx.streamer;
			streamcalendarheatmap.$set(streamcalendarheatmap_changes);
		},

		i: function intro(local) {
			if (current) return;
			transition_in(streamcalendarheatmap.$$.fragment, local);

			current = true;
		},

		o: function outro(local) {
			transition_out(streamcalendarheatmap.$$.fragment, local);
			current = false;
		},

		d: function destroy(detaching) {
			if (detaching) {
				detach_dev(div);
			}

			destroy_component(streamcalendarheatmap);
		}
	};
	dispatch_dev("SvelteRegisterBlock", { block, id: create_each_block_1$2.name, type: "each", source: "(154:14) {#each month_offsets as month_offset, i (month_offset)}", ctx });
	return block;
}

// (153:12) <div slot="contents" class="h-full">
function create_contents_slot_6(ctx) {
	var div, each_blocks = [], each_1_lookup = new Map(), t0, button, t1, current, dispose;

	let each_value_1 = ctx.month_offsets;

	const get_key = ctx => ctx.month_offset;

	for (let i = 0; i < each_value_1.length; i += 1) {
		let child_ctx = get_each_context_1$2(ctx, each_value_1, i);
		let key = get_key(child_ctx);
		each_1_lookup.set(key, each_blocks[i] = create_each_block_1$2(key, child_ctx));
	}

	const block = {
		c: function create() {
			div = element("div");

			for (let i = 0; i < each_blocks.length; i += 1) {
				each_blocks[i].c();
			}

			t0 = space();
			button = element("button");
			t1 = text("더 보기");
			this.h();
		},

		l: function claim(nodes) {
			div = claim_element(nodes, "DIV", { slot: true, class: true }, false);
			var div_nodes = children(div);

			for (let i = 0; i < each_blocks.length; i += 1) {
				each_blocks[i].l(div_nodes);
			}

			t0 = claim_space(div_nodes);

			button = claim_element(div_nodes, "BUTTON", { class: true }, false);
			var button_nodes = children(button);

			t1 = claim_text(button_nodes, "더 보기");
			button_nodes.forEach(detach_dev);
			div_nodes.forEach(detach_dev);
			this.h();
		},

		h: function hydrate() {
			attr_dev(button, "class", "w-full py-3 border-t mt-2");
			add_location(button, file$7, 162, 14, 7579);
			attr_dev(div, "slot", "contents");
			attr_dev(div, "class", "h-full");
			add_location(div, file$7, 152, 12, 7194);
			dispose = listen_dev(button, "click", ctx.click_handler_1);
		},

		m: function mount(target, anchor) {
			insert_dev(target, div, anchor);

			for (let i = 0; i < each_blocks.length; i += 1) {
				each_blocks[i].m(div, null);
			}

			append_dev(div, t0);
			append_dev(div, button);
			append_dev(button, t1);
			current = true;
		},

		p: function update(changed, ctx) {
			const each_value_1 = ctx.month_offsets;

			group_outros();
			each_blocks = update_keyed_each(each_blocks, changed, get_key, 1, ctx, each_value_1, each_1_lookup, div, outro_and_destroy_block, create_each_block_1$2, t0, get_each_context_1$2);
			check_outros();
		},

		i: function intro(local) {
			if (current) return;
			for (let i = 0; i < each_value_1.length; i += 1) {
				transition_in(each_blocks[i]);
			}

			current = true;
		},

		o: function outro(local) {
			for (let i = 0; i < each_blocks.length; i += 1) {
				transition_out(each_blocks[i]);
			}

			current = false;
		},

		d: function destroy(detaching) {
			if (detaching) {
				detach_dev(div);
			}

			for (let i = 0; i < each_blocks.length; i += 1) {
				each_blocks[i].d();
			}

			dispose();
		}
	};
	dispatch_dev("SvelteRegisterBlock", { block, id: create_contents_slot_6.name, type: "slot", source: "(153:12) <div slot=\"contents\" class=\"h-full\">", ctx });
	return block;
}

// (151:10) <Panel class="w-full">
function create_default_slot_6(ctx) {
	var t;

	const block = {
		c: function create() {
			t = space();
		},

		l: function claim(nodes) {
			t = claim_space(nodes);
		},

		m: function mount(target, anchor) {
			insert_dev(target, t, anchor);
		},

		p: noop,
		i: noop,
		o: noop,

		d: function destroy(detaching) {
			if (detaching) {
				detach_dev(t);
			}
		}
	};
	dispatch_dev("SvelteRegisterBlock", { block, id: create_default_slot_6.name, type: "slot", source: "(151:10) <Panel class=\"w-full\">", ctx });
	return block;
}

// (167:12) <h2 slot="title" class="inline-block md:font-base font-2xl">
function create_title_slot_5(ctx) {
	var h2, t;

	const block = {
		c: function create() {
			h2 = element("h2");
			t = text("방송 주기");
			this.h();
		},

		l: function claim(nodes) {
			h2 = claim_element(nodes, "H2", { slot: true, class: true }, false);
			var h2_nodes = children(h2);

			t = claim_text(h2_nodes, "방송 주기");
			h2_nodes.forEach(detach_dev);
			this.h();
		},

		h: function hydrate() {
			attr_dev(h2, "slot", "title");
			attr_dev(h2, "class", "inline-block md:font-base font-2xl");
			add_location(h2, file$7, 166, 12, 7789);
		},

		m: function mount(target, anchor) {
			insert_dev(target, h2, anchor);
			append_dev(h2, t);
		},

		d: function destroy(detaching) {
			if (detaching) {
				detach_dev(h2);
			}
		}
	};
	dispatch_dev("SvelteRegisterBlock", { block, id: create_title_slot_5.name, type: "slot", source: "(167:12) <h2 slot=\"title\" class=\"inline-block md:font-base font-2xl\">", ctx });
	return block;
}

// (168:12) <div slot="contents" class="h-full">
function create_contents_slot_5(ctx) {
	var div, updating_mean_streaming_time_ranges, updating_mean_streaming_time_reliability, updating_streaming_time_ranges_variance, updating_total_streaming_time_ratio, updating_streaming_start_time, updating_streaming_start_time_std, updating_streaming_end_time, updating_streaming_end_time_std, current;

	function streamspiral_mean_streaming_time_ranges_binding(value) {
		ctx.streamspiral_mean_streaming_time_ranges_binding.call(null, value);
		updating_mean_streaming_time_ranges = true;
		add_flush_callback(() => updating_mean_streaming_time_ranges = false);
	}

	function streamspiral_mean_streaming_time_reliability_binding(value_1) {
		ctx.streamspiral_mean_streaming_time_reliability_binding.call(null, value_1);
		updating_mean_streaming_time_reliability = true;
		add_flush_callback(() => updating_mean_streaming_time_reliability = false);
	}

	function streamspiral_streaming_time_ranges_variance_binding(value_2) {
		ctx.streamspiral_streaming_time_ranges_variance_binding.call(null, value_2);
		updating_streaming_time_ranges_variance = true;
		add_flush_callback(() => updating_streaming_time_ranges_variance = false);
	}

	function streamspiral_total_streaming_time_ratio_binding(value_3) {
		ctx.streamspiral_total_streaming_time_ratio_binding.call(null, value_3);
		updating_total_streaming_time_ratio = true;
		add_flush_callback(() => updating_total_streaming_time_ratio = false);
	}

	function streamspiral_streaming_start_time_binding(value_4) {
		ctx.streamspiral_streaming_start_time_binding.call(null, value_4);
		updating_streaming_start_time = true;
		add_flush_callback(() => updating_streaming_start_time = false);
	}

	function streamspiral_streaming_start_time_std_binding(value_5) {
		ctx.streamspiral_streaming_start_time_std_binding.call(null, value_5);
		updating_streaming_start_time_std = true;
		add_flush_callback(() => updating_streaming_start_time_std = false);
	}

	function streamspiral_streaming_end_time_binding(value_6) {
		ctx.streamspiral_streaming_end_time_binding.call(null, value_6);
		updating_streaming_end_time = true;
		add_flush_callback(() => updating_streaming_end_time = false);
	}

	function streamspiral_streaming_end_time_std_binding(value_7) {
		ctx.streamspiral_streaming_end_time_std_binding.call(null, value_7);
		updating_streaming_end_time_std = true;
		add_flush_callback(() => updating_streaming_end_time_std = false);
	}

	let streamspiral_props = {
		class: "w-full h-full -mt-4",
		streamer: ctx.streamer
	};
	if (ctx.mean_streaming_time_ranges !== void 0) {
		streamspiral_props.mean_streaming_time_ranges = ctx.mean_streaming_time_ranges;
	}
	if (ctx.mean_streaming_time_reliability !== void 0) {
		streamspiral_props.mean_streaming_time_reliability = ctx.mean_streaming_time_reliability;
	}
	if (ctx.streaming_time_ranges_variance !== void 0) {
		streamspiral_props.streaming_time_ranges_variance = ctx.streaming_time_ranges_variance;
	}
	if (ctx.total_streaming_time_ratio !== void 0) {
		streamspiral_props.total_streaming_time_ratio = ctx.total_streaming_time_ratio;
	}
	if (ctx.streaming_start_time !== void 0) {
		streamspiral_props.streaming_start_time = ctx.streaming_start_time;
	}
	if (ctx.streaming_start_time_std !== void 0) {
		streamspiral_props.streaming_start_time_std = ctx.streaming_start_time_std;
	}
	if (ctx.streaming_end_time !== void 0) {
		streamspiral_props.streaming_end_time = ctx.streaming_end_time;
	}
	if (ctx.streaming_end_time_std !== void 0) {
		streamspiral_props.streaming_end_time_std = ctx.streaming_end_time_std;
	}
	var streamspiral = new StreamSpiral({
		props: streamspiral_props,
		$$inline: true
	});

	binding_callbacks.push(() => bind(streamspiral, 'mean_streaming_time_ranges', streamspiral_mean_streaming_time_ranges_binding));
	binding_callbacks.push(() => bind(streamspiral, 'mean_streaming_time_reliability', streamspiral_mean_streaming_time_reliability_binding));
	binding_callbacks.push(() => bind(streamspiral, 'streaming_time_ranges_variance', streamspiral_streaming_time_ranges_variance_binding));
	binding_callbacks.push(() => bind(streamspiral, 'total_streaming_time_ratio', streamspiral_total_streaming_time_ratio_binding));
	binding_callbacks.push(() => bind(streamspiral, 'streaming_start_time', streamspiral_streaming_start_time_binding));
	binding_callbacks.push(() => bind(streamspiral, 'streaming_start_time_std', streamspiral_streaming_start_time_std_binding));
	binding_callbacks.push(() => bind(streamspiral, 'streaming_end_time', streamspiral_streaming_end_time_binding));
	binding_callbacks.push(() => bind(streamspiral, 'streaming_end_time_std', streamspiral_streaming_end_time_std_binding));

	const block = {
		c: function create() {
			div = element("div");
			streamspiral.$$.fragment.c();
			this.h();
		},

		l: function claim(nodes) {
			div = claim_element(nodes, "DIV", { slot: true, class: true }, false);
			var div_nodes = children(div);

			streamspiral.$$.fragment.l(div_nodes);
			div_nodes.forEach(detach_dev);
			this.h();
		},

		h: function hydrate() {
			attr_dev(div, "slot", "contents");
			attr_dev(div, "class", "h-full");
			add_location(div, file$7, 167, 12, 7874);
		},

		m: function mount(target, anchor) {
			insert_dev(target, div, anchor);
			mount_component(streamspiral, div, null);
			current = true;
		},

		p: function update(changed, ctx) {
			var streamspiral_changes = {};
			if (changed.streamer) streamspiral_changes.streamer = ctx.streamer;
			if (!updating_mean_streaming_time_ranges && changed.mean_streaming_time_ranges) {
				streamspiral_changes.mean_streaming_time_ranges = ctx.mean_streaming_time_ranges;
			}
			if (!updating_mean_streaming_time_reliability && changed.mean_streaming_time_reliability) {
				streamspiral_changes.mean_streaming_time_reliability = ctx.mean_streaming_time_reliability;
			}
			if (!updating_streaming_time_ranges_variance && changed.streaming_time_ranges_variance) {
				streamspiral_changes.streaming_time_ranges_variance = ctx.streaming_time_ranges_variance;
			}
			if (!updating_total_streaming_time_ratio && changed.total_streaming_time_ratio) {
				streamspiral_changes.total_streaming_time_ratio = ctx.total_streaming_time_ratio;
			}
			if (!updating_streaming_start_time && changed.streaming_start_time) {
				streamspiral_changes.streaming_start_time = ctx.streaming_start_time;
			}
			if (!updating_streaming_start_time_std && changed.streaming_start_time_std) {
				streamspiral_changes.streaming_start_time_std = ctx.streaming_start_time_std;
			}
			if (!updating_streaming_end_time && changed.streaming_end_time) {
				streamspiral_changes.streaming_end_time = ctx.streaming_end_time;
			}
			if (!updating_streaming_end_time_std && changed.streaming_end_time_std) {
				streamspiral_changes.streaming_end_time_std = ctx.streaming_end_time_std;
			}
			streamspiral.$set(streamspiral_changes);
		},

		i: function intro(local) {
			if (current) return;
			transition_in(streamspiral.$$.fragment, local);

			current = true;
		},

		o: function outro(local) {
			transition_out(streamspiral.$$.fragment, local);
			current = false;
		},

		d: function destroy(detaching) {
			if (detaching) {
				detach_dev(div);
			}

			destroy_component(streamspiral);
		}
	};
	dispatch_dev("SvelteRegisterBlock", { block, id: create_contents_slot_5.name, type: "slot", source: "(168:12) <div slot=\"contents\" class=\"h-full\">", ctx });
	return block;
}

// (166:10) <Panel class="w-full">
function create_default_slot_5(ctx) {
	var t;

	const block = {
		c: function create() {
			t = space();
		},

		l: function claim(nodes) {
			t = claim_space(nodes);
		},

		m: function mount(target, anchor) {
			insert_dev(target, t, anchor);
		},

		p: noop,
		i: noop,
		o: noop,

		d: function destroy(detaching) {
			if (detaching) {
				detach_dev(t);
			}
		}
	};
	dispatch_dev("SvelteRegisterBlock", { block, id: create_default_slot_5.name, type: "slot", source: "(166:10) <Panel class=\"w-full\">", ctx });
	return block;
}

// (185:12) <h2 slot="title" class="inline-block">
function create_title_slot_4(ctx) {
	var h2, t;

	const block = {
		c: function create() {
			h2 = element("h2");
			t = text("구독자 비율");
			this.h();
		},

		l: function claim(nodes) {
			h2 = claim_element(nodes, "H2", { slot: true, class: true }, false);
			var h2_nodes = children(h2);

			t = claim_text(h2_nodes, "구독자 비율");
			h2_nodes.forEach(detach_dev);
			this.h();
		},

		h: function hydrate() {
			attr_dev(h2, "slot", "title");
			attr_dev(h2, "class", "inline-block");
			add_location(h2, file$7, 184, 12, 8767);
		},

		m: function mount(target, anchor) {
			insert_dev(target, h2, anchor);
			append_dev(h2, t);
		},

		d: function destroy(detaching) {
			if (detaching) {
				detach_dev(h2);
			}
		}
	};
	dispatch_dev("SvelteRegisterBlock", { block, id: create_title_slot_4.name, type: "slot", source: "(185:12) <h2 slot=\"title\" class=\"inline-block\">", ctx });
	return block;
}

// (186:12) <div slot="contents" class="w-full p-2 h-full">
function create_contents_slot_4(ctx) {
	var div, current;

	var subscriberdistribution = new SubscriberDistribution({
		props: { streamer_id: ctx.streamer.id },
		$$inline: true
	});

	const block = {
		c: function create() {
			div = element("div");
			subscriberdistribution.$$.fragment.c();
			this.h();
		},

		l: function claim(nodes) {
			div = claim_element(nodes, "DIV", { slot: true, class: true }, false);
			var div_nodes = children(div);

			subscriberdistribution.$$.fragment.l(div_nodes);
			div_nodes.forEach(detach_dev);
			this.h();
		},

		h: function hydrate() {
			attr_dev(div, "slot", "contents");
			attr_dev(div, "class", "w-full p-2 h-full");
			add_location(div, file$7, 185, 12, 8831);
		},

		m: function mount(target, anchor) {
			insert_dev(target, div, anchor);
			mount_component(subscriberdistribution, div, null);
			current = true;
		},

		p: function update(changed, ctx) {
			var subscriberdistribution_changes = {};
			if (changed.streamer) subscriberdistribution_changes.streamer_id = ctx.streamer.id;
			subscriberdistribution.$set(subscriberdistribution_changes);
		},

		i: function intro(local) {
			if (current) return;
			transition_in(subscriberdistribution.$$.fragment, local);

			current = true;
		},

		o: function outro(local) {
			transition_out(subscriberdistribution.$$.fragment, local);
			current = false;
		},

		d: function destroy(detaching) {
			if (detaching) {
				detach_dev(div);
			}

			destroy_component(subscriberdistribution);
		}
	};
	dispatch_dev("SvelteRegisterBlock", { block, id: create_contents_slot_4.name, type: "slot", source: "(186:12) <div slot=\"contents\" class=\"w-full p-2 h-full\">", ctx });
	return block;
}

// (184:10) <Panel class="w-full">
function create_default_slot_4(ctx) {
	var t;

	const block = {
		c: function create() {
			t = space();
		},

		l: function claim(nodes) {
			t = claim_space(nodes);
		},

		m: function mount(target, anchor) {
			insert_dev(target, t, anchor);
		},

		p: noop,
		i: noop,
		o: noop,

		d: function destroy(detaching) {
			if (detaching) {
				detach_dev(t);
			}
		}
	};
	dispatch_dev("SvelteRegisterBlock", { block, id: create_default_slot_4.name, type: "slot", source: "(184:10) <Panel class=\"w-full\">", ctx });
	return block;
}

// (191:12) <h2 slot="title" class="inline-block">
function create_title_slot_3(ctx) {
	var h2, t;

	const block = {
		c: function create() {
			h2 = element("h2");
			t = text("구독자 채팅 비율");
			this.h();
		},

		l: function claim(nodes) {
			h2 = claim_element(nodes, "H2", { slot: true, class: true }, false);
			var h2_nodes = children(h2);

			t = claim_text(h2_nodes, "구독자 채팅 비율");
			h2_nodes.forEach(detach_dev);
			this.h();
		},

		h: function hydrate() {
			attr_dev(h2, "slot", "title");
			attr_dev(h2, "class", "inline-block");
			add_location(h2, file$7, 190, 12, 9028);
		},

		m: function mount(target, anchor) {
			insert_dev(target, h2, anchor);
			append_dev(h2, t);
		},

		d: function destroy(detaching) {
			if (detaching) {
				detach_dev(h2);
			}
		}
	};
	dispatch_dev("SvelteRegisterBlock", { block, id: create_title_slot_3.name, type: "slot", source: "(191:12) <h2 slot=\"title\" class=\"inline-block\">", ctx });
	return block;
}

// (192:12) <div slot="contents" class="md:w-full w-48 p-4 h-full m-auto">
function create_contents_slot_3(ctx) {
	var div0, div2, div1, t0_value = (ctx.streamer.average_subscriber_chat_ratio*100).toFixed(0) + "", t0, t1;

	const block = {
		c: function create() {
			div0 = element("div");
			div2 = element("div");
			div1 = element("div");
			t0 = text(t0_value);
			t1 = text("%");
			this.h();
		},

		l: function claim(nodes) {
			div0 = claim_element(nodes, "DIV", { slot: true, class: true }, false);
			var div0_nodes = children(div0);

			div2 = claim_element(div0_nodes, "DIV", { class: true, style: true }, false);
			var div2_nodes = children(div2);

			div1 = claim_element(div2_nodes, "DIV", { class: true, style: true }, false);
			var div1_nodes = children(div1);

			t0 = claim_text(div1_nodes, t0_value);
			t1 = claim_text(div1_nodes, "%");
			div1_nodes.forEach(detach_dev);
			div2_nodes.forEach(detach_dev);
			div0_nodes.forEach(detach_dev);
			this.h();
		},

		h: function hydrate() {
			attr_dev(div1, "class", "absolute text-3xl font-bold text-primary-600");
			set_style(div1, "left", "50%");
			set_style(div1, "top", "50%");
			set_style(div1, "transform", "translate(-50%, -50%)");
			add_location(div1, file$7, 195, 16, 9489);
			attr_dev(div2, "class", "rounded-full inline-block w-full");
			set_style(div2, "background", "radial-gradient(white 60%, transparent 61%), conic-gradient(#CDA8C7 0% " + ctx.streamer.average_subscriber_chat_ratio*100 + "%, #e2e8f0 " + ctx.streamer.average_subscriber_chat_ratio*100 + "% 100%)");
			set_style(div2, "padding-bottom", "100%");
			add_location(div2, file$7, 192, 14, 9172);
			attr_dev(div0, "slot", "contents");
			attr_dev(div0, "class", "md:w-full w-48 p-4 h-full m-auto");
			add_location(div0, file$7, 191, 12, 9095);
		},

		m: function mount(target, anchor) {
			insert_dev(target, div0, anchor);
			append_dev(div0, div2);
			append_dev(div2, div1);
			append_dev(div1, t0);
			append_dev(div1, t1);
		},

		p: function update(changed, ctx) {
			if ((changed.streamer) && t0_value !== (t0_value = (ctx.streamer.average_subscriber_chat_ratio*100).toFixed(0) + "")) {
				set_data_dev(t0, t0_value);
			}

			if (changed.streamer) {
				set_style(div2, "background", "radial-gradient(white 60%, transparent 61%), conic-gradient(#CDA8C7 0% " + ctx.streamer.average_subscriber_chat_ratio*100 + "%, #e2e8f0 " + ctx.streamer.average_subscriber_chat_ratio*100 + "% 100%)");
			}
		},

		d: function destroy(detaching) {
			if (detaching) {
				detach_dev(div0);
			}
		}
	};
	dispatch_dev("SvelteRegisterBlock", { block, id: create_contents_slot_3.name, type: "slot", source: "(192:12) <div slot=\"contents\" class=\"md:w-full w-48 p-4 h-full m-auto\">", ctx });
	return block;
}

// (190:10) <Panel class="w-full">
function create_default_slot_3(ctx) {
	var t;

	const block = {
		c: function create() {
			t = space();
		},

		l: function claim(nodes) {
			t = claim_space(nodes);
		},

		m: function mount(target, anchor) {
			insert_dev(target, t, anchor);
		},

		p: noop,

		d: function destroy(detaching) {
			if (detaching) {
				detach_dev(t);
			}
		}
	};
	dispatch_dev("SvelteRegisterBlock", { block, id: create_default_slot_3.name, type: "slot", source: "(190:10) <Panel class=\"w-full\">", ctx });
	return block;
}

// (207:8) <h2 slot="title" class="inline-block">
function create_title_slot_2(ctx) {
	var h2, t;

	const block = {
		c: function create() {
			h2 = element("h2");
			t = text("최근 방송 채팅 키워드");
			this.h();
		},

		l: function claim(nodes) {
			h2 = claim_element(nodes, "H2", { slot: true, class: true }, false);
			var h2_nodes = children(h2);

			t = claim_text(h2_nodes, "최근 방송 채팅 키워드");
			h2_nodes.forEach(detach_dev);
			this.h();
		},

		h: function hydrate() {
			attr_dev(h2, "slot", "title");
			attr_dev(h2, "class", "inline-block");
			add_location(h2, file$7, 206, 8, 9903);
		},

		m: function mount(target, anchor) {
			insert_dev(target, h2, anchor);
			append_dev(h2, t);
		},

		d: function destroy(detaching) {
			if (detaching) {
				detach_dev(h2);
			}
		}
	};
	dispatch_dev("SvelteRegisterBlock", { block, id: create_title_slot_2.name, type: "slot", source: "(207:8) <h2 slot=\"title\" class=\"inline-block\">", ctx });
	return block;
}

// (208:8) <div slot="contents" class="w-full p-2 h-full">
function create_contents_slot_2(ctx) {
	var div, current;

	var keywordcloud = new KeywordCloud({
		props: { streamer_id: ctx.streamer.id },
		$$inline: true
	});

	const block = {
		c: function create() {
			div = element("div");
			keywordcloud.$$.fragment.c();
			this.h();
		},

		l: function claim(nodes) {
			div = claim_element(nodes, "DIV", { slot: true, class: true }, false);
			var div_nodes = children(div);

			keywordcloud.$$.fragment.l(div_nodes);
			div_nodes.forEach(detach_dev);
			this.h();
		},

		h: function hydrate() {
			attr_dev(div, "slot", "contents");
			attr_dev(div, "class", "w-full p-2 h-full");
			add_location(div, file$7, 207, 8, 9969);
		},

		m: function mount(target, anchor) {
			insert_dev(target, div, anchor);
			mount_component(keywordcloud, div, null);
			current = true;
		},

		p: function update(changed, ctx) {
			var keywordcloud_changes = {};
			if (changed.streamer) keywordcloud_changes.streamer_id = ctx.streamer.id;
			keywordcloud.$set(keywordcloud_changes);
		},

		i: function intro(local) {
			if (current) return;
			transition_in(keywordcloud.$$.fragment, local);

			current = true;
		},

		o: function outro(local) {
			transition_out(keywordcloud.$$.fragment, local);
			current = false;
		},

		d: function destroy(detaching) {
			if (detaching) {
				detach_dev(div);
			}

			destroy_component(keywordcloud);
		}
	};
	dispatch_dev("SvelteRegisterBlock", { block, id: create_contents_slot_2.name, type: "slot", source: "(208:8) <div slot=\"contents\" class=\"w-full p-2 h-full\">", ctx });
	return block;
}

// (206:6) <Panel class="w-full">
function create_default_slot_2(ctx) {
	var t;

	const block = {
		c: function create() {
			t = space();
		},

		l: function claim(nodes) {
			t = claim_space(nodes);
		},

		m: function mount(target, anchor) {
			insert_dev(target, t, anchor);
		},

		p: noop,
		i: noop,
		o: noop,

		d: function destroy(detaching) {
			if (detaching) {
				detach_dev(t);
			}
		}
	};
	dispatch_dev("SvelteRegisterBlock", { block, id: create_default_slot_2.name, type: "slot", source: "(206:6) <Panel class=\"w-full\">", ctx });
	return block;
}

// (213:8) <h2 slot="title" class="inline-block">
function create_title_slot_1(ctx) {
	var h2, t;

	const block = {
		c: function create() {
			h2 = element("h2");
			t = text("댓글");
			this.h();
		},

		l: function claim(nodes) {
			h2 = claim_element(nodes, "H2", { slot: true, class: true }, false);
			var h2_nodes = children(h2);

			t = claim_text(h2_nodes, "댓글");
			h2_nodes.forEach(detach_dev);
			this.h();
		},

		h: function hydrate() {
			attr_dev(h2, "slot", "title");
			attr_dev(h2, "class", "inline-block");
			add_location(h2, file$7, 212, 8, 10136);
		},

		m: function mount(target, anchor) {
			insert_dev(target, h2, anchor);
			append_dev(h2, t);
		},

		d: function destroy(detaching) {
			if (detaching) {
				detach_dev(h2);
			}
		}
	};
	dispatch_dev("SvelteRegisterBlock", { block, id: create_title_slot_1.name, type: "slot", source: "(213:8) <h2 slot=\"title\" class=\"inline-block\">", ctx });
	return block;
}

// (214:8) <div slot="contents" class="w-full p-2">
function create_contents_slot_1(ctx) {
	var div, current;

	var comments = new Comments({
		props: { streamer_id: ctx.streamer.id },
		$$inline: true
	});

	const block = {
		c: function create() {
			div = element("div");
			comments.$$.fragment.c();
			this.h();
		},

		l: function claim(nodes) {
			div = claim_element(nodes, "DIV", { slot: true, class: true }, false);
			var div_nodes = children(div);

			comments.$$.fragment.l(div_nodes);
			div_nodes.forEach(detach_dev);
			this.h();
		},

		h: function hydrate() {
			attr_dev(div, "slot", "contents");
			attr_dev(div, "class", "w-full p-2");
			add_location(div, file$7, 213, 8, 10192);
		},

		m: function mount(target, anchor) {
			insert_dev(target, div, anchor);
			mount_component(comments, div, null);
			current = true;
		},

		p: function update(changed, ctx) {
			var comments_changes = {};
			if (changed.streamer) comments_changes.streamer_id = ctx.streamer.id;
			comments.$set(comments_changes);
		},

		i: function intro(local) {
			if (current) return;
			transition_in(comments.$$.fragment, local);

			current = true;
		},

		o: function outro(local) {
			transition_out(comments.$$.fragment, local);
			current = false;
		},

		d: function destroy(detaching) {
			if (detaching) {
				detach_dev(div);
			}

			destroy_component(comments);
		}
	};
	dispatch_dev("SvelteRegisterBlock", { block, id: create_contents_slot_1.name, type: "slot", source: "(214:8) <div slot=\"contents\" class=\"w-full p-2\">", ctx });
	return block;
}

// (212:6) <Panel class="w-full">
function create_default_slot_1(ctx) {
	var t;

	const block = {
		c: function create() {
			t = space();
		},

		l: function claim(nodes) {
			t = claim_space(nodes);
		},

		m: function mount(target, anchor) {
			insert_dev(target, t, anchor);
		},

		p: noop,
		i: noop,
		o: noop,

		d: function destroy(detaching) {
			if (detaching) {
				detach_dev(t);
			}
		}
	};
	dispatch_dev("SvelteRegisterBlock", { block, id: create_default_slot_1.name, type: "slot", source: "(212:6) <Panel class=\"w-full\">", ctx });
	return block;
}

// (222:4) <h2 slot="title" class="inline-block md:font-base font-2xl">
function create_title_slot(ctx) {
	var h2, t;

	const block = {
		c: function create() {
			h2 = element("h2");
			t = text("방송 타임라인");
			this.h();
		},

		l: function claim(nodes) {
			h2 = claim_element(nodes, "H2", { slot: true, class: true }, false);
			var h2_nodes = children(h2);

			t = claim_text(h2_nodes, "방송 타임라인");
			h2_nodes.forEach(detach_dev);
			this.h();
		},

		h: function hydrate() {
			attr_dev(h2, "slot", "title");
			attr_dev(h2, "class", "inline-block md:font-base font-2xl");
			add_location(h2, file$7, 221, 4, 10361);
		},

		m: function mount(target, anchor) {
			insert_dev(target, h2, anchor);
			append_dev(h2, t);
		},

		d: function destroy(detaching) {
			if (detaching) {
				detach_dev(h2);
			}
		}
	};
	dispatch_dev("SvelteRegisterBlock", { block, id: create_title_slot.name, type: "slot", source: "(222:4) <h2 slot=\"title\" class=\"inline-block md:font-base font-2xl\">", ctx });
	return block;
}

// (226:6) {:else}
function create_else_block$2(ctx) {
	var div;

	const block = {
		c: function create() {
			div = element("div");
			this.h();
		},

		l: function claim(nodes) {
			div = claim_element(nodes, "DIV", { class: true }, false);
			var div_nodes = children(div);

			div_nodes.forEach(detach_dev);
			this.h();
		},

		h: function hydrate() {
			attr_dev(div, "class", "w-full h-64 spinner");
			add_location(div, file$7, 226, 8, 10637);
		},

		m: function mount(target, anchor) {
			insert_dev(target, div, anchor);
		},

		d: function destroy(detaching) {
			if (detaching) {
				detach_dev(div);
			}
		}
	};
	dispatch_dev("SvelteRegisterBlock", { block, id: create_else_block$2.name, type: "else", source: "(226:6) {:else}", ctx });
	return block;
}

// (224:6) {#each timelines as days_ago ("" + streamer.id + "-" + days_ago)}
function create_each_block$5(key_1, ctx) {
	var first, current;

	var timeline2 = new Timeline2({
		props: {
		streamer: ctx.streamer,
		days_ago: ctx.days_ago,
		header: ctx.days_ago===0
	},
		$$inline: true
	});

	const block = {
		key: key_1,

		first: null,

		c: function create() {
			first = empty();
			timeline2.$$.fragment.c();
			this.h();
		},

		l: function claim(nodes) {
			first = empty();
			timeline2.$$.fragment.l(nodes);
			this.h();
		},

		h: function hydrate() {
			this.first = first;
		},

		m: function mount(target, anchor) {
			insert_dev(target, first, anchor);
			mount_component(timeline2, target, anchor);
			current = true;
		},

		p: function update(changed, ctx) {
			var timeline2_changes = {};
			if (changed.streamer) timeline2_changes.streamer = ctx.streamer;
			if (changed.timelines) timeline2_changes.days_ago = ctx.days_ago;
			if (changed.timelines) timeline2_changes.header = ctx.days_ago===0;
			timeline2.$set(timeline2_changes);
		},

		i: function intro(local) {
			if (current) return;
			transition_in(timeline2.$$.fragment, local);

			current = true;
		},

		o: function outro(local) {
			transition_out(timeline2.$$.fragment, local);
			current = false;
		},

		d: function destroy(detaching) {
			if (detaching) {
				detach_dev(first);
			}

			destroy_component(timeline2, detaching);
		}
	};
	dispatch_dev("SvelteRegisterBlock", { block, id: create_each_block$5.name, type: "each", source: "(224:6) {#each timelines as days_ago (\"\" + streamer.id + \"-\" + days_ago)}", ctx });
	return block;
}

// (223:4) <div slot="contents" class="w-full">
function create_contents_slot(ctx) {
	var div, each_blocks = [], each_1_lookup = new Map(), t0, button, t1, current, dispose;

	let each_value = ctx.timelines;

	const get_key = ctx => "" + ctx.streamer.id + "-" + ctx.days_ago;

	for (let i = 0; i < each_value.length; i += 1) {
		let child_ctx = get_each_context$5(ctx, each_value, i);
		let key = get_key(child_ctx);
		each_1_lookup.set(key, each_blocks[i] = create_each_block$5(key, child_ctx));
	}

	let each_1_else = null;

	if (!each_value.length) {
		each_1_else = create_else_block$2(ctx);
		each_1_else.c();
	}

	const block = {
		c: function create() {
			div = element("div");

			for (let i = 0; i < each_blocks.length; i += 1) {
				each_blocks[i].c();
			}

			t0 = space();
			button = element("button");
			t1 = text("더 보기");
			this.h();
		},

		l: function claim(nodes) {
			div = claim_element(nodes, "DIV", { slot: true, class: true }, false);
			var div_nodes = children(div);

			for (let i = 0; i < each_blocks.length; i += 1) {
				each_blocks[i].l(div_nodes);
			}

			t0 = claim_space(div_nodes);

			button = claim_element(div_nodes, "BUTTON", { class: true }, false);
			var button_nodes = children(button);

			t1 = claim_text(button_nodes, "더 보기");
			button_nodes.forEach(detach_dev);
			div_nodes.forEach(detach_dev);
			this.h();
		},

		h: function hydrate() {
			attr_dev(button, "class", "w-full border-t p-2");
			add_location(button, file$7, 228, 6, 10693);
			attr_dev(div, "slot", "contents");
			attr_dev(div, "class", "w-full");
			add_location(div, file$7, 222, 4, 10440);
			dispose = listen_dev(button, "click", ctx.load_timeline);
		},

		m: function mount(target, anchor) {
			insert_dev(target, div, anchor);

			for (let i = 0; i < each_blocks.length; i += 1) {
				each_blocks[i].m(div, null);
			}

			if (each_1_else) {
				each_1_else.m(div, null);
			}

			append_dev(div, t0);
			append_dev(div, button);
			append_dev(button, t1);
			current = true;
		},

		p: function update(changed, ctx) {
			const each_value = ctx.timelines;

			group_outros();
			each_blocks = update_keyed_each(each_blocks, changed, get_key, 1, ctx, each_value, each_1_lookup, div, outro_and_destroy_block, create_each_block$5, t0, get_each_context$5);
			check_outros();

			if (each_value.length) {
				if (each_1_else) {
					each_1_else.d(1);
					each_1_else = null;
				}
			} else if (!each_1_else) {
				each_1_else = create_else_block$2(ctx);
				each_1_else.c();
				each_1_else.m(div, t0);
			}
		},

		i: function intro(local) {
			if (current) return;
			for (let i = 0; i < each_value.length; i += 1) {
				transition_in(each_blocks[i]);
			}

			current = true;
		},

		o: function outro(local) {
			for (let i = 0; i < each_blocks.length; i += 1) {
				transition_out(each_blocks[i]);
			}

			current = false;
		},

		d: function destroy(detaching) {
			if (detaching) {
				detach_dev(div);
			}

			for (let i = 0; i < each_blocks.length; i += 1) {
				each_blocks[i].d();
			}

			if (each_1_else) each_1_else.d();

			dispose();
		}
	};
	dispatch_dev("SvelteRegisterBlock", { block, id: create_contents_slot.name, type: "slot", source: "(223:4) <div slot=\"contents\" class=\"w-full\">", ctx });
	return block;
}

// (221:2) <Panel class="w-full">
function create_default_slot(ctx) {
	var t;

	const block = {
		c: function create() {
			t = space();
		},

		l: function claim(nodes) {
			t = claim_space(nodes);
		},

		m: function mount(target, anchor) {
			insert_dev(target, t, anchor);
		},

		p: noop,
		i: noop,
		o: noop,

		d: function destroy(detaching) {
			if (detaching) {
				detach_dev(t);
			}
		}
	};
	dispatch_dev("SvelteRegisterBlock", { block, id: create_default_slot.name, type: "slot", source: "(221:2) <Panel class=\"w-full\">", ctx });
	return block;
}

function create_fragment$7(ctx) {
	var title_value, t0, div0, t1, div4, img, img_src_value, t2, div1, h1, t3_value = ctx.streamer.name + "", t3, t4, t5, t6, div2, t7_value = ctx.streamer.description + "", t7, t8, div3, a0, svg0, path0, t9, span0, t10, a0_href_value, t11, a1, svg1, path1, t12, span1, t13, a1_href_value, t14, table, tr0, td0, t15, td1, t16, t17, td2, span2, t18_value = ctx.streamer.average_viewer_count.toLocaleString('ko', {useGrouping:true}) + "", t18, t19, t20, tr1, td3, t21, td4, t22, t23, td5, span3, t24_value = ctx.streamer.follower_count.toLocaleString('ko', {useGrouping:true}) + "", t24, t25, t26, tr2, td6, t27, td7, t28, t29, td8, t30, span4, t31_value = (ctx.streamer.streaming_hours_per_week || 0).toFixed(1) + "", t31, t32, t33, tr3, td9, t34, td10, t35, t36, td11, span11, span5, t37_value = Math.floor(ctx.streaming_start_time/3600) + "", t37, t38, span6, t39_value = Math.floor(ctx.streaming_start_time%3600/60) + "", t39, t40, span7, t41, t42_value = (ctx.streaming_start_time_std/3600).toFixed(1) + "", t42, t43, t44, span8, t45_value = Math.floor(ctx.streaming_end_time/3600) + "", t45, t46, span9, t47_value = Math.floor(ctx.streaming_end_time%3600/60) + "", t47, t48, span10, t49, t50_value = (ctx.streaming_end_time_std/3600).toFixed(1) + "", t50, t51, t52, tr4, td12, t53, td13, t54, t55, td14, t56, span12, t57, t58_value = (ctx.mean_streaming_time_reliability * 100).toFixed(0) + "", t58, t59, t60, div11, div10, div8, t61, div7, div5, t62, t63, div6, t64, t65, div9, t66, t67, current;

	document.title = title_value = " 트수gg - " + ctx.streamer.name + " ";

	var badges = new Badges({
		props: {
		streamer: ctx.streamer,
		class: "ml-2",
		$$slots: { default: [create_default_slot_10] },
		$$scope: { ctx }
	},
		$$inline: true
	});

	var gamebadges = new GameBadges({
		props: {
		streamer: ctx.streamer,
		class: "flex flex-row pt-2 flex-wrap",
		$$slots: { default: [create_default_slot_9] },
		$$scope: { ctx }
	},
		$$inline: true
	});

	let each_value_3 = ctx.mean_streaming_time_ranges;

	let each_blocks = [];

	for (let i = 0; i < each_value_3.length; i += 1) {
		each_blocks[i] = create_each_block_3$1(get_each_context_3$1(ctx, each_value_3, i));
	}

	var panel0 = new Panel({
		props: {
		class: "w-full",
		$$slots: {
		default: [create_default_slot_7],
		contents: [create_contents_slot_7],
		title: [create_title_slot_7]
	},
		$$scope: { ctx }
	},
		$$inline: true
	});

	var panel1 = new Panel({
		props: {
		class: "w-full",
		$$slots: {
		default: [create_default_slot_6],
		contents: [create_contents_slot_6],
		title: [create_title_slot_6]
	},
		$$scope: { ctx }
	},
		$$inline: true
	});

	var panel2 = new Panel({
		props: {
		class: "w-full",
		$$slots: {
		default: [create_default_slot_5],
		contents: [create_contents_slot_5],
		title: [create_title_slot_5]
	},
		$$scope: { ctx }
	},
		$$inline: true
	});

	var panel3 = new Panel({
		props: {
		class: "w-full",
		$$slots: {
		default: [create_default_slot_4],
		contents: [create_contents_slot_4],
		title: [create_title_slot_4]
	},
		$$scope: { ctx }
	},
		$$inline: true
	});

	var panel4 = new Panel({
		props: {
		class: "w-full",
		$$slots: {
		default: [create_default_slot_3],
		contents: [create_contents_slot_3],
		title: [create_title_slot_3]
	},
		$$scope: { ctx }
	},
		$$inline: true
	});

	var panel5 = new Panel({
		props: {
		class: "w-full",
		$$slots: {
		default: [create_default_slot_2],
		contents: [create_contents_slot_2],
		title: [create_title_slot_2]
	},
		$$scope: { ctx }
	},
		$$inline: true
	});

	var panel6 = new Panel({
		props: {
		class: "w-full",
		$$slots: {
		default: [create_default_slot_1],
		contents: [create_contents_slot_1],
		title: [create_title_slot_1]
	},
		$$scope: { ctx }
	},
		$$inline: true
	});

	var panel7 = new Panel({
		props: {
		class: "w-full",
		$$slots: {
		default: [create_default_slot],
		contents: [create_contents_slot],
		title: [create_title_slot]
	},
		$$scope: { ctx }
	},
		$$inline: true
	});

	const block = {
		c: function create() {
			t0 = space();
			div0 = element("div");
			t1 = space();
			div4 = element("div");
			img = element("img");
			t2 = space();
			div1 = element("div");
			h1 = element("h1");
			t3 = text(t3_value);
			t4 = space();
			badges.$$.fragment.c();
			t5 = space();
			gamebadges.$$.fragment.c();
			t6 = space();
			div2 = element("div");
			t7 = text(t7_value);
			t8 = space();
			div3 = element("div");
			a0 = element("a");
			svg0 = svg_element("svg");
			path0 = svg_element("path");
			t9 = space();
			span0 = element("span");
			t10 = text("트위치 채널");
			t11 = space();
			a1 = element("a");
			svg1 = svg_element("svg");
			path1 = svg_element("path");
			t12 = space();
			span1 = element("span");
			t13 = text("지도에서 찾기");
			t14 = space();
			table = element("table");
			tr0 = element("tr");
			td0 = element("td");
			t15 = space();
			td1 = element("td");
			t16 = text("평청자");
			t17 = space();
			td2 = element("td");
			span2 = element("span");
			t18 = text(t18_value);
			t19 = text("\n          명");
			t20 = space();
			tr1 = element("tr");
			td3 = element("td");
			t21 = space();
			td4 = element("td");
			t22 = text("팔로워");
			t23 = space();
			td5 = element("td");
			span3 = element("span");
			t24 = text(t24_value);
			t25 = text("\n          명");
			t26 = space();
			tr2 = element("tr");
			td6 = element("td");
			t27 = space();
			td7 = element("td");
			t28 = text("방송량");
			t29 = space();
			td8 = element("td");
			t30 = text("주 \n          ");
			span4 = element("span");
			t31 = text(t31_value);
			t32 = text(" 시간");
			t33 = space();
			tr3 = element("tr");
			td9 = element("td");
			t34 = space();
			td10 = element("td");
			t35 = text("방송시간대");
			t36 = space();
			td11 = element("td");
			span11 = element("span");
			span5 = element("span");
			t37 = text(t37_value);
			t38 = text("시 \n            ");
			span6 = element("span");
			t39 = text(t39_value);
			t40 = text("분 \n            ");
			span7 = element("span");
			t41 = text("(±");
			t42 = text(t42_value);
			t43 = text("시간)");
			t44 = text(" \n            ~\n            ");
			span8 = element("span");
			t45 = text(t45_value);
			t46 = text("시 \n            ");
			span9 = element("span");
			t47 = text(t47_value);
			t48 = text("분\n            ");
			span10 = element("span");
			t49 = text("(±");
			t50 = text(t50_value);
			t51 = text("시간)");
			t52 = space();
			tr4 = element("tr");
			td12 = element("td");
			t53 = space();
			td13 = element("td");
			t54 = text("주방송시간");
			t55 = space();
			td14 = element("td");

			for (let i = 0; i < each_blocks.length; i += 1) {
				each_blocks[i].c();
			}

			t56 = space();
			span12 = element("span");
			t57 = text("(");
			t58 = text(t58_value);
			t59 = text("% 확률)");
			t60 = space();
			div11 = element("div");
			div10 = element("div");
			div8 = element("div");
			panel0.$$.fragment.c();
			t61 = space();
			div7 = element("div");
			div5 = element("div");
			panel1.$$.fragment.c();
			t62 = space();
			panel2.$$.fragment.c();
			t63 = space();
			div6 = element("div");
			panel3.$$.fragment.c();
			t64 = space();
			panel4.$$.fragment.c();
			t65 = space();
			div9 = element("div");
			panel5.$$.fragment.c();
			t66 = space();
			panel6.$$.fragment.c();
			t67 = space();
			panel7.$$.fragment.c();
			this.h();
		},

		l: function claim(nodes) {
			t0 = claim_space(nodes);

			div0 = claim_element(nodes, "DIV", { class: true }, false);
			var div0_nodes = children(div0);

			div0_nodes.forEach(detach_dev);
			t1 = claim_space(nodes);

			div4 = claim_element(nodes, "DIV", { class: true }, false);
			var div4_nodes = children(div4);

			img = claim_element(div4_nodes, "IMG", { class: true, src: true, alt: true }, false);
			var img_nodes = children(img);

			img_nodes.forEach(detach_dev);
			t2 = claim_space(div4_nodes);

			div1 = claim_element(div4_nodes, "DIV", { class: true }, false);
			var div1_nodes = children(div1);

			h1 = claim_element(div1_nodes, "H1", { class: true }, false);
			var h1_nodes = children(h1);

			t3 = claim_text(h1_nodes, t3_value);
			h1_nodes.forEach(detach_dev);
			t4 = claim_space(div1_nodes);
			badges.$$.fragment.l(div1_nodes);
			t5 = claim_space(div1_nodes);
			gamebadges.$$.fragment.l(div1_nodes);
			div1_nodes.forEach(detach_dev);
			t6 = claim_space(div4_nodes);

			div2 = claim_element(div4_nodes, "DIV", { class: true }, false);
			var div2_nodes = children(div2);

			t7 = claim_text(div2_nodes, t7_value);
			div2_nodes.forEach(detach_dev);
			t8 = claim_space(div4_nodes);

			div3 = claim_element(div4_nodes, "DIV", { class: true }, false);
			var div3_nodes = children(div3);

			a0 = claim_element(div3_nodes, "A", { class: true, href: true }, false);
			var a0_nodes = children(a0);

			svg0 = claim_element(a0_nodes, "svg", { "area-hidden": true, role: true, xmlns: true, viewBox: true, class: true }, true);
			var svg0_nodes = children(svg0);

			path0 = claim_element(svg0_nodes, "path", { fill: true, d: true }, true);
			var path0_nodes = children(path0);

			path0_nodes.forEach(detach_dev);
			svg0_nodes.forEach(detach_dev);
			t9 = claim_space(a0_nodes);

			span0 = claim_element(a0_nodes, "SPAN", {}, false);
			var span0_nodes = children(span0);

			t10 = claim_text(span0_nodes, "트위치 채널");
			span0_nodes.forEach(detach_dev);
			a0_nodes.forEach(detach_dev);
			t11 = claim_space(div3_nodes);

			a1 = claim_element(div3_nodes, "A", { class: true, href: true }, false);
			var a1_nodes = children(a1);

			svg1 = claim_element(a1_nodes, "svg", { "area-hidden": true, role: true, xmlns: true, viewBox: true, class: true }, true);
			var svg1_nodes = children(svg1);

			path1 = claim_element(svg1_nodes, "path", { fill: true, d: true }, true);
			var path1_nodes = children(path1);

			path1_nodes.forEach(detach_dev);
			svg1_nodes.forEach(detach_dev);
			t12 = claim_space(a1_nodes);

			span1 = claim_element(a1_nodes, "SPAN", {}, false);
			var span1_nodes = children(span1);

			t13 = claim_text(span1_nodes, "지도에서 찾기");
			span1_nodes.forEach(detach_dev);
			a1_nodes.forEach(detach_dev);
			div3_nodes.forEach(detach_dev);
			t14 = claim_space(div4_nodes);

			table = claim_element(div4_nodes, "TABLE", { class: true }, false);
			var table_nodes = children(table);

			tr0 = claim_element(table_nodes, "TR", {}, false);
			var tr0_nodes = children(tr0);

			td0 = claim_element(tr0_nodes, "TD", { class: true }, false);
			var td0_nodes = children(td0);

			td0_nodes.forEach(detach_dev);
			t15 = claim_space(tr0_nodes);

			td1 = claim_element(tr0_nodes, "TD", { class: true }, false);
			var td1_nodes = children(td1);

			t16 = claim_text(td1_nodes, "평청자");
			td1_nodes.forEach(detach_dev);
			t17 = claim_space(tr0_nodes);

			td2 = claim_element(tr0_nodes, "TD", { class: true }, false);
			var td2_nodes = children(td2);

			span2 = claim_element(td2_nodes, "SPAN", { class: true }, false);
			var span2_nodes = children(span2);

			t18 = claim_text(span2_nodes, t18_value);
			span2_nodes.forEach(detach_dev);
			t19 = claim_text(td2_nodes, "\n          명");
			td2_nodes.forEach(detach_dev);
			tr0_nodes.forEach(detach_dev);
			t20 = claim_space(table_nodes);

			tr1 = claim_element(table_nodes, "TR", {}, false);
			var tr1_nodes = children(tr1);

			td3 = claim_element(tr1_nodes, "TD", { class: true }, false);
			var td3_nodes = children(td3);

			td3_nodes.forEach(detach_dev);
			t21 = claim_space(tr1_nodes);

			td4 = claim_element(tr1_nodes, "TD", { class: true }, false);
			var td4_nodes = children(td4);

			t22 = claim_text(td4_nodes, "팔로워");
			td4_nodes.forEach(detach_dev);
			t23 = claim_space(tr1_nodes);

			td5 = claim_element(tr1_nodes, "TD", { class: true }, false);
			var td5_nodes = children(td5);

			span3 = claim_element(td5_nodes, "SPAN", { class: true }, false);
			var span3_nodes = children(span3);

			t24 = claim_text(span3_nodes, t24_value);
			span3_nodes.forEach(detach_dev);
			t25 = claim_text(td5_nodes, "\n          명");
			td5_nodes.forEach(detach_dev);
			tr1_nodes.forEach(detach_dev);
			t26 = claim_space(table_nodes);

			tr2 = claim_element(table_nodes, "TR", {}, false);
			var tr2_nodes = children(tr2);

			td6 = claim_element(tr2_nodes, "TD", { class: true }, false);
			var td6_nodes = children(td6);

			td6_nodes.forEach(detach_dev);
			t27 = claim_space(tr2_nodes);

			td7 = claim_element(tr2_nodes, "TD", { class: true }, false);
			var td7_nodes = children(td7);

			t28 = claim_text(td7_nodes, "방송량");
			td7_nodes.forEach(detach_dev);
			t29 = claim_space(tr2_nodes);

			td8 = claim_element(tr2_nodes, "TD", { class: true }, false);
			var td8_nodes = children(td8);

			t30 = claim_text(td8_nodes, "주 \n          ");

			span4 = claim_element(td8_nodes, "SPAN", { class: true }, false);
			var span4_nodes = children(span4);

			t31 = claim_text(span4_nodes, t31_value);
			span4_nodes.forEach(detach_dev);
			t32 = claim_text(td8_nodes, " 시간");
			td8_nodes.forEach(detach_dev);
			tr2_nodes.forEach(detach_dev);
			t33 = claim_space(table_nodes);

			tr3 = claim_element(table_nodes, "TR", {}, false);
			var tr3_nodes = children(tr3);

			td9 = claim_element(tr3_nodes, "TD", { class: true }, false);
			var td9_nodes = children(td9);

			td9_nodes.forEach(detach_dev);
			t34 = claim_space(tr3_nodes);

			td10 = claim_element(tr3_nodes, "TD", { class: true }, false);
			var td10_nodes = children(td10);

			t35 = claim_text(td10_nodes, "방송시간대");
			td10_nodes.forEach(detach_dev);
			t36 = claim_space(tr3_nodes);

			td11 = claim_element(tr3_nodes, "TD", { class: true }, false);
			var td11_nodes = children(td11);

			span11 = claim_element(td11_nodes, "SPAN", { class: true }, false);
			var span11_nodes = children(span11);

			span5 = claim_element(span11_nodes, "SPAN", { class: true }, false);
			var span5_nodes = children(span5);

			t37 = claim_text(span5_nodes, t37_value);
			span5_nodes.forEach(detach_dev);
			t38 = claim_text(span11_nodes, "시 \n            ");

			span6 = claim_element(span11_nodes, "SPAN", { class: true }, false);
			var span6_nodes = children(span6);

			t39 = claim_text(span6_nodes, t39_value);
			span6_nodes.forEach(detach_dev);
			t40 = claim_text(span11_nodes, "분 \n            ");

			span7 = claim_element(span11_nodes, "SPAN", { class: true }, false);
			var span7_nodes = children(span7);

			t41 = claim_text(span7_nodes, "(±");
			t42 = claim_text(span7_nodes, t42_value);
			t43 = claim_text(span7_nodes, "시간)");
			span7_nodes.forEach(detach_dev);
			t44 = claim_text(span11_nodes, " \n            ~\n            ");

			span8 = claim_element(span11_nodes, "SPAN", { class: true }, false);
			var span8_nodes = children(span8);

			t45 = claim_text(span8_nodes, t45_value);
			span8_nodes.forEach(detach_dev);
			t46 = claim_text(span11_nodes, "시 \n            ");

			span9 = claim_element(span11_nodes, "SPAN", { class: true }, false);
			var span9_nodes = children(span9);

			t47 = claim_text(span9_nodes, t47_value);
			span9_nodes.forEach(detach_dev);
			t48 = claim_text(span11_nodes, "분\n            ");

			span10 = claim_element(span11_nodes, "SPAN", { class: true }, false);
			var span10_nodes = children(span10);

			t49 = claim_text(span10_nodes, "(±");
			t50 = claim_text(span10_nodes, t50_value);
			t51 = claim_text(span10_nodes, "시간)");
			span10_nodes.forEach(detach_dev);
			span11_nodes.forEach(detach_dev);
			td11_nodes.forEach(detach_dev);
			tr3_nodes.forEach(detach_dev);
			t52 = claim_space(table_nodes);

			tr4 = claim_element(table_nodes, "TR", {}, false);
			var tr4_nodes = children(tr4);

			td12 = claim_element(tr4_nodes, "TD", { class: true }, false);
			var td12_nodes = children(td12);

			td12_nodes.forEach(detach_dev);
			t53 = claim_space(tr4_nodes);

			td13 = claim_element(tr4_nodes, "TD", { class: true }, false);
			var td13_nodes = children(td13);

			t54 = claim_text(td13_nodes, "주방송시간");
			td13_nodes.forEach(detach_dev);
			t55 = claim_space(tr4_nodes);

			td14 = claim_element(tr4_nodes, "TD", { class: true }, false);
			var td14_nodes = children(td14);

			for (let i = 0; i < each_blocks.length; i += 1) {
				each_blocks[i].l(td14_nodes);
			}

			t56 = claim_space(td14_nodes);

			span12 = claim_element(td14_nodes, "SPAN", { class: true }, false);
			var span12_nodes = children(span12);

			t57 = claim_text(span12_nodes, "(");
			t58 = claim_text(span12_nodes, t58_value);
			t59 = claim_text(span12_nodes, "% 확률)");
			span12_nodes.forEach(detach_dev);
			td14_nodes.forEach(detach_dev);
			tr4_nodes.forEach(detach_dev);
			table_nodes.forEach(detach_dev);
			div4_nodes.forEach(detach_dev);
			t60 = claim_space(nodes);

			div11 = claim_element(nodes, "DIV", { class: true }, false);
			var div11_nodes = children(div11);

			div10 = claim_element(div11_nodes, "DIV", { class: true }, false);
			var div10_nodes = children(div10);

			div8 = claim_element(div10_nodes, "DIV", { class: true }, false);
			var div8_nodes = children(div8);

			panel0.$$.fragment.l(div8_nodes);
			t61 = claim_space(div8_nodes);

			div7 = claim_element(div8_nodes, "DIV", { class: true }, false);
			var div7_nodes = children(div7);

			div5 = claim_element(div7_nodes, "DIV", { class: true }, false);
			var div5_nodes = children(div5);

			panel1.$$.fragment.l(div5_nodes);
			t62 = claim_space(div5_nodes);
			panel2.$$.fragment.l(div5_nodes);
			div5_nodes.forEach(detach_dev);
			t63 = claim_space(div7_nodes);

			div6 = claim_element(div7_nodes, "DIV", { class: true }, false);
			var div6_nodes = children(div6);

			panel3.$$.fragment.l(div6_nodes);
			t64 = claim_space(div6_nodes);
			panel4.$$.fragment.l(div6_nodes);
			div6_nodes.forEach(detach_dev);
			div7_nodes.forEach(detach_dev);
			div8_nodes.forEach(detach_dev);
			t65 = claim_space(div10_nodes);

			div9 = claim_element(div10_nodes, "DIV", { class: true }, false);
			var div9_nodes = children(div9);

			panel5.$$.fragment.l(div9_nodes);
			t66 = claim_space(div9_nodes);
			panel6.$$.fragment.l(div9_nodes);
			div9_nodes.forEach(detach_dev);
			div10_nodes.forEach(detach_dev);
			t67 = claim_space(div11_nodes);
			panel7.$$.fragment.l(div11_nodes);
			div11_nodes.forEach(detach_dev);
			this.h();
		},

		h: function hydrate() {
			attr_dev(div0, "class", "w-full md:h-48 h-40 bg-primary-600");
			add_location(div0, file$7, 16, 0, 492);
			attr_dev(img, "class", "rounded-lg w-64 h-64 md:w-auto md:self-start self-center md:h-auto md:-mt-40 -mt-32 z-5 border-4 border-gray-200 bg-gray-200");
			attr_dev(img, "src", img_src_value = ctx.streamer.profile_image_url);
			attr_dev(img, "alt", "프로필 이미지");
			add_location(img, file$7, 21, 2, 630);
			attr_dev(h1, "class", "text-4xl tracking-wider inline");
			add_location(h1, file$7, 27, 4, 859);
			attr_dev(div1, "class", "mt-8");
			add_location(div1, file$7, 26, 2, 836);
			attr_dev(div2, "class", "mt-12");
			add_location(div2, file$7, 31, 2, 1078);
			attr_dev(path0, "fill", "currentColor");
			attr_dev(path0, "d", faExternalLinkAlt_2.icon[4]);
			add_location(path0, file$7, 37, 8, 1486);
			attr_dev(svg0, "area-hidden", "true");
			attr_dev(svg0, "role", "img");
			attr_dev(svg0, "xmlns", "http://www.w3.org/2000/svg");
			attr_dev(svg0, "viewBox", "0 0 " + faExternalLinkAlt_2.icon[0] + " " + faExternalLinkAlt_2.icon[1]);
			attr_dev(svg0, "class", "w-3 h-3 mr-1 overflow-visible inline-block");
			add_location(svg0, file$7, 36, 6, 1286);
			add_location(span0, file$7, 39, 6, 1565);
			attr_dev(a0, "class", "text-xs text-blue-500 flex flex-row items-center");
			attr_dev(a0, "href", a0_href_value = "https://www.twitch.tv/" + ctx.streamer.login);
			add_location(a0, file$7, 35, 4, 1173);
			attr_dev(path1, "fill", "currentColor");
			attr_dev(path1, "d", faExternalLinkAlt_2.icon[4]);
			add_location(path1, file$7, 43, 8, 1917);
			attr_dev(svg1, "area-hidden", "true");
			attr_dev(svg1, "role", "img");
			attr_dev(svg1, "xmlns", "http://www.w3.org/2000/svg");
			attr_dev(svg1, "viewBox", "0 0 " + faExternalLinkAlt_2.icon[0] + " " + faExternalLinkAlt_2.icon[1]);
			attr_dev(svg1, "class", "w-3 h-3 mr-1 overflow-visible inline-block");
			add_location(svg1, file$7, 42, 6, 1717);
			add_location(span1, file$7, 45, 6, 1996);
			attr_dev(a1, "class", "text-xs text-blue-500 flex flex-row items-center ml-4");
			attr_dev(a1, "href", a1_href_value = "/map?interest_streamer_id=" + ctx.streamer.id);
			add_location(a1, file$7, 41, 4, 1598);
			attr_dev(div3, "class", "mt-8 flex flex-row");
			add_location(div3, file$7, 34, 2, 1136);
			attr_dev(td0, "class", "w-1 bg-orange-400");
			add_location(td0, file$7, 50, 8, 2083);
			attr_dev(td1, "class", "text-left p-1");
			add_location(td1, file$7, 51, 8, 2128);
			attr_dev(span2, "class", "font-bold text-base");
			add_location(span2, file$7, 53, 10, 2215);
			attr_dev(td2, "class", "pl-6 text-orange-400");
			add_location(td2, file$7, 52, 8, 2171);
			add_location(tr0, file$7, 49, 4, 2070);
			attr_dev(td3, "class", "w-1 bg-purple-400");
			add_location(td3, file$7, 58, 8, 2382);
			attr_dev(td4, "class", "text-left p-1");
			add_location(td4, file$7, 59, 8, 2427);
			attr_dev(span3, "class", "font-bold text-base");
			add_location(span3, file$7, 61, 10, 2514);
			attr_dev(td5, "class", "pl-6 text-purple-400");
			add_location(td5, file$7, 60, 8, 2470);
			add_location(tr1, file$7, 57, 4, 2369);
			attr_dev(td6, "class", "w-1 bg-blue-400");
			add_location(td6, file$7, 66, 8, 2675);
			attr_dev(td7, "class", "text-left p-1");
			add_location(td7, file$7, 67, 8, 2718);
			attr_dev(span4, "class", "font-bold text-base");
			add_location(span4, file$7, 70, 10, 2816);
			attr_dev(td8, "class", "pl-6 text-blue-400");
			add_location(td8, file$7, 68, 8, 2761);
			add_location(tr2, file$7, 65, 4, 2662);
			attr_dev(td9, "class", "w-1 bg-green-400");
			add_location(td9, file$7, 73, 8, 2946);
			attr_dev(td10, "class", "text-left p-1");
			add_location(td10, file$7, 74, 8, 2990);
			attr_dev(span5, "class", "font-bold text-base");
			add_location(span5, file$7, 77, 12, 3110);
			attr_dev(span6, "class", "font-bold text-base");
			add_location(span6, file$7, 78, 12, 3205);
			attr_dev(span7, "class", "text-gray-600");
			add_location(span7, file$7, 79, 12, 3303);
			attr_dev(span8, "class", "font-bold text-base");
			add_location(span8, file$7, 81, 12, 3417);
			attr_dev(span9, "class", "font-bold text-base");
			add_location(span9, file$7, 82, 12, 3510);
			attr_dev(span10, "class", "text-gray-600");
			add_location(span10, file$7, 83, 12, 3605);
			attr_dev(span11, "class", "pr-2");
			add_location(span11, file$7, 76, 10, 3078);
			attr_dev(td11, "class", "pl-6 text-green-400");
			add_location(td11, file$7, 75, 8, 3035);
			add_location(tr3, file$7, 72, 4, 2933);
			attr_dev(td12, "class", "w-1 bg-teal-400");
			add_location(td12, file$7, 88, 8, 3750);
			attr_dev(td13, "class", "text-left p-1");
			add_location(td13, file$7, 89, 8, 3793);
			attr_dev(span12, "class", "text-gray-600");
			add_location(span12, file$7, 99, 10, 4351);
			attr_dev(td14, "class", "pl-6 text-teal-400");
			add_location(td14, file$7, 90, 8, 3838);
			add_location(tr4, file$7, 87, 4, 3737);
			attr_dev(table, "class", "mt-6 text-xs");
			add_location(table, file$7, 48, 2, 2037);
			attr_dev(div4, "class", "container m-auto flex flex-col md:items-start items-center px-4");
			add_location(div4, file$7, 20, 0, 550);
			attr_dev(div5, "class", "flex flex-col w-full md:w-1/2");
			add_location(div5, file$7, 149, 8, 7021);
			attr_dev(div6, "class", "flex flex-col w-full md:w-1/2");
			add_location(div6, file$7, 182, 8, 8678);
			attr_dev(div7, "class", "flex md:flex-row flex-col");
			add_location(div7, file$7, 148, 6, 6973);
			attr_dev(div8, "class", "flex flex-col md:w-1/2 w-full md:pr-2");
			add_location(div8, file$7, 113, 4, 4825);
			attr_dev(div9, "class", "flex flex-col w-full md:w-1/2 md:pl-2");
			add_location(div9, file$7, 204, 4, 9814);
			attr_dev(div10, "class", "flex md:flex-row flex-col w-full items-stretch flex-wrap mt-8");
			add_location(div10, file$7, 112, 2, 4745);
			attr_dev(div11, "class", "flex flex-col items-center m-auto container");
			add_location(div11, file$7, 111, 0, 4685);
		},

		m: function mount(target, anchor) {
			insert_dev(target, t0, anchor);
			insert_dev(target, div0, anchor);
			insert_dev(target, t1, anchor);
			insert_dev(target, div4, anchor);
			append_dev(div4, img);
			append_dev(div4, t2);
			append_dev(div4, div1);
			append_dev(div1, h1);
			append_dev(h1, t3);
			append_dev(div1, t4);
			mount_component(badges, div1, null);
			append_dev(div1, t5);
			mount_component(gamebadges, div1, null);
			append_dev(div4, t6);
			append_dev(div4, div2);
			append_dev(div2, t7);
			append_dev(div4, t8);
			append_dev(div4, div3);
			append_dev(div3, a0);
			append_dev(a0, svg0);
			append_dev(svg0, path0);
			append_dev(a0, t9);
			append_dev(a0, span0);
			append_dev(span0, t10);
			append_dev(div3, t11);
			append_dev(div3, a1);
			append_dev(a1, svg1);
			append_dev(svg1, path1);
			append_dev(a1, t12);
			append_dev(a1, span1);
			append_dev(span1, t13);
			append_dev(div4, t14);
			append_dev(div4, table);
			append_dev(table, tr0);
			append_dev(tr0, td0);
			append_dev(tr0, t15);
			append_dev(tr0, td1);
			append_dev(td1, t16);
			append_dev(tr0, t17);
			append_dev(tr0, td2);
			append_dev(td2, span2);
			append_dev(span2, t18);
			append_dev(td2, t19);
			append_dev(table, t20);
			append_dev(table, tr1);
			append_dev(tr1, td3);
			append_dev(tr1, t21);
			append_dev(tr1, td4);
			append_dev(td4, t22);
			append_dev(tr1, t23);
			append_dev(tr1, td5);
			append_dev(td5, span3);
			append_dev(span3, t24);
			append_dev(td5, t25);
			append_dev(table, t26);
			append_dev(table, tr2);
			append_dev(tr2, td6);
			append_dev(tr2, t27);
			append_dev(tr2, td7);
			append_dev(td7, t28);
			append_dev(tr2, t29);
			append_dev(tr2, td8);
			append_dev(td8, t30);
			append_dev(td8, span4);
			append_dev(span4, t31);
			append_dev(td8, t32);
			append_dev(table, t33);
			append_dev(table, tr3);
			append_dev(tr3, td9);
			append_dev(tr3, t34);
			append_dev(tr3, td10);
			append_dev(td10, t35);
			append_dev(tr3, t36);
			append_dev(tr3, td11);
			append_dev(td11, span11);
			append_dev(span11, span5);
			append_dev(span5, t37);
			append_dev(span11, t38);
			append_dev(span11, span6);
			append_dev(span6, t39);
			append_dev(span11, t40);
			append_dev(span11, span7);
			append_dev(span7, t41);
			append_dev(span7, t42);
			append_dev(span7, t43);
			append_dev(span11, t44);
			append_dev(span11, span8);
			append_dev(span8, t45);
			append_dev(span11, t46);
			append_dev(span11, span9);
			append_dev(span9, t47);
			append_dev(span11, t48);
			append_dev(span11, span10);
			append_dev(span10, t49);
			append_dev(span10, t50);
			append_dev(span10, t51);
			append_dev(table, t52);
			append_dev(table, tr4);
			append_dev(tr4, td12);
			append_dev(tr4, t53);
			append_dev(tr4, td13);
			append_dev(td13, t54);
			append_dev(tr4, t55);
			append_dev(tr4, td14);

			for (let i = 0; i < each_blocks.length; i += 1) {
				each_blocks[i].m(td14, null);
			}

			append_dev(td14, t56);
			append_dev(td14, span12);
			append_dev(span12, t57);
			append_dev(span12, t58);
			append_dev(span12, t59);
			insert_dev(target, t60, anchor);
			insert_dev(target, div11, anchor);
			append_dev(div11, div10);
			append_dev(div10, div8);
			mount_component(panel0, div8, null);
			append_dev(div8, t61);
			append_dev(div8, div7);
			append_dev(div7, div5);
			mount_component(panel1, div5, null);
			append_dev(div5, t62);
			mount_component(panel2, div5, null);
			append_dev(div7, t63);
			append_dev(div7, div6);
			mount_component(panel3, div6, null);
			append_dev(div6, t64);
			mount_component(panel4, div6, null);
			append_dev(div10, t65);
			append_dev(div10, div9);
			mount_component(panel5, div9, null);
			append_dev(div9, t66);
			mount_component(panel6, div9, null);
			append_dev(div11, t67);
			mount_component(panel7, div11, null);
			current = true;
		},

		p: function update(changed, ctx) {
			if ((!current || changed.streamer) && title_value !== (title_value = " 트수gg - " + ctx.streamer.name + " ")) {
				document.title = title_value;
			}

			if ((!current || changed.streamer) && img_src_value !== (img_src_value = ctx.streamer.profile_image_url)) {
				attr_dev(img, "src", img_src_value);
			}

			if ((!current || changed.streamer) && t3_value !== (t3_value = ctx.streamer.name + "")) {
				set_data_dev(t3, t3_value);
			}

			var badges_changes = {};
			if (changed.streamer) badges_changes.streamer = ctx.streamer;
			if (changed.$$scope) badges_changes.$$scope = { changed, ctx };
			badges.$set(badges_changes);

			var gamebadges_changes = {};
			if (changed.streamer) gamebadges_changes.streamer = ctx.streamer;
			if (changed.$$scope) gamebadges_changes.$$scope = { changed, ctx };
			gamebadges.$set(gamebadges_changes);

			if ((!current || changed.streamer) && t7_value !== (t7_value = ctx.streamer.description + "")) {
				set_data_dev(t7, t7_value);
			}

			if ((!current || changed.streamer) && a0_href_value !== (a0_href_value = "https://www.twitch.tv/" + ctx.streamer.login)) {
				attr_dev(a0, "href", a0_href_value);
			}

			if ((!current || changed.streamer) && a1_href_value !== (a1_href_value = "/map?interest_streamer_id=" + ctx.streamer.id)) {
				attr_dev(a1, "href", a1_href_value);
			}

			if ((!current || changed.streamer) && t18_value !== (t18_value = ctx.streamer.average_viewer_count.toLocaleString('ko', {useGrouping:true}) + "")) {
				set_data_dev(t18, t18_value);
			}

			if ((!current || changed.streamer) && t24_value !== (t24_value = ctx.streamer.follower_count.toLocaleString('ko', {useGrouping:true}) + "")) {
				set_data_dev(t24, t24_value);
			}

			if ((!current || changed.streamer) && t31_value !== (t31_value = (ctx.streamer.streaming_hours_per_week || 0).toFixed(1) + "")) {
				set_data_dev(t31, t31_value);
			}

			if ((!current || changed.streaming_start_time) && t37_value !== (t37_value = Math.floor(ctx.streaming_start_time/3600) + "")) {
				set_data_dev(t37, t37_value);
			}

			if ((!current || changed.streaming_start_time) && t39_value !== (t39_value = Math.floor(ctx.streaming_start_time%3600/60) + "")) {
				set_data_dev(t39, t39_value);
			}

			if ((!current || changed.streaming_start_time_std) && t42_value !== (t42_value = (ctx.streaming_start_time_std/3600).toFixed(1) + "")) {
				set_data_dev(t42, t42_value);
			}

			if ((!current || changed.streaming_end_time) && t45_value !== (t45_value = Math.floor(ctx.streaming_end_time/3600) + "")) {
				set_data_dev(t45, t45_value);
			}

			if ((!current || changed.streaming_end_time) && t47_value !== (t47_value = Math.floor(ctx.streaming_end_time%3600/60) + "")) {
				set_data_dev(t47, t47_value);
			}

			if ((!current || changed.streaming_end_time_std) && t50_value !== (t50_value = (ctx.streaming_end_time_std/3600).toFixed(1) + "")) {
				set_data_dev(t50, t50_value);
			}

			if (changed.mean_streaming_time_ranges) {
				each_value_3 = ctx.mean_streaming_time_ranges;

				let i;
				for (i = 0; i < each_value_3.length; i += 1) {
					const child_ctx = get_each_context_3$1(ctx, each_value_3, i);

					if (each_blocks[i]) {
						each_blocks[i].p(changed, child_ctx);
					} else {
						each_blocks[i] = create_each_block_3$1(child_ctx);
						each_blocks[i].c();
						each_blocks[i].m(td14, t56);
					}
				}

				for (; i < each_blocks.length; i += 1) {
					each_blocks[i].d(1);
				}
				each_blocks.length = each_value_3.length;
			}

			if ((!current || changed.mean_streaming_time_reliability) && t58_value !== (t58_value = (ctx.mean_streaming_time_reliability * 100).toFixed(0) + "")) {
				set_data_dev(t58, t58_value);
			}

			var panel0_changes = {};
			if (changed.$$scope || changed.similar_streamers || changed.streamer || changed.similar_streamers_top10) panel0_changes.$$scope = { changed, ctx };
			panel0.$set(panel0_changes);

			var panel1_changes = {};
			if (changed.$$scope || changed.month_offsets || changed.streamer) panel1_changes.$$scope = { changed, ctx };
			panel1.$set(panel1_changes);

			var panel2_changes = {};
			if (changed.$$scope || changed.streamer || changed.mean_streaming_time_ranges || changed.mean_streaming_time_reliability || changed.streaming_time_ranges_variance || changed.total_streaming_time_ratio || changed.streaming_start_time || changed.streaming_start_time_std || changed.streaming_end_time || changed.streaming_end_time_std) panel2_changes.$$scope = { changed, ctx };
			panel2.$set(panel2_changes);

			var panel3_changes = {};
			if (changed.$$scope || changed.streamer) panel3_changes.$$scope = { changed, ctx };
			panel3.$set(panel3_changes);

			var panel4_changes = {};
			if (changed.$$scope || changed.streamer) panel4_changes.$$scope = { changed, ctx };
			panel4.$set(panel4_changes);

			var panel5_changes = {};
			if (changed.$$scope || changed.streamer) panel5_changes.$$scope = { changed, ctx };
			panel5.$set(panel5_changes);

			var panel6_changes = {};
			if (changed.$$scope || changed.streamer) panel6_changes.$$scope = { changed, ctx };
			panel6.$set(panel6_changes);

			var panel7_changes = {};
			if (changed.$$scope || changed.timelines || changed.streamer) panel7_changes.$$scope = { changed, ctx };
			panel7.$set(panel7_changes);
		},

		i: function intro(local) {
			if (current) return;
			transition_in(badges.$$.fragment, local);

			transition_in(gamebadges.$$.fragment, local);

			transition_in(panel0.$$.fragment, local);

			transition_in(panel1.$$.fragment, local);

			transition_in(panel2.$$.fragment, local);

			transition_in(panel3.$$.fragment, local);

			transition_in(panel4.$$.fragment, local);

			transition_in(panel5.$$.fragment, local);

			transition_in(panel6.$$.fragment, local);

			transition_in(panel7.$$.fragment, local);

			current = true;
		},

		o: function outro(local) {
			transition_out(badges.$$.fragment, local);
			transition_out(gamebadges.$$.fragment, local);
			transition_out(panel0.$$.fragment, local);
			transition_out(panel1.$$.fragment, local);
			transition_out(panel2.$$.fragment, local);
			transition_out(panel3.$$.fragment, local);
			transition_out(panel4.$$.fragment, local);
			transition_out(panel5.$$.fragment, local);
			transition_out(panel6.$$.fragment, local);
			transition_out(panel7.$$.fragment, local);
			current = false;
		},

		d: function destroy(detaching) {
			if (detaching) {
				detach_dev(t0);
				detach_dev(div0);
				detach_dev(t1);
				detach_dev(div4);
			}

			destroy_component(badges);

			destroy_component(gamebadges);

			destroy_each(each_blocks, detaching);

			if (detaching) {
				detach_dev(t60);
				detach_dev(div11);
			}

			destroy_component(panel0);

			destroy_component(panel1);

			destroy_component(panel2);

			destroy_component(panel3);

			destroy_component(panel4);

			destroy_component(panel5);

			destroy_component(panel6);

			destroy_component(panel7);
		}
	};
	dispatch_dev("SvelteRegisterBlock", { block, id: create_fragment$7.name, type: "component", source: "", ctx });
	return block;
}

async function preload(page, session) {
  const { id } = page.params;
  let streamer = await API.streamer.call(this, id);
  let similar_streamers = await API.similar_streamers.call(this, id);
  let similar_streamers_top10 = similar_streamers.slice(0, 10);
  return { streamer, similar_streamers, similar_streamers_top10 };
}

function instance$7($$self, $$props, $$invalidate) {
	

  let { streamer, similar_streamers, similar_streamers_top10, mean_streaming_time_ranges = [], mean_streaming_time_reliability = 0.0, streaming_time_ranges_variance = 0.0, total_streaming_time_ratio = 0.0, streaming_start_time = 0.0, streaming_start_time_std = 0.0, streaming_end_time = 0.0, streaming_end_time_std = 0.0 } = $$props;

  let timelines = [];
  let last_streamer = streamer;

  function load_timeline() {
    if(timelines.length){
      for(let i=0; i<7; ++i)
        timelines.push(timelines[timelines.length-1]+1);
      $$invalidate('timelines', timelines), $$invalidate('last_streamer', last_streamer), $$invalidate('streamer', streamer);
    }
    else
      $$invalidate('timelines', timelines = [0,1,2,3,4,5,6]);
  }
  load_timeline();


  let month_offsets = [-1, 0];

	const writable_props = ['streamer', 'similar_streamers', 'similar_streamers_top10', 'mean_streaming_time_ranges', 'mean_streaming_time_reliability', 'streaming_time_ranges_variance', 'total_streaming_time_ratio', 'streaming_start_time', 'streaming_start_time_std', 'streaming_end_time', 'streaming_end_time_std'];
	Object.keys($$props).forEach(key => {
		if (!writable_props.includes(key) && !key.startsWith('$$')) console.warn(`<Id> was created with unknown prop '${key}'`);
	});

	const func = (s) => ({from: streamer.id, to: s.id, length: Math.max(0.1, 1-(s.similarity*s.similarity*10)), strength: s.similarity*s.similarity*100});

	const func_1 = () => {};

	const click_handler = (e) => API.similar_streamers(streamer.id, similar_streamers.length).then(res => $$invalidate('similar_streamers', similar_streamers = [...similar_streamers, ...res]));

	const click_handler_1 = (e) => $$invalidate('month_offsets', month_offsets = [month_offsets[0]-1, ...month_offsets]);

	function streamspiral_mean_streaming_time_ranges_binding(value) {
		mean_streaming_time_ranges = value;
		$$invalidate('mean_streaming_time_ranges', mean_streaming_time_ranges);
	}

	function streamspiral_mean_streaming_time_reliability_binding(value_1) {
		mean_streaming_time_reliability = value_1;
		$$invalidate('mean_streaming_time_reliability', mean_streaming_time_reliability);
	}

	function streamspiral_streaming_time_ranges_variance_binding(value_2) {
		streaming_time_ranges_variance = value_2;
		$$invalidate('streaming_time_ranges_variance', streaming_time_ranges_variance);
	}

	function streamspiral_total_streaming_time_ratio_binding(value_3) {
		total_streaming_time_ratio = value_3;
		$$invalidate('total_streaming_time_ratio', total_streaming_time_ratio);
	}

	function streamspiral_streaming_start_time_binding(value_4) {
		streaming_start_time = value_4;
		$$invalidate('streaming_start_time', streaming_start_time);
	}

	function streamspiral_streaming_start_time_std_binding(value_5) {
		streaming_start_time_std = value_5;
		$$invalidate('streaming_start_time_std', streaming_start_time_std);
	}

	function streamspiral_streaming_end_time_binding(value_6) {
		streaming_end_time = value_6;
		$$invalidate('streaming_end_time', streaming_end_time);
	}

	function streamspiral_streaming_end_time_std_binding(value_7) {
		streaming_end_time_std = value_7;
		$$invalidate('streaming_end_time_std', streaming_end_time_std);
	}

	$$self.$set = $$props => {
		if ('streamer' in $$props) $$invalidate('streamer', streamer = $$props.streamer);
		if ('similar_streamers' in $$props) $$invalidate('similar_streamers', similar_streamers = $$props.similar_streamers);
		if ('similar_streamers_top10' in $$props) $$invalidate('similar_streamers_top10', similar_streamers_top10 = $$props.similar_streamers_top10);
		if ('mean_streaming_time_ranges' in $$props) $$invalidate('mean_streaming_time_ranges', mean_streaming_time_ranges = $$props.mean_streaming_time_ranges);
		if ('mean_streaming_time_reliability' in $$props) $$invalidate('mean_streaming_time_reliability', mean_streaming_time_reliability = $$props.mean_streaming_time_reliability);
		if ('streaming_time_ranges_variance' in $$props) $$invalidate('streaming_time_ranges_variance', streaming_time_ranges_variance = $$props.streaming_time_ranges_variance);
		if ('total_streaming_time_ratio' in $$props) $$invalidate('total_streaming_time_ratio', total_streaming_time_ratio = $$props.total_streaming_time_ratio);
		if ('streaming_start_time' in $$props) $$invalidate('streaming_start_time', streaming_start_time = $$props.streaming_start_time);
		if ('streaming_start_time_std' in $$props) $$invalidate('streaming_start_time_std', streaming_start_time_std = $$props.streaming_start_time_std);
		if ('streaming_end_time' in $$props) $$invalidate('streaming_end_time', streaming_end_time = $$props.streaming_end_time);
		if ('streaming_end_time_std' in $$props) $$invalidate('streaming_end_time_std', streaming_end_time_std = $$props.streaming_end_time_std);
	};

	$$self.$capture_state = () => {
		return { streamer, similar_streamers, similar_streamers_top10, mean_streaming_time_ranges, mean_streaming_time_reliability, streaming_time_ranges_variance, total_streaming_time_ratio, streaming_start_time, streaming_start_time_std, streaming_end_time, streaming_end_time_std, timelines, last_streamer, month_offsets };
	};

	$$self.$inject_state = $$props => {
		if ('streamer' in $$props) $$invalidate('streamer', streamer = $$props.streamer);
		if ('similar_streamers' in $$props) $$invalidate('similar_streamers', similar_streamers = $$props.similar_streamers);
		if ('similar_streamers_top10' in $$props) $$invalidate('similar_streamers_top10', similar_streamers_top10 = $$props.similar_streamers_top10);
		if ('mean_streaming_time_ranges' in $$props) $$invalidate('mean_streaming_time_ranges', mean_streaming_time_ranges = $$props.mean_streaming_time_ranges);
		if ('mean_streaming_time_reliability' in $$props) $$invalidate('mean_streaming_time_reliability', mean_streaming_time_reliability = $$props.mean_streaming_time_reliability);
		if ('streaming_time_ranges_variance' in $$props) $$invalidate('streaming_time_ranges_variance', streaming_time_ranges_variance = $$props.streaming_time_ranges_variance);
		if ('total_streaming_time_ratio' in $$props) $$invalidate('total_streaming_time_ratio', total_streaming_time_ratio = $$props.total_streaming_time_ratio);
		if ('streaming_start_time' in $$props) $$invalidate('streaming_start_time', streaming_start_time = $$props.streaming_start_time);
		if ('streaming_start_time_std' in $$props) $$invalidate('streaming_start_time_std', streaming_start_time_std = $$props.streaming_start_time_std);
		if ('streaming_end_time' in $$props) $$invalidate('streaming_end_time', streaming_end_time = $$props.streaming_end_time);
		if ('streaming_end_time_std' in $$props) $$invalidate('streaming_end_time_std', streaming_end_time_std = $$props.streaming_end_time_std);
		if ('timelines' in $$props) $$invalidate('timelines', timelines = $$props.timelines);
		if ('last_streamer' in $$props) $$invalidate('last_streamer', last_streamer = $$props.last_streamer);
		if ('month_offsets' in $$props) $$invalidate('month_offsets', month_offsets = $$props.month_offsets);
	};

	$$self.$$.update = ($$dirty = { last_streamer: 1, streamer: 1 }) => {
		if ($$dirty.last_streamer || $$dirty.streamer) { {
        if(last_streamer != streamer){
          $$invalidate('timelines', timelines  = []);
          $$invalidate('last_streamer', last_streamer = streamer);
          load_timeline();
        }
      } }
	};

	return {
		streamer,
		similar_streamers,
		similar_streamers_top10,
		mean_streaming_time_ranges,
		mean_streaming_time_reliability,
		streaming_time_ranges_variance,
		total_streaming_time_ratio,
		streaming_start_time,
		streaming_start_time_std,
		streaming_end_time,
		streaming_end_time_std,
		timelines,
		load_timeline,
		month_offsets,
		func,
		func_1,
		click_handler,
		click_handler_1,
		streamspiral_mean_streaming_time_ranges_binding,
		streamspiral_mean_streaming_time_reliability_binding,
		streamspiral_streaming_time_ranges_variance_binding,
		streamspiral_total_streaming_time_ratio_binding,
		streamspiral_streaming_start_time_binding,
		streamspiral_streaming_start_time_std_binding,
		streamspiral_streaming_end_time_binding,
		streamspiral_streaming_end_time_std_binding
	};
}

class Id extends SvelteComponentDev {
	constructor(options) {
		super(options);
		init(this, options, instance$7, create_fragment$7, safe_not_equal, ["streamer", "similar_streamers", "similar_streamers_top10", "mean_streaming_time_ranges", "mean_streaming_time_reliability", "streaming_time_ranges_variance", "total_streaming_time_ratio", "streaming_start_time", "streaming_start_time_std", "streaming_end_time", "streaming_end_time_std"]);
		dispatch_dev("SvelteRegisterComponent", { component: this, tagName: "Id", options, id: create_fragment$7.name });

		const { ctx } = this.$$;
		const props = options.props || {};
		if (ctx.streamer === undefined && !('streamer' in props)) {
			console.warn("<Id> was created without expected prop 'streamer'");
		}
		if (ctx.similar_streamers === undefined && !('similar_streamers' in props)) {
			console.warn("<Id> was created without expected prop 'similar_streamers'");
		}
		if (ctx.similar_streamers_top10 === undefined && !('similar_streamers_top10' in props)) {
			console.warn("<Id> was created without expected prop 'similar_streamers_top10'");
		}
	}

	get streamer() {
		throw new Error("<Id>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
	}

	set streamer(value) {
		throw new Error("<Id>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
	}

	get similar_streamers() {
		throw new Error("<Id>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
	}

	set similar_streamers(value) {
		throw new Error("<Id>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
	}

	get similar_streamers_top10() {
		throw new Error("<Id>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
	}

	set similar_streamers_top10(value) {
		throw new Error("<Id>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
	}

	get mean_streaming_time_ranges() {
		throw new Error("<Id>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
	}

	set mean_streaming_time_ranges(value) {
		throw new Error("<Id>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
	}

	get mean_streaming_time_reliability() {
		throw new Error("<Id>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
	}

	set mean_streaming_time_reliability(value) {
		throw new Error("<Id>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
	}

	get streaming_time_ranges_variance() {
		throw new Error("<Id>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
	}

	set streaming_time_ranges_variance(value) {
		throw new Error("<Id>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
	}

	get total_streaming_time_ratio() {
		throw new Error("<Id>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
	}

	set total_streaming_time_ratio(value) {
		throw new Error("<Id>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
	}

	get streaming_start_time() {
		throw new Error("<Id>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
	}

	set streaming_start_time(value) {
		throw new Error("<Id>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
	}

	get streaming_start_time_std() {
		throw new Error("<Id>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
	}

	set streaming_start_time_std(value) {
		throw new Error("<Id>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
	}

	get streaming_end_time() {
		throw new Error("<Id>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
	}

	set streaming_end_time(value) {
		throw new Error("<Id>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
	}

	get streaming_end_time_std() {
		throw new Error("<Id>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
	}

	set streaming_end_time_std(value) {
		throw new Error("<Id>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
	}
}

export default Id;
export { preload };
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiW2lkXS4xOTRmNDU2Yy5qcyIsInNvdXJjZXMiOlsiLi4vLi4vLi4vc3JjL2NvbXBvbmVudHMvc3ByaW5neS5qcyIsIi4uLy4uLy4uL3NyYy9jb21wb25lbnRzL05ldHdvcmsuc3ZlbHRlIiwiLi4vLi4vLi4vc3JjL2NvbXBvbmVudHMvVGltZWxpbmUyLnN2ZWx0ZSIsIi4uLy4uLy4uL3NyYy9jb21wb25lbnRzL1N0cmVhbVNwaXJhbC5zdmVsdGUiLCIuLi8uLi8uLi9ub2RlX21vZHVsZXMvQGZvcnRhd2Vzb21lL2ZyZWUtc29saWQtc3ZnLWljb25zL2ZhQXJyb3dVcC5qcyIsIi4uLy4uLy4uL25vZGVfbW9kdWxlcy9AZm9ydGF3ZXNvbWUvZnJlZS1zb2xpZC1zdmctaWNvbnMvZmFBcnJvd0Rvd24uanMiLCIuLi8uLi8uLi9ub2RlX21vZHVsZXMvb2JqZWN0LWFzc2lnbi9pbmRleC5qcyIsIi4uLy4uLy4uL25vZGVfbW9kdWxlcy9zdmVsdGUtdG9hc3Qvc3ZlbHRlLXRvYXN0LmpzIiwiLi4vLi4vLi4vc3JjL2NvbXBvbmVudHMvQ29tbWVudHMuc3ZlbHRlIiwiLi4vLi4vLi4vc3JjL2NvbXBvbmVudHMvS2V5d29yZENsb3VkLnN2ZWx0ZSIsIi4uLy4uLy4uL3NyYy9jb21wb25lbnRzL1N1YnNjcmliZXJEaXN0cmlidXRpb24uc3ZlbHRlIiwiLi4vLi4vLi4vc3JjL2NvbXBvbmVudHMvU3RyZWFtQ2FsZW5kYXJIZWF0bWFwLnN2ZWx0ZSIsIi4uLy4uLy4uL3NyYy9yb3V0ZXMvc3RyZWFtZXIvW2lkXS5zdmVsdGUiXSwic291cmNlc0NvbnRlbnQiOlsiLyoqXG4gKiBTcHJpbmd5IHYyLjcuMVxuICpcbiAqIENvcHlyaWdodCAoYykgMjAxMC0yMDEzIERlbm5pcyBIb3Rzb25cbiAqXG4gKiBQZXJtaXNzaW9uIGlzIGhlcmVieSBncmFudGVkLCBmcmVlIG9mIGNoYXJnZSwgdG8gYW55IHBlcnNvblxuICogb2J0YWluaW5nIGEgY29weSBvZiB0aGlzIHNvZnR3YXJlIGFuZCBhc3NvY2lhdGVkIGRvY3VtZW50YXRpb25cbiAqIGZpbGVzICh0aGUgXCJTb2Z0d2FyZVwiKSwgdG8gZGVhbCBpbiB0aGUgU29mdHdhcmUgd2l0aG91dFxuICogcmVzdHJpY3Rpb24sIGluY2x1ZGluZyB3aXRob3V0IGxpbWl0YXRpb24gdGhlIHJpZ2h0cyB0byB1c2UsXG4gKiBjb3B5LCBtb2RpZnksIG1lcmdlLCBwdWJsaXNoLCBkaXN0cmlidXRlLCBzdWJsaWNlbnNlLCBhbmQvb3Igc2VsbFxuICogY29waWVzIG9mIHRoZSBTb2Z0d2FyZSwgYW5kIHRvIHBlcm1pdCBwZXJzb25zIHRvIHdob20gdGhlXG4gKiBTb2Z0d2FyZSBpcyBmdXJuaXNoZWQgdG8gZG8gc28sIHN1YmplY3QgdG8gdGhlIGZvbGxvd2luZ1xuICogY29uZGl0aW9uczpcbiAqXG4gKiBUaGUgYWJvdmUgY29weXJpZ2h0IG5vdGljZSBhbmQgdGhpcyBwZXJtaXNzaW9uIG5vdGljZSBzaGFsbCBiZVxuICogaW5jbHVkZWQgaW4gYWxsIGNvcGllcyBvciBzdWJzdGFudGlhbCBwb3J0aW9ucyBvZiB0aGUgU29mdHdhcmUuXG4gKlxuICogVEhFIFNPRlRXQVJFIElTIFBST1ZJREVEIFwiQVMgSVNcIiwgV0lUSE9VVCBXQVJSQU5UWSBPRiBBTlkgS0lORCxcbiAqIEVYUFJFU1MgT1IgSU1QTElFRCwgSU5DTFVESU5HIEJVVCBOT1QgTElNSVRFRCBUTyBUSEUgV0FSUkFOVElFU1xuICogT0YgTUVSQ0hBTlRBQklMSVRZLCBGSVRORVNTIEZPUiBBIFBBUlRJQ1VMQVIgUFVSUE9TRSBBTkRcbiAqIE5PTklORlJJTkdFTUVOVC4gSU4gTk8gRVZFTlQgU0hBTEwgVEhFIEFVVEhPUlMgT1IgQ09QWVJJR0hUXG4gKiBIT0xERVJTIEJFIExJQUJMRSBGT1IgQU5ZIENMQUlNLCBEQU1BR0VTIE9SIE9USEVSIExJQUJJTElUWSxcbiAqIFdIRVRIRVIgSU4gQU4gQUNUSU9OIE9GIENPTlRSQUNULCBUT1JUIE9SIE9USEVSV0lTRSwgQVJJU0lOR1xuICogRlJPTSwgT1VUIE9GIE9SIElOIENPTk5FQ1RJT04gV0lUSCBUSEUgU09GVFdBUkUgT1IgVEhFIFVTRSBPUlxuICogT1RIRVIgREVBTElOR1MgSU4gVEhFIFNPRlRXQVJFLlxuICovXG5leHBvcnQgY29uc3QgU3ByaW5neSA9IChmdW5jdGlvbiAoKSB7XG5cblx0dmFyIFNwcmluZ3kgPSB7fTtcblxuXHR2YXIgR3JhcGggPSBTcHJpbmd5LkdyYXBoID0gZnVuY3Rpb24oKSB7XG5cdFx0dGhpcy5ub2RlU2V0ID0ge307XG5cdFx0dGhpcy5ub2RlcyA9IFtdO1xuXHRcdHRoaXMuZWRnZXMgPSBbXTtcblx0XHR0aGlzLmFkamFjZW5jeSA9IHt9O1xuXG5cdFx0dGhpcy5uZXh0Tm9kZUlkID0gMDtcblx0XHR0aGlzLm5leHRFZGdlSWQgPSAwO1xuXHRcdHRoaXMuZXZlbnRMaXN0ZW5lcnMgPSBbXTtcblx0fTtcblxuXHR2YXIgTm9kZSA9IFNwcmluZ3kuTm9kZSA9IGZ1bmN0aW9uKGlkLCBkYXRhKSB7XG5cdFx0dGhpcy5pZCA9IGlkO1xuXHRcdHRoaXMuZGF0YSA9IChkYXRhICE9PSB1bmRlZmluZWQpID8gZGF0YSA6IHt9O1xuXG5cdC8vIERhdGEgZmllbGRzIHVzZWQgYnkgbGF5b3V0IGFsZ29yaXRobSBpbiB0aGlzIGZpbGU6XG5cdC8vIHRoaXMuZGF0YS5tYXNzXG5cdC8vIERhdGEgdXNlZCBieSBkZWZhdWx0IHJlbmRlcmVyIGluIHNwcmluZ3l1aS5qc1xuXHQvLyB0aGlzLmRhdGEubGFiZWxcblx0fTtcblxuXHR2YXIgRWRnZSA9IFNwcmluZ3kuRWRnZSA9IGZ1bmN0aW9uKGlkLCBzb3VyY2UsIHRhcmdldCwgZGF0YSkge1xuXHRcdHRoaXMuaWQgPSBpZDtcblx0XHR0aGlzLnNvdXJjZSA9IHNvdXJjZTtcblx0XHR0aGlzLnRhcmdldCA9IHRhcmdldDtcblx0XHR0aGlzLmRhdGEgPSAoZGF0YSAhPT0gdW5kZWZpbmVkKSA/IGRhdGEgOiB7fTtcblxuXHQvLyBFZGdlIGRhdGEgZmllbGQgdXNlZCBieSBsYXlvdXQgYWxvcml0aG1cblx0Ly8gdGhpcy5kYXRhLmxlbmd0aFxuXHQvLyB0aGlzLmRhdGEudHlwZVxuXHR9O1xuXG5cdEdyYXBoLnByb3RvdHlwZS5hZGROb2RlID0gZnVuY3Rpb24obm9kZSkge1xuXHRcdGlmICghKG5vZGUuaWQgaW4gdGhpcy5ub2RlU2V0KSkge1xuXHRcdFx0dGhpcy5ub2Rlcy5wdXNoKG5vZGUpO1xuXHRcdH1cblxuXHRcdHRoaXMubm9kZVNldFtub2RlLmlkXSA9IG5vZGU7XG5cblx0XHR0aGlzLm5vdGlmeSgpO1xuXHRcdHJldHVybiBub2RlO1xuXHR9O1xuXG5cdEdyYXBoLnByb3RvdHlwZS5hZGROb2RlcyA9IGZ1bmN0aW9uKCkge1xuXHRcdC8vIGFjY2VwdHMgdmFyaWFibGUgbnVtYmVyIG9mIGFyZ3VtZW50cywgd2hlcmUgZWFjaCBhcmd1bWVudFxuXHRcdC8vIGlzIGEgc3RyaW5nIHRoYXQgYmVjb21lcyBib3RoIG5vZGUgaWRlbnRpZmllciBhbmQgbGFiZWxcblx0XHRmb3IgKHZhciBpID0gMDsgaSA8IGFyZ3VtZW50cy5sZW5ndGg7IGkrKykge1xuXHRcdFx0dmFyIG5hbWUgPSBhcmd1bWVudHNbaV07XG5cdFx0XHR2YXIgbm9kZSA9IG5ldyBOb2RlKG5hbWUsIHtsYWJlbDpuYW1lfSk7XG5cdFx0XHR0aGlzLmFkZE5vZGUobm9kZSk7XG5cdFx0fVxuXHR9O1xuXG5cdEdyYXBoLnByb3RvdHlwZS5hZGRFZGdlID0gZnVuY3Rpb24oZWRnZSkge1xuXHRcdHZhciBleGlzdHMgPSBmYWxzZTtcblx0XHR0aGlzLmVkZ2VzLmZvckVhY2goZnVuY3Rpb24oZSkge1xuXHRcdFx0aWYgKGVkZ2UuaWQgPT09IGUuaWQpIHsgZXhpc3RzID0gdHJ1ZTsgfVxuXHRcdH0pO1xuXG5cdFx0aWYgKCFleGlzdHMpIHtcblx0XHRcdHRoaXMuZWRnZXMucHVzaChlZGdlKTtcblx0XHR9XG5cblx0XHRpZiAoIShlZGdlLnNvdXJjZS5pZCBpbiB0aGlzLmFkamFjZW5jeSkpIHtcblx0XHRcdHRoaXMuYWRqYWNlbmN5W2VkZ2Uuc291cmNlLmlkXSA9IHt9O1xuXHRcdH1cblx0XHRpZiAoIShlZGdlLnRhcmdldC5pZCBpbiB0aGlzLmFkamFjZW5jeVtlZGdlLnNvdXJjZS5pZF0pKSB7XG5cdFx0XHR0aGlzLmFkamFjZW5jeVtlZGdlLnNvdXJjZS5pZF1bZWRnZS50YXJnZXQuaWRdID0gW107XG5cdFx0fVxuXG5cdFx0ZXhpc3RzID0gZmFsc2U7XG5cdFx0dGhpcy5hZGphY2VuY3lbZWRnZS5zb3VyY2UuaWRdW2VkZ2UudGFyZ2V0LmlkXS5mb3JFYWNoKGZ1bmN0aW9uKGUpIHtcblx0XHRcdFx0aWYgKGVkZ2UuaWQgPT09IGUuaWQpIHsgZXhpc3RzID0gdHJ1ZTsgfVxuXHRcdH0pO1xuXG5cdFx0aWYgKCFleGlzdHMpIHtcblx0XHRcdHRoaXMuYWRqYWNlbmN5W2VkZ2Uuc291cmNlLmlkXVtlZGdlLnRhcmdldC5pZF0ucHVzaChlZGdlKTtcblx0XHR9XG5cblx0XHR0aGlzLm5vdGlmeSgpO1xuXHRcdHJldHVybiBlZGdlO1xuXHR9O1xuXG5cdEdyYXBoLnByb3RvdHlwZS5hZGRFZGdlcyA9IGZ1bmN0aW9uKCkge1xuXHRcdC8vIGFjY2VwdHMgdmFyaWFibGUgbnVtYmVyIG9mIGFyZ3VtZW50cywgd2hlcmUgZWFjaCBhcmd1bWVudFxuXHRcdC8vIGlzIGEgdHJpcGxlIFtub2RlaWQxLCBub2RlaWQyLCBhdHRyaWJ1dGVzXVxuXHRcdGZvciAodmFyIGkgPSAwOyBpIDwgYXJndW1lbnRzLmxlbmd0aDsgaSsrKSB7XG5cdFx0XHR2YXIgZSA9IGFyZ3VtZW50c1tpXTtcblx0XHRcdHZhciBub2RlMSA9IHRoaXMubm9kZVNldFtlWzBdXTtcblx0XHRcdGlmIChub2RlMSA9PSB1bmRlZmluZWQpIHtcblx0XHRcdFx0dGhyb3cgbmV3IFR5cGVFcnJvcihcImludmFsaWQgbm9kZSBuYW1lOiBcIiArIGVbMF0pO1xuXHRcdFx0fVxuXHRcdFx0dmFyIG5vZGUyID0gdGhpcy5ub2RlU2V0W2VbMV1dO1xuXHRcdFx0aWYgKG5vZGUyID09IHVuZGVmaW5lZCkge1xuXHRcdFx0XHR0aHJvdyBuZXcgVHlwZUVycm9yKFwiaW52YWxpZCBub2RlIG5hbWU6IFwiICsgZVsxXSk7XG5cdFx0XHR9XG5cdFx0XHR2YXIgYXR0ciA9IGVbMl07XG5cblx0XHRcdHRoaXMubmV3RWRnZShub2RlMSwgbm9kZTIsIGF0dHIpO1xuXHRcdH1cblx0fTtcblxuXHRHcmFwaC5wcm90b3R5cGUubmV3Tm9kZSA9IGZ1bmN0aW9uKGRhdGEpIHtcblx0XHR2YXIgbm9kZSA9IG5ldyBOb2RlKHRoaXMubmV4dE5vZGVJZCsrLCBkYXRhKTtcblx0XHR0aGlzLmFkZE5vZGUobm9kZSk7XG5cdFx0cmV0dXJuIG5vZGU7XG5cdH07XG5cblx0R3JhcGgucHJvdG90eXBlLm5ld0VkZ2UgPSBmdW5jdGlvbihzb3VyY2UsIHRhcmdldCwgZGF0YSkge1xuXHRcdHZhciBlZGdlID0gbmV3IEVkZ2UodGhpcy5uZXh0RWRnZUlkKyssIHNvdXJjZSwgdGFyZ2V0LCBkYXRhKTtcblx0XHR0aGlzLmFkZEVkZ2UoZWRnZSk7XG5cdFx0cmV0dXJuIGVkZ2U7XG5cdH07XG5cblxuXHQvLyBhZGQgbm9kZXMgYW5kIGVkZ2VzIGZyb20gSlNPTiBvYmplY3Rcblx0R3JhcGgucHJvdG90eXBlLmxvYWRKU09OID0gZnVuY3Rpb24oanNvbikge1xuXHQvKipcblx0U3ByaW5neSdzIHNpbXBsZSBKU09OIGZvcm1hdCBmb3IgZ3JhcGhzLlxuXHRoaXN0b3JpY2FsbHksIFNwcmluZ3kgdXNlcyBzZXBhcmF0ZSBsaXN0c1xuXHRvZiBub2RlcyBhbmQgZWRnZXM6XG5cdFx0e1xuXHRcdFx0XCJub2Rlc1wiOiBbXG5cdFx0XHRcdFwiY2VudGVyXCIsXG5cdFx0XHRcdFwibGVmdFwiLFxuXHRcdFx0XHRcInJpZ2h0XCIsXG5cdFx0XHRcdFwidXBcIixcblx0XHRcdFx0XCJzYXRlbGxpdGVcIlxuXHRcdFx0XSxcblx0XHRcdFwiZWRnZXNcIjogW1xuXHRcdFx0XHRbXCJjZW50ZXJcIiwgXCJsZWZ0XCJdLFxuXHRcdFx0XHRbXCJjZW50ZXJcIiwgXCJyaWdodFwiXSxcblx0XHRcdFx0W1wiY2VudGVyXCIsIFwidXBcIl1cblx0XHRcdF1cblx0XHR9XG5cdCoqL1xuXHRcdC8vIHBhcnNlIGlmIGEgc3RyaW5nIGlzIHBhc3NlZCAoRUM1KyBicm93c2Vycylcblx0XHRpZiAodHlwZW9mIGpzb24gPT0gJ3N0cmluZycgfHwganNvbiBpbnN0YW5jZW9mIFN0cmluZykge1xuXHRcdFx0anNvbiA9IEpTT04ucGFyc2UoIGpzb24gKTtcblx0XHR9XG5cblx0XHRpZiAoJ25vZGVzJyBpbiBqc29uIHx8ICdlZGdlcycgaW4ganNvbikge1xuXHRcdFx0dGhpcy5hZGROb2Rlcy5hcHBseSh0aGlzLCBqc29uWydub2RlcyddKTtcblx0XHRcdHRoaXMuYWRkRWRnZXMuYXBwbHkodGhpcywganNvblsnZWRnZXMnXSk7XG5cdFx0fVxuXHR9XG5cblxuXHQvLyBmaW5kIHRoZSBlZGdlcyBmcm9tIG5vZGUxIHRvIG5vZGUyXG5cdEdyYXBoLnByb3RvdHlwZS5nZXRFZGdlcyA9IGZ1bmN0aW9uKG5vZGUxLCBub2RlMikge1xuXHRcdGlmIChub2RlMS5pZCBpbiB0aGlzLmFkamFjZW5jeVxuXHRcdFx0JiYgbm9kZTIuaWQgaW4gdGhpcy5hZGphY2VuY3lbbm9kZTEuaWRdKSB7XG5cdFx0XHRyZXR1cm4gdGhpcy5hZGphY2VuY3lbbm9kZTEuaWRdW25vZGUyLmlkXTtcblx0XHR9XG5cblx0XHRyZXR1cm4gW107XG5cdH07XG5cblx0Ly8gcmVtb3ZlIGEgbm9kZSBhbmQgaXQncyBhc3NvY2lhdGVkIGVkZ2VzIGZyb20gdGhlIGdyYXBoXG5cdEdyYXBoLnByb3RvdHlwZS5yZW1vdmVOb2RlID0gZnVuY3Rpb24obm9kZSkge1xuXHRcdGlmIChub2RlLmlkIGluIHRoaXMubm9kZVNldCkge1xuXHRcdFx0ZGVsZXRlIHRoaXMubm9kZVNldFtub2RlLmlkXTtcblx0XHR9XG5cblx0XHRmb3IgKHZhciBpID0gdGhpcy5ub2Rlcy5sZW5ndGggLSAxOyBpID49IDA7IGktLSkge1xuXHRcdFx0aWYgKHRoaXMubm9kZXNbaV0uaWQgPT09IG5vZGUuaWQpIHtcblx0XHRcdFx0dGhpcy5ub2Rlcy5zcGxpY2UoaSwgMSk7XG5cdFx0XHR9XG5cdFx0fVxuXG5cdFx0dGhpcy5kZXRhY2hOb2RlKG5vZGUpO1xuXHR9O1xuXG5cdC8vIHJlbW92ZXMgZWRnZXMgYXNzb2NpYXRlZCB3aXRoIGEgZ2l2ZW4gbm9kZVxuXHRHcmFwaC5wcm90b3R5cGUuZGV0YWNoTm9kZSA9IGZ1bmN0aW9uKG5vZGUpIHtcblx0XHR2YXIgdG1wRWRnZXMgPSB0aGlzLmVkZ2VzLnNsaWNlKCk7XG5cdFx0dG1wRWRnZXMuZm9yRWFjaChmdW5jdGlvbihlKSB7XG5cdFx0XHRpZiAoZS5zb3VyY2UuaWQgPT09IG5vZGUuaWQgfHwgZS50YXJnZXQuaWQgPT09IG5vZGUuaWQpIHtcblx0XHRcdFx0dGhpcy5yZW1vdmVFZGdlKGUpO1xuXHRcdFx0fVxuXHRcdH0sIHRoaXMpO1xuXG5cdFx0dGhpcy5ub3RpZnkoKTtcblx0fTtcblxuXHQvLyByZW1vdmUgYSBub2RlIGFuZCBpdCdzIGFzc29jaWF0ZWQgZWRnZXMgZnJvbSB0aGUgZ3JhcGhcblx0R3JhcGgucHJvdG90eXBlLnJlbW92ZUVkZ2UgPSBmdW5jdGlvbihlZGdlKSB7XG5cdFx0Zm9yICh2YXIgaSA9IHRoaXMuZWRnZXMubGVuZ3RoIC0gMTsgaSA+PSAwOyBpLS0pIHtcblx0XHRcdGlmICh0aGlzLmVkZ2VzW2ldLmlkID09PSBlZGdlLmlkKSB7XG5cdFx0XHRcdHRoaXMuZWRnZXMuc3BsaWNlKGksIDEpO1xuXHRcdFx0fVxuXHRcdH1cblxuXHRcdGZvciAodmFyIHggaW4gdGhpcy5hZGphY2VuY3kpIHtcblx0XHRcdGZvciAodmFyIHkgaW4gdGhpcy5hZGphY2VuY3lbeF0pIHtcblx0XHRcdFx0dmFyIGVkZ2VzID0gdGhpcy5hZGphY2VuY3lbeF1beV07XG5cblx0XHRcdFx0Zm9yICh2YXIgaj1lZGdlcy5sZW5ndGggLSAxOyBqPj0wOyBqLS0pIHtcblx0XHRcdFx0XHRpZiAodGhpcy5hZGphY2VuY3lbeF1beV1bal0uaWQgPT09IGVkZ2UuaWQpIHtcblx0XHRcdFx0XHRcdHRoaXMuYWRqYWNlbmN5W3hdW3ldLnNwbGljZShqLCAxKTtcblx0XHRcdFx0XHR9XG5cdFx0XHRcdH1cblxuXHRcdFx0XHQvLyBDbGVhbiB1cCBlbXB0eSBlZGdlIGFycmF5c1xuXHRcdFx0XHRpZiAodGhpcy5hZGphY2VuY3lbeF1beV0ubGVuZ3RoID09IDApIHtcblx0XHRcdFx0XHRkZWxldGUgdGhpcy5hZGphY2VuY3lbeF1beV07XG5cdFx0XHRcdH1cblx0XHRcdH1cblxuXHRcdFx0Ly8gQ2xlYW4gdXAgZW1wdHkgb2JqZWN0c1xuXHRcdFx0aWYgKGlzRW1wdHkodGhpcy5hZGphY2VuY3lbeF0pKSB7XG5cdFx0XHRcdGRlbGV0ZSB0aGlzLmFkamFjZW5jeVt4XTtcblx0XHRcdH1cblx0XHR9XG5cblx0XHR0aGlzLm5vdGlmeSgpO1xuXHR9O1xuXG5cdC8qIE1lcmdlIGEgbGlzdCBvZiBub2RlcyBhbmQgZWRnZXMgaW50byB0aGUgY3VycmVudCBncmFwaC4gZWcuXG5cdHZhciBvID0ge1xuXHRcdG5vZGVzOiBbXG5cdFx0XHR7aWQ6IDEyMywgZGF0YToge3R5cGU6ICd1c2VyJywgdXNlcmlkOiAxMjMsIGRpc3BsYXluYW1lOiAnYWFhJ319LFxuXHRcdFx0e2lkOiAyMzQsIGRhdGE6IHt0eXBlOiAndXNlcicsIHVzZXJpZDogMjM0LCBkaXNwbGF5bmFtZTogJ2JiYid9fVxuXHRcdF0sXG5cdFx0ZWRnZXM6IFtcblx0XHRcdHtmcm9tOiAwLCB0bzogMSwgdHlwZTogJ3N1Ym1pdHRlZF9kZXNpZ24nLCBkaXJlY3RlZDogdHJ1ZSwgZGF0YToge3dlaWdodDogfX1cblx0XHRdXG5cdH1cblx0Ki9cblx0R3JhcGgucHJvdG90eXBlLm1lcmdlID0gZnVuY3Rpb24oZGF0YSkge1xuXHRcdHZhciBub2RlcyA9IFtdO1xuXHRcdGRhdGEubm9kZXMuZm9yRWFjaChmdW5jdGlvbihuKSB7XG5cdFx0XHRub2Rlcy5wdXNoKHRoaXMuYWRkTm9kZShuZXcgTm9kZShuLmlkLCBuLmRhdGEpKSk7XG5cdFx0fSwgdGhpcyk7XG5cblx0XHRkYXRhLmVkZ2VzLmZvckVhY2goZnVuY3Rpb24oZSkge1xuXHRcdFx0dmFyIGZyb20gPSBub2Rlc1tlLmZyb21dO1xuXHRcdFx0dmFyIHRvID0gbm9kZXNbZS50b107XG5cblx0XHRcdHZhciBpZCA9IChlLmRpcmVjdGVkKVxuXHRcdFx0XHQ/IChpZCA9IGUudHlwZSArIFwiLVwiICsgZnJvbS5pZCArIFwiLVwiICsgdG8uaWQpXG5cdFx0XHRcdDogKGZyb20uaWQgPCB0by5pZCkgLy8gbm9ybWFsaXNlIGlkIGZvciBub24tZGlyZWN0ZWQgZWRnZXNcblx0XHRcdFx0XHQ/IGUudHlwZSArIFwiLVwiICsgZnJvbS5pZCArIFwiLVwiICsgdG8uaWRcblx0XHRcdFx0XHQ6IGUudHlwZSArIFwiLVwiICsgdG8uaWQgKyBcIi1cIiArIGZyb20uaWQ7XG5cblx0XHRcdHZhciBlZGdlID0gdGhpcy5hZGRFZGdlKG5ldyBFZGdlKGlkLCBmcm9tLCB0bywgZS5kYXRhKSk7XG5cdFx0XHRlZGdlLmRhdGEudHlwZSA9IGUudHlwZTtcblx0XHR9LCB0aGlzKTtcblx0fTtcblxuXHRHcmFwaC5wcm90b3R5cGUuZmlsdGVyTm9kZXMgPSBmdW5jdGlvbihmbikge1xuXHRcdHZhciB0bXBOb2RlcyA9IHRoaXMubm9kZXMuc2xpY2UoKTtcblx0XHR0bXBOb2Rlcy5mb3JFYWNoKGZ1bmN0aW9uKG4pIHtcblx0XHRcdGlmICghZm4obikpIHtcblx0XHRcdFx0dGhpcy5yZW1vdmVOb2RlKG4pO1xuXHRcdFx0fVxuXHRcdH0sIHRoaXMpO1xuXHR9O1xuXG5cdEdyYXBoLnByb3RvdHlwZS5maWx0ZXJFZGdlcyA9IGZ1bmN0aW9uKGZuKSB7XG5cdFx0dmFyIHRtcEVkZ2VzID0gdGhpcy5lZGdlcy5zbGljZSgpO1xuXHRcdHRtcEVkZ2VzLmZvckVhY2goZnVuY3Rpb24oZSkge1xuXHRcdFx0aWYgKCFmbihlKSkge1xuXHRcdFx0XHR0aGlzLnJlbW92ZUVkZ2UoZSk7XG5cdFx0XHR9XG5cdFx0fSwgdGhpcyk7XG5cdH07XG5cblxuXHRHcmFwaC5wcm90b3R5cGUuYWRkR3JhcGhMaXN0ZW5lciA9IGZ1bmN0aW9uKG9iaikge1xuXHRcdHRoaXMuZXZlbnRMaXN0ZW5lcnMucHVzaChvYmopO1xuXHR9O1xuXG5cdEdyYXBoLnByb3RvdHlwZS5ub3RpZnkgPSBmdW5jdGlvbigpIHtcblx0XHR0aGlzLmV2ZW50TGlzdGVuZXJzLmZvckVhY2goZnVuY3Rpb24ob2JqKXtcblx0XHRcdG9iai5ncmFwaENoYW5nZWQoKTtcblx0XHR9KTtcblx0fTtcblxuXHQvLyAtLS0tLS0tLS0tLVxuXHR2YXIgTGF5b3V0ID0gU3ByaW5neS5MYXlvdXQgPSB7fTtcblx0TGF5b3V0LkZvcmNlRGlyZWN0ZWQgPSBmdW5jdGlvbihncmFwaCwgc3RpZmZuZXNzLCByZXB1bHNpb24sIGRhbXBpbmcsIG1pbkVuZXJneVRocmVzaG9sZCwgbWF4U3BlZWQpIHtcblx0XHR0aGlzLmdyYXBoID0gZ3JhcGg7XG5cdFx0dGhpcy5zdGlmZm5lc3MgPSBzdGlmZm5lc3M7IC8vIHNwcmluZyBzdGlmZm5lc3MgY29uc3RhbnRcblx0XHR0aGlzLnJlcHVsc2lvbiA9IHJlcHVsc2lvbjsgLy8gcmVwdWxzaW9uIGNvbnN0YW50XG5cdFx0dGhpcy5kYW1waW5nID0gZGFtcGluZzsgLy8gdmVsb2NpdHkgZGFtcGluZyBmYWN0b3Jcblx0XHR0aGlzLm1pbkVuZXJneVRocmVzaG9sZCA9IG1pbkVuZXJneVRocmVzaG9sZCB8fCAwLjAxOyAvL3RocmVzaG9sZCB1c2VkIHRvIGRldGVybWluZSByZW5kZXIgc3RvcFxuXHRcdHRoaXMubWF4U3BlZWQgPSBtYXhTcGVlZCB8fCBJbmZpbml0eTsgLy8gbm9kZXMgYXJlbid0IGFsbG93ZWQgdG8gZXhjZWVkIHRoaXMgc3BlZWRcblxuXHRcdHRoaXMubm9kZVBvaW50cyA9IHt9OyAvLyBrZWVwIHRyYWNrIG9mIHBvaW50cyBhc3NvY2lhdGVkIHdpdGggbm9kZXNcblx0XHR0aGlzLmVkZ2VTcHJpbmdzID0ge307IC8vIGtlZXAgdHJhY2sgb2Ygc3ByaW5ncyBhc3NvY2lhdGVkIHdpdGggZWRnZXNcblx0fTtcblxuXHRMYXlvdXQuRm9yY2VEaXJlY3RlZC5wcm90b3R5cGUucG9pbnQgPSBmdW5jdGlvbihub2RlKSB7XG5cdFx0aWYgKCEobm9kZS5pZCBpbiB0aGlzLm5vZGVQb2ludHMpKSB7XG5cdFx0XHR2YXIgbWFzcyA9IChub2RlLmRhdGEubWFzcyAhPT0gdW5kZWZpbmVkKSA/IG5vZGUuZGF0YS5tYXNzIDogMS4wO1xuXHRcdFx0dGhpcy5ub2RlUG9pbnRzW25vZGUuaWRdID0gbmV3IExheW91dC5Gb3JjZURpcmVjdGVkLlBvaW50KFZlY3Rvci5yYW5kb20oKSwgbWFzcyk7XG5cdFx0fVxuXG5cdFx0cmV0dXJuIHRoaXMubm9kZVBvaW50c1tub2RlLmlkXTtcblx0fTtcblxuXHRMYXlvdXQuRm9yY2VEaXJlY3RlZC5wcm90b3R5cGUuc3ByaW5nID0gZnVuY3Rpb24oZWRnZSkge1xuXHRcdGlmICghKGVkZ2UuaWQgaW4gdGhpcy5lZGdlU3ByaW5ncykpIHtcblx0XHRcdHZhciBsZW5ndGggPSAoZWRnZS5kYXRhLmxlbmd0aCAhPT0gdW5kZWZpbmVkKSA/IGVkZ2UuZGF0YS5sZW5ndGggOiAxLjA7XG5cblx0XHRcdHZhciBleGlzdGluZ1NwcmluZyA9IGZhbHNlO1xuXG5cdFx0XHR2YXIgZnJvbSA9IHRoaXMuZ3JhcGguZ2V0RWRnZXMoZWRnZS5zb3VyY2UsIGVkZ2UudGFyZ2V0KTtcblx0XHRcdGZyb20uZm9yRWFjaChmdW5jdGlvbihlKSB7XG5cdFx0XHRcdGlmIChleGlzdGluZ1NwcmluZyA9PT0gZmFsc2UgJiYgZS5pZCBpbiB0aGlzLmVkZ2VTcHJpbmdzKSB7XG5cdFx0XHRcdFx0ZXhpc3RpbmdTcHJpbmcgPSB0aGlzLmVkZ2VTcHJpbmdzW2UuaWRdO1xuXHRcdFx0XHR9XG5cdFx0XHR9LCB0aGlzKTtcblxuXHRcdFx0aWYgKGV4aXN0aW5nU3ByaW5nICE9PSBmYWxzZSkge1xuXHRcdFx0XHRyZXR1cm4gbmV3IExheW91dC5Gb3JjZURpcmVjdGVkLlNwcmluZyhleGlzdGluZ1NwcmluZy5wb2ludDEsIGV4aXN0aW5nU3ByaW5nLnBvaW50MiwgMC4wLCAwLjApO1xuXHRcdFx0fVxuXG5cdFx0XHR2YXIgdG8gPSB0aGlzLmdyYXBoLmdldEVkZ2VzKGVkZ2UudGFyZ2V0LCBlZGdlLnNvdXJjZSk7XG5cdFx0XHRmcm9tLmZvckVhY2goZnVuY3Rpb24oZSl7XG5cdFx0XHRcdGlmIChleGlzdGluZ1NwcmluZyA9PT0gZmFsc2UgJiYgZS5pZCBpbiB0aGlzLmVkZ2VTcHJpbmdzKSB7XG5cdFx0XHRcdFx0ZXhpc3RpbmdTcHJpbmcgPSB0aGlzLmVkZ2VTcHJpbmdzW2UuaWRdO1xuXHRcdFx0XHR9XG5cdFx0XHR9LCB0aGlzKTtcblxuXHRcdFx0aWYgKGV4aXN0aW5nU3ByaW5nICE9PSBmYWxzZSkge1xuXHRcdFx0XHRyZXR1cm4gbmV3IExheW91dC5Gb3JjZURpcmVjdGVkLlNwcmluZyhleGlzdGluZ1NwcmluZy5wb2ludDIsIGV4aXN0aW5nU3ByaW5nLnBvaW50MSwgMC4wLCAwLjApO1xuXHRcdFx0fVxuXG5cdFx0XHR0aGlzLmVkZ2VTcHJpbmdzW2VkZ2UuaWRdID0gbmV3IExheW91dC5Gb3JjZURpcmVjdGVkLlNwcmluZyhcblx0XHRcdFx0dGhpcy5wb2ludChlZGdlLnNvdXJjZSksIHRoaXMucG9pbnQoZWRnZS50YXJnZXQpLCBsZW5ndGgsIHRoaXMuc3RpZmZuZXNzXG5cdFx0XHQpO1xuXHRcdH1cblxuXHRcdHJldHVybiB0aGlzLmVkZ2VTcHJpbmdzW2VkZ2UuaWRdO1xuXHR9O1xuXG5cdC8vIGNhbGxiYWNrIHNob3VsZCBhY2NlcHQgdHdvIGFyZ3VtZW50czogTm9kZSwgUG9pbnRcblx0TGF5b3V0LkZvcmNlRGlyZWN0ZWQucHJvdG90eXBlLmVhY2hOb2RlID0gZnVuY3Rpb24oY2FsbGJhY2spIHtcblx0XHR2YXIgdCA9IHRoaXM7XG5cdFx0dGhpcy5ncmFwaC5ub2Rlcy5mb3JFYWNoKGZ1bmN0aW9uKG4pe1xuXHRcdFx0Y2FsbGJhY2suY2FsbCh0LCBuLCB0LnBvaW50KG4pKTtcblx0XHR9KTtcblx0fTtcblxuXHQvLyBjYWxsYmFjayBzaG91bGQgYWNjZXB0IHR3byBhcmd1bWVudHM6IEVkZ2UsIFNwcmluZ1xuXHRMYXlvdXQuRm9yY2VEaXJlY3RlZC5wcm90b3R5cGUuZWFjaEVkZ2UgPSBmdW5jdGlvbihjYWxsYmFjaykge1xuXHRcdHZhciB0ID0gdGhpcztcblx0XHR0aGlzLmdyYXBoLmVkZ2VzLmZvckVhY2goZnVuY3Rpb24oZSl7XG5cdFx0XHRjYWxsYmFjay5jYWxsKHQsIGUsIHQuc3ByaW5nKGUpKTtcblx0XHR9KTtcblx0fTtcblxuXHQvLyBjYWxsYmFjayBzaG91bGQgYWNjZXB0IG9uZSBhcmd1bWVudDogU3ByaW5nXG5cdExheW91dC5Gb3JjZURpcmVjdGVkLnByb3RvdHlwZS5lYWNoU3ByaW5nID0gZnVuY3Rpb24oY2FsbGJhY2spIHtcblx0XHR2YXIgdCA9IHRoaXM7XG5cdFx0dGhpcy5ncmFwaC5lZGdlcy5mb3JFYWNoKGZ1bmN0aW9uKGUpe1xuXHRcdFx0Y2FsbGJhY2suY2FsbCh0LCB0LnNwcmluZyhlKSk7XG5cdFx0fSk7XG5cdH07XG5cblxuXHQvLyBQaHlzaWNzIHN0dWZmXG5cdExheW91dC5Gb3JjZURpcmVjdGVkLnByb3RvdHlwZS5hcHBseUNvdWxvbWJzTGF3ID0gZnVuY3Rpb24oKSB7XG5cdFx0dGhpcy5lYWNoTm9kZShmdW5jdGlvbihuMSwgcG9pbnQxKSB7XG5cdFx0XHR0aGlzLmVhY2hOb2RlKGZ1bmN0aW9uKG4yLCBwb2ludDIpIHtcblx0XHRcdFx0aWYgKHBvaW50MSAhPT0gcG9pbnQyKVxuXHRcdFx0XHR7XG5cdFx0XHRcdFx0dmFyIGQgPSBwb2ludDEucC5zdWJ0cmFjdChwb2ludDIucCk7XG5cdFx0XHRcdFx0dmFyIGRpc3RhbmNlID0gZC5tYWduaXR1ZGUoKSArIDAuMTsgLy8gYXZvaWQgbWFzc2l2ZSBmb3JjZXMgYXQgc21hbGwgZGlzdGFuY2VzIChhbmQgZGl2aWRlIGJ5IHplcm8pXG5cdFx0XHRcdFx0dmFyIGRpcmVjdGlvbiA9IGQubm9ybWFsaXNlKCk7XG5cblx0XHRcdFx0XHQvLyBhcHBseSBmb3JjZSB0byBlYWNoIGVuZCBwb2ludFxuXHRcdFx0XHRcdHBvaW50MS5hcHBseUZvcmNlKGRpcmVjdGlvbi5tdWx0aXBseSh0aGlzLnJlcHVsc2lvbikuZGl2aWRlKGRpc3RhbmNlICogZGlzdGFuY2UgKiAwLjUpKTtcblx0XHRcdFx0XHRwb2ludDIuYXBwbHlGb3JjZShkaXJlY3Rpb24ubXVsdGlwbHkodGhpcy5yZXB1bHNpb24pLmRpdmlkZShkaXN0YW5jZSAqIGRpc3RhbmNlICogLTAuNSkpO1xuXHRcdFx0XHR9XG5cdFx0XHR9KTtcblx0XHR9KTtcblx0fTtcblxuXHRMYXlvdXQuRm9yY2VEaXJlY3RlZC5wcm90b3R5cGUuYXBwbHlIb29rZXNMYXcgPSBmdW5jdGlvbigpIHtcblx0XHR0aGlzLmVhY2hTcHJpbmcoZnVuY3Rpb24oc3ByaW5nKXtcblx0XHRcdHZhciBkID0gc3ByaW5nLnBvaW50Mi5wLnN1YnRyYWN0KHNwcmluZy5wb2ludDEucCk7IC8vIHRoZSBkaXJlY3Rpb24gb2YgdGhlIHNwcmluZ1xuXHRcdFx0dmFyIGRpc3BsYWNlbWVudCA9IHNwcmluZy5sZW5ndGggLSBkLm1hZ25pdHVkZSgpO1xuXHRcdFx0dmFyIGRpcmVjdGlvbiA9IGQubm9ybWFsaXNlKCk7XG5cblx0XHRcdC8vIGFwcGx5IGZvcmNlIHRvIGVhY2ggZW5kIHBvaW50XG5cdFx0XHRzcHJpbmcucG9pbnQxLmFwcGx5Rm9yY2UoZGlyZWN0aW9uLm11bHRpcGx5KHNwcmluZy5rICogZGlzcGxhY2VtZW50ICogLTAuNSkpO1xuXHRcdFx0c3ByaW5nLnBvaW50Mi5hcHBseUZvcmNlKGRpcmVjdGlvbi5tdWx0aXBseShzcHJpbmcuayAqIGRpc3BsYWNlbWVudCAqIDAuNSkpO1xuXHRcdH0pO1xuXHR9O1xuXG5cdExheW91dC5Gb3JjZURpcmVjdGVkLnByb3RvdHlwZS5hdHRyYWN0VG9DZW50cmUgPSBmdW5jdGlvbigpIHtcblx0XHR0aGlzLmVhY2hOb2RlKGZ1bmN0aW9uKG5vZGUsIHBvaW50KSB7XG5cdFx0XHR2YXIgZGlyZWN0aW9uID0gcG9pbnQucC5tdWx0aXBseSgtMS4wKTtcblx0XHRcdHBvaW50LmFwcGx5Rm9yY2UoZGlyZWN0aW9uLm11bHRpcGx5KHRoaXMucmVwdWxzaW9uIC8gNTAuMCkpO1xuXHRcdH0pO1xuXHR9O1xuXG5cblx0TGF5b3V0LkZvcmNlRGlyZWN0ZWQucHJvdG90eXBlLnVwZGF0ZVZlbG9jaXR5ID0gZnVuY3Rpb24odGltZXN0ZXApIHtcblx0XHR0aGlzLmVhY2hOb2RlKGZ1bmN0aW9uKG5vZGUsIHBvaW50KSB7XG5cdFx0XHQvLyBJcyB0aGlzLCBhbG9uZyB3aXRoIHVwZGF0ZVBvc2l0aW9uIGJlbG93LCB0aGUgb25seSBwbGFjZXMgdGhhdCB5b3VyXG5cdFx0XHQvLyBpbnRlZ3JhdGlvbiBjb2RlIGV4aXN0P1xuXHRcdFx0cG9pbnQudiA9IHBvaW50LnYuYWRkKHBvaW50LmEubXVsdGlwbHkodGltZXN0ZXApKS5tdWx0aXBseSh0aGlzLmRhbXBpbmcpO1xuXHRcdFx0aWYgKHBvaW50LnYubWFnbml0dWRlKCkgPiB0aGlzLm1heFNwZWVkKSB7XG5cdFx0XHQgICAgcG9pbnQudiA9IHBvaW50LnYubm9ybWFsaXNlKCkubXVsdGlwbHkodGhpcy5tYXhTcGVlZCk7XG5cdFx0XHR9XG5cdFx0XHRwb2ludC5hID0gbmV3IFZlY3RvcigwLDApO1xuXHRcdH0pO1xuXHR9O1xuXG5cdExheW91dC5Gb3JjZURpcmVjdGVkLnByb3RvdHlwZS51cGRhdGVQb3NpdGlvbiA9IGZ1bmN0aW9uKHRpbWVzdGVwKSB7XG5cdFx0dGhpcy5lYWNoTm9kZShmdW5jdGlvbihub2RlLCBwb2ludCkge1xuXHRcdFx0Ly8gU2FtZSBxdWVzdGlvbiBhcyBhYm92ZTsgYWxvbmcgd2l0aCB1cGRhdGVWZWxvY2l0eSwgaXMgdGhpcyBhbGwgb2Zcblx0XHRcdC8vIHlvdXIgaW50ZWdyYXRpb24gY29kZT9cblx0XHRcdHBvaW50LnAgPSBwb2ludC5wLmFkZChwb2ludC52Lm11bHRpcGx5KHRpbWVzdGVwKSk7XG5cdFx0fSk7XG5cdH07XG5cblx0Ly8gQ2FsY3VsYXRlIHRoZSB0b3RhbCBraW5ldGljIGVuZXJneSBvZiB0aGUgc3lzdGVtXG5cdExheW91dC5Gb3JjZURpcmVjdGVkLnByb3RvdHlwZS50b3RhbEVuZXJneSA9IGZ1bmN0aW9uKHRpbWVzdGVwKSB7XG5cdFx0dmFyIGVuZXJneSA9IDAuMDtcblx0XHR0aGlzLmVhY2hOb2RlKGZ1bmN0aW9uKG5vZGUsIHBvaW50KSB7XG5cdFx0XHR2YXIgc3BlZWQgPSBwb2ludC52Lm1hZ25pdHVkZSgpO1xuXHRcdFx0ZW5lcmd5ICs9IDAuNSAqIHBvaW50Lm0gKiBzcGVlZCAqIHNwZWVkO1xuXHRcdH0pO1xuXG5cdFx0cmV0dXJuIGVuZXJneTtcblx0fTtcblxuXHR2YXIgX19iaW5kID0gZnVuY3Rpb24oZm4sIG1lKXsgcmV0dXJuIGZ1bmN0aW9uKCl7IHJldHVybiBmbi5hcHBseShtZSwgYXJndW1lbnRzKTsgfTsgfTsgLy8gc3RvbGVuIGZyb20gY29mZmVlc2NyaXB0LCB0aGFua3MgamFzaGtlbmFzISA7LSlcblxuXHRTcHJpbmd5LnJlcXVlc3RBbmltYXRpb25GcmFtZSA9IF9fYmluZCgodGhpcyAmJiAodGhpcy5yZXF1ZXN0QW5pbWF0aW9uRnJhbWUgfHxcblx0XHR0aGlzLndlYmtpdFJlcXVlc3RBbmltYXRpb25GcmFtZSB8fFxuXHRcdHRoaXMubW96UmVxdWVzdEFuaW1hdGlvbkZyYW1lIHx8XG5cdFx0dGhpcy5vUmVxdWVzdEFuaW1hdGlvbkZyYW1lIHx8XG5cdFx0dGhpcy5tc1JlcXVlc3RBbmltYXRpb25GcmFtZSkpIHx8XG5cdFx0KGZ1bmN0aW9uKGNhbGxiYWNrLCBlbGVtZW50KSB7XG5cdFx0XHRzZXRUaW1lb3V0KGNhbGxiYWNrLCAxMCk7XG5cdFx0fSksIHRoaXMpO1xuXG5cblx0LyoqXG5cdCAqIFN0YXJ0IHNpbXVsYXRpb24gaWYgaXQncyBub3QgcnVubmluZyBhbHJlYWR5LlxuXHQgKiBJbiBjYXNlIGl0J3MgcnVubmluZyB0aGVuIHRoZSBjYWxsIGlzIGlnbm9yZWQsIGFuZCBub25lIG9mIHRoZSBjYWxsYmFja3MgcGFzc2VkIGlzIGV2ZXIgZXhlY3V0ZWQuXG5cdCAqL1xuXHRMYXlvdXQuRm9yY2VEaXJlY3RlZC5wcm90b3R5cGUuc3RhcnQgPSBmdW5jdGlvbihyZW5kZXIsIG9uUmVuZGVyU3RvcCwgb25SZW5kZXJTdGFydCkge1xuXHRcdHZhciB0ID0gdGhpcztcblxuXHRcdGlmICh0aGlzLl9zdGFydGVkKSByZXR1cm47XG5cdFx0dGhpcy5fc3RhcnRlZCA9IHRydWU7XG5cdFx0dGhpcy5fc3RvcCA9IGZhbHNlO1xuXG5cdFx0aWYgKG9uUmVuZGVyU3RhcnQgIT09IHVuZGVmaW5lZCkgeyBvblJlbmRlclN0YXJ0KCk7IH1cblxuXHRcdFNwcmluZ3kucmVxdWVzdEFuaW1hdGlvbkZyYW1lKGZ1bmN0aW9uIHN0ZXAoKSB7XG5cdFx0XHR0LnRpY2soMC4wMyk7XG5cblx0XHRcdGlmIChyZW5kZXIgIT09IHVuZGVmaW5lZCkge1xuXHRcdFx0XHRyZW5kZXIoKTtcblx0XHRcdH1cblxuXHRcdFx0Ly8gc3RvcCBzaW11bGF0aW9uIHdoZW4gZW5lcmd5IG9mIHRoZSBzeXN0ZW0gZ29lcyBiZWxvdyBhIHRocmVzaG9sZFxuXHRcdFx0aWYgKHQuX3N0b3AgfHwgdC50b3RhbEVuZXJneSgpIDwgdC5taW5FbmVyZ3lUaHJlc2hvbGQpIHtcblx0XHRcdFx0dC5fc3RhcnRlZCA9IGZhbHNlO1xuXHRcdFx0XHRpZiAob25SZW5kZXJTdG9wICE9PSB1bmRlZmluZWQpIHsgb25SZW5kZXJTdG9wKCk7IH1cblx0XHRcdH0gZWxzZSB7XG5cdFx0XHRcdFNwcmluZ3kucmVxdWVzdEFuaW1hdGlvbkZyYW1lKHN0ZXApO1xuXHRcdFx0fVxuXHRcdH0pO1xuXHR9O1xuXG5cdExheW91dC5Gb3JjZURpcmVjdGVkLnByb3RvdHlwZS5zdG9wID0gZnVuY3Rpb24oKSB7XG5cdFx0dGhpcy5fc3RvcCA9IHRydWU7XG5cdH1cblxuXHRMYXlvdXQuRm9yY2VEaXJlY3RlZC5wcm90b3R5cGUudGljayA9IGZ1bmN0aW9uKHRpbWVzdGVwKSB7XG5cdFx0dGhpcy5hcHBseUNvdWxvbWJzTGF3KCk7XG5cdFx0dGhpcy5hcHBseUhvb2tlc0xhdygpO1xuXHRcdHRoaXMuYXR0cmFjdFRvQ2VudHJlKCk7XG5cdFx0dGhpcy51cGRhdGVWZWxvY2l0eSh0aW1lc3RlcCk7XG5cdFx0dGhpcy51cGRhdGVQb3NpdGlvbih0aW1lc3RlcCk7XG5cdH07XG5cblx0Ly8gRmluZCB0aGUgbmVhcmVzdCBwb2ludCB0byBhIHBhcnRpY3VsYXIgcG9zaXRpb25cblx0TGF5b3V0LkZvcmNlRGlyZWN0ZWQucHJvdG90eXBlLm5lYXJlc3QgPSBmdW5jdGlvbihwb3MpIHtcblx0XHR2YXIgbWluID0ge25vZGU6IG51bGwsIHBvaW50OiBudWxsLCBkaXN0YW5jZTogbnVsbH07XG5cdFx0dmFyIHQgPSB0aGlzO1xuXHRcdHRoaXMuZ3JhcGgubm9kZXMuZm9yRWFjaChmdW5jdGlvbihuKXtcblx0XHRcdHZhciBwb2ludCA9IHQucG9pbnQobik7XG5cdFx0XHR2YXIgZGlzdGFuY2UgPSBwb2ludC5wLnN1YnRyYWN0KHBvcykubWFnbml0dWRlKCk7XG5cblx0XHRcdGlmIChtaW4uZGlzdGFuY2UgPT09IG51bGwgfHwgZGlzdGFuY2UgPCBtaW4uZGlzdGFuY2UpIHtcblx0XHRcdFx0bWluID0ge25vZGU6IG4sIHBvaW50OiBwb2ludCwgZGlzdGFuY2U6IGRpc3RhbmNlfTtcblx0XHRcdH1cblx0XHR9KTtcblxuXHRcdHJldHVybiBtaW47XG5cdH07XG5cblx0Ly8gcmV0dXJucyBbYm90dG9tbGVmdCwgdG9wcmlnaHRdXG5cdExheW91dC5Gb3JjZURpcmVjdGVkLnByb3RvdHlwZS5nZXRCb3VuZGluZ0JveCA9IGZ1bmN0aW9uKCkge1xuXHRcdHZhciBib3R0b21sZWZ0ID0gbmV3IFZlY3RvcigtMiwtMik7XG5cdFx0dmFyIHRvcHJpZ2h0ID0gbmV3IFZlY3RvcigyLDIpO1xuXG5cdFx0dGhpcy5lYWNoTm9kZShmdW5jdGlvbihuLCBwb2ludCkge1xuXHRcdFx0aWYgKHBvaW50LnAueCA8IGJvdHRvbWxlZnQueCkge1xuXHRcdFx0XHRib3R0b21sZWZ0LnggPSBwb2ludC5wLng7XG5cdFx0XHR9XG5cdFx0XHRpZiAocG9pbnQucC55IDwgYm90dG9tbGVmdC55KSB7XG5cdFx0XHRcdGJvdHRvbWxlZnQueSA9IHBvaW50LnAueTtcblx0XHRcdH1cblx0XHRcdGlmIChwb2ludC5wLnggPiB0b3ByaWdodC54KSB7XG5cdFx0XHRcdHRvcHJpZ2h0LnggPSBwb2ludC5wLng7XG5cdFx0XHR9XG5cdFx0XHRpZiAocG9pbnQucC55ID4gdG9wcmlnaHQueSkge1xuXHRcdFx0XHR0b3ByaWdodC55ID0gcG9pbnQucC55O1xuXHRcdFx0fVxuXHRcdH0pO1xuXG5cdFx0dmFyIHBhZGRpbmcgPSB0b3ByaWdodC5zdWJ0cmFjdChib3R0b21sZWZ0KS5tdWx0aXBseSgwLjA3KTsgLy8gfjUlIHBhZGRpbmdcblxuXHRcdHJldHVybiB7Ym90dG9tbGVmdDogYm90dG9tbGVmdC5zdWJ0cmFjdChwYWRkaW5nKSwgdG9wcmlnaHQ6IHRvcHJpZ2h0LmFkZChwYWRkaW5nKX07XG5cdH07XG5cblxuXHQvLyBWZWN0b3Jcblx0dmFyIFZlY3RvciA9IFNwcmluZ3kuVmVjdG9yID0gZnVuY3Rpb24oeCwgeSkge1xuXHRcdHRoaXMueCA9IHg7XG5cdFx0dGhpcy55ID0geTtcblx0fTtcblxuXHRWZWN0b3IucmFuZG9tID0gZnVuY3Rpb24oKSB7XG5cdFx0cmV0dXJuIG5ldyBWZWN0b3IoMTAuMCAqIChNYXRoLnJhbmRvbSgpIC0gMC41KSwgMTAuMCAqIChNYXRoLnJhbmRvbSgpIC0gMC41KSk7XG5cdH07XG5cblx0VmVjdG9yLnByb3RvdHlwZS5hZGQgPSBmdW5jdGlvbih2Mikge1xuXHRcdHJldHVybiBuZXcgVmVjdG9yKHRoaXMueCArIHYyLngsIHRoaXMueSArIHYyLnkpO1xuXHR9O1xuXG5cdFZlY3Rvci5wcm90b3R5cGUuc3VidHJhY3QgPSBmdW5jdGlvbih2Mikge1xuXHRcdHJldHVybiBuZXcgVmVjdG9yKHRoaXMueCAtIHYyLngsIHRoaXMueSAtIHYyLnkpO1xuXHR9O1xuXG5cdFZlY3Rvci5wcm90b3R5cGUubXVsdGlwbHkgPSBmdW5jdGlvbihuKSB7XG5cdFx0cmV0dXJuIG5ldyBWZWN0b3IodGhpcy54ICogbiwgdGhpcy55ICogbik7XG5cdH07XG5cblx0VmVjdG9yLnByb3RvdHlwZS5kaXZpZGUgPSBmdW5jdGlvbihuKSB7XG5cdFx0cmV0dXJuIG5ldyBWZWN0b3IoKHRoaXMueCAvIG4pIHx8IDAsICh0aGlzLnkgLyBuKSB8fCAwKTsgLy8gQXZvaWQgZGl2aWRlIGJ5IHplcm8gZXJyb3JzLi5cblx0fTtcblxuXHRWZWN0b3IucHJvdG90eXBlLm1hZ25pdHVkZSA9IGZ1bmN0aW9uKCkge1xuXHRcdHJldHVybiBNYXRoLnNxcnQodGhpcy54KnRoaXMueCArIHRoaXMueSp0aGlzLnkpO1xuXHR9O1xuXG5cdFZlY3Rvci5wcm90b3R5cGUubm9ybWFsID0gZnVuY3Rpb24oKSB7XG5cdFx0cmV0dXJuIG5ldyBWZWN0b3IoLXRoaXMueSwgdGhpcy54KTtcblx0fTtcblxuXHRWZWN0b3IucHJvdG90eXBlLm5vcm1hbGlzZSA9IGZ1bmN0aW9uKCkge1xuXHRcdHJldHVybiB0aGlzLmRpdmlkZSh0aGlzLm1hZ25pdHVkZSgpKTtcblx0fTtcblxuXHQvLyBQb2ludFxuXHRMYXlvdXQuRm9yY2VEaXJlY3RlZC5Qb2ludCA9IGZ1bmN0aW9uKHBvc2l0aW9uLCBtYXNzKSB7XG5cdFx0dGhpcy5wID0gcG9zaXRpb247IC8vIHBvc2l0aW9uXG5cdFx0dGhpcy5tID0gbWFzczsgLy8gbWFzc1xuXHRcdHRoaXMudiA9IG5ldyBWZWN0b3IoMCwgMCk7IC8vIHZlbG9jaXR5XG5cdFx0dGhpcy5hID0gbmV3IFZlY3RvcigwLCAwKTsgLy8gYWNjZWxlcmF0aW9uXG5cdH07XG5cblx0TGF5b3V0LkZvcmNlRGlyZWN0ZWQuUG9pbnQucHJvdG90eXBlLmFwcGx5Rm9yY2UgPSBmdW5jdGlvbihmb3JjZSkge1xuXHRcdHRoaXMuYSA9IHRoaXMuYS5hZGQoZm9yY2UuZGl2aWRlKHRoaXMubSkpO1xuXHR9O1xuXG5cdC8vIFNwcmluZ1xuXHRMYXlvdXQuRm9yY2VEaXJlY3RlZC5TcHJpbmcgPSBmdW5jdGlvbihwb2ludDEsIHBvaW50MiwgbGVuZ3RoLCBrKSB7XG5cdFx0dGhpcy5wb2ludDEgPSBwb2ludDE7XG5cdFx0dGhpcy5wb2ludDIgPSBwb2ludDI7XG5cdFx0dGhpcy5sZW5ndGggPSBsZW5ndGg7IC8vIHNwcmluZyBsZW5ndGggYXQgcmVzdFxuXHRcdHRoaXMuayA9IGs7IC8vIHNwcmluZyBjb25zdGFudCAoU2VlIEhvb2tlJ3MgbGF3KSAuLiBob3cgc3RpZmYgdGhlIHNwcmluZyBpc1xuXHR9O1xuXG5cdC8vIExheW91dC5Gb3JjZURpcmVjdGVkLlNwcmluZy5wcm90b3R5cGUuZGlzdGFuY2VUb1BvaW50ID0gZnVuY3Rpb24ocG9pbnQpXG5cdC8vIHtcblx0Ly8gXHQvLyBoYXJkY29yZSB2ZWN0b3IgYXJpdGhtZXRpYy4uIG9oaCB5ZWFoIVxuXHQvLyBcdC8vIC4uIHNlZSBodHRwOi8vc3RhY2tvdmVyZmxvdy5jb20vcXVlc3Rpb25zLzg0OTIxMS9zaG9ydGVzdC1kaXN0YW5jZS1iZXR3ZWVuLWEtcG9pbnQtYW5kLWEtbGluZS1zZWdtZW50Lzg2NTA4MCM4NjUwODBcblx0Ly8gXHR2YXIgbiA9IHRoaXMucG9pbnQyLnAuc3VidHJhY3QodGhpcy5wb2ludDEucCkubm9ybWFsaXNlKCkubm9ybWFsKCk7XG5cdC8vIFx0dmFyIGFjID0gcG9pbnQucC5zdWJ0cmFjdCh0aGlzLnBvaW50MS5wKTtcblx0Ly8gXHRyZXR1cm4gTWF0aC5hYnMoYWMueCAqIG4ueCArIGFjLnkgKiBuLnkpO1xuXHQvLyB9O1xuXG5cdC8qKlxuXHQgKiBSZW5kZXJlciBoYW5kbGVzIHRoZSBsYXlvdXQgcmVuZGVyaW5nIGxvb3Bcblx0ICogQHBhcmFtIG9uUmVuZGVyU3RvcCBvcHRpb25hbCBjYWxsYmFjayBmdW5jdGlvbiB0aGF0IGdldHMgZXhlY3V0ZWQgd2hlbmV2ZXIgcmVuZGVyaW5nIHN0b3BzLlxuXHQgKiBAcGFyYW0gb25SZW5kZXJTdGFydCBvcHRpb25hbCBjYWxsYmFjayBmdW5jdGlvbiB0aGF0IGdldHMgZXhlY3V0ZWQgd2hlbmV2ZXIgcmVuZGVyaW5nIHN0YXJ0cy5cblx0ICogQHBhcmFtIG9uUmVuZGVyRnJhbWUgb3B0aW9uYWwgY2FsbGJhY2sgZnVuY3Rpb24gdGhhdCBnZXRzIGV4ZWN1dGVkIGFmdGVyIGVhY2ggZnJhbWUgaXMgcmVuZGVyZWQuXG5cdCAqL1xuXHR2YXIgUmVuZGVyZXIgPSBTcHJpbmd5LlJlbmRlcmVyID0gZnVuY3Rpb24obGF5b3V0LCBjbGVhciwgZHJhd0VkZ2UsIGRyYXdOb2RlLCBvblJlbmRlclN0b3AsIG9uUmVuZGVyU3RhcnQsIG9uUmVuZGVyRnJhbWUpIHtcblx0XHR0aGlzLmxheW91dCA9IGxheW91dDtcblx0XHR0aGlzLmNsZWFyID0gY2xlYXI7XG5cdFx0dGhpcy5kcmF3RWRnZSA9IGRyYXdFZGdlO1xuXHRcdHRoaXMuZHJhd05vZGUgPSBkcmF3Tm9kZTtcblx0XHR0aGlzLm9uUmVuZGVyU3RvcCA9IG9uUmVuZGVyU3RvcDtcblx0XHR0aGlzLm9uUmVuZGVyU3RhcnQgPSBvblJlbmRlclN0YXJ0O1xuXHRcdHRoaXMub25SZW5kZXJGcmFtZSA9IG9uUmVuZGVyRnJhbWU7XG5cblx0XHR0aGlzLmxheW91dC5ncmFwaC5hZGRHcmFwaExpc3RlbmVyKHRoaXMpO1xuXHR9XG5cblx0UmVuZGVyZXIucHJvdG90eXBlLmdyYXBoQ2hhbmdlZCA9IGZ1bmN0aW9uKGUpIHtcblx0XHR0aGlzLnN0YXJ0KCk7XG5cdH07XG5cblx0LyoqXG5cdCAqIFN0YXJ0cyB0aGUgc2ltdWxhdGlvbiBvZiB0aGUgbGF5b3V0IGluIHVzZS5cblx0ICpcblx0ICogTm90ZSB0aGF0IGluIGNhc2UgdGhlIGFsZ29yaXRobSBpcyBzdGlsbCBvciBhbHJlYWR5IHJ1bm5pbmcgdGhlbiB0aGUgbGF5b3V0IHRoYXQncyBpbiB1c2Vcblx0ICogbWlnaHQgc2lsZW50bHkgaWdub3JlIHRoZSBjYWxsLCBhbmQgeW91ciBvcHRpb25hbCA8Y29kZT5kb25lPC9jb2RlPiBjYWxsYmFjayBpcyBuZXZlciBleGVjdXRlZC5cblx0ICogQXQgbGVhc3QgdGhlIGJ1aWx0LWluIEZvcmNlRGlyZWN0ZWQgbGF5b3V0IGJlaGF2ZXMgaW4gdGhpcyB3YXkuXG5cdCAqXG5cdCAqIEBwYXJhbSBkb25lIEFuIG9wdGlvbmFsIGNhbGxiYWNrIGZ1bmN0aW9uIHRoYXQgZ2V0cyBleGVjdXRlZCB3aGVuIHRoZSBzcHJpbmd5IGFsZ29yaXRobSBzdG9wcyxcblx0ICogZWl0aGVyIGJlY2F1c2UgaXQgZW5kZWQgb3IgYmVjYXVzZSBzdG9wKCkgd2FzIGNhbGxlZC5cblx0ICovXG5cdFJlbmRlcmVyLnByb3RvdHlwZS5zdGFydCA9IGZ1bmN0aW9uKGRvbmUpIHtcblx0XHR2YXIgdCA9IHRoaXM7XG5cdFx0dGhpcy5sYXlvdXQuc3RhcnQoZnVuY3Rpb24gcmVuZGVyKCkge1xuXHRcdFx0dC5jbGVhcigpO1xuXG5cdFx0XHR0LmxheW91dC5lYWNoRWRnZShmdW5jdGlvbihlZGdlLCBzcHJpbmcpIHtcblx0XHRcdFx0dC5kcmF3RWRnZShlZGdlLCBzcHJpbmcucG9pbnQxLnAsIHNwcmluZy5wb2ludDIucCk7XG5cdFx0XHR9KTtcblxuXHRcdFx0dC5sYXlvdXQuZWFjaE5vZGUoZnVuY3Rpb24obm9kZSwgcG9pbnQpIHtcblx0XHRcdFx0dC5kcmF3Tm9kZShub2RlLCBwb2ludC5wKTtcblx0XHRcdH0pO1xuXHRcdFx0XG5cdFx0XHRpZiAodC5vblJlbmRlckZyYW1lICE9PSB1bmRlZmluZWQpIHsgdC5vblJlbmRlckZyYW1lKCk7IH1cblx0XHR9LCB0aGlzLm9uUmVuZGVyU3RvcCwgdGhpcy5vblJlbmRlclN0YXJ0KTtcblx0fTtcblxuXHRSZW5kZXJlci5wcm90b3R5cGUuc3RvcCA9IGZ1bmN0aW9uKCkge1xuXHRcdHRoaXMubGF5b3V0LnN0b3AoKTtcblx0fTtcblxuXHQvLyBBcnJheS5mb3JFYWNoIGltcGxlbWVudGF0aW9uIGZvciBJRSBzdXBwb3J0Li5cblx0Ly9odHRwczovL2RldmVsb3Blci5tb3ppbGxhLm9yZy9lbi9KYXZhU2NyaXB0L1JlZmVyZW5jZS9HbG9iYWxfT2JqZWN0cy9BcnJheS9mb3JFYWNoXG5cdGlmICggIUFycmF5LnByb3RvdHlwZS5mb3JFYWNoICkge1xuXHRcdEFycmF5LnByb3RvdHlwZS5mb3JFYWNoID0gZnVuY3Rpb24oIGNhbGxiYWNrLCB0aGlzQXJnICkge1xuXHRcdFx0dmFyIFQsIGs7XG5cdFx0XHRpZiAoIHRoaXMgPT0gbnVsbCApIHtcblx0XHRcdFx0dGhyb3cgbmV3IFR5cGVFcnJvciggXCIgdGhpcyBpcyBudWxsIG9yIG5vdCBkZWZpbmVkXCIgKTtcblx0XHRcdH1cblx0XHRcdHZhciBPID0gT2JqZWN0KHRoaXMpO1xuXHRcdFx0dmFyIGxlbiA9IE8ubGVuZ3RoID4+PiAwOyAvLyBIYWNrIHRvIGNvbnZlcnQgTy5sZW5ndGggdG8gYSBVSW50MzJcblx0XHRcdGlmICgge30udG9TdHJpbmcuY2FsbChjYWxsYmFjaykgIT0gXCJbb2JqZWN0IEZ1bmN0aW9uXVwiICkge1xuXHRcdFx0XHR0aHJvdyBuZXcgVHlwZUVycm9yKCBjYWxsYmFjayArIFwiIGlzIG5vdCBhIGZ1bmN0aW9uXCIgKTtcblx0XHRcdH1cblx0XHRcdGlmICggdGhpc0FyZyApIHtcblx0XHRcdFx0VCA9IHRoaXNBcmc7XG5cdFx0XHR9XG5cdFx0XHRrID0gMDtcblx0XHRcdHdoaWxlKCBrIDwgbGVuICkge1xuXHRcdFx0XHR2YXIga1ZhbHVlO1xuXHRcdFx0XHRpZiAoIGsgaW4gTyApIHtcblx0XHRcdFx0XHRrVmFsdWUgPSBPWyBrIF07XG5cdFx0XHRcdFx0Y2FsbGJhY2suY2FsbCggVCwga1ZhbHVlLCBrLCBPICk7XG5cdFx0XHRcdH1cblx0XHRcdFx0aysrO1xuXHRcdFx0fVxuXHRcdH07XG5cdH1cblxuXHR2YXIgaXNFbXB0eSA9IGZ1bmN0aW9uKG9iaikge1xuXHRcdGZvciAodmFyIGsgaW4gb2JqKSB7XG5cdFx0XHRpZiAob2JqLmhhc093blByb3BlcnR5KGspKSB7XG5cdFx0XHRcdHJldHVybiBmYWxzZTtcblx0XHRcdH1cblx0XHR9XG5cdFx0cmV0dXJuIHRydWU7XG5cdH07XG5cbiAgcmV0dXJuIFNwcmluZ3k7XG59KSgpO1xuIiwiPHNjcmlwdD5cbmltcG9ydCB7IFNwcmluZ3kgfSBmcm9tIFwiLi9zcHJpbmd5LmpzXCJcbmltcG9ydCB7IG9uTW91bnQgfSBmcm9tIFwic3ZlbHRlXCI7XG5cbmNvbnN0IFdJRFRIID0gNTEyLCBIRUlHSFQgPSA1MTI7XG5cbmV4cG9ydCBsZXQgbm9kZXMgPSBbXTtcbmV4cG9ydCBsZXQgZWRnZXMgPSBbXTtcbmV4cG9ydCBsZXQgb25yZW5kZXJlZCAgPSAoKT0+e307XG4vKmV4cG9ydCBsZXQgd2lkdGggPSA1MDA7XG5leHBvcnQgbGV0IGhlaWdodCA9IDUwMDsqL1xuXG5sZXQgY2FudmFzO1xuXG5sZXQgcmVuZGVyZXI7XG5cbi8vIG5vZGU6IHtpZCwgc3JjLCBuYW1lfVxuLy8gZWRnZToge2Zyb20sIHRvLCBsYWJlbH1cblxuZnVuY3Rpb24gcHJvamVjdChwLCB3aWR0aCwgaGVpZ2h0KSB7XG5cdHJldHVybiB7IHg6IChwLnggKyA1KS8xMCAqIHdpZHRoLCB5OiAocC55ICsgNSkvMTAgKiBoZWlnaHQgfTtcbn1cblxubGV0IGxhc3Rfbm9kZXM7XG5sZXQgbGFzdF9lZGdlcztcblxuJDogaWYoY2FudmFzICYmIChub2RlcyAhPSBsYXN0X25vZGVzIHx8IGVkZ2VzICE9IGxhc3RfZWRnZXMpKSB7XG4gIGxhc3Rfbm9kZXMgPSBub2RlcztcbiAgbGFzdF9lZGdlcyA9IGVkZ2VzO1xuXHRsZXQgZ3JhcGggPSBuZXcgU3ByaW5neS5HcmFwaCgpO1xuXHRsZXQgZ3JhcGhfbm9kZXMgPSB7fTtcbiAgbGV0IHdpZHRoID0gY2FudmFzLmdldEJvdW5kaW5nQ2xpZW50UmVjdCgpLndpZHRoLFxuICAgICAgaGVpZ2h0ID0gY2FudmFzLmdldEJvdW5kaW5nQ2xpZW50UmVjdCgpLmhlaWdodDtcblx0bGV0IGN0eCA9IGNhbnZhcy5nZXRDb250ZXh0KFwiMmRcIik7XG5cdGN0eC5zZXRMaW5lRGFzaChbNywgN10pO1xuXHRjdHguZ2xvYmFsQWxwaGEgPSAwLjU7XG5cdGZvcihsZXQgbm9kZSBvZiBub2Rlcylcblx0XHRncmFwaF9ub2Rlc1tub2RlLmlkXSA9IGdyYXBoLm5ld05vZGUobm9kZSk7XG5cdGZvcihsZXQgZWRnZSBvZiBlZGdlcylcbiAgICBncmFwaC5uZXdFZGdlKGdyYXBoX25vZGVzW2VkZ2UuZnJvbV0sIGdyYXBoX25vZGVzW2VkZ2UudG9dLCBlZGdlKTtcblx0bGV0IGxheW91dCA9IG5ldyBTcHJpbmd5LkxheW91dC5Gb3JjZURpcmVjdGVkKGdyYXBoLCA0MDAuMCwgNDAwLjAsIDAuNiwgMC4wMDAxKTtcblx0aWYocmVuZGVyZXIpIHJlbmRlcmVyLnN0b3AoKTtcblx0cmVuZGVyZXIgPSBuZXcgU3ByaW5neS5SZW5kZXJlcihsYXlvdXQsXG5cdFx0ZnVuY3Rpb24gY2xlYXIoKSB7XG5cdFx0XHRjdHguY2xlYXJSZWN0KDAsIDAsIFdJRFRILCBIRUlHSFQpO1xuXHRcdH0sXG5cdFx0ZnVuY3Rpb24gZHJhd0VkZ2UoZWRnZSwgcDEsIHAyKSB7XG5cdFx0XHRjdHguYmVnaW5QYXRoKCk7XG5cdFx0XHRwMSA9IHByb2plY3QocDEsIFdJRFRILCBIRUlHSFQpO1xuXHRcdFx0cDIgPSBwcm9qZWN0KHAyLCBXSURUSCwgSEVJR0hUKTtcbiAgICAgIGN0eC5saW5lV2lkdGggPSAoZWRnZS5kYXRhLnN0cmVuZ3RoKSB8fCAxLjA7XG4gICAgICBjdHguZ2xvYmFsQWxwaGEgPSAoZWRnZS5kYXRhLnN0cmVuZ3RoKSB8fCAxLjA7XG5cdFx0XHRjdHgubW92ZVRvKHAxLngsIHAxLnkpO1xuXHRcdFx0Y3R4LmxpbmVUbyhwMi54LCBwMi55KTtcblx0XHRcdGN0eC5zdHJva2UoKTtcblx0XHR9LFxuXHRcdGZ1bmN0aW9uIGRyYXdOb2RlKG5vZGUsIHApIHtcblx0XHRcdC8vbm9kZSA9IGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKG5vZGUuZGF0YS5pZCk7XG5cdFx0XHRub2RlID0gbm9kZS5kYXRhLnJlZjtcblx0XHRcdC8qaWYobm9kZS5kYXRhLmltYWdlLmNvbXBsZXRlKSBcblx0XHRcdFx0Y3R4LmRyYXdJbWFnZShub2RlLmRhdGEuaW1hZ2UsIHAueCAqIHdpZHRoICsgbm9kZS5pbWFnZS53aWR0aCwgcC55ICogaGVpZ2h0KTsqL1xuXHRcdFx0Ly8gZHJhdyBhIG5vZGVcblx0XHRcdHAgPSBwcm9qZWN0KHAsIHdpZHRoLCBoZWlnaHQpO1xuXHRcdFx0aWYobm9kZSl7XG4gICAgICAgIGlmKHBhcnNlSW50KG5vZGUuc3R5bGUubGVmdCkgIT0gTWF0aC5mbG9vcihwLngpKVxuICAgICAgICAgIG5vZGUuc3R5bGUubGVmdCA9IHAueCoxMDAvd2lkdGggKyBcIiVcIjtcbiAgICAgICAgaWYocGFyc2VJbnQobm9kZS5zdHlsZS50b3ApICE9IE1hdGguZmxvb3IocC55KSlcbiAgICAgICAgICBub2RlLnN0eWxlLnRvcCA9IHAueSoxMDAvaGVpZ2h0ICsgXCIlXCI7XG5cdFx0XHR9XG5cdFx0fSxcbiAgICBmdW5jdGlvbiBvblJlbmRlclN0b3AoKSB7XG4gICAgICBvbnJlbmRlcmVkKCk7XG4gICAgfVxuXHQpO1xuXHRyZW5kZXJlci5zdGFydCgpO1xufVxuPC9zY3JpcHQ+XG5cbjxkaXYgY2xhc3M9XCJyZWxhdGl2ZSB7JCRwcm9wcy5jbGFzc31cIj5cbjxjYW52YXMgYmluZDp0aGlzPXtjYW52YXN9IHdpZHRoPXtXSURUSH0gaGVpZ2h0PXtIRUlHSFR9IGNsYXNzPVwidy1mdWxsXCI+IDwvY2FudmFzPlxueyNlYWNoIG5vZGVzIGFzIG5vZGV9XG5cdDxkaXYgYmluZDp0aGlzPXtub2RlLnJlZn0gaWQ9XCJ7bm9kZS5pZH1cIiBjbGFzcz1cIm5vZGVcIj5cblx0XHQ8c2xvdCB7bm9kZX0+PC9zbG90PlxuXHQ8L2Rpdj5cbnsvZWFjaH1cbjwvZGl2PlxuXG5cbjxzdHlsZT5cbi5ub2RlIHtcblx0cG9zaXRpb246IGFic29sdXRlOyBcblx0ZGlzcGxheTogaW5saW5lLWJsb2NrO1xuXHR0cmFuc2Zvcm06IHRyYW5zbGF0ZSgtNTAlLCAtNTAlKTtcbiAgd2lkdGg6IGZpdC1jb250ZW50O1xuICB0b3A6IDUwJTtcbiAgbGVmdDogNTAlO1xufVxuPC9zdHlsZT5cbiIsInsjaWYgaGVhZGVyfVxuPGRpdiBjbGFzcz1cInctZnVsbCBmbGV4IGZsZXgtcm93XCI+XG4gIDxkaXYgY2xhc3M9XCJ3LTEvNCBiZy1ncmF5LTUwMCB0ZXh0LWNlbnRlciBvdmVyZmxvdy1oaWRkZW4gZmxleCBmbGV4LXJvdyBqdXN0aWZ5LWFyb3VuZCBpdGVtcy1jZW50ZXJcIj5cbiAgICB7I2VhY2ggW1wibWItMlwiLCBcIm1iLTFcIiwgXCItbWItMlwiLCBcIi1tYi04XCJdIGFzIG1ifVxuICAgIDxzdmcgYXJlYS1oaWRkZW49XCJ0cnVlXCIgcm9sZT1cImltZ1wiIHhtbG5zPVwiaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmdcIiB2aWV3Qm94PVwiMCAwIHtmYU1vb24uaWNvblswXX0ge2ZhTW9vbi5pY29uWzFdfVwiIGNsYXNzPVwie21ifSB3LTQgaC00IG92ZXJmbG93LXZpc2libGUgaW5saW5lLWJsb2NrIHRleHQteWVsbG93LTQwMFwiPlxuICAgICAgPHBhdGggZmlsbD1cImN1cnJlbnRDb2xvclwiIGQ9XCJ7ZmFNb29uLmljb25bNF19XCIvPlxuICAgIDwvc3ZnPlxuICAgIHsvZWFjaH1cbiAgPC9kaXY+XG4gIDxkaXYgY2xhc3M9XCJ3LTEvMiBiZy13aGl0ZSB0ZXh0LWNlbnRlciBvdmVyZmxvdy1oaWRkZW4gZmxleCBmbGV4LXJvdyBqdXN0aWZ5LWFyb3VuZCBpdGVtcy1jZW50ZXJcIj5cbiAgICB7I2VhY2ggW1wiLW1iLThcIiwgXCItbWItMlwiLCBcIm1iLTFcIiwgXCJtYi0yXCIsIFwibWItMVwiLCBcIi1tYi0yXCIsIFwiLW1iLThcIl0gYXMgbWJ9XG4gICAgPHN2ZyBhcmVhLWhpZGRlbj1cInRydWVcIiByb2xlPVwiaW1nXCIgeG1sbnM9XCJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2Z1wiIHZpZXdCb3g9XCIwIDAge2ZhU3VuLmljb25bMF19IHtmYVN1bi5pY29uWzFdfVwiIGNsYXNzPVwie21ifSB3LTQgaC00IG92ZXJmbG93LXZpc2libGUgaW5saW5lLWJsb2NrIHRleHQtcmVkLTQwMFwiPlxuICAgICAgPHBhdGggZmlsbD1cImN1cnJlbnRDb2xvclwiIGQ9XCJ7ZmFTdW4uaWNvbls0XX1cIi8+XG4gICAgPC9zdmc+XG4gICAgey9lYWNofVxuICA8L2Rpdj5cbiAgPGRpdiBjbGFzcz1cInctMS80IGJnLWdyYXktNTAwIHRleHQtY2VudGVyIG92ZXJmbG93LWhpZGRlbiBmbGV4IGZsZXgtcm93IGp1c3RpZnktYXJvdW5kIGl0ZW1zLWNlbnRlclwiPlxuICAgIHsjZWFjaCBbXCJtYi0yXCIsIFwibWItMVwiLCBcIi1tYi0yXCIsIFwiLW1iLThcIl0ucmV2ZXJzZSgpIGFzIG1ifVxuICAgIDxzdmcgYXJlYS1oaWRkZW49XCJ0cnVlXCIgcm9sZT1cImltZ1wiIHhtbG5zPVwiaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmdcIiB2aWV3Qm94PVwiMCAwIHtmYU1vb24uaWNvblswXX0ge2ZhTW9vbi5pY29uWzFdfVwiIGNsYXNzPVwie21ifSB3LTQgaC00IG92ZXJmbG93LXZpc2libGUgaW5saW5lLWJsb2NrIHRleHQteWVsbG93LTQwMFwiPlxuICAgICAgPHBhdGggZmlsbD1cImN1cnJlbnRDb2xvclwiIGQ9XCJ7ZmFNb29uLmljb25bNF19XCIvPlxuICAgIDwvc3ZnPlxuICAgIHsvZWFjaH1cbiAgPC9kaXY+XG48L2Rpdj5cbnsvaWZ9XG48ZGl2IGNsYXNzPVwidy1mdWxsIHJlbGF0aXZlIGJvcmRlci10XCI+XG4gIDxkaXYgY2xhc3M9XCJ3LWZ1bGwgYWJzb2x1dGUgYmctZ3JheS01MDBcIiBzdHlsZT1cImhlaWdodDoge2hlaWdodH1weFwiPjwvZGl2PlxuICA8ZGl2IGNsYXNzPVwidy0zLzQgYWJzb2x1dGUgYmctd2hpdGVcIiBzdHlsZT1cImhlaWdodDoge2hlaWdodH1weFwiPjwvZGl2PlxuICA8ZGl2IGNsYXNzPVwidy0xLzIgYWJzb2x1dGUgYmctd2hpdGVcIiBzdHlsZT1cImhlaWdodDoge2hlaWdodH1weFwiPjwvZGl2PlxuICA8ZGl2IGNsYXNzPVwidy0xLzQgYWJzb2x1dGUgYmctZ3JheS01MDBcIiBzdHlsZT1cImhlaWdodDoge2hlaWdodH1weFwiPjwvZGl2PlxuICA8ZGl2IGNsYXNzPVwidy1mdWxsXCI+XG4gICAgPGRpdiBjbGFzcz1cInctZnVsbCBmbGV4IGZsZXgtcm93IGZsZXgtd3JhcCBpdGVtcy1jZW50ZXIgcmVsYXRpdmVcIj5cbiAgICAgIDxzdmcgY2xhc3M9XCJmbGV4LWdyb3cgYm9yZGVyLWdyYXktOTAwXCIgd2lkdGg9e3dpZHRofSBoZWlnaHQ9e2hlaWdodH0gYmluZDp0aGlzPXtzdmd9PlxuXHRcdFx0XHQ8ZGVmcz5cblx0XHRcdFx0XHR7I2VhY2ggT2JqZWN0LnZhbHVlcyhnYW1lcykgYXMgZ2FtZX1cblx0XHRcdFx0XHQ8cGF0dGVybiBpZD1cImdhbWUtYm94LWFydC17Z2FtZS5pZH1cIiB3aWR0aD17Z2FtZV9ib3hfYXJ0X3dpZHRofSBoZWlnaHQ9e2dhbWVfYm94X2FydF9oZWlnaHR9IHBhdHRlcm5Vbml0cz1cInVzZXJTcGFjZU9uVXNlXCI+XG4gICAgICAgICAgICB7I2lmIGdhbWUuYm94X2FydF91cmx9XG4gICAgICAgICAgICAgIDxpbWFnZSB4bGluazpocmVmPXtnYW1lLmJveF9hcnRfdXJsLnJlcGxhY2UoXCJ7d2lkdGh9XCIsIGdhbWVfYm94X2FydF93aWR0aCkucmVwbGFjZShcIntoZWlnaHR9XCIsIGdhbWVfYm94X2FydF9oZWlnaHQpfSB3aWR0aD17Z2FtZV9ib3hfYXJ0X3dpZHRofSBoZWlnaHQ9e2dhbWVfYm94X2FydF9oZWlnaHR9IHg9MCB5PTAgPiA8L2ltYWdlPlxuICAgICAgICAgICAgey9pZn1cblx0XHRcdFx0XHQ8L3BhdHRlcm4+XG5cdFx0XHRcdFx0ey9lYWNofVxuXHRcdFx0XHQ8L2RlZnM+XG4gICAgICAgIDxnIHNoYXBlLXJlbmRlcmluZz1cImNyaXNwRWRnZXNcIj5cbiAgICAgICAgICA8bGluZSB4MT1cInt3aWR0aCoxLzh9XCIgeDI9XCJ7d2lkdGgqMS84fVwiIHkxPVwiMFwiIHkyPVwiMTAwXCIgc3Ryb2tlLXdpZHRoPVwiMS4wXCIgc3Ryb2tlPVwiI2VlZVwiPjwvbGluZT5cbiAgICAgICAgICA8dGV4dCB4PVwiMFwiIHk9XCIwXCIgZmlsbD1cIiNlZWVcIiBmb250LXNpemU9XCIxMFwiIGZvbnQtZmFtaWx5PVwiQXJpYWxcIiB0cmFuc2Zvcm09XCJ0cmFuc2xhdGUoe3dpZHRoKjEvOCArIDN9LCAzKSByb3RhdGUoOTApXCI+XG4gICAgICAgICAgICAzYW1cbiAgICAgICAgICA8L3RleHQ+XG4gICAgICAgICAgPCEtLTxsaW5lIHgxPVwie3dpZHRoKjIvOH1cIiB4Mj1cInt3aWR0aCoyLzh9XCIgeTE9XCIwXCIgeTI9XCIxMDBcIiBzdHJva2Utd2lkdGg9XCIxLjBcIiBzdHJva2U9XCIjZWVlXCI+PC9saW5lPi0tPlxuICAgICAgICAgIDx0ZXh0IGZpbGw9XCIjYWFhXCIgZm9udC1zaXplPVwiMTBcIiBmb250LWZhbWlseT1cIkFyaWFsXCIgdHJhbnNmb3JtPVwidHJhbnNsYXRlKHt3aWR0aCoyLzggKyAzfSwgMykgcm90YXRlKDkwKVwiPlxuICAgICAgICAgICAgNmFtXG4gICAgICAgICAgPC90ZXh0PlxuICAgICAgICAgIDxsaW5lIHgxPVwie3dpZHRoKjMvOH1cIiB4Mj1cInt3aWR0aCozLzh9XCIgeTE9XCIwXCIgeTI9XCIxMDBcIiBzdHJva2Utd2lkdGg9XCIxLjBcIiBzdHJva2U9XCIjYWFhXCI+PC9saW5lPlxuICAgICAgICAgIDx0ZXh0IGZpbGw9XCIjYWFhXCIgZm9udC1zaXplPVwiMTBcIiBmb250LWZhbWlseT1cIkFyaWFsXCIgdHJhbnNmb3JtPVwidHJhbnNsYXRlKHt3aWR0aCozLzggKyAzfSwgMykgcm90YXRlKDkwKVwiPlxuICAgICAgICAgICAgOWFtXG4gICAgICAgICAgPC90ZXh0PlxuICAgICAgICAgIDxsaW5lIHgxPVwie3dpZHRoKjQvOH1cIiB4Mj1cInt3aWR0aCo0Lzh9XCIgeTE9XCIwXCIgeTI9XCIxMDBcIiBzdHJva2Utd2lkdGg9XCIxLjBcIiBzdHJva2U9XCIjNzc3XCI+PC9saW5lPlxuICAgICAgICAgIDx0ZXh0IGZpbGw9XCIjNzc3XCIgZm9udC1zaXplPVwiMTBcIiBmb250LWZhbWlseT1cIkFyaWFsXCIgdHJhbnNmb3JtPVwidHJhbnNsYXRlKHt3aWR0aCo0LzggKyAzfSwgMykgcm90YXRlKDkwKVwiPlxuICAgICAgICAgICAg7KCV7JikXG4gICAgICAgICAgPC90ZXh0PlxuICAgICAgICAgIDxsaW5lIHgxPVwie3dpZHRoKjUvOH1cIiB4Mj1cInt3aWR0aCo1Lzh9XCIgeTE9XCIwXCIgeTI9XCIxMDBcIiBzdHJva2Utd2lkdGg9XCIxLjBcIiBzdHJva2U9XCIjYWFhXCI+PC9saW5lPlxuICAgICAgICAgIDx0ZXh0IGZpbGw9XCIjYWFhXCIgZm9udC1zaXplPVwiMTBcIiBmb250LWZhbWlseT1cIkFyaWFsXCIgdHJhbnNmb3JtPVwidHJhbnNsYXRlKHt3aWR0aCo1LzggKyAzfSwgMykgcm90YXRlKDkwKVwiPlxuICAgICAgICAgICAgM3BtXG4gICAgICAgICAgPC90ZXh0PlxuICAgICAgICAgIDwhLS08bGluZSB4MT1cInt3aWR0aCo2Lzh9XCIgeDI9XCJ7d2lkdGgqNi84fVwiIHkxPVwiMFwiIHkyPVwiMTAwXCIgc3Ryb2tlLXdpZHRoPVwiMS4wXCIgc3Ryb2tlPVwiI2FhYVwiPjwvbGluZT4tLT5cbiAgICAgICAgICA8dGV4dCBmaWxsPVwiI2VlZVwiIGZvbnQtc2l6ZT1cIjEwXCIgZm9udC1mYW1pbHk9XCJBcmlhbFwiIHRyYW5zZm9ybT1cInRyYW5zbGF0ZSh7d2lkdGgqNi84ICsgM30sIDMpIHJvdGF0ZSg5MClcIj5cbiAgICAgICAgICAgIDZwbVxuICAgICAgICAgIDwvdGV4dD5cbiAgICAgICAgICA8bGluZSB4MT1cInt3aWR0aCo3Lzh9XCIgeDI9XCJ7d2lkdGgqNy84fVwiIHkxPVwiMFwiIHkyPVwiMTAwXCIgc3Ryb2tlLXdpZHRoPVwiMS4wXCIgc3Ryb2tlPVwiI2VlZVwiPjwvbGluZT5cbiAgICAgICAgICA8dGV4dCBmaWxsPVwiI2VlZVwiIGZvbnQtc2l6ZT1cIjEwXCIgZm9udC1mYW1pbHk9XCJBcmlhbFwiIHRyYW5zZm9ybT1cInRyYW5zbGF0ZSh7d2lkdGgqNy84ICsgM30sIDMpIHJvdGF0ZSg5MClcIj5cbiAgICAgICAgICAgIDlwbVxuICAgICAgICAgIDwvdGV4dD5cbiAgICAgICAgICB7I2lmIGRheXNfYWdvID09IDAgJiYgbm93X3h9XG4gICAgICAgICAgPGxpbmUgeDE9XCJ7bm93X3h9XCIgeDI9e25vd194fSB5MT17MH0geTI9e2hlaWdodH0gc3Ryb2tlPVwiI0ZGNDU2MFwiIHN0cm9rZS13aWR0aD0wLjUgXG4gICAgICAgICAgICBzdHJva2UtZGFzaGFycmF5PVwiNCA0XCJcbiAgICAgICAgICAgIC8+XG4gICAgICAgICAgPHRleHQgZmlsbD1cIiNGRjQ1NjBcIiBmb250LXNpemU9XCIxMFwiIGZvbnQtZmFtaWx5PVwiQXJpYWxcIiB0cmFuc2Zvcm09XCJ0cmFuc2xhdGUoe25vd194ICsgM30sIDMpIHJvdGF0ZSg5MClcIj5cbiAgICAgICAgICAgIO2YhOyerFxuICAgICAgICAgIDwvdGV4dD5cbiAgICAgICAgICB7L2lmfVxuICAgICAgICA8L2c+XG5cdFx0XHRcdDxnPlxuXHRcdFx0XHRcdHsjZWFjaCBkYXRhX2NodW5rcyBhcyBkYXRhfVxuICAgICAgICAgICAgPCEtLTxwYXRoIGZpbGw9XCIjQ0RBOEM3XCIgc3Ryb2tlPVwiI0I0OThBRVwiIHN0cm9rZS13aWR0aD0xLjAgZD1cIntkYXRhLnBhdGhbMF19XCIgLz4tLT5cbiAgICAgICAgICAgIDxwYXRoIGZpbGw9XCIjQ0JENUUwXCIgc3Ryb2tlPVwiI0EwQUVDMFwiIHN0cm9rZS13aWR0aD0xLjAgZD1cIntkYXRhLnBhdGhbMF19XCIgLz5cbiAgICAgICAgICAgIHsjaWYgZGF0YVswXSAmJiBkYXRhWzBdWzVdICYmIGRhdGFbMF1bNV0uZ2FtZSAmJiBnYW1lc1tkYXRhWzBdWzVdLmdhbWUuaWRdICYmIGRhdGFbMF1bNV0uZ2FtZS5ib3hfYXJ0X3VybH1cbiAgICAgICAgICAgICAgPHBhdGggXG4gICAgICAgICAgICAgICAgc3R5bGU9XCJmaWxsOnVybCgjZ2FtZS1ib3gtYXJ0LXtkYXRhWzBdWzVdLmdhbWUuaWR9KVwiXG4gICAgICAgICAgICAgICAgc3Ryb2tlPVwiI0EwQUVDMFwiIHN0cm9rZS13aWR0aD0xLjAgZD1cIntkYXRhLnBhdGhbMV19XCIgLz5cbiAgICAgICAgICAgIHs6ZWxzZX1cbiAgICAgICAgICAgICAgPHBhdGggXG4gICAgICAgICAgICAgICAgZmlsbD1cIiMwMDAwMDBcIiBcbiAgICAgICAgICAgICAgICBzdHJva2U9XCIjQjQ5OEFFXCIgc3Ryb2tlLXdpZHRoPTEuMCBkPVwie2RhdGEucGF0aFsxXX1cIiAvPlxuICAgICAgICAgICAgey9pZn1cbiAgICAgICAgICAgIDxwYXRoIGZpbGw9XCJub25lXCIgc3Ryb2tlPVwiI0ZGNDU2MFwiIHN0cm9rZS13aWR0aD0zLjAgZD1cIntkYXRhLnBhdGhbMl19XCIgc3Ryb2tlLWxpbmVjYXA9XCJyb3VuZFwiIHN0cm9rZS1kYXNoYXJyYXk9XCIxIDZcIiAvPlxuICAgICAgICAgIHsvZWFjaH1cbiAgICAgICAgICB7I2lmIHN0cmVhbWVyLmlzX3N0cmVhbWluZyAmJiBkYXlzX2FnbyA9PSAwICYmIGxhc3RfZGF0YX1cbiAgICAgICAgICAgIDxjaXJjbGUgXG4gICAgICAgICAgICAgIGN4PXt4c2NhbGUobGFzdF9kYXRhWzBdKX0gXG4gICAgICAgICAgICAgIGN5PXtoZWlnaHQgKiAoJG1heF95X2F4aXMgLSAobGFzdF9kYXRhWzFdKSkgLyAkbWF4X3lfYXhpc30gXG4gICAgICAgICAgICAgIHI9NFxuICAgICAgICAgICAgICBjbGFzcz1cImlzX3N0cmVhbWluZ19sYWJlbFwiXG4gICAgICAgICAgICAgIGZpbGw9XCIjRkY0NTYwXCIgLz5cbiAgICAgICAgICAgIDx0ZXh0IGZpbGw9XCIjRkY0NTYwXCIgZm9udC1zaXplPVwiMTBcIiBmb250LWZhbWlseT1cIkFyaWFsXCIgXG4gICAgICAgICAgICAgIHg9e3hzY2FsZShsYXN0X2RhdGFbMF0pICsgNn1cbiAgICAgICAgICAgICAgeT17aGVpZ2h0ICogKCRtYXhfeV9heGlzIC0gKGxhc3RfZGF0YVsxXSkpIC8gJG1heF95X2F4aXN9XG4gICAgICAgICAgICAgIGNsYXNzPVwiaXNfc3RyZWFtaW5nX2xhYmVsXCI+XG4gICAgICAgICAgICAgIOuwqeyGoeykkVxuICAgICAgICAgICAgPC90ZXh0PlxuICAgICAgICAgIHsvaWZ9XG5cdFx0XHRcdDwvZz5cbiAgICAgICAgPGcgc2hhcGUtcmVuZGVyaW5nPVwiY3Jpc3BFZGdlc1wiPlxuICAgICAgICAgIDxsaW5lIGNsYXNzOmhpZGRlbj17dG9vbHRpcF9kYXRhID09IG51bGx9IHgxPXt0b29sdGlwX3h9IHgyPXt0b29sdGlwX3h9IHkxPXswfSB5Mj17aGVpZ2h0fSBzdHJva2U9XCIjMDAwMDAwXCIgc3Ryb2tlLXdpZHRoPTAuNSBcbiAgICAgICAgICAgIHN0cm9rZS1kYXNoYXJyYXk9XCI0IDFcIlxuICAgICAgICAgICAgLz5cbiAgICAgICAgPC9nPlxuXHRcdFx0PC9zdmc+XG4gICAgICA8ZGl2IGNsYXNzPVwiZmxleC1ub25lIG1yLTIgYWJzb2x1dGUgbGVmdC0wIHRvcC0wIHAtMSB0ZXh0LXdoaXRlIHBvaW50ZXItZXZlbnRzLW5vbmVcIj4ge1tcIuyYpOuKmFwiLCBcIuyWtOygnFwiLCBcIuq3uOygnFwiLCBcIuyXiuq3uOygnFwiXVtkYXlzX2Fnb10gfHwgZGF5c19hZ28gKyBcIuydvOyghFwifSA8L2Rpdj5cbiAgICA8L2Rpdj5cbiAgPC9kaXY+XG5cdHsjaWYgdG9vbHRpcF9kYXRhfSBcbiAgICA8ZGl2IGNsYXNzPVwiYWJzb2x1dGUgYmctd2hpdGUgb3BhY2l0eS03NSB6LTUwXCIgc3R5bGU9XCJ7dG9vbHRpcF94IDwgd2lkdGgqMC41PyAnbGVmdDonICsgKHRvb2x0aXBfeCs1KSArICdweCc6ICdyaWdodDonICsgKCh3aWR0aC10b29sdGlwX3gpKzUpICsgJ3B4J307IHRvcDoge3Rvb2x0aXBfeSArIDV9cHhcIj4gXG4gICAgICAgICAgICA8ZGl2IGNsYXNzPVwiZmxleCBmbGV4LWNvbCBmb250LXNhbnMgY3VzdG9tLXRvb2x0aXAgcC0zIHctNDggZmxleC11bndyYXBcIj4gXG5cdFx0XHRcdFx0XHRcdDxkaXYgY2xhc3M9XCJ0ZXh0LWdyYXktNjAwIHRleHQteHMgZm9udC1zZW1pYm9sZCB0cmFja2luZy13aWRlXCI+XG5cdFx0XHRcdFx0XHRcdFx0e3Rvb2x0aXBfZGF0YV90aW1lX2Zvcm1hdCh0b29sdGlwX2RhdGEpfVxuXHRcdFx0XHRcdFx0XHQ8L2Rpdj5cbiAgICAgICAgICAgICAgPHAgY2xhc3M9XCJicmVhay1hbGwgbXQtMSB0ZXh0LWdyYXkgaXRhbGljIHRyYWNraW5nLXRpZ2h0XCIgc3R5bGU9XCJmb250LXNpemU6IDAuNXJlbVwiPlxuXHRcdFx0XHRcdFx0XHRcdHt0b29sdGlwX2RhdGFbNV0udGl0bGV9XG4gICAgICAgICAgICAgIDwvcD5cbiAgICAgICAgICAgICAgICA8ZGl2IGNsYXNzPVwibXQtMSBmbGV4IGZsZXgtcm93IGZsZXgtd3JhcCBpdGVtcy1jZW50ZXIgdGV4dC1ncmF5LTkwMFwiPlxuICAgICAgICAgICAgICAgICAgPHN2ZyBhcmVhLWhpZGRlbj1cInRydWVcIiByb2xlPVwiaW1nXCIgeG1sbnM9XCJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2Z1wiIHZpZXdCb3g9XCIwIDAge2ZhVXNlci5pY29uWzBdfSB7ZmFVc2VyLmljb25bMV19XCIgY2xhc3M9XCJ3LTQgaC00IG1yLTIgb3ZlcmZsb3ctdmlzaWJsZSBpbmxpbmUtYmxvY2tcIj5cbiAgICAgICAgICAgICAgICAgICAgPHBhdGggZmlsbD1cImN1cnJlbnRDb2xvclwiIGQ9XCJ7ZmFVc2VyLmljb25bNF19XCIvPlxuICAgICAgICAgICAgICAgICAgPC9zdmc+XG4gICAgICAgICAgICAgICAgICA8Yj57dG9vbHRpcF9kYXRhWzFdfeuqhTwvYj5cbiAgICAgICAgICAgICAgICA8L2Rpdj5cbiAgICAgICAgICAgICAgICA8ZGl2IGNsYXNzPVwiZmxleCBmbGV4LXJvdyBmbGV4LXdyYXAgaXRlbXMtY2VudGVyIHRleHQtZ3JheS02MDAgdGV4dC14c1wiPlxuICAgICAgICAgICAgICAgICAgPHN2ZyBhcmVhLWhpZGRlbj1cInRydWVcIiByb2xlPVwiaW1nXCIgeG1sbnM9XCJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2Z1wiIHZpZXdCb3g9XCIwIDAge2ZhVXNlclNlY3JldC5pY29uWzBdfSB7ZmFVc2VyU2VjcmV0Lmljb25bMV19XCIgY2xhc3M9XCJ3LTMgaC0zIG1yLTIgb3ZlcmZsb3ctdmlzaWJsZSBpbmxpbmUtYmxvY2tcIj5cbiAgICAgICAgICAgICAgICAgICAgPHBhdGggZmlsbD1cImN1cnJlbnRDb2xvclwiIGQ9XCJ7ZmFVc2VyU2VjcmV0Lmljb25bNF19XCIvPlxuICAgICAgICAgICAgICAgICAgPC9zdmc+XG4gICAgICAgICAgICAgICAgICA8Yj57dG9vbHRpcF9kYXRhWzFdIC0gdG9vbHRpcF9kYXRhWzJdfeuqhTwvYj5cbiAgICAgICAgICAgICAgICA8L2Rpdj5cbiAgICAgICAgICAgICAgICA8ZGl2IGNsYXNzPVwiZmxleCBmbGV4LXJvdyBmbGV4LXdyYXAgaXRlbXMtY2VudGVyIHRleHQteWVsbG93LTcwMCB0ZXh0LXhzXCI+XG4gICAgICAgICAgICAgICAgICA8c3ZnIGFyZWEtaGlkZGVuPVwidHJ1ZVwiIHJvbGU9XCJpbWdcIiB4bWxucz1cImh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnXCIgdmlld0JveD1cIjAgMCB7ZmFLZXkuaWNvblswXX0ge2ZhS2V5Lmljb25bMV19XCIgY2xhc3M9XCJ3LTMgaC0zIG1yLTIgb3ZlcmZsb3ctdmlzaWJsZSBpbmxpbmUtYmxvY2tcIj5cbiAgICAgICAgICAgICAgICAgICAgPHBhdGggZmlsbD1cImN1cnJlbnRDb2xvclwiIGQ9XCJ7ZmFLZXkuaWNvbls0XX1cIi8+XG4gICAgICAgICAgICAgICAgICA8L3N2Zz5cbiAgICAgICAgICAgICAgICAgIDxiPnt0b29sdGlwX2RhdGFbMl1966qFPC9iPlxuICAgICAgICAgICAgICAgIDwvZGl2PlxuICAgICAgICAgICAgICAgIDxkaXYgY2xhc3M9XCJtdC0xIGZsZXggZmxleC1yb3cgZmxleC13cmFwIGl0ZW1zLWNlbnRlclwiIHN0eWxlPVwiY29sb3I6ICNGRjZGNjFcIj5cbiAgICAgICAgICAgICAgICAgIDxzdmcgYXJlYS1oaWRkZW49XCJ0cnVlXCIgcm9sZT1cImltZ1wiIHhtbG5zPVwiaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmdcIiB2aWV3Qm94PVwiMCAwIHtmYUNvbW1lbnREb3RzLmljb25bMF19IHtmYUNvbW1lbnREb3RzLmljb25bMV19XCIgY2xhc3M9XCJ3LTQgaC00IG1yLTIgb3ZlcmZsb3ctdmlzaWJsZSBpbmxpbmUtYmxvY2tcIj5cbiAgICAgICAgICAgICAgICAgICAgPHBhdGggZmlsbD1cImN1cnJlbnRDb2xvclwiIGQ9XCJ7ZmFDb21tZW50RG90cy5pY29uWzRdfVwiLz5cbiAgICAgICAgICAgICAgICAgIDwvc3ZnPlxuICAgICAgICAgICAgICAgICAgPGI+e3Rvb2x0aXBfZGF0YVs0XS50b0ZpeGVkKDEpfeyxhO2MhS/stIg8L2I+XG4gICAgICAgICAgICAgICAgPC9kaXY+XG4gICAgICAgICAgICAgICAgPGRpdiBjbGFzcz1cIm10LTEgZmxleCBmbGV4LXJvdyBmbGV4LXdyYXAgaXRlbXMtY2VudGVyIHRleHQtcHVycGxlLTYwMFwiPlxuICAgICAgICAgICAgICAgICAgPHN2ZyBhcmVhLWhpZGRlbj1cInRydWVcIiByb2xlPVwiaW1nXCIgeG1sbnM9XCJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2Z1wiIHZpZXdCb3g9XCIwIDAge2ZhSGlzdG9yeS5pY29uWzBdfSB7ZmFIaXN0b3J5Lmljb25bMV19XCIgY2xhc3M9XCJ3LTQgaC00IG1yLTIgb3ZlcmZsb3ctdmlzaWJsZSBpbmxpbmUtYmxvY2tcIj5cbiAgICAgICAgICAgICAgICAgICAgPHBhdGggZmlsbD1cImN1cnJlbnRDb2xvclwiIGQ9XCJ7ZmFIaXN0b3J5Lmljb25bNF19XCIvPlxuICAgICAgICAgICAgICAgICAgPC9zdmc+XG4gICAgICAgICAgICAgICAgICA8Yj7sl4Xtg4DsnoQge01hdGguZmxvb3IoKHRvb2x0aXBfZGF0YVswXSAtIHRvb2x0aXBfZGF0YVs1XS5zdGFydGVkX2F0KSAvIDM2MDApfeyLnOqwhHtNYXRoLnJvdW5kKCh0b29sdGlwX2RhdGFbMF0gLSB0b29sdGlwX2RhdGFbNV0uc3RhcnRlZF9hdCkgJSAzNjAwIC8gNjApfeu2hDwvYj5cbiAgICAgICAgICAgICAgICA8L2Rpdj5cbiAgICAgICAgICAgICAgPHAgY2xhc3M9XCJtdC0yIHRleHQteHMgcHgtMSBib3JkZXIgcm91bmRlZC1mdWxsIHRleHQtd2hpdGUgdGV4dC1jZW50ZXJcIiBzdHlsZT1cImJhY2tncm91bmQtY29sb3I6IHtkYXJrX3JhbmRvbV9jb2xvcih0b29sdGlwX2RhdGFbNV0uZ2FtZSAmJiB0b29sdGlwX2RhdGFbNV0uZ2FtZS5pZCB8fCAwKX1cIj5cbiAgICAgICAgICAgICAgICB7dG9vbHRpcF9kYXRhWzVdLmdhbWUgIT0gbnVsbD8gdG9vbHRpcF9kYXRhWzVdLmdhbWUubmFtZSA6IFwiXCJ9XG4gICAgICAgICAgICAgIDwvcD5cbiAgICAgICAgICA8L2Rpdj5cbiAgICA8L2Rpdj5cblx0ey9pZn1cbjwvZGl2PlxuXG48c2NyaXB0IGNvbnRleHQ9XCJtb2R1bGVcIj5cbiAgaW1wb3J0IHsgd3JpdGFibGUgfSBmcm9tICdzdmVsdGUvc3RvcmUnO1xuICBsZXQgbWF4X3lfYXhpcyA9IHdyaXRhYmxlKDApO1xuICBsZXQgbWF4X3lfYXhpc19yaWdodCA9IHdyaXRhYmxlKDApO1xuXG5cdGZ1bmN0aW9uIHRvb2x0aXBfZGF0YV90aW1lX2Zvcm1hdChkYXRhKSB7XG5cdFx0bGV0IGQgPSBuZXcgRGF0ZShkYXRhWzBdKjEwMDApLFxuXHRcdFx0XHRoID0gZC5nZXRIb3VycygpLCBtID0gZC5nZXRNaW51dGVzKCk7XG5cdFx0cmV0dXJuIGAke2g8MTI/IFwiQU1cIjogXCJQTVwifSAkeyhcIjBcIisoaD4xMj8gaC0xMjogaCkpLnNsaWNlKC0yKX06JHsoXCIwXCIrbSkuc2xpY2UoLTIpfWA7XG5cdH1cbjwvc2NyaXB0PlxuXG48c2NyaXB0PlxuaW1wb3J0IHsgb25Nb3VudCB9IGZyb20gXCJzdmVsdGVcIjtcbmltcG9ydCB7IGZhVXNlciB9IGZyb20gJ0Bmb3J0YXdlc29tZS9mcmVlLXNvbGlkLXN2Zy1pY29ucy9mYVVzZXInXG5pbXBvcnQgeyBmYVVzZXJMb2NrIH0gZnJvbSAnQGZvcnRhd2Vzb21lL2ZyZWUtc29saWQtc3ZnLWljb25zL2ZhVXNlckxvY2snXG5pbXBvcnQgeyBmYVVzZXJTZWNyZXQgfSBmcm9tICdAZm9ydGF3ZXNvbWUvZnJlZS1zb2xpZC1zdmctaWNvbnMvZmFVc2VyU2VjcmV0J1xuaW1wb3J0IHsgZmFVc2VyQ2hlY2sgfSBmcm9tICdAZm9ydGF3ZXNvbWUvZnJlZS1zb2xpZC1zdmctaWNvbnMvZmFVc2VyQ2hlY2snXG5pbXBvcnQgeyBmYUNvbW1lbnREb3RzIH0gZnJvbSAnQGZvcnRhd2Vzb21lL2ZyZWUtc29saWQtc3ZnLWljb25zL2ZhQ29tbWVudERvdHMnXG5pbXBvcnQgeyBmYUtleSB9IGZyb20gJ0Bmb3J0YXdlc29tZS9mcmVlLXNvbGlkLXN2Zy1pY29ucy9mYUtleSdcbmltcG9ydCB7IGZhU3VuIH0gZnJvbSAnQGZvcnRhd2Vzb21lL2ZyZWUtc29saWQtc3ZnLWljb25zL2ZhU3VuJ1xuaW1wb3J0IHsgZmFNb29uIH0gZnJvbSAnQGZvcnRhd2Vzb21lL2ZyZWUtc29saWQtc3ZnLWljb25zL2ZhTW9vbidcbmltcG9ydCB7IGZhRXh0ZXJuYWxMaW5rQWx0IH0gZnJvbSAnQGZvcnRhd2Vzb21lL2ZyZWUtc29saWQtc3ZnLWljb25zL2ZhRXh0ZXJuYWxMaW5rQWx0J1xuaW1wb3J0IHsgZmFIaXN0b3J5IH0gZnJvbSAnQGZvcnRhd2Vzb21lL2ZyZWUtc29saWQtc3ZnLWljb25zL2ZhSGlzdG9yeSc7XG5pbXBvcnQgeyBkYXJrX3JhbmRvbV9jb2xvciwgZmluZExhc3RJbmRleCB9IGZyb20gXCIuLi91dGlsLmpzXCI7XG5pbXBvcnQgeyBBUEkgfSBmcm9tICcuLi9hcGkuanMnO1xuXG5leHBvcnQgbGV0IGRheXNfYWdvO1xuZXhwb3J0IGxldCBzdHJlYW1lcjtcbmV4cG9ydCBsZXQgaGVhZGVyID0gZmFsc2U7XG5cbmxldCB0b29sdGlwX3g9MCwgXG5cdFx0dG9vbHRpcF95PTAsIFxuXHRcdHRvb2x0aXBfZGF0YT1udWxsO1xuXG5cbmlmKGRheXNfYWdvID09PSAwKSB7XG4gIG1heF95X2F4aXMuc2V0KDApXG4gIG1heF95X2F4aXNfcmlnaHQuc2V0KDApXG59XG5cbmxldCB0b2RheSA9IG5ldyBEYXRlKCk7IHRvZGF5LnNldEhvdXJzKDAsMCwwLDApO1xubGV0IHRvID0gbmV3IERhdGUodG9kYXkuZ2V0VGltZSgpIC0gMTAwMCo2MCo2MCoyNCooZGF5c19hZ28tMSkpO1xubGV0IGZyb20gPSBuZXcgRGF0ZSh0b2RheS5nZXRUaW1lKCkgLSAxMDAwKjYwKjYwKjI0KmRheXNfYWdvKTtcblxubGV0IGhlaWdodCA9IDEwMDtcbmxldCB3aWR0aCA9IDUwMDtcblxubGV0IGdhbWVzID0ge307XG5sZXQgZGF0YV9jaHVua3MgPSBbXTtcbmxldCBsYXN0X2RhdGEgPSBudWxsO1xuJDogZ2FtZV9ib3hfYXJ0X3dpZHRoID0gaGVpZ2h0KjAuNDtcbiQ6IGdhbWVfYm94X2FydF9oZWlnaHQgPSBoZWlnaHQqMC41O1xuXG5sZXQgc3ZnO1xuXG5sZXQgdG9fdGltZXN0YW1wID0gdG8uZ2V0VGltZSgpLzEwMDA7XG5sZXQgZnJvbV90aW1lc3RhbXAgPSBmcm9tLmdldFRpbWUoKS8xMDAwO1xuZnVuY3Rpb24geHNjYWxlKHgpIHtcbiAgcmV0dXJuIHdpZHRoICogKHggLSBmcm9tX3RpbWVzdGFtcCkgLyAoMjQqNjAqNjApO1xufVxuZnVuY3Rpb24gaXhzY2FsZSh4KSB7XG4gIHJldHVybiB4IC8gd2lkdGggKiAoMjQqNjAqNjApICsgZnJvbV90aW1lc3RhbXBcbn1cbmZ1bmN0aW9uIHlzY2FsZSh4KSB7XG4gIHJldHVybiBoZWlnaHQgKiAoJG1heF95X2F4aXMgLSB4KSAvICRtYXhfeV9heGlzO1xufVxuZnVuY3Rpb24geXNjYWxlX3JpZ2h0KHgpIHtcbiAgcmV0dXJuIGhlaWdodCAqICgkbWF4X3lfYXhpc19yaWdodCAtIHgpIC8gJG1heF95X2F4aXNfcmlnaHQgKyAzO1xufVxuZnVuY3Rpb24gdXBkYXRlX3BhdGgoKSB7XG4gIGZvcihsZXQgZGF0YSBvZiBkYXRhX2NodW5rcyl7XG4gICAgZGF0YS5wYXRoID0gW1xuICAgICAgYE0ke3hzY2FsZShkYXRhWzBdWzBdKX0sJHtoZWlnaHR9YCArXG4gICAgICAgIGRhdGEubWFwKGQ9PlxuICAgICAgICAgIGBMJHt4c2NhbGUoZFswXSl9LCR7eXNjYWxlKGRbMV0pfWBcbiAgICAgICAgKS5qb2luKFwiXCIpICsgXG4gICAgICAgIGBMJHt4c2NhbGUoZGF0YVtkYXRhLmxlbmd0aC0xXVswXSl9LCR7aGVpZ2h0fWAgK1xuICAgICAgICBgTCR7eHNjYWxlKGRhdGFbMF1bMF0pfSwke2hlaWdodH1gLFxuICAgICAgYE0ke3hzY2FsZShkYXRhWzBdWzBdKX0sJHtoZWlnaHR9YCArXG4gICAgICAgIGRhdGEubWFwKGQ9PlxuICAgICAgICAgIGBMJHt4c2NhbGUoZFswXSl9LCR7eXNjYWxlKGRbMl0pfWBcbiAgICAgICAgKS5qb2luKFwiXCIpICsgXG4gICAgICAgIGBMJHt4c2NhbGUoZGF0YVtkYXRhLmxlbmd0aC0xXVswXSl9LCR7aGVpZ2h0fWAgK1xuICAgICAgICBgTCR7eHNjYWxlKGRhdGFbMF1bMF0pfSwke2hlaWdodH1gLCBcbiAgICAgIGBNJHt4c2NhbGUoZGF0YVswXVswXSl9LCR7eXNjYWxlX3JpZ2h0KGRhdGFbMF1bNF0pfWAgK1xuICAgICAgICBkYXRhLm1hcChkPT5cbiAgICAgICAgICBgTCR7eHNjYWxlKGRbMF0pfSwke3lzY2FsZV9yaWdodChkWzRdKX1gXG4gICAgICAgICkuam9pbihcIlwiKSxcbiAgICBdO1xuICB9XG4gIGRhdGFfY2h1bmtzID0gZGF0YV9jaHVua3M7XG59XG5sZXQgbGFzdF9tYXhfeV9heGlzID0gJG1heF95X2F4aXM7XG5sZXQgbGFzdF9tYXhfeV9heGlzX3JpZ2h0ID0gJG1heF95X2F4aXNfcmlnaHQ7XG4kOiBpZihkYXRhX2NodW5rcyAmJiAoKGxhc3RfbWF4X3lfYXhpcyAhPSAkbWF4X3lfYXhpcykgfHwgKGxhc3RfbWF4X3lfYXhpc19yaWdodCAhPSAkbWF4X3lfYXhpc19yaWdodCkpKSB7XG4gIGxhc3RfbWF4X3lfYXhpcyA9ICRtYXhfeV9heGlzO1xuICBsYXN0X21heF95X2F4aXNfcmlnaHQgPSAkbWF4X3lfYXhpc19yaWdodDtcbiAgdXBkYXRlX3BhdGgoKTtcbn1cblxubGV0IG5vd194ID0gbnVsbDtcblxub25Nb3VudChhc3luYyAoKT0+IHtcblx0d2lkdGggPSBzdmcuZ2V0Qm91bmRpbmdDbGllbnRSZWN0KCkud2lkdGg7XG4gIG5vd194ID0geHNjYWxlKG5ldyBEYXRlKCkuZ2V0VGltZSgpLzEwMDApO1xuICBsZXQge3N0cmVhbV9jaGFuZ2VzLCBzdHJlYW1fbWV0YWRhdGFfY2hhbmdlc30gPSBhd2FpdCBBUEkudGltZWxpbmUoc3RyZWFtZXIuaWQsIGZyb20sIHRvKTtcbiAgbGFzdF9kYXRhID0gc3RyZWFtX2NoYW5nZXNbc3RyZWFtX2NoYW5nZXMubGVuZ3RoLTFdO1xuICBtYXhfeV9heGlzLnVwZGF0ZSh4ID0+IE1hdGgubWF4KHgsIC4uLnN0cmVhbV9jaGFuZ2VzLm1hcChkPT5NYXRoLm1heChkWzJdLCBkWzFdKSkpKTtcbiAgbWF4X3lfYXhpc19yaWdodC51cGRhdGUoeCA9PiBNYXRoLm1heCh4LCAuLi5zdHJlYW1fY2hhbmdlcy5tYXAoZD0+ZFs0XSkpKTtcbiAgbGV0IGo9MDtcbiAgbGV0IG1ldGFkYXRhcyA9IHN0cmVhbV9jaGFuZ2VzLm1hcCh4ID0+IHtcbiAgICB3aGlsZShzdHJlYW1fbWV0YWRhdGFfY2hhbmdlcy5sZW5ndGggPiBqICYmIHhbMF0gPj0gc3RyZWFtX21ldGFkYXRhX2NoYW5nZXNbal0udGltZSkgKytqO1xuICAgIGlmKHhbMV0gPT09IG51bGwpIHJldHVybiBudWxsO1xuICAgIGVsc2UgaWYoaj4wKSByZXR1cm4gc3RyZWFtX21ldGFkYXRhX2NoYW5nZXNbai0xXTtcbiAgICBlbHNlIHJldHVybiBudWxsO1xuICB9KTtcbiAgc3RyZWFtX2NoYW5nZXMgPSBzdHJlYW1fY2hhbmdlcy5tYXAoKGQsIGkpPT5bLi4uZCwgbWV0YWRhdGFzW2ldXSk7XG4gIGxldCBzbV9uID0gMywgY2hhdHRpbmdfc3BlZWRfc20gPSBbc3RyZWFtX2NoYW5nZXMuc2xpY2UoMCwgc21fbikucmVkdWNlKChhLGIpPT5hK2JbNF0sIDApL3NtX25dO1xuICBmb3IobGV0IGk9c21fbiwgbD1zdHJlYW1fY2hhbmdlcy5sZW5ndGgsIHNtPWNoYXR0aW5nX3NwZWVkX3NtWzBdOyBpPGw7ICsraSl7XG4gICAgc20gPSBzbSArIChzdHJlYW1fY2hhbmdlc1tpXVs0XSAtIHN0cmVhbV9jaGFuZ2VzW2ktc21fbl1bNF0pL3NtX247XG4gICAgY2hhdHRpbmdfc3BlZWRfc20ucHVzaChzbSk7XG4gIH1cbiAgZm9yKGxldCBpPTAsIHNtPTA7IGk8TWF0aC5taW4oc21fbiwgc3RyZWFtX2NoYW5nZXMubGVuZ3RoKTsgKytpKXtcbiAgICBzbSA9IHNtKmkvKGkrMSkgKyBzdHJlYW1fY2hhbmdlc1tpXVs0XS8oaSsxKTtcbiAgICBzdHJlYW1fY2hhbmdlc1tpXVs0XSA9IHNtO1xuICB9XG4gIGZvcihsZXQgaT0wLCBsPWNoYXR0aW5nX3NwZWVkX3NtLmxlbmd0aDsgaTxsOyArK2kpXG4gICAgc3RyZWFtX2NoYW5nZXNbTWF0aC5taW4oc3RyZWFtX2NoYW5nZXMubGVuZ3RoLTEsIGkgKyBzbV9uLTEpXVs0XSA9IGNoYXR0aW5nX3NwZWVkX3NtW2ldO1xuXG5cdHN2Zy5vbm1vdXNlbW92ZSA9IGZ1bmN0aW9uKGUpe1xuXHRcdGxldCB4ID0gZS5jbGllbnRYIC0gc3ZnLmdldEJvdW5kaW5nQ2xpZW50UmVjdCgpLngsIFxuXHRcdFx0XHR5ID0gZS5jbGllbnRZIC0gc3ZnLmdldEJvdW5kaW5nQ2xpZW50UmVjdCgpLnk7XG4gICAgdG9vbHRpcF94ID0geDsgXG4gICAgdG9vbHRpcF95ID0geTtcbiAgICBsZXQgdGFyZ2V0X2RhdGUgPSBpeHNjYWxlKHgpO1xuICAgIGxldCByaWdodF9pbmRleCA9IHN0cmVhbV9jaGFuZ2VzLmZpbmRJbmRleChkID0+IGRbMF0gPj0gdGFyZ2V0X2RhdGUpLFxuICAgICAgICBsZWZ0X2luZGV4ID0gZmluZExhc3RJbmRleChzdHJlYW1fY2hhbmdlcywgZCA9PiBkWzBdIDw9IHRhcmdldF9kYXRlKTtcbiAgICBsZXQgbmVhcmVzdF9pbmRleDsgXG4gICAgaWYocmlnaHRfaW5kZXggPj0gMCAmJiBsZWZ0X2luZGV4ID49IDApIFxuICAgICAgbmVhcmVzdF9pbmRleCA9IE1hdGguYWJzKHN0cmVhbV9jaGFuZ2VzW2xlZnRfaW5kZXhdWzBdIC0gdGFyZ2V0X2RhdGUpIDw9IE1hdGguYWJzKHN0cmVhbV9jaGFuZ2VzW3JpZ2h0X2luZGV4XVswXSAtIHRhcmdldF9kYXRlKT9cbiAgICAgICAgbGVmdF9pbmRleDogcmlnaHRfaW5kZXg7XG4gICAgZWxzZSBpZihyaWdodF9pbmRleCA+PSAwKVxuICAgICAgbmVhcmVzdF9pbmRleCA9IHJpZ2h0X2luZGV4O1xuICAgIGVsc2UgaWYobGVmdF9pbmRleCA+PSAwKVxuICAgICAgbmVhcmVzdF9pbmRleCA9IGxlZnRfaW5kZXg7XG4gICAgZWxzZSB7XG4gICAgICB0b29sdGlwX2RhdGEgPSBudWxsO1xuICAgICAgcmV0dXJuO1xuICAgIH1cblxuICAgIGlmKE1hdGguYWJzKHN0cmVhbV9jaGFuZ2VzW25lYXJlc3RfaW5kZXhdWzBdIC0gdGFyZ2V0X2RhdGUpIDwgNjAqNjApeyAvLyB8fCByaWdodF9pbmRleCAhPSAwICYmIG1ldGFkYXRhc1tyaWdodF9pbmRleF0uc3RhcnRlZF9hdCA9PSBtZXRhZGF0YXNbcmlnaHRfaW5kZXgtMV0uc3RhcnRlZF9hdCkge1xuICAgICAgdG9vbHRpcF9kYXRhID0gc3RyZWFtX2NoYW5nZXNbbmVhcmVzdF9pbmRleF07XG4gICAgfVxuICAgIGVsc2UgXG4gICAgICB0b29sdGlwX2RhdGEgPSBudWxsO1xuICB9XG4gIHN2Zy5vbm1vdXNlbGVhdmUgPSBmdW5jdGlvbihlKXtcbiAgICB0b29sdGlwX2RhdGEgPSBudWxsO1xuICB9XG4gIGRhdGFfY2h1bmtzLnB1c2goW10pO1xuXHRmb3IobGV0IGk9MCwgbD1zdHJlYW1fY2hhbmdlcy5sZW5ndGgsIGo9MDsgaTxsOyArK2kpIHtcbiAgIFx0ICBpZihpPjAgJiYgbWV0YWRhdGFzW2ldICE9IG1ldGFkYXRhc1tpLTFdICYmIFxuICAgICAgICAgICgobWV0YWRhdGFzW2ldID09IG51bGwgfHwgbWV0YWRhdGFzW2ktMV0gPT0gbnVsbCkgfHwgXG4gICAgICAgICAgICBtZXRhZGF0YXNbaV0uc3RhcnRlZF9hdCAhPSBtZXRhZGF0YXNbaS0xXS5zdGFydGVkX2F0IHx8IFxuICAgICAgICAgICAgKG1ldGFkYXRhc1tpXS5nYW1lICYmIG1ldGFkYXRhc1tpXS5nYW1lLmlkKSAhPSAobWV0YWRhdGFzW2ktMV0uZ2FtZSAmJiBtZXRhZGF0YXNbaS0xXS5nYW1lLmlkKSB8fFxuICAgICAgICAgICAgbWV0YWRhdGFzW2ldLnRpdGxlICE9IG1ldGFkYXRhc1tpLTFdLnRpdGxlKSl7XG4gICAgICAgICsrajtcbiAgICAgICAgZGF0YV9jaHVua3MucHVzaChbXSk7XG4gICAgICAgIGlmKG1ldGFkYXRhc1tpXSAmJiBtZXRhZGF0YXNbaS0xXSAmJiBtZXRhZGF0YXNbaV0uc3RhcnRlZF9hdCA9PSBtZXRhZGF0YXNbaS0xXS5zdGFydGVkX2F0KXtcbiAgICAgICAgICBsZXQgbWlkID0gc3RyZWFtX2NoYW5nZXNbaV0uc2xpY2UoMCwgNSkubWFwKChkLCBqKSA9PiBNYXRoLmZsb29yKChkICsgc3RyZWFtX2NoYW5nZXNbaS0xXVtqXSkqMC41KSk7XG4gICAgICAgICAgZGF0YV9jaHVua3Nbai0xXS5wdXNoKFsuLi5taWQsIG1ldGFkYXRhc1tpLTFdXSlcbiAgICAgICAgICBkYXRhX2NodW5rc1tqXS5wdXNoKFsuLi5taWQsIG1ldGFkYXRhc1tpXV0pXG4gICAgICAgIH1cbiAgICAgIH1cbiAgICAgIGRhdGFfY2h1bmtzW2pdLnB1c2goc3RyZWFtX2NoYW5nZXNbaV0pXG4gIH1cbiAgdXBkYXRlX3BhdGgoKTtcbiAgZGF0YV9jaHVua3MgPSBkYXRhX2NodW5rcztcbiAgZm9yKGxldCBkYXRhIG9mIGRhdGFfY2h1bmtzKXtcbiAgXHRpZihkYXRhWzBdID09IG51bGwgfHwgZGF0YVswXVs1XSA9PSBudWxsIHx8IGRhdGFbMF1bNV0uZ2FtZSA9PSBudWxsKSBjb250aW51ZTtcblx0XHRnYW1lc1tkYXRhWzBdWzVdLmdhbWUuaWRdID0gZGF0YVswXVs1XS5nYW1lO1xuXHR9XG59KTtcbjwvc2NyaXB0PlxuXG48c3R5bGU+XG4uaXNfc3RyZWFtaW5nX2xhYmVsIHtcbiAgYW5pbWF0aW9uOiBibGlua2VyIDFzIGxpbmVhciBpbmZpbml0ZTtcbn1cbkBrZXlmcmFtZXMgYmxpbmtlciB7XG4gIDUwJSB7XG4gICAgb3BhY2l0eTogMDtcbiAgfVxufVxuPC9zdHlsZT5cbiIsIjxkaXYgY2xhc3M9XCJ7JCRwcm9wcy5jbGFzc30gcmVsYXRpdmVcIj5cbjxjYW52YXMgYmluZDp0aGlzPXtjYW52YXN9IGNsYXNzPVwidy1mdWxsXCI+XG48L2NhbnZhcz5cbjxjYW52YXMgYmluZDp0aGlzPXt1aV9jYW52YXN9IGNsYXNzPVwiYWJzb2x1dGUgdy1mdWxsIGgtZnVsbFwiIG9uOm1vdXNlbW92ZT17bW91c2Vtb3ZlfSBvbjptb3VzZW92ZXI9e21vdXNlb3Zlcn0gb246bW91c2VsZWF2ZT17bW91c2VsZWF2ZX0+XG48L2NhbnZhcz5cbjwvZGl2PlxuXG48c2NyaXB0IGNvbnRleHQ9XCJtb2R1bGVcIj5cbmZ1bmN0aW9uIGlzX292ZXJsYXAocmFuZ2VzLCBwb2ludCl7XG4gIGxldCByZXMgPSByYW5nZXMuc29tZShyYW5nZSA9PiByYW5nZVswXSA8PSBwb2ludCAmJiBwb2ludCA8PSByYW5nZVsxXSlcbiAgcmV0dXJuIHJlcztcbn1cbmZ1bmN0aW9uIGZpbGxfaG9sZShyYW5nZXMsIGludGVydmFsKXtcbiAgbGV0IGZpbGxlZCA9IFtyYW5nZXNbMF1dO1xuICBmb3IobGV0IGk9MSwgbD1yYW5nZXMubGVuZ3RoOyBpPGw7ICsraSl7XG4gICAgbGV0IGxhc3QgPSBmaWxsZWQucG9wKCk7XG4gICAgaWYoTWF0aC5hYnMocmFuZ2VzW2ldWzBdIC0gbGFzdFsxXSkgPCBpbnRlcnZhbClcbiAgICAgIGZpbGxlZC5wdXNoKFtsYXN0WzBdLCByYW5nZXNbaV1bMV1dKTtcbiAgICBlbHNle1xuICAgICAgZmlsbGVkLnB1c2gobGFzdCk7XG4gICAgICBmaWxsZWQucHVzaChyYW5nZXNbaV0pO1xuICAgIH1cbiAgfVxuICByZXR1cm4gZmlsbGVkO1xufVxuPC9zY3JpcHQ+XG5cbjxzY3JpcHQ+XG5pbXBvcnQgeyBvbk1vdW50IH0gZnJvbSBcInN2ZWx0ZVwiO1xuaW1wb3J0IHsgQVBJIH0gZnJvbSAnLi4vYXBpLmpzJztcbmV4cG9ydCBsZXQgc3RyZWFtZXI7XG5leHBvcnQgbGV0IG1lYW5fc3RyZWFtaW5nX3RpbWVfcmFuZ2VzID0gW107XG5leHBvcnQgbGV0IG1lYW5fc3RyZWFtaW5nX3RpbWVfcmVsaWFiaWxpdHkgPSAwLjA7XG5leHBvcnQgbGV0IHN0cmVhbWluZ190aW1lX3Jhbmdlc192YXJpYW5jZSA9IDAuMDtcbmV4cG9ydCBsZXQgdG90YWxfc3RyZWFtaW5nX3RpbWVfcmF0aW8gPSAwLjA7XG5leHBvcnQgbGV0IHN0cmVhbWluZ190aW1lX3Jhbmdlc19yZWd1bGFyaXR5ID0gMC4wOyBcbmV4cG9ydCBsZXQgc3RyZWFtaW5nX3N0YXJ0X3RpbWUgPSAwLjA7IFxuZXhwb3J0IGxldCBzdHJlYW1pbmdfZW5kX3RpbWUgPSAwLjA7IFxuZXhwb3J0IGxldCBzdHJlYW1pbmdfc3RhcnRfdGltZV9zdGQ9IDAuMDsgXG5leHBvcnQgbGV0IHN0cmVhbWluZ19lbmRfdGltZV9zdGQ9IDAuMDsgXG5jb25zdCBkYXlzX2FnbyA9IDcqODtcbmNvbnN0IGludGVydmFsID0gNjAqNjAqMjQ7XG5sZXQgdG9kYXkgPSBuZXcgRGF0ZSgpOyB0b2RheS5zZXRIb3VycygwLDAsMCwwKTtcbmxldCB0byA9IG5ldyBEYXRlKHRvZGF5LmdldFRpbWUoKSArIDEwMDAqNjAqNjAqMjQpO1xubGV0IGZyb20gPSBuZXcgRGF0ZSh0b2RheS5nZXRUaW1lKCkgLSAxMDAwKjYwKjYwKjI0KihkYXlzX2Fnby0xKSk7XG5cbmxldCBjYW52YXM7XG5sZXQgdWlfY2FudmFzO1xuXG5sZXQgbGFzdF9zdHJlYW1lciA9IG51bGw7XG5cbmxldCBtb3VzZV9pbiA9IGZhbHNlO1xubGV0IG1vdXNlX3ggPSAwOyBcbmxldCBtb3VzZV95ID0gMDtcbmZ1bmN0aW9uIG1vdXNlbW92ZShlKXtcbiAgbW91c2VfaW4gPSB0cnVlO1xuICBtb3VzZV94ID0gZS5jbGllbnRYIC0gY2FudmFzLmdldEJvdW5kaW5nQ2xpZW50UmVjdCgpLng7XG4gIG1vdXNlX3kgPSBlLmNsaWVudFkgLSBjYW52YXMuZ2V0Qm91bmRpbmdDbGllbnRSZWN0KCkueTtcbn1cbmZ1bmN0aW9uIG1vdXNlb3Zlcigpe1xuICBtb3VzZV9pbiA9IHRydWU7XG59XG5mdW5jdGlvbiBtb3VzZWxlYXZlKCl7XG4gIG1vdXNlX2luID0gZmFsc2U7XG59XG5cbiQ6IGlmKGNhbnZhcyAmJiBsYXN0X3N0cmVhbWVyICE9IHN0cmVhbWVyKSB7XG4gIGxhc3Rfc3RyZWFtZXIgPSBzdHJlYW1lcjtcbiAgbWVhbl9zdHJlYW1pbmdfdGltZV9yYW5nZXMgPSBbXTtcbiAgdG90YWxfc3RyZWFtaW5nX3RpbWVfcmF0aW8gPSAwLjA7XG4gIHN0cmVhbWluZ190aW1lX3Jhbmdlc192YXJpYW5jZSA9IDAuMDtcbiAgbWVhbl9zdHJlYW1pbmdfdGltZV9yZWxpYWJpbGl0eSA9IDAuMDtcbiAgQVBJLnN0cmVhbV9yYW5nZXMoc3RyZWFtZXIuaWQsIGZyb20sIHRvKS50aGVuKHN0cmVhbV9yYW5nZXMgPT4ge1xuICAvL2xldCBzdHJlYW1fcmFuZ2VzID0gYXdhaXQgQVBJLnN0cmVhbV9yYW5nZXMoc3RyZWFtZXIuaWQsIGZyb20sIHRvKTtcbiAgaWYoIXN0cmVhbV9yYW5nZXMpXG4gICAgcmV0dXJuIG51bGw7XG4gIGxldCB0cmltZWRfZnJvbSA9IG5ldyBEYXRlKHN0cmVhbV9yYW5nZXNbMF1bMF0qMTAwMCk7IHRyaW1lZF9mcm9tLnNldEhvdXJzKDAsMCwwLDApO1xuICBsZXQgZnJvbV90aW1lc3RhbXAgPSBNYXRoLnJvdW5kKHRyaW1lZF9mcm9tLmdldFRpbWUoKS8xMDAwKSxcbiAgICAgIHRvX3RpbWVzdGFtcCA9IE1hdGgucm91bmQodG8uZ2V0VGltZSgpLzEwMDApO1xuICBsZXQgY2h1bmtzID0gW1tdXTtcbiAgZm9yKGxldCBpPTAsIGo9MCwgbD1zdHJlYW1fcmFuZ2VzLmxlbmd0aDsgaTxsOyArK2kpe1xuICAgIHRvdGFsX3N0cmVhbWluZ190aW1lX3JhdGlvICs9IChzdHJlYW1fcmFuZ2VzW2ldWzFdIC0gc3RyZWFtX3Jhbmdlc1tpXVswXSkgLyAodG9fdGltZXN0YW1wIC0gc3RyZWFtX3Jhbmdlc1swXVswXSk7XG4gICAgd2hpbGUoc3RyZWFtX3Jhbmdlc1tpXVsxXSA+PSBmcm9tX3RpbWVzdGFtcCArIChqKzIpKmludGVydmFsKSB7XG4gICAgICBjaHVua3MucHVzaChbXSk7XG4gICAgICArK2o7XG4gICAgICBjb250aW51ZTtcbiAgICB9XG4gICAgaWYoc3RyZWFtX3Jhbmdlc1tpXVsxXSA+PSBmcm9tX3RpbWVzdGFtcCArIChqKzEpKmludGVydmFsKSB7XG4gICAgICBjaHVua3MucHVzaChbXSk7XG4gICAgICBpZihzdHJlYW1fcmFuZ2VzW2ldWzBdIDwgZnJvbV90aW1lc3RhbXAgKyAoaisxKSppbnRlcnZhbCkge1xuICAgICAgICBjaHVua3Nbal0ucHVzaChbKHN0cmVhbV9yYW5nZXNbaV1bMF0gLSBmcm9tX3RpbWVzdGFtcCkgJSBpbnRlcnZhbCwgaW50ZXJ2YWxdKVxuICAgICAgICBjaHVua3NbaisxXS5wdXNoKFswLCAoc3RyZWFtX3Jhbmdlc1tpXVsxXSAtIGZyb21fdGltZXN0YW1wKSAlIGludGVydmFsXSk7XG4gICAgICB9XG4gICAgICBlbHNlIHtcbiAgICAgICAgY2h1bmtzW2orMV0ucHVzaChzdHJlYW1fcmFuZ2VzW2ldLm1hcCh2ID0+ICh2LWZyb21fdGltZXN0YW1wKSVpbnRlcnZhbCkpO1xuICAgICAgfVxuICAgICAgKytqO1xuICAgICAgY29udGludWU7XG4gICAgfVxuICAgIGNodW5rc1tqXS5wdXNoKHN0cmVhbV9yYW5nZXNbaV0ubWFwKHYgPT4gKHYtZnJvbV90aW1lc3RhbXApJWludGVydmFsKSk7XG4gIH1cbiAgbGV0IHNwbGl0cyA9IG5ldyBTZXQoKTtcbiAgZm9yKGxldCByYW5nZXMgb2YgY2h1bmtzKXtcbiAgICBmb3IobGV0IHJhbmdlIG9mIHJhbmdlcyl7XG4gICAgICBzcGxpdHMuYWRkKHJhbmdlWzBdKTtcbiAgICAgIHNwbGl0cy5hZGQocmFuZ2VbMV0pO1xuICAgIH1cbiAgfVxuICBzcGxpdHMgPSBbLi4uc3BsaXRzXS5zb3J0KChhLGIpPT5hLWIpO1xuICBsZXQgbWVhbiA9IFtdLFxuICAgICAgdG90YWwgPSAwO1xuICBmb3IobGV0IGk9MCwgbD1zcGxpdHMubGVuZ3RoLTE7IGk8bDsgKytpKSBcbiAgICBtZWFuLnB1c2goY2h1bmtzLnJlZHVjZSgocmVzLCByYW5nZXMpPT5yZXMgKyAoaXNfb3ZlcmxhcChyYW5nZXMsIChzcGxpdHNbaV0gKyBzcGxpdHNbaSsxXSkqMC41KT8gMTowKSwgMCkgLyBjaHVua3MubGVuZ3RoKTtcbiAgZm9yKGxldCBpPTAsIGw9bWVhbi5sZW5ndGg7IGk8bDsgKytpKSBcbiAgICB0b3RhbCArPSBtZWFuW2ldPjA/IHNwbGl0c1tpKzFdLXNwbGl0c1tpXTogMDtcbiAgc3RyZWFtaW5nX3RpbWVfcmFuZ2VzX3ZhcmlhbmNlID0gY2h1bmtzLnJlZHVjZSgocmVzLHJhbmdlcyk9PntcbiAgICBsZXQgdiA9IG1lYW4ubWFwKCh2LCBpKT0+TWF0aC5hYnMoaXNfb3ZlcmxhcChyYW5nZXMsIChzcGxpdHNbaV0gKyBzcGxpdHNbaSsxXSkqMC41KSAtIHYpKihzcGxpdHNbaSsxXS1zcGxpdHNbaV0pKS5yZWR1Y2UoKGEsYik9PmErYikgLyB0b3RhbDtcbiAgICByZXR1cm4gcmVzICsgdip2O1xuICB9LCAwKSAvIGNodW5rcy5sZW5ndGg7XG4gIGxldCBmaWxsZWRfcmFuZ2VzID0gZmlsbF9ob2xlKHN0cmVhbV9yYW5nZXMsIDYwKjYwKS5tYXAodj0+Wyh2WzBdLWZyb21fdGltZXN0YW1wKSVpbnRlcnZhbCAvIGludGVydmFsLCAodlsxXS1mcm9tX3RpbWVzdGFtcCklaW50ZXJ2YWwgLyBpbnRlcnZhbF0pO1xuICBsZXQgbWVhbjIgPSBmaWxsZWRfcmFuZ2VzLnJlZHVjZSgoYSxiKT0+W2FbMF0rYlswXSwgYVsxXStiWzFdXSkubWFwKHY9PnYvZmlsbGVkX3Jhbmdlcy5sZW5ndGgpO1xuICBsZXQgdmFyMiA9IGZpbGxlZF9yYW5nZXMucmVkdWNlKChyZXMsdikgPT4gW3Jlc1swXSArICh2WzBdLW1lYW4yWzBdKSoodlswXS1tZWFuMlswXSksIHJlc1sxXSArICh2WzFdLW1lYW4yWzFdKSoodlsxXS1tZWFuMlsxXSldLCBbMCwwXSkubWFwKHY9PnYvZmlsbGVkX3Jhbmdlcy5sZW5ndGgpO1xuICBzdHJlYW1pbmdfdGltZV9yYW5nZXNfcmVndWxhcml0eSAgPSAwLjA7XG4gIGZvcihsZXQgaT0wLCBsPWNodW5rcy5sZW5ndGg7IGk8bDsgKytpKXtcbiAgICBmb3IobGV0IGo9aSsxOyBqPGw7ICsrail7XG4gICAgICBsZXQgZGlmZiA9IDA7XG4gICAgICBmb3IobGV0IGs9MCwgbT1zcGxpdHMubGVuZ3RoLTE7IGs8bTsgKytrKVxuICAgICAgICBkaWZmICs9IE1hdGguYWJzKGlzX292ZXJsYXAoY2h1bmtzW2ldLCAoc3BsaXRzW2srMV0gKyBzcGxpdHNba10pKjAuNSkgLSBpc19vdmVybGFwKGNodW5rc1tqXSwgKHNwbGl0c1trKzFdICsgc3BsaXRzW2tdKSowLjUpKSAqIChzcGxpdHNbaysxXS1zcGxpdHNba10pXG4gICAgICBzdHJlYW1pbmdfdGltZV9yYW5nZXNfcmVndWxhcml0eSArPSBkaWZmIC8gdG90YWw7XG4gICAgfVxuICB9XG4gIHN0cmVhbWluZ190aW1lX3Jhbmdlc19yZWd1bGFyaXR5ID0gc3RyZWFtaW5nX3RpbWVfcmFuZ2VzX3JlZ3VsYXJpdHkgLyAoKGNodW5rcy5sZW5ndGgpICogKGNodW5rcy5sZW5ndGgtMSkgLyAyKVxuICBsZXQgYSA9IDAsIGI9MDtcbiAgbGV0IG1lYW5fb2ZfbWVhbiA9IG1lYW4ubWFwKCh2LCBpKSA9PiAoc3BsaXRzW2krMV0gLSBzcGxpdHNbaV0pICogdikucmVkdWNlKChhLGIpPT5hK2IpIC8gdG90YWw7XG4gIG1lYW5fb2ZfbWVhbiA9IDAuNTtcbiAgbWVhbl9zdHJlYW1pbmdfdGltZV9yZWxpYWJpbGl0eSA9IFxuICAgIG1lYW4ubWFwKCh2LCBpKSA9PiB2ID49IG1lYW5fb2ZfbWVhbj8gKHNwbGl0c1tpKzFdLXNwbGl0c1tpXSkqdjogMCkucmVkdWNlKChhLGIpPT5hK2IpIC8gXG4gICAgbWVhbi5tYXAoKHYsIGkpID0+IHYgPj0gbWVhbl9vZl9tZWFuPyAoc3BsaXRzW2krMV0tc3BsaXRzW2ldKTogMCkucmVkdWNlKChhLGIpPT5hK2IpO1xuICBsZXQgY2lyY2xpbmcgPSAoc3BsaXRzWzBdID09IDAgJiYgc3BsaXRzW3NwbGl0cy5sZW5ndGgtMV0gPT0gaW50ZXJ2YWwpLFxuICAgICAgaV9zdGFydCA9IDAsIG1lYW5fbGVuZ3RoID0gbWVhbi5sZW5ndGg7XG4gIGlmKGNpcmNsaW5nICYmIG1lYW5bMF0gPj0gbWVhbl9vZl9tZWFuKVxuICAgIHdoaWxlKG1lYW5bKGlfc3RhcnQtMSArIG1lYW5fbGVuZ3RoKSAlIG1lYW5fbGVuZ3RoXSA+PSBtZWFuX29mX21lYW4gJiYgaV9zdGFydCA+PSAtbWVhbl9sZW5ndGgpIFxuICAgICAgaV9zdGFydCAtPSAxO1xuICBmb3IobGV0IGk9MCwgbD1tZWFuLmxlbmd0aDsgaTxsOyArK2kpIHtcbiAgICBpZihtZWFuWyhpK2lfc3RhcnQrbCklbF0gPj0gbWVhbl9vZl9tZWFuKSB7XG4gICAgICBsZXQgbGFzdF9yYW5nZSA9IG1lYW5fc3RyZWFtaW5nX3RpbWVfcmFuZ2VzLnBvcCgpO1xuICAgICAgaWYobGFzdF9yYW5nZSAmJiBNYXRoLmFicyhsYXN0X3JhbmdlWzFdICUgaW50ZXJ2YWwgLSBzcGxpdHNbKGkraV9zdGFydCtsKSVsXSAlIGludGVydmFsKSA8PSA2MCo2MClcbiAgICAgICAgbWVhbl9zdHJlYW1pbmdfdGltZV9yYW5nZXMucHVzaChbbGFzdF9yYW5nZVswXSwgc3BsaXRzWyhpK2lfc3RhcnQrbCklbCsxXV0pO1xuICAgICAgZWxzZXtcbiAgICAgICAgaWYobGFzdF9yYW5nZSkgbWVhbl9zdHJlYW1pbmdfdGltZV9yYW5nZXMucHVzaChsYXN0X3JhbmdlKTtcbiAgICAgICAgbWVhbl9zdHJlYW1pbmdfdGltZV9yYW5nZXMucHVzaChbc3BsaXRzWyhpK2lfc3RhcnQrbCklbF0sIHNwbGl0c1soaStpX3N0YXJ0K2wpJWwrMV1dKTtcbiAgICAgIH1cbiAgICB9XG4gIH1cbiAgaWYobWVhbl9zdHJlYW1pbmdfdGltZV9yYW5nZXMubGVuZ3RoPjEgJiYgTWF0aC5hYnMobWVhbl9zdHJlYW1pbmdfdGltZV9yYW5nZXNbbWVhbl9zdHJlYW1pbmdfdGltZV9yYW5nZXMubGVuZ3RoLTFdWzFdIC0gbWVhbl9zdHJlYW1pbmdfdGltZV9yYW5nZXNbMF1bMF0pIDw9IDYwKjYwKVxuICAgIG1lYW5fc3RyZWFtaW5nX3RpbWVfcmFuZ2VzWzBdWzBdID0gbWVhbl9zdHJlYW1pbmdfdGltZV9yYW5nZXMucG9wKClbMF1cbiAgbWVhbl9zdHJlYW1pbmdfdGltZV9yYW5nZXMgPSBtZWFuX3N0cmVhbWluZ190aW1lX3JhbmdlcztcblxuXG4gIGxldCBzdHJlYW1fcmFuZ2VzX3Byb2Nlc3NlZCA9IGZpbGxfaG9sZShzdHJlYW1fcmFuZ2VzLCA2MCo2MClcbiAgICAgIC5tYXAodj0+Wyh2WzBdLWZyb21fdGltZXN0YW1wKSVpbnRlcnZhbCwgKHZbMV0tZnJvbV90aW1lc3RhbXApJWludGVydmFsXSk7XG4gIGxldCBzdHJlYW1fcmFuZ2VzX3ZlY3RvciA9IHN0cmVhbV9yYW5nZXNfcHJvY2Vzc2VkXG4gICAgICAubWFwKHY9Plt2WzBdL2ludGVydmFsKk1hdGguUEkqMiwgdlsxXS9pbnRlcnZhbCpNYXRoLlBJKjJdKVxuICAgICAgLm1hcCh2PT5bW01hdGguc2luKHZbMF0pLCBNYXRoLmNvcyh2WzBdKV0sIFtNYXRoLnNpbih2WzFdKSwgTWF0aC5jb3ModlsxXSldXSk7XG4gIHN0cmVhbWluZ19zdGFydF90aW1lID0gKE1hdGguYXRhbjIoLi4uc3RyZWFtX3Jhbmdlc192ZWN0b3IucmVkdWNlKChhLCBzKSA9PiBbYVswXStzWzBdWzBdLCBhWzFdK3NbMF1bMV1dLCBbMCwwXSkpICsgTWF0aC5QSSoyKSUoTWF0aC5QSSoyKS8oTWF0aC5QSSoyKSAqIGludGVydmFsO1xuICBzdHJlYW1pbmdfZW5kX3RpbWUgPSAoTWF0aC5hdGFuMiguLi5zdHJlYW1fcmFuZ2VzX3ZlY3Rvci5yZWR1Y2UoKGEsIHMpID0+IFthWzBdK3NbMV1bMF0sIGFbMV0rc1sxXVsxXV0sIFswLDBdKSkgKyBNYXRoLlBJKjIpJShNYXRoLlBJKjIpLyhNYXRoLlBJKjIpICogaW50ZXJ2YWw7XG4gIC8vc3RyZWFtaW5nX3N0YXJ0X3RpbWUgPSBzdHJlYW1fcmFuZ2VzX3Byb2Nlc3NlZC5tYXAocz0+c1swXSkuc29ydCgpW01hdGguZmxvb3Ioc3RyZWFtX3Jhbmdlc19wcm9jZXNzZWQubGVuZ3RoLzIpXTtcbiAgLy9zdHJlYW1pbmdfZW5kX3RpbWUgPSBzdHJlYW1fcmFuZ2VzX3Byb2Nlc3NlZC5tYXAocz0+c1sxXSkuc29ydCgpW01hdGguZmxvb3Ioc3RyZWFtX3Jhbmdlc19wcm9jZXNzZWQubGVuZ3RoLzIpXTtcbiAgc3RyZWFtaW5nX3N0YXJ0X3RpbWVfc3RkID0gTWF0aC5zcXJ0KFxuICAgIHN0cmVhbV9yYW5nZXNfcHJvY2Vzc2VkXG4gICAgICAubWFwKHMgPT4gTWF0aC5hYnMoc1swXS1zdHJlYW1pbmdfc3RhcnRfdGltZSkpXG4gICAgICAubWFwKHYgPT4gdiA8IGludGVydmFsKjAuNT8gdjogaW50ZXJ2YWwtdilcbiAgICAgIC5yZWR1Y2UoKGEsIHMpID0+IGErcypzLCAwKS8oc3RyZWFtX3Jhbmdlc19wcm9jZXNzZWQubGVuZ3RoLTEpKTtcbiAgc3RyZWFtaW5nX2VuZF90aW1lX3N0ZCA9IE1hdGguc3FydChcbiAgICBzdHJlYW1fcmFuZ2VzX3Byb2Nlc3NlZFxuICAgICAgLm1hcChzID0+IE1hdGguYWJzKHNbMV0tc3RyZWFtaW5nX2VuZF90aW1lKSlcbiAgICAgIC5tYXAodiA9PiB2IDwgaW50ZXJ2YWwqMC41PyB2OiBpbnRlcnZhbC12KVxuICAgICAgLnJlZHVjZSgoYSwgcykgPT4gYStzKnMsIDApLyhzdHJlYW1fcmFuZ2VzX3Byb2Nlc3NlZC5sZW5ndGgtMSkpO1xuXG4gIGxldCB3aWR0aCA9IGNhbnZhcy5nZXRCb3VuZGluZ0NsaWVudFJlY3QoKS53aWR0aCxcbiAgICAgIGhlaWdodCA9IGNhbnZhcy5nZXRCb3VuZGluZ0NsaWVudFJlY3QoKS53aWR0aDtcbiAgY2FudmFzLndpZHRoID0gd2lkdGg7XG4gIGNhbnZhcy5oZWlnaHQgPSBoZWlnaHQ7XG4gIHVpX2NhbnZhcy53aWR0aCA9IHdpZHRoO1xuICB1aV9jYW52YXMuaGVpZ2h0ID0gaGVpZ2h0O1xuXG4gIGxldCBjdHggPSBjYW52YXMuZ2V0Q29udGV4dChcIjJkXCIpO1xuICAvL2N0eC5maWxsU3R5bGUgPSBcIiMyZDM3NDhcIjtcbiAgY3R4LmNsZWFyUmVjdCgwLCAwLCBjYW52YXMud2lkdGgsIGNhbnZhcy5oZWlnaHQpO1xuICBjdHguZmlsbFN0eWxlID0gXCIjQjQ5OEFFXCI7XG4gIGN0eC5zdHJva2VTdHlsZSA9IFwiIzJkMzc0OFwiO1xuICBjdHgudGV4dEFsaWduID0gXCJjZW50ZXJcIjtcbiAgY3R4LnRleHRCYXNlbGluZSA9IFwibWlkZGxlXCI7XG4gIFxuXG4gIGZyb21fdGltZXN0YW1wID0gTWF0aC5yb3VuZChmcm9tLmdldFRpbWUoKS8xMDAwKTtcbiAgdG9fdGltZXN0YW1wID0gTWF0aC5yb3VuZCh0by5nZXRUaW1lKCkvMTAwMCk7XG4gIGxldCBkYXlfdGV4dCA9IFtcIuydvFwiLCBcIuyblFwiLCBcIu2ZlFwiLCBcIuyImFwiLCBcIuuqqVwiLCBcIuq4iFwiLCBcIu2GoFwiXTtcbiAgbGV0IHRpY2tzID0gNzIwLFxuICAgICAgZm9udF9zaXplID0gMTUsXG4gICAgICBvdXRlcl9jaXJjbGVfd2lkdGggPSA1LFxuICAgICAgaW5uZXJfcGFkX2Zyb21fb3V0ZXJfY2lyY2xlID0gMzAsXG4gICAgICBvdXRlcl9wYWQgPSAzMCxcbiAgICAgIG1pbl9yID0gMC4wLFxuICAgICAgbWF4X3IgPSAxLjAgLSAob3V0ZXJfY2lyY2xlX3dpZHRoICsgb3V0ZXJfcGFkICsgaW5uZXJfcGFkX2Zyb21fb3V0ZXJfY2lyY2xlKS8od2lkdGgqMC41KSxcbiAgICAgIG5fc3BpbiA9IGRheXNfYWdvLzcsXG4gICAgICBoID0gKG1heF9yLW1pbl9yKSAvIChuX3NwaW4rMSksXG4gICAgICB0b3RhbF9hbmdsZSA9IG5fc3BpbiAqIE1hdGguUEkgKiAyLFxuICAgICAgYW5nbGVfc3RhcnQgPSAtTWF0aC5QSSowLjUgKyBNYXRoLlBJKjIvNypmcm9tLmdldERheSgpLFxuICAgICAgZGF5X3N0YXJ0ID0gZnJvbS5nZXREYXkoKTtcbiAgY3R4LmJlZ2luUGF0aCgpO1xuICBmb3IobGV0IHJhbmdlIG9mIHN0cmVhbV9yYW5nZXMpe1xuICAgIGxldCBpX2wgPSBNYXRoLnJvdW5kKHRpY2tzICogKHJhbmdlWzBdIC0gZnJvbV90aW1lc3RhbXApIC8gKHRvX3RpbWVzdGFtcCAtIGZyb21fdGltZXN0YW1wKSksXG4gICAgICAgIGlfciA9IE1hdGgucm91bmQodGlja3MgKiAocmFuZ2VbMV0gLSBmcm9tX3RpbWVzdGFtcCkgLyAodG9fdGltZXN0YW1wIC0gZnJvbV90aW1lc3RhbXApKTtcbiAgICBsZXQgdCA9IGlfbC90aWNrcyxcbiAgICAgICAgYW5nbGUgPSB0b3RhbF9hbmdsZSAqIHQgKyBhbmdsZV9zdGFydCxcbiAgICAgICAgZCA9IChtYXhfciAtIG1pbl9yIC0gaCkqdCArIG1pbl9yLFxuICAgICAgICBzeD13aWR0aCowLjUgKyBkKndpZHRoKjAuNSpNYXRoLmNvcyhhbmdsZSksXG4gICAgICAgIHN5PWhlaWdodCowLjUgKyBkKmhlaWdodCowLjUqTWF0aC5zaW4oYW5nbGUpO1xuICAgIGN0eC5tb3ZlVG8oc3gsIHN5KTtcbiAgICBmb3IobGV0IGk9aV9sKzE7aTw9aV9yOyArK2kpe1xuICAgICAgbGV0IHQgPSBpL3RpY2tzLFxuICAgICAgICAgIGFuZ2xlID0gdG90YWxfYW5nbGUgKiB0ICsgYW5nbGVfc3RhcnQsXG4gICAgICAgICAgZCA9IChtYXhfciAtIG1pbl9yIC0gaCkqdCArIG1pbl9yLFxuICAgICAgICAgIHg9d2lkdGgqMC41ICsgZCp3aWR0aCowLjUqTWF0aC5jb3MoYW5nbGUpLFxuICAgICAgICAgIHk9aGVpZ2h0KjAuNSArIGQqaGVpZ2h0KjAuNSpNYXRoLnNpbihhbmdsZSk7XG4gICAgICBjdHgubGluZVRvKHgsIHkpO1xuICAgIH1cbiAgICBmb3IobGV0IGk9aV9yOyBpPj1pX2w7IC0taSl7XG4gICAgICBsZXQgdCA9IGkvdGlja3MsXG4gICAgICAgICAgYW5nbGUgPSB0b3RhbF9hbmdsZSAqIHQgKyBhbmdsZV9zdGFydCxcbiAgICAgICAgICBkID0gKG1heF9yIC0gbWluX3IgLSBoKSp0ICsgbWluX3IgKyBoLFxuICAgICAgICAgIHg9d2lkdGgqMC41ICsgZCp3aWR0aCowLjUqTWF0aC5jb3MoYW5nbGUpLFxuICAgICAgICAgIHk9aGVpZ2h0KjAuNSArIGQqaGVpZ2h0KjAuNSpNYXRoLnNpbihhbmdsZSk7XG4gICAgICBjdHgubGluZVRvKHgsIHkpO1xuICAgIH1cbiAgICBjdHgubGluZVRvKHN4LCBzeSk7XG4gIH1cbiAgY3R4LmZpbGwoKTtcbiAgY3R4LnNhdmUoKTtcbiAgY3R4Lmdsb2JhbEFscGhhID0gMS9uX3NwaW47XG4gIGN0eC5iZWdpblBhdGgoKTtcbiAgZm9yKGxldCByYW5nZSBvZiBzdHJlYW1fcmFuZ2VzKXtcbiAgICBsZXQgaV9sID0gTWF0aC5yb3VuZCh0aWNrcyAqIChyYW5nZVswXSAtIGZyb21fdGltZXN0YW1wKSAvICh0b190aW1lc3RhbXAgLSBmcm9tX3RpbWVzdGFtcCkpLFxuICAgICAgICBpX3IgPSBNYXRoLnJvdW5kKHRpY2tzICogKHJhbmdlWzFdIC0gZnJvbV90aW1lc3RhbXApIC8gKHRvX3RpbWVzdGFtcCAtIGZyb21fdGltZXN0YW1wKSk7XG4gICAgbGV0IHQgPSBpX2wvdGlja3MsXG4gICAgICAgIGFuZ2xlID0gdG90YWxfYW5nbGUgKiB0ICsgYW5nbGVfc3RhcnQsXG4gICAgICAgIGQgPSAoMSAtIChvdXRlcl9wYWQgKyBvdXRlcl9jaXJjbGVfd2lkdGgpLyh3aWR0aCowLjUpKSxcbiAgICAgICAgc3g9d2lkdGgqMC41ICsgZCp3aWR0aCowLjUqTWF0aC5jb3MoYW5nbGUpLFxuICAgICAgICBzeT1oZWlnaHQqMC41ICsgZCpoZWlnaHQqMC41Kk1hdGguc2luKGFuZ2xlKTtcbiAgICBjdHgubW92ZVRvKHN4LCBzeSk7XG4gICAgZm9yKGxldCBpPWlfbCsxO2k8PWlfcjsgKytpKXtcbiAgICAgIGxldCB0ID0gaS90aWNrcyxcbiAgICAgICAgICBhbmdsZSA9IHRvdGFsX2FuZ2xlICogdCArIGFuZ2xlX3N0YXJ0LFxuICAgICAgICAgIGQgPSAoMSAtIChvdXRlcl9wYWQgKyBvdXRlcl9jaXJjbGVfd2lkdGgpLyh3aWR0aCowLjUpKSxcbiAgICAgICAgICB4PXdpZHRoKjAuNSArIGQqd2lkdGgqMC41Kk1hdGguY29zKGFuZ2xlKSxcbiAgICAgICAgICB5PWhlaWdodCowLjUgKyBkKmhlaWdodCowLjUqTWF0aC5zaW4oYW5nbGUpO1xuICAgICAgY3R4LmxpbmVUbyh4LCB5KTtcbiAgICB9XG4gICAgZm9yKGxldCBpPWlfcjsgaT49aV9sOyAtLWkpe1xuICAgICAgbGV0IHQgPSBpL3RpY2tzLFxuICAgICAgICAgIGFuZ2xlID0gdG90YWxfYW5nbGUgKiB0ICsgYW5nbGVfc3RhcnQsXG4gICAgICAgICAgZCA9ICgxIC0gKG91dGVyX3BhZCkvKHdpZHRoKjAuNSkpLFxuICAgICAgICAgIC8vZCA9IChtYXhfciAtIG1pbl9yIC0gaCkqdCArIG1pbl9yICsgaCxcbiAgICAgICAgICB4PXdpZHRoKjAuNSArIGQqd2lkdGgqMC41Kk1hdGguY29zKGFuZ2xlKSxcbiAgICAgICAgICB5PWhlaWdodCowLjUgKyBkKmhlaWdodCowLjUqTWF0aC5zaW4oYW5nbGUpO1xuICAgICAgY3R4LmxpbmVUbyh4LCB5KTtcbiAgICB9XG4gICAgY3R4LmxpbmVUbyhzeCwgc3kpO1xuICB9XG4gIGN0eC5maWxsKCk7XG4gIGN0eC5yZXN0b3JlKCk7XG4gIGN0eC5iZWdpblBhdGgoKTtcbiAgY3R4Lm1vdmVUbyh3aWR0aCowLjUgKyAod2lkdGgqMC41IC0gb3V0ZXJfcGFkIC0gb3V0ZXJfY2lyY2xlX3dpZHRoKSpNYXRoLmNvcyhhbmdsZV9zdGFydCksIGhlaWdodCowLjUgKyAoaGVpZ2h0KjAuNSAtIG91dGVyX3BhZCAtIG91dGVyX2NpcmNsZV93aWR0aCkqTWF0aC5zaW4oYW5nbGVfc3RhcnQpKTtcbiAgZm9yKGxldCBpPTA7IGk8PU1hdGguY2VpbCh0aWNrcy9uX3NwaW4pOyArK2kpe1xuICAgIGxldCBhbmdsZSA9IE1hdGguUEkqMiAqIChpL01hdGguY2VpbCh0aWNrcy9uX3NwaW4pKSArIGFuZ2xlX3N0YXJ0LFxuICAgICAgICB4PXdpZHRoKjAuNSArICh3aWR0aCowLjUgLSBvdXRlcl9jaXJjbGVfd2lkdGggLSBvdXRlcl9wYWQpKk1hdGguY29zKGFuZ2xlKSxcbiAgICAgICAgeT1oZWlnaHQqMC41ICsgKGhlaWdodCowLjUgLSBvdXRlcl9wYWQgLSBvdXRlcl9jaXJjbGVfd2lkdGgpKk1hdGguc2luKGFuZ2xlKTtcbiAgICBjdHgubGluZVRvKHgsIHkpO1xuICB9XG4gIGN0eC5zdHJva2UoKTtcbiAgY3R4LmJlZ2luUGF0aCgpO1xuICBjdHgubW92ZVRvKHdpZHRoKjAuNSArICh3aWR0aCowLjUgLSBvdXRlcl9wYWQpKk1hdGguY29zKGFuZ2xlX3N0YXJ0KSwgaGVpZ2h0KjAuNSArIChoZWlnaHQqMC41IC0gb3V0ZXJfcGFkKSpNYXRoLnNpbihhbmdsZV9zdGFydCkpO1xuICBmb3IobGV0IGk9MDsgaTw9TWF0aC5jZWlsKHRpY2tzL25fc3Bpbik7ICsraSl7XG4gICAgbGV0IGFuZ2xlID0gTWF0aC5QSSoyICogKGkvTWF0aC5jZWlsKHRpY2tzL25fc3BpbikpICsgYW5nbGVfc3RhcnQsXG4gICAgICAgIHg9d2lkdGgqMC41ICsgKHdpZHRoKjAuNSAtIG91dGVyX3BhZCkqTWF0aC5jb3MoYW5nbGUpLFxuICAgICAgICB5PWhlaWdodCowLjUgKyAoaGVpZ2h0KjAuNSAtIG91dGVyX3BhZCkqTWF0aC5zaW4oYW5nbGUpO1xuICAgIGN0eC5saW5lVG8oeCwgeSk7XG4gIH1cbiAgY3R4LnN0cm9rZSgpO1xuICBjdHguYmVnaW5QYXRoKCk7XG4gIGZvcihsZXQgaT0wOyBpPD1NYXRoLmNlaWwodGlja3MgKiAodG90YWxfYW5nbGUrTWF0aC5QSSoyKS90b3RhbF9hbmdsZSk7ICsraSl7XG4gIC8vZm9yKGxldCBpPTA7IGk8PXRpY2tzOyArK2kpe1xuICAgIGxldCB0ID0gaS90aWNrcyxcbiAgICAgICAgYW5nbGUgPSB0b3RhbF9hbmdsZSAqIHQgKyBhbmdsZV9zdGFydCxcbiAgICAgICAgZCA9IChtYXhfciAtIG1pbl9yIC0gaCkqdCArIG1pbl9yLFxuICAgICAgICB4PXdpZHRoKjAuNSArIGQqd2lkdGgqMC41Kk1hdGguY29zKGFuZ2xlKSxcbiAgICAgICAgeT1oZWlnaHQqMC41ICsgZCpoZWlnaHQqMC41Kk1hdGguc2luKGFuZ2xlKTtcbiAgICBjdHgubGluZVRvKHgsIHkpO1xuICB9XG4gIGN0eC5tb3ZlVG8od2lkdGgqMC41LCBoZWlnaHQqMC41KTtcbiAgZm9yKGxldCBpPTA7IGk8NzsgKytpKXtcbiAgICBsZXQgdCA9IChuX3NwaW4tMSkvbl9zcGluICsgaS9uX3NwaW4vNyxcbiAgICAgICAgYW5nbGUgPSB0b3RhbF9hbmdsZSAqIHQgKyBhbmdsZV9zdGFydCxcbiAgICAgICAgLy9hbmdsZSA9IE1hdGguUEkqMiAvIDcgKiBpICsgYW5nbGVfc3RhcnQsXG4gICAgICAgIGQxID0gKG1heF9yIC0gbWluX3IpKih0ICsgKGk9PTA/IDEvbl9zcGluOjApKSArIG1pbl9yLFxuICAgICAgICBkMiA9IChtYXhfciAtIG1pbl9yKSp0ICsgbWluX3IsXG4gICAgICAgIC8vZCA9ICgxIC0gKG91dGVyX3BhZCArIG91dGVyX2Mvd2lkdGgqMC41KSp0LFxuICAgICAgICB4PXdpZHRoKjAuNSArIGQxKndpZHRoKjAuNSpNYXRoLmNvcyhhbmdsZSksXG4gICAgICAgIHk9aGVpZ2h0KjAuNSArIGQxKmhlaWdodCowLjUqTWF0aC5zaW4oYW5nbGUpO1xuICAgICAgICAvL3ggPSB3aWR0aCowLjUgKyBtYXhfcip3aWR0aCowLjUqTWF0aC5jb3MoYW5nbGUpLFxuICAgICAgICAvL3kgPSBoZWlnaHQqMC41ICsgbWF4X3IqaGVpZ2h0KjAuNSpNYXRoLnNpbihhbmdsZSk7XG4gICAgY3R4Lm1vdmVUbyh3aWR0aCowLjUsIGhlaWdodCowLjUpO1xuICAgIGN0eC5saW5lVG8oeCwgeSk7XG4gICAgbGV0IHgyID0gd2lkdGgqMC41ICsgKGQyKndpZHRoKjAuNSArIGZvbnRfc2l6ZSkqTWF0aC5jb3MoYW5nbGUgKyBNYXRoLlBJKjIvNy8yKSxcbiAgICAgICAgeTIgPSBoZWlnaHQqMC41ICsgKGQyKmhlaWdodCowLjUgKyBmb250X3NpemUpKk1hdGguc2luKGFuZ2xlICsgTWF0aC5QSSoyLzcvMik7XG4gICAgaWYoKGkrZGF5X3N0YXJ0KSU3ID09IDAgfHwgKGkrZGF5X3N0YXJ0KSU3ID09IDYpIGN0eC5maWxsU3R5bGUgPSBcIiNFNTNFM0VcIjtcbiAgICBlbHNlIGN0eC5maWxsU3R5bGUgPSBcIiMyZDM3NDhcIjtcbiAgICBjdHguZmlsbFRleHQoZGF5X3RleHRbKGkrZGF5X3N0YXJ0KSU3XSwgeDIsIHkyKTtcbiAgfVxuICBjdHguc3Ryb2tlKCk7XG4gIGxldCBmcmFtZTtcbiAgLyooZnVuY3Rpb24gbG9vcCgpIHtcbiAgICBmcmFtZSA9IHJlcXVlc3RBbmltYXRpb25GcmFtZShsb29wKTtcbiAgICBpZihzZWFyY2gpIFxuICAgIGN0eC5jbGVhclJlY3QoMCwgMCwgY2FudmFzLndpZHRoLCBjYW52YXMuaGVpZ2h0KTtcbiAgfSgpKTtcbiAgcmV0dXJuICgpPT57XG4gICAgY2FuY2VsQW5pbWF0aW9uRnJhbWUoZnJhbWUpO1xuICB9Ki9cbn0pfTtcbjwvc2NyaXB0PlxuIiwiJ3VzZSBzdHJpY3QnO1xuT2JqZWN0LmRlZmluZVByb3BlcnR5KGV4cG9ydHMsICdfX2VzTW9kdWxlJywgeyB2YWx1ZTogdHJ1ZSB9KTtcbnZhciBwcmVmaXggPSAnZmFzJztcbnZhciBpY29uTmFtZSA9ICdhcnJvdy11cCc7XG52YXIgd2lkdGggPSA0NDg7XG52YXIgaGVpZ2h0ID0gNTEyO1xudmFyIGxpZ2F0dXJlcyA9IFtdO1xudmFyIHVuaWNvZGUgPSAnZjA2Mic7XG52YXIgc3ZnUGF0aERhdGEgPSAnTTM0LjkgMjg5LjVsLTIyLjItMjIuMmMtOS40LTkuNC05LjQtMjQuNiAwLTMzLjlMMjA3IDM5YzkuNC05LjQgMjQuNi05LjQgMzMuOSAwbDE5NC4zIDE5NC4zYzkuNCA5LjQgOS40IDI0LjYgMCAzMy45TDQxMyAyODkuNGMtOS41IDkuNS0yNSA5LjMtMzQuMy0uNEwyNjQgMTY4LjZWNDU2YzAgMTMuMy0xMC43IDI0LTI0IDI0aC0zMmMtMTMuMyAwLTI0LTEwLjctMjQtMjRWMTY4LjZMNjkuMiAyODkuMWMtOS4zIDkuOC0yNC44IDEwLTM0LjMuNHonO1xuXG5leHBvcnRzLmRlZmluaXRpb24gPSB7XG4gIHByZWZpeDogcHJlZml4LFxuICBpY29uTmFtZTogaWNvbk5hbWUsXG4gIGljb246IFtcbiAgICB3aWR0aCxcbiAgICBoZWlnaHQsXG4gICAgbGlnYXR1cmVzLFxuICAgIHVuaWNvZGUsXG4gICAgc3ZnUGF0aERhdGFcbiAgXX07XG5cbmV4cG9ydHMuZmFBcnJvd1VwID0gZXhwb3J0cy5kZWZpbml0aW9uO1xuZXhwb3J0cy5wcmVmaXggPSBwcmVmaXg7XG5leHBvcnRzLmljb25OYW1lID0gaWNvbk5hbWU7XG5leHBvcnRzLndpZHRoID0gd2lkdGg7XG5leHBvcnRzLmhlaWdodCA9IGhlaWdodDtcbmV4cG9ydHMubGlnYXR1cmVzID0gbGlnYXR1cmVzO1xuZXhwb3J0cy51bmljb2RlID0gdW5pY29kZTtcbmV4cG9ydHMuc3ZnUGF0aERhdGEgPSBzdmdQYXRoRGF0YTsiLCIndXNlIHN0cmljdCc7XG5PYmplY3QuZGVmaW5lUHJvcGVydHkoZXhwb3J0cywgJ19fZXNNb2R1bGUnLCB7IHZhbHVlOiB0cnVlIH0pO1xudmFyIHByZWZpeCA9ICdmYXMnO1xudmFyIGljb25OYW1lID0gJ2Fycm93LWRvd24nO1xudmFyIHdpZHRoID0gNDQ4O1xudmFyIGhlaWdodCA9IDUxMjtcbnZhciBsaWdhdHVyZXMgPSBbXTtcbnZhciB1bmljb2RlID0gJ2YwNjMnO1xudmFyIHN2Z1BhdGhEYXRhID0gJ000MTMuMSAyMjIuNWwyMi4yIDIyLjJjOS40IDkuNCA5LjQgMjQuNiAwIDMzLjlMMjQxIDQ3M2MtOS40IDkuNC0yNC42IDkuNC0zMy45IDBMMTIuNyAyNzguNmMtOS40LTkuNC05LjQtMjQuNiAwLTMzLjlsMjIuMi0yMi4yYzkuNS05LjUgMjUtOS4zIDM0LjMuNEwxODQgMzQzLjRWNTZjMC0xMy4zIDEwLjctMjQgMjQtMjRoMzJjMTMuMyAwIDI0IDEwLjcgMjQgMjR2Mjg3LjRsMTE0LjgtMTIwLjVjOS4zLTkuOCAyNC44LTEwIDM0LjMtLjR6JztcblxuZXhwb3J0cy5kZWZpbml0aW9uID0ge1xuICBwcmVmaXg6IHByZWZpeCxcbiAgaWNvbk5hbWU6IGljb25OYW1lLFxuICBpY29uOiBbXG4gICAgd2lkdGgsXG4gICAgaGVpZ2h0LFxuICAgIGxpZ2F0dXJlcyxcbiAgICB1bmljb2RlLFxuICAgIHN2Z1BhdGhEYXRhXG4gIF19O1xuXG5leHBvcnRzLmZhQXJyb3dEb3duID0gZXhwb3J0cy5kZWZpbml0aW9uO1xuZXhwb3J0cy5wcmVmaXggPSBwcmVmaXg7XG5leHBvcnRzLmljb25OYW1lID0gaWNvbk5hbWU7XG5leHBvcnRzLndpZHRoID0gd2lkdGg7XG5leHBvcnRzLmhlaWdodCA9IGhlaWdodDtcbmV4cG9ydHMubGlnYXR1cmVzID0gbGlnYXR1cmVzO1xuZXhwb3J0cy51bmljb2RlID0gdW5pY29kZTtcbmV4cG9ydHMuc3ZnUGF0aERhdGEgPSBzdmdQYXRoRGF0YTsiLCIvKlxub2JqZWN0LWFzc2lnblxuKGMpIFNpbmRyZSBTb3JodXNcbkBsaWNlbnNlIE1JVFxuKi9cblxuJ3VzZSBzdHJpY3QnO1xuLyogZXNsaW50LWRpc2FibGUgbm8tdW51c2VkLXZhcnMgKi9cbnZhciBnZXRPd25Qcm9wZXJ0eVN5bWJvbHMgPSBPYmplY3QuZ2V0T3duUHJvcGVydHlTeW1ib2xzO1xudmFyIGhhc093blByb3BlcnR5ID0gT2JqZWN0LnByb3RvdHlwZS5oYXNPd25Qcm9wZXJ0eTtcbnZhciBwcm9wSXNFbnVtZXJhYmxlID0gT2JqZWN0LnByb3RvdHlwZS5wcm9wZXJ0eUlzRW51bWVyYWJsZTtcblxuZnVuY3Rpb24gdG9PYmplY3QodmFsKSB7XG5cdGlmICh2YWwgPT09IG51bGwgfHwgdmFsID09PSB1bmRlZmluZWQpIHtcblx0XHR0aHJvdyBuZXcgVHlwZUVycm9yKCdPYmplY3QuYXNzaWduIGNhbm5vdCBiZSBjYWxsZWQgd2l0aCBudWxsIG9yIHVuZGVmaW5lZCcpO1xuXHR9XG5cblx0cmV0dXJuIE9iamVjdCh2YWwpO1xufVxuXG5mdW5jdGlvbiBzaG91bGRVc2VOYXRpdmUoKSB7XG5cdHRyeSB7XG5cdFx0aWYgKCFPYmplY3QuYXNzaWduKSB7XG5cdFx0XHRyZXR1cm4gZmFsc2U7XG5cdFx0fVxuXG5cdFx0Ly8gRGV0ZWN0IGJ1Z2d5IHByb3BlcnR5IGVudW1lcmF0aW9uIG9yZGVyIGluIG9sZGVyIFY4IHZlcnNpb25zLlxuXG5cdFx0Ly8gaHR0cHM6Ly9idWdzLmNocm9taXVtLm9yZy9wL3Y4L2lzc3Vlcy9kZXRhaWw/aWQ9NDExOFxuXHRcdHZhciB0ZXN0MSA9IG5ldyBTdHJpbmcoJ2FiYycpOyAgLy8gZXNsaW50LWRpc2FibGUtbGluZSBuby1uZXctd3JhcHBlcnNcblx0XHR0ZXN0MVs1XSA9ICdkZSc7XG5cdFx0aWYgKE9iamVjdC5nZXRPd25Qcm9wZXJ0eU5hbWVzKHRlc3QxKVswXSA9PT0gJzUnKSB7XG5cdFx0XHRyZXR1cm4gZmFsc2U7XG5cdFx0fVxuXG5cdFx0Ly8gaHR0cHM6Ly9idWdzLmNocm9taXVtLm9yZy9wL3Y4L2lzc3Vlcy9kZXRhaWw/aWQ9MzA1NlxuXHRcdHZhciB0ZXN0MiA9IHt9O1xuXHRcdGZvciAodmFyIGkgPSAwOyBpIDwgMTA7IGkrKykge1xuXHRcdFx0dGVzdDJbJ18nICsgU3RyaW5nLmZyb21DaGFyQ29kZShpKV0gPSBpO1xuXHRcdH1cblx0XHR2YXIgb3JkZXIyID0gT2JqZWN0LmdldE93blByb3BlcnR5TmFtZXModGVzdDIpLm1hcChmdW5jdGlvbiAobikge1xuXHRcdFx0cmV0dXJuIHRlc3QyW25dO1xuXHRcdH0pO1xuXHRcdGlmIChvcmRlcjIuam9pbignJykgIT09ICcwMTIzNDU2Nzg5Jykge1xuXHRcdFx0cmV0dXJuIGZhbHNlO1xuXHRcdH1cblxuXHRcdC8vIGh0dHBzOi8vYnVncy5jaHJvbWl1bS5vcmcvcC92OC9pc3N1ZXMvZGV0YWlsP2lkPTMwNTZcblx0XHR2YXIgdGVzdDMgPSB7fTtcblx0XHQnYWJjZGVmZ2hpamtsbW5vcHFyc3QnLnNwbGl0KCcnKS5mb3JFYWNoKGZ1bmN0aW9uIChsZXR0ZXIpIHtcblx0XHRcdHRlc3QzW2xldHRlcl0gPSBsZXR0ZXI7XG5cdFx0fSk7XG5cdFx0aWYgKE9iamVjdC5rZXlzKE9iamVjdC5hc3NpZ24oe30sIHRlc3QzKSkuam9pbignJykgIT09XG5cdFx0XHRcdCdhYmNkZWZnaGlqa2xtbm9wcXJzdCcpIHtcblx0XHRcdHJldHVybiBmYWxzZTtcblx0XHR9XG5cblx0XHRyZXR1cm4gdHJ1ZTtcblx0fSBjYXRjaCAoZXJyKSB7XG5cdFx0Ly8gV2UgZG9uJ3QgZXhwZWN0IGFueSBvZiB0aGUgYWJvdmUgdG8gdGhyb3csIGJ1dCBiZXR0ZXIgdG8gYmUgc2FmZS5cblx0XHRyZXR1cm4gZmFsc2U7XG5cdH1cbn1cblxubW9kdWxlLmV4cG9ydHMgPSBzaG91bGRVc2VOYXRpdmUoKSA/IE9iamVjdC5hc3NpZ24gOiBmdW5jdGlvbiAodGFyZ2V0LCBzb3VyY2UpIHtcblx0dmFyIGZyb207XG5cdHZhciB0byA9IHRvT2JqZWN0KHRhcmdldCk7XG5cdHZhciBzeW1ib2xzO1xuXG5cdGZvciAodmFyIHMgPSAxOyBzIDwgYXJndW1lbnRzLmxlbmd0aDsgcysrKSB7XG5cdFx0ZnJvbSA9IE9iamVjdChhcmd1bWVudHNbc10pO1xuXG5cdFx0Zm9yICh2YXIga2V5IGluIGZyb20pIHtcblx0XHRcdGlmIChoYXNPd25Qcm9wZXJ0eS5jYWxsKGZyb20sIGtleSkpIHtcblx0XHRcdFx0dG9ba2V5XSA9IGZyb21ba2V5XTtcblx0XHRcdH1cblx0XHR9XG5cblx0XHRpZiAoZ2V0T3duUHJvcGVydHlTeW1ib2xzKSB7XG5cdFx0XHRzeW1ib2xzID0gZ2V0T3duUHJvcGVydHlTeW1ib2xzKGZyb20pO1xuXHRcdFx0Zm9yICh2YXIgaSA9IDA7IGkgPCBzeW1ib2xzLmxlbmd0aDsgaSsrKSB7XG5cdFx0XHRcdGlmIChwcm9wSXNFbnVtZXJhYmxlLmNhbGwoZnJvbSwgc3ltYm9sc1tpXSkpIHtcblx0XHRcdFx0XHR0b1tzeW1ib2xzW2ldXSA9IGZyb21bc3ltYm9sc1tpXV07XG5cdFx0XHRcdH1cblx0XHRcdH1cblx0XHR9XG5cdH1cblxuXHRyZXR1cm4gdG87XG59O1xuIiwiJ3VzZSBzdHJpY3QnO1xuXG5mdW5jdGlvbiBfaW50ZXJvcERlZmF1bHQgKGV4KSB7IHJldHVybiAoZXggJiYgKHR5cGVvZiBleCA9PT0gJ29iamVjdCcpICYmICdkZWZhdWx0JyBpbiBleCkgPyBleFsnZGVmYXVsdCddIDogZXg7IH1cblxudmFyIGFzc2lnbiA9IF9pbnRlcm9wRGVmYXVsdChyZXF1aXJlKCdvYmplY3QtYXNzaWduJykpO1xuXG5mdW5jdGlvbiBhc3NpZ24kMSAoIHRhcmdldCApIHtcblx0dmFyIGFyZ3VtZW50cyQxID0gYXJndW1lbnRzO1xuXG5cdGZvciAoIHZhciBpID0gMTsgaSA8IGFyZ3VtZW50cy5sZW5ndGg7IGkgKz0gMSApIHtcblx0XHR2YXIgc291cmNlID0gYXJndW1lbnRzJDFbaV07XG5cdFx0Zm9yICggdmFyIGsgaW4gc291cmNlICkgeyB0YXJnZXRba10gPSBzb3VyY2Vba107IH1cblx0fVxuXG5cdHJldHVybiB0YXJnZXQ7XG59XG5cbmZ1bmN0aW9uIGFwcGVuZE5vZGUgKCBub2RlLCB0YXJnZXQgKSB7XG5cdHRhcmdldC5hcHBlbmRDaGlsZCggbm9kZSApO1xufVxuXG5mdW5jdGlvbiBpbnNlcnROb2RlICggbm9kZSwgdGFyZ2V0LCBhbmNob3IgKSB7XG5cdHRhcmdldC5pbnNlcnRCZWZvcmUoIG5vZGUsIGFuY2hvciApO1xufVxuXG5mdW5jdGlvbiBkZXRhY2hOb2RlICggbm9kZSApIHtcblx0bm9kZS5wYXJlbnROb2RlLnJlbW92ZUNoaWxkKCBub2RlICk7XG59XG5cbmZ1bmN0aW9uIGNyZWF0ZUVsZW1lbnQgKCBuYW1lICkge1xuXHRyZXR1cm4gZG9jdW1lbnQuY3JlYXRlRWxlbWVudCggbmFtZSApO1xufVxuXG5mdW5jdGlvbiBjcmVhdGVUZXh0ICggZGF0YSApIHtcblx0cmV0dXJuIGRvY3VtZW50LmNyZWF0ZVRleHROb2RlKCBkYXRhICk7XG59XG5cbmZ1bmN0aW9uIHNldEF0dHJpYnV0ZSAoIG5vZGUsIGF0dHJpYnV0ZSwgdmFsdWUgKSB7XG5cdG5vZGUuc2V0QXR0cmlidXRlKCBhdHRyaWJ1dGUsIHZhbHVlICk7XG59XG5cbnZhciB0cmFuc2l0aW9uTWFuYWdlciA9IHtcblx0cnVubmluZzogZmFsc2UsXG5cdHRyYW5zaXRpb25zOiBbXSxcblxuXHRhZGQ6IGZ1bmN0aW9uICggdHJhbnNpdGlvbiApIHtcblx0XHR0cmFuc2l0aW9uTWFuYWdlci50cmFuc2l0aW9ucy5wdXNoKCB0cmFuc2l0aW9uICk7XG5cblx0XHRpZiAoICF0aGlzLnJ1bm5pbmcgKSB7XG5cdFx0XHR0aGlzLnJ1bm5pbmcgPSB0cnVlO1xuXHRcdFx0dGhpcy5uZXh0KCk7XG5cdFx0fVxuXHR9LFxuXG5cdG5leHQ6IGZ1bmN0aW9uICgpIHtcblx0XHR0cmFuc2l0aW9uTWFuYWdlci5ydW5uaW5nID0gZmFsc2U7XG5cblx0XHR2YXIgbm93ID0gd2luZG93LnBlcmZvcm1hbmNlLm5vdygpO1xuXHRcdHZhciBpID0gdHJhbnNpdGlvbk1hbmFnZXIudHJhbnNpdGlvbnMubGVuZ3RoO1xuXG5cdFx0d2hpbGUgKCBpLS0gKSB7XG5cdFx0XHR2YXIgdHJhbnNpdGlvbiA9IHRyYW5zaXRpb25NYW5hZ2VyLnRyYW5zaXRpb25zW2ldO1xuXG5cdFx0XHRpZiAoIHRyYW5zaXRpb24ucnVubmluZyApIHtcblx0XHRcdFx0aWYgKCBub3cgPj0gdHJhbnNpdGlvbi5lbmQgKSB7XG5cdFx0XHRcdFx0dHJhbnNpdGlvbi5ydW5uaW5nID0gZmFsc2U7XG5cdFx0XHRcdFx0dHJhbnNpdGlvbi5kb25lKCk7XG5cdFx0XHRcdH0gZWxzZSBpZiAoIG5vdyA+IHRyYW5zaXRpb24uc3RhcnQgKSB7XG5cdFx0XHRcdFx0dHJhbnNpdGlvbi51cGRhdGUoIG5vdyApO1xuXHRcdFx0XHR9XG5cblx0XHRcdFx0dHJhbnNpdGlvbk1hbmFnZXIucnVubmluZyA9IHRydWU7XG5cdFx0XHR9IGVsc2Uge1xuXHRcdFx0XHR0cmFuc2l0aW9uTWFuYWdlci50cmFuc2l0aW9ucy5zcGxpY2UoIGksIDEgKTtcblx0XHRcdH1cblx0XHR9XG5cblx0XHRpZiAoIHRyYW5zaXRpb25NYW5hZ2VyLnJ1bm5pbmcgKSB7XG5cdFx0XHRyZXF1ZXN0QW5pbWF0aW9uRnJhbWUoIHRyYW5zaXRpb25NYW5hZ2VyLm5leHQgKTtcblx0XHR9XG5cdH1cbn07XG5cbmZ1bmN0aW9uIGRpZmZlcnMgKCBhLCBiICkge1xuXHRyZXR1cm4gKCBhICE9PSBiICkgfHwgKCBhICYmICggdHlwZW9mIGEgPT09ICdvYmplY3QnICkgfHwgKCB0eXBlb2YgYSA9PT0gJ2Z1bmN0aW9uJyApICk7XG59XG5cbmZ1bmN0aW9uIGRpc3BhdGNoT2JzZXJ2ZXJzICggY29tcG9uZW50LCBncm91cCwgbmV3U3RhdGUsIG9sZFN0YXRlICkge1xuXHRmb3IgKCB2YXIga2V5IGluIGdyb3VwICkge1xuXHRcdGlmICggISgga2V5IGluIG5ld1N0YXRlICkgKSB7IGNvbnRpbnVlOyB9XG5cblx0XHR2YXIgbmV3VmFsdWUgPSBuZXdTdGF0ZVsga2V5IF07XG5cdFx0dmFyIG9sZFZhbHVlID0gb2xkU3RhdGVbIGtleSBdO1xuXG5cdFx0aWYgKCBkaWZmZXJzKCBuZXdWYWx1ZSwgb2xkVmFsdWUgKSApIHtcblx0XHRcdHZhciBjYWxsYmFja3MgPSBncm91cFsga2V5IF07XG5cdFx0XHRpZiAoICFjYWxsYmFja3MgKSB7IGNvbnRpbnVlOyB9XG5cblx0XHRcdGZvciAoIHZhciBpID0gMDsgaSA8IGNhbGxiYWNrcy5sZW5ndGg7IGkgKz0gMSApIHtcblx0XHRcdFx0dmFyIGNhbGxiYWNrID0gY2FsbGJhY2tzW2ldO1xuXHRcdFx0XHRpZiAoIGNhbGxiYWNrLl9fY2FsbGluZyApIHsgY29udGludWU7IH1cblxuXHRcdFx0XHRjYWxsYmFjay5fX2NhbGxpbmcgPSB0cnVlO1xuXHRcdFx0XHRjYWxsYmFjay5jYWxsKCBjb21wb25lbnQsIG5ld1ZhbHVlLCBvbGRWYWx1ZSApO1xuXHRcdFx0XHRjYWxsYmFjay5fX2NhbGxpbmcgPSBmYWxzZTtcblx0XHRcdH1cblx0XHR9XG5cdH1cbn1cblxuZnVuY3Rpb24gZ2V0ICgga2V5ICkge1xuXHRyZXR1cm4ga2V5ID8gdGhpcy5fc3RhdGVbIGtleSBdIDogdGhpcy5fc3RhdGU7XG59XG5cbmZ1bmN0aW9uIGZpcmUgKCBldmVudE5hbWUsIGRhdGEgKSB7XG5cdHZhciB0aGlzJDEgPSB0aGlzO1xuXG5cdHZhciBoYW5kbGVycyA9IGV2ZW50TmFtZSBpbiB0aGlzLl9oYW5kbGVycyAmJiB0aGlzLl9oYW5kbGVyc1sgZXZlbnROYW1lIF0uc2xpY2UoKTtcblx0aWYgKCAhaGFuZGxlcnMgKSB7IHJldHVybjsgfVxuXG5cdGZvciAoIHZhciBpID0gMDsgaSA8IGhhbmRsZXJzLmxlbmd0aDsgaSArPSAxICkge1xuXHRcdGhhbmRsZXJzW2ldLmNhbGwoIHRoaXMkMSwgZGF0YSApO1xuXHR9XG59XG5cbmZ1bmN0aW9uIG9ic2VydmUgKCBrZXksIGNhbGxiYWNrLCBvcHRpb25zICkge1xuXHR2YXIgZ3JvdXAgPSAoIG9wdGlvbnMgJiYgb3B0aW9ucy5kZWZlciApID8gdGhpcy5fb2JzZXJ2ZXJzLnBvc3QgOiB0aGlzLl9vYnNlcnZlcnMucHJlO1xuXG5cdCggZ3JvdXBbIGtleSBdIHx8ICggZ3JvdXBbIGtleSBdID0gW10gKSApLnB1c2goIGNhbGxiYWNrICk7XG5cblx0aWYgKCAhb3B0aW9ucyB8fCBvcHRpb25zLmluaXQgIT09IGZhbHNlICkge1xuXHRcdGNhbGxiYWNrLl9fY2FsbGluZyA9IHRydWU7XG5cdFx0Y2FsbGJhY2suY2FsbCggdGhpcywgdGhpcy5fc3RhdGVbIGtleSBdICk7XG5cdFx0Y2FsbGJhY2suX19jYWxsaW5nID0gZmFsc2U7XG5cdH1cblxuXHRyZXR1cm4ge1xuXHRcdGNhbmNlbDogZnVuY3Rpb24gKCkge1xuXHRcdFx0dmFyIGluZGV4ID0gZ3JvdXBbIGtleSBdLmluZGV4T2YoIGNhbGxiYWNrICk7XG5cdFx0XHRpZiAoIH5pbmRleCApIHsgZ3JvdXBbIGtleSBdLnNwbGljZSggaW5kZXgsIDEgKTsgfVxuXHRcdH1cblx0fTtcbn1cblxuZnVuY3Rpb24gb24gKCBldmVudE5hbWUsIGhhbmRsZXIgKSB7XG5cdGlmICggZXZlbnROYW1lID09PSAndGVhcmRvd24nICkgeyByZXR1cm4gdGhpcy5vbiggJ2Rlc3Ryb3knLCBoYW5kbGVyICk7IH1cblxuXHR2YXIgaGFuZGxlcnMgPSB0aGlzLl9oYW5kbGVyc1sgZXZlbnROYW1lIF0gfHwgKCB0aGlzLl9oYW5kbGVyc1sgZXZlbnROYW1lIF0gPSBbXSApO1xuXHRoYW5kbGVycy5wdXNoKCBoYW5kbGVyICk7XG5cblx0cmV0dXJuIHtcblx0XHRjYW5jZWw6IGZ1bmN0aW9uICgpIHtcblx0XHRcdHZhciBpbmRleCA9IGhhbmRsZXJzLmluZGV4T2YoIGhhbmRsZXIgKTtcblx0XHRcdGlmICggfmluZGV4ICkgeyBoYW5kbGVycy5zcGxpY2UoIGluZGV4LCAxICk7IH1cblx0XHR9XG5cdH07XG59XG5cbmZ1bmN0aW9uIHNldCAoIG5ld1N0YXRlICkge1xuXHR0aGlzLl9zZXQoIGFzc2lnbiQxKCB7fSwgbmV3U3RhdGUgKSApO1xuXHR0aGlzLl9yb290Ll9mbHVzaCgpO1xufVxuXG5mdW5jdGlvbiBfZmx1c2ggKCkge1xuXHR2YXIgdGhpcyQxID0gdGhpcztcblxuXHRpZiAoICF0aGlzLl9yZW5kZXJIb29rcyApIHsgcmV0dXJuOyB9XG5cblx0d2hpbGUgKCB0aGlzLl9yZW5kZXJIb29rcy5sZW5ndGggKSB7XG5cdFx0dGhpcyQxLl9yZW5kZXJIb29rcy5wb3AoKSgpO1xuXHR9XG59XG5cbnZhciBwcm90byA9IHtcblx0Z2V0OiBnZXQsXG5cdGZpcmU6IGZpcmUsXG5cdG9ic2VydmU6IG9ic2VydmUsXG5cdG9uOiBvbixcblx0c2V0OiBzZXQsXG5cdF9mbHVzaDogX2ZsdXNoXG59O1xuXG5mdW5jdGlvbiByZWNvbXB1dGUgKCBzdGF0ZSwgbmV3U3RhdGUsIG9sZFN0YXRlLCBpc0luaXRpYWwgKSB7XG5cdGlmICggaXNJbml0aWFsIHx8ICggJ3Bvc2l0aW9uJyBpbiBuZXdTdGF0ZSAmJiBkaWZmZXJzKCBzdGF0ZS5wb3NpdGlvbiwgb2xkU3RhdGUucG9zaXRpb24gKSApICkge1xuXHRcdHN0YXRlLl9wb3NpdGlvbiA9IG5ld1N0YXRlLl9wb3NpdGlvbiA9IHRlbXBsYXRlLmNvbXB1dGVkLl9wb3NpdGlvbiggc3RhdGUucG9zaXRpb24gKTtcblx0fVxufVxuXG52YXIgdGVtcGxhdGUgPSAoZnVuY3Rpb24gKCkge1xuICByZXR1cm4ge1xuICAgIGRhdGE6IGZ1bmN0aW9uIGRhdGEgKCkge1xuICAgICAgcmV0dXJuIHtcbiAgICAgICAgbXNnOiAnJyxcbiAgICAgICAgdHlwZTogJycsXG4gICAgICAgIHBvc2l0aW9uOiAnYm90dG9tLWNlbnRlcidcbiAgICAgIH1cbiAgICB9LFxuICAgIGNvbXB1dGVkOiB7XG4gICAgICBfcG9zaXRpb246IGZ1bmN0aW9uIF9wb3NpdGlvbiAocG9zaXRpb24pIHsgcmV0dXJuIHBvc2l0aW9uLnNwbGl0KCctJykuam9pbignICcpIH1cbiAgICB9XG4gIH1cbn0oKSk7XG5cbnZhciBhZGRlZF9jc3MgPSBmYWxzZTtcbmZ1bmN0aW9uIGFkZF9jc3MgKCkge1xuXHR2YXIgc3R5bGUgPSBjcmVhdGVFbGVtZW50KCAnc3R5bGUnICk7XG5cdHN0eWxlLnRleHRDb250ZW50ID0gXCJcXG4gIFtzdmVsdGUtMTcxNDg3MjBdLnRvYXN0LWNvbnRhaW5lciwgW3N2ZWx0ZS0xNzE0ODcyMF0gLnRvYXN0LWNvbnRhaW5lciB7XFxuICAgIHBvc2l0aW9uOiBmaXhlZDtcXG4gICAgei1pbmRleDogOTk5O1xcbiAgfVxcbiAgW3N2ZWx0ZS0xNzE0ODcyMF0udG9wLCBbc3ZlbHRlLTE3MTQ4NzIwXSAudG9wIHtcXG4gICAgdG9wOiAxNXB4O1xcbiAgfVxcbiAgW3N2ZWx0ZS0xNzE0ODcyMF0uYm90dG9tLCBbc3ZlbHRlLTE3MTQ4NzIwXSAuYm90dG9tIHtcXG4gICAgYm90dG9tOiAxNXB4O1xcbiAgfVxcbiAgW3N2ZWx0ZS0xNzE0ODcyMF0ubGVmdCwgW3N2ZWx0ZS0xNzE0ODcyMF0gLmxlZnQge1xcbiAgICBsZWZ0OiAxNXB4O1xcbiAgfVxcbiAgW3N2ZWx0ZS0xNzE0ODcyMF0ucmlnaHQsIFtzdmVsdGUtMTcxNDg3MjBdIC5yaWdodCB7XFxuICAgIHJpZ2h0OiAxNXB4O1xcbiAgfVxcbiAgW3N2ZWx0ZS0xNzE0ODcyMF0uY2VudGVyLCBbc3ZlbHRlLTE3MTQ4NzIwXSAuY2VudGVyIHtcXG4gICAgbGVmdDogNTAlO1xcbiAgICB0cmFuc2Zvcm06IHRyYW5zbGF0ZVgoLTUwJSk7XFxuICAgIC13ZWJraXQtdHJhbnNmb3JtOiB0cmFuc2xhdGVYKC01MCUpO1xcbiAgfVxcbiAgW3N2ZWx0ZS0xNzE0ODcyMF0udG9hc3QsIFtzdmVsdGUtMTcxNDg3MjBdIC50b2FzdCB7XFxuICAgIGhlaWdodDogMzhweDtcXG4gICAgbGluZS1oZWlnaHQ6IDM4cHg7XFxuICAgIHBhZGRpbmc6IDAgMjBweDtcXG4gICAgYm94LXNoYWRvdzogMCAxcHggM3B4IHJnYmEoMCwgMCwgMCwgLjEyKSwgMCAxcHggMnB4IHJnYmEoMCwgMCwgMCwgLjI0KTtcXG4gICAgY29sb3I6ICNGRkY7XFxuICAgIC13ZWJraXQtdHJhbnNpdGlvbjogb3BhY2l0eSAwLjJzLCAtd2Via2l0LXRyYW5zZm9ybSAwLjJzO1xcbiAgICB0cmFuc2l0aW9uOiBvcGFjaXR5IDAuMnMsIHRyYW5zZm9ybSAwLjJzLCAtd2Via2l0LXRyYW5zZm9ybSAwLjJzO1xcbiAgICAtd2Via2l0LXRyYW5zZm9ybTogdHJhbnNsYXRlWSgzNXB4KTtcXG4gICAgdHJhbnNmb3JtOiB0cmFuc2xhdGVZKDM1cHgpO1xcbiAgICBvcGFjaXR5OiAwO1xcbiAgICBtYXgtd2lkdGg6IDIwMHB4O1xcbiAgICB3aGl0ZS1zcGFjZTogbm93cmFwO1xcbiAgICBvdmVyZmxvdzogaGlkZGVuO1xcbiAgICB0ZXh0LW92ZXJmbG93OiBlbGxpcHNpcztcXG4gIH1cXG4gIFtzdmVsdGUtMTcxNDg3MjBdLmluZm8sIFtzdmVsdGUtMTcxNDg3MjBdIC5pbmZvIHtcXG4gICAgYmFja2dyb3VuZC1jb2xvcjogIzAwOTFFQTtcXG4gIH1cXG4gIFtzdmVsdGUtMTcxNDg3MjBdLnN1Y2Nlc3MsIFtzdmVsdGUtMTcxNDg3MjBdIC5zdWNjZXNzIHtcXG4gICAgYmFja2dyb3VuZC1jb2xvcjogIzRDQUY1MDtcXG4gIH1cXG4gIFtzdmVsdGUtMTcxNDg3MjBdLmVycm9yLCBbc3ZlbHRlLTE3MTQ4NzIwXSAuZXJyb3Ige1xcbiAgICBiYWNrZ3JvdW5kLWNvbG9yOiAjRjQ0MzM2O1xcbiAgfVxcbiAgW3N2ZWx0ZS0xNzE0ODcyMF0uZGVmYXVsdCwgW3N2ZWx0ZS0xNzE0ODcyMF0gLmRlZmF1bHQge1xcbiAgICBiYWNrZ3JvdW5kLWNvbG9yOiAjMzUzNTM1O1xcbiAgfVxcbiAgW3N2ZWx0ZS0xNzE0ODcyMF0uYW5pbSwgW3N2ZWx0ZS0xNzE0ODcyMF0gLmFuaW0ge1xcbiAgICBvcGFjaXR5OiAxO1xcbiAgICAtd2Via2l0LXRyYW5zZm9ybTogdHJhbnNsYXRlWSgwKTtcXG4gICAgdHJhbnNmb3JtOiB0cmFuc2xhdGVZKDApO1xcbiAgfVxcblwiO1xuXHRhcHBlbmROb2RlKCBzdHlsZSwgZG9jdW1lbnQuaGVhZCApO1xuXG5cdGFkZGVkX2NzcyA9IHRydWU7XG59XG5cbmZ1bmN0aW9uIGNyZWF0ZV9tYWluX2ZyYWdtZW50ICggc3RhdGUsIGNvbXBvbmVudCApIHtcblx0dmFyIGRpdl9jbGFzc192YWx1ZSwgZGl2XzFfY2xhc3NfdmFsdWUsIHRleHRfdmFsdWU7XG5cblx0dmFyIGRpdiA9IGNyZWF0ZUVsZW1lbnQoICdkaXYnICk7XG5cdHNldEF0dHJpYnV0ZSggZGl2LCAnc3ZlbHRlLTE3MTQ4NzIwJywgJycgKTtcblx0ZGl2LmNsYXNzTmFtZSA9IGRpdl9jbGFzc192YWx1ZSA9IFwidG9hc3QtY29udGFpbmVyIFwiICsgKCBzdGF0ZS5fcG9zaXRpb24gKTtcblx0dmFyIGRpdl8xID0gY3JlYXRlRWxlbWVudCggJ2RpdicgKTtcblx0YXBwZW5kTm9kZSggZGl2XzEsIGRpdiApO1xuXHRkaXZfMS5jbGFzc05hbWUgPSBkaXZfMV9jbGFzc192YWx1ZSA9IFwidG9hc3QgXCIgKyAoIHN0YXRlLnR5cGUgKTtcblx0dmFyIHRleHQgPSBjcmVhdGVUZXh0KCB0ZXh0X3ZhbHVlID0gc3RhdGUubXNnICk7XG5cdGFwcGVuZE5vZGUoIHRleHQsIGRpdl8xICk7XG5cblx0cmV0dXJuIHtcblx0XHRtb3VudDogZnVuY3Rpb24gKCB0YXJnZXQsIGFuY2hvciApIHtcblx0XHRcdGluc2VydE5vZGUoIGRpdiwgdGFyZ2V0LCBhbmNob3IgKTtcblx0XHR9LFxuXG5cdFx0dXBkYXRlOiBmdW5jdGlvbiAoIGNoYW5nZWQsIHN0YXRlICkge1xuXHRcdFx0aWYgKCBkaXZfY2xhc3NfdmFsdWUgIT09ICggZGl2X2NsYXNzX3ZhbHVlID0gXCJ0b2FzdC1jb250YWluZXIgXCIgKyAoIHN0YXRlLl9wb3NpdGlvbiApICkgKSB7XG5cdFx0XHRcdGRpdi5jbGFzc05hbWUgPSBkaXZfY2xhc3NfdmFsdWU7XG5cdFx0XHR9XG5cblx0XHRcdGlmICggZGl2XzFfY2xhc3NfdmFsdWUgIT09ICggZGl2XzFfY2xhc3NfdmFsdWUgPSBcInRvYXN0IFwiICsgKCBzdGF0ZS50eXBlICkgKSApIHtcblx0XHRcdFx0ZGl2XzEuY2xhc3NOYW1lID0gZGl2XzFfY2xhc3NfdmFsdWU7XG5cdFx0XHR9XG5cblx0XHRcdGlmICggdGV4dF92YWx1ZSAhPT0gKCB0ZXh0X3ZhbHVlID0gc3RhdGUubXNnICkgKSB7XG5cdFx0XHRcdHRleHQuZGF0YSA9IHRleHRfdmFsdWU7XG5cdFx0XHR9XG5cdFx0fSxcblxuXHRcdGRlc3Ryb3k6IGZ1bmN0aW9uICggZGV0YWNoICkge1xuXHRcdFx0aWYgKCBkZXRhY2ggKSB7XG5cdFx0XHRcdGRldGFjaE5vZGUoIGRpdiApO1xuXHRcdFx0fVxuXHRcdH1cblx0fTtcbn1cblxuZnVuY3Rpb24gVG9hc3QkMiAoIG9wdGlvbnMgKSB7XG5cdG9wdGlvbnMgPSBvcHRpb25zIHx8IHt9O1xuXHR0aGlzLl9zdGF0ZSA9IGFzc2lnbiQxKCB0ZW1wbGF0ZS5kYXRhKCksIG9wdGlvbnMuZGF0YSApO1xuXHRyZWNvbXB1dGUoIHRoaXMuX3N0YXRlLCB0aGlzLl9zdGF0ZSwge30sIHRydWUgKTtcblxuXHR0aGlzLl9vYnNlcnZlcnMgPSB7XG5cdFx0cHJlOiBPYmplY3QuY3JlYXRlKCBudWxsICksXG5cdFx0cG9zdDogT2JqZWN0LmNyZWF0ZSggbnVsbCApXG5cdH07XG5cblx0dGhpcy5faGFuZGxlcnMgPSBPYmplY3QuY3JlYXRlKCBudWxsICk7XG5cblx0dGhpcy5fcm9vdCA9IG9wdGlvbnMuX3Jvb3QgfHwgdGhpcztcblx0dGhpcy5feWllbGQgPSBvcHRpb25zLl95aWVsZDtcblxuXHR0aGlzLl90b3JuZG93biA9IGZhbHNlO1xuXHRpZiAoICFhZGRlZF9jc3MgKSB7IGFkZF9jc3MoKTsgfVxuXG5cdHRoaXMuX2ZyYWdtZW50ID0gY3JlYXRlX21haW5fZnJhZ21lbnQoIHRoaXMuX3N0YXRlLCB0aGlzICk7XG5cdGlmICggb3B0aW9ucy50YXJnZXQgKSB7IHRoaXMuX2ZyYWdtZW50Lm1vdW50KCBvcHRpb25zLnRhcmdldCwgbnVsbCApOyB9XG59XG5cbmFzc2lnbiQxKCBUb2FzdCQyLnByb3RvdHlwZSwgcHJvdG8gKTtcblxuVG9hc3QkMi5wcm90b3R5cGUuX3NldCA9IGZ1bmN0aW9uIF9zZXQgKCBuZXdTdGF0ZSApIHtcblx0dmFyIG9sZFN0YXRlID0gdGhpcy5fc3RhdGU7XG5cdHRoaXMuX3N0YXRlID0gYXNzaWduJDEoIHt9LCBvbGRTdGF0ZSwgbmV3U3RhdGUgKTtcblx0cmVjb21wdXRlKCB0aGlzLl9zdGF0ZSwgbmV3U3RhdGUsIG9sZFN0YXRlLCBmYWxzZSApO1xuXHRkaXNwYXRjaE9ic2VydmVycyggdGhpcywgdGhpcy5fb2JzZXJ2ZXJzLnByZSwgbmV3U3RhdGUsIG9sZFN0YXRlICk7XG5cdGlmICggdGhpcy5fZnJhZ21lbnQgKSB7IHRoaXMuX2ZyYWdtZW50LnVwZGF0ZSggbmV3U3RhdGUsIHRoaXMuX3N0YXRlICk7IH1cblx0ZGlzcGF0Y2hPYnNlcnZlcnMoIHRoaXMsIHRoaXMuX29ic2VydmVycy5wb3N0LCBuZXdTdGF0ZSwgb2xkU3RhdGUgKTtcbn07XG5cblRvYXN0JDIucHJvdG90eXBlLnRlYXJkb3duID0gVG9hc3QkMi5wcm90b3R5cGUuZGVzdHJveSA9IGZ1bmN0aW9uIGRlc3Ryb3kgKCBkZXRhY2ggKSB7XG5cdHRoaXMuZmlyZSggJ2Rlc3Ryb3knICk7XG5cblx0dGhpcy5fZnJhZ21lbnQuZGVzdHJveSggZGV0YWNoICE9PSBmYWxzZSApO1xuXHR0aGlzLl9mcmFnbWVudCA9IG51bGw7XG5cblx0dGhpcy5fc3RhdGUgPSB7fTtcblx0dGhpcy5fdG9ybmRvd24gPSB0cnVlO1xufTtcblxudmFyIFRvYXN0ID0gZnVuY3Rpb24gVG9hc3QgKG9wdHMpIHtcbiAgdGhpcy5vcHRzID0gb3B0cyB8fCB7XG4gICAgcG9zaXRpb246ICdib3R0b20tY2VudGVyJyxcbiAgICBkdXJhdGlvbjogMjAwMFxuICB9O1xufTtcblxuVG9hc3QucHJvdG90eXBlLnNob3cgPSBmdW5jdGlvbiBzaG93IChtc2csIG9wdHMpIHtcbiAgICBpZiAoIG9wdHMgPT09IHZvaWQgMCApIG9wdHMgPSB7fTtcblxuICB0aGlzLl9zaG93KG1zZywgb3B0cywgJ2RlZmF1bHQnKTtcbn07XG5cblRvYXN0LnByb3RvdHlwZS5pbmZvID0gZnVuY3Rpb24gaW5mbyAobXNnLCBvcHRzKSB7XG4gICAgaWYgKCBvcHRzID09PSB2b2lkIDAgKSBvcHRzID0ge307XG5cbiAgdGhpcy5fc2hvdyhtc2csIG9wdHMsICdpbmZvJyk7XG59O1xuXG5Ub2FzdC5wcm90b3R5cGUuc3VjY2VzcyA9IGZ1bmN0aW9uIHN1Y2Nlc3MgKG1zZywgb3B0cykge1xuICAgIGlmICggb3B0cyA9PT0gdm9pZCAwICkgb3B0cyA9IHt9O1xuXG4gIHRoaXMuX3Nob3cobXNnLCBvcHRzLCAnc3VjY2VzcycpO1xufTtcblxuVG9hc3QucHJvdG90eXBlLmVycm9yID0gZnVuY3Rpb24gZXJyb3IgKG1zZywgb3B0cykge1xuICAgIGlmICggb3B0cyA9PT0gdm9pZCAwICkgb3B0cyA9IHt9O1xuXG4gIHRoaXMuX3Nob3cobXNnLCBvcHRzLCAnZXJyb3InKTtcbn07XG5cblRvYXN0LnByb3RvdHlwZS5fc2hvdyA9IGZ1bmN0aW9uIF9zaG93IChtc2csIG9wdHMsIHR5cGUpIHtcbiAgdmFyIF9vcHRzID0gYXNzaWduKHt9LCB0aGlzLm9wdHMsIG9wdHMpO1xuICB2YXIgdCA9IG5ldyBUb2FzdCQyKHtcbiAgICB0YXJnZXQ6IGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3IoJ2JvZHknKSxcbiAgICBkYXRhOiB7XG4gICAgICBtc2c6IG1zZyxcbiAgICAgIHR5cGU6IHR5cGUsXG4gICAgICBwb3N0aW9uOiBfb3B0cy5wb3N0aW9uXG4gICAgfVxuICB9KTtcblxuICBzZXRUaW1lb3V0KGZ1bmN0aW9uICgpIHtcbiAgICB0LnNldCh7IHR5cGU6IHQuZ2V0KCd0eXBlJykgKyAnICcgKyAnYW5pbScgfSk7XG4gIH0sIDApO1xuXG4gIHNldFRpbWVvdXQoZnVuY3Rpb24gKCkge1xuICAgIHQuZGVzdHJveSgpO1xuICB9LCBfb3B0cy5kdXJhdGlvbik7XG59O1xuXG5tb2R1bGUuZXhwb3J0cyA9IFRvYXN0O1xuIiwiPGRpdiBjbGFzcz1cInctZnVsbCBoLWZ1bGwgZmxleCBmbGV4LWNvbCB0ZXh0LXhzXCI+XG4gIDxkaXYgY2xhc3M9XCJmbGV4IGZsZXgtcm93IHAtMiBpdGVtcy1zdHJldGNoXCI+XG4gICAgPCEtLTxpbnB1dCBiaW5kOnZhbHVlPXtuaWNrbmFtZX0gY2xhc3M9XCJ3LTMyIGJvcmRlciBwLTJcIiBwbGFjZWhvbGRlcj1cIuuLieuEpOyehFwiLz4tLT5cbiAgICA8ZGl2IGNsYXNzPVwidy00XCI+XG4gICAgICB7I2lmIHByb2ZpbGVfaW1hZ2VfdXJpfVxuICAgICAgPGltZyBjbGFzcz1cInctZnVsbCBoLWZ1bGxcIiBzcmM9XCJ7cHJvZmlsZV9pbWFnZV91cml9XCIgLz5cbiAgICAgIHs6ZWxzZX1cbiAgICAgIDxkaXYgY2xhc3M9XCJ3LWZ1bGwgaC1mdWxsIHNwaW5uZXJcIj48L2Rpdj5cbiAgICAgIHsvaWZ9XG4gICAgPC9kaXY+XG4gICAgPCEtLTxpbnB1dCB0eXBlPVwicGFzc3dvcmRcIiBiaW5kOnZhbHVlPXtwYXNzd29yZH0gY2xhc3M9XCJ3LTMyIGJvcmRlciBwLTIgbWwtMlwiIHBsYWNlaG9sZGVyPVwi67mE67CA67KI7Zi4XCIvPi0tPlxuICAgIDx0ZXh0YXJlYSBiaW5kOnZhbHVlPXtjb250ZW50c30gY2xhc3M9XCJmbGV4LTEgcC0xIG1sLTQgYm9yZGVyXCIgcm93cz1cIjJcIj48L3RleHRhcmVhPlxuICAgIDxidXR0b24gY2xhc3M9XCJib3JkZXIgdGV4dC1jZW50ZXIgcC0yIHRleHQtd2hpdGUgYmctcHJpbWFyeS02MDBcIiBvbjpjbGljaz17c3VibWl0fT4g65Ox66GdIDwvYnV0dG9uPlxuICA8L2Rpdj5cbiAgPGRpdiBjbGFzcz1cImZsZXgtMVwiPlxuICAgIHsjaWYgY29tbWVudHN9XG4gICAgICB7I2VhY2ggY29tbWVudHMgYXMgY29tbWVudCwgaSAoY29tbWVudC5pZCl9XG4gICAgICAgIDxkaXYgY2xhc3M9XCJib3JkZXItYiBmbGV4IGZsZXgtcm93IHAtMiBpdGVtcy1zdHJldGNoXCIgY2xhc3M6b3BhY2l0eS01MD17IWNvbW1lbnQuYWdyZWVkICYmIGNvbW1lbnQudXB2b3RlIC0gY29tbWVudC5kb3dudm90ZSA8PSAtNX0+XG4gICAgICAgICAgPGRpdiBjbGFzcz1cInRleHQtZ3JheS02MDAgbS1hdXRvIHctNCB0ZXh0LXJpZ2h0XCJcbiAgICAgICAgICAgICAgIGNsYXNzOnRleHQteHM9e01hdGguYWJzKGNvbW1lbnQudXB2b3RlIC0gY29tbWVudC5kb3dudm90ZSkgPj0gMTB9XG4gICAgICAgICAgICAgICBjbGFzczp0ZXh0LWxnPXtNYXRoLmFicyhjb21tZW50LnVwdm90ZSAtIGNvbW1lbnQuZG93bnZvdGUpIDwgMTB9PiB7Y29tbWVudC51cHZvdGUgLSBjb21tZW50LmRvd252b3RlfSA8L2Rpdj5cbiAgICAgICAgICA8ZGl2IGNsYXNzPVwiZmxleCBmbGV4LWNvbCBqdXN0aWZ5LWNlbnRlciBtci0yIG1sLTEgdGV4dC1ncmF5LTYwMFwiPlxuICAgICAgICAgICAgPGJ1dHRvbiBvbjpjbGljaz17ZT0+dm90ZShjb21tZW50LmlkLCB0cnVlLCBpKX0+PEZhSWNvbiBjbGFzcz1cInctNCBoLTRcIiBpY29uPXtmYUFycm93VXB9IC8+PC9idXR0b24+XG4gICAgICAgICAgICA8YnV0dG9uIG9uOmNsaWNrPXtlPT52b3RlKGNvbW1lbnQuaWQsIGZhbHNlLCBpKX0+PEZhSWNvbiBjbGFzcz1cInctNCBoLTRcIiBpY29uPXtmYUFycm93RG93bn0gLz48L2J1dHRvbj5cbiAgICAgICAgICA8L2Rpdj5cbiAgICAgICAgICA8ZGl2IGNsYXNzPVwidy00XCI+IFxuICAgICAgICAgICAgPGltZyBjbGFzcz1cInctZnVsbCBoLWZ1bGxcIiBzcmM9XCJ7aGFzaF90b19pbWFnZV91cmkoY29tbWVudC5maW5nZXJwcmludF9oYXNoKX1cIj4gXG4gICAgICAgICAgPC9kaXY+XG4gICAgICAgICAgeyNpZiBjb21tZW50LmFncmVlZCB8fCBjb21tZW50LnVwdm90ZSAtIGNvbW1lbnQuZG93bnZvdGUgPiAtNX1cbiAgICAgICAgICAgIDxkaXYgY2xhc3M9XCJtbC00IGZsZXgtMSBmbGV4IGZsZXgtcm93IGl0ZW1zLWNlbnRlclwiPiB7Y29tbWVudC5jb250ZW50c30gPC9kaXY+XG4gICAgICAgICAgezplbHNlfVxuICAgICAgICAgICAgPGJ1dHRvbiBjbGFzcz1cImZsZXgtMSB0ZXh0LWxlZnQgcGwtNFwiIG9uOmNsaWNrPXtlPT4gY29tbWVudHNbaV0uYWdyZWVkID0gdHJ1ZX0+XG4gICAgICAgICAgICAgIH4g7Y687LmY6riwIH5cbiAgICAgICAgICAgIDwvYnV0dG9uPlxuICAgICAgICAgIHsvaWZ9XG4gICAgICAgICAgPCEtLTxkaXYgY2xhc3M9XCJ0ZXh0LWdyYXktNjAwIG1sLTIgdGV4dC1jZW50ZXJcIj4ge3RpbWVfYWdvKG5ldyBEYXRlKGNvbW1lbnQudGltZSkpfSA8L2Rpdj4tLT5cbiAgICAgICAgPC9kaXY+XG4gICAgICB7OmVsc2V9XG4gICAgICAgIDxkaXYgY2xhc3M9XCJ3LWZ1bGwgaC1mdWxsIGZsZXgganVzdGlmeS1jZW50ZXIgaXRlbXMtY2VudGVyIHRleHQteGwgdGV4dC1ncmF5LTYwMCBwYi0yIHB0LTJcIj5cbiAgICAgICAgICA8ZGl2PlxuICAgICAgICAgICAg64yT6riA7J20IOyXhuyWtOyalCDjhZzjhZxcbiAgICAgICAgICA8L2Rpdj5cbiAgICAgICAgPC9kaXY+XG4gICAgICB7L2VhY2h9XG4gICAgICB7I2lmIGxvYWRfbW9yZV9sb2FkaW5nfVxuICAgICAgPGRpdiBvbjpjbGljaz17bG9hZF9tb3JlfSBjbGFzcz1cInctZnVsbCBib3JkZXItdCBwLTIgc3Bpbm5lclwiPjwvZGl2PlxuICAgICAgezplbHNlfVxuICAgICAgPGJ1dHRvbiBvbjpjbGljaz17bG9hZF9tb3JlfSBjbGFzcz1cInctZnVsbCBib3JkZXItdCBweS0zIHRleHQtbm9ybWFsXCI+642UIOuztOq4sDwvYnV0dG9uPlxuICAgICAgey9pZn1cbiAgICB7OmVsc2V9IFxuICAgICAgPGRpdiBjbGFzcz1cInctZnVsbCBoLWZ1bGwgc3Bpbm5lciB0ZXh0LTR4bFwiLz4gXG4gICAgey9pZn1cbiAgPC9kaXY+XG48L2Rpdj5cblxuPHNjcmlwdD5cbmltcG9ydCB7IG9uTW91bnQgfSBmcm9tIFwic3ZlbHRlXCI7XG5pbXBvcnQgeyBBUEkgfSBmcm9tICcuLi9hcGkuanMnO1xuaW1wb3J0IEZhSWNvbiBmcm9tICcuL0ZhSWNvbi5zdmVsdGUnO1xuaW1wb3J0IHsgZmFBcnJvd1VwIH0gZnJvbSAnQGZvcnRhd2Vzb21lL2ZyZWUtc29saWQtc3ZnLWljb25zL2ZhQXJyb3dVcCc7XG5pbXBvcnQgeyBmYUFycm93RG93biB9IGZyb20gJ0Bmb3J0YXdlc29tZS9mcmVlLXNvbGlkLXN2Zy1pY29ucy9mYUFycm93RG93bic7XG5pbXBvcnQgeyB0aW1lX2FnbyB9IGZyb20gXCIuLi91dGlsLmpzXCI7XG5pbXBvcnQgVG9hc3QgZnJvbSAnc3ZlbHRlLXRvYXN0J1xuY29uc3QgdG9hc3QgPSBuZXcgVG9hc3QoKTtcblxuZXhwb3J0IGxldCBzdHJlYW1lcl9pZDtcblxubGV0IG5pY2tuYW1lID0gXCJndWVzdFwiO1xubGV0IHBhc3N3b3JkID0gXCIxMjM0XCI7XG5sZXQgY29udGVudHM7XG5cbmxldCBjb21tZW50cztcblxubGV0IGxvYWRfbW9yZV9sb2FkaW5nID0gZmFsc2U7XG5cbmxldCBwcm9maWxlX2ltYWdlX3VyaTtcblxuZnVuY3Rpb24gcmVmcmVzaF9jb21tZW50cygpe1xuICBBUEkuY29tbWVudHMoc3RyZWFtZXJfaWQpLnRoZW4oX2NvbW1lbnRzID0+IHtcbiAgICBjb21tZW50cyA9IF9jb21tZW50cztcbiAgfSkuY2F0Y2goZSA9PiB7XG4gIH0pO1xufVxuZnVuY3Rpb24gbG9hZF9tb3JlKCl7XG4gIGlmKGNvbW1lbnRzLmxlbmd0aCl7XG4gICAgbG9hZF9tb3JlX2xvYWRpbmcgPSB0cnVlO1xuICAgIEFQSS5jb21tZW50cyhzdHJlYW1lcl9pZCwgY29tbWVudHMubGVuZ3RoKS50aGVuKF9jb21tZW50cyA9PiB7XG4gICAgICBjb21tZW50cyA9IFsuLi5jb21tZW50cywgLi4uX2NvbW1lbnRzXTtcbiAgICAgIGxvYWRfbW9yZV9sb2FkaW5nID0gZmFsc2U7XG4gICAgfSk7XG4gIH1cbn1cblxuY29uc3QgYmFzZTY0YWJjID0gKCgpID0+IHtcblx0bGV0IGFiYyA9IFtdLFxuXHRcdEEgPSBcIkFcIi5jaGFyQ29kZUF0KDApLFxuXHRcdGEgPSBcImFcIi5jaGFyQ29kZUF0KDApLFxuXHRcdG4gPSBcIjBcIi5jaGFyQ29kZUF0KDApO1xuXHRmb3IgKGxldCBpID0gMDsgaSA8IDI2OyArK2kpIHtcblx0XHRhYmMucHVzaChTdHJpbmcuZnJvbUNoYXJDb2RlKEEgKyBpKSk7XG5cdH1cblx0Zm9yIChsZXQgaSA9IDA7IGkgPCAyNjsgKytpKSB7XG5cdFx0YWJjLnB1c2goU3RyaW5nLmZyb21DaGFyQ29kZShhICsgaSkpO1xuXHR9XG5cdGZvciAobGV0IGkgPSAwOyBpIDwgMTA7ICsraSkge1xuXHRcdGFiYy5wdXNoKFN0cmluZy5mcm9tQ2hhckNvZGUobiArIGkpKTtcblx0fVxuXHRhYmMucHVzaChcIitcIik7XG5cdGFiYy5wdXNoKFwiL1wiKTtcblx0cmV0dXJuIGFiYztcbn0pKCk7XG5cbmZ1bmN0aW9uIGJ5dGVzVG9CYXNlNjQoYnl0ZXMpIHtcblx0bGV0IHJlc3VsdCA9ICcnLCBpLCBsID0gYnl0ZXMubGVuZ3RoO1xuXHRmb3IgKGkgPSAyOyBpIDwgbDsgaSArPSAzKSB7XG5cdFx0cmVzdWx0ICs9IGJhc2U2NGFiY1tieXRlc1tpIC0gMl0gPj4gMl07XG5cdFx0cmVzdWx0ICs9IGJhc2U2NGFiY1soKGJ5dGVzW2kgLSAyXSAmIDB4MDMpIDw8IDQpIHwgKGJ5dGVzW2kgLSAxXSA+PiA0KV07XG5cdFx0cmVzdWx0ICs9IGJhc2U2NGFiY1soKGJ5dGVzW2kgLSAxXSAmIDB4MEYpIDw8IDIpIHwgKGJ5dGVzW2ldID4+IDYpXTtcblx0XHRyZXN1bHQgKz0gYmFzZTY0YWJjW2J5dGVzW2ldICYgMHgzRl07XG5cdH1cblx0aWYgKGkgPT09IGwgKyAxKSB7IC8vIDEgb2N0ZXQgbWlzc2luZ1xuXHRcdHJlc3VsdCArPSBiYXNlNjRhYmNbYnl0ZXNbaSAtIDJdID4+IDJdO1xuXHRcdHJlc3VsdCArPSBiYXNlNjRhYmNbKGJ5dGVzW2kgLSAyXSAmIDB4MDMpIDw8IDRdO1xuXHRcdHJlc3VsdCArPSBcIj09XCI7XG5cdH1cblx0aWYgKGkgPT09IGwpIHsgLy8gMiBvY3RldHMgbWlzc2luZ1xuXHRcdHJlc3VsdCArPSBiYXNlNjRhYmNbYnl0ZXNbaSAtIDJdID4+IDJdO1xuXHRcdHJlc3VsdCArPSBiYXNlNjRhYmNbKChieXRlc1tpIC0gMl0gJiAweDAzKSA8PCA0KSB8IChieXRlc1tpIC0gMV0gPj4gNCldO1xuXHRcdHJlc3VsdCArPSBiYXNlNjRhYmNbKGJ5dGVzW2kgLSAxXSAmIDB4MEYpIDw8IDJdO1xuXHRcdHJlc3VsdCArPSBcIj1cIjtcblx0fVxuXHRyZXR1cm4gcmVzdWx0O1xufVxuXG5mdW5jdGlvbiBoYXNoX3RvX2ltYWdlX3VyaShoYXNoKXtcbiAgcmV0dXJuIGBodHRwczovL2F2YXRhcnMuZGljZWJlYXIuY29tL3YyL2lkZW50aWNvbi8ke2VzY2FwZShieXRlc1RvQmFzZTY0KGhhc2gpKX0uc3ZnYDtcbn1cblxucmVmcmVzaF9jb21tZW50cygpO1xuXG5BUEkuZmluZ2VycHJpbnRfaGFzaCgpLnRoZW4oaGFzaCA9PiB7XG4gIHByb2ZpbGVfaW1hZ2VfdXJpID0gaGFzaF90b19pbWFnZV91cmkoaGFzaCk7XG59KTtcblxuZnVuY3Rpb24gc3VibWl0KCl7XG4gIEFQSS53cml0ZV9jb21tZW50KHN0cmVhbWVyX2lkLCBuaWNrbmFtZSwgcGFzc3dvcmQsIGNvbnRlbnRzKS50aGVuKHJlcyA9PiB7XG4gICAgcmVmcmVzaF9jb21tZW50cygpO1xuICB9KTtcbn1cblxuZnVuY3Rpb24gc2NvcmUoY29tbWVudCl7XG4gIGxldCBuID0gY29tbWVudC51cHZvdGUgKyBjb21tZW50LmRvd252b3RlLFxuICAgICAgcCA9IGNvbW1lbnQudXB2b3RlIC8gbixcbiAgICAgIHogPSAxLjI4MTU1MTU2NTU0NSxcbiAgICAgIGwgPSBwICsgMS8oMipuKSp6KnosXG4gICAgICByID0geipNYXRoLnNxcnQocCooMS1wKS9uICsgeip6Lyg0Km4qbikpLFxuICAgICAgdW5kZXIgPSAxKzEvbip6Kno7XG4gIHJldHVybiAoMSAtIHIpIC8gdW5kZXI7XG59XG5mdW5jdGlvbiB2b3RlKGlkLCB1cHZvdGUsIGlkeCl7XG4gIEFQSS52b3RlX2NvbW1lbnQoc3RyZWFtZXJfaWQsIGlkLCB1cHZvdGUpLnRoZW4ocmVzID0+IHtcbiAgICBpZih1cHZvdGUpXG4gICAgICBjb21tZW50c1tpZHhdLnVwdm90ZSA9IGNvbW1lbnRzW2lkeF0udXB2b3RlICsgMTtcbiAgICBlbHNlXG4gICAgICBjb21tZW50c1tpZHhdLmRvd252b3RlID0gY29tbWVudHNbaWR4XS5kb3dudm90ZSArIDE7XG4gICAgY29tbWVudHNbaWR4XS5zY29yZSA9IHNjb3JlKGNvbW1lbnRzW2lkeF0pO1xuICAgIGNvbW1lbnRzID0gY29tbWVudHMuc29ydCgoYSwgYikgPT4gYi5zY29yZSAtIGEuc2NvcmUgfHwgYi5wYXJlbnRfaWQgLSBhLnBhcmVudF9pZCB8fCBiLmlkIC0gYS5pZClcbiAgfSkuY2F0Y2goZSA9PiB7XG4gICAgaWYoZSA9PSA0MDApIHtcbiAgICAgIHRvYXN0LnNob3coJ+ykkeuztSDtj4nqsIDripQg7JWI64+87JqUIScpO1xuICAgIH1cbiAgfSk7XG59XG5cbmxldCBsYXN0X3N0cmVhbWVyX2lkO1xuJDogaWYobGFzdF9zdHJlYW1lcl9pZCAhPSBzdHJlYW1lcl9pZCkge1xuICBsYXN0X3N0cmVhbWVyX2lkID0gc3RyZWFtZXJfaWQ7XG4gIHJlZnJlc2hfY29tbWVudHMoKTtcbn1cbjwvc2NyaXB0PlxuIiwiPGNhbnZhcyBjbGFzcz1cInctZnVsbFwiIGJpbmQ6dGhpcz17Y2FudmFzfT5cbjwvY2FudmFzPlxuPHNjcmlwdD5cbmltcG9ydCB7IG9uTW91bnQgfSBmcm9tIFwic3ZlbHRlXCI7XG5pbXBvcnQgeyBBUEkgfSBmcm9tIFwiLi4vYXBpLmpzXCJcbmV4cG9ydCBsZXQgc3RyZWFtZXJfaWQ7XG5sZXQgY2FudmFzO1xubGV0IFdvcmRDbG91ZDtcbmxldCB3aWR0aDtcbmxldCBoZWlnaHQ7XG5cbmxldCBsYXN0X3N0cmVhbWVyX2lkID0gbnVsbDtcblxuJDogaWYoV29yZENsb3VkICYmIGxhc3Rfc3RyZWFtZXJfaWQgIT0gc3RyZWFtZXJfaWQpIHtcbiAgbGFzdF9zdHJlYW1lcl9pZCA9IHN0cmVhbWVyX2lkO1xuICBBUEkua2V5d29yZHMoc3RyZWFtZXJfaWQpLnRoZW4oa2V5d29yZHMgPT4ge1xuICAgIGtleXdvcmRzID0ga2V5d29yZHMuZmlsdGVyKHggPT4geFswXSAhPSBcIuOFi+OFi1wiICYmIHhbMF0gIT0gXCLjhLfjhLdcIik7XG4gICAgbGV0IG1heF9mcmFjdGlvbiA9IE1hdGgubWF4KC4uLmtleXdvcmRzLm1hcCh4ID0+IHhbMV0pKSxcbiAgICAgICAgbWluX2ZyYWN0aW9uID0gTWF0aC5taW4oLi4ua2V5d29yZHMubWFwKHggPT4geFsxXSkpO1xuICAgIC8va2V5d29yZHMgPSBrZXl3b3Jkcy5tYXAoeCA9PiBbeFswXSwgKHhbMV0gLSBtaW5fZnJhY3Rpb24pLyhtYXhfZnJhY3Rpb24tbWluX2ZyYWN0aW9uKSoxMjAgKyA5XSk7XG4gICAga2V5d29yZHMgPSBrZXl3b3Jkcy5tYXAoeCA9PiBbeFswXSwgKHhbMV0gLSBtaW5fZnJhY3Rpb24pLyhtYXhfZnJhY3Rpb24tbWluX2ZyYWN0aW9uKSo5LjIgKyAwLjhdKTtcbiAgICBsZXQgYXJlYSA9IGtleXdvcmRzLnJlZHVjZSgocmVzLGIpID0+IHJlcyArIGJbMF0ubGVuZ3RoKmJbMV0sIDApO1xuICAgIFdvcmRDbG91ZChjYW52YXMsIHtcbiAgICAgIGxpc3Q6IGtleXdvcmRzLFxuICAgICAgZ3JpZFNpemU6IE1hdGgucm91bmQoMTYgKiB3aWR0aCAvIDEwMjQpLFxuICAgICAgd2VpZ2h0RmFjdG9yOiB3aWR0aCAvIDEwMjQgKiAzMiAqIDM4MC9hcmVhLFxuICAgICAgZm9udEZhbWlseTogJy1hcHBsZS1zeXN0ZW0sIEJsaW5rTWFjU3lzdGVtRm9udCwgU2Vnb2UgVUksIFJvYm90bywgSGVsdmV0aWNhIE5ldWUsIEFyaWFsLCBOb3RvIFNhbnMsIHNhbnMtc2VyaWYsIEFwcGxlIENvbG9yIEVtb2ppLCBTZWdvZSBVSSBFbW9qaSwgU2Vnb2UgVUkgU3ltYm9sLCBOb3RvIENvbG9yIEVtb2ppJyxcbiAgICAgIGZvbnRXZWlnaHQ6IFwiYm9sZFwiLFxuICAgICAgY29sb3I6ICdyYW5kb20tZGFyaycsXG4gICAgICBiYWNrZ3JvdW5kQ29sb3I6ICd0cmFuc3BhcmVudCcsXG4gICAgICByb3RhdGVSYXRpbzogMCxcbiAgICAgIHJvdGF0aW9uU3RlcHM6IDFcbiAgICAgICwgIGVsbGlwdGljaXR5OiAxLFxuICAgICAgLypzaGFwZTogZnVuY3Rpb24odGhldGEpIHtcbiAgICAgICAgdmFyIG1heCA9IDE5NTtcbiAgICAgICAgdmFyIGxlbmcgPSBbMTM0LDEzNSwxMzUsMTM1LDEzNSwxMzUsMTM1LDEzNSwxMzUsMTM1LDEzNSwxMzUsMTM1LDEzNiwxMzYsMTM2LDEzNiwxMzYsMTM3LDEzNywxMzcsMTM4LDEzOCwxMzgsMTM4LDEzOSwxMzksMTQwLDE0MCwxNDAsMTQxLDE0MSwxNDIsMTQyLDE0MywxNDMsMTQ0LDE0NCwxNDUsMTQ1LDE0NiwxNDcsMTQ3LDE0OCwxNDksMTQ5LDE1MCwxNTEsMTUyLDE1MywxNTMsMTU0LDE1NSwxNTYsMTU3LDE1OCwxNTksMTYwLDE2MSwxNjIsMTYzLDE2NCwxNjUsMTY3LDE2OCwxNjksMTcwLDE3MiwxNzMsMTc1LDE3NiwxNzgsMTc5LDE4MSwxODIsMTg0LDE4NiwxODgsMTg5LDE5MSwxOTMsMTk1LDE5NSwxOTMsMTkyLDE5MCwxODgsMTg3LDE4NSwxODQsMTgyLDE4MSwxNzksMTc4LDE3NywxNzUsMTc0LDE3MywxNzIsMTcxLDE2OSwxNjgsMTY3LDE2NiwxNjUsMTY0LDE2MywxNjMsMTYyLDE2MSwxNjAsMTU5LDE1OCwxNTgsMTU3LDE1NiwxNTUsMTU1LDE1NCwxNTQsMTUzLDE1MiwxNTIsMTUxLDE1MSwxNTAsMTUwLDE0OSwxNDksMTQ4LDE0OCwxNDgsMTQ3LDE0NywxNDYsMTQ2LDE0NiwxNDUsMTQ1LDE0NSwxNDUsMTQ0LDE0NCwxNDQsMTQ0LDE0NCwxNDMsMTQzLDE0MywxNDMsMTQzLDE0MywxNDMsMTQzLDE0MywxNDMsMTQzLDE0MywxNDMsMTQzLDE0MywxNDMsMTQzLDE0MywxNDMsMTQzLDE0MywxNDMsMTQzLDE0NCwxNDQsMTQ0LDE0NCwxNDQsMTQ1LDE0NSwxNDUsMTQ1LDE0NiwxNDYsMTQ2LDE0NywxNDcsMTQ3LDE0OCwxNDgsMTQ5LDE0OSwxNTAsMTUwLDE1MSwxNTEsMTUyLDE1MiwxNTMsMTUzLDE1NCwxNTUsMTU1LDE1NiwxNTcsMTU3LDE1OCwxNTksMTYwLDE2MSwxNjIsMTYyLDE2MywxNjQsMTY1LDE2NiwxNjcsMTY4LDE2OSwxNzAsMTcyLDE3MywxNzQsMTc1LDE3NiwxNzgsMTc5LDE4MCwxODIsMTgzLDE4NSwxODYsMTg4LDE5MCwxOTEsMTkzLDE5NSwxOTMsMTkxLDE4OSwxODcsMTg1LDE4MywxODIsMTgwLDE3OCwxNzcsMTc1LDE3NCwxNzIsMTcxLDE2OSwxNjgsMTY3LDE2NiwxNjQsMTYzLDE2MiwxNjEsMTYwLDE1OSwxNTgsMTU3LDE1NiwxNTUsMTU0LDE1MywxNTIsMTUxLDE1MCwxNTAsMTQ5LDE0OCwxNDcsMTQ3LDE0NiwxNDUsMTQ1LDE0NCwxNDMsMTQzLDE0MiwxNDIsMTQxLDE0MSwxNDAsMTQwLDEzOSwxMzksMTM4LDEzOCwxMzgsMTM3LDEzNywxMzYsMTM2LDEzNiwxMzYsMTM1LDEzNSwxMzUsMTM0LDEzNCwxMzQsMTM0LDEzNCwxMzMsMTMzLDEzMywxMzMsMTMzLDEzMywxMzMsMTMzLDEzMywxMzMsMTMzLDEzMywxMzMsMTMzLDEzMywxMzMsMTMzLDEzMywxMzMsMTMzLDEzMywxMzMsMTMzLDEzMywxMzMsMTM0LDEzNCwxMzQsMTM0LDEzNCwxMzUsMTM1LDEzNSwxMzUsMTM2LDEzNiwxMzYsMTM3LDEzNywxMzcsMTM4LDEzOCwxMzksMTM5LDE0MCwxNDAsMTQwLDE0MSwxNDIsMTQyLDE0MywxNDMsMTQ0LDE0NCwxNDUsMTQ2LDE0NiwxNDcsMTQ4LDE0OSwxNDksMTUwLDE1MSwxNTIsMTUzLDE1NCwxNTQsMTU1LDE1NiwxNTcsMTU4LDE1OSwxNjAsMTYwLDE1OCwxNTYsMTU0LDE1MiwxNTAsMTQ4LDE0NiwxNDQsMTQzLDE0MSwxMzksMTM4LDEzNiwxMzUsMTMzLDEzMiwxMzEsMTI5LDEyOCwxMjcsMTI2LDEyNCwxMjMsMTIyLDEyMSwxMjAsMTE5LDExOCwxMTcsMTE2LDExNSwxMTQsMTE0LDExMywxMTIsMTExLDExMCwxMTEsMTA5LDEwOCwxMDgsMTEwLDExMiwxMTQsMTE2LDExOCwxMjAsMTIyLDEyNSwxMjcsMTMwLDEzMywxMzYsMTM5LDE0MiwxNDUsMTQ5LDE0OSwxNDcsMTQ0LDE0MCwxMzYsMTM1LDEzMSwxMjksMTI2LDEyNSwxMjEsMTIwLDExOCwxMTUsMTE0LDExMywxMTAsMTA4LDEwNywxMDUsMTAzLDEwMiwxMDEsMTAwLDk3LDk2LDk1LDk0LDkzLDkyLDkyLDkyLDkyLDkyLDkyLDkzLDkyLDkyLDkyLDkyLDkyLDkyLDkyLDkyLDkyLDkyLDkyLDkyLDkyLDkzLDkyLDkyLDkyLDkzLDkzLDkzLDkzLDkzLDkzLDk0LDk0LDk0LDk0LDk0LDk1LDk1LDk1LDk1LDk2LDk2LDk2LDk3LDk3LDk3LDk4LDk4LDk4LDk5LDk5LDEwMCwxMDEsMTAxLDEwMSwxMDIsMTAyLDEwMywxMDMsMTA0LDEwNCwxMDUsMTA1LDEwNiwxMDcsMTA3LDEwOCwxMDksMTA5LDExMCwxMTEsMTEyLDExMiwxMTMsMTE0LDExNSwxMTYsMTE3LDExOCwxMTksMTIwLDEyMSwxMjEsMTIxLDEyMSwxMjIsMTIyLDEyMiwxMjIsMTIxLDEyMSwxMjEsMTIxLDEyMiwxMjIsMTIyLDEyMiwxMjIsMTIyLDEyMiwxMjIsMTIzLDEyMywxMjMsMTIzLDEyMywxMjMsMTIzLDEyNCwxMjQsMTI0LDEyNSwxMjUsMTI1LDEyNSwxMjYsMTI2LDEyNiwxMjcsMTI3LDEyOCwxMjgsMTI5LDEyOSwxMzAsMTMwLDEzMSwxMzEsMTMyLDEzMiwxMzMsMTMzLDEzNCwxMzQsMTM1LDEzNiwxMzYsMTM3LDEzOCwxMzksMTQwLDEzOSwxMzksMTM5LDEzOCwxMzgsMTM4LDEzNywxMzcsMTM3LDEzNywxMzYsMTM2LDEzNiwxMzYsMTM2LDEzNSwxMzUsMTM1LDEzNSwxMzUsMTM1LDEzNSwxMzUsMTM1LDEzNSwxMzUsMTM2XTtcblxuICAgICAgICByZXR1cm4gbGVuZ1sodGhldGEgLyAoMiAqIE1hdGguUEkpKSAqIGxlbmcubGVuZ3RoIHwgMF0gLyBtYXg7XG4gICAgICB9Ki9cbiAgICB9KTtcblxuICB9KTtcbn1cbm9uTW91bnQoYXN5bmMgKCk9PntcbiAgd2lkdGggPSBjYW52YXMuZ2V0Qm91bmRpbmdDbGllbnRSZWN0KCkud2lkdGgsXG4gIGhlaWdodCA9IGNhbnZhcy5nZXRCb3VuZGluZ0NsaWVudFJlY3QoKS5oZWlnaHQ7XG4gIGNhbnZhcy53aWR0aCA9IHdpZHRoO1xuICBjYW52YXMuaGVpZ2h0ID0gd2lkdGg7XG4gIGxldCB7IFdvcmRDbG91ZDp3IH0gPSBhd2FpdCBpbXBvcnQoJy4vd29yZGNsb3VkMi5qcycpO1xuICBXb3JkQ2xvdWQgPSB3O1xufSk7XG48L3NjcmlwdD5cbiIsIjxkaXYgY2xhc3M9XCJ3LWZ1bGwgdGV4dC14cyBwLTIgb3ZlcmZsb3ctaGlkZGVuIGZsZXggZmxleC1jb2wgaXRlbXMtc3RhcnQganVzdGlmeS1lbmQgd2hpdGVzcGFjZS1uby13cmFwXCIgYmluZDp0aGlzPXtjb250YWluZXJ9PlxuICB7I2VhY2ggZGlzdHJpYnV0aW9uIGFzIGR9XG4gICAgPGRpdiBjbGFzcz1cImZsZXggZmxleC1yb3cgdy1mdWxsIGl0ZW1zLWNlbnRlclwiPlxuICAgICAgPGRpdiBjbGFzcz1cInctMTYgdGV4dC1jZW50ZXIgcHItMlwiPnsgZFswXSA+PSAwPyBkWzBdICsgXCLqsJzsm5RcIiA6IFwi67mE6rWs64+FXCIgfTwvZGl2PlxuICAgICAgPGRpdiBjbGFzcz1cImJnLXByaW1hcnktNjAwIGZsZXggaXRlbXMtY2VudGVyIGgtZnVsbCB0ZXh0LWdyYXktNjAwIHB0LXB4XCIgc3R5bGU9XCJ3aWR0aDoge2RbMV0vbWF4X3JhdGlvKjUwfSU7IG1pbi13aWR0aDogMXB4XCI+IFxuICAgICAgICA8c3BhbiBjbGFzcz1cInBsLTJcIiBzdHlsZT1cIm1hcmdpbi1sZWZ0OiAxMDAlO1wiPlxuICAgICAgICB7KGRbMV0qMTAwKS50b0ZpeGVkKDEpfSVcbiAgICAgICAgPC9zcGFuPlxuICAgICAgPC9kaXY+XG4gICAgPC9kaXY+XG4gIHsvZWFjaH1cbiAgICA8ZGl2IGNsYXNzPVwiZmxleCBmbGV4LXJvdyBwdC0yIHctZnVsbCBmb250LWJvbGRcIj5cbiAgICAgIDxkaXYgY2xhc3M9XCJ3LTE2IHRleHQtY2VudGVyIHByLTJcIj7qtazrj4Xsm5TsiJg8L2Rpdj5cbiAgICAgIDxkaXYgY2xhc3M9XCJmbGV4LTEgdGV4dC1jZW50ZXJcIj7ruYTsnKg8L2Rpdj5cbiAgICA8L2Rpdj5cbjwvZGl2PlxuXG48c2NyaXB0PlxuaW1wb3J0IHsgb25Nb3VudCB9IGZyb20gXCJzdmVsdGVcIjtcbmltcG9ydCB7IEFQSSB9IGZyb20gXCIuLi9hcGkuanNcIlxuZXhwb3J0IGxldCBzdHJlYW1lcl9pZDtcbmxldCBjb250YWluZXI7XG5sZXQgV29yZENsb3VkXztcblxubGV0IGxhc3Rfc3RyZWFtZXJfaWQgPSBudWxsO1xubGV0IGRpc3RyaWJ1dGlvbiA9IFtdO1xubGV0IG1heF9yYXRpbyA9IDA7XG5cbiQ6IGlmKGxhc3Rfc3RyZWFtZXJfaWQgIT0gc3RyZWFtZXJfaWQpIHtcbiAgbGFzdF9zdHJlYW1lcl9pZCA9IHN0cmVhbWVyX2lkO1xuICBBUEkuYXZlcmFnZV9zdWJzY3JpYmVyX2Rpc3RyaWJ1dGlvbihzdHJlYW1lcl9pZCkudGhlbihfZGlzdHJpYnV0aW9uID0+IHtcbiAgICBsZXQgc3VtID0gX2Rpc3RyaWJ1dGlvbi5yZWR1Y2UoKGEsYikgPT4gYSArIGJbMV0sIDApO1xuICAgIF9kaXN0cmlidXRpb24gPSBfZGlzdHJpYnV0aW9uLm1hcCh4ID0+IFt4WzBdLCB4WzFdL3N1bV0pO1xuICAgIG1heF9yYXRpbyA9IE1hdGgubWF4KC4uLl9kaXN0cmlidXRpb24ubWFwKHggPT4geFsxXSkpO1xuICAgIGRpc3RyaWJ1dGlvbiA9IF9kaXN0cmlidXRpb24ucmV2ZXJzZSgpO1xuICB9KTtcbn1cblxub25Nb3VudCgoKT0+e1xuICBsZXQgd2lkdGggPSBjb250YWluZXIuZ2V0Qm91bmRpbmdDbGllbnRSZWN0KCkud2lkdGgsXG4gICAgaGVpZ2h0ID0gY29udGFpbmVyLmdldEJvdW5kaW5nQ2xpZW50UmVjdCgpLmhlaWdodDtcbiAgLy9jb250YWluZXIuc3R5bGUubWluSGVpZ2h0ID0gd2lkdGggKyBcInB4XCI7XG59KTtcbjwvc2NyaXB0PlxuIiwiPGRpdiBjbGFzcz1cInskJHByb3BzLmNsYXNzfSByZWxhdGl2ZSBmbGV4IGZsZXgtcm93IGl0ZW1zLWNlbnRlclwiIGNsYXNzOnB0LTQ9e2lzX2hlYWR9PlxuICA8ZGl2IGNsYXNzPVwidGV4dC1jZW50ZXIgdGV4dC1tZCB3LTE2XCI+XG4gICAge21vbnRofeyblFxuICA8L2Rpdj5cbiAgPGRpdiBjbGFzcz1cInJlbGF0aXZlIHByLTIgZmxleC0xXCI+XG4gICAgPHN2ZyBcbiAgICAgICBjbGFzcz1cIm92ZXJmbG93LXZpc2libGVcIlxuICAgICAgIHZpZXdCb3g9XCIwLHtpc19oZWFkPyAwOjF9LDcse01hdGguZmxvb3IoKGNhbGVuZGFyX3ZhbHVlcy5sZW5ndGggKyBzdGFydF9kYXkpLzcpICsgMSArIGlzX2hlYWQgLSAhaXNfaGVhZH1cIlxuICAgICAgIG9uOm1vdXNlb3Zlcj17aGFuZGxlTW91c2Vtb3ZlfVxuICAgICAgIG9uOm1vdXNlbW92ZT17aGFuZGxlTW91c2Vtb3ZlfSA+XG4gICAgICA8Zz5cbiAgICAgICAgeyNpZiBpc19oZWFkfVxuICAgICAgICB7I2VhY2ggW1wi7J28XCIsIFwi7JuUXCIsIFwi7ZmUXCIsIFwi7IiYXCIsIFwi66qpXCIsIFwi6riIXCIsIFwi7YagXCJdIGFzIGRheSwgaX1cbiAgICAgICAgICA8dGV4dCBcbiAgICAgICAgICAgeD1cIntpKzAuNX1cIiBcbiAgICAgICAgICAgeT1cIjAuNVwiXG4gICAgICAgICAgIHRleHQtYW5jaG9yPVwibWlkZGxlXCJcbiAgICAgICAgICAgYWxpZ25tZW50LWJhc2VsaW5lPVwibWlkZGxlXCJcbiAgICAgICAgICAge2RheX1cbiAgICAgICAgICAgc3R5bGU9XCJmaWxsOiB7aT09MCB8fCBpPT02PyAnI0ZGNDU2MCc6ICcjNDQ0NDQ0J307IGZvbnQtc2l6ZTogMC41cHhcIlxuICAgICAgICAgICA+XG4gICAgICAgICAgIHtkYXl9XG4gICAgICAgICAgPC90ZXh0PlxuICAgICAgICB7L2VhY2h9XG4gICAgICAgIHsvaWZ9XG4gICAgICAgIHsjZWFjaCBjYWxlbmRhcl92YWx1ZXMgYXMgdiwgaX1cbiAgICAgICAgPHJlY3QgXG4gICAgICAgICAgIHg9XCJ7KGkrc3RhcnRfZGF5KSU3fVwiIFxuICAgICAgICAgICB5PVwie01hdGguZmxvb3IoKGkrc3RhcnRfZGF5KS83ICsgaXNfaGVhZCl9XCIgXG4gICAgICAgICAgIHdpZHRoPVwiezF9XCIgXG4gICAgICAgICAgIGhlaWdodD1cInsxfVwiIFxuICAgICAgICAgICBzdHJva2U9XCIjNDQ0NDQ0XCJcbiAgICAgICAgICAgc3Ryb2tlLXdpZHRoPVwiMC4wMVwiXG4gICAgICAgICAgIGZpbGw9XCJyZ2Ioe3J9LCB7Z30sIHtifSwge3Y/IE1hdGgubWluKHYvKG1heF92YWwqMC41KSwgMSk6IDB9KVwiXG4gICAgICAgICAgIG9uOm1vdXNlb3Zlcj17ZSA9PiBob3ZlcmVkX3JlY3QgPSBbaSwgdiwgZS50YXJnZXRdfVxuICAgICAgICAgICBvbjptb3VzZW91dD17ZSA9PiB7IGlmKGhvdmVyZWRfcmVjdFswXSA9PSBpKSBob3ZlcmVkX3JlY3QgPSBudWxsO319XG4gICAgICAgICAgIC8+XG4gICAgICAgIDx0ZXh0XG4gICAgICAgICAgIHg9XCJ7KGkrc3RhcnRfZGF5KSU3ICsgMC41fVwiIFxuICAgICAgICAgICB5PVwie01hdGguZmxvb3IoKGkrc3RhcnRfZGF5KS83ICsgaXNfaGVhZCkgKyAwLjV9XCJcbiAgICAgICAgICAgdGV4dC1hbmNob3I9XCJtaWRkbGVcIlxuICAgICAgICAgICBhbGlnbm1lbnQtYmFzZWxpbmU9XCJtaWRkbGVcIlxuICAgICAgICAgICBzdHlsZT1cIm9wYWNpdHk6IDAuMjU7IGZpbGw6IHsoaStzdGFydF9kYXkpJTc9PTAgfHwgKGkrc3RhcnRfZGF5KSU3PT02PyAnI0ZGNDU2MCc6ICcjNDQ0NDQ0J307IGZvbnQtc2l6ZTogMC41cHg7IGZvbnQtd2VpZ2h0OiBib2xkOyBwb2ludGVyLWV2ZW50czpub25lO1wiXG4gICAgICAgICAgID5cbiAgICAgICAgICB7aSsxfVxuICAgICAgICA8L3RleHQ+XG4gICAgICAgIHsvZWFjaH1cbiAgICAgICAgeyNpZiAhaXNfaGVhZH1cbiAgICAgICAgICB7I2VhY2ggWzAsMSwyLDMsNCw1LDZdIGFzIGl9XG4gICAgICAgICAgICA8bGluZSBcbiAgICAgICAgICAgICAgIHgxPVwieyhpICsgc3RhcnRfZGF5KSU3fVwiIFxuICAgICAgICAgICAgICAgeTE9XCJ7TWF0aC5mbG9vcigoaStzdGFydF9kYXkpLzcgKyBpc19oZWFkKX1cIlxuICAgICAgICAgICAgICAgeDI9XCJ7KGkgKyBzdGFydF9kYXkpJTcrMX1cIlxuICAgICAgICAgICAgICAgeTI9XCJ7TWF0aC5mbG9vcigoaStzdGFydF9kYXkpLzcgKyBpc19oZWFkKX1cIlxuICAgICAgICAgICAgICAgc3Ryb2tlLXdpZHRoPVwiMC4wNVwiXG4gICAgICAgICAgICAgICBzdHJva2U9XCIjMjIyMjIyXCJcbiAgICAgICAgICAgICAgICAgICAgLz5cbiAgICAgICAgICB7L2VhY2h9XG4gICAgICAgICAgeyNpZiBzdGFydF9kYXl9XG4gICAgICAgICAgICA8bGluZSBcbiAgICAgICAgICAgICAgIHgxPVwie3N0YXJ0X2RheSU3fVwiIFxuICAgICAgICAgICAgICAgeTE9XCJ7TWF0aC5mbG9vcigoc3RhcnRfZGF5KS83ICsgaXNfaGVhZCl9XCJcbiAgICAgICAgICAgICAgIHgyPVwie3N0YXJ0X2RheSU3fVwiXG4gICAgICAgICAgICAgICB5Mj1cIntNYXRoLmZsb29yKChzdGFydF9kYXkpLzcgKyBpc19oZWFkICsgMSl9XCJcbiAgICAgICAgICAgICAgIHN0cm9rZS13aWR0aD1cIjAuMDVcIlxuICAgICAgICAgICAgICAgc3Ryb2tlPVwiIzIyMjIyMlwiXG4gICAgICAgICAgICAgICAgICAgIC8+XG4gICAgICAgICAgey9pZn1cbiAgICAgICAgey9pZn1cbiAgICAgIDwvZz5cbiAgICA8L3N2Zz5cbiAgICB7I2lmIGhvdmVyZWRfcmVjdH1cbiAgICAgIDxkaXYgXG4gICAgICAgICBjbGFzcz1cImZpeGVkIHRleHQtd2hpdGUgei01MCBiZy1ncmF5LTkwMCBvcGFjaXR5LTc1IHAtMiB0ZXh0LXhzIHRleHQtY2VudGVyXCIgXG4gICAgICAgICBzdHlsZT1cInRvcDoge20ueSArIDEwfXB4OyBsZWZ0OiB7bS54fXB4OyB0cmFuc2Zvcm06IHRyYW5zbGF0ZSgtNTAlLCAwKTtcIj5cbiAgICAgICAgPHNwYW4+PHNwYW4gY2xhc3M9XCJ0ZXh0LXNtXCI+e21vbnRofTwvc3Bhbj7sm5Q8c3BhbiBjbGFzcz1cInRleHQtc21cIj57aG92ZXJlZF9yZWN0WzBdKzF9PC9zcGFuPuydvDwvc3Bhbj48YnI+XG4gICAgICAgIDxzcGFuPjxzcGFuIGNsYXNzPVwidGV4dC1ub3JtYWxcIj57aG92ZXJlZF9yZWN0WzFdLnRvRml4ZWQoMSl9PC9zcGFuPuyLnOqwhCDrsKnshqHtlag8L3NwYW4+XG4gICAgICA8L2Rpdj5cbiAgICB7L2lmfVxuICA8L2Rpdj5cbjwvZGl2PlxuXG48c2NyaXB0IGNvbnRleHQ9XCJtb2R1bGVcIj5cbjwvc2NyaXB0PlxuXG48c2NyaXB0PlxuaW1wb3J0IHsgb25Nb3VudCB9IGZyb20gXCJzdmVsdGVcIjtcbmltcG9ydCB7IEFQSSB9IGZyb20gJy4uL2FwaS5qcyc7XG5leHBvcnQgbGV0IHN0cmVhbWVyO1xuZXhwb3J0IGxldCBtb250aF9vZmZzZXQgPSAwXG5leHBvcnQgbGV0IGlzX2hlYWQgPSB0cnVlO1xubGV0IG5vdyA9IG5ldyBEYXRlKCk7IFxubGV0IGhvdmVyZWRfcmVjdCA9IG51bGw7XG4kOiB0byA9IG5ldyBEYXRlKG5vdy5nZXRGdWxsWWVhcigpLCBub3cuZ2V0TW9udGgoKSsxICsgbW9udGhfb2Zmc2V0LCAxKTtcbiQ6IGZyb20gPSBuZXcgRGF0ZShub3cuZ2V0RnVsbFllYXIoKSwgbm93LmdldE1vbnRoKCkgKyBtb250aF9vZmZzZXQsIDEpO1xuJDogbW9udGggPSBmcm9tLmdldE1vbnRoKCkrMTtcbiQ6IHN0YXJ0X2RheSA9IGZyb20uZ2V0RGF5KCk7XG4kOiBtYXhfdmFsID0gTWF0aC5tYXgoLi4uY2FsZW5kYXJfdmFsdWVzKTtcblxubGV0IGNhbGVuZGFyX3ZhbHVlcyA9IG5ldyBBcnJheShuZXcgRGF0ZShub3cuZ2V0RnVsbFllYXIoKSwgbm93LmdldE1vbnRoKCkrbW9udGhfb2Zmc2V0KzEsIDApLmdldERhdGUoKSkuZmlsbCgwKTtcbmxldCBsYXN0X3N0cmVhbWVyO1xuJDogaWYobGFzdF9zdHJlYW1lciAhPSBzdHJlYW1lcikge1xuICBsYXN0X3N0cmVhbWVyID0gc3RyZWFtZXI7XG4gIEFQSS5zdHJlYW1fcmFuZ2VzKHN0cmVhbWVyLmlkLCBmcm9tLCB0bykudGhlbihzdHJlYW1fcmFuZ2VzID0+IHtcbiAgICBzdHJlYW1fcmFuZ2VzID0gc3RyZWFtX3Jhbmdlcy5maWx0ZXIociA9PiByWzBdID49IGZyb20uZ2V0VGltZSgpLzEwMDAgJiYgclswXSA8IHRvLmdldFRpbWUoKS8xMDAwKVxuICAgIGlmKCFzdHJlYW1fcmFuZ2VzKVxuICAgICAgcmV0dXJuIG51bGw7XG4gICAgbGV0IGRhdGVfdG9fc3RyZWFtX3RpbWUgPSB7fTtcbiAgICBsZXQgdmFsdWVzID0gbmV3IEFycmF5KG5ldyBEYXRlKG5vdy5nZXRGdWxsWWVhcigpLCBub3cuZ2V0TW9udGgoKSttb250aF9vZmZzZXQrMSwgMCkuZ2V0RGF0ZSgpKS5maWxsKDApO1xuICAgIGZvcihsZXQgciBvZiBzdHJlYW1fcmFuZ2VzKSB7XG4gICAgICBsZXQgZGF0ZSA9IG5ldyBEYXRlKHJbMF0qMTAwMCk7XG4gICAgICB2YWx1ZXNbZGF0ZS5nZXREYXRlKCktMV0gKz0gKHJbMV0gLSByWzBdKS8zNjAwO1xuICAgIH1cbiAgICBjYWxlbmRhcl92YWx1ZXMgPSB2YWx1ZXM7XG4gIH0pO1xufTtcblxuY29uc3QgciA9IDIwNTtcbmNvbnN0IGcgPSAxNjg7XG5jb25zdCBiID0gMTk5O1xuZnVuY3Rpb24gdmFsdWVfdG9fY29sb3Iodikge1xuICBsZXQgbiA9IHY/IE1hdGgubWluKHYvKG1heF92YWwqMC41KSwgMSk6IDA7XG4gIHJldHVybiBgcmdiKCR7cn0sICR7Z30sICR7Yn0sICR7bn0pYDtcbn1cblxubGV0IG0gPSB7IHg6IDAsIHk6IDAgfTtcblxuZnVuY3Rpb24gaGFuZGxlTW91c2Vtb3ZlKGV2ZW50KSB7XG4gIG0ueCA9IGV2ZW50LmNsaWVudFg7XG4gIG0ueSA9IGV2ZW50LmNsaWVudFk7XG59XG48L3NjcmlwdD5cbiIsIjxzdmVsdGU6aGVhZD5cblx0PHRpdGxlPiDtirjsiJhnZyAtIHtzdHJlYW1lci5uYW1lfSA8L3RpdGxlPlxuPC9zdmVsdGU6aGVhZD5cblxuPHNjcmlwdCBjb250ZXh0PVwibW9kdWxlXCI+XG5cdGltcG9ydCB7IEFQSSB9IGZyb20gJy4uLy4uL2FwaS5qcyc7XG4gIGV4cG9ydCBhc3luYyBmdW5jdGlvbiBwcmVsb2FkKHBhZ2UsIHNlc3Npb24pIHtcbiAgICBjb25zdCB7IGlkIH0gPSBwYWdlLnBhcmFtcztcbiAgICBsZXQgc3RyZWFtZXIgPSBhd2FpdCBBUEkuc3RyZWFtZXIuY2FsbCh0aGlzLCBpZCk7XG4gICAgbGV0IHNpbWlsYXJfc3RyZWFtZXJzID0gYXdhaXQgQVBJLnNpbWlsYXJfc3RyZWFtZXJzLmNhbGwodGhpcywgaWQpO1xuICAgIGxldCBzaW1pbGFyX3N0cmVhbWVyc190b3AxMCA9IHNpbWlsYXJfc3RyZWFtZXJzLnNsaWNlKDAsIDEwKTtcbiAgICByZXR1cm4geyBzdHJlYW1lciwgc2ltaWxhcl9zdHJlYW1lcnMsIHNpbWlsYXJfc3RyZWFtZXJzX3RvcDEwIH07XG4gIH1cbjwvc2NyaXB0PlxuXG5cbjxkaXYgY2xhc3M9XCJ3LWZ1bGwgbWQ6aC00OCBoLTQwIGJnLXByaW1hcnktNjAwXCI+XG48L2Rpdj5cblxuXG48ZGl2IGNsYXNzPVwiY29udGFpbmVyIG0tYXV0byBmbGV4IGZsZXgtY29sIG1kOml0ZW1zLXN0YXJ0IGl0ZW1zLWNlbnRlciBweC00XCI+XG4gIDxpbWdcbiAgICBjbGFzcz1cInJvdW5kZWQtbGcgdy02NCBoLTY0IG1kOnctYXV0byBtZDpzZWxmLXN0YXJ0IHNlbGYtY2VudGVyIG1kOmgtYXV0byBtZDotbXQtNDAgLW10LTMyIHotNSBib3JkZXItNCBib3JkZXItZ3JheS0yMDAgYmctZ3JheS0yMDBcIlxuICAgIHNyYz1cIntzdHJlYW1lci5wcm9maWxlX2ltYWdlX3VybH1cIlxuICAgIGFsdD1cIu2UhOuhnO2VhCDsnbTrr7jsp4BcIlxuICAvPlxuICA8ZGl2IGNsYXNzPVwibXQtOFwiPlxuICAgIDxoMSBjbGFzcz1cInRleHQtNHhsIHRyYWNraW5nLXdpZGVyIGlubGluZVwiPntzdHJlYW1lci5uYW1lfTwvaDE+XG4gICAgPEJhZGdlcyBzdHJlYW1lcj17c3RyZWFtZXJ9IGNsYXNzPVwibWwtMlwiPiA8L0JhZGdlcz5cbiAgICA8R2FtZUJhZGdlcyBzdHJlYW1lcj17c3RyZWFtZXJ9IGNsYXNzPVwiZmxleCBmbGV4LXJvdyBwdC0yIGZsZXgtd3JhcFwiPiA8L0dhbWVCYWRnZXM+XG4gIDwvZGl2PlxuICA8ZGl2IGNsYXNzPVwibXQtMTJcIj5cbiAgICB7c3RyZWFtZXIuZGVzY3JpcHRpb259XG4gIDwvZGl2PlxuICA8ZGl2IGNsYXNzPVwibXQtOCBmbGV4IGZsZXgtcm93XCI+XG4gICAgPGEgY2xhc3M9XCJ0ZXh0LXhzIHRleHQtYmx1ZS01MDAgZmxleCBmbGV4LXJvdyBpdGVtcy1jZW50ZXJcIiBocmVmPVwiaHR0cHM6Ly93d3cudHdpdGNoLnR2L3tzdHJlYW1lci5sb2dpbn1cIj5cbiAgICAgIDxzdmcgYXJlYS1oaWRkZW49XCJ0cnVlXCIgcm9sZT1cImltZ1wiIHhtbG5zPVwiaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmdcIiB2aWV3Qm94PVwiMCAwIHtmYUV4dGVybmFsTGlua0FsdC5pY29uWzBdfSB7ZmFFeHRlcm5hbExpbmtBbHQuaWNvblsxXX1cIiBjbGFzcz1cInctMyBoLTMgbXItMSBvdmVyZmxvdy12aXNpYmxlIGlubGluZS1ibG9ja1wiPlxuICAgICAgICA8cGF0aCBmaWxsPVwiY3VycmVudENvbG9yXCIgZD1cIntmYUV4dGVybmFsTGlua0FsdC5pY29uWzRdfVwiLz5cbiAgICAgIDwvc3ZnPlxuICAgICAgPHNwYW4+7Yq47JyE7LmYIOyxhOuEkDwvc3Bhbj5cbiAgICA8L2E+XG4gICAgPGEgY2xhc3M9XCJ0ZXh0LXhzIHRleHQtYmx1ZS01MDAgZmxleCBmbGV4LXJvdyBpdGVtcy1jZW50ZXIgbWwtNFwiIGhyZWY9XCIvbWFwP2ludGVyZXN0X3N0cmVhbWVyX2lkPXtzdHJlYW1lci5pZH1cIj5cbiAgICAgIDxzdmcgYXJlYS1oaWRkZW49XCJ0cnVlXCIgcm9sZT1cImltZ1wiIHhtbG5zPVwiaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmdcIiB2aWV3Qm94PVwiMCAwIHtmYUV4dGVybmFsTGlua0FsdC5pY29uWzBdfSB7ZmFFeHRlcm5hbExpbmtBbHQuaWNvblsxXX1cIiBjbGFzcz1cInctMyBoLTMgbXItMSBvdmVyZmxvdy12aXNpYmxlIGlubGluZS1ibG9ja1wiPlxuICAgICAgICA8cGF0aCBmaWxsPVwiY3VycmVudENvbG9yXCIgZD1cIntmYUV4dGVybmFsTGlua0FsdC5pY29uWzRdfVwiLz5cbiAgICAgIDwvc3ZnPlxuICAgICAgPHNwYW4+7KeA64+E7JeQ7IScIOywvuq4sDwvc3Bhbj5cbiAgICA8L2E+XG4gIDwvZGl2PlxuICA8dGFibGUgY2xhc3M9XCJtdC02IHRleHQteHNcIj5cbiAgICA8dHI+XG4gICAgICAgIDx0ZCBjbGFzcz1cInctMSBiZy1vcmFuZ2UtNDAwXCI+IDwvdGQ+XG4gICAgICAgIDx0ZCBjbGFzcz1cInRleHQtbGVmdCBwLTFcIj7tj4nssq3snpA8L3RkPlxuICAgICAgICA8dGQgY2xhc3M9XCJwbC02IHRleHQtb3JhbmdlLTQwMFwiPlxuICAgICAgICAgIDxzcGFuIGNsYXNzPVwiZm9udC1ib2xkIHRleHQtYmFzZVwiPntzdHJlYW1lci5hdmVyYWdlX3ZpZXdlcl9jb3VudC50b0xvY2FsZVN0cmluZygna28nLCB7dXNlR3JvdXBpbmc6dHJ1ZX0pfTwvc3Bhbj5cbiAgICAgICAgICDrqoVcbiAgICAgICAgPC90ZD5cbiAgICA8L3RyPlxuICAgIDx0cj5cbiAgICAgICAgPHRkIGNsYXNzPVwidy0xIGJnLXB1cnBsZS00MDBcIj4gPC90ZD5cbiAgICAgICAgPHRkIGNsYXNzPVwidGV4dC1sZWZ0IHAtMVwiPu2MlOuhnOybjDwvdGQ+XG4gICAgICAgIDx0ZCBjbGFzcz1cInBsLTYgdGV4dC1wdXJwbGUtNDAwXCI+XG4gICAgICAgICAgPHNwYW4gY2xhc3M9XCJmb250LWJvbGQgdGV4dC1iYXNlXCI+e3N0cmVhbWVyLmZvbGxvd2VyX2NvdW50LnRvTG9jYWxlU3RyaW5nKCdrbycsIHt1c2VHcm91cGluZzp0cnVlfSl9PC9zcGFuPlxuICAgICAgICAgIOuqhVxuICAgICAgICA8L3RkPlxuICAgIDwvdHI+XG4gICAgPHRyPlxuICAgICAgICA8dGQgY2xhc3M9XCJ3LTEgYmctYmx1ZS00MDBcIj4gPC90ZD5cbiAgICAgICAgPHRkIGNsYXNzPVwidGV4dC1sZWZ0IHAtMVwiPuuwqeyGoeufiTwvdGQ+XG4gICAgICAgIDx0ZCBjbGFzcz1cInBsLTYgdGV4dC1ibHVlLTQwMFwiPlxuICAgICAgICAgIOyjvCBcbiAgICAgICAgICA8c3BhbiBjbGFzcz1cImZvbnQtYm9sZCB0ZXh0LWJhc2VcIj57KHN0cmVhbWVyLnN0cmVhbWluZ19ob3Vyc19wZXJfd2VlayB8fCAwKS50b0ZpeGVkKDEpfTwvc3Bhbj4g7Iuc6rCEPC90ZD5cbiAgICA8L3RyPlxuICAgIDx0cj5cbiAgICAgICAgPHRkIGNsYXNzPVwidy0xIGJnLWdyZWVuLTQwMFwiPiA8L3RkPlxuICAgICAgICA8dGQgY2xhc3M9XCJ0ZXh0LWxlZnQgcC0xXCI+67Cp7Iah7Iuc6rCE64yAPC90ZD5cbiAgICAgICAgPHRkIGNsYXNzPVwicGwtNiB0ZXh0LWdyZWVuLTQwMFwiPlxuICAgICAgICAgIDxzcGFuIGNsYXNzPVwicHItMlwiPlxuICAgICAgICAgICAgPHNwYW4gY2xhc3M9XCJmb250LWJvbGQgdGV4dC1iYXNlXCI+e01hdGguZmxvb3Ioc3RyZWFtaW5nX3N0YXJ0X3RpbWUvMzYwMCl9PC9zcGFuPuyLnCBcbiAgICAgICAgICAgIDxzcGFuIGNsYXNzPVwiZm9udC1ib2xkIHRleHQtYmFzZVwiPntNYXRoLmZsb29yKHN0cmVhbWluZ19zdGFydF90aW1lJTM2MDAvNjApfTwvc3Bhbj7rtoQgXG4gICAgICAgICAgICA8c3BhbiBjbGFzcz1cInRleHQtZ3JheS02MDBcIj4gKMKxeyhzdHJlYW1pbmdfc3RhcnRfdGltZV9zdGQvMzYwMCkudG9GaXhlZCgxKX3si5zqsIQpIDwvc3Bhbj4gXG4gICAgICAgICAgICB+XG4gICAgICAgICAgICA8c3BhbiBjbGFzcz1cImZvbnQtYm9sZCB0ZXh0LWJhc2VcIj57TWF0aC5mbG9vcihzdHJlYW1pbmdfZW5kX3RpbWUvMzYwMCl9PC9zcGFuPuyLnCBcbiAgICAgICAgICAgIDxzcGFuIGNsYXNzPVwiZm9udC1ib2xkIHRleHQtYmFzZVwiPntNYXRoLmZsb29yKHN0cmVhbWluZ19lbmRfdGltZSUzNjAwLzYwKX08L3NwYW4+67aEXG4gICAgICAgICAgICA8c3BhbiBjbGFzcz1cInRleHQtZ3JheS02MDBcIj4gKMKxeyhzdHJlYW1pbmdfZW5kX3RpbWVfc3RkLzM2MDApLnRvRml4ZWQoMSl97Iuc6rCEKSA8L3NwYW4+IFxuICAgICAgICAgIDwvc3Bhbj5cbiAgICAgICAgPC90ZD5cbiAgICA8L3RyPlxuICAgIDx0cj5cbiAgICAgICAgPHRkIGNsYXNzPVwidy0xIGJnLXRlYWwtNDAwXCI+IDwvdGQ+XG4gICAgICAgIDx0ZCBjbGFzcz1cInRleHQtbGVmdCBwLTFcIj7so7zrsKnshqHsi5zqsIQ8L3RkPlxuICAgICAgICA8dGQgY2xhc3M9XCJwbC02IHRleHQtdGVhbC00MDBcIj5cbiAgICAgICAgICB7I2VhY2ggbWVhbl9zdHJlYW1pbmdfdGltZV9yYW5nZXMgYXMgcmFuZ2V9XG4gICAgICAgICAgICA8c3BhbiBjbGFzcz1cInByLTJcIj5cbiAgICAgICAgICAgICAgPHNwYW4gY2xhc3M9XCJmb250LWJvbGQgdGV4dC1iYXNlXCI+e01hdGguZmxvb3IocmFuZ2VbMF0vMzYwMCl9PC9zcGFuPuyLnCBcbiAgICAgICAgICAgICAgPHNwYW4gY2xhc3M9XCJmb250LWJvbGQgdGV4dC1iYXNlXCI+e01hdGguZmxvb3IocmFuZ2VbMF0lMzYwMC82MCl9PC9zcGFuPuu2hCB+IFxuICAgICAgICAgICAgICA8c3BhbiBjbGFzcz1cImZvbnQtYm9sZCB0ZXh0LWJhc2VcIj57TWF0aC5mbG9vcihyYW5nZVsxXS8zNjAwKX08L3NwYW4+7IucIFxuICAgICAgICAgICAgICA8c3BhbiBjbGFzcz1cImZvbnQtYm9sZCB0ZXh0LWJhc2VcIj57TWF0aC5mbG9vcihyYW5nZVsxXSUzNjAwLzYwKX08L3NwYW4+67aEXG4gICAgICAgICAgICA8L3NwYW4+XG4gICAgICAgICAgey9lYWNofVxuICAgICAgICAgIDxzcGFuIGNsYXNzPVwidGV4dC1ncmF5LTYwMFwiPiBcbiAgICAgICAgICAgICh7KG1lYW5fc3RyZWFtaW5nX3RpbWVfcmVsaWFiaWxpdHkgKiAxMDApLnRvRml4ZWQoMCl9JSDtmZXrpaApXG4gICAgICAgICAgPC9zcGFuPiBcbiAgICAgICAgPC90ZD5cbiAgICA8L3RyPlxuICAgIDwhLS08dHI+XG4gICAgICAgIDx0ZCBjbGFzcz1cInRleHQtcmlnaHRcIj7rsKnshqHrtoTsgrDrj4Q8L3RkPlxuICAgICAgICA8dGQgY2xhc3M9XCJwbC02IGZvbnQtYm9sZCB0ZXh0LWJhc2VcIj57KHN0cmVhbWluZ190aW1lX3Jhbmdlc192YXJpYW5jZSAqIDEwMCkudG9GaXhlZCgxKX0lPC90ZD5cbiAgICA8L3RyPi0tPlxuICA8L3RhYmxlPlxuPC9kaXY+XG5cbjxkaXYgY2xhc3M9XCJmbGV4IGZsZXgtY29sIGl0ZW1zLWNlbnRlciBtLWF1dG8gY29udGFpbmVyXCI+XG4gIDxkaXYgY2xhc3M9XCJmbGV4IG1kOmZsZXgtcm93IGZsZXgtY29sIHctZnVsbCBpdGVtcy1zdHJldGNoIGZsZXgtd3JhcCBtdC04XCI+XG4gICAgPGRpdiBjbGFzcz1cImZsZXggZmxleC1jb2wgbWQ6dy0xLzIgdy1mdWxsIG1kOnByLTJcIj5cbiAgICAgIDxQYW5lbCBjbGFzcz1cInctZnVsbFwiPlxuICAgICAgICA8aDIgc2xvdD1cInRpdGxlXCIgY2xhc3M9XCJpbmxpbmUtYmxvY2sgbWQ6Zm9udC1iYXNlIGZvbnQtMnhsXCI+IOyLnOyyreyekCDsnKDsgqzrj4Q8L2gyPlxuICAgICAgICA8ZGl2IHNsb3Q9XCJjb250ZW50c1wiIGNsYXNzPVwiXCI+XG4gICAgICAgICAgPE5ldHdvcmsgXG4gICAgICAgICAgICB7c3RyZWFtZXJ9XG4gICAgICAgICAgICBub2Rlcz17Wy4uLnNpbWlsYXJfc3RyZWFtZXJzX3RvcDEwLCBzdHJlYW1lcl19IFxuICAgICAgICAgICAgZWRnZXM9e3NpbWlsYXJfc3RyZWFtZXJzX3RvcDEwLm1hcChzID0+ICh7ZnJvbTogc3RyZWFtZXIuaWQsIHRvOiBzLmlkLCBsZW5ndGg6IE1hdGgubWF4KDAuMSwgMS0ocy5zaW1pbGFyaXR5KnMuc2ltaWxhcml0eSoxMCkpLCBzdHJlbmd0aDogcy5zaW1pbGFyaXR5KnMuc2ltaWxhcml0eSoxMDB9KSl9XG4gICAgICAgICAgICBjbGFzcz1cInctZnVsbCBwLTZcIlxuICAgICAgICAgICAgb25yZW5kZXJlZD17KCk9PnswICYmIGxvYWRfdGltZWxpbmUoKX19XG4gICAgICAgICAgICBsZXQ6bm9kZT17bm9kZX0+XG4gICAgICAgICAgICA8YSBjbGFzcz1cImZsZXggZmxleC1jb2wgdy0xMCBtZDp3LTE2IGZsZXgtd3JhcCBpdGVtcy1jZW50ZXJcIiBocmVmPVwiL3N0cmVhbWVyL3tub2RlLmlkfVwiPlxuICAgICAgICAgICAgICA8aW1nIGNsYXNzPVwidy0xMCBoLTEwIG1kOnctMTYgbWQ6aC0xNiByb3VuZGVkLWZ1bGwgYmctd2hpdGUgYm9yZGVyIGJvcmRlci1ncmF5LTYwMFwiIHNyYz1cIntub2RlLnByb2ZpbGVfaW1hZ2VfdXJsfVwiIGFydD1cIu2UhOuhnO2VhCDsgqzsp4RcIiAvPlxuICAgICAgICAgICAgICA8ZGl2IGNsYXNzPVwiZmxleCBmbGV4LWNvbCBmbGV4LXdyYXAgaXRlbXMtY2VudGVyXCI+IFxuICAgICAgICAgICAgICAgIDxzcGFuIGNsYXNzPVwibWQ6dGV4dC1zbSB0ZXh0LXhzXCI+IHtub2RlLm5hbWV9IDwvc3Bhbj5cbiAgICAgICAgICAgICAgICB7I2lmIG5vZGUuc2ltaWxhcml0eX0gPHNwYW4gY2xhc3M9XCJ0ZXh0LXhzIHRleHQtZ3JheS02MDAgdHJhY2tpbmctd2lkZXJcIj4gKHsobm9kZS5zaW1pbGFyaXR5KjEwMCkudG9GaXhlZCgxKX0lKSA8L3NwYW4+IHsvaWZ9XG4gICAgICAgICAgICAgIDwvZGl2PlxuICAgICAgICAgICAgPC9hPlxuICAgICAgICAgIDwvTmV0d29yaz5cbiAgICAgICAgICA8ZGl2IGNsYXNzPVwiZmxleCBmbGV4LXJvdyBmbGV4LXdyYXAgdy1mdWxsXCI+XG4gICAgICAgICAgeyNlYWNoIHNpbWlsYXJfc3RyZWFtZXJzLnNsaWNlKDEwKSBhcyBub2RlfVxuICAgICAgICAgICAgPGEgY2xhc3M9XCJmbGV4IGZsZXgtY29sIHctMS81IGZsZXgtd3JhcCBpdGVtcy1jZW50ZXIgbXktMlwiIGhyZWY9XCIvc3RyZWFtZXIve25vZGUuaWR9XCI+XG4gICAgICAgICAgICAgIDxpbWcgY2xhc3M9XCJ3LTEwIGgtMTAgbWQ6dy0xNiBtZDpoLTE2IHJvdW5kZWQtZnVsbCBiZy13aGl0ZSBib3JkZXIgYm9yZGVyLWdyYXktNjAwXCIgc3JjPVwie25vZGUucHJvZmlsZV9pbWFnZV91cmx9XCIgYXJ0PVwi7ZSE66Gc7ZWEIOyCrOynhFwiIC8+XG4gICAgICAgICAgICAgIDxkaXYgY2xhc3M9XCJmbGV4IGZsZXgtY29sIGZsZXgtd3JhcCBpdGVtcy1jZW50ZXJcIj4gXG4gICAgICAgICAgICAgICAgPHNwYW4gY2xhc3M9XCJtZDp0ZXh0LXNtIHRleHQteHNcIj4ge25vZGUubmFtZX0gPC9zcGFuPlxuICAgICAgICAgICAgICAgIHsjaWYgbm9kZS5zaW1pbGFyaXR5fSA8c3BhbiBjbGFzcz1cInRleHQteHMgdGV4dC1ncmF5LTYwMCB0cmFja2luZy13aWRlclwiPiAoeyhub2RlLnNpbWlsYXJpdHkqMTAwKS50b0ZpeGVkKDEpfSUpIDwvc3Bhbj4gey9pZn1cbiAgICAgICAgICAgICAgPC9kaXY+XG4gICAgICAgICAgICA8L2E+XG4gICAgICAgICAgey9lYWNofVxuICAgICAgICAgIDwvZGl2PlxuICAgICAgICAgIDxidXR0b24gY2xhc3M9XCJ3LWZ1bGwgcHktMyBib3JkZXItdFwiIG9uOmNsaWNrPXtlPT5BUEkuc2ltaWxhcl9zdHJlYW1lcnMoc3RyZWFtZXIuaWQsIHNpbWlsYXJfc3RyZWFtZXJzLmxlbmd0aCkudGhlbihyZXMgPT4gc2ltaWxhcl9zdHJlYW1lcnMgPSBbLi4uc2ltaWxhcl9zdHJlYW1lcnMsIC4uLnJlc10pfT5cbiAgICAgICAgICAgIOuNlCDrs7TquLBcbiAgICAgICAgICA8L2J1dHRvbj5cbiAgICAgICAgPC9kaXY+XG4gICAgICA8L1BhbmVsPlxuICAgICAgPGRpdiBjbGFzcz1cImZsZXggbWQ6ZmxleC1yb3cgZmxleC1jb2xcIj5cbiAgICAgICAgPGRpdiBjbGFzcz1cImZsZXggZmxleC1jb2wgdy1mdWxsIG1kOnctMS8yXCI+XG4gICAgICAgICAgPFBhbmVsIGNsYXNzPVwidy1mdWxsXCI+XG4gICAgICAgICAgICA8aDIgc2xvdD1cInRpdGxlXCIgY2xhc3M9XCJpbmxpbmUtYmxvY2sgbWQ6Zm9udC1iYXNlIGZvbnQtMnhsXCI+IOuwqeyGoSDri6zroKU8L2gyPlxuICAgICAgICAgICAgPGRpdiBzbG90PVwiY29udGVudHNcIiBjbGFzcz1cImgtZnVsbFwiPlxuICAgICAgICAgICAgICB7I2VhY2ggbW9udGhfb2Zmc2V0cyBhcyBtb250aF9vZmZzZXQsIGkgKG1vbnRoX29mZnNldCl9XG4gICAgICAgICAgICAgIDxkaXYgY2xhc3M9XCJwci00XCI+XG4gICAgICAgICAgICAgICAgPFN0cmVhbUNhbGVuZGFySGVhdG1hcCBcbiAgICAgICAgICAgICAgICAgIGNsYXNzPVwidy1mdWxsIGgtZnVsbFwiIFxuICAgICAgICAgICAgICAgICAge21vbnRoX29mZnNldH1cbiAgICAgICAgICAgICAgICAgIGlzX2hlYWQ9e2k9PTB9XG4gICAgICAgICAgICAgICAgICBzdHJlYW1lcj17c3RyZWFtZXJ9IC8+XG4gICAgICAgICAgICAgIDwvZGl2PlxuICAgICAgICAgICAgICB7L2VhY2h9XG4gICAgICAgICAgICAgIDxidXR0b24gY2xhc3M9XCJ3LWZ1bGwgcHktMyBib3JkZXItdCBtdC0yXCIgb246Y2xpY2s9e2U9Pm1vbnRoX29mZnNldHMgPSBbbW9udGhfb2Zmc2V0c1swXS0xLCAuLi5tb250aF9vZmZzZXRzXX0+IOuNlCDrs7TquLAgPC9idXR0b24+XG4gICAgICAgICAgICA8L2Rpdj5cbiAgICAgICAgICA8L1BhbmVsPlxuICAgICAgICAgIDxQYW5lbCBjbGFzcz1cInctZnVsbFwiPlxuICAgICAgICAgICAgPGgyIHNsb3Q9XCJ0aXRsZVwiIGNsYXNzPVwiaW5saW5lLWJsb2NrIG1kOmZvbnQtYmFzZSBmb250LTJ4bFwiPiDrsKnshqEg7KO86riwIDwvaDI+XG4gICAgICAgICAgICA8ZGl2IHNsb3Q9XCJjb250ZW50c1wiIGNsYXNzPVwiaC1mdWxsXCI+XG4gICAgICAgICAgICAgIDxTdHJlYW1TcGlyYWwgXG4gICAgICAgICAgICAgICAgYmluZDptZWFuX3N0cmVhbWluZ190aW1lX3Jhbmdlcz17bWVhbl9zdHJlYW1pbmdfdGltZV9yYW5nZXN9XG4gICAgICAgICAgICAgICAgYmluZDptZWFuX3N0cmVhbWluZ190aW1lX3JlbGlhYmlsaXR5PXttZWFuX3N0cmVhbWluZ190aW1lX3JlbGlhYmlsaXR5fVxuICAgICAgICAgICAgICAgIGJpbmQ6c3RyZWFtaW5nX3RpbWVfcmFuZ2VzX3ZhcmlhbmNlPXtzdHJlYW1pbmdfdGltZV9yYW5nZXNfdmFyaWFuY2V9XG4gICAgICAgICAgICAgICAgYmluZDp0b3RhbF9zdHJlYW1pbmdfdGltZV9yYXRpbz17dG90YWxfc3RyZWFtaW5nX3RpbWVfcmF0aW99XG4gICAgICAgICAgICAgICAgYmluZDpzdHJlYW1pbmdfc3RhcnRfdGltZT17c3RyZWFtaW5nX3N0YXJ0X3RpbWV9XG4gICAgICAgICAgICAgICAgYmluZDpzdHJlYW1pbmdfc3RhcnRfdGltZV9zdGQ9e3N0cmVhbWluZ19zdGFydF90aW1lX3N0ZH1cbiAgICAgICAgICAgICAgICBiaW5kOnN0cmVhbWluZ19lbmRfdGltZT17c3RyZWFtaW5nX2VuZF90aW1lfVxuICAgICAgICAgICAgICAgIGJpbmQ6c3RyZWFtaW5nX2VuZF90aW1lX3N0ZD17c3RyZWFtaW5nX2VuZF90aW1lX3N0ZH1cbiAgICAgICAgICAgICAgICBjbGFzcz1cInctZnVsbCBoLWZ1bGwgLW10LTRcIiBcbiAgICAgICAgICAgICAgICBzdHJlYW1lcj17c3RyZWFtZXJ9Lz5cbiAgICAgICAgICAgIDwvZGl2PlxuICAgICAgICAgIDwvUGFuZWw+XG4gICAgICAgIDwvZGl2PlxuICAgICAgICA8ZGl2IGNsYXNzPVwiZmxleCBmbGV4LWNvbCB3LWZ1bGwgbWQ6dy0xLzJcIj5cbiAgICAgICAgICA8UGFuZWwgY2xhc3M9XCJ3LWZ1bGxcIj5cbiAgICAgICAgICAgIDxoMiBzbG90PVwidGl0bGVcIiBjbGFzcz1cImlubGluZS1ibG9ja1wiPiDqtazrj4XsnpAg67mE7JyoIDwvaDI+XG4gICAgICAgICAgICA8ZGl2IHNsb3Q9XCJjb250ZW50c1wiIGNsYXNzPVwidy1mdWxsIHAtMiBoLWZ1bGxcIj5cbiAgICAgICAgICAgICAgPFN1YnNjcmliZXJEaXN0cmlidXRpb24gc3RyZWFtZXJfaWQ9e3N0cmVhbWVyLmlkfS8+XG4gICAgICAgICAgICA8L2Rpdj5cbiAgICAgICAgICA8L1BhbmVsPlxuICAgICAgICAgIDxQYW5lbCBjbGFzcz1cInctZnVsbFwiPlxuICAgICAgICAgICAgPGgyIHNsb3Q9XCJ0aXRsZVwiIGNsYXNzPVwiaW5saW5lLWJsb2NrXCI+IOq1rOuPheyekCDssYTtjIUg67mE7JyoIDwvaDI+XG4gICAgICAgICAgICA8ZGl2IHNsb3Q9XCJjb250ZW50c1wiIGNsYXNzPVwibWQ6dy1mdWxsIHctNDggcC00IGgtZnVsbCBtLWF1dG9cIj5cbiAgICAgICAgICAgICAgPGRpdiBcbiAgICAgICAgICAgICAgICBjbGFzcz1cInJvdW5kZWQtZnVsbCBpbmxpbmUtYmxvY2sgdy1mdWxsXCJcbiAgICAgICAgICAgICAgICBzdHlsZT1cImJhY2tncm91bmQ6IHJhZGlhbC1ncmFkaWVudCh3aGl0ZSA2MCUsIHRyYW5zcGFyZW50IDYxJSksIGNvbmljLWdyYWRpZW50KCNDREE4QzcgMCUge3N0cmVhbWVyLmF2ZXJhZ2Vfc3Vic2NyaWJlcl9jaGF0X3JhdGlvKjEwMH0lLCAjZTJlOGYwIHtzdHJlYW1lci5hdmVyYWdlX3N1YnNjcmliZXJfY2hhdF9yYXRpbyoxMDB9JSAxMDAlKTsgcGFkZGluZy1ib3R0b206IDEwMCU7XCI+XG4gICAgICAgICAgICAgICAgPGRpdiBjbGFzcz1cImFic29sdXRlIHRleHQtM3hsIGZvbnQtYm9sZCB0ZXh0LXByaW1hcnktNjAwXCIgc3R5bGU9XCJsZWZ0OiA1MCU7IHRvcDogNTAlOyB0cmFuc2Zvcm06IHRyYW5zbGF0ZSgtNTAlLCAtNTAlKTtcIj4gXG4gICAgICAgICAgICAgICAgICB7KHN0cmVhbWVyLmF2ZXJhZ2Vfc3Vic2NyaWJlcl9jaGF0X3JhdGlvKjEwMCkudG9GaXhlZCgwKX0lXG4gICAgICAgICAgICAgICAgPC9kaXY+XG4gICAgICAgICAgICAgIDwvZGl2PlxuICAgICAgICAgICAgPC9kaXY+XG4gICAgICAgICAgPC9QYW5lbD5cbiAgICAgICAgPC9kaXY+XG4gICAgICA8L2Rpdj5cbiAgICA8L2Rpdj5cbiAgICA8ZGl2IGNsYXNzPVwiZmxleCBmbGV4LWNvbCB3LWZ1bGwgbWQ6dy0xLzIgbWQ6cGwtMlwiPlxuICAgICAgPFBhbmVsIGNsYXNzPVwidy1mdWxsXCI+XG4gICAgICAgIDxoMiBzbG90PVwidGl0bGVcIiBjbGFzcz1cImlubGluZS1ibG9ja1wiPiDstZzqt7wg67Cp7IahIOyxhO2MhSDtgqTsm4zrk5wgPC9oMj5cbiAgICAgICAgPGRpdiBzbG90PVwiY29udGVudHNcIiBjbGFzcz1cInctZnVsbCBwLTIgaC1mdWxsXCI+XG4gICAgICAgICAgPEtleXdvcmRDbG91ZCBzdHJlYW1lcl9pZD17c3RyZWFtZXIuaWR9Lz5cbiAgICAgICAgPC9kaXY+XG4gICAgICA8L1BhbmVsPlxuICAgICAgPFBhbmVsIGNsYXNzPVwidy1mdWxsXCI+XG4gICAgICAgIDxoMiBzbG90PVwidGl0bGVcIiBjbGFzcz1cImlubGluZS1ibG9ja1wiPiDrjJPquIAgPC9oMj5cbiAgICAgICAgPGRpdiBzbG90PVwiY29udGVudHNcIiBjbGFzcz1cInctZnVsbCBwLTJcIj5cbiAgICAgICAgICA8Q29tbWVudHMgc3RyZWFtZXJfaWQ9e3N0cmVhbWVyLmlkfS8+XG4gICAgICAgIDwvZGl2PlxuICAgICAgPC9QYW5lbD5cbiAgICA8L2Rpdj5cbiAgPC9kaXY+XG5cbiAgPFBhbmVsIGNsYXNzPVwidy1mdWxsXCI+XG4gICAgPGgyIHNsb3Q9XCJ0aXRsZVwiIGNsYXNzPVwiaW5saW5lLWJsb2NrIG1kOmZvbnQtYmFzZSBmb250LTJ4bFwiPiDrsKnshqEg7YOA7J6E65287J24IDwvaDI+XG4gICAgPGRpdiBzbG90PVwiY29udGVudHNcIiBjbGFzcz1cInctZnVsbFwiPlxuICAgICAgeyNlYWNoIHRpbWVsaW5lcyBhcyBkYXlzX2FnbyAoXCJcIiArIHN0cmVhbWVyLmlkICsgXCItXCIgKyBkYXlzX2Fnbyl9XG4gICAgICAgIDxUaW1lbGluZTIge3N0cmVhbWVyfSB7ZGF5c19hZ299IGhlYWRlcj17ZGF5c19hZ289PT0wfS8+XG4gICAgICB7OmVsc2V9IFxuICAgICAgICA8ZGl2IGNsYXNzPVwidy1mdWxsIGgtNjQgc3Bpbm5lclwiLz4gXG4gICAgICB7L2VhY2h9XG4gICAgICA8YnV0dG9uIG9uOmNsaWNrPXtsb2FkX3RpbWVsaW5lfSBjbGFzcz1cInctZnVsbCBib3JkZXItdCBwLTJcIj7rjZQg67O06riwPC9idXR0b24+XG4gICAgPC9kaXY+XG4gIDwvUGFuZWw+XG48L2Rpdj5cblxuXG48c2NyaXB0PlxuICBpbXBvcnQgeyBvbk1vdW50IH0gZnJvbSBcInN2ZWx0ZVwiO1xuICBpbXBvcnQgeyBmYUV4dGVybmFsTGlua0FsdCB9IGZyb20gJ0Bmb3J0YXdlc29tZS9mcmVlLXNvbGlkLXN2Zy1pY29ucy9mYUV4dGVybmFsTGlua0FsdCdcblx0aW1wb3J0IFBhbmVsIGZyb20gXCIuLi8uLi9jb21wb25lbnRzL1BhbmVsLnN2ZWx0ZVwiOyBcblx0aW1wb3J0IE5ldHdvcmsgZnJvbSBcIi4uLy4uL2NvbXBvbmVudHMvTmV0d29yay5zdmVsdGVcIjsgXG5cdGltcG9ydCBUaW1lbGluZTIgZnJvbSBcIi4uLy4uL2NvbXBvbmVudHMvVGltZWxpbmUyLnN2ZWx0ZVwiOyBcblx0aW1wb3J0IFN0cmVhbVNwaXJhbCBmcm9tIFwiLi4vLi4vY29tcG9uZW50cy9TdHJlYW1TcGlyYWwuc3ZlbHRlXCI7IFxuXHRpbXBvcnQgQ29tbWVudHMgZnJvbSBcIi4uLy4uL2NvbXBvbmVudHMvQ29tbWVudHMuc3ZlbHRlXCI7IFxuXHRpbXBvcnQgS2V5d29yZENsb3VkIGZyb20gXCIuLi8uLi9jb21wb25lbnRzL0tleXdvcmRDbG91ZC5zdmVsdGVcIjsgXG5cdGltcG9ydCBTdWJzY3JpYmVyRGlzdHJpYnV0aW9uIGZyb20gXCIuLi8uLi9jb21wb25lbnRzL1N1YnNjcmliZXJEaXN0cmlidXRpb24uc3ZlbHRlXCI7IFxuXHRpbXBvcnQgQmFkZ2VzIGZyb20gXCIuLi8uLi9jb21wb25lbnRzL0JhZGdlcy5zdmVsdGVcIjsgXG5cdGltcG9ydCBHYW1lQmFkZ2VzIGZyb20gXCIuLi8uLi9jb21wb25lbnRzL0dhbWVCYWRnZXMuc3ZlbHRlXCI7IFxuXHRpbXBvcnQgU3RyZWFtQ2FsZW5kYXJIZWF0bWFwIGZyb20gXCIuLi8uLi9jb21wb25lbnRzL1N0cmVhbUNhbGVuZGFySGVhdG1hcC5zdmVsdGVcIjsgXG4gIGltcG9ydCB7IGZsaXAgfSBmcm9tIFwic3ZlbHRlL2FuaW1hdGVcIjtcblxuICBleHBvcnQgbGV0IHN0cmVhbWVyO1xuICBleHBvcnQgbGV0IHNpbWlsYXJfc3RyZWFtZXJzO1xuICBleHBvcnQgbGV0IHNpbWlsYXJfc3RyZWFtZXJzX3RvcDEwO1xuICBleHBvcnQgbGV0IG1lYW5fc3RyZWFtaW5nX3RpbWVfcmFuZ2VzID0gW107XG4gIGV4cG9ydCBsZXQgbWVhbl9zdHJlYW1pbmdfdGltZV9yZWxpYWJpbGl0eSA9IDAuMDtcbiAgZXhwb3J0IGxldCBzdHJlYW1pbmdfdGltZV9yYW5nZXNfdmFyaWFuY2UgPSAwLjA7XG4gIGV4cG9ydCBsZXQgdG90YWxfc3RyZWFtaW5nX3RpbWVfcmF0aW8gPSAwLjA7XG4gIGV4cG9ydCBsZXQgc3RyZWFtaW5nX3N0YXJ0X3RpbWUgPSAwLjA7XG4gIGV4cG9ydCBsZXQgc3RyZWFtaW5nX3N0YXJ0X3RpbWVfc3RkID0gMC4wO1xuICBleHBvcnQgbGV0IHN0cmVhbWluZ19lbmRfdGltZSA9IDAuMDtcbiAgZXhwb3J0IGxldCBzdHJlYW1pbmdfZW5kX3RpbWVfc3RkID0gMC4wO1xuXG4gIGxldCB0aW1lbGluZXMgPSBbXTtcbiAgbGV0IGxhc3Rfc3RyZWFtZXIgPSBzdHJlYW1lcjtcbiAgJDoge1xuICAgIGlmKGxhc3Rfc3RyZWFtZXIgIT0gc3RyZWFtZXIpe1xuICAgICAgdGltZWxpbmVzICA9IFtdO1xuICAgICAgbGFzdF9zdHJlYW1lciA9IHN0cmVhbWVyO1xuICAgICAgbG9hZF90aW1lbGluZSgpO1xuICAgIH1cbiAgfVxuXG4gIGZ1bmN0aW9uIGxvYWRfdGltZWxpbmUoKSB7XG4gICAgaWYodGltZWxpbmVzLmxlbmd0aCl7XG4gICAgICBmb3IobGV0IGk9MDsgaTw3OyArK2kpXG4gICAgICAgIHRpbWVsaW5lcy5wdXNoKHRpbWVsaW5lc1t0aW1lbGluZXMubGVuZ3RoLTFdKzEpXG4gICAgICB0aW1lbGluZXMgPSB0aW1lbGluZXM7XG4gICAgfVxuICAgIGVsc2VcbiAgICAgIHRpbWVsaW5lcyA9IFswLDEsMiwzLDQsNSw2XVxuICB9XG4gIGxvYWRfdGltZWxpbmUoKTtcblxuXG4gIGxldCBtb250aF9vZmZzZXRzID0gWy0xLCAwXTtcbjwvc2NyaXB0PlxuIl0sIm5hbWVzIjpbImZhTW9vbiIsImZhU3VuIiwiZmFVc2VyIiwiZmFVc2VyU2VjcmV0IiwiZmFLZXkiLCJmYUNvbW1lbnREb3RzIiwiZmFIaXN0b3J5IiwicmVxdWlyZSQkMCIsImZhQXJyb3dVcCIsImZhQXJyb3dEb3duIiwiVG9hc3QiLCJmYUV4dGVybmFsTGlua0FsdCJdLCJtYXBwaW5ncyI6Ijs7Ozs7Ozs7O0FBQUE7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7O0FBMEJBLEFBQU8sTUFBTSxPQUFPLEdBQUcsQ0FBQyxZQUFZOztDQUVuQyxJQUFJLE9BQU8sR0FBRyxFQUFFLENBQUM7O0NBRWpCLElBQUksS0FBSyxHQUFHLE9BQU8sQ0FBQyxLQUFLLEdBQUcsV0FBVztFQUN0QyxJQUFJLENBQUMsT0FBTyxHQUFHLEVBQUUsQ0FBQztFQUNsQixJQUFJLENBQUMsS0FBSyxHQUFHLEVBQUUsQ0FBQztF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QUFDLENBQUMsQ0FBQyxFQUFFO0lBQ2hDLElBQUksS0FBSyxHQUFHLElBQUksQ0FBQyxTQUFTLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUM7O0lBRWpDLEtBQUssSUFBSSxDQUFDLENBQUMsS0FBSyxDQUFDLE1BQU0sR0FBRyxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsRUFBRTtLQUN2QyxJQUFJLElBQUksQ0FBQyxTQUFTLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsRUFBRSxLQUFLLElBQUksQ0FBQyxFQUFFLEVBQUU7TUFDM0MsSUFBSSxDQUFDLFNBQVMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxNQUFNLENBQUMsQ0FBQyxFQUFFLENBQUMsQ0FBQyxDQUFDO01BQ2xDO0tBQ0Q7OztJQUdELElBQUksSUFBSSxDQUFDLFNBQVMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxNQUFNLElBQUksQ0FBQyxFQUFFO0tBQ3JDLE9BQU8sSUFBSSxDQUFDLFNBQVMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQztLQUM1QjtJQUNEOzs7R0FHRCxJQUFJLE9BQU8sQ0FBQyxJQUFJLENBQUMsU0FBUyxDQUFDLENBQUMsQ0FBQyxDQUFDLEVBQUU7SUFDL0IsT0FBTyxJQUFJLENBQUMsU0FBUyxDQUFDLENBQUMsQ0FBQyxDQUFDO0lBQ3pCO0dBQ0Q7O0VBRUQsSUFBSSxDQUFDLE1BQU0sRUFBRSxDQUFDO0VBQ2QsQ0FBQzs7Ozs7Ozs7Ozs7OztDQWFGLEtBQUssQ0FBQyxTQUFTLENBQUMsS0FBSyxHQUFHLFNBQVMsSUFBSSxFQUFFO0VBQ3RDLElBQUksS0FBSyxHQUFHLEVBQUUsQ0FBQztFQUNmLElBQUksQ0FBQyxLQUFLLENBQUMsT0FBTyxDQUFDLFNBQVMsQ0FBQyxFQUFFO0dBQzlCLEtBQUssQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLE9BQU8sQ0FBQyxJQUFJLElB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LE1BQU0sQ0FBQyxhQUFhLENBQUMsU0FBUyxDQUFDLGNBQWMsR0FBRyxXQUFXO0VBQzFELElBQUksQ0FBQyxVQUFVLENBQUMsU0FBUyxNQUFNLENBQUM7R0FDL0IsSUFBSSxDQUFDLEdBQUcsTUFBTSxDQUFDLE1BQU0sQ0FBQyxDQUFDLENBQUMsUUFBUSxDQUFDLE1BQU0sQ0FBQyxNQUFNLENBQUMsQ0FBQyxDQUFDLENBQUM7R0FDbEQsSUFBSSxZQUFZLEdBQUcsTUFBTSxDQUFDLE1BQU0sR0FBRyxDQUFDLENBQUMsU0FBUyxFQUFFLENBQUM7R0FDakQsSUFBSSxTQUFTLEdBQUcsQ0FBQyxDQUFDLFNBQVMsRUFBRSxDQUFDOzs7R0FHOUIsTUFBTSxDQUFDLE1BQU0sQ0FBQyxVQUFVLENBQUMsU0FBUyxDQUFDLFFBQVEsQ0FBQyxNQUFNLENBQUMsQ0FBQyxHQUFHLFlBQVksR0FBRyxDQUFDLEdBQUcsQ0FBQyxDQUFDLENBQUM7R0FDN0UsTUFBTSxDQUFDLE1BQU0sQ0FBQyxVQUFVLENBQUMsU0FBUyxDQUFDLFFBQVEsQ0FBQyxNQUFNLENBQUMsQ0FBQyxHQUFHLFlBQVksR0FBRyxHQUFHLENBQUMsQ0FBQyxDQUFDO0dBQzVFLENBQUMsQ0FBQztFQUNILENBQUM7O0NBRUYsTUFBTSxDQUFDLGFBQWEsQ0FBQyxTQUFTLENBQUMsZUFBZSxHQUFHLFdBQVc7RUFDM0QsSUFBSSxDQUFDLFFBQVEsQ0FBQyxTQUFTLElBQUksRUFBRSxLQUFLLEVBQUU7R0FDbkMsSUFBSSxTQUFTLEdBQUcsS0FBSyxDQUFDLENBQUMsQ0FBQyxRQUFRLENBQUMsQ0FBQyxHQUFHLENBQUMsQ0FBQztHQUN2QyxLQUFLLENBQUMsVUFBVSxDQUFDLFNBQVMsQ0FBQyxRQUFRLENBQUMsSUFBSSxDQUFDLFNBQVMsR0FBRyxJQUFJLENBQUMsQ0FBQyxDQUFDO0dBQzVELENBQUMsQ0FBQztFQUNILENBQUM7OztDQUdGLE1BQU0sQ0FBQyxhQUFhLENBQUMsU0FBUyxDQUFDLGNBQWMsR0FBRyxTQUFTLFFBQVEsRUFBRTtFQUNsRSxJQUFJLENB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RSxJQUFJLElBQUksR0FBRyxDQUFDLEVBQUUsaUJBQWlCLEdBQUcsQ0FBQyxjQUFjLENBQUMsS0FBSyxDQUFDLENBQUMsRUFBRSxJQUFJLENBQUMsQ0FBQyxNQUFNLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxHQUFHLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxDQUFDLENBQUMsSUFBSSxDQUFDLENBQUM7RUFDaEcsSUFBSSxJQUFJLENBQUMsQ0FBQyxJQUFJLEVBQUUsQ0FBQyxDQUFDLGNBQWMsQ0FBQyxNQUFNLEVBQUUsRUFBRSxDQUFDLGlCQUFpQixDQUFDLENBQUMsQ0FBQyxFQUFFLENBQUMsQ0FBQyxDQUFDLEVBQUUsRUFBRSxDQUFDLENBQUM7SUFDekUsRUFBRSxHQUFHLEVBQUUsR0FBRyxDQUFDLGNBQWMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsR0FBRyxjQUFjLENBQUMsQ0FBQyxDQUFDLElBQUksQ0FBQyxDQUFDLENBQUMsQ0FBQyxFQUFFLElBQUksQ0FBQztJQUNsRSxpQkFBaUIsQ0FBQyxJQUFJLENBQUMsRUFBRSxDQUFDLENBQUM7R0FDNUI7RUFDRCxJQUFJLElBQUksQ0FBQyxDQUFDLENBQUMsRUFBRSxFQUFFLENBQUMsQ0FBQyxFQUFFLENBQUMsQ0FBQyxJQUFJLENBQUMsR0FBRyxDQUFDLElBQUksRUFBRSxjQUFjLENBQUMsTUFBTSxDQUFDLEVBQUUsRUFBRSxDQUFDLENBQUM7SUFDOUQsRUFBRSxHQUFHLEVBQUUsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxDQUFDLENBQUMsQ0FBQyxHQUFHLGNBQWMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsRUFBRSxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUM7SUFDN0MsY0FBYyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxHQUFHLEVBQUUsQ0FBQztHQUMzQjtFQUNELElBQUksSUFBSSxDQUFDLENBQUMsQ0FBQyxFQUFFLENBQUMsQ0FBQyxpQkFBaUIsQ0FBQyxNQUFNLEVBQUUsQ0FB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LEVBQUUsTUFBTSxHQUFHLEdBQUcsSUFBSSxVQUFVLENBQUMsTUFBTSxFQUFFLENBQUMsTUFBTSxDQUFDLENBQUMsQ0FBQyxHQUFHLE1BQU0sQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLEVBQUUsR0FBRyxDQUFDLEVBQUUsQ0FBQyxDQUFDLENBQUMsQ0FBQyxFQUFFLENBQUMsQ0FBQyxHQUFHLE1BQU0sQ0FBQyxNQUFNLENBQUMsQ0FBQztNQUM3SCxJQUFJLElBQUksQ0FBQyxDQUFDLENBQUMsRUFBRSxDQUFDLENBQUMsSUFBSSxDQUFDLE1BQU0sRUFBRSxDQUFDLENBQUMsQ0FBQyxFQUFFLEVBQUUsQ0FBQztRQUNsQyxLQUFLLElBQUksSUFBSSxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsRUFBRSxNQUFNLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLE1BQU0sQ0FBQyxDQUFDLENBQUMsRUFBRSxDQUFDLENBQUM7cURBQy9DLDhCQUE4QixHQUFHLE1BQU0sQ0FBQyxNQUFNLENBQUMsQ0FBQyxHQUFHLENBQUMsTUFBTSxHQUFHO1FBQzNELElBQUksQ0FBQyxHQUFHLElBQUksQ0FBQyxHQUFHLENBQUMsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxHQUFHLElBQUksQ0FBQyxHQUFHLENBQUMsVUFBVSxDQUFDLE1BQU0sRUFBRSxDQUFDLE1BQU0sQ0FBQyxDQUFDLENBQUMsR0FBRyxNQUFNLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxFQUFFLEdBQUcsQ0FBQyxHQUFHLENBQUMsQ0FBQyxFQUFFLE1BQU0sQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsTUFBTSxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxNQUFNLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxHQUFHLENBQUMsQ0FBQyxDQUFDLENBQUMsR0FBRyxLQUFLLENBQUM7UUFDN0ksT0FBTyxHQUFHLEdBQUcsQ0FBQyxDQUFDLENBQUMsQ0FBQztPQUNsQixFQUFFLENBQUMsQ0FBQyxHQUFHLE1BQU0sQ0FBQyxPQUFNLENBQUM7TUFDdEIsSUFBSSxhQUFhLEdBQUcsU0FBUyxDQUFDLGFBQWEsRUFBRSxFQUFFLENBQUMsRUFBRSxDQUFDLENBQUMsR0FBRyxDQUFDLENBQUMsRUFBRSxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLGNBQWMsRUFBRSxRQUFRLEdBQUcsUUFBUSxFQUFFLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLGNBQWMsRUFBRSxRQUFRLEdBQUcsUUFBUSxDQUFDLENBQUMsQ0FBQztNQUNuSixJQUFJLEtBQUssR0FBRyxhQUFhLENBQUMsTUFBTSxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsR0FBRyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsR0FBRyxDQUFDLENBQUMsRUFBRSxDQUFDLENBQUMsYUFBYSxDQUFDLE1BQU0sQ0FBQyxDQUFDO01BQy9GLElBQUksSUFBSSxHQUFHLGFBQWEsQ0FBQyxNQUFNLENBQUMsQ0FBQyxHQUFHLENBQUMsQ0FBQyxLQUFLLENBQUMsR0FBRyxDQUFDLENBQUMsQ0FBQyxHQUFHLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLEtBQUssQ0FBQyxDQUFDLENBQUMsR0FBRyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsS0FBSyxDQUFDLENBQUMsQ0FBQyxDQUFDLEVBQUUsR0FBRyxDQUFDLENBQUMsQ0FBQyxHQUFHLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLEtBQUssQ0FBQyxDQUFDLENBQUMsR0FBRyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsS0FBSyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsRUFBRSxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLEdBQUcsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxDQUFDLGFBQWEsQ0FBQyxNQUFNLENBQUMsQ0FBQzt1REFDdkssZ0NBQWdDLElBQUksSUFBRyxDQUFDO01BQ3hDLElBQUksSUFBSSxDQUFDLENBQUMsQ0FBQyxFQUFFLENBQUMsQ0FBQyxNQUFNLENBQUMsTUFBTSxFQUFFLENBQUMsQ0FBQyxDQUFDLEVBQUUsRUFBRSxDQUFDLENBQUM7UUFDckMsSUFBSSxJQUFJLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxFQUFFLENBQUMsQ0FBQyxDQUFDLEVBQUUsRUFBRSxDQUFDLENBQUM7VUFDdEIsSUFBSSxJQUFJLEdBQUcsQ0FBQyxDQUFDO1VBQ2IsSUFBSSxJQUFJLENBQUMsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxDQUFDLE1BQU0sQ0FBQyxNQUFNLENBQUMsQ0FBQyxFQUFFLENBQUMsQ0FBQyxDQUFDLEVBQUUsRUFBRSxDQUFDO1lBQ3RDLElBQUksSUFBSSxJQUFJLENBQUMsR0FBRyxDQUFDLFVBQVUsQ0FBQyxNQUFNLENBQUMsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxNQUFNLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxHQUFHLE1BQU0sQ0FBQyxDQUFDLENBQUMsRUFBRSxHQUFHLENBQUMsR0FBRyxVQUFVLENBQUMsTUFBTSxDQUFDLENBQUMsQ0FBQyxFQUFFLENBQUMsTUFBTSxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsR0FBRyxNQUFNLENBQUMsQ0FBQyxDQUFDLEVBQUUsR0FBRyxDQUFDLENBQUMsSUFBSSxNQUFNLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLE1BQU0sQ0FBQyxDQUFDLENBQUMsRUFBQzsyREFDekosZ0NBQWdDLElBQUksSUFBSSxHQUFHLE1BQUssQ0FBQztTQUNsRDtPQUNGO3VEQUNELGdDQUFnQyxHQUFHLGdDQUFnQyxJQUFJLENBQUMsTUFBTSxDQUFDLE1BQU0sS0FBSyxNQUFNLENBQUMsTUFBTSxDQUFDLENBQUMsQ0FBQyxHQUFHLENBQUMsR0FBQztNQUUvRyxJQUFJLFlBQVksR0FBRyxJQUFJLENBQUMsR0FBRyxDQUFDLENBQUMsQ0FBQyxFQUFFLENBQUMsS0FBSyxDQUFDLE1BQU0sQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLEdBQUcsTUFBTSxDQUFDLENBQUMsQ0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFDLE1BQU0sQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLEdBQUcsQ0FBQyxDQUFDLENBQUMsQ0FBQyxHQUFHLEtBQUssQ0FBQztNQUNoRyxZQUFZLEdBQUcsR0FBRyxDQUFDO3NEQUNuQiwrQkFBK0I7UUFDN0IsSUFBSSxDQUFDLEdBQUcsQ0FBQyxDQUFDLENBQUMsRUFBRSxDQUFDLEtBQUssQ0FBQyxJQUFJLFlBQVksRUFBRSxDQUFDLE1BQU0sQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsTUFBTSxDQUFDLENBQUMsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLENBQUMsQ0FBQyxNQUFNLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxHQUFHLENBQUMsQ0FBQyxDQUFDLENBQUM7UUFDdEYsSUFBSSxDQUFDLEdBQUcsQ0FBQyxDQUFDLENBQUMsRUFBRSxDQUFDLEtBQUssQ0FBQyxJQUFJLFlBQVksR0FBRyxNQUFNLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLE1BQU0sQ0FBQyxDQUFDLENBQUMsR0FBRyxDQUFDLENBQUMsQ0FBQyxNQUFNLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxHQUFHLENBQUMsQ0FBQyxDQUFDLEVBQUMsQ0FBQztNQUN2RixJQUFJLFFBQVEsSUFBSSxNQUFNLENBQUMsQ0FBQyxDQUFDLElBQUksQ0FBQyxJQUFJLE1BQU0sQ0FBQyxNQUFNLENBQUMsTUFBTSxDQUFDLENBQUMsQ0FBQyxJQUFJLFFBQVEsQ0FBQztVQUNsRSxPQUFPLEdBQUcsQ0FBQyxFQUFFLFdBQVcsR0FBRyxJQUFJLENBQUMsTUFBTSxDQUFDO01BQzNDLEdBQUcsUUFBUSxJQUFJLElBQUksQ0FBQyxDQUFDLENBQUMsSUFBSSxZQUFZO1FBQ3BDLE1BQU0sSUFBSSxDQUFDLENBQUMsT0FBTyxDQUFDLENBQUMsR0FBRyxXQUFXLElBQUksV0FBVyxDQUFDLElBQUksWUFBWSxJQUFJLE9BQU8sSUFBSSxDQUFDLFdBQVc7VUFDNUYsT0FBTyxJQUFJLENBQUMsQ0FBQztNQUNqQixJQUFJLElBQUksQ0FBQyxDQUFDLENBQUMsRUFBRSxDQUFDLENBQUMsSUFBSSxDQUFDLE1BQU0sRUFBRSxDQUFDLENBQUMsQ0FBQyxFQUFFLEVBQUUsQ0FBQyxFQUFFO1FBQ3BDLEdBQUcsSUFBSSxDQUFDLENBQUMsQ0FBQyxDQUFDLE9BQU8sQ0FBQyxDQUFDLEVBQUUsQ0FBQyxDQUFDLElBQUksWUFBWSxFQUFFO1VBQ3hDLElBQUksVUFBVSxHQUFHLDBCQUEwQixDQUFDLEdBQUcsRUFBRSxDQUFDO1VBQ2xELEdBQUcsVUFBVSxJQUFJLElBQUksQ0FBQyxHQUFHLENBQUMsVUFBVSxDQUFDLENBQUMsQ0FBQyxHQUFHLFFBQVEsR0FBRyxNQUFNLENBQUMsQ0FBQyxDQUFDLENBQUMsT0FBTyxDQUFDLENBQUMsRUFBRSxDQUFDLENBQUMsR0FBRyxRQUFRLENBQUMsSUFBSSxFQUFFLENBQUMsRUFBRTtZQUMvRiwwQkFBMEIsQ0FBQyxJQUFJLENBQUMsQ0FBQyxVQUFVLENBQUMsQ0FBQyxDQUFDLEVBQUUsTUFBTSxDQUFDLENBQUMsQ0FBQyxDQUFDLE9BQU8sQ0FBQyxDQUFDLEVBQUUsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQztjQUMxRTtZQUNGLEdBQUcsVUFBVSxFQUFFLDBCQUEwQixDQUFDLElBQUksQ0FBQyxVQUFVLENBQUMsQ0FBQztZQUMzRCwwQkFBMEIsQ0FBQyxJQUFJLENBQUMsQ0FBQyxNQUFNLENBQUMsQ0FBQyxDQUFDLENBQUMsT0FBTyxDQUFDLENBQUMsRUFBRSxDQUFDLENBQUMsRUFBRSxNQUFNLENBQUMsQ0FBQyxDQUFDLENBQUMsT0FBTyxDQUFDLENBQUMsRUFBRSxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDO1dBQ3ZGO1NBQ0Y7T0FDRjtNQUNELEdBQUcsMEJBQTBCLENBQUMsTUFBTSxDQUFDLENBQUMsSUFBSSxJQUFJLENBQUMsR0FBRyxDQUFDLDBCQUEwQixDQUFDLDBCQUEwQixDQUFDLE1BQU0sQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsR0FBRywwQkFBMEIsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxJQUFJLEVBQUUsQ0FBQyxFQUFFO21EQUNoSywwQkFBMEIsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsR0FBRywwQkFBMEIsQ0FBQyxHQUFHLEVBQUUsQ0FBQyxDQUFDLCtCQUFDO01BQ3hFLG9iQUF1RCxDQUFDOzs7TUFHeEQsSUFBSSx1QkFBdUIsR0FBRyxTQUFTLENBQUMsYUFBYSxFQUFFLEVBQUUsQ0FBQyxFQUFFLENBQUM7V0FDeEQsR0FBRyxDQUFDLENBQUMsRUFBRSxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLGNBQWMsRUFBRSxRQUFRLEVBQUUsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsY0FBYyxFQUFFLFFBQVEsQ0FBQyxDQUFDLENBQUM7TUFDOUUsSUFBSSxvQkFBb0IsR0FBRyx1QkFBdUI7V0FDN0MsR0FBRyxDQUFDLENBQUMsRUFBRSxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxRQUFRLENBQUMsSUFBSSxDQUFDLEVBQUUsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLFFBQVEsQ0FBQyxJQUFJLENBQUMsRUFBRSxDQUFDLENBQUMsQ0FBQyxDQUFDO1dBQzFELEdBQUcsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxDQUFDLElBQUksQ0FBQyxHQUFHLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLEVBQUUsSUFBSSxDQUFDLEdBQUcsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxFQUFFLENBQUMsSUFBSSxDQUFDLEdBQUcsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsRUFBRSxJQUFJLENBQUMsR0FBRyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDOzJDQUNsRixvQkFBb0IsR0FBRyxDQUFDLElBQUksQ0FBQyxLQUFLLENBQUMsR0FBRyxvQkFBb0IsQ0FBQyxNQUFNLENBQUMsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxLQUFLLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsRUFBRSxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxHQUFHLElBQUksQ0FBQyxFQUFFLENBQUMsQ0FBQyxHQUFHLElBQUksQ0FBQyxFQUFFLENBQUMsQ0FBQyxDQUFDLEVBQUUsSUFBSSxDQUFDLEVBQUUsQ0FBQyxDQUFDLENBQUMsR0FBRyxTQUFRLENBQUM7eUNBQ2xLLGtCQUFrQixHQUFHLENBQUMsSUFBSSxDQUFDLEtBQUssQ0FBQyxHQUFHLG9CQUFvQixDQUFDLE1BQU0sQ0FBQyxDQUFDLENBQUMsRUFBRSxDQUFDLEtBQUssQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxFQUFFLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsRUFBRSxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLEdBQUcsSUFBSSxDQUFDLEVBQUUsQ0FBQyxDQUFDLEdBQUcsSUFBSSxDQUFDLEVBQUUsQ0FBQyxDQUFDLENBQUMsRUFBRSxJQUFJLENBQUMsRUFBRSxDQUFDLENBQUMsQ0FBQyxHQUFHLFNBQVEsQ0FBQzs7OytDQUdoSyx3QkFBd0IsR0FBRyxJQUFJLENBQUMsSUFBSTtRQUNsQyx1QkFBdUI7V0FDcEIsR0FBRyxDQUFDLENBQUMsSUFBSSxJQUFJLENBQUMsR0FBRyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxvQkFBb0IsQ0FBQyxDQUFDO1dBQzdDLEdBQUcsQ0FBQyxDQUFDLElBQUksQ0FBQyxHQUFHLFFBQVEsQ0FBQyxHQUFHLEVBQUUsQ0FBQyxFQUFFLFFBQVEsQ0FBQyxDQUFDLENBQUM7V0FDekMsTUFBTSxDQUFDLENBQUMsQ0FBQyxFQUFFLENBQUMsS0FBSyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsRUFBRSxDQUFDLENBQUMsRUFBRSx1QkFBdUIsQ0FBQyxNQUFNLENBQUMsQ0FBQyxDQUFDLEVBQUMsQ0FBQzs2Q0FDcEUsc0JBQXNCLEdBQUcsSUFBSSxDQUFDLElBQUk7UUFDaEMsdUJBQXVCO1dBQ3BCLEdBQUcsQ0FBQyxDQUFDLElBQUksSUFBSSxDQUFDLEdBQUcsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsa0JBQWtCLENBQUMsQ0FBQztXQUMzQyxHQUFHLENBQUMsQ0FBQyxJQUFJLENBQUMsR0FBRyxRQUFRLENBQUMsR0FBRyxFQUFFLENBQUMsRUFBRSxRQUFRLENBQUMsQ0FBQyxDQUFDO1dBQ3pDLE1BQU0sQ0FBQyxDQUFDLENBQUMsRUFBRSxDQUFDLEtBQUssQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxDQUFDLEVBQUUsdUJBQXVCLENBQUMsTUFBTSxDQUFDLENBQUMsQ0FBQyxFQUFDLENBQUM7O01BRXBFLElBQUksS0FBSyxHQUFHLE1BQU0sQ0FBQyxxQkFBcUIsRUFBRSxDQUFDLEtBQUs7VUFDNUMsTUFBTSxHQUFHLE1BQU0sQ0FBQyxxQkFBcUIsRUFBRSxDQUFDLEtBQUssQ0FBQzs2QkFDbEQsTUFBTSxDQUFDLEtBQUssR0FBRyxjQUFLLENBQUM7NkJBQ3JCLE1BQU0sQ0FBQyxNQUFNLEdBQUcsZUFBTSxDQUFDO2dDQUN2QixTQUFTLENBQUMsS0FBSyxHQUFHLGlCQUFLLENBQUM7Z0NBQ3hCLFNBQVMsQ0FBQyxNQUFNLEdBQUcsa0JBQU0sQ0FBQzs7TUFFMUIsSUFBSSxHQUFHLEdBQUcsTUFBTSxDQUFDLFVBQVUsQ0FBQyxJQUFJLENBQUMsQ0FBQzs7TUFFbEMsR0FBRyxDQUFDLFNBQVMsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxFQUFFLE1BQU0sQ0FBQyxLQUFLLEVBQUUsTUFBTSxDQUFDLE1BQU0sQ0FBQyxDQUFDO01BQ2pELEdBQUcsQ0FBQyxTQUFTLEdBQUcsU0FBUyxDQUFDO01BQzFCLEdBQUcsQ0FBQyxXQUFXLEdBQUcsU0FBUyxDQUFDO01BQzVCLEdBQUcsQ0FBQyxTQUFTLEdBQUcsUUFBUSxDQUFDO01BQ3pCLEdBQUcsQ0FBQyxZQUFZLEdBQUcsUUFBUSxDQUFDOzs7TUFHNUIsY0FBYyxHQUFHLElBQUksQ0FBQyxLQUFLLENBQUMsSUFBSSxDQUFDLE9BQU8sRUFBRSxDQUFDLElBQUksQ0FBQyxDQUFDO01BQ2pELFlBQVksR0FBRyxJQUFJLENBQUMsS0FBSyxDQUFDLEVBQUUsQ0FBQyxPQUFPLEVBQUUsQ0FBQyxJQUFJLENBQUMsQ0FBQztNQUM3QyxJQUFJLFFBQVEsR0FBRyxDQUFDLEdBQUcsRUFBRSxHQUFHLEVBQUUsR0FBRyxFQUFFLEdBQUcsRUFBRSxHQUFHLEVBQUUsR0FBRyxFQUFFLEdBQUcsQ0FBQyxDQUFDO01BQ25ELElBQUksS0FBSyxHQUFHLEdBQUc7VUFDWCxTQUFTLEdBQUcsRUFBRTtVQUNkLGtCQUFrQixHQUFHLENBQUM7VUFDdEIsMkJBQTJCLEdBQUcsRUFBRTtVQUNoQyxTQUFTLEdBQUcsRUFBRTtVQUNkLEtBQUssR0FBRyxHQUFHO1VBQ1gsS0FBSyxHQUFHLEdBQUcsR0FBRyxDQUFDLGtCQUFrQixHQUFHLFNBQVMsR0FBRywyQkFBMkIsR0FBRyxLQUFLLENBQUMsR0FBRyxDQUFDO1VBQ3hGLE1BQU0sR0FBRyxRQUFRLENBQUMsQ0FBQztVQUNuQixDQUFDLEdBQUcsQ0FBQyxLQUFLLENBQUMsS0FBSyxLQUFLLE1BQU0sQ0FBQyxDQUFDLENBQUM7VUFDOUIsV0FBVyxHQUFHLE1BQU0sR0FBRyxJQUFJLENBQUMsRUFBRSxHQUFHLENBQUM7VUFDbEMsV0FBVyxHQUFHLENBQUMsSUFBSSxDQUFDLEVBQUUsQ0FBQyxHQUFHLEdBQUcsSUFBSSxDQUFDLEVBQUUsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLElBQUksQ0FBQyxNQUFNLEVBQUU7VUFDdEQsU0FBUyxHQUFHLElBQUksQ0FBQyxNQUFNLEVBQUUsQ0FBQztNQUM5QixHQUFHLENBQUMsU0FBUyxFQUFFLENBQUM7TUFDaEIsSUFBSSxJQUFJLEtBQUssSUFBSSxhQUFhLENBQUM7UUFDN0IsSUFBSSxHQUFHLEdBQUcsSUFBSSxDQUFDLEtBQUssQ0FBQyxLQUFLLElBQUksS0FBSyxDQUFDLENBQUMsQ0FBQyxHQUFHLGNBQWMsQ0FBQyxJQUFJLFlBQVksR0FBRyxjQUFjLENBQUMsQ0FBQztZQUN2RixHQUFHLEdBQUcsSUFBSSxDQUFDLEtBQUssQ0FBQyxLQUFLLElBQUksS0FBSyxDQUFDLENBQUMsQ0FBQyxHQUFHLGNBQWMsQ0FBQyxJQUFJLFlBQVksR0FBRyxjQUFjLENBQUMsQ0FBQyxDQUFDO1FBQzVGLElBQUksQ0FBQyxHQUFHLEdBQUcsQ0FBQyxLQUFLO1lBQ2IsS0FBSyxHQUFHLFdBQVcsR0FBRyxDQUFDLEdBQUcsV0FBVztZQUNyQyxDQUFDLEdBQUcsQ0FBQyxLQUFLLEdBQUcsS0FBSyxHQUFHLENBQUMsRUFBRSxDQUFDLEdBQUcsS0FBSztZQUNqQyxFQUFFLENBQUMsS0FBSyxDQUFDLEdBQUcsR0FBRyxDQUFDLENBQUMsS0FBSyxDQUFDLEdBQUcsQ0FBQyxJQUFJLENBQUMsR0FBRyxDQUFDLEtBQUssQ0FBQztZQUMxQyxFQUFFLENBQUMsTUFBTSxDQUFDLEdBQUcsR0FBRyxDQUFDLENBQUMsTUFBTSxDQUFDLEdBQUcsQ0FBQyxJQUFJLENBQUMsR0FBRyxDQUFDLEtBQUssQ0FBQyxDQUFDO1FBQ2pELEdBQUcsQ0FBQyxNQUFNLENBQUMsRUFBRSxFQUFFLEVBQUUsQ0FBQyxDQUFDO1FBQ25CLElBQUksSUFBSSxDQUFDLENBQUMsR0FBRyxDQUFDLENBQUMsQ0FBQyxDQUFDLEVBQUUsR0FBRyxFQUFFLEVBQUUsQ0FBQyxDQUFDO1VBQzFCLElBQUksQ0FBQyxHQUFHLENBQUMsQ0FBQyxLQUFLO2NBQ1gsS0FBSyxHQUFHLFdBQVcsR0FBRyxDQUFDLEdBQUcsV0FBVztjQUNyQyxDQUFDLEdBQUcsQ0FBQyxLQUFLLEdBQUcsS0FBSyxHQUFHLENBQUMsRUFBRSxDQUFDLEdBQUcsS0FBSztjQUNqQyxDQUFDLENBQUMsS0FBSyxDQUFDLEdBQUcsR0FBRyxDQUFDLENBQUMsS0FBSyxDQUFDLEdBQUcsQ0FBQyxJQUFJLENBQUMsR0FBRyxDQUFDLEtBQUssQ0FBQztjQUN6QyxDQUFDLENBQUMsTUFBTSxDQUFDLEdBQUcsR0FBRyxDQUFDLENBQUMsTUFBTSxDQUFDLEdBQUcsQ0FBQyxJQUFJLENBQUMsR0FBRyxDQUFDLEtBQUssQ0FBQyxDQUFDO1VBQ2hELEdBQUcsQ0FBQyxNQUFNLENBQUMsQ0FBQyxFQUFFLENBQUMsQ0FBQyxDQUFDO1NBQ2xCO1FBQ0QsSUFBSSxJQUFJLENBQUMsQ0FBQyxHQUFHLEVBQUUsQ0FBQyxFQUFFLEdBQUcsRUFBRSxFQUFFLENBQUMsQ0FBQztVQUN6QixJQUFJLENBQUMsR0FBRyxDQUFDLENBQUMsS0FBSztjQUNYLEtBQUssR0FBRyxXQUFXLEdBQUcsQ0FBQyxHQUFHLFdBQVc7Y0FDckMsQ0FBQyxHQUFHLENBQUMsS0FBSyxHQUFHLEtBQUssR0FBRyxDQUFDLEVBQUUsQ0FBQyxHQUFHLEtBQUssR0FBRyxDQUFDO2NBQ3JDLENBQUMsQ0FBQyxLQUFLLENBQUMsR0FBRyxHQUFHLENBQUMsQ0FBQyxLQUFLLENBQUMsR0FBRyxDQUFDLElBQUksQ0FBQyxHQUFHLENBQUMsS0FBSyxDQUFDO2NBQ3pDLENBQUMsQ0FBQyxNQUFNLENBQUMsR0FBRyxHQUFHLENBQUMsQ0FBQyxNQUFNLENBQUMsR0FBRyxDQUFDLElBQUksQ0FBQyxHQUFHLENBQUMsS0FBSyxDQUFDLENBQUM7VUFDaEQsR0FBRyxDQUFDLE1BQU0sQ0FBQyxDQUFDLEVBQUUsQ0FBQyxDQUFDLENBQUM7U0FDbEI7UUFDRCxHQUFHLENBQUMsTUFBTSxDQUFDLEVBQUUsRUFBRSxFQUFFLENBQUMsQ0FBQztPQUNwQjtNQUNELEdBQUcsQ0FBQyxJQUFJLEVBQUUsQ0FBQztNQUNYLEdBQUcsQ0FBQyxJQUFJLEVBQUUsQ0FBQztNQUNYLEdBQUcsQ0FBQyxXQUFXLEdBQUcsQ0FBQyxDQUFDLE1BQU0sQ0FBQztNQUMzQixHQUFHLENBQUMsU0FBUyxFQUFFLENBQUM7TUFDaEIsSUFBSSxJQUFJLEtBQUssSUFBSSxhQUFhLENBQUM7UUFDN0IsSUFBSSxHQUFHLEdBQUcsSUFBSSxDQUFDLEtBQUssQ0FBQyxLQUFLLElBQUksS0FBSyxDQUFDLENBQUMsQ0FBQyxHQUFHLGNBQWMsQ0FBQyxJQUFJLFlBQVksR0FBRyxjQUFjLENBQUMsQ0FBQztZQUN2RixHQUFHLEdBQUcsSUFBSSxDQUFDLEtBQUssQ0FBQyxLQUFLLElBQUksS0FBSyxDQUFDLENBQUMsQ0FBQyxHQUFHLGNBQWMsQ0FBQyxJQUFJLFlBQVksR0FBRyxjQUFjLENBQUMsQ0FBQyxDQUFDO1FBQzVGLElBQUksQ0FBQyxHQUFHLEdBQUcsQ0FBQyxLQUFLO1lBQ2IsS0FBSyxHQUFHLFdBQVcsR0FBRyxDQUFDLEdBQUcsV0FBVztZQUNyQyxDQUFDLElBQUksQ0FBQyxHQUFHLENBQUMsU0FBUyxHQUFHLGtCQUFrQixHQUFHLEtBQUssQ0FBQyxHQUFHLENBQUMsQ0FBQztZQUN0RCxFQUFFLENBQUMsS0FBSyxDQUFDLEdBQUcsR0FBRyxDQUFDLENBQUMsS0FBSyxDQUFDLEdBQUcsQ0FBQyxJQUFJLENBQUMsR0FBRyxDQUFDLEtBQUssQ0FBQztZQUMxQyxFQUFFLENBQUMsTUFBTSxDQUFDLEdBQUcsR0FBRyxDQUFDLENBQUMsTUFBTSxDQUFDLEdBQUcsQ0FBQyxJQUFJLENBQUMsR0FBRyxDQUFDLEtBQUssQ0FBQyxDQUFDO1FBQ2pELEdBQUcsQ0FBQyxNQUFNLENBQUMsRUFBRSxFQUFFLEVBQUUsQ0FBQyxDQUFDO1FBQ25CLElBQUksSUFBSSxDQUFDLENBQUMsR0FBRyxDQUFDLENBQUMsQ0FBQyxDQUFDLEVBQUUsR0FBRyxFQUFFLEVBQUUsQ0FBQyxDQUFDO1VBQzFCLElBQUksQ0FBQyxHQUFHLENBQUMsQ0FBQyxLQUFLO2NBQ1gsS0FBSyxHQUFHLFdBQVcsR0FBRyxDQUFDLEdBQUcsV0FBVztjQUNyQyxDQUFDLElBQUksQ0FBQyxHQUFHLENBQUMsU0FBUyxHQUFHLGtCQUFrQixHQUFHLEtBQUssQ0FBQyxHQUFHLENBQUMsQ0FBQztjQUN0RCxDQUFDLENBQUMsS0FBSyxDQUFDLEdBQUcsR0FBRyxDQUFDLENBQUMsS0FBSyxDQUFDLEdBQUcsQ0FBQyxJQUFJLENBQUMsR0FBRyxDQUFDLEtBQUssQ0FBQztjQUN6QyxDQUFDLENBQUMsTUFBTSxDQUFDLEdBQUcsR0FBRyxDQUFDLENBQUMsTUFBTSxDQUFDLEdBQUcsQ0FBQyxJQUFJLENBQUMsR0FBRyxDQUFDLEtBQUssQ0FBQyxDQUFDO1VBQ2hELEdBQUcsQ0FBQyxNQUFNLENBQUMsQ0FBQyxFQUFFLENBQUMsQ0FBQyxDQUFDO1NBQ2xCO1FBQ0QsSUFBSSxJQUFJLENBQUMsQ0FBQyxHQUFHLEVBQUUsQ0FBQyxFQUFFLEdBQUcsRUFBRSxFQUFFLENBQUMsQ0FBQztVQUN6QixJQUFJLENBQUMsR0FBRyxDQUFDLENBQUMsS0FBSztjQUNYLEtBQUssR0FBRyxXQUFXLEdBQUcsQ0FBQyxHQUFHLFdBQVc7Y0FDckMsQ0FBQyxJQUFJLENBQUMsR0FBRyxDQUFDLFNBQVMsR0FBRyxLQUFLLENBQUMsR0FBRyxDQUFDLENBQUM7O2NBRWpDLENBQUMsQ0FBQyxLQUFLLENBQUMsR0FBRyxHQUFHLENBQUMsQ0FBQyxLQUFLLENBQUMsR0FBRyxDQUFDLElBQUksQ0FBQyxHQUFHLENBQUMsS0FBSyxDQUFDO2NBQ3pDLENBQUMsQ0FBQyxNQUFNLENBQUMsR0FBRyxHQUFHLENBQUMsQ0FBQyxNQUFNLENBQUMsR0FBRyxDQUFDLElBQUksQ0FBQyxHQUFHLENBQUMsS0FBSyxDQUFDLENBQUM7VUFDaEQsR0FBRyxDQUFDLE1BQU0sQ0FBQyxDQUFDLEVBQUUsQ0FBQyxDQUFDLENBQUM7U0FDbEI7UUFDRCxHQUFHLENBQUMsTUFBTSxDQUFDLEVBQUUsRUFBRSxFQUFFLENBQUMsQ0FBQztPQUNwQjtNQUNELEdBQUcsQ0FBQyxJQUFJLEVBQUUsQ0FBQztNQUNYLEdBQUcsQ0FBQyxPQUFPLEVBQUUsQ0FBQztNQUNkLEdBQUcsQ0FBQyxTQUFTLEVBQUUsQ0FBQztNQUNoQixHQUFHLENBQUMsTUFBTSxDQUFDLEtBQUssQ0FBQyxHQUFHLEdBQUcsQ0FBQyxLQUFLLENBQUMsR0FBRyxHQUFHLFNBQVMsR0FBRyxrQkFBa0IsRUFBRSxJQUFJLENBQUMsR0FBRyxDQUFDLFdBQVcsQ0FBQyxFQUFFLE1BQU0sQ0FBQyxHQUFHLEdBQUcsQ0FBQyxNQUFNLENBQUMsR0FBRyxHQUFHLFNBQVMsR0FBRyxrQkFBa0IsRUFBRSxJQUFJLENBQUMsR0FBRyxDQUFDLFdBQVcsQ0FBQyxDQUFDLENBQUM7TUFDN0ssSUFBSSxJQUFJLENBQUMsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxFQUFFLElBQUksQ0FBQyxJQUFJLENBQUMsS0FBSyxDQUFDLE1BQU0sQ0FBQyxFQUFFLEVBQUUsQ0FBQyxDQUFDO1FBQzNDLElBQUksS0FBSyxHQUFHLElBQUksQ0FBQyxFQUFFLENBQUMsQ0FBQyxJQUFJLENBQUMsQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLEtBQUssQ0FBQyxNQUFNLENBQUMsQ0FBQyxHQUFHLFdBQVc7WUFDN0QsQ0FBQyxDQUFDLEtBQUssQ0FBQyxHQUFHLEdBQUcsQ0FBQyxLQUFLLENBQUMsR0FBRyxHQUFHLGtCQUFrQixHQUFHLFNBQVMsRUFBRSxJQUFJLENBQUMsR0FBRyxDQUFDLEtBQUssQ0FBQztZQUMxRSxDQUFDLENBQUMsTUFBTSxDQUFDLEdBQUcsR0FBRyxDQUFDLE1BQU0sQ0FBQyxHQUFHLEdBQUcsU0FBUyxHQUFHLGtCQUFrQixFQUFFLElBQUksQ0FBQyxHQUFHLENBQUMsS0FBSyxDQUFDLENBQUM7UUFDakYsR0FBRyxDQUFDLE1BQU0sQ0FBQyxDQUFDLEVBQUUsQ0FBQyxDQUFDLENBQUM7T0FDbEI7TUFDRCxHQUFHLENBQUMsTUFBTSxFQUFFLENBQUM7TUFDYixHQUFHLENBQUMsU0FBUyxFQUFFLENBQUM7TUFDaEIsR0FBRyxDQUFDLE1BQU0sQ0FBQyxLQUFLLENBQUMsR0FBRyxHQUFHLENBQUMsS0FBSyxDQUFDLEdBQUcsR0FBRyxTQUFTLEVBQUUsSUFBSSxDQUFDLEdBQUcsQ0FBQyxXQUFXLENBQUMsRUFBRSxNQUFNLENBQUMsR0FBRyxHQUFHLENBQUMsTUFBTSxDQUFDLEdBQUcsR0FBRyxTQUFTLEVBQUUsSUFBSSxDQUFDLEdBQUcsQ0FBQyxXQUFXLENBQUMsQ0FBQyxDQUFDO01BQ25JLElBQUksSUFBSSxDQUFDLENBQUMsQ0FBQyxFQUFFLENBQUMsRUFBRSxJQUFJLENBQUMsSUFBSSxDQUFDLEtBQUssQ0FBQyxNQUFNLENBQUMsRUFBRSxFQUFFLENBQUMsQ0FBQztRQUMzQyxJQUFJLEtBQUssR0FBRyxJQUFJLENBQUMsRUFBRSxDQUFDLENBQUMsSUFBSSxDQUFDLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxLQUFLLENBQUMsTUFBTSxDQUFDLENBQUMsR0FBRyxXQUFXO1lBQzdELENBQUMsQ0FBQyxLQUFLLENBQUMsR0FBRyxHQUFHLENBQUMsS0FBSyxDQUFDLEdBQUcsR0FBRyxTQUFTLEVBQUUsSUFBSSxDQUFDLEdBQUcsQ0FBQyxLQUFLLENBQUM7WUFDckQsQ0FBQyxDQUFDLE1BQU0sQ0FBQyxHQUFHLEdBQUcsQ0FBQyxNQUFNLENBQUMsR0FBRyxHQUFHLFNBQVMsRUFBRSxJQUFJLENBQUMsR0FBRyxDQUFDLEtBQUssQ0FBQyxDQUFDO1FBQzVELEdBQUcsQ0FBQyxNQUFNLENBQUMsQ0FBQyxFQUFFLENBQUMsQ0FBQyxDQUFDO09BQ2xCO01BQ0QsR0FBRyxDQUFDLE1BQU0sRUFBRSxDQUFDO01BQ2IsR0FBRyxDQUFDLFNBQVMsRUFBRSxDQUFDO01BQ2hCLElBQUksSUFBSSxDQUFDLENBQUMsQ0FBQyxFQUFFLENBQUMsRUFBRSxJQUFJLENBQUMsSUFBSSxDQUFDLEtBQUssSUFBSSxXQUFXLENBQUMsSUFBSSxDQUFDLEVBQUUsQ0FBQyxDQUFDLENBQUMsQ0FBQyxXQUFXLENBQUMsRUFBRSxFQUFFLENBQUMsQ0FBQzs7UUFFMUUsSUFBSSxDQUFDLEdBQUcsQ0FBQyxDQUFDLEtBQUs7WUFDWCxLQUFLLEdBQUcsV0FBVyxHQUFHLENBQUMsR0FBRyxXQUFXO1lBQ3JDLENBQUMsR0FBRyxDQUFDLEtBQUssR0FBRyxLQUFLLEdBQUcsQ0FBQyxFQUFFLENBQUMsR0FBRyxLQUFLO1lBQ2pDLENBQUMsQ0FBQyxLQUFLLENBQUMsR0FBRyxHQUFHLENBQUMsQ0FBQyxLQUFLLENBQUMsR0FBRyxDQUFDLElBQUksQ0FBQyxHQUFHLENBQUMsS0FBSyxDQUFDO1lBQ3pDLENBQUMsQ0FBQyxNQUFNLENBQUMsR0FBRyxHQUFHLENBQUMsQ0FBQyxNQUFNLENBQUMsR0FBRyxDQUFDLElBQUksQ0FBQyxHQUFHLENBQUMsS0FBSyxDQUFDLENBQUM7UUFDaEQsR0FBRyxDQUFDLE1BQU0sQ0FBQyxDQUFDLEVBQUUsQ0FBQyxDQUFDLENBQUM7T0FDbEI7TUFDRCxHQUFHLENBQUMsTUFBTSxDQUFDLEtBQUssQ0FBQyxHQUFHLEVBQUUsTUFBTSxDQUFDLEdBQUcsQ0FBQyxDQUFDO01BQ2xDLElBQUksSUFBSSxDQUFDLENBQUMsQ0FBQyxFQUFFLENBQUMsQ0FBQyxDQUFDLEVBQUUsRUFBRSxDQUFDLENBQUM7UUFDcEIsSUFBSSxDQUFDLEdBQUcsQ0FBQyxNQUFNLENBQUMsQ0FBQyxFQUFFLE1BQU0sR0FBRyxDQUFDLENBQUMsTUFBTSxDQUFDLENBQUM7WUFDbEMsS0FBSyxHQUFHLFdBQVcsR0FBRyxDQUFDLEdBQUcsV0FBVzs7WUFFckMsRUFBRSxHQUFHLENBQUMsS0FBSyxHQUFHLEtBQUssR0FBRyxDQUFDLElBQUksQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLENBQUMsTUFBTSxDQUFDLENBQUMsQ0FBQyxDQUFDLEdBQUcsS0FBSztZQUNyRCxFQUFFLEdBQUcsQ0FBQyxLQUFLLEdBQUcsS0FBSyxFQUFFLENBQUMsR0FBRyxLQUFLOztZQUU5QixDQUFDLENBQUMsS0FBSyxDQUFDLEdBQUcsR0FBRyxFQUFFLENBQUMsS0FBSyxDQUFDLEdBQUcsQ0FBQyxJQUFJLENBQUMsR0FBRyxDQUFDLEtBQUssQ0FBQztZQUMxQyxDQUFDLENBQUMsTUFBTSxDQUFDLEdBQUcsR0FBRyxFQUFFLENBQUMsTUFBTSxDQUFDLEdBQUcsQ0FBQyxJQUFJLENBQUMsR0FBRyxDQUFDLEtBQUssQ0FBQyxDQUFDOzs7UUFHakQsR0FBRyxDQUFDLE1BQU0sQ0FBQyxLQUFLLENBQUMsR0FBRyxFQUFFLE1BQU0sQ0FBQyxHQUFHLENBQUMsQ0FBQztRQUNsQyxHQUFHLENBQUMsTUFBTSxDQUFDLENBQUMsRUFBRSxDQUFDLENBQUMsQ0FBQztRQUNqQixJQUFJLEVBQUUsR0FBRyxLQUFLLENBQUMsR0FBRyxHQUFHLENBQUMsRUFBRSxDQUFDLEtBQUssQ0FBQyxHQUFHLEdBQUcsU0FBUyxFQUFFLElBQUksQ0FBQyxHQUFHLENBQUMsS0FBSyxHQUFHLElBQUksQ0FBQyxFQUFFLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUM7WUFDM0UsRUFBRSxHQUFHLE1BQU0sQ0FBQyxHQUFHLEdBQUcsQ0FBQyxFQUFFLENBQUMsTUFBTSxDQUFDLEdBQUcsR0FBRyxTQUFTLEVBQUUsSUFBSSxDQUFDLEdBQUcsQ0FBQyxLQUFLLEdBQUcsSUFBSSxDQUFDLEVBQUUsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDO1FBQ2xGLEdBQUcsQ0FBQyxDQUFDLENBQUMsU0FBUyxFQUFFLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxDQUFDLENBQUMsU0FBUyxFQUFFLENBQUMsSUFBSSxDQUFDLEVBQUUsR0FBRyxDQUFDLFNBQVMsR0FBRyxTQUFTLENBQUM7YUFDdEUsR0FBRyxDQUFDLFNBQVMsR0FBRyxTQUFTLENBQUM7UUFDL0IsR0FBRyxDQUFDLFFBQVEsQ0FBQyxRQUFRLENBQUMsQ0FBQyxDQUFDLENBQUMsU0FBUyxFQUFFLENBQUMsQ0FBQyxFQUFFLEVBQUUsRUFBRSxFQUFFLENBQUMsQ0FBQztPQUNqRDtNQUNELEdBQUcsQ0FBQyxNQUFNLEVBQUUsQ0FBQzs7Ozs7Ozs7O0tBVWQsRUFB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QUFFLEVBQUUsRUFBRSxDQUFDLEVBQUU7RUFDNUIsR0FBRyxDQUFDLElBQUksQ0FBQyxNQUFNLENBQUMsWUFBWSxDQUFDLENBQUMsR0FBRyxDQUFDLENBQUMsQ0FBQyxDQUFDO0VBQ3JDO0NBQ0QsS0FBSyxJQUFJLENBQUMsR0FBRyxDQUFDLEVBQUUsQ0FBQyxHQUFHLEVBQUUsRUFBRSxFQUFFLENBQUMsRUFBRTtFQUM1QixHQUFHLENBQUMsSUFBSSxDQUFDLE1BQU0sQ0FBQyxZQUFZLENBQUMsQ0FBQyxHQUFHLENBQUMsQ0FBQyxDQUFDLENBQUM7RUFDckM7Q0FDRCxLQUFLLElBQUksQ0FBQyxHQUFHLENBQUMsRUFBRSxDQUFDLEdBQUcsRUFBRSxFQUFFLEVBQUUsQ0FBQyxFQUFFO0VBQzVCLEdBQUcsQ0FBQyxJQUFJLENBQUMsTUFBTSxDQUFDLFlBQVksQ0FBQyxDQUFDLEdBQUcsQ0FBQyxDQUFDLENBQUMsQ0FBQztFQUNyQztDQUNELEdBQUcsQ0FBQyxJQUFJLENBQUMsR0FBRyxDQUFDLENBQUM7Q0FDZCxHQUFHLENBQUMsSUFBSSxDQUFDLEdBQUcsQ0FBQyxDQUFDO0NBQ2QsT0FBTyxHQUFHLENBQUM7Q0FDWCxHQUFHLENBQUM7O0FBRUwsU0FBUyxhQUFhLENBQUMsS0FBSyxFQUFFO0NBQzdCLElBQUksTUFBTSxHQUFHLEVBQUUsRUFBRSxDQUFDLEVBQUUsQ0FBQyxHQUFHLEtBQUssQ0FBQyxNQUFNLENBQUM7Q0FDckMsS0FBSyxDQUFDLEdBQUcsQ0FBQyxFQUFFLENBQUMsR0FBRyxDQUFDLEVBQUUsQ0FBQyxJQUFJLENBQUMsRUFBRTtFQUMxQixNQUFNLElBQUksU0FBUyxDQUFDLEtBQUssQ0FBQyxDQUFDLEdBQUcsQ0FBQyxDQUFDLElBQUksQ0FBQyxDQUFDLENBQUM7RUFDdkMsTUFBTSxJQUFJLFNBQVMsQ0FBQyxDQUFDLENBQUMsS0FBSyxDQUFDLENBQUMsR0FBRyxDQUFDLENBQUMsR0FBRyxJQUFJLEtBQUssQ0FBQyxLQUFLLEtBQUssQ0FBQyxDQUFDLEdBQUcsQ0FBQyxDQUFDLElBQUks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
