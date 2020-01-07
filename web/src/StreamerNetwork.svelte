function dist(node1, node2){
  let dx = (node1.x - node2.x);
  let dy = (node1.y - node2.y);
  return Math.sqrt(dx*dx + dy*dy);
}
class System {
  constructor(width, height, r=0.5) {
    this.width = width;
    this.height = height;
    this.G = 0.1;//Math.sqrt(this.width*this.width + this.height*this.height)*0.0001;
    this.nodes = [];
    this.springs = [];
    this.springs_by_node_id = [];
    this.r = r;
    this._step_node_index = 0;
    this._step_spring_index = 0;
  }
  add_node(node) {
    this.nodes.push(node);
    node._id = this.nodes.length-1
    this.springs_by_node_id.push([]);
  }
  add_spring(spring) {
    this.springs.push(spring);
    this.springs_by_node_id[spring.node1._id].push(spring);
    this.springs_by_node_id[spring.node2._id].push(spring);
  }
  springs_of_node(node) {
    return this.springs_by_node_id[node._id];
  }
  step(time = 10) {
    //console.log(this._step_node_index);
    while(this._step_node_index < this.nodes.length) {
      if(time <= 0) 
        return;
      let node = this.nodes[this._step_node_index];
      if(node.background){ 
        this._step_node_index += 1;
        continue;
      }
      // columnbs law
      for(let other of this.nodes){
        if(other._id == node._id || other.background) continue;
        let d = dist(node, other) + 0.01;
        node.vx += this.G / d*d * -(other.x - node.x)/d;
        node.vy += this.G / d*d * -(other.y - node.y)/d;
      }
      // hooks law
      for(let spring of this.springs_by_node_id[node._id]) {
        let other = spring.node1._id == node._id? spring.node2: spring.node1;
        let d = dist(node, other) + 0.1;
        node.vx += spring.k * (d - spring.length) * -(node.x - other.x) / d;
        node.vy += spring.k * (d - spring.length) * -(node.y - other.y) / d;
      }
      // centre force
      node.vx -= (node.x - this.width*0.5)*this.G*0.8;
      node.vy -= (node.y - this.height*0.5)*this.G*0.8;
      node.vx *= (1-this.r);
      node.vy *= (1-this.r);
      node.x += node.vx;
      node.y += node.vy;
      if(node.x > this.width) node.x = this.width;
      if(node.x < 0) node.x = 0;
      if(node.y > this.height) node.y = this.height;
      if(node.y < 0) node.y = 0;
      this._step_node_index += 1;
      time -= 1;
    }
    this._step_node_index = 0;
    //this._step_spring_index = 0;
    this.step(time-=1);
  }
}
class Node {
  constructor(system, x, y, background=false) {
    this.x = x;
    this.y = y;
    this.vx = 0;
    this.vy = 0;
    this.background = background;
    system.add_node(this);
  }
}
class Spring {
  constructor(system, length, k, node1, node2){
    this.length = length;
    this.node1 = node1;
    this.node2 = node2;
    this.k = k;
    system.add_spring(this);
  }
}
