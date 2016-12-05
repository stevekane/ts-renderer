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

  binary data is stored in <Buffer>
  1-N <BufferView> refer to slices of a <Buffer> by bytelength ( no type/stride info )
  1-N <Accessor> adds information to <BufferView> like stride, type, offset, count
  
  create single buffer, get bufferViews like Float32Array as slices into this buffer
      
*/
Load_1.loadXHR('pyramid.obj')
    .then(OBJ_1.parseOBJ)
    .then(geometry => {
    if (!geometry.success)
        return;
    console.log(geometry.val);
    const keys = new Array(256);
    const light = Matrix_1.V3(0, 2, 0);
    const vertices = new Float32Array(geometry.val.vertices);
    const normals = new Float32Array(geometry.val.normals);
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
            a_coord: new Commando_1.Attributes.Floats(3, vertices),
            a_normal: new Commando_1.Attributes.Floats(3, normals)
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
                count: geometry.val.vertices.length / 3
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
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uL3Vzci9sb2NhbC9saWIvbm9kZV9tb2R1bGVzL3dhdGNoaWZ5L25vZGVfbW9kdWxlcy9icm93c2VyLXBhY2svX3ByZWx1ZGUuanMiLCJzcmMvQ29tbWFuZG8vQXR0cmlidXRlcy50cyIsInNyYy9Db21tYW5kby9Db21tYW5kLnRzIiwic3JjL0NvbW1hbmRvL1VuaWZvcm1zLnRzIiwic3JjL0NvbW1hbmRvL2luZGV4LnRzIiwic3JjL0NvbW1hbmRvL3V0aWxzLnRzIiwic3JjL0xvYWQudHMiLCJzcmMvTWF0cml4LnRzIiwic3JjL1BhcnNlcnMvT0JKLnRzIiwic3JjL1BhcnNlcnMvUGFyc2VyLnRzIiwic3JjL1BhcnNlcnMvcGFyc2Vycy50cyIsInNyYy9QYXJzZXJzL3ByZWRpY2F0ZXMudHMiLCJzcmMvbWFpbi50cyIsInNyYy9zaGFkZXJzL3Blci12ZXJ0ZXgtZnNyYy50cyIsInNyYy9zaGFkZXJzL3Blci12ZXJ0ZXgtdnNyYy50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTs7QUNnQkEsSUFBWSxVQUFnRTtBQUE1RSxXQUFZLFVBQVU7SUFBRywyQ0FBSSxDQUFBO0lBQUUsNkRBQWEsQ0FBQTtJQUFFLDZDQUFLLENBQUE7SUFBRSwrREFBYyxDQUFBO0lBQUUsNkNBQUssQ0FBQTtBQUFDLENBQUMsRUFBaEUsVUFBVSxHQUFWLGtCQUFVLEtBQVYsa0JBQVUsUUFBc0Q7QUFxQjVFO0lBSUUsWUFBb0IsSUFBbUIsRUFBUyxLQUFtQjtRQUEvQyxTQUFJLEdBQUosSUFBSSxDQUFlO1FBQVMsVUFBSyxHQUFMLEtBQUssQ0FBYztRQUhuRSxXQUFNLEdBQUcsQ0FBQyxDQUFBO1FBQ1YsV0FBTSxHQUFHLENBQUMsQ0FBQTtRQUNELGVBQVUsR0FBRyxVQUFVLENBQUMsS0FBSyxDQUFBO0lBQ2lDLENBQUM7SUFDeEUsS0FBSyxDQUFDLEVBQU0sRUFBRSxDQUEwQjtRQUN0QyxNQUFNLEVBQUUsR0FBRyxFQUFFLElBQUksRUFBRSxVQUFVLEVB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S0FBSyxDQUFNO0lBQUksQ0FBQztJQUNwQyxHQUFHLENBQUUsRUFBTSxFQUFFLENBQU0sRUFBRSxDQUFPLElBQUssRUFBRSxDQUFDLFNBQVMsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxDQUFDLENBQUMsQ0FBQyxFQUFFLENBQUMsQ0FBQyxDQUFDLENBQUMsRUFBRSxDQUFDLENBQUMsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUEsQ0FBQyxDQUFDO0NBQzNFO0FBSEQsa0JBR0M7QUFFRDtJQUNFLFlBQW9CLEtBQWE7UUFBYixVQUFLLEdBQUwsS0FBSyxDQUFRO0lBQUksQ0FBQztJQUN0QyxHQUFHLENBQUUsRUFBTSxFQUFFLENBQU0sRUFBRSxDQUFTLElBQUssRUFBRSxDQUFDLFVBQVUsQ0FBQyxDQUFDLEVBQUUsYUFBSyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUEsQ0FBQyxDQUFDO0NBQ2hFO0FBSEQsa0JBR0M7QUFFRDtJQUNFLFlBQW9CLEtBQWE7UUFBYixVQUFLLEdBQUwsS0FBSyxDQUFRO0lBQUksQ0FBQztJQUN0QyxHQUFHLENBQUUsRUFBTSxFQUFFLENBQU0sRUFBRSxDQUFTLElBQUssRUFBRSxDQUFDLFVBQVUsQ0FBQyxDQUFDLEVBQUUsYUFBSyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUEsQ0FBQyxDQUFDO0NBQ2hFO0FBSEQsb0JBR0M7QUFFRDtJQUNFLFlBQW9CLEtBQWE7UUFBYixVQUFLLEdBQUwsS0FBSyxDQUFRO0lBQUksQ0FBQztJQUN0QyxHQUFHLENBQUUsRUFBTSxFQUFFLENBQU0sRUFBRSxDQUFTLElBQUssRUFBRSxDQUFDLFVBQVUsQ0FBQyxDQUFDLEVBQUUsYUFBSyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUEsQ0FBQyxDQUFDO0NBQ2hFO0FBSEQsb0JBR0M7QUFFRDtJQUNFLFlBQW9CLEtBQWE7UUFBYixVQUFLLEdBQUwsS0FBSyxDQUFRO0lBQUksQ0FBQztJQUN0QyxHQUFHLENBQUUsRUFBTSxFQUFFLENBQU0sRUFBRSxDQUFTLElBQUssRUFBRSxDQUFDLFVBQVUsQ0FBQyxDQUFDLEVBQUUsYUFBSyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUEsQ0FBQyxDQUFDO0NBQ2hFO0FBSEQsb0JBR0M7QUFFRDtJQUNFLFlBQW9CLEtBQVc7UUFBWCxVQUFLLEdBQUwsS0FBSyxDQUFNO0lBQUksQ0FBQztJQUNwQyxHQUFHLENBQUUsRUFBTSxFQUFFLENBQU0sRUFBRSxDQUFPLElBQUssRUFBRSxDQUFDLFVBQVUsQ0FBQyxDQUFDLEVBQUUsYUFBSyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUEsQ0FBQyxDQUFDO0NBQzlEO0FBSEQsa0JBR0M7QUFFRDtJQUNFLFlBQW9CLEtBQVc7UUFBWCxVQUFLLEdBQUwsS0FBSyxDQUFNO0lBQUksQ0FBQztJQUNwQyxHQUFHLENBQUUsRUFBTSxFQUFFLENBQU0sRUFBRSxDQUFPLElBQUssRUFBRSxDQUFDLFVBQVUsQ0FBQyxDQUFDLEVBQUUsYUFBSyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUEsQ0FBQyxDQUFDO0NBQzlEO0FBSEQsb0JBR0M7QUFFRDtJQUNFLFlBQW9CLEtBQVc7UUFBWCxVQUFLLEdBQUwsS0FBSyxDQUFNO0lBQUksQ0FBQztJQUNwQyxHQUFHLENBQUUsRUFBTSxFQUFFLENBQU0sRUFBRSxDQUFPLElBQUssRUFBRSxDQUFDLFVBQVUsQ0FBQyxDQUFDLEVBQUUsYUFBSyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUEsQ0FBQyxDQUFDO0NBQzlEO0FBSEQsb0JBR0M7QUFFRDtJQUNFLFlBQW9CLEtBQVc7UUFBWCxVQUFLLEdBQUwsS0FBSyxDQUFNO0lBQUksQ0FBQztJQUNwQyxHQUFHLENBQUUsRUFBTSxFQUFFLENBQU0sRUFBRSxDQUFPLElBQUssRUFBRSxDQUFDLFVBQVUsQ0FBQyxDQUFDLEVBQUUsYUFBSyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUEsQ0FBQyxDQUFDO0NBQzlEO0FBSEQsb0JBR0M7QUFFRDtJQUNFLFlBQW9CLEtBQWE7UUFBYixVQUFLLEdBQUwsS0FBSyxDQUFRO0lBQUksQ0FBQztJQUN0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QUMxQixHQUFHLENBQUMsQ0FBQyxDQUFDLEdBQUcsR0FBRyxHQUFHLENBQUMsR0FBRyxHQUFHLEdBQUcsQ0FBQyxDQUFBO0lBQzFCLEdBQUcsQ0FBQyxDQUFDLENBQUMsR0FBRyxHQUFHLEdBQUcsQ0FBQyxHQUFHLEdBQUcsR0FBRyxDQUFDLENBQUE7SUFDMUIsR0FBRyxDQUFDLENBQUMsQ0FBQyxHQUFHLEdBQUcsR0FBRyxDQUFDLEdBQUcsR0FBRyxHQUFHLENBQUMsQ0FBQTtJQUMxQixHQUFHLENBQUMsQ0FBQyxDQUFDLEdBQUcsR0FBRyxHQUFHLENBQUMsR0FBRyxHQUFHLEdBQUcsQ0FBQyxDQUFBO0lBQzFCLEdBQUcsQ0FBQyxFQUFFLENBQUMsR0FBRyxHQUFHLEdBQUcsQ0FBQyxHQUFHLEdBQUcsR0FBRyxDQUFDLENBQUE7SUFDM0IsR0FBRyxDQUFDLEVBQUUsQ0FBQyxHQUFHLEdBQUcsR0FBRyxDQUFDLEdBQUcsR0FBRyxHQUFHLENBQUMsQ0FBQTtJQUMzQixNQUFNLENBQUMsR0FBRyxDQUFBO0FBQ2QsQ0FBQztBQXJCRCwwQkFxQkM7QUFFRCxpQkFBeUIsR0FBUyxFQUFFLEdBQVc7SUFDM0MsSUFBSSxDQUFDLEdBQUcsSUFBSSxDQUFDLEdBQUcsQ0FBQyxHQUFHLENBQUMsRUFDakIsQ0FBQyxHQUFHLElBQUksQ0FBQyxHQUFHLENBQUMsR0FBRyxDQUFDLEVBQ2pCLEdBQUcsR0FBRyxHQUFHLENBQUMsQ0FBQyxDQUFDLEVBQ1osR0FBRyxHQUFHLEdBQUcsQ0FBQyxDQUFDLENBQUMsRUFDWixHQUFHLEdBQUcsR0FBRyxDQUFDLENBQUMsQ0FBQyxFQUNaLEdBQUcsR0FBRyxHQUFHLENBQUMsQ0FBQyxDQUFDLEVBQ1osR0FBRyxHQUFHLEdBQUcsQ0FBQyxDQUFDLENBQUMsRUFDWixHQUFHLEdBQUcsR0FBRyxDQUFDLENBQUMsQ0FBQyxFQUNaLEdBQUcsR0FBRyxHQUFHLENBQUMsRUFBRSxDQUFDLEVBQ2IsR0FBRyxHQUFHLEdBQUcsQ0FBQyxFQUFFLENBQUMsQ0FBQztJQUVsQixHQUFHLENBQUMsQ0FBQyxDQUFDLEdBQUcsR0FBRyxHQUFHLENBQUMsR0FBRyxHQUFHLEdBQUcsQ0FBQyxDQUFBO0lBQzFCLEdBQUcsQ0FBQyxDQUFDLENBQUMsR0FBRyxHQUFHLEdBQUcsQ0FBQyxHQUFHLEdBQUcsR0FBRyxDQUFDLENBQUE7SUFDMUIsR0FBRyxDQUFDLENBQUMsQ0FBQyxHQUFHLEdBQUcsR0FBRyxDQUFDLEdBQUcsR0FBRyxHQUFHLENBQUMsQ0FBQTtJQUMxQixHQUFHLENBQUMsQ0FBQyxDQUFDLEdBQUcsR0FBRyxHQUFHLENBQUMsR0FBRyxHQUFHLEdBQUcsQ0FBQyxDQUFBO0lBQzFCLEdBQUcsQ0FBQyxDQUFDLENBQUMsR0FBRyxHQUFHLEdBQUcsQ0FBQyxHQUFHLEdBQUcsR0FBRyxDQUFDLENBQUE7SUFDMUIsR0FBRyxDQUFDLENBQUMsQ0FBQyxHQUFHLEdBQUcsR0FBRyxDQUFDLEdBQUcsR0FBRyxHQUFHLENBQUMsQ0FBQTtJQUMxQixHQUFHLENBQUMsRUFBRSxDQUFDLEdBQUcsR0FBRyxHQUFHLENBQUMsR0FBRyxHQUFHLEdBQUcsQ0FBQyxDQUFBO0lBQzNCLEdBQUcsQ0FBQyxFQUFFLENBQUMsR0FBRyxHQUFHLEdBQUcsQ0FBQyxHQUFHLEdBQUcsR0FBRyxDQUFDLENBQUE7SUFDM0IsTUFBTSxDQUFDLEdBQUcsQ0FBQTtBQUNkLENBQUM7QUFyQkQsMEJBcUJDO0FBRUQsaUJBQXdCLEdBQVMsRUFBRSxHQUFXO0lBQzFDLElBQUksQ0FBQyxHQUFHLElBQUksQ0FBQyxHQUFHLENBQUMsR0FBRyxDQUFDLEVBQ2pCLENBQUMsR0FBRyxJQUFJLENBQUMsR0FBRyxDQUFDLEdBQUcsQ0FBQyxFQUNqQixHQUFHLEdBQUcsR0FBRyxDQUFDLENBQUMsQ0FBQyxFQUNaLEdBQUcsR0FBRyxHQUFHLENBQUMsQ0FBQyxDQUFDLEVBQ1osR0FBRyxHQUFHLEdBQUcsQ0FBQyxDQUFDLENBQUMsRUFDWixHQUFHLEdBQUcsR0FBRyxDQUFDLENBQUMsQ0FBQyxFQUNaLEdBQUcsR0FBRyxHQUFHLENBQUMsQ0FBQyxDQUFDLEVBQ1osR0FBRyxHQUFHLEdBQUcsQ0FBQyxDQUFDLENBQUMsRUFDWixHQUFHLEdBQUcsR0FBRyxDQUFDLENBQUMsQ0FBQyxFQUNaLEdBQUcsR0FBRyxHQUFHLENBQUMsQ0FBQyxDQUFDLENBQUE7SUFFaEIsR0FBRyxDQUFDLENBQUMsQ0FBQyxHQUFHLEdBQUcsR0FBRyxDQUFDLEdBQUcsR0FBRyxHQUFHLENBQUMsQ0FBQTtJQUMxQixHQUFHLENBQUMsQ0FBQyxDQUFDLEdBQUcsR0FBRyxHQUFHLENBQUMsR0FBRyxHQUFHLEdBQUcsQ0FBQyxDQUFBO0lBQzFCLEdBQUcsQ0FBQyxDQUFDLENBQUMsR0FBRyxHQUFHLEdBQUcsQ0FBQyxHQUFHLEdBQUcsR0FBRyxDQUFDLENBQUE7SUFDMUIsR0FBRyxDQUFDLENBQUMsQ0FBQyxHQUFHLEdBQUcsR0FBRyxDQUFDLEdBQUcsR0FBRyxHQUFHLENBQUMsQ0FBQTtJQUMxQixHQUFHLENBQUMsQ0FBQyxDQUFDLEdBQUcsR0FBRyxHQUFHLENBQUMsR0FBRyxHQUFHLEdBQUcsQ0FBQyxDQUFBO0lBQzFCLEdBQUcsQ0FBQyxDQUFDLENBQUMsR0FBRyxHQUFHLEdBQUcsQ0FBQyxHQUFHLEdBQUcsR0FBRyxDQUFDLENBQUE7SUFDMUIsR0FBRyxDQUFDLENBQUMsQ0FBQyxHQUFHLEdBQUcsR0FBRyxDQUFDLEdBQUcsR0FBRyxHQUFHLENBQUMsQ0FBQTtJQUMxQixHQUFHLENBQUMsQ0FBQyxDQUFDLEdBQUcsR0FBRyxHQUFHLENBQUMsR0FBRyxHQUFHLEdBQUcsQ0FBQyxDQUFBO0lBQzFCLE1BQU0sQ0FBQyxHQUFHLENBQUE7QUFDZCxDQUFDO0FBckJELDBCQXFCQztBQUVELGVBQXVCLEdBQVMsRUFBRSxDQUFPO0lBQ3JDLElBQUksQ0FBQyxHQUFHLENBQUMsQ0FBQyxDQUFDLENBQUMsRUFBRSxDQUFDLEdBQUcsQ0FBQyxDQUFDLENBQUMsQ0FBQyxFQUFFLENBQUMsR0FBRyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUE7SUFFaEMsR0FBRyxDQUFDLENBQUMsQ0FBQyxHQUFHLEdBQUcsQ0FBQyxDQUFDLENBQUMsR0FBRyxDQUFDLENBQUE7SUFDbkIsR0FBRyxDQUFDLENBQUMsQ0FBQyxHQUFHLEdBQUcsQ0FBQyxDQUFDLENBQUMsR0FBRyxDQUFDLENBQUE7SUFDbkIsR0FBRyxDQUFDLENBQUMsQ0FBQyxHQUFHLEdBQUcsQ0FBQyxDQUFDLENBQUMsR0FBRyxDQUFDLENBQUE7SUFDbkIsR0FBRyxDQUFDLENBQUMsQ0FBQyxHQUFHLEdBQUcsQ0FBQyxDQUFDLENBQUMsR0FBRyxDQUFDLENBQUE7SUFDbkIsR0FBRyxDQUFDLENBQUMsQ0FBQyxHQUFHLEdBQUcsQ0FBQyxDQUFDLENBQUMsR0FBRyxDQUFDLENBQUE7SUFDbkIsR0FBRyxDQUFDLENBQUMsQ0FBQyxHQUFHLEdBQUcsQ0FBQyxDQUFDLENBQUMsR0FBRyxDQUFDLENBQUE7SUFDbkIsR0FBRyxDQUFDLENBQUMsQ0FBQyxHQUFHLEdBQUcsQ0FBQyxDQUFDLENBQUMsR0FBRyxDQUFDLENBQUE7SUFDbkIsR0FBRyxDQUFDLENBQUMsQ0FBQyxHQUFHLEdBQUcsQ0FBQyxDQUFDLENBQUMsR0FBRyxDQUFDLENBQUE7SUFDbkIsR0FBRyxDQUFDLENBQUMsQ0FBQyxHQUFHLEdBQUcsQ0FBQyxDQUFDLENBQUMsR0FBRyxDQUFDLENBQUE7SUFDbkIsR0FBRyxDQUFDLENBQUMsQ0FBQyxHQUFHLEdBQUcsQ0FBQyxDQUFDLENBQUMsR0FBRyxDQUFDLENBQUE7SUFDbkIsR0FBRyxDQUFDLEVBQUUsQ0FBQyxHQUFHLEdBQUcsQ0FBQyxFQUFFLENBQUMsR0FBRyxDQUFDLENBQUE7SUFDckIsR0FBRyxDQUFDLEVBQUUsQ0FBQyxHQUFHLEdBQUcsQ0FBQyxFQUFFLENBQUMsR0FBRyxDQUFDLENBQUE7SUFDckIsR0FBRyxDQUFDLEVBQUUsQ0FBQyxHQUFHLEdBQUcsQ0FBQyxFQUFFLENBQUMsQ0FBQTtJQUNqQixHQUFHLENBQUMsRUFBRSxDQUFDLEdBQUcsR0FBRyxDQUFDLEVBQUUsQ0FBQyxDQUFBO0lBQ2pCLEdBQUcsQ0FBQyxFQUFFLENBQUMs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QUNkLEVBQUUsSUFBSSxHQUFHLENBQUM7UUFDVixFQUFFLElBQUksR0FBRyxDQUFDO1FBQ1YsRUFBRSxJQUFJLEdBQUcsQ0FBQztJQUNkLENBQUM7SUFFRCxHQUFHLENBQUMsQ0FBQyxDQUFDLEdBQUcsRUFBRSxDQUFDO0lBQ1osR0FBRyxDQUFDLENBQUMsQ0FBQyxHQUFHLEVBQUUsQ0FBQztJQUNaLEdBQUcsQ0FBQyxDQUFDLENBQUMsR0FBRyxFQUFFLENBQUM7SUFDWixHQUFHLENBQUMsQ0FBQyxDQUFDLEdBQUcsQ0FBQyxDQUFDO0lBQ1gsR0FBRyxDQUFDLENBQUMsQ0FBQyxHQUFHLEVBQUUsQ0FBQztJQUNaLEdBQUcsQ0FBQyxDQUFDLENBQUMsR0FBRyxFQUFFLENBQUM7SUFDWixHQUFHLENBQUMsQ0FBQyxDQUFDLEdBQUcsRUFBRSxDQUFDO0lBQ1osR0FBRyxDQUFDLENBQUMsQ0FBQyxHQUFHLENBQUMsQ0FBQztJQUNYLEdBQUcsQ0FBQyxDQUFDLENBQUMsR0FBRyxFQUFFLENBQUM7SUFDWixHQUFHLENBQUMsQ0FBQyxDQUFDLEdBQUcsRUFBRSxDQUFDO0lBQ1osR0FBRyxDQUFDLEVBQUUsQ0FBQyxHQUFHLEVBQUUsQ0FBQztJQUNiLEdBQUcsQ0FBQyxFQUFFLENBQUMsR0FBRyxDQUFDLENBQUM7SUFDWixHQUFHLENBQUMsRUFBRSxDQUFDLEdBQUcsQ0FBQyxDQUFDLEVBQUUsR0FBRyxJQUFJLEdBQUcsRUFBRSxHQUFHLElBQUksR0FBRyxFQUFFLEdBQUcsSUFBSSxDQUFDLENBQUM7SUFDL0MsR0FBRyxDQUFDLEVBQUUsQ0FBQyxHQUFHLENBQUMsQ0FBQyxFQUFFLEdBQUcsSUFBSSxHQUFHLEVBQUUsR0FBRyxJQUFJLEdBQUcsRUFBRSxHQUFHLElBQUksQ0FBQyxDQUFDO0lBQy9DLEdBQUcsQ0FBQyxFQUFFLENBQUMsR0FBRyxDQUFDLENBQUMsRUFBRSxHQUFHLElBQUksR0FBRyxFQUFFLEdBQUcsSUFBSSxHQUFHLEVBQUUsR0FBRyxJQUFJLENBQUMsQ0FBQztJQUMvQyxHQUFHLENBQUMsRUFBRSxDQUFDLEdBQUcsQ0FBQyxDQUFDO0lBRVosTUFBTSxDQUFDLEdBQUcsQ0FBQztBQUNiLENBQUM7QUFyRkQsd0JBcUZDO0FBQUEsQ0FBQztBQUVGLHFCQUE2QixHQUFTLEVBQUUsSUFBWSxFQUFFLE1BQWMsRUFBRSxJQUFZLEVBQUUsR0FBVztJQUMzRixJQUFJLENBQUMsR0FBRyxHQUFHLEdBQUcsSUFBSSxDQUFDLEdBQUcsQ0FBQyxJQUFJLEdBQUcsQ0FBQyxDQUFDLEVBQzVCLEVBQUUsR0FBRyxDQUFDLEdBQUcsQ0FBQyxJQUFJLEdBQUcsR0FBRyxDQUFDLENBQUM7SUFDMUIsR0FBRyxDQUFDLENBQUMsQ0FBQyxHQUFHLENBQUMsR0FBRyxNQUFNLENBQUM7SUFDcEIsR0FBRyxDQUFDLENBQUMsQ0FBQyxHQUFHLENBQUMsQ0FBQztJQUNYLEdBQUcsQ0FBQyxDQUFDLENBQUMsR0FBRyxDQUFDLENBQUM7SUFDWCxHQUFHLENBQUMsQ0FBQyxDQUFDLEdBQUcsQ0FBQyxDQUFDO0lBQ1gsR0FBRyxDQUFDLENBQUMsQ0FBQyxHQUFHLENBQUMsQ0FBQztJQUNYLEdBQUcsQ0FBQyxDQUFDLENBQUMsR0FBRyxDQUFDLENBQUM7SUFDWCxHQUFHLENBQUMsQ0FBQyxDQUFDLEdBQUcsQ0FBQyxDQUFDO0lBQ1gsR0FBRyxDQUFDLENBQUMsQ0FBQyxHQUFHLENBQUMsQ0FBQztJQUNYLEdBQUcsQ0FBQyxDQUFDLENBQUMsR0FBRyxDQUFDLENBQUM7SUFDWCxHQUFHLENBQUMsQ0FBQyxDQUFDLEdBQUcsQ0FBQyxDQUFDO0lBQ1gsR0FBRyxDQUFDLEVBQUUsQ0FBQyxHQUFHLENBQUMsR0FBRyxHQUFHLElBQUksQ0FBQyxHQUFHLEVBQUUsQ0FBQztJQUM1QixHQUFHLENBQUMsRUFBRSxDQUFDLEdBQUcsQ0FBQyxDQUFDLENBQUM7SUFDYixHQUFHLENBQUMsRUFBRSxDQUFDLEdBQUcsQ0FBQyxDQUFDO0lBQ1osR0FBRyxDQUFDLEVBQUUsQ0FBQyxHQUFHLENBQUMsQ0FBQztJQUNaLEdBQUcsQ0FBQyxFQUFFLENBQUMsR0FB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QUMsUUFBUSxDQUFDLE1BQU0sR0FBRyxDQUFDO2FBQ3hDLENBQUMsQ0FBQTtZQUNGLHFCQUFxQixDQUFDLE1BQU0sQ0FBQyxDQUFBO1FBQy9CLENBQUMsQ0FBQTtRQUNELHFCQUFxQixDQUFDLE1BQU0sQ0FBQyxDQUFBO1FBRTdCLFFBQVEsQ0FBQyxJQUFJLENBQUMsZ0JBQWdCLENBQUMsU0FBUyxFQUFFLENBQUMsRUFBRSxPQUFPLEVBQUUsS0FBSyxJQUFJLENBQUMsT0FBTyxDQUFDLEdBQUcsQ0FBQyxDQUFDLENBQUE7UUFDN0UsUUFBUSxDQUFDLElBQUksQ0FBQyxnQkFBZ0IsQ0FBQyxPQUFPLEVBQUUsQ0FBQyxFQUFFLE9BQU8sRUFBRSxLQUFLLElBQUksQ0FBQyxPQUFPLENBQUMsR0FBRyxDQUFDLENBQUMsQ0FBQTtJQUM3RSxDQUFDO0FBQ0gsQ0FBQyxDQUFDLENBQUE7Ozs7O0FDNUdGLGtCQUNBOzs7Ozs7Ozs7Ozs7Q0FZQyxDQUFBOzs7OztBQ2JELGtCQUNBOzs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7O0NBK0JDLENBQUEiLCJmaWxlIjoiZ2VuZXJhdGVkLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXNDb250ZW50IjpbIihmdW5jdGlvbiBlKHQsbixyKXtmdW5jdGlvbiBzKG8sdSl7aWYoIW5bb10pe2lmKCF0W29dKXt2YXIgYT10eXBlb2YgcmVxdWlyZT09XCJmdW5jdGlvblwiJiZyZXF1aXJlO2lmKCF1JiZhKXJldHVybiBhKG8sITApO2lmKGkpcmV0dXJuIGkobywhMCk7dmFyIGY9bmV3IEVycm9yKFwiQ2Fubm90IGZpbmQgbW9kdWxlICdcIitvK1wiJ1wiKTt0aHJvdyBmLmNvZGU9XCJNT0RVTEVfTk9UX0ZPVU5EXCIsZn12YXIgbD1uW29dPXtleHBvcnRzOnt9fTt0W29dWzBdLmNhbGwobC5leHBvcnRzLGZ1bmN0aW9uKGUpe3ZhciBuPXRbb11bMV1bZV07cmV0dXJuIHMobj9uOmUpfSxsLGwuZXhwb3J0cyxlLHQsbixyKX1yZXR1cm4gbltvXS5leHBvcnRzfXZhciBpPXR5cGVvZiByZXF1aXJlPT1cImZ1bmN0aW9uXCImJnJlcXVpcmU7Zm9yKHZhciBvPTA7bzxyLmxlbmd0aDtvKyspcyhyW29dKTtyZXR1cm4gc30pIiwiaW1wb3J0IHsgR0wsIFByb2dyYW0gfSBmcm9tICcuL0dMVHlwZXMnXG5cbi8qXG4gIFRIT1VHSFRTIE9OIElOREVYIC8gZHJhd0VsZW1lbnRzIFxuXG4gIEVhY2ggY29tbWFuZCBpcyBlaXRoZXIgcmVuZGVyZXJlZCB3aXRoIGRyYXdFbGVtZW50cyBvciBkcmF3QXJyYXlzXG4gIHRoaXMgc2hvdWxkIGJlIGRldGVybWluZWQgYnkgd2hldGhlciB0aGUgY2ZnIHN1cHBsaWVzIGFuIGluZGV4IGF0dHJpYnV0ZVxuICBmb3IgdGhlIFwiaW5kZXhcIiBwcm9wZXJ0eS4gIEkgdGhpbmsgdGhpcyBpcyBiZXN0IHNlcGFyYXRlZCBmcm9tIGdlbmVyYWxcbiAgYXR0cmlidXRlcyBhcyBpdCBwbGF5cyBhbiBpbXBvcnRhbnQgcm9sZSBpbiBkZXRlcm1pbmluZyBob3cgdGhlIGNvbW1hbmRcbiAgd2lsbCBiZSB1c2VkLiAgRnVydGhlcm1vcmUsIGl0IGFsc28gc2VlbXMgdGhhdCB0aGVyZSBpcyBubyBuZWVkIGZvciB1c2VyXG4gIGN1c3RvbWl6YXRpb24gZm9yIHRoaXMgcHJvcGVydHkuICBJZiB0aGV5IHN1cHBseSBhbiBJbnQxNkFycmF5IGZvciB0aGUgXG4gIGluZGV4IHByb3BlcnR5LCB0aGVuIHRoZSBjb21tYW5kIHdpbGwgZXhlY3V0ZSB3aXRoIGRyYXdFbGVtZW50c1xuICBhbmQgbm90IGRyYXdBcnJheXNcbiovXG5cbmV4cG9ydCB0eXBlIEF0dHJpYnV0ZVNpemUgPSAxIHwgMiB8IDMgfCA0XG5leHBvcnQgZW51bSBCdWZmZXJUeXBlIHsgQllURSwgVU5TSUdORURfQllURSwgU0hPUlQsIFVOU0lHTkVEX1NIT1JULCBGTE9BVCB9XG5cbmV4cG9ydCBpbnRlcmZhY2UgQXR0cmlidXRlQ2ZnPFQ+IHsgXG4gIHZhbHVlOiBUXG4gIHJlYWRvbmx5IGJ1ZmZlclR5cGU6IEJ1ZmZlclR5cGVcbiAgc2l6ZTogQXR0cmlidXRlU2l6ZVxuICBvZmZzZXQ/OiBudW1iZXJcbiAgc3RyaWRlPzogbnVtYmVyXG4gIHNldHVwKCBnbDogR0wsIGE6IEF0dHJpYnV0ZTxUPiApOiB2b2lkXG4gIHNldCggZ2w6IEdMLCBhOiBBdHRyaWJ1dGU8VD4sIHQ6IFQgKTogdm9pZFxuICB0ZWFyZG93biggZ2w6IEdMLCBhOiBBdHRyaWJ1dGU8VD4gKTogdm9pZFxufVxuXG5leHBvcnQgaW50ZXJmYWNlIEF0dHJpYnV0ZTxUPiBleHRlbmRzIEF0dHJpYnV0ZUNmZzxUPiB7XG4gIGxvYzogbnVtYmVyXG4gIGJ1ZmZlcjogV2ViR0xCdWZmZXJcbn1cblxuZXhwb3J0IHR5cGUgQXR0cmlidXRlQ2ZnczxUPiA9IHsgWyBQIGluIGtleW9mIFQgXTogQXR0cmlidXRlQ2ZnPFRbUF0+IH1cbmV4cG9ydCB0eXBlIEF0dHJpYnV0ZXM8VD4gPSB7IFsgUCBpbiBrZXlvZiBUIF06IEF0dHJpYnV0ZTxUW1BdPiB9XG5cbmV4cG9ydCBjbGFzcyBGbG9hdHMgaW1wbGVtZW50cyBBdHRyaWJ1dGVDZmc8RmxvYXQzMkFycmF5PiB7XG4gIG9mZnNldCA9IDBcbiAgc3RyaWRlID0gMFxuICByZWFkb25seSBidWZmZXJUeXBlID0gQnVmZmVyVHlwZS5GTE9BVFxuICBjb25zdHJ1Y3RvciggcHVibGljIHNpemU6IEF0dHJpYnV0ZVNpemUsIHB1YmxpYyB2YWx1ZTogRmxvYXQzMkFycmF5ICkge31cbiAgc2V0dXAoZ2w6IEdMLCBhOiBBdHRyaWJ1dGU8RmxvYXQzMkFycmF5PiApIHtcbiAgICBjb25zdCB7IGxvYywgc2l6ZSwgYnVmZmVyVHlwZSwgYnVmZmVyLCBzdHJpZGUgPSAwLCBvZmZzZXQgPSAwIH0gPSBhXG5cbiAgICBnbC5iaW5kQnVmZmVyKGdsLkFSUkFZX0JVRkZFUiwgYnVmZmVyKVxuICAgIGdsLmVuYWJsZVZlcnRleEF0dHJpYkFycmF5KGEubG9jKVxuICAgIGdsLnZlcnRleEF0dHJpYlBvaW50ZXIobG9jLCBzaXplLCB0b0dMVHlwZShnbCwgYnVmZmVyVHlwZSksIGZhbHNlLCBzdHJpZGUsIG9mZnNldClcbiAgfVxuICBzZXQoIGdsOiBHTCwgYTogQXR0cmlidXRlPEZsb2F0MzJBcnJheT4sIHZhbHVlOiBGbG9hdDMyQXJyYXkgKSB7XG4gICAgZ2wuYnVmZmVyRGF0YShnbC5BUlJBWV9CVUZGRVIsIHZhbHVlLCBnbC5EWU5BTUlDX0RSQVcpXG4gIH1cbiAgdGVhcmRvd24oZ2w6IEdMLCBhOiBBdHRyaWJ1dGU8RmxvYXQzMkFycmF5PiApIHtcbiAgICBnbC5kaXNhYmxlVmVydGV4QXR0cmliQXJyYXkoYS5sb2MpIFxuICAgIGdsLmJpbmRCdWZmZXIoZ2wuQVJSQVlfQlVGRkVSLCBudWxsKVxuICB9XG59XG5cbmV4cG9ydCBmdW5jdGlvbiBzZXR1cEF0dHJpYnV0ZTxUPiAoIGdsOiBHTCwgcHJvZ3JhbTogUHJvZ3JhbSwgbmFtZTogc3RyaW5nLCBhY2ZnOiBBdHRyaWJ1dGVDZmc8VD4gKTogQXR0cmlidXRlPFQ+IHwgRXJyb3Ige1xuICBjb25zdCB7IHZhbHVlLCBidWZmZXJUeXBlLCBzaXplLCBzZXQsIHNldHVwLCB0ZWFyZG93biwgb2Zmc2V0ID0gMCwgc3RyaWRlID0gMCB9ID0gYWNmZ1xuICBjb25zdCBsb2MgPSBnbC5nZXRBdHRyaWJMb2NhdGlvbihwcm9ncmFtLCBuYW1lKVxuICBjb25zdCBidWZmZXIgPSBnbC5jcmVhdGVCdWZmZXIoKVxuXG4gIGlmICggbG9jID09IG51bGwgKSAgICByZXR1cm4gbmV3IEVycm9yKGBDb3VsZCBub3QgbG9jYXRlIGF0dHI6ICR7IG5hbWUgfWApXG4gIGlmICggYnVmZmVyID09IG51bGwgKSByZXR1cm4gbmV3IEVycm9yKGBDb3VsZCBub3QgY3JlYXRlIGJ1ZmZlciBmb3IgYXR0cjogJHsgbmFtZSB9YClcblxuICBjb25zdCBhID0geyB2YWx1ZSwgYnVmZmVyVHlwZSwgc2l6ZSwgb2Zmc2V0LCBzdHJpZGUsIGxvYywgYnVmZmVyLCBzZXQsIHNldHVwLCB0ZWFyZG93biB9XG5cbiAgc2V0dXAoZ2wsIGEpXG4gIHNldChnbCwgYSwgdmFsdWUpXG4gIHRlYXJkb3duKGdsLCBhKVxuICByZXR1cm4gYVxufVxuXG5mdW5jdGlvbiB0b0dMVHlwZSAoIGdsOiBHTCwgYnVmZmVyVHlwZTogQnVmZmVyVHlwZSApOiBudW1iZXIge1xuICBzd2l0Y2ggKCBidWZmZXJUeXBlICkge1xuICAgIGNhc2UgQnVmZmVyVHlwZS5GTE9BVDogICAgICAgICAgcmV0dXJuIGdsLkZMT0FUXG4gICAgY2FzZSBCdWZmZXJUeXBlLlNIT1JUOiAgICAgICAgICByZXR1cm4gZ2wuU0hPUlRcbiAgICBjYXNlIEJ1ZmZlclR5cGUuQllURTogICAgICAgICAgIHJldHVybiBnbC5CWVRFXG4gICAgY2FzZSBCdWZmZXJUeXBlLlVOU0lHTkVEX1NIT1JUOiByZXR1cm4gZ2wuVU5TSUdORURfU0hPUlRcbiAgICBjYXNlIEJ1ZmZlclR5cGUuVU5TSUdORURfQllURTogIHJldHVybiBnbC5VTlNJR05FRF9CWVRFXG4gICAgZGVmYXVsdDogY29uc3QgbjogbmV2ZXIgPSBidWZmZXJUeXBlXG4gICAgICAgICAgICAgcmV0dXJuIG5cbiAgfVxufVxuIiwiaW1wb3J0IHsgR0wsIFByb2dyYW0sIFNoYWRlciwgU2hhZGVyU3JjIH0gZnJvbSAnLi9HTFR5cGVzJ1xuaW1wb3J0IHsgVW5pZm9ybUNmZ3MsIFVuaWZvcm1zLCBzZXR1cFVuaWZvcm0gfSBmcm9tICcuL1VuaWZvcm1zJ1xuaW1wb3J0IHsgQXR0cmlidXRlQ2ZncywgQXR0cmlidXRlcywgc2V0dXBBdHRyaWJ1dGUgfSBmcm9tICcuL0F0dHJpYnV0ZXMnXG5pbXBvcnQgeyB0b0Vycm9yIH0gZnJvbSAnLi91dGlscydcblxuZXhwb3J0IGludGVyZmFjZSBDb21tYW5kQ2ZnPFUsIEE+IHtcbiAgdnNyYzogc3RyaW5nXG4gIGZzcmM6IHN0cmluZ1xuICB1bmlmb3JtczogVW5pZm9ybUNmZ3M8VT5cbiAgYXR0cmlidXRlczogQXR0cmlidXRlQ2ZnczxBPlxufVxuXG5leHBvcnQgaW50ZXJmYWNlIENvbW1hbmQ8VSwgQT4ge1xuICBnbDogR0xcbiAgcHJvZ3JhbTogUHJvZ3JhbVxuICB1bmlmb3JtczogVW5pZm9ybXM8VT5cbiAgYXR0cmlidXRlczogQXR0cmlidXRlczxBPlxufVxuXG5leHBvcnQgaW50ZXJmYWNlIFBhcmFtczxVLCBBPiB7XG4gIHVuaWZvcm1zPzogUGFydGlhbDxVPlxuICBhdHRyaWJ1dGVzPzogUGFydGlhbDxBPiBcbiAgY291bnQ6IG51bWJlclxufVxuXG5leHBvcnQgZnVuY3Rpb24gcnVuPFUsIEE+ICggY21kOiBDb21tYW5kPFUsIEE+LCBwOiBQYXJhbXM8VSwgQT4gKSB7XG4gIGNvbnN0IHsgZ2wsIHByb2dyYW0gfSA9IGNtZFxuICBjb25zdCB7IGF0dHJpYnV0ZXMsIHVuaWZvcm1zLCBjb3VudCB9ID0gcFxuXG4gIGdsLnVzZVByb2dyYW0ocHJvZ3JhbSlcblxuICBmb3IgKCBjb25zdCBrZXkgaW4gY21kLnVuaWZvcm1zICkge1xuICAgIGNvbnN0IHsgbG9jLCB2YWx1ZSwgc2V0IH0gPSBjbWQudW5pZm9ybXNba2V5XVxuICAgIGNvbnN0IHZhbCA9IHVuaWZvcm1zICYmIHVuaWZvcm1zW2tleV0gfHwgdmFsdWVcblxuICAgIHNldChnbCwgbG9jLCB2YWwpXG4gIH1cblxuICBmb3IgKCBjb25zdCBrZXkgaW4gY21kLmF0dHJpYnV0ZXMgKSB7XG4gICAgY29uc3QgYSA9IGNtZC5hdHRyaWJ1dGVzW2tleV1cbiAgICBjb25zdCB2YWwgPSBhdHRyaWJ1dGVzICYmIGF0dHJpYnV0ZXNba2V5XVxuXG4gICAgYS5zZXR1cChnbCwgYSlcbiAgICBpZiAoIHZhbCAhPSBudWxsICkgYS5zZXQoZ2wsIGEsIHZhbClcbiAgfVxuXG4gIGdsLmRyYXdBcnJheXMoZ2wuVFJJQU5HTEVTLCAwLCBjb3VudClcblxuICBmb3IgKCBjb25zdCBrZXkgaW4gY21kLmF0dHJpYnV0ZXMgKSB7XG4gICAgY29uc3QgYSA9IGNtZC5hdHRyaWJ1dGVzW2tleV1cblxuICAgIGEudGVhcmRvd24oZ2wsIGEpXG4gIH1cblxuICBnbC51c2VQcm9ncmFtKG51bGwpXG59XG5cblxuZXhwb3J0IGZ1bmN0aW9uIGNyZWF0ZUNvbW1hbmQ8VSwgQT4gKCBnbDogR0wsIGNmZzogQ29tbWFuZENmZzxVLCBBPiApOiBDb21tYW5kPFUsIEE+IHwgRXJyb3Ige1xuICBjb25zdCBwcm9ncmFtID0gZnJvbVNvdXJjZShnbCwgY2ZnLnZzcmMsIGNmZy5mc3JjKVxuXG4gIGlmICggcHJvZ3JhbSBpbnN0YW5jZW9mIEVycm9yICkgcmV0dXJuIHByb2dyYW1cblxuICBjb25zdCB1bmlmb3JtcyA9IHNldHVwVW5pZm9ybXMoZ2wsIHByb2dyYW0sIGNmZy51bmlmb3JtcylcblxuICBpZiAoIHVuaWZvcm1zIGluc3RhbmNlb2YgRXJyb3IgKSB1bmlmb3Jtc1xuXG4gIGNvbnN0IGF0dHJpYnV0ZXMgPSBzZXR1cEF0dHJpYnV0ZXMoZ2wsIHByb2dyYW0sIGNmZy5hdHRyaWJ1dGVzKVxuXG4gIGlmICggYXR0cmlidXRlcyBpbnN0YW5jZW9mIEVycm9yICkgcmV0dXJuIGF0dHJpYnV0ZXNcblxuICByZXR1cm4geyBnbCwgcHJvZ3JhbSwgdW5pZm9ybXMsIGF0dHJpYnV0ZXMgfSBhcyBDb21tYW5kPFUsIEE+XG59XG5cbmZ1bmN0aW9uIHNldHVwVW5pZm9ybXM8VD4gKCBnbDogR0wsIHByb2dyYW06IFByb2dyYW0sIHVjZmdzOiBVbmlmb3JtQ2ZnczxUPiApOiBVbmlmb3JtczxUPiB8IEVycm9yIHtcbiAgY29uc3Qgb3V0ID0ge30gYXMgVW5pZm9ybXM8VD5cblxuICBnbC51c2VQcm9ncmFtKHByb2dyYW0pXG4gIGZvciAoIGNvbnN0IGtleSBpbiB1Y2ZncyApIHtcbiAgICBjb25zdCB1bmlmb3JtID0gc2V0dXBVbmlmb3JtKGdsLCBwcm9ncmFtLCBrZXksIHVjZmdzW2tleV0pXG5cbiAgICBpZiAoIHVuaWZvcm0gaW5zdGFuY2VvZiBFcnJvciApIHJldHVybiB1bmlmb3JtXG4gICAgZWxzZSAgICAgICAgICAgICAgICAgICAgICAgICAgICBvdXRba2V5XSA9IHVuaWZvcm1cbiAgfVxuICBnbC51c2VQcm9ncmFtKG51bGwpXG4gIHJldHVybiBvdXRcbn1cblxuZnVuY3Rpb24gc2V0dXBBdHRyaWJ1dGVzPFQ+ICggZ2w6IEdMLCBwcm9ncmFtOiBQcm9ncmFtLCB1YXR0cnM6IEF0dHJpYnV0ZUNmZ3M8VD4gKTogQXR0cmlidXRlczxUPiB8IEVycm9yIHtcbiAgY29uc3Qgb3V0ID0ge30gYXMgQXR0cmlidXRlczxUPlxuXG4gIGdsLnVzZVByb2dyYW0ocHJvZ3JhbSlcbiAgZm9yICggY29uc3Qga2V5IGluIHVhdHRycyApIHtcbiAgICBjb25zdCBhdHRyID0gc2V0dXBBdHRyaWJ1dGUoZ2wsIHByb2dyYW0sIGtleSwgdWF0dHJzW2tleV0pXG5cbiAgICBpZiAoIGF0dHIgaW5zdGFuY2VvZiBFcnJvciApIHJldHVybiBhdHRyXG4gICAgZWxzZSAgICAgICAgICAgICAgICAgICAgICAgICBvdXRba2V5XSA9IGF0dHJcbiAgfVxuICBnbC51c2VQcm9ncmFtKG51bGwpXG4gIHJldHVybiBvdXQgXG59XG5cbmZ1bmN0aW9uIGNvbXBpbGVTaGFkZXIgKCBnbDogR0wsIGtpbmQ6IG51bWJlciwgc3JjOiBTaGFkZXJTcmMgKTogU2hhZGVyIHwgRXJyb3Ige1xuICBjb25zdCBzaGFkZXIgPSBnbC5jcmVhdGVTaGFkZXIoa2luZClcbiAgY29uc3Qga2luZFN0ciA9IGtpbmQgPT09IGdsLlZFUlRFWF9TSEFERVIgPyAnVkVSVEVYJyA6ICdGUkFHTUVOVCdcblxuICBnbC5zaGFkZXJTb3VyY2Uoc2hhZGVyLCBzcmMpXG4gIGdsLmNvbXBpbGVTaGFkZXIoc2hhZGVyKVxuICByZXR1cm4gc2hhZGVyICYmIGdsLmdldFNoYWRlclBhcmFtZXRlcihzaGFkZXIsIGdsLkNPTVBJTEVfU1RBVFVTKVxuICAgID8gc2hhZGVyXG4gICAgOiBuZXcgRXJyb3IoYCR7IGtpbmRTdHIgfTogJHsgZ2wuZ2V0U2hhZGVySW5mb0xvZyhzaGFkZXIpIHx8ICcnIH1gKVxufVxuXG5mdW5jdGlvbiBmcm9tU291cmNlICggZ2w6IEdMLCB2c3JjOiBTaGFkZXJTcmMsIGZzcmM6IFNoYWRlclNyYyApOiBQcm9ncmFtIHwgRXJyb3Ige1xuICBjb25zdCB2ZXJ0ZXggPSBjb21waWxlU2hhZGVyKGdsLCBnbC5WRVJURVhfU0hBREVSLCB2c3JjKVxuICBjb25zdCBmcmFnbWVudCA9IGNvbXBpbGVTaGFkZXIoZ2wsIGdsLkZSQUdNRU5UX1NIQURFUiwgZnNyYylcbiAgY29uc3QgcHJvZ3JhbSA9IGdsLmNyZWF0ZVByb2dyYW0oKVxuXG4gIGlmICggdmVydGV4IGluc3RhbmNlb2YgRXJyb3IgKSByZXR1cm4gdmVydGV4XG4gIGlmICggZnJhZ21lbnQgaW5zdGFuY2VvZiBFcnJvciApIHJldHVybiBmcmFnbWVudFxuXG4gIGdsLmF0dGFjaFNoYWRlcihwcm9ncmFtLCB2ZXJ0ZXgpXG4gIGdsLmF0dGFjaFNoYWRlcihwcm9ncmFtLCBmcmFnbWVudClcbiAgZ2wubGlua1Byb2dyYW0ocHJvZ3JhbSlcblxuICByZXR1cm4gcHJvZ3JhbSAmJiBnbC5nZXRQcm9ncmFtUGFyYW1ldGVyKHByb2dyYW0sIGdsLkxJTktfU1RBVFVTKSBcbiAgICA/IHByb2dyYW0gXG4gICAgOiBuZXcgRXJyb3IoZ2wuZ2V0UHJvZ3JhbUluZm9Mb2cocHJvZ3JhbSkgfHwgJycpXG59XG4iLCJpbXBvcnQgeyBHTCwgUHJvZ3JhbSwgTG9jLCBGbG9hdHMsIEludHMgfSBmcm9tICcuL0dMVHlwZXMnXG5pbXBvcnQgeyBhc0YzMiwgYXNJMzIgfSBmcm9tICcuL3V0aWxzJ1xuXG5leHBvcnQgaW50ZXJmYWNlIFVuaWZvcm1DZmc8VD4geyBcbiAgdmFsdWU6IFRcbiAgc2V0KCBnbDogR0wsIGg6IFdlYkdMVW5pZm9ybUxvY2F0aW9uLCB0OiBUKTogdm9pZFxufVxuXG5leHBvcnQgaW50ZXJmYWNlIFVuaWZvcm08VD4gZXh0ZW5kcyBVbmlmb3JtQ2ZnPFQ+IHsgXG4gIGxvYzogV2ViR0xVbmlmb3JtTG9jYXRpb25cbn1cblxuZXhwb3J0IHR5cGUgVW5pZm9ybUNmZ3M8VD4gPSB7IFsgUCBpbiBrZXlvZiBUIF06IFVuaWZvcm1DZmc8VFtQXT4gfVxuZXhwb3J0IHR5cGUgVW5pZm9ybXM8VD4gPSB7IFsgUCBpbiBrZXlvZiBUIF06IFVuaWZvcm08VFtQXT4gfVxuXG5leHBvcnQgY2xhc3MgVUYgaW1wbGVtZW50cyBVbmlmb3JtQ2ZnPG51bWJlcj4ge1xuICBjb25zdHJ1Y3RvciggcHVibGljIHZhbHVlOiBudW1iZXIgKSB7fVxuICBzZXQoIGdsOiBHTCwgaDogTG9jLCB0OiBudW1iZXIgKSB7IGdsLnVuaWZvcm0xZihoLCB0KSB9XG59XG5cbmV4cG9ydCBjbGFzcyBVMkYgaW1wbGVtZW50cyBVbmlmb3JtQ2ZnPEZsb2F0cz4ge1xuICBjb25zdHJ1Y3RvciggcHVibGljIHZhbHVlOiBGbG9hdHMgKSB7fVxuICBzZXQoIGdsOiBHTCwgaDogTG9jLCB0OiBGbG9hdHMgKSB7IGdsLnVuaWZvcm0yZihoLCB0WzBdLCB0WzFdKSB9XG59XG5cbmV4cG9ydCBjbGFzcyBVM0YgaW1wbGVtZW50cyBVbmlmb3JtQ2ZnPEZsb2F0cz4ge1xuICBjb25zdHJ1Y3RvciggcHVibGljIHZhbHVlOiBGbG9hdHMgKSB7fVxuICBzZXQoIGdsOiBHTCwgaDogTG9jLCB0OiBGbG9hdHMgKSB7IGdsLnVuaWZvcm0zZihoLCB0WzBdLCB0WzFdLCB0WzJdKSB9XG59XG5cbmV4cG9ydCBjbGFzcyBVNEYgaW1wbGVtZW50cyBVbmlmb3JtQ2ZnPEZsb2F0cz4ge1xuICBjb25zdHJ1Y3RvciggcHVibGljIHZhbHVlOiBGbG9hdHMgKSB7fVxuICBzZXQoIGdsOiBHTCwgaDogTG9jLCB0OiBGbG9hdHMgKSB7IGdsLnVuaWZvcm00ZihoLCB0WzBdLCB0WzFdLCB0WzJdLCB0WzNdKSB9XG59XG5cbmV4cG9ydCBjbGFzcyBVSSBpbXBsZW1lbnRzIFVuaWZvcm1DZmc8bnVtYmVyPiB7XG4gIGNvbnN0cnVjdG9yKCBwdWJsaWMgdmFsdWU6IG51bWJlciApIHt9XG4gIHNldCggZ2w6IEdMLCBoOiBMb2MsIHQ6IG51bWJlciApIHsgZ2wudW5pZm9ybTFpKGgsIHQpIH1cbn1cblxuZXhwb3J0IGNsYXNzIFUySSBpbXBsZW1lbnRzIFVuaWZvcm1DZmc8SW50cz4ge1xuICBjb25zdHJ1Y3RvciggcHVibGljIHZhbHVlOiBJbnRzICkge31cbiAgc2V0KCBnbDogR0wsIGg6IExvYywgdDogSW50cyApIHsgZ2wudW5pZm9ybTJpKGgsIHRbMF0sIHRbMV0pIH1cbn1cblxuZXhwb3J0IGNsYXNzIFUzSSBpbXBsZW1lbnRzIFVuaWZvcm1DZmc8SW50cz4ge1xuICBjb25zdHJ1Y3RvciggcHVibGljIHZhbHVlOiBJbnRzICkge31cbiAgc2V0KCBnbDogR0wsIGg6IExvYywgdDogSW50cyApIHsgZ2wudW5pZm9ybTNpKGgsIHRbMF0sIHRbMV0sIHRbMl0pIH1cbn1cblxuZXhwb3J0IGNsYXNzIFU0SSBpbXBsZW1lbnRzIFVuaWZvcm1DZmc8SW50cz4ge1xuICBjb25zdHJ1Y3RvciggcHVibGljIHZhbHVlOiBJbnRzICkge31cbiAgc2V0KCBnbDogR0wsIGg6IExvYywgdDogSW50cyApIHsgZ2wudW5pZm9ybTRpKGgsIHRbMF0sIHRbMV0sIHRbMl0sIHRbM10pIH1cbn1cblxuZXhwb3J0IGNsYXNzIFVGViBpbXBsZW1lbnRzIFVuaWZvcm1DZmc8RmxvYXRzPiB7XG4gIGNvbnN0cnVjdG9yKCBwdWJsaWMgdmFsdWU6IEZsb2F0cyApIHt9XG4gIHNldCggZ2w6IEdMLCBoOiBMb2MsIHQ6IEZsb2F0cyApIHsgZ2wudW5pZm9ybTFmdihoLCBhc0YzMih0KSkgfVxufVxuXG5leHBvcnQgY2xhc3MgVTJGViBpbXBsZW1lbnRzIFVuaWZvcm1DZmc8RmxvYXRzPiB7XG4gIGNvbnN0cnVjdG9yKCBwdWJsaWMgdmFsdWU6IEZsb2F0cyApIHt9XG4gIHNldCggZ2w6IEdMLCBoOiBMb2MsIHQ6IEZsb2F0cyApIHsgZ2wudW5pZm9ybTJmdihoLCBhc0YzMih0KSkgfVxufVxuXG5leHBvcnQgY2xhc3MgVTNGViBpbXBsZW1lbnRzIFVuaWZvcm1DZmc8RmxvYXRzPiB7XG4gIGNvbnN0cnVjdG9yKCBwdWJsaWMgdmFsdWU6IEZsb2F0cyApIHt9XG4gIHNldCggZ2w6IEdMLCBoOiBMb2MsIHQ6IEZsb2F0cyApIHsgZ2wudW5pZm9ybTNmdihoLCBhc0YzMih0KSkgfVxufVxuXG5leHBvcnQgY2xhc3MgVTRGViBpbXBsZW1lbnRzIFVuaWZvcm1DZmc8RmxvYXRzPiB7XG4gIGNvbnN0cnVjdG9yKCBwdWJsaWMgdmFsdWU6IEZsb2F0cyApIHt9XG4gIHNldCggZ2w6IEdMLCBoOiBMb2MsIHQ6IEZsb2F0cyApIHsgZ2wudW5pZm9ybTRmdihoLCBhc0YzMih0KSkgfVxufVxuXG5leHBvcnQgY2xhc3MgVUlWIGltcGxlbWVudHMgVW5pZm9ybUNmZzxJbnRzPiB7XG4gIGNvbnN0cnVjdG9yKCBwdWJsaWMgdmFsdWU6IEludHMgKSB7fVxuICBzZXQoIGdsOiBHTCwgaDogTG9jLCB0OiBJbnRzICkgeyBnbC51bmlmb3JtMWl2KGgsIGFzSTMyKHQpKSB9XG59XG5cbmV4cG9ydCBjbGFzcyBVMklWIGltcGxlbWVudHMgVW5pZm9ybUNmZzxJbnRzPiB7XG4gIGNvbnN0cnVjdG9yKCBwdWJsaWMgdmFsdWU6IEludHMgKSB7fVxuICBzZXQoIGdsOiBHTCwgaDogTG9jLCB0OiBJbnRzICkgeyBnbC51bmlmb3JtMml2KGgsIGFzSTMyKHQpKSB9XG59XG5cbmV4cG9ydCBjbGFzcyBVM0lWIGltcGxlbWVudHMgVW5pZm9ybUNmZzxJbnRzPiB7XG4gIGNvbnN0cnVjdG9yKCBwdWJsaWMgdmFsdWU6IEludHMgKSB7fVxuICBzZXQoIGdsOiBHTCwgaDogTG9jLCB0OiBJbnRzICkgeyBnbC51bmlmb3JtM2l2KGgsIGFzSTMyKHQpKSB9XG59XG5cbmV4cG9ydCBjbGFzcyBVNElWIGltcGxlbWVudHMgVW5pZm9ybUNmZzxJbnRzPiB7XG4gIGNvbnN0cnVjdG9yKCBwdWJsaWMgdmFsdWU6IEludHMgKSB7fVxuICBzZXQoIGdsOiBHTCwgaDogTG9jLCB0OiBJbnRzICkgeyBnbC51bmlmb3JtNGl2KGgsIGFzSTMyKHQpKSB9XG59XG5cbmV4cG9ydCBjbGFzcyBVTWF0cml4MiBpbXBsZW1lbnRzIFVuaWZvcm1DZmc8RmxvYXRzPiB7XG4gIGNvbnN0cnVjdG9yKCBwdWJsaWMgdmFsdWU6IEZsb2F0cyApIHt9XG4gIHNldCggZ2w6IEdMLCBoOiBMb2MsIHQ6IEZsb2F0cyApIHsgZ2wudW5pZm9ybU1hdHJpeDJmdihoLCBmYWxzZSwgYXNGMzIodCkpIH1cbn1cblxuZXhwb3J0IGNsYXNzIFVNYXRyaXgzIGltcGxlbWVudHMgVW5pZm9ybUNmZzxGbG9hdHM+IHtcbiAgY29uc3RydWN0b3IoIHB1YmxpYyB2YWx1ZTogRmxvYXRzICkge31cbiAgc2V0KCBnbDogR0wsIGg6IExvYywgdDogRmxvYXRzICkgeyBnbC51bmlmb3JtTWF0cml4M2Z2KGgsIGZhbHNlLCBhc0YzMih0KSkgfVxufVxuXG5leHBvcnQgY2xhc3MgVU1hdHJpeDQgaW1wbGVtZW50cyBVbmlmb3JtQ2ZnPEZsb2F0cz4ge1xuICBjb25zdHJ1Y3RvciggcHVibGljIHZhbHVlOiBGbG9hdHMgKSB7fVxuICBzZXQoIGdsOiBHTCwgaDogTG9jLCB0OiBGbG9hdHMgKSB7IGdsLnVuaWZvcm1NYXRyaXg0ZnYoaCwgZmFsc2UsIGFzRjMyKHQpKSB9XG59XG5cbmV4cG9ydCBmdW5jdGlvbiBzZXR1cFVuaWZvcm08VD4gKCBnbDogR0wsIHByb2dyYW06IFByb2dyYW0sIG5hbWU6IHN0cmluZywgdWNmZzogVW5pZm9ybUNmZzxUPiApOiBVbmlmb3JtPFQ+IHwgRXJyb3Ige1xuICBjb25zdCB7IHZhbHVlLCBzZXQgfSA9IHVjZmdcbiAgY29uc3QgbG9jID0gZ2wuZ2V0VW5pZm9ybUxvY2F0aW9uKHByb2dyYW0sIG5hbWUpXG5cbiAgaWYgKCBsb2MgPT0gbnVsbCApIHJldHVybiBuZXcgRXJyb3IoYENvdWxkIG5vdCBmaW5kIHVuaWZvcm0gJHsgbmFtZSB9YClcbiAgZWxzZSAgICAgICAgICAgICAgIHJldHVybiAoc2V0KGdsLCBsb2MsIHZhbHVlKSwgeyB2YWx1ZSwgc2V0LCBsb2MgfSlcbn1cbiIsImltcG9ydCAqIGFzIEF0dHJpYnV0ZXMgZnJvbSAnLi9BdHRyaWJ1dGVzJ1xuaW1wb3J0ICogYXMgVW5pZm9ybXMgZnJvbSAnLi9Vbmlmb3JtcydcbmltcG9ydCAqIGFzIENvbW1hbmQgZnJvbSAnLi9Db21tYW5kJ1xuaW1wb3J0ICogYXMgR0xUeXBlcyBmcm9tICcuL0dMVHlwZXMnXG5cbmV4cG9ydCB7IEF0dHJpYnV0ZXMsIFVuaWZvcm1zLCBDb21tYW5kLCBHTFR5cGVzIH1cbiIsImltcG9ydCB7IEZsb2F0cywgSW50cyB9IGZyb20gJy4vR0xUeXBlcydcblxuZXhwb3J0IGZ1bmN0aW9uIGFzRjMyICggdDogRmxvYXRzICk6IEZsb2F0MzJBcnJheSB7XG4gIHJldHVybiB0IGluc3RhbmNlb2YgRmxvYXQzMkFycmF5ID8gdCA6IG5ldyBGbG9hdDMyQXJyYXkodClcbn1cblxuZXhwb3J0IGZ1bmN0aW9uIGFzSTMyICggdDogSW50cyApOiBJbnQzMkFycmF5IHtcbiAgcmV0dXJuIHQgaW5zdGFuY2VvZiBJbnQzMkFycmF5ID8gdCA6IG5ldyBJbnQzMkFycmF5KHQpXG59XG5cbmV4cG9ydCBmdW5jdGlvbiB0b0Vycm9yPFQ+ICggczogc3RyaW5nLCB2OiBUIHwgbnVsbCApOiBUIHwgRXJyb3Ige1xuICByZXR1cm4gdiA9PSBudWxsID8gbmV3IEVycm9yKHMpIDogdlxufVxuXG4iLCJleHBvcnQgZnVuY3Rpb24gbG9hZFhIUiAodXJpOiBzdHJpbmcpOiBQcm9taXNlPHN0cmluZz4ge1xuICByZXR1cm4gbmV3IFByb21pc2UoKHJlcywgcmVqKSA9PiB7XG4gICAgY29uc3QgeGhyID0gbmV3IFhNTEh0dHBSZXF1ZXN0XG5cbiAgICB4aHIub25sb2FkID0gXyA9PiByZXMoeGhyLnJlc3BvbnNlKVxuICAgIHhoci5vbmVycm9yID0gXyA9PiByZWooYENvdWxkIG5vdCBsb2FkICR7IHVyaSB9YClcbiAgICB4aHIub3BlbignR0VUJywgdXJpKVxuICAgIHhoci5zZW5kKClcbiAgfSlcbn1cbiIsImV4cG9ydCB0eXBlIE1hdDQgPSBGbG9hdDMyQXJyYXlcbmV4cG9ydCB0eXBlIFZlYzMgPSBGbG9hdDMyQXJyYXlcbmV4cG9ydCB0eXBlIFF1YXQgPSBGbG9hdDMyQXJyYXlcblxuZXhwb3J0IGZ1bmN0aW9uIFEgKHg6IG51bWJlciwgeTogbnVtYmVyLCB6OiBudW1iZXIsIHc6IG51bWJlcik6IFF1YXQge1xuICBjb25zdCBvdXQgPSBuZXcgRmxvYXQzMkFycmF5KDQpXG5cbiAgb3V0WzBdID0geFxuICBvdXRbMV0gPSB5XG4gIG91dFsyXSA9IHpcbiAgb3V0WzNdID0gd1xuICByZXR1cm4gb3V0XG59XG5cbmV4cG9ydCBmdW5jdGlvbiBNNCAoKTogTWF0NCB7XG4gIGNvbnN0IG91dCA9IG5ldyBGbG9hdDMyQXJyYXkoMTYpXG5cbiAgcmV0dXJuIGlkZW50aXR5KG91dClcbn1cblxuZXhwb3J0IGZ1bmN0aW9uIFYzICh4OiBudW1iZXIsIHk6IG51bWJlciwgejogbnVtYmVyKTogVmVjMyB7XG4gIGNvbnN0IG91dCA9IG5ldyBGbG9hdDMyQXJyYXkoMylcblxuICBvdXRbMF0gPSB4XG4gIG91dFsxXSA9IHlcbiAgb3V0WzJdID0gelxuICByZXR1cm4gb3V0XG59XG5cbmV4cG9ydCBmdW5jdGlvbiBpZGVudGl0eSAob3V0OiBNYXQ0KTogTWF0NCB7XG4gIG91dFswXSA9IDFcbiAgb3V0WzFdID0gMFxuICBvdXRbMl0gPSAwXG4gIG91dFszXSA9IDBcbiAgb3V0WzRdID0gMFxuICBvdXRbNV0gPSAxXG4gIG91dFs2XSA9IDBcbiAgb3V0WzddID0gMFxuICBvdXRbOF0gPSAwXG4gIG91dFs5XSA9IDBcbiAgb3V0WzEwXSA9IDFcbiAgb3V0WzExXSA9IDBcbiAgb3V0WzEyXSA9IDBcbiAgb3V0WzEzXSA9IDBcbiAgb3V0WzE0XSA9IDBcbiAgb3V0WzE1XSA9IDFcbiAgcmV0dXJuIG91dFxufVxuXG5leHBvcnQgZnVuY3Rpb24gdHJhbnNsYXRlIChvdXQ6IE1hdDQsIHY6IFZlYzMpOiBNYXQ0IHtcbiAgY29uc3QgWyB4LCB5LCB6IF0gPSB2XG5cbiAgb3V0WzEyXSA9IG91dFswXSAqIHggKyBvdXRbNF0gKiB5ICsgb3V0WzhdICogeiArIG91dFsxMl1cbiAgb3V0WzEzXSA9IG91dFsxXSAqIHggKyBvdXRbNV0gKiB5ICsgb3V0WzldICogeiArIG91dFsxM11cbiAgb3V0WzE0XSA9IG91dFsyXSAqIHggKyBvdXRbNl0gKiB5ICsgb3V0WzEwXSAqIHogKyBvdXRbMTRdXG4gIG91dFsxNV0gPSBvdXRbM10gKiB4ICsgb3V0WzddICogeSArIG91dFsxMV0gKiB6ICsgb3V0WzE1XVxuICByZXR1cm4gb3V0XG59XG5cbmV4cG9ydCBmdW5jdGlvbiByb3RhdGVYIChvdXQ6IE1hdDQsIHJhZDogbnVtYmVyKTogTWF0NCB7XG4gICAgdmFyIHMgPSBNYXRoLnNpbihyYWQpLFxuICAgICAgICBjID0gTWF0aC5jb3MocmFkKSxcbiAgICAgICAgYTEwID0gb3V0WzRdLFxuICAgICAgICBhMTEgPSBvdXRbNV0sXG4gICAgICAgIGExMiA9IG91dFs2XSxcbiAgICAgICAgYTEzID0gb3V0WzddLFxuICAgICAgICBhMjAgPSBvdXRbOF0sXG4gICAgICAgIGEyMSA9IG91dFs5XSxcbiAgICAgICAgYTIyID0gb3V0WzEwXSxcbiAgICAgICAgYTIzID0gb3V0WzExXVxuXG4gICAgb3V0WzRdID0gYTEwICogYyArIGEyMCAqIHNcbiAgICBvdXRbNV0gPSBhMTEgKiBjICsgYTIxICogc1xuICAgIG91dFs2XSA9IGExMiAqIGMgKyBhMjIgKiBzXG4gICAgb3V0WzddID0gYTEzICogYyArIGEyMyAqIHNcbiAgICBvdXRbOF0gPSBhMjAgKiBjIC0gYTEwICogc1xuICAgIG91dFs5XSA9IGEyMSAqIGMgLSBhMTEgKiBzXG4gICAgb3V0WzEwXSA9IGEyMiAqIGMgLSBhMTIgKiBzXG4gICAgb3V0WzExXSA9IGEyMyAqIGMgLSBhMTMgKiBzXG4gICAgcmV0dXJuIG91dFxufVxuXG5leHBvcnQgZnVuY3Rpb24gcm90YXRlWSAob3V0OiBNYXQ0LCByYWQ6IG51bWJlcik6IE1hdDQge1xuICAgIHZhciBzID0gTWF0aC5zaW4ocmFkKSxcbiAgICAgICAgYyA9IE1hdGguY29zKHJhZCksXG4gICAgICAgIGEwMCA9IG91dFswXSxcbiAgICAgICAgYTAxID0gb3V0WzFdLFxuICAgICAgICBhMDIgPSBvdXRbMl0sXG4gICAgICAgIGEwMyA9IG91dFszXSxcbiAgICAgICAgYTIwID0gb3V0WzhdLFxuICAgICAgICBhMjEgPSBvdXRbOV0sXG4gICAgICAgIGEyMiA9IG91dFsxMF0sXG4gICAgICAgIGEyMyA9IG91dFsxMV07XG5cbiAgICBvdXRbMF0gPSBhMDAgKiBjIC0gYTIwICogc1xuICAgIG91dFsxXSA9IGEwMSAqIGMgLSBhMjEgKiBzXG4gICAgb3V0WzJdID0gYTAyICogYyAtIGEyMiAqIHNcbiAgICBvdXRbM10gPSBhMDMgKiBjIC0gYTIzICogc1xuICAgIG91dFs4XSA9IGEwMCAqIHMgKyBhMjAgKiBjXG4gICAgb3V0WzldID0gYTAxICogcyArIGEyMSAqIGNcbiAgICBvdXRbMTBdID0gYTAyICogcyArIGEyMiAqIGNcbiAgICBvdXRbMTFdID0gYTAzICogcyArIGEyMyAqIGNcbiAgICByZXR1cm4gb3V0XG59XG5cbmV4cG9ydCBmdW5jdGlvbiByb3RhdGVaKG91dDogTWF0NCwgcmFkOiBudW1iZXIpOiBNYXQ0IHtcbiAgICB2YXIgcyA9IE1hdGguc2luKHJhZCksXG4gICAgICAgIGMgPSBNYXRoLmNvcyhyYWQpLFxuICAgICAgICBhMDAgPSBvdXRbMF0sXG4gICAgICAgIGEwMSA9IG91dFsxXSxcbiAgICAgICAgYTAyID0gb3V0WzJdLFxuICAgICAgICBhMDMgPSBvdXRbM10sXG4gICAgICAgIGExMCA9IG91dFs0XSxcbiAgICAgICAgYTExID0gb3V0WzVdLFxuICAgICAgICBhMTIgPSBvdXRbNl0sXG4gICAgICAgIGExMyA9IG91dFs3XVxuXG4gICAgb3V0WzBdID0gYTAwICogYyArIGExMCAqIHNcbiAgICBvdXRbMV0gPSBhMDEgKiBjICsgYTExICogc1xuICAgIG91dFsyXSA9IGEwMiAqIGMgKyBhMTIgKiBzXG4gICAgb3V0WzNdID0gYTAzICogYyArIGExMyAqIHNcbiAgICBvdXRbNF0gPSBhMTAgKiBjIC0gYTAwICogc1xuICAgIG91dFs1XSA9IGExMSAqIGMgLSBhMDEgKiBzXG4gICAgb3V0WzZdID0gYTEyICogYyAtIGEwMiAqIHNcbiAgICBvdXRbN10gPSBhMTMgKiBjIC0gYTAzICogc1xuICAgIHJldHVybiBvdXRcbn1cblxuZXhwb3J0IGZ1bmN0aW9uIHNjYWxlIChvdXQ6IE1hdDQsIHY6IFZlYzMpIHtcbiAgICB2YXIgeCA9IHZbMF0sIHkgPSB2WzFdLCB6ID0gdlsyXVxuXG4gICAgb3V0WzBdID0gb3V0WzBdICogeFxuICAgIG91dFsxXSA9IG91dFsxXSAqIHhcbiAgICBvdXRbMl0gPSBvdXRbMl0gKiB4XG4gICAgb3V0WzNdID0gb3V0WzNdICogeFxuICAgIG91dFs0XSA9IG91dFs0XSAqIHlcbiAgICBvdXRbNV0gPSBvdXRbNV0gKiB5XG4gICAgb3V0WzZdID0gb3V0WzZdICogeVxuICAgIG91dFs3XSA9IG91dFs3XSAqIHlcbiAgICBvdXRbOF0gPSBvdXRbOF0gKiB6XG4gICAgb3V0WzldID0gb3V0WzldICogelxuICAgIG91dFsxMF0gPSBvdXRbMTBdICogelxuICAgIG91dFsxMV0gPSBvdXRbMTFdICogelxuICAgIG91dFsxMl0gPSBvdXRbMTJdXG4gICAgb3V0WzEzXSA9IG91dFsxM11cbiAgICBvdXRbMTRdID0gb3V0WzE0XVxuICAgIG91dFsxNV0gPSBvdXRbMTVdXG4gICAgcmV0dXJuIG91dFxufVxuXG5leHBvcnQgZnVuY3Rpb24gZnJvbVJvdGF0aW9uVHJhbnNsYXRpb24gKG91dDogTWF0NCwgcTogUXVhdCwgdjogVmVjMykge1xuICB2YXIgeCA9IHFbMF0sIHkgPSBxWzFdLCB6ID0gcVsyXSwgdyA9IHFbM10sXG4gICAgICB4MiA9IHggKyB4LFxuICAgICAgeTIgPSB5ICsgeSxcbiAgICAgIHoyID0geiArIHosXG5cbiAgICAgIHh4ID0geCAqIHgyLFxuICAgICAgeHkgPSB4ICogeTIsXG4gICAgICB4eiA9IHggKiB6MixcbiAgICAgIHl5ID0geSAqIHkyLFxuICAgICAgeXogPSB5ICogejIsXG4gICAgICB6eiA9IHogKiB6MixcbiAgICAgIHd4ID0gdyAqIHgyLFxuICAgICAgd3kgPSB3ICogeTIsXG4gICAgICB3eiA9IHcgKiB6MlxuXG4gIG91dFswXSA9IDEgLSAoeXkgKyB6eilcbiAgb3V0WzFdID0geHkgKyB3elxuICBvdXRbMl0gPSB4eiAtIHd5XG4gIG91dFszXSA9IDBcbiAgb3V0WzRdID0geHkgLSB3elxuICBvdXRbNV0gPSAxIC0gKHh4ICsgenopXG4gIG91dFs2XSA9IHl6ICsgd3hcbiAgb3V0WzddID0gMFxuICBvdXRbOF0gPSB4eiArIHd5XG4gIG91dFs5XSA9IHl6IC0gd3hcbiAgb3V0WzEwXSA9IDEgLSAoeHggKyB5eSlcbiAgb3V0WzExXSA9IDBcbiAgb3V0WzEyXSA9IHZbMF1cbiAgb3V0WzEzXSA9IHZbMV1cbiAgb3V0WzE0XSA9IHZbMl1cbiAgb3V0WzE1XSA9IDFcbiAgXG4gIHJldHVybiBvdXRcbn1cblxuZXhwb3J0IGZ1bmN0aW9uIGxvb2tBdCAob3V0OiBNYXQ0LCBleWU6IFZlYzMsIGNlbnRlcjogVmVjMywgdXA6IFZlYzMpIHtcbiAgdmFyIHgwOiBudW1iZXIsIFxuICAgICAgeDE6IG51bWJlciwgXG4gICAgICB4MjogbnVtYmVyLCBcbiAgICAgIHkwOiBudW1iZXIsIFxuICAgICAgeTE6IG51bWJlciwgXG4gICAgICB5MjogbnVtYmVyLCBcbiAgICAgIHowOiBudW1iZXIsIFxuICAgICAgejE6IG51bWJlciwgXG4gICAgICB6MjogbnVtYmVyLCBcbiAgICAgIGxlbjogbnVtYmVyO1xuICB2YXIgZXlleCA9IGV5ZVswXSxcbiAgICAgIGV5ZXkgPSBleWVbMV0sXG4gICAgICBleWV6ID0gZXllWzJdLFxuICAgICAgdXB4ID0gdXBbMF0sXG4gICAgICB1cHkgPSB1cFsxXSxcbiAgICAgIHVweiA9IHVwWzJdLFxuICAgICAgY2VudGVyeCA9IGNlbnRlclswXSxcbiAgICAgIGNlbnRlcnkgPSBjZW50ZXJbMV0sXG4gICAgICBjZW50ZXJ6ID0gY2VudGVyWzJdO1xuXG4gIGlmIChNYXRoLmFicyhleWV4IC0gY2VudGVyeCkgPCAwLjAwMDAwMSAmJlxuICAgIE1hdGguYWJzKGV5ZXkgLSBjZW50ZXJ5KSA8IDAuMDAwMDAxICYmXG4gICAgTWF0aC5hYnMoZXlleiAtIGNlbnRlcnopIDwgMC4wMDAwMDEpIHtcbiAgICByZXR1cm4gaWRlbnRpdHkob3V0KTtcbiAgfVxuXG4gIHowID0gZXlleCAtIGNlbnRlcng7XG4gIHoxID0gZXlleSAtIGNlbnRlcnk7XG4gIHoyID0gZXlleiAtIGNlbnRlcno7XG5cbiAgbGVuID0gMSAvIE1hdGguc3FydCh6MCAqIHowICsgejEgKiB6MSArIHoyICogejIpO1xuICB6MCAqPSBsZW47XG4gIHoxICo9IGxlbjtcbiAgejIgKj0gbGVuO1xuXG4gIHgwID0gdXB5ICogejIgLSB1cHogKiB6MTtcbiAgeDEgPSB1cHogKiB6MCAtIHVweCAqIHoyO1xuICB4MiA9IHVweCAqIHoxIC0gdXB5ICogejA7XG4gIGxlbiA9IE1hdGguc3FydCh4MCAqIHgwICsgeDEgKiB4MSArIHgyICogeDIpO1xuICBpZiAoIWxlbikge1xuICAgICAgeDAgPSAwO1xuICAgICAgeDEgPSAwO1xuICAgICAgeDIgPSAwO1xuICB9IGVsc2Uge1xuICAgICAgbGVuID0gMSAvIGxlbjtcbiAgICAgIHgwICo9IGxlbjtcbiAgICAgIHgxICo9IGxlbjtcbiAgICAgIHgyICo9IGxlbjtcbiAgfVxuXG4gIHkwID0gejEgKiB4MiAtIHoyICogeDE7XG4gIHkxID0gejIgKiB4MCAtIHowICogeDI7XG4gIHkyID0gejAgKiB4MSAtIHoxICogeDA7XG5cbiAgbGVuID0gTWF0aC5zcXJ0KHkwICogeTAgKyB5MSAqIHkxICsgeTIgKiB5Mik7XG4gIGlmICghbGVuKSB7XG4gICAgICB5MCA9IDA7XG4gICAgICB5MSA9IDA7XG4gICAgICB5MiA9IDA7XG4gIH0gZWxzZSB7XG4gICAgICBsZW4gPSAxIC8gbGVuO1xuICAgICAgeTAgKj0gbGVuO1xuICAgICAgeTEgKj0gbGVuO1xuICAgICAgeTIgKj0gbGVuO1xuICB9XG5cbiAgb3V0WzBdID0geDA7XG4gIG91dFsxXSA9IHkwO1xuICBvdXRbMl0gPSB6MDtcbiAgb3V0WzNdID0gMDtcbiAgb3V0WzRdID0geDE7XG4gIG91dFs1XSA9IHkxO1xuICBvdXRbNl0gPSB6MTtcbiAgb3V0WzddID0gMDtcbiAgb3V0WzhdID0geDI7XG4gIG91dFs5XSA9IHkyO1xuICBvdXRbMTBdID0gejI7XG4gIG91dFsxMV0gPSAwO1xuICBvdXRbMTJdID0gLSh4MCAqIGV5ZXggKyB4MSAqIGV5ZXkgKyB4MiAqIGV5ZXopO1xuICBvdXRbMTNdID0gLSh5MCAqIGV5ZXggKyB5MSAqIGV5ZXkgKyB5MiAqIGV5ZXopO1xuICBvdXRbMTRdID0gLSh6MCAqIGV5ZXggKyB6MSAqIGV5ZXkgKyB6MiAqIGV5ZXopO1xuICBvdXRbMTVdID0gMTtcblxuICByZXR1cm4gb3V0O1xufTtcblxuZXhwb3J0IGZ1bmN0aW9uIHBlcnNwZWN0aXZlIChvdXQ6IE1hdDQsIGZvdnk6IG51bWJlciwgYXNwZWN0OiBudW1iZXIsIG5lYXI6IG51bWJlciwgZmFyOiBudW1iZXIpOiBNYXQ0IHtcbiAgICB2YXIgZiA9IDEuMCAvIE1hdGgudGFuKGZvdnkgLyAyKSxcbiAgICAgICAgbmYgPSAxIC8gKG5lYXIgLSBmYXIpO1xuICAgIG91dFswXSA9IGYgLyBhc3BlY3Q7XG4gICAgb3V0WzFdID0gMDtcbiAgICBvdXRbMl0gPSAwO1xuICAgIG91dFszXSA9IDA7XG4gICAgb3V0WzRdID0gMDtcbiAgICBvdXRbNV0gPSBmO1xuICAgIG91dFs2XSA9IDA7XG4gICAgb3V0WzddID0gMDtcbiAgICBvdXRbOF0gPSAwO1xuICAgIG91dFs5XSA9IDA7XG4gICAgb3V0WzEwXSA9IChmYXIgKyBuZWFyKSAqIG5mO1xuICAgIG91dFsxMV0gPSAtMTtcbiAgICBvdXRbMTJdID0gMDtcbiAgICBvdXRbMTNdID0gMDtcbiAgICBvdXRbMTRdID0gKDIgKiBmYXIgKiBuZWFyKSAqIG5mO1xuICAgIG91dFsxNV0gPSAwO1xuICAgIHJldHVybiBvdXQ7XG59O1xuXG4vLyBleHBvcnQgZnVuY3Rpb24gbXVsdGlwbHkob3V0OiBNYXQ0LCBhOiBNYXQ0LCBiOiBNYXQ0KTogTWF0NCB7XG4vLyAgICAgdmFyIGEwMCA9IGFbMF0sIGEwMSA9IGFbMV0sIGEwMiA9IGFbMl0sIGEwMyA9IGFbM10sXG4vLyAgICAgICAgIGExMCA9IGFbNF0sIGExMSA9IGFbNV0sIGExMiA9IGFbNl0sIGExMyA9IGFbN10sXG4vLyAgICAgICAgIGEyMCA9IGFbOF0sIGEyMSA9IGFbOV0sIGEyMiA9IGFbMTBdLCBhMjMgPSBhWzExXSxcbi8vICAgICAgICAgYTMwID0gYVsxMl0sIGEzMSA9IGFbMTNdLCBhMzIgPSBhWzE0XSwgYTMzID0gYVsxNV07XG4vLyBcbi8vICAgICAvLyBDYWNoZSBvbmx5IHRoZSBjdXJyZW50IGxpbmUgb2YgdGhlIHNlY29uZCBtYXRyaXhcbi8vICAgICB2YXIgYjAgID0gYlswXSwgYjEgPSBiWzFdLCBiMiA9IGJbMl0sIGIzID0gYlszXTsgIFxuLy8gICAgIG91dFswXSA9IGIwKmEwMCArIGIxKmExMCArIGIyKmEyMCArIGIzKmEzMDtcbi8vICAgICBvdXRbMV0gPSBiMCphMDEgKyBiMSphMTEgKyBiMiphMjEgKyBiMyphMzE7XG4vLyAgICAgb3V0WzJdID0gYjAqYTAyICsgYjEqYTEyICsgYjIqYTIyICsgYjMqYTMyO1xuLy8gICAgIG91dFszXSA9IGIwKmEwMyArIGIxKmExMyArIGIyKmEyMyArIGIzKmEzMztcbi8vIFxuLy8gICAgIGIwID0gYls0XTsgYjEgPSBiWzVdOyBiMiA9IGJbNl07IGIzID0gYls3XTtcbi8vICAgICBvdXRbNF0gPSBiMCphMDAgKyBiMSphMTAgKyBiMiphMjAgKyBiMyphMzA7XG4vLyAgICAgb3V0WzVdID0gYjAqYTAxICsgYjEqYTExICsgYjIqYTIxICsgYjMqYTMxO1xuLy8gICAgIG91dFs2XSA9IGIwKmEwMiArIGIxKmExMiArIGIyKmEyMiArIGIzKmEzMjtcbi8vICAgICBvdXRbN10gPSBiMCphMDMgKyBiMSphMTMgKyBiMiphMjMgKyBiMyphMzM7XG4vLyBcbi8vICAgICBiMCA9IGJbOF07IGIxID0gYls5XTsgYjIgPSBiWzEwXTsgYjMgPSBiWzExXTtcbi8vICAgICBvdXRbOF0gPSBiMCphMDAgKyBiMSphMTAgKyBiMiphMjAgKyBiMyphMzA7XG4vLyAgICAgb3V0WzldID0gYjAqYTAxICsgYjEqYTExICsgYjIqYTIxICsgYjMqYTMxO1xuLy8gICAgIG91dFsxMF0gPSBiMCphMDIgKyBiMSphMTIgKyBiMiphMjIgKyBiMyphMzI7XG4vLyAgICAgb3V0WzExXSA9IGIwKmEwMyArIGIxKmExMyArIGIyKmEyMyArIGIzKmEzMztcbi8vIFxuLy8gICAgIGIwID0gYlsxMl07IGIxID0gYlsxM107IGIyID0gYlsxNF07IGIzID0gYlsxNV07XG4vLyAgICAgb3V0WzEyXSA9IGIwKmEwMCArIGIxKmExMCArIGIyKmEyMCArIGIzKmEzMDtcbi8vICAgICBvdXRbMTNdID0gYjAqYTAxICsgYjEqYTExICsgYjIqYTIxICsgYjMqYTMxO1xuLy8gICAgIG91dFsxNF0gPSBiMCphMDIgKyBiMSphMTIgKyBiMiphMjIgKyBiMyphMzI7XG4vLyAgICAgb3V0WzE1XSA9IGIwKmEwMyArIGIxKmExMyArIGIyKmEyMyArIGIzKmEzMztcbi8vICAgICByZXR1cm4gb3V0O1xuLy8gfTtcbiIsImltcG9ydCB7IFxuICBQYXJzZXIsIGZtYXAsIGxpZnQsIGxpZnQzLCBsaWZ0NCwgZG9UaGVuIFxufSBmcm9tICcuL1BhcnNlcidcbmltcG9ydCB7IFxuICBzbGFzaCwgc3BhY2VzLCByZWFsLCBpbnRlZ2VyLCBuZXdsaW5lLFxuICBvckRlZmF1bHQsIG9wdGlvbmFsLCBhbnlPZiwgaW5SYW5nZSwgc2F0aXNmeSxcbiAgZXhhY3RseSwgbWF0Y2gsIG1hbnkxLCBtYW55LCBhdGxlYXN0TixcbiAgaW50ZXJzcGVyc2luZ1xufSBmcm9tICcuL3BhcnNlcnMnXG5pbXBvcnQgeyBJR2VvbWV0cnkgfSBmcm9tICcuLi9SZW5kZXJpbmcvR2VvbWV0cnknXG5cbmV4cG9ydCB0eXBlIFYzID0gWyBudW1iZXIsIG51bWJlciwgbnVtYmVyIF1cbmV4cG9ydCB0eXBlIFY0ID0gWyBudW1iZXIsIG51bWJlciwgbnVtYmVyLCBudW1iZXIgXVxuZXhwb3J0IGludGVyZmFjZSBJRmFjZVZlcnRleCB7IHY6IG51bWJlciwgdnQ/OiBudW1iZXIsIHZuPzogbnVtYmVyIH1cblxuZXhwb3J0IGludGVyZmFjZSBJVmVydGV4ICAgeyBraW5kOiAnVmVydGV4JywgICB2YWx1ZTogVjQgfVxuZXhwb3J0IGludGVyZmFjZSBJVGV4Q29vcmQgeyBraW5kOiAnVGV4Q29vcmQnLCB2YWx1ZTogVjMgfVxuZXhwb3J0IGludGVyZmFjZSBJTm9ybWFsICAgeyBraW5kOiAnTm9ybWFsJywgICB2YWx1ZTogVjMgfVxuZXhwb3J0IGludGVyZmFjZSBJRmFjZSAgICAgeyBraW5kOiAnRmFjZScsICAgICB2YWx1ZTogSUZhY2VWZXJ0ZXhbXSB9XG5leHBvcnQgaW50ZXJmYWNlIElJZ25vcmVkICB7IGtpbmQ6ICdJZ25vcmVkJywgIHZhbHVlOiBzdHJpbmcgfVxuXG5leHBvcnQgY29uc3QgVmVydCA9ICh4OiBudW1iZXIsIHk6IG51bWJlciwgejogbnVtYmVyLCB3OiBudW1iZXIpOiBJVmVydGV4ID0+ICh7IFxuICBraW5kOiAnVmVydGV4JywgXG4gIHZhbHVlOiBbIHgsIHksIHosIHcgXVxufSlcblxuZXhwb3J0IGNvbnN0IFRleENvb3JkID0gKHg6IG51bWJlciwgeTogbnVtYmVyLCB6OiBudW1iZXIpOiBJVGV4Q29vcmQgPT4gKHsgXG4gIGtpbmQ6ICdUZXhDb29yZCcsIFxuICB2YWx1ZTogWyB4LCB5LCB6IF1cbn0pXG5cbmV4cG9ydCBjb25zdCBGYWNlID0gKGluZGljZXM6IElGYWNlVmVydGV4W10pOiBJRmFjZSA9PiAoeyBcbiAga2luZDogJ0ZhY2UnLCBcbiAgdmFsdWU6IGluZGljZXNcbn0pXG5cbmV4cG9ydCBjb25zdCBOb3JtYWwgPSAoeDogbnVtYmVyLCB5OiBudW1iZXIsIHo6IG51bWJlcik6IElOb3JtYWwgPT4gKHsgXG4gIGtpbmQ6ICdOb3JtYWwnLCBcbiAgdmFsdWU6IFsgeCwgeSwgeiBdIFxufSlcblxuZXhwb3J0IGNvbnN0IElnbm9yZWQgPSAoczogc3RyaW5nKTogSUlnbm9yZWQgPT4gKHsgXG4gIGtpbmQ6ICdJZ25vcmVkJyxcbiAgdmFsdWU6IHNcbn0pXG5cbmV4cG9ydCB0eXBlIExpbmVcbiAgPSBJVmVydGV4IFxuICB8IElUZXhDb29yZCBcbiAgfCBJTm9ybWFsXG4gIHwgSUZhY2VcbiAgfCBJSWdub3JlZFxuXG5jb25zdCBzcGFjZWQgPSA8QT4gKHA6IFBhcnNlcjxBPik6IFBhcnNlcjxBPiA9PiBkb1RoZW4oc3BhY2VzLCBwKVxuY29uc3QgdHhDb29yZCA9IGluUmFuZ2UoMCwgMSwgcmVhbClcbmNvbnN0IGFueUNoYXIgPSBzYXRpc2Z5KF8gPT4gdHJ1ZSlcblxuY29uc3QgZmFjZVZlcnRleCA9XG4gIGxpZnQzKCh2LCB2dCwgdm4pID0+ICh7IHYsIHZ0LCB2biB9KSxcbiAgICAgICAgc3BhY2VkKGludGVnZXIpLFxuICAgICAgICBvcHRpb25hbChkb1RoZW4oc2xhc2gsIG9wdGlvbmFsKGludGVnZXIpKSksXG4gICAgICAgIG9wdGlvbmFsKGRvVGhlbihzbGFzaCwgaW50ZWdlcikpKVxuXG5leHBvcnQgY29uc3QgdmVydGV4OiBQYXJzZXI8TGluZT4gPVxuICBsaWZ0NChWZXJ0LCBcbiAgICAgICAgZG9UaGVuKGV4YWN0bHkoJ3YnKSwgc3BhY2VkKHJlYWwpKSwgXG4gICAgICAgIHNwYWNlZChyZWFsKSwgXG4gICAgICAgIHNwYWNlZChyZWFsKSwgXG4gICAgICAgIHNwYWNlZChvckRlZmF1bHQocmVhbCwgMS4wKSkpXG5cbmV4cG9ydCBjb25zdCB0ZXhDb29yZDogUGFyc2VyPExpbmU+ID1cbiAgbGlmdDMoVGV4Q29vcmQsXG4gICAgICAgIGRvVGhlbihtYXRjaCgndnQnKSwgc3BhY2VkKHR4Q29vcmQpKSxcbiAgICAgICAgc3BhY2VkKHR4Q29vcmQpLFxuICAgICAgICBzcGFjZWQob3JEZWZhdWx0KHR4Q29vcmQsIDAuMCkpKVxuXG5leHBvcnQgY29uc3Qgbm9ybWFsOiBQYXJzZXI8TGluZT4gPVxuICBsaWZ0MyhOb3JtYWwsXG4gICAgICAgIGRvVGhlbihtYXRjaCgndm4nKSwgc3BhY2VkKHJlYWwpKSxcbiAgICAgICAgc3BhY2VkKHJlYWwpLFxuICAgICAgICBzcGFjZWQocmVhbCkpXG5cbmV4cG9ydCBjb25zdCBmYWNlOiBQYXJzZXI8TGluZT4gPSBcbiAgbGlmdChGYWNlLCBkb1RoZW4obWF0Y2goJ2YnKSwgYXRsZWFzdE4oMywgc3BhY2VkKGZhY2VWZXJ0ZXgpKSkpXG5cbmV4cG9ydCBjb25zdCBpZ25vcmVkOiBQYXJzZXI8TGluZT4gPVxuICBsaWZ0KElnbm9yZWQsIGZtYXAoY3MgPT4gY3Muam9pbignJyksIG1hbnkxKGFueUNoYXIpKSlcblxuZXhwb3J0IGNvbnN0IGxpbmU6IFBhcnNlcjxMaW5lPiA9IFxuICBhbnlPZihbIHZlcnRleCwgdGV4Q29vcmQsIG5vcm1hbCwgZmFjZSwgaWdub3JlZCBdKVxuXG5mdW5jdGlvbiBsaW5lc1RvR2VvbWV0cnkgKGxpbmVzOiBMaW5lW10pOiBJR2VvbWV0cnkge1xuICBjb25zdCBwVmVydGljZXM6IFY0W10gPSBbXVxuICBjb25zdCBwTm9ybWFsczogVjNbXSA9IFtdXG4gIGNvbnN0IHBUZXhDb29yZHM6IFYzW10gPSBbXVxuICBjb25zdCBwRmFjZXM6IElGYWNlVmVydGV4W10gPSBbXVxuXG4gIGZvciAoIHZhciBpID0gMDsgaSA8IGxpbmVzLmxlbmd0aDsgaSsrKSB7XG4gICAgdmFyIGwgPSBsaW5lc1tpXVxuXG4gICAgaWYgICAgICAoIGwua2luZCA9PT0gJ1ZlcnRleCcgKSAgIHBWZXJ0aWNlcy5wdXNoKGwudmFsdWUpXG4gICAgZWxzZSBpZiAoIGwua2luZCA9PT0gJ05vcm1hbCcgKSAgIHBOb3JtYWxzLnB1c2gobC52YWx1ZSlcbiAgICBlbHNlIGlmICggbC5raW5kID09PSAnVGV4Q29vcmQnICkgcFRleENvb3Jkcy5wdXNoKGwudmFsdWUpXG4gICAgZWxzZSBpZiAoIGwua2luZCA9PT0gJ0ZhY2UnICkgICAgIHBGYWNlcy5wdXNoKC4uLmwudmFsdWUpXG4gICAgZWxzZSB7fVxuICB9XG4gIGNvbnN0IHZlcnRpY2VzID0gbmV3IEFycmF5KHBGYWNlcy5sZW5ndGggKiAzKVxuICBjb25zdCBub3JtYWxzID0gbmV3IEFycmF5KHBGYWNlcy5sZW5ndGggKiAzKVxuICBjb25zdCB0ZXhDb29yZHMgPSBuZXcgQXJyYXkocEZhY2VzLmxlbmd0aCAqIDIpXG4gIGNvbnN0IGRlZmF1bHROb3JtYWwgPSBbIDAsIDAsIDEgXVxuICBjb25zdCBkZWZhdWx0VGV4Q29vcmQgPSBbIDAsIDAgXVxuXG4gIGZvciAoIHZhciBpID0gMDsgaSA8IHBGYWNlcy5sZW5ndGg7IGkrKykge1xuICAgIHZhciB7IHYsIHZ0LCB2biB9ID0gcEZhY2VzW2ldIFxuICAgIHZhciB2ZXJ0ID0gcFZlcnRpY2VzW3YgLSAxXVxuICAgIHZhciBub3JtYWwgPSB2biAhPSBudWxsID8gcE5vcm1hbHNbdm4gLSAxXSA6IGRlZmF1bHROb3JtYWxcbiAgICB2YXIgdGV4Q29vcmQgPSB2dCAhPSBudWxsID8gcFRleENvb3Jkc1t2dCAtIDFdIDogZGVmYXVsdFRleENvb3JkIFxuXG4gICAgdmVydGljZXNbaSAqIDNdICAgICAgPSB2ZXJ0WzBdXG4gICAgdmVydGljZXNbaSAqIDMgKyAxXSAgPSB2ZXJ0WzFdXG4gICAgdmVydGljZXNbaSAqIDMgKyAyXSAgPSB2ZXJ0WzJdXG4gICAgbm9ybWFsc1tpICogM10gICAgICAgPSBub3JtYWxbMF1cbiAgICBub3JtYWxzW2kgKiAzICsgMV0gICA9IG5vcm1hbFsxXVxuICAgIG5vcm1hbHNbaSAqIDMgKyAyXSAgID0gbm9ybWFsWzJdXG4gICAgdGV4Q29vcmRzW2kgKiAyXSAgICAgPSB0ZXhDb29yZFswXVxuICAgIHRleENvb3Jkc1tpICogMiArIDFdID0gdGV4Q29vcmRbMV1cbiAgfVxuICByZXR1cm4geyB2ZXJ0aWNlcywgbm9ybWFscywgdGV4Q29vcmRzIH1cbn1cblxuZXhwb3J0IGNvbnN0IHBhcnNlT0JKID0gXG4gIGZtYXAobGluZXNUb0dlb21ldHJ5LCBpbnRlcnNwZXJzaW5nKGxpbmUsIG1hbnkobmV3bGluZSkpKVxuIiwiZXhwb3J0IGludGVyZmFjZSBJUmVzdWx0PEE+IHtcbiAgc3VjY2VzczogdHJ1ZVxuICB2YWw6IEFcbiAgcmVzdDogc3RyaW5nXG59XG5cbmV4cG9ydCBpbnRlcmZhY2UgSUVyciB7XG4gIHN1Y2Nlc3M6IGZhbHNlXG4gIG1lc3NhZ2U6IHN0cmluZ1xufVxuXG5leHBvcnQgY2xhc3MgUmVzdWx0PEE+IGltcGxlbWVudHMgSVJlc3VsdDxBPiB7XG4gIHN1Y2Nlc3M6IHRydWUgPSB0cnVlXG4gIGNvbnN0cnVjdG9yKHB1YmxpYyB2YWw6IEEsIHB1YmxpYyByZXN0OiBzdHJpbmcpIHt9IFxufVxuXG5leHBvcnQgY2xhc3MgRXJyIGltcGxlbWVudHMgSUVyciB7XG4gIHN1Y2Nlc3M6IGZhbHNlID0gZmFsc2VcbiAgY29uc3RydWN0b3IocHVibGljIG1lc3NhZ2U6IHN0cmluZykge31cbn1cblxuZXhwb3J0IHR5cGUgT3V0Y29tZTxBPiA9IElSZXN1bHQ8QT4gfCBFcnJcblxuZXhwb3J0IHR5cGUgUGFyc2VyPEE+ID0gKHM6IHN0cmluZykgPT4gT3V0Y29tZTxBPlxuXG5leHBvcnQgZnVuY3Rpb24gdW5pdDxBPiAoYTogQSk6IFBhcnNlcjxBPiB7XG4gIHJldHVybiAoczogc3RyaW5nKSA9PiBuZXcgUmVzdWx0KGEsIHMpXG59XG5cbmV4cG9ydCBmdW5jdGlvbiBmYWlsZWQgKG1zZzogc3RyaW5nKTogUGFyc2VyPHN0cmluZz4ge1xuICByZXR1cm4gKF86IHN0cmluZykgPT4gbmV3IEVycihtc2cpXG59XG5cbmV4cG9ydCBmdW5jdGlvbiBmbWFwPEEsIEI+IChmOiAoYTogQSkgPT4gQiwgcGE6IFBhcnNlcjxBPik6IFBhcnNlcjxCPiB7XG4gIHJldHVybiBmbGF0TWFwKHBhLCBhID0+IHVuaXQoZihhKSkpXG59XG5cbmV4cG9ydCBmdW5jdGlvbiBhcHBseTxBLCBCPiAocGY6IFBhcnNlcjwoYTogQSkgPT4gQj4sIHBhOiBQYXJzZXI8QT4pOiBQYXJzZXI8Qj4ge1xuICByZXR1cm4gZmxhdE1hcChwZiwgZiA9PiBmbWFwKGYsIHBhKSlcbn1cblxuZXhwb3J0IGZ1bmN0aW9uIGxpZnQ8QSwgQj4gKGY6IChhOiBBKSA9PiBCLCBwYTogUGFyc2VyPEE+KTogUGFyc2VyPEI+IHtcbiAgcmV0dXJuIGFwcGx5KHVuaXQoZiksIHBhKVxufVxuXG5leHBvcnQgZnVuY3Rpb24gbGlmdDI8QSwgQiwgQz4gKGY6IChhOiBBLCBiOiBCKSA9PiBDLCBwYTogUGFyc2VyPEE+LCBwYjogUGFyc2VyPEI+KTogUGFyc2VyPEM+IHtcbiAgcmV0dXJuIGFwcGx5KGZtYXAoKGE6IEEpID0+IChiOiBCKSA9PiBmKGEsIGIpLCBwYSksIHBiKVxufVxuXG5leHBvcnQgZnVuY3Rpb24gbGlmdDM8QSwgQiwgQywgRD4gXG4oZjogKGE6IEEsIGI6IEIsIGM6IEMpID0+IEQsIHBhOiBQYXJzZXI8QT4sIHBiOiBQYXJzZXI8Qj4sIHBjOiBQYXJzZXI8Qz4pOiBQYXJzZXI8RD4ge1xuICBjb25zdCBjaGFpbiA9IChhOiBBKSA9PiAoYjogQikgPT4gKGM6IEMpID0+IGYoYSwgYiwgYylcblxuICByZXR1cm4gYXBwbHkoYXBwbHkoZm1hcChjaGFpbiwgcGEpLCBwYiksIHBjKVxufVxuXG5leHBvcnQgZnVuY3Rpb24gbGlmdDQ8QSwgQiwgQywgRCwgRT4gKGY6IChhOiBBLCBiOiBCLCBjOiBDLCBkOiBEKSA9PiBFLCBwYTogUGFyc2VyPEE+LCBwYjogUGFyc2VyPEI+LCBwYzogUGFyc2VyPEM+LCBwZDogUGFyc2VyPEQ+KTogUGFyc2VyPEU+IHtcbiAgY29uc3QgY2hhaW4gPSAoYTogQSkgPT4gKGI6IEIpID0+IChjOiBDKSA9PiAoZDogRCkgPT4gZihhLCBiLCBjLCBkKVxuXG4gIHJldHVybiBhcHBseShhcHBseShhcHBseShmbWFwKGNoYWluLCBwYSksIHBiKSwgcGMpLCBwZClcbn1cblxuZXhwb3J0IGZ1bmN0aW9uIGZsYXRNYXA8QSwgQj4gKHBhOiBQYXJzZXI8QT4sIGY6IChhOiBBKSA9PiBQYXJzZXI8Qj4pOiBQYXJzZXI8Qj4ge1xuICByZXR1cm4gZnVuY3Rpb24gKHM6IHN0cmluZyk6IE91dGNvbWU8Qj4ge1xuICAgIGNvbnN0IG91dCA9IHBhKHMpXG5cbiAgICByZXR1cm4gb3V0LnN1Y2Nlc3NcbiAgICAgID8gZihvdXQudmFsKShvdXQucmVzdClcbiAgICAgIDogbmV3IEVycihvdXQubWVzc2FnZSlcbiAgfVxufVxuXG5leHBvcnQgZnVuY3Rpb24gZG9UaGVuPEEsIEI+IChwMTogUGFyc2VyPEE+LCBwMjogUGFyc2VyPEI+KTogUGFyc2VyPEI+IHtcbiAgcmV0dXJuIGZsYXRNYXAocDEsIF8gPT4gcDIpXG59XG4iLCJpbXBvcnQgeyBpc0FscGhhLCBpc051bWJlciB9IGZyb20gJy4vcHJlZGljYXRlcydcbmltcG9ydCB7IE91dGNvbWUsIFJlc3VsdCwgRXJyLCBQYXJzZXIsIGZsYXRNYXAsIGRvVGhlbiwgZm1hcCwgdW5pdCwgZmFpbGVkIH0gZnJvbSAnLi9QYXJzZXInXG5cbmV4cG9ydCBmdW5jdGlvbiBzYXRpc2Z5IChmOiAoczogc3RyaW5nKSA9PiBib29sZWFuKTogUGFyc2VyPHN0cmluZz4ge1xuICByZXR1cm4gZnVuY3Rpb24gKHN0cjogc3RyaW5nKTogT3V0Y29tZTxzdHJpbmc+IHsgXG4gICAgaWYgICAgICAoIHN0ci5sZW5ndGggPT09IDAgKSAgIHJldHVybiBuZXcgRXJyKCdOb3RoaW5nIHRvIGNvbnN1bWUnKVxuICAgIGVsc2UgaWYgKCBmKHN0ci5zbGljZSgwLCAxKSkgKSByZXR1cm4gbmV3IFJlc3VsdChzdHIuc2xpY2UoMCwgMSksIHN0ci5zbGljZSgxKSlcbiAgICBlbHNlICAgICAgICAgICAgICAgICAgICAgICAgICAgcmV0dXJuIG5ldyBFcnIoYCR7IHN0clswXSB9IGRpZCBub3Qgc2F0aXNmeWApXG4gIH1cbn1cblxuZXhwb3J0IGZ1bmN0aW9uIGV4YWN0bHkgKGNoYXJhY3Rlcjogc3RyaW5nKTogUGFyc2VyPHN0cmluZz4ge1xuICByZXR1cm4gc2F0aXNmeShuID0+IG4gPT09IGNoYXJhY3Rlcilcbn1cblxuZXhwb3J0IGZ1bmN0aW9uIG1hdGNoICh0YXJnZXQ6IHN0cmluZyk6IFBhcnNlcjxzdHJpbmc+IHtcbiAgcmV0dXJuIGZ1bmN0aW9uIChzOiBzdHJpbmcpOiBPdXRjb21lPHN0cmluZz4ge1xuICAgIGZvciAoIHZhciBpID0gMDsgaSA8IHRhcmdldC5sZW5ndGg7IGkrKyApIHtcbiAgICAgIGlmICggc1tpXSAhPT0gdGFyZ2V0W2ldICkgcmV0dXJuIG5ldyBFcnIoYCR7IHNbaV0gfSBkaWQgbm90IG1hdGNoICR7IHRhcmdldFtpXSB9YClcbiAgICB9XG4gICAgcmV0dXJuIG5ldyBSZXN1bHQocy5zbGljZSgwLCB0YXJnZXQubGVuZ3RoKSwgcy5zbGljZSh0YXJnZXQubGVuZ3RoKSkgXG4gIH1cbn1cblxuZXhwb3J0IGZ1bmN0aW9uIHNpemUgKHM6IHN0cmluZyk6IE91dGNvbWU8bnVtYmVyPiB7XG4gIHJldHVybiBuZXcgUmVzdWx0KHMubGVuZ3RoLCBzKVxufVxuXG5leHBvcnQgZnVuY3Rpb24gZW9mIChzOiBzdHJpbmcpOiBPdXRjb21lPG51bGw+IHtcbiAgcmV0dXJuIHMubGVuZ3RoID09PSAwID8gbmV3IFJlc3VsdChudWxsLCAnJykgOiBuZXcgRXJyKHMgKyAnOiBOb3QgZW5kIG9mIGlucHV0Jylcbn1cblxuZXhwb3J0IGZ1bmN0aW9uIGNvbnN1bWUgKGY6IChzOiBzdHJpbmcpID0+IGJvb2xlYW4pOiBQYXJzZXI8c3RyaW5nPiB7XG4gIHJldHVybiBmdW5jdGlvbiAoczogc3RyaW5nKTogT3V0Y29tZTxzdHJpbmc+IHtcbiAgICBmb3IgKCB2YXIgaSA9IDA7IGkgPCBzLmxlbmd0aDsgaSsrKSB7XG4gICAgICBpZiAoICFmKHNbaV0pICkgYnJlYWtcbiAgICB9XG4gICAgcmV0dXJuIG5ldyBSZXN1bHQocy5zbGljZSgwLCBpKSwgcy5zbGljZShpKSlcbiAgfVxufVxuXG5leHBvcnQgZnVuY3Rpb24gY29uc3VtZTEgKGY6IChzOiBzdHJpbmcpID0+IGJvb2xlYW4pOiBQYXJzZXI8c3RyaW5nPiB7XG4gIHJldHVybiBmbGF0TWFwKHNhdGlzZnkoZiksICAgICAgICAgICB4ID0+XG4gICAgICAgICBmbGF0TWFwKGNvbnN1bWUoZiksIHhzID0+XG4gICAgICAgICB1bml0KHggKyB4cykpKVxufVxuXG5leHBvcnQgZnVuY3Rpb24gY29uc3VtZUF0bGVhc3ROIChuOiBudW1iZXIsIGY6IChzOiBzdHJpbmcpID0+IGJvb2xlYW4pOiBQYXJzZXI8c3RyaW5nPiB7XG4gIHJldHVybiBmdW5jdGlvbiAoczogc3RyaW5nKTogT3V0Y29tZTxzdHJpbmc+IHtcbiAgICBpZiAoIG4gPCAwICkgICAgICAgIHJldHVybiBuZXcgRXJyKCdOZWdhdGl2ZSBjb3VudCcpXG4gICAgaWYgKCBzLmxlbmd0aCA8IG4gKSByZXR1cm4gbmV3IEVycignTm90IGVub3VnaCBjaGFyYWN0ZXJzJylcblxuICAgIGZvciAoIHZhciBpID0gMDsgaSA8IG47IGkrKyApIHtcbiAgICAgIGlmICggIWYoc1tpXSkgKSByZXR1cm4gbmV3IEVycihgJHsgc1tpXSB9IGRpZCBub3Qgc2F0aXNmeWApXG4gICAgfVxuICAgIHJldHVybiBjb25zdW1lKGYpKHMpXG4gIH1cbn1cblxuZXhwb3J0IGZ1bmN0aW9uIG1hbnk8QT4gKHA6IFBhcnNlcjxBPik6IFBhcnNlcjxBW10+IHtcbiAgcmV0dXJuIGZ1bmN0aW9uIChzOiBzdHJpbmcpOiBPdXRjb21lPEFbXT4ge1xuICAgIHZhciByZXN1bHQ6IE91dGNvbWU8QT5cbiAgICB2YXIgb3V0OiBBW10gPSBbXVxuICAgIHZhciByZW1haW5pbmcgPSBzXG5cbiAgICB3aGlsZSAoIHRydWUgKSB7XG4gICAgICByZXN1bHQgPSBwKHJlbWFpbmluZylcbiAgICAgIGlmICggIXJlc3VsdC5zdWNjZXNzICkgYnJlYWtcbiAgICAgIG91dC5wdXNoKHJlc3VsdC52YWwpXG4gICAgICByZW1haW5pbmcgPSByZXN1bHQucmVzdFxuICAgIH1cbiAgICByZXR1cm4gbmV3IFJlc3VsdChvdXQsIHJlbWFpbmluZylcbiAgfVxufVxuXG5leHBvcnQgZnVuY3Rpb24gbWFueTE8QT4gKHA6IFBhcnNlcjxBPik6IFBhcnNlcjxBW10+IHtcbiAgcmV0dXJuIGZsYXRNYXAocCwgICAgICAgIHggPT5cbiAgICAgICAgIGZsYXRNYXAobWFueShwKSwgeHMgPT5cbiAgICAgICAgIHVuaXQoWyB4LCAuLi54cyBdKSkpXG59XG5cbmV4cG9ydCBmdW5jdGlvbiBtYW55VGlsbDxBLCBCPiAocDogUGFyc2VyPEE+LCBlbmQ6IFBhcnNlcjxCPik6IFBhcnNlcjxBW10+IHtcbiAgY29uc3Qgc2NhbjogUGFyc2VyPEFbXT4gPSBvcihcbiAgICBmbGF0TWFwKGVuZCwgXyA9PiB1bml0KFtdIGFzIEFbXSkpLCBcbiAgICBmbGF0TWFwKHAsIHggPT4gZmxhdE1hcChzY2FuLCB4cyA9PiB1bml0KFsgeCBdLmNvbmNhdCh4cykpKSkpXG5cbiAgcmV0dXJuIHNjYW5cbn1cblxuZXhwb3J0IGZ1bmN0aW9uIGF0bGVhc3ROPEE+IChuOiBudW1iZXIsIHA6IFBhcnNlcjxBPik6IFBhcnNlcjxBW10+IHtcbiAgcmV0dXJuIGZsYXRNYXAobWFueShwKSwgXG4gICAgICAgICB4cyA9PiB4cy5sZW5ndGggPj0gbiA/IHVuaXQoeHMpIDogZmFpbGVkKCdOb3QgZW5vdWdoIG1hdGNoZXMnKSBhcyBQYXJzZXI8QVtdPilcbn1cblxuZXhwb3J0IGZ1bmN0aW9uIGJldHdlZW48QSwgQiwgQz4gKHBMZWZ0OiBQYXJzZXI8QT4sIHA6IFBhcnNlcjxCPiwgcFJpZ2h0OiBQYXJzZXI8Qz4pOiBQYXJzZXI8Qj4ge1xuICByZXR1cm4gZmxhdE1hcChkb1RoZW4ocExlZnQsIHApLCBvdXQgPT5cbiAgICAgICAgIGZsYXRNYXAocFJpZ2h0LCAgICAgICAgICAgXyAgID0+IFxuICAgICAgICAgdW5pdChvdXQpKSlcbn1cblxuZXhwb3J0IGZ1bmN0aW9uIGFyb3VuZDxBLCBCLCBDPiAocExlZnQ6IFBhcnNlcjxBPiwgcDogUGFyc2VyPEI+LCBwUmlnaHQ6IFBhcnNlcjxDPik6IFBhcnNlcjxbIEEsIEMgXT4ge1xuICByZXR1cm4gZmxhdE1hcChwTGVmdCwgIGwgPT4gXG4gICAgICAgICBkb1RoZW4ocCwgXG4gICAgICAgICBmbGF0TWFwKHBSaWdodCwgciA9PiBcbiAgICAgICAgIHVuaXQoWyBsLCByIF0gYXMgWyBBLCBDIF0pKSkpXG59XG5cbmV4cG9ydCBmdW5jdGlvbiBzZXBlcmF0ZWRCeTxBLCBCPiAocDogUGFyc2VyPEE+LCBzZXA6IFBhcnNlcjxCPik6IFBhcnNlcjxBW10+IHtcbiAgcmV0dXJuIGZsYXRNYXAocCwgICAgICAgICAgICAgICAgICAgICBmaXJzdCA9PlxuICAgICAgICAgZmxhdE1hcChtYW55MShkb1RoZW4oc2VwLCBwKSksIGlubmVyID0+XG4gICAgICAgICB1bml0KFsgZmlyc3QsIC4uLmlubmVyIF0pKSlcbn1cblxuZXhwb3J0IGZ1bmN0aW9uIGludGVyc3BlcnNpbmc8QSwgQj4gKHA6IFBhcnNlcjxBPiwgc2VwOiBQYXJzZXI8Qj4pOiBQYXJzZXI8QVtdPiB7XG4gIHJldHVybiBmbGF0TWFwKG1hbnkxKGRvVGhlbihzZXAsIHApKSwgeHMgPT5cbiAgICAgICAgIGZsYXRNYXAoc2VwLCAgICAgICAgICAgICAgICAgICAgXyA9PlxuICAgICAgICAgdW5pdCh4cykpKVxufVxuXG5leHBvcnQgZnVuY3Rpb24gb3JEZWZhdWx0PEE+IChwOiBQYXJzZXI8QT4sIGRmbHQ6IEEpOiBQYXJzZXI8QT4ge1xuICByZXR1cm4gb3IocCwgdW5pdChkZmx0KSlcbn1cblxuZXhwb3J0IGZ1bmN0aW9uIG9yPEE+IChwMTogUGFyc2VyPEE+LCBwMjogUGFyc2VyPEE+KTogUGFyc2VyPEE+IHtcbiAgcmV0dXJuIGZ1bmN0aW9uIChzOiBzdHJpbmcpOiBPdXRjb21lPEE+IHtcbiAgICBjb25zdCBsZWZ0ID0gcDEocylcblxuICAgIHJldHVybiBsZWZ0LnN1Y2Nlc3MgPyBsZWZ0IDogcDIocylcbiAgfVxufVxuXG5leHBvcnQgZnVuY3Rpb24gb3B0aW9uYWwgPEE+IChwOiBQYXJzZXI8QT4pOiBQYXJzZXI8QSB8IHVuZGVmaW5lZD4ge1xuICByZXR1cm4gb3JEZWZhdWx0KHAsIHVuZGVmaW5lZClcbn1cblxuZXhwb3J0IGZ1bmN0aW9uIGFueU9mPEE+IChbIGhlYWQsIC4uLnJlc3QgXTogUGFyc2VyPEE+W10pOiBQYXJzZXI8QT4ge1xuICBpZiAoIGhlYWQgPT0gbnVsbCApIHJldHVybiBmYWlsZWQoJ05vbmUgbWF0Y2hlZCcpIGFzIFBhcnNlcjxBPlxuICBlbHNlICAgICAgICAgICAgICAgIHJldHVybiBvcihoZWFkLCBhbnlPZihyZXN0KSkgYXMgUGFyc2VyPEE+XG59XG5cbmV4cG9ydCBmdW5jdGlvbiBjb25jYXQgKFsgaGVhZCwgLi4ucmVzdCBdOiBQYXJzZXI8c3RyaW5nPltdKTogUGFyc2VyPHN0cmluZz4ge1xuICBpZiAoIGhlYWQgPT0gbnVsbCApIHJldHVybiB1bml0KCcnKVxuICBlbHNlICAgICAgICAgICAgICAgIHJldHVybiBmbGF0TWFwKGhlYWQsICAgICAgICAgIG91dCA9PlxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICBmbGF0TWFwKGNvbmNhdChyZXN0KSwgb3V0MiA9PlxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICB1bml0KG91dCArIG91dDIpKSlcbn1cblxuZXhwb3J0IGZ1bmN0aW9uIGluUmFuZ2UgKG1pbjogbnVtYmVyLCBtYXg6IG51bWJlciwgcDogUGFyc2VyPG51bWJlcj4pOiBQYXJzZXI8bnVtYmVyPiB7XG4gIHJldHVybiBmbGF0TWFwKHAsIFxuICAgICAgICAgIHggPT4geCA+PSBtaW4gJiYgeCA8PSBtYXggXG4gICAgICAgICAgICA/IHVuaXQoeCkgXG4gICAgICAgICAgICA6IGZhaWxlZCgnT3V0IG9mIHJhbmdlJykgYXMgUGFyc2VyPG51bWJlcj4pXG59XG5cbmV4cG9ydCBjb25zdCBkYXNoID0gZXhhY3RseSgnLScpXG5leHBvcnQgY29uc3QgZG90ID0gZXhhY3RseSgnLicpXG5leHBvcnQgY29uc3Qgc2xhc2ggPSBleGFjdGx5KCcvJylcbmV4cG9ydCBjb25zdCBiYWNrc2xhc2ggPSBleGFjdGx5KCdcXFxcJylcbmV4cG9ydCBjb25zdCBhbHBoYSA9IHNhdGlzZnkoaXNBbHBoYSlcbmV4cG9ydCBjb25zdCBudW0gPSBzYXRpc2Z5KGlzTnVtYmVyKVxuZXhwb3J0IGNvbnN0IGFscGhhbnVtID0gc2F0aXNmeShuID0+IGlzTnVtYmVyKG4pIHx8IGlzQWxwaGEobikpXG5leHBvcnQgY29uc3QgYWxwaGFzID0gY29uc3VtZShpc0FscGhhKVxuZXhwb3J0IGNvbnN0IG51bXMgPSBjb25zdW1lKGlzTnVtYmVyKVxuZXhwb3J0IGNvbnN0IGFscGhhbnVtcyA9IGNvbnN1bWUobiA9PiBpc051bWJlcihuKSB8fCBpc0FscGhhKG4pKVxuZXhwb3J0IGNvbnN0IHNwYWNlID0gZXhhY3RseSgnICcpIFxuZXhwb3J0IGNvbnN0IHNwYWNlcyA9IGNvbnN1bWUobiA9PiBuID09PSAnICcpXG5leHBvcnQgY29uc3QgbmV3bGluZSA9IGFueU9mKFsgZXhhY3RseSgnXFxuJyksIGV4YWN0bHkoJ1xcZicpLCBtYXRjaCgnXFxyXFxuJyksIGV4YWN0bHkoJ1xccicpIF0pXG5leHBvcnQgY29uc3QgaW50ZWdlciA9IGZtYXAoTnVtYmVyLCBjb25jYXQoWyBcbiAgb3JEZWZhdWx0KGRhc2gsICcnKSwgXG4gIGNvbnN1bWVBdGxlYXN0TigxLCBpc051bWJlcikgXSkpXG5leHBvcnQgY29uc3QgcmVhbCA9IGZtYXAoTnVtYmVyLCBjb25jYXQoWyBcbiAgb3JEZWZhdWx0KGRhc2gsICcnKSwgXG4gIGNvbnN1bWVBdGxlYXN0TigxLCBpc051bWJlciksIFxuICBkb3QsIFxuICBjb25zdW1lQXRsZWFzdE4oMSwgaXNOdW1iZXIpIF0pKVxuIiwiZXhwb3J0IGZ1bmN0aW9uIGlzQWxwaGEgKHM6IHN0cmluZyk6IGJvb2xlYW4ge1xuICBjb25zdCBjYyA9IHMuY2hhckNvZGVBdCgwKVxuXG4gIHJldHVybiAhaXNOYU4oY2MpICYmICgoIGNjID49IDY1ICYmIGNjIDw9IDkwICkgfHwgKCBjYyA+PSA5NyAmJiBjYyA8PSAxMjIgKSlcbn1cblxuZXhwb3J0IGZ1bmN0aW9uIGlzTnVtYmVyIChzOiBzdHJpbmcpOiBib29sZWFuIHtcbiAgY29uc3QgY2MgPSBzLmNoYXJDb2RlQXQoMClcblxuICByZXR1cm4gIWlzTmFOKGNjKSAmJiBjYyA+PSA0OCAmJiBjYyA8PSA1N1xufVxuXG5leHBvcnQgZnVuY3Rpb24gaXMgKHRhcmdldDogc3RyaW5nKTogKHM6IHN0cmluZykgPT4gYm9vbGVhbiB7XG4gIHJldHVybiBmdW5jdGlvbiAoczogc3RyaW5nKTogYm9vbGVhbiB7XG4gICAgaWYgKCBzLmxlbmd0aCA9PT0gMCB8fCB0YXJnZXQubGVuZ3RoID09PSAwICkgcmV0dXJuIGZhbHNlXG4gICAgZWxzZSAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgcmV0dXJuIHRhcmdldFswXSA9PT0gc1swXVxuICB9IFxufVxuIiwiaW1wb3J0IHB2dnNyYyBmcm9tICcuL3NoYWRlcnMvcGVyLXZlcnRleC12c3JjJ1xuaW1wb3J0IHB2ZnNyYyBmcm9tICcuL3NoYWRlcnMvcGVyLXZlcnRleC1mc3JjJ1xuaW1wb3J0IHsgbG9hZFhIUiB9IGZyb20gJy4vTG9hZCdcbmltcG9ydCB7IHBhcnNlT0JKIH0gZnJvbSAnLi9QYXJzZXJzL09CSidcbmltcG9ydCB7IFYzLCBNNCwgaWRlbnRpdHksIHRyYW5zbGF0ZSwgcm90YXRlWCwgcm90YXRlWSwgcm90YXRlWiwgc2NhbGUsIGxvb2tBdCwgcGVyc3BlY3RpdmUgfSBmcm9tICcuL01hdHJpeCdcbmltcG9ydCB7IEF0dHJpYnV0ZXMsIFVuaWZvcm1zLCBDb21tYW5kIH0gZnJvbSAnLi9Db21tYW5kbydcblxuY29uc3QgYyA9IGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKCd0YXJnZXQnKSBhcyBIVE1MQ2FudmFzRWxlbWVudFxuY29uc3QgZ2wgPSBjLmdldENvbnRleHQoJ3dlYmdsJykgYXMgV2ViR0xSZW5kZXJpbmdDb250ZXh0XG5cbi8qXG4gIEF0LWEtZ2xhbmNlIHVuZGVyc3RhbmRpbmcgb2YgR0xURlxuXG4gIGJpbmFyeSBkYXRhIGlzIHN0b3JlZCBpbiA8QnVmZmVyPlxuICAxLU4gPEJ1ZmZlclZpZXc+IHJlZmVyIHRvIHNsaWNlcyBvZiBhIDxCdWZmZXI+IGJ5IGJ5dGVsZW5ndGggKCBubyB0eXBlL3N0cmlkZSBpbmZvIClcbiAgMS1OIDxBY2Nlc3Nvcj4gYWRkcyBpbmZvcm1hdGlvbiB0byA8QnVmZmVyVmlldz4gbGlrZSBzdHJpZGUsIHR5cGUsIG9mZnNldCwgY291bnRcbiAgXG4gIGNyZWF0ZSBzaW5nbGUgYnVmZmVyLCBnZXQgYnVmZmVyVmlld3MgbGlrZSBGbG9hdDMyQXJyYXkgYXMgc2xpY2VzIGludG8gdGhpcyBidWZmZXJcbiAgICAgIFxuKi9cblxubG9hZFhIUigncHlyYW1pZC5vYmonKVxuLnRoZW4ocGFyc2VPQkopXG4udGhlbihnZW9tZXRyeSA9PiB7XG4gIGlmICggIWdlb21ldHJ5LnN1Y2Nlc3MgKSByZXR1cm5cblxuXG4gIGNvbnNvbGUubG9nKGdlb21ldHJ5LnZhbClcbiAgY29uc3Qga2V5cyA9IG5ldyBBcnJheSgyNTYpXG4gIGNvbnN0IGxpZ2h0ID0gVjMoMCwgMiwgMClcbiAgY29uc3QgdmVydGljZXMgPSBuZXcgRmxvYXQzMkFycmF5KGdlb21ldHJ5LnZhbC52ZXJ0aWNlcylcbiAgY29uc3Qgbm9ybWFscyA9IG5ldyBGbG9hdDMyQXJyYXkoZ2VvbWV0cnkudmFsLm5vcm1hbHMpXG4gIGNvbnN0IGNhbSA9IHtcbiAgICBwb3NpdGlvbjogbmV3IEZsb2F0MzJBcnJheShbIDAsIDEsIDUgXSksXG4gICAgdmlldzogTTQoKSxcbiAgICBwcm9qZWN0aW9uOiBNNCgpLFxuICAgIHZmb3Y6IE1hdGguUEkgLyA0LFxuICAgIGFzcGVjdFJhdGlvOiBjLndpZHRoIC8gYy5oZWlnaHQsXG4gICAgbmVhcjogMC4xLFxuICAgIGZhcjogMTAwMDAsXG4gICAgdXA6IFYzKDAsIDEsIDApLFxuICAgIGF0OiBWMygwLCAwLCAwKVxuICB9XG4gIGNvbnN0IHRyYW5zZm9ybSA9IHtcbiAgICBwb3NpdGlvbjogVjMoMCwgMCwgMCksXG4gICAgc2NhbGU6IFYzKDEsIDEsIDEpLFxuICAgIHJvdGF0aW9uOiBWMygwLCAwLCAwKSxcbiAgICBtb2RlbDogTTQoKVxuICB9XG4gIGNvbnN0IGRyYXdQeXJhbWlkID0gQ29tbWFuZC5jcmVhdGVDb21tYW5kKGdsLCB7XG4gICAgdnNyYzogcHZ2c3JjLFxuICAgIGZzcmM6IHB2ZnNyYyxcbiAgICB1bmlmb3Jtczoge1xuICAgICAgdV9saWdodDogbmV3IFVuaWZvcm1zLlUzRihbIDAsIDAsIDAgXSksXG4gICAgICB1X21vZGVsOiBuZXcgVW5pZm9ybXMuVU1hdHJpeDQoTTQoKSksXG4gICAgICB1X3ZpZXc6IG5ldyBVbmlmb3Jtcy5VTWF0cml4NChNNCgpKSxcbiAgICAgIHVfcHJvamVjdGlvbjogbmV3IFVuaWZvcm1zLlVNYXRyaXg0KE00KCkpXG4gICAgfSxcbiAgICBhdHRyaWJ1dGVzOiB7XG4gICAgICBhX2Nvb3JkOiBuZXcgQXR0cmlidXRlcy5GbG9hdHMoMywgdmVydGljZXMpLFxuICAgICAgYV9ub3JtYWw6IG5ldyBBdHRyaWJ1dGVzLkZsb2F0cygzLCBub3JtYWxzKVxuICAgIH1cbiAgfSlcbiAgaWYgKCBkcmF3UHlyYW1pZCBpbnN0YW5jZW9mIEVycm9yICkge1xuICAgIGNvbnNvbGUubG9nKGRyYXdQeXJhbWlkKVxuICB9XG4gIGVsc2Uge1xuICAgIHZhciB0ID0gMFxuICAgIGNvbnN0IHJlbmRlciA9IGZ1bmN0aW9uIHJlbmRlciAoKSB7XG4gICAgICB0KytcblxuICAgICAgaWYgKCBrZXlzWzM3XSApIHRyYW5zZm9ybS5yb3RhdGlvblsxXSAtPSAwLjA1XG4gICAgICBpZiAoIGtleXNbMzldICkgdHJhbnNmb3JtLnJvdGF0aW9uWzFdICs9IDAuMDVcblxuICAgICAgbGlnaHRbMF0gPSBNYXRoLmNvcyh0IC8gMTApICogMlxuICAgICAgbGlnaHRbMl0gPSBNYXRoLnNpbih0IC8gMTApICogMlxuICAgICAgaWRlbnRpdHkodHJhbnNmb3JtLm1vZGVsKVxuICAgICAgdHJhbnNsYXRlKHRyYW5zZm9ybS5tb2RlbCwgdHJhbnNmb3JtLnBvc2l0aW9uKVxuICAgICAgc2NhbGUodHJhbnNmb3JtLm1vZGVsLCB0cmFuc2Zvcm0uc2NhbGUpXG4gICAgICByb3RhdGVYKHRyYW5zZm9ybS5tb2RlbCwgdHJhbnNmb3JtLnJvdGF0aW9uWzBdKVxuICAgICAgcm90YXRlWSh0cmFuc2Zvcm0ubW9kZWwsIHRyYW5zZm9ybS5yb3RhdGlvblsxXSlcbiAgICAgIHJvdGF0ZVoodHJhbnNmb3JtLm1vZGVsLCB0cmFuc2Zvcm0ucm90YXRpb25bMl0pXG4gICAgICBjYW0uYXNwZWN0UmF0aW8gPSBjLndpZHRoIC8gYy5oZWlnaHRcbiAgICAgIGxvb2tBdChjYW0udmlldywgY2FtLnBvc2l0aW9uLCBjYW0uYXQsIGNhbS51cClcbiAgICAgIHBlcnNwZWN0aXZlKGNhbS5wcm9qZWN0aW9uLCBjYW0udmZvdiwgY2FtLmFzcGVjdFJhdGlvLCBjYW0ubmVhciwgY2FtLmZhcilcblxuICAgICAgZ2wuZW5hYmxlKGdsLkNVTExfRkFDRSlcbiAgICAgIGdsLmN1bGxGYWNlKGdsLkJBQ0spXG4gICAgICBnbC52aWV3cG9ydCgwLCAwLCBjLndpZHRoLCBjLmhlaWdodClcbiAgICAgIGdsLmNsZWFyQ29sb3IoMCwgMCwgMCwgMClcbiAgICAgIGdsLmNsZWFyKGdsLkNPTE9SX0JVRkZFUl9CSVQgfCBnbC5ERVBUSF9CVUZGRVJfQklUKVxuXG4gICAgICBDb21tYW5kLnJ1bihkcmF3UHlyYW1pZCwge1xuICAgICAgICB1bmlmb3Jtczoge1xuICAgICAgICAgIHVfbGlnaHQ6IGxpZ2h0LFxuICAgICAgICAgIHVfbW9kZWw6IHRyYW5zZm9ybS5tb2RlbCxcbiAgICAgICAgICB1X3ZpZXc6IGNhbS52aWV3LFxuICAgICAgICAgIHVfcHJvamVjdGlvbjogY2FtLnByb2plY3Rpb24gXG4gICAgICAgIH0sXG4gICAgICAgIGNvdW50OiBnZW9tZXRyeS52YWwudmVydGljZXMubGVuZ3RoIC8gM1xuICAgICAgfSlcbiAgICAgIHJlcXVlc3RBbmltYXRpb25GcmFtZShyZW5kZXIpXG4gICAgfVxuICAgIHJlcXVlc3RBbmltYXRpb25GcmFtZShyZW5kZXIpXG5cbiAgICBkb2N1bWVudC5ib2R5LmFkZEV2ZW50TGlzdGVuZXIoJ2tleWRvd24nLCAoeyBrZXlDb2RlIH0pID0+IGtleXNba2V5Q29kZV0gPSAxKVxuICAgIGRvY3VtZW50LmJvZHkuYWRkRXZlbnRMaXN0ZW5lcigna2V5dXAnLCAoeyBrZXlDb2RlIH0pID0+IGtleXNba2V5Q29kZV0gPSAwKVxuICB9XG59KVxuIiwiZXhwb3J0IGRlZmF1bHRcbmBcbnByZWNpc2lvbiBtZWRpdW1wIGZsb2F0OyBcblxudW5pZm9ybSB2ZWMzIHVfcG9zaXRpb247XG51bmlmb3JtIHZlYzMgdV9zY2FsZTtcbnVuaWZvcm0gdmVjMyB1X3JvdGF0aW9uO1xuXG52YXJ5aW5nIHZlYzQgdl9jb2xvcjtcblxudm9pZCBtYWluICgpIHsgXG4gIGdsX0ZyYWdDb2xvciA9IHZfY29sb3I7IFxufVxuYFxuIiwiZXhwb3J0IGRlZmF1bHRcbmBcbnByZWNpc2lvbiBtZWRpdW1wIGZsb2F0O1xuXG5hdHRyaWJ1dGUgdmVjMyBhX2Nvb3JkOyBcbmF0dHJpYnV0ZSB2ZWMzIGFfbm9ybWFsO1xuXG51bmlmb3JtIHZlYzMgdV9saWdodDtcbnVuaWZvcm0gbWF0NCB1X21vZGVsO1xudW5pZm9ybSBtYXQ0IHVfdmlldztcbnVuaWZvcm0gbWF0NCB1X3Byb2plY3Rpb247XG5cbmNvbnN0IHZlYzQgQ09MT1JfU0NBTEUgPSB2ZWM0KDI1Ni4wLCAyNTYuMCwgMjU2LjAsIDEuMCk7XG5jb25zdCB2ZWM0IHJnYmEgPSB2ZWM0KDAuMCwgMjU1LjAsIDI1NS4wLCAxLjApO1xuY29uc3QgdmVjNCBjb2xvciA9IHJnYmEgLyBDT0xPUl9TQ0FMRTtcblxudmFyeWluZyB2ZWM0IHZfY29sb3I7XG5cbnZvaWQgbWFpbiAoKSB7IFxuICBtYXQ0IE1WUCA9IHVfcHJvamVjdGlvbiAqIHVfdmlldyAqIHVfbW9kZWw7XG4gIG1hdDQgTVYgPSB1X3ZpZXcgKiB1X21vZGVsO1xuICB2ZWMzIE1WVmVydGV4ID0gdmVjMyhNViAqIHZlYzQoYV9jb29yZCwgMS4wKSk7XG4gIHZlYzMgTVZOb3JtYWwgPSB2ZWMzKE1WICogdmVjNChhX25vcm1hbCwgMC4wKSk7XG4gIHZlYzMgbGlnaHRfdmVjdG9yID0gbm9ybWFsaXplKHVfbGlnaHQgLSBNVlZlcnRleCk7XG4gIGZsb2F0IGRpc3RhbmNlID0gbGVuZ3RoKHVfbGlnaHQgLSBNVlZlcnRleCk7XG4gIGZsb2F0IGZhbGxvZmYgPSAwLjA1O1xuICBmbG9hdCBhdHRlbnVhdGlvbiA9IDEuMCAvICgxLjAgKyAoZmFsbG9mZiAqIGRpc3RhbmNlICogZGlzdGFuY2UpKTtcbiAgZmxvYXQgZGlmZnVzZSA9IG1heChkb3QoTVZOb3JtYWwsIGxpZ2h0X3ZlY3RvciksIDAuMSkgKiBhdHRlbnVhdGlvbjtcblxuICB2X2NvbG9yID0gdmVjNChjb2xvclswXSAqIGRpZmZ1c2UsIGNvbG9yWzFdICogZGlmZnVzZSwgY29sb3JbMl0gKiBkaWZmdXNlLCBjb2xvclszXSk7XG4gIGdsX1Bvc2l0aW9uID0gTVZQICogdmVjNChhX2Nvb3JkLCAxLjApO1xufVxuYFxuIl19
