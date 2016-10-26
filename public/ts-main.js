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
    const program = gl.createProgram();
    if (vertex.success)
        gl.attachShader(program, vertex.value);
    if (fragment.success)
        gl.attachShader(program, fragment.value);
    gl.linkProgram(program);
    const numUniforms = gl.getProgramParameter(program, gl.ACTIVE_UNIFORMS);
    const numAttributes = gl.getProgramParameter(program, gl.ACTIVE_ATTRIBUTES);
    const log = gl.getProgramInfoLog(program) || '';
    return program && gl.getProgramParameter(program, gl.LINK_STATUS)
        ? new Either_1.Success(program)
        : new Either_1.Failure({ fragment, vertex, log });
}
function fromSource(gl, vsrc, fsrc) {
    return linkProgram(gl, compileShader(gl, gl.VERTEX_SHADER, vsrc), compileShader(gl, gl.FRAGMENT_SHADER, fsrc));
}
exports.fromSource = fromSource;

},{"./Either":1}],3:[function(require,module,exports){
"use strict";
class Result {
    constructor(val, rest) {
        this.val = val;
        this.rest = rest;
        this.success = true;
    }
}
exports.Result = Result;
class Err {
    constructor(message) {
        this.message = message;
        this.success = false;
    }
}
exports.Err = Err;
function unit(a) {
    return (s) => new Result(a, s);
}
exports.unit = unit;
function fmap(f, pa) {
    return flatMap(pa, a => unit(f(a)));
}
exports.fmap = fmap;
function flatMap(pa, f) {
    return (s) => {
        const out = pa(s);
        switch (out.success) {
            case true: return f(out.val)(out.rest);
            case false: return new Err(out.message);
        }
    };
}
exports.flatMap = flatMap;
function doThen(p1, p2) {
    return flatMap(p1, _ => p2);
}
exports.doThen = doThen;
function satisfy(f) {
    return function (str) {
        return str.length > 0
            ? f(str.slice(0, 1))
                ? new Result(str.slice(0, 1), str.slice(1))
                : new Err(`${f.name} did not pass at ${str}`)
            : new Err('Nothing further to consume');
    };
}
exports.satisfy = satisfy;
function or(p1, p2) {
    return function (s) {
        const left = p1(s);
        return left.success ? left : p2(s);
    };
}
exports.or = or;
function many(p) {
    return or(flatMap(p, x => flatMap(many(p), xs => unit([x].concat(xs)))), unit([]));
}
exports.many = many;
function manyStr(p) {
    return or(flatMap(p, x => flatMap(manyStr(p), xs => unit(x + xs))), unit(''));
}
exports.manyStr = manyStr;
// TODO: imperative.  go more this direction or refactor?
function match(target) {
    return function (s) {
        for (var i = 0; i < target.length; i++) {
            if (s[i] !== target[i])
                return new Err(`${s[i]} is NOT ${target[i]} in ${s}`);
        }
        return new Result(s.slice(0, target.length), s.slice(target.length));
    };
}
exports.match = match;
function consumeThen(p1, p2) {
    return flatMap(p1, _ => p2);
}
exports.consumeThen = consumeThen;

},{}],4:[function(require,module,exports){
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

},{}],5:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = `
precision mediump float; 

uniform float u_time;
uniform vec3 u_position;
uniform vec3 u_scale;
uniform vec3 u_rotation;

varying vec4 color;

void main () { 
  vec4 t_color = vec4(color);

  t_color[0] = sin(u_time / 1000.0);
  gl_FragColor = t_color; 
}
`;

},{}],6:[function(require,module,exports){
"use strict";
const vsrc_1 = require('./vsrc');
const fsrc_1 = require('./fsrc');
const GL_Program_1 = require('./GL-Program');
const Geometry_1 = require('./Rendering/Geometry');
const Parser_1 = require('./Parser');
function isAlpha(s) {
    const cc = s.charCodeAt(0);
    return !isNaN(cc) && ((cc >= 65 && cc <= 90) || (cc >= 97 && cc <= 122));
}
function isNumber(s) {
    const cc = s.charCodeAt(0);
    return !isNaN(cc) && cc >= 48 && cc <= 57;
}
const cr = Parser_1.match('\n');
const ncr = Parser_1.satisfy(n => n !== '\n');
const space = Parser_1.satisfy(n => n === ' ' || n === '\n');
const non_space = Parser_1.satisfy(n => n !== ' ' && n !== '\n');
const spaces = Parser_1.manyStr(space);
const non_spaces = Parser_1.manyStr(non_space);
const alpha = Parser_1.satisfy(isAlpha);
const dot = Parser_1.match('.');
const num = Parser_1.satisfy(isNumber);
const integer = Parser_1.fmap(Number, Parser_1.manyStr(num));
const real = Parser_1.flatMap(Parser_1.manyStr(num), left => Parser_1.doThen(dot, Parser_1.flatMap(Parser_1.manyStr(num), right => Parser_1.unit(Number(left + '.' + right)))));
class Cmnt {
    constructor() {
        this.kind = 'Comment';
    }
}
class Vert {
    constructor(value) {
        this.value = value;
        this.kind = 'Vertex';
    }
}
class TexCoord {
    constructor(value) {
        this.value = value;
        this.kind = 'TexCoord';
    }
}
class Normal {
    constructor(value) {
        this.value = value;
        this.kind = 'Normal';
    }
}
class Face {
    constructor(value) {
        this.value = value;
        this.kind = 'Face';
    }
}
const vertex = Parser_1.doThen(Parser_1.match('v'), Parser_1.flatMap(Parser_1.consumeThen(spaces, real), x => Parser_1.flatMap(Parser_1.consumeThen(spaces, real), y => Parser_1.flatMap(Parser_1.consumeThen(spaces, real), z => Parser_1.flatMap(Parser_1.consumeThen(spaces, Parser_1.or(real, Parser_1.unit(1.0))), w => Parser_1.unit(new Vert([x, y, z, w])))))));
const texCoord = Parser_1.doThen(Parser_1.match('vt'), Parser_1.flatMap(Parser_1.consumeThen(spaces, real), u => Parser_1.flatMap(Parser_1.consumeThen(spaces, real), v => Parser_1.flatMap(Parser_1.consumeThen(spaces, Parser_1.or(real, Parser_1.unit(1.0))), w => Parser_1.unit(new TexCoord([u, v, w]))))));
const normal = Parser_1.doThen(Parser_1.match('vn'), Parser_1.flatMap(Parser_1.consumeThen(spaces, real), x => Parser_1.flatMap(Parser_1.consumeThen(spaces, real), y => Parser_1.flatMap(Parser_1.consumeThen(spaces, real), z => Parser_1.unit(new Normal([x, y, z]))))));
/*
  Assumes:
    exactly 3 vertices per face ONLY
    vertexes, tex_coords, and normals are already ordered by vertex
    f 1 2 3 is assumed to mean f 1/1/1 2/2/2 3/3/3
*/
const face = Parser_1.doThen(Parser_1.match('f'), Parser_1.flatMap(Parser_1.consumeThen(spaces, integer), fst => Parser_1.doThen(non_spaces, Parser_1.flatMap(Parser_1.consumeThen(spaces, integer), snd => Parser_1.doThen(non_spaces, Parser_1.flatMap(Parser_1.consumeThen(spaces, integer), trd => Parser_1.doThen(non_spaces, Parser_1.doThen(spaces, Parser_1.unit(new Face([fst, snd, trd]))))))))));
const comment = Parser_1.doThen(Parser_1.match('#'), Parser_1.doThen(Parser_1.manyStr(ncr), Parser_1.doThen(cr, Parser_1.unit(new Cmnt))));
const line = Parser_1.doThen(spaces, Parser_1.or(comment, Parser_1.or(vertex, Parser_1.or(normal, Parser_1.or(face, texCoord)))));
const sampleOBJ = `# don't parse this at all
v  0.1 0.1 0.1
v  0.2 0.2 0.2
v  0.3 0.3 0.3

vt 0.123 0.322 0.333
vt 0.141 0.145125 0.124124
vt 0.980 0.1124 0.344

vn 0.123 0.322 0.333
vn 0.141 0.145125 0.124124
vn 0.980 0.1124 0.344

f 1 2 3

# more nonsense
`;
console.log(vertex('v 0.123 0.234 0.345 1.0')); // with w
console.log(vertex('v 0.123 0.234 0.345')); // without w
console.log(texCoord('vt 0.123 0.234 0.345')); // with w
console.log(texCoord('vt 0.123 0.234')); // without w
console.log(normal('vn 0.123 0.234 0.345'));
console.log(face('f 1/1/1 2 3/2/2'));
console.log(Parser_1.many(face)('f 1 2 3\n\nf 4 5 6'));
console.log(comment('# whatever you want is totally ignored here \n NON_COMMENT'));
console.log(line('v 0.1 0.1 0.1'));
console.log(line('# 0.1 0.1 0.1\n'));
console.log(Parser_1.many(line)(sampleOBJ));
function drawRenderable(gl, r) {
    const { program, attributes, uniforms, geometry } = r.mesh;
    gl.useProgram(program);
    gl.bindBuffer(gl.ARRAY_BUFFER, r.buffers.a_coord);
    gl.bufferData(gl.ARRAY_BUFFER, geometry.vertices, gl.DYNAMIC_DRAW);
    gl.vertexAttribPointer(attributes.a_coord, 3, gl.FLOAT, false, 0, 0);
    gl.enableVertexAttribArray(attributes.a_coord);
    gl.bindBuffer(gl.ARRAY_BUFFER, r.buffers.a_color);
    gl.bufferData(gl.ARRAY_BUFFER, geometry.colors, gl.DYNAMIC_DRAW);
    gl.vertexAttribPointer(attributes.a_color, 4, gl.FLOAT, false, 0, 0);
    gl.enableVertexAttribArray(attributes.a_color);
    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, r.buffers.indices);
    gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, geometry.indices, gl.STATIC_DRAW);
    gl.uniform1f(uniforms.u_time, now());
    gl.uniform3f(uniforms.u_position, r.position[0], r.position[1], r.position[2]);
    gl.uniform3f(uniforms.u_scale, r.scale[0], r.scale[1], r.scale[2]);
    gl.uniform3f(uniforms.u_rotation, r.rotation[0], r.rotation[1], r.rotation[2]);
    gl.drawElements(gl.TRIANGLES, geometry.indices.length, gl.UNSIGNED_SHORT, 0);
}
const now = performance ? performance.now.bind(performance) : Date.now;
const c = document.getElementById('target');
const gl = c.getContext('webgl');
const p = GL_Program_1.fromSource(gl, vsrc_1.default, fsrc_1.default);
gl.enable(gl.DEPTH_TEST);
gl.depthFunc(gl.LEQUAL);
if (p.success) {
    const entity = {
        position: new Float32Array([0, 0, 0]),
        scale: new Float32Array([1, 1, 1]),
        rotation: new Float32Array([0, 0, 0]),
        mesh: {
            geometry: new Geometry_1.Triangle,
            program: p.value,
            uniforms: {
                u_time: gl.getUniformLocation(p.value, 'u_time'),
                u_position: gl.getUniformLocation(p.value, 'u_position'),
                u_scale: gl.getUniformLocation(p.value, 'u_scale'),
                u_rotation: gl.getUniformLocation(p.value, 'u_rotation')
            },
            attributes: {
                a_coord: gl.getAttribLocation(p.value, 'a_coord'),
                a_color: gl.getAttribLocation(p.value, 'a_color')
            }
        },
        buffers: {
            a_coord: gl.createBuffer(),
            a_normal: gl.createBuffer(),
            a_color: gl.createBuffer(),
            indices: gl.createBuffer()
        }
    };
    requestAnimationFrame(function render() {
        const t = now();
        entity.position[0] = Math.sin(t / 1000);
        entity.scale[1] = Math.sin(t / 1000) + 1;
        entity.rotation[0] = Math.sin(t / 1000) * Math.PI * 2;
        entity.rotation[2] = Math.sin(t / 1000) * Math.PI * 2;
        gl.viewport(0, 0, c.width, c.height);
        gl.clearColor(0, 0, 0, 0);
        gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
        drawRenderable(gl, entity);
        requestAnimationFrame(render);
    });
}
else {
    console.log(JSON.stringify(p, null, 2));
}

},{"./GL-Program":2,"./Parser":3,"./Rendering/Geometry":4,"./fsrc":5,"./vsrc":7}],7:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = `
precision mediump float;

attribute vec3 a_coord; 
attribute vec4 a_color;

uniform float u_time;
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

},{}]},{},[6]);
