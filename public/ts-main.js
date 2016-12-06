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
function loadXHR(uri) {
    return new Promise((res, rej) => {
        const xhr = new XMLHttpRequest;
        xhr.onload = _ => res(xhr.response);
        xhr.onerror = _ => rej(`Could not load ${uri}`);
        xhr.open('GET', uri);
        xhr.send();
    });
}
exports.loadXHR = loadXHR;

},{}],8:[function(require,module,exports){
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

},{}],9:[function(require,module,exports){
"use strict";
const Parser_1 = require("./Parser");
const parsers_1 = require("./parsers");
exports.Vert = (x, y, z, w) => ({
    kind: 'Vertex',
    value: [x, y, z, w]
});
exports.TexCoord = (x, y, z) => ({
    kind: 'TexCoord',
    value: [x, y, z]
});
exports.Face = (indices) => ({
    kind: 'Face',
    value: indices
});
exports.Normal = (x, y, z) => ({
    kind: 'Normal',
    value: [x, y, z]
});
exports.Ignored = (s) => ({
    kind: 'Ignored',
    value: s
});
const spaced = (p) => Parser_1.doThen(parsers_1.spaces, p);
const txCoord = parsers_1.inRange(0, 1, parsers_1.real);
const anyChar = parsers_1.satisfy(_ => true);
const faceVertex = Parser_1.lift3((v, vt, vn) => ({ v, vt, vn }), spaced(parsers_1.integer), parsers_1.optional(Parser_1.doThen(parsers_1.slash, parsers_1.optional(parsers_1.integer))), parsers_1.optional(Parser_1.doThen(parsers_1.slash, parsers_1.integer)));
exports.vertex = Parser_1.lift4(exports.Vert, Parser_1.doThen(parsers_1.exactly('v'), spaced(parsers_1.real)), spaced(parsers_1.real), spaced(parsers_1.real), spaced(parsers_1.orDefault(parsers_1.real, 1.0)));
exports.texCoord = Parser_1.lift3(exports.TexCoord, Parser_1.doThen(parsers_1.match('vt'), spaced(txCoord)), spaced(txCoord), spaced(parsers_1.orDefault(txCoord, 0.0)));
exports.normal = Parser_1.lift3(exports.Normal, Parser_1.doThen(parsers_1.match('vn'), spaced(parsers_1.real)), spaced(parsers_1.real), spaced(parsers_1.real));
exports.face = Parser_1.lift(exports.Face, Parser_1.doThen(parsers_1.match('f'), parsers_1.atleastN(3, spaced(faceVertex))));
exports.ignored = Parser_1.lift(exports.Ignored, Parser_1.fmap(cs => cs.join(''), parsers_1.many1(anyChar)));
exports.line = parsers_1.anyOf([exports.vertex, exports.texCoord, exports.normal, exports.face, exports.ignored]);
function linesToGeometry(lines) {
    const pVertices = [];
    const pNormals = [];
    const pTexCoords = [];
    const pFaces = [];
    for (var i = 0; i < lines.length; i++) {
        var l = lines[i];
        if (l.kind === 'Vertex')
            pVertices.push(l.value);
        else if (l.kind === 'Normal')
            pNormals.push(l.value);
        else if (l.kind === 'TexCoord')
            pTexCoords.push(l.value);
        else if (l.kind === 'Face')
            pFaces.push(...l.value);
        else { }
    }
    const vertices = new Array(pFaces.length * 3);
    const normals = new Array(pFaces.length * 3);
    const texCoords = new Array(pFaces.length * 2);
    const defaultNormal = [0, 0, 1];
    const defaultTexCoord = [0, 0];
    for (var i = 0; i < pFaces.length; i++) {
        var { v, vt, vn } = pFaces[i];
        var vert = pVertices[v - 1];
        var normal = vn != null ? pNormals[vn - 1] : defaultNormal;
        var texCoord = vt != null ? pTexCoords[vt - 1] : defaultTexCoord;
        vertices[i * 3] = vert[0];
        vertices[i * 3 + 1] = vert[1];
        vertices[i * 3 + 2] = vert[2];
        normals[i * 3] = normal[0];
        normals[i * 3 + 1] = normal[1];
        normals[i * 3 + 2] = normal[2];
        texCoords[i * 2] = texCoord[0];
        texCoords[i * 2 + 1] = texCoord[1];
    }
    return { vertices, normals, texCoords };
}
exports.parseOBJ = Parser_1.fmap(linesToGeometry, parsers_1.interspersing(exports.line, parsers_1.many(parsers_1.newline)));

},{"./Parser":10,"./parsers":11}],10:[function(require,module,exports){
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
function failed(msg) {
    return (_) => new Err(msg);
}
exports.failed = failed;
function fmap(f, pa) {
    return flatMap(pa, a => unit(f(a)));
}
exports.fmap = fmap;
function apply(pf, pa) {
    return flatMap(pf, f => fmap(f, pa));
}
exports.apply = apply;
function lift(f, pa) {
    return apply(unit(f), pa);
}
exports.lift = lift;
function lift2(f, pa, pb) {
    return apply(fmap((a) => (b) => f(a, b), pa), pb);
}
exports.lift2 = lift2;
function lift3(f, pa, pb, pc) {
    const chain = (a) => (b) => (c) => f(a, b, c);
    return apply(apply(fmap(chain, pa), pb), pc);
}
exports.lift3 = lift3;
function lift4(f, pa, pb, pc, pd) {
    const chain = (a) => (b) => (c) => (d) => f(a, b, c, d);
    return apply(apply(apply(fmap(chain, pa), pb), pc), pd);
}
exports.lift4 = lift4;
function flatMap(pa, f) {
    return function (s) {
        const out = pa(s);
        return out.success
            ? f(out.val)(out.rest)
            : new Err(out.message);
    };
}
exports.flatMap = flatMap;
function doThen(p1, p2) {
    return flatMap(p1, _ => p2);
}
exports.doThen = doThen;

},{}],11:[function(require,module,exports){
"use strict";
const predicates_1 = require("./predicates");
const Parser_1 = require("./Parser");
function satisfy(f) {
    return function (str) {
        if (str.length === 0)
            return new Parser_1.Err('Nothing to consume');
        else if (f(str.slice(0, 1)))
            return new Parser_1.Result(str.slice(0, 1), str.slice(1));
        else
            return new Parser_1.Err(`${str[0]} did not satisfy`);
    };
}
exports.satisfy = satisfy;
function exactly(character) {
    return satisfy(n => n === character);
}
exports.exactly = exactly;
function match(target) {
    return function (s) {
        for (var i = 0; i < target.length; i++) {
            if (s[i] !== target[i])
                return new Parser_1.Err(`${s[i]} did not match ${target[i]}`);
        }
        return new Parser_1.Result(s.slice(0, target.length), s.slice(target.length));
    };
}
exports.match = match;
function size(s) {
    return new Parser_1.Result(s.length, s);
}
exports.size = size;
function eof(s) {
    return s.length === 0 ? new Parser_1.Result(null, '') : new Parser_1.Err(s + ': Not end of input');
}
exports.eof = eof;
function consume(f) {
    return function (s) {
        for (var i = 0; i < s.length; i++) {
            if (!f(s[i]))
                break;
        }
        return new Parser_1.Result(s.slice(0, i), s.slice(i));
    };
}
exports.consume = consume;
function consume1(f) {
    return Parser_1.flatMap(satisfy(f), x => Parser_1.flatMap(consume(f), xs => Parser_1.unit(x + xs)));
}
exports.consume1 = consume1;
function consumeAtleastN(n, f) {
    return function (s) {
        if (n < 0)
            return new Parser_1.Err('Negative count');
        if (s.length < n)
            return new Parser_1.Err('Not enough characters');
        for (var i = 0; i < n; i++) {
            if (!f(s[i]))
                return new Parser_1.Err(`${s[i]} did not satisfy`);
        }
        return consume(f)(s);
    };
}
exports.consumeAtleastN = consumeAtleastN;
function many(p) {
    return function (s) {
        var result;
        var out = [];
        var remaining = s;
        while (true) {
            result = p(remaining);
            if (!result.success)
                break;
            out.push(result.val);
            remaining = result.rest;
        }
        return new Parser_1.Result(out, remaining);
    };
}
exports.many = many;
function many1(p) {
    return Parser_1.flatMap(p, x => Parser_1.flatMap(many(p), xs => Parser_1.unit([x, ...xs])));
}
exports.many1 = many1;
function manyTill(p, end) {
    const scan = or(Parser_1.flatMap(end, _ => Parser_1.unit([])), Parser_1.flatMap(p, x => Parser_1.flatMap(scan, xs => Parser_1.unit([x].concat(xs)))));
    return scan;
}
exports.manyTill = manyTill;
function atleastN(n, p) {
    return Parser_1.flatMap(many(p), xs => xs.length >= n ? Parser_1.unit(xs) : Parser_1.failed('Not enough matches'));
}
exports.atleastN = atleastN;
function between(pLeft, p, pRight) {
    return Parser_1.flatMap(Parser_1.doThen(pLeft, p), out => Parser_1.flatMap(pRight, _ => Parser_1.unit(out)));
}
exports.between = between;
function around(pLeft, p, pRight) {
    return Parser_1.flatMap(pLeft, l => Parser_1.doThen(p, Parser_1.flatMap(pRight, r => Parser_1.unit([l, r]))));
}
exports.around = around;
function seperatedBy(p, sep) {
    return Parser_1.flatMap(p, first => Parser_1.flatMap(many1(Parser_1.doThen(sep, p)), inner => Parser_1.unit([first, ...inner])));
}
exports.seperatedBy = seperatedBy;
function interspersing(p, sep) {
    return Parser_1.flatMap(many1(Parser_1.doThen(sep, p)), xs => Parser_1.flatMap(sep, _ => Parser_1.unit(xs)));
}
exports.interspersing = interspersing;
function orDefault(p, dflt) {
    return or(p, Parser_1.unit(dflt));
}
exports.orDefault = orDefault;
function or(p1, p2) {
    return function (s) {
        const left = p1(s);
        return left.success ? left : p2(s);
    };
}
exports.or = or;
function optional(p) {
    return orDefault(p, undefined);
}
exports.optional = optional;
function anyOf([head, ...rest]) {
    if (head == null)
        return Parser_1.failed('None matched');
    else
        return or(head, anyOf(rest));
}
exports.anyOf = anyOf;
function concat([head, ...rest]) {
    if (head == null)
        return Parser_1.unit('');
    else
        return Parser_1.flatMap(head, out => Parser_1.flatMap(concat(rest), out2 => Parser_1.unit(out + out2)));
}
exports.concat = concat;
function inRange(min, max, p) {
    return Parser_1.flatMap(p, x => x >= min && x <= max
        ? Parser_1.unit(x)
        : Parser_1.failed('Out of range'));
}
exports.inRange = inRange;
exports.dash = exactly('-');
exports.dot = exactly('.');
exports.slash = exactly('/');
exports.backslash = exactly('\\');
exports.alpha = satisfy(predicates_1.isAlpha);
exports.num = satisfy(predicates_1.isNumber);
exports.alphanum = satisfy(n => predicates_1.isNumber(n) || predicates_1.isAlpha(n));
exports.alphas = consume(predicates_1.isAlpha);
exports.nums = consume(predicates_1.isNumber);
exports.alphanums = consume(n => predicates_1.isNumber(n) || predicates_1.isAlpha(n));
exports.space = exactly(' ');
exports.spaces = consume(n => n === ' ');
exports.newline = anyOf([exactly('\n'), exactly('\f'), match('\r\n'), exactly('\r')]);
exports.integer = Parser_1.fmap(Number, concat([
    orDefault(exports.dash, ''),
    consumeAtleastN(1, predicates_1.isNumber)
]));
exports.real = Parser_1.fmap(Number, concat([
    orDefault(exports.dash, ''),
    consumeAtleastN(1, predicates_1.isNumber),
    exports.dot,
    consumeAtleastN(1, predicates_1.isNumber)
]));

},{"./Parser":10,"./predicates":12}],12:[function(require,module,exports){
"use strict";
function isAlpha(s) {
    const cc = s.charCodeAt(0);
    return !isNaN(cc) && ((cc >= 65 && cc <= 90) || (cc >= 97 && cc <= 122));
}
exports.isAlpha = isAlpha;
function isNumber(s) {
    const cc = s.charCodeAt(0);
    return !isNaN(cc) && cc >= 48 && cc <= 57;
}
exports.isNumber = isNumber;
function is(target) {
    return function (s) {
        if (s.length === 0 || target.length === 0)
            return false;
        else
            return target[0] === s[0];
    };
}
exports.is = is;

},{}],13:[function(require,module,exports){
"use strict";
const per_vertex_vsrc_1 = require("./shaders/per-vertex-vsrc");
const per_vertex_fsrc_1 = require("./shaders/per-vertex-fsrc");
const Load_1 = require("./Load");
const OBJ_1 = require("./Parsers/OBJ");
const Matrix_1 = require("./Matrix");
const Commando_1 = require("./Commando");
const c = document.getElementById('target');
const gl = c.getContext('webgl');
/*
  At-a-glance understanding of GLTF

  <Buffer> stores binary data
  <BufferView> refer to slices of a <Buffer> by bytelength ( no type/stride info )
  <Accessor> adds information to <BufferView> like stride, type, offset, count
  <Mesh> List of <Primitive> and optional name
  <Primitive> lists Attributes/Indices? by <Accessor> and Material and drawing mode ( Triangles, etc )
  <Node> contains <Mesh>[], matrix transform, children <Node>[], and name
*/
var GLTFComponentType;
(function (GLTFComponentType) {
    GLTFComponentType[GLTFComponentType["BYTE"] = 5120] = "BYTE";
    GLTFComponentType[GLTFComponentType["UNSIGNED_BYTE"] = 5121] = "UNSIGNED_BYTE";
    GLTFComponentType[GLTFComponentType["SHORT"] = 5122] = "SHORT";
    GLTFComponentType[GLTFComponentType["UNSIGNED_SHORT"] = 5123] = "UNSIGNED_SHORT";
    GLTFComponentType[GLTFComponentType["FLOAT"] = 5126] = "FLOAT";
})(GLTFComponentType || (GLTFComponentType = {}));
var GLTFBufferViewTarget;
(function (GLTFBufferViewTarget) {
    GLTFBufferViewTarget[GLTFBufferViewTarget["ARRAY_BUFFER"] = 34962] = "ARRAY_BUFFER";
    GLTFBufferViewTarget[GLTFBufferViewTarget["ELEMENT_ARRAY_BUFFER"] = 34963] = "ELEMENT_ARRAY_BUFFER";
})(GLTFBufferViewTarget || (GLTFBufferViewTarget = {}));
var GLTFPrimitiveMode;
(function (GLTFPrimitiveMode) {
    GLTFPrimitiveMode[GLTFPrimitiveMode["POINTS"] = 0] = "POINTS";
    GLTFPrimitiveMode[GLTFPrimitiveMode["LINES"] = 1] = "LINES";
    GLTFPrimitiveMode[GLTFPrimitiveMode["LINE_LOOP"] = 2] = "LINE_LOOP";
    GLTFPrimitiveMode[GLTFPrimitiveMode["LINE_STRIP"] = 3] = "LINE_STRIP";
    GLTFPrimitiveMode[GLTFPrimitiveMode["TRIANGLES"] = 4] = "TRIANGLES";
    GLTFPrimitiveMode[GLTFPrimitiveMode["TRIANGLE_STRIP"] = 5] = "TRIANGLE_STRIP";
    GLTFPrimitiveMode[GLTFPrimitiveMode["TRIANGLE_FAN"] = 6] = "TRIANGLE_FAN";
})(GLTFPrimitiveMode || (GLTFPrimitiveMode = {}));
var GLTFParameterType;
(function (GLTFParameterType) {
    GLTFParameterType[GLTFParameterType["BYTE"] = 5120] = "BYTE";
    GLTFParameterType[GLTFParameterType["UNSIGNED_BYTE"] = 5121] = "UNSIGNED_BYTE";
    GLTFParameterType[GLTFParameterType["SHORT"] = 5122] = "SHORT";
    GLTFParameterType[GLTFParameterType["UNSIGNED_SHORT"] = 5123] = "UNSIGNED_SHORT";
    GLTFParameterType[GLTFParameterType["INT"] = 5124] = "INT";
    GLTFParameterType[GLTFParameterType["UNSIGNED_INT"] = 5125] = "UNSIGNED_INT";
    GLTFParameterType[GLTFParameterType["FLOAT"] = 5126] = "FLOAT";
    GLTFParameterType[GLTFParameterType["FLOAT_VEC2"] = 35664] = "FLOAT_VEC2";
    GLTFParameterType[GLTFParameterType["FLOAT_VEC3"] = 35665] = "FLOAT_VEC3";
    GLTFParameterType[GLTFParameterType["FLOAT_VEC4"] = 35666] = "FLOAT_VEC4";
    GLTFParameterType[GLTFParameterType["INT_VEC2"] = 35667] = "INT_VEC2";
    GLTFParameterType[GLTFParameterType["INT_VEC3"] = 35668] = "INT_VEC3";
    GLTFParameterType[GLTFParameterType["INT_VEC4"] = 35669] = "INT_VEC4";
    GLTFParameterType[GLTFParameterType["BOOL"] = 35670] = "BOOL";
    GLTFParameterType[GLTFParameterType["BOOL_VEC2"] = 35671] = "BOOL_VEC2";
    GLTFParameterType[GLTFParameterType["BOOL_VEC3"] = 35672] = "BOOL_VEC3";
    GLTFParameterType[GLTFParameterType["BOOL_VEC4"] = 35673] = "BOOL_VEC4";
    GLTFParameterType[GLTFParameterType["FLOAT_MAT2"] = 35674] = "FLOAT_MAT2";
    GLTFParameterType[GLTFParameterType["FLOAT_MAT3"] = 35675] = "FLOAT_MAT3";
    GLTFParameterType[GLTFParameterType["FLOAT_MAT4"] = 35676] = "FLOAT_MAT4";
    GLTFParameterType[GLTFParameterType["SAMPLER_2D"] = 35678] = "SAMPLER_2D";
})(GLTFParameterType || (GLTFParameterType = {}));
function containing(b, offset, length, value) {
    const out = new Float32Array(b, offset, length);
    out.set(value);
    return out;
}
Load_1.loadXHR('pyramid.obj')
    .then(OBJ_1.parseOBJ)
    .then(geometry => {
    if (!geometry.success)
        return;
    // 32b -> 8B
    const F32_BYTE_SIZE = 4;
    const { vertices, normals } = geometry.val;
    const vertBytelength = vertices.length * F32_BYTE_SIZE;
    const normBytelength = normals.length * F32_BYTE_SIZE;
    const b = new ArrayBuffer(vertBytelength + normBytelength);
    const verticesBV = containing(b, 0, vertices.length, vertices);
    const normalsBV = containing(b, vertices.length * F32_BYTE_SIZE, normals.length, normals);
    const keys = new Array(256);
    const light = Matrix_1.V3(0, 2, 0);
    const cam = {
        position: new Float32Array([0, 1, 5]),
        view: Matrix_1.M4(),
        projection: Matrix_1.M4(),
        vfov: Math.PI / 4,
        aspectRatio: c.width / c.height,
        near: 0.1,
        far: 10000,
        up: Matrix_1.V3(0, 1, 0),
        at: Matrix_1.V3(0, 0, 0)
    };
    const transform = {
        position: Matrix_1.V3(0, 0, 0),
        scale: Matrix_1.V3(1, 1, 1),
        rotation: Matrix_1.V3(0, 0, 0),
        model: Matrix_1.M4()
    };
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
            a_coord: new Commando_1.Attributes.Floats(3, verticesBV),
            a_normal: new Commando_1.Attributes.Floats(3, normalsBV)
        }
    });
    if (drawPyramid instanceof Error) {
        console.log(drawPyramid);
    }
    else {
        var t = 0;
        const render = function render() {
            t++;
            if (keys[37])
                transform.rotation[1] -= 0.05;
            if (keys[39])
                transform.rotation[1] += 0.05;
            light[0] = Math.cos(t / 10) * 2;
            light[2] = Math.sin(t / 10) * 2;
            Matrix_1.identity(transform.model);
            Matrix_1.translate(transform.model, transform.position);
            Matrix_1.scale(transform.model, transform.scale);
            Matrix_1.rotateX(transform.model, transform.rotation[0]);
            Matrix_1.rotateY(transform.model, transform.rotation[1]);
            Matrix_1.rotateZ(transform.model, transform.rotation[2]);
            cam.aspectRatio = c.width / c.height;
            Matrix_1.lookAt(cam.view, cam.position, cam.at, cam.up);
            Matrix_1.perspective(cam.projection, cam.vfov, cam.aspectRatio, cam.near, cam.far);
            gl.enable(gl.CULL_FACE);
            gl.cullFace(gl.BACK);
            gl.viewport(0, 0, c.width, c.height);
            gl.clearColor(0, 0, 0, 0);
            gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
            Commando_1.Command.run(drawPyramid, {
                uniforms: {
                    u_light: light,
                    u_model: transform.model,
                    u_view: cam.view,
                    u_projection: cam.projection
                },
                count: vertices.length / 3
            });
            requestAnimationFrame(render);
        };
        requestAnimationFrame(render);
        document.body.addEventListener('keydown', ({ keyCode }) => keys[keyCode] = 1);
        document.body.addEventListener('keyup', ({ keyCode }) => keys[keyCode] = 0);
    }
});

},{"./Commando":5,"./Load":7,"./Matrix":8,"./Parsers/OBJ":9,"./shaders/per-vertex-fsrc":14,"./shaders/per-vertex-vsrc":15}],14:[function(require,module,exports){
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

},{}],15:[function(require,module,exports){
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

},{}]},{},[13])
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uL3Vzci9sb2NhbC9saWIvbm9kZV9tb2R1bGVzL3dhdGNoaWZ5L25vZGVfbW9kdWxlcy9icm93c2VyLXBhY2svX3ByZWx1ZGUuanMiLCJzcmMvQ29tbWFuZG8vQXR0cmlidXRlcy50cyIsInNyYy9Db21tYW5kby9Db21tYW5kLnRzIiwic3JjL0NvbW1hbmRvL1VuaWZvcm1zLnRzIiwic3JjL0NvbW1hbmRvL2luZGV4LnRzIiwic3JjL0NvbW1hbmRvL3V0aWxzLnRzIiwic3JjL0xvYWQudHMiLCJzcmMvTWF0cml4LnRzIiwic3JjL1BhcnNlcnMvT0JKLnRzIiwic3JjL1BhcnNlcnMvUGFyc2VyLnRzIiwic3JjL1BhcnNlcnMvcGFyc2Vycy50cyIsInNyYy9QYXJzZXJzL3ByZWRpY2F0ZXMudHMiLCJzcmMvbWFpbi50cyIsInNyYy9zaGFkZXJzL3Blci12ZXJ0ZXgtZnNyYy50cyIsInNyYy9zaGFkZXJzL3Blci12ZXJ0ZXgtdnNyYy50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTs7QUNnQkEsSUFBWSxVQUFnRTtBQUE1RSxXQUFZLFVBQVU7SUFBRywyQ0FBSSxDQUFBO0lBQUUsNkRBQWEsQ0FBQTtJQUFFLDZDQUFLLENBQUE7SUFBRSwrREFBYyxDQUFBO0lBQUUsNkNBQUssQ0FBQTtBQUFDLENBQUMsRUFBaEUsVUFBVSxHQUFWLGtCQUFVLEtBQVYsa0JBQVUsUUFBc0Q7QUFxQjVFO0lBSUUsWUFBb0IsSUFBbUIsRUFBUyxLQUFtQjtRQUEvQyxTQUFJLEdBQUosSUFBSSxDQUFlO1FBQVMsVUFBSyxHQUFMLEtBQUssQ0FBYztRQUhuRSxXQUFNLEdBQUcsQ0FBQyxDQUFBO1FBQ1YsV0FBTSxHQUFHLENBQUMsQ0FBQTtRQUNELGVBQVUsR0FBRyxVQUFVLENBQUMsS0FBSyxDQUFBO0lBQ2lDLENBQUM7SUFDeEUsS0FBSyxDQUFDLEVBQU0sRUFBRSxDQUEwQjtRQUN0QyxNQUFNLEVBQUUsR0FBRyxFQUFFLElBQUksRUFBRSxVQUFVLEVB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S0FBSyxDQUFNO0lBQUksQ0FBQztJQUNwQyxHQUFHLENBQUUsRUFBTSxFQUFFLENBQU0sRUFBRSxDQUFPLElBQUssRUFBRSxDQUFDLFNBQVMsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxDQUFDLENBQUMsQ0FBQyxFQUFFLENBQUMsQ0FBQyxDQUFDLENBQUMsRUFBRSxDQUFDLENBQUMsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUEsQ0FBQyxDQUFDO0NBQzNFO0FBSEQsa0JBR0M7QUFFRDtJQUNFLFlBQW9CLEtBQWE7UUFBYixVQUFLLEdBQUwsS0FBSyxDQUFRO0lBQUksQ0FBQztJQUN0QyxHQUFHLENBQUUsRUFBTSxFQUFFLENBQU0sRUFBRSxDQUFTLElBQUssRUFBRSxDQUFDLFVBQVUsQ0FBQyxDQUFDLEVBQUUsYUFBSyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUEsQ0FBQyxDQUFDO0NBQ2hFO0FBSEQsa0JBR0M7QUFFRDtJQUNFLFlBQW9CLEtBQWE7UUFBYixVQUFLLEdBQUwsS0FBSyxDQUFRO0lBQUksQ0FBQztJQUN0QyxHQUFHLENBQUUsRUFBTSxFQUFFLENBQU0sRUFBRSxDQUFTLElBQUssRUFBRSxDQUFDLFVBQVUsQ0FBQyxDQUFDLEVBQUUsYUFBSyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUEsQ0FBQyxDQUFDO0NBQ2hFO0FBSEQsb0JBR0M7QUFFRDtJQUNFLFlBQW9CLEtBQWE7UUFBYixVQUFLLEdBQUwsS0FBSyxDQUFRO0lBQUksQ0FBQztJQUN0QyxHQUFHLENBQUUsRUFBTSxFQUFFLENBQU0sRUFBRSxDQUFTLElBQUssRUFBRSxDQUFDLFVBQVUsQ0FBQyxDQUFDLEVBQUUsYUFBSyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUEsQ0FBQyxDQUFDO0NBQ2hFO0FBSEQsb0JBR0M7QUFFRDtJQUNFLFlBQW9CLEtBQWE7UUFBYixVQUFLLEdBQUwsS0FBSyxDQUFRO0lBQUksQ0FBQztJQUN0QyxHQUFHLENBQUUsRUFBTSxFQUFFLENBQU0sRUFBRSxDQUFTLElBQUssRUFBRSxDQUFDLFVBQVUsQ0FBQyxDQUFDLEVBQUUsYUFBSyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUEsQ0FBQyxDQUFDO0NBQ2hFO0FBSEQsb0JBR0M7QUFFRDtJQUNFLFlBQW9CLEtBQVc7UUFBWCxVQUFLLEdBQUwsS0FBSyxDQUFNO0lBQUksQ0FBQztJQUNwQyxHQUFHLENBQUUsRUFBTSxFQUFFLENBQU0sRUFBRSxDQUFPLElBQUssRUFBRSxDQUFDLFVBQVUsQ0FBQyxDQUFDLEVBQUUsYUFBSyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUEsQ0FBQyxDQUFDO0NBQzlEO0FBSEQsa0JBR0M7QUFFRDtJQUNFLFlBQW9CLEtBQVc7UUFBWCxVQUFLLEdBQUwsS0FBSyxDQUFNO0lBQUksQ0FBQztJQUNwQyxHQUFHLENBQUUsRUFBTSxFQUFFLENBQU0sRUFBRSxDQUFPLElBQUssRUFBRSxDQUFDLFVBQVUsQ0FBQyxDQUFDLEVBQUUsYUFBSyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUEsQ0FBQyxDQUFDO0NBQzlEO0FBSEQsb0JBR0M7QUFFRDtJQUNFLFlBQW9CLEtBQVc7UUFBWCxVQUFLLEdBQUwsS0FBSyxDQUFNO0lBQUksQ0FBQztJQUNwQyxHQUFHLENBQUUsRUFBTSxFQUFFLENBQU0sRUFBRSxDQUFPLElBQUssRUFBRSxDQUFDLFVBQVUsQ0FBQyxDQUFDLEVBQUUsYUFBSyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUEsQ0FBQyxDQUFDO0NBQzlEO0FBSEQsb0JBR0M7QUFFRDtJQUNFLFlBQW9CLEtBQVc7UUFBWCxVQUFLLEdBQUwsS0FBSyxDQUFNO0lBQUksQ0FBQztJQUNwQyxHQUFHLENBQUUsRUFBTSxFQUFFLENBQU0sRUFBRSxDQUFPLElBQUssRUFBRSxDQUFDLFVBQVUsQ0FBQyxDQUFDLEVBQUUsYUFBSyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUEsQ0FBQyxDQUFDO0NBQzlEO0FBSEQsb0JBR0M7QUFFRDtJQUNFLFlBQW9CLEtBQWE7UUFBYixVQUFLLEdBQUwsS0FBSyxDQUFRO0lBQUksQ0FBQztJQUN0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QUMxQixHQUFHLENBQUMsQ0FBQyxDQUFDLEdBQUcsR0FBRyxHQUFHLENBQUMsR0FBRyxHQUFHLEdBQUcsQ0FBQyxDQUFBO0lBQzFCLEdBQUcsQ0FBQyxDQUFDLENBQUMsR0FBRyxHQUFHLEdBQUcsQ0FBQyxHQUFHLEdBQUcsR0FBRyxDQUFDLENBQUE7SUFDMUIsR0FBRyxDQUFDLENBQUMsQ0FBQyxHQUFHLEdBQUcsR0FBRyxDQUFDLEdBQUcsR0FBRyxHQUFHLENBQUMsQ0FBQTtJQUMxQixHQUFHLENBQUMsQ0FBQyxDQUFDLEdBQUcsR0FBRyxHQUFHLENBQUMsR0FBRyxHQUFHLEdBQUcsQ0FBQyxDQUFBO0lBQzFCLEdBQUcsQ0FBQyxFQUFFLENBQUMsR0FBRyxHQUFHLEdBQUcsQ0FBQyxHQUFHLEdBQUcsR0FBRyxDQUFDLENBQUE7SUFDM0IsR0FBRyxDQUFDLEVBQUUsQ0FBQyxHQUFHLEdBQUcsR0FBRyxDQUFDLEdBQUcsR0FBRyxHQUFHLENBQUMsQ0FBQTtJQUMzQixNQUFNLENBQUMsR0FBRyxDQUFBO0FBQ2QsQ0FBQztBQXJCRCwwQkFxQkM7QUFFRCxpQkFBeUIsR0FBUyxFQUFFLEdBQVc7SUFDM0MsSUFBSSxDQUFDLEdBQUcsSUFBSSxDQUFDLEdBQUcsQ0FBQyxHQUFHLENBQUMsRUFDakIsQ0FBQyxHQUFHLElBQUksQ0FBQyxHQUFHLENBQUMsR0FBRyxDQUFDLEVBQ2pCLEdBQUcsR0FBRyxHQUFHLENBQUMsQ0FBQyxDQUFDLEVBQ1osR0FBRyxHQUFHLEdBQUcsQ0FBQyxDQUFDLENBQUMsRUFDWixHQUFHLEdBQUcsR0FBRyxDQUFDLENBQUMsQ0FBQyxFQUNaLEdBQUcsR0FBRyxHQUFHLENBQUMsQ0FBQyxDQUFDLEVBQ1osR0FBRyxHQUFHLEdBQUcsQ0FBQyxDQUFDLENBQUMsRUFDWixHQUFHLEdBQUcsR0FBRyxDQUFDLENBQUMsQ0FBQyxFQUNaLEdBQUcsR0FBRyxHQUFHLENBQUMsRUFBRSxDQUFDLEVBQ2IsR0FBRyxHQUFHLEdBQUcsQ0FBQyxFQUFFLENBQUMsQ0FBQztJQUVsQixHQUFHLENBQUMsQ0FBQyxDQUFDLEdBQUcsR0FBRyxHQUFHLENBQUMsR0FBRyxHQUFHLEdBQUcsQ0FBQyxDQUFBO0lBQzFCLEdBQUcsQ0FBQyxDQUFDLENBQUMsR0FBRyxHQUFHLEdBQUcsQ0FBQyxHQUFHLEdBQUcsR0FBRyxDQUFDLENBQUE7SUFDMUIsR0FBRyxDQUFDLENBQUMsQ0FBQyxHQUFHLEdBQUcsR0FBRyxDQUFDLEdBQUcsR0FBRyxHQUFHLENBQUMsQ0FBQTtJQUMxQixHQUFHLENBQUMsQ0FBQyxDQUFDLEdBQUcsR0FBRyxHQUFHLENBQUMsR0FBRyxHQUFHLEdBQUcsQ0FBQyxDQUFBO0lBQzFCLEdBQUcsQ0FBQyxDQUFDLENBQUMsR0FBRyxHQUFHLEdBQUcsQ0FBQyxHQUFHLEdBQUcsR0FBRyxDQUFDLENBQUE7SUFDMUIsR0FBRyxDQUFDLENBQUMsQ0FBQyxHQUFHLEdBQUcsR0FBRyxDQUFDLEdBQUcsR0FBRyxHQUFHLENBQUMsQ0FBQTtJQUMxQixHQUFHLENBQUMsRUFBRSxDQUFDLEdBQUcsR0FBRyxHQUFHLENBQUMsR0FBRyxHQUFHLEdBQUcsQ0FBQyxDQUFBO0lBQzNCLEdBQUcsQ0FBQyxFQUFFLENBQUMsR0FBRyxHQUFHLEdBQUcsQ0FBQyxHQUFHLEdBQUcsR0FBRyxDQUFDLENBQUE7SUFDM0IsTUFBTSxDQUFDLEdBQUcsQ0FBQTtBQUNkLENBQUM7QUFyQkQsMEJBcUJDO0FBRUQsaUJBQXdCLEdBQVMsRUFBRSxHQUFXO0lBQzFDLElBQUksQ0FBQyxHQUFHLElBQUksQ0FBQyxHQUFHLENBQUMsR0FBRyxDQUFDLEVBQ2pCLENBQUMsR0FBRyxJQUFJLENBQUMsR0FBRyxDQUFDLEdBQUcsQ0FBQyxFQUNqQixHQUFHLEdBQUcsR0FBRyxDQUFDLENBQUMsQ0FBQyxFQUNaLEdBQUcsR0FBRyxHQUFHLENBQUMsQ0FBQyxDQUFDLEVBQ1osR0FBRyxHQUFHLEdBQUcsQ0FBQyxDQUFDLENBQUMsRUFDWixHQUFHLEdBQUcsR0FBRyxDQUFDLENBQUMsQ0FBQyxFQUNaLEdBQUcsR0FBRyxHQUFHLENBQUMsQ0FBQyxDQUFDLEVBQ1osR0FBRyxHQUFHLEdBQUcsQ0FBQyxDQUFDLENBQUMsRUFDWixHQUFHLEdBQUcsR0FBRyxDQUFDLENBQUMsQ0FBQyxFQUNaLEdBQUcsR0FBRyxHQUFHLENBQUMsQ0FBQyxDQUFDLENBQUE7SUFFaEIsR0FBRyxDQUFDLENBQUMsQ0FBQyxHQUFHLEdBQUcsR0FBRyxDQUFDLEdBQUcsR0FBRyxHQUFHLENBQUMsQ0FBQTtJQUMxQixHQUFHLENBQUMsQ0FBQyxDQUFDLEdBQUcsR0FBRyxHQUFHLENBQUMsR0FBRyxHQUFHLEdBQUcsQ0FBQyxDQUFBO0lBQzFCLEdBQUcsQ0FBQyxDQUFDLENBQUMsR0FBRyxHQUFHLEdBQUcsQ0FBQyxHQUFHLEdBQUcsR0FBRyxDQUFDLENBQUE7SUFDMUIsR0FBRyxDQUFDLENBQUMsQ0FBQyxHQUFHLEdBQUcsR0FBRyxDQUFDLEdBQUcsR0FBRyxHQUFHLENBQUMsQ0FBQTtJQUMxQixHQUFHLENBQUMsQ0FBQyxDQUFDLEdBQUcsR0FBRyxHQUFHLENBQUMsR0FBRyxHQUFHLEdBQUcsQ0FBQyxDQUFBO0lBQzFCLEdBQUcsQ0FBQyxDQUFDLENBQUMsR0FBRyxHQUFHLEdBQUcsQ0FBQyxHQUFHLEdBQUcsR0FBRyxDQUFDLENBQUE7SUFDMUIsR0FBRyxDQUFDLENBQUMsQ0FBQyxHQUFHLEdBQUcsR0FBRyxDQUFDLEdBQUcsR0FBRyxHQUFHLENBQUMsQ0FBQTtJQUMxQixHQUFHLENBQUMsQ0FBQyxDQUFDLEdBQUcsR0FBRyxHQUFHLENBQUMsR0FBRyxHQUFHLEdBQUcsQ0FBQyxDQUFBO0lBQzFCLE1BQU0sQ0FBQyxHQUFHLENBQUE7QUFDZCxDQUFDO0FBckJELDBCQXFCQztBQUVELGVBQXVCLEdBQVMsRUFBRSxDQUFPO0lBQ3JDLElBQUksQ0FBQyxHQUFHLENBQUMsQ0FBQyxDQUFDLENBQUMsRUFBRSxDQUFDLEdBQUcsQ0FBQyxDQUFDLENBQUMsQ0FBQyxFQUFFLENBQUMsR0FBRyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUE7SUFFaEMsR0FBRyxDQUFDLENBQUMsQ0FBQyxHQUFHLEdBQUcsQ0FBQyxDQUFDLENBQUMsR0FBRyxDQUFDLENBQUE7SUFDbkIsR0FBRyxDQUFDLENBQUMsQ0FBQyxHQUFHLEdBQUcsQ0FBQyxDQUFDLENBQUMsR0FBRyxDQUFDLENBQUE7SUFDbkIsR0FBRyxDQUFDLENBQUMsQ0FBQyxHQUFHLEdBQUcsQ0FBQyxDQUFDLENBQUMsR0FBRyxDQUFDLENBQUE7SUFDbkIsR0FBRyxDQUFDLENBQUMsQ0FBQyxHQUFHLEdBQUcsQ0FBQyxDQUFDLENBQUMsR0FBRyxDQUFDLENBQUE7SUFDbkIsR0FBRyxDQUFDLENBQUMsQ0FBQyxHQUFHLEdBQUcsQ0FBQyxDQUFDLENBQUMsR0FBRyxDQUFDLENBQUE7SUFDbkIsR0FBRyxDQUFDLENBQUMsQ0FBQyxHQUFHLEdBQUcsQ0FBQyxDQUFDLENBQUMsR0FBRyxDQUFDLENBQUE7SUFDbkIsR0FBRyxDQUFDLENBQUMsQ0FBQyxHQUFHLEdBQUcsQ0FBQyxDQUFDLENBQUMsR0FBRyxDQUFDLENBQUE7SUFDbkIsR0FBRyxDQUFDLENBQUMsQ0FBQyxHQUFHLEdBQUcsQ0FBQyxDQUFDLENBQUMsR0FBRyxDQUFDLENBQUE7SUFDbkIsR0FBRyxDQUFDLENBQUMsQ0FBQyxHQUFHLEdBQUcsQ0FBQyxDQUFDLENBQUMsR0FBRyxDQUFDLENBQUE7SUFDbkIsR0FBRyxDQUFDLENBQUMsQ0FBQyxHQUFHLEdBQUcsQ0FBQyxDQUFDLENBQUMsR0FBRyxDQUFDLENBQUE7SUFDbkIsR0FBRyxDQUFDLEVBQUUsQ0FBQyxHQUFHLEdBQUcsQ0FBQyxFQUFFLENBQUMsR0FBRyxDQUFDLENBQUE7SUFDckIsR0FBRyxDQUFDLEVBQUUsQ0FBQyxHQUFHLEdBQUcsQ0FBQyxFQUFFLENBQUMsR0FBRyxDQUFDLENBQUE7SUFDckIsR0FBRyxDQUFDLEVBQUUsQ0FBQyxHQUFHLEdBQUcsQ0FBQyxFQUFFLENBQUMsQ0FBQTtJQUNqQixHQUFHLENBQUMsRUFBRSxDQUFDLEdBQUcsR0FBRyxDQUFDLEVBQUUsQ0FBQyxDQUFBO0lBQ2pCLEdBQUcsQ0FBQyxFQUFFLENBQUMs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QUNkLEVBQUUsSUFBSSxHQUFHLENBQUM7UUFDVixFQUFFLElBQUksR0FBRyxDQUFDO1FBQ1YsRUFBRSxJQUFJLEdBQUcsQ0FBQztJQUNkLENBQUM7SUFFRCxHQUFHLENBQUMsQ0FBQyxDQUFDLEdBQUcsRUFBRSxDQUFDO0lBQ1osR0FBRyxDQUFDLENBQUMsQ0FBQyxHQUFHLEVBQUUsQ0FBQztJQUNaLEdBQUcsQ0FBQyxDQUFDLENBQUMsR0FBRyxFQUFFLENBQUM7SUFDWixHQUFHLENBQUMsQ0FBQyxDQUFDLEdBQUcsQ0FBQyxDQUFDO0lBQ1gsR0FBRyxDQUFDLENBQUMsQ0FBQyxHQUFHLEVBQUUsQ0FBQztJQUNaLEdBQUcsQ0FBQyxDQUFDLENBQUMsR0FBRyxFQUFFLENBQUM7SUFDWixHQUFHLENBQUMsQ0FBQyxDQUFDLEdBQUcsRUFBRSxDQUFDO0lBQ1osR0FBRyxDQUFDLENBQUMsQ0FBQyxHQUFHLENBQUMsQ0FBQztJQUNYLEdBQUcsQ0FBQyxDQUFDLENBQUMsR0FBRyxFQUFFLENBQUM7SUFDWixHQUFHLENBQUMsQ0FBQyxDQUFDLEdBQUcsRUFBRSxDQUFDO0lBQ1osR0FBRyxDQUFDLEVBQUUsQ0FBQyxHQUFHLEVBQUUsQ0FBQztJQUNiLEdBQUcsQ0FBQyxFQUFFLENBQUMsR0FBRyxDQUFDLENBQUM7SUFDWixHQUFHLENBQUMsRUFBRSxDQUFDLEdBQUcsQ0FBQyxDQUFDLEVBQUUsR0FBRyxJQUFJLEdBQUcsRUFBRSxHQUFHLElBQUksR0FBRyxFQUFFLEdBQUcsSUFBSSxDQUFDLENBQUM7SUFDL0MsR0FBRyxDQUFDLEVBQUUsQ0FBQyxHQUFHLENBQUMsQ0FBQyxFQUFFLEdBQUcsSUFBSSxHQUFHLEVBQUUsR0FBRyxJQUFJLEdBQUcsRUFBRSxHQUFHLElBQUksQ0FBQyxDQUFDO0lBQy9DLEdBQUcsQ0FBQyxFQUFFLENBQUMsR0FBRyxDQUFDLENBQUMsRUFBRSxHQUFHLElBQUksR0FBRyxFQUFFLEdBQUcsSUFBSSxHQUFHLEVBQUUsR0FBRyxJQUFJLENBQUMsQ0FBQztJQUMvQyxHQUFHLENBQUMsRUFBRSxDQUFDLEdBQUcsQ0FBQyxDQUFDO0lBRVosTUFBTSxDQUFDLEdBQUcsQ0FBQztBQUNiLENBQUM7QUFyRkQsd0JBcUZDO0FBQUEsQ0FBQztBQUVGLHFCQUE2QixHQUFTLEVBQUUsSUFBWSxFQUFFLE1BQWMsRUFBRSxJQUFZLEVBQUUsR0FBVztJQUMzRixJQUFJLENBQUMsR0FBRyxHQUFHLEdBQUcsSUFBSSxDQUFDLEdBQUcsQ0FBQyxJQUFJLEdBQUcsQ0FBQyxDQUFDLEVBQzVCLEVBQUUsR0FBRyxDQUFDLEdBQUcsQ0FBQyxJQUFJLEdBQUcsR0FBRyxDQUFDLENBQUM7SUFDMUIsR0FBRyxDQUFDLENBQUMsQ0FBQyxHQUFHLENBQUMsR0FBRyxNQUFNLENBQUM7SUFDcEIsR0FBRyxDQUFDLENBQUMsQ0FBQyxHQUFHLENBQUMsQ0FBQztJQUNYLEdBQUcsQ0FBQyxDQUFDLENBQUMsR0FBRyxDQUFDLENBQUM7SUFDWCxHQUFHLENBQUMsQ0FBQyxDQUFDLEdBQUcsQ0FBQyxDQUFDO0lBQ1gsR0FBRyxDQUFDLENBQUMsQ0FBQyxHQUFHLENBQUMsQ0FBQztJQUNYLEdBQUcsQ0FBQyxDQUFDLENBQUMsR0FBRyxDQUFDLENBQUM7SUFDWCxHQUFHLENBQUMsQ0FBQyxDQUFDLEdBQUcsQ0FBQyxDQUFDO0lBQ1gsR0FBRyxDQUFDLENBQUMsQ0FBQyxHQUFHLENBQUMsQ0FBQztJQUNYLEdBQUcsQ0FBQyxDQUFDLENBQUMsR0FBRyxDQUFDLENBQUM7SUFDWCxHQUFHLENBQUMsQ0FBQyxDQUFDLEdBQUcsQ0FBQyxDQUFDO0lBQ1gsR0FBRyxDQUFDLEVBQUUsQ0FBQyxHQUFHLENBQUMsR0FBRyxHQUFHLElBQUksQ0FBQyxHQUFHLEVBQUUsQ0FBQztJQUM1QixHQUFHLENBQUMsRUFBRSxDQUFDLEdBQUcsQ0FBQyxDQUFDLENBQUM7SUFDYixHQUFHLENBQUMsRUFBRSxDQUFDLEdBQUcsQ0FBQyxDQUFDO0lBQ1osR0FBRyxDQUFDLEVBQUUsQ0FBQyxHQUFHLENBQUMsQ0FBQztJQUNaLEdBQUcsQ0FBQyxFQUFFLENBQUMsR0FBRyxDQUFDLENBQUMsR0FBRyxHQUFHLEdBQUcsSUFBSSxDQUFDLEdBQUcsRUFBRSxDQUFDO0lBQ2hDLEdBQUcsQ0FBQyxFQUFFLENBQUMsR0FBRyxDQUFDLENBQUM7SUFDWixNQUFNLENBQUMsR0FBRyxDQUFDO0FBQ2YsQ0FBQztBQXBCRCxrQ0FvQkM7QUFBQSxDQUFDO0FBRUYsZ0VBQWdFO0FBQ2hFLDBEQUEwRDtBQUMxRCwwREFBMEQ7QUFDMUQsNERBQTREO0FBQzVELDhEQUE4RDtBQUM5RCxHQUFHO0FBQ0gsMERBQTBEO0FBQzFELHlEQUF5RDtBQUN6RCxrREFBa0Q7QUFDbEQsa0RBQWtEO0FBQ2xELGtEQUFrRDtBQUNsRCxrREFBa0Q7QUFDbEQsR0FBRztBQUNILGtEQUFrRDtBQUNsRCxrREFBa0Q7QUFDbEQsa0RBQWtEO0FBQ2xELGtEQUFrRDtBQUNsRCxrREFBa0Q7QUFDbEQsR0FBRztBQUNILG9EQUFvRDtBQUNwRCxrREFBa0Q7QUFDbEQsa0RBQWtEO0FBQ2xELG1EQUFtRDtBQUNuRCxtREFBbUQ7QUFDbkQsR0FBRztBQUNILHNEQUFzRDtBQUN0RCxtREFBbUQ7QUFDbkQsbURBQW1EO0FBQ25ELG1EQUFtRDtBQUNuRCxtREFBbUQ7QUFDbkQsa0JBQWtCO0FBQ2xCLEtBQUs7Ozs7QUN0VUwscUNBRWlCO0FBQ2pCLHVDQUtrQjtBQWFMLFFBQUEsSUFBSSxHQUFHLENBQUMsQ0FBUyxFQUFFLENBQVMsRUFBRSxDQUFTLEVBQUUsQ0FBUyxLQUFjLENBQUM7SUFDNUUsSUFBSSxFQUFFLFFBQVE7SUFDZCxLQUFLLEVBQUUsQ0FBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLENBQUU7Q0FDdEIsQ0FBQyxDQUFBO0FBRVcsUUFBQSxRQUFRLEdBQUcsQ0FBQyxDQUFTLEVBQUUsQ0FBUyxFQUFFLENBQVMsS0FBZ0IsQ0FBQztJQUN2RSxJQUFJLEVBQUUsVUFBVTtJQUNoQixLQUFLLEVBQUUsQ0FBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsQ0FBRTtDQUNuQixDQUFDLENBQUE7QUFFVyxRQUFBLElBQUksR0FBRyxDQUFDLE9BQXNCLEtBQVksQ0FBQztJQUN0RCxJQUFJLEVBQUUsTUFBTTtJQUNaLEtBQUssRUFBRSxPQUFPO0NBQ2YsQ0FBQyxDQUFBO0FBRVcsUUFBQSxNQUFNLEdBQUcsQ0FBQyxDQUFTLEVBQUUsQ0FBUyxFQUFFLENBQVMsS0FBYyxDQUFDO0lBQ25FLElBQUksRUFBRSxRQUFRO0lBQ2QsS0FBSyxFQUFFLENBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLENBQUU7Q0FDbkIsQ0FBQyxDQUFBO0FBRVcsUUFBQSxPQUFPLEdBQUcsQ0FBQyxDQUFTLEtBQWUsQ0FBQztJQUMvQyxJQUFJLEVBQUUsU0FBUztJQUNmLEtBQUssRUFBRSxDQUFDO0NBQ1QsQ0FBQyxDQUFBO0FBU0YsTUFBTSxNQUFNLEdBQUcsQ0FBSyxDQUFZLEtBQWdCLGVBQU0sQ0FBQyxnQkFBTSxFQUFFLENBQUMsQ0FBQyxDQUFBO0FBQ2pFLE1BQU0sT0FBTyxHQUFHLGlCQUFPLENBQUMsQ0FBQyxFQUFFLENBQUMsRUFBRSxjQUFJLENBQUMsQ0FBQTtBQUNuQyxNQUFNLE9BQU8sR0FBRyxpQkFBTyxDQUFDLENBQUMsSUFBSSxJQUFJLENBQUMsQ0FBQTtBQUVsQyxNQUFNLFVBQVUsR0FDZCxjQUFLLENBQUMsQ0FBQyxDQUFDLEVBQUUsRUFBRSxFQUFFLEVBQUUsS0FBSyxDQUFDLEVBQUUsQ0FBQyxFQUFFLEVBQUUsRUFBRSxFQUFFLEVBQUUsQ0FBQyxFQUM5QixNQUFNLENBQUMsaUJBQU8sQ0FBQyxFQUNmLGtCQUFRLENBQUMsZUFBTSxDQUFDLGVBQUssRUFBRSxrQkFBUSxDQUFDLGlCQUFPLENBQUMsQ0FBQyxDQUFDLEVBQzFDLGtCQUFRLENBQUMsZUFBTSxDQUFDLGVBQUssRUFBRSxpQkFBTyxDQUFDLENBQUMsQ0FBQyxDQUFBO0FBRTVCLFFBQUEsTUFBTSxHQUNqQixjQUFLLENBQUMsWUFBSSxFQUNKLGVBQU0sQ0FBQyxpQkFBTyxDQUFDLEdBQUcsQ0FBQyxFQUFFLE1BQU0sQ0FBQyxjQUFJLENBQUMsQ0FBQyxFQUNsQyxNQUFNLENBQUMsY0FBSSxDQUFDLEVBQ1osTUFBTSxDQUFDLGNBQUksQ0FBQyxFQUNaLE1BQU0sQ0FBQyxtQkFBUyxDQUFDLGNBQUksRUFBRSxHQUFHLENBQUMsQ0FBQyxDQUFDLENBQUE7QUFFeEIsUUFBQSxRQUFRLEdBQ25CLGNBQUssQ0FBQyxnQkFBUSxFQUNSLGVBQU0sQ0FBQyxlQUFLLENBQUMsSUFBSSxDQUFDLEVBQUUsTUFBTSxDQUFDLE9BQU8sQ0FBQyxDQUFDLEVBQ3BDLE1BQU0sQ0FBQyxPQUFPLENBQUMsRUFDZixNQUFNLENBQUMsbUJBQVMsQ0FBQyxPQUFPLEVBQUUsR0FBRyxDQUFDLENBQUMsQ0FBQyxDQUFBO0FBRTNCLFFBQUEsTUFBTSxHQUNqQixjQUFLLENBQUMsY0FBTSxFQUNOLGVBQU0sQ0FBQyxlQUFLLENBQUMsSUFBSSxDQUFDLEVBQUUsTUFBTSxDQUFDLGNBQUksQ0FBQyxDQUFDLEVBQ2pDLE1BQU0sQ0FBQyxjQUFJLENBQUMsRUFDWixNQUFNLENBQUMsY0FBSSxDQUFDLENBQUMsQ0FBQTtBQUVSLFFBQUEsSUFBSSxHQUNmLGFBQUksQ0FBQyxZQUFJLEVBQUUsZUFBTSxDQUFDLGVBQUssQ0FBQyxHQUFHLENBQUMsRUFBRSxrQkFBUSxDQUFDLENBQUMsRUFBRSxNQUFNLENBQUMsVUFBVSxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUE7QUFFcEQsUUFBQSxPQUFPLEdBQ2xCLGFBQUksQ0FBQyxlQUFPLEVBQUUsYUFBSSxDQUFDLEVBQUUsSUFBSSxFQUFFLENBQUMsSUFBSSxDQUFDLEVBQUUsQ0FBQyxFQUFFLGVBQUssQ0FBQyxPQUFPLENBQUMsQ0FBQyxDQUFDLENBQUE7QUFFM0MsUUFBQSxJQUFJLEdBQ2YsZUFBSyxDQUFDLENBQUUsY0FBTSxFQUFFLGdCQUFRLEVBQUUsY0FBTSxFQUFFLFlBQUksRUFBRSxlQUFPLENBQUUsQ0FBQyxDQUFBO0FBRXBELHlCQUEwQixLQUFhO0lBQ3JDLE1BQU0sU0FBUyxHQUFTLEVBQUUsQ0FBQTtJQUMxQixNQUFNLFFBQVEsR0FBUyxFQUFFLENBQUE7SUFDekIsTUFBTSxVQUFVLEdBQVMsRUFBRSxDQUFBO0lBQzNCLE1BQU0sTUFBTSxHQUFrQixFQUFFLENBQUE7SUFFaEMsR0FBRyxDQUFDLENBQUUsSUFBSSxDQUFDLEdBQUcsQ0FBQyxFQUFFLENBQUMsR0FBRyxLQUFLLENBQUMsTUFBTSxFQUFFLENBQUMsRUFBRSxFQUFFLENBQUM7UUFDdkMsSUFBSSxDQUFDLEdBQUcsS0FBSyxDQUFDLENBQUMsQ0FBQyxDQUFBO1FBRWhCLEVBQUUsQ0FBTSxDQUFFLENBQUMsQ0FBQyxJQUFJLEtBQUssUUFBUyxDQUFDO1lBQUcsU0FBUyxDQUFDLElBQUksQ0FBQyxDQUFDLENBQUMsS0FBSyxDQUFDLENBQUE7UUFDekQsSUFBSSxDQUFDLEVBQUUsQ0FBQyxDQUFFLENBQUMsQ0FBQyxJQUFJLEtBQUssUUFBUyxDQUFDO1lBQUcsUUFBUSxDQUFDLElBQUksQ0FBQyxDQUFDLENBQUMsS0FBSyxDQUFDLENBQUE7UUFDeEQsSUFBSSxDQUFDLEVBQUUsQ0FBQyxDQUFFLENBQUMsQ0FBQyxJQUFJLEtBQUssVUFBVyxDQUFDO1lBQUMsVUFBVSxDQUFDLElBQUksQ0FBQyxDQUFDLENBQUMsS0FBSyxDQUFDLENBQUE7UUFDMUQsSUFBSSxDQUFDLEVBQUUsQ0FBQyxDQUFFLENBQUMsQ0FBQyxJQUFJLEtBQUssTUFBTyxDQUFDO1lBQUssTUFBTSxDQUFDLElBQUksQ0FBQyxHQUFHLENBQUMsQ0FBQyxLQUFLLENBQUMsQ0FBQTtRQUN6RCxJQUFJLENBQUMsQ0FBQyxDQUFBLENBQUM7SUFDVCxDQUFDO0lBQ0QsTUFBTSxRQUFRLEdBQUcsSUFBSSxLQUFLLENBQUMsTUFBTSxDQUFDLE1BQU0sR0FBRyxDQUFDLENBQUMsQ0FBQTtJQUM3QyxNQUFNLE9BQU8sR0FBRyxJQUFJLEtBQUssQ0FBQyxNQUFNLENBQUMsTUFBTSxHQUFHLENBQUMsQ0FBQyxDQUFBO0lBQzVDLE1BQU0sU0FBUyxHQUFHLElBQUksS0FBSyxDQUFDLE1BQU0sQ0FBQyxNQUFNLEdBQUcsQ0FBQyxDQUFDLENBQUE7SUFDOUMsTUFBTSxhQUFhLEdBQUcsQ0FBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsQ0FBRSxDQUFBO0lBQ2pDLE1BQU0sZUFBZSxHQUFHLENBQUUsQ0FBQyxFQUFFLENBQUMsQ0FBRSxDQUFBO0lBRWhDLEdBQUcsQ0FBQyxDQUFFLElBQUksQ0FBQyxHQUFHLENBQUMsRUFBRSxDQUFDLEdBQUcsTUFBTSxDQUFDLE1BQU0sRUFBRSxDQUFDLEVBQUUsRUFBRSxDQUFDO1FBQ3hDLElBQUksRUFBRSxDQUFDLEVBQUUsRUFBRSxFQUFFLEVBQUUsRUFBRSxHQUFHLE1BQU0sQ0FBQyxDQUFDLENBQUMsQ0FBQTtRQUM3QixJQUFJLElBQUksR0FBRyxTQUFTLENBQUMsQ0FBQyxHQUFHLENBQUMsQ0FBQyxDQUFBO1FBQzNCLElBQUksTUFBTSxHQUFHLEVBQUUsSUFBSSxJQUFJLEdBQUcsUUFBUSxDQUFDLEVBQUUsR0FBRyxDQUFDLENBQUMsR0FBRyxhQUFhLENBQUE7UUFDMUQsSUFBSSxRQUFRLEdBQUcsRUFBRSxJQUFJLElBQUksR0FBRyxVQUFVLENBQUMsRUFBRSxHQUFHLENBQUMsQ0FBQyxHQUFHLGVBQWUsQ0FBQTtRQUVoRSxRQUFRLENBQUMsQ0FBQyxHQUFHLENBQUMsQ0FBQyxHQUFRLElBQUksQ0FBQyxDQUFDLENBQUMsQ0FBQTtRQUM5QixRQUFRLENBQUMsQ0FBQyxHQUFHLENBQUMsR0FBRyxDQUFDLENBQUMsR0FBSSxJQUFJLENBQUMsQ0FBQyxDQUFDLENBQUE7UUFDOUIsUUFBUSxDQUFDLENBQUMsR0FBRyxDQUFDLEdBQUcsQ0FBQyxDQUFDLEdBQUksSUFBSSxDQUFDLENBQUMsQ0FBQyxDQUFBO1FBQzlCLE9BQU8sQ0FBQyxDQUFDLEdBQUcsQ0FBQyxDQUFDLEdBQVMsTUFBTSxDQUFDLENBQUMsQ0FBQyxDQUFBO1FBQ2hDLE9BQU8sQ0FBQyxDQUFDLEdBQUcsQ0FBQyxHQUFHLENBQUMsQ0FBQyxHQUFLLE1BQU0sQ0FBQyxDQUFDLENBQUMsQ0FBQTtRQUNoQyxPQUFPLENBQUMsQ0FBQyxHQUFHLENBQUMsR0FBRyxDQUFDLENBQUMsR0FBSyxNQUFNLENBQUMsQ0FBQyxDQUFDLENBQUE7UUFDaEMsU0FBUyxDQUFDLENBQUMsR0FBRyxDQUFDLENBQUMsR0FBTyxRQUFRLENBQUMsQ0FBQyxDQUFDLENBQUE7UUFDbEMsU0FBUyxDQUFDLENBQUMsR0FBRyxDQUFDLEdBQUcsQ0FBQyxDQUFDLEdBQUcsUUFBUSxDQUFDLENBQUMsQ0FBQyxDQUFBO0lBQ3BDLENBQUM7SUFDRCxNQUFNLENBQUMsRUFBRSxRQUFRLEVBQUUsT0FBTyxFQUFFLFNBQVMsRUFBRSxDQUFBO0FBQ3pDLENBQUM7QUFFWSxRQUFBLFFBQVEsR0FDbkIsYUFBSSxDQUFDLGVBQWUsRUFBRSx1QkFBYSxDQUFDLFlBQUksRUFBRSxjQUFJLENBQUMsaUJBQU8sQ0FBQyxDQUFDLENBQUMsQ0FBQTs7OztBQ3hIM0Q7SUFFRSxZQUFtQixHQUFNLEVBQVMsSUFBWTtRQUEzQixRQUFHLEdBQUgsR0FBRyxDQUFHO1FBQVMsU0FBSSxHQUFKLElBQUksQ0FBUTtRQUQ5QyxZQUFPLEdBQVMsSUFBSSxDQUFBO0lBQzZCLENBQUM7Q0FDbkQ7QUFIRCx3QkFHQztBQUVEO0lBRUUsWUFBbUIsT0FBZTtRQUFmLFlBQU8sR0FBUCxPQUFPLENBQVE7UUFEbEMsWUFBTyxHQUFVLEtBQUssQ0FBQTtJQUNlLENBQUM7Q0FDdkM7QUFIRCxrQkFHQztBQU1ELGNBQXlCLENBQUk7SUFDM0IsTUFBTSxDQUFDLENBQUMsQ0FBUyxLQUFLLElBQUksTUFBTSxDQUFDLENBQUMsRUFBRSxDQUFDLENBQUMsQ0FBQTtBQUN4QyxDQUFDO0FBRkQsb0JBRUM7QUFFRCxnQkFBd0IsR0FBVztJQUNqQyxNQUFNLENBQUMsQ0FBQyxDQUFTLEtBQUssSUFBSSxHQUFHLENBQUMsR0FBRyxDQUFDLENBQUE7QUFDcEMsQ0FBQztBQUZELHdCQUVDO0FBRUQsY0FBNEIsQ0FBYyxFQUFFLEVBQWE7SUFDdkQsTUFBTSxDQUFDLE9BQU8sQ0FBQyxFQUFFLEVBQUUsQ0FBQyxJQUFJLElBQUksQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFBO0FBQ3JDLENBQUM7QUFGRCxvQkFFQztBQUVELGVBQTZCLEVBQXVCLEVBQUUsRUFBYTtJQUNqRSxNQUFNLENBQUMsT0FBTyxDQUFDLEVBQUUsRUFBRSxDQUFDLElBQUksSUFBSSxDQUFDLENBQUMsRUFBRSxFQUFFLENBQUMsQ0FBQyxDQUFBO0FBQ3RDLENBQUM7QUFGRCxzQkFFQztBQUVELGNBQTRCLENBQWMsRUFBRSxFQUFhO0lBQ3ZELE1BQU0sQ0FBQyxLQUFLLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQyxFQUFFLEVBQUUsQ0FBQyxDQUFBO0FBQzNCLENBQUM7QUFGRCxvQkFFQztBQUVELGVBQWdDLENBQW9CLEVBQUUsRUFBYSxFQUFFLEVBQWE7SUFDaEYsTUFBTSxDQUFDLEtBQUssQ0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFJLEtBQUssQ0FBQyxDQUFJLEtBQUssQ0FBQyxDQUFDLENBQUMsRUFBRSxDQUFDLENBQUMsRUFBRSxFQUFFLENBQUMsRUFBRSxFQUFFLENBQUMsQ0FBQTtBQUN6RCxDQUFDO0FBRkQsc0JBRUM7QUFFRCxlQUNDLENBQTBCLEVBQUUsRUFBYSxFQUFFLEVBQWEsRUFBRSxFQUFhO0lBQ3RFLE1BQU0sS0FBSyxHQUFHLENBQUMsQ0FBSSxLQUFLLENBQUMsQ0FBSSxLQUFLLENBQUMsQ0FBSSxLQUFLLENBQUMsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsQ0FBQyxDQUFBO0lBRXRELE1BQU0sQ0FBQyxLQUFLLENBQUMsS0FBSyxDQUFDLElBQUksQ0FBQyxLQUFLLEVBQUUsRUFBRSxDQUFDLEVBQUUsRUFBRSxDQUFDLEVBQUUsRUFBRSxDQUFDLENBQUE7QUFDOUMsQ0FBQztBQUxELHNCQUtDO0FBRUQsZUFBc0MsQ0FBZ0MsRUFBRSxFQUFhLEVBQUUsRUFBYSxFQUFFLEVBQWEsRUFBRSxFQUFhO0lBQ2hJLE1BQU0sS0FBSyxHQUFHLENBQUMsQ0FBSSxLQUFLLENBQUMsQ0FBSSxLQUFLLENBQUMsQ0FBSSxLQUFLLENBQUMsQ0FBSSxLQUFLLENBQUMsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLENBQUMsQ0FBQTtJQUVuRSxNQUFNLENBQUMsS0FBSyxDQUFDLEtBQUssQ0FBQyxLQUFLLENBQUMsSUFBSSxDQUFDLEtBQUssRUFBRSxFQUFFLENBQUMsRUFBRSxFQUFFLENBQUMsRUFBRSxFQUFFLENBQUMsRUFBRSxFQUFFLENBQUMsQ0FBQTtBQUN6RCxDQUFDO0FBSkQsc0JBSUM7QUFFRCxpQkFBK0IsRUFBYSxFQUFFLENBQXNCO0lBQ2xFLE1BQU0sQ0FBQyxVQUFVLENBQVM7UUFDeEIsTUFBTSxHQUFHLEdBQUcsRUFBRSxDQUFDLENBQUMsQ0FBQyxDQUFBO1FBRWpCLE1BQU0sQ0FBQyxHQUFHLENBQUMsT0FBTztjQUNkLENBQUMsQ0FBQyxHQUFHLENBQUMsR0FBRyxDQUFDLENBQUMsR0FBRyxDQUFDLElBQUksQ0FBQztjQUNwQixJQUFJLEdBQUcsQ0FBQyxHQUFHLENBQUMsT0FBTyxDQUFDLENBQUE7SUFDMUIsQ0FBQyxDQUFBO0FBQ0gsQ0FBQztBQVJELDBCQVFDO0FBRUQsZ0JBQThCLEVBQWEsRUFBRSxFQUFhO0lBQ3hELE1BQU0sQ0FBQyxPQUFPLENBQUMsRUFBRSxFQUFFLENBQUMsSUFBSSxFQUFFLENBQUMsQ0FBQTtBQUM3QixDQUFDO0FBRkQsd0JBRUM7Ozs7QUMxRUQsNkNBQWdEO0FBQ2hELHFDQUE0RjtBQUU1RixpQkFBeUIsQ0FBeUI7SUFDaEQsTUFBTSxDQUFDLFVBQVUsR0FBVztRQUMxQixFQUFFLENBQU0sQ0FBRSxHQUFHLENBQUMsTUFBTSxLQUFLLENBQUUsQ0FBQztZQUFHLE1BQU0sQ0FBQyxJQUFJLFlBQUcsQ0FBQyxvQkFBb0IsQ0FBQyxDQUFBO1FBQ25FLElBQUksQ0FBQyxFQUFFLENBQUMsQ0FBRSxDQUFDLENBQUMsR0FBRyxDQUFDLEtBQUssQ0FBQyxDQUFDLEVBQUUsQ0FBQyxDQUFDLENBQUUsQ0FBQztZQUFDLE1BQU0sQ0FBQyxJQUFJLGVBQU0sQ0FBQyxHQUFHLENBQUMsS0FBSyxDQUFDLENBQUMsRUFBRSxDQUFDLENBQUMsRUFBRSxHQUFHLENBQUMsS0FBSyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUE7UUFDL0UsSUFBSTtZQUEyQixNQUFNLENBQUMsSUFBSSxZQUFHLENBQUMsR0FBSSxHQUFHLENBQUMsQ0FBQyxDQUFFLGtCQUFrQixDQUFDLENBQUE7SUFDOUUsQ0FBQyxDQUFBO0FBQ0gsQ0FBQztBQU5ELDBCQU1DO0FBRUQsaUJBQXlCLFNBQWlCO0lBQ3hDLE1BQU0sQ0FBQyxPQUFPLENBQUMsQ0FBQyxJQUFJLENBQUMsS0FBSyxTQUFTLENBQUMsQ0FBQTtBQUN0QyxDQUFDO0FBRkQsMEJBRUM7QUFFRCxlQUF1QixNQUFjO0lBQ25DLE1BQU0sQ0FBQyxVQUFVLENBQVM7UUFDeEIsR0FBRyxDQUFDLENBQUUsSUFBSSxDQUFDLEdBQUcsQ0FBQyxFQUFFLENBQUMsR0FBRyxNQUFNLENBQUMsTUFBTSxFQUFFLENBQUMsRUFBRSxFQUFHLENBQUM7WUFDekMsRUFBRSxDQUFDLENBQUUsQ0FBQyxDQUFDLENBQUMsQ0FBQyxLQUFLLE1BQU0sQ0FBQyxDQUFDLENBQUUsQ0FBQztnQkFBQyxNQUFNLENBQUMsSUFBSSxZQUFHLENBQUMsR0FBSSxDQUFDLENBQUMsQ0FBQyxDQUFFLGtCQUFtQixNQUFNLENBQUMsQ0FBQyxDQUFFLEVBQUUsQ0FBQyxDQUFBO1FBQ3BGLENBQUM7UUFDRCxNQUFNLENBQUMsSUFBSSxlQUFNLENBQUMsQ0FBQyxDQUFDLEtBQUssQ0FBQyxDQUFDLEVBQUUsTUFBTSxDQUFDLE1BQU0sQ0FBQyxFQUFFLENBQUMsQ0FBQyxLQUFLLENBQUMsTUFBTSxDQUFDLE1BQU0sQ0FBQyxDQUFDLENBQUE7SUFDdEUsQ0FBQyxDQUFBO0FBQ0gsQ0FBQztBQVBELHNCQU9DO0FBRUQsY0FBc0IsQ0FBUztJQUM3QixNQUFNLENBQUMsSUFBSSxlQUFNLENBQUMsQ0FBQyxDQUFDLE1BQU0sRUFBRSxDQUFDLENBQUMsQ0FBQTtBQUNoQyxDQUFDO0FBRkQsb0JBRUM7QUFFRCxhQUFxQixDQUFTO0lBQzVCLE1BQU0sQ0FBQyxDQUFDLENBQUMsTUFBTSxLQUFLLENBQUMsR0FBRyxJQUFJLGVBQU0sQ0FBQyxJQUFJLEVBQUUsRUFBRSxDQUFDLEdBQUcsSUFBSSxZQUFHLENBQUMsQ0FBQyxHQUFHLG9CQUFvQixDQUFDLENBQUE7QUFDbEYsQ0FBQztBQUZELGtCQUVDO0FBRUQsaUJBQXlCLENBQXlCO0lBQ2hELE1BQU0sQ0FBQyxVQUFVLENBQVM7UUFDeEIsR0FBRyxDQUFDLENBQUUsSUFBSSxDQUFDLEdBQUcsQ0FBQyxFQUFFLENBQUMsR0FBRyxDQUFDLENBQUMsTUFBTSxFQUFFLENBQUMsRUFBRSxFQUFFLENBQUM7WUFDbkMsRUFBRSxDQUFDLENBQUUsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFFLENBQUM7Z0JBQUMsS0FBSyxDQUFBO1FBQ3ZCLENBQUM7UUFDRCxNQUFNLENBQUMsSUFBSSxlQUFNLENBQUMsQ0FBQyxDQUFDLEtBQUssQ0FBQyxDQUFDLEVBQUUsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxDQUFDLEtBQUssQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFBO0lBQzlDLENBQUMsQ0FBQTtBQUNILENBQUM7QUFQRCwwQkFPQztBQUVELGtCQUEwQixDQUF5QjtJQUNqRCxNQUFNLENBQUMsZ0JBQU8sQ0FBQyxPQUFPLENBQUMsQ0FBQyxDQUFDLEVBQVksQ0FBQyxJQUMvQixnQkFBTyxDQUFDLE9BQU8sQ0FBQyxDQUFDLENBQUMsRUFBRSxFQUFFLElBQ3RCLGFBQUksQ0FBQyxDQUFDLEdBQUcsRUFBRSxDQUFDLENBQUMsQ0FBQyxDQUFBO0FBQ3ZCLENBQUM7QUFKRCw0QkFJQztBQUVELHlCQUFpQyxDQUFTLEVBQUUsQ0FBeUI7SUFDbkUsTUFBTSxDQUFDLFVBQVUsQ0FBUztRQUN4QixFQUFFLENBQUMsQ0FBRSxDQUFDLEdBQUcsQ0FBRSxDQUFDO1lBQVEsTUFBTSxDQUFDLElBQUksWUFBRyxDQUFDLGdCQUFnQixDQUFDLENBQUE7UUFDcEQsRUFBRSxDQUFDLENBQUUsQ0FBQyxDQUFDLE1BQU0sR0FBRyxDQUFFLENBQUM7WUFBQyxNQUFNLENBQUMsSUFBSSxZQUFHLENBQUMsdUJBQXVCLENBQUMsQ0FBQTtRQUUzRCxHQUFHLENBQUMsQ0FBRSxJQUFJLENBQUMsR0FBRyxDQUFDLEVBQUUsQ0FBQyxHQUFHLENBQUMsRUFBRSxDQUFDLEVBQUUsRUFBRyxDQUFDO1lBQzdCLEVBQUUsQ0FBQyxDQUFFLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBRSxDQUFDO2dCQUFDLE1BQU0sQ0FBQyxJQUFJLFlBQUcsQ0FBQyxHQUFJLENBQUMsQ0FBQyxDQUFDLENBQUUsa0JBQWtCLENBQUMsQ0FBQTtRQUM3RCxDQUFDO1FBQ0QsTUFBTSxDQUFDLE9BQU8sQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQTtJQUN0QixDQUFDLENBQUE7QUFDSCxDQUFDO0FBVkQsMENBVUM7QUFFRCxjQUF5QixDQUFZO0lBQ25DLE1BQU0sQ0FBQyxVQUFVLENBQVM7UUFDeEIsSUFBSSxNQUFrQixDQUFBO1FBQ3RCLElBQUksR0FBRyxHQUFRLEVBQUUsQ0FBQTtRQUNqQixJQUFJLFNBQVMsR0FBRyxDQUFDLENBQUE7UUFFakIsT0FBUSxJQUFJLEVBQUcsQ0FBQztZQUNkLE1BQU0sR0FBRyxDQUFDLENBQUMsU0FBUyxDQUFDLENBQUE7WUFDckIsRUFBRSxDQUFDLENBQUUsQ0FBQyxNQUFNLENBQUMsT0FBUSxDQUFDO2dCQUFDLEtBQUssQ0FBQTtZQUM1QixHQUFHLENBQUMsSUFBSSxDQUFDLE1BQU0sQ0FBQyxHQUFHLENBQUMsQ0FBQTtZQUNwQixTQUFTLEdBQUcsTUFBTSxDQUFDLElBQUksQ0FBQTtRQUN6QixDQUFDO1FBQ0QsTUFBTSxDQUFDLElBQUksZUFBTSxDQUFDLEdBQUcsRUFBRSxTQUFTLENBQUMsQ0FBQTtJQUNuQyxDQUFDLENBQUE7QUFDSCxDQUFDO0FBZEQsb0JBY0M7QUFFRCxlQUEwQixDQUFZO0lBQ3BDLE1BQU0sQ0FBQyxnQkFBTyxDQUFDLENBQUMsRUFBUyxDQUFDLElBQ25CLGdCQUFPLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQyxFQUFFLEVBQUUsSUFDbkIsYUFBSSxDQUFDLENBQUUsQ0FBQyxFQUFFLEdBQUcsRUFBRSxDQUFFLENBQUMsQ0FBQyxDQUFDLENBQUE7QUFDN0IsQ0FBQztBQUpELHNCQUlDO0FBRUQsa0JBQWdDLENBQVksRUFBRSxHQUFjO0lBQzFELE1BQU0sSUFBSSxHQUFnQixFQUFFLENBQzFCLGdCQUFPLENBQUMsR0FBRyxFQUFFLENBQUMsSUFBSSxhQUFJLENBQUMsRUFBUyxDQUFDLENBQUMsRUFDbEMsZ0JBQU8sQ0FBQyxDQUFDLEVBQUUsQ0FBQyxJQUFJLGdCQUFPLENBQUMsSUFBSSxFQUFFLEVBQUUsSUFBSSxhQUFJLENBQUMsQ0FBRSxDQUFDLENBQUUsQ0FBQyxNQUFNLENBQUMsRUFBRSxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQTtJQUUvRCxNQUFNLENBQUMsSUFBSSxDQUFBO0FBQ2IsQ0FBQztBQU5ELDRCQU1DO0FBRUQsa0JBQTZCLENBQVMsRUFBRSxDQUFZO0lBQ2xELE1BQU0sQ0FBQyxnQkFBTyxDQUFDLElBQUksQ0FBQyxDQUFDLENBQUMsRUFDZixFQUFFLElBQUksRUFBRSxDQUFDLE1BQU0sSUFBSSxDQUFDLEdBQUcsYUFBSSxDQUFDLEVBQUUsQ0FBQyxHQUFHLGVBQU0sQ0FBQyxvQkFBb0IsQ0FBZ0IsQ0FBQyxDQUFBO0FBQ3ZGLENBQUM7QUFIRCw0QkFHQztBQUVELGlCQUFrQyxLQUFnQixFQUFFLENBQVksRUFBRSxNQUFpQjtJQUNqRixNQUFNLENBQUMsZ0JBQU8sQ0FBQyxlQUFNLENBQUMsS0FBSyxFQUFFLENBQUMsQ0FBQyxFQUFFLEdBQUcsSUFDN0IsZ0JBQU8sQ0FBQyxNQUFNLEVBQVksQ0FBQyxJQUMzQixhQUFJLENBQUMsR0FBRyxDQUFDLENBQUMsQ0FBQyxDQUFBO0FBQ3BCLENBQUM7QUFKRCwwQkFJQztBQUVELGdCQUFpQyxLQUFnQixFQUFFLENBQVksRUFBRSxNQUFpQjtJQUNoRixNQUFNLENBQUMsZ0JBQU8sQ0FBQyxLQUFLLEVBQUcsQ0FBQyxJQUNqQixlQUFNLENBQUMsQ0FBQyxFQUNSLGdCQUFPLENBQUMsTUFBTSxFQUFFLENBQUMsSUFDakIsYUFBSSxDQUFDLENBQUUsQ0FBQyxFQUFFLENBQUMsQ0FBYyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUE7QUFDdEMsQ0FBQztBQUxELHdCQUtDO0FBRUQscUJBQW1DLENBQVksRUFBRSxHQUFjO0lBQzdELE1BQU0sQ0FBQyxnQkFBTyxDQUFDLENBQUMsRUFBc0IsS0FBSyxJQUNwQyxnQkFBTyxDQUFDLEtBQUssQ0FBQyxlQUFNLENBQUMsR0FBRyxFQUFFLENBQUMsQ0FBQyxDQUFDLEVBQUUsS0FBSyxJQUNwQyxhQUFJLENBQUMsQ0FBRSxLQUFLLEVBQUUsR0FBRyxLQUFLLENBQUUsQ0FBQyxDQUFDLENBQUMsQ0FBQTtBQUNwQyxDQUFDO0FBSkQsa0NBSUM7QUFFRCx1QkFBcUMsQ0FBWSxFQUFFLEdBQWM7SUFDL0QsTUFBTSxDQUFDLGdCQUFPLENBQUMsS0FBSyxDQUFDLGVBQU0sQ0FBQyxHQUFHLEVBQUUsQ0FBQyxDQUFDLENBQUMsRUFBRSxFQUFFLElBQ2pDLGdCQUFPLENBQUMsR0FBRyxFQUFxQixDQUFDLElBQ2pDLGFBQUksQ0FBQyxFQUFFLENBQUMsQ0FBQyxDQUFDLENBQUE7QUFDbkIsQ0FBQztBQUpELHNDQUlDO0FBRUQsbUJBQThCLENBQVksRUFBRSxJQUFPO0lBQ2pELE1BQU0sQ0FBQyxFQUFFLENBQUMsQ0FBQyxFQUFFLGFBQUksQ0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFBO0FBQzFCLENBQUM7QUFGRCw4QkFFQztBQUVELFlBQXVCLEVBQWEsRUFBRSxFQUFhO0lBQ2pELE1BQU0sQ0FBQyxVQUFVLENBQVM7UUFDeEIsTUFBTSxJQUFJLEdBQUcsRUFBRSxDQUFDLENBQUMsQ0FBQyxDQUFBO1FBRWxCLE1BQU0sQ0FBQyxJQUFJLENBQUMsT0FBTyxHQUFHLElBQUksR0FBRyxFQUFFLENBQUMsQ0FBQyxDQUFDLENBQUE7SUFDcEMsQ0FBQyxDQUFBO0FBQ0gsQ0FBQztBQU5ELGdCQU1DO0FBRUQsa0JBQThCLENBQVk7SUFDeEMsTUFBTSxDQUFDLFNBQVMsQ0FBQyxDQUFDLEVBQUUsU0FBUyxDQUFDLENBQUE7QUFDaEMsQ0FBQztBQUZELDRCQUVDO0FBRUQsZUFBMEIsQ0FBRSxJQUFJLEVBQUUsR0FBRyxJQUFJLENBQWU7SUFDdEQsRUFBRSxDQUFDLENBQUUsSUFBSSxJQUFJLElBQUssQ0FBQztRQUFDLE1BQU0sQ0FBQyxlQUFNLENBQUMsY0FBYyxDQUFjLENBQUE7SUFDOUQsSUFBSTtRQUFnQixNQUFNLENBQUMsRUFBRSxDQUFDLElBQUksRUFBRSxLQUFLLENBQUMsSUFBSSxDQUFDLENBQWMsQ0FBQTtBQUMvRCxDQUFDO0FBSEQsc0JBR0M7QUFFRCxnQkFBd0IsQ0FBRSxJQUFJLEVBQUUsR0FBRyxJQUFJLENBQW9CO0lBQ3pELEVBQUUsQ0FBQyxDQUFFLElBQUksSUFBSSxJQUFLLENBQUM7UUFBQyxNQUFNLENBQUMsYUFBSSxDQUFDLEVBQUUsQ0FBQyxDQUFBO0lBQ25DLElBQUk7UUFBZ0IsTUFBTSxDQUFDLGdCQUFPLENBQUMsSUFBSSxFQUFXLEdBQUcsSUFDMUIsZ0JBQU8sQ0FBQyxNQUFNLENBQUMsSUFBSSxDQUFDLEVBQUUsSUFBSSxJQUMxQixhQUFJLENBQUMsR0FBRyxHQUFHLElBQUksQ0FBQyxDQUFDLENBQUMsQ0FBQTtBQUMvQyxDQUFDO0FBTEQsd0JBS0M7QUFFRCxpQkFBeUIsR0FBVyxFQUFFLEdBQVcsRUFBRSxDQUFpQjtJQUNsRSxNQUFNLENBQUMsZ0JBQU8sQ0FBQyxDQUFDLEVBQ1IsQ0FBQyxJQUFJLENBQUMsSUFBSSxHQUFHLElBQUksQ0FBQyxJQUFJLEdBQUc7VUFDckIsYUFBSSxDQUFDLENBQUMsQ0FBQztVQUNQLGVBQU0sQ0FBQyxjQUFjLENBQW1CLENBQUMsQ0FBQTtBQUN2RCxDQUFDO0FBTEQsMEJBS0M7QUFFWSxRQUFBLElBQUksR0FBRyxPQUFPLENBQUMsR0FBRyxDQUFDLENBQUE7QUFDbkIsUUFBQSxHQUFHLEdBQUcsT0FBTyxDQUFDLEdBQUcsQ0FBQyxDQUFBO0FBQ2xCLFFBQUEsS0FBSyxHQUFHLE9BQU8sQ0FBQyxHQUFHLENBQUMsQ0FBQTtBQUNwQixRQUFBLFNBQVMsR0FBRyxPQUFPLENBQUMsSUFBSSxDQUFDLENBQUE7QUFDekIsUUFBQSxLQUFLLEdBQUcsT0FBTyxDQUFDLG9CQUFPLENBQUMsQ0FBQTtBQUN4QixRQUFBLEdBQUcsR0FBRyxPQUFPLENBQUMscUJBQVEsQ0FBQyxDQUFBO0FBQ3ZCLFFBQUEsUUFBUSxHQUFHLE9BQU8sQ0FBQyxDQUFDLElBQUkscUJBQVEsQ0FBQyxDQUFDLENBQUMsSUFBSSxvQkFBTyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUE7QUFDbEQsUUFBQSxNQUFNLEdBQUcsT0FBTyxDQUFDLG9CQUFPLENBQUMsQ0FBQTtBQUN6QixRQUFBLElBQUksR0FBRyxPQUFPLENBQUMscUJBQVEsQ0FBQyxDQUFBO0FBQ3hCLFFBQUEsU0FBUyxHQUFHLE9BQU8sQ0FBQyxDQUFDLElBQUkscUJBQVEsQ0FBQyxDQUFDLENBQUMsSUFBSSxvQkFBTyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUE7QUFDbkQsUUFBQSxLQUFLLEdBQUcsT0FBTyxDQUFDLEdBQUcsQ0FBQyxDQUFBO0FBQ3BCLFFBQUEsTUFBTSxHQUFHLE9BQU8sQ0FBQyxDQUFDLElBQUksQ0FBQyxLQUFLLEdBQUcsQ0FBQyxDQUFBO0FBQ2hDLFFBQUEsT0FBTyxHQUFHLEtBQUssQ0FBQyxDQUFFLE9BQU8sQ0FBQyxJQUFJLENBQUMsRUFBRSxPQUFPLENBQUMsSUFBSSxDQUFDLEVBQUUsS0FBSyxDQUFDLE1BQU0sQ0FBQyxFQUFFLE9BQU8sQ0FBQyxJQUFJLENBQUMsQ0FBRSxDQUFDLENBQUE7QUFDL0UsUUFBQSxPQUFPLEdBQUcsYUFBSSxDQUFDLE1BQU0sRUFBRSxNQUFNLENBQUM7SUFDekMsU0FBUyxDQUFDLFlBQUksRUFBRSxFQUFFLENBQUM7SUFDbkIsZUFBZSxDQUFDLENBQUMsRUFBRSxxQkFBUSxDQUFDO0NBQUUsQ0FBQyxDQUFDLENBQUE7QUFDckIsUUFBQSxJQUFJLEdBQUcsYUFBSSxDQUFDLE1BQU0sRUFBRSxNQUFNLENBQUM7SUFDdEMsU0FBUyxDQUFDLFlBQUksRUFBRSxFQUFFLENBQUM7SUFDbkIsZUFBZSxDQUFDLENBQUMsRUFBRSxxQkFBUSxDQUFDO0lBQzVCLFdBQUc7SUFDSCxlQUFlLENBQUMsQ0FBQyxFQUFFLHFCQUFRLENBQUM7Q0FBRSxDQUFDLENBQUMsQ0FBQTs7OztBQzlLbEMsaUJBQXlCLENBQVM7SUFDaEMsTUFBTSxFQUFFLEdBQUcsQ0FBQyxDQUFDLFVBQVUsQ0FBQyxDQUFDLENBQUMsQ0FBQTtJQUUxQixNQUFNLENBQUMsQ0FBQyxLQUFLLENBQUMsRUFBRSxDQUFDLElBQUksQ0FBQyxDQUFFLEVBQUUsSUFBSSxFQUFFLElBQUksRUFBRSxJQUFJLEVBQUUsQ0FBRSxJQUFJLENBQUUsRUFBRSxJQUFJLEVBQUUsSUFBSSxFQUFFLElBQUksR0FBRyxDQUFFLENBQUMsQ0FBQTtBQUM5RSxDQUFDO0FBSkQsMEJBSUM7QUFFRCxrQkFBMEIsQ0FBUztJQUNqQyxNQUFNLEVBQUUsR0FBRyxDQUFDLENBQUMsVUFBVSxDQUFDLENBQUMsQ0FBQyxDQUFBO0lBRTFCLE1BQU0sQ0FBQyxDQUFDLEtBQUssQ0FBQyxFQUFFLENBQUMsSUFBSSxFQUFFLElBQUksRUFBRSxJQUFJLEVBQUUsSUFBSSxFQUFFLENBQUE7QUFDM0MsQ0FBQztBQUpELDRCQUlDO0FBRUQsWUFBb0IsTUFBYztJQUNoQyxNQUFNLENBQUMsVUFBVSxDQUFTO1FBQ3hCLEVBQUUsQ0FBQyxDQUFFLENBQUMsQ0FBQyxNQUFNLEtBQUssQ0FBQyxJQUFJLE1BQU0sQ0FBQyxNQUFNLEtBQUssQ0FBRSxDQUFDO1lBQUMsTUFBTSxDQUFDLEtBQUssQ0FBQTtRQUN6RCxJQUFJO1lBQXlDLE1BQU0sQ0FBQyxNQUFNLENBQUMsQ0FBQyxDQUFDLEtBQUssQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFBO0lBQ3hFLENBQUMsQ0FBQTtBQUNILENBQUM7QUFMRCxnQkFLQzs7OztBQ2pCRCwrREFBOEM7QUFDOUMsK0RBQThDO0FBQzlDLGlDQUFnQztBQUNoQyx1Q0FBd0M7QUFDeEMscUNBQTZHO0FBQzdHLHlDQUEwRDtBQUUxRCxNQUFNLENBQUMsR0FBRyxRQUFRLENBQUMsY0FBYyxDQUFDLFFBQVEsQ0FBc0IsQ0FBQTtBQUNoRSxNQUFNLEVBQUUsR0FBRyxDQUFDLENBQUMsVUFBVSxDQUFDLE9BQU8sQ0FBMEIsQ0FBQTtBQUV6RDs7Ozs7Ozs7O0VBU0U7QUFFRixJQUFLLGlCQU1KO0FBTkQsV0FBSyxpQkFBaUI7SUFDcEIsNERBQVcsQ0FBQTtJQUNYLDhFQUFvQixDQUFBO0lBQ3BCLDhEQUFZLENBQUE7SUFDWixnRkFBcUIsQ0FBQTtJQUNyQiw4REFBWSxDQUFBO0FBQ2QsQ0FBQyxFQU5JLGlCQUFpQixLQUFqQixpQkFBaUIsUUFNckI7QUFFRCxJQUFLLG9CQUdKO0FBSEQsV0FBSyxvQkFBb0I7SUFDdkIsbUZBQW9CLENBQUE7SUFDcEIsbUdBQW9CLENBQUE7QUFDdEIsQ0FBQyxFQUhJLG9CQUFvQixLQUFwQixvQkFBb0IsUUFHeEI7QUFFRCxJQUFLLGlCQVFKO0FBUkQsV0FBSyxpQkFBaUI7SUFDcEIsNkRBQVUsQ0FBQTtJQUNWLDJEQUFLLENBQUE7SUFDTCxtRUFBUyxDQUFBO0lBQ1QscUVBQVUsQ0FBQTtJQUNWLG1FQUFTLENBQUE7SUFDVCw2RUFBYyxDQUFBO0lBQ2QseUVBQVksQ0FBQTtBQUNkLENBQUMsRUFSSSxpQkFBaUIsS0FBakIsaUJBQWlCLFFBUXJCO0FBRUQsSUFBSyxpQkFzQko7QUF0QkQsV0FBSyxpQkFBaUI7SUFDcEIsNERBQVcsQ0FBQTtJQUNYLDhFQUFvQixDQUFBO0lBQ3BCLDhEQUFZLENBQUE7SUFDWixnRkFBcUIsQ0FBQTtJQUNyQiwwREFBVSxDQUFBO0lBQ1YsNEVBQW1CLENBQUE7SUFDbkIsOERBQVksQ0FBQTtJQUNaLHlFQUFrQixDQUFBO0lBQ2xCLHlFQUFrQixDQUFBO0lBQ2xCLHlFQUFrQixDQUFBO0lBQ2xCLHFFQUFnQixDQUFBO0lBQ2hCLHFFQUFnQixDQUFBO0lBQ2hCLHFFQUFnQixDQUFBO0lBQ2hCLDZEQUFZLENBQUE7SUFDWix1RUFBaUIsQ0FBQTtJQUNqQix1RUFBaUIsQ0FBQTtJQUNqQix1RUFBaUIsQ0FBQTtJQUNqQix5RUFBa0IsQ0FBQTtJQUNsQix5RUFBa0IsQ0FBQTtJQUNsQix5RUFBa0IsQ0FBQTtJQUNsQix5RUFBa0IsQ0FBQTtBQUNwQixDQUFDLEVBdEJJLGlCQUFpQixLQUFqQixpQkFBaUIsUUFzQnJCO0FBa0NELG9CQUFzQixDQUFjLEVBQUUsTUFBYyxFQUFFLE1BQWMsRUFBRSxLQUFlO0lBQ25GLE1BQU0sR0FBRyxHQUFHLElBQUksWUFBWSxDQUFDLENBQUMsRUFBRSxNQUFNLEVBQUUsTUFBTSxDQUFDLENBQUE7SUFFL0MsR0FBRyxDQUFDLEdBQUcsQ0FBQyxLQUFLLENBQUMsQ0FBQTtJQUNkLE1BQU0sQ0FBQyxHQUFHLENBQUE7QUFDWixDQUFDO0FBRUQsY0FBTyxDQUFDLGFBQWEsQ0FBQztLQUNyQixJQUFJLENBQUMsY0FBUSxDQUFDO0tBQ2QsSUFBSSxDQUFDLFFBQVE7SUFDWixFQUFFLENBQUMsQ0FBRSxDQUFDLFFBQVEsQ0FBQyxPQUFRLENBQUM7UUFBQyxNQUFNLENBQUE7SUFFL0IsWUFBWTtJQUNaLE1BQU0sYUFBYSxHQUFHLENBQUMsQ0FBQTtJQUN2QixNQUFNLEVBQUUsUUFBUSxFQUFFLE9BQU8sRUFBRSxHQUFHLFFBQVEsQ0FBQyxHQUFHLENBQUE7SUFDMUMsTUFBTSxjQUFjLEdBQUcsUUFBUSxDQUFDLE1BQU0sR0FBRyxhQUFhLENBQUE7SUFDdEQsTUFBTSxjQUFjLEdBQUcsT0FBTyxDQUFDLE1BQU0sR0FBRyxhQUFhLENBQUE7SUFDckQsTUFBTSxDQUFDLEdBQUcsSUFBSSxXQUFXLENBQUMsY0FBYyxHQUFHLGNBQWMsQ0FBQyxDQUFBO0lBQzFELE1BQU0sVUFBVSxHQUFHLFVBQVUsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxFQUFFLFFBQVEsQ0FBQyxNQUFNLEVBQUUsUUFBUSxDQUFDLENBQUE7SUFDOUQsTUFBTSxTQUFTLEdBQUcsVUFBVSxDQUFDLENBQUMsRUFBRSxRQUFRLENBQUMsTUFBTSxHQUFHLGFBQWEsRUFBRSxPQUFPLENBQUMsTUFBTSxFQUFFLE9BQU8sQ0FBQyxDQUFBO0lBQ3pGLE1BQU0sSUFBSSxHQUFHLElBQUksS0FBSyxDQUFDLEdBQUcsQ0FBQyxDQUFBO0lBQzNCLE1BQU0sS0FBSyxHQUFHLFdBQUUsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsQ0FBQyxDQUFBO0lBQ3pCLE1BQU0sR0FBRyxHQUFHO1FBQ1YsUUFBUSxFQUFFLElBQUksWUFBWSxDQUFDLENBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLENBQUUsQ0FBQztRQUN2QyxJQUFJLEVBQUUsV0FBRSxFQUFFO1FBQ1YsVUFBVSxFQUFFLFdBQUUsRUFBRTtRQUNoQixJQUFJLEVBQUUsSUFBSSxDQUFDLEVBQUUsR0FBRyxDQUFDO1FBQ2pCLFdBQVcsRUFBRSxDQUFDLENBQUMsS0FBSyxHQUFHLENBQUMsQ0FBQyxNQUFNO1FBQy9CLElBQUksRUFBRSxHQUFHO1FBQ1QsR0FBRyxFQUFFLEtBQUs7UUFDVixFQUFFLEVBQUUsV0FBRSxDQUFDLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxDQUFDO1FBQ2YsRUFBRSxFQUFFLFdBQUUsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsQ0FBQztLQUNoQixDQUFBO0lBQ0QsTUFBTSxTQUFTLEdBQUc7UUFDaEIsUUFBUSxFQUFFLFdBQUUsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsQ0FBQztRQUNyQixLQUFLLEVBQUUsV0FBRSxDQUFDLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxDQUFDO1FBQ2xCLFFBQVEsRUFBRSxXQUFFLENBQUMsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLENBQUM7UUFDckIsS0FBSyxFQUFFLFdBQUUsRUFBRTtLQUNaLENBQUE7SUFDRCxNQUFNLFdBQVcsR0FBRyxrQkFBTyxDQUFDLGFBQWEsQ0FBQyxFQUFFLEVBQUU7UUFDNUMsSUFBSSxFQUFFLHlCQUFNO1FBQ1osSUFBSSxFQUFFLHlCQUFNO1FBQ1osUUFBUSxFQUFFO1lBQ1IsT0FBTyxFQUFFLElBQUksbUJBQVEsQ0FBQyxHQUFHLENBQUMsQ0FBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsQ0FBRSxDQUFDO1lBQ3RDLE9BQU8sRUFBRSxJQUFJLG1CQUFRLENBQUMsUUFBUSxDQUFDLFdBQUUsRUFBRSxDQUFDO1lBQ3BDLE1BQU0sRUFBRSxJQUFJLG1CQUFRLENBQUMsUUFBUSxDQUFDLFdBQUUsRUFBRSxDQUFDO1lBQ25DLFlBQVksRUFBRSxJQUFJLG1CQUFRLENBQUMsUUFBUSxDQUFDLFdBQUUsRUFBRSxDQUFDO1NBQzFDO1FBQ0QsVUFBVSxFQUFFO1lBQ1YsT0FBTyxFQUFFLElBQUkscUJBQVUsQ0FBQyxNQUFNLENBQUMsQ0FBQyxFQUFFLFVBQVUsQ0FBQztZQUM3QyxRQUFRLEVBQUUsSUFBSSxxQkFBVSxDQUFDLE1BQU0sQ0FBQyxDQUFDLEVBQUUsU0FBUyxDQUFDO1NBQzlDO0tBQ0YsQ0FBQyxDQUFBO0lBQ0YsRUFBRSxDQUFDLENBQUUsV0FBVyxZQUFZLEtBQU0sQ0FBQyxDQUFDLENBQUM7UUFDbkMsT0FBTyxDQUFDLEdBQUcsQ0FBQyxXQUFXLENBQUMsQ0FBQTtJQUMxQixDQUFDO0lBQ0QsSUFBSSxDQUFDLENBQUM7UUFDSixJQUFJLENBQUMsR0FBRyxDQUFDLENBQUE7UUFDVCxNQUFNLE1BQU0sR0FBRztZQUNiLENBQUMsRUFBRSxDQUFBO1lBRUgsRUFBRSxDQUFDLENBQUUsSUFBSSxDQUFDLEVBQUUsQ0FBRSxDQUFDO2dCQUFDLFNBQVMsQ0FBQyxRQUFRLENBQUMsQ0FBQyxDQUFDLElBQUksSUFBSSxDQUFBO1lBQzdDLEVBQUUsQ0FBQyxDQUFFLElBQUksQ0FBQyxFQUFFLENBQUUsQ0FBQztnQkFBQyxTQUFTLENBQUMsUUFBUSxDQUFDLENBQUMsQ0FBQyxJQUFJLElBQUksQ0FBQTtZQUU3QyxLQUFLLENBQUMsQ0FBQyxDQUFDLEdBQUcsSUFBSSxDQUFDLEdBQUcsQ0FBQyxDQUFDLEdBQUcsRUFBRSxDQUFDLEdBQUcsQ0FBQyxDQUFBO1lBQy9CLEtBQUssQ0FBQyxDQUFDLENBQUMsR0FBRyxJQUFJLENBQUMsR0FBRyxDQUFDLENBQUMsR0FBRyxFQUFFLENBQUMsR0FBRyxDQUFDLENBQUE7WUFDL0IsaUJBQVEsQ0FBQyxTQUFTLENBQUMsS0FBSyxDQUFDLENBQUE7WUFDekIsa0JBQVMsQ0FBQyxTQUFTLENBQUMsS0FBSyxFQUFFLFNBQVMsQ0FBQyxRQUFRLENBQUMsQ0FBQTtZQUM5QyxjQUFLLENBQUMsU0FBUyxDQUFDLEtBQUssRUFBRSxTQUFTLENBQUMsS0FBSyxDQUFDLENBQUE7WUFDdkMsZ0JBQU8sQ0FBQyxTQUFTLENBQUMsS0FBSyxFQUFFLFNBQVMsQ0FBQyxRQUFRLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQTtZQUMvQyxnQkFBTyxDQUFDLFNBQVMsQ0FBQyxLQUFLLEVBQUUsU0FBUyxDQUFDLFFBQVEsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFBO1lBQy9DLGdCQUFPLENBQUMsU0FBUyxDQUFDLEtBQUssRUFBRSxTQUFTLENBQUMsUUFBUSxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUE7WUFDL0MsR0FBRyxDQUFDLFdBQVcsR0FBRyxDQUFDLENBQUMsS0FBSyxHQUFHLENBQUMsQ0FBQyxNQUFNLENBQUE7WUFDcEMsZUFBTSxDQUFDLEdBQUcsQ0FBQyxJQUFJLEVBQUUsR0FBRyxDQUFDLFFBQVEsRUFBRSxHQUFHLENBQUMsRUFBRSxFQUFFLEdBQUcsQ0FBQyxFQUFFLENBQUMsQ0FBQTtZQUM5QyxvQkFBVyxDQUFDLEdBQUcsQ0FBQyxVQUFVLEVBQUUsR0FBRyxDQUFDLElBQUksRUFBRSxHQUFHLENBQUMsV0FBVyxFQUFFLEdBQUcsQ0FBQyxJQUFJLEVBQUUsR0FBRyxDQUFDLEdBQUcsQ0FBQyxDQUFBO1lBRXpFLEVBQUUsQ0FBQyxNQUFNLENBQUMsRUFBRSxDQUFDLFNBQVMsQ0FBQyxDQUFBO1lBQ3ZCLEVBQUUsQ0FBQyxRQUFRLENBQUMsRUFBRSxDQUFDLElBQUksQ0FBQyxDQUFBO1lBQ3BCLEVBQUUsQ0FBQyxRQUFRLENBQUMsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDLENBQUMsS0FBSyxFQUFFLENBQUMsQ0FBQyxNQUFNLENBQUMsQ0FBQTtZQUNwQyxFQUFFLENBQUMsVUFBVSxDQUFDLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQyxFQUFFLENBQUMsQ0FBQyxDQUFBO1lBQ3pCLEVBQUUsQ0FBQyxLQUFLLENBQUMsRUFBRSxDQUFDLGdCQUFnQixHQUFHLEVBQUUsQ0FBQyxnQkFBZ0IsQ0FBQyxDQUFBO1lBRW5ELGtCQUFPLENBQUMsR0FBRyxDQUFDLFdBQVcsRUFBRTtnQkFDdkIsUUFBUSxFQUFFO29CQUNSLE9BQU8sRUFBRSxLQUFLO29CQUNkLE9BQU8sRUFBRSxTQUFTLENBQUMsS0FBSztvQkFDeEIsTUFBTSxFQUFFLEdBQUcsQ0FBQyxJQUFJO29CQUNoQixZQUFZLEVBQUUsR0FBRyxDQUFDLFVBQVU7aUJBQzdCO2dCQUNELEtBQUssRUFBRSxRQUFRLENBQUMsTUFBTSxHQUFHLENBQUM7YUFDM0IsQ0FBQyxDQUFBO1lBQ0YscUJBQXFCLENBQUMsTUFBTSxDQUFDLENBQUE7UUFDL0IsQ0FBQyxDQUFBO1FBQ0QscUJBQXFCLENBQUMsTUFBTSxDQUFDLENBQUE7UUFFN0IsUUFBUSxDQUFDLElBQUksQ0FBQyxnQkFBZ0IsQ0FBQyxTQUFTLEVBQUUsQ0FBQyxFQUFFLE9BQU8sRUFBRSxLQUFLLElBQUksQ0FBQyxPQUFPLENBQUMsR0FBRyxDQUFDLENBQUMsQ0FBQTtRQUM3RSxRQUFRLENBQUMsSUFBSSxDQUFDLGdCQUFnQixDQUFDLE9BQU8sRUFBRSxDQUFDLEVBQUUsT0FBTyxFQUFFLEtBQUssSUFBSSxDQUFDLE9BQU8sQ0FBQyxHQUFHLENBQUMsQ0FBQyxDQUFBO0lBQzdFLENBQUM7QUFDSCxDQUFDLENBQUMsQ0FBQTs7Ozs7QUN0TUYsa0JBQ0E7Ozs7Ozs7Ozs7OztDQVlDLENBQUE7Ozs7O0FDYkQsa0JBQ0E7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Q0ErQkMsQ0FBQSIsImZpbGUiOiJnZW5lcmF0ZWQuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlc0NvbnRlbnQiOlsiKGZ1bmN0aW9uIGUodCxuLHIpe2Z1bmN0aW9uIHMobyx1KXtpZighbltvXSl7aWYoIXRbb10pe3ZhciBhPXR5cGVvZiByZXF1aXJlPT1cImZ1bmN0aW9uXCImJnJlcXVpcmU7aWYoIXUmJmEpcmV0dXJuIGEobywhMCk7aWYoaSlyZXR1cm4gaShvLCEwKTt2YXIgZj1uZXcgRXJyb3IoXCJDYW5ub3QgZmluZCBtb2R1bGUgJ1wiK28rXCInXCIpO3Rocm93IGYuY29kZT1cIk1PRFVMRV9OT1RfRk9VTkRcIixmfXZhciBsPW5bb109e2V4cG9ydHM6e319O3Rbb11bMF0uY2FsbChsLmV4cG9ydHMsZnVuY3Rpb24oZSl7dmFyIG49dFtvXVsxXVtlXTtyZXR1cm4gcyhuP246ZSl9LGwsbC5leHBvcnRzLGUsdCxuLHIpfXJldHVybiBuW29dLmV4cG9ydHN9dmFyIGk9dHlwZW9mIHJlcXVpcmU9PVwiZnVuY3Rpb25cIiYmcmVxdWlyZTtmb3IodmFyIG89MDtvPHIubGVuZ3RoO28rKylzKHJbb10pO3JldHVybiBzfSkiLCJpbXBvcnQgeyBHTCwgUHJvZ3JhbSB9IGZyb20gJy4vR0xUeXBlcydcblxuLypcbiAgVEhPVUdIVFMgT04gSU5ERVggLyBkcmF3RWxlbWVudHMgXG5cbiAgRWFjaCBjb21tYW5kIGlzIGVpdGhlciByZW5kZXJlcmVkIHdpdGggZHJhd0VsZW1lbnRzIG9yIGRyYXdBcnJheXNcbiAgdGhpcyBzaG91bGQgYmUgZGV0ZXJtaW5lZCBieSB3aGV0aGVyIHRoZSBjZmcgc3VwcGxpZXMgYW4gaW5kZXggYXR0cmlidXRlXG4gIGZvciB0aGUgXCJpbmRleFwiIHByb3BlcnR5LiAgSSB0aGluayB0aGlzIGlzIGJlc3Qgc2VwYXJhdGVkIGZyb20gZ2VuZXJhbFxuICBhdHRyaWJ1dGVzIGFzIGl0IHBsYXlzIGFuIGltcG9ydGFudCByb2xlIGluIGRldGVybWluaW5nIGhvdyB0aGUgY29tbWFuZFxuICB3aWxsIGJlIHVzZWQuICBGdXJ0aGVybW9yZSwgaXQgYWxzbyBzZWVtcyB0aGF0IHRoZXJlIGlzIG5vIG5lZWQgZm9yIHVzZXJcbiAgY3VzdG9taXphdGlvbiBmb3IgdGhpcyBwcm9wZXJ0eS4gIElmIHRoZXkgc3VwcGx5IGFuIEludDE2QXJyYXkgZm9yIHRoZSBcbiAgaW5kZXggcHJvcGVydHksIHRoZW4gdGhlIGNvbW1hbmQgd2lsbCBleGVjdXRlIHdpdGggZHJhd0VsZW1lbnRzXG4gIGFuZCBub3QgZHJhd0FycmF5c1xuKi9cblxuZXhwb3J0IHR5cGUgQXR0cmlidXRlU2l6ZSA9IDEgfCAyIHwgMyB8IDRcbmV4cG9ydCBlbnVtIEJ1ZmZlclR5cGUgeyBCWVRFLCBVTlNJR05FRF9CWVRFLCBTSE9SVCwgVU5TSUdORURfU0hPUlQsIEZMT0FUIH1cblxuZXhwb3J0IGludGVyZmFjZSBBdHRyaWJ1dGVDZmc8VD4geyBcbiAgdmFsdWU6IFRcbiAgcmVhZG9ubHkgYnVmZmVyVHlwZTogQnVmZmVyVHlwZVxuICBzaXplOiBBdHRyaWJ1dGVTaXplXG4gIG9mZnNldD86IG51bWJlclxuICBzdHJpZGU/OiBudW1iZXJcbiAgc2V0dXAoIGdsOiBHTCwgYTogQXR0cmlidXRlPFQ+ICk6IHZvaWRcbiAgc2V0KCBnbDogR0wsIGE6IEF0dHJpYnV0ZTxUPiwgdDogVCApOiB2b2lkXG4gIHRlYXJkb3duKCBnbDogR0wsIGE6IEF0dHJpYnV0ZTxUPiApOiB2b2lkXG59XG5cbmV4cG9ydCBpbnRlcmZhY2UgQXR0cmlidXRlPFQ+IGV4dGVuZHMgQXR0cmlidXRlQ2ZnPFQ+IHtcbiAgbG9jOiBudW1iZXJcbiAgYnVmZmVyOiBXZWJHTEJ1ZmZlclxufVxuXG5leHBvcnQgdHlwZSBBdHRyaWJ1dGVDZmdzPFQ+ID0geyBbIFAgaW4ga2V5b2YgVCBdOiBBdHRyaWJ1dGVDZmc8VFtQXT4gfVxuZXhwb3J0IHR5cGUgQXR0cmlidXRlczxUPiA9IHsgWyBQIGluIGtleW9mIFQgXTogQXR0cmlidXRlPFRbUF0+IH1cblxuZXhwb3J0IGNsYXNzIEZsb2F0cyBpbXBsZW1lbnRzIEF0dHJpYnV0ZUNmZzxGbG9hdDMyQXJyYXk+IHtcbiAgb2Zmc2V0ID0gMFxuICBzdHJpZGUgPSAwXG4gIHJlYWRvbmx5IGJ1ZmZlclR5cGUgPSBCdWZmZXJUeXBlLkZMT0FUXG4gIGNvbnN0cnVjdG9yKCBwdWJsaWMgc2l6ZTogQXR0cmlidXRlU2l6ZSwgcHVibGljIHZhbHVlOiBGbG9hdDMyQXJyYXkgKSB7fVxuICBzZXR1cChnbDogR0wsIGE6IEF0dHJpYnV0ZTxGbG9hdDMyQXJyYXk+ICkge1xuICAgIGNvbnN0IHsgbG9jLCBzaXplLCBidWZmZXJUeXBlLCBidWZmZXIsIHN0cmlkZSA9IDAsIG9mZnNldCA9IDAgfSA9IGFcblxuICAgIGdsLmJpbmRCdWZmZXIoZ2wuQVJSQVlfQlVGRkVSLCBidWZmZXIpXG4gICAgZ2wuZW5hYmxlVmVydGV4QXR0cmliQXJyYXkoYS5sb2MpXG4gICAgZ2wudmVydGV4QXR0cmliUG9pbnRlcihsb2MsIHNpemUsIHRvR0xUeXBlKGdsLCBidWZmZXJUeXBlKSwgZmFsc2UsIHN0cmlkZSwgb2Zmc2V0KVxuICB9XG4gIHNldCggZ2w6IEdMLCBhOiBBdHRyaWJ1dGU8RmxvYXQzMkFycmF5PiwgdmFsdWU6IEZsb2F0MzJBcnJheSApIHtcbiAgICBnbC5idWZmZXJEYXRhKGdsLkFSUkFZX0JVRkZFUiwgdmFsdWUsIGdsLkRZTkFNSUNfRFJBVylcbiAgfVxuICB0ZWFyZG93bihnbDogR0wsIGE6IEF0dHJpYnV0ZTxGbG9hdDMyQXJyYXk+ICkge1xuICAgIGdsLmRpc2FibGVWZXJ0ZXhBdHRyaWJBcnJheShhLmxvYykgXG4gICAgZ2wuYmluZEJ1ZmZlcihnbC5BUlJBWV9CVUZGRVIsIG51bGwpXG4gIH1cbn1cblxuZXhwb3J0IGZ1bmN0aW9uIHNldHVwQXR0cmlidXRlPFQ+ICggZ2w6IEdMLCBwcm9ncmFtOiBQcm9ncmFtLCBuYW1lOiBzdHJpbmcsIGFjZmc6IEF0dHJpYnV0ZUNmZzxUPiApOiBBdHRyaWJ1dGU8VD4gfCBFcnJvciB7XG4gIGNvbnN0IHsgdmFsdWUsIGJ1ZmZlclR5cGUsIHNpemUsIHNldCwgc2V0dXAsIHRlYXJkb3duLCBvZmZzZXQgPSAwLCBzdHJpZGUgPSAwIH0gPSBhY2ZnXG4gIGNvbnN0IGxvYyA9IGdsLmdldEF0dHJpYkxvY2F0aW9uKHByb2dyYW0sIG5hbWUpXG4gIGNvbnN0IGJ1ZmZlciA9IGdsLmNyZWF0ZUJ1ZmZlcigpXG5cbiAgaWYgKCBsb2MgPT0gbnVsbCApICAgIHJldHVybiBuZXcgRXJyb3IoYENvdWxkIG5vdCBsb2NhdGUgYXR0cjogJHsgbmFtZSB9YClcbiAgaWYgKCBidWZmZXIgPT0gbnVsbCApIHJldHVybiBuZXcgRXJyb3IoYENvdWxkIG5vdCBjcmVhdGUgYnVmZmVyIGZvciBhdHRyOiAkeyBuYW1lIH1gKVxuXG4gIGNvbnN0IGEgPSB7IHZhbHVlLCBidWZmZXJUeXBlLCBzaXplLCBvZmZzZXQsIHN0cmlkZSwgbG9jLCBidWZmZXIsIHNldCwgc2V0dXAsIHRlYXJkb3duIH1cblxuICBzZXR1cChnbCwgYSlcbiAgc2V0KGdsLCBhLCB2YWx1ZSlcbiAgdGVhcmRvd24oZ2wsIGEpXG4gIHJldHVybiBhXG59XG5cbmZ1bmN0aW9uIHRvR0xUeXBlICggZ2w6IEdMLCBidWZmZXJUeXBlOiBCdWZmZXJUeXBlICk6IG51bWJlciB7XG4gIHN3aXRjaCAoIGJ1ZmZlclR5cGUgKSB7XG4gICAgY2FzZSBCdWZmZXJUeXBlLkZMT0FUOiAgICAgICAgICByZXR1cm4gZ2wuRkxPQVRcbiAgICBjYXNlIEJ1ZmZlclR5cGUuU0hPUlQ6ICAgICAgICAgIHJldHVybiBnbC5TSE9SVFxuICAgIGNhc2UgQnVmZmVyVHlwZS5CWVRFOiAgICAgICAgICAgcmV0dXJuIGdsLkJZVEVcbiAgICBjYXNlIEJ1ZmZlclR5cGUuVU5TSUdORURfU0hPUlQ6IHJldHVybiBnbC5VTlNJR05FRF9TSE9SVFxuICAgIGNhc2UgQnVmZmVyVHlwZS5VTlNJR05FRF9CWVRFOiAgcmV0dXJuIGdsLlVOU0lHTkVEX0JZVEVcbiAgICBkZWZhdWx0OiBjb25zdCBuOiBuZXZlciA9IGJ1ZmZlclR5cGVcbiAgICAgICAgICAgICByZXR1cm4gblxuICB9XG59XG4iLCJpbXBvcnQgeyBHTCwgUHJvZ3JhbSwgU2hhZGVyLCBTaGFkZXJTcmMgfSBmcm9tICcuL0dMVHlwZXMnXG5pbXBvcnQgeyBVbmlmb3JtQ2ZncywgVW5pZm9ybXMsIHNldHVwVW5pZm9ybSB9IGZyb20gJy4vVW5pZm9ybXMnXG5pbXBvcnQgeyBBdHRyaWJ1dGVDZmdzLCBBdHRyaWJ1dGVzLCBzZXR1cEF0dHJpYnV0ZSB9IGZyb20gJy4vQXR0cmlidXRlcydcbmltcG9ydCB7IHRvRXJyb3IgfSBmcm9tICcuL3V0aWxzJ1xuXG5leHBvcnQgaW50ZXJmYWNlIENvbW1hbmRDZmc8VSwgQT4ge1xuICB2c3JjOiBzdHJpbmdcbiAgZnNyYzogc3RyaW5nXG4gIHVuaWZvcm1zOiBVbmlmb3JtQ2ZnczxVPlxuICBhdHRyaWJ1dGVzOiBBdHRyaWJ1dGVDZmdzPEE+XG59XG5cbmV4cG9ydCBpbnRlcmZhY2UgQ29tbWFuZDxVLCBBPiB7XG4gIGdsOiBHTFxuICBwcm9ncmFtOiBQcm9ncmFtXG4gIHVuaWZvcm1zOiBVbmlmb3JtczxVPlxuICBhdHRyaWJ1dGVzOiBBdHRyaWJ1dGVzPEE+XG59XG5cbmV4cG9ydCBpbnRlcmZhY2UgUGFyYW1zPFUsIEE+IHtcbiAgdW5pZm9ybXM/OiBQYXJ0aWFsPFU+XG4gIGF0dHJpYnV0ZXM/OiBQYXJ0aWFsPEE+IFxuICBjb3VudDogbnVtYmVyXG59XG5cbmV4cG9ydCBmdW5jdGlvbiBydW48VSwgQT4gKCBjbWQ6IENvbW1hbmQ8VSwgQT4sIHA6IFBhcmFtczxVLCBBPiApIHtcbiAgY29uc3QgeyBnbCwgcHJvZ3JhbSB9ID0gY21kXG4gIGNvbnN0IHsgYXR0cmlidXRlcywgdW5pZm9ybXMsIGNvdW50IH0gPSBwXG5cbiAgZ2wudXNlUHJvZ3JhbShwcm9ncmFtKVxuXG4gIGZvciAoIGNvbnN0IGtleSBpbiBjbWQudW5pZm9ybXMgKSB7XG4gICAgY29uc3QgeyBsb2MsIHZhbHVlLCBzZXQgfSA9IGNtZC51bmlmb3Jtc1trZXldXG4gICAgY29uc3QgdmFsID0gdW5pZm9ybXMgJiYgdW5pZm9ybXNba2V5XSB8fCB2YWx1ZVxuXG4gICAgc2V0KGdsLCBsb2MsIHZhbClcbiAgfVxuXG4gIGZvciAoIGNvbnN0IGtleSBpbiBjbWQuYXR0cmlidXRlcyApIHtcbiAgICBjb25zdCBhID0gY21kLmF0dHJpYnV0ZXNba2V5XVxuICAgIGNvbnN0IHZhbCA9IGF0dHJpYnV0ZXMgJiYgYXR0cmlidXRlc1trZXldXG5cbiAgICBhLnNldHVwKGdsLCBhKVxuICAgIGlmICggdmFsICE9IG51bGwgKSBhLnNldChnbCwgYSwgdmFsKVxuICB9XG5cbiAgZ2wuZHJhd0FycmF5cyhnbC5UUklBTkdMRVMsIDAsIGNvdW50KVxuXG4gIGZvciAoIGNvbnN0IGtleSBpbiBjbWQuYXR0cmlidXRlcyApIHtcbiAgICBjb25zdCBhID0gY21kLmF0dHJpYnV0ZXNba2V5XVxuXG4gICAgYS50ZWFyZG93bihnbCwgYSlcbiAgfVxuXG4gIGdsLnVzZVByb2dyYW0obnVsbClcbn1cblxuXG5leHBvcnQgZnVuY3Rpb24gY3JlYXRlQ29tbWFuZDxVLCBBPiAoIGdsOiBHTCwgY2ZnOiBDb21tYW5kQ2ZnPFUsIEE+ICk6IENvbW1hbmQ8VSwgQT4gfCBFcnJvciB7XG4gIGNvbnN0IHByb2dyYW0gPSBmcm9tU291cmNlKGdsLCBjZmcudnNyYywgY2ZnLmZzcmMpXG5cbiAgaWYgKCBwcm9ncmFtIGluc3RhbmNlb2YgRXJyb3IgKSByZXR1cm4gcHJvZ3JhbVxuXG4gIGNvbnN0IHVuaWZvcm1zID0gc2V0dXBVbmlmb3JtcyhnbCwgcHJvZ3JhbSwgY2ZnLnVuaWZvcm1zKVxuXG4gIGlmICggdW5pZm9ybXMgaW5zdGFuY2VvZiBFcnJvciApIHVuaWZvcm1zXG5cbiAgY29uc3QgYXR0cmlidXRlcyA9IHNldHVwQXR0cmlidXRlcyhnbCwgcHJvZ3JhbSwgY2ZnLmF0dHJpYnV0ZXMpXG5cbiAgaWYgKCBhdHRyaWJ1dGVzIGluc3RhbmNlb2YgRXJyb3IgKSByZXR1cm4gYXR0cmlidXRlc1xuXG4gIHJldHVybiB7IGdsLCBwcm9ncmFtLCB1bmlmb3JtcywgYXR0cmlidXRlcyB9IGFzIENvbW1hbmQ8VSwgQT5cbn1cblxuZnVuY3Rpb24gc2V0dXBVbmlmb3JtczxUPiAoIGdsOiBHTCwgcHJvZ3JhbTogUHJvZ3JhbSwgdWNmZ3M6IFVuaWZvcm1DZmdzPFQ+ICk6IFVuaWZvcm1zPFQ+IHwgRXJyb3Ige1xuICBjb25zdCBvdXQgPSB7fSBhcyBVbmlmb3JtczxUPlxuXG4gIGdsLnVzZVByb2dyYW0ocHJvZ3JhbSlcbiAgZm9yICggY29uc3Qga2V5IGluIHVjZmdzICkge1xuICAgIGNvbnN0IHVuaWZvcm0gPSBzZXR1cFVuaWZvcm0oZ2wsIHByb2dyYW0sIGtleSwgdWNmZ3Nba2V5XSlcblxuICAgIGlmICggdW5pZm9ybSBpbnN0YW5jZW9mIEVycm9yICkgcmV0dXJuIHVuaWZvcm1cbiAgICBlbHNlICAgICAgICAgICAgICAgICAgICAgICAgICAgIG91dFtrZXldID0gdW5pZm9ybVxuICB9XG4gIGdsLnVzZVByb2dyYW0obnVsbClcbiAgcmV0dXJuIG91dFxufVxuXG5mdW5jdGlvbiBzZXR1cEF0dHJpYnV0ZXM8VD4gKCBnbDogR0wsIHByb2dyYW06IFByb2dyYW0sIHVhdHRyczogQXR0cmlidXRlQ2ZnczxUPiApOiBBdHRyaWJ1dGVzPFQ+IHwgRXJyb3Ige1xuICBjb25zdCBvdXQgPSB7fSBhcyBBdHRyaWJ1dGVzPFQ+XG5cbiAgZ2wudXNlUHJvZ3JhbShwcm9ncmFtKVxuICBmb3IgKCBjb25zdCBrZXkgaW4gdWF0dHJzICkge1xuICAgIGNvbnN0IGF0dHIgPSBzZXR1cEF0dHJpYnV0ZShnbCwgcHJvZ3JhbSwga2V5LCB1YXR0cnNba2V5XSlcblxuICAgIGlmICggYXR0ciBpbnN0YW5jZW9mIEVycm9yICkgcmV0dXJuIGF0dHJcbiAgICBlbHNlICAgICAgICAgICAgICAgICAgICAgICAgIG91dFtrZXldID0gYXR0clxuICB9XG4gIGdsLnVzZVByb2dyYW0obnVsbClcbiAgcmV0dXJuIG91dCBcbn1cblxuZnVuY3Rpb24gY29tcGlsZVNoYWRlciAoIGdsOiBHTCwga2luZDogbnVtYmVyLCBzcmM6IFNoYWRlclNyYyApOiBTaGFkZXIgfCBFcnJvciB7XG4gIGNvbnN0IHNoYWRlciA9IGdsLmNyZWF0ZVNoYWRlcihraW5kKVxuICBjb25zdCBraW5kU3RyID0ga2luZCA9PT0gZ2wuVkVSVEVYX1NIQURFUiA/ICdWRVJURVgnIDogJ0ZSQUdNRU5UJ1xuXG4gIGdsLnNoYWRlclNvdXJjZShzaGFkZXIsIHNyYylcbiAgZ2wuY29tcGlsZVNoYWRlcihzaGFkZXIpXG4gIHJldHVybiBzaGFkZXIgJiYgZ2wuZ2V0U2hhZGVyUGFyYW1ldGVyKHNoYWRlciwgZ2wuQ09NUElMRV9TVEFUVVMpXG4gICAgPyBzaGFkZXJcbiAgICA6IG5ldyBFcnJvcihgJHsga2luZFN0ciB9OiAkeyBnbC5nZXRTaGFkZXJJbmZvTG9nKHNoYWRlcikgfHwgJycgfWApXG59XG5cbmZ1bmN0aW9uIGZyb21Tb3VyY2UgKCBnbDogR0wsIHZzcmM6IFNoYWRlclNyYywgZnNyYzogU2hhZGVyU3JjICk6IFByb2dyYW0gfCBFcnJvciB7XG4gIGNvbnN0IHZlcnRleCA9IGNvbXBpbGVTaGFkZXIoZ2wsIGdsLlZFUlRFWF9TSEFERVIsIHZzcmMpXG4gIGNvbnN0IGZyYWdtZW50ID0gY29tcGlsZVNoYWRlcihnbCwgZ2wuRlJBR01FTlRfU0hBREVSLCBmc3JjKVxuICBjb25zdCBwcm9ncmFtID0gZ2wuY3JlYXRlUHJvZ3JhbSgpXG5cbiAgaWYgKCB2ZXJ0ZXggaW5zdGFuY2VvZiBFcnJvciApIHJldHVybiB2ZXJ0ZXhcbiAgaWYgKCBmcmFnbWVudCBpbnN0YW5jZW9mIEVycm9yICkgcmV0dXJuIGZyYWdtZW50XG5cbiAgZ2wuYXR0YWNoU2hhZGVyKHByb2dyYW0sIHZlcnRleClcbiAgZ2wuYXR0YWNoU2hhZGVyKHByb2dyYW0sIGZyYWdtZW50KVxuICBnbC5saW5rUHJvZ3JhbShwcm9ncmFtKVxuXG4gIHJldHVybiBwcm9ncmFtICYmIGdsLmdldFByb2dyYW1QYXJhbWV0ZXIocHJvZ3JhbSwgZ2wuTElOS19TVEFUVVMpIFxuICAgID8gcHJvZ3JhbSBcbiAgICA6IG5ldyBFcnJvcihnbC5nZXRQcm9ncmFtSW5mb0xvZyhwcm9ncmFtKSB8fCAnJylcbn1cbiIsImltcG9ydCB7IEdMLCBQcm9ncmFtLCBMb2MsIEZsb2F0cywgSW50cyB9IGZyb20gJy4vR0xUeXBlcydcbmltcG9ydCB7IGFzRjMyLCBhc0kzMiB9IGZyb20gJy4vdXRpbHMnXG5cbmV4cG9ydCBpbnRlcmZhY2UgVW5pZm9ybUNmZzxUPiB7IFxuICB2YWx1ZTogVFxuICBzZXQoIGdsOiBHTCwgaDogV2ViR0xVbmlmb3JtTG9jYXRpb24sIHQ6IFQpOiB2b2lkXG59XG5cbmV4cG9ydCBpbnRlcmZhY2UgVW5pZm9ybTxUPiBleHRlbmRzIFVuaWZvcm1DZmc8VD4geyBcbiAgbG9jOiBXZWJHTFVuaWZvcm1Mb2NhdGlvblxufVxuXG5leHBvcnQgdHlwZSBVbmlmb3JtQ2ZnczxUPiA9IHsgWyBQIGluIGtleW9mIFQgXTogVW5pZm9ybUNmZzxUW1BdPiB9XG5leHBvcnQgdHlwZSBVbmlmb3JtczxUPiA9IHsgWyBQIGluIGtleW9mIFQgXTogVW5pZm9ybTxUW1BdPiB9XG5cbmV4cG9ydCBjbGFzcyBVRiBpbXBsZW1lbnRzIFVuaWZvcm1DZmc8bnVtYmVyPiB7XG4gIGNvbnN0cnVjdG9yKCBwdWJsaWMgdmFsdWU6IG51bWJlciApIHt9XG4gIHNldCggZ2w6IEdMLCBoOiBMb2MsIHQ6IG51bWJlciApIHsgZ2wudW5pZm9ybTFmKGgsIHQpIH1cbn1cblxuZXhwb3J0IGNsYXNzIFUyRiBpbXBsZW1lbnRzIFVuaWZvcm1DZmc8RmxvYXRzPiB7XG4gIGNvbnN0cnVjdG9yKCBwdWJsaWMgdmFsdWU6IEZsb2F0cyApIHt9XG4gIHNldCggZ2w6IEdMLCBoOiBMb2MsIHQ6IEZsb2F0cyApIHsgZ2wudW5pZm9ybTJmKGgsIHRbMF0sIHRbMV0pIH1cbn1cblxuZXhwb3J0IGNsYXNzIFUzRiBpbXBsZW1lbnRzIFVuaWZvcm1DZmc8RmxvYXRzPiB7XG4gIGNvbnN0cnVjdG9yKCBwdWJsaWMgdmFsdWU6IEZsb2F0cyApIHt9XG4gIHNldCggZ2w6IEdMLCBoOiBMb2MsIHQ6IEZsb2F0cyApIHsgZ2wudW5pZm9ybTNmKGgsIHRbMF0sIHRbMV0sIHRbMl0pIH1cbn1cblxuZXhwb3J0IGNsYXNzIFU0RiBpbXBsZW1lbnRzIFVuaWZvcm1DZmc8RmxvYXRzPiB7XG4gIGNvbnN0cnVjdG9yKCBwdWJsaWMgdmFsdWU6IEZsb2F0cyApIHt9XG4gIHNldCggZ2w6IEdMLCBoOiBMb2MsIHQ6IEZsb2F0cyApIHsgZ2wudW5pZm9ybTRmKGgsIHRbMF0sIHRbMV0sIHRbMl0sIHRbM10pIH1cbn1cblxuZXhwb3J0IGNsYXNzIFVJIGltcGxlbWVudHMgVW5pZm9ybUNmZzxudW1iZXI+IHtcbiAgY29uc3RydWN0b3IoIHB1YmxpYyB2YWx1ZTogbnVtYmVyICkge31cbiAgc2V0KCBnbDogR0wsIGg6IExvYywgdDogbnVtYmVyICkgeyBnbC51bmlmb3JtMWkoaCwgdCkgfVxufVxuXG5leHBvcnQgY2xhc3MgVTJJIGltcGxlbWVudHMgVW5pZm9ybUNmZzxJbnRzPiB7XG4gIGNvbnN0cnVjdG9yKCBwdWJsaWMgdmFsdWU6IEludHMgKSB7fVxuICBzZXQoIGdsOiBHTCwgaDogTG9jLCB0OiBJbnRzICkgeyBnbC51bmlmb3JtMmkoaCwgdFswXSwgdFsxXSkgfVxufVxuXG5leHBvcnQgY2xhc3MgVTNJIGltcGxlbWVudHMgVW5pZm9ybUNmZzxJbnRzPiB7XG4gIGNvbnN0cnVjdG9yKCBwdWJsaWMgdmFsdWU6IEludHMgKSB7fVxuICBzZXQoIGdsOiBHTCwgaDogTG9jLCB0OiBJbnRzICkgeyBnbC51bmlmb3JtM2koaCwgdFswXSwgdFsxXSwgdFsyXSkgfVxufVxuXG5leHBvcnQgY2xhc3MgVTRJIGltcGxlbWVudHMgVW5pZm9ybUNmZzxJbnRzPiB7XG4gIGNvbnN0cnVjdG9yKCBwdWJsaWMgdmFsdWU6IEludHMgKSB7fVxuICBzZXQoIGdsOiBHTCwgaDogTG9jLCB0OiBJbnRzICkgeyBnbC51bmlmb3JtNGkoaCwgdFswXSwgdFsxXSwgdFsyXSwgdFszXSkgfVxufVxuXG5leHBvcnQgY2xhc3MgVUZWIGltcGxlbWVudHMgVW5pZm9ybUNmZzxGbG9hdHM+IHtcbiAgY29uc3RydWN0b3IoIHB1YmxpYyB2YWx1ZTogRmxvYXRzICkge31cbiAgc2V0KCBnbDogR0wsIGg6IExvYywgdDogRmxvYXRzICkgeyBnbC51bmlmb3JtMWZ2KGgsIGFzRjMyKHQpKSB9XG59XG5cbmV4cG9ydCBjbGFzcyBVMkZWIGltcGxlbWVudHMgVW5pZm9ybUNmZzxGbG9hdHM+IHtcbiAgY29uc3RydWN0b3IoIHB1YmxpYyB2YWx1ZTogRmxvYXRzICkge31cbiAgc2V0KCBnbDogR0wsIGg6IExvYywgdDogRmxvYXRzICkgeyBnbC51bmlmb3JtMmZ2KGgsIGFzRjMyKHQpKSB9XG59XG5cbmV4cG9ydCBjbGFzcyBVM0ZWIGltcGxlbWVudHMgVW5pZm9ybUNmZzxGbG9hdHM+IHtcbiAgY29uc3RydWN0b3IoIHB1YmxpYyB2YWx1ZTogRmxvYXRzICkge31cbiAgc2V0KCBnbDogR0wsIGg6IExvYywgdDogRmxvYXRzICkgeyBnbC51bmlmb3JtM2Z2KGgsIGFzRjMyKHQpKSB9XG59XG5cbmV4cG9ydCBjbGFzcyBVNEZWIGltcGxlbWVudHMgVW5pZm9ybUNmZzxGbG9hdHM+IHtcbiAgY29uc3RydWN0b3IoIHB1YmxpYyB2YWx1ZTogRmxvYXRzICkge31cbiAgc2V0KCBnbDogR0wsIGg6IExvYywgdDogRmxvYXRzICkgeyBnbC51bmlmb3JtNGZ2KGgsIGFzRjMyKHQpKSB9XG59XG5cbmV4cG9ydCBjbGFzcyBVSVYgaW1wbGVtZW50cyBVbmlmb3JtQ2ZnPEludHM+IHtcbiAgY29uc3RydWN0b3IoIHB1YmxpYyB2YWx1ZTogSW50cyApIHt9XG4gIHNldCggZ2w6IEdMLCBoOiBMb2MsIHQ6IEludHMgKSB7IGdsLnVuaWZvcm0xaXYoaCwgYXNJMzIodCkpIH1cbn1cblxuZXhwb3J0IGNsYXNzIFUySVYgaW1wbGVtZW50cyBVbmlmb3JtQ2ZnPEludHM+IHtcbiAgY29uc3RydWN0b3IoIHB1YmxpYyB2YWx1ZTogSW50cyApIHt9XG4gIHNldCggZ2w6IEdMLCBoOiBMb2MsIHQ6IEludHMgKSB7IGdsLnVuaWZvcm0yaXYoaCwgYXNJMzIodCkpIH1cbn1cblxuZXhwb3J0IGNsYXNzIFUzSVYgaW1wbGVtZW50cyBVbmlmb3JtQ2ZnPEludHM+IHtcbiAgY29uc3RydWN0b3IoIHB1YmxpYyB2YWx1ZTogSW50cyApIHt9XG4gIHNldCggZ2w6IEdMLCBoOiBMb2MsIHQ6IEludHMgKSB7IGdsLnVuaWZvcm0zaXYoaCwgYXNJMzIodCkpIH1cbn1cblxuZXhwb3J0IGNsYXNzIFU0SVYgaW1wbGVtZW50cyBVbmlmb3JtQ2ZnPEludHM+IHtcbiAgY29uc3RydWN0b3IoIHB1YmxpYyB2YWx1ZTogSW50cyApIHt9XG4gIHNldCggZ2w6IEdMLCBoOiBMb2MsIHQ6IEludHMgKSB7IGdsLnVuaWZvcm00aXYoaCwgYXNJMzIodCkpIH1cbn1cblxuZXhwb3J0IGNsYXNzIFVNYXRyaXgyIGltcGxlbWVudHMgVW5pZm9ybUNmZzxGbG9hdHM+IHtcbiAgY29uc3RydWN0b3IoIHB1YmxpYyB2YWx1ZTogRmxvYXRzICkge31cbiAgc2V0KCBnbDogR0wsIGg6IExvYywgdDogRmxvYXRzICkgeyBnbC51bmlmb3JtTWF0cml4MmZ2KGgsIGZhbHNlLCBhc0YzMih0KSkgfVxufVxuXG5leHBvcnQgY2xhc3MgVU1hdHJpeDMgaW1wbGVtZW50cyBVbmlmb3JtQ2ZnPEZsb2F0cz4ge1xuICBjb25zdHJ1Y3RvciggcHVibGljIHZhbHVlOiBGbG9hdHMgKSB7fVxuICBzZXQoIGdsOiBHTCwgaDogTG9jLCB0OiBGbG9hdHMgKSB7IGdsLnVuaWZvcm1NYXRyaXgzZnYoaCwgZmFsc2UsIGFzRjMyKHQpKSB9XG59XG5cbmV4cG9ydCBjbGFzcyBVTWF0cml4NCBpbXBsZW1lbnRzIFVuaWZvcm1DZmc8RmxvYXRzPiB7XG4gIGNvbnN0cnVjdG9yKCBwdWJsaWMgdmFsdWU6IEZsb2F0cyApIHt9XG4gIHNldCggZ2w6IEdMLCBoOiBMb2MsIHQ6IEZsb2F0cyApIHsgZ2wudW5pZm9ybU1hdHJpeDRmdihoLCBmYWxzZSwgYXNGMzIodCkpIH1cbn1cblxuZXhwb3J0IGZ1bmN0aW9uIHNldHVwVW5pZm9ybTxUPiAoIGdsOiBHTCwgcHJvZ3JhbTogUHJvZ3JhbSwgbmFtZTogc3RyaW5nLCB1Y2ZnOiBVbmlmb3JtQ2ZnPFQ+ICk6IFVuaWZvcm08VD4gfCBFcnJvciB7XG4gIGNvbnN0IHsgdmFsdWUsIHNldCB9ID0gdWNmZ1xuICBjb25zdCBsb2MgPSBnbC5nZXRVbmlmb3JtTG9jYXRpb24ocHJvZ3JhbSwgbmFtZSlcblxuICBpZiAoIGxvYyA9PSBudWxsICkgcmV0dXJuIG5ldyBFcnJvcihgQ291bGQgbm90IGZpbmQgdW5pZm9ybSAkeyBuYW1lIH1gKVxuICBlbHNlICAgICAgICAgICAgICAgcmV0dXJuIChzZXQoZ2wsIGxvYywgdmFsdWUpLCB7IHZhbHVlLCBzZXQsIGxvYyB9KVxufVxuIiwiaW1wb3J0ICogYXMgQXR0cmlidXRlcyBmcm9tICcuL0F0dHJpYnV0ZXMnXG5pbXBvcnQgKiBhcyBVbmlmb3JtcyBmcm9tICcuL1VuaWZvcm1zJ1xuaW1wb3J0ICogYXMgQ29tbWFuZCBmcm9tICcuL0NvbW1hbmQnXG5pbXBvcnQgKiBhcyBHTFR5cGVzIGZyb20gJy4vR0xUeXBlcydcblxuZXhwb3J0IHsgQXR0cmlidXRlcywgVW5pZm9ybXMsIENvbW1hbmQsIEdMVHlwZXMgfVxuIiwiaW1wb3J0IHsgRmxvYXRzLCBJbnRzIH0gZnJvbSAnLi9HTFR5cGVzJ1xuXG5leHBvcnQgZnVuY3Rpb24gYXNGMzIgKCB0OiBGbG9hdHMgKTogRmxvYXQzMkFycmF5IHtcbiAgcmV0dXJuIHQgaW5zdGFuY2VvZiBGbG9hdDMyQXJyYXkgPyB0IDogbmV3IEZsb2F0MzJBcnJheSh0KVxufVxuXG5leHBvcnQgZnVuY3Rpb24gYXNJMzIgKCB0OiBJbnRzICk6IEludDMyQXJyYXkge1xuICByZXR1cm4gdCBpbnN0YW5jZW9mIEludDMyQXJyYXkgPyB0IDogbmV3IEludDMyQXJyYXkodClcbn1cblxuZXhwb3J0IGZ1bmN0aW9uIHRvRXJyb3I8VD4gKCBzOiBzdHJpbmcsIHY6IFQgfCBudWxsICk6IFQgfCBFcnJvciB7XG4gIHJldHVybiB2ID09IG51bGwgPyBuZXcgRXJyb3IocykgOiB2XG59XG5cbiIsImV4cG9ydCBmdW5jdGlvbiBsb2FkWEhSICh1cmk6IHN0cmluZyk6IFByb21pc2U8c3RyaW5nPiB7XG4gIHJldHVybiBuZXcgUHJvbWlzZSgocmVzLCByZWopID0+IHtcbiAgICBjb25zdCB4aHIgPSBuZXcgWE1MSHR0cFJlcXVlc3RcblxuICAgIHhoci5vbmxvYWQgPSBfID0+IHJlcyh4aHIucmVzcG9uc2UpXG4gICAgeGhyLm9uZXJyb3IgPSBfID0+IHJlaihgQ291bGQgbm90IGxvYWQgJHsgdXJpIH1gKVxuICAgIHhoci5vcGVuKCdHRVQnLCB1cmkpXG4gICAgeGhyLnNlbmQoKVxuICB9KVxufVxuIiwiZXhwb3J0IHR5cGUgTWF0NCA9IEZsb2F0MzJBcnJheVxuZXhwb3J0IHR5cGUgVmVjMyA9IEZsb2F0MzJBcnJheVxuZXhwb3J0IHR5cGUgUXVhdCA9IEZsb2F0MzJBcnJheVxuXG5leHBvcnQgZnVuY3Rpb24gUSAoeDogbnVtYmVyLCB5OiBudW1iZXIsIHo6IG51bWJlciwgdzogbnVtYmVyKTogUXVhdCB7XG4gIGNvbnN0IG91dCA9IG5ldyBGbG9hdDMyQXJyYXkoNClcblxuICBvdXRbMF0gPSB4XG4gIG91dFsxXSA9IHlcbiAgb3V0WzJdID0gelxuICBvdXRbM10gPSB3XG4gIHJldHVybiBvdXRcbn1cblxuZXhwb3J0IGZ1bmN0aW9uIE00ICgpOiBNYXQ0IHtcbiAgY29uc3Qgb3V0ID0gbmV3IEZsb2F0MzJBcnJheSgxNilcblxuICByZXR1cm4gaWRlbnRpdHkob3V0KVxufVxuXG5leHBvcnQgZnVuY3Rpb24gVjMgKHg6IG51bWJlciwgeTogbnVtYmVyLCB6OiBudW1iZXIpOiBWZWMzIHtcbiAgY29uc3Qgb3V0ID0gbmV3IEZsb2F0MzJBcnJheSgzKVxuXG4gIG91dFswXSA9IHhcbiAgb3V0WzFdID0geVxuICBvdXRbMl0gPSB6XG4gIHJldHVybiBvdXRcbn1cblxuZXhwb3J0IGZ1bmN0aW9uIGlkZW50aXR5IChvdXQ6IE1hdDQpOiBNYXQ0IHtcbiAgb3V0WzBdID0gMVxuICBvdXRbMV0gPSAwXG4gIG91dFsyXSA9IDBcbiAgb3V0WzNdID0gMFxuICBvdXRbNF0gPSAwXG4gIG91dFs1XSA9IDFcbiAgb3V0WzZdID0gMFxuICBvdXRbN10gPSAwXG4gIG91dFs4XSA9IDBcbiAgb3V0WzldID0gMFxuICBvdXRbMTBdID0gMVxuICBvdXRbMTFdID0gMFxuICBvdXRbMTJdID0gMFxuICBvdXRbMTNdID0gMFxuICBvdXRbMTRdID0gMFxuICBvdXRbMTVdID0gMVxuICByZXR1cm4gb3V0XG59XG5cbmV4cG9ydCBmdW5jdGlvbiB0cmFuc2xhdGUgKG91dDogTWF0NCwgdjogVmVjMyk6IE1hdDQge1xuICBjb25zdCBbIHgsIHksIHogXSA9IHZcblxuICBvdXRbMTJdID0gb3V0WzBdICogeCArIG91dFs0XSAqIHkgKyBvdXRbOF0gKiB6ICsgb3V0WzEyXVxuICBvdXRbMTNdID0gb3V0WzFdICogeCArIG91dFs1XSAqIHkgKyBvdXRbOV0gKiB6ICsgb3V0WzEzXVxuICBvdXRbMTRdID0gb3V0WzJdICogeCArIG91dFs2XSAqIHkgKyBvdXRbMTBdICogeiArIG91dFsxNF1cbiAgb3V0WzE1XSA9IG91dFszXSAqIHggKyBvdXRbN10gKiB5ICsgb3V0WzExXSAqIHogKyBvdXRbMTVdXG4gIHJldHVybiBvdXRcbn1cblxuZXhwb3J0IGZ1bmN0aW9uIHJvdGF0ZVggKG91dDogTWF0NCwgcmFkOiBudW1iZXIpOiBNYXQ0IHtcbiAgICB2YXIgcyA9IE1hdGguc2luKHJhZCksXG4gICAgICAgIGMgPSBNYXRoLmNvcyhyYWQpLFxuICAgICAgICBhMTAgPSBvdXRbNF0sXG4gICAgICAgIGExMSA9IG91dFs1XSxcbiAgICAgICAgYTEyID0gb3V0WzZdLFxuICAgICAgICBhMTMgPSBvdXRbN10sXG4gICAgICAgIGEyMCA9IG91dFs4XSxcbiAgICAgICAgYTIxID0gb3V0WzldLFxuICAgICAgICBhMjIgPSBvdXRbMTBdLFxuICAgICAgICBhMjMgPSBvdXRbMTFdXG5cbiAgICBvdXRbNF0gPSBhMTAgKiBjICsgYTIwICogc1xuICAgIG91dFs1XSA9IGExMSAqIGMgKyBhMjEgKiBzXG4gICAgb3V0WzZdID0gYTEyICogYyArIGEyMiAqIHNcbiAgICBvdXRbN10gPSBhMTMgKiBjICsgYTIzICogc1xuICAgIG91dFs4XSA9IGEyMCAqIGMgLSBhMTAgKiBzXG4gICAgb3V0WzldID0gYTIxICogYyAtIGExMSAqIHNcbiAgICBvdXRbMTBdID0gYTIyICogYyAtIGExMiAqIHNcbiAgICBvdXRbMTFdID0gYTIzICogYyAtIGExMyAqIHNcbiAgICByZXR1cm4gb3V0XG59XG5cbmV4cG9ydCBmdW5jdGlvbiByb3RhdGVZIChvdXQ6IE1hdDQsIHJhZDogbnVtYmVyKTogTWF0NCB7XG4gICAgdmFyIHMgPSBNYXRoLnNpbihyYWQpLFxuICAgICAgICBjID0gTWF0aC5jb3MocmFkKSxcbiAgICAgICAgYTAwID0gb3V0WzBdLFxuICAgICAgICBhMDEgPSBvdXRbMV0sXG4gICAgICAgIGEwMiA9IG91dFsyXSxcbiAgICAgICAgYTAzID0gb3V0WzNdLFxuICAgICAgICBhMjAgPSBvdXRbOF0sXG4gICAgICAgIGEyMSA9IG91dFs5XSxcbiAgICAgICAgYTIyID0gb3V0WzEwXSxcbiAgICAgICAgYTIzID0gb3V0WzExXTtcblxuICAgIG91dFswXSA9IGEwMCAqIGMgLSBhMjAgKiBzXG4gICAgb3V0WzFdID0gYTAxICogYyAtIGEyMSAqIHNcbiAgICBvdXRbMl0gPSBhMDIgKiBjIC0gYTIyICogc1xuICAgIG91dFszXSA9IGEwMyAqIGMgLSBhMjMgKiBzXG4gICAgb3V0WzhdID0gYTAwICogcyArIGEyMCAqIGNcbiAgICBvdXRbOV0gPSBhMDEgKiBzICsgYTIxICogY1xuICAgIG91dFsxMF0gPSBhMDIgKiBzICsgYTIyICogY1xuICAgIG91dFsxMV0gPSBhMDMgKiBzICsgYTIzICogY1xuICAgIHJldHVybiBvdXRcbn1cblxuZXhwb3J0IGZ1bmN0aW9uIHJvdGF0ZVoob3V0OiBNYXQ0LCByYWQ6IG51bWJlcik6IE1hdDQge1xuICAgIHZhciBzID0gTWF0aC5zaW4ocmFkKSxcbiAgICAgICAgYyA9IE1hdGguY29zKHJhZCksXG4gICAgICAgIGEwMCA9IG91dFswXSxcbiAgICAgICAgYTAxID0gb3V0WzFdLFxuICAgICAgICBhMDIgPSBvdXRbMl0sXG4gICAgICAgIGEwMyA9IG91dFszXSxcbiAgICAgICAgYTEwID0gb3V0WzRdLFxuICAgICAgICBhMTEgPSBvdXRbNV0sXG4gICAgICAgIGExMiA9IG91dFs2XSxcbiAgICAgICAgYTEzID0gb3V0WzddXG5cbiAgICBvdXRbMF0gPSBhMDAgKiBjICsgYTEwICogc1xuICAgIG91dFsxXSA9IGEwMSAqIGMgKyBhMTEgKiBzXG4gICAgb3V0WzJdID0gYTAyICogYyArIGExMiAqIHNcbiAgICBvdXRbM10gPSBhMDMgKiBjICsgYTEzICogc1xuICAgIG91dFs0XSA9IGExMCAqIGMgLSBhMDAgKiBzXG4gICAgb3V0WzVdID0gYTExICogYyAtIGEwMSAqIHNcbiAgICBvdXRbNl0gPSBhMTIgKiBjIC0gYTAyICogc1xuICAgIG91dFs3XSA9IGExMyAqIGMgLSBhMDMgKiBzXG4gICAgcmV0dXJuIG91dFxufVxuXG5leHBvcnQgZnVuY3Rpb24gc2NhbGUgKG91dDogTWF0NCwgdjogVmVjMykge1xuICAgIHZhciB4ID0gdlswXSwgeSA9IHZbMV0sIHogPSB2WzJdXG5cbiAgICBvdXRbMF0gPSBvdXRbMF0gKiB4XG4gICAgb3V0WzFdID0gb3V0WzFdICogeFxuICAgIG91dFsyXSA9IG91dFsyXSAqIHhcbiAgICBvdXRbM10gPSBvdXRbM10gKiB4XG4gICAgb3V0WzRdID0gb3V0WzRdICogeVxuICAgIG91dFs1XSA9IG91dFs1XSAqIHlcbiAgICBvdXRbNl0gPSBvdXRbNl0gKiB5XG4gICAgb3V0WzddID0gb3V0WzddICogeVxuICAgIG91dFs4XSA9IG91dFs4XSAqIHpcbiAgICBvdXRbOV0gPSBvdXRbOV0gKiB6XG4gICAgb3V0WzEwXSA9IG91dFsxMF0gKiB6XG4gICAgb3V0WzExXSA9IG91dFsxMV0gKiB6XG4gICAgb3V0WzEyXSA9IG91dFsxMl1cbiAgICBvdXRbMTNdID0gb3V0WzEzXVxuICAgIG91dFsxNF0gPSBvdXRbMTRdXG4gICAgb3V0WzE1XSA9IG91dFsxNV1cbiAgICByZXR1cm4gb3V0XG59XG5cbmV4cG9ydCBmdW5jdGlvbiBmcm9tUm90YXRpb25UcmFuc2xhdGlvbiAob3V0OiBNYXQ0LCBxOiBRdWF0LCB2OiBWZWMzKSB7XG4gIHZhciB4ID0gcVswXSwgeSA9IHFbMV0sIHogPSBxWzJdLCB3ID0gcVszXSxcbiAgICAgIHgyID0geCArIHgsXG4gICAgICB5MiA9IHkgKyB5LFxuICAgICAgejIgPSB6ICsgeixcblxuICAgICAgeHggPSB4ICogeDIsXG4gICAgICB4eSA9IHggKiB5MixcbiAgICAgIHh6ID0geCAqIHoyLFxuICAgICAgeXkgPSB5ICogeTIsXG4gICAgICB5eiA9IHkgKiB6MixcbiAgICAgIHp6ID0geiAqIHoyLFxuICAgICAgd3ggPSB3ICogeDIsXG4gICAgICB3eSA9IHcgKiB5MixcbiAgICAgIHd6ID0gdyAqIHoyXG5cbiAgb3V0WzBdID0gMSAtICh5eSArIHp6KVxuICBvdXRbMV0gPSB4eSArIHd6XG4gIG91dFsyXSA9IHh6IC0gd3lcbiAgb3V0WzNdID0gMFxuICBvdXRbNF0gPSB4eSAtIHd6XG4gIG91dFs1XSA9IDEgLSAoeHggKyB6eilcbiAgb3V0WzZdID0geXogKyB3eFxuICBvdXRbN10gPSAwXG4gIG91dFs4XSA9IHh6ICsgd3lcbiAgb3V0WzldID0geXogLSB3eFxuICBvdXRbMTBdID0gMSAtICh4eCArIHl5KVxuICBvdXRbMTFdID0gMFxuICBvdXRbMTJdID0gdlswXVxuICBvdXRbMTNdID0gdlsxXVxuICBvdXRbMTRdID0gdlsyXVxuICBvdXRbMTVdID0gMVxuICBcbiAgcmV0dXJuIG91dFxufVxuXG5leHBvcnQgZnVuY3Rpb24gbG9va0F0IChvdXQ6IE1hdDQsIGV5ZTogVmVjMywgY2VudGVyOiBWZWMzLCB1cDogVmVjMykge1xuICB2YXIgeDA6IG51bWJlciwgXG4gICAgICB4MTogbnVtYmVyLCBcbiAgICAgIHgyOiBudW1iZXIsIFxuICAgICAgeTA6IG51bWJlciwgXG4gICAgICB5MTogbnVtYmVyLCBcbiAgICAgIHkyOiBudW1iZXIsIFxuICAgICAgejA6IG51bWJlciwgXG4gICAgICB6MTogbnVtYmVyLCBcbiAgICAgIHoyOiBudW1iZXIsIFxuICAgICAgbGVuOiBudW1iZXI7XG4gIHZhciBleWV4ID0gZXllWzBdLFxuICAgICAgZXlleSA9IGV5ZVsxXSxcbiAgICAgIGV5ZXogPSBleWVbMl0sXG4gICAgICB1cHggPSB1cFswXSxcbiAgICAgIHVweSA9IHVwWzFdLFxuICAgICAgdXB6ID0gdXBbMl0sXG4gICAgICBjZW50ZXJ4ID0gY2VudGVyWzBdLFxuICAgICAgY2VudGVyeSA9IGNlbnRlclsxXSxcbiAgICAgIGNlbnRlcnogPSBjZW50ZXJbMl07XG5cbiAgaWYgKE1hdGguYWJzKGV5ZXggLSBjZW50ZXJ4KSA8IDAuMDAwMDAxICYmXG4gICAgTWF0aC5hYnMoZXlleSAtIGNlbnRlcnkpIDwgMC4wMDAwMDEgJiZcbiAgICBNYXRoLmFicyhleWV6IC0gY2VudGVyeikgPCAwLjAwMDAwMSkge1xuICAgIHJldHVybiBpZGVudGl0eShvdXQpO1xuICB9XG5cbiAgejAgPSBleWV4IC0gY2VudGVyeDtcbiAgejEgPSBleWV5IC0gY2VudGVyeTtcbiAgejIgPSBleWV6IC0gY2VudGVyejtcblxuICBsZW4gPSAxIC8gTWF0aC5zcXJ0KHowICogejAgKyB6MSAqIHoxICsgejIgKiB6Mik7XG4gIHowICo9IGxlbjtcbiAgejEgKj0gbGVuO1xuICB6MiAqPSBsZW47XG5cbiAgeDAgPSB1cHkgKiB6MiAtIHVweiAqIHoxO1xuICB4MSA9IHVweiAqIHowIC0gdXB4ICogejI7XG4gIHgyID0gdXB4ICogejEgLSB1cHkgKiB6MDtcbiAgbGVuID0gTWF0aC5zcXJ0KHgwICogeDAgKyB4MSAqIHgxICsgeDIgKiB4Mik7XG4gIGlmICghbGVuKSB7XG4gICAgICB4MCA9IDA7XG4gICAgICB4MSA9IDA7XG4gICAgICB4MiA9IDA7XG4gIH0gZWxzZSB7XG4gICAgICBsZW4gPSAxIC8gbGVuO1xuICAgICAgeDAgKj0gbGVuO1xuICAgICAgeDEgKj0gbGVuO1xuICAgICAgeDIgKj0gbGVuO1xuICB9XG5cbiAgeTAgPSB6MSAqIHgyIC0gejIgKiB4MTtcbiAgeTEgPSB6MiAqIHgwIC0gejAgKiB4MjtcbiAgeTIgPSB6MCAqIHgxIC0gejEgKiB4MDtcblxuICBsZW4gPSBNYXRoLnNxcnQoeTAgKiB5MCArIHkxICogeTEgKyB5MiAqIHkyKTtcbiAgaWYgKCFsZW4pIHtcbiAgICAgIHkwID0gMDtcbiAgICAgIHkxID0gMDtcbiAgICAgIHkyID0gMDtcbiAgfSBlbHNlIHtcbiAgICAgIGxlbiA9IDEgLyBsZW47XG4gICAgICB5MCAqPSBsZW47XG4gICAgICB5MSAqPSBsZW47XG4gICAgICB5MiAqPSBsZW47XG4gIH1cblxuICBvdXRbMF0gPSB4MDtcbiAgb3V0WzFdID0geTA7XG4gIG91dFsyXSA9IHowO1xuICBvdXRbM10gPSAwO1xuICBvdXRbNF0gPSB4MTtcbiAgb3V0WzVdID0geTE7XG4gIG91dFs2XSA9IHoxO1xuICBvdXRbN10gPSAwO1xuICBvdXRbOF0gPSB4MjtcbiAgb3V0WzldID0geTI7XG4gIG91dFsxMF0gPSB6MjtcbiAgb3V0WzExXSA9IDA7XG4gIG91dFsxMl0gPSAtKHgwICogZXlleCArIHgxICogZXlleSArIHgyICogZXlleik7XG4gIG91dFsxM10gPSAtKHkwICogZXlleCArIHkxICogZXlleSArIHkyICogZXlleik7XG4gIG91dFsxNF0gPSAtKHowICogZXlleCArIHoxICogZXlleSArIHoyICogZXlleik7XG4gIG91dFsxNV0gPSAxO1xuXG4gIHJldHVybiBvdXQ7XG59O1xuXG5leHBvcnQgZnVuY3Rpb24gcGVyc3BlY3RpdmUgKG91dDogTWF0NCwgZm92eTogbnVtYmVyLCBhc3BlY3Q6IG51bWJlciwgbmVhcjogbnVtYmVyLCBmYXI6IG51bWJlcik6IE1hdDQge1xuICAgIHZhciBmID0gMS4wIC8gTWF0aC50YW4oZm92eSAvIDIpLFxuICAgICAgICBuZiA9IDEgLyAobmVhciAtIGZhcik7XG4gICAgb3V0WzBdID0gZiAvIGFzcGVjdDtcbiAgICBvdXRbMV0gPSAwO1xuICAgIG91dFsyXSA9IDA7XG4gICAgb3V0WzNdID0gMDtcbiAgICBvdXRbNF0gPSAwO1xuICAgIG91dFs1XSA9IGY7XG4gICAgb3V0WzZdID0gMDtcbiAgICBvdXRbN10gPSAwO1xuICAgIG91dFs4XSA9IDA7XG4gICAgb3V0WzldID0gMDtcbiAgICBvdXRbMTBdID0gKGZhciArIG5lYXIpICogbmY7XG4gICAgb3V0WzExXSA9IC0xO1xuICAgIG91dFsxMl0gPSAwO1xuICAgIG91dFsxM10gPSAwO1xuICAgIG91dFsxNF0gPSAoMiAqIGZhciAqIG5lYXIpICogbmY7XG4gICAgb3V0WzE1XSA9IDA7XG4gICAgcmV0dXJuIG91dDtcbn07XG5cbi8vIGV4cG9ydCBmdW5jdGlvbiBtdWx0aXBseShvdXQ6IE1hdDQsIGE6IE1hdDQsIGI6IE1hdDQpOiBNYXQ0IHtcbi8vICAgICB2YXIgYTAwID0gYVswXSwgYTAxID0gYVsxXSwgYTAyID0gYVsyXSwgYTAzID0gYVszXSxcbi8vICAgICAgICAgYTEwID0gYVs0XSwgYTExID0gYVs1XSwgYTEyID0gYVs2XSwgYTEzID0gYVs3XSxcbi8vICAgICAgICAgYTIwID0gYVs4XSwgYTIxID0gYVs5XSwgYTIyID0gYVsxMF0sIGEyMyA9IGFbMTFdLFxuLy8gICAgICAgICBhMzAgPSBhWzEyXSwgYTMxID0gYVsxM10sIGEzMiA9IGFbMTRdLCBhMzMgPSBhWzE1XTtcbi8vIFxuLy8gICAgIC8vIENhY2hlIG9ubHkgdGhlIGN1cnJlbnQgbGluZSBvZiB0aGUgc2Vjb25kIG1hdHJpeFxuLy8gICAgIHZhciBiMCAgPSBiWzBdLCBiMSA9IGJbMV0sIGIyID0gYlsyXSwgYjMgPSBiWzNdOyAgXG4vLyAgICAgb3V0WzBdID0gYjAqYTAwICsgYjEqYTEwICsgYjIqYTIwICsgYjMqYTMwO1xuLy8gICAgIG91dFsxXSA9IGIwKmEwMSArIGIxKmExMSArIGIyKmEyMSArIGIzKmEzMTtcbi8vICAgICBvdXRbMl0gPSBiMCphMDIgKyBiMSphMTIgKyBiMiphMjIgKyBiMyphMzI7XG4vLyAgICAgb3V0WzNdID0gYjAqYTAzICsgYjEqYTEzICsgYjIqYTIzICsgYjMqYTMzO1xuLy8gXG4vLyAgICAgYjAgPSBiWzRdOyBiMSA9IGJbNV07IGIyID0gYls2XTsgYjMgPSBiWzddO1xuLy8gICAgIG91dFs0XSA9IGIwKmEwMCArIGIxKmExMCArIGIyKmEyMCArIGIzKmEzMDtcbi8vICAgICBvdXRbNV0gPSBiMCphMDEgKyBiMSphMTEgKyBiMiphMjEgKyBiMyphMzE7XG4vLyAgICAgb3V0WzZdID0gYjAqYTAyICsgYjEqYTEyICsgYjIqYTIyICsgYjMqYTMyO1xuLy8gICAgIG91dFs3XSA9IGIwKmEwMyArIGIxKmExMyArIGIyKmEyMyArIGIzKmEzMztcbi8vIFxuLy8gICAgIGIwID0gYls4XTsgYjEgPSBiWzldOyBiMiA9IGJbMTBdOyBiMyA9IGJbMTFdO1xuLy8gICAgIG91dFs4XSA9IGIwKmEwMCArIGIxKmExMCArIGIyKmEyMCArIGIzKmEzMDtcbi8vICAgICBvdXRbOV0gPSBiMCphMDEgKyBiMSphMTEgKyBiMiphMjEgKyBiMyphMzE7XG4vLyAgICAgb3V0WzEwXSA9IGIwKmEwMiArIGIxKmExMiArIGIyKmEyMiArIGIzKmEzMjtcbi8vICAgICBvdXRbMTFdID0gYjAqYTAzICsgYjEqYTEzICsgYjIqYTIzICsgYjMqYTMzO1xuLy8gXG4vLyAgICAgYjAgPSBiWzEyXTsgYjEgPSBiWzEzXTsgYjIgPSBiWzE0XTsgYjMgPSBiWzE1XTtcbi8vICAgICBvdXRbMTJdID0gYjAqYTAwICsgYjEqYTEwICsgYjIqYTIwICsgYjMqYTMwO1xuLy8gICAgIG91dFsxM10gPSBiMCphMDEgKyBiMSphMTEgKyBiMiphMjEgKyBiMyphMzE7XG4vLyAgICAgb3V0WzE0XSA9IGIwKmEwMiArIGIxKmExMiArIGIyKmEyMiArIGIzKmEzMjtcbi8vICAgICBvdXRbMTVdID0gYjAqYTAzICsgYjEqYTEzICsgYjIqYTIzICsgYjMqYTMzO1xuLy8gICAgIHJldHVybiBvdXQ7XG4vLyB9O1xuIiwiaW1wb3J0IHsgXG4gIFBhcnNlciwgZm1hcCwgbGlmdCwgbGlmdDMsIGxpZnQ0LCBkb1RoZW4gXG59IGZyb20gJy4vUGFyc2VyJ1xuaW1wb3J0IHsgXG4gIHNsYXNoLCBzcGFjZXMsIHJlYWwsIGludGVnZXIsIG5ld2xpbmUsXG4gIG9yRGVmYXVsdCwgb3B0aW9uYWwsIGFueU9mLCBpblJhbmdlLCBzYXRpc2Z5LFxuICBleGFjdGx5LCBtYXRjaCwgbWFueTEsIG1hbnksIGF0bGVhc3ROLFxuICBpbnRlcnNwZXJzaW5nXG59IGZyb20gJy4vcGFyc2VycydcbmltcG9ydCB7IElHZW9tZXRyeSB9IGZyb20gJy4uL1JlbmRlcmluZy9HZW9tZXRyeSdcblxuZXhwb3J0IHR5cGUgVjMgPSBbIG51bWJlciwgbnVtYmVyLCBudW1iZXIgXVxuZXhwb3J0IHR5cGUgVjQgPSBbIG51bWJlciwgbnVtYmVyLCBudW1iZXIsIG51bWJlciBdXG5leHBvcnQgaW50ZXJmYWNlIElGYWNlVmVydGV4IHsgdjogbnVtYmVyLCB2dD86IG51bWJlciwgdm4/OiBudW1iZXIgfVxuXG5leHBvcnQgaW50ZXJmYWNlIElWZXJ0ZXggICB7IGtpbmQ6ICdWZXJ0ZXgnLCAgIHZhbHVlOiBWNCB9XG5leHBvcnQgaW50ZXJmYWNlIElUZXhDb29yZCB7IGtpbmQ6ICdUZXhDb29yZCcsIHZhbHVlOiBWMyB9XG5leHBvcnQgaW50ZXJmYWNlIElOb3JtYWwgICB7IGtpbmQ6ICdOb3JtYWwnLCAgIHZhbHVlOiBWMyB9XG5leHBvcnQgaW50ZXJmYWNlIElGYWNlICAgICB7IGtpbmQ6ICdGYWNlJywgICAgIHZhbHVlOiBJRmFjZVZlcnRleFtdIH1cbmV4cG9ydCBpbnRlcmZhY2UgSUlnbm9yZWQgIHsga2luZDogJ0lnbm9yZWQnLCAgdmFsdWU6IHN0cmluZyB9XG5cbmV4cG9ydCBjb25zdCBWZXJ0ID0gKHg6IG51bWJlciwgeTogbnVtYmVyLCB6OiBudW1iZXIsIHc6IG51bWJlcik6IElWZXJ0ZXggPT4gKHsgXG4gIGtpbmQ6ICdWZXJ0ZXgnLCBcbiAgdmFsdWU6IFsgeCwgeSwgeiwgdyBdXG59KVxuXG5leHBvcnQgY29uc3QgVGV4Q29vcmQgPSAoeDogbnVtYmVyLCB5OiBudW1iZXIsIHo6IG51bWJlcik6IElUZXhDb29yZCA9PiAoeyBcbiAga2luZDogJ1RleENvb3JkJywgXG4gIHZhbHVlOiBbIHgsIHksIHogXVxufSlcblxuZXhwb3J0IGNvbnN0IEZhY2UgPSAoaW5kaWNlczogSUZhY2VWZXJ0ZXhbXSk6IElGYWNlID0+ICh7IFxuICBraW5kOiAnRmFjZScsIFxuICB2YWx1ZTogaW5kaWNlc1xufSlcblxuZXhwb3J0IGNvbnN0IE5vcm1hbCA9ICh4OiBudW1iZXIsIHk6IG51bWJlciwgejogbnVtYmVyKTogSU5vcm1hbCA9PiAoeyBcbiAga2luZDogJ05vcm1hbCcsIFxuICB2YWx1ZTogWyB4LCB5LCB6IF0gXG59KVxuXG5leHBvcnQgY29uc3QgSWdub3JlZCA9IChzOiBzdHJpbmcpOiBJSWdub3JlZCA9PiAoeyBcbiAga2luZDogJ0lnbm9yZWQnLFxuICB2YWx1ZTogc1xufSlcblxuZXhwb3J0IHR5cGUgTGluZVxuICA9IElWZXJ0ZXggXG4gIHwgSVRleENvb3JkIFxuICB8IElOb3JtYWxcbiAgfCBJRmFjZVxuICB8IElJZ25vcmVkXG5cbmNvbnN0IHNwYWNlZCA9IDxBPiAocDogUGFyc2VyPEE+KTogUGFyc2VyPEE+ID0+IGRvVGhlbihzcGFjZXMsIHApXG5jb25zdCB0eENvb3JkID0gaW5SYW5nZSgwLCAxLCByZWFsKVxuY29uc3QgYW55Q2hhciA9IHNhdGlzZnkoXyA9PiB0cnVlKVxuXG5jb25zdCBmYWNlVmVydGV4ID1cbiAgbGlmdDMoKHYsIHZ0LCB2bikgPT4gKHsgdiwgdnQsIHZuIH0pLFxuICAgICAgICBzcGFjZWQoaW50ZWdlciksXG4gICAgICAgIG9wdGlvbmFsKGRvVGhlbihzbGFzaCwgb3B0aW9uYWwoaW50ZWdlcikpKSxcbiAgICAgICAgb3B0aW9uYWwoZG9UaGVuKHNsYXNoLCBpbnRlZ2VyKSkpXG5cbmV4cG9ydCBjb25zdCB2ZXJ0ZXg6IFBhcnNlcjxMaW5lPiA9XG4gIGxpZnQ0KFZlcnQsIFxuICAgICAgICBkb1RoZW4oZXhhY3RseSgndicpLCBzcGFjZWQocmVhbCkpLCBcbiAgICAgICAgc3BhY2VkKHJlYWwpLCBcbiAgICAgICAgc3BhY2VkKHJlYWwpLCBcbiAgICAgICAgc3BhY2VkKG9yRGVmYXVsdChyZWFsLCAxLjApKSlcblxuZXhwb3J0IGNvbnN0IHRleENvb3JkOiBQYXJzZXI8TGluZT4gPVxuICBsaWZ0MyhUZXhDb29yZCxcbiAgICAgICAgZG9UaGVuKG1hdGNoKCd2dCcpLCBzcGFjZWQodHhDb29yZCkpLFxuICAgICAgICBzcGFjZWQodHhDb29yZCksXG4gICAgICAgIHNwYWNlZChvckRlZmF1bHQodHhDb29yZCwgMC4wKSkpXG5cbmV4cG9ydCBjb25zdCBub3JtYWw6IFBhcnNlcjxMaW5lPiA9XG4gIGxpZnQzKE5vcm1hbCxcbiAgICAgICAgZG9UaGVuKG1hdGNoKCd2bicpLCBzcGFjZWQocmVhbCkpLFxuICAgICAgICBzcGFjZWQocmVhbCksXG4gICAgICAgIHNwYWNlZChyZWFsKSlcblxuZXhwb3J0IGNvbnN0IGZhY2U6IFBhcnNlcjxMaW5lPiA9IFxuICBsaWZ0KEZhY2UsIGRvVGhlbihtYXRjaCgnZicpLCBhdGxlYXN0TigzLCBzcGFjZWQoZmFjZVZlcnRleCkpKSlcblxuZXhwb3J0IGNvbnN0IGlnbm9yZWQ6IFBhcnNlcjxMaW5lPiA9XG4gIGxpZnQoSWdub3JlZCwgZm1hcChjcyA9PiBjcy5qb2luKCcnKSwgbWFueTEoYW55Q2hhcikpKVxuXG5leHBvcnQgY29uc3QgbGluZTogUGFyc2VyPExpbmU+ID0gXG4gIGFueU9mKFsgdmVydGV4LCB0ZXhDb29yZCwgbm9ybWFsLCBmYWNlLCBpZ25vcmVkIF0pXG5cbmZ1bmN0aW9uIGxpbmVzVG9HZW9tZXRyeSAobGluZXM6IExpbmVbXSk6IElHZW9tZXRyeSB7XG4gIGNvbnN0IHBWZXJ0aWNlczogVjRbXSA9IFtdXG4gIGNvbnN0IHBOb3JtYWxzOiBWM1tdID0gW11cbiAgY29uc3QgcFRleENvb3JkczogVjNbXSA9IFtdXG4gIGNvbnN0IHBGYWNlczogSUZhY2VWZXJ0ZXhbXSA9IFtdXG5cbiAgZm9yICggdmFyIGkgPSAwOyBpIDwgbGluZXMubGVuZ3RoOyBpKyspIHtcbiAgICB2YXIgbCA9IGxpbmVzW2ldXG5cbiAgICBpZiAgICAgICggbC5raW5kID09PSAnVmVydGV4JyApICAgcFZlcnRpY2VzLnB1c2gobC52YWx1ZSlcbiAgICBlbHNlIGlmICggbC5raW5kID09PSAnTm9ybWFsJyApICAgcE5vcm1hbHMucHVzaChsLnZhbHVlKVxuICAgIGVsc2UgaWYgKCBsLmtpbmQgPT09ICdUZXhDb29yZCcgKSBwVGV4Q29vcmRzLnB1c2gobC52YWx1ZSlcbiAgICBlbHNlIGlmICggbC5raW5kID09PSAnRmFjZScgKSAgICAgcEZhY2VzLnB1c2goLi4ubC52YWx1ZSlcbiAgICBlbHNlIHt9XG4gIH1cbiAgY29uc3QgdmVydGljZXMgPSBuZXcgQXJyYXkocEZhY2VzLmxlbmd0aCAqIDMpXG4gIGNvbnN0IG5vcm1hbHMgPSBuZXcgQXJyYXkocEZhY2VzLmxlbmd0aCAqIDMpXG4gIGNvbnN0IHRleENvb3JkcyA9IG5ldyBBcnJheShwRmFjZXMubGVuZ3RoICogMilcbiAgY29uc3QgZGVmYXVsdE5vcm1hbCA9IFsgMCwgMCwgMSBdXG4gIGNvbnN0IGRlZmF1bHRUZXhDb29yZCA9IFsgMCwgMCBdXG5cbiAgZm9yICggdmFyIGkgPSAwOyBpIDwgcEZhY2VzLmxlbmd0aDsgaSsrKSB7XG4gICAgdmFyIHsgdiwgdnQsIHZuIH0gPSBwRmFjZXNbaV0gXG4gICAgdmFyIHZlcnQgPSBwVmVydGljZXNbdiAtIDFdXG4gICAgdmFyIG5vcm1hbCA9IHZuICE9IG51bGwgPyBwTm9ybWFsc1t2biAtIDFdIDogZGVmYXVsdE5vcm1hbFxuICAgIHZhciB0ZXhDb29yZCA9IHZ0ICE9IG51bGwgPyBwVGV4Q29vcmRzW3Z0IC0gMV0gOiBkZWZhdWx0VGV4Q29vcmQgXG5cbiAgICB2ZXJ0aWNlc1tpICogM10gICAgICA9IHZlcnRbMF1cbiAgICB2ZXJ0aWNlc1tpICogMyArIDFdICA9IHZlcnRbMV1cbiAgICB2ZXJ0aWNlc1tpICogMyArIDJdICA9IHZlcnRbMl1cbiAgICBub3JtYWxzW2kgKiAzXSAgICAgICA9IG5vcm1hbFswXVxuICAgIG5vcm1hbHNbaSAqIDMgKyAxXSAgID0gbm9ybWFsWzFdXG4gICAgbm9ybWFsc1tpICogMyArIDJdICAgPSBub3JtYWxbMl1cbiAgICB0ZXhDb29yZHNbaSAqIDJdICAgICA9IHRleENvb3JkWzBdXG4gICAgdGV4Q29vcmRzW2kgKiAyICsgMV0gPSB0ZXhDb29yZFsxXVxuICB9XG4gIHJldHVybiB7IHZlcnRpY2VzLCBub3JtYWxzLCB0ZXhDb29yZHMgfVxufVxuXG5leHBvcnQgY29uc3QgcGFyc2VPQkogPSBcbiAgZm1hcChsaW5lc1RvR2VvbWV0cnksIGludGVyc3BlcnNpbmcobGluZSwgbWFueShuZXdsaW5lKSkpXG4iLCJleHBvcnQgaW50ZXJmYWNlIElSZXN1bHQ8QT4ge1xuICBzdWNjZXNzOiB0cnVlXG4gIHZhbDogQVxuICByZXN0OiBzdHJpbmdcbn1cblxuZXhwb3J0IGludGVyZmFjZSBJRXJyIHtcbiAgc3VjY2VzczogZmFsc2VcbiAgbWVzc2FnZTogc3RyaW5nXG59XG5cbmV4cG9ydCBjbGFzcyBSZXN1bHQ8QT4gaW1wbGVtZW50cyBJUmVzdWx0PEE+IHtcbiAgc3VjY2VzczogdHJ1ZSA9IHRydWVcbiAgY29uc3RydWN0b3IocHVibGljIHZhbDogQSwgcHVibGljIHJlc3Q6IHN0cmluZykge30gXG59XG5cbmV4cG9ydCBjbGFzcyBFcnIgaW1wbGVtZW50cyBJRXJyIHtcbiAgc3VjY2VzczogZmFsc2UgPSBmYWxzZVxuICBjb25zdHJ1Y3RvcihwdWJsaWMgbWVzc2FnZTogc3RyaW5nKSB7fVxufVxuXG5leHBvcnQgdHlwZSBPdXRjb21lPEE+ID0gSVJlc3VsdDxBPiB8IEVyclxuXG5leHBvcnQgdHlwZSBQYXJzZXI8QT4gPSAoczogc3RyaW5nKSA9PiBPdXRjb21lPEE+XG5cbmV4cG9ydCBmdW5jdGlvbiB1bml0PEE+IChhOiBBKTogUGFyc2VyPEE+IHtcbiAgcmV0dXJuIChzOiBzdHJpbmcpID0+IG5ldyBSZXN1bHQoYSwgcylcbn1cblxuZXhwb3J0IGZ1bmN0aW9uIGZhaWxlZCAobXNnOiBzdHJpbmcpOiBQYXJzZXI8c3RyaW5nPiB7XG4gIHJldHVybiAoXzogc3RyaW5nKSA9PiBuZXcgRXJyKG1zZylcbn1cblxuZXhwb3J0IGZ1bmN0aW9uIGZtYXA8QSwgQj4gKGY6IChhOiBBKSA9PiBCLCBwYTogUGFyc2VyPEE+KTogUGFyc2VyPEI+IHtcbiAgcmV0dXJuIGZsYXRNYXAocGEsIGEgPT4gdW5pdChmKGEpKSlcbn1cblxuZXhwb3J0IGZ1bmN0aW9uIGFwcGx5PEEsIEI+IChwZjogUGFyc2VyPChhOiBBKSA9PiBCPiwgcGE6IFBhcnNlcjxBPik6IFBhcnNlcjxCPiB7XG4gIHJldHVybiBmbGF0TWFwKHBmLCBmID0+IGZtYXAoZiwgcGEpKVxufVxuXG5leHBvcnQgZnVuY3Rpb24gbGlmdDxBLCBCPiAoZjogKGE6IEEpID0+IEIsIHBhOiBQYXJzZXI8QT4pOiBQYXJzZXI8Qj4ge1xuICByZXR1cm4gYXBwbHkodW5pdChmKSwgcGEpXG59XG5cbmV4cG9ydCBmdW5jdGlvbiBsaWZ0MjxBLCBCLCBDPiAoZjogKGE6IEEsIGI6IEIpID0+IEMsIHBhOiBQYXJzZXI8QT4sIHBiOiBQYXJzZXI8Qj4pOiBQYXJzZXI8Qz4ge1xuICByZXR1cm4gYXBwbHkoZm1hcCgoYTogQSkgPT4gKGI6IEIpID0+IGYoYSwgYiksIHBhKSwgcGIpXG59XG5cbmV4cG9ydCBmdW5jdGlvbiBsaWZ0MzxBLCBCLCBDLCBEPiBcbihmOiAoYTogQSwgYjogQiwgYzogQykgPT4gRCwgcGE6IFBhcnNlcjxBPiwgcGI6IFBhcnNlcjxCPiwgcGM6IFBhcnNlcjxDPik6IFBhcnNlcjxEPiB7XG4gIGNvbnN0IGNoYWluID0gKGE6IEEpID0+IChiOiBCKSA9PiAoYzogQykgPT4gZihhLCBiLCBjKVxuXG4gIHJldHVybiBhcHBseShhcHBseShmbWFwKGNoYWluLCBwYSksIHBiKSwgcGMpXG59XG5cbmV4cG9ydCBmdW5jdGlvbiBsaWZ0NDxBLCBCLCBDLCBELCBFPiAoZjogKGE6IEEsIGI6IEIsIGM6IEMsIGQ6IEQpID0+IEUsIHBhOiBQYXJzZXI8QT4sIHBiOiBQYXJzZXI8Qj4sIHBjOiBQYXJzZXI8Qz4sIHBkOiBQYXJzZXI8RD4pOiBQYXJzZXI8RT4ge1xuICBjb25zdCBjaGFpbiA9IChhOiBBKSA9PiAoYjogQikgPT4gKGM6IEMpID0+IChkOiBEKSA9PiBmKGEsIGIsIGMsIGQpXG5cbiAgcmV0dXJuIGFwcGx5KGFwcGx5KGFwcGx5KGZtYXAoY2hhaW4sIHBhKSwgcGIpLCBwYyksIHBkKVxufVxuXG5leHBvcnQgZnVuY3Rpb24gZmxhdE1hcDxBLCBCPiAocGE6IFBhcnNlcjxBPiwgZjogKGE6IEEpID0+IFBhcnNlcjxCPik6IFBhcnNlcjxCPiB7XG4gIHJldHVybiBmdW5jdGlvbiAoczogc3RyaW5nKTogT3V0Y29tZTxCPiB7XG4gICAgY29uc3Qgb3V0ID0gcGEocylcblxuICAgIHJldHVybiBvdXQuc3VjY2Vzc1xuICAgICAgPyBmKG91dC52YWwpKG91dC5yZXN0KVxuICAgICAgOiBuZXcgRXJyKG91dC5tZXNzYWdlKVxuICB9XG59XG5cbmV4cG9ydCBmdW5jdGlvbiBkb1RoZW48QSwgQj4gKHAxOiBQYXJzZXI8QT4sIHAyOiBQYXJzZXI8Qj4pOiBQYXJzZXI8Qj4ge1xuICByZXR1cm4gZmxhdE1hcChwMSwgXyA9PiBwMilcbn1cbiIsImltcG9ydCB7IGlzQWxwaGEsIGlzTnVtYmVyIH0gZnJvbSAnLi9wcmVkaWNhdGVzJ1xuaW1wb3J0IHsgT3V0Y29tZSwgUmVzdWx0LCBFcnIsIFBhcnNlciwgZmxhdE1hcCwgZG9UaGVuLCBmbWFwLCB1bml0LCBmYWlsZWQgfSBmcm9tICcuL1BhcnNlcidcblxuZXhwb3J0IGZ1bmN0aW9uIHNhdGlzZnkgKGY6IChzOiBzdHJpbmcpID0+IGJvb2xlYW4pOiBQYXJzZXI8c3RyaW5nPiB7XG4gIHJldHVybiBmdW5jdGlvbiAoc3RyOiBzdHJpbmcpOiBPdXRjb21lPHN0cmluZz4geyBcbiAgICBpZiAgICAgICggc3RyLmxlbmd0aCA9PT0gMCApICAgcmV0dXJuIG5ldyBFcnIoJ05vdGhpbmcgdG8gY29uc3VtZScpXG4gICAgZWxzZSBpZiAoIGYoc3RyLnNsaWNlKDAsIDEpKSApIHJldHVybiBuZXcgUmVzdWx0KHN0ci5zbGljZSgwLCAxKSwgc3RyLnNsaWNlKDEpKVxuICAgIGVsc2UgICAgICAgICAgICAgICAgICAgICAgICAgICByZXR1cm4gbmV3IEVycihgJHsgc3RyWzBdIH0gZGlkIG5vdCBzYXRpc2Z5YClcbiAgfVxufVxuXG5leHBvcnQgZnVuY3Rpb24gZXhhY3RseSAoY2hhcmFjdGVyOiBzdHJpbmcpOiBQYXJzZXI8c3RyaW5nPiB7XG4gIHJldHVybiBzYXRpc2Z5KG4gPT4gbiA9PT0gY2hhcmFjdGVyKVxufVxuXG5leHBvcnQgZnVuY3Rpb24gbWF0Y2ggKHRhcmdldDogc3RyaW5nKTogUGFyc2VyPHN0cmluZz4ge1xuICByZXR1cm4gZnVuY3Rpb24gKHM6IHN0cmluZyk6IE91dGNvbWU8c3RyaW5nPiB7XG4gICAgZm9yICggdmFyIGkgPSAwOyBpIDwgdGFyZ2V0Lmxlbmd0aDsgaSsrICkge1xuICAgICAgaWYgKCBzW2ldICE9PSB0YXJnZXRbaV0gKSByZXR1cm4gbmV3IEVycihgJHsgc1tpXSB9IGRpZCBub3QgbWF0Y2ggJHsgdGFyZ2V0W2ldIH1gKVxuICAgIH1cbiAgICByZXR1cm4gbmV3IFJlc3VsdChzLnNsaWNlKDAsIHRhcmdldC5sZW5ndGgpLCBzLnNsaWNlKHRhcmdldC5sZW5ndGgpKSBcbiAgfVxufVxuXG5leHBvcnQgZnVuY3Rpb24gc2l6ZSAoczogc3RyaW5nKTogT3V0Y29tZTxudW1iZXI+IHtcbiAgcmV0dXJuIG5ldyBSZXN1bHQocy5sZW5ndGgsIHMpXG59XG5cbmV4cG9ydCBmdW5jdGlvbiBlb2YgKHM6IHN0cmluZyk6IE91dGNvbWU8bnVsbD4ge1xuICByZXR1cm4gcy5sZW5ndGggPT09IDAgPyBuZXcgUmVzdWx0KG51bGwsICcnKSA6IG5ldyBFcnIocyArICc6IE5vdCBlbmQgb2YgaW5wdXQnKVxufVxuXG5leHBvcnQgZnVuY3Rpb24gY29uc3VtZSAoZjogKHM6IHN0cmluZykgPT4gYm9vbGVhbik6IFBhcnNlcjxzdHJpbmc+IHtcbiAgcmV0dXJuIGZ1bmN0aW9uIChzOiBzdHJpbmcpOiBPdXRjb21lPHN0cmluZz4ge1xuICAgIGZvciAoIHZhciBpID0gMDsgaSA8IHMubGVuZ3RoOyBpKyspIHtcbiAgICAgIGlmICggIWYoc1tpXSkgKSBicmVha1xuICAgIH1cbiAgICByZXR1cm4gbmV3IFJlc3VsdChzLnNsaWNlKDAsIGkpLCBzLnNsaWNlKGkpKVxuICB9XG59XG5cbmV4cG9ydCBmdW5jdGlvbiBjb25zdW1lMSAoZjogKHM6IHN0cmluZykgPT4gYm9vbGVhbik6IFBhcnNlcjxzdHJpbmc+IHtcbiAgcmV0dXJuIGZsYXRNYXAoc2F0aXNmeShmKSwgICAgICAgICAgIHggPT5cbiAgICAgICAgIGZsYXRNYXAoY29uc3VtZShmKSwgeHMgPT5cbiAgICAgICAgIHVuaXQoeCArIHhzKSkpXG59XG5cbmV4cG9ydCBmdW5jdGlvbiBjb25zdW1lQXRsZWFzdE4gKG46IG51bWJlciwgZjogKHM6IHN0cmluZykgPT4gYm9vbGVhbik6IFBhcnNlcjxzdHJpbmc+IHtcbiAgcmV0dXJuIGZ1bmN0aW9uIChzOiBzdHJpbmcpOiBPdXRjb21lPHN0cmluZz4ge1xuICAgIGlmICggbiA8IDAgKSAgICAgICAgcmV0dXJuIG5ldyBFcnIoJ05lZ2F0aXZlIGNvdW50JylcbiAgICBpZiAoIHMubGVuZ3RoIDwgbiApIHJldHVybiBuZXcgRXJyKCdOb3QgZW5vdWdoIGNoYXJhY3RlcnMnKVxuXG4gICAgZm9yICggdmFyIGkgPSAwOyBpIDwgbjsgaSsrICkge1xuICAgICAgaWYgKCAhZihzW2ldKSApIHJldHVybiBuZXcgRXJyKGAkeyBzW2ldIH0gZGlkIG5vdCBzYXRpc2Z5YClcbiAgICB9XG4gICAgcmV0dXJuIGNvbnN1bWUoZikocylcbiAgfVxufVxuXG5leHBvcnQgZnVuY3Rpb24gbWFueTxBPiAocDogUGFyc2VyPEE+KTogUGFyc2VyPEFbXT4ge1xuICByZXR1cm4gZnVuY3Rpb24gKHM6IHN0cmluZyk6IE91dGNvbWU8QVtdPiB7XG4gICAgdmFyIHJlc3VsdDogT3V0Y29tZTxBPlxuICAgIHZhciBvdXQ6IEFbXSA9IFtdXG4gICAgdmFyIHJlbWFpbmluZyA9IHNcblxuICAgIHdoaWxlICggdHJ1ZSApIHtcbiAgICAgIHJlc3VsdCA9IHAocmVtYWluaW5nKVxuICAgICAgaWYgKCAhcmVzdWx0LnN1Y2Nlc3MgKSBicmVha1xuICAgICAgb3V0LnB1c2gocmVzdWx0LnZhbClcbiAgICAgIHJlbWFpbmluZyA9IHJlc3VsdC5yZXN0XG4gICAgfVxuICAgIHJldHVybiBuZXcgUmVzdWx0KG91dCwgcmVtYWluaW5nKVxuICB9XG59XG5cbmV4cG9ydCBmdW5jdGlvbiBtYW55MTxBPiAocDogUGFyc2VyPEE+KTogUGFyc2VyPEFbXT4ge1xuICByZXR1cm4gZmxhdE1hcChwLCAgICAgICAgeCA9PlxuICAgICAgICAgZmxhdE1hcChtYW55KHApLCB4cyA9PlxuICAgICAgICAgdW5pdChbIHgsIC4uLnhzIF0pKSlcbn1cblxuZXhwb3J0IGZ1bmN0aW9uIG1hbnlUaWxsPEEsIEI+IChwOiBQYXJzZXI8QT4sIGVuZDogUGFyc2VyPEI+KTogUGFyc2VyPEFbXT4ge1xuICBjb25zdCBzY2FuOiBQYXJzZXI8QVtdPiA9IG9yKFxuICAgIGZsYXRNYXAoZW5kLCBfID0+IHVuaXQoW10gYXMgQVtdKSksIFxuICAgIGZsYXRNYXAocCwgeCA9PiBmbGF0TWFwKHNjYW4sIHhzID0+IHVuaXQoWyB4IF0uY29uY2F0KHhzKSkpKSlcblxuICByZXR1cm4gc2NhblxufVxuXG5leHBvcnQgZnVuY3Rpb24gYXRsZWFzdE48QT4gKG46IG51bWJlciwgcDogUGFyc2VyPEE+KTogUGFyc2VyPEFbXT4ge1xuICByZXR1cm4gZmxhdE1hcChtYW55KHApLCBcbiAgICAgICAgIHhzID0+IHhzLmxlbmd0aCA+PSBuID8gdW5pdCh4cykgOiBmYWlsZWQoJ05vdCBlbm91Z2ggbWF0Y2hlcycpIGFzIFBhcnNlcjxBW10+KVxufVxuXG5leHBvcnQgZnVuY3Rpb24gYmV0d2VlbjxBLCBCLCBDPiAocExlZnQ6IFBhcnNlcjxBPiwgcDogUGFyc2VyPEI+LCBwUmlnaHQ6IFBhcnNlcjxDPik6IFBhcnNlcjxCPiB7XG4gIHJldHVybiBmbGF0TWFwKGRvVGhlbihwTGVmdCwgcCksIG91dCA9PlxuICAgICAgICAgZmxhdE1hcChwUmlnaHQsICAgICAgICAgICBfICAgPT4gXG4gICAgICAgICB1bml0KG91dCkpKVxufVxuXG5leHBvcnQgZnVuY3Rpb24gYXJvdW5kPEEsIEIsIEM+IChwTGVmdDogUGFyc2VyPEE+LCBwOiBQYXJzZXI8Qj4sIHBSaWdodDogUGFyc2VyPEM+KTogUGFyc2VyPFsgQSwgQyBdPiB7XG4gIHJldHVybiBmbGF0TWFwKHBMZWZ0LCAgbCA9PiBcbiAgICAgICAgIGRvVGhlbihwLCBcbiAgICAgICAgIGZsYXRNYXAocFJpZ2h0LCByID0+IFxuICAgICAgICAgdW5pdChbIGwsIHIgXSBhcyBbIEEsIEMgXSkpKSlcbn1cblxuZXhwb3J0IGZ1bmN0aW9uIHNlcGVyYXRlZEJ5PEEsIEI+IChwOiBQYXJzZXI8QT4sIHNlcDogUGFyc2VyPEI+KTogUGFyc2VyPEFbXT4ge1xuICByZXR1cm4gZmxhdE1hcChwLCAgICAgICAgICAgICAgICAgICAgIGZpcnN0ID0+XG4gICAgICAgICBmbGF0TWFwKG1hbnkxKGRvVGhlbihzZXAsIHApKSwgaW5uZXIgPT5cbiAgICAgICAgIHVuaXQoWyBmaXJzdCwgLi4uaW5uZXIgXSkpKVxufVxuXG5leHBvcnQgZnVuY3Rpb24gaW50ZXJzcGVyc2luZzxBLCBCPiAocDogUGFyc2VyPEE+LCBzZXA6IFBhcnNlcjxCPik6IFBhcnNlcjxBW10+IHtcbiAgcmV0dXJuIGZsYXRNYXAobWFueTEoZG9UaGVuKHNlcCwgcCkpLCB4cyA9PlxuICAgICAgICAgZmxhdE1hcChzZXAsICAgICAgICAgICAgICAgICAgICBfID0+XG4gICAgICAgICB1bml0KHhzKSkpXG59XG5cbmV4cG9ydCBmdW5jdGlvbiBvckRlZmF1bHQ8QT4gKHA6IFBhcnNlcjxBPiwgZGZsdDogQSk6IFBhcnNlcjxBPiB7XG4gIHJldHVybiBvcihwLCB1bml0KGRmbHQpKVxufVxuXG5leHBvcnQgZnVuY3Rpb24gb3I8QT4gKHAxOiBQYXJzZXI8QT4sIHAyOiBQYXJzZXI8QT4pOiBQYXJzZXI8QT4ge1xuICByZXR1cm4gZnVuY3Rpb24gKHM6IHN0cmluZyk6IE91dGNvbWU8QT4ge1xuICAgIGNvbnN0IGxlZnQgPSBwMShzKVxuXG4gICAgcmV0dXJuIGxlZnQuc3VjY2VzcyA/IGxlZnQgOiBwMihzKVxuICB9XG59XG5cbmV4cG9ydCBmdW5jdGlvbiBvcHRpb25hbCA8QT4gKHA6IFBhcnNlcjxBPik6IFBhcnNlcjxBIHwgdW5kZWZpbmVkPiB7XG4gIHJldHVybiBvckRlZmF1bHQocCwgdW5kZWZpbmVkKVxufVxuXG5leHBvcnQgZnVuY3Rpb24gYW55T2Y8QT4gKFsgaGVhZCwgLi4ucmVzdCBdOiBQYXJzZXI8QT5bXSk6IFBhcnNlcjxBPiB7XG4gIGlmICggaGVhZCA9PSBudWxsICkgcmV0dXJuIGZhaWxlZCgnTm9uZSBtYXRjaGVkJykgYXMgUGFyc2VyPEE+XG4gIGVsc2UgICAgICAgICAgICAgICAgcmV0dXJuIG9yKGhlYWQsIGFueU9mKHJlc3QpKSBhcyBQYXJzZXI8QT5cbn1cblxuZXhwb3J0IGZ1bmN0aW9uIGNvbmNhdCAoWyBoZWFkLCAuLi5yZXN0IF06IFBhcnNlcjxzdHJpbmc+W10pOiBQYXJzZXI8c3RyaW5nPiB7XG4gIGlmICggaGVhZCA9PSBudWxsICkgcmV0dXJuIHVuaXQoJycpXG4gIGVsc2UgICAgICAgICAgICAgICAgcmV0dXJuIGZsYXRNYXAoaGVhZCwgICAgICAgICAgb3V0ID0+XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgIGZsYXRNYXAoY29uY2F0KHJlc3QpLCBvdXQyID0+XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgIHVuaXQob3V0ICsgb3V0MikpKVxufVxuXG5leHBvcnQgZnVuY3Rpb24gaW5SYW5nZSAobWluOiBudW1iZXIsIG1heDogbnVtYmVyLCBwOiBQYXJzZXI8bnVtYmVyPik6IFBhcnNlcjxudW1iZXI+IHtcbiAgcmV0dXJuIGZsYXRNYXAocCwgXG4gICAgICAgICAgeCA9PiB4ID49IG1pbiAmJiB4IDw9IG1heCBcbiAgICAgICAgICAgID8gdW5pdCh4KSBcbiAgICAgICAgICAgIDogZmFpbGVkKCdPdXQgb2YgcmFuZ2UnKSBhcyBQYXJzZXI8bnVtYmVyPilcbn1cblxuZXhwb3J0IGNvbnN0IGRhc2ggPSBleGFjdGx5KCctJylcbmV4cG9ydCBjb25zdCBkb3QgPSBleGFjdGx5KCcuJylcbmV4cG9ydCBjb25zdCBzbGFzaCA9IGV4YWN0bHkoJy8nKVxuZXhwb3J0IGNvbnN0IGJhY2tzbGFzaCA9IGV4YWN0bHkoJ1xcXFwnKVxuZXhwb3J0IGNvbnN0IGFscGhhID0gc2F0aXNmeShpc0FscGhhKVxuZXhwb3J0IGNvbnN0IG51bSA9IHNhdGlzZnkoaXNOdW1iZXIpXG5leHBvcnQgY29uc3QgYWxwaGFudW0gPSBzYXRpc2Z5KG4gPT4gaXNOdW1iZXIobikgfHwgaXNBbHBoYShuKSlcbmV4cG9ydCBjb25zdCBhbHBoYXMgPSBjb25zdW1lKGlzQWxwaGEpXG5leHBvcnQgY29uc3QgbnVtcyA9IGNvbnN1bWUoaXNOdW1iZXIpXG5leHBvcnQgY29uc3QgYWxwaGFudW1zID0gY29uc3VtZShuID0+IGlzTnVtYmVyKG4pIHx8IGlzQWxwaGEobikpXG5leHBvcnQgY29uc3Qgc3BhY2UgPSBleGFjdGx5KCcgJykgXG5leHBvcnQgY29uc3Qgc3BhY2VzID0gY29uc3VtZShuID0+IG4gPT09ICcgJylcbmV4cG9ydCBjb25zdCBuZXdsaW5lID0gYW55T2YoWyBleGFjdGx5KCdcXG4nKSwgZXhhY3RseSgnXFxmJyksIG1hdGNoKCdcXHJcXG4nKSwgZXhhY3RseSgnXFxyJykgXSlcbmV4cG9ydCBjb25zdCBpbnRlZ2VyID0gZm1hcChOdW1iZXIsIGNvbmNhdChbIFxuICBvckRlZmF1bHQoZGFzaCwgJycpLCBcbiAgY29uc3VtZUF0bGVhc3ROKDEsIGlzTnVtYmVyKSBdKSlcbmV4cG9ydCBjb25zdCByZWFsID0gZm1hcChOdW1iZXIsIGNvbmNhdChbIFxuICBvckRlZmF1bHQoZGFzaCwgJycpLCBcbiAgY29uc3VtZUF0bGVhc3ROKDEsIGlzTnVtYmVyKSwgXG4gIGRvdCwgXG4gIGNvbnN1bWVBdGxlYXN0TigxLCBpc051bWJlcikgXSkpXG4iLCJleHBvcnQgZnVuY3Rpb24gaXNBbHBoYSAoczogc3RyaW5nKTogYm9vbGVhbiB7XG4gIGNvbnN0IGNjID0gcy5jaGFyQ29kZUF0KDApXG5cbiAgcmV0dXJuICFpc05hTihjYykgJiYgKCggY2MgPj0gNjUgJiYgY2MgPD0gOTAgKSB8fCAoIGNjID49IDk3ICYmIGNjIDw9IDEyMiApKVxufVxuXG5leHBvcnQgZnVuY3Rpb24gaXNOdW1iZXIgKHM6IHN0cmluZyk6IGJvb2xlYW4ge1xuICBjb25zdCBjYyA9IHMuY2hhckNvZGVBdCgwKVxuXG4gIHJldHVybiAhaXNOYU4oY2MpICYmIGNjID49IDQ4ICYmIGNjIDw9IDU3XG59XG5cbmV4cG9ydCBmdW5jdGlvbiBpcyAodGFyZ2V0OiBzdHJpbmcpOiAoczogc3RyaW5nKSA9PiBib29sZWFuIHtcbiAgcmV0dXJuIGZ1bmN0aW9uIChzOiBzdHJpbmcpOiBib29sZWFuIHtcbiAgICBpZiAoIHMubGVuZ3RoID09PSAwIHx8IHRhcmdldC5sZW5ndGggPT09IDAgKSByZXR1cm4gZmFsc2VcbiAgICBlbHNlICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICByZXR1cm4gdGFyZ2V0WzBdID09PSBzWzBdXG4gIH0gXG59XG4iLCJpbXBvcnQgcHZ2c3JjIGZyb20gJy4vc2hhZGVycy9wZXItdmVydGV4LXZzcmMnXG5pbXBvcnQgcHZmc3JjIGZyb20gJy4vc2hhZGVycy9wZXItdmVydGV4LWZzcmMnXG5pbXBvcnQgeyBsb2FkWEhSIH0gZnJvbSAnLi9Mb2FkJ1xuaW1wb3J0IHsgcGFyc2VPQkogfSBmcm9tICcuL1BhcnNlcnMvT0JKJ1xuaW1wb3J0IHsgVjMsIE00LCBpZGVudGl0eSwgdHJhbnNsYXRlLCByb3RhdGVYLCByb3RhdGVZLCByb3RhdGVaLCBzY2FsZSwgbG9va0F0LCBwZXJzcGVjdGl2ZSB9IGZyb20gJy4vTWF0cml4J1xuaW1wb3J0IHsgQXR0cmlidXRlcywgVW5pZm9ybXMsIENvbW1hbmQgfSBmcm9tICcuL0NvbW1hbmRvJ1xuXG5jb25zdCBjID0gZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoJ3RhcmdldCcpIGFzIEhUTUxDYW52YXNFbGVtZW50XG5jb25zdCBnbCA9IGMuZ2V0Q29udGV4dCgnd2ViZ2wnKSBhcyBXZWJHTFJlbmRlcmluZ0NvbnRleHRcblxuLypcbiAgQXQtYS1nbGFuY2UgdW5kZXJzdGFuZGluZyBvZiBHTFRGXG5cbiAgPEJ1ZmZlcj4gc3RvcmVzIGJpbmFyeSBkYXRhXG4gIDxCdWZmZXJWaWV3PiByZWZlciB0byBzbGljZXMgb2YgYSA8QnVmZmVyPiBieSBieXRlbGVuZ3RoICggbm8gdHlwZS9zdHJpZGUgaW5mbyApXG4gIDxBY2Nlc3Nvcj4gYWRkcyBpbmZvcm1hdGlvbiB0byA8QnVmZmVyVmlldz4gbGlrZSBzdHJpZGUsIHR5cGUsIG9mZnNldCwgY291bnRcbiAgPE1lc2g+IExpc3Qgb2YgPFByaW1pdGl2ZT4gYW5kIG9wdGlvbmFsIG5hbWVcbiAgPFByaW1pdGl2ZT4gbGlzdHMgQXR0cmlidXRlcy9JbmRpY2VzPyBieSA8QWNjZXNzb3I+IGFuZCBNYXRlcmlhbCBhbmQgZHJhd2luZyBtb2RlICggVHJpYW5nbGVzLCBldGMgKVxuICA8Tm9kZT4gY29udGFpbnMgPE1lc2g+W10sIG1hdHJpeCB0cmFuc2Zvcm0sIGNoaWxkcmVuIDxOb2RlPltdLCBhbmQgbmFtZVxuKi9cblxuZW51bSBHTFRGQ29tcG9uZW50VHlwZSB7XG4gIEJZVEUgPSA1MTIwLFxuICBVTlNJR05FRF9CWVRFID0gNTEyMSxcbiAgU0hPUlQgPSA1MTIyLFxuICBVTlNJR05FRF9TSE9SVCA9IDUxMjMsXG4gIEZMT0FUID0gNTEyNlxufVxuXG5lbnVtIEdMVEZCdWZmZXJWaWV3VGFyZ2V0IHsgXG4gIEFSUkFZX0JVRkZFUiA9IDM0OTYyLCBcbiAgRUxFTUVOVF9BUlJBWV9CVUZGRVJcbn1cblxuZW51bSBHTFRGUHJpbWl0aXZlTW9kZSB7XG4gIFBPSU5UUyA9IDAsXG4gIExJTkVTLFxuICBMSU5FX0xPT1AsXG4gIExJTkVfU1RSSVAsXG4gIFRSSUFOR0xFUyxcbiAgVFJJQU5HTEVfU1RSSVAsXG4gIFRSSUFOR0xFX0ZBTlxufVxuXG5lbnVtIEdMVEZQYXJhbWV0ZXJUeXBlIHtcbiAgQllURSA9IDUxMjAsXG4gIFVOU0lHTkVEX0JZVEUgPSA1MTIxLFxuICBTSE9SVCA9IDUxMjIsXG4gIFVOU0lHTkVEX1NIT1JUID0gNTEyMyxcbiAgSU5UID0gNTEyNCxcbiAgVU5TSUdORURfSU5UID0gNTEyNSxcbiAgRkxPQVQgPSA1MTI2LFxuICBGTE9BVF9WRUMyID0gMzU2NjQsXG4gIEZMT0FUX1ZFQzMgPSAzNTY2NSxcbiAgRkxPQVRfVkVDNCA9IDM1NjY2LFxuICBJTlRfVkVDMiA9IDM1NjY3LFxuICBJTlRfVkVDMyA9IDM1NjY4LFxuICBJTlRfVkVDNCA9IDM1NjY5LFxuICBCT09MID0gMzU2NzAsXG4gIEJPT0xfVkVDMiA9IDM1NjcxLFxuICBCT09MX1ZFQzMgPSAzNTY3MixcbiAgQk9PTF9WRUM0ID0gMzU2NzMsXG4gIEZMT0FUX01BVDIgPSAzNTY3NCxcbiAgRkxPQVRfTUFUMyA9IDM1Njc1LFxuICBGTE9BVF9NQVQ0ID0gMzU2NzYsXG4gIFNBTVBMRVJfMkQgPSAzNTY3OFxufVxuXG5pbnRlcmZhY2UgR0xURkFjY2Vzc29yIHsgXG4gIGJ1ZmZlclZpZXc6IEdMVEZCdWZmZXJWaWV3XG4gIGNvbXBvbmVudFR5cGU6IEdMVEZDb21wb25lbnRUeXBlXG4gIGJ5dGVTdHJpZGU6IG51bWJlclxuICBieXRlT2Zmc2V0OiBudW1iZXJcbiAgY291bnQ6IG51bWJlclxuICB0eXBlOiBHTFRGUGFyYW1ldGVyVHlwZVxufVxuXG5pbnRlcmZhY2UgR0xURkJ1ZmZlclZpZXcgeyBcbiAgdmlldzogQXJyYXlCdWZmZXJWaWV3IFxuICB0YXJnZXQ6IEdMVEZCdWZmZXJWaWV3VGFyZ2V0XG59XG5cbmludGVyZmFjZSBHTFRGTWVzaCB7XG4gIHByaW1pdGl2ZXM6IEdMVEZQcmltaXRpdmVbXVxuICBuYW1lPzogc3RyaW5nXG59XG5cbmludGVyZmFjZSBHTFRGUHJpbWl0aXZlIHtcbiAgYXR0cmlidXRlczogeyBbIHg6IHN0cmluZyBdOiBHTFRGQWNjZXNzb3IgfVxuICBpbmRpY2VzPzogR0xURkFjY2Vzc29yXG4gIG1vZGU6IEdMVEZQcmltaXRpdmVNb2RlXG4gIC8vIG1hdGVyaWFsOiBHTFRGTWF0ZXJpYWxcbn1cblxuaW50ZXJmYWNlIEdMVEZOb2RlIHtcbiAgY2hpbGRyZW46IEdMVEZOb2RlW11cbiAgbWVzaGVzOiBHTFRGTWVzaFtdXG4gIG5hbWU/OiBzdHJpbmdcbn1cblxuZnVuY3Rpb24gY29udGFpbmluZyAoIGI6IEFycmF5QnVmZmVyLCBvZmZzZXQ6IG51bWJlciwgbGVuZ3RoOiBudW1iZXIsIHZhbHVlOiBudW1iZXJbXSApOiBGbG9hdDMyQXJyYXkge1xuICBjb25zdCBvdXQgPSBuZXcgRmxvYXQzMkFycmF5KGIsIG9mZnNldCwgbGVuZ3RoKVxuXG4gIG91dC5zZXQodmFsdWUpXG4gIHJldHVybiBvdXRcbn1cblxubG9hZFhIUigncHlyYW1pZC5vYmonKVxuLnRoZW4ocGFyc2VPQkopXG4udGhlbihnZW9tZXRyeSA9PiB7XG4gIGlmICggIWdlb21ldHJ5LnN1Y2Nlc3MgKSByZXR1cm5cblxuICAvLyAzMmIgLT4gOEJcbiAgY29uc3QgRjMyX0JZVEVfU0laRSA9IDRcbiAgY29uc3QgeyB2ZXJ0aWNlcywgbm9ybWFscyB9ID0gZ2VvbWV0cnkudmFsXG4gIGNvbnN0IHZlcnRCeXRlbGVuZ3RoID0gdmVydGljZXMubGVuZ3RoICogRjMyX0JZVEVfU0laRVxuICBjb25zdCBub3JtQnl0ZWxlbmd0aCA9IG5vcm1hbHMubGVuZ3RoICogRjMyX0JZVEVfU0laRVxuICBjb25zdCBiID0gbmV3IEFycmF5QnVmZmVyKHZlcnRCeXRlbGVuZ3RoICsgbm9ybUJ5dGVsZW5ndGgpXG4gIGNvbnN0IHZlcnRpY2VzQlYgPSBjb250YWluaW5nKGIsIDAsIHZlcnRpY2VzLmxlbmd0aCwgdmVydGljZXMpXG4gIGNvbnN0IG5vcm1hbHNCViA9IGNvbnRhaW5pbmcoYiwgdmVydGljZXMubGVuZ3RoICogRjMyX0JZVEVfU0laRSwgbm9ybWFscy5sZW5ndGgsIG5vcm1hbHMpXG4gIGNvbnN0IGtleXMgPSBuZXcgQXJyYXkoMjU2KVxuICBjb25zdCBsaWdodCA9IFYzKDAsIDIsIDApXG4gIGNvbnN0IGNhbSA9IHtcbiAgICBwb3NpdGlvbjogbmV3IEZsb2F0MzJBcnJheShbIDAsIDEsIDUgXSksXG4gICAgdmlldzogTTQoKSxcbiAgICBwcm9qZWN0aW9uOiBNNCgpLFxuICAgIHZmb3Y6IE1hdGguUEkgLyA0LFxuICAgIGFzcGVjdFJhdGlvOiBjLndpZHRoIC8gYy5oZWlnaHQsXG4gICAgbmVhcjogMC4xLFxuICAgIGZhcjogMTAwMDAsXG4gICAgdXA6IFYzKDAsIDEsIDApLFxuICAgIGF0OiBWMygwLCAwLCAwKVxuICB9XG4gIGNvbnN0IHRyYW5zZm9ybSA9IHtcbiAgICBwb3NpdGlvbjogVjMoMCwgMCwgMCksXG4gICAgc2NhbGU6IFYzKDEsIDEsIDEpLFxuICAgIHJvdGF0aW9uOiBWMygwLCAwLCAwKSxcbiAgICBtb2RlbDogTTQoKVxuICB9XG4gIGNvbnN0IGRyYXdQeXJhbWlkID0gQ29tbWFuZC5jcmVhdGVDb21tYW5kKGdsLCB7XG4gICAgdnNyYzogcHZ2c3JjLFxuICAgIGZzcmM6IHB2ZnNyYyxcbiAgICB1bmlmb3Jtczoge1xuICAgICAgdV9saWdodDogbmV3IFVuaWZvcm1zLlUzRihbIDAsIDAsIDAgXSksXG4gICAgICB1X21vZGVsOiBuZXcgVW5pZm9ybXMuVU1hdHJpeDQoTTQoKSksXG4gICAgICB1X3ZpZXc6IG5ldyBVbmlmb3Jtcy5VTWF0cml4NChNNCgpKSxcbiAgICAgIHVfcHJvamVjdGlvbjogbmV3IFVuaWZvcm1zLlVNYXRyaXg0KE00KCkpXG4gICAgfSxcbiAgICBhdHRyaWJ1dGVzOiB7XG4gICAgICBhX2Nvb3JkOiBuZXcgQXR0cmlidXRlcy5GbG9hdHMoMywgdmVydGljZXNCViksXG4gICAgICBhX25vcm1hbDogbmV3IEF0dHJpYnV0ZXMuRmxvYXRzKDMsIG5vcm1hbHNCVilcbiAgICB9XG4gIH0pXG4gIGlmICggZHJhd1B5cmFtaWQgaW5zdGFuY2VvZiBFcnJvciApIHtcbiAgICBjb25zb2xlLmxvZyhkcmF3UHlyYW1pZClcbiAgfVxuICBlbHNlIHtcbiAgICB2YXIgdCA9IDBcbiAgICBjb25zdCByZW5kZXIgPSBmdW5jdGlvbiByZW5kZXIgKCkge1xuICAgICAgdCsrXG5cbiAgICAgIGlmICgga2V5c1szN10gKSB0cmFuc2Zvcm0ucm90YXRpb25bMV0gLT0gMC4wNVxuICAgICAgaWYgKCBrZXlzWzM5XSApIHRyYW5zZm9ybS5yb3RhdGlvblsxXSArPSAwLjA1XG5cbiAgICAgIGxpZ2h0WzBdID0gTWF0aC5jb3ModCAvIDEwKSAqIDJcbiAgICAgIGxpZ2h0WzJdID0gTWF0aC5zaW4odCAvIDEwKSAqIDJcbiAgICAgIGlkZW50aXR5KHRyYW5zZm9ybS5tb2RlbClcbiAgICAgIHRyYW5zbGF0ZSh0cmFuc2Zvcm0ubW9kZWwsIHRyYW5zZm9ybS5wb3NpdGlvbilcbiAgICAgIHNjYWxlKHRyYW5zZm9ybS5tb2RlbCwgdHJhbnNmb3JtLnNjYWxlKVxuICAgICAgcm90YXRlWCh0cmFuc2Zvcm0ubW9kZWwsIHRyYW5zZm9ybS5yb3RhdGlvblswXSlcbiAgICAgIHJvdGF0ZVkodHJhbnNmb3JtLm1vZGVsLCB0cmFuc2Zvcm0ucm90YXRpb25bMV0pXG4gICAgICByb3RhdGVaKHRyYW5zZm9ybS5tb2RlbCwgdHJhbnNmb3JtLnJvdGF0aW9uWzJdKVxuICAgICAgY2FtLmFzcGVjdFJhdGlvID0gYy53aWR0aCAvIGMuaGVpZ2h0XG4gICAgICBsb29rQXQoY2FtLnZpZXcsIGNhbS5wb3NpdGlvbiwgY2FtLmF0LCBjYW0udXApXG4gICAgICBwZXJzcGVjdGl2ZShjYW0ucHJvamVjdGlvbiwgY2FtLnZmb3YsIGNhbS5hc3BlY3RSYXRpbywgY2FtLm5lYXIsIGNhbS5mYXIpXG5cbiAgICAgIGdsLmVuYWJsZShnbC5DVUxMX0ZBQ0UpXG4gICAgICBnbC5jdWxsRmFjZShnbC5CQUNLKVxuICAgICAgZ2wudmlld3BvcnQoMCwgMCwgYy53aWR0aCwgYy5oZWlnaHQpXG4gICAgICBnbC5jbGVhckNvbG9yKDAsIDAsIDAsIDApXG4gICAgICBnbC5jbGVhcihnbC5DT0xPUl9CVUZGRVJfQklUIHwgZ2wuREVQVEhfQlVGRkVSX0JJVClcblxuICAgICAgQ29tbWFuZC5ydW4oZHJhd1B5cmFtaWQsIHtcbiAgICAgICAgdW5pZm9ybXM6IHtcbiAgICAgICAgICB1X2xpZ2h0OiBsaWdodCxcbiAgICAgICAgICB1X21vZGVsOiB0cmFuc2Zvcm0ubW9kZWwsXG4gICAgICAgICAgdV92aWV3OiBjYW0udmlldyxcbiAgICAgICAgICB1X3Byb2plY3Rpb246IGNhbS5wcm9qZWN0aW9uIFxuICAgICAgICB9LFxuICAgICAgICBjb3VudDogdmVydGljZXMubGVuZ3RoIC8gM1xuICAgICAgfSlcbiAgICAgIHJlcXVlc3RBbmltYXRpb25GcmFtZShyZW5kZXIpXG4gICAgfVxuICAgIHJlcXVlc3RBbmltYXRpb25GcmFtZShyZW5kZXIpXG5cbiAgICBkb2N1bWVudC5ib2R5LmFkZEV2ZW50TGlzdGVuZXIoJ2tleWRvd24nLCAoeyBrZXlDb2RlIH0pID0+IGtleXNba2V5Q29kZV0gPSAxKVxuICAgIGRvY3VtZW50LmJvZHkuYWRkRXZlbnRMaXN0ZW5lcigna2V5dXAnLCAoeyBrZXlDb2RlIH0pID0+IGtleXNba2V5Q29kZV0gPSAwKVxuICB9XG59KVxuIiwiZXhwb3J0IGRlZmF1bHRcbmBcbnByZWNpc2lvbiBtZWRpdW1wIGZsb2F0OyBcblxudW5pZm9ybSB2ZWMzIHVfcG9zaXRpb247XG51bmlmb3JtIHZlYzMgdV9zY2FsZTtcbnVuaWZvcm0gdmVjMyB1X3JvdGF0aW9uO1xuXG52YXJ5aW5nIHZlYzQgdl9jb2xvcjtcblxudm9pZCBtYWluICgpIHsgXG4gIGdsX0ZyYWdDb2xvciA9IHZfY29sb3I7IFxufVxuYFxuIiwiZXhwb3J0IGRlZmF1bHRcbmBcbnByZWNpc2lvbiBtZWRpdW1wIGZsb2F0O1xuXG5hdHRyaWJ1dGUgdmVjMyBhX2Nvb3JkOyBcbmF0dHJpYnV0ZSB2ZWMzIGFfbm9ybWFsO1xuXG51bmlmb3JtIHZlYzMgdV9saWdodDtcbnVuaWZvcm0gbWF0NCB1X21vZGVsO1xudW5pZm9ybSBtYXQ0IHVfdmlldztcbnVuaWZvcm0gbWF0NCB1X3Byb2plY3Rpb247XG5cbmNvbnN0IHZlYzQgQ09MT1JfU0NBTEUgPSB2ZWM0KDI1Ni4wLCAyNTYuMCwgMjU2LjAsIDEuMCk7XG5jb25zdCB2ZWM0IHJnYmEgPSB2ZWM0KDAuMCwgMjU1LjAsIDI1NS4wLCAxLjApO1xuY29uc3QgdmVjNCBjb2xvciA9IHJnYmEgLyBDT0xPUl9TQ0FMRTtcblxudmFyeWluZyB2ZWM0IHZfY29sb3I7XG5cbnZvaWQgbWFpbiAoKSB7IFxuICBtYXQ0IE1WUCA9IHVfcHJvamVjdGlvbiAqIHVfdmlldyAqIHVfbW9kZWw7XG4gIG1hdDQgTVYgPSB1X3ZpZXcgKiB1X21vZGVsO1xuICB2ZWMzIE1WVmVydGV4ID0gdmVjMyhNViAqIHZlYzQoYV9jb29yZCwgMS4wKSk7XG4gIHZlYzMgTVZOb3JtYWwgPSB2ZWMzKE1WICogdmVjNChhX25vcm1hbCwgMC4wKSk7XG4gIHZlYzMgbGlnaHRfdmVjdG9yID0gbm9ybWFsaXplKHVfbGlnaHQgLSBNVlZlcnRleCk7XG4gIGZsb2F0IGRpc3RhbmNlID0gbGVuZ3RoKHVfbGlnaHQgLSBNVlZlcnRleCk7XG4gIGZsb2F0IGZhbGxvZmYgPSAwLjA1O1xuICBmbG9hdCBhdHRlbnVhdGlvbiA9IDEuMCAvICgxLjAgKyAoZmFsbG9mZiAqIGRpc3RhbmNlICogZGlzdGFuY2UpKTtcbiAgZmxvYXQgZGlmZnVzZSA9IG1heChkb3QoTVZOb3JtYWwsIGxpZ2h0X3ZlY3RvciksIDAuMSkgKiBhdHRlbnVhdGlvbjtcblxuICB2X2NvbG9yID0gdmVjNChjb2xvclswXSAqIGRpZmZ1c2UsIGNvbG9yWzFdICogZGlmZnVzZSwgY29sb3JbMl0gKiBkaWZmdXNlLCBjb2xvclszXSk7XG4gIGdsX1Bvc2l0aW9uID0gTVZQICogdmVjNChhX2Nvb3JkLCAxLjApO1xufVxuYFxuIl19
