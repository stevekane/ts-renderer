const fs = require('fs')

const F32_BYTE_SIZE = 4

const positions = [ 
  -0.5, -0.5, 0, 
  0.5, -0.5, 0,
  0, 0.5, 0
]
const colors = [
  1, 0, 0, 1,
  0, 1, 0, 1,
  0, 0, 1, 1
]
const ab = new ArrayBuffer((positions.length + colors.length) * F32_BYTE_SIZE)
const pbuf = new Float32Array(ab, 0, positions.length)
const cbuf = new Float32Array(ab, positions.length * F32_BYTE_SIZE, colors.length)
const buffer = new Buffer(ab)

pbuf.set(positions)
cbuf.set(colors)

fs.writeFileSync('public/brick/data.bin', buffer, 'binary')
