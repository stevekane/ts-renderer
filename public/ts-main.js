(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
"use strict";
var BufferType;
(function (BufferType) {
    BufferType[BufferType["BYTE"] = 0] = "BYTE";
    BufferType[BufferType["UNSIGNED_BYTE"] = 1] = "UNSIGNED_BYTE";
    BufferType[BufferType["SHORT"] = 2] = "SHORT";
    BufferType[BufferType["UNSIGNED_SHORT"] = 3] = "UNSIGNED_SHORT";
    BufferType[BufferType["FLOAT"] = 4] = "FLOAT";
})(BufferType = exports.BufferType || (exports.BufferType = {}));
class Floats {
    constructor(size, value) {
        this.size = size;
        this.value = value;
        this.offset = 0;
        this.stride = 0;
        this.bufferType = BufferType.FLOAT;
    }
    setup(gl, a) {
        const { loc, size, bufferType, buffer, stride = 0, offset = 0 } = a;
        gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
        gl.enableVertexAttribArray(a.loc);
        gl.vertexAttribPointer(loc, size, toGLType(gl, bufferType), false, stride, offset);
    }
    set(gl, a, value) {
        gl.bufferData(gl.ARRAY_BUFFER, value, gl.DYNAMIC_DRAW);
    }
    teardown(gl, a) {
        gl.disableVertexAttribArray(a.loc);
        gl.bindBuffer(gl.ARRAY_BUFFER, null);
    }
}
exports.Floats = Floats;
function setupAttribute(gl, program, name, acfg) {
    const { value, bufferType, size, set, setup, teardown, offset = 0, stride = 0 } = acfg;
    const loc = gl.getAttribLocation(program, name);
    const buffer = gl.createBuffer();
    if (loc == null)
        return new Error(`Could not locate attr: ${name}`);
    if (buffer == null)
        return new Error(`Could not create buffer for attr: ${name}`);
    const a = { value, bufferType, size, offset, stride, loc, buffer, set, setup, teardown };
    setup(gl, a);
    set(gl, a, value);
    teardown(gl, a);
    return a;
}
exports.setupAttribute = setupAttribute;
function toGLType(gl, bufferType) {
    switch (bufferType) {
        case BufferType.FLOAT: return gl.FLOAT;
        case BufferType.SHORT: return gl.SHORT;
        case BufferType.BYTE: return gl.BYTE;
        case BufferType.UNSIGNED_SHORT: return gl.UNSIGNED_SHORT;
        case BufferType.UNSIGNED_BYTE: return gl.UNSIGNED_BYTE;
        default:
            const n = bufferType;
            return n;
    }
}

},{}],2:[function(require,module,exports){
"use strict";
const Uniforms_1 = require("./Uniforms");
const Attributes_1 = require("./Attributes");
function run(cmd, p) {
    const { gl, program } = cmd;
    const { attributes, uniforms, count } = p;
    gl.useProgram(program);
    for (const key in cmd.uniforms) {
        const { loc, value, set } = cmd.uniforms[key];
        const val = uniforms && uniforms[key] || value;
        set(gl, loc, val);
    }
    for (const key in cmd.attributes) {
        const a = cmd.attributes[key];
        const val = attributes && attributes[key];
        a.setup(gl, a);
        if (val != null)
            a.set(gl, a, val);
    }
    gl.drawArrays(gl.TRIANGLES, 0, count);
    for (const key in cmd.attributes) {
        const a = cmd.attributes[key];
        a.teardown(gl, a);
    }
    gl.useProgram(null);
}
exports.run = run;
function createCommand(gl, cfg) {
    const program = fromSource(gl, cfg.vsrc, cfg.fsrc);
    if (program instanceof Error)
        return program;
    const uniforms = setupUniforms(gl, program, cfg.uniforms);
    if (uniforms instanceof Error)
        uniforms;
    const attributes = setupAttributes(gl, program, cfg.attributes);
    if (attributes instanceof Error)
        return attributes;
    return { gl, program, uniforms, attributes };
}
exports.createCommand = createCommand;
function setupUniforms(gl, program, ucfgs) {
    const out = {};
    gl.useProgram(program);
    for (const key in ucfgs) {
        const uniform = Uniforms_1.setupUniform(gl, program, key, ucfgs[key]);
        if (uniform instanceof Error)
            return uniform;
        else
            out[key] = uniform;
    }
    gl.useProgram(null);
    return out;
}
function setupAttributes(gl, program, uattrs) {
    const out = {};
    gl.useProgram(program);
    for (const key in uattrs) {
        const attr = Attributes_1.setupAttribute(gl, program, key, uattrs[key]);
        if (attr instanceof Error)
            return attr;
        else
            out[key] = attr;
    }
    gl.useProgram(null);
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
    return program && gl.getProgramParameter(program, gl.LINK_STATUS)
        ? program
        : new Error(gl.getProgramInfoLog(program) || '');
}

},{"./Attributes":1,"./Uniforms":4}],3:[function(require,module,exports){
"use strict";

},{}],4:[function(require,module,exports){
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
function setupUniform(gl, program, name, ucfg) {
    const { value, set } = ucfg;
    const loc = gl.getUniformLocation(program, name);
    if (loc == null)
        return new Error(`Could not find uniform ${name}`);
    else
        return (set(gl, loc, value), { value, set, loc });
}
exports.setupUniform = setupUniform;

},{"./utils":6}],5:[function(require,module,exports){
"use strict";
const Attributes = require("./Attributes");
exports.Attributes = Attributes;
const Uniforms = require("./Uniforms");
exports.Uniforms = Uniforms;
const Command = require("./Command");
exports.Command = Command;
const GLTypes = require("./GLTypes");
exports.GLTypes = GLTypes;

},{"./Attributes":1,"./Command":2,"./GLTypes":3,"./Uniforms":4}],6:[function(require,module,exports){
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

},{}],7:[function(require,module,exports){
"use strict";
function Q(x, y, z, w) {
    const out = new Float32Array(4);
    out[0] = x;
    out[1] = y;
    out[2] = z;
    out[3] = w;
    return out;
}
exports.Q = Q;
function M4() {
    const out = new Float32Array(16);
    return identity(out);
}
exports.M4 = M4;
function V3(x, y, z) {
    const out = new Float32Array(3);
    out[0] = x;
    out[1] = y;
    out[2] = z;
    return out;
}
exports.V3 = V3;
function identity(out) {
    out[0] = 1;
    out[1] = 0;
    out[2] = 0;
    out[3] = 0;
    out[4] = 0;
    out[5] = 1;
    out[6] = 0;
    out[7] = 0;
    out[8] = 0;
    out[9] = 0;
    out[10] = 1;
    out[11] = 0;
    out[12] = 0;
    out[13] = 0;
    out[14] = 0;
    out[15] = 1;
    return out;
}
exports.identity = identity;
function translate(out, v) {
    const [x, y, z] = v;
    out[12] = out[0] * x + out[4] * y + out[8] * z + out[12];
    out[13] = out[1] * x + out[5] * y + out[9] * z + out[13];
    out[14] = out[2] * x + out[6] * y + out[10] * z + out[14];
    out[15] = out[3] * x + out[7] * y + out[11] * z + out[15];
    return out;
}
exports.translate = translate;
function rotateX(out, rad) {
    var s = Math.sin(rad), c = Math.cos(rad), a10 = out[4], a11 = out[5], a12 = out[6], a13 = out[7], a20 = out[8], a21 = out[9], a22 = out[10], a23 = out[11];
    out[4] = a10 * c + a20 * s;
    out[5] = a11 * c + a21 * s;
    out[6] = a12 * c + a22 * s;
    out[7] = a13 * c + a23 * s;
    out[8] = a20 * c - a10 * s;
    out[9] = a21 * c - a11 * s;
    out[10] = a22 * c - a12 * s;
    out[11] = a23 * c - a13 * s;
    return out;
}
exports.rotateX = rotateX;
function rotateY(out, rad) {
    var s = Math.sin(rad), c = Math.cos(rad), a00 = out[0], a01 = out[1], a02 = out[2], a03 = out[3], a20 = out[8], a21 = out[9], a22 = out[10], a23 = out[11];
    out[0] = a00 * c - a20 * s;
    out[1] = a01 * c - a21 * s;
    out[2] = a02 * c - a22 * s;
    out[3] = a03 * c - a23 * s;
    out[8] = a00 * s + a20 * c;
    out[9] = a01 * s + a21 * c;
    out[10] = a02 * s + a22 * c;
    out[11] = a03 * s + a23 * c;
    return out;
}
exports.rotateY = rotateY;
function rotateZ(out, rad) {
    var s = Math.sin(rad), c = Math.cos(rad), a00 = out[0], a01 = out[1], a02 = out[2], a03 = out[3], a10 = out[4], a11 = out[5], a12 = out[6], a13 = out[7];
    out[0] = a00 * c + a10 * s;
    out[1] = a01 * c + a11 * s;
    out[2] = a02 * c + a12 * s;
    out[3] = a03 * c + a13 * s;
    out[4] = a10 * c - a00 * s;
    out[5] = a11 * c - a01 * s;
    out[6] = a12 * c - a02 * s;
    out[7] = a13 * c - a03 * s;
    return out;
}
exports.rotateZ = rotateZ;
function scale(out, v) {
    var x = v[0], y = v[1], z = v[2];
    out[0] = out[0] * x;
    out[1] = out[1] * x;
    out[2] = out[2] * x;
    out[3] = out[3] * x;
    out[4] = out[4] * y;
    out[5] = out[5] * y;
    out[6] = out[6] * y;
    out[7] = out[7] * y;
    out[8] = out[8] * z;
    out[9] = out[9] * z;
    out[10] = out[10] * z;
    out[11] = out[11] * z;
    out[12] = out[12];
    out[13] = out[13];
    out[14] = out[14];
    out[15] = out[15];
    return out;
}
exports.scale = scale;
function fromRotationTranslation(out, q, v) {
    var x = q[0], y = q[1], z = q[2], w = q[3], x2 = x + x, y2 = y + y, z2 = z + z, xx = x * x2, xy = x * y2, xz = x * z2, yy = y * y2, yz = y * z2, zz = z * z2, wx = w * x2, wy = w * y2, wz = w * z2;
    out[0] = 1 - (yy + zz);
    out[1] = xy + wz;
    out[2] = xz - wy;
    out[3] = 0;
    out[4] = xy - wz;
    out[5] = 1 - (xx + zz);
    out[6] = yz + wx;
    out[7] = 0;
    out[8] = xz + wy;
    out[9] = yz - wx;
    out[10] = 1 - (xx + yy);
    out[11] = 0;
    out[12] = v[0];
    out[13] = v[1];
    out[14] = v[2];
    out[15] = 1;
    return out;
}
exports.fromRotationTranslation = fromRotationTranslation;
function lookAt(out, eye, center, up) {
    var x0, x1, x2, y0, y1, y2, z0, z1, z2, len;
    var eyex = eye[0], eyey = eye[1], eyez = eye[2], upx = up[0], upy = up[1], upz = up[2], centerx = center[0], centery = center[1], centerz = center[2];
    if (Math.abs(eyex - centerx) < 0.000001 &&
        Math.abs(eyey - centery) < 0.000001 &&
        Math.abs(eyez - centerz) < 0.000001) {
        return identity(out);
    }
    z0 = eyex - centerx;
    z1 = eyey - centery;
    z2 = eyez - centerz;
    len = 1 / Math.sqrt(z0 * z0 + z1 * z1 + z2 * z2);
    z0 *= len;
    z1 *= len;
    z2 *= len;
    x0 = upy * z2 - upz * z1;
    x1 = upz * z0 - upx * z2;
    x2 = upx * z1 - upy * z0;
    len = Math.sqrt(x0 * x0 + x1 * x1 + x2 * x2);
    if (!len) {
        x0 = 0;
        x1 = 0;
        x2 = 0;
    }
    else {
        len = 1 / len;
        x0 *= len;
        x1 *= len;
        x2 *= len;
    }
    y0 = z1 * x2 - z2 * x1;
    y1 = z2 * x0 - z0 * x2;
    y2 = z0 * x1 - z1 * x0;
    len = Math.sqrt(y0 * y0 + y1 * y1 + y2 * y2);
    if (!len) {
        y0 = 0;
        y1 = 0;
        y2 = 0;
    }
    else {
        len = 1 / len;
        y0 *= len;
        y1 *= len;
        y2 *= len;
    }
    out[0] = x0;
    out[1] = y0;
    out[2] = z0;
    out[3] = 0;
    out[4] = x1;
    out[5] = y1;
    out[6] = z1;
    out[7] = 0;
    out[8] = x2;
    out[9] = y2;
    out[10] = z2;
    out[11] = 0;
    out[12] = -(x0 * eyex + x1 * eyey + x2 * eyez);
    out[13] = -(y0 * eyex + y1 * eyey + y2 * eyez);
    out[14] = -(z0 * eyex + z1 * eyey + z2 * eyez);
    out[15] = 1;
    return out;
}
exports.lookAt = lookAt;
;
function perspective(out, fovy, aspect, near, far) {
    var f = 1.0 / Math.tan(fovy / 2), nf = 1 / (near - far);
    out[0] = f / aspect;
    out[1] = 0;
    out[2] = 0;
    out[3] = 0;
    out[4] = 0;
    out[5] = f;
    out[6] = 0;
    out[7] = 0;
    out[8] = 0;
    out[9] = 0;
    out[10] = (far + near) * nf;
    out[11] = -1;
    out[12] = 0;
    out[13] = 0;
    out[14] = (2 * far * near) * nf;
    out[15] = 0;
    return out;
}
exports.perspective = perspective;
;
// export function multiply(out: Mat4, a: Mat4, b: Mat4): Mat4 {
//     var a00 = a[0], a01 = a[1], a02 = a[2], a03 = a[3],
//         a10 = a[4], a11 = a[5], a12 = a[6], a13 = a[7],
//         a20 = a[8], a21 = a[9], a22 = a[10], a23 = a[11],
//         a30 = a[12], a31 = a[13], a32 = a[14], a33 = a[15];
// 
//     // Cache only the current line of the second matrix
//     var b0  = b[0], b1 = b[1], b2 = b[2], b3 = b[3];  
//     out[0] = b0*a00 + b1*a10 + b2*a20 + b3*a30;
//     out[1] = b0*a01 + b1*a11 + b2*a21 + b3*a31;
//     out[2] = b0*a02 + b1*a12 + b2*a22 + b3*a32;
//     out[3] = b0*a03 + b1*a13 + b2*a23 + b3*a33;
// 
//     b0 = b[4]; b1 = b[5]; b2 = b[6]; b3 = b[7];
//     out[4] = b0*a00 + b1*a10 + b2*a20 + b3*a30;
//     out[5] = b0*a01 + b1*a11 + b2*a21 + b3*a31;
//     out[6] = b0*a02 + b1*a12 + b2*a22 + b3*a32;
//     out[7] = b0*a03 + b1*a13 + b2*a23 + b3*a33;
// 
//     b0 = b[8]; b1 = b[9]; b2 = b[10]; b3 = b[11];
//     out[8] = b0*a00 + b1*a10 + b2*a20 + b3*a30;
//     out[9] = b0*a01 + b1*a11 + b2*a21 + b3*a31;
//     out[10] = b0*a02 + b1*a12 + b2*a22 + b3*a32;
//     out[11] = b0*a03 + b1*a13 + b2*a23 + b3*a33;
// 
//     b0 = b[12]; b1 = b[13]; b2 = b[14]; b3 = b[15];
//     out[12] = b0*a00 + b1*a10 + b2*a20 + b3*a30;
//     out[13] = b0*a01 + b1*a11 + b2*a21 + b3*a31;
//     out[14] = b0*a02 + b1*a12 + b2*a22 + b3*a32;
//     out[15] = b0*a03 + b1*a13 + b2*a23 + b3*a33;
//     return out;
// };

},{}],8:[function(require,module,exports){
"use strict";
const test_vsrc_1 = require("./shaders/test-vsrc");
const test_fsrc_1 = require("./shaders/test-fsrc");
const per_vertex_vsrc_1 = require("./shaders/per-vertex-vsrc");
const per_vertex_fsrc_1 = require("./shaders/per-vertex-fsrc");
const Matrix_1 = require("./Matrix");
const Commando_1 = require("./Commando");
// TODO: probably should make uniforms/attributes optional on the cfg as well...
const c = document.getElementById('target');
const gl = c.getContext('webgl');
const screenQuad = new Float32Array([
    -1.0, -1.0, 0.0,
    1.0, -1.0, 0.0,
    1.0, 1.0, 0.0,
    -1.0, -1.0, 0.0,
    1.0, 1.0, 0.0,
    -1.0, 1.0, 0.0
]);
const command = Commando_1.Command.createCommand(gl, {
    vsrc: test_vsrc_1.default,
    fsrc: test_fsrc_1.default,
    uniforms: {
        u_color: new Commando_1.Uniforms.U4F([0, 1, 0, 1]),
        u_time: new Commando_1.Uniforms.UF(performance.now())
    },
    attributes: {
        a_position: new Commando_1.Attributes.Floats(3, screenQuad)
    }
});
const drawPyramid = Commando_1.Command.createCommand(gl, {
    vsrc: per_vertex_vsrc_1.default,
    fsrc: per_vertex_fsrc_1.default,
    uniforms: {
        u_light: new Commando_1.Uniforms.U3F([0, 0, 0]),
        u_model: new Commando_1.Uniforms.UMatrix4(Matrix_1.M4()),
        u_view: new Commando_1.Uniforms.UMatrix4(Matrix_1.M4()),
        u_projection: new Commando_1.Uniforms.UMatrix4(Matrix_1.M4())
    },
    attributes: {
        a_coord: new Commando_1.Attributes.Floats(3, new Float32Array(200)),
        a_normal: new Commando_1.Attributes.Floats(3, new Float32Array(200)),
    }
});
console.log(command);
console.log(drawPyramid);
// loadXHR('pyramid.obj')
// .then(parseOBJ)
// .then(geometry => {
//   if ( !geometry.success ) return
// 
//   
// })
if (command instanceof Error) {
    console.log(command.message);
}
else {
    const render = function render() {
        gl.viewport(0, 0, c.width, c.height);
        gl.clearColor(0, 0, 0, 0);
        gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
        Commando_1.Command.run(command, {
            uniforms: {
                u_time: performance.now()
            },
            count: 6
        });
        requestAnimationFrame(render);
    };
    requestAnimationFrame(render);
}
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

},{"./Commando":5,"./Matrix":7,"./shaders/per-vertex-fsrc":9,"./shaders/per-vertex-vsrc":10,"./shaders/test-fsrc":11,"./shaders/test-vsrc":12}],9:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = `
precision mediump float; 

uniform vec3 u_position;
uniform vec3 u_scale;
uniform vec3 u_rotation;

varying vec4 v_color;

void main () { 
  gl_FragColor = v_color; 
}
`;

},{}],10:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = `
precision mediump float;

attribute vec3 a_coord; 
attribute vec3 a_normal;

uniform vec3 u_light;
uniform mat4 u_model;
uniform mat4 u_view;
uniform mat4 u_projection;

const vec4 COLOR_SCALE = vec4(256.0, 256.0, 256.0, 1.0);
const vec4 rgba = vec4(0.0, 255.0, 255.0, 1.0);
const vec4 color = rgba / COLOR_SCALE;

varying vec4 v_color;

void main () { 
  mat4 MVP = u_projection * u_view * u_model;
  mat4 MV = u_view * u_model;
  vec3 MVVertex = vec3(MV * vec4(a_coord, 1.0));
  vec3 MVNormal = vec3(MV * vec4(a_normal, 0.0));
  vec3 light_vector = normalize(u_light - MVVertex);
  float distance = length(u_light - MVVertex);
  float falloff = 0.05;
  float attenuation = 1.0 / (1.0 + (falloff * distance * distance));
  float diffuse = max(dot(MVNormal, light_vector), 0.1) * attenuation;

  v_color = vec4(color[0] * diffuse, color[1] * diffuse, color[2] * diffuse, color[3]);
  gl_Position = MVP * vec4(a_coord, 1.0);
}
`;

},{}],11:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = `
precision mediump float;

uniform vec4 u_color;
uniform float u_time;

void main () {
  float t = ( sin(u_time / 1000.0) + 1.0 ) * 0.5;

  gl_FragColor = vec4(u_color[0], u_color[1], u_color[2], t);
}
`;

},{}],12:[function(require,module,exports){
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = `
precision mediump float;

attribute vec3 a_position;

uniform vec4 u_color;
uniform float u_time;

void main () {
  gl_Position = vec4(a_position, 1.0);
}
`;

},{}]},{},[8]);
