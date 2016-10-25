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
class Triangle {
    constructor() {
        this.indices = new Uint16Array([0, 1, 2]);
        this.vertices = new Float32Array([
            0, -1, 0,
            1, 1, 0,
            -1, 1, 0
        ]);
        this.normals = new Float32Array([
            0, 0, 1,
            0, 0, 1,
            0, 0, 1
        ]);
        this.colors = new Float32Array([
            1.0, 1.0, 0.5, 1.0,
            1.0, 0.5, 1.0, 1.0,
            0.5, 1.0, 1.0, 1.0
        ]);
    }
}
exports.Triangle = Triangle;

},{}],4:[function(require,module,exports){
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

},{}],5:[function(require,module,exports){
"use strict";
const vsrc_1 = require('./vsrc');
const fsrc_1 = require('./fsrc');
const GL_Program_1 = require('./GL-Program');
const Geometry_1 = require('./Rendering/Geometry');
// TODO: program should probably house attributs/uniforms...
function drawRenderable(gl, p, r) {
    gl.bindBuffer(gl.ARRAY_BUFFER, p.buffers.vertices);
    gl.bufferData(gl.ARRAY_BUFFER, entity.mesh.geometry.vertices, gl.DYNAMIC_DRAW);
    gl.bindBuffer(gl.ARRAY_BUFFER, p.buffers.normals);
    gl.bufferData(gl.ARRAY_BUFFER, entity.mesh.geometry.normals, gl.DYNAMIC_DRAW);
    gl.bindBuffer(gl.ARRAY_BUFFER, p.buffers.colors);
    gl.bufferData(gl.ARRAY_BUFFER, entity.mesh.geometry.colors, gl.DYNAMIC_DRAW);
    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, p.buffers.indices);
    gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, entity.mesh.geometry.indices, gl.STATIC_DRAW);
    gl.uniform3f(p.uniforms.u_position, entity.position[0], entity.position[1], entity.position[2]);
    gl.uniform3f(p.uniforms.u_scale, entity.scale[0], entity.scale[1], entity.scale[2]);
    gl.uniform3f(p.uniforms.u_rotation, entity.rotation[0], entity.rotation[1], entity.rotation[2]);
    gl.drawElements(gl.TRIANGLES, entity.mesh.geometry.indices.length, gl.UNSIGNED_SHORT, 0);
}
const now = performance ? performance.now.bind(performance) : Date.now;
const c = document.getElementById('target');
const gl = c ? c.getContext('webgl') : null;
const entity = {
    position: new Float32Array([0, 0, 0]),
    scale: new Float32Array([1, 1, 1]),
    rotation: new Float32Array([0, 0, 0]),
    mesh: {
        geometry: new Geometry_1.Triangle
    }
};
if (gl) {
    const p = GL_Program_1.fromSource(gl, vsrc_1.default, fsrc_1.default);
    const glData = {
        attributes: {
            a_coord: gl.getAttribLocation(p.value, 'a_coord'),
            a_normal: gl.getAttribLocation(p.value, 'a_normal'),
            a_color: gl.getAttribLocation(p.value, 'a_color')
        },
        uniforms: {
            u_position: gl.getUniformLocation(p.value, 'u_position'),
            u_scale: gl.getUniformLocation(p.value, 'u_scale'),
            u_rotation: gl.getUniformLocation(p.value, 'u_rotation')
        },
        buffers: {
            vertices: gl.createBuffer(),
            normals: gl.createBuffer(),
            colors: gl.createBuffer(),
            indices: gl.createBuffer()
        }
    };
    if (p.success) {
        gl.enable(gl.DEPTH_TEST);
        gl.depthFunc(gl.LEQUAL);
        gl.useProgram(p.value);
        gl.bindBuffer(gl.ARRAY_BUFFER, glData.buffers.vertices);
        gl.vertexAttribPointer(glData.attributes.a_coord, 3, gl.FLOAT, false, 0, 0);
        gl.enableVertexAttribArray(glData.attributes.a_coord);
        // gl.bindBuffer(gl.ARRAY_BUFFER, glData.buffers.normals)
        // gl.vertexAttribPointer(glData.attributes.a_normal, 3, gl.FLOAT, false, 0, 0)
        // gl.enableVertexAttribArray(glData.attributes.a_normal)
        gl.bindBuffer(gl.ARRAY_BUFFER, glData.buffers.colors);
        gl.vertexAttribPointer(glData.attributes.a_color, 4, gl.FLOAT, false, 0, 0);
        gl.enableVertexAttribArray(glData.attributes.a_color);
        requestAnimationFrame(function render() {
            const t = now();
            entity.position[0] = Math.sin(t / 1000);
            entity.scale[1] = Math.sin(t / 1000) + 1;
            entity.rotation[0] = Math.sin(t / 1000) * Math.PI * 2;
            entity.rotation[2] = Math.sin(t / 1000) * Math.PI * 2;
            gl.viewport(0, 0, c.width, c.height);
            gl.clearColor(0, 0, 0, 0);
            gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
            drawRenderable(gl, glData, entity);
            requestAnimationFrame(render);
        });
    }
    else {
        console.log(JSON.stringify(p, null, 2));
    }
}

},{"./GL-Program":2,"./Rendering/Geometry":3,"./fsrc":4,"./vsrc":6}],6:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = `
attribute vec3 a_coord; 
attribute vec3 a_normal;
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

mat4 model_mat (vec3 pos, vec3 scale, vec3 rot) {
  return translate_from(pos) *
         scale_from(scale) *
         rotation_about_x(rot.x) *
         rotation_about_z(rot.z) *
         rotation_about_y(rot.y);
}

void main () { 
  mat4 m = model_mat(u_position, u_scale, u_rotation);
  vec4 pos = vec4(a_coord, 1.0);

  color = a_color;
  gl_Position = m * pos; 
}
`;

},{}]},{},[5]);
