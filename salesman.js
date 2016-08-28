/**
 * @module
 * @author Ophir LOJKINE
 * salesman npm module
 *
 * Good heuristic for the traveling salesman problem using simulated annealing.
 **/


/**
 * @private
 */
function Path(points) {
  this.points = points;
  this.order = new Array(points.length);
  for(var i=0; i<points.length; i++) this.order[i] = i;
}
Path.prototype.change = function(temp) {
  var i = this.randomPos(), j = this.randomPos();
  var delta = this.delta_distance(i, j);
  if (delta < 0 || Math.random() < Math.exp(-delta / temp)) {
    this.swap(i,j);
  }
};
Path.prototype.size = function() {
  var s = 0;
  for (var i=0; i<this.points.length; i++) {
    s += distance(this.access(i), this.access(i+1));
  }
  return s;
};
Path.prototype.swap = function(i,j) {
  var tmp = this.order[i];
  this.order[i] = this.order[j];
  this.order[j] = tmp;
};
Path.prototype.delta_distance = function(i, j) {
  var jm1 = this.index(j-1),
      jp1 = this.index(j+1),
      im1 = this.index(i-1),
      ip1 = this.index(i+1);
  var s = 
      this.distance(jm1, i  )
    + this.distance(i  , jp1)
    + this.distance(im1, j  )
    + this.distance(j  , ip1)
    - this.distance(im1, i  )
    - this.distance(i  , ip1)
    - this.distance(jm1, j  )
    - this.distance(j  , jp1);
  if (jm1 === i || jp1 === i)
    s += 2*this.distance(i,j); 
  return s;
};
Path.prototype.index = function(i) {
  return (i + this.points.length) % this.points.length;
};
Path.prototype.access = function(i) {
  return this.points[this.order[this.index(i)]];
};
Path.prototype.distance = function(i, j) {
  return distance(this.access(i), this.access(j));
};
Path.prototype.randomPos = function() {
  return Math.floor(Math.random() * this.points.length);
};

/**
 * Solves the following problem:
 *  Given a list of points and the distances between each pair of points,
 *  what is the shortest possible route that visits each point exactly
 *  once and returns to the origin point?
 *
 * @param {Point[]} points The points that the path will have to visit.
 * @param {Number} [temp_coeff=0.999] changes the convergence speed of the algorithm: the closer to 1, the slower the algorithm and the better the solutions.
 * @param {Function} [callback=] An optional callback to be called after each iteration.
 *
 * @returns {Number[]} An array of indexes in the original array. Indicates in which order the different points are visited.
 *
 * @example
 * var points = [
 *       new salesman.Point(2,3)
 *       //other points
 *     ];
 * var solution = salesman.solve(points);
 * var ordered_points = solution.map(i => points[i]);
 * // ordered_points now contains the points, in the order they ought to be visited.
 **/
function solve(points, temp_coeff, callback) {
  var path = new Path(points);
  if (!temp_coeff)
    temp_coeff = 1 - Math.exp(-10 - Math.min(points.length,1e6)/1e5);
  var has_callback = typeof(callback) === "function";

  for (var temperature = 100 * distance(path.access(0), path.access(1));
           temperature > 1e-5;
           temperature *= temp_coeff) {
    path.change(temperature);
    if (has_callback) callback(path.order);
  }
  return path.order;
};

/**
 * Represents a point in two dimensions.
 * @class
 * @param {Number} x abscissa
 * @param {Number} y ordinate
 */
function Point(x, y) {
  this.x = x;
  this.y = y;
};

function distance(p, q) {
  var dx = p.x - q.x, dy = p.y - q.y;
  return Math.sqrt(dx*dx + dy*dy);
}

if (typeof module === "object") {
  module.exports = {
    "solve": solve,
    "Point": Point
  };
}
