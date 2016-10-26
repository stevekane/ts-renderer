import vsrc from './vsrc'
import fsrc from './fsrc'
import { fromSource } from './GL-Program'
import { IRenderable } from './Rendering/core'
import { Triangle } from './Rendering/Geometry'
import { Parser, unit, flatMap, doThen, fmap, satisfy, many, manyStr, match, or, consumeThen } from './Parser'

function isAlpha (s: string): boolean {
  const cc = s.charCodeAt(0)

  return !isNaN(cc) && (( cc >= 65 && cc <= 90 ) || ( cc >= 97 && cc <= 122 ))
}

function isNumber (s: string): boolean {
  const cc = s.charCodeAt(0)

  return !isNaN(cc) && cc >= 48 && cc <= 57
}

const cr = match('\n')
const ncr = satisfy(n => n !== '\n')
const space = satisfy(n => n === ' ' || n === '\n')
const non_space = satisfy(n => n !== ' ' && n !== '\n')
const spaces = manyStr(space)
const non_spaces = manyStr(non_space)
const alpha = satisfy(isAlpha)
const dot = match('.') 
const num = satisfy(isNumber)
const integer = fmap(Number, manyStr(num))
const real =  
  flatMap(manyStr(num), left  => 
  doThen(dot,
  flatMap(manyStr(num), right =>
  unit(Number(left + '.' + right)))))

type V3 = [ number, number, number ]
type V4 = [ number, number, number, number ]

interface IComment  { kind: 'Comment' }
interface IVertex   { kind: 'Vertex',   value: V4 }
interface ITexCoord { kind: 'TexCoord', value: V3 }
interface INormal   { kind: 'Normal',   value: V3 }
interface IFace     { kind: 'Face',     value: V3 }

class Cmnt implements IComment      { kind: 'Comment' = 'Comment' }
class Vert implements IVertex       { kind: 'Vertex' = 'Vertex';      constructor(public value: V4) {} }
class TexCoord implements ITexCoord { kind: 'TexCoord' = 'TexCoord';  constructor(public value: V3) {} }
class Normal implements INormal     { kind: 'Normal' = 'Normal';      constructor(public value: V3) {} }
class Face implements IFace         { kind: 'Face' = 'Face';          constructor(public value: V3) {} }

type OBJ 
  = IComment
  | IVertex 
  | ITexCoord 
  | INormal
  | IFace

const vertex: Parser<OBJ> =
  doThen(match('v'),
  flatMap(consumeThen(spaces, real),                x =>
  flatMap(consumeThen(spaces, real),                y =>
  flatMap(consumeThen(spaces, real),                z =>
  flatMap(consumeThen(spaces, or(real, unit(1.0))), w =>
  unit(new Vert([ x, y, z, w ])))))))

const texCoord: Parser<OBJ> =
  doThen(match('vt'),
  flatMap(consumeThen(spaces, real),                u =>
  flatMap(consumeThen(spaces, real),                v =>
  flatMap(consumeThen(spaces, or(real, unit(1.0))), w =>
  unit(new TexCoord([ u, v, w ]))))))

const normal: Parser<OBJ> =
  doThen(match('vn'),
  flatMap(consumeThen(spaces, real), x =>
  flatMap(consumeThen(spaces, real), y =>
  flatMap(consumeThen(spaces, real), z =>
  unit(new Normal([ x, y, z ]))))))

/*
  Assumes:
    exactly 3 vertices per face ONLY
    vertexes, tex_coords, and normals are already ordered by vertex
    f 1 2 3 is assumed to mean f 1/1/1 2/2/2 3/3/3
*/
const face: Parser<OBJ> = 
  doThen(match('f'), 
  flatMap(consumeThen(spaces, integer), fst =>
  doThen(non_spaces,
  flatMap(consumeThen(spaces, integer), snd =>
  doThen(non_spaces,
  flatMap(consumeThen(spaces, integer), trd =>
  doThen(non_spaces,
  doThen(spaces,
  unit(new Face([ fst, snd, trd ]))))))))))

const comment: Parser<OBJ> = 
  doThen(match('#'), 
  doThen(manyStr(ncr), 
  doThen(cr, unit(new Cmnt))))

const line: Parser<OBJ> = 
  doThen(spaces, 
  or(comment,
  or(vertex,
  or(normal,
  or(face,
  texCoord)))))

const sampleOBJ = 
`# don't parse this at all
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
`
console.log(vertex('v 0.123 0.234 0.345 1.0')) // with w
console.log(vertex('v 0.123 0.234 0.345'))     // without w
console.log(texCoord('vt 0.123 0.234 0.345'))  // with w
console.log(texCoord('vt 0.123 0.234'))        // without w
console.log(normal('vn 0.123 0.234 0.345'))
console.log(face('f 1/1/1 2 3/2/2'))
console.log(many(face)('f 1 2 3\n\nf 4 5 6'))
console.log(comment('# whatever you want is totally ignored here \n NON_COMMENT'))
console.log(line('v 0.1 0.1 0.1'))
console.log(line('# 0.1 0.1 0.1\n'))
console.log(many(line)(sampleOBJ))

function drawRenderable (gl: WebGLRenderingContext, r: IRenderable) {
  const { program, attributes, uniforms, geometry } = r.mesh

  gl.useProgram(program)

  gl.bindBuffer(gl.ARRAY_BUFFER, r.buffers.a_coord)
  gl.bufferData(gl.ARRAY_BUFFER, geometry.vertices, gl.DYNAMIC_DRAW)
  gl.vertexAttribPointer(attributes.a_coord, 3, gl.FLOAT, false, 0, 0)
  gl.enableVertexAttribArray(attributes.a_coord)

  gl.bindBuffer(gl.ARRAY_BUFFER, r.buffers.a_color)
  gl.bufferData(gl.ARRAY_BUFFER, geometry.colors, gl.DYNAMIC_DRAW)
  gl.vertexAttribPointer(attributes.a_color, 4, gl.FLOAT, false, 0, 0)
  gl.enableVertexAttribArray(attributes.a_color)

  gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, r.buffers.indices)
  gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, geometry.indices, gl.STATIC_DRAW)

  gl.uniform1f(uniforms.u_time, now()) 
  gl.uniform3f(uniforms.u_position, r.position[0], r.position[1], r.position[2])
  gl.uniform3f(uniforms.u_scale, r.scale[0], r.scale[1], r.scale[2])
  gl.uniform3f(uniforms.u_rotation, r.rotation[0], r.rotation[1], r.rotation[2])
  gl.drawElements(gl.TRIANGLES, geometry.indices.length, gl.UNSIGNED_SHORT, 0)
}

const now = performance ? performance.now.bind(performance) : Date.now
const c = document.getElementById('target') as HTMLCanvasElement
const gl = c.getContext('webgl') as WebGLRenderingContext
const p = fromSource(gl, vsrc, fsrc)

gl.enable(gl.DEPTH_TEST)
gl.depthFunc(gl.LEQUAL)
if ( p.success ) {
  const entity = {
    position: new Float32Array([ 0, 0, 0 ]),
    scale: new Float32Array([ 1, 1, 1 ]),
    rotation: new Float32Array([ 0, 0, 0 ]),
    mesh: {
      geometry: new Triangle,
      program: p.value,
      uniforms: {
        u_time: gl.getUniformLocation(p.value, 'u_time') as WebGLUniformLocation,
        u_position: gl.getUniformLocation(p.value, 'u_position') as WebGLUniformLocation,
        u_scale: gl.getUniformLocation(p.value, 'u_scale') as WebGLUniformLocation,
        u_rotation: gl.getUniformLocation(p.value, 'u_rotation') as WebGLUniformLocation
      },
      attributes: {
        a_coord: gl.getAttribLocation(p.value, 'a_coord') as number,
        a_color: gl.getAttribLocation(p.value, 'a_color') as number
      }
    },
    buffers: {
      a_coord: gl.createBuffer() as WebGLBuffer,
      a_normal: gl.createBuffer() as WebGLBuffer,
      a_color: gl.createBuffer() as WebGLBuffer,
      indices: gl.createBuffer() as WebGLBuffer
    }
  }

  requestAnimationFrame(function render () {
    const t = now()

    entity.position[0] = Math.sin(t / 1000)
    entity.scale[1] = Math.sin(t / 1000) + 1
    entity.rotation[0] = Math.sin(t / 1000) * Math.PI * 2
    entity.rotation[2] = Math.sin(t / 1000) * Math.PI * 2

    gl.viewport(0, 0, c.width, c.height)
    gl.clearColor(0, 0, 0, 0)
    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT)
    drawRenderable(gl, entity)
    requestAnimationFrame(render)
  })
} else {
  console.log(JSON.stringify(p, null, 2)) 
}
