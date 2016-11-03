export type Mat4 = Float32Array
export type Vec3 = Float32Array
export type Quat = Float32Array

export function Q (x: number, y: number, z: number, w: number): Quat {
  const out = new Float32Array(4)

  out[0] = x
  out[1] = y
  out[2] = z
  out[3] = w
  return out
}

export function M4 (): Mat4 {
  const out = new Float32Array(16)

  return identity(out)
}

export function V3 (x: number, y: number, z: number): Vec3 {
  const out = new Float32Array(3)

  out[0] = x
  out[1] = y
  out[2] = z
  return out
}

export function identity (out: Mat4): Mat4 {
  out[0] = 1
  out[1] = 0
  out[2] = 0
  out[3] = 0
  out[4] = 0
  out[5] = 1
  out[6] = 0
  out[7] = 0
  out[8] = 0
  out[9] = 0
  out[10] = 1
  out[11] = 0
  out[12] = 0
  out[13] = 0
  out[14] = 0
  out[15] = 1
  return out
}

export function translate (out: Mat4, v: Vec3): Mat4 {
  const [ x, y, z ] = v

  out[12] = out[0] * x + out[4] * y + out[8] * z + out[12]
  out[13] = out[1] * x + out[5] * y + out[9] * z + out[13]
  out[14] = out[2] * x + out[6] * y + out[10] * z + out[14]
  out[15] = out[3] * x + out[7] * y + out[11] * z + out[15]
  return out
}

export function rotateX (out: Mat4, rad: number): Mat4 {
    var s = Math.sin(rad),
        c = Math.cos(rad),
        a10 = out[4],
        a11 = out[5],
        a12 = out[6],
        a13 = out[7],
        a20 = out[8],
        a21 = out[9],
        a22 = out[10],
        a23 = out[11]

    out[4] = a10 * c + a20 * s
    out[5] = a11 * c + a21 * s
    out[6] = a12 * c + a22 * s
    out[7] = a13 * c + a23 * s
    out[8] = a20 * c - a10 * s
    out[9] = a21 * c - a11 * s
    out[10] = a22 * c - a12 * s
    out[11] = a23 * c - a13 * s
    return out
}

export function rotateY (out: Mat4, rad: number): Mat4 {
    var s = Math.sin(rad),
        c = Math.cos(rad),
        a00 = out[0],
        a01 = out[1],
        a02 = out[2],
        a03 = out[3],
        a20 = out[8],
        a21 = out[9],
        a22 = out[10],
        a23 = out[11];

    out[0] = a00 * c - a20 * s
    out[1] = a01 * c - a21 * s
    out[2] = a02 * c - a22 * s
    out[3] = a03 * c - a23 * s
    out[8] = a00 * s + a20 * c
    out[9] = a01 * s + a21 * c
    out[10] = a02 * s + a22 * c
    out[11] = a03 * s + a23 * c
    return out
}

export function rotateZ(out: Mat4, rad: number): Mat4 {
    var s = Math.sin(rad),
        c = Math.cos(rad),
        a00 = out[0],
        a01 = out[1],
        a02 = out[2],
        a03 = out[3],
        a10 = out[4],
        a11 = out[5],
        a12 = out[6],
        a13 = out[7]

    out[0] = a00 * c + a10 * s
    out[1] = a01 * c + a11 * s
    out[2] = a02 * c + a12 * s
    out[3] = a03 * c + a13 * s
    out[4] = a10 * c - a00 * s
    out[5] = a11 * c - a01 * s
    out[6] = a12 * c - a02 * s
    out[7] = a13 * c - a03 * s
    return out
}

export function scale (out: Mat4, v: Vec3) {
    var x = v[0], y = v[1], z = v[2]

    out[0] = out[0] * x
    out[1] = out[1] * x
    out[2] = out[2] * x
    out[3] = out[3] * x
    out[4] = out[4] * y
    out[5] = out[5] * y
    out[6] = out[6] * y
    out[7] = out[7] * y
    out[8] = out[8] * z
    out[9] = out[9] * z
    out[10] = out[10] * z
    out[11] = out[11] * z
    out[12] = out[12]
    out[13] = out[13]
    out[14] = out[14]
    out[15] = out[15]
    return out
}

export function fromRotationTranslation (out: Mat4, q: Quat, v: Vec3) {
  var x = q[0], y = q[1], z = q[2], w = q[3],
      x2 = x + x,
      y2 = y + y,
      z2 = z + z,

      xx = x * x2,
      xy = x * y2,
      xz = x * z2,
      yy = y * y2,
      yz = y * z2,
      zz = z * z2,
      wx = w * x2,
      wy = w * y2,
      wz = w * z2

  out[0] = 1 - (yy + zz)
  out[1] = xy + wz
  out[2] = xz - wy
  out[3] = 0
  out[4] = xy - wz
  out[5] = 1 - (xx + zz)
  out[6] = yz + wx
  out[7] = 0
  out[8] = xz + wy
  out[9] = yz - wx
  out[10] = 1 - (xx + yy)
  out[11] = 0
  out[12] = v[0]
  out[13] = v[1]
  out[14] = v[2]
  out[15] = 1
  
  return out
}

export function lookAt (out: Mat4, eye: Vec3, center: Vec3, up: Vec3) {
  var x0: number, 
      x1: number, 
      x2: number, 
      y0: number, 
      y1: number, 
      y2: number, 
      z0: number, 
      z1: number, 
      z2: number, 
      len: number;
  var eyex = eye[0],
      eyey = eye[1],
      eyez = eye[2],
      upx = up[0],
      upy = up[1],
      upz = up[2],
      centerx = center[0],
      centery = center[1],
      centerz = center[2];

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
  } else {
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
  } else {
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
};

export function perspective (out: Mat4, fovy: number, aspect: number, near: number, far: number): Mat4 {
    var f = 1.0 / Math.tan(fovy / 2),
        nf = 1 / (near - far);
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
};

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
