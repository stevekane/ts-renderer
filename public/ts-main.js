(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
"use strict";
function createCommand(gl, cfg) {
    const program = fromSource(gl, cfg.vsrc, cfg.fsrc);
    if (program instanceof Error)
        return program;
    const uniforms = locateUniforms(gl, program, cfg.uniforms);
    if (uniforms instanceof Error)
        return new Error(uniforms.message);
    return { gl, program, uniforms };
}
exports.createCommand = createCommand;
function locateUniforms(gl, program, ucfgs) {
    const out = {};
    for (const key in ucfgs) {
        const { value, set } = ucfgs[key];
        const loc = gl.getUniformLocation(program, key);
        if (loc == null)
            return new Error(`Could not find uniform ${key}`);
        else
            out[key] = { value, set, loc };
    }
    return out;
}
function compileShader(gl, kind, src) {
    const shader = gl.createShader(kind);
    const kindStr = kind === gl.VERTEX_SHADER ? 'VERTEX' : 'FRAGMENT';
    gl.shaderSource(shader, src);
    gl.compileShader(shader);
    return shader && gl.getShaderParameter(shader, gl.COMPILE_STATUS)
        ? shader
        : new Error(`${kindStr}: ${gl.getShaderInfoLog(shader) || ''}`);
}
function fromSource(gl, vsrc, fsrc) {
    const vertex = compileShader(gl, gl.VERTEX_SHADER, vsrc);
    const fragment = compileShader(gl, gl.FRAGMENT_SHADER, fsrc);
    const program = gl.createProgram();
    if (vertex instanceof Error)
        return vertex;
    if (fragment instanceof Error)
        return fragment;
    gl.attachShader(program, vertex);
    gl.attachShader(program, fragment);
    gl.linkProgram(program);
    gl.useProgram(program);
    return program && gl.getProgramParameter(program, gl.LINK_STATUS)
        ? program
        : new Error(gl.getProgramInfoLog(program) || '');
}

},{}],2:[function(require,module,exports){
"use strict";

},{}],3:[function(require,module,exports){
"use strict";
const utils_1 = require("./utils");
class UF {
    constructor(value) {
        this.value = value;
    }
    set(gl, h, t) { gl.uniform1f(h, t); }
}
exports.UF = UF;
class U2F {
    constructor(value) {
        this.value = value;
    }
    set(gl, h, t) { gl.uniform2f(h, t[0], t[1]); }
}
exports.U2F = U2F;
class U3F {
    constructor(value) {
        this.value = value;
    }
    set(gl, h, t) { gl.uniform3f(h, t[0], t[1], t[2]); }
}
exports.U3F = U3F;
class U4F {
    constructor(value) {
        this.value = value;
    }
    set(gl, h, t) { gl.uniform4f(h, t[0], t[1], t[2], t[3]); }
}
exports.U4F = U4F;
class UI {
    constructor(value) {
        this.value = value;
    }
    set(gl, h, t) { gl.uniform1i(h, t); }
}
exports.UI = UI;
class U2I {
    constructor(value) {
        this.value = value;
    }
    set(gl, h, t) { gl.uniform2i(h, t[0], t[1]); }
}
exports.U2I = U2I;
class U3I {
    constructor(value) {
        this.value = value;
    }
    set(gl, h, t) { gl.uniform3i(h, t[0], t[1], t[2]); }
}
exports.U3I = U3I;
class U4I {
    constructor(value) {
        this.value = value;
    }
    set(gl, h, t) { gl.uniform4i(h, t[0], t[1], t[2], t[3]); }
}
exports.U4I = U4I;
class UFV {
    constructor(value) {
        this.value = value;
    }
    set(gl, h, t) { gl.uniform1fv(h, utils_1.asF32(t)); }
}
exports.UFV = UFV;
class U2FV {
    constructor(value) {
        this.value = value;
    }
    set(gl, h, t) { gl.uniform2fv(h, utils_1.asF32(t)); }
}
exports.U2FV = U2FV;
class U3FV {
    constructor(value) {
        this.value = value;
    }
    set(gl, h, t) { gl.uniform3fv(h, utils_1.asF32(t)); }
}
exports.U3FV = U3FV;
class U4FV {
    constructor(value) {
        this.value = value;
    }
    set(gl, h, t) { gl.uniform4fv(h, utils_1.asF32(t)); }
}
exports.U4FV = U4FV;
class UIV {
    constructor(value) {
        this.value = value;
    }
    set(gl, h, t) { gl.uniform1iv(h, utils_1.asI32(t)); }
}
exports.UIV = UIV;
class U2IV {
    constructor(value) {
        this.value = value;
    }
    set(gl, h, t) { gl.uniform2iv(h, utils_1.asI32(t)); }
}
exports.U2IV = U2IV;
class U3IV {
    constructor(value) {
        this.value = value;
    }
    set(gl, h, t) { gl.uniform3iv(h, utils_1.asI32(t)); }
}
exports.U3IV = U3IV;
class U4IV {
    constructor(value) {
        this.value = value;
    }
    set(gl, h, t) { gl.uniform4iv(h, utils_1.asI32(t)); }
}
exports.U4IV = U4IV;
class UMatrix2 {
    constructor(value) {
        this.value = value;
    }
    set(gl, h, t) { gl.uniformMatrix2fv(h, false, utils_1.asF32(t)); }
}
exports.UMatrix2 = UMatrix2;
class UMatrix3 {
    constructor(value) {
        this.value = value;
    }
    set(gl, h, t) { gl.uniformMatrix3fv(h, false, utils_1.asF32(t)); }
}
exports.UMatrix3 = UMatrix3;
class UMatrix4 {
    constructor(value) {
        this.value = value;
    }
    set(gl, h, t) { gl.uniformMatrix4fv(h, false, utils_1.asF32(t)); }
}
exports.UMatrix4 = UMatrix4;

},{"./utils":5}],4:[function(require,module,exports){
"use strict";
const Uniforms = require("./Uniforms");
exports.Uniforms = Uniforms;
const Command = require("./Command");
exports.Command = Command;
const GLTypes = require("./GLTypes");
exports.GLTypes = GLTypes;

},{"./Command":1,"./GLTypes":2,"./Uniforms":3}],5:[function(require,module,exports){
"use strict";
function asF32(t) {
    return t instanceof Float32Array ? t : new Float32Array(t);
}
exports.asF32 = asF32;
function asI32(t) {
    return t instanceof Int32Array ? t : new Int32Array(t);
}
exports.asI32 = asI32;
function toError(s, v) {
    return v == null ? new Error(s) : v;
}
exports.toError = toError;

},{}],6:[function(require,module,exports){
"use strict";
const test_vsrc_1 = require("./shaders/test-vsrc");
const test_fsrc_1 = require("./shaders/test-fsrc");
const Commando_1 = require("./Commando");
const c = document.getElementById('target');
const gl = c.getContext('webgl');
const command = Commando_1.Command.createCommand(gl, {
    vsrc: test_vsrc_1.default,
    fsrc: test_fsrc_1.default,
    uniforms: {
        u_color: new Commando_1.Uniforms.U4F([1, 0, 0, 1])
    }
});
console.log(command);
// loadXHR('pyramid.obj')
// .then(parseOBJ)
// .then(geometry => {
//   if ( !geometry.success ) return
// 
//   const light = V3(0, 2, 0)
//   const cam = {
//     position: new Float32Array([ 0, 1, 5 ]),
//     view: M4(),
//     projection: M4(),
//     vfov: Math.PI / 4,
//     aspectRatio: c.width / c.height,
//     near: 0.1,
//     far: 10000,
//     up: V3(0, 1, 0),
//     at: V3(0, 0, 0)
//   }
//   const command = createCommand(gl, {
//     vsrc,
//     fsrc,
//     count: 12,
//     uniforms: {
//       u_light: { kind: U.F3, value: V3(0, 0, 0) },
//       u_model: { kind: U.MAT4, value: M4() },
//       u_view: { kind: U.MAT4, value: M4() },
//       u_projection: { kind: U.MAT4, value: M4() }
//     },
//     attributes: {
//       a_coord: { kind: A.FLOAT, value: geometry.val.vertices, size: 3 },
//       a_normal: { kind: A.FLOAT, value: geometry.val.normals, size: 3 }
//     }
//   })
//   const entities = [{
//     position: V3(0, 0, 0),
//     scale: V3(1, 1, 1),
//     rotation: V3(0, 0, 0),
//     model: M4()
//   }]
// 
//   requestAnimationFrame(function render () {
//     for ( const entity of entities ) {
//       entity.rotation[1] += 0.02
//       identity(entity.model)
//       translate(entity.model, entity.position)
//       scale(entity.model, entity.scale)
//       rotateX(entity.model, entity.rotation[0])
//       rotateY(entity.model, entity.rotation[1])
//       rotateZ(entity.model, entity.rotation[2])
//     }
// 
//     cam.aspectRatio = c.width / c.height
//     lookAt(cam.view, cam.position, cam.at, cam.up)
//     perspective(cam.projection, cam.vfov, cam.aspectRatio, cam.near, cam.far)
// 
//     gl.viewport(0, 0, c.width, c.height)
//     gl.clearColor(0, 0, 0, 0)
//     gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT)
// 
//     for ( const entity of entities ) {
//       if ( command.success ) run(gl, command.value, { 
//         count: 12,
//         uniforms: {
//           u_light: light,
//           u_model: entity.model,
//           u_view: cam.view,
//           u_projection: cam.projection
//         },
//         attributes: {}
//       })
//     }
//     requestAnimationFrame(render)
//   })
// })

},{"./Commando":4,"./shaders/test-fsrc":7,"./shaders/test-vsrc":8}],7:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = `
precision mediump float;

uniform vec4 u_color;

void main () {
  gl_FragColor = u_color;
}
`;

},{}],8:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = `
precision mediump float;

uniform vec4 u_color;

void main () {
  gl_Position = vec4(0.0, 0.0, 0.0, 1.0);
}
`;

},{}]},{},[6]);
