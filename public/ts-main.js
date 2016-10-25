(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
"use strict";
class Success {
    constructor(value) {
        this.value = value;
        this.success = true;
    }
}
exports.Success = Success;
class Failure {
    constructor(value) {
        this.value = value;
        this.success = false;
    }
}
exports.Failure = Failure;

},{}],2:[function(require,module,exports){
"use strict";
const Either_1 = require('./Either');
function compileShader(gl, kind, src) {
    const shader = gl.createShader(kind);
    gl.shaderSource(shader, src);
    gl.compileShader(shader);
    return shader && gl.getShaderParameter(shader, gl.COMPILE_STATUS)
        ? new Either_1.Success(shader)
        : new Either_1.Failure({ src, log: gl.getShaderInfoLog(shader) || '' });
}
function linkProgram(gl, vertex, fragment) {
    const p = gl.createProgram();
    if (vertex.success)
        gl.attachShader(p, vertex.value);
    if (fragment.success)
        gl.attachShader(p, fragment.value);
    gl.linkProgram(p);
    return p && gl.getProgramParameter(p, gl.LINK_STATUS)
        ? new Either_1.Success(p)
        : new Either_1.Failure({ fragment, vertex, log: gl.getProgramInfoLog(p) || '' });
}
function fromSource(gl, vsrc, fsrc) {
    return linkProgram(gl, compileShader(gl, gl.VERTEX_SHADER, vsrc), compileShader(gl, gl.FRAGMENT_SHADER, fsrc));
}
exports.fromSource = fromSource;

},{"./Either":1}],3:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = `
precision mediump float; 

uniform float u_time; 

varying vec4 color;

void main () { 
  vec4 t_color = vec4(color);

  t_color[0] = sin(u_time / 1000.0);
  gl_FragColor = t_color; 
}
`;

},{}],4:[function(require,module,exports){
"use strict";
const vsrc_1 = require('./vsrc');
const fsrc_1 = require('./fsrc');
const GL_Program_1 = require('./GL-Program');
const now = performance ? performance.now.bind(performance) : Date.now;
const c = document.getElementById('target');
const gl = c ? c.getContext('webgl') : null;
const entity = {
    position: [0, 0, 0],
    rotation: [0, 0, 0],
    scale: [1, 1, 1],
    vertices: new Float32Array([
        0, -0.1, 0,
        0.1, 0.1, 0,
        -0.1, 0.1, 0
    ]),
    colors: new Float32Array([
        1.0, 1.0, 0.5, 1.0,
        1.0, 0.5, 1.0, 1.0,
        0.5, 1.0, 1.0, 1.0
    ]),
    indices: new Uint16Array([0, 1, 2])
};
if (gl) {
    const p = GL_Program_1.fromSource(gl, vsrc_1.default, fsrc_1.default);
    if (!p.success)
        console.log(JSON.stringify(p, null, 2));
    else {
        const attributes = {
            a_coord: gl.getAttribLocation(p.value, 'a_coord'),
            a_color: gl.getAttribLocation(p.value, 'a_color')
        };
        const uniforms = {
            u_time: gl.getUniformLocation(p.value, 'u_time'),
            u_position: gl.getUniformLocation(p.value, 'u_position'),
            u_scale: gl.getUniformLocation(p.value, 'u_scale'),
            u_rotation: gl.getUniformLocation(p.value, 'u_rotation')
        };
        const vertexBuffer = gl.createBuffer();
        const colorBuffer = gl.createBuffer();
        const indexBuffer = gl.createBuffer();
        gl.enable(gl.DEPTH_TEST);
        gl.depthFunc(gl.LEQUAL);
        gl.useProgram(p.value);
        // Vertex positions
        gl.bindBuffer(gl.ARRAY_BUFFER, vertexBuffer);
        gl.bufferData(gl.ARRAY_BUFFER, entity.vertices, gl.DYNAMIC_DRAW);
        gl.vertexAttribPointer(attributes.a_coord, 3, gl.FLOAT, false, 0, 0);
        gl.enableVertexAttribArray(attributes.a_coord);
        // Vertex colors
        gl.bindBuffer(gl.ARRAY_BUFFER, colorBuffer);
        gl.bufferData(gl.ARRAY_BUFFER, entity.colors, gl.DYNAMIC_DRAW);
        gl.vertexAttribPointer(attributes.a_color, 4, gl.FLOAT, false, 0, 0);
        gl.enableVertexAttribArray(attributes.a_color);
        // Indices into vertex buffers
        gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, indexBuffer);
        gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, entity.indices, gl.STATIC_DRAW);
        requestAnimationFrame(function render() {
            const t = now();
            //entity.position[0] = Math.sin(t / 1000)
            //entity.scale[1] = Math.sin(t / 1000) + 1
            entity.rotation[0] = Math.sin(t / 1000) * Math.PI * 2;
            entity.rotation[1] = Math.sin(t / 1000) * Math.PI * 2;
            gl.viewport(0, 0, c.width, c.height);
            gl.clearColor(0, 0, 0, 0);
            gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
            gl.uniform1f(uniforms.u_time, t);
            gl.uniform3f(uniforms.u_position, entity.position[0], entity.position[1], entity.position[2]);
            gl.uniform3f(uniforms.u_scale, entity.scale[0], entity.scale[1], entity.scale[2]);
            gl.uniform3f(uniforms.u_rotation, entity.rotation[0], entity.rotation[1], entity.rotation[2]);
            gl.drawElements(gl.TRIANGLES, entity.indices.length, gl.UNSIGNED_SHORT, 0);
            requestAnimationFrame(render);
        });
    }
}

},{"./GL-Program":2,"./fsrc":3,"./vsrc":5}],5:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = `
attribute vec3 a_coord; 
attribute vec4 a_color;

uniform vec3 u_position;
uniform vec3 u_scale;
uniform vec3 u_rotation;

varying vec4 color;

mat4 translate_from (vec3 v) {
  return mat4(
    1.0, 0.0, 0.0, 0.0,
    0.0, 1.0, 0.0, 0.0,
    0.0, 0.0, 1.0, 0.0,
    v.x, v.y, v.z, 1.0);
}

mat4 scale_from (vec3 v) {
  return mat4(
    v.x, 0.0, 0.0, 0.0,
    0.0, v.y, 0.0, 0.0,
    0.0, 0.0, v.z, 0.0,
    0.0, 0.0, 0.0, 1.0);
}

mat4 rotation_about_x (float zRad) {
  float CS = cos(zRad);
  float SN = sin(zRad);

  return mat4(
    1.0, 0.0, 0.0, 0.0,
    0.0, CS,  -SN, 0.0,
    0.0, SN,  CS,  0.0,
    0.0, 0.0, 0.0, 1.0);
}

mat4 rotation_about_y (float zRad) {
  float CS = cos(zRad);
  float SN = sin(zRad);

  return mat4(
    CS,  0.0, SN,  0.0,
    0.0, 1.0, 0.0, 0.0,
    -SN, 0.0, CS,  0.0,
    0.0, 0.0, 0.0, 1.0);
}

mat4 rotation_about_z (float zRad) {
  float CS = cos(zRad);
  float SN = sin(zRad);

  return mat4(
    CS,  -SN, 0.0, 0.0,
    SN,  CS,  0.0, 0.0,
    0.0, 0.0, 1.0, 0.0,
    0.0, 0.0, 0.0, 1.0);
}

void main () { 
  mat4 trans = translate_from(u_position);
  mat4 scale = scale_from(u_scale);
  mat4 rot_x = rotation_about_x(u_rotation[0]);
  mat4 rot_y = rotation_about_y(u_rotation[1]);
  mat4 rot_z = rotation_about_z(u_rotation[2]);
  vec4 pos = vec4(a_coord, 1.0);

  color = a_color;
  gl_Position = trans * scale * rot_y * rot_z * rot_x * pos; 
}
`;

},{}]},{},[4]);
